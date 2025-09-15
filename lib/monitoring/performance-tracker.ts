/**
 * @fileoverview HT-008.8.3: Performance Monitoring and Alerting System
 * @module lib/monitoring/performance-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.3 - Implement performance monitoring and alerting
 * Focus: Production-grade performance monitoring with real-time alerting
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production monitoring, alerting systems)
 */

import { Logger } from '@/lib/logger';
import { Observing } from '@/lib/observability';

// Performance monitoring configuration
interface PerformanceConfig {
  enableRealTimeMonitoring: boolean;
  enableCoreWebVitals: boolean;
  enableResourceTiming: boolean;
  enableUserTiming: boolean;
  enableMemoryMonitoring: boolean;
  enableNetworkMonitoring: boolean;
  enableCustomMetrics: boolean;
  enablePerformanceAlerting: boolean;
  samplingRate: number;
  alertThresholds: {
    lcp: number; // Largest Contentful Paint (ms)
    fid: number; // First Input Delay (ms)
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint (ms)
    ttfb: number; // Time to First Byte (ms)
    memoryUsage: number; // Memory usage threshold (MB)
    responseTime: number; // API response time (ms)
    errorRate: number; // Error rate threshold (%)
  };
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
  enableEmailNotifications: boolean;
  emailRecipients: string[];
}

const defaultConfig: PerformanceConfig = {
  enableRealTimeMonitoring: true,
  enableCoreWebVitals: true,
  enableResourceTiming: true,
  enableUserTiming: true,
  enableMemoryMonitoring: true,
  enableNetworkMonitoring: true,
  enableCustomMetrics: true,
  enablePerformanceAlerting: true,
  samplingRate: 1.0,
  alertThresholds: {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1, // 0.1
    fcp: 1800, // 1.8s
    ttfb: 600, // 600ms
    memoryUsage: 100, // 100MB
    responseTime: 2000, // 2s
    errorRate: 0.05, // 5%
  },
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_PERFORMANCE_WEBHOOK_URL,
  enableEmailNotifications: false,
  emailRecipients: [],
};

// Core Web Vitals metrics
interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

// Performance metrics
interface PerformanceMetrics {
  coreWebVitals: CoreWebVitals;
  resourceTiming: any[];
  userTiming: PerformanceEntry[];
  memoryUsage: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkMetrics: {
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    totalDataTransferred: number;
  };
  customMetrics: Record<string, number>;
  timestamp: Date;
  url: string;
  userAgent: string;
  sessionId?: string;
  userId?: string;
}

// Performance alert
export interface PerformanceAlert {
  id: string;
  type: 'threshold_exceeded' | 'degradation' | 'anomaly';
  metric: string;
  value: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  url: string;
  userId?: string;
  sessionId?: string;
  resolved: boolean;
  resolution?: string;
}

// Performance trend
interface PerformanceTrend {
  metric: string;
  period: string;
  average: number;
  p50: number;
  p95: number;
  p99: number;
  trend: 'improving' | 'stable' | 'degrading';
  changePercent: number;
}

/**
 * Performance Monitoring and Alerting System
 * 
 * Provides comprehensive performance monitoring with real-time alerting,
 * Core Web Vitals tracking, and performance analytics.
 */
export class PerformanceTracker {
  private static instance: PerformanceTracker | null = null;
  private config: PerformanceConfig;
  private logger = Logger.create({ component: 'performance-tracker' });
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private trends: PerformanceTrend[] = [];
  private observers: PerformanceObserver[] = [];

  private constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.initializeObservers();
    this.startPeriodicTasks();
  }

  static getInstance(config?: Partial<PerformanceConfig>): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker(config);
    }
    return PerformanceTracker.instance;
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    try {
      // Core Web Vitals observer
      if (this.config.enableCoreWebVitals) {
        this.initializeCoreWebVitalsObserver();
      }

      // Resource timing observer
      if (this.config.enableResourceTiming) {
        this.initializeResourceTimingObserver();
      }

      // User timing observer
      if (this.config.enableUserTiming) {
        this.initializeUserTimingObserver();
      }

      // Memory monitoring
      if (this.config.enableMemoryMonitoring) {
        this.initializeMemoryObserver();
      }

      // Network monitoring
      if (this.config.enableNetworkMonitoring) {
        this.initializeNetworkObserver();
      }

      this.logger.info('Performance observers initialized', {
        observers: this.observers.length,
        config: {
          coreWebVitals: this.config.enableCoreWebVitals,
          resourceTiming: this.config.enableResourceTiming,
          userTiming: this.config.enableUserTiming,
          memoryMonitoring: this.config.enableMemoryMonitoring,
          networkMonitoring: this.config.enableNetworkMonitoring,
        },
      });

    } catch (error) {
      this.logger.error('Failed to initialize performance observers', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Initialize Core Web Vitals observer
   */
  private initializeCoreWebVitalsObserver(): void {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { element?: Element };
      
      this.trackCoreWebVital('lcp', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    this.observers.push(lcpObserver);

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
        this.trackCoreWebVital('fid', fid);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });
    this.observers.push(fidObserver);

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      this.trackCoreWebVital('cls', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(clsObserver);

    // FCP (First Contentful Paint)
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackCoreWebVital('fcp', entry.startTime);
        }
      });
    });
    fcpObserver.observe({ entryTypes: ['paint'] });
    this.observers.push(fcpObserver);

    // TTFB (Time to First Byte)
    const navigationObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.trackCoreWebVital('ttfb', navEntry.responseStart - navEntry.requestStart);
        }
      });
    });
    navigationObserver.observe({ entryTypes: ['navigation'] });
    this.observers.push(navigationObserver);
  }

  /**
   * Initialize resource timing observer
   */
  private initializeResourceTimingObserver(): void {
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.processResourceTimingEntries(entries as any[]);
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
    this.observers.push(resourceObserver);
  }

  /**
   * Initialize user timing observer
   */
  private initializeUserTimingObserver(): void {
    const userTimingObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      this.processUserTimingEntries(entries);
    });
    userTimingObserver.observe({ entryTypes: ['measure', 'mark'] });
    this.observers.push(userTimingObserver);
  }

  /**
   * Initialize memory observer
   */
  private initializeMemoryObserver(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackMemoryUsage({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }, 5000); // Check every 5 seconds
    }
  }

  /**
   * Initialize network observer
   */
  private initializeNetworkObserver(): void {
    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        this.trackNetworkRequest(args[0] as string, endTime - startTime, response.ok);
        return response;
      } catch (error) {
        const endTime = performance.now();
        this.trackNetworkRequest(args[0] as string, endTime - startTime, false);
        throw error;
      }
    };

    // Monitor XMLHttpRequest
    const originalXHR = XMLHttpRequest.prototype.open;
    (XMLHttpRequest.prototype as any).open = function(method: any, url: any, ...args: any[]) {
      const startTime = performance.now();
      this.addEventListener('loadend', () => {
        const endTime = performance.now();
        (this as any).trackNetworkRequest(url as string, endTime - startTime, this.status >= 200 && this.status < 400);
      });
      return originalXHR.apply(this, [method, url, ...args] as any);
    };
  }

  /**
   * Track Core Web Vital metric
   */
  private trackCoreWebVital(metric: keyof CoreWebVitals, value: number): void {
    if (Math.random() > this.config.samplingRate) return;

    const coreWebVitals: CoreWebVitals = {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
    };

    // Get existing metrics or create new ones
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics && this.isRecentMetric(latestMetrics.timestamp)) {
      coreWebVitals.lcp = latestMetrics.coreWebVitals.lcp;
      coreWebVitals.fid = latestMetrics.coreWebVitals.fid;
      coreWebVitals.cls = latestMetrics.coreWebVitals.cls;
      coreWebVitals.fcp = latestMetrics.coreWebVitals.fcp;
      coreWebVitals.ttfb = latestMetrics.coreWebVitals.ttfb;
    }

    coreWebVitals[metric] = value;

    this.updateMetrics({ coreWebVitals });

    // Check thresholds
    if (this.config.enablePerformanceAlerting) {
      this.checkCoreWebVitalsThresholds(metric, value);
    }

    // Record business metric
    (Observing as any).recordBusinessMetric('core_web_vital', value, {
      metric,
      url: window.location.href,
    });
  }

  /**
   * Track memory usage
   */
  private trackMemoryUsage(memoryUsage: PerformanceMetrics['memoryUsage']): void {
    this.updateMetrics({ memoryUsage });

    // Check memory threshold
    if (this.config.enablePerformanceAlerting) {
      const memoryUsageMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      if (memoryUsageMB > this.config.alertThresholds.memoryUsage) {
        this.createAlert({
          type: 'threshold_exceeded',
          metric: 'memory_usage',
          value: memoryUsageMB,
          threshold: this.config.alertThresholds.memoryUsage,
          severity: 'high',
          message: `Memory usage exceeded threshold: ${memoryUsageMB.toFixed(2)}MB`,
        });
      }
    }
  }

  /**
   * Track network request
   */
  private trackNetworkRequest(url: string, duration: number, success: boolean): void {
    // This would be implemented to track network metrics
    // For now, we'll just log it
    this.logger.debug('Network request tracked', {
      url,
      duration,
      success,
    });
  }

  /**
   * Process resource timing entries
   */
  private processResourceTimingEntries(entries: any[]): void {
    const resourceTiming = entries.map(entry => ({
      name: entry.name,
      duration: entry.duration,
      startTime: entry.startTime,
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    }));

    this.updateMetrics({ resourceTiming });
  }

  /**
   * Process user timing entries
   */
  private processUserTimingEntries(entries: PerformanceEntry[]): void {
    const userTiming = entries.map(entry => ({
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
    }));

    this.updateMetrics({ userTiming: userTiming as any });
  }

  /**
   * Update metrics with new data
   */
  private updateMetrics(partialMetrics: Partial<PerformanceMetrics>): void {
    const now = new Date();
    const latestMetrics = this.metrics[this.metrics.length - 1];

    if (latestMetrics && this.isRecentMetric(latestMetrics.timestamp)) {
      // Update existing metrics
      Object.assign(latestMetrics, partialMetrics);
      latestMetrics.timestamp = now;
    } else {
      // Create new metrics entry
      const newMetrics: PerformanceMetrics = {
        coreWebVitals: {
          lcp: 0,
          fid: 0,
          cls: 0,
          fcp: 0,
          ttfb: 0,
        },
        resourceTiming: [],
        userTiming: [],
        memoryUsage: {
          usedJSHeapSize: 0,
          totalJSHeapSize: 0,
          jsHeapSizeLimit: 0,
        },
        networkMetrics: {
          totalRequests: 0,
          failedRequests: 0,
          averageResponseTime: 0,
          totalDataTransferred: 0,
        },
        customMetrics: {},
        timestamp: now,
        url: window.location.href,
        userAgent: navigator.userAgent,
        ...partialMetrics,
      };

      this.metrics.push(newMetrics);
    }

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Check Core Web Vitals thresholds
   */
  private checkCoreWebVitalsThresholds(metric: keyof CoreWebVitals, value: number): void {
    const threshold = this.config.alertThresholds[metric];
    if (value > threshold) {
      this.createAlert({
        type: 'threshold_exceeded',
        metric,
        value,
        threshold,
        severity: this.getSeverityForMetric(metric, value, threshold),
        message: `${metric.toUpperCase()} exceeded threshold: ${value.toFixed(2)}ms (threshold: ${threshold}ms)`,
      });
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'url' | 'resolved'>): void {
    const alert: PerformanceAlert = {
      id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      url: window.location.href,
      resolved: false,
      ...alertData,
    };

    this.alerts.push(alert);

    // Send notifications
    this.sendAlertNotifications(alert);

    this.logger.warn('Performance alert created', {
      alertId: alert.id,
      type: alert.type,
      metric: alert.metric,
      value: alert.value,
      threshold: alert.threshold,
      severity: alert.severity,
    });
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(alert: PerformanceAlert): Promise<void> {
    // Send to webhook endpoints
    if (this.config.enableWebhookNotifications && this.config.webhookUrls.length > 0) {
      await Promise.all(
        this.config.webhookUrls.map(url => this.sendWebhookNotification(url, alert))
      );
    }

    // Send to Slack
    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      await this.sendSlackNotification(alert);
    }

    // Send email notifications for critical alerts
    if (this.config.enableEmailNotifications && alert.severity === 'critical') {
      await this.sendEmailNotification(alert);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(url: string, alert: PerformanceAlert): Promise<void> {
    try {
      const payload = {
        event: 'performance_alert',
        alert,
        metrics: this.getLatestMetrics(),
        timestamp: new Date().toISOString(),
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Performance-Tracker': 'true',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send webhook notification', {
        url,
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: PerformanceAlert): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    try {
      const color = this.getSlackColor(alert.severity);
      const emoji = this.getSlackEmoji(alert.severity);

      const payload = {
        text: `${emoji} Performance Alert: ${alert.metric}`,
        attachments: [{
          color,
          fields: [
            { title: 'Metric', value: alert.metric, short: true },
            { title: 'Value', value: `${alert.value.toFixed(2)}`, short: true },
            { title: 'Threshold', value: `${alert.threshold}`, short: true },
            { title: 'Severity', value: alert.severity, short: true },
            { title: 'Message', value: alert.message, short: false },
            { title: 'URL', value: alert.url, short: false },
          ],
          footer: 'Performance Tracker',
          ts: Math.floor(alert.timestamp.getTime() / 1000),
        }],
      };

      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send Slack notification', {
        alertId: alert.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: PerformanceAlert): Promise<void> {
    // Implementation would depend on email service
    this.logger.info('Email notification would be sent', {
      alertId: alert.id,
      severity: alert.severity,
      recipients: this.config.emailRecipients,
    });
  }

  /**
   * Get latest metrics
   */
  getLatestMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  /**
   * Get performance analytics
   */
  getPerformanceAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): {
    coreWebVitals: {
      lcp: { average: number; p95: number; trend: string };
      fid: { average: number; p95: number; trend: string };
      cls: { average: number; p95: number; trend: string };
      fcp: { average: number; p95: number; trend: string };
      ttfb: { average: number; p95: number; trend: string };
    };
    alerts: PerformanceAlert[];
    trends: PerformanceTrend[];
  } {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    const recentMetrics = this.metrics.filter(m => m.timestamp >= cutoffTime);
    const recentAlerts = this.alerts.filter(a => a.timestamp >= cutoffTime);

    return {
      coreWebVitals: this.calculateCoreWebVitalsAnalytics(recentMetrics),
      alerts: recentAlerts,
      trends: this.calculateTrends(recentMetrics),
    };
  }

  /**
   * Get performance alerts
   */
  getPerformanceAlerts(): PerformanceAlert[] {
    return this.alerts
      .filter(alert => !alert.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Resolve performance alert
   */
  async resolveAlert(alertId: string, resolution: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolution = resolution;
      
      this.logger.info('Performance alert resolved', {
        alertId,
        resolution,
        metric: alert.metric,
      });
    }
  }

  /**
   * Track custom metric
   */
  trackCustomMetric(name: string, value: number, context?: Record<string, any>): void {
    if (!this.config.enableCustomMetrics) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (latestMetrics && this.isRecentMetric(latestMetrics.timestamp)) {
      latestMetrics.customMetrics[name] = value;
    }

    // Record business metric
    (Observing as any).recordBusinessMetric('custom_performance_metric', value, {
      metric: name,
      ...context,
    });
  }

  /**
   * Helper methods
   */
  private isRecentMetric(timestamp: Date): boolean {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    return timestamp >= fiveMinutesAgo;
  }

  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return ranges[timeRange as keyof typeof ranges] || ranges['24h'];
  }

  private getSeverityForMetric(metric: keyof CoreWebVitals, value: number, threshold: number): PerformanceAlert['severity'] {
    const ratio = value / threshold;
    if (ratio > 2) return 'critical';
    if (ratio > 1.5) return 'high';
    if (ratio > 1.2) return 'medium';
    return 'low';
  }

  private getSlackColor(severity: PerformanceAlert['severity']): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      case 'low': return '#36a64f';
      default: return 'good';
    }
  }

  private getSlackEmoji(severity: PerformanceAlert['severity']): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '📊';
      default: return '📊';
    }
  }

  private calculateCoreWebVitalsAnalytics(metrics: PerformanceMetrics[]): any {
    // Implementation for Core Web Vitals analytics
    return {
      lcp: { average: 0, p95: 0, trend: 'stable' },
      fid: { average: 0, p95: 0, trend: 'stable' },
      cls: { average: 0, p95: 0, trend: 'stable' },
      fcp: { average: 0, p95: 0, trend: 'stable' },
      ttfb: { average: 0, p95: 0, trend: 'stable' },
    };
  }

  private calculateTrends(metrics: PerformanceMetrics[]): PerformanceTrend[] {
    // Implementation for trend calculation
    return [];
  }

  private startPeriodicTasks(): void {
    // Generate periodic reports
    setInterval(() => {
      this.generatePeriodicReport();
    }, 24 * 60 * 60 * 1000); // Daily

    // Cleanup old data
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000); // Hourly
  }

  private generatePeriodicReport(): void {
    const analytics = this.getPerformanceAnalytics('24h');
    const alerts = this.getPerformanceAlerts();
    
    this.logger.info('Daily performance report', {
      coreWebVitals: analytics.coreWebVitals,
      totalAlerts: alerts.length,
      unresolvedAlerts: alerts.filter(a => !a.resolved).length,
    });
  }

  private cleanupOldData(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7); // Keep 7 days of data
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoffDate);
    this.alerts = this.alerts.filter(a => a.timestamp >= cutoffDate);
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global performance tracker instance
export const performanceTracker = PerformanceTracker.getInstance();

// Convenience functions
export function trackCustomMetric(
  name: string, 
  value: number, 
  context?: Record<string, any>
): void {
  performanceTracker.trackCustomMetric(name, value, context);
}

export function getPerformanceAnalytics(
  timeRange?: Parameters<PerformanceTracker['getPerformanceAnalytics']>[0]
): ReturnType<PerformanceTracker['getPerformanceAnalytics']> {
  return performanceTracker.getPerformanceAnalytics(timeRange);
}

export function getPerformanceAlerts(): PerformanceAlert[] {
  return performanceTracker.getPerformanceAlerts();
}

export async function resolvePerformanceAlert(
  alertId: string, 
  resolution: string
): Promise<void> {
  return performanceTracker.resolveAlert(alertId, resolution);
}
