/**
 * Metrics Endpoint for Prometheus
 * 
 * Exposes OpenTelemetry metrics in Prometheus format for monitoring
 * and alerting systems with comprehensive RED metrics support.
 * 
 * RED Metrics:
 * - Rate: Requests per second, errors per second
 * - Errors: Error rate, error types, recent errors
 * - Duration: Response times (avg, p95, p99), slow request tracking
 */

import { NextResponse } from 'next/server';
import { getBusinessMetrics, getCurrentTraceId } from '@/lib/observability/otel';
import { Logger } from '@/lib/logger';
import { getObservabilityConfig } from '@/lib/observability/config';


export const runtime = 'nodejs';
export const revalidate = 15; // 15 seconds

const metricsLogger = Logger.create({ component: 'metrics-endpoint' });

interface REDMetrics {
  rate: {
    requestsPerSecond: number;
    errorsPerSecond: number;
    slowRequestsPerSecond: number;
    authAttemptsPerSecond: number;
    securityEventsPerSecond: number;
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
    httpErrorCodes: Record<string, number>;
  };
  duration: {
    averageResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowRequestThreshold: number;
    slowRequestsCount: number;
    slowRequestsPercentage: number;
  };
}

/**
 * Collect comprehensive RED metrics
 */
function collectREDMetrics(): REDMetrics {
  const businessMetrics = getBusinessMetrics();
  
  // Rate metrics
  const requestsPerSecond = businessMetrics.requestCount?.rate ?? 0;
  const errorsPerSecond = businessMetrics.errorCount?.rate ?? 0;
  const slowRequestsPerSecond = businessMetrics.slowRequestCount?.rate ?? 0;
  const authAttemptsPerSecond = businessMetrics.authAttempts?.rate ?? 0;
  const securityEventsPerSecond = businessMetrics.securityEvents?.rate ?? 0;

  // Error metrics
  const totalErrors = businessMetrics.errorCount?.total ?? 0;
  const totalRequests = businessMetrics.requestCount?.total ?? 1;
  const errorRate = (totalErrors / totalRequests) * 100;

  // Duration metrics
  const averageResponseTime = businessMetrics.requestDuration?.average ?? 0;
  const p50ResponseTime = businessMetrics.requestDuration?.p50 ?? 0;
  const p95ResponseTime = businessMetrics.requestDuration?.p95 ?? 0;
  const p99ResponseTime = businessMetrics.requestDuration?.p99 ?? 0;
  const slowRequestThreshold = 1000; // 1 second
  const slowRequestsCount = businessMetrics.slowRequestCount?.total ?? 0;
  const slowRequestsPercentage = totalRequests > 0 ? (slowRequestsCount / totalRequests) * 100 : 0;

  return {
    rate: {
      requestsPerSecond,
      errorsPerSecond,
      slowRequestsPerSecond,
      authAttemptsPerSecond,
      securityEventsPerSecond,
    },
    errors: {
      totalErrors,
      errorRate,
      errorTypes: businessMetrics.errorTypes || {},
      recentErrors: businessMetrics.recentErrors || [],
      httpErrorCodes: businessMetrics.httpErrorCodes || {},
    },
    duration: {
      averageResponseTime,
      p50ResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      slowRequestThreshold,
      slowRequestsCount,
      slowRequestsPercentage,
    },
  };
}

export async function GET() {
  const startTime = Date.now();
  
  try {
    const config = getObservabilityConfig();
    
    // Check if metrics are enabled
    if (!config.metrics.enabled) {
      return NextResponse.json({
        error: 'Metrics collection is disabled',
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }

    // Get OpenTelemetry metrics
    const otelMetrics = getBusinessMetrics();
    
    // Collect RED metrics
    const redMetrics = collectREDMetrics();
    
    // Build Prometheus metrics
    const metrics = buildPrometheusMetrics(otelMetrics, redMetrics);
    
    // Add system metrics
    const systemMetrics = buildSystemMetrics();
    
    // Add RED metrics
    const redPrometheusMetrics = buildREDPrometheusMetrics(redMetrics);
    
    const responseTime = Date.now() - startTime;
    
    // Log metrics request
    metricsLogger.debug('Metrics request completed', {
      responseTime,
      metricsCount: metrics.split('\n').length,
      redMetricsCount: redPrometheusMetrics.split('\n').length,
      traceId: getCurrentTraceId(),
      redMetrics: {
        errorRate: redMetrics.errors.errorRate,
        avgResponseTime: redMetrics.duration.averageResponseTime,
        requestsPerSecond: redMetrics.rate.requestsPerSecond,
      },
    });
    
    return new NextResponse(metrics + '\n' + systemMetrics + '\n' + redPrometheusMetrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const responseTime = Date.now() - startTime;
    
    metricsLogger.error('Metrics request failed', {
      error: errorMessage,
      responseTime,
    });
    
    return NextResponse.json({
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Build Prometheus metrics from OpenTelemetry metrics
 */
function buildPrometheusMetrics(otelMetrics: Record<string, unknown>, _redMetrics: REDMetrics): string {
  if (!otelMetrics) {
    return '# No OpenTelemetry metrics available\n';
  }

  const lines: string[] = [];
  const timestamp = Date.now();

  // HTTP request metrics
  if (otelMetrics.requestCount) {
    lines.push(`# HELP http_requests_total Total number of HTTP requests`);
    lines.push(`# TYPE http_requests_total counter`);
    lines.push(`http_requests_total{service="dct-micro-app"} ${(otelMetrics.requestCount as any)?.total ?? 0} ${timestamp}`);
  }

  if (otelMetrics.requestDuration) {
    lines.push(`# HELP http_request_duration_ms HTTP request duration in milliseconds`);
    lines.push(`# TYPE http_request_duration_ms histogram`);
    lines.push(`http_request_duration_ms_bucket{le="100"} ${(otelMetrics.requestDuration as any)?.buckets?.[100] ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="500"} ${(otelMetrics.requestDuration as any)?.buckets?.[500] ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="1000"} ${(otelMetrics.requestDuration as any)?.buckets?.[1000] ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="2000"} ${(otelMetrics.requestDuration as any)?.buckets?.[2000] ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="+Inf"} ${(otelMetrics.requestDuration as any)?.buckets?.['+Inf'] ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_sum ${(otelMetrics.requestDuration as any)?.sum ?? 0} ${timestamp}`);
    lines.push(`http_request_duration_ms_count ${(otelMetrics.requestDuration as any)?.count ?? 0} ${timestamp}`);
  }

  // Business metrics
  if (otelMetrics.userRegistrations) {
    lines.push(`# HELP user_registrations_total Total number of user registrations`);
    lines.push(`# TYPE user_registrations_total counter`);
    lines.push(`user_registrations_total{service="dct-micro-app"} ${(otelMetrics.userRegistrations as any)?.total ?? 0} ${timestamp}`);
  }

  if (otelMetrics.formSubmissions) {
    lines.push(`# HELP form_submissions_total Total number of form submissions`);
    lines.push(`# TYPE form_submissions_total counter`);
    lines.push(`form_submissions_total{service="dct-micro-app"} ${(otelMetrics.formSubmissions as any)?.total ?? 0} ${timestamp}`);
  }

  if (otelMetrics.authenticationAttempts) {
    lines.push(`# HELP authentication_attempts_total Total number of authentication attempts`);
    lines.push(`# TYPE authentication_attempts_total counter`);
    lines.push(`authentication_attempts_total{service="dct-micro-app"} ${(otelMetrics.authenticationAttempts as any)?.total ?? 0} ${timestamp}`);
  }

  if (otelMetrics.rateLimitViolations) {
    lines.push(`# HELP rate_limit_violations_total Total number of rate limit violations`);
    lines.push(`# TYPE rate_limit_violations_total counter`);
    lines.push(`rate_limit_violations_total{service="dct-micro-app"} ${(otelMetrics.rateLimitViolations as any)?.total ?? 0} ${timestamp}`);
  }

  if (otelMetrics.securityEvents) {
    lines.push(`# HELP security_events_total Total number of security events`);
    lines.push(`# TYPE security_events_total counter`);
    lines.push(`security_events_total{service="dct-micro-app"} ${(otelMetrics.securityEvents as any)?.total ?? 0} ${timestamp}`);
  }

  return lines.join('\n') + '\n';
}

/**
 * Build RED metrics in Prometheus format
 */
function buildREDPrometheusMetrics(redMetrics: REDMetrics): string {
  const lines: string[] = [];
  const timestamp = Date.now();

  // Rate metrics
  lines.push(`# HELP red_requests_per_second Requests per second`);
  lines.push(`# TYPE red_requests_per_second gauge`);
  lines.push(`red_requests_per_second{service="dct-micro-app"} ${redMetrics.rate.requestsPerSecond} ${timestamp}`);

  lines.push(`# HELP red_errors_per_second Errors per second`);
  lines.push(`# TYPE red_errors_per_second gauge`);
  lines.push(`red_errors_per_second{service="dct-micro-app"} ${redMetrics.rate.errorsPerSecond} ${timestamp}`);

  lines.push(`# HELP red_slow_requests_per_second Slow requests per second`);
  lines.push(`# TYPE red_slow_requests_per_second gauge`);
  lines.push(`red_slow_requests_per_second{service="dct-micro-app"} ${redMetrics.rate.slowRequestsPerSecond} ${timestamp}`);

  // Error metrics
  lines.push(`# HELP red_error_rate_percentage Error rate as percentage`);
  lines.push(`# TYPE red_error_rate_percentage gauge`);
  lines.push(`red_error_rate_percentage{service="dct-micro-app"} ${redMetrics.errors.errorRate} ${timestamp}`);

  lines.push(`# HELP red_total_errors Total number of errors`);
  lines.push(`# TYPE red_total_errors counter`);
  lines.push(`red_total_errors{service="dct-micro-app"} ${redMetrics.errors.totalErrors} ${timestamp}`);

  // Duration metrics
  lines.push(`# HELP red_response_time_avg_ms Average response time in milliseconds`);
  lines.push(`# TYPE red_response_time_avg_ms gauge`);
  lines.push(`red_response_time_avg_ms{service="dct-micro-app"} ${redMetrics.duration.averageResponseTime} ${timestamp}`);

  lines.push(`# HELP red_response_time_p50_ms 50th percentile response time in milliseconds`);
  lines.push(`# TYPE red_response_time_p50_ms gauge`);
  lines.push(`red_response_time_p50_ms{service="dct-micro-app"} ${redMetrics.duration.p50ResponseTime} ${timestamp}`);

  lines.push(`# HELP red_response_time_p95_ms 95th percentile response time in milliseconds`);
  lines.push(`# TYPE red_response_time_p95_ms gauge`);
  lines.push(`red_response_time_p95_ms{service="dct-micro-app"} ${redMetrics.duration.p95ResponseTime} ${timestamp}`);

  lines.push(`# HELP red_response_time_p99_ms 99th percentile response time in milliseconds`);
  lines.push(`# TYPE red_response_time_p99_ms gauge`);
  lines.push(`red_response_time_p99_ms{service="dct-micro-app"} ${redMetrics.duration.p99ResponseTime} ${timestamp}`);

  lines.push(`# HELP red_slow_requests_count Total number of slow requests`);
  lines.push(`# TYPE red_slow_requests_count counter`);
  lines.push(`red_slow_requests_count{service="dct-micro-app"} ${redMetrics.duration.slowRequestsCount} ${timestamp}`);

  lines.push(`# HELP red_slow_requests_percentage Percentage of slow requests`);
  lines.push(`# TYPE red_slow_requests_percentage gauge`);
  lines.push(`red_slow_requests_percentage{service="dct-micro-app"} ${redMetrics.duration.slowRequestsPercentage} ${timestamp}`);

  // Error type breakdown
  Object.entries(redMetrics.errors.errorTypes).forEach(([errorType, count]) => {
    lines.push(`# HELP red_error_type_count Error count by type`);
    lines.push(`# TYPE red_error_type_count counter`);
    lines.push(`red_error_type_count{service="dct-micro-app",error_type="${errorType}"} ${count} ${timestamp}`);
  });

  // HTTP error code breakdown
  Object.entries(redMetrics.errors.httpErrorCodes).forEach(([statusCode, count]) => {
    lines.push(`# HELP red_http_error_count HTTP error count by status code`);
    lines.push(`# TYPE red_http_error_count counter`);
    lines.push(`red_http_error_count{service="dct-micro-app",status_code="${statusCode}"} ${count} ${timestamp}`);
  });

  return lines.join('\n') + '\n';
}

/**
 * Build system metrics
 */
function buildSystemMetrics(): string {
  const memory = process.memoryUsage();
  const uptime = process.uptime();
  const timestamp = Date.now();

  return [
    `# HELP nodejs_memory_heap_used_bytes Process heap used from nodejs in bytes`,
    `# TYPE nodejs_memory_heap_used_bytes gauge`,
    `nodejs_memory_heap_used_bytes ${memory.heapUsed} ${timestamp}`,
    '',
    `# HELP nodejs_memory_heap_total_bytes Process heap total from nodejs in bytes`,
    `# TYPE nodejs_memory_heap_total_bytes gauge`,
    `nodejs_memory_heap_total_bytes ${memory.heapTotal} ${timestamp}`,
    '',
    `# HELP nodejs_memory_external_bytes Node.js external memory in bytes`,
    `# TYPE nodejs_memory_external_bytes gauge`,
    `nodejs_memory_external_bytes ${memory.external} ${timestamp}`,
    '',
    `# HELP nodejs_memory_rss_bytes Node.js resident set size in bytes`,
    `# TYPE nodejs_memory_rss_bytes gauge`,
    `nodejs_memory_rss_bytes ${memory.rss} ${timestamp}`,
    '',
    `# HELP nodejs_process_uptime_seconds Node.js process uptime in seconds`,
    `# TYPE nodejs_process_uptime_seconds gauge`,
    `nodejs_process_uptime_seconds ${uptime} ${timestamp}`,
    '',
    `# HELP nodejs_version_info Node.js version info`,
    `# TYPE nodejs_version_info gauge`,
    `nodejs_version_info{version="${process.version}"} 1 ${timestamp}`,
  ].join('\n');
}
