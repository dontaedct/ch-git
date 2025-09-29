/**
 * Consultation Data Caching System
 * HT-030.4.2: Performance Optimization & Production Readiness
 */

import { createClient, RedisClientType } from 'redis';

// Cache key prefixes
const CACHE_PREFIXES = {
  CONSULTATION: 'consultation:',
  AI_RESPONSE: 'ai_response:',
  PDF_CACHE: 'pdf_cache:',
  EMAIL_TEMPLATE: 'email_template:',
  SERVICE_PACKAGE: 'service_package:',
  QUESTIONNAIRE: 'questionnaire:',
  USER_SESSION: 'user_session:',
} as const;

// Cache TTL (Time To Live) in seconds
const CACHE_TTL = {
  CONSULTATION: 3600, // 1 hour
  AI_RESPONSE: 1800, // 30 minutes
  PDF_CACHE: 7200, // 2 hours
  EMAIL_TEMPLATE: 86400, // 24 hours
  SERVICE_PACKAGE: 14400, // 4 hours
  QUESTIONNAIRE: 3600, // 1 hour
  USER_SESSION: 1800, // 30 minutes
} as const;

// Cache interfaces
interface CacheConfig {
  redis: {
    url?: string;
    host?: string;
    port?: number;
    password?: string;
  };
  fallback: {
    enabled: boolean;
    maxSize: number;
    ttl: number;
  };
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface ConsultationCacheData {
  id: string;
  client: {
    name: string;
    email: string;
    company: string;
  };
  responses: Record<string, any>;
  analysis?: string;
  recommendations?: any[];
  next_steps?: string[];
  created_at: string;
}

interface AIResponseCacheData {
  prompt_hash: string;
  response: {
    analysis: string;
    recommendations: any[];
    next_steps: string[];
    priority_score: number;
  };
  model: string;
  tokens_used: number;
}

// In-memory fallback cache
class FallbackCache {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttl: number): void {
    // Remove expired items and maintain size limit
    this.cleanup();

    if (this.cache.size >= this.maxSize) {
      // Remove oldest item
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
      key,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    memory: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need hit tracking for accurate rate
      memory: JSON.stringify([...this.cache.values()]).length,
    };
  }
}

// Main cache class
export class ConsultationCache {
  private redis: RedisClientType | null = null;
  private fallbackCache: FallbackCache;
  private config: CacheConfig;
  private connected = false;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      redis: {
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
      fallback: {
        enabled: true,
        maxSize: 1000,
        ttl: 3600, // 1 hour
      },
      ...config,
    };

    this.fallbackCache = new FallbackCache(this.config.fallback.maxSize);
    this.initializeRedis();
  }

  private async initializeRedis(): Promise<void> {
    try {
      if (this.config.redis.url) {
        this.redis = createClient({ url: this.config.redis.url });
      } else {
        this.redis = createClient({
          socket: {
            host: this.config.redis.host,
            port: this.config.redis.port,
          },
          password: this.config.redis.password,
        });
      }

      await this.redis.connect();
      await this.redis.ping();
      this.connected = true;
      console.log('Redis cache connected successfully');
    } catch (error) {
      console.warn('Redis connection failed, using fallback cache:', error);
      this.redis = null;
      this.connected = false;
    }
  }

  private getKey(prefix: string, id: string): string {
    return `${prefix}${id}`;
  }

  /**
   * Generic cache set method
   */
  async set<T>(prefix: string, id: string, data: T, ttl: number): Promise<void> {
    const key = this.getKey(prefix, id);

    try {
      if (this.redis && this.connected) {
        await this.redis.setEx(key, ttl, JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Redis set failed, using fallback:', error);
    }

    // Always use fallback as backup
    if (this.config.fallback.enabled) {
      this.fallbackCache.set(key, data, ttl);
    }
  }

  /**
   * Generic cache get method
   */
  async get<T>(prefix: string, id: string): Promise<T | null> {
    const key = this.getKey(prefix, id);

    try {
      if (this.redis && this.connected) {
        const result = await this.redis.get(key);
        if (result) {
          return JSON.parse(result) as T;
        }
      }
    } catch (error) {
      console.warn('Redis get failed, using fallback:', error);
    }

    // Fallback to in-memory cache
    if (this.config.fallback.enabled) {
      return this.fallbackCache.get<T>(key);
    }

    return null;
  }

  /**
   * Generic cache delete method
   */
  async delete(prefix: string, id: string): Promise<void> {
    const key = this.getKey(prefix, id);

    try {
      if (this.redis && this.connected) {
        await this.redis.del(key);
      }
    } catch (error) {
      console.warn('Redis delete failed:', error);
    }

    if (this.config.fallback.enabled) {
      this.fallbackCache.delete(key);
    }
  }

  // Consultation-specific cache methods

  /**
   * Cache consultation data
   */
  async cacheConsultation(consultation: ConsultationCacheData): Promise<void> {
    await this.set(
      CACHE_PREFIXES.CONSULTATION,
      consultation.id,
      consultation,
      CACHE_TTL.CONSULTATION
    );
  }

  /**
   * Get cached consultation
   */
  async getConsultation(id: string): Promise<ConsultationCacheData | null> {
    return this.get<ConsultationCacheData>(CACHE_PREFIXES.CONSULTATION, id);
  }

  /**
   * Cache AI response
   */
  async cacheAIResponse(promptHash: string, response: AIResponseCacheData): Promise<void> {
    await this.set(
      CACHE_PREFIXES.AI_RESPONSE,
      promptHash,
      response,
      CACHE_TTL.AI_RESPONSE
    );
  }

  /**
   * Get cached AI response
   */
  async getAIResponse(promptHash: string): Promise<AIResponseCacheData | null> {
    return this.get<AIResponseCacheData>(CACHE_PREFIXES.AI_RESPONSE, promptHash);
  }

  /**
   * Cache PDF buffer
   */
  async cachePDF(consultationId: string, pdfBuffer: Buffer): Promise<void> {
    const pdfData = {
      buffer: pdfBuffer.toString('base64'),
      size: pdfBuffer.length,
      generated_at: Date.now(),
    };

    await this.set(
      CACHE_PREFIXES.PDF_CACHE,
      consultationId,
      pdfData,
      CACHE_TTL.PDF_CACHE
    );
  }

  /**
   * Get cached PDF
   */
  async getPDF(consultationId: string): Promise<Buffer | null> {
    const cached = await this.get<{
      buffer: string;
      size: number;
      generated_at: number;
    }>(CACHE_PREFIXES.PDF_CACHE, consultationId);

    if (cached) {
      return Buffer.from(cached.buffer, 'base64');
    }

    return null;
  }

  /**
   * Cache email template
   */
  async cacheEmailTemplate(templateId: string, compiledTemplate: string): Promise<void> {
    await this.set(
      CACHE_PREFIXES.EMAIL_TEMPLATE,
      templateId,
      { compiledTemplate, cached_at: Date.now() },
      CACHE_TTL.EMAIL_TEMPLATE
    );
  }

  /**
   * Get cached email template
   */
  async getEmailTemplate(templateId: string): Promise<string | null> {
    const cached = await this.get<{
      compiledTemplate: string;
      cached_at: number;
    }>(CACHE_PREFIXES.EMAIL_TEMPLATE, templateId);

    return cached?.compiledTemplate || null;
  }

  /**
   * Cache service packages
   */
  async cacheServicePackages(packages: any[]): Promise<void> {
    await this.set(
      CACHE_PREFIXES.SERVICE_PACKAGE,
      'all',
      { packages, cached_at: Date.now() },
      CACHE_TTL.SERVICE_PACKAGE
    );
  }

  /**
   * Get cached service packages
   */
  async getServicePackages(): Promise<any[] | null> {
    const cached = await this.get<{
      packages: any[];
      cached_at: number;
    }>(CACHE_PREFIXES.SERVICE_PACKAGE, 'all');

    return cached?.packages || null;
  }

  /**
   * Cache questionnaire configuration
   */
  async cacheQuestionnaire(businessType: string, config: any): Promise<void> {
    await this.set(
      CACHE_PREFIXES.QUESTIONNAIRE,
      businessType,
      config,
      CACHE_TTL.QUESTIONNAIRE
    );
  }

  /**
   * Get cached questionnaire
   */
  async getQuestionnaire(businessType: string): Promise<any | null> {
    return this.get(CACHE_PREFIXES.QUESTIONNAIRE, businessType);
  }

  /**
   * Cache user session data
   */
  async cacheUserSession(sessionId: string, sessionData: any): Promise<void> {
    await this.set(
      CACHE_PREFIXES.USER_SESSION,
      sessionId,
      sessionData,
      CACHE_TTL.USER_SESSION
    );
  }

  /**
   * Get cached user session
   */
  async getUserSession(sessionId: string): Promise<any | null> {
    return this.get(CACHE_PREFIXES.USER_SESSION, sessionId);
  }

  /**
   * Clear all consultation caches
   */
  async clearConsultationCaches(consultationId: string): Promise<void> {
    const promises = [
      this.delete(CACHE_PREFIXES.CONSULTATION, consultationId),
      this.delete(CACHE_PREFIXES.PDF_CACHE, consultationId),
    ];

    await Promise.all(promises);
  }

  /**
   * Warm up cache with frequently accessed data
   */
  async warmupCache(): Promise<void> {
    try {
      // Preload service packages if they exist in database
      // This would typically fetch from database and cache
      console.log('Cache warmup initiated...');

      // Example: Preload common questionnaire configurations
      const commonBusinessTypes = ['SaaS', 'E-commerce', 'Enterprise', 'Startup'];

      for (const businessType of commonBusinessTypes) {
        // This would typically fetch questionnaire config from database
        const questionnaire = {
          business_type: businessType,
          questions: [], // Would be populated from database
          cached_at: Date.now(),
        };

        await this.cacheQuestionnaire(businessType, questionnaire);
      }

      console.log('Cache warmup completed');
    } catch (error) {
      console.warn('Cache warmup failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    redis: {
      connected: boolean;
      memory?: string;
      keys?: number;
    };
    fallback: {
      size: number;
      maxSize: number;
      memory: number;
    };
  }> {
    const stats: any = {
      redis: {
        connected: this.connected,
      },
      fallback: this.fallbackCache.getStats(),
    };

    if (this.redis && this.connected) {
      try {
        const info = await this.redis.info('memory');
        const dbsize = await this.redis.dbSize();

        stats.redis.memory = info.match(/used_memory_human:([^\r\n]+)/)?.[1];
        stats.redis.keys = dbsize;
      } catch (error) {
        console.warn('Failed to get Redis stats:', error);
      }
    }

    return stats;
  }

  /**
   * Health check for cache system
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    redis: boolean;
    fallback: boolean;
    details: Record<string, any>;
  }> {
    const health = {
      status: 'healthy' as const,
      redis: false,
      fallback: true,
      details: {} as Record<string, any>,
    };

    // Test Redis connection
    try {
      if (this.redis) {
        await this.redis.ping();
        health.redis = true;
      }
    } catch (error) {
      health.details.redis_error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Test fallback cache
    try {
      const testKey = 'health_check_test';
      this.fallbackCache.set(testKey, { test: true }, 60);
      const result = this.fallbackCache.get(testKey);

      if (!result) {
        health.fallback = false;
        health.details.fallback_error = 'Fallback cache test failed';
      }

      this.fallbackCache.delete(testKey);
    } catch (error) {
      health.fallback = false;
      health.details.fallback_error = error instanceof Error ? error.message : 'Unknown error';
    }

    // Determine overall health
    if (!health.redis && !health.fallback) {
      health.status = 'unhealthy';
    } else if (!health.redis || !health.fallback) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Cleanup expired cache entries
   */
  async cleanup(): Promise<void> {
    // Redis handles TTL automatically, but we can clean up fallback cache
    if (this.config.fallback.enabled) {
      // The cleanup is handled automatically in FallbackCache methods
      console.log('Cache cleanup completed');
    }
  }

  /**
   * Close cache connections
   */
  async close(): Promise<void> {
    if (this.redis) {
      await this.redis.disconnect();
      this.redis = null;
      this.connected = false;
    }

    this.fallbackCache.clear();
  }
}

// Create hash for cache keys
export function createCacheHash(data: any): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex')
    .substring(0, 16);
}

// Singleton instance
let cacheInstance: ConsultationCache | null = null;

/**
 * Get or create cache instance
 */
export function getConsultationCache(config?: Partial<CacheConfig>): ConsultationCache {
  if (!cacheInstance) {
    cacheInstance = new ConsultationCache(config);
  }
  return cacheInstance;
}

/**
 * Close cache instance
 */
export async function closeConsultationCache(): Promise<void> {
  if (cacheInstance) {
    await cacheInstance.close();
    cacheInstance = null;
  }
}

export default ConsultationCache;