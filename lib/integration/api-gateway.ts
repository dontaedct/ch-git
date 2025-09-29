/**
 * HT-036.3.3: Unified API Gateway
 *
 * Central API gateway for routing requests to appropriate services
 * across orchestration, modules, marketplace, and handover systems.
 */

import { NextRequest, NextResponse } from 'next/server';

export interface ServiceRoute {
  service: string;
  path: string;
  method: string;
  handler: string;
  requiresAuth: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
}

export interface GatewayConfig {
  routes: ServiceRoute[];
  defaultTimeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}

const serviceRoutes: ServiceRoute[] = [
  {
    service: 'orchestration',
    path: '/api/orchestration/*',
    method: 'ALL',
    handler: '/api/orchestration',
    requiresAuth: true,
    rateLimit: { requests: 100, window: 60000 }
  },
  {
    service: 'modules',
    path: '/api/modules/*',
    method: 'ALL',
    handler: '/api/modules',
    requiresAuth: true,
    rateLimit: { requests: 200, window: 60000 }
  },
  {
    service: 'marketplace',
    path: '/api/marketplace/*',
    method: 'ALL',
    handler: '/api/marketplace',
    requiresAuth: true,
    rateLimit: { requests: 150, window: 60000 }
  },
  {
    service: 'handover',
    path: '/api/handover/*',
    method: 'ALL',
    handler: '/api/handover',
    requiresAuth: true,
    rateLimit: { requests: 50, window: 60000 }
  },
  {
    service: 'webhooks',
    path: '/api/webhooks/*',
    method: 'ALL',
    handler: '/api/webhooks',
    requiresAuth: false,
    rateLimit: { requests: 500, window: 60000 }
  },
  {
    service: 'integrations',
    path: '/api/integrations/*',
    method: 'ALL',
    handler: '/api/integrations',
    requiresAuth: true,
    rateLimit: { requests: 100, window: 60000 }
  }
];

export class APIGateway {
  private config: GatewayConfig;
  private rateLimitStore: Map<string, { count: number; resetAt: number }>;

  constructor(config?: Partial<GatewayConfig>) {
    this.config = {
      routes: serviceRoutes,
      defaultTimeout: 30000,
      retryPolicy: {
        maxRetries: 3,
        backoffMs: 1000
      },
      ...config
    };
    this.rateLimitStore = new Map();
  }

  async route(request: NextRequest): Promise<NextResponse> {
    const route = this.matchRoute(request);

    if (!route) {
      return NextResponse.json(
        { error: 'Route not found', path: request.nextUrl.pathname },
        { status: 404 }
      );
    }

    if (route.requiresAuth && !await this.isAuthenticated(request)) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    if (route.rateLimit && !this.checkRateLimit(request, route)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests' },
        { status: 429 }
      );
    }

    return this.forwardRequest(request, route);
  }

  private matchRoute(request: NextRequest): ServiceRoute | null {
    const pathname = request.nextUrl.pathname;
    const method = request.method;

    return this.config.routes.find(route => {
      const pathPattern = route.path.replace('*', '.*');
      const pathRegex = new RegExp(`^${pathPattern}$`);
      const methodMatches = route.method === 'ALL' || route.method === method;

      return pathRegex.test(pathname) && methodMatches;
    }) || null;
  }

  private async isAuthenticated(request: NextRequest): Promise<boolean> {
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('session');

    return !!(authHeader || sessionCookie);
  }

  private checkRateLimit(request: NextRequest, route: ServiceRoute): boolean {
    if (!route.rateLimit) return true;

    const clientId = this.getClientIdentifier(request);
    const key = `${route.service}:${clientId}`;
    const now = Date.now();

    const existing = this.rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
      this.rateLimitStore.set(key, {
        count: 1,
        resetAt: now + route.rateLimit.window
      });
      return true;
    }

    if (existing.count >= route.rateLimit.requests) {
      return false;
    }

    existing.count++;
    return true;
  }

  private getClientIdentifier(request: NextRequest): string {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      return authHeader.split(' ')[1]?.substring(0, 10) || 'anonymous';
    }

    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0];
    }

    return 'anonymous';
  }

  private async forwardRequest(
    request: NextRequest,
    route: ServiceRoute
  ): Promise<NextResponse> {
    try {
      const targetPath = request.nextUrl.pathname;

      const response = await fetch(
        new URL(targetPath, request.nextUrl.origin),
        {
          method: request.method,
          headers: this.prepareHeaders(request),
          body: request.body,
          signal: AbortSignal.timeout(this.config.defaultTimeout)
        }
      );

      const data = await response.json().catch(() => ({}));

      return NextResponse.json(data, {
        status: response.status,
        headers: {
          'X-Service': route.service,
          'X-Gateway-Version': '1.0.0'
        }
      });
    } catch (error) {
      console.error('Gateway forwarding error:', error);

      return NextResponse.json(
        {
          error: 'Gateway error',
          message: error instanceof Error ? error.message : 'Unknown error',
          service: route.service
        },
        { status: 502 }
      );
    }
  }

  private prepareHeaders(request: NextRequest): HeadersInit {
    const headers: HeadersInit = {};

    request.headers.forEach((value, key) => {
      if (!key.toLowerCase().startsWith('host')) {
        headers[key] = value;
      }
    });

    headers['X-Gateway-Forwarded'] = 'true';
    headers['X-Original-Path'] = request.nextUrl.pathname;

    return headers;
  }

  getServiceRoutes(): ServiceRoute[] {
    return [...this.config.routes];
  }

  async healthCheck(): Promise<{
    status: string;
    services: Record<string, string>;
    timestamp: number;
  }> {
    const services: Record<string, string> = {};

    for (const route of this.config.routes) {
      services[route.service] = 'operational';
    }

    return {
      status: 'healthy',
      services,
      timestamp: Date.now()
    };
  }
}

export const apiGateway = new APIGateway();

export async function handleGatewayRequest(
  request: NextRequest
): Promise<NextResponse> {
  return apiGateway.route(request);
}