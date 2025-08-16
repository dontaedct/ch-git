/**
 * 🧪 RETRY HELPER TESTS - MIT Hero System
 * 
 * Comprehensive test suite for the retry helper system
 * Tests all retry strategies, error classification, and circuit breaker functionality
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 */

import { 
  RetryHelper, 
  ErrorCategory, 
  RetryStrategy, 
  CircuitBreakerState,
  retryWithBackoff,
  retryImmediate,
  defaultRetryHelper
} from '../lib/retry';

// Mock logger for testing
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

describe('RetryHelper', () => {
  let retryHelper: RetryHelper;
  
  beforeEach(() => {
    retryHelper = new RetryHelper({
      maxAttempts: 3,
      baseDelay: 100,
      maxDelay: 1000,
      jitterFactor: 0.1,
      strategy: RetryStrategy.EXPONENTIAL,
      circuitBreakerThreshold: 3,
      circuitBreakerTimeout: 1000
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('Error Classification', () => {
    test('should classify network errors as retryable', () => {
      const networkError = new Error('Network connection failed');
      const result = retryHelper['classifyError'](networkError);
      
      expect(result.category).toBe(ErrorCategory.NETWORK_ERROR);
      expect(result.retryable).toBe(true);
    });

    test('should classify authentication errors as non-retryable', () => {
      const authError = new Error('Unauthorized access');
      const result = retryHelper['classifyError'](authError);
      
      expect(result.category).toBe(ErrorCategory.AUTH_ERROR);
      expect(result.retryable).toBe(false);
    });

    test('should classify rate limit errors as retryable with backoff', () => {
      const rateLimitError = new Error('Rate limit exceeded');
      const result = retryHelper['classifyError'](rateLimitError);
      
      expect(result.category).toBe(ErrorCategory.RATE_LIMIT_ERROR);
      expect(result.retryable).toBe(true);
      expect(result.suggestedDelay).toBe(200); // 2x base delay
    });

    test('should classify system errors as non-retryable', () => {
      const systemError = new Error('System configuration error');
      const result = retryHelper['classifyError'](systemError);
      
      expect(result.category).toBe(ErrorCategory.SYSTEM_ERROR);
      expect(result.retryable).toBe(false);
    });

    test('should default unknown errors to retryable', () => {
      const unknownError = new Error('Some random error');
      const result = retryHelper['classifyError'](unknownError);
      
      expect(result.category).toBe(ErrorCategory.UNKNOWN);
      expect(result.retryable).toBe(true);
    });
  });

  describe('Delay Calculation', () => {
    test('should calculate exponential backoff correctly', () => {
      // Create helper without jitter for exact calculations
      const noJitterHelper = new RetryHelper({ jitterFactor: 0 });
      
      const delay1 = noJitterHelper['calculateDelay'](1, 100);
      const delay2 = noJitterHelper['calculateDelay'](2, 100);
      const delay3 = noJitterHelper['calculateDelay'](3, 100);
      
      expect(delay1).toBe(100); // 2^0 * 100
      expect(delay2).toBe(200); // 2^1 * 100
      expect(delay3).toBe(400); // 2^2 * 100
    });

    test('should apply jitter to delays', () => {
      const delay = retryHelper['calculateDelay'](2, 100);
      
      // With 10% jitter, delay should be between 180-220ms
      expect(delay).toBeGreaterThanOrEqual(180);
      expect(delay).toBeLessThanOrEqual(220);
    });

    test('should respect max delay limit', () => {
      const delay = retryHelper['calculateDelay'](10, 100);
      
      expect(delay).toBeLessThanOrEqual(1000); // maxDelay
    });

    test('should handle immediate strategy', () => {
      const immediateHelper = new RetryHelper({ strategy: RetryStrategy.IMMEDIATE });
      const delay = immediateHelper['calculateDelay'](2, 100);
      
      expect(delay).toBe(0);
    });

    test('should handle linear strategy', () => {
      const linearHelper = new RetryHelper({ 
        strategy: RetryStrategy.LINEAR,
        jitterFactor: 0 // No jitter for exact calculations
      });
      const delay1 = linearHelper['calculateDelay'](1, 100);
      const delay2 = linearHelper['calculateDelay'](2, 100);
      
      expect(delay1).toBe(100);
      expect(delay2).toBe(200);
    });
  });

  describe('Circuit Breaker', () => {
    test('should allow operations when circuit is closed', () => {
      const allowed = retryHelper['checkCircuitBreaker']('test-operation');
      expect(allowed).toBe(true);
    });

    test('should open circuit after threshold failures', () => {
      // Simulate 3 failures
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      
      const allowed = retryHelper['checkCircuitBreaker']('test-operation');
      expect(allowed).toBe(false);
    });

    test('should reset circuit after timeout', async () => {
      // Open circuit
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(resolve, 1100));
      
      const allowed = retryHelper['checkCircuitBreaker']('test-operation');
      expect(allowed).toBe(true);
    });

    test('should reset circuit on success', () => {
      // Open circuit
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper['updateCircuitBreaker']('test-operation', false);
      
      // Reset with success
      retryHelper['updateCircuitBreaker']('test-operation', true);
      
      const allowed = retryHelper['checkCircuitBreaker']('test-operation');
      expect(allowed).toBe(true);
    });
  });

  describe('Retry Logic', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should fail after max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Persistent error'));
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(3);
      expect(result.error).toBeDefined();
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should not retry non-retryable errors', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Unauthorized access'));
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(1);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should respect custom retry configuration', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await retryHelper.retry(operation, 'test-operation', {
        maxAttempts: 2,
        baseDelay: 50
      });
      
      expect(result.success).toBe(true);
      expect(result.attempts).toBe(2);
    });
  });

  describe('Statistics and Monitoring', () => {
    test('should track operation statistics', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      await retryHelper.retry(operation, 'test-operation');
      
      const stats = retryHelper.getStats('test-operation');
      expect(stats).toBeDefined();
      expect(stats!.success).toBe(1);
      expect(stats!.failure).toBe(1);
    });

    test('should provide circuit breaker status', () => {
      retryHelper['updateCircuitBreaker']('test-operation', false);
      
      const status = retryHelper.getCircuitBreakerStatus('test-operation');
      expect(status).toBeDefined();
      expect(status!.failureCount).toBe(1);
    });

    test('should reset circuit breakers', () => {
      retryHelper['updateCircuitBreaker']('test-operation', false);
      retryHelper.resetCircuitBreaker('test-operation');
      
      const status = retryHelper.getCircuitBreakerStatus('test-operation');
      expect(status!.state).toBe(CircuitBreakerState.CLOSED);
      expect(status!.failureCount).toBe(0);
    });
  });

  describe('Utility Functions', () => {
    test('retryWithBackoff should work correctly', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await retryWithBackoff(operation, 2, 100);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('retryImmediate should work correctly', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValue('success');
      
      const result = await retryImmediate(operation, 2);
      
      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('defaultRetryHelper should be available', () => {
      expect(defaultRetryHelper).toBeInstanceOf(RetryHelper);
    });
  });

  describe('Edge Cases', () => {
    test('should handle operations that return undefined', async () => {
      const operation = jest.fn().mockResolvedValue(undefined);
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
    });

    test('should handle operations that throw non-Error objects', async () => {
      const operation = jest.fn().mockRejectedValue('String error');
      
      const result = await retryHelper.retry(operation, 'test-operation');
      
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(Error);
    });

    test('should handle zero max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Network error'));
      
      const result = await retryHelper.retry(operation, 'test-operation', {
        maxAttempts: 0
      });
      
      expect(result.success).toBe(false);
      expect(result.attempts).toBe(0);
    });
  });
});
