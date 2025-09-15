/**
 * @fileoverview HT-008.2.5: Comprehensive Memoization & Performance Optimization System
 * @module lib/performance/memoization
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.5 - Add comprehensive memoization and performance optimization
 * Focus: Advanced memoization patterns and performance optimization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical optimization)
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';
import { logger } from '@/lib/observability/logger';

/**
 * Advanced memoization hook with dependency tracking
 */
export function useAdvancedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
    maxSize?: number;
    key?: string;
  } = {}
): T {
  const { maxAge = 0, maxSize = 100, key = 'default' } = options;
  const cacheRef = useRef<Map<string, { value: T; timestamp: number }>>(new Map());
  const lastDepsRef = useRef<React.DependencyList>([]);

  return useMemo(() => {
    const now = Date.now();
    const depsKey = JSON.stringify(deps);
    
    // Check if dependencies changed
    const depsChanged = deps.some((dep, index) => dep !== lastDepsRef.current[index]);
    
    if (!depsChanged && cacheRef.current.has(depsKey)) {
      const cached = cacheRef.current.get(depsKey)!;
      
      // Check if cache is still valid
      if (maxAge === 0 || now - cached.timestamp < maxAge) {
        return cached.value;
      }
    }

    // Generate new value
    const value = factory();
    
    // Update cache
    cacheRef.current.set(depsKey, { value, timestamp: now });
    lastDepsRef.current = [...deps];
    
    // Cleanup old entries if cache is too large
    if (cacheRef.current.size > maxSize) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest entries
      const toRemove = entries.slice(0, entries.length - maxSize);
      toRemove.forEach(([key]) => cacheRef.current.delete(key));
    }

    return value;
  }, deps);
}

/**
 * Optimized callback hook with reference stability
 */
export function useOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  options: {
    maxAge?: number;
    key?: string;
  } = {}
): T {
  const { maxAge = 0, key = 'default' } = options;
  const cacheRef = useRef<Map<string, { callback: T; timestamp: number }>>(new Map());
  const lastDepsRef = useRef<React.DependencyList>([]);

  return useCallback(() => {
    const now = Date.now();
    const depsKey = JSON.stringify(deps);
    
    // Check if dependencies changed
    const depsChanged = deps.some((dep, index) => dep !== lastDepsRef.current[index]);
    
    if (!depsChanged && cacheRef.current.has(depsKey)) {
      const cached = cacheRef.current.get(depsKey)!;
      
      // Check if cache is still valid
      if (maxAge === 0 || now - cached.timestamp < maxAge) {
        return cached.callback;
      }
    }

    // Update cache
    cacheRef.current.set(depsKey, { callback, timestamp: now });
    lastDepsRef.current = [...deps];

    return callback;
  }, deps) as T;
}

/**
 * Performance-optimized component wrapper
 */
export function withPerformanceOptimization<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    memo?: boolean;
    displayName?: string;
    shouldUpdate?: (prevProps: P, nextProps: P) => boolean;
  } = {}
) {
  const { memo = true, displayName, shouldUpdate } = options;
  
  let OptimizedComponent = Component;
  
  if (memo) {
    OptimizedComponent = React.memo(Component, shouldUpdate) as unknown as React.ComponentType<P>;
  }
  
  if (displayName) {
    OptimizedComponent.displayName = displayName;
  }
  
  return OptimizedComponent;
}

/**
 * Virtual scrolling hook for large lists
 */
export function useVirtualScrolling<T>(
  items: T[],
  options: {
    itemHeight: number;
    containerHeight: number;
    overscan?: number;
    threshold?: number;
  }
) {
  const { itemHeight, containerHeight, overscan = 5, threshold = 0.1 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );
    
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length - 1, endIndex)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
  }, []);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  };
}

/**
 * Debounced hook for performance optimization
 */
export function useDebounced<T>(
  value: T,
  delay: number,
  options: {
    maxWait?: number;
    leading?: boolean;
    trailing?: boolean;
  } = {}
): T {
  const { maxWait = 0, leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Leading edge
    if (leading && timeSinceLastCall >= delay) {
      setDebouncedValue(value);
      lastCallTimeRef.current = now;
    }

    // Trailing edge
    if (trailing) {
      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        lastCallTimeRef.current = Date.now();
      }, delay);
    }

    // Max wait
    if (maxWait > 0) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
        lastCallTimeRef.current = Date.now();
      }, maxWait);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    };
  }, [value, delay, maxWait, leading, trailing]);

  return debouncedValue;
}

/**
 * Throttled hook for performance optimization
 */
export function useThrottled<T>(
  value: T,
  delay: number,
  options: {
    leading?: boolean;
    trailing?: boolean;
  } = {}
): T {
  const { leading = true, trailing = false } = options;
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastCallTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTimeRef.current;
    
    if (timeSinceLastCall >= delay) {
      // Leading edge
      if (leading) {
        setThrottledValue(value);
        lastCallTimeRef.current = now;
      }
      
      // Clear trailing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else if (trailing && !timeoutRef.current) {
      // Trailing edge
      timeoutRef.current = setTimeout(() => {
        setThrottledValue(value);
        lastCallTimeRef.current = Date.now();
        timeoutRef.current = null;
      }, delay - timeSinceLastCall);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay, leading, trailing]);

  return throttledValue;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitorMemo(
  componentName: string,
  options: {
    trackRenders?: boolean;
    trackProps?: boolean;
    trackState?: boolean;
  } = {}
) {
  const { trackRenders = true, trackProps: shouldTrackProps = false, trackState: shouldTrackState = false } = options;
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(0);
  const propsRef = useRef<any>(null);
  const stateRef = useRef<any>(null);

  useEffect(() => {
    if (trackRenders) {
      renderCountRef.current++;
      const now = Date.now();
      const timeSinceLastRender = now - lastRenderTimeRef.current;
      
      logger.info('Component render tracked', {
        componentName,
        renderCount: renderCountRef.current,
        timeSinceLastRender,
        timestamp: now
      });
      
      lastRenderTimeRef.current = now;
    }
  });

  const trackProps = useCallback((props: any) => {
    if (shouldTrackProps) {
      const propsChanged = JSON.stringify(props) !== JSON.stringify(propsRef.current);
      propsRef.current = props;
      
      if (propsChanged) {
        logger.info('Component props tracked', {
          componentName,
          propsChanged: true,
          props
        });
      }
    }
  }, [componentName, shouldTrackProps]);

  const trackState = useCallback((state: any) => {
    if (shouldTrackState) {
      const stateChanged = JSON.stringify(state) !== JSON.stringify(stateRef.current);
      stateRef.current = state;
      
      if (stateChanged) {
        logger.info('Component state tracked', {
          componentName,
          stateChanged: true,
          state
        });
      }
    }
  }, [componentName, shouldTrackState]);

  return {
    renderCount: renderCountRef.current,
    trackProps,
    trackState
  };
}

/**
 * Optimized list rendering hook
 */
export function useOptimizedList<T>(
  items: T[],
  options: {
    keyExtractor: (item: T, index: number) => string;
    itemHeight?: number;
    containerHeight?: number;
    threshold?: number;
  }
) {
  const { keyExtractor, itemHeight, containerHeight, threshold = 0.1 } = options;
  
  // Memoize items with stable keys
  const memoizedItems = useMemo(() => {
    return items.map((item, index) => ({
      item,
      index,
      key: keyExtractor(item, index)
    }));
  }, [items, keyExtractor]);

  // Virtual scrolling if dimensions provided
  const virtualScrolling = useVirtualScrolling(items, {
    itemHeight: itemHeight || 50,
    containerHeight: containerHeight || 400,
    threshold
  });

  return {
    memoizedItems,
    virtualScrolling: itemHeight && containerHeight ? virtualScrolling : null
  };
}

/**
 * Performance-optimized form hook
 */
export function useOptimizedForm<T>(
  initialValues: T,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
  } = {}
) {
  const { validateOnChange = false, validateOnBlur = true, debounceMs = 300 } = options;
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  
  const debouncedValues = useDebounced(values, debounceMs);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      // Debounced validation
      setTimeout(() => {
        // Validation logic here
      }, debounceMs);
    }
  }, [validateOnChange, debounceMs]);

  const setFieldTouched = useCallback((field: keyof T, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    if (validateOnBlur && isTouched) {
      // Validation logic here
    }
  }, [validateOnBlur]);

  return {
    values: debouncedValues,
    errors,
    touched,
    setValue,
    setFieldTouched,
    setValues
  };
}

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  /**
   * Check if component should re-render
   */
  shouldComponentUpdate: <P extends object>(
    prevProps: P,
    nextProps: P,
    shallow: boolean = true
  ): boolean => {
    if (shallow) {
      return Object.keys(nextProps).some(key => 
        prevProps[key as keyof P] !== nextProps[key as keyof P]
      );
    }
    
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  },

  /**
   * Create stable reference for objects
   */
  createStableRef: <T>(value: T): T => {
    const ref = useRef<T>(value);
    ref.current = value;
    return ref.current;
  },

  /**
   * Batch state updates
   */
  batchUpdates: (updates: (() => void)[]): void => {
    // Batch updates using setTimeout to ensure they're batched
    setTimeout(() => {
      updates.forEach(update => update());
    }, 0);
  },

  /**
   * Measure component performance
   */
  measurePerformance: (componentName: string, fn: () => void): void => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    logger.info('Performance measurement', {
      componentName,
      duration: end - start,
      timestamp: Date.now()
    });
  }
};

export default PerformanceUtils;
