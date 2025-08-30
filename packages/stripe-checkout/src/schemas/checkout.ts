/**
 * @fileoverview Validation schemas for Stripe checkout
 */

import { z } from 'zod';

export const stripeCheckoutSchema = z.object({
  /** Line items for checkout */
  lineItems: z.array(z.object({
    price: z.string().min(1, 'Price ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    /** Amount in cents - required for fallback pricing to prevent calculation errors */
    amount: z.number().int().positive('Amount must be positive').optional(),
  })).min(1, 'At least one line item is required'),
  
  /** Customer email (optional) */
  customerEmail: z.string().email().optional(),
  
  /** Success URL override */
  successUrl: z.string().url().optional(),
  
  /** Cancel URL override */
  cancelUrl: z.string().url().optional(),
  
  /** Custom metadata */
  metadata: z.record(z.string(), z.string()).optional(),
  
  /** Customer ID for existing customers */
  customerId: z.string().optional(),
  
  /** Allow promotion codes */
  allowPromotionCodes: z.boolean().default(false),
  
  /** Collect billing address */
  collectBillingAddress: z.boolean().default(false),
  
  /** Collect phone number */
  collectPhoneNumber: z.boolean().default(false),
  
  /** Enable automatic tax calculation (Pro+ only) */
  automaticTax: z.boolean().default(false),
});

export type StripeCheckoutData = z.infer<typeof stripeCheckoutSchema>;

export const fallbackCheckoutSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  description: z.string().min(1, 'Description is required'),
  customerEmail: z.string().email().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type FallbackCheckoutData = z.infer<typeof fallbackCheckoutSchema>;

export const webhookEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  created: z.number(),
});

export type WebhookEventData = z.infer<typeof webhookEventSchema>;