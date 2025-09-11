/**
 * Hero Tasks API Service
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

import { createClient } from '@/lib/supabase/client';
import {
  HeroTask,
  HeroSubtask,
  HeroAction,
  CreateHeroTaskRequest,
  UpdateHeroTaskRequest,
  CreateHeroSubtaskRequest,
  UpdateHeroSubtaskRequest,
  CreateHeroActionRequest,
  UpdateHeroActionRequest,
  TaskSearchRequest,
  TaskSearchResult,
  TaskAnalytics,
  ApiResponse,
  PaginatedResponse,
  ValidationResult,
  TaskHierarchy,
  TaskDependency,
  SubtaskDependency,
  ActionDependency,
  CreateDependencyRequest,
  TaskAttachment,
  CreateAttachmentRequest,
  TaskComment,
  CreateCommentRequest,
  WorkflowHistoryEntry,
  TaskStatus,
  WorkflowPhase,
  TaskPriority,
  TaskType,
  DependencyType,
  AttachmentType,
  CommentType
} from '@/types/hero-tasks';

// ============================================================================
// CLIENT CONFIGURATION
// ============================================================================

const supabase = createClient();

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

function validateTaskRequest(request: CreateHeroTaskRequest): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  if (!request.title || request.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
      code: 'REQUIRED'
    });
  }

  if (request.title && request.title.length > 500) {
    errors.push({
      field: 'title',
      message: 'Title must be 500 characters or less',
      code: 'MAX_LENGTH'
    });
  }

  if (request.tags && request.tags.length > 20) {
    errors.push({
      field: 'tags',
      message: 'Maximum 20 tags allowed',
      code: 'MAX_COUNT'
    });
  }

  if (request.tags) {
    for (const tag of request.tags) {
      if (tag.length > 50) {
        errors.push({
          field: 'tags',
          message: `Tag "${tag}" exceeds 50 character limit`,
          code: 'TAG_TOO_LONG'
        });
      }
    }
  }

  return {
    is_valid: errors.length === 0,
    errors
  };
}

function validateUpdateRequest(request: UpdateHeroTaskRequest): ValidationResult {
  const errors: Array<{ field: string; message: string; code: string }> = [];

  if (request.title !== undefined && request.title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title cannot be empty',
      code: 'REQUIRED'
    });
  }

  if (request.title && request.title.length > 500) {
    errors.push({
      field: 'title',
      message: 'Title must be 500 characters or less',
      code: 'MAX_LENGTH'
    });
  }

  return {
    is_valid: errors.length === 0,
    errors
  };
}

// ============================================================================
// TASK NUMBER GENERATION
// ============================================================================

async function generateNextTaskNumber(): Promise<string> {
  const { data, error } = await supabase
    .from('hero_tasks')
    .select('task_number')
    .order('task_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate task number: ${error.message}`);
  }

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastTaskNumber = data[0].task_number;
    const match = lastTaskNumber.match(/^HT-(\d+)$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `HT-${nextNumber.toString().padStart(3, '0')}`;
}

async function generateNextSubtaskNumber(taskId: string): Promise<string> {
  const { data: taskData, error: taskError } = await supabase
    .from('hero_tasks')
    .select('task_number')
    .eq('id', taskId)
    .single();

  if (taskError || !taskData) {
    throw new Error(`Task not found: ${taskId}`);
  }

  const { data, error } = await supabase
    .from('hero_subtasks')
    .select('subtask_number')
    .eq('task_id', taskId)
    .order('subtask_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate subtask number: ${error.message}`);
  }

  let nextSubtaskNumber = 1;
  if (data && data.length > 0) {
    const lastSubtaskNumber = data[0].subtask_number;
    const match = lastSubtaskNumber.match(/^HT-\d+\.(\d+)$/);
    if (match) {
      nextSubtaskNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${taskData.task_number}.${nextSubtaskNumber}`;
}

async function generateNextActionNumber(subtaskId: string): Promise<string> {
  const { data: subtaskData, error: subtaskError } = await supabase
    .from('hero_subtasks')
    .select('subtask_number')
    .eq('id', subtaskId)
    .single();

  if (subtaskError || !subtaskData) {
    throw new Error(`Subtask not found: ${subtaskId}`);
  }

  const { data, error } = await supabase
    .from('hero_actions')
    .select('action_number')
    .eq('subtask_id', subtaskId)
    .order('action_number', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`Failed to generate action number: ${error.message}`);
  }

  let nextActionNumber = 1;
  if (data && data.length > 0) {
    const lastActionNumber = data[0].action_number;
    const match = lastActionNumber.match(/^HT-\d+\.\d+\.(\d+)$/);
    if (match) {
      nextActionNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `${subtaskData.subtask_number}.${nextActionNumber}`;
}

// ============================================================================
// MAIN TASK OPERATIONS
// ============================================================================

export async function createTask(request: CreateHeroTaskRequest): Promise<ApiResponse<HeroTask>> {
  try {
    const validation = validateTaskRequest(request);
    if (!validation.is_valid) {
      return {
        success: false,
        error: 'Validation failed',
        message: validation.errors.map((e: any) => e.message).join(', '),
        timestamp: new Date().toISOString()
      };
    }

    const taskNumber = await generateNextTaskNumber();

    const { data, error } = await supabase
      .from('hero_tasks')
      .insert({
        task_number: taskNumber,
        title: request.title,
        description: request.description,
        priority: request.priority || 'medium',
        type: request.type,
        parent_task_id: request.parent_task_id,
        assignee_id: request.assignee_id,
        due_date: request.due_date,
        estimated_duration_hours: request.estimated_duration_hours,
        tags: request.tags || [],
        metadata: request.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroTask,
      message: 'Task created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function getTask(taskId: string): Promise<ApiResponse<HeroTask>> {
  try {
    const { data, error } = await supabase
      .from('hero_tasks')
      .select(`
        *,
        subtasks:hero_subtasks(*),
        dependencies:hero_task_dependencies(*),
        attachments:hero_task_attachments(*),
        comments:hero_task_comments(*),
        workflow_history:hero_workflow_history(*)
      `)
      .eq('id', taskId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch task: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroTask,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function updateTask(taskId: string, request: UpdateHeroTaskRequest): Promise<ApiResponse<HeroTask>> {
  try {
    const validation = validateUpdateRequest(request);
    if (!validation.is_valid) {
      return {
        success: false,
        error: 'Validation failed',
        message: validation.errors.map((e: any) => e.message).join(', '),
        timestamp: new Date().toISOString()
      };
    }

    const { data, error } = await supabase
      .from('hero_tasks')
      .update({
        ...request,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroTask,
      message: 'Task updated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function deleteTask(taskId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('hero_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }

    return {
      success: true,
      message: 'Task deleted successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// SUBTASK OPERATIONS
// ============================================================================

export async function createSubtask(request: CreateHeroSubtaskRequest): Promise<ApiResponse<HeroSubtask>> {
  try {
    const subtaskNumber = await generateNextSubtaskNumber(request.task_id);

    const { data, error } = await supabase
      .from('hero_subtasks')
      .insert({
        task_id: request.task_id,
        subtask_number: subtaskNumber,
        title: request.title,
        description: request.description,
        priority: request.priority || 'medium',
        type: request.type,
        assignee_id: request.assignee_id,
        due_date: request.due_date,
        estimated_duration_hours: request.estimated_duration_hours,
        tags: request.tags || [],
        metadata: request.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subtask: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroSubtask,
      message: 'Subtask created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function getSubtask(subtaskId: string): Promise<ApiResponse<HeroSubtask>> {
  try {
    const { data, error } = await supabase
      .from('hero_subtasks')
      .select(`
        *,
        actions:hero_actions(*),
        dependencies:hero_subtask_dependencies(*),
        attachments:hero_task_attachments(*),
        comments:hero_task_comments(*),
        workflow_history:hero_workflow_history(*)
      `)
      .eq('id', subtaskId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch subtask: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroSubtask,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function updateSubtask(subtaskId: string, request: UpdateHeroSubtaskRequest): Promise<ApiResponse<HeroSubtask>> {
  try {
    const { data, error } = await supabase
      .from('hero_subtasks')
      .update({
        ...request,
        updated_at: new Date().toISOString()
      })
      .eq('id', subtaskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subtask: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroSubtask,
      message: 'Subtask updated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function deleteSubtask(subtaskId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('hero_subtasks')
      .delete()
      .eq('id', subtaskId);

    if (error) {
      throw new Error(`Failed to delete subtask: ${error.message}`);
    }

    return {
      success: true,
      message: 'Subtask deleted successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// ACTION OPERATIONS
// ============================================================================

export async function createAction(request: CreateHeroActionRequest): Promise<ApiResponse<HeroAction>> {
  try {
    const actionNumber = await generateNextActionNumber(request.subtask_id);

    const { data, error } = await supabase
      .from('hero_actions')
      .insert({
        subtask_id: request.subtask_id,
        action_number: actionNumber,
        title: request.title,
        description: request.description,
        priority: request.priority || 'medium',
        type: request.type,
        assignee_id: request.assignee_id,
        due_date: request.due_date,
        estimated_duration_hours: request.estimated_duration_hours,
        tags: request.tags || [],
        metadata: request.metadata || {}
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create action: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroAction,
      message: 'Action created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function getAction(actionId: string): Promise<ApiResponse<HeroAction>> {
  try {
    const { data, error } = await supabase
      .from('hero_actions')
      .select(`
        *,
        dependencies:hero_action_dependencies(*),
        attachments:hero_task_attachments(*),
        comments:hero_task_comments(*),
        workflow_history:hero_workflow_history(*)
      `)
      .eq('id', actionId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch action: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroAction,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function updateAction(actionId: string, request: UpdateHeroActionRequest): Promise<ApiResponse<HeroAction>> {
  try {
    const { data, error } = await supabase
      .from('hero_actions')
      .update({
        ...request,
        updated_at: new Date().toISOString()
      })
      .eq('id', actionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update action: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroAction,
      message: 'Action updated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function deleteAction(actionId: string): Promise<ApiResponse<void>> {
  try {
    const { error } = await supabase
      .from('hero_actions')
      .delete()
      .eq('id', actionId);

    if (error) {
      throw new Error(`Failed to delete action: ${error.message}`);
    }

    return {
      success: true,
      message: 'Action deleted successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

export async function searchTasks(request: TaskSearchRequest): Promise<ApiResponse<TaskSearchResult>> {
  try {
    const page = request.page || 1;
    const pageSize = Math.min(request.page_size || 20, 100);
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('hero_tasks')
      .select(`
        *,
        subtasks:hero_subtasks(*),
        dependencies:hero_task_dependencies(*),
        attachments:hero_task_attachments(*),
        comments:hero_task_comments(*),
        workflow_history:hero_workflow_history(*)
      `, { count: 'exact' });

    // Apply filters
    if (request.filters) {
      const { filters } = request;
      
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }
      
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority);
      }
      
      if (filters.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }
      
      if (filters.assignee_id && filters.assignee_id.length > 0) {
        query = query.in('assignee_id', filters.assignee_id);
      }
      
      if (filters.current_phase && filters.current_phase.length > 0) {
        query = query.in('current_phase', filters.current_phase);
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }
      
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }
      
      if (filters.due_after) {
        query = query.gte('due_date', filters.due_after);
      }
      
      if (filters.due_before) {
        query = query.lte('due_date', filters.due_before);
      }
      
      if (filters.search_text) {
        query = query.or(`title.ilike.%${filters.search_text}%,description.ilike.%${filters.search_text}%`);
      }
    }

    // Apply sorting
    const sortBy = request.sort_by || 'created_at';
    const sortOrder = request.sort_order || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search tasks: ${error.message}`);
    }

    const totalCount = count || 0;
    const hasMore = offset + pageSize < totalCount;

    return {
      success: true,
      data: {
        tasks: data as HeroTask[],
        total_count: totalCount,
        page,
        page_size: pageSize,
        has_more: hasMore
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export async function getTaskAnalytics(): Promise<ApiResponse<TaskAnalytics>> {
  try {
    const { data: tasks, error } = await supabase
      .from('hero_tasks')
      .select('status, priority, type, current_phase, due_date, completed_at, estimated_duration_hours, actual_duration_hours');

    if (error) {
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }

    const analytics: TaskAnalytics = {
      total_tasks: tasks.length,
      tasks_by_status: {
        draft: 0,
        ready: 0,
        in_progress: 0,
        blocked: 0,
        completed: 0,
        cancelled: 0,
        pending: 0
      },
      tasks_by_priority: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      tasks_by_type: {
        feature: 0,
        bug_fix: 0,
        refactor: 0,
        documentation: 0,
        test: 0,
        security: 0,
        performance: 0,
        integration: 0,
        migration: 0,
        maintenance: 0,
        research: 0,
        planning: 0,
        review: 0,
        deployment: 0,
        monitoring: 0,
        architecture: 0
      },
      tasks_by_phase: {
        audit: 0,
        decide: 0,
        apply: 0,
        verify: 0
      },
      completion_rate: 0,
      average_duration_hours: 0,
      overdue_tasks: 0,
      blocked_tasks: 0
    };

    // Calculate analytics
    tasks.forEach((task: any) => {
      analytics.tasks_by_status[task.status as keyof typeof analytics.tasks_by_status]++;
      analytics.tasks_by_priority[task.priority as keyof typeof analytics.tasks_by_priority]++;
      analytics.tasks_by_type[task.type as keyof typeof analytics.tasks_by_type]++;
      analytics.tasks_by_phase[task.current_phase as keyof typeof analytics.tasks_by_phase]++;

      if (task.status === 'blocked') {
        analytics.blocked_tasks++;
      }

      if (task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed') {
        analytics.overdue_tasks++;
      }
    });

    // Calculate completion rate
    const completedTasks = analytics.tasks_by_status.completed;
    analytics.completion_rate = analytics.total_tasks > 0 ? (completedTasks / analytics.total_tasks) * 100 : 0;

    // Calculate average duration
    const tasksWithDuration = tasks.filter(t => t.actual_duration_hours);
    if (tasksWithDuration.length > 0) {
      const totalDuration = tasksWithDuration.reduce((sum: number, task: any) => sum + (task.actual_duration_hours || 0), 0);
      analytics.average_duration_hours = totalDuration / tasksWithDuration.length;
    }

    return {
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// WORKFLOW OPERATIONS
// ============================================================================

export async function updateTaskStatus(
  taskId: string, 
  status: TaskStatus, 
  reason?: string
): Promise<ApiResponse<HeroTask>> {
  try {
    const { data, error } = await supabase
      .from('hero_tasks')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'in_progress' && { started_at: new Date().toISOString() }),
        ...(status === 'completed' && { completed_at: new Date().toISOString() })
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroTask,
      message: `Task status updated to ${status}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function updateTaskPhase(
  taskId: string, 
  phase: WorkflowPhase, 
  reason?: string
): Promise<ApiResponse<HeroTask>> {
  try {
    const { data, error } = await supabase
      .from('hero_tasks')
      .update({
        current_phase: phase,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update task phase: ${error.message}`);
    }

    return {
      success: true,
      data: data as HeroTask,
      message: `Task phase updated to ${phase}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// DEPENDENCY OPERATIONS
// ============================================================================

export async function createDependency(request: CreateDependencyRequest): Promise<ApiResponse<void>> {
  try {
    // Determine the type of dependency based on the IDs
    // This is a simplified implementation - you might want to add more logic
    const { error } = await supabase
      .from('hero_task_dependencies')
      .insert({
        dependent_task_id: request.dependent_id,
        depends_on_task_id: request.depends_on_id,
        dependency_type: request.dependency_type
      });

    if (error) {
      throw new Error(`Failed to create dependency: ${error.message}`);
    }

    return {
      success: true,
      message: 'Dependency created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// ATTACHMENT OPERATIONS
// ============================================================================

export async function createAttachment(request: CreateAttachmentRequest): Promise<ApiResponse<TaskAttachment>> {
  try {
    const { data, error } = await supabase
      .from('hero_task_attachments')
      .insert(request)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create attachment: ${error.message}`);
    }

    return {
      success: true,
      data: data as TaskAttachment,
      message: 'Attachment created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// REORDER OPERATIONS
// ============================================================================

export async function reorderTasks(request: {
  task_ids: string[];
  reorder_timestamp: string;
  user_id?: string;
}): Promise<ApiResponse<HeroTask[]>> {
  try {
    // Validate that all task IDs exist
    const { data: existingTasks, error: fetchError } = await supabase
      .from('hero_tasks')
      .select('id')
      .in('id', request.task_ids);

    if (fetchError) {
      throw new Error(`Failed to validate task IDs: ${fetchError.message}`);
    }

    if (!existingTasks || existingTasks.length !== request.task_ids.length) {
      throw new Error('One or more task IDs do not exist');
    }

    // Update each task with its new display order
    const updates = request.task_ids.map((taskId, index) => ({
      id: taskId,
      metadata: {
        display_order: index,
        last_reordered_at: request.reorder_timestamp,
        reordered_by: request.user_id || 'system'
      },
      updated_at: new Date().toISOString()
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
      throw new Error(`Failed to reorder tasks: ${updateError.message}`);
    }

    // Return tasks in their new order
    const orderedTasks = request.task_ids.map(id => 
      updatedTasks?.find(task => task.id === id)
    ).filter(Boolean) as HeroTask[];

    return {
      success: true,
      data: orderedTasks,
      message: 'Tasks reordered successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// ============================================================================
// COMMENT OPERATIONS
// ============================================================================

export async function createComment(request: CreateCommentRequest): Promise<ApiResponse<TaskComment>> {
  try {
    const { data, error } = await supabase
      .from('hero_task_comments')
      .insert({
        ...request,
        comment_type: request.comment_type || 'comment'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return {
      success: true,
      data: data as TaskComment,
      message: 'Comment created successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
