/**
 * Impact Analysis Utilities for Sentinel Gate
 * 
 * Maps changed files to domains and builds impact maps for decision making
 */

import { MigrationAnalysis, DatabaseMigrationAnalyzer } from './db-migration.js';

export interface ImpactMap {
  changedFiles: string[];
  domains: {
    appRoutes: string[];
    lib: string[];
    dbMigrations: string[];
    configs: string[];
    scripts: string[];
    deps: string[];
    env: string[];
  };
  hasMigration: boolean;
  hasEnvChange: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  migrationAnalysis?: MigrationAnalysis;
}

export class ImpactAnalyzer {
  private domainPatterns: Record<string, RegExp[]>;
  private migrationAnalyzer: DatabaseMigrationAnalyzer;
  
  constructor() {
    this.migrationAnalyzer = new DatabaseMigrationAnalyzer();
    this.domainPatterns = {
      appRoutes: [
        /^app\/.*\/page\.tsx?$/,
        /^app\/.*\/route\.ts$/,
        /^app\/.*\/layout\.tsx?$/,
        /^app\/.*\/loading\.tsx?$/,
        /^app\/.*\/error\.tsx?$/,
        /^app\/.*\/not-found\.tsx?$/
      ],
      lib: [
        /^lib\/.*\.ts$/,
        /^lib\/.*\.tsx?$/,
        /^components\/.*\.tsx?$/,
        /^hooks\/.*\.ts$/,
        /^utils\/.*\.ts$/
      ],
      dbMigrations: [
        /^supabase\/migrations\/.*\.sql$/,
        /^migrations\/.*\.sql$/,
        /^db\/.*\.sql$/
      ],
      configs: [
        /^package\.json$/,
        /^tsconfig\.json$/,
        /^next\.config\.(js|ts)$/,
        /^tailwind\.config\.(js|ts)$/,
        /^\.env.*$/,
        /^\.eslintrc.*$/,
        /^jest\.config\.(js|ts)$/
      ],
      scripts: [
        /^scripts\/.*\.(js|ts|ps1|bat)$/,
        /^\.github\/.*$/,
        /^ci\/.*$/,
        /^build\/.*$/
      ],
      deps: [
        /^package-lock\.json$/,
        /^yarn\.lock$/,
        /^pnpm-lock\.yaml$/,
        /^node_modules\/.*$/
      ],
      env: [
        /^\.env$/,
        /^\.env\.local$/,
        /^\.env\.development$/,
        /^\.env\.production$/,
        /^\.env\.test$/,
        /^env\.ts$/,
        /^lib\/env\.ts$/
      ]
    };
  }
  
  /**
   * Build impact map from changed files
   */
  async buildImpactMap(changedFiles: string[]): Promise<ImpactMap> {
    const domains = {
      appRoutes: [] as string[],
      lib: [] as string[],
      dbMigrations: [] as string[],
      configs: [] as string[],
      scripts: [] as string[],
      deps: [] as string[],
      env: [] as string[]
    };
    
    // Categorize each changed file
    for (const file of changedFiles) {
      const domain = this.categorizeFile(file);
      if (domain) {
        domains[domain].push(file);
      }
    }
    
    // Determine risk indicators
    const hasMigration = domains.dbMigrations.length > 0;
    const hasEnvChange = domains.env.length > 0;
    
    // Analyze database migrations if present
    let migrationAnalysis: MigrationAnalysis | undefined;
    if (hasMigration) {
      migrationAnalysis = await this.analyzeMigrations(domains.dbMigrations);
    }
    
    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(domains, hasMigration, hasEnvChange, migrationAnalysis);
    
    return {
      changedFiles,
      domains,
      hasMigration,
      hasEnvChange,
      riskLevel,
      migrationAnalysis
    };
  }
  
  /**
   * Categorize a file into a domain
   */
  private categorizeFile(file: string): keyof ImpactMap['domains'] | null {
    for (const [domain, patterns] of Object.entries(this.domainPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(file)) {
          return domain as keyof ImpactMap['domains'];
        }
      }
    }
    return null;
  }
  
  /**
   * Analyze database migrations for safety
   */
  private async analyzeMigrations(migrationFiles: string[]): Promise<MigrationAnalysis> {
    const migrationData: Array<{
      path: string;
      content: string;
      isNew: boolean;
      phase: 'expand' | 'contract' | 'dual-read-write' | 'unknown';
    }> = [];
    
    for (const file of migrationFiles) {
      try {
        // Read migration file content
        const fs = await import('fs/promises');
        const content = await fs.readFile(file, 'utf-8');
        
        // Determine if this is a new migration (simplified check)
        const isNew = true; // In a real implementation, compare with base branch
        
        // Extract phase from content - look for proper phase markers
        let phase: 'expand' | 'contract' | 'dual-read-write' | 'unknown' = 'unknown';
        
        // Look for phase markers - only exact matches at line beginnings
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Accept phase markers in comments or standalone
          if (trimmedLine === '#expand' || trimmedLine === '-- #expand') {
            phase = 'expand';
            break;
          } else if (trimmedLine === '#contract' || trimmedLine === '-- #contract') {
            phase = 'contract';
            break;
          } else if (trimmedLine === '#dual-read-write' || trimmedLine === '-- #dual-read-write' ||
                     trimmedLine === '#dual_read_write' || trimmedLine === '-- #dual_read_write') {
            phase = 'dual-read-write';
            break;
          }
        }
        
        migrationData.push({ path: file, content, isNew, phase });
      } catch (error) {
        console.warn(`Warning: Could not read migration file ${file}:`, error);
      }
    }
    
    return this.migrationAnalyzer.analyzeMigrations(migrationData);
  }
  
  /**
   * Calculate overall risk level based on changes
   */
  private calculateRiskLevel(
    domains: ImpactMap['domains'], 
    hasMigration: boolean, 
    hasEnvChange: boolean,
    migrationAnalysis?: MigrationAnalysis
  ): ImpactMap['riskLevel'] {
    let riskScore = 0;
    
    // High risk indicators
    if (hasMigration) {
      if (migrationAnalysis && !migrationAnalysis.isSafe) {
        riskScore += 5; // Unsafe migrations are very high risk
      } else {
        riskScore += 3; // Safe migrations are high risk
      }
    }
    if (hasEnvChange) riskScore += 3;
    if (domains.configs.length > 0) riskScore += 2;
    
    // Medium risk indicators
    if (domains.appRoutes.length > 0) riskScore += 2;
    if (domains.scripts.length > 0) riskScore += 1;
    
    // Low risk indicators
    if (domains.lib.length > 0) riskScore += 1;
    if (domains.deps.length > 0) riskScore += 1;
    
    if (riskScore >= 5) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }
  
  /**
   * Get detailed analysis for a specific domain
   */
  getDomainAnalysis(domain: keyof ImpactMap['domains'], files: string[]): {
    count: number;
    risk: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
  } {
    const count = files.length;
    
    switch (domain) {
      case 'appRoutes':
        return {
          count,
          risk: count > 0 ? 'medium' : 'low',
          description: 'Application route changes',
          recommendations: [
            'Ensure new routes have feature flags',
            'Verify route security and authentication',
            'Check for breaking changes in existing routes'
          ]
        };
        
      case 'dbMigrations':
        return {
          count,
          risk: count > 0 ? 'high' : 'low',
          description: 'Database schema changes',
          recommendations: [
            'Review migration safety and rollback plan',
            'Ensure migrations are backward compatible',
            'Add migration markers for expansion/contraction',
            'Update documentation and runbooks',
            'Follow expand→dual-read/write→contract workflow',
            'Add #expand, #contract, or #dual-read-write phase markers'
          ]
        };
        
      case 'env':
        return {
          count,
          risk: count > 0 ? 'high' : 'low',
          description: 'Environment configuration changes',
          recommendations: [
            'Verify no secrets are exposed',
            'Check environment variable documentation',
            'Ensure changes are properly documented',
            'Review impact on different environments'
          ]
        };
        
      case 'configs':
        return {
          count,
          risk: count > 0 ? 'medium' : 'low',
          description: 'Configuration file changes',
          recommendations: [
            'Verify configuration compatibility',
            'Check for breaking changes',
            'Update related documentation',
            'Test configuration in different environments'
          ]
        };
        
      case 'lib':
        return {
          count,
          risk: count > 0 ? 'low' : 'low',
          description: 'Library and utility changes',
          recommendations: [
            'Ensure backward compatibility',
            'Update type definitions if needed',
            'Verify no breaking changes',
            'Update tests and documentation'
          ]
        };
        
      case 'scripts':
        return {
          count,
          risk: count > 0 ? 'low' : 'low',
          description: 'Build and automation script changes',
          recommendations: [
            'Test scripts in different environments',
            'Verify no security vulnerabilities',
            'Update documentation and runbooks',
            'Check for breaking changes'
          ]
        };
        
      case 'deps':
        return {
          count,
          risk: count > 0 ? 'low' : 'low',
          description: 'Dependency changes',
          recommendations: [
            'Review changelog for breaking changes',
            'Test with updated dependencies',
            'Verify security advisories',
            'Update lock files consistently'
          ]
        };
        
      default:
        return {
          count,
          risk: 'low',
          description: 'Unknown domain',
          recommendations: ['Review changes manually']
        };
    }
  }
  
  /**
   * Get summary of all domains
   */
  getDomainSummary(domains: ImpactMap['domains']): Array<{
    domain: keyof ImpactMap['domains'];
    count: number;
    risk: 'low' | 'medium' | 'high';
    description: string;
  }> {
    const summary: Array<{
      domain: keyof ImpactMap['domains'];
      count: number;
      risk: 'low' | 'medium' | 'high';
      description: string;
    }> = [];
    
    for (const [domain, files] of Object.entries(domains)) {
      if (files.length > 0) {
        const analysis = this.getDomainAnalysis(domain as keyof ImpactMap['domains'], files);
        summary.push({
          domain: domain as keyof ImpactMap['domains'],
          count: files.length,
          risk: analysis.risk,
          description: analysis.description
        });
      }
    }
    
    return summary.sort((a, b) => {
      const riskOrder = { high: 3, medium: 2, low: 1 };
      return riskOrder[b.risk] - riskOrder[a.risk];
    });
  }
}
