/**
 * Hero Tasks - Task Template Usage API Routes
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import {
  TaskTemplate,
  CreateHeroTaskRequest,
  ApiResponse,
  TaskTemplateUsage
} from '@/types/hero-tasks';

const supabase = createClient();

// ============================================================================
// POST /api/hero-tasks/templates/[templateId]/use - Use template to create task
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = params.templateId;
    const body = await request.json();
    
    // Get the template
    const { data: template, error: templateError } = await supabase
      .from('hero_task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Check if template is public or user has access
    if (!template.is_public) {
      // Add user permission check here if needed
      // For now, we'll allow usage
    }

    // Generate task data from template
    const taskData = generateTaskFromTemplate(template, body.customizations || {});

    // Create the task
    const { data: task, error: taskError } = await supabase
      .from('hero_tasks')
      .insert(taskData)
      .select()
      .single();

    if (taskError) {
      throw new Error(`Failed to create task from template: ${taskError.message}`);
    }

    // Record template usage
    const { error: usageError } = await supabase
      .from('hero_task_template_usage')
      .insert({
        template_id: templateId,
        task_id: task.id,
        used_at: new Date().toISOString(),
        used_by: body.user_id,
        customizations: body.customizations || {}
      });

    if (usageError) {
      console.warn('Failed to record template usage:', usageError);
    }

    // Update template usage count
    const { error: updateError } = await supabase
      .from('hero_task_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', templateId);

    if (updateError) {
      console.warn('Failed to update template usage count:', updateError);
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: `Task created from template "${template.name}"`,
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

// ============================================================================
// GET /api/hero-tasks/templates/[templateId] - Get specific template
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const templateId = params.templateId;

    const { data: template, error } = await supabase
      .from('hero_task_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error || !template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: template as TaskTemplate,
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
// Helper Functions
// ============================================================================

function generateTaskFromTemplate(template: TaskTemplate, customizations: Record<string, any>): CreateHeroTaskRequest {
  const { template_data } = template;
  
  // Process title template with customizations
  let title = template_data.title_template;
  Object.keys(customizations).forEach(key => {
    const placeholder = `{{${key}}}`;
    title = title.replace(new RegExp(placeholder, 'g'), customizations[key] || placeholder);
  });

  // Process description template with customizations
  let description = template_data.description_template;
  if (description) {
    Object.keys(customizations).forEach(key => {
      const placeholder = `{{${key}}}`;
      description = description!.replace(new RegExp(placeholder, 'g'), customizations[key] || placeholder);
    });
  }

  return {
    title,
    description,
    priority: template_data.priority,
    type: template_data.type,
    estimated_duration_hours: template_data.estimated_duration_hours,
    tags: [...template_data.default_tags, ...(customizations.tags || [])],
    assignee_id: customizations.assignee_id || template_data.default_assignee_id,
    due_date: customizations.due_date,
    metadata: {
      ...template_data.metadata_template,
      created_from_template: template.id,
      template_name: template.name,
      template_category: template.category,
      customizations
    }
  };
}
