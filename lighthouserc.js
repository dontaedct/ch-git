/**
 * @fileoverview HT-008.7.4: Lighthouse CI Configuration
 * @description Automated Lighthouse CI performance testing configuration
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/intake',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/status',
        'http://localhost:3000/sessions',
        'http://localhost:3000/clients'
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Start server command
      startServerCommand: 'npm run dev',
      // Server ready timeout
      startServerReadyTimeout: 30000,
      // Server ready pattern
      startServerReadyPattern: 'ready - started server on',
    },
    assert: {
      // Performance budget assertions
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-input-delay': ['error', { maxNumericValue: 100 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        
        // Performance metrics
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'interactive': ['error', { maxNumericValue: 3000 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxLength: 0 }],
        'unused-javascript': ['warn', { maxLength: 0 }],
        'render-blocking-resources': ['warn', { maxLength: 0 }],
        'unminified-css': ['warn', { maxLength: 0 }],
        'unminified-javascript': ['warn', { maxLength: 0 }],
        'efficient-animated-content': ['warn', { maxLength: 0 }],
        'uses-optimized-images': ['warn', { maxLength: 0 }],
        'uses-webp-images': ['warn', { maxLength: 0 }],
        'uses-text-compression': ['warn', { maxLength: 0 }],
        
        // Accessibility
        'color-contrast': ['error', { maxLength: 0 }],
        'image-alt': ['error', { maxLength: 0 }],
        'label': ['error', { maxLength: 0 }],
        'link-name': ['error', { maxLength: 0 }],
        'button-name': ['error', { maxLength: 0 }],
        'heading-order': ['error', { maxLength: 0 }],
        'html-has-lang': ['error', { maxLength: 0 }],
        'html-lang-valid': ['error', { maxLength: 0 }],
        'meta-viewport': ['error', { maxLength: 0 }],
        'tabindex': ['error', { maxLength: 0 }],
        
        // Best practices
        'is-on-https': ['error', { maxLength: 0 }],
        'uses-http2': ['warn', { maxLength: 0 }],
        'no-vulnerable-libraries': ['error', { maxLength: 0 }],
        'no-document-write': ['error', { maxLength: 0 }],
        'no-mixed-content': ['error', { maxLength: 0 }],
        'csp-xss': ['warn', { maxLength: 0 }],
        'deprecations': ['warn', { maxLength: 0 }],
        
        // SEO
        'document-title': ['error', { maxLength: 0 }],
        'meta-description': ['error', { maxLength: 0 }],
        'link-text': ['error', { maxLength: 0 }],
        'hreflang': ['warn', { maxLength: 0 }],
        'canonical': ['warn', { maxLength: 0 }],
        'robots-txt': ['warn', { maxLength: 0 }],
        'structured-data': ['warn', { maxLength: 0 }],
      },
    },
    upload: {
      // Upload results to Lighthouse CI server (optional)
      target: 'temporary-public-storage',
    },
  },
};
