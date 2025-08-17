/**
 * Database Migration Analyzer for Sentinel Gate
 * 
 * Analyzes database migrations for safety and compliance with expand/contract workflow
 */

export interface MigrationAnalysis {
  hasMigrations: boolean;
  isSafe: boolean;
  phase: 'expand' | 'contract' | 'dual-read-write' | 'unknown';
  unsafeOperations: string[];
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  planId?: string;
}

export interface MigrationFile {
  path: string;
  content: string;
  isNew: boolean;
  phase: 'expand' | 'contract' | 'dual-read-write' | 'unknown';
}

export class DatabaseMigrationAnalyzer {
  private unsafePatterns: RegExp[];
  private phaseMarkers: RegExp[];
  
  constructor() {
    this.unsafePatterns = [
      // DROP operations
      /\bDROP\s+(TABLE|COLUMN|INDEX|CONSTRAINT|FUNCTION|TRIGGER|VIEW|SCHEMA|DATABASE)\b/gi,
      /\bDROP\s+IF\s+EXISTS\b/gi,
      
      // RENAME operations
      /\bRENAME\s+(TO|COLUMN)\b/gi,
      /\bALTER\s+TABLE\s+.*\s+RENAME\b/gi,
      
      // Type constraint tightening
      /\bALTER\s+TYPE\s+.*\s+SET\b/gi,
      /\bALTER\s+COLUMN\s+.*\s+TYPE\b/gi,
      
      // Constraint additions that could break existing data
      /\bALTER\s+TABLE\s+.*\s+ADD\s+CONSTRAINT\s+.*\s+CHECK\b/gi,
      /\bALTER\s+TABLE\s+.*\s+ADD\s+CONSTRAINT\s+.*\s+NOT\s+NULL\b/gi,
      
      // Default value removals
      /\bALTER\s+COLUMN\s+.*\s+DROP\s+DEFAULT\b/gi,
      
      // Index removals
      /\bDROP\s+INDEX\b/gi,
      
      // Function signature changes
      /\bCREATE\s+OR\s+REPLACE\s+FUNCTION\b/gi
    ];
    
    this.phaseMarkers = [
      /#expand\b/gi,
      /#contract\b/gi,
      /#dual-read-write\b/gi,
      /#dual_read_write\b/gi
    ];
  }
  
  /**
   * Analyze migration files for safety
   */
  async analyzeMigrations(migrationFiles: MigrationFile[]): Promise<MigrationAnalysis> {
    if (migrationFiles.length === 0) {
      return {
        hasMigrations: false,
        isSafe: true,
        phase: 'unknown',
        unsafeOperations: [],
        recommendations: [],
        riskLevel: 'low'
      };
    }
    
    const unsafeOperations: string[] = [];
    const recommendations: string[] = [];
    let overallPhase: 'expand' | 'contract' | 'dual-read-write' | 'unknown' = 'unknown';
    
    // Analyze each migration file
    for (const file of migrationFiles) {
      const fileAnalysis = this.analyzeSingleMigration(file);
      
      // Collect unsafe operations
      unsafeOperations.push(...fileAnalysis.unsafeOperations);
      
      // Determine overall phase - preserve 'unknown' if that's what was detected
      if (file.phase !== 'unknown' && overallPhase === 'unknown') {
        overallPhase = file.phase;
      }
      
      // Add file-specific recommendations
      recommendations.push(...fileAnalysis.recommendations);
    }
    
    // Determine if migrations are safe
    const isSafe = unsafeOperations.length === 0;
    
    // Generate recommendations based on analysis
    if (unsafeOperations.length > 0) {
      if (overallPhase === 'unknown') {
        recommendations.push(
          'Add phase markers (#expand, #contract, #dual-read-write) to migrations',
          'Follow expand→dual-read/write→contract workflow'
        );
      } else if (overallPhase === 'contract') {
        recommendations.push(
          'Ensure expand and dual-read/write phases are completed first',
          'Verify backward compatibility is maintained',
          'Consider rollback plan for contract phase'
        );
      }
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (unsafeOperations.length > 0) {
      riskLevel = overallPhase === 'expand' ? 'medium' : 'high';
    }
    
    // Extract plan ID if present
    const planId = this.extractPlanId(migrationFiles);
    
    return {
      hasMigrations: true,
      isSafe,
      phase: overallPhase,
      unsafeOperations: Array.from(new Set(unsafeOperations)), // Remove duplicates
      recommendations: Array.from(new Set(recommendations)), // Remove duplicates
      riskLevel,
      planId
    };
  }
  
  /**
   * Analyze a single migration file
   */
  private analyzeSingleMigration(file: MigrationFile): {
    unsafeOperations: string[];
    recommendations: string[];
  } {
    const unsafeOperations: string[] = [];
    const recommendations: string[] = [];
    
    // Check for unsafe patterns - ignore commented lines
    const lines = file.content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip commented lines
      if (trimmedLine.startsWith('--') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*/')) {
        continue;
      }
      
      // Check for unsafe patterns in non-commented lines
      for (const pattern of this.unsafePatterns) {
        const matches = trimmedLine.match(pattern);
        if (matches) {
          const operation = this.categorizeUnsafeOperation(matches[0]);
          unsafeOperations.push(operation);
        }
      }
    }
    
    // Generate recommendations based on file content
    if (file.isNew && file.phase === 'unknown') {
      recommendations.push(`Add phase marker to ${file.path}`);
    }
    
    if (unsafeOperations.length > 0 && file.phase === 'unknown') {
      recommendations.push(`Migration ${file.path} contains unsafe operations - add phase marker`);
    }
    
    return { unsafeOperations, recommendations };
  }
  
  /**
   * Categorize unsafe operation for better reporting
   */
  private categorizeUnsafeOperation(match: string): string {
    const upperMatch = match.toUpperCase();
    
    if (upperMatch.includes('DROP TABLE')) return 'Table removal (DROP TABLE)';
    if (upperMatch.includes('DROP COLUMN')) return 'Column removal (DROP COLUMN)';
    if (upperMatch.includes('DROP INDEX')) return 'Index removal (DROP INDEX)';
    if (upperMatch.includes('DROP CONSTRAINT')) return 'Constraint removal (DROP CONSTRAINT)';
    if (upperMatch.includes('DROP FUNCTION')) return 'Function removal (DROP FUNCTION)';
    if (upperMatch.includes('DROP TRIGGER')) return 'Trigger removal (DROP TRIGGER)';
    if (upperMatch.includes('DROP VIEW')) return 'View removal (DROP VIEW)';
    if (upperMatch.includes('DROP SCHEMA')) return 'Schema removal (DROP SCHEMA)';
    if (upperMatch.includes('DROP DATABASE')) return 'Database removal (DROP DATABASE)';
    if (upperMatch.includes('RENAME')) return 'Object renaming (RENAME)';
    if (upperMatch.includes('ALTER TYPE') && upperMatch.includes('SET')) return 'Type constraint tightening (ALTER TYPE SET)';
    if (upperMatch.includes('ALTER COLUMN') && upperMatch.includes('TYPE')) return 'Column type change (ALTER COLUMN TYPE)';
    if (upperMatch.includes('ADD CONSTRAINT') && upperMatch.includes('CHECK')) return 'Check constraint addition (ADD CONSTRAINT CHECK)';
    if (upperMatch.includes('ADD CONSTRAINT') && upperMatch.includes('NOT NULL')) return 'NOT NULL constraint addition (ADD CONSTRAINT NOT NULL)';
    if (upperMatch.includes('DROP DEFAULT')) return 'Default value removal (DROP DEFAULT)';
    if (upperMatch.includes('CREATE OR REPLACE FUNCTION')) return 'Function signature change (CREATE OR REPLACE FUNCTION)';
    
    return `Unsafe operation: ${match}`;
  }
  
  /**
   * Extract plan ID from migration files
   */
  private extractPlanId(files: MigrationFile[]): string | undefined {
    const planIdPattern = /#plan[:\s]+([a-zA-Z0-9_-]+)/gi;
    
    for (const file of files) {
      const match = file.content.match(planIdPattern);
      if (match) {
        return match[1];
      }
    }
    
    return undefined;
  }
  
  /**
   * Generate migration safety report
   */
  generateSafetyReport(analysis: MigrationAnalysis): string {
    let report = '=== DATABASE MIGRATION SAFETY REPORT ===\n\n';
    
    report += `Status: ${analysis.isSafe ? '✅ SAFE' : '❌ UNSAFE'}\n`;
    report += `Phase: ${analysis.phase.toUpperCase()}\n`;
    report += `Risk Level: ${analysis.riskLevel.toUpperCase()}\n`;
    
    if (analysis.planId) {
      report += `Plan ID: ${analysis.planId}\n`;
    }
    
    report += '\n';
    
    if (analysis.unsafeOperations.length > 0) {
      report += '🚨 UNSAFE OPERATIONS DETECTED:\n';
      analysis.unsafeOperations.forEach((op, index) => {
        report += `  ${index + 1}. ${op}\n`;
      });
      report += '\n';
    }
    
    if (analysis.recommendations.length > 0) {
      report += '💡 RECOMMENDATIONS:\n';
      analysis.recommendations.forEach((rec, index) => {
        report += `  ${index + 1}. ${rec}\n`;
      });
      report += '\n';
    }
    
    if (analysis.phase === 'unknown') {
      report += '⚠️  PHASE MARKERS REQUIRED:\n';
      report += '  - Add #expand for additive changes\n';
      report += '  - Add #dual-read-write for transition phase\n';
      report += '  - Add #contract for removal phase\n\n';
    }
    
    report += '=== END REPORT ===\n';
    
    return report;
  }
  
  /**
   * Check if migration should be blocked by Sentinel
   */
  shouldBlockMigration(analysis: MigrationAnalysis): boolean {
    // Block if unsafe operations exist without proper phase markers
    if (analysis.unsafeOperations.length > 0 && analysis.phase === 'unknown') {
      return true;
    }
    
    // Block contract phase if no plan ID
    if (analysis.phase === 'contract' && !analysis.planId) {
      return true;
    }
    
    // Allow expand phase only if no unsafe operations
    if (analysis.phase === 'expand') {
      return analysis.unsafeOperations.length > 0;
    }
    
    // Allow dual-read-write phase
    if (analysis.phase === 'dual-read-write') {
      return false;
    }
    
    // Default: block unknown phases with unsafe operations
    return analysis.unsafeOperations.length > 0;
  }
}
