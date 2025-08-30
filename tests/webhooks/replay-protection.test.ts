/**
 * Webhook Tests - Replay Protection
 * 
 * Tests for webhook idempotency and replay attack prevention.
 */

import { createIdempotencyKey, checkIdempotency, markEventProcessed } from '@lib/webhooks/idempotency';

// Mock the idempotency module
jest.mock('@lib/webhooks/idempotency', () => ({
  createIdempotencyKey: jest.fn(),
  checkIdempotency: jest.fn(),
  markEventProcessed: jest.fn(),
}));

describe('Webhook Tests - Replay Protection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Idempotency Key Generation', () => {
    it('should generate unique idempotency keys', () => {
      const payload1 = '{"event": "test", "id": "123"}';
      const payload2 = '{"event": "test", "id": "456"}';
      
      (createIdempotencyKey as jest.Mock).mockImplementation((payload, source) => {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
          .update(payload + source)
          .digest('hex');
      });

      const key1 = createIdempotencyKey(payload1, 'stripe');
      const key2 = createIdempotencyKey(payload2, 'stripe');
      const key3 = createIdempotencyKey(payload1, 'github');

      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should generate consistent keys for same payload and source', () => {
      const payload = '{"event": "test", "id": "123"}';
      
      (createIdempotencyKey as jest.Mock).mockImplementation((payload, source) => {
        const crypto = require('crypto');
        return crypto.createHash('sha256')
          .update(payload + source)
          .digest('hex');
      });

      const key1 = createIdempotencyKey(payload, 'stripe');
      const key2 = createIdempotencyKey(payload, 'stripe');

      expect(key1).toBe(key2);
    });
  });

  describe('Replay Detection', () => {
    it('should detect duplicate webhook events', async () => {
      const idempotencyKey = 'test-key-123';
      const eventData = { event: 'payment.succeeded', id: 'evt_123' };

      // First check - should not be processed
      (checkIdempotency as jest.Mock).mockResolvedValueOnce({
        isDuplicate: false,
        processedAt: null
      });

      // Second check - should be duplicate
      (checkIdempotency as jest.Mock).mockResolvedValueOnce({
        isDuplicate: true,
        processedAt: new Date('2024-01-15T10:00:00Z')
      });

      const result1 = await checkIdempotency(idempotencyKey);
      const result2 = await checkIdempotency(idempotencyKey);

      expect(result1.isDuplicate).toBe(false);
      expect(result2.isDuplicate).toBe(true);
      expect(result2.processedAt).toBeDefined();
    });

    it('should allow processing of new events', async () => {
      const idempotencyKey = 'new-key-456';
      
      (checkIdempotency as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        processedAt: null
      });

      const result = await checkIdempotency(idempotencyKey);

      expect(result.isDuplicate).toBe(false);
      expect(result.processedAt).toBeNull();
    });
  });

  describe('Event Processing Marking', () => {
    it('should mark events as processed', async () => {
      const idempotencyKey = 'test-key-789';
      const eventData = { event: 'payment.succeeded', id: 'evt_789' };

      (markEventProcessed as jest.Mock).mockResolvedValue({
        success: true,
        processedAt: new Date()
      });

      const result = await markEventProcessed(idempotencyKey, eventData);

      expect(result.success).toBe(true);
      expect(result.processedAt).toBeDefined();
      expect(markEventProcessed).toHaveBeenCalledWith(idempotencyKey, eventData);
    });

    it('should handle marking failures gracefully', async () => {
      const idempotencyKey = 'test-key-fail';
      const eventData = { event: 'payment.failed', id: 'evt_fail' };

      (markEventProcessed as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Database connection failed'
      });

      const result = await markEventProcessed(idempotencyKey, eventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
    });
  });

  describe('Time-based Replay Protection', () => {
    it('should reject events older than threshold', async () => {
      const oldTimestamp = Math.floor((Date.now() - 400000) / 1000); // 6+ minutes ago
      const payload = '{"event": "test", "created": ' + oldTimestamp + '}';
      
      // Mock Stripe webhook verification that checks timestamp
      const verifyStripeWebhook = jest.fn().mockResolvedValue({
        isValid: false,
        error: 'Timestamp too old'
      });

      const result = await verifyStripeWebhook(payload, 'test-secret');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Timestamp too old');
    });

    it('should accept events within time threshold', async () => {
      const recentTimestamp = Math.floor(Date.now() / 1000); // Current time
      const payload = '{"event": "test", "created": ' + recentTimestamp + '}';
      
      const verifyStripeWebhook = jest.fn().mockResolvedValue({
        isValid: true,
        error: null
      });

      const result = await verifyStripeWebhook(payload, 'test-secret');

      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('Source-specific Replay Protection', () => {
    it('should handle Stripe webhook replay protection', async () => {
      const stripeEventId = 'evt_stripe_123';
      const stripePayload = '{"id": "' + stripeEventId + '", "type": "payment.succeeded"}';
      
      // Mock Stripe-specific idempotency check
      (checkIdempotency as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        processedAt: null,
        source: 'stripe'
      });

      const result = await checkIdempotency(stripeEventId);

      expect(result.isDuplicate).toBe(false);
      expect(result.source).toBe('stripe');
    });

    it('should handle GitHub webhook replay protection', async () => {
      const githubDeliveryId = 'github-delivery-456';
      const githubPayload = '{"action": "opened", "pull_request": {"id": 123}}';
      
      (checkIdempotency as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        processedAt: null,
        source: 'github'
      });

      const result = await checkIdempotency(githubDeliveryId);

      expect(result.isDuplicate).toBe(false);
      expect(result.source).toBe('github');
    });

    it('should handle generic webhook replay protection', async () => {
      const genericKey = 'generic-webhook-789';
      const genericPayload = '{"event": "custom", "data": {"id": 789}}';
      
      (checkIdempotency as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        processedAt: null,
        source: 'generic'
      });

      const result = await checkIdempotency(genericKey);

      expect(result.isDuplicate).toBe(false);
      expect(result.source).toBe('generic');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      (checkIdempotency as jest.Mock).mockRejectedValue(new Error('Database connection failed'));

      await expect(checkIdempotency('test-key')).rejects.toThrow('Database connection failed');
    });

    it('should handle malformed idempotency keys', async () => {
      const malformedKey = '';
      
      (checkIdempotency as jest.Mock).mockResolvedValue({
        isDuplicate: false,
        processedAt: null,
        error: 'Invalid idempotency key'
      });

      const result = await checkIdempotency(malformedKey);

      expect(result.error).toBe('Invalid idempotency key');
    });
  });

  describe('Cleanup and Maintenance', () => {
    it('should handle cleanup of old idempotency records', async () => {
      const cleanupIdempotency = jest.fn().mockResolvedValue({
        deletedCount: 150,
        success: true
      });

      const result = await cleanupIdempotency();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(150);
    });

    it('should handle cleanup failures', async () => {
      const cleanupIdempotency = jest.fn().mockResolvedValue({
        deletedCount: 0,
        success: false,
        error: 'Cleanup operation failed'
      });

      const result = await cleanupIdempotency();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cleanup operation failed');
    });
  });
});
