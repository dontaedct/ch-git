/**
 * @dct/mit-hero-core
 * MIT Hero Core Module Index
 *
 * This module exports all core functionality including the 6 main API functions
 * for orchestrator and worker management.
 */
export { CoreOrchestrator, type OrchestratorConfig, type PreflightResult, type FixResult, type RollbackResult, type ReportData } from './orchestrator';
export { WorkerManager, type WorkerConfig, type CsvValidationResult, type CmsValidationResult, type WorkerStatus, type TaskResult } from './workers';
export { CommandSystem, type CommandConfig, type RepositoryStatus, type AutoFixResult, type CommandOperation, type CommandSystemStatus } from './commands';
export { HealthMonitor, type HealthConfig, type SystemHealth, type CpuMetrics, type MemoryMetrics, type DiskMetrics, type NetworkMetrics, type PerformanceMetrics, type HealthRecommendation } from './health';
import { CoreOrchestrator } from './orchestrator';
declare const defaultOrchestrator: CoreOrchestrator;
/**
 * Preflight repository check - validates repository health and readiness
 */
export declare const preflightRepo: () => Promise<import("./orchestrator").PreflightResult>;
/**
 * Preflight CSV validation - checks CSV data integrity and format
 */
export declare const preflightCsv: (csvPath: string) => Promise<import("./orchestrator").PreflightResult>;
/**
 * Prepublish CMS validation - ensures CMS content is ready for publication
 */
export declare const prepublishCms: (cmsPath: string) => Promise<import("./orchestrator").PreflightResult>;
/**
 * Apply automated fixes to resolve detected issues
 */
export declare const applyFixes: (issues: string[]) => Promise<import("./orchestrator").FixResult>;
/**
 * Rollback recent changes to restore system stability
 */
export declare const rollback: () => Promise<import("./orchestrator").RollbackResult>;
/**
 * Generate comprehensive system report
 */
export declare const generateReport: () => Promise<import("./orchestrator").ReportData>;
/**
 * Export the default orchestrator instance for advanced usage
 */
export { defaultOrchestrator as orchestrator };
/**
 * Get orchestrator status
 */
export declare const getOrchestratorStatus: () => Promise<{
    config: import("./orchestrator").OrchestratorConfig;
    health: import("./health").SystemHealth;
    workers: import("./workers").WorkerStatus;
    commands: import("./commands").CommandSystemStatus;
}>;
/**
 * Update orchestrator configuration
 */
export declare const updateOrchestratorConfig: (config: Partial<import("./orchestrator").OrchestratorConfig>) => void;
//# sourceMappingURL=index.d.ts.map