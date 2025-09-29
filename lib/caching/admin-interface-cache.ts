/**
 * @fileoverview Admin Interface Caching System
 * @module lib/caching/admin-interface-cache
 * @author OSS Hero System
 * @version 1.0.0
 */

import { performance } from 'perf_hooks';

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  compression: boolean;
  compressionThreshold: number;
  cleanupInterval: number;
  maxAge: number;
  enableMetrics: boolean;
  enableLRU: boolean;
}

/**
 * Cache metrics interface
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  compressions: number;
  decompressions: number;
  evictions: number;
  totalSize: number;
  averageAccessTime: number;
  hitRate: number;
  missRate: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  keys: string[];
  size: number;
  memoryUsage: number;
  oldestEntry: number;
  newestEntry: number;
  mostAccessed: string;
  leastAccessed: string;
  compressionRatio: number;
  evictionRate: number;
}

/**
 * Admin Interface Caching System
 * 
 * Provides advanced caching capabilities for the admin interface including
 * intelligent cache management, compression, LRU eviction, and performance monitoring
 */
export class AdminInterfaceCache {
  private cache: Map<string, CacheEntry>;
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private accessTimes: Map<string, number>;
  private accessCounts: Map<string, number>;
  private compressionEnabled: boolean;
  private cleanupInterval: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 300, // 5 minutes
      maxSize: 1000,
      compression: true,
      compressionThreshold: 1024, // 1KB
      cleanupInterval: 60000, // 1 minute
      maxAge: 3600000, // 1 hour
      enableMetrics: true,
      enableLRU: true,
      ...config
    };

    this.cache = new Map<string, CacheEntry>();

    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      compressions: 0,
      decompressions: 0,
      evictions: 0,
      totalSize: 0,
      averageAccessTime: 0,
      hitRate: 0,
      missRate: 0
    };

    this.accessTimes = new Map();
    this.accessCounts = new Map();
    this.compressionEnabled = this.config.compression;

    this.startCleanup();
    this.startMetricsCollection();
  }

  /**
   * Get value from cache
   */
  public get<T>(key: string): T | undefined {
    const start = performance.now();

    try {
      const entry = this.cache.get(key) as CacheEntry<T> | undefined;

      if (entry) {
        // Update access metrics
        this.updateAccessMetrics(key, start);

        // Check if entry is expired
        if (this.isExpired(entry)) {
          this.cache.delete(key);
          this.metrics.misses++;
          return undefined;
        }

        // Decompress if needed
        let data = entry.data;
        if (entry.compressed) {
          data = this.decompress(data);
          this.metrics.decompressions++;
        }

        this.metrics.hits++;
        this.updateHitRate();

        return data;
      } else {
        this.metrics.misses++;
        this.updateHitRate();
        return undefined;
      }
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      this.metrics.misses++;
      this.updateHitRate();
      return undefined;
    }
  }

  /**
   * Set value in cache
   */
  public set<T>(
    key: string, 
    value: T, 
    ttl?: number, 
    metadata?: Record<string, any>
  ): boolean {
    const start = performance.now();
    
    try {
      // Check cache size limit
      if (this.cache.size >= this.config.maxSize) {
        this.evictLRU();
      }

      let data = value;
      let compressed = false;

      // Compress large values if enabled
      if (this.compressionEnabled && this.shouldCompress(value)) {
        data = this.compress(value);
        compressed = true;
        this.metrics.compressions++;
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        compressed,
        metadata
      };

      this.cache.set(key, entry);
      this.metrics.sets++;
      this.accessTimes.set(key, start);
      this.accessCounts.set(key, 0);
      this.updateTotalSize();

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  public delete(key: string): boolean {
    try {
      const success = this.cache.delete(key);
      if (success) {
        this.metrics.deletes++;
        this.accessTimes.delete(key);
        this.accessCounts.delete(key);
        this.updateTotalSize();
      }
      return success;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  public has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Get multiple values from cache
   */
  public getMany<T>(keys: string[]): Map<string, T> {
    const results = new Map<string, T>();
    
    keys.forEach(key => {
      const value = this.get<T>(key);
      if (value !== undefined) {
        results.set(key, value);
      }
    });

    return results;
  }

  /**
   * Set multiple values in cache
   */
  public setMany<T>(
    entries: Array<{ key: string; value: T; ttl?: number; metadata?: Record<string, any> }>
  ): Map<string, boolean> {
    const results = new Map<string, boolean>();
    
    entries.forEach(({ key, value, ttl, metadata }) => {
      const success = this.set(key, value, ttl, metadata);
      results.set(key, success);
    });

    return results;
  }

  /**
   * Get or set pattern - get from cache or compute and cache
   */
  public async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl, metadata);
    return value;
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
    this.accessCounts.clear();
    this.metrics.totalSize = 0;
  }

  /**
   * Get cache keys matching pattern
   */
  public keys(pattern?: string): string[] {
    const allKeys = Array.from(this.cache.keys());

    if (!pattern) {
      return allKeys;
    }

    const regex = new RegExp(pattern);
    return allKeys.filter(key => regex.test(key));
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const keys = Array.from(this.cache.keys());
    const now = Date.now();

    let oldestEntry = now;
    let newestEntry = 0;
    let mostAccessed = '';
    let leastAccessed = '';
    let maxAccess = 0;
    let minAccess = Infinity;

    keys.forEach(key => {
      const entry = this.cache.get(key) as CacheEntry | undefined;
      if (entry) {
        if (entry.timestamp < oldestEntry) {
          oldestEntry = entry.timestamp;
        }
        if (entry.timestamp > newestEntry) {
          newestEntry = entry.timestamp;
        }
      }

      const accessCount = this.accessCounts.get(key) || 0;
      if (accessCount > maxAccess) {
        maxAccess = accessCount;
        mostAccessed = key;
      }
      if (accessCount < minAccess) {
        minAccess = accessCount;
        leastAccessed = key;
      }
    });

    const memUsage = process.memoryUsage();
    const compressionRatio = this.metrics.compressions > 0 
      ? this.metrics.decompressions / this.metrics.compressions 
      : 1;

    return {
      keys,
      size: keys.length,
      memoryUsage: memUsage.heapUsed,
      oldestEntry,
      newestEntry,
      mostAccessed,
      leastAccessed,
      compressionRatio,
      evictionRate: this.metrics.evictions / (this.metrics.sets || 1)
    };
  }

  /**
   * Get cache metrics
   */
  public getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Update cache configuration
   */
  public updateConfig(config: Partial<CacheConfig>): void {
    Object.assign(this.config, config);
    
    if (config.compression !== undefined) {
      this.compressionEnabled = config.compression;
    }

    if (config.cleanupInterval !== undefined) {
      clearInterval(this.cleanupInterval);
      this.startCleanup();
    }
  }

  /**
   * Warm up cache with common data
   */
  public async warmUp(entries: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    const promises = entries.map(({ key, value, ttl }) => 
      this.set(key, value, ttl)
    );
    
    await Promise.all(promises);
  }

  /**
   * Get cache health report
   */
  public getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    metrics: CacheMetrics;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Check hit rate
    if (this.metrics.hitRate < 70) {
      issues.push(`Low cache hit rate: ${this.metrics.hitRate.toFixed(2)}%`);
      recommendations.push('Review cache keys and TTL settings');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
      issues.push(`High memory usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      recommendations.push('Consider reducing cache size or enabling compression');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check eviction rate
    const evictionRate = this.metrics.evictions / (this.metrics.sets || 1);
    if (evictionRate > 0.1) { // 10%
      issues.push(`High eviction rate: ${(evictionRate * 100).toFixed(2)}%`);
      recommendations.push('Increase cache size or optimize cache keys');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check compression ratio
    const compressionRatio = this.metrics.compressions > 0 
      ? this.metrics.decompressions / this.metrics.compressions 
      : 1;
    if (compressionRatio < 0.8) {
      issues.push(`Low compression ratio: ${compressionRatio.toFixed(2)}`);
      recommendations.push('Review compression settings and data types');
      status = status === 'healthy' ? 'warning' : status;
    }

    return {
      status,
      issues,
      recommendations,
      metrics: this.getMetrics()
    };
  }

  /**
   * Update access metrics
   */
  private updateAccessMetrics(key: string, startTime: number): void {
    const accessTime = performance.now() - startTime;
    this.metrics.averageAccessTime = 
      (this.metrics.averageAccessTime * this.metrics.hits + accessTime) / 
      (this.metrics.hits + 1);

    const count = this.accessCounts.get(key) || 0;
    this.accessCounts.set(key, count + 1);
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.metrics.hits + this.metrics.misses;
    if (total > 0) {
      this.metrics.hitRate = (this.metrics.hits / total) * 100;
      this.metrics.missRate = (this.metrics.misses / total) * 100;
    }
  }

  /**
   * Update total size
   */
  private updateTotalSize(): void {
    this.metrics.totalSize = this.cache.size;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age > entry.ttl * 1000 || age > this.config.maxAge;
  }

  /**
   * Check if value should be compressed
   */
  private shouldCompress(value: any): boolean {
    if (!this.compressionEnabled) return false;
    
    const size = JSON.stringify(value).length;
    return size > this.config.compressionThreshold;
  }

  /**
   * Compress value (simplified implementation)
   */
  private compress(value: any): any {
    // In a real implementation, you would use a compression library like zlib
    // For now, we'll just return the value as-is
    return value;
  }

  /**
   * Decompress value (simplified implementation)
   */
  private decompress(value: any): any {
    // In a real implementation, you would use a compression library like zlib
    // For now, we'll just return the value as-is
    return value;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    if (!this.config.enableLRU) return;

    let oldestKey = '';
    let oldestTime = Date.now();

    this.accessTimes.forEach((time, key) => {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.accessTimes.delete(oldestKey);
      this.accessCounts.delete(oldestKey);
      this.metrics.evictions++;
    }
  }

  /**
   * Start cleanup process
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const keys = Array.from(this.cache.keys());
    let cleaned = 0;

    keys.forEach(key => {
      const entry = this.cache.get(key) as CacheEntry | undefined;
      if (entry && this.isExpired(entry)) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
        this.accessCounts.delete(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    if (!this.config.enableMetrics) return;

    setInterval(() => {
      const stats = this.getStats();
      const health = this.getHealthReport();
      
      if (health.status !== 'healthy') {
        console.warn('Cache health warning:', health.issues);
      }
    }, 60000); // Every minute
  }
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  /**
   * Generate template settings cache key
   */
  templateSettings: (templateId: string, userId: string) => 
    `template_settings:${templateId}:${userId}`,

  /**
   * Generate admin interface cache key
   */
  adminInterface: (component: string, userId: string) => 
    `admin_interface:${component}:${userId}`,

  /**
   * Generate template registry cache key
   */
  templateRegistry: (version: string) => 
    `template_registry:${version}`,

  /**
   * Generate AI recommendations cache key
   */
  aiRecommendations: (userId: string, context: string) => 
    `ai_recommendations:${userId}:${context}`,

  /**
   * Generate performance metrics cache key
   */
  performanceMetrics: (timeframe: string) => 
    `performance_metrics:${timeframe}`,

  /**
   * Generate user preferences cache key
   */
  userPreferences: (userId: string) => 
    `user_preferences:${userId}`,

  /**
   * Generate system configuration cache key
   */
  systemConfig: (configType: string) => 
    `system_config:${configType}`
};

/**
 * Global admin interface cache instance
 */
export const adminInterfaceCache = new AdminInterfaceCache({
  defaultTTL: 600, // 10 minutes
  maxSize: 2000,
  compression: true,
  compressionThreshold: 512, // 512 bytes
  cleanupInterval: 300000, // 5 minutes
  maxAge: 7200000, // 2 hours
  enableMetrics: true,
  enableLRU: true
});
