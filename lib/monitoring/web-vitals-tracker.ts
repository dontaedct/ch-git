/**
 * @fileoverview HT-021.3.4: Core Web Vitals Tracking Configuration
 * @module lib/monitoring/web-vitals-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.4 - Performance Monitoring & Analytics Setup
 * Focus: Core Web Vitals tracking with detailed measurement and reporting
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (measurement only)
 */

import React from 'react';
import { useAppStore } from '../state/zustand-store';

// ============================================================================
// WEB VITALS TYPES
// ============================================================================

export interface WebVitalMetric {
  name: 'FCP' | 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
  id: string;
  navigationType: string;
}

export interface WebVitalThresholds {
  FCP: { good: number; poor: number };
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  TTFB: { good: number; poor: number };
  INP: { good: number; poor: number };
}

export interface WebVitalReport {
  metrics: Record<string, WebVitalMetric>;
  overallScore: number;
  recommendations: string[];
  timestamp: number;
  url: string;
  userAgent: string;
}

export interface WebVitalAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  context: Record<string, any>;
}

// ============================================================================
// WEB VITALS CONFIGURATION
// ============================================================================

export const WEB_VITAL_THRESHOLDS: WebVitalThresholds = {
  // First Contentful Paint - measures loading performance
  FCP: { good: 1800, poor: 3000 }, // 1.8s good, 3s poor
  
  // Largest Contentful Paint - measures loading performance
  LCP: { good: 2500, poor: 4000 }, // 2.5s good, 4s poor
  
  // First Input Delay - measures interactivity
  FID: { good: 100, poor: 300 }, // 100ms good, 300ms poor
  
  // Cumulative Layout Shift - measures visual stability
  CLS: { good: 0.1, poor: 0.25 }, // 0.1 good, 0.25 poor
  
  // Time to First Byte - measures server responsiveness
  TTFB: { good: 800, poor: 1800 }, // 800ms good, 1.8s poor
  
  // Interaction to Next Paint - measures responsiveness
  INP: { good: 200, poor: 500 }, // 200ms good, 500ms poor
};

// ============================================================================
// WEB VITALS TRACKER
// ============================================================================

export class WebVitalsTracker {
  private static instance: WebVitalsTracker;
  private metrics: Map<string, WebVitalMetric> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private reportingEndpoint: string;
  private alertCallback?: (alert: WebVitalAlert) => void;
  private onMetricCallback?: (metric: WebVitalMetric) => void;
  private isInitialized = false;

  constructor(config: {
    reportingEndpoint?: string;
    alertCallback?: (alert: WebVitalAlert) => void;
    onMetricCallback?: (metric: WebVitalMetric) => void;
  } = {}) {
    this.reportingEndpoint = config.reportingEndpoint || '/api/web-vitals';
    this.alertCallback = config.alertCallback;
    this.onMetricCallback = config.onMetricCallback;
  }

  static getInstance(config?: any): WebVitalsTracker {
    if (!WebVitalsTracker.instance) {
      WebVitalsTracker.instance = new WebVitalsTracker(config);
    }
    return WebVitalsTracker.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to use web-vitals library if available
      const webVitals = await this.importWebVitals();
      this.setupWithLibrary(webVitals);
    } catch {
      // Fallback to manual implementation
      this.setupManualTracking();
    }

    this.isInitialized = true;
    console.log('Web Vitals Tracker initialized');
  }

  private async importWebVitals(): Promise<any> {
    // Dynamic import of web-vitals library
    // return import('web-vitals');
    return null; // Disabled: web-vitals package not installed
  }

  private setupWithLibrary(webVitals: any): void {
    const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;

    // Setup each metric with the library
    onFCP(this.handleMetric.bind(this));
    onLCP(this.handleMetric.bind(this));
    onFID(this.handleMetric.bind(this));
    onCLS(this.handleMetric.bind(this));
    onTTFB(this.handleMetric.bind(this));
    
    // INP is newer and might not be available in all versions
    if (onINP) {
      onINP(this.handleMetric.bind(this));
    }
  }

  private setupManualTracking(): void {
    this.setupFCPTracking();
    this.setupLCPTracking();
    this.setupFIDTracking();
    this.setupCLSTracking();
    this.setupTTFBTracking();
    this.setupINPTracking();
  }

  private handleMetric(metric: WebVitalMetric): void {
    // Store the metric
    this.metrics.set(metric.name, metric);

    // Check thresholds and create alerts
    this.checkThreshold(metric);

    // Call callback if provided
    if (this.onMetricCallback) {
      this.onMetricCallback(metric);
    }

    // Report metric
    this.reportMetric(metric);

    console.log(`Web Vital ${metric.name}:`, metric.value, metric.rating);
  }

  // ============================================================================
  // MANUAL TRACKING IMPLEMENTATIONS
  // ============================================================================

  private setupFCPTracking(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        
        if (fcpEntry) {
          const metric: WebVitalMetric = {
            name: 'FCP',
            value: fcpEntry.startTime,
            rating: this.getRating('FCP', fcpEntry.startTime),
            delta: fcpEntry.startTime,
            entries: [fcpEntry],
            id: this.generateMetricId('FCP'),
            navigationType: this.getNavigationType(),
          };
          
          this.handleMetric(metric);
          observer.disconnect();
        }
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.set('fcp', observer);
    } catch (error) {
      console.warn('FCP tracking setup failed:', error);
    }
  }

  private setupLCPTracking(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let lcpValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry) {
          lcpValue = lastEntry.startTime;
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Report LCP when the page lifecycle changes
      const reportLCP = () => {
        if (lcpValue > 0) {
          const metric: WebVitalMetric = {
            name: 'LCP',
            value: lcpValue,
            rating: this.getRating('LCP', lcpValue),
            delta: lcpValue,
            entries: [], // Simplified for manual tracking
            id: this.generateMetricId('LCP'),
            navigationType: this.getNavigationType(),
          };
          
          this.handleMetric(metric);
          observer.disconnect();
        }
      };

      // Report when page becomes hidden or is unloading
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportLCP();
        }
      });

      window.addEventListener('pagehide', reportLCP);
      
      this.observers.set('lcp', observer);
    } catch (error) {
      console.warn('LCP tracking setup failed:', error);
    }
  }

  private setupFIDTracking(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        
        entries.forEach((entry) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime;
            
            const metric: WebVitalMetric = {
              name: 'FID',
              value: fid,
              rating: this.getRating('FID', fid),
              delta: fid,
              entries: [entry],
              id: this.generateMetricId('FID'),
              navigationType: this.getNavigationType(),
            };
            
            this.handleMetric(metric);
            observer.disconnect();
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', observer);
    } catch (error) {
      console.warn('FID tracking setup failed:', error);
    }
  }

  private setupCLSTracking(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries: PerformanceEntry[] = [];

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // Check if entry belongs to the same session
            if (sessionValue && 
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              sessionValue = entry.value;
              sessionEntries = [entry];
            }

            if (sessionValue > clsValue) {
              clsValue = sessionValue;
            }
          }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });

      // Report CLS when page lifecycle changes
      const reportCLS = () => {
        const metric: WebVitalMetric = {
          name: 'CLS',
          value: clsValue,
          rating: this.getRating('CLS', clsValue),
          delta: clsValue,
          entries: sessionEntries,
          id: this.generateMetricId('CLS'),
          navigationType: this.getNavigationType(),
        };
        
        this.handleMetric(metric);
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportCLS();
        }
      });

      window.addEventListener('pagehide', reportCLS);
      
      this.observers.set('cls', observer);
    } catch (error) {
      console.warn('CLS tracking setup failed:', error);
    }
  }

  private setupTTFBTracking(): void {
    if (!('performance' in window) || !('getEntriesByType' in performance)) return;

    try {
      const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      const navigationEntry = navigationEntries[0];
      
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        
        const metric: WebVitalMetric = {
          name: 'TTFB',
          value: ttfb,
          rating: this.getRating('TTFB', ttfb),
          delta: ttfb,
          entries: [navigationEntry],
          id: this.generateMetricId('TTFB'),
          navigationType: this.getNavigationType(),
        };
        
        this.handleMetric(metric);
      }
    } catch (error) {
      console.warn('TTFB tracking setup failed:', error);
    }
  }

  private setupINPTracking(): void {
    // INP is more complex to implement manually
    // This is a simplified version
    if (!('PerformanceObserver' in window)) return;

    try {
      let maxInteractionDelay = 0;
      
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as any[];
        
        entries.forEach((entry) => {
          if (entry.interactionId) {
            const delay = entry.processingEnd - entry.startTime;
            if (delay > maxInteractionDelay) {
              maxInteractionDelay = delay;
            }
          }
        });
      });

      // Observe event entries
      observer.observe({ entryTypes: ['event'] });

      // Report INP when page lifecycle changes
      const reportINP = () => {
        if (maxInteractionDelay > 0) {
          const metric: WebVitalMetric = {
            name: 'INP',
            value: maxInteractionDelay,
            rating: this.getRating('INP', maxInteractionDelay),
            delta: maxInteractionDelay,
            entries: [],
            id: this.generateMetricId('INP'),
            navigationType: this.getNavigationType(),
          };
          
          this.handleMetric(metric);
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          reportINP();
        }
      });

      window.addEventListener('pagehide', reportINP);
      
      this.observers.set('inp', observer);
    } catch (error) {
      console.warn('INP tracking setup failed:', error);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getRating(metricName: keyof WebVitalThresholds, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = WEB_VITAL_THRESHOLDS[metricName];
    
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  }

  private generateMetricId(metricName: string): string {
    return `${metricName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getNavigationType(): string {
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as any;
      return navigationEntry?.type || 'unknown';
    }
    return 'unknown';
  }

  private checkThreshold(metric: WebVitalMetric): void {
    if (metric.rating === 'poor') {
      const alert: WebVitalAlert = {
        metric: metric.name,
        value: metric.value,
        threshold: WEB_VITAL_THRESHOLDS[metric.name].poor,
        severity: 'critical',
        timestamp: Date.now(),
        context: {
          rating: metric.rating,
          navigationType: metric.navigationType,
          url: window.location.href,
        },
      };

      this.handleAlert(alert);
    } else if (metric.rating === 'needs-improvement') {
      const alert: WebVitalAlert = {
        metric: metric.name,
        value: metric.value,
        threshold: WEB_VITAL_THRESHOLDS[metric.name].good,
        severity: 'warning',
        timestamp: Date.now(),
        context: {
          rating: metric.rating,
          navigationType: metric.navigationType,
          url: window.location.href,
        },
      };

      this.handleAlert(alert);
    }
  }

  private handleAlert(alert: WebVitalAlert): void {
    console.warn(`Web Vital Alert: ${alert.metric}`, alert);

    // Call callback if provided
    if (this.alertCallback) {
      this.alertCallback(alert);
    }

    // Add to global error store
    const addGlobalError = useAppStore.getState().addGlobalError;
    addGlobalError({
      message: `Web Vital ${alert.metric} performance issue: ${alert.value.toFixed(2)} (threshold: ${alert.threshold})`,
      code: `WEB_VITAL_${alert.metric}_${alert.severity.toUpperCase()}`,
      severity: alert.severity === 'critical' ? 'high' : 'medium',
      context: alert.context,
    });
  }

  private async reportMetric(metric: WebVitalMetric): Promise<void> {
    try {
      await fetch(this.reportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      });
    } catch (error) {
      console.error('Failed to report web vital metric:', error);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getMetrics(): Map<string, WebVitalMetric> {
    return new Map(this.metrics);
  }

  getMetric(name: string): WebVitalMetric | undefined {
    return this.metrics.get(name);
  }

  generateReport(): WebVitalReport {
    const metricsObj: Record<string, WebVitalMetric> = {};
    let totalScore = 0;
    let metricCount = 0;

    for (const [name, metric] of this.metrics) {
      metricsObj[name] = metric;
      
      // Calculate score (100 for good, 50 for needs-improvement, 0 for poor)
      let score = 0;
      if (metric.rating === 'good') score = 100;
      else if (metric.rating === 'needs-improvement') score = 50;
      
      totalScore += score;
      metricCount++;
    }

    const overallScore = metricCount > 0 ? totalScore / metricCount : 0;
    const recommendations = this.generateRecommendations();

    return {
      metrics: metricsObj,
      overallScore,
      recommendations,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    for (const [name, metric] of this.metrics) {
      if (metric.rating !== 'good') {
        switch (name) {
          case 'FCP':
            recommendations.push('Optimize critical rendering path and reduce render-blocking resources');
            break;
          case 'LCP':
            recommendations.push('Optimize images, preload critical resources, and improve server response times');
            break;
          case 'FID':
            recommendations.push('Reduce JavaScript execution time and optimize event handlers');
            break;
          case 'CLS':
            recommendations.push('Reserve space for images and ads, avoid inserting content above existing content');
            break;
          case 'TTFB':
            recommendations.push('Optimize server response time, use CDN, and implement proper caching');
            break;
          case 'INP':
            recommendations.push('Optimize interaction handlers and reduce main thread blocking time');
            break;
        }
      }
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
    this.isInitialized = false;
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useWebVitals(): {
  metrics: Map<string, WebVitalMetric>;
  report: WebVitalReport | null;
  isLoading: boolean;
} {
  const [metrics, setMetrics] = React.useState<Map<string, WebVitalMetric>>(new Map());
  const [report, setReport] = React.useState<WebVitalReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const tracker = WebVitalsTracker.getInstance({
      onMetricCallback: (metric: any) => {
        setMetrics(prevMetrics => new Map(prevMetrics.set(metric.name, metric)));
      },
    });

    tracker.initialize().then(() => {
      setIsLoading(false);
    });

    // Generate report after a delay to collect metrics
    const reportTimer = setTimeout(() => {
      setReport(tracker.generateReport());
    }, 5000);

    return () => {
      clearTimeout(reportTimer);
    };
  }, []);

  return { metrics, report, isLoading };
}

export function useWebVitalAlerts(): WebVitalAlert[] {
  const [alerts, setAlerts] = React.useState<WebVitalAlert[]>([]);

  React.useEffect(() => {
    WebVitalsTracker.getInstance({
      alertCallback: (alert: any) => {
        setAlerts(prevAlerts => [...prevAlerts, alert]);
      },
    });
  }, []);

  return alerts;
}

export default WebVitalsTracker;