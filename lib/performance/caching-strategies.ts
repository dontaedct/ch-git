/**
 * @fileoverview HT-008.9.2: Comprehensive Caching Strategies System
 * @module lib/performance/caching-strategies
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.2 - Add comprehensive caching strategies
 * Focus: Multi-layer caching system for optimal performance
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  // Cache types
  enableMemoryCache: boolean;
  enableLocalStorageCache: boolean;
  enableSessionStorageCache: boolean;
  enableIndexedDBCache: boolean;
  enableServiceWorkerCache: boolean;
  
  // Cache settings
  maxMemorySize: number; // bytes
  maxLocalStorageSize: number; // bytes
  defaultTTL: number; // seconds
  maxAge: number; // seconds
  
  // Cache strategies
  strategy: 'cache-first' | 'network-first' | 'stale-while-revalidate' | 'network-only' | 'cache-only';
  
  // Performance settings
  enableCompression: boolean;
  enableDeduplication: boolean;
  enablePrefetching: boolean;
}

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG: CacheConfig = {
  enableMemoryCache: true,
  enableLocalStorageCache: true,
  enableSessionStorageCache: true,
  enableIndexedDBCache: false,
  enableServiceWorkerCache: true,
  
  maxMemorySize: 50 * 1024 * 1024, // 50MB
  maxLocalStorageSize: 10 * 1024 * 1024, // 10MB
  defaultTTL: 300, // 5 minutes
  maxAge: 3600, // 1 hour
  
  strategy: 'stale-while-revalidate',
  
  enableCompression: true,
  enableDeduplication: true,
  enablePrefetching: true,
};

/**
 * Cache entry interface
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  size: number;
  compressed?: boolean;
  metadata?: Record<string, any>;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
  hitRate: number;
  efficiency: number;
}

/**
 * Memory Cache Implementation
 */
export class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    hitRate: 0,
    efficiency: 0,
  };

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    this.updateStats();
    return entry.value as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const serialized = JSON.stringify(value);
      const size = new Blob([serialized]).size;
      
      // Check size limits
      if (size > this.config.maxMemorySize) {
        console.warn(`Cache entry too large: ${size} bytes`);
        return false;
      }

      // Remove oldest entries if cache is full
      this.evictIfNeeded(size);

      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        size,
        compressed: this.config.enableCompression,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      };

      this.cache.set(key, entry);
      this.stats.sets++;
      this.stats.size += size;
      this.updateStats();
      
      return true;
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.size -= entry.size;
      this.updateStats();
      return true;
    }
    return false;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      hitRate: 0,
      efficiency: 0,
    };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;
    return age > entry.ttl;
  }

  /**
   * Evict entries if cache is full
   */
  private evictIfNeeded(newEntrySize: number): void {
    if (this.stats.size + newEntrySize <= this.config.maxMemorySize) {
      return;
    }

    // Sort entries by timestamp (oldest first)
    const entries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Remove oldest entries until we have space
    let removedSize = 0;
    for (const [key, entry] of entries) {
      if (this.stats.size - removedSize + newEntrySize <= this.config.maxMemorySize) {
        break;
      }
      
      this.cache.delete(key);
      removedSize += entry.size;
    }

    this.stats.size -= removedSize;
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    this.stats.efficiency = this.stats.hitRate * (1 - this.stats.size / this.config.maxMemorySize);
  }
}

/**
 * Local Storage Cache Implementation
 */
export class LocalStorageCache {
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    size: 0,
    hitRate: 0,
    efficiency: 0,
  };

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
  }

  /**
   * Get value from localStorage cache
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (!item) {
        this.stats.misses++;
        this.updateStats();
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(item);
      
      // Check if entry has expired
      if (this.isExpired(entry)) {
        localStorage.removeItem(`cache_${key}`);
        this.stats.misses++;
        this.updateStats();
        return null;
      }

      this.stats.hits++;
      this.updateStats();
      return entry.value;
    } catch (error) {
      console.error('Failed to get from localStorage cache:', error);
      this.stats.misses++;
      this.updateStats();
      return null;
    }
  }

  /**
   * Set value in localStorage cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    try {
      const entry: CacheEntry<T> = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL,
        size: new Blob([JSON.stringify(value)]).size,
        metadata: {
          createdAt: new Date().toISOString(),
        },
      };

      const serialized = JSON.stringify(entry);
      const size = new Blob([serialized]).size;

      // Check size limits
      if (size > this.config.maxLocalStorageSize) {
        console.warn(`localStorage cache entry too large: ${size} bytes`);
        return false;
      }

      localStorage.setItem(`cache_${key}`, serialized);
      this.stats.sets++;
      this.stats.size += size;
      this.updateStats();
      
      return true;
    } catch (error) {
      console.error('Failed to set localStorage cache entry:', error);
      return false;
    }
  }

  /**
   * Delete value from localStorage cache
   */
  delete(key: string): boolean {
    try {
      const item = localStorage.getItem(`cache_${key}`);
      if (item) {
        const entry: CacheEntry = JSON.parse(item);
        localStorage.removeItem(`cache_${key}`);
        this.stats.deletes++;
        this.stats.size -= entry.size;
        this.updateStats();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete localStorage cache entry:', error);
      return false;
    }
  }

  /**
   * Clear all localStorage cache entries
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'));
      keys.forEach(key => localStorage.removeItem(key));
      
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        size: 0,
        hitRate: 0,
        efficiency: 0,
      };
    } catch (error) {
      console.error('Failed to clear localStorage cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;
    return age > entry.ttl;
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
    this.stats.efficiency = this.stats.hitRate * (1 - this.stats.size / this.config.maxLocalStorageSize);
  }
}

/**
 * Multi-layer Cache Manager
 */
export class CacheManager {
  private memoryCache: MemoryCache;
  private localStorageCache: LocalStorageCache;
  private config: CacheConfig;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
    this.memoryCache = new MemoryCache(config);
    this.localStorageCache = new LocalStorageCache(config);
  }

  /**
   * Get value from cache with fallback strategy
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    if (this.config.enableMemoryCache) {
      const memoryValue = this.memoryCache.get<T>(key);
      if (memoryValue !== null) {
        return memoryValue;
      }
    }

    // Try localStorage cache
    if (this.config.enableLocalStorageCache) {
      const localStorageValue = this.localStorageCache.get<T>(key);
      if (localStorageValue !== null) {
        // Promote to memory cache
        if (this.config.enableMemoryCache) {
          this.memoryCache.set(key, localStorageValue);
        }
        return localStorageValue;
      }
    }

    return null;
  }

  /**
   * Set value in all enabled caches
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    let success = true;

    // Set in memory cache
    if (this.config.enableMemoryCache) {
      success = this.memoryCache.set(key, value, ttl) && success;
    }

    // Set in localStorage cache
    if (this.config.enableLocalStorageCache) {
      success = this.localStorageCache.set(key, value, ttl) && success;
    }

    return success;
  }

  /**
   * Delete value from all caches
   */
  async delete(key: string): Promise<boolean> {
    let success = true;

    if (this.config.enableMemoryCache) {
      success = this.memoryCache.delete(key) && success;
    }

    if (this.config.enableLocalStorageCache) {
      success = this.localStorageCache.delete(key) && success;
    }

    return success;
  }

  /**
   * Clear all caches
   */
  async clear(): Promise<void> {
    if (this.config.enableMemoryCache) {
      this.memoryCache.clear();
    }

    if (this.config.enableLocalStorageCache) {
      this.localStorageCache.clear();
    }
  }

  /**
   * Get combined cache statistics
   */
  getStats(): {
    memory: CacheStats;
    localStorage: CacheStats;
    combined: CacheStats;
  } {
    const memoryStats = this.memoryCache.getStats();
    const localStorageStats = this.localStorageCache.getStats();

    const combined: CacheStats = {
      hits: memoryStats.hits + localStorageStats.hits,
      misses: memoryStats.misses + localStorageStats.misses,
      sets: memoryStats.sets + localStorageStats.sets,
      deletes: memoryStats.deletes + localStorageStats.deletes,
      size: memoryStats.size + localStorageStats.size,
      hitRate: 0,
      efficiency: 0,
    };

    const total = combined.hits + combined.misses;
    combined.hitRate = total > 0 ? (combined.hits / total) * 100 : 0;
    combined.efficiency = combined.hitRate * 0.8; // Combined efficiency factor

    return {
      memory: memoryStats,
      localStorage: localStorageStats,
      combined,
    };
  }
}

/**
 * React Hook for Cache Management
 */
export function useCache<T>(key: string, config?: Partial<CacheConfig>) {
  const mergedConfig = { ...DEFAULT_CACHE_CONFIG, ...config };
  const cacheManager = useMemo(() => new CacheManager(mergedConfig), [mergedConfig]);
  
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const get = useCallback(async (): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const cachedValue = await cacheManager.get<T>(key);
      setValue(cachedValue);
      return cachedValue;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache get failed');
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [cacheManager, key]);

  const set = useCallback(async (newValue: T, ttl?: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await cacheManager.set(key, newValue, ttl);
      if (success) {
        setValue(newValue);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache set failed');
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cacheManager, key]);

  const remove = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await cacheManager.delete(key);
      if (success) {
        setValue(null);
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache delete failed');
      setError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cacheManager, key]);

  const clear = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await cacheManager.clear();
      setValue(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Cache clear failed');
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [cacheManager]);

  const stats = useMemo(() => cacheManager.getStats(), [cacheManager]);

  return {
    value,
    loading,
    error,
    get,
    set,
    remove,
    clear,
    stats,
  };
}

/**
 * Cache-aware fetch wrapper
 */
export class CachedFetch {
  private cacheManager: CacheManager;
  private config: CacheConfig;

  constructor(config: CacheConfig = DEFAULT_CACHE_CONFIG) {
    this.config = config;
    this.cacheManager = new CacheManager(config);
  }

  /**
   * Fetch with caching support
   */
  async fetch<T>(
    url: string,
    options: RequestInit = {},
    cacheKey?: string,
    ttl?: number
  ): Promise<T> {
    const key = cacheKey || `fetch_${url}_${JSON.stringify(options)}`;
    
    // Try cache first
    if (this.config.strategy !== 'network-only') {
      const cached = await this.cacheManager.get<T>(key);
      if (cached !== null && this.config.strategy !== 'network-first') {
        return cached;
      }
    }

    // Fetch from network
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Cache the result
      if (this.config.strategy !== 'cache-only') {
        await this.cacheManager.set(key, data, ttl);
      }

      return data;
    } catch (error) {
      // Return cached data if network fails and we have stale data
      if (this.config.strategy === 'stale-while-revalidate') {
        const stale = await this.cacheManager.get<T>(key);
        if (stale !== null) {
          return stale;
        }
      }
      
      throw error;
    }
  }
}

/**
 * Export cache utilities
 */
export const CachingStrategies = {
  MemoryCache,
  LocalStorageCache,
  CacheManager,
  CachedFetch,
  useCache,
  DEFAULT_CACHE_CONFIG,
};

export default CachingStrategies;
