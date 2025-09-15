/**
 * Hero Tasks API - CRUD Operations
 * 
 * Universal Header Compliant API endpoint for Hero Tasks management
 * with real-time WebSocket integration for live collaboration.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";
import { z } from "zod";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(['draft', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled']).default('draft'),
  priority: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  type: z.enum(['feature', 'bug_fix', 'refactor', 'documentation', 'test', 'security', 'performance', 'integration', 'migration', 'maintenance', 'research', 'planning', 'review', 'deployment', 'monitoring']),
  due_date: z.string().datetime().optional(),
  estimated_duration_hours: z.number().int().positive().optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.any()).default({}),
  parent_task_id: z.string().uuid().optional(),
  assignee_id: z.string().uuid().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid(),
});

const taskQuerySchema = z.object({
  action: z.enum(['analytics', 'list']).optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  type: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  page: z.string().transform(Number).optional(),
  pageSize: z.string().transform(Number).optional(),
});

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('GET', '/api/hero-tasks');
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = taskQuerySchema.parse(queryParams);

    if (validatedQuery.action === 'analytics') {
      // Return analytics data
      const analytics = await getTaskAnalytics(supabase);
      return NextResponse.json({
        success: true,
        data: analytics,
        timestamp: new Date().toISOString()
      });
    }

    // Return task list
    const tasks = await getTasks(supabase, validatedQuery);
    return NextResponse.json({
      success: true,
      data: tasks,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Get tasks error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', '/api/hero-tasks');
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createTaskSchema.parse(body);

    // Generate task number
    const { data: taskNumber } = await supabase.rpc('generate_next_task_number');
    
    const taskData = {
      ...validatedData,
      task_number: taskNumber,
      created_by: user.id,
      assignee_id: validatedData.assignee_id || user.id,
    };

    const { data: task, error: insertError } = await supabase
      .from('hero_tasks')
      .insert(taskData)
      .select()
      .single();

    if (insertError) {
      routeLogger.error("Failed to create task", { error: insertError.message });
      return NextResponse.json(
        { success: false, error: "Failed to create task" },
        { status: 500 }
      );
    }

    // TODO: Broadcast real-time update via WebSocket
    await broadcastTaskUpdate('task_created', task, user.id);

    routeLogger.info("Task created successfully", { 
      taskId: task.id, 
      taskNumber: task.task_number,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Create task error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('PUT', '/api/hero-tasks');
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = updateTaskSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const { data: task, error: updateError } = await supabase
      .from('hero_tasks')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      routeLogger.error("Failed to update task", { error: updateError.message, taskId: id });
      return NextResponse.json(
        { success: false, error: "Failed to update task" },
        { status: 500 }
      );
    }

    // TODO: Broadcast real-time update via WebSocket
    await broadcastTaskUpdate('task_updated', task, user.id);

    routeLogger.info("Task updated successfully", { 
      taskId: task.id, 
      taskNumber: task.task_number,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: task,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Update task error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('DELETE', '/api/hero-tasks');
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: "Task ID required" },
        { status: 400 }
      );
    }

    const { error: deleteError } = await supabase
      .from('hero_tasks')
      .delete()
      .eq('id', taskId);

    if (deleteError) {
      routeLogger.error("Failed to delete task", { error: deleteError.message, taskId });
      return NextResponse.json(
        { success: false, error: "Failed to delete task" },
        { status: 500 }
      );
    }

    // TODO: Broadcast real-time update via WebSocket
    await broadcastTaskUpdate('task_deleted', { id: taskId }, user.id);

    routeLogger.info("Task deleted successfully", { 
      taskId,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: { id: taskId },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Delete task error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Internal server error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getTasks(supabase: any, query: any) {
  let queryBuilder = supabase
    .from('hero_tasks')
    .select(`
      *,
      hero_subtasks(*),
      hero_actions(*)
    `)
    .order('created_at', { ascending: false });

  if (query.status) {
    queryBuilder = queryBuilder.eq('status', query.status);
  }
  if (query.priority) {
    queryBuilder = queryBuilder.eq('priority', query.priority);
  }
  if (query.type) {
    queryBuilder = queryBuilder.eq('type', query.type);
  }
  if (query.assignee_id) {
    queryBuilder = queryBuilder.eq('assignee_id', query.assignee_id);
  }

  if (query.page && query.pageSize) {
    const from = (query.page - 1) * query.pageSize;
    const to = from + query.pageSize - 1;
    queryBuilder = queryBuilder.range(from, to);
  }

  const { data, error } = await queryBuilder;
  
  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data || [];
}

async function getTaskAnalytics(supabase: any) {
  // Get total tasks count
  const { count: totalTasks } = await supabase
    .from('hero_tasks')
    .select('*', { count: 'exact', head: true });

  // Get tasks by status
  const { data: statusData } = await supabase
    .from('hero_tasks')
    .select('status')
    .not('status', 'is', null);

  const tasksByStatus = statusData?.reduce((acc: any, task: any) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get tasks by priority
  const { data: priorityData } = await supabase
    .from('hero_tasks')
    .select('priority')
    .not('priority', 'is', null);

  const tasksByPriority = priorityData?.reduce((acc: any, task: any) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {}) || {};

  // Get tasks by phase
  const { data: phaseData } = await supabase
    .from('hero_tasks')
    .select('current_phase')
    .not('current_phase', 'is', null);

  const tasksByPhase = phaseData?.reduce((acc: any, task: any) => {
    acc[task.current_phase] = (acc[task.current_phase] || 0) + 1;
    return acc;
  }, {}) || {};

  // Calculate completion rate
  const completedTasks = tasksByStatus.completed || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Get overdue tasks
  const { count: overdueTasks } = await supabase
    .from('hero_tasks')
    .select('*', { count: 'exact', head: true })
    .lt('due_date', new Date().toISOString())
    .neq('status', 'completed');

  // Calculate average duration
  const { data: durationData } = await supabase
    .from('hero_tasks')
    .select('actual_duration_hours')
    .not('actual_duration_hours', 'is', null)
    .not('actual_duration_hours', 'eq', 0);

  const averageDuration = durationData?.length > 0 
    ? durationData.reduce((sum: number, task: any) => sum + (task.actual_duration_hours || 0), 0) / durationData.length
    : 0;

  return {
    total_tasks: totalTasks || 0,
    completion_rate: completionRate,
    tasks_by_status: {
      draft: tasksByStatus.draft || 0,
      ready: tasksByStatus.ready || 0,
      in_progress: tasksByStatus.in_progress || 0,
      blocked: tasksByStatus.blocked || 0,
      completed: tasksByStatus.completed || 0,
      cancelled: tasksByStatus.cancelled || 0,
    },
    tasks_by_priority: {
      critical: tasksByPriority.critical || 0,
      high: tasksByPriority.high || 0,
      medium: tasksByPriority.medium || 0,
      low: tasksByPriority.low || 0,
    },
    tasks_by_phase: {
      audit: tasksByPhase.audit || 0,
      decide: tasksByPhase.decide || 0,
      apply: tasksByPhase.apply || 0,
      verify: tasksByPhase.verify || 0,
    },
    overdue_tasks: overdueTasks || 0,
    average_duration_hours: averageDuration,
  };
}

// WebSocket broadcasting implementation
async function broadcastTaskUpdate(eventType: string, data: any, userId: string) {
  try {
    const { getWebSocketServer } = await import('@/lib/websocket/hero-tasks-server');
    const wsServer = getWebSocketServer();
    
    await wsServer.broadcastTaskUpdate(eventType, data, userId, data.id);
  } catch (error) {
    console.error('Failed to broadcast WebSocket update:', error);
  }
}