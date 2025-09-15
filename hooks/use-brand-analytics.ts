/**
 * @fileoverview Brand-Aware Analytics React Hook
 * @module hooks/use-brand-analytics
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { brandAnalytics, BrandAnalyticsEvent } from '@/lib/analytics/brand-aware-analytics';
import { logoManager } from '@/lib/branding/logo-manager';

export interface UseBrandAnalyticsOptions {
  /** Enable automatic page view tracking */
  trackPageViews?: boolean;
  /** Enable automatic performance tracking */
  trackPerformance?: boolean;
  /** Enable automatic error tracking */
  trackErrors?: boolean;
  /** Custom event properties to include with all events */
  defaultProperties?: Record<string, any>;
  /** Debounce delay for performance tracking (ms) */
  performanceDebounceMs?: number;
}

export interface BrandAnalyticsHook {
  /** Track a custom event */
  track: (eventType: BrandAnalyticsEvent['type'], eventName: string, properties?: Record<string, any>) => void;
  /** Track page view */
  trackPageView: (page: string, properties?: Record<string, any>) => void;
  /** Track user action */
  trackUserAction: (action: string, properties?: Record<string, any>) => void;
  /** Track brand interaction */
  trackBrandInteraction: (interaction: string, properties?: Record<string, any>) => void;
  /** Track performance metric */
  trackPerformance: (metric: string, value: number, properties?: Record<string, any>) => void;
  /** Track error */
  trackError: (error: string, properties?: Record<string, any>) => void;
  /** Get current analytics metrics */
  getMetrics: () => Promise<any>;
}

/**
 * Hook for brand-aware analytics tracking
 */
export function useBrandAnalytics(options: UseBrandAnalyticsOptions = {}): BrandAnalyticsHook {
  const {
    trackPageViews = true,
    trackPerformance: shouldTrackPerformance = true,
    trackErrors = true,
    defaultProperties = {},
    performanceDebounceMs = 1000,
  } = options;

  const performanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentPageRef = useRef<string>('');

  // Track page views automatically
  useEffect(() => {
    if (!trackPageViews || typeof window === 'undefined') return;

    const trackCurrentPage = () => {
      const currentPage = window.location.pathname;
      if (currentPage !== currentPageRef.current) {
        currentPageRef.current = currentPage;
        brandAnalytics.trackPageView(currentPage, defaultProperties);
      }
    };

    // Track initial page view
    trackCurrentPage();

    // Track page changes (for SPA navigation)
    const handlePopState = () => {
      trackCurrentPage();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [trackPageViews, defaultProperties]);

  // Track performance metrics automatically
  useEffect(() => {
    if (!shouldTrackPerformance || typeof window === 'undefined') return;

    const trackPerformanceMetrics = () => {
      // Track page load time
      if (window.performance && window.performance.timing) {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        brandAnalytics.trackPerformance('page_load_time', loadTime, defaultProperties);
      }

      // Track memory usage if available
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        brandAnalytics.trackPerformance('memory_used', memory.usedJSHeapSize, defaultProperties);
        brandAnalytics.trackPerformance('memory_total', memory.totalJSHeapSize, defaultProperties);
      }
    };

    // Debounce performance tracking
    if (performanceTimerRef.current) {
      clearTimeout(performanceTimerRef.current);
    }

    performanceTimerRef.current = setTimeout(trackPerformanceMetrics, performanceDebounceMs);

    return () => {
      if (performanceTimerRef.current) {
        clearTimeout(performanceTimerRef.current);
      }
    };
  }, [shouldTrackPerformance, defaultProperties, performanceDebounceMs]);

  // Track errors automatically
  useEffect(() => {
    if (!trackErrors || typeof window === 'undefined') return;

    const handleError = (event: ErrorEvent) => {
      brandAnalytics.trackError('javascript_error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        ...defaultProperties,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      brandAnalytics.trackError('unhandled_promise_rejection', {
        reason: event.reason?.toString() || 'Unknown reason',
        ...defaultProperties,
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [trackErrors, defaultProperties]);

  // Track brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe((newConfig) => {
      brandAnalytics.trackBrandInteraction('brand_configuration_changed', {
        brandName: newConfig.brandName.appName,
        organizationName: newConfig.brandName.organizationName,
        presetName: newConfig.presetName,
        isCustom: newConfig.isCustom,
        ...defaultProperties,
      });
    });

    return unsubscribe;
  }, [defaultProperties]);

  // Memoized tracking functions
  const track = useCallback((eventType: BrandAnalyticsEvent['type'], eventName: string, properties: Record<string, any> = {}) => {
    brandAnalytics.track(eventType, eventName, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const trackPageView = useCallback((page: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPageView(page, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const trackUserAction = useCallback((action: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackUserAction(action, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const trackBrandInteraction = useCallback((interaction: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackBrandInteraction(interaction, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const trackPerformance = useCallback((metric: string, value: number, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPerformance(metric, value, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const trackError = useCallback((error: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackError(error, {
      ...defaultProperties,
      ...properties,
    });
  }, [defaultProperties]);

  const getMetrics = useCallback(async () => {
    return await brandAnalytics.getMetrics();
  }, []);

  return {
    track,
    trackPageView,
    trackUserAction,
    trackBrandInteraction,
    trackPerformance,
    trackError,
    getMetrics,
  };
}

/**
 * Hook for tracking brand interactions specifically
 */
export function useBrandInteractionTracking() {
  const trackBrandInteraction = useCallback((interaction: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackBrandInteraction(interaction, properties);
  }, []);

  const trackBrandSwitch = useCallback((fromBrand: string, toBrand: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackBrandInteraction('brand_switch', {
      fromBrand,
      toBrand,
      ...properties,
    });
  }, []);

  const trackBrandCustomization = useCallback((customization: string, properties: Record<string, any> = {}) => {
    brandAnalytics.trackBrandInteraction('brand_customization', {
      customization,
      ...properties,
    });
  }, []);

  return {
    trackBrandInteraction,
    trackBrandSwitch,
    trackBrandCustomization,
  };
}

/**
 * Hook for performance tracking with brand context
 */
export function useBrandPerformanceTracking() {
  const trackPerformance = useCallback((metric: string, value: number, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPerformance(metric, value, properties);
  }, []);

  const trackLoadTime = useCallback((loadTime: number, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPerformance('load_time', loadTime, properties);
  }, []);

  const trackRenderTime = useCallback((renderTime: number, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPerformance('render_time', renderTime, properties);
  }, []);

  const trackBrandSwitchTime = useCallback((switchTime: number, properties: Record<string, any> = {}) => {
    brandAnalytics.trackPerformance('brand_switch_time', switchTime, properties);
  }, []);

  return {
    trackPerformance,
    trackLoadTime,
    trackRenderTime,
    trackBrandSwitchTime,
  };
}
