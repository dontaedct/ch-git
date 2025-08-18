/**
 * @dct/mit-hero-core
 * MIT Hero Core Adapters
 *
 * This module provides adapter interfaces for external dependencies,
 * enabling dependency inversion, easier testing, and flexible implementations.
 */
export interface StorageAdapter {
    /**
     * Get a value from storage
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set a value in storage with optional TTL
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete a value from storage
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all values from storage
     */
    clear(): Promise<void>;
    /**
     * Check if a key exists in storage
     */
    has(key: string): Promise<boolean>;
    /**
     * Get all keys in storage
     */
    keys(): Promise<string[]>;
    /**
     * Get storage size/usage information
     */
    getStats(): Promise<StorageStats>;
}
export interface StorageStats {
    totalKeys: number;
    totalSize: number;
    maxSize?: number;
    usedSpace: number;
    availableSpace?: number;
}
export interface DatabaseAdapter {
    /**
     * Execute a query and return results
     */
    query<T>(sql: string, params?: any[]): Promise<T[]>;
    /**
     * Execute a command without returning results
     */
    execute(sql: string, params?: any[]): Promise<void>;
    /**
     * Execute multiple operations in a transaction
     */
    transaction<T>(fn: () => Promise<T>): Promise<T>;
    /**
     * Begin a transaction manually
     */
    beginTransaction(): Promise<Transaction>;
    /**
     * Check database connection health
     */
    healthCheck(): Promise<DatabaseHealth>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
    /**
     * Get database statistics
     */
    getStats(): Promise<DatabaseStats>;
}
export interface Transaction {
    commit(): Promise<void>;
    rollback(): Promise<void>;
    execute(sql: string, params?: any[]): Promise<void>;
    query<T>(sql: string, params?: any[]): Promise<T[]>;
}
export interface DatabaseHealth {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    lastCheck: Date;
    details?: Record<string, any>;
}
export interface DatabaseStats {
    totalConnections: number;
    activeConnections: number;
    idleConnections: number;
    queryCount: number;
    averageQueryTime: number;
    lastReset: Date;
}
export interface LoggerAdapter {
    /**
     * Log an error message
     */
    error(message: string, context?: LogContext, error?: Error): void;
    /**
     * Log a warning message
     */
    warn(message: string, context?: LogContext): void;
    /**
     * Log an info message
     */
    info(message: string, context?: LogContext): void;
    /**
     * Log a debug message
     */
    debug(message: string, context?: LogContext): void;
    /**
     * Log a trace message
     */
    trace(message: string, context?: LogContext): void;
    /**
     * Create a child logger with additional context
     */
    child(context: LogContext): LoggerAdapter;
    /**
     * Set the log level for this logger
     */
    setLevel(level: LogLevel): void;
    /**
     * Get the current log level
     */
    getLevel(): LogLevel;
    /**
     * Check if a level is enabled
     */
    isLevelEnabled(level: LogLevel): boolean;
}
export interface LogContext {
    [key: string]: any;
}
export declare enum LogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    DEBUG = "debug",
    TRACE = "trace"
}
export interface NetworkAdapter {
    /**
     * Make a GET request
     */
    get<T>(url: string, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Make a POST request
     */
    post<T>(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Make a PUT request
     */
    put<T>(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Make a DELETE request
     */
    delete<T>(url: string, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Make a PATCH request
     */
    patch<T>(url: string, data?: any, options?: RequestOptions): Promise<NetworkResponse<T>>;
    /**
     * Make a HEAD request
     */
    head(url: string, options?: RequestOptions): Promise<NetworkResponse<void>>;
    /**
     * Set default headers for all requests
     */
    setDefaultHeaders(headers: Record<string, string>): void;
    /**
     * Set default timeout for all requests
     */
    setDefaultTimeout(timeout: number): void;
    /**
     * Get network statistics
     */
    getStats(): Promise<NetworkStats>;
}
export interface RequestOptions {
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    signal?: AbortSignal;
}
export interface NetworkResponse<T> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    url: string;
    ok: boolean;
}
export interface NetworkStats {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastRequest: Date;
    lastReset: Date;
}
export interface CacheAdapter {
    /**
     * Get a value from cache
     */
    get<T>(key: string): Promise<T | null>;
    /**
     * Set a value in cache with TTL
     */
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    /**
     * Delete a value from cache
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all values from cache
     */
    clear(): Promise<void>;
    /**
     * Check if a key exists in cache
     */
    has(key: string): Promise<boolean>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<CacheStats>;
    /**
     * Set multiple values at once
     */
    mset<T>(entries: Array<{
        key: string;
        value: T;
        ttl?: number;
    }>): Promise<void>;
    /**
     * Get multiple values at once
     */
    mget<T>(keys: string[]): Promise<Array<T | null>>;
}
export interface CacheStats {
    totalKeys: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
    memoryUsage: number;
    lastReset: Date;
}
export interface EventBusAdapter {
    /**
     * Subscribe to an event
     */
    subscribe<T>(event: string, handler: EventHandler<T>): Subscription;
    /**
     * Publish an event
     */
    publish<T>(event: string, data: T): Promise<void>;
    /**
     * Unsubscribe from an event
     */
    unsubscribe(subscription: Subscription): void;
    /**
     * Get event bus statistics
     */
    getStats(): Promise<EventBusStats>;
}
export interface EventHandler<T> {
    (data: T, event: string): void | Promise<void>;
}
export interface Subscription {
    event: string;
    handler: EventHandler<any>;
    unsubscribe(): void;
}
export interface EventBusStats {
    totalEvents: number;
    totalSubscribers: number;
    eventsPublished: number;
    eventsHandled: number;
    lastReset: Date;
}
export interface MetricsAdapter {
    /**
     * Increment a counter
     */
    increment(name: string, value?: number, tags?: Record<string, string>): void;
    /**
     * Record a gauge value
     */
    gauge(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Record a histogram value
     */
    histogram(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Record a timing value
     */
    timing(name: string, value: number, tags?: Record<string, string>): void;
    /**
     * Get metrics statistics
     */
    getStats(): Promise<MetricsStats>;
    /**
     * Reset all metrics
     */
    reset(): void;
}
export interface MetricsStats {
    totalMetrics: number;
    counters: number;
    gauges: number;
    histograms: number;
    timings: number;
    lastReset: Date;
}
export interface AdapterFactory {
    createStorageAdapter(): StorageAdapter;
    createDatabaseAdapter(): DatabaseAdapter;
    createLoggerAdapter(): LoggerAdapter;
    createNetworkAdapter(): NetworkAdapter;
    createCacheAdapter(): CacheAdapter;
    createEventBusAdapter(): EventBusAdapter;
    createMetricsAdapter(): MetricsAdapter;
}
export interface AdapterRegistry {
    register<T extends keyof AdapterFactory>(type: T, factory: () => AdapterFactory[T]): void;
    get<T extends keyof AdapterFactory>(type: T): AdapterFactory[T];
    has(type: keyof AdapterFactory): boolean;
    list(): Array<keyof AdapterFactory>;
    clear(): void;
}
//# sourceMappingURL=adapters.d.ts.map