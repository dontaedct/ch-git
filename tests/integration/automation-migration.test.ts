import { describe, it, expect, beforeEach } from '@jest/globals';
import { AutomationMigrator, MigrationConfig } from '@/lib/integration/automation-migrator';
import { LegacyAutomationParser, AutomationWorkflow, WorkflowExecution } from '@/lib/integration/legacy-automation-parser';

describe('Automation Migration - HT-036.2.1', () => {
  let migrator: AutomationMigrator;
  let parser: LegacyAutomationParser;

  beforeEach(() => {
    migrator = new AutomationMigrator();
    parser = new LegacyAutomationParser();
  });

  describe('LegacyAutomationParser', () => {
    describe('parseAutomationWorkflow', () => {
      it('should successfully parse a valid automation workflow', () => {
        const workflow: AutomationWorkflow = {
          id: 'wf-001',
          name: 'Test Workflow',
          description: 'Test workflow description',
          status: 'active',
          type: 'form-submission',
          category: 'marketing',
          trigger: {
            type: 'form_submission',
            config: { formId: 'contact-form' }
          },
          actions: [
            {
              id: 'action-1',
              type: 'send_email',
              name: 'Send Email',
              config: { template: 'welcome' },
              order: 1
            }
          ],
          metrics: {
            totalRuns: 100,
            successfulRuns: 95,
            failedRuns: 5,
            avgExecutionTime: 2000
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const result = parser.parseAutomationWorkflow(workflow);

        expect(result.success).toBe(true);
        expect(result.workflow).toBeDefined();
        expect(result.workflow?.id).toBe('wf-001');
        expect(result.workflow?.name).toBe('Test Workflow');
        expect(result.workflow?.steps).toHaveLength(1);
        expect(result.errors).toHaveLength(0);
      });

      it('should fail when workflow is missing required fields', () => {
        const invalidWorkflow: any = {
          description: 'Missing id and name'
        };

        const result = parser.parseAutomationWorkflow(invalidWorkflow);

        expect(result.success).toBe(false);
        expect(result.errors).toContain('Workflow missing required id or name');
      });

      it('should map action types correctly', () => {
        const workflow: AutomationWorkflow = {
          id: 'wf-002',
          name: 'Action Mapping Test',
          description: 'Test action type mapping',
          status: 'active',
          type: 'webhook',
          category: 'integration',
          trigger: {
            type: 'webhook',
            config: { path: '/test' }
          },
          actions: [
            {
              id: 'action-1',
              type: 'send_email',
              name: 'Send Email',
              config: {},
              order: 1
            },
            {
              id: 'action-2',
              type: 'update_crm',
              name: 'Update CRM',
              config: {},
              order: 2
            },
            {
              id: 'action-3',
              type: 'calculate_score',
              name: 'Calculate Score',
              config: {},
              order: 3
            }
          ],
          metrics: {
            totalRuns: 50,
            successfulRuns: 48,
            failedRuns: 2,
            avgExecutionTime: 1500
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const result = parser.parseAutomationWorkflow(workflow);

        expect(result.success).toBe(true);
        expect(result.workflow?.steps[0].type).toBe('api');
        expect(result.workflow?.steps[1].type).toBe('api');
        expect(result.workflow?.steps[2].type).toBe('transform');
      });

      it('should map trigger types correctly', () => {
        const triggerMappings = [
          { type: 'form-submission' as const, expected: 'form-submission' },
          { type: 'user-action' as const, expected: 'user-activity' },
          { type: 'webhook' as const, expected: 'webhook' },
          { type: 'scheduled' as const, expected: 'schedule' },
          { type: 'triggered' as const, expected: 'custom' }
        ];

        triggerMappings.forEach(({ type, expected }) => {
          const workflow: AutomationWorkflow = {
            id: `wf-trigger-${type}`,
            name: `Trigger Test ${type}`,
            description: 'Test trigger mapping',
            status: 'active',
            type,
            category: 'operations',
            trigger: { type: type, config: {} },
            actions: [
              {
                id: 'action-1',
                type: 'export_data',
                name: 'Export',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 10,
              successfulRuns: 10,
              failedRuns: 0,
              avgExecutionTime: 1000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          };

          const result = parser.parseAutomationWorkflow(workflow);

          expect(result.success).toBe(true);
          expect(result.workflow?.trigger.type).toBe(expected);
        });
      });

      it('should map workflow status correctly', () => {
        const statusMappings = [
          { status: 'active' as const, expected: 'active' },
          { status: 'paused' as const, expected: 'inactive' },
          { status: 'stopped' as const, expected: 'inactive' },
          { status: 'error' as const, expected: 'maintenance' }
        ];

        statusMappings.forEach(({ status, expected }) => {
          const workflow: AutomationWorkflow = {
            id: `wf-status-${status}`,
            name: `Status Test ${status}`,
            description: 'Test status mapping',
            status,
            type: 'scheduled',
            category: 'operations',
            trigger: { type: 'schedule', config: {}, schedule: '0 0 * * *' },
            actions: [
              {
                id: 'action-1',
                type: 'export_data',
                name: 'Export',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 10,
              successfulRuns: 10,
              failedRuns: 0,
              avgExecutionTime: 1000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          };

          const result = parser.parseAutomationWorkflow(workflow);

          expect(result.success).toBe(true);
          expect(result.workflow?.metadata.status).toBe(expected);
        });
      });
    });

    describe('parseExecutionHistory', () => {
      it('should parse execution history correctly', () => {
        const executions: WorkflowExecution[] = [
          {
            id: 'exec-001',
            workflowId: 'wf-001',
            workflowName: 'Test Workflow',
            status: 'completed',
            startTime: new Date(),
            endTime: new Date(),
            duration: 2000,
            trigger: { formId: 'test-form' },
            steps: [
              {
                id: 'step-1',
                name: 'Step 1',
                status: 'completed',
                startTime: new Date(),
                endTime: new Date()
              }
            ],
            logs: []
          }
        ];

        const result = parser.parseExecutionHistory(executions);

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('exec-001');
        expect(result[0].workflowId).toBe('wf-001');
        expect(result[0].status).toBe('completed');
      });
    });

    describe('extractWorkflowMetrics', () => {
      it('should extract workflow metrics correctly', () => {
        const workflow: AutomationWorkflow = {
          id: 'wf-001',
          name: 'Test',
          description: 'Test',
          status: 'active',
          type: 'scheduled',
          category: 'operations',
          trigger: { type: 'schedule', config: {} },
          actions: [],
          metrics: {
            totalRuns: 100,
            successfulRuns: 95,
            failedRuns: 5,
            lastRun: new Date(),
            avgExecutionTime: 2000
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const metrics = parser.extractWorkflowMetrics(workflow);

        expect(metrics.totalExecutions).toBe(100);
        expect(metrics.successfulExecutions).toBe(95);
        expect(metrics.failedExecutions).toBe(5);
        expect(metrics.successRate).toBe(95);
        expect(metrics.averageExecutionTime).toBe(2000);
      });

      it('should handle zero executions correctly', () => {
        const workflow: AutomationWorkflow = {
          id: 'wf-002',
          name: 'New Workflow',
          description: 'No executions yet',
          status: 'active',
          type: 'webhook',
          category: 'integration',
          trigger: { type: 'webhook', config: {} },
          actions: [],
          metrics: {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            avgExecutionTime: 0
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const metrics = parser.extractWorkflowMetrics(workflow);

        expect(metrics.totalExecutions).toBe(0);
        expect(metrics.successRate).toBe(0);
      });
    });

    describe('validateParsedData', () => {
      it('should validate workflow with all required fields', () => {
        const workflow: any = {
          id: 'wf-001',
          name: 'Valid Workflow',
          steps: [
            {
              id: 'step-1',
              name: 'Step 1',
              type: 'api',
              order: 1,
              config: {},
              dependencies: [],
              enabled: true
            }
          ],
          trigger: { type: 'webhook', config: {} },
          config: { retryPolicy: {}, circuitBreaker: {} }
        };

        const result = parser.validateParsedData(workflow);

        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should detect duplicate step IDs', () => {
        const workflow: any = {
          id: 'wf-001',
          name: 'Invalid Workflow',
          steps: [
            {
              id: 'step-1',
              name: 'Step 1',
              type: 'api',
              order: 1,
              config: {},
              dependencies: [],
              enabled: true
            },
            {
              id: 'step-1',
              name: 'Step 2',
              type: 'api',
              order: 2,
              config: {},
              dependencies: [],
              enabled: true
            }
          ],
          trigger: { type: 'webhook', config: {} },
          config: {}
        };

        const result = parser.validateParsedData(workflow);

        expect(result.valid).toBe(false);
        expect(result.errors).toContain('Duplicate step ID: step-1');
      });
    });

    describe('parseMultipleWorkflows', () => {
      it('should parse multiple workflows successfully', () => {
        const workflows: AutomationWorkflow[] = [
          {
            id: 'wf-001',
            name: 'Workflow 1',
            description: 'First workflow',
            status: 'active',
            type: 'scheduled',
            category: 'operations',
            trigger: { type: 'schedule', config: {} },
            actions: [
              {
                id: 'action-1',
                type: 'export_data',
                name: 'Export',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 10,
              successfulRuns: 10,
              failedRuns: 0,
              avgExecutionTime: 1000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          },
          {
            id: 'wf-002',
            name: 'Workflow 2',
            description: 'Second workflow',
            status: 'active',
            type: 'webhook',
            category: 'integration',
            trigger: { type: 'webhook', config: {} },
            actions: [
              {
                id: 'action-1',
                type: 'notify_sales',
                name: 'Notify',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 20,
              successfulRuns: 19,
              failedRuns: 1,
              avgExecutionTime: 500
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          }
        ];

        const result = parser.parseMultipleWorkflows(workflows);

        expect(result.successful).toHaveLength(2);
        expect(result.failed).toHaveLength(0);
      });
    });
  });

  describe('AutomationMigrator', () => {
    describe('migrateWorkflows', () => {
      it('should migrate workflows in dry-run mode', async () => {
        const workflows: AutomationWorkflow[] = [
          {
            id: 'wf-001',
            name: 'Test Workflow',
            description: 'Test',
            status: 'active',
            type: 'scheduled',
            category: 'operations',
            trigger: { type: 'schedule', config: {} },
            actions: [
              {
                id: 'action-1',
                type: 'export_data',
                name: 'Export',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 10,
              successfulRuns: 10,
              failedRuns: 0,
              avgExecutionTime: 1000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          }
        ];

        const config: MigrationConfig = {
          dryRun: true,
          createBackup: false,
          validateOnly: false,
          batchSize: 10,
          continueOnError: true
        };

        const result = await migrator.migrateWorkflows(workflows, config);

        expect(result.success).toBe(true);
        expect(result.statistics.totalWorkflows).toBe(1);
        expect(result.statistics.successfulMigrations).toBe(1);
        expect(result.statistics.backupCreated).toBe(false);
      });

      it('should validate workflows without migration', async () => {
        const workflows: AutomationWorkflow[] = [
          {
            id: 'wf-001',
            name: 'Test Workflow',
            description: 'Test',
            status: 'active',
            type: 'form-submission',
            category: 'marketing',
            trigger: { type: 'form_submission', config: {} },
            actions: [
              {
                id: 'action-1',
                type: 'send_email',
                name: 'Send Email',
                config: {},
                order: 1
              }
            ],
            metrics: {
              totalRuns: 100,
              successfulRuns: 95,
              failedRuns: 5,
              avgExecutionTime: 2000
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'test@agency.com'
          }
        ];

        const config: MigrationConfig = {
          dryRun: false,
          createBackup: false,
          validateOnly: true,
          batchSize: 10,
          continueOnError: true
        };

        const result = await migrator.migrateWorkflows(workflows, config);

        expect(result.success).toBe(true);
        expect(result.statistics.successfulMigrations).toBe(1);
      });
    });

    describe('validateMigration', () => {
      it('should validate successful migration', async () => {
        const original: AutomationWorkflow = {
          id: 'wf-001',
          name: 'Test Workflow',
          description: 'Test Description',
          status: 'active',
          type: 'scheduled',
          category: 'operations',
          trigger: { type: 'schedule', config: {} },
          actions: [
            {
              id: 'action-1',
              type: 'export_data',
              name: 'Export Data',
              config: {},
              order: 1
            }
          ],
          metrics: {
            totalRuns: 10,
            successfulRuns: 10,
            failedRuns: 0,
            avgExecutionTime: 1000
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const parseResult = parser.parseAutomationWorkflow(original);
        expect(parseResult.success).toBe(true);

        const migrated = parseResult.workflow!;
        const validation = migrator.validateMigration(original, migrated);

        expect(validation.valid).toBe(true);
        expect(validation.differences).toHaveLength(0);
      });

      it('should detect differences in migration', () => {
        const original: AutomationWorkflow = {
          id: 'wf-001',
          name: 'Original Name',
          description: 'Original Description',
          status: 'active',
          type: 'webhook',
          category: 'integration',
          trigger: { type: 'webhook', config: {} },
          actions: [
            {
              id: 'action-1',
              type: 'notify_sales',
              name: 'Notify',
              config: {},
              order: 1
            }
          ],
          metrics: {
            totalRuns: 5,
            successfulRuns: 5,
            failedRuns: 0,
            avgExecutionTime: 500
          },
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: 'test@agency.com'
        };

        const migrated: any = {
          id: 'wf-001',
          name: 'Different Name',
          description: 'Different Description',
          version: '1.0.0',
          steps: [],
          trigger: {},
          config: {},
          metadata: {}
        };

        const validation = migrator.validateMigration(original, migrated);

        expect(validation.valid).toBe(false);
        expect(validation.differences.length).toBeGreaterThan(0);
      });
    });
  });
});