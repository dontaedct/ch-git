/**
 * @fileoverview Stripe Checkout Form with validation and fallback support
 */

'use client';

import React, { useState, useTransition } from 'react';
import { useStripe, useStripeFeature } from './StripeProvider';
import { createStripeCheckout } from '../actions/create-checkout';
import type { CheckoutState, FallbackCheckoutResult } from '../types';
import type { StripeCheckoutData } from '../schemas/checkout';

interface StripeCheckoutFormProps {
  /** Initial form data */
  initialData?: Partial<StripeCheckoutData>;
  /** Success callback */
  onSuccess?: (sessionId: string) => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Fallback callback */
  onFallback?: (fallbackData: FallbackCheckoutResult) => void;
  /** Custom form styling */
  className?: string;
  /** Submit button text */
  submitText?: string;
  /** Show advanced options */
  showAdvancedOptions?: boolean;
}

/**
 * Complete Stripe Checkout Form with all options
 */
export function StripeCheckoutForm({
  initialData = {},
  onSuccess,
  onError,
  onFallback,
  className = '',
  submitText = 'Proceed to Payment',
  showAdvancedOptions = false,
}: StripeCheckoutFormProps) {
  const { config, isAvailable, canFallback } = useStripe();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<CheckoutState>({ status: 'idle' });

  // Feature availability
  const hasPromotionCodes = useStripeFeature('promotionCodes');
  const hasAutomaticTax = useStripeFeature('automaticTax');

  // Form state
  const [formData, setFormData] = useState<StripeCheckoutData>({
    lineItems: initialData.lineItems || [{ price: '', quantity: 1 }],
    customerEmail: initialData.customerEmail || '',
    successUrl: initialData.successUrl || '',
    cancelUrl: initialData.cancelUrl || '',
    metadata: initialData.metadata || {},
    customerId: initialData.customerId || '',
    allowPromotionCodes: initialData.allowPromotionCodes || false,
    collectBillingAddress: initialData.collectBillingAddress || false,
    collectPhoneNumber: initialData.collectPhoneNumber || false,
    automaticTax: initialData.automaticTax || false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    startTransition(async () => {
      setState({ status: 'loading' });

      try {
        const result = await createStripeCheckout(formData, config);

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
    });
  };

  const updateFormData = (updates: Partial<StripeCheckoutData>) => {
    setFormData((prev: StripeCheckoutData) => ({ ...prev, ...updates }));
  };

  const addLineItem = () => {
    updateFormData({
      lineItems: [...formData.lineItems, { price: '', quantity: 1 }],
    });
  };

  const removeLineItem = (index: number) => {
    updateFormData({
      lineItems: formData.lineItems.filter((_: any, i: number) => i !== index),
    });
  };

  const updateLineItem = (index: number, updates: Partial<{ price: string; quantity: number }>) => {
    const newLineItems = formData.lineItems.map((item: any, i: number) => 
      i === index ? { ...item, ...updates } : item
    );
    updateFormData({ lineItems: newLineItems });
  };

  const isLoading = isPending || state.status === 'loading';
  const canSubmit = formData.lineItems.some((item: any) => item.price) && !isLoading;

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {/* Line Items */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Items to Purchase
        </label>
        
        {formData.lineItems.map((item: any, index: number) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              placeholder="Price ID (price_...)"
              value={item.price}
              onChange={(e) => updateLineItem(index, { price: e.target.value })}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            
            <input
              type="number"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateLineItem(index, { quantity: parseInt(e.target.value) || 1 })}
              min="1"
              className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
              required
            />
            
            {formData.lineItems.length > 1 && (
              <button
                type="button"
                onClick={() => removeLineItem(index)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addLineItem}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Item
        </button>
      </div>

      {/* Customer Email */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Customer Email (Optional)
        </label>
        <input
          type="email"
          value={formData.customerEmail}
          onChange={(e) => updateFormData({ customerEmail: e.target.value })}
          placeholder="customer@example.com"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      {/* Success/Cancel URLs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Success URL (Optional)
          </label>
          <input
            type="url"
            value={formData.successUrl}
            onChange={(e) => updateFormData({ successUrl: e.target.value })}
            placeholder="https://example.com/success"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Cancel URL (Optional)
          </label>
          <input
            type="url"
            value={formData.cancelUrl}
            onChange={(e) => updateFormData({ cancelUrl: e.target.value })}
            placeholder="https://example.com/cancel"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvancedOptions && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium">Advanced Options</h3>
          
          <div className="space-y-2">
            {hasPromotionCodes && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allowPromotionCodes}
                  onChange={(e) => updateFormData({ allowPromotionCodes: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Allow promotion codes</span>
              </label>
            )}

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.collectBillingAddress}
                onChange={(e) => updateFormData({ collectBillingAddress: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Collect billing address</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.collectPhoneNumber}
                onChange={(e) => updateFormData({ collectPhoneNumber: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Collect phone number</span>
            </label>

            {hasAutomaticTax && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.automaticTax}
                  onChange={(e) => updateFormData({ automaticTax: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">Enable automatic tax calculation</span>
              </label>
            )}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {state.error && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">
            {state.error.message}
          </p>
        </div>
      )}

      {state.status === 'fallback' && (
        <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
          <p className="text-sm text-amber-600">
            Stripe is temporarily unavailable. Alternative payment options are being prepared.
          </p>
        </div>
      )}

      {!isAvailable && !canFallback && (
        <div className="p-3 rounded-md bg-gray-50 border border-gray-200">
          <p className="text-sm text-gray-600">
            Payment processing is temporarily disabled.
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!canSubmit || (!isAvailable && !canFallback)}
        className={`
          w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          disabled:pointer-events-none disabled:opacity-50
          bg-primary text-primary-foreground shadow hover:bg-primary/90
          h-10 px-4 py-2
        `}
      >
        {isLoading ? 'Processing...' : submitText}
      </button>

      {/* Service Status */}
      <div className="text-xs text-gray-500 text-center">
        {isAvailable ? (
          <span className="text-green-600">✓ Stripe Available</span>
        ) : canFallback ? (
          <span className="text-amber-600">⚠ Fallback Mode Available</span>
        ) : (
          <span className="text-red-600">✗ Payment Processing Disabled</span>
        )}
      </div>
    </form>
  );
}