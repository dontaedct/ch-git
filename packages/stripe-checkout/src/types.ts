/**
 * @fileoverview Type definitions for Stripe checkout block
 */

import type Stripe from 'stripe';

export interface StripeCheckoutConfig {
  /** Stripe public key */
  publicKey: string;
  /** Whether Stripe integration is enabled */
  enabled: boolean;
  /** Current app tier (affects available features) */
  tier: 'starter' | 'pro' | 'advanced';
  /** Fallback mode when Stripe is unavailable */
  fallbackMode: 'disabled' | 'manual' | 'redirect';
  /** Success redirect URL */
  successUrl?: string;
  /** Cancel redirect URL */
  cancelUrl?: string;
  /** Enable automatic tax calculation */
  automaticTax?: boolean;
  /** Customer portal URL for Pro+ tiers */
  customerPortalUrl?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  status: 'open' | 'complete' | 'expired';
  amount: number;
  currency: string;
  customerId?: string;
  metadata?: Record<string, string>;
}

export interface StripeError {
  type: 'validation' | 'network' | 'authentication' | 'rate_limit' | 'api_error' | 'unknown';
  message: string;
  code?: string;
  requestId?: string;
  statusCode?: number;
}

export interface CheckoutLineItem {
  price: string;
  quantity: number;
}

export interface CheckoutMetadata {
  userId?: string;
  planType?: string;
  source?: string;
  [key: string]: string | undefined;
}

export interface FallbackCheckoutData {
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  metadata?: CheckoutMetadata;
}

export interface ManualCheckoutResult {
  type: 'manual';
  reference: string;
  instructions: string[];
  contactInfo: {
    email?: string;
    phone?: string;
    address?: string;
  };
  paymentMethods: string[];
  totalAmount: string;
  currency: string;
}

export interface RedirectCheckoutResult {
  type: 'redirect';
  url: string;
  reference: string;
}

export type FallbackCheckoutResult = ManualCheckoutResult | RedirectCheckoutResult;

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Stripe.Event.Data.Object;
  };
  created: number;
}

export type CheckoutStatus = 'idle' | 'loading' | 'success' | 'error' | 'fallback';

export interface CheckoutState {
  status: CheckoutStatus;
  error?: StripeError;
  sessionId?: string;
  sessionUrl?: string;
}