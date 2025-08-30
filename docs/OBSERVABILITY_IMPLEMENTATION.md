# OpenTelemetry + Pino Logging Implementation

## Overview

This implementation provides comprehensive observability for the DCT Micro Apps platform with OpenTelemetry distributed tracing, structured logging via Pino, business metrics collection, and performance profiling.

## Features Implemented

### ✅ Core Components

- **OpenTelemetry SDK**: Full tracing and metrics collection
- **Pino Logger**: Production-grade structured logging with sensitive data redaction
- **Business Metrics**: Custom metrics for user registrations, form submissions, etc.
- **Performance Profiling**: Memory, CPU, and execution time profiling
- **Security Monitoring**: Rate limiting, authentication, and security event tracking
- **Health Monitoring**: System health checks with observability status

### ✅ API Integration

- **Middleware System**: Automatic request tracking for all API routes
- **Health Endpoint**: Enhanced `/api/health` with observability status
- **Metrics Endpoint**: Prometheus-compatible `/api/metrics` endpoint
- **Example Routes**: Demonstration of observability integration

### ✅ Configuration

- **Environment Variables**: Comprehensive configuration options
- **Feature Toggles**: Enable/disable specific observability features
- **Sample Rates**: Configurable tracing and profiling sample rates
- **Exporters**: Support for Jaeger (dev) and OTLP (prod) tracing

## Architecture

```
lib/observability/
├── index.ts          # Main entry point and convenience functions
├── otel.ts           # OpenTelemetry SDK configuration
├── config.ts         # Environment configuration and validation
├── metrics.ts        # Business metrics collection
├── profiling.ts      # Performance profiling and monitoring
├── middleware.ts     # API route middleware for automatic tracking
└── README.md         # Detailed documentation

lib/logger.ts         # Enhanced Pino logger with OpenTelemetry integration

app/api/
├── health/route.ts   # Enhanced health endpoint with observability status
├── metrics/route.ts  # Prometheus metrics endpoint
└── example/route.ts  # Example API route with observability integration
```

## Usage Examples

### Basic API Route with Observability

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/observability/middleware';
import { Observing } from '@/lib/observability';

// Wrap your handler with observability middleware
export const GET = withObservability(async (request: NextRequest) => {
  // Your API logic here
  const result = await someOperation();
  
  // Record business metrics
  Observing.recordFormSubmission('contact-form', userId);
  
  return NextResponse.json(result);
}, {
  trackPerformance: true,
  trackBusinessMetrics: true,
  sampleRate: 1.0,
});
```

### Manual Tracing and Metrics

```typescript
import { Observing } from '@/lib/observability';

// Trace an operation
const result = await Observing.trace('process_payment', async (span) => {
  span?.setAttributes({
    'payment.amount': amount,
    'payment.currency': 'USD',
  });
  
  return await processPayment(amount);
});

// Record business metrics
Observing.recordUserRegistration(userId, { source: 'web' });
Observing.recordFormSubmission('signup', userId, { formVersion: 'v2' });

// Profile performance
const users = await Observing.profileOperation('user_search', async () => {
  return await searchUsers(query);
});
```

### Security Event Tracking

```typescript
import { Observing } from '@/lib/observability';

// Track security events
Observing.recordRateLimitViolation(clientIp, '/api/endpoint', {
  violations: 5,
  timeWindow: '1m'
});

Observing.recordAuthFailure(clientIp, '/api/auth/login', 'invalid_credentials');
```

## Environment Configuration

### Development Setup

```bash
# Enable full observability in development
OBSERVABILITY_ENABLED=true
TRACING_ENABLED=true
METRICS_ENABLED=true
PROFILING_ENABLED=true

# Jaeger for local tracing
JAEGER_ENDPOINT=http://localhost:14268/api/traces

# Prometheus metrics
PROMETHEUS_PORT=9090

# Full sampling for development
TRACING_SAMPLE_RATE=1.0
PROFILING_SAMPLE_RATE=1.0
```

### Production Setup

```bash
# Enable observability with production-appropriate settings
OBSERVABILITY_ENABLED=true
TRACING_ENABLED=true
METRICS_ENABLED=true
PROFILING_ENABLED=true

# OTLP endpoint for production tracing
OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.honeycomb.io/v1/traces
OTEL_EXPORTER_OTLP_HEADERS={"x-honeycomb-team":"your-api-key"}

# Lower sampling rates for production
TRACING_SAMPLE_RATE=0.1
PROFILING_SAMPLE_RATE=0.01

# Prometheus metrics
PROMETHEUS_PORT=9090
```

## Monitoring Integration

### Health Check Endpoint

```bash
# GET /api/health
{
  "ok": true,
  "timestamp": "2025-08-29T15:30:00.000Z",
  "environment": "development",
  "system": {
    "uptime": 3600,
    "memory": {
      "heapUsed": 128,
      "heapTotal": 256,
      "external": 64,
      "rss": 512
    },
    "nodeVersion": "v18.17.0"
  },
  "observability": {
    "initialized": true,
    "config": {
      "environment": "development",
      "tracingEnabled": true,
      "metricsEnabled": true,
      "profilingEnabled": true
    },
    "features": {
      "tracing": true,
      "metrics": true,
      "profiling": true,
      "businessMetrics": true
    },
    "validation": {
      "valid": true,
      "warnings": [],
      "errors": []
    }
  },
  "responseTime": 45
}
```

### Prometheus Metrics Endpoint

```bash
# GET /api/metrics
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{service="dct-micro-app"} 150 1693326600000

# HELP http_request_duration_ms HTTP request duration in milliseconds
# TYPE http_request_duration_ms histogram
http_request_duration_ms_bucket{le="100"} 120 1693326600000
http_request_duration_ms_bucket{le="500"} 25 1693326600000
http_request_duration_ms_bucket{le="1000"} 5 1693326600000
http_request_duration_ms_bucket{le="+Inf"} 0 1693326600000
http_request_duration_ms_sum 8500 1693326600000
http_request_duration_ms_count 150 1693326600000

# HELP user_registrations_total Total number of user registrations
# TYPE user_registrations_total counter
user_registrations_total{service="dct-micro-app"} 25 1693326600000
```

## Development Tools

### Jaeger Tracing (Local)

```bash
# Run Jaeger with Docker
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# Access Jaeger UI: http://localhost:16686
```

### Prometheus Metrics (Local)

```bash
# Set prometheus port
export PROMETHEUS_PORT=9090

# Access metrics: http://localhost:9090/metrics
```

## Production Integration

### Honeycomb Integration

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.honeycomb.io/v1/traces
export OTEL_EXPORTER_OTLP_HEADERS='{"x-honeycomb-team":"your-api-key"}'
```

### DataDog Integration

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace.agent.datadoghq.com/v0.4/traces
export OTEL_EXPORTER_OTLP_HEADERS='{"DD-API-KEY":"your-api-key"}'
```

### New Relic Integration

```bash
export OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://trace-api.newrelic.com/trace/v1
export OTEL_EXPORTER_OTLP_HEADERS='{"api-key":"your-license-key"}'
```

## Performance Considerations

### Sampling Rates

- **Development**: 100% sampling for full visibility
- **Production**: 1-10% tracing, 0.1-1% profiling to minimize overhead

### Memory Usage

- OpenTelemetry SDK: ~5-10MB baseline
- Pino logger: ~1-2MB baseline
- Profiling: Additional memory based on sample rate

### Performance Impact

- **Tracing**: <5% overhead with 10% sampling
- **Logging**: <1% overhead with structured logging
- **Profiling**: <2% overhead with 1% sampling

## Security Features

### Data Redaction

- Automatic redaction of sensitive fields (passwords, tokens, etc.)
- Configurable redaction patterns
- Trace ID inclusion for correlation

### Security Event Tracking

- Rate limit violations
- Authentication failures
- Suspicious user agents
- Malicious payload detection

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Reduce sampling rates or disable profiling
2. **Performance Impact**: Lower `TRACING_SAMPLE_RATE` and `PROFILING_SAMPLE_RATE`
3. **Missing Traces**: Check exporter configuration and network connectivity
4. **Log Noise**: Adjust `LOG_LEVEL` and disable debug logging in production

### Health Check Commands

```bash
# Check observability status
curl http://localhost:3000/api/health

# Check metrics endpoint
curl http://localhost:3000/api/metrics

# Test example API with observability
curl "http://localhost:3000/api/example?action=register&delay=100"
```

## Next Steps

### Phase 2 Task 11: Health/Readiness endpoints + RED metrics

This task completes the OpenTelemetry + pino logging foundation. The next task will focus on:

- Enhanced health endpoints with dependency checks
- RED (Rate, Error, Duration) metrics implementation
- Health scoring and alerting
- Comprehensive monitoring dashboard

### Integration Opportunities

- **Existing API Routes**: Apply `withObservability` wrapper to all API routes
- **Database Operations**: Add database profiling to Supabase operations
- **External Services**: Add external service health monitoring
- **Business Logic**: Add business metrics to key user flows

## Files Modified

- `lib/observability/` - Complete observability system
- `lib/logger.ts` - Enhanced Pino logger with OpenTelemetry integration
- `app/api/health/route.ts` - Enhanced health endpoint
- `app/api/metrics/route.ts` - Prometheus metrics endpoint
- `app/api/example/route.ts` - Example API route with observability
- `env.example` - Added observability environment variables

## Commit Message

```
feat(obs): OpenTelemetry + pino logging + business metrics + performance profiling

- Complete observability system with OpenTelemetry SDK
- Enhanced Pino logger with trace ID correlation
- Business metrics collection (users, forms, security events)
- Performance profiling with memory and CPU tracking
- API middleware for automatic request tracking
- Health endpoint with observability status
- Prometheus metrics endpoint
- Comprehensive environment configuration
- Example API route demonstrating integration
- Security event tracking and data redaction

Deliverables: OTel init + pino logger + business metrics + profiling
Next: Task 11 - Health/Readiness endpoints + RED metrics
```
