/**
 * Hero Tasks Time Entry API Routes (Individual Entry)
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import { UpdateTimeEntryRequest } from '@/types/hero-tasks';

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

// PUT /api/time-tracking/entries/[id] - Update time entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    const body: UpdateTimeEntryRequest = await request.json();

    const timeEntry = await TimeTrackingService.updateTimeEntry(user.id, params.id, body);

    return NextResponse.json({
      success: true,
      data: timeEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating time entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update time entry',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// DELETE /api/time-tracking/entries/[id] - Delete time entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    await TimeTrackingService.deleteTimeEntry(user.id, params.id);

    return NextResponse.json({
      success: true,
      message: 'Time entry deleted',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting time entry:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete time entry',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
