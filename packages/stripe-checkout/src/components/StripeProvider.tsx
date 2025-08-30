/**
 * @fileoverview Stripe Provider component for managing Stripe context
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { StripeCheckoutConfig } from '../types';
import { validateStripeConfig, getFeatureAvailability } from '../utils/config-validation';

interface StripeContextValue {
  config: StripeCheckoutConfig;
  isAvailable: boolean;
  features: ReturnType<typeof getFeatureAvailability>;
  canFallback: boolean;
}

const StripeContext = createContext<StripeContextValue | null>(null);

interface StripeProviderProps {
  config: StripeCheckoutConfig;
  children: React.ReactNode;
}

/**
 * Stripe Provider component that manages Stripe configuration and availability
 */
export function StripeProvider({ config, children }: StripeProviderProps) {
  const contextValue = useMemo(() => {
    const validation = validateStripeConfig({
      ...config,
      secretKey: undefined, // Never expose secret key to client
    });

    const features = getFeatureAvailability(config);

    return {
      config,
      isAvailable: config.enabled && validation.valid,
      features,
      canFallback: config.fallbackMode !== 'disabled',
    };
  }, [config]);

  return (
    <StripeContext.Provider value={contextValue}>
      {children}
    </StripeContext.Provider>
  );
}

/**
 * Hook to use Stripe context
 */
export function useStripe() {
  const context = useContext(StripeContext);
  
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  
  return context;
}

/**
 * Hook to check if a specific feature is available
 */
export function useStripeFeature(feature: keyof ReturnType<typeof getFeatureAvailability>) {
  const { features, isAvailable } = useStripe();
  return isAvailable && features[feature];
}