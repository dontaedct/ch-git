/**
 * Hero Tasks - Export API Routes
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';
import {
  HeroTask,
  ExportRequest,
  ExportResult,
  ExportFormat,
  ExportType,
  TaskSearchFilters,
  ApiResponse,
  TaskAnalytics
} from '@/types/hero-tasks';

const supabase = createClient();

// ============================================================================
// POST /api/hero-tasks/export - Export tasks
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const exportRequest: ExportRequest = body;

    // Validate export request
    if (!exportRequest.export_type || !exportRequest.format) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: export_type and format are required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Get tasks based on export type
    const tasks = await getTasksForExport(exportRequest);
    
    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No tasks found for export',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Generate export file
    const exportResult = await generateExportFile(tasks, exportRequest);

    if (!exportResult.success) {
      return NextResponse.json({
        success: false,
        error: exportResult.error || 'Failed to generate export file',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: exportResult,
      message: `Export generated successfully: ${exportResult.file_name}`,
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

async function getTasksForExport(exportRequest: ExportRequest): Promise<HeroTask[]> {
  let query = supabase
    .from('hero_tasks')
    .select(`
      *,
      subtasks:hero_subtasks(*),
      dependencies:hero_task_dependencies(*),
      attachments:hero_task_attachments(*),
      comments:hero_task_comments(*),
      workflow_history:hero_workflow_history(*)
    `);

  switch (exportRequest.export_type) {
    case ExportType.ALL_TASKS:
      // No additional filters
      break;

    case ExportType.FILTERED_TASKS:
      if (exportRequest.filters) {
        query = applyFilters(query, exportRequest.filters);
      }
      break;

    case ExportType.SELECTED_TASKS:
      if (exportRequest.task_ids && exportRequest.task_ids.length > 0) {
        query = query.in('id', exportRequest.task_ids);
      } else {
        throw new Error('No task IDs provided for selected tasks export');
      }
      break;

    case ExportType.TASK_REPORT:
    case ExportType.ANALYTICS_REPORT:
    case ExportType.CUSTOM_REPORT:
      if (exportRequest.filters) {
        query = applyFilters(query, exportRequest.filters);
      }
      break;

    default:
      throw new Error(`Unknown export type: ${exportRequest.export_type}`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch tasks: ${error.message}`);
  }

  return data as HeroTask[];
}

function applyFilters(query: any, filters: TaskSearchFilters) {
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

  return query;
}

async function generateExportFile(tasks: HeroTask[], exportRequest: ExportRequest): Promise<ExportResult> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `hero-tasks-export-${timestamp}`;

  try {
    switch (exportRequest.format) {
      case ExportFormat.CSV:
        return await generateCSVExport(tasks, exportRequest, fileName);
      
      case ExportFormat.JSON:
        return await generateJSONExport(tasks, exportRequest, fileName);
      
      case ExportFormat.PDF:
        return await generatePDFExport(tasks, exportRequest, fileName);
      
      case ExportFormat.EXCEL:
        return await generateExcelExport(tasks, exportRequest, fileName);
      
      default:
        throw new Error(`Unsupported export format: ${exportRequest.format}`);
    }
  } catch (error) {
    return {
      success: false,
      file_name: fileName,
      file_size: 0,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function generateCSVExport(tasks: HeroTask[], exportRequest: ExportRequest, fileName: string): Promise<ExportResult> {
  const csvData = convertTasksToCSV(tasks, exportRequest.options);
  const csvContent = csvData.join('\n');
  const fileSize = new Blob([csvContent]).size;

  // In a real implementation, you would save this to a file storage service
  // For now, we'll return a data URL
  const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

  return {
    success: true,
    download_url: dataUrl,
    file_name: `${fileName}.csv`,
    file_size: fileSize,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

async function generateJSONExport(tasks: HeroTask[], exportRequest: ExportRequest, fileName: string): Promise<ExportResult> {
  const exportData = {
    tasks: tasks,
    export_date: new Date().toISOString(),
    export_format: 'json',
    filters_applied: exportRequest.filters,
    export_metadata: {
      total_tasks: tasks.length,
      export_type: exportRequest.export_type,
      user_id: 'current-user', // This would come from auth context
      export_options: exportRequest.options
    }
  };

  const jsonContent = JSON.stringify(exportData, null, 2);
  const fileSize = new Blob([jsonContent]).size;

  const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`;

  return {
    success: true,
    download_url: dataUrl,
    file_name: `${fileName}.json`,
    file_size: fileSize,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

async function generatePDFExport(tasks: HeroTask[], exportRequest: ExportRequest, fileName: string): Promise<ExportResult> {
  // For PDF generation, you would typically use a library like Puppeteer or jsPDF
  // This is a simplified implementation
  const pdfContent = generatePDFContent(tasks, exportRequest);
  const fileSize = new Blob([pdfContent]).size;

  const dataUrl = `data:application/pdf;base64,${btoa(pdfContent)}`;

  return {
    success: true,
    download_url: dataUrl,
    file_name: `${fileName}.pdf`,
    file_size: fileSize,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

async function generateExcelExport(tasks: HeroTask[], exportRequest: ExportRequest, fileName: string): Promise<ExportResult> {
  // For Excel generation, you would typically use a library like xlsx
  // This is a simplified implementation
  const excelContent = convertTasksToExcel(tasks, exportRequest.options);
  const fileSize = new Blob([excelContent]).size;

  const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${btoa(excelContent)}`;

  return {
    success: true,
    download_url: dataUrl,
    file_name: `${fileName}.xlsx`,
    file_size: fileSize,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

function convertTasksToCSV(tasks: HeroTask[], options: any): string[] {
  const headers = [
    'Task Number',
    'Title',
    'Description',
    'Status',
    'Priority',
    'Type',
    'Assignee',
    'Due Date',
    'Created At',
    'Updated At',
    'Estimated Hours',
    'Actual Hours',
    'Current Phase',
    'Tags'
  ];

  if (options.include_subtasks) {
    headers.push('Subtasks Count');
  }

  if (options.include_comments) {
    headers.push('Comments Count');
  }

  const csvRows = [headers.join(',')];

  tasks.forEach(task => {
    const row = [
      `"${task.task_number}"`,
      `"${task.title.replace(/"/g, '""')}"`,
      `"${(task.description || '').replace(/"/g, '""')}"`,
      `"${task.status}"`,
      `"${task.priority}"`,
      `"${task.type}"`,
      `"${task.assignee_id || ''}"`,
      `"${task.due_date || ''}"`,
      `"${task.created_at}"`,
      `"${task.updated_at}"`,
      `"${task.estimated_duration_hours || ''}"`,
      `"${task.actual_duration_hours || ''}"`,
      `"${task.current_phase}"`,
      `"${task.tags.join('; ')}"`
    ];

    if (options.include_subtasks) {
      row.push(`"${task.subtasks?.length || 0}"`);
    }

    if (options.include_comments) {
      row.push(`"${task.comments?.length || 0}"`);
    }

    csvRows.push(row.join(','));
  });

  return csvRows;
}

function generatePDFContent(tasks: HeroTask[], exportRequest: ExportRequest): string {
  // This is a simplified PDF generation
  // In a real implementation, you would use a proper PDF library
  let content = `Hero Tasks Export Report\n`;
  content += `Generated: ${new Date().toLocaleString()}\n`;
  content += `Total Tasks: ${tasks.length}\n\n`;

  tasks.forEach((task, index) => {
    content += `${index + 1}. ${task.task_number}: ${task.title}\n`;
    content += `   Status: ${task.status} | Priority: ${task.priority} | Type: ${task.type}\n`;
    if (task.description) {
      content += `   Description: ${task.description.substring(0, 100)}...\n`;
    }
    content += `   Created: ${new Date(task.created_at).toLocaleDateString()}\n\n`;
  });

  return content;
}

function convertTasksToExcel(tasks: HeroTask[], options: any): string {
  // This is a simplified Excel generation
  // In a real implementation, you would use the xlsx library
  const csvData = convertTasksToCSV(tasks, options);
  return csvData.join('\n');
}
