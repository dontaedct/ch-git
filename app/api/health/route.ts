import { NextResponse } from 'next/server';
import { observability } from '@/lib/observability';
import { Logger } from '@/lib/logger';
import { getObservabilityConfig, ConfigValidator } from '@/lib/observability/config';
import { getBusinessMetrics } from '@/lib/observability/otel';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { checkEnvironmentHealth } from '@/lib/env';

export const runtime = 'nodejs';
export const revalidate = 30; // 30 seconds

const healthLogger = Logger.create({ component: 'health-endpoint' });

interface HealthScore {
  overall: number; // 0-100
  database: number;
  storage: number;
  auth: number;
  observability: number;
  performance: number;
  security: number;
}

interface REDMetrics {
  rate: {
    requestsPerSecond: number;
    errorsPerSecond: number;
    slowRequestsPerSecond: number;
  };
  errors: {
    totalErrors: number;
    errorRate: number; // percentage
    errorTypes: Record<string, number>;
    recentErrors: Array<{
      timestamp: string;
      type: string;
      route: string;
      message: string;
    }>;
  };
  duration: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowRequestThreshold: number;
    slowRequestsCount: number;
  };
}

interface ReadinessStatus {
  ready: boolean;
  checks: {
    database: { ready: boolean; message?: string };
    storage: { ready: boolean; message?: string };
    auth: { ready: boolean; message?: string };
    observability: { ready: boolean; message?: string };
    environment: { ready: boolean; message?: string };
  };
  dependencies: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: string;
  }>;
}

/**
 * Calculate comprehensive health score based on multiple factors
 */
function calculateHealthScore(
  envHealth: Record<string, unknown>,
  obsStatus: Record<string, unknown>,
  redMetrics: REDMetrics,
  serviceChecks: Record<string, { ready: boolean; message?: string }>
): HealthScore {
  let overall = 100;
  let database = 100;
  let storage = 100;
  let auth = 100;
  let observability = 100;
  let performance = 100;
  let security = 100;

  // Environment health impact
  if ((envHealth.status as string) === 'critical') {
    overall -= 30;
    observability -= 40;
  } else if ((envHealth.status as string) === 'warning') {
    overall -= 10;
    observability -= 20;
  }

  // RED metrics impact
  if (redMetrics.errors.errorRate > 5) {
    overall -= 20;
    performance -= 30;
  } else if (redMetrics.errors.errorRate > 1) {
    overall -= 10;
    performance -= 15;
  }

  if (redMetrics.duration.averageResponseTime > 2000) {
    overall -= 15;
    performance -= 25;
  } else if (redMetrics.duration.averageResponseTime > 1000) {
    overall -= 8;
    performance -= 15;
  }

  // Service checks impact
  if (!serviceChecks.database.ready) {
    overall -= 25;
    database = 0;
  }
  if (!serviceChecks.storage.ready) {
    overall -= 15;
    storage = 0;
  }
  if (!serviceChecks.auth.ready) {
    overall -= 20;
    auth = 0;
  }

  // Observability impact
  if (!(obsStatus.initialized as boolean)) {
    overall -= 10;
    observability = 0;
  }

  // Security impact (based on rate limiting and security events)
  if (redMetrics.rate.errorsPerSecond > 10) {
    security -= 20;
  }

  return {
    overall: Math.max(0, overall),
    database: Math.max(0, database),
    storage: Math.max(0, storage),
    auth: Math.max(0, auth),
    observability: Math.max(0, observability),
    performance: Math.max(0, performance),
    security: Math.max(0, security),
  };
}

/**
 * Collect RED metrics from observability system
 */
function collectREDMetrics(): REDMetrics {
  const businessMetrics = getBusinessMetrics();
  
  // Calculate rates (requests per second)
  const requestsPerSecond = businessMetrics.requestCount?.rate ?? 0;
  const errorsPerSecond = businessMetrics.errorCount?.rate ?? 0;
  const slowRequestsPerSecond = businessMetrics.slowRequestCount?.rate ?? 0;

  // Calculate error metrics
  const totalErrors = businessMetrics.errorCount?.total ?? 0;
  const totalRequests = businessMetrics.requestCount?.total ?? 1;
  const errorRate = (totalErrors / totalRequests) * 100;

  // Duration metrics
  const averageResponseTime = businessMetrics.requestDuration?.average ?? 0;
  const p95ResponseTime = businessMetrics.requestDuration?.p95 ?? 0;
  const p99ResponseTime = businessMetrics.requestDuration?.p99 ?? 0;
  const slowRequestThreshold = 1000; // 1 second
  const slowRequestsCount = businessMetrics.slowRequestCount?.total ?? 0;

  return {
    rate: {
      requestsPerSecond,
      errorsPerSecond,
      slowRequestsPerSecond,
    },
    errors: {
      totalErrors,
      errorRate,
      errorTypes: businessMetrics.errorTypes ?? {},
      recentErrors: businessMetrics.recentErrors ?? [],
    },
    duration: {
      averageResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      slowRequestThreshold,
      slowRequestsCount,
    },
  };
}

/**
 * Perform service readiness checks
 */
async function performServiceChecks(): Promise<ReadinessStatus> {
  const checks = {
    database: { ready: false, message: '' },
    storage: { ready: false, message: '' },
    auth: { ready: false, message: '' },
    observability: { ready: false, message: '' },
    environment: { ready: false, message: '' },
  };

  const dependencies: Array<{
    name: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: string;
  }> = [];

  // Database check
  try {
    const startTime = Date.now();
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('clients').select('count').limit(1);
    const responseTime = Date.now() - startTime;

    checks.database.ready = !error;
    checks.database.message = error ? error.message : 'Connected';

    dependencies.push({
      name: 'database',
      status: !error ? 'healthy' : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.database.message = error instanceof Error ? error.message : 'Unknown error';
    dependencies.push({
      name: 'database',
      status: 'unhealthy',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    });
  }

  // Storage check (Supabase storage)
  try {
    const startTime = Date.now();
    const supabase = createServiceRoleClient();
    const { error } = await supabase.storage.listBuckets();
    const responseTime = Date.now() - startTime;

    checks.storage.ready = !error;
    checks.storage.message = error ? error.message : 'Accessible';

    dependencies.push({
      name: 'storage',
      status: !error ? 'healthy' : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.storage.message = error instanceof Error ? error.message : 'Unknown error';
    dependencies.push({
      name: 'storage',
      status: 'unhealthy',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    });
  }

  // Auth check
  try {
    const startTime = Date.now();
    const supabase = createServiceRoleClient();
    const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    const responseTime = Date.now() - startTime;

    checks.auth.ready = !error;
    checks.auth.message = error ? error.message : 'Operational';

    dependencies.push({
      name: 'auth',
      status: !error ? 'healthy' : 'unhealthy',
      responseTime,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    checks.auth.message = error instanceof Error ? error.message : 'Unknown error';
    dependencies.push({
      name: 'auth',
      status: 'unhealthy',
      responseTime: 0,
      lastCheck: new Date().toISOString(),
    });
  }

  // Observability check
  const obsStatus = observability.getHealthStatus();
  checks.observability.ready = obsStatus.initialized;
  checks.observability.message = obsStatus.initialized ? 'Initialized' : 'Not initialized';

  dependencies.push({
    name: 'observability',
    status: obsStatus.initialized ? 'healthy' : 'unhealthy',
    responseTime: 0,
    lastCheck: new Date().toISOString(),
  });

  // Environment check
  const envHealth = checkEnvironmentHealth();
  checks.environment.ready = envHealth.status !== 'critical';
  checks.environment.message = envHealth.status === 'critical' ? 'Critical issues detected' : 'Healthy';

  dependencies.push({
    name: 'environment',
    status: envHealth.status === 'critical' ? 'unhealthy' : envHealth.status === 'warning' ? 'degraded' : 'healthy',
    responseTime: 0,
    lastCheck: new Date().toISOString(),
  });

  const ready = Object.values(checks).every(check => check.ready);

  return {
    ready,
    checks,
    dependencies,
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Get observability status
    const obsStatus = observability.getHealthStatus();
    const config = getObservabilityConfig();
    const validation = ConfigValidator.validateEnvironment();
    const envHealth = checkEnvironmentHealth();
    
    // Collect RED metrics
    const redMetrics = collectREDMetrics();
    
    // Perform service readiness checks
    const readinessStatus = await performServiceChecks();
    
    // Calculate health score
    const healthScore = calculateHealthScore(envHealth, obsStatus, redMetrics, readinessStatus.checks);
    
    // System metrics
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    
    const healthData = {
      ok: healthScore.overall >= 70, // Consider healthy if score >= 70
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
      
      // Health scoring
      healthScore,
      
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
      
      // RED metrics
      redMetrics,
      
      // Readiness status
      readiness: readinessStatus,
      
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
      
      // Response time
      responseTime: Date.now() - startTime,
    };
    
    // Log health check
    healthLogger.info('Health check completed', {
      responseTime: healthData.responseTime,
      memoryUsage: healthData.system.memory.heapUsed,
      healthScore: healthData.healthScore.overall,
      readiness: healthData.readiness.ready,
      redMetrics: {
        errorRate: healthData.redMetrics.errors.errorRate,
        avgResponseTime: healthData.redMetrics.duration.averageResponseTime,
      },
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
      healthScore: { overall: 0 },
      readiness: { ready: false, checks: {}, dependencies: [] },
    }, { status: 500 });
  }
}

// Lightweight readiness endpoint for load balancers
export async function HEAD() {
  try {
    const readinessStatus = await performServiceChecks();
    const status = readinessStatus.ready ? 200 : 503;
    
    return new Response(null, { 
      status,
      headers: {
        'X-Readiness-Status': readinessStatus.ready ? 'ready' : 'not_ready',
        'X-Timestamp': new Date().toISOString(),
        'X-Service-Count': readinessStatus.dependencies.length.toString(),
        'X-Healthy-Services': readinessStatus.dependencies.filter(d => d.status === 'healthy').length.toString(),
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
