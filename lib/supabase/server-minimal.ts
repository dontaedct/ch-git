/**
 * Minimal Supabase Server Client
 * 
 * This is a stripped-down version that only includes essential functionality
 * to avoid client-side bundling issues in server builds.
 */

// Minimal types for server operations
interface MinimalSupabaseClient {
  auth: {
    getUser(): Promise<{ data: { user: unknown } | null; error: unknown }>;
    signInWithPassword(credentials: { email: string; password: string }): Promise<{ 
      data: { user: unknown; session: unknown } | null; 
      error: unknown 
    }>;
    signOut(): Promise<{ error: unknown }>;
  };
  from(table: string): {
    select(columns?: string): {
      eq(column: string, value: unknown): {
        single(): Promise<{ data: unknown; error: unknown }>;
      };
      update(values: Record<string, unknown>): {
        eq(column: string, value: unknown): {
          select(columns?: string): {
            single(): Promise<{ data: unknown; error: unknown }>;
          };
        };
      };
    };
  };
}

/**
 * Create a minimal Supabase client for server-side operations
 */
export async function createMinimalSupabaseClient(): Promise<MinimalSupabaseClient> {
  // Only import the core client, not the full package
  const { createClient } = await import('@supabase/supabase-js/dist/module/index.js');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables (URL or Service Role Key)');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }) as unknown as MinimalSupabaseClient;
}

// Export the minimal client function
export { createMinimalSupabaseClient as createIsolatedSupabaseClient };
export { createMinimalSupabaseClient as createRealSupabaseClient };
export { createMinimalSupabaseClient as createServerClient };
export { createMinimalSupabaseClient as createServerSupabase };
export { createMinimalSupabaseClient as createServiceRoleClient };
export { createMinimalSupabaseClient as createServiceRoleSupabase };
