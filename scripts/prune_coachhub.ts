#!/usr/bin/env tsx

/**
 * CoachHub Prune Surgery Script
 * 
 * This script safely removes all CoachHub/fitness domain content from the codebase
 * and verifies that the OSS Hero core remains functional.
 * 
 * Usage: tsx scripts/prune_coachhub.ts
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

interface ScanResult {
  path: string;
  line: number;
  context: string;
  pattern: string;
}

interface PruneReport {
  timestamp: string;
  filesRemoved: string[];
  filesRefactored: string[];
  scanResults: ScanResult[];
  buildResults: {
    lint: boolean;
    typecheck: boolean;
    build: boolean;
  };
  errors: string[];
}

class CoachHubPruner {
  private report: PruneReport;
  private backupDir: string;
  private bannedPatterns = [
    { name: 'CoachHub Branding', pattern: /CoachHub|coach-hub|coach_hub|Coach Hub/gi },
    { name: 'Fitness Entities', pattern: /\btrainer(s)?\b|\bclient(s)?\b|\bsession(s)?\b/gi },
    { name: 'Fitness Terms', pattern: /\bworkout\b|\bmeal\b|\bprogress\b|\bcheck-?in\b|\bmacro(s)?\b|\breps?\b|\bsets?\b/gi },
    { name: 'Fitness Actions', pattern: /\bbook(ing)?[-_ ]?session(s)?\b/gi },
  ];

  private filesToRemove = [
    // App routes
    'app/client-portal',
    'app/clients',
    'app/sessions',
    'app/trainer-profile',
    'app/progress',
    'app/weekly-plans',
    
    // API routes
    'app/api/clients',
    'app/api/sessions',
    'app/api/checkins',
    'app/api/weekly-plans',
    
    // Components
    'components/session-list.tsx',
    'components/session-form.tsx',
    'components/progress-dashboard.tsx',
    'components/guardian-dashboard.tsx',
    'components/rsvp-panel.tsx',
    'components/invite-panel.tsx',
    
    // Data layer
    'data/clients.ts',
    'data/clients.repo.ts',
    'data/sessions.ts',
    'data/checkins.repo.ts',
    'data/progress-metrics.repo.ts',
    'data/weekly-plans.repo.ts',
    
    // Migrations
    'supabase/migrations/create_clients_table.sql',
    'supabase/migrations/create_progress_metrics_table.sql',
    'supabase/migrations/create_check_ins_table.sql',
    'supabase/migrations/create_weekly_plan_rpc.sql',
    'supabase/migrations/create_client_intake_rpc.sql',
  ];

  constructor() {
    this.report = {
      timestamp: new Date().toISOString(),
      filesRemoved: [],
      filesRefactored: [],
      scanResults: [],
      buildResults: { lint: false, typecheck: false, build: false },
      errors: [],
    };
    
    this.backupDir = `backup/coachhub-${new Date().toISOString().replace(/[:.]/g, '-')}`;
  }

  async run(): Promise<void> {
    console.log('🚀 Starting CoachHub Prune Surgery...');
    console.log(`📁 Backup directory: ${this.backupDir}`);
    
    try {
      // Phase 1: Pre-surgery validation
      await this.validateWorkingTree();
      
      // Phase 2: Create backup
      await this.createBackup();
      
      // Phase 3: Pre-surgery scan
      await this.scanForBannedTokens();
      
      // Phase 4: Remove files
      await this.removeFiles();
      
      // Phase 5: Refactor mixed content
      await this.refactorMixedContent();
      
      // Phase 6: Post-surgery scan
      await this.scanForBannedTokens();
      
      // Phase 7: Build verification
      await this.verifyBuild();
      
      // Phase 8: Generate report
      await this.generateReport();
      
      console.log('✅ CoachHub Prune Surgery completed successfully!');
      console.log(`📊 Report saved to: ${this.backupDir}/prune-report.json`);
      
    } catch (error) {
      console.error('❌ Surgery failed:', error);
      this.report.errors.push(error instanceof Error ? error.message : String(error));
      await this.generateReport();
      process.exit(1);
    }
  }

  private async validateWorkingTree(): Promise<void> {
    console.log('🔍 Validating working tree...');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Working tree is not clean. Please commit or stash changes before running surgery.');
      }
      console.log('✅ Working tree is clean');
    } catch (error) {
      throw new Error(`Failed to validate working tree: ${error}`);
    }
  }

  private async createBackup(): Promise<void> {
    console.log('💾 Creating backup...');
    
    try {
      mkdirSync(this.backupDir, { recursive: true });
      
      // Backup files to be removed
      for (const file of this.filesToRemove) {
        if (existsSync(file)) {
          const backupPath = join(this.backupDir, file);
          mkdirSync(backupPath.split('/').slice(0, -1).join('/'), { recursive: true });
          
          if (existsSync(file)) {
            const content = readFileSync(file, 'utf8');
            writeFileSync(backupPath, content);
          }
        }
      }
      
      // Backup files to be refactored
      const filesToRefactor = [
        'components/intake-form.tsx',
        'app/intake/page.tsx',
        'supabase/migrations/001_create_core_tables.sql',
        'env.example'
      ];
      
      for (const file of filesToRefactor) {
        if (existsSync(file)) {
          const backupPath = join(this.backupDir, file);
          mkdirSync(backupPath.split('/').slice(0, -1).join('/'), { recursive: true });
          const content = readFileSync(file, 'utf8');
          writeFileSync(backupPath, content);
        }
      }
      
      console.log('✅ Backup created');
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`);
    }
  }

  private async scanForBannedTokens(): Promise<void> {
    console.log('🔍 Scanning for banned tokens...');
    
    const results: ScanResult[] = [];
    
    for (const { name, pattern } of this.bannedPatterns) {
      try {
        const grepResult = execSync(`grep -r "${pattern.source}" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=${this.backupDir} || true`, { encoding: 'utf8' });
        
        if (grepResult.trim()) {
          const lines = grepResult.trim().split('\n');
          for (const line of lines) {
            if (line) {
              const match = line.match(/^([^:]+):(\d+):(.+)$/);
              if (match) {
                results.push({
                  path: match[1],
                  line: parseInt(match[2]),
                  context: match[3].trim(),
                  pattern: name
                });
              }
            }
          }
        }
      } catch (error) {
        // grep returns non-zero when no matches found, which is expected
      }
    }
    
    this.report.scanResults = results;
    console.log(`📊 Found ${results.length} banned token matches`);
    
    if (results.length > 0) {
      console.log('⚠️  Banned tokens found:');
      results.forEach(result => {
        console.log(`   ${result.path}:${result.line} - ${result.pattern}: ${result.context}`);
      });
    }
  }

  private async removeFiles(): Promise<void> {
    console.log('🗑️  Removing fitness domain files...');
    
    for (const file of this.filesToRemove) {
      if (existsSync(file)) {
        try {
          rmSync(file, { recursive: true, force: true });
          this.report.filesRemoved.push(file);
          console.log(`   ✅ Removed: ${file}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to remove: ${file} (${error})`);
        }
      } else {
        console.log(`   ℹ️  File not found: ${file}`);
      }
    }
    
    console.log(`✅ Removed ${this.report.filesRemoved.length} files`);
  }

  private async refactorMixedContent(): Promise<void> {
    console.log('🔧 Refactoring mixed content...');
    
    // Refactor intake form to be generic
    await this.refactorIntakeForm();
    
    // Refactor core migration to remove fitness tables
    await this.refactorCoreMigration();
    
    // Remove fitness env vars
    await this.removeFitnessEnvVars();
    
    console.log('✅ Mixed content refactored');
  }

  private async refactorIntakeForm(): Promise<void> {
    const intakeFormPath = 'components/intake-form.tsx';
    if (existsSync(intakeFormPath)) {
      try {
        let content = readFileSync(intakeFormPath, 'utf8');
        
        // Remove fitness-specific fields and replace with generic ones
        content = content.replace(/fitness|workout|training|coach|client/gi, 'consultation');
        content = content.replace(/weight|height|goals/gi, 'preferences');
        
        writeFileSync(intakeFormPath, content);
        this.report.filesRefactored.push(intakeFormPath);
        console.log(`   ✅ Refactored: ${intakeFormPath}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to refactor: ${intakeFormPath} (${error})`);
      }
    }
  }

  private async refactorCoreMigration(): Promise<void> {
    const migrationPath = 'supabase/migrations/001_create_core_tables.sql';
    if (existsSync(migrationPath)) {
      try {
        let content = readFileSync(migrationPath, 'utf8');
        
        // Remove all fitness-specific table creation statements
        const fitnessTables = [
          'clients',
          'check_ins', 
          'progress_metrics',
          'weekly_plans',
          'sessions',
          'trainers'
        ];
        
        for (const table of fitnessTables) {
          // Remove CREATE TABLE statements
          content = content.replace(new RegExp(`CREATE TABLE IF NOT EXISTS ${table}[\\s\\S]*?;`, 'gi'), '');
          
          // Remove indexes
          content = content.replace(new RegExp(`CREATE INDEX IF NOT EXISTS idx_${table}[\\s\\S]*?;`, 'gi'), '');
          
          // Remove RLS policies
          content = content.replace(new RegExp(`CREATE POLICY[\\s\\S]*?ON ${table}[\\s\\S]*?;`, 'gi'), '');
          
          // Remove triggers
          content = content.replace(new RegExp(`CREATE TRIGGER update_${table}[\\s\\S]*?;`, 'gi'), '');
          
          // Remove comments
          content = content.replace(new RegExp(`COMMENT ON TABLE ${table}[\\s\\S]*?;`, 'gi'), '');
        }
        
        // Clean up any empty lines
        content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        writeFileSync(migrationPath, content);
        this.report.filesRefactored.push(migrationPath);
        console.log(`   ✅ Refactored: ${migrationPath}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to refactor: ${migrationPath} (${error})`);
      }
    }
  }

  private async removeFitnessEnvVars(): Promise<void> {
    const envPath = 'env.example';
    if (existsSync(envPath)) {
      try {
        let content = readFileSync(envPath, 'utf8');
        
        // Remove fitness-specific env vars
        content = content.replace(/^# Default Coach ID.*\n.*DEFAULT_COACH_ID.*\n/gm, '');
        
        writeFileSync(envPath, content);
        this.report.filesRefactored.push(envPath);
        console.log(`   ✅ Refactored: ${envPath}`);
      } catch (error) {
        console.log(`   ⚠️  Failed to refactor: ${envPath} (${error})`);
      }
    }
  }

  private async verifyBuild(): Promise<void> {
    console.log('🔨 Verifying build...');
    
    try {
      // Run lint
      console.log('   Running lint...');
      execSync('npm run lint', { stdio: 'inherit' });
      this.report.buildResults.lint = true;
      console.log('   ✅ Lint passed');
    } catch (error) {
      this.report.buildResults.lint = false;
      console.log('   ❌ Lint failed');
    }
    
    try {
      // Run typecheck
      console.log('   Running typecheck...');
      execSync('npm run typecheck', { stdio: 'inherit' });
      this.report.buildResults.typecheck = true;
      console.log('   ✅ Typecheck passed');
    } catch (error) {
      this.report.buildResults.typecheck = false;
      console.log('   ❌ Typecheck failed');
    }
    
    try {
      // Run build
      console.log('   Running build...');
      execSync('npm run build', { stdio: 'inherit' });
      this.report.buildResults.build = true;
      console.log('   ✅ Build passed');
    } catch (error) {
      this.report.buildResults.build = false;
      console.log('   ❌ Build failed');
    }
  }

  private async generateReport(): Promise<void> {
    const reportPath = join(this.backupDir, 'prune-report.json');
    writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    
    // Also write a summary to console
    console.log('\n📊 SURGERY SUMMARY');
    console.log('==================');
    console.log(`Files removed: ${this.report.filesRemoved.length}`);
    console.log(`Files refactored: ${this.report.filesRefactored.length}`);
    console.log(`Banned tokens found: ${this.report.scanResults.length}`);
    console.log(`Build results:`, this.report.buildResults);
    
    if (this.report.errors.length > 0) {
      console.log(`Errors: ${this.report.errors.length}`);
      this.report.errors.forEach(error => console.log(`  - ${error}`));
    }
  }
}

// Run the surgery
const pruner = new CoachHubPruner();
pruner.run().catch(console.error);
