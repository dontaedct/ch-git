/**
 * @fileoverview HT-008.9.3: Advanced Lazy Loading Patterns System
 * @module lib/performance/lazy-loading-patterns.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.3 - Implement advanced lazy loading patterns
 * Focus: Advanced lazy loading with intersection observer and performance optimization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

import { ComponentType, lazy, Suspense, useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * Lazy loading configuration
 */
export interface LazyLoadingConfig {
  // Intersection Observer settings
  rootMargin: string;
  threshold: number | number[];
  
  // Performance settings
  enablePreloading: boolean;
  preloadDistance: number; // pixels
  enablePrefetching: boolean;
  prefetchDelay: number; // milliseconds
  
  // Loading behavior
  enableSkeleton: boolean;
  enablePlaceholder: boolean;
  loadingTimeout: number; // milliseconds
  
  // Error handling
  enableRetry: boolean;
  maxRetries: number;
  retryDelay: number; // milliseconds
  
  // Performance monitoring
  enableMetrics: boolean;
  enableLogging: boolean;
}

/**
 * Default lazy loading configuration
 */
export const DEFAULT_LAZY_CONFIG: LazyLoadingConfig = {
  rootMargin: '50px',
  threshold: 0.1,
  
  enablePreloading: true,
  preloadDistance: 200,
  enablePrefetching: true,
  prefetchDelay: 1000,
  
  enableSkeleton: true,
  enablePlaceholder: true,
  loadingTimeout: 5000,
  
  enableRetry: true,
  maxRetries: 3,
  retryDelay: 1000,
  
  enableMetrics: true,
  enableLogging: true,
};

/**
 * Lazy loading metrics
 */
export interface LazyLoadingMetrics {
  componentName: string;
  loadStartTime: number;
  loadEndTime: number;
  loadDuration: number;
  intersectionTime: number;
  renderTime: number;
  retryCount: number;
  errorCount: number;
  cacheHit: boolean;
}

/**
 * Lazy loading state
 */
export interface LazyLoadingState {
  isLoading: boolean;
  isVisible: boolean;
  isLoaded: boolean;
  hasError: boolean;
  retryCount: number;
  metrics: LazyLoadingMetrics | null;
}

/**
 * Advanced Lazy Component with Performance Optimization
 */
export function createAdvancedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string,
  config: Partial<LazyLoadingConfig> = {}
): ComponentType<any> {
  const mergedConfig = { ...DEFAULT_LAZY_CONFIG, ...config };
  
  const LazyComponent = lazy(() => {
    const startTime = performance.now();
    
    return importFn().then(module => {
      const endTime = performance.now();
      const loadDuration = endTime - startTime;
      
      if (mergedConfig.enableLogging) {
        console.log(`📦 Lazy loaded ${componentName}: ${loadDuration.toFixed(2)}ms`);
      }
      
      return module;
    });
  });

  return function AdvancedLazyComponent(props: any) {
    const [state, setState] = useState<LazyLoadingState>({
      isLoading: false,
      isVisible: false,
      isLoaded: false,
      hasError: false,
      retryCount: 0,
      metrics: null,
    });

    const elementRef = useRef<HTMLDivElement>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize metrics
    const metrics = useMemo<LazyLoadingMetrics>(() => ({
      componentName,
      loadStartTime: 0,
      loadEndTime: 0,
      loadDuration: 0,
      intersectionTime: 0,
      renderTime: 0,
      retryCount: 0,
      errorCount: 0,
      cacheHit: false,
    }), [componentName]);

    // Intersection Observer callback
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      
      if (entry.isIntersecting && !state.isVisible) {
        const intersectionTime = performance.now();
        metrics.intersectionTime = intersectionTime;
        
        setState(prev => ({
          ...prev,
          isVisible: true,
          isLoading: true,
        }));

        if (mergedConfig.enableLogging) {
          console.log(`👁️ ${componentName} became visible`);
        }
      }
    }, [state.isVisible, componentName, metrics]);

    // Setup Intersection Observer
    useEffect(() => {
      if (!elementRef.current) return;

      observerRef.current = new IntersectionObserver(handleIntersection, {
        rootMargin: mergedConfig.rootMargin,
        threshold: mergedConfig.threshold,
      });

      observerRef.current.observe(elementRef.current);

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [handleIntersection, mergedConfig.rootMargin, mergedConfig.threshold]);

    // Handle component load
    useEffect(() => {
      if (!state.isVisible || state.isLoaded || state.isLoading) return;

      const loadStartTime = performance.now();
      metrics.loadStartTime = loadStartTime;

      // Set loading timeout
      timeoutRef.current = setTimeout(() => {
        if (mergedConfig.enableLogging) {
          console.warn(`⏰ ${componentName} loading timeout`);
        }
      }, mergedConfig.loadingTimeout);

      setState(prev => ({ ...prev, isLoading: true }));

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [state.isVisible, state.isLoaded, state.isLoading, componentName, metrics, mergedConfig.loadingTimeout]);

    // Handle successful load
    const handleLoad = useCallback(() => {
      const loadEndTime = performance.now();
      metrics.loadEndTime = loadEndTime;
      metrics.loadDuration = loadEndTime - metrics.loadStartTime;
      metrics.renderTime = loadEndTime;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isLoaded: true,
        hasError: false,
      }));

      if (mergedConfig.enableLogging) {
        console.log(`✅ ${componentName} loaded successfully: ${metrics.loadDuration.toFixed(2)}ms`);
      }
    }, [componentName, metrics, mergedConfig.enableLogging]);

    // Handle load error
    const handleError = useCallback((error: Error) => {
      metrics.errorCount++;
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (mergedConfig.enableRetry && state.retryCount < mergedConfig.maxRetries) {
        const retryCount = state.retryCount + 1;
        metrics.retryCount = retryCount;
        
        setState(prev => ({
          ...prev,
          retryCount,
          isLoading: false,
          hasError: false,
        }));

        if (mergedConfig.enableLogging) {
          console.log(`🔄 Retrying ${componentName} (${retryCount}/${mergedConfig.maxRetries})`);
        }

        // Retry after delay
        setTimeout(() => {
          setState(prev => ({ ...prev, isLoading: true }));
        }, mergedConfig.retryDelay);
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          hasError: true,
        }));

        if (mergedConfig.enableLogging) {
          console.error(`❌ ${componentName} failed to load after ${state.retryCount} retries:`, error);
        }
      }
    }, [componentName, metrics, state.retryCount, mergedConfig, mergedConfig.enableLogging]);

    // Render loading state
    const renderLoadingState = () => {
      if (mergedConfig.enableSkeleton) {
        return (
          <div className="animate-pulse bg-gray-200 rounded-lg h-32 w-full">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        );
      }

      if (mergedConfig.enablePlaceholder) {
        return (
          <div className="flex items-center justify-center h-32 w-full bg-gray-100 rounded-lg">
            <div className="text-gray-500">Loading {componentName}...</div>
          </div>
        );
      }

      return null;
    };

    // Render error state
    const renderErrorState = () => (
      <div className="flex items-center justify-center h-32 w-full bg-red-50 rounded-lg border border-red-200">
        <div className="text-red-600">
          Failed to load {componentName}
          {mergedConfig.enableRetry && state.retryCount < mergedConfig.maxRetries && (
            <div className="text-sm mt-1">Retrying... ({state.retryCount}/{mergedConfig.maxRetries})</div>
          )}
        </div>
      </div>
    );

    return (
      <div ref={elementRef} className="lazy-component-container">
        {state.isVisible && (
          <Suspense fallback={renderLoadingState()}>
            <LazyComponent
              {...props}
              onLoad={handleLoad}
              onError={handleError}
              data-lazy-component={componentName}
              data-lazy-state={state.isLoaded ? 'loaded' : 'loading'}
            />
          </Suspense>
        )}
        
        {!state.isVisible && renderLoadingState()}
        {state.hasError && renderErrorState()}
      </div>
    );
  };
}

/**
 * Intersection Observer Hook for Lazy Loading
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
  callback?: (entries: IntersectionObserverEntry[]) => void
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  useEffect(() => {
    if (!elementRef.current) return;

    observerRef.current = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsIntersecting(entry.isIntersecting);
      
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
      
      callback?.(entries);
    }, defaultOptions);

    observerRef.current.observe(elementRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [defaultOptions, callback, hasIntersected]);

  const setElement = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  return {
    elementRef: setElement,
    isIntersecting,
    hasIntersected,
  };
}

/**
 * Lazy Image Component with Advanced Loading
 */
export function LazyImage({
  src,
  alt,
  placeholder,
  className,
  onLoad,
  onError,
  ...props
}: {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  [key: string]: any;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  const { elementRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '100px',
    threshold: 0.1,
  });

  useEffect(() => {
    if (isIntersecting && !isInView) {
      setIsInView(true);
    }
  }, [isIntersecting, isInView]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setHasError(true);
    onError?.(error);
  }, [onError]);

  return (
    <div ref={elementRef} className={`lazy-image-container ${className || ''}`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded">
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-50"
            />
          )}
        </div>
      )}
      
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-500 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy List Component with Virtual Scrolling
 */
export function LazyList<T>({
  items,
  renderItem,
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5,
  className,
}: {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`lazy-list-container ${className || ''}`}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Preload Hook for Resource Preloading
 */
export function usePreload() {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadScript = useCallback((src: string): Promise<void> => {
    if (preloadedResources.current.has(src)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        preloadedResources.current.add(src);
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }, []);

  const preloadStylesheet = useCallback((href: string): Promise<void> => {
    if (preloadedResources.current.has(href)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        preloadedResources.current.add(href);
        resolve();
      };
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }, []);

  return {
    preloadImage,
    preloadScript,
    preloadStylesheet,
    isPreloaded: (src: string) => preloadedResources.current.has(src),
  };
}

/**
 * Export lazy loading utilities
 */
export const LazyLoadingPatterns = {
  createAdvancedLazyComponent,
  useIntersectionObserver,
  LazyImage,
  LazyList,
  usePreload,
  DEFAULT_LAZY_CONFIG,
};

export default LazyLoadingPatterns;
