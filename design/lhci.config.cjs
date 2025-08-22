module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/intake',
        'http://localhost:3000/sessions',
        'http://localhost:3000/client-portal'
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
      }
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        
        // Bundle size warnings
        'resource-summary:script:size': ['warn', { maxNumericValue: 500000 }],
        'resource-summary:total:size': ['warn', { maxNumericValue: 2000000 }]
      }
    },
    upload: {
      target: 'temporary-public-storage',
      token: process.env.LHCI_TOKEN
    }
  }
};

// Note: Per-route performance budgets are defined in design/budgets/lhci-budgets.json
// This allows for route-specific thresholds (e.g., /sessions can be slower than /intake)
