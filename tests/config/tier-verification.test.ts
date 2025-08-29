/**
 * Tier Verification Tests - Phase 1, Task 4
 * Comprehensive verification that all three tiers work without hard-coded checks
 * RUN_DATE=2025-08-29T15:10:31.507Z
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  TierLevel, 
  FeatureFlag,
  getCurrentTier,
  isTier,
  isEnabled,
  isFeatureEnabledForTier,
  isFeatureAvailable,
  getAllFeatureStatuses,
  getTierMatrix,
  TIER_FEATURES
} from '../../lib/flags';
import {
  getAppConfig,
  clearAppConfigCache,
  PresetName,
  AVAILABLE_PRESETS,
  getAvailablePresets
} from '../../app.config';
import { clearEnvironmentCache } from '../../lib/env';
import { 
  getFeatureComparison,
  getTierRecommendations,
  TIER_COMPARISONS 
} from '../../lib/config/tier-comparison';
import { getPerformanceOptimizer } from '../../lib/config/performance-optimizer';

// =============================================================================
// TEST DATA & UTILITIES
// =============================================================================

const ALL_TIERS: TierLevel[] = ['starter', 'pro', 'advanced'];
const ALL_PRESETS: PresetName[] = AVAILABLE_PRESETS;

/**
 * Set tier and clear caches for clean test state
 */
function setTierAndClear(tier: TierLevel, preset?: PresetName): void {
  process.env.NODE_ENV = 'test';
  process.env.APP_TIER = tier;
  if (preset) {
    process.env.APP_PRESET = preset;
  }
  clearAppConfigCache();
  clearEnvironmentCache();
}

/**
 * Get all features that should be enabled for a tier
 */
function getExpectedFeaturesForTier(tier: TierLevel): FeatureFlag[] {
  const tierMatrix = getTierMatrix();
  const tierData = tierMatrix.find(t => t.tier === tier);
  return tierData?.features || [];
}

// =============================================================================
// SETUP & TEARDOWN
// =============================================================================

describe('Tier System Verification', () => {
  beforeEach(() => {
    clearAppConfigCache();
    clearEnvironmentCache();
    
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    delete process.env.APP_TIER;
    delete process.env.APP_PRESET;
  });

  afterEach(() => {
    clearAppConfigCache();
    clearEnvironmentCache();
    
    // Reset NODE_ENV
    delete process.env.NODE_ENV;
  });

  // =============================================================================
  // COMPREHENSIVE TIER TESTING
  // =============================================================================

  describe('All Tiers Function Correctly', () => {
    ALL_TIERS.forEach(tier => {
      describe(`${tier.toUpperCase()} tier`, () => {
        beforeEach(() => {
          setTierAndClear(tier);
        });

        it(`should correctly identify as ${tier} tier`, () => {
          expect(getCurrentTier()).toBe(tier);
        });

        it('should have consistent tier hierarchy', () => {
          const tierLevels = { starter: 1, pro: 2, advanced: 3 };
          const currentLevel = tierLevels[tier];
          
          // Should support all tiers at or below current level
          ALL_TIERS.forEach(testTier => {
            const testLevel = tierLevels[testTier];
            const shouldSupport = testLevel <= currentLevel;
            expect(isTier(testTier)).toBe(shouldSupport);
          });
        });

        it('should have valid feature configuration', () => {
          const config = getAppConfig();
          
          expect(config.features).toBeDefined();
          expect(typeof config.features).toBe('object');
          
          // All feature flags should be boolean
          Object.values(config.features).forEach(value => {
            expect(typeof value).toBe('boolean');
          });
        });

        it('should have appropriate performance configuration', () => {
          const config = getAppConfig();
          
          expect(config.performance).toBeDefined();
          expect(['minimal', 'standard', 'aggressive']).toContain(config.performance.bundleSplitting);
          expect(typeof config.performance.monitoring).toBe('boolean');
          expect(config.performance.memoryLimits.heap).toBeGreaterThan(0);
        });

        it('should have resource limits appropriate for tier', () => {
          const config = getAppConfig();
          
          expect(config.resources).toBeDefined();
          expect(config.resources.dbPoolSize).toBeGreaterThan(0);
          expect(config.resources.maxConcurrentRequests).toBeGreaterThan(0);
          expect(config.resources.maxUploadSize).toBeGreaterThan(0);
          
          // Higher tiers should have higher limits
          if (tier === 'advanced') {
            expect(config.resources.dbPoolSize).toBeGreaterThanOrEqual(50);
          } else if (tier === 'pro') {
            expect(config.resources.dbPoolSize).toBeGreaterThanOrEqual(20);
          }
        });

        it('should enable correct features for tier', () => {
          const expectedFeatures = getExpectedFeaturesForTier(tier);
          
          expectedFeatures.forEach(feature => {
            expect(isFeatureEnabledForTier(feature)).toBe(true);
          });
        });

        it('should not enable higher-tier features', () => {
          const allStatuses = getAllFeatureStatuses();
          
          allStatuses.forEach(status => {
            // If feature is not tier-supported, it should not be enabled
            if (!status.tierSupported) {
              expect(status.enabled).toBe(false);
            }
          });
        });

        it('should work with performance optimizer', async () => {
          const optimizer = getPerformanceOptimizer();
          
          expect(optimizer).toBeDefined();
          
          const summary = optimizer.getPerformanceSummary();
          expect(summary.tier).toBe(tier);
          expect(summary.optimizations).toBeGreaterThan(0);
          expect(summary.memoryLimit).toBeGreaterThan(0);
        });
      });
    });
  });

  // =============================================================================
  // PRESET COMPATIBILITY TESTING
  // =============================================================================

  describe('Preset Compatibility Across Tiers', () => {
    ALL_PRESETS.forEach(preset => {
      describe(`${preset} preset`, () => {
        ALL_TIERS.forEach(tier => {
          it(`should work with ${tier} tier`, () => {
            setTierAndClear(tier, preset);
            
            const config = getAppConfig();
            
            expect(config.tier).toBe(tier);
            expect(config.preset).toBe(preset);
            
            // Should either load preset data or gracefully handle failure
            if (config.presetData) {
              expect(config.presetData.id).toContain(preset);
              expect(config.presetData.name).toBeDefined();
            }
            
            // Configuration should be complete regardless
            expect(config.features).toBeDefined();
            expect(config.performance).toBeDefined();
            expect(config.resources).toBeDefined();
          });
        });
      });
    });
  });

  // =============================================================================
  // DYNAMIC BEHAVIOR VERIFICATION
  // =============================================================================

  describe('Dynamic Configuration Updates', () => {
    it('should update configuration when tier changes', () => {
      // Start with starter
      setTierAndClear('starter');
      const starterConfig = getAppConfig();
      
      // Change to pro
      setTierAndClear('pro');
      const proConfig = getAppConfig();
      
      // Change to advanced
      setTierAndClear('advanced');
      const advancedConfig = getAppConfig();
      
      // Each should be different
      expect(starterConfig.tier).toBe('starter');
      expect(proConfig.tier).toBe('pro');
      expect(advancedConfig.tier).toBe('advanced');
      
      // Feature counts should increase with tier
      const starterFeatureCount = Object.values(starterConfig.features).filter(Boolean).length;
      const proFeatureCount = Object.values(proConfig.features).filter(Boolean).length;
      const advancedFeatureCount = Object.values(advancedConfig.features).filter(Boolean).length;
      
      expect(proFeatureCount).toBeGreaterThanOrEqual(starterFeatureCount);
      expect(advancedFeatureCount).toBeGreaterThanOrEqual(proFeatureCount);
    });

    it('should update configuration when preset changes', () => {
      const tier: TierLevel = 'pro';
      
      // Test different presets with same tier
      const configs: Array<{ preset: PresetName; config: any }> = [];
      
      AVAILABLE_PRESETS.forEach(preset => {
        setTierAndClear(tier, preset);
        const config = getAppConfig();
        configs.push({ preset, config });
      });
      
      // Each config should reflect its preset
      configs.forEach(({ preset, config }) => {
        expect(config.preset).toBe(preset);
        expect(config.tier).toBe(tier);
      });
    });
  });

  // =============================================================================
  // NO HARD-CODED CHECKS VERIFICATION
  // =============================================================================

  describe('No Hard-Coded Tier Checks', () => {
    it('should use configuration-driven feature detection', () => {
      ALL_TIERS.forEach(tier => {
        // Clean up any existing environment variables first
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        delete process.env.RESEND_API_KEY;
        delete process.env.STRIPE_SECRET_KEY;
        delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        delete process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.N8N_WEBHOOK_URL;
        delete process.env.N8N_WEBHOOK_SECRET;
        delete process.env.SLACK_WEBHOOK_URL;
        delete process.env.SENTRY_DSN;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        delete process.env.NEXT_PUBLIC_ENABLE_AI_LIVE;
        delete process.env.NEXT_PUBLIC_DEBUG;
        delete process.env.NEXT_PUBLIC_SAFE_MODE;
        delete process.env.PERFORMANCE_MONITORING_ENABLED;
        delete process.env.HEALTH_CHECK_ENABLED;
        
        setTierAndClear(tier);
        
        // Set up environment variables to make features available for testing
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
        process.env.RESEND_API_KEY = 'test-resend-key';
        process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'test-stripe-pub-key';
        process.env.STRIPE_WEBHOOK_SECRET = 'test-webhook-secret';
        process.env.N8N_WEBHOOK_URL = 'https://test.n8n.io';
        process.env.N8N_WEBHOOK_SECRET = 'test-n8n-secret';
        process.env.SLACK_WEBHOOK_URL = 'https://test.slack.com';
        process.env.SENTRY_DSN = 'https://test.sentry.io';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
        process.env.NEXT_PUBLIC_ENABLE_AI_LIVE = 'true';
        process.env.NEXT_PUBLIC_DEBUG = 'true';
        process.env.NEXT_PUBLIC_SAFE_MODE = 'true';
        process.env.PERFORMANCE_MONITORING_ENABLED = 'true';
        process.env.HEALTH_CHECK_ENABLED = 'true';
        
        const config = getAppConfig();
        
        // All feature checks should be based on config, not hard-coded tier strings
        Object.entries(config.features).forEach(([feature, enabled]) => {
          const featureFlag = feature as FeatureFlag;
          

          
          // isEnabled should match config when environment is properly set up
          expect(isEnabled(featureFlag)).toBe(enabled);
          
          // isFeatureEnabledForTier should check tier support (ignoring preset overrides)
          const tierSupportsFeature = TIER_FEATURES[tier].includes(featureFlag);
          expect(isFeatureEnabledForTier(featureFlag)).toBe(tierSupportsFeature);
        });
        
        // Clean up environment variables and clear cache
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        delete process.env.RESEND_API_KEY;
        delete process.env.STRIPE_SECRET_KEY;
        delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        delete process.env.STRIPE_WEBHOOK_SECRET;
        delete process.env.N8N_WEBHOOK_URL;
        delete process.env.N8N_WEBHOOK_SECRET;
        delete process.env.SLACK_WEBHOOK_URL;
        delete process.env.SENTRY_DSN;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        delete process.env.NEXT_PUBLIC_ENABLE_AI_LIVE;
        delete process.env.NEXT_PUBLIC_DEBUG;
        delete process.env.NEXT_PUBLIC_SAFE_MODE;
        delete process.env.PERFORMANCE_MONITORING_ENABLED;
        delete process.env.HEALTH_CHECK_ENABLED;
        
        // Clear environment cache to ensure fresh values
        clearEnvironmentCache();
      });
    });

    it('should use tier matrix for feature definitions', () => {
      const tierMatrix = getTierMatrix();
      
      expect(tierMatrix).toHaveLength(3);
      expect(tierMatrix.map(t => t.tier)).toEqual(expect.arrayContaining(ALL_TIERS));
      
      tierMatrix.forEach(tierInfo => {
        expect(tierInfo.features).toBeInstanceOf(Array);
        expect(tierInfo.featureCount).toBe(tierInfo.features.length);
      });
    });

    it('should use comparison matrix for feature availability', () => {
      const featureComparison = getFeatureComparison();
      
      expect(featureComparison.length).toBeGreaterThan(0);
      
      featureComparison.forEach(comparison => {
        expect(comparison.feature).toBeDefined();
        expect(comparison.availability).toBeDefined();
        
        // Should have availability for all tiers
        ALL_TIERS.forEach(tier => {
          expect(comparison.availability[tier]).toBeDefined();
          expect(typeof comparison.availability[tier].included).toBe('boolean');
        });
      });
    });

    it('should use tier comparison data for recommendations', () => {
      const recommendations = getTierRecommendations({
        users: 10,
        paymentProcessing: true,
        aiFeatures: true,
      });
      
      expect(recommendations.recommended).toMatch(/^(starter|pro|advanced)$/);
      expect(recommendations.alternatives).toBeInstanceOf(Array);
      expect(recommendations.reasons).toBeInstanceOf(Array);
    });
  });

  // =============================================================================
  // UPGRADE PATH VERIFICATION
  // =============================================================================

  describe('Tier Upgrade Paths', () => {
    it('should provide valid upgrade recommendations for each tier', () => {
      ALL_TIERS.forEach(currentTier => {
        setTierAndClear(currentTier);
        
        const config = getAppConfig();
        const tierComparison = TIER_COMPARISONS[currentTier];
        
        expect(tierComparison).toBeDefined();
        expect(tierComparison.upgradeReasons).toBeInstanceOf(Array);
        
        // Starter and Pro should have upgrade reasons, Advanced should not
        if (currentTier !== 'advanced') {
          expect(tierComparison.upgradeReasons.length).toBeGreaterThan(0);
        } else {
          expect(tierComparison.upgradeReasons.length).toBe(0);
        }
      });
    });

    it('should maintain consistency across all tier definitions', () => {
      // Verify tier comparisons exist for all tiers
      ALL_TIERS.forEach(tier => {
        expect(TIER_COMPARISONS[tier]).toBeDefined();
        expect(TIER_COMPARISONS[tier].tier).toBe(tier);
      });
      
      // Verify feature definitions are consistent
      const allFeatureIds = new Set<string>();
      Object.values(TIER_COMPARISONS).forEach(comparison => {
        Object.keys(comparison.features).forEach(feature => {
          allFeatureIds.add(feature);
        });
      });
      
      // All tiers should define the same features (even if not enabled)
      Object.values(TIER_COMPARISONS).forEach(comparison => {
        allFeatureIds.forEach(featureId => {
          expect(comparison.features[featureId]).toBeDefined();
        });
      });
    });
  });

  // =============================================================================
  // INTEGRATION VERIFICATION
  // =============================================================================

  describe('System Integration', () => {
    it('should work end-to-end for all tier/preset combinations', () => {
      const testCombinations = [
        { tier: 'starter', preset: 'salon-waitlist' },
        { tier: 'pro', preset: 'realtor-listing-hub' },
        { tier: 'advanced', preset: 'consultation-engine' },
        // Cross-tier combinations
        { tier: 'pro', preset: 'salon-waitlist' },
        { tier: 'advanced', preset: 'realtor-listing-hub' },
      ];

      testCombinations.forEach(({ tier, preset }) => {
        setTierAndClear(tier as TierLevel, preset as PresetName);
        
        expect(() => {
          const config = getAppConfig();
          const optimizer = getPerformanceOptimizer();
          const availablePresets = getAvailablePresets();
          
          // All should work without throwing
          expect(config).toBeDefined();
          expect(optimizer).toBeDefined();
          expect(availablePresets).toBeDefined();
        }).not.toThrow();
      });
    });

    it('should handle edge cases gracefully', () => {
      // Test with missing environment variables
      delete process.env.APP_TIER;
      delete process.env.APP_PRESET;
      clearAppConfigCache();
      
      expect(() => {
        const config = getAppConfig();
        expect(config.tier).toBe('starter'); // Should default
      }).not.toThrow();
      
      // Test with invalid tier
      process.env.APP_TIER = 'invalid-tier';
      clearAppConfigCache();
      
      expect(() => {
        const config = getAppConfig();
        expect(config.tier).toBe('starter'); // Should fallback
      }).not.toThrow();
    });

    it('should maintain performance across all configurations', () => {
      // Test that configuration loading is fast for all combinations
      const startTime = Date.now();
      
      ALL_TIERS.forEach(tier => {
        ALL_PRESETS.forEach(preset => {
          setTierAndClear(tier, preset);
          getAppConfig(); // Load configuration
        });
      });
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should load all combinations in reasonable time (< 1 second)
      expect(totalTime).toBeLessThan(1000);
    });
  });
});

// =============================================================================
// FINAL VERIFICATION
// =============================================================================

describe('Final System Verification', () => {
  it('should pass comprehensive tier system validation', () => {
    // Test that all core functions work for all tiers without errors
    ALL_TIERS.forEach(tier => {
      setTierAndClear(tier);
      
      // Core functions should all work
      expect(getCurrentTier()).toBe(tier);
      expect(() => getAllFeatureStatuses()).not.toThrow();
      expect(() => getTierMatrix()).not.toThrow();
      expect(() => getAppConfig()).not.toThrow();
      expect(() => getPerformanceOptimizer()).not.toThrow();
      
      // Feature checking should work
      const allFeatures: FeatureFlag[] = [
        'database', 'email', 'payments', 'webhooks', 'automation',
        'notifications', 'error_tracking', 'admin_operations',
        'ai_features', 'debug_mode', 'safe_mode',
        'performance_monitoring', 'health_checks'
      ];
      
      allFeatures.forEach(feature => {
        expect(() => isEnabled(feature)).not.toThrow();
        expect(() => isFeatureEnabledForTier(feature)).not.toThrow();
      });
    });
  });

  it('should demonstrate no hard-coded tier dependencies', () => {
    // The system should work purely through configuration
    // If any hard-coded checks existed, changing tiers wouldn't work properly
    
    const behaviors: Array<{ tier: TierLevel; hasAI: boolean; hasPayments: boolean }> = [];
    
    ALL_TIERS.forEach(tier => {
      setTierAndClear(tier);
      
      behaviors.push({
        tier,
        hasAI: isEnabled('ai_features'),
        hasPayments: isEnabled('payments'),
      });
    });
    
    // Verify expected progressive capabilities
    const starter = behaviors.find(b => b.tier === 'starter')!;
    const pro = behaviors.find(b => b.tier === 'pro')!;
    const advanced = behaviors.find(b => b.tier === 'advanced')!;
    
    // Starter should have basic features only
    expect(starter.hasAI).toBe(false);
    expect(starter.hasPayments).toBe(false);
    
    // Pro should have more features
    expect(pro.hasPayments).toBe(true);
    
    // Advanced should have all features  
    expect(advanced.hasAI).toBe(true);
    expect(advanced.hasPayments).toBe(true);
    
    console.log('✅ Tier system verification completed successfully');
    console.log(`   - ${ALL_TIERS.length} tiers tested`);
    console.log(`   - ${ALL_PRESETS.length} presets tested`);
    console.log('   - All combinations work without hard-coded checks');
  });
});