/**
 * @fileoverview HT-011.4.3: Brand Compliance CI/CD Integration
 * @module scripts/brand-compliance-gate
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.3 - Create Brand Compliance Checking System
 * Focus: CI/CD integration for automated compliance enforcement
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

/**
 * Compliance gate configuration
 */
interface ComplianceGateConfig {
  /** Enable compliance gate */
  enabled: boolean;
  /** Fail build on critical issues */
  failOnCritical: boolean;
  /** Fail build on high priority issues */
  failOnHighPriority: boolean;
  /** Minimum compliance score required */
  minComplianceScore: number;
  /** Enable compliance reporting */
  enableReporting: boolean;
  /** Report output directory */
  reportDir: string;
  /** Enable Slack notifications */
  enableSlackNotifications: boolean;
  /** Slack webhook URL */
  slackWebhookUrl?: string;
  /** Enable email notifications */
  enableEmailNotifications: boolean;
  /** Email recipients */
  emailRecipients?: string[];
}

/**
 * Compliance gate result
 */
interface ComplianceGateResult {
  /** Whether the gate passed */
  passed: boolean;
  /** Overall compliance score */
  score: number;
  /** Critical issues count */
  criticalIssues: number;
  /** High priority issues count */
  highPriorityIssues: number;
  /** Total issues count */
  totalIssues: number;
  /** Gate failure reason */
  failureReason?: string;
  /** Compliance report path */
  reportPath?: string;
  /** Gate execution time */
  executionTime: number;
}

/**
 * Brand Compliance CI/CD Gate
 * 
 * Automated compliance checking for CI/CD pipelines:
 * - Validates brand compliance before deployment
 * - Generates compliance reports
 * - Sends notifications on failures
 * - Integrates with GitHub Actions, GitLab CI, etc.
 */
export class BrandComplianceGate {
  private config: ComplianceGateConfig;
  private projectRoot: string;

  constructor(config: Partial<ComplianceGateConfig> = {}) {
    this.projectRoot = process.cwd();
    
    this.config = {
      enabled: true,
      failOnCritical: true,
      failOnHighPriority: false,
      minComplianceScore: 80,
      enableReporting: true,
      reportDir: join(this.projectRoot, 'reports', 'compliance'),
      enableSlackNotifications: false,
      enableEmailNotifications: false,
      ...config
    };

    this.validateConfiguration();
  }

  /**
   * Run compliance gate
   */
  async runComplianceGate(): Promise<ComplianceGateResult> {
    const startTime = Date.now();
    
    console.log('🚀 Starting Brand Compliance Gate...');
    
    if (!this.config.enabled) {
      console.log('⚠️ Compliance gate is disabled');
      return {
        passed: true,
        score: 100,
        criticalIssues: 0,
        highPriorityIssues: 0,
        totalIssues: 0,
        executionTime: Date.now() - startTime
      };
    }

    try {
      // Step 1: Load brand configurations
      const brandConfigs = await this.loadBrandConfigurations();
      
      if (brandConfigs.length === 0) {
        console.log('⚠️ No brand configurations found');
        return {
          passed: true,
          score: 100,
          criticalIssues: 0,
          highPriorityIssues: 0,
          totalIssues: 0,
          executionTime: Date.now() - startTime
        };
      }

      // Step 2: Run compliance checks
      const complianceResults = await this.runComplianceChecks(brandConfigs);
      
      // Step 3: Analyze results
      const gateResult = this.analyzeComplianceResults(complianceResults);
      
      // Step 4: Generate report
      if (this.config.enableReporting) {
        gateResult.reportPath = await this.generateComplianceReport(complianceResults, gateResult);
      }
      
      // Step 5: Send notifications if needed
      if (!gateResult.passed) {
        await this.sendFailureNotifications(gateResult, complianceResults);
      }
      
      // Step 6: Output results
      this.outputGateResults(gateResult);
      
      gateResult.executionTime = Date.now() - startTime;
      
      return gateResult;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Compliance gate failed:', errorMessage);
      
      const gateResult: ComplianceGateResult = {
        passed: false,
        score: 0,
        criticalIssues: 0,
        highPriorityIssues: 0,
        totalIssues: 0,
        failureReason: `Compliance gate execution failed: ${errorMessage}`,
        executionTime: Date.now() - startTime
      };
      
      await this.sendFailureNotifications(gateResult, []);
      
      return gateResult;
    }
  }

  /**
   * Run compliance gate and exit with appropriate code
   */
  async runAndExit(): Promise<void> {
    const result = await this.runComplianceGate();
    
    if (!result.passed) {
      console.error('❌ Compliance gate failed');
      process.exit(1);
    } else {
      console.log('✅ Compliance gate passed');
      process.exit(0);
    }
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Validate configuration
   */
  private validateConfiguration(): void {
    if (this.config.minComplianceScore < 0 || this.config.minComplianceScore > 100) {
      throw new Error('Minimum compliance score must be between 0 and 100');
    }
    
    if (this.config.enableSlackNotifications && !this.config.slackWebhookUrl) {
      throw new Error('Slack webhook URL is required when Slack notifications are enabled');
    }
    
    if (this.config.enableEmailNotifications && (!this.config.emailRecipients || this.config.emailRecipients.length === 0)) {
      throw new Error('Email recipients are required when email notifications are enabled');
    }
  }

  /**
   * Load brand configurations
   */
  private async loadBrandConfigurations(): Promise<any[]> {
    console.log('📋 Loading brand configurations...');
    
    const configPaths = [
      join(this.projectRoot, 'config', 'brand-configs.json'),
      join(this.projectRoot, 'brand-configs.json'),
      join(this.projectRoot, 'config', 'branding', 'configs.json')
    ];
    
    for (const configPath of configPaths) {
      if (existsSync(configPath)) {
        try {
          const configData = JSON.parse(readFileSync(configPath, 'utf8'));
          const configs = Array.isArray(configData) ? configData : [configData];
          console.log(`✅ Loaded ${configs.length} brand configuration(s) from ${configPath}`);
          return configs;
        } catch (error) {
          console.warn(`⚠️ Failed to load brand configuration from ${configPath}:`, error);
        }
      }
    }
    
    // Fallback: create a default configuration for testing
    console.log('⚠️ No brand configuration files found, using default configuration');
    return [{
      tenantId: 'default',
      brand: {
        id: 'default',
        name: 'Default Brand',
        description: 'Default brand configuration',
        isCustom: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      theme: {
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
          accent: '#F59E0B'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: '400'
        },
        logo: {
          src: '/logo.svg',
          alt: 'Default Logo',
          width: 40,
          height: 40,
          initials: 'DB',
          fallbackBgColor: 'from-blue-600 to-indigo-600'
        }
      },
      isActive: true,
      validationStatus: 'pending'
    }];
  }

  /**
   * Run compliance checks for all configurations
   */
  private async runComplianceChecks(configs: any[]): Promise<any[]> {
    console.log(`🔍 Running compliance checks for ${configs.length} configuration(s)...`);
    
    const results = [];
    
    for (const config of configs) {
      try {
        // Import compliance engine dynamically
        const { BrandComplianceUtils } = await import('../lib/branding/brand-compliance-engine');
        
        const result = await BrandComplianceUtils.checkCompliance(config, {
          strictness: 'standard'
        });
        
        results.push({
          config,
          result
        });
        
        console.log(`✅ Compliance check completed for ${config.brand?.name || config.tenantId} (Score: ${result.overallScore}/100)`);
        
      } catch (error) {
        console.error(`❌ Compliance check failed for ${config.brand?.name || config.tenantId}:`, error);
        
        results.push({
          config,
          result: {
            compliant: false,
            overallScore: 0,
            criticalIssues: [],
            highPriorityIssues: [],
            mediumPriorityIssues: [],
            lowPriorityIssues: [],
            ruleResults: [],
            categorySummary: {},
            wcagCompliance: { levelA: false, levelAA: false, levelAAA: false },
            industryCompliance: {},
            brandGuidelineCompliance: {},
            timestamp: new Date(),
            duration: 0
          },
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  }

  /**
   * Analyze compliance results
   */
  private analyzeComplianceResults(results: any[]): ComplianceGateResult {
    console.log('📊 Analyzing compliance results...');
    
    let totalScore = 0;
    let totalCriticalIssues = 0;
    let totalHighPriorityIssues = 0;
    let totalIssues = 0;
    let passedConfigs = 0;
    
    results.forEach(({ result }) => {
      totalScore += result.overallScore;
      totalCriticalIssues += result.criticalIssues.length;
      totalHighPriorityIssues += result.highPriorityIssues.length;
      totalIssues += result.criticalIssues.length + result.highPriorityIssues.length + 
                    result.mediumPriorityIssues.length + result.lowPriorityIssues.length;
      
      if (result.compliant) {
        passedConfigs++;
      }
    });
    
    const averageScore = results.length > 0 ? Math.round(totalScore / results.length) : 0;
    
    // Determine if gate passes
    let passed = true;
    let failureReason: string | undefined;
    
    if (this.config.failOnCritical && totalCriticalIssues > 0) {
      passed = false;
      failureReason = `${totalCriticalIssues} critical compliance issue(s) detected`;
    } else if (this.config.failOnHighPriority && totalHighPriorityIssues > 0) {
      passed = false;
      failureReason = `${totalHighPriorityIssues} high priority compliance issue(s) detected`;
    } else if (averageScore < this.config.minComplianceScore) {
      passed = false;
      failureReason = `Average compliance score ${averageScore} is below minimum ${this.config.minComplianceScore}`;
    }
    
    return {
      passed,
      score: averageScore,
      criticalIssues: totalCriticalIssues,
      highPriorityIssues: totalHighPriorityIssues,
      totalIssues,
      failureReason,
      executionTime: 0 // Will be set by caller
    };
  }

  /**
   * Generate compliance report
   */
  private async generateComplianceReport(results: any[], gateResult: ComplianceGateResult): Promise<string> {
    console.log('📄 Generating compliance report...');
    
    const reportDir = this.config.reportDir;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = join(reportDir, `compliance-gate-report-${timestamp}.json`);
    
    // Ensure report directory exists
    try {
      execSync(`mkdir -p "${reportDir}"`, { stdio: 'pipe' });
    } catch (error) {
      console.warn('⚠️ Failed to create report directory:', error);
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      gateResult,
      summary: {
        totalConfigurations: results.length,
        passedConfigurations: results.filter(r => r.result.compliant).length,
        averageScore: gateResult.score,
        totalIssues: gateResult.totalIssues,
        criticalIssues: gateResult.criticalIssues,
        highPriorityIssues: gateResult.highPriorityIssues
      },
      configurations: results.map(({ config, result, error }) => ({
        tenantId: config.tenantId,
        brandName: config.brand?.name,
        compliant: result.compliant,
        score: result.overallScore,
        criticalIssues: result.criticalIssues.length,
        highPriorityIssues: result.highPriorityIssues.length,
        wcagCompliance: result.wcagCompliance,
        error: error
      })),
      detailedResults: results
    };
    
    try {
      const fs = await import('fs');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`✅ Compliance report generated: ${reportPath}`);
      return reportPath;
    } catch (error) {
      console.error('❌ Failed to generate compliance report:', error);
      throw error;
    }
  }

  /**
   * Send failure notifications
   */
  private async sendFailureNotifications(gateResult: ComplianceGateResult, results: any[]): Promise<void> {
    console.log('📧 Sending failure notifications...');
    
    const notifications = [];
    
    if (this.config.enableSlackNotifications) {
      notifications.push(this.sendSlackNotification(gateResult, results));
    }
    
    if (this.config.enableEmailNotifications) {
      notifications.push(this.sendEmailNotification(gateResult, results));
    }
    
    try {
      await Promise.all(notifications);
      console.log('✅ Failure notifications sent');
    } catch (error) {
      console.error('❌ Failed to send notifications:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(gateResult: ComplianceGateResult, results: any[]): Promise<void> {
    if (!this.config.slackWebhookUrl) return;
    
    const message = {
      text: '🚨 Brand Compliance Gate Failed',
      attachments: [{
        color: 'danger',
        fields: [
          {
            title: 'Compliance Score',
            value: `${gateResult.score}/100`,
            short: true
          },
          {
            title: 'Critical Issues',
            value: gateResult.criticalIssues.toString(),
            short: true
          },
          {
            title: 'High Priority Issues',
            value: gateResult.highPriorityIssues.toString(),
            short: true
          },
          {
            title: 'Failure Reason',
            value: gateResult.failureReason || 'Unknown',
            short: false
          }
        ],
        footer: 'Brand Compliance Gate',
        ts: Math.floor(Date.now() / 1000)
      }]
    };
    
    try {
      const response = await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Failed to send Slack notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(gateResult: ComplianceGateResult, results: any[]): Promise<void> {
    if (!this.config.emailRecipients || this.config.emailRecipients.length === 0) return;
    
    // In a real implementation, this would use an email service like SendGrid, SES, etc.
    console.log('📧 Email notification would be sent to:', this.config.emailRecipients.join(', '));
    console.log('📧 Subject: Brand Compliance Gate Failed');
    console.log('📧 Body:', `Compliance score: ${gateResult.score}/100\nCritical issues: ${gateResult.criticalIssues}\nHigh priority issues: ${gateResult.highPriorityIssues}\nFailure reason: ${gateResult.failureReason}`);
  }

  /**
   * Output gate results
   */
  private outputGateResults(gateResult: ComplianceGateResult): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 BRAND COMPLIANCE GATE RESULTS');
    console.log('='.repeat(60));
    
    console.log(`Status: ${gateResult.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Compliance Score: ${gateResult.score}/100`);
    console.log(`Critical Issues: ${gateResult.criticalIssues}`);
    console.log(`High Priority Issues: ${gateResult.highPriorityIssues}`);
    console.log(`Total Issues: ${gateResult.totalIssues}`);
    console.log(`Execution Time: ${gateResult.executionTime}ms`);
    
    if (gateResult.failureReason) {
      console.log(`Failure Reason: ${gateResult.failureReason}`);
    }
    
    if (gateResult.reportPath) {
      console.log(`Report: ${gateResult.reportPath}`);
    }
    
    console.log('='.repeat(60));
  }
}

/**
 * CLI interface for compliance gate
 */
async function main() {
  const args = process.argv.slice(2);
  const config: Partial<ComplianceGateConfig> = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--enabled':
        config.enabled = args[i + 1] === 'true';
        i++;
        break;
      case '--fail-on-critical':
        config.failOnCritical = args[i + 1] === 'true';
        i++;
        break;
      case '--fail-on-high-priority':
        config.failOnHighPriority = args[i + 1] === 'true';
        i++;
        break;
      case '--min-score':
        config.minComplianceScore = parseInt(args[i + 1]);
        i++;
        break;
      case '--report-dir':
        config.reportDir = args[i + 1];
        i++;
        break;
      case '--slack-webhook':
        config.slackWebhookUrl = args[i + 1];
        config.enableSlackNotifications = true;
        i++;
        break;
      case '--email-recipients':
        config.emailRecipients = args[i + 1].split(',');
        config.enableEmailNotifications = true;
        i++;
        break;
      case '--help':
        console.log(`
Brand Compliance Gate - CI/CD Integration

Usage: node brand-compliance-gate.js [options]

Options:
  --enabled <true|false>           Enable/disable compliance gate
  --fail-on-critical <true|false> Fail build on critical issues
  --fail-on-high-priority <true|false> Fail build on high priority issues
  --min-score <number>            Minimum compliance score required (0-100)
  --report-dir <path>             Report output directory
  --slack-webhook <url>           Slack webhook URL for notifications
  --email-recipients <emails>     Comma-separated email recipients
  --help                          Show this help message

Examples:
  node brand-compliance-gate.js --enabled true --min-score 80
  node brand-compliance-gate.js --fail-on-critical true --slack-webhook https://hooks.slack.com/...
        `);
        process.exit(0);
        break;
    }
  }
  
  const gate = new BrandComplianceGate(config);
  await gate.runAndExit();
}

// Run CLI if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ Compliance gate failed:', error);
    process.exit(1);
  });
}

export { ComplianceGateConfig, ComplianceGateResult };
