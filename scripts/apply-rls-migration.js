/**
 * Apply Enhanced RLS Migration Script
 * 
 * This script applies the enhanced RLS security policies to the database
 * using the Supabase service role client for administrative operations.
 */

const fs = require('fs');
const path = require('path');

async function applyRLSMigration() {
  try {
    console.log('🚀 Starting Enhanced RLS Migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_enhance_rls_security.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration file loaded successfully');
    console.log(`📊 Migration size: ${(migrationSQL.length / 1024).toFixed(2)} KB`);
    
    // Check if we have the required environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:');
      missingVars.forEach(varName => console.error(`   - ${varName}`));
      console.error('\nPlease ensure these are set in your .env.local file');
      return;
    }
    
    console.log('✅ Environment variables validated');
    
    // Import Supabase client dynamically
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );
    
    console.log('🔌 Supabase client created with service role');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;
      
      try {
        console.log(`\n🔄 Executing statement ${i + 1}/${statements.length}...`);
        console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          // Try direct execution for DDL statements
          const { error: directError } = await supabase.rpc('exec_sql', { 
            sql: statement + ';' 
          });
          
          if (directError) {
            console.error(`❌ Statement ${i + 1} failed:`, directError.message);
            errorCount++;
            continue;
          }
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
        
      } catch (stmtError) {
        console.error(`❌ Statement ${i + 1} failed with exception:`, stmtError.message);
        errorCount++;
      }
    }
    
    console.log('\n🎯 Migration Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📊 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Enhanced RLS Migration completed successfully!');
      console.log('🔒 Your database now has enterprise-grade security policies');
    } else {
      console.log('\n⚠️  Migration completed with some errors');
      console.log('Please review the failed statements and retry if necessary');
    }
    
  } catch (error) {
    console.error('💥 Migration failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  applyRLSMigration();
}

module.exports = { applyRLSMigration };
