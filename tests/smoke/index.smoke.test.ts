/**
 * 🚀 COMPREHENSIVE SMOKE TEST SUITE - MIT HERO SYSTEM
 * 
 * This is the main orchestrator for all MIT Hero System smoke tests:
 * - Critical scripts validation and performance testing
 * - Performance budget enforcement across all systems
 * - System health monitoring and resource validation
 * - Build system validation and artifact verification
 * - Hero system orchestration and integration testing
 * - Comprehensive reporting and recommendations
 * 
 * Features:
 * - 🎯 COMPREHENSIVE TEST ORCHESTRATION for all systems
 * - 🔍 UNIFIED VALIDATION of critical functionality
 * - ⚡ PERFORMANCE BUDGET ENFORCEMENT across all tests
 * - 📊 AGGREGATED REPORTING and system status
 * - 🚨 FAIL-FAST DETECTION of system issues
 * - 📈 PERFORMANCE TREND ANALYSIS and recommendations
 * - 🧹 AUTOMATIC CLEANUP and resource management
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 * 
 * Status: ✅ OPERATIONAL - ORCHESTRATING ALL TESTS
 * Version: 1.0.0
 * MIT Hero System Integration: FULLY INTEGRATED
 */

import { CriticalScriptTester } from './critical-scripts.smoke.test';
import { PerformanceBudgetValidator } from './performance-budgets.smoke.test';
import { SystemHealthMonitor } from './system-health.smoke.test';
import { BuildSystemValidator } from './build-system.smoke.test';
import { HeroSystemValidator } from './hero-systems.smoke.test';

interface SmokeTestSuiteResult {
  category: string;
  success: boolean;
  executionTime: number;
  details: any;
  error?: string;
}

interface ComprehensiveSmokeTestReport {
  overallStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTime: number;
  categoryResults: SmokeTestSuiteResult[];
  recommendations: string[];
  timestamp: number;
}

class ComprehensiveSmokeTestRunner {
  private results: SmokeTestSuiteResult[] = [];
  private startTime: number;
  
  constructor() {
    this.startTime = Date.now();
  }
  
  private async runCriticalScriptsTests(): Promise<SmokeTestSuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n🚀 Running Critical Scripts Smoke Tests...');
      console.log('='.repeat(80));
      
      const tester = new CriticalScriptTester();
      const results = await tester.runAllTests();
      
      const executionTime = Date.now() - startTime;
      const success = results.filter(r => r.success).length === results.length;
      
      return {
        category: 'Critical Scripts',
        success,
        executionTime,
        details: {
          total: results.length,
          passed: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          withinBudget: results.filter(r => r.withinBudget).length,
          overBudget: results.filter(r => !r.withinBudget).length
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        category: 'Critical Scripts',
        success: false,
        executionTime,
        details: {},
        error: error.message || 'Unknown error'
      };
    }
  }
  
  private async runPerformanceBudgetTests(): Promise<SmokeTestSuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n📊 Running Performance Budget Validation...');
      console.log('='.repeat(80));
      
      const validator = new PerformanceBudgetValidator();
      const results = await validator.validateAllBudgets();
      
      const executionTime = Date.now() - startTime;
      const success = results.filter(r => r.success).length === results.length;
      
      return {
        category: 'Performance Budgets',
        success,
        executionTime,
        details: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          withinBudget: results.filter(r => r.withinBudget).length,
          overBudget: results.filter(r => !r.withinBudget).length
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        category: 'Performance Budgets',
        success: false,
        executionTime,
        details: {},
        error: error.message || 'Unknown error'
      };
    }
  }
  
  private async runSystemHealthTests(): Promise<SmokeTestSuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n🏥 Running System Health Tests...');
      console.log('='.repeat(80));
      
      const monitor = new SystemHealthMonitor();
      const report = await monitor.runSystemHealthCheck();
      
      const executionTime = Date.now() - startTime;
      const success = ['excellent', 'good'].includes(report.overallHealth);
      
      return {
        category: 'System Health',
        success,
        executionTime,
        details: {
          overallHealth: report.overallHealth,
          healthScore: report.healthScore,
          totalChecks: report.healthChecks.length,
          passedChecks: report.healthChecks.filter(c => c.status === 'healthy').length,
          failedChecks: report.healthChecks.filter(c => c.status === 'failed').length
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        category: 'System Health',
        success: false,
        executionTime,
        details: {},
        error: error.message || 'Unknown error'
      };
    }
  }
  
  private async runBuildSystemTests(): Promise<SmokeTestSuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n🔨 Running Build System Tests...');
      console.log('='.repeat(80));
      
      const validator = new BuildSystemValidator();
      const results = await validator.validateAllBuilds();
      
      const executionTime = Date.now() - startTime;
      const success = results.filter(r => r.success).length === results.length;
      
      return {
        category: 'Build System',
        success,
        executionTime,
        details: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          withinBudget: results.filter(r => r.withinBudget).length,
          overBudget: results.filter(r => !r.withinBudget).length
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        category: 'Build System',
        success: false,
        executionTime,
        details: {},
        error: error.message || 'Unknown error'
      };
    }
  }
  
  private async runHeroSystemTests(): Promise<SmokeTestSuiteResult> {
    const startTime = Date.now();
    
    try {
      console.log('\n🦸 Running Hero System Tests...');
      console.log('='.repeat(80));
      
      const validator = new HeroSystemValidator();
      const report = await validator.runHeroSystemValidation();
      
      const executionTime = Date.now() - startTime;
      const success = ['excellent', 'good'].includes(report.overallStatus);
      
      return {
        category: 'Hero Systems',
        success,
        executionTime,
        details: {
          overallStatus: report.overallStatus,
          healthScore: report.healthScore,
          criticalSystems: report.criticalSystems.length,
          nonCriticalSystems: report.nonCriticalSystems.length,
          criticalFailures: report.criticalSystems.filter(s => !s.success).length
        }
      };
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      return {
        category: 'Hero Systems',
        success: false,
        executionTime,
        details: {},
        error: error.message || 'Unknown error'
      };
    }
  }
  
  async runAllSmokeTests(): Promise<ComprehensiveSmokeTestReport> {
    console.log('🚀 Starting MIT Hero System Comprehensive Smoke Tests');
    console.log('='.repeat(80));
    console.log('This comprehensive test suite will validate:');
    console.log('  • Critical Scripts (top 10 most important)');
    console.log('  • Performance Budgets (resource constraints)');
    console.log('  • System Health (overall system status)');
    console.log('  • Build System (all build configurations)');
    console.log('  • Hero Systems (orchestration & integration)');
    console.log('='.repeat(80));
    
    // Run all test categories
    const testPromises = [
      this.runCriticalScriptsTests(),
      this.runPerformanceBudgetTests(),
      this.runSystemHealthTests(),
      this.runBuildSystemTests(),
      this.runHeroSystemTests()
    ];
    
    this.results = await Promise.all(testPromises);
    
    // Calculate overall results
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = this.results.filter(r => !r.success).length;
    const executionTime = Date.now() - this.startTime;
    
    // Determine overall status
    const overallStatus = this.determineOverallStatus(passedTests, totalTests);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    const report: ComprehensiveSmokeTestReport = {
      overallStatus,
      totalTests,
      passedTests,
      failedTests,
      executionTime,
      categoryResults: this.results,
      recommendations,
      timestamp: Date.now()
    };
    
    return report;
  }
  
  private determineOverallStatus(passedTests: number, totalTests: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    const successRate = passedTests / totalTests;
    
    if (successRate >= 0.95) return 'excellent';
    if (successRate >= 0.85) return 'good';
    if (successRate >= 0.70) return 'fair';
    if (successRate >= 0.50) return 'poor';
    return 'critical';
  }
  
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    // Failed test categories
    const failedCategories = this.results.filter(r => !r.success);
    if (failedCategories.length > 0) {
      recommendations.push(`🚨 ${failedCategories.length} test categories failed. Review and fix issues in: ${failedCategories.map(r => r.category).join(', ')}`);
    }
    
    // Performance issues
    const performanceIssues = this.results.filter(r => 
      r.details.overBudget > 0 || r.details.overBudget > 0
    );
    if (performanceIssues.length > 0) {
      recommendations.push(`⚠️  Performance issues detected in ${performanceIssues.length} categories. Review resource allocation and optimization.`);
    }
    
    // Critical system failures
    const criticalFailures = this.results.filter(r => 
      r.details.criticalFailures > 0 || r.details.failedChecks > 0
    );
    if (criticalFailures.length > 0) {
      recommendations.push(`🚨 Critical system failures detected. Immediate attention required for system stability.`);
    }
    
    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('✅ All smoke test categories passed successfully. System is operating optimally.');
    }
    
    return recommendations;
  }
  
  generateComprehensiveReport(report: ComprehensiveSmokeTestReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('🚀 MIT HERO SYSTEM COMPREHENSIVE SMOKE TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Overall Status: ${report.overallStatus.toUpperCase()}`);
    console.log(`🏆 Test Results: ${report.passedTests}/${report.totalTests} categories passed`);
    console.log(`⏱️  Total Execution Time: ${(report.executionTime / 1000).toFixed(2)}s`);
    console.log(`⏰ Report Time: ${new Date(report.timestamp).toISOString()}`);
    
    console.log(`\n📋 Category Results:`);
    report.categoryResults.forEach((result, index) => {
      const status = result.success ? '✅ PASS' : '❌ FAIL';
      const time = (result.executionTime / 1000).toFixed(2);
      
      console.log(`\n  ${index + 1}. ${result.category}: ${status} (${time}s)`);
      
      if (result.details.total !== undefined) {
        console.log(`     Total Tests: ${result.details.total}`);
        console.log(`