/**
 * @dct/mit-hero-core
 * MIT Hero Core Orchestrator
 * 
 * This module provides the core orchestrator logic for the MIT Hero system,
 * including the 6 exported API functions for repository management.
 */

import { HealthMonitor } from './health';
import { WorkerManager } from './workers';
import { CommandSystem } from './commands';

// Stub implementations for dependencies during copy phase
class ConcurrencyLimiter {
  constructor(config: any) {}
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return await fn();
  }
}

class RetryHelper {
  constructor(config: any) {}
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return await fn();
  }
}

// ============================================================================
// CORE ORCHESTRATOR INTERFACES
// ============================================================================

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
  recommendations: any[]; // Changed from string[] to any[] to match HealthRecommendation[]
  timestamp: string;
}

// ============================================================================
// CORE ORCHESTRATOR CLASS
// ============================================================================

export class CoreOrchestrator {
  private config: OrchestratorConfig;
  private concurrencyLimiter: ConcurrencyLimiter;
  private retryHelper: RetryHelper;
  private healthMonitor: HealthMonitor;
  private workerManager: WorkerManager;
  private commandSystem: CommandSystem;

  constructor(config?: Partial<OrchestratorConfig>) {
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

    this.healthMonitor = new HealthMonitor();
    this.workerManager = new WorkerManager();
    this.commandSystem = new CommandSystem();
  }

  // ============================================================================
  // EXPORTED API FUNCTIONS
  // ============================================================================

  /**
   * Preflight repository check - validates repository health and readiness
   */
  async preflightRepo(): Promise<PreflightResult> {
    try {
      const result = await this.concurrencyLimiter.execute(async () => {
        const health = await this.healthMonitor.checkSystemHealth();
        const repoStatus = await this.commandSystem.checkRepositoryStatus();
        
        const issues: string[] = [];
        const recommendations: string[] = [];

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
    } catch (error) {
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
  async preflightCsv(csvPath: string): Promise<PreflightResult> {
    try {
      const result = await this.concurrencyLimiter.execute(async () => {
        const csvValidation = await this.workerManager.validateCsvData(csvPath);
        
        const issues: string[] = [];
        const recommendations: string[] = [];

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
    } catch (error) {
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
  async prepublishCms(cmsPath: string): Promise<PreflightResult> {
    try {
      const result = await this.concurrencyLimiter.execute(async () => {
        const cmsValidation = await this.workerManager.validateCmsContent(cmsPath);
        
        const issues: string[] = [];
        const recommendations: string[] = [];

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
    } catch (error) {
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
  async applyFixes(issues: string[]): Promise<FixResult> {
    try {
      const result = await this.concurrencyLimiter.execute(async () => {
        const appliedFixes: string[] = [];
        const failedFixes: string[] = [];

        for (const issue of issues) {
          try {
            const fix = await this.commandSystem.autoFix(issue);
            if (fix.success) {
              appliedFixes.push(`${issue}: ${fix.description}`);
            } else {
              failedFixes.push(`${issue}: ${fix.error || 'Unknown error'}`);
            }
          } catch (error) {
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
    } catch (error) {
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
  async rollback(): Promise<RollbackResult> {
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
    } catch (error) {
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
  async generateReport(): Promise<ReportData> {
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
    } catch (error) {
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
  getConfig(): OrchestratorConfig {
    return { ...this.config };
  }

  /**
   * Update orchestrator configuration
   */
  updateConfig(updates: Partial<OrchestratorConfig>): void {
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
