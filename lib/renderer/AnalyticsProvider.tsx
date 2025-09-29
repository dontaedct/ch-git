/**
 * Analytics Provider
 *
 * Provides analytics tracking context for the manifest renderer system.
 */

import React, { createContext, useContext } from 'react';

interface AnalyticsContextValue {
  enabled: boolean;
  track: (event: string, properties?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | undefined>(undefined);

export const useAnalytics = (): AnalyticsContextValue => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  enabled?: boolean;
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({
  enabled = true,
  children
}) => {
  const track = (event: string, properties?: Record<string, any>) => {
    if (!enabled) return;

    // Analytics tracking logic would go here
    console.log('Analytics event:', event, properties);
  };

  const contextValue: AnalyticsContextValue = {
    enabled,
    track
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export default AnalyticsProvider;