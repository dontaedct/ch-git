/**
 * @fileoverview Productivity Insights API Route
 * @module app/api/analytics/insights
 * @author OSS Hero System
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/lib/analytics/service';
import { AnalyticsTimeRange } from '@/lib/analytics/types';

export const runtime = 'nodejs';

/**
 * GET /api/analytics/insights
 * Get productivity insights and recommendations
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

    const insights = await analyticsService.getProductivityInsights(timeRange);

    return NextResponse.json({
      success: true,
      data: insights,
      timeRange,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Productivity insights API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch productivity insights',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
