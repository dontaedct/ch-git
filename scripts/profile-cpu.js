#!/usr/bin/env node

/**
 * CPU Profiler for MIT Hero System
 * 
 * Comprehensive CPU profiling utility that:
 * - Generates CPU profiles during operations
 * - Identifies performance bottlenecks
 * - Measures function execution times
 * - Provides optimization suggestions
 * - Supports different profiling modes
 * 
 * Usage:
 *   npm run profile:cpu                     # Basic CPU profile
 *   npm run profile:cpu --duration=30000   # Profile for 30 seconds
 *   npm run profile:cpu --sampling=1000    # Sample every 1ms
 *   npm run profile:cpu --build            # Profile during build process
 *   npm run profile:cpu --test             # Profile during test execution
 *   npm run profile:cpu --export           # Export data for analysis
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { spawn } = require('child_process');

// Configuration
const DEFAULT_CONFIG = {
  duration: 30000,        // 30 seconds
  sampling: 1000,         // 1ms sampling interval
  outputDir: './reports/profiles',
  enableCPUProfiling: true,
  enableFunctionProfiling: true,
  enableBuildProfiling: false,
  enableTestProfiling: false,
  verbose: false,
  maxSamples: 10000
};

class CPUProfiler {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.samples = [];
    this.functionCalls = new Map();
    this.startTime = Date.now();
    this.isProfiling = false;
    this.intervalId = null;
    this.cpuUsage = [];
    this.processUsage = [];
    this.buildMetrics = [];
    this.testMetrics = [];
    
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
   * Start CPU profiling
   */
  start() {
    if (this.isProfiling) {
      console.log('⚠️  CPU profiling already in progress');
      return;
    }

    console.log('🚀 Starting CPU profiling...');
    console.log(`⏱️  Duration: ${this.config.duration}ms`);
    console.log(`📊 Sampling: ${this.config.sampling}ms`);
    console.log(`📁 Output: ${this.config.outputDir}`);

    this.isProfiling = true;
    this.startTime = Date.now();

    // Start periodic sampling
    this.intervalId = setInterval(() => {
      this.captureCPUSample();
    }, this.config.sampling);

    // Stop profiling after duration
    setTimeout(() => {
      this.stop();
    }, this.config.duration);

    // Initial sample
    this.captureCPUSample();
  }

  /**
   * Stop CPU profiling
   */
  stop() {
    if (!this.isProfiling) {
      console.log('🛑 Stopping CPU profiling...');
      
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      this.isProfiling = false;
      
      // Final sample
      this.captureCPUSample();
      
      // Generate report
      this.generateReport();
    }
  }

  /**
   * Capture CPU sample
   */
  captureCPUSample() {
    const timestamp = Date.now();
    const sample = {
      timestamp,
      timeFromStart: timestamp - this.startTime,
      cpu: this.getCPUUsage(),
      process: this.getProcessUsage(),
      memory: this.getMemoryUsage(),
      load: this.getSystemLoad()
    };

    this.samples.push(sample);
    this.cpuUsage.push(sample.cpu);
    this.processUsage.push(sample.process);

    // Keep only max samples
    if (this.samples.length > this.config.maxSamples) {
      this.samples.shift();
      this.cpuUsage.shift();
      this.processUsage.shift();
    }

    if (this.config.verbose) {
      console.log(`📊 Sample ${this.samples.length}: CPU ${sample.cpu.usage}%`);
    }

    return sample;
  }

  /**
   * Get CPU usage information
   */
  getCPUUsage() {
    const startUsage = process.cpuUsage();
    const startTime = process.hrtime.bigint();
    
    // Small delay to measure CPU usage
    const endUsage = process.cpuUsage(startUsage);
    const endTime = process.hrtime.bigint();
    
    const elapsed = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const usage = (endUsage.user + endUsage.system) / 1000; // Convert to seconds
    
    return {
      user: endUsage.user / 1000,
      system: endUsage.system / 1000,
      total: usage,
      usage: Math.round((usage / elapsed) * 100 * 100) / 100,
      elapsed
    };
  }

  /**
   * Get process usage information
   */
  getProcessUsage() {
    if (typeof process === 'undefined' || !process.memoryUsage) {
      return { cpu: 0, memory: 0, uptime: 0 };
    }

    const mem = process.memoryUsage();
    const uptime = process.uptime();
    
    return {
      cpu: process.cpuUsage(),
      memory: mem.heapUsed,
      uptime,
      pid: process.pid,
      platform: process.platform,
      arch: process.arch
    };
  }

  /**
   * Get memory usage
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
      rss: mem.rss
    };
  }

  /**
   * Get system load (simplified)
   */
  getSystemLoad() {
    // Note: This is a simplified system load measurement
    // For detailed system metrics, use os.loadavg() or external tools
    return {
      load1: 0,
      load5: 0,
      load15: 0
    };
  }

  /**
   * Profile function execution time
   */
  profileFunction(fn, name, context = {}) {
    if (!this.config.enableFunctionProfiling) {
      return fn();
    }

    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const result = fn();
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const executionTime = endTime - startTime;
      const memoryDelta = endMemory.heapUsed - startMemory.heapUsed;
      
      this.recordFunctionCall(name, executionTime, memoryDelta, context);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      this.recordFunctionCall(name, endTime - startTime, 0, { ...context, error: true });
      throw error;
    }
  }

  /**
   * Record function call metrics
   */
  recordFunctionCall(name, executionTime, memoryDelta, context = {}) {
    if (!this.functionCalls.has(name)) {
      this.functionCalls.set(name, {
        name,
        calls: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: Infinity,
        maxTime: 0,
        totalMemory: 0,
        avgMemory: 0,
        errors: 0,
        context: {}
      });
    }

    const stats = this.functionCalls.get(name);
    stats.calls++;
    stats.totalTime += executionTime;
    stats.avgTime = stats.totalTime / stats.calls;
    stats.minTime = Math.min(stats.minTime, executionTime);
    stats.maxTime = Math.max(stats.maxTime, executionTime);
    stats.totalMemory += memoryDelta;
    stats.avgMemory = stats.totalMemory / stats.calls;
    
    if (context.error) {
      stats.errors++;
    }
    
    stats.context = { ...stats.context, ...context };
  }

  /**
   * Profile build process
   */
  async profileBuild() {
    if (!this.config.enableBuildProfiling) {
      console.log('⚠️  Build profiling disabled');
      return;
    }

    console.log('🔨 Starting build profiling...');
    
    const buildStart = Date.now();
    const buildMetrics = {
      startTime: buildStart,
      phases: [],
      totalTime: 0,
      memory: [],
      cpu: []
    };

    try {
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

      this.buildMetrics.push(buildMetrics);
      console.log(`🔨 Build profiling completed in ${buildMetrics.totalTime}ms`);
      
    } catch (error) {
      console.error('❌ Build profiling failed:', error.message);
    }
  }

  /**
   * Profile test execution
   */
  async profileTests() {
    if (!this.config.enableTestProfiling) {
      console.log('⚠️  Test profiling disabled');
      return;
    }

    console.log('🧪 Starting test profiling...');
    
    const testStart = Date.now();
    const testMetrics = {
      startTime: testStart,
      suites: [],
      totalTime: 0,
      passed: 0,
      failed: 0,
      memory: [],
      cpu: []
    };

    try {
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

      this.testMetrics.push(testMetrics);
      console.log(`🧪 Test profiling completed in ${testMetrics.totalTime}ms`);
      
    } catch (error) {
      console.error('❌ Test profiling failed:', error.message);
    }
  }

  /**
   * Analyze CPU patterns
   */
  analyzeCPUPatterns() {
    if (this.cpuUsage.length < 2) {
      return { trend: 'insufficient_data', avgUsage: 0, volatility: 0 };
    }

    const usageValues = this.cpuUsage.map(cpu => cpu.usage);
    const avgUsage = usageValues.reduce((a, b) => a + b, 0) / usageValues.length;
    const volatility = this.calculateVolatility(usageValues);
    
    let trend = 'stable';
    if (avgUsage > 80) trend = 'high';
    else if (avgUsage > 50) trend = 'moderate';
    else if (avgUsage < 20) trend = 'low';

    return {
      trend,
      avgUsage: Math.round(avgUsage * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
      peakUsage: Math.max(...usageValues),
      minUsage: Math.min(...usageValues)
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
   * Identify performance bottlenecks
   */
  identifyBottlenecks() {
    const bottlenecks = [];
    const cpuPatterns = this.analyzeCPUPatterns();

    // High CPU usage
    if (cpuPatterns.avgUsage > 80) {
      bottlenecks.push({
        type: 'high_cpu_usage',
        severity: 'high',
        description: `High average CPU usage: ${cpuPatterns.avgUsage}%`,
        recommendation: 'Consider optimizing CPU-intensive operations or scaling resources'
      });
    }

    // High CPU volatility
    if (cpuPatterns.volatility > 30) {
      bottlenecks.push({
        type: 'high_cpu_volatility',
        severity: 'medium',
        description: `High CPU volatility: ${cpuPatterns.volatility}%`,
        recommendation: 'Look for CPU spikes and investigate their cause'
      });
    }

    // Function performance issues
    this.functionCalls.forEach((stats, name) => {
      if (stats.avgTime > 100) { // 100ms threshold
        bottlenecks.push({
          type: 'slow_function',
          severity: 'medium',
          description: `Slow function: ${name} (avg: ${Math.round(stats.avgTime)}ms)`,
          recommendation: 'Optimize function implementation or add caching'
        });
      }

      if (stats.errors > 0) {
        bottlenecks.push({
          type: 'function_errors',
          severity: 'high',
          description: `Function errors: ${name} (${stats.errors} errors)`,
          recommendation: 'Fix error handling and investigate root causes'
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Generate optimization suggestions
   */
  generateOptimizations() {
    const bottlenecks = this.identifyBottlenecks();
    const suggestions = [];

    if (bottlenecks.length === 0) {
      suggestions.push({
        priority: 'low',
        action: 'CPU performance looks healthy',
        details: 'Continue monitoring for any changes'
      });
    } else {
      bottlenecks.forEach(bottleneck => {
        suggestions.push({
          priority: bottleneck.severity === 'high' ? 'high' : 'medium',
          action: bottleneck.recommendation,
          details: bottleneck.description
        });
      });
    }

    // General optimizations
    suggestions.push({
      priority: 'medium',
      action: 'Implement code splitting and lazy loading',
      details: 'Reduce initial bundle size and improve load times'
    });

    suggestions.push({
      priority: 'medium',
      action: 'Use React.memo and useMemo for expensive computations',
      details: 'Prevent unnecessary re-renders and recalculations'
    });

    suggestions.push({
      priority: 'medium',
      action: 'Optimize database queries and add caching',
      details: 'Reduce database load and improve response times'
    });

    return suggestions;
  }

  /**
   * Generate comprehensive report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      samples: this.samples.length,
      patterns: this.analyzeCPUPatterns(),
      bottlenecks: this.identifyBottlenecks(),
      optimizations: this.generateOptimizations(),
      functionStats: Array.from(this.functionCalls.values()),
      buildMetrics: this.buildMetrics,
      testMetrics: this.testMetrics,
      summary: this.generateSummary()
    };

    // Save report
    const filename = `cpu-profile-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(`📊 CPU profile report saved: ${filepath}`);
    
    // Display summary
    this.displaySummary(report);
    
    return report;
  }

  /**
   * Generate summary statistics
   */
  generateSummary() {
    if (this.samples.length === 0) return {};

    const cpuPatterns = this.analyzeCPUPatterns();
    const functionCount = this.functionCalls.size;
    const totalFunctionCalls = Array.from(this.functionCalls.values())
      .reduce((sum, stats) => sum + stats.calls, 0);
    
    return {
      avgCPUUsage: `${cpuPatterns.avgUsage}%`,
      peakCPUUsage: `${cpuPatterns.peakUsage}%`,
      totalSamples: this.samples.length,
      functionsProfiled: functionCount,
      totalFunctionCalls,
      buildProfiles: this.buildMetrics.length,
      testProfiles: this.testMetrics.length
    };
  }

  /**
   * Display summary to console
   */
  displaySummary(report) {
    console.log('\n📊 CPU PROFILE SUMMARY');
    console.log('=======================');
    console.log(`⏱️  Duration: ${Math.round(report.duration / 1000)}s`);
    console.log(`📊 Samples: ${report.samples}`);
    console.log(`📈 CPU Trend: ${report.patterns.trend}`);
    console.log(`📊 Avg CPU: ${report.patterns.avgUsage}%`);
    console.log(`🔍 Bottlenecks: ${report.bottlenecks.length}`);
    console.log(`⚡ Functions: ${report.functionStats.length}`);
    
    if (report.bottlenecks.length > 0) {
      console.log('\n🚨 PERFORMANCE BOTTLENECKS:');
      report.bottlenecks.forEach((bottleneck, i) => {
        console.log(`  ${i + 1}. ${bottleneck.description}`);
        console.log(`     Recommendation: ${bottleneck.recommendation}`);
      });
    }

    if (report.functionStats.length > 0) {
      console.log('\n⚡ FUNCTION PERFORMANCE:');
      const topFunctions = report.functionStats
        .sort((a, b) => b.avgTime - a.avgTime)
        .slice(0, 5);
      
      topFunctions.forEach((func, i) => {
        console.log(`  ${i + 1}. ${func.name}: ${Math.round(func.avgTime)}ms avg (${func.calls} calls)`);
      });
    }

    console.log('\n💡 OPTIMIZATION SUGGESTIONS:');
    report.optimizations.forEach((opt, i) => {
      console.log(`  ${i + 1}. [${opt.priority.toUpperCase()}] ${opt.action}`);
    });

    console.log('\n📁 Report saved to:', path.join(this.config.outputDir));
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
      samples: this.samples,
      cpuUsage: this.cpuUsage,
      functionCalls: Array.from(this.functionCalls.values()),
      analysis: {
        patterns: this.analyzeCPUPatterns(),
        bottlenecks: this.identifyBottlenecks(),
        optimizations: this.generateOptimizations()
      }
    };

    const filename = `cpu-export-${Date.now()}.json`;
    const filepath = path.join(this.config.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log(`📤 CPU data exported: ${filepath}`);
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
    } else if (arg.startsWith('--sampling=')) {
      config.sampling = parseInt(arg.split('=')[1]) || DEFAULT_CONFIG.sampling;
    } else if (arg === '--build') {
      config.enableBuildProfiling = true;
    } else if (arg === '--test') {
      config.enableTestProfiling = true;
    } else if (arg === '--export') {
      config.enableCPUProfiling = false;
    } else if (arg === '--verbose') {
      config.verbose = true;
    } else if (arg === '--help' || arg === '-h') {
      showHelp();
      return;
    }
  }

  const profiler = new CPUProfiler(config);

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
CPU Profiler for MIT Hero System

Usage:
  npm run profile:cpu [options]

Options:
  --duration=<ms>     Profiling duration in milliseconds (default: 30000)
  --sampling=<ms>     Sampling interval in milliseconds (default: 1000)
  --build             Profile during build process
  --test              Profile during test execution
  --export            Export data for external analysis
  --verbose           Enable verbose logging
  --help, -h         Show this help message

Examples:
  npm run profile:cpu                           # Basic profile for 30 seconds
  npm run profile:cpu --duration=60000         # Profile for 1 minute
  npm run profile:cpu --sampling=500           # Sample every 500ms
  npm run profile:cpu --build                  # Profile build process
  npm run profile:cpu --test                   # Profile test execution
  npm run profile:cpu --export                 # Export data

Output:
  Reports are saved to ./reports/profiles/
  Each run generates a timestamped JSON report
  CPU profiles include detailed performance analysis
  Function profiling shows execution times and bottlenecks
  Build and test profiling tracks specific processes
`);
}

if (require.main === module) {
  main();
}

module.exports = CPUProfiler;
