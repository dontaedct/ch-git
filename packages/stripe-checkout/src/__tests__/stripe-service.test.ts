/**
 * @fileoverview Contract tests for Stripe service
 */

import { StripeService } from '../service/stripe-service';
import type { StripeCheckoutConfig } from '../types';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('StripeService Contract Tests', () => {
  let mockStripe: any;
  let service: StripeService;
  let config: StripeCheckoutConfig;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    config = {
      publicKey: 'pk_test_123',
      enabled: true,
      tier: 'pro',
      fallbackMode: 'manual',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    service = new StripeService(config, 'sk_test_123');
    mockStripe = (service as any).stripe;
  });

  describe('Service Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(service.isAvailable()).toBe(true);
    });

    it('should not initialize without secret key', () => {
      const serviceWithoutKey = new StripeService(config);
      expect(serviceWithoutKey.isAvailable()).toBe(false);
    });

    it('should not initialize when disabled', () => {
      const disabledConfig = { ...config, enabled: false };
      const disabledService = new StripeService(disabledConfig, 'sk_test_123');
      expect(disabledService.isAvailable()).toBe(false);
    });
  });

  describe('Checkout Session Creation', () => {
    it('should create checkout session with minimum required data', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount_total: 2000,
        currency: 'usd',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const lineItems = [{ price: 'price_123', quantity: 1 }];
      const result = await service.createCheckoutSession(lineItems);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          line_items: [{ price: 'price_123', quantity: 1 }],
          success_url: config.successUrl,
          cancel_url: config.cancelUrl,
          metadata: {},
        })
      );

      expect(result).toEqual({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount: 2000,
        currency: 'usd',
        customerId: undefined,
        metadata: undefined,
      });
    });

    it('should create checkout session with customer email', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount_total: 2000,
        currency: 'usd',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const lineItems = [{ price: 'price_123', quantity: 1 }];
      await service.createCheckoutSession(lineItems, {
        customerEmail: 'test@example.com',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_email: 'test@example.com',
        })
      );
    });

    it('should create checkout session with existing customer', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount_total: 2000,
        currency: 'usd',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const lineItems = [{ price: 'price_123', quantity: 1 }];
      await service.createCheckoutSession(lineItems, {
        customerId: 'cus_123',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: 'cus_123',
        })
      );
    });

    it('should include promotion codes for non-starter tiers', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount_total: 2000,
        currency: 'usd',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const lineItems = [{ price: 'price_123', quantity: 1 }];
      await service.createCheckoutSession(lineItems, {
        allowPromotionCodes: true,
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          allow_promotion_codes: true,
        })
      );
    });

    it('should not include promotion codes for starter tier', async () => {
      const starterConfig = { ...config, tier: 'starter' as const };
      const starterService = new StripeService(starterConfig, 'sk_test_123');

      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'open',
        amount_total: 2000,
        currency: 'usd',
      };

      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const lineItems = [{ price: 'price_123', quantity: 1 }];
      await starterService.createCheckoutSession(lineItems, {
        allowPromotionCodes: true,
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.not.objectContaining({
          allow_promotion_codes: true,
        })
      );
    });

    it('should handle Stripe API errors', async () => {
      const stripeError = new Error('Invalid price ID');
      (stripeError as any).type = 'StripeCardError';
      
      mockStripe.checkout.sessions.create.mockRejectedValue(stripeError);

      const lineItems = [{ price: 'invalid_price', quantity: 1 }];

      await expect(service.createCheckoutSession(lineItems)).rejects.toThrow();
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve checkout session by ID', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'complete',
        amount_total: 2000,
        currency: 'usd',
        customer: 'cus_123',
        metadata: { orderId: '123' },
      };

      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);

      const result = await service.getCheckoutSession('cs_test_123');

      expect(mockStripe.checkout.sessions.retrieve).toHaveBeenCalledWith('cs_test_123');
      expect(result).toEqual({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
        status: 'complete',
        amount: 2000,
        currency: 'usd',
        customerId: 'cus_123',
        metadata: { orderId: '123' },
      });
    });

    it('should handle session not found errors', async () => {
      const stripeError = new Error('Session not found');
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(stripeError);

      await expect(service.getCheckoutSession('cs_invalid')).rejects.toThrow();
    });
  });

  describe('Customer Portal (Pro+ Feature)', () => {
    it('should create customer portal session for pro tier', async () => {
      const mockPortalSession = {
        url: 'https://billing.stripe.com/session',
      };

      mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession);

      const result = await service.createCustomerPortalSession('cus_123', 'https://example.com');

      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'https://example.com',
      });

      expect(result).toEqual({
        url: 'https://billing.stripe.com/session',
      });
    });

    it('should reject customer portal for starter tier', async () => {
      const starterConfig = { ...config, tier: 'starter' as const };
      const starterService = new StripeService(starterConfig, 'sk_test_123');

      await expect(
        starterService.createCustomerPortalSession('cus_123', 'https://example.com')
      ).rejects.toThrow('Customer portal requires Pro or Advanced tier');
    });
  });

  describe('Webhook Verification', () => {
    it('should verify valid webhook signatures', () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'checkout.session.completed',
        data: { object: {} },
      };

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = service.verifyWebhookSignature(
        '{"test": "payload"}',
        'stripe_signature',
        'whsec_123'
      );

      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        '{"test": "payload"}',
        'stripe_signature',
        'whsec_123'
      );

      expect(result).toEqual(mockEvent);
    });

    it('should reject invalid webhook signatures', () => {
      const stripeError = new Error('Invalid signature');
      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw stripeError;
      });

      expect(() => {
        service.verifyWebhookSignature(
          '{"test": "payload"}',
          'invalid_signature',
          'whsec_123'
        );
      }).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', async () => {
      const serviceWithoutStripe = new StripeService(config);

      await expect(
        serviceWithoutStripe.createCheckoutSession([])
      ).rejects.toMatchObject({
        type: 'authentication',
        message: 'Stripe not initialized',
      });
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (networkError as any).type = 'StripeConnectionError';
      
      mockStripe.checkout.sessions.create.mockRejectedValue(networkError);

      await expect(
        service.createCheckoutSession([{ price: 'price_123', quantity: 1 }])
      ).rejects.toMatchObject({
        type: 'network',
      });
    });
  });
});