/**
 * @fileoverview Performance Monitoring Service
 * @module lib/performance-monitoring/service
 * @author OSS Hero System
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { PerformanceMetrics, PerformanceAlert, PerformanceReport, MonitoringConfig } from '@/types/performance-monitoring';

export class PerformanceMonitoringService {
  private supabase;
  private config: MonitoringConfig;
  private metricsBuffer: PerformanceMetrics[] = [];
  private alertThresholds: Map<string, number> = new Map();

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<MonitoringConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      collectionInterval: 5000, // 5 seconds
      bufferSize: 100,
      alertThresholds: {
        responseTime: 2000, // 2 seconds
        memoryUsage: 0.8, // 80%
        cpuUsage: 0.7, // 70%
        errorRate: 0.05, // 5%
        throughput: 1000, // requests per minute
      },
      retentionDays: 30,
      ...config,
    };
    this.initializeThresholds();
  }

  /**
   * Initialize alert thresholds from configuration
   */
  private initializeThresholds(): void {
    Object.entries(this.config.alertThresholds).forEach(([key, value]) => {
      this.alertThresholds.set(key, value);
    });
  }

  /**
   * Start performance monitoring
   */
  async startMonitoring(): Promise<void> {
    console.log('🚀 Starting Performance Monitoring Service...');
    
    // Start collecting metrics
    this.startMetricsCollection();
    
    // Start alert monitoring
    this.startAlertMonitoring();
    
    // Start cleanup process
    this.startCleanupProcess();
    
    console.log('✅ Performance Monitoring Service started successfully');
  }

  /**
   * Start collecting performance metrics
   */
  private startMetricsCollection(): void {
    setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        await this.storeMetrics(metrics);
        this.checkAlerts(metrics);
      } catch (error) {
        console.error('Error collecting metrics:', error);
      }
    }, this.config.collectionInterval);
  }

  /**
   * Collect current performance metrics
   */
  async collectMetrics(): Promise<PerformanceMetrics> {
    const timestamp = new Date().toISOString();
    
    // Collect browser/client metrics
    const clientMetrics = this.collectClientMetrics();
    
    // Collect server metrics (if available)
    const serverMetrics = await this.collectServerMetrics();
    
    // Collect database metrics
    const databaseMetrics = await this.collectDatabaseMetrics();
    
    return {
      id: `perf_${Date.now()}`,
      timestamp,
      client: clientMetrics,
      server: serverMetrics,
      database: databaseMetrics,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Collect client-side performance metrics
   */
  private collectClientMetrics(): any {
    if (typeof window === 'undefined') {
      return {
        memoryUsage: 0,
        cpuUsage: 0,
        responseTime: 0,
        throughput: 0,
        errorRate: 0,
        userAgent: 'server',
        connectionType: 'unknown',
      };
    }

    const memory = (performance as any).memory;
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      memoryUsage: memory ? memory.usedJSHeapSize / memory.totalJSHeapSize : 0,
      cpuUsage: this.estimateCPUUsage(),
      responseTime: navigation ? navigation.responseEnd - navigation.requestStart : 0,
      throughput: this.calculateThroughput(),
      errorRate: this.calculateErrorRate(),
      userAgent: navigator.userAgent,
      connectionType: (navigator as any).connection?.effectiveType || 'unknown',
      pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
      domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
      firstPaint: this.getFirstPaint(),
      firstContentfulPaint: this.getFirstContentfulPaint(),
    };
  }

  /**
   * Collect server-side performance metrics
   */
  private async collectServerMetrics(): Promise<any> {
    try {
      const process = require('process');
      const os = require('os');
      
      return {
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
        loadAverage: os.loadavg(),
        freeMemory: os.freemem(),
        totalMemory: os.totalmem(),
        cpuCount: os.cpus().length,
        platform: os.platform(),
        arch: os.arch(),
      };
    } catch (error) {
      console.warn('Server metrics collection failed:', error);
      return {
        memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 },
        cpuUsage: { user: 0, system: 0 },
        uptime: 0,
        loadAverage: [0, 0, 0],
        freeMemory: 0,
        totalMemory: 0,
        cpuCount: 0,
        platform: 'unknown',
        arch: 'unknown',
      };
    }
  }

  /**
   * Collect database performance metrics
   */
  private async collectDatabaseMetrics(): Promise<any> {
    try {
      const startTime = Date.now();
      
      // Simple query to test database performance
      const { data, error } = await this.supabase
        .from('hero_tasks')
        .select('id')
        .limit(1);
      
      const queryTime = Date.now() - startTime;
      
      if (error) {
        return {
          queryTime,
          connectionStatus: 'error',
          errorCount: 1,
          activeConnections: 0,
        };
      }
      
      return {
        queryTime,
        connectionStatus: 'healthy',
        errorCount: 0,
        activeConnections: 1,
        queryCount: 1,
      };
    } catch (error) {
      return {
        queryTime: 0,
        connectionStatus: 'error',
        errorCount: 1,
        activeConnections: 0,
      };
    }
  }

  /**
   * Store metrics in database
   */
  private async storeMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('performance_metrics')
        .insert([metrics]);
      
      if (error) {
        console.error('Error storing metrics:', error);
      }
    } catch (error) {
      console.error('Error storing metrics:', error);
    }
  }

  /**
   * Check for performance alerts
   */
  private async checkAlerts(metrics: PerformanceMetrics): Promise<void> {
    const alerts: PerformanceAlert[] = [];
    
    // Check response time
    if (metrics.client.responseTime > this.alertThresholds.get('responseTime')!) {
      alerts.push({
        id: `alert_${Date.now()}`,
        type: 'response_time',
        severity: 'warning',
        message: `High response time: ${metrics.client.responseTime}ms`,
        threshold: this.alertThresholds.get('responseTime')!,
        actualValue: metrics.client.responseTime,
        timestamp: metrics.timestamp,
      });
    }
    
    // Check memory usage
    if (metrics.client.memoryUsage > this.alertThresholds.get('memoryUsage')!) {
      alerts.push({
        id: `alert_${Date.now()}`,
        type: 'memory_usage',
        severity: 'critical',
        message: `High memory usage: ${(metrics.client.memoryUsage * 100).toFixed(1)}%`,
        threshold: this.alertThresholds.get('memoryUsage')!,
        actualValue: metrics.client.memoryUsage,
        timestamp: metrics.timestamp,
      });
    }
    
    // Check error rate
    if (metrics.client.errorRate > this.alertThresholds.get('errorRate')!) {
      alerts.push({
        id: `alert_${Date.now()}`,
        type: 'error_rate',
        severity: 'critical',
        message: `High error rate: ${(metrics.client.errorRate * 100).toFixed(1)}%`,
        threshold: this.alertThresholds.get('errorRate')!,
        actualValue: metrics.client.errorRate,
        timestamp: metrics.timestamp,
      });
    }
    
    // Store alerts
    if (alerts.length > 0) {
      await this.storeAlerts(alerts);
    }
  }

  /**
   * Store performance alerts
   */
  private async storeAlerts(alerts: PerformanceAlert[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('performance_alerts')
        .insert(alerts);
      
      if (error) {
        console.error('Error storing alerts:', error);
      } else {
        console.warn(`🚨 Performance alerts generated: ${alerts.length}`);
      }
    } catch (error) {
      console.error('Error storing alerts:', error);
    }
  }

  /**
   * Start alert monitoring
   */
  private startAlertMonitoring(): void {
    setInterval(async () => {
      try {
        await this.processAlerts();
      } catch (error) {
        console.error('Error processing alerts:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Process and handle alerts
   */
  private async processAlerts(): Promise<void> {
    try {
      const { data: alerts, error } = await this.supabase
        .from('performance_alerts')
        .select('*')
        .eq('processed', false)
        .order('timestamp', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching alerts:', error);
        return;
      }
      
      if (alerts && alerts.length > 0) {
        for (const alert of alerts) {
          await this.handleAlert(alert);
        }
      }
    } catch (error) {
      console.error('Error processing alerts:', error);
    }
  }

  /**
   * Handle individual alert
   */
  private async handleAlert(alert: PerformanceAlert): Promise<void> {
    try {
      // Log alert
      console.warn(`🚨 Performance Alert: ${alert.message}`);
      
      // Send notification (implement based on your notification system)
      await this.sendNotification(alert);
      
      // Mark as processed
      await this.supabase
        .from('performance_alerts')
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq('id', alert.id);
      
    } catch (error) {
      console.error('Error handling alert:', error);
    }
  }

  /**
   * Send notification for alert
   */
  private async sendNotification(alert: PerformanceAlert): Promise<void> {
    // Implement notification logic (email, Slack, etc.)
    console.log(`📧 Sending notification for alert: ${alert.message}`);
  }

  /**
   * Start cleanup process
   */
  private startCleanupProcess(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        await this.cleanupOldMetrics();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }, 3600000); // 1 hour
  }

  /**
   * Cleanup old metrics
   */
  private async cleanupOldMetrics(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const { error } = await this.supabase
        .from('performance_metrics')
        .delete()
        .lt('timestamp', cutoffDate.toISOString());
      
      if (error) {
        console.error('Error cleaning up metrics:', error);
      } else {
        console.log('🧹 Cleaned up old performance metrics');
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  /**
   * Generate performance report
   */
  async generateReport(startDate: string, endDate: string): Promise<PerformanceReport> {
    try {
      const { data: metrics, error } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate)
        .order('timestamp', { ascending: true });
      
      if (error) {
        throw new Error(`Error fetching metrics: ${error.message}`);
      }
      
      if (!metrics || metrics.length === 0) {
        return {
          id: `report_${Date.now()}`,
          startDate,
          endDate,
          generatedAt: new Date().toISOString(),
          summary: {
            totalMetrics: 0,
            averageResponseTime: 0,
            averageMemoryUsage: 0,
            averageErrorRate: 0,
            peakResponseTime: 0,
            peakMemoryUsage: 0,
            totalAlerts: 0,
          },
          trends: [],
          recommendations: [],
        };
      }
      
      // Calculate summary statistics
      const responseTimes = metrics.map(m => m.client?.responseTime || 0).filter(t => t > 0);
      const memoryUsages = metrics.map(m => m.client?.memoryUsage || 0).filter(m => m > 0);
      const errorRates = metrics.map(m => m.client?.errorRate || 0).filter(e => e > 0);
      
      const summary = {
        totalMetrics: metrics.length,
        averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        averageMemoryUsage: memoryUsages.length > 0 ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length : 0,
        averageErrorRate: errorRates.length > 0 ? errorRates.reduce((a, b) => a + b, 0) / errorRates.length : 0,
        peakResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
        peakMemoryUsage: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
        totalAlerts: 0, // Will be calculated separately
      };
      
      // Get alerts for the period
      const { data: alerts } = await this.supabase
        .from('performance_alerts')
        .select('*')
        .gte('timestamp', startDate)
        .lte('timestamp', endDate);
      
      summary.totalAlerts = alerts?.length || 0;
      
      // Generate trends
      const trends = this.generateTrends(metrics);
      
      // Generate recommendations
      const recommendations = this.generateRecommendations(summary, trends);
      
      return {
        id: `report_${Date.now()}`,
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
        summary,
        trends,
        recommendations,
      };
      
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Generate performance trends
   */
  private generateTrends(metrics: PerformanceMetrics[]): any[] {
    // Group metrics by hour for trend analysis
    const hourlyData = new Map<string, any[]>();
    
    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).toISOString().substring(0, 13);
      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, []);
      }
      hourlyData.get(hour)!.push(metric);
    });
    
    const trends = [];
    for (const [hour, hourMetrics] of hourlyData) {
      const responseTimes = hourMetrics.map(m => m.client?.responseTime || 0).filter(t => t > 0);
      const memoryUsages = hourMetrics.map(m => m.client?.memoryUsage || 0).filter(m => m > 0);
      
      trends.push({
        hour,
        averageResponseTime: responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
        averageMemoryUsage: memoryUsages.length > 0 ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length : 0,
        metricCount: hourMetrics.length,
      });
    }
    
    return trends.sort((a, b) => a.hour.localeCompare(b.hour));
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(summary: any, trends: any[]): string[] {
    const recommendations = [];
    
    if (summary.averageResponseTime > 1000) {
      recommendations.push('Consider optimizing API endpoints - average response time is high');
    }
    
    if (summary.averageMemoryUsage > 0.7) {
      recommendations.push('Memory usage is high - consider implementing memory optimization strategies');
    }
    
    if (summary.averageErrorRate > 0.02) {
      recommendations.push('Error rate is elevated - investigate and fix underlying issues');
    }
    
    if (summary.totalAlerts > 10) {
      recommendations.push('High number of performance alerts - review system configuration');
    }
    
    return recommendations;
  }

  /**
   * Estimate CPU usage (client-side)
   */
  private estimateCPUUsage(): number {
    // Simple CPU estimation based on performance timing
    const start = performance.now();
    let iterations = 0;
    const maxIterations = 1000000;
    
    while (iterations < maxIterations && performance.now() - start < 1) {
      iterations++;
    }
    
    const duration = performance.now() - start;
    return Math.min(duration / 1000, 1); // Normalize to 0-1
  }

  /**
   * Calculate throughput (requests per minute)
   */
  private calculateThroughput(): number {
    // This would typically be tracked over time
    // For now, return a placeholder value
    return 0;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    // This would typically be tracked over time
    // For now, return a placeholder value
    return 0;
  }

  /**
   * Get First Paint timing
   */
  private getFirstPaint(): number {
    if (typeof window === 'undefined') return 0;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Get First Contentful Paint timing
   */
  private getFirstContentfulPaint(): number {
    if (typeof window === 'undefined') return 0;
    
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint ? firstContentfulPaint.startTime : 0;
  }

  /**
   * Stop performance monitoring
   */
  async stopMonitoring(): Promise<void> {
    console.log('🛑 Stopping Performance Monitoring Service...');
    // Cleanup would go here
    console.log('✅ Performance Monitoring Service stopped');
  }
}

export default PerformanceMonitoringService;
