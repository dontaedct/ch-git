/**
 * @fileoverview OSS Hero Brand Policy Testing Suite
 * @description Comprehensive testing for brand-specific design policies
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.5: Implement Brand-Specific Design Policies
 */

import { TenantBrandConfig } from './types';
import { brandPolicyEnforcementSystem } from './brand-policy-enforcement';
import { BrandPolicyEnforcementResult } from './brand-policy-enforcement';

/**
 * Test scenarios for brand policies
 */
export class BrandPolicyTestSuite {
  
  /**
   * Run all brand policy tests
   */
  static async runAllTests(): Promise<{
    passed: number;
    failed: number;
    total: number;
    results: Array<{ scenario: string; passed: boolean; result: BrandPolicyEnforcementResult }>;
  }> {
    const testScenarios = [
      this.createValidBrandConfig(),
      this.createInvalidBrandConfig(),
      this.createIncompleteBrandConfig(),
      this.createAccessibilityViolationConfig(),
      this.createUsabilityViolationConfig(),
      this.createPerformanceViolationConfig(),
    ];

    const results = [];
    let passed = 0;
    let failed = 0;

    for (const scenario of testScenarios) {
      const result = brandPolicyEnforcementSystem.enforcePolicies(scenario.config);
      const testPassed = this.evaluateTestResult(scenario.name, result, scenario.expectedOutcome);
      
      results.push({
        scenario: scenario.name,
        passed: testPassed,
        result,
      });

      if (testPassed) {
        passed++;
      } else {
        failed++;
      }
    }

    return {
      passed,
      failed,
      total: testScenarios.length,
      results,
    };
  }

  /**
   * Create valid brand configuration test
   */
  private static createValidBrandConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'pass';
  } {
    return {
      name: 'Valid Brand Configuration',
      config: {
        tenantId: 'test-tenant-1',
        brand: {
          id: 'test-brand-1',
          name: 'Test Brand',
          description: 'A test brand configuration',
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        theme: {
          colors: {
            primary: '#007AFF',
            secondary: '#34C759',
            neutral: '#8E8E93',
            accent: '#FF9500',
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#007AFF',
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeights: [400, 500, 600, 700],
            fontDisplay: 'swap',
            scale: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
            },
          },
          logo: {
            src: '/logo.svg',
            alt: 'Test Brand Logo',
            width: 120,
            height: 40,
            initials: 'TB',
            fallbackBgColor: '#007AFF',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'valid',
      },
      expectedOutcome: 'pass',
    };
  }

  /**
   * Create invalid brand configuration test
   */
  private static createInvalidBrandConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'fail';
  } {
    return {
      name: 'Invalid Brand Configuration',
      config: {
        tenantId: 'test-tenant-2',
        brand: {
          id: 'test-brand-2',
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
          },
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
          },
          logo: {
            src: '', // Invalid: empty src
            alt: 'logo', // Invalid: generic alt text
            width: 0, // Invalid: zero width
            height: 0, // Invalid: zero height
            initials: 'TB',
            fallbackBgColor: '#007AFF',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'invalid',
      },
      expectedOutcome: 'fail',
    };
  }

  /**
   * Create incomplete brand configuration test
   */
  private static createIncompleteBrandConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'fail';
  } {
    return {
      name: 'Incomplete Brand Configuration',
      config: {
        tenantId: 'test-tenant-3',
        brand: {
          id: 'test-brand-3',
          name: 'Incomplete Brand',
          description: 'An incomplete test brand configuration',
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        theme: {
          colors: {
            primary: '#007AFF',
            // Missing secondary, neutral, accent, and semantic colors
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeights: [400, 500, 600, 700],
            fontDisplay: 'swap',
            scale: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
            },
          },
          logo: {
            src: '/logo.svg',
            alt: 'Incomplete Brand Logo',
            width: 120,
            height: 40,
            initials: 'IB',
            fallbackBgColor: '#007AFF',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'pending',
      },
      expectedOutcome: 'fail',
    };
  }

  /**
   * Create accessibility violation configuration test
   */
  private static createAccessibilityViolationConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'fail';
  } {
    return {
      name: 'Accessibility Violation Configuration',
      config: {
        tenantId: 'test-tenant-4',
        brand: {
          id: 'test-brand-4',
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
          },
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
          },
          logo: {
            src: '/logo.svg',
            alt: 'logo', // Generic alt text
            width: 120,
            height: 40,
            initials: 'AV',
            fallbackBgColor: '#CCCCCC',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'invalid',
      },
      expectedOutcome: 'fail',
    };
  }

  /**
   * Create usability violation configuration test
   */
  private static createUsabilityViolationConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'fail';
  } {
    return {
      name: 'Usability Violation Configuration',
      config: {
        tenantId: 'test-tenant-5',
        brand: {
          id: 'test-brand-5',
          name: '', // Missing brand name
          description: 'A brand configuration with usability violations',
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        theme: {
          colors: {
            primary: '#007AFF',
            secondary: '#34C759',
            neutral: '#8E8E93',
            accent: '#FF9500',
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#007AFF',
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeights: [400, 500, 600, 700],
            fontDisplay: 'swap',
            scale: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
            },
          },
          logo: {
            src: '', // Missing logo src
            alt: 'logo', // Generic alt text
            width: 120,
            height: 40,
            initials: 'UV',
            fallbackBgColor: '#007AFF',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'invalid',
      },
      expectedOutcome: 'fail',
    };
  }

  /**
   * Create performance violation configuration test
   */
  private static createPerformanceViolationConfig(): {
    name: string;
    config: TenantBrandConfig;
    expectedOutcome: 'fail';
  } {
    return {
      name: 'Performance Violation Configuration',
      config: {
        tenantId: 'test-tenant-6',
        brand: {
          id: 'test-brand-6',
          name: 'Performance Violation Brand',
          description: 'A brand configuration with performance violations',
          isCustom: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        theme: {
          colors: {
            primary: '#007AFF',
            secondary: '#34C759',
            neutral: '#8E8E93',
            accent: '#FF9500',
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#007AFF',
          },
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
          },
          logo: {
            src: '/logo.svg',
            alt: 'Performance Violation Brand Logo',
            width: 120,
            height: 40,
            initials: 'PV',
            fallbackBgColor: '#007AFF',
          },
          spacing: {
            sm: '0.5rem',
            md: '1rem',
            lg: '1.5rem',
            xl: '2rem',
          },
        },
        isActive: true,
        validationStatus: 'valid',
      },
      expectedOutcome: 'fail',
    };
  }

  /**
   * Evaluate test result
   */
  private static evaluateTestResult(
    scenarioName: string,
    result: BrandPolicyEnforcementResult,
    expectedOutcome: 'pass' | 'fail'
  ): boolean {
    const actualOutcome = result.overallPassed ? 'pass' : 'fail';
    const testPassed = actualOutcome === expectedOutcome;

    console.log(`\n=== ${scenarioName} ===`);
    console.log(`Expected: ${expectedOutcome}`);
    console.log(`Actual: ${actualOutcome}`);
    console.log(`Score: ${result.overallScore}/100`);
    console.log(`Status: ${testPassed ? '✅ PASSED' : '❌ FAILED'}`);

    if (!testPassed) {
      console.log('\nViolations:');
      result.criticalViolations.forEach(violation => {
        console.log(`  - CRITICAL: ${violation.message}`);
      });
      result.highPriorityViolations.forEach(violation => {
        console.log(`  - HIGH: ${violation.message}`);
      });
    }

    return testPassed;
  }

  /**
   * Generate test report
   */
  static generateTestReport(testResults: {
    passed: number;
    failed: number;
    total: number;
    results: Array<{ scenario: string; passed: boolean; result: BrandPolicyEnforcementResult }>;
  }): string {
    const report = [];
    
    report.push('# Brand Policy Test Report');
    report.push('');
    report.push(`**Total Tests:** ${testResults.total}`);
    report.push(`**Passed:** ${testResults.passed}`);
    report.push(`**Failed:** ${testResults.failed}`);
    report.push(`**Success Rate:** ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    report.push('');
    
    report.push('## Test Results');
    report.push('');
    
    for (const testResult of testResults.results) {
      report.push(`### ${testResult.scenario}`);
      report.push('');
      report.push(`- **Status:** ${testResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
      report.push(`- **Score:** ${testResult.result.overallScore}/100`);
      report.push(`- **Critical Violations:** ${testResult.result.criticalViolations.length}`);
      report.push(`- **High Priority Violations:** ${testResult.result.highPriorityViolations.length}`);
      report.push('');
    }
    
    return report.join('\n');
  }
}

/**
 * Export the brand policy test suite
 */
export { BrandPolicyTestSuite };
