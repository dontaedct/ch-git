/**
 * Hero Tasks Individual Task API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPhase
} from '@lib/hero-tasks/api';
import {
  UpdateHeroTaskRequest,
  TaskStatus,
  WorkflowPhase
} from '@/types/hero-tasks';

// ============================================================================
// GET /api/hero-tasks/[taskId] - Get specific task
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await getTask(taskId);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 404 });
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

// ============================================================================
// PUT /api/hero-tasks/[taskId] - Update task
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

    const updateRequest: UpdateHeroTaskRequest = {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      type: body.type,
      assignee_id: body.assignee_id,
      due_date: body.due_date,
      estimated_duration_hours: body.estimated_duration_hours,
      actual_duration_hours: body.actual_duration_hours,
      current_phase: body.current_phase,
      tags: body.tags,
      metadata: body.metadata
    };

    const result = await updateTask(taskId, updateRequest);
    
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

// ============================================================================
// DELETE /api/hero-tasks/[taskId] - Delete task
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params;
    
    if (!taskId) {
      return NextResponse.json({
        success: false,
        error: 'Task ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await deleteTask(taskId);
    
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
