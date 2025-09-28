/**
 * @file Template Performance Monitoring System
 * @description Comprehensive template performance monitoring with real-time tracking and optimization insights
 * @author AI Assistant
 * @created 2025-09-20
 */

import { z } from 'zod';

// Type definitions
export interface PerformanceMetric {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  timestamp: Date;
  metricType: 'load_time' | 'bundle_size' | 'memory_usage' | 'cpu_usage' | 'network_requests' | 'error_rate' | 'core_web_vitals';
  value: number;
  unit: 'ms' | 'bytes' | 'mb' | 'percent' | 'count' | 'score';
  metadata?: {
    url?: string;
    userAgent?: string;
    networkType?: string;
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    location?: string;
    userId?: string;
    sessionId?: string;
    vitals?: {
      fcp?: number; // First Contentful Paint
      lcp?: number; // Largest Contentful Paint
      fid?: number; // First Input Delay
      cls?: number; // Cumulative Layout Shift
      ttfb?: number; // Time to First Byte
    };
  };
}

export interface PerformanceOverview {
  averageScore: number;
  totalMeasurements: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  coreWebVitals: {
    fcp: { average: number; grade: string; passing: boolean };
    lcp: { average: number; grade: string; passing: boolean };
    fid: { average: number; grade: string; passing: boolean };
    cls: { average: number; grade: string; passing: boolean };
  };
  performanceByCategory: Array<{
    category: string;
    averageScore: number;
    sampleCount: number;
    grade: string;
  }>;
  performanceTrends: Array<{
    date: string;
    averageScore: number;
    measurementCount: number;
  }>;
  topPerformers: Array<{
    templateId: string;
    templateName: string;
    category: string;
    score: number;
    grade: string;
  }>;
  performanceIssues: Array<{
    templateId: string;
    templateName: string;
    category: string;
    issue: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    recommendation: string;
  }>;
}

export interface TemplatePerformanceReport {
  templateId: string;
  templateName: string;
  category: string;
  overallScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  measurementCount: number;
  lastMeasurement: Date;
  metrics: {
    loadTime: { average: number; p95: number; trend: 'improving' | 'degrading' | 'stable' };
    bundleSize: { current: number; trend: 'improving' | 'degrading' | 'stable'; optimized: boolean };
    memoryUsage: { average: number; peak: number; trend: 'improving' | 'degrading' | 'stable' };
    errorRate: { current: number; trend: 'improving' | 'degrading' | 'stable' };
  };
  coreWebVitals: {
    fcp: { value: number; grade: string; passing: boolean };
    lcp: { value: number; grade: string; passing: boolean };
    fid: { value: number; grade: string; passing: boolean };
    cls: { value: number; grade: string; passing: boolean };
    ttfb: { value: number; grade: string; passing: boolean };
  };
  performanceHistory: Array<{
    date: string;
    score: number;
    loadTime: number;
    bundleSize: number;
    errorRate: number;
  }>;
  optimizationOpportunities: Array<{
    category: string;
    issue: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
    recommendation: string;
    estimatedImprovement: number;
  }>;
  devicePerformance: Array<{
    deviceType: 'mobile' | 'tablet' | 'desktop';
    averageScore: number;
    sampleCount: number;
    issues: string[];
  }>;
}

export interface PerformanceAlert {
  id: string;
  templateId: string;
  templateName: string;
  alertType: 'performance_degradation' | 'high_error_rate' | 'memory_leak' | 'slow_loading' | 'bundle_size_increase';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  thresholdValue: number;
  timestamp: Date;
  acknowledged: boolean;
  resolved: boolean;
}

// Validation schemas
const PerformanceMetricSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  category: z.string(),
  timestamp: z.date(),
  metricType: z.enum(['load_time', 'bundle_size', 'memory_usage', 'cpu_usage', 'network_requests', 'error_rate', 'core_web_vitals']),
  value: z.number(),
  unit: z.enum(['ms', 'bytes', 'mb', 'percent', 'count', 'score']),
  metadata: z.object({
    url: z.string().optional(),
    userAgent: z.string().optional(),
    networkType: z.string().optional(),
    deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),
    location: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    vitals: z.object({
      fcp: z.number().optional(),
      lcp: z.number().optional(),
      fid: z.number().optional(),
      cls: z.number().optional(),
      ttfb: z.number().optional(),
    }).optional(),
  }).optional(),
});

/**
 * Template Performance Monitoring System
 * Provides comprehensive performance monitoring, analysis, and optimization insights
 */
class TemplatePerformanceService {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes
  private alertThresholds = {
    loadTime: { warning: 3000, critical: 5000 }, // ms
    bundleSize: { warning: 1000000, critical: 2000000 }, // bytes
    memoryUsage: { warning: 100, critical: 200 }, // MB
    errorRate: { warning: 5, critical: 10 }, // percent
    coreWebVitals: {
      fcp: { good: 1800, poor: 3000 }, // ms
      lcp: { good: 2500, poor: 4000 }, // ms
      fid: { good: 100, poor: 300 }, // ms
      cls: { good: 0.1, poor: 0.25 }, // score
    },
  };

  /**
   * Record a performance metric
   */
  async recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const fullMetric: PerformanceMetric = {
        ...metric,
        id: this.generateId(),
        timestamp: new Date(),
      };

      // Validate metric
      PerformanceMetricSchema.parse(fullMetric);

      // Store metric
      this.metrics.push(fullMetric);

      // Check for performance issues and create alerts
      await this.checkPerformanceThresholds(fullMetric);

      // Clear relevant caches
      this.clearCacheByTemplate(metric.templateId);

      // Trigger real-time updates
      await this.triggerRealTimeUpdate(fullMetric);
    } catch (error) {
      console.error('Failed to record performance metric:', error);
      throw new Error('Failed to record performance metric');
    }
  }

  /**
   * Get performance overview
   */
  async getPerformanceOverview(timeRange: string = '7d'): Promise<PerformanceOverview> {
    const cacheKey = `perf_overview_${timeRange}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const filteredMetrics = this.filterMetricsByTimeRange(timeRange);
      
      // Calculate overall performance score
      const scoreMetrics = filteredMetrics.filter(m => m.unit === 'score');
      const averageScore = scoreMetrics.length > 0
        ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
        : 0;

      const performanceGrade = this.calculateGrade(averageScore);

      // Calculate Core Web Vitals
      const coreWebVitals = await this.calculateCoreWebVitals(filteredMetrics);

      // Get performance by category
      const performanceByCategory = await this.getPerformanceByCategory(filteredMetrics);

      // Get performance trends
      const performanceTrends = await this.getPerformanceTrends(timeRange);

      // Get top performers
      const topPerformers = await this.getTopPerformers(filteredMetrics, 10);

      // Get performance issues
      const performanceIssues = await this.getPerformanceIssues(filteredMetrics);

      const overview: PerformanceOverview = {
        averageScore,
        totalMeasurements: filteredMetrics.length,
        performanceGrade,
        coreWebVitals,
        performanceByCategory,
        performanceTrends,
        topPerformers,
        performanceIssues,
      };

      // Cache result
      this.setCache(cacheKey, overview);

      return overview;
    } catch (error) {
      console.error('Failed to get performance overview:', error);
      throw new Error('Failed to get performance overview');
    }
  }

  /**
   * Get detailed performance report for a template
   */
  async getTemplatePerformanceReport(templateId: string, timeRange: string = '30d'): Promise<TemplatePerformanceReport> {
    const cacheKey = `perf_report_${templateId}_${timeRange}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const templateMetrics = this.metrics.filter(m => 
        m.templateId === templateId && 
        this.isWithinTimeRange(m.timestamp, timeRange)
      );

      if (templateMetrics.length === 0) {
        throw new Error('Template not found or no performance data available');
      }

      const templateName = templateMetrics[0].templateName;
      const category = templateMetrics[0].category;

      // Calculate overall score
      const scoreMetrics = templateMetrics.filter(m => m.unit === 'score');
      const overallScore = scoreMetrics.length > 0
        ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
        : 0;

      const grade = this.calculateGrade(overallScore);

      // Calculate specific metrics
      const metrics = await this.calculateTemplateMetrics(templateMetrics);

      // Calculate Core Web Vitals
      const coreWebVitals = await this.calculateTemplateWebVitals(templateMetrics);

      // Get performance history
      const performanceHistory = await this.getTemplatePerformanceHistory(templateId, timeRange);

      // Get optimization opportunities
      const optimizationOpportunities = await this.getOptimizationOpportunities(templateMetrics);

      // Get device performance
      const devicePerformance = await this.getDevicePerformance(templateMetrics);

      const report: TemplatePerformanceReport = {
        templateId,
        templateName,
        category,
        overallScore,
        grade,
        measurementCount: templateMetrics.length,
        lastMeasurement: new Date(Math.max(...templateMetrics.map(m => m.timestamp.getTime()))),
        metrics,
        coreWebVitals,
        performanceHistory,
        optimizationOpportunities,
        devicePerformance,
      };

      // Cache result
      this.setCache(cacheKey, report);

      return report;
    } catch (error) {
      console.error('Failed to get template performance report:', error);
      throw new Error('Failed to get template performance report');
    }
  }

  /**
   * Get active performance alerts
   */
  async getActiveAlerts(): Promise<PerformanceAlert[]> {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge a performance alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
    }
  }

  /**
   * Resolve a performance alert
   */
  async resolveAlert(alertId: string): Promise<void> {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Calculate Core Web Vitals from metrics
   */
  private async calculateCoreWebVitals(metrics: PerformanceMetric[]): Promise<any> {
    const vitalMetrics = metrics.filter(m => m.metricType === 'core_web_vitals' && m.metadata?.vitals);
    
    if (vitalMetrics.length === 0) {
      return {
        fcp: { average: 0, grade: 'N/A', passing: false },
        lcp: { average: 0, grade: 'N/A', passing: false },
        fid: { average: 0, grade: 'N/A', passing: false },
        cls: { average: 0, grade: 'N/A', passing: false },
      };
    }

    const vitals = vitalMetrics.map(m => m.metadata!.vitals!);
    
    const calculateVital = (vitalName: keyof NonNullable<PerformanceMetric['metadata']>['vitals']) => {
      const values = vitals.map(v => v[vitalName]).filter(Boolean) as number[];
      if (values.length === 0) return { average: 0, grade: 'N/A', passing: false };
      
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;
      const thresholds = this.alertThresholds.coreWebVitals[vitalName as keyof typeof this.alertThresholds.coreWebVitals];
      
      let grade = 'Good';
      let passing = true;
      
      if (vitalName === 'cls') {
        if (average > thresholds.poor) {
          grade = 'Poor';
          passing = false;
        } else if (average > thresholds.good) {
          grade = 'Needs Improvement';
        }
      } else {
        if (average > thresholds.poor) {
          grade = 'Poor';
          passing = false;
        } else if (average > thresholds.good) {
          grade = 'Needs Improvement';
        }
      }
      
      return { average, grade, passing };
    };

    return {
      fcp: calculateVital('fcp'),
      lcp: calculateVital('lcp'),
      fid: calculateVital('fid'),
      cls: calculateVital('cls'),
    };
  }

  /**
   * Calculate template-specific Core Web Vitals
   */
  private async calculateTemplateWebVitals(metrics: PerformanceMetric[]): Promise<any> {
    const vitalMetrics = metrics.filter(m => m.metricType === 'core_web_vitals' && m.metadata?.vitals);
    
    if (vitalMetrics.length === 0) {
      return {
        fcp: { value: 0, grade: 'N/A', passing: false },
        lcp: { value: 0, grade: 'N/A', passing: false },
        fid: { value: 0, grade: 'N/A', passing: false },
        cls: { value: 0, grade: 'N/A', passing: false },
        ttfb: { value: 0, grade: 'N/A', passing: false },
      };
    }

    const vitals = vitalMetrics.map(m => m.metadata!.vitals!);
    
    const calculateVital = (vitalName: keyof NonNullable<PerformanceMetric['metadata']>['vitals']) => {
      const values = vitals.map(v => v[vitalName]).filter(Boolean) as number[];
      if (values.length === 0) return { value: 0, grade: 'N/A', passing: false };
      
      const value = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      if (vitalName === 'ttfb') {
        const grade = value <= 800 ? 'Good' : value <= 1800 ? 'Needs Improvement' : 'Poor';
        return { value, grade, passing: value <= 800 };
      }
      
      const thresholds = this.alertThresholds.coreWebVitals[vitalName as keyof typeof this.alertThresholds.coreWebVitals];
      let grade = 'Good';
      let passing = true;
      
      if (vitalName === 'cls') {
        if (value > thresholds.poor) {
          grade = 'Poor';
          passing = false;
        } else if (value > thresholds.good) {
          grade = 'Needs Improvement';
        }
      } else {
        if (value > thresholds.poor) {
          grade = 'Poor';
          passing = false;
        } else if (value > thresholds.good) {
          grade = 'Needs Improvement';
        }
      }
      
      return { value, grade, passing };
    };

    return {
      fcp: calculateVital('fcp'),
      lcp: calculateVital('lcp'),
      fid: calculateVital('fid'),
      cls: calculateVital('cls'),
      ttfb: calculateVital('ttfb'),
    };
  }

  /**
   * Calculate template-specific metrics
   */
  private async calculateTemplateMetrics(metrics: PerformanceMetric[]): Promise<any> {
    const loadTimeMetrics = metrics.filter(m => m.metricType === 'load_time');
    const bundleSizeMetrics = metrics.filter(m => m.metricType === 'bundle_size');
    const memoryMetrics = metrics.filter(m => m.metricType === 'memory_usage');
    const errorMetrics = metrics.filter(m => m.metricType === 'error_rate');

    const calculateTrend = (values: number[]): 'improving' | 'degrading' | 'stable' => {
      if (values.length < 2) return 'stable';
      const recent = values.slice(-5);
      const older = values.slice(0, -5);
      if (older.length === 0) return 'stable';
      
      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
      
      const change = (recentAvg - olderAvg) / olderAvg;
      if (change < -0.1) return 'improving';
      if (change > 0.1) return 'degrading';
      return 'stable';
    };

    return {
      loadTime: {
        average: loadTimeMetrics.length > 0 
          ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length 
          : 0,
        p95: this.calculatePercentile(loadTimeMetrics.map(m => m.value), 95),
        trend: calculateTrend(loadTimeMetrics.map(m => m.value)),
      },
      bundleSize: {
        current: bundleSizeMetrics.length > 0 
          ? bundleSizeMetrics[bundleSizeMetrics.length - 1].value 
          : 0,
        trend: calculateTrend(bundleSizeMetrics.map(m => m.value)),
        optimized: bundleSizeMetrics.length > 0 
          ? bundleSizeMetrics[bundleSizeMetrics.length - 1].value < this.alertThresholds.bundleSize.warning
          : false,
      },
      memoryUsage: {
        average: memoryMetrics.length > 0 
          ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length 
          : 0,
        peak: memoryMetrics.length > 0 
          ? Math.max(...memoryMetrics.map(m => m.value)) 
          : 0,
        trend: calculateTrend(memoryMetrics.map(m => m.value)),
      },
      errorRate: {
        current: errorMetrics.length > 0 
          ? errorMetrics[errorMetrics.length - 1].value 
          : 0,
        trend: calculateTrend(errorMetrics.map(m => m.value)),
      },
    };
  }

  /**
   * Get performance by category
   */
  private async getPerformanceByCategory(metrics: PerformanceMetric[]): Promise<any[]> {
    const categoryGroups = new Map<string, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      if (!categoryGroups.has(metric.category)) {
        categoryGroups.set(metric.category, []);
      }
      categoryGroups.get(metric.category)!.push(metric);
    });

    return Array.from(categoryGroups.entries()).map(([category, categoryMetrics]) => {
      const scoreMetrics = categoryMetrics.filter(m => m.unit === 'score');
      const averageScore = scoreMetrics.length > 0
        ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
        : 0;

      return {
        category,
        averageScore,
        sampleCount: categoryMetrics.length,
        grade: this.calculateGrade(averageScore),
      };
    });
  }

  /**
   * Get performance trends over time
   */
  private async getPerformanceTrends(timeRange: string): Promise<any[]> {
    const metrics = this.filterMetricsByTimeRange(timeRange);
    const dateGroups = new Map<string, PerformanceMetric[]>();

    metrics.forEach(metric => {
      const dateKey = metric.timestamp.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(metric);
    });

    return Array.from(dateGroups.entries())
      .map(([date, dateMetrics]) => {
        const scoreMetrics = dateMetrics.filter(m => m.unit === 'score');
        const averageScore = scoreMetrics.length > 0
          ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
          : 0;

        return {
          date,
          averageScore,
          measurementCount: dateMetrics.length,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get top performing templates
   */
  private async getTopPerformers(metrics: PerformanceMetric[], limit: number = 10): Promise<any[]> {
    const templateGroups = new Map<string, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      if (!templateGroups.has(metric.templateId)) {
        templateGroups.set(metric.templateId, []);
      }
      templateGroups.get(metric.templateId)!.push(metric);
    });

    const templateScores = Array.from(templateGroups.entries()).map(([templateId, templateMetrics]) => {
      const scoreMetrics = templateMetrics.filter(m => m.unit === 'score');
      const score = scoreMetrics.length > 0
        ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
        : 0;

      return {
        templateId,
        templateName: templateMetrics[0].templateName,
        category: templateMetrics[0].category,
        score,
        grade: this.calculateGrade(score),
      };
    });

    return templateScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get performance issues
   */
  private async getPerformanceIssues(metrics: PerformanceMetric[]): Promise<any[]> {
    const issues: any[] = [];
    const templateGroups = new Map<string, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      if (!templateGroups.has(metric.templateId)) {
        templateGroups.set(metric.templateId, []);
      }
      templateGroups.get(metric.templateId)!.push(metric);
    });

    templateGroups.forEach((templateMetrics, templateId) => {
      const template = templateMetrics[0];
      
      // Check load time issues
      const loadTimeMetrics = templateMetrics.filter(m => m.metricType === 'load_time');
      if (loadTimeMetrics.length > 0) {
        const avgLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
        if (avgLoadTime > this.alertThresholds.loadTime.critical) {
          issues.push({
            templateId,
            templateName: template.templateName,
            category: template.category,
            issue: 'Critical load time performance',
            severity: 'critical',
            impact: 95,
            recommendation: 'Optimize critical rendering path and reduce bundle size',
          });
        } else if (avgLoadTime > this.alertThresholds.loadTime.warning) {
          issues.push({
            templateId,
            templateName: template.templateName,
            category: template.category,
            issue: 'Slow load time performance',
            severity: 'medium',
            impact: 70,
            recommendation: 'Implement code splitting and lazy loading',
          });
        }
      }

      // Check bundle size issues
      const bundleMetrics = templateMetrics.filter(m => m.metricType === 'bundle_size');
      if (bundleMetrics.length > 0) {
        const latestBundleSize = bundleMetrics[bundleMetrics.length - 1].value;
        if (latestBundleSize > this.alertThresholds.bundleSize.critical) {
          issues.push({
            templateId,
            templateName: template.templateName,
            category: template.category,
            issue: 'Excessive bundle size',
            severity: 'high',
            impact: 85,
            recommendation: 'Remove unused dependencies and implement tree shaking',
          });
        }
      }

      // Check error rate issues
      const errorMetrics = templateMetrics.filter(m => m.metricType === 'error_rate');
      if (errorMetrics.length > 0) {
        const latestErrorRate = errorMetrics[errorMetrics.length - 1].value;
        if (latestErrorRate > this.alertThresholds.errorRate.critical) {
          issues.push({
            templateId,
            templateName: template.templateName,
            category: template.category,
            issue: 'High error rate',
            severity: 'critical',
            impact: 90,
            recommendation: 'Review error logs and fix critical bugs',
          });
        }
      }
    });

    return issues.sort((a, b) => b.impact - a.impact);
  }

  /**
   * Get template performance history
   */
  private async getTemplatePerformanceHistory(templateId: string, timeRange: string): Promise<any[]> {
    const metrics = this.metrics.filter(m => 
      m.templateId === templateId && 
      this.isWithinTimeRange(m.timestamp, timeRange)
    );

    const dateGroups = new Map<string, PerformanceMetric[]>();

    metrics.forEach(metric => {
      const dateKey = metric.timestamp.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(metric);
    });

    return Array.from(dateGroups.entries())
      .map(([date, dateMetrics]) => {
        const scoreMetrics = dateMetrics.filter(m => m.unit === 'score');
        const loadTimeMetrics = dateMetrics.filter(m => m.metricType === 'load_time');
        const bundleMetrics = dateMetrics.filter(m => m.metricType === 'bundle_size');
        const errorMetrics = dateMetrics.filter(m => m.metricType === 'error_rate');

        return {
          date,
          score: scoreMetrics.length > 0 
            ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length 
            : 0,
          loadTime: loadTimeMetrics.length > 0 
            ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length 
            : 0,
          bundleSize: bundleMetrics.length > 0 
            ? bundleMetrics[bundleMetrics.length - 1].value 
            : 0,
          errorRate: errorMetrics.length > 0 
            ? errorMetrics[errorMetrics.length - 1].value 
            : 0,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get optimization opportunities
   */
  private async getOptimizationOpportunities(metrics: PerformanceMetric[]): Promise<any[]> {
    const opportunities: any[] = [];
    
    // Analyze load time
    const loadTimeMetrics = metrics.filter(m => m.metricType === 'load_time');
    if (loadTimeMetrics.length > 0) {
      const avgLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
      if (avgLoadTime > 2000) {
        opportunities.push({
          category: 'Load Time',
          issue: 'Slow initial page load',
          impact: 'high',
          effort: 'medium',
          recommendation: 'Implement critical CSS inlining and defer non-critical resources',
          estimatedImprovement: 30,
        });
      }
    }

    // Analyze bundle size
    const bundleMetrics = metrics.filter(m => m.metricType === 'bundle_size');
    if (bundleMetrics.length > 0) {
      const latestBundleSize = bundleMetrics[bundleMetrics.length - 1].value;
      if (latestBundleSize > 500000) {
        opportunities.push({
          category: 'Bundle Size',
          issue: 'Large JavaScript bundle',
          impact: 'medium',
          effort: 'medium',
          recommendation: 'Implement code splitting and remove unused dependencies',
          estimatedImprovement: 25,
        });
      }
    }

    // Analyze Core Web Vitals
    const vitalMetrics = metrics.filter(m => m.metricType === 'core_web_vitals' && m.metadata?.vitals);
    if (vitalMetrics.length > 0) {
      const vitals = vitalMetrics.map(m => m.metadata!.vitals!);
      const avgLCP = vitals.map(v => v.lcp).filter(Boolean).reduce((sum, val) => sum + val!, 0) / vitals.length;
      
      if (avgLCP > 2500) {
        opportunities.push({
          category: 'Core Web Vitals',
          issue: 'Poor Largest Contentful Paint',
          impact: 'high',
          effort: 'medium',
          recommendation: 'Optimize images and preload critical resources',
          estimatedImprovement: 35,
        });
      }
    }

    return opportunities.sort((a, b) => {
      const impactWeight = { low: 1, medium: 2, high: 3 };
      const effortWeight = { low: 3, medium: 2, high: 1 };
      const aScore = impactWeight[a.impact as keyof typeof impactWeight] * effortWeight[a.effort as keyof typeof effortWeight];
      const bScore = impactWeight[b.impact as keyof typeof impactWeight] * effortWeight[b.effort as keyof typeof effortWeight];
      return bScore - aScore;
    });
  }

  /**
   * Get device performance breakdown
   */
  private async getDevicePerformance(metrics: PerformanceMetric[]): Promise<any[]> {
    const deviceGroups = new Map<string, PerformanceMetric[]>();
    
    metrics.forEach(metric => {
      const deviceType = metric.metadata?.deviceType || 'unknown';
      if (!deviceGroups.has(deviceType)) {
        deviceGroups.set(deviceType, []);
      }
      deviceGroups.get(deviceType)!.push(metric);
    });

    return Array.from(deviceGroups.entries()).map(([deviceType, deviceMetrics]) => {
      const scoreMetrics = deviceMetrics.filter(m => m.unit === 'score');
      const averageScore = scoreMetrics.length > 0
        ? scoreMetrics.reduce((sum, m) => sum + m.value, 0) / scoreMetrics.length
        : 0;

      const issues: string[] = [];
      
      // Check for device-specific issues
      const loadTimeMetrics = deviceMetrics.filter(m => m.metricType === 'load_time');
      if (loadTimeMetrics.length > 0) {
        const avgLoadTime = loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
        if (deviceType === 'mobile' && avgLoadTime > 3000) {
          issues.push('Slow mobile performance');
        }
      }

      return {
        deviceType: deviceType as 'mobile' | 'tablet' | 'desktop',
        averageScore,
        sampleCount: deviceMetrics.length,
        issues,
      };
    });
  }

  /**
   * Check performance thresholds and create alerts
   */
  private async checkPerformanceThresholds(metric: PerformanceMetric): Promise<void> {
    const alerts: Omit<PerformanceAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>[] = [];

    // Check load time thresholds
    if (metric.metricType === 'load_time') {
      if (metric.value > this.alertThresholds.loadTime.critical) {
        alerts.push({
          templateId: metric.templateId,
          templateName: metric.templateName,
          alertType: 'slow_loading',
          severity: 'critical',
          message: `Critical load time: ${metric.value}ms exceeds ${this.alertThresholds.loadTime.critical}ms threshold`,
          currentValue: metric.value,
          thresholdValue: this.alertThresholds.loadTime.critical,
        });
      } else if (metric.value > this.alertThresholds.loadTime.warning) {
        alerts.push({
          templateId: metric.templateId,
          templateName: metric.templateName,
          alertType: 'slow_loading',
          severity: 'medium',
          message: `Slow load time: ${metric.value}ms exceeds ${this.alertThresholds.loadTime.warning}ms threshold`,
          currentValue: metric.value,
          thresholdValue: this.alertThresholds.loadTime.warning,
        });
      }
    }

    // Check bundle size thresholds
    if (metric.metricType === 'bundle_size') {
      if (metric.value > this.alertThresholds.bundleSize.critical) {
        alerts.push({
          templateId: metric.templateId,
          templateName: metric.templateName,
          alertType: 'bundle_size_increase',
          severity: 'high',
          message: `Large bundle size: ${Math.round(metric.value / 1024)}KB exceeds ${Math.round(this.alertThresholds.bundleSize.critical / 1024)}KB threshold`,
          currentValue: metric.value,
          thresholdValue: this.alertThresholds.bundleSize.critical,
        });
      }
    }

    // Check error rate thresholds
    if (metric.metricType === 'error_rate') {
      if (metric.value > this.alertThresholds.errorRate.critical) {
        alerts.push({
          templateId: metric.templateId,
          templateName: metric.templateName,
          alertType: 'high_error_rate',
          severity: 'critical',
          message: `High error rate: ${metric.value}% exceeds ${this.alertThresholds.errorRate.critical}% threshold`,
          currentValue: metric.value,
          thresholdValue: this.alertThresholds.errorRate.critical,
        });
      }
    }

    // Create alert records
    alerts.forEach(alertData => {
      const alert: PerformanceAlert = {
        ...alertData,
        id: this.generateId(),
        timestamp: new Date(),
        acknowledged: false,
        resolved: false,
      };
      this.alerts.push(alert);
    });
  }

  /**
   * Calculate performance grade
   */
  private calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(values: number[], percentile: number): number {
    if (values.length === 0) return 0;
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  /**
   * Filter metrics by time range
   */
  private filterMetricsByTimeRange(timeRange: string): PerformanceMetric[] {
    if (timeRange === 'all') return this.metrics;
    
    const cutoff = new Date(Date.now() - this.getTimeRangeMs(timeRange));
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Check if timestamp is within time range
   */
  private isWithinTimeRange(timestamp: Date, timeRange: string): boolean {
    if (timeRange === 'all') return true;
    const cutoff = new Date(Date.now() - this.getTimeRangeMs(timeRange));
    return timestamp >= cutoff;
  }

  /**
   * Get time range in milliseconds
   */
  private getTimeRangeMs(timeRange: string): number {
    switch (timeRange) {
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCacheByTemplate(templateId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(templateId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Trigger real-time updates
   */
  private async triggerRealTimeUpdate(metric: PerformanceMetric): Promise<void> {
    // In a real implementation, this would trigger WebSocket updates, webhooks, etc.
    console.log('Real-time performance update:', metric);
  }

  /**
   * Initialize with sample data (for development)
   */
  async initializeSampleData(): Promise<void> {
    const sampleTemplates = [
      { id: 'template_1', name: 'Modern Dashboard', category: 'dashboard' },
      { id: 'template_2', name: 'Contact Form', category: 'form' },
      { id: 'template_3', name: 'Landing Page Pro', category: 'landing' },
      { id: 'template_4', name: 'E-commerce Store', category: 'ecommerce' },
      { id: 'template_5', name: 'Analytics Dashboard', category: 'dashboard' },
    ];

    const metricTypes: PerformanceMetric['metricType'][] = ['load_time', 'bundle_size', 'memory_usage', 'error_rate', 'core_web_vitals'];
    const deviceTypes: Array<'mobile' | 'tablet' | 'desktop'> = ['mobile', 'tablet', 'desktop'];
    
    // Generate sample metrics for the last 30 days
    for (let i = 0; i < 500; i++) {
      const template = sampleTemplates[Math.floor(Math.random() * sampleTemplates.length)];
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      const deviceType = deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      let value = 1;
      let unit: PerformanceMetric['unit'] = 'count';
      let metadata: PerformanceMetric['metadata'] = {
        deviceType,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        sessionId: `session_${Math.floor(Math.random() * 500)}`,
      };

      switch (metricType) {
        case 'load_time':
          value = 1000 + Math.random() * 4000; // 1-5 seconds
          unit = 'ms';
          break;
        case 'bundle_size':
          value = 200000 + Math.random() * 800000; // 200KB - 1MB
          unit = 'bytes';
          break;
        case 'memory_usage':
          value = 50 + Math.random() * 150; // 50-200 MB
          unit = 'mb';
          break;
        case 'error_rate':
          value = Math.random() * 15; // 0-15%
          unit = 'percent';
          break;
        case 'core_web_vitals':
          value = 60 + Math.random() * 40; // 60-100 score
          unit = 'score';
          metadata.vitals = {
            fcp: 800 + Math.random() * 2000,
            lcp: 1500 + Math.random() * 3000,
            fid: 50 + Math.random() * 250,
            cls: Math.random() * 0.3,
            ttfb: 200 + Math.random() * 800,
          };
          break;
      }

      await this.recordMetric({
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        metricType,
        value,
        unit,
        metadata,
      });
    }
  }
}

// Export singleton instance
export const templatePerformance = new TemplatePerformanceService();

// Initialize sample data in development
if (process.env.NODE_ENV === 'development') {
  templatePerformance.initializeSampleData().catch(console.error);
}
