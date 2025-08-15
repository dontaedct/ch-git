/**
 * Output Formatting Utilities for Sentinel Gate
 * 
 * Handles both human-readable output and machine-readable JSON output
 */

import { ImpactMap } from './impact';

export interface SentinelDecision {
  decision: 'ALLOW' | 'FIX-APPLIED' | 'BLOCK';
  reasons: string[];
  riskScore: number;
  mode: 'check' | 'fix';
  impactMap?: ImpactMap;
  timestamp: string;
  duration?: number;
}

export class OutputFormatter {
  private jsonPrefix: string;
  
  constructor(jsonPrefix: string = 'SENTINEL_JSON:') {
    this.jsonPrefix = jsonPrefix;
  }
  
  /**
   * Print the final decision in both human and machine-readable formats
   */
  printDecision(decision: Omit<SentinelDecision, 'timestamp'>): void {
    const fullDecision: SentinelDecision = {
      ...decision,
      timestamp: new Date().toISOString()
    };
    
    // Print human-readable summary
    this.printHumanSummary(fullDecision);
    
    // Print machine-readable JSON
    this.printJsonOutput(fullDecision);
  }
  
  /**
   * Print human-readable summary for logs
   */
  private printHumanSummary(decision: SentinelDecision): void {
    console.log('\n' + '='.repeat(60));
    console.log(`🛡️ SENTINEL GATE DECISION: ${decision.decision}`);
    console.log('='.repeat(60));
    
    // Decision details
    console.log(`📋 Mode: ${decision.mode.toUpperCase()}`);
    console.log(`⏰ Timestamp: ${decision.timestamp}`);
    console.log(`⚠️ Risk Score: ${decision.riskScore}/10`);
    
    // Reasons
    if (decision.reasons.length > 0) {
      console.log('\n📝 Decision Reasons:');
      decision.reasons.forEach((reason, index) => {
        console.log(`  ${index + 1}. ${reason}`);
      });
    }
    
    // Impact analysis if available
    if (decision.impactMap) {
      this.printImpactSummary(decision.impactMap);
    }
    
    // Final status
    console.log('\n' + '='.repeat(60));
    switch (decision.decision) {
      case 'ALLOW':
        console.log('✅ CHANGES ALLOWED - Proceed with deployment');
        break;
      case 'FIX-APPLIED':
        console.log('🔧 FIXES APPLIED - Re-check completed successfully');
        break;
      case 'BLOCK':
        console.log('❌ CHANGES BLOCKED - Review required before proceeding');
        break;
    }
    console.log('='.repeat(60));
  }
  
  /**
   * Print machine-readable JSON output for CI parsing
   */
  private printJsonOutput(decision: SentinelDecision): void {
    const jsonOutput = JSON.stringify(decision, null, 2);
    console.log(`\n${this.jsonPrefix}${jsonOutput}`);
  }
  
  /**
   * Print impact analysis summary
   */
  private printImpactSummary(impactMap: ImpactMap): void {
    console.log('\n🔍 Impact Analysis:');
    console.log(`  📁 Total Changed Files: ${impactMap.changedFiles.length}`);
    console.log(`  🚨 Risk Level: ${impactMap.riskLevel.toUpperCase()}`);
    
    // Domain breakdown
    const domainSummary = this.getDomainSummary(impactMap.domains);
    if (domainSummary.length > 0) {
      console.log('\n  📊 Domain Breakdown:');
      domainSummary.forEach(({ domain, count, risk, description }) => {
        const riskIcon = this.getRiskIcon(risk);
        console.log(`    ${riskIcon} ${domain}: ${count} files - ${description}`);
      });
    }
    
    // Risk indicators
    if (impactMap.hasMigration) {
      console.log('  🗄️  Database migrations detected');
    }
    if (impactMap.hasEnvChange) {
      console.log('  ⚙️  Environment changes detected');
    }
  }
  
  /**
   * Get domain summary for display
   */
  private getDomainSummary(domains: ImpactMap['domains']): Array<{
    domain: string;
    count: number;
    risk: 'low' | 'medium' | 'high';
    description: string;
  }> {
    const summary: Array<{
      domain: string;
      count: number;
      risk: 'low' | 'medium' | 'high';
      description: string;
    }> = [];
    
    const descriptions: Record<string, string> = {
      appRoutes: 'Application Routes',
      lib: 'Libraries & Components',
      dbMigrations: 'Database Migrations',
      configs: 'Configuration Files',
      scripts: 'Build Scripts',
      deps: 'Dependencies',
      env: 'Environment Files'
    };
    
    for (const [domain, files] of Object.entries(domains)) {
      if (files.length > 0) {
        const risk = this.calculateDomainRisk(domain, files);
        summary.push({
          domain: descriptions[domain] || domain,
          count: files.length,
          risk,
          description: this.getDomainDescription(domain, files.length)
        });
      }
    }
    
    return summary.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.risk] - riskOrder[a.risk];
    });
  }
  
  /**
   * Calculate risk level for a specific domain
   */
  private calculateDomainRisk(domain: string, files: string[]): 'low' | 'medium' | 'high' {
    const count = files.length;
    
    switch (domain) {
      case 'dbMigrations':
      case 'env':
        return 'high';
      case 'appRoutes':
      case 'configs':
        return count > 2 ? 'high' : 'medium';
      case 'lib':
      case 'scripts':
        return count > 5 ? 'medium' : 'low';
      case 'deps':
        return 'low';
      default:
        return 'low';
    }
  }
  
  /**
   * Get description for a domain
   */
  private getDomainDescription(domain: string, count: number): string {
    switch (domain) {
      case 'appRoutes':
        return count === 1 ? '1 route modified' : `${count} routes modified`;
      case 'lib':
        return count === 1 ? '1 library file modified' : `${count} library files modified`;
      case 'dbMigrations':
        return count === 1 ? '1 migration file modified' : `${count} migration files modified`;
      case 'configs':
        return count === 1 ? '1 config file modified' : `${count} config files modified`;
      case 'scripts':
        return count === 1 ? '1 script modified' : `${count} scripts modified`;
      case 'deps':
        return count === 1 ? '1 dependency file modified' : `${count} dependency files modified`;
      case 'env':
        return count === 1 ? '1 environment file modified' : `${count} environment files modified`;
      default:
        return `${count} files modified`;
    }
  }
  
  /**
   * Get risk level icon
   */
  private getRiskIcon(risk: 'low' | 'medium' | 'high'): string {
    switch (risk) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  }
  
  /**
   * Print progress indicator
   */
  printProgress(message: string): void {
    console.log(`🔄 ${message}`);
  }
  
  /**
   * Print success message
   */
  printSuccess(message: string): void {
    console.log(`✅ ${message}`);
  }
  
  /**
   * Print warning message
   */
  printWarning(message: string): void {
    console.log(`⚠️ ${message}`);
  }
  
  /**
   * Print error message
   */
  printError(message: string): void {
    console.error(`❌ ${message}`);
  }
  
  /**
   * Print info message
   */
  printInfo(message: string): void {
    console.log(`ℹ️ ${message}`);
  }
}
