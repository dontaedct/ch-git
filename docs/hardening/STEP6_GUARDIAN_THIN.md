# Step 6: Thin Guardian + Externalized Schedules (Cron/n8n)

## Overview

This step converts the Guardian system from a heavy, in-app monitoring system to a thin, externally-scheduled service. Heavy operations (backups, long scans) are offloaded to external schedulers, while the Guardian endpoints focus on health checks and backup intents with proper rate limiting and observability.

## Architecture Changes

### Before (Step 5)
- Guardian dashboard with 30-second auto-refresh intervals
- Heavy backup operations running in-app
- No rate limiting or tenant isolation
- Basic logging without structured context

### After (Step 6)
- Thin Guardian endpoints for health checks and backup intents
- External scheduling via Vercel Cron or n8n
- Per-tenant rate limiting with 429 responses
- Structured logging with operation context
- Slack notifications for failures

## New Endpoints

### `/api/guardian/heartbeat` (GET)

**Purpose:** Lightweight health checks for external monitoring

**Features:**
- Feature flag validation (`guardian_enabled`)
- Rate limiting: 10 requests/minute per tenant
- Anonymous access allowed (with stricter limits)
- Structured logging with tenant context

**Response:**
```json
{
  "ok": true,
  "timestamp": "2025-08-25T10:30:00.000Z",
  "tenantId": "user-123",
  "health": {
    "overall": "healthy",
    "checks": {
      "memory": { "status": "healthy", "message": "245MB used" },
      "uptime": { "status": "healthy", "message": "3600s uptime" },
      "nodeVersion": { "status": "healthy", "message": "v18.17.0" }
    }
  },
  "rateLimit": {
    "remaining": 9,
    "resetTime": "2025-08-25T10:31:00.000Z"
  }
}
```

**Rate Limit Exceeded (429):**
```json
{
  "ok": false,
  "code": "RATE_LIMITED",
  "message": "Too many heartbeat requests",
  "retryAfter": 45
}
```

### `/api/guardian/backup-intent` (POST)

**Purpose:** Trigger backup operations with rate limiting

**Features:**
- Feature flag validation (`guardian_enabled`)
- Rate limiting: 3 requests/hour per tenant
- Authenticated access required
- Structured logging and Slack notifications

**Request Body:**
```json
{
  "reason": "Scheduled daily backup"
}
```

**Success Response:**
```json
{
  "ok": true,
  "message": "Backup completed successfully",
  "timestamp": "2025-08-25T10:30:00.000Z",
  "tenantId": "user-123",
  "backup": {
    "startedAt": "2025-08-25T10:29:45.000Z",
    "finishedAt": "2025-08-25T10:30:00.000Z",
    "artifacts": [
      { "type": "git", "ok": true },
      { "type": "project", "ok": true },
      { "type": "db", "ok": true }
    ],
    "reason": "Scheduled daily backup"
  },
  "rateLimit": {
    "remaining": 2,
    "resetTime": "2025-08-25T11:30:00.000Z"
  }
}
```

### `/api/guardian/backup-intent` (GET)

**Purpose:** Check backup status without triggering backup

**Features:**
- Same rate limiting as heartbeat
- Returns last backup status and artifacts
- No backup execution

## Rate Limiting Policy

### Configuration

```typescript
export const RATE_LIMITS = {
  // Guardian heartbeat: 10 requests per minute
  GUARDIAN_HEARTBEAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
  },
  // Guardian backup intent: 3 requests per hour
  GUARDIAN_BACKUP_INTENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
  },
  // General API: 100 requests per minute
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
};
```

### Rate Limit Headers

All rate-limited endpoints return standard headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 2025-08-25T10:31:00.000Z
Retry-After: 45
```

### Tenant Isolation

- Rate limits are per-tenant (user ID)
- Anonymous users get separate limits
- IP-based fallback for unauthenticated requests
- Admin utilities to clear rate limits

## External Scheduling

### Vercel Cron Jobs

**vercel.json:**
```json
{
  "crons": [
    {
      "path": "/api/guardian/heartbeat",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/guardian/backup-intent",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Environment Variables:**
```bash
# Required for cron authentication
CRON_SECRET=your-secure-secret-here

# Optional: Slack notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

**Cron Endpoint Example:**
```typescript
// app/api/guardian/cron-heartbeat/route.ts
export async function GET(req: Request) {
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  
  if (secret !== process.env.CRON_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Call the actual heartbeat endpoint
  const response = await fetch(`${process.env.VERCEL_URL}/api/guardian/heartbeat`);
  return response;
}
```

### n8n Workflow

**Heartbeat Monitoring (every 5 minutes):**
```json
{
  "nodes": [
    {
      "name": "Guardian Heartbeat",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-app.vercel.app/api/guardian/heartbeat",
        "method": "GET",
        "headers": {
          "Authorization": "Bearer your-api-token"
        }
      }
    },
    {
      "name": "Check Health Status",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "string": [
            {
              "value1": "={{ $json.health.overall }}",
              "operation": "notEqual",
              "value2": "healthy"
            }
          ]
        }
      }
    },
    {
      "name": "Send Slack Alert",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "resource": "message",
        "operation": "post",
        "channel": "#alerts",
        "text": "🚨 Guardian health check failed: {{ $json.health.overall }}"
      }
    }
  ]
}
```

**Backup Scheduling (daily at 2 AM):**
```json
{
  "nodes": [
    {
      "name": "Trigger Backup",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://your-app.vercel.app/api/guardian/backup-intent",
        "method": "POST",
        "headers": {
          "Authorization": "Bearer your-api-token",
          "Content-Type": "application/json"
        },
        "body": {
          "reason": "Daily scheduled backup via n8n"
        }
      }
    },
    {
      "name": "Log Result",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "return { backupResult: $input.all() };"
      }
    }
  ]
}
```

## Structured Logging

### Log Format

All Guardian operations emit structured logs:

```json
{
  "timestamp": "2025-08-25T10:30:00.000Z",
  "op": "heartbeat",
  "tenantId": "user-123",
  "result": "success",
  "durationMs": 45,
  "details": {
    "healthStatus": "healthy",
    "rateLimitRemaining": 9
  }
}
```

### Log Levels

- **success**: Operation completed successfully
- **failure**: Operation failed with error
- **rate_limited**: Request blocked by rate limiting
- **feature_disabled**: Feature flag disabled for tenant

### Usage

```typescript
import { createGuardianLogger } from '@lib/guardian/structured-logger';

const logger = createGuardianLogger('backup-intent', tenantId);

// Success
logger.success({ artifacts: 3, durationMs: 15000 });

// Failure
logger.failure('Backup timeout', { timeout: 60000 });

// Rate limited
logger.rateLimited(3600, { retryAfter: 3600 });
```

## Slack Notifications

### Configuration

Set `SLACK_WEBHOOK_URL` environment variable:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

### Notification Types

**Guardian Failure:**
```
🚨 Guardian Failure Alert

**Operation:** backup-intent
**Tenant:** user-123
**Duration:** 15000ms
**Error:** Backup timeout after 60 seconds
**Time:** 2025-08-25T10:30:00.000Z
```

**Guardian Success (optional):**
```
✅ Guardian Success

**Operation:** backup-intent
**Tenant:** user-123
**Duration:** 15000ms
**Details:** Created 3 backup artifacts
**Time:** 2025-08-25T10:30:00.000Z
```

### Usage

```typescript
import { sendGuardianFailureNotification } from '@lib/notifications/slack';

await sendGuardianFailureNotification(
  'backup-intent',
  'Backup timeout',
  'user-123',
  15000
);
```

## Migration Guide

### 1. Update Guardian Dashboard

The dashboard no longer auto-refreshes. Users must manually refresh or rely on external monitoring.

**Before:**
```typescript
// Auto-refresh every 30 seconds
const interval = setInterval(fetchHealth, 30000);
```

**After:**
```typescript
// Manual refresh only
// External schedulers handle monitoring
```

### 2. Update Backup Triggers

**Before:**
```typescript
fetch('/api/guardian/backup', { method: 'POST' });
```

**After:**
```typescript
fetch('/api/guardian/backup-intent', { 
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ reason: 'Manual backup' })
});
```

### 3. Set Up External Scheduling

Choose one of the following:

**Option A: Vercel Cron**
- Add cron jobs to `vercel.json`
- Set `CRON_SECRET` environment variable
- Create cron endpoint wrappers

**Option B: n8n Workflows**
- Create heartbeat monitoring workflow
- Create backup scheduling workflow
- Set up Slack notifications

**Option C: Custom Scheduler**
- Use any cron service (GitHub Actions, etc.)
- Call Guardian endpoints directly
- Handle authentication appropriately

## Security Considerations

### Rate Limiting
- Prevents abuse and DoS attacks
- Per-tenant isolation
- Configurable limits per operation type
- Standard HTTP 429 responses

### Feature Flags
- Guardian system can be disabled per tenant
- Graceful degradation when disabled
- Admin controls for system-wide management

### Authentication
- Backup operations require authentication
- Heartbeat allows anonymous access (with limits)
- Cron jobs use secret-based authentication

### Logging
- No sensitive data in logs
- Structured format for easy parsing
- Tenant isolation in log context

## Monitoring and Alerting

### Health Checks
- External schedulers monitor heartbeat endpoint
- Automatic Slack alerts on failures
- Rate limit monitoring and alerting

### Backup Monitoring
- Success/failure notifications
- Artifact count tracking
- Duration monitoring for performance

### Rate Limit Monitoring
- Track rate limit hits per tenant
- Alert on unusual patterns
- Admin tools for limit management

## Performance Benefits

### Reduced In-App Load
- No more 30-second intervals
- Heavy operations externalized
- Better resource utilization

### Improved Scalability
- Rate limiting prevents abuse
- Tenant isolation
- External scheduling flexibility

### Better Observability
- Structured logging
- Slack notifications
- Performance metrics

## Troubleshooting

### Common Issues

**Rate Limited (429)**
- Check rate limit headers
- Wait for reset time
- Consider increasing limits for specific tenants

**Feature Disabled (403)**
- Check `guardian_enabled` feature flag
- Enable via admin interface
- Verify tenant permissions

**Backup Timeout**
- Check Guardian service configuration
- Verify external process execution
- Review timeout settings

### Debug Commands

```bash
# Check rate limit status
curl -H "Authorization: Bearer $TOKEN" \
  https://your-app.vercel.app/api/guardian/heartbeat

# Clear rate limits (admin only)
# Use admin interface or direct database access

# Check feature flags
# Use admin interface at /operability/flags
```

## Future Enhancements

### Planned Features
- Redis-based rate limiting for multi-instance deployments
- Webhook notifications for backup completion
- Backup scheduling UI in admin interface
- Performance metrics dashboard

### Scalability Considerations
- Database-backed rate limiting
- Distributed rate limit coordination
- Backup queue management
- Multi-region deployment support
