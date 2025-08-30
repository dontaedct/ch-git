# Observability System

## Overview

This observability system provides comprehensive monitoring, tracing, and logging capabilities with OpenTelemetry integration, structured logging via Pino, business metrics collection, and performance profiling.

## Features

- **OpenTelemetry Integration**: Distributed tracing with Jaeger and OTLP exporters
- **Structured Logging**: Production-grade logging with Pino and sensitive data redaction
- **Business Metrics**: Custom metrics collection with Prometheus export
- **Performance Profiling**: Memory, CPU, and execution time profiling
- **Security Monitoring**: Rate limiting, authentication, and security event tracking
- **Health Monitoring**: System health checks and alerting

## Environment Variables

### Core Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OBSERVABILITY_ENABLED` | `true` | Enable/disable entire observability stack |
| `NODE_ENV` | `development` | Environment mode (development/production/staging/test) |
| `LOG_LEVEL` | `debug` (dev), `info` (prod) | Minimum log level |

### Tracing Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `TRACING_ENABLED` | `true` | Enable OpenTelemetry tracing |
| `OTEL_SERVICE_NAME` | `dct-micro-app` | Service name for tracing |
| `OTEL_SERVICE_VERSION` | `0.2.0` | Service version |
| `TRACING_SAMPLE_RATE` | `1.0` (dev), `0.1` (prod) | Trace sampling rate (0-1) |

### Jaeger Exporter (Development)

| Variable | Default | Description |
|----------|---------|-------------|
| `JAEGER_ENDPOINT` | - | Jaeger collector endpoint |

Example: `JAEGER_ENDPOINT=http://localhost:14268/api/traces`

### OTLP Exporter (Production)

| Variable | Default | Description |
|----------|---------|-------------|
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | - | OTLP traces endpoint |
| `OTEL_EXPORTER_OTLP_HEADERS` | - | JSON string of headers |

Example: `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT=https://api.honeycomb.io/v1/traces`

### Metrics Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `METRICS_ENABLED` | `true` | Enable metrics collection |
| `PROMETHEUS_PORT` | - | Port for Prometheus metrics server |
| `PROMETHEUS_ENDPOINT` | `/metrics` | Prometheus metrics endpoint |
| `BUSINESS_METRICS_ENABLED` | `true` | Enable business metrics |
| `COLLECT_USER_METRICS` | `true` | Collect user interaction metrics |
| `COLLECT_SECURITY_METRICS` | `true` | Collect security event metrics |
| `COLLECT_PERFORMANCE_METRICS` | `true` | Collect performance metrics |

### Logging Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_STRUCTURED` | `true` | Use structured JSON logging |
| `LOG_REDACT_SENSITIVE` | `true` | Redact sensitive data in logs |
| `LOG_INCLUDE_TRACE_ID` | `true` | Include trace ID in log entries |

### Performance Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PROFILING_ENABLED` | `true` | Enable performance profiling |
| `PROFILING_SAMPLE_RATE` | `1.0` (dev), `0.01` (prod) | Profiling sampling rate |
| `PROFILE_MEMORY` | `true` | Enable memory profiling |
| `PROFILE_CPU` | `true` | Enable CPU profiling |
| `MONITORING_INTERVAL` | `30000` | System monitoring interval (ms) |

### Alert Thresholds

| Variable | Default | Description |
|----------|---------|-------------|
| `SLOW_REQUEST_THRESHOLD` | `2000` | Slow request threshold (ms) |
| `HIGH_MEMORY_THRESHOLD` | `512` | High memory usage threshold (MB) |
| `ERROR_RATE_THRESHOLD` | `0.05` | Error rate alert threshold (5%) |

### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_SECURITY_EVENTS` | `true` | Log security events |
| `TRACK_RATE_LIMIT_VIOLATIONS` | `true` | Track rate limit violations |
| `TRACK_AUTH_FAILURES` | `true` | Track authentication failures |
| `SENSITIVE_DATA_MASKING` | `true` | Mask sensitive data in logs |

## Usage

### Basic Setup

```javascript
import { Observing, observability } from '@/lib/observability';

// The observability stack auto-initializes on server-side
// Check initialization status
console.log('Observability ready:', observability.isInitialized());
```

### Request Tracking

```javascript
// In API routes or middleware
const requestTracker = Observing.trackRequest(req.method, req.url);

// When request completes
requestTracker.finish(res.statusCode, {
  userId: req.user?.id,
  authenticated: !!req.user,
});
```

### Business Metrics

```javascript
// User registration
Observing.recordUserRegistration(userId, { source: 'web' });

// Form submissions
Observing.recordFormSubmission('contact', userId, { formVersion: 'v2' });

// File uploads
Observing.recordFileUpload('pdf', fileSize, userId);
```

### Security Events

```javascript
// Rate limit violations
Observing.recordRateLimitViolation(clientIp, '/api/endpoint', {
  violations: 5,
  timeWindow: '1m'
});

// Authentication failures
Observing.recordAuthFailure(clientIp, '/api/auth/login', 'invalid_credentials');
```

### Performance Profiling

```javascript
// Profile any operation
const result = await Observing.profileOperation(
  'user_search',
  async () => {
    return await searchUsers(query);
  }
);

// Profile database queries
const users = await Observing.profileDatabase(
  'find_users',
  () => db.users.findMany({ where: { active: true } })
);

// Profile API endpoints
app.get('/api/users', async (req, res) => {
  const users = await Observing.profileAPI(
    'GET',
    '/api/users',
    async () => {
      return await getUsersService();
    }
  );
  
  res.json(users);
});
```

### Distributed Tracing

```javascript
import { Observing } from '@/lib/observability';

// Trace across service boundaries
const result = await Observing.trace(
  'process_payment',
  async (span) => {
    span?.setAttributes({
      'payment.amount': amount,
      'payment.currency': 'USD',
      'user.id': userId,
    });
    
    const paymentResult = await processPayment(amount, userId);
    
    span?.setAttributes({
      'payment.success': paymentResult.success,
      'payment.transaction_id': paymentResult.transactionId,
    });
    
    return paymentResult;
  },
  { 'service.component': 'payment' }
);
```

### Health Monitoring

```javascript
// System health
Observing.recordSystemHealth();

// Database health
const dbHealthy = await checkDatabaseHealth();
Observing.recordDatabaseHealth(dbHealthy, dbResponseTime);

// External service health
const serviceHealthy = await checkExternalService();
Observing.recordExternalServiceHealth('stripe-api', serviceHealthy, responseTime);
```

## Development Setup

### Jaeger (Local Tracing)

```bash
# Run Jaeger with Docker
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# Set environment variable
export JAEGER_ENDPOINT=http://localhost:14268/api/traces
```

Access Jaeger UI at: http://localhost:16686

### Prometheus (Local Metrics)

```bash
# Set prometheus port
export PROMETHEUS_PORT=9090
```

Access metrics at: http://localhost:9090/metrics

## Production Setup

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

## Monitoring Best Practices

1. **Sampling in Production**: Use low sample rates (1-10%) to minimize performance impact
2. **Sensitive Data**: Never log passwords, tokens, or API keys
3. **Alert Thresholds**: Set appropriate thresholds for your application's SLA
4. **Log Levels**: Use appropriate log levels (ERROR for issues, WARN for concerns, INFO for business events)
5. **Trace Context**: Include relevant business context in spans and metrics

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Reduce sampling rates or disable profiling
2. **Performance Impact**: Lower `TRACING_SAMPLE_RATE` and `PROFILING_SAMPLE_RATE`
3. **Missing Traces**: Check exporter configuration and network connectivity
4. **Log Noise**: Adjust `LOG_LEVEL` and disable debug logging in production

### Health Check Endpoint

The system provides a health check endpoint that includes observability status:

```javascript
// GET /api/health
{
  "observability": {
    "initialized": true,
    "features": {
      "tracing": true,
      "metrics": true,
      "profiling": true
    }
  }
}
```