#!/usr/bin/env node

/**
 * 🦸‍♂️ MIT HERO SYSTEM - SLO ENFORCER
 * 
 * Service Level Objective enforcement system that fails CI builds
 * when performance budgets are exceeded or memory limits are violated.
 * 
 * Integrates with MIT Hero System for intelligent enforcement and reporting.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const os = require('os');

// SLO Configuration with MIT Hero System integration
const SLO_CONFIG = {
  // Build Performance Budgets (MIT Hero System standards)
  build: {
    p95: 20000,        // 20s p95 build time
    p99: 30000,        // 30s p99 build time
    maxMemory: 4 * 1024 * 1024 * 1024, // 4GB max memory per process
    maxCPU: 80,         // 80% max sustained CPU usage
  },
  
  // CI Performance Budgets
  ci: {
    p95: 8 * 60 * 1000,    // 8 minutes p95 CI time
    p99: 12 * 60 * 1000,   // 12 minutes p99 CI time
    maxParallelJobs: 4,     // Maximum parallel CI jobs
    maxQueueTime: 5 * 60 * 1000, // 5 minutes max queue time
  },
  
  // Memory and Resource Limits
  resources: {
    maxHeapSize: 4 * 1024 * 1024 * 1024, // 4GB max heap
    maxRSS: 6 * 1024 * 1024 * 1024,      // 6GB max RSS
    maxCPUUsage: 80,                      // 80% max CPU
    maxDiskUsage: 90,                     // 90% max disk usage
  },
  
  // Performance Regression Detection
  regression: {
    threshold: 0.15,        // 15% performance regression threshold
    historySize: 10,        // Number of historical runs to track
    alertOnRegression: true, // Alert on performance regression
  }
};

class SLOEnforcer {
  constructor() {
    this.startTime = performance.now();
    this.violations = [];
    this.metrics = {};
    this.heroSystemStatus = {};
    this.ciContext = this.detectCIContext();
  }

  /**
   * Detect CI context and environment
   */
  detectCIContext() {
    return {
      isCI: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true',
      isGitHubActions: process.env.GITHUB_ACTIONS === 'true',
      workflow: process.env.GITHUB_WORKFLOW || 'unknown',
      job: process.env.GITHUB_JOB || 'unknown',
      runId: process.env.GITHUB_RUN_ID || 'unknown',
      actor: process.env.GITHUB_ACTOR || 'unknown',
      repository: process.env.GITHUB_REPOSITORY || 'unknown',
      ref: process.env.GITHUB_REF || 'unknown',
      sha: process.env.GITHUB_SHA || 'unknown'
    };
  }

  /**
   * Initialize MIT Hero System integration
   */
  async initializeHeroSystem() {
    console.log('🧠 Initializing MIT Hero System integration...');
    
    try {
      // Check MIT Hero System status
      this.heroSystemStatus = await this.checkHeroSystemStatus();
      
      if (this.heroSystemStatus.operational) {
        console.log('✅ MIT Hero System operational - SLO enforcement enhanced');
      } else {
        console.log('⚠️  MIT Hero System limited - using basic SLO enforcement');
      }
    } catch (error) {
      console.log('⚠️  MIT Hero System unavailable - using basic SLO enforcement');
      this.heroSystemStatus = { operational: false, error: error.message };
    }
  }

  /**
   * Check MIT Hero System operational status
   */
  async checkHeroSystemStatus() {
    try {
      // Check for MIT Hero System scripts
      const heroScripts = [
        'scripts/mit-hero-unified-integration.js',
        'scripts/hero-unified-orchestrator.js',
        'scripts/mit-hero-sentient-army-perfection.js'
      ];

      const availableScripts = heroScripts.filter(script => 
        fs.existsSync(path.join(process.cwd(), script))
      );

      if (availableScripts.length > 0) {
        // Try to execute a basic MIT Hero System check
        const result = execSync('node scripts/mit-hero-unified-integration.js --status', { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 10000
        });
        
        return {
          operational: true,
          availableScripts,
          status: result.trim(),
          timestamp: new Date().toISOString()
        };
      }

      return {
        operational: false,
        availableScripts: [],
        reason: 'No MIT Hero System scripts found'
      };
    } catch (error) {
      return {
        operational: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Start SLO monitoring
   */
  start() {
    console.log('🚀 Starting SLO enforcement monitoring...');
    console.log(`📊 CI Context: ${this.ciContext.isCI ? 'GitHub Actions' : 'Local'}`);
    console.log(`🏗️  Workflow: ${this.ciContext.workflow}`);
    console.log(`⚡ Job: ${this.ciContext.job}`);
    
    this.startTime = performance.now();
    this.metrics.start = {
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime()
    };
  }

  /**
   * Monitor resource usage during execution
   */
  monitorResources() {
    const interval = setInterval(() => {
      const currentMemory = process.memoryUsage();
      const currentCPU = process.cpuUsage();
      
      // Check memory limits
      if (currentMemory.heapUsed > SLO_CONFIG.resources.maxHeapSize) {
        this.violations.push({
          type: 'memory_heap_exceeded',
          value: currentMemory.heapUsed,
          threshold: SLO_CONFIG.resources.maxHeapSize,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }
      
      if (currentMemory.rss > SLO_CONFIG.resources.maxRSS) {
        this.violations.push({
          type: 'memory_rss_exceeded',
          value: currentMemory.rss,
          threshold: SLO_CONFIG.resources.maxRSS,
          severity: 'critical',
          timestamp: new Date().toISOString()
        });
      }
      
      // Check CPU usage
      const cpuUsage = this.calculateCPUUsage(currentCPU);
      if (cpuUsage > SLO_CONFIG.resources.maxCPUUsage) {
        this.violations.push({
          type: 'cpu_usage_exceeded',
          value: cpuUsage,
          threshold: SLO_CONFIG.resources.maxCPUUsage,
          severity: 'warning',
          timestamp: new Date().toISOString()
        });
      }
      
    }, 1000); // Monitor every second
    
    return interval;
  }

  /**
   * Calculate CPU usage percentage
   */
  calculateCPUUsage(currentCPU) {
    const startCPU = this.metrics.start.cpu;
    const userDiff = currentCPU.user - startCPU.user;
    const systemDiff = currentCPU.system - startCPU.system;
    const totalDiff = userDiff + systemDiff;
    
    // Convert to percentage (rough approximation)
    return Math.min(100, (totalDiff / 1000000) * 100);
  }

  /**
   * Validate build performance against SLOs
   */
  validateBuildPerformance(buildTime, buildType = 'standard') {
    console.log(`🔍 Validating build performance: ${buildTime}ms (${buildType})`);
    
    // Check against p95 and p99 thresholds
    if (buildTime > SLO_CONFIG.build.p99) {
      this.violations.push({
        type: 'build_time_p99_violation',
        value: buildTime,
        threshold: SLO_CONFIG.build.p99,
        severity: 'critical',
        buildType,
        timestamp: new Date().toISOString()
      });
    } else if (buildTime > SLO_CONFIG.build.p95) {
      this.violations.push({
        type: 'build_time_p95_violation',
        value: buildTime,
        threshold: SLO_CONFIG.build.p95,
        severity: 'warning',
        buildType,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check memory usage
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > SLO_CONFIG.build.maxMemory) {
      this.violations.push({
        type: 'build_memory_exceeded',
        value: memoryUsage.heapUsed,
        threshold: SLO_CONFIG.build.maxMemory,
        severity: 'critical',
        buildType,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Validate CI performance against SLOs
   */
  validateCIPerformance() {
    if (!this.ciContext.isCI) {
      console.log('📝 Not in CI environment, skipping CI validation');
      return;
    }
    
    const ciTime = performance.now() - this.startTime;
    console.log(`🔍 Validating CI performance: ${ciTime}ms`);
    
    // Check CI time budgets
    if (ciTime > SLO_CONFIG.ci.p99) {
      this.violations.push({
        type: 'ci_time_p99_violation',
        value: ciTime,
        threshold: SLO_CONFIG.ci.p99,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    } else if (ciTime > SLO_CONFIG.ci.p95) {
      this.violations.push({
        type: 'ci_time_p95_violation',
        value: ciTime,
        threshold: SLO_CONFIG.ci.p95,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check resource usage
    this.validateResourceLimits();
  }

  /**
   * Validate resource limits
   */
  validateResourceLimits() {
    const memoryUsage = process.memoryUsage();
    const diskUsage = this.getDiskUsage();
    
    // Memory validation
    if (memoryUsage.heapUsed > SLO_CONFIG.resources.maxHeapSize) {
      this.violations.push({
        type: 'ci_memory_heap_exceeded',
        value: memoryUsage.heapUsed,
        threshold: SLO_CONFIG.resources.maxHeapSize,
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    }
    
    // Disk usage validation
    if (diskUsage > SLO_CONFIG.resources.maxDiskUsage) {
      this.violations.push({
        type: 'ci_disk_usage_exceeded',
        value: diskUsage,
        threshold: SLO_CONFIG.resources.maxDiskUsage,
        severity: 'warning',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get disk usage percentage
   */
  getDiskUsage() {
    try {
      const stats = fs.statSync(process.cwd());
      // This is a simplified disk usage check
      // In production, you might want to use a more sophisticated approach
      return 50; // Placeholder - implement actual disk usage calculation
    } catch (error) {
      console.warn('⚠️  Could not determine disk usage:', error.message);
      return 0;
    }
  }

  /**
   * Check for performance regressions
   */
  checkPerformanceRegressions() {
    const performanceHistoryPath = path.join(process.cwd(), 'reports', 'performance-history.json');
    
    if (!fs.existsSync(performanceHistoryPath)) {
      console.log('📊 No performance history found, creating baseline');
      this.createPerformanceBaseline();
      return;
    }
    
    try {
      const history = JSON.parse(fs.readFileSync(performanceHistoryPath, 'utf8'));
      const currentMetrics = this.getCurrentMetrics();
      
      // Compare with historical data
      const regression = this.detectRegression(history, currentMetrics);
      
      if (regression.detected) {
        this.violations.push({
          type: 'performance_regression',
          value: regression.percentage,
          threshold: SLO_CONFIG.regression.threshold * 100,
          severity: 'warning',
          details: regression.details,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not check performance regressions:', error.message);
    }
  }

  /**
   * Create performance baseline
   */
  createPerformanceBaseline() {
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const baseline = {
      timestamp: new Date().toISOString(),
      metrics: this.getCurrentMetrics(),
      version: '1.0.0'
    };
    
    const baselinePath = path.join(reportsDir, 'performance-baseline.json');
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));
    console.log('📊 Performance baseline created');
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics() {
    const currentMemory = process.memoryUsage();
    const currentTime = performance.now() - this.startTime;
    
    return {
      buildTime: currentTime,
      memoryUsage: {
        heapUsed: currentMemory.heapUsed,
        heapTotal: currentMemory.heapTotal,
        rss: currentMemory.rss,
        external: currentMemory.external
      },
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    };
  }

  /**
   * Detect performance regression
   */
  detectRegression(history, currentMetrics) {
    if (!history.metrics || !currentMetrics) {
      return { detected: false, percentage: 0, details: 'No baseline data' };
    }
    
    const baselineBuildTime = history.metrics.buildTime;
    const currentBuildTime = currentMetrics.buildTime;
    
    if (baselineBuildTime === 0) {
      return { detected: false, percentage: 0, details: 'Invalid baseline' };
    }
    
    const regression = (currentBuildTime - baselineBuildTime) / baselineBuildTime;
    const detected = regression > SLO_CONFIG.regression.threshold;
    
    return {
      detected,
      percentage: regression * 100,
      details: `Build time increased by ${(regression * 100).toFixed(2)}%`,
      baseline: baselineBuildTime,
      current: currentBuildTime
    };
  }

  /**
   * Generate comprehensive SLO report
   */
  generateReport() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    const report = {
      timestamp: new Date().toISOString(),
      duration: totalTime,
      ciContext: this.ciContext,
      heroSystemStatus: this.heroSystemStatus,
      metrics: {
        start: this.metrics.start,
        end: {
          timestamp: new Date().toISOString(),
          memory: process.memoryUsage(),
          cpu: process.cpuUsage(),
          uptime: process.uptime()
        },
        total: {
          buildTime: totalTime,
          memoryPeak: this.getMemoryPeak(),
          cpuPeak: this.getCPUPeak()
        }
      },
      violations: this.violations,
      summary: this.generateSummary(),
      recommendations: this.generateRecommendations()
    };
    
    // Save report
    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    const reportPath = path.join(reportsDir, `slo-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Also save latest report
    const latestReportPath = path.join(reportsDir, 'slo-report-latest.json');
    fs.writeFileSync(latestReportPath, JSON.stringify(report, null, 2));
    
    return report;
  }

  /**
   * Get memory peak usage
   */
  getMemoryPeak() {
    // This would track peak memory usage during monitoring
    // For now, return current usage
    return process.memoryUsage();
  }

  /**
   * Get CPU peak usage
   */
  getCPUPeak() {
    // This would track peak CPU usage during monitoring
    // For now, return current usage
    return process.cpuUsage();
  }

  /**
   * Generate violation summary
   */
  generateSummary() {
    const criticalViolations = this.violations.filter(v => v.severity === 'critical');
    const warningViolations = this.violations.filter(v => v.severity === 'warning');
    
    return {
      totalViolations: this.violations.length,
      criticalViolations: criticalViolations.length,
      warningViolations: warningViolations.length,
      status: criticalViolations.length > 0 ? 'FAILED' : 'PASSED',
      compliance: this.violations.length === 0 ? 100 : 
        Math.max(0, 100 - (this.violations.length * 10))
    };
  }

  /**
   * Generate recommendations based on violations
   */
  generateRecommendations() {
    const recommendations = [];
    
    if (this.violations.length === 0) {
      recommendations.push('🎉 All SLOs met! Keep up the excellent performance.');
      return recommendations;
    }
    
    // Build time recommendations
    const buildTimeViolations = this.violations.filter(v => 
      v.type.includes('build_time')
    );
    
    if (buildTimeViolations.length > 0) {
      recommendations.push(
        '⚡ Build time violations detected:',
        '  - Consider implementing build caching',
        '  - Review bundle size and dependencies',
        '  - Optimize build configuration',
        '  - Use parallel builds where possible'
      );
    }
    
    // Memory recommendations
    const memoryViolations = this.violations.filter(v => 
      v.type.includes('memory')
    );
    
    if (memoryViolations.length > 0) {
      recommendations.push(
        '🧠 Memory violations detected:',
        '  - Review memory-intensive operations',
        '  - Implement memory pooling where possible',
        '  - Consider streaming for large data processing',
        '  - Monitor for memory leaks'
      );
    }
    
    // CI performance recommendations
    const ciViolations = this.violations.filter(v => 
      v.type.includes('ci_')
    );
    
    if (ciViolations.length > 0) {
      recommendations.push(
        '🚀 CI performance violations detected:',
        '  - Optimize CI workflow configuration',
        '  - Implement parallel job execution',
        '  - Use caching for dependencies and build artifacts',
        '  - Review and optimize test execution'
      );
    }
    
    return recommendations;
  }

  /**
   * End SLO monitoring and generate final report
   */
  end() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;
    
    console.log(`⏱️  SLO monitoring completed in ${(totalTime / 1000).toFixed(2)}s`);
    
    // Final validations
    this.validateCIPerformance();
    this.checkPerformanceRegressions();
    
    // Generate report
    const report = this.generateReport();
    
    // Display summary
    this.displaySummary(report);
    
    // Exit with appropriate code
    if (report.summary.status === 'FAILED') {
      console.error('❌ SLO violations detected - CI build should fail');
      process.exit(1);
    } else {
      console.log('✅ All SLOs met - CI build can proceed');
      process.exit(0);
    }
  }

  /**
   * Display SLO summary
   */
  displaySummary(report) {
    console.log('\n📊 SLO ENFORCEMENT SUMMARY');
    console.log('=' .repeat(50));
    console.log(`Status: ${report.summary.status}`);
    console.log(`Compliance: ${report.summary.compliance}%`);
    console.log(`Total Violations: ${report.summary.totalViolations}`);
    console.log(`Critical: ${report.summary.criticalViolations}`);
    console.log(`Warnings: ${report.summary.warningViolations}`);
    console.log(`Duration: ${(report.duration / 1000).toFixed(2)}s`);
    
    if (report.violations.length > 0) {
      console.log('\n🚨 VIOLATIONS DETECTED:');
      report.violations.forEach((violation, index) => {
        console.log(`${index + 1}. [${violation.severity.toUpperCase()}] ${violation.type}`);
        console.log(`   Value: ${(violation.value / 1000).toFixed(2)}s`);
        console.log(`   Threshold: ${(violation.threshold / 1000).toFixed(2)}s`);
        console.log(`   Time: ${violation.timestamp}`);
      });
    }
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      report.recommendations.forEach(rec => console.log(`   ${rec}`));
    }
    
    console.log('\n📁 Report saved to: reports/slo-report-latest.json');
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'monitor';
  
  const enforcer = new SLOEnforcer();
  
  try {
    // Initialize MIT Hero System
    await enforcer.initializeHeroSystem();
    
    switch (command) {
      case '--init':
      case '--initialize':
        console.log('🚀 Initializing SLO enforcement system...');
        enforcer.start();
        enforcer.createPerformanceBaseline();
        console.log('✅ SLO enforcement system initialized');
        break;
        
      case '--validate':
      case '--validate-only':
        console.log('🔍 Running SLO validation...');
        enforcer.start();
        enforcer.validateCIPerformance();
        enforcer.checkPerformanceRegressions();
        const report = enforcer.generateReport();
        enforcer.displaySummary(report);
        
        if (report.summary.status === 'FAILED') {
          console.error('❌ SLO validation failed');
          process.exit(1);
        } else {
          console.log('✅ SLO validation passed');
          process.exit(0);
        }
        break;
        
      case '--monitor':
      case '--monitor-only':
        console.log('📊 Starting SLO monitoring...');
        enforcer.start();
        
        // Start resource monitoring
        const resourceInterval = enforcer.monitorResources();
        
        // Handle process termination
        process.on('SIGINT', () => {
          clearInterval(resourceInterval);
          enforcer.end();
        });
        
        process.on('SIGTERM', () => {
          clearInterval(resourceInterval);
          enforcer.end();
        });
        
        // If running in CI, end after a reasonable timeout
        if (enforcer.ciContext.isCI) {
          setTimeout(() => {
            clearInterval(resourceInterval);
            enforcer.end();
          }, SLO_CONFIG.ci.p99);
        }
        
        // For local development, keep running until manually stopped
        if (!enforcer.ciContext.isCI) {
          console.log('🔄 SLO monitoring active. Press Ctrl+C to stop...');
        }
        break;
        
      case '--report':
      case '--report-only':
        console.log('📋 Generating SLO report...');
        enforcer.start();
        const reportOnly = enforcer.generateReport();
        enforcer.displaySummary(reportOnly);
        break;
        
      case '--test':
      case '--test-only':
        console.log('🧪 Running SLO test mode...');
        enforcer.start();
        
        // Simulate some violations for testing
        enforcer.violations.push({
          type: 'test_violation',
          value: 25000,
          threshold: 20000,
          severity: 'warning',
          timestamp: new Date().toISOString()
        });
        
        const testReport = enforcer.generateReport();
        enforcer.displaySummary(testReport);
        break;
        
      case '--hero-status':
      case '--hero-status-only':
        console.log('🧠 MIT Hero System Status:');
        console.log(JSON.stringify(enforcer.heroSystemStatus, null, 2));
        break;
        
      case '--ci-enforce':
      case '--ci-enforce-only':
        console.log('🚀 CI SLO Enforcement Mode...');
        enforcer.start();
        
        // Run comprehensive CI validation
        enforcer.validateCIPerformance();
        enforcer.checkPerformanceRegressions();
        
        const ciReport = enforcer.generateReport();
        enforcer.displaySummary(ciReport);
        
        // Exit with appropriate code for CI
        if (ciReport.summary.status === 'FAILED') {
          console.error('❌ CI SLO enforcement failed - build should fail');
          process.exit(1);
        } else {
          console.log('✅ CI SLO enforcement passed - build can proceed');
          process.exit(0);
        }
        break;
        
      case '--regression-check':
      case '--regression-check-only':
        console.log('📊 Checking for performance regressions...');
        enforcer.start();
        enforcer.checkPerformanceRegressions();
        
        const regressionReport = enforcer.generateReport();
        if (regressionReport.violations.some(v => v.type === 'performance_regression')) {
          console.log('⚠️  Performance regression detected');
          enforcer.displaySummary(regressionReport);
          process.exit(1);
        } else {
          console.log('✅ No performance regressions detected');
          process.exit(0);
        }
        break;
        
      case '--help':
      case '-h':
        console.log(`
🦸‍♂️ MIT HERO SYSTEM - SLO ENFORCER

Usage: node scripts/slo-enforcer.js [command]

Commands:
  --init, --initialize     Initialize SLO enforcement system
  --validate, --validate-only  Run SLO validation only
  --monitor, --monitor-only    Start continuous monitoring
  --report, --report-only      Generate SLO report
  --test, --test-only          Run in test mode
  --hero-status, --hero-status-only  Check MIT Hero System status
  --ci-enforce, --ci-enforce-only    CI enforcement mode
  --regression-check, --regression-check-only  Check for regressions
  --help, -h                  Show this help message

Examples:
  npm run slo:init           # Initialize system
  npm run slo:validate       # Run validation
  npm run slo:monitor        # Start monitoring
  npm run slo:ci:enforce     # CI enforcement
        `);
        break;
        
      default:
        console.log(`⚠️  Unknown command: ${command}`);
        console.log('Use --help for available commands');
        process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ SLO enforcement failed:', error);
    process.exit(1);
  }
}

// Export for use as module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SLOEnforcer;
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error in SLO enforcer:', error);
    process.exit(1);
  });
}
