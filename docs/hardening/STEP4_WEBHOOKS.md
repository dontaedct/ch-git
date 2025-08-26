# Step 4: Webhook Security Spine (HMAC + Idempotency)

**Date:** 2025-08-25  
**Branch:** `hardening/step4-webhooks-security-20250825`  
**Status:** ✅ Implemented

## Overview

This step implements a comprehensive webhook security infrastructure with HMAC signature verification and idempotency protection to prevent replay attacks and ensure webhook integrity.

## Security Features

### 1. HMAC Verification

- **Constant-time signature verification** using SHA-256 HMAC
- **Timing attack protection** with `crypto.timingSafeEqual()`
- **Configurable header names** and signature prefixes
- **Stripe-specific verification** with timestamp validation
- **Environment-based secret management**

### 2. Idempotency & Replay Defense

- **Event deduplication** using unique event IDs
- **Automatic cleanup** of expired entries
- **Namespace isolation** per webhook provider
- **Race condition protection** with immediate marking
- **Graceful error handling** for database failures

### 3. Uniform Security Wrapper

- **`withVerifiedWebhook()`** - Generic webhook wrapper
- **`withStripeWebhook()`** - Stripe-specific wrapper
- **`withGitHubWebhook()`** - GitHub-specific wrapper
- **`withGenericWebhook()`** - Configurable generic wrapper

## Implementation

### Core Files

```
lib/webhooks/
├── verifyHmac.ts      # HMAC signature verification
├── idempotency.ts     # Idempotency tracking
└── index.ts          # Security wrappers

app/api/webhooks/
├── stripe/route.ts    # Stripe webhook example
└── generic/route.ts   # Generic webhook example

supabase/migrations/
└── 20250825_webhook_idempotency.sql

tests/webhooks/
├── verifyHmac.test.ts
├── idempotency.test.ts
└── integration.test.ts
```

### Database Schema

```sql
CREATE TABLE webhook_idempotency (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  event_id TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint prevents duplicate processing
CREATE UNIQUE INDEX webhook_idempotency_unique 
ON webhook_idempotency (namespace, event_id);
```

## Usage Examples

### Stripe Webhook

```typescript
import { withStripeWebhook, WebhookContext } from '@/lib/webhooks';

async function stripeHandler(context: WebhookContext) {
  const { json, eventId } = context;
  
  switch (json.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(json);
      break;
    // ... other event types
  }
  
  return NextResponse.json({ success: true });
}

export const POST = withStripeWebhook(stripeHandler);
```

### Generic Webhook

```typescript
import { withGenericWebhook } from '@/lib/webhooks';

export const POST = withGenericWebhook(handler, {
  headerName: 'X-Webhook-Signature',
  secretEnv: 'MY_WEBHOOK_SECRET',
  signaturePrefix: 'sha256=',
  namespace: 'my-provider',
  ttlSeconds: 86400
});
```

## Environment Variables

```bash
# Stripe webhooks
STRIPE_WEBHOOK_SECRET=whsec_...

# GitHub webhooks  
GITHUB_WEBHOOK_SECRET=your-github-secret

# Generic webhooks
GENERIC_WEBHOOK_SECRET=your-secret-key
```

## Security Headers

### Stripe
- **Header:** `Stripe-Signature`
- **Format:** `t=timestamp,v1=signature`
- **Validation:** Timestamp within 5 minutes

### GitHub
- **Header:** `X-Hub-Signature-256`
- **Format:** `sha256=signature`
- **Algorithm:** SHA-256 HMAC

### Generic
- **Header:** Configurable (e.g., `X-Webhook-Signature`)
- **Format:** Configurable prefix
- **Algorithm:** SHA-256 HMAC

## Testing Strategy

### Unit Tests
- HMAC signature verification (valid/invalid cases)
- Idempotency tracking (new/replay events)
- Event ID extraction (multiple providers)
- Error handling (missing secrets, invalid formats)

### Integration Tests
- End-to-end webhook processing
- Security failure scenarios
- Replay attack prevention
- Handler error recovery

### Test Isolation
- Mock Supabase client for database operations
- Environment variable management
- Request/response mocking
- Cleanup between tests

## Security Considerations

### ✅ Implemented
- Constant-time signature comparison
- Timestamp validation for Stripe
- Automatic idempotency tracking
- Environment-based secret management
- Comprehensive error handling
- Database cleanup functions

### 🔒 Best Practices
- Never log sensitive data (signatures, secrets)
- Use service role for database operations
- Implement proper RLS policies
- Regular cleanup of expired entries
- Monitor for suspicious patterns

## Monitoring & Observability

### Logging
- Webhook processing events
- Security failures (invalid signatures)
- Replay attack attempts
- Handler processing errors

### Metrics
- Webhook processing success rate
- Signature verification failures
- Replay attack frequency
- Database cleanup operations

## Migration Guide

### For Existing Webhooks

1. **Add environment variables** for webhook secrets
2. **Run database migration** for idempotency table
3. **Wrap existing handlers** with security functions
4. **Update tests** to include security scenarios
5. **Deploy and verify** webhook functionality

### Example Migration

```typescript
// Before
export async function POST(request: Request) {
  const body = await request.json();
  // Process webhook...
}

// After  
export const POST = withStripeWebhook(async (context, request) => {
  const { json } = context;
  // Process webhook...
});
```

## Future Enhancements

- **Rate limiting** per webhook provider
- **Webhook retry logic** with exponential backoff
- **Webhook event filtering** by type/priority
- **Webhook analytics** and reporting
- **Multi-tenant webhook isolation**

## Verification

Run the following commands to verify implementation:

```bash
# Run tests
npm test tests/webhooks/

# Check TypeScript compilation
npm run type-check

# Run full CI pipeline
npm run ci
```

## Related Documentation

- [Webhook Security Best Practices](https://stripe.com/docs/webhooks/signatures)
- [GitHub Webhook Security](https://docs.github.com/en/developers/webhooks-and-events/webhooks/securing-your-webhooks)
- [OWASP Webhook Security](https://owasp.org/www-community/attacks/Webhook_Attacks)
