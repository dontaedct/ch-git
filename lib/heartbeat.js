/**
 * Heartbeat Emitter for Long-Running Tasks (JavaScript Version)
 * 
 * Provides progress updates, memory monitoring, and structured output
 * to prevent UIs from appearing frozen during long operations.
 * 
 * @file lib/heartbeat.js
 * @author MIT Hero System
 * @version 1.0.0
 */

const { EventEmitter } = require('events');
const { performance } = require('perf_hooks');

class HeartbeatEmitter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      interval: config.interval ?? 5000,
      includeMemory: config.includeMemory ?? true,
      includeCPU: config.includeCPU ?? true,
      formatter: config.formatter ?? this.defaultFormatter.bind(this),
      consoleOutput: config.consoleOutput ?? true,
    };
    this.operations = new Map();
    this.heartbeatTimer = null;
    this.isRunning = false;
  }

  /**
   * Start monitoring an operation
   */
  startOperation(operationId, operationName, totalSteps) {
    const operation = {
      id: operationId,
      name: operationName,
      startTime: performance.now(),
      lastHeartbeat: performance.now(),
      currentStep: 0,
      totalSteps: totalSteps ?? 0,
      status: 'Starting...',
      metadata: {},
    };

    this.operations.set(operationId, operation);
    
    if (!this.isRunning) {
      this.startHeartbeat();
    }

    this.emit('operation:start', operation);
    
    if (this.config.consoleOutput) {
      console.log(`🚀 Started operation: ${operationName} (${operationId})`);
    }
  }

  /**
   * Update operation progress
   */
  updateProgress(operationId, progress, status, metadata) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.currentStep = progress;
    if (status) operation.status = status;
    if (metadata) operation.metadata = { ...operation.metadata, ...metadata };
    operation.lastHeartbeat = performance.now();

    // Emit immediate progress update
    this.emit('progress:update', this.createHeartbeatData(operation));
  }

  /**
   * Complete an operation
   */
  completeOperation(operationId, finalStatus) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.status = finalStatus ?? 'Completed';
    operation.currentStep = operation.totalSteps || 100;
    operation.lastHeartbeat = performance.now();

    const finalData = this.createHeartbeatData(operation);
    this.emit('operation:complete', finalData);
    
    if (this.config.consoleOutput) {
      console.log(`✅ Completed operation: ${operation.name} (${operationId})`);
      console.log(this.config.formatter(finalData));
    }

    this.operations.delete(operationId);

    if (this.operations.size === 0) {
      this.stopHeartbeat();
    }
  }

  /**
   * Cancel an operation
   */
  cancelOperation(operationId, reason) {
    const operation = this.operations.get(operationId);
    if (!operation) {
      throw new Error(`Operation ${operationId} not found`);
    }

    operation.status = `Cancelled${reason ? `: ${reason}` : ''}`;
    operation.lastHeartbeat = performance.now();

    const cancelData = this.createHeartbeatData(operation);
    this.emit('operation:cancel', cancelData);
    
    if (this.config.consoleOutput) {
      console.log(`❌ Cancelled operation: ${operation.name} (${operationId})`);
      if (reason) console.log(`   Reason: ${reason}`);
    }

    this.operations.delete(operationId);

    if (this.operations.size === 0) {
      this.stopHeartbeat();
    }
  }

  /**
   * Get current operation status
   */
  getOperationStatus(operationId) {
    const operation = this.operations.get(operationId);
    return operation ? this.createHeartbeatData(operation) : null;
  }

  /**
   * Get all active operations
   */
  getActiveOperations() {
    return Array.from(this.operations.values()).map(op => 
      this.createHeartbeatData(op)
    );
  }

  /**
   * Create a progress bar string
   */
  createProgressBar(progress, options = {}) {
    const {
      width = 30,
      char = '█',
      emptyChar = '░',
      showPercentage = true,
      showETA = true,
    } = options;

    const filledWidth = Math.round((progress / 100) * width);
    const emptyWidth = width - filledWidth;
    
    const bar = char.repeat(filledWidth) + emptyChar.repeat(emptyWidth);
    const percentage = showPercentage ? ` ${progress.toFixed(1)}%` : '';
    
    return `[${bar}]${percentage}`;
  }

  /**
   * Stop all operations and cleanup
   */
  stop() {
    this.stopHeartbeat();
    this.operations.clear();
    this.removeAllListeners();
    
    if (this.config.consoleOutput) {
      console.log('🛑 Heartbeat emitter stopped');
    }
  }

  startHeartbeat() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.heartbeatTimer = setInterval(() => {
      this.emitHeartbeats();
    }, this.config.interval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    this.isRunning = false;
  }

  emitHeartbeats() {
    for (const operation of this.operations.values()) {
      const heartbeatData = this.createHeartbeatData(operation);
      this.emit('heartbeat', heartbeatData);
      
      if (this.config.consoleOutput) {
        console.log(this.config.formatter(heartbeatData));
      }
    }
  }

  createHeartbeatData(operation) {
    const now = performance.now();
    const elapsed = now - operation.startTime;
    const progress = operation.totalSteps > 0 
      ? (operation.currentStep / operation.totalSteps) * 100
      : 0;
    
    // Calculate ETA based on progress and elapsed time
    let eta = 0;
    if (progress > 0) {
      const estimatedTotal = elapsed / (progress / 100);
      eta = estimatedTotal - elapsed;
    }

    const data = {
      operationId: operation.id,
      operationName: operation.name,
      progress: Math.min(100, Math.max(0, progress)),
      eta: Math.max(0, eta),
      elapsed,
      status: operation.status,
      metadata: operation.metadata,
      timestamp: now,
    };

    if (this.config.includeMemory) {
      data.memory = this.getMemoryInfo();
    }

    if (this.config.includeCPU) {
      data.cpu = this.getCPUInfo();
    }

    return data;
  }

  getMemoryInfo() {
    const memUsage = process.memoryUsage();
    return {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    };
  }

  getCPUInfo() {
    const startUsage = process.cpuUsage();
    // Simple CPU usage approximation
    return {
      usage: 0, // Would need more sophisticated monitoring for real CPU usage
      user: startUsage.user,
      system: startUsage.system,
    };
  }

  defaultFormatter(data) {
    const progressBar = this.createProgressBar(data.progress, { width: 20 });
    const elapsed = this.formatDuration(data.elapsed);
    const eta = this.formatDuration(data.eta);
    
    let output = `🔄 ${data.operationName} ${progressBar} ${elapsed}`;
    
    if (data.eta > 0) {
      output += ` (ETA: ${eta})`;
    }
    
    output += ` - ${data.status}`;
    
    if (data.memory) {
      const memMB = (data.memory.heapUsed / 1024 / 1024).toFixed(1);
      output += ` | Memory: ${memMB}MB`;
    }
    
    return output;
  }

  formatDuration(ms) {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

// Export singleton instance for global use
const globalHeartbeat = new HeartbeatEmitter();

// Export convenience functions
const heartbeat = {
  start: (id, name, totalSteps) => 
    globalHeartbeat.startOperation(id, name, totalSteps),
  update: (id, progress, status, metadata) =>
    globalHeartbeat.updateProgress(id, progress, status, metadata),
  complete: (id, status) => 
    globalHeartbeat.completeOperation(id, status),
  cancel: (id, reason) => 
    globalHeartbeat.cancelOperation(id, reason),
  status: (id) => globalHeartbeat.getOperationStatus(id),
  active: () => globalHeartbeat.getActiveOperations(),
  stop: () => globalHeartbeat.stop(),
};

module.exports = {
  HeartbeatEmitter,
  heartbeat,
  globalHeartbeat
};
