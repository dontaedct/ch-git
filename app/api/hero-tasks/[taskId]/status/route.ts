/**
 * Hero Tasks Status Update API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateTaskStatus,
  updateTaskPhase
} from '@lib/hero-tasks/api';
import {
  TaskStatus,
  WorkflowPhase
} from '@/types/hero-tasks';

// ============================================================================
// PUT /api/hero-tasks/[taskId]/status - Update task status
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    const body = await request.json();
    
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    if (!body.status) {
      return NextResponse.json({
        success: false,
        error: 'Status is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = Object.values(TaskStatus);
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await updateTaskStatus(taskId, body.status, body.reason);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
