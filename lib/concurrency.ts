/**
 * BOUNDED CONCURRENCY UTILITY
 * 
 * Provides bounded concurrency control to prevent resource overload and ensure
 * predictable performance across the MIT Hero System.
 * 
 * Features:
 * - Configurable maximum concurrent operations
 * - Priority-based execution queue
 * - Resource monitoring and limits
 * - Graceful degradation under load
 * - Detailed metrics and logging
 * 
 * @author MIT Hero System
 * @version 1.0.0
 * @license MIT
 */

import logger from './logger';

export interface ConcurrencyConfig {
  maxConcurrent: number;
  maxQueueSize: number;
  priorityLevels: number;
  resourceLimits: {
    cpu: number;      // CPU usage threshold (0-100)
    memory: number;   // Memory usage threshold (0-100)
    disk: number;     // Disk I/O threshold (0-100)
  };
  timeoutMs: number;
  retryAttempts: number;
  enableMetrics: boolean;
}

export interface QueuedOperation {
  id: string;
  priority: number;
  operation: () => Promise<any>;
  metadata: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

export interface ConcurrencyMetrics {
  activeOperations: number;
  queuedOperations: number;
  totalExecuted: number;
  totalFailed: number;
  averageExecutionTime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  lastUpdated: Date;
}

export interface ResourceMonitor {
  getCpuUsage(): Promise<number>;
  getMemoryUsage(): Promise<number>;
  getDiskUsage(): Promise<number>;
}

export class ConcurrencyLimiter {
  private config: ConcurrencyConfig;
  private activeOperations: Set<string> = new Set();
  private operationQueue: QueuedOperation[] = [];
  private metrics: ConcurrencyMetrics;
  private resourceMonitor: ResourceMonitor;
  private isShutdown = false;
  private operationCounter = 0;
  private resourceMonitoringInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;

  constructor(config: Partial<ConcurrencyConfig> = {}) {
    this.config = {
      maxConcurrent: 10,
      maxQueueSize: 100,
      priorityLevels: 5,
      resourceLimits: {
        cpu: 80,
        memory: 85,
        disk: 70
      },
      timeoutMs: 30000,
      retryAttempts: 3,
      enableMetrics: true,
      ...config
    };

    this.metrics = this.initializeMetrics();
    this.resourceMonitor = this.createResourceMonitor();
    
    // Start resource monitoring
    // this.startResourceMonitoring(); // Temporarily disabled due to memory issues
  }

  /**
   * Execute an operation with bounded concurrency
   */
  async execute<T>(
    operation: () => Promise<T>,
    priority: number = 3,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    if (this.isShutdown) {
      throw new Error('ConcurrencyLimiter is shutdown');
    }

    const operationId = `op_${++this.operationCounter}_${Date.now()}`;
    
    // Check if we can execute immediately
    if (this.canExecuteImmediately()) {
      return await this.executeOperation(operationId, operation, metadata);
    }

    // Check if queue is full
    if (this.operationQueue.length >= this.config.maxQueueSize) {
      throw new Error('Operation queue is full');
    }

    // Queue the operation
    return await this.queueOperation(operationId, operation, priority, metadata);
  }

  /**
   * Execute multiple operations with bounded concurrency
   */
  async executeBatch<T>(
    operations: Array<{
      operation: () => Promise<T>;
      priority?: number;
      metadata?: Record<string, any>;
    }>,
    maxConcurrent?: number
  ): Promise<T[]> {
    const effectiveMaxConcurrent = maxConcurrent || this.config.maxConcurrent;
    const results: T[] = new Array(operations.length);
    const pending: Promise<void>[] = [];
    let completed = 0;

    for (let i = 0; i < operations.length; i++) {
      const { operation, priority = 3, metadata = {} } = operations[i];
      
      const executePromise = this.execute(operation, priority, metadata)
        .then(result => {
          results[i] = result;
          completed++;
        })
        .catch(error => {
          results[i] = error as any;
          completed++;
        });

      pending.push(executePromise);

      // Wait if we've reached the concurrency limit
      if (pending.length >= effectiveMaxConcurrent) {
        await Promise.race(pending);
        // Remove completed promises (we can't check status, so we'll just remove one)
        pending.shift();
      }
    }

    // Wait for remaining operations
    await Promise.all(pending);
    return results;
  }

  /**
   * Get current metrics
   */
  getMetrics(): ConcurrencyMetrics {
    return { ...this.metrics };
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      activeOperations: this.activeOperations.size,
      queuedOperations: this.operationQueue.length,
      isShutdown: this.isShutdown,
      config: this.config
    };
  }

  /**
   * Shutdown the limiter gracefully
   */
  async shutdown(timeoutMs: number = 10000): Promise<void> {
    this.isShutdown = true;
    this.isShuttingDown = true;
    
    // Wait for active operations to complete
    const startTime = Date.now();
    while (this.activeOperations.size > 0 && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear queue
    this.operationQueue = [];
    
    logger.log('ConcurrencyLimiter shutdown complete');
    this.stopResourceMonitoring();
  }

  /**
   * Check if operation can execute immediately
   */
  private canExecuteImmediately(): boolean {
    return this.activeOperations.size < this.config.maxConcurrent &&
           !this.isResourceLimitExceeded();
  }

  /**
   * Check if resource limits are exceeded
   */
  private async isResourceLimitExceeded(): Promise<boolean> {
    try {
      const [cpu, memory, disk] = await Promise.all([
        this.resourceMonitor.getCpuUsage(),
        this.resourceMonitor.getMemoryUsage(),
        this.resourceMonitor.getDiskUsage()
      ]);

      return cpu > this.config.resourceLimits.cpu ||
             memory > this.config.resourceLimits.memory ||
             disk > this.config.resourceLimits.disk;
    } catch (error) {
      logger.log('Failed to check resource limits:', error);
      return false; // Allow execution if monitoring fails
    }
  }

  /**
   * Queue an operation for later execution
   */
  private async queueOperation(
    operationId: string,
    operation: () => Promise<any>,
    priority: number,
    metadata: Record<string, any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const queuedOp: QueuedOperation = {
        id: operationId,
        priority: Math.min(priority, this.config.priorityLevels),
        operation,
        metadata,
        timestamp: Date.now(),
        retryCount: 0
      };

      // Insert into priority queue
      this.insertIntoPriorityQueue(queuedOp);

      // Start processing if not already running
      this.processQueue();

      // Set up completion handlers
      queuedOp.metadata.resolve = resolve;
      queuedOp.metadata.reject = reject;
    });
  }

  /**
   * Insert operation into priority queue
   */
  private insertIntoPriorityQueue(operation: QueuedOperation): void {
    const insertIndex = this.operationQueue.findIndex(
      op => op.priority < operation.priority
    );
    
    if (insertIndex === -1) {
      this.operationQueue.push(operation);
    } else {
      this.operationQueue.splice(insertIndex, 0, operation);
    }
  }

  /**
   * Process the operation queue
   */
  private async processQueue(): Promise<void> {
    if (this.isShutdown || this.activeOperations.size >= this.config.maxConcurrent) {
      return;
    }

    while (this.operationQueue.length > 0 && 
           this.activeOperations.size < this.config.maxConcurrent &&
           !(await this.isResourceLimitExceeded())) {
      
      const operation = this.operationQueue.shift();
      if (operation) {
        this.executeOperation(operation.id, operation.operation, operation.metadata);
      }
    }
  }

  /**
   * Execute a single operation
   */
  private async executeOperation(
    operationId: string,
    operation: () => Promise<any>,
    metadata: Record<string, any>
  ): Promise<any> {
    this.activeOperations.add(operationId);
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        operation(),
        this.createTimeoutPromise()
      ]);

      // Operation completed successfully
      if (metadata.resolve) {
        metadata.resolve(result);
      }

      this.updateMetrics(true, Date.now() - startTime);
      return result;

    } catch (error) {
      // Handle retry logic
      if (metadata.retryCount < this.config.retryAttempts) {
        metadata.retryCount++;
        logger.log(`Retrying operation ${operationId} (attempt ${metadata.retryCount})`);
        
        // Re-queue with lower priority
        const retryOp: QueuedOperation = {
          id: operationId,
          priority: Math.max(1, metadata.priority - 1),
          operation,
          metadata,
          timestamp: Date.now(),
          retryCount: metadata.retryCount
        };
        
        this.insertIntoPriorityQueue(retryOp);
        throw error; // Re-throw to be handled by caller
      } else {
        // Max retries exceeded
        if (metadata.reject) {
          metadata.reject(error);
        }
        this.updateMetrics(false, Date.now() - startTime);
        throw error; // Re-throw to be handled by caller
      }
    } finally {
      this.activeOperations.delete(operationId);
      this.processQueue(); // Try to process more operations
    }
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * Update metrics
   */
  private updateMetrics(success: boolean, executionTime: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalExecuted++;
    if (!success) {
      this.metrics.totalFailed++;
    }

    // Update average execution time
    const totalTime = this.metrics.averageExecutionTime * (this.metrics.totalExecuted - 1) + executionTime;
    this.metrics.averageExecutionTime = totalTime / this.metrics.totalExecuted;
    
    this.metrics.lastUpdated = new Date();
  }

  /**
   * Start resource monitoring
   */
  private startResourceMonitoring(): void {
    if (this.resourceMonitoringInterval) {
      clearInterval(this.resourceMonitoringInterval);
    }

    this.resourceMonitoringInterval = setInterval(() => {
      try {
        const usage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.resourceUsage = {
          cpu: cpuUsage.user + cpuUsage.system, // Simple CPU usage
          memory: ((usage.heapUsed + usage.external) / usage.heapTotal) * 100, // Memory usage
          disk: 0 // Disk usage is not directly available in process.memoryUsage()
        };

        this.metrics.lastUpdated = new Date();

        // Check resource limits and trigger alerts
        if (this.metrics.resourceUsage.memory > this.config.resourceLimits.memory * 0.8) {
          logger.log(`High memory usage: ${this.metrics.resourceUsage.memory.toFixed(1)}%`);
        }

        // Clean up old metrics to prevent memory buildup
        if (this.metrics.totalExecuted > 100) {
          this.metrics.totalExecuted = 0; // Reset for accurate average calculation
          this.metrics.totalFailed = 0;
          this.metrics.averageExecutionTime = 0;
        }

        // Stop monitoring if system is shutting down
        if (this.isShuttingDown) {
          this.stopResourceMonitoring();
        }
      } catch (error) {
        // Prevent monitoring errors from crashing the system
        logger.log('Resource monitoring error:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  private stopResourceMonitoring(): void {
    if (this.resourceMonitoringInterval) {
      clearInterval(this.resourceMonitoringInterval);
      this.resourceMonitoringInterval = null;
    }
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ConcurrencyMetrics {
    return {
      activeOperations: 0,
      queuedOperations: 0,
      totalExecuted: 0,
      totalFailed: 0,
      averageExecutionTime: 0,
      resourceUsage: { cpu: 0, memory: 0, disk: 0 },
      lastUpdated: new Date()
    };
  }

  /**
   * Create resource monitor
   */
  private createResourceMonitor(): ResourceMonitor {
    return {
      async getCpuUsage(): Promise<number> {
        try {
          const os = require('os');
          const cpus = os.cpus();
          let totalIdle = 0;
          let totalTick = 0;

          cpus.forEach(cpu => {
            for (const type in cpu.times) {
              totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
          });

          return 100 - (totalIdle / totalTick * 100);
        } catch {
          return 0;
        }
      },

      async getMemoryUsage(): Promise<number> {
        try {
          const os = require('os');
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          return ((totalMem - freeMem) / totalMem) * 100;
        } catch {
          return 0;
        }
      },

      async getDiskUsage(): Promise<number> {
        try {
          const fs = require('fs');
          const path = require('path');
          
          // Simple disk usage check - could be enhanced with actual I/O monitoring
          const stats = fs.statSync(process.cwd());
          return 0; // Placeholder - actual disk I/O monitoring would require more sophisticated approach
        } catch {
          return 0;
        }
      }
    };
  }
}

// Default concurrency limiter instances for common use cases
export const healthCheckLimiter = new ConcurrencyLimiter({
  maxConcurrent: 20,
  maxQueueSize: 50,
  priorityLevels: 3,
  timeoutMs: 15000
});

export const buildLimiter = new ConcurrencyLimiter({
  maxConcurrent: 3,
  maxQueueSize: 20,
  priorityLevels: 5,
  timeoutMs: 300000, // 5 minutes for builds
  resourceLimits: {
    cpu: 70,
    memory: 80,
    disk: 60
  }
});

export const testLimiter = new ConcurrencyLimiter({
  maxConcurrent: 5,
  maxQueueSize: 30,
  priorityLevels: 4,
  timeoutMs: 60000, // 1 minute for tests
  resourceLimits: {
    cpu: 75,
    memory: 85,
    disk: 65
  }
});

export const defaultLimiter = new ConcurrencyLimiter({
  maxConcurrent: 10,
  maxQueueSize: 100,
  priorityLevels: 5,
  timeoutMs: 30000
});
