/**
 * Hero Tasks Actions API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createAction
} from '@lib/hero-tasks/api';
import {
  CreateHeroActionRequest
} from '@/types/hero-tasks';

// ============================================================================
// POST /api/hero-tasks/actions - Create new action
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.subtask_id || !body.title || !body.type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: subtask_id, title and type are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const createRequest: CreateHeroActionRequest = {
      subtask_id: body.subtask_id,
      title: body.title,
      description: body.description,
      priority: body.priority,
      type: body.type,
      assignee_id: body.assignee_id,
      due_date: body.due_date,
      estimated_duration_hours: body.estimated_duration_hours,
      tags: body.tags,
      metadata: body.metadata
    };

    const result = await createAction(createRequest);
    
    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
