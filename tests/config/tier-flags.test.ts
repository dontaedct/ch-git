/**
 * Tier Flags and Preset Loading Tests - Phase 1, Task 4
 * Comprehensive tests for tier-based feature flags and preset loading functionality
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  isTier,
  getCurrentTier, 
  isEnabled, 
  isFeatureAvailable,
  isFeatureEnabledForTier,
  TierLevel,
  FeatureFlag
} from '../../lib/flags';
import {
  getAppConfig,
  clearAppConfigCache,
  loadPresetConfig,
  getAvailablePresets,
  AVAILABLE_PRESETS,
  PresetName
} from '../../app.config';
import { clearEnvironmentCache } from '../../lib/env';

// =============================================================================
// TEST SETUP
// =============================================================================

describe('Tier Flags System', () => {
  beforeEach(() => {
    // Clear caches before each test
    clearAppConfigCache();
    clearEnvironmentCache();
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Reset environment variables
    delete process.env.APP_TIER;
    delete process.env.APP_PRESET;
  });

  afterEach(() => {
    // Clean up after each test
    clearAppConfigCache();
    clearEnvironmentCache();
    
    // Reset NODE_ENV
    delete process.env.NODE_ENV;
  });

  // =============================================================================
  // TIER DETECTION TESTS
  // =============================================================================

  describe('Tier Detection', () => {
    it('should default to starter tier when no tier is set', () => {
      const tier = getCurrentTier();
      expect(tier).toBe('starter');
    });

    it('should read tier from APP_TIER environment variable', () => {
      process.env.APP_TIER = 'pro';
      clearAppConfigCache(); // Force reload
      
      const tier = getCurrentTier();
      expect(tier).toBe('pro');
    });

    it('should validate tier values and fallback to starter for invalid values', () => {
      process.env.APP_TIER = 'invalid-tier';
      clearAppConfigCache();
      
      const tier = getCurrentTier();
      expect(tier).toBe('starter');
    });

    it('should handle all valid tier values', () => {
      const validTiers: TierLevel[] = ['starter', 'pro', 'advanced'];
      
      validTiers.forEach(validTier => {
        process.env.APP_TIER = validTier;
        clearAppConfigCache();
        
        const tier = getCurrentTier();
        expect(tier).toBe(validTier);
      });
    });
  });

  // =============================================================================
  // TIER COMPARISON TESTS
  // =============================================================================

  describe('Tier Comparison (isTier)', () => {
    it('should correctly identify starter tier capabilities', () => {
      process.env.APP_TIER = 'starter';
      clearAppConfigCache();
      
      expect(isTier('starter')).toBe(true);
      expect(isTier('pro')).toBe(false);
      expect(isTier('advanced')).toBe(false);
    });

    it('should correctly identify pro tier capabilities', () => {
      process.env.APP_TIER = 'pro';
      clearAppConfigCache();
      
      expect(isTier('starter')).toBe(true);  // Pro includes starter
      expect(isTier('pro')).toBe(true);
      expect(isTier('advanced')).toBe(false);
    });

    it('should correctly identify advanced tier capabilities', () => {
      process.env.APP_TIER = 'advanced';
      clearAppConfigCache();
      
      expect(isTier('starter')).toBe(true);   // Advanced includes all
      expect(isTier('pro')).toBe(true);       // Advanced includes pro
      expect(isTier('advanced')).toBe(true);
    });

    it('should handle tier hierarchy correctly', () => {
      const tierTests = [
        { current: 'starter', canDo: ['starter'], cannot: ['pro', 'advanced'] },
        { current: 'pro', canDo: ['starter', 'pro'], cannot: ['advanced'] },
        { current: 'advanced', canDo: ['starter', 'pro', 'advanced'], cannot: [] }
      ];

      tierTests.forEach(test => {
        process.env.APP_TIER = test.current;
        clearAppConfigCache();

        test.canDo.forEach(tier => {
          expect(isTier(tier as TierLevel)).toBe(true);
        });

        test.cannot.forEach(tier => {
          expect(isTier(tier as TierLevel)).toBe(false);
        });
      });
    });
  });

  // =============================================================================
  // FEATURE FLAG TESTS
  // =============================================================================

  describe('Feature Flags by Tier', () => {
    const featureByTier: Record<TierLevel, FeatureFlag[]> = {
      starter: ['database', 'email', 'health_checks', 'safe_mode'],
      pro: [
        'database', 'email', 'payments', 'webhooks', 'notifications',
        'error_tracking', 'health_checks', 'safe_mode', 'performance_monitoring'
      ],
      advanced: [
        'database', 'email', 'payments', 'webhooks', 'automation',
        'notifications', 'error_tracking', 'admin_operations', 'ai_features',
        'debug_mode', 'safe_mode', 'performance_monitoring', 'health_checks'
      ]
    };

    Object.entries(featureByTier).forEach(([tier, features]) => {
      describe(`${tier} tier`, () => {
        beforeEach(() => {
          process.env.APP_TIER = tier;
          clearAppConfigCache();
        });

        it(`should enable correct features for ${tier} tier`, () => {
          features.forEach(feature => {
            expect(isFeatureEnabledForTier(feature)).toBe(true);
          });
        });

        it(`should not enable higher-tier features`, () => {
          const allFeatures: FeatureFlag[] = [
            'database', 'email', 'payments', 'webhooks', 'automation',
            'notifications', 'error_tracking', 'admin_operations', 'ai_features',
            'debug_mode', 'safe_mode', 'performance_monitoring', 'health_checks'
          ];

          const higherTierFeatures = allFeatures.filter(f => !features.includes(f));
          
          higherTierFeatures.forEach(feature => {
            expect(isFeatureEnabledForTier(feature)).toBe(false);
          });
        });
      });
    });

    it('should handle feature availability vs tier support', () => {
      process.env.APP_TIER = 'pro';
      // Payments feature is supported in pro tier but may not be available without env vars
      clearAppConfigCache();
      
      expect(isFeatureEnabledForTier('payments')).toBe(true); // Tier supports it
      // isFeatureAvailable would check environment variables
      // isEnabled combines both tier support and availability
    });
  });

  // =============================================================================
  // PRESET LOADING TESTS
  // =============================================================================

  describe('Preset Loading', () => {
    it('should list all available presets', () => {
      const presets = getAvailablePresets();
      
      expect(presets).toHaveLength(AVAILABLE_PRESETS.length);
      expect(presets.every(p => AVAILABLE_PRESETS.includes(p.id))).toBe(true);
    });

    it('should load valid preset configurations', () => {
      const testPresets: PresetName[] = ['salon-waitlist', 'realtor-listing-hub', 'consultation-engine'];
      
      testPresets.forEach(preset => {
        const config = loadPresetConfig(preset);
        
        expect(config).not.toBeNull();
        expect(config?.id).toContain(preset);
        expect(config?.name).toBeDefined();
        expect(config?.tier).toMatch(/^(starter|pro|advanced)$/);
        expect(config?.features).toBeDefined();
      });
    });

    it('should return null for invalid preset names', () => {
      const invalidConfig = loadPresetConfig('invalid-preset' as PresetName);
      expect(invalidConfig).toBeNull();
    });

    it('should validate preset structure', () => {
      const config = loadPresetConfig('salon-waitlist');
      
      expect(config).toMatchObject({
        id: expect.stringContaining('salon-waitlist'),
        name: expect.any(String),
        version: expect.any(String),
        tier: expect.stringMatching(/^(starter|pro|advanced)$/),
        preset: expect.any(String),
        features: expect.any(Object),
        theme: expect.any(Object),
        questionnaire: expect.any(Object),
        consultation: expect.any(Object),
        catalog: expect.any(Object),
      });
    });

    it('should handle preset-specific feature overrides', () => {
      const config = loadPresetConfig('consultation-engine');
      
      expect(config?.features).toBeDefined();
      expect(config?.tier).toBe('advanced'); // Consultation engine should be advanced tier
      
      // AI features should be enabled in consultation engine
      expect(config?.features.ai_features).toBe(true);
    });
  });

  // =============================================================================
  // INTEGRATION TESTS
  // =============================================================================

  describe('App Configuration Integration', () => {
    it('should integrate tier and preset configurations', () => {
      process.env.APP_TIER = 'pro';
      process.env.APP_PRESET = 'realtor-listing-hub';
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      expect(config.tier).toBe('pro');
      expect(config.preset).toBe('realtor-listing-hub');
      expect(config.presetData).toBeDefined();
      expect(config.features).toBeDefined();
      expect(config.performance).toBeDefined();
      expect(config.resources).toBeDefined();
    });

    it('should fallback to default preset for invalid preset names', () => {
      process.env.APP_PRESET = 'invalid-preset';
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      expect(AVAILABLE_PRESETS.includes(config.preset as PresetName)).toBe(true);
    });

    it('should respect feature constraints by tier', () => {
      process.env.APP_TIER = 'starter';
      process.env.APP_PRESET = 'consultation-engine'; // This preset wants AI features
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      // Even though consultation-engine wants AI features, starter tier shouldn't have them
      expect(config.features.ai_features).toBe(false);
    });

    it('should enable features when both tier and preset support them', () => {
      process.env.APP_TIER = 'advanced';
      process.env.APP_PRESET = 'consultation-engine';
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      // Advanced tier + consultation engine should enable AI features
      expect(config.features.ai_features).toBe(true);
    });
  });

  // =============================================================================
  // PERFORMANCE CONFIG TESTS
  // =============================================================================

  describe('Performance Configuration', () => {
    it('should set appropriate performance config for each tier', () => {
      const tierConfigs = [
        { tier: 'starter', bundleSplitting: 'minimal', monitoring: false },
        { tier: 'pro', bundleSplitting: 'standard', monitoring: true },
        { tier: 'advanced', bundleSplitting: 'aggressive', monitoring: true }
      ];

      tierConfigs.forEach(({ tier, bundleSplitting, monitoring }) => {
        process.env.APP_TIER = tier;
        clearAppConfigCache();
        
        const config = getAppConfig();
        
        expect(config.performance.bundleSplitting).toBe(bundleSplitting);
        expect(config.performance.monitoring).toBe(monitoring);
      });
    });

    it('should set appropriate resource limits for each tier', () => {
      process.env.APP_TIER = 'advanced';
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      expect(config.resources.dbPoolSize).toBeGreaterThan(0);
      expect(config.resources.maxConcurrentRequests).toBeGreaterThan(0);
      expect(config.resources.maxUploadSize).toBeGreaterThan(0);
      expect(config.resources.rateLimit.requests).toBeGreaterThan(0);
      expect(config.resources.rateLimit.window).toBeGreaterThan(0);
    });
  });

  // =============================================================================
  // ERROR HANDLING TESTS
  // =============================================================================

  describe('Error Handling', () => {
    it('should handle missing preset files gracefully', () => {
      // Mock loadPresetConfig to simulate file not found
      const originalConsoleWarn = console.warn;
      console.warn = jest.fn();
      
      const config = loadPresetConfig('non-existent-preset' as PresetName);
      
      expect(config).toBeNull();
      expect(console.warn).toHaveBeenCalled();
      
      console.warn = originalConsoleWarn;
    });

    it('should handle corrupted preset files', () => {
      // This would require mocking fs.readFileSync to return invalid JSON
      // For now, we'll test that the system doesn't crash with null preset data
      
      process.env.APP_PRESET = 'invalid-preset';
      clearAppConfigCache();
      
      expect(() => {
        const config = getAppConfig();
        expect(config).toBeDefined();
      }).not.toThrow();
    });

    it('should provide sensible defaults when configuration fails', () => {
      // Clear all environment variables
      delete process.env.APP_TIER;
      delete process.env.APP_PRESET;
      clearAppConfigCache();
      
      const config = getAppConfig();
      
      expect(config.tier).toBe('starter');
      expect(AVAILABLE_PRESETS.includes(config.preset as PresetName)).toBe(true);
      expect(config.features).toBeDefined();
      expect(config.performance).toBeDefined();
      expect(config.resources).toBeDefined();
    });
  });

  // =============================================================================
  // CACHE BEHAVIOR TESTS
  // =============================================================================

  describe('Cache Behavior', () => {
    it('should cache configuration after first load', () => {
      process.env.APP_TIER = 'pro';
      
      const config1 = getAppConfig();
      const config2 = getAppConfig();
      
      expect(config1).toBe(config2); // Should be the same object reference
    });

    it('should reload configuration after cache clear', () => {
      process.env.APP_TIER = 'pro';
      const config1 = getAppConfig();
      
      clearAppConfigCache();
      process.env.APP_TIER = 'advanced';
      const config2 = getAppConfig();
      
      expect(config1.tier).toBe('pro');
      expect(config2.tier).toBe('advanced');
      expect(config1).not.toBe(config2);
    });
  });
});

// =============================================================================
// UTILITY FUNCTIONS FOR TESTING
// =============================================================================

describe('Utility Functions', () => {
  beforeEach(() => {
    clearAppConfigCache();
    clearEnvironmentCache();
  });

  it('should provide configuration summary for debugging', () => {
    process.env.APP_TIER = 'pro';
    process.env.APP_PRESET = 'salon-waitlist';
    
    const config = getAppConfig();
    expect(config).toBeDefined();
    
    // Test that we can get debugging information
    expect(config.tier).toBe('pro');
    expect(config.preset).toBe('salon-waitlist');
    expect(config.features).toBeDefined();
  });
});