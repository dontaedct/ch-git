/**
 * Hero Tasks - Reorder API Route
 * Created: 2025-01-27T10:30:00.000Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { reorderTasks } from '@lib/hero-tasks/api';

// ============================================================================
// POST /api/hero-tasks/reorder - Reorder tasks
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.task_ids || !Array.isArray(body.task_ids) || body.task_ids.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: task_ids array is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!body.reorder_timestamp) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: reorder_timestamp is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const reorderRequest = {
      task_ids: body.task_ids as string[],
      reorder_timestamp: body.reorder_timestamp as string,
      user_id: body.user_id || 'system' // Optional user tracking
    };

    const result = await reorderTasks(reorderRequest);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Reorder tasks error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
