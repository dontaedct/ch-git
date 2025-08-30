/**
 * Structured Logging for Guardian Operations
 * 
 * Provides structured logging with operation context, tenant ID,
 * results, and duration tracking for Guardian operations.
 */

interface GuardianLogEntry {
  timestamp: string;
  op: string;
  tenantId: string;
  result: 'success' | 'failure' | 'rate_limited' | 'feature_disabled';
  durationMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

/**
 * Guardian operation logger
 */
export class GuardianLogger {
  private startTime: number;
  private operation: string;
  private tenantId: string;
  
  constructor(operation: string, tenantId: string) {
    this.operation = operation;
    this.tenantId = tenantId;
    this.startTime = Date.now();
  }
  
  /**
   * Log successful operation
   */
  success(details?: Record<string, unknown>): void {
    const durationMs = Date.now() - this.startTime;
    const entry: GuardianLogEntry = {
      timestamp: new Date().toISOString(),
      op: this.operation,
      tenantId: this.tenantId,
      result: 'success',
      durationMs,
      details,
    };
    
    this.logEntry(entry);
  }
  
  /**
   * Log failed operation
   */
  failure(error: string, details?: Record<string, unknown>): void {
    const durationMs = Date.now() - this.startTime;
    const entry: GuardianLogEntry = {
      timestamp: new Date().toISOString(),
      op: this.operation,
      tenantId: this.tenantId,
      result: 'failure',
      durationMs,
      error,
      details,
    };
    
    this.logEntry(entry);
  }
  
  /**
   * Log rate limited operation
   */
  rateLimited(retryAfter?: number, details?: Record<string, unknown>): void {
    const durationMs = Date.now() - this.startTime;
    const entry: GuardianLogEntry = {
      timestamp: new Date().toISOString(),
      op: this.operation,
      tenantId: this.tenantId,
      result: 'rate_limited',
      durationMs,
      details: {
        ...details,
        retryAfter,
      },
    };
    
    this.logEntry(entry);
  }
  
  /**
   * Log feature disabled operation
   */
  featureDisabled(flagKey: string, details?: Record<string, unknown>): void {
    const durationMs = Date.now() - this.startTime;
    const entry: GuardianLogEntry = {
      timestamp: new Date().toISOString(),
      op: this.operation,
      tenantId: this.tenantId,
      result: 'feature_disabled',
      durationMs,
      details: {
        ...details,
        flagKey,
      },
    };
    
    this.logEntry(entry);
  }
  
  /**
   * Internal method to output structured log entry
   */
  private logEntry(entry: GuardianLogEntry): void {
    // Use console.warn for structured logging (as per existing logger pattern)
    console.warn('[GUARDIAN]', JSON.stringify(entry));
    
    // Also log to console.error for failures to ensure visibility
    if (entry.result === 'failure') {
      console.error(`[GUARDIAN FAILURE] ${entry.op} for tenant ${entry.tenantId}: ${entry.error}`);
    }
  }
}

/**
 * Create a Guardian logger instance
 */
export function createGuardianLogger(operation: string, tenantId: string): GuardianLogger {
  return new GuardianLogger(operation, tenantId);
}

/**
 * Log Guardian operation with automatic timing
 */
export async function logGuardianOperation<T>(
  operation: string,
  tenantId: string,
  fn: () => Promise<T>,
  options: {
    onSuccess?: (result: T, durationMs: number) => void;
    onFailure?: (error: string, durationMs: number) => void;
  } = {}
): Promise<T> {
  const logger = createGuardianLogger(operation, tenantId);
  
  try {
    const result = await fn();
    logger.success();
    
    if (options.onSuccess) {
      const durationMs = Date.now() - logger['startTime'];
      options.onSuccess(result, durationMs);
    }
    
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.failure(errorMessage);
    
    if (options.onFailure) {
      const durationMs = Date.now() - logger['startTime'];
      options.onFailure(errorMessage, durationMs);
    }
    
    throw error;
  }
}
