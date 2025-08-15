// Minimal auth guard that doesn't import Supabase
// This prevents bundling issues in server components

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
  app_metadata?: {
    roles?: string[];
    [key: string]: unknown;
  };
  aud: string;
  created_at: string;
  role?: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone?: string | null;
  phone_confirmed_at?: string | null;
  last_sign_in_at?: string;
  identities?: unknown[];
  factors?: unknown[];
}

// Minimal client interface that doesn't import Supabase
export interface MinimalAuthClient {
  auth: {
    getUser: () => Promise<{ data: { user: User } | null; error: Error | null }>
    getSession: () => Promise<{ data: { session: unknown } | null; error: Error | null }>
  }
}

function debugLog(message: string, data?: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log(`[Auth Guard] ${message}`, data ?? '');
  }
}

function formatReason(reason: string, details?: unknown): string {
  return `Authentication failed: ${reason}${details ? ` (${JSON.stringify(details)})` : ''}`;
}

export async function requireUser(): Promise<{
  user: User;
  supabase: MinimalAuthClient
}> {
  debugLog('requireUser: Starting authentication check');
  
  // This function should be called from API routes or server actions
  // where the real Supabase client is available
  throw new Error('requireUser must be called from API routes or server actions with real Supabase client');
}

export async function getUserOrFail(supabase: MinimalAuthClient): Promise<User> {
  debugLog('getUserOrFail: Starting user validation');
  
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      debugLog('getUserOrFail: Auth error', authError);
      throw new Error(formatReason('Authentication error', authError.message));
    }
    
    if (!authData?.user) {
      debugLog('getUserOrFail: No user found');
      throw new Error(formatReason('No authenticated user found'));
    }
    
    const user = authData.user;
    debugLog('getUserOrFail: User validated successfully', { userId: user.id });
    
    return user;
  } catch (error) {
    debugLog('getUserOrFail: Unexpected error', error);
    throw error;
  }
}
