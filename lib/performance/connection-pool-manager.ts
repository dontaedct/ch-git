/**
 * Connection Pool Manager for Database Optimization
 * HT-034.8.2 Implementation
 *
 * Manages database connection pooling, prevents resource conflicts,
 * and ensures optimal connection utilization across all systems.
 */

import { supabase } from '@/lib/supabase/client';

export interface ConnectionPoolConfig {
  name: string;
  minConnections: number;
  maxConnections: number;
  idleTimeout: number; // ms
  connectionTimeout: number; // ms
  maxWaitingClients: number;
  evictionRunInterval: number; // ms
}

export interface PooledConnection {
  id: string;
  poolName: string;
  createdAt: number;
  lastUsed: number;
  inUse: boolean;
  queryCount: number;
  totalQueryTime: number;
  errors: number;
}

export interface PoolMetrics {
  poolName: string;
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingRequests: number;
  totalRequests: number;
  totalErrors: number;
  avgWaitTime: number;
  avgQueryTime: number;
  utilizationRate: number;
}

export interface ConnectionRequest {
  id: string;
  poolName: string;
  priority: 'high' | 'normal' | 'low';
  requestedAt: number;
  timeout: number;
  callback: (connection: PooledConnection | null) => void;
}

export class ConnectionPoolManager {
  private pools = new Map<string, ConnectionPoolConfig>();
  private connections = new Map<string, PooledConnection[]>();
  private waitingQueue = new Map<string, ConnectionRequest[]>();
  private poolMetrics = new Map<string, PoolMetrics>();
  private healthCheckInterval?: NodeJS.Timeout;
  private evictionInterval?: NodeJS.Timeout;

  constructor() {
    this.initializePools();
    this.startHealthChecking();
    this.startEvictionProcess();
  }

  /**
   * Initialize connection pools with optimized configurations
   */
  private initializePools(): void {
    // Read pool for SELECT queries
    this.createPool('read', {
      name: 'read',
      minConnections: 5,
      maxConnections: 30,
      idleTimeout: 300000, // 5 minutes
      connectionTimeout: 5000, // 5 seconds
      maxWaitingClients: 50,
      evictionRunInterval: 60000 // 1 minute
    });

    // Write pool for INSERT/UPDATE/DELETE
    this.createPool('write', {
      name: 'write',
      minConnections: 3,
      maxConnections: 20,
      idleTimeout: 180000, // 3 minutes
      connectionTimeout: 10000, // 10 seconds
      maxWaitingClients: 30,
      evictionRunInterval: 60000
    });

    // Analytics pool for complex queries
    this.createPool('analytics', {
      name: 'analytics',
      minConnections: 2,
      maxConnections: 15,
      idleTimeout: 600000, // 10 minutes
      connectionTimeout: 30000, // 30 seconds
      maxWaitingClients: 20,
      evictionRunInterval: 120000 // 2 minutes
    });

    // Batch pool for bulk operations
    this.createPool('batch', {
      name: 'batch',
      minConnections: 1,
      maxConnections: 10,
      idleTimeout: 120000, // 2 minutes
      connectionTimeout: 60000, // 1 minute
      maxWaitingClients: 10,
      evictionRunInterval: 60000
    });

    // Real-time pool for subscriptions
    this.createPool('realtime', {
      name: 'realtime',
      minConnections: 2,
      maxConnections: 10,
      idleTimeout: 0, // Never timeout
      connectionTimeout: 5000,
      maxWaitingClients: 20,
      evictionRunInterval: 300000 // 5 minutes
    });
  }

  /**
   * Create a new connection pool
   */
  private createPool(name: string, config: ConnectionPoolConfig): void {
    this.pools.set(name, config);
    this.connections.set(name, []);
    this.waitingQueue.set(name, []);

    // Initialize metrics
    this.poolMetrics.set(name, {
      poolName: name,
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalRequests: 0,
      totalErrors: 0,
      avgWaitTime: 0,
      avgQueryTime: 0,
      utilizationRate: 0
    });

    // Pre-create minimum connections
    this.ensureMinimumConnections(name);
  }

  /**
   * Get a connection from the pool
   */
  async getConnection(
    poolName: string,
    priority: 'high' | 'normal' | 'low' = 'normal',
    timeout?: number
  ): Promise<PooledConnection | null> {
    const pool = this.pools.get(poolName);
    if (!pool) {
      console.error(`Pool ${poolName} not found`);
      return null;
    }

    const metrics = this.poolMetrics.get(poolName)!;
    metrics.totalRequests++;

    // Try to get an idle connection
    const connections = this.connections.get(poolName)!;
    const idleConnection = connections.find(conn => !conn.inUse);

    if (idleConnection) {
      idleConnection.inUse = true;
      idleConnection.lastUsed = Date.now();
      metrics.activeConnections++;
      metrics.idleConnections--;
      return idleConnection;
    }

    // Try to create a new connection if under limit
    if (connections.length < pool.maxConnections) {
      const newConnection = await this.createConnection(poolName);
      if (newConnection) {
        newConnection.inUse = true;
        connections.push(newConnection);
        metrics.totalConnections++;
        metrics.activeConnections++;
        return newConnection;
      }
    }

    // Add to waiting queue
    return this.addToWaitingQueue(poolName, priority, timeout || pool.connectionTimeout);
  }

  /**
   * Release a connection back to the pool
   */
  releaseConnection(connection: PooledConnection): void {
    const connections = this.connections.get(connection.poolName);
    if (!connections) return;

    const conn = connections.find(c => c.id === connection.id);
    if (!conn) return;

    conn.inUse = false;
    conn.lastUsed = Date.now();

    const metrics = this.poolMetrics.get(connection.poolName)!;
    metrics.activeConnections--;
    metrics.idleConnections++;

    // Process waiting queue
    this.processWaitingQueue(connection.poolName);

    // Update utilization rate
    this.updateUtilizationRate(connection.poolName);
  }

  /**
   * Create a new connection
   */
  private async createConnection(poolName: string): Promise<PooledConnection | null> {
    try {
      const connection: PooledConnection = {
        id: `conn_${poolName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        poolName,
        createdAt: Date.now(),
        lastUsed: Date.now(),
        inUse: false,
        queryCount: 0,
        totalQueryTime: 0,
        errors: 0
      };

      return connection;
    } catch (error) {
      console.error(`Failed to create connection for pool ${poolName}:`, error);
      const metrics = this.poolMetrics.get(poolName)!;
      metrics.totalErrors++;
      return null;
    }
  }

  /**
   * Add request to waiting queue
   */
  private async addToWaitingQueue(
    poolName: string,
    priority: 'high' | 'normal' | 'low',
    timeout: number
  ): Promise<PooledConnection | null> {
    return new Promise((resolve) => {
      const request: ConnectionRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        poolName,
        priority,
        requestedAt: Date.now(),
        timeout,
        callback: resolve
      };

      const queue = this.waitingQueue.get(poolName)!;

      // Insert based on priority
      if (priority === 'high') {
        queue.unshift(request);
      } else if (priority === 'low') {
        queue.push(request);
      } else {
        // Normal priority - insert after high priority
        const highPriorityEnd = queue.findIndex(req => req.priority !== 'high');
        if (highPriorityEnd === -1) {
          queue.push(request);
        } else {
          queue.splice(highPriorityEnd, 0, request);
        }
      }

      const metrics = this.poolMetrics.get(poolName)!;
      metrics.waitingRequests++;

      // Set timeout
      setTimeout(() => {
        const index = queue.findIndex(req => req.id === request.id);
        if (index !== -1) {
          queue.splice(index, 1);
          metrics.waitingRequests--;
          metrics.totalErrors++;
          resolve(null);
        }
      }, timeout);
    });
  }

  /**
   * Process waiting queue when a connection becomes available
   */
  private processWaitingQueue(poolName: string): void {
    const queue = this.waitingQueue.get(poolName);
    if (!queue || queue.length === 0) return;

    const connections = this.connections.get(poolName)!;
    const idleConnection = connections.find(conn => !conn.inUse);

    if (idleConnection && queue.length > 0) {
      const request = queue.shift()!;
      const metrics = this.poolMetrics.get(poolName)!;

      idleConnection.inUse = true;
      idleConnection.lastUsed = Date.now();
      metrics.activeConnections++;
      metrics.idleConnections--;
      metrics.waitingRequests--;

      // Update average wait time
      const waitTime = Date.now() - request.requestedAt;
      metrics.avgWaitTime = (metrics.avgWaitTime + waitTime) / 2;

      request.callback(idleConnection);
    }
  }

  /**
   * Ensure minimum connections are maintained
   */
  private async ensureMinimumConnections(poolName: string): Promise<void> {
    const pool = this.pools.get(poolName);
    if (!pool) return;

    const connections = this.connections.get(poolName)!;
    const currentCount = connections.length;

    if (currentCount < pool.minConnections) {
      const toCreate = pool.minConnections - currentCount;

      for (let i = 0; i < toCreate; i++) {
        const connection = await this.createConnection(poolName);
        if (connection) {
          connections.push(connection);
          const metrics = this.poolMetrics.get(poolName)!;
          metrics.totalConnections++;
          metrics.idleConnections++;
        }
      }
    }
  }

  /**
   * Evict idle connections
   */
  private evictIdleConnections(): void {
    const now = Date.now();

    for (const [poolName, pool] of this.pools) {
      if (pool.idleTimeout === 0) continue; // Skip pools with no timeout

      const connections = this.connections.get(poolName)!;
      const metrics = this.poolMetrics.get(poolName)!;

      // Find connections to evict
      const toEvict = connections.filter(conn =>
        !conn.inUse &&
        (now - conn.lastUsed) > pool.idleTimeout &&
        connections.length > pool.minConnections
      );

      // Evict connections
      for (const conn of toEvict) {
        const index = connections.indexOf(conn);
        if (index !== -1) {
          connections.splice(index, 1);
          metrics.totalConnections--;
          metrics.idleConnections--;
        }
      }
    }
  }

  /**
   * Update utilization rate for a pool
   */
  private updateUtilizationRate(poolName: string): void {
    const metrics = this.poolMetrics.get(poolName);
    if (!metrics) return;

    const pool = this.pools.get(poolName)!;
    metrics.utilizationRate = (metrics.activeConnections / pool.maxConnections) * 100;
  }

  /**
   * Start health checking process
   */
  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform health check on all pools
   */
  private performHealthCheck(): void {
    for (const [poolName, connections] of this.connections) {
      const metrics = this.poolMetrics.get(poolName)!;

      // Check for stuck connections
      const now = Date.now();
      const stuckConnections = connections.filter(conn =>
        conn.inUse && (now - conn.lastUsed) > 60000 // 1 minute
      );

      if (stuckConnections.length > 0) {
        console.warn(`Pool ${poolName} has ${stuckConnections.length} stuck connections`);

        // Force release stuck connections
        for (const conn of stuckConnections) {
          conn.inUse = false;
          conn.errors++;
          metrics.activeConnections--;
          metrics.idleConnections++;
        }

        // Process waiting queue
        this.processWaitingQueue(poolName);
      }

      // Ensure minimum connections
      this.ensureMinimumConnections(poolName);

      // Update metrics
      this.updateUtilizationRate(poolName);
    }
  }

  /**
   * Start eviction process
   */
  private startEvictionProcess(): void {
    this.evictionInterval = setInterval(() => {
      this.evictIdleConnections();
    }, 60000); // Every minute
  }

  /**
   * Get pool metrics
   */
  getPoolMetrics(poolName?: string): PoolMetrics | PoolMetrics[] {
    if (poolName) {
      return this.poolMetrics.get(poolName) || this.createEmptyMetrics(poolName);
    }

    return Array.from(this.poolMetrics.values());
  }

  /**
   * Get connection statistics
   */
  getConnectionStatistics(): {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    waitingRequests: number;
    poolUtilization: Map<string, number>;
  } {
    let totalConnections = 0;
    let activeConnections = 0;
    let idleConnections = 0;
    let waitingRequests = 0;
    const poolUtilization = new Map<string, number>();

    for (const [poolName, metrics] of this.poolMetrics) {
      totalConnections += metrics.totalConnections;
      activeConnections += metrics.activeConnections;
      idleConnections += metrics.idleConnections;
      waitingRequests += metrics.waitingRequests;
      poolUtilization.set(poolName, metrics.utilizationRate);
    }

    return {
      totalConnections,
      activeConnections,
      idleConnections,
      waitingRequests,
      poolUtilization
    };
  }

  /**
   * Resolve connection conflicts
   */
  resolveConnectionConflicts(): {
    conflicts: string[];
    resolutions: string[];
  } {
    const conflicts: string[] = [];
    const resolutions: string[] = [];

    for (const [poolName, metrics] of this.poolMetrics) {
      const pool = this.pools.get(poolName)!;

      // Check for over-utilization
      if (metrics.utilizationRate > 80) {
        conflicts.push(`Pool ${poolName} is over-utilized at ${metrics.utilizationRate.toFixed(1)}%`);
        resolutions.push(`Increase max connections for ${poolName} pool or optimize query performance`);
      }

      // Check for high wait times
      if (metrics.avgWaitTime > 1000) {
        conflicts.push(`Pool ${poolName} has high average wait time: ${metrics.avgWaitTime}ms`);
        resolutions.push(`Increase connection pool size or reduce query execution time`);
      }

      // Check for high error rate
      if (metrics.totalErrors > metrics.totalRequests * 0.05) {
        conflicts.push(`Pool ${poolName} has high error rate: ${((metrics.totalErrors / metrics.totalRequests) * 100).toFixed(1)}%`);
        resolutions.push(`Investigate connection failures and optimize error handling`);
      }

      // Check for waiting queue overflow
      if (metrics.waitingRequests > pool.maxWaitingClients * 0.8) {
        conflicts.push(`Pool ${poolName} waiting queue is nearly full`);
        resolutions.push(`Scale up connection pool or implement request throttling`);
      }
    }

    return { conflicts, resolutions };
  }

  /**
   * Optimize pool configuration based on usage patterns
   */
  optimizePoolConfiguration(): Map<string, Partial<ConnectionPoolConfig>> {
    const recommendations = new Map<string, Partial<ConnectionPoolConfig>>();

    for (const [poolName, metrics] of this.poolMetrics) {
      const pool = this.pools.get(poolName)!;
      const recommendation: Partial<ConnectionPoolConfig> = {};

      // Recommend increasing max connections if utilization is high
      if (metrics.utilizationRate > 75) {
        recommendation.maxConnections = Math.min(pool.maxConnections * 1.5, 50);
      }

      // Recommend decreasing max connections if utilization is low
      if (metrics.utilizationRate < 25 && pool.maxConnections > 10) {
        recommendation.maxConnections = Math.max(pool.maxConnections * 0.7, 10);
      }

      // Adjust idle timeout based on usage pattern
      if (metrics.totalRequests > 1000 && metrics.avgWaitTime > 500) {
        recommendation.idleTimeout = pool.idleTimeout * 1.5;
      }

      // Adjust connection timeout based on error rate
      if (metrics.totalErrors > metrics.totalRequests * 0.1) {
        recommendation.connectionTimeout = pool.connectionTimeout * 2;
      }

      if (Object.keys(recommendation).length > 0) {
        recommendations.set(poolName, recommendation);
      }
    }

    return recommendations;
  }

  /**
   * Create empty metrics object
   */
  private createEmptyMetrics(poolName: string): PoolMetrics {
    return {
      poolName,
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      totalRequests: 0,
      totalErrors: 0,
      avgWaitTime: 0,
      avgQueryTime: 0,
      utilizationRate: 0
    };
  }

  /**
   * Shutdown all pools
   */
  shutdown(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.evictionInterval) {
      clearInterval(this.evictionInterval);
    }

    // Clear all connections
    for (const connections of this.connections.values()) {
      connections.length = 0;
    }

    // Clear waiting queues
    for (const queue of this.waitingQueue.values()) {
      for (const request of queue) {
        request.callback(null);
      }
      queue.length = 0;
    }

    console.log('Connection pool manager shut down');
  }
}

// Export singleton instance
export const connectionPoolManager = new ConnectionPoolManager();

// Export utility functions
export async function withPooledConnection<T>(
  poolName: string,
  operation: (connection: PooledConnection) => Promise<T>,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<T | null> {
  const connection = await connectionPoolManager.getConnection(poolName, priority);

  if (!connection) {
    console.error(`Failed to get connection from pool ${poolName}`);
    return null;
  }

  try {
    const startTime = Date.now();
    const result = await operation(connection);

    // Update connection metrics
    connection.queryCount++;
    connection.totalQueryTime += Date.now() - startTime;

    return result;
  } catch (error) {
    connection.errors++;
    console.error(`Error during pooled operation:`, error);
    throw error;
  } finally {
    connectionPoolManager.releaseConnection(connection);
  }
}

export function getOptimalPool(operation: string, dataSize?: number): string {
  if (operation === 'SELECT') {
    return dataSize && dataSize > 1000 ? 'analytics' : 'read';
  }

  if (operation === 'INSERT' || operation === 'UPDATE' || operation === 'DELETE') {
    return dataSize && dataSize > 100 ? 'batch' : 'write';
  }

  return 'read'; // Default
}