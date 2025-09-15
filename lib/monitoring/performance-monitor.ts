/**
 * @fileoverview HT-021.3.4: Performance Monitoring & Analytics Setup
 * @module lib/monitoring/performance-monitor
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.4 - Performance Monitoring & Analytics Setup
 * Focus: Comprehensive performance monitoring and real-time tracking
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (performance impact)
 */

import React from 'react';
import { useAppStore } from '../state/zustand-store';

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  category: 'web-vitals' | 'custom' | 'navigation' | 'resource' | 'user-timing';
  tags?: Record<string, string>;
  context?: Record<string, any>;
}

export interface WebVitalsMetrics {
  // Core Web Vitals
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift
  
  // Additional Web Vitals
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
  INP: number | null; // Interaction to Next Paint
}

export interface NavigationMetrics {
  domContentLoaded: number;
  loadComplete: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
}

export interface ResourceMetrics {
  name: string;
  size: number;
  duration: number;
  type: 'script' | 'stylesheet' | 'image' | 'font' | 'document' | 'other';
  cached: boolean;
}

export interface UserInteractionMetric {
  type: 'click' | 'scroll' | 'input' | 'navigation' | 'custom';
  element?: string;
  duration?: number;
  timestamp: number;
  context?: Record<string, any>;
}

export interface PerformanceBudget {
  LCP: number;
  FID: number;
  CLS: number;
  FCP: number;
  TTFB: number;
  bundleSize: number;
  memoryUsage: number;
}

export interface PerformanceAlert {
  metric: string;
  threshold: number;
  actualValue: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  context?: Record<string, any>;
}

// ============================================================================
// CORE PERFORMANCE MONITOR CLASS
// ============================================================================

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private webVitals: WebVitalsMetrics = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
  };
  private budget: PerformanceBudget;
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportingEndpoint: string;
  private reportingInterval: number;
  private isInitialized = false;

  constructor(config: {
    budget?: Partial<PerformanceBudget>;
    reportingEndpoint?: string;
    reportingInterval?: number;
  } = {}) {
    this.budget = {
      LCP: 2500, // 2.5s
      FID: 100,  // 100ms
      CLS: 0.1,  // 0.1
      FCP: 1800, // 1.8s
      TTFB: 800, // 800ms
      bundleSize: 1024 * 1024, // 1MB
      memoryUsage: 50 * 1024 * 1024, // 50MB
      ...config.budget,
    };
    
    this.reportingEndpoint = config.reportingEndpoint || '/api/performance';
    this.reportingInterval = config.reportingInterval || 30000; // 30 seconds
  }

  static getInstance(config?: any): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;
    
    this.setupWebVitalsObserver();
    this.setupNavigationObserver();
    this.setupResourceObserver();
    this.setupUserTimingObserver();
    this.setupMemoryMonitoring();
    this.startPeriodicReporting();
    
    this.isInitialized = true;
    console.log('Performance Monitor initialized');
  }

  // ============================================================================
  // WEB VITALS MONITORING
  // ============================================================================

  private setupWebVitalsObserver(): void {
    // Import web-vitals library dynamically
    this.importWebVitals().then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onLCP((metric: any) => {
        this.webVitals.LCP = metric.value;
        this.recordMetric({
          name: 'LCP',
          value: metric.value,
          timestamp: Date.now(),
          category: 'web-vitals',
          context: { rating: metric.rating, entries: metric.entries },
        });
        this.checkBudget('LCP', metric.value);
      });

      onFID((metric: any) => {
        this.webVitals.FID = metric.value;
        this.recordMetric({
          name: 'FID',
          value: metric.value,
          timestamp: Date.now(),
          category: 'web-vitals',
          context: { rating: metric.rating, entries: metric.entries },
        });
        this.checkBudget('FID', metric.value);
      });

      onCLS((metric: any) => {
        this.webVitals.CLS = metric.value;
        this.recordMetric({
          name: 'CLS',
          value: metric.value,
          timestamp: Date.now(),
          category: 'web-vitals',
          context: { rating: metric.rating, entries: metric.entries },
        });
        this.checkBudget('CLS', metric.value);
      });

      onFCP((metric: any) => {
        this.webVitals.FCP = metric.value;
        this.recordMetric({
          name: 'FCP',
          value: metric.value,
          timestamp: Date.now(),
          category: 'web-vitals',
          context: { rating: metric.rating },
        });
        this.checkBudget('FCP', metric.value);
      });

      onTTFB((metric: any) => {
        this.webVitals.TTFB = metric.value;
        this.recordMetric({
          name: 'TTFB',
          value: metric.value,
          timestamp: Date.now(),
          category: 'web-vitals',
          context: { rating: metric.rating },
        });
        this.checkBudget('TTFB', metric.value);
      });

      if (onINP) {
        onINP((metric: any) => {
          this.webVitals.INP = metric.value;
          this.recordMetric({
            name: 'INP',
            value: metric.value,
            timestamp: Date.now(),
            category: 'web-vitals',
            context: { rating: metric.rating, entries: metric.entries },
          });
        });
      }
    }).catch((error) => {
      console.warn('Web Vitals library not available:', error);
      // Fallback to manual measurements
      this.setupFallbackWebVitals();
    });
  }

  private async importWebVitals(): Promise<any> {
    // Try to import web-vitals library
    try {
      return await import('web-vitals' as any);
    } catch {
      throw new Error('web-vitals library not found');
    }
  }

  private setupFallbackWebVitals(): void {
    // Fallback measurements for when web-vitals library isn't available
    
    // Measure FCP using Performance API
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.webVitals.FCP = fcpEntry.startTime;
        this.recordMetric({
          name: 'FCP',
          value: fcpEntry.startTime,
          timestamp: Date.now(),
          category: 'web-vitals',
        });
      }
    }

    // Setup LCP observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          if (lastEntry) {
            this.webVitals.LCP = lastEntry.startTime;
            this.recordMetric({
              name: 'LCP',
              value: lastEntry.startTime,
              timestamp: Date.now(),
              category: 'web-vitals',
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (error) {
        console.warn('LCP observer setup failed:', error);
      }
    }
  }

  // ============================================================================
  // NAVIGATION MONITORING
  // ============================================================================

  private setupNavigationObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceNavigationTiming[];
        entries.forEach((entry) => {
          const navigationMetrics: NavigationMetrics = {
            domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            loadComplete: entry.loadEventEnd - entry.loadEventStart,
            firstPaint: 0, // Will be filled by paint observer
            firstContentfulPaint: 0, // Will be filled by paint observer
            largestContentfulPaint: 0, // Will be filled by LCP observer
            timeToInteractive: 0, // Calculated separately
            totalBlockingTime: 0, // Calculated from long tasks
          };

          this.recordMetric({
            name: 'navigation',
            value: entry.duration,
            timestamp: Date.now(),
            category: 'navigation',
            context: navigationMetrics,
          });
        });
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.set('navigation', navigationObserver);
    } catch (error) {
      console.warn('Navigation observer setup failed:', error);
    }
  }

  // ============================================================================
  // RESOURCE MONITORING
  // ============================================================================

  private setupResourceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceResourceTiming[];
        entries.forEach((entry) => {
          const resourceMetric: ResourceMetrics = {
            name: entry.name,
            size: entry.transferSize || 0,
            duration: entry.duration,
            type: this.getResourceType(entry.name),
            cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
          };

          this.recordMetric({
            name: 'resource',
            value: entry.duration,
            timestamp: Date.now(),
            category: 'resource',
            tags: {
              resourceName: entry.name,
              resourceType: resourceMetric.type,
              cached: resourceMetric.cached.toString(),
            },
            context: resourceMetric,
          });
        });
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.set('resource', resourceObserver);
    } catch (error) {
      console.warn('Resource observer setup failed:', error);
    }
  }

  private getResourceType(url: string): ResourceMetrics['type'] {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    if (url.includes('document') || url === document.location.href) return 'document';
    return 'other';
  }

  // ============================================================================
  // USER TIMING MONITORING
  // ============================================================================

  private setupUserTimingObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const userTimingObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: entry.name,
            value: entry.duration || entry.startTime,
            timestamp: Date.now(),
            category: 'user-timing',
            tags: {
              entryType: entry.entryType,
            },
            context: {
              startTime: entry.startTime,
              duration: entry.duration,
            },
          });
        });
      });

      userTimingObserver.observe({ entryTypes: ['measure', 'mark'] });
      this.observers.set('user-timing', userTimingObserver);
    } catch (error) {
      console.warn('User timing observer setup failed:', error);
    }
  }

  // ============================================================================
  // MEMORY MONITORING
  // ============================================================================

  private setupMemoryMonitoring(): void {
    if (!('memory' in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      if (memory) {
        this.recordMetric({
          name: 'memory-usage',
          value: memory.usedJSHeapSize,
          timestamp: Date.now(),
          category: 'custom',
          context: {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          },
        });

        // Check memory budget
        this.checkBudget('memoryUsage', memory.usedJSHeapSize);
      }
    }, 10000); // Check every 10 seconds
  }

  // ============================================================================
  // CUSTOM METRICS
  // ============================================================================

  recordCustomMetric(name: string, value: number, tags?: Record<string, string>, context?: Record<string, any>): void {
    this.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      category: 'custom',
      tags,
      context,
    });
  }

  startCustomTimer(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordCustomMetric(name, duration, { type: 'timer' }, { startTime, duration });
    };
  }

  measureComponent(componentName: string): (phase: string) => void {
    const startTime = performance.now();
    return (phase: string) => {
      const duration = performance.now() - startTime;
      this.recordCustomMetric(`component-${phase}`, duration, { 
        component: componentName, 
        phase 
      }, { 
        componentName, 
        phase, 
        duration 
      });
    };
  }

  measureAPICall(endpoint: string, method: string = 'GET'): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordCustomMetric('api-call', duration, { 
        endpoint, 
        method 
      }, { 
        endpoint, 
        method, 
        duration 
      });
    };
  }

  // ============================================================================
  // BUDGET MONITORING
  // ============================================================================

  private checkBudget(metric: keyof PerformanceBudget, value: number): void {
    const threshold = this.budget[metric];
    if (value > threshold) {
      const severity = value > threshold * 1.5 ? 'critical' : 'warning';
      const alert: PerformanceAlert = {
        metric,
        threshold,
        actualValue: value,
        severity,
        timestamp: Date.now(),
        context: { budget: this.budget },
      };

      this.handlePerformanceAlert(alert);
    }
  }

  private handlePerformanceAlert(alert: PerformanceAlert): void {
    console.warn(`Performance Alert: ${alert.metric} exceeded budget`, alert);
    
    // Add to global error store
    const addGlobalError = (useAppStore.getState().errors as any).addGlobalError;
    addGlobalError({
      message: `Performance budget exceeded: ${alert.metric} = ${alert.actualValue.toFixed(2)} (budget: ${alert.threshold})`,
      code: `PERF_${alert.metric.toUpperCase()}_BUDGET_EXCEEDED`,
      severity: alert.severity === 'critical' ? 'high' : 'medium',
      context: alert,
    });

    // Report immediately if critical
    if (alert.severity === 'critical') {
      this.reportMetrics([{
        name: `alert-${alert.metric}`,
        value: alert.actualValue,
        timestamp: alert.timestamp,
        category: 'custom',
        tags: { severity: alert.severity, type: 'budget-exceeded' },
        context: alert,
      }]);
    }
  }

  // ============================================================================
  // METRIC COLLECTION AND REPORTING
  // ============================================================================

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics in memory
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
    
    // Emit event for real-time monitoring
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('performance-metric', { 
        detail: metric 
      }));
    }
  }

  private startPeriodicReporting(): void {
    setInterval(() => {
      if (this.metrics.length > 0) {
        this.reportMetrics([...this.metrics]);
        this.metrics = []; // Clear metrics after reporting
      }
    }, this.reportingInterval);
  }

  private async reportMetrics(metrics: PerformanceMetric[]): Promise<void> {
    if (!metrics.length) return;

    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          webVitals: this.webVitals,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      });
    } catch (error) {
      console.error('Failed to report performance metrics:', error);
      // Store in localStorage as fallback
      const storedMetrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      localStorage.setItem('performance_metrics', JSON.stringify([...storedMetrics, ...metrics]));
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getWebVitals(): WebVitalsMetrics {
    return { ...this.webVitals };
  }

  getCurrentMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getBudget(): PerformanceBudget {
    return { ...this.budget };
  }

  updateBudget(newBudget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...newBudget };
  }

  getPerformanceScore(): number {
    const scores = {
      LCP: this.webVitals.LCP ? Math.max(0, 100 - (this.webVitals.LCP / this.budget.LCP) * 100) : 0,
      FID: this.webVitals.FID ? Math.max(0, 100 - (this.webVitals.FID / this.budget.FID) * 100) : 0,
      CLS: this.webVitals.CLS ? Math.max(0, 100 - (this.webVitals.CLS / this.budget.CLS) * 100) : 0,
    };

    const validScores = Object.values(scores).filter(score => score > 0);
    return validScores.length > 0 ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : 0;
  }

  generateReport(): {
    webVitals: WebVitalsMetrics;
    performanceScore: number;
    budgetCompliance: Record<string, boolean>;
    recommendations: string[];
  } {
    const budgetCompliance = {
      LCP: !this.webVitals.LCP || this.webVitals.LCP <= this.budget.LCP,
      FID: !this.webVitals.FID || this.webVitals.FID <= this.budget.FID,
      CLS: !this.webVitals.CLS || this.webVitals.CLS <= this.budget.CLS,
      FCP: !this.webVitals.FCP || this.webVitals.FCP <= this.budget.FCP,
      TTFB: !this.webVitals.TTFB || this.webVitals.TTFB <= this.budget.TTFB,
    };

    const recommendations: string[] = [];
    if (!budgetCompliance.LCP) {
      recommendations.push('Optimize images and reduce server response time to improve LCP');
    }
    if (!budgetCompliance.FID) {
      recommendations.push('Reduce JavaScript execution time and optimize event handlers');
    }
    if (!budgetCompliance.CLS) {
      recommendations.push('Reserve space for images and ads to prevent layout shifts');
    }
    if (!budgetCompliance.FCP) {
      recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
    }
    if (!budgetCompliance.TTFB) {
      recommendations.push('Optimize server response time and consider using CDN');
    }

    return {
      webVitals: this.webVitals,
      performanceScore: this.getPerformanceScore(),
      budgetCompliance,
      recommendations,
    };
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
    this.isInitialized = false;
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

export function usePerformanceMonitorService() {
  const monitor = PerformanceMonitor.getInstance();
  
  React.useEffect(() => {
    if (!(monitor as any).isInitialized) {
      monitor.initialize();
    }
    
    return () => {
      // Don't destroy on unmount as it's a singleton
    };
  }, [monitor]);

  return {
    monitor,
    recordCustomMetric: monitor.recordCustomMetric.bind(monitor),
    startCustomTimer: monitor.startCustomTimer.bind(monitor),
    measureComponent: monitor.measureComponent.bind(monitor),
    measureAPICall: monitor.measureAPICall.bind(monitor),
    getWebVitals: monitor.getWebVitals.bind(monitor),
    getPerformanceScore: monitor.getPerformanceScore.bind(monitor),
    generateReport: monitor.generateReport.bind(monitor),
  };
}

export function useWebVitals() {
  const [webVitals, setWebVitals] = React.useState<WebVitalsMetrics>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
  });

  React.useEffect(() => {
    const monitor = PerformanceMonitor.getInstance();
    
    const updateWebVitals = () => {
      setWebVitals(monitor.getWebVitals());
    };

    // Initial update
    updateWebVitals();

    // Listen for updates
    const handleMetric = () => updateWebVitals();
    window.addEventListener('performance-metric', handleMetric);

    return () => {
      window.removeEventListener('performance-metric', handleMetric);
    };
  }, []);

  return webVitals;
}

export default PerformanceMonitor;