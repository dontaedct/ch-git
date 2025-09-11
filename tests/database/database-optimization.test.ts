/**
 * HT-004.5.4: Database Optimization Test Suite
 * Comprehensive testing for database performance optimizations
 * Created: 2025-09-08T18:10:48.000Z
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { RedisCacheManager, HeroTasksCacheService, CacheFactory } from '../../lib/cache/hero-tasks-cache';
import { 
  ConnectionPoolManager, 
  QueryOptimizer, 
  SupabaseConnectionManager,
  PerformanceMonitoringService 
} from '../../lib/database/connection-pool-manager';

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const TEST_CONFIG = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: 1, // Use test database
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'test_db',
    username: process.env.DB_USER || 'test_user',
    password: process.env.DB_PASSWORD || 'test_password',
  },
  supabase: {
    url: process.env.SUPABASE_URL || 'http://localhost:54321',
    key: process.env.SUPABASE_ANON_KEY || 'test_key',
  },
};

// =============================================================================
// REDIS CACHE TESTS
// =============================================================================

describe('Redis Cache Manager', () => {
  let cacheManager: RedisCacheManager;
  
  beforeAll(async () => {
    cacheManager = new RedisCacheManager(TEST_CONFIG.redis);
    await cacheManager.connect();
  });
  
  afterAll(async () => {
    await cacheManager.disconnect();
  });
  
  beforeEach(async () => {
    await cacheManager.flush();
  });
  
  test('should connect to Redis successfully', async () => {
    const stats = await cacheManager.getStats();
    expect(stats).toBeDefined();
  });
  
  test('should set and get string values', async () => {
    const key = 'test:string';
    const value = 'test value';
    
    const setResult = await cacheManager.set(key, value);
    expect(setResult).toBe(true);
    
    const getValue = await cacheManager.get<string>(key);
    expect(getValue).toBe(value);
  });
  
  test('should set and get object values', async () => {
    const key = 'test:object';
    const value = { id: 1, name: 'test', data: { nested: true } };
    
    const setResult = await cacheManager.set(key, value);
    expect(setResult).toBe(true);
    
    const getValue = await cacheManager.get<typeof value>(key);
    expect(getValue).toEqual(value);
  });
  
  test('should handle TTL expiration', async () => {
    const key = 'test:ttl';
    const value = 'expires soon';
    
    await cacheManager.set(key, value, { ttl: 1 }); // 1 second TTL
    
    const getValue = await cacheManager.get<string>(key);
    expect(getValue).toBe(value);
    
    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const expiredValue = await cacheManager.get<string>(key);
    expect(expiredValue).toBeNull();
  });
  
  test('should delete keys', async () => {
    const key = 'test:delete';
    const value = 'to be deleted';
    
    await cacheManager.set(key, value);
    const exists = await cacheManager.exists(key);
    expect(exists).toBe(true);
    
    const deleteResult = await cacheManager.delete(key);
    expect(deleteResult).toBe(true);
    
    const getValue = await cacheManager.get<string>(key);
    expect(getValue).toBeNull();
  });
  
  test('should delete keys by pattern', async () => {
    const keys = ['test:pattern:1', 'test:pattern:2', 'test:other:1'];
    const values = ['value1', 'value2', 'value3'];
    
    for (let i = 0; i < keys.length; i++) {
      await cacheManager.set(keys[i], values[i]);
    }
    
    const deletedCount = await cacheManager.deletePattern('test:pattern:*');
    expect(deletedCount).toBe(2);
    
    const remainingValue = await cacheManager.get<string>('test:other:1');
    expect(remainingValue).toBe('value3');
  });
  
  test('should track cache statistics', async () => {
    const stats = await cacheManager.getStats();
    const initialHits = stats.hits;
    const initialMisses = stats.misses;
    
    // Generate some cache activity
    await cacheManager.set('test:stats1', 'value1');
    await cacheManager.get<string>('test:stats1'); // hit
    await cacheManager.get<string>('test:stats2'); // miss
    
    const newStats = await cacheManager.getStats();
    expect(newStats.hits).toBe(initialHits + 1);
    expect(newStats.misses).toBe(initialMisses + 1);
    expect(newStats.hitRatio).toBeGreaterThan(0);
  });
});

// =============================================================================
// HERO TASKS CACHE SERVICE TESTS
// =============================================================================

describe('Hero Tasks Cache Service', () => {
  let cacheService: HeroTasksCacheService;
  let cacheManager: RedisCacheManager;
  
  beforeAll(async () => {
    cacheManager = new RedisCacheManager(TEST_CONFIG.redis);
    await cacheManager.connect();
    cacheService = new HeroTasksCacheService(cacheManager);
  });
  
  afterAll(async () => {
    await cacheManager.disconnect();
  });
  
  beforeEach(async () => {
    await cacheManager.flush();
  });
  
  test('should cache task statistics', async () => {
    const stats = {
      totalTasks: 100,
      activeTasks: 25,
      completedTasks: 75,
      overdueTasks: 5,
    };
    
    await cacheService.setTaskStatistics(stats);
    const cachedStats = await cacheService.getTaskStatistics();
    
    expect(cachedStats).toEqual(stats);
  });
  
  test('should cache user task summary', async () => {
    const userId = 'user-123';
    const summary = {
      assignedTasks: 10,
      createdTasks: 5,
      completedTasks: 8,
      overdueTasks: 2,
    };
    
    await cacheService.setUserTaskSummary(userId, summary);
    const cachedSummary = await cacheService.getUserTaskSummary(userId);
    
    expect(cachedSummary).toEqual(summary);
  });
  
  test('should cache task dependencies', async () => {
    const taskId = 'task-123';
    const dependencies = [
      { id: 'dep-1', type: 'blocks', taskId: 'task-456' },
      { id: 'dep-2', type: 'relates_to', taskId: 'task-789' },
    ];
    
    await cacheService.setTaskDependencies(taskId, dependencies);
    const cachedDeps = await cacheService.getTaskDependencies(taskId);
    
    expect(cachedDeps).toEqual(dependencies);
  });
  
  test('should cache workflow history', async () => {
    const taskId = 'task-123';
    const history = [
      { from: 'draft', to: 'ready', timestamp: new Date() },
      { from: 'ready', to: 'in_progress', timestamp: new Date() },
    ];
    
    await cacheService.setWorkflowHistory(taskId, history);
    const cachedHistory = await cacheService.getWorkflowHistory(taskId);
    
    expect(cachedHistory).toEqual(history);
  });
  
  test('should cache task search results', async () => {
    const query = 'test query';
    const filters = { status: 'active', priority: 'high' };
    const results = [
      { id: 'task-1', title: 'Test Task 1' },
      { id: 'task-2', title: 'Test Task 2' },
    ];
    
    await cacheService.setTaskSearch(query, filters, results);
    const cachedResults = await cacheService.getTaskSearch(query, filters);
    
    expect(cachedResults).toEqual(results);
  });
  
  test('should invalidate task cache', async () => {
    const taskId = 'task-123';
    const task = { id: taskId, title: 'Test Task' };
    
    await cacheService.setTaskById(taskId, task);
    await cacheService.setSubtasksByTask(taskId, [{ id: 'sub-1', title: 'Subtask' }]);
    
    // Verify cache is populated
    expect(await cacheService.getTaskById(taskId)).toEqual(task);
    expect(await cacheService.getSubtasksByTask(taskId)).toBeDefined();
    
    // Invalidate task cache
    await cacheService.invalidateTask(taskId);
    
    // Verify cache is cleared
    expect(await cacheService.getTaskById(taskId)).toBeNull();
    expect(await cacheService.getSubtasksByTask(taskId)).toBeNull();
  });
  
  test('should invalidate user cache', async () => {
    const userId = 'user-123';
    const summary = { assignedTasks: 5 };
    
    await cacheService.setUserTaskSummary(userId, summary);
    expect(await cacheService.getUserTaskSummary(userId)).toEqual(summary);
    
    await cacheService.invalidateUser(userId);
    expect(await cacheService.getUserTaskSummary(userId)).toBeNull();
  });
});

// =============================================================================
// CONNECTION POOL MANAGER TESTS
// =============================================================================

describe('Connection Pool Manager', () => {
  let poolManager: ConnectionPoolManager;
  
  beforeAll(async () => {
    poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 100,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: false,
    });
    
    await poolManager.createPool('test', {
      ...TEST_CONFIG.database,
      min: 1,
      max: 5,
    });
  });
  
  afterAll(async () => {
    await poolManager.closeAllPools();
  });
  
  test('should create connection pool', () => {
    const pool = poolManager.getPool('test');
    expect(pool).toBeDefined();
  });
  
  test('should execute simple query', async () => {
    const result = await poolManager.executeQuery('test', 'SELECT 1 as test_value');
    expect(result).toEqual([{ test_value: 1 }]);
  });
  
  test('should execute query with parameters', async () => {
    const result = await poolManager.executeQuery(
      'test', 
      'SELECT $1 as param1, $2 as param2', 
      ['value1', 'value2']
    );
    expect(result).toEqual([{ param1: 'value1', param2: 'value2' }]);
  });
  
  test('should handle query errors', async () => {
    await expect(
      poolManager.executeQuery('test', 'SELECT * FROM non_existent_table')
    ).rejects.toThrow();
  });
  
  test('should execute transaction', async () => {
    const result = await poolManager.executeTransaction('test', async (client) => {
      const result1 = await client.query('SELECT 1 as value1');
      const result2 = await client.query('SELECT 2 as value2');
      return { value1: result1.rows[0].value1, value2: result2.rows[0].value2 };
    });
    
    expect(result).toEqual({ value1: 1, value2: 2 });
  });
  
  test('should rollback transaction on error', async () => {
    await expect(
      poolManager.executeTransaction('test', async (client) => {
        await client.query('SELECT 1');
        throw new Error('Transaction error');
      })
    ).rejects.toThrow('Transaction error');
  });
  
  test('should track query metrics', async () => {
    await poolManager.executeQuery('test', 'SELECT pg_sleep(0.1)'); // Simulate slow query
    
    const metrics = poolManager.getQueryMetrics(10);
    expect(metrics.length).toBeGreaterThan(0);
    
    const slowQueries = poolManager.getSlowQueries(50);
    expect(slowQueries.length).toBeGreaterThan(0);
  });
  
  test('should provide pool statistics', () => {
    const stats = poolManager.getPoolStats('test');
    expect(stats).toBeDefined();
    expect(stats?.totalConnections).toBeGreaterThan(0);
    expect(stats?.idleConnections).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// QUERY OPTIMIZER TESTS
// =============================================================================

describe('Query Optimizer', () => {
  let poolManager: ConnectionPoolManager;
  let optimizer: QueryOptimizer;
  
  beforeAll(async () => {
    poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 100,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: true,
    });
    
    await poolManager.createPool('test', {
      ...TEST_CONFIG.database,
      min: 1,
      max: 5,
    });
    
    optimizer = new QueryOptimizer(poolManager);
  });
  
  afterAll(async () => {
    await poolManager.closeAllPools();
  });
  
  test('should analyze query execution plan', async () => {
    const query = 'SELECT 1 as test_value';
    const analysis = await optimizer.analyzeQuery('test', query);
    
    expect(analysis).toBeDefined();
    expect(Array.isArray(analysis)).toBe(true);
  });
  
  test('should get table statistics', async () => {
    // Create a test table first
    await poolManager.executeQuery('test', `
      CREATE TEMP TABLE test_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    const stats = await optimizer.getTableStats('test', 'test_table');
    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);
  });
  
  test('should get index statistics', async () => {
    // Create a test table with index
    await poolManager.executeQuery('test', `
      CREATE TEMP TABLE test_indexed_table (
        id SERIAL PRIMARY KEY,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await poolManager.executeQuery('test', `
      CREATE INDEX idx_test_name ON test_indexed_table(name)
    `);
    
    const stats = await optimizer.getIndexStats('test', 'test_indexed_table');
    expect(stats).toBeDefined();
    expect(Array.isArray(stats)).toBe(true);
  });
  
  test('should get slow queries from pg_stat_statements', async () => {
    const slowQueries = await optimizer.getSlowQueries('test', 5);
    expect(slowQueries).toBeDefined();
    expect(Array.isArray(slowQueries)).toBe(true);
  });
});

// =============================================================================
// PERFORMANCE MONITORING SERVICE TESTS
// =============================================================================

describe('Performance Monitoring Service', () => {
  let poolManager: ConnectionPoolManager;
  let monitoringService: PerformanceMonitoringService;
  
  beforeAll(async () => {
    poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 100,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: false,
    });
    
    await poolManager.createPool('test', {
      ...TEST_CONFIG.database,
      min: 1,
      max: 5,
    });
    
    monitoringService = new PerformanceMonitoringService(poolManager);
  });
  
  afterAll(async () => {
    monitoringService.stopMonitoring();
    await poolManager.closeAllPools();
  });
  
  test('should generate performance report', async () => {
    const report = await monitoringService.generatePerformanceReport();
    
    expect(report).toBeDefined();
    expect(report.timestamp).toBeInstanceOf(Date);
    expect(report.poolStats).toBeDefined();
    expect(report.slowQueries).toBeDefined();
    expect(report.recentMetrics).toBeDefined();
    expect(report.recommendations).toBeDefined();
    expect(Array.isArray(report.recommendations)).toBe(true);
  });
  
  test('should start and stop monitoring', () => {
    monitoringService.startMonitoring(1000); // 1 second interval
    expect(monitoringService).toBeDefined();
    
    monitoringService.stopMonitoring();
    expect(monitoringService).toBeDefined();
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe('Database Optimization Integration Tests', () => {
  let cacheService: HeroTasksCacheService;
  let poolManager: ConnectionPoolManager;
  let supabaseManager: SupabaseConnectionManager;
  
  beforeAll(async () => {
    // Setup cache
    const cacheManager = new RedisCacheManager(TEST_CONFIG.redis);
    await cacheManager.connect();
    cacheService = new HeroTasksCacheService(cacheManager);
    
    // Setup connection pool
    poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 100,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: false,
    });
    
    await poolManager.createPool('hero_tasks', {
      ...TEST_CONFIG.database,
      min: 2,
      max: 10,
    });
    
    // Setup Supabase manager
    supabaseManager = new SupabaseConnectionManager(
      TEST_CONFIG.supabase.url,
      TEST_CONFIG.supabase.key,
      poolManager
    );
  });
  
  afterAll(async () => {
    await poolManager.closeAllPools();
  });
  
  test('should handle end-to-end task operations with caching', async () => {
    const taskId = 'integration-test-task';
    const task = {
      id: taskId,
      title: 'Integration Test Task',
      status: 'draft',
      priority: 'medium',
      type: 'test',
    };
    
    // Cache the task
    await cacheService.setTaskById(taskId, task);
    
    // Verify cache hit
    const cachedTask = await cacheService.getTaskById(taskId);
    expect(cachedTask).toEqual(task);
    
    // Simulate database query with cache fallback
    const dbTask = await poolManager.executeQuery(
      'hero_tasks',
      'SELECT $1 as id, $2 as title, $3 as status',
      [taskId, task.title, task.status]
    );
    
    expect(dbTask[0]).toEqual({
      id: taskId,
      title: task.title,
      status: task.status,
    });
    
    // Invalidate cache
    await cacheService.invalidateTask(taskId);
    
    // Verify cache miss
    const invalidatedTask = await cacheService.getTaskById(taskId);
    expect(invalidatedTask).toBeNull();
  });
  
  test('should handle concurrent operations', async () => {
    const promises = [];
    
    // Create multiple concurrent operations
    for (let i = 0; i < 10; i++) {
      promises.push(
        poolManager.executeQuery('hero_tasks', 'SELECT $1 as value', [i])
      );
    }
    
    const results = await Promise.all(promises);
    expect(results).toHaveLength(10);
    
    for (let i = 0; i < 10; i++) {
      expect(results[i][0].value).toBe(i);
    }
  });
  
  test('should handle cache and database consistency', async () => {
    const taskId = 'consistency-test-task';
    const task = { id: taskId, title: 'Consistency Test', status: 'active' };
    
    // Set in cache
    await cacheService.setTaskById(taskId, task);
    
    // Simulate database update
    const updatedTask = { ...task, status: 'completed' };
    await poolManager.executeQuery(
      'hero_tasks',
      'UPDATE tasks SET status = $1 WHERE id = $2',
      [updatedTask.status, taskId]
    );
    
    // Invalidate cache to maintain consistency
    await cacheService.invalidateTask(taskId);
    
    // Verify cache is cleared
    const cachedTask = await cacheService.getTaskById(taskId);
    expect(cachedTask).toBeNull();
  });
});

// =============================================================================
// PERFORMANCE BENCHMARKS
// =============================================================================

describe('Performance Benchmarks', () => {
  let cacheService: HeroTasksCacheService;
  let poolManager: ConnectionPoolManager;
  
  beforeAll(async () => {
    const cacheManager = new RedisCacheManager(TEST_CONFIG.redis);
    await cacheManager.connect();
    cacheService = new HeroTasksCacheService(cacheManager);
    
    poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 50,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: false,
    });
    
    await poolManager.createPool('benchmark', {
      ...TEST_CONFIG.database,
      min: 5,
      max: 20,
    });
  });
  
  afterAll(async () => {
    await poolManager.closeAllPools();
  });
  
  test('should benchmark cache performance', async () => {
    const iterations = 1000;
    const startTime = Date.now();
    
    // Benchmark cache operations
    for (let i = 0; i < iterations; i++) {
      const key = `benchmark:${i}`;
      const value = { id: i, data: `test data ${i}` };
      
      await cacheService.setTaskById(key, value);
      await cacheService.getTaskById(key);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const operationsPerSecond = (iterations * 2) / (duration / 1000);
    
    console.log(`Cache benchmark: ${operationsPerSecond.toFixed(2)} ops/sec`);
    expect(operationsPerSecond).toBeGreaterThan(100); // Minimum 100 ops/sec
  });
  
  test('should benchmark database performance', async () => {
    const iterations = 100;
    const startTime = Date.now();
    
    // Benchmark database operations
    for (let i = 0; i < iterations; i++) {
      await poolManager.executeQuery(
        'benchmark',
        'SELECT $1 as value, NOW() as timestamp',
        [i]
      );
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    const operationsPerSecond = iterations / (duration / 1000);
    
    console.log(`Database benchmark: ${operationsPerSecond.toFixed(2)} ops/sec`);
    expect(operationsPerSecond).toBeGreaterThan(10); // Minimum 10 ops/sec
  });
  
  test('should benchmark cache vs database performance', async () => {
    const iterations = 100;
    
    // Benchmark cache
    const cacheStartTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      const key = `comparison:${i}`;
      const value = { id: i, cached: true };
      
      await cacheService.setTaskById(key, value);
      await cacheService.getTaskById(key);
    }
    const cacheDuration = Date.now() - cacheStartTime;
    
    // Benchmark database
    const dbStartTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      await poolManager.executeQuery(
        'benchmark',
        'SELECT $1 as id, true as cached',
        [i]
      );
    }
    const dbDuration = Date.now() - dbStartTime;
    
    const cacheOpsPerSec = (iterations * 2) / (cacheDuration / 1000);
    const dbOpsPerSec = iterations / (dbDuration / 1000);
    
    console.log(`Cache: ${cacheOpsPerSec.toFixed(2)} ops/sec`);
    console.log(`Database: ${dbOpsPerSec.toFixed(2)} ops/sec`);
    console.log(`Cache is ${(cacheOpsPerSec / dbOpsPerSec).toFixed(2)}x faster`);
    
    expect(cacheOpsPerSec).toBeGreaterThan(dbOpsPerSec);
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe('Error Handling', () => {
  test('should handle Redis connection errors gracefully', async () => {
    const invalidConfig = {
      host: 'invalid-host',
      port: 9999,
    };
    
    const cacheManager = new RedisCacheManager(invalidConfig);
    
    // Should not throw during construction
    expect(cacheManager).toBeDefined();
    
    // Should handle connection errors gracefully
    const result = await cacheManager.get('test-key');
    expect(result).toBeNull();
  });
  
  test('should handle database connection errors gracefully', async () => {
    const invalidConfig = {
      host: 'invalid-host',
      port: 9999,
      database: 'invalid_db',
      username: 'invalid_user',
      password: 'invalid_password',
    };
    
    const poolManager = new ConnectionPoolManager({
      slowQueryThreshold: 100,
      enableQueryLogging: true,
      enableMetrics: true,
      maxQueryLogSize: 1000,
      enableExplainAnalyze: false,
    });
    
    await expect(
      poolManager.createPool('invalid', invalidConfig)
    ).rejects.toThrow();
  });
  
  test('should handle cache service errors gracefully', async () => {
    const cacheManager = new RedisCacheManager({
      host: 'invalid-host',
      port: 9999,
    });
    
    const cacheService = new HeroTasksCacheService(cacheManager);
    
    // Should handle errors gracefully
    const result = await cacheService.getTaskStatistics();
    expect(result).toBeNull();
  });
});

export default {};
