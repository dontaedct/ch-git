# HMAC Verification Code Path Documentation

This document outlines the HMAC verification implementation for webhook security in the OSS Hero application.

## Overview

The application uses HMAC (Hash-based Message Authentication Code) signatures to verify the authenticity and integrity of webhook payloads. This prevents tampering and ensures webhooks come from trusted sources.

## Architecture

### Components

1. **Outgoing Webhooks (Emitter)**
   - **File**: `lib/webhooks/hmac-signer.ts`
   - **Purpose**: Generate HMAC signatures for outgoing webhook requests
   - **Flow**: Sign payloads before sending to n8n endpoints

2. **Incoming Webhooks (Verifier)**
   - **File**: `lib/webhooks/verifyHmac.ts`
   - **Purpose**: Verify HMAC signatures on incoming webhook requests
   - **Flow**: Validate signatures from external services (Stripe, GitHub, etc.)

### Configuration

- **File**: `lib/config/webhooks.ts`
- **Environment Variables**:
  - `N8N_WEBHOOK_SECRET`: Secret key for n8n webhook signing
  - `STRIPE_WEBHOOK_SECRET`: Secret key for Stripe webhook verification
  - Additional secrets can be configured per endpoint

## Outgoing Webhook Flow

### 1. Payload Preparation

```typescript
// lib/webhooks/emitter.ts
const payload = {
  type: event.type,
  data: event.data,
  metadata: {
    timestamp: new Date().toISOString(),
    sessionId: this.sessionId,
    userId: this.userId
  }
}
```

### 2. HMAC Signature Generation

```typescript
// lib/webhooks/hmac-signer.ts
export function generateHmacSignature(
  payload: string,
  secret: string,
  options: HmacSignatureOptions = {}
): SignedPayload
```

**Process**:
1. Convert payload object to JSON string
2. Create HMAC using SHA-256 algorithm
3. Add signature prefix (e.g., `sha256=`)
4. Include timestamp if required (Stripe-style)
5. Generate request headers with signature

### 3. Request Headers

Generated headers include:
- `X-Hub-Signature-256`: HMAC signature
- `Content-Type`: `application/json`
- `User-Agent`: `OSS-Hero-Webhooks/1.0`
- `X-Timestamp`: Unix timestamp (if timestamp verification enabled)

### 4. Delivery with Retry

```typescript
// lib/webhooks/emitter.ts
const response = await fetch(endpointConfig.url, {
  method: 'POST',
  headers,
  body: jsonPayload,
  signal: controller.signal
});
```

**Retry Logic**:
- Uses exponential backoff from `lib/n8n/reliability.ts`
- Configurable retry attempts (default: 3)
- Jitter to prevent thundering herd

## Incoming Webhook Verification

### 1. Signature Extraction

```typescript
// lib/webhooks/verifyHmac.ts
const signature = request.headers.get(config.headerName);
const secret = process.env[config.secretEnv];
```

### 2. Payload Reconstruction

```typescript
const clonedRequest = request.clone();
const payload = await clonedRequest.text();
```

### 3. HMAC Verification

```typescript
export function verifyHmacSignature(
  payload: string,
  signature: string,
  secret: string,
  prefix?: string
): HmacVerificationResult
```

**Process**:
1. Extract signature value (remove prefix if present)
2. Generate expected signature using same algorithm
3. Use constant-time comparison (`timingSafeEqual`)
4. Return verification result

### 4. Constant-Time Comparison

```typescript
const expectedBuffer = Buffer.from(expectedSignature, 'hex');
const receivedBuffer = Buffer.from(signatureValue, 'hex');
const isValid = timingSafeEqual(expectedBuffer, receivedBuffer);
```

**Security**: Prevents timing attacks by comparing all bytes regardless of early mismatches.

## Supported Signature Formats

### 1. GitHub Style
- **Header**: `X-Hub-Signature-256`
- **Format**: `sha256=<hex_signature>`
- **Algorithm**: SHA-256

### 2. Stripe Style
- **Header**: `Stripe-Signature`
- **Format**: `t=<timestamp>,v1=<signature1>,v1=<signature2>`
- **Algorithm**: SHA-256 with timestamp
- **Replay Protection**: 5-minute tolerance window

### 3. Generic Style
- **Configurable header name**
- **Configurable prefix**
- **Multiple algorithm support**: SHA-256, SHA-1

## Error Handling

### Verification Errors

```typescript
interface HmacVerificationResult {
  isValid: boolean;
  error?: string;
}
```

**Common Error Types**:
- `Missing signature`: No signature header present
- `Missing secret key`: Environment variable not set
- `Invalid signature format`: Malformed signature
- `Signature length mismatch`: Invalid hex encoding
- `Invalid signature`: Signature does not match
- `Timestamp too old`: Stripe-style timestamp validation failed

### Delivery Errors

**Error Handling in Emitter**:
- HTTP errors (4xx, 5xx responses)
- Network timeouts
- Connection failures
- Invalid endpoint URLs

**Retry Strategy**:
- Exponential backoff with jitter
- Dead Letter Queue for failed deliveries
- Circuit breaker pattern for failing endpoints

## Security Considerations

### 1. Secret Management
- Secrets stored in environment variables
- No hardcoded secrets in source code
- Separate secrets per service/endpoint

### 2. Timing Attacks Prevention
- Constant-time signature comparison
- All comparisons use `timingSafeEqual`

### 3. Replay Attack Prevention
- Timestamp validation for Stripe webhooks
- 5-minute tolerance window
- Idempotency keys for duplicate detection

### 4. Algorithm Security
- SHA-256 recommended (SHA-1 supported for legacy)
- Minimum key entropy requirements
- Regular secret rotation recommended

## Configuration Examples

### n8n Webhook Endpoint

```typescript
{
  url: process.env.N8N_WEBHOOK_URL,
  secret: process.env.N8N_WEBHOOK_SECRET,
  signatureHeader: 'X-Hub-Signature-256',
  signaturePrefix: 'sha256=',
  maxRetries: 3,
  timeoutMs: 10000
}
```

### Stripe Webhook Verification

```typescript
await verifyStripeWebhook(request, 'STRIPE_WEBHOOK_SECRET')
```

### Generic Webhook Verification

```typescript
await verifyWebhookHmac(request, {
  headerName: 'X-Custom-Signature',
  secretEnv: 'CUSTOM_WEBHOOK_SECRET',
  signaturePrefix: 'sha256='
})
```

## Testing

### Unit Tests
- **File**: `tests/webhooks/verifyHmac.test.ts`
- **Coverage**: HMAC generation and verification
- **Test Cases**: Valid signatures, invalid signatures, edge cases

### Integration Tests
- **File**: `tests/webhooks/integration.test.ts`
- **Coverage**: End-to-end webhook delivery
- **Mock endpoints**: Test retry logic and error handling

## Monitoring and Debugging

### Logging
- Failed verification attempts logged with error details
- Successful deliveries logged with timing information
- Webhook delivery metrics for monitoring

### Debug Mode
- Development environment includes verbose logging
- Signature values logged (development only)
- Payload inspection tools

## Best Practices

### For Developers
1. Always use the provided verification functions
2. Never implement custom HMAC verification
3. Use constant-time comparison functions
4. Validate all input parameters
5. Handle errors gracefully

### For Operations
1. Monitor webhook delivery success rates
2. Set up alerts for verification failures
3. Rotate secrets regularly
4. Use separate secrets per environment
5. Test webhook endpoints regularly

## Troubleshooting

### Common Issues

1. **"Missing signature" errors**
   - Check header name configuration
   - Verify webhook endpoint sends signature header

2. **"Invalid signature" errors**
   - Verify secret key matches between systems
   - Check payload encoding (UTF-8)
   - Ensure correct algorithm (SHA-256 vs SHA-1)

3. **"Timestamp too old" errors (Stripe)**
   - Check system clock synchronization
   - Verify network latency is reasonable
   - Increase tolerance window if needed

4. **Delivery failures**
   - Check endpoint URL accessibility
   - Verify SSL certificate validity
   - Monitor network connectivity

### Debug Commands

```bash
# Test webhook endpoint
curl -X POST https://your-endpoint.com/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=<signature>" \
  -d '{"test": "payload"}'

# Generate test signature
node -e "
const crypto = require('crypto');
const payload = JSON.stringify({test: 'payload'});
const signature = crypto.createHmac('sha256', 'your-secret').update(payload).digest('hex');
console.log('sha256=' + signature);
"
```

## Related Documentation

- [Webhook Configuration](../config/webhooks.md)
- [n8n Integration](../n8n/README.md)
- [Security Guidelines](../security/GUIDELINES.md)
- [API Documentation](../api/webhooks.md)