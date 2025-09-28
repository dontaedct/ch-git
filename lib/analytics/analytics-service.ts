/**
 * @fileoverview Analytics Service - Real-time metrics and KPIs tracking
 * Handles API communication for analytics data and real-time updates
 */

import { AnalyticsData, AnalyticsFilters, RealTimeMetrics, ConversionFunnel, TrafficSource, DeviceBreakdown, TopPage } from '@/lib/hooks/use-analytics';

export interface AnalyticsAPIResponse {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
  timestamp: string;
}

export interface RealTimeMetricsResponse {
  success: boolean;
  data?: RealTimeMetrics;
  error?: string;
  timestamp: string;
}

export interface ExportRequest {
  format: 'json' | 'csv' | 'xlsx';
  timeRange: string;
  metrics: string[];
  filters?: AnalyticsFilters;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl?: string;
  error?: string;
}

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'changed';
  threshold: number;
  enabled: boolean;
  notificationChannels: string[];
}

export interface AlertResponse {
  success: boolean;
  alerts?: AlertConfig[];
  error?: string;
}

/**
 * Analytics Service Class - Unified analytics service with task analytics integration
 * Consolidated from multiple analytics services to eliminate duplicates (HT-034.8.1)
 */
export class AnalyticsService {
  private baseUrl: string;
  private apiKey: string;
  private supabaseClient: any;

  constructor(baseUrl: string = '/api/analytics', apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey || '';
    // Initialize Supabase client for task analytics
    this.initializeSupabaseClient();
  }

  private async initializeSupabaseClient() {
    try {
      const { createServiceRoleClient } = await import('@/lib/supabase/server');
      this.supabaseClient = createServiceRoleClient();
    } catch (error) {
      console.warn('Supabase client not available for task analytics:', error);
    }
  }

  /**
   * Fetch analytics data with filters
   */
  async getAnalytics(filters: AnalyticsFilters): Promise<AnalyticsData> {
    try {
      const response = await fetch(`${this.baseUrl}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(filters)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AnalyticsAPIResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch analytics data');
      }

      return result.data;
    } catch (error) {
      console.error('Analytics API error:', error);
      throw error;
    }
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      const response = await fetch(`${this.baseUrl}/realtime`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: RealTimeMetricsResponse = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch real-time metrics');
      }

      return result.data;
    } catch (error) {
      console.error('Real-time metrics API error:', error);
      throw error;
    }
  }

  /**
   * Get conversion funnel data
   */
  async getConversionFunnel(appId?: string): Promise<ConversionFunnel[]> {
    try {
      const url = appId ? `${this.baseUrl}/funnel/${appId}` : `${this.baseUrl}/funnel`;
      const response = await fetch(url, {
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
      console.error('Conversion funnel API error:', error);
      throw error;
    }
  }

  /**
   * Get traffic sources data
   */
  async getTrafficSources(filters?: AnalyticsFilters): Promise<TrafficSource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/traffic-sources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(filters || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Traffic sources API error:', error);
      throw error;
    }
  }

  /**
   * Get device breakdown data
   */
  async getDeviceBreakdown(filters?: AnalyticsFilters): Promise<DeviceBreakdown[]> {
    try {
      const response = await fetch(`${this.baseUrl}/device-breakdown`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(filters || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Device breakdown API error:', error);
      throw error;
    }
  }

  /**
   * Get top performing pages
   */
  async getTopPages(filters?: AnalyticsFilters): Promise<TopPage[]> {
    try {
      const response = await fetch(`${this.baseUrl}/top-pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(filters || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Top pages API error:', error);
      throw error;
    }
  }

  /**
   * Export analytics data
   */
  async exportData(request: ExportRequest): Promise<ExportResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/export`, {
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

      const result: ExportResponse = await response.json();
      return result;
    } catch (error) {
      console.error('Export API error:', error);
      throw error;
    }
  }

  /**
   * Get alert configurations
   */
  async getAlerts(): Promise<AlertConfig[]> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: AlertResponse = await response.json();
      return result.alerts || [];
    } catch (error) {
      console.error('Alerts API error:', error);
      throw error;
    }
  }

  /**
   * Create or update alert configuration
   */
  async saveAlert(alert: AlertConfig): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(alert)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Save alert API error:', error);
      throw error;
    }
  }

  /**
   * Delete alert configuration
   */
  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/alerts/${alertId}`, {
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
      console.error('Delete alert API error:', error);
      throw error;
    }
  }

  /**
   * Track custom event
   */
  async trackEvent(event: {
    name: string;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    timestamp?: Date;
  }): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          ...event,
          timestamp: event.timestamp || new Date()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Track event API error:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive task analytics (consolidated from service.ts)
   */
  async getTaskAnalytics(timeRange: {
    start: Date;
    end: Date;
  }): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    pendingTasks: number;
    overdueTasks: number;
    averageCompletionTime: number;
    tasksByPriority: Record<string, number>;
    tasksByStatus: Record<string, number>;
    tasksByAssignee: Record<string, number>;
    tasksByTag: Record<string, number>;
  }> {
    if (!this.supabaseClient) {
      throw new Error('Task analytics not available - Supabase client not initialized');
    }

    try {
      const { data: tasks, error } = await this.supabaseClient
        .from('hero_tasks')
        .select('*')
        .gte('created_at', timeRange.start.toISOString())
        .lte('created_at', timeRange.end.toISOString());

      if (error) {
        throw new Error(`Failed to fetch task analytics: ${error.message}`);
      }

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
      const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress').length;
      const pendingTasks = tasks.filter((t: any) => t.status === 'pending').length;
      const overdueTasks = tasks.filter((t: any) =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
      ).length;

      // Calculate average completion time
      const completedTasksWithTimes = tasks.filter((t: any) =>
        t.status === 'completed' && t.completed_at && t.created_at
      );
      const averageCompletionTime = completedTasksWithTimes.length > 0
        ? completedTasksWithTimes.reduce((sum: number, task: any) => {
            const created = new Date(task.created_at);
            const completed = new Date(task.completed_at);
            return sum + (completed.getTime() - created.getTime());
          }, 0) / completedTasksWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Group by various dimensions
      const tasksByPriority = tasks.reduce((acc: any, task: any) => {
        const priority = task.priority || 'medium';
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {});

      const tasksByStatus = tasks.reduce((acc: any, task: any) => {
        const status = task.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const tasksByAssignee = tasks.reduce((acc: any, task: any) => {
        const assignee = task.assignee || 'unassigned';
        acc[assignee] = (acc[assignee] || 0) + 1;
        return acc;
      }, {});

      const tasksByTag = tasks.reduce((acc: any, task: any) => {
        const tags = task.tags || [];
        tags.forEach((tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
        return acc;
      }, {});

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overdueTasks,
        averageCompletionTime,
        tasksByPriority,
        tasksByStatus,
        tasksByAssignee,
        tasksByTag
      };
    } catch (error) {
      console.error('Task analytics error:', error);
      throw error;
    }
  }

  /**
   * Get analytics health status
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    lastUpdate: Date;
    metrics: {
      dataFreshness: number;
      apiResponseTime: number;
      errorRate: number;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
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
      return result.data || {
        status: 'down',
        lastUpdate: new Date(),
        metrics: {
          dataFreshness: 0,
          apiResponseTime: 0,
          errorRate: 100
        }
      };
    } catch (error) {
      console.error('Health status API error:', error);
      return {
        status: 'down',
        lastUpdate: new Date(),
        metrics: {
          dataFreshness: 0,
          apiResponseTime: 0,
          errorRate: 100
        }
      };
    }
  }
}

// Default analytics service instance
export const analyticsService = new AnalyticsService();

// Utility functions for common analytics operations
export const AnalyticsUtils = {
  /**
   * Format currency for display
   */
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  /**
   * Format percentage for display
   */
  formatPercentage: (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
  },

  /**
   * Format time duration
   */
  formatDuration: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  /**
   * Generate color for chart series
   */
  getChartColor: (index: number): string => {
    const colors = [
      '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
      '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
    ];
    return colors[index % colors.length];
  },

  /**
   * Validate analytics filters
   */
  validateFilters: (filters: AnalyticsFilters): boolean => {
    if (!filters.timeRange) return false;
    
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      return fromDate <= toDate;
    }
    
    return true;
  },

  /**
   * Generate export filename
   */
  generateExportFilename: (format: string, timeRange: string): string => {
    const timestamp = new Date().toISOString().split('T')[0];
    return `analytics-${timeRange}-${timestamp}.${format}`;
  }
};
