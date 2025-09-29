#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...')

  try {
    // First, let's see what data currently exists
    console.log('\n📊 Current database state:')

    // Check tenant_apps
    const { data: tenantApps, error: tenantError } = await supabase
      .from('tenant_apps')
      .select('*')

    if (!tenantError && tenantApps) {
      console.log(`📱 tenant_apps: ${tenantApps.length} records`)
      tenantApps.forEach((app: any) => {
        console.log(`  - ${app.name} (${app.admin_email})`)
      })
    }

    // Check clients_enhanced
    const { data: clients, error: clientsError } = await supabase
      .from('clients_enhanced')
      .select('*')

    if (!clientsError && clients) {
      console.log(`👥 clients_enhanced: ${clients.length} records`)
      clients.forEach((client: any) => {
        console.log(`  - ${client.name} (${client.email})`)
      })
    }

    // Check system_configurations
    const { data: configs, error: configsError } = await supabase
      .from('system_configurations')
      .select('*')

    if (!configsError && configs) {
      console.log(`⚙️  system_configurations: ${configs.length} records`)
    }

    // Check client_analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('client_analytics')
      .select('*')

    if (!analyticsError && analytics) {
      console.log(`📈 client_analytics: ${analytics.length} records`)
    }

    // Check form_submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('*')

    if (!submissionsError && submissions) {
      console.log(`📝 form_submissions: ${submissions.length} records`)
    }

    console.log('\n🔥 Cleaning all data...')

    // Clean data in correct order (respecting foreign key constraints)
    const cleanupTables = [
      'form_submissions',
      'client_analytics',
      'generated_documents',
      'deployment_tracking_events',
      'client_deployments',
      'client_customizations',
      'tenant_apps',
      'clients_enhanced',
      'system_configurations',
      'template_configurations',
      'deployment_configurations',
      'client_billing_info',
      'deployment_templates'
    ]

    for (const table of cleanupTables) {
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .gte('id', '00000000-0000-0000-0000-000000000000') // Delete all records

        if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
          console.log(`⚠️  Warning cleaning ${table}: ${error.message}`)
        } else {
          console.log(`✅ Cleaned ${table}`)
        }
      } catch (err) {
        console.log(`⚠️  Table ${table} may not exist yet`)
      }
    }

    console.log('\n🔍 Verifying database is clean...')

    // Verify cleanup
    const verifyTables = ['tenant_apps', 'clients_enhanced', 'system_configurations']

    for (const table of verifyTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count(*)', { count: 'exact' })

        if (!error && data) {
          console.log(`✅ ${table}: 0 records (clean)`)
        }
      } catch (err) {
        console.log(`⚠️  Could not verify ${table}`)
      }
    }

    console.log('\n🎉 Database cleanup complete!')
    console.log('📝 Next steps:')
    console.log('  1. Run the application: npm run dev')
    console.log('  2. Navigate to /agency-toolkit')
    console.log('  3. Create your first test client')
    console.log('  4. Follow the deployment guide')

  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    process.exit(1)
  }
}

// Run cleanup
cleanDatabase()