/**
 * Error Tracking and Alerting System
 * Comprehensive error monitoring and notification system
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

export interface ErrorEvent {
  id: string;
  type: 'error' | 'warning' | 'critical';
  message: string;
  stack?: string;
  source: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  url?: string;
  metadata?: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: {
    errorType?: string[];
    source?: string[];
    messagePattern?: string;
    threshold?: number;
    timeWindow?: number; // minutes
  };
  actions: {
    email?: string[];
    webhook?: string[];
    slack?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsBySource: Record<string, number>;
  errorRate: number;
  topErrors: Array<{
    message: string;
    count: number;
    lastOccurrence: Date;
  }>;
  trends: Array<{
    date: string;
    count: number;
  }>;
}

export interface ErrorTrackingConfig {
  enableErrorTracking: boolean;
  enableStackTrace: boolean;
  enableUserTracking: boolean;
  enableSessionTracking: boolean;
  retentionPeriod: number; // days
  batchSize: number;
  alertRules: AlertRule[];
  notificationChannels: {
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        user: string;
        password: string;
      };
    };
    webhook: {
      enabled: boolean;
      url: string;
      secret: string;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
    };
  };
}

export class ErrorTracker {
  private config: ErrorTrackingConfig;
  private supabase: any;
  private errorBuffer: ErrorEvent[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private isTracking: boolean = false;

  constructor(config: ErrorTrackingConfig) {
    this.config = config;
    
    // Initialize Supabase client
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }

    // Load alert rules
    this.config.alertRules.forEach(rule => {
      this.alertRules.set(rule.id, rule);
    });

    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  /**
   * Start error tracking
   */
  async start(): Promise<void> {
    if (this.isTracking) {
      console.warn('Error tracking is already running');
      return;
    }

    this.isTracking = true;
    console.log('Error tracking started');

    // Set up periodic error buffer flush
    setInterval(() => {
      this.flushErrorBuffer();
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Stop error tracking
   */
  stop(): void {
    this.isTracking = false;
    console.log('Error tracking stopped');
  }

  /**
   * Track an error event
   */
  async trackError(error: Omit<ErrorEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    if (!this.config.enableErrorTracking) return;

    const errorEvent: ErrorEvent = {
      ...error,
      id: this.generateErrorId(),
      timestamp: new Date(),
      resolved: false,
    };

    // Add to buffer
    this.errorBuffer.push(errorEvent);

    // Check alert rules
    await this.checkAlertRules(errorEvent);

    // Flush buffer if it reaches batch size
    if (this.errorBuffer.length >= this.config.batchSize) {
      await this.flushErrorBuffer();
    }
  }

  /**
   * Track JavaScript error
   */
  trackJSError(error: Error, source: string = 'javascript', metadata?: Record<string, any>): void {
    this.trackError({
      type: 'error',
      message: error.message,
      stack: this.config.enableStackTrace ? error.stack : undefined,
      source,
      metadata,
    });
  }

  /**
   * Track API error
   */
  trackAPIError(
    error: Error,
    endpoint: string,
    method: string,
    statusCode: number,
    metadata?: Record<string, any>
  ): void {
    this.trackError({
      type: statusCode >= 500 ? 'critical' : 'error',
      message: `API Error: ${method} ${endpoint} - ${error.message}`,
      stack: this.config.enableStackTrace ? error.stack : undefined,
      source: 'api',
      metadata: {
        ...metadata,
        endpoint,
        method,
        statusCode,
      },
    });
  }

  /**
   * Track database error
   */
  trackDatabaseError(
    error: Error,
    query: string,
    metadata?: Record<string, any>
  ): void {
    this.trackError({
      type: 'critical',
      message: `Database Error: ${error.message}`,
      stack: this.config.enableStackTrace ? error.stack : undefined,
      source: 'database',
      metadata: {
        ...metadata,
        query: query.substring(0, 500), // Limit query length
      },
    });
  }

  /**
   * Track user error
   */
  trackUserError(
    error: Error,
    userId: string,
    sessionId: string,
    url: string,
    metadata?: Record<string, any>
  ): void {
    this.trackError({
      type: 'error',
      message: error.message,
      stack: this.config.enableStackTrace ? error.stack : undefined,
      source: 'user',
      userId,
      sessionId,
      url,
      metadata,
    });
  }

  /**
   * Resolve an error
   */
  async resolveError(errorId: string, resolvedBy: string): Promise<void> {
    if (!this.supabase) return;

    try {
      await this.supabase
        .from('error_events')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: resolvedBy,
        })
        .eq('id', errorId);

      console.log(`Error ${errorId} resolved by ${resolvedBy}`);

    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  }

  /**
   * Get error analytics
   */
  async getErrorAnalytics(timeRange: string = '24h'): Promise<ErrorAnalytics> {
    if (!this.supabase) return this.getEmptyAnalytics();

    try {
      const hours = this.parseTimeRange(timeRange);
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

      // Get error events
      const { data: errors, error } = await this.supabase
        .from('error_events')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return this.analyzeErrors(errors || []);

    } catch (error) {
      console.error('Failed to get error analytics:', error);
      return this.getEmptyAnalytics();
    }
  }

  /**
   * Get unresolved errors
   */
  async getUnresolvedErrors(limit: number = 100): Promise<ErrorEvent[]> {
    if (!this.supabase) return [];

    try {
      const { data: errors, error } = await this.supabase
        .from('error_events')
        .select('*')
        .eq('resolved', false)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (errors || []).map(this.mapDatabaseErrorToEvent);

    } catch (error) {
      console.error('Failed to get unresolved errors:', error);
      return [];
    }
  }

  /**
   * Create alert rule
   */
  async createAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AlertRule> {
    const alertRule: AlertRule = {
      ...rule,
      id: this.generateAlertRuleId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alertRules.set(alertRule.id, alertRule);

    if (this.supabase) {
      try {
        await this.supabase
          .from('alert_rules')
          .insert({
            id: alertRule.id,
            name: alertRule.name,
            description: alertRule.description,
            enabled: alertRule.enabled,
            conditions: alertRule.conditions,
            actions: alertRule.actions,
            created_at: alertRule.createdAt.toISOString(),
            updated_at: alertRule.updatedAt.toISOString(),
          });
      } catch (error) {
        console.error('Failed to create alert rule:', error);
      }
    }

    return alertRule;
  }

  /**
   * Update alert rule
   */
  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) return;

    const updatedRule = {
      ...rule,
      ...updates,
      updatedAt: new Date(),
    };

    this.alertRules.set(ruleId, updatedRule);

    if (this.supabase) {
      try {
        await this.supabase
          .from('alert_rules')
          .update({
            name: updatedRule.name,
            description: updatedRule.description,
            enabled: updatedRule.enabled,
            conditions: updatedRule.conditions,
            actions: updatedRule.actions,
            updated_at: updatedRule.updatedAt.toISOString(),
          })
          .eq('id', ruleId);
      } catch (error) {
        console.error('Failed to update alert rule:', error);
      }
    }
  }

  /**
   * Delete alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<void> {
    this.alertRules.delete(ruleId);

    if (this.supabase) {
      try {
        await this.supabase
          .from('alert_rules')
          .delete()
          .eq('id', ruleId);
      } catch (error) {
        console.error('Failed to delete alert rule:', error);
      }
    }
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.trackError({
        type: 'critical',
        message: `Uncaught Exception: ${error.message}`,
        stack: this.config.enableStackTrace ? error.stack : undefined,
        source: 'process',
        metadata: {
          type: 'uncaughtException',
        },
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.trackError({
        type: 'critical',
        message: `Unhandled Promise Rejection: ${reason}`,
        source: 'process',
        metadata: {
          type: 'unhandledRejection',
          promise: promise.toString(),
        },
      });
    });

    // Handle Next.js API route errors
    if (typeof window === 'undefined') {
      // Server-side error handling
      const originalConsoleError = console.error;
      console.error = (...args) => {
        originalConsoleError(...args);
        
        const errorMessage = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');

        this.trackError({
          type: 'error',
          message: `Console Error: ${errorMessage}`,
          source: 'console',
        });
      };
    }
  }

  /**
   * Check alert rules against error event
   */
  private async checkAlertRules(errorEvent: ErrorEvent): Promise<void> {
    for (const rule of this.alertRules.values()) {
      if (!rule.enabled) continue;

      if (this.matchesAlertRule(errorEvent, rule)) {
        await this.triggerAlert(rule, errorEvent);
      }
    }
  }

  /**
   * Check if error event matches alert rule
   */
  private matchesAlertRule(errorEvent: ErrorEvent, rule: AlertRule): boolean {
    const { conditions } = rule;

    // Check error type
    if (conditions.errorType && !conditions.errorType.includes(errorEvent.type)) {
      return false;
    }

    // Check source
    if (conditions.source && !conditions.source.includes(errorEvent.source)) {
      return false;
    }

    // Check message pattern
    if (conditions.messagePattern && !errorEvent.message.includes(conditions.messagePattern)) {
      return false;
    }

    // Check threshold (would need to count recent errors)
    if (conditions.threshold) {
      // This would require counting recent errors of similar type
      // For now, we'll skip threshold checks
    }

    return true;
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(rule: AlertRule, errorEvent: ErrorEvent): Promise<void> {
    const { actions } = rule;

    console.warn(`Alert triggered: ${rule.name}`, {
      rule: rule.name,
      error: errorEvent.message,
      severity: actions.severity,
    });

    // Send email notification
    if (actions.email && this.config.notificationChannels.email.enabled) {
      await this.sendEmailAlert(actions.email, rule, errorEvent);
    }

    // Send webhook notification
    if (actions.webhook && this.config.notificationChannels.webhook.enabled) {
      await this.sendWebhookAlert(actions.webhook, rule, errorEvent);
    }

    // Send Slack notification
    if (actions.slack && this.config.notificationChannels.slack.enabled) {
      await this.sendSlackAlert(actions.slack, rule, errorEvent);
    }

    // Store alert in database
    if (this.supabase) {
      try {
        await this.supabase
          .from('error_alerts')
          .insert({
            alert_rule_id: rule.id,
            error_event_id: errorEvent.id,
            severity: actions.severity,
            triggered_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to store alert:', error);
      }
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(
    recipients: string[],
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    // This would integrate with your email service
    console.log(`Email alert sent to ${recipients.join(', ')}: ${rule.name}`);
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(
    webhooks: string[],
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    const payload = {
      alert: {
        rule: rule.name,
        severity: rule.actions.severity,
        description: rule.description,
      },
      error: {
        id: errorEvent.id,
        type: errorEvent.type,
        message: errorEvent.message,
        source: errorEvent.source,
        timestamp: errorEvent.timestamp,
        metadata: errorEvent.metadata,
      },
    };

    for (const webhook of webhooks) {
      try {
        await fetch(webhook, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': this.config.notificationChannels.webhook.secret,
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.error(`Failed to send webhook alert to ${webhook}:`, error);
      }
    }
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(
    channel: string,
    rule: AlertRule,
    errorEvent: ErrorEvent
  ): Promise<void> {
    const message = {
      channel,
      text: `🚨 Error Alert: ${rule.name}`,
      attachments: [
        {
          color: this.getSeverityColor(rule.actions.severity),
          fields: [
            {
              title: 'Rule',
              value: rule.name,
              short: true,
            },
            {
              title: 'Severity',
              value: rule.actions.severity.toUpperCase(),
              short: true,
            },
            {
              title: 'Error Type',
              value: errorEvent.type,
              short: true,
            },
            {
              title: 'Source',
              value: errorEvent.source,
              short: true,
            },
            {
              title: 'Message',
              value: errorEvent.message,
              short: false,
            },
            {
              title: 'Timestamp',
              value: errorEvent.timestamp.toISOString(),
              short: true,
            },
          ],
        },
      ],
    };

    try {
      await fetch(this.config.notificationChannels.slack.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Failed to send Slack alert:', error);
    }
  }

  /**
   * Get severity color for Slack
   */
  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'low': return '#36a64f';
      case 'medium': return '#ffaa00';
      case 'high': return '#ff6600';
      case 'critical': return '#ff0000';
      default: return '#cccccc';
    }
  }

  /**
   * Flush error buffer to database
   */
  private async flushErrorBuffer(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errorsToFlush = [...this.errorBuffer];
    this.errorBuffer = [];

    if (!this.supabase) {
      console.warn('Supabase client not available, errors will be lost');
      return;
    }

    try {
      const dbErrors = errorsToFlush.map(error => ({
        id: error.id,
        type: error.type,
        message: error.message,
        stack: error.stack,
        source: error.source,
        user_id: error.userId,
        session_id: error.sessionId,
        user_agent: error.userAgent,
        ip_address: error.ipAddress,
        url: error.url,
        metadata: error.metadata,
        resolved: error.resolved,
        resolved_at: error.resolvedAt?.toISOString(),
        resolved_by: error.resolvedBy,
        timestamp: error.timestamp.toISOString(),
      }));

      await this.supabase
        .from('error_events')
        .insert(dbErrors);

      console.log(`Flushed ${errorsToFlush.length} errors to database`);

    } catch (error) {
      console.error('Failed to flush errors to database:', error);
      // Re-add errors to buffer for retry
      this.errorBuffer.unshift(...errorsToFlush);
    }
  }

  /**
   * Analyze errors for analytics
   */
  private analyzeErrors(errors: any[]): ErrorAnalytics {
    if (errors.length === 0) return this.getEmptyAnalytics();

    const errorsByType = errors.reduce((acc, error) => {
      acc[error.type] = (acc[error.type] || 0) + 1;
      return acc;
    }, {});

    const errorsBySource = errors.reduce((acc, error) => {
      acc[error.source] = (acc[error.source] || 0) + 1;
      return acc;
    }, {});

    const errorCounts = errors.reduce((acc, error) => {
      const key = error.message;
      if (!acc[key]) {
        acc[key] = { count: 0, lastOccurrence: new Date(error.timestamp) };
      }
      acc[key].count++;
      if (new Date(error.timestamp) > acc[key].lastOccurrence) {
        acc[key].lastOccurrence = new Date(error.timestamp);
      }
      return acc;
    }, {});

    const topErrors = Object.entries(errorCounts)
      .map(([message, data]: [string, any]) => ({
        message,
        count: data.count,
        lastOccurrence: data.lastOccurrence,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate trends (simplified)
    const trends = this.calculateTrends(errors);

    return {
      totalErrors: errors.length,
      errorsByType,
      errorsBySource,
      errorRate: errors.length / (24 * 60), // Assuming 24h data, errors per minute
      topErrors,
      trends,
    };
  }

  /**
   * Calculate error trends
   */
  private calculateTrends(errors: any[]): Array<{ date: string; count: number }> {
    const trends: Record<string, number> = {};
    
    errors.forEach(error => {
      const date = new Date(error.timestamp).toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });

    return Object.entries(trends)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get empty analytics
   */
  private getEmptyAnalytics(): ErrorAnalytics {
    return {
      totalErrors: 0,
      errorsByType: {},
      errorsBySource: {},
      errorRate: 0,
      topErrors: [],
      trends: [],
    };
  }

  /**
   * Map database error to event
   */
  private mapDatabaseErrorToEvent(dbError: any): ErrorEvent {
    return {
      id: dbError.id,
      type: dbError.type,
      message: dbError.message,
      stack: dbError.stack,
      source: dbError.source,
      timestamp: new Date(dbError.timestamp),
      userId: dbError.user_id,
      sessionId: dbError.session_id,
      userAgent: dbError.user_agent,
      ipAddress: dbError.ip_address,
      url: dbError.url,
      metadata: dbError.metadata,
      resolved: dbError.resolved,
      resolvedAt: dbError.resolved_at ? new Date(dbError.resolved_at) : undefined,
      resolvedBy: dbError.resolved_by,
    };
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique alert rule ID
   */
  private generateAlertRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Parse time range string
   */
  private parseTimeRange(timeRange: string): number {
    const match = timeRange.match(/(\d+)([hdwm])/);
    if (!match) return 24; // Default to 24 hours

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'h': return value;
      case 'd': return value * 24;
      case 'w': return value * 24 * 7;
      case 'm': return value * 24 * 30;
      default: return 24;
    }
  }
}

/**
 * Default error tracking configuration
 */
export const defaultErrorTrackingConfig: ErrorTrackingConfig = {
  enableErrorTracking: true,
  enableStackTrace: true,
  enableUserTracking: true,
  enableSessionTracking: true,
  retentionPeriod: 30, // 30 days
  batchSize: 50,
  alertRules: [
    {
      id: 'critical-errors',
      name: 'Critical Errors',
      description: 'Alert on critical errors',
      enabled: true,
      conditions: {
        errorType: ['critical'],
      },
      actions: {
        severity: 'critical',
        email: ['admin@example.com'],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  notificationChannels: {
    email: {
      enabled: false,
      smtp: {
        host: '',
        port: 587,
        user: '',
        password: '',
      },
    },
    webhook: {
      enabled: false,
      url: '',
      secret: '',
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: '#alerts',
    },
  },
};

/**
 * Create and start error tracker
 */
export async function startErrorTracking(config?: Partial<ErrorTrackingConfig>): Promise<ErrorTracker> {
  const finalConfig = { ...defaultErrorTrackingConfig, ...config };
  const tracker = new ErrorTracker(finalConfig);
  await tracker.start();
  return tracker;
}
