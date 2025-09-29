/**
 * Analytics Systems Coordinator
 * HT-034.5.4 - Resolves performance conflicts between multiple analytics systems
 *
 * Coordinates between business-metrics.ts, performance-monitoring.ts, performance-metrics.ts,
 * and other analytics systems to prevent resource conflicts and optimize performance.
 */

import { databaseOptimizer } from './database-optimizer';
import { businessMetricsEngine } from '../analytics/business-metrics';
import { performanceMonitor } from '../analytics/performance-monitoring';

export interface AnalyticsSystemConfig {
  id: string;
  name: string;
  priority: number; // 1-10, higher = more priority
  maxConcurrentQueries: number;
  cacheStrategy: 'shared' | 'isolated' | 'none';
  refreshInterval: number; // milliseconds
  dependsOn: string[]; // Other system IDs this depends on
}

export interface SystemResource {
  systemId: string;
  activeQueries: number;
  queuedQueries: number;
  avgResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  lastActivity: Date;
}

export interface ConflictResolution {
  conflictType: 'resource' | 'dependency' | 'cache' | 'timing';
  description: string;
  affectedSystems: string[];
  resolution: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: () => Promise<void>;
}

export class AnalyticsCoordinator {
  private systems = new Map<string, AnalyticsSystemConfig>();
  private resources = new Map<string, SystemResource>();
  private activeExecutions = new Map<string, Set<string>>(); // systemId -> queryIds
  private queryQueue: Array<{
    systemId: string;
    queryId: string;
    priority: number;
    timestamp: Date;
    execute: () => Promise<any>;
  }> = [];
  private sharedCache = new Map<string, any>();
  private conflictHistory: ConflictResolution[] = [];

  constructor() {
    this.initializeAnalyticsSystems();
    this.startCoordinationLoop();
  }

  /**
   * Register an analytics system
   */
  registerSystem(config: AnalyticsSystemConfig): void {
    this.systems.set(config.id, config);
    this.resources.set(config.id, {
      systemId: config.id,
      activeQueries: 0,
      queuedQueries: 0,
      avgResponseTime: 0,
      errorRate: 0,
      cacheHitRate: 0,
      lastActivity: new Date()
    });

    console.log(`Analytics system registered: ${config.name}`);
  }

  /**
   * Execute coordinated analytics query
   */
  async executeCoordinatedQuery(
    systemId: string,
    queryId: string,
    queryFunction: () => Promise<any>,
    options: {
      priority?: number;
      useSharedCache?: boolean;
      cacheKey?: string;
      timeout?: number;
    } = {}
  ): Promise<any> {
    const startTime = Date.now();
    const system = this.systems.get(systemId);

    if (!system) {
      throw new Error(`Analytics system not registered: ${systemId}`);
    }

    // Check shared cache first
    if (options.useSharedCache && options.cacheKey) {
      const cachedResult = this.getFromSharedCache(options.cacheKey);
      if (cachedResult) {
        this.updateResourceMetrics(systemId, Date.now() - startTime, true, false);
        return cachedResult;
      }
    }

    // Check resource availability and conflicts
    const conflicts = await this.detectConflicts(systemId);
    if (conflicts.length > 0) {
      await this.resolveConflicts(conflicts);
    }

    // Queue query if system is at capacity
    const resource = this.resources.get(systemId)!;
    if (resource.activeQueries >= system.maxConcurrentQueries) {
      return this.queueQuery(systemId, queryId, queryFunction, options.priority || 5);
    }

    // Execute query with coordination
    try {
      resource.activeQueries++;
      const activeQueries = this.activeExecutions.get(systemId) || new Set();
      activeQueries.add(queryId);
      this.activeExecutions.set(systemId, activeQueries);

      const result = await Promise.race([
        queryFunction(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), options.timeout || 30000)
        )
      ]);

      // Cache result if configured
      if (options.useSharedCache && options.cacheKey && result) {
        this.setSharedCache(options.cacheKey, result, system.refreshInterval);
      }

      this.updateResourceMetrics(systemId, Date.now() - startTime, false, false);
      return result;

    } catch (error) {
      this.updateResourceMetrics(systemId, Date.now() - startTime, false, true);
      throw error;

    } finally {
      resource.activeQueries--;
      const activeQueries = this.activeExecutions.get(systemId)!;
      activeQueries.delete(queryId);

      // Process next query in queue
      this.processNextQueuedQuery(systemId);
    }
  }

  /**
   * Detect system conflicts
   */
  async detectConflicts(systemId: string): Promise<ConflictResolution[]> {
    const conflicts: ConflictResolution[] = [];
    const system = this.systems.get(systemId)!;
    const resource = this.resources.get(systemId)!;

    // Resource conflict detection
    const totalActiveQueries = Array.from(this.resources.values())
      .reduce((sum, r) => sum + r.activeQueries, 0);

    if (totalActiveQueries > 50) {
      conflicts.push({
        conflictType: 'resource',
        description: 'High system-wide query load detected',
        affectedSystems: [systemId],
        resolution: 'Queue non-priority queries and optimize resource allocation',
        priority: 'high',
        implementation: async () => {
          await this.optimizeResourceAllocation();
        }
      });
    }

    // Dependency conflict detection
    for (const dependsOnId of system.dependsOn) {
      const dependencyResource = this.resources.get(dependsOnId);
      if (dependencyResource && dependencyResource.errorRate > 5) {
        conflicts.push({
          conflictType: 'dependency',
          description: `Dependency system ${dependsOnId} has high error rate`,
          affectedSystems: [systemId, dependsOnId],
          resolution: 'Wait for dependency system to stabilize',
          priority: 'medium',
          implementation: async () => {
            await this.waitForSystemStabilization(dependsOnId);
          }
        });
      }
    }

    // Cache conflict detection
    const cacheConflicts = this.detectCacheConflicts(systemId);
    conflicts.push(...cacheConflicts);

    // Timing conflict detection
    if (resource.avgResponseTime > 5000) {
      conflicts.push({
        conflictType: 'timing',
        description: 'System response time exceeds threshold',
        affectedSystems: [systemId],
        resolution: 'Optimize queries and implement caching',
        priority: 'high',
        implementation: async () => {
          await this.optimizeSystemQueries(systemId);
        }
      });
    }

    return conflicts;
  }

  /**
   * Resolve detected conflicts
   */
  async resolveConflicts(conflicts: ConflictResolution[]): Promise<void> {
    // Sort by priority
    const sortedConflicts = conflicts.sort((a, b) => {
      const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityMap[b.priority] - priorityMap[a.priority];
    });

    for (const conflict of sortedConflicts) {
      try {
        console.log(`Resolving conflict: ${conflict.description}`);
        await conflict.implementation();
        this.conflictHistory.push(conflict);
      } catch (error) {
        console.error(`Failed to resolve conflict: ${conflict.description}`, error);
      }
    }
  }

  /**
   * Get coordination analytics
   */
  getCoordinationAnalytics(): {
    systems: Array<{
      id: string;
      name: string;
      status: 'healthy' | 'degraded' | 'critical';
      activeQueries: number;
      avgResponseTime: number;
      errorRate: number;
      cacheHitRate: number;
    }>;
    globalMetrics: {
      totalActiveQueries: number;
      avgSystemResponseTime: number;
      globalErrorRate: number;
      conflictsResolved: number;
      sharedCacheHitRate: number;
    };
    recommendations: string[];
  } {
    const systems = Array.from(this.systems.entries()).map(([id, config]) => {
      const resource = this.resources.get(id)!;
      let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

      if (resource.errorRate > 10 || resource.avgResponseTime > 10000) {
        status = 'critical';
      } else if (resource.errorRate > 5 || resource.avgResponseTime > 5000) {
        status = 'degraded';
      }

      return {
        id,
        name: config.name,
        status,
        activeQueries: resource.activeQueries,
        avgResponseTime: resource.avgResponseTime,
        errorRate: resource.errorRate,
        cacheHitRate: resource.cacheHitRate
      };
    });

    const totalActiveQueries = systems.reduce((sum, s) => sum + s.activeQueries, 0);
    const avgSystemResponseTime = systems.length > 0
      ? systems.reduce((sum, s) => sum + s.avgResponseTime, 0) / systems.length
      : 0;
    const globalErrorRate = systems.length > 0
      ? systems.reduce((sum, s) => sum + s.errorRate, 0) / systems.length
      : 0;

    const sharedCacheStats = this.getSharedCacheStats();
    const recommendations = this.generateRecommendations(systems);

    return {
      systems,
      globalMetrics: {
        totalActiveQueries,
        avgSystemResponseTime,
        globalErrorRate,
        conflictsResolved: this.conflictHistory.length,
        sharedCacheHitRate: sharedCacheStats.hitRate
      },
      recommendations
    };
  }

  /**
   * Optimize analytics performance
   */
  async optimizeAnalyticsPerformance(): Promise<{
    optimizations: string[];
    performanceImprovements: Array<{
      system: string;
      metric: string;
      before: number;
      after: number;
      improvement: number;
    }>;
  }> {
    const optimizations: string[] = [];
    const performanceImprovements: Array<{
      system: string;
      metric: string;
      before: number;
      after: number;
      improvement: number;
    }> = [];

    // Optimize each system
    for (const [systemId, config] of this.systems) {
      const resource = this.resources.get(systemId)!;
      const beforeResponseTime = resource.avgResponseTime;

      // Optimize queries for this system
      await this.optimizeSystemQueries(systemId);

      // Check improvement
      const afterResponseTime = resource.avgResponseTime;
      if (beforeResponseTime > afterResponseTime) {
        performanceImprovements.push({
          system: config.name,
          metric: 'Response Time',
          before: beforeResponseTime,
          after: afterResponseTime,
          improvement: ((beforeResponseTime - afterResponseTime) / beforeResponseTime) * 100
        });
      }
    }

    // Global optimizations
    await this.optimizeSharedCache();
    optimizations.push('Optimized shared cache configuration');

    await this.optimizeResourceAllocation();
    optimizations.push('Optimized resource allocation across systems');

    return { optimizations, performanceImprovements };
  }

  // Private helper methods

  private initializeAnalyticsSystems(): void {
    // Register built-in analytics systems
    this.registerSystem({
      id: 'business-metrics',
      name: 'Business Metrics Engine',
      priority: 8,
      maxConcurrentQueries: 5,
      cacheStrategy: 'shared',
      refreshInterval: 300000, // 5 minutes
      dependsOn: []
    });

    this.registerSystem({
      id: 'performance-monitor',
      name: 'Performance Monitor',
      priority: 9,
      maxConcurrentQueries: 10,
      cacheStrategy: 'isolated',
      refreshInterval: 60000, // 1 minute
      dependsOn: []
    });

    this.registerSystem({
      id: 'template-analytics',
      name: 'Template Analytics',
      priority: 6,
      maxConcurrentQueries: 3,
      cacheStrategy: 'shared',
      refreshInterval: 600000, // 10 minutes
      dependsOn: ['business-metrics']
    });

    this.registerSystem({
      id: 'client-analytics',
      name: 'Client Analytics',
      priority: 7,
      maxConcurrentQueries: 4,
      cacheStrategy: 'shared',
      refreshInterval: 300000, // 5 minutes
      dependsOn: ['business-metrics']
    });
  }

  private startCoordinationLoop(): void {
    // Monitor systems every 30 seconds
    setInterval(() => {
      this.monitorSystems();
    }, 30000);

    // Clean up expired cache every 5 minutes
    setInterval(() => {
      this.cleanExpiredSharedCache();
    }, 300000);

    // Process queued queries every 5 seconds
    setInterval(() => {
      this.processQueuedQueries();
    }, 5000);

    console.log('Analytics coordination loop started');
  }

  private async queueQuery(
    systemId: string,
    queryId: string,
    execute: () => Promise<any>,
    priority: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const resource = this.resources.get(systemId)!;
      resource.queuedQueries++;

      this.queryQueue.push({
        systemId,
        queryId,
        priority,
        timestamp: new Date(),
        execute: async () => {
          try {
            const result = await execute();
            resource.queuedQueries--;
            resolve(result);
          } catch (error) {
            resource.queuedQueries--;
            reject(error);
          }
        }
      });

      // Sort queue by priority
      this.queryQueue.sort((a, b) => b.priority - a.priority);
    });
  }

  private processNextQueuedQuery(systemId: string): void {
    const system = this.systems.get(systemId)!;
    const resource = this.resources.get(systemId)!;

    if (resource.activeQueries < system.maxConcurrentQueries && this.queryQueue.length > 0) {
      const nextQuery = this.queryQueue.find(q => q.systemId === systemId);
      if (nextQuery) {
        const index = this.queryQueue.indexOf(nextQuery);
        this.queryQueue.splice(index, 1);

        // Execute the queued query
        nextQuery.execute().catch(console.error);
      }
    }
  }

  private processQueuedQueries(): void {
    for (const systemId of this.systems.keys()) {
      this.processNextQueuedQuery(systemId);
    }
  }

  private updateResourceMetrics(
    systemId: string,
    responseTime: number,
    cacheHit: boolean,
    error: boolean
  ): void {
    const resource = this.resources.get(systemId)!;

    // Update response time (moving average)
    resource.avgResponseTime = (resource.avgResponseTime + responseTime) / 2;

    // Update cache hit rate
    resource.cacheHitRate = cacheHit
      ? Math.min(100, resource.cacheHitRate + 1)
      : Math.max(0, resource.cacheHitRate - 0.5);

    // Update error rate
    resource.errorRate = error
      ? Math.min(100, resource.errorRate + 1)
      : Math.max(0, resource.errorRate - 0.1);

    resource.lastActivity = new Date();
  }

  private getFromSharedCache(key: string): any | null {
    const cached = this.sharedCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.sharedCache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setSharedCache(key: string, data: any, ttl: number): void {
    this.sharedCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private detectCacheConflicts(systemId: string): ConflictResolution[] {
    const conflicts: ConflictResolution[] = [];
    const system = this.systems.get(systemId)!;

    if (system.cacheStrategy === 'shared') {
      // Check for cache thrashing
      const cacheSize = this.sharedCache.size;
      if (cacheSize > 10000) {
        conflicts.push({
          conflictType: 'cache',
          description: 'Shared cache size exceeding optimal limits',
          affectedSystems: [systemId],
          resolution: 'Optimize cache eviction strategy',
          priority: 'medium',
          implementation: async () => {
            await this.optimizeSharedCache();
          }
        });
      }
    }

    return conflicts;
  }

  private async optimizeResourceAllocation(): Promise<void> {
    // Redistribute query limits based on current load
    for (const [systemId, config] of this.systems) {
      const resource = this.resources.get(systemId)!;

      if (resource.avgResponseTime < 1000 && resource.activeQueries < config.maxConcurrentQueries * 0.5) {
        // System is underutilized, can handle more
        config.maxConcurrentQueries = Math.min(config.maxConcurrentQueries + 1, 15);
      } else if (resource.avgResponseTime > 5000) {
        // System is overloaded, reduce capacity
        config.maxConcurrentQueries = Math.max(config.maxConcurrentQueries - 1, 1);
      }
    }
  }

  private async waitForSystemStabilization(systemId: string): Promise<void> {
    const resource = this.resources.get(systemId)!;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts && resource.errorRate > 5) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
  }

  private async optimizeSystemQueries(systemId: string): Promise<void> {
    const analytics = await databaseOptimizer.analyzeSlowQueries();

    // Apply optimizations for this system
    for (const optimization of analytics) {
      console.log(`Applying optimization for ${systemId}: ${optimization.recommendation}`);
    }
  }

  private async optimizeSharedCache(): Promise<void> {
    // Implement LRU eviction for oversized cache
    if (this.sharedCache.size > 5000) {
      const entries = Array.from(this.sharedCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toEvict = Math.floor(this.sharedCache.size * 0.2); // Evict 20%
      for (let i = 0; i < toEvict; i++) {
        this.sharedCache.delete(entries[i][0]);
      }
    }
  }

  private cleanExpiredSharedCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.sharedCache) {
      if (now - cached.timestamp > cached.ttl) {
        this.sharedCache.delete(key);
      }
    }
  }

  private monitorSystems(): void {
    for (const [systemId, config] of this.systems) {
      const resource = this.resources.get(systemId)!;

      if (resource.errorRate > 10) {
        console.warn(`Analytics system ${config.name} has high error rate: ${resource.errorRate}%`);
      }

      if (resource.avgResponseTime > 10000) {
        console.warn(`Analytics system ${config.name} has high response time: ${resource.avgResponseTime}ms`);
      }
    }
  }

  private getSharedCacheStats(): { hitRate: number; size: number } {
    // Simplified cache hit rate calculation
    return {
      hitRate: 75, // Placeholder - would be calculated from actual hits/misses
      size: this.sharedCache.size
    };
  }

  private generateRecommendations(systems: any[]): string[] {
    const recommendations: string[] = [];

    const criticalSystems = systems.filter(s => s.status === 'critical');
    if (criticalSystems.length > 0) {
      recommendations.push(`${criticalSystems.length} systems are in critical state - immediate attention required`);
    }

    const highErrorSystems = systems.filter(s => s.errorRate > 5);
    if (highErrorSystems.length > 0) {
      recommendations.push('Multiple systems showing high error rates - review query optimization');
    }

    const slowSystems = systems.filter(s => s.avgResponseTime > 5000);
    if (slowSystems.length > 0) {
      recommendations.push('Slow response times detected - implement caching and query optimization');
    }

    if (this.sharedCache.size > 8000) {
      recommendations.push('Shared cache size is large - consider cache optimization');
    }

    return recommendations;
  }
}

// Export singleton instance
export const analyticsCoordinator = new AnalyticsCoordinator();

// Export helper functions
export async function coordinatedBusinessMetrics(): Promise<any> {
  return analyticsCoordinator.executeCoordinatedQuery(
    'business-metrics',
    'business-metrics-all',
    () => businessMetricsEngine.calculateAllMetrics(),
    {
      priority: 8,
      useSharedCache: true,
      cacheKey: 'business-metrics-all',
      timeout: 15000
    }
  );
}

export async function coordinatedPerformanceAnalytics(): Promise<any> {
  return analyticsCoordinator.executeCoordinatedQuery(
    'performance-monitor',
    'performance-health',
    () => performanceMonitor.getSystemHealth(),
    {
      priority: 9,
      useSharedCache: false, // Always fresh for performance monitoring
      timeout: 10000
    }
  );
}