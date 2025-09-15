/**
 * @fileoverview HT-021.3.4: Performance Dashboard Setup
 * @module lib/monitoring/performance-dashboard
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.4 - Performance Monitoring & Analytics Setup
 * Focus: Performance dashboard for real-time monitoring and visualization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (data visualization)
 */

import React, { useState, useEffect } from 'react';
import { PerformanceMonitor, PerformanceMetric, WebVitalsMetrics } from './performance-monitor';
import { WebVitalsTracker, WebVitalReport, WebVitalAlert } from './web-vitals-tracker';
import { AnalyticsTracker } from '../analytics/analytics-tracker';
import { useAppStore } from '../state/zustand-store';

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardMetrics {
  webVitals: WebVitalsMetrics;
  performanceScore: number;
  errorRate: number;
  userSessions: number;
  avgLoadTime: number;
  throughput: number;
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  resolved: boolean;
}

export interface TimeSeriesData {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'gauge' | 'donut';
  title: string;
  yAxis?: string;
  color?: string;
  threshold?: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'alert' | 'status';
  size: 'small' | 'medium' | 'large' | 'extra-large';
  config: any;
  refreshInterval?: number;
  data?: any;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  columns: number;
  refreshInterval: number;
  autoRefresh: boolean;
}

// ============================================================================
// PERFORMANCE DASHBOARD CLASS
// ============================================================================

export class PerformanceDashboard {
  private static instance: PerformanceDashboard;
  private performanceMonitor: PerformanceMonitor;
  private webVitalsTracker: WebVitalsTracker;
  private analyticsTracker: AnalyticsTracker;
  private alerts: PerformanceAlert[] = [];
  private metricsHistory: Map<string, TimeSeriesData[]> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;
  private subscriptions: Set<(metrics: DashboardMetrics) => void> = new Set();

  constructor() {
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.webVitalsTracker = WebVitalsTracker.getInstance();
    this.analyticsTracker = AnalyticsTracker.getInstance();
  }

  static getInstance(): PerformanceDashboard {
    if (!PerformanceDashboard.instance) {
      PerformanceDashboard.instance = new PerformanceDashboard();
    }
    return PerformanceDashboard.instance;
  }

  initialize(config: { refreshInterval?: number } = {}): void {
    const refreshInterval = config.refreshInterval || 5000; // 5 seconds

    // Start periodic metrics collection
    this.refreshInterval = setInterval(() => {
      this.collectAndBroadcastMetrics();
    }, refreshInterval);

    // Setup alert monitoring
    this.setupAlertMonitoring();

    console.log('Performance Dashboard initialized');
  }

  // ============================================================================
  // METRICS COLLECTION
  // ============================================================================

  async collectMetrics(): Promise<DashboardMetrics> {
    const webVitals = this.performanceMonitor.getWebVitals();
    const performanceScore = this.performanceMonitor.getPerformanceScore();
    const webVitalReport = this.webVitalsTracker.generateReport();
    const errorStore = useAppStore.getState().errors;
    const sessionMetrics = this.analyticsTracker.getSessionMetrics();

    // Calculate error rate
    const totalErrors = errorStore.global.length + 
      Object.values(errorStore.form).reduce((sum, errors) => sum + errors.length, 0) +
      Object.keys(errorStore.api).length;
    
    const errorRate = totalErrors > 0 ? (totalErrors / sessionMetrics.pageViews) * 100 : 0;

    // Get current performance metrics
    const currentMetrics = this.performanceMonitor.getCurrentMetrics();
    const avgLoadTime = this.calculateAverageLoadTime(currentMetrics);
    const throughput = this.calculateThroughput(currentMetrics);

    const dashboardMetrics: DashboardMetrics = {
      webVitals,
      performanceScore,
      errorRate,
      userSessions: 1, // Simplified - would track multiple sessions
      avgLoadTime,
      throughput,
      alerts: this.getActiveAlerts(),
    };

    // Store historical data
    this.storeHistoricalData(dashboardMetrics);

    return dashboardMetrics;
  }

  private calculateAverageLoadTime(metrics: PerformanceMetric[]): number {
    const navigationMetrics = metrics.filter(m => m.category === 'navigation');
    if (navigationMetrics.length === 0) return 0;
    
    const totalTime = navigationMetrics.reduce((sum, metric) => sum + metric.value, 0);
    return totalTime / navigationMetrics.length;
  }

  private calculateThroughput(metrics: PerformanceMetric[]): number {
    // Calculate requests per minute
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentMetrics = metrics.filter(m => m.timestamp > oneMinuteAgo);
    
    return recentMetrics.length;
  }

  private storeHistoricalData(metrics: DashboardMetrics): void {
    const timestamp = Date.now();
    
    // Store web vitals history
    ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'].forEach(vital => {
      const value = metrics.webVitals[vital as keyof WebVitalsMetrics];
      if (value !== null && value !== undefined) {
        this.addToHistory(`webvital_${vital}`, timestamp, value);
      }
    });

    // Store other metrics
    this.addToHistory('performance_score', timestamp, metrics.performanceScore);
    this.addToHistory('error_rate', timestamp, metrics.errorRate);
    this.addToHistory('avg_load_time', timestamp, metrics.avgLoadTime);
    this.addToHistory('throughput', timestamp, metrics.throughput);
  }

  private addToHistory(metricName: string, timestamp: number, value: number): void {
    if (!this.metricsHistory.has(metricName)) {
      this.metricsHistory.set(metricName, []);
    }
    
    const history = this.metricsHistory.get(metricName)!;
    history.push({ timestamp, value });
    
    // Keep only last 100 data points
    if (history.length > 100) {
      history.shift();
    }
  }

  // ============================================================================
  // ALERT MANAGEMENT
  // ============================================================================

  private setupAlertMonitoring(): void {
    // Monitor Web Vitals alerts
    this.webVitalsTracker.initialize().then(() => {
      // Setup callback for web vital alerts
      const originalTracker = this.webVitalsTracker as any;
      if (originalTracker.alertCallback) {
        const originalCallback = originalTracker.alertCallback;
        originalTracker.alertCallback = (alert: WebVitalAlert) => {
          this.addAlert({
            id: `webvital_${alert.metric}_${alert.timestamp}`,
            type: alert.severity,
            metric: alert.metric,
            value: alert.value,
            threshold: alert.threshold,
            message: `${alert.metric} exceeded threshold: ${alert.value.toFixed(2)} (threshold: ${alert.threshold})`,
            timestamp: alert.timestamp,
            resolved: false,
          });
          
          if (originalCallback) {
            originalCallback(alert);
          }
        };
      }
    });
  }

  private addAlert(alert: PerformanceAlert): void {
    // Check if alert already exists
    const existingAlert = this.alerts.find(a => 
      a.metric === alert.metric && !a.resolved
    );
    
    if (!existingAlert) {
      this.alerts.push(alert);
      
      // Auto-resolve alerts after 5 minutes if metric improves
      setTimeout(() => {
        this.checkAlertResolution(alert.id);
      }, 5 * 60 * 1000);
    }
  }

  private checkAlertResolution(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.resolved) return;

    // Get current value for the metric
    this.collectMetrics().then(metrics => {
      let currentValue: number | null = null;
      
      switch (alert.metric) {
        case 'LCP':
          currentValue = metrics.webVitals.LCP;
          break;
        case 'FID':
          currentValue = metrics.webVitals.FID;
          break;
        case 'CLS':
          currentValue = metrics.webVitals.CLS;
          break;
        case 'FCP':
          currentValue = metrics.webVitals.FCP;
          break;
        case 'TTFB':
          currentValue = metrics.webVitals.TTFB;
          break;
        case 'error_rate':
          currentValue = metrics.errorRate;
          break;
      }
      
      // If current value is better than threshold, resolve the alert
      if (currentValue !== null && currentValue <= alert.threshold) {
        alert.resolved = true;
        console.log(`Alert resolved: ${alert.metric}`);
      }
    });
  }

  private getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  // ============================================================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================================================

  subscribe(callback: (metrics: DashboardMetrics) => void): () => void {
    this.subscriptions.add(callback);
    
    // Immediately send current metrics
    this.collectMetrics().then(callback);
    
    return () => {
      this.subscriptions.delete(callback);
    };
  }

  private collectAndBroadcastMetrics(): void {
    this.collectMetrics().then(metrics => {
      this.subscriptions.forEach(callback => {
        try {
          callback(metrics);
        } catch (error) {
          console.error('Error in dashboard subscription callback:', error);
        }
      });
    }).catch(error => {
      console.error('Error collecting dashboard metrics:', error);
    });
  }

  // ============================================================================
  // DATA ACCESS
  // ============================================================================

  getHistoricalData(metricName: string, timeRange: '1h' | '24h' | '7d' = '1h'): TimeSeriesData[] {
    const history = this.metricsHistory.get(metricName) || [];
    const now = Date.now();
    
    const timeRanges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
    };
    
    const cutoff = now - timeRanges[timeRange];
    return history.filter(data => data.timestamp > cutoff);
  }

  getAllHistoricalData(): Map<string, TimeSeriesData[]> {
    return new Map(this.metricsHistory);
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  // ============================================================================
  // DASHBOARD LAYOUTS
  // ============================================================================

  getDefaultLayout(): DashboardLayout {
    return {
      columns: 4,
      refreshInterval: 5000,
      autoRefresh: true,
      widgets: [
        {
          id: 'performance-score',
          title: 'Performance Score',
          type: 'metric',
          size: 'small',
          config: {
            format: 'percentage',
            threshold: 80,
            color: 'green',
          },
        },
        {
          id: 'web-vitals-lcp',
          title: 'Largest Contentful Paint',
          type: 'metric',
          size: 'small',
          config: {
            format: 'milliseconds',
            threshold: 2500,
            color: 'blue',
          },
        },
        {
          id: 'web-vitals-fid',
          title: 'First Input Delay',
          type: 'metric',
          size: 'small',
          config: {
            format: 'milliseconds',
            threshold: 100,
            color: 'orange',
          },
        },
        {
          id: 'web-vitals-cls',
          title: 'Cumulative Layout Shift',
          type: 'metric',
          size: 'small',
          config: {
            format: 'decimal',
            threshold: 0.1,
            color: 'purple',
          },
        },
        {
          id: 'error-rate',
          title: 'Error Rate',
          type: 'metric',
          size: 'small',
          config: {
            format: 'percentage',
            threshold: 5,
            color: 'red',
          },
        },
        {
          id: 'avg-load-time',
          title: 'Average Load Time',
          type: 'metric',
          size: 'small',
          config: {
            format: 'milliseconds',
            threshold: 3000,
            color: 'cyan',
          },
        },
        {
          id: 'throughput',
          title: 'Throughput',
          type: 'metric',
          size: 'small',
          config: {
            format: 'number',
            unit: 'req/min',
            color: 'green',
          },
        },
        {
          id: 'user-sessions',
          title: 'Active Sessions',
          type: 'metric',
          size: 'small',
          config: {
            format: 'number',
            color: 'indigo',
          },
        },
        {
          id: 'performance-trends',
          title: 'Performance Trends',
          type: 'chart',
          size: 'large',
          config: {
            type: 'line',
            metrics: ['performance_score', 'avg_load_time'],
            timeRange: '1h',
          },
        },
        {
          id: 'web-vitals-chart',
          title: 'Web Vitals Over Time',
          type: 'chart',
          size: 'large',
          config: {
            type: 'line',
            metrics: ['webvital_LCP', 'webvital_FID', 'webvital_CLS'],
            timeRange: '1h',
          },
        },
        {
          id: 'alerts-list',
          title: 'Active Alerts',
          type: 'alert',
          size: 'medium',
          config: {
            maxItems: 10,
            showResolved: false,
          },
        },
        {
          id: 'system-status',
          title: 'System Status',
          type: 'status',
          size: 'medium',
          config: {
            showOverall: true,
            showComponents: true,
          },
        },
      ],
    };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  exportData(format: 'json' | 'csv' = 'json', timeRange: '1h' | '24h' | '7d' = '24h'): string {
    const data = {
      metrics: {},
      alerts: this.alerts,
      timestamp: Date.now(),
    };

    // Export historical data for all metrics
    for (const [metricName, history] of this.metricsHistory) {
      (data.metrics as any)[metricName] = this.getHistoricalData(metricName, timeRange);
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV (simplified)
      let csv = 'timestamp,metric,value\n';
      for (const [metricName, history] of this.metricsHistory) {
        const timeFilteredHistory = this.getHistoricalData(metricName, timeRange);
        for (const point of timeFilteredHistory) {
          csv += `${point.timestamp},${metricName},${point.value}\n`;
        }
      }
      return csv;
    }
  }

  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    
    this.subscriptions.clear();
    this.alerts = [];
    this.metricsHistory.clear();
  }
}

// ============================================================================
// REACT HOOKS
// ============================================================================

export function useDashboardMetrics(refreshInterval: number = 5000): {
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
} {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dashboard = PerformanceDashboard.getInstance();
    
    dashboard.initialize({ refreshInterval });

    const unsubscribe = dashboard.subscribe((newMetrics) => {
      setMetrics(newMetrics);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [refreshInterval]);

  return { metrics, loading, error };
}

export function usePerformanceAlerts(): {
  alerts: PerformanceAlert[];
  resolveAlert: (alertId: string) => void;
} {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  
  useEffect(() => {
    const dashboard = PerformanceDashboard.getInstance();
    
    const updateAlerts = () => {
      setAlerts(dashboard.getAlerts());
    };

    // Update immediately
    updateAlerts();

    // Update every 5 seconds
    const interval = setInterval(updateAlerts, 5000);

    return () => clearInterval(interval);
  }, []);

  const resolveAlert = (alertId: string) => {
    const dashboard = PerformanceDashboard.getInstance();
    dashboard.resolveAlert(alertId);
    setAlerts(dashboard.getAlerts());
  };

  return { alerts, resolveAlert };
}

export function useHistoricalData(
  metricName: string, 
  timeRange: '1h' | '24h' | '7d' = '1h'
): TimeSeriesData[] {
  const [data, setData] = useState<TimeSeriesData[]>([]);

  useEffect(() => {
    const dashboard = PerformanceDashboard.getInstance();
    
    const updateData = () => {
      const historicalData = dashboard.getHistoricalData(metricName, timeRange);
      setData(historicalData);
    };

    // Update immediately
    updateData();

    // Update every 10 seconds
    const interval = setInterval(updateData, 10000);

    return () => clearInterval(interval);
  }, [metricName, timeRange]);

  return data;
}

export function useDashboardLayout(): {
  layout: DashboardLayout;
  updateLayout: (layout: DashboardLayout) => void;
} {
  const [layout, setLayout] = useState<DashboardLayout>(() => {
    const dashboard = PerformanceDashboard.getInstance();
    return dashboard.getDefaultLayout();
  });

  const updateLayout = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    // Could persist to localStorage or API here
  };

  return { layout, updateLayout };
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

export const performanceDashboard = PerformanceDashboard.getInstance();

export default PerformanceDashboard;