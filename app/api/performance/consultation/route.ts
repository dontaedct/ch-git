/**
 * Performance Monitoring API for Consultation Workflow
 * HT-030.4.2: Performance Optimization & Production Readiness
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPerformanceMetrics,
  getPerformanceSummary,
  validatePerformanceTargets,
  exportPerformanceMetrics,
  clearPerformanceMetrics,
  PERFORMANCE_TARGETS,
  withPerformanceMonitoring,
} from '@/lib/performance/consultation-optimization';
import { getConsultationCache } from '@/lib/caching/consultation-cache';

// Performance monitoring endpoints

/**
 * GET /api/performance/consultation
 * Get performance metrics and summary
 */
export const GET = withPerformanceMonitoring(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const component = searchParams.get('component') || undefined;
    const operation = searchParams.get('operation') || undefined;
    const startTime = searchParams.get('startTime')
      ? parseInt(searchParams.get('startTime')!)
      : undefined;
    const endTime = searchParams.get('endTime')
      ? parseInt(searchParams.get('endTime')!)
      : undefined;
    const format = searchParams.get('format') || 'json';

    // Get filtered metrics
    const metrics = getPerformanceMetrics({
      component,
      operation,
      startTime,
      endTime,
    });

    // Get summary
    const summary = getPerformanceSummary(component);

    // Validate performance targets
    const validation = validatePerformanceTargets();

    // Get cache statistics
    const cache = getConsultationCache();
    const cacheStats = await cache.getStats();
    const cacheHealth = await cache.healthCheck();

    const responseData = {
      timestamp: Date.now(),
      filters: {
        component,
        operation,
        startTime,
        endTime,
      },
      targets: PERFORMANCE_TARGETS,
      metrics: {
        count: metrics.length,
        data: format === 'detailed' ? metrics : metrics.slice(-100), // Last 100 for overview
      },
      summary,
      validation,
      cache: {
        stats: cacheStats,
        health: cacheHealth,
      },
    };

    // Handle different response formats
    if (format === 'export') {
      const exportData = exportPerformanceMetrics();
      return new NextResponse(exportData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="consultation-performance-${Date.now()}.json"`,
        },
      });
    }

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/performance/consultation
 * Record custom performance metric
 */
export const POST = withPerformanceMonitoring(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { component, operation, duration, metadata } = body;

    // Validate required fields
    if (!component || !operation || typeof duration !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: component, operation, duration' },
        { status: 400 }
      );
    }

    // Record the metric using the performance optimization system
    const { recordPerformanceMetric } = await import('@/lib/performance/consultation-optimization');

    recordPerformanceMetric({
      component,
      operation,
      duration,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        source: 'api',
        user_agent: request.headers.get('user-agent'),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Performance metric recorded',
        metric: {
          component,
          operation,
          duration,
          timestamp: Date.now(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Performance metric recording error:', error);
    return NextResponse.json(
      {
        error: 'Failed to record performance metric',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * DELETE /api/performance/consultation
 * Clear performance metrics
 */
export const DELETE = withPerformanceMonitoring(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const confirm = searchParams.get('confirm');

    if (confirm !== 'true') {
      return NextResponse.json(
        { error: 'Confirmation required. Add ?confirm=true to clear metrics.' },
        { status: 400 }
      );
    }

    // Clear performance metrics
    clearPerformanceMetrics();

    return NextResponse.json(
      {
        success: true,
        message: 'Performance metrics cleared',
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Performance metrics clearing error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear performance metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/performance/consultation
 * Update performance configuration
 */
export const PUT = withPerformanceMonitoring(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Configuration object required' },
        { status: 400 }
      );
    }

    // Update performance configuration
    const { configurePerformance } = await import('@/lib/performance/consultation-optimization');
    configurePerformance(config);

    return NextResponse.json(
      {
        success: true,
        message: 'Performance configuration updated',
        config,
        timestamp: Date.now(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Performance configuration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update performance configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});