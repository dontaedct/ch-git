/**
 * Security Headers Test Suite
 * 
 * Tests to snapshot and validate CSP and key security headers
 * across different routes and environments.
 */

import { test, expect } from '@playwright/test';

const ROUTES_TO_TEST = [
  { path: '/', name: 'Home' },
  { path: '/operability', name: 'Operability' },
  { path: '/sessions', name: 'Sessions' },
  { path: '/api/env-check', name: 'API Env Check' },
  { path: '/api/weekly-recap', name: 'API Weekly Recap' }
];

const REQUIRED_SECURITY_HEADERS = [
  'x-content-type-options',
  'x-frame-options',
  'x-xss-protection', 
  'referrer-policy',
  'permissions-policy'
];

const CSP_HEADERS = [
  'content-security-policy',
  'content-security-policy-report-only'
];

test.describe('Security Headers', () => {
  for (const route of ROUTES_TO_TEST) {
    test(`${route.name} (${route.path}) - Security Headers Present`, async ({ page }) => {
      const response = await page.goto(`http://localhost:3000${route.path}`);
      
      if (!response) {
        throw new Error(`No response received for ${route.path}`);
      }
      
      const headers = response.headers();
      const headerNames = Object.keys(headers).map(name => name.toLowerCase());
      
      // Check that all required security headers are present
      for (const requiredHeader of REQUIRED_SECURITY_HEADERS) {
        expect(headerNames).toContain(requiredHeader);
      }
      
      // Check that at least one CSP header is present
      const hasCspHeader = CSP_HEADERS.some(cspHeader => headerNames.includes(cspHeader));
      expect(hasCspHeader).toBe(true);
    });
    
    test(`${route.name} (${route.path}) - CSP Content Validation`, async ({ page }) => {
      const response = await page.goto(`http://localhost:3000${route.path}`);
      
      if (!response) {
        throw new Error(`No response received for ${route.path}`);
      }
      
      const headers = response.headers();
      const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
      
      if (cspHeader) {
        // Validate CSP contains required directives
        expect(cspHeader).toContain("default-src 'self'");
        expect(cspHeader).toContain("script-src");
        expect(cspHeader).toContain("style-src");
        expect(cspHeader).toContain("img-src");
        expect(cspHeader).toContain("connect-src");
        expect(cspHeader).toContain("frame-ancestors 'none'");
        expect(cspHeader).toContain("base-uri 'self'");
        
        // Validate CSP allows required third-party services
        expect(cspHeader).toContain('https://*.supabase.co');
        expect(cspHeader).toContain('https://api.resend.com');
        expect(cspHeader).toContain('https://api.stripe.com');
        expect(cspHeader).toContain('https://*.sentry.io');
        
        // In development/preview, unsafe-inline may be present
        // In production, it should not be present
        const isReportOnly = headers['content-security-policy-report-only'];
        if (isReportOnly) {
          // Preview environment - unsafe-inline allowed for learning
          console.log(`Preview environment detected for ${route.path} - CSP Report-Only mode`);
        } else {
          // Production environment - no unsafe-inline/unsafe-eval
          expect(cspHeader).not.toContain("'unsafe-inline'");
          expect(cspHeader).not.toContain("'unsafe-eval'");
        }
      }
    });
    
    test(`${route.name} (${route.path}) - Header Values Validation`, async ({ page }) => {
      const response = await page.goto(`http://localhost:3000${route.path}`);
      
      if (!response) {
        throw new Error(`No response received for ${route.path}`);
      }
      
      const headers = response.headers();
      
      // Validate specific header values
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-frame-options']).toBe('DENY');
      expect(headers['x-xss-protection']).toBe('1; mode=block');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      
      // Validate permissions policy
      const permissionsPolicy = headers['permissions-policy'];
      expect(permissionsPolicy).toContain('camera=()');
      expect(permissionsPolicy).toContain('microphone=()');
      expect(permissionsPolicy).toContain('geolocation=()');
      expect(permissionsPolicy).toContain('interest-cohort=()');
    });
  }
  
  test('Environment-specific CSP Configuration', async ({ page }) => {
    // Test that CSP configuration differs between environments
    const response = await page.goto('http://localhost:3000/');
    
    if (!response) {
      throw new Error('No response received for home page');
    }
    
    const headers = response.headers();
    const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
    const isReportOnly = headers['content-security-policy-report-only'];
    
    if (cspHeader) {
      if (isReportOnly) {
        // Preview environment
        expect(cspHeader).toContain("'unsafe-inline'");
        expect(cspHeader).toContain('https://vercel.live');
        console.log('✅ Preview environment CSP detected (Report-Only mode)');
      } else {
        // Production environment
        expect(cspHeader).not.toContain("'unsafe-inline'");
        expect(cspHeader).not.toContain("'unsafe-eval'");
        expect(cspHeader).toContain("'nonce-{NONCE}'");
        console.log('✅ Production environment CSP detected (Enforcement mode)');
      }
    }
  });
  
  test('Third-party Service Allowlist', async ({ page }) => {
    const response = await page.goto('http://localhost:3000/');
    
    if (!response) {
      throw new Error('No response received for home page');
    }
    
    const headers = response.headers();
    const cspHeader = headers['content-security-policy'] || headers['content-security-policy-report-only'];
    
    if (cspHeader) {
      // Validate that required third-party services are allowlisted
      const requiredServices = [
        'https://*.supabase.co',
        'https://*.supabase.in', 
        'https://api.resend.com',
        'https://api.stripe.com',
        'https://*.sentry.io'
      ];
      
      for (const service of requiredServices) {
        expect(cspHeader).toContain(service);
      }
      
      console.log('✅ All required third-party services are allowlisted in CSP');
    }
  });
});
