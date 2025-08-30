/**
 * @fileoverview Stripe checkout block with graceful fallbacks
 * 
 * Features:
 * - Secure Stripe checkout integration
 * - Tier-based feature gating (Basic, Pro, Advanced)
 * - Graceful fallbacks when Stripe is unavailable
 * - Server actions for secure payment processing
 * - Client-side error handling and recovery
 * - Comprehensive logging and monitoring
 */

export { StripeCheckoutForm } from './components/StripeCheckoutForm';
export { StripePaymentButton } from './components/StripePaymentButton';
export { StripeProvider } from './components/StripeProvider';

export { createStripeCheckout } from './actions/create-checkout';
export { handleStripeWebhook } from './actions/handle-webhook';
export { getCheckoutSession } from './actions/get-session';

export { stripeCheckoutSchema, type StripeCheckoutData } from './schemas/checkout';
export { type StripeCheckoutConfig, type StripeError, type CheckoutSession, type FallbackCheckoutResult, type CheckoutState } from './types';

export { StripeService } from './service/stripe-service';
export { validateStripeConfig } from './utils/config-validation';
export { createFallbackCheckout } from './fallbacks/manual-checkout';