/**
 * Shared Analytics Caching Strategy
 * HT-034.8.1 - Deploy shared caching strategy for analytics systems
 *
 * Implements a unified caching layer across all analytics systems to prevent
 * conflicts and optimize performance through intelligent cache coordination.
 */

import { intelligentCache } from './intelligent-cache';
import { analyticsCoordinator } from './analytics-coordinator';

export interface AnalyticsCacheConfig {
  namespace: string;
  defaultTtl: number;
  priority: number;
  tags: string[];
  invalidationRules: CacheInvalidationRule[];
}

export interface CacheInvalidationRule {
  pattern: string | RegExp;
  triggers: string[];
  cascade: boolean;
  delay: number;
}

export interface AnalyticsCacheEntry {
  data: any;
  metadata: {
    source: string;
    computationTime: number;
    dependencies: string[];
    lastUpdated: Date;
    accessCount: number;
  };
}

export interface CachePerformanceMetrics {
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  invalidationCount: number;
  conflictCount: number;
}

export class SharedAnalyticsCache {
  private cacheConfigs = new Map<string, AnalyticsCacheConfig>();
  private performanceMetrics = new Map<string, CachePerformanceMetrics>();
  private dependencyGraph = new Map<string, Set<string>>();
  private invalidationQueue: Array<{
    pattern: string;
    trigger: string;
    timestamp: Date;
    processed: boolean;
  }> = [];

  constructor() {
    this.initializeAnalyticsCacheConfigs();
    this.setupInvalidationRules();
    this.startCacheMonitoring();
  }

  /**
   * Cache analytics data with intelligent coordination
   */
  async cacheAnalyticsData(
    key: string,
    data: any,
    options: {
      source: string;
      computationTime?: number;
      dependencies?: string[];
      ttl?: number;
      priority?: number;
      tags?: string[];
    }
  ): Promise<void> {
    const config = this.getCacheConfig(options.source);
    const ttl = options.ttl || config.defaultTtl;
    const priority = options.priority || config.priority;
    const tags = [...(options.tags || []), ...config.tags];

    const cacheEntry: AnalyticsCacheEntry = {
      data,
      metadata: {
        source: options.source,
        computationTime: options.computationTime || 0,
        dependencies: options.dependencies || [],
        lastUpdated: new Date(),
        accessCount: 0
      }
    };

    // Store dependencies in graph
    if (options.dependencies) {
      this.dependencyGraph.set(key, new Set(options.dependencies));
    }

    // Cache with intelligent placement
    await intelligentCache.set(`analytics_${key}`, cacheEntry, {
      ttl,
      priority,
      tags,
      layers: this.selectOptimalLayers(data, priority),
      dependencies: options.dependencies
    });

    // Update performance metrics
    this.updateCacheMetrics(options.source, 'cache_set');
  }

  /**
   * Retrieve cached analytics data with fallback
   */
  async getCachedAnalyticsData<T>(
    key: string,
    fallback?: () => Promise<T>,
    options: {
      source: string;
      updateCache?: boolean;
      maxAge?: number;
    } = { source: 'unknown' }
  ): Promise<T | null> {
    const startTime = Date.now();

    try {
      const cachedEntry = await intelligentCache.get<AnalyticsCacheEntry>(
        `analytics_${key}`,
        {
          fallback: fallback ? async () => {
            const data = await fallback();
            return {
              data,
              metadata: {
                source: options.source,
                computationTime: Date.now() - startTime,
                dependencies: [],
                lastUpdated: new Date(),
                accessCount: 1
              }
            };
          } : undefined,
          updateCache: options.updateCache,
          tags: ['analytics', options.source]
        }
      );

      if (cachedEntry) {
        // Check max age if specified
        if (options.maxAge) {
          const age = Date.now() - cachedEntry.metadata.lastUpdated.getTime();
          if (age > options.maxAge) {
            this.updateCacheMetrics(options.source, 'cache_expired');
            return null;
          }
        }

        // Update access count
        cachedEntry.metadata.accessCount++;

        this.updateCacheMetrics(options.source, 'cache_hit', Date.now() - startTime);
        return cachedEntry.data as T;
      }

      this.updateCacheMetrics(options.source, 'cache_miss', Date.now() - startTime);
      return null;

    } catch (error) {
      console.error('Cache retrieval error:', error);
      this.updateCacheMetrics(options.source, 'cache_error');
      return null;
    }
  }

  /**
   * Coordinate analytics query with caching
   */
  async coordinatedAnalyticsQuery<T>(
    queryKey: string,
    queryFunction: () => Promise<T>,
    options: {
      source: string;
      priority?: number;
      cacheStrategy?: 'aggressive' | 'conservative' | 'none';
      dependencies?: string[];
      tags?: string[];
      ttl?: number;
    }
  ): Promise<T> {
    const {
      source,
      priority = 5,
      cacheStrategy = 'aggressive',
      dependencies = [],
      tags = [],
      ttl = 300000 // 5 minutes default
    } = options;

    // Check cache first if strategy allows
    if (cacheStrategy !== 'none') {
      const cached = await this.getCachedAnalyticsData<T>(queryKey, undefined, { source });
      if (cached !== null) {
        return cached;
      }
    }

    // Execute coordinated query
    const startTime = Date.now();
    const result = await analyticsCoordinator.executeCoordinatedQuery(
      source,
      queryKey,
      queryFunction,
      {
        priority,
        useSharedCache: cacheStrategy !== 'none',
        cacheKey: `coord_${queryKey}`,
        timeout: 30000
      }
    );

    // Cache result if strategy allows
    if (cacheStrategy !== 'none') {
      await this.cacheAnalyticsData(queryKey, result, {
        source,
        computationTime: Date.now() - startTime,
        dependencies,
        ttl,
        priority,
        tags
      });
    }

    return result;
  }

  /**
   * Invalidate analytics cache by pattern
   */
  async invalidateAnalyticsCache(
    pattern: string | string[],
    options: {
      trigger?: string;
      cascade?: boolean;
      delay?: number;
      source?: string;
    } = {}
  ): Promise<number> {
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const trigger = options.trigger || 'manual';
    const cascade = options.cascade !== false;
    const delay = options.delay || 0;

    // Add to invalidation queue
    for (const pat of patterns) {
      this.invalidationQueue.push({
        pattern: pat,
        trigger,
        timestamp: new Date(),
        processed: false
      });
    }

    // Process invalidation with delay
    if (delay > 0) {
      setTimeout(() => this.processInvalidationQueue(), delay);
    } else {
      await this.processInvalidationQueue();
    }

    // Invalidate in intelligent cache
    const analyticsPatterns = patterns.map(p => `analytics_${p}`);
    const invalidated = await intelligentCache.invalidate(analyticsPatterns, {
      cascade,
      reason: `Analytics invalidation: ${trigger}`
    });

    // Update metrics
    if (options.source) {
      this.updateCacheMetrics(options.source, 'cache_invalidation');
    }

    return invalidated;
  }

  /**
   * Warm up analytics cache with common queries
   */
  async warmUpAnalyticsCache(): Promise<{
    warmedQueries: number;
    cacheHitRateImprovement: number;
    performanceGain: number;
  }> {
    const beforeHitRate = this.getOverallHitRate();
    const startTime = Date.now();

    const warmupQueries = [
      {
        key: 'business_metrics_global',
        dataLoader: async () => this.loadBusinessMetrics(),
        priority: 9,
        tags: ['business_metrics', 'global'],
        source: 'business-analytics'
      },
      {
        key: 'performance_system_health',
        dataLoader: async () => this.loadSystemHealth(),
        priority: 8,
        tags: ['performance', 'health'],
        source: 'performance-monitor'
      },
      {
        key: 'template_usage_stats',
        dataLoader: async () => this.loadTemplateStats(),
        priority: 7,
        tags: ['templates', 'usage'],
        source: 'template-analytics'
      },
      {
        key: 'client_analytics_summary',
        dataLoader: async () => this.loadClientSummary(),
        priority: 8,
        tags: ['clients', 'summary'],
        source: 'client-analytics'
      }
    ];

    let warmedQueries = 0;
    for (const query of warmupQueries) {
      try {
        const data = await query.dataLoader();
        await this.cacheAnalyticsData(query.key, data, {
          source: query.source,
          priority: query.priority,
          tags: query.tags,
          ttl: 600000 // 10 minutes for warmup data
        });
        warmedQueries++;
      } catch (error) {
        console.error(`Failed to warm up cache for ${query.key}:`, error);
      }
    }

    const afterHitRate = this.getOverallHitRate();
    const performanceGain = Date.now() - startTime;

    return {
      warmedQueries,
      cacheHitRateImprovement: afterHitRate - beforeHitRate,
      performanceGain
    };
  }

  /**
   * Get cache performance analytics
   */
  getCachePerformanceAnalytics(): {
    overallMetrics: CachePerformanceMetrics;
    systemMetrics: { [source: string]: CachePerformanceMetrics };
    recommendations: string[];
  } {
    const systems = Array.from(this.performanceMetrics.keys());
    const overallMetrics = this.calculateOverallMetrics();
    const systemMetrics = Object.fromEntries(this.performanceMetrics);
    const recommendations = this.generateCacheRecommendations();

    return {
      overallMetrics,
      systemMetrics,
      recommendations
    };
  }

  // Private implementation methods

  private initializeAnalyticsCacheConfigs(): void {
    // Business Analytics Cache Config
    this.cacheConfigs.set('business-analytics', {
      namespace: 'business',
      defaultTtl: 300000, // 5 minutes
      priority: 8,
      tags: ['business', 'metrics', 'revenue'],
      invalidationRules: [
        {
          pattern: /^business_metrics_.*$/,
          triggers: ['revenue_update', 'client_change'],
          cascade: true,
          delay: 5000
        }
      ]
    });

    // Performance Analytics Cache Config
    this.cacheConfigs.set('performance-analytics', {
      namespace: 'performance',
      defaultTtl: 60000, // 1 minute (more frequent updates)
      priority: 9,
      tags: ['performance', 'monitoring', 'health'],
      invalidationRules: [
        {
          pattern: /^performance_.*$/,
          triggers: ['system_update', 'health_change'],
          cascade: false,
          delay: 0
        }
      ]
    });

    // Template Analytics Cache Config
    this.cacheConfigs.set('template-analytics', {
      namespace: 'templates',
      defaultTtl: 600000, // 10 minutes
      priority: 6,
      tags: ['templates', 'usage', 'analytics'],
      invalidationRules: [
        {
          pattern: /^template_.*$/,
          triggers: ['template_update', 'usage_change'],
          cascade: true,
          delay: 2000
        }
      ]
    });

    // Client Analytics Cache Config
    this.cacheConfigs.set('client-analytics', {
      namespace: 'clients',
      defaultTtl: 300000, // 5 minutes
      priority: 7,
      tags: ['clients', 'analytics', 'behavior'],
      invalidationRules: [
        {
          pattern: /^client_.*$/,
          triggers: ['client_update', 'behavior_change'],
          cascade: true,
          delay: 3000
        }
      ]
    });
  }

  private setupInvalidationRules(): void {
    // Setup automatic invalidation based on system events
    // This would integrate with event system when available
  }

  private startCacheMonitoring(): void {
    // Monitor cache performance every 30 seconds
    setInterval(() => {
      this.collectCacheMetrics();
    }, 30000);

    // Process invalidation queue every 10 seconds
    setInterval(() => {
      this.processInvalidationQueue();
    }, 10000);

    // Optimize cache every 5 minutes
    setInterval(() => {
      this.optimizeCachePerformance();
    }, 300000);
  }

  private getCacheConfig(source: string): AnalyticsCacheConfig {
    return this.cacheConfigs.get(source) || {
      namespace: 'default',
      defaultTtl: 300000,
      priority: 5,
      tags: ['analytics'],
      invalidationRules: []
    };
  }

  private selectOptimalLayers(data: any, priority: number): string[] {
    const size = JSON.stringify(data).length;

    if (priority >= 8 || size < 10000) {
      return ['memory', 'redis'];
    } else if (priority >= 6) {
      return ['redis'];
    } else {
      return ['redis', 'disk'];
    }
  }

  private updateCacheMetrics(source: string, operation: string, responseTime?: number): void {
    if (!this.performanceMetrics.has(source)) {
      this.performanceMetrics.set(source, {
        hitRate: 0,
        missRate: 0,
        avgResponseTime: 0,
        memoryUsage: 0,
        invalidationCount: 0,
        conflictCount: 0
      });
    }

    const metrics = this.performanceMetrics.get(source)!;

    switch (operation) {
      case 'cache_hit':
        metrics.hitRate = Math.min(100, metrics.hitRate + 0.1);
        if (responseTime) metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
        break;
      case 'cache_miss':
        metrics.missRate = Math.min(100, metrics.missRate + 0.1);
        if (responseTime) metrics.avgResponseTime = (metrics.avgResponseTime + responseTime) / 2;
        break;
      case 'cache_invalidation':
        metrics.invalidationCount++;
        break;
      case 'cache_error':
        metrics.conflictCount++;
        break;
    }
  }

  private async processInvalidationQueue(): Promise<void> {
    const unprocessed = this.invalidationQueue.filter(item => !item.processed);

    for (const item of unprocessed) {
      try {
        await this.executeInvalidation(item.pattern, item.trigger);
        item.processed = true;
      } catch (error) {
        console.error('Invalidation processing error:', error);
      }
    }

    // Clean up processed items older than 1 hour
    const oneHourAgo = Date.now() - 3600000;
    this.invalidationQueue = this.invalidationQueue.filter(
      item => !item.processed || item.timestamp.getTime() > oneHourAgo
    );
  }

  private async executeInvalidation(pattern: string, trigger: string): Promise<void> {
    // Execute the actual invalidation logic
    console.log(`Executing cache invalidation for pattern: ${pattern}, trigger: ${trigger}`);
  }

  private getOverallHitRate(): number {
    const metrics = Array.from(this.performanceMetrics.values());
    if (metrics.length === 0) return 0;

    return metrics.reduce((sum, m) => sum + m.hitRate, 0) / metrics.length;
  }

  private calculateOverallMetrics(): CachePerformanceMetrics {
    const allMetrics = Array.from(this.performanceMetrics.values());

    return {
      hitRate: allMetrics.reduce((sum, m) => sum + m.hitRate, 0) / allMetrics.length || 0,
      missRate: allMetrics.reduce((sum, m) => sum + m.missRate, 0) / allMetrics.length || 0,
      avgResponseTime: allMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / allMetrics.length || 0,
      memoryUsage: allMetrics.reduce((sum, m) => sum + m.memoryUsage, 0),
      invalidationCount: allMetrics.reduce((sum, m) => sum + m.invalidationCount, 0),
      conflictCount: allMetrics.reduce((sum, m) => sum + m.conflictCount, 0)
    };
  }

  private generateCacheRecommendations(): string[] {
    const recommendations: string[] = [];
    const overallHitRate = this.getOverallHitRate();

    if (overallHitRate < 70) {
      recommendations.push('Increase cache TTL for stable data');
      recommendations.push('Implement more aggressive cache warming');
    }

    if (overallHitRate > 95) {
      recommendations.push('Consider reducing cache TTL to ensure data freshness');
    }

    const highConflictSystems = Array.from(this.performanceMetrics.entries())
      .filter(([_, metrics]) => metrics.conflictCount > 10);

    if (highConflictSystems.length > 0) {
      recommendations.push(`Optimize cache invalidation for: ${highConflictSystems.map(([source]) => source).join(', ')}`);
    }

    return recommendations;
  }

  private collectCacheMetrics(): void {
    // Collect and update cache performance metrics
  }

  private optimizeCachePerformance(): void {
    // Run cache optimization routines
  }

  // Mock data loaders for warmup (would be replaced with real data loaders)
  private async loadBusinessMetrics(): Promise<any> {
    return { revenue: 100000, clients: 50, growth: 15 };
  }

  private async loadSystemHealth(): Promise<any> {
    return { status: 'healthy', uptime: 99.9, responseTime: 250 };
  }

  private async loadTemplateStats(): Promise<any> {
    return { totalTemplates: 25, activeTemplates: 18, usage: 75 };
  }

  private async loadClientSummary(): Promise<any> {
    return { totalClients: 50, activeClients: 42, satisfaction: 4.8 };
  }
}

// Export singleton instance
export const sharedAnalyticsCache = new SharedAnalyticsCache();

// Export convenience functions
export async function cacheAnalytics<T>(
  key: string,
  data: T,
  source: string,
  options?: {
    ttl?: number;
    priority?: number;
    dependencies?: string[];
  }
): Promise<void> {
  return sharedAnalyticsCache.cacheAnalyticsData(key, data, {
    source,
    ...options
  });
}

export async function getCachedAnalytics<T>(
  key: string,
  source: string,
  fallback?: () => Promise<T>
): Promise<T | null> {
  return sharedAnalyticsCache.getCachedAnalyticsData(key, fallback, { source });
}

export async function coordinatedQuery<T>(
  key: string,
  queryFunction: () => Promise<T>,
  source: string,
  options?: {
    priority?: number;
    cacheStrategy?: 'aggressive' | 'conservative' | 'none';
  }
): Promise<T> {
  return sharedAnalyticsCache.coordinatedAnalyticsQuery(key, queryFunction, {
    source,
    ...options
  });
}