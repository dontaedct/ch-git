/**
 * Performance Metrics and Analytics Tracking System
 * Comprehensive performance monitoring for production applications
 */

import { createClient } from '@supabase/supabase-js';

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface APIMetric extends PerformanceMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  ipAddress?: string;
}

export interface DatabaseMetric extends PerformanceMetric {
  query: string;
  queryType: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'OTHER';
  executionTime: number;
  rowsAffected?: number;
  connectionPool?: string;
}

export interface SystemMetric extends PerformanceMetric {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeConnections: number;
}

export interface UserExperienceMetric extends PerformanceMetric {
  page: string;
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  userAgent: string;
  connectionType?: string;
}

export interface MetricsConfig {
  collectionInterval: number; // milliseconds
  retentionPeriod: number; // days
  batchSize: number;
  enableAPIMetrics: boolean;
  enableDatabaseMetrics: boolean;
  enableSystemMetrics: boolean;
  enableUXMetrics: boolean;
  alertThresholds: {
    apiResponseTime: number; // milliseconds
    databaseQueryTime: number; // milliseconds
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    pageLoadTime: number; // milliseconds
  };
}

export class PerformanceMetrics {
  private metrics = new Map<string, number[]>();
  private cacheStats = new Map<string, { hits: number; misses: number; totalRequests: number }>();
  private responseTimeStats = new Map<string, number[]>();
  private errorCounts = new Map<string, number>();

  recordCacheHit(category: string, responseTime: number): void {
    const stats = this.cacheStats.get(category) || { hits: 0, misses: 0, totalRequests: 0 };
    stats.hits++;
    stats.totalRequests++;
    this.cacheStats.set(category, stats);

    const responseTimes = this.responseTimeStats.get(category) || [];
    responseTimes.push(responseTime);
    this.responseTimeStats.set(category, responseTimes);
  }

  recordCacheMiss(category: string, responseTime: number): void {
    const stats = this.cacheStats.get(category) || { hits: 0, misses: 0, totalRequests: 0 };
    stats.misses++;
    stats.totalRequests++;
    this.cacheStats.set(category, stats);

    const responseTimes = this.responseTimeStats.get(category) || [];
    responseTimes.push(responseTime);
    this.responseTimeStats.set(category, responseTimes);
  }

  recordSuccess(category: string, responseTime: number): void {
    const responseTimes = this.responseTimeStats.get(category) || [];
    responseTimes.push(responseTime);
    this.responseTimeStats.set(category, responseTimes);

    const stats = this.cacheStats.get(category) || { hits: 0, misses: 0, totalRequests: 0 };
    stats.totalRequests++;
    this.cacheStats.set(category, stats);
  }

  recordError(category: string, error: any): void {
    const errorCount = this.errorCounts.get(category) || 0;
    this.errorCounts.set(category, errorCount + 1);

    const stats = this.cacheStats.get(category) || { hits: 0, misses: 0, totalRequests: 0 };
    stats.totalRequests++;
    this.cacheStats.set(category, stats);
  }

  getCacheHitRate(category: string): number {
    const stats = this.cacheStats.get(category);
    if (!stats || stats.totalRequests === 0) return 0;
    return (stats.hits / stats.totalRequests) * 100;
  }

  getCacheHits(category: string): number {
    const stats = this.cacheStats.get(category);
    return stats ? stats.hits : 0;
  }

  getCacheMisses(category: string): number {
    const stats = this.cacheStats.get(category);
    return stats ? stats.misses : 0;
  }

  getAverageResponseTime(category: string): number {
    const responseTimes = this.responseTimeStats.get(category);
    if (!responseTimes || responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  getTotalRequests(category: string): number {
    const stats = this.cacheStats.get(category);
    return stats ? stats.totalRequests : 0;
  }

  getSuccessRate(category: string): number {
    const stats = this.cacheStats.get(category);
    const errors = this.errorCounts.get(category) || 0;
    if (!stats || stats.totalRequests === 0) return 100;
    const successCount = stats.totalRequests - errors;
    return (successCount / stats.totalRequests) * 100;
  }

  getFailureRate(category: string): number {
    return 100 - this.getSuccessRate(category);
  }

  clearStats(): void {
    this.metrics.clear();
    this.cacheStats.clear();
    this.responseTimeStats.clear();
    this.errorCounts.clear();
  }
}

export class PerformanceMonitor {
  private config: MetricsConfig;
  private supabase: any;
  private metricsBuffer: PerformanceMetric[] = [];
  private isCollecting: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: Date;

  constructor(config: MetricsConfig) {
    this.config = config;
    this.startTime = new Date();
    
    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Start performance metrics collection
   */
  async start(): Promise<void> {
    if (this.isCollecting) {
      console.warn('Performance monitoring is already running');
      return;
    }

    this.isCollecting = true;
    console.log('Starting performance metrics collection...');

    // Start system metrics collection
    if (this.config.enableSystemMetrics) {
      this.intervalId = setInterval(async () => {
        await this.collectSystemMetrics();
      }, this.config.collectionInterval);
    }

    console.log(`Performance monitoring started with ${this.config.collectionInterval}ms interval`);
  }

  /**
   * Stop performance metrics collection
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isCollecting = false;
    console.log('Performance monitoring stopped');
  }

  /**
   * Record API performance metric
   */
  recordAPIMetric(metric: Omit<APIMetric, 'id' | 'timestamp'>): void {
    if (!this.config.enableAPIMetrics) return;

    const apiMetric: APIMetric = {
      ...metric,
      id: this.generateMetricId(),
      timestamp: new Date(),
    };

    this.addMetric(apiMetric);
    this.checkAPIMetricAlerts(apiMetric);
  }

  /**
   * Record database performance metric
   */
  recordDatabaseMetric(metric: Omit<DatabaseMetric, 'id' | 'timestamp'>): void {
    if (!this.config.enableDatabaseMetrics) return;

    const dbMetric: DatabaseMetric = {
      ...metric,
      id: this.generateMetricId(),
      timestamp: new Date(),
    };

    this.addMetric(dbMetric);
    this.checkDatabaseMetricAlerts(dbMetric);
  }

  /**
   * Record user experience metric
   */
  recordUXMetric(metric: Omit<UserExperienceMetric, 'id' | 'timestamp'>): void {
    if (!this.config.enableUXMetrics) return;

    const uxMetric: UserExperienceMetric = {
      ...metric,
      id: this.generateMetricId(),
      timestamp: new Date(),
    };

    this.addMetric(uxMetric);
    this.checkUXMetricAlerts(uxMetric);
  }

  /**
   * Collect system metrics
   */
  private async collectSystemMetrics(): Promise<void> {
    try {
      const systemMetric: SystemMetric = {
        id: this.generateMetricId(),
        name: 'system_performance',
        value: 0, // Will be calculated based on other values
        unit: 'percentage',
        timestamp: new Date(),
        tags: {
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
        },
        cpuUsage: await this.getCPUUsage(),
        memoryUsage: await this.getMemoryUsage(),
        diskUsage: await this.getDiskUsage(),
        networkIn: await this.getNetworkIn(),
        networkOut: await this.getNetworkOut(),
        activeConnections: await this.getActiveConnections(),
      };

      this.addMetric(systemMetric);
      this.checkSystemMetricAlerts(systemMetric);

    } catch (error) {
      console.error('Failed to collect system metrics:', error);
    }
  }

  /**
   * Get CPU usage percentage
   */
  private async getCPUUsage(): Promise<number> {
    try {
      const { cpuUsage } = process;
      const startUsage = cpuUsage();
      
      // Wait a bit to get a meaningful measurement
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const endUsage = cpuUsage();
      const idle = endUsage.idle - startUsage.idle;
      const total = endUsage.user + endUsage.nice + endUsage.sys + endUsage.idle - 
                   (startUsage.user + startUsage.nice + startUsage.sys + startUsage.idle);
      
      return total > 0 ? (1 - idle / total) * 100 : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get memory usage percentage
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      return (memUsage.heapUsed / totalMem) * 100;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get disk usage percentage
   */
  private async getDiskUsage(): Promise<number> {
    try {
      const { promises: fs } = require('fs');
      const stats = await fs.statfs('/');
      const total = stats.blocks * stats.bsize;
      const free = stats.bavail * stats.bsize;
      return ((total - free) / total) * 100;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get network input bytes
   */
  private async getNetworkIn(): Promise<number> {
    // This would typically read from /proc/net/dev or similar
    // For now, return 0 as a placeholder
    return 0;
  }

  /**
   * Get network output bytes
   */
  private async getNetworkOut(): Promise<number> {
    // This would typically read from /proc/net/dev or similar
    // For now, return 0 as a placeholder
    return 0;
  }

  /**
   * Get active connections count
   */
  private async getActiveConnections(): Promise<number> {
    // This would typically read from netstat or similar
    // For now, return 0 as a placeholder
    return 0;
  }

  /**
   * Add metric to buffer
   */
  private addMetric(metric: PerformanceMetric): void {
    this.metricsBuffer.push(metric);

    // Flush buffer if it reaches batch size
    if (this.metricsBuffer.length >= this.config.batchSize) {
      this.flushMetrics();
    }
  }

  /**
   * Flush metrics buffer to database
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    if (!this.supabase) {
      console.warn('Supabase client not available, metrics will be lost');
      return;
    }

    try {
      // Transform metrics for database storage
      const dbMetrics = metricsToFlush.map(metric => ({
        id: metric.id,
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        tags: metric.tags,
        metadata: metric.metadata,
        timestamp: metric.timestamp.toISOString(),
        // Type-specific fields
        ...(this.isAPIMetric(metric) && {
          endpoint: metric.endpoint,
          method: metric.method,
          status_code: metric.statusCode,
          response_time: metric.responseTime,
          request_size: metric.requestSize,
          response_size: metric.responseSize,
          user_agent: metric.userAgent,
          ip_address: metric.ipAddress,
        }),
        ...(this.isDatabaseMetric(metric) && {
          query: metric.query,
          query_type: metric.queryType,
          execution_time: metric.executionTime,
          rows_affected: metric.rowsAffected,
          connection_pool: metric.connectionPool,
        }),
        ...(this.isSystemMetric(metric) && {
          cpu_usage: metric.cpuUsage,
          memory_usage: metric.memoryUsage,
          disk_usage: metric.diskUsage,
          network_in: metric.networkIn,
          network_out: metric.networkOut,
          active_connections: metric.activeConnections,
        }),
        ...(this.isUXMetric(metric) && {
          page: metric.page,
          load_time: metric.loadTime,
          first_contentful_paint: metric.firstContentfulPaint,
          largest_contentful_paint: metric.largestContentfulPaint,
          cumulative_layout_shift: metric.cumulativeLayoutShift,
          first_input_delay: metric.firstInputDelay,
          time_to_interactive: metric.timeToInteractive,
          user_agent: metric.userAgent,
          connection_type: metric.connectionType,
        }),
      }));

      await this.supabase
        .from('performance_metrics')
        .insert(dbMetrics);

      console.log(`Flushed ${metricsToFlush.length} metrics to database`);

    } catch (error) {
      console.error('Failed to flush metrics to database:', error);
      // Re-add metrics to buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  /**
   * Check API metric alerts
   */
  private checkAPIMetricAlerts(metric: APIMetric): void {
    if (metric.responseTime > this.config.alertThresholds.apiResponseTime) {
      this.sendAlert('API_SLOW_RESPONSE', {
        endpoint: metric.endpoint,
        responseTime: metric.responseTime,
        threshold: this.config.alertThresholds.apiResponseTime,
      });
    }
  }

  /**
   * Check database metric alerts
   */
  private checkDatabaseMetricAlerts(metric: DatabaseMetric): void {
    if (metric.executionTime > this.config.alertThresholds.databaseQueryTime) {
      this.sendAlert('DATABASE_SLOW_QUERY', {
        query: metric.query,
        executionTime: metric.executionTime,
        threshold: this.config.alertThresholds.databaseQueryTime,
      });
    }
  }

  /**
   * Check system metric alerts
   */
  private checkSystemMetricAlerts(metric: SystemMetric): void {
    if (metric.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.sendAlert('HIGH_MEMORY_USAGE', {
        memoryUsage: metric.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage,
      });
    }

    if (metric.cpuUsage > this.config.alertThresholds.cpuUsage) {
      this.sendAlert('HIGH_CPU_USAGE', {
        cpuUsage: metric.cpuUsage,
        threshold: this.config.alertThresholds.cpuUsage,
      });
    }
  }

  /**
   * Check UX metric alerts
   */
  private checkUXMetricAlerts(metric: UserExperienceMetric): void {
    if (metric.loadTime > this.config.alertThresholds.pageLoadTime) {
      this.sendAlert('SLOW_PAGE_LOAD', {
        page: metric.page,
        loadTime: metric.loadTime,
        threshold: this.config.alertThresholds.pageLoadTime,
      });
    }
  }

  /**
   * Send alert
   */
  private async sendAlert(type: string, data: Record<string, any>): Promise<void> {
    console.warn(`Performance alert: ${type}`, data);

    if (this.supabase) {
      try {
        await this.supabase
          .from('performance_alerts')
          .insert({
            alert_type: type,
            alert_data: data,
            created_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to store performance alert:', error);
      }
    }
  }

  /**
   * Type guards
   */
  private isAPIMetric(metric: PerformanceMetric): metric is APIMetric {
    return 'endpoint' in metric && 'method' in metric;
  }

  private isDatabaseMetric(metric: PerformanceMetric): metric is DatabaseMetric {
    return 'query' in metric && 'queryType' in metric;
  }

  private isSystemMetric(metric: PerformanceMetric): metric is SystemMetric {
    return 'cpuUsage' in metric && 'memoryUsage' in metric;
  }

  private isUXMetric(metric: PerformanceMetric): metric is UserExperienceMetric {
    return 'page' in metric && 'loadTime' in metric;
  }

  /**
   * Generate unique metric ID
   */
  private generateMetricId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get performance analytics
   */
  async getPerformanceAnalytics(timeRange: string = '24h'): Promise<any> {
    if (!this.supabase) return {};

    try {
      const hours = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get API metrics
      const { data: apiMetrics } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .not('endpoint', 'is', null);

      // Get database metrics
      const { data: dbMetrics } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .not('query', 'is', null);

      // Get system metrics
      const { data: systemMetrics } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .not('cpu_usage', 'is', null);

      // Get UX metrics
      const { data: uxMetrics } = await this.supabase
        .from('performance_metrics')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .not('page', 'is', null);

      return {
        api: this.analyzeAPIMetrics(apiMetrics || []),
        database: this.analyzeDatabaseMetrics(dbMetrics || []),
        system: this.analyzeSystemMetrics(systemMetrics || []),
        userExperience: this.analyzeUXMetrics(uxMetrics || []),
      };

    } catch (error) {
      console.error('Failed to get performance analytics:', error);
      return {};
    }
  }

  /**
   * Analyze API metrics
   */
  private analyzeAPIMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const responseTimes = metrics.map(m => m.response_time);
    const statusCodes = metrics.map(m => m.status_code);

    return {
      totalRequests: metrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      p95ResponseTime: this.percentile(responseTimes, 0.95),
      p99ResponseTime: this.percentile(responseTimes, 0.99),
      errorRate: (statusCodes.filter(code => code >= 400).length / statusCodes.length) * 100,
      requestsPerMinute: metrics.length / (24 * 60), // Assuming 24h data
      topEndpoints: this.getTopEndpoints(metrics),
    };
  }

  /**
   * Analyze database metrics
   */
  private analyzeDatabaseMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const executionTimes = metrics.map(m => m.execution_time);

    return {
      totalQueries: metrics.length,
      averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length,
      p95ExecutionTime: this.percentile(executionTimes, 0.95),
      p99ExecutionTime: this.percentile(executionTimes, 0.99),
      queriesPerMinute: metrics.length / (24 * 60),
      slowQueries: metrics.filter(m => m.execution_time > this.config.alertThresholds.databaseQueryTime),
    };
  }

  /**
   * Analyze system metrics
   */
  private analyzeSystemMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const cpuUsage = metrics.map(m => m.cpu_usage);
    const memoryUsage = metrics.map(m => m.memory_usage);

    return {
      averageCPUUsage: cpuUsage.reduce((a, b) => a + b, 0) / cpuUsage.length,
      averageMemoryUsage: memoryUsage.reduce((a, b) => a + b, 0) / memoryUsage.length,
      maxCPUUsage: Math.max(...cpuUsage),
      maxMemoryUsage: Math.max(...memoryUsage),
      systemUptime: Date.now() - this.startTime.getTime(),
    };
  }

  /**
   * Analyze UX metrics
   */
  private analyzeUXMetrics(metrics: any[]): any {
    if (metrics.length === 0) return {};

    const loadTimes = metrics.map(m => m.load_time);

    return {
      totalPageViews: metrics.length,
      averageLoadTime: loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length,
      p95LoadTime: this.percentile(loadTimes, 0.95),
      p99LoadTime: this.percentile(loadTimes, 0.99),
      slowPages: metrics.filter(m => m.load_time > this.config.alertThresholds.pageLoadTime),
    };
  }

  /**
   * Get top endpoints by request count
   */
  private getTopEndpoints(metrics: any[]): any[] {
    const endpointCounts = metrics.reduce((acc, metric) => {
      acc[metric.endpoint] = (acc[metric.endpoint] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))
      .slice(0, 10);
  }

  /**
   * Calculate percentile
   */
  private percentile(arr: number[], p: number): number {
    const sorted = arr.sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[index] || 0;
  }

  /**
   * Parse time range string
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/(\d+)([hdwm])/);
    if (!match) return 24; // Default to 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value;
      case 'd': return value * 24;
      case 'w': return value * 24 * 7;
      case 'm': return value * 24 * 30;
      default: return 24;
    }
  }
}

/**
 * Default performance monitoring configuration
 */
export const defaultPerformanceConfig: MetricsConfig = {
  collectionInterval: 30000, // 30 seconds
  retentionPeriod: 30, // 30 days
  batchSize: 100,
  enableAPIMetrics: true,
  enableDatabaseMetrics: true,
  enableSystemMetrics: true,
  enableUXMetrics: true,
  alertThresholds: {
    apiResponseTime: 2000, // 2 seconds
    databaseQueryTime: 1000, // 1 second
    memoryUsage: 80, // 80%
    cpuUsage: 80, // 80%
    pageLoadTime: 3000, // 3 seconds
  },
};

/**
 * Create and start performance monitor
 */
export async function startPerformanceMonitoring(config?: Partial<MetricsConfig>): Promise<PerformanceMonitor> {
  const finalConfig = { ...defaultPerformanceConfig, ...config };
  const monitor = new PerformanceMonitor(finalConfig);
  await monitor.start();
  return monitor;
}
