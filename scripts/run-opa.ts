#!/usr/bin/env tsx

/**
 * OPA Policy Runner for Sentinel Integration
 * 
 * This script evaluates Rego policies against input data and returns
 * unified decisions for the Sentinel system.
 */

import { spawn, execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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

/**
 * Shared interface for OPA runners
 */
interface IOPARunner {
  evaluatePolicies(input: OPAInput): Promise<PolicyDecision>;
}

class OPARunner implements IOPARunner {
  private policiesDir: string;
  private opaInstalled: boolean = false;

  constructor() {
    this.policiesDir = join(process.cwd(), 'policies');
  }

  /**
   * Main entry point - evaluate policies and return decision
   */
  async evaluatePolicies(input: OPAInput): Promise<PolicyDecision> {
    try {
      // Check if OPA is available
      await this.ensureOPAAvailable();
      
      if (!this.opaInstalled) {
        return this.createFallbackDecision('OPA unavailable');
      }

      // Evaluate all policies
      const results = await this.evaluateAllPolicies(input);
      
      // Aggregate results into unified decision
      return this.aggregateResults(results);
    } catch (error) {
      console.error('Error evaluating policies:', error);
      return this.createFallbackDecision(`Policy evaluation failed: ${error}`);
    }
  }

  /**
   * Ensure OPA is available, auto-install if needed
   */
  private async ensureOPAAvailable(): Promise<void> {
    try {
      // Check if OPA is already installed
      execSync('opa version', { stdio: 'ignore' });
      this.opaInstalled = true;
      return;
    } catch {
      // OPA not found, try to install
      await this.installOPA();
    }
  }

  /**
   * Auto-install OPA based on platform
   */
  private async installOPA(): Promise<void> {
    try {
      const platform = process.platform;
      
      if (platform === 'linux' || platform === 'darwin') {
        // Linux/macOS installation
        const installScript = `
          curl -L -o opa https://openpolicyagent.org/downloads/latest/opa_${platform}_amd64
          chmod +x opa
          sudo mv opa /usr/local/bin/
        `;
        
        execSync(installScript, { stdio: 'inherit' });
        this.opaInstalled = true;
        console.log('✅ OPA installed successfully');
      } else {
        // Windows or other platforms - fall back to WASM bundle
        console.log('⚠️  OPA auto-install not supported on this platform');
        this.opaInstalled = false;
      }
    } catch (error) {
      console.error('Failed to install OPA:', error);
      this.opaInstalled = false;
    }
  }

  /**
   * Evaluate all policies against input
   */
  private async evaluateAllPolicies(input: OPAInput): Promise<any> {
    const policies = [
      'db_contract',
      'feature_flags', 
      'owners',
      'risk_score'
    ];

    const results: any = {};

    for (const policy of policies) {
      try {
        const result = await this.evaluatePolicy(policy, input);
        results[policy] = result;
      } catch (error) {
        console.error(`Error evaluating policy ${policy}:`, error);
        results[policy] = {
          allow: false,
          deny: [`Policy evaluation failed: ${error}`],
          riskScore: 0
        };
      }
    }

    return results;
  }

  /**
   * Evaluate a single policy using OPA
   */
  private async evaluatePolicy(policyName: string, input: OPAInput): Promise<any> {
    return new Promise((resolve, reject) => {
      const policyFile = join(this.policiesDir, `${policyName}.rego`);
      
      if (!existsSync(policyFile)) {
        reject(new Error(`Policy file not found: ${policyFile}`));
        return;
      }

      const opaProcess = spawn('opa', [
        'eval',
        '--data', policyFile,
        '--input', '-',
        '--format', 'json',
        'data.allow',
        'data.deny',
        'data.risk_score'
      ]);

      let stdout = '';
      let stderr = '';

      opaProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      opaProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      opaProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`OPA evaluation failed: ${stderr}`));
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve({
            allow: result.result?.[0]?.expressions?.[0]?.value || true,
            deny: result.result?.[1]?.expressions?.[0]?.value || [],
            riskScore: result.result?.[2]?.expressions?.[0]?.value || 0
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse OPA output: ${parseError}`));
        }
      });

      // Send input to OPA
      opaProcess.stdin.write(JSON.stringify(input));
      opaProcess.stdin.end();
    });
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
   * Create fallback decision when OPA is unavailable
   */
  private createFallbackDecision(reason: string): PolicyDecision {
    return {
      allow: false,
      reasons: [reason],
      suggestedFixes: [
        'Install OPA manually: https://openpolicyagent.org/docs/latest/#running-opa',
        'Use WASM bundle as fallback',
        'Contact system administrator'
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
    const runner = new OPARunner();
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

export { OPARunner };
export type { IOPARunner, PolicyDecision, OPAInput };
