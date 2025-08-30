/**
 * Lighthouse CI Configuration
 * 
 * This configuration supports both local development and CI execution.
 * For local development: npm run ui:perf
 * For CI: GitHub Actions will use this config automatically
 */

module.exports = {
  ci: {
    collect: {
      // For local development, user should start server manually
      // For CI, no server startup needed
      startServerCommand: undefined,
      
      // Collect from specific routes
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/intake',
        'http://localhost:3000/sessions',
        'http://localhost:3000/client-portal',
        'http://localhost:3000/weekly-plans'
      ],
      
      // CI settings
      numberOfRuns: process.env.CI ? 3 : 1,
      settings: {
        // Use mobile emulation for realistic testing
        emulatedFormFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        // Skip certain audits that aren't relevant for our use case
        skipAudits: [
          'uses-http2',
          'uses-long-cache-ttl',
          'efficient-animated-content'
        ]
      }
    },
    
    assert: {
      // Use warn level for soft-fail initially, can be changed to error later
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'metrics:cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'metrics:largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'metrics:first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'metrics:interactive': ['warn', { maxNumericValue: 3500 }],
        'metrics:total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'metrics:speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Bundle size limits
        'resource-summary:script:size': ['warn', { maxNumericValue: 250000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 500000 }]
      }
    },
    
    upload: {
      target: 'temporary-public-storage',
      token: process.env.LHCI_GITHUB_APP_TOKEN
    }
  }
};
