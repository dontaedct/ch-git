#!/usr/bin/env node

/**
 * 🗂️ SENTINEL CHANGE JOURNAL GENERATOR
 * 
 * Generates comprehensive evidence logs for every Sentinel gate decision:
 * - JSON: Machine-readable decision data with all evidence
 * - Markdown: Human-readable summary for PR comments and audits
 * 
 * Usage:
 * - From CI: node scripts/sentinel-report.ts --from-env
 * - Direct: node scripts/sentinel-report.ts --decision <json> --output <path>
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

interface SentinelDecision {
  decision: 'ALLOW' | 'FIX-APPLIED' | 'BLOCK';
  reasons: string[];
  riskScore: number;
  mode: 'check' | 'fix';
  impactMap?: {
    changedFiles: string[];
    riskLevel: string;
    domains: string[];
  };
  timestamp: string;
  duration?: number;
  suggestedFixes?: string[];
}

interface ChangeJournalEntry {
  // Core decision data
  decision: SentinelDecision;
  
  // Context and metadata
  context: {
    prNumber?: string;
    commitSha: string;
    branch: string;
    actor: string;
    timestamp: string;
    duration: number;
  };
  
  // Evidence and artifacts
  evidence: {
    policies: string[];
    tests: {
      dbShadowReport?: string;
      previewTests?: string;
      lintResults?: string;
    };
    riskFactors: string[];
    suggestedFixes: string[];
  };
  
  // CI integration
  ci: {
    workflowRunId?: string;
    artifacts: {
      dbReport?: string;
      previewLogs?: string;
      sentinelLogs?: string;
    };
    environment: string;
  };
}

class SentinelChangeJournal {
  private journalDir: string;
  private decision: SentinelDecision;
  private context: any;
  
  constructor() {
    this.journalDir = join(process.cwd(), '.sentinel', 'journal');
    this.ensureJournalDir();
  }
  
  /**
   * Ensure the journal directory exists
   */
  private ensureJournalDir(): void {
    if (!existsSync(this.journalDir)) {
      mkdirSync(this.journalDir, { recursive: true });
    }
  }
  
  /**
   * Extract decision from environment variables (CI mode)
   */
  private extractDecisionFromEnv(): SentinelDecision | null {
    try {
      // Try to parse from SENTINEL_DECISION if available
      const decisionEnv = process.env.SENTINEL_DECISION;
      if (decisionEnv) {
        return JSON.parse(decisionEnv);
      }
      
      // Fallback: create basic decision from CI context
      const riskScore = this.getRiskScoreFromEnv();
      const decision = this.getDecisionFromEnv(riskScore);
      
      return {
        decision,
        reasons: this.getReasonsFromEnv(),
        riskScore,
        mode: 'check',
        timestamp: new Date().toISOString(),
        suggestedFixes: []
      };
    } catch (error) {
      console.warn('⚠️ Could not extract decision from env, using defaults');
      return null;
    }
  }
  
  /**
   * Get risk score from CI environment
   */
  private getRiskScoreFromEnv(): number {
    // Check various CI signals to determine risk
    const hasDbChanges = process.env.HAS_DB_MIGRATIONS === 'true';
    const hasSecurityChanges = process.env.HAS_SECURITY_CHANGES === 'true';
    const hasBreakingChanges = process.env.HAS_BREAKING_CHANGES === 'true';
    
    let riskScore = 0;
    if (hasDbChanges) riskScore += 3;
    if (hasSecurityChanges) riskScore += 4;
    if (hasBreakingChanges) riskScore += 2;
    
    return Math.min(riskScore, 10);
  }
  
  /**
   * Get decision from risk score and CI signals
   */
  private getDecisionFromEnv(riskScore: number): 'ALLOW' | 'FIX-APPLIED' | 'BLOCK' {
    if (riskScore >= 8) return 'BLOCK';
    if (riskScore >= 5) return 'FIX-APPLIED';
    return 'ALLOW';
  }
  
  /**
   * Get reasons from CI environment
   */
  private getReasonsFromEnv(): string[] {
    const reasons: string[] = [];
    
    if (process.env.HAS_DB_MIGRATIONS === 'true') {
      reasons.push('Database schema changes detected');
    }
    if (process.env.HAS_SECURITY_CHANGES === 'true') {
      reasons.push('Security-sensitive files modified');
    }
    if (process.env.HAS_BREAKING_CHANGES === 'true') {
      reasons.push('Potential breaking changes identified');
    }
    if (process.env.PREVIEW_TESTS_FAILED === 'true') {
      reasons.push('Preview deployment tests failed');
    }
    if (process.env.LINT_ERRORS === 'true') {
      reasons.push('Code quality checks failed');
    }
    
    return reasons.length > 0 ? reasons : ['Standard CI validation passed'];
  }
  
  /**
   * Get Git context information
   */
  private getGitContext(): any {
    try {
      const commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      
      // Try to get PR number from GitHub context
      let prNumber: string | undefined;
      try {
        const prRef = execSync('git rev-parse --symbolic-full-name HEAD', { encoding: 'utf8' }).trim();
        if (prRef.includes('refs/pull/')) {
          prNumber = prRef.match(/refs\/pull\/(\d+)\/head/)?.[1];
        }
      } catch (error) {
        // Not a PR, that's fine
      }
      
      return { commitSha, branch, prNumber };
    } catch (error) {
      console.warn('⚠️ Could not get Git context:', error.message);
      return { commitSha: 'unknown', branch: 'unknown' };
    }
  }
  
  /**
   * Get CI context information
   */
  private getCIContext(): any {
    return {
      workflowRunId: process.env.GITHUB_RUN_ID,
      environment: process.env.NODE_ENV || 'development',
      artifacts: {
        dbReport: process.env.DB_REPORT_URL,
        previewLogs: process.env.PREVIEW_LOGS_URL,
        sentinelLogs: process.env.SENTINEL_LOGS_URL
      }
    };
  }
  
  /**
   * Generate the change journal entry
   */
  private generateJournalEntry(): ChangeJournalEntry {
    const gitContext = this.getGitContext();
    const ciContext = this.getCIContext();
    
    return {
      decision: this.decision,
      context: {
        prNumber: gitContext.prNumber,
        commitSha: gitContext.commitSha,
        branch: gitContext.branch,
        actor: process.env.GITHUB_ACTOR || 'unknown',
        timestamp: new Date().toISOString(),
        duration: this.decision.duration || 0
      },
      evidence: {
        policies: this.getPolicies(),
        tests: {
          dbShadowReport: process.env.DB_SHADOW_REPORT,
          previewTests: process.env.PREVIEW_TEST_RESULTS,
          lintResults: process.env.LINT_RESULTS
        },
        riskFactors: this.getRiskFactors(),
        suggestedFixes: this.decision.suggestedFixes || []
      },
      ci: ciContext
    };
  }
  
  /**
   * Get applicable policies for this decision
   */
  private getPolicies(): string[] {
    const policies: string[] = [];
    
    if (this.decision.riskScore >= 5) {
      policies.push('High Risk Policy: Requires manual review');
    }
    if (this.decision.decision === 'BLOCK') {
      policies.push('Block Policy: Changes blocked due to risk assessment');
    }
    if (process.env.HAS_DB_MIGRATIONS === 'true') {
      policies.push('Database Policy: Schema changes require shadow testing');
    }
    
    return policies.length > 0 ? policies : ['Standard Policy: Low risk changes allowed'];
  }
  
  /**
   * Get risk factors contributing to the decision
   */
  private getRiskFactors(): string[] {
    const factors: string[] = [];
    
    if (this.decision.riskScore >= 8) {
      factors.push('Critical risk threshold exceeded');
    }
    if (this.decision.riskScore >= 5) {
      factors.push('Elevated risk requiring attention');
    }
    if (process.env.HAS_SECURITY_CHANGES === 'true') {
      factors.push('Security-sensitive modifications');
    }
    if (process.env.HAS_BREAKING_CHANGES === 'true') {
      factors.push('Potential breaking changes detected');
    }
    
    return factors.length > 0 ? factors : ['No significant risk factors identified'];
  }
  
  /**
   * Generate JSON journal entry
   */
  private generateJsonJournal(entry: ChangeJournalEntry): string {
    return JSON.stringify(entry, null, 2);
  }
  
  /**
   * Generate Markdown summary
   */
  private generateMarkdownSummary(entry: ChangeJournalEntry): string {
    const { decision, context, evidence, ci } = entry;
    
    let markdown = `# 🛡️ Sentinel Gate Decision & Evidence\n\n`;
    
    // Decision Summary
    markdown += `## 📋 Decision Summary\n\n`;
    markdown += `**Status:** ${this.getDecisionEmoji(decision.decision)} ${decision.decision}\n\n`;
    markdown += `**Risk Score:** ${decision.riskScore}/10\n\n`;
    markdown += `**Timestamp:** ${new Date(decision.timestamp).toLocaleString()}\n\n`;
    markdown += `**Actor:** ${context.actor}\n\n`;
    markdown += `**Branch:** \`${context.branch}\`\n\n`;
    if (context.prNumber) {
      markdown += `**PR:** #${context.prNumber}\n\n`;
    }
    
    // Reasons
    if (decision.reasons.length > 0) {
      markdown += `## 📝 Decision Reasons\n\n`;
      decision.reasons.forEach((reason, index) => {
        markdown += `${index + 1}. ${reason}\n`;
      });
      markdown += `\n`;
    }
    
    // Evidence
    markdown += `## 🔍 Evidence & Artifacts\n\n`;
    
    // Policies
    if (evidence.policies.length > 0) {
      markdown += `### 📜 Applied Policies\n\n`;
      evidence.policies.forEach(policy => {
        markdown += `- ${policy}\n`;
      });
      markdown += `\n`;
    }
    
    // Risk Factors
    if (evidence.riskFactors.length > 0) {
      markdown += `### ⚠️ Risk Factors\n\n`;
      evidence.riskFactors.forEach(factor => {
        markdown += `- ${factor}\n`;
      });
      markdown += `\n`;
    }
    
    // Test Results
    markdown += `### 🧪 Test Results\n\n`;
    if (evidence.tests.dbShadowReport) {
      markdown += `- **Database Shadow Test:** ${evidence.tests.dbShadowReport}\n`;
    }
    if (evidence.tests.previewTests) {
      markdown += `- **Preview Tests:** ${evidence.tests.previewTests}\n`;
    }
    if (evidence.tests.lintResults) {
      markdown += `- **Lint Results:** ${evidence.tests.lintResults}\n`;
    }
    markdown += `\n`;
    
    // Suggested Fixes
    if (evidence.suggestedFixes.length > 0) {
      markdown += `## 🔧 Suggested Fixes\n\n`;
      evidence.suggestedFixes.forEach((fix, index) => {
        markdown += `${index + 1}. ${fix}\n`;
      });
      markdown += `\n`;
    }
    
    // CI Information
    if (ci.workflowRunId) {
      markdown += `## 🚀 CI Information\n\n`;
      markdown += `**Workflow Run:** [${ci.workflowRunId}](https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${ci.workflowRunId})\n\n`;
      markdown += `**Environment:** ${ci.environment}\n\n`;
      
      if (ci.artifacts.dbReport || ci.artifacts.previewLogs || ci.artifacts.sentinelLogs) {
        markdown += `**Artifacts:**\n`;
        if (ci.artifacts.dbReport) {
          markdown += `- [Database Report](${ci.artifacts.dbReport})\n`;
        }
        if (ci.artifacts.previewLogs) {
          markdown += `- [Preview Logs](${ci.artifacts.previewLogs})\n`;
        }
        if (ci.artifacts.sentinelLogs) {
          markdown += `- [Sentinel Logs](${ci.artifacts.sentinelLogs})\n`;
        }
        markdown += `\n`;
      }
    }
    
    // Footer
    markdown += `---\n\n`;
    markdown += `*Generated by Sentinel Gate Change Journal at ${new Date().toISOString()}*\n`;
    
    return markdown;
  }
  
  /**
   * Get emoji for decision status
   */
  private getDecisionEmoji(decision: string): string {
    switch (decision) {
      case 'ALLOW': return '✅';
      case 'FIX-APPLIED': return '🔧';
      case 'BLOCK': return '❌';
      default: return '❓';
    }
  }
  
  /**
   * Write journal entries to files
   */
  private writeJournalEntries(entry: ChangeJournalEntry): void {
    const { commitSha } = entry.context;
    const baseName = commitSha.substring(0, 8);
    
    // Write JSON entry
    const jsonPath = join(this.journalDir, `${baseName}.json`);
    writeFileSync(jsonPath, this.generateJsonJournal(entry));
    console.log(`📄 JSON journal written to: ${jsonPath}`);
    
    // Write Markdown summary
    const mdPath = join(this.journalDir, `${baseName}.md`);
    writeFileSync(mdPath, this.generateMarkdownSummary(entry));
    console.log(`📝 Markdown summary written to: ${mdPath}`);
  }
  
  /**
   * Main execution method
   */
  async run(): Promise<void> {
    try {
      console.log('🗂️ Sentinel Change Journal Generator');
      console.log('='.repeat(50));
      
      // Get decision data
      this.decision = this.extractDecisionFromEnv();
      if (!this.decision) {
        console.error('❌ No decision data available');
        process.exit(1);
      }
      
      console.log(`📋 Processing decision: ${this.decision.decision}`);
      console.log(`⚠️ Risk Score: ${this.decision.riskScore}/10`);
      
      // Generate journal entry
      const entry = this.generateJournalEntry();
      
      // Write to files
      this.writeJournalEntries(entry);
      
      console.log('✅ Change journal generated successfully');
      
      // Output summary for CI parsing
      console.log(`\nSENTINEL_JOURNAL:${JSON.stringify({
        status: 'success',
        files: {
          json: join(this.journalDir, `${entry.context.commitSha.substring(0, 8)}.json`),
          markdown: join(this.journalDir, `${entry.context.commitSha.substring(0, 8)}.md`)
        }
      })}`);
      
    } catch (error) {
      console.error('❌ Failed to generate change journal:', error);
      process.exit(1);
    }
  }
}

// CLI execution
if (require.main === module) {
  const journal = new SentinelChangeJournal();
  journal.run().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

export { SentinelChangeJournal, ChangeJournalEntry };
