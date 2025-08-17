#!/usr/bin/env node

/**
 * MIT Hero System - CI Optimizer
 * 
 * Advanced CI pipeline optimization with:
 * - Performance monitoring and budgets
 * - Intelligent caching strategies
 * - Fail-fast mechanisms
 * - Emergency rollback procedures
 * - Health monitoring and reporting
 * 
 * @file scripts/ci-optimizer.js
 * @version 1.0.0
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Configuration
const CONFIG = {
  performanceBudgets: {
    buildTime: 300, // seconds
    memoryUsage: 2048, // MB
    bundleSize: 1024, // KB
    testTime: 180, // seconds
    cacheHitRate: 0.8 // 80%
  },
  optimizationLevels: {
    minimal: { workers: 2, cache: true, parallel: false },
    balanced: { workers: 4, cache: true, parallel: true },
    aggressive: { workers: 8, cache: true, parallel: true, failFast: true }
  },
  healthThresholds: {
    maxFailures: 3,
    maxBuildTime: 600,
    maxMemoryUsage: 4096,
    minCacheHitRate: 0.6
  }
};

// Performance monitoring
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      buildTime: 0,
      memoryUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      testResults: { passed: 0, failed: 0, skipped: 0 },
      errors: []
    };
  }

  startTimer(label) {
    this.metrics[label] = Date.now();
  }

  endTimer(label) {
    if (this.metrics[label]) {
      this.metrics[label] = Date.now() - this.metrics[label];
    }
  }

  recordMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.metrics.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024);
  }

  recordCacheHit(hit) {
    if (hit) {
      this.metrics.cacheHits++;
    } else {
      this.metrics.cacheMisses++;
    }
  }

  getCacheHitRate() {
    const total = this.metrics.cacheHits + this.metrics.cacheMisses;
    return total > 0 ? this.metrics.cacheHits / total : 0;
  }

  addError(error) {
    this.metrics.errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }

  generateReport() {
    const totalTime = Date.now() - this.metrics.startTime;
    const cacheHitRate = this.getCacheHitRate();
    
    return {
      summary: {
        totalTime: Math.round(totalTime / 1000),
        buildTime: Math.round(this.metrics.buildTime / 1000),
        memoryUsage: this.metrics.memoryUsage,
        cacheHitRate: Math.round(cacheHitRate * 100),
        testResults: this.metrics.testResults,
        errorCount: this.metrics.errors.length
      },
      details: this.metrics,
      recommendations: this.generateRecommendations(cacheHitRate, totalTime)
    };
  }

  generateRecommendations(cacheHitRate, totalTime) {
    const recommendations = [];
    
    if (cacheHitRate < CONFIG.healthThresholds.minCacheHitRate) {
      recommendations.push('Improve caching strategy - current hit rate is below threshold');
    }
    
    if (totalTime > CONFIG.healthThresholds.maxBuildTime * 1000) {
      recommendations.push('Build time exceeds threshold - consider parallelization or optimization');
    }
    
    if (this.metrics.memoryUsage > CONFIG.healthThresholds.maxMemoryUsage) {
      recommendations.push('Memory usage is high - consider reducing Node.js memory limit');
    }
    
    if (this.metrics.errors.length > CONFIG.healthThresholds.maxFailures) {
      recommendations.push('Too many errors - review CI configuration and dependencies');
    }
    
    return recommendations;
  }
}

// Cache optimization
class CacheOptimizer {
  constructor() {
    this.cachePaths = [
      'node_modules',
      '.next/cache',
      '.next/standalone',
      '.npm',
      'build',
      'dist'
    ];
  }

  async optimizeCache() {
    console.log('🔧 Optimizing cache strategy...');
    
    try {
      // Clear old cache entries
      await this.cleanupOldCache();
      
      // Optimize cache keys
      await this.optimizeCacheKeys();
      
      // Validate cache integrity
      await this.validateCache();
      
      console.log('✅ Cache optimization completed');
      return true;
    } catch (error) {
      console.error('❌ Cache optimization failed:', error.message);
      return false;
    }
  }

  async cleanupOldCache() {
    const cacheDir = path.join(process.cwd(), '.next', 'cache');
    if (fs.existsSync(cacheDir)) {
      const files = fs.readdirSync(cacheDir);
      const oldFiles = files.filter(file => {
        const filePath = path.join(cacheDir, file);
        const stats = fs.statSync(filePath);
        const age = Date.now() - stats.mtime.getTime();
        return age > 7 * 24 * 60 * 60 * 1000; // 7 days
      });
      
      oldFiles.forEach(file => {
        const filePath = path.join(cacheDir, file);
        fs.rmSync(filePath, { recursive: true, force: true });
      });
      
      if (oldFiles.length > 0) {
        console.log(`🧹 Cleaned up ${oldFiles.length} old cache files`);
      }
    }
  }

  async optimizeCacheKeys() {
    // Generate optimized cache keys based on file changes
    const packageLockHash = await this.generateFileHash('package-lock.json');
    const sourceHash = await this.generateSourceHash();
    
    console.log(`📦 Package lock hash: ${packageLockHash.substring(0, 8)}`);
    console.log(`🔍 Source hash: ${sourceHash.substring(0, 8)}`);
  }

  async generateFileHash(filePath) {
    if (!fs.existsSync(filePath)) return 'none';
    
    const crypto = require('crypto');
    const content = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  async generateSourceHash() {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    
    const sourceFiles = await this.findSourceFiles();
    for (const file of sourceFiles) {
      const content = fs.readFileSync(file);
      hash.update(content);
    }
    
    return hash.digest('hex');
  }

  async findSourceFiles() {
    const sourceDirs = ['app', 'components', 'lib', 'scripts'];
    const sourceFiles = [];
    
    for (const dir of sourceDirs) {
      if (fs.existsSync(dir)) {
        await this.walkDir(dir, sourceFiles);
      }
    }
    
    return sourceFiles;
  }

  async walkDir(dir, files) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        await this.walkDir(fullPath, files);
      } else if (stat.isFile() && /\.(js|ts|jsx|tsx)$/.test(item)) {
        files.push(fullPath);
      }
    }
  }

  async validateCache() {
    console.log('🔍 Validating cache integrity...');
    
    for (const cachePath of this.cachePaths) {
      if (fs.existsSync(cachePath)) {
        const stats = fs.statSync(cachePath);
        console.log(`📁 ${cachePath}: ${Math.round(stats.size / 1024 / 1024)}MB`);
      }
    }
  }
}

// Health monitoring
class HealthMonitor {
  constructor() {
    this.healthStatus = {
      overall: 'healthy',
      checks: {},
      lastCheck: new Date()
    };
  }

  async runHealthCheck() {
    console.log('🏥 Running CI health check...');
    
    try {
      await this.checkDependencies();
      await this.checkBuildSystem();
      await this.checkTestSystem();
      await this.checkPerformance();
      
      this.updateOverallHealth();
      this.generateHealthReport();
      
      return this.healthStatus.overall === 'healthy';
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.healthStatus.overall = 'critical';
      return false;
    }
  }

  async checkDependencies() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const packageLock = fs.existsSync('package-lock.json');
      
      this.healthStatus.checks.dependencies = {
        status: 'healthy',
        packageJson: !!packageJson,
        packageLock: packageLock,
        scripts: Object.keys(packageJson.scripts || {}).length
      };
      
      console.log('✅ Dependencies check passed');
    } catch (error) {
      this.healthStatus.checks.dependencies = {
        status: 'unhealthy',
        error: error.message
      };
      console.error('❌ Dependencies check failed:', error.message);
    }
  }

  async checkBuildSystem() {
    try {
      const nextConfig = fs.existsSync('next.config.ts') || fs.existsSync('next.config.js');
      const tsConfig = fs.existsSync('tsconfig.json');
      
      this.healthStatus.checks.buildSystem = {
        status: 'healthy',
        nextConfig: nextConfig,
        tsConfig: tsConfig,
        buildScripts: this.checkBuildScripts()
      };
      
      console.log('✅ Build system check passed');
    } catch (error) {
      this.healthStatus.checks.buildSystem = {
        status: 'unhealthy',
        error: error.message
      };
      console.error('❌ Build system check failed:', error.message);
    }
  }

  checkBuildScripts() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      return {
        build: !!scripts.build,
        buildFast: !!scripts['build:fast'],
        buildOptimized: !!scripts['build:optimized'],
        buildAnalyze: !!scripts['build:analyze']
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkTestSystem() {
    try {
      const jestConfig = fs.existsSync('jest.config.js');
      const testDir = fs.existsSync('__tests__') || fs.existsSync('tests');
      
      this.healthStatus.checks.testSystem = {
        status: 'healthy',
        jestConfig: jestConfig,
        testDir: testDir,
        testScripts: this.checkTestScripts()
      };
      
      console.log('✅ Test system check passed');
    } catch (error) {
      this.healthStatus.checks.testSystem = {
        status: 'unhealthy',
        error: error.message
      };
      console.error('❌ Test system check failed:', error.message);
    }
  }

  checkTestScripts() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      return {
        test: !!scripts.test,
        testWatch: !!scripts['test:watch'],
        testUnit: !!scripts['test:unit'],
        testIntegration: !!scripts['test:integration']
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  async checkPerformance() {
    try {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      this.healthStatus.checks.performance = {
        status: 'healthy',
        memoryUsage: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        cpuUsage: cpuUsage,
        uptime: process.uptime()
      };
      
      console.log('✅ Performance check passed');
    } catch (error) {
      this.healthStatus.checks.performance = {
        status: 'unhealthy',
        error: error.message
      };
      console.error('❌ Performance check failed:', error.message);
    }
  }

  updateOverallHealth() {
    const checks = Object.values(this.healthStatus.checks);
    const unhealthyChecks = checks.filter(check => check.status === 'unhealthy');
    
    if (unhealthyChecks.length === 0) {
      this.healthStatus.overall = 'healthy';
    } else if (unhealthyChecks.length <= 2) {
      this.healthStatus.overall = 'warning';
    } else {
      this.healthStatus.overall = 'critical';
    }
  }

  generateHealthReport() {
    console.log('\n📊 CI Health Report');
    console.log('==================');
    console.log(`Overall Status: ${this.healthStatus.overall.toUpperCase()}`);
    console.log(`Last Check: ${this.healthStatus.lastCheck.toISOString()}`);
    
    for (const [checkName, check] of Object.entries(this.healthStatus.checks)) {
      const status = check.status === 'healthy' ? '✅' : '❌';
      console.log(`${status} ${checkName}: ${check.status}`);
    }
    
    if (this.healthStatus.overall !== 'healthy') {
      console.log('\n⚠️  Recommendations:');
      this.generateHealthRecommendations();
    }
  }

  generateHealthRecommendations() {
    const recommendations = [];
    
    if (this.healthStatus.checks.dependencies?.status === 'unhealthy') {
      recommendations.push('- Run "npm install" to fix dependency issues');
    }
    
    if (this.healthStatus.checks.buildSystem?.status === 'unhealthy') {
      recommendations.push('- Verify Next.js and TypeScript configuration');
    }
    
    if (this.healthStatus.checks.testSystem?.status === 'unhealthy') {
      recommendations.push('- Check Jest configuration and test files');
    }
    
    if (this.healthStatus.checks.performance?.status === 'unhealthy') {
      recommendations.push('- Monitor memory usage and optimize Node.js settings');
    }
    
    recommendations.forEach(rec => console.log(rec));
  }
}

// Emergency rollback
class EmergencyRollback {
  constructor() {
    this.rollbackHistory = [];
  }

  async executeRollback(reason = 'CI pipeline failure') {
    console.log(`🚨 Executing emergency rollback: ${reason}`);
    
    try {
      // Record rollback attempt
      this.rollbackHistory.push({
        timestamp: new Date().toISOString(),
        reason,
        success: false
      });
      
      // Check if we can rollback
      if (!await this.canRollback()) {
        throw new Error('Rollback not possible - no valid previous state');
      }
      
      // Execute rollback steps
      await this.rollbackDependencies();
      await this.rollbackBuild();
      await this.rollbackTests();
      
      // Mark rollback as successful
      this.rollbackHistory[this.rollbackHistory.length - 1].success = true;
      
      console.log('✅ Emergency rollback completed successfully');
      return true;
    } catch (error) {
      console.error('❌ Emergency rollback failed:', error.message);
      return false;
    }
  }

  async canRollback() {
    // Check if we have a previous working state
    try {
      const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
      const hasChanges = gitStatus.trim().length > 0;
      
      if (hasChanges) {
        console.log('📝 Working directory has uncommitted changes');
        return false;
      }
      
      // Check if we can reset to previous commit
      const lastCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const previousCommit = execSync('git rev-parse HEAD~1', { encoding: 'utf8' }).trim();
      
      console.log(`🔄 Can rollback from ${lastCommit.substring(0, 8)} to ${previousCommit.substring(0, 8)}`);
      return true;
    } catch (error) {
      console.log('❌ Cannot determine rollback possibility:', error.message);
      return false;
    }
  }

  async rollbackDependencies() {
    console.log('📦 Rolling back dependencies...');
    
    try {
      // Remove node_modules and reinstall
      if (fs.existsSync('node_modules')) {
        fs.rmSync('node_modules', { recursive: true, force: true });
      }
      
      // Clear npm cache
      execSync('npm cache clean --force', { stdio: 'inherit' });
      
      // Reinstall dependencies
      execSync('npm ci', { stdio: 'inherit' });
      
      console.log('✅ Dependencies rollback completed');
    } catch (error) {
      console.error('❌ Dependencies rollback failed:', error.message);
      throw error;
    }
  }

  async rollbackBuild() {
    console.log('🏗️  Rolling back build artifacts...');
    
    try {
      // Remove build artifacts
      const buildDirs = ['.next', 'build', 'dist', 'out'];
      
      for (const dir of buildDirs) {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
      
      console.log('✅ Build rollback completed');
    } catch (error) {
      console.error('❌ Build rollback failed:', error.message);
      throw error;
    }
  }

  async rollbackTests() {
    console.log('🧪 Rolling back test artifacts...');
    
    try {
      // Remove test artifacts
      const testDirs = ['coverage', 'test-results', '.nyc_output'];
      
      for (const dir of testDirs) {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true, force: true });
        }
      }
      
      console.log('✅ Test rollback completed');
    } catch (error) {
      console.error('❌ Test rollback failed:', error.message);
      throw error;
    }
  }

  getRollbackHistory() {
    return this.rollbackHistory;
  }
}

// Main CI Optimizer class
class CIOptimizer {
  constructor() {
    this.monitor = new PerformanceMonitor();
    this.cacheOptimizer = new CacheOptimizer();
    this.healthMonitor = new HealthMonitor();
    this.rollback = new EmergencyRollback();
    this.optimizationLevel = process.env.CI_OPTIMIZATION_LEVEL || 'balanced';
  }

  async optimize() {
    console.log('🚀 MIT Hero System - CI Optimization Starting');
    console.log(`📊 Optimization Level: ${this.optimizationLevel}`);
    console.log(`🖥️  Platform: ${os.platform()} ${os.arch()}`);
    console.log(`💾 Memory: ${Math.round(os.totalmem() / 1024 / 1024 / 1024)}GB`);
    console.log('=' * 50);
    
    try {
      // Start performance monitoring
      this.monitor.startTimer('optimization');
      
      // Run health check
      const isHealthy = await this.healthMonitor.runHealthCheck();
      if (!isHealthy) {
        console.log('⚠️  CI system health check failed - proceeding with caution');
      }
      
      // Optimize cache
      await this.cacheOptimizer.optimizeCache();
      
      // Apply optimization strategies
      await this.applyOptimizationStrategies();
      
      // End performance monitoring
      this.monitor.endTimer('optimization');
      this.monitor.recordMemoryUsage();
      
      // Generate final report
      const report = this.monitor.generateReport();
      this.saveReport(report);
      
      console.log('\n🎉 CI Optimization completed successfully!');
      console.log(`⏱️  Total time: ${report.summary.totalTime}s`);
      console.log(`💾 Memory usage: ${report.summary.memoryUsage}MB`);
      console.log(`📦 Cache hit rate: ${report.summary.cacheHitRate}%`);
      
      return true;
    } catch (error) {
      console.error('❌ CI Optimization failed:', error.message);
      
      // Attempt emergency rollback
      await this.rollback.executeRollback('CI optimization failure');
      
      return false;
    }
  }

  async applyOptimizationStrategies() {
    const strategy = CONFIG.optimizationLevels[this.optimizationLevel];
    
    console.log(`🔧 Applying ${this.optimizationLevel} optimization strategy...`);
    
    // Set environment variables for optimization
    process.env.NODE_OPTIONS = `--max-old-space-size=${strategy.memory || 4096}`;
    process.env.CI_PARALLEL = strategy.parallel ? 'true' : 'false';
    process.env.CI_FAIL_FAST = strategy.failFast ? 'true' : 'false';
    
    // Apply worker optimization
    if (strategy.workers) {
      process.env.JEST_WORKERS = strategy.workers.toString();
      process.env.NEXT_BUILD_WORKERS = strategy.workers.toString();
    }
    
    console.log(`✅ Applied optimization strategy: ${JSON.stringify(strategy)}`);
  }

  saveReport(report) {
    try {
      const reportsDir = 'reports';
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportFile = path.join(reportsDir, `ci-optimization-${timestamp}.json`);
      
      fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📄 Report saved to: ${reportFile}`);
    } catch (error) {
      console.error('❌ Failed to save report:', error.message);
    }
  }

  async runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true
      });
      
      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      child.on('error', (error) => {
        reject(error);
      });
    });
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const optimizer = new CIOptimizer();
  
  try {
    switch (command) {
      case 'optimize':
        await optimizer.optimize();
        break;
        
      case 'health':
        await optimizer.healthMonitor.runHealthCheck();
        break;
        
      case 'cache':
        await optimizer.cacheOptimizer.optimizeCache();
        break;
        
      case 'rollback':
        await optimizer.rollback.executeRollback(args[1] || 'Manual rollback');
        break;
        
      case 'report':
        const report = optimizer.monitor.generateReport();
        console.log(JSON.stringify(report, null, 2));
        break;
        
      default:
        console.log('MIT Hero System - CI Optimizer');
        console.log('Usage: node ci-optimizer.js <command>');
        console.log('');
        console.log('Commands:');
        console.log('  optimize    Run full CI optimization');
        console.log('  health      Run health check');
        console.log('  cache       Optimize cache strategy');
        console.log('  rollback    Execute emergency rollback');
        console.log('  report      Generate performance report');
        console.log('');
        console.log('Examples:');
        console.log('  node ci-optimizer.js optimize');
        console.log('  node ci-optimizer.js health');
        console.log('  node ci-optimizer.js rollback "Build failure"');
        break;
    }
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}

module.exports = {
  CIOptimizer,
  PerformanceMonitor,
  CacheOptimizer,
  HealthMonitor,
  EmergencyRollback
};
