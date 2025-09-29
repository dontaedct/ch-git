import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { WebhookUnifier, UnifiedWebhookContext } from '@/lib/integration/webhook-unifier';
import { WebhookRouter } from '@/lib/integration/webhook-router';
import { WebhookConsolidator } from '@/lib/integration/webhook-consolidator';

describe('Webhook Integration System', () => {
  let router: WebhookRouter;
  let unifier: WebhookUnifier;
  let consolidator: WebhookConsolidator;

  beforeEach(() => {
    router = new WebhookRouter();
    unifier = new WebhookUnifier(router);
    consolidator = new WebhookConsolidator();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('WebhookRouter', () => {
    it('should register and find routes correctly', () => {
      const mockHandler = vi.fn(async () => NextResponse.json({ success: true }));

      router.registerRoute({
        path: '/api/webhooks/test',
        method: 'POST',
        handler: mockHandler,
        type: 'generic',
        priority: 10
      });

      const route = router.findRoute('/api/webhooks/test', 'POST');

      expect(route).toBeDefined();
      expect(route?.type).toBe('generic');
      expect(route?.priority).toBe(10);
    });

    it('should prioritize routes by priority and match score', () => {
      const lowPriorityHandler = vi.fn(async () => NextResponse.json({ priority: 'low' }));
      const highPriorityHandler = vi.fn(async () => NextResponse.json({ priority: 'high' }));

      router.registerRoute({
        path: '/api/webhooks/test',
        method: 'POST',
        handler: lowPriorityHandler,
        type: 'generic',
        priority: 5
      });

      router.registerRoute({
        path: '/api/webhooks/test',
        method: 'POST',
        handler: highPriorityHandler,
        type: 'orchestration',
        priority: 20
      });

      const route = router.findRoute('/api/webhooks/test', 'POST');

      expect(route?.priority).toBe(20);
      expect(route?.type).toBe('orchestration');
    });

    it('should match routes with event matchers', () => {
      const orchestrationHandler = vi.fn(async () => NextResponse.json({ type: 'orchestration' }));

      router.registerRoute({
        path: '/api/webhooks/generic',
        method: 'POST',
        handler: orchestrationHandler,
        type: 'orchestration',
        priority: 15,
        eventMatcher: (payload: any) => payload.event?.startsWith('workflow.')
      });

      const orchestrationPayload = { event: 'workflow.execution.started' };
      const route = router.findRoute('/api/webhooks/generic', 'POST', orchestrationPayload);

      expect(route?.type).toBe('orchestration');
    });

    it('should return null for non-existent routes', () => {
      const route = router.findRoute('/api/webhooks/nonexistent', 'POST');

      expect(route).toBeNull();
    });

    it('should cache route matches', () => {
      const mockHandler = vi.fn(async () => NextResponse.json({ success: true }));

      router.registerRoute({
        path: '/api/webhooks/cached',
        method: 'POST',
        handler: mockHandler,
        type: 'generic',
        priority: 10
      });

      router.findRoute('/api/webhooks/cached', 'POST');
      const cachedRoute = router.findRoute('/api/webhooks/cached', 'POST');

      expect(cachedRoute).toBeDefined();

      const stats = router.getStats();
      expect(stats.cacheSize).toBeGreaterThan(0);
    });

    it('should unregister routes correctly', () => {
      const mockHandler = vi.fn(async () => NextResponse.json({ success: true }));

      router.registerRoute({
        path: '/api/webhooks/removable',
        method: 'POST',
        handler: mockHandler,
        type: 'generic',
        priority: 10
      });

      expect(router.findRoute('/api/webhooks/removable', 'POST')).toBeDefined();

      router.unregisterRoute('/api/webhooks/removable', 'POST');

      expect(router.findRoute('/api/webhooks/removable', 'POST')).toBeNull();
    });
  });

  describe('WebhookUnifier', () => {
    it('should route requests to registered handlers', async () => {
      const mockHandler = vi.fn(async (context: UnifiedWebhookContext) => {
        return NextResponse.json({
          success: true,
          eventId: context.eventId
        });
      });

      unifier.registerRoute('/api/webhooks/unified-test', 'POST', mockHandler, {
        type: 'generic',
        priority: 10
      });

      const testPayload = { test: 'data' };
      const request = new NextRequest('http://localhost:3000/api/webhooks/unified-test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(testPayload)
      });

      const result = await unifier.processUnifiedWebhook(request, {
        hmac: {
          headerName: 'X-Test-Signature',
          secretEnv: 'TEST_SECRET'
        },
        idempotency: {
          namespace: 'test',
          ttlSeconds: 3600
        }
      });

      expect(mockHandler).toHaveBeenCalled();
    });

    it('should return 404 for unregistered routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/unknown', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({ test: 'data' })
      });

      const result = await unifier.processUnifiedWebhook(request);

      const responseData = await result.json();
      expect(result.status).toBe(404);
      expect(responseData.success).toBe(false);
    });

    it('should include metadata in unified context', async () => {
      let capturedContext: UnifiedWebhookContext | null = null;

      const mockHandler = vi.fn(async (context: UnifiedWebhookContext) => {
        capturedContext = context;
        return NextResponse.json({ success: true });
      });

      unifier.registerRoute('/api/webhooks/metadata-test', 'POST', mockHandler);

      const request = new NextRequest('http://localhost:3000/api/webhooks/metadata-test', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'test-agent'
        },
        body: JSON.stringify({ test: 'data' })
      });

      await unifier.processUnifiedWebhook(request);

      expect(capturedContext).toBeDefined();
      expect(capturedContext?.metadata).toBeDefined();
      expect(capturedContext?.metadata.path).toBe('/api/webhooks/metadata-test');
      expect(capturedContext?.metadata.method).toBe('POST');
      expect(capturedContext?.metadata.userAgent).toBe('test-agent');
    });
  });

  describe('WebhookConsolidator', () => {
    it('should track webhook request metrics', async () => {
      await consolidator.trackWebhookRequest({
        eventId: 'evt_test_123',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: true,
        responseTime: 150,
        timestamp: new Date()
      });

      const metrics = consolidator.getConsolidatedMetrics();

      expect(metrics.totalRequests).toBe(1);
      expect(metrics.successfulRequests).toBe(1);
      expect(metrics.failedRequests).toBe(0);
      expect(metrics.requestsByType.generic).toBe(1);
    });

    it('should track webhook delivery metrics', async () => {
      await consolidator.trackWebhookDelivery({
        eventId: 'evt_delivery_456',
        eventType: 'test.webhook',
        endpoint: 'https://example.com/webhook',
        success: true,
        responseTime: 250,
        statusCode: 200,
        retryCount: 0,
        timestamp: new Date()
      });

      const metrics = consolidator.getConsolidatedMetrics();

      expect(metrics.totalDeliveries).toBe(1);
      expect(metrics.successfulDeliveries).toBe(1);
      expect(metrics.deliveriesByEndpoint['https://example.com/webhook']).toBeDefined();
      expect(metrics.deliveriesByEndpoint['https://example.com/webhook'].successful).toBe(1);
    });

    it('should calculate average response times correctly', async () => {
      await consolidator.trackWebhookRequest({
        eventId: 'evt_1',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: true,
        responseTime: 100,
        timestamp: new Date()
      });

      await consolidator.trackWebhookRequest({
        eventId: 'evt_2',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: true,
        responseTime: 200,
        timestamp: new Date()
      });

      const metrics = consolidator.getConsolidatedMetrics();

      expect(metrics.avgResponseTime).toBe(150);
    });

    it('should track failed requests separately', async () => {
      await consolidator.trackWebhookRequest({
        eventId: 'evt_fail_1',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: false,
        responseTime: 100,
        timestamp: new Date(),
        error: 'Test error'
      });

      const metrics = consolidator.getConsolidatedMetrics();
      const errorMetrics = consolidator.getErrorMetrics();

      expect(metrics.failedRequests).toBe(1);
      expect(errorMetrics.requests.length).toBe(1);
      expect(errorMetrics.requests[0].error).toBe('Test error');
    });

    it('should provide health status based on metrics', async () => {
      await consolidator.trackWebhookRequest({
        eventId: 'evt_health_1',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: true,
        responseTime: 50,
        timestamp: new Date()
      });

      const health = consolidator.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.requestSuccessRate).toBe(100);
      expect(health.issues.length).toBe(0);
    });

    it('should detect degraded status with high failure rate', async () => {
      for (let i = 0; i < 10; i++) {
        await consolidator.trackWebhookRequest({
          eventId: `evt_degraded_${i}`,
          eventType: 'test.webhook',
          path: '/api/webhooks/test',
          method: 'POST',
          handlerType: 'generic',
          success: i < 9,
          responseTime: 100,
          timestamp: new Date()
        });
      }

      const health = consolidator.getHealthStatus();

      expect(health.requestSuccessRate).toBeLessThan(95);
      expect(health.status).toBe('degraded');
      expect(health.issues.length).toBeGreaterThan(0);
    });

    it('should reset metrics correctly', async () => {
      await consolidator.trackWebhookRequest({
        eventId: 'evt_reset_1',
        eventType: 'test.webhook',
        path: '/api/webhooks/test',
        method: 'POST',
        handlerType: 'generic',
        success: true,
        responseTime: 100,
        timestamp: new Date()
      });

      let metrics = consolidator.getConsolidatedMetrics();
      expect(metrics.totalRequests).toBe(1);

      await consolidator.resetMetrics();

      metrics = consolidator.getConsolidatedMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.successfulRequests).toBe(0);
      expect(metrics.failedRequests).toBe(0);
    });
  });

  describe('End-to-End Integration', () => {
    it('should handle complete webhook flow with routing and metrics', async () => {
      const orchestrationHandler = vi.fn(async (context: UnifiedWebhookContext) => {
        await consolidator.trackWebhookRequest({
          eventId: context.eventId,
          eventType: 'workflow.execution.started',
          path: context.metadata.path,
          method: context.metadata.method,
          handlerType: 'orchestration',
          success: true,
          responseTime: 150,
          timestamp: new Date()
        });

        return NextResponse.json({
          success: true,
          type: 'orchestration',
          eventId: context.eventId
        });
      });

      unifier.registerRoute('/api/webhooks/orchestration', 'POST', orchestrationHandler, {
        type: 'orchestration',
        priority: 20
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/orchestration', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          event: 'workflow.execution.started',
          workflowId: 'wf_123',
          executionId: 'exec_456'
        })
      });

      await unifier.processUnifiedWebhook(request);

      expect(orchestrationHandler).toHaveBeenCalled();

      const metrics = consolidator.getConsolidatedMetrics();
      expect(metrics.totalRequests).toBeGreaterThan(0);
      expect(metrics.requestsByType.orchestration).toBeGreaterThan(0);
    });

    it('should handle multiple webhook types with correct routing', async () => {
      const orchestrationHandler = vi.fn(async () => NextResponse.json({ type: 'orchestration' }));
      const automationHandler = vi.fn(async () => NextResponse.json({ type: 'automation' }));
      const genericHandler = vi.fn(async () => NextResponse.json({ type: 'generic' }));

      unifier.registerRoute('/api/webhooks/orchestration', 'POST', orchestrationHandler, {
        type: 'orchestration',
        priority: 20
      });

      unifier.registerRoute('/api/webhooks/automation', 'POST', automationHandler, {
        type: 'automation',
        priority: 15
      });

      unifier.registerRoute('/api/webhooks/generic', 'POST', genericHandler, {
        type: 'generic',
        priority: 10
      });

      const orchestrationReq = new NextRequest('http://localhost:3000/api/webhooks/orchestration', {
        method: 'POST',
        body: JSON.stringify({ event: 'workflow.started' })
      });

      const automationReq = new NextRequest('http://localhost:3000/api/webhooks/automation', {
        method: 'POST',
        body: JSON.stringify({ action: 'trigger' })
      });

      await unifier.processUnifiedWebhook(orchestrationReq);
      await unifier.processUnifiedWebhook(automationReq);

      expect(orchestrationHandler).toHaveBeenCalledTimes(1);
      expect(automationHandler).toHaveBeenCalledTimes(1);
      expect(genericHandler).not.toHaveBeenCalled();
    });
  });
});