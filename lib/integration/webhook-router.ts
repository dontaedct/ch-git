import { NextRequest, NextResponse } from 'next/server';
import { UnifiedWebhookContext } from './webhook-unifier';

export interface WebhookRoute {
  path: string;
  method: string;
  handler: (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>;
  type: 'orchestration' | 'automation' | 'generic' | 'marketplace' | 'analytics';
  priority: number;
  eventMatcher?: (payload: any) => boolean;
  metadata?: Record<string, any>;
}

export interface RouteMatch {
  handler: (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>;
  type: string;
  priority: number;
  matchScore: number;
  metadata?: Record<string, any>;
}

export class WebhookRouter {
  private routes: WebhookRoute[] = [];
  private pathCache: Map<string, RouteMatch> = new Map();

  registerRoute(route: WebhookRoute): void {
    this.routes.push(route);
    this.routes.sort((a, b) => b.priority - a.priority);
    this.pathCache.clear();
  }

  unregisterRoute(path: string, method: string): void {
    this.routes = this.routes.filter(
      route => !(route.path === path && route.method === method)
    );
    this.pathCache.clear();
  }

  findRoute(path: string, method: string, payload?: any): RouteMatch | null {
    const cacheKey = `${method}:${path}`;

    if (this.pathCache.has(cacheKey) && !payload) {
      return this.pathCache.get(cacheKey)!;
    }

    const matches: RouteMatch[] = [];

    for (const route of this.routes) {
      const matchScore = this.calculateMatchScore(route, path, method, payload);

      if (matchScore > 0) {
        matches.push({
          handler: route.handler,
          type: route.type,
          priority: route.priority,
          matchScore,
          metadata: route.metadata
        });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    matches.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.matchScore - a.matchScore;
    });

    const bestMatch = matches[0];

    if (!payload) {
      this.pathCache.set(cacheKey, bestMatch);
    }

    return bestMatch;
  }

  private calculateMatchScore(
    route: WebhookRoute,
    path: string,
    method: string,
    payload?: any
  ): number {
    let score = 0;

    if (route.method.toLowerCase() !== method.toLowerCase()) {
      return 0;
    }

    if (route.path === path) {
      score += 100;
    } else if (this.pathMatches(route.path, path)) {
      score += 50;
    } else {
      return 0;
    }

    if (route.eventMatcher && payload) {
      try {
        if (route.eventMatcher(payload)) {
          score += 25;
        }
      } catch (error) {
        console.warn('[WebhookRouter] Event matcher failed:', error);
      }
    }

    return score;
  }

  private pathMatches(pattern: string, path: string): boolean {
    const patternParts = pattern.split('/').filter(p => p);
    const pathParts = path.split('/').filter(p => p);

    if (patternParts.length !== pathParts.length) {
      return false;
    }

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        continue;
      }

      if (patternPart !== pathPart) {
        return false;
      }
    }

    return true;
  }

  getAllRoutes(): WebhookRoute[] {
    return [...this.routes];
  }

  getRoutesByType(type: string): WebhookRoute[] {
    return this.routes.filter(route => route.type === type);
  }

  clearCache(): void {
    this.pathCache.clear();
  }

  getStats(): {
    totalRoutes: number;
    routesByType: Record<string, number>;
    cacheSize: number;
  } {
    const routesByType: Record<string, number> = {};

    for (const route of this.routes) {
      routesByType[route.type] = (routesByType[route.type] || 0) + 1;
    }

    return {
      totalRoutes: this.routes.length,
      routesByType,
      cacheSize: this.pathCache.size
    };
  }
}

export class CircuitBreaker {
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private halfOpenRequests: number = 3
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        this.failureCount = 0;
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();

      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failureCount = 0;
      }

      return result;

    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = 'open';
        console.error('[CircuitBreaker] Circuit opened after', this.failureCount, 'failures');
      }

      throw error;
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

export class LoadBalancer {
  private currentIndex: number = 0;

  constructor(
    private handlers: Array<(context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>>,
    private strategy: 'round-robin' | 'least-connections' | 'random' = 'round-robin'
  ) {}

  async execute(
    context: UnifiedWebhookContext,
    request: NextRequest
  ): Promise<NextResponse> {
    if (this.handlers.length === 0) {
      throw new Error('No handlers available');
    }

    const handler = this.selectHandler();
    return handler(context, request);
  }

  private selectHandler(): (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse> {
    switch (this.strategy) {
      case 'round-robin':
        const handler = this.handlers[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.handlers.length;
        return handler;

      case 'random':
        const randomIndex = Math.floor(Math.random() * this.handlers.length);
        return this.handlers[randomIndex];

      case 'least-connections':
      default:
        return this.handlers[0];
    }
  }

  addHandler(handler: (context: UnifiedWebhookContext, request: NextRequest) => Promise<NextResponse>): void {
    this.handlers.push(handler);
  }

  removeHandler(index: number): void {
    if (index >= 0 && index < this.handlers.length) {
      this.handlers.splice(index, 1);
    }
  }
}

export const globalRouter = new WebhookRouter();