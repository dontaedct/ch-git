/**
 * HT-036.3.3: Integration Middleware
 *
 * Middleware for API consistency, logging, error handling,
 * and request/response transformation across all integrated services.
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, AuthContext } from '@/lib/integration/auth-integration';

export interface MiddlewareConfig {
  enableLogging: boolean;
  enableMetrics: boolean;
  enableCors: boolean;
  enableCompression: boolean;
}

export interface RequestMetrics {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
  userId?: string;
  service?: string;
}

class IntegrationMiddleware {
  private config: MiddlewareConfig;
  private metrics: RequestMetrics[];

  constructor(config?: Partial<MiddlewareConfig>) {
    this.config = {
      enableLogging: true,
      enableMetrics: true,
      enableCors: true,
      enableCompression: false,
      ...config
    };
    this.metrics = [];
  }

  async handle(
    request: NextRequest,
    handler: (req: NextRequest, context?: AuthContext) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    let statusCode = 200;
    let authContext: AuthContext | undefined;

    try {
      if (this.config.enableLogging) {
        this.logRequest(request);
      }

      const authResult = await authenticateRequest(request);
      if (authResult.authenticated && authResult.context) {
        authContext = authResult.context;
      }

      const response = await handler(request, authContext);
      statusCode = response.status;

      const enhancedResponse = this.enhanceResponse(response, request);

      if (this.config.enableMetrics) {
        this.recordMetrics({
          path: request.nextUrl.pathname,
          method: request.method,
          statusCode,
          duration: Date.now() - startTime,
          timestamp: Date.now(),
          userId: authContext?.userId,
          service: this.extractService(request.nextUrl.pathname)
        });
      }

      return enhancedResponse;
    } catch (error) {
      statusCode = 500;

      if (this.config.enableLogging) {
        this.logError(request, error);
      }

      return this.handleError(error, request);
    }
  }

  private logRequest(request: NextRequest): void {
    console.log(`[${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname}`, {
      headers: Object.fromEntries(request.headers.entries()),
      query: Object.fromEntries(request.nextUrl.searchParams.entries())
    });
  }

  private logError(request: NextRequest, error: unknown): void {
    console.error(
      `[${new Date().toISOString()}] ERROR ${request.method} ${request.nextUrl.pathname}`,
      error
    );
  }

  private enhanceResponse(
    response: NextResponse,
    request: NextRequest
  ): NextResponse {
    const headers = new Headers(response.headers);

    headers.set('X-Request-Id', this.generateRequestId());
    headers.set('X-Response-Time', Date.now().toString());

    if (this.config.enableCors) {
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    headers.set('X-Powered-By', 'HT-036 Integration Layer');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }

  private handleError(error: unknown, request: NextRequest): NextResponse {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = this.getErrorStatusCode(error);

    return NextResponse.json(
      {
        error: true,
        message: errorMessage,
        path: request.nextUrl.pathname,
        timestamp: new Date().toISOString()
      },
      {
        status: statusCode,
        headers: {
          'X-Error-Type': error instanceof Error ? error.constructor.name : 'UnknownError'
        }
      }
    );
  }

  private getErrorStatusCode(error: unknown): number {
    if (error instanceof Error) {
      if (error.message.includes('Authentication required')) return 401;
      if (error.message.includes('Permission denied')) return 403;
      if (error.message.includes('not found')) return 404;
      if (error.message.includes('Rate limit')) return 429;
    }
    return 500;
  }

  private recordMetrics(metrics: RequestMetrics): void {
    this.metrics.push(metrics);

    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private extractService(pathname: string): string {
    const match = pathname.match(/^\/api\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getMetrics(service?: string): RequestMetrics[] {
    if (service) {
      return this.metrics.filter(m => m.service === service);
    }
    return [...this.metrics];
  }

  getAverageResponseTime(service?: string): number {
    const metrics = this.getMetrics(service);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getErrorRate(service?: string): number {
    const metrics = this.getMetrics(service);
    if (metrics.length === 0) return 0;

    const errors = metrics.filter(m => m.statusCode >= 400).length;
    return (errors / metrics.length) * 100;
  }

  clearMetrics(): void {
    this.metrics = [];
  }
}

export const integrationMiddleware = new IntegrationMiddleware();

export async function withIntegration(
  request: NextRequest,
  handler: (req: NextRequest, context?: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  return integrationMiddleware.handle(request, handler);
}

export function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    return withIntegration(request, async (req, context) => {
      if (!context) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      return handler(req, context);
    });
  };
}

export function withPermission(
  resource: string,
  action: string,
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withAuth(async (request, context) => {
    const hasPermission = context.permissions.some(p => {
      if (p === '*') return true;
      if (p === `${resource}:*`) return true;
      if (p === `${resource}:${action}`) return true;
      return false;
    });

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Permission denied', required: `${resource}:${action}` },
        { status: 403 }
      );
    }

    return handler(request, context);
  });
}

export async function handleOptions(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}