#!/usr/bin/env node

const { performance } = require('perf_hooks');
const fs = require('fs');
const path = require('path');

class BuildPerformanceMonitor {
  constructor() {
    this.startTime = 0;
    this.checkpoints = new Map();
    this.metrics = {
      totalTime: 0,
      phases: {},
      cacheHits: 0,
      cacheMisses: 0,
      memoryUsage: [],
      cpuUsage: []
    };
  }

  start() {
    this.startTime = performance.now();
    this.checkpoint('build_start');
    console.log('🚀 Build Performance Monitor Started');
    
    // Monitor system resources
    this.startResourceMonitoring();
  }

  checkpoint(name) {
    const now = performance.now();
    const elapsed = now - this.startTime;
    this.checkpoints.set(name, { time: now, elapsed });
    
    console.log(`⏱️  Checkpoint: ${name} (${elapsed.toFixed(2)}ms)`);
  }

  end() {
    const endTime = performance.now();
    this.metrics.totalTime = endTime - this.startTime;
    
    this.checkpoint('build_end');
    this.stopResourceMonitoring();
    this.generateReport();
  }

  startResourceMonitoring() {
    // Monitor memory usage
    this.memoryInterval = setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memoryUsage.push({
        timestamp: Date.now(),
        rss: memUsage.rss,
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal
      });
    }, 1000);

    // Monitor CPU usage
    this.cpuInterval = setInterval(() => {
      const cpuUsage = process.cpuUsage();
      this.metrics.cpuUsage.push({
        timestamp: Date.now(),
        user: cpuUsage.user,
        system: cpuUsage.system
      });
    }, 1000);
  }

  stopResourceMonitoring() {
    if (this.memoryInterval) clearInterval(this.memoryInterval);
    if (this.cpuInterval) clearInterval(this.cpuInterval);
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalBuildTime: this.metrics.totalTime,
      totalBuildTimeSeconds: (this.metrics.totalTime / 1000).toFixed(2),
      checkpoints: Object.fromEntries(
        Array.from(this.checkpoints.entries()).map(([name, data]) => [
          name,
          {
            elapsed: data.elapsed.toFixed(2),
            elapsedSeconds: (data.elapsed / 1000).toFixed(2)
          }
        ])
      ),
      performance: {
        target: 'Under 10 seconds',
        achieved: this.metrics.totalTime < 10000 ? '✅ YES' : '❌ NO',
        improvement: this.metrics.totalTime > 10000 ? 
          `${((this.metrics.totalTime - 10000) / 1000).toFixed(2)}s over target` : 
          `${(10 - this.metrics.totalTime / 1000).toFixed(2)}s under target`
      },
      recommendations: this.generateRecommendations(),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpus: require('os').cpus().length
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
    console.log('\n📊 BUILD PERFORMANCE REPORT');
    console.log('============================');
    console.log(`⏱️  Total Build Time: ${report.totalBuildTimeSeconds}s`);
    console.log(`🎯 Target: ${report.performance.target}`);
    console.log(`✅ Achieved: ${report.performance.achieved}`);
    console.log(`📈 Status: ${report.performance.improvement}`);
    console.log(`📁 Report saved to: ${reportPath}`);

    if (report.performance.achieved === '❌ NO') {
      console.log('\n🚨 PERFORMANCE RECOMMENDATIONS:');
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
  }

  generateRecommendations() {
    const recommendations = [];
    const buildTime = this.metrics.totalTime / 1000;

    if (buildTime > 15) {
      recommendations.push('Consider using build:fast or build:minimal for development');
      recommendations.push('Enable SWC compilation for faster TypeScript processing');
      recommendations.push('Review and optimize large dependencies');
    }

    if (buildTime > 12) {
      recommendations.push('Enable webpack persistent caching');
      recommendations.push('Optimize module resolution and path mapping');
      recommendations.push('Consider code splitting for large components');
    }

    if (buildTime > 10) {
      recommendations.push('Enable incremental compilation');
      recommendations.push('Optimize TypeScript configuration');
      recommendations.push('Review bundle analyzer output');
    }

    return recommendations;
  }

  // Cache monitoring methods
  recordCacheHit() {
    this.metrics.cacheHits++;
  }

  recordCacheMiss() {
    this.metrics.cacheMisses++;
  }
}

// Export for use in other scripts
module.exports = BuildPerformanceMonitor;

// Run directly if called from command line
if (require.main === module) {
  const monitor = new BuildPerformanceMonitor();
  
  // Handle process signals
  process.on('SIGINT', () => {
    console.log('\n🛑 Build interrupted, generating report...');
    monitor.end();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n🛑 Build terminated, generating report...');
    monitor.end();
    process.exit(0);
  });

  // Start monitoring
  monitor.start();
  
  // Keep process alive
  process.stdin.resume();
}
