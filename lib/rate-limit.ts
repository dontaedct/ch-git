/**
 * Enhanced Rate Limiting Utilities
 * 
 * Provides sophisticated rate limiting with bot detection, adaptive limits,
 * and security event logging for comprehensive API protection.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  violations: number;
  lastViolation?: number;
  isBot: boolean;
  userAgent?: string;
  firstSeen: number;
}

// In-memory rate limit store (resets on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (tenantId: string, ip?: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  botMultiplier?: number; // Stricter limits for bots (default 0.5)
  burstWindowMs?: number; // Shorter burst window (default 10s)
  burstMaxRequests?: number; // Max requests in burst window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  violations: number;
  isBot: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  blockReason?: string;
}

/**
 * Enhanced rate limit configurations with bot detection and burst protection
 */
export const RATE_LIMITS = {
  // Guardian heartbeat: Restricted for security
  GUARDIAN_HEARTBEAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    botMultiplier: 0.3, // Bots get 3 requests
    burstWindowMs: 10 * 1000, // 10 seconds
    burstMaxRequests: 3,
  },
  // Guardian backup intent: Very restrictive
  GUARDIAN_BACKUP_INTENT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    botMultiplier: 0.33, // Bots get 1 request
    burstWindowMs: 60 * 1000, // 1 minute
    burstMaxRequests: 1,
  },
  // Admin routes: Heavily restricted
  ADMIN_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    botMultiplier: 0.1, // Bots get 2 requests
    burstWindowMs: 10 * 1000,
    burstMaxRequests: 5,
  },
  // Webhook endpoints: Strict but accommodating for legitimate traffic
  WEBHOOK_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    botMultiplier: 0.2, // Bots get 6 requests
    burstWindowMs: 10 * 1000,
    burstMaxRequests: 10,
  },
  // General API: Standard limits
  GENERAL_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    botMultiplier: 0.5, // Bots get 50 requests
    burstWindowMs: 10 * 1000,
    burstMaxRequests: 25,
  },
  // Auth endpoints: Moderate restrictions
  AUTH_API: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 15,
    botMultiplier: 0.2, // Bots get 3 requests
    burstWindowMs: 10 * 1000,
    burstMaxRequests: 5,
  },
} as const;

/**
 * Enhanced rate limiting with bot detection and adaptive limits
 */
export function checkRateLimit(
  tenantId: string,
  config: RateLimitConfig,
  options: {
    ip?: string;
    userAgent?: string;
    isBot?: boolean;
    route?: string;
  } = {}
): RateLimitResult {
  const { ip, userAgent, isBot = false, route } = options;
  
  const key = config.keyGenerator 
    ? config.keyGenerator(tenantId, ip)
    : `${tenantId}:${ip || 'unknown'}:${config.windowMs}`;
  
  const burstKey = `${key}:burst`;
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Calculate effective limits based on bot status
  const botMultiplier = config.botMultiplier || 0.5;
  const effectiveMaxRequests = isBot 
    ? Math.ceil(config.maxRequests * botMultiplier)
    : config.maxRequests;
  
  // Check burst protection
  let burstViolation = false;
  if (config.burstWindowMs && config.burstMaxRequests) {
    const burstEntry = rateLimitStore.get(burstKey);
    const burstMax = isBot ? Math.ceil(config.burstMaxRequests * botMultiplier) : config.burstMaxRequests;
    
    if (!burstEntry || now > burstEntry.resetTime) {
      rateLimitStore.set(burstKey, {
        count: 1,
        resetTime: now + config.burstWindowMs,
        violations: 0,
        isBot,
        userAgent,
        firstSeen: now
      });
    } else if (burstEntry.count >= burstMax) {
      burstViolation = true;
    } else {
      burstEntry.count++;
      rateLimitStore.set(burstKey, burstEntry);
    }
  }
  
  // Main window check
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
      violations: 0,
      isBot,
      userAgent,
      firstSeen: now
    };
    rateLimitStore.set(key, newEntry);
    
    if (burstViolation) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: newEntry.resetTime,
        retryAfter: Math.ceil(config.burstWindowMs! / 1000),
        violations: 1,
        isBot,
        riskLevel: 'high',
        blockReason: 'burst_limit_exceeded'
      };
    }
    
    return {
      allowed: true,
      remaining: effectiveMaxRequests - 1,
      resetTime: newEntry.resetTime,
      violations: 0,
      isBot,
      riskLevel: 'low'
    };
  }
  
  // Check if within main window limit
  if (entry.count < effectiveMaxRequests && !burstViolation) {
    entry.count++;
    entry.isBot = isBot; // Update bot status
    if (userAgent) entry.userAgent = userAgent;
    rateLimitStore.set(key, entry);
    
    const riskLevel = calculateRiskLevel(entry, isBot, route);
    
    return {
      allowed: true,
      remaining: effectiveMaxRequests - entry.count,
      resetTime: entry.resetTime,
      violations: entry.violations,
      isBot,
      riskLevel
    };
  }
  
  // Rate limit exceeded
  entry.violations++;
  entry.lastViolation = now;
  rateLimitStore.set(key, entry);
  
  const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
  const blockReason = burstViolation ? 'burst_limit_exceeded' : 'rate_limit_exceeded';
  
  return {
    allowed: false,
    remaining: 0,
    resetTime: entry.resetTime,
    retryAfter,
    violations: entry.violations,
    isBot,
    riskLevel: entry.violations > 5 ? 'high' : 'medium',
    blockReason
  };
}

/**
 * Calculate risk level based on rate limit entry patterns
 */
function calculateRiskLevel(
  entry: RateLimitEntry, 
  isBot: boolean, 
  route?: string
): 'low' | 'medium' | 'high' {
  let riskScore = 0;
  
  // Bot penalty
  if (isBot) riskScore += 1;
  
  // Violation history
  if (entry.violations > 10) riskScore += 3;
  else if (entry.violations > 5) riskScore += 2;
  else if (entry.violations > 0) riskScore += 1;
  
  // High frequency usage
  const requestRate = entry.count / ((Date.now() - entry.firstSeen) / 1000);
  if (requestRate > 10) riskScore += 2; // More than 10 requests per second
  else if (requestRate > 5) riskScore += 1;
  
  // Sensitive route access
  if (route?.includes('/admin/') || route?.includes('/guardian/')) {
    riskScore += 1;
  }
  
  if (riskScore >= 4) return 'high';
  if (riskScore >= 2) return 'medium';
  return 'low';
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
 * Get comprehensive rate limit statistics
 */
export function getRateLimitStats(): {
  totalEntries: number;
  entries: Array<{ 
    key: string; 
    count: number; 
    resetTime: number;
    violations: number;
    isBot: boolean;
    riskLevel: 'low' | 'medium' | 'high';
    userAgent?: string;
  }>;
  botCount: number;
  highRiskCount: number;
  totalViolations: number;
} {
  const entries = Array.from(rateLimitStore.entries()).map(([key, entry]) => ({
    key,
    count: entry.count,
    resetTime: entry.resetTime,
    violations: entry.violations,
    isBot: entry.isBot,
    riskLevel: calculateRiskLevel(entry, entry.isBot),
    userAgent: entry.userAgent,
  }));
  
  const botCount = entries.filter(e => e.isBot).length;
  const highRiskCount = entries.filter(e => e.riskLevel === 'high').length;
  const totalViolations = entries.reduce((sum, e) => sum + e.violations, 0);
  
  return {
    totalEntries: rateLimitStore.size,
    entries,
    botCount,
    highRiskCount,
    totalViolations,
  };
}

/**
 * Clean up expired entries with smart retention for violators
 */
export function cleanupExpiredEntries(): {
  deleted: number;
  retained: number;
  violatorsRetained: number;
} {
  const now = Date.now();
  const keysToDelete: string[] = [];
  const violatorExtension = 60 * 60 * 1000; // Keep violators for 1 hour extra
  let violatorsRetained = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    const isExpired = now > entry.resetTime;
    const isViolator = entry.violations > 0;
    const extendedExpiry = entry.resetTime + violatorExtension;
    
    if (isExpired) {
      if (isViolator && now <= extendedExpiry) {
        // Keep violators longer for pattern analysis
        violatorsRetained++;
      } else {
        keysToDelete.push(key);
      }
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  return {
    deleted: keysToDelete.length,
    retained: rateLimitStore.size,
    violatorsRetained,
  };
}

/**
 * Get rate limit configuration for route
 */
export function getRateLimitConfigForRoute(route: string): RateLimitConfig {
  if (route.startsWith('/api/guardian/')) {
    if (route.includes('heartbeat')) return RATE_LIMITS.GUARDIAN_HEARTBEAT;
    if (route.includes('backup-intent')) return RATE_LIMITS.GUARDIAN_BACKUP_INTENT;
    return RATE_LIMITS.ADMIN_API;
  }
  
  if (route.startsWith('/api/admin/')) return RATE_LIMITS.ADMIN_API;
  if (route.startsWith('/api/webhooks/')) return RATE_LIMITS.WEBHOOK_API;
  if (route.startsWith('/api/auth/') || route.includes('/login')) return RATE_LIMITS.AUTH_API;
  
  return RATE_LIMITS.GENERAL_API;
}

/**
 * Block abusive IPs (admin utility)
 */
const blockedIPs = new Set<string>();

export function blockIP(ip: string, reason: string): void {
  blockedIPs.add(ip);
  console.warn(`IP ${ip} blocked: ${reason}`);
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function getBlockedIPs(): string[] {
  return Array.from(blockedIPs);
}
