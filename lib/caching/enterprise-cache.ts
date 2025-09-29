/**
 * Enterprise Caching System
 * Multi-tier caching solution with intelligent cache management
 */

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  evictionPolicy: 'LRU' | 'LFU' | 'FIFO' | 'TTL';
  compression: boolean;
  serialization: 'json' | 'binary' | 'msgpack';
  persistence: boolean;
  replication: boolean;
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  compressed: boolean;
  tags: string[];
  metadata: Record<string, any>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  hitRate: number;
  missRate: number;
  avgResponseTime: number;
  totalSize: number;
  entryCount: number;
}

export interface CacheLayer {
  name: string;
  type: 'memory' | 'redis' | 'database' | 'filesystem' | 'cdn';
  priority: number;
  config: CacheConfig;
  stats: CacheStats;
}

export interface InvalidationRule {
  id: string;
  name: string;
  pattern: string | RegExp;
  trigger: 'time' | 'event' | 'dependency' | 'manual';
  condition?: (entry: CacheEntry) => boolean;
  action: 'delete' | 'refresh' | 'tag';
  enabled: boolean;
}

export class EnterpriseCacheManager {
  private layers: Map<string, CacheLayer> = new Map();
  private caches: Map<string, Map<string, CacheEntry>> = new Map();
  private invalidationRules: Map<string, InvalidationRule> = new Map();
  private stats: Map<string, CacheStats> = new Map();
  private monitoring: boolean = false;

  constructor() {
    this.initializeCacheLayers();
    this.initializeInvalidationRules();
  }

  /**
   * Initialize cache layers
   */
  private initializeCacheLayers(): void {
    const layers: CacheLayer[] = [
      {
        name: 'memory-l1',
        type: 'memory',
        priority: 1,
        config: {
          defaultTTL: 300, // 5 minutes
          maxSize: 100 * 1024 * 1024, // 100MB
          evictionPolicy: 'LRU',
          compression: false,
          serialization: 'json',
          persistence: false,
          replication: false
        },
        stats: this.createEmptyStats()
      },
      {
        name: 'memory-l2',
        type: 'memory',
        priority: 2,
        config: {
          defaultTTL: 1800, // 30 minutes
          maxSize: 500 * 1024 * 1024, // 500MB
          evictionPolicy: 'LFU',
          compression: true,
          serialization: 'msgpack',
          persistence: false,
          replication: false
        },
        stats: this.createEmptyStats()
      },
      {
        name: 'redis-distributed',
        type: 'redis',
        priority: 3,
        config: {
          defaultTTL: 3600, // 1 hour
          maxSize: 2 * 1024 * 1024 * 1024, // 2GB
          evictionPolicy: 'LRU',
          compression: true,
          serialization: 'msgpack',
          persistence: true,
          replication: true
        },
        stats: this.createEmptyStats()
      },
      {
        name: 'database-cache',
        type: 'database',
        priority: 4,
        config: {
          defaultTTL: 7200, // 2 hours
          maxSize: 10 * 1024 * 1024 * 1024, // 10GB
          evictionPolicy: 'TTL',
          compression: true,
          serialization: 'binary',
          persistence: true,
          replication: true
        },
        stats: this.createEmptyStats()
      }
    ];

    layers.forEach(layer => {
      this.layers.set(layer.name, layer);
      this.caches.set(layer.name, new Map());
      this.stats.set(layer.name, layer.stats);
    });
  }

  /**
   * Initialize invalidation rules
   */
  private initializeInvalidationRules(): void {
    const rules: InvalidationRule[] = [
      {
        id: 'user-data-invalidation',
        name: 'User Data Invalidation',
        pattern: /^user:\w+/,
        trigger: 'event',
        condition: (entry) => entry.tags.includes('user-data'),
        action: 'delete',
        enabled: true
      },
      {
        id: 'app-generation-invalidation',
        name: 'App Generation Cache Invalidation',
        pattern: /^app:generation:\w+/,
        trigger: 'time',
        condition: (entry) => Date.now() - entry.timestamp > 24 * 60 * 60 * 1000, // 24 hours
        action: 'refresh',
        enabled: true
      },
      {
        id: 'form-template-invalidation',
        name: 'Form Template Cache Invalidation',
        pattern: /^form:template:\w+/,
        trigger: 'dependency',
        action: 'tag',
        enabled: true
      }
    ];

    rules.forEach(rule => this.invalidationRules.set(rule.id, rule));
  }

  /**
   * Get value from cache with multi-tier lookup
   */
  async get<T>(key: string, options?: {
    preferredLayer?: string;
    fallbackToSlowerLayers?: boolean;
    refreshIfStale?: boolean;
  }): Promise<T | null> {
    const startTime = Date.now();
    const { preferredLayer, fallbackToSlowerLayers = true, refreshIfStale = false } = options || {};

    // Sort layers by priority (fastest first)
    const sortedLayers = Array.from(this.layers.values())
      .filter(layer => !preferredLayer || layer.name === preferredLayer || fallbackToSlowerLayers)
      .sort((a, b) => a.priority - b.priority);

    for (const layer of sortedLayers) {
      const cache = this.caches.get(layer.name);
      const stats = this.stats.get(layer.name)!;

      if (cache?.has(key)) {
        const entry = cache.get(key)!;

        // Check if entry is expired
        if (this.isExpired(entry)) {
          cache.delete(key);
          stats.evictions++;
          continue;
        }

        // Update access statistics
        entry.accessCount++;
        entry.lastAccess = Date.now();
        stats.hits++;
        stats.avgResponseTime = this.updateAverage(stats.avgResponseTime, Date.now() - startTime, stats.hits);

        // Check if refresh is needed
        if (refreshIfStale && this.isStale(entry)) {
          this.refreshEntry(key, layer.name);
        }

        // Promote to faster layers
        await this.promoteToFasterLayers(key, entry, layer.name);

        return this.deserializeValue(entry.value, layer.config.serialization);
      } else {
        stats.misses++;
      }

      // Stop at preferred layer if specified
      if (preferredLayer === layer.name) {
        break;
      }
    }

    return null;
  }

  /**
   * Set value in cache across appropriate layers
   */
  async set<T>(
    key: string,
    value: T,
    options?: {
      ttl?: number;
      tags?: string[];
      layers?: string[];
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> {
    const { ttl, tags = [], layers, metadata = {} } = options || {};

    const targetLayers = layers
      ? Array.from(this.layers.values()).filter(l => layers.includes(l.name))
      : Array.from(this.layers.values());

    let success = false;

    for (const layer of targetLayers) {
      const cache = this.caches.get(layer.name)!;
      const stats = this.stats.get(layer.name)!;
      const config = layer.config;

      const serializedValue = this.serializeValue(value, config.serialization);
      const compressedValue = config.compression ? this.compress(serializedValue) : serializedValue;

      const entry: CacheEntry<T> = {
        key,
        value: compressedValue,
        timestamp: Date.now(),
        ttl: ttl || config.defaultTTL,
        accessCount: 0,
        lastAccess: Date.now(),
        size: this.calculateSize(compressedValue),
        compressed: config.compression,
        tags,
        metadata
      };

      // Check if cache has space
      if (this.needsEviction(layer.name, entry.size)) {
        await this.evictEntries(layer.name, entry.size);
      }

      cache.set(key, entry);
      stats.sets++;
      stats.totalSize += entry.size;
      stats.entryCount++;

      success = true;
    }

    return success;
  }

  /**
   * Delete key from all layers
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false;

    for (const layerName of this.caches.keys()) {
      const cache = this.caches.get(layerName)!;
      const stats = this.stats.get(layerName)!;

      if (cache.has(key)) {
        const entry = cache.get(key)!;
        cache.delete(key);
        stats.deletes++;
        stats.totalSize -= entry.size;
        stats.entryCount--;
        deleted = true;
      }
    }

    return deleted;
  }

  /**
   * Clear cache layer or all layers
   */
  async clear(layerName?: string): Promise<void> {
    if (layerName) {
      const cache = this.caches.get(layerName);
      const stats = this.stats.get(layerName);
      if (cache && stats) {
        cache.clear();
        Object.assign(stats, this.createEmptyStats());
      }
    } else {
      for (const [name, cache] of this.caches) {
        cache.clear();
        const stats = this.stats.get(name)!;
        Object.assign(stats, this.createEmptyStats());
      }
    }
  }

  /**
   * Invalidate cache entries by pattern or tags
   */
  async invalidate(options: {
    pattern?: string | RegExp;
    tags?: string[];
    layerName?: string;
  }): Promise<number> {
    const { pattern, tags, layerName } = options;
    let invalidated = 0;

    const targetCaches = layerName
      ? [this.caches.get(layerName)!]
      : Array.from(this.caches.values());

    for (const cache of targetCaches) {
      const keysToInvalidate: string[] = [];

      for (const [key, entry] of cache) {
        let shouldInvalidate = false;

        // Check pattern match
        if (pattern) {
          const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
          shouldInvalidate = regex.test(key);
        }

        // Check tag match
        if (tags && tags.length > 0) {
          shouldInvalidate = shouldInvalidate || tags.some(tag => entry.tags.includes(tag));
        }

        if (shouldInvalidate) {
          keysToInvalidate.push(key);
        }
      }

      // Remove invalidated entries
      for (const key of keysToInvalidate) {
        await this.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  /**
   * Warm cache with precomputed data
   */
  async warmCache(data: Array<{
    key: string;
    value: any;
    ttl?: number;
    tags?: string[];
    layers?: string[];
  }>): Promise<number> {
    let warmed = 0;

    for (const item of data) {
      const success = await this.set(item.key, item.value, {
        ttl: item.ttl,
        tags: item.tags,
        layers: item.layers
      });

      if (success) {
        warmed++;
      }
    }

    return warmed;
  }

  /**
   * Get cache statistics
   */
  getStats(layerName?: string): CacheStats | Map<string, CacheStats> {
    if (layerName) {
      const stats = this.stats.get(layerName);
      if (stats) {
        // Calculate derived statistics
        const total = stats.hits + stats.misses;
        stats.hitRate = total > 0 ? (stats.hits / total) * 100 : 0;
        stats.missRate = total > 0 ? (stats.misses / total) * 100 : 0;
      }
      return stats || this.createEmptyStats();
    }

    // Return stats for all layers
    const allStats = new Map<string, CacheStats>();
    for (const [name, stats] of this.stats) {
      const total = stats.hits + stats.misses;
      const enrichedStats = {
        ...stats,
        hitRate: total > 0 ? (stats.hits / total) * 100 : 0,
        missRate: total > 0 ? (stats.misses / total) * 100 : 0
      };
      allStats.set(name, enrichedStats);
    }

    return allStats;
  }

  /**
   * Start cache monitoring and maintenance
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoring) return;

    this.monitoring = true;
    setInterval(() => {
      this.performMaintenance();
    }, intervalMs);
  }

  /**
   * Stop cache monitoring
   */
  stopMonitoring(): void {
    this.monitoring = false;
  }

  /**
   * Perform cache maintenance tasks
   */
  private async performMaintenance(): Promise<void> {
    // Clean expired entries
    await this.cleanExpiredEntries();

    // Apply invalidation rules
    await this.applyInvalidationRules();

    // Optimize cache layers
    await this.optimizeCacheLayers();

    // Log statistics
    this.logCacheStatistics();
  }

  /**
   * Clean expired entries from all layers
   */
  private async cleanExpiredEntries(): Promise<void> {
    for (const [layerName, cache] of this.caches) {
      const stats = this.stats.get(layerName)!;
      const expiredKeys: string[] = [];

      for (const [key, entry] of cache) {
        if (this.isExpired(entry)) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        const entry = cache.get(key)!;
        cache.delete(key);
        stats.evictions++;
        stats.totalSize -= entry.size;
        stats.entryCount--;
      }
    }
  }

  /**
   * Apply automatic invalidation rules
   */
  private async applyInvalidationRules(): Promise<void> {
    for (const rule of this.invalidationRules.values()) {
      if (!rule.enabled) continue;

      if (rule.trigger === 'time') {
        await this.invalidate({ pattern: rule.pattern });
      }
    }
  }

  /**
   * Optimize cache layers
   */
  private async optimizeCacheLayers(): Promise<void> {
    for (const [layerName, layer] of this.layers) {
      const stats = this.stats.get(layerName)!;

      // Adjust TTL based on hit rate
      if (stats.hitRate < 70) {
        // Increase TTL for low hit rate
        layer.config.defaultTTL = Math.min(layer.config.defaultTTL * 1.1, 7200);
      } else if (stats.hitRate > 95) {
        // Decrease TTL for very high hit rate to keep data fresh
        layer.config.defaultTTL = Math.max(layer.config.defaultTTL * 0.9, 60);
      }

      // Adjust cache size based on usage
      if (stats.totalSize > layer.config.maxSize * 0.9) {
        // Trigger more aggressive eviction
        await this.evictEntries(layerName, layer.config.maxSize * 0.1);
      }
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000;
  }

  private isStale(entry: CacheEntry, staleFactor: number = 0.8): boolean {
    return Date.now() - entry.timestamp > entry.ttl * 1000 * staleFactor;
  }

  private async promoteToFasterLayers(key: string, entry: CacheEntry, currentLayer: string): Promise<void> {
    const currentPriority = this.layers.get(currentLayer)?.priority || 999;

    for (const [layerName, layer] of this.layers) {
      if (layer.priority < currentPriority) {
        const cache = this.caches.get(layerName)!;
        if (!cache.has(key)) {
          // Promote frequently accessed entries
          if (entry.accessCount > 5) {
            cache.set(key, { ...entry });
          }
        }
      }
    }
  }

  private async refreshEntry(key: string, layerName: string): Promise<void> {
    // Trigger background refresh (implementation would depend on data source)
    console.log(`Refreshing stale entry: ${key} in layer: ${layerName}`);
  }

  private needsEviction(layerName: string, newEntrySize: number): boolean {
    const layer = this.layers.get(layerName)!;
    const stats = this.stats.get(layerName)!;
    return stats.totalSize + newEntrySize > layer.config.maxSize;
  }

  private async evictEntries(layerName: string, sizeToFree: number): Promise<void> {
    const cache = this.caches.get(layerName)!;
    const layer = this.layers.get(layerName)!;
    const stats = this.stats.get(layerName)!;

    const entries = Array.from(cache.entries());
    let freedSize = 0;

    // Sort by eviction policy
    switch (layer.config.evictionPolicy) {
      case 'LRU':
        entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
        break;
      case 'LFU':
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'FIFO':
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
      case 'TTL':
        entries.sort((a, b) => (a[1].timestamp + a[1].ttl) - (b[1].timestamp + b[1].ttl));
        break;
    }

    for (const [key, entry] of entries) {
      if (freedSize >= sizeToFree) break;

      cache.delete(key);
      stats.evictions++;
      stats.totalSize -= entry.size;
      stats.entryCount--;
      freedSize += entry.size;
    }
  }

  private serializeValue(value: any, format: string): any {
    switch (format) {
      case 'json':
        return JSON.stringify(value);
      case 'binary':
        // In real implementation, would use proper binary serialization
        return Buffer.from(JSON.stringify(value));
      case 'msgpack':
        // In real implementation, would use msgpack library
        return JSON.stringify(value);
      default:
        return value;
    }
  }

  private deserializeValue(value: any, format: string): any {
    switch (format) {
      case 'json':
        return JSON.parse(value);
      case 'binary':
        return JSON.parse(value.toString());
      case 'msgpack':
        return JSON.parse(value);
      default:
        return value;
    }
  }

  private compress(value: any): any {
    // In real implementation, would use proper compression
    return value;
  }

  private calculateSize(value: any): number {
    return JSON.stringify(value).length;
  }

  private updateAverage(currentAvg: number, newValue: number, count: number): number {
    return ((currentAvg * (count - 1)) + newValue) / count;
  }

  private createEmptyStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      hitRate: 0,
      missRate: 0,
      avgResponseTime: 0,
      totalSize: 0,
      entryCount: 0
    };
  }

  private logCacheStatistics(): void {
    const allStats = this.getStats() as Map<string, CacheStats>;
    console.log('Cache Statistics:', Object.fromEntries(allStats));
  }
}

// Export singleton instance
export const enterpriseCache = new EnterpriseCacheManager();