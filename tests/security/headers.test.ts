/**
 * Security Headers Tests
 * 
 * Comprehensive tests for security headers middleware including CSP,
 * bot detection, risk assessment, and logging.
 */

import { NextRequest } from 'next/server';
import {
  generateNonce,
  detectBot,
  calculateRiskLevel,
  createSecurityContext,
  getContentSecurityPolicy,
  generateSecurityHeaders,
  securityHeadersMiddleware,
  SecurityContext
} from '../../lib/security/headers';

// Mock NextRequest
const createMockRequest = (options: {
  url?: string;
  headers?: Record<string, string>;
  method?: string;
}): NextRequest => {
  const { url = 'http://localhost:3000/', headers = {}, method = 'GET' } = options;
  
  const mockHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    mockHeaders.set(key, value);
  });
  
  return {
    url,
    headers: mockHeaders,
    method,
  } as NextRequest;
};

describe('Security Headers Module', () => {
  beforeEach(() => {
    // Reset environment variables
    delete process.env.NODE_ENV;
    delete process.env.VERCEL_ENV;
  });

  describe('generateNonce', () => {
    it('should generate unique nonces', () => {
      const nonce1 = generateNonce();
      const nonce2 = generateNonce();
      
      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
      expect(nonce1.length).toBeGreaterThan(0);
      expect(nonce2.length).toBeGreaterThan(0);
    });
    
    it('should generate base64-encoded strings', () => {
      const nonce = generateNonce();
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      expect(base64Pattern.test(nonce)).toBe(true);
    });
  });

  describe('detectBot', () => {
    it('should detect common bot user agents', () => {
      const botUserAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Twitterbot/1.0',
        'LinkedInBot/1.0',
        'WhatsApp/2.16.11',
        'curl/7.68.0',
        'python-requests/2.28.1',
        'axios/0.27.2'
      ];
      
      botUserAgents.forEach(ua => {
        expect(detectBot(ua)).toBe(true);
      });
    });
    
    it('should not detect legitimate browser user agents as bots', () => {
      const browserUserAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      ];
      
      browserUserAgents.forEach(ua => {
        expect(detectBot(ua)).toBe(false);
      });
    });
    
    it('should treat empty user agent as suspicious', () => {
      expect(detectBot('')).toBe(true);
      expect(detectBot(undefined as any)).toBe(true);
    });
  });

  describe('calculateRiskLevel', () => {
    it('should calculate low risk for normal requests', () => {
      const riskLevel = calculateRiskLevel(
        '192.168.1.1',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        '/dashboard',
        false
      );
      expect(riskLevel).toBe('low');
    });
    
    it('should calculate medium risk for bot requests', () => {
      const riskLevel = calculateRiskLevel(
        '203.0.113.1',
        'Googlebot/2.1',
        '/api/health',
        true
      );
      expect(riskLevel).toBe('medium');
    });
    
    it('should calculate high risk for suspicious patterns', () => {
      const riskLevel = calculateRiskLevel(
        '127.0.0.1',
        '',
        '/api/admin/../../../etc/passwd',
        true
      );
      expect(riskLevel).toBe('high');
    });
    
    it('should increase risk for high-risk routes', () => {
      const adminRisk = calculateRiskLevel(
        '203.0.113.1',
        'curl/7.68.0',
        '/api/admin/users',
        true
      );
      
      const regularRisk = calculateRiskLevel(
        '203.0.113.1',
        'curl/7.68.0',
        '/api/health',
        true
      );
      
      expect(adminRisk).toBe('high');
      expect(regularRisk).toBe('medium');
    });
  });

  describe('createSecurityContext', () => {
    it('should create security context from request', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/users',
        headers: {
          'x-forwarded-for': '203.0.113.1, 192.168.1.1',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const context = createSecurityContext(request);
      
      expect(context.ip).toBe('203.0.113.1');
      expect(context.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      expect(context.route).toBe('/api/admin/users');
      expect(context.isBot).toBe(false);
      expect(context.riskLevel).toBe('medium'); // Admin route increases risk
      expect(context.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms
    });
    
    it('should handle missing headers gracefully', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/dashboard'
      });
      
      const context = createSecurityContext(request);
      
      expect(context.ip).toBe('unknown');
      expect(context.userAgent).toBe('');
      expect(context.route).toBe('/dashboard');
      expect(context.isBot).toBe(true); // Empty user agent treated as bot
      expect(context.riskLevel).toBe('medium'); // Bot + no user agent
    });
  });

  describe('getContentSecurityPolicy', () => {
    it('should generate strict CSP for production', () => {
      process.env.NODE_ENV = 'production';
      const nonce = 'test-nonce-123';
      
      const csp = getContentSecurityPolicy(nonce);
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain(`'nonce-${nonce}'`);
      expect(csp).toContain("object-src 'none'");
      expect(csp).toContain("frame-ancestors 'none'");
      expect(csp).toContain('upgrade-insecure-requests');
      expect(csp).not.toContain("'unsafe-inline'");
      expect(csp).not.toContain("'unsafe-eval'");
    });
    
    it('should generate flexible CSP for development', () => {
      process.env.NODE_ENV = 'development';
      const nonce = 'test-nonce-123';
      
      const csp = getContentSecurityPolicy(nonce);
      
      expect(csp).toContain("default-src 'self'");
      expect(csp).toContain("'unsafe-inline'");
      expect(csp).toContain("'unsafe-eval'");
      expect(csp).not.toContain('upgrade-insecure-requests');
    });
    
    it('should allow required third-party services', () => {
      process.env.NODE_ENV = 'production';
      const csp = getContentSecurityPolicy('nonce');
      
      expect(csp).toContain('https://*.supabase.co');
      expect(csp).toContain('https://api.stripe.com');
      expect(csp).toContain('https://api.resend.com');
      expect(csp).toContain('https://*.sentry.io');
      expect(csp).toContain('https://js.stripe.com');
    });
  });

  describe('generateSecurityHeaders', () => {
    let mockContext: SecurityContext;
    
    beforeEach(() => {
      mockContext = {
        ip: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        route: '/dashboard',
        isBot: false,
        riskLevel: 'low',
        timestamp: Date.now()
      };
    });
    
    it('should generate all required security headers', () => {
      const headers = generateSecurityHeaders(mockContext);
      
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['Permissions-Policy']).toContain('camera=(), microphone=(), geolocation=()');
      expect(headers['X-DNS-Prefetch-Control']).toBe('off');
      expect(headers['X-Download-Options']).toBe('noopen');
      expect(headers['X-Permitted-Cross-Domain-Policies']).toBe('none');
    });
    
    it('should include HSTS in production', () => {
      process.env.NODE_ENV = 'production';
      const headers = generateSecurityHeaders(mockContext);
      
      expect(headers['Strict-Transport-Security']).toBe(
        'max-age=31536000; includeSubDomains; preload'
      );
    });
    
    it('should not include HSTS in development', () => {
      process.env.NODE_ENV = 'development';
      const headers = generateSecurityHeaders(mockContext);
      
      expect(headers['Strict-Transport-Security']).toBeUndefined();
    });
    
    it('should use stricter CSP for high-risk requests in production', () => {
      process.env.NODE_ENV = 'production';
      mockContext.riskLevel = 'high';
      
      const headers = generateSecurityHeaders(mockContext);
      const csp = headers['Content-Security-Policy'];
      
      expect(csp).toBeDefined();
      // High-risk requests get even stricter CSP (third-party domains removed)
      expect(csp).not.toContain('https://api.stripe.com');
    });
  });

  describe('securityHeadersMiddleware', () => {
    it('should process normal requests successfully', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/dashboard',
        headers: {
          'x-forwarded-for': '203.0.113.1',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(false);
      expect(result.blockReason).toBeUndefined();
      expect(result.context).toBeDefined();
      expect(result.headers).toBeDefined();
    });
    
    it('should block requests with malicious route patterns', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/../../../etc/passwd',
        headers: {
          'user-agent': 'curl/7.68.0'
        }
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(true);
      expect(result.blockReason).toBe('malicious_route_pattern');
    });
    
    it('should block requests with script injection patterns', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/search?q=<script>alert(1)</script>'
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(true);
      expect(result.blockReason).toBe('malicious_route_pattern');
    });
    
    it('should block requests with SQL injection patterns', () => {
      const request = createMockRequest({
        url: "http://localhost:3000/api/users?id=1' UNION SELECT * FROM users--"
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(true);
      expect(result.blockReason).toBe('malicious_route_pattern');
    });
    
    it('should block admin route access without user agent', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/users'
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(true);
      expect(result.blockReason).toBe('no_user_agent_admin_route');
    });
    
    it('should allow admin route access with user agent', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/api/admin/users',
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const result = securityHeadersMiddleware(request);
      
      expect(result.shouldBlock).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle IPv6 addresses', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '2001:db8:85a3::8a2e:370:7334'
        }
      });
      
      const context = createSecurityContext(request);
      expect(context.ip).toBe('2001:db8:85a3::8a2e:370:7334');
    });
    
    it('should handle multiple forwarded IPs', () => {
      const request = createMockRequest({
        headers: {
          'x-forwarded-for': '203.0.113.1, 192.168.1.1, 10.0.0.1'
        }
      });
      
      const context = createSecurityContext(request);
      expect(context.ip).toBe('203.0.113.1'); // First IP in chain
    });
    
    it('should handle very long user agent strings', () => {
      const longUserAgent = 'A'.repeat(1000);
      const request = createMockRequest({
        headers: {
          'user-agent': longUserAgent
        }
      });
      
      const context = createSecurityContext(request);
      expect(context.userAgent).toBe(longUserAgent);
      expect(context.riskLevel).toBe('medium'); // Long UA increases risk
    });
    
    it('should handle URLs with query parameters and fragments', () => {
      const request = createMockRequest({
        url: 'http://localhost:3000/search?q=test&page=1#results'
      });
      
      const context = createSecurityContext(request);
      expect(context.route).toBe('/search');
    });
  });
});