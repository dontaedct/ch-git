/**
 * Webhook Integration Tests
 * 
 * End-to-end tests for webhook security and processing.
 */

// Import only the functions we need to avoid Next.js Request issues
import { verifyWebhookHmac } from '@/lib/webhooks/verifyHmac';
import { checkAndMarkProcessed } from '@/lib/webhooks/idempotency';

// Mock Request for Node.js environment
global.Request = class MockRequest {
  constructor(public url: string, public init?: RequestInit) {}
  
  async text() {
    return this.init?.body as string || '';
  }
  
  async json() {
    return JSON.parse(this.init?.body as string || '{}');
  }
  
  clone() {
    return new MockRequest(this.url, this.init);
  }
  
  get headers() {
    return new Map(Object.entries(this.init?.headers || {}));
  }
} as any;

// Mock Supabase for idempotency tests
jest.mock('@/lib/supabase/server', () => ({
  createServiceRoleClient: jest.fn(() => ({
    from: jest.fn(() => ({
      delete: jest.fn(() => ({
        lt: jest.fn(() => Promise.resolve({ error: null }))
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { code: 'PGRST116' } }))
          }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
}));

describe('Webhook Integration Tests', () => {
  const testSecret = 'test-webhook-secret';
  const testPayload = JSON.stringify({ id: 'evt_123', type: 'test.event' });
  const testSignature = 'sha256=' + require('crypto')
    .createHmac('sha256', testSecret)
    .update(testPayload)
    .digest('hex');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.TEST_WEBHOOK_SECRET = testSecret;
  });

  afterEach(() => {
    delete process.env.TEST_WEBHOOK_SECRET;
  });

  describe('HMAC Verification', () => {
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

    it('should reject invalid signature', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        headers: {
          'X-Webhook-Signature': 'sha256=invalid-signature',
          'Content-Type': 'application/json'
        },
        body: testPayload
      });

      const result = await verifyWebhookHmac(request, {
        headerName: 'X-Webhook-Signature',
        secretEnv: 'TEST_WEBHOOK_SECRET',
        signaturePrefix: 'sha256='
      });

      expect(result.isValid).toBe(false);
    });
  });

  describe('Idempotency', () => {
    it('should check and mark new event as processed', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: testPayload
      });

      const result = await checkAndMarkProcessed(request, {
        namespace: 'test',
        ttlSeconds: 3600
      });

      expect(result.wasProcessed).toBe(false);
      expect(result.eventId).toBe('evt_123');
    });

    it('should handle events without ID', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ some_field: 'value' })
      });

      const result = await checkAndMarkProcessed(request, {
        namespace: 'test',
        ttlSeconds: 3600
      });

      expect(result.wasProcessed).toBe(false);
      expect(result.eventId).toBe('unknown');
    });
  });
});
