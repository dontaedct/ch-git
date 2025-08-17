/**
 * @dct/mit-hero-core
 * MIT Hero Core Module Index
 * 
 * This module exports all core functionality including the 6 main API functions
 * for orchestrator and worker management.
 */

// ============================================================================
// CORE MODULE EXPORTS
// ============================================================================

// Export orchestrator functionality
export {
  CoreOrchestrator,
  type OrchestratorConfig,
  type PreflightResult,
  type FixResult,
  type RollbackResult,
  type ReportData
} from './orchestrator';

// Export worker management functionality
export {
  WorkerManager,
  type WorkerConfig,
  type CsvValidationResult,
  type CmsValidationResult,
  type WorkerStatus,
  type TaskResult
} from './workers';

// Export command system functionality
export {
  CommandSystem,
  type CommandConfig,
  type RepositoryStatus,
  type AutoFixResult,
  type CommandOperation,
  type CommandSystemStatus
} from './commands';

// Export health monitoring functionality
export {
  HealthMonitor,
  type HealthConfig,
  type SystemHealth,
  type CpuMetrics,
  type MemoryMetrics,
  type DiskMetrics,
  type NetworkMetrics,
  type PerformanceMetrics,
  type HealthRecommendation
} from './health';

// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================

import { CoreOrchestrator } from './orchestrator';

// Create a default orchestrator instance
const defaultOrchestrator = new CoreOrchestrator();

/**
 * Preflight repository check - validates repository health and readiness
 */
export const preflightRepo = () => defaultOrchestrator.preflightRepo();

/**
 * Preflight CSV validation - checks CSV data integrity and format
 */
export const preflightCsv = (csvPath: string) => defaultOrchestrator.preflightCsv(csvPath);

/**
 * Prepublish CMS validation - ensures CMS content is ready for publication
 */
export const prepublishCms = (cmsPath: string) => defaultOrchestrator.prepublishCms(cmsPath);

/**
 * Apply automated fixes to resolve detected issues
 */
export const applyFixes = (issues: string[]) => defaultOrchestrator.applyFixes(issues);

/**
 * Rollback recent changes to restore system stability
 */
export const rollback = () => defaultOrchestrator.rollback();

/**
 * Generate comprehensive system report
 */
export const generateReport = () => defaultOrchestrator.generateReport();

// ============================================================================
// ORCHESTRATOR INSTANCE EXPORT
// ============================================================================

/**
 * Export the default orchestrator instance for advanced usage
 */
export { defaultOrchestrator as orchestrator };

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get orchestrator status
 */
export const getOrchestratorStatus = () => defaultOrchestrator.getStatus();

/**
 * Update orchestrator configuration
 */
export const updateOrchestratorConfig = (config: Partial<import('./orchestrator').OrchestratorConfig>) => 
  defaultOrchestrator.updateConfig(config);
