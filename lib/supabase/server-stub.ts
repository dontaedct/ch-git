/**
 * Stub Supabase Server Client
 * 
 * This is a stub implementation that provides the same interface
 * without importing any Supabase packages to avoid client-side bundling issues.
 * 
 * Used for the feature flag system which doesn't require actual Supabase functionality.
 */

// Stub types for server operations
interface StubSupabaseClient {
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
 * Create a stub Supabase client for server-side operations
 * This is a placeholder that throws errors when actually used
 */
export async function createStubSupabaseClient(): Promise<StubSupabaseClient> {
  return {
    auth: {
      getUser: async () => {
        throw new Error('Stub Supabase client - getUser not implemented');
      },
      signInWithPassword: async () => {
        throw new Error('Stub Supabase client - signInWithPassword not implemented');
      },
      signOut: async () => {
        throw new Error('Stub Supabase client - signOut not implemented');
      }
    },
    from: (table: string) => ({
      select: (_columns?: string) => ({
        eq: (_column: string, _value: unknown) => ({
          single: async () => {
            throw new Error(`Stub Supabase client - from(${table}).select().eq().single() not implemented`);
          }
        }),
        update: (_values: Record<string, unknown>) => ({
          eq: (_column: string, _value: unknown) => ({
            select: (_columns?: string) => ({
              single: async () => {
                throw new Error(`Stub Supabase client - from(${table}).select().update().eq().select().single() not implemented`);
              }
            })
          })
        })
      })
    })
  };
}

// Export the stub client function with all the expected names
export { createStubSupabaseClient as createIsolatedSupabaseClient };
export { createStubSupabaseClient as createRealSupabaseClient };
export { createStubSupabaseClient as createServerClient };
export { createStubSupabaseClient as createServerSupabase };
export { createStubSupabaseClient as createServiceRoleClient };
export { createStubSupabaseClient as createServiceRoleSupabase };
