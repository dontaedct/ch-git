/**
 * @fileoverview Brand-Aware Analytics API Endpoints
 * @module app/api/analytics/brand-aware/route
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { brandAnalytics, BrandAnalyticsEvent } from '@/lib/analytics/brand-aware-analytics';
import { logoManager } from '@/lib/branding/logo-manager';
import { Observing } from '@/lib/observability';

/**
 * GET /api/analytics/brand-aware
 * Get brand analytics metrics and data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'last30days';
    const includeEvents = searchParams.get('includeEvents') === 'true';

    // Track API request
    Observing.trackRequest('GET', '/api/analytics/brand-aware');

    // Get current brand configuration
    const currentBrand = logoManager.getCurrentConfig();

    // Get analytics metrics
    const metrics = await brandAnalytics.getMetrics();

    // Get events if requested
    let events: BrandAnalyticsEvent[] = [];
    if (includeEvents) {
      // In a real implementation, this would query a database
      // For now, we'll return empty array
      events = [];
    }

    const response = {
      success: true,
      data: {
        metrics,
        currentBrand,
        timeRange,
        events,
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching brand analytics:', error);
    
    // Track error
    Observing.recordSecurityEvent({
      eventType: 'auth_failure',
      severity: 'medium',
      route: '/api/analytics/brand-aware',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch brand analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/analytics/brand-aware
 * Track brand analytics events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, eventName, properties = {} } = body;

    // Track API request
    Observing.trackRequest('POST', '/api/analytics/brand-aware');

    // Validate required fields
    if (!eventType || !eventName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'eventType and eventName are required',
        },
        { status: 400 }
      );
    }

    // Track the event
    brandAnalytics.track(eventType, eventName, properties);

    // Track successful event tracking
    Observing.recordMetric('brand_analytics_event_tracked', 1, {
      event_type: eventType,
      event_name: eventName,
    });

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error tracking brand analytics event:', error);
    
    // Track error
    Observing.recordSecurityEvent({
      eventType: 'auth_failure',
      severity: 'medium',
      route: '/api/analytics/brand-aware',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track event',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/analytics/brand-aware
 * Update brand analytics configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config } = body;

    // Track API request
    Observing.trackRequest('PUT', '/api/analytics/brand-aware');

    // Update analytics configuration
    brandAnalytics.updateConfig(config);

    // Track configuration update
    Observing.recordMetric('brand_analytics_config_updated', 1, {
      config_keys: Object.keys(config).length,
    });

    return NextResponse.json({
      success: true,
      message: 'Analytics configuration updated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error updating brand analytics configuration:', error);
    
    // Track error
    Observing.recordSecurityEvent({
      eventType: 'auth_failure',
      severity: 'medium',
      route: '/api/analytics/brand-aware',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update configuration',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
