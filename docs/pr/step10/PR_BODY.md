# Step 10: n8n Hardening - Reliability Controls & Circuit Breakers

## Overview

This PR backfills documentation for **Step 10: n8n Hardening** - implementing comprehensive reliability controls, circuit breakers, and hardening measures for n8n workflow automation.

## What This Step Accomplished

### 🔧 **Reliability Controls**
- **Exponential Backoff with Jitter**: Prevents thundering herd problems during service outages
- **Per-Tenant Quotas**: Circuit breaker patterns for tenant isolation and resource protection
- **Dead Letter Queue (DLQ)**: Failed message handling with TTL and automatic cleanup
- **Parametrized Concurrency**: Configurable execution limits per tenant
- **Stripe Replay Protection**: Durable event tracking to prevent duplicate processing

### 🛡️ **Circuit Breaker Implementation**
- **Three-State Pattern**: CLOSED (normal), OPEN (failing), HALF_OPEN (testing recovery)
- **Per-Tenant Isolation**: Independent circuit breakers for each tenant
- **Configurable Thresholds**: 10 failures per 10 minutes triggers circuit breaker
- **Recovery Mechanisms**: 5-minute recovery time before retry attempts
- **Automatic State Management**: Dynamic state transitions based on failure patterns

### 📊 **Monitoring & Alerting**
- **Key Metrics**: Workflow execution rate, circuit breaker state, DLQ size, retry success rate
- **Alerting Rules**: Circuit breaker opens, DLQ size exceeds 100 messages, retry success rate drops below 80%
- **Dashboards**: Tenant overview, workflow performance, error analysis, capacity planning
- **Real-time Monitoring**: Live workflow health and performance tracking

## Files Added/Modified

### n8n Configuration
- `n8n/README.md` - Comprehensive reliability controls documentation
- `n8n/workflows/notify-gap-fill.json` - Sample workflow with reliability controls

### Workflow Examples
- **Notify-10 Gap Fill**: Client notification workflow with reliability controls
- **Weekly Recap Processing**: Progress summary processing with quotas and DLQ
- **Client Onboarding**: Automated onboarding with rate limiting and error handling

## Key Features

### Exponential Backoff with Jitter
```typescript
// Example backoff calculation
const delay = Math.min(
  baseDelay * Math.pow(2, attempt) + Math.random() * jitterFactor * baseDelay,
  maxDelay
);
```

**Benefits:**
- Prevents thundering herd problems
- Reduces server load during outages
- Provides predictable retry patterns

### Circuit Breaker Pattern
```typescript
enum CircuitState {
  CLOSED,    // Normal operation
  OPEN,      // Failing, blocking requests
  HALF_OPEN  // Testing if service recovered
}
```

**Configuration:**
- **Threshold**: 10 failures per 10 minutes
- **Recovery Time**: 5 minutes before retry
- **Per-Tenant**: Isolated circuit breakers

### Dead Letter Queue (DLQ)
```sql
CREATE TABLE n8n_dlq (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  error_message TEXT,
  error_code TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

**Features:**
- Failed messages stored with metadata
- TTL-based automatic cleanup
- Manual retry capabilities
- Error categorization and alerting

### Stripe Replay Protection
```sql
CREATE TABLE stripe_event_ledger (
  tenant_id TEXT PRIMARY KEY,
  last_processed_event_id TEXT NOT NULL,
  last_processed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Implementation:**
- Durable store of last processed `event.id`
- Per-tenant isolation
- Automatic cleanup of old events

## Workflow Reliability Features

### 1. Reliability Wrapper
```javascript
// n8n Reliability Wrapper
const reliabilityContext = {
  tenant_id: tenantId,
  workflow_name: workflowName,
  payload: payload,
  timestamp: new Date().toISOString(),
  reliability_controls: {
    backoff_enabled: true,
    circuit_breaker_enabled: true,
    concurrency_limit_enabled: true,
    dlq_enabled: true
  }
};
```

### 2. Skip Logic
```javascript
// Check if content has changed (skip if no changes)
const hasContentChanges = $input.first().json.has_content_changes !== false;

if (!hasContentChanges) {
  return {
    json: {
      status: 'skipped',
      reason: 'No content changes detected',
      tenant_id: tenantId,
      timestamp: new Date().toISOString()
    }
  };
}
```

### 3. Failure Handling
```javascript
// Handle failures and add to DLQ if needed
const failedNotifications = data.results.filter(r => r.status === 'failed');

if (failedNotifications.length > 0) {
  const dlqEntries = failedNotifications.map(notification => ({
    tenant_id: data.tenant_id,
    workflow_name: data.workflow_name,
    payload: notification,
    error_message: notification.error,
    error_code: 'NOTIFICATION_FAILED',
    retry_count: 0,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  }));
}
```

## Configuration

### Environment Variables
```bash
# n8n Configuration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
N8N_API_KEY=your-api-key

# Reliability Settings
N8N_MAX_RETRIES=3
N8N_BASE_DELAY_MS=1000
N8N_MAX_DELAY_MS=30000
N8N_JITTER_FACTOR=0.1

# Circuit Breaker Settings
N8N_CIRCUIT_BREAKER_THRESHOLD=10
N8N_CIRCUIT_BREAKER_WINDOW_MS=600000  # 10 minutes
N8N_CIRCUIT_BREAKER_RECOVERY_MS=300000  # 5 minutes

# DLQ Settings
N8N_DLQ_TTL_HOURS=24
N8N_DLQ_CLEANUP_INTERVAL_MS=3600000  # 1 hour

# Concurrency Settings
N8N_DEFAULT_CONCURRENCY=5
N8N_MAX_CONCURRENCY=20
```

### Tenant Configuration
```json
{
  "tenant_id": "tenant-123",
  "concurrency_limit": 10,
  "circuit_breaker_threshold": 15,
  "retry_policy": {
    "max_retries": 5,
    "base_delay_ms": 2000,
    "max_delay_ms": 60000
  }
}
```

## Monitoring and Alerting

### Key Metrics
1. **Workflow Execution Rate**: Requests per minute per tenant
2. **Circuit Breaker State**: Open/Closed/Half-Open status
3. **DLQ Size**: Number of failed messages
4. **Retry Success Rate**: Percentage of successful retries
5. **Average Response Time**: End-to-end workflow execution time

### Alerting Rules
- Circuit breaker opens for any tenant
- DLQ size exceeds 100 messages
- Retry success rate drops below 80%
- Average response time exceeds 30 seconds

### Dashboards
- **Tenant Overview**: Per-tenant reliability metrics
- **Workflow Performance**: Execution rates and success rates
- **Error Analysis**: Error categorization and trends
- **Capacity Planning**: Concurrency usage and limits

## Best Practices

### 1. Workflow Design
- **Idempotent Operations**: All workflows should be idempotent
- **Graceful Degradation**: Handle partial failures gracefully
- **Resource Limits**: Set appropriate concurrency limits
- **Timeout Handling**: Configure reasonable timeouts

### 2. Error Handling
- **Categorize Errors**: Distinguish between retryable and non-retryable errors
- **Logging**: Comprehensive logging for debugging
- **Monitoring**: Real-time monitoring of workflow health
- **Alerting**: Proactive alerting on failures

### 3. Performance Optimization
- **Batch Processing**: Process multiple items together when possible
- **Caching**: Cache frequently accessed data
- **Connection Pooling**: Reuse database connections
- **Async Processing**: Use async patterns for I/O operations

### 4. Security
- **Authentication**: Secure webhook endpoints
- **Authorization**: Tenant-based access control
- **Data Encryption**: Encrypt sensitive data in transit and at rest
- **Audit Logging**: Log all workflow executions

## Troubleshooting

### Common Issues
1. **Circuit Breaker Stuck Open**
   - Check if underlying service is healthy
   - Verify error rates and thresholds
   - Consider manual reset if needed

2. **High DLQ Volume**
   - Investigate root cause of failures
   - Check for upstream service issues
   - Review error patterns and categories

3. **Performance Degradation**
   - Monitor concurrency limits
   - Check for resource constraints
   - Review workflow complexity

4. **Stripe Replay Issues**
   - Verify event ID tracking
   - Check for clock synchronization issues
   - Review event processing logic

### Debug Commands
```bash
# Check circuit breaker status
curl -X GET /api/n8n/circuit-breaker/status

# View DLQ contents
curl -X GET /api/n8n/dlq?tenant_id=tenant-123

# Reset circuit breaker
curl -X POST /api/n8n/circuit-breaker/reset?tenant_id=tenant-123

# Retry DLQ message
curl -X POST /api/n8n/dlq/retry?message_id=msg-123
```

## Security Benefits

- **Resource Protection**: Circuit breakers prevent resource exhaustion
- **Tenant Isolation**: Per-tenant quotas prevent cross-tenant interference
- **Failure Containment**: DLQ prevents failed messages from blocking workflows
- **Replay Protection**: Stripe event tracking prevents duplicate processing
- **Audit Trail**: Comprehensive logging for security monitoring

## Validation

- ✅ All reliability controls implemented
- ✅ Circuit breaker pattern functional
- ✅ DLQ system operational
- ✅ Stripe replay protection active
- ✅ Monitoring and alerting configured
- ✅ Documentation complete
- ✅ Workflow examples provided

## Impact

This step establishes robust n8n workflow automation with:
- **High Availability**: Circuit breakers prevent cascade failures
- **Resource Efficiency**: Concurrency limits and quotas optimize resource usage
- **Error Recovery**: DLQ and retry mechanisms handle failures gracefully
- **Data Integrity**: Replay protection prevents duplicate processing
- **Operational Visibility**: Comprehensive monitoring and alerting

## Next Steps

With n8n hardening complete, the application now has:
- Reliable workflow automation
- Circuit breaker protection
- Dead letter queue handling
- Stripe replay protection
- Comprehensive monitoring

This foundation enables confident automation with enterprise-grade reliability and observability.
