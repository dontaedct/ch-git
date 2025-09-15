/**
 * Hero Tasks - Query Builder API
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoint for executing complex queries built with the visual query builder.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";
import { z } from "zod";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const queryConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
});

const queryGroupSchema = z.object({
  logicalOperator: z.enum(['AND', 'OR']),
  conditions: z.array(queryConditionSchema)
});

const queryBuilderSchema = z.object({
  groups: z.array(queryGroupSchema),
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(100).default(20),
  sort_by: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

// ============================================================================
// QUERY EXECUTION
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', '/api/hero-tasks/query-builder');
  
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
    const validatedQuery = queryBuilderSchema.parse(body);

    // Execute the complex query
    const searchResult = await executeComplexQuery(supabase, validatedQuery, user.id);

    // Log query execution for analytics
    await logQueryExecution(supabase, user.id, validatedQuery, searchResult.total_count);

    routeLogger.info("Query builder executed", { 
      groups: validatedQuery.groups.length,
      conditions: validatedQuery.groups.reduce((sum, group) => sum + group.conditions.length, 0),
      resultCount: searchResult.total_count,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: searchResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Query builder execution error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Query execution failed",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// COMPLEX QUERY EXECUTION
// ============================================================================

async function executeComplexQuery(supabase: any, query: any, userId: string) {
  const page = query.page || 1;
  const pageSize = query.page_size || 20;
  const offset = (page - 1) * pageSize;

  // Build the base query
  let queryBuilder = supabase
    .from('hero_tasks')
    .select(`
      *,
      subtasks:hero_subtasks(*),
      dependencies:hero_task_dependencies(*),
      attachments:hero_task_attachments(*),
      comments:hero_task_comments(*),
      workflow_history:hero_workflow_history(*)
    `, { count: 'exact' });

  // Process query groups
  if (query.groups && query.groups.length > 0) {
    const groupConditions: string[] = [];

    query.groups.forEach((group: any, groupIndex: number) => {
      if (group.conditions && group.conditions.length > 0) {
        const conditionStrings: string[] = [];

        group.conditions.forEach((condition: any) => {
          const conditionString = buildConditionString(condition);
          if (conditionString) {
            conditionStrings.push(conditionString);
          }
        });

        if (conditionStrings.length > 0) {
          const groupOperator = group.logicalOperator === 'OR' ? ',' : '.and';
          const groupString = conditionStrings.join(groupOperator);
          groupConditions.push(`(${groupString})`);
        }
      }
    });

    if (groupConditions.length > 0) {
      // For multiple groups, we need to use OR between them
      // This is a simplified approach - in a real implementation, you might want more complex logic
      const finalCondition = groupConditions.join(',');
      queryBuilder = queryBuilder.or(finalCondition);
    }
  }

  // Apply sorting
  const sortBy = query.sort_by || 'created_at';
  const sortOrder = query.sort_order || 'desc';
  queryBuilder = queryBuilder.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  queryBuilder = queryBuilder.range(offset, offset + pageSize - 1);

  const { data, error, count } = await queryBuilder;

  if (error) {
    throw new Error(`Query execution failed: ${error.message}`);
  }

  const totalCount = count || 0;
  const hasMore = offset + pageSize < totalCount;

  return {
    tasks: data || [],
    total_count: totalCount,
    page,
    page_size: pageSize,
    has_more: hasMore,
    query_applied: {
      groups: query.groups.length,
      total_conditions: query.groups.reduce((sum: number, group: any) => sum + group.conditions.length, 0)
    }
  };
}

// ============================================================================
// CONDITION BUILDING
// ============================================================================

function buildConditionString(condition: any): string {
  const { field, operator, value } = condition;

  switch (operator) {
    case 'contains':
      return `${field}.ilike.%${value}%`;
    
    case 'equals':
      if (typeof value === 'boolean') {
        return `${field}.eq.${value}`;
      }
      return `${field}.eq.${value}`;
    
    case 'not_equals':
      return `${field}.neq.${value}`;
    
    case 'starts_with':
      return `${field}.ilike.${value}%`;
    
    case 'ends_with':
      return `${field}.ilike.%${value}`;
    
    case 'is_empty':
      return `${field}.is.null`;
    
    case 'is_not_empty':
      return `${field}.not.is.null`;
    
    case 'in':
      if (Array.isArray(value)) {
        return `${field}.in.(${value.join(',')})`;
      }
      return `${field}.eq.${value}`;
    
    case 'not_in':
      if (Array.isArray(value)) {
        return `${field}.not.in.(${value.join(',')})`;
      }
      return `${field}.neq.${value}`;
    
    case 'before':
      return `${field}.lt.${value}`;
    
    case 'after':
      return `${field}.gt.${value}`;
    
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        return `${field}.gte.${value[0]}.and.${field}.lte.${value[1]}`;
      }
      return `${field}.eq.${value}`;
    
    case 'greater_than':
      return `${field}.gt.${value}`;
    
    case 'less_than':
      return `${field}.lt.${value}`;
    
    case 'contains_all':
      if (Array.isArray(value)) {
        return value.map(v => `${field}.cs.{${v}}`).join('.and.');
      }
      return `${field}.cs.{${value}}`;
    
    case 'contains_any':
      if (Array.isArray(value)) {
        return `${field}.ov.{${value.join(',')}}`;
      }
      return `${field}.cs.{${value}}`;
    
    case 'not_contains':
      if (Array.isArray(value)) {
        return value.map(v => `${field}.not.cs.{${v}}`).join('.and.');
      }
      return `${field}.not.cs.{${value}}`;
    
    default:
      return `${field}.eq.${value}`;
  }
}

// ============================================================================
// QUERY ANALYTICS
// ============================================================================

async function logQueryExecution(supabase: any, userId: string, query: any, resultCount: number) {
  try {
    await supabase
      .from('hero_query_analytics')
      .insert({
        user_id: userId,
        query_structure: {
          groups: query.groups.length,
          total_conditions: query.groups.reduce((sum: number, group: any) => sum + group.conditions.length, 0),
          fields_used: query.groups.flatMap((group: any) => 
            group.conditions.map((condition: any) => condition.field)
          )
        },
        result_count: resultCount,
        execution_timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log query execution:', error);
  }
}

// ============================================================================
// QUERY VALIDATION
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('GET', '/api/hero-tasks/query-builder');
  
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
    const action = searchParams.get('action');

    if (action === 'fields') {
      // Return available fields for query builder
      const fields = {
        text_fields: ['title', 'description'],
        select_fields: ['status', 'priority', 'type', 'current_phase'],
        date_fields: ['created_at', 'due_date', 'completed_at'],
        number_fields: ['estimated_duration_hours', 'actual_duration_hours'],
        boolean_fields: ['has_subtasks', 'has_attachments', 'has_comments', 'is_overdue'],
        array_fields: ['tags']
      };

      return NextResponse.json({
        success: true,
        data: fields,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'operators') {
      // Return available operators for each field type
      const operators = {
        text: ['contains', 'equals', 'not_equals', 'starts_with', 'ends_with', 'is_empty', 'is_not_empty'],
        select: ['equals', 'not_equals', 'in', 'not_in'],
        date: ['equals', 'not_equals', 'before', 'after', 'between', 'is_empty', 'is_not_empty'],
        number: ['equals', 'not_equals', 'greater_than', 'less_than', 'between', 'is_empty', 'is_not_empty'],
        boolean: ['equals'],
        array: ['contains', 'not_contains', 'contains_all', 'contains_any', 'is_empty', 'is_not_empty']
      };

      return NextResponse.json({
        success: true,
        data: operators,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Query builder info error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Request failed",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
