/**
 * Platform Integration Testing Suite
 * Comprehensive tests for cross-module integration and platform cohesion
 */

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { platformIntegration, PlatformIntegrationEngine, ModuleBridge } from '@/lib/platform/integration-engine';
import { unifiedArchitecture } from '@/lib/platform/unified-architecture';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/auth/permissions');

describe('Platform Integration Tests', () => {
  let integrationEngine: PlatformIntegrationEngine;

  beforeEach(() => {
    integrationEngine = new PlatformIntegrationEngine();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Module Registration and Initialization', () => {
    test('should register module successfully', async () => {
      const mockModule = {
        id: 'test-module',
        name: 'Test Module',
        version: '1.0.0',
        dependencies: [],
        apis: [
          {
            endpoint: '/api/test',
            method: 'GET' as const,
            description: 'Test endpoint',
            auth: true
          }
        ],
        events: [
          {
            name: 'test:event',
            description: 'Test event',
            payload: { test: 'data' }
          }
        ],
        config: {
          required: { apiKey: 'string' },
          optional: { debug: 'boolean' },
          defaults: { debug: false }
        }
      };

      await expect(integrationEngine.registerModule(mockModule)).resolves.not.toThrow();

      const registeredModules = integrationEngine.getRegisteredModules();
      expect(registeredModules).toHaveLength(1);
      expect(registeredModules[0].id).toBe('test-module');
    });

    test('should fail to register module with invalid definition', async () => {
      const invalidModule = {
        id: '',
        name: 'Invalid Module',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await expect(integrationEngine.registerModule(invalidModule))
        .rejects.toThrow('Module must have id, name, and version');
    });

    test('should prevent duplicate module registration', async () => {
      const mockModule = {
        id: 'duplicate-test',
        name: 'Duplicate Test',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(mockModule);

      await expect(integrationEngine.registerModule(mockModule))
        .rejects.toThrow('Module duplicate-test already registered');
    });

    test('should validate dependencies before registration', async () => {
      const dependentModule = {
        id: 'dependent-module',
        name: 'Dependent Module',
        version: '1.0.0',
        dependencies: ['non-existent-module'],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await expect(integrationEngine.registerModule(dependentModule))
        .rejects.toThrow('Dependency non-existent-module not found');
    });
  });

  describe('Cross-Module Communication', () => {
    test('should create module bridge successfully', async () => {
      const sourceModule = {
        id: 'source-module',
        name: 'Source Module',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      const targetModule = {
        id: 'target-module',
        name: 'Target Module',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(sourceModule);
      await integrationEngine.registerModule(targetModule);

      const bridge = integrationEngine.createModuleBridge('source-module', 'target-module');
      expect(bridge).toBeInstanceOf(ModuleBridge);
    });

    test('should handle event communication between modules', async () => {
      const eventReceived = jest.fn();

      // Setup modules and bridge
      const sourceModule = {
        id: 'event-source',
        name: 'Event Source',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [{ name: 'data:updated', description: 'Data updated', payload: {} }],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(sourceModule);

      // Listen for events
      integrationEngine.onPlatformEvent('event-source:data:updated', eventReceived);

      // Broadcast event
      integrationEngine.broadcastEvent('data:updated', { test: 'payload' });

      // Verify event was received
      expect(eventReceived).toHaveBeenCalledWith({ test: 'payload' });
    });
  });

  describe('Integration Health Monitoring', () => {
    test('should validate module compatibility', async () => {
      const testModule = {
        id: 'health-test-module',
        name: 'Health Test Module',
        version: '1.0.0',
        dependencies: [],
        apis: [
          {
            endpoint: '/api/health-test',
            method: 'GET' as const,
            description: 'Health test endpoint',
            auth: true
          }
        ],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(testModule);

      const health = await integrationEngine.validateCompatibility('health-test-module');

      expect(health).toMatchObject({
        moduleId: 'health-test-module',
        status: expect.any(String),
        compatibility: expect.any(Number),
        lastCheck: expect.any(Date),
        issues: expect.any(Array)
      });
    });

    test('should detect compatibility issues', async () => {
      const moduleWithIssues = {
        id: 'problematic-module',
        name: 'Problematic Module',
        version: '1.0.0',
        dependencies: ['missing-dependency'],
        apis: [
          {
            endpoint: '/deprecated/old-api',
            method: 'GET' as const,
            description: 'Deprecated API',
            auth: false
          }
        ],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      // This should fail during registration due to missing dependency
      await expect(integrationEngine.registerModule(moduleWithIssues))
        .rejects.toThrow();
    });

    test('should track integration health across modules', () => {
      const healthData = integrationEngine.getIntegrationHealth();
      expect(Array.isArray(healthData)).toBe(true);
    });
  });

  describe('Platform Architecture Integration', () => {
    test('should integrate with unified architecture system', () => {
      const architectureOverview = unifiedArchitecture.getArchitectureOverview();

      expect(architectureOverview).toMatchObject({
        layers: expect.any(Array),
        components: expect.any(Array),
        dataFlows: expect.any(Array),
        healthScore: expect.any(Number)
      });

      expect(architectureOverview.layers.length).toBeGreaterThan(0);
      expect(architectureOverview.components.length).toBeGreaterThan(0);
    });

    test('should validate architecture integrity', () => {
      const validation = unifiedArchitecture.validateArchitecture();

      expect(validation).toMatchObject({
        isValid: expect.any(Boolean),
        issues: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });

    test('should detect component dependencies', () => {
      const dependencies = unifiedArchitecture.getComponentDependencies('ai-generator');
      expect(Array.isArray(dependencies)).toBe(true);
    });

    test('should provide critical path analysis', () => {
      const criticalPath = unifiedArchitecture.getCriticalPath();

      expect(criticalPath).toMatchObject({
        path: expect.any(Array),
        bottlenecks: expect.any(Array),
        recommendations: expect.any(Array)
      });
    });
  });

  describe('Error Handling and Recovery', () => {
    test('should handle module initialization failures gracefully', async () => {
      const failingModule = {
        id: 'failing-module',
        name: 'Failing Module',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(failingModule);

      // Simulate initialization failure
      const mockFailingInstance = {
        initialize: jest.fn().mockRejectedValue(new Error('Initialization failed'))
      };

      await expect(integrationEngine.initializeModule('failing-module', mockFailingInstance))
        .rejects.toThrow('Initialization failed');

      // Verify health status reflects the failure
      const health = integrationEngine.getIntegrationHealth();
      const moduleHealth = health.find(h => h.moduleId === 'failing-module');
      expect(moduleHealth?.status).toBe('error');
    });

    test('should recover from temporary integration issues', async () => {
      const recoveryModule = {
        id: 'recovery-module',
        name: 'Recovery Module',
        version: '1.0.0',
        dependencies: [],
        apis: [],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(recoveryModule);

      // Simulate error and recovery
      integrationEngine.broadcastEvent('module:error', {
        moduleId: 'recovery-module',
        error: 'Temporary failure'
      });

      let health = await integrationEngine.validateCompatibility('recovery-module');
      expect(health.status).toBe('error');

      // Simulate recovery
      integrationEngine.broadcastEvent('module:recovered', {
        moduleId: 'recovery-module'
      });

      // Re-validate - should show improved health
      health = await integrationEngine.validateCompatibility('recovery-module');
      expect(health.lastCheck).toBeInstanceOf(Date);
    });
  });

  describe('Performance Integration Tests', () => {
    test('should track module performance metrics', () => {
      const performanceData = {
        moduleId: 'test-module',
        metrics: {
          responseTime: 150,
          throughput: 1000,
          errorRate: 0.1,
          uptime: 99.9
        }
      };

      // Listen for performance tracking
      const performanceTracked = jest.fn();
      integrationEngine.on('performance:tracked', performanceTracked);

      // Broadcast performance event
      integrationEngine.broadcastEvent('module:performance', performanceData);

      // Verify performance tracking
      expect(performanceTracked).toHaveBeenCalledWith(
        expect.objectContaining({
          moduleId: 'test-module',
          metrics: performanceData.metrics
        })
      );
    });

    test('should maintain performance under load', async () => {
      const startTime = Date.now();

      // Register multiple modules rapidly
      const modulePromises = Array.from({ length: 10 }, async (_, i) => {
        const module = {
          id: `load-test-module-${i}`,
          name: `Load Test Module ${i}`,
          version: '1.0.0',
          dependencies: [],
          apis: [],
          events: [],
          config: { required: {}, optional: {}, defaults: {} }
        };
        return integrationEngine.registerModule(module);
      });

      await Promise.all(modulePromises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (under 1 second)
      expect(duration).toBeLessThan(1000);

      // All modules should be registered
      const registeredModules = integrationEngine.getRegisteredModules();
      expect(registeredModules.length).toBe(10);
    });
  });

  describe('Security Integration Tests', () => {
    test('should enforce authentication requirements', async () => {
      const secureModule = {
        id: 'secure-module',
        name: 'Secure Module',
        version: '1.0.0',
        dependencies: [],
        apis: [
          {
            endpoint: '/api/secure',
            method: 'POST' as const,
            description: 'Secure endpoint',
            auth: true
          }
        ],
        events: [],
        config: { required: {}, optional: {}, defaults: {} }
      };

      await integrationEngine.registerModule(secureModule);

      const health = await integrationEngine.validateCompatibility('secure-module');
      expect(health.issues).not.toContain(expect.stringMatching(/authentication/i));
    });

    test('should validate data flow security policies', () => {
      const architectureOverview = unifiedArchitecture.getArchitectureOverview();

      // Check that sensitive data flows have proper security
      const authFlows = architectureOverview.dataFlows.filter(flow =>
        flow.source.includes('auth') || flow.target.includes('auth')
      );

      authFlows.forEach(flow => {
        expect(flow.security.encryption).not.toBe('none');
        expect(flow.security.authentication).not.toBe('none');
      });
    });
  });
});

describe('Module Bridge Integration Tests', () => {
  let bridge: ModuleBridge;
  let mockEventBus: any;
  let mockModuleInstances: Map<string, any>;

  beforeEach(() => {
    mockEventBus = {
      emit: jest.fn(),
      on: jest.fn()
    };

    mockModuleInstances = new Map();
    mockModuleInstances.set('target-module', {
      handleAPICall: jest.fn().mockResolvedValue({ success: true }),
      onModuleEvent: jest.fn()
    });

    bridge = new ModuleBridge(
      'source-module',
      'target-module',
      mockEventBus,
      mockModuleInstances
    );
  });

  test('should send events to target module', () => {
    bridge.sendEvent('test:event', { data: 'test' });

    expect(mockEventBus.emit).toHaveBeenCalledWith(
      'target-module:test:event',
      { source: 'source-module', data: 'test' }
    );
  });

  test('should make API calls to target module', async () => {
    const result = await bridge.callAPI('/api/test', { param: 'value' });

    expect(result).toEqual({ success: true });

    const targetInstance = mockModuleInstances.get('target-module');
    expect(targetInstance.handleAPICall).toHaveBeenCalledWith(
      '/api/test',
      { param: 'value' },
      'source-module'
    );
  });

  test('should handle missing target module gracefully', async () => {
    const emptyBridge = new ModuleBridge(
      'source-module',
      'missing-module',
      mockEventBus,
      new Map()
    );

    await expect(emptyBridge.callAPI('/api/test'))
      .rejects.toThrow('Target module missing-module not initialized');
  });

  test('should listen for target module events', () => {
    const callback = jest.fn();
    bridge.onEvent('data:updated', callback);

    expect(mockEventBus.on).toHaveBeenCalledWith(
      'target-module:data:updated',
      callback
    );
  });
});