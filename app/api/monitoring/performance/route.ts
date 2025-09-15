/**
 * @fileoverview HT-008.8.3: Performance Monitoring API Endpoint
 * @module app/api/monitoring/performance/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.3 - Implement performance monitoring and alerting
 * Focus: API endpoint for performance monitoring and analytics
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production monitoring, alerting systems)
 */

import { NextRequest, NextResponse } from 'next/server';
import { performanceTracker, PerformanceAlert } from '@/lib/monitoring/performance-tracker';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'performance-monitoring-api' });

// Request schemas
const TrackCustomMetricSchema = z.object({
  name: z.string().min(1),
  value: z.number(),
  context: z.record(z.any()).optional(),
});

const GetAnalyticsSchema = z.object({
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
});

const ResolveAlertSchema = z.object({
  alertId: z.string(),
  resolution: z.string(),
});

/**
 * Track a custom performance metric
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = TrackCustomMetricSchema.parse(body);

    performanceTracker.trackCustomMetric(
      validatedData.name,
      validatedData.value,
      validatedData.context
    );

    logger.info('Custom performance metric tracked', {
      name: validatedData.name,
      value: validatedData.value,
      context: validatedData.context,
    });

    return NextResponse.json({
      success: true,
      metric: validatedData.name,
      value: validatedData.value,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to track custom metric', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to track custom metric',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get performance analytics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';
    
    // Validate timeRange
    const validatedData = GetAnalyticsSchema.parse({ timeRange });

    const analytics = performanceTracker.getPerformanceAnalytics(validatedData.timeRange);
    const alerts = performanceTracker.getPerformanceAlerts();
    const latestMetrics = performanceTracker.getLatestMetrics();

    logger.info('Performance analytics retrieved', {
      timeRange: validatedData.timeRange,
      totalAlerts: alerts.length,
      hasLatestMetrics: !!latestMetrics,
    });

    return NextResponse.json({
      success: true,
      timeRange: validatedData.timeRange,
      analytics,
      alerts: alerts.slice(0, 50), // Limit to 50 most recent alerts
      latestMetrics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get performance analytics', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get performance analytics',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Resolve a performance alert
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = ResolveAlertSchema.parse(body);

    await performanceTracker.resolveAlert(validatedData.alertId, validatedData.resolution);

    logger.info('Performance alert resolved', {
      alertId: validatedData.alertId,
      resolution: validatedData.resolution,
    });

    return NextResponse.json({
      success: true,
      alertId: validatedData.alertId,
      resolvedAt: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to resolve performance alert', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to resolve performance alert',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get performance alerts only
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const alerts = performanceTracker.getPerformanceAlerts();

    logger.info('Performance alerts retrieved', {
      totalAlerts: alerts.length,
      unresolvedAlerts: alerts.filter(a => !a.resolved).length,
    });

    return NextResponse.json({
      success: true,
      alerts,
      summary: {
        total: alerts.length,
        unresolved: alerts.filter(a => !a.resolved).length,
        bySeverity: {
          critical: alerts.filter(a => a.severity === 'critical').length,
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length,
        },
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get performance alerts', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get performance alerts',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});
