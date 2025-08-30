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
      ];\n      \n      browserUserAgents.forEach(ua => {\n        expect(detectBot(ua)).toBe(false);\n      });\n    });\n    \n    it('should treat empty user agent as suspicious', () => {\n      expect(detectBot('')).toBe(true);\n      expect(detectBot(undefined as any)).toBe(true);\n    });\n  });\n\n  describe('calculateRiskLevel', () => {\n    it('should calculate low risk for normal requests', () => {\n      const riskLevel = calculateRiskLevel(\n        '192.168.1.1',\n        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',\n        '/dashboard',\n        false\n      );\n      expect(riskLevel).toBe('low');\n    });\n    \n    it('should calculate medium risk for bot requests', () => {\n      const riskLevel = calculateRiskLevel(\n        '203.0.113.1',\n        'Googlebot/2.1',\n        '/api/health',\n        true\n      );\n      expect(riskLevel).toBe('medium');\n    });\n    \n    it('should calculate high risk for suspicious patterns', () => {\n      const riskLevel = calculateRiskLevel(\n        '127.0.0.1',\n        '',\n        '/api/admin/../../../etc/passwd',\n        true\n      );\n      expect(riskLevel).toBe('high');\n    });\n    \n    it('should increase risk for high-risk routes', () => {\n      const adminRisk = calculateRiskLevel(\n        '203.0.113.1',\n        'curl/7.68.0',\n        '/api/admin/users',\n        true\n      );\n      \n      const regularRisk = calculateRiskLevel(\n        '203.0.113.1',\n        'curl/7.68.0',\n        '/api/health',\n        true\n      );\n      \n      expect(adminRisk).toBe('high');\n      expect(regularRisk).toBe('medium');\n    });\n  });\n\n  describe('createSecurityContext', () => {\n    it('should create security context from request', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/api/admin/users',\n        headers: {\n          'x-forwarded-for': '203.0.113.1, 192.168.1.1',\n          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'\n        }\n      });\n      \n      const context = createSecurityContext(request);\n      \n      expect(context.ip).toBe('203.0.113.1');\n      expect(context.userAgent).toBe('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');\n      expect(context.route).toBe('/api/admin/users');\n      expect(context.isBot).toBe(false);\n      expect(context.riskLevel).toBe('medium'); // Admin route increases risk\n      expect(context.timestamp).toBeCloseTo(Date.now(), -2); // Within 100ms\n    });\n    \n    it('should handle missing headers gracefully', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/dashboard'\n      });\n      \n      const context = createSecurityContext(request);\n      \n      expect(context.ip).toBe('unknown');\n      expect(context.userAgent).toBe('');\n      expect(context.route).toBe('/dashboard');\n      expect(context.isBot).toBe(true); // Empty user agent treated as bot\n      expect(context.riskLevel).toBe('medium'); // Bot + no user agent\n    });\n  });\n\n  describe('getContentSecurityPolicy', () => {\n    it('should generate strict CSP for production', () => {\n      process.env.NODE_ENV = 'production';\n      const nonce = 'test-nonce-123';\n      \n      const csp = getContentSecurityPolicy(nonce);\n      \n      expect(csp).toContain(\"default-src 'self'\");\n      expect(csp).toContain(`'nonce-${nonce}'`);\n      expect(csp).toContain(\"object-src 'none'\");\n      expect(csp).toContain(\"frame-ancestors 'none'\");\n      expect(csp).toContain('upgrade-insecure-requests');\n      expect(csp).not.toContain(\"'unsafe-inline'\");\n      expect(csp).not.toContain(\"'unsafe-eval'\");\n    });\n    \n    it('should generate flexible CSP for development', () => {\n      process.env.NODE_ENV = 'development';\n      const nonce = 'test-nonce-123';\n      \n      const csp = getContentSecurityPolicy(nonce);\n      \n      expect(csp).toContain(\"default-src 'self'\");\n      expect(csp).toContain(\"'unsafe-inline'\");\n      expect(csp).toContain(\"'unsafe-eval'\");\n      expect(csp).not.toContain('upgrade-insecure-requests');\n    });\n    \n    it('should allow required third-party services', () => {\n      process.env.NODE_ENV = 'production';\n      const csp = getContentSecurityPolicy('nonce');\n      \n      expect(csp).toContain('https://*.supabase.co');\n      expect(csp).toContain('https://api.stripe.com');\n      expect(csp).toContain('https://api.resend.com');\n      expect(csp).toContain('https://*.sentry.io');\n      expect(csp).toContain('https://js.stripe.com');\n    });\n  });\n\n  describe('generateSecurityHeaders', () => {\n    let mockContext: SecurityContext;\n    \n    beforeEach(() => {\n      mockContext = {\n        ip: '203.0.113.1',\n        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',\n        route: '/dashboard',\n        isBot: false,\n        riskLevel: 'low',\n        timestamp: Date.now()\n      };\n    });\n    \n    it('should generate all required security headers', () => {\n      const headers = generateSecurityHeaders(mockContext);\n      \n      expect(headers['X-Content-Type-Options']).toBe('nosniff');\n      expect(headers['X-Frame-Options']).toBe('DENY');\n      expect(headers['X-XSS-Protection']).toBe('1; mode=block');\n      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');\n      expect(headers['Permissions-Policy']).toContain('camera=(), microphone=(), geolocation=()');\n      expect(headers['X-DNS-Prefetch-Control']).toBe('off');\n      expect(headers['X-Download-Options']).toBe('noopen');\n      expect(headers['X-Permitted-Cross-Domain-Policies']).toBe('none');\n    });\n    \n    it('should include HSTS in production', () => {\n      process.env.NODE_ENV = 'production';\n      const headers = generateSecurityHeaders(mockContext);\n      \n      expect(headers['Strict-Transport-Security']).toBe(\n        'max-age=31536000; includeSubDomains; preload'\n      );\n    });\n    \n    it('should not include HSTS in development', () => {\n      process.env.NODE_ENV = 'development';\n      const headers = generateSecurityHeaders(mockContext);\n      \n      expect(headers['Strict-Transport-Security']).toBeUndefined();\n    });\n    \n    it('should use stricter CSP for high-risk requests in production', () => {\n      process.env.NODE_ENV = 'production';\n      mockContext.riskLevel = 'high';\n      \n      const headers = generateSecurityHeaders(mockContext);\n      const csp = headers['Content-Security-Policy'];\n      \n      expect(csp).toBeDefined();\n      // High-risk requests get even stricter CSP (third-party domains removed)\n      expect(csp).not.toContain('https://api.stripe.com');\n    });\n  });\n\n  describe('securityHeadersMiddleware', () => {\n    it('should process normal requests successfully', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/dashboard',\n        headers: {\n          'x-forwarded-for': '203.0.113.1',\n          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'\n        }\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(false);\n      expect(result.blockReason).toBeUndefined();\n      expect(result.context).toBeDefined();\n      expect(result.headers).toBeDefined();\n    });\n    \n    it('should block requests with malicious route patterns', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/api/../../../etc/passwd',\n        headers: {\n          'user-agent': 'curl/7.68.0'\n        }\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(true);\n      expect(result.blockReason).toBe('malicious_route_pattern');\n    });\n    \n    it('should block requests with script injection patterns', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/search?q=<script>alert(1)</script>'\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(true);\n      expect(result.blockReason).toBe('malicious_route_pattern');\n    });\n    \n    it('should block requests with SQL injection patterns', () => {\n      const request = createMockRequest({\n        url: \"http://localhost:3000/api/users?id=1' UNION SELECT * FROM users--\"\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(true);\n      expect(result.blockReason).toBe('malicious_route_pattern');\n    });\n    \n    it('should block admin route access without user agent', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/api/admin/users'\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(true);\n      expect(result.blockReason).toBe('no_user_agent_admin_route');\n    });\n    \n    it('should allow admin route access with user agent', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/api/admin/users',\n        headers: {\n          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'\n        }\n      });\n      \n      const result = securityHeadersMiddleware(request);\n      \n      expect(result.shouldBlock).toBe(false);\n    });\n  });\n\n  describe('Edge Cases', () => {\n    it('should handle IPv6 addresses', () => {\n      const request = createMockRequest({\n        headers: {\n          'x-forwarded-for': '2001:db8:85a3::8a2e:370:7334'\n        }\n      });\n      \n      const context = createSecurityContext(request);\n      expect(context.ip).toBe('2001:db8:85a3::8a2e:370:7334');\n    });\n    \n    it('should handle multiple forwarded IPs', () => {\n      const request = createMockRequest({\n        headers: {\n          'x-forwarded-for': '203.0.113.1, 192.168.1.1, 10.0.0.1'\n        }\n      });\n      \n      const context = createSecurityContext(request);\n      expect(context.ip).toBe('203.0.113.1'); // First IP in chain\n    });\n    \n    it('should handle very long user agent strings', () => {\n      const longUserAgent = 'A'.repeat(1000);\n      const request = createMockRequest({\n        headers: {\n          'user-agent': longUserAgent\n        }\n      });\n      \n      const context = createSecurityContext(request);\n      expect(context.userAgent).toBe(longUserAgent);\n      expect(context.riskLevel).toBe('medium'); // Long UA increases risk\n    });\n    \n    it('should handle URLs with query parameters and fragments', () => {\n      const request = createMockRequest({\n        url: 'http://localhost:3000/search?q=test&page=1#results'\n      });\n      \n      const context = createSecurityContext(request);\n      expect(context.route).toBe('/search');\n    });\n  });\n});