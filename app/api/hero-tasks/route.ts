/**
 * Hero Tasks API Routes
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  createTask,
  searchTasks,
  getTaskAnalytics
} from '@lib/hero-tasks/api';
import {
  CreateHeroTaskRequest,
  TaskSearchRequest
} from '@/types/hero-tasks';

// ============================================================================
// GET /api/hero-tasks - Search tasks or get analytics
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'analytics') {
      const result = await getTaskAnalytics();
      return NextResponse.json(result);
    }

    // Default to search
    const searchRequest: TaskSearchRequest = {
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '20'),
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
      filters: {
        status: searchParams.get('status')?.split(',') as any,
        priority: searchParams.get('priority')?.split(',') as any,
        type: searchParams.get('type')?.split(',') as any,
        assignee_id: searchParams.get('assignee_id')?.split(','),
        current_phase: searchParams.get('current_phase')?.split(',') as any,
        tags: searchParams.get('tags')?.split(','),
        created_after: searchParams.get('created_after') || undefined,
        created_before: searchParams.get('created_before') || undefined,
        due_after: searchParams.get('due_after') || undefined,
        due_before: searchParams.get('due_before') || undefined,
        search_text: searchParams.get('search_text') || undefined
      }
    };

    // Remove undefined values
    Object.keys(searchRequest.filters!).forEach(key => {
      if (searchRequest.filters![key as keyof typeof searchRequest.filters] === undefined) {
        delete searchRequest.filters![key as keyof typeof searchRequest.filters];
      }
    });

    const result = await searchTasks(searchRequest);
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
// POST /api/hero-tasks - Create new task
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.type) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: title and type are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const createRequest: CreateHeroTaskRequest = {
      title: body.title,
      description: body.description,
      priority: body.priority,
      type: body.type,
      parent_task_id: body.parent_task_id,
      assignee_id: body.assignee_id,
      due_date: body.due_date,
      estimated_duration_hours: body.estimated_duration_hours,
      tags: body.tags,
      metadata: body.metadata
    };

    const result = await createTask(createRequest);
    
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
