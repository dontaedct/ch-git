/**
 * 🏗️ BUILD SYSTEM SMOKE TESTS - MIT HERO SYSTEM
 * 
 * This test suite validates various build configurations and their performance:
 * - Build system validation (build, build:fast, build:memory)
 * - Build artifact generation and validation
 * - Build performance monitoring and budget enforcement
 * - Build cleanup verification and resource management
 * - Build system integration testing
 * - Build artifact size and quality validation
 * 
 * Features:
 * - 🔍 COMPREHENSIVE BUILD SYSTEM VALIDATION
 * - ⚡ PERFORMANCE BUDGET ENFORCEMENT for all build types
 * - 📦 BUILD ARTIFACT VALIDATION and quality checks
 * - 📊 DETAILED PERFORMANCE METRICS and analysis
 * - 🧹 AUTOMATIC CLEANUP and artifact management
 * - 🔄 BUILD SYSTEM INTEGRATION testing
 * - 📋 BUILD RECOMMENDATIONS and optimization tips
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 * 
 * Status: ✅ OPERATIONAL - VALIDATING BUILD SYSTEMS
 * Version: 1.0.0
 * MIT Hero System Integration: FULLY INTEGRATED
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

// Build system configuration and budgets
const BUILD_SYSTEM_CONFIG = {
  // Build targets and their configurations
  builds: {
    'build:fast': {
      description: 'Fast development build',
      expectedArtifacts: ['.next', '.next/static'],
      timeBudget: 15000,        // 15 seconds
      memoryBudget: 256 * 1024 * 1024,  // 256MB
      cpuBudget: 70,            // 70% CPU
      cleanupRequired: true
    },
    'build:memory': {
      description: 'Memory-optimized build',
      expectedArtifacts: ['.next', '.next/static'],
      timeBudget: 45000,        // 45 seconds
      memoryBudget: 1024 * 1024 * 1024, // 1GB
      cpuBudget: 90,            // 90% CPU
      cleanupRequired: true
    },
    'build:performance': {
      description: 'Build performance monitoring',
      expectedArtifacts: ['.next', '.next/static', 'reports'],
      timeBudget: 60000,        // 1 minute
      memoryBudget: 256 * 1024 * 1024,  // 256MB
      cpuBudget: 60,            // 60% CPU
      cleanupRequired: false
    },
    'build:monitor': {
      description: 'Build monitoring and analysis',
      expectedArtifacts: ['.next', '.next/static', 'reports'],
      timeBudget: 90000,        // 1.5 minutes
      memoryBudget: 512 * 1024 * 1024,  // 512MB
      cpuBudget: 80,            // 80% CPU
      cleanupRequired: false
    }
  },
  
  // Build artifact validation
  artifacts: {
    '.next': {
      required: true,
      minSize: 1024 * 1024,    // 1MB minimum
      maxSize: 500 * 1024 * 1024, // 500MB maximum
      description: 'Next.js build output'
    },
    '.next/static': {
      required: true,
      minSize: 512 * 1024,     // 512KB minimum
      maxSize: 100 * 1024 * 1024, // 100MB maximum
      description: 'Static assets'
    },
    'reports': {
      required: false,
      minSize: 1024,           // 1KB minimum
      maxSize: 50 * 1024 * 1024,  // 50MB maximum
      description: 'Build performance reports'
    }
  },
  
  // Performance thresholds
  performance: {
    buildTime: {
      excellent: 10000,        // 10 seconds
      good: 20000,             // 20 seconds
      acceptable: 30000,       // 30 seconds
      slow: 60000              // 1 minute
    },
    memoryEfficiency: {
      excellent: 0.8,          // 80% of budget
      good: 0.9,               // 90% of budget
      acceptable: 1.0,         // 100% of budget
      poor: 1.2                // 120% of budget
    }
  }
};

interface BuildMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  peakMemory: number;
  buildSize: number;
}

interface BuildResult {
  buildName: string;
  success: boolean;
  metrics: BuildMetrics;
  artifacts: BuildArtifact[];
  withinBudget: boolean;
  budgetExceeded: string[];
  performanceScore: number;
  error?: string;
}

interface BuildArtifact {
  path: string;
  exists: boolean;
  size: number;
  valid: boolean;
  validationErrors: string[];
}

class BuildSystemValidator {
  private results: BuildResult[] = [];
  private startTime: number;
  
  constructor() {
    this.startTime = Date.now();
  }
  
  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return memUsage.heapUsed;
  }
  
  private calculateCpuUsage(startCpu: any, endCpu: any, executionTime: number): number {
    const userDiff = endCpu.user - startCpu.user;
    const systemDiff = endCpu.system - startCpu.system;
    const totalDiff = userDiff + systemDiff;
    
    // Convert microseconds to percentage
    return (totalDiff / 1000) / executionTime * 100;
  }
  
  private async executeBuild(buildName: string, config: any): Promise<BuildResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    const startCpu = process.cpuUsage();
    
    let peakMemory = startMemory;
    let memoryReadings: number[] = [];
    
    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      const currentMemory = this.getMemoryUsage();
      memoryReadings.push(currentMemory);
      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }
    }, 100);
    
    try {
      console.log(`🔨 Executing build: ${buildName}`);
      
      const output = execSync(`npm run ${buildName}`, {
        encoding: 'utf8',
        timeout: config.timeBudget + 10000, // Add 10 second buffer
        maxBuffer: 20 * 1024 * 1024  // 20MB buffer
      });
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const endCpu = process.cpuUsage();
      
      clearInterval(memoryMonitor);
      
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory - startMemory;
      const cpuUsage = this.calculateCpuUsage(startCpu, endCpu, executionTime);
      
      // Validate build artifacts
      const artifacts = await this.validateBuildArtifacts(buildName, config);
      const buildSize = artifacts.reduce((total, artifact) => total + artifact.size, 0);
      
      // Check performance budgets
      const budgetExceeded: string[] = [];
      let withinBudget = true;
      
      if (executionTime > config.timeBudget) {
        withinBudget = false;
        budgetExceeded.push(`Time: ${executionTime.toFixed(2)}ms > ${config.timeBudget}ms`);
      }
      
      if (memoryUsage > config.memoryBudget) {
        withinBudget = false;
        budgetExceeded.push(`Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB > ${(config.memoryBudget / 1024 / 1024).toFixed(2)}MB`);
      }
      
      if (cpuUsage > config.cpuBudget) {
        withinBudget = false;
        budgetExceeded.push(`CPU: ${cpuUsage.toFixed(2)}% > ${config.cpuBudget}%`);
      }
      
      // Calculate performance score
      const timeScore = Math.max(0, 100 - (executionTime / config.timeBudget - 1) * 100);
      const memoryScore = Math.max(0, 100 - (memoryUsage / config.memoryBudget - 1) * 100);
      const cpuScore = Math.max(0, 100 - (cpuUsage / config.cpuBudget - 1) * 100);
      
      const performanceScore = Math.round((timeScore + memoryScore + cpuScore) / 3);
      
      const metrics: BuildMetrics = {
        executionTime,
        memoryUsage,
        cpuUsage,
        peakMemory,
        buildSize
      };
      
      const result: BuildResult = {
        buildName,
        success: true,
        metrics,
        artifacts,
        withinBudget,
        budgetExceeded,
        performanceScore
      };
      
      if (withinBudget) {
        console.log(`✅ ${buildName} completed successfully within budget (Score: ${performanceScore}/100)`);
      } else {
        console.log(`⚠️  ${buildName} exceeded budget: ${budgetExceeded.join(', ')}`);
      }
      
      return result;
      
    } catch (error: any) {
      clearInterval(memoryMonitor);
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const endCpu = process.cpuUsage();
      
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory - startMemory;
      const cpuUsage = this.calculateCpuUsage(startCpu, endCpu, executionTime);
      
      const metrics: BuildMetrics = {
        executionTime,
        memoryUsage,
        cpuUsage,
        peakMemory: memoryUsage,
        buildSize: 0
      };
      
      const result: BuildResult = {
        buildName,
        success: false,
        metrics,
        artifacts: [],
        withinBudget: false,
        budgetExceeded: ['Build execution failed'],
        performanceScore: 0,
        error: error.message || 'Unknown error'
      };
      
      console.log(`❌ ${buildName} failed: ${error.message}`);
      return result;
    }
  }
  
  private async validateBuildArtifacts(buildName: string, config: any): Promise<BuildArtifact[]> {
    const artifacts: BuildArtifact[] = [];
    
    for (const artifactPath of config.expectedArtifacts) {
      const artifact: BuildArtifact = {
        path: artifactPath,
        exists: false,
        size: 0,
        valid: false,
        validationErrors: []
      };
      
      if (existsSync(artifactPath)) {
        artifact.exists = true;
        
        try {
          const stats = statSync(artifactPath);
          artifact.size = stats.size;
          
          // Validate size constraints
          const artifactConfig = BUILD_SYSTEM_CONFIG.artifacts[artifactPath as keyof typeof BUILD_SYSTEM_CONFIG.artifacts];
          if (artifactConfig) {
            if (artifact.size < artifactConfig.minSize) {
              artifact.validationErrors.push(`Size too small: ${(artifact.size / 1024).toFixed(2)}KB < ${(artifactConfig.minSize / 1024).toFixed(2)}KB`);
            }
            
            if (artifact.size > artifactConfig.maxSize) {
              artifact.validationErrors.push(`Size too large: ${(artifact.size / 1024 / 1024).toFixed(2)}MB > ${(artifactConfig.maxSize / 1024 / 1024).toFixed(2)}MB`);
            }
          }
          
          artifact.valid = artifact.validationErrors.length === 0;
          
        } catch (error: any) {
          artifact.validationErrors.push(`Failed to read artifact: ${error.message}`);
        }
      } else {
        artifact.validationErrors.push('Artifact does not exist');
      }
      
      artifacts.push(artifact);
    }
    
    return artifacts;
  }
  
  private async cleanupBuildArtifacts(buildName: string, config: any): Promise<boolean> {
    if (!config.cleanupRequired) {
      return true;
    }
    
    console.log(`🧹 Cleaning up build artifacts for ${buildName}...`);
    
    try {
      // Clean up .next directory for builds that require cleanup
      if (existsSync('.next')) {
        execSync('rmdir /s /q .next', { shell: true });
        console.log('✅ Build artifacts cleaned up successfully');
        return true;
      }
      
      return true;
    } catch (error: any) {
      console.log(`⚠️  Build cleanup failed: ${error.message}`);
      return false;
    }
  }
  
  async validateAllBuilds(): Promise<BuildResult[]> {
    console.log('🔨 Starting Build System Validation');
    console.log(`📊 Validating ${Object.keys(BUILD_SYSTEM_CONFIG.builds).length} build configurations`);
    console.log('='.repeat(80));
    
    const buildPromises = Object.entries(BUILD_SYSTEM_CONFIG.builds).map(
      ([buildName, config]) => this.executeBuild(buildName, config)
    );
    
    this.results = await Promise.all(buildPromises);
    
    // Cleanup build artifacts
    for (const result of this.results) {
      if (result.success) {
        const config = BUILD_SYSTEM_CONFIG.builds[result.buildName as keyof typeof BUILD_SYSTEM_CONFIG.builds];
        await this.cleanupBuildArtifacts(result.buildName, config);
      }
    }
    
    return this.results;
  }
  
  generateReport(): void {
    const totalTime = Date.now() - this.startTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔨 BUILD SYSTEM VALIDATION REPORT');
    console.log('='.repeat(80));
    
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const withinBudget = this.results.filter(r => r.withinBudget).length;
    const overBudget = this.results.filter(r => !r.withinBudget).length;
    
    // Performance analysis
    const scores = this.results.filter(r => r.success).map(r => r.performanceScore);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const highPerformers = scores.filter(s => s >= 90).length;
    const lowPerformers = scores.filter(s => s < 70).length;
    
    console.log(`\n📈 Summary:`);
    console.log(`  Total builds validated: ${total}`);
    console.log(`  Builds successful: ${successful}`);
    console.log(`  Builds failed: ${failed}`);
    console.log(`  Within performance budget: ${withinBudget}`);
    console.log(`  Over performance budget: ${overBudget}`);
    console.log(`  Average performance score: ${averageScore.toFixed(1)}/100`);
    console.log(`  High performers (≥90): ${highPerformers}`);
    console.log(`  Low performers (<70): ${lowPerformers}`);
    console.log(`  Total validation time: ${(totalTime / 1000).toFixed(2)}s`);
    
    console.log(`\n📋 Detailed Results:`);
    this.results.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const perf = result.withinBudget ? '📊 BUDGET' : '⚠️ OVER';
      
      console.log(`\n  ${index + 1}. ${result.buildName}: ${status} ${perf}`);
      console.log(`     Description: ${BUILD_SYSTEM_CONFIG.builds[result.buildName as keyof typeof BUILD_SYSTEM_CONFIG.builds].description}`);
      console.log(`     Performance Score: ${result.performanceScore}/100`);
      console.log(`     Execution Time: ${result.metrics.executionTime.toFixed(2)}ms`);
      console.log(`     Memory Usage: ${(result.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      console.log(`     CPU Usage: ${result.metrics.cpuUsage.toFixed(2)}%`);
      console.log(`     Build Size: ${(result.metrics.buildSize / 1024 / 1024).toFixed(2)}MB`);
      
      if (result.budgetExceeded.length > 0) {
        console.log(`     Budget Exceeded: ${result.budgetExceeded.join(', ')}`);
      }
      
      if (result.artifacts.length > 0) {
        console.log(`     Artifacts:`);
        result.artifacts.forEach(artifact => {
          const status = artifact.valid ? '✅' : '❌';
          console.log(`       ${status} ${artifact.path}: ${(artifact.size / 1024 / 1024).toFixed(2)}MB`);
          
          if (artifact.validationErrors.length > 0) {
            artifact.validationErrors.forEach(error => {
              console.log(`         ⚠️  ${error}`);
            });
          }
        });
      }
      
      if (!result.success) {
        console.log(`     Error: ${result.error}`);
      }
    });
    
    // Build recommendations
    console.log(`\n💡 Build System Recommendations:`);
    if (lowPerformers > 0) {
      console.log(`  ⚠️  ${lowPerformers} builds have low performance scores - consider optimization`);
    }
    if (overBudget > 0) {
      console.log(`  ⚠️  ${overBudget} builds exceed performance budgets - review resource allocation`);
    }
    if (failed > 0) {
      console.log(`  🚨 ${failed} builds failed - investigate build configuration and dependencies`);
    }
    if (highPerformers === total) {
      console.log(`  🎉 All builds are high performers - excellent build system optimization!`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (failed > 0) {
      console.log('💥 Build system validation failed!');
      throw new Error(`${failed} builds failed`);
    } else if (overBudget > 0) {
      console.log('⚠️  All builds completed but some exceeded performance budgets');
    } else {
      console.log('🎉 All builds meet performance budgets successfully!');
    }
  }
}

// Jest test suite
describe('MIT Hero System - Build System Smoke Tests', () => {
  let buildValidator: BuildSystemValidator;
  
  beforeAll(() => {
    buildValidator = new BuildSystemValidator();
  });
  
  test('All build configurations should execute successfully within performance budgets', async () => {
    const results = await buildValidator.validateAllBuilds();
    
    // All builds should execute successfully
    const failedBuilds = results.filter(r => !r.success);
    expect(failedBuilds).toHaveLength(0);
    
    // All builds should be within performance budgets
    const overBudgetBuilds = results.filter(r => !r.withinBudget);
    expect(overBudgetBuilds).toHaveLength(0);
    
    // Generate detailed report
    buildValidator.generateReport();
  }, 600000); // 10 minute timeout for all builds
  
  // Test individual build configurations
  describe('Fast Build Configuration', () => {
    test('build:fast should complete within 15 seconds and 256MB memory', async () => {
      const config = BUILD_SYSTEM_CONFIG.builds['build:fast'];
      const result = await buildValidator.executeBuild('build:fast', config);
      
      expect(result.success).toBe(true);
      expect(result.metrics.executionTime).toBeLessThan(config.timeBudget);
      expect(result.metrics.memoryUsage).toBeLessThan(config.memoryBudget);
      expect(result.metrics.cpuUsage).toBeLessThan(config.cpuBudget);
    }, 30000);
  });
  
  describe('Memory-Optimized Build Configuration', () => {
    test('build:memory should complete within 45 seconds and 1GB memory', async () => {
      const config = BUILD_SYSTEM_CONFIG.builds['build:memory'];
      const result = await buildValidator.executeBuild('build:memory', config);
      
      expect(result.success).toBe(true);
      expect(result.metrics.executionTime).toBeLessThan(config.timeBudget);
      expect(result.metrics.memoryUsage).toBeLessThan(config.memoryBudget);
      expect(result.metrics.cpuUsage).toBeLessThan(config.cpuBudget);
    }, 60000);
  });
  
  describe('Performance Monitoring Build Configuration', () => {
    test('build:performance should complete within 1 minute and 256MB memory', async () => {
      const config = BUILD_SYSTEM_CONFIG.builds['build:performance'];
      const result = await buildValidator.executeBuild('build:performance', config);
      
      expect(result.success).toBe(true);
      expect(result.metrics.executionTime).toBeLessThan(config.timeBudget);
      expect(result.metrics.memoryUsage).toBeLessThan(config.memoryBudget);
      expect(result.metrics.cpuUsage).toBeLessThan(config.cpuBudget);
    }, 90000);
  });
  
  describe('Build Monitoring Configuration', () => {
    test('build:monitor should complete within 1.5 minutes and 512MB memory', async () => {
      const config = BUILD_SYSTEM_CONFIG.builds['build:monitor'];
      const result = await buildValidator.executeBuild('build:monitor', config);
      
      expect(result.success).toBe(true);
      expect(result.metrics.executionTime).toBeLessThan(config.timeBudget);
      expect(result.metrics.memoryUsage).toBeLessThan(config.memoryBudget);
      expect(result.metrics.cpuUsage).toBeLessThan(config.cpuBudget);
    }, 120000);
  });
  
  describe('Build Artifact Validation', () => {
    test('Build artifacts should be properly generated and validated', async () => {
      const config = BUILD_SYSTEM_CONFIG.builds['build:fast'];
      const result = await buildValidator.executeBuild('build:fast', config);
      
      expect(result.success).toBe(true);
      expect(result.artifacts.length).toBeGreaterThan(0);
      
      // All required artifacts should exist and be valid
      const requiredArtifacts = result.artifacts.filter(artifact => 
        BUILD_SYSTEM_CONFIG.artifacts[artifact.path as keyof typeof BUILD_SYSTEM_CONFIG.artifacts]?.required
      );
      
      for (const artifact of requiredArtifacts) {
        expect(artifact.exists).toBe(true);
        expect(artifact.valid).toBe(true);
      }
    }, 30000);
  });
});

export { BuildSystemValidator, BUILD_SYSTEM_CONFIG };
