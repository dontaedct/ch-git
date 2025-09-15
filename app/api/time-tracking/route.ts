/**
 * Hero Tasks Time Tracking API Routes
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import {
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  StartTimeTrackingRequest,
  StopTimeTrackingRequest,
  TimeTrackingReportType
} from '@/types/hero-tasks';

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

// GET /api/time-tracking/summary - Get time tracking summary
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const summary = await TimeTrackingService.getTimeTrackingSummary(
      user.id,
      startDate || undefined,
      endDate || undefined
    );

    return NextResponse.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting time tracking summary:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time tracking summary',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/time-tracking/start - Start time tracking
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const body: StartTimeTrackingRequest = await request.json();

    if (!body.task_id) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const session = await TimeTrackingService.startTracking(user.id, body);

    return NextResponse.json({
      success: true,
      data: session,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error starting time tracking:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start time tracking',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/time-tracking/stop - Stop time tracking
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const body: StopTimeTrackingRequest = await request.json();

    const timeEntry = await TimeTrackingService.stopTracking(user.id, body);

    return NextResponse.json({
      success: true,
      data: timeEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error stopping time tracking:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop time tracking',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PATCH /api/time-tracking/activity - Update activity
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    await TimeTrackingService.updateActivity(user.id);

    return NextResponse.json({
      success: true,
      message: 'Activity updated',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update activity',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
