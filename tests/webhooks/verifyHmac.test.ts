/**
 * HMAC Verification Tests
 * 
 * Tests for webhook HMAC signature verification functionality.
 */

import { verifyHmacSignature, verifyWebhookHmac, verifyStripeWebhook } from '@/lib/webhooks/verifyHmac';

// Mock Request for Node.js environment
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  
  async text() {
    return this.init?.body as string || '';
  }
  
  clone() {
    return new MockRequest(this.url, this.init);
  }
  
  get headers() {
    return new Map(Object.entries(this.init?.headers || {}));
  }
} as any;

describe('HMAC Verification', () => {
  const testSecret = 'test-secret-key';
  const testPayload = '{"test": "data"}';
  const testSignature = 'sha256=' + require('crypto')
    .createHmac('sha256', testSecret)
    .update(testPayload)
    .digest('hex');

  describe('verifyHmacSignature', () => {
    it('should verify valid signature', () => {
      const result = verifyHmacSignature(testPayload, testSignature, testSecret, 'sha256=');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject invalid signature', () => {
      const invalidSignature = 'sha256=invalid-signature';
      const result = verifyHmacSignature(testPayload, invalidSignature, testSecret, 'sha256=');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Signature length mismatch');
    });

    it('should reject missing signature', () => {
      const result = verifyHmacSignature(testPayload, '', testSecret, 'sha256=');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing signature');
    });

    it('should reject missing secret', () => {
      const result = verifyHmacSignature(testPayload, testSignature, '', 'sha256=');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing secret key');
    });

    it('should reject wrong prefix', () => {
      const wrongPrefixSignature = 'md5=wrong-prefix';
      const result = verifyHmacSignature(testPayload, wrongPrefixSignature, testSecret, 'sha256=');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid signature format. Expected prefix: sha256=');
    });

    it('should handle signature without prefix', () => {
      const signatureWithoutPrefix = testSignature.replace('sha256=', '');
      const result = verifyHmacSignature(testPayload, signatureWithoutPrefix, testSecret);
      expect(result.isValid).toBe(true);
    });
  });

  describe('verifyWebhookHmac', () => {
    beforeEach(() => {
      // Mock environment variable
      process.env.TEST_WEBHOOK_SECRET = testSecret;
    });

    afterEach(() => {
      delete process.env.TEST_WEBHOOK_SECRET;
    });

    it('should verify valid webhook request', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'X-Webhook-Signature': testSignature,
          'Content-Type': 'application/json'
        },
        body: testPayload
      });

      const result = await verifyWebhookHmac(request, {
        headerName: 'X-Webhook-Signature',
        secretEnv: 'TEST_WEBHOOK_SECRET',
        signaturePrefix: 'sha256='
      });

      expect(result.isValid).toBe(true);
    });

    it('should reject request with missing header', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: testPayload
      });

      const result = await verifyWebhookHmac(request, {
        headerName: 'X-Webhook-Signature',
        secretEnv: 'TEST_WEBHOOK_SECRET'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing X-Webhook-Signature header');
    });

    it('should reject request with missing secret env', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'X-Webhook-Signature': testSignature
        },
        body: testPayload
      });

      const result = await verifyWebhookHmac(request, {
        headerName: 'X-Webhook-Signature',
        secretEnv: 'MISSING_SECRET'
      });

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Missing MISSING_SECRET environment variable');
    });
  });

  describe('verifyStripeWebhook', () => {
    beforeEach(() => {
      process.env.TEST_STRIPE_SECRET = testSecret;
    });

    afterEach(() => {
      delete process.env.TEST_STRIPE_SECRET;
    });

    it('should verify valid Stripe webhook', async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedPayload = `${timestamp}.${testPayload}`;
      const stripeSignature = `t=${timestamp},v1=${require('crypto')
        .createHmac('sha256', testSecret)
        .update(signedPayload)
        .digest('hex')}`;

      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'Stripe-Signature': stripeSignature
        },
        body: testPayload
      });

      const result = await verifyStripeWebhook(request, 'TEST_STRIPE_SECRET');
      expect(result.isValid).toBe(true);
    });

    it('should reject old Stripe webhook', async () => {
      const oldTimestamp = Math.floor((Date.now() - 400000) / 1000).toString(); // 6+ minutes ago
      const signedPayload = `${oldTimestamp}.${testPayload}`;
      const stripeSignature = `t=${oldTimestamp},v1=${require('crypto')
        .createHmac('sha256', testSecret)
        .update(signedPayload)
        .digest('hex')}`;

      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'Stripe-Signature': stripeSignature
        },
        body: testPayload
      });

      const result = await verifyStripeWebhook(request, 'TEST_STRIPE_SECRET');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Timestamp too old');
    });

    it('should reject invalid Stripe signature format', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'Stripe-Signature': 'invalid-format'
        },
        body: testPayload
      });

      const result = await verifyStripeWebhook(request, 'TEST_STRIPE_SECRET');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid Stripe signature format');
    });
  });
});
