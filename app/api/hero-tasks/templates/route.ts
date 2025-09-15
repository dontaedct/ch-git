/**
 * Hero Tasks - Task Templates API Routes
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import {
  TaskTemplate,
  CreateTaskTemplateRequest,
  UpdateTaskTemplateRequest,
  TaskTemplateCategory,
  ApiResponse,
  PaginatedResponse,
  CreateHeroTaskRequest
} from '@/types/hero-tasks';

const supabase = createClient();

// ============================================================================
// GET /api/hero-tasks/templates - Get task templates
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('is_public');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('page_size') || '20'), 100);
    const offset = (page - 1) * pageSize;

    let query = supabase
      .from('hero_task_templates')
      .select('*', { count: 'exact' });

    // Apply filters
    if (category && Object.values(TaskTemplateCategory).includes(category as TaskTemplateCategory)) {
      query = query.eq('category', category);
    }

    if (isPublic === 'true') {
      query = query.eq('is_public', true);
    }

    // Apply sorting (most used first, then by name)
    query = query.order('usage_count', { ascending: false })
                 .order('name', { ascending: true });

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }

    const totalCount = count || 0;
    const hasMore = offset + pageSize < totalCount;

    return NextResponse.json({
      success: true,
      data: data as TaskTemplate[],
      pagination: {
        page,
        page_size: pageSize,
        total_count: totalCount,
        has_more: hasMore
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

// ============================================================================
// POST /api/hero-tasks/templates - Create new template
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.template_data) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and template_data are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    const createRequest: CreateTaskTemplateRequest = {
      name: body.name,
      description: body.description || '',
      category: body.category || TaskTemplateCategory.CUSTOM,
      icon: body.icon || 'FileText',
      color: body.color || '#3B82F6',
      is_public: body.is_public || false,
      template_data: body.template_data,
      tags: body.tags || [],
      metadata: body.metadata || {}
    };

    const { data, error } = await supabase
      .from('hero_task_templates')
      .insert({
        ...createRequest,
        usage_count: 0,
        is_default: false
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create template: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data as TaskTemplate,
      message: 'Template created successfully',
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
