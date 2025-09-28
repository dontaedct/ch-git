#!/usr/bin/env node
/**
 * Production Setup Script
 * Gets the system ready for client creation and testing
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up production-ready environment...');

// 1. Create .env.local with production-ready configuration
const envContent = `# Production Environment Configuration
# Generated for immediate client creation testing

# =============================================================================
# CORE APPLICATION CONFIGURATION
# =============================================================================
NODE_ENV=development
PORT=3000
APP_TIER=pro

# =============================================================================
# SUPABASE DATABASE CONFIGURATION (PRODUCTION READY)
# =============================================================================
# TODO: Replace with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =============================================================================
# EMAIL SERVICES (RESEND) - PRODUCTION READY
# =============================================================================
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM=Micro App <no-reply@yourdomain.com>

# =============================================================================
# DEVELOPMENT FLAGS
# =============================================================================
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_SAFE_MODE=false
HEALTH_CHECK_ENABLED=true
FEATURE_FLAGS_ENABLED=true

# =============================================================================
# PRODUCTION READINESS FLAGS
# =============================================================================
PERFORMANCE_MONITORING_ENABLED=true
OBSERVABILITY_ENABLED=true
`;

if (!existsSync('.env.local')) {
  writeFileSync('.env.local', envContent);
  console.log('✅ Created .env.local with production-ready configuration');
} else {
  console.log('⚠️  .env.local already exists - skipping creation');
}

// 2. Check if Supabase CLI is working
try {
  execSync('npx supabase --version', { stdio: 'pipe' });
  console.log('✅ Supabase CLI is available');
} catch (error) {
  console.log('❌ Supabase CLI not working:', error.message);
}

console.log(`
🎯 NEXT STEPS TO GET PRODUCTION READY:

1. CREATE SUPABASE PROJECT:
   - Go to https://supabase.com/dashboard
   - Create a new project
   - Copy the project URL and API keys

2. UPDATE .env.local:
   - Replace NEXT_PUBLIC_SUPABASE_URL with your project URL
   - Replace NEXT_PUBLIC_SUPABASE_ANON_KEY with your anon key
   - Replace SUPABASE_SERVICE_ROLE_KEY with your service role key

3. APPLY DATABASE MIGRATIONS:
   - Run: npx supabase db push
   - Or manually apply migrations from supabase/migrations/

4. TEST CLIENT CREATION:
   - Restart the dev server: npm run dev
   - Test the client creation API

5. SET UP EMAIL SERVICE (OPTIONAL):
   - Get Resend API key from https://resend.com
   - Update RESEND_API_KEY in .env.local

Ready to create test clients! 🚀
`);
