/**
 * Rate Limiting Utilities
 * 
 * Provides per-tenant rate limiting with in-memory storage
 * for Guardian endpoints and other API operations.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (tenantId: string, ip?: string) => string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

/**
 * Default rate limit configurations
 */
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
} as const;

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  tenantId: string,
  config: RateLimitConfig,
  ip?: string
): RateLimitResult {
  const key = config.keyGenerator 
    ? config.keyGenerator(tenantId, ip)
    : `${tenantId}:${config.windowMs}:${config.maxRequests}`;
  
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // If no entry or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }
  
  // Check if within limit
  if (entry.count < config.maxRequests) {
    entry.count++;
    rateLimitStore.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
  
  // Rate limit exceeded
  const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
  
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter,
  };
}

/**
 * Generate rate limit key with IP fallback
 */
export function generateRateLimitKey(tenantId: string, ip?: string): string {
  return ip ? `${tenantId}:${ip}` : tenantId;
}

/**
 * Clear rate limit for a specific tenant (admin utility)
 */
export function clearRateLimit(tenantId: string): void {
  const keysToDelete: string[] = [];
  
  for (const key of rateLimitStore.keys()) {
    if (key.startsWith(tenantId)) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

/**
 * Get rate limit statistics (for debugging)
 */
export function getRateLimitStats(): {
  totalEntries: number;
  entries: Array<{ key: string; count: number; resetTime: number }>;
} {
  const entries = Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    resetTime: entry.resetTime,
  }));
  
  return {
    totalEntries: rateLimitStore.size,
    entries,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  return keysToDelete.length;
}
