#!/usr/bin/env tsx

/**
 * Policy Enforcer - Pre-commit safety checks
 * 
 * Enforces:
 * - No src/* or deep relative imports (use aliases only)
 * - Registry changes require CHANGE_JOURNAL.md updates
 * - File renames/deletions require proper scripts/compat
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface GitFileStatus {
  status: string;
  file: string;
  newFile?: string;
}

interface Violation {
  type: 'import' | 'registry' | 'rename' | 'delete';
  file: string;
  message: string;
  suggestion: string;
}

class PolicyEnforcer {
  private violations: Violation[] = [];
  private stagedFiles: GitFileStatus[] = [];
  private changeJournalUpdated = false;

  async run(): Promise<void> {
    console.log('🔒 Policy Enforcer: Checking staged changes...');
    
    try {
      this.getStagedFiles();
      this.checkChangeJournalUpdate();
      this.checkImports();
      this.checkRegistryChanges();
      this.checkRenamesAndDeletes();
      this.reportViolations();
    } catch (error) {
      console.error('❌ Policy enforcer failed:', error);
      process.exit(1);
    }
  }

  private getStagedFiles(): void {
    try {
      const output = execSync('git diff --cached --name-status', { encoding: 'utf8' });
      this.stagedFiles = output
        .trim()
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [status, file] = line.split('\t');
          return { status: status || '', file: file || '' };
        });
    } catch (error) {
      console.error('Failed to get staged files:', error);
      process.exit(1);
    }
  }

  private checkChangeJournalUpdate(): void {
    const journalFile = 'docs/CHANGE_JOURNAL.md';
    if (!existsSync(journalFile)) {
      // If journal doesn't exist, we can't enforce this rule
      return;
    }

    try {
      const output = execSync('git diff --cached docs/CHANGE_JOURNAL.md', { encoding: 'utf8' });
      this.changeJournalUpdated = output.trim().length > 0;
    } catch (error) {
      // No changes to journal file
      this.changeJournalUpdated = false;
    }
  }

  private checkImports(): void {
    const importPatterns = [
      /import\s+.*from\s+['"]src\//,
      /import\s+.*from\s+['"]\.\.\//,
      /import\s+.*from\s+['"]\.\.\.\//,
      /import\s+.*from\s+['"]\.\.\.\.\//,
      /import\s+.*from\s+['"]\.\.\.\.\.\//,
      /import\s+.*from\s+['"]\.\.\.\.\.\.\//,
    ];

    for (const { file } of this.stagedFiles) {
      if (!this.isTextFile(file)) continue;

      try {
        const content = readFileSync(file, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          for (const pattern of importPatterns) {
            if (pattern.test(line)) {
              this.violations.push({
                type: 'import',
                file: `${file}:${index + 1}`,
                message: `Invalid import pattern: ${line.trim()}`,
                suggestion: 'Use aliases: @app/*, @data/*, @lib/*, @ui/*, @registry/*, @compat/*'
              });
            }
          }
        });
      } catch (error) {
        // Skip files that can't be read (binary, etc.)
      }
    }
  }

  private checkRegistryChanges(): void {
    const registryFiles = this.stagedFiles.filter(({ file }) => 
      file.startsWith('lib/registry/') || file.startsWith('src/registry/')
    );

    if (registryFiles.length > 0 && !this.changeJournalUpdated) {
      this.violations.push({
        type: 'registry',
        file: registryFiles.map(f => f.file).join(', '),
        message: 'Registry files changed but CHANGE_JOURNAL.md not updated',
        suggestion: 'Update /docs/CHANGE_JOURNAL.md in the same commit when modifying registries'
      });
    }
  }

  private checkRenamesAndDeletes(): void {
    for (const { status, file } of this.stagedFiles) {
      if (status === 'D' || status === 'R') {
        this.checkRenameDeleteSafety(status, file);
      }
    }
  }

  private checkRenameDeleteSafety(status: string, file: string): void {
    // Check if this is a rename (R status)
    if (status === 'R') {
      const renameInfo = this.stagedFiles.find(f => f.status === 'R' && f.file === file);
      if (renameInfo && renameInfo.newFile) {
        // Check if there's a compat re-export for the old path
        if (!this.hasCompatReexport(renameInfo.newFile, file)) {
          this.violations.push({
            type: 'rename',
            file: `${file} → ${renameInfo.newFile}`,
            message: 'File renamed without compat re-export',
            suggestion: 'Use npm run rename:import or add @compat/* re-export for smooth migration'
          });
        }
      }
    }

    // Check if this is a deletion (D status)
    if (status === 'D') {
      // Check if there are any remaining imports of this file
      if (this.hasRemainingImports(file)) {
        this.violations.push({
          type: 'delete',
          file,
          message: 'File deleted but may still be imported elsewhere',
          suggestion: 'Use npm run rename:import to update all imports before deletion'
        });
      }
    }
  }

  private hasCompatReexport(newFile: string, oldFile: string): boolean {
    // Check if there's a compat re-export in the new location
    try {
      const content = readFileSync(newFile, 'utf8');
      const oldPath = oldFile.replace(/\.(ts|tsx|js|jsx)$/, '');
      const compatPattern = new RegExp(`export\\s+\\*\\s+from\\s+['"]@compat/${oldPath}['"]`);
      return compatPattern.test(content);
    } catch (error) {
      return false;
    }
  }

  private hasRemainingImports(deletedFile: string): boolean {
    // Simple check - look for any remaining imports in staged files
    const deletedPath = deletedFile.replace(/\.(ts|tsx|js|jsx)$/, '');
    
    for (const { file } of this.stagedFiles) {
      if (file === deletedFile) continue;
      
      try {
        const content = readFileSync(file, 'utf8');
        const importPattern = new RegExp(`from\\s+['"][^'"]*${deletedPath}['"]`);
        if (importPattern.test(content)) {
          return true;
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
    
    return false;
  }

  private isTextFile(file: string): boolean {
    const textExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.txt', '.yml', '.yaml'];
    return textExtensions.some(ext => file.endsWith(ext));
  }

  private reportViolations(): void {
    if (this.violations.length === 0) {
      console.log('✅ All policy checks passed!');
      return;
    }

    console.error('\n❌ Policy violations found:');
    console.error('=====================================');
    
    this.violations.forEach((violation, index) => {
      console.error(`\n${index + 1}. ${violation.type.toUpperCase()} VIOLATION`);
      console.error(`   File: ${violation.file}`);
      console.error(`   Issue: ${violation.message}`);
      console.error(`   Fix: ${violation.suggestion}`);
    });

    console.error('\n=====================================');
    console.error('❌ Commit blocked. Fix violations and try again.');
    console.error('\nFor help with renames, see: /docs/RENAMES.md');
    console.error('For policy details, see: /docs/AI_RULES.md');
    
    process.exit(1);
  }
}

// Run the enforcer
if (require.main === module) {
  const enforcer = new PolicyEnforcer();
  enforcer.run().catch(error => {
    console.error('Policy enforcer failed:', error);
    process.exit(1);
  });
}
