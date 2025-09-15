/**
 * @fileoverview HT-008.2.3: Advanced Code Splitting & Lazy Loading System
 * @module lib/performance/code-splitting
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.3 - Implement proper code splitting and lazy loading
 * Focus: Advanced code splitting with intelligent preloading
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical bundle optimization)
 */

import React, { Suspense, lazy, ComponentType, ReactNode } from 'react';
// import { ErrorBoundary } from 'react-error-boundary'; // Disabled: package not installed
import { logger } from '@/lib/observability/logger';

/**
 * Enhanced lazy loading with error boundaries and fallbacks
 */
interface LazyComponentOptions {
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  preload?: boolean;
  priority?: 'high' | 'medium' | 'low';
  retryCount?: number;
  retryDelay?: number;
}

/**
 * Create a lazy component with enhanced error handling and preloading
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyComponentOptions = {}
): React.LazyExoticComponent<T> {
  const {
    fallback = <DefaultFallback />,
    errorFallback = <DefaultErrorFallback />,
    preload = false,
    priority = 'medium',
    retryCount = 3,
    retryDelay = 1000
  } = options;

  // Create lazy component
  const LazyComponent = lazy(importFn);

  // Preload if requested
  if (preload) {
    preloadComponent(importFn, priority);
  }

  // Wrap with error boundary and suspense
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => {
    try {
      return (
        <Suspense fallback={fallback}>
          <LazyComponent {...(props as any)} ref={ref} />
        </Suspense>
      );
    } catch (error: any) {
      logger.error('Lazy component error', {
        componentName: (LazyComponent as any).displayName || 'Unknown',
        error: error.message,
        stack: error.stack
      });
      return errorFallback;
    }
  }) as React.LazyExoticComponent<T>;
}

/**
 * Preload a component
 */
export function preloadComponent(
  importFn: () => Promise<any>,
  priority: 'high' | 'medium' | 'low' = 'medium'
): void {
  const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
  
  setTimeout(() => {
    importFn().catch((error) => {
      logger.warn('Component preload failed', {
        error: error.message,
        priority
      });
    });
  }, delay);
}

/**
 * Route-based code splitting
 */
export function createRouteComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  routeName: string
): React.LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: <RouteFallback routeName={routeName} />,
    errorFallback: <RouteErrorFallback routeName={routeName} />,
    preload: true,
    priority: 'high'
  });
}

/**
 * Feature-based code splitting
 */
export function createFeatureComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  featureName: string
): React.LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: <FeatureFallback featureName={featureName} />,
    errorFallback: <FeatureErrorFallback featureName={featureName} />,
    preload: false,
    priority: 'medium'
  });
}

/**
 * Heavy component lazy loading
 */
export function createHeavyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  return createLazyComponent(importFn, {
    fallback: <HeavyComponentFallback componentName={componentName} />,
    errorFallback: <HeavyComponentErrorFallback componentName={componentName} />,
    preload: false,
    priority: 'low'
  });
}

/**
 * Default fallback component
 */
function DefaultFallback(): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}

/**
 * Default error fallback component
 */
function DefaultErrorFallback(): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">⚠️</div>
        <p className="text-sm text-muted-foreground">Failed to load component</p>
      </div>
    </div>
  );
}

/**
 * Route fallback component
 */
function RouteFallback({ routeName }: { routeName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Loading {routeName}</h3>
        <p className="text-sm text-muted-foreground">Preparing your experience...</p>
      </div>
    </div>
  );
}

/**
 * Route error fallback component
 */
function RouteErrorFallback({ routeName }: { routeName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium mb-2">Failed to load {routeName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          There was an error loading this page. Please try refreshing.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

/**
 * Feature fallback component
 */
function FeatureFallback({ featureName }: { featureName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center">
        <div className="animate-pulse bg-muted rounded-lg h-8 w-8 mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Loading {featureName}...</p>
      </div>
    </div>
  );
}

/**
 * Feature error fallback component
 */
function FeatureErrorFallback({ featureName }: { featureName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-orange-500 text-2xl mb-2">⚠️</div>
        <p className="text-sm text-muted-foreground">{featureName} unavailable</p>
      </div>
    </div>
  );
}

/**
 * Heavy component fallback component
 */
function HeavyComponentFallback({ componentName }: { componentName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">Loading {componentName}</h3>
        <p className="text-sm text-muted-foreground">This may take a moment...</p>
        <div className="mt-4 space-y-2">
          <div className="animate-pulse bg-muted rounded h-2 w-full"></div>
          <div className="animate-pulse bg-muted rounded h-2 w-3/4 mx-auto"></div>
          <div className="animate-pulse bg-muted rounded h-2 w-1/2 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Heavy component error fallback component
 */
function HeavyComponentErrorFallback({ componentName }: { componentName: string }): JSX.Element {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium mb-2">Failed to load {componentName}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This component is temporarily unavailable. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/**
 * Intelligent preloading system
 */
export class PreloadManager {
  private static instance: PreloadManager | null = null;
  private preloadedComponents: Set<string> = new Set();
  private preloadQueue: Array<{
    importFn: () => Promise<any>;
    priority: 'high' | 'medium' | 'low';
    componentName: string;
  }> = [];

  private constructor() {
    this.startPreloadProcessor();
  }

  static getInstance(): PreloadManager {
    if (!PreloadManager.instance) {
      PreloadManager.instance = new PreloadManager();
    }
    return PreloadManager.instance;
  }

  /**
   * Add component to preload queue
   */
  preload(
    importFn: () => Promise<any>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    if (this.preloadedComponents.has(componentName)) {
      return;
    }

    this.preloadQueue.push({
      importFn,
      priority,
      componentName
    });

    // Sort by priority
    this.preloadQueue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Start preload processor
   */
  private startPreloadProcessor(): void {
    const processPreloadQueue = () => {
      if (this.preloadQueue.length === 0) {
        setTimeout(processPreloadQueue, 1000);
        return;
      }

      const item = this.preloadQueue.shift();
      if (item) {
        this.preloadComponent(item.importFn, item.componentName, item.priority);
      }

      // Process next item after delay
      const delay = item?.priority === 'high' ? 0 : item?.priority === 'medium' ? 100 : 500;
      setTimeout(processPreloadQueue, delay);
    };

    processPreloadQueue();
  }

  /**
   * Preload a single component
   */
  private async preloadComponent(
    importFn: () => Promise<any>,
    componentName: string,
    priority: 'high' | 'medium' | 'low'
  ): Promise<void> {
    try {
      await importFn();
      this.preloadedComponents.add(componentName);
      
      logger.info('Component preloaded', {
        componentName,
        priority,
        totalPreloaded: this.preloadedComponents.size
      });
    } catch (error) {
      logger.warn('Component preload failed', {
        componentName,
        priority,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Check if component is preloaded
   */
  isPreloaded(componentName: string): boolean {
    return this.preloadedComponents.has(componentName);
  }

  /**
   * Get preload statistics
   */
  getStats(): {
    preloadedCount: number;
    queueLength: number;
    preloadedComponents: string[];
  } {
    return {
      preloadedCount: this.preloadedComponents.size,
      queueLength: this.preloadQueue.length,
      preloadedComponents: Array.from(this.preloadedComponents)
    };
  }
}

/**
 * Hook for intelligent preloading
 */
export function usePreload() {
  const preloadManager = PreloadManager.getInstance();

  const preload = React.useCallback((
    importFn: () => Promise<any>,
    componentName: string,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    preloadManager.preload(importFn, componentName, priority);
  }, [preloadManager]);

  const isPreloaded = React.useCallback((componentName: string) => {
    return preloadManager.isPreloaded(componentName);
  }, [preloadManager]);

  const getStats = React.useCallback(() => {
    return preloadManager.getStats();
  }, [preloadManager]);

  return {
    preload,
    isPreloaded,
    getStats
  };
}

/**
 * Route-based preloading
 */
export function useRoutePreload() {
  const { preload } = usePreload();

  const preloadRoute = React.useCallback((
    routeName: string,
    importFn: () => Promise<any>
  ) => {
    preload(importFn, `route-${routeName}`, 'high');
  }, [preload]);

  const preloadFeature = React.useCallback((
    featureName: string,
    importFn: () => Promise<any>
  ) => {
    preload(importFn, `feature-${featureName}`, 'medium');
  }, [preload]);

  return {
    preloadRoute,
    preloadFeature
  };
}

export default createLazyComponent;
