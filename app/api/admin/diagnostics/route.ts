import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/guard';
import { checkEnvironmentHealth, getAllVariableStatus, getValidationWarnings } from '@/lib/env';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Performance benchmarking utilities
async function benchmarkDatabase() {
  const start = Date.now();
  try {
    const supabase = await createServerSupabase();
    const { data: healthCheck, error } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    const duration = Date.now() - start;
    
    return {
      status: error ? 'error' : 'healthy',
      duration,
      error: error?.message,
      records: healthCheck?.length ?? 0
    };
  } catch (error) {
    return {
      status: 'error',
      duration: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function benchmarkMemory() {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024 * 100) / 100, // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024 * 100) / 100,
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024 * 100) / 100,
      external: Math.round(usage.external / 1024 / 1024 * 100) / 100
    };
  }
  return { message: 'Memory usage not available in this environment' };
}

async function benchmarkSystem() {
  const start = Date.now();
  
  // Simple CPU-bound operation for benchmarking
  let sum = 0;
  for (let i = 0; i < 100000; i++) {
    sum += Math.sqrt(i);
  }
  
  const computeDuration = Date.now() - start;
  
  return {
    computeTime: computeDuration,
    result: Math.round(sum),
    timestamp: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    // Require admin permissions
    await requirePermission('canManageSettings');
    
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') ?? 'summary';
    
    const startTime = Date.now();
    
    // Core diagnostics data
    const envHealth = checkEnvironmentHealth();
    const validationWarnings = getValidationWarnings();
    
    // Basic system info
    const systemInfo = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime ? Math.round(process.uptime()) : 0,
      environment: process.env.NODE_ENV ?? 'unknown',
      vercelEnv: process.env.VERCEL_ENV ?? 'local'
    };
    
    const diagnosticsData: Record<string, unknown> = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      system: systemInfo,
      environment: {
        health: envHealth,
        warnings: validationWarnings
      }
    };
    
    // Include detailed data based on mode
    if (mode === 'detailed' || mode === 'full') {
      // Add environment variable status (safely)
      // Type assertion needed for dynamic property addition
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (diagnosticsData.environment as any).variables = getAllVariableStatus();
      
      // Add benchmarks
      const [dbBench, memBench, sysBench] = await Promise.all([
        benchmarkDatabase(),
        benchmarkMemory(),
        benchmarkSystem()
      ]);
      
      diagnosticsData.benchmarks = {
        database: dbBench,
        memory: memBench,
        system: sysBench
      };
    }
    
    if (mode === 'full') {
      // Add request timing
      diagnosticsData.performance = {
        processingTime: Date.now() - startTime,
        requestUrl: request.url,
        method: request.method,
        headers: {
          userAgent: request.headers.get('user-agent'),
          contentType: request.headers.get('content-type')
        }
      };
    }
    
    // Determine overall status
    if (envHealth.status === 'critical') {
      diagnosticsData.status = 'critical';
    } else if (envHealth.status === 'warning') {
      diagnosticsData.status = 'warning';
    }
    
    return NextResponse.json(diagnosticsData, { status: 200 });
    
  } catch (err) {
    console.error('Error in diagnostics endpoint:', err);
    
    if (err instanceof Error) {
      if (err.message.includes('Insufficient permissions')) {
        return NextResponse.json(
          { error: 'Forbidden', message: 'Admin access required' },
          { status: 403 }
        );
      }
      if (err.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint - lighter version for monitoring
export async function HEAD() {
  try {
    const envHealth = checkEnvironmentHealth();
    const status = envHealth.status === 'critical' ? 503 : 200;
    
    return new Response(null, { 
      status,
      headers: {
        'X-Health-Status': envHealth.status,
        'X-Timestamp': new Date().toISOString()
      }
    });
  } catch {
    return new Response(null, { 
      status: 500,
      headers: {
        'X-Health-Status': 'error',
        'X-Timestamp': new Date().toISOString()
      }
    });
  }
}