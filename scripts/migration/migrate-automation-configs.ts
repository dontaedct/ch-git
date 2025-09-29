#!/usr/bin/env tsx

import { AutomationMigrator, MigrationConfig } from '@/lib/integration/automation-migrator';
import { AutomationWorkflow, WorkflowExecution } from '@/lib/integration/legacy-automation-parser';

interface CLIOptions {
  dryRun: boolean;
  backup: boolean;
  validateOnly: boolean;
  rollback?: string;
  report?: string;
  batchSize: number;
  continueOnError: boolean;
  verbose: boolean;
}

class AutomationMigrationCLI {
  private migrator: AutomationMigrator;

  constructor() {
    this.migrator = new AutomationMigrator();
  }

  async run(args: string[]): Promise<void> {
    const options = this.parseArgs(args);

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Automation System Migration Tool - HT-036.2.1         ║');
    console.log('║     Replace Automation with HT-035 Orchestration           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');

    if (options.rollback) {
      await this.executeRollback(options.rollback);
      return;
    }

    if (options.report) {
      await this.displayReport(options.report);
      return;
    }

    await this.executeMigration(options);
  }

  private async executeMigration(options: CLIOptions): Promise<void> {
    try {
      console.log('📋 Migration Configuration:');
      console.log(`   Dry Run: ${options.dryRun ? 'Yes' : 'No'}`);
      console.log(`   Create Backup: ${options.backup ? 'Yes' : 'No'}`);
      console.log(`   Validate Only: ${options.validateOnly ? 'Yes' : 'No'}`);
      console.log(`   Batch Size: ${options.batchSize}`);
      console.log(`   Continue on Error: ${options.continueOnError ? 'Yes' : 'No'}`);
      console.log('');

      if (options.dryRun) {
        console.log('🔍 Running in DRY RUN mode - no changes will be made');
        console.log('');
      }

      console.log('⏳ Step 1/4: Loading automation data...');
      const workflows = await this.loadAutomationWorkflows();
      const executionHistory = await this.loadExecutionHistory();

      console.log(`   ✓ Loaded ${workflows.length} workflows`);
      console.log(`   ✓ Loaded ${executionHistory.length} execution records`);
      console.log('');

      console.log('⏳ Step 2/4: Migrating workflows...');
      const migrationConfig: MigrationConfig = {
        dryRun: options.dryRun,
        createBackup: options.backup,
        validateOnly: options.validateOnly,
        batchSize: options.batchSize,
        continueOnError: options.continueOnError
      };

      const workflowResult = await this.migrator.migrateWorkflows(workflows, migrationConfig);

      if (workflowResult.success) {
        console.log(`   ✓ Successfully migrated ${workflowResult.statistics.successfulMigrations} workflows`);
      } else {
        console.log(`   ✗ Migration failed with ${workflowResult.statistics.failedMigrations} errors`);
      }

      if (workflowResult.warnings.length > 0) {
        console.log(`   ⚠ ${workflowResult.warnings.length} warnings detected`);
      }

      if (workflowResult.statistics.backupCreated) {
        console.log(`   ✓ Backup created at: ${workflowResult.statistics.backupLocation}`);
      }
      console.log('');

      if (options.validateOnly) {
        console.log('✅ Validation complete');
        this.displayValidationResults(workflowResult);
        return;
      }

      console.log('⏳ Step 3/4: Migrating execution history...');
      const historyResult = await this.migrator.migrateExecutionHistory(executionHistory, migrationConfig);

      console.log(`   ✓ Migrated ${historyResult.executionHistory.migrated} execution records`);
      if (historyResult.executionHistory.failed > 0) {
        console.log(`   ✗ Failed to migrate ${historyResult.executionHistory.failed} execution records`);
      }
      console.log('');

      console.log('⏳ Step 4/4: Generating migration report...');
      const report = this.migrator.generateMigrationReport(workflowResult.migrationId);

      if (report) {
        console.log('   ✓ Migration report generated');
        console.log('');

        if (options.verbose) {
          console.log('📊 Migration Report:');
          console.log('─────────────────────────────────────────────────────────────');
          console.log(report.summary);
          console.log('');
          console.log('💡 Recommendations:');
          report.recommendations.forEach(rec => console.log(`   • ${rec}`));
          console.log('');
        }
      }

      if (workflowResult.success && historyResult.success) {
        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log(`Migration ID: ${workflowResult.migrationId}`);
        console.log(`Duration: ${(workflowResult.statistics.duration / 1000).toFixed(2)}s`);
        console.log('');

        if (!options.dryRun) {
          console.log('🔄 Next Steps:');
          console.log('   1. Verify workflows in orchestration dashboard');
          console.log('   2. Test workflow execution');
          console.log('   3. Update navigation to point to orchestration');
          console.log('   4. Archive old automation page');
          console.log('');
          console.log(`   To rollback: npm run migrate:automation -- --rollback ${workflowResult.migrationId}`);
        }
      } else {
        console.log('❌ Migration completed with errors');
        console.log('');
        console.log('Errors encountered:');
        workflowResult.errors.forEach(error => console.log(`   ✗ ${error}`));
        historyResult.errors.forEach(error => console.log(`   ✗ ${error}`));
        console.log('');
      }

    } catch (error) {
      console.error('');
      console.error('💥 Fatal error during migration:');
      console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('');
      process.exit(1);
    }
  }

  private async executeRollback(migrationId: string): Promise<void> {
    console.log(`🔄 Rolling back migration: ${migrationId}`);
    console.log('');

    try {
      const result = await this.migrator.rollbackMigration(migrationId);

      if (result.success) {
        console.log('✅ Rollback completed successfully');
        console.log('');
        console.log('   ✓ Workflows restored to automation system');
        console.log('   ✓ Execution history restored');
        console.log('   ✓ Migration data cleaned up');
      } else {
        console.log('❌ Rollback failed');
        console.log(`   Error: ${result.error}`);
        process.exit(1);
      }

    } catch (error) {
      console.error('');
      console.error('💥 Fatal error during rollback:');
      console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('');
      process.exit(1);
    }
  }

  private async displayReport(migrationId: string): Promise<void> {
    console.log(`📊 Migration Report: ${migrationId}`);
    console.log('');

    try {
      const report = this.migrator.generateMigrationReport(migrationId);

      if (!report) {
        console.log('❌ No report found for migration ID:', migrationId);
        process.exit(1);
      }

      console.log(report.summary);
      console.log('');
      console.log('💡 Recommendations:');
      report.recommendations.forEach(rec => console.log(`   • ${rec}`));
      console.log('');

      console.log('📈 Detailed Statistics:');
      console.log(`   Total Workflows: ${report.result.statistics.totalWorkflows}`);
      console.log(`   Successful: ${report.result.statistics.successfulMigrations}`);
      console.log(`   Failed: ${report.result.statistics.failedMigrations}`);
      console.log(`   Duration: ${(report.result.statistics.duration / 1000).toFixed(2)}s`);
      console.log('');

      if (report.result.workflows.failed.length > 0) {
        console.log('❌ Failed Workflows:');
        report.result.workflows.failed.forEach(({ workflow, errors }) => {
          console.log(`   • ${workflow.name} (${workflow.id})`);
          errors.forEach(error => console.log(`     - ${error}`));
        });
        console.log('');
      }

    } catch (error) {
      console.error('');
      console.error('💥 Error generating report:');
      console.error(`   ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('');
      process.exit(1);
    }
  }

  private displayValidationResults(result: any): void {
    console.log('');
    console.log('📋 Validation Results:');
    console.log('─────────────────────────────────────────────────────────────');

    if (result.workflows.migrated.length > 0) {
      console.log('');
      console.log('✅ Valid Workflows:');
      result.workflows.migrated.forEach((wf: any) => {
        console.log(`   ✓ ${wf.name} (${wf.id})`);
        console.log(`     Steps: ${wf.steps.length}`);
        console.log(`     Trigger: ${wf.trigger.type}`);
      });
    }

    if (result.workflows.failed.length > 0) {
      console.log('');
      console.log('❌ Invalid Workflows:');
      result.workflows.failed.forEach(({ workflow, errors }: any) => {
        console.log(`   ✗ ${workflow.name} (${workflow.id})`);
        errors.forEach((error: string) => console.log(`     - ${error}`));
      });
    }

    if (result.warnings.length > 0) {
      console.log('');
      console.log('⚠️  Warnings:');
      result.warnings.forEach((warning: string) => console.log(`   • ${warning}`));
    }

    console.log('');
  }

  private async loadAutomationWorkflows(): Promise<AutomationWorkflow[]> {
    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: 'wf-001',
        name: 'Welcome Email Sequence',
        description: 'Automated welcome email series for new form submissions',
        status: 'active',
        type: 'form-submission',
        category: 'marketing',
        trigger: {
          type: 'form_submission',
          config: { formId: 'contact-form', conditions: [] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            name: 'Send Welcome Email',
            config: { template: 'welcome', delay: 0 },
            order: 1
          },
          {
            id: 'action-2',
            type: 'add_to_list',
            name: 'Add to Newsletter',
            config: { listId: 'newsletter', tags: ['new-subscriber'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'send_email',
            name: 'Send Follow-up Email',
            config: { template: 'follow-up', delay: 86400 },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 1247,
          successfulRuns: 1210,
          failedRuns: 37,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          avgExecutionTime: 2300
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-15'),
        createdBy: 'admin@agency.com'
      },
      {
        id: 'wf-002',
        name: 'Lead Scoring & Qualification',
        description: 'Automatically score and qualify leads based on behavior and form data',
        status: 'active',
        type: 'triggered',
        category: 'sales',
        trigger: {
          type: 'user_activity',
          config: { events: ['page_view', 'form_submit', 'email_open'] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'calculate_score',
            name: 'Calculate Lead Score',
            config: { scoreRules: { pageViews: 5, formSubmits: 20, emailOpens: 2 } },
            order: 1
          },
          {
            id: 'action-2',
            type: 'update_crm',
            name: 'Update CRM Record',
            config: { crmId: 'salesforce', fields: ['lead_score', 'qualification_status'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'notify_sales',
            name: 'Notify Sales Team',
            config: { threshold: 80, channel: 'slack', users: ['sales-manager'] },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 892,
          successfulRuns: 845,
          failedRuns: 47,
          lastRun: new Date(Date.now() - 15 * 60 * 1000),
          avgExecutionTime: 1850
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-09-10'),
        createdBy: 'sales@agency.com'
      },
      {
        id: 'wf-003',
        name: 'Support Ticket Auto-Assignment',
        description: 'Automatically assign support tickets based on category and agent availability',
        status: 'active',
        type: 'triggered',
        category: 'support',
        trigger: {
          type: 'ticket_created',
          config: { source: 'helpdesk', priority: ['medium', 'high', 'urgent'] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'categorize_ticket',
            name: 'Auto-categorize Ticket',
            config: { aiModel: 'ticket-classifier', confidence: 0.8 },
            order: 1
          },
          {
            id: 'action-2',
            type: 'find_agent',
            name: 'Find Available Agent',
            config: { criteria: ['expertise', 'workload', 'availability'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'assign_ticket',
            name: 'Assign to Agent',
            config: { notifyAgent: true, escalateIfUnavailable: true },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 456,
          successfulRuns: 432,
          failedRuns: 24,
          lastRun: new Date(Date.now() - 45 * 60 * 1000),
          avgExecutionTime: 3200
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-08-20'),
        createdBy: 'support@agency.com'
      },
      {
        id: 'wf-004',
        name: 'Data Backup & Sync',
        description: 'Daily backup of form submissions and sync to external storage',
        status: 'active',
        type: 'scheduled',
        category: 'operations',
        trigger: {
          type: 'schedule',
          config: {},
          schedule: '0 2 * * *'
        },
        actions: [
          {
            id: 'action-1',
            type: 'export_data',
            name: 'Export Form Data',
            config: { format: 'csv', includeArchived: false },
            order: 1
          },
          {
            id: 'action-2',
            type: 'upload_backup',
            name: 'Upload to Cloud Storage',
            config: { provider: 'aws-s3', bucket: 'agency-backups' },
            order: 2
          },
          {
            id: 'action-3',
            type: 'cleanup_old',
            name: 'Cleanup Old Backups',
            config: { retentionDays: 30, deleteLocal: true },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 245,
          successfulRuns: 240,
          failedRuns: 5,
          lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000),
          avgExecutionTime: 12000
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-07-15'),
        createdBy: 'admin@agency.com'
      }
    ];

    return mockWorkflows;
  }

  private async loadExecutionHistory(): Promise<WorkflowExecution[]> {
    const mockExecutions: WorkflowExecution[] = [
      {
        id: 'exec-001',
        workflowId: 'wf-001',
        workflowName: 'Welcome Email Sequence',
        status: 'completed',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
        duration: 2300,
        trigger: { formId: 'contact-form', submissionId: 'sub-12345' },
        steps: [
          {
            id: 'step-1',
            name: 'Send Welcome Email',
            status: 'completed',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
            output: { emailId: 'email-001', status: 'sent' }
          },
          {
            id: 'step-2',
            name: 'Add to Newsletter',
            status: 'completed',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
            output: { listId: 'newsletter', contactId: 'contact-001' }
          }
        ],
        logs: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            level: 'info',
            message: 'Workflow execution started'
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
            level: 'info',
            message: 'Workflow execution completed successfully'
          }
        ]
      }
    ];

    return mockExecutions;
  }

  private parseArgs(args: string[]): CLIOptions {
    const options: CLIOptions = {
      dryRun: false,
      backup: true,
      validateOnly: false,
      batchSize: 10,
      continueOnError: true,
      verbose: false
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      switch (arg) {
        case '--dry-run':
          options.dryRun = true;
          break;
        case '--no-backup':
          options.backup = false;
          break;
        case '--validate-only':
          options.validateOnly = true;
          break;
        case '--rollback':
          options.rollback = args[++i];
          break;
        case '--report':
          options.report = args[++i];
          break;
        case '--batch-size':
          options.batchSize = parseInt(args[++i], 10);
          break;
        case '--stop-on-error':
          options.continueOnError = false;
          break;
        case '--verbose':
        case '-v':
          options.verbose = true;
          break;
      }
    }

    return options;
  }
}

const cli = new AutomationMigrationCLI();
cli.run(process.argv.slice(2));