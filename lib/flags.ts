/**
 * Enhanced Feature Flags System - Phase 1, Task 2
 * Provides centralized feature flag management with tier-based controls
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { getEnv, isPlaceholder, FEATURE_DEPENDENCIES } from './env';

// =============================================================================
// FEATURE DEFINITIONS
// =============================================================================

export type FeatureFlag = 
  | 'database'
  | 'email' 
  | 'payments'
  | 'webhooks'
  | 'automation'
  | 'notifications'
  | 'error_tracking'
  | 'admin_operations'
  | 'ai_features'
  | 'debug_mode'
  | 'safe_mode'
  | 'performance_monitoring'
  | 'health_checks';

export type TierLevel = 'starter' | 'pro' | 'advanced';

// =============================================================================
// FEATURE TIER MAPPING
// =============================================================================

const TIER_FEATURES: Record<TierLevel, FeatureFlag[]> = {
  starter: [
    'database',
    'email',
    'health_checks',
    'safe_mode'
  ],
  pro: [
    'database',
    'email',
    'payments',
    'webhooks',
    'notifications',
    'error_tracking',
    'health_checks',
    'safe_mode',
    'performance_monitoring'
  ],
  advanced: [
    'database',
    'email', 
    'payments',
    'webhooks',
    'automation',
    'notifications',
    'error_tracking',
    'admin_operations',
    'ai_features',
    'debug_mode',
    'safe_mode',
    'performance_monitoring',
    'health_checks'
  ]
};

// =============================================================================
// ENVIRONMENT-BASED FEATURE DETECTION
// =============================================================================

/**
 * Check if a feature is available based on environment variables
 */
export function isFeatureAvailable(feature: FeatureFlag): boolean {
  const env = getEnv();
  
  switch (feature) {
    case 'database':
      return !!env.NEXT_PUBLIC_SUPABASE_URL && 
             !!env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
             !isPlaceholder('NEXT_PUBLIC_SUPABASE_URL') && 
             !isPlaceholder('NEXT_PUBLIC_SUPABASE_ANON_KEY');
             
    case 'email':
      return !!env.RESEND_API_KEY && !isPlaceholder('RESEND_API_KEY');
      
    case 'payments':
      return !!env.STRIPE_SECRET_KEY && 
             !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
             !isPlaceholder('STRIPE_SECRET_KEY') && 
             !isPlaceholder('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY');
             
    case 'webhooks':
      return !!env.STRIPE_WEBHOOK_SECRET && !isPlaceholder('STRIPE_WEBHOOK_SECRET');
      
    case 'automation':
      return !!env.N8N_WEBHOOK_URL && 
             !!env.N8N_WEBHOOK_SECRET &&
             !isPlaceholder('N8N_WEBHOOK_URL') && 
             !isPlaceholder('N8N_WEBHOOK_SECRET');
             
    case 'notifications':
      return !!env.SLACK_WEBHOOK_URL && !isPlaceholder('SLACK_WEBHOOK_URL');
      
    case 'error_tracking':
      return !!env.SENTRY_DSN && !isPlaceholder('SENTRY_DSN');
      
    case 'admin_operations':
      return !!env.SUPABASE_SERVICE_ROLE_KEY && !isPlaceholder('SUPABASE_SERVICE_ROLE_KEY');
      
    case 'ai_features':
      return env.NEXT_PUBLIC_ENABLE_AI_LIVE === 'true' || env.NEXT_PUBLIC_ENABLE_AI_LIVE === '1';
      
    case 'debug_mode':
      return env.NEXT_PUBLIC_DEBUG === 'true' || env.NEXT_PUBLIC_DEBUG === '1';
      
    case 'safe_mode':
      return env.NEXT_PUBLIC_SAFE_MODE === 'true' || env.NEXT_PUBLIC_SAFE_MODE === '1';
      
    case 'performance_monitoring':
      return env.PERFORMANCE_MONITORING_ENABLED === 'true' || env.NODE_ENV === 'production';
      
    case 'health_checks':
      return env.HEALTH_CHECK_ENABLED !== 'false';
      
    default:
      return false;
  }
}

// =============================================================================
// TIER MANAGEMENT
// =============================================================================

/**
 * Get current application tier from environment or config
 */
export function getCurrentTier(): TierLevel {
  const env = getEnv();
  const tier = env.APP_TIER || process.env.APP_TIER || 'starter';
  
  if (['starter', 'pro', 'advanced'].includes(tier)) {
    return tier as TierLevel;
  }
  
  return 'starter'; // Default fallback
}

/**
 * Check if current tier supports a feature
 */
export function isTier(tier: TierLevel): boolean {
  const currentTier = getCurrentTier();
  
  // Define tier hierarchy
  const tierHierarchy: Record<TierLevel, number> = {
    starter: 1,
    pro: 2,
    advanced: 3
  };
  
  return tierHierarchy[currentTier] >= tierHierarchy[tier];
}

/**
 * Check if a feature is enabled for the current tier
 */
export function isFeatureEnabledForTier(feature: FeatureFlag): boolean {
  const currentTier = getCurrentTier();
  return TIER_FEATURES[currentTier].includes(feature);
}

// =============================================================================
// MAIN FLAG CHECKING FUNCTION
// =============================================================================

/**
 * Check if a feature is enabled (combines tier and availability checks)
 */
export function isEnabled(feature: FeatureFlag): boolean {
  // First check if the tier supports this feature
  if (!isFeatureEnabledForTier(feature)) {
    return false;
  }
  
  // Then check if the feature is available based on environment
  return isFeatureAvailable(feature);
}

// =============================================================================
// FEATURE GROUPS
// =============================================================================

/**
 * Check if payment features are enabled
 */
export function isPaymentEnabled(): boolean {
  return isEnabled('payments') && isEnabled('webhooks');
}

/**
 * Check if full integration features are enabled
 */
export function isIntegrationEnabled(): boolean {
  return isEnabled('automation') && isEnabled('notifications');
}

/**
 * Check if monitoring features are enabled
 */
export function isMonitoringEnabled(): boolean {
  return isEnabled('error_tracking') && isEnabled('performance_monitoring');
}

/**
 * Check if admin features are enabled
 */
export function isAdminEnabled(): boolean {
  return isEnabled('admin_operations') && isEnabled('health_checks');
}

// =============================================================================
// GRACEFUL DEGRADATION HELPERS
// =============================================================================

/**
 * Get fallback behavior when a feature is disabled
 */
export function getFeatureFallback(feature: FeatureFlag): string {
  const dependency = FEATURE_DEPENDENCIES[getFeatureEnvVar(feature)];
  return dependency?.impact || 'Feature unavailable';
}

/**
 * Map feature to its primary environment variable
 */
function getFeatureEnvVar(feature: FeatureFlag): string {
  switch (feature) {
    case 'database': return 'NEXT_PUBLIC_SUPABASE_URL';
    case 'email': return 'RESEND_API_KEY';
    case 'payments': return 'STRIPE_SECRET_KEY';
    case 'webhooks': return 'STRIPE_WEBHOOK_SECRET';
    case 'automation': return 'N8N_WEBHOOK_URL';
    case 'notifications': return 'SLACK_WEBHOOK_URL';
    case 'error_tracking': return 'SENTRY_DSN';
    case 'admin_operations': return 'SUPABASE_SERVICE_ROLE_KEY';
    default: return '';
  }
}

// =============================================================================
// DEVELOPMENT HELPERS
// =============================================================================

/**
 * Get all feature statuses for debugging
 */
export function getAllFeatureStatuses() {
  const features: FeatureFlag[] = [
    'database', 'email', 'payments', 'webhooks', 'automation',
    'notifications', 'error_tracking', 'admin_operations',
    'ai_features', 'debug_mode', 'safe_mode', 'performance_monitoring', 'health_checks'
  ];
  
  return features.map(feature => ({
    feature,
    enabled: isEnabled(feature),
    available: isFeatureAvailable(feature),
    tierSupported: isFeatureEnabledForTier(feature),
    fallback: getFeatureFallback(feature)
  }));
}

/**
 * Get tier comparison matrix
 */
export function getTierMatrix() {
  return Object.entries(TIER_FEATURES).map(([tier, features]) => ({
    tier: tier as TierLevel,
    features,
    featureCount: features.length
  }));
}

/**
 * Check feature prerequisites
 */
export function checkPrerequisites(feature: FeatureFlag): {
  satisfied: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Check tier prerequisite
  if (!isFeatureEnabledForTier(feature)) {
    missing.push(`Requires ${findMinimumTierForFeature(feature)} tier or higher`);
  }
  
  // Check environment prerequisites
  const envVar = getFeatureEnvVar(feature);
  if (envVar && isPlaceholder(envVar)) {
    missing.push(`Missing environment variable: ${envVar}`);
  }
  
  // Add warnings for related dependencies
  if (feature === 'payments' && !isEnabled('webhooks')) {
    warnings.push('Webhooks should be enabled for complete payment functionality');
  }
  
  if (feature === 'error_tracking' && !isEnabled('performance_monitoring')) {
    warnings.push('Performance monitoring recommended with error tracking');
  }
  
  return {
    satisfied: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Find minimum tier required for a feature
 */
function findMinimumTierForFeature(feature: FeatureFlag): TierLevel {
  const tiers: TierLevel[] = ['starter', 'pro', 'advanced'];
  
  for (const tier of tiers) {
    if (TIER_FEATURES[tier].includes(feature)) {
      return tier;
    }
  }
  
  return 'advanced'; // Fallback to highest tier
}

// =============================================================================
// RUNTIME FEATURE MANAGEMENT
// =============================================================================

/**
 * Safely execute code only if feature is enabled
 */
export function withFeature<T>(
  feature: FeatureFlag,
  callback: () => T,
  fallback?: () => T
): T | undefined {
  if (isEnabled(feature)) {
    return callback();
  } else if (fallback) {
    return fallback();
  }
  
  return undefined;
}

/**
 * Async version of withFeature
 */
export async function withFeatureAsync<T>(
  feature: FeatureFlag,
  callback: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<T | undefined> {
  if (isEnabled(feature)) {
    return await callback();
  } else if (fallback) {
    return await fallback();
  }
  
  return undefined;
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export const flags = {
  isEnabled,
  isTier,
  isFeatureAvailable,
  isFeatureEnabledForTier,
  getCurrentTier,
  
  // Grouped checks
  isPaymentEnabled,
  isIntegrationEnabled,
  isMonitoringEnabled,
  isAdminEnabled,
  
  // Development helpers
  getAllFeatureStatuses,
  getTierMatrix,
  checkPrerequisites,
  getFeatureFallback,
  
  // Runtime helpers
  withFeature,
  withFeatureAsync,
};

// Default export for convenience
export default flags;