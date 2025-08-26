/**
 * Idempotency Tests
 * 
 * Tests for webhook idempotency and replay defense functionality.
 */

import { wasProcessed, markProcessed, extractEventId, checkAndMarkProcessed } from '@/lib/webhooks/idempotency';

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
} as any;

// Mock Supabase client
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

describe('Idempotency', () => {
  const testConfig = {
    namespace: 'test',
    ttlSeconds: 3600
  };

  describe('wasProcessed', () => {
    it('should return false for new event', async () => {
      const result = await wasProcessed('new-event-id', testConfig);
      expect(result.wasProcessed).toBe(false);
      expect(result.eventId).toBe('new-event-id');
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockSupabase = require('@/lib/supabase/server').createServiceRoleClient();
      mockSupabase.from().select().eq().eq().single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await wasProcessed('test-event', testConfig);
      expect(result.wasProcessed).toBe(false);
    });
  });

  describe('markProcessed', () => {
    it('should mark event as processed', async () => {
      const result = await markProcessed('test-event-id', testConfig);
      expect(result).toBe(true);
    });

    it('should handle duplicate key errors', async () => {
      // Mock duplicate key error
      const mockSupabase = require('@/lib/supabase/server').createServiceRoleClient();
      mockSupabase.from().insert.mockResolvedValueOnce({
        error: { code: '23505' } // Unique constraint violation
      });

      const result = await markProcessed('duplicate-event', testConfig);
      expect(result).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      // Mock database error
      const mockSupabase = require('@/lib/supabase/server').createServiceRoleClient();
      mockSupabase.from().insert.mockResolvedValueOnce({
        error: { message: 'Database connection failed' }
      });

      const result = await markProcessed('test-event', testConfig);
      expect(result).toBe(true); // Should still return true due to graceful error handling
    });
  });

  describe('extractEventId', () => {
    it('should extract Stripe event ID', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ id: 'evt_1234567890' })
      });

      const eventId = await extractEventId(request, 'stripe');
      expect(eventId).toBe('evt_1234567890');
    });

    it('should extract GitHub event ID', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ 
          head_commit: { id: 'abc123' },
          pull_request: { id: 456 }
        })
      });

      const eventId = await extractEventId(request, 'github');
      expect(eventId).toBe('abc123');
    });

    it('should handle GitHub ping events', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ zen: 'Keep it logically awesome.' })
      });

      const eventId = await extractEventId(request, 'github');
      expect(eventId).toBe('ping');
    });

    it('should extract generic event ID', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ event_id: 'generic-123' })
      });

      const eventId = await extractEventId(request, 'generic');
      expect(eventId).toBe('generic-123');
    });

    it('should return null for invalid JSON', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: 'invalid json'
      });

      const eventId = await extractEventId(request, 'generic');
      expect(eventId).toBeNull();
    });

    it('should return null when no event ID found', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ some_other_field: 'value' })
      });

      const eventId = await extractEventId(request, 'generic');
      expect(eventId).toBeNull();
    });
  });

  describe('checkAndMarkProcessed', () => {
    it('should check and mark new event as processed', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ id: 'test-event-123' })
      });

      const result = await checkAndMarkProcessed(request, testConfig);
      expect(result.wasProcessed).toBe(false);
      expect(result.eventId).toBe('test-event-123');
    });

    it('should handle events without ID', async () => {
      const request = new Request('http://localhost/api/webhook', {
        method: 'POST',
        body: JSON.stringify({ some_field: 'value' })
      });

      const result = await checkAndMarkProcessed(request, testConfig);
      expect(result.wasProcessed).toBe(false);
      expect(result.eventId).toBe('unknown');
    });
  });
});
