/**
 * @fileoverview Stripe Payment Button component with fallback support
 */

'use client';

import React, { useState } from 'react';
import { useStripe } from './StripeProvider';
import { createStripeCheckout } from '../actions/create-checkout';
import type { CheckoutState, FallbackCheckoutResult } from '../types';
import type { StripeCheckoutData } from '../schemas/checkout';

interface StripePaymentButtonProps {
  /** Checkout data */
  checkoutData: StripeCheckoutData;
  /** Button text */
  children: React.ReactNode;
  /** Button styling */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Loading state indicator */
  loadingText?: string;
  /** Success callback */
  onSuccess?: (sessionId: string) => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Fallback callback */
  onFallback?: (fallbackData: FallbackCheckoutResult) => void;
}

/**
 * Stripe Payment Button with automatic fallback handling
 */
export function StripePaymentButton({
  checkoutData,
  children,
  className = '',
  disabled = false,
  loadingText = 'Processing...',
  onSuccess,
  onError,
  onFallback,
}: StripePaymentButtonProps) {
  const { config, isAvailable, canFallback } = useStripe();
  const [state, setState] = useState<CheckoutState>({ status: 'idle' });

  const handleClick = async () => {
    setState({ status: 'loading' });

    try {
      const result = await createStripeCheckout(checkoutData, config);

      if (result.success && result.data) {
        if (result.fallback) {
          // Handle fallback payment
          setState({ status: 'fallback' });
          if (onFallback) {
            onFallback(result.data as FallbackCheckoutResult);
          }
        } else {
          // Handle successful Stripe checkout
          const session = result.data as any; // CheckoutSession
          setState({ 
            status: 'success',
            sessionId: session.id,
            sessionUrl: session.url,
          });

          // Redirect to Stripe checkout
          if (session.url) {
            window.location.href = session.url;
          }

          if (onSuccess) {
            onSuccess(session.id);
          }
        }
      } else {
        // Handle error
        const error = result.error || 'Payment processing failed';
        setState({ 
          status: 'error',
          error: {
            type: 'api_error',
            message: error,
          },
        });

        if (onError) {
          onError(error);
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ 
        status: 'error',
        error: {
          type: 'unknown',
          message: errorMessage,
        },
      });

      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const isLoading = state.status === 'loading';
  const isDisabled = disabled || isLoading || (!isAvailable && !canFallback);

  const buttonText = () => {
    if (isLoading) return loadingText;
    if (!isAvailable && canFallback) return `${children} (Alternative Payment)`;
    return children;
  };

  const buttonClassName = `
    inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
    focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
    disabled:pointer-events-none disabled:opacity-50
    bg-primary text-primary-foreground shadow hover:bg-primary/90
    h-9 px-4 py-2
    ${className}
  `.trim();

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className={buttonClassName}
      >
        {buttonText()}
      </button>

      {/* Status indicators */}
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.error.message}
        </p>
      )}

      {state.status === 'fallback' && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Stripe is temporarily unavailable. Alternative payment options are being prepared.
        </p>
      )}

      {!isAvailable && !canFallback && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Payment processing is temporarily disabled.
        </p>
      )}
    </div>
  );
}

/**
 * Simple payment button for basic use cases
 */
export function SimplePaymentButton({
  amount,
  currency = 'usd',
  description,
  priceId,
  customerEmail,
  onSuccess,
  onError,
  children = 'Pay Now',
  ...props
}: {
  amount?: number;
  currency?: string;
  description?: string;
  priceId: string;
  customerEmail?: string;
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  children?: React.ReactNode;
} & Omit<StripePaymentButtonProps, 'checkoutData' | 'onSuccess' | 'onError'>) {
  const checkoutData: StripeCheckoutData = {
    lineItems: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customerEmail,
    allowPromotionCodes: false,
    collectBillingAddress: false,
    collectPhoneNumber: false,
    automaticTax: false,
  };

  return (
    <StripePaymentButton
      checkoutData={checkoutData}
      onSuccess={onSuccess}
      onError={onError}
      {...props}
    >
      {children}
    </StripePaymentButton>
  );
}