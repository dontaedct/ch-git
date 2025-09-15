/**
 * @fileoverview HT-008.8.2: Error Tracking API Endpoint
 * @module app/api/monitoring/errors/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.2 - Add real-time error tracking and reporting
 * Focus: API endpoint for error tracking and analytics
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production monitoring, alerting systems)
 */

import { NextRequest, NextResponse } from 'next/server';
import { errorTracker, ErrorEvent, ErrorPattern } from '@/lib/monitoring/error-tracker';
import { AppError, ErrorSeverity, ErrorCategory, SystemError } from '@/lib/errors/types';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'error-tracking-api' });

// Request schemas
const TrackErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    severity: z.nativeEnum(ErrorSeverity),
    category: z.nativeEnum(ErrorCategory),
    code: z.string(),
    correlationId: z.string(),
    stack: z.string().optional(),
  }),
  context: z.object({
    url: z.string().optional(),
    userAgent: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    componentStack: z.string().optional(),
    performanceMetrics: z.object({
      memoryUsage: z.number().optional(),
      loadTime: z.number().optional(),
      renderTime: z.number().optional(),
    }).optional(),
  }).optional(),
});

const GetAnalyticsSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
});

const ResolvePatternSchema = z.object({
  patternId: z.string(),
  resolution: z.string(),
});

/**
 * Track a new error event
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = TrackErrorSchema.parse(body);

    // Convert to SystemError
    const appError = new SystemError(
      validatedData.error.message,
      {
        severity: validatedData.error.severity,
        stack: validatedData.error.stack,
        source: 'api-error-tracking',
        additionalData: {
          code: validatedData.error.code,
          correlationId: validatedData.error.correlationId,
        },
      }
    );

    // Track the error
    await errorTracker.trackError(appError, validatedData.context || {}, {
      userId: validatedData.context?.userId,
      sessionId: validatedData.context?.sessionId,
      url: validatedData.context?.url,
      componentStack: validatedData.context?.componentStack,
      performanceMetrics: validatedData.context?.performanceMetrics,
    });

    logger.info('Error tracked successfully', {
      correlationId: appError.correlationId,
      severity: appError.severity,
      category: appError.category,
    });

    return NextResponse.json({
      success: true,
      correlationId: appError.correlationId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to track error', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to track error',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get error analytics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';
    
    // Validate timeRange
    const validatedData = GetAnalyticsSchema.parse({ timeRange });

    const analytics = errorTracker.getErrorAnalytics(validatedData.timeRange);
    const patterns = errorTracker.getErrorPatterns();
    const trends = errorTracker.getErrorTrends();

    logger.info('Error analytics retrieved', {
      timeRange: validatedData.timeRange,
      totalErrors: analytics.totalErrors,
      criticalErrors: analytics.errorsBySeverity[ErrorSeverity.CRITICAL],
    });

    return NextResponse.json({
      success: true,
      timeRange: validatedData.timeRange,
      analytics,
      patterns: patterns.slice(0, 20), // Limit to top 20 patterns
      trends,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get error analytics', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get error analytics',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Resolve an error pattern
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = ResolvePatternSchema.parse(body);

    await errorTracker.resolveErrorPattern(validatedData.patternId, validatedData.resolution);

    logger.info('Error pattern resolved', {
      patternId: validatedData.patternId,
      resolution: validatedData.resolution,
    });

    return NextResponse.json({
      success: true,
      patternId: validatedData.patternId,
      resolvedAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to resolve error pattern', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to resolve error pattern',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Export error data
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') as 'json' | 'csv' || 'json';

    const data = errorTracker.exportErrorData(format);

    logger.info('Error data exported', {
      format,
      dataSize: data.length,
    });

    return new NextResponse(data, {
      headers: {
        'Content-Type': format === 'csv' ? 'text/csv' : 'application/json',
        'Content-Disposition': `attachment; filename="error-data-${new Date().toISOString().split('T')[0]}.${format}"`,
      },
    });

  } catch (error) {
    logger.error('Failed to export error data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to export error data',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});
