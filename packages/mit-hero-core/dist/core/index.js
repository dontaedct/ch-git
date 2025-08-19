"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Module Index
 *
 * This module exports all core functionality including the 6 main API functions
 * for orchestrator and worker management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrchestratorConfig = exports.getOrchestratorStatus = exports.orchestrator = exports.generateReport = exports.rollback = exports.applyFixes = exports.prepublishCms = exports.preflightCsv = exports.preflightRepo = exports.HealthMonitor = exports.CommandSystem = exports.WorkerManager = exports.CoreOrchestrator = void 0;
// ============================================================================
// CORE MODULE EXPORTS
// ============================================================================
// Export orchestrator functionality
var orchestrator_1 = require("./orchestrator");
Object.defineProperty(exports, "CoreOrchestrator", { enumerable: true, get: function () { return orchestrator_1.CoreOrchestrator; } });
// Export worker management functionality
var workers_1 = require("./workers");
Object.defineProperty(exports, "WorkerManager", { enumerable: true, get: function () { return workers_1.WorkerManager; } });
// Export command system functionality
var commands_1 = require("./commands");
Object.defineProperty(exports, "CommandSystem", { enumerable: true, get: function () { return commands_1.CommandSystem; } });
// Export health monitoring functionality
var health_1 = require("./health");
Object.defineProperty(exports, "HealthMonitor", { enumerable: true, get: function () { return health_1.HealthMonitor; } });
// ============================================================================
// MAIN API FUNCTIONS
// ============================================================================
const orchestrator_2 = require("./orchestrator");
// Create a default orchestrator instance
const defaultOrchestrator = new orchestrator_2.CoreOrchestrator();
exports.orchestrator = defaultOrchestrator;
/**
 * Preflight repository check - validates repository health and readiness
 */
const preflightRepo = () => defaultOrchestrator.preflightRepo();
exports.preflightRepo = preflightRepo;
/**
 * Preflight CSV validation - checks CSV data integrity and format
 */
const preflightCsv = (csvPath) => defaultOrchestrator.preflightCsv(csvPath);
exports.preflightCsv = preflightCsv;
/**
 * Prepublish CMS validation - ensures CMS content is ready for publication
 */
const prepublishCms = (cmsPath) => defaultOrchestrator.prepublishCms(cmsPath);
exports.prepublishCms = prepublishCms;
/**
 * Apply automated fixes to resolve detected issues
 */
const applyFixes = (issues) => defaultOrchestrator.applyFixes(issues);
exports.applyFixes = applyFixes;
/**
 * Rollback recent changes to restore system stability
 */
const rollback = () => defaultOrchestrator.rollback();
exports.rollback = rollback;
/**
 * Generate comprehensive system report
 */
const generateReport = () => defaultOrchestrator.generateReport();
exports.generateReport = generateReport;
// ============================================================================
// UTILITY EXPORTS
// ============================================================================
/**
 * Get orchestrator status
 */
const getOrchestratorStatus = () => defaultOrchestrator.getStatus();
exports.getOrchestratorStatus = getOrchestratorStatus;
/**
 * Update orchestrator configuration
 */
const updateOrchestratorConfig = (config) => defaultOrchestrator.updateConfig(config);
exports.updateOrchestratorConfig = updateOrchestratorConfig;
//# sourceMappingURL=index.js.map