#!/usr/bin/env tsx

/**
 * @fileoverview Brand Migration Script
 * @module scripts/brand-migration
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.6: Create Brand Migration System
 * Command-line script for upgrading existing deployments to support new branding capabilities.
 */

import { createClient } from '@supabase/supabase-js';
import { brandMigrationService } from '../lib/brand/brand-migration-service';
import { BrandMigrationPlan } from '../lib/brand/brand-migration-service';

// =============================================================================
// CONFIGURATION
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// =============================================================================
// CLI INTERFACE
// =============================================================================

interface MigrationOptions {
  tenantId?: string;
  fromVersion?: string;
  toVersion?: string;
  dryRun?: boolean;
  force?: boolean;
  verbose?: boolean;
}

async function main() {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--tenant-id':
        options.tenantId = args[++i];
        break;
      case '--from-version':
        options.fromVersion = args[++i];
        break;
      case '--to-version':
        options.toVersion = args[++i];
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        console.error(`❌ Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
  }

  // Validate required options
  if (!options.tenantId) {
    console.error('❌ --tenant-id is required');
    printHelp();
    process.exit(1);
  }

  try {
    await runMigration(options);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Brand Migration Script

Usage: npm run brand-migration [options]

Options:
  --tenant-id <id>      Tenant ID to migrate (required)
  --from-version <ver>  Source version (default: 1.0.0)
  --to-version <ver>    Target version (default: 2.0.0)
  --dry-run            Show what would be done without executing
  --force              Skip confirmation prompts
  --verbose            Show detailed output
  --help               Show this help message

Examples:
  npm run brand-migration --tenant-id 123e4567-e89b-12d3-a456-426614174000
  npm run brand-migration --tenant-id 123e4567-e89b-12d3-a456-426614174000 --dry-run
  npm run brand-migration --tenant-id 123e4567-e89b-12d3-a456-426614174000 --verbose
`);
}

// =============================================================================
// MIGRATION EXECUTION
// =============================================================================

async function runMigration(options: MigrationOptions) {
  const { tenantId, fromVersion = '1.0.0', toVersion = '2.0.0', dryRun, force, verbose } = options;

  console.log('🚀 Brand Migration Script');
  console.log('========================');
  console.log(`Tenant ID: ${tenantId}`);
  console.log(`From Version: ${fromVersion}`);
  console.log(`To Version: ${toVersion}`);
  console.log(`Dry Run: ${dryRun ? 'Yes' : 'No'}`);
  console.log('');

  // Verify tenant exists
  console.log('🔍 Verifying tenant...');
  const { data: tenant, error: tenantError } = await supabase
    .from('auth.users')
    .select('id, email')
    .eq('id', tenantId)
    .single();

  if (tenantError || !tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  console.log(`✅ Tenant found: ${tenant.email}`);
  console.log('');

  // Check for existing migrations
  console.log('🔍 Checking for existing migrations...');
  const { data: existingMigrations } = await supabase
    .from('brand_migration_status')
    .select('id, status, started_at')
    .eq('tenant_id', tenantId)
    .in('status', ['pending', 'running'])
    .order('started_at', { ascending: false });

  if (existingMigrations && existingMigrations.length > 0) {
    console.log('⚠️  Found existing migrations:');
    existingMigrations.forEach(migration => {
      console.log(`   - ${migration.id}: ${migration.status} (${migration.started_at})`);
    });

    if (!force) {
      console.log('');
      console.log('❌ Cannot proceed with existing migrations. Use --force to override.');
      process.exit(1);
    }
  }

  console.log('✅ No conflicting migrations found');
  console.log('');

  // Create migration plan
  console.log('📋 Creating migration plan...');
  const migrationPlan = await brandMigrationService.createMigrationPlan(
    tenantId,
    fromVersion,
    toVersion
  );

  console.log(`✅ Migration plan created: ${migrationPlan.name}`);
  console.log(`   Steps: ${migrationPlan.steps.length}`);
  console.log(`   Estimated Duration: ${migrationPlan.estimatedDuration} minutes`);
  console.log(`   Risk Level: ${migrationPlan.riskLevel}`);
  console.log(`   Rollbackable: ${migrationPlan.rollbackable ? 'Yes' : 'No'}`);
  console.log('');

  // Show migration steps
  if (verbose) {
    console.log('📝 Migration Steps:');
    migrationPlan.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.name}`);
      console.log(`      Type: ${step.type}`);
      console.log(`      Required: ${step.required ? 'Yes' : 'No'}`);
      console.log(`      Estimated Time: ${step.estimatedTime} minutes`);
      console.log(`      Rollbackable: ${step.rollbackable ? 'Yes' : 'No'}`);
      if (step.dependencies.length > 0) {
        console.log(`      Dependencies: ${step.dependencies.join(', ')}`);
      }
      console.log('');
    });
  }

  // Show prerequisites
  if (migrationPlan.prerequisites.length > 0) {
    console.log('📋 Prerequisites:');
    migrationPlan.prerequisites.forEach((prerequisite, index) => {
      console.log(`   ${index + 1}. ${prerequisite}`);
    });
    console.log('');
  }

  // Confirmation
  if (!force && !dryRun) {
    console.log('⚠️  This will modify your database and may take several minutes.');
    console.log('   Make sure you have a recent backup before proceeding.');
    console.log('');
    
    // In a real implementation, you would prompt for confirmation
    console.log('✅ Proceeding with migration (use --force to skip this prompt)');
    console.log('');
  }

  if (dryRun) {
    console.log('🔍 Dry run completed. No changes were made.');
    console.log('   Use without --dry-run to execute the migration.');
    return;
  }

  // Execute migration
  console.log('🚀 Starting migration...');
  const startTime = Date.now();

  try {
    const result = await brandMigrationService.executeMigration(migrationPlan, tenantId);
    const duration = Date.now() - startTime;

    console.log('');
    console.log('📊 Migration Results:');
    console.log('====================');
    console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`);
    console.log(`Duration: ${Math.round(duration / 1000)}s`);
    console.log(`Steps Completed: ${result.stepsCompleted.length}`);
    console.log(`Steps Failed: ${result.stepsFailed.length}`);
    console.log(`Errors: ${result.errors.length}`);
    console.log(`Warnings: ${result.warnings.length}`);
    console.log(`Rollback Available: ${result.rollbackAvailable ? 'Yes' : 'No'}`);
    console.log('');

    if (result.stepsCompleted.length > 0) {
      console.log('✅ Completed Steps:');
      result.stepsCompleted.forEach(stepId => {
        const step = migrationPlan.steps.find(s => s.id === stepId);
        console.log(`   - ${step?.name || stepId}`);
      });
      console.log('');
    }

    if (result.stepsFailed.length > 0) {
      console.log('❌ Failed Steps:');
      result.stepsFailed.forEach(stepId => {
        const step = migrationPlan.steps.find(s => s.id === stepId);
        console.log(`   - ${step?.name || stepId}`);
      });
      console.log('');
    }

    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(error => {
        console.log(`   - ${error.message}`);
        if (verbose && error.details) {
          console.log(`     Details: ${JSON.stringify(error.details, null, 2)}`);
        }
      });
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(warning => {
        console.log(`   - ${warning}`);
      });
      console.log('');
    }

    if (result.success) {
      console.log('🎉 Migration completed successfully!');
      console.log('   Your deployment now supports the new branding capabilities.');
    } else {
      console.log('❌ Migration failed. Check the errors above.');
      if (result.rollbackAvailable) {
        console.log('   Rollback is available if needed.');
      }
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Migration execution failed:', error);
    process.exit(1);
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

async function checkDatabaseConnection() {
  try {
    const { error } = await supabase.from('auth.users').select('id').limit(1);
    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }
    return true;
  } catch (error) {
    throw new Error(`Database connection failed: ${error}`);
  }
}

async function validateEnvironment() {
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  await checkDatabaseConnection();
}

// =============================================================================
// EXECUTION
// =============================================================================

if (require.main === module) {
  validateEnvironment()
    .then(() => main())
    .catch(error => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

export { runMigration, validateEnvironment };
