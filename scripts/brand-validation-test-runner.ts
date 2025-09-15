/**
 * @fileoverview HT-011.4.6: Brand Validation Testing Suite - CLI Execution Script
 * @module scripts/brand-validation-test-runner
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.6 - Create Brand Validation Testing Suite
 * Focus: CLI execution script for comprehensive brand validation testing
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (testing script implementation)
 */

import { BrandValidationTestSuite, BrandValidationTestSuiteResult } from '@/lib/branding/brand-validation-test-suite';
import { BrandValidationTestUtils } from '@/lib/branding/brand-validation-test-suite';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * CLI execution options
 */
interface CLIOptions {
  /** Test suite ID */
  suiteId?: string;
  /** Output format */
  format?: 'console' | 'json' | 'markdown' | 'html';
  /** Output file path */
  output?: string;
  /** Enable verbose output */
  verbose?: boolean;
  /** Enable compliance testing */
  compliance?: boolean;
  /** Enable policy testing */
  policy?: boolean;
  /** Enable integration testing */
  integration?: boolean;
  /** Enable stress testing */
  stress?: boolean;
  /** Test timeout in milliseconds */
  timeout?: number;
  /** Maximum retries */
  retries?: number;
  /** Test environment */
  environment?: 'development' | 'staging' | 'production';
  /** Specific test scenarios to run */
  scenarios?: string[];
  /** Exclude specific test scenarios */
  exclude?: string[];
  /** Generate report */
  report?: boolean;
  /** Help flag */
  help?: boolean;
}

/**
 * Brand Validation Test Runner CLI
 */
class BrandValidationTestRunner {
  private options: CLIOptions;
  private testSuite: BrandValidationTestSuite;

  constructor(options: CLIOptions = {}) {
    this.options = {
      suiteId: 'comprehensive-brand-validation',
      format: 'console',
      verbose: false,
      compliance: true,
      policy: true,
      integration: true,
      stress: false,
      timeout: 30000,
      retries: 3,
      environment: 'development',
      report: true,
      ...options,
    };

    this.testSuite = new BrandValidationTestSuite({
      enableComplianceTesting: this.options.compliance,
      enablePolicyTesting: this.options.policy,
      enableIntegrationTesting: this.options.integration,
      enableStressTesting: this.options.stress,
      testTimeout: this.options.timeout,
      maxRetries: this.options.retries,
      testEnvironment: this.options.environment,
    });
  }

  /**
   * Run the test suite
   */
  async run(): Promise<void> {
    try {
      console.log('🚀 Starting Brand Validation Test Suite...');
      console.log(`📊 Configuration:`, this.getConfigSummary());

      // Run test suite
      const suiteResult = await this.testSuite.runTestSuite(this.options.suiteId);

      // Process results
      await this.processResults(suiteResult);

      console.log('\n🎉 Brand Validation Test Suite completed successfully!');

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      process.exit(1);
    }
  }

  /**
   * Process test results
   */
  private async processResults(suiteResult: BrandValidationTestSuiteResult): Promise<void> {
    // Display console output
    if (this.options.format === 'console' || this.options.verbose) {
      this.displayConsoleResults(suiteResult);
    }

    // Generate reports
    if (this.options.report) {
      await this.generateReports(suiteResult);
    }

    // Save output files
    if (this.options.output) {
      await this.saveOutput(suiteResult);
    }

    // Exit with appropriate code
    const exitCode = suiteResult.summary.failedTests > 0 ? 1 : 0;
    if (exitCode !== 0) {
      console.log(`\n⚠️  Test suite completed with ${suiteResult.summary.failedTests} failures`);
    }
  }

  /**
   * Display console results
   */
  private displayConsoleResults(suiteResult: BrandValidationTestSuiteResult): void {
    console.log('\n📊 Test Suite Results:');
    console.log(`   Suite ID: ${suiteResult.suiteId}`);
    console.log(`   Suite Name: ${suiteResult.suiteName}`);
    console.log(`   Executed At: ${suiteResult.metadata.executedAt.toISOString()}`);
    console.log(`   Environment: ${suiteResult.metadata.environment}`);
    console.log('');

    console.log('📈 Summary:');
    console.log(`   Total Tests: ${suiteResult.summary.totalTests}`);
    console.log(`   Passed: ${suiteResult.summary.passedTests}`);
    console.log(`   Failed: ${suiteResult.summary.failedTests}`);
    console.log(`   Skipped: ${suiteResult.summary.skippedTests}`);
    console.log(`   Errors: ${suiteResult.summary.errorTests}`);
    console.log(`   Success Rate: ${suiteResult.summary.successRate}%`);
    console.log(`   Average Score: ${suiteResult.summary.averageScore}/100`);
    console.log(`   Duration: ${suiteResult.summary.duration}ms`);
    console.log('');

    if (this.options.verbose) {
      console.log('📋 Detailed Results:');
      for (const testResult of suiteResult.testResults) {
        const statusIcon = this.getStatusIcon(testResult.status);
        console.log(`   ${statusIcon} ${testResult.testName}`);
        console.log(`      Status: ${testResult.status.toUpperCase()}`);
        console.log(`      Score: ${testResult.score}/100`);
        console.log(`      Expected: ${testResult.expectedOutcome}`);
        console.log(`      Actual: ${testResult.actualOutcome}`);
        console.log(`      Duration: ${testResult.duration}ms`);
        console.log(`      Severity: ${testResult.severity}`);
        
        if (testResult.errorMessage) {
          console.log(`      Error: ${testResult.errorMessage}`);
        }
        
        if (testResult.complianceResult) {
          console.log(`      Compliance: ${testResult.complianceResult.overallScore}/100 (${testResult.complianceResult.compliant ? 'Compliant' : 'Non-compliant'})`);
        }
        
        if (testResult.policyResult) {
          console.log(`      Policy: ${testResult.policyResult.overallScore}/100 (${testResult.policyResult.overallPassed ? 'Passed' : 'Failed'})`);
        }
        
        console.log('');
      }
    }
  }

  /**
   * Generate reports
   */
  private async generateReports(suiteResult: BrandValidationTestSuiteResult): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = `brand-validation-test-report-${timestamp}`;

    // Generate Markdown report
    const markdownReport = BrandValidationTestUtils.generateTestReport(suiteResult);
    const markdownPath = join(process.cwd(), 'reports', `${baseFilename}.md`);
    writeFileSync(markdownPath, markdownReport);
    console.log(`📄 Markdown report saved: ${markdownPath}`);

    // Generate JSON report
    const jsonReport = BrandValidationTestUtils.exportTestResults(suiteResult);
    const jsonPath = join(process.cwd(), 'reports', `${baseFilename}.json`);
    writeFileSync(jsonPath, jsonReport);
    console.log(`📄 JSON report saved: ${jsonPath}`);

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(suiteResult);
    const htmlPath = join(process.cwd(), 'reports', `${baseFilename}.html`);
    writeFileSync(htmlPath, htmlReport);
    console.log(`📄 HTML report saved: ${htmlPath}`);
  }

  /**
   * Save output to file
   */
  private async saveOutput(suiteResult: BrandValidationTestSuiteResult): Promise<void> {
    if (!this.options.output) return;

    let content: string;
    let extension: string;

    switch (this.options.format) {
      case 'json':
        content = BrandValidationTestUtils.exportTestResults(suiteResult);
        extension = '.json';
        break;
      case 'markdown':
        content = BrandValidationTestUtils.generateTestReport(suiteResult);
        extension = '.md';
        break;
      case 'html':
        content = this.generateHTMLReport(suiteResult);
        extension = '.html';
        break;
      default:
        content = BrandValidationTestUtils.generateTestReport(suiteResult);
        extension = '.txt';
    }

    const outputPath = this.options.output.endsWith(extension) 
      ? this.options.output 
      : `${this.options.output}${extension}`;

    writeFileSync(outputPath, content);
    console.log(`💾 Output saved: ${outputPath}`);
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(suiteResult: BrandValidationTestSuiteResult): string {
    const stats = BrandValidationTestUtils.getTestStatistics(suiteResult);
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brand Validation Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: #007AFF; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007AFF; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #007AFF; }
        .test-results { margin-top: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 8px; border-left: 4px solid #ddd; }
        .test-item.passed { border-left-color: #34C759; }
        .test-item.failed { border-left-color: #FF3B30; }
        .test-item.error { border-left-color: #FF9500; }
        .test-item.skipped { border-left-color: #8E8E93; }
        .status { font-weight: bold; text-transform: uppercase; }
        .status.passed { color: #34C759; }
        .status.failed { color: #FF3B30; }
        .status.error { color: #FF9500; }
        .status.skipped { color: #8E8E93; }
        .metadata { font-size: 0.9em; color: #666; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Brand Validation Test Report</h1>
            <p>Suite: ${suiteResult.suiteName}</p>
            <p>Executed: ${suiteResult.metadata.executedAt.toISOString()}</p>
            <p>Environment: ${suiteResult.metadata.environment}</p>
        </div>
        
        <div class="content">
            <div class="summary">
                <div class="summary-card">
                    <h3>Total Tests</h3>
                    <div class="value">${stats.totalTests}</div>
                </div>
                <div class="summary-card">
                    <h3>Success Rate</h3>
                    <div class="value">${stats.successRate}%</div>
                </div>
                <div class="summary-card">
                    <h3>Average Score</h3>
                    <div class="value">${stats.averageScore}/100</div>
                </div>
                <div class="summary-card">
                    <h3>Critical Failures</h3>
                    <div class="value">${stats.criticalFailures}</div>
                </div>
            </div>
            
            <div class="test-results">
                <h2>Test Results</h2>
                ${suiteResult.testResults.map(testResult => `
                    <div class="test-item ${testResult.status}">
                        <h3>${testResult.testName}</h3>
                        <p><span class="status ${testResult.status}">${testResult.status}</span> - Score: ${testResult.score}/100</p>
                        <p>Expected: ${testResult.expectedOutcome} | Actual: ${testResult.actualOutcome}</p>
                        <p>Duration: ${testResult.duration}ms | Severity: ${testResult.severity}</p>
                        ${testResult.errorMessage ? `<p><strong>Error:</strong> ${testResult.errorMessage}</p>` : ''}
                        ${testResult.complianceResult ? `<p><strong>Compliance:</strong> ${testResult.complianceResult.overallScore}/100 (${testResult.complianceResult.compliant ? 'Compliant' : 'Non-compliant'})</p>` : ''}
                        ${testResult.policyResult ? `<p><strong>Policy:</strong> ${testResult.policyResult.overallScore}/100 (${testResult.policyResult.overallPassed ? 'Passed' : 'Failed'})</p>` : ''}
                        <div class="metadata">
                            Tested: ${testResult.metadata.testedAt.toISOString()} | 
                            Tenant: ${testResult.metadata.tenantId} | 
                            Environment: ${testResult.metadata.testEnvironment}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'passed': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      case 'skipped': return '⏭️';
      default: return '❓';
    }
  }

  /**
   * Get configuration summary
   */
  private getConfigSummary(): object {
    return {
      suiteId: this.options.suiteId,
      format: this.options.format,
      verbose: this.options.verbose,
      compliance: this.options.compliance,
      policy: this.options.policy,
      integration: this.options.integration,
      stress: this.options.stress,
      timeout: this.options.timeout,
      retries: this.options.retries,
      environment: this.options.environment,
    };
  }

  /**
   * Display help information
   */
  static displayHelp(): void {
    console.log(`
Brand Validation Test Runner

Usage: npm run test:brand-validation [options]

Options:
  --suite-id <id>          Test suite ID (default: comprehensive-brand-validation)
  --format <format>        Output format: console, json, markdown, html (default: console)
  --output <path>          Output file path
  --verbose                Enable verbose output
  --compliance             Enable compliance testing (default: true)
  --policy                 Enable policy testing (default: true)
  --integration            Enable integration testing (default: true)
  --stress                 Enable stress testing (default: false)
  --timeout <ms>           Test timeout in milliseconds (default: 30000)
  --retries <count>        Maximum retries (default: 3)
  --environment <env>      Test environment: development, staging, production (default: development)
  --scenarios <list>       Specific test scenarios to run (comma-separated)
  --exclude <list>         Exclude specific test scenarios (comma-separated)
  --report                 Generate reports (default: true)
  --help                   Display this help information

Examples:
  npm run test:brand-validation
  npm run test:brand-validation -- --format json --output results.json
  npm run test:brand-validation -- --verbose --stress --environment production
  npm run test:brand-validation -- --scenarios valid-config,invalid-config --exclude stress-test
    `);
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--suite-id':
        options.suiteId = args[++i];
        break;
      case '--format':
        options.format = args[++i] as any;
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--compliance':
        options.compliance = true;
        break;
      case '--policy':
        options.policy = true;
        break;
      case '--integration':
        options.integration = true;
        break;
      case '--stress':
        options.stress = true;
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]);
        break;
      case '--retries':
        options.retries = parseInt(args[++i]);
        break;
      case '--environment':
        options.environment = args[++i] as any;
        break;
      case '--scenarios':
        options.scenarios = args[++i].split(',');
        break;
      case '--exclude':
        options.exclude = args[++i].split(',');
        break;
      case '--report':
        options.report = true;
        break;
      case '--help':
        options.help = true;
        break;
    }
  }

  return options;
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  const options = parseArgs();

  if (options.help) {
    BrandValidationTestRunner.displayHelp();
    return;
  }

  const runner = new BrandValidationTestRunner(options);
  await runner.run();
}

// Run if called directly
main().catch(error => {
  console.error('❌ Execution failed:', error);
  process.exit(1);
});

export { BrandValidationTestRunner, CLIOptions };
