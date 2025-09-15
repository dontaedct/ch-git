/**
 * Hero Tasks Time Tracking Cron Jobs
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { TimeTrackingService } from '@/lib/time-tracking/service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cron job endpoint for cleaning up expired sessions
export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron job request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Clean up expired sessions
    await TimeTrackingService.cleanupExpiredSessions();

    // Get statistics
    const { data: stats } = await supabase
      .from('time_tracking_sessions')
      .select('id')
      .eq('is_active', true);

    const activeSessions = stats?.length || 0;

    return NextResponse.json({
      success: true,
      message: 'Cron job completed successfully',
      data: {
        active_sessions: activeSessions,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in time tracking cron job:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Cron job failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Manual cleanup endpoint for testing
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    // Clean up expired sessions
    await TimeTrackingService.cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      message: 'Manual cleanup completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in manual cleanup:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Manual cleanup failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
