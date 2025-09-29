/**
 * @fileoverview Template Health Monitoring System - HT-032.2.3
 * @module lib/ai/template-health-monitor
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template health monitoring system that tracks performance, usage, and
 * reliability metrics for comprehensive template health analysis.
 */

import { z } from 'zod';
import { 
  TemplateRegistration, 
  TemplateInstance 
} from '@/types/admin/template-registry';
import { 
  TemplateHealthMetrics 
} from './template-manager';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface HealthMetric {
  id: string;
  name: string;
  description: string;
  category: 'performance' | 'usage' | 'reliability' | 'security' | 'accessibility';
  type: 'counter' | 'gauge' | 'histogram' | 'timer';
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
}

export interface HealthAlert {
  id: string;
  templateId: string;
  metricId: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  threshold: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
  currentValue: number;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface HealthTrend {
  templateId: string;
  metricId: string;
  period: 'hour' | 'day' | 'week' | 'month';
  dataPoints: Array<{
    timestamp: Date;
    value: number;
    tags?: Record<string, string>;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  changeRate: number; // percentage change
  confidence: number; // 0-1
}

export interface HealthReport {
  templateId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    overallHealth: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    totalMetrics: number;
    healthyMetrics: number;
    warningMetrics: number;
    criticalMetrics: number;
  };
  categories: {
    performance: HealthCategoryReport;
    usage: HealthCategoryReport;
    reliability: HealthCategoryReport;
    security: HealthCategoryReport;
    accessibility: HealthCategoryReport;
  };
  trends: HealthTrend[];
  alerts: HealthAlert[];
  recommendations: HealthRecommendation[];
}

export interface HealthCategoryReport {
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  metrics: HealthMetric[];
  issues: string[];
  improvements: string[];
}

export interface HealthRecommendation {
  id: string;
  type: 'optimization' | 'maintenance' | 'security' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
  metrics: string[];
  autoFixable: boolean;
}

export interface MonitoringConfig {
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // days
  alertThresholds: Record<string, {
    warning: number;
    critical: number;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  }>;
  enabledMetrics: string[];
  alertChannels: string[];
  reportGeneration: {
    enabled: boolean;
    frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
}

export interface MetricCollector {
  id: string;
  name: string;
  description: string;
  collect: (template: TemplateRegistration, instance: TemplateInstance) => Promise<HealthMetric[]>;
  validate: (metric: HealthMetric) => boolean;
}

// =============================================================================
// DEFAULT METRIC COLLECTORS
// =============================================================================

const DEFAULT_METRIC_COLLECTORS: MetricCollector[] = [
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    description: 'Collect performance-related metrics',
    collect: async (template, instance) => {
      // Mock performance metrics collection
      const metrics: HealthMetric[] = [
        {
          id: 'load-time',
          name: 'Load Time',
          description: 'Time to load template',
          category: 'performance',
          type: 'timer',
          value: Math.random() * 2000 + 500,
          unit: 'ms',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'render-time',
          name: 'Render Time',
          description: 'Time to render template',
          category: 'performance',
          type: 'timer',
          value: Math.random() * 1000 + 200,
          unit: 'ms',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          description: 'Memory consumption',
          category: 'performance',
          type: 'gauge',
          value: Math.random() * 100 + 10,
          unit: 'MB',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'bundle-size',
          name: 'Bundle Size',
          description: 'JavaScript bundle size',
          category: 'performance',
          type: 'gauge',
          value: Math.random() * 1000000 + 100000,
          unit: 'bytes',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        }
      ];
      return metrics;
    },
    validate: (metric) => metric.value >= 0 && metric.timestamp instanceof Date
  },
  {
    id: 'usage-metrics',
    name: 'Usage Metrics',
    description: 'Collect usage and traffic metrics',
    collect: async (template, instance) => {
      const metrics: HealthMetric[] = [
        {
          id: 'request-count',
          name: 'Request Count',
          description: 'Total requests in period',
          category: 'usage',
          type: 'counter',
          value: Math.floor(Math.random() * 10000) + 1000,
          unit: 'requests',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'unique-users',
          name: 'Unique Users',
          description: 'Unique users in period',
          category: 'usage',
          type: 'gauge',
          value: Math.floor(Math.random() * 1000) + 100,
          unit: 'users',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'error-rate',
          name: 'Error Rate',
          description: 'Percentage of requests resulting in errors',
          category: 'usage',
          type: 'gauge',
          value: Math.random() * 0.1,
          unit: 'ratio',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'success-rate',
          name: 'Success Rate',
          description: 'Percentage of successful requests',
          category: 'usage',
          type: 'gauge',
          value: 1 - Math.random() * 0.1,
          unit: 'ratio',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        }
      ];
      return metrics;
    },
    validate: (metric) => metric.value >= 0 && metric.timestamp instanceof Date
  },
  {
    id: 'reliability-metrics',
    name: 'Reliability Metrics',
    description: 'Collect reliability and stability metrics',
    collect: async (template, instance) => {
      const metrics: HealthMetric[] = [
        {
          id: 'uptime',
          name: 'Uptime',
          description: 'Template uptime percentage',
          category: 'reliability',
          type: 'gauge',
          value: Math.random() * 0.1 + 0.9,
          unit: 'ratio',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'crash-count',
          name: 'Crash Count',
          description: 'Number of crashes in period',
          category: 'reliability',
          type: 'counter',
          value: Math.floor(Math.random() * 10),
          unit: 'crashes',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        },
        {
          id: 'recovery-time',
          name: 'Recovery Time',
          description: 'Average recovery time from failures',
          category: 'reliability',
          type: 'timer',
          value: Math.random() * 300 + 30,
          unit: 'seconds',
          timestamp: new Date(),
          tags: { templateId: template.metadata.id }
        }
      ];
      return metrics;
    },
    validate: (metric) => metric.value >= 0 && metric.timestamp instanceof Date
  }
];

// =============================================================================
// TEMPLATE HEALTH MONITOR
// =============================================================================

export class TemplateHealthMonitor {
  private config: MonitoringConfig;
  private collectors: Map<string, MetricCollector> = new Map();
  private metrics: Map<string, HealthMetric[]> = new Map();
  private alerts: Map<string, HealthAlert[]> = new Map();
  private trends: Map<string, HealthTrend[]> = new Map();
  private collectionInterval?: NodeJS.Timeout;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      collectionInterval: 60000, // 1 minute
      retentionPeriod: 30, // 30 days
      alertThresholds: {
        'load-time': { warning: 1000, critical: 2000, operator: 'gt' },
        'render-time': { warning: 500, critical: 1000, operator: 'gt' },
        'memory-usage': { warning: 100, critical: 200, operator: 'gt' },
        'error-rate': { warning: 0.05, critical: 0.1, operator: 'gt' },
        'uptime': { warning: 0.95, critical: 0.9, operator: 'lt' }
      },
      enabledMetrics: ['performance-metrics', 'usage-metrics', 'reliability-metrics'],
      alertChannels: ['console', 'email'],
      reportGeneration: {
        enabled: true,
        frequency: 'daily',
        recipients: ['admin@example.com']
      },
      ...config
    };

    this.initializeCollectors();
    this.startMonitoring();
  }

  /**
   * Initialize metric collectors
   */
  private initializeCollectors(): void {
    DEFAULT_METRIC_COLLECTORS.forEach(collector => {
      if (this.config.enabledMetrics.includes(collector.id)) {
        this.collectors.set(collector.id, collector);
      }
    });
  }

  /**
   * Start monitoring
   */
  private startMonitoring(): void {
    this.collectionInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.collectionInterval);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      this.collectionInterval = undefined;
    }
  }

  /**
   * Collect metrics for all templates
   */
  async collectMetrics(): Promise<void> {
    try {
      // In real implementation, this would iterate through all templates
      // For now, we'll collect mock metrics
      const templateId = 'mock-template';
      
      for (const collector of this.collectors.values()) {
        try {
          const metrics = await collector.collect(
            { metadata: { id: templateId } } as TemplateRegistration,
            { id: templateId, templateId } as TemplateInstance
          );

          // Validate metrics
          const validMetrics = metrics.filter(metric => collector.validate(metric));
          
          // Store metrics
          if (!this.metrics.has(templateId)) {
            this.metrics.set(templateId, []);
          }
          this.metrics.get(templateId)!.push(...validMetrics);

          // Check for alerts
          await this.checkAlerts(templateId, validMetrics);

          // Update trends
          await this.updateTrends(templateId, validMetrics);

        } catch (error) {
          console.error(`Error collecting metrics with ${collector.id}:`, error);
        }
      }

      // Clean up old metrics
      await this.cleanupOldMetrics();

    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  /**
   * Check for alerts based on metrics
   */
  private async checkAlerts(templateId: string, metrics: HealthMetric[]): Promise<void> {
    for (const metric of metrics) {
      const threshold = this.config.alertThresholds[metric.id];
      if (!threshold) continue;

      const shouldAlert = this.evaluateThreshold(metric.value, threshold);
      if (!shouldAlert) continue;

      // Check if alert already exists
      const existingAlerts = this.alerts.get(templateId) || [];
      const existingAlert = existingAlerts.find(
        alert => alert.metricId === metric.id && !alert.resolvedAt
      );

      if (existingAlert) {
        // Update existing alert
        existingAlert.currentValue = metric.value;
      } else {
        // Create new alert
        const severity = this.determineSeverity(metric.value, threshold);
        const alert: HealthAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          templateId,
          metricId: metric.id,
          severity,
          message: this.generateAlertMessage(metric, threshold, severity),
          threshold,
          currentValue: metric.value,
          triggeredAt: new Date(),
          acknowledged: false
        };

        if (!this.alerts.has(templateId)) {
          this.alerts.set(templateId, []);
        }
        this.alerts.get(templateId)!.push(alert);

        // Send alert notification
        await this.sendAlertNotification(alert);
      }
    }
  }

  /**
   * Evaluate threshold condition
   */
  private evaluateThreshold(value: number, threshold: MonitoringConfig['alertThresholds'][string]): boolean {
    switch (threshold.operator) {
      case 'gt': return value > threshold.critical;
      case 'lt': return value < threshold.critical;
      case 'gte': return value >= threshold.critical;
      case 'lte': return value <= threshold.critical;
      case 'eq': return value === threshold.critical;
      default: return false;
    }
  }

  /**
   * Determine alert severity
   */
  private determineSeverity(value: number, threshold: MonitoringConfig['alertThresholds'][string]): HealthAlert['severity'] {
    const isWarning = threshold.operator === 'gt' ? value > threshold.warning && value <= threshold.critical
                   : threshold.operator === 'lt' ? value < threshold.warning && value >= threshold.critical
                   : false;

    const isCritical = threshold.operator === 'gt' ? value > threshold.critical
                     : threshold.operator === 'lt' ? value < threshold.critical
                     : false;

    if (isCritical) return 'critical';
    if (isWarning) return 'warning';
    return 'info';
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    metric: HealthMetric,
    threshold: MonitoringConfig['alertThresholds'][string],
    severity: HealthAlert['severity']
  ): string {
    return `${metric.name} is ${severity.toUpperCase()}: ${metric.value}${metric.unit} (threshold: ${threshold.critical}${metric.unit})`;
  }

  /**
   * Send alert notification
   */
  private async sendAlertNotification(alert: HealthAlert): Promise<void> {
    console.log(`ALERT [${alert.severity.toUpperCase()}]: ${alert.message}`);
    
    // In real implementation, this would send to configured channels
    for (const channel of this.config.alertChannels) {
      switch (channel) {
        case 'console':
          console.log(`Console Alert: ${alert.message}`);
          break;
        case 'email':
          console.log(`Email Alert: ${alert.message}`);
          break;
        // Add more channels as needed
      }
    }
  }

  /**
   * Update trends for metrics
   */
  private async updateTrends(templateId: string, metrics: HealthMetric[]): Promise<void> {
    if (!this.trends.has(templateId)) {
      this.trends.set(templateId, []);
    }

    for (const metric of metrics) {
      let trend = this.trends.get(templateId)!.find(t => t.metricId === metric.id);
      
      if (!trend) {
        trend = {
          templateId,
          metricId: metric.id,
          period: 'hour',
          dataPoints: [],
          trend: 'stable',
          changeRate: 0,
          confidence: 0
        };
        this.trends.get(templateId)!.push(trend);
      }

      // Add data point
      trend.dataPoints.push({
        timestamp: metric.timestamp,
        value: metric.value,
        tags: metric.tags
      });

      // Keep only recent data points (last 24 hours for hourly trends)
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
      trend.dataPoints = trend.dataPoints.filter(dp => dp.timestamp >= cutoff);

      // Calculate trend
      if (trend.dataPoints.length >= 2) {
        const recent = trend.dataPoints.slice(-10); // Last 10 points
        const older = trend.dataPoints.slice(-20, -10); // Previous 10 points
        
        if (recent.length >= 2 && older.length >= 2) {
          const recentAvg = recent.reduce((sum, dp) => sum + dp.value, 0) / recent.length;
          const olderAvg = older.reduce((sum, dp) => sum + dp.value, 0) / older.length;
          
          const changeRate = ((recentAvg - olderAvg) / olderAvg) * 100;
          trend.changeRate = changeRate;
          
          if (Math.abs(changeRate) > 10) {
            trend.trend = changeRate > 0 ? 'increasing' : 'decreasing';
          } else {
            trend.trend = 'stable';
          }
          
          trend.confidence = Math.min(1, recent.length / 10);
        }
      }
    }
  }

  /**
   * Clean up old metrics
   */
  private async cleanupOldMetrics(): Promise<void> {
    const cutoff = new Date(Date.now() - this.config.retentionPeriod * 24 * 60 * 60 * 1000);
    
    for (const [templateId, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(metric => metric.timestamp >= cutoff);
      this.metrics.set(templateId, filteredMetrics);
    }

    // Clean up old alerts
    for (const [templateId, alerts] of this.alerts.entries()) {
      const filteredAlerts = alerts.filter(alert => alert.triggeredAt >= cutoff);
      this.alerts.set(templateId, filteredAlerts);
    }
  }

  /**
   * Generate health report for template
   */
  async generateHealthReport(
    templateId: string,
    period: { start: Date; end: Date } = {
      start: new Date(Date.now() - 24 * 60 * 60 * 1000),
      end: new Date()
    }
  ): Promise<HealthReport> {
    const templateMetrics = this.metrics.get(templateId) || [];
    const templateAlerts = this.alerts.get(templateId) || [];
    const templateTrends = this.trends.get(templateId) || [];

    // Filter metrics by period
    const periodMetrics = templateMetrics.filter(
      metric => metric.timestamp >= period.start && metric.timestamp <= period.end
    );

    // Calculate category scores
    const categories = this.calculateCategoryScores(periodMetrics);
    
    // Calculate overall health
    const overallHealth = Math.round(
      (categories.performance.score + categories.usage.score + categories.reliability.score + 
       categories.security.score + categories.accessibility.score) / 5
    );

    const status = this.getHealthStatus(overallHealth);

    // Generate recommendations
    const recommendations = await this.generateRecommendations(templateId, categories, templateAlerts);

    return {
      templateId,
      generatedAt: new Date(),
      period,
      summary: {
        overallHealth,
        status,
        totalMetrics: periodMetrics.length,
        healthyMetrics: periodMetrics.filter(m => this.isMetricHealthy(m)).length,
        warningMetrics: periodMetrics.filter(m => this.isMetricWarning(m)).length,
        criticalMetrics: periodMetrics.filter(m => this.isMetricCritical(m)).length
      },
      categories,
      trends: templateTrends,
      alerts: templateAlerts.filter(alert => 
        alert.triggeredAt >= period.start && alert.triggeredAt <= period.end
      ),
      recommendations
    };
  }

  /**
   * Calculate category scores
   */
  private calculateCategoryScores(metrics: HealthMetric[]): HealthReport['categories'] {
    const categories: HealthReport['categories'] = {
      performance: this.calculateCategoryScore(metrics, 'performance'),
      usage: this.calculateCategoryScore(metrics, 'usage'),
      reliability: this.calculateCategoryScore(metrics, 'reliability'),
      security: this.calculateCategoryScore(metrics, 'security'),
      accessibility: this.calculateCategoryScore(metrics, 'accessibility')
    };

    return categories;
  }

  /**
   * Calculate score for a specific category
   */
  private calculateCategoryScore(metrics: HealthMetric[], category: string): HealthCategoryReport {
    const categoryMetrics = metrics.filter(m => m.category === category);
    
    if (categoryMetrics.length === 0) {
      return {
        score: 85, // Default score
        status: 'good',
        metrics: [],
        issues: [],
        improvements: []
      };
    }

    let score = 100;
    const issues: string[] = [];
    const improvements: string[] = [];

    for (const metric of categoryMetrics) {
      const threshold = this.config.alertThresholds[metric.id];
      if (threshold) {
        if (this.evaluateThreshold(metric.value, threshold)) {
          score -= 20;
          issues.push(`${metric.name} exceeds threshold`);
        }
      }
    }

    const status = this.getHealthStatus(score);

    return {
      score: Math.max(0, score),
      status,
      metrics: categoryMetrics,
      issues,
      improvements
    };
  }

  /**
   * Check if metric is healthy
   */
  private isMetricHealthy(metric: HealthMetric): boolean {
    const threshold = this.config.alertThresholds[metric.id];
    if (!threshold) return true;
    
    const isWarning = threshold.operator === 'gt' ? metric.value > threshold.warning
                   : threshold.operator === 'lt' ? metric.value < threshold.warning
                   : false;
    
    return !isWarning;
  }

  /**
   * Check if metric is in warning state
   */
  private isMetricWarning(metric: HealthMetric): boolean {
    const threshold = this.config.alertThresholds[metric.id];
    if (!threshold) return false;
    
    const isWarning = threshold.operator === 'gt' ? metric.value > threshold.warning && metric.value <= threshold.critical
                   : threshold.operator === 'lt' ? metric.value < threshold.warning && metric.value >= threshold.critical
                   : false;
    
    return isWarning;
  }

  /**
   * Check if metric is critical
   */
  private isMetricCritical(metric: HealthMetric): boolean {
    const threshold = this.config.alertThresholds[metric.id];
    if (!threshold) return false;
    
    return this.evaluateThreshold(metric.value, threshold);
  }

  /**
   * Get health status from score
   */
  private getHealthStatus(score: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Generate health recommendations
   */
  private async generateRecommendations(
    templateId: string,
    categories: HealthReport['categories'],
    alerts: HealthAlert[]
  ): Promise<HealthRecommendation[]> {
    const recommendations: HealthRecommendation[] = [];

    // Performance recommendations
    if (categories.performance.status === 'poor' || categories.performance.status === 'critical') {
      recommendations.push({
        id: 'optimize-performance',
        type: 'performance',
        priority: 'high',
        title: 'Optimize Performance',
        description: 'Template performance is below acceptable thresholds',
        impact: 'Significant improvement in user experience and page speed',
        effort: 'medium',
        metrics: ['load-time', 'render-time', 'memory-usage'],
        autoFixable: true
      });
    }

    // Reliability recommendations
    if (categories.reliability.status === 'poor' || categories.reliability.status === 'critical') {
      recommendations.push({
        id: 'improve-reliability',
        type: 'maintenance',
        priority: 'critical',
        title: 'Improve Reliability',
        description: 'Template reliability issues detected',
        impact: 'Improved stability and reduced downtime',
        effort: 'high',
        metrics: ['uptime', 'crash-count'],
        autoFixable: false
      });
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);
    if (criticalAlerts.length > 0) {
      recommendations.push({
        id: 'address-critical-alerts',
        type: 'maintenance',
        priority: 'critical',
        title: 'Address Critical Alerts',
        description: `${criticalAlerts.length} critical alerts require immediate attention`,
        impact: 'Prevent system failures and improve stability',
        effort: 'medium',
        metrics: criticalAlerts.map(alert => alert.metricId),
        autoFixable: false
      });
    }

    return recommendations;
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(templateId: string, alertId: string, acknowledgedBy: string): void {
    const alerts = this.alerts.get(templateId) || [];
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
    }
  }

  /**
   * Resolve alert
   */
  resolveAlert(templateId: string, alertId: string): void {
    const alerts = this.alerts.get(templateId) || [];
    const alert = alerts.find(a => a.id === alertId);
    
    if (alert) {
      alert.resolvedAt = new Date();
    }
  }

  /**
   * Get metrics for template
   */
  getMetrics(templateId: string, category?: string): HealthMetric[] {
    const metrics = this.metrics.get(templateId) || [];
    return category ? metrics.filter(m => m.category === category) : metrics;
  }

  /**
   * Get alerts for template
   */
  getAlerts(templateId: string, severity?: HealthAlert['severity']): HealthAlert[] {
    const alerts = this.alerts.get(templateId) || [];
    return severity ? alerts.filter(a => a.severity === severity) : alerts;
  }

  /**
   * Get trends for template
   */
  getTrends(templateId: string, metricId?: string): HealthTrend[] {
    const trends = this.trends.get(templateId) || [];
    return metricId ? trends.filter(t => t.metricId === metricId) : trends;
  }

  /**
   * Add custom metric collector
   */
  addMetricCollector(collector: MetricCollector): void {
    this.collectors.set(collector.id, collector);
  }

  /**
   * Remove metric collector
   */
  removeMetricCollector(collectorId: string): void {
    this.collectors.delete(collectorId);
  }

  /**
   * Get monitoring configuration
   */
  getConfig(): MonitoringConfig {
    return { ...this.config };
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(updates: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

// Global health monitor instance
let globalHealthMonitor: TemplateHealthMonitor | null = null;

/**
 * Get the global health monitor instance
 */
export function getHealthMonitor(config?: Partial<MonitoringConfig>): TemplateHealthMonitor {
  if (!globalHealthMonitor) {
    globalHealthMonitor = new TemplateHealthMonitor(config);
  }
  return globalHealthMonitor;
}

/**
 * Initialize health monitor with custom configuration
 */
export function initializeHealthMonitor(config?: Partial<MonitoringConfig>): TemplateHealthMonitor {
  globalHealthMonitor = new TemplateHealthMonitor(config);
  return globalHealthMonitor;
}
