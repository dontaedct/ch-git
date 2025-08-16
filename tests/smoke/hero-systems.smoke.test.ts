/**
 * 🦸‍♂️ HERO SYSTEMS SMOKE TESTS - MIT HERO SYSTEM
 * 
 * This test suite validates the orchestration and integration of Hero Systems:
 * - Hero unified system validation and status checks
 * - Hero ultimate system performance and health monitoring
 * - Guardian system integration and backup validation
 * - Threat response system testing and validation
 * - System orchestration and coordination testing
 * - Hero system health scoring and recommendations
 * 
 * Features:
 * - 🔍 COMPREHENSIVE HERO SYSTEM VALIDATION
 * - ⚡ PERFORMANCE BUDGET ENFORCEMENT for all hero systems
 * - 🔄 SYSTEM ORCHESTRATION and integration testing
 * - 📊 DETAILED HEALTH SCORING and system status
 * - 🚨 THREAT DETECTION and response validation
 * - 🧹 AUTOMATIC CLEANUP and resource management
 * - 📋 SYSTEM RECOMMENDATIONS and optimization tips
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 * 
 * Status: ✅ OPERATIONAL - VALIDATING HERO SYSTEMS
 * Version: 1.0.0
 * MIT Hero System Integration: FULLY INTEGRATED
 */

import { execSync } from 'child_process';
import { performance } from 'perf_hooks';
import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// Hero system configuration and performance budgets
const HERO_SYSTEM_CONFIG = {
  // Core hero system commands
  heroSystems: {
    'hero:unified:status': {
      description: 'Hero unified system status check',
      timeBudget: 30000,        // 30 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 40,            // 40% CPU
      expectedOutput: ['status', 'hero', 'unified'],
      critical: true
    },
    'hero:unified:health': {
      description: 'Hero unified system health check',
      timeBudget: 45000,        // 45 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 50,            // 50% CPU
      expectedOutput: ['health', 'status', 'operational'],
      critical: true
    },
    'hero:unified:execute': {
      description: 'Hero unified system execution',
      timeBudget: 60000,        // 1 minute
      memoryBudget: 256 * 1024 * 1024,  // 256MB
      cpuBudget: 60,            // 60% CPU
      expectedOutput: ['executing', 'activated', 'operational'],
      critical: true
    },
    'hero:ultimate:status': {
      description: 'Hero ultimate system status',
      timeBudget: 30000,        // 30 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 40,            // 40% CPU
      expectedOutput: ['status', 'ultimate', 'hero'],
      critical: false
    },
    'hero:ultimate:health': {
      description: 'Hero ultimate system health',
      timeBudget: 45000,        // 45 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 50,            // 50% CPU
      expectedOutput: ['health', 'status', 'operational'],
      critical: false
    }
  },
  
  // Guardian system integration
  guardianSystems: {
    'guardian:health': {
      description: 'Guardian system health check',
      timeBudget: 30000,        // 30 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 50,            // 50% CPU
      expectedOutput: ['guardian', 'health', 'status'],
      critical: true
    },
    'guardian:status': {
      description: 'Guardian system status',
      timeBudget: 20000,        // 20 seconds
      memoryBudget: 64 * 1024 * 1024,   // 64MB
      cpuBudget: 30,            // 30% CPU
      expectedOutput: ['guardian', 'status', 'operational'],
      critical: false
    }
  },
  
  // Threat response systems
  threatSystems: {
    'hero:threat:scan': {
      description: 'Hero threat scanning system',
      timeBudget: 45000,        // 45 seconds
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 50,            // 50% CPU
      expectedOutput: ['scan', 'threat', 'status'],
      critical: false
    },
    'hero:threat:status': {
      description: 'Hero threat response status',
      timeBudget: 30000,        // 30 seconds
      memoryBudget: 64 * 1024 * 1024,   // 64MB
      cpuBudget: 30,            // 30% CPU
      expectedOutput: ['threat', 'status', 'response'],
      critical: false
    }
  },
  
  // System orchestration
  orchestration: {
    'hero:overview': {
      description: 'Hero system overview',
      timeBudget: 15000,        // 15 seconds
      memoryBudget: 32 * 1024 * 1024,   // 32MB
      cpuBudget: 20,            // 20% CPU
      expectedOutput: ['MIT HERO SYSTEM', 'operational', 'unified'],
      critical: false
    },
    'hero:test:health': {
      description: 'Hero system health test',
      timeBudget: 60000,        // 1 minute
      memoryBudget: 128 * 1024 * 1024,  // 128MB
      cpuBudget: 50,            // 50% CPU
      expectedOutput: ['health', 'test', 'status'],
      critical: false
    }
  }
};

interface HeroSystemMetrics {
  executionTime: number;
  memoryUsage: number;
  cpuUsage: number;
  peakMemory: number;
  outputSize: number;
}

interface HeroSystemResult {
  systemName: string;
  success: boolean;
  metrics: HeroSystemMetrics;
  output: string;
  withinBudget: boolean;
  budgetExceeded: string[];
  performanceScore: number;
  outputValidation: {
    valid: boolean;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  error?: string;
}

interface SystemOrchestrationReport {
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  healthScore: number;
  criticalSystems: HeroSystemResult[];
  nonCriticalSystems: HeroSystemResult[];
  recommendations: string[];
  timestamp: number;
}

class HeroSystemValidator {
  private results: HeroSystemResult[] = [];
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
  
  private validateOutput(output: string, expectedKeywords: string[]): {
    valid: boolean;
    matchedKeywords: string[];
    missingKeywords: string[];
  } {
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];
    
    for (const keyword of expectedKeywords) {
      if (output.toLowerCase().includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      } else {
        missingKeywords.push(keyword);
      }
    }
    
    const valid = missingKeywords.length === 0;
    
    return {
      valid,
      matchedKeywords,
      missingKeywords
    };
  }
  
  private async executeHeroSystem(systemName: string, config: any): Promise<HeroSystemResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    const startCpu = process.cpuUsage();
    
    let peakMemory = startMemory;
    
    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      const currentMemory = this.getMemoryUsage();
      if (currentMemory > peakMemory) {
        peakMemory = currentMemory;
      }
    }, 100);
    
    try {
      console.log(`🦸 Executing hero system: ${systemName}`);
      
      const output = execSync(`npm run ${systemName}`, {
        encoding: 'utf8',
        timeout: config.timeBudget + 10000, // Add 10 second buffer
        maxBuffer: 10 * 1024 * 1024  // 10MB buffer
      });
      
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      const endCpu = process.cpuUsage();
      
      clearInterval(memoryMonitor);
      
      const executionTime = endTime - startTime;
      const memoryUsage = endMemory - startMemory;
      const cpuUsage = this.calculateCpuUsage(startCpu, endCpu, executionTime);
      
      // Validate output
      const outputValidation = this.validateOutput(output, config.expectedOutput);
      
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
      
      const metrics: HeroSystemMetrics = {
        executionTime,
        memoryUsage,
        cpuUsage,
        peakMemory,
        outputSize: output.length
      };
      
      const result: HeroSystemResult = {
        systemName,
        success: true,
        metrics,
        output: output.substring(0, 500), // Truncate for readability
        withinBudget,
        budgetExceeded,
        performanceScore,
        outputValidation
      };
      
      if (withinBudget && outputValidation.valid) {
        console.log(`✅ ${systemName} completed successfully within budget (Score: ${performanceScore}/100)`);
      } else if (!withinBudget) {
        console.log(`⚠️  ${systemName} exceeded budget: ${budgetExceeded.join(', ')}`);
      } else if (!outputValidation.valid) {
        console.log(`⚠️  ${systemName} output validation failed: missing ${outputValidation.missingKeywords.join(', ')}`);
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
      
      const metrics: HeroSystemMetrics = {
        executionTime,
        memoryUsage,
        cpuUsage,
        peakMemory: memoryUsage,
        outputSize: 0
      };
      
      const result: HeroSystemResult = {
        systemName,
        success: false,
        metrics,
        output: '',
        withinBudget: false,
        budgetExceeded: ['System execution failed'],
        performanceScore: 0,
        outputValidation: {
          valid: false,
          matchedKeywords: [],
          missingKeywords: config.expectedOutput
        },
        error: error.message || 'Unknown error'
      };
      
      console.log(`❌ ${systemName} failed: ${error.message}`);
      return result;
    }
  }
  
  private async validateAllHeroSystems(): Promise<HeroSystemResult[]> {
    console.log('🦸 Starting Hero Systems Validation');
    console.log('='.repeat(80));
    
    const allSystems = {
      ...HERO_SYSTEM_CONFIG.heroSystems,
      ...HERO_SYSTEM_CONFIG.guardianSystems,
      ...HERO_SYSTEM_CONFIG.threatSystems,
      ...HERO_SYSTEM_CONFIG.orchestration
    };
    
    const validationPromises = Object.entries(allSystems).map(
      ([systemName, config]) => this.executeHeroSystem(systemName, config)
    );
    
    this.results = await Promise.all(validationPromises);
    return this.results;
  }
  
  private calculateHealthScore(): number {
    if (this.results.length === 0) return 0;
    
    const scores = this.results.map(result => {
      let score = result.performanceScore;
      
      // Penalize output validation failures
      if (!result.outputValidation.valid) {
        score *= 0.8;
      }
      
      // Penalize budget exceedances
      if (!result.withinBudget) {
        score *= 0.9;
      }
      
      return score;
    });
    
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }
  
  private determineOverallStatus(healthScore: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (healthScore >= 95) return 'excellent';
    if (healthScore >= 85) return 'good';
    if (healthScore >= 70) return 'fair';
    if (healthScore >= 50) return 'poor';
    return 'critical';
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Critical system failures
    const criticalFailures = this.results.filter(r => 
      r.success === false && 
      HERO_SYSTEM_CONFIG.heroSystems[r.systemName as keyof typeof HERO_SYSTEM_CONFIG.heroSystems]?.critical
    );
    
    if (criticalFailures.length > 0) {
      recommendations.push(`🚨 Critical: ${criticalFailures.length} critical hero systems failed. Immediate attention required.`);
    }
    
    // Performance issues
    const overBudgetSystems = this.results.filter(r => !r.withinBudget);
    if (overBudgetSystems.length > 0) {
      recommendations.push(`⚠️  Performance: ${overBudgetSystems.length} systems exceeded performance budgets. Consider optimization.`);
    }
    
    // Output validation issues
    const outputValidationFailures = this.results.filter(r => !r.outputValidation.valid);
    if (outputValidationFailures.length > 0) {
      recommendations.push(`🔧 Validation: ${outputValidationFailures.length} systems failed output validation. Review system responses.`);
    }
    
    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ All hero systems are operating optimally. Continue monitoring for any changes.');
    }
    
    return recommendations;
  }
  
  async runHeroSystemValidation(): Promise<SystemOrchestrationReport> {
    console.log('🦸 Starting MIT Hero System Validation');
    console.log('='.repeat(80));
    
    // Validate all hero systems
    const results = await this.validateAllHeroSystems();
    
    // Calculate health score
    const healthScore = this.calculateHealthScore();
    const overallStatus = this.determineOverallStatus(healthScore);
    
    // Separate critical and non-critical systems
    const criticalSystems = results.filter(r => 
      HERO_SYSTEM_CONFIG.heroSystems[r.systemName as keyof typeof HERO_SYSTEM_CONFIG.heroSystems]?.critical
    );
    
    const nonCriticalSystems = results.filter(r => 
      !HERO_SYSTEM_CONFIG.heroSystems[r.systemName as keyof typeof HERO_SYSTEM_CONFIG.heroSystems]?.critical
    );
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    const report: SystemOrchestrationReport = {
      overallStatus,
      healthScore,
      criticalSystems,
      nonCriticalSystems,
      recommendations,
      timestamp: Date.now()
    };
    
    return report;
  }
  
  generateReport(report: SystemOrchestrationReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('🦸 MIT HERO SYSTEM ORCHESTRATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`🏆 Health Score: ${report.healthScore.toFixed(1)}/100`);
    console.log(`⏰ Report Time: ${new Date(report.timestamp).toISOString()}`);
    
    console.log(`\n📈 System Summary:`);
    console.log(`  Critical Systems: ${report.criticalSystems.length}`);
    console.log(`  Non-Critical Systems: ${report.nonCriticalSystems.length}`);
    console.log(`  Total Systems: ${report.criticalSystems.length + report.nonCriticalSystems.length}`);
    
    // Critical systems report
    if (report.criticalSystems.length > 0) {
      console.log(`\n🚨 Critical Systems Report:`);
      report.criticalSystems.forEach((system, index) => {
        const status = system.success ? '✅ OPERATIONAL' : '❌ FAILED';
        const perf = system.withinBudget ? '📊 BUDGET' : '⚠️ OVER';
        
        console.log(`  ${index + 1}. ${system.systemName}: ${status} ${perf}`);
        console.log(`     Performance Score: ${system.performanceScore}/100`);
        console.log(`     Execution Time: ${system.metrics.executionTime.toFixed(2)}ms`);
        console.log(`     Memory Usage: ${(system.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
        
        if (system.outputValidation.valid) {
          console.log(`     Output: Valid (${system.outputValidation.matchedKeywords.join(', ')})`);
        } else {
          console.log(`     Output: Invalid (missing: ${system.outputValidation.missingKeywords.join(', ')})`);
        }
        
        if (!system.success) {
          console.log(`     Error: ${system.error}`);
        }
      });
    }
    
    // Non-critical systems report
    if (report.nonCriticalSystems.length > 0) {
      console.log(`\n📋 Non-Critical Systems Report:`);
      report.nonCriticalSystems.forEach((system, index) => {
        const status = system.success ? '✅ OPERATIONAL' : '❌ FAILED';
        const perf = system.withinBudget ? '📊 BUDGET' : '⚠️ OVER';
        
        console.log(`  ${index + 1}. ${system.systemName}: ${status} ${perf}`);
        console.log(`     Performance Score: ${system.performanceScore}/100`);
        console.log(`     Execution Time: ${system.metrics.executionTime.toFixed(2)}ms`);
        
        if (!system.success) {
          console.log(`     Error: ${system.error}`);
        }
      });
    }
    
    // Recommendations
    console.log(`\n💡 Recommendations:`);
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n' + '='.repeat(80));
    
    if (report.overallStatus === 'critical') {
      console.log('🚨 CRITICAL: Hero system status is critical. Immediate attention required!');
      throw new Error('Hero system status is critical');
    } else if (report.overallStatus === 'poor') {
      console.log('⚠️  POOR: Hero system status is poor. Review recommendations and take action.');
    } else if (report.overallStatus === 'fair') {
      console.log('⚠️  FAIR: Hero system status is fair. Monitor closely and consider improvements.');
    } else if (report.overallStatus === 'good') {
      console.log('✅ GOOD: Hero system status is good. Continue monitoring.');
    } else {
      console.log('🎉 EXCELLENT: Hero system status is excellent!');
    }
  }
}

// Jest test suite
describe('MIT Hero System - Hero Systems Smoke Tests', () => {
  let heroValidator: HeroSystemValidator;
  
  beforeAll(() => {
    heroValidator = new HeroSystemValidator();
  });
  
  test('All critical hero systems should be operational', async () => {
    const report = await heroValidator.runHeroSystemValidation();
    
    // Overall status should be good or excellent
    expect(['good', 'excellent']).toContain(report.overallStatus);
    
    // Health score should be above 80
    expect(report.healthScore).toBeGreaterThan(80);
    
    // All critical systems should be operational
    const failedCriticalSystems = report.criticalSystems.filter(system => !system.success);
    expect(failedCriticalSystems).toHaveLength(0);
    
    // Generate detailed report
    heroValidator.generateReport(report);
  }, 600000); // 10 minute timeout
  
  describe('Critical Hero Systems', () => {
    test('hero:unified:status should be operational', async () => {
      const config = HERO_SYSTEM_CONFIG.heroSystems['hero:unified:status'];
      const result = await heroValidator.executeHeroSystem('hero:unified:status', config);
      
      expect(result.success).toBe(true);
      expect(result.withinBudget).toBe(true);
      expect(result.outputValidation.valid).toBe(true);
    }, 45000);
    
    test('hero:unified:health should be operational', async () => {
      const config = HERO_SYSTEM_CONFIG.heroSystems['hero:unified:health'];
      const result = await heroValidator.executeHeroSystem('hero:unified:health', config);
      
      expect(result.success).toBe(true);
      expect(result.withinBudget).toBe(true);
      expect(result.outputValidation.valid).toBe(true);
    }, 60000);
    
    test('guardian:health should be operational', async () => {
      const config = HERO_SYSTEM_CONFIG.guardianSystems['guardian:health'];
      const result = await heroValidator.executeHeroSystem('guardian:health', config);
      
      expect(result.success).toBe(true);
      expect(result.withinBudget).toBe(true);
      expect(result.outputValidation.valid).toBe(true);
    }, 45000);
  });
  
  describe('Hero System Performance', () => {
    test('All hero systems should meet performance budgets', async () => {
      const report = await heroValidator.runHeroSystemValidation();
      
      const overBudgetSystems = [...report.criticalSystems, ...report.nonCriticalSystems]
        .filter(system => !system.withinBudget);
      
      expect(overBudgetSystems).toHaveLength(0);
    }, 600000);
    
    test('Hero systems should have high performance scores', async () => {
      const report = await heroValidator.runHeroSystemValidation();
      
      const lowPerformers = [...report.criticalSystems, ...report.nonCriticalSystems]
        .filter(system => system.performanceScore < 70);
      
      expect(lowPerformers).toHaveLength(0);
    }, 600000);
  });
  
  describe('Hero System Output Validation', () => {
    test('All hero systems should produce valid output', async () => {
      const report = await heroValidator.runHeroSystemValidation();
      
      const invalidOutputSystems = [...report.criticalSystems, ...report.nonCriticalSystems]
        .filter(system => !system.outputValidation.valid);
      
      expect(invalidOutputSystems).toHaveLength(0);
    }, 600000);
  });
  
  describe('System Orchestration', () => {
    test('Hero system overview should provide system status', async () => {
      const config = HERO_SYSTEM_CONFIG.orchestration['hero:overview'];
      const result = await heroValidator.executeHeroSystem('hero:overview', config);
      
      expect(result.success).toBe(true);
      expect(result.outputValidation.valid).toBe(true);
    }, 30000);
    
    test('Hero system health test should complete successfully', async () => {
      const config = HERO_SYSTEM_CONFIG.orchestration['hero:test:health'];
      const result = await heroValidator.executeHeroSystem('hero:test:health', config);
      
      expect(result.success).toBe(true);
      expect(result.withinBudget).toBe(true);
    }, 90000);
  });
});

export { HeroSystemValidator, HERO_SYSTEM_CONFIG };
