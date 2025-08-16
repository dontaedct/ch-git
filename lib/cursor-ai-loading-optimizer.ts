/**
 * 🚀 CURSOR AI LOADING OPTIMIZER
 * 
 * This system provides intelligent loading optimizations specifically for Cursor AI operations:
 * - Batch processing for large operations
 * - Progress indicators and user feedback
 * - AI-specific timeout management
 * - Smart chunking and resource management
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 * 
 * @author MIT Hero System
 * @version 1.0.0
 * @license MIT
 */

import { RetryHelper } from './retry';
import { ConcurrencyLimiter } from './concurrency';

export interface LoadingOperation {
  id: string;
  type: 'batch' | 'chunk' | 'stream';
  totalItems: number;
  processedItems: number;
  currentBatch: number;
  totalBatches: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startTime: number;
  estimatedTime?: number;
  progress: number; // 0-100
}

export interface BatchConfig {
  maxBatchSize: number;
  maxConcurrentBatches: number;
  batchTimeout: number;
  progressUpdateInterval: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
}

export interface ChunkingStrategy {
  strategy: 'fixed' | 'adaptive' | 'intelligent';
  initialChunkSize: number;
  maxChunkSize: number;
  minChunkSize: number;
  growthFactor: number;
  shrinkThreshold: number;
}

export class CursorAILoadingOptimizer {
  private operations: Map<string, LoadingOperation> = new Map();
  private retryHelper: RetryHelper;
  private concurrencyLimiter: ConcurrencyLimiter;
  private batchConfig: BatchConfig;
  private chunkingStrategy: ChunkingStrategy;
  private progressCallbacks: Map<string, (progress: number) => void> = new Map();

  constructor(config?: Partial<BatchConfig & ChunkingStrategy>) {
    this.batchConfig = {
      maxBatchSize: 20,
      maxConcurrentBatches: 3,
      batchTimeout: 30000,
      progressUpdateInterval: 1000,
      enableCircuitBreaker: true,
      circuitBreakerThreshold: 3,
      ...config
    };

    this.chunkingStrategy = {
      strategy: 'intelligent',
      initialChunkSize: 10,
      maxChunkSize: 50,
      minChunkSize: 5,
      growthFactor: 1.5,
      shrinkThreshold: 0.7,
      ...config
    };

    this.retryHelper = new RetryHelper({
      maxAttempts: 3,
      baseDelay: 1000,
      circuitBreakerThreshold: this.batchConfig.circuitBreakerThreshold
    });

    this.concurrencyLimiter = new ConcurrencyLimiter({
      maxConcurrent: this.batchConfig.maxConcurrentBatches,
      maxQueueSize: 50,
      timeoutMs: this.batchConfig.batchTimeout
    });
  }

  /**
   * AUDIT: Analyze operation complexity and determine optimal strategy
   */
  async auditOperation<T>(
    items: T[],
    operation: (batch: T[]) => Promise<any>,
    operationId?: string
  ): Promise<LoadingOperation> {
    const id = operationId || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalItems = items.length;
    
    // Determine optimal chunking strategy based on operation size
    const strategy = this.determineChunkingStrategy(totalItems);
    const totalBatches = Math.ceil(totalItems / strategy.initialChunkSize);
    
    const loadingOp: LoadingOperation = {
      id,
      type: totalBatches > 1 ? 'batch' : 'chunk',
      totalItems,
      processedItems: 0,
      currentBatch: 0,
      totalBatches,
      status: 'pending',
      startTime: Date.now(),
      progress: 0
    };

    this.operations.set(id, loadingOp);
    return loadingOp;
  }

  /**
   * DECIDE: Determine optimal processing approach
   */
  private determineChunkingStrategy(totalItems: number): ChunkingStrategy {
    if (totalItems <= this.chunkingStrategy.minChunkSize) {
      return { ...this.chunkingStrategy, strategy: 'fixed' };
    } else if (totalItems <= this.chunkingStrategy.maxChunkSize * 2) {
      return { ...this.chunkingStrategy, strategy: 'adaptive' };
    } else {
      return { ...this.chunkingStrategy, strategy: 'intelligent' };
    }
  }

  /**
   * APPLY: Execute operation with loading optimizations
   */
  async executeWithOptimization<T>(
    items: T[],
    operation: (batch: T[]) => Promise<any>,
    onProgress?: (progress: number) => void,
    operationId?: string
  ): Promise<any[]> {
    const loadingOp = await this.auditOperation(items, operation, operationId);
    
    if (onProgress) {
      this.progressCallbacks.set(loadingOp.id, onProgress);
    }

    try {
      loadingOp.status = 'processing';
      this.updateProgress(loadingOp.id, 0);

      if (loadingOp.type === 'batch') {
        return await this.processInBatches(items, operation, loadingOp);
      } else {
        return await this.processInChunks(items, operation, loadingOp);
      }
    } catch (error) {
      loadingOp.status = 'failed';
      this.updateProgress(loadingOp.id, 0);
      throw error;
    } finally {
      loadingOp.status = 'completed';
      this.updateProgress(loadingOp.id, 100);
      this.operations.delete(loadingOp.id);
      this.progressCallbacks.delete(loadingOp.id);
    }
  }

  /**
   * Process items in optimized batches
   */
  private async processInBatches<T>(
    items: T[],
    operation: (batch: T[]) => Promise<any>,
    loadingOp: LoadingOperation
  ): Promise<any[]> {
    const batches = this.createBatches(items, this.batchConfig.maxBatchSize);
    const results: any[] = [];
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      loadingOp.currentBatch = i + 1;
      
      try {
        // Execute batch with timeout and retry protection
        const batchResult = await this.retryHelper.execute(async () => {
          return await this.concurrencyLimiter.execute(async () => {
            return await operation(batch);
          });
        });

        results.push(...(Array.isArray(batchResult) ? batchResult : [batchResult]));
        loadingOp.processedItems += batch.length;
        
        // Update progress
        const progress = Math.round((loadingOp.processedItems / loadingOp.totalItems) * 100);
        this.updateProgress(loadingOp.id, progress);
        
        // Estimate remaining time
        if (i > 0) {
          const elapsed = Date.now() - loadingOp.startTime;
          const avgTimePerBatch = elapsed / i;
          const remainingBatches = batches.length - i - 1;
          loadingOp.estimatedTime = avgTimePerBatch * remainingBatches;
        }

      } catch (error) {
        console.error(`❌ Batch ${i + 1} failed:`, error);
        throw new Error(`Batch processing failed at batch ${i + 1}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Process items in intelligent chunks
   */
  private async processInChunks<T>(
    items: T[],
    operation: (batch: T[]) => Promise<any>,
    loadingOp: LoadingOperation
  ): Promise<any[]> {
    let currentChunkSize = this.chunkingStrategy.initialChunkSize;
    const results: any[] = [];
    let processed = 0;

    while (processed < items.length) {
      const chunk = items.slice(processed, processed + currentChunkSize);
      
      try {
        const chunkResult = await this.retryHelper.execute(async () => {
          return await operation(chunk);
        });

        results.push(...(Array.isArray(chunkResult) ? chunkResult : [chunkResult]));
        processed += chunk.length;
        loadingOp.processedItems = processed;
        
        // Update progress
        const progress = Math.round((processed / loadingOp.totalItems) * 100);
        this.updateProgress(loadingOp.id, progress);
        
        // Adapt chunk size based on performance
        currentChunkSize = this.adaptChunkSize(currentChunkSize, chunk.length);

      } catch (error) {
        console.error(`❌ Chunk processing failed:`, error);
        // Reduce chunk size on failure
        currentChunkSize = Math.max(this.chunkingStrategy.minChunkSize, 
          Math.floor(currentChunkSize * this.chunkingStrategy.shrinkThreshold));
      }
    }

    return results;
  }

  /**
   * Create batches from items
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Adapt chunk size based on performance
   */
  private adaptChunkSize(currentSize: number, processedSize: number): number {
    if (processedSize === currentSize) {
      // Successful processing, can grow
      return Math.min(
        this.chunkingStrategy.maxChunkSize,
        Math.floor(currentSize * this.chunkingStrategy.growthFactor)
      );
    } else {
      // Partial processing, reduce size
      return Math.max(
        this.chunkingStrategy.minChunkSize,
        Math.floor(currentSize * this.chunkingStrategy.shrinkThreshold)
      );
    }
  }

  /**
   * Update progress and notify callbacks
   */
  private updateProgress(operationId: string, progress: number): void {
    const operation = this.operations.get(operationId);
    if (operation) {
      operation.progress = progress;
      
      const callback = this.progressCallbacks.get(operationId);
      if (callback) {
        callback(progress);
      }
    }
  }

  /**
   * Get operation status
   */
  getOperationStatus(operationId: string): LoadingOperation | undefined {
    return this.operations.get(operationId);
  }

  /**
   * Get all active operations
   */
  getActiveOperations(): LoadingOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Cancel operation
   */
  cancelOperation(operationId: string): boolean {
    const operation = this.operations.get(operationId);
    if (operation && operation.status === 'processing') {
      operation.status = 'failed';
      this.updateProgress(operationId, 0);
      return true;
    }
    return false;
  }

  /**
   * VERIFY: Check system health and performance
   */
  async verifySystemHealth(): Promise<{
    activeOperations: number;
    averageProgress: number;
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  }> {
    const activeOps = this.getActiveOperations();
    const avgProgress = activeOps.length > 0 
      ? activeOps.reduce((sum, op) => sum + op.progress, 0) / activeOps.length
      : 0;

    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
    const recommendations: string[] = [];

    if (activeOps.length > this.batchConfig.maxConcurrentBatches * 2) {
      systemHealth = 'poor';
      recommendations.push('Too many concurrent operations - consider reducing batch size');
    } else if (activeOps.length > this.batchConfig.maxConcurrentBatches) {
      systemHealth = 'fair';
      recommendations.push('High concurrency - monitor performance');
    } else if (avgProgress < 50 && activeOps.length > 0) {
      systemHealth = 'good';
      recommendations.push('Operations progressing slowly - consider timeout adjustments');
    }

    return {
      activeOperations: activeOps.length,
      averageProgress: Math.round(avgProgress),
      systemHealth,
      recommendations
    };
  }
}
