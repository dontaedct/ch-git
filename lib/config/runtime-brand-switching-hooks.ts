/**
 * @fileoverview React Hooks for Runtime Brand Switching
 * @module lib/config/runtime-brand-switching-hooks
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.2: React hooks for runtime brand switching with smooth transitions
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  runtimeBrandSwitchingService,
  BrandSwitchRequest,
  BrandSwitchResult,
  BrandSwitchState,
  BrandSwitchEvent,
  BrandConfiguration,
  BrandSwitchHistory,
  BrandSwitchOptions
} from './runtime-brand-switching';
import { TenantBrandingConfig } from '@/lib/branding/tenant-types';

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for managing runtime brand switching
 */
export function useRuntimeBrandSwitching() {
  const [switchState, setSwitchState] = useState<BrandSwitchState>(
    runtimeBrandSwitchingService.getSwitchState()
  );
  const [lastResult, setLastResult] = useState<BrandSwitchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update state when service state changes
  useEffect(() => {
    const updateState = () => {
      setSwitchState(runtimeBrandSwitchingService.getSwitchState());
    };

    // Listen for switch events
    const handleSwitchEvent = (event: BrandSwitchEvent) => {
      updateState();
      
      if (event.type === 'switch_completed') {
        setLastResult(event.data);
        setError(null);
      } else if (event.type === 'switch_failed') {
        setLastResult(event.data);
        setError(event.data.error || 'Switch failed');
      }
    };

    runtimeBrandSwitchingService.addEventListener('switch_started', handleSwitchEvent);
    runtimeBrandSwitchingService.addEventListener('switch_progress', handleSwitchEvent);
    runtimeBrandSwitchingService.addEventListener('switch_completed', handleSwitchEvent);
    runtimeBrandSwitchingService.addEventListener('switch_failed', handleSwitchEvent);

    return () => {
      runtimeBrandSwitchingService.removeEventListener('switch_started', handleSwitchEvent);
      runtimeBrandSwitchingService.removeEventListener('switch_progress', handleSwitchEvent);
      runtimeBrandSwitchingService.removeEventListener('switch_completed', handleSwitchEvent);
      runtimeBrandSwitchingService.removeEventListener('switch_failed', handleSwitchEvent);
    };
  }, []);

  const switchBrand = useCallback(async (request: BrandSwitchRequest): Promise<BrandSwitchResult> => {
    try {
      setError(null);
      const result = await runtimeBrandSwitchingService.switchBrand(request);
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      const errorResult: BrandSwitchResult = {
        success: false,
        error: errorMessage
      };
      setLastResult(errorResult);
      return errorResult;
    }
  }, []);

  const queueBrandSwitch = useCallback(async (request: BrandSwitchRequest): Promise<void> => {
    try {
      setError(null);
      await runtimeBrandSwitchingService.queueBrandSwitch(request);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    }
  }, []);

  const cancelBrandSwitch = useCallback((): boolean => {
    return runtimeBrandSwitchingService.cancelBrandSwitch();
  }, []);

  const resetToDefaultBrand = useCallback(async (): Promise<BrandSwitchResult> => {
    try {
      setError(null);
      const result = await runtimeBrandSwitchingService.resetToDefaultBrand();
      setLastResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      const errorResult: BrandSwitchResult = {
        success: false,
        error: errorMessage
      };
      setLastResult(errorResult);
      return errorResult;
    }
  }, []);

  return {
    switchState,
    lastResult,
    error,
    switchBrand,
    queueBrandSwitch,
    cancelBrandSwitch,
    resetToDefaultBrand
  };
}

/**
 * Hook for managing available brand configurations
 */
export function useAvailableBrands() {
  const [brands, setBrands] = useState<BrandConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const availableBrands = await runtimeBrandSwitchingService.getAvailableBrands();
      setBrands(availableBrands);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const getBrandById = useCallback((brandId: string): BrandConfiguration | undefined => {
    return brands.find(brand => brand.id === brandId);
  }, [brands]);

  const getBrandsByTag = useCallback((tag: string): BrandConfiguration[] => {
    return brands.filter(brand => brand.tags.includes(tag));
  }, [brands]);

  const getPresetBrands = useCallback((): BrandConfiguration[] => {
    return brands.filter(brand => brand.isPreset);
  }, [brands]);

  const getCustomBrands = useCallback((): BrandConfiguration[] => {
    return brands.filter(brand => !brand.isPreset);
  }, [brands]);

  return {
    brands,
    loading,
    error,
    loadBrands,
    getBrandById,
    getBrandsByTag,
    getPresetBrands,
    getCustomBrands
  };
}

/**
 * Hook for brand switch history
 */
export function useBrandSwitchHistory() {
  const [history, setHistory] = useState<BrandSwitchHistory[]>([]);

  useEffect(() => {
    const updateHistory = () => {
      setHistory(runtimeBrandSwitchingService.getSwitchHistory());
    };

    // Listen for switch events to update history
    const handleSwitchEvent = () => {
      updateHistory();
    };

    runtimeBrandSwitchingService.addEventListener('switch_completed', handleSwitchEvent);
    runtimeBrandSwitchingService.addEventListener('switch_failed', handleSwitchEvent);

    // Initial load
    updateHistory();

    return () => {
      runtimeBrandSwitchingService.removeEventListener('switch_completed', handleSwitchEvent);
      runtimeBrandSwitchingService.removeEventListener('switch_failed', handleSwitchEvent);
    };
  }, []);

  const getRecentSwitches = useCallback((limit: number = 10): BrandSwitchHistory[] => {
    return history.slice(0, limit);
  }, [history]);

  const getSuccessfulSwitches = useCallback((): BrandSwitchHistory[] => {
    return history.filter(entry => entry.success);
  }, [history]);

  const getFailedSwitches = useCallback((): BrandSwitchHistory[] => {
    return history.filter(entry => !entry.success);
  }, [history]);

  const getAverageSwitchDuration = useCallback((): number => {
    if (history.length === 0) return 0;
    const totalDuration = history.reduce((sum, entry) => sum + entry.duration, 0);
    return totalDuration / history.length;
  }, [history]);

  return {
    history,
    getRecentSwitches,
    getSuccessfulSwitches,
    getFailedSwitches,
    getAverageSwitchDuration
  };
}

/**
 * Hook for brand switching with smooth transitions
 */
export function useBrandSwitchingWithTransitions() {
  const { switchState, switchBrand, error } = useRuntimeBrandSwitching();
  const [transitionState, setTransitionState] = useState({
    isTransitioning: false,
    transitionProgress: 0,
    transitionDuration: 300
  });

  const switchBrandWithTransition = useCallback(async (
    request: BrandSwitchRequest,
    options?: BrandSwitchOptions
  ): Promise<BrandSwitchResult> => {
    const transitionDuration = options?.transitionDuration || 300;
    
    setTransitionState({
      isTransitioning: true,
      transitionProgress: 0,
      transitionDuration
    });

    // Start transition animation
    const startTime = performance.now();
    const animateTransition = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min((elapsed / transitionDuration) * 100, 100);
      
      setTransitionState(prev => ({
        ...prev,
        transitionProgress: progress
      }));

      if (progress < 100) {
        requestAnimationFrame(animateTransition);
      }
    };

    requestAnimationFrame(animateTransition);

    try {
      const result = await switchBrand({
        ...request,
        options: {
          showLoading: true,
          transitionDuration,
          validateBeforeSwitch: true,
          persistSwitch: true,
          notifyComponents: true,
          ...options
        }
      });

      // Complete transition
      setTimeout(() => {
        setTransitionState({
          isTransitioning: false,
          transitionProgress: 100,
          transitionDuration
        });
      }, 100);

      return result;
    } catch (err) {
      setTransitionState({
        isTransitioning: false,
        transitionProgress: 0,
        transitionDuration
      });
      throw err;
    }
  }, [switchBrand]);

  return {
    ...switchState,
    transitionState,
    switchBrandWithTransition,
    error
  };
}

/**
 * Hook for brand switching analytics
 */
export function useBrandSwitchingAnalytics() {
  const { history } = useBrandSwitchHistory();
  const [analytics, setAnalytics] = useState({
    totalSwitches: 0,
    successfulSwitches: 0,
    failedSwitches: 0,
    averageDuration: 0,
    mostUsedBrand: '',
    switchFrequency: 0
  });

  useEffect(() => {
    const successfulSwitches = history.filter(entry => entry.success);
    const failedSwitches = history.filter(entry => !entry.success);
    const totalDuration = history.reduce((sum, entry) => sum + entry.duration, 0);
    
    // Calculate most used brand
    const brandUsage = history.reduce((acc, entry) => {
      acc[entry.toBrandId] = (acc[entry.toBrandId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedBrand = Object.entries(brandUsage)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Calculate switch frequency (switches per day)
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentSwitches = history.filter(entry => entry.timestamp > oneDayAgo);
    const switchFrequency = recentSwitches.length;

    setAnalytics({
      totalSwitches: history.length,
      successfulSwitches: successfulSwitches.length,
      failedSwitches: failedSwitches.length,
      averageDuration: history.length > 0 ? totalDuration / history.length : 0,
      mostUsedBrand,
      switchFrequency
    });
  }, [history]);

  const getSuccessRate = useCallback((): number => {
    if (analytics.totalSwitches === 0) return 0;
    return (analytics.successfulSwitches / analytics.totalSwitches) * 100;
  }, [analytics]);

  const getFailureRate = useCallback((): number => {
    if (analytics.totalSwitches === 0) return 0;
    return (analytics.failedSwitches / analytics.totalSwitches) * 100;
  }, [analytics]);

  return {
    analytics,
    getSuccessRate,
    getFailureRate
  };
}

/**
 * Hook for brand switching with loading states
 */
export function useBrandSwitchingWithLoading() {
  const { switchState, switchBrand, error } = useRuntimeBrandSwitching();
  const [loadingStates, setLoadingStates] = useState({
    isSwitching: false,
    switchProgress: 0,
    loadingMessage: '',
    estimatedTimeRemaining: 0
  });

  const switchBrandWithLoading = useCallback(async (
    request: BrandSwitchRequest,
    loadingMessage?: string
  ): Promise<BrandSwitchResult> => {
    setLoadingStates({
      isSwitching: true,
      switchProgress: 0,
      loadingMessage: loadingMessage || 'Switching brand...',
      estimatedTimeRemaining: 3000 // 3 seconds estimate
    });

    const startTime = performance.now();

    try {
      const result = await switchBrand({
        ...request,
        options: {
          showLoading: true,
          transitionDuration: 300,
          validateBeforeSwitch: true,
          persistSwitch: true,
          notifyComponents: true,
          ...request.options
        }
      });

      const duration = performance.now() - startTime;
      
      setLoadingStates({
        isSwitching: false,
        switchProgress: 100,
        loadingMessage: 'Brand switch completed!',
        estimatedTimeRemaining: 0
      });

      // Clear loading message after a delay
      setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          loadingMessage: ''
        }));
      }, 2000);

      return result;
    } catch (err) {
      setLoadingStates({
        isSwitching: false,
        switchProgress: 0,
        loadingMessage: 'Brand switch failed',
        estimatedTimeRemaining: 0
      });

      // Clear error message after a delay
      setTimeout(() => {
        setLoadingStates(prev => ({
          ...prev,
          loadingMessage: ''
        }));
      }, 3000);

      throw err;
    }
  }, [switchBrand]);

  return {
    ...switchState,
    loadingStates,
    switchBrandWithLoading,
    error
  };
}

/**
 * Hook for debounced brand switching
 */
export function useDebouncedBrandSwitching(delay: number = 500) {
  const { switchBrand } = useRuntimeBrandSwitching();
  const [pendingRequest, setPendingRequest] = useState<BrandSwitchRequest | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const debouncedSwitchBrand = useCallback((
    request: BrandSwitchRequest,
    immediate: boolean = false
  ) => {
    if (immediate) {
      setPendingRequest(null);
      setIsDebouncing(false);
      return switchBrand(request);
    }

    setPendingRequest(request);
    setIsDebouncing(true);

    const timeoutId = setTimeout(async () => {
      if (pendingRequest) {
        await switchBrand(pendingRequest);
        setPendingRequest(null);
        setIsDebouncing(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setIsDebouncing(false);
    };
  }, [switchBrand, pendingRequest, delay]);

  const cancelDebouncedSwitch = useCallback(() => {
    setPendingRequest(null);
    setIsDebouncing(false);
  }, []);

  return {
    debouncedSwitchBrand,
    cancelDebouncedSwitch,
    isDebouncing,
    pendingRequest
  };
}

/**
 * Hook for brand switching with error handling
 */
export function useBrandSwitchingWithErrorHandling() {
  const { switchBrand, error } = useRuntimeBrandSwitching();
  const [errorHistory, setErrorHistory] = useState<string[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);

  const switchBrandWithRetry = useCallback(async (
    request: BrandSwitchRequest,
    retryDelay: number = 1000
  ): Promise<BrandSwitchResult> => {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const result = await switchBrand(request);
        setRetryCount(0);
        return result;
      } catch (err) {
        attempt++;
        setRetryCount(attempt);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setErrorHistory(prev => [...prev, errorMessage]);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        } else {
          throw err;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }, [switchBrand, maxRetries]);

  const clearErrorHistory = useCallback(() => {
    setErrorHistory([]);
    setRetryCount(0);
  }, []);

  return {
    switchBrandWithRetry,
    errorHistory,
    retryCount,
    maxRetries,
    clearErrorHistory,
    error
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for brand switching with keyboard shortcuts
 */
export function useBrandSwitchingKeyboardShortcuts() {
  const { switchBrand } = useRuntimeBrandSwitching();
  const { brands } = useAvailableBrands();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + 1-9 for quick brand switching
      if ((event.ctrlKey || event.metaKey) && event.key >= '1' && event.key <= '9') {
        event.preventDefault();
        const brandIndex = parseInt(event.key) - 1;
        const brand = brands[brandIndex];
        
        if (brand) {
          switchBrand({
            brandId: brand.id,
            options: {
              showLoading: true,
              transitionDuration: 200,
              validateBeforeSwitch: true,
              persistSwitch: true
            }
          });
        }
      }

      // Ctrl/Cmd + 0 for default brand
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        switchBrand({
          brandId: 'default',
          options: {
            showLoading: true,
            transitionDuration: 200,
            validateBeforeSwitch: true,
            persistSwitch: true
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [switchBrand, brands]);
}

export default {
  useRuntimeBrandSwitching,
  useAvailableBrands,
  useBrandSwitchHistory,
  useBrandSwitchingWithTransitions,
  useBrandSwitchingAnalytics,
  useBrandSwitchingWithLoading,
  useDebouncedBrandSwitching,
  useBrandSwitchingWithErrorHandling,
  useBrandSwitchingKeyboardShortcuts
};
