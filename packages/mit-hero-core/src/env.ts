/**
 * @dct/mit-hero-core
 * MIT Hero Core Environment Configuration
 * 
 * This module provides centralized environment variable loading, validation,
 * and error handling for the MIT Hero system.
 */

import { z } from 'zod';

// ============================================================================
// ENVIRONMENT SCHEMAS
// ============================================================================

/** Core environment configuration schema */
const EnvSchema = z.object({
  // Supabase Configuration
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  
  // Next.js Public Environment Variables (for browser compatibility)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_SAFE_MODE: z.string().optional(),
  
  // Optional Integrations
  RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY is required if using email functionality').optional(),
  SLACK_WEBHOOK_URL: z.string().url('SLACK_WEBHOOK_URL must be a valid URL if provided').optional(),
  
  // System Configuration
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  
  // Performance Configuration
  MAX_CONCURRENT_OPERATIONS: z.coerce.number().int().min(1).max(100).default(10),
  RETRY_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  CIRCUIT_BREAKER_THRESHOLD: z.coerce.number().int().min(1).max(100).default(5),
  CIRCUIT_BREAKER_TIMEOUT: z.coerce.number().int().min(1000).max(60000).default(30000),
  
  // Optional Coach Configuration
  DEFAULT_COACH_ID: z.string().uuid('DEFAULT_COACH_ID must be a valid UUID if provided').optional(),
});

// ============================================================================
// ENVIRONMENT INTERFACES
// ============================================================================

export type Env = z.infer<typeof EnvSchema>;

export interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  public: {
    supabaseUrl: string;
    supabaseAnonKey: string;
    safeMode: boolean;
  };
  integrations: {
    resendApiKey?: string;
    slackWebhookUrl?: string;
  };
  system: {
    environment: 'development' | 'test' | 'production';
    logLevel: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  };
  performance: {
    maxConcurrentOperations: number;
    retryMaxAttempts: number;
    circuitBreakerThreshold: number;
    circuitBreakerTimeout: number;
  };
  coach: {
    defaultId?: string;
  };
}

// ============================================================================
// ENVIRONMENT LOADER
// ============================================================================

class EnvironmentLoader {
  private static instance: EnvironmentLoader;
  private env: Env | null = null;
  private config: EnvConfig | null = null;

  private constructor() {}

  static getInstance(): EnvironmentLoader {
    if (!EnvironmentLoader.instance) {
      EnvironmentLoader.instance = new EnvironmentLoader();
    }
    return EnvironmentLoader.instance;
  }

  /**
   * Get validated environment variables
   * @throws {Error} If required environment variables are missing or invalid
   */
  getEnv(): Env {
    if (this.env) return this.env;

    try {
      const parsed = EnvSchema.safeParse(process.env);
      
      if (!parsed.success) {
        const missingKeys = parsed.error.errors
          .filter(e => e.code === 'invalid_type' && e.received === 'undefined')
          .map(e => e.path.join('.'))
          .filter(key => !key.startsWith('RESEND_API_KEY') && !key.startsWith('SLACK_WEBHOOK_URL')); // These are optional
        
        const invalidKeys = parsed.error.errors
          .filter(e => e.code !== 'invalid_type' || e.received !== 'undefined')
          .map(e => `${e.path.join('.')}: ${e.message}`);

        let errorMessage = 'Environment configuration error:\n\n';
        
        if (missingKeys.length > 0) {
          errorMessage += `❌ Missing required environment variables:\n`;
          errorMessage += missingKeys.map(key => `   • ${key}`).join('\n');
          errorMessage += '\n';
        }
        
        if (invalidKeys.length > 0) {
          errorMessage += `❌ Invalid environment variables:\n`;
          errorMessage += invalidKeys.map(key => `   • ${key}`).join('\n');
          errorMessage += '\n';
        }
        
        errorMessage += `💡 To fix this:\n`;
        errorMessage += `   1. Copy .env.example to .env\n`;
        errorMessage += `   2. Fill in the required values\n`;
        errorMessage += `   3. For Vercel: Add these to your project's environment variables\n\n`;
        errorMessage += `📁 See .env.example for all required variables`;
        
        throw new Error(errorMessage);
      }

      this.env = parsed.data;
      return this.env;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to load environment configuration');
    }
  }

  /**
   * Get processed environment configuration
   */
  getConfig(): EnvConfig {
    if (this.config) return this.config;

    const env = this.getEnv();
    
    this.config = {
      supabase: {
        url: env.SUPABASE_URL,
        anonKey: env.SUPABASE_ANON_KEY,
        serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
      },
      public: {
        supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        safeMode: env.NEXT_PUBLIC_SAFE_MODE === '1',
      },
      integrations: {
        resendApiKey: env.RESEND_API_KEY,
        slackWebhookUrl: env.SLACK_WEBHOOK_URL,
      },
      system: {
        environment: env.NODE_ENV,
        logLevel: env.LOG_LEVEL,
      },
      performance: {
        maxConcurrentOperations: env.MAX_CONCURRENT_OPERATIONS,
        retryMaxAttempts: env.RETRY_MAX_ATTEMPTS,
        circuitBreakerThreshold: env.CIRCUIT_BREAKER_THRESHOLD,
        circuitBreakerTimeout: env.CIRCUIT_BREAKER_TIMEOUT,
      },
      coach: {
        defaultId: env.DEFAULT_COACH_ID,
      },
    };

    return this.config;
  }

  /**
   * Reset cached configuration (useful for testing)
   */
  reset(): void {
    this.env = null;
    this.config = null;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

const envLoader = EnvironmentLoader.getInstance();

/**
 * Get validated environment variables
 * @throws {Error} If required environment variables are missing or invalid
 */
export const getEnv = (): Env => envLoader.getEnv();

/**
 * Get processed environment configuration
 */
export const getEnvConfig = (): EnvConfig => envLoader.getConfig();

/**
 * Reset cached configuration (useful for testing)
 */
export const resetEnv = (): void => envLoader.reset();

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Types are already exported above, no need to re-export
