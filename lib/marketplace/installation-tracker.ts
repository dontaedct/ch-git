/**
 * HT-035.3.2: Installation Tracking & History System
 * 
 * Comprehensive installation tracking with history management, progress monitoring,
 * and rollback capabilities per PRD requirements.
 * 
 * Features:
 * - Installation progress tracking
 * - Installation history management
 * - Rollback tracking and management
 * - Installation analytics and reporting
 * - Real-time status updates
 * - Installation audit trails
 */

import { z } from 'zod';

// =============================================================================
// SCHEMA DEFINITIONS
// =============================================================================

export const InstallationProgressSchema = z.object({
  installationId: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string(),
  status: z.enum(['pending', 'validating', 'downloading', 'installing', 'configuring', 'testing', 'completed', 'failed', 'rolled_back']),
  progress: z.number().min(0).max(100),
  currentStep: z.string(),
  totalSteps: z.number().default(1),
  startedAt: z.date(),
  completedAt: z.date().optional(),
  estimatedCompletion: z.date().optional(),
  duration: z.number().default(0),
  error: z.string().optional(),
  warnings: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).default({}),
});

export const InstallationHistorySchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  version: z.string(),
  action: z.enum(['install', 'uninstall', 'update', 'rollback']),
  fromVersion: z.string().optional(),
  toVersion: z.string().optional(),
  status: z.enum(['success', 'failed', 'partial', 'cancelled']),
  timestamp: z.date(),
  duration: z.number(),
  initiatedBy: z.string(),
  rollbackId: z.string().optional(),
  details: z.record(z.unknown()).default({}),
  metadata: z.record(z.unknown()).default({}),
});

export const RollbackRecordSchema = z.object({
  rollbackId: z.string(),
  installationId: z.string(),
  moduleId: z.string(),
  tenantId: z.string(),
  fromVersion: z.string(),
  toVersion: z.string(),
  reason: z.string(),
  timestamp: z.date(),
  status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  backupPath: z.string().optional(),
  restorePath: z.string().optional(),
  duration: z.number().default(0),
  initiatedBy: z.string(),
  metadata: z.record(z.unknown()).default({}),
});

export const InstallationAnalyticsSchema = z.object({
  moduleId: z.string(),
  tenantId: z.string(),
  totalInstallations: z.number().default(0),
  successfulInstallations: z.number().default(0),
  failedInstallations: z.number().default(0),
  averageInstallationTime: z.number().default(0),
  lastInstallation: z.date().optional(),
  installationTrends: z.array(z.object({
    date: z.string(),
    count: z.number(),
    successRate: z.number(),
  })).default([]),
  commonIssues: z.array(z.string()).default([]),
  performanceMetrics: z.object({
    averageProgressRate: z.number().default(0),
    averageStepDuration: z.number().default(0),
    bottleneckSteps: z.array(z.string()).default([]),
  }).default({}),
});

// Type exports
export type InstallationProgress = z.infer<typeof InstallationProgressSchema>;
export type InstallationHistory = z.infer<typeof InstallationHistorySchema>;
export type RollbackRecord = z.infer<typeof RollbackRecordSchema>;
export type InstallationAnalytics = z.infer<typeof InstallationAnalyticsSchema>;

// =============================================================================
// INSTALLATION TRACKER CLASS
// =============================================================================

export class InstallationTracker {
  private activeInstallations: Map<string, InstallationProgress> = new Map();
  private installationHistory: Map<string, InstallationHistory[]> = new Map();
  private rollbackRecords: Map<string, RollbackRecord> = new Map();
  private analyticsCache: Map<string, InstallationAnalytics> = new Map();

  constructor() {
    this.initializeTracking();
  }

  /**
   * Start tracking an installation
   */
  async startInstallationTracking(
    installationId: string,
    moduleId: string,
    tenantId: string,
    version: string,
    initiatedBy: string,
    metadata: Record<string, unknown> = {}
  ): Promise<InstallationProgress> {
    const progress: InstallationProgress = {
      installationId,
      moduleId,
      tenantId,
      version,
      status: 'pending',
      progress: 0,
      currentStep: 'Initializing installation',
      totalSteps: 7, // validation, download, install, configure, test, complete, cleanup
      startedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + 300000), // 5 minutes estimate
      duration: 0,
      warnings: [],
      metadata: {
        ...metadata,
        initiatedBy,
        trackingStarted: new Date(),
      },
    };

    this.activeInstallations.set(installationId, progress);
    
    // Emit tracking event
    await this.emitTrackingEvent('installation_started', progress);
    
    return progress;
  }

  /**
   * Update installation progress
   */
  async updateInstallationProgress(
    installationId: string,
    updates: {
      status?: InstallationProgress['status'];
      progress?: number;
      currentStep?: string;
      error?: string;
      warnings?: string[];
      metadata?: Record<string, unknown>;
    }
  ): Promise<InstallationProgress | null> {
    const progress = this.activeInstallations.get(installationId);
    if (!progress) {
      return null;
    }

    // Update progress
    if (updates.status) progress.status = updates.status;
    if (updates.progress !== undefined) progress.progress = updates.progress;
    if (updates.currentStep) progress.currentStep = updates.currentStep;
    if (updates.error) progress.error = updates.error;
    if (updates.warnings) progress.warnings = [...progress.warnings, ...updates.warnings];
    if (updates.metadata) progress.metadata = { ...progress.metadata, ...updates.metadata };

    // Update duration
    progress.duration = Date.now() - progress.startedAt.getTime();

    // Update estimated completion based on progress
    if (updates.progress !== undefined && updates.progress > 0) {
      const elapsed = progress.duration;
      const estimatedTotal = (elapsed / updates.progress) * 100;
      progress.estimatedCompletion = new Date(progress.startedAt.getTime() + estimatedTotal);
    }

    this.activeInstallations.set(installationId, progress);

    // Emit tracking event
    await this.emitTrackingEvent('installation_progress', progress);

    return progress;
  }

  /**
   * Complete installation tracking
   */
  async completeInstallationTracking(
    installationId: string,
    success: boolean,
    finalMetadata: Record<string, unknown> = {}
  ): Promise<InstallationHistory | null> {
    const progress = this.activeInstallations.get(installationId);
    if (!progress) {
      return null;
    }

    // Update final progress
    progress.status = success ? 'completed' : 'failed';
    progress.progress = success ? 100 : progress.progress;
    progress.completedAt = new Date();
    progress.duration = progress.completedAt.getTime() - progress.startedAt.getTime();
    progress.metadata = { ...progress.metadata, ...finalMetadata };

    // Create history record
    const history: InstallationHistory = {
      id: this.generateHistoryId(),
      moduleId: progress.moduleId,
      tenantId: progress.tenantId,
      version: progress.version,
      action: 'install',
      toVersion: progress.version,
      status: success ? 'success' : 'failed',
      timestamp: progress.completedAt,
      duration: progress.duration,
      initiatedBy: progress.metadata.initiatedBy as string,
      details: {
        progress: progress.progress,
        steps: progress.totalSteps,
        warnings: progress.warnings,
        error: progress.error,
      },
      metadata: progress.metadata,
    };

    // Store history
    const key = `${progress.moduleId}-${progress.tenantId}`;
    const existing = this.installationHistory.get(key) || [];
    existing.push(history);
    this.installationHistory.set(key, existing);

    // Remove from active installations
    this.activeInstallations.delete(installationId);

    // Update analytics
    await this.updateAnalytics(progress.moduleId, progress.tenantId, history);

    // Emit tracking event
    await this.emitTrackingEvent('installation_completed', { progress, history });

    return history;
  }

  /**
   * Record installation history
   */
  async recordInstallationHistory(
    moduleId: string,
    tenantId: string,
    action: 'install' | 'uninstall' | 'update' | 'rollback',
    version: string,
    initiatedBy: string,
    status: 'success' | 'failed' | 'partial' | 'cancelled',
    duration: number,
    fromVersion?: string,
    rollbackId?: string,
    details: Record<string, unknown> = {},
    metadata: Record<string, unknown> = {}
  ): Promise<InstallationHistory> {
    const history: InstallationHistory = {
      id: this.generateHistoryId(),
      moduleId,
      tenantId,
      version,
      action,
      fromVersion,
      toVersion: version,
      status,
      timestamp: new Date(),
      duration,
      initiatedBy,
      rollbackId,
      details,
      metadata,
    };

    // Store history
    const key = `${moduleId}-${tenantId}`;
    const existing = this.installationHistory.get(key) || [];
    existing.push(history);
    this.installationHistory.set(key, existing);

    // Update analytics
    await this.updateAnalytics(moduleId, tenantId, history);

    // Emit tracking event
    await this.emitTrackingEvent('history_recorded', history);

    return history;
  }

  /**
   * Create rollback record
   */
  async createRollbackRecord(
    installationId: string,
    moduleId: string,
    tenantId: string,
    fromVersion: string,
    toVersion: string,
    reason: string,
    initiatedBy: string,
    backupPath?: string,
    metadata: Record<string, unknown> = {}
  ): Promise<RollbackRecord> {
    const rollbackRecord: RollbackRecord = {
      rollbackId: this.generateRollbackId(),
      installationId,
      moduleId,
      tenantId,
      fromVersion,
      toVersion,
      reason,
      timestamp: new Date(),
      status: 'pending',
      backupPath,
      restorePath: undefined,
      duration: 0,
      initiatedBy,
      metadata,
    };

    this.rollbackRecords.set(rollbackRecord.rollbackId, rollbackRecord);

    // Emit tracking event
    await this.emitTrackingEvent('rollback_created', rollbackRecord);

    return rollbackRecord;
  }

  /**
   * Update rollback status
   */
  async updateRollbackStatus(
    rollbackId: string,
    status: RollbackRecord['status'],
    restorePath?: string,
    duration?: number,
    metadata?: Record<string, unknown>
  ): Promise<RollbackRecord | null> {
    const rollback = this.rollbackRecords.get(rollbackId);
    if (!rollback) {
      return null;
    }

    rollback.status = status;
    if (restorePath) rollback.restorePath = restorePath;
    if (duration !== undefined) rollback.duration = duration;
    if (metadata) rollback.metadata = { ...rollback.metadata, ...metadata };

    this.rollbackRecords.set(rollbackId, rollback);

    // Emit tracking event
    await this.emitTrackingEvent('rollback_updated', rollback);

    return rollback;
  }

  /**
   * Get installation progress
   */
  async getInstallationProgress(installationId: string): Promise<InstallationProgress | null> {
    return this.activeInstallations.get(installationId) || null;
  }

  /**
   * Get active installations for a tenant
   */
  async getActiveInstallations(tenantId: string): Promise<InstallationProgress[]> {
    return Array.from(this.activeInstallations.values())
      .filter(progress => progress.tenantId === tenantId);
  }

  /**
   * Get installation history
   */
  async getInstallationHistory(
    moduleId: string,
    tenantId: string,
    options: {
      limit?: number;
      offset?: number;
      action?: InstallationHistory['action'];
      status?: InstallationHistory['status'];
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<InstallationHistory[]> {
    const key = `${moduleId}-${tenantId}`;
    let history = this.installationHistory.get(key) || [];

    // Apply filters
    if (options.action) {
      history = history.filter(h => h.action === options.action);
    }
    if (options.status) {
      history = history.filter(h => h.status === options.status);
    }
    if (options.startDate) {
      history = history.filter(h => h.timestamp >= options.startDate!);
    }
    if (options.endDate) {
      history = history.filter(h => h.timestamp <= options.endDate!);
    }

    // Sort by timestamp (newest first)
    history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || history.length;
    
    return history.slice(offset, offset + limit);
  }

  /**
   * Get rollback records
   */
  async getRollbackRecords(
    moduleId?: string,
    tenantId?: string,
    status?: RollbackRecord['status']
  ): Promise<RollbackRecord[]> {
    let records = Array.from(this.rollbackRecords.values());

    // Apply filters
    if (moduleId) {
      records = records.filter(r => r.moduleId === moduleId);
    }
    if (tenantId) {
      records = records.filter(r => r.tenantId === tenantId);
    }
    if (status) {
      records = records.filter(r => r.status === status);
    }

    // Sort by timestamp (newest first)
    records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return records;
  }

  /**
   * Get installation analytics
   */
  async getInstallationAnalytics(
    moduleId: string,
    tenantId: string,
    options: {
      includeTrends?: boolean;
      days?: number;
    } = {}
  ): Promise<InstallationAnalytics> {
    const cacheKey = `${moduleId}-${tenantId}-${JSON.stringify(options)}`;
    const cached = this.analyticsCache.get(cacheKey);
    
    if (cached && Date.now() - cached.metadata.timestamp.getTime() < 300000) { // 5 minutes
      return cached;
    }

    const analytics: InstallationAnalytics = {
      moduleId,
      tenantId,
      totalInstallations: 0,
      successfulInstallations: 0,
      failedInstallations: 0,
      averageInstallationTime: 0,
      lastInstallation: undefined,
      installationTrends: [],
      commonIssues: [],
      performanceMetrics: {
        averageProgressRate: 0,
        averageStepDuration: 0,
        bottleneckSteps: [],
      },
    };

    try {
      // Get installation history
      const history = await this.getInstallationHistory(moduleId, tenantId);
      
      analytics.totalInstallations = history.length;
      analytics.successfulInstallations = history.filter(h => h.status === 'success').length;
      analytics.failedInstallations = history.filter(h => h.status === 'failed').length;
      
      if (history.length > 0) {
        analytics.averageInstallationTime = history.reduce((sum, h) => sum + h.duration, 0) / history.length;
        analytics.lastInstallation = history[0].timestamp;
      }

      // Calculate trends if requested
      if (options.includeTrends) {
        analytics.installationTrends = await this.calculateInstallationTrends(
          moduleId,
          tenantId,
          options.days || 30
        );
      }

      // Analyze common issues
      analytics.commonIssues = await this.analyzeCommonIssues(moduleId, tenantId);

      // Calculate performance metrics
      analytics.performanceMetrics = await this.calculatePerformanceMetrics(moduleId, tenantId);

      // Cache the result
      this.analyticsCache.set(cacheKey, analytics);

      return analytics;

    } catch (error) {
      analytics.metadata.error = error instanceof Error ? error.message : String(error);
      return analytics;
    }
  }

  /**
   * Get installation statistics
   */
  async getInstallationStatistics(): Promise<{
    totalActiveInstallations: number;
    totalInstallationHistory: number;
    totalRollbacks: number;
    averageInstallationTime: number;
    successRate: number;
    mostActiveModules: Array<{ moduleId: string; count: number }>;
    mostActiveTenants: Array<{ tenantId: string; count: number }>;
    installationTrends: Array<{ date: string; count: number; successRate: number }>;
  }> {
    const activeInstallations = Array.from(this.activeInstallations.values());
    const allHistory = Array.from(this.installationHistory.values()).flat();
    const rollbacks = Array.from(this.rollbackRecords.values());

    const totalActiveInstallations = activeInstallations.length;
    const totalInstallationHistory = allHistory.length;
    const totalRollbacks = rollbacks.length;
    
    const averageInstallationTime = allHistory.length > 0 
      ? allHistory.reduce((sum, h) => sum + h.duration, 0) / allHistory.length 
      : 0;
    
    const successRate = allHistory.length > 0 
      ? (allHistory.filter(h => h.status === 'success').length / allHistory.length) * 100 
      : 0;

    // Count most active modules
    const moduleCounts = new Map<string, number>();
    allHistory.forEach(history => {
      const count = moduleCounts.get(history.moduleId) || 0;
      moduleCounts.set(history.moduleId, count + 1);
    });

    const mostActiveModules = Array.from(moduleCounts.entries())
      .map(([moduleId, count]) => ({ moduleId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Count most active tenants
    const tenantCounts = new Map<string, number>();
    allHistory.forEach(history => {
      const count = tenantCounts.get(history.tenantId) || 0;
      tenantCounts.set(history.tenantId, count + 1);
    });

    const mostActiveTenants = Array.from(tenantCounts.entries())
      .map(([tenantId, count]) => ({ tenantId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate installation trends (last 30 days)
    const trends: Array<{ date: string; count: number; successRate: number }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHistory = allHistory.filter(h => {
        const hDate = new Date(h.timestamp);
        return hDate.toISOString().split('T')[0] === dateStr;
      });

      const count = dayHistory.length;
      const successRate = count > 0 
        ? (dayHistory.filter(h => h.status === 'success').length / count) * 100 
        : 0;

      trends.push({ date: dateStr, count, successRate });
    }

    return {
      totalActiveInstallations,
      totalInstallationHistory,
      totalRollbacks,
      averageInstallationTime,
      successRate,
      mostActiveModules,
      mostActiveTenants,
      installationTrends: trends,
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private generateHistoryId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRollbackId(): string {
    return `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async emitTrackingEvent(eventType: string, data: any): Promise<void> {
    // Mock implementation - in real app, this would emit events to a message queue
    console.log(`Tracking event: ${eventType}`, data);
  }

  private async updateAnalytics(
    moduleId: string,
    tenantId: string,
    history: InstallationHistory
  ): Promise<void> {
    // Invalidate analytics cache for this module/tenant
    const cacheKey = `${moduleId}-${tenantId}`;
    for (const [key] of this.analyticsCache) {
      if (key.startsWith(cacheKey)) {
        this.analyticsCache.delete(key);
      }
    }
  }

  private async calculateInstallationTrends(
    moduleId: string,
    tenantId: string,
    days: number
  ): Promise<Array<{ date: string; count: number; successRate: number }>> {
    const trends: Array<{ date: string; count: number; successRate: number }> = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await this.getInstallationHistory(moduleId, tenantId, {
      startDate,
    });

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayHistory = history.filter(h => {
        const hDate = new Date(h.timestamp);
        return hDate.toISOString().split('T')[0] === dateStr;
      });

      const count = dayHistory.length;
      const successRate = count > 0 
        ? (dayHistory.filter(h => h.status === 'success').length / count) * 100 
        : 0;

      trends.push({ date: dateStr, count, successRate });
    }

    return trends;
  }

  private async analyzeCommonIssues(
    moduleId: string,
    tenantId: string
  ): Promise<string[]> {
    // Mock implementation - in real app, this would analyze failed installations
    return [
      'Dependency resolution failed',
      'Insufficient permissions',
      'Disk space exceeded',
    ];
  }

  private async calculatePerformanceMetrics(
    moduleId: string,
    tenantId: string
  ): Promise<{
    averageProgressRate: number;
    averageStepDuration: number;
    bottleneckSteps: string[];
  }> {
    // Mock implementation - in real app, this would analyze installation performance
    return {
      averageProgressRate: 15, // 15% per minute
      averageStepDuration: 30000, // 30 seconds per step
      bottleneckSteps: ['dependency_resolution', 'configuration'],
    };
  }

  private initializeTracking(): void {
    // Initialize tracking system
    console.log('Installation tracking system initialized');
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

export const installationTracker = new InstallationTracker();

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export async function startInstallationTracking(
  installationId: string,
  moduleId: string,
  tenantId: string,
  version: string,
  initiatedBy: string,
  metadata?: Record<string, unknown>
): Promise<InstallationProgress> {
  return installationTracker.startInstallationTracking(installationId, moduleId, tenantId, version, initiatedBy, metadata);
}

export async function updateInstallationProgress(
  installationId: string,
  updates: {
    status?: InstallationProgress['status'];
    progress?: number;
    currentStep?: string;
    error?: string;
    warnings?: string[];
    metadata?: Record<string, unknown>;
  }
): Promise<InstallationProgress | null> {
  return installationTracker.updateInstallationProgress(installationId, updates);
}

export async function completeInstallationTracking(
  installationId: string,
  success: boolean,
  finalMetadata?: Record<string, unknown>
): Promise<InstallationHistory | null> {
  return installationTracker.completeInstallationTracking(installationId, success, finalMetadata);
}

export async function recordInstallationHistory(
  moduleId: string,
  tenantId: string,
  action: 'install' | 'uninstall' | 'update' | 'rollback',
  version: string,
  initiatedBy: string,
  status: 'success' | 'failed' | 'partial' | 'cancelled',
  duration: number,
  fromVersion?: string,
  rollbackId?: string,
  details?: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<InstallationHistory> {
  return installationTracker.recordInstallationHistory(
    moduleId, tenantId, action, version, initiatedBy, status, duration,
    fromVersion, rollbackId, details, metadata
  );
}

export async function createRollbackRecord(
  installationId: string,
  moduleId: string,
  tenantId: string,
  fromVersion: string,
  toVersion: string,
  reason: string,
  initiatedBy: string,
  backupPath?: string,
  metadata?: Record<string, unknown>
): Promise<RollbackRecord> {
  return installationTracker.createRollbackRecord(
    installationId, moduleId, tenantId, fromVersion, toVersion, reason, initiatedBy, backupPath, metadata
  );
}

export async function updateRollbackStatus(
  rollbackId: string,
  status: RollbackRecord['status'],
  restorePath?: string,
  duration?: number,
  metadata?: Record<string, unknown>
): Promise<RollbackRecord | null> {
  return installationTracker.updateRollbackStatus(rollbackId, status, restorePath, duration, metadata);
}

export async function getInstallationProgress(installationId: string): Promise<InstallationProgress | null> {
  return installationTracker.getInstallationProgress(installationId);
}

export async function getActiveInstallations(tenantId: string): Promise<InstallationProgress[]> {
  return installationTracker.getActiveInstallations(tenantId);
}

export async function getInstallationHistory(
  moduleId: string,
  tenantId: string,
  options?: {
    limit?: number;
    offset?: number;
    action?: InstallationHistory['action'];
    status?: InstallationHistory['status'];
    startDate?: Date;
    endDate?: Date;
  }
): Promise<InstallationHistory[]> {
  return installationTracker.getInstallationHistory(moduleId, tenantId, options);
}

export async function getRollbackRecords(
  moduleId?: string,
  tenantId?: string,
  status?: RollbackRecord['status']
): Promise<RollbackRecord[]> {
  return installationTracker.getRollbackRecords(moduleId, tenantId, status);
}

export async function getInstallationAnalytics(
  moduleId: string,
  tenantId: string,
  options?: {
    includeTrends?: boolean;
    days?: number;
  }
): Promise<InstallationAnalytics> {
  return installationTracker.getInstallationAnalytics(moduleId, tenantId, options);
}

export async function getInstallationStatistics() {
  return installationTracker.getInstallationStatistics();
}
