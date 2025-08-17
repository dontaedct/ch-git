#!/usr/bin/env node

/**
 * 🛡️ SENTINEL GATE CLI - THE SINGLE ENTRYPOINT FOR ALL MUTATING CHANGES
 * 
 * This script acts as the gatekeeper for all repository changes:
 * - Analyzes git diffs against the default branch
 * - Builds impact maps for changed files
 * - Calls OPA (Open Policy Agent) for decision making
 * - Applies safe auto-fixes when possible
 * - Outputs clear decisions: ALLOW / FIX-APPLIED / BLOCK
 * 
 * Modes:
 * - check: Analyze changes and output decision
 * - fix: Apply safe auto-fixes then re-check
 * 
 * Exit codes:
 * - 0: ALLOW or FIX-APPLIED
 * - 2: BLOCK
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { GitAnalyzer } from './sentinel/git';
import { ImpactAnalyzer } from './sentinel/impact';
import { OutputFormatter } from './sentinel/io';
import { FixEngine } from './sentinel/fixes';

// Sentinel Gate Configuration
const SENTINEL_CONFIG = {
  name: 'Sentinel Gate CLI',
  version: '1.0.0',
  description: 'Single entrypoint for all mutating changes',
  
  // Git Configuration
  defaultBranch: 'origin/main',
  diffCommand: 'git diff --name-only',
  
  // Output Configuration
  jsonPrefix: 'SENTINEL_JSON:',
  
  // Exit Codes
  exitCodes: {
    ALLOW: 0,
    FIX_APPLIED: 0,
    BLOCK: 2
  }
};

// Main Sentinel Gate Class
class SentinelGate {
  private gitAnalyzer: GitAnalyzer;
  private impactAnalyzer: ImpactAnalyzer;
  private outputFormatter: OutputFormatter;
  private fixEngine: FixEngine;
  
  constructor() {
    this.gitAnalyzer = new GitAnalyzer();
    this.impactAnalyzer = new ImpactAnalyzer();
    this.outputFormatter = new OutputFormatter();
    this.fixEngine = new FixEngine();
  }
  
  /**
   * Main entry point for Sentinel Gate
   */
  async run(mode: 'check' | 'fix'): Promise<void> {
    try {
      console.log(`🛡️ Sentinel Gate CLI - Mode: ${mode.toUpperCase()}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
      
      // Step 1: Analyze git changes
      const changedFiles = await this.gitAnalyzer.getChangedFiles();
      if (changedFiles.length === 0) {
        this.outputFormatter.printDecision({
          decision: 'ALLOW',
          reasons: ['No changes detected'],
          riskScore: 0,
          mode
        });
        process.exit(SENTINEL_CONFIG.exitCodes.ALLOW);
      }
      
      // Step 2: Build impact map
      const impactMap = await this.impactAnalyzer.buildImpactMap(changedFiles);
      
      // Step 3: Call OPA for decision (placeholder for now)
      const opaDecision = await this.callOpa(impactMap);
      
      // Step 4: Handle fix mode if needed
      if (mode === 'fix' && opaDecision.suggestedFixes.length > 0) {
        console.log('🔧 Applying suggested fixes...');
        const fixResults = await this.fixEngine.applyFixes(opaDecision.suggestedFixes, changedFiles);
        
        if (fixResults.success) {
          console.log('✅ Fixes applied successfully, re-checking...');
          // Re-run check mode after fixes
          await this.run('check');
          return;
        } else {
          console.log('⚠️ Some fixes failed, proceeding with current state');
        }
      }
      
      // Step 5: Output final decision
      this.outputFormatter.printDecision({
        decision: opaDecision.allow ? 'ALLOW' : 'BLOCK',
        reasons: opaDecision.reasons,
        riskScore: opaDecision.riskScore,
        mode,
        impactMap
      });
      
      // Exit with appropriate code
      const exitCode = opaDecision.allow 
        ? SENTINEL_CONFIG.exitCodes.ALLOW 
        : SENTINEL_CONFIG.exitCodes.BLOCK;
      process.exit(exitCode);
      
    } catch (error) {
      console.error('❌ Sentinel Gate error:', error);
      this.outputFormatter.printDecision({
        decision: 'BLOCK',
        reasons: [`Error during analysis: ${error.message}`],
        riskScore: 10,
        mode
      });
      process.exit(SENTINEL_CONFIG.exitCodes.BLOCK);
    }
  }
  
  /**
   * Call OPA (Open Policy Agent) for decision making
   * This is a placeholder that will be implemented in Prompt 2
   */
  private async callOpa(impactMap: any): Promise<{
    allow: boolean;
    reasons: string[];
    suggestedFixes: string[];
    riskScore: number;
  }> {
    // TODO: Implement actual OPA integration in Prompt 2
    // For now, return a basic decision based on impact analysis
    
    const hasHighRiskChanges = impactMap.hasMigration || impactMap.hasEnvChange;
    const hasNewRoutes = impactMap.domains.appRoutes.length > 0;
    
    if (hasHighRiskChanges) {
      return {
        allow: false,
        reasons: ['High-risk changes detected (migrations, env changes)'],
        suggestedFixes: ['add-migration-markers', 'add-codeowner-stub', 'wrap-new-route-with-feature-flag'],
        riskScore: 8
      };
    }
    
    if (hasNewRoutes) {
      return {
        allow: false,
        reasons: ['New routes detected without feature flags'],
        suggestedFixes: ['wrap-new-route-with-feature-flag', 'add-codeowner-stub'],
        riskScore: 5
      };
    }
    
    return {
      allow: true,
      reasons: ['Changes appear safe'],
      suggestedFixes: [],
      riskScore: 2
    };
  }
}

// CLI Entry Point
async function main() {
  const mode = process.argv[2] as 'check' | 'fix';
  
  if (!mode || !['check', 'fix'].includes(mode)) {
    console.error('❌ Usage: ts-node scripts/sentinel.ts <check|fix>');
    console.error('   check: Analyze changes and output decision');
    console.error('   fix: Apply safe auto-fixes then re-check');
    process.exit(1);
  }
  
  const sentinel = new SentinelGate();
  await sentinel.run(mode);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { SentinelGate };
