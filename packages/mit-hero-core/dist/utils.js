"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Utilities
 *
 * This module provides utility functions extracted from the main application,
 * including concurrency control, retry logic, validation helpers, and more.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultConcurrencyConfig = createDefaultConcurrencyConfig;
exports.validateConcurrencyConfig = validateConcurrencyConfig;
exports.createQueuedOperation = createQueuedOperation;
exports.sortOperationsByPriority = sortOperationsByPriority;
exports.createDefaultRetryConfig = createDefaultRetryConfig;
exports.calculateRetryDelay = calculateRetryDelay;
exports.classifyError = classifyError;
exports.isRetryableError = isRetryableError;
exports.isValidEmail = isValidEmail;
exports.isValidPhone = isValidPhone;
exports.isValidUUID = isValidUUID;
exports.isValidDate = isValidDate;
exports.validatePaginationParams = validatePaginationParams;
exports.toTitleCase = toTitleCase;
exports.toKebabCase = toKebabCase;
exports.toCamelCase = toCamelCase;
exports.generateRandomString = generateRandomString;
exports.chunkArray = chunkArray;
exports.removeDuplicates = removeDuplicates;
exports.groupBy = groupBy;
exports.sortByMultiple = sortByMultiple;
exports.deepClone = deepClone;
exports.pick = pick;
exports.omit = omit;
exports.isEmpty = isEmpty;
exports.formatDateISO = formatDateISO;
exports.getStartOfWeek = getStartOfWeek;
exports.getEndOfWeek = getEndOfWeek;
exports.isToday = isToday;
exports.isThisWeek = isThisWeek;
exports.clamp = clamp;
exports.round = round;
exports.calculatePercentage = calculatePercentage;
exports.randomBetween = randomBetween;
exports.randomIntBetween = randomIntBetween;
const types_1 = require("./types");
// ============================================================================
// CONCURRENCY UTILITIES
// ============================================================================
/**
 * Create a default concurrency configuration
 */
function createDefaultConcurrencyConfig() {
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
function validateConcurrencyConfig(config) {
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
function createQueuedOperation(operation, priority = 0, metadata = {}) {
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
function sortOperationsByPriority(operations) {
    return [...operations].sort((a, b) => b.priority - a.priority);
}
// ============================================================================
// RETRY UTILITIES
// ============================================================================
/**
 * Create a default retry configuration
 */
function createDefaultRetryConfig() {
    return {
        maxAttempts: 3,
        baseDelay: 1000,
        maxDelay: 30000,
        jitterFactor: 0.1,
        strategy: types_1.RetryStrategy.EXPONENTIAL,
        circuitBreakerThreshold: 5,
        circuitBreakerTimeout: 30000
    };
}
/**
 * Calculate delay for retry attempt
 */
function calculateRetryDelay(attempt, baseDelay, maxDelay, jitterFactor = 0.1) {
    let delay;
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
function classifyError(error) {
    const message = error.message.toLowerCase();
    const name = error.name.toLowerCase();
    // Network errors
    if (message.includes('network') || message.includes('timeout') || name.includes('timeout')) {
        return types_1.ErrorCategory.NETWORK_ERROR;
    }
    if (message.includes('rate limit') || message.includes('too many requests')) {
        return types_1.ErrorCategory.RATE_LIMIT_ERROR;
    }
    // Authentication errors
    if (message.includes('unauthorized') || message.includes('forbidden') || name.includes('auth')) {
        return types_1.ErrorCategory.AUTH_ERROR;
    }
    if (message.includes('permission') || message.includes('access denied')) {
        return types_1.ErrorCategory.PERMISSION_ERROR;
    }
    if (message.includes('token expired') || message.includes('jwt expired')) {
        return types_1.ErrorCategory.TOKEN_EXPIRED;
    }
    // Resource errors
    if (message.includes('unavailable') || message.includes('service unavailable')) {
        return types_1.ErrorCategory.SERVICE_UNAVAILABLE;
    }
    if (message.includes('quota exceeded') || message.includes('limit exceeded')) {
        return types_1.ErrorCategory.QUOTA_EXCEEDED;
    }
    // System errors
    if (message.includes('validation') || name.includes('validation')) {
        return types_1.ErrorCategory.VALIDATION_ERROR;
    }
    if (message.includes('configuration') || message.includes('config')) {
        return types_1.ErrorCategory.CONFIGURATION_ERROR;
    }
    return types_1.ErrorCategory.UNKNOWN;
}
/**
 * Check if error is retryable
 */
function isRetryableError(error) {
    const category = classifyError(error);
    return [
        types_1.ErrorCategory.NETWORK_ERROR,
        types_1.ErrorCategory.TIMEOUT_ERROR,
        types_1.ErrorCategory.RATE_LIMIT_ERROR,
        types_1.ErrorCategory.RESOURCE_UNAVAILABLE,
        types_1.ErrorCategory.SERVICE_UNAVAILABLE,
        types_1.ErrorCategory.QUOTA_EXCEEDED,
        types_1.ErrorCategory.UNKNOWN
    ].includes(category);
}
// ============================================================================
// VALIDATION UTILITIES
// ============================================================================
/**
 * Validate email address
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate phone number (basic validation)
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
/**
 * Validate UUID
 */
function isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
}
/**
 * Validate date string
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
}
/**
 * Validate pagination parameters
 */
function validatePaginationParams(page, pageSize) {
    return page >= 1 && pageSize >= 1 && pageSize <= 100;
}
// ============================================================================
// STRING UTILITIES
// ============================================================================
/**
 * Convert string to title case
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}
/**
 * Convert string to kebab case
 */
function toKebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}
/**
 * Convert string to camel case
 */
function toCamelCase(str) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
        .replace(/\s+/g, '');
}
/**
 * Generate a random string
 */
function generateRandomString(length = 8) {
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
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}
/**
 * Remove duplicates from array
 */
function removeDuplicates(array) {
    return [...new Set(array)];
}
/**
 * Group array by key
 */
function groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
        const key = keyFn(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}
/**
 * Sort array by multiple criteria
 */
function sortByMultiple(array, ...criteria) {
    return [...array].sort((a, b) => {
        for (const { key, direction } of criteria) {
            const aVal = a[key];
            const bVal = b[key];
            if (aVal < bVal)
                return direction === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return direction === 'asc' ? 1 : -1;
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
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    if (obj instanceof Array) {
        return obj.map(item => deepClone(item));
    }
    if (typeof obj === 'object') {
        const cloned = {};
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
function pick(obj, keys) {
    const result = {};
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
function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
/**
 * Check if object is empty
 */
function isEmpty(obj) {
    if (obj == null)
        return true;
    if (Array.isArray(obj) || typeof obj === 'string')
        return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set)
        return obj.size === 0;
    if (typeof obj === 'object')
        return Object.keys(obj).length === 0;
    return false;
}
// ============================================================================
// DATE UTILITIES
// ============================================================================
/**
 * Format date to ISO string
 */
function formatDateISO(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString();
}
/**
 * Get start of week
 */
function getStartOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
}
/**
 * Get end of week
 */
function getEndOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? 0 : 7);
    return new Date(d.setDate(diff));
}
/**
 * Check if date is today
 */
function isToday(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return d.toDateString() === today.toDateString();
}
/**
 * Check if date is this week
 */
function isThisWeek(date) {
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
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
/**
 * Round number to specified decimal places
 */
function round(value, decimals = 0) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
/**
 * Calculate percentage
 */
function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return (value / total) * 100;
}
/**
 * Generate random number between min and max
 */
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
/**
 * Generate random integer between min and max
 */
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//# sourceMappingURL=utils.js.map