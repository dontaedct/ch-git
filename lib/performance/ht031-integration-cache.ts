/**
 * @fileoverview HT-031 Integration Caching Layer
 * @module lib/performance/ht031-integration-cache
 * @author OSS Hero System
 * @version 1.0.0
 */

import { Cache } from 'node-cache';
import { performance } from 'perf_hooks';

/**
 * HT-031 AI system cache entry interface
 */
export interface HT031CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  source: 'ai-processing' | 'template-analysis' | 'recommendation-engine' | 'form-generation' | 'settings-optimization';
  userId?: string;
  sessionId?: string;
  templateId?: string;
  metadata?: Record<string, any>;
  compressed?: boolean;
  version: string;
}

/**
 * HT-031 integration cache configuration
 */
export interface HT031CacheConfig {
  defaultTTL: number;
  maxSize: number;
  compression: boolean;
  compressionThreshold: number;
  enableUserSegmentation: boolean;
  enableSessionTracking: boolean;
  enableTemplateCaching: boolean;
  enableAIPipelineCaching: boolean;
  cacheInvalidationStrategy: 'time-based' | 'event-based' | 'hybrid';
  prefetchEnabled: boolean;
  prefetchThreshold: number;
}

/**
 * HT-031 cache metrics interface
 */
export interface HT031CacheMetrics {
  aiProcessingHits: number;
  aiProcessingMisses: number;
  templateAnalysisHits: number;
  templateAnalysisMisses: number;
  recommendationHits: number;
  recommendationMisses: number;
  formGenerationHits: number;
  formGenerationMisses: number;
  settingsOptimizationHits: number;
  settingsOptimizationMisses: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageResponseTime: number;
  cacheSize: number;
  compressionRatio: number;
}

/**
 * HT-031 Integration Caching Layer
 * 
 * Provides specialized caching for HT-031 AI systems including
 * AI processing results, template analysis, recommendations, and form generation
 */
export class HT031IntegrationCache {
  private cache: Cache;
  private config: HT031CacheConfig;
  private metrics: HT031CacheMetrics;
  private responseTimes: number[];
  private invalidationEvents: Set<string>;
  private prefetchQueue: Map<string, Promise<any>>;

  constructor(config: Partial<HT031CacheConfig> = {}) {
    this.config = {
      defaultTTL: 600, // 10 minutes
      maxSize: 2000,
      compression: true,
      compressionThreshold: 1024, // 1KB
      enableUserSegmentation: true,
      enableSessionTracking: true,
      enableTemplateCaching: true,
      enableAIPipelineCaching: true,
      cacheInvalidationStrategy: 'hybrid',
      prefetchEnabled: true,
      prefetchThreshold: 0.8,
      ...config
    };

    this.cache = new Cache({
      stdTTL: this.config.defaultTTL,
      checkperiod: 60,
      useClones: false
    });

    this.metrics = {
      aiProcessingHits: 0,
      aiProcessingMisses: 0,
      templateAnalysisHits: 0,
      templateAnalysisMisses: 0,
      recommendationHits: 0,
      recommendationMisses: 0,
      formGenerationHits: 0,
      formGenerationMisses: 0,
      settingsOptimizationHits: 0,
      settingsOptimizationMisses: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      cacheSize: 0,
      compressionRatio: 1
    };

    this.responseTimes = [];
    this.invalidationEvents = new Set();
    this.prefetchQueue = new Map();

    this.startMetricsCollection();
    this.startCacheMaintenance();
  }

  /**
   * Cache AI processing result
   */
  public async cacheAIProcessing(
    key: string,
    result: any,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey('ai-processing', key, userId, sessionId);
    
    return this.setCacheEntry(cacheKey, result, {
      source: 'ai-processing',
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });
  }

  /**
   * Get AI processing result from cache
   */
  public async getAIProcessing<T>(
    key: string,
    userId?: string,
    sessionId?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('ai-processing', key, userId, sessionId);
    const result = await this.getCacheEntry<T>(cacheKey, 'ai-processing');
    
    if (result) {
      this.metrics.aiProcessingHits++;
    } else {
      this.metrics.aiProcessingMisses++;
    }
    
    this.updateMetrics();
    return result;
  }

  /**
   * Cache template analysis result
   */
  public async cacheTemplateAnalysis(
    templateId: string,
    analysis: any,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey('template-analysis', templateId, userId, sessionId);
    
    return this.setCacheEntry(cacheKey, analysis, {
      source: 'template-analysis',
      templateId,
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });
  }

  /**
   * Get template analysis from cache
   */
  public async getTemplateAnalysis<T>(
    templateId: string,
    userId?: string,
    sessionId?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('template-analysis', templateId, userId, sessionId);
    const result = await this.getCacheEntry<T>(cacheKey, 'template-analysis');
    
    if (result) {
      this.metrics.templateAnalysisHits++;
    } else {
      this.metrics.templateAnalysisMisses++;
    }
    
    this.updateMetrics();
    return result;
  }

  /**
   * Cache AI recommendation
   */
  public async cacheRecommendation(
    context: string,
    recommendation: any,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey('recommendation', context, userId, sessionId);
    
    return this.setCacheEntry(cacheKey, recommendation, {
      source: 'recommendation-engine',
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });
  }

  /**
   * Get AI recommendation from cache
   */
  public async getRecommendation<T>(
    context: string,
    userId?: string,
    sessionId?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('recommendation', context, userId, sessionId);
    const result = await this.getCacheEntry<T>(cacheKey, 'recommendation-engine');
    
    if (result) {
      this.metrics.recommendationHits++;
    } else {
      this.metrics.recommendationMisses++;
    }
    
    this.updateMetrics();
    return result;
  }

  /**
   * Cache form generation result
   */
  public async cacheFormGeneration(
    formType: string,
    result: any,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey('form-generation', formType, userId, sessionId);
    
    return this.setCacheEntry(cacheKey, result, {
      source: 'form-generation',
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });
  }

  /**
   * Get form generation result from cache
   */
  public async getFormGeneration<T>(
    formType: string,
    userId?: string,
    sessionId?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('form-generation', formType, userId, sessionId);
    const result = await this.getCacheEntry<T>(cacheKey, 'form-generation');
    
    if (result) {
      this.metrics.formGenerationHits++;
    } else {
      this.metrics.formGenerationMisses++;
    }
    
    this.updateMetrics();
    return result;
  }

  /**
   * Cache settings optimization result
   */
  public async cacheSettingsOptimization(
    settingsType: string,
    optimization: any,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    const cacheKey = this.generateCacheKey('settings-optimization', settingsType, userId, sessionId);
    
    return this.setCacheEntry(cacheKey, optimization, {
      source: 'settings-optimization',
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });
  }

  /**
   * Get settings optimization from cache
   */
  public async getSettingsOptimization<T>(
    settingsType: string,
    userId?: string,
    sessionId?: string
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey('settings-optimization', settingsType, userId, sessionId);
    const result = await this.getCacheEntry<T>(cacheKey, 'settings-optimization');
    
    if (result) {
      this.metrics.settingsOptimizationHits++;
    } else {
      this.metrics.settingsOptimizationMisses++;
    }
    
    this.updateMetrics();
    return result;
  }

  /**
   * Get or compute with caching
   */
  public async getOrCompute<T>(
    key: string,
    source: HT031CacheEntry['source'],
    factory: () => Promise<T> | T,
    userId?: string,
    sessionId?: string,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<T> {
    const cacheKey = this.generateCacheKey(source, key, userId, sessionId);
    const cached = await this.getCacheEntry<T>(cacheKey, source);
    
    if (cached !== null) {
      return cached;
    }

    const start = performance.now();
    const result = await factory();
    const duration = performance.now() - start;
    
    this.responseTimes.push(duration);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    await this.setCacheEntry(cacheKey, result, {
      source,
      userId,
      sessionId,
      ttl: ttl || this.config.defaultTTL,
      metadata,
      version: '1.0.0'
    });

    return result;
  }

  /**
   * Invalidate cache entries
   */
  public invalidate(pattern: string): number {
    const keys = this.cache.keys();
    const regex = new RegExp(pattern);
    let invalidated = 0;

    keys.forEach(key => {
      if (regex.test(key)) {
        this.cache.del(key);
        invalidated++;
      }
    });

    this.invalidationEvents.add(pattern);
    return invalidated;
  }

  /**
   * Invalidate user-specific cache entries
   */
  public invalidateUserCache(userId: string): number {
    return this.invalidate(`.*:${userId}:.*`);
  }

  /**
   * Invalidate session-specific cache entries
   */
  public invalidateSessionCache(sessionId: string): number {
    return this.invalidate(`.*:.*:${sessionId}`);
  }

  /**
   * Invalidate template-specific cache entries
   */
  public invalidateTemplateCache(templateId: string): number {
    return this.invalidate(`template-analysis:${templateId}:.*`);
  }

  /**
   * Prefetch cache entries
   */
  public async prefetch(
    keys: Array<{
      key: string;
      source: HT031CacheEntry['source'];
      factory: () => Promise<any> | any;
      userId?: string;
      sessionId?: string;
      ttl?: number;
    }>
  ): Promise<void> {
    if (!this.config.prefetchEnabled) return;

    const prefetchPromises = keys.map(async ({ key, source, factory, userId, sessionId, ttl }) => {
      const cacheKey = this.generateCacheKey(source, key, userId, sessionId);
      
      if (this.prefetchQueue.has(cacheKey)) {
        return this.prefetchQueue.get(cacheKey);
      }

      const promise = this.getOrCompute(key, source, factory, userId, sessionId, ttl);
      this.prefetchQueue.set(cacheKey, promise);
      
      try {
        await promise;
      } finally {
        this.prefetchQueue.delete(cacheKey);
      }
    });

    await Promise.all(prefetchPromises);
  }

  /**
   * Get cache health report
   */
  public getHealthReport(): {
    status: 'healthy' | 'warning' | 'critical';
    metrics: HT031CacheMetrics;
    issues: string[];
    recommendations: string[];
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

    // Check response time
    if (this.metrics.averageResponseTime > 1000) {
      issues.push(`High average response time: ${this.metrics.averageResponseTime.toFixed(2)}ms`);
      recommendations.push('Consider enabling compression or reducing cache size');
      status = status === 'healthy' ? 'warning' : status;
    }

    // Check cache size
    if (this.metrics.cacheSize > this.config.maxSize * 0.9) {
      issues.push(`Cache size near limit: ${this.metrics.cacheSize}/${this.config.maxSize}`);
      recommendations.push('Consider increasing max size or enabling LRU eviction');
      status = status === 'healthy' ? 'warning' : status;
    }

    return {
      status,
      metrics: this.getMetrics(),
      issues,
      recommendations
    };
  }

  /**
   * Get cache metrics
   */
  public getMetrics(): HT031CacheMetrics {
    return { ...this.metrics };
  }

  /**
   * Update cache configuration
   */
  public updateConfig(config: Partial<HT031CacheConfig>): void {
    Object.assign(this.config, config);
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.flushAll();
    this.responseTimes = [];
    this.invalidationEvents.clear();
    this.prefetchQueue.clear();
    this.resetMetrics();
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    source: string,
    key: string,
    userId?: string,
    sessionId?: string
  ): string {
    const parts = [source, key];
    
    if (this.config.enableUserSegmentation && userId) {
      parts.push(userId);
    }
    
    if (this.config.enableSessionTracking && sessionId) {
      parts.push(sessionId);
    }
    
    return parts.join(':');
  }

  /**
   * Set cache entry
   */
  private async setCacheEntry(
    key: string,
    data: any,
    options: Partial<HT031CacheEntry>
  ): Promise<boolean> {
    try {
      let processedData = data;
      let compressed = false;

      // Compress if needed
      if (this.config.compression && this.shouldCompress(data)) {
        processedData = await this.compress(data);
        compressed = true;
      }

      const entry: HT031CacheEntry = {
        data: processedData,
        timestamp: Date.now(),
        ttl: options.ttl || this.config.defaultTTL,
        source: options.source || 'ai-processing',
        userId: options.userId,
        sessionId: options.sessionId,
        templateId: options.templateId,
        metadata: options.metadata,
        compressed,
        version: options.version || '1.0.0'
      };

      return this.cache.set(key, entry, entry.ttl);
    } catch (error) {
      console.error('Failed to set cache entry:', error);
      return false;
    }
  }

  /**
   * Get cache entry
   */
  private async getCacheEntry<T>(key: string, source: HT031CacheEntry['source']): Promise<T | null> {
    try {
      const entry = this.cache.get<HT031CacheEntry<T>>(key);
      
      if (!entry) {
        return null;
      }

      // Check if entry is expired
      if (this.isExpired(entry)) {
        this.cache.del(key);
        return null;
      }

      // Check version compatibility
      if (!this.isVersionCompatible(entry.version)) {
        this.cache.del(key);
        return null;
      }

      // Decompress if needed
      let data = entry.data;
      if (entry.compressed) {
        data = await this.decompress(data);
      }

      return data;
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      return null;
    }
  }

  /**
   * Update metrics
   */
  private updateMetrics(): void {
    this.metrics.totalHits = 
      this.metrics.aiProcessingHits +
      this.metrics.templateAnalysisHits +
      this.metrics.recommendationHits +
      this.metrics.formGenerationHits +
      this.metrics.settingsOptimizationHits;

    this.metrics.totalMisses = 
      this.metrics.aiProcessingMisses +
      this.metrics.templateAnalysisMisses +
      this.metrics.recommendationMisses +
      this.metrics.formGenerationMisses +
      this.metrics.settingsOptimizationMisses;

    const total = this.metrics.totalHits + this.metrics.totalMisses;
    this.metrics.hitRate = total > 0 ? (this.metrics.totalHits / total) * 100 : 0;

    if (this.responseTimes.length > 0) {
      this.metrics.averageResponseTime = 
        this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;
    }

    this.metrics.cacheSize = this.cache.keys().length;
  }

  /**
   * Reset metrics
   */
  private resetMetrics(): void {
    this.metrics = {
      aiProcessingHits: 0,
      aiProcessingMisses: 0,
      templateAnalysisHits: 0,
      templateAnalysisMisses: 0,
      recommendationHits: 0,
      recommendationMisses: 0,
      formGenerationHits: 0,
      formGenerationMisses: 0,
      settingsOptimizationHits: 0,
      settingsOptimizationMisses: 0,
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageResponseTime: 0,
      cacheSize: 0,
      compressionRatio: 1
    };
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: HT031CacheEntry): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age > entry.ttl * 1000;
  }

  /**
   * Check version compatibility
   */
  private isVersionCompatible(version: string): boolean {
    // Simple version check - in production, you'd want more sophisticated versioning
    return version === '1.0.0';
  }

  /**
   * Check if data should be compressed
   */
  private shouldCompress(data: any): boolean {
    if (!this.config.compression) return false;
    
    const size = JSON.stringify(data).length;
    return size > this.config.compressionThreshold;
  }

  /**
   * Compress data
   */
  private async compress(data: any): Promise<any> {
    // In a real implementation, you would use a compression library like zlib
    // For now, we'll just return the data as-is
    return data;
  }

  /**
   * Decompress data
   */
  private async decompress(data: any): Promise<any> {
    // In a real implementation, you would use a compression library like zlib
    // For now, we'll just return the data as-is
    return data;
  }

  /**
   * Start metrics collection
   */
  private startMetricsCollection(): void {
    setInterval(() => {
      this.updateMetrics();
    }, 30000); // Every 30 seconds
  }

  /**
   * Start cache maintenance
   */
  private startCacheMaintenance(): void {
    setInterval(() => {
      this.performMaintenance();
    }, 300000); // Every 5 minutes
  }

  /**
   * Perform cache maintenance
   */
  private performMaintenance(): void {
    const keys = this.cache.keys();
    let cleaned = 0;

    keys.forEach(key => {
      const entry = this.cache.get<HT031CacheEntry>(key);
      if (entry && this.isExpired(entry)) {
        this.cache.del(key);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`HT-031 cache maintenance: removed ${cleaned} expired entries`);
    }
  }
}

/**
 * Global HT-031 integration cache instance
 */
export const ht031IntegrationCache = new HT031IntegrationCache({
  defaultTTL: 900, // 15 minutes
  maxSize: 3000,
  compression: true,
  compressionThreshold: 512,
  enableUserSegmentation: true,
  enableSessionTracking: true,
  enableTemplateCaching: true,
  enableAIPipelineCaching: true,
  cacheInvalidationStrategy: 'hybrid',
  prefetchEnabled: true,
  prefetchThreshold: 0.8
});
