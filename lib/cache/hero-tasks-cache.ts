/**
 * HT-004.5.4: Redis Caching Layer Implementation
 * Advanced caching system for Hero Tasks with Redis integration
 * Created: 2025-09-08T18:10:48.000Z
 */

import { createClient, RedisClientType } from 'redis';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  keepAlive?: number;
  family?: number;
  connectTimeout?: number;
  commandTimeout?: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  maxSize?: number; // Maximum size in bytes
  evictionPolicy?: 'lru' | 'fifo' | 'ttl';
  compress?: boolean;
  serialize?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRatio: number;
  memoryUsage: number;
  keyCount: number;
}

export interface CacheKey {
  prefix: string;
  identifier: string;
  version?: string;
}

// =============================================================================
// CACHE KEY GENERATORS
// =============================================================================

export class CacheKeyGenerator {
  private static readonly VERSION = 'v1';
  
  static taskStatistics(): CacheKey {
    return {
      prefix: 'hero_tasks:stats',
      identifier: 'global',
      version: this.VERSION
    };
  }
  
  static userTaskSummary(userId: string): CacheKey {
    return {
      prefix: 'hero_tasks:user_summary',
      identifier: userId,
      version: this.VERSION
    };
  }
  
  static taskDependencies(taskId: string): CacheKey {
    return {
      prefix: 'hero_tasks:dependencies',
      identifier: taskId,
      version: this.VERSION
    };
  }
  
  static workflowHistory(taskId: string, limit: number = 50): CacheKey {
    return {
      prefix: 'hero_tasks:workflow_history',
      identifier: `${taskId}:${limit}`,
      version: this.VERSION
    };
  }
  
  static taskSearch(query: string, filters: Record<string, any>): CacheKey {
    const filterHash = Buffer.from(JSON.stringify(filters)).toString('base64').slice(0, 8);
    return {
      prefix: 'hero_tasks:search',
      identifier: `${query}:${filterHash}`,
      version: this.VERSION
    };
  }
  
  static taskById(taskId: string): CacheKey {
    return {
      prefix: 'hero_tasks:task',
      identifier: taskId,
      version: this.VERSION
    };
  }
  
  static subtasksByTask(taskId: string): CacheKey {
    return {
      prefix: 'hero_tasks:subtasks',
      identifier: taskId,
      version: this.VERSION
    };
  }
  
  static actionsBySubtask(subtaskId: string): CacheKey {
    return {
      prefix: 'hero_tasks:actions',
      identifier: subtaskId,
      version: this.VERSION
    };
  }
  
  static generateKey(cacheKey: CacheKey): string {
    const version = cacheKey.version || 'v1';
    return `${cacheKey.prefix}:${version}:${cacheKey.identifier}`;
  }
}

// =============================================================================
// REDIS CACHE MANAGER
// =============================================================================

export class RedisCacheManager {
  private client: RedisClientType;
  private stats: CacheStats;
  private isConnected: boolean = false;
  
  constructor(config: CacheConfig) {
    this.client = createClient({
      socket: {
        host: config.host,
        port: config.port,
        connectTimeout: config.connectTimeout || 10000,
        keepAlive: config.keepAlive || 30000,
        family: config.family || 4,
      },
      password: config.password,
      database: config.db || 0,
      retryDelayOnFailover: config.retryDelayOnFailover || 100,
      maxRetriesPerRequest: config.maxRetriesPerRequest || 3,
      lazyConnect: config.lazyConnect || true,
    } as any);
    
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      hitRatio: 0,
      memoryUsage: 0,
      keyCount: 0,
    };
    
    this.setupEventHandlers();
  }
  
  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      console.log('Redis client connected');
      this.isConnected = true;
    });
    
    this.client.on('error', (error: any) => {
      console.error('Redis client error:', error);
      this.stats.errors++;
      this.isConnected = false;
    });
    
    this.client.on('end', () => {
      console.log('Redis client disconnected');
      this.isConnected = false;
    });
    
    this.client.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }
  
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }
  
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const value = await this.client.get(key);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRatio();
        return null;
      }
      
      this.stats.hits++;
      this.updateHitRatio();
      
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.errors++;
      return null;
    }
  }
  
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      let serializedValue: string;
      
      if (typeof value === 'string') {
        serializedValue = value;
      } else {
        serializedValue = JSON.stringify(value);
      }
      
      const setOptions: any = {};
      
      if (options.ttl) {
        setOptions.EX = options.ttl;
      }
      
      await this.client.set(key, serializedValue, setOptions);
      this.stats.sets++;
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.client.del(key);
      this.stats.deletes++;
      
      return result > 0;
    } catch (error) {
      console.error('Cache delete error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await this.client.del(keys);
      this.stats.deletes += result;
      
      return result;
    } catch (error) {
      console.error('Cache delete pattern error:', error);
      this.stats.errors++;
      return 0;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const result = await this.client.expire(key, ttl);
      return Number(result) === 1;
    } catch (error) {
      console.error('Cache expire error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  async getStats(): Promise<CacheStats> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      const info = await this.client.info('memory');
      const memoryMatch = info.match(/used_memory:(\d+)/);
      this.stats.memoryUsage = memoryMatch ? parseInt(memoryMatch[1]) : 0;
      
      const keyCount = await this.client.dbSize();
      this.stats.keyCount = keyCount;
      
      return { ...this.stats };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { ...this.stats };
    }
  }
  
  async flush(): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      
      await this.client.flushDb();
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        hitRatio: 0,
        memoryUsage: 0,
        keyCount: 0,
      };
      
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      this.stats.errors++;
      return false;
    }
  }
  
  private updateHitRatio(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRatio = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// =============================================================================
// HERO TASKS CACHE SERVICE
// =============================================================================

export class HeroTasksCacheService {
  private cacheManager: RedisCacheManager;
  private defaultTTL: number = 3600; // 1 hour
  
  constructor(cacheManager: RedisCacheManager) {
    this.cacheManager = cacheManager;
  }
  
  // Task Statistics Caching
  async getTaskStatistics(): Promise<any | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskStatistics());
    return await this.cacheManager.get(key);
  }
  
  async setTaskStatistics(stats: any): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskStatistics());
    return await this.cacheManager.set(key, stats, { ttl: 300 }); // 5 minutes
  }
  
  // User Task Summary Caching
  async getUserTaskSummary(userId: string): Promise<any | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.userTaskSummary(userId));
    return await this.cacheManager.get(key);
  }
  
  async setUserTaskSummary(userId: string, summary: any): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.userTaskSummary(userId));
    return await this.cacheManager.set(key, summary, { ttl: 600 }); // 10 minutes
  }
  
  // Task Dependencies Caching
  async getTaskDependencies(taskId: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskDependencies(taskId));
    return await this.cacheManager.get(key);
  }
  
  async setTaskDependencies(taskId: string, dependencies: any[]): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskDependencies(taskId));
    return await this.cacheManager.set(key, dependencies, { ttl: 1800 }); // 30 minutes
  }
  
  // Workflow History Caching
  async getWorkflowHistory(taskId: string, limit: number = 50): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.workflowHistory(taskId, limit));
    return await this.cacheManager.get(key);
  }
  
  async setWorkflowHistory(taskId: string, history: any[], limit: number = 50): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.workflowHistory(taskId, limit));
    return await this.cacheManager.set(key, history, { ttl: 60 }); // 1 minute
  }
  
  // Task Search Caching
  async getTaskSearch(query: string, filters: Record<string, any>): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskSearch(query, filters));
    return await this.cacheManager.get(key);
  }
  
  async setTaskSearch(query: string, filters: Record<string, any>, results: any[]): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskSearch(query, filters));
    return await this.cacheManager.set(key, results, { ttl: 300 }); // 5 minutes
  }
  
  // Task by ID Caching
  async getTaskById(taskId: string): Promise<any | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskById(taskId));
    return await this.cacheManager.get(key);
  }
  
  async setTaskById(taskId: string, task: any): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.taskById(taskId));
    return await this.cacheManager.set(key, task, { ttl: 1800 }); // 30 minutes
  }
  
  // Subtasks Caching
  async getSubtasksByTask(taskId: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.subtasksByTask(taskId));
    return await this.cacheManager.get(key);
  }
  
  async setSubtasksByTask(taskId: string, subtasks: any[]): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.subtasksByTask(taskId));
    return await this.cacheManager.set(key, subtasks, { ttl: 1800 }); // 30 minutes
  }
  
  // Actions Caching
  async getActionsBySubtask(subtaskId: string): Promise<any[] | null> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.actionsBySubtask(subtaskId));
    return await this.cacheManager.get(key);
  }
  
  async setActionsBySubtask(subtaskId: string, actions: any[]): Promise<boolean> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.actionsBySubtask(subtaskId));
    return await this.cacheManager.set(key, actions, { ttl: 1800 }); // 30 minutes
  }
  
  // Cache Invalidation
  async invalidateTask(taskId: string): Promise<void> {
    const patterns = [
      CacheKeyGenerator.generateKey(CacheKeyGenerator.taskById(taskId)),
      CacheKeyGenerator.generateKey(CacheKeyGenerator.subtasksByTask(taskId)),
      CacheKeyGenerator.generateKey(CacheKeyGenerator.taskDependencies(taskId)),
      CacheKeyGenerator.generateKey(CacheKeyGenerator.workflowHistory(taskId)),
    ];
    
    for (const pattern of patterns) {
      await this.cacheManager.delete(pattern);
    }
    
    // Also invalidate global statistics
    await this.cacheManager.delete(CacheKeyGenerator.generateKey(CacheKeyGenerator.taskStatistics()));
  }
  
  async invalidateUser(userId: string): Promise<void> {
    const key = CacheKeyGenerator.generateKey(CacheKeyGenerator.userTaskSummary(userId));
    await this.cacheManager.delete(key);
  }
  
  async invalidateSearch(): Promise<void> {
    const pattern = 'hero_tasks:search:*';
    await this.cacheManager.deletePattern(pattern);
  }
  
  async invalidateAll(): Promise<void> {
    await this.cacheManager.flush();
  }
  
  // Cache Statistics
  async getCacheStats(): Promise<CacheStats> {
    return await this.cacheManager.getStats();
  }
}

// =============================================================================
// CACHE FACTORY
// =============================================================================

export class CacheFactory {
  private static instance: HeroTasksCacheService | null = null;
  
  static async create(config: CacheConfig): Promise<HeroTasksCacheService> {
    if (!this.instance) {
      const cacheManager = new RedisCacheManager(config);
      await cacheManager.connect();
      this.instance = new HeroTasksCacheService(cacheManager);
    }
    return this.instance;
  }
  
  static getInstance(): HeroTasksCacheService | null {
    return this.instance;
  }
  
  static async destroy(): Promise<void> {
    if (this.instance) {
      const cacheManager = (this.instance as any).cacheManager;
      await cacheManager.disconnect();
      this.instance = null;
    }
  }
}

// =============================================================================
// CACHE MIDDLEWARE
// =============================================================================

export function createCacheMiddleware(cacheService: HeroTasksCacheService) {
  return {
    async withCache<T>(
      key: string,
      fetcher: () => Promise<T>,
      options: CacheOptions = {}
    ): Promise<T> {
      // Try to get from cache first
      const cached = await cacheService.getTaskById(key);
      if (cached !== null) {
        return cached;
      }
      
      // Fetch from source
      const data = await fetcher();
      
      // Store in cache
      await cacheService.setTaskById(key, data);
      
      return data;
    },
    
    async withCachePattern<T>(
      pattern: string,
      fetcher: () => Promise<T>,
      options: CacheOptions = {}
    ): Promise<T> {
      // For pattern-based caching, we'll use a hash of the pattern
      const key = `pattern:${Buffer.from(pattern).toString('base64')}`;
      
      // Try to get from cache first
      const cached = await cacheService.getTaskById(key);
      if (cached !== null) {
        return cached;
      }
      
      // Fetch from source
      const data = await fetcher();
      
      // Store in cache
      await cacheService.setTaskById(key, data);
      
      return data;
    }
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export default HeroTasksCacheService;
