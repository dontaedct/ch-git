/**
 * @fileoverview Manual checkout fallback for when Stripe is unavailable
 */

import type { FallbackCheckoutData, CheckoutMetadata } from '../types';

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

/**
 * Create a manual checkout fallback
 */
export function createFallbackCheckout(
  data: FallbackCheckoutData,
  options: {
    mode: 'manual' | 'redirect';
    contactEmail?: string;
    contactPhone?: string;
    redirectUrl?: string;
    reference?: string;
  }
): FallbackCheckoutResult {
  const reference = options.reference || generateReference();
  
  if (options.mode === 'redirect' && options.redirectUrl) {
    return {
      type: 'redirect',
      url: buildRedirectUrl(options.redirectUrl, data, reference),
      reference,
    };
  }

  return {
    type: 'manual',
    reference,
    instructions: generateInstructions(data, reference),
    contactInfo: {
      email: options.contactEmail,
      phone: options.contactPhone,
    },
    paymentMethods: getAvailablePaymentMethods(),
    totalAmount: formatAmount(data.amount, data.currency),
    currency: data.currency.toUpperCase(),
  };
}

/**
 * Generate a unique reference number
 */
function generateReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `REF-${timestamp}-${random}`.toUpperCase();
}

/**
 * Generate payment instructions
 */
function generateInstructions(
  data: FallbackCheckoutData,
  reference: string
): string[] {
  return [
    `Payment Amount: ${formatAmount(data.amount, data.currency)}`,
    `Reference Number: ${reference}`,
    `Description: ${data.description}`,
    '',
    'Payment Methods Available:',
    '• Bank Transfer / Wire Transfer',
    '• Check (Mail to business address)',
    '• Cash (In-person only)',
    '• Alternative payment apps (Venmo, PayPal, etc.)',
    '',
    'Instructions:',
    '1. Choose your preferred payment method from the list above',
    '2. Include the reference number with your payment',
    '3. Send payment confirmation to our team',
    '4. We will process your order upon payment verification',
    '',
    'Important Notes:',
    '• Please allow 1-3 business days for payment processing',
    '• Keep your reference number for tracking',
    '• Contact us if you need assistance with payment',
  ];
}

/**
 * Get available payment methods for manual checkout
 */
function getAvailablePaymentMethods(): string[] {
  return [
    'Bank Transfer',
    'Wire Transfer',
    'Check',
    'Cash (In-person)',
    'PayPal',
    'Venmo',
    'Zelle',
    'Other (Contact for details)',
  ];
}

/**
 * Format amount for display
 */
function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Convert from cents
}

/**
 * Build redirect URL with payment data
 */
function buildRedirectUrl(
  baseUrl: string,
  data: FallbackCheckoutData,
  reference: string
): string {
  const url = new URL(baseUrl);
  
  url.searchParams.set('amount', data.amount.toString());
  url.searchParams.set('currency', data.currency);
  url.searchParams.set('description', data.description);
  url.searchParams.set('reference', reference);
  
  if (data.customerEmail) {
    url.searchParams.set('email', data.customerEmail);
  }
  
  if (data.metadata) {
    url.searchParams.set('metadata', JSON.stringify(data.metadata));
  }
  
  return url.toString();
}

/**
 * Validate fallback checkout data
 */
export function validateFallbackData(data: FallbackCheckoutData): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (data.amount <= 0) {
    errors.push('Amount must be positive');
  }
  
  if (data.amount > 99999900) { // $999,999.00 in cents
    errors.push('Amount too large for manual processing');
  }
  
  if (data.currency.length !== 3) {
    errors.push('Invalid currency code');
  }
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }
  
  if (data.customerEmail && !isValidEmail(data.customerEmail)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create a payment tracking record for manual payments
 */
export function createPaymentTrackingRecord(
  data: FallbackCheckoutData,
  reference: string,
  metadata?: CheckoutMetadata
) {
  return {
    reference,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    customerEmail: data.customerEmail,
    status: 'pending',
    method: 'manual',
    createdAt: new Date().toISOString(),
    metadata: {
      ...data.metadata,
      ...metadata,
      fallback: 'true',
      originalProvider: 'stripe',
    },
  };
}