/**
 * @fileoverview Analytics Export Service
 * Handles data export, scheduling, and delivery of analytics reports
 */

import { AnalyticsData, AnalyticsFilters } from '@/lib/hooks/use-analytics';

export interface ExportJob {
  id: string;
  name: string;
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  filters: AnalyticsFilters;
  metrics: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string; // HH:MM format
    timezone: string;
    recipients: string[];
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  downloadUrl?: string;
  error?: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  metrics: string[];
  filters: Partial<AnalyticsFilters>;
  isDefault: boolean;
}

export interface ScheduledExport {
  id: string;
  templateId: string;
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    time: string;
    timezone: string;
    recipients: string[];
  };
  isActive: boolean;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
}

/**
 * Export Service Class
 */
export class ExportService {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string = '/api/analytics/export', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
  }

  /**
   * Create a new export job
   */
  async createExportJob(request: {
    name: string;
    format: 'json' | 'csv' | 'xlsx' | 'pdf';
    filters: AnalyticsFilters;
    metrics: string[];
  }): Promise<ExportJob> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Export job creation error:', error);
      throw error;
    }
  }

  /**
   * Get export job status
   */
  async getExportJobStatus(jobId: string): Promise<ExportJob> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Export job status error:', error);
      throw error;
    }
  }

  /**
   * List all export jobs
   */
  async listExportJobs(): Promise<ExportJob[]> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('List export jobs error:', error);
      throw error;
    }
  }

  /**
   * Download export file
   */
  async downloadExport(jobId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/download`, {
        method: 'GET',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Download export error:', error);
      throw error;
    }
  }

  /**
   * Create export template
   */
  async createExportTemplate(template: Omit<ExportTemplate, 'id'>): Promise<ExportTemplate> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(template)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create export template error:', error);
      throw error;
    }
  }

  /**
   * List export templates
   */
  async listExportTemplates(): Promise<ExportTemplate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('List export templates error:', error);
      throw error;
    }
  }

  /**
   * Create scheduled export
   */
  async createScheduledExport(request: {
    templateId: string;
    schedule: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
      time: string;
      timezone: string;
      recipients: string[];
    };
  }): Promise<ScheduledExport> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Create scheduled export error:', error);
      throw error;
    }
  }

  /**
   * List scheduled exports
   */
  async listScheduledExports(): Promise<ScheduledExport[]> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('List scheduled exports error:', error);
      throw error;
    }
  }

  /**
   * Update scheduled export
   */
  async updateScheduledExport(
    id: string, 
    updates: Partial<ScheduledExport>
  ): Promise<ScheduledExport> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Update scheduled export error:', error);
      throw error;
    }
  }

  /**
   * Delete scheduled export
   */
  async deleteScheduledExport(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/scheduled/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Delete scheduled export error:', error);
      throw error;
    }
  }

  /**
   * Trigger immediate export from template
   */
  async triggerExportFromTemplate(templateId: string): Promise<ExportJob> {
    try {
      const response = await fetch(`${this.baseUrl}/templates/${templateId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Trigger export from template error:', error);
      throw error;
    }
  }
}

// Default export service instance
export const exportService = new ExportService();

// Utility functions for export operations
export const ExportUtils = {
  /**
   * Generate filename for export
   */
  generateFilename: (
    name: string, 
    format: string, 
    timeRange: string, 
    timestamp?: Date
  ): string => {
    const date = timestamp || new Date();
    const dateStr = date.toISOString().split('T')[0];
    const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedName}-${timeRange}-${dateStr}.${format}`;
  },

  /**
   * Format file size for display
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get MIME type for format
   */
  getMimeType: (format: string): string => {
    const mimeTypes: Record<string, string> = {
      'json': 'application/json',
      'csv': 'text/csv',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'pdf': 'application/pdf'
    };
    return mimeTypes[format] || 'application/octet-stream';
  },

  /**
   * Download file from blob
   */
  downloadFile: (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Validate export request
   */
  validateExportRequest: (request: {
    name: string;
    format: string;
    metrics: string[];
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Export name is required');
    }

    if (!['json', 'csv', 'xlsx', 'pdf'].includes(request.format)) {
      errors.push('Invalid export format');
    }

    if (!request.metrics || request.metrics.length === 0) {
      errors.push('At least one metric must be selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Calculate next run time for schedule
   */
  calculateNextRun: (
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    time: string,
    timezone: string
  ): Date => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    // If the time has already passed today, move to next occurrence
    if (nextRun <= now) {
      switch (frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
        case 'quarterly':
          nextRun.setMonth(nextRun.getMonth() + 3);
          break;
      }
    }

    return nextRun;
  },

  /**
   * Get frequency display text
   */
  getFrequencyDisplay: (frequency: string): string => {
    const displays: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    };
    return displays[frequency] || frequency;
  }
};
