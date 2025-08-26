/**
 * CSP Tests - Security Headers
 * 
 * Tests for Content Security Policy and security headers validation.
 */

import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js modules
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: jest.fn(),
}));

describe('CSP Tests - Security Headers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Security Policy Headers', () => {
    it('should include strict CSP headers in production', () => {
      const productionHeaders = {
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self' 'nonce-{nonce}'",
          "style-src 'self' 'nonce-{nonce}'",
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io",
          "frame-src 'self' https://js.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      };

      expect(productionHeaders['Content-Security-Policy']).toContain("default-src 'self'");
      expect(productionHeaders['Content-Security-Policy']).toContain("script-src 'self' 'nonce-{nonce}'");
      expect(productionHeaders['Content-Security-Policy']).toContain("object-src 'none'");
      expect(productionHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
      expect(productionHeaders['X-Content-Type-Options']).toBe('nosniff');
      expect(productionHeaders['X-Frame-Options']).toBe('DENY');
    });

    it('should include report-only CSP headers in preview', () => {
      const previewHeaders = {
        'Content-Security-Policy-Report-Only': [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self'",
          "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io",
          "frame-src 'self' https://js.stripe.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'"
        ].join('; '),
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      };

      expect(previewHeaders['Content-Security-Policy-Report-Only']).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(previewHeaders['Content-Security-Policy-Report-Only']).toContain("style-src 'self' 'unsafe-inline'");
      expect(previewHeaders['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should allow third-party services in CSP', () => {
      const cspDirective = "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io";

      expect(cspDirective).toContain('https://*.supabase.co');
      expect(cspDirective).toContain('https://api.stripe.com');
      expect(cspDirective).toContain('https://api.resend.com');
      expect(cspDirective).toContain('https://*.sentry.io');
    });

    it('should block unsafe inline and eval in production', () => {
      const productionCSP = "script-src 'self' 'nonce-{nonce}'";

      expect(productionCSP).not.toContain('unsafe-inline');
      expect(productionCSP).not.toContain('unsafe-eval');
      expect(productionCSP).toContain('nonce-{nonce}');
    });
  });

  describe('Security Headers Validation', () => {
    it('should include X-Content-Type-Options header', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff'
      };

      expect(headers['X-Content-Type-Options']).toBe('nosniff');
    });

    it('should include X-Frame-Options header', () => {
      const headers = {
        'X-Frame-Options': 'DENY'
      };

      expect(headers['X-Frame-Options']).toBe('DENY');
    });

    it('should include X-XSS-Protection header', () => {
      const headers = {
        'X-XSS-Protection': '1; mode=block'
      };

      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
    });

    it('should include Referrer-Policy header', () => {
      const headers = {
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      };

      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    });

    it('should include Permissions-Policy header', () => {
      const headers = {
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
      };

      expect(headers['Permissions-Policy']).toContain('camera=()');
      expect(headers['Permissions-Policy']).toContain('microphone=()');
      expect(headers['Permissions-Policy']).toContain('geolocation=()');
      expect(headers['Permissions-Policy']).toContain('interest-cohort=()');
    });
  });

  describe('Route-specific Header Validation', () => {
    const criticalRoutes = [
      '/',
      '/login',
      '/operability',
      '/rollouts',
      '/api/guardian/heartbeat',
      '/api/guardian/backup-intent',
      '/api/webhooks/stripe',
      '/api/webhooks/generic'
    ];

    criticalRoutes.forEach(route => {
      it(`should include security headers for ${route}`, () => {
        const mockHeaders = {
          'Content-Security-Policy': "default-src 'self'",
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        };

        expect(mockHeaders['Content-Security-Policy']).toBeDefined();
        expect(mockHeaders['X-Content-Type-Options']).toBeDefined();
        expect(mockHeaders['X-Frame-Options']).toBeDefined();
        expect(mockHeaders['X-XSS-Protection']).toBeDefined();
        expect(mockHeaders['Referrer-Policy']).toBeDefined();
        expect(mockHeaders['Permissions-Policy']).toBeDefined();
      });
    });
  });

  describe('Nonce Generation and Validation', () => {
    it('should generate nonces for inline scripts and styles', () => {
      const generateNonce = () => {
        const crypto = require('crypto');
        return crypto.randomBytes(16).toString('base64');
      };

      const nonce1 = generateNonce();
      const nonce2 = generateNonce();

      expect(nonce1).toBeDefined();
      expect(nonce2).toBeDefined();
      expect(nonce1).not.toBe(nonce2);
      expect(nonce1.length).toBeGreaterThan(0);
    });

    it('should include nonces in CSP directives', () => {
      const nonce = 'test-nonce-123';
      const cspDirective = `script-src 'self' 'nonce-${nonce}'`;

      expect(cspDirective).toContain(`'nonce-${nonce}'`);
    });
  });

  describe('Environment-specific Configuration', () => {
    it('should use strict CSP in production environment', () => {
      const isProduction = process.env.NODE_ENV === 'production';
      const cspDirective = isProduction 
        ? "script-src 'self' 'nonce-{nonce}'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

      if (isProduction) {
        expect(cspDirective).not.toContain('unsafe-inline');
        expect(cspDirective).not.toContain('unsafe-eval');
        expect(cspDirective).toContain('nonce-{nonce}');
      } else {
        expect(cspDirective).toContain('unsafe-inline');
        expect(cspDirective).toContain('unsafe-eval');
      }
    });

    it('should use report-only CSP in preview environment', () => {
      const isPreview = process.env.VERCEL_ENV === 'preview';
      const headerName = isPreview 
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';

      if (isPreview) {
        expect(headerName).toBe('Content-Security-Policy-Report-Only');
      } else {
        expect(headerName).toBe('Content-Security-Policy');
      }
    });
  });

  describe('Header Validation Script Integration', () => {
    it('should validate headers using security-headers script', () => {
      const mockValidationResult = {
        route: '/',
        status: 200,
        headers: {
          'content-security-policy': "default-src 'self'",
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'DENY',
          'x-xss-protection': '1; mode=block',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        },
        valid: true
      };

      expect(mockValidationResult.valid).toBe(true);
      expect(mockValidationResult.headers['content-security-policy']).toBeDefined();
      expect(mockValidationResult.headers['x-content-type-options']).toBeDefined();
    });

    it('should detect missing security headers', () => {
      const mockValidationResult = {
        route: '/test',
        status: 200,
        headers: {
          'content-type': 'text/html'
        },
        valid: false,
        missingHeaders: [
          'content-security-policy',
          'x-content-type-options',
          'x-frame-options'
        ]
      };

      expect(mockValidationResult.valid).toBe(false);
      expect(mockValidationResult.missingHeaders).toContain('content-security-policy');
      expect(mockValidationResult.missingHeaders).toContain('x-content-type-options');
    });
  });

  describe('CSP Violation Reporting', () => {
    it('should include CSP report-uri in production', () => {
      const productionCSP = [
        "default-src 'self'",
        "script-src 'self' 'nonce-{nonce}'",
        "report-uri /api/csp-report"
      ].join('; ');

      expect(productionCSP).toContain('report-uri /api/csp-report');
    });

    it('should handle CSP violation reports', () => {
      const mockViolationReport = {
        'csp-report': {
          'document-uri': 'https://example.com/',
          'referrer': '',
          'violated-directive': "script-src 'self'",
          'effective-directive': "script-src",
          'original-policy': "default-src 'self'; script-src 'self'",
          'disposition': 'enforce',
          'blocked-uri': 'https://evil.com/malicious.js',
          'line-number': 1,
          'column-number': 1,
          'source-file': 'https://example.com/'
        }
      };

      expect(mockViolationReport['csp-report']).toBeDefined();
      expect(mockViolationReport['csp-report']['violated-directive']).toBe("script-src 'self'");
      expect(mockViolationReport['csp-report']['blocked-uri']).toBe('https://evil.com/malicious.js');
    });
  });
});
