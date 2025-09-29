/**
 * Dead Letter Queue for Failed Workflows
 * 
 * Implements dead-letter queue system for handling failed workflow executions
 * with retry capabilities, expiration, and monitoring per PRD Section 8 requirements.
 */

import {
  DLQMessage,
  DLQRetryRequest,
  ExecutionError,
  ExecutionPriority,
  WorkflowExecution,
  ExecutionStatus,
  OrchestrationError
} from './architecture';

// ============================================================================
// Dead Letter Queue Configuration
// ============================================================================

export interface DLQConfig {
  maxRetries: number;
  retryDelayMs: number;
  maxRetryDelayMs: number;
  messageExpirationMs: number;
  maxQueueSize: number;
  enableMetrics: boolean;
  enableLogging: boolean;
  cleanupIntervalMs: number;
  batchSize: number;
}

export interface DLQMessageFilter {
  workflowId?: string;
  executionId?: string;
  priority?: ExecutionPriority;
  errorType?: string;
  createdAt?: {
    start: Date;
    end: Date;
  };
  retryCount?: {
    min: number;
    max: number;
  };
}

export interface DLQMetrics {
  totalMessages: number;
  processedMessages: number;
  failedMessages: number;
  expiredMessages: number;
  retrySuccessRate: number;
  averageRetryDuration: number;
  queueSize: number;
  oldestMessageAge: number;
  errorTypeDistribution: Record<string, number>;
}

export interface DLQRetryResult {
  success: boolean;
  messageId: string;
  retryCount: number;
  error?: string;
  duration: number;
}

// ============================================================================
// Dead Letter Queue Class
// ============================================================================

export class DeadLetterQueue {
  private messages: Map<string, DLQMessage> = new Map();
  private retryQueue: Array<DLQMessage> = [];
  private metrics: DLQMetrics;
  private cleanupInterval?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(private config: DLQConfig) {
    this.metrics = {
      totalMessages: 0,
      processedMessages: 0,
      failedMessages: 0,
      expiredMessages: 0,
      retrySuccessRate: 0,
      averageRetryDuration: 0,
      queueSize: 0,
      oldestMessageAge: 0,
      errorTypeDistribution: {}
    };

    this.startCleanupProcess();
  }

  /**
   * Add failed execution to dead letter queue
   */
  async addFailedExecution(
    execution: WorkflowExecution,
    error: ExecutionError,
    priority: ExecutionPriority = 'normal'
  ): Promise<string> {
    const messageId = this.generateMessageId();
    const now = new Date();
    
    const message: DLQMessage = {
      id: messageId,
      workflowId: execution.workflowId,
      executionId: execution.id,
      payload: execution.payload,
      error,
      retryCount: 0,
      createdAt: now,
      expiresAt: new Date(now.getTime() + this.config.messageExpirationMs),
      priority,
      metadata: {
        originalExecution: execution,
        addedAt: now,
        lastRetryAt: undefined
      }
    };

    // Check queue size limit
    if (this.messages.size >= this.config.maxQueueSize) {
      throw new OrchestrationError(
        'Dead letter queue is full',
        'DLQ_FULL',
        { queueSize: this.messages.size, maxSize: this.config.maxQueueSize }
      );
    }

    this.messages.set(messageId, message);
    this.updateMetrics('add', message);

    if (this.config.enableLogging) {
      console.log(`[DLQ] Added failed execution to queue: ${messageId}`, {
        workflowId: execution.workflowId,
        executionId: execution.id,
        error: error.message,
        priority
      });
    }

    return messageId;
  }

  /**
   * Retry failed execution
   */
  async retryExecution(request: DLQRetryRequest): Promise<DLQRetryResult> {
    const startTime = Date.now();
    const message = this.messages.get(request.messageId);
    
    if (!message) {
      throw new OrchestrationError(
        `Message not found: ${request.messageId}`,
        'MESSAGE_NOT_FOUND',
        { messageId: request.messageId }
      );
    }

    if (message.retryCount >= this.config.maxRetries) {
      throw new OrchestrationError(
        `Maximum retries exceeded for message: ${request.messageId}`,
        'MAX_RETRIES_EXCEEDED',
        { messageId: request.messageId, retryCount: message.retryCount }
      );
    }

    if (this.isMessageExpired(message)) {
      throw new OrchestrationError(
        `Message expired: ${request.messageId}`,
        'MESSAGE_EXPIRED',
        { messageId: request.messageId, expiresAt: message.expiresAt }
      );
    }

    try {
      // Increment retry count
      message.retryCount++;
      message.metadata.lastRetryAt = new Date();

      // Execute retry logic
      const success = await this.executeRetry(message, request.retryOptions);
      
      const duration = Date.now() - startTime;
      
      if (success) {
        // Remove message from queue on success
        this.messages.delete(request.messageId);
        this.updateMetrics('retry_success', message, duration);
        
        if (this.config.enableLogging) {
          console.log(`[DLQ] Retry successful: ${request.messageId}`, {
            retryCount: message.retryCount,
            duration
          });
        }
        
        return {
          success: true,
          messageId: request.messageId,
          retryCount: message.retryCount,
          duration
        };
      } else {
        this.updateMetrics('retry_failure', message, duration);
        
        if (this.config.enableLogging) {
          console.warn(`[DLQ] Retry failed: ${request.messageId}`, {
            retryCount: message.retryCount,
            duration
          });
        }
        
        return {
          success: false,
          messageId: request.messageId,
          retryCount: message.retryCount,
          error: 'Retry execution failed',
          duration
        };
      }

    } catch (error) {
      const duration = Date.now() - startTime;
      this.updateMetrics('retry_error', message, duration);
      
      if (this.config.enableLogging) {
        console.error(`[DLQ] Retry error: ${request.messageId}`, {
          error: (error as Error).message,
          retryCount: message.retryCount,
          duration
        });
      }
      
      return {
        success: false,
        messageId: request.messageId,
        retryCount: message.retryCount,
        error: (error as Error).message,
        duration
      };
    }
  }

  /**
   * Get messages from queue
   */
  getMessages(filter?: DLQMessageFilter): DLQMessage[] {
    let messages = Array.from(this.messages.values());

    if (filter) {
      messages = messages.filter(message => {
        if (filter.workflowId && message.workflowId !== filter.workflowId) {
          return false;
        }
        
        if (filter.executionId && message.executionId !== filter.executionId) {
          return false;
        }
        
        if (filter.priority && message.priority !== filter.priority) {
          return false;
        }
        
        if (filter.errorType && message.error.type !== filter.errorType) {
          return false;
        }
        
        if (filter.createdAt) {
          if (message.createdAt < filter.createdAt.start || message.createdAt > filter.createdAt.end) {
            return false;
          }
        }
        
        if (filter.retryCount) {
          if (message.retryCount < filter.retryCount.min || message.retryCount > filter.retryCount.max) {
            return false;
          }
        }
        
        return true;
      });
    }

    // Sort by priority and creation time
    return messages.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  /**
   * Get message by ID
   */
  getMessage(messageId: string): DLQMessage | undefined {
    return this.messages.get(messageId);
  }

  /**
   * Remove message from queue
   */
  removeMessage(messageId: string): boolean {
    const message = this.messages.get(messageId);
    if (message) {
      this.messages.delete(messageId);
      this.updateMetrics('remove', message);
      
      if (this.config.enableLogging) {
        console.log(`[DLQ] Removed message: ${messageId}`);
      }
      
      return true;
    }
    return false;
  }

  /**
   * Clear expired messages
   */
  clearExpiredMessages(): number {
    const now = new Date();
    const expiredMessages: string[] = [];
    
    for (const [messageId, message] of this.messages.entries()) {
      if (this.isMessageExpired(message)) {
        expiredMessages.push(messageId);
      }
    }
    
    for (const messageId of expiredMessages) {
      const message = this.messages.get(messageId);
      if (message) {
        this.messages.delete(messageId);
        this.updateMetrics('expire', message);
      }
    }
    
    if (this.config.enableLogging && expiredMessages.length > 0) {
      console.log(`[DLQ] Cleared ${expiredMessages.length} expired messages`);
    }
    
    return expiredMessages.length;
  }

  /**
   * Get queue metrics
   */
  getMetrics(): DLQMetrics {
    return { ...this.metrics };
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.messages.size;
  }

  /**
   * Check if queue is full
   */
  isFull(): boolean {
    return this.messages.size >= this.config.maxQueueSize;
  }

  /**
   * Get oldest message age
   */
  getOldestMessageAge(): number {
    if (this.messages.size === 0) {
      return 0;
    }
    
    const now = Date.now();
    let oldestAge = 0;
    
    for (const message of this.messages.values()) {
      const age = now - message.createdAt.getTime();
      if (age > oldestAge) {
        oldestAge = age;
      }
    }
    
    return oldestAge;
  }

  /**
   * Process retry queue
   */
  async processRetryQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const messagesToRetry = this.getMessages({
        retryCount: { min: 0, max: this.config.maxRetries - 1 }
      }).slice(0, this.config.batchSize);
      
      for (const message of messagesToRetry) {
        try {
          await this.retryExecution({
            messageId: message.id,
            forceRetry: true
          });
        } catch (error) {
          if (this.config.enableLogging) {
            console.error(`[DLQ] Failed to process retry for message: ${message.id}`, {
              error: (error as Error).message
            });
          }
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Shutdown dead letter queue
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    if (this.config.enableLogging) {
      console.log('[DLQ] Dead letter queue shutdown');
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Execute retry logic
   */
  private async executeRetry(
    message: DLQMessage,
    retryOptions?: any
  ): Promise<boolean> {
    // This would integrate with the workflow executor
    // For now, we'll simulate a retry attempt
    
    try {
      // Simulate retry delay
      const delay = Math.min(
        this.config.retryDelayMs * Math.pow(2, message.retryCount - 1),
        this.config.maxRetryDelayMs
      );
      
      await this.sleep(delay);
      
      // Simulate retry success/failure based on retry count
      // In real implementation, this would call the workflow executor
      const successRate = Math.max(0.1, 1 - (message.retryCount * 0.2));
      return Math.random() < successRate;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if message is expired
   */
  private isMessageExpired(message: DLQMessage): boolean {
    return new Date() > message.expiresAt;
  }

  /**
   * Update metrics
   */
  private updateMetrics(
    action: string,
    message: DLQMessage,
    duration?: number
  ): void {
    if (!this.config.enableMetrics) return;

    switch (action) {
      case 'add':
        this.metrics.totalMessages++;
        this.metrics.queueSize = this.messages.size;
        break;
        
      case 'remove':
        this.metrics.queueSize = this.messages.size;
        break;
        
      case 'expire':
        this.metrics.expiredMessages++;
        this.metrics.queueSize = this.messages.size;
        break;
        
      case 'retry_success':
        this.metrics.processedMessages++;
        if (duration) {
          this.updateAverageRetryDuration(duration);
        }
        break;
        
      case 'retry_failure':
      case 'retry_error':
        this.metrics.failedMessages++;
        if (duration) {
          this.updateAverageRetryDuration(duration);
        }
        break;
    }
    
    // Update retry success rate
    const totalRetries = this.metrics.processedMessages + this.metrics.failedMessages;
    if (totalRetries > 0) {
      this.metrics.retrySuccessRate = (this.metrics.processedMessages / totalRetries) * 100;
    }
    
    // Update oldest message age
    this.metrics.oldestMessageAge = this.getOldestMessageAge();
    
    // Update error type distribution
    this.updateErrorTypeDistribution(message.error.type);
  }

  /**
   * Update average retry duration
   */
  private updateAverageRetryDuration(duration: number): void {
    const totalRetries = this.metrics.processedMessages + this.metrics.failedMessages;
    this.metrics.averageRetryDuration = 
      (this.metrics.averageRetryDuration * (totalRetries - 1) + duration) / totalRetries;
  }

  /**
   * Update error type distribution
   */
  private updateErrorTypeDistribution(errorType: string): void {
    this.metrics.errorTypeDistribution[errorType] = 
      (this.metrics.errorTypeDistribution[errorType] || 0) + 1;
  }

  /**
   * Start cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredMessages();
    }, this.config.cleanupIntervalMs);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate message ID
   */
  private generateMessageId(): string {
    return `dlq_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// Dead Letter Queue Factory
// ============================================================================

export class DeadLetterQueueFactory {
  /**
   * Create dead letter queue with default configuration
   */
  static create(config: Partial<DLQConfig> = {}): DeadLetterQueue {
    const defaultConfig: DLQConfig = {
      maxRetries: 3,
      retryDelayMs: 1000,
      maxRetryDelayMs: 30000,
      messageExpirationMs: 86400000, // 24 hours
      maxQueueSize: 10000,
      enableMetrics: true,
      enableLogging: true,
      cleanupIntervalMs: 300000, // 5 minutes
      batchSize: 100
    };

    return new DeadLetterQueue({ ...defaultConfig, ...config });
  }

  /**
   * Create dead letter queue for production
   */
  static createProduction(): DeadLetterQueue {
    return this.create({
      maxRetries: 5,
      retryDelayMs: 2000,
      maxRetryDelayMs: 60000,
      messageExpirationMs: 604800000, // 7 days
      maxQueueSize: 50000,
      enableMetrics: true,
      enableLogging: false,
      cleanupIntervalMs: 600000, // 10 minutes
      batchSize: 500
    });
  }

  /**
   * Create dead letter queue for development
   */
  static createDevelopment(): DeadLetterQueue {
    return this.create({
      maxRetries: 2,
      retryDelayMs: 500,
      maxRetryDelayMs: 5000,
      messageExpirationMs: 3600000, // 1 hour
      maxQueueSize: 1000,
      enableMetrics: true,
      enableLogging: true,
      cleanupIntervalMs: 60000, // 1 minute
      batchSize: 10
    });
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default DeadLetterQueue;
