/**
 * @dct/mit-hero-core
 * MIT Hero Core Worker Management
 *
 * This module provides worker management functionality for the MIT Hero system,
 * including CSV validation, CMS validation, and task execution.
 */
export interface WorkerConfig {
    maxWorkers: number;
    taskTimeout: number;
    retryAttempts: number;
    enableLogging: boolean;
}
export interface CsvValidationResult {
    isValid: boolean;
    rowCount: number;
    columnCount: number;
    headers: string[];
    missingHeaders: string[];
    errors: string[];
    warnings: string[];
}
export interface CmsValidationResult {
    isValid: boolean;
    contentCount: number;
    assetCount: number;
    missingAssets: string[];
    invalidLinks: string[];
    errors: string[];
    warnings: string[];
}
export interface WorkerStatus {
    activeWorkers: number;
    queuedTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageTaskTime: number;
}
export interface TaskResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    executionTime: number;
    timestamp: string;
}
export declare class WorkerManager {
    private config;
    private concurrencyLimiter;
    private retryHelper;
    private activeWorkers;
    private taskQueue;
    private taskHistory;
    constructor(config?: Partial<WorkerConfig>);
    /**
     * Validate CSV data for integrity and format
     */
    validateCsvData(csvPath: string): Promise<CsvValidationResult>;
    private performCsvValidation;
    /**
     * Validate CMS content for publication readiness
     */
    validateCmsContent(cmsPath: string): Promise<CmsValidationResult>;
    private performCmsValidation;
    /**
     * Execute a task with worker management
     */
    executeTask<T>(task: () => Promise<T>, priority?: number): Promise<TaskResult<T>>;
    /**
     * Queue a task for later execution
     */
    queueTask(task: () => Promise<any>, priority?: number): string;
    /**
     * Process queued tasks
     */
    processQueuedTasks(): Promise<void>;
    /**
     * Record task completion for metrics
     */
    private recordTaskCompletion;
    /**
     * Get worker status and metrics
     */
    getStatus(): Promise<WorkerStatus>;
    /**
     * Get worker configuration
     */
    getConfig(): WorkerConfig;
    /**
     * Update worker configuration
     */
    updateConfig(updates: Partial<WorkerConfig>): void;
    /**
     * Clear task history
     */
    clearHistory(): void;
    /**
     * Get task history
     */
    getTaskHistory(): Array<{
        id: string;
        success: boolean;
        executionTime: number;
        timestamp: string;
    }>;
}
//# sourceMappingURL=workers.d.ts.map