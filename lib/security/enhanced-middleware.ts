/**
 * HT-004.5.5: Enhanced Security Middleware & TLS Configuration
 * Advanced security headers, TLS enforcement, and threat protection
 * Created: 2025-09-08T22:21:49.000Z
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, createHmac, randomBytes } from 'crypto';

// =============================================================================
// SECURITY CONFIGURATION INTERFACES
// =============================================================================

export interface SecurityConfig {
  enforceHttps: boolean;
  hstsMaxAge: number;
  cspDirectives: string[];
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  threatProtection: {
    enabled: boolean;
    blockSuspiciousIPs: boolean;
    scanUserAgents: boolean;
    detectBots: boolean;
  };
  encryption: {
    enforceTLS: boolean;
    minTLSVersion: string;
    cipherSuites: string[];
  };
}

export interface ThreatDetectionResult {
  isThreat: boolean;
  threatType?: string;
  confidence: number;
  action: 'allow' | 'block' | 'challenge';
  metadata: Record<string, any>;
}

export interface SecurityHeaders {
  [key: string]: string;
}

// =============================================================================
// DEFAULT SECURITY CONFIGURATION
// =============================================================================

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  enforceHttps: true,
  hstsMaxAge: 31536000, // 1 year
  cspDirectives: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self'",
  ],
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 900000, // 15 minutes
  },
  threatProtection: {
    enabled: true,
    blockSuspiciousIPs: true,
    scanUserAgents: true,
    detectBots: true,
  },
  encryption: {
    enforceTLS: true,
    minTLSVersion: '1.2',
    cipherSuites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
    ],
  },
};

// =============================================================================
// THREAT DETECTION SYSTEM
// =============================================================================

export class ThreatDetectionService {
  private suspiciousPatterns: RegExp[];
  private botUserAgents: RegExp[];
  private maliciousIPs: Set<string>;
  
  constructor() {
    this.suspiciousPatterns = [
      /(\.\.\/)|(\.\.\\)/g, // Directory traversal
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // XSS patterns
      /(\b(union|select|drop|insert|update|delete)\b)/gi, // SQL injection
    ];
    this.botUserAgents = [
      /bot|crawler|spider|crawling/i,
      /googlebot|bingbot|slurp|duckduckbot/i,
    ];
    this.maliciousIPs = new Set();
  }
  
  /**
   * Analyze request for threats
   */
  analyzeRequest(request: NextRequest): ThreatDetectionResult {
    const url = request.url;
    const userAgent = request.headers.get('user-agent') || '';
    const ip = this.getClientIP(request);
    const referer = request.headers.get('referer') || '';
    
    // Check for suspicious patterns in URL
    const urlThreat = this.checkSuspiciousPatterns(url);
    if (urlThreat.isThreat) {
      return urlThreat;
    }
    
    // Check for bot behavior
    const botThreat = this.checkBotBehavior(userAgent, request);
    if (botThreat.isThreat) {
      return botThreat;
    }
    
    // Check for malicious IP
    if (this.maliciousIPs.has(ip)) {
      return {
        isThreat: true,
        threatType: 'malicious_ip',
        confidence: 0.9,
        action: 'block',
        metadata: { ip, reason: 'Known malicious IP address' },
      };
    }
    
    // Check for suspicious referer
    const refererThreat = this.checkSuspiciousReferer(referer);
    if (refererThreat.isThreat) {
      return refererThreat;
    }
    
    return {
      isThreat: false,
      confidence: 0.0,
      action: 'allow',
      metadata: {},
    };
  }
  
  /**
   * Check for suspicious patterns in text
   */
  private checkSuspiciousPatterns(text: string): ThreatDetectionResult {
    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(text)) {
        return {
          isThreat: true,
          threatType: 'suspicious_pattern',
          confidence: 0.8,
          action: 'block',
          metadata: {
            pattern: pattern.source,
            matchedText: text.match(pattern)?.[0],
          },
        };
      }
    }
    
    return {
      isThreat: false,
      confidence: 0.0,
      action: 'allow',
      metadata: {},
    };
  }
  
  /**
   * Check for bot behavior
   */
  private checkBotBehavior(userAgent: string, request: NextRequest): ThreatDetectionResult {
    // Check user agent
    for (const botPattern of this.botUserAgents) {
      if (botPattern.test(userAgent)) {
        return {
          isThreat: true,
          threatType: 'bot_detected',
          confidence: 0.7,
          action: 'challenge',
          metadata: {
            userAgent,
            botType: 'automated',
          },
        };
      }
    }
    
    // Check for missing common headers
    const acceptLanguage = request.headers.get('accept-language');
    const acceptEncoding = request.headers.get('accept-encoding');
    
    if (!acceptLanguage || !acceptEncoding) {
      return {
        isThreat: true,
        threatType: 'suspicious_headers',
        confidence: 0.6,
        action: 'challenge',
        metadata: {
          missingHeaders: {
            acceptLanguage: !acceptLanguage,
            acceptEncoding: !acceptEncoding,
          },
        },
      };
    }
    
    return {
      isThreat: false,
      confidence: 0.0,
      action: 'allow',
      metadata: {},
    };
  }
  
  /**
   * Check for suspicious referer
   */
  private checkSuspiciousReferer(referer: string): ThreatDetectionResult {
    if (!referer) {
      return {
        isThreat: false,
        confidence: 0.0,
        action: 'allow',
        metadata: {},
      };
    }
    
    // Check for suspicious domains
    const suspiciousDomains = [
      'malicious-site.com',
      'phishing-site.net',
      'spam-domain.org',
    ];
    
    for (const domain of suspiciousDomains) {
      if (referer.includes(domain)) {
        return {
          isThreat: true,
          threatType: 'suspicious_referer',
          confidence: 0.8,
          action: 'block',
          metadata: {
            referer,
            suspiciousDomain: domain,
          },
        };
      }
    }
    
    return {
      isThreat: false,
      confidence: 0.0,
      action: 'allow',
      metadata: {},
    };
  }
  
  /**
   * Get client IP address
   */
  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnectingIP = request.headers.get('cf-connecting-ip');
    
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(',')[0].trim();
    
    return 'unknown';
  }
  
  /**
   * Add malicious IP to blocklist
   */
  addMaliciousIP(ip: string): void {
    this.maliciousIPs.add(ip);
  }
  
  /**
   * Remove IP from blocklist
   */
  removeMaliciousIP(ip: string): void {
    this.maliciousIPs.delete(ip);
  }
  
  /**
   * Get all malicious IPs
   */
  getMaliciousIPs(): string[] {
    return Array.from(this.maliciousIPs);
  }
}

// =============================================================================
// RATE LIMITING SERVICE
// =============================================================================

export class RateLimitingService {
  private requests: Map<string, { count: number; resetTime: number }>;
  private config: SecurityConfig['rateLimiting'];
  
  constructor(config: SecurityConfig['rateLimiting']) {
    this.config = config;
    this.requests = new Map();
  }
  
  /**
   * Check if request is within rate limit
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    if (!this.config.enabled) {
      return { allowed: true, remaining: this.config.maxRequests, resetTime: Date.now() };
    }
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Clean up expired entries
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime < windowStart) {
        this.requests.delete(key);
      }
    }
    
    const current = this.requests.get(identifier);
    
    if (!current || current.resetTime < windowStart) {
      // New window or expired
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
      };
    }
    
    if (current.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }
    
    // Increment counter
    current.count++;
    this.requests.set(identifier, current);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - current.count,
      resetTime: current.resetTime,
    };
  }
  
  /**
   * Get rate limit info for identifier
   */
  getRateLimitInfo(identifier: string): { count: number; limit: number; resetTime: number } {
    const current = this.requests.get(identifier);
    
    if (!current) {
      return {
        count: 0,
        limit: this.config.maxRequests,
        resetTime: Date.now() + this.config.windowMs,
      };
    }
    
    return {
      count: current.count,
      limit: this.config.maxRequests,
      resetTime: current.resetTime,
    };
  }
}

// =============================================================================
// ENHANCED SECURITY MIDDLEWARE
// =============================================================================

export class EnhancedSecurityMiddleware {
  private config: SecurityConfig;
  private threatDetection: ThreatDetectionService;
  private rateLimiting: RateLimitingService;
  
  constructor(config: SecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.config = config;
    this.threatDetection = new ThreatDetectionService();
    this.rateLimiting = new RateLimitingService(config.rateLimiting);
  }
  
  /**
   * Process request through security middleware
   */
  async processRequest(request: NextRequest): Promise<{
    response?: NextResponse;
    headers: SecurityHeaders;
    shouldBlock: boolean;
    blockReason?: string;
  }> {
    const headers: SecurityHeaders = {};
    let shouldBlock = false;
    let blockReason: string | undefined;
    
    // 1. HTTPS Enforcement
    if (this.config.enforceHttps && request.headers.get('x-forwarded-proto') !== 'https') {
      shouldBlock = true;
      blockReason = 'HTTPS required';
    }
    
    // 2. Threat Detection
    if (this.config.threatProtection.enabled && !shouldBlock) {
      const threatResult = this.threatDetection.analyzeRequest(request);
      
      if (threatResult.isThreat) {
        shouldBlock = threatResult.action === 'block';
        blockReason = `Threat detected: ${threatResult.threatType}`;
        
        // Log threat for analysis
        console.warn('Security threat detected:', {
          url: request.url,
          threatType: threatResult.threatType,
          confidence: threatResult.confidence,
          metadata: threatResult.metadata,
        });
      }
    }
    
    // 3. Rate Limiting
    if (this.config.rateLimiting.enabled && !shouldBlock) {
      const clientIP = this.threatDetection['getClientIP'](request);
      const rateLimitResult = this.rateLimiting.isAllowed(clientIP);
      
      if (!rateLimitResult.allowed) {
        shouldBlock = true;
        blockReason = 'Rate limit exceeded';
        
        // Add rate limit headers
        headers['X-RateLimit-Limit'] = this.config.rateLimiting.maxRequests.toString();
        headers['X-RateLimit-Remaining'] = rateLimitResult.remaining.toString();
        headers['X-RateLimit-Reset'] = new Date(rateLimitResult.resetTime).toISOString();
      }
    }
    
    // 4. Generate Security Headers
    const securityHeaders = this.generateSecurityHeaders(request);
    Object.assign(headers, securityHeaders);
    
    // 5. Create response if blocked
    let response: NextResponse | undefined;
    if (shouldBlock) {
      response = new NextResponse('Access Denied', {
        status: 403,
        headers: {
          'Content-Type': 'text/plain',
          ...headers,
        },
      });
    }
    
    return {
      response,
      headers,
      shouldBlock,
      blockReason,
    };
  }
  
  /**
   * Generate comprehensive security headers
   */
  private generateSecurityHeaders(request: NextRequest): SecurityHeaders {
    const headers: SecurityHeaders = {};
    
    // Content Security Policy
    headers['Content-Security-Policy'] = this.config.cspDirectives.join('; ');
    
    // HTTP Strict Transport Security
    if (this.config.enforceHttps) {
      headers['Strict-Transport-Security'] = `max-age=${this.config.hstsMaxAge}; includeSubDomains; preload`;
    }
    
    // Frame Options
    headers['X-Frame-Options'] = 'DENY';
    
    // Content Type Options
    headers['X-Content-Type-Options'] = 'nosniff';
    
    // XSS Protection
    headers['X-XSS-Protection'] = '1; mode=block';
    
    // Referrer Policy
    headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
    
    // Permissions Policy
    headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()';
    
    // Cross-Origin Policies
    headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
    headers['Cross-Origin-Opener-Policy'] = 'same-origin';
    headers['Cross-Origin-Resource-Policy'] = 'same-origin';
    
    // Additional security headers
    headers['X-DNS-Prefetch-Control'] = 'off';
    headers['X-Download-Options'] = 'noopen';
    headers['X-Permitted-Cross-Domain-Policies'] = 'none';
    
    // Cache Control for sensitive pages
    if (this.isSensitivePath(request.nextUrl.pathname)) {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    return headers;
  }
  
  /**
   * Check if path contains sensitive information
   */
  private isSensitivePath(pathname: string): boolean {
    const sensitivePaths = [
      '/api/auth',
      '/api/admin',
      '/dashboard',
      '/profile',
      '/settings',
      '/billing',
    ];
    
    return sensitivePaths.some(path => pathname.startsWith(path));
  }
  
  /**
   * Update security configuration
   */
  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.rateLimiting) {
      this.rateLimiting = new RateLimitingService(newConfig.rateLimiting);
    }
  }
  
  /**
   * Get current security configuration
   */
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
  
  /**
   * Get threat detection service
   */
  getThreatDetection(): ThreatDetectionService {
    return this.threatDetection;
  }
  
  /**
   * Get rate limiting service
   */
  getRateLimiting(): RateLimitingService {
    return this.rateLimiting;
  }
}

// =============================================================================
// TLS/SSL CONFIGURATION UTILITIES
// =============================================================================

export class TLSConfigurationManager {
  private config: SecurityConfig['encryption'];
  
  constructor(config: SecurityConfig['encryption']) {
    this.config = config;
  }
  
  /**
   * Generate TLS configuration for Node.js
   */
  generateTLSConfig(): any {
    return {
      secureProtocol: `TLSv${this.config.minTLSVersion.replace('.', '_')}_method`,
      ciphers: this.config.cipherSuites.join(':'),
      honorCipherOrder: true,
      secureOptions: require('constants').SSL_OP_NO_SSLv2 | require('constants').SSL_OP_NO_SSLv3,
    };
  }
  
  /**
   * Generate TLS configuration for Nginx
   */
  generateNginxTLSConfig(): string {
    return `
# TLS Configuration
ssl_protocols ${this.config.minTLSVersion} TLSv1.3;
ssl_ciphers ${this.config.cipherSuites.join(':')};
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;

# Security headers
add_header Strict-Transport-Security "max-age=${DEFAULT_SECURITY_CONFIG.hstsMaxAge}; includeSubDomains; preload" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    `.trim();
  }
  
  /**
   * Generate TLS configuration for Apache
   */
  generateApacheTLSConfig(): string {
    return `
# TLS Configuration
SSLProtocol ${this.config.minTLSVersion} +TLSv1.3
SSLCipherSuite ${this.config.cipherSuites.join(':')}
SSLHonorCipherOrder on
SSLCompression off
SSLSessionCache shmcb:/var/cache/mod_ssl/scache(512000)
SSLSessionCacheTimeout 300

# Security headers
Header always set Strict-Transport-Security "max-age=${DEFAULT_SECURITY_CONFIG.hstsMaxAge}; includeSubDomains; preload"
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
    `.trim();
  }
  
  /**
   * Validate TLS certificate
   */
  validateCertificate(certPath: string, keyPath: string): Promise<{ valid: boolean; errors: string[] }> {
    return new Promise((resolve) => {
      const fs = require('fs');
      const errors: string[] = [];
      
      try {
        // Check if files exist
        if (!fs.existsSync(certPath)) {
          errors.push(`Certificate file not found: ${certPath}`);
        }
        
        if (!fs.existsSync(keyPath)) {
          errors.push(`Private key file not found: ${keyPath}`);
        }
        
        if (errors.length > 0) {
          resolve({ valid: false, errors });
          return;
        }
        
        // Basic validation (in production, use proper certificate validation)
        const cert = fs.readFileSync(certPath, 'utf8');
        const key = fs.readFileSync(keyPath, 'utf8');
        
        if (!cert.includes('BEGIN CERTIFICATE')) {
          errors.push('Invalid certificate format');
        }
        
        if (!key.includes('BEGIN PRIVATE KEY') && !key.includes('BEGIN RSA PRIVATE KEY')) {
          errors.push('Invalid private key format');
        }
        
        resolve({ valid: errors.length === 0, errors });
      } catch (error) {
        resolve({ valid: false, errors: [`Certificate validation error: ${error}`] });
      }
    });
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createSecurityMiddleware(config?: Partial<SecurityConfig>): EnhancedSecurityMiddleware {
  const fullConfig = { ...DEFAULT_SECURITY_CONFIG, ...config };
  return new EnhancedSecurityMiddleware(fullConfig);
}

export function createTLSManager(config?: Partial<SecurityConfig['encryption']>): TLSConfigurationManager {
  const fullConfig = { ...DEFAULT_SECURITY_CONFIG.encryption, ...config };
  return new TLSConfigurationManager(fullConfig);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  createSecurityMiddleware,
  createTLSManager,
  DEFAULT_SECURITY_CONFIG,
};
