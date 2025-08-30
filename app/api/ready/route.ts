/**
 * Readiness Endpoint for Load Balancers & Monitoring
 * 
 * Lightweight endpoint designed for load balancers, Kubernetes probes,
 * and monitoring systems to check if the application is ready to serve traffic.
 * 
 * This endpoint performs minimal checks to ensure the application can:
 * - Accept HTTP requests
 * - Connect to critical dependencies
 * - Serve basic functionality
 */

import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { checkEnvironmentHealth } from '@/lib/env';
import { observability } from '@/lib/observability';

export const runtime = 'nodejs';
export const revalidate = 15; // 15 seconds for faster response

const readinessLogger = Logger.create({ component: 'readiness-endpoint' });

interface ReadinessCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  message: string;
  critical: boolean;
}

/**
 * Perform critical readiness checks
 */
async function performReadinessChecks(): Promise<{
  ready: boolean;
  checks: ReadinessCheck[];
  overallStatus: 'ready' | 'degraded' | 'not_ready';
}> {
  const checks: ReadinessCheck[] = [];

  // 1. Environment health check (critical)
  const envStartTime = Date.now();
  const envHealth = checkEnvironmentHealth();
  const envResponseTime = Date.now() - envStartTime;
  
  checks.push({
    name: 'environment',
    status: envHealth.status === 'critical' ? 'unhealthy' : envHealth.status === 'warning' ? 'degraded' : 'healthy',
    responseTime: envResponseTime,
    message: envHealth.status === 'critical' ? 'Critical environment issues' : 'Environment healthy',
    critical: true,
  });

  // 2. Database connectivity check (critical)
  const dbStartTime = Date.now();
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('clients').select('id').limit(1);
    const dbResponseTime = Date.now() - dbStartTime;
    
    checks.push({
      name: 'database',
      status: !error ? 'healthy' : 'unhealthy',
      responseTime: dbResponseTime,
      message: !error ? 'Database connected' : `Database error: ${error.message}`,
      critical: true,
    });
  } catch (error) {
    checks.push({
      name: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - dbStartTime,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: true,
    });
  }

  // 3. Observability check (non-critical)
  const obsStartTime = Date.now();
  const obsStatus = observability.getHealthStatus();
  const obsResponseTime = Date.now() - obsStartTime;
  
  checks.push({
    name: 'observability',
    status: obsStatus.initialized ? 'healthy' : 'degraded',
    responseTime: obsResponseTime,
    message: obsStatus.initialized ? 'Observability initialized' : 'Observability not initialized',
    critical: false,
  });

  // 4. Storage check (non-critical)
  const storageStartTime = Date.now();
  try {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.storage.listBuckets();
    const storageResponseTime = Date.now() - storageStartTime;
    
    checks.push({
      name: 'storage',
      status: !error ? 'healthy' : 'degraded',
      responseTime: storageResponseTime,
      message: !error ? 'Storage accessible' : `Storage error: ${error.message}`,
      critical: false,
    });
  } catch (error) {
    checks.push({
      name: 'storage',
      status: 'degraded',
      responseTime: Date.now() - storageStartTime,
      message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      critical: false,
    });
  }

  // Determine overall status
  const criticalChecks = checks.filter(check => check.critical);
  const criticalFailures = criticalChecks.filter(check => check.status === 'unhealthy');
  const degradedChecks = checks.filter(check => check.status === 'degraded');

  let overallStatus: 'ready' | 'degraded' | 'not_ready';
  if (criticalFailures.length > 0) {
    overallStatus = 'not_ready';
  } else if (degradedChecks.length > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'ready';
  }

  const ready = overallStatus === 'ready' || overallStatus === 'degraded';

  return {
    ready,
    checks,
    overallStatus,
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const readinessResult = await performReadinessChecks();
    const responseTime = Date.now() - startTime;

    // Log readiness check
    readinessLogger.info('Readiness check completed', {
      responseTime,
      overallStatus: readinessResult.overallStatus,
      criticalChecks: readinessResult.checks.filter(c => c.critical).length,
      healthyChecks: readinessResult.checks.filter(c => c.status === 'healthy').length,
    });

    const status = readinessResult.ready ? 200 : 503;

    return NextResponse.json({
      ready: readinessResult.ready,
      status: readinessResult.overallStatus,
      timestamp: new Date().toISOString(),
      responseTime,
      checks: readinessResult.checks,
      version: process.env.npm_package_version ?? '0.2.0',
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
    }, { 
      status,
      headers: {
        'X-Readiness-Status': readinessResult.overallStatus,
        'X-Response-Time': responseTime.toString(),
        'X-Check-Count': readinessResult.checks.length.toString(),
        'X-Critical-Checks': readinessResult.checks.filter(c => c.critical).length.toString(),
        'X-Healthy-Checks': readinessResult.checks.filter(c => c.status === 'healthy').length.toString(),
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;

    readinessLogger.error('Readiness check failed', {
      error: errorMessage,
      responseTime,
    });

    return NextResponse.json({
      ready: false,
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: errorMessage,
      responseTime,
    }, { 
      status: 500,
      headers: {
        'X-Readiness-Status': 'error',
        'X-Response-Time': responseTime.toString(),
      }
    });
  }
}

// Lightweight HEAD method for load balancers
export async function HEAD() {
  try {
    const readinessResult = await performReadinessChecks();
    const status = readinessResult.ready ? 200 : 503;
    
    return new Response(null, { 
      status,
      headers: {
        'X-Readiness-Status': readinessResult.overallStatus,
        'X-Timestamp': new Date().toISOString(),
        'X-Check-Count': readinessResult.checks.length.toString(),
        'X-Critical-Checks': readinessResult.checks.filter(c => c.critical).length.toString(),
        'X-Healthy-Checks': readinessResult.checks.filter(c => c.status === 'healthy').length.toString(),
      }
    });
  } catch {
    return new Response(null, { 
      status: 500,
      headers: {
        'X-Readiness-Status': 'error',
        'X-Timestamp': new Date().toISOString(),
      }
    });
  }
}
