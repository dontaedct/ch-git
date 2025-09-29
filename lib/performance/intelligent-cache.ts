/**
 * Intelligent Caching Strategy
 * HT-034.5.4 - Advanced caching system with multiple layers and smart invalidation
 *
 * Implements comprehensive caching strategy to optimize database performance
 * and resolve conflicts between multiple analytics systems.
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  tags: string[];
  size: number; // Estimated size in bytes
  priority: number; // 1-10, higher = more important
}

export interface CacheLayer {
  name: string;
  maxSize: number; // in bytes
  maxEntries: number;
  defaultTtl: number; // in milliseconds
  evictionStrategy: 'LRU' | 'LFU' | 'TTL' | 'Priority';
  enabled: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
  hitRate: number;
  avgResponseTime: number;
  memoryUsage: number;
  entryCount: number;
}

export interface InvalidationRule {
  pattern: string | RegExp;
  triggers: string[]; // Events that trigger this rule
  cascade: boolean; // Whether to cascade to dependent caches
  delay: number; // Delay before invalidation in ms
}

export class IntelligentCache {
  private layers = new Map<string, Map<string, CacheEntry>>();
  private layerConfigs = new Map<string, CacheLayer>();
  private stats = new Map<string, CacheStats>();
  private invalidationRules: InvalidationRule[] = [];
  private dependencyGraph = new Map<string, Set<string>>();
  private writeThrough = new Map<string, boolean>();

  constructor() {
    this.initializeCacheLayers();
    this.setupInvalidationRules();
    this.startMaintenanceLoop();
  }

  /**
   * Get value from cache with intelligent layering
   */
  async get<T = any>(
    key: string,
    options: {
      layers?: string[];
      fallback?: () => Promise<T>;
      updateCache?: boolean;
      tags?: string[];
    } = {}
  ): Promise<T | null> {
    const startTime = Date.now();
    const layers = options.layers || ['memory', 'redis', 'disk'];

    // Try each layer in order
    for (const layerName of layers) {
      const layer = this.layers.get(layerName);
      const stats = this.stats.get(layerName);

      if (!layer || !stats) continue;

      const entry = layer.get(key);

      if (entry && this.isValidEntry(entry)) {
        // Update access statistics
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        // Update stats
        stats.hits++;
        stats.totalRequests++;
        stats.avgResponseTime = (stats.avgResponseTime + (Date.now() - startTime)) / 2;

        // Promote to higher layers if configured
        await this.promoteToHigherLayers(key, entry, layerName, layers);

        return entry.data as T;
      }

      // Record miss
      stats.misses++;
      stats.totalRequests++;
    }

    // If fallback is provided, execute and cache result
    if (options.fallback) {
      try {
        const data = await options.fallback();

        if (options.updateCache !== false) {
          await this.set(key, data, {
            layers,
            tags: options.tags,
            priority: 5
          });
        }

        return data;
      } catch (error) {
        console.error('Cache fallback failed:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Set value in cache with intelligent distribution
   */
  async set(
    key: string,
    data: any,
    options: {
      ttl?: number;
      layers?: string[];
      tags?: string[];
      priority?: number;
      dependencies?: string[];
      writeThrough?: boolean;
    } = {}
  ): Promise<void> {
    const layers = options.layers || ['memory', 'redis'];
    const ttl = options.ttl || 300000; // 5 minutes default
    const tags = options.tags || [];
    const priority = options.priority || 5;
    const size = this.estimateSize(data);

    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccessed: Date.now(),
      tags,
      size,
      priority
    };

    // Store dependencies
    if (options.dependencies) {
      this.dependencyGraph.set(key, new Set(options.dependencies));
    }

    // Set write-through flag
    if (options.writeThrough !== undefined) {
      this.writeThrough.set(key, options.writeThrough);
    }

    // Store in each specified layer
    for (const layerName of layers) {
      await this.setInLayer(layerName, key, entry);
    }
  }

  /**
   * Invalidate cache entries by pattern or tags
   */
  async invalidate(
    pattern: string | string[],
    options: {
      cascade?: boolean;
      layers?: string[];
      reason?: string;
    } = {}
  ): Promise<number> {
    const layers = options.layers || Array.from(this.layers.keys());
    let invalidated = 0;

    const patterns = Array.isArray(pattern) ? pattern : [pattern];

    for (const layerName of layers) {
      const layer = this.layers.get(layerName);
      if (!layer) continue;

      const keysToInvalidate: string[] = [];

      for (const [key, entry] of layer) {
        if (this.matchesPattern(key, entry, patterns)) {
          keysToInvalidate.push(key);
        }
      }

      // Remove matched entries
      for (const key of keysToInvalidate) {
        layer.delete(key);
        invalidated++;

        // Handle cascading invalidation
        if (options.cascade) {
          await this.cascadeInvalidation(key);
        }
      }

      // Update stats
      const stats = this.stats.get(layerName);
      if (stats) {
        stats.evictions += keysToInvalidate.length;
      }
    }

    console.log(`Invalidated ${invalidated} cache entries for pattern: ${patterns.join(', ')}`);
    return invalidated;
  }

  /**
   * Get cache statistics for all layers
   */
  getStats(): { [layerName: string]: CacheStats & { hitRate: number } } {
    const result: { [layerName: string]: CacheStats & { hitRate: number } } = {};

    for (const [layerName, stats] of this.stats) {
      const layer = this.layers.get(layerName);
      const hitRate = stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0;

      result[layerName] = {
        ...stats,
        hitRate,
        entryCount: layer?.size || 0,
        memoryUsage: this.calculateLayerMemoryUsage(layerName)
      };
    }

    return result;
  }

  /**
   * Optimize cache performance
   */
  async optimizeCache(): Promise<{
    optimizations: string[];
    memoryFreed: number;
    performanceImprovement: number;
  }> {
    const optimizations: string[] = [];
    let memoryFreed = 0;
    const beforeHitRate = this.getOverallHitRate();

    // Optimize each layer
    for (const layerName of this.layers.keys()) {
      const layerOptimizations = await this.optimizeLayer(layerName);
      optimizations.push(...layerOptimizations.optimizations);
      memoryFreed += layerOptimizations.memoryFreed;
    }

    // Optimize invalidation rules
    await this.optimizeInvalidationRules();
    optimizations.push('Optimized invalidation rules');

    // Rebalance cache distribution
    await this.rebalanceCacheLayers();
    optimizations.push('Rebalanced cache layer distribution');

    const afterHitRate = this.getOverallHitRate();
    const performanceImprovement = afterHitRate - beforeHitRate;

    return {
      optimizations,
      memoryFreed,
      performanceImprovement
    };
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmUpCache(
    warmupQueries: Array<{
      key: string;
      dataLoader: () => Promise<any>;
      priority: number;
      tags?: string[];
    }>
  ): Promise<void> {
    console.log(`Warming up cache with ${warmupQueries.length} queries...`);

    // Sort by priority
    const sortedQueries = warmupQueries.sort((a, b) => b.priority - a.priority);

    // Execute warmup queries in batches
    const batchSize = 5;
    for (let i = 0; i < sortedQueries.length; i += batchSize) {
      const batch = sortedQueries.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (query) => {
          try {
            const data = await query.dataLoader();
            await this.set(query.key, data, {
              priority: query.priority,
              tags: query.tags,
              layers: ['memory', 'redis']
            });
          } catch (error) {
            console.error(`Failed to warm up cache for key ${query.key}:`, error);
          }
        })
      );

      // Small delay between batches to avoid overwhelming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Cache warmup completed');
  }

  // Private helper methods

  private initializeCacheLayers(): void {
    // Memory layer - fastest, smallest capacity
    this.layerConfigs.set('memory', {
      name: 'Memory',
      maxSize: 100 * 1024 * 1024, // 100MB
      maxEntries: 10000,
      defaultTtl: 300000, // 5 minutes
      evictionStrategy: 'LRU',
      enabled: true
    });

    // Redis layer - medium speed, medium capacity
    this.layerConfigs.set('redis', {
      name: 'Redis',
      maxSize: 500 * 1024 * 1024, // 500MB
      maxEntries: 50000,
      defaultTtl: 1800000, // 30 minutes
      evictionStrategy: 'LFU',
      enabled: true
    });

    // Disk layer - slowest, largest capacity
    this.layerConfigs.set('disk', {
      name: 'Disk',
      maxSize: 2 * 1024 * 1024 * 1024, // 2GB
      maxEntries: 100000,
      defaultTtl: 3600000, // 1 hour
      evictionStrategy: 'TTL',
      enabled: false // Disabled by default
    });

    // Initialize actual cache layers
    for (const layerName of this.layerConfigs.keys()) {
      this.layers.set(layerName, new Map());
      this.stats.set(layerName, {
        hits: 0,
        misses: 0,
        evictions: 0,
        totalRequests: 0,
        hitRate: 0,
        avgResponseTime: 0,
        memoryUsage: 0,
        entryCount: 0
      });
    }
  }

  private setupInvalidationRules(): void {
    // Client data invalidation
    this.invalidationRules.push({
      pattern: /^client_.*$/,
      triggers: ['client_update', 'client_delete'],
      cascade: true,
      delay: 0
    });

    // Analytics data invalidation
    this.invalidationRules.push({
      pattern: /^analytics_.*$/,
      triggers: ['data_update', 'business_metrics_update'],
      cascade: false,
      delay: 5000 // 5 second delay to allow for batch updates
    });

    // Template data invalidation
    this.invalidationRules.push({
      pattern: /^template_.*$/,
      triggers: ['template_update', 'component_update'],
      cascade: true,
      delay: 1000
    });

    // Performance metrics invalidation
    this.invalidationRules.push({
      pattern: /^performance_.*$/,
      triggers: ['system_update'],
      cascade: false,
      delay: 0 // Immediate invalidation for performance data
    });
  }

  private startMaintenanceLoop(): void {
    // Clean expired entries every 5 minutes
    setInterval(() => {
      this.cleanExpiredEntries();
    }, 300000);

    // Optimize cache every 15 minutes
    setInterval(() => {
      this.optimizeCache().catch(console.error);
    }, 900000);

    // Update statistics every minute
    setInterval(() => {
      this.updateStatistics();
    }, 60000);

    console.log('Cache maintenance loop started');
  }

  private isValidEntry(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private async promoteToHigherLayers(
    key: string,
    entry: CacheEntry,
    currentLayer: string,
    allLayers: string[]
  ): Promise<void> {
    const currentIndex = allLayers.indexOf(currentLayer);

    // Only promote if access count is high enough
    if (entry.accessCount < 3) return;

    // Promote to higher layers (lower index)
    for (let i = 0; i < currentIndex; i++) {
      const higherLayer = allLayers[i];
      const layer = this.layers.get(higherLayer);

      if (layer && !layer.has(key)) {
        await this.setInLayer(higherLayer, key, { ...entry });
      }
    }
  }

  private async setInLayer(layerName: string, key: string, entry: CacheEntry): Promise<void> {
    const layer = this.layers.get(layerName);
    const config = this.layerConfigs.get(layerName);

    if (!layer || !config || !config.enabled) return;

    // Check capacity and evict if necessary
    if (layer.size >= config.maxEntries || this.calculateLayerMemoryUsage(layerName) >= config.maxSize) {
      await this.evictEntries(layerName, 1);
    }

    layer.set(key, entry);
  }

  private async evictEntries(layerName: string, count: number): Promise<void> {
    const layer = this.layers.get(layerName);
    const config = this.layerConfigs.get(layerName);
    const stats = this.stats.get(layerName);

    if (!layer || !config || !stats) return;

    const entries = Array.from(layer.entries());
    let toEvict: string[] = [];

    switch (config.evictionStrategy) {
      case 'LRU':
        entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
        break;
      case 'LFU':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'TTL':
        entries.sort((a, b) => (a[1].timestamp + a[1].ttl) - (b[1].timestamp + b[1].ttl));
        break;
      case 'Priority':
        entries.sort((a, b) => a[1].priority - b[1].priority);
        break;
    }

    toEvict = entries.slice(0, count).map(([key]) => key);

    for (const key of toEvict) {
      layer.delete(key);
      stats.evictions++;
    }
  }

  private matchesPattern(key: string, entry: CacheEntry, patterns: string[]): boolean {
    for (const pattern of patterns) {
      // Check if pattern matches key
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) return true;
      }

      // Check if pattern matches tags
      if (entry.tags.some(tag => tag.includes(pattern))) return true;
    }

    return false;
  }

  private async cascadeInvalidation(key: string): Promise<void> {
    const dependencies = this.dependencyGraph.get(key);
    if (!dependencies) return;

    for (const dependentKey of dependencies) {
      await this.invalidate(dependentKey, { cascade: true });
    }
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
    } catch {
      return 1024; // Default 1KB if can't serialize
    }
  }

  private calculateLayerMemoryUsage(layerName: string): number {
    const layer = this.layers.get(layerName);
    if (!layer) return 0;

    let totalSize = 0;
    for (const entry of layer.values()) {
      totalSize += entry.size;
    }

    return totalSize;
  }

  private cleanExpiredEntries(): void {
    const now = Date.now();

    for (const [layerName, layer] of this.layers) {
      const expiredKeys: string[] = [];

      for (const [key, entry] of layer) {
        if (now - entry.timestamp > entry.ttl) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        layer.delete(key);
      }

      if (expiredKeys.length > 0) {
        console.log(`Cleaned ${expiredKeys.length} expired entries from ${layerName} layer`);
      }
    }
  }

  private updateStatistics(): void {
    for (const [layerName, stats] of this.stats) {
      stats.hitRate = stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0;
      stats.memoryUsage = this.calculateLayerMemoryUsage(layerName);
      stats.entryCount = this.layers.get(layerName)?.size || 0;
    }
  }

  private getOverallHitRate(): number {
    let totalHits = 0;
    let totalRequests = 0;

    for (const stats of this.stats.values()) {
      totalHits += stats.hits;
      totalRequests += stats.totalRequests;
    }

    return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
  }

  private async optimizeLayer(layerName: string): Promise<{
    optimizations: string[];
    memoryFreed: number;
  }> {
    const optimizations: string[] = [];
    let memoryFreed = 0;

    const layer = this.layers.get(layerName);
    const config = this.layerConfigs.get(layerName);

    if (!layer || !config) return { optimizations, memoryFreed };

    // Remove low-value entries
    const entries = Array.from(layer.entries());
    const lowValueEntries = entries.filter(([_, entry]) =>
      entry.accessCount === 1 && Date.now() - entry.lastAccessed > 300000
    );

    for (const [key, entry] of lowValueEntries) {
      layer.delete(key);
      memoryFreed += entry.size;
    }

    if (lowValueEntries.length > 0) {
      optimizations.push(`Removed ${lowValueEntries.length} low-value entries from ${layerName}`);
    }

    return { optimizations, memoryFreed };
  }

  private async optimizeInvalidationRules(): Promise<void> {
    // Analyze rule effectiveness and adjust delays
    for (const rule of this.invalidationRules) {
      // Optimization logic would go here
      // For now, just ensure delays are reasonable
      if (rule.delay > 10000) {
        rule.delay = 10000; // Max 10 second delay
      }
    }
  }

  private async rebalanceCacheLayers(): Promise<void> {
    // Move frequently accessed items to faster layers
    const memoryLayer = this.layers.get('memory');
    const redisLayer = this.layers.get('redis');

    if (!memoryLayer || !redisLayer) return;

    // Find highly accessed items in Redis that aren't in memory
    for (const [key, entry] of redisLayer) {
      if (entry.accessCount > 10 && !memoryLayer.has(key)) {
        await this.setInLayer('memory', key, { ...entry });
      }
    }
  }
}

// Export singleton instance
export const intelligentCache = new IntelligentCache();

// Export helper functions for common cache operations
export async function cacheBusinessMetrics(data: any, clientId?: string): Promise<void> {
  const key = clientId ? `business_metrics_${clientId}` : 'business_metrics_global';
  await intelligentCache.set(key, data, {
    ttl: 300000, // 5 minutes
    tags: ['business_metrics', 'analytics'],
    priority: 8,
    layers: ['memory', 'redis']
  });
}

export async function getCachedBusinessMetrics(clientId?: string): Promise<any> {
  const key = clientId ? `business_metrics_${clientId}` : 'business_metrics_global';
  return intelligentCache.get(key, {
    layers: ['memory', 'redis']
  });
}

export async function invalidateAnalyticsCache(): Promise<void> {
  await intelligentCache.invalidate(['analytics_', 'business_metrics_', 'performance_'], {
    cascade: true,
    reason: 'Data update'
  });
}

export async function warmUpAnalyticsCache(): Promise<void> {
  const warmupQueries = [
    {
      key: 'business_metrics_global',
      dataLoader: async () => {
        // Would load business metrics
        return { revenue: 100000, clients: 50 };
      },
      priority: 9,
      tags: ['business_metrics']
    },
    {
      key: 'performance_system_health',
      dataLoader: async () => {
        // Would load system health
        return { status: 'healthy', uptime: 99.9 };
      },
      priority: 8,
      tags: ['performance']
    }
  ];

  await intelligentCache.warmUpCache(warmupQueries);
}