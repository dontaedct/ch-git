/**
 * Fail-fast environment validation for server-side critical variables
 * 
 * This module provides strict environment validation that throws on missing
 * critical server environment variables at application boot time.
 * 
 * SECURITY: Never use this in client-side code - it exposes server env vars
 * 
 * Universal Header: @lib/config/requireEnv
 */

import { z } from "zod";

/**
 * Critical server environment variables that must be present in production
 * These are variables that would cause the application to fail if missing
 */
const CriticalServerEnvSchema = z.object({
  // Core application
  NODE_ENV: z.enum(["development", "test", "production"]),
  
  // Supabase (required for database operations)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  
  // Optional but recommended for production
  SENTRY_DSN: z.string().url().optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  RESEND_FROM: z.string().email().optional(),
});

/**
 * Production-specific environment variables
 * These are required only in production environments
 */
const ProductionEnvSchema = z.object({
  SENTRY_DSN: z.string().url("Sentry DSN required in production"),
  RESEND_API_KEY: z.string().min(1, "Resend API key required in production"),
  RESEND_FROM: z.string().email("Valid Resend FROM email required in production"),
});

/**
 * Environment validation result
 */
interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isProduction: boolean;
}

/**
 * Validate critical environment variables
 * Throws immediately on missing critical variables in non-test environments
 * 
 * @param options Configuration options
 * @returns Validation result
 */
export function validateCriticalEnv(options: {
  throwOnError?: boolean;
  skipInTest?: boolean;
} = {}): EnvValidationResult {
  const { throwOnError = true, skipInTest = true } = options;
  
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Skip validation in test environment if requested
  if (skipInTest && process.env.NODE_ENV === "test") {
    return {
      isValid: true,
      errors: [],
      warnings: ["Environment validation skipped in test mode"],
      isProduction: false,
    };
  }
  
  const isProduction = process.env.NODE_ENV === "production";
  
  try {
    // Validate critical server environment variables
    const criticalResult = CriticalServerEnvSchema.safeParse(process.env);
    
    if (!criticalResult.success) {
      const criticalErrors = criticalResult.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      errors.push(...criticalErrors);
    }
    
    // In production, also validate production-specific variables
    if (isProduction) {
      const productionResult = ProductionEnvSchema.safeParse(process.env);
      
      if (!productionResult.success) {
        const productionErrors = productionResult.error.errors.map(
          (err) => `[PRODUCTION] ${err.path.join(".")}: ${err.message}`
        );
        errors.push(...productionErrors);
      }
    }
    
    // Check for common security issues
    const securityWarnings = checkSecurityIssues();
    warnings.push(...securityWarnings);
    
    const isValid = errors.length === 0;
    
    // Throw on critical errors if requested
    if (!isValid && throwOnError) {
      const errorMessage = [
        "Critical environment validation failed:",
        ...errors.map(err => `  - ${err}`),
        ...(warnings.length > 0 ? ["", "Warnings:", ...warnings.map(warn => `  - ${warn}`)] : [])
      ].join("\n");
      
      throw new Error(errorMessage);
    }
    
    return {
      isValid,
      errors,
      warnings,
      isProduction,
    };
    
  } catch (error) {
    if (throwOnError) {
      throw error;
    }
    
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
      warnings,
      isProduction,
    };
  }
}

/**
 * Check for common security issues in environment configuration
 */
function checkSecurityIssues(): string[] {
  const warnings: string[] = [];
  
  // Check for development values in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("localhost")) {
      warnings.push("Using localhost Supabase URL in production");
    }
    
    if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "fallback-key") {
      warnings.push("Using fallback Supabase key in production");
    }
    
    if (process.env.RESEND_FROM?.includes("example.com")) {
      warnings.push("Using example.com email in production");
    }
  }
  
  // Check for potentially exposed secrets
  const publicEnvVars = Object.keys(process.env).filter(key => key.startsWith("NEXT_PUBLIC_"));
  const secretPatterns = [
    /secret/i,
    /key/i,
    /token/i,
    /password/i,
    /dsn/i,
  ];
  
  for (const envVar of publicEnvVars) {
    for (const pattern of secretPatterns) {
      if (pattern.test(envVar) && !isAllowedPublicSecret(envVar)) {
        warnings.push(`Potentially sensitive variable exposed to client: ${envVar}`);
      }
    }
  }
  
  return warnings;
}

/**
 * Check if a public environment variable is allowed to contain sensitive data
 */
function isAllowedPublicSecret(envVar: string): boolean {
  const allowedPublicSecrets = [
    "NEXT_PUBLIC_SUPABASE_ANON_KEY", // This is meant to be public
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", // This is meant to be public
    "NEXT_PUBLIC_SENTRY_DSN", // This is meant to be public
  ];
  
  return allowedPublicSecrets.includes(envVar);
}

/**
 * Get a required environment variable with type safety
 * Throws if the variable is missing or empty
 */
export function requireEnv<T extends string = string>(
  key: string,
  options: {
    defaultValue?: T;
    allowEmpty?: boolean;
  } = {}
): T {
  const { defaultValue, allowEmpty = false } = options;
  
  const value = process.env[key] as T | undefined;
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Required environment variable missing: ${key}`);
  }
  
  if (!allowEmpty && value.trim() === "") {
    throw new Error(`Required environment variable is empty: ${key}`);
  }
  
  return value;
}

/**
 * Get an optional environment variable with type safety
 */
export function getOptionalEnv<T extends string = string>(
  key: string,
  defaultValue?: T
): T | undefined {
  const value = process.env[key] as T | undefined;
  return value ?? defaultValue;
}

/**
 * Initialize environment validation
 * Call this early in your application startup
 */
export function initializeEnvValidation(): void {
  try {
    const result = validateCriticalEnv();
    
    if (!result.isValid) {
      console.error("Environment validation failed:", result.errors);
      process.exit(1);
    }
    
    if (result.warnings.length > 0) {
      console.warn("Environment validation warnings:", result.warnings);
    }
    
    console.log("✅ Environment validation passed");
    
  } catch (error) {
    console.error("❌ Environment validation failed:", error);
    process.exit(1);
  }
}
