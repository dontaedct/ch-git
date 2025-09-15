/**
 * Hero Tasks Time Tracking Settings API Routes
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import { TimeTrackingSettings } from '@/types/hero-tasks';

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

// GET /api/time-tracking/settings - Get time tracking settings
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    const settings = await TimeTrackingService.getTimeTrackingSettings(user.id);

    return NextResponse.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting time tracking settings:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get time tracking settings',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// PUT /api/time-tracking/settings - Update time tracking settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    const body: Partial<TimeTrackingSettings> = await request.json();

    const settings = await TimeTrackingService.updateTimeTrackingSettings(user.id, body);

    return NextResponse.json({
      success: true,
      data: settings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating time tracking settings:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update time tracking settings',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
