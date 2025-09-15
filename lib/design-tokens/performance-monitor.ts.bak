/**
 * @fileoverview HT-008.10.7: Design System Performance Monitoring
 * @module lib/design-tokens/performance-monitor.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.7 - Design System Performance Optimization
 * Focus: Real-time performance monitoring for design system components
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system performance)
 */

import { designTokens } from './tokens';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  component?: string;
  context?: string;
}

interface PerformanceReport {
  timestamp: string;
  metrics: PerformanceMetric[];
  summary: {
    averageRenderTime: number;
    totalComponents: number;
    slowestComponent: string;
    fastestComponent: string;
  };
  recommendations: string[];
}

class DesignSystemPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializeObservers();
  }

  /**
   * Start performance monitoring
   */
  start(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('🔍 Starting Design System Performance Monitoring...');

    // Start observing performance entries
    this.observers.forEach(observer => observer.observe());
  }

  /**
   * Stop performance monitoring
   */
  stop(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    console.log('⏹️ Stopping Design System Performance Monitoring...');

    // Stop observing performance entries
    this.observers.forEach(observer => observer.disconnect());
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    // Observe paint metrics
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric({
          name: entry.name,
          value: entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
          context: 'paint',
        });
      }
    });

    try {
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    } catch (error) {
      console.warn('Paint observer not supported:', error);
    }

    // Observe navigation metrics
    const navigationObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordMetric({
          name: 'navigation',
          value: navEntry.loadEventEnd - navEntry.loadEventStart,
          unit: 'ms',
          timestamp: Date.now(),
          context: 'navigation',
        });
      }
    });

    try {
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }

    // Observe resource metrics
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        this.recordMetric({
          name: 'resource',
          value: resourceEntry.responseEnd - resourceEntry.requestStart,
          unit: 'ms',
          timestamp: Date.now(),
          context: 'resource',
          component: resourceEntry.name,
        });
      }
    });

    try {
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Measure component render time
   */
  measureComponentRender<T>(
    componentName: string,
    renderFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = renderFunction();
    const endTime = performance.now();

    this.recordMetric({
      name: 'component-render',
      value: endTime - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      component: componentName,
      context: 'render',
    });

    return result;
  }

  /**
   * Measure design token access time
   */
  measureTokenAccess<T>(
    tokenPath: string,
    accessFunction: () => T
  ): T {
    const startTime = performance.now();
    const result = accessFunction();
    const endTime = performance.now();

    this.recordMetric({
      name: 'token-access',
      value: endTime - startTime,
      unit: 'ms',
      timestamp: Date.now(),
      component: tokenPath,
      context: 'tokens',
    });

    return result;
  }

  /**
   * Get performance metrics by type
   */
  getMetricsByType(type: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === type);
  }

  /**
   * Get performance metrics by component
   */
  getMetricsByComponent(component: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.component === component);
  }

  /**
   * Get average performance metric
   */
  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByType(name);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Get slowest component
   */
  getSlowestComponent(): { component: string; averageTime: number } | null {
    const renderMetrics = this.getMetricsByType('component-render');
    if (renderMetrics.length === 0) return null;

    const componentTimes: Record<string, number[]> = {};
    
    renderMetrics.forEach(metric => {
      if (metric.component) {
        if (!componentTimes[metric.component]) {
          componentTimes[metric.component] = [];
        }
        componentTimes[metric.component].push(metric.value);
      }
    });

    let slowestComponent = '';
    let slowestTime = 0;

    Object.entries(componentTimes).forEach(([component, times]) => {
      const averageTime = times.reduce((acc, time) => acc + time, 0) / times.length;
      if (averageTime > slowestTime) {
        slowestTime = averageTime;
        slowestComponent = component;
      }
    });

    return { component: slowestComponent, averageTime: slowestTime };
  }

  /**
   * Get fastest component
   */
  getFastestComponent(): { component: string; averageTime: number } | null {
    const renderMetrics = this.getMetricsByType('component-render');
    if (renderMetrics.length === 0) return null;

    const componentTimes: Record<string, number[]> = {};
    
    renderMetrics.forEach(metric => {
      if (metric.component) {
        if (!componentTimes[metric.component]) {
          componentTimes[metric.component] = [];
        }
        componentTimes[metric.component].push(metric.value);
      }
    });

    let fastestComponent = '';
    let fastestTime = Infinity;

    Object.entries(componentTimes).forEach(([component, times]) => {
      const averageTime = times.reduce((acc, time) => acc + time, 0) / times.length;
      if (averageTime < fastestTime) {
        fastestTime = averageTime;
        fastestComponent = component;
      }
    });

    return { component: fastestComponent, averageTime: fastestTime };
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const renderMetrics = this.getMetricsByType('component-render');
    const averageRenderTime = this.getAverageMetric('component-render');
    
    const components = new Set(renderMetrics.map(m => m.component).filter(Boolean));
    const totalComponents = components.size;

    const slowest = this.getSlowestComponent();
    const fastest = this.getFastestComponent();

    const recommendations = this.generateRecommendations();

    return {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      summary: {
        averageRenderTime,
        totalComponents,
        slowestComponent: slowest?.component || 'N/A',
        fastestComponent: fastest?.component || 'N/A',
      },
      recommendations,
    };
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    const averageRenderTime = this.getAverageMetric('component-render');
    if (averageRenderTime > 16) { // 60fps threshold
      recommendations.push('Component render time exceeds 16ms - consider optimization');
    }

    const slowest = this.getSlowestComponent();
    if (slowest && slowest.averageTime > 50) {
      recommendations.push(`Component "${slowest.component}" is slow - investigate performance bottlenecks`);
    }

    const tokenAccessTime = this.getAverageMetric('token-access');
    if (tokenAccessTime > 1) {
      recommendations.push('Design token access is slow - consider caching');
    }

    const paintTime = this.getAverageMetric('first-contentful-paint');
    if (paintTime > 2500) {
      recommendations.push('First Contentful Paint exceeds 2.5s - optimize critical rendering path');
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  /**
   * Import metrics from JSON
   */
  importMetrics(json: string): void {
    try {
      this.metrics = JSON.parse(json);
    } catch (error) {
      console.error('Failed to import metrics:', error);
    }
  }
}

/**
 * Hook for using performance monitoring in components
 */
export function usePerformanceMonitor() {
  const monitor = new DesignSystemPerformanceMonitor();
  
  return {
    startMonitoring: () => monitor.start(),
    stopMonitoring: () => monitor.stop(),
    measureRender: <T>(componentName: string, renderFn: () => T) => 
      monitor.measureComponentRender(componentName, renderFn),
    measureTokenAccess: <T>(tokenPath: string, accessFn: () => T) => 
      monitor.measureTokenAccess(tokenPath, accessFn),
    getReport: () => monitor.generateReport(),
    getMetrics: () => monitor.exportMetrics(),
  };
}

/**
 * Higher-order component for automatic performance monitoring
 */
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const { measureRender } = usePerformanceMonitor();
    const name = componentName || Component.displayName || Component.name || 'Unknown';
    
    return measureRender(name, () => <Component {...props} />);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName || Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * Utility for measuring design token performance
 */
export function measureTokenPerformance<T>(
  tokenPath: string,
  accessFunction: () => T
): T {
  const monitor = new DesignSystemPerformanceMonitor();
  return monitor.measureTokenAccess(tokenPath, accessFunction);
}

/**
 * Utility for measuring component performance
 */
export function measureComponentPerformance<T>(
  componentName: string,
  renderFunction: () => T
): T {
  const monitor = new DesignSystemPerformanceMonitor();
  return monitor.measureComponentRender(componentName, renderFunction);
}

// Global performance monitor instance
export const globalPerformanceMonitor = new DesignSystemPerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  globalPerformanceMonitor.start();
}

export default DesignSystemPerformanceMonitor;
