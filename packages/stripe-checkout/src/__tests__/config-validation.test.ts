/**
 * @fileoverview Tests for configuration validation utilities
 */

import {
  validateStripeConfig,
  canFallback,
  getFeatureAvailability,
  getConfigRecommendations,
} from '../utils/config-validation';
import type { StripeCheckoutConfig } from '../types';

describe('Config Validation Tests', () => {
  const validConfig = {
    publicKey: 'pk_test_123456789',
    secretKey: 'sk_test_123456789',
    webhookSecret: 'whsec_123456789',
    enabled: true,
    tier: 'pro' as const,
    fallbackMode: 'manual' as const,
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  };

  describe('Basic Configuration Validation', () => {
    it('should validate correct configuration', () => {
      const result = validateStripeConfig(validConfig);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.fallbackMode).toBe('manual');
    });

    it('should reject missing public key', () => {
      const config = { ...validConfig };
      delete config.publicKey;
      
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Stripe public key is required');
    });

    it('should reject invalid public key format', () => {
      const config = { ...validConfig, publicKey: 'invalid_key' };
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid Stripe public key format');
    });

    it('should reject missing secret key', () => {
      const config = { ...validConfig };
      delete config.secretKey;
      
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Stripe secret key is required');
    });

    it('should reject invalid secret key format', () => {
      const config = { ...validConfig, secretKey: 'invalid_key' };
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid Stripe secret key format');
    });
  });

  describe('Key Environment Consistency', () => {
    it('should accept consistent test keys', () => {
      const config = {
        ...validConfig,
        publicKey: 'pk_test_123',
        secretKey: 'sk_test_123',
      };
      
      const result = validateStripeConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should accept consistent live keys', () => {
      const config = {
        ...validConfig,
        publicKey: 'pk_live_123',
        secretKey: 'sk_live_123',
      };
      
      const result = validateStripeConfig(config);
      expect(result.valid).toBe(true);
    });

    it('should reject mixed environment keys', () => {
      const config = {
        ...validConfig,
        publicKey: 'pk_test_123',
        secretKey: 'sk_live_123',
      };
      
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Stripe public and secret keys must be from the same environment');
    });

    it('should warn about production keys in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const config = {
        ...validConfig,
        publicKey: 'pk_live_123',
        secretKey: 'sk_live_123',
      };
      
      const result = validateStripeConfig(config);
      
      expect(result.warnings).toContain('Using production Stripe keys in non-production environment');
      
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Webhook Configuration', () => {
    it('should warn about missing webhook secret', () => {
      const config = { ...validConfig };
      delete config.webhookSecret;
      
      const result = validateStripeConfig(config);
      
      expect(result.warnings).toContain('Webhook secret not configured - webhook events will be disabled');
    });

    it('should reject invalid webhook secret format', () => {
      const config = { ...validConfig, webhookSecret: 'invalid_secret' };
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid webhook secret format');
    });
  });

  describe('URL Validation', () => {
    it('should reject invalid success URL', () => {
      const config = { ...validConfig, successUrl: 'not-a-url' };
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid success URL format');
    });

    it('should reject invalid cancel URL', () => {
      const config = { ...validConfig, cancelUrl: 'not-a-url' };
      const result = validateStripeConfig(config);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid cancel URL format');
    });

    it('should accept valid HTTP/HTTPS URLs', () => {
      const config = {
        ...validConfig,
        successUrl: 'https://example.com/success',
        cancelUrl: 'http://localhost:3000/cancel',
      };
      
      const result = validateStripeConfig(config);
      expect(result.valid).toBe(true);
    });
  });

  describe('Tier Validation', () => {
    it('should warn about missing tier', () => {
      const config = { ...validConfig };
      delete (config as any).tier;
      
      const result = validateStripeConfig(config);
      expect(result.warnings).toContain('App tier not specified, defaulting to starter');
    });

    it('should warn about automatic tax on starter tier', () => {
      const config = {
        ...validConfig,
        tier: 'starter' as const,
        automaticTax: true,
      };
      
      const result = validateStripeConfig(config);
      expect(result.warnings).toContain('Automatic tax requires Pro or Advanced tier');
    });
  });

  describe('Fallback Mode Determination', () => {
    it('should use disabled fallback for valid configuration', () => {
      const result = validateStripeConfig(validConfig);
      expect(result.fallbackMode).toBe('manual'); // Uses explicit fallbackMode
    });

    it('should auto-determine fallback for advanced tier', () => {
      const config = { ...validConfig, tier: 'advanced' as const };
      delete (config as any).fallbackMode;
      
      // Introduce errors to trigger fallback logic
      delete (config as any).secretKey;
      
      const result = validateStripeConfig(config);
      expect(result.fallbackMode).toBe('redirect');
    });

    it('should auto-determine fallback for pro tier', () => {
      const config = { ...validConfig, tier: 'pro' as const };
      delete (config as any).fallbackMode;
      
      // Introduce errors to trigger fallback logic
      delete (config as any).secretKey;
      
      const result = validateStripeConfig(config);
      expect(result.fallbackMode).toBe('manual');
    });

    it('should disable fallback for starter tier with errors', () => {
      const config = { ...validConfig, tier: 'starter' as const };
      delete (config as any).fallbackMode;
      delete (config as any).secretKey;
      
      const result = validateStripeConfig(config);
      expect(result.fallbackMode).toBe('disabled');
    });
  });

  describe('Feature Availability', () => {
    it('should provide correct features for starter tier', () => {
      const config: StripeCheckoutConfig = {
        publicKey: 'pk_test_123',
        enabled: true,
        tier: 'starter',
        fallbackMode: 'disabled',
      };
      
      const features = getFeatureAvailability(config);
      
      expect(features.promotionCodes).toBe(false);
      expect(features.automaticTax).toBe(false);
      expect(features.customerPortal).toBe(false);
      expect(features.advancedMetadata).toBe(false);
      expect(features.multiplePaymentMethods).toBe(false);
      expect(features.subscriptions).toBe(false);
    });

    it('should provide correct features for pro tier', () => {
      const config: StripeCheckoutConfig = {
        publicKey: 'pk_test_123',
        enabled: true,
        tier: 'pro',
        fallbackMode: 'manual',
        automaticTax: true,
      };
      
      const features = getFeatureAvailability(config);
      
      expect(features.promotionCodes).toBe(true);
      expect(features.automaticTax).toBe(true);
      expect(features.customerPortal).toBe(true);
      expect(features.advancedMetadata).toBe(false);
      expect(features.multiplePaymentMethods).toBe(false);
      expect(features.subscriptions).toBe(true);
    });

    it('should provide correct features for advanced tier', () => {
      const config: StripeCheckoutConfig = {
        publicKey: 'pk_test_123',
        enabled: true,
        tier: 'advanced',
        fallbackMode: 'redirect',
        automaticTax: true,
      };
      
      const features = getFeatureAvailability(config);
      
      expect(features.promotionCodes).toBe(true);
      expect(features.automaticTax).toBe(true);
      expect(features.customerPortal).toBe(true);
      expect(features.advancedMetadata).toBe(true);
      expect(features.multiplePaymentMethods).toBe(true);
      expect(features.subscriptions).toBe(true);
    });
  });

  describe('Fallback Capability', () => {
    it('should detect fallback capability', () => {
      const configs = [
        { fallbackMode: 'disabled' as const, expected: false },
        { fallbackMode: 'manual' as const, expected: true },
        { fallbackMode: 'redirect' as const, expected: true },
      ];
      
      configs.forEach(({ fallbackMode, expected }) => {
        const config: StripeCheckoutConfig = {
          publicKey: 'pk_test_123',
          enabled: true,
          tier: 'pro',
          fallbackMode,
        };
        
        expect(canFallback(config)).toBe(expected);
      });
    });
  });

  describe('Configuration Recommendations', () => {
    it('should recommend success URL when missing', () => {
      const config = { ...validConfig };
      delete (config as any).successUrl;
      
      const recommendations = getConfigRecommendations(config);
      expect(recommendations).toContain('Set a success URL for better user experience');
    });

    it('should recommend cancel URL when missing', () => {
      const config = { ...validConfig };
      delete (config as any).cancelUrl;
      
      const recommendations = getConfigRecommendations(config);
      expect(recommendations).toContain('Set a cancel URL to handle payment cancellations');
    });

    it('should recommend fallback mode for starter tier', () => {
      const config = {
        ...validConfig,
        tier: 'starter' as const,
        fallbackMode: 'disabled' as const,
      };
      
      const recommendations = getConfigRecommendations(config);
      expect(recommendations).toContain('Consider enabling fallback mode for better reliability');
    });

    it('should recommend automatic tax for pro/advanced tiers', () => {
      const config = {
        ...validConfig,
        tier: 'pro' as const,
        automaticTax: false,
      };
      
      const recommendations = getConfigRecommendations(config);
      expect(recommendations).toContain('Enable automatic tax calculation for compliance');
    });

    it('should not recommend automatic tax for starter tier', () => {
      const config = {
        ...validConfig,
        tier: 'starter' as const,
        automaticTax: false,
      };
      
      const recommendations = getConfigRecommendations(config);
      expect(recommendations).not.toContain('Enable automatic tax calculation for compliance');
    });
  });
});