/**
 * @fileoverview Configuration validation utilities
 */

import type { StripeCheckoutConfig } from '../types';

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  fallbackMode: 'disabled' | 'manual' | 'redirect';
}

/**
 * Validate Stripe configuration and determine fallback strategy
 */
export function validateStripeConfig(
  config: Partial<StripeCheckoutConfig> & { 
    secretKey?: string; 
    webhookSecret?: string; 
  }
): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check if basic configuration is present
  if (!config.publicKey) {
    errors.push('Stripe public key is required');
  } else if (!config.publicKey.startsWith('pk_')) {
    errors.push('Invalid Stripe public key format');
  }

  if (!config.secretKey) {
    errors.push('Stripe secret key is required');
  } else if (!config.secretKey.startsWith('sk_')) {
    errors.push('Invalid Stripe secret key format');
  }

  // Validate key environment consistency
  if (config.publicKey && config.secretKey) {
    const pubIsTest = config.publicKey.startsWith('pk_test_');
    const secretIsTest = config.secretKey.startsWith('sk_test_');
    
    if (pubIsTest !== secretIsTest) {
      errors.push('Stripe public and secret keys must be from the same environment');
    }

    if (!pubIsTest && process.env.NODE_ENV !== 'production') {
      warnings.push('Using production Stripe keys in non-production environment');
    }
  }

  // Check webhook configuration
  if (!config.webhookSecret) {
    warnings.push('Webhook secret not configured - webhook events will be disabled');
  } else if (!config.webhookSecret.startsWith('whsec_')) {
    errors.push('Invalid webhook secret format');
  }

  // Validate URLs
  if (config.successUrl && !isValidUrl(config.successUrl)) {
    errors.push('Invalid success URL format');
  }

  if (config.cancelUrl && !isValidUrl(config.cancelUrl)) {
    errors.push('Invalid cancel URL format');
  }

  // Tier-specific validation
  if (!config.tier) {
    warnings.push('App tier not specified, defaulting to starter');
  }

  if (config.automaticTax && config.tier === 'starter') {
    warnings.push('Automatic tax requires Pro or Advanced tier');
  }

  // Determine fallback mode
  let fallbackMode: ConfigValidationResult['fallbackMode'] = 'disabled';
  
  if (errors.length === 0) {
    // Configuration is valid, no fallback needed
    fallbackMode = 'disabled';
  } else if (config.fallbackMode) {
    fallbackMode = config.fallbackMode;
  } else {
    // Auto-determine fallback mode
    if (config.tier === 'advanced') {
      fallbackMode = 'redirect'; // Advanced tier can handle redirects
    } else if (config.tier === 'pro') {
      fallbackMode = 'manual'; // Pro tier can handle manual checkout
    } else {
      fallbackMode = 'disabled'; // Starter tier disables payment if Stripe fails
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    fallbackMode,
  };
}

/**
 * Check if Stripe configuration allows for graceful degradation
 */
export function canFallback(config: StripeCheckoutConfig): boolean {
  return config.fallbackMode !== 'disabled';
}

/**
 * Get feature availability based on tier and configuration
 */
export function getFeatureAvailability(config: StripeCheckoutConfig) {
  return {
    promotionCodes: config.tier !== 'starter',
    automaticTax: config.tier !== 'starter' && config.automaticTax,
    customerPortal: config.tier !== 'starter',
    advancedMetadata: config.tier === 'advanced',
    multiplePaymentMethods: config.tier === 'advanced',
    subscriptions: config.tier !== 'starter',
  };
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate configuration recommendations
 */
export function getConfigRecommendations(
  config: Partial<StripeCheckoutConfig>
): string[] {
  const recommendations: string[] = [];

  if (!config.successUrl) {
    recommendations.push('Set a success URL for better user experience');
  }

  if (!config.cancelUrl) {
    recommendations.push('Set a cancel URL to handle payment cancellations');
  }

  if (config.tier === 'starter' && config.fallbackMode === 'disabled') {
    recommendations.push('Consider enabling fallback mode for better reliability');
  }

  if (config.tier !== 'starter' && !config.automaticTax) {
    recommendations.push('Enable automatic tax calculation for compliance');
  }

  return recommendations;
}