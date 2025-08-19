/**
 * @dct/mit-hero-core
 * MIT Hero Core Orchestrator
 *
 * This module provides the core orchestrator logic for the MIT Hero system,
 * including the 6 exported API functions for repository management.
 */
export interface OrchestratorConfig {
    maxConcurrent: number;
    maxQueueSize: number;
    timeoutMs: number;
    retryAttempts: number;
    enableMetrics: boolean;
}
export interface PreflightResult {
    success: boolean;
    issues: string[];
    recommendations: string[];
    timestamp: string;
}
export interface FixResult {
    success: boolean;
    appliedFixes: string[];
    failedFixes: string[];
    timestamp: string;
}
export interface RollbackResult {
    success: boolean;
    rolledBackChanges: string[];
    timestamp: string;
}
export interface ReportData {
    systemHealth: any;
    performanceMetrics: any;
    recentOperations: any[];
    recommendations: any[];
    timestamp: string;
}
export declare class CoreOrchestrator {
    private config;
    private concurrencyLimiter;
    private retryHelper;
    private healthMonitor;
    private workerManager;
    private commandSystem;
    constructor(config?: Partial<OrchestratorConfig>);
    /**
     * Preflight repository check - validates repository health and readiness
     */
    preflightRepo(): Promise<PreflightResult>;
    /**
     * Preflight CSV validation - checks CSV data integrity and format
     */
    preflightCsv(csvPath: string): Promise<PreflightResult>;
    /**
     * Prepublish CMS validation - ensures CMS content is ready for publication
     */
    prepublishCms(cmsPath: string): Promise<PreflightResult>;
    /**
     * Apply automated fixes to resolve detected issues
     */
    applyFixes(issues: string[]): Promise<FixResult>;
    /**
     * Rollback recent changes to restore system stability
     */
    rollback(): Promise<RollbackResult>;
    /**
     * Generate comprehensive system report
     */
    generateReport(): Promise<ReportData>;
    /**
     * Get orchestrator configuration
     */
    getConfig(): OrchestratorConfig;
    /**
     * Update orchestrator configuration
     */
    updateConfig(updates: Partial<OrchestratorConfig>): void;
    /**
     * Get system status
     */
    getStatus(): Promise<{
        config: OrchestratorConfig;
        health: import("./health").SystemHealth;
        workers: import("./workers").WorkerStatus;
        commands: import("./commands").CommandSystemStatus;
    }>;
}
//# sourceMappingURL=orchestrator.d.ts.map