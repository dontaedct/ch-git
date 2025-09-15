/**
 * @fileoverview Secure Session Management System
 * @module lib/security/session-management
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.7 - Implement secure session management
 * Focus: Comprehensive session security with timeout, validation, and monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (session security vulnerabilities)
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { createHash, randomBytes } from 'crypto';

/**
 * Session configuration
 */
export interface SessionConfig {
  maxAge: number; // in seconds
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
}

/**
 * Session data structure
 */
export interface SessionData {
  userId: string;
  sessionId: string;
  createdAt: number;
  lastAccessed: number;
  expiresAt: number;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  metadata?: Record<string, any>;
}

/**
 * Default session configuration
 */
export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  maxAge: 24 * 60 * 60, // 24 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
  sameSite: 'strict',
  path: '/',
};

/**
 * Session management utilities
 */
export class SecureSessionManager {
  private config: SessionConfig;
  private sessionStore: Map<string, SessionData>;

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_SESSION_CONFIG, ...config };
    this.sessionStore = new Map();
  }

  /**
   * Generate secure session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Create session hash for validation
   */
  private createSessionHash(sessionId: string, userId: string): string {
    const data = `${sessionId}:${userId}:${this.config.maxAge}`;
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Create a new session
   */
  createSession(userId: string, request: NextRequest): { sessionId: string; cookie: string } {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + (this.config.maxAge * 1000);

    const sessionData: SessionData = {
      userId,
      sessionId,
      createdAt: now,
      lastAccessed: now,
      expiresAt,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
      isActive: true,
    };

    // Store session data
    this.sessionStore.set(sessionId, sessionData);

    // Create session cookie
    const sessionHash = this.createSessionHash(sessionId, userId);
    const cookieValue = `${sessionId}:${sessionHash}`;
    
    const cookie = this.buildCookie('session', cookieValue, {
      maxAge: this.config.maxAge,
      secure: this.config.secure,
      httpOnly: this.config.httpOnly,
      sameSite: this.config.sameSite,
      path: this.config.path,
    });

    return { sessionId, cookie };
  }

  /**
   * Validate and refresh session
   */
  async validateSession(request: NextRequest): Promise<{ valid: boolean; sessionData?: SessionData; newCookie?: string }> {
    try {
      const cookieHeader = request.headers.get('cookie');
      if (!cookieHeader) {
        return { valid: false };
      }

      const sessionCookie = this.extractSessionCookie(cookieHeader);
      if (!sessionCookie) {
        return { valid: false };
      }

      const [sessionId, sessionHash] = sessionCookie.split(':');
      if (!sessionId || !sessionHash) {
        return { valid: false };
      }

      // Get session data
      const sessionData = this.sessionStore.get(sessionId);
      if (!sessionData) {
        return { valid: false };
      }

      // Check if session is expired
      if (Date.now() > sessionData.expiresAt) {
        this.sessionStore.delete(sessionId);
        return { valid: false };
      }

      // Check if session is active
      if (!sessionData.isActive) {
        return { valid: false };
      }

      // Validate session hash
      const expectedHash = this.createSessionHash(sessionId, sessionData.userId);
      if (sessionHash !== expectedHash) {
        this.sessionStore.delete(sessionId);
        return { valid: false };
      }

      // Check for session hijacking (IP/UserAgent change)
      const currentIP = this.getClientIP(request);
      const currentUserAgent = request.headers.get('user-agent') || 'unknown';
      
      if (currentIP !== sessionData.ipAddress || currentUserAgent !== sessionData.userAgent) {
        // Log suspicious activity
        console.warn('Session hijacking attempt detected', {
          sessionId,
          originalIP: sessionData.ipAddress,
          currentIP,
          originalUserAgent: sessionData.userAgent,
          currentUserAgent,
        });
        
        // Invalidate session for security
        this.sessionStore.delete(sessionId);
        return { valid: false };
      }

      // Update last accessed time
      sessionData.lastAccessed = Date.now();
      this.sessionStore.set(sessionId, sessionData);

      // Create new cookie with updated expiration
      const newCookie = this.buildCookie('session', sessionCookie, {
        maxAge: this.config.maxAge,
        secure: this.config.secure,
        httpOnly: this.config.httpOnly,
        sameSite: this.config.sameSite,
        path: this.config.path,
      });

      return { valid: true, sessionData, newCookie };
    } catch (error) {
      console.error('Session validation failed:', error);
      return { valid: false };
    }
  }

  /**
   * Invalidate session
   */
  invalidateSession(sessionId: string): boolean {
    if (this.sessionStore.has(sessionId)) {
      this.sessionStore.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * Invalidate all sessions for a user
   */
  invalidateUserSessions(userId: string): number {
    let count = 0;
    for (const [sessionId, sessionData] of this.sessionStore.entries()) {
      if (sessionData.userId === userId) {
        this.sessionStore.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let count = 0;
    
    for (const [sessionId, sessionData] of this.sessionStore.entries()) {
      if (now > sessionData.expiresAt) {
        this.sessionStore.delete(sessionId);
        count++;
      }
    }
    
    return count;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
    users: Set<string>;
  } {
    const now = Date.now();
    const stats = {
      totalSessions: this.sessionStore.size,
      activeSessions: 0,
      expiredSessions: 0,
      users: new Set<string>(),
    };

    for (const sessionData of this.sessionStore.values()) {
      stats.users.add(sessionData.userId);
      
      if (now > sessionData.expiresAt) {
        stats.expiredSessions++;
      } else if (sessionData.isActive) {
        stats.activeSessions++;
      }
    }

    return stats;
  }

  /**
   * Extract session cookie from cookie header
   */
  private extractSessionCookie(cookieHeader: string): string | null {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const sessionCookie = cookies.find(c => c.startsWith('session='));
    
    if (!sessionCookie) return null;
    
    return sessionCookie.split('=')[1];
  }

  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return request.ip || 'unknown';
  }

  /**
   * Build cookie string
   */
  private buildCookie(name: string, value: string, options: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    path: string;
  }): string {
    const parts = [`${name}=${value}`];
    
    if (options.maxAge > 0) {
      parts.push(`Max-Age=${options.maxAge}`);
    }
    
    if (options.path) {
      parts.push(`Path=${options.path}`);
    }
    
    if (options.secure) {
      parts.push('Secure');
    }
    
    if (options.httpOnly) {
      parts.push('HttpOnly');
    }
    
    if (options.sameSite) {
      parts.push(`SameSite=${options.sameSite}`);
    }
    
    return parts.join('; ');
  }
}

/**
 * Global session manager instance
 */
export const sessionManager = new SecureSessionManager();

/**
 * Session middleware for API routes
 */
export function sessionMiddleware(request: NextRequest): Promise<{
  valid: boolean;
  sessionData?: SessionData;
  newCookie?: string;
}> {
  return sessionManager.validateSession(request);
}

/**
 * Session cleanup job (run periodically)
 */
export function runSessionCleanup(): number {
  return sessionManager.cleanupExpiredSessions();
}

export default SecureSessionManager;
