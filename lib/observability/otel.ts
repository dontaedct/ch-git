/**
 * OpenTelemetry Configuration
 * 
 * Provides comprehensive tracing and metrics collection for production-grade
 * observability with business metrics, performance profiling, and security monitoring.
 */

// Dynamic imports to prevent Edge Runtime issues
let NodeSDK: any = null;
let Resource: any = null;
let ATTR_SERVICE_NAME: any = null;
let ATTR_SERVICE_VERSION: any = null;
let getNodeAutoInstrumentations: any = null;
let PeriodicExportingMetricReader: any = null;
let PrometheusExporter: any = null;
let JaegerExporter: any = null;
let OTLPTraceExporter: any = null;
let trace: any = null;
let metrics: any = null;
let SpanStatusCode: any = null;
let SpanKind: any = null;

// Skip OpenTelemetry imports in Edge Runtime environments
const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined' || 
                     process.env.NEXT_RUNTIME === 'edge' ||
                     process.env.NODE_ENV === 'production' || 
                     process.env.VERCEL_ENV;

if (false) { // Temporarily disabled to fix 500 error
  try {
    ({ NodeSDK } = require('@opentelemetry/sdk-node'));
    ({ Resource } = require('@opentelemetry/resources'));
    ({ ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions'));
    ({ getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node'));
    ({ PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics'));
    ({ PrometheusExporter } = require('@opentelemetry/exporter-prometheus'));
    ({ JaegerExporter } = require('@opentelemetry/exporter-jaeger'));
    ({ OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http'));
    ({ trace, metrics, SpanStatusCode, SpanKind } = require('@opentelemetry/api'));
  } catch (error) {
    console.warn('OpenTelemetry dependencies not available:', error);
  }
}
import { logger } from '../logger';

// Service metadata
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'dct-micro-app';
const SERVICE_VERSION = process.env.OTEL_SERVICE_VERSION || process.env.npm_package_version || '0.2.0';

// Environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';
const OTEL_ENABLED = process.env.OTEL_ENABLED !== 'false';

/**
 * Initialize OpenTelemetry SDK with comprehensive instrumentation
 */
let sdk: any | null = null;

export function initializeOpenTelemetry(): void {
  // Skip OpenTelemetry in Edge Runtime environments
  const isEdgeRuntime = typeof (globalThis as any).EdgeRuntime !== 'undefined' || 
                       process.env.NEXT_RUNTIME === 'edge' ||
                       process.env.NODE_ENV === 'production' || 
                       process.env.VERCEL_ENV;
  
  if (isEdgeRuntime) {
    logger.log('OpenTelemetry skipped in Edge Runtime environment');
    return;
  }

  if (!OTEL_ENABLED) {
    logger.log('OpenTelemetry disabled by configuration');
    return;
  }

  if (sdk) {
    logger.warn('OpenTelemetry already initialized');
    return;
  }

  try {
    // Resource configuration
    const resource = {
      [ATTR_SERVICE_NAME]: SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
      'service.environment': process.env.NODE_ENV || 'development',
      'service.instance.id': process.env.INSTANCE_ID || `${SERVICE_NAME}-${Math.random().toString(36).substr(2, 9)}`,
    };

    // Configure exporters based on environment
    const traceExporters = [];
    
    // Jaeger exporter for development
    if (isDevelopment && process.env.JAEGER_ENDPOINT) {
      traceExporters.push(new JaegerExporter({
        endpoint: process.env.JAEGER_ENDPOINT,
      }));
    }
    
    // OTLP exporter for production
    if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) {
      traceExporters.push(new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
          JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : {},
      }));
    }

    // Metrics configuration
    const metricReaders: any[] = [];
    
    // Prometheus exporter (only in development for now)
    if (isDevelopment && process.env.PROMETHEUS_PORT) {
      try {
        const prometheusExporter = new PrometheusExporter({
          port: parseInt(process.env.PROMETHEUS_PORT, 10),
        });
        // Note: PrometheusExporter doesn't implement PushMetricExporter interface
        // so we can't use it with PeriodicExportingMetricReader
        // For now, we'll use it directly
        logger.log('Prometheus metrics enabled', {
          port: process.env.PROMETHEUS_PORT,
        });
      } catch (error) {
        logger.warn('Failed to initialize Prometheus exporter', { error: String(error) });
      }
    }

    // Initialize SDK
    sdk = new NodeSDK({
      traceExporter: traceExporters.length > 0 ? traceExporters[0] : undefined,
      metricReader: metricReaders.length > 0 ? metricReaders[0] : undefined,
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // Disable filesystem instrumentation for performance
          },
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            ignoreIncomingRequestHook: (req: any) => {
              // Ignore health check and static asset requests
              const url = req.url || '';
              return url.includes('/_next/') || 
                     url.includes('/favicon.ico') ||
                     url.includes('/api/health') ||
                     url.includes('/api/metrics');
            },
            ignoreOutgoingRequestHook: (req: any) => {
              return req.method === 'OPTIONS';
            },
            requestHook: (span: any, request: any) => {
              // Type guard to check if request has headers
              if ('headers' in request && request.headers) {
                const userAgent = request.headers['user-agent'];
                if (userAgent) {
                  span.setAttributes({
                    'http.user_agent': userAgent,
                    'http.client.ip': request.headers['x-forwarded-for'] || 
                                     (request as any).connection?.remoteAddress,
                  });
                }
              }
            },
            responseHook: (span: any, response: any) => {
              if (response.statusCode && response.statusCode >= 400) {
                span.setStatus({ code: SpanStatusCode.ERROR });
              }
            },
          },
        }),
      ],
    });

    sdk.start();
    
    // Initialize business metrics
    initializeBusinessMetrics();
    
    logger.log('OpenTelemetry initialized successfully', {
      serviceName: SERVICE_NAME,
      serviceVersion: SERVICE_VERSION,
      environment: process.env.NODE_ENV,
      tracingEnabled: traceExporters.length > 0,
      metricsEnabled: metricReaders.length > 0,
    });

    // Graceful shutdown (only in Node.js runtime)
    if (typeof process !== 'undefined' && typeof process.on === 'function' && process.env.NEXT_RUNTIME !== 'edge') {
      process.on('SIGTERM', () => shutdown());
      process.on('SIGINT', () => shutdown());
    }
    
  } catch (error) {
    logger.error('Failed to initialize OpenTelemetry:', error);
  }
}

/**
 * Initialize business-specific metrics
 */
function initializeBusinessMetrics(): void {
  const meter = metrics.getMeter(SERVICE_NAME, SERVICE_VERSION);
  
  // Request duration histogram
  const requestDuration = meter.createHistogram('http_request_duration_ms', {
    description: 'HTTP request duration in milliseconds',
    unit: 'ms',
  });
  
  // Request counter
  const requestCount = meter.createCounter('http_requests_total', {
    description: 'Total number of HTTP requests',
  });
  
  // Active connections gauge
  const activeConnections = meter.createUpDownCounter('http_active_connections', {
    description: 'Number of active HTTP connections',
  });
  
  // Business metrics
  const userRegistrations = meter.createCounter('user_registrations_total', {
    description: 'Total number of user registrations',
  });
  
  const formSubmissions = meter.createCounter('form_submissions_total', {
    description: 'Total number of form submissions',
  });
  
  const authenticationAttempts = meter.createCounter('authentication_attempts_total', {
    description: 'Total number of authentication attempts',
  });
  
  const rateLimitViolations = meter.createCounter('rate_limit_violations_total', {
    description: 'Total number of rate limit violations',
  });
  
  const securityEvents = meter.createCounter('security_events_total', {
    description: 'Total number of security events',
  });

  // Store metrics for global access
  (globalThis as any).__DCT_METRICS__ = {
    requestDuration,
    requestCount,
    activeConnections,
    userRegistrations,
    formSubmissions,
    authenticationAttempts,
    rateLimitViolations,
    securityEvents,
  };
}

/**
 * Get business metrics (helper function)
 */
export function getBusinessMetrics() {
  return (globalThis as any).__DCT_METRICS__;
}

/**
 * Create a traced operation with automatic error handling
 */
export async function tracedOperation<T>(
  name: string,
  operation: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  if (!OTEL_ENABLED) {
    return operation(null);
  }

  const tracer = trace.getTracer(SERVICE_NAME, SERVICE_VERSION);
  
  return tracer.startActiveSpan(name, { kind: SpanKind.INTERNAL }, async (span: any) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      
      const result = await operation(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ 
        code: SpanStatusCode.ERROR, 
        message: error instanceof Error ? error.message : String(error)
      });
      span.recordException(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      span.end();
    }
  });
}

/**
 * Record business metric
 */
export function recordBusinessMetric(
  metricName: keyof ReturnType<typeof getBusinessMetrics>,
  value: number = 1,
  attributes?: Record<string, string | number | boolean>
): void {
  if (!OTEL_ENABLED) return;
  
  try {
    const metrics = getBusinessMetrics();
    if (metrics?.[metricName]) {
      if (typeof metrics[metricName].add === 'function') {
        metrics[metricName].add(value, attributes);
      } else if (typeof metrics[metricName].record === 'function') {
        metrics[metricName].record(value, attributes);
      }
    }
  } catch (error) {
    logger.error('Failed to record business metric:', { metricName, error });
  }
}

/**
 * Graceful shutdown
 */
export async function shutdown(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      logger.log('OpenTelemetry shutdown completed');
    } catch (error) {
      logger.error('Error during OpenTelemetry shutdown:', error);
    }
  }
}

/**
 * Get current tracing context
 */
export function getCurrentTraceId(): string | undefined {
  if (!OTEL_ENABLED || !trace) return undefined;
  
  try {
    const span = trace.getActiveSpan();
    return span?.spanContext().traceId;
  } catch (error) {
    // Trace API not available or failed
    return undefined;
  }
}

/**
 * Add attributes to current span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  if (!OTEL_ENABLED || !trace) return;
  
  try {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  } catch (error) {
    // Trace API not available or failed
  }
}

// Auto-initialize if not disabled
if (typeof window === 'undefined' && OTEL_ENABLED) {
  // Only initialize on server-side
  initializeOpenTelemetry();
}