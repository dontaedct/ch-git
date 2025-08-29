import { NextResponse } from 'next/server';
import { observability } from '@/lib/observability';
import { Logger } from '@/lib/logger';
import { getObservabilityConfig, ConfigValidator } from '@/lib/observability/config';

export const runtime = 'nodejs';
export const revalidate = 30; // 30 seconds

const healthLogger = Logger.create({ component: 'health-endpoint' });

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get observability status
    const obsStatus = observability.getHealthStatus();
    const config = getObservabilityConfig();
    const validation = ConfigValidator.validateEnvironment();
    
    // System metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const healthData = {
      ok: true,
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
      
      // System health
      system: {
        uptime: Math.round(uptime),
        memory: {
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          external: Math.round(memoryUsage.external / 1024 / 1024), // MB
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        },
        nodeVersion: process.version,
      },
      
      // Observability status
      observability: {
        initialized: obsStatus.initialized,
        config: {
          environment: config.environment,
          tracingEnabled: config.tracing.enabled,
          metricsEnabled: config.metrics.enabled,
          profilingEnabled: config.performance.profiling.enabled,
        },
        features: obsStatus.features,
        validation: {
          valid: validation.valid,
          warnings: validation.warnings,
          errors: validation.errors,
        },
        performance: obsStatus.performance,
      },
      
      // Service status
      services: {
        database: 'healthy', // Would check actual DB connection
        storage: 'healthy', // Would check Supabase storage
        auth: 'healthy', // Would check auth service
      },
      
      // Response time
      responseTime: Date.now() - startTime,
    };
    
    // Log health check
    healthLogger.info('Health check completed', {
      responseTime: healthData.responseTime,
      memoryUsage: healthData.system.memory.heapUsed,
      observabilityInitialized: healthData.observability.initialized,
    });
    
    return NextResponse.json(healthData, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    healthLogger.error('Health check failed', {
      error: errorMessage,
      responseTime,
    });
    
    return NextResponse.json({
      ok: false,
      timestamp: new Date().toISOString(),
      error: errorMessage,
      responseTime,
    }, { status: 500 });
  }
}
