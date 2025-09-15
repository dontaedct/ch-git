/**
 * Hero Tasks Time Entries API Routes
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import {
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest
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

// GET /api/time-tracking/entries - Get time entries
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    
    const taskId = searchParams.get('taskId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

    const entries = await TimeTrackingService.getTimeEntries(user.id, {
      taskId: taskId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      limit,
      offset
    });

    return NextResponse.json({
      success: true,
      data: entries,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting time entries:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time entries',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST /api/time-tracking/entries - Create time entry
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const body: CreateTimeEntryRequest = await request.json();

    if (!body.task_id) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const timeEntry = await TimeTrackingService.createTimeEntry(user.id, body);

    return NextResponse.json({
      success: true,
      data: timeEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating time entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create time entry',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
