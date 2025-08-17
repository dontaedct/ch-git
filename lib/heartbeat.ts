/**
 * Heartbeat Emitter for Long-Running Tasks
 * 
 * Provides progress updates, memory monitoring, and structured output
 * to prevent UIs from appearing frozen during long operations.
 * 
 * @file lib/heartbeat.ts
 * @author MIT Hero System
 * @version 1.0.0
 */

import { performance } from 'perf_hooks';
import { EventEmitter } from 'events';

export interface HeartbeatConfig {
  /** Interval between heartbeats in milliseconds (default: 5000) */
  interval?: number;
  /** Whether to include memory usage information */
  includeMemory?: boolean;
  /** Whether to include CPU usage information */
  includeCPU?: boolean;
  /** Custom progress formatter */
  formatter?: (data: HeartbeatData) => string;
  /** Whether to emit to console by default */
  consoleOutput?: boolean;
  /** Maximum runtime in milliseconds before auto-stopping (default: 300000 = 5 minutes) */
  maxRuntime?: number;
}

export interface HeartbeatData {
  /** Unique operation identifier */
  operationId: string;
  /** Human-readable operation name */
  operationName: string;
  /** Current progress percentage (0-100) */
  progress: number;
  /** Estimated time remaining in milliseconds */
  eta: number;
  /** Time elapsed since start in milliseconds */
  elapsed: number;
  /** Current operation step/status */
  status: string;
  /** Memory usage information */
  memory?: MemoryInfo;
  /** CPU usage information */
  cpu?: CPUInfo;
  /** Additional metadata */
  metadata?: Record<string, any>;
  /** Timestamp of this heartbeat */
  timestamp: number;
}

export interface MemoryInfo {
  /** RSS memory usage in bytes */
  rss: number;
  /** Heap used in bytes */
  heapUsed: number;
  /** Heap total in bytes */
  heapTotal: number;
  /** External memory in bytes */
  external: number;
  /** Array buffers in bytes */
  arrayBuffers: number;
}

export interface CPUInfo {
  /** CPU usage percentage */
  usage: number;
  /** User CPU time in milliseconds */
  user: number;
  /** System CPU time in milliseconds */
  system: number;
}

export interface ProgressBarOptions {
  /** Width of the progress bar */
  width?: number;
  /** Progress bar character */
  char?: string;
  /** Empty space character */
  emptyChar?: string;
  /** Whether to show percentage */
  showPercentage?: boolean;
  /** Whether to show ETA */
  showETA?: boolean;
}

export class HeartbeatEmitter extends EventEmitter {
  private config: Required<HeartbeatConfig>;
  private operations: Map<string, OperationState> = new Map();
  private heartbeatTimer?: NodeJS.Timeout;
  private isRunning = false;

  constructor(config: HeartbeatConfig = {}) {
    super();
    this.config = {
      interval: config.interval ?? 5000,
      includeMemory: config.includeMemory ?? true,
      includeCPU: config.includeCPU ?? true,
      formatter: config.formatter ?? this.defaultFormatter.bind(this),
      consoleOutput: config.consoleOutput ?? true,
      maxRuntime: config.maxRuntime ?? 300000, // Default to 5 minutes
    };
    
    // Set up auto-stop timer to prevent infinite running
    if (this.config.maxRuntime > 0) {
      setTimeout(() => {
        if (this.isRunning) {
          this.stop();
          if (this.config.consoleOutput) {
            console.log('🛑 Heartbeat auto-stopped due to max runtime limit');
          }
        }
      }, this.config.maxRuntime);
    }
  }

  /**
   * Start monitoring an operation
   */
  startOperation(
    operationId: string,
    operationName: string,
    totalSteps?: number
  ): void {
    const operation: OperationState = {
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
  updateProgress(
    operationId: string,
    progress: number,
    status?: string,
    metadata?: Record<string, any>
  ): void {
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
  completeOperation(operationId: string, finalStatus?: string): void {
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
  cancelOperation(operationId: string, reason?: string): void {
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
  getOperationStatus(operationId: string): HeartbeatData | null {
    const operation = this.operations.get(operationId);
    return operation ? this.createHeartbeatData(operation) : null;
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): HeartbeatData[] {
    return Array.from(this.operations.values()).map(op => 
      this.createHeartbeatData(op)
    );
  }

  /**
   * Create a progress bar string
   */
  createProgressBar(
    progress: number,
    options: ProgressBarOptions = {}
  ): string {
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
  stop(): void {
    this.stopHeartbeat();
    this.operations.clear();
    this.removeAllListeners();
    
    if (this.config.consoleOutput) {
      console.log('🛑 Heartbeat emitter stopped');
    }
  }

  private startHeartbeat(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.heartbeatTimer = setInterval(() => {
      this.emitHeartbeats();
    }, this.config.interval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    this.isRunning = false;
  }

  private emitHeartbeats(): void {
    for (const operation of this.operations.values()) {
      const heartbeatData = this.createHeartbeatData(operation);
      this.emit('heartbeat', heartbeatData);
      
      if (this.config.consoleOutput) {
        console.log(this.config.formatter(heartbeatData));
      }
    }
  }

  private createHeartbeatData(operation: OperationState): HeartbeatData {
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

    const data: HeartbeatData = {
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

  private getMemoryInfo(): MemoryInfo {
    const memUsage = process.memoryUsage();
    return {
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    };
  }

  private getCPUInfo(): CPUInfo {
    const startUsage = process.cpuUsage();
    // Simple CPU usage approximation
    return {
      usage: 0, // Would need more sophisticated monitoring for real CPU usage
      user: startUsage.user,
      system: startUsage.system,
    };
  }

  private defaultFormatter(data: HeartbeatData): string {
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

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }
}

interface OperationState {
  id: string;
  name: string;
  startTime: number;
  lastHeartbeat: number;
  currentStep: number;
  totalSteps: number;
  status: string;
  metadata: Record<string, any>;
}

// Export singleton instance for global use
export const globalHeartbeat = new HeartbeatEmitter();

// Export convenience functions
export const heartbeat = {
  start: (id: string, name: string, totalSteps?: number) => 
    globalHeartbeat.startOperation(id, name, totalSteps),
  update: (id: string, progress: number, status?: string, metadata?: Record<string, any>) =>
    globalHeartbeat.updateProgress(id, progress, status, metadata),
  complete: (id: string, status?: string) => 
    globalHeartbeat.completeOperation(id, status),
  cancel: (id: string, reason?: string) => 
    globalHeartbeat.cancelOperation(id, reason),
  status: (id: string) => globalHeartbeat.getOperationStatus(id),
  active: () => globalHeartbeat.getActiveOperations(),
  stop: () => globalHeartbeat.stop(),
};
