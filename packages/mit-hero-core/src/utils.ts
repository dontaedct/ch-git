/**
 * @dct/mit-hero-core
 * MIT Hero Core Utilities
 * 
 * This module provides utility functions extracted from the main application,
 * including concurrency control, retry logic, validation helpers, and more.
 */

import { 
  ConcurrencyConfig, 
  QueuedOperation, 
  ConcurrencyMetrics,
  RetryConfig,
  RetryResult,
  ErrorCategory,
  RetryStrategy,
  CircuitBreakerState
} from './types';

// ============================================================================
// CONCURRENCY UTILITIES
// ============================================================================

/**
 * Create a default concurrency configuration
 */
export function createDefaultConcurrencyConfig(): ConcurrencyConfig {
  return {
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
    enableMetrics: true
  };
}

/**
 * Validate concurrency configuration
 */
export function validateConcurrencyConfig(config: Partial<ConcurrencyConfig>): ConcurrencyConfig {
  const defaults = createDefaultConcurrencyConfig();
  const merged = { ...defaults, ...config };
  
  if (merged.maxConcurrent < 1 || merged.maxConcurrent > 1000) {
    throw new Error('maxConcurrent must be between 1 and 1000');
  }
  
  if (merged.maxQueueSize < 1 || merged.maxQueueSize > 10000) {
    throw new Error('maxQueueSize must be between 1 and 10000');
  }
  
  if (merged.priorityLevels < 1 || merged.priorityLevels > 10) {
    throw new Error('priorityLevels must be between 1 and 10');
  }
  
  return merged;
}

/**
 * Create a queued operation
 */
export function createQueuedOperation(
  operation: () => Promise<any>,
  priority: number = 0,
  metadata: Record<string, any> = {}
): QueuedOperation {
  return {
    id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    priority,
    operation,
    metadata,
    timestamp: Date.now(),
    retryCount: 0
  };
}

/**
 * Sort operations by priority (highest first)
 */
export function sortOperationsByPriority(operations: QueuedOperation[]): QueuedOperation[] {
  return [...operations].sort((a, b) => b.priority - a.priority);
}

// ============================================================================
// RETRY UTILITIES
// ============================================================================

/**
 * Create a default retry configuration
 */
export function createDefaultRetryConfig(): RetryConfig {
  return {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 30000,
    jitterFactor: 0.1,
    strategy: RetryStrategy.EXPONENTIAL,
    circuitBreakerThreshold: 5,
    circuitBreakerTimeout: 30000
  };
}

/**
 * Calculate delay for retry attempt
 */
export function calculateRetryDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  jitterFactor: number = 0.1
): number {
  let delay: number;
  
  switch (attempt) {
    case 1:
      delay = baseDelay;
      break;
    case 2:
      delay = baseDelay * 2;
      break;
    default:
      delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
  }
  
  // Add jitter to prevent thundering herd
  const jitter = delay * jitterFactor * Math.random();
  return Math.min(delay + jitter, maxDelay);
}

/**
 * Classify error for retry decisions
 */
export function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  const name = error.name.toLowerCase();
  
  // Network errors
  if (message.includes('network') || message.includes('timeout') || name.includes('timeout')) {
    return ErrorCategory.NETWORK_ERROR;
  }
  
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return ErrorCategory.RATE_LIMIT_ERROR;
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('forbidden') || name.includes('auth')) {
    return ErrorCategory.AUTH_ERROR;
  }
  
  if (message.includes('permission') || message.includes('access denied')) {
    return ErrorCategory.PERMISSION_ERROR;
  }
  
  if (message.includes('token expired') || message.includes('jwt expired')) {
    return ErrorCategory.TOKEN_EXPIRED;
  }
  
  // Resource errors
  if (message.includes('unavailable') || message.includes('service unavailable')) {
    return ErrorCategory.SERVICE_UNAVAILABLE;
  }
  
  if (message.includes('quota exceeded') || message.includes('limit exceeded')) {
    return ErrorCategory.QUOTA_EXCEEDED;
  }
  
  // System errors
  if (message.includes('validation') || name.includes('validation')) {
    return ErrorCategory.VALIDATION_ERROR;
  }
  
  if (message.includes('configuration') || message.includes('config')) {
    return ErrorCategory.CONFIGURATION_ERROR;
  }
  
  return ErrorCategory.UNKNOWN;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: Error): boolean {
  const category = classifyError(error);
  
  return [
    ErrorCategory.NETWORK_ERROR,
    ErrorCategory.TIMEOUT_ERROR,
    ErrorCategory.RATE_LIMIT_ERROR,
    ErrorCategory.RESOURCE_UNAVAILABLE,
    ErrorCategory.SERVICE_UNAVAILABLE,
    ErrorCategory.QUOTA_EXCEEDED,
    ErrorCategory.UNKNOWN
  ].includes(category);
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Validate UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validate date string
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page: number, pageSize: number): boolean {
  return page >= 1 && pageSize >= 1 && pageSize <= 100;
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Convert string to title case
 */
export function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Convert string to kebab case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camel case
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
      index === 0 ? word.toLowerCase() : word.toUpperCase()
    )
    .replace(/\s+/g, '');
}

/**
 * Generate a random string
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array by key
 */
export function groupBy<T, K extends string | number>(
  array: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

/**
 * Sort array by multiple criteria
 */
export function sortByMultiple<T>(
  array: T[],
  ...criteria: Array<{ key: keyof T; direction: 'asc' | 'desc' }>
): T[] {
  return [...array].sort((a, b) => {
    for (const { key, direction } of criteria) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

/**
 * Pick specific keys from object
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Omit specific keys from object
 */
export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Check if object is empty
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Format date to ISO string
 */
export function formatDateISO(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Get start of week
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get end of week
 */
export function getEndOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return new Date(d.setDate(diff));
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

/**
 * Check if date is this week
 */
export function isThisWeek(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const startOfWeek = getStartOfWeek();
  const endOfWeek = getEndOfWeek();
  return d >= startOfWeek && d <= endOfWeek;
}

// ============================================================================
// MATH UTILITIES
// ============================================================================

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round number to specified decimal places
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Generate random number between min and max
 */
export function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer between min and max
 */
export function randomIntBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
