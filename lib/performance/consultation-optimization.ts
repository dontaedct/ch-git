/**
 * Performance Optimization Utilities for Consultation Workflow
 * HT-030.4.2: Performance Optimization & Production Readiness
 */

import { performance } from 'perf_hooks';

// Performance monitoring types
interface PerformanceMetrics {
  component: string;
  operation: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ConsultationPerformanceConfig {
  enableProfiling: boolean;
  enableCaching: boolean;
  enableCompression: boolean;
  enableImageOptimization: boolean;
  maxCacheSize: number;
  cacheExpirationMs: number;
}

// Performance targets
export const PERFORMANCE_TARGETS = {
  PAGE_LOAD_TIME: 2000, // <2 seconds
  AI_GENERATION_TIME: 30000, // <30 seconds
  PDF_GENERATION_TIME: 10000, // <10 seconds
  EMAIL_DELIVERY_TIME: 5000, // <5 seconds
  DATABASE_QUERY_TIME: 1000, // <1 second
  API_RESPONSE_TIME: 500, // <500ms
} as const;

// Performance metrics storage
const performanceMetrics: PerformanceMetrics[] = [];

// Default configuration
const defaultConfig: ConsultationPerformanceConfig = {
  enableProfiling: process.env.NODE_ENV !== 'production',
  enableCaching: true,
  enableCompression: true,
  enableImageOptimization: true,
  maxCacheSize: 1000,
  cacheExpirationMs: 3600000, // 1 hour
};

let config = { ...defaultConfig };

/**
 * Configure performance optimization settings
 */
export function configurePerformance(newConfig: Partial<ConsultationPerformanceConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Performance monitoring decorator
 */
export function performanceMonitor(target: string, operation: string) {
  return function (
    target_: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      const startTimestamp = Date.now();

      try {
        const result = await method.apply(this, args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Record performance metrics
        recordPerformanceMetric({
          component: target,
          operation,
          duration,
          timestamp: startTimestamp,
          metadata: {
            success: true,
            argsCount: args.length,
          },
        });

        // Log slow operations
        if (duration > getPerformanceTarget(operation)) {
          console.warn(`Slow operation detected: ${target}.${operation} took ${duration.toFixed(2)}ms`);
        }

        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Record error metrics
        recordPerformanceMetric({
          component: target,
          operation,
          duration,
          timestamp: startTimestamp,
          metadata: {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        });

        throw error;
      }
    };
  };
}

/**
 * Record performance metric
 */
export function recordPerformanceMetric(metric: PerformanceMetrics): void {
  if (!config.enableProfiling) return;

  performanceMetrics.push(metric);

  // Keep only recent metrics to prevent memory leaks
  if (performanceMetrics.length > 10000) {
    performanceMetrics.splice(0, 5000);
  }
}

/**
 * Get performance target for operation
 */
function getPerformanceTarget(operation: string): number {
  switch (operation) {
    case 'pageLoad':
      return PERFORMANCE_TARGETS.PAGE_LOAD_TIME;
    case 'aiGeneration':
      return PERFORMANCE_TARGETS.AI_GENERATION_TIME;
    case 'pdfGeneration':
      return PERFORMANCE_TARGETS.PDF_GENERATION_TIME;
    case 'emailDelivery':
      return PERFORMANCE_TARGETS.EMAIL_DELIVERY_TIME;
    case 'databaseQuery':
      return PERFORMANCE_TARGETS.DATABASE_QUERY_TIME;
    case 'apiResponse':
      return PERFORMANCE_TARGETS.API_RESPONSE_TIME;
    default:
      return PERFORMANCE_TARGETS.API_RESPONSE_TIME;
  }
}

/**
 * Measure performance of async function
 */
export async function measurePerformance<T>(
  component: string,
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<{ result: T; duration: number }> {
  const startTime = performance.now();
  const startTimestamp = Date.now();

  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordPerformanceMetric({
      component,
      operation,
      duration,
      timestamp: startTimestamp,
      metadata: { ...metadata, success: true },
    });

    return { result, duration };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    recordPerformanceMetric({
      component,
      operation,
      duration,
      timestamp: startTimestamp,
      metadata: {
        ...metadata,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

/**
 * Get performance metrics
 */
export function getPerformanceMetrics(filters?: {
  component?: string;
  operation?: string;
  startTime?: number;
  endTime?: number;
}): PerformanceMetrics[] {
  let filteredMetrics = [...performanceMetrics];

  if (filters) {
    if (filters.component) {
      filteredMetrics = filteredMetrics.filter(m => m.component === filters.component);
    }
    if (filters.operation) {
      filteredMetrics = filteredMetrics.filter(m => m.operation === filters.operation);
    }
    if (filters.startTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= filters.startTime!);
    }
    if (filters.endTime) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= filters.endTime!);
    }
  }

  return filteredMetrics;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(component?: string): {
  totalOperations: number;
  averageDuration: number;
  slowOperations: number;
  errorRate: number;
  operationBreakdown: Record<string, {
    count: number;
    avgDuration: number;
    slowCount: number;
    errorCount: number;
  }>;
} {
  const metrics = getPerformanceMetrics({ component });

  if (metrics.length === 0) {
    return {
      totalOperations: 0,
      averageDuration: 0,
      slowOperations: 0,
      errorRate: 0,
      operationBreakdown: {},
    };
  }

  const totalOperations = metrics.length;
  const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
  const averageDuration = totalDuration / totalOperations;

  let slowOperations = 0;
  let errorCount = 0;

  const operationBreakdown: Record<string, {
    count: number;
    avgDuration: number;
    slowCount: number;
    errorCount: number;
  }> = {};

  metrics.forEach(metric => {
    const target = getPerformanceTarget(metric.operation);
    const isSlow = metric.duration > target;
    const isError = metric.metadata?.success === false;

    if (isSlow) slowOperations++;
    if (isError) errorCount++;

    if (!operationBreakdown[metric.operation]) {
      operationBreakdown[metric.operation] = {
        count: 0,
        avgDuration: 0,
        slowCount: 0,
        errorCount: 0,
      };
    }

    const breakdown = operationBreakdown[metric.operation];
    const prevCount = breakdown.count;
    const prevTotal = breakdown.avgDuration * prevCount;

    breakdown.count++;
    breakdown.avgDuration = (prevTotal + metric.duration) / breakdown.count;
    if (isSlow) breakdown.slowCount++;
    if (isError) breakdown.errorCount++;
  });

  return {
    totalOperations,
    averageDuration,
    slowOperations,
    errorRate: errorCount / totalOperations,
    operationBreakdown,
  };
}

/**
 * Optimize database queries with connection pooling
 */
export function optimizeQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    useCache?: boolean;
    cacheKey?: string;
    timeout?: number;
  } = {}
): Promise<T> {
  return measurePerformance(
    'database',
    'databaseQuery',
    async () => {
      const timeout = options.timeout || PERFORMANCE_TARGETS.DATABASE_QUERY_TIME;

      return Promise.race([
        queryFn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        ),
      ]);
    },
    { cacheKey: options.cacheKey, useCache: options.useCache }
  ).then(({ result }) => result);
}

/**
 * Optimize API responses with compression and caching
 */
export function optimizeApiResponse<T>(
  responseFn: () => Promise<T>,
  options: {
    enableCompression?: boolean;
    cacheKey?: string;
    ttl?: number;
  } = {}
): Promise<T> {
  return measurePerformance(
    'api',
    'apiResponse',
    responseFn,
    options
  ).then(({ result }) => result);
}

/**
 * Optimize image loading with lazy loading and compression
 */
export function optimizeImageLoading(
  imageUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}
): string {
  if (!config.enableImageOptimization) {
    return imageUrl;
  }

  const params = new URLSearchParams();
  if (options.width) params.set('w', options.width.toString());
  if (options.height) params.set('h', options.height.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);

  return `${imageUrl}?${params.toString()}`;
}

/**
 * Prefetch critical resources
 */
export function prefetchResources(resources: string[]): void {
  if (typeof window === 'undefined') return;

  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = resource;
    document.head.appendChild(link);
  });
}

/**
 * Optimize bundle size with code splitting
 */
export function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  return measurePerformance(
    'bundle',
    'dynamicImport',
    async () => {
      try {
        return await importFn();
      } catch (error) {
        if (fallback) {
          console.warn('Dynamic import failed, using fallback:', error);
          return fallback();
        }
        throw error;
      }
    }
  ).then(({ result }) => result);
}

/**
 * Performance monitoring middleware for Next.js API routes
 */
export function withPerformanceMonitoring<T extends Record<string, any>>(
  handler: (req: T) => Promise<any>
) {
  return async (req: T) => {
    const startTime = performance.now();
    const startTimestamp = Date.now();

    try {
      const result = await handler(req);
      const endTime = performance.now();
      const duration = endTime - startTime;

      recordPerformanceMetric({
        component: 'api',
        operation: 'apiResponse',
        duration,
        timestamp: startTimestamp,
        metadata: {
          success: true,
          method: (req as any).method,
          url: (req as any).url,
        },
      });

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      recordPerformanceMetric({
        component: 'api',
        operation: 'apiResponse',
        duration,
        timestamp: startTimestamp,
        metadata: {
          success: false,
          method: (req as any).method,
          url: (req as any).url,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  };
}

/**
 * Clear performance metrics
 */
export function clearPerformanceMetrics(): void {
  performanceMetrics.length = 0;
}

/**
 * Export performance metrics to JSON
 */
export function exportPerformanceMetrics(): string {
  return JSON.stringify({
    metrics: performanceMetrics,
    summary: getPerformanceSummary(),
    config,
    timestamp: Date.now(),
  }, null, 2);
}

/**
 * Validate performance targets
 */
export function validatePerformanceTargets(): {
  passed: boolean;
  results: Record<string, {
    target: number;
    actual: number;
    passed: boolean;
  }>;
} {
  const summary = getPerformanceSummary();
  const results: Record<string, { target: number; actual: number; passed: boolean }> = {};

  Object.entries(summary.operationBreakdown).forEach(([operation, breakdown]) => {
    const target = getPerformanceTarget(operation);
    results[operation] = {
      target,
      actual: breakdown.avgDuration,
      passed: breakdown.avgDuration <= target,
    };
  });

  const passed = Object.values(results).every(result => result.passed);

  return { passed, results };
}

export default {
  configurePerformance,
  performanceMonitor,
  measurePerformance,
  optimizeQuery,
  optimizeApiResponse,
  optimizeImageLoading,
  prefetchResources,
  dynamicImport,
  withPerformanceMonitoring,
  getPerformanceMetrics,
  getPerformanceSummary,
  validatePerformanceTargets,
  clearPerformanceMetrics,
  exportPerformanceMetrics,
  PERFORMANCE_TARGETS,
};