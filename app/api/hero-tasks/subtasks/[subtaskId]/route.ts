/**
 * Hero Tasks Individual Subtask API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSubtask,
  updateSubtask,
  deleteSubtask
} from '@lib/hero-tasks/api';
import {
  UpdateHeroSubtaskRequest
} from '@/types/hero-tasks';

// ============================================================================
// GET /api/hero-tasks/subtasks/[subtaskId] - Get specific subtask
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { subtaskId: string } }
) {
  try {
    const { subtaskId } = params;
    
    if (!subtaskId) {
      return NextResponse.json({
        success: false,
        error: 'Subtask ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await getSubtask(subtaskId);
    
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
// PUT /api/hero-tasks/subtasks/[subtaskId] - Update subtask
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { subtaskId: string } }
) {
  try {
    const { subtaskId } = params;
    const body = await request.json();
    
    if (!subtaskId) {
      return NextResponse.json({
        success: false,
        error: 'Subtask ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const updateRequest: UpdateHeroSubtaskRequest = {
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

    const result = await updateSubtask(subtaskId, updateRequest);
    
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
// DELETE /api/hero-tasks/subtasks/[subtaskId] - Delete subtask
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { subtaskId: string } }
) {
  try {
    const { subtaskId } = params;
    
    if (!subtaskId) {
      return NextResponse.json({
        success: false,
        error: 'Subtask ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await deleteSubtask(subtaskId);
    
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
