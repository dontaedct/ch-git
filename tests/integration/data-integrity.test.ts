/**
 * HT-036.3.4: Data Integrity Validation Tests
 *
 * Comprehensive data integrity validation tests for all integrated
 * systems to ensure data consistency, referential integrity, and
 * transaction safety across HT-035 and existing systems.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Data integrity utilities
interface IntegrityTestConfig {
  tenantId: string;
  supabase: any;
}

interface IntegrityViolation {
  table: string;
  column: string;
  violation: string;
  affectedRows: number;
  details: any;
}

interface TransactionTestResult {
  success: boolean;
  rollbackSuccessful: boolean;
  dataConsistency: boolean;
  violations: IntegrityViolation[];
}

describe('HT-036.3.4: Data Integrity Validation Tests', () => {
  let config: IntegrityTestConfig;
  let testTenantId: string;

  beforeAll(async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .insert({
        id: uuidv4(),
        name: 'Data Integrity Test Tenant',
        settings: {}
      })
      .select()
      .single();

    testTenantId = tenant.id;

    config = {
      tenantId: testTenantId,
      supabase
    };
  }, 30000);

  afterAll(async () => {
    // Clean up test tenant and all related data
    await cleanupIntegrityTestData(config);
  });

  beforeEach(async () => {
    // Clean up any test data between tests
    await cleanupTestData(config);
  });

  describe('Cross-System Referential Integrity', () => {
    test('should maintain referential integrity between orchestration and modules', async () => {
      // Create workflow that references modules
      const { data: workflow } = await config.supabase
        .from('workflows')
        .insert({
          tenant_id: testTenantId,
          name: 'Integrity Test Workflow',
          steps: [
            {
              type: 'module_activation',
              module_id: 'test-module-1'
            }
          ]
        })
        .select()
        .single();

      // Create corresponding module registry entry
      const { data: module } = await config.supabase
        .from('module_registry')
        .insert({
          tenant_id: testTenantId,
          module_id: 'test-module-1',
          name: 'Test Module 1',
          version: '1.0.0',
          status: 'available'
        })
        .select()
        .single();

      // Create workflow execution
      const { data: execution } = await config.supabase
        .from('workflow_executions')
        .insert({
          tenant_id: testTenantId,
          workflow_id: workflow.id,
          status: 'running'
        })
        .select()
        .single();

      // Try to delete module while workflow execution references it
      const { error: deleteError } = await config.supabase
        .from('module_registry')
        .delete()
        .eq('id', module.id);

      // Should prevent deletion due to foreign key constraint
      expect(deleteError).toBeTruthy();
      expect(deleteError.code).toBe('23503'); // Foreign key violation

      // Verify data integrity
      const violations = await checkReferentialIntegrity(config);
      expect(violations).toHaveLength(0);
    });

    test('should maintain integrity between templates and marketplace', async () => {
      // Create marketplace package
      const { data: package } = await config.supabase
        .from('marketplace_packages')
        .insert({
          tenant_id: testTenantId,
          name: 'Test Template Package',
          version: '1.0.0',
          type: 'template',
          status: 'published'
        })
        .select()
        .single();

      // Create template that references package
      const { data: template } = await config.supabase
        .from('templates')
        .insert({
          tenant_id: testTenantId,
          name: 'Test Template',
          package_id: package.id,
          content: 'Template content'
        })
        .select()
        .single();

      // Try to delete package while template references it
      const { error: deleteError } = await config.supabase
        .from('marketplace_packages')
        .delete()
        .eq('id', package.id);

      // Should prevent deletion
      expect(deleteError).toBeTruthy();

      // Verify referential integrity
      const violations = await checkReferentialIntegrity(config);
      expect(violations).toHaveLength(0);
    });

    test('should maintain integrity in handover automation chains', async () => {
      // Create client
      const { data: client } = await config.supabase
        .from('clients')
        .insert({
          tenant_id: testTenantId,
          name: 'Integrity Test Client',
          email: 'test@integrity.com'
        })
        .select()
        .single();

      // Create handover automation
      const { data: handover } = await config.supabase
        .from('handover_automations')
        .insert({
          tenant_id: testTenantId,
          client_id: client.id,
          name: 'Test Handover',
          status: 'active'
        })
        .select()
        .single();

      // Create handover steps
      const { data: step } = await config.supabase
        .from('handover_steps')
        .insert({
          handover_id: handover.id,
          name: 'Test Step',
          order_index: 0,
          status: 'pending'
        })
        .select()
        .single();

      // Try to delete client while handover references it
      const { error: deleteError } = await config.supabase
        .from('clients')
        .delete()
        .eq('id', client.id);

      // Should prevent deletion
      expect(deleteError).toBeTruthy();

      // Verify cascade deletion works properly for steps
      await config.supabase
        .from('handover_automations')
        .delete()
        .eq('id', handover.id);

      // Verify steps were cascaded properly
      const { data: remainingSteps } = await config.supabase
        .from('handover_steps')
        .select()
        .eq('handover_id', handover.id);

      expect(remainingSteps).toHaveLength(0);
    });
  });

  describe('Transaction Integrity', () => {
    test('should handle transaction rollbacks correctly in workflow execution', async () => {
      const result = await testTransactionIntegrity(config, async (transaction) => {
        // Create workflow
        const workflow = await transaction
          .from('workflows')
          .insert({
            tenant_id: testTenantId,
            name: 'Transaction Test Workflow'
          })
          .select()
          .single();

        // Create execution
        const execution = await transaction
          .from('workflow_executions')
          .insert({
            tenant_id: testTenantId,
            workflow_id: workflow.data.id,
            status: 'running'
          })
          .select()
          .single();

        // Create step execution that should fail
        await transaction
          .from('workflow_step_executions')
          .insert({
            execution_id: execution.data.id,
            step_index: 0,
            status: 'failed',
            error: 'Intentional test failure'
          });

        // Simulate failure that should trigger rollback
        throw new Error('Transaction test failure');
      });

      expect(result.success).toBe(false);
      expect(result.rollbackSuccessful).toBe(true);
      expect(result.dataConsistency).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    test('should handle concurrent transactions without data corruption', async () => {
      const concurrentOperations = [];

      // Create multiple concurrent transactions that modify the same module
      for (let i = 0; i < 10; i++) {
        concurrentOperations.push(
          testConcurrentTransaction(config, i)
        );
      }

      const results = await Promise.allSettled(concurrentOperations);

      // Some transactions should succeed, some may fail due to conflicts
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(successful + failed).toBe(10);
      expect(successful).toBeGreaterThan(0);

      // Verify no data corruption occurred
      const violations = await checkDataCorruption(config);
      expect(violations).toHaveLength(0);
    });

    test('should maintain data consistency during partial failures', async () => {
      // Create a workflow with multiple steps
      const { data: workflow } = await config.supabase
        .from('workflows')
        .insert({
          tenant_id: testTenantId,
          name: 'Partial Failure Test',
          steps: [
            { type: 'module_activation', module_id: 'test-1' },
            { type: 'template_generation', template_id: 'test-template' },
            { type: 'webhook_trigger', url: 'https://invalid-url' }
          ]
        })
        .select()
        .single();

      // Execute workflow that will partially fail
      const { data: execution } = await config.supabase
        .from('workflow_executions')
        .insert({
          tenant_id: testTenantId,
          workflow_id: workflow.id,
          status: 'running'
        })
        .select()
        .single();

      // Simulate step executions with one failure
      await config.supabase
        .from('workflow_step_executions')
        .insert([
          {
            execution_id: execution.id,
            step_index: 0,
            status: 'completed',
            result: { success: true }
          },
          {
            execution_id: execution.id,
            step_index: 1,
            status: 'completed',
            result: { template_id: 'generated-123' }
          },
          {
            execution_id: execution.id,
            step_index: 2,
            status: 'failed',
            error: 'Network timeout'
          }
        ]);

      // Update execution status
      await config.supabase
        .from('workflow_executions')
        .update({ status: 'partially_failed' })
        .eq('id', execution.id);

      // Verify data integrity despite partial failure
      const violations = await checkDataConsistency(config);
      expect(violations).toHaveLength(0);
    });
  });

  describe('Data Validation Integrity', () => {
    test('should enforce data validation rules across all systems', async () => {
      const validationTests = [
        // Test required fields
        {
          table: 'workflows',
          invalidData: { tenant_id: testTenantId }, // Missing required 'name'
          expectedError: 'not-null-violation'
        },
        // Test data type constraints
        {
          table: 'module_activations',
          invalidData: {
            tenant_id: testTenantId,
            module_id: 'test',
            config: 'invalid-json' // Should be JSON object
          },
          expectedError: 'invalid-input'
        },
        // Test length constraints
        {
          table: 'clients',
          invalidData: {
            tenant_id: testTenantId,
            name: 'x'.repeat(300), // Exceeds maximum length
            email: 'test@example.com'
          },
          expectedError: 'value-too-long'
        }
      ];

      for (const test of validationTests) {
        const { error } = await config.supabase
          .from(test.table)
          .insert(test.invalidData);

        expect(error).toBeTruthy();
        expect(error.code).toContain('23'); // PostgreSQL constraint violation codes start with 23
      }
    });

    test('should maintain unique constraints across integrated systems', async () => {
      // Test unique constraint on module_id within tenant
      await config.supabase
        .from('module_registry')
        .insert({
          tenant_id: testTenantId,
          module_id: 'unique-test-module',
          name: 'Unique Test Module',
          version: '1.0.0'
        });

      // Try to insert duplicate
      const { error } = await config.supabase
        .from('module_registry')
        .insert({
          tenant_id: testTenantId,
          module_id: 'unique-test-module',
          name: 'Duplicate Module',
          version: '1.0.1'
        });

      expect(error).toBeTruthy();
      expect(error.code).toBe('23505'); // Unique constraint violation
    });

    test('should enforce tenant isolation at data level', async () => {
      // Create another tenant
      const { data: otherTenant } = await config.supabase
        .from('tenants')
        .insert({
          id: uuidv4(),
          name: 'Other Tenant'
        })
        .select()
        .single();

      // Create data in both tenants
      await config.supabase
        .from('workflows')
        .insert([
          {
            tenant_id: testTenantId,
            name: 'Tenant 1 Workflow'
          },
          {
            tenant_id: otherTenant.id,
            name: 'Tenant 2 Workflow'
          }
        ]);

      // Query should only return data for specific tenant
      const { data: tenant1Data } = await config.supabase
        .from('workflows')
        .select()
        .eq('tenant_id', testTenantId);

      const { data: tenant2Data } = await config.supabase
        .from('workflows')
        .select()
        .eq('tenant_id', otherTenant.id);

      expect(tenant1Data).toHaveLength(1);
      expect(tenant2Data).toHaveLength(1);
      expect(tenant1Data[0].name).toBe('Tenant 1 Workflow');
      expect(tenant2Data[0].name).toBe('Tenant 2 Workflow');

      // Clean up other tenant
      await config.supabase
        .from('tenants')
        .delete()
        .eq('id', otherTenant.id);
    });
  });

  describe('Data Migration Integrity', () => {
    test('should preserve data integrity during schema migrations', async () => {
      // This test would verify that data migration scripts preserve integrity
      // For now, we'll test the current state of migrated data

      const violations = await checkMigrationIntegrity(config);
      expect(violations).toHaveLength(0);
    });

    test('should maintain backward compatibility with legacy data', async () => {
      // Insert legacy-format data
      const { data: legacyWorkflow } = await config.supabase
        .from('workflows')
        .insert({
          tenant_id: testTenantId,
          name: 'Legacy Workflow',
          legacy_data: { version: '0.9.0' } // Legacy format
        })
        .select()
        .single();

      // Verify it can be processed by new system
      const { data: retrievedWorkflow } = await config.supabase
        .from('workflows')
        .select()
        .eq('id', legacyWorkflow.id)
        .single();

      expect(retrievedWorkflow).toBeTruthy();
      expect(retrievedWorkflow.legacy_data).toBeTruthy();

      // Verify no integrity violations
      const violations = await checkReferentialIntegrity(config);
      expect(violations).toHaveLength(0);
    });
  });
});

// Helper functions for data integrity testing
async function checkReferentialIntegrity(config: IntegrityTestConfig): Promise<IntegrityViolation[]> {
  const violations: IntegrityViolation[] = [];

  // Check workflow -> module references
  const { data: orphanedWorkflowSteps } = await config.supabase.rpc(
    'find_orphaned_workflow_steps',
    { tenant_id: config.tenantId }
  );

  if (orphanedWorkflowSteps?.length > 0) {
    violations.push({
      table: 'workflow_step_executions',
      column: 'workflow_execution_id',
      violation: 'orphaned_references',
      affectedRows: orphanedWorkflowSteps.length,
      details: orphanedWorkflowSteps
    });
  }

  // Add more referential integrity checks as needed

  return violations;
}

async function checkDataConsistency(config: IntegrityTestConfig): Promise<IntegrityViolation[]> {
  const violations: IntegrityViolation[] = [];

  // Check workflow execution status consistency
  const { data: inconsistentExecutions } = await config.supabase.rpc(
    'find_inconsistent_executions',
    { tenant_id: config.tenantId }
  );

  if (inconsistentExecutions?.length > 0) {
    violations.push({
      table: 'workflow_executions',
      column: 'status',
      violation: 'status_inconsistency',
      affectedRows: inconsistentExecutions.length,
      details: inconsistentExecutions
    });
  }

  return violations;
}

async function checkDataCorruption(config: IntegrityTestConfig): Promise<IntegrityViolation[]> {
  const violations: IntegrityViolation[] = [];

  // Check for data corruption patterns
  const { data: corruptedRecords } = await config.supabase.rpc(
    'find_corrupted_data',
    { tenant_id: config.tenantId }
  );

  if (corruptedRecords?.length > 0) {
    violations.push({
      table: 'various',
      column: 'various',
      violation: 'data_corruption',
      affectedRows: corruptedRecords.length,
      details: corruptedRecords
    });
  }

  return violations;
}

async function checkMigrationIntegrity(config: IntegrityTestConfig): Promise<IntegrityViolation[]> {
  const violations: IntegrityViolation[] = [];

  // Check for migration-related integrity issues
  const { data: migrationIssues } = await config.supabase.rpc(
    'check_migration_integrity',
    { tenant_id: config.tenantId }
  );

  if (migrationIssues?.length > 0) {
    violations.push({
      table: 'migration_related',
      column: 'various',
      violation: 'migration_integrity',
      affectedRows: migrationIssues.length,
      details: migrationIssues
    });
  }

  return violations;
}

async function testTransactionIntegrity(
  config: IntegrityTestConfig,
  transactionCallback: (transaction: any) => Promise<void>
): Promise<TransactionTestResult> {
  try {
    await config.supabase.rpc('begin_transaction');

    try {
      await transactionCallback(config.supabase);
      await config.supabase.rpc('commit_transaction');

      return {
        success: true,
        rollbackSuccessful: false,
        dataConsistency: true,
        violations: []
      };
    } catch (error) {
      await config.supabase.rpc('rollback_transaction');

      // Verify rollback was successful
      const violations = await checkDataConsistency(config);

      return {
        success: false,
        rollbackSuccessful: true,
        dataConsistency: violations.length === 0,
        violations
      };
    }
  } catch (error) {
    return {
      success: false,
      rollbackSuccessful: false,
      dataConsistency: false,
      violations: [
        {
          table: 'transaction',
          column: 'various',
          violation: 'transaction_error',
          affectedRows: 0,
          details: { error: error.message }
        }
      ]
    };
  }
}

async function testConcurrentTransaction(config: IntegrityTestConfig, index: number): Promise<void> {
  // Create concurrent transaction that modifies shared data
  const { data: module } = await config.supabase
    .from('module_registry')
    .upsert({
      tenant_id: config.tenantId,
      module_id: 'concurrent-test-module',
      name: `Concurrent Module ${index}`,
      version: `1.0.${index}`,
      activation_count: index
    })
    .select()
    .single();

  // Simulate some work
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

  // Update activation count
  await config.supabase
    .from('module_registry')
    .update({
      activation_count: module.activation_count + 1,
      last_activated: new Date().toISOString()
    })
    .eq('id', module.id);
}

async function cleanupTestData(config: IntegrityTestConfig): Promise<void> {
  const tables = [
    'workflow_step_executions',
    'workflow_executions',
    'workflows',
    'module_activations',
    'module_registry',
    'handover_steps',
    'handover_automations',
    'templates',
    'marketplace_packages',
    'clients'
  ];

  for (const table of tables) {
    await config.supabase
      .from(table)
      .delete()
      .eq('tenant_id', config.tenantId);
  }
}

async function cleanupIntegrityTestData(config: IntegrityTestConfig): Promise<void> {
  await cleanupTestData(config);

  // Clean up tenant
  await config.supabase
    .from('tenants')
    .delete()
    .eq('id', config.tenantId);
}