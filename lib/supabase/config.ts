/**
 * 🚀 MIT HERO SYSTEM - SUPABASE CONFIGURATION
 * 
 * Centralized configuration management for Supabase integration
 * with environment validation and fallback values.
 */

// Environment variable validation
function getRequiredEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getOptionalEnvVar(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

// Supabase configuration
export const supabaseConfig = {
  // Required environment variables
  url: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
  anonKey: getRequiredEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  serviceKey: getOptionalEnvVar('SUPABASE_SERVICE_ROLE_KEY'),
  
  // Optional configuration
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' as const,
  },
  
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
    heartbeatIntervalMs: 30000,
    reconnectAfterMs: (tries: number) => Math.min(tries * 1000, 30000),
  },
  
  global: {
    headers: {
      'x-application-name': 'my-app',
      'x-application-version': process.env.npm_package_version || '1.0.0',
    },
  },
  
  // Connection settings
  db: {
    schema: 'public',
    maxRetries: 3,
    retryDelay: 1000,
    timeout: 30000,
  },
  
  // Feature flags
  features: {
    realtime: process.env.NODE_ENV !== 'test',
    auth: true,
    storage: true,
    edgeFunctions: true,
  },
  
  // Development overrides
  development: {
    debug: process.env.NODE_ENV === 'development',
    logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  },
} as const;

// Environment validation
export function validateSupabaseConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Check required variables
    if (!supabaseConfig.url) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
    }
    
    if (!supabaseConfig.anonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }
    
    // Validate URL format
    try {
      new URL(supabaseConfig.url);
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL must be a valid URL');
    }
    
    // Validate key format (basic check)
    if (supabaseConfig.anonKey.length < 20) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid');
    }
    
  } catch (error) {
    errors.push(`Configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Runtime configuration helpers
export function isSupabaseEnabled(): boolean {
  return !!(supabaseConfig.url && supabaseConfig.anonKey);
}

export function isRealtimeEnabled(): boolean {
  return supabaseConfig.features.realtime && process.env.NODE_ENV !== 'test';
}

export function isAuthEnabled(): boolean {
  return supabaseConfig.features.auth;
}

export function isStorageEnabled(): boolean {
  return supabaseConfig.features.storage;
}

export function isEdgeFunctionsEnabled(): boolean {
  return supabaseConfig.features.edgeFunctions;
}

// Configuration for different environments
export const environmentConfig = {
  development: {
    ...supabaseConfig,
    development: {
      ...supabaseConfig.development,
      debug: true,
      logLevel: 'debug',
    },
  },
  
  production: {
    ...supabaseConfig,
    development: {
      ...supabaseConfig.development,
      debug: false,
      logLevel: 'error',
    },
    realtime: {
      ...supabaseConfig.realtime,
      heartbeatIntervalMs: 60000, // Longer heartbeat in production
    },
  },
  
  test: {
    ...supabaseConfig,
    features: {
      ...supabaseConfig.features,
      realtime: false, // Disable realtime in tests
    },
    development: {
      ...supabaseConfig.development,
      debug: false,
      logLevel: 'error',
    },
  },
} as const;

// Get configuration for current environment
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV || 'development';
  return environmentConfig[env as keyof typeof environmentConfig] || environmentConfig.development;
}

// Export default configuration
export default supabaseConfig;
