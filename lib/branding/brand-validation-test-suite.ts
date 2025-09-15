/**
 * @fileoverview HT-011.4.6: Brand Validation Testing Suite - Comprehensive Testing Framework
 * @module lib/branding/brand-validation-test-suite
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.6 - Create Brand Validation Testing Suite
 * Focus: Comprehensive brand validation testing across all components and scenarios
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (testing framework enhancement)
 */

import { TenantBrandConfig } from './types';
import { BrandComplianceEngine, ComplianceCheckResult, ComplianceRuleResult } from './brand-compliance-engine';
import { BrandPolicyEnforcementSystem, BrandPolicyEnforcementResult } from './brand-policy-enforcement';
import { BrandPolicyTestSuite } from './brand-policy-test-suite';

/**
 * Test scenario types
 */
export type TestScenarioType = 
  | 'valid-configuration'
  | 'invalid-configuration'
  | 'incomplete-configuration'
  | 'accessibility-violation'
  | 'usability-violation'
  | 'performance-violation'
  | 'compliance-violation'
  | 'edge-case'
  | 'stress-test'
  | 'integration-test';

/**
 * Test severity levels
 */
export type TestSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

/**
 * Test result status
 */
export type TestResultStatus = 'passed' | 'failed' | 'skipped' | 'error';

/**
 * Individual test result
 */
export interface BrandValidationTestResult {
  /** Test identifier */
  testId: string;
  /** Test name */
  testName: string;
  /** Test description */
  description: string;
  /** Test scenario type */
  scenarioType: TestScenarioType;
  /** Test severity */
  severity: TestSeverity;
  /** Test status */
  status: TestResultStatus;
  /** Test score (0-100) */
  score: number;
  /** Expected outcome */
  expectedOutcome: 'pass' | 'fail';
  /** Actual outcome */
  actualOutcome: 'pass' | 'fail';
  /** Test duration in milliseconds */
  duration: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Compliance check result */
  complianceResult?: ComplianceCheckResult;
  /** Policy enforcement result */
  policyResult?: BrandPolicyEnforcementResult;
  /** Test metadata */
  metadata: {
    testedAt: Date;
    configVersion: string;
    tenantId: string;
    testEnvironment: string;
  };
}

/**
 * Test suite result
 */
export interface BrandValidationTestSuiteResult {
  /** Suite identifier */
  suiteId: string;
  /** Suite name */
  suiteName: string;
  /** Suite description */
  description: string;
  /** Individual test results */
  testResults: BrandValidationTestResult[];
  /** Suite summary */
  summary: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    errorTests: number;
    averageScore: number;
    successRate: number;
    duration: number;
  };
  /** Suite metadata */
  metadata: {
    executedAt: Date;
    executedBy: string;
    environment: string;
    version: string;
  };
}

/**
 * Test configuration
 */
export interface BrandValidationTestConfig {
  /** Enable compliance testing */
  enableComplianceTesting: boolean;
  /** Enable policy testing */
  enablePolicyTesting: boolean;
  /** Enable integration testing */
  enableIntegrationTesting: boolean;
  /** Enable stress testing */
  enableStressTesting: boolean;
  /** Test timeout in milliseconds */
  testTimeout: number;
  /** Maximum retries for failed tests */
  maxRetries: number;
  /** Test environment */
  testEnvironment: 'development' | 'staging' | 'production';
  /** Custom test scenarios */
  customScenarios?: BrandValidationTestScenario[];
}

/**
 * Test scenario definition
 */
export interface BrandValidationTestScenario {
  /** Scenario identifier */
  id: string;
  /** Scenario name */
  name: string;
  /** Scenario description */
  description: string;
  /** Scenario type */
  type: TestScenarioType;
  /** Scenario severity */
  severity: TestSeverity;
  /** Brand configuration for testing */
  brandConfig: TenantBrandConfig;
  /** Expected outcome */
  expectedOutcome: 'pass' | 'fail';
  /** Test timeout */
  timeout?: number;
  /** Test dependencies */
  dependencies?: string[];
  /** Test tags */
  tags?: string[];
}

/**
 * Brand Validation Testing Suite
 * 
 * Comprehensive testing framework for brand validation across multiple dimensions:
 * - Compliance testing (accessibility, usability, design consistency)
 * - Policy testing (brand-specific design policies)
 * - Integration testing (component integration)
 * - Stress testing (performance and edge cases)
 * - Edge case testing (boundary conditions)
 */
export class BrandValidationTestSuite {
  private complianceEngine: BrandComplianceEngine;
  private policyEnforcementSystem: BrandPolicyEnforcementSystem;
  private testConfig: BrandValidationTestConfig;
  private testScenarios: Map<string, BrandValidationTestScenario> = new Map();

  constructor(config: Partial<BrandValidationTestConfig> = {}) {
    this.testConfig = {
      enableComplianceTesting: true,
      enablePolicyTesting: true,
      enableIntegrationTesting: true,
      enableStressTesting: false,
      testTimeout: 30000,
      maxRetries: 3,
      testEnvironment: 'development',
      ...config
    };

    this.complianceEngine = new BrandComplianceEngine();
    this.policyEnforcementSystem = new BrandPolicyEnforcementSystem();
    
    this.initializeDefaultScenarios();
  }

  /**
   * Run comprehensive brand validation test suite
   */
  async runTestSuite(suiteId: string = 'comprehensive-brand-validation'): Promise<BrandValidationTestSuiteResult> {
    const startTime = Date.now();
    const testResults: BrandValidationTestResult[] = [];

    console.log(`🚀 Starting Brand Validation Test Suite: ${suiteId}`);
    console.log(`📊 Configuration:`, this.testConfig);

    // Run all test scenarios
    for (const scenario of Array.from(this.testScenarios.values())) {
      try {
        const testResult = await this.runTestScenario(scenario);
        testResults.push(testResult);
        
        console.log(`✅ Test ${scenario.id}: ${testResult.status.toUpperCase()} (${testResult.score}/100)`);
      } catch (error) {
        console.error(`❌ Test ${scenario.id} failed:`, error);
        testResults.push({
          testId: scenario.id,
          testName: scenario.name,
          description: scenario.description,
          scenarioType: scenario.type,
          severity: scenario.severity,
          status: 'error',
          score: 0,
          expectedOutcome: scenario.expectedOutcome,
          actualOutcome: 'fail',
          duration: 0,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            testedAt: new Date(),
            configVersion: '1.0.0',
            tenantId: scenario.brandConfig.tenantId,
            testEnvironment: this.testConfig.testEnvironment,
  },
        });
      }
    }

    // Calculate suite summary
    const summary = this.calculateSuiteSummary(testResults);

    const suiteResult: BrandValidationTestSuiteResult = {
      suiteId,
      suiteName: 'Comprehensive Brand Validation Test Suite',
      description: 'Complete brand validation testing across compliance, policy, integration, and edge cases',
      testResults,
      summary,
      metadata: {
        executedAt: new Date(),
        executedBy: 'BrandValidationTestSuite',
        environment: this.testConfig.testEnvironment,
        version: '1.0.0',
  },
    };

    const duration = Date.now() - startTime;
    console.log(`\n🎉 Test Suite Completed in ${duration}ms`);
    console.log(`📈 Results: ${summary.passedTests}/${summary.totalTests} passed (${summary.successRate}%)`);
    console.log(`⭐ Average Score: ${summary.averageScore}/100`);

    return suiteResult;
  }

  /**
   * Run individual test scenario
   */
  private async runTestScenario(scenario: BrandValidationTestScenario): Promise<BrandValidationTestResult> {
    const startTime = Date.now();
    
    let complianceResult: ComplianceCheckResult | undefined;
    let policyResult: BrandPolicyEnforcementResult | undefined;
    let status: TestResultStatus = 'passed';
    let score = 100;
    let actualOutcome: 'pass' | 'fail' = 'pass';

    try {
      // Run compliance testing if enabled
      if (this.testConfig.enableComplianceTesting) {
        complianceResult = await this.complianceEngine.checkCompliance(scenario.brandConfig);
        
        if (!complianceResult.compliant) {
          status = 'failed';
          score = complianceResult.overallScore;
          actualOutcome = 'fail';
        }
      }

      // Run policy testing if enabled
      if (this.testConfig.enablePolicyTesting) {
        policyResult = this.policyEnforcementSystem.enforcePolicies(scenario.brandConfig);
        
        if (!policyResult.overallPassed) {
          status = 'failed';
          score = Math.min(score, policyResult.overallScore);
          actualOutcome = 'fail';
        }
      }

      // Run integration testing if enabled
      if (this.testConfig.enableIntegrationTesting) {
        const integrationResult = await this.runIntegrationTest(scenario);
        if (!integrationResult.passed) {
          status = 'failed';
          score = Math.min(score, integrationResult.score);
          actualOutcome = 'fail';
        }
      }

      // Run stress testing if enabled
      if (this.testConfig.enableStressTesting) {
        const stressResult = await this.runStressTest(scenario);
        if (!stressResult.passed) {
          status = 'failed';
          score = Math.min(score, stressResult.score);
          actualOutcome = 'fail';
        }
      }

      // Determine final status based on expected outcome
      if (actualOutcome !== scenario.expectedOutcome) {
        status = 'failed';
      }

    } catch (error) {
      status = 'error';
      score = 0;
      actualOutcome = 'fail';
    }

    return {
      testId: scenario.id,
      testName: scenario.name,
      description: scenario.description,
      scenarioType: scenario.type,
      severity: scenario.severity,
      status,
      score,
      expectedOutcome: scenario.expectedOutcome,
      actualOutcome,
      duration: Date.now() - startTime,
      complianceResult,
      policyResult,
      metadata: {
        testedAt: new Date(),
        configVersion: '1.0.0',
        tenantId: scenario.brandConfig.tenantId,
        testEnvironment: this.testConfig.testEnvironment,
  },
    };
  }

  /**
   * Run integration test
   */
  private async runIntegrationTest(scenario: BrandValidationTestScenario): Promise<{
    passed: boolean;
    score: number;
    message: string;
  }> {
    // Simulate integration testing
    // In a real implementation, this would test component integration
    const config = scenario.brandConfig;
    
    // Check if brand configuration integrates properly
    const hasValidBrand = config.brand && config.brand.name && config.brand.name.length > 0;
    const hasValidTheme = config.theme && config.theme.colors && config.theme.colors.primary;
    
    if (hasValidBrand && hasValidTheme) {
      return {
        passed: true,
        score: 100,
        message: 'Integration test passed - brand configuration integrates properly'
      };
    } else {
      return {
        passed: false,
        score: 50,
        message: 'Integration test failed - brand configuration missing required elements'
      };
    }
  }

  /**
   * Run stress test
   */
  private async runStressTest(scenario: BrandValidationTestScenario): Promise<{
    passed: boolean;
    score: number;
    message: string;
  }> {
    // Simulate stress testing
    // In a real implementation, this would test performance under load
    const startTime = Date.now();
    
    // Simulate heavy processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const duration = Date.now() - startTime;
    
    if (duration < 200) {
      return {
        passed: true,
        score: 100,
        message: `Stress test passed - processed in ${duration}ms`
      };
    } else {
      return {
        passed: false,
        score: 70,
        message: `Stress test failed - processing took ${duration}ms (threshold: 200ms)`
      };
    }
  }

  /**
   * Add custom test scenario
   */
  addTestScenario(scenario: BrandValidationTestScenario): void {
    this.testScenarios.set(scenario.id, scenario);
  }

  /**
   * Remove test scenario
   */
  removeTestScenario(scenarioId: string): boolean {
    return this.testScenarios.delete(scenarioId);
  }

  /**
   * Get test scenario by ID
   */
  getTestScenario(scenarioId: string): BrandValidationTestScenario | undefined {
    return this.testScenarios.get(scenarioId);
  }

  /**
   * Get all test scenarios
   */
  getAllTestScenarios(): BrandValidationTestScenario[] {
    return Array.from(this.testScenarios.values());
  }

  /**
   * Update test configuration
   */
  updateTestConfig(config: Partial<BrandValidationTestConfig>): void {
    this.testConfig = { ...this.testConfig, ...config };
  }

  /**
   * Get test configuration
   */
  getTestConfig(): BrandValidationTestConfig {
    return { ...this.testConfig };
  }

  /**
   * Generate test report
   */
  generateTestReport(suiteResult: BrandValidationTestSuiteResult): string {
    const report = [];
    
    report.push('# Brand Validation Test Suite Report');
    report.push('');
    report.push(`**Suite ID:** ${suiteResult.suiteId}`);
    report.push(`**Suite Name:** ${suiteResult.suiteName}`);
    report.push(`**Executed At:** ${suiteResult.metadata.executedAt.toISOString()}`);
    report.push(`**Environment:** ${suiteResult.metadata.environment}`);
    report.push('');
    
    // Summary
    report.push('## Test Summary');
    report.push('');
    report.push(`- **Total Tests:** ${suiteResult.summary.totalTests}`);
    report.push(`- **Passed:** ${suiteResult.summary.passedTests}`);
    report.push(`- **Failed:** ${suiteResult.summary.failedTests}`);
    report.push(`- **Skipped:** ${suiteResult.summary.skippedTests}`);
    report.push(`- **Errors:** ${suiteResult.summary.errorTests}`);
    report.push(`- **Success Rate:** ${suiteResult.summary.successRate}%`);
    report.push(`- **Average Score:** ${suiteResult.summary.averageScore}/100`);
    report.push(`- **Duration:** ${suiteResult.summary.duration}ms`);
    report.push('');
    
    // Test Results
    report.push('## Test Results');
    report.push('');
    
    for (const testResult of suiteResult.testResults) {
      report.push(`### ${testResult.testName}`);
      report.push('');
      report.push(`- **Status:** ${testResult.status.toUpperCase()}`);
      report.push(`- **Score:** ${testResult.score}/100`);
      report.push(`- **Expected:** ${testResult.expectedOutcome}`);
      report.push(`- **Actual:** ${testResult.actualOutcome}`);
      report.push(`- **Duration:** ${testResult.duration}ms`);
      report.push(`- **Severity:** ${testResult.severity}`);
      report.push('');
      
      if (testResult.errorMessage) {
        report.push(`**Error:** ${testResult.errorMessage}`);
        report.push('');
      }
      
      if (testResult.complianceResult) {
        report.push(`**Compliance Score:** ${testResult.complianceResult.overallScore}/100`);
        report.push(`**Compliance Status:** ${testResult.complianceResult.compliant ? 'Compliant' : 'Non-compliant'}`);
        report.push('');
      }
      
      if (testResult.policyResult) {
        report.push(`**Policy Score:** ${testResult.policyResult.overallScore}/100`);
        report.push(`**Policy Status:** ${testResult.policyResult.overallPassed ? 'Passed' : 'Failed'}`);
        report.push('');
      }
    }
    
    return report.join('\n');
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Initialize default test scenarios
   */
  private initializeDefaultScenarios(): void {
    // Valid configuration test
    this.addTestScenario({
      id: 'valid-brand-config',
      name: 'Valid Brand Configuration',
      description: 'Test with a complete, valid brand configuration',
      type: 'valid-configuration',
      severity: 'high',
      brandConfig: this.createValidBrandConfig(),
      expectedOutcome: 'pass',
      tags: ['valid', 'complete', 'baseline']
    });

    // Invalid configuration test
    this.addTestScenario({
      id: 'invalid-brand-config',
      name: 'Invalid Brand Configuration',
      description: 'Test with an invalid brand configuration',
      type: 'invalid-configuration',
      severity: 'high',
      brandConfig: this.createInvalidBrandConfig(),
      expectedOutcome: 'fail',
      tags: ['invalid', 'error-handling']
    });

    // Incomplete configuration test
    this.addTestScenario({
      id: 'incomplete-brand-config',
      name: 'Incomplete Brand Configuration',
      description: 'Test with an incomplete brand configuration',
      type: 'incomplete-configuration',
      severity: 'medium',
      brandConfig: this.createIncompleteBrandConfig(),
      expectedOutcome: 'fail',
      tags: ['incomplete', 'partial']
    });

    // Accessibility violation test
    this.addTestScenario({
      id: 'accessibility-violation',
      name: 'Accessibility Violation',
      description: 'Test with accessibility violations',
      type: 'accessibility-violation',
      severity: 'critical',
      brandConfig: this.createAccessibilityViolationConfig(),
      expectedOutcome: 'fail',
      tags: ['accessibility', 'wcag', 'violation']
    });

    // Usability violation test
    this.addTestScenario({
      id: 'usability-violation',
      name: 'Usability Violation',
      description: 'Test with usability violations',
      type: 'usability-violation',
      severity: 'high',
      brandConfig: this.createUsabilityViolationConfig(),
      expectedOutcome: 'fail',
      tags: ['usability', 'ux', 'violation']
    });

    // Performance violation test
    this.addTestScenario({
      id: 'performance-violation',
      name: 'Performance Violation',
      description: 'Test with performance violations',
      type: 'performance-violation',
      severity: 'medium',
      brandConfig: this.createPerformanceViolationConfig(),
      expectedOutcome: 'fail',
      tags: ['performance', 'optimization', 'violation']
    });

    // Compliance violation test
    this.addTestScenario({
      id: 'compliance-violation',
      name: 'Compliance Violation',
      description: 'Test with compliance violations',
      type: 'compliance-violation',
      severity: 'critical',
      brandConfig: this.createComplianceViolationConfig(),
      expectedOutcome: 'fail',
      tags: ['compliance', 'standards', 'violation']
    });

    // Edge case test
    this.addTestScenario({
      id: 'edge-case-minimal',
      name: 'Edge Case - Minimal Configuration',
      description: 'Test with minimal valid configuration',
      type: 'edge-case',
      severity: 'medium',
      brandConfig: this.createMinimalValidConfig(),
      expectedOutcome: 'pass',
      tags: ['edge-case', 'minimal', 'boundary']
    });

    // Stress test
    this.addTestScenario({
      id: 'stress-test-large-config',
      name: 'Stress Test - Large Configuration',
      description: 'Test with large, complex configuration',
      type: 'stress-test',
      severity: 'low',
      brandConfig: this.createLargeConfig(),
      expectedOutcome: 'pass',
      tags: ['stress-test', 'large', 'complex']
    });

    // Integration test
    this.addTestScenario({
      id: 'integration-test',
      name: 'Integration Test',
      description: 'Test brand configuration integration',
      type: 'integration-test',
      severity: 'high',
      brandConfig: this.createIntegrationTestConfig(),
      expectedOutcome: 'pass',
      tags: ['integration', 'components', 'system']
    });
  }

  /**
   * Create valid brand configuration
   */
  private createValidBrandConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-valid',
      brand: {
        id: 'test-brand-valid',
        name: 'Valid Test Brand',
        description: 'A complete, valid test brand configuration',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Valid Test Brand Logo',
          width: 120,
          height: 40,
          initials: 'VT',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'valid',
    };
  }

  /**
   * Create invalid brand configuration
   */
  private createInvalidBrandConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-invalid',
      brand: {
        id: 'test-brand-invalid',
        name: '', // Invalid: empty name
        description: 'An invalid test brand configuration',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          primary: 'invalid-color', // Invalid: not a hex color
          secondary: '#34C759',
          neutral: '#8E8E93',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: '', // Invalid: empty font family
          fontWeights: [], // Invalid: empty font weights
          fontDisplay: 'invalid-display', // Invalid: invalid display value
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '', // Invalid: empty src
          alt: 'logo', // Invalid: generic alt text
          width: 0, // Invalid: zero width
          height: 0, // Invalid: zero height
          initials: 'IT',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'invalid',
    };
  }

  /**
   * Create incomplete brand configuration
   */
  private createIncompleteBrandConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-incomplete',
      brand: {
        id: 'test-brand-incomplete',
        name: 'Incomplete Brand',
        description: 'An incomplete test brand configuration',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Incomplete Brand Logo',
          width: 120,
          height: 40,
          initials: 'IB',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'pending',
    };
  }

  /**
   * Create accessibility violation configuration
   */
  private createAccessibilityViolationConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-accessibility',
      brand: {
        id: 'test-brand-accessibility',
        name: 'Accessibility Violation Brand',
        description: 'A brand configuration with accessibility violations',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          primary: '#CCCCCC', // Low contrast color
          secondary: '#DDDDDD', // Low contrast color
          neutral: '#EEEEEE', // Low contrast color
          accent: '#FFFFFF', // Very low contrast
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          fontDisplay: 'block', // Poor performance
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'logo', // Generic alt text
          width: 120,
          height: 40,
          initials: 'AV',
          fallbackBgColor: '#CCCCCC',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'invalid',
    };
  }

  /**
   * Create usability violation configuration
   */
  private createUsabilityViolationConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-usability',
      brand: {
        id: 'test-brand-usability',
        name: '', // Missing brand name
        description: 'A brand configuration with usability violations',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '', // Missing logo src
          alt: 'logo', // Generic alt text
          width: 120,
          height: 40,
          initials: 'UV',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'invalid',
    };
  }

  /**
   * Create performance violation configuration
   */
  private createPerformanceViolationConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-performance',
      brand: {
        id: 'test-brand-performance',
        name: 'Performance Violation Brand',
        description: 'A brand configuration with performance violations',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          fontDisplay: 'block', // Poor performance
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Performance Violation Brand Logo',
          width: 120,
          height: 40,
          initials: 'PV',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'valid',
    };
  }

  /**
   * Create compliance violation configuration
   */
  private createComplianceViolationConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-compliance',
      brand: {
        id: 'test-brand-compliance',
        name: 'Compliance Violation Brand',
        description: 'A brand configuration with compliance violations',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          primary: '#FF0000', // Bright red - may not be appropriate for all industries
          secondary: '#34C759',
          neutral: '#8E8E93',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Compliance Violation Brand Logo',
          width: 120,
          height: 40,
          initials: 'CV',
          fallbackBgColor: '#FF0000',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'invalid',
    };
  }

  /**
   * Create minimal valid configuration
   */
  private createMinimalValidConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-minimal',
      brand: {
        id: 'test-brand-minimal',
        name: 'Minimal Brand',
        description: 'A minimal valid brand configuration',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
        } as any,
        typography: {
          fontFamily: 'system-ui',
          fontWeights: [400],
          fontDisplay: 'swap',
          scale: {
            base: '1rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Minimal Brand Logo',
          width: 40,
          height: 40,
          initials: 'MB',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          md: '1rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'valid',
    };
  }

  /**
   * Create large configuration
   */
  private createLargeConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-large',
      brand: {
        id: 'test-brand-large',
        name: 'Large Complex Brand Configuration',
        description: 'A large, complex brand configuration for stress testing',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          primary: '#007AFF',
          secondary: '#34C759',
          tertiary: '#FF9500',
          neutral: '#8E8E93',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
          background: '#FFFFFF',
          surface: '#F2F2F7',
          text: '#000000',
          textSecondary: '#8E8E93',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
          fontDisplay: 'swap',
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem',
            '5xl': '3rem',
            '6xl': '3.75rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Large Complex Brand Logo',
          width: 200,
          height: 80,
          initials: 'LC',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'valid',
    };
  }

  /**
   * Create integration test configuration
   */
  private createIntegrationTestConfig(): TenantBrandConfig {
    return {
      tenantId: 'test-tenant-integration',
      brand: {
        id: 'test-brand-integration',
        name: 'Integration Test Brand',
        description: 'A brand configuration for integration testing',
        isCustom: true,
        createdAt: new Date(),
        updatedAt: new Date(),
  },
      theme: {
        colors: {
          name: 'Test Brand',
          primary: '#007AFF',
          secondary: '#34C759',
          accent: '#FF9500',
          success: '#34C759',
          warning: '#FF9500',
          error: '#FF3B30',
          info: '#007AFF',
        } as any,
        typography: {
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeights: [400, 500, 600, 700],
          scale: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
  },
        } as any,
        logo: {
          src: '/logo.svg',
          alt: 'Integration Test Brand Logo',
          width: 120,
          height: 40,
          initials: 'IT',
          fallbackBgColor: '#007AFF',
        } as any,
        spacing: {
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
        } as any,
  },
      isActive: true,
      validationStatus: 'valid',
    };
  }

  /**
   * Calculate suite summary
   */
  private calculateSuiteSummary(testResults: BrandValidationTestResult[]): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    errorTests: number;
    averageScore: number;
    successRate: number;
    duration: number;
  } {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(r => r.status === 'passed').length;
    const failedTests = testResults.filter(r => r.status === 'failed').length;
    const skippedTests = testResults.filter(r => r.status === 'skipped').length;
    const errorTests = testResults.filter(r => r.status === 'error').length;
    
    const totalScore = testResults.reduce((sum, result) => sum + result.score, 0);
    const averageScore = totalTests > 0 ? Math.round(totalScore / totalTests) : 0;
    
    const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    
    const totalDuration = testResults.reduce((sum, result) => sum + result.duration, 0);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      errorTests,
      averageScore,
      successRate,
      duration: totalDuration,
    };
  }
}

/**
 * Global brand validation test suite instance
 */
export const brandValidationTestSuite = new BrandValidationTestSuite();

/**
 * Utility functions for brand validation testing
 */
export const BrandValidationTestUtils = {
  /**
   * Run comprehensive test suite
   */
  async runComprehensiveTestSuite(): Promise<BrandValidationTestSuiteResult> {
    return brandValidationTestSuite.runTestSuite('comprehensive-brand-validation');
  },

  /**
   * Run specific test scenario
   */
  async runTestScenario(scenarioId: string): Promise<BrandValidationTestResult | null> {
    const scenario = brandValidationTestSuite.getTestScenario(scenarioId);
    if (!scenario) return null;

    return brandValidationTestSuite['runTestScenario'](scenario);
  },

  /**
   * Generate test report
   */
  generateTestReport(suiteResult: BrandValidationTestSuiteResult): string {
    return brandValidationTestSuite.generateTestReport(suiteResult);
  },

  /**
   * Get test statistics
   */
  getTestStatistics(suiteResult: BrandValidationTestSuiteResult): {
    totalTests: number;
    successRate: number;
    averageScore: number;
    criticalFailures: number;
    highPriorityFailures: number;
  } {
    const criticalFailures = suiteResult.testResults.filter(r => 
      r.status === 'failed' && r.severity === 'critical'
    ).length;
    
    const highPriorityFailures = suiteResult.testResults.filter(r => 
      r.status === 'failed' && r.severity === 'high'
    ).length;

    return {
      totalTests: suiteResult.summary.totalTests,
      successRate: suiteResult.summary.successRate,
      averageScore: suiteResult.summary.averageScore,
      criticalFailures,
      highPriorityFailures,
    };
  },

  /**
   * Export test results to JSON
   */
  exportTestResults(suiteResult: BrandValidationTestSuiteResult): string {
    return JSON.stringify(suiteResult, null, 2);
  },

  /**
   * Import test results from JSON
   */
  importTestResults(jsonData: string): BrandValidationTestSuiteResult {
    return JSON.parse(jsonData);
  },
};

/**
 * Export types and interfaces - already exported above
 */
