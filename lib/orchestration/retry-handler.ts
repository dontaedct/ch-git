/**
 * Retry Handler with Exponential Backoff
 * 
 * Implements comprehensive retry logic with exponential backoff,
 * jitter, and circuit breaker patterns per PRD Section 8 requirements.
 */

import {
  RetryConfig,
  BackoffStrategy,
  ExecutionError,
  ErrorType,
  OrchestrationError
} from './architecture';

// ============================================================================
// Retry Handler Configuration
// ============================================================================

export interface RetryHandlerConfig extends RetryConfig {
  enableMetrics: boolean;
  enableLogging: boolean;
  maxRetryDuration: number; // Maximum total time for all retries
}

export interface RetryAttempt {
  attempt: number;
  timestamp: Date;
  delay: number;
  error?: Error;
  success: boolean;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: RetryAttempt[];
  totalDuration: number;
  totalAttempts: number;
}

export interface RetryMetrics {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  averageRetryDuration: number;
  retrySuccessRate: number;
  errorTypeDistribution: Record<ErrorType, number>;
}

// ============================================================================
// Retry Handler Class
// ============================================================================

export class RetryHandler {
  private metrics: RetryMetrics;
  private retryHistory: Map<string, RetryAttempt[]> = new Map();

  constructor(private config: RetryHandlerConfig) {
    this.metrics = {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageRetryDuration: 0,
      retrySuccessRate: 0,
      errorTypeDistribution: {} as Record<ErrorType, number>
    };
  }

  /**
   * Execute operation with retry logic
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    context?: {
      operationId?: string;
      operationName?: string;
      customRetryConfig?: Partial<RetryConfig>;
    }
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const attempts: RetryAttempt[] = [];
    const operationId = context?.operationId || this.generateOperationId();
    const retryConfig = { ...this.config, ...context?.customRetryConfig };
    
    let lastError: Error;
    let result: T;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      const attemptStartTime = Date.now();
      
      try {
        // Execute operation
        result = await operation();
        
        // Record successful attempt
        const attemptRecord: RetryAttempt = {
          attempt: attempt + 1,
          timestamp: new Date(),
          delay: attempt > 0 ? this.calculateRetryDelay(attempt - 1, retryConfig) : 0,
          success: true
        };
        
        attempts.push(attemptRecord);
        
        if (this.config.enableLogging) {
          this.logRetryAttempt(operationId, attemptRecord, context?.operationName);
        }
        
        // Update metrics
        this.updateMetrics(true, attempt, Date.now() - startTime);
        
        // Store retry history
        this.retryHistory.set(operationId, attempts);
        
        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime,
          totalAttempts: attempt + 1
        };

      } catch (error) {
        lastError = error as Error;
        
        // Record failed attempt
        const attemptRecord: RetryAttempt = {
          attempt: attempt + 1,
          timestamp: new Date(),
          delay: attempt > 0 ? this.calculateRetryDelay(attempt - 1, retryConfig) : 0,
          error: lastError,
          success: false
        };
        
        attempts.push(attemptRecord);
        
        if (this.config.enableLogging) {
          this.logRetryAttempt(operationId, attemptRecord, context?.operationName);
        }
        
        // Check if we should retry
        if (attempt === retryConfig.maxRetries) {
          break;
        }
        
        if (!this.shouldRetry(lastError, attempt, retryConfig)) {
          break;
        }
        
        // Check if we've exceeded max retry duration
        if (Date.now() - startTime > retryConfig.maxRetryDuration) {
          if (this.config.enableLogging) {
            console.warn(`Retry timeout exceeded for operation: ${operationId}`);
          }
          break;
        }
        
        // Calculate and wait for retry delay
        const delay = this.calculateRetryDelay(attempt, retryConfig);
        await this.sleep(delay);
      }
    }
    
    // Update metrics for failed operation
    this.updateMetrics(false, attempts.length, Date.now() - startTime);
    
    // Store retry history
    this.retryHistory.set(operationId, attempts);
    
    return {
      success: false,
      error: lastError!,
      attempts,
      totalDuration: Date.now() - startTime,
      totalAttempts: attempts.length
    };
  }

  /**
   * Execute operation with custom retry strategy
   */
  async executeWithCustomStrategy<T>(
    operation: () => Promise<T>,
    strategy: (attempt: number, error: Error) => Promise<boolean>,
    context?: {
      operationId?: string;
      operationName?: string;
    }
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const attempts: RetryAttempt[] = [];
    const operationId = context?.operationId || this.generateOperationId();
    
    let lastError: Error;
    let result: T;
    let attempt = 0;

    while (true) {
      const attemptStartTime = Date.now();
      
      try {
        // Execute operation
        result = await operation();
        
        // Record successful attempt
        const attemptRecord: RetryAttempt = {
          attempt: attempt + 1,
          timestamp: new Date(),
          delay: attempt > 0 ? this.calculateRetryDelay(attempt - 1, this.config) : 0,
          success: true
        };
        
        attempts.push(attemptRecord);
        
        if (this.config.enableLogging) {
          this.logRetryAttempt(operationId, attemptRecord, context?.operationName);
        }
        
        // Update metrics
        this.updateMetrics(true, attempt, Date.now() - startTime);
        
        // Store retry history
        this.retryHistory.set(operationId, attempts);
        
        return {
          success: true,
          result,
          attempts,
          totalDuration: Date.now() - startTime,
          totalAttempts: attempt + 1
        };

      } catch (error) {
        lastError = error as Error;
        
        // Record failed attempt
        const attemptRecord: RetryAttempt = {
          attempt: attempt + 1,
          timestamp: new Date(),
          delay: attempt > 0 ? this.calculateRetryDelay(attempt - 1, this.config) : 0,
          error: lastError,
          success: false
        };
        
        attempts.push(attemptRecord);
        
        if (this.config.enableLogging) {
          this.logRetryAttempt(operationId, attemptRecord, context?.operationName);
        }
        
        // Check if we should retry using custom strategy
        const shouldRetry = await strategy(attempt, lastError);
        
        if (!shouldRetry) {
          break;
        }
        
        // Check if we've exceeded max retry duration
        if (Date.now() - startTime > this.config.maxRetryDuration) {
          if (this.config.enableLogging) {
            console.warn(`Retry timeout exceeded for operation: ${operationId}`);
          }
          break;
        }
        
        attempt++;
        
        // Calculate and wait for retry delay
        const delay = this.calculateRetryDelay(attempt - 1, this.config);
        await this.sleep(delay);
      }
    }
    
    // Update metrics for failed operation
    this.updateMetrics(false, attempts.length, Date.now() - startTime);
    
    // Store retry history
    this.retryHistory.set(operationId, attempts);
    
    return {
      success: false,
      error: lastError!,
      attempts,
      totalDuration: Date.now() - startTime,
      totalAttempts: attempts.length
    };
  }

  /**
   * Get retry metrics
   */
  getMetrics(): RetryMetrics {
    return { ...this.metrics };
  }

  /**
   * Get retry history for operation
   */
  getRetryHistory(operationId: string): RetryAttempt[] {
    return this.retryHistory.get(operationId) || [];
  }

  /**
   * Clear retry history
   */
  clearRetryHistory(operationId?: string): void {
    if (operationId) {
      this.retryHistory.delete(operationId);
    } else {
      this.retryHistory.clear();
    }
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRetries: 0,
      successfulRetries: 0,
      failedRetries: 0,
      averageRetryDuration: 0,
      retrySuccessRate: 0,
      errorTypeDistribution: {} as Record<ErrorType, number>
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Check if error should be retried
   */
  private shouldRetry(error: Error, attempt: number, config: RetryConfig): boolean {
    // Check if we've exceeded max retries
    if (attempt >= config.maxRetries) {
      return false;
    }
    
    // Check if error is retryable
    if (!this.isRetryableError(error, config)) {
      return false;
    }
    
    return true;
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error, config: RetryConfig): boolean {
    const message = error.message.toLowerCase();
    
    // Check against retryable error patterns
    for (const retryableError of config.retryableErrors) {
      if (message.includes(retryableError.toLowerCase())) {
        return true;
      }
    }
    
    // Check error type
    const errorType = this.categorizeError(error);
    const retryableTypes: ErrorType[] = ['network', 'timeout', 'execution'];
    
    return retryableTypes.includes(errorType);
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('auth')) return 'authentication';
    if (message.includes('permission')) return 'authorization';
    if (message.includes('validation')) return 'validation';
    
    return 'execution';
  }

  /**
   * Calculate retry delay based on strategy
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const baseDelay = config.baseDelayMs;
    const maxDelay = config.maxDelayMs;
    const jitter = config.jitterFactor;

    let delay: number;
    
    switch (config.backoffStrategy) {
      case 'exponential':
        delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        break;
      case 'linear':
        delay = Math.min(baseDelay * (attempt + 1), maxDelay);
        break;
      case 'fixed':
        delay = baseDelay;
        break;
      case 'custom':
        // For custom strategy, use exponential as default
        delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
        break;
      default:
        delay = baseDelay;
    }

    // Add jitter to prevent thundering herd
    if (jitter > 0) {
      const jitterAmount = delay * jitter * Math.random();
      delay = Math.floor(delay + jitterAmount);
    }

    return delay;
  }

  /**
   * Update retry metrics
   */
  private updateMetrics(success: boolean, attempts: number, duration: number): void {
    if (!this.config.enableMetrics) return;

    this.metrics.totalRetries += attempts;
    
    if (success) {
      this.metrics.successfulRetries += 1;
    } else {
      this.metrics.failedRetries += 1;
    }
    
    // Update average retry duration
    const totalOperations = this.metrics.successfulRetries + this.metrics.failedRetries;
    this.metrics.averageRetryDuration = 
      (this.metrics.averageRetryDuration * (totalOperations - 1) + duration) / totalOperations;
    
    // Update retry success rate
    this.metrics.retrySuccessRate = 
      (this.metrics.successfulRetries / totalOperations) * 100;
  }

  /**
   * Log retry attempt
   */
  private logRetryAttempt(
    operationId: string,
    attempt: RetryAttempt,
    operationName?: string
  ): void {
    const operation = operationName || 'Unknown';
    
    if (attempt.success) {
      console.log(`[RETRY SUCCESS] ${operation} (${operationId}) - Attempt ${attempt.attempt} succeeded`);
    } else {
      console.warn(`[RETRY ATTEMPT] ${operation} (${operationId}) - Attempt ${attempt.attempt} failed: ${attempt.error?.message}`);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// Retry Strategy Implementations
// ============================================================================

export class RetryStrategies {
  /**
   * Exponential backoff with jitter
   */
  static exponentialBackoff(
    baseDelayMs: number = 1000,
    maxDelayMs: number = 10000,
    jitterFactor: number = 0.1
  ): (attempt: number, error: Error) => Promise<boolean> {
    return async (attempt: number, error: Error) => {
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      const jitter = delay * jitterFactor * Math.random();
      const totalDelay = Math.floor(delay + jitter);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return true;
    };
  }

  /**
   * Linear backoff
   */
  static linearBackoff(
    baseDelayMs: number = 1000,
    maxDelayMs: number = 10000
  ): (attempt: number, error: Error) => Promise<boolean> {
    return async (attempt: number, error: Error) => {
      const delay = Math.min(baseDelayMs * (attempt + 1), maxDelayMs);
      await new Promise(resolve => setTimeout(resolve, delay));
      return true;
    };
  }

  /**
   * Fixed delay
   */
  static fixedDelay(delayMs: number = 1000): (attempt: number, error: Error) => Promise<boolean> {
    return async (attempt: number, error: Error) => {
      await new Promise(resolve => setTimeout(resolve, delayMs));
      return true;
    };
  }

  /**
   * Conditional retry based on error type
   */
  static conditionalRetry(
    retryableErrors: string[] = ['timeout', 'network', '5xx']
  ): (attempt: number, error: Error) => Promise<boolean> {
    return async (attempt: number, error: Error) => {
      const message = error.message.toLowerCase();
      return retryableErrors.some(retryableError => 
        message.includes(retryableError.toLowerCase())
      );
    };
  }

  /**
   * Retry with maximum attempts
   */
  static maxAttempts(maxAttempts: number = 3): (attempt: number, error: Error) => Promise<boolean> {
    return async (attempt: number, error: Error) => {
      return attempt < maxAttempts;
    };
  }

  /**
   * Retry with timeout
   */
  static withTimeout(timeoutMs: number = 30000): (attempt: number, error: Error) => Promise<boolean> {
    const startTime = Date.now();
    
    return async (attempt: number, error: Error) => {
      return Date.now() - startTime < timeoutMs;
    };
  }
}

// ============================================================================
// Retry Handler Factory
// ============================================================================

export class RetryHandlerFactory {
  /**
   * Create retry handler with default configuration
   */
  static create(config: Partial<RetryHandlerConfig> = {}): RetryHandler {
    const defaultConfig: RetryHandlerConfig = {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      jitterFactor: 0.1,
      retryableErrors: ['timeout', 'network', '5xx'],
      backoffStrategy: 'exponential',
      enableMetrics: true,
      enableLogging: true,
      maxRetryDuration: 300000 // 5 minutes
    };

    return new RetryHandler({ ...defaultConfig, ...config });
  }

  /**
   * Create retry handler for production
   */
  static createProduction(): RetryHandler {
    return this.create({
      maxRetries: 5,
      baseDelayMs: 2000,
      maxDelayMs: 30000,
      jitterFactor: 0.2,
      retryableErrors: ['timeout', 'network', '5xx', 'rate_limit'],
      backoffStrategy: 'exponential',
      enableMetrics: true,
      enableLogging: false,
      maxRetryDuration: 600000 // 10 minutes
    });
  }

  /**
   * Create retry handler for development
   */
  static createDevelopment(): RetryHandler {
    return this.create({
      maxRetries: 2,
      baseDelayMs: 500,
      maxDelayMs: 5000,
      jitterFactor: 0.1,
      retryableErrors: ['timeout', 'network'],
      backoffStrategy: 'exponential',
      enableMetrics: true,
      enableLogging: true,
      maxRetryDuration: 60000 // 1 minute
    });
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default RetryHandler;
