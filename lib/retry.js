/**
 * 🔄 RETRY HELPER - MIT Hero System (JavaScript Version)
 * 
 * Comprehensive retry system with exponential backoff, jitter, and circuit breaker
 * Prevents silent failures and improves system reliability across all operations
 * 
 * Features:
 * - Exponential backoff with configurable base delay
 * - Jitter to prevent thundering herd problems
 * - Maximum retry attempts (configurable)
 * - Circuit breaker pattern for repeated failures
 * - Detailed logging of retry attempts
 * - Different retry strategies (immediate, exponential, custom)
 * - Error taxonomy for intelligent retry decisions
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 */

// Error Taxonomy - Intelligent categorization for retry decisions
const ErrorCategory = {
  // Network errors - retryable with exponential backoff
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  
  // Authentication errors - not retryable
  AUTH_ERROR: 'AUTH_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Resource errors - retryable with backoff
  RESOURCE_UNAVAILABLE: 'RESOURCE_UNAVAILABLE',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // System errors - not retryable
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Unknown - default to retryable
  UNKNOWN: 'UNKNOWN'
};

// Retry Strategy Types
const RetryStrategy = {
  IMMEDIATE: 'IMMEDIATE',           // Retry immediately
  LINEAR: 'LINEAR',                 // Linear backoff
  EXPONENTIAL: 'EXPONENTIAL',      // Exponential backoff (default)
  CUSTOM: 'CUSTOM'                 // Custom backoff function
};

// Circuit Breaker States
const CircuitBreakerState = {
  CLOSED: 'CLOSED',     // Normal operation
  OPEN: 'OPEN',         // Circuit open, no requests
  HALF_OPEN: 'HALF_OPEN' // Testing if service recovered
};

/**
 * Main Retry Helper Class
 * Provides comprehensive retry functionality with intelligent error handling
 */
class RetryHelper {
  constructor(config = {}) {
    this.config = {
      maxAttempts: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      jitterFactor: 0.1, // 10% jitter
      strategy: RetryStrategy.EXPONENTIAL,
      circuitBreakerThreshold: 5,
      circuitBreakerTimeout: 60000, // 1 minute
      ...config
    };
    
    this.circuitBreakers = new Map();
    this.operationStats = new Map();
  }

  /**
   * Classify error for intelligent retry decisions
   */
  classifyError(error) {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name.toLowerCase();

    // Network errors - retryable
    if (errorMessage.includes('network') || errorMessage.includes('connection') || 
        errorMessage.includes('timeout') || errorMessage.includes('econnreset') ||
        errorMessage.includes('enotfound') || errorMessage.includes('econnrefused')) {
      return {
        category: ErrorCategory.NETWORK_ERROR,
        retryable: true,
        suggestedDelay: this.config.baseDelay,
        maxRetries: this.config.maxAttempts
      };
    }

    // Rate limiting - retryable with backoff
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests') ||
        errorMessage.includes('429') || errorMessage.includes('quota')) {
      return {
        category: ErrorCategory.RATE_LIMIT_ERROR,
        retryable: true,
        suggestedDelay: this.config.baseDelay * 2,
        maxRetries: this.config.maxAttempts
      };
    }

    // Authentication errors - not retryable
    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden') ||
        errorMessage.includes('401') || errorMessage.includes('403') ||
        errorMessage.includes('token') || errorMessage.includes('auth')) {
      return {
        category: ErrorCategory.AUTH_ERROR,
        retryable: false,
        suggestedDelay: 0,
        maxRetries: 0
      };
    }

    // Resource errors - retryable with backoff
    if (errorMessage.includes('unavailable') || errorMessage.includes('service') ||
        errorMessage.includes('resource') || errorMessage.includes('503')) {
      return {
        category: ErrorCategory.SERVICE_UNAVAILABLE,
        retryable: true,
        suggestedDelay: this.config.baseDelay * 1.5,
        maxRetries: this.config.maxAttempts
      };
    }

    // System errors - not retryable
    if (errorMessage.includes('system') || errorMessage.includes('configuration') ||
        errorMessage.includes('validation') || errorMessage.includes('syntax')) {
      return {
        category: ErrorCategory.SYSTEM_ERROR,
        retryable: false,
        suggestedDelay: 0,
        maxRetries: 0
      };
    }

    // Default to retryable for unknown errors
    return {
      category: ErrorCategory.UNKNOWN,
      retryable: true,
      suggestedDelay: this.config.baseDelay,
      maxRetries: this.config.maxAttempts
    };
  }

  /**
   * Calculate delay with exponential backoff and jitter
   */
  calculateDelay(attempt, baseDelay) {
    let delay;

    switch (this.config.strategy) {
      case RetryStrategy.IMMEDIATE:
        delay = 0;
        break;
      
      case RetryStrategy.LINEAR:
        delay = baseDelay * attempt;
        break;
      
      case RetryStrategy.EXPONENTIAL:
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
      
      case RetryStrategy.CUSTOM:
        delay = this.config.customBackoff ? this.config.customBackoff(attempt, baseDelay) : baseDelay;
        break;
      
      default:
        delay = baseDelay * Math.pow(2, attempt - 1);
    }

    // Apply jitter to prevent thundering herd
    const jitter = delay * this.config.jitterFactor * (Math.random() - 0.5);
    delay = Math.min(delay + jitter, this.config.maxDelay);

    return Math.max(0, delay);
  }

  /**
   * Check circuit breaker state
   */
  checkCircuitBreaker(operationKey) {
    const breaker = this.circuitBreakers.get(operationKey);
    if (!breaker) return true; // No breaker, allow operation

    const now = Date.now();

    switch (breaker.state) {
      case CircuitBreakerState.CLOSED:
        return true; // Normal operation

      case CircuitBreakerState.OPEN:
        if (now >= breaker.nextAttemptTime) {
          breaker.state = CircuitBreakerState.HALF_OPEN;
          console.log(`🔄 Circuit breaker half-open for ${operationKey}`);
          return true;
        }
        return false; // Circuit open

      case CircuitBreakerState.HALF_OPEN:
        return true; // Allow one attempt to test recovery
    }

    return false;
  }

  /**
   * Update circuit breaker state
   */
  updateCircuitBreaker(operationKey, success) {
    let breaker = this.circuitBreakers.get(operationKey);
    if (!breaker) {
      breaker = {
        state: CircuitBreakerState.CLOSED,
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      };
      this.circuitBreakers.set(operationKey, breaker);
    }

    if (success) {
      // Success - reset circuit breaker
      breaker.state = CircuitBreakerState.CLOSED;
      breaker.failureCount = 0;
      console.log(`✅ Circuit breaker reset for ${operationKey}`);
    } else {
      // Failure - increment counter
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();

      if (breaker.failureCount >= this.config.circuitBreakerThreshold) {
        breaker.state = CircuitBreakerState.OPEN;
        breaker.nextAttemptTime = Date.now() + this.config.circuitBreakerTimeout;
        console.warn(`🚨 Circuit breaker opened for ${operationKey} after ${breaker.failureCount} failures`);
      }
    }
  }

  /**
   * Update operation statistics
   */
  updateStats(operationKey, success, duration) {
    let stats = this.operationStats.get(operationKey);
    if (!stats) {
      stats = { success: 0, failure: 0, totalTime: 0 };
      this.operationStats.set(operationKey, stats);
    }

    if (success) {
      stats.success++;
    } else {
      stats.failure++;
    }
    stats.totalTime += duration;
  }

  /**
   * Main retry method with intelligent error handling
   */
  async retry(operation, operationKey = 'unknown', customConfig = {}) {
    const startTime = Date.now();
    const config = { ...this.config, ...customConfig };
    let lastError;
    let attempts = 0;

    // Check circuit breaker first
    if (!this.checkCircuitBreaker(operationKey)) {
      const breaker = this.circuitBreakers.get(operationKey);
      const waitTime = breaker ? Math.max(0, breaker.nextAttemptTime - Date.now()) : 0;
      
      console.warn(`🚨 Circuit breaker blocked operation ${operationKey}, waiting ${waitTime}ms`);
      
      return {
        success: false,
        error: new Error(`Circuit breaker open for ${operationKey}`),
        attempts: 0,
        totalTime: Date.now() - startTime,
        lastError: new Error(`Circuit breaker open for ${operationKey}`)
      };
    }

    while (attempts < config.maxAttempts) {
      attempts++;
      
      try {
        console.log(`🔄 Attempt ${attempts}/${config.maxAttempts} for operation: ${operationKey}`);
        
        const result = await operation();
        const duration = Date.now() - startTime;
        
        // Success - update circuit breaker and stats
        this.updateCircuitBreaker(operationKey, true);
        this.updateStats(operationKey, true, duration);
        
        console.log(`✅ Operation ${operationKey} succeeded on attempt ${attempts} in ${duration}ms`);
        
        return {
          success: true,
          data: result,
          attempts,
          totalTime: duration
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        const duration = Date.now() - startTime;
        
        // Classify error for intelligent retry decisions
        const errorInfo = this.classifyError(lastError);
        
        console.warn(`❌ Attempt ${attempts}/${config.maxAttempts} failed for ${operationKey}: ${lastError.message} (${errorInfo.category})`);
        
        // Check if error is retryable
        if (!errorInfo.retryable) {
          console.error(`🚫 Non-retryable error for ${operationKey}: ${errorInfo.category}`);
          this.updateCircuitBreaker(operationKey, false);
          this.updateStats(operationKey, false, duration);
          
          return {
            success: false,
            error: lastError,
            attempts,
            totalTime: duration,
            lastError
          };
        }
        
        // Update circuit breaker and stats
        this.updateCircuitBreaker(operationKey, false);
        this.updateStats(operationKey, false, duration);
        
        // Check if we should retry
        if (attempts >= config.maxAttempts) {
          console.error(`🚫 Max retry attempts reached for ${operationKey}: ${attempts}/${config.maxAttempts}`);
          break;
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateDelay(attempts, errorInfo.suggestedDelay || config.baseDelay);
        
        if (delay > 0) {
          console.log(`⏳ Waiting ${delay}ms before retry ${attempts + 1} for ${operationKey}`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    const totalDuration = Date.now() - startTime;
    console.error(`💥 Operation ${operationKey} failed after ${attempts} attempts in ${totalDuration}ms`);
    
    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: totalDuration,
      lastError
    };
  }

  /**
   * Get operation statistics
   */
  getStats(operationKey) {
    if (operationKey) {
      return this.operationStats.get(operationKey);
    }
    return Object.fromEntries(this.operationStats);
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(operationKey) {
    if (operationKey) {
      return this.circuitBreakers.get(operationKey);
    }
    return Object.fromEntries(this.circuitBreakers);
  }

  /**
   * Reset circuit breaker for an operation
   */
  resetCircuitBreaker(operationKey) {
    const breaker = this.circuitBreakers.get(operationKey);
    if (breaker) {
      breaker.state = CircuitBreakerState.CLOSED;
      breaker.failureCount = 0;
      console.log(`🔄 Circuit breaker reset for ${operationKey}`);
    }
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers() {
    this.circuitBreakers.clear();
    console.log('🔄 All circuit breakers reset');
  }

  /**
   * Clear operation statistics
   */
  clearStats(operationKey) {
    if (operationKey) {
      this.operationStats.delete(operationKey);
    } else {
      this.operationStats.clear();
    }
  }
}

// Default retry helper instance
const defaultRetryHelper = new RetryHelper();

// Utility functions for common retry patterns
const retryWithBackoff = async (operation, maxAttempts = 3, baseDelay = 1000) => {
  const result = await defaultRetryHelper.retry(operation, 'retry-with-backoff', {
    maxAttempts,
    baseDelay,
    strategy: RetryStrategy.EXPONENTIAL
  });
  
  if (!result.success) {
    throw result.error || new Error('Operation failed after retries');
  }
  return result.data;
};

const retryImmediate = async (operation, maxAttempts = 3) => {
  const result = await defaultRetryHelper.retry(operation, 'retry-immediate', {
    maxAttempts,
    baseDelay: 0,
    strategy: RetryStrategy.IMMEDIATE
  });
  
  if (!result.success) {
    throw result.error || new Error('Operation failed after retries');
  }
  return result.data;
};

// Export for CommonJS
module.exports = {
  RetryHelper,
  ErrorCategory,
  RetryStrategy,
  CircuitBreakerState,
  defaultRetryHelper,
  retryWithBackoff,
  retryImmediate
};
