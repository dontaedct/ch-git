#!/usr/bin/env node

/**
 * Build Performance Monitor
 * Monitors Next.js build performance and validates performance budgets
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Performance monitoring configuration
const PERFORMANCE_CONFIG = {
  buildTimeThreshold: 120000, // 2 minutes
  memoryThreshold: 2 * 1024 * 1024 * 1024, // 2GB
  bundleSizeThreshold: 500 * 1024, // 500KB
  cacheEfficiencyThreshold: 0.8 // 80%
};

class BuildPerformanceMonitor {
  constructor() {
    this.startTime = 0;
    this.endTime = 0;
    this.memoryUsage = {};
    this.buildStats = {};
    this.violations = [];
  }

  start() {
    console.log('🚀 Starting build performance monitoring...');
    this.startTime = performance.now();
    this.memoryUsage.start = process.memoryUsage();
    
    // Clear previous build cache if requested
    if (process.argv.includes('--clear-cache')) {
      this.clearBuildCache();
    }
  }

  end() {
    this.endTime = performance.now();
    this.memoryUsage.end = process.memoryUsage();
    
    const buildTime = this.endTime - this.startTime;
    console.log(`⏱️  Build completed in ${(buildTime / 1000).toFixed(2)}s`);
    
    this.analyzePerformance(buildTime);
    this.generateReport();
  }

  clearBuildCache() {
    const cachePath = path.join(process.cwd(), '.next/cache');
    if (fs.existsSync(cachePath)) {
      console.log('🧹 Clearing build cache...');
      fs.rmSync(cachePath, { recursive: true, force: true });
    }
  }

  analyzePerformance(buildTime) {
    // Check build time
    if (buildTime > PERFORMANCE_CONFIG.buildTimeThreshold) {
      this.violations.push({
        type: 'buildTime',
        value: buildTime,
        threshold: PERFORMANCE_CONFIG.buildTimeThreshold,
        severity: 'warning'
      });
    }

    // Check memory usage
    const memoryIncrease = this.memoryUsage.end.heapUsed - this.memoryUsage.start.heapUsed;
    if (memoryIncrease > PERFORMANCE_CONFIG.memoryThreshold) {
      this.violations.push({
        type: 'memoryUsage',
        value: memoryIncrease,
        threshold: PERFORMANCE_CONFIG.memoryThreshold,
        severity: 'warning'
      });
    }

    // Analyze bundle sizes
    this.analyzeBundleSizes();
    
    // Check cache efficiency
    this.checkCacheEfficiency();
  }

  analyzeBundleSizes() {
    const buildPath = path.join(process.cwd(), '.next');
    if (!fs.existsSync(buildPath)) {
      console.log('⚠️  Build directory not found, skipping bundle analysis');
      return;
    }

    try {
      // Get bundle analysis if available
      const bundleStatsPath = path.join(buildPath, 'bundle-stats.json');
      if (fs.existsSync(bundleStatsPath)) {
        const stats = JSON.parse(fs.readFileSync(bundleStatsPath, 'utf8'));
        this.analyzeBundleStats(stats);
      }

      // Analyze static assets
      const staticPath = path.join(buildPath, 'static');
      if (fs.existsSync(staticPath)) {
        this.analyzeStaticAssets(staticPath);
      }
    } catch (error) {
      console.log('⚠️  Error analyzing bundle sizes:', error.message);
    }
  }

  analyzeBundleStats(stats) {
    if (stats.assets) {
      stats.assets.forEach(asset => {
        if (asset.size > PERFORMANCE_CONFIG.bundleSizeThreshold) {
          this.violations.push({
            type: 'bundleSize',
            name: asset.name,
            size: asset.size,
            threshold: PERFORMANCE_CONFIG.bundleSizeThreshold,
            severity: 'warning'
          });
        }
      });
    }
  }

  analyzeStaticAssets(staticPath) {
    const analyzeDirectory = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeDirectory(filePath);
        } else if (stat.isFile()) {
          const size = stat.size;
          if (size > PERFORMANCE_CONFIG.bundleSizeThreshold) {
            this.violations.push({
              type: 'staticAsset',
              name: path.relative(staticPath, filePath),
              size: size,
              threshold: PERFORMANCE_CONFIG.bundleSizeThreshold,
              severity: 'info'
            });
          }
        }
      });
    };

    analyzeDirectory(staticPath);
  }

  checkCacheEfficiency() {
    const cachePath = path.join(process.cwd(), '.next/cache');
    if (fs.existsSync(cachePath)) {
      try {
        const cacheStats = fs.statSync(cachePath);
        const cacheSize = cacheStats.size;
        
        // Simple cache efficiency check
        if (cacheSize > 100 * 1024 * 1024) { // 100MB
          console.log('💾 Large cache detected, consider clearing if builds are slow');
        }
      } catch (error) {
        console.log('⚠️  Error checking cache efficiency:', error.message);
      }
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      buildTime: this.endTime - this.startTime,
      memoryUsage: this.memoryUsage.start && this.memoryUsage.end ? {
        start: this.memoryUsage.start,
        end: this.memoryUsage.end,
        increase: this.memoryUsage.end.heapUsed - this.memoryUsage.start.heapUsed
      } : null,
      violations: this.violations,
      summary: {
        totalViolations: this.violations.length,
        warnings: this.violations.filter(v => v.severity === 'warning').length,
        info: this.violations.filter(v => v.severity === 'info').length
      }
    };

    // Save report
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, `build-performance-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Display summary
    console.log('\n📊 Build Performance Report:');
    console.log('================================');
    console.log(`⏱️  Build Time: ${(report.buildTime / 1000).toFixed(2)}s`);
    if (report.memoryUsage) {
      console.log(`💾 Memory Increase: ${(report.memoryUsage.increase / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log(`💾 Memory Usage: Not tracked (analyze-only mode)`);
    }
    console.log(`⚠️  Violations: ${report.summary.totalViolations}`);
    console.log(`📁 Report saved to: ${reportPath}`);

    if (this.violations.length > 0) {
      console.log('\n🚨 Performance Violations:');
      this.violations.forEach(violation => {
        const icon = violation.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`${icon} ${violation.type}: ${this.formatViolation(violation)}`);
      });
    }

    // Exit with error code if there are warnings
    if (report.summary.warnings > 0) {
      process.exit(1);
    }
  }

  formatViolation(violation) {
    switch (violation.type) {
      case 'buildTime':
        return `Build took ${(violation.value / 1000).toFixed(2)}s (threshold: ${(violation.threshold / 1000).toFixed(2)}s)`;
      case 'memoryUsage':
        return `Memory increased by ${(violation.value / 1024 / 1024).toFixed(2)}MB (threshold: ${(violation.threshold / 1024 / 1024).toFixed(2)}MB)`;
      case 'bundleSize':
      case 'staticAsset':
        return `${violation.name}: ${(violation.size / 1024).toFixed(2)}KB (threshold: ${(violation.threshold / 1024).toFixed(2)}KB)`;
      default:
        return `${violation.value} (threshold: ${violation.threshold})`;
    }
  }

  runBuild() {
    try {
      const buildCommand = process.argv.includes('--fast') ? 'npm run build:fast' : 'npm run build';
      console.log(`🔨 Running: ${buildCommand}`);
      
      execSync(buildCommand, { 
        stdio: 'inherit',
        env: { ...process.env, BUILD_VERBOSE: '1' }
      });
      
      return true;
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      return false;
    }
  }
}

// Main execution
if (require.main === module) {
  const monitor = new BuildPerformanceMonitor();
  
  // Check if we should just run analysis
  if (process.argv.includes('--analyze-only')) {
    monitor.analyzeBundleSizes();
    monitor.generateReport();
  } else if (process.argv.includes('--budget')) {
    // Validate against performance budgets
    monitor.analyzeBundleSizes();
    monitor.generateReport();
  } else {
    // Run full build with monitoring
    monitor.start();
    const success = monitor.runBuild();
    if (success) {
      monitor.end();
    } else {
      process.exit(1);
    }
  }
}

module.exports = BuildPerformanceMonitor;
