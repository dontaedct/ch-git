/**
 * Hero Tasks Time Tracking Analytics API Routes
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import { TimeTrackingReportType } from '@/types/hero-tasks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to get user from request
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new Error('No authorization header');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid token');
  }

  return user;
}

// GET /api/time-tracking/analytics - Get time tracking analytics
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Start date and end date are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const analytics = await TimeTrackingService.getTimeTrackingAnalytics(
      user.id,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting time tracking analytics:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time tracking analytics',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/time-tracking/analytics/report - Generate time tracking report
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const body = await request.json();

    const { reportType, startDate, endDate } = body;

    if (!reportType || !startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Report type, start date, and end date are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const report = await TimeTrackingService.generateTimeTrackingReport(
      user.id,
      reportType as TimeTrackingReportType,
      startDate,
      endDate
    );

    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating time tracking report:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate time tracking report',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
