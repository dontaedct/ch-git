# n8n Reliability Controls

This directory contains n8n workflow configurations and reliability controls for the OSS Hero application.

## Overview

n8n workflows are configured with comprehensive reliability controls including:

- **Exponential Backoff with Jitter**: Prevents thundering herd problems
- **Per-Tenant Quotas**: Circuit breaker patterns for tenant isolation
- **Dead Letter Queue (DLQ)**: Failed message handling with TTL
- **Parametrized Concurrency**: Configurable execution limits per tenant
- **Stripe Replay Protection**: Durable event tracking to prevent duplicates

## Workflow Types

### 1. Notify-10 Gap Fill
- **Purpose**: Sends notifications to clients with gaps in their progress
- **Concurrency**: Configurable per tenant (default: 5 concurrent executions)
- **Skip Logic**: Automatically skips when no content changes detected
- **Retry Policy**: Exponential backoff with jitter (max 3 retries)

### 2. Weekly Recap Processing
- **Purpose**: Processes weekly progress summaries
- **Quotas**: 10 failures per 10 minutes triggers circuit breaker
- **DLQ**: Failed messages stored for 24 hours with cleanup
- **Replay Protection**: Stripe event ID tracking per tenant

### 3. Client Onboarding
- **Purpose**: Automated client onboarding workflows
- **Rate Limiting**: 5 executions per minute per tenant
- **Error Handling**: Comprehensive error categorization and recovery

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

Each tenant can have custom reliability settings:

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

## Reliability Features

### 1. Exponential Backoff with Jitter

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

### 2. Circuit Breaker Pattern

```typescript
// Circuit breaker states
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

### 3. Dead Letter Queue (DLQ)

**Features:**
- Failed messages stored with metadata
- TTL-based automatic cleanup
- Manual retry capabilities
- Error categorization and alerting

**Schema:**
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

### 4. Stripe Replay Protection

**Implementation:**
- Durable store of last processed `event.id`
- Per-tenant isolation
- Automatic cleanup of old events

**Schema:**
```sql
CREATE TABLE stripe_event_ledger (
  tenant_id TEXT PRIMARY KEY,
  last_processed_event_id TEXT NOT NULL,
  last_processed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Workflow Examples

### Basic Workflow with Reliability Controls

```json
{
  "name": "Notify-10 Gap Fill",
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "notify-gap-fill",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Reliability Wrapper",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Reliability controls implementation"
      }
    },
    {
      "name": "Process Notification",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// Business logic"
      }
    }
  ]
}
```

### Circuit Breaker Implementation

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state = CircuitState.CLOSED;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.recoveryTime) {
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = CircuitState.OPEN;
    }
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

## Migration Guide

### From Basic to Reliable Workflows

1. **Add Reliability Wrapper**: Wrap existing workflows with reliability controls
2. **Configure Circuit Breakers**: Set appropriate thresholds and recovery times
3. **Implement DLQ**: Add dead letter queue for failed messages
4. **Add Monitoring**: Set up metrics and alerting
5. **Test Failure Scenarios**: Verify reliability controls work correctly

### Configuration Updates

1. **Environment Variables**: Add new reliability configuration
2. **Database Schema**: Run migrations for DLQ and event ledger tables
3. **Workflow Updates**: Update existing workflows with reliability controls
4. **Monitoring Setup**: Configure dashboards and alerts

## Related Documentation

- [Step 10 Implementation Guide](../docs/hardening/STEP10_N8N.md)
- [Webhook Security](../docs/hardening/STEP4_WEBHOOKS.md)
- [Guardian System](../docs/hardening/STEP6_GUARDIAN_THIN.md)
- [Change Journal](../docs/CHANGE_JOURNAL.md)
