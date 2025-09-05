/**
 * Hero Tasks Phase Update API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  updateTaskPhase
} from '@lib/hero-tasks/api';
import {
  WorkflowPhase
} from '@/types/hero-tasks';

// ============================================================================
// PUT /api/hero-tasks/[taskId]/phase - Update task phase
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

    if (!body.phase) {
      return NextResponse.json({
        success: false,
        error: 'Phase is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validate phase
    const validPhases = Object.values(WorkflowPhase);
    if (!validPhases.includes(body.phase)) {
      return NextResponse.json({
        success: false,
        error: `Invalid phase. Must be one of: ${validPhases.join(', ')}`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await updateTaskPhase(taskId, body.phase, body.reason);
    
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
