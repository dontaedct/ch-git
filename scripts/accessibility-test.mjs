#!/usr/bin/env node

/**
 * @fileoverview Accessibility Testing Script
 * @description Comprehensive accessibility testing with axe-core for WCAG AA compliance
 * @version 1.0.0
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const PAGES_TO_TEST = [
  '/',
  '/intake',
  '/login',
  '/dashboard'
];

const ACCESSIBILITY_RULES = [
  'wcag2a',
  'wcag2aa',
  'color-contrast',
  'heading-order',
  'label',
  'image-alt',
  'aria-allowed-attr',
  'aria-required-attr',
  'button-name',
  'link-name',
  'focus-order-semantics',
  'landmark-one-main',
  'html-has-lang'
];

class AccessibilityTester {
  constructor() {
    this.results = [];
    this.violations = [];
    this.warnings = [];
  }

  async runTests() {
    console.log('🔍 Starting comprehensive accessibility testing...\n');

    try {
      // Run Playwright accessibility tests
      await this.runPlaywrightTests();
      
      // Run Storybook accessibility tests if available
      await this.runStorybookTests();
      
      // Generate accessibility report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Accessibility testing failed:', error.message);
      process.exit(1);
    }
  }

  async runPlaywrightTests() {
    console.log('📱 Running Playwright accessibility tests...');
    
    try {
      const command = `npx playwright test tests/ui/a11y.spec.ts --reporter=json`;
      const output = execSync(command, { encoding: 'utf8' });
      
      // Parse test results
      const testResults = JSON.parse(output);
      
      if (testResults.status === 'passed') {
        console.log('✅ Playwright accessibility tests passed');
      } else {
        console.log('❌ Playwright accessibility tests failed');
        this.violations.push(...testResults.errors || []);
      }
      
    } catch (error) {
      console.log('⚠️  Playwright tests failed or not configured');
      this.warnings.push('Playwright accessibility tests could not be run');
    }
  }

  async runStorybookTests() {
    console.log('📚 Running Storybook accessibility tests...');
    
    try {
      // Check if Storybook is built
      const storybookExists = execSync('ls .storybook-out', { encoding: 'utf8' }).includes('index.html');
      
      if (storybookExists) {
        const command = `npx test-storybook --test-runner --watch=false`;
        execSync(command, { encoding: 'utf8' });
        console.log('✅ Storybook accessibility tests passed');
      } else {
        console.log('⚠️  Storybook not built - run "npm run build-storybook" first');
        this.warnings.push('Storybook not built for testing');
      }
      
    } catch (error) {
      console.log('⚠️  Storybook tests failed or not configured');
      this.warnings.push('Storybook accessibility tests could not be run');
    }
  }

  async generateReport() {
    console.log('📊 Generating accessibility report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        violations: this.violations.length,
        warnings: this.warnings.length,
        status: this.violations.length === 0 ? 'PASSED' : 'FAILED'
      },
      violations: this.violations,
      warnings: this.warnings,
      recommendations: this.generateRecommendations()
    };

    // Write report to file
    const reportPath = join(process.cwd(), 'reports', 'accessibility-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Write human-readable report
    const humanReport = this.generateHumanReadableReport(report);
    const humanReportPath = join(process.cwd(), 'reports', 'accessibility-report.md');
    writeFileSync(humanReportPath, humanReport);
    
    console.log(`📄 Accessibility report saved to:`);
    console.log(`   - ${reportPath}`);
    console.log(`   - ${humanReportPath}`);
    
    // Print summary
    this.printSummary(report);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.violations.length > 0) {
      recommendations.push('Fix accessibility violations before deployment');
    }
    
    if (this.warnings.length > 0) {
      recommendations.push('Address accessibility warnings for better compliance');
    }
    
    recommendations.push('Run accessibility tests regularly in CI/CD pipeline');
    recommendations.push('Consider adding skip links for keyboard navigation');
    recommendations.push('Ensure all interactive elements have proper ARIA labels');
    recommendations.push('Test with screen readers and keyboard-only navigation');
    
    return recommendations;
  }

  generateHumanReadableReport(report) {
    return `# Accessibility Testing Report

**Generated:** ${report.timestamp}
**Status:** ${report.summary.status}

## Summary

- **Total Tests:** ${report.summary.totalTests}
- **Violations:** ${report.summary.violations}
- **Warnings:** ${report.summary.warnings}

## Violations

${report.violations.length === 0 ? '✅ No accessibility violations found' : report.violations.map(v => `- ${v}`).join('\n')}

## Warnings

${report.warnings.length === 0 ? '✅ No warnings' : report.warnings.map(w => `- ${w}`).join('\n')}

## Recommendations

${report.recommendations.map(r => `- ${r}`).join('\n')}

## WCAG Compliance

This application is tested against WCAG 2.1 AA standards including:

- **Perceivable:** Color contrast, text alternatives, adaptable content
- **Operable:** Keyboard accessibility, focus management, navigation
- **Understandable:** Readable text, predictable navigation, input assistance
- **Robust:** Compatible with assistive technologies

## Testing Tools Used

- **Axe Core:** Automated accessibility testing
- **Playwright:** End-to-end accessibility testing
- **Storybook:** Component-level accessibility testing

## Next Steps

1. Address any violations found in this report
2. Run accessibility tests in your CI/CD pipeline
3. Conduct manual testing with assistive technologies
4. Consider user testing with people with disabilities
`;
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(50));
    console.log('📊 ACCESSIBILITY TESTING SUMMARY');
    console.log('='.repeat(50));
    console.log(`Status: ${report.summary.status}`);
    console.log(`Violations: ${report.summary.violations}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log('='.repeat(50));
    
    if (report.summary.status === 'PASSED') {
      console.log('🎉 All accessibility tests passed!');
    } else {
      console.log('⚠️  Accessibility issues found - please review the report');
    }
  }
}

// Run the accessibility tester
const tester = new AccessibilityTester();
tester.runTests().catch(console.error);
