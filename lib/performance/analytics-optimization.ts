/**
 * Analytics Performance Optimization
 * Optimizes analytics data processing, aggregation, and query performance
 */

import { PerformanceMetrics } from '../monitoring/performance-metrics';

export interface AnalyticsQuery {
  id: string;
  type: 'realtime' | 'historical' | 'aggregated';
  clientId?: string;
  dateRange: { start: Date; end: Date };
  metrics: string[];
  filters: Record<string, any>;
  cacheKey?: string;
}

export interface QueryResult {
  queryId: string;
  data: any;
  executionTime: number;
  cacheHit: boolean;
  dataPoints: number;
  generatedAt: Date;
}

export interface OptimizationConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxConcurrentQueries: number;
  enableDataPrecomputation: boolean;
  enableQueryOptimization: boolean;
  enableResultCompression: boolean;
}

export class AnalyticsOptimizer {
  private queryCache = new Map<string, { result: QueryResult; expiresAt: Date }>();
  private activeQueries = new Map<string, Promise<QueryResult>>();
  private precomputedData = new Map<string, any>();
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;

  constructor(config: OptimizationConfig) {
    this.config = config;
    this.metrics = new PerformanceMetrics();

    // Start background tasks
    if (config.enableDataPrecomputation) {
      this.startPrecomputationScheduler();
    }

    // Start cache cleanup
    setInterval(() => this.cleanupExpiredCache(), 300000); // Every 5 minutes
  }

  async executeOptimizedQuery(query: AnalyticsQuery): Promise<QueryResult> {
    const startTime = performance.now();

    try {
      // Generate cache key
      query.cacheKey = this.generateCacheKey(query);

      // Check cache first
      if (this.config.cacheEnabled) {
        const cached = this.getCachedResult(query.cacheKey);
        if (cached) {
          this.metrics.recordCacheHit('analytics', performance.now() - startTime);
          return cached;
        }
      }

      // Check for duplicate queries
      const existingQuery = this.activeQueries.get(query.cacheKey);
      if (existingQuery) {
        return await existingQuery;
      }

      // Execute optimized query
      const queryPromise = this.performOptimizedQuery(query);
      this.activeQueries.set(query.cacheKey, queryPromise);

      const result = await queryPromise;

      // Cache the result
      if (this.config.cacheEnabled) {
        this.cacheResult(query.cacheKey, result);
      }

      this.metrics.recordCacheMiss('analytics', performance.now() - startTime);
      return result;
    } catch (error) {
      this.metrics.recordError('analytics_query', error);
      throw error;
    } finally {
      this.activeQueries.delete(query.cacheKey!);
    }
  }

  private async performOptimizedQuery(query: AnalyticsQuery): Promise<QueryResult> {
    const executionStartTime = performance.now();

    // Apply query optimizations
    const optimizedQuery = this.optimizeQuery(query);

    // Check for precomputed data
    if (this.config.enableDataPrecomputation) {
      const precomputed = this.checkPrecomputedData(optimizedQuery);
      if (precomputed) {
        return this.createResultFromPrecomputed(query, precomputed, executionStartTime);
      }
    }

    // Execute the actual query
    const rawData = await this.executeQuery(optimizedQuery);

    // Apply post-processing optimizations
    const processedData = this.optimizeResultProcessing(rawData);

    const executionTime = performance.now() - executionStartTime;

    return {
      queryId: query.id,
      data: processedData,
      executionTime,
      cacheHit: false,
      dataPoints: this.countDataPoints(processedData),
      generatedAt: new Date()
    };
  }

  private optimizeQuery(query: AnalyticsQuery): AnalyticsQuery {
    if (!this.config.enableQueryOptimization) return query;

    const optimized = { ...query };

    // Optimize date range for better performance
    optimized.dateRange = this.optimizeDateRange(query.dateRange);

    // Optimize metrics selection
    optimized.metrics = this.optimizeMetrics(query.metrics);

    // Optimize filters
    optimized.filters = this.optimizeFilters(query.filters);

    return optimized;
  }

  private optimizeDateRange(dateRange: { start: Date; end: Date }): { start: Date; end: Date } {
    // Round to optimal boundaries for database performance
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    // Round start to beginning of hour
    start.setMinutes(0, 0, 0);

    // Round end to end of hour
    end.setMinutes(59, 59, 999);

    return { start, end };
  }

  private optimizeMetrics(metrics: string[]): string[] {
    // Remove redundant metrics that can be calculated from others
    const optimized = [...metrics];

    // Remove percentage metrics if we have the base counts
    if (optimized.includes('conversion_count') && optimized.includes('total_visitors')) {
      const conversionRateIndex = optimized.indexOf('conversion_rate');
      if (conversionRateIndex >= 0) {
        optimized.splice(conversionRateIndex, 1);
      }
    }

    return optimized;
  }

  private optimizeFilters(filters: Record<string, any>): Record<string, any> {
    const optimized = { ...filters };

    // Convert arrays to more efficient filter types
    Object.keys(optimized).forEach(key => {
      if (Array.isArray(optimized[key]) && optimized[key].length === 1) {
        optimized[key] = optimized[key][0];
      }
    });

    return optimized;
  }

  private async executeQuery(query: AnalyticsQuery): Promise<any> {
    // Simulate database query execution
    const complexity = this.calculateQueryComplexity(query);
    const executionTime = Math.max(50, complexity * 10); // Minimum 50ms

    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Generate mock data based on query
    return this.generateMockAnalyticsData(query);
  }

  private calculateQueryComplexity(query: AnalyticsQuery): number {
    let complexity = 1;

    // Date range affects complexity
    const daysDifference = Math.ceil(
      (query.dateRange.end.getTime() - query.dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    complexity += Math.min(daysDifference / 10, 10);

    // Number of metrics affects complexity
    complexity += query.metrics.length * 0.5;

    // Number of filters affects complexity
    complexity += Object.keys(query.filters).length * 0.3;

    return complexity;
  }

  private generateMockAnalyticsData(query: AnalyticsQuery): any {
    const data: any = {};

    query.metrics.forEach(metric => {
      data[metric] = Math.floor(Math.random() * 1000) + 100;
    });

    return {
      metrics: data,
      timeSeriesData: this.generateTimeSeriesData(query),
      aggregations: this.generateAggregations(query)
    };
  }

  private generateTimeSeriesData(query: AnalyticsQuery): any[] {
    const points = [];
    const start = query.dateRange.start.getTime();
    const end = query.dateRange.end.getTime();
    const interval = Math.max((end - start) / 100, 3600000); // At least 1 hour intervals

    for (let time = start; time <= end; time += interval) {
      const point: any = { timestamp: new Date(time) };
      query.metrics.forEach(metric => {
        point[metric] = Math.floor(Math.random() * 100);
      });
      points.push(point);
    }

    return points;
  }

  private generateAggregations(query: AnalyticsQuery): any {
    const aggregations: any = {};

    query.metrics.forEach(metric => {
      aggregations[metric] = {
        sum: Math.floor(Math.random() * 10000),
        avg: Math.floor(Math.random() * 100),
        min: Math.floor(Math.random() * 10),
        max: Math.floor(Math.random() * 200) + 100
      };
    });

    return aggregations;
  }

  private optimizeResultProcessing(data: any): any {
    if (!this.config.enableResultCompression) return data;

    // Apply result optimizations
    const optimized = { ...data };

    // Compress time series data
    if (optimized.timeSeriesData) {
      optimized.timeSeriesData = this.compressTimeSeriesData(optimized.timeSeriesData);
    }

    return optimized;
  }

  private compressTimeSeriesData(timeSeriesData: any[]): any[] {
    // Remove consecutive duplicate values to reduce data size
    const compressed = [];
    let lastValues: any = {};

    for (const point of timeSeriesData) {
      const shouldInclude = Object.keys(point).some(key => {
        if (key === 'timestamp') return false;
        return point[key] !== lastValues[key];
      });

      if (shouldInclude || compressed.length === 0) {
        compressed.push(point);
        lastValues = { ...point };
      }
    }

    return compressed;
  }

  private generateCacheKey(query: AnalyticsQuery): string {
    const keyComponents = [
      query.type,
      query.clientId || 'all',
      query.dateRange.start.toISOString(),
      query.dateRange.end.toISOString(),
      query.metrics.sort().join(','),
      JSON.stringify(query.filters)
    ];

    return btoa(keyComponents.join('|')).replace(/[+/=]/g, '');
  }

  private getCachedResult(cacheKey: string): QueryResult | null {
    const cached = this.queryCache.get(cacheKey);
    if (!cached) return null;

    if (new Date() > cached.expiresAt) {
      this.queryCache.delete(cacheKey);
      return null;
    }

    return { ...cached.result, cacheHit: true };
  }

  private cacheResult(cacheKey: string, result: QueryResult): void {
    const expiresAt = new Date(Date.now() + this.config.cacheTTL);
    this.queryCache.set(cacheKey, { result, expiresAt });
  }

  private cleanupExpiredCache(): void {
    const now = new Date();
    const keysToDelete: string[] = [];

    for (const [key, cached] of this.queryCache.entries()) {
      if (now > cached.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.queryCache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired analytics cache entries`);
    }
  }

  private startPrecomputationScheduler(): void {
    // Schedule precomputation of common queries
    setInterval(() => {
      this.precomputeCommonQueries();
    }, 900000); // Every 15 minutes
  }

  private async precomputeCommonQueries(): Promise<void> {
    const commonQueries = [
      { type: 'realtime', metrics: ['page_views', 'unique_visitors'] },
      { type: 'historical', metrics: ['conversions', 'revenue'] }
    ];

    for (const queryTemplate of commonQueries) {
      try {
        const query: AnalyticsQuery = {
          id: `precompute_${Date.now()}`,
          type: queryTemplate.type as any,
          dateRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            end: new Date()
          },
          metrics: queryTemplate.metrics,
          filters: {}
        };

        const result = await this.executeOptimizedQuery(query);
        this.precomputedData.set(this.generateCacheKey(query), result);
      } catch (error) {
        console.warn('Failed to precompute query:', error);
      }
    }
  }

  private checkPrecomputedData(query: AnalyticsQuery): QueryResult | null {
    return this.precomputedData.get(this.generateCacheKey(query)) || null;
  }

  private createResultFromPrecomputed(
    query: AnalyticsQuery,
    precomputed: QueryResult,
    executionStartTime: number
  ): QueryResult {
    return {
      ...precomputed,
      queryId: query.id,
      executionTime: performance.now() - executionStartTime,
      cacheHit: true,
      generatedAt: new Date()
    };
  }

  private countDataPoints(data: any): number {
    if (data.timeSeriesData) {
      return data.timeSeriesData.length;
    }
    return Object.keys(data.metrics || {}).length;
  }

  getOptimizationStats() {
    return {
      cacheSize: this.queryCache.size,
      activeQueries: this.activeQueries.size,
      precomputedDataSize: this.precomputedData.size,
      cacheHitRate: this.metrics.getCacheHitRate('analytics'),
      averageQueryTime: this.metrics.getAverageResponseTime('analytics'),
      totalQueries: this.metrics.getTotalRequests('analytics')
    };
  }

  clearCache(): void {
    this.queryCache.clear();
    this.precomputedData.clear();
  }
}

export default AnalyticsOptimizer;