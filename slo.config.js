/**
 * 🦸‍♂️ MIT HERO SYSTEM - SLO CONFIGURATION
 * 
 * Service Level Objective configuration for the MIT Hero System
 * Defines performance budgets, thresholds, and enforcement rules
 */

module.exports = {
  // MIT Hero System Integration
  heroSystem: {
    enabled: true,
    autoDetect: true,
    requiredScripts: [
      'scripts/mit-hero-unified-integration.js',
      'scripts/hero-unified-orchestrator.js',
      'scripts/mit-hero-sentient-army-perfection.js'
    ],
    healthCheckTimeout: 10000,
    fallbackMode: 'basic'
  },

  // Build Performance Budgets (MIT Hero System standards)
  build: {
    // Time budgets
    p95: 20000,        // 20s p95 build time
    p99: 30000,        // 30s p99 build time
    maxTime: 45000,    // 45s absolute maximum
    
    // Memory budgets
    maxMemory: 4 * 1024 * 1024 * 1024, // 4GB max memory per process
    maxHeapSize: 3 * 1024 * 1024 * 1024, // 3GB max heap size
    maxRSS: 5 * 1024 * 1024 * 1024,      // 5GB max RSS
    
    // CPU budgets
    maxCPU: 80,         // 80% max sustained CPU usage
    maxCPUBurst: 95,    // 95% max CPU burst (5s)
    
    // Bundle size budgets
    maxBundleSize: 500 * 1024,     // 500KB max bundle size
    maxTotalSize: 2 * 1024 * 1024, // 2MB max total size
    
    // Cache efficiency
    minCacheHitRate: 0.8,           // 80% minimum cache hit rate
    maxCacheSize: 100 * 1024 * 1024 // 100MB max cache size
  },

  // CI Performance Budgets
  ci: {
    // Time budgets
    p95: 8 * 60 * 1000,     // 8 minutes p95 CI time
    p99: 12 * 60 * 1000,    // 12 minutes p99 CI time
    maxTime: 15 * 60 * 1000, // 15 minutes absolute maximum
    
    // Resource budgets
    maxParallelJobs: 4,      // Maximum parallel CI jobs
    maxQueueTime: 5 * 60 * 1000,  // 5 minutes max queue time
    maxWaitTime: 10 * 60 * 1000,  // 10 minutes max wait time
    
    // Job-specific budgets
    preflight: 2 * 60 * 1000,     // 2 minutes preflight
    qualityChecks: 5 * 60 * 1000, // 5 minutes quality checks
    testMatrix: 8 * 60 * 1000,    // 8 minutes test matrix
    buildPerformance: 12 * 60 * 1000, // 12 minutes build performance
    sloEnforcement: 8 * 60 * 1000,    // 8 minutes SLO enforcement
    buildProduction: 20 * 60 * 1000,  // 20 minutes production build
    bundleAnalysis: 15 * 60 * 1000,   // 15 minutes bundle analysis
    buildMetrics: 5 * 60 * 1000,      // 5 minutes build metrics
    ciHealth: 3 * 60 * 1000,          // 3 minutes CI health
    emergencyRollback: 8 * 60 * 1000  // 8 minutes emergency rollback
  },

  // Memory and Resource Limits
  resources: {
    // Memory limits
    maxHeapSize: 4 * 1024 * 1024 * 1024, // 4GB max heap
    maxRSS: 6 * 1024 * 1024 * 1024,      // 6GB max RSS
    maxExternal: 2 * 1024 * 1024 * 1024, // 2GB max external memory
    
    // CPU limits
    maxCPUUsage: 80,                      // 80% max CPU
    maxCPUBurst: 95,                      // 95% max CPU burst
    maxCPUAverage: 60,                    // 60% max CPU average (5min)
    
    // Disk limits
    maxDiskUsage: 90,                     // 90% max disk usage
    maxDiskIO: 100 * 1024 * 1024,        // 100MB/s max disk I/O
    maxDiskSpace: 10 * 1024 * 1024 * 1024, // 10GB max disk space
    
    // Network limits
    maxNetworkIO: 50 * 1024 * 1024,      // 50MB/s max network I/O
    maxConcurrentConnections: 100,        // 100 max concurrent connections
    maxRequestSize: 10 * 1024 * 1024      // 10MB max request size
  },

  // Performance Regression Detection
  regression: {
    // Thresholds
    threshold: 0.15,        // 15% performance regression threshold
    criticalThreshold: 0.25, // 25% critical regression threshold
    warningThreshold: 0.10,  // 10% warning regression threshold
    
    // History tracking
    historySize: 10,        // Number of historical runs to track
    minBaselineRuns: 3,     // Minimum runs needed for baseline
    alertOnRegression: true, // Alert on performance regression
    
    // Metrics to track
    trackedMetrics: [
      'buildTime',
      'memoryUsage.heapUsed',
      'memoryUsage.rss',
      'bundleSize',
      'cacheHitRate'
    ]
  },

  // SLO Enforcement Rules
  enforcement: {
    // Failure conditions
    failOnCritical: true,   // Fail CI on critical violations
    failOnWarning: false,   // Fail CI on warning violations
    failOnRegression: true, // Fail CI on performance regression
    
    // Alert conditions
    alertOnWarning: true,   // Alert on warning violations
    alertOnRegression: true, // Alert on performance regression
    alertOnResourceExhaustion: true, // Alert on resource exhaustion
    
    // Rollback conditions
    autoRollback: false,    // Auto-rollback on critical failures
    rollbackThreshold: 3,   // Number of failures before rollback
    rollbackGracePeriod: 5 * 60 * 1000 // 5 minutes grace period
  },

  // Monitoring and Reporting
  monitoring: {
    // Real-time monitoring
    enabled: true,
    interval: 1000,         // 1 second monitoring interval
    logLevel: 'info',        // Log level (debug, info, warn, error)
    
    // Metrics collection
    collectMetrics: true,
    metricsRetention: 30,   // Days to retain metrics
    metricsCompression: true, // Compress old metrics
    
    // Reporting
    generateReports: true,
    reportFormat: 'json',   // Report format (json, html, markdown)
    reportRetention: 90,    // Days to retain reports
    
    // Notifications
    notifications: {
      enabled: true,
      channels: ['console', 'file', 'github'],
      webhook: process.env.SLO_WEBHOOK_URL || null
    }
  },

  // CI Integration
  ciIntegration: {
    // GitHub Actions integration
    githubActions: {
      enabled: true,
      artifactUpload: true,
      artifactRetention: 90,
      statusCheck: true,
      commentOnPR: true
    },
    
    // Build stages
    stages: {
      preflight: { required: true, timeout: 2 * 60 * 1000 },
      quality: { required: true, timeout: 5 * 60 * 1000 },
      test: { required: true, timeout: 8 * 60 * 1000 },
      build: { required: true, timeout: 12 * 60 * 1000 },
      slo: { required: true, timeout: 8 * 60 * 1000 },
      production: { required: true, timeout: 20 * 60 * 1000 }
    },
    
    // Parallel execution
    parallel: {
      enabled: true,
      maxConcurrency: 4,
      jobDependencies: {
        'slo-enforcement': ['preflight', 'build-performance'],
        'build-production': ['slo-enforcement'],
        'ci-health': ['build-production']
      }
    }
  },

  // Performance Gates
  gates: {
    // Build gates
    build: {
      time: { enabled: true, threshold: 30000 },
      memory: { enabled: true, threshold: 4 * 1024 * 1024 * 1024 },
      bundle: { enabled: true, threshold: 500 * 1024 },
      cache: { enabled: true, threshold: 0.8 }
    },
    
    // CI gates
    ci: {
      time: { enabled: true, threshold: 12 * 60 * 1000 },
      parallel: { enabled: true, threshold: 4 },
      queue: { enabled: true, threshold: 5 * 60 * 1000 }
    },
    
    // Resource gates
    resources: {
      memory: { enabled: true, threshold: 6 * 1024 * 1024 * 1024 },
      cpu: { enabled: true, threshold: 80 },
      disk: { enabled: true, threshold: 90 }
    },
    
    // Regression gates
    regression: {
      performance: { enabled: true, threshold: 0.15 },
      memory: { enabled: true, threshold: 0.20 },
      bundle: { enabled: true, threshold: 0.10 }
    }
  },

  // Environment-specific overrides
  environments: {
    development: {
      build: { p95: 30000, p99: 45000 },
      ci: { p95: 10 * 60 * 1000, p99: 15 * 60 * 1000 },
      enforcement: { failOnWarning: false }
    },
    
    staging: {
      build: { p95: 25000, p99: 40000 },
      ci: { p95: 9 * 60 * 1000, p99: 14 * 60 * 1000 },
      enforcement: { failOnWarning: true }
    },
    
    production: {
      build: { p95: 20000, p99: 30000 },
      ci: { p95: 8 * 60 * 1000, p99: 12 * 60 * 1000 },
      enforcement: { failOnWarning: true, failOnCritical: true }
    }
  },

  // MIT Hero System specific configurations
  mitHero: {
    // System integration
    integration: {
      enabled: true,
      autoDetect: true,
      healthCheck: true,
      fallbackMode: 'basic'
    },
    
    // Hero system budgets
    heroSystems: {
      sentientArmy: { timeout: 30 * 1000, memory: 512 * 1024 * 1024 },
      quantumNeural: { timeout: 45 * 1000, memory: 1 * 1024 * 1024 * 1024 },
      causalityPredictor: { timeout: 60 * 1000, memory: 768 * 1024 * 1024 },
      consciousnessSimulator: { timeout: 90 * 1000, memory: 1.5 * 1024 * 1024 * 1024 },
      unifiedIntegration: { timeout: 120 * 1000, memory: 2 * 1024 * 1024 * 1024 }
    },
    
    // Automation budgets
    automation: {
      errorFixing: { maxAttempts: 5, timeout: 60 * 1000 },
      smokeTesting: { timeout: 5 * 60 * 1000, memory: 1 * 1024 * 1024 * 1024 },
      taskOrchestration: { timeout: 3 * 60 * 1000, memory: 512 * 1024 * 1024 }
    }
  }
};
