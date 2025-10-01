/**
 * @fileoverview Analytics API Routes
 * @module app/api/analytics
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: Re-enable when analytics system is implemented
// import { analyticsService } from '@/lib/analytics/service';

// Temporary stub for MVP
const analyticsService = {
  getTaskAnalytics: async () => ({ tasks: [] })
};
import { AnalyticsTimeRange } from '@/lib/analytics/types';

export const runtime = 'nodejs';

/**
 * GET /api/analytics/tasks
 * Get task analytics for a specific time range
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');
    const type = url.searchParams.get('type') || 'last30days';

    let timeRange: AnalyticsTimeRange;

    if (startDate && endDate) {
      timeRange = {
        start: new Date(startDate),
        end: new Date(endDate),
        type: 'custom'
      };
    } else {
      // Default time ranges
      const now = new Date();
      switch (type) {
        case 'last7days':
          timeRange = {
            start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
            end: now,
            type: 'last7days'
          };
          break;
        case 'last30days':
          timeRange = {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: now,
            type: 'last30days'
          };
          break;
        case 'last90days':
          timeRange = {
            start: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
            end: now,
            type: 'last90days'
          };
          break;
        default:
          timeRange = {
            start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
            end: now,
            type: 'last30days'
          };
      }
    }

    const analytics = await analyticsService.getTaskAnalytics(timeRange);

    return NextResponse.json({
      success: true,
      data: analytics,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
