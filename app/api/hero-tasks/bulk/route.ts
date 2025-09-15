/**
 * Hero Tasks - Bulk Operations API Routes
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import {
  HeroTask,
  TaskStatus,
  TaskPriority,
  WorkflowPhase,
  ApiResponse
} from '@/types/hero-tasks';

const supabase = createClient();

// ============================================================================
// BULK STATUS UPDATE
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    switch (operation) {
      case 'status':
        return await handleBulkStatusUpdate(request);
      case 'priority':
        return await handleBulkPriorityUpdate(request);
      case 'phase':
        return await handleBulkPhaseUpdate(request);
      case 'assignee':
        return await handleBulkAssigneeUpdate(request);
      case 'tags':
        return await handleBulkTagsUpdate(request);
      case 'delete':
        return await handleBulkDelete(request);
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid bulk operation',
          timestamp: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkStatusUpdate(request: NextRequest) {
  const body = await request.json();
  const { task_ids, status, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!status || !Object.values(TaskStatus).includes(status)) {
    return NextResponse.json({
      success: false,
      error: 'Valid status is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, status')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Prepare updates
    const updates = task_ids.map(taskId => ({
      id: taskId,
      status,
      updated_at: new Date().toISOString(),
      ...(status === 'in_progress' && { started_at: new Date().toISOString() }),
      ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      metadata: {
        bulk_operation: 'status_update',
        bulk_timestamp: timestamp,
        previous_status: existingTasks.find(t => t.id === taskId)?.status
      }
    }));

    // Perform batch update
    const { data: updatedTasks, error: updateError } = await supabase
      .from('hero_tasks')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (updateError) {
      throw new Error(`Failed to update task statuses: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: updatedTasks as HeroTask[],
        failedTasks: [],
        message: `Updated ${updatedTasks?.length || 0} tasks to ${status} status`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkPriorityUpdate(request: NextRequest) {
  const body = await request.json();
  const { task_ids, priority, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!priority || !Object.values(TaskPriority).includes(priority)) {
    return NextResponse.json({
      success: false,
      error: 'Valid priority is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, priority')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Prepare updates
    const updates = task_ids.map(taskId => ({
      id: taskId,
      priority,
      updated_at: new Date().toISOString(),
      metadata: {
        bulk_operation: 'priority_update',
        bulk_timestamp: timestamp,
        previous_priority: existingTasks.find(t => t.id === taskId)?.priority
      }
    }));

    // Perform batch update
    const { data: updatedTasks, error: updateError } = await supabase
      .from('hero_tasks')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (updateError) {
      throw new Error(`Failed to update task priorities: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: updatedTasks as HeroTask[],
        failedTasks: [],
        message: `Updated ${updatedTasks?.length || 0} tasks to ${priority} priority`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkPhaseUpdate(request: NextRequest) {
  const body = await request.json();
  const { task_ids, phase, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!phase || !Object.values(WorkflowPhase).includes(phase)) {
    return NextResponse.json({
      success: false,
      error: 'Valid phase is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, current_phase')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Prepare updates
    const updates = task_ids.map(taskId => ({
      id: taskId,
      current_phase: phase,
      updated_at: new Date().toISOString(),
      metadata: {
        bulk_operation: 'phase_update',
        bulk_timestamp: timestamp,
        previous_phase: existingTasks.find(t => t.id === taskId)?.current_phase
      }
    }));

    // Perform batch update
    const { data: updatedTasks, error: updateError } = await supabase
      .from('hero_tasks')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (updateError) {
      throw new Error(`Failed to update task phases: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: updatedTasks as HeroTask[],
        failedTasks: [],
        message: `Updated ${updatedTasks?.length || 0} tasks to ${phase} phase`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkAssigneeUpdate(request: NextRequest) {
  const body = await request.json();
  const { task_ids, assignee_id, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!assignee_id) {
    return NextResponse.json({
      success: false,
      error: 'assignee_id is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, assignee_id')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Prepare updates
    const updates = task_ids.map(taskId => ({
      id: taskId,
      assignee_id,
      updated_at: new Date().toISOString(),
      metadata: {
        bulk_operation: 'assignee_update',
        bulk_timestamp: timestamp,
        previous_assignee: existingTasks.find(t => t.id === taskId)?.assignee_id
      }
    }));

    // Perform batch update
    const { data: updatedTasks, error: updateError } = await supabase
      .from('hero_tasks')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (updateError) {
      throw new Error(`Failed to update task assignees: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: updatedTasks as HeroTask[],
        failedTasks: [],
        message: `Updated ${updatedTasks?.length || 0} tasks assignee to ${assignee_id}`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkTagsUpdate(request: NextRequest) {
  const body = await request.json();
  const { task_ids, tags, action, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!tags || !Array.isArray(tags)) {
    return NextResponse.json({
      success: false,
      error: 'tags array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  if (!action || !['add', 'remove', 'replace'].includes(action)) {
    return NextResponse.json({
      success: false,
      error: 'action must be add, remove, or replace',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, tags')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Prepare updates
    const updates = task_ids.map(taskId => {
      const existingTask = existingTasks.find(t => t.id === taskId);
      const currentTags = existingTask?.tags || [];
      
      let newTags: string[];
      switch (action) {
        case 'add':
          newTags = [...new Set([...currentTags, ...tags])];
          break;
        case 'remove':
          newTags = currentTags.filter((tag: string) => !tags.includes(tag));
          break;
        case 'replace':
          newTags = tags;
          break;
        default:
          newTags = currentTags;
      }

      return {
        id: taskId,
        tags: newTags,
        updated_at: new Date().toISOString(),
        metadata: {
          bulk_operation: 'tags_update',
          bulk_timestamp: timestamp,
          previous_tags: currentTags,
          tag_action: action
        }
      };
    });

    // Perform batch update
    const { data: updatedTasks, error: updateError } = await supabase
      .from('hero_tasks')
      .upsert(updates, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select();

    if (updateError) {
      throw new Error(`Failed to update task tags: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: updatedTasks as HeroTask[],
        failedTasks: [],
        message: `${action === 'add' ? 'Added' : action === 'remove' ? 'Removed' : 'Replaced'} tags on ${updatedTasks?.length || 0} tasks`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function handleBulkDelete(request: NextRequest) {
  const body = await request.json();
  const { task_ids, timestamp } = body;

  if (!task_ids || !Array.isArray(task_ids) || task_ids.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'task_ids array is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id, title')
      .in('id', task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Perform batch delete
    const { error: deleteError } = await supabase
      .from('hero_tasks')
      .delete()
      .in('id', task_ids);

    if (deleteError) {
      throw new Error(`Failed to delete tasks: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        updatedTasks: [],
        failedTasks: [],
        message: `Deleted ${task_ids.length} task${task_ids.length !== 1 ? 's' : ''}`
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
