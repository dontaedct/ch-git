#!/usr/bin/env tsx

/**
 * @fileoverview HT-006 Codemod Runner - Safe Transformation Automation
 * @description jscodeshift integration with backup and rollback
 * @version 1.0.0
 * @author HT-006 Phase 4 - Refactoring Toolkit
 * @task HT-006.4 - Refactoring Toolkit Implementation
 */

import { execSync } from 'child_process';
import pc from 'picocolors';
import * as fs from 'fs';
import * as path from 'path';

interface CodemodOptions {
  dryRun?: boolean;
  verbose?: boolean;
  backup?: boolean;
  pattern?: string;
}

interface CodemodResult {
  success: boolean;
  filesChanged: number;
  errors: string[];
  backupPath?: string;
}

class CodemodRunner {
  private options: CodemodOptions;

  constructor(options: CodemodOptions = {}) {
    this.options = {
      backup: true,
      verbose: false,
      dryRun: false,
      ...options,
    };
  }

  async runCodemod(
    codemodPath: string,
    targetPath: string,
    transformOptions: Record<string, any> = {}
  ): Promise<CodemodResult> {
    console.log(pc.blue(`🔧 Running codemod: ${path.basename(codemodPath)}`));
    console.log(pc.blue(`📁 Target: ${targetPath}`));

    const result: CodemodResult = {
      success: false,
      filesChanged: 0,
      errors: [],
    };

    try {
      // Create backup if requested
      if (this.options.backup && !this.options.dryRun) {
        result.backupPath = await this.createBackup(targetPath);
        console.log(pc.green(`💾 Backup created: ${result.backupPath}`));
      }

      // Build jscodeshift command
      const command = this.buildCommand(codemodPath, targetPath, transformOptions);
      
      if (this.options.verbose) {
        console.log(pc.cyan(`Command: ${command}`));
      }

      if (this.options.dryRun) {
        console.log(pc.yellow('🔍 DRY RUN - No changes will be applied'));
        const dryRunCommand = command + ' --dry';
        const output = execSync(dryRunCommand, { 
          encoding: 'utf8',
          stdio: this.options.verbose ? 'inherit' : 'pipe'
        });
        
        result.success = true;
        result.filesChanged = this.parseFilesChanged(output);
        console.log(pc.green(`✅ Dry run completed - ${result.filesChanged} files would be changed`));
      } else {
        const output = execSync(command, { 
          encoding: 'utf8',
          stdio: this.options.verbose ? 'inherit' : 'pipe'
        });
        
        result.success = true;
        result.filesChanged = this.parseFilesChanged(output);
        console.log(pc.green(`✅ Codemod completed - ${result.filesChanged} files changed`));
      }

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      console.error(pc.red(`❌ Codemod failed: ${error}`));
      
      // Restore backup if available
      if (result.backupPath && fs.existsSync(result.backupPath)) {
        console.log(pc.yellow('🔄 Restoring from backup...'));
        await this.restoreBackup(result.backupPath, targetPath);
      }
    }

    return result;
  }

  private buildCommand(
    codemodPath: string,
    targetPath: string,
    transformOptions: Record<string, any>
  ): string {
    const baseCommand = `npx jscodeshift -t "${codemodPath}" "${targetPath}"`;
    
    // Add transform options
    const options = Object.entries(transformOptions)
      .map(([key, value]) => `--${key}="${value}"`)
      .join(' ');
    
    return `${baseCommand} ${options}`;
  }

  private parseFilesChanged(output: string): number {
    // Parse jscodeshift output to count changed files
    const match = output.match(/(\d+) files? (?:transformed|changed)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  private async createBackup(targetPath: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), '.codemod-backups', timestamp);
    
    await fs.promises.mkdir(backupDir, { recursive: true });
    
    if (fs.statSync(targetPath).isDirectory()) {
      // Copy entire directory
      await this.copyDirectory(targetPath, backupDir);
    } else {
      // Copy single file
      const fileName = path.basename(targetPath);
      await fs.promises.copyFile(targetPath, path.join(backupDir, fileName));
    }
    
    return backupDir;
  }

  private async copyDirectory(src: string, dest: string): Promise<void> {
    const entries = await fs.promises.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await fs.promises.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.promises.copyFile(srcPath, destPath);
      }
    }
  }

  private async restoreBackup(backupPath: string, targetPath: string): Promise<void> {
    if (fs.statSync(targetPath).isDirectory()) {
      // Remove target directory and restore from backup
      await fs.promises.rm(targetPath, { recursive: true });
      await this.copyDirectory(backupPath, path.dirname(targetPath));
    } else {
      // Restore single file
      const fileName = path.basename(targetPath);
      await fs.promises.copyFile(path.join(backupPath, fileName), targetPath);
    }
  }

  async rollback(backupPath: string, targetPath: string): Promise<void> {
    console.log(pc.yellow(`🔄 Rolling back to: ${backupPath}`));
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }
    
    await this.restoreBackup(backupPath, targetPath);
    console.log(pc.green('✅ Rollback completed'));
  }

  listBackups(): string[] {
    const backupDir = path.join(process.cwd(), '.codemod-backups');
    
    if (!fs.existsSync(backupDir)) {
      return [];
    }
    
    return fs.readdirSync(backupDir)
      .map(dir => path.join(backupDir, dir))
      .filter(dir => fs.statSync(dir).isDirectory())
      .sort()
      .reverse(); // Most recent first
  }

  cleanupBackups(keepCount: number = 5): void {
    const backups = this.listBackups();
    
    if (backups.length <= keepCount) {
      console.log(pc.cyan(`ℹ️  No cleanup needed (${backups.length} backups, keeping ${keepCount})`));
      return;
    }
    
    const toDelete = backups.slice(keepCount);
    
    for (const backup of toDelete) {
      fs.rmSync(backup, { recursive: true });
      console.log(pc.yellow(`🗑️  Deleted old backup: ${path.basename(backup)}`));
    }
    
    console.log(pc.green(`✅ Cleaned up ${toDelete.length} old backups`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(pc.red('❌ Usage: tsx scripts/codemod-runner.ts <command> [options]'));
    console.log('');
    console.log('Commands:');
    console.log('  run <codemod> <target> [transform-options]  - Run a codemod');
    console.log('  rollback <backup-path> <target>             - Rollback to backup');
    console.log('  list-backups                                - List available backups');
    console.log('  cleanup [keep-count]                       - Cleanup old backups');
    console.log('');
    console.log('Options:');
    console.log('  --dry-run     - Show changes without applying');
    console.log('  --verbose     - Show detailed output');
    console.log('  --no-backup   - Skip backup creation');
    console.log('');
    console.log('Examples:');
    console.log('  tsx scripts/codemod-runner.ts run scripts/codemods/rename-prop.js components/ --prop=oldProp --new-prop=newProp');
    console.log('  tsx scripts/codemod-runner.ts run scripts/codemods/redirect-import.js app/ --old-path=@/old --new-path=@/new');
    console.log('  tsx scripts/codemod-runner.ts rollback .codemod-backups/2024-01-01T12-00-00-000Z components/');
    process.exit(1);
  }

  const command = args[0];
  const options: CodemodOptions = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose'),
    backup: !args.includes('--no-backup'),
  };

  const runner = new CodemodRunner(options);

  try {
    switch (command) {
      case 'run': {
        if (args.length < 3) {
          console.log(pc.red('❌ Usage: run <codemod> <target> [transform-options]'));
          process.exit(1);
        }
        
        const codemodPath = args[1];
        const targetPath = args[2];
        const transformOptions: Record<string, any> = {};
        
        // Parse transform options from remaining args
        for (let i = 3; i < args.length; i++) {
          const arg = args[i];
          if (arg.startsWith('--') && arg.includes('=')) {
            const [key, value] = arg.substring(2).split('=', 2);
            transformOptions[key] = value;
          }
        }
        
        const result = await runner.runCodemod(codemodPath, targetPath, transformOptions);
        
        if (!result.success) {
          console.error(red('❌ Codemod failed'));
          process.exit(1);
        }
        break;
      }
      
      case 'rollback': {
        if (args.length < 3) {
          console.log(pc.red('❌ Usage: rollback <backup-path> <target>'));
          process.exit(1);
        }
        
        const backupPath = args[1];
        const targetPath = args[2];
        
        await runner.rollback(backupPath, targetPath);
        break;
      }
      
      case 'list-backups': {
        const backups = runner.listBackups();
        
        if (backups.length === 0) {
          console.log(pc.cyan('ℹ️  No backups found'));
        } else {
          console.log(pc.blue('📁 Available backups:'));
          backups.forEach(backup => {
            const name = path.basename(backup);
            const stats = fs.statSync(backup);
            const date = stats.mtime.toISOString();
            console.log(`  ${name} (${date})`);
          });
        }
        break;
      }
      
      case 'cleanup': {
        const keepCount = args[1] ? parseInt(args[1], 10) : 5;
        runner.cleanupBackups(keepCount);
        break;
      }
      
      default:
        console.log(pc.red(`❌ Unknown command: ${command}`));
        process.exit(1);
    }
  } catch (error) {
    console.error(pc.red(`❌ Error: ${error}`));
    process.exit(1);
  }
}

// Fix ES module detection for Windows paths
const currentFile = import.meta.url.replace('file:///', '').replace(/\//g, '\\');
const scriptFile = process.argv[1].replace(/\//g, '\\');

if (currentFile === scriptFile) {
  main();
}
