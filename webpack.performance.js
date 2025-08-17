/**
 * Webpack Performance Configuration
 * Performance budgets and monitoring for Next.js builds
 */

const PERFORMANCE_BUDGETS = {
  // Entry point size limits
  maxEntrypointSize: 500 * 1024, // 500KB
  maxAssetSize: 300 * 1024, // 300KB
  
  // Performance hints
  hints: 'warning',
  
  // Asset size limits by type
  assetFilter: (assetFilename: string) => {
    // Exclude source maps from size calculations
    return !assetFilename.endsWith('.map');
  }
};

// Bundle size thresholds for different environments
const BUNDLE_THRESHOLDS = {
  development: {
    maxEntrypointSize: 1000 * 1024, // 1MB
    maxAssetSize: 500 * 1024, // 500KB
  },
  production: {
    maxEntrypointSize: 500 * 1024, // 500KB
    maxAssetSize: 300 * 1024, // 300KB
  },
  staging: {
    maxEntrypointSize: 750 * 1024, // 750KB
    maxAssetSize: 400 * 1024, // 400KB
  }
};

// Performance monitoring configuration
const PERFORMANCE_MONITORING = {
  // Enable detailed performance tracking
  detailed: process.env.BUILD_VERBOSE === 'true',
  
  // Performance metrics collection
  metrics: {
    buildTime: true,
    bundleSize: true,
    memoryUsage: true,
    cacheEfficiency: true
  },
  
  // Alert thresholds
  alerts: {
    buildTimeThreshold: 120000, // 2 minutes
    memoryThreshold: 2 * 1024 * 1024 * 1024, // 2GB
    bundleSizeIncrease: 0.1 // 10% increase
  }
};

// Export configurations
module.exports = {
  PERFORMANCE_BUDGETS,
  BUNDLE_THRESHOLDS,
  PERFORMANCE_MONITORING,
  
  // Get performance config for environment
  getPerformanceConfig: (env = 'production') => {
    return {
      ...PERFORMANCE_BUDGETS,
      ...BUNDLE_THRESHOLDS[env] || BUNDLE_THRESHOLDS.production
    };
  },
  
  // Validate bundle sizes against budgets
  validateBundleSizes: (stats, budgets) => {
    const violations = [];
    
    if (stats.assets) {
      stats.assets.forEach(asset => {
        if (asset.size > budgets.maxAssetSize) {
          violations.push({
            type: 'asset',
            name: asset.name,
            size: asset.size,
            limit: budgets.maxAssetSize
          });
        }
      });
    }
    
    return violations;
  }
};
