/**
 * @fileoverview Stripe service class for secure payment processing
 */

import Stripe from 'stripe';
import type { 
  StripeCheckoutConfig, 
  CheckoutSession, 
  StripeError, 
  CheckoutLineItem,
  CheckoutMetadata 
} from '../types';

export class StripeService {
  private stripe: Stripe | null = null;
  private config: StripeCheckoutConfig;

  constructor(config: StripeCheckoutConfig, secretKey?: string) {
    this.config = config;
    
    if (config.enabled && secretKey) {
      try {
        this.stripe = new Stripe(secretKey, {
          apiVersion: '2023-10-16',
          typescript: true,
        });
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        this.stripe = null;
      }
    }
  }

  /**
   * Check if Stripe is available and properly configured
   */
  isAvailable(): boolean {
    return this.config.enabled && this.stripe !== null;
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    lineItems: CheckoutLineItem[],
    options: {
      customerEmail?: string;
      customerId?: string;
      metadata?: CheckoutMetadata;
      successUrl?: string;
      cancelUrl?: string;
      allowPromotionCodes?: boolean;
      collectBillingAddress?: boolean;
      collectPhoneNumber?: boolean;
      automaticTax?: boolean;
    } = {}
  ): Promise<CheckoutSession> {
    if (!this.stripe) {
      throw this.createError('authentication', 'Stripe not initialized');
    }

    try {
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'payment',
        line_items: lineItems.map(item => ({
          price: item.price,
          quantity: item.quantity,
        })),
        success_url: options.successUrl || this.config.successUrl || '',
        cancel_url: options.cancelUrl || this.config.cancelUrl || '',
        metadata: this.sanitizeMetadata(options.metadata || {}),
      };

      // Add customer information
      if (options.customerId) {
        sessionParams.customer = options.customerId;
      } else if (options.customerEmail) {
        sessionParams.customer_email = options.customerEmail;
      }

      // Add optional features based on tier and options
      if (options.allowPromotionCodes && this.config.tier !== 'starter') {
        sessionParams.allow_promotion_codes = true;
      }

      if (options.collectBillingAddress) {
        sessionParams.billing_address_collection = 'required';
      }

      if (options.collectPhoneNumber) {
        sessionParams.phone_number_collection = { enabled: true };
      }

      // Automatic tax for Pro+ tiers
      if (options.automaticTax && this.config.tier !== 'starter' && this.config.automaticTax) {
        sessionParams.automatic_tax = { enabled: true };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      return {
        id: session.id,
        url: session.url || '',
        status: session.status || 'open',
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        customerId: session.customer as string | undefined,
        metadata: session.metadata || undefined,
      };

    } catch (error) {
      throw this.handleStripeError(error);
    }
  }

  /**
   * Retrieve a checkout session
   */
  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    if (!this.stripe) {
      throw this.createError('authentication', 'Stripe not initialized');
    }

    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);

      return {
        id: session.id,
        url: session.url || '',
        status: session.status || 'open',
        amount: session.amount_total || 0,
        currency: session.currency || 'usd',
        customerId: session.customer as string | undefined,
        metadata: session.metadata || undefined,
      };

    } catch (error) {
      throw this.handleStripeError(error);
    }
  }

  /**
   * Create a customer portal session (Pro+ feature)
   */
  async createCustomerPortalSession(
    customerId: string,
    returnUrl: string
  ): Promise<{ url: string }> {
    if (!this.stripe) {
      throw this.createError('authentication', 'Stripe not initialized');
    }

    if (this.config.tier === 'starter') {
      throw this.createError('validation', 'Customer portal requires Pro or Advanced tier');
    }

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { url: session.url };

    } catch (error) {
      throw this.handleStripeError(error);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    webhookSecret: string
  ): Stripe.Event {
    if (!this.stripe) {
      throw this.createError('authentication', 'Stripe not initialized');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      throw this.handleStripeError(error);
    }
  }

  /**
   * Handle Stripe errors and convert to our error format
   */
  private handleStripeError(error: unknown): StripeError {
    if (error instanceof Stripe.errors.StripeError) {
      let type: StripeError['type'] = 'api_error';

      if (error instanceof Stripe.errors.StripeCardError) {
        type = 'validation';
      } else if (error instanceof Stripe.errors.StripeRateLimitError) {
        type = 'rate_limit';
      } else if (error instanceof Stripe.errors.StripeAuthenticationError) {
        type = 'authentication';
      } else if (error instanceof Stripe.errors.StripeConnectionError) {
        type = 'network';
      }

      return {
        type,
        message: error.message,
        code: error.code,
        requestId: error.requestId,
        statusCode: error.statusCode,
      };
    }

    return this.createError('unknown', 'An unexpected error occurred');
  }

  /**
   * Create a standardized error
   */
  private createError(type: StripeError['type'], message: string, code?: string): StripeError {
    return {
      type,
      message,
      code,
    };
  }

  /**
   * Sanitize metadata to ensure all values are strings (Stripe requirement)
   */
  private sanitizeMetadata(metadata: CheckoutMetadata): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata)) {
      if (value !== undefined) {
        sanitized[key] = String(value);
      }
    }
    return sanitized;
  }
}