/**
 * Client-safe environment configuration
 * 
 * SECURITY: Only expose NEXT_PUBLIC_* variables or explicitly safe values.
 * Never expose server-only environment variables to the client.
 * 
 * Universal Header: @lib/env-client
 */

// Type-safe client environment configuration
interface ClientEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  DEBUG: boolean;
  SAFE_MODE: boolean;
  ENABLE_AI_LIVE: boolean;
  // Build-time environment (safe to expose)
  BUILD_ENV: 'development' | 'preview' | 'production';
}

/**
 * Get client-safe environment configuration
 * This replaces direct process.env usage in client components
 */
export function getClientEnv(): ClientEnv {
  // Only NEXT_PUBLIC_* variables are automatically available on client
  return {
    NODE_ENV: (process.env.NODE_ENV as ClientEnv['NODE_ENV']) || 'development',
    DEBUG: process.env.NEXT_PUBLIC_DEBUG === '1',
    SAFE_MODE: process.env.NEXT_PUBLIC_SAFE_MODE === '1',
    ENABLE_AI_LIVE: process.env.NEXT_PUBLIC_ENABLE_AI_LIVE === '1',
    BUILD_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' 
      ? 'production' 
      : process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' 
        ? 'preview' 
        : 'development'
  };
}

/**
 * Client-safe environment hook
 * Use this instead of direct process.env access in client components
 */
export function useClientEnv(): ClientEnv {
  return getClientEnv();
}

/**
 * Development mode check (client-safe)
 */
export function isDevelopment(): boolean {
  return getClientEnv().NODE_ENV === 'development';
}

/**
 * Production mode check (client-safe)
 */
export function isProduction(): boolean {
  return getClientEnv().NODE_ENV === 'production';
}
