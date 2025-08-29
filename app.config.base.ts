/**
 * Application Configuration - Phase 1, Task 4
 * Centralized tier and preset configuration with dynamic feature loading
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import type { MicroAppConfig } from './types/config';
import { TierLevel, FeatureFlag } from './lib/flags';
import { getEnv } from './lib/env';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface AppConfig {
  /** Current application tier */
  tier: TierLevel;
  /** Active preset configuration */
  preset: string;
  /** Feature configuration based on tier and preset */
  features: FeatureConfig;
  /** Loaded preset data */
  presetData?: MicroAppConfig;
  /** Performance settings based on tier */
  performance: PerformanceConfig;
  /** Resource allocation settings */
  resources: ResourceConfig;
}

export interface FeatureConfig {
  database: boolean;
  email: boolean;
  payments: boolean;
  webhooks: boolean;
  automation: boolean;
  notifications: boolean;
  error_tracking: boolean;
  admin_operations: boolean;
  ai_features: boolean;
  debug_mode: boolean;
  safe_mode: boolean;
  performance_monitoring: boolean;
  health_checks: boolean;
}

export interface PerformanceConfig {
  /** Enable performance monitoring */
  monitoring: boolean;
  /** Bundle splitting strategy */
  bundleSplitting: 'minimal' | 'standard' | 'aggressive';
  /** Caching strategy */
  caching: 'basic' | 'advanced' | 'enterprise';
  /** Memory allocation limits */
  memoryLimits: {
    heap: number;
    cache: number;
  };
}

export interface ResourceConfig {
  /** Database connection pool size */
  dbPoolSize: number;
  /** Maximum concurrent requests */
  maxConcurrentRequests: number;
  /** File upload limits (MB) */
  maxUploadSize: number;
  /** API rate limiting */
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
}

// =============================================================================
// TIER CONFIGURATIONS
// =============================================================================

const TIER_PERFORMANCE_CONFIG: Record<TierLevel, PerformanceConfig> = {
  starter: {
    monitoring: false,
    bundleSplitting: 'minimal',
    caching: 'basic',
    memoryLimits: {
      heap: 512, // MB
      cache: 64,  // MB
    },
  },
  pro: {
    monitoring: true,
    bundleSplitting: 'standard',
    caching: 'advanced',
    memoryLimits: {
      heap: 1024, // MB
      cache: 256,  // MB
    },
  },
  advanced: {
    monitoring: true,
    bundleSplitting: 'aggressive',
    caching: 'enterprise',
    memoryLimits: {
      heap: 2048, // MB
      cache: 512,  // MB
    },
  },
};

const TIER_RESOURCE_CONFIG: Record<TierLevel, ResourceConfig> = {
  starter: {
    dbPoolSize: 5,
    maxConcurrentRequests: 10,
    maxUploadSize: 10, // MB
    rateLimit: {
      requests: 100,
      window: 60, // 1 minute
    },
  },
  pro: {
    dbPoolSize: 20,
    maxConcurrentRequests: 50,
    maxUploadSize: 50, // MB
    rateLimit: {
      requests: 1000,
      window: 60, // 1 minute
    },
  },
  advanced: {
    dbPoolSize: 50,
    maxConcurrentRequests: 200,
    maxUploadSize: 200, // MB
    rateLimit: {
      requests: 10000,
      window: 60, // 1 minute
    },
  },
};

// =============================================================================
// PRESET LOADING
// =============================================================================

/**
 * Available preset configurations
 */
export const AVAILABLE_PRESETS = [
  'salon-waitlist',
  'realtor-listing-hub', 
  'consultation-engine',
] as const;

export type PresetName = typeof AVAILABLE_PRESETS[number];

/**
 * Load preset configuration from JSON file
 */
export function loadPresetConfig(preset: PresetName): MicroAppConfig | null {
  try {
    const presetPath = join(process.cwd(), 'packages', 'templates', 'presets', `${preset}.json`);
    const presetJson = readFileSync(presetPath, 'utf-8');
    return JSON.parse(presetJson) as MicroAppConfig;
  } catch (error) {
    console.warn(`Failed to load preset "${preset}":`, error);
    return null;
  }
}

/**
 * Get all available preset metadata
 */
export function getAvailablePresets(): Array<{
  id: PresetName;
  name: string;
  description: string;
  tier: TierLevel;
}> {
  return AVAILABLE_PRESETS.map(preset => {
    const config = loadPresetConfig(preset);
    return {
      id: preset,
      name: config?.name || preset,
      description: config?.description || 'No description available',
      tier: (config?.tier as TierLevel) || 'starter',
    };
  }).filter(Boolean);
}

// =============================================================================
// FEATURE RESOLUTION
// =============================================================================

/**
 * Resolve feature configuration based on tier and preset
 */
export function resolveFeatureConfig(tier: TierLevel, presetData?: MicroAppConfig): FeatureConfig {
  // Base features from tier (from flags.ts TIER_FEATURES)
  const tierFeatures: FeatureConfig = {
    database: ['starter', 'pro', 'advanced'].includes(tier),
    email: ['starter', 'pro', 'advanced'].includes(tier),
    payments: ['pro', 'advanced'].includes(tier),
    webhooks: ['pro', 'advanced'].includes(tier),
    automation: tier === 'advanced',
    notifications: ['pro', 'advanced'].includes(tier),
    error_tracking: ['pro', 'advanced'].includes(tier),
    admin_operations: tier === 'advanced',
    ai_features: tier === 'advanced',
    debug_mode: tier === 'advanced',
    safe_mode: ['starter', 'pro', 'advanced'].includes(tier),
    performance_monitoring: ['pro', 'advanced'].includes(tier),
    health_checks: ['starter', 'pro', 'advanced'].includes(tier),
  };

  // Override with preset-specific features if available
  if (presetData?.features) {
    Object.keys(presetData.features).forEach(feature => {
      const featureKey = feature as FeatureFlag;
      if (featureKey in tierFeatures && presetData.features) {
        // Only enable feature if tier supports it AND preset enables it
        tierFeatures[featureKey] = tierFeatures[featureKey] && presetData.features[featureKey];
      }
    });
  }

  return tierFeatures;
}

// =============================================================================
// MAIN CONFIGURATION
// =============================================================================

let appConfigCache: AppConfig | null = null;

/**
 * Get current application configuration
 */
export function getAppConfig(): AppConfig {
  if (appConfigCache) {
    return appConfigCache;
  }

  const env = getEnv();
  
  // Determine tier from environment or default to starter
  const tier: TierLevel = (env.APP_TIER as TierLevel) || 'starter';
  
  // Determine preset from environment or default
  const preset = env.APP_PRESET || process.env.APP_PRESET || 'salon-waitlist';
  
  // Validate preset exists
  const validPreset = AVAILABLE_PRESETS.includes(preset as PresetName) 
    ? preset as PresetName 
    : 'salon-waitlist';
  
  // Load preset data
  const presetData = loadPresetConfig(validPreset);
  
  // Build configuration
  appConfigCache = {
    tier,
    preset: validPreset,
    features: resolveFeatureConfig(tier, presetData || undefined),
    presetData: presetData || undefined,
    performance: TIER_PERFORMANCE_CONFIG[tier],
    resources: TIER_RESOURCE_CONFIG[tier],
  };

  return appConfigCache;
}

/**
 * Clear configuration cache (for testing/hot reload)
 */
export function clearAppConfigCache(): void {
  appConfigCache = null;
}

// =============================================================================
// TIER MANAGEMENT UTILITIES
// =============================================================================

/**
 * Check if current configuration supports a feature
 */
export function isFeatureEnabled(feature: FeatureFlag): boolean {
  const config = getAppConfig();
  return config.features[feature] === true;
}

/**
 * Get current tier level
 */
export function getCurrentTier(): TierLevel {
  return getAppConfig().tier;
}

/**
 * Get current preset name
 */
export function getCurrentPreset(): string {
  return getAppConfig().preset;
}

/**
 * Get preset data for current configuration
 */
export function getPresetData(): MicroAppConfig | undefined {
  return getAppConfig().presetData;
}

/**
 * Check if tier supports upgrading to target tier
 */
export function canUpgradeTo(targetTier: TierLevel): boolean {
  const current = getCurrentTier();
  const tierOrder: Record<TierLevel, number> = {
    starter: 1,
    pro: 2,
    advanced: 3,
  };
  
  return tierOrder[targetTier] > tierOrder[current];
}

/**
 * Get available upgrade paths
 */
export function getUpgradePaths(): TierLevel[] {
  const current = getCurrentTier();
  const allTiers: TierLevel[] = ['starter', 'pro', 'advanced'];
  
  return allTiers.filter(tier => canUpgradeTo(tier));
}

// =============================================================================
// PERFORMANCE & RESOURCE UTILITIES
// =============================================================================

/**
 * Get performance configuration for current tier
 */
export function getPerformanceConfig(): PerformanceConfig {
  return getAppConfig().performance;
}

/**
 * Get resource configuration for current tier
 */
export function getResourceConfig(): ResourceConfig {
  return getAppConfig().resources;
}

/**
 * Check if performance monitoring is enabled
 */
export function isPerformanceMonitoringEnabled(): boolean {
  return getPerformanceConfig().monitoring;
}

// =============================================================================
// DEVELOPMENT & DEBUGGING
// =============================================================================

/**
 * Get comprehensive configuration summary for debugging
 */
export function getConfigSummary() {
  const config = getAppConfig();
  
  return {
    tier: config.tier,
    preset: config.preset,
    featuresEnabled: Object.entries(config.features)
      .filter(([, enabled]) => enabled)
      .map(([feature]) => feature),
    presetLoaded: !!config.presetData,
    performance: config.performance,
    resources: config.resources,
    environment: {
      APP_TIER: process.env.APP_TIER,
      APP_PRESET: process.env.APP_PRESET,
      NODE_ENV: process.env.NODE_ENV,
    },
  };
}

/**
 * Validate current configuration
 */
export function validateConfig(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const config = getAppConfig();

  // Validate tier
  if (!['starter', 'pro', 'advanced'].includes(config.tier)) {
    errors.push(`Invalid tier: ${config.tier}`);
  }

  // Validate preset
  if (!AVAILABLE_PRESETS.includes(config.preset as PresetName)) {
    errors.push(`Invalid preset: ${config.preset}`);
  }

  // Check if preset loaded successfully
  if (!config.presetData) {
    warnings.push(`Failed to load preset data for: ${config.preset}`);
  }

  // Validate feature consistency
  const enabledFeatures = Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);

  if (enabledFeatures.length === 0) {
    warnings.push('No features are enabled');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  getAppConfig,
  clearAppConfigCache,
  isFeatureEnabled,
  getCurrentTier,
  getCurrentPreset,
  getPresetData,
  canUpgradeTo,
  getUpgradePaths,
  getPerformanceConfig,
  getResourceConfig,
  isPerformanceMonitoringEnabled,
  getConfigSummary,
  validateConfig,
  loadPresetConfig,
  getAvailablePresets,
  AVAILABLE_PRESETS,
};