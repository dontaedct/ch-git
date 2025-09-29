import { useEffect, useState, useCallback } from 'react';

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface DashboardMetrics extends PerformanceMetrics {
  moduleLoadTimes: Record<string, number>;
  bundleSizes: Record<string, number>;
  apiResponseTimes: Record<string, number>;
  renderCount: number;
  memoryUsage: number;
  timestamp: Date;
}

export interface PerformanceThresholds {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  loadTime: 2000,
  firstContentfulPaint: 1000,
  largestContentfulPaint: 2500,
  cumulativeLayoutShift: 0.1,
  firstInputDelay: 100,
  timeToInteractive: 3000
};

class DashboardPerformanceMonitor {
  private metrics: DashboardMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS;
  private startTime: number = 0;
  private moduleTimings = new Map<string, number>();
  private apiTimings = new Map<string, number>();

  constructor() {
    this.initializeObservers();
    this.startTime = performance.now();
  }

  private initializeObservers() {
    if (typeof window === 'undefined') return;

    try {
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('firstContentfulPaint', entry.startTime);
          }
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
        if (lastEntry) {
          this.recordMetric('largestContentfulPaint', lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      const clsObserver = new PerformanceObserver((list) => {
        let clsScore = 0;
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
          if (!layoutShift.hadRecentInput) {
            clsScore += layoutShift.value || 0;
          }
        }
        this.recordMetric('cumulativeLayoutShift', clsScore);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const firstInput = entry as PerformanceEntry & { processingStart?: number };
          const fid = firstInput.processingStart ? firstInput.processingStart - entry.startTime : 0;
          this.recordMetric('firstInputDelay', fid);
        }
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);
    } catch (error) {
      console.error('Error initializing performance observers:', error);
    }
  }

  private recordMetric(name: keyof PerformanceMetrics, value: number) {
    const threshold = this.thresholds[name as keyof PerformanceThresholds];
    if (threshold && value > threshold) {
      console.warn(`Performance threshold exceeded for ${name}: ${value}ms (threshold: ${threshold}ms)`);
    }
  }

  recordModuleLoad(moduleId: string, loadTime: number) {
    this.moduleTimings.set(moduleId, loadTime);
  }

  recordApiCall(endpoint: string, responseTime: number) {
    this.apiTimings.set(endpoint, responseTime);
  }

  getMetrics(): DashboardMetrics {
    const performanceMetrics = this.collectPerformanceMetrics();
    const moduleLoadTimes = Object.fromEntries(this.moduleTimings);
    const apiResponseTimes = Object.fromEntries(this.apiTimings);

    return {
      ...performanceMetrics,
      moduleLoadTimes,
      bundleSizes: {},
      apiResponseTimes,
      renderCount: 0,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date()
    };
  }

  private collectPerformanceMetrics(): PerformanceMetrics {
    if (typeof window === 'undefined') {
      return this.getDefaultMetrics();
    }

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');

    return {
      loadTime: performance.now() - this.startTime,
      firstContentfulPaint: fcpEntry?.startTime || 0,
      largestContentfulPaint: this.getLCP(),
      cumulativeLayoutShift: this.getCLS(),
      firstInputDelay: this.getFID(),
      timeToInteractive: navigation?.domInteractive || 0,
      totalBlockingTime: this.getTBT()
    };
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      loadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0,
      timeToInteractive: 0,
      totalBlockingTime: 0
    };
  }

  private getLCP(): number {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lastEntry = lcpEntries[lcpEntries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
    return lastEntry ? (lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime) : 0;
  }

  private getCLS(): number {
    let clsScore = 0;
    const layoutShiftEntries = performance.getEntriesByType('layout-shift');
    for (const entry of layoutShiftEntries) {
      const layoutShift = entry as PerformanceEntry & { value?: number; hadRecentInput?: boolean };
      if (!layoutShift.hadRecentInput) {
        clsScore += layoutShift.value || 0;
      }
    }
    return clsScore;
  }

  private getFID(): number {
    const fidEntries = performance.getEntriesByType('first-input');
    if (fidEntries.length === 0) return 0;
    const firstInput = fidEntries[0] as PerformanceEntry & { processingStart?: number };
    return firstInput.processingStart ? firstInput.processingStart - firstInput.startTime : 0;
  }

  private getTBT(): number {
    const longTasks = performance.getEntriesByType('longtask');
    return longTasks.reduce((total, task) => {
      const blockingTime = Math.max(0, task.duration - 50);
      return total + blockingTime;
    }, 0);
  }

  private getMemoryUsage(): number {
    if (typeof window === 'undefined') return 0;
    const memory = (performance as any).memory;
    return memory ? memory.usedJSHeapSize / 1048576 : 0;
  }

  checkThresholds(): { passed: boolean; violations: string[] } {
    const metrics = this.getMetrics();
    const violations: string[] = [];

    if (metrics.loadTime > this.thresholds.loadTime) {
      violations.push(`Load time ${metrics.loadTime.toFixed(0)}ms exceeds threshold ${this.thresholds.loadTime}ms`);
    }

    if (metrics.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      violations.push(`FCP ${metrics.firstContentfulPaint.toFixed(0)}ms exceeds threshold ${this.thresholds.firstContentfulPaint}ms`);
    }

    if (metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      violations.push(`LCP ${metrics.largestContentfulPaint.toFixed(0)}ms exceeds threshold ${this.thresholds.largestContentfulPaint}ms`);
    }

    if (metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      violations.push(`CLS ${metrics.cumulativeLayoutShift.toFixed(3)} exceeds threshold ${this.thresholds.cumulativeLayoutShift}`);
    }

    if (metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      violations.push(`FID ${metrics.firstInputDelay.toFixed(0)}ms exceeds threshold ${this.thresholds.firstInputDelay}ms`);
    }

    return {
      passed: violations.length === 0,
      violations
    };
  }

  getReport(): string {
    const metrics = this.getMetrics();
    const { passed, violations } = this.checkThresholds();

    let report = '=== Dashboard Performance Report ===\n\n';
    report += `Timestamp: ${metrics.timestamp.toISOString()}\n\n`;
    report += 'Core Web Vitals:\n';
    report += `  Load Time: ${metrics.loadTime.toFixed(0)}ms (threshold: ${this.thresholds.loadTime}ms)\n`;
    report += `  First Contentful Paint: ${metrics.firstContentfulPaint.toFixed(0)}ms (threshold: ${this.thresholds.firstContentfulPaint}ms)\n`;
    report += `  Largest Contentful Paint: ${metrics.largestContentfulPaint.toFixed(0)}ms (threshold: ${this.thresholds.largestContentfulPaint}ms)\n`;
    report += `  Cumulative Layout Shift: ${metrics.cumulativeLayoutShift.toFixed(3)} (threshold: ${this.thresholds.cumulativeLayoutShift})\n`;
    report += `  First Input Delay: ${metrics.firstInputDelay.toFixed(0)}ms (threshold: ${this.thresholds.firstInputDelay}ms)\n`;
    report += `  Time to Interactive: ${metrics.timeToInteractive.toFixed(0)}ms\n`;
    report += `  Total Blocking Time: ${metrics.totalBlockingTime.toFixed(0)}ms\n\n`;

    report += 'Module Load Times:\n';
    Object.entries(metrics.moduleLoadTimes).forEach(([module, time]) => {
      report += `  ${module}: ${time.toFixed(0)}ms\n`;
    });

    report += '\nAPI Response Times:\n';
    Object.entries(metrics.apiResponseTimes).forEach(([endpoint, time]) => {
      report += `  ${endpoint}: ${time.toFixed(0)}ms\n`;
    });

    report += `\nMemory Usage: ${metrics.memoryUsage.toFixed(2)}MB\n\n`;

    report += `Status: ${passed ? 'PASSED ✓' : 'FAILED ✗'}\n`;
    if (violations.length > 0) {
      report += '\nThreshold Violations:\n';
      violations.forEach(violation => {
        report += `  ⚠️  ${violation}\n`;
      });
    }

    return report;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.moduleTimings.clear();
    this.apiTimings.clear();
  }
}

export const dashboardPerformanceMonitor = new DashboardPerformanceMonitor();

export function useDashboardPerformance() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [monitoring, setMonitoring] = useState(false);

  const startMonitoring = useCallback(() => {
    setMonitoring(true);
  }, []);

  const stopMonitoring = useCallback(() => {
    setMonitoring(false);
    const finalMetrics = dashboardPerformanceMonitor.getMetrics();
    setMetrics(finalMetrics);
  }, []);

  const recordModuleLoad = useCallback((moduleId: string, loadTime: number) => {
    dashboardPerformanceMonitor.recordModuleLoad(moduleId, loadTime);
  }, []);

  const recordApiCall = useCallback((endpoint: string, responseTime: number) => {
    dashboardPerformanceMonitor.recordApiCall(endpoint, responseTime);
  }, []);

  const getReport = useCallback(() => {
    return dashboardPerformanceMonitor.getReport();
  }, []);

  useEffect(() => {
    if (monitoring) {
      const interval = setInterval(() => {
        setMetrics(dashboardPerformanceMonitor.getMetrics());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [monitoring]);

  useEffect(() => {
    return () => {
      dashboardPerformanceMonitor.cleanup();
    };
  }, []);

  return {
    metrics,
    monitoring,
    startMonitoring,
    stopMonitoring,
    recordModuleLoad,
    recordApiCall,
    getReport,
    checkThresholds: dashboardPerformanceMonitor.checkThresholds.bind(dashboardPerformanceMonitor)
  };
}

export function usePerformanceMonitoring(componentName: string) {
  const [renderTime, setRenderTime] = useState(0);

  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setRenderTime(duration);
      console.log(`${componentName} render time: ${duration.toFixed(2)}ms`);
    };
  }, [componentName]);

  return { renderTime };
}