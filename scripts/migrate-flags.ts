/**
 * Migration script to move file-based flags to Supabase
 * 
 * This script migrates existing flags from lib/registry/flags.ts and lib/ai/flags.ts
 * to the new Supabase feature_flags table
 */

import { createServerClient } from '@lib/supabase/server';
import { flags } from '@lib/registry/flags';

interface MigrationFlag {
  key: string;
  enabled: boolean;
  payload: Record<string, unknown>;
  category: 'features' | 'experimental' | 'environment';
}

async function migrateFlags() {
  console.log('🚀 Starting feature flags migration...');
  
  const supabase = await createServerClient();
  
  // Get all existing users (tenants)
  const { data: users, error: usersError } = await supabase
    .from('auth.users')
    .select('id, email');

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  if (!users || users.length === 0) {
    console.log('ℹ️ No users found to migrate flags for');
    return;
  }

  console.log(`📊 Found ${users.length} users to migrate flags for`);

  // Prepare flags for migration
  const flagsToMigrate: MigrationFlag[] = [
    // Core features
    ...Object.entries(flags.features).map(([key, enabled]) => ({
      key,
      enabled,
      payload: { category: 'features', migrated: true },
      category: 'features' as const
    })),
    
    // Experimental features
    ...Object.entries(flags.experimental).map(([key, enabled]) => ({
      key,
      enabled,
      payload: { category: 'experimental', migrated: true },
      category: 'experimental' as const
    })),
    
    // Environment flags (convert to tenant-specific)
    ...Object.entries(flags.environment).map(([key, enabled]) => ({
      key,
      enabled,
      payload: { category: 'environment', migrated: true },
      category: 'environment' as const
    }))
  ];

  console.log(`📋 Prepared ${flagsToMigrate.length} flags for migration`);

  let successCount = 0;
  let errorCount = 0;

  // Migrate flags for each user
  for (const user of users) {
    console.log(`👤 Migrating flags for user: ${user.email}`);
    
    for (const flag of flagsToMigrate) {
      try {
        // Check if flag already exists
        const { data: existing } = await supabase
          .from('feature_flags')
          .select('id')
          .eq('tenant_id', user.id)
          .eq('key', flag.key)
          .single();

        if (existing) {
          console.log(`  ⏭️ Flag ${flag.key} already exists, skipping`);
          continue;
        }

        // Insert the flag
        const { error } = await supabase
          .from('feature_flags')
          .insert({
            tenant_id: user.id,
            key: flag.key,
            enabled: flag.enabled,
            payload: flag.payload
          });

        if (error) {
          console.error(`  ❌ Error inserting flag ${flag.key}:`, error);
          errorCount++;
        } else {
          console.log(`  ✅ Migrated flag: ${flag.key} = ${flag.enabled}`);
          successCount++;
        }
      } catch (error) {
        console.error(`  ❌ Unexpected error for flag ${flag.key}:`, error);
        errorCount++;
      }
    }
  }

  console.log('\n📊 Migration Summary:');
  console.log(`  ✅ Successfully migrated: ${successCount} flags`);
  console.log(`  ❌ Errors: ${errorCount} flags`);
  console.log(`  👥 Users processed: ${users.length}`);
  
  if (errorCount === 0) {
    console.log('🎉 Migration completed successfully!');
  } else {
    console.log('⚠️ Migration completed with errors. Please review the logs above.');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateFlags().catch(console.error);
}

export { migrateFlags };
