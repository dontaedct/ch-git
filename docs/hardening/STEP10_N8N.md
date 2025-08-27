# Step 10: n8n Reliability Controls

**Date:** 2025-08-25  
**Branch:** `hardening/step10-n8n-reliability-20250825`  
**Status:** ✅ Implemented  
**Previous:** Step 9 - Critical Test Suites  
**Next:** Step 11 - Secrets/Bundle-Leak Guard  

## Overview

This step implements comprehensive reliability controls for n8n workflows, providing enterprise-grade resilience for automated processes. The implementation includes exponential backoff with jitter, per-tenant circuit breakers, dead letter queues, parametrized concurrency limits, and Stripe replay protection.

## Reliability Features

### 1. Exponential Backoff with Jitter

**Purpose:** Prevents thundering herd problems and reduces server load during outages.

**Implementation:**
- **Base Delay:** 1000ms (configurable per tenant)
- **Max Delay:** 30000ms (30 seconds)
- **Max Retries:** 3 attempts (configurable)
- **Jitter Factor:** 0.1 (10% randomization)

**Formula:**
```typescript
delay = min(baseDelay * 2^attempt + random(0, jitterFactor * baseDelay), maxDelay)
```

**Benefits:**
- Prevents synchronized retry storms
- Reduces server load during outages
- Provides predictable retry patterns
- Configurable per tenant

### 2. Per-Tenant Circuit Breakers

**Purpose:** Isolates failing tenants and prevents cascade failures.

**Configuration:**
- **Threshold:** 10 failures per 10 minutes (configurable)
- **Recovery Time:** 5 minutes before retry
- **States:** CLOSED → OPEN → HALF_OPEN → CLOSED

**Circuit Breaker States:**
- **CLOSED:** Normal operation, requests pass through
- **OPEN:** Failing, all requests blocked
- **HALF_OPEN:** Testing if service recovered

**Per-Tenant Isolation:**
- Each tenant has independent circuit breaker
- Failure in one tenant doesn't affect others
- Configurable thresholds per tenant

### 3. Dead Letter Queue (DLQ) with TTL

**Purpose:** Handles failed messages with automatic cleanup and retry capabilities.

**Features:**
- **TTL:** 24 hours (configurable)
- **Automatic Cleanup:** Hourly cleanup of expired messages
- **Retry Support:** Manual and automatic retry capabilities
- **Error Categorization:** Structured error tracking

**DLQ Schema:**
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

### 4. Parametrized Concurrency Limits

**Purpose:** Prevents resource exhaustion and ensures fair resource allocation.

**Configuration:**
- **Default Limit:** 5 concurrent executions per tenant
- **Tenant-Specific:** Configurable limits per tenant
- **Global Maximum:** 20 concurrent executions (safety limit)

**Concurrency Control:**
- Acquire/release pattern for execution slots
- Real-time utilization tracking
- Automatic cleanup of expired slots

### 5. Stripe Replay Protection

**Purpose:** Prevents duplicate processing of Stripe webhook events.

**Implementation:**
- **Durable Store:** Last processed `event.id` per tenant
- **Automatic Cleanup:** Old events cleaned up automatically
- **Per-Tenant Isolation:** Each tenant tracks independently

**Stripe Event Ledger:**
```sql
CREATE TABLE stripe_event_ledger (
  tenant_id TEXT PRIMARY KEY,
  last_processed_event_id TEXT NOT NULL,
  last_processed_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Details

### Core Files

```
lib/n8n/
└── reliability.ts          # Main reliability controller

n8n/
├── README.md              # Comprehensive documentation
└── workflows/
    └── notify-gap-fill.json # Example workflow with reliability controls

app/api/n8n/reliability/
├── status/route.ts        # Status and statistics API
├── circuit-breaker/
│   └── reset/route.ts     # Circuit breaker reset API
├── dlq/route.ts           # Dead letter queue management
└── stripe-replay/route.ts # Stripe replay protection API

supabase/migrations/
└── 20250825_n8n_reliability.sql # Database schema
```

### Database Schema

**Tables Created:**
1. `n8n_dlq` - Dead letter queue for failed messages
2. `stripe_event_ledger` - Stripe event replay protection
3. `n8n_circuit_breaker_state` - Circuit breaker state tracking
4. `n8n_concurrency_limits` - Concurrency limit tracking
5. `n8n_tenant_config` - Tenant-specific configurations

**Functions Created:**
1. `cleanup_expired_n8n_dlq()` - Cleanup expired DLQ messages
2. `get_n8n_dlq_stats()` - DLQ statistics
3. `reset_circuit_breaker()` - Reset circuit breaker for tenant
4. `get_circuit_breaker_stats()` - Circuit breaker statistics
5. `get_concurrency_stats()` - Concurrency utilization statistics

**Views Created:**
1. `n8n_dlq_view` - Readable DLQ messages with expiry info
2. `n8n_circuit_breaker_view` - Circuit breaker status with descriptions
3. `n8n_concurrency_view` - Concurrency utilization with status

### API Endpoints

#### 1. Reliability Status
```
GET /api/n8n/reliability/status?tenant_id=tenant-123
```
Returns comprehensive reliability statistics including circuit breaker states, concurrency utilization, and DLQ statistics.

#### 2. Circuit Breaker Reset
```
POST /api/n8n/reliability/circuit-breaker/reset
{
  "tenant_id": "tenant-123",
  "reason": "manual_recovery"
}
```
Manually resets circuit breaker for specified tenant.

#### 3. Dead Letter Queue Management
```
GET /api/n8n/reliability/dlq?tenant_id=tenant-123&limit=100
POST /api/n8n/reliability/dlq { "message_id": "msg-123", "action": "retry" }
DELETE /api/n8n/reliability/dlq?message_id=msg-123
```
Manages DLQ messages including listing, retrying, and deletion.

#### 4. Stripe Replay Protection
```
GET /api/n8n/reliability/stripe-replay?tenant_id=tenant-123&event_id=evt_123
POST /api/n8n/reliability/stripe-replay { "tenant_id": "tenant-123", "event_id": "evt_123" }
DELETE /api/n8n/reliability/stripe-replay?tenant_id=tenant-123
```
Manages Stripe event replay protection including checking, updating, and clearing.

## Workflow Examples

### Notify-10 Gap Fill Workflow

**Purpose:** Sends notifications to clients with gaps in their progress.

**Reliability Features:**
- **Skip Logic:** Automatically skips when no content changes
- **Concurrency Control:** Configurable per tenant (default: 5)
- **Error Handling:** Failed notifications added to DLQ
- **Retry Logic:** Exponential backoff with jitter

**Workflow Steps:**
1. **Webhook Trigger** - Receives tenant and client data
2. **Reliability Wrapper** - Implements reliability controls
3. **Skip Check** - Skips execution if no content changes
4. **Gap Analysis** - Identifies clients with 10+ day gaps
5. **Send Notifications** - Sends notifications with retry logic
6. **Handle Failures** - Adds failed notifications to DLQ
7. **Response** - Returns execution results

### Weekly Recap Processing

**Purpose:** Processes weekly progress summaries with high reliability.

**Reliability Features:**
- **Circuit Breaker:** 10 failures per 10 minutes triggers breaker
- **DLQ Integration:** Failed messages stored for 24 hours
- **Stripe Replay Protection:** Prevents duplicate event processing
- **Concurrency Limits:** Prevents resource exhaustion

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

## Monitoring and Alerting

### Key Metrics

1. **Workflow Execution Rate:** Requests per minute per tenant
2. **Circuit Breaker State:** Open/Closed/Half-Open status
3. **DLQ Size:** Number of failed messages
4. **Retry Success Rate:** Percentage of successful retries
5. **Average Response Time:** End-to-end workflow execution time
6. **Concurrency Utilization:** Active vs. maximum concurrent executions

### Alerting Rules

- **Circuit Breaker Opens:** Alert when any tenant's circuit breaker opens
- **High DLQ Volume:** Alert when DLQ size exceeds 100 messages
- **Low Retry Success Rate:** Alert when retry success rate drops below 80%
- **High Response Time:** Alert when average response time exceeds 30 seconds
- **Concurrency Exhaustion:** Alert when concurrency utilization exceeds 90%

### Dashboards

1. **Tenant Overview:** Per-tenant reliability metrics
2. **Workflow Performance:** Execution rates and success rates
3. **Error Analysis:** Error categorization and trends
4. **Capacity Planning:** Concurrency usage and limits
5. **Circuit Breaker Status:** Real-time circuit breaker states

## Testing Strategy

### Unit Tests

- **Backoff Calculation:** Verify exponential backoff with jitter
- **Circuit Breaker Logic:** Test state transitions and thresholds
- **DLQ Operations:** Test message storage, retrieval, and cleanup
- **Concurrency Limits:** Test acquire/release patterns
- **Stripe Replay Protection:** Test event tracking and deduplication

### Integration Tests

- **End-to-End Workflows:** Test complete workflow execution
- **Failure Scenarios:** Test circuit breaker activation and recovery
- **DLQ Integration:** Test failed message handling and retry
- **Concurrency Control:** Test concurrent execution limits
- **Stripe Integration:** Test webhook replay protection

### Load Tests

- **High Volume:** Test with high message volumes
- **Concurrency Limits:** Test concurrency limit enforcement
- **Circuit Breaker:** Test circuit breaker under load
- **DLQ Performance:** Test DLQ performance under load

## Security Considerations

### Data Protection

- **Tenant Isolation:** All data isolated by tenant ID
- **RLS Policies:** Row-level security for all tables
- **Service Role Access:** Limited service role permissions
- **Audit Logging:** Comprehensive audit trail

### Access Control

- **API Authentication:** Secure API endpoints
- **Tenant Authorization:** Tenant-based access control
- **Admin Functions:** Restricted admin operations
- **Rate Limiting:** API rate limiting protection

### Data Encryption

- **In Transit:** HTTPS for all API communications
- **At Rest:** Database encryption for sensitive data
- **Secrets Management:** Secure environment variable handling
- **Key Rotation:** Regular key rotation procedures

## Performance Considerations

### Optimization Strategies

- **Connection Pooling:** Reuse database connections
- **Caching:** Cache frequently accessed data
- **Batch Processing:** Process multiple items together
- **Async Operations:** Use async patterns for I/O

### Resource Management

- **Memory Usage:** Efficient in-memory data structures
- **Database Connections:** Connection pool management
- **Cleanup Operations:** Regular cleanup of expired data
- **Monitoring:** Real-time resource monitoring

### Scalability

- **Horizontal Scaling:** Support for multiple instances
- **Load Balancing:** Distribute load across instances
- **Database Scaling:** Support for read replicas
- **Caching Layer:** Redis for distributed caching

## Troubleshooting

### Common Issues

1. **Circuit Breaker Stuck Open**
   - **Cause:** Underlying service still failing
   - **Solution:** Check service health, consider manual reset
   - **Prevention:** Monitor error rates and thresholds

2. **High DLQ Volume**
   - **Cause:** Systematic failures in workflows
   - **Solution:** Investigate root cause, review error patterns
   - **Prevention:** Improve error handling and retry logic

3. **Performance Degradation**
   - **Cause:** Resource constraints or inefficient workflows
   - **Solution:** Review concurrency limits and workflow complexity
   - **Prevention:** Regular performance monitoring and optimization

4. **Stripe Replay Issues**
   - **Cause:** Clock synchronization or event processing logic
   - **Solution:** Verify event ID tracking and processing logic
   - **Prevention:** Robust event processing and monitoring

### Debug Commands

```bash
# Check circuit breaker status
curl -X GET /api/n8n/reliability/status

# View DLQ contents
curl -X GET /api/n8n/reliability/dlq?tenant_id=tenant-123

# Reset circuit breaker
curl -X POST /api/n8n/reliability/circuit-breaker/reset \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "tenant-123", "reason": "manual_recovery"}'

# Retry DLQ message
curl -X POST /api/n8n/reliability/dlq \
  -H "Content-Type: application/json" \
  -d '{"message_id": "msg-123", "action": "retry"}'

# Check Stripe replay protection
curl -X GET /api/n8n/reliability/stripe-replay?tenant_id=tenant-123&event_id=evt_123
```

### Monitoring Commands

```bash
# Get DLQ statistics
curl -X GET /api/n8n/reliability/status | jq '.reliability.dlq'

# Get circuit breaker statistics
curl -X GET /api/n8n/reliability/status | jq '.reliability.circuit_breakers'

# Get concurrency statistics
curl -X GET /api/n8n/reliability/status | jq '.reliability.concurrency'
```

## Migration Guide

### From Basic to Reliable Workflows

1. **Add Reliability Wrapper**
   - Wrap existing workflows with reliability controls
   - Configure tenant-specific settings
   - Test reliability features

2. **Configure Circuit Breakers**
   - Set appropriate thresholds and recovery times
   - Monitor circuit breaker behavior
   - Adjust thresholds based on usage patterns

3. **Implement DLQ**
   - Add dead letter queue for failed messages
   - Set up cleanup procedures
   - Configure retry policies

4. **Add Monitoring**
   - Set up metrics and alerting
   - Create dashboards for visibility
   - Configure automated responses

5. **Test Failure Scenarios**
   - Test circuit breaker activation
   - Test DLQ message handling
   - Test recovery procedures

### Configuration Updates

1. **Environment Variables**
   - Add new reliability configuration
   - Update existing n8n configurations
   - Test configuration changes

2. **Database Schema**
   - Run migrations for new tables
   - Verify RLS policies
   - Test database functions

3. **Workflow Updates**
   - Update existing workflows with reliability controls
   - Test workflow execution
   - Monitor performance impact

4. **Monitoring Setup**
   - Configure dashboards and alerts
   - Set up automated responses
   - Test monitoring systems

## Best Practices

### Workflow Design

1. **Idempotent Operations**
   - All workflows should be idempotent
   - Handle duplicate executions gracefully
   - Use unique identifiers for operations

2. **Graceful Degradation**
   - Handle partial failures gracefully
   - Provide fallback mechanisms
   - Maintain service availability

3. **Resource Limits**
   - Set appropriate concurrency limits
   - Monitor resource usage
   - Implement backpressure mechanisms

4. **Timeout Handling**
   - Configure reasonable timeouts
   - Handle timeout scenarios
   - Implement retry logic for timeouts

### Error Handling

1. **Categorize Errors**
   - Distinguish between retryable and non-retryable errors
   - Implement appropriate retry strategies
   - Log errors with sufficient context

2. **Logging**
   - Comprehensive logging for debugging
   - Structured log formats
   - Log aggregation and analysis

3. **Monitoring**
   - Real-time monitoring of workflow health
   - Proactive alerting on failures
   - Performance metrics tracking

4. **Alerting**
   - Set up alerts for critical failures
   - Configure escalation procedures
   - Test alerting systems

### Performance Optimization

1. **Batch Processing**
   - Process multiple items together when possible
   - Reduce API call overhead
   - Optimize database operations

2. **Caching**
   - Cache frequently accessed data
   - Implement cache invalidation strategies
   - Monitor cache performance

3. **Connection Pooling**
   - Reuse database connections
   - Optimize connection parameters
   - Monitor connection usage

4. **Async Processing**
   - Use async patterns for I/O operations
   - Implement proper error handling
   - Monitor async operation performance

## Future Enhancements

### Planned Improvements

1. **Advanced Retry Strategies**
   - Custom retry policies per workflow type
   - Intelligent retry scheduling
   - Retry success prediction

2. **Enhanced Monitoring**
   - Real-time workflow visualization
   - Predictive failure detection
   - Automated recovery procedures

3. **Workflow Optimization**
   - Automatic workflow optimization
   - Performance bottleneck detection
   - Resource usage optimization

4. **Multi-Region Support**
   - Cross-region reliability controls
   - Regional circuit breakers
   - Global DLQ management

### Integration Opportunities

1. **External Monitoring**
   - Integration with external monitoring systems
   - Custom metrics and dashboards
   - Third-party alerting services

2. **Workflow Orchestration**
   - Advanced workflow orchestration
   - Dependency management
   - Parallel execution optimization

3. **Machine Learning**
   - Failure prediction using ML
   - Intelligent retry strategies
   - Automated optimization

## Verification

Run the following commands to verify implementation:

```bash
# Run database migration
supabase migration up

# Test API endpoints
curl -X GET /api/n8n/reliability/status

# Check database functions
psql -c "SELECT get_n8n_dlq_stats();"
psql -c "SELECT get_circuit_breaker_stats();"
psql -c "SELECT get_concurrency_stats();"

# Test workflow execution
curl -X POST /api/n8n/webhook/notify-gap-fill \
  -H "Content-Type: application/json" \
  -d '{"tenant_id": "test-tenant", "clients": []}'

# Verify reliability controls
curl -X GET /api/n8n/reliability/status | jq '.reliability'
```

## Related Documentation

- [n8n README](../n8n/README.md) - Comprehensive n8n documentation
- [Webhook Security](../hardening/STEP4_WEBHOOKS.md) - Webhook security implementation
- [Guardian System](../hardening/STEP6_GUARDIAN_THIN.md) - Guardian system implementation
- [Change Journal](../CHANGE_JOURNAL.md) - Implementation change log
- [Database Schema](../supabase/migrations/20250825_n8n_reliability.sql) - Database migration

## Conclusion

The n8n reliability controls provide enterprise-grade resilience for automated workflows, ensuring high availability and fault tolerance. The implementation includes comprehensive monitoring, alerting, and recovery mechanisms that scale with the application's growth.

Key benefits include:
- **Improved Reliability:** Circuit breakers and retry logic prevent cascade failures
- **Better Observability:** Comprehensive monitoring and alerting
- **Tenant Isolation:** Per-tenant reliability controls prevent cross-tenant issues
- **Automated Recovery:** DLQ and retry mechanisms enable automatic recovery
- **Scalable Architecture:** Designed to scale with application growth

The system is designed to be maintainable, extensible, and integrated into the development workflow, providing immediate feedback on reliability issues and enabling proactive maintenance.
