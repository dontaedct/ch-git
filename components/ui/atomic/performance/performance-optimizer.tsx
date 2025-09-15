/**
 * @fileoverview HT-022.2.3: Performance Optimization Components
 * @module components/ui/atomic/performance
 * @author Agency Component System
 * @version 1.0.0
 *
 * PERFORMANCE OPTIMIZER: Component-level performance optimization
 */

'use client';

import React, { memo, useMemo, lazy, Suspense, forwardRef, useState, useEffect, useCallback } from 'react';
import { usePerformance, withPerformanceMonitoring } from './performance-monitor';

// Optimized component wrapper with memoization
export function optimizeComponent<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    displayName?: string;
    memoize?: boolean;
    monitoring?: boolean;
    lazyLoad?: boolean;
  } = {}
) {
  const {
    displayName,
    memoize = true,
    monitoring = true,
    lazyLoad = false
  } = options;

  let OptimizedComponent = Component;

  // Apply memoization
  if (memoize) {
    OptimizedComponent = memo(OptimizedComponent);
  }

  // Apply performance monitoring
  if (monitoring) {
    OptimizedComponent = withPerformanceMonitoring(OptimizedComponent, displayName);
  }

  // Apply lazy loading
  if (lazyLoad) {
    const LazyComponent = lazy(() => Promise.resolve({ default: OptimizedComponent }));
    OptimizedComponent = (props: P) => (
      <Suspense fallback={<div className="animate-pulse bg-muted h-8 w-full rounded" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  }

  if (displayName) {
    OptimizedComponent.displayName = displayName;
  }

  return OptimizedComponent;
}

// Virtual scrolling component for large lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
  overscan?: number;
}

export function VirtualScroll({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5
}: VirtualScrollProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const { isMonitoringEnabled, measureRender } = usePerformance();

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight)
    );

    return {
      start: Math.max(0, start - overscan),
      end: Math.min(items.length - 1, end + overscan)
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    const startTime = performance.now();
    const result = items.slice(visibleRange.start, visibleRange.end + 1);

    if (isMonitoringEnabled) {
      const endTime = performance.now();
      measureRender('VirtualScroll-slice', endTime - startTime);
    }

    return result;
  }, [items, visibleRange, isMonitoringEnabled, measureRender]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = items.length * itemHeight;

  return (
    <div
      className={`overflow-auto ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${visibleRange.start * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Intersection Observer based lazy loading
interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export function LazyLoad({
  children,
  fallback,
  rootMargin = '50px',
  threshold = 0.1,
  className
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(elementRef);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    observer.observe(elementRef);

    return () => {
      if (elementRef) {
        observer.unobserve(elementRef);
      }
    };
  }, [elementRef, rootMargin, threshold]);

  return (
    <div ref={setElementRef} className={className}>
      {isVisible ? children : (fallback || <div className="animate-pulse bg-muted h-20 w-full rounded" />)}
    </div>
  );
}

// Debounced input component
interface DebouncedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onDebouncedChange: (value: string) => void;
  debounceMs?: number;
}

export const DebouncedInput = forwardRef<HTMLInputElement, DebouncedInputProps>(
  ({ onDebouncedChange, debounceMs = 300, onChange, ...props }, ref) => {
    const [value, setValue] = useState(props.value || '');

    useEffect(() => {
      const handler = setTimeout(() => {
        onDebouncedChange(value as string);
      }, debounceMs);

      return () => {
        clearTimeout(handler);
      };
    }, [value, debounceMs, onDebouncedChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      onChange?.(e);
    };

    return (
      <input
        {...props}
        ref={ref}
        value={value}
        onChange={handleChange}
        className={`flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.className || ''}`}
      />
    );
  }
);

DebouncedInput.displayName = 'DebouncedInput';

// Optimized image component
interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  lazy?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA2MEw1MCA0NUw2MCA2MEw3MCA0NUw4MCA2MEg2MEg0MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+',
  lazy = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(lazy ? fallback : src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  useEffect(() => {
    if (!lazy || !src) return;

    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    img.onerror = handleError;
    img.src = src;
  }, [src, lazy]);

  return (
    <img
      {...props}
      src={imageSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={`transition-opacity duration-300 ${
        isLoaded && !hasError ? 'opacity-100' : 'opacity-75'
      } ${className || ''}`}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
}

// Performance-optimized button
interface OptimizedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  throttleMs?: number;
}

export const OptimizedButton = memo(forwardRef<HTMLButtonElement, OptimizedButtonProps>(
  ({ onClick, throttleMs = 100, children, ...props }, ref) => {
    const [isThrottled, setIsThrottled] = useState(false);

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (isThrottled) return;

      setIsThrottled(true);
      onClick?.(e);

      setTimeout(() => {
        setIsThrottled(false);
      }, throttleMs);
    }, [onClick, throttleMs, isThrottled]);

    return (
      <button
        {...props}
        ref={ref}
        onClick={handleClick}
        disabled={props.disabled || isThrottled}
        className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${props.className || ''}`}
      >
        {children}
      </button>
    );
  }
));

OptimizedButton.displayName = 'OptimizedButton';

// Render budget component - warns when render time exceeds threshold
export function RenderBudgetWarning({ threshold = 16 }: { threshold?: number }) {
  const { metrics, isMonitoringEnabled } = usePerformance();
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (!isMonitoringEnabled) return;

    const newWarnings: string[] = [];

    Object.entries(metrics.componentRenderTimes).forEach(([componentName, times]) => {
      const latestTime = times[times.length - 1];
      if (latestTime > threshold) {
        newWarnings.push(`${componentName}: ${latestTime.toFixed(1)}ms (>${threshold}ms)`);
      }
    });

    setWarnings(newWarnings);
  }, [metrics, threshold, isMonitoringEnabled]);

  if (!isMonitoringEnabled || warnings.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-xs max-w-sm z-50">
      <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
        ⚠️ Render Budget Exceeded
      </h4>
      <ul className="mt-1 space-y-1 text-yellow-700 dark:text-yellow-300">
        {warnings.map((warning, index) => (
          <li key={index}>{warning}</li>
        ))}
      </ul>
    </div>
  );
}