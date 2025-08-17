/**
 * @dct/mit-hero-core
 * MIT Hero Core Configuration
 * 
 * This module provides centralized configuration management for the MIT Hero system,
 * including environment variable loading, validation, and configuration interfaces.
 */

import { z } from 'zod';

// ============================================================================
// ENVIRONMENT SCHEMAS
// ============================================================================

/** Server-side environment configuration schema */
const ServerSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DEFAULT_COACH_ID: z.string().uuid().optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  MAX_CONCURRENT_OPERATIONS: z.coerce.number().int().min(1).max(100).default(10),
  RETRY_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().min(1).max(100).default(5),
  CIRCUIT_BREAKER_TIMEOUT: z.coerce.number().int().min(1000).max(60000).default(30000),
});

/** Browser-safe public environment schema */
const PublicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SAFE_MODE: z.string().optional(),
});

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface ServerConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  coach: {
    defaultId?: string;
  };
  environment: 'development' | 'test' | 'production';
  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  };
  concurrency: {
    maxOperations: number;
  };
  retry: {
    maxAttempts: number;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
  };
}

export interface PublicConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  safeMode: boolean;
}

export interface Config {
  server: ServerConfig;
  public: PublicConfig;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

// ============================================================================
// CONFIGURATION MANAGER
// ============================================================================

class ConfigurationManager {
  private serverConfig: ServerConfig | null = null;
  private publicConfig: PublicConfig | null = null;
  private config: Config | null = null;

  /**
   * Get server-side configuration (server-only)
   */
  getServerConfig(): ServerConfig {
    if (this.serverConfig) return this.serverConfig;

    const parsed = ServerSchema.safeParse(process.env);
    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(`Invalid server environment configuration: ${msg}`);
    }

    const env = parsed.data;
    
    this.serverConfig = {
      supabase: {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      },
      coach: {
        defaultId: env.DEFAULT_COACH_ID,
      },
      environment: env.NODE_ENV,
      logging: {
        level: env.LOG_LEVEL,
      },
      concurrency: {
        maxOperations: env.MAX_CONCURRENT_OPERATIONS,
      },
      retry: {
        maxAttempts: env.RETRY_MAX_ATTEMPTS,
        circuitBreakerThreshold: env.CIRCUIT_BREAKER_THRESHOLD,
        circuitBreakerTimeout: env.CIRCUIT_BREAKER_TIMEOUT,
      },
    };

    return this.serverConfig;
  }

  /**
   * Get browser-safe public configuration
   */
  getPublicConfig(): PublicConfig {
    if (this.publicConfig) return this.publicConfig;

    const parsed = PublicSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_SAFE_MODE: process.env.NEXT_PUBLIC_SAFE_MODE,
    });

    if (!parsed.success) {
      const msg = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new Error(`Invalid public environment configuration: ${msg}`);
    }

    const env = parsed.data;

    this.publicConfig = {
      supabase: {
        url: env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      safeMode: env.NEXT_PUBLIC_SAFE_MODE === '1',
    };

    return this.publicConfig;
  }

  /**
   * Get complete configuration object
   */
  getConfig(): Config {
    if (this.config) return this.config;

    const server = this.getServerConfig();
    const public_ = this.getPublicConfig();

    this.config = {
      server,
      public: public_,
      isDevelopment: server.environment === 'development',
      isProduction: server.environment === 'production',
      isTest: server.environment === 'test',
    };

    return this.config;
  }

  /**
   * Check if safe mode is enabled (dev-only)
   */
  isSafeModeEnabled(): boolean {
    const config = this.getConfig();
    return config.isDevelopment && config.public.safeMode;
  }

  /**
   * Reset cached configuration (useful for testing)
   */
  reset(): void {
    this.serverConfig = null;
    this.publicConfig = null;
    this.config = null;
  }
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_CONFIG: Partial<ServerConfig> = {
  logging: {
    level: 'info',
  },
  concurrency: {
    maxOperations: 10,
  },
  retry: {
    maxAttempts: 3,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 30000,
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export const configManager = new ConfigurationManager();

// Convenience functions
export const getServerConfig = () => configManager.getServerConfig();
export const getPublicConfig = () => configManager.getPublicConfig();
export const getConfig = () => configManager.getConfig();
export const isSafeModeEnabled = () => configManager.isSafeModeEnabled();
