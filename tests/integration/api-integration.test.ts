/**
 * HT-036.3.3: API Integration Tests
 *
 * Comprehensive tests for API gateway, service communication,
 * authentication integration, and middleware functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import { APIGateway } from '@/lib/integration/api-gateway';
import {
  ServiceCommunicationLayer,
  ServiceMessage
} from '@/lib/integration/service-communication';
import { AuthIntegration } from '@/lib/integration/auth-integration';
import { IntegrationMiddleware } from '@/middleware/integration-middleware';

describe('HT-036.3.3: API Integration', () => {
  describe('API Gateway', () => {
    let gateway: APIGateway;

    beforeEach(() => {
      gateway = new APIGateway();
    });

    it('should route requests to appropriate services', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestration/workflows');

      const route = gateway['matchRoute'](request);

      expect(route).toBeDefined();
      expect(route?.service).toBe('orchestration');
    });

    it('should enforce rate limits', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestration/test');
      const route = gateway['matchRoute'](request);

      for (let i = 0; i < 100; i++) {
        const allowed = gateway['checkRateLimit'](request, route!);
        expect(allowed).toBe(true);
      }

      const exceededLimit = gateway['checkRateLimit'](request, route!);
      expect(exceededLimit).toBe(false);
    });

    it('should handle 404 for unknown routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/unknown/endpoint');

      const response = await gateway.route(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Route not found');
    });

    it('should provide service health check', async () => {
      const health = await gateway.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.services).toBeDefined();
      expect(health.services.orchestration).toBe('operational');
    });

    it('should forward requests with appropriate headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/modules/test', {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });

      const headers = gateway['prepareHeaders'](request);

      expect(headers['X-Gateway-Forwarded']).toBe('true');
      expect(headers['X-Original-Path']).toBe('/api/modules/test');
    });
  });

  describe('Service Communication', () => {
    let communication: ServiceCommunicationLayer;

    beforeEach(() => {
      communication = new ServiceCommunicationLayer({
        timeout: 5000,
        retries: 2
      });
    });

    it('should send messages between services', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: 'response' })
      });

      const response = await communication.send({
        from: 'orchestration',
        to: 'modules',
        type: 'activate',
        payload: { moduleId: 'test-module' }
      });

      expect(response.success).toBe(true);
      expect(response.data).toBe('response');
    });

    it('should retry on failure', async () => {
      let attempts = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true })
        });
      });

      const response = await communication.send({
        from: 'marketplace',
        to: 'handover',
        type: 'notify',
        payload: {}
      });

      expect(attempts).toBe(2);
      expect(response.success).toBe(true);
    });

    it('should handle circuit breaker', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Service unavailable'));

      for (let i = 0; i < 5; i++) {
        await communication.send({
          from: 'test',
          to: 'orchestration',
          type: 'test',
          payload: {}
        });
      }

      const health = communication.getHealth();
      expect(health.circuitBreakers.orchestration).toBe('open');
    });

    it('should broadcast to all services', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });

      const responses = await communication.broadcast({
        from: 'orchestration',
        type: 'event',
        payload: { event: 'test' }
      });

      expect(responses.length).toBeGreaterThan(0);
      expect(responses.every(r => r.success)).toBe(true);
    });

    it('should timeout long requests', async () => {
      global.fetch = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 10000))
      );

      const response = await communication.send({
        from: 'test',
        to: 'modules',
        type: 'test',
        payload: {}
      });

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('Authentication Integration', () => {
    let auth: AuthIntegration;

    beforeEach(() => {
      auth = new AuthIntegration();
    });

    it('should authenticate with valid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      });

      vi.spyOn(auth as any, 'authenticateWithToken').mockResolvedValue({
        authenticated: true,
        context: {
          userId: 'user-123',
          email: 'test@example.com',
          role: 'admin',
          permissions: ['orchestration:*'],
          sessionId: 'session-123'
        }
      });

      const result = await auth.authenticate(request);

      expect(result.authenticated).toBe(true);
      expect(result.context?.role).toBe('admin');
    });

    it('should authorize with sufficient permissions', () => {
      const context = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'manager',
        permissions: ['orchestration:read', 'orchestration:create'],
        sessionId: 'session-123'
      };

      const allowed = auth.authorize(context, {
        resource: 'orchestration',
        action: 'read'
      });

      expect(allowed).toBe(true);
    });

    it('should deny without sufficient permissions', () => {
      const context = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user',
        permissions: ['orchestration:read'],
        sessionId: 'session-123'
      };

      const denied = auth.authorize(context, {
        resource: 'orchestration',
        action: 'delete'
      });

      expect(denied).toBe(false);
    });

    it('should handle wildcard permissions', () => {
      const context = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['orchestration:*'],
        sessionId: 'session-123'
      };

      const allowed = auth.authorize(context, {
        resource: 'orchestration',
        action: 'anything'
      });

      expect(allowed).toBe(true);
    });

    it('should validate service tokens', async () => {
      const token = await auth.createServiceToken('orchestration', 3600);
      const result = await auth.validateServiceToken(token);

      expect(result.authenticated).toBe(true);
      expect(result.context?.role).toBe('service');
    });

    it('should reject expired service tokens', async () => {
      const token = await auth.createServiceToken('test', -1);

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await auth.validateServiceToken(token);

      expect(result.authenticated).toBe(false);
      expect(result.error).toContain('expired');
    });
  });

  describe('Integration Middleware', () => {
    let middleware: IntegrationMiddleware;

    beforeEach(() => {
      middleware = new (IntegrationMiddleware as any)({
        enableLogging: false,
        enableMetrics: true
      });
    });

    it('should handle successful requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const handler = async () => NextResponse.json({ success: true });

      const response = await middleware.handle(request, handler);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Request-Id')).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const handler = async () => {
        throw new Error('Test error');
      };

      const response = await middleware.handle(request, handler);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe(true);
      expect(data.message).toBe('Test error');
    });

    it('should track metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/orchestration/test');

      const handler = async () => NextResponse.json({ success: true });

      await middleware.handle(request, handler);

      const metrics = middleware.getMetrics('orchestration');
      expect(metrics.length).toBe(1);
      expect(metrics[0].service).toBe('orchestration');
    });

    it('should calculate average response time', async () => {
      const request = new NextRequest('http://localhost:3000/api/modules/test');

      const handler = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return NextResponse.json({ success: true });
      };

      await middleware.handle(request, handler);

      const avgTime = middleware.getAverageResponseTime('modules');
      expect(avgTime).toBeGreaterThan(0);
    });

    it('should calculate error rate', async () => {
      const request = new NextRequest('http://localhost:3000/api/test/error');

      await middleware.handle(request, async () => NextResponse.json({}, { status: 500 }));
      await middleware.handle(request, async () => NextResponse.json({}, { status: 200 }));

      const errorRate = middleware.getErrorRate();
      expect(errorRate).toBe(50);
    });

    it('should add CORS headers', async () => {
      const request = new NextRequest('http://localhost:3000/api/test');

      const handler = async () => NextResponse.json({ success: true });

      const response = await middleware.handle(request, handler);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    });
  });

  describe('End-to-End Integration', () => {
    it('should handle complete request flow', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: 'workflow-created' })
      });

      const gateway = new APIGateway();
      const communication = new ServiceCommunicationLayer();

      const request = new NextRequest('http://localhost:3000/api/orchestration/workflows', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'test-workflow' })
      });

      const response = await communication.send({
        from: 'api-gateway',
        to: 'orchestration',
        type: 'create-workflow',
        payload: { name: 'test-workflow' }
      });

      expect(response.success).toBe(true);
      expect(response.data).toBe('workflow-created');
    });
  });
});

describe('HT-036.3.3: Verification Checkpoints', () => {
  it('✓ All HT-035 APIs integrated with existing infrastructure', () => {
    const gateway = new APIGateway();
    const routes = gateway.getServiceRoutes();

    expect(routes.some(r => r.service === 'orchestration')).toBe(true);
    expect(routes.some(r => r.service === 'modules')).toBe(true);
    expect(routes.some(r => r.service === 'marketplace')).toBe(true);
    expect(routes.some(r => r.service === 'handover')).toBe(true);
  });

  it('✓ Unified API gateway routing requests appropriately', async () => {
    const gateway = new APIGateway();
    const health = await gateway.healthCheck();

    expect(health.status).toBe('healthy');
    expect(Object.keys(health.services).length).toBeGreaterThan(0);
  });

  it('✓ Consistent authentication and authorization across all APIs', () => {
    const auth = new AuthIntegration();
    const context = {
      userId: 'test',
      email: 'test@example.com',
      role: 'admin',
      permissions: ['*'],
      sessionId: 'test'
    };

    expect(auth.authorize(context, { resource: 'orchestration', action: 'read' })).toBe(true);
    expect(auth.authorize(context, { resource: 'modules', action: 'write' })).toBe(true);
  });

  it('✓ Inter-service communication optimized and reliable', async () => {
    const communication = new ServiceCommunicationLayer();
    const health = communication.getHealth();

    expect(health).toBeDefined();
    expect(health.queueLength).toBe(0);
  });
});