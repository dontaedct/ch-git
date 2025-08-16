#!/usr/bin/env tsx

/**
 * Sentinel Database Enforcer
 * 
 * Enforces safe database changes by integrating with the Sentinel system
 * and requiring expand/contract workflow compliance.
 */

import { ImpactAnalyzer } from './sentinel/impact.js';
import { DatabaseMigrationAnalyzer } from './sentinel/db-migration.js';
import { OutputFormatter } from './sentinel/io.js';
import { MigrationAnalysis } from './sentinel/db-migration.js';

interface SentinelDBDecision {
  decision: 'ALLOW' | 'BLOCK';
  reasons: string[];
  migrationAnalysis?: MigrationAnalysis;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

class SentinelDBEnforcer {
  private impactAnalyzer: ImpactAnalyzer;
  private migrationAnalyzer: DatabaseMigrationAnalyzer;
  private outputFormatter: OutputFormatter;
  
  constructor() {
    this.impactAnalyzer = new ImpactAnalyzer();
    this.migrationAnalyzer = new DatabaseMigrationAnalyzer();
    this.outputFormatter = new OutputFormatter();
  }
  
  /**
   * Main enforcement method
   */
  async enforce(changedFiles: string[]): Promise<SentinelDBDecision> {
    console.log('🛡️ Sentinel DB Enforcer Starting...');
    console.log(`📁 Analyzing ${changedFiles.length} changed files...`);
    
    try {
      // Build impact map with migration analysis
      const impactMap = await this.impactAnalyzer.buildImpactMap(changedFiles);
      
      // Check if we have migrations
      if (!impactMap.hasMigration) {
        console.log('✅ No database migrations detected - allowing changes');
        return {
          decision: 'ALLOW',
          reasons: ['No database migrations detected'],
          recommendations: [],
          riskLevel: 'low'
        };
      }
      
      console.log('🚨 Database migrations detected - performing safety analysis...');
      
      // Get migration analysis
      const migrationAnalysis = impactMap.migrationAnalysis;
      if (!migrationAnalysis) {
        console.log('⚠️  Migration analysis not available - blocking for safety');
        return {
          decision: 'BLOCK',
          reasons: ['Migration analysis not available'],
          recommendations: ['Re-run Sentinel analysis with migration support'],
          riskLevel: 'high'
        };
      }
      
      // Generate safety report
      const safetyReport = this.migrationAnalyzer.generateSafetyReport(migrationAnalysis);
      console.log('\n' + safetyReport);
      
      // Determine if migration should be blocked
      const shouldBlock = this.migrationAnalyzer.shouldBlockMigration(migrationAnalysis);
      
      if (shouldBlock) {
        console.log('❌ UNSAFE MIGRATION DETECTED - BLOCKING CHANGES');
        
        return {
          decision: 'BLOCK',
          reasons: [
            'Unsafe database operations detected',
            `Phase: ${migrationAnalysis.phase}`,
            `Risk Level: ${migrationAnalysis.riskLevel}`,
            ...migrationAnalysis.unsafeOperations
          ],
          migrationAnalysis,
          recommendations: migrationAnalysis.recommendations,
          riskLevel: migrationAnalysis.riskLevel
        };
      } else {
        console.log('✅ MIGRATION SAFETY CHECK PASSED - ALLOWING CHANGES');
        
        return {
          decision: 'ALLOW',
          reasons: [
            'Database migrations are safe',
            `Phase: ${migrationAnalysis.phase}`,
            `Risk Level: ${migrationAnalysis.riskLevel}`
          ],
          migrationAnalysis,
          recommendations: migrationAnalysis.recommendations,
          riskLevel: migrationAnalysis.riskLevel
        };
      }
      
    } catch (error) {
      console.error('❌ Error during Sentinel DB enforcement:', error);
      
      return {
        decision: 'BLOCK',
        reasons: ['Error during analysis - blocking for safety'],
        recommendations: ['Check Sentinel system logs and re-run analysis'],
        riskLevel: 'high'
      };
    }
  }
  
  /**
   * Print decision in human-readable format
   */
  printDecision(decision: SentinelDBDecision): void {
    console.log('\n' + '='.repeat(60));
    console.log(`🛡️ SENTINEL DB ENFORCER DECISION: ${decision.decision}`);
    console.log('='.repeat(60));
    
    console.log(`📊 Risk Level: ${decision.riskLevel.toUpperCase()}`);
    
    if (decision.reasons.length > 0) {
      console.log('\n📝 Decision Reasons:');
      decision.reasons.forEach((reason, index) => {
        console.log(`  ${index + 1}. ${reason}`);
      });
    }
    
    if (decision.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      decision.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    if (decision.migrationAnalysis) {
      console.log('\n🔍 Migration Analysis:');
      console.log(`  Phase: ${decision.migrationAnalysis.phase}`);
      console.log(`  Safe: ${decision.migrationAnalysis.isSafe ? 'Yes' : 'No'}`);
      console.log(`  Plan ID: ${decision.migrationAnalysis.planId || 'None'}`);
      
      if (decision.migrationAnalysis.unsafeOperations.length > 0) {
        console.log(`  Unsafe Operations: ${decision.migrationAnalysis.unsafeOperations.length}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    switch (decision.decision) {
      case 'ALLOW':
        console.log('✅ CHANGES ALLOWED - Database migrations are safe');
        break;
      case 'BLOCK':
        console.log('❌ CHANGES BLOCKED - Review required before proceeding');
        break;
    }
    console.log('='.repeat(60));
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: tsx scripts/sentinel-db-enforcer.ts <file1> <file2> ...');
    console.log('Example: tsx scripts/sentinel-db-enforcer.ts supabase/migrations/001_test.sql');
    process.exit(1);
  }
  
  const enforcer = new SentinelDBEnforcer();
  const decision = await enforcer.enforce(args);
  
  enforcer.printDecision(decision);
  
  // Exit with appropriate code
  if (decision.decision === 'BLOCK') {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { SentinelDBEnforcer, SentinelDBDecision };
