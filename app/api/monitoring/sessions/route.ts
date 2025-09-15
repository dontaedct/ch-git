/**
 * @fileoverview HT-008.8.4: Session Tracking API Endpoint
 * @module app/api/monitoring/sessions/route
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.4 - Add user session tracking and analytics
 * Focus: API endpoint for session tracking and user analytics
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (user privacy, data protection, analytics)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sessionTracker, UserSession, SessionEvent, UserAnalytics } from '@/lib/monitoring/session-tracker';
import { Logger } from '@/lib/logger';
import { withSentry } from '@/lib/sentry-wrapper';
import { z } from 'zod';

const logger = Logger.create({ component: 'session-tracking-api' });

// Request schemas
const TrackEventSchema = z.object({
  type: z.enum(['page_view', 'click', 'scroll', 'form_submit', 'download', 'error', 'performance', 'custom']),
  data: z.record(z.any()),
  page: z.string().optional(),
  element: z.string().optional(),
  value: z.any().optional(),
});

const GetAnalyticsSchema = z.object({
  userId: z.string().optional(),
  timeRange: z.enum(['1h', '24h', '7d', '30d']).optional(),
});

const GetSessionSchema = z.object({
  sessionId: z.string(),
});

/**
 * Track a session event
 */
export const POST = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = TrackEventSchema.parse(body);

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Enhance event data with server-side information
    const enhancedData = {
      ...validatedData.data,
      clientIP,
      userAgent,
      timestamp: new Date().toISOString(),
    };

    sessionTracker.trackEvent(validatedData.type, enhancedData);

    logger.info('Session event tracked', {
      type: validatedData.type,
      page: validatedData.page || 'unknown',
      clientIP,
    });

    return NextResponse.json({
      success: true,
      eventType: validatedData.type,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to track session event', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to track session event',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get user analytics
 */
export const GET = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' | '30d' || '24h';
    
    // Validate parameters
    const validatedData = GetAnalyticsSchema.parse({ userId, timeRange });

    const analytics = sessionTracker.getUserAnalytics(validatedData.userId, validatedData.timeRange);
    const activeSessionsCount = sessionTracker.getActiveSessionsCount();

    logger.info('User analytics retrieved', {
      userId: validatedData.userId || 'all',
      timeRange: validatedData.timeRange,
      totalSessions: analytics.totalSessions,
      activeSessions: activeSessionsCount,
    });

    return NextResponse.json({
      success: true,
      userId: validatedData.userId,
      timeRange: validatedData.timeRange,
      analytics,
      activeSessionsCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get user analytics', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get user analytics',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});

/**
 * Get specific session data
 */
export const PUT = withSentry(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const validatedData = GetSessionSchema.parse(body);

    const session = sessionTracker.getSession(validatedData.sessionId);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'Session not found',
      }, { status: 404 });
    }

    logger.info('Session data retrieved', {
      sessionId: validatedData.sessionId,
      userId: session.userId || 'anonymous',
      pageViews: session.pageViews,
      duration: session.duration,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        sessionId: session.sessionId,
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        duration: session.duration,
        pageViews: session.pageViews,
        device: session.device,
        performance: session.performance,
        behavior: session.behavior,
        privacy: session.privacy,
        // Don't include events for privacy reasons unless specifically requested
        eventsCount: session.events.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get session data', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get session data',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 400 });
  }
});

/**
 * Get session insights
 */
export const DELETE = withSentry(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required',
      }, { status: 400 });
    }

    const insights = sessionTracker.getSessionInsights(sessionId);
    
    if (!insights) {
      return NextResponse.json({
        success: false,
        error: 'Session not found or no insights available',
      }, { status: 404 });
    }

    logger.info('Session insights retrieved', {
      sessionId,
      engagementScore: insights.engagementScore,
      conversionProbability: insights.conversionProbability,
    });

    return NextResponse.json({
      success: true,
      sessionId,
      insights,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    logger.error('Failed to get session insights', {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to get session insights',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
});
