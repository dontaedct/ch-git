/**
 * Enhanced Audit Logging System
 * HT-004.5.3: Comprehensive audit trail for all task changes and user actions
 * 
 * This module provides comprehensive audit logging capabilities including:
 * - Detailed change tracking with before/after values
 * - Compliance framework support (GDPR, SOX, HIPAA, PCI)
 * - Data classification and retention management
 * - Suspicious activity detection
 * - Advanced reporting and analytics
 */

import { createServerSupabase } from '@lib/supabase/server';

export type AuditAction = 
  | 'create' | 'read' | 'update' | 'delete'
  | 'login' | 'logout' | 'register' | 'password_change'
  | 'permission_grant' | 'permission_revoke' | 'role_change'
  | 'file_upload' | 'file_download' | 'file_delete'
  | 'export' | 'import' | 'backup' | 'restore'
  | 'configuration_change' | 'system_event'
  | 'api_call' | 'integration_event'
  | 'task_create' | 'task_update' | 'task_delete' | 'task_complete'
  | 'subtask_create' | 'subtask_update' | 'subtask_delete'
  | 'action_create' | 'action_update' | 'action_delete'
  | 'comment_create' | 'comment_update' | 'comment_delete'
  | 'attachment_create' | 'attachment_delete'
  | 'team_create' | 'team_update' | 'team_delete'
  | 'user_invite' | 'user_remove' | 'user_suspend';

export type ResourceType = 
  | 'task' | 'subtask' | 'action' | 'comment' | 'attachment'
  | 'user' | 'team' | 'role' | 'permission' | 'configuration'
  | 'file' | 'export' | 'backup' | 'session' | 'api_key'
  | 'integration' | 'webhook' | 'report' | 'audit_log';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ComplianceCategory = 'gdpr' | 'sox' | 'hipaa' | 'pci' | 'iso27001' | 'custom';

export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

export interface AuditEvent {
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string;
  resourceName?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  severity?: AuditSeverity;
  complianceCategory?: ComplianceCategory;
  dataClassification?: DataClassification;
  retentionPeriod?: number; // Days
}

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id?: string;
  resource_name?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_fields?: string[];
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  severity: AuditSeverity;
  compliance_category?: ComplianceCategory;
  data_classification: DataClassification;
  retention_period: number;
  created_at: string;
  expires_at: string;
}

export interface AuditLogSummary {
  action: string;
  resource_type: string;
  count: number;
  last_occurrence: string;
  unique_users: number;
}

export interface UserActivitySummary {
  action: string;
  count: number;
  last_activity: string;
  resource_types: string[];
}

export interface SuspiciousActivity {
  user_id: string;
  action: string;
  count: number;
  severity: AuditSeverity;
  first_occurrence: string;
  last_occurrence: string;
}

export interface AuditLogFilter {
  id?: string;
  name: string;
  description?: string;
  user_id?: string;
  filter_criteria: {
    start_date?: string;
    end_date?: string;
    user_id?: string;
    action?: AuditAction;
    resource_type?: ResourceType;
    severity?: AuditSeverity;
    compliance_category?: ComplianceCategory;
    data_classification?: DataClassification;
    search_text?: string;
  };
  is_shared?: boolean;
}

export interface AuditLogReport {
  id?: string;
  name: string;
  description?: string;
  user_id?: string;
  report_config: {
    query: AuditLogFilter['filter_criteria'];
    format: 'json' | 'csv' | 'pdf';
    schedule?: string; // Cron expression
    email_recipients?: string[];
  };
  is_scheduled?: boolean;
  schedule_cron?: string;
  last_run_at?: string;
  next_run_at?: string;
  is_active?: boolean;
}

/**
 * Enhanced Audit Logger Service
 */
export class AuditLogger {
  private supabase: any;
  private sessionId?: string;
  private userId?: string;
  private ipAddress?: string;
  private userAgent?: string;

  constructor(supabase: any, context?: {
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    this.supabase = supabase;
    this.sessionId = context?.sessionId;
    this.userId = context?.userId;
    this.ipAddress = context?.ipAddress;
    this.userAgent = context?.userAgent;
  }

  /**
   * Log an audit event with comprehensive tracking
   */
  async logEvent(event: AuditEvent): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('log_hero_audit_event', {
        p_user_id: this.userId || null,
        p_session_id: this.sessionId || null,
        p_action: event.action,
        p_resource_type: event.resourceType,
        p_resource_id: event.resourceId || null,
        p_resource_name: event.resourceName || null,
        p_old_values: event.oldValues || null,
        p_new_values: event.newValues || null,
        p_changed_fields: event.changedFields || null,
        p_context: event.context || {},
        p_metadata: event.metadata || {},
        p_severity: event.severity || 'info',
        p_compliance_category: event.complianceCategory || null,
        p_data_classification: event.dataClassification || 'internal',
        p_retention_period: event.retentionPeriod || 2555,
        p_ip_address: this.ipAddress || null,
        p_user_agent: this.userAgent || null
      });

      if (error) {
        console.error('Failed to log audit event:', error);
        throw new Error(`Audit logging failed: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit logging should not break the main flow
      return '';
    }
  }

  /**
   * Log a task-related event
   */
  async logTaskEvent(
    action: AuditAction,
    taskId: string,
    taskName: string,
    changes?: {
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      changedFields?: string[];
    }
  ): Promise<string> {
    return this.logEvent({
      action,
      resourceType: 'task',
      resourceId: taskId,
      resourceName: taskName,
      oldValues: changes?.oldValues,
      newValues: changes?.newValues,
      changedFields: changes?.changedFields,
      severity: this.getSeverityForAction(action),
      complianceCategory: 'sox',
      dataClassification: 'internal'
    });
  }

  /**
   * Log a user-related event
   */
  async logUserEvent(
    action: AuditAction,
    userId: string,
    userName: string,
    changes?: {
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
      changedFields?: string[];
    }
  ): Promise<string> {
    return this.logEvent({
      action,
      resourceType: 'user',
      resourceId: userId,
      resourceName: userName,
      oldValues: changes?.oldValues,
      newValues: changes?.newValues,
      changedFields: changes?.changedFields,
      severity: this.getSeverityForAction(action),
      complianceCategory: 'gdpr',
      dataClassification: 'confidential'
    });
  }

  /**
   * Log a permission-related event
   */
  async logPermissionEvent(
    action: AuditAction,
    resourceId: string,
    resourceName: string,
    permissionDetails: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      action,
      resourceType: 'permission',
      resourceId,
      resourceName,
      newValues: permissionDetails,
      severity: 'warning',
      complianceCategory: 'sox',
      dataClassification: 'confidential'
    });
  }

  /**
   * Log a file operation event
   */
  async logFileEvent(
    action: AuditAction,
    fileId: string,
    fileName: string,
    fileDetails?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      action,
      resourceType: 'file',
      resourceId: fileId,
      resourceName: fileName,
      newValues: fileDetails,
      severity: this.getSeverityForAction(action),
      complianceCategory: 'gdpr',
      dataClassification: 'confidential'
    });
  }

  /**
   * Log an authentication event
   */
  async logAuthEvent(
    action: AuditAction,
    userId?: string,
    authDetails?: Record<string, any>
  ): Promise<string> {
    return this.logEvent({
      action,
      resourceType: 'user',
      resourceId: userId,
      resourceName: userId,
      newValues: authDetails,
      severity: 'warning',
      complianceCategory: 'gdpr',
      dataClassification: 'confidential'
    });
  }

  /**
   * Get audit log summary for a date range
   */
  async getAuditSummary(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    action?: AuditAction,
    resourceType?: ResourceType,
    severity?: AuditSeverity
  ): Promise<AuditLogSummary[]> {
    const { data, error } = await this.supabase.rpc('get_audit_log_summary', {
      p_start_date: startDate?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      p_end_date: endDate?.toISOString() || new Date().toISOString(),
      p_user_id: userId || null,
      p_action: action || null,
      p_resource_type: resourceType || null,
      p_severity: severity || null
    });

    if (error) {
      throw new Error(`Failed to get audit summary: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string, days: number = 30): Promise<UserActivitySummary[]> {
    const { data, error } = await this.supabase.rpc('get_user_activity_summary', {
      p_user_id: userId,
      p_days: days
    });

    if (error) {
      throw new Error(`Failed to get user activity summary: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity(
    hours: number = 24,
    threshold: number = 100
  ): Promise<SuspiciousActivity[]> {
    const { data, error } = await this.supabase.rpc('detect_suspicious_activity', {
      p_hours: hours,
      p_threshold: threshold
    });

    if (error) {
      throw new Error(`Failed to detect suspicious activity: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(
    filters: AuditLogFilter['filter_criteria'],
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    let query = this.supabase
      .from('hero_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.compliance_category) {
      query = query.eq('compliance_category', filters.compliance_category);
    }
    if (filters.data_classification) {
      query = query.eq('data_classification', filters.data_classification);
    }
    if (filters.search_text) {
      query = query.or(`resource_name.ilike.%${filters.search_text}%,action.ilike.%${filters.search_text}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get audit logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Save audit log filter
   */
  async saveFilter(filter: AuditLogFilter): Promise<string> {
    const { data, error } = await this.supabase
      .from('audit_log_filters')
      .insert({
        name: filter.name,
        description: filter.description,
        user_id: filter.user_id || this.userId,
        filter_criteria: filter.filter_criteria,
        is_shared: filter.is_shared || false
      })
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to save filter: ${error.message}`);
    }

    return data.id;
  }

  /**
   * Get saved filters
   */
  async getFilters(userId?: string): Promise<AuditLogFilter[]> {
    let query = this.supabase
      .from('audit_log_filters')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.or(`user_id.eq.${userId},is_shared.eq.true`);
    } else {
      query = query.eq('is_shared', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get filters: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Cleanup expired audit logs
   */
  async cleanupExpiredLogs(): Promise<number> {
    const { data, error } = await this.supabase.rpc('cleanup_expired_audit_logs');

    if (error) {
      throw new Error(`Failed to cleanup expired logs: ${error.message}`);
    }

    return data || 0;
  }

  /**
   * Get severity level for an action
   */
  private getSeverityForAction(action: AuditAction): AuditSeverity {
    const criticalActions: AuditAction[] = ['delete', 'password_change', 'role_change', 'user_suspend'];
    const warningActions: AuditAction[] = ['update', 'permission_grant', 'permission_revoke', 'configuration_change'];
    
    if (criticalActions.includes(action)) {
      return 'critical';
    } else if (warningActions.includes(action)) {
      return 'warning';
    } else {
      return 'info';
    }
  }
}

/**
 * Audit Logger Factory
 */
export class AuditLoggerFactory {
  private static instance: AuditLoggerFactory;
  private supabase: any;

  private constructor() {
    this.supabase = createServerSupabase();
  }

  static getInstance(): AuditLoggerFactory {
    if (!AuditLoggerFactory.instance) {
      AuditLoggerFactory.instance = new AuditLoggerFactory();
    }
    return AuditLoggerFactory.instance;
  }

  createLogger(context?: {
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): AuditLogger {
    return new AuditLogger(this.supabase, context);
  }

  async createLoggerFromRequest(request: Request): Promise<AuditLogger> {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    return new AuditLogger(this.supabase, {
      ipAddress,
      userAgent
    });
  }
}

/**
 * Convenience functions for common audit logging scenarios
 */
export const AuditLogging = {
  /**
   * Create a new audit logger instance
   */
  createLogger: (context?: {
    sessionId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
  }) => AuditLoggerFactory.getInstance().createLogger(context),

  /**
   * Create audit logger from request
   */
  createLoggerFromRequest: (request: Request) => 
    AuditLoggerFactory.getInstance().createLoggerFromRequest(request),

  /**
   * Log a task creation event
   */
  logTaskCreation: async (taskId: string, taskName: string, userId?: string) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    return logger.logTaskEvent('task_create', taskId, taskName);
  },

  /**
   * Log a task update event
   */
  logTaskUpdate: async (
    taskId: string, 
    taskName: string, 
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    userId?: string
  ) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    const changedFields = Object.keys(newValues).filter(key => 
      JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])
    );
    
    return logger.logTaskEvent('task_update', taskId, taskName, {
      oldValues,
      newValues,
      changedFields
    });
  },

  /**
   * Log a task deletion event
   */
  logTaskDeletion: async (taskId: string, taskName: string, userId?: string) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    return logger.logTaskEvent('task_delete', taskId, taskName);
  },

  /**
   * Log a user login event
   */
  logUserLogin: async (userId: string, userName: string, authMethod?: string) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    return logger.logAuthEvent('login', userId, { auth_method: authMethod });
  },

  /**
   * Log a user logout event
   */
  logUserLogout: async (userId: string, userName: string) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    return logger.logAuthEvent('logout', userId);
  },

  /**
   * Log a permission change event
   */
  logPermissionChange: async (
    action: 'permission_grant' | 'permission_revoke',
    resourceId: string,
    resourceName: string,
    permissionDetails: Record<string, any>,
    userId?: string
  ) => {
    const logger = AuditLoggerFactory.getInstance().createLogger({ userId });
    return logger.logPermissionEvent(action, resourceId, resourceName, permissionDetails);
  }
};

export default AuditLogger;
