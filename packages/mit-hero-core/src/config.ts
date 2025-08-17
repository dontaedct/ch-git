/**
 * @dct/mit-hero-core
 * MIT Hero Core Configuration
 * 
 * This module provides centralized configuration management for the MIT Hero system,
 * including environment variable loading, validation, and configuration interfaces.
 */

import { getEnv, getEnvConfig } from './env';

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

    const env = getEnv();
    const config = getEnvConfig();
    
    this.serverConfig = {
      supabase: {
        url: config.supabase.url,
        anonKey: config.supabase.anonKey,
        serviceRoleKey: config.supabase.serviceRoleKey,
      },
      coach: {
        defaultId: config.coach.defaultId,
      },
      environment: config.system.environment,
      logging: {
        level: config.system.logLevel,
      },
      concurrency: {
        maxOperations: config.performance.maxConcurrentOperations,
      },
      retry: {
        maxAttempts: config.performance.retryMaxAttempts,
        circuitBreakerThreshold: config.performance.circuitBreakerThreshold,
        circuitBreakerTimeout: config.performance.circuitBreakerTimeout,
      },
    };

    return this.serverConfig;
  }

  /**
   * Get browser-safe public configuration
   */
  getPublicConfig(): PublicConfig {
    if (this.publicConfig) return this.publicConfig;

    const config = getEnvConfig();

    this.publicConfig = {
      supabase: {
        url: config.public.supabaseUrl,
        anonKey: config.public.supabaseAnonKey,
      },
      safeMode: config.public.safeMode,
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
    // Also reset environment loader for testing
    import('./env').then(({ resetEnv }) => resetEnv());
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
