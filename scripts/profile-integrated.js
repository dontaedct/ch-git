#!/usr/bin/env node

/**
 * Integrated Profiler for MIT Hero System
 * 
 * Comprehensive profiling utility that combines memory and CPU profiling:
 * - Simultaneous memory and CPU monitoring
 * - Cross-correlation analysis
 * - Performance regression detection
 * - Automated profiling workflows
 * - Integration with existing monitoring
 * 
 * Usage:
 *   npm run profile:integrated                    # Full system profile
 *   npm run profile:integrated --build            # Profile during build
 *   npm run profile:integrated --test             # Profile during tests
 *   npm run profile:integrated --duration=60000  # Profile for 1 minute
 *   npm run profile:integrated --export           # Export all data
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Import profiling classes
const MemoryProfiler = require('./profile-memory');
const CPUProfiler = require('./profile-cpu');

// Configuration
const DEFAULT_CONFIG = {
  duration: 60000,        // 1 minute
  memoryInterval: 10000,  // 10 seconds
  cpuSampling: 1000,     // 1ms
  outputDir: './reports/profiles',
  enableMemoryProfiling: true,
  enableCPUProfiling: true,
  enableBuildProfiling: false,
  enableTestProfiling: false,
  enableCrossCorrelation: true,
  enableRegressionDetection: true,
  verbose: false
};

class IntegratedProfiler {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.memoryProfiler = null;
    this.cpuProfiler = null;
    this.startTime = Date.now();
    this.isProfiling = false;
    this.correlationData = [];
    this.regressionAlerts = [];
    
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
   * Initialize profilers
   */
  initializeProfilers() {
    if (this.config.enableMemoryProfiling) {
      this.memoryProfiler = new MemoryProfiler({
        interval: this.config.memoryInterval,
        duration: this.config.duration,
        outputDir: this.config.outputDir,
        verbose: this.config.verbose
      });
    }

    if (this.config.enableCPUProfiling) {
      this.cpuProfiler = new CPUProfiler({
        duration: this.config.duration,
        sampling: this.config.cpuSampling,
        outputDir: this.config.outputDir,
        verbose: this.config.verbose
      });
    }
  }

  /**
   * Start integrated profiling
   */
  start() {
    if (this.isProfiling) {
      console.log('⚠️  Integrated profiling already in progress');
      return;
    }

    console.log('🚀 Starting integrated profiling...');
    console.log(`⏱️  Duration: ${this.config.duration}ms`);
    console.log(`📊 Memory interval: ${this.config.memoryInterval}ms`);
    console.log(`⚡ CPU sampling: ${this.config.cpuSampling}ms`);
    console.log(`📁 Output: ${this.config.outputDir}`);

    this.initializeProfilers();
    this.isProfiling = true;
    this.startTime = Date.now();

    // Start memory profiling
    if (this.memoryProfiler) {
      this.memoryProfiler.start();
    }

    // Start CPU profiling
    if (this.cpuProfiler) {
      this.cpuProfiler.start();
    }

    // Start cross-correlation analysis
    if (this.config.enableCrossCorrelation) {
      this.startCrossCorrelation();
    }

    // Stop profiling after duration
    setTimeout(() => {
      this.stop();
    }, this.config.duration);
  }

  /**
   * Stop integrated profiling
   */
  stop() {
    if (!this.isProfiling) {
      console.log('⚠️  Integrated profiling not running');
      return;
    }

    console.log('🛑 Stopping integrated profiling...');
    
    this.isProfiling = false;

    // Stop individual profilers
    if (this.memoryProfiler) {
      this.memoryProfiler.stop();
    }

    if (this.cpuProfiler) {
      this.cpuProfiler.stop();
    }

    // Generate integrated report
    this.generateIntegratedReport();
  }

  /**
   * Start cross-correlation analysis
   */
  startCrossCorrelation() {
    if (!this.config.enableCrossCorrelation) return;

    const correlationInterval = setInterval(() => {
      if (!this.isProfiling) {
        clearInterval(correlationInterval);
        return;
      }

      this.analyzeCrossCorrelation();
    }, 5000); // Every 5 seconds
  }

  /**
   * Analyze cross-correlation between memory and CPU
   */
  analyzeCrossCorrelation() {
    if (!this.memoryProfiler || !this.cpuProfiler) return;

    const memorySnapshot = this.memoryProfiler.snapshots[this.memoryProfiler.snapshots.length - 1];
    const cpuSample = this.cpuProfiler.samples[this.cpuProfiler.samples.length - 1];

    if (!memorySnapshot || !cpuSample) return;

    const correlation = {
      timestamp: Date.now(),
      memoryUsage: memorySnapshot.memory.heapUsed,
      cpuUsage: cpuSample.cpu.usage,
      correlation: this.calculateCorrelation(
        this.memoryProfiler.memoryHistory.slice(-10).map(m => m.heapUsed),
        this.cpuProfiler.cpuUsage.slice(-10).map(c => c.usage)
      )
    };

    this.correlationData.push(correlation);

    // Check for anomalies
    if (correlation.correlation > 0.8) {
      this.regressionAlerts.push({
        type: 'high_correlation',
        severity: 'medium',
        description: `High correlation between memory and CPU usage: ${Math.round(correlation.correlation * 100)}%`,
        recommendation: 'Investigate if memory pressure is causing CPU spikes',
        timestamp: correlation.timestamp
      });
    }
  }

  /**
   * Calculate correlation coefficient
   */
  calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length < 2) return 0;

    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
    const sumX2 = x.reduce((a, b) => a + b * b, 0);
    const sumY2 = y.reduce((a, b) => a + b * b, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Profile build process with integrated monitoring
   */
  async profileBuild() {
    if (!this.config.enableBuildProfiling) {
      console.log('⚠️  Build profiling disabled');
      return;
    }

    console.log('🔨 Starting integrated build profiling...');
    
    const buildStart = Date.now();
    const buildMetrics = {
      startTime: buildStart,
      phases: [],
      totalTime: 0,
      memory: [],
      cpu: [],
      exitCode: 0
    };

    try {
      // Start profiling before build
      this.start();

      // Profile npm build command
      const buildProcess = spawn('npm', ['run', 'build'], {
        stdio: 'pipe',
        shell: true
      });

      // Monitor build process
      buildProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Compiled') || output.includes('Built')) {
          buildMetrics.phases.push({
            phase: 'compilation',
            timestamp: Date.now(),
            output: output.trim()
          });
        }
      });

      buildProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Error') || output.includes('Warning')) {
          buildMetrics.phases.push({
            phase: 'error',
            timestamp: Date.now(),
            output: output.trim()
          });
        }
      });

      // Wait for build completion
      await new Promise((resolve, reject) => {
        buildProcess.on('close', (code) => {
          buildMetrics.totalTime = Date.now() - buildStart;
          buildMetrics.exitCode = code;
          
          if (code === 0) {
            console.log('✅ Build completed successfully');
            resolve();
          } else {
            console.log(`❌ Build failed with exit code ${code}`);
            reject(new Error(`Build failed with exit code ${code}`));
          }
        });
      });

      // Stop profiling after build
      this.stop();

      console.log(`🔨 Integrated build profiling completed in ${buildMetrics.totalTime}ms`);
      
    } catch (error) {
      console.error('❌ Build profiling failed:', error.message);
      this.stop();
    }
  }

  /**
   * Profile test execution with integrated monitoring
   */
  async profileTests() {
    if (!this.config.enableTestProfiling) {
      console.log('⚠️  Test profiling disabled');
      return;
    }

    console.log('🧪 Starting integrated test profiling...');
    
    const testStart = Date.now();
    const testMetrics = {
      startTime: testStart,
      suites: [],
      totalTime: 0,
      passed: 0,
      failed: 0,
      exitCode: 0
    };

    try {
      // Start profiling before tests
      this.start();

      // Profile npm test command
      const testProcess = spawn('npm', ['test'], {
        stdio: 'pipe',
        shell: true
      });

      // Monitor test process
      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('PASS') || output.includes('FAIL')) {
          testMetrics.suites.push({
            timestamp: Date.now(),
            output: output.trim()
          });
        }
      });

      // Wait for test completion
      await new Promise((resolve, reject) => {
        testProcess.on('close', (code) => {
          testMetrics.totalTime = Date.now() - testStart;
          testMetrics.exitCode = code;
          
          if (code === 0) {
            console.log('✅ Tests completed successfully');
            resolve();
          } else {
            console.log(`❌ Tests failed with exit code ${code}`);
            reject(new Error(`Tests failed with exit code ${code}`));
          }
        });
      });

      // Stop profiling after tests
      this.stop();

      console.log(`🧪 Integrated test profiling completed in ${testMetrics.totalTime}ms`);
      
    } catch (error) {
      console.error('❌ Test profiling failed:', error.message);
      this.stop();
    }
  }

  /**
   * Detect performance regressions
   */
  detectRegressions() {
    if (!this.config.enableRegressionDetection) return [];

    const regressions = [];

    // Check for memory regressions
    if (this.memoryProfiler) {
      const memoryPatterns = this.memoryProfiler.analyzeMemoryPatterns();
      if (memoryPatterns.trend === 'growing' && memoryPatterns.growthMB > 20) {
        regressions.push({
          type: 'memory_regression',
          severity: 'high',
          description: `Memory growth trend: ${memoryPatterns.growthMB}MB`,
          recommendation: 'Investigate memory leaks or inefficient memory usage',
          timestamp: Date.now()
        });
      }
    }

    // Check for CPU regressions
    if (this.cpuProfiler) {
      const cpuPatterns = this.cpuProfiler.analyzeCPUPatterns();
      if (cpuPatterns.avgUsage > 90) {
        regressions.push({
          type: 'cpu_regression',
          severity: 'high',
          description: `High CPU usage: ${cpuPatterns.avgUsage}%`,
          recommendation: 'Optimize CPU-intensive operations or scale resources',
          timestamp: Date.now()
        });
      }
    }

    // Add cross-correlation alerts
    regressions.push(...this.regressionAlerts);

    return regressions;
  }

  /**
   * Generate integrated report
   */
  generateIntegratedReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      config: this.config,
      memory: this.memoryProfiler ? {
        snapshots: this.memoryProfiler.snapshots.length,
        patterns: this.memoryProfiler.analyzeMemoryPatterns(),
        leaks: this.memoryProfiler.detectMemoryLeaks(),
        recommendations: this.memoryProfiler.generateRecommendations()
      } : null,
      cpu: this.cpuProfiler ? {
        samples: this.cpuProfiler.samples.length,
        patterns: this.cpuProfiler.analyzeCPUPatterns(),
        bottlenecks: this.cpuProfiler.identifyBottlenecks(),
        optimizations: this.cpuProfiler.generateOptimizations(),
        functionStats: Array.from(this.cpuProfiler.functionCalls.values())
      } : null,
      crossCorrelation: {
        dataPoints: this.correlationData.length,
        averageCorrelation: this.correlationData.length > 0 
          ? this.correlationData.reduce((sum, d) => sum + d.correlation, 0) / this.correlationData.length 
          : 0
      },
      regressions: this.detectRegressions(),
      summary: this.generateSummary()
    };

    // Save report
    const filename = `integrated-profile-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 Integrated profile report saved: ${filepath}`);
    
    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    const summary = {
      duration: Math.round((Date.now() - this.startTime) / 1000) + 's',
      memoryProfiled: this.memoryProfiler !== null,
      cpuProfiled: this.cpuProfiler !== null,
      crossCorrelationEnabled: this.config.enableCrossCorrelation,
      regressionDetectionEnabled: this.config.enableRegressionDetection
    };

    if (this.memoryProfiler) {
      const memoryPatterns = this.memoryProfiler.analyzeMemoryPatterns();
      summary.memoryTrend = memoryPatterns.trend;
      summary.memoryGrowth = memoryPatterns.growthMB + 'MB';
    }

    if (this.cpuProfiler) {
      const cpuPatterns = this.cpuProfiler.analyzeCPUPatterns();
      summary.cpuTrend = cpuPatterns.trend;
      summary.avgCPUUsage = cpuPatterns.avgUsage + '%';
    }

    return summary;
  }

  /**
   * Display summary to console
   */
  displaySummary(report) {
    console.log('\n📊 INTEGRATED PROFILE SUMMARY');
    console.log('==============================');
    console.log(`⏱️  Duration: ${report.summary.duration}`);
    console.log(`📊 Memory Profiling: ${report.summary.memoryProfiled ? '✅' : '❌'}`);
    console.log(`⚡ CPU Profiling: ${report.summary.cpuProfiled ? '✅' : '❌'}`);
    console.log(`🔗 Cross-Correlation: ${report.summary.crossCorrelationEnabled ? '✅' : '❌'}`);
    console.log(`🚨 Regression Detection: ${report.summary.regressionDetectionEnabled ? '✅' : '❌'}`);

    if (report.memory) {
      console.log(`\n📊 MEMORY ANALYSIS:`);
      console.log(`  Trend: ${report.memory.patterns.trend}`);
      console.log(`  Growth: ${report.memory.patterns.growthMB}MB`);
      console.log(`  Leaks: ${report.memory.leaks.length}`);
    }

    if (report.cpu) {
      console.log(`\n⚡ CPU ANALYSIS:`);
      console.log(`  Trend: ${report.cpu.patterns.trend}`);
      console.log(`  Avg Usage: ${report.cpu.patterns.avgUsage}%`);
      console.log(`  Bottlenecks: ${report.cpu.bottlenecks.length}`);
      console.log(`  Functions: ${report.cpu.functionStats.length}`);
    }

    if (report.regressions.length > 0) {
      console.log(`\n🚨 PERFORMANCE REGRESSIONS:`);
      report.regressions.forEach((regression, i) => {
        console.log(`  ${i + 1}. ${regression.description}`);
        console.log(`     Recommendation: ${regression.recommendation}`);
      });
    }

    console.log(`\n📁 Report saved to: ${path.join(this.config.outputDir)}`);
  }

  /**
   * Export all profiling data
   */
  exportData() {
    const exportData = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        system: process.platform,
        nodeVersion: process.version,
        config: this.config
      },
      memory: this.memoryProfiler ? {
        snapshots: this.memoryProfiler.snapshots,
        memoryHistory: this.memoryProfiler.memoryHistory,
        analysis: {
          patterns: this.memoryProfiler.analyzeMemoryPatterns(),
          leaks: this.memoryProfiler.detectMemoryLeaks(),
          recommendations: this.memoryProfiler.generateRecommendations()
        }
      } : null,
      cpu: this.cpuProfiler ? {
        samples: this.cpuProfiler.samples,
        cpuUsage: this.cpuProfiler.cpuUsage,
        functionCalls: Array.from(this.cpuProfiler.functionCalls.values()),
        analysis: {
          patterns: this.cpuProfiler.analyzeCPUPatterns(),
          bottlenecks: this.cpuProfiler.identifyBottlenecks(),
          optimizations: this.cpuProfiler.generateOptimizations()
        }
      } : null,
      crossCorrelation: {
        data: this.correlationData,
        analysis: {
          dataPoints: this.correlationData.length,
          averageCorrelation: this.correlationData.length > 0 
            ? this.correlationData.reduce((sum, d) => sum + d.correlation, 0) / this.correlationData.length 
            : 0
        }
      },
      regressions: this.detectRegressions()
    };

    const filename = `integrated-export-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`📤 Integrated profiling data exported: ${filepath}`);
    return filepath;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const config = { ...DEFAULT_CONFIG };
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--duration=')) {
      config.duration = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.duration;
    } else if (arg.startsWith('--memory-interval=')) {
      config.memoryInterval = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.memoryInterval;
    } else if (arg.startsWith('--cpu-sampling=')) {
      config.cpuSampling = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.cpuSampling;
    } else if (arg === '--build') {
      config.enableBuildProfiling = true;
    } else if (arg === '--test') {
      config.enableTestProfiling = true;
    } else if (arg === '--export') {
      config.enableMemoryProfiling = false;
      config.enableCPUProfiling = false;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      return;
    }
  }

  const profiler = new IntegratedProfiler(config);

  // Handle different modes
  if (args.includes('--build')) {
    profiler.profileBuild();
  } else if (args.includes('--test')) {
    profiler.profileTests();
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
Integrated Profiler for MIT Hero System

Usage:
  npm run profile:integrated [options]

Options:
  --duration=<ms>           Profiling duration in milliseconds (default: 60000)
  --memory-interval=<ms>    Memory sampling interval in milliseconds (default: 10000)
  --cpu-sampling=<ms>       CPU sampling interval in milliseconds (default: 1000)
  --build                   Profile during build process
  --test                    Profile during test execution
  --export                  Export all profiling data
  --verbose                 Enable verbose logging
  --help, -h               Show this help message

Examples:
  npm run profile:integrated                           # Full system profile for 1 minute
  npm run profile:integrated --duration=300000        # Profile for 5 minutes
  npm run profile:integrated --memory-interval=5000   # Memory sample every 5 seconds
  npm run profile:integrated --cpu-sampling=500       # CPU sample every 500ms
  npm run profile:integrated --build                  # Profile during build
  npm run profile:integrated --test                   # Profile during tests
  npm run profile:integrated --export                 # Export all data

Features:
  🔄 Simultaneous memory and CPU monitoring
  🔗 Cross-correlation analysis
  🚨 Performance regression detection
  📊 Integrated reporting and analysis
  🔨 Build and test process profiling
  📤 Comprehensive data export

Output:
  Reports are saved to ./reports/profiles/
  Each run generates a comprehensive JSON report
  Cross-correlation analysis identifies related performance issues
  Regression detection alerts on performance degradation
  Integration with existing monitoring systems
`);
}

if (require.main === module) {
  main();
}

module.exports = IntegratedProfiler;
