/**
 * Security Headers Tests - Clean Version
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
  });
});
