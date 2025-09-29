import {
  AutomationWorkflow,
  WorkflowExecution,
  LegacyAutomationParser,
  ParseResult,
  WorkflowMetrics
} from './legacy-automation-parser';
import { WorkflowDefinition } from '@/lib/orchestration/architecture';

export interface MigrationConfig {
  dryRun: boolean;
  createBackup: boolean;
  validateOnly: boolean;
  batchSize: number;
  continueOnError: boolean;
}

export interface MigrationResult {
  success: boolean;
  migrationId: string;
  timestamp: Date;
  statistics: MigrationStatistics;
  workflows: {
    migrated: WorkflowDefinition[];
    failed: Array<{
      workflow: AutomationWorkflow;
      errors: string[];
    }>;
  };
  executionHistory: {
    migrated: number;
    failed: number;
  };
  errors: string[];
  warnings: string[];
}

export interface MigrationStatistics {
  totalWorkflows: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalExecutions: number;
  migratedExecutions: number;
  duration: number;
  backupCreated: boolean;
  backupLocation?: string;
}

export interface MigrationReport {
  migrationId: string;
  timestamp: Date;
  config: MigrationConfig;
  result: MigrationResult;
  summary: string;
  recommendations: string[];
}

export interface RollbackData {
  migrationId: string;
  timestamp: Date;
  workflows: AutomationWorkflow[];
  executionHistory: WorkflowExecution[];
  metadata: Record<string, any>;
}

export class AutomationMigrator {
  private parser: LegacyAutomationParser;
  private migrationHistory: Map<string, MigrationResult> = new Map();

  constructor() {
    this.parser = new LegacyAutomationParser();
  }

  async migrateWorkflows(
    workflows: AutomationWorkflow[],
    config: MigrationConfig = {
      dryRun: false,
      createBackup: true,
      validateOnly: false,
      batchSize: 10,
      continueOnError: true
    }
  ): Promise<MigrationResult> {
    const migrationId = this.generateMigrationId();
    const startTime = Date.now();

    const result: MigrationResult = {
      success: false,
      migrationId,
      timestamp: new Date(),
      statistics: {
        totalWorkflows: workflows.length,
        successfulMigrations: 0,
        failedMigrations: 0,
        totalExecutions: 0,
        migratedExecutions: 0,
        duration: 0,
        backupCreated: false
      },
      workflows: {
        migrated: [],
        failed: []
      },
      executionHistory: {
        migrated: 0,
        failed: 0
      },
      errors: [],
      warnings: []
    };

    try {
      if (config.createBackup && !config.dryRun) {
        const backupResult = await this.createBackup(workflows, migrationId);
        result.statistics.backupCreated = backupResult.success;
        result.statistics.backupLocation = backupResult.location;

        if (!backupResult.success) {
          result.errors.push('Backup creation failed - aborting migration');
          return result;
        }
      }

      const parseResult = this.parser.parseMultipleWorkflows(workflows);

      result.workflows.migrated = parseResult.successful;
      result.workflows.failed = parseResult.failed;
      result.warnings.push(...parseResult.warnings);

      result.statistics.successfulMigrations = parseResult.successful.length;
      result.statistics.failedMigrations = parseResult.failed.length;

      if (config.validateOnly) {
        result.success = parseResult.failed.length === 0;
        result.statistics.duration = Date.now() - startTime;
        return result;
      }

      if (!config.dryRun) {
        for (const workflow of parseResult.successful) {
          try {
            await this.persistWorkflow(workflow);
          } catch (error) {
            const originalWorkflow = workflows.find(w => w.id === workflow.id);
            if (originalWorkflow) {
              result.workflows.failed.push({
                workflow: originalWorkflow,
                errors: [error instanceof Error ? error.message : 'Unknown error']
              });
              result.statistics.failedMigrations++;
              result.statistics.successfulMigrations--;
            }

            if (!config.continueOnError) {
              throw error;
            }
          }
        }
      }

      result.success = result.statistics.failedMigrations === 0;
      result.statistics.duration = Date.now() - startTime;

      this.migrationHistory.set(migrationId, result);

      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.statistics.duration = Date.now() - startTime;
      return result;
    }
  }

  async migrateExecutionHistory(
    history: WorkflowExecution[],
    config: MigrationConfig = {
      dryRun: false,
      createBackup: true,
      validateOnly: false,
      batchSize: 50,
      continueOnError: true
    }
  ): Promise<MigrationResult> {
    const migrationId = this.generateMigrationId();
    const startTime = Date.now();

    const result: MigrationResult = {
      success: false,
      migrationId,
      timestamp: new Date(),
      statistics: {
        totalWorkflows: 0,
        successfulMigrations: 0,
        failedMigrations: 0,
        totalExecutions: history.length,
        migratedExecutions: 0,
        duration: 0,
        backupCreated: false
      },
      workflows: {
        migrated: [],
        failed: []
      },
      executionHistory: {
        migrated: 0,
        failed: 0
      },
      errors: [],
      warnings: []
    };

    try {
      if (config.createBackup && !config.dryRun) {
        const backupResult = await this.createBackup([], migrationId, history);
        result.statistics.backupCreated = backupResult.success;
        result.statistics.backupLocation = backupResult.location;
      }

      const parsedExecutions = this.parser.parseExecutionHistory(history);

      if (!config.dryRun && !config.validateOnly) {
        const batches = this.createBatches(parsedExecutions, config.batchSize);

        for (const batch of batches) {
          try {
            await this.persistExecutionBatch(batch);
            result.executionHistory.migrated += batch.length;
            result.statistics.migratedExecutions += batch.length;
          } catch (error) {
            result.executionHistory.failed += batch.length;
            result.errors.push(`Batch migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

            if (!config.continueOnError) {
              throw error;
            }
          }
        }
      } else {
        result.executionHistory.migrated = parsedExecutions.length;
        result.statistics.migratedExecutions = parsedExecutions.length;
      }

      result.success = result.executionHistory.failed === 0;
      result.statistics.duration = Date.now() - startTime;

      return result;

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
      result.statistics.duration = Date.now() - startTime;
      return result;
    }
  }

  validateMigration(
    original: AutomationWorkflow,
    migrated: WorkflowDefinition
  ): { valid: boolean; differences: string[] } {
    const differences: string[] = [];

    if (original.id !== migrated.id) {
      differences.push(`ID mismatch: ${original.id} -> ${migrated.id}`);
    }

    if (original.name !== migrated.name) {
      differences.push(`Name mismatch: ${original.name} -> ${migrated.name}`);
    }

    if (original.description !== migrated.description) {
      differences.push(`Description mismatch`);
    }

    if (original.actions.length !== migrated.steps.length) {
      differences.push(`Step count mismatch: ${original.actions.length} -> ${migrated.steps.length}`);
    }

    original.actions.forEach((action, index) => {
      const step = migrated.steps.find(s => s.id === action.id);
      if (!step) {
        differences.push(`Missing step: ${action.name} (${action.id})`);
      } else {
        if (action.name !== step.name) {
          differences.push(`Step name mismatch for ${action.id}: ${action.name} -> ${step.name}`);
        }

        if (action.order !== step.order) {
          differences.push(`Step order mismatch for ${action.id}: ${action.order} -> ${step.order}`);
        }
      }
    });

    return {
      valid: differences.length === 0,
      differences
    };
  }

  async rollbackMigration(migrationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const rollbackData = await this.loadRollbackData(migrationId);

      if (!rollbackData) {
        return {
          success: false,
          error: `No rollback data found for migration: ${migrationId}`
        };
      }

      await this.restoreWorkflows(rollbackData.workflows);
      await this.restoreExecutionHistory(rollbackData.executionHistory);

      this.migrationHistory.delete(migrationId);

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  generateMigrationReport(migrationId: string): MigrationReport | null {
    const result = this.migrationHistory.get(migrationId);

    if (!result) {
      return null;
    }

    const summary = this.generateSummary(result);
    const recommendations = this.generateRecommendations(result);

    return {
      migrationId,
      timestamp: result.timestamp,
      config: {
        dryRun: false,
        createBackup: result.statistics.backupCreated,
        validateOnly: false,
        batchSize: 10,
        continueOnError: true
      },
      result,
      summary,
      recommendations
    };
  }

  private generateSummary(result: MigrationResult): string {
    const { statistics } = result;

    const lines: string[] = [
      'Migration Summary',
      '================',
      '',
      `Migration ID: ${result.migrationId}`,
      `Timestamp: ${result.timestamp.toISOString()}`,
      `Duration: ${(statistics.duration / 1000).toFixed(2)}s`,
      '',
      'Workflows:',
      `  Total: ${statistics.totalWorkflows}`,
      `  Successful: ${statistics.successfulMigrations}`,
      `  Failed: ${statistics.failedMigrations}`,
      '',
      'Execution History:',
      `  Total: ${statistics.totalExecutions}`,
      `  Migrated: ${statistics.migratedExecutions}`,
      `  Failed: ${result.executionHistory.failed}`,
      '',
      `Status: ${result.success ? 'SUCCESS' : 'FAILED'}`,
      ''
    ];

    if (result.errors.length > 0) {
      lines.push('Errors:');
      result.errors.forEach(error => lines.push(`  - ${error}`));
      lines.push('');
    }

    if (result.warnings.length > 0) {
      lines.push('Warnings:');
      result.warnings.forEach(warning => lines.push(`  - ${warning}`));
      lines.push('');
    }

    return lines.join('\n');
  }

  private generateRecommendations(result: MigrationResult): string[] {
    const recommendations: string[] = [];

    if (result.workflows.failed.length > 0) {
      recommendations.push(
        'Review failed workflow migrations and fix issues before retrying'
      );
    }

    if (result.warnings.length > 0) {
      recommendations.push(
        'Review warnings to ensure migrated workflows behave as expected'
      );
    }

    if (result.statistics.failedMigrations > result.statistics.successfulMigrations) {
      recommendations.push(
        'High failure rate detected - review migration logic and source data'
      );
    }

    if (!result.statistics.backupCreated) {
      recommendations.push(
        'No backup was created - consider creating manual backup before production migration'
      );
    }

    if (result.executionHistory.failed > 0) {
      recommendations.push(
        'Some execution history failed to migrate - verify historical data integrity'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Migration completed successfully with no issues');
    }

    return recommendations;
  }

  private async createBackup(
    workflows: AutomationWorkflow[],
    migrationId: string,
    executionHistory?: WorkflowExecution[]
  ): Promise<{ success: boolean; location?: string }> {
    try {
      const rollbackData: RollbackData = {
        migrationId,
        timestamp: new Date(),
        workflows,
        executionHistory: executionHistory || [],
        metadata: {
          totalWorkflows: workflows.length,
          totalExecutions: executionHistory?.length || 0
        }
      };

      const location = `/backups/migration/${migrationId}.json`;

      await this.saveRollbackData(rollbackData, location);

      return { success: true, location };

    } catch (error) {
      console.error('Backup creation failed:', error);
      return { success: false };
    }
  }

  private async persistWorkflow(workflow: WorkflowDefinition): Promise<void> {
    console.log('Persisting workflow:', workflow.id);
  }

  private async persistExecutionBatch(executions: any[]): Promise<void> {
    console.log('Persisting execution batch:', executions.length);
  }

  private async saveRollbackData(data: RollbackData, location: string): Promise<void> {
    console.log('Saving rollback data to:', location);
  }

  private async loadRollbackData(migrationId: string): Promise<RollbackData | null> {
    console.log('Loading rollback data for:', migrationId);
    return null;
  }

  private async restoreWorkflows(workflows: AutomationWorkflow[]): Promise<void> {
    console.log('Restoring workflows:', workflows.length);
  }

  private async restoreExecutionHistory(history: WorkflowExecution[]): Promise<void> {
    console.log('Restoring execution history:', history.length);
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  private generateMigrationId(): string {
    return `migration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  getMigrationHistory(): MigrationResult[] {
    return Array.from(this.migrationHistory.values());
  }

  getMigrationById(migrationId: string): MigrationResult | undefined {
    return this.migrationHistory.get(migrationId);
  }
}

export const automationMigrator = new AutomationMigrator();