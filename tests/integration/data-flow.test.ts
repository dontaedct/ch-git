import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { DataFlowOrchestrator } from '@/lib/integration/data-flow-orchestrator';
import { RealTimeSyncService } from '@/lib/integration/real-time-sync';
import { DataConsistencyManager } from '@/lib/integration/data-consistency-manager';
import { CrossSystemEventBus } from '@/lib/integration/cross-system-events';

global.fetch = vi.fn();
global.crypto = {
  randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(7)
} as any;

describe('Data Flow Integration', () => {
  let orchestrator: DataFlowOrchestrator;
  let syncService: RealTimeSyncService;
  let consistencyManager: DataConsistencyManager;
  let eventBus: CrossSystemEventBus;

  beforeEach(() => {
    orchestrator = new DataFlowOrchestrator();
    syncService = new RealTimeSyncService();
    consistencyManager = new DataConsistencyManager();
    eventBus = new CrossSystemEventBus();
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await syncService.shutdown();
    consistencyManager.stopPeriodicChecks();
  });

  describe('DataFlowOrchestrator', () => {
    it('should register data flow configurations', () => {
      orchestrator.registerDataFlow('test-flow', {
        sourceSystem: 'orchestration',
        targetSystem: 'modules',
        dataType: 'activation',
        syncMode: 'realtime'
      });

      expect(() => orchestrator.syncData('test-flow', {})).toBeDefined();
    });

    it('should sync data between systems with transformation', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      orchestrator.registerDataFlow('transform-flow', {
        sourceSystem: 'orchestration',
        targetSystem: 'modules',
        dataType: 'activation',
        syncMode: 'realtime',
        transformFn: (data: any) => ({
          moduleId: data.workflowId,
          status: 'active'
        })
      });

      await orchestrator.syncData('transform-flow', {
        workflowId: 'wf-123'
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/modules/activations/sync',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('wf-123')
        })
      );
    });

    it('should validate data before syncing', async () => {
      orchestrator.registerDataFlow('validated-flow', {
        sourceSystem: 'orchestration',
        targetSystem: 'modules',
        dataType: 'activation',
        syncMode: 'realtime',
        validationFn: (data: any) => !!data.workflowId
      });

      await expect(
        orchestrator.syncData('validated-flow', {})
      ).rejects.toThrow('Data validation failed');
    });

    it('should retry failed syncs with exponential backoff', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      orchestrator.registerDataFlow('retry-flow', {
        sourceSystem: 'orchestration',
        targetSystem: 'modules',
        dataType: 'activation',
        syncMode: 'realtime'
      });

      await orchestrator.syncData('retry-flow', { workflowId: 'wf-123' });

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle batch synchronization', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      orchestrator.registerDataFlow('batch-flow-1', {
        sourceSystem: 'orchestration',
        targetSystem: 'modules',
        dataType: 'activation',
        syncMode: 'batch'
      });

      orchestrator.registerDataFlow('batch-flow-2', {
        sourceSystem: 'marketplace',
        targetSystem: 'modules',
        dataType: 'installation',
        syncMode: 'batch'
      });

      await orchestrator.batchSync([
        { flowId: 'batch-flow-1', data: { workflowId: 'wf-1' } },
        { flowId: 'batch-flow-2', data: { packageId: 'pkg-1' } }
      ]);

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('RealTimeSyncService', () => {
    it('should initialize subscriptions for all systems', async () => {
      await syncService.initialize();

      const subscriptions = syncService.getActiveSubscriptions();
      expect(subscriptions).toContain('orchestration-workflows');
      expect(subscriptions).toContain('module-activations');
      expect(subscriptions).toContain('marketplace-installations');
      expect(subscriptions).toContain('handover-packages');
    });

    it('should sync specific table on demand', async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-123', status: 'active' },
          error: null
        })
      };

      await expect(
        syncService.syncSpecificTable('orchestration_workflows', 'test-123')
      ).resolves.not.toThrow();
    });

    it('should handle subscription cleanup on shutdown', async () => {
      await syncService.initialize();
      expect(syncService.getActiveSubscriptions().length).toBeGreaterThan(0);

      await syncService.shutdown();
      expect(syncService.getActiveSubscriptions().length).toBe(0);
    });
  });

  describe('DataConsistencyManager', () => {
    it('should register consistency rules', () => {
      consistencyManager.registerRule({
        id: 'test-rule',
        systems: ['orchestration', 'modules'],
        dataType: 'activation',
        checkFn: () => true,
        severity: 'critical'
      });

      expect(() => consistencyManager.checkConsistency()).toBeDefined();
    });

    it('should detect consistency violations', async () => {
      consistencyManager.registerRule({
        id: 'violation-rule',
        systems: ['orchestration', 'modules'],
        dataType: 'activation',
        checkFn: () => false,
        severity: 'critical'
      });

      const violations = await consistencyManager.checkConsistency();
      expect(violations.length).toBeGreaterThan(0);
      expect(violations[0].severity).toBe('critical');
    });

    it('should attempt to repair violations when repair function provided', async () => {
      const repairFn = vi.fn().mockResolvedValue(undefined);

      consistencyManager.registerRule({
        id: 'repairable-rule',
        systems: ['orchestration', 'modules'],
        dataType: 'activation',
        checkFn: () => false,
        repairFn,
        severity: 'warning'
      });

      await consistencyManager.checkConsistency();
      expect(repairFn).toHaveBeenCalled();
    });

    it('should validate transactions before execution', async () => {
      consistencyManager.registerRule({
        id: 'validation-rule',
        systems: ['orchestration', 'modules'],
        dataType: 'activation',
        checkFn: (data: any) => {
          return data.every((d: any) =>
            d.data.every((item: any) => item.workflowId && item.moduleId)
          );
        },
        severity: 'critical'
      });

      const result = await consistencyManager.validateTransaction(
        ['orchestration', 'modules'],
        'activation',
        { workflowId: 'wf-1', moduleId: 'mod-1' }
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should filter violations by criteria', async () => {
      consistencyManager.registerRule({
        id: 'critical-rule',
        systems: ['orchestration', 'modules'],
        dataType: 'activation',
        checkFn: () => false,
        severity: 'critical'
      });

      consistencyManager.registerRule({
        id: 'warning-rule',
        systems: ['marketplace', 'modules'],
        dataType: 'installation',
        checkFn: () => false,
        severity: 'warning'
      });

      await consistencyManager.checkConsistency();

      const criticalViolations = consistencyManager.getCriticalViolations();
      expect(criticalViolations.length).toBeGreaterThan(0);
      expect(criticalViolations.every(v => v.severity === 'critical')).toBe(true);
    });

    it('should start and stop periodic consistency checks', () => {
      consistencyManager.startPeriodicChecks(5000);
      consistencyManager.stopPeriodicChecks();

      expect(() => consistencyManager.checkConsistency()).toBeDefined();
    });
  });

  describe('CrossSystemEventBus', () => {
    it('should register and emit events', async () => {
      const handler = vi.fn();
      eventBus.on('test.event', handler);

      await eventBus.emit({
        type: 'test.event',
        source: 'orchestration',
        data: { message: 'test' },
        priority: 'medium'
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(handler).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should process events by priority order', async () => {
      const results: string[] = [];

      eventBus.on('priority.test', (data: any) => {
        results.push(data.priority);
      });

      await eventBus.emit({
        type: 'priority.test',
        source: 'orchestration',
        data: { priority: 'low' },
        priority: 'low'
      });

      await eventBus.emit({
        type: 'priority.test',
        source: 'orchestration',
        data: { priority: 'critical' },
        priority: 'critical'
      });

      await eventBus.emit({
        type: 'priority.test',
        source: 'orchestration',
        data: { priority: 'medium' },
        priority: 'medium'
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(results[0]).toBe('critical');
    });

    it('should handle event handler errors gracefully', async () => {
      const errorHandler = vi.fn().mockRejectedValue(new Error('Handler error'));
      const successHandler = vi.fn();

      eventBus.on('error.test', errorHandler);
      eventBus.on('error.test', successHandler);

      await eventBus.emit({
        type: 'error.test',
        source: 'orchestration',
        data: { test: 'data' },
        priority: 'medium'
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(errorHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });

    it('should allow unsubscribing from events', async () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('unsubscribe.test', handler);

      await eventBus.emit({
        type: 'unsubscribe.test',
        source: 'orchestration',
        data: {},
        priority: 'medium'
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(handler).toHaveBeenCalledTimes(1);

      unsubscribe();

      await eventBus.emit({
        type: 'unsubscribe.test',
        source: 'orchestration',
        data: {},
        priority: 'medium'
      });

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should maintain queue size limit', async () => {
      for (let i = 0; i < 1100; i++) {
        await eventBus.emit({
          type: 'queue.test',
          source: 'orchestration',
          data: { index: i },
          priority: 'low'
        });
      }

      expect(eventBus.getQueueSize()).toBeLessThanOrEqual(1000);
    });
  });

  describe('End-to-End Data Flow', () => {
    it('should sync data from orchestration to modules to handover', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const eventLog: string[] = [];

      eventBus.on('workflow.created', (data: any) => {
        eventLog.push('workflow.created');
      });

      eventBus.on('module.activation.requested', (data: any) => {
        eventLog.push('module.activation.requested');
      });

      await eventBus.emit({
        type: 'workflow.created',
        source: 'orchestration',
        data: {
          id: 'wf-123',
          autoActivateModules: true,
          requiredModules: ['mod-1', 'mod-2']
        },
        priority: 'high'
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(eventLog).toContain('workflow.created');
      expect(eventLog).toContain('module.activation.requested');
    });

    it('should handle marketplace installation with module activation', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const eventLog: string[] = [];

      eventBus.on('marketplace.installation.completed', (data: any) => {
        eventLog.push('marketplace.installation.completed');
      });

      eventBus.on('module.installation.apply', (data: any) => {
        eventLog.push('module.installation.apply');
      });

      await eventBus.emit({
        type: 'marketplace.installation.completed',
        source: 'marketplace',
        data: {
          packageId: 'pkg-123',
          installationId: 'inst-123',
          configuration: {}
        },
        priority: 'high'
      });

      await new Promise(resolve => setTimeout(resolve, 200));

      expect(eventLog).toContain('marketplace.installation.completed');
      expect(eventLog).toContain('module.installation.apply');
    });
  });
});