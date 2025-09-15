#!/usr/bin/env tsx

/**
 * @fileoverview HT-008.7.7: Test Automation Configuration Script
 * @module scripts/test-automation-config.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.7.7 - Test Automation & CI Integration
 * Focus: Comprehensive test automation configuration and pipeline management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (CI/CD infrastructure)
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import * as path from 'path';

/**
 * Test Automation Configuration
 */
interface TestAutomationConfig {
  testSuites: {
    unit: boolean;
    integration: boolean;
    e2e: boolean;
    security: boolean;
    accessibility: boolean;
    performance: boolean;
    visual: boolean;
    contracts: boolean;
  };
  ciIntegration: {
    githubActions: boolean;
    caching: boolean;
    parallelExecution: boolean;
    artifactManagement: boolean;
  };
  reporting: {
    coverage: boolean;
    testResults: boolean;
    performanceMetrics: boolean;
    securityReports: boolean;
    accessibilityReports: boolean;
  };
  thresholds: {
    coverage: number;
    performance: number;
    security: number;
    accessibility: number;
  };
}

/**
 * Test Automation Configuration Manager
 * 
 * This script manages comprehensive test automation configuration including:
 * - Test suite configuration
 * - CI/CD integration setup
 * - Reporting and metrics configuration
 * - Threshold and quality gate management
 * - Pipeline optimization settings
 */
class TestAutomationConfigManager {
  private config: TestAutomationConfig;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.config = this.loadDefaultConfig();
  }

  /**
   * Load default configuration
   */
  private loadDefaultConfig(): TestAutomationConfig {
    return {
      testSuites: {
        unit: true,
        integration: true,
        e2e: true,
        security: true,
        accessibility: true,
        performance: true,
        visual: true,
        contracts: true
      },
      ciIntegration: {
        githubActions: true,
        caching: true,
        parallelExecution: true,
        artifactManagement: true
      },
      reporting: {
        coverage: true,
        testResults: true,
        performanceMetrics: true,
        securityReports: true,
        accessibilityReports: true
      },
      thresholds: {
        coverage: 80,
        performance: 90,
        security: 95,
        accessibility: 90
      }
    };
  }

  /**
   * Configure test automation
   */
  async configureTestAutomation(): Promise<void> {
    console.log('🔧 Configuring Test Automation & CI Integration...');
    console.log('================================================');

    try {
      // Configure test suites
      await this.configureTestSuites();
      
      // Configure CI integration
      await this.configureCIIntegration();
      
      // Configure reporting
      await this.configureReporting();
      
      // Configure thresholds
      await this.configureThresholds();
      
      // Generate configuration files
      await this.generateConfigurationFiles();
      
      // Update package.json scripts
      await this.updatePackageJsonScripts();
      
      // Generate documentation
      await this.generateDocumentation();
      
      console.log('\n✅ Test Automation Configuration Complete');
      this.displaySummary();

    } catch (error) {
      console.error('❌ Test automation configuration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Configure test suites
   */
  private async configureTestSuites(): Promise<void> {
    console.log('📋 Configuring Test Suites...');

    const testSuites = this.config.testSuites;
    
    console.log(`Unit Tests: ${testSuites.unit ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Integration Tests: ${testSuites.integration ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`E2E Tests: ${testSuites.e2e ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Security Tests: ${testSuites.security ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Accessibility Tests: ${testSuites.accessibility ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Performance Tests: ${testSuites.performance ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Visual Tests: ${testSuites.visual ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Contract Tests: ${testSuites.contracts ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Configure CI integration
   */
  private async configureCIIntegration(): Promise<void> {
    console.log('🚀 Configuring CI Integration...');

    const ciIntegration = this.config.ciIntegration;
    
    console.log(`GitHub Actions: ${ciIntegration.githubActions ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Caching: ${ciIntegration.caching ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Parallel Execution: ${ciIntegration.parallelExecution ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Artifact Management: ${ciIntegration.artifactManagement ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Configure reporting
   */
  private async configureReporting(): Promise<void> {
    console.log('📊 Configuring Reporting...');

    const reporting = this.config.reporting;
    
    console.log(`Coverage Reports: ${reporting.coverage ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Test Results: ${reporting.testResults ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Performance Metrics: ${reporting.performanceMetrics ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Security Reports: ${reporting.securityReports ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Accessibility Reports: ${reporting.accessibilityReports ? '✅ Enabled' : '❌ Disabled'}`);
  }

  /**
   * Configure thresholds
   */
  private async configureThresholds(): Promise<void> {
    console.log('🎯 Configuring Quality Thresholds...');

    const thresholds = this.config.thresholds;
    
    console.log(`Coverage Threshold: ${thresholds.coverage}%`);
    console.log(`Performance Threshold: ${thresholds.performance}%`);
    console.log(`Security Threshold: ${thresholds.security}%`);
    console.log(`Accessibility Threshold: ${thresholds.accessibility}%`);
  }

  /**
   * Generate configuration files
   */
  private async generateConfigurationFiles(): Promise<void> {
    console.log('📄 Generating Configuration Files...');

    // Generate Jest configuration
    await this.generateJestConfig();
    
    // Generate Playwright configuration
    await this.generatePlaywrightConfig();
    
    // Generate test automation config
    await this.generateTestAutomationConfig();
    
    // Generate CI configuration
    await this.generateCIConfig();
  }

  /**
   * Generate Jest configuration
   */
  private async generateJestConfig(): Promise<void> {
    const jestConfig = {
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/tests'],
      testMatch: [
        '**/__tests__/**/*.ts',
        '**/?(*.)+(spec|test).ts'
      ],
      transform: {
        '^.+\\.ts$': 'ts-jest'
      },
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        'components/**/*.{ts,tsx}',
        'lib/**/*.{ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**'
      ],
      coverageThreshold: {
        global: {
          branches: this.config.thresholds.coverage,
          functions: this.config.thresholds.coverage,
          lines: this.config.thresholds.coverage,
          statements: this.config.thresholds.coverage
        }
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      testTimeout: 30000,
      verbose: true
    };

    writeFileSync(
      path.join(this.projectRoot, 'jest.config.js'),
      `module.exports = ${JSON.stringify(jestConfig, null, 2)};`
    );
  }

  /**
   * Generate Playwright configuration
   */
  private async generatePlaywrightConfig(): Promise<void> {
    const playwrightConfig = {
      testDir: './tests',
      fullyParallel: true,
      forbidOnly: !!process.env.CI,
      retries: process.env.CI ? 2 : 0,
      workers: process.env.CI ? 1 : undefined,
      reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results.json' }],
        ['junit', { outputFile: 'test-results.xml' }]
      ],
      use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        actionTimeout: 10000,
        navigationTimeout: 30000
      },
      projects: [
        {
          name: 'chromium',
          use: { ...require('@playwright/test').devices['Desktop Chrome'] }
        },
        {
          name: 'firefox',
          use: { ...require('@playwright/test').devices['Desktop Firefox'] }
        },
        {
          name: 'webkit',
          use: { ...require('@playwright/test').devices['Desktop Safari'] }
        }
      ],
      webServer: process.env.CI ? {
        command: 'npx next dev --port 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: false,
        timeout: 120 * 1000
      } : undefined,
      timeout: 30 * 1000,
      expect: {
        timeout: 5000
      }
    };

    writeFileSync(
      path.join(this.projectRoot, 'playwright.config.ts'),
      `import { defineConfig, devices } from '@playwright/test';

export default defineConfig(${JSON.stringify(playwrightConfig, null, 2)});`
    );
  }

  /**
   * Generate test automation configuration
   */
  private async generateTestAutomationConfig(): Promise<void> {
    const configPath = path.join(this.projectRoot, 'test-automation.config.json');
    writeFileSync(configPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Generate CI configuration
   */
  private async generateCIConfig(): Promise<void> {
    const ciConfig = {
      testAutomation: {
        enabled: true,
        testSuites: this.config.testSuites,
        thresholds: this.config.thresholds,
        reporting: this.config.reporting
      },
      ciIntegration: this.config.ciIntegration,
      optimization: {
        caching: true,
        parallelExecution: true,
        artifactManagement: true
      }
    };

    const configPath = path.join(this.projectRoot, 'ci.config.json');
    writeFileSync(configPath, JSON.stringify(ciConfig, null, 2));
  }

  /**
   * Update package.json scripts
   */
  private async updatePackageJsonScripts(): Promise<void> {
    console.log('📦 Updating Package.json Scripts...');

    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

    // Add test automation scripts
    packageJson.scripts = {
      ...packageJson.scripts,
      'test:automation': 'tsx scripts/test-automation-config.ts',
      'test:automation:configure': 'tsx scripts/test-automation-config.ts',
      'test:automation:run': 'npm run test:all && npm run test:security:comprehensive && npm run test:accessibility:comprehensive',
      'test:automation:ci': 'npm run test:automation:run',
      'test:automation:report': 'tsx scripts/test-automation-report.ts'
    };

    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  /**
   * Generate documentation
   */
  private async generateDocumentation(): Promise<void> {
    console.log('📚 Generating Documentation...');

    const docsDir = path.join(this.projectRoot, 'docs');
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    const documentation = `# HT-008.7.7: Test Automation & CI Integration Documentation

## Overview

This document describes the comprehensive test automation and CI integration system implemented as part of HT-008.7.7.

## Test Suites

### Unit Tests
- **Location**: \`tests/unit/\`
- **Framework**: Jest
- **Coverage**: ${this.config.thresholds.coverage}%
- **Status**: ${this.config.testSuites.unit ? 'Enabled' : 'Disabled'}

### Integration Tests
- **Location**: \`tests/integration/\`
- **Framework**: Jest
- **Coverage**: ${this.config.thresholds.coverage}%
- **Status**: ${this.config.testSuites.integration ? 'Enabled' : 'Disabled'}

### E2E Tests
- **Location**: \`tests/e2e/\`
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Status**: ${this.config.testSuites.e2e ? 'Enabled' : 'Disabled'}

### Security Tests
- **Location**: \`tests/security/\`
- **Framework**: Playwright + Custom Security Testing
- **Coverage**: Vulnerability scanning, penetration testing
- **Status**: ${this.config.testSuites.security ? 'Enabled' : 'Disabled'}

### Accessibility Tests
- **Location**: \`tests/ui/accessibility-enhanced.spec.ts\`
- **Framework**: Playwright + Axe Core
- **Coverage**: WCAG 2.1 AAA compliance
- **Status**: ${this.config.testSuites.accessibility ? 'Enabled' : 'Disabled'}

### Performance Tests
- **Location**: \`tests/e2e/performance-comprehensive.spec.ts\`
- **Framework**: Playwright + Lighthouse
- **Coverage**: Core Web Vitals, performance metrics
- **Status**: ${this.config.testSuites.performance ? 'Enabled' : 'Disabled'}

### Visual Tests
- **Location**: \`tests/visual/\`
- **Framework**: Playwright
- **Coverage**: Visual regression testing
- **Status**: ${this.config.testSuites.visual ? 'Enabled' : 'Disabled'}

### Contract Tests
- **Location**: \`tests/contracts/\`
- **Framework**: Jest
- **Coverage**: API contract validation
- **Status**: ${this.config.testSuites.contracts ? 'Enabled' : 'Disabled'}

## CI Integration

### GitHub Actions
- **Workflow**: \`.github/workflows/test-automation-pipeline.yml\`
- **Triggers**: Push, Pull Request, Schedule, Manual
- **Status**: ${this.config.ciIntegration.githubActions ? 'Enabled' : 'Disabled'}

### Caching
- **Jest Cache**: Enabled
- **Playwright Cache**: Enabled
- **Node Modules Cache**: Enabled
- **Status**: ${this.config.ciIntegration.caching ? 'Enabled' : 'Disabled'}

### Parallel Execution
- **Unit Tests**: Parallel execution
- **E2E Tests**: Parallel execution
- **Status**: ${this.config.ciIntegration.parallelExecution ? 'Enabled' : 'Disabled'}

### Artifact Management
- **Test Results**: Automated upload
- **Coverage Reports**: Automated upload
- **Performance Reports**: Automated upload
- **Status**: ${this.config.ciIntegration.artifactManagement ? 'Enabled' : 'Disabled'}

## Reporting

### Coverage Reports
- **Format**: HTML, JSON, LCOV
- **Threshold**: ${this.config.thresholds.coverage}%
- **Status**: ${this.config.reporting.coverage ? 'Enabled' : 'Disabled'}

### Test Results
- **Format**: HTML, JSON, JUnit XML
- **Location**: \`test-results/\`, \`playwright-report/\`
- **Status**: ${this.config.reporting.testResults ? 'Enabled' : 'Disabled'}

### Performance Metrics
- **Format**: JSON, HTML
- **Location**: \`reports/performance-*\`
- **Status**: ${this.config.reporting.performanceMetrics ? 'Enabled' : 'Disabled'}

### Security Reports
- **Format**: JSON, HTML, Markdown
- **Location**: \`reports/security-*\`
- **Status**: ${this.config.reporting.securityReports ? 'Enabled' : 'Disabled'}

### Accessibility Reports
- **Format**: JSON, HTML, Markdown
- **Location**: \`reports/accessibility-*\`
- **Status**: ${this.config.reporting.accessibilityReports ? 'Enabled' : 'Disabled'}

## Quality Thresholds

- **Coverage**: ${this.config.thresholds.coverage}%
- **Performance**: ${this.config.thresholds.performance}%
- **Security**: ${this.config.thresholds.security}%
- **Accessibility**: ${this.config.thresholds.accessibility}%

## Usage

### Running Tests Locally
\`\`\`bash
# Run all tests
npm run test:automation:run

# Run specific test suite
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:security:comprehensive
npm run test:accessibility:comprehensive
npm run test:performance
npm run test:visual
npm run test:contracts
\`\`\`

### CI/CD Integration
\`\`\`bash
# Run tests in CI
npm run test:automation:ci

# Generate reports
npm run test:automation:report
\`\`\`

## Configuration

### Test Automation Config
- **File**: \`test-automation.config.json\`
- **Purpose**: Test suite and CI configuration

### CI Config
- **File**: \`ci.config.json\`
- **Purpose**: CI/CD pipeline configuration

### Jest Config
- **File**: \`jest.config.js\`
- **Purpose**: Unit and integration test configuration

### Playwright Config
- **File**: \`playwright.config.ts\`
- **Purpose**: E2E, security, accessibility, performance, and visual test configuration

## Next Steps

- **HT-008.7.8**: Test Documentation & Coverage Reporting
- **HT-008.8**: Performance Optimization & Monitoring
- **HT-008.9**: Security Hardening & Compliance

---

_Generated by HT-008.7.7 Test Automation & CI Integration Configuration Manager_`;

    writeFileSync(
      path.join(docsDir, 'TEST_AUTOMATION_DOCUMENTATION.md'),
      documentation
    );
  }

  /**
   * Display configuration summary
   */
  private displaySummary(): void {
    console.log('\n🔧 Test Automation Configuration Summary');
    console.log('=====================================');
    console.log(`Test Suites: ${Object.values(this.config.testSuites).filter(Boolean).length}/8 enabled`);
    console.log(`CI Integration: ${this.config.ciIntegration.githubActions ? 'GitHub Actions' : 'Disabled'}`);
    console.log(`Caching: ${this.config.ciIntegration.caching ? 'Enabled' : 'Disabled'}`);
    console.log(`Parallel Execution: ${this.config.ciIntegration.parallelExecution ? 'Enabled' : 'Disabled'}`);
    console.log(`Artifact Management: ${this.config.ciIntegration.artifactManagement ? 'Enabled' : 'Disabled'}`);
    console.log(`Coverage Threshold: ${this.config.thresholds.coverage}%`);
    console.log(`Performance Threshold: ${this.config.thresholds.performance}%`);
    console.log(`Security Threshold: ${this.config.thresholds.security}%`);
    console.log(`Accessibility Threshold: ${this.config.thresholds.accessibility}%`);
    console.log('\n📄 Configuration files generated:');
    console.log('- jest.config.js');
    console.log('- playwright.config.ts');
    console.log('- test-automation.config.json');
    console.log('- ci.config.json');
    console.log('- docs/TEST_AUTOMATION_DOCUMENTATION.md');
    console.log('\n📦 Package.json scripts updated');
    console.log('\n✅ Test Automation & CI Integration configuration complete!');
  }
}

/**
 * CLI Interface
 */
async function main() {
  const configManager = new TestAutomationConfigManager();
  
  try {
    await configManager.configureTestAutomation();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test automation configuration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { TestAutomationConfigManager };
export type { TestAutomationConfig };
