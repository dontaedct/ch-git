/**
 * @fileoverview Analytics Types and Interfaces
 * @module lib/analytics/types
 * @author OSS Hero System
 * @version 1.0.0
 */

export interface TaskAnalytics {
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
}

export interface VelocityMetrics {
  currentSprint: {
    plannedPoints: number;
    completedPoints: number;
    remainingPoints: number;
    daysRemaining: number;
    averageVelocity: number;
    projectedCompletion: Date;
  };
  historicalVelocity: Array<{
    sprint: string;
    plannedPoints: number;
    completedPoints: number;
    velocity: number;
    startDate: Date;
    endDate: Date;
  }>;
  teamVelocity: Record<string, number>;
  velocityTrend: 'increasing' | 'stable' | 'decreasing';
}

export interface BurndownData {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  totalPoints: number;
  dailyProgress: Array<{
    date: Date;
    remainingPoints: number;
    completedPoints: number;
    idealBurndown: number;
  }>;
  currentDay: number;
  totalDays: number;
  isOnTrack: boolean;
  projectedCompletion: Date;
}

export interface ProductivityInsights {
  bottlenecks: Array<{
    type: 'assignee' | 'priority' | 'tag' | 'dependency';
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    affectedTasks: number;
  }>;
  teamPerformance: Array<{
    assignee: string;
    completedTasks: number;
    averageCompletionTime: number;
    productivityScore: number;
    trend: 'improving' | 'stable' | 'declining';
  }>;
  completionTrends: Array<{
    period: string;
    completedTasks: number;
    averageTime: number;
    efficiency: number;
  }>;
  recommendations: Array<{
    category: 'process' | 'resource' | 'timeline' | 'quality';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export interface DashboardConfig {
  widgets: Array<{
    id: string;
    type: 'burndown' | 'velocity' | 'productivity' | 'metrics' | 'insights';
    title: string;
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, any>;
    visible: boolean;
  }>;
  refreshInterval: number;
  dateRange: {
    start: Date;
    end: Date;
    type: 'custom' | 'last7days' | 'last30days' | 'last90days' | 'thisSprint' | 'lastSprint';
  };
  filters: {
    assignees: string[];
    tags: string[];
    priorities: string[];
    statuses: string[];
  };
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  type: 'custom' | 'last7days' | 'last30days' | 'last90days' | 'thisSprint' | 'lastSprint';
}

export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  xAxis: {
    label: string;
    type: 'category' | 'time' | 'number';
  };
  yAxis: {
    label: string;
    min?: number;
    max?: number;
  };
  data: ChartDataPoint[];
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  animation?: boolean;
}

export interface AnalyticsExport {
  format: 'csv' | 'json' | 'pdf';
  data: TaskAnalytics | VelocityMetrics | BurndownData | ProductivityInsights;
  filters: DashboardConfig['filters'];
  dateRange: AnalyticsTimeRange;
  generatedAt: Date;
  generatedBy: string;
}
