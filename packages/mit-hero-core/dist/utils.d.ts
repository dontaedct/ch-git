/**
 * @dct/mit-hero-core
 * MIT Hero Core Utilities
 *
 * This module provides utility functions extracted from the main application,
 * including concurrency control, retry logic, validation helpers, and more.
 */
import { ConcurrencyConfig, QueuedOperation, RetryConfig, ErrorCategory } from './types';
/**
 * Create a default concurrency configuration
 */
export declare function createDefaultConcurrencyConfig(): ConcurrencyConfig;
/**
 * Validate concurrency configuration
 */
export declare function validateConcurrencyConfig(config: Partial<ConcurrencyConfig>): ConcurrencyConfig;
/**
 * Create a queued operation
 */
export declare function createQueuedOperation(operation: () => Promise<any>, priority?: number, metadata?: Record<string, any>): QueuedOperation;
/**
 * Sort operations by priority (highest first)
 */
export declare function sortOperationsByPriority(operations: QueuedOperation[]): QueuedOperation[];
/**
 * Create a default retry configuration
 */
export declare function createDefaultRetryConfig(): RetryConfig;
/**
 * Calculate delay for retry attempt
 */
export declare function calculateRetryDelay(attempt: number, baseDelay: number, maxDelay: number, jitterFactor?: number): number;
/**
 * Classify error for retry decisions
 */
export declare function classifyError(error: Error): ErrorCategory;
/**
 * Check if error is retryable
 */
export declare function isRetryableError(error: Error): boolean;
/**
 * Validate email address
 */
export declare function isValidEmail(email: string): boolean;
/**
 * Validate phone number (basic validation)
 */
export declare function isValidPhone(phone: string): boolean;
/**
 * Validate UUID
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * Validate date string
 */
export declare function isValidDate(dateString: string): boolean;
/**
 * Validate pagination parameters
 */
export declare function validatePaginationParams(page: number, pageSize: number): boolean;
/**
 * Convert string to title case
 */
export declare function toTitleCase(str: string): string;
/**
 * Convert string to kebab case
 */
export declare function toKebabCase(str: string): string;
/**
 * Convert string to camel case
 */
export declare function toCamelCase(str: string): string;
/**
 * Generate a random string
 */
export declare function generateRandomString(length?: number): string;
/**
 * Chunk array into smaller arrays
 */
export declare function chunkArray<T>(array: T[], chunkSize: number): T[][];
/**
 * Remove duplicates from array
 */
export declare function removeDuplicates<T>(array: T[]): T[];
/**
 * Group array by key
 */
export declare function groupBy<T, K extends string | number>(array: T[], keyFn: (item: T) => K): Record<K, T[]>;
/**
 * Sort array by multiple criteria
 */
export declare function sortByMultiple<T>(array: T[], ...criteria: Array<{
    key: keyof T;
    direction: 'asc' | 'desc';
}>): T[];
/**
 * Deep clone object
 */
export declare function deepClone<T>(obj: T): T;
/**
 * Pick specific keys from object
 */
export declare function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
/**
 * Omit specific keys from object
 */
export declare function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
/**
 * Check if object is empty
 */
export declare function isEmpty(obj: any): boolean;
/**
 * Format date to ISO string
 */
export declare function formatDateISO(date: Date | string): string;
/**
 * Get start of week
 */
export declare function getStartOfWeek(date?: Date): Date;
/**
 * Get end of week
 */
export declare function getEndOfWeek(date?: Date): Date;
/**
 * Check if date is today
 */
export declare function isToday(date: Date | string): boolean;
/**
 * Check if date is this week
 */
export declare function isThisWeek(date: Date | string): boolean;
/**
 * Clamp number between min and max
 */
export declare function clamp(value: number, min: number, max: number): number;
/**
 * Round number to specified decimal places
 */
export declare function round(value: number, decimals?: number): number;
/**
 * Calculate percentage
 */
export declare function calculatePercentage(value: number, total: number): number;
/**
 * Generate random number between min and max
 */
export declare function randomBetween(min: number, max: number): number;
/**
 * Generate random integer between min and max
 */
export declare function randomIntBetween(min: number, max: number): number;
//# sourceMappingURL=utils.d.ts.map