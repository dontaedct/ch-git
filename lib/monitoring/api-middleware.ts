/**
 * @fileoverview API Performance Middleware - Phase 7.2
 * Middleware for tracking API response times and performance metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from './performance-monitor';

export interface ApiMetrics {
  responseTime: number;
  statusCode: number;
  endpoint: string;
  method: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}

/**
 * API Performance Middleware
 * Tracks response times and other metrics for API endpoints
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const endpoint = req.nextUrl.pathname;
    const method = req.method;
    const userAgent = req.headers.get('user-agent') || undefined;
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.ip || 
                     undefined;

    try {
      // Execute the original handler
      const response = await handler(req);
      
      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Record metrics
      performanceMonitor.recordApiMetrics({
        responseTime,
        statusCode: response.status,
        endpoint,
        method,
        userAgent,
        ipAddress
      });

      return response;
    } catch (error) {
      // Calculate response time even for errors
      const responseTime = Date.now() - startTime;
      
      // Record error metrics
      performanceMonitor.recordApiMetrics({
        responseTime,
        statusCode: 500,
        endpoint,
        method,
        userAgent,
        ipAddress
      });

      throw error;
    }
  };
}

/**
 * Database Performance Wrapper
 * Tracks database query performance
 */
export function withDatabaseMonitoring<T>(
  queryFn: () => Promise<T>,
  queryType: string,
  tableName?: string
): Promise<T> {
  const startTime = Date.now();
  
  return queryFn().then(
    (result) => {
      const queryTime = Date.now() - startTime;
      
      performanceMonitor.recordDatabaseMetrics({
        queryTime,
        queryType,
        tableName
      });
      
      return result;
    },
    (error) => {
      const queryTime = Date.now() - startTime;
      
      // Record error metrics
      performanceMonitor.recordDatabaseMetrics({
        queryTime,
        queryType: `ERROR_${queryType}`,
        tableName
      });
      
      throw error;
    }
  );
}

/**
 * CDN Performance Tracker
 * Tracks asset loading performance
 */
export function trackCdnPerformance(
  assetUrl: string,
  loadTime: number,
  cacheHit: boolean,
  fileSize: number
): void {
  performanceMonitor.recordCdnMetrics({
    assetUrl,
    loadTime,
    cacheHit,
    fileSize
  });
}

/**
 * User Experience Metrics Tracker
 * Tracks frontend performance metrics
 */
export function trackUXMetrics(data: {
  pageLoadTime: number;
  firstContentfulPaint: number;
  pageUrl: string;
  deviceType: string;
}): void {
  performanceMonitor.recordUXMetrics(data);
}

/**
 * Performance Monitoring API Route Handler
 * Provides performance metrics via API
 */
export async function handlePerformanceMetrics(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const timeRange = url.searchParams.get('timeRange') || '1h';
    const includeAlerts = url.searchParams.get('includeAlerts') === 'true';

    const metrics = performanceMonitor.getMetricsHistory(timeRange);
    const alerts = includeAlerts ? performanceMonitor.getActiveAlerts() : [];

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        alerts,
        timeRange,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Performance Alerts API Route Handler
 * Manages performance alerts
 */
export async function handlePerformanceAlerts(req: NextRequest): Promise<NextResponse> {
  try {
    if (req.method === 'GET') {
      const alerts = performanceMonitor.getActiveAlerts();
      return NextResponse.json({
        success: true,
        data: alerts
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { alertId, action } = body;

      if (action === 'resolve' && alertId) {
        performanceMonitor.resolveAlert(alertId);
        return NextResponse.json({
          success: true,
          message: 'Alert resolved successfully'
        });
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action or missing alertId'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Method not allowed'
      },
      { status: 405 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Performance Health Check
 * Returns current system health status
 */
export async function handlePerformanceHealth(): Promise<NextResponse> {
  try {
    const metrics = performanceMonitor.getMetricsHistory('15m');
    const alerts = performanceMonitor.getActiveAlerts();
    
    // Calculate health status based on recent metrics
    const recentApiMetrics = metrics
      .filter(m => m.api.responseTime > 0)
      .slice(-10); // Last 10 API calls
    
    const avgResponseTime = recentApiMetrics.length > 0
      ? recentApiMetrics.reduce((sum, m) => sum + m.api.responseTime, 0) / recentApiMetrics.length
      : 0;
    
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const warningAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'medium');
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    if (criticalAlerts.length > 0 || avgResponseTime > 3000) {
      status = 'critical';
    } else if (warningAlerts.length > 0 || avgResponseTime > 1000) {
      status = 'warning';
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        avgResponseTime,
        activeAlerts: alerts.length,
        criticalAlerts: criticalAlerts.length,
        warningAlerts: warningAlerts.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Utility function to get client IP address
 */
export function getClientIP(req: NextRequest): string | undefined {
  return req.headers.get('x-forwarded-for')?.split(',')[0] ||
         req.headers.get('x-real-ip') ||
         req.ip ||
         undefined;
}

/**
 * Utility function to detect device type from user agent
 */
export function detectDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Performance monitoring initialization
 */
export function initializePerformanceMonitoring(): void {
  // Start the performance monitor
  performanceMonitor.startMonitoring(30000); // 30 seconds interval
  
  console.log('Performance monitoring initialized');
}

/**
 * Performance monitoring cleanup
 */
export function cleanupPerformanceMonitoring(): void {
  performanceMonitor.stopMonitoring();
  console.log('Performance monitoring stopped');
}
