/**
 * Hero Tasks - Advanced Search API Endpoints
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoints for advanced search functionality including saved filters,
 * search suggestions, and full-text search capabilities.
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

const advancedSearchSchema = z.object({
  // Text search
  search_text: z.string().optional(),
  search_fields: z.array(z.string()).optional(),
  
  // Status filters
  status: z.array(z.enum(['draft', 'ready', 'in_progress', 'blocked', 'completed', 'cancelled'])).optional(),
  priority: z.array(z.enum(['critical', 'high', 'medium', 'low'])).optional(),
  type: z.array(z.enum(['feature', 'bug_fix', 'refactor', 'documentation', 'test', 'security', 'performance', 'integration', 'migration', 'maintenance', 'research', 'planning', 'review', 'deployment', 'monitoring'])).optional(),
  phase: z.array(z.enum(['audit', 'decide', 'apply', 'verify'])).optional(),
  
  // Assignment filters
  assignee_id: z.array(z.string().uuid()).optional(),
  created_by: z.array(z.string().uuid()).optional(),
  
  // Date filters
  created_after: z.string().datetime().optional(),
  created_before: z.string().datetime().optional(),
  due_after: z.string().datetime().optional(),
  due_before: z.string().datetime().optional(),
  completed_after: z.string().datetime().optional(),
  completed_before: z.string().datetime().optional(),
  
  // Tag filters
  tags: z.array(z.string()).optional(),
  tags_mode: z.enum(['any', 'all']).default('any'),
  
  // Duration filters
  estimated_duration_min: z.number().positive().optional(),
  estimated_duration_max: z.number().positive().optional(),
  actual_duration_min: z.number().positive().optional(),
  actual_duration_max: z.number().positive().optional(),
  
  // Advanced filters
  has_subtasks: z.boolean().optional(),
  has_attachments: z.boolean().optional(),
  has_comments: z.boolean().optional(),
  has_dependencies: z.boolean().optional(),
  is_overdue: z.boolean().optional(),
  
  // Search options
  case_sensitive: z.boolean().default(false),
  exact_match: z.boolean().default(false),
  include_archived: z.boolean().default(false),
  
  // Pagination
  page: z.number().int().positive().default(1),
  page_size: z.number().int().positive().max(100).default(20),
  sort_by: z.string().default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

const savedFilterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: advancedSearchSchema,
  is_favorite: z.boolean().default(false)
});

// ============================================================================
// MAIN SEARCH ENDPOINT
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', '/api/hero-tasks/search');
  
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
    const validatedFilters = advancedSearchSchema.parse(body);

    // Perform advanced search
    const searchResult = await performAdvancedSearch(supabase, validatedFilters, user.id);

    // Log search query for analytics
    await logSearchQuery(supabase, user.id, validatedFilters, searchResult.total_count);

    routeLogger.info("Advanced search completed", { 
      filters: Object.keys(validatedFilters),
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
    routeLogger.error("Advanced search error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Search failed",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// SEARCH IMPLEMENTATION
// ============================================================================

async function performAdvancedSearch(supabase: any, filters: any, userId: string) {
  const page = filters.page || 1;
  const pageSize = filters.page_size || 20;
  const offset = (page - 1) * pageSize;

  // Build the base query with full-text search capabilities
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

  // Apply text search with full-text capabilities
  if (filters.search_text) {
    const searchText = filters.case_sensitive ? filters.search_text : filters.search_text.toLowerCase();
    
    if (filters.exact_match) {
      // Exact match search
      query = query.or(`title.eq.${searchText},description.eq.${searchText}`);
    } else {
      // Full-text search across multiple fields
      const searchFields = filters.search_fields || ['title', 'description', 'tags'];
      const searchConditions = searchFields.map((field: string) => {
        if (field === 'tags') {
          return `tags.cs.{${searchText}}`;
        }
        return filters.case_sensitive 
          ? `${field}.ilike.%${searchText}%`
          : `${field}.ilike.%${searchText}%`;
      });
      
      query = query.or(searchConditions.join(','));
    }
  }

  // Apply status filters
  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  // Apply priority filters
  if (filters.priority && filters.priority.length > 0) {
    query = query.in('priority', filters.priority);
  }

  // Apply type filters
  if (filters.type && filters.type.length > 0) {
    query = query.in('type', filters.type);
  }

  // Apply phase filters
  if (filters.phase && filters.phase.length > 0) {
    query = query.in('current_phase', filters.phase);
  }

  // Apply assignment filters
  if (filters.assignee_id && filters.assignee_id.length > 0) {
    query = query.in('assignee_id', filters.assignee_id);
  }

  if (filters.created_by && filters.created_by.length > 0) {
    query = query.in('created_by', filters.created_by);
  }

  // Apply date filters
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
  if (filters.completed_after) {
    query = query.gte('completed_at', filters.completed_after);
  }
  if (filters.completed_before) {
    query = query.lte('completed_at', filters.completed_before);
  }

  // Apply tag filters
  if (filters.tags && filters.tags.length > 0) {
    if (filters.tags_mode === 'all') {
      // All tags must be present
      query = query.contains('tags', filters.tags);
    } else {
      // Any tag can be present
      query = query.overlaps('tags', filters.tags);
    }
  }

  // Apply duration filters
  if (filters.estimated_duration_min !== undefined) {
    query = query.gte('estimated_duration_hours', filters.estimated_duration_min);
  }
  if (filters.estimated_duration_max !== undefined) {
    query = query.lte('estimated_duration_hours', filters.estimated_duration_max);
  }
  if (filters.actual_duration_min !== undefined) {
    query = query.gte('actual_duration_hours', filters.actual_duration_min);
  }
  if (filters.actual_duration_max !== undefined) {
    query = query.lte('actual_duration_hours', filters.actual_duration_max);
  }

  // Apply advanced filters
  if (filters.has_subtasks !== undefined) {
    if (filters.has_subtasks) {
      query = query.not('subtasks', 'is', null);
    } else {
      query = query.is('subtasks', null);
    }
  }

  if (filters.has_attachments !== undefined) {
    if (filters.has_attachments) {
      query = query.not('attachments', 'is', null);
    } else {
      query = query.is('attachments', null);
    }
  }

  if (filters.has_comments !== undefined) {
    if (filters.has_comments) {
      query = query.not('comments', 'is', null);
    } else {
      query = query.is('comments', null);
    }
  }

  if (filters.has_dependencies !== undefined) {
    if (filters.has_dependencies) {
      query = query.not('dependencies', 'is', null);
    } else {
      query = query.is('dependencies', null);
    }
  }

  if (filters.is_overdue) {
    const now = new Date().toISOString();
    query = query.lt('due_date', now).neq('status', 'completed');
  }

  // Apply sorting
  const sortBy = filters.sort_by || 'created_at';
  const sortOrder = filters.sort_order || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  const totalCount = count || 0;
  const hasMore = offset + pageSize < totalCount;

  return {
    tasks: data || [],
    total_count: totalCount,
    page,
    page_size: pageSize,
    has_more: hasMore,
    filters_applied: Object.keys(filters).filter(key => 
      filters[key] !== undefined && filters[key] !== null && filters[key] !== ''
    )
  };
}

// ============================================================================
// SEARCH ANALYTICS
// ============================================================================

async function logSearchQuery(supabase: any, userId: string, filters: any, resultCount: number) {
  try {
    await supabase
      .from('hero_search_analytics')
      .insert({
        user_id: userId,
        search_text: filters.search_text || null,
        filters_applied: Object.keys(filters).filter(key => 
          filters[key] !== undefined && filters[key] !== null && filters[key] !== ''
        ),
        result_count: resultCount,
        search_timestamp: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log search query:', error);
  }
}

// ============================================================================
// SAVED FILTERS ENDPOINTS
// ============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (type === 'saved-filters') {
      // Return saved filters
      const { data: savedFilters, error } = await supabase
        .from('hero_saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('usage_count', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch saved filters: ${error.message}`);
      }

      return NextResponse.json({
        success: true,
        data: savedFilters || [],
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'suggestions') {
      // Return search suggestions
      const { data: suggestions, error } = await supabase
        .from('hero_search_analytics')
        .select('search_text')
        .eq('user_id', user.id)
        .not('search_text', 'is', null)
        .order('search_timestamp', { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(`Failed to fetch suggestions: ${error.message}`);
      }

      const uniqueSuggestions = suggestions
        ?.map(s => s.search_text)
        .filter((text, index, arr) => arr.indexOf(text) === index)
        .slice(0, 5)
        .map(text => ({ text, type: 'recent' as const })) || [];

      return NextResponse.json({
        success: true,
        data: uniqueSuggestions,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid request type" },
      { status: 400 }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
