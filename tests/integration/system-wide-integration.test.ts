/**
 * HT-036.3.4: System-Wide Integration Tests
 *
 * Comprehensive integration testing covering all system interactions
 * between HT-035 modules and existing agency toolkit systems.
 */

import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Test utilities
import { setupTestDatabase, cleanupTestDatabase } from '../utils/test-database';
import { createTestClient, TestClient } from '../utils/test-client';

// Integration modules
import { OrchestrationEngine } from '../../lib/orchestration/engine';
import { ModuleRegistry } from '../../lib/modules/module-registry';
import { MarketplaceService } from '../../lib/marketplace/service';
import { HandoverAutomation } from '../../lib/handover/automation';
import { WebhookEmitter } from '../../lib/webhooks/emitter';
import { TemplateEngine } from '../../lib/template-engine/engine';

// Types
interface SystemHealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  dependencies: string[];
  errors: string[];
}

interface IntegrationTestContext {
  supabase: any;
  testClient: TestClient;
  orchestration: OrchestrationEngine;
  modules: ModuleRegistry;
  marketplace: MarketplaceService;
  handover: HandoverAutomation;
  webhooks: WebhookEmitter;
  templates: TemplateEngine;
}

describe('HT-036.3.4: System-Wide Integration Tests', () => {
  let context: IntegrationTestContext;
  let testTenantId: string;

  beforeAll(async () => {
    // Setup test database and environment
    await setupTestDatabase();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create test tenant
    const { data: tenant } = await supabase
      .from('tenants')
      .insert({ name: 'Integration Test Tenant' })
      .select()
      .single();

    testTenantId = tenant.id;

    // Initialize all integrated systems
    context = {
      supabase,
      testClient: await createTestClient(testTenantId),
      orchestration: new OrchestrationEngine(supabase, testTenantId),
      modules: new ModuleRegistry(supabase, testTenantId),
      marketplace: new MarketplaceService(supabase, testTenantId),
      handover: new HandoverAutomation(supabase, testTenantId),
      webhooks: new WebhookEmitter(supabase, testTenantId),
      templates: new TemplateEngine(supabase, testTenantId)
    };
  }, 30000);

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Clean up any test data between tests
    await context.supabase
      .from('workflow_executions')
      .delete()
      .eq('tenant_id', testTenantId);

    await context.supabase
      .from('module_activations')
      .delete()
      .eq('tenant_id', testTenantId);
  });

  describe('Cross-System Data Flow', () => {
    test('should synchronize data across orchestration and module systems', async () => {
      // Create a workflow that uses modules
      const workflow = await context.orchestration.createWorkflow({
        name: 'Test Integration Workflow',
        description: 'Tests cross-system integration',
        steps: [
          {
            type: 'module_activation',
            module_id: 'test-module',
            config: { enabled: true }
          },
          {
            type: 'template_generation',
            template_id: 'test-template',
            variables: { client_name: 'Test Client' }
          }
        ]
      });

      // Execute workflow and verify data flows correctly
      const execution = await context.orchestration.executeWorkflow(workflow.id);

      // Verify module was activated
      const moduleStatus = await context.modules.getModuleStatus('test-module');
      expect(moduleStatus.enabled).toBe(true);

      // Verify template was processed
      const templateResult = await context.templates.getGenerationResult(execution.id);
      expect(templateResult).toBeDefined();
      expect(templateResult.variables.client_name).toBe('Test Client');
    });

    test('should maintain data consistency during concurrent operations', async () => {
      const promises = [];

      // Simulate concurrent operations across systems
      for (let i = 0; i < 5; i++) {
        promises.push(
          context.orchestration.createWorkflow({
            name: `Concurrent Workflow ${i}`,
            description: 'Concurrent operation test'
          })
        );

        promises.push(
          context.modules.activateModule(`test-module-${i}`, {
            version: '1.0.0',
            config: { test: true }
          })
        );
      }

      const results = await Promise.all(promises);

      // Verify all operations completed successfully
      expect(results.every(result => result !== null)).toBe(true);

      // Verify data consistency
      const workflows = await context.orchestration.listWorkflows();
      const activeModules = await context.modules.listActiveModules();

      expect(workflows.length).toBe(5);
      expect(activeModules.length).toBe(5);
    });
  });

  describe('API Integration Consistency', () => {
    test('should handle authentication consistently across all APIs', async () => {
      const testUser = await context.testClient.createUser({
        email: 'test@example.com',
        password: 'test123'
      });

      // Test authentication across different API endpoints
      const endpoints = [
        '/api/orchestration/workflows',
        '/api/modules/registry',
        '/api/marketplace/packages',
        '/api/handover/automations'
      ];

      for (const endpoint of endpoints) {
        const response = await context.testClient.authenticatedRequest(
          endpoint,
          { method: 'GET' },
          testUser.token
        );

        expect(response.status).not.toBe(401);
        expect(response.status).not.toBe(403);
      }
    });

    test('should enforce rate limiting consistently across APIs', async () => {
      const testUser = await context.testClient.createUser({
        email: 'ratetest@example.com',
        password: 'test123'
      });

      // Make rapid requests to different endpoints
      const rapidRequests = Array(50).fill(null).map((_, i) =>
        context.testClient.authenticatedRequest(
          `/api/orchestration/workflows?page=${i}`,
          { method: 'GET' },
          testUser.token
        )
      );

      const responses = await Promise.allSettled(rapidRequests);

      // Should have some rate limited responses
      const rateLimited = responses.filter(
        r => r.status === 'fulfilled' && r.value.status === 429
      );

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle system failures gracefully', async () => {
      // Simulate database connection failure
      const originalQuery = context.supabase.from;
      context.supabase.from = () => {
        throw new Error('Database connection failed');
      };

      try {
        const result = await context.orchestration.createWorkflow({
          name: 'Failure Test Workflow',
          description: 'Tests error handling'
        });

        // Should handle error gracefully
        expect(result).toBeNull();
      } catch (error) {
        // Error should be handled by the system
        expect(error.message).toContain('temporarily unavailable');
      }

      // Restore database connection
      context.supabase.from = originalQuery;
    });

    test('should recover from partial system failures', async () => {
      // Create a workflow
      const workflow = await context.orchestration.createWorkflow({
        name: 'Recovery Test Workflow',
        description: 'Tests system recovery'
      });

      // Simulate partial failure during execution
      const originalActivate = context.modules.activateModule;
      let callCount = 0;

      context.modules.activateModule = async (...args) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Temporary module activation failure');
        }
        return originalActivate.apply(context.modules, args);
      };

      // Execute workflow with retry logic
      const execution = await context.orchestration.executeWorkflowWithRetry(workflow.id);

      expect(execution.status).toBe('completed');
      expect(execution.retry_count).toBeGreaterThan(0);

      // Restore original function
      context.modules.activateModule = originalActivate;
    });
  });

  describe('Performance Integration', () => {
    test('should maintain performance under integrated system load', async () => {
      const startTime = Date.now();

      // Create multiple workflows with different system interactions
      const workflows = await Promise.all([
        context.orchestration.createWorkflow({
          name: 'Performance Test 1',
          steps: [{ type: 'module_activation', module_id: 'perf-1' }]
        }),
        context.orchestration.createWorkflow({
          name: 'Performance Test 2',
          steps: [{ type: 'template_generation', template_id: 'perf-template' }]
        }),
        context.orchestration.createWorkflow({
          name: 'Performance Test 3',
          steps: [{ type: 'handover_automation', config: { auto_deploy: true } }]
        })
      ]);

      const creationTime = Date.now() - startTime;
      expect(creationTime).toBeLessThan(5000); // Should complete in under 5 seconds

      // Execute workflows concurrently
      const executionStart = Date.now();

      const executions = await Promise.all(
        workflows.map(w => context.orchestration.executeWorkflow(w.id))
      );

      const executionTime = Date.now() - executionStart;
      expect(executionTime).toBeLessThan(10000); // Should complete in under 10 seconds

      // All executions should succeed
      expect(executions.every(e => e.status === 'completed')).toBe(true);
    });
  });

  describe('System Health Monitoring', () => {
    test('should provide comprehensive health status for all systems', async () => {
      const healthChecks = await Promise.all([
        checkSystemHealth('orchestration', context.orchestration),
        checkSystemHealth('modules', context.modules),
        checkSystemHealth('marketplace', context.marketplace),
        checkSystemHealth('handover', context.handover),
        checkSystemHealth('webhooks', context.webhooks),
        checkSystemHealth('templates', context.templates)
      ]);

      // All systems should be healthy
      healthChecks.forEach(health => {
        expect(['healthy', 'degraded']).toContain(health.status);
        expect(health.responseTime).toBeLessThan(2000);
      });

      // No critical errors
      const criticalErrors = healthChecks.flatMap(h => h.errors).filter(e => e.includes('CRITICAL'));
      expect(criticalErrors).toHaveLength(0);
    });
  });
});

// Helper functions
async function checkSystemHealth(serviceName: string, service: any): Promise<SystemHealthCheck> {
  const startTime = Date.now();

  try {
    // Basic health check - try to perform a simple operation
    let healthResult;
    switch (serviceName) {
      case 'orchestration':
        healthResult = await service.getWorkflowCount();
        break;
      case 'modules':
        healthResult = await service.getModuleCount();
        break;
      case 'marketplace':
        healthResult = await service.getPackageCount();
        break;
      default:
        healthResult = await service.healthCheck?.() || { status: 'ok' };
    }

    const responseTime = Date.now() - startTime;

    return {
      service: serviceName,
      status: 'healthy',
      responseTime,
      dependencies: [],
      errors: []
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      service: serviceName,
      status: 'unhealthy',
      responseTime,
      dependencies: [],
      errors: [error.message]
    };
  }
}