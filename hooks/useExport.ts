/**
 * Hero Tasks - Export Hook
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import { useState, useCallback } from 'react';
import {
  ExportRequest,
  ExportResult,
  ExportFormat,
  ExportType,
  ExportOptions,
  TaskSearchFilters,
  HeroTask
} from '@/types/hero-tasks';

export interface UseExportOptions {
  onSuccess?: (result: ExportResult) => void;
  onError?: (error: string) => void;
}

export function useExport({ onSuccess, onError }: UseExportOptions = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState<ExportResult | null>(null);

  const exportTasks = useCallback(async (exportRequest: ExportRequest): Promise<ExportResult> => {
    try {
      setIsExporting(true);

      const response = await fetch('/api/hero-tasks/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Export failed');
      }

      const exportResult = result.data as ExportResult;
      
      // Trigger download
      if (exportResult.download_url) {
        await downloadFile(exportResult.download_url, exportResult.file_name);
      }

      setLastExport(exportResult);
      onSuccess?.(exportResult);
      
      return exportResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [onSuccess, onError]);

  const exportAllTasks = useCallback(async (format: ExportFormat = ExportFormat.CSV, options?: Partial<ExportOptions>) => {
    const exportRequest: ExportRequest = {
      export_type: ExportType.ALL_TASKS,
      format,
      options: {
        include_subtasks: true,
        include_comments: false,
        include_attachments: false,
        include_workflow_history: false,
        include_metadata: true,
        date_format: 'iso',
        ...options
      }
    };

    return await exportTasks(exportRequest);
  }, [exportTasks]);

  const exportFilteredTasks = useCallback(async (
    filters: TaskSearchFilters,
    format: ExportFormat = ExportFormat.CSV,
    options?: Partial<ExportOptions>
  ) => {
    const exportRequest: ExportRequest = {
      export_type: ExportType.FILTERED_TASKS,
      format,
      filters,
      options: {
        include_subtasks: true,
        include_comments: false,
        include_attachments: false,
        include_workflow_history: false,
        include_metadata: true,
        date_format: 'iso',
        ...options
      }
    };

    return await exportTasks(exportRequest);
  }, [exportTasks]);

  const exportSelectedTasks = useCallback(async (
    taskIds: string[],
    format: ExportFormat = ExportFormat.CSV,
    options?: Partial<ExportOptions>
  ) => {
    const exportRequest: ExportRequest = {
      export_type: ExportType.SELECTED_TASKS,
      format,
      task_ids: taskIds,
      options: {
        include_subtasks: true,
        include_comments: false,
        include_attachments: false,
        include_workflow_history: false,
        include_metadata: true,
        date_format: 'iso',
        ...options
      }
    };

    return await exportTasks(exportRequest);
  }, [exportTasks]);

  const exportTaskReport = useCallback(async (
    filters?: TaskSearchFilters,
    format: ExportFormat = ExportFormat.PDF,
    options?: Partial<ExportOptions>
  ) => {
    const exportRequest: ExportRequest = {
      export_type: ExportType.TASK_REPORT,
      format,
      filters,
      options: {
        include_subtasks: true,
        include_comments: true,
        include_attachments: false,
        include_workflow_history: true,
        include_metadata: true,
        date_format: 'local',
        ...options
      },
      report_config: {
        title: 'Hero Tasks Report',
        description: 'Comprehensive task report generated from Hero Tasks',
        include_charts: true,
        include_summary: true,
        group_by: 'status',
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    };

    return await exportTasks(exportRequest);
  }, [exportTasks]);

  const exportAnalyticsReport = useCallback(async (
    format: ExportFormat = ExportFormat.PDF,
    options?: Partial<ExportOptions>
  ) => {
    const exportRequest: ExportRequest = {
      export_type: ExportType.ANALYTICS_REPORT,
      format,
      options: {
        include_subtasks: false,
        include_comments: false,
        include_attachments: false,
        include_workflow_history: false,
        include_metadata: true,
        date_format: 'local',
        ...options
      },
      report_config: {
        title: 'Hero Tasks Analytics Report',
        description: 'Analytics and metrics report for Hero Tasks',
        include_charts: true,
        include_summary: true,
        group_by: 'priority',
        sort_by: 'created_at',
        sort_order: 'desc'
      }
    };

    return await exportTasks(exportRequest);
  }, [exportTasks]);

  const quickExportCSV = useCallback(async (tasks: HeroTask[]) => {
    const taskIds = tasks.map(task => task.id);
    return await exportSelectedTasks(taskIds, ExportFormat.CSV, {
      include_subtasks: false,
      include_comments: false,
      include_attachments: false,
      include_workflow_history: false,
      include_metadata: false,
      date_format: 'local'
    });
  }, [exportSelectedTasks]);

  const quickExportJSON = useCallback(async (tasks: HeroTask[]) => {
    const taskIds = tasks.map(task => task.id);
    return await exportSelectedTasks(taskIds, ExportFormat.JSON, {
      include_subtasks: true,
      include_comments: true,
      include_attachments: true,
      include_workflow_history: true,
      include_metadata: true,
      date_format: 'iso'
    });
  }, [exportSelectedTasks]);

  return {
    // State
    isExporting,
    lastExport,

    // Export functions
    exportTasks,
    exportAllTasks,
    exportFilteredTasks,
    exportSelectedTasks,
    exportTaskReport,
    exportAnalyticsReport,

    // Quick export functions
    quickExportCSV,
    quickExportJSON,

    // Helpers
    canExport: !isExporting,
    hasLastExport: !!lastExport
  };
}

// Helper function to trigger file download
async function downloadFile(url: string, filename: string) {
  try {
    // Handle data URLs
    if (url.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Handle regular URLs
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

export default useExport;
