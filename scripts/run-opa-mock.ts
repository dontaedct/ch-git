#!/usr/bin/env tsx

/**
 * Mock OPA Policy Runner for Windows/Development
 * 
 * This script provides a mock implementation of the OPA runner for testing
 * and development purposes when OPA is not available.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { IOPARunner } from './run-opa';

interface PolicyDecision {
  allow: boolean;
  reasons: string[];
  suggestedFixes: string[];
  riskScore: number;
  policyResults: {
    [policyName: string]: {
      allow: boolean;
      deny: string[];
      riskScore: number;
    };
  };
}

interface OPAInput {
  changes?: any[];
  changed_files?: any[];
  pr?: {
    labels?: string[];
  };
  branch?: string;
  author?: string;
  codeowners?: any[];
  required_reviewers?: any[];
  authorized_users?: string[];
  emergency_mode?: boolean;
  dependency_changes?: any[];
}

class MockOPARunner implements IOPARunner {
  private policiesDir: string;
  public opaInstalled: boolean = true; // Mock always has OPA available

  constructor() {
    this.policiesDir = join(process.cwd(), 'policies');
  }

  /**
   * Mock method to ensure OPA is available
   */
  async ensureOPAAvailable(): Promise<void> {
    // Mock always succeeds
    this.opaInstalled = true;
  }

  /**
   * Mock method to install OPA
   */
  async installOPA(): Promise<void> {
    // Mock always succeeds
    this.opaInstalled = true;
  }

  /**
   * Mock method to create fallback decision
   */
  createFallbackDecision(reason: string): PolicyDecision {
    return {
      allow: false,
      reasons: [`Mock fallback: ${reason}`],
      suggestedFixes: ['Use real OPA runner for production'],
      riskScore: 100,
      policyResults: {}
    };
  }

  /**
   * Mock method to evaluate a single policy
   */
  async evaluatePolicy(policyName: string, input: OPAInput): Promise<any> {
    // Mock implementation that returns a basic result
    return {
      allow: true,
      deny: [],
      riskScore: 0
    };
  }

  /**
   * Main entry point - evaluate policies using mock implementation
   */
  async evaluatePolicies(input: OPAInput): Promise<PolicyDecision> {
    try {
      // Evaluate all policies using mock logic
      const results = await this.evaluateAllPolicies(input);
      
      // Aggregate results into unified decision
      return this.aggregateResults(results);
    } catch (error) {
      console.error('Error evaluating policies:', error);
      return this.createErrorDecision(`Policy evaluation failed: ${error}`);
    }
  }

  /**
   * Evaluate all policies using mock logic
   */
  private async evaluateAllPolicies(input: OPAInput): Promise<any> {
    const results: any = {};

    // Mock evaluation of db_contract policy
    results.db_contract = this.evaluateDBContract(input);
    
    // Mock evaluation of feature_flags policy
    results.feature_flags = this.evaluateFeatureFlags(input);
    
    // Mock evaluation of owners policy
    results.owners = this.evaluateOwners(input);
    
    // Mock evaluation of risk_score policy
    results.risk_score = this.evaluateRiskScore(input);

    return results;
  }

  /**
   * Mock evaluation of database contract policy
   */
  private evaluateDBContract(input: OPAInput): any {
    const denies: string[] = [];
    let riskScore = 0;

    // Check for dangerous operations
    if (input.changes) {
      for (const change of input.changes) {
        if (change.operation === 'DROP' || change.operation === 'RENAME') {
          // Check if properly marked
          const hasLabel = input.pr?.labels?.includes('expand-contract') || false;
          const hasBranch = input.branch?.includes('expand-contract/') || false;
          const hasMarkers = change.sql_content?.includes('#expand') && change.sql_content?.includes('#contract');
          
          if (!hasLabel && !hasBranch && !hasMarkers) {
            denies.push(`DANGEROUS_SCHEMA_CHANGE: ${change.operation} detected without proper expand-contract marking`);
            riskScore = 4;
          }
        }
      }
    }

    return {
      allow: denies.length === 0,
      deny: denies,
      riskScore
    };
  }

  /**
   * Mock evaluation of feature flags policy
   */
  private evaluateFeatureFlags(input: OPAInput): any {
    const denies: string[] = [];
    let riskScore = 0;

    if (input.changed_files) {
      for (const file of input.changed_files) {
        if (file.status === 'added' || file.status === 'modified') {
          if (file.path?.startsWith('app/') && (file.path.endsWith('.tsx') || file.path.endsWith('.ts'))) {
            // Check for feature flag wrappers
            const hasFeatureGate = file.content?.includes('FeatureGate');
            const hasIsEnabled = file.content?.includes('isEnabled(');
            const hasUseFeatureFlag = file.content?.includes('useFeatureFlag');
            
            if (!hasFeatureGate && !hasIsEnabled && !hasUseFeatureFlag) {
              denies.push(`MISSING_FEATURE_FLAG: Route ${file.path} lacks feature flag wrapper`);
              riskScore = 1;
            }
          }
        }
      }
    }

    return {
      allow: denies.length === 0,
      deny: denies,
      riskScore
    };
  }

  /**
   * Mock evaluation of owners policy
   */
  private evaluateOwners(input: OPAInput): any {
    const denies: string[] = [];
    let riskScore = 0;

    if (input.changed_files) {
      for (const file of input.changed_files) {
        const path = file.path || '';
        if (this.isSensitivePath(path)) {
          // Check ownership coverage
          const hasCodeowners = this.hasCodeownersCoverage(path, input.codeowners || []);
          const hasReviewers = this.hasRequiredReviewers(input.required_reviewers || []);
          const isAuthorized = input.authorized_users?.includes(input.author || '') || false;
          const isEmergency = input.emergency_mode || false;
          
          if (!hasCodeowners && !hasReviewers && !isAuthorized && !isEmergency) {
            denies.push(`MISSING_OWNERSHIP: Sensitive path ${path} changed without proper CODEOWNERS coverage`);
            riskScore = 3;
          }
        }
      }
    }

    return {
      allow: denies.length === 0,
      deny: denies,
      riskScore
    };
  }

  /**
   * Mock evaluation of risk score policy
   */
  private evaluateRiskScore(input: OPAInput): any {
    let totalRiskScore = 0;

    // Schema contraction risk (+4)
    if (input.changes) {
      for (const change of input.changes) {
        if (change.operation === 'DROP' || change.operation === 'RENAME') {
          totalRiskScore += 4;
        }
      }
    }

    // Environment change risk (+3)
    if (input.changed_files) {
      for (const file of input.changed_files) {
        if (this.isEnvFile(file.path)) {
          totalRiskScore += 3;
        }
      }
    }

    // Major dependency bump risk (+3)
    if (input.dependency_changes) {
      for (const dep of input.dependency_changes) {
        if (dep.change_type === 'major') {
          totalRiskScore += 3;
        }
      }
    }

    // Cross-module change risk (+2)
    if (input.changed_files) {
      for (const file of input.changed_files) {
        if (this.isCrossModuleChange(file.path)) {
          totalRiskScore += 2;
        }
      }
    }

    // New route risk (+1)
    if (input.changed_files) {
      for (const file of input.changed_files) {
        if (file.status === 'added' && file.path?.startsWith('app/') && file.path.endsWith('.tsx')) {
          totalRiskScore += 1;
        }
      }
    }

    return {
      allow: true, // Risk score policy doesn't block, just scores
      deny: [],
      riskScore: totalRiskScore
    };
  }

  /**
   * Check if path is sensitive
   */
  private isSensitivePath(path: string): boolean {
    return path.startsWith('db/migrations/') ||
           path.startsWith('app/(core)/') ||
           path.startsWith('lib/supabase/') ||
           path.startsWith('scripts/');
  }

  /**
   * Check if path has CODEOWNERS coverage
   */
  private hasCodeownersCoverage(path: string, codeowners: any[]): boolean {
    return codeowners.some(owner => {
      const pattern = owner.path?.replace('**', '.*') || '';
      return new RegExp(pattern).test(path);
    });
  }

  /**
   * Check if required reviewers are approved
   */
  private hasRequiredReviewers(reviewers: any[]): boolean {
    return reviewers.some(reviewer => reviewer.approved);
  }

  /**
   * Check if file is environment-related
   */
  private isEnvFile(path: string): boolean {
    return path === '.env' || path === '.env.local' || path === '.env.production' || path === 'lib/env.ts';
  }

  /**
   * Check if change affects multiple modules
   */
  private isCrossModuleChange(path: string): boolean {
    return path.startsWith('lib/') && !path.startsWith('lib/supabase/');
  }

  /**
   * Aggregate individual policy results into unified decision
   */
  private aggregateResults(results: any): PolicyDecision {
    let allow = true;
    const reasons: string[] = [];
    const suggestedFixes: string[] = [];
    let totalRiskScore = 0;

    // Process each policy result
    for (const [policyName, result] of Object.entries(results)) {
      const policyResult = result as any;
      
      if (!policyResult.allow) {
        allow = false;
        reasons.push(...policyResult.deny);
      }

      totalRiskScore += policyResult.riskScore || 0;
    }

    // Add risk-based suggestions
    if (totalRiskScore >= 7) {
      suggestedFixes.push('Consider staging deployment and rollback plan');
    }
    if (totalRiskScore >= 10) {
      suggestedFixes.push('Require senior developer review');
      suggestedFixes.push('Deploy during maintenance window');
    }

    return {
      allow,
      reasons,
      suggestedFixes,
      riskScore: totalRiskScore,
      policyResults: results
    };
  }

  /**
   * Create error decision
   */
  private createErrorDecision(reason: string): PolicyDecision {
    return {
      allow: false,
      reasons: [reason],
      suggestedFixes: [
        'Check policy configuration',
        'Verify input format',
        'Review error logs'
      ],
      riskScore: 0,
      policyResults: {}
    };
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Read input from stdin or file
    let input: OPAInput;
    
    if (process.argv.includes('--file')) {
      const fileIndex = process.argv.indexOf('--file');
      const filePath = process.argv[fileIndex + 1];
      const fileContent = readFileSync(filePath, 'utf8');
      input = JSON.parse(fileContent);
    } else {
      // Read from stdin
      const stdinContent = readFileSync(0, 'utf8');
      input = JSON.parse(stdinContent);
    }

    // Create runner and evaluate policies
    const runner = new MockOPARunner();
    const decision = await runner.evaluatePolicies(input);

    // Output decision as JSON
    console.log(JSON.stringify(decision, null, 2));
    
    // Exit with appropriate code
    process.exit(decision.allow ? 0 : 1);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { MockOPARunner };
export type { PolicyDecision, OPAInput };
