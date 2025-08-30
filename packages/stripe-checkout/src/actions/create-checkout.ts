/**
 * @fileoverview Server action for creating Stripe checkout sessions
 */

'use server';

import { StripeService } from '../service/stripe-service';
import { stripeCheckoutSchema, fallbackCheckoutSchema } from '../schemas/checkout';
import { validateStripeConfig, canFallback } from '../utils/config-validation';
import { createFallbackCheckout } from '../fallbacks/manual-checkout';
import type { StripeCheckoutConfig, CheckoutSession, FallbackCheckoutResult } from '../types';

/**
 * Create a Stripe checkout session with fallback support
 */
export async function createStripeCheckout(
  formData: FormData | Record<string, unknown>,
  config: StripeCheckoutConfig
): Promise<{
  success: boolean;
  data?: CheckoutSession | FallbackCheckoutResult;
  error?: string;
  fallback?: boolean;
}> {
  try {
    // Parse form data
    const parsedData = typeof formData === 'object' && !(formData instanceof FormData)
      ? formData
      : Object.fromEntries(formData instanceof FormData ? formData.entries() : []);

    // Validate checkout data
    const validation = stripeCheckoutSchema.safeParse(parsedData);
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors.map(e => e.message).join(', '),
      };
    }

    const checkoutData = validation.data;

    // Get Stripe configuration
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const configValidation = validateStripeConfig({
      ...config,
      secretKey,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });

    // If Stripe is available, try to create session
    if (configValidation.valid && secretKey) {
      try {
        const stripeService = new StripeService(config, secretKey);
        
        if (stripeService.isAvailable()) {
          const session = await stripeService.createCheckoutSession(
            checkoutData.lineItems,
            {
              customerEmail: checkoutData.customerEmail,
              customerId: checkoutData.customerId,
              metadata: checkoutData.metadata,
              successUrl: checkoutData.successUrl,
              cancelUrl: checkoutData.cancelUrl,
              allowPromotionCodes: checkoutData.allowPromotionCodes,
              collectBillingAddress: checkoutData.collectBillingAddress,
              collectPhoneNumber: checkoutData.collectPhoneNumber,
              automaticTax: checkoutData.automaticTax,
            }
          );

          return {
            success: true,
            data: session,
          };
        }
      } catch (error) {
        console.error('Stripe checkout creation failed:', error);
        
        // If we can't fallback, return the error
        if (!canFallback(config)) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Payment service unavailable',
          };
        }
      }
    }

    // Fallback mode
    if (canFallback(config)) {
      // Convert line items to fallback format
      const totalAmount = calculateTotalAmount(checkoutData.lineItems);
      const currency = 'usd'; // Default currency, should be configurable
      
      const fallbackData = {
        amount: totalAmount,
        currency,
        description: generateDescription(checkoutData.lineItems),
        customerEmail: checkoutData.customerEmail,
        metadata: checkoutData.metadata,
      };

      // Validate fallback data
      const fallbackValidation = fallbackCheckoutSchema.safeParse(fallbackData);
      if (!fallbackValidation.success) {
        return {
          success: false,
          error: 'Invalid payment data for fallback processing',
        };
      }

      const fallbackResult = createFallbackCheckout(fallbackValidation.data, {
        mode: config.fallbackMode === 'redirect' ? 'redirect' : 'manual',
        contactEmail: process.env.BUSINESS_EMAIL,
        contactPhone: process.env.BUSINESS_PHONE,
        redirectUrl: process.env.FALLBACK_PAYMENT_URL,
      });

      return {
        success: true,
        data: fallbackResult,
        fallback: true,
      };
    }

    return {
      success: false,
      error: 'Payment processing is temporarily unavailable',
    };

  } catch (error) {
    console.error('Checkout creation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Calculate total amount from line items
 * Note: This is a simplified calculation. In practice, you'd fetch prices from Stripe.
 */
function calculateTotalAmount(lineItems: Array<{ price: string; quantity: number }>): number {
  // This is a placeholder - in real implementation, you'd look up prices
  // For demo purposes, assuming price IDs encode the amount
  return lineItems.reduce((total, item) => {
    // Extract amount from price ID (this is just for demo)
    const match = item.price.match(/price_(.*)_(\d+)/);
    const amount = match ? parseInt(match[2]) : 1000; // Default $10.00
    return total + (amount * item.quantity);
  }, 0);
}

/**
 * Generate description from line items
 */
function generateDescription(lineItems: Array<{ price: string; quantity: number }>): string {
  if (lineItems.length === 1) {
    return `Payment for ${lineItems[0].quantity}x item (${lineItems[0].price})`;
  }
  return `Payment for ${lineItems.length} items`;
}

/**
 * Get checkout session status
 */
export async function getCheckoutSession(
  sessionId: string,
  config: StripeCheckoutConfig
): Promise<{
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}> {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      return {
        success: false,
        error: 'Stripe not configured',
      };
    }

    const stripeService = new StripeService(config, secretKey);
    
    if (!stripeService.isAvailable()) {
      return {
        success: false,
        error: 'Stripe service unavailable',
      };
    }

    const session = await stripeService.getCheckoutSession(sessionId);

    return {
      success: true,
      data: session,
    };

  } catch (error) {
    console.error('Failed to retrieve checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve session',
    };
  }
}