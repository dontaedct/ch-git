/**
 * @fileoverview Enhanced Rate Limiting and Brute Force Protection
 * @module lib/security/brute-force-protection
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.8 - Add rate limiting and brute force protection
 * Focus: Comprehensive brute force protection with progressive delays and account lockout
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (brute force attack vulnerabilities)
 */

import { NextRequest } from 'next/server';

/**
 * Brute force protection configuration
 */
export interface BruteForceConfig {
  maxAttempts: number;
  lockoutDuration: number; // in milliseconds
  progressiveDelay: boolean;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  resetWindow: number; // in milliseconds
}

/**
 * Attack attempt tracking
 */
interface AttackAttempt {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  isLocked: boolean;
  lockoutUntil?: number;
  progressiveDelay: number;
}

/**
 * Default brute force protection configuration
 */
export const DEFAULT_BRUTE_FORCE_CONFIG: BruteForceConfig = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  progressiveDelay: true,
  baseDelay: 1000, // 1 second
  maxDelay: 60 * 1000, // 1 minute
  resetWindow: 60 * 60 * 1000, // 1 hour
};

/**
 * Brute force protection manager
 */
export class BruteForceProtection {
  private config: BruteForceConfig;
  private attemptStore: Map<string, AttackAttempt>;
  private lockoutStore: Map<string, number>;

  constructor(config: Partial<BruteForceConfig> = {}) {
    this.config = { ...DEFAULT_BRUTE_FORCE_CONFIG, ...config };
    this.attemptStore = new Map();
    this.lockoutStore = new Map();
  }

  /**
   * Check if an IP/user is currently locked out
   */
  isLockedOut(identifier: string): { locked: boolean; remainingTime?: number } {
    const lockoutUntil = this.lockoutStore.get(identifier);
    
    if (lockoutUntil && Date.now() < lockoutUntil) {
      return { 
        locked: true, 
        remainingTime: lockoutUntil - Date.now() 
      };
    }
    
    // Clean up expired lockouts
    if (lockoutUntil) {
      this.lockoutStore.delete(identifier);
    }
    
    return { locked: false };
  }

  /**
   * Record a failed attempt
   */
  recordFailedAttempt(identifier: string): {
    allowed: boolean;
    remainingAttempts: number;
    lockoutTime?: number;
    delayTime?: number;
  } {
    const now = Date.now();
    const attempt = this.attemptStore.get(identifier) || {
      count: 0,
      firstAttempt: now,
      lastAttempt: now,
      isLocked: false,
      progressiveDelay: 0,
    };

    // Reset if outside reset window
    if (now - attempt.firstAttempt > this.config.resetWindow) {
      attempt.count = 0;
      attempt.firstAttempt = now;
      attempt.progressiveDelay = 0;
    }

    attempt.count++;
    attempt.lastAttempt = now;

    // Calculate progressive delay
    if (this.config.progressiveDelay) {
      attempt.progressiveDelay = Math.min(
        this.config.baseDelay * Math.pow(2, attempt.count - 1),
        this.config.maxDelay
      );
    }

    // Check if max attempts reached
    if (attempt.count >= this.config.maxAttempts) {
      attempt.isLocked = true;
      const lockoutUntil = now + this.config.lockoutDuration;
      this.lockoutStore.set(identifier, lockoutUntil);
      
      this.attemptStore.set(identifier, attempt);
      
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutTime: lockoutUntil,
      };
    }

    this.attemptStore.set(identifier, attempt);

    return {
      allowed: true,
      remainingAttempts: this.config.maxAttempts - attempt.count,
      delayTime: attempt.progressiveDelay,
    };
  }

  /**
   * Record a successful attempt (reset counter)
   */
  recordSuccessfulAttempt(identifier: string): void {
    this.attemptStore.delete(identifier);
    this.lockoutStore.delete(identifier);
  }

  /**
   * Get attempt statistics for an identifier
   */
  getAttemptStats(identifier: string): {
    count: number;
    firstAttempt: number;
    lastAttempt: number;
    isLocked: boolean;
    lockoutUntil?: number;
    remainingAttempts: number;
  } {
    const attempt = this.attemptStore.get(identifier);
    const lockoutUntil = this.lockoutStore.get(identifier);
    
    if (!attempt) {
      return {
        count: 0,
        firstAttempt: 0,
        lastAttempt: 0,
        isLocked: false,
        remainingAttempts: this.config.maxAttempts,
      };
    }

    return {
      count: attempt.count,
      firstAttempt: attempt.firstAttempt,
      lastAttempt: attempt.lastAttempt,
      isLocked: attempt.isLocked || (lockoutUntil ? Date.now() < lockoutUntil : false),
      lockoutUntil,
      remainingAttempts: Math.max(0, this.config.maxAttempts - attempt.count),
    };
  }

  /**
   * Clean up expired attempts and lockouts
   */
  cleanup(): { attemptsRemoved: number; lockoutsRemoved: number } {
    const now = Date.now();
    let attemptsRemoved = 0;
    let lockoutsRemoved = 0;

    // Clean up expired attempts
    for (const [identifier, attempt] of this.attemptStore.entries()) {
      if (now - attempt.firstAttempt > this.config.resetWindow) {
        this.attemptStore.delete(identifier);
        attemptsRemoved++;
      }
    }

    // Clean up expired lockouts
    for (const [identifier, lockoutUntil] of this.lockoutStore.entries()) {
      if (now >= lockoutUntil) {
        this.lockoutStore.delete(identifier);
        lockoutsRemoved++;
      }
    }

    return { attemptsRemoved, lockoutsRemoved };
  }

  /**
   * Get overall statistics
   */
  getStats(): {
    totalAttempts: number;
    activeLockouts: number;
    topOffenders: Array<{ identifier: string; count: number }>;
  } {
    const topOffenders = Array.from(this.attemptStore.entries())
      .map(([identifier, attempt]) => ({ identifier, count: attempt.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalAttempts: this.attemptStore.size,
      activeLockouts: this.lockoutStore.size,
      topOffenders,
    };
  }

  /**
   * Manually unlock an identifier (admin function)
   */
  unlock(identifier: string): boolean {
    const hadAttempts = this.attemptStore.has(identifier);
    const hadLockout = this.lockoutStore.has(identifier);
    
    this.attemptStore.delete(identifier);
    this.lockoutStore.delete(identifier);
    
    return hadAttempts || hadLockout;
  }
}

/**
 * Global brute force protection instance
 */
export const bruteForceProtection = new BruteForceProtection();

/**
 * Enhanced rate limiting with brute force protection
 */
export function enhancedRateLimit(
  request: NextRequest,
  identifier: string,
  baseRateLimit: { allowed: boolean; remaining: number; resetTime: number }
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  bruteForceInfo?: {
    locked: boolean;
    remainingAttempts: number;
    lockoutTime?: number;
    delayTime?: number;
  };
} {
  // Check brute force protection first
  const lockoutCheck = bruteForceProtection.isLockedOut(identifier);
  
  if (lockoutCheck.locked) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: lockoutCheck.remainingTime!,
      bruteForceInfo: {
        locked: true,
        remainingAttempts: 0,
        lockoutTime: lockoutCheck.remainingTime,
      },
    };
  }

  // If base rate limit failed, record as failed attempt
  if (!baseRateLimit.allowed) {
    const attemptResult = bruteForceProtection.recordFailedAttempt(identifier);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: baseRateLimit.resetTime,
      bruteForceInfo: {
        locked: attemptResult.lockoutTime ? true : false,
        remainingAttempts: attemptResult.remainingAttempts,
        lockoutTime: attemptResult.lockoutTime,
        delayTime: attemptResult.delayTime,
      },
    };
  }

  // Success - reset brute force counter
  bruteForceProtection.recordSuccessfulAttempt(identifier);

  return {
    allowed: true,
    remaining: baseRateLimit.remaining,
    resetTime: baseRateLimit.resetTime,
  };
}

/**
 * Middleware for brute force protection
 */
export function bruteForceMiddleware(request: NextRequest): {
  allowed: boolean;
  reason?: string;
  remainingTime?: number;
} {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  const lockoutCheck = bruteForceProtection.isLockedOut(ip);
  
  if (lockoutCheck.locked) {
    return {
      allowed: false,
      reason: 'IP temporarily locked due to suspicious activity',
      remainingTime: lockoutCheck.remainingTime,
    };
  }

  return { allowed: true };
}

/**
 * Cleanup job for brute force protection
 */
export function runBruteForceCleanup(): { attemptsRemoved: number; lockoutsRemoved: number } {
  return bruteForceProtection.cleanup();
}

export default BruteForceProtection;
