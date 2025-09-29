/**
 * Client Customization Caching System
 * High-performance caching for client-specific customizations and configurations
 */

import { PerformanceMetrics } from '../monitoring/performance-metrics';

export interface CustomizationCacheEntry {
  clientId: string;
  customizationId: string;
  data: any;
  generatedAt: Date;
  lastAccessed: Date;
  accessCount: number;
  ttl: number; // Time to live in milliseconds
  size: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  compressionEnabled: boolean;
  persistToDisk: boolean;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL';
}

export class ClientCustomizationCache {
  private cache = new Map<string, CustomizationCacheEntry>();
  private config: CacheConfig;
  private metrics: PerformanceMetrics;
  private currentSize = 0;

  constructor(config: CacheConfig) {
    this.config = config;
    this.metrics = new PerformanceMetrics();

    // Start TTL cleanup interval
    setInterval(() => this.cleanupExpiredEntries(), 60000); // Every minute
  }

  async get(clientId: string, customizationId: string): Promise<any | null> {
    const key = this.generateKey(clientId, customizationId);
    const startTime = performance.now();

    const entry = this.cache.get(key);
    if (!entry) {
      this.metrics.recordCacheMiss('customization', performance.now() - startTime);
      return null;
    }

    // Check TTL
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.metrics.recordCacheMiss('customization', performance.now() - startTime);
      return null;
    }

    // Update access statistics
    entry.lastAccessed = new Date();
    entry.accessCount++;

    this.metrics.recordCacheHit('customization', performance.now() - startTime);
    return this.decompress(entry.data);
  }

  async set(
    clientId: string,
    customizationId: string,
    data: any,
    ttl?: number
  ): Promise<void> {
    const key = this.generateKey(clientId, customizationId);
    const compressedData = this.compress(data);
    const size = this.calculateSize(compressedData);

    // Check if we need to evict entries
    while (this.currentSize + size > this.config.maxSize && this.cache.size > 0) {
      this.evictEntry();
    }

    const entry: CustomizationCacheEntry = {
      clientId,
      customizationId,
      data: compressedData,
      generatedAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      ttl: ttl || this.config.defaultTtl,
      size
    };

    // Remove existing entry if present
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.currentSize -= existingEntry.size;
    }

    this.cache.set(key, entry);
    this.currentSize += size;

    if (this.config.persistToDisk) {
      await this.persistToDisk(key, entry);
    }
  }

  async invalidate(clientId: string, customizationId?: string): Promise<void> {
    if (customizationId) {
      const key = this.generateKey(clientId, customizationId);
      const entry = this.cache.get(key);
      if (entry) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
      }
    } else {
      // Invalidate all customizations for client
      const keysToDelete: string[] = [];
      for (const [key, entry] of this.cache.entries()) {
        if (entry.clientId === clientId) {
          keysToDelete.push(key);
          this.currentSize -= entry.size;
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));
    }
  }

  async preload(clientId: string, customizations: Array<{
    id: string;
    data: any;
    ttl?: number;
  }>): Promise<void> {
    const preloadPromises = customizations.map(customization =>
      this.set(clientId, customization.id, customization.data, customization.ttl)
        .catch(error => console.warn(`Failed to preload customization ${customization.id}:`, error))
    );

    await Promise.allSettled(preloadPromises);
  }

  private generateKey(clientId: string, customizationId: string): string {
    return `${clientId}:${customizationId}`;
  }

  private isExpired(entry: CustomizationCacheEntry): boolean {
    const now = Date.now();
    return now - entry.generatedAt.getTime() > entry.ttl;
  }

  private compress(data: any): any {
    if (!this.config.compressionEnabled) return data;

    // Simple compression simulation - in reality would use actual compression
    return {
      compressed: true,
      data: JSON.stringify(data),
      originalSize: JSON.stringify(data).length
    };
  }

  private decompress(data: any): any {
    if (!data.compressed) return data;

    return JSON.parse(data.data);
  }

  private calculateSize(data: any): number {
    return JSON.stringify(data).length;
  }

  private evictEntry(): void {
    switch (this.config.evictionPolicy) {
      case 'LRU':
        this.evictLRU();
        break;
      case 'LFU':
        this.evictLFU();
        break;
      case 'TTL':
        this.evictByTTL();
        break;
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed.getTime() < oldestTime) {
        oldestTime = entry.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.cache.delete(oldestKey);
        this.currentSize -= entry.size;
      }
    }
  }

  private evictLFU(): void {
    let leastUsedKey = '';
    let leastUsedCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < leastUsedCount) {
        leastUsedCount = entry.accessCount;
        leastUsedKey = key;
      }
    }

    if (leastUsedKey) {
      const entry = this.cache.get(leastUsedKey);
      if (entry) {
        this.cache.delete(leastUsedKey);
        this.currentSize -= entry.size;
      }
    }
  }

  private evictByTTL(): void {
    let shortestTTLKey = '';
    let shortestTTL = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      const remainingTTL = entry.ttl - (Date.now() - entry.generatedAt.getTime());
      if (remainingTTL < shortestTTL) {
        shortestTTL = remainingTTL;
        shortestTTLKey = key;
      }
    }

    if (shortestTTLKey) {
      const entry = this.cache.get(shortestTTLKey);
      if (entry) {
        this.cache.delete(shortestTTLKey);
        this.currentSize -= entry.size;
      }
    }
  }

  private cleanupExpiredEntries(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
        this.currentSize -= entry.size;
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
    }
  }

  private async persistToDisk(key: string, entry: CustomizationCacheEntry): Promise<void> {
    // Mock persistence - in reality would save to Redis, file system, or database
    console.log(`Persisting cache entry ${key} to disk`);
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      currentSizeBytes: this.currentSize,
      maxSizeBytes: this.config.maxSize,
      utilizationPercent: (this.currentSize / this.config.maxSize) * 100,
      hitRate: this.metrics.getCacheHitRate('customization'),
      averageAccessTime: this.metrics.getAverageResponseTime('customization'),
      totalHits: this.metrics.getCacheHits('customization'),
      totalMisses: this.metrics.getCacheMisses('customization'),
      entriesByClient: this.groupEntriesByClient(entries),
      oldestEntry: entries.reduce((oldest, entry) =>
        !oldest || entry.generatedAt < oldest.generatedAt ? entry : oldest, null),
      mostAccessedEntry: entries.reduce((mostAccessed, entry) =>
        !mostAccessed || entry.accessCount > mostAccessed.accessCount ? entry : mostAccessed, null)
    };
  }

  private groupEntriesByClient(entries: CustomizationCacheEntry[]) {
    const grouped: { [clientId: string]: number } = {};
    entries.forEach(entry => {
      grouped[entry.clientId] = (grouped[entry.clientId] || 0) + 1;
    });
    return grouped;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }
}

export default ClientCustomizationCache;