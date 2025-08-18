"use strict";
/**
 * @dct/mit-hero-core
 * MIT Hero Core Orchestrator
 *
 * This module provides the core orchestrator logic for the MIT Hero system,
 * including the 6 exported API functions for repository management.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreOrchestrator = void 0;
const health_1 = require("./health");
const workers_1 = require("./workers");
const commands_1 = require("./commands");
// Stub implementations for dependencies during copy phase
class ConcurrencyLimiter {
    constructor(config) { }
    async execute(fn) {
        return await fn();
    }
}
class RetryHelper {
    constructor(config) { }
    async execute(fn) {
        return await fn();
    }
}
// ============================================================================
// CORE ORCHESTRATOR CLASS
// ============================================================================
class CoreOrchestrator {
    constructor(config) {
        this.config = {
            maxConcurrent: 10,
            maxQueueSize: 100,
            timeoutMs: 30000,
            retryAttempts: 3,
            enableMetrics: true,
            ...config
        };
        this.concurrencyLimiter = new ConcurrencyLimiter({
            maxConcurrent: this.config.maxConcurrent,
            maxQueueSize: this.config.maxQueueSize,
            priorityLevels: 5,
            timeoutMs: this.config.timeoutMs,
            resourceLimits: { cpu: 70, memory: 75, disk: 55 }
        });
        this.retryHelper = new RetryHelper({
            maxAttempts: this.config.retryAttempts,
            baseDelay: 1000,
            maxDelay: 10000
        });
        this.healthMonitor = new health_1.HealthMonitor();
        this.workerManager = new workers_1.WorkerManager();
        this.commandSystem = new commands_1.CommandSystem();
    }
    // ============================================================================
    // EXPORTED API FUNCTIONS
    // ============================================================================
    /**
     * Preflight repository check - validates repository health and readiness
     */
    async preflightRepo() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const health = await this.healthMonitor.checkSystemHealth();
                const repoStatus = await this.commandSystem.checkRepositoryStatus();
                const issues = [];
                const recommendations = [];
                if (health.overallHealth < 0.8) {
                    issues.push(`System health below threshold: ${health.overallHealth}`);
                    recommendations.push('Run system diagnostics and apply fixes');
                }
                if (repoStatus.hasUncommittedChanges) {
                    issues.push('Repository has uncommitted changes');
                    recommendations.push('Commit or stash changes before proceeding');
                }
                if (repoStatus.behindRemote) {
                    issues.push('Repository is behind remote');
                    recommendations.push('Pull latest changes from remote');
                }
                return {
                    success: issues.length === 0,
                    issues,
                    recommendations,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                issues: [`Preflight failed: ${errorMessage}`],
                recommendations: ['Check system connectivity and try again'],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Preflight CSV validation - checks CSV data integrity and format
     */
    async preflightCsv(csvPath) {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const csvValidation = await this.workerManager.validateCsvData(csvPath);
                const issues = [];
                const recommendations = [];
                if (!csvValidation.isValid) {
                    issues.push('CSV validation failed');
                    csvValidation.errors.forEach(error => issues.push(error));
                }
                if (csvValidation.rowCount === 0) {
                    issues.push('CSV file is empty');
                    recommendations.push('Ensure CSV contains data');
                }
                if (csvValidation.missingHeaders.length > 0) {
                    issues.push(`Missing required headers: ${csvValidation.missingHeaders.join(', ')}`);
                    recommendations.push('Add missing required columns');
                }
                return {
                    success: issues.length === 0,
                    issues,
                    recommendations,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                issues: [`CSV preflight failed: ${errorMessage}`],
                recommendations: ['Check file path and format'],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Prepublish CMS validation - ensures CMS content is ready for publication
     */
    async prepublishCms(cmsPath) {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const cmsValidation = await this.workerManager.validateCmsContent(cmsPath);
                const issues = [];
                const recommendations = [];
                if (!cmsValidation.isValid) {
                    issues.push('CMS validation failed');
                    cmsValidation.errors.forEach(error => issues.push(error));
                }
                if (cmsValidation.missingAssets.length > 0) {
                    issues.push(`Missing assets: ${cmsValidation.missingAssets.join(', ')}`);
                    recommendations.push('Upload missing assets before publishing');
                }
                if (cmsValidation.invalidLinks.length > 0) {
                    issues.push(`Invalid links found: ${cmsValidation.invalidLinks.join(', ')}`);
                    recommendations.push('Fix broken links before publishing');
                }
                return {
                    success: issues.length === 0,
                    issues,
                    recommendations,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                issues: [`CMS preflight failed: ${errorMessage}`],
                recommendations: ['Check CMS configuration and content'],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Apply automated fixes to resolve detected issues
     */
    async applyFixes(issues) {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const appliedFixes = [];
                const failedFixes = [];
                for (const issue of issues) {
                    try {
                        const fix = await this.commandSystem.autoFix(issue);
                        if (fix.success) {
                            appliedFixes.push(`${issue}: ${fix.description}`);
                        }
                        else {
                            failedFixes.push(`${issue}: ${fix.error || 'Unknown error'}`);
                        }
                    }
                    catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                        failedFixes.push(`${issue}: ${errorMessage}`);
                    }
                }
                return {
                    success: failedFixes.length === 0,
                    appliedFixes,
                    failedFixes,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                appliedFixes: [],
                failedFixes: [`Fix application failed: ${errorMessage}`],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Rollback recent changes to restore system stability
     */
    async rollback() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const rollback = await this.commandSystem.executeRollback();
                return {
                    success: rollback.success,
                    rolledBackChanges: rollback.changes,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            return {
                success: false,
                rolledBackChanges: [],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Generate comprehensive system report
     */
    async generateReport() {
        try {
            const result = await this.concurrencyLimiter.execute(async () => {
                const health = await this.healthMonitor.checkSystemHealth();
                const metrics = await this.healthMonitor.getPerformanceMetrics();
                const operations = await this.commandSystem.getRecentOperations();
                const recommendations = await this.healthMonitor.generateRecommendations();
                return {
                    systemHealth: health,
                    performanceMetrics: metrics,
                    recentOperations: operations,
                    recommendations,
                    timestamp: new Date().toISOString()
                };
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                systemHealth: { error: errorMessage },
                performanceMetrics: {},
                recentOperations: [],
                recommendations: ['System report generation failed'],
                timestamp: new Date().toISOString()
            };
        }
    }
    // ============================================================================
    // UTILITY METHODS
    // ============================================================================
    /**
     * Get orchestrator configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Update orchestrator configuration
     */
    updateConfig(updates) {
        this.config = { ...this.config, ...updates };
        // Update concurrency limiter if needed
        if (updates.maxConcurrent || updates.maxQueueSize || updates.timeoutMs) {
            this.concurrencyLimiter = new ConcurrencyLimiter({
                maxConcurrent: this.config.maxConcurrent,
                maxQueueSize: this.config.maxQueueSize,
                priorityLevels: 5,
                timeoutMs: this.config.timeoutMs,
                resourceLimits: { cpu: 70, memory: 75, disk: 55 }
            });
        }
    }
    /**
     * Get system status
     */
    async getStatus() {
        return {
            config: this.config,
            health: await this.healthMonitor.checkSystemHealth(),
            workers: await this.workerManager.getStatus(),
            commands: await this.commandSystem.getStatus()
        };
    }
}
exports.CoreOrchestrator = CoreOrchestrator;
//# sourceMappingURL=orchestrator.js.map