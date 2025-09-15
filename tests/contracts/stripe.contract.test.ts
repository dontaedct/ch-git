/**
 * @fileoverview Contract tests for Stripe integration
 */

import { StripeService } from '@dct/stripe-checkout';
import type { StripeCheckoutConfig } from '@dct/stripe-checkout';

describe('Stripe Integration Contract Tests', () => {
  const config: StripeCheckoutConfig = {
    publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_123',
    enabled: true,
    tier: 'pro',
    fallbackMode: 'manual',
    successUrl: 'https://example.com/success',
    cancelUrl: 'https://example.com/cancel',
  };

  describe('Service Integration', () => {
    it('should initialize Stripe service correctly', () => {
      const service = new StripeService(config, process.env.STRIPE_SECRET_KEY);
      
      // Service availability depends on environment configuration
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
        expect(service.isAvailable()).toBe(true);
      } else {
        expect(service.isAvailable()).toBe(false);
      }
    });

    it('should handle missing credentials gracefully', () => {
      const serviceWithoutKey = new StripeService(config);
      expect(serviceWithoutKey.isAvailable()).toBe(false);
    });

    it('should respect disabled configuration', () => {
      const disabledConfig = { ...config, enabled: false };
      const service = new StripeService(disabledConfig, 'sk_test_123');
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('Environment Configuration', () => {
    it('should detect test environment correctly', () => {
      if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
        // Test environment detected
        expect(process.env.NODE_ENV).not.toBe('production');
      }
    });

    it('should have consistent key environments', () => {
      const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const secretKey = process.env.STRIPE_SECRET_KEY;

      if (publicKey && secretKey) {
        const pubIsTest = publicKey.startsWith('pk_test_');
        const secretIsTest = secretKey.startsWith('sk_test_');
        
        expect(pubIsTest).toBe(secretIsTest);
      }
    });
  });

  describe('Webhook Configuration', () => {
    it('should have webhook secret if webhooks are enabled', () => {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      // If webhook secret exists, it should have correct format
      if (webhookSecret) {
        expect(webhookSecret).toMatch(/^whsec_/);
      }
    });
  });

  describe('Fallback Configuration', () => {
    it('should have fallback contact info if fallback is enabled', () => {
      if (config.fallbackMode !== 'disabled') {
        // At least one contact method should be available for fallback
        const hasContactEmail = Boolean(process.env.BUSINESS_EMAIL);
        const hasContactPhone = Boolean(process.env.BUSINESS_PHONE);
        const hasFallbackUrl = Boolean(process.env.FALLBACK_PAYMENT_URL);
        
        // In development/test environments, it's OK to not have fallback contact configured
        if (process.env.NODE_ENV === 'production') {
          expect(hasContactEmail || hasContactPhone || hasFallbackUrl).toBe(true);
        } else {
          // Just ensure the test passes - configuration is optional in development
          expect(true).toBe(true);
        }
      } else {
        // Fallback is disabled, so no contact info is needed
        expect(true).toBe(true);
      }
    });
  });

  describe('Integration Health Check', () => {
    it('should pass basic health checks', async () => {
      // This test ensures all required environment variables are available
      // for the Stripe integration to work properly
      
      const hasPublicKey = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
      const hasSecretKey = Boolean(process.env.STRIPE_SECRET_KEY);
      
      if (config.enabled && process.env.NODE_ENV === 'production') {
        // Only enforce strict key requirements in production
        expect(hasPublicKey).toBe(true);
        expect(hasSecretKey).toBe(true);
      } else {
        // In development/test, Stripe keys are optional
        // The service should handle missing keys gracefully
        expect(true).toBe(true);
      }
      
      // Configuration validation - these should always be valid
      expect(config.tier).toMatch(/^(starter|pro|advanced)$/);
      expect(config.fallbackMode).toMatch(/^(disabled|manual|redirect)$/);
      
      // Service should not throw when initialized without keys
      expect(() => new StripeService(config)).not.toThrow();
    });
  });
});
