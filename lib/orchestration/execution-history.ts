/**
 * Workflow Execution History Tracking
 * 
 * Implements comprehensive workflow execution history tracking with
 * storage, retrieval, and analytics per PRD Section 8 requirements.
 */

import {
  WorkflowExecution,
  ExecutionStatus,
  ExecutionMetadata,
  StepResult,
  ExecutionError,
  ExecutionMetrics,
  WorkflowMetrics,
  Environment,
  TriggerType,
  ExecutionPriority,
  PaginationOptions,
  PaginatedResponse,
  FilterOptions
} from './architecture';

// ============================================================================
// Execution History Configuration
// ============================================================================

export interface ExecutionHistoryConfig {
  maxHistorySize: number;
  retentionDays: number;
  enableMetrics: boolean;
  enableAnalytics: boolean;
  enableCompression: boolean;
  batchSize: number;
  cleanupIntervalMs: number;
}

export interface ExecutionHistoryEntry {
  id: string;
  execution: WorkflowExecution;
  metadata: ExecutionMetadata;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  compressed: boolean;
}

export interface ExecutionAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  errorDistribution: Record<string, number>;
  triggerTypeDistribution: Record<TriggerType, number>;
  environmentDistribution: Record<Environment, number>;
  priorityDistribution: Record<ExecutionPriority, number>;
  timeSeriesData: Array<{
    timestamp: Date;
    executions: number;
    successes: number;
    failures: number;
    avgDuration: number;
  }>;
}

export interface ExecutionSearchOptions {
  query?: string;
  filters?: FilterOptions;
  pagination?: PaginationOptions;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// ============================================================================
// Execution History Manager Class
// ============================================================================

export class ExecutionHistoryManager {
  private history: Map<string, ExecutionHistoryEntry> = new Map();
  private metrics: ExecutionMetrics[] = [];
  private analytics: ExecutionAnalytics;
  private cleanupInterval?: NodeJS.Timeout;
  private isProcessing = false;

  constructor(private config: ExecutionHistoryConfig) {
    this.analytics = this.initializeAnalytics();
    this.startCleanupProcess();
  }

  /**
   * Store execution history
   */
  async storeExecution(execution: WorkflowExecution): Promise<void> {
    const entry: ExecutionHistoryEntry = {
      id: execution.id,
      execution: this.config.enableCompression ? this.compressExecution(execution) : execution,
      metadata: execution.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      archived: false,
      compressed: this.config.enableCompression
    };

    this.history.set(execution.id, entry);
    
    if (this.config.enableMetrics) {
      this.updateMetrics(execution);
    }
    
    if (this.config.enableAnalytics) {
      this.updateAnalytics(execution);
    }

    // Check if we need to archive old entries
    if (this.history.size > this.config.maxHistorySize) {
      await this.archiveOldEntries();
    }
  }

  /**
   * Get execution history by ID
   */
  getExecution(executionId: string): WorkflowExecution | null {
    const entry = this.history.get(executionId);
    if (!entry) {
      return null;
    }

    return this.config.enableCompression && entry.compressed 
      ? this.decompressExecution(entry.execution)
      : entry.execution;
  }

  /**
   * Get execution history with search and filtering
   */
  getExecutions(options: ExecutionSearchOptions = {}): PaginatedResponse<WorkflowExecution> {
    let executions = Array.from(this.history.values())
      .filter(entry => !entry.archived)
      .map(entry => this.config.enableCompression && entry.compressed 
        ? this.decompressExecution(entry.execution)
        : entry.execution
      );

    // Apply filters
    if (options.filters) {
      executions = this.applyFilters(executions, options.filters);
    }

    // Apply search query
    if (options.query) {
      executions = this.applySearchQuery(executions, options.query);
    }

    // Apply date range
    if (options.dateRange) {
      executions = executions.filter(execution => 
        execution.startTime >= options.dateRange!.start &&
        execution.startTime <= options.dateRange!.end
      );
    }

    // Apply sorting
    if (options.sortBy) {
      executions = this.applySorting(executions, options.sortBy, options.sortOrder || 'desc');
    }

    // Apply pagination
    const pagination = options.pagination || { page: 1, limit: 50 };
    const startIndex = (pagination.page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedExecutions = executions.slice(startIndex, endIndex);

    return {
      data: paginatedExecutions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: executions.length,
        totalPages: Math.ceil(executions.length / pagination.limit),
        hasNext: endIndex < executions.length,
        hasPrev: pagination.page > 1
      }
    };
  }

  /**
   * Get execution metrics
   */
  getExecutionMetrics(executionId: string): ExecutionMetrics | null {
    const execution = this.getExecution(executionId);
    if (!execution) {
      return null;
    }

    return {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      duration: execution.duration || 0,
      stepCount: execution.results.length,
      successRate: this.calculateSuccessRate(execution),
      timestamp: execution.startTime,
      environment: execution.metadata.environment,
      triggerType: execution.metadata.triggerType
    };
  }

  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowId: string): WorkflowMetrics | null {
    const workflowExecutions = Array.from(this.history.values())
      .filter(entry => !entry.archived)
      .map(entry => this.config.enableCompression && entry.compressed 
        ? this.decompressExecution(entry.execution)
        : entry.execution
      )
      .filter(execution => execution.workflowId === workflowId);

    if (workflowExecutions.length === 0) {
      return null;
    }

    const totalExecutions = workflowExecutions.length;
    const successfulExecutions = workflowExecutions.filter(e => e.status === 'completed').length;
    const failedExecutions = workflowExecutions.filter(e => e.status === 'failed').length;
    const successRate = (successfulExecutions / totalExecutions) * 100;

    const durations = workflowExecutions
      .map(e => e.duration || 0)
      .filter(d => d > 0)
      .sort((a, b) => a - b);

    const avgExecutionTime = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    const p95ExecutionTime = durations.length > 0 
      ? durations[Math.floor(durations.length * 0.95)] 
      : 0;

    const p99ExecutionTime = durations.length > 0 
      ? durations[Math.floor(durations.length * 0.99)] 
      : 0;

    const lastExecution = workflowExecutions
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())[0];

    return {
      workflowId,
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      successRate,
      avgExecutionTime,
      p95ExecutionTime,
      p99ExecutionTime,
      lastExecution: lastExecution?.startTime,
      environment: lastExecution?.metadata.environment || 'prod'
    };
  }

  /**
   * Get execution analytics
   */
  getAnalytics(): ExecutionAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get execution trends
   */
  getExecutionTrends(
    timeRange: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 30
  ): Array<{
    timestamp: Date;
    executions: number;
    successes: number;
    failures: number;
    avgDuration: number;
  }> {
    const now = new Date();
    const trends: Array<{
      timestamp: Date;
      executions: number;
      successes: number;
      failures: number;
      avgDuration: number;
    }> = [];

    for (let i = limit - 1; i >= 0; i--) {
      const timestamp = new Date(now);
      
      switch (timeRange) {
        case 'hour':
          timestamp.setHours(timestamp.getHours() - i);
          break;
        case 'day':
          timestamp.setDate(timestamp.getDate() - i);
          break;
        case 'week':
          timestamp.setDate(timestamp.getDate() - (i * 7));
          break;
        case 'month':
          timestamp.setMonth(timestamp.getMonth() - i);
          break;
      }

      const rangeStart = new Date(timestamp);
      const rangeEnd = new Date(timestamp);
      
      switch (timeRange) {
        case 'hour':
          rangeEnd.setHours(rangeEnd.getHours() + 1);
          break;
        case 'day':
          rangeEnd.setDate(rangeEnd.getDate() + 1);
          break;
        case 'week':
          rangeEnd.setDate(rangeEnd.getDate() + 7);
          break;
        case 'month':
          rangeEnd.setMonth(rangeEnd.getMonth() + 1);
          break;
      }

      const executionsInRange = Array.from(this.history.values())
        .filter(entry => !entry.archived)
        .map(entry => this.config.enableCompression && entry.compressed 
          ? this.decompressExecution(entry.execution)
          : entry.execution
        )
        .filter(execution => 
          execution.startTime >= rangeStart && 
          execution.startTime < rangeEnd
        );

      const executions = executionsInRange.length;
      const successes = executionsInRange.filter(e => e.status === 'completed').length;
      const failures = executionsInRange.filter(e => e.status === 'failed').length;
      const avgDuration = executions > 0 
        ? executionsInRange
            .map(e => e.duration || 0)
            .reduce((sum, d) => sum + d, 0) / executions
        : 0;

      trends.push({
        timestamp,
        executions,
        successes,
        failures,
        avgDuration
      });
    }

    return trends;
  }

  /**
   * Archive old executions
   */
  async archiveOldEntries(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    let archivedCount = 0;
    const entriesToArchive: string[] = [];

    for (const [id, entry] of this.history.entries()) {
      if (entry.createdAt < cutoffDate && !entry.archived) {
        entriesToArchive.push(id);
      }
    }

    for (const id of entriesToArchive) {
      const entry = this.history.get(id);
      if (entry) {
        entry.archived = true;
        entry.updatedAt = new Date();
        archivedCount++;
      }
    }

    if (this.config.enableLogging && archivedCount > 0) {
      console.log(`[ExecutionHistory] Archived ${archivedCount} old entries`);
    }

    return archivedCount;
  }

  /**
   * Clean up archived entries
   */
  async cleanupArchivedEntries(): Promise<number> {
    const entriesToDelete: string[] = [];
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (this.config.retentionDays * 2));

    for (const [id, entry] of this.history.entries()) {
      if (entry.archived && entry.createdAt < cutoffDate) {
        entriesToDelete.push(id);
      }
    }

    for (const id of entriesToDelete) {
      this.history.delete(id);
    }

    if (this.config.enableLogging && entriesToDelete.length > 0) {
      console.log(`[ExecutionHistory] Cleaned up ${entriesToDelete.length} archived entries`);
    }

    return entriesToDelete.length;
  }

  /**
   * Get history size
   */
  getHistorySize(): number {
    return this.history.size;
  }

  /**
   * Get active history size (non-archived)
   */
  getActiveHistorySize(): number {
    return Array.from(this.history.values()).filter(entry => !entry.archived).length;
  }

  /**
   * Shutdown history manager
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    
    if (this.config.enableLogging) {
      console.log('[ExecutionHistory] History manager shutdown');
    }
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Initialize analytics
   */
  private initializeAnalytics(): ExecutionAnalytics {
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      successRate: 0,
      averageExecutionTime: 0,
      p95ExecutionTime: 0,
      p99ExecutionTime: 0,
      errorDistribution: {},
      triggerTypeDistribution: {} as Record<TriggerType, number>,
      environmentDistribution: {} as Record<Environment, number>,
      priorityDistribution: {} as Record<ExecutionPriority, number>,
      timeSeriesData: []
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(execution: WorkflowExecution): void {
    const metrics: ExecutionMetrics = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: execution.status,
      duration: execution.duration || 0,
      stepCount: execution.results.length,
      successRate: this.calculateSuccessRate(execution),
      timestamp: execution.startTime,
      environment: execution.metadata.environment,
      triggerType: execution.metadata.triggerType
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-5000);
    }
  }

  /**
   * Update analytics
   */
  private updateAnalytics(execution: WorkflowExecution): void {
    this.analytics.totalExecutions++;
    
    if (execution.status === 'completed') {
      this.analytics.successfulExecutions++;
    } else if (execution.status === 'failed') {
      this.analytics.failedExecutions++;
    }

    this.analytics.successRate = 
      (this.analytics.successfulExecutions / this.analytics.totalExecutions) * 100;

    // Update execution time statistics
    if (execution.duration) {
      const durations = this.metrics
        .map(m => m.duration)
        .filter(d => d > 0)
        .sort((a, b) => a - b);

      if (durations.length > 0) {
        this.analytics.averageExecutionTime = 
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
        this.analytics.p95ExecutionTime = durations[Math.floor(durations.length * 0.95)];
        this.analytics.p99ExecutionTime = durations[Math.floor(durations.length * 0.99)];
      }
    }

    // Update error distribution
    for (const error of execution.errors) {
      this.analytics.errorDistribution[error.type] = 
        (this.analytics.errorDistribution[error.type] || 0) + 1;
    }

    // Update trigger type distribution
    this.analytics.triggerTypeDistribution[execution.metadata.triggerType] = 
      (this.analytics.triggerTypeDistribution[execution.metadata.triggerType] || 0) + 1;

    // Update environment distribution
    this.analytics.environmentDistribution[execution.metadata.environment] = 
      (this.analytics.environmentDistribution[execution.metadata.environment] || 0) + 1;
  }

  /**
   * Calculate success rate for execution
   */
  private calculateSuccessRate(execution: WorkflowExecution): number {
    if (execution.results.length === 0) {
      return 0;
    }

    const successfulSteps = execution.results.filter(r => r.status === 'completed').length;
    return (successfulSteps / execution.results.length) * 100;
  }

  /**
   * Apply filters to executions
   */
  private applyFilters(executions: WorkflowExecution[], filters: FilterOptions): WorkflowExecution[] {
    return executions.filter(execution => {
      if (filters.status && execution.status !== filters.status) {
        return false;
      }
      
      if (filters.environment && execution.metadata.environment !== filters.environment) {
        return false;
      }
      
      if (filters.createdBy && execution.metadata.userId !== filters.createdBy) {
        return false;
      }
      
      if (filters.tags && filters.tags.length > 0) {
        const executionTags = execution.metadata.tags || [];
        if (!filters.tags.some(tag => executionTags.includes(tag))) {
          return false;
        }
      }
      
      if (filters.dateRange) {
        if (execution.startTime < filters.dateRange.start || execution.startTime > filters.dateRange.end) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Apply search query to executions
   */
  private applySearchQuery(executions: WorkflowExecution[], query: string): WorkflowExecution[] {
    const searchTerm = query.toLowerCase();
    
    return executions.filter(execution => {
      return (
        execution.workflowId.toLowerCase().includes(searchTerm) ||
        execution.id.toLowerCase().includes(searchTerm) ||
        execution.metadata.correlationId?.toLowerCase().includes(searchTerm) ||
        execution.metadata.userId?.toLowerCase().includes(searchTerm) ||
        execution.results.some(r => r.stepName.toLowerCase().includes(searchTerm)) ||
        execution.errors.some(e => e.message.toLowerCase().includes(searchTerm))
      );
    });
  }

  /**
   * Apply sorting to executions
   */
  private applySorting(
    executions: WorkflowExecution[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): WorkflowExecution[] {
    return executions.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'startTime':
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
          break;
        case 'duration':
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'workflowId':
          aValue = a.workflowId;
          bValue = b.workflowId;
          break;
        default:
          aValue = a.startTime.getTime();
          bValue = b.startTime.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  /**
   * Compress execution data
   */
  private compressExecution(execution: WorkflowExecution): WorkflowExecution {
    // Simple compression by removing unnecessary data
    // In production, you might use a proper compression library
    return {
      ...execution,
      results: execution.results.map(result => ({
        ...result,
        logs: result.logs.slice(-10) // Keep only last 10 logs
      }))
    };
  }

  /**
   * Decompress execution data
   */
  private decompressExecution(execution: WorkflowExecution): WorkflowExecution {
    // Simple decompression
    // In production, you might use a proper decompression library
    return execution;
  }

  /**
   * Start cleanup process
   */
  private startCleanupProcess(): void {
    this.cleanupInterval = setInterval(async () => {
      await this.cleanupArchivedEntries();
    }, this.config.cleanupIntervalMs);
  }
}

// ============================================================================
// Execution History Factory
// ============================================================================

export class ExecutionHistoryFactory {
  /**
   * Create execution history manager with default configuration
   */
  static create(config: Partial<ExecutionHistoryConfig> = {}): ExecutionHistoryManager {
    const defaultConfig: ExecutionHistoryConfig = {
      maxHistorySize: 10000,
      retentionDays: 30,
      enableMetrics: true,
      enableAnalytics: true,
      enableCompression: false,
      batchSize: 100,
      cleanupIntervalMs: 3600000 // 1 hour
    };

    return new ExecutionHistoryManager({ ...defaultConfig, ...config });
  }

  /**
   * Create execution history manager for production
   */
  static createProduction(): ExecutionHistoryManager {
    return this.create({
      maxHistorySize: 100000,
      retentionDays: 90,
      enableMetrics: true,
      enableAnalytics: true,
      enableCompression: true,
      batchSize: 1000,
      cleanupIntervalMs: 7200000 // 2 hours
    });
  }

  /**
   * Create execution history manager for development
   */
  static createDevelopment(): ExecutionHistoryManager {
    return this.create({
      maxHistorySize: 1000,
      retentionDays: 7,
      enableMetrics: true,
      enableAnalytics: true,
      enableCompression: false,
      batchSize: 50,
      cleanupIntervalMs: 1800000 // 30 minutes
    });
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default ExecutionHistoryManager;
