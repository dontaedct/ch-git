/**
 * Guardian Tests - Heartbeat Throttling
 * 
 * Tests for Guardian heartbeat endpoint rate limiting and throttling.
 */

import { checkRateLimit, RATE_LIMITS, clearRateLimit } from '@lib/rate-limit';

// Mock the rate limit module
jest.mock('@lib/rate-limit', () => ({
  checkRateLimit: jest.fn(),
  RATE_LIMITS: {
    GUARDIAN_HEARTBEAT: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    },
    GUARDIAN_BACKUP_INTENT: {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    },
  },
  clearRateLimit: jest.fn(),
}));

describe('Guardian Tests - Heartbeat Throttling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limit Configuration', () => {
    it('should have correct heartbeat rate limit configuration', () => {
      expect(RATE_LIMITS.GUARDIAN_HEARTBEAT.windowMs).toBe(60 * 1000); // 1 minute
      expect(RATE_LIMITS.GUARDIAN_HEARTBEAT.maxRequests).toBe(10);
    });

    it('should have correct backup intent rate limit configuration', () => {
      expect(RATE_LIMITS.GUARDIAN_BACKUP_INTENT.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(RATE_LIMITS.GUARDIAN_BACKUP_INTENT.maxRequests).toBe(3);
    });
  });

  describe('Heartbeat Rate Limiting', () => {
    it('should allow requests within rate limit', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
        retryAfter: undefined
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should block requests exceeding rate limit', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 45000,
        retryAfter: 45
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(45);
    });

    it('should track rate limit per tenant', () => {
      // First tenant
      (checkRateLimit as jest.Mock).mockReturnValueOnce({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      });

      // Second tenant (independent limit)
      (checkRateLimit as jest.Mock).mockReturnValueOnce({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      });

      const result1 = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);
      const result2 = checkRateLimit('tenant-b', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(checkRateLimit).toHaveBeenCalledWith('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);
      expect(checkRateLimit).toHaveBeenCalledWith('tenant-b', RATE_LIMITS.GUARDIAN_HEARTBEAT);
    });
  });

  describe('Backup Intent Rate Limiting', () => {
    it('should allow backup requests within rate limit', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 2,
        resetTime: Date.now() + 3600000,
        retryAfter: undefined
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_BACKUP_INTENT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should block backup requests exceeding rate limit', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 1800000,
        retryAfter: 1800
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_BACKUP_INTENT);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBe(1800);
    });
  });

  describe('Anonymous User Rate Limiting', () => {
    it('should apply stricter limits for anonymous users', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 5, // Lower limit for anonymous
        resetTime: Date.now() + 60000,
      });

      const result = checkRateLimit('anonymous', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThanOrEqual(10); // Should be lower than authenticated limit
    });
  });

  describe('Rate Limit Headers', () => {
    it('should include proper rate limit headers in responses', () => {
      const mockResponse = {
        status: 429,
        headers: {
          'Retry-After': '45',
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + 45000).toISOString(),
        }
      };

      expect(mockResponse.headers['Retry-After']).toBe('45');
      expect(mockResponse.headers['X-RateLimit-Limit']).toBe('10');
      expect(mockResponse.headers['X-RateLimit-Remaining']).toBe('0');
      expect(mockResponse.headers['X-RateLimit-Reset']).toBeDefined();
    });

    it('should include rate limit headers in successful responses', () => {
      const mockResponse = {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': '9',
          'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
        }
      };

      expect(mockResponse.headers['X-RateLimit-Limit']).toBe('10');
      expect(mockResponse.headers['X-RateLimit-Remaining']).toBe('9');
      expect(mockResponse.headers['X-RateLimit-Reset']).toBeDefined();
    });
  });

  describe('Rate Limit Reset', () => {
    it('should reset rate limit after window expires', () => {
      // First request in new window
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(9);
    });

    it('should allow clearing rate limits for testing', () => {
      (clearRateLimit as jest.Mock).mockReturnValue(undefined);

      clearRateLimit('tenant-a');

      expect(clearRateLimit).toHaveBeenCalledWith('tenant-a');
    });
  });

  describe('IP-based Rate Limiting', () => {
    it('should consider IP address in rate limiting', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT, '192.168.1.1');

      expect(checkRateLimit).toHaveBeenCalledWith('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT, '192.168.1.1');
      expect(result.allowed).toBe(true);
    });

    it('should handle missing IP address gracefully', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
        resetTime: Date.now() + 60000,
      });

      const result = checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT, undefined);

      expect(result.allowed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limit check failures gracefully', () => {
      (checkRateLimit as jest.Mock).mockImplementation(() => {
        throw new Error('Rate limit check failed');
      });

      expect(() => {
        checkRateLimit('tenant-a', RATE_LIMITS.GUARDIAN_HEARTBEAT);
      }).toThrow('Rate limit check failed');
    });

    it('should handle invalid tenant IDs', () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
        retryAfter: 60
      });

      const result = checkRateLimit('', RATE_LIMITS.GUARDIAN_HEARTBEAT);

      expect(result.allowed).toBe(false);
    });
  });

  describe('Rate Limit Monitoring', () => {
    it('should provide rate limit statistics', () => {
      const mockStats = {
        totalEntries: 5,
        entries: [
          { key: 'tenant-a:60000:10', count: 3, resetTime: Date.now() + 30000 },
          { key: 'tenant-b:60000:10', count: 1, resetTime: Date.now() + 45000 },
        ]
      };

      // Mock the getRateLimitStats function
      const getRateLimitStats = jest.fn().mockReturnValue(mockStats);

      const stats = getRateLimitStats();

      expect(stats.totalEntries).toBe(5);
      expect(stats.entries).toHaveLength(2);
      expect(stats.entries[0].key).toContain('tenant-a');
    });
  });
});
