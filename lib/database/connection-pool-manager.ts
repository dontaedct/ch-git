/**
 * HT-004.5.4: Database Connection Pooling and Query Optimization
 * Advanced connection management and query performance monitoring
 * Created: 2025-09-08T18:10:48.000Z
 */

import { Pool, PoolClient, PoolConfig } from 'pg';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface ConnectionPoolConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  min?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  maxLifetimeSeconds?: number;
  statementTimeout?: number;
  queryTimeout?: number;
}

export interface QueryMetrics {
  query: string;
  executionTime: number;
  rowCount: number;
  timestamp: Date;
  connectionId: string;
  poolName: string;
}

export interface PoolStats {
  totalConnections: number;
  idleConnections: number;
  waitingClients: number;
  totalQueries: number;
  averageQueryTime: number;
  errorCount: number;
  lastActivity: Date;
}

export interface QueryPerformanceConfig {
  slowQueryThreshold: number; // milliseconds
  enableQueryLogging: boolean;
  enableMetrics: boolean;
  maxQueryLogSize: number;
  enableExplainAnalyze: boolean;
}

// =============================================================================
// CONNECTION POOL MANAGER
// =============================================================================

class ConnectionPoolManager {
  private pools: Map<string, Pool> = new Map();
  private metrics: QueryMetrics[] = [];
  private config: QueryPerformanceConfig;
  
  constructor(config: QueryPerformanceConfig) {
    this.config = config;
  }
  
  async createPool(name: string, config: ConnectionPoolConfig): Promise<Pool> {
    const poolConfig: PoolConfig = {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
      min: config.min || 2,
      max: config.max || 10,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 10000,
      statement_timeout: config.statementTimeout || 30000,
      query_timeout: config.queryTimeout || 30000,
    };
    
    const pool = new Pool(poolConfig);
    
    // Set up event handlers
    pool.on('connect', (client: PoolClient) => {
      console.log(`Pool ${name}: New client connected`);
    });
    
    pool.on('acquire', (client: PoolClient) => {
      console.log(`Pool ${name}: Client acquired`);
    });
    
    pool.on('remove', (client: PoolClient) => {
      console.log(`Pool ${name}: Client removed`);
    });
    
    pool.on('error', (err: Error) => {
      console.error(`Pool ${name} error:`, err);
    });
    
    this.pools.set(name, pool);
    return pool;
  }
  
  getPool(name: string): Pool | undefined {
    return this.pools.get(name);
  }
  
  async executeQuery<T = any>(
    poolName: string,
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    const pool = this.getPool(poolName);
    if (!pool) {
      throw new Error(`Pool ${poolName} not found`);
    }
    
    const startTime = Date.now();
    let client: PoolClient | null = null;
    
    try {
      client = await pool.connect();
      
      // Add query timeout if configured
      if (this.config.slowQueryThreshold > 0) {
        await client.query(`SET statement_timeout = ${this.config.slowQueryThreshold}`);
      }
      
      const result = await client.query(query, params);
      const executionTime = Date.now() - startTime;
      
      // Log slow queries
      if (executionTime > this.config.slowQueryThreshold) {
        console.warn(`Slow query detected (${executionTime}ms):`, query);
      }
      
      // Record metrics
      if (this.config.enableMetrics) {
        this.recordQueryMetrics({
          query: query.substring(0, 200), // Truncate for storage
          executionTime,
          rowCount: result.rowCount || 0,
          timestamp: new Date(),
          connectionId: (client as any).processID?.toString() || 'unknown',
          poolName,
        });
      }
      
      return result.rows;
    } catch (error) {
      console.error(`Query execution error in pool ${poolName}:`, error);
      throw error;
    } finally {
      if (client) {
        client.release();
      }
    }
  }
  
  async executeTransaction<T>(
    poolName: string,
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const pool = this.getPool(poolName);
    if (!pool) {
      throw new Error(`Pool ${poolName} not found`);
    }
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  private recordQueryMetrics(metrics: QueryMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics to prevent memory issues
    if (this.metrics.length > this.config.maxQueryLogSize) {
      this.metrics = this.metrics.slice(-this.config.maxQueryLogSize);
    }
  }
  
  getPoolStats(poolName: string): PoolStats | null {
    const pool = this.getPool(poolName);
    if (!pool) {
      return null;
    }
    
    const poolMetrics = this.metrics.filter(m => m.poolName === poolName);
    const totalQueries = poolMetrics.length;
    const averageQueryTime = totalQueries > 0 
      ? poolMetrics.reduce((sum, m) => sum + m.executionTime, 0) / totalQueries 
      : 0;
    
    return {
      totalConnections: pool.totalCount,
      idleConnections: pool.idleCount,
      waitingClients: pool.waitingCount,
      totalQueries,
      averageQueryTime,
      errorCount: 0, // Would need to track this separately
      lastActivity: poolMetrics.length > 0 
        ? poolMetrics[poolMetrics.length - 1].timestamp 
        : new Date(),
    };
  }
  
  getAllPoolStats(): Record<string, PoolStats> {
    const stats: Record<string, PoolStats> = {};
    
    for (const poolName of this.pools.keys()) {
      const poolStats = this.getPoolStats(poolName);
      if (poolStats) {
        stats[poolName] = poolStats;
      }
    }
    
    return stats;
  }
  
  getQueryMetrics(limit: number = 100): QueryMetrics[] {
    return this.metrics.slice(-limit);
  }
  
  getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.metrics.filter(m => m.executionTime > threshold);
  }
  
  async closeAllPools(): Promise<void> {
    const closePromises = Array.from(this.pools.values()).map(pool => pool.end());
    await Promise.all(closePromises);
    this.pools.clear();
  }
}

// =============================================================================
// QUERY OPTIMIZER
// =============================================================================

class QueryOptimizer {
  private poolManager: ConnectionPoolManager;
  
  constructor(poolManager: ConnectionPoolManager) {
    this.poolManager = poolManager;
  }
  
  async analyzeQuery(poolName: string, query: string): Promise<any> {
    const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${query}`;
    
    try {
      const result = await this.poolManager.executeQuery(poolName, explainQuery);
      return result[0];
    } catch (error) {
      console.error('Query analysis error:', error);
      throw error;
    }
  }
  
  async getTableStats(poolName: string, tableName: string): Promise<any> {
    const query = `
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_rows,
        n_dead_tup as dead_rows,
        last_vacuum,
        last_autovacuum,
        last_analyze,
        last_autoanalyze
      FROM pg_stat_user_tables 
      WHERE tablename = $1
    `;
    
    return await this.poolManager.executeQuery(poolName, query, [tableName]);
  }
  
  async getIndexStats(poolName: string, tableName: string): Promise<any> {
    const query = `
      SELECT 
        indexname,
        idx_tup_read,
        idx_tup_fetch,
        CASE 
          WHEN idx_tup_read > 0 THEN idx_tup_fetch::float / idx_tup_read::float
          ELSE 0
        END as efficiency_ratio
      FROM pg_stat_user_indexes 
      WHERE relname = $1
      ORDER BY idx_tup_read DESC
    `;
    
    return await this.poolManager.executeQuery(poolName, query, [tableName]);
  }
  
  async getSlowQueries(poolName: string, limit: number = 10): Promise<any> {
    const query = `
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows,
        shared_blks_hit,
        shared_blks_read
      FROM pg_stat_statements
      WHERE mean_time > 100
      ORDER BY mean_time DESC
      LIMIT $1
    `;
    
    return await this.poolManager.executeQuery(poolName, query, [limit]);
  }
  
  async vacuumTable(poolName: string, tableName: string, analyze: boolean = true): Promise<void> {
    const vacuumQuery = analyze ? `VACUUM ANALYZE ${tableName}` : `VACUUM ${tableName}`;
    await this.poolManager.executeQuery(poolName, vacuumQuery);
  }
  
  async reindexTable(poolName: string, tableName: string): Promise<void> {
    await this.poolManager.executeQuery(poolName, `REINDEX TABLE ${tableName}`);
  }
  
  async updateTableStatistics(poolName: string, tableName: string): Promise<void> {
    await this.poolManager.executeQuery(poolName, `ANALYZE ${tableName}`);
  }
}

// =============================================================================
// SUPABASE CONNECTION MANAGER
// =============================================================================

class SupabaseConnectionManager {
  private supabase: any;
  private poolManager: ConnectionPoolManager;
  
  constructor(supabaseUrl: string, supabaseKey: string, poolManager: ConnectionPoolManager) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.poolManager = poolManager;
  }
  
  async executeRPC<T = any>(
    functionName: string,
    params: any = {},
    poolName: string = 'default'
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const { data, error } = await this.supabase.rpc(functionName, params);
      
      if (error) {
        throw error;
      }
      
      const executionTime = Date.now() - startTime;
      
      // Record metrics if enabled
      if (this.poolManager) {
        // This would need to be adapted based on your metrics recording
        console.log(`RPC ${functionName} executed in ${executionTime}ms`);
      }
      
      return data;
    } catch (error) {
      console.error(`RPC ${functionName} error:`, error);
      throw error;
    }
  }
  
  async executeQuery<T = any>(
    query: string,
    params: any[] = [],
    poolName: string = 'default'
  ): Promise<T[]> {
    return await this.poolManager.executeQuery(poolName, query, params);
  }
  
  async executeTransaction<T>(
    callback: (client: any) => Promise<T>,
    poolName: string = 'default'
  ): Promise<T> {
    return await this.poolManager.executeTransaction(poolName, callback);
  }
}

// =============================================================================
// PERFORMANCE MONITORING SERVICE
// =============================================================================

class PerformanceMonitoringService {
  private poolManager: ConnectionPoolManager;
  private optimizer: QueryOptimizer;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  constructor(poolManager: ConnectionPoolManager) {
    this.poolManager = poolManager;
    this.optimizer = new QueryOptimizer(poolManager);
  }
  
  startMonitoring(intervalMs: number = 60000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    this.monitoringInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, intervalMs);
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }
  
  private async performHealthCheck(): Promise<void> {
    try {
      const poolStats = this.poolManager.getAllPoolStats();
      
      for (const [poolName, stats] of Object.entries(poolStats)) {
        console.log(`Pool ${poolName} health:`, {
          connections: `${stats.idleConnections}/${stats.totalConnections}`,
          waiting: stats.waitingClients,
          avgQueryTime: `${stats.averageQueryTime.toFixed(2)}ms`,
          totalQueries: stats.totalQueries,
        });
        
        // Alert on high connection usage
        if (stats.idleConnections / stats.totalConnections < 0.2) {
          console.warn(`Pool ${poolName}: Low available connections!`);
        }
        
        // Alert on slow queries
        if (stats.averageQueryTime > 1000) {
          console.warn(`Pool ${poolName}: Slow average query time!`);
        }
      }
    } catch (error) {
      console.error('Health check error:', error);
    }
  }
  
  async generatePerformanceReport(): Promise<any> {
    const poolStats = this.poolManager.getAllPoolStats();
    const slowQueries = this.poolManager.getSlowQueries(1000);
    const recentMetrics = this.poolManager.getQueryMetrics(100);
    
    return {
      timestamp: new Date(),
      poolStats,
      slowQueries: slowQueries.slice(0, 10),
      recentMetrics: recentMetrics.slice(0, 20),
      recommendations: this.generateRecommendations(poolStats, slowQueries),
    };
  }
  
  private generateRecommendations(poolStats: Record<string, PoolStats>, slowQueries: QueryMetrics[]): string[] {
    const recommendations: string[] = [];
    
    // Check connection pool health
    for (const [poolName, stats] of Object.entries(poolStats)) {
      if (stats.idleConnections / stats.totalConnections < 0.3) {
        recommendations.push(`Consider increasing max connections for pool ${poolName}`);
      }
      
      if (stats.averageQueryTime > 500) {
        recommendations.push(`Optimize queries in pool ${poolName} - average time is ${stats.averageQueryTime.toFixed(2)}ms`);
      }
    }
    
    // Check for slow queries
    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries - consider adding indexes or optimizing queries`);
    }
    
    return recommendations;
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export async function createConnectionPoolManager(
  config: QueryPerformanceConfig
): Promise<ConnectionPoolManager> {
  return new ConnectionPoolManager(config);
}

export async function createSupabaseConnectionManager(
  supabaseUrl: string,
  supabaseKey: string,
  poolManager: ConnectionPoolManager
): Promise<SupabaseConnectionManager> {
  return new SupabaseConnectionManager(supabaseUrl, supabaseKey, poolManager);
}

export async function createPerformanceMonitoringService(
  poolManager: ConnectionPoolManager
): Promise<PerformanceMonitoringService> {
  return new PerformanceMonitoringService(poolManager);
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  ConnectionPoolManager,
  QueryOptimizer,
  SupabaseConnectionManager,
  PerformanceMonitoringService,
};

export default ConnectionPoolManager;
