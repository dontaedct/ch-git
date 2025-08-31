import { z } from "zod";

/**
 * Enhanced Environment Schema - Phase 1, Task 2
 * Implements typed env validation with warn-but-run philosophy
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

// =============================================================================
// CORE APPLICATION CONFIGURATION
// =============================================================================

const AppConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.string().optional().default("3000"),
  APP_TIER: z.enum(["starter", "pro", "advanced"]).optional().default("starter"),
  APP_PRESET: z.string().optional().default("salon-waitlist"),
  CI: z.string().optional(),
  VERCEL_ENV: z.string().optional(),
});

// =============================================================================
// INTEGRATION SERVICES  
// =============================================================================

const IntegrationsSchema = z.object({
  // Supabase Database
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_DB_URL: z.string().optional(),

  // Email Services (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM: z.string().email().optional(),
  // Background jobs / digests
  DIGEST_RECIPIENTS: z.string().optional(),

  // Payment Processing (Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Automation & Workflows (n8n)
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().optional(),
  N8N_WEBHOOK_TIMEOUT: z.string().optional(),
  N8N_WEBHOOK_MAX_RETRIES: z.string().optional(),

  // Notifications
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  // CI/CD
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO: z.string().optional(),
});

// =============================================================================
// SECURITY & OBSERVABILITY
// =============================================================================

const SecuritySchema = z.object({
  // Error Tracking (Sentry)
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Security & Cron
  CRON_SECRET: z.string().optional(),
  
  // Development & Debugging (Public flags)
  NEXT_PUBLIC_DEBUG: z.string().optional(),
  NEXT_PUBLIC_SAFE_MODE: z.string().optional(),
  NEXT_PUBLIC_ENABLE_AI_LIVE: z.string().optional(),
  NEXT_PUBLIC_DISABLE_REDIRECTS: z.string().optional(),
});

// =============================================================================
// OBSERVABILITY & MONITORING
// =============================================================================

const ObservabilitySchema = z.object({
  // Feature flags
  FEATURE_FLAGS_ENABLED: z.string().optional().default("true"),
  
  // Performance monitoring
  PERFORMANCE_MONITORING_ENABLED: z.string().optional(),
  
  // Health checks
  HEALTH_CHECK_ENABLED: z.string().optional().default("true"),
  
  // Development automation
  AUTO: z.string().optional(),
});

// =============================================================================
// COMBINED SCHEMA
// =============================================================================

const EnvironmentSchema = z.object({
  ...AppConfigSchema.shape,
  ...IntegrationsSchema.shape,
  ...SecuritySchema.shape,
  ...ObservabilitySchema.shape,
});

type Environment = z.infer<typeof EnvironmentSchema>;

// =============================================================================
// SECURITY CLASSIFICATION
// =============================================================================

const SECURITY_LEVELS = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE', 
  CRITICAL: 'CRITICAL',
} as const;

const SECURITY_CLASSIFICATION: Record<string, keyof typeof SECURITY_LEVELS> = {
  // Public variables (NEXT_PUBLIC_*)
  NEXT_PUBLIC_SUPABASE_URL: 'PUBLIC',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'PUBLIC',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'PUBLIC',
  NEXT_PUBLIC_SENTRY_DSN: 'PUBLIC',
  NEXT_PUBLIC_DEBUG: 'PUBLIC',
  NEXT_PUBLIC_SAFE_MODE: 'PUBLIC',
  NEXT_PUBLIC_ENABLE_AI_LIVE: 'PUBLIC',
  NEXT_PUBLIC_DISABLE_REDIRECTS: 'PUBLIC',
  NEXT_PUBLIC_VERCEL_ENV: 'PUBLIC',
  
  // Private server-only
  SUPABASE_SERVICE_ROLE_KEY: 'CRITICAL',
  SUPABASE_DB_URL: 'CRITICAL',
  RESEND_API_KEY: 'PRIVATE',
  STRIPE_SECRET_KEY: 'CRITICAL',
  STRIPE_WEBHOOK_SECRET: 'CRITICAL',
  N8N_WEBHOOK_SECRET: 'PRIVATE',
  SENTRY_DSN: 'PRIVATE',
  CRON_SECRET: 'PRIVATE',
  GITHUB_TOKEN: 'PRIVATE',
  
  // Regular private
  RESEND_FROM: 'PRIVATE',
  N8N_WEBHOOK_URL: 'PRIVATE',
  SLACK_WEBHOOK_URL: 'PRIVATE',
};

// =============================================================================
// FEATURE IMPACT MAPPING
// =============================================================================

const FEATURE_DEPENDENCIES: Record<string, { feature: string; required: boolean; impact: string }> = {
  NEXT_PUBLIC_SUPABASE_URL: { feature: 'database', required: true, impact: 'Complete database access disabled' },
  NEXT_PUBLIC_SUPABASE_ANON_KEY: { feature: 'database', required: true, impact: 'Client-side queries disabled' },
  SUPABASE_SERVICE_ROLE_KEY: { feature: 'admin_operations', required: true, impact: 'Admin operations disabled' },
  RESEND_API_KEY: { feature: 'email', required: false, impact: 'Email functionality disabled' },
  STRIPE_SECRET_KEY: { feature: 'payments', required: false, impact: 'Payment processing disabled' },
  STRIPE_WEBHOOK_SECRET: { feature: 'webhooks', required: false, impact: 'Payment webhooks disabled' },
  N8N_WEBHOOK_URL: { feature: 'automation', required: false, impact: 'Workflow automation disabled' },
  SLACK_WEBHOOK_URL: { feature: 'notifications', required: false, impact: 'Slack notifications disabled' },
  SENTRY_DSN: { feature: 'error_tracking', required: false, impact: 'Error tracking disabled' },
};

// =============================================================================
// PLACEHOLDER VALUES
// =============================================================================

const PLACEHOLDERS: Record<string, string> = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'PLACEHOLDER_SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY: 'PLACEHOLDER_SUPABASE_SERVICE_KEY',
  RESEND_API_KEY: 'PLACEHOLDER_RESEND_API_KEY',
  STRIPE_SECRET_KEY: 'PLACEHOLDER_STRIPE_SECRET_KEY',
  STRIPE_WEBHOOK_SECRET: 'PLACEHOLDER_STRIPE_WEBHOOK_SECRET',
  N8N_WEBHOOK_URL: 'https://placeholder.n8n.webhook.com',
  N8N_WEBHOOK_SECRET: 'PLACEHOLDER_N8N_WEBHOOK_SECRET',
  SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/PLACEHOLDER/WEBHOOK/URL',
  SENTRY_DSN: 'PLACEHOLDER_SENTRY_DSN',
  CRON_SECRET: 'PLACEHOLDER_CRON_SECRET',
  GITHUB_TOKEN: 'PLACEHOLDER_GITHUB_TOKEN',
};

// =============================================================================
// CACHED ENVIRONMENT
// =============================================================================

let environmentCache: Environment | null = null;
let validationWarnings: string[] = [];

/**
 * Get validated environment with warn-but-run fallbacks
 */
export function getEnv(): Environment {
  if (environmentCache) {
    return environmentCache;
  }

  // Always build fallback environment with placeholders first
  const fallbackEnv = buildFallbackEnvironment();
  const result = EnvironmentSchema.safeParse(fallbackEnv);
  
  if (!result.success) {
    // Capture validation errors
    validationWarnings = result.error.errors.map(e => 
      `${e.path.join('.')}: ${e.message}`
    );

    // Log warnings in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('🟡 Environment validation warnings:');
      validationWarnings.forEach(warning => console.warn(`  • ${warning}`));
    }

    // Return fallback environment even if validation fails
    environmentCache = fallbackEnv;
  } else {
    environmentCache = result.data;
  }

  return environmentCache;
}

/**
 * Build fallback environment with placeholders
 */
function buildFallbackEnvironment(): Environment {
  const env = { ...process.env } as Record<string, string | undefined>;
  
  // Apply placeholders for missing critical values
  Object.entries(PLACEHOLDERS).forEach(([key, placeholder]) => {
    if (!env[key] || env[key] === '') {
      env[key] = placeholder;
    }
  });

  // Ensure required defaults
  env.NODE_ENV = env.NODE_ENV ?? 'development';
  env.PORT = env.PORT ?? '3000';
  env.APP_TIER = env.APP_TIER ?? 'starter';
  env.FEATURE_FLAGS_ENABLED = env.FEATURE_FLAGS_ENABLED ?? 'true';
  env.HEALTH_CHECK_ENABLED = env.HEALTH_CHECK_ENABLED ?? 'true';

  return env as Environment;
}

/**
 * Get public environment (NEXT_PUBLIC_* only)
 */
export function getPublicEnv() {
  const env = getEnv();
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ?? PLACEHOLDERS.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PLACEHOLDERS.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SENTRY_DSN: env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_DEBUG: env.NEXT_PUBLIC_DEBUG,
    NEXT_PUBLIC_SAFE_MODE: env.NEXT_PUBLIC_SAFE_MODE,
    NEXT_PUBLIC_ENABLE_AI_LIVE: env.NEXT_PUBLIC_ENABLE_AI_LIVE,
    NEXT_PUBLIC_DISABLE_REDIRECTS: env.NEXT_PUBLIC_DISABLE_REDIRECTS,
    NEXT_PUBLIC_VERCEL_ENV: env.VERCEL_ENV,
    NODE_ENV: env.NODE_ENV,
  };
}

/**
 * Check if environment variable is using placeholder
 */
export function isPlaceholder(key: string): boolean {
  const env = getEnv();
  const value = env[key as keyof Environment];
  const placeholder = PLACEHOLDERS[key];
  
  return value === placeholder;
}

/**
 * Get environment variable status for diagnostics
 */
export function getVariableStatus(key: string) {
  const env = getEnv();
  const value = env[key as keyof Environment];
  const dependency = FEATURE_DEPENDENCIES[key];
  const securityLevel = SECURITY_CLASSIFICATION[key] || 'PRIVATE';
  const placeholder = PLACEHOLDERS[key];
  
  return {
    key,
    value: value ? '***SET***' : undefined,
    required: dependency?.required || false,
    securityLevel,
    usingPlaceholder: value === placeholder,
    featureImpact: dependency?.impact || 'No impact',
    feature: dependency?.feature || 'unknown',
  };
}

/**
 * Get all environment status for diagnostics
 */
export function getAllVariableStatus() {
  const allKeys = Object.keys({ ...PLACEHOLDERS, ...FEATURE_DEPENDENCIES });
  return allKeys.map(getVariableStatus);
}

/**
 * Get validation warnings
 */
export function getValidationWarnings(): string[] {
  return [...validationWarnings];
}

/**
 * Clear environment cache (for testing)
 */
export function clearEnvironmentCache(): void {
  environmentCache = null;
  validationWarnings = [];
}

/**
 * Environment health check
 */
export function checkEnvironmentHealth() {
  const warnings = getValidationWarnings();
  
  const criticalMissing = Object.entries(FEATURE_DEPENDENCIES)
    .filter(([key, dep]) => dep.required && isPlaceholder(key))
    .map(([key]) => key);

  const optionalMissing = Object.entries(FEATURE_DEPENDENCIES)
    .filter(([key, dep]) => !dep.required && isPlaceholder(key))
    .map(([key]) => key);

  return {
    status: criticalMissing.length > 0 ? 'critical' : warnings.length > 0 ? 'warning' : 'healthy',
    criticalMissing,
    optionalMissing,
    warnings,
    placeholdersInUse: Object.keys(PLACEHOLDERS).filter(isPlaceholder),
  };
}

// Export types for use in other modules
export type { Environment };
export { SECURITY_LEVELS, FEATURE_DEPENDENCIES, PLACEHOLDERS };
