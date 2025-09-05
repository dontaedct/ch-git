/**
 * Hero Tasks Individual Action API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getAction,
  updateAction,
  deleteAction
} from '@lib/hero-tasks/api';
import {
  UpdateHeroActionRequest
} from '@/types/hero-tasks';

// ============================================================================
// GET /api/hero-tasks/actions/[actionId] - Get specific action
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;
    
    if (!actionId) {
      return NextResponse.json({
        success: false,
        error: 'Action ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await getAction(actionId);
    
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
// PUT /api/hero-tasks/actions/[actionId] - Update action
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;
    const body = await request.json();
    
    if (!actionId) {
      return NextResponse.json({
        success: false,
        error: 'Action ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const updateRequest: UpdateHeroActionRequest = {
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

    const result = await updateAction(actionId, updateRequest);
    
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
// DELETE /api/hero-tasks/actions/[actionId] - Delete action
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { actionId: string } }
) {
  try {
    const { actionId } = params;
    
    if (!actionId) {
      return NextResponse.json({
        success: false,
        error: 'Action ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const result = await deleteAction(actionId);
    
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
