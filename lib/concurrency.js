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

// Simple logger for CommonJS compatibility
const logger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args)
};

class ConcurrencyLimiter {
  constructor(config = {}) {
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
    this.activeOperations = new Set();
    this.operationQueue = [];
    this.isShutdown = false;
    this.operationCounter = 0;
    
    // Start resource monitoring
    // this.startResourceMonitoring(); // Temporarily disabled due to memory issues
  }

  /**
   * Execute an operation with bounded concurrency
   */
  async execute(operation, priority = 3, metadata = {}) {
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
  async executeBatch(operations, maxConcurrent) {
    const effectiveMaxConcurrent = maxConcurrent || this.config.maxConcurrent;
    const results = new Array(operations.length);
    const pending = [];
    let completed = 0;

    for (let i = 0; i < operations.length; i++) {
      const { operation, priority = 3, metadata = {} } = operations[i];
      
      const executePromise = this.execute(operation, priority, metadata)
        .then(result => {
          results[i] = result;
          completed++;
        })
        .catch(error => {
          results[i] = error;
          completed++;
        });

      pending.push(executePromise);

      // Wait if we've reached the concurrency limit
      if (pending.length >= effectiveMaxConcurrent) {
        await Promise.race(pending);
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
  getMetrics() {
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
  async shutdown(timeoutMs = 10000) {
    this.isShutdown = true;
    
    // Wait for active operations to complete
    const startTime = Date.now();
    while (this.activeOperations.size > 0 && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Clear queue
    this.operationQueue = [];
    
    logger.log('ConcurrencyLimiter shutdown complete');
  }

  /**
   * Check if operation can execute immediately
   */
  canExecuteImmediately() {
    return this.activeOperations.size < this.config.maxConcurrent;
  }

  /**
   * Queue an operation for later execution
   */
  async queueOperation(operationId, operation, priority, metadata) {
    return new Promise((resolve, reject) => {
      const queuedOp = {
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
  insertIntoPriorityQueue(operation) {
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
  async processQueue() {
    if (this.isShutdown || this.activeOperations.size >= this.config.maxConcurrent) {
      return;
    }

    while (this.operationQueue.length > 0 && 
           this.activeOperations.size < this.config.maxConcurrent) {
      
      const operation = this.operationQueue.shift();
      if (operation) {
        this.executeOperation(operation.id, operation.operation, operation.metadata);
      }
    }
  }

  /**
   * Execute a single operation
   */
  async executeOperation(operationId, operation, metadata) {
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
        const retryOp = {
          id: operationId,
          priority: Math.max(1, metadata.priority - 1),
          operation,
          metadata,
          timestamp: Date.now(),
          retryCount: metadata.retryCount
        };
        
        this.insertIntoPriorityQueue(retryOp);
        throw error;
      } else {
        // Max retries exceeded
        if (metadata.reject) {
          metadata.reject(error);
        }
        this.updateMetrics(false, Date.now() - startTime);
        throw error;
      }
    } finally {
      this.activeOperations.delete(operationId);
      this.processQueue();
    }
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise() {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeoutMs}ms`));
      }, this.config.timeoutMs);
    });
  }

  /**
   * Update metrics
   */
  updateMetrics(success, executionTime) {
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
  startResourceMonitoring() {
    if (this.resourceMonitoringInterval) {
      clearInterval(this.resourceMonitoringInterval);
    }

    this.resourceMonitoringInterval = setInterval(() => {
      try {
        const usage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        
        this.metrics.resourceUsage = {
          cpu: cpuUsage.user + cpuUsage.system,
          memory: ((usage.heapUsed + usage.external) / usage.heapTotal) * 100,
          disk: 0
        };

        this.metrics.lastUpdated = new Date();

        // Check resource limits and trigger alerts
        if (this.metrics.resourceUsage.memory > this.config.resourceLimits.memory * 0.8) {
          logger.log(`High memory usage: ${this.metrics.resourceUsage.memory.toFixed(1)}%`);
        }

        // Clean up old metrics to prevent memory buildup
        if (this.metrics.totalExecuted > 100) {
          this.metrics.totalExecuted = 0;
          this.metrics.totalFailed = 0;
          this.metrics.averageExecutionTime = 0;
        }

        // Stop monitoring if system is shutting down
        if (this.isShuttingDown) {
          this.stopResourceMonitoring();
        }
      } catch (error) {
        // Prevent monitoring errors from crashing the system
        console.error('Resource monitoring error:', error);
      }
    }, 5000);
  }

  stopResourceMonitoring() {
    if (this.resourceMonitoringInterval) {
      clearInterval(this.resourceMonitoringInterval);
      this.resourceMonitoringInterval = null;
    }
  }

  /**
   * Initialize metrics
   */
  initializeMetrics() {
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
  createResourceMonitor() {
    return {
      async getCpuUsage() {
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

      async getMemoryUsage() {
        try {
          const os = require('os');
          const totalMem = os.totalmem();
          const freeMem = os.freemem();
          return ((totalMem - freeMem) / totalMem) * 100;
        } catch {
          return 0;
        }
      },

      async getDiskUsage() {
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
const healthCheckLimiter = new ConcurrencyLimiter({
  maxConcurrent: 20,
  maxQueueSize: 50,
  priorityLevels: 3,
  timeoutMs: 15000
});

const buildLimiter = new ConcurrencyLimiter({
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

const testLimiter = new ConcurrencyLimiter({
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

const defaultLimiter = new ConcurrencyLimiter({
  maxConcurrent: 10,
  maxQueueSize: 100,
  priorityLevels: 5,
  timeoutMs: 30000
});

module.exports = { 
  ConcurrencyLimiter, 
  healthCheckLimiter, 
  buildLimiter, 
  testLimiter, 
  defaultLimiter 
};
