#!/usr/bin/env node

/**
 * Simple migration runner for Supabase
 * Runs SQL migration files against the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function runMigration(migrationPath) {
  const migrationName = path.basename(migrationPath);
  console.log(`🔄 Running migration: ${migrationName}`);

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split SQL by semicolons and filter out empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_dummy')
            .select('*')
            .limit(0); // This will fail, but let's try the direct approach

          // Use the SQL directly
          const response = await fetch(`${supabaseUrl}/rest/v1/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/sql',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: statement
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }
        }
      }
    }

    console.log(`✅ Migration completed: ${migrationName}`);
    return true;
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationName}`);
    console.error(`Error: ${error.message}`);
    return false;
  }
}

async function main() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');

  // Get the specific tenant apps migration
  const migrationFile = '20250918_tenant_apps_schema.sql';
  const migrationPath = path.join(migrationsDir, migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    process.exit(1);
  }

  console.log('🚀 Starting database migration...');
  console.log(`📁 Migrations directory: ${migrationsDir}`);
  console.log(`🎯 Database: ${supabaseUrl}`);

  const success = await runMigration(migrationPath);

  if (success) {
    console.log('🎉 All migrations completed successfully!');
    process.exit(0);
  } else {
    console.log('💥 Migration failed!');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});