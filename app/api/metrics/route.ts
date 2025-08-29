/**
 * Metrics Endpoint for Prometheus
 * 
 * Exposes OpenTelemetry metrics in Prometheus format for monitoring
 * and alerting systems.
 */

import { NextResponse } from 'next/server';
import { getBusinessMetrics, getCurrentTraceId } from '@/lib/observability/otel';
import { Logger } from '@/lib/logger';
import { getObservabilityConfig } from '@/lib/observability/config';

export const runtime = 'nodejs';
export const revalidate = 15; // 15 seconds

const metricsLogger = Logger.create({ component: 'metrics-endpoint' });

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
    
    // Build Prometheus metrics
    const metrics = buildPrometheusMetrics(otelMetrics);
    
    // Add system metrics
    const systemMetrics = buildSystemMetrics();
    
    const responseTime = Date.now() - startTime;
    
    // Log metrics request
    metricsLogger.debug('Metrics request completed', {
      responseTime,
      metricsCount: metrics.split('\n').length,
      traceId: getCurrentTraceId(),
    });
    
    return new NextResponse(metrics + '\n' + systemMetrics, {
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
function buildPrometheusMetrics(otelMetrics: any): string {
  if (!otelMetrics) {
    return '# No OpenTelemetry metrics available\n';
  }

  const lines: string[] = [];
  const timestamp = Date.now();

  // HTTP request metrics
  if (otelMetrics.requestCount) {
    lines.push(`# HELP http_requests_total Total number of HTTP requests`);
    lines.push(`# TYPE http_requests_total counter`);
    lines.push(`http_requests_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

  if (otelMetrics.requestDuration) {
    lines.push(`# HELP http_request_duration_ms HTTP request duration in milliseconds`);
    lines.push(`# TYPE http_request_duration_ms histogram`);
    lines.push(`http_request_duration_ms_bucket{le="100"} 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="500"} 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="1000"} 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="2000"} 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_bucket{le="+Inf"} 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_sum 0 ${timestamp}`);
    lines.push(`http_request_duration_ms_count 0 ${timestamp}`);
  }

  // Business metrics
  if (otelMetrics.userRegistrations) {
    lines.push(`# HELP user_registrations_total Total number of user registrations`);
    lines.push(`# TYPE user_registrations_total counter`);
    lines.push(`user_registrations_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

  if (otelMetrics.formSubmissions) {
    lines.push(`# HELP form_submissions_total Total number of form submissions`);
    lines.push(`# TYPE form_submissions_total counter`);
    lines.push(`form_submissions_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

  if (otelMetrics.authenticationAttempts) {
    lines.push(`# HELP authentication_attempts_total Total number of authentication attempts`);
    lines.push(`# TYPE authentication_attempts_total counter`);
    lines.push(`authentication_attempts_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

  if (otelMetrics.rateLimitViolations) {
    lines.push(`# HELP rate_limit_violations_total Total number of rate limit violations`);
    lines.push(`# TYPE rate_limit_violations_total counter`);
    lines.push(`rate_limit_violations_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

  if (otelMetrics.securityEvents) {
    lines.push(`# HELP security_events_total Total number of security events`);
    lines.push(`# TYPE security_events_total counter`);
    lines.push(`security_events_total{service="dct-micro-app"} 0 ${timestamp}`);
  }

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
