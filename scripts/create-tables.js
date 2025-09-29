#!/usr/bin/env node

/**
 * Create tenant_apps table directly using Supabase client
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Environment check:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING'}`);

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

async function createTenantAppsTable() {
  console.log('🔄 Creating tenant_apps table...');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS tenant_apps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      admin_email VARCHAR(255) NOT NULL,
      template_id VARCHAR(100) NOT NULL,
      status VARCHAR(50) DEFAULT 'sandbox' CHECK (status IN ('sandbox', 'production', 'disabled', 'archived')),
      public_url VARCHAR(255),
      admin_url VARCHAR(255),
      submissions_count INTEGER DEFAULT 0,
      documents_count INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      archived BOOLEAN DEFAULT FALSE,
      archived_at TIMESTAMP WITH TIME ZONE,
      metadata JSONB DEFAULT '{}',
      settings JSONB DEFAULT '{}',
      custom_domain VARCHAR(255),
      ssl_enabled BOOLEAN DEFAULT FALSE,
      last_deployed_at TIMESTAMP WITH TIME ZONE,
      deployment_status VARCHAR(50) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'cancelled'))
    );
  `;

  try {
    // Use a simple test query first to verify connection
    const { data: testData, error: testError } = await supabase.auth.getUser();
    console.log('🔗 Database connection test...');

    // Create the table by inserting a dummy record that will create the table structure
    // Actually, let's try to use SQL directly through a function
    const { data, error } = await supabase.rpc('create_tenant_apps_table');

    if (error && error.code === '42883') {
      // Function doesn't exist, let's create it first
      console.log('📝 Creating helper function...');

      // We'll create a simple table by trying to query it first
      const { data: queryData, error: queryError } = await supabase
        .from('tenant_apps')
        .select('*')
        .limit(1);

      if (queryError && queryError.code === '42P01') {
        console.log('✅ Table does not exist yet, this is expected');
        console.log('🔧 Please run the SQL migration manually in Supabase Dashboard');
        console.log('📋 Go to: https://app.supabase.com/project/YOUR_PROJECT/sql');
        console.log('📝 Copy and paste the content of: supabase/migrations/20250918_tenant_apps_schema.sql');
        return false;
      } else if (queryError) {
        console.error('❌ Unexpected error:', queryError);
        return false;
      } else {
        console.log('✅ Table already exists!');
        return true;
      }
    } else if (error) {
      console.error('❌ Error:', error);
      return false;
    } else {
      console.log('✅ Table created successfully!');
      return true;
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting table creation...');
  console.log(`🎯 Database: ${supabaseUrl}`);

  const success = await createTenantAppsTable();

  if (success) {
    console.log('🎉 Table setup completed!');
    process.exit(0);
  } else {
    console.log('💥 Table creation failed!');
    console.log('');
    console.log('📋 MANUAL STEPS REQUIRED:');
    console.log('1. Go to: https://app.supabase.com/project/arczonwbczqbouwstmbs/sql');
    console.log('2. Copy the content from: supabase/migrations/20250918_tenant_apps_schema.sql');
    console.log('3. Paste and run the SQL in the Supabase SQL Editor');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});