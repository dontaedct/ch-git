/**
 * Client-Safe n8n Reliability Controls
 * 
 * Provides client-safe reliability utilities without server dependencies
 * - Exponential backoff with jitter
 * - Basic retry logic
 * - No database or server-only operations
 */

// Types and Interfaces
export interface BackoffConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  jitterFactor: number;
}

// Default configurations
export const DEFAULT_CONFIGS = {
  BACKOFF: {
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    maxRetries: 3,
    jitterFactor: 0.1
  } as BackoffConfig
};

/**
 * Calculate exponential backoff delay with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: BackoffConfig = DEFAULT_CONFIGS.BACKOFF
): number {
  const baseDelay = config.baseDelayMs;
  const maxDelay = config.maxDelayMs;
  const jitterFactor = config.jitterFactor;
  
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Apply jitter to avoid thundering herd
  const jitter = exponentialDelay * jitterFactor * Math.random();
  
  // Cap at max delay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Execute operation with exponential backoff retry
 * Client-safe version without database operations
 */
export async function withBackoff<T>(
  operation: () => Promise<T>,
  config: BackoffConfig = DEFAULT_CONFIGS.BACKOFF,
  _tenantId?: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === config.maxRetries) {
        break;
      }
      
      const delay = calculateBackoffDelay(attempt, config);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Simple retry wrapper for client-side operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  return withBackoff(operation, {
    baseDelayMs,
    maxDelayMs: baseDelayMs * 10,
    maxRetries,
    jitterFactor: 0.1
  });
}
