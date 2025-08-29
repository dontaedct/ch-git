/**
 * Observability Middleware for API Routes
 * 
 * Provides automatic request tracking, metrics collection, and performance
 * monitoring for all API routes with OpenTelemetry integration.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Observing } from './index';
import { Logger } from '../logger';
import { ConfigHelpers } from './config';

const middlewareLogger = Logger.create({ component: 'observability-middleware' });

export interface ObservabilityMiddlewareOptions {
  trackPerformance?: boolean;
  trackSecurity?: boolean;
  trackBusinessMetrics?: boolean;
  sampleRate?: number;
}

/**
 * Create observability middleware for API routes
 */
export function createObservabilityMiddleware(options: ObservabilityMiddlewareOptions = {}) {
  const {
    trackPerformance = true,
    trackSecurity = true,
    trackBusinessMetrics = true,
    sampleRate = 1.0,
  } = options;

  return async function observabilityMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now();
    const method = request.method;
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Skip observability for certain paths
    if (shouldSkipObservability(path)) {
      return handler(request);
    }

    // Determine if we should track this request based on sample rate
    const shouldTrack = Math.random() < sampleRate;
    
    let requestTracker: any = null;
    let profiler: any = null;

    try {
      // Start request tracking if enabled
      if (shouldTrack && trackPerformance) {
        requestTracker = Observing.trackRequest(method, path);
      }

      // Start performance profiling if enabled
      if (shouldTrack && trackPerformance && ConfigHelpers.shouldProfile()) {
        profiler = Observing.profileOperation(`api_${method}_${path.replace(/[\/\{\}]/g, '_')}`, async () => {
          // Profiling will be handled by the response
        });
      }

      // Add request context to logs
      const requestContext = {
        method,
        path,
        userAgent: request.headers.get('user-agent'),
        ip: getClientIP(request),
        referer: request.headers.get('referer'),
        traceId: request.headers.get('x-trace-id'),
      };

      middlewareLogger.debug('API request started', requestContext);

      // Execute the actual handler
      const response = await handler(request);

      // Record completion metrics
      if (shouldTrack) {
        const duration = Date.now() - startTime;
        const status = response.status;

        // Track request metrics
        if (requestTracker) {
          requestTracker.finish(status, {
            authenticated: !!request.headers.get('authorization'),
            userAgent: requestContext.userAgent,
            ip: requestContext.ip,
          });
        }

        // Track business metrics for specific endpoints
        if (trackBusinessMetrics) {
          trackBusinessMetricsForEndpoint(method, path, status, duration);
        }

        // Track security events
        if (trackSecurity) {
          trackSecurityEvents(request, response, duration);
        }

        // Log request completion
        middlewareLogger.info('API request completed', {
          ...requestContext,
          status,
          duration,
          category: duration > 1000 ? 'slow' : duration > 500 ? 'medium' : 'fast',
        });
      }

      return response;

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Log error with full context
      middlewareLogger.error('API request failed', {
        method,
        path,
        error: errorMessage,
        duration,
        userAgent: request.headers.get('user-agent'),
        ip: getClientIP(request),
      });

      // Track error metrics
      if (shouldTrack && trackPerformance) {
        Observing.recordMetric('requestCount', 1, {
          method,
          route: path,
          status: '500',
          success: 'false',
        });
      }

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Check if observability should be skipped for this path
 */
function shouldSkipObservability(path: string): boolean {
  const skipPaths = [
    '/_next/',
    '/favicon.ico',
    '/api/health',
    '/api/metrics',
    '/api/robots.txt',
  ];

  return skipPaths.some(skipPath => path.startsWith(skipPath));
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
         request.headers.get('x-real-ip') ??
         'unknown';
}

/**
 * Track business metrics for specific endpoints
 */
function trackBusinessMetricsForEndpoint(
  method: string,
  path: string,
  status: number,
  duration: number
): void {
  // Track form submissions
  if (path.includes('/api/intake') && method === 'POST' && status === 200) {
    Observing.recordFormSubmission('client-intake');
  }

  // Track file uploads
  if (path.includes('/api/media/signed-upload') && method === 'POST' && status === 200) {
    Observing.recordFileUpload('media', 0); // Size would be available in request body
  }

  // Track authentication events
  if (path.includes('/api/auth') && status === 200) {
    Observing.recordMetric('authenticationAttempts', 1, {
      route: path,
      success: 'true',
    });
  }
}

/**
 * Track security events
 */
function trackSecurityEvents(
  request: NextRequest,
  response: NextResponse,
  duration: number
): void {
  const ip = getClientIP(request);
  const path = new URL(request.url).pathname;

  // Track rate limit violations (status 429)
  if (response.status === 429) {
    Observing.recordRateLimitViolation(ip, path, {
      violations: 1,
      timeWindow: '1m',
    });
  }

  // Track authentication failures (status 401/403)
  if (response.status === 401 || response.status === 403) {
    Observing.recordAuthFailure(ip, path, 'access_denied', {
      status: response.status,
    });
  }

  // Track suspicious requests
  const userAgent = request.headers.get('user-agent');
  if (userAgent && isSuspiciousUserAgent(userAgent)) {
    Observing.recordSecurityEvent({
      eventType: 'malicious_payload',
      severity: 'medium',
      ip,
      userAgent,
      route: path,
      details: { reason: 'suspicious_user_agent' },
    });
  }
}

/**
 * Check if user agent is suspicious
 */
function isSuspiciousUserAgent(userAgent: string): boolean {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /go-http-client/i,
  ];

  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

/**
 * Higher-order function to wrap API route handlers with observability
 */
export function withObservability<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: ObservabilityMiddlewareOptions = {}
): T {
  const middleware = createObservabilityMiddleware(options);
  
  return (async (...args: any[]) => {
    const request = args[0] as NextRequest;
    return middleware(request, handler);
  }) as T;
}

/**
 * Decorator for API route handlers
 */
export function observe(options: ObservabilityMiddlewareOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const middleware = createObservabilityMiddleware(options);
      const request = args[0];
      
      return middleware(request, originalMethod.bind(this));
    };
    
    return descriptor;
  };
}
