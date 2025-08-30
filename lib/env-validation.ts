/**
 * Environment Variable Validation and Sanitization - Phase 1, Task 2
 * Provides comprehensive validation and sanitization for environment variables
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { z } from 'zod';

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

/**
 * URL validation with common security checks
 */
const secureUrl = z.string().url().refine((url) => {
  const parsed = new URL(url);
  // Prevent localhost in production (except for known dev URLs)
  if (process.env.NODE_ENV === 'production' && parsed.hostname === 'localhost') {
    return false;
  }
  // Require HTTPS in production
  if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
    return false;
  }
  return true;
}, {
  message: "URL must use HTTPS in production and cannot be localhost"
});

/**
 * Email validation with domain checks
 */
const emailValidator = z.string().email().refine((email) => {
  const domain = email.split('@')[1];
  // Block common disposable email domains in production
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
  if (process.env.NODE_ENV === 'production' && disposableDomains.includes(domain)) {
    return false;
  }
  return true;
}, {
  message: "Disposable email domains not allowed in production"
});

// Removed unused validators - can be added back when needed

// =============================================================================
// SANITIZATION FUNCTIONS
// =============================================================================

/**
 * Sanitize URL by removing trailing slashes and normalizing
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash from pathname
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.toString();
  } catch {
    return url; // Return original if invalid URL
  }
}

/**
 * Sanitize email by lowercasing and trimming
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize boolean string values
 */
export function sanitizeBoolean(value: string): string {
  const normalized = value.toLowerCase().trim();
  const truthy = ['true', '1', 'yes', 'on', 'enabled'];
  const falsy = ['false', '0', 'no', 'off', 'disabled'];
  
  if (truthy.includes(normalized)) return 'true';
  if (falsy.includes(normalized)) return 'false';
  return 'false'; // Default to false for invalid values
}

/**
 * Sanitize numeric values
 */
export function sanitizeNumber(value: string, min?: number, max?: number): string {
  const num = parseInt(value, 10);
  if (isNaN(num)) return '0';
  
  let sanitized = num;
  if (min !== undefined) sanitized = Math.max(sanitized, min);
  if (max !== undefined) sanitized = Math.min(sanitized, max);
  
  return sanitized.toString();
}

/**
 * Sanitize timeout values (ensure reasonable bounds)
 */
export function sanitizeTimeout(value: string): string {
  return sanitizeNumber(value, 1000, 300000); // 1s to 5min
}

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate Supabase URL
 */
export function validateSupabaseUrl(url?: string): z.SafeParseReturnType<string, string> {
  if (!url) return { success: false, error: new z.ZodError([]) };
  
  const schema = z.string().url().refine((u) => {
    return u.includes('.supabase.co') || u.includes('localhost:54321');
  }, {
    message: "Must be a valid Supabase URL"
  });
  
  return schema.safeParse(sanitizeUrl(url));
}

/**
 * Validate Stripe API key
 */
export function validateStripeKey(key?: string, type: 'secret' | 'publishable' = 'secret'): z.SafeParseReturnType<string, string> {
  if (!key) return { success: false, error: new z.ZodError([]) };
  
  const prefix = type === 'secret' ? 'sk_' : 'pk_';
  const schema = z.string().refine((k) => {
    return k.startsWith(prefix) && k.length > 20;
  }, {
    message: `Must be a valid Stripe ${type} key starting with ${prefix}`
  });
  
  return schema.safeParse(key);
}

/**
 * Validate webhook URL
 */
export function validateWebhookUrl(url?: string): z.SafeParseReturnType<string, string> {
  if (!url) return { success: false, error: new z.ZodError([]) };
  return secureUrl.safeParse(sanitizeUrl(url));
}

/**
 * Validate email address
 */
export function validateEmailAddress(email?: string): z.SafeParseReturnType<string, string> {
  if (!email) return { success: false, error: new z.ZodError([]) };
  return emailValidator.safeParse(sanitizeEmail(email));
}

/**
 * Validate environment-specific requirements
 */
export function validateEnvironmentRequirements(env: Record<string, string | undefined>) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Production-specific validations
  if (env.NODE_ENV === 'production') {
    // Require HTTPS URLs
    const httpsRequiredVars = ['NEXT_PUBLIC_SUPABASE_URL', 'N8N_WEBHOOK_URL', 'SLACK_WEBHOOK_URL'];
    httpsRequiredVars.forEach(varName => {
      const value = env[varName];
      if (value && !value.startsWith('https://')) {
        errors.push(`${varName} must use HTTPS in production`);
      }
    });
    
    // Require strong secrets
    const secretVars = ['SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY', 'CRON_SECRET'];
    secretVars.forEach(varName => {
      const value = env[varName];
      if (value && value.length < 32) {
        warnings.push(`${varName} appears to be weak (less than 32 characters)`);
      }
    });
  }
  
  // Development warnings
  if (env.NODE_ENV === 'development') {
    if (env.NEXT_PUBLIC_SUPABASE_URL === 'http://localhost:54321') {
      warnings.push('Using local Supabase instance');
    }
  }
  
  return { errors, warnings };
}

// =============================================================================
// ROTATION DETECTION
// =============================================================================

/**
 * Check if secrets need rotation based on patterns
 */
export function detectRotationNeeds(env: Record<string, string | undefined>) {
  const rotationWarnings: string[] = [];
  const secretVars = ['SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY', 'RESEND_API_KEY'];
  
  secretVars.forEach(varName => {
    const value = env[varName];
    if (value) {
      // Check for test keys in production
      if (env.NODE_ENV === 'production' && value.includes('test_')) {
        rotationWarnings.push(`${varName} appears to be a test key in production`);
      }
      
      // Check for very old key patterns (if detectable)
      if (value.startsWith('sk_live_') && value.length < 50) {
        rotationWarnings.push(`${varName} may be an older format key`);
      }
    }
  });
  
  return rotationWarnings;
}

// =============================================================================
// COMPREHENSIVE VALIDATION
// =============================================================================

/**
 * Validate and sanitize all environment variables
 */
export function validateAndSanitizeEnvironment(env: Record<string, string | undefined>) {
  const sanitized: Record<string, string | undefined> = {};
  const validationResults: Array<{
    key: string;
    status: 'valid' | 'warning' | 'error';
    message: string;
  }> = [];
  
  // Process each environment variable
  Object.entries(env).forEach(([key, value]) => {
    if (!value) {
      sanitized[key] = value;
      return;
    }
    
    try {
      switch (key) {
        // URLs
        case 'NEXT_PUBLIC_SUPABASE_URL':
          const supabaseResult = validateSupabaseUrl(value);
          if (supabaseResult.success) {
            sanitized[key] = sanitizeUrl(value);
            validationResults.push({ key, status: 'valid', message: 'Valid Supabase URL' });
          } else {
            sanitized[key] = value;
            validationResults.push({ key, status: 'error', message: 'Invalid Supabase URL' });
          }
          break;
          
        case 'N8N_WEBHOOK_URL':
        case 'SLACK_WEBHOOK_URL':
          const webhookResult = validateWebhookUrl(value);
          if (webhookResult.success) {
            sanitized[key] = sanitizeUrl(value);
            validationResults.push({ key, status: 'valid', message: 'Valid webhook URL' });
          } else {
            sanitized[key] = value;
            validationResults.push({ key, status: 'error', message: 'Invalid webhook URL' });
          }
          break;
          
        // Emails
        case 'RESEND_FROM':
          const emailResult = validateEmailAddress(value);
          if (emailResult.success) {
            sanitized[key] = sanitizeEmail(value);
            validationResults.push({ key, status: 'valid', message: 'Valid email address' });
          } else {
            sanitized[key] = value;
            validationResults.push({ key, status: 'error', message: 'Invalid email address' });
          }
          break;
          
        // Stripe keys
        case 'STRIPE_SECRET_KEY':
          const stripeSecretResult = validateStripeKey(value, 'secret');
          if (stripeSecretResult.success) {
            sanitized[key] = value;
            validationResults.push({ key, status: 'valid', message: 'Valid Stripe secret key' });
          } else {
            sanitized[key] = value;
            validationResults.push({ key, status: 'error', message: 'Invalid Stripe secret key' });
          }
          break;
          
        case 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY':
          const stripePubResult = validateStripeKey(value, 'publishable');
          if (stripePubResult.success) {
            sanitized[key] = value;
            validationResults.push({ key, status: 'valid', message: 'Valid Stripe publishable key' });
          } else {
            sanitized[key] = value;
            validationResults.push({ key, status: 'error', message: 'Invalid Stripe publishable key' });
          }
          break;
          
        // Timeouts
        case 'N8N_WEBHOOK_TIMEOUT':
          sanitized[key] = sanitizeTimeout(value);
          validationResults.push({ key, status: 'valid', message: 'Timeout sanitized' });
          break;
          
        // Booleans
        case 'NEXT_PUBLIC_DEBUG':
        case 'NEXT_PUBLIC_SAFE_MODE':
        case 'NEXT_PUBLIC_ENABLE_AI_LIVE':
          sanitized[key] = sanitizeBoolean(value);
          validationResults.push({ key, status: 'valid', message: 'Boolean value sanitized' });
          break;
          
        // Ports
        case 'PORT':
          sanitized[key] = sanitizeNumber(value, 1, 65535);
          validationResults.push({ key, status: 'valid', message: 'Port number sanitized' });
          break;
          
        default:
          // Keep original value for unrecognized keys
          sanitized[key] = value;
          validationResults.push({ key, status: 'valid', message: 'Passed through without validation' });
      }
    } catch (error) {
      sanitized[key] = value;
      validationResults.push({ 
        key, 
        status: 'error', 
        message: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    }
  });
  
  // Run environment-specific validations
  const envValidation = validateEnvironmentRequirements(sanitized);
  const rotationWarnings = detectRotationNeeds(sanitized);
  
  return {
    sanitized,
    validationResults,
    environmentErrors: envValidation.errors,
    environmentWarnings: envValidation.warnings,
    rotationWarnings,
  };
}