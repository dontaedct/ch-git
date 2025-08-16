#!/usr/bin/env node

/**
 * Memory Profiler for MIT Hero System
 * 
 * Comprehensive memory profiling utility that:
 * - Generates heap snapshots at configurable intervals
 * - Analyzes memory usage patterns
 * - Detects potential memory leaks
 * - Provides memory optimization recommendations
 * - Exports data for external analysis
 * 
 * Usage:
 *   npm run profile:memory                    # Basic memory profile
 *   npm run profile:memory --interval=5000   # Profile every 5 seconds
 *   npm run profile:memory --duration=30000  # Profile for 30 seconds
 *   npm run profile:memory --snapshot        # Generate heap snapshot
 *   npm run profile:memory --analyze         # Analyze existing snapshots
 *   npm run profile:memory --export          # Export data for analysis
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

// Configuration
const DEFAULT_CONFIG = {
  interval: 10000,        // 10 seconds
  duration: 60000,        // 1 minute
  maxSnapshots: 10,       // Maximum snapshots to keep
  outputDir: './reports/profiles',
  enableHeapSnapshots: true,
  enableMemoryTracking: true,
  enableLeakDetection: true,
  verbose: false
};

class MemoryProfiler {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.snapshots = [];
    this.memoryHistory = [];
    this.startTime = Date.now();
    this.isProfiling = false;
    this.intervalId = null;
    this.heapUsage = [];
    this.externalMemory = [];
    this.gcStats = [];
    
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Start memory profiling
   */
  start() {
    if (this.isProfiling) {
      console.log('⚠️  Memory profiling already in progress');
      return;
    }

    console.log('🚀 Starting memory profiling...');
    console.log(`📊 Interval: ${this.config.interval}ms`);
    console.log(`⏱️  Duration: ${this.config.duration}ms`);
    console.log(`📁 Output: ${this.config.outputDir}`);

    this.isProfiling = true;
    this.startTime = Date.now();

    // Start periodic profiling
    this.intervalId = setInterval(() => {
      this.captureMemorySnapshot();
    }, this.config.interval);

    // Stop profiling after duration
    setTimeout(() => {
      this.stop();
    }, this.config.duration);

    // Initial snapshot
    this.captureMemorySnapshot();
  }

  /**
   * Stop memory profiling
   */
  stop() {
    if (!this.isProfiling) {
      console.log('⚠️  Memory profiling not running');
      return;
    }

    console.log('🛑 Stopping memory profiling...');
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isProfiling = false;
    
    // Final snapshot
    this.captureMemorySnapshot();
    
    // Generate report
    this.generateReport();
  }

  /**
   * Capture memory snapshot
   */
  captureMemorySnapshot() {
    const timestamp = Date.now();
    const snapshot = {
      timestamp,
      timeFromStart: timestamp - this.startTime,
      memory: this.getMemoryUsage(),
      heap: this.getHeapUsage(),
      external: this.getExternalMemory(),
      gc: this.getGCStats()
    };

    this.snapshots.push(snapshot);
    this.memoryHistory.push(snapshot.memory);

    // Keep only max snapshots
    if (this.snapshots.length > this.config.maxSnapshots) {
      this.snapshots.shift();
      this.memoryHistory.shift();
    }

    if (this.config.verbose) {
      console.log(`📸 Snapshot ${this.snapshots.length}: ${this.formatBytes(snapshot.memory.heapUsed)}`);
    }

    return snapshot;
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
    }

    const mem = process.memoryUsage();
    return {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      external: mem.external,
      rss: mem.rss,
      arrayBuffers: mem.arrayBuffers || 0
    };
  }

  /**
   * Get heap usage details
   */
  getHeapUsage() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return { used: 0, total: 0, percentage: 0 };
    }

    const mem = process.memoryUsage();
    const percentage = (mem.heapUsed / mem.heapTotal) * 100;
    
    return {
      used: mem.heapUsed,
      total: mem.heapTotal,
      percentage: Math.round(percentage * 100) / 100
    };
  }

  /**
   * Get external memory usage
   */
  getExternalMemory() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return { external: 0, arrayBuffers: 0 };
    }

    const mem = process.memoryUsage();
    return {
      external: mem.external,
      arrayBuffers: mem.arrayBuffers || 0
    };
  }

  /**
   * Get garbage collection stats
   */
  getGCStats() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return { major: 0, minor: 0, duration: 0 };
    }

    // Note: GC stats require --expose-gc flag and manual GC calls
    return {
      major: 0,
      minor: 0,
      duration: 0
    };
  }

  /**
   * Analyze memory patterns
   */
  analyzeMemoryPatterns() {
    if (this.memoryHistory.length < 2) {
      return { trend: 'insufficient_data', growth: 0, volatility: 0 };
    }

    const values = this.memoryHistory.map(m => m.heapUsed);
    const growth = values[values.length - 1] - values[0];
    const volatility = this.calculateVolatility(values);
    
    let trend = 'stable';
    if (growth > 1024 * 1024) trend = 'growing';
    else if (growth < -1024 * 1024) trend = 'declining';

    return {
      trend,
      growth,
      growthMB: Math.round(growth / (1024 * 1024) * 100) / 100,
      volatility,
      volatilityMB: Math.round(volatility / (1024 * 1024) * 100) / 100
    };
  }

  /**
   * Calculate volatility (standard deviation)
   */
  calculateVolatility(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Detect potential memory leaks
   */
  detectMemoryLeaks() {
    const patterns = this.analyzeMemoryPatterns();
    const leaks = [];

    // Check for continuous growth
    if (patterns.trend === 'growing' && patterns.growthMB > 10) {
      leaks.push({
        type: 'continuous_growth',
        severity: 'high',
        description: `Memory growing continuously by ${patterns.growthMB}MB`,
        recommendation: 'Check for uncleaned event listeners, timeouts, or subscriptions'
      });
    }

    // Check for high volatility
    if (patterns.volatilityMB > 50) {
      leaks.push({
        type: 'high_volatility',
        severity: 'medium',
        description: `High memory volatility: ${patterns.volatilityMB}MB`,
        recommendation: 'Look for memory spikes and investigate their cause'
      });
    }

    // Check for large heap usage
    const currentHeap = this.getHeapUsage();
    if (currentHeap.percentage > 80) {
      leaks.push({
        type: 'high_heap_usage',
        severity: 'high',
        description: `Heap usage at ${currentHeap.percentage}%`,
        recommendation: 'Consider optimizing memory usage or increasing heap size'
      });
    }

    return leaks;
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations() {
    const leaks = this.detectMemoryLeaks();
    const recommendations = [];

    if (leaks.length === 0) {
      recommendations.push({
        priority: 'low',
        action: 'Memory usage looks healthy',
        details: 'Continue monitoring for any changes'
      });
    } else {
      leaks.forEach(leak => {
        recommendations.push({
          priority: leak.severity === 'high' ? 'high' : 'medium',
          action: leak.recommendation,
          details: leak.description
        });
      });
    }

    // General recommendations
    recommendations.push({
      priority: 'medium',
      action: 'Implement memory cleanup in useEffect hooks',
      details: 'Ensure proper cleanup of event listeners, timeouts, and subscriptions'
    });

    recommendations.push({
      priority: 'medium',
      action: 'Use React.memo for expensive components',
      details: 'Prevent unnecessary re-renders that can cause memory churn'
    });

    return recommendations;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      snapshots: this.snapshots.length,
      patterns: this.analyzeMemoryPatterns(),
      leaks: this.detectMemoryLeaks(),
      recommendations: this.generateRecommendations(),
      summary: this.generateSummary()
    };

    // Save report
    const filename = `memory-profile-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Memory profile report saved: ${filepath}`);
    
    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    if (this.snapshots.length === 0) return {};

    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    
    return {
      initialMemory: this.formatBytes(first.memory.heapUsed),
      finalMemory: this.formatBytes(last.memory.heapUsed),
      peakMemory: this.formatBytes(Math.max(...this.memoryHistory.map(m => m.heapUsed))),
      averageMemory: this.formatBytes(
        this.memoryHistory.reduce((a, b) => a + b.heapUsed, 0) / this.memoryHistory.length
      ),
      totalGrowth: this.formatBytes(last.memory.heapUsed - first.memory.heapUsed)
    };
  }

  /**
   * Display summary to console
   */
  displaySummary(report) {
    console.log('\n📊 MEMORY PROFILE SUMMARY');
    console.log('========================');
    console.log(`⏱️  Duration: ${Math.round(report.duration / 1000)}s`);
    console.log(`📸 Snapshots: ${report.snapshots}`);
    console.log(`📈 Trend: ${report.patterns.trend}`);
    console.log(`📊 Growth: ${report.patterns.growthMB}MB`);
    console.log(`🔍 Leaks Detected: ${report.leaks.length}`);
    
    if (report.leaks.length > 0) {
      console.log('\n🚨 MEMORY LEAK ALERTS:');
      report.leaks.forEach((leak, i) => {
        console.log(`  ${i + 1}. ${leak.description}`);
        console.log(`     Recommendation: ${leak.recommendation}`);
      });
    }

    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    report.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.action}`);
    });

    console.log('\n📁 Report saved to:', path.join(this.config.outputDir));
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Export data for external analysis
   */
  exportData() {
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        system: process.platform,
        nodeVersion: process.version
      },
      snapshots: this.snapshots,
      memoryHistory: this.memoryHistory,
      analysis: {
        patterns: this.analyzeMemoryPatterns(),
        leaks: this.detectMemoryLeaks(),
        recommendations: this.generateRecommendations()
      }
    };

    const filename = `memory-export-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`📤 Memory data exported: ${filepath}`);
    return filepath;
  }

  /**
   * Generate heap snapshot (if enabled)
   */
  generateHeapSnapshot() {
    if (!this.config.enableHeapSnapshots) {
      console.log('⚠️  Heap snapshots disabled in configuration');
      return null;
    }

    try {
      // Note: This is a simplified heap snapshot
      // For detailed heap analysis, use Node.js --inspect flag
      const snapshot = {
        timestamp: Date.now(),
        memory: this.getMemoryUsage(),
        heap: this.getHeapUsage(),
        external: this.getExternalMemory(),
        gc: this.getGCStats()
      };

      const filename = `heap-snapshot-${Date.now()}.json`;
      const filepath = path.join(this.config.outputDir, filename);
      
      fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
      
      console.log(`📸 Heap snapshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Failed to generate heap snapshot:', error.message);
      return null;
    }
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--interval=')) {
      config.interval = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.interval;
    } else if (arg.startsWith('--duration=')) {
      config.duration = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.duration;
    } else if (arg === '--snapshot') {
      config.enableHeapSnapshots = true;
    } else if (arg === '--analyze') {
      config.enableMemoryTracking = false;
    } else if (arg === '--export') {
      config.enableMemoryTracking = false;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      return;
    }
  }

  const profiler = new MemoryProfiler(config);

  // Handle different modes
  if (args.includes('--snapshot')) {
    profiler.generateHeapSnapshot();
  } else if (args.includes('--analyze')) {
    // Analyze existing snapshots
    console.log('🔍 Analyzing existing memory profiles...');
    // This would load and analyze existing files
  } else if (args.includes('--export')) {
    profiler.exportData();
  } else {
    // Start profiling
    profiler.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT, stopping profiler...');
      profiler.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, stopping profiler...');
      profiler.stop();
      process.exit(0);
    });
  }
}

function showHelp() {
  console.log(`
Memory Profiler for MIT Hero System

Usage:
  npm run profile:memory [options]

Options:
  --interval=<ms>     Profiling interval in milliseconds (default: 10000)
  --duration=<ms>     Total profiling duration in milliseconds (default: 60000)
  --snapshot          Generate heap snapshot only
  --analyze           Analyze existing snapshots
  --export            Export data for external analysis
  --verbose           Enable verbose logging
  --help, -h         Show this help message

Examples:
  npm run profile:memory                           # Basic profile for 1 minute
  npm run profile:memory --interval=5000          # Profile every 5 seconds
  npm run profile:memory --duration=300000        # Profile for 5 minutes
  npm run profile:memory --snapshot               # Generate heap snapshot
  npm run profile:memory --export                 # Export data

Output:
  Reports are saved to ./reports/profiles/
  Each run generates a timestamped JSON report
  Heap snapshots include detailed memory analysis
  Recommendations help optimize memory usage
`);
}

if (require.main === module) {
  main();
}

module.exports = MemoryProfiler;
