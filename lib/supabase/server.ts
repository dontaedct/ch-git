// COMPLETELY ISOLATED Supabase client - DO NOT IMPORT IN SERVER COMPONENTS
// This file should ONLY be imported by API routes and server actions

// Re-export the User type for compatibility
export type { User } from '@/lib/auth/guard'

// Create a completely isolated Supabase client
// This function is ONLY called from API routes and server actions
export async function createIsolatedSupabaseClient() {
  // Dynamic import to avoid bundling in server components
  // Use a more specific import path to avoid client-side code
  const { createClient } = await import('@supabase/supabase-js/dist/module/index.js')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)')
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  })
}

// Legacy function names that now use the isolated client
export async function createRealSupabaseClient() {
  return createIsolatedSupabaseClient()
}

export async function createServerClient() {
  return createIsolatedSupabaseClient()
}

export async function createServerSupabase() {
  return createIsolatedSupabaseClient()
}

export async function createServiceRoleClient() {
  return createIsolatedSupabaseClient()
}

export async function createServiceRoleSupabase() {
  return createIsolatedSupabaseClient()
}
