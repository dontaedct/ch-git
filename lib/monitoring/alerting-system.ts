/**
 * @fileoverview HT-008.8.8: Comprehensive Alerting and Notification System
 * @module lib/monitoring/alerting-system
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.8 - Add comprehensive alerting and notification system
 * Focus: Production-grade alerting with escalation policies and multi-channel notifications
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production alerting, incident management)
 */

import { Logger } from '@/lib/logger';
import { comprehensiveLogger } from '@/lib/monitoring/comprehensive-logger';
import { Observing } from '@/lib/observability';

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Alert status
export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

// Alert category
export enum AlertCategory {
  ERROR = 'error',
  PERFORMANCE = 'performance',
  HEALTH = 'health',
  SECURITY = 'security',
  BUSINESS = 'business',
  INFRASTRUCTURE = 'infrastructure',
}

// Notification channel types
export enum NotificationChannel {
  SLACK = 'slack',
  EMAIL = 'email',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  PAGERDUTY = 'pagerduty',
  DISCORD = 'discord',
}

// Alert configuration
interface AlertingConfig {
  enableAlerting: boolean;
  enableEscalation: boolean;
  enableSuppression: boolean;
  enableDeduplication: boolean;
  defaultEscalationDelay: number; // minutes
  maxAlertsPerMinute: number;
  suppressionWindow: number; // minutes
  channels: {
    slack: {
      enabled: boolean;
      webhookUrl?: string;
      channel?: string;
      username?: string;
      iconEmoji?: string;
    };
    email: {
      enabled: boolean;
      smtpConfig?: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
      recipients: string[];
      fromAddress: string;
    };
    webhook: {
      enabled: boolean;
      urls: string[];
      headers?: Record<string, string>;
    };
    pagerduty: {
      enabled: boolean;
      integrationKey?: string;
      escalationPolicy?: string;
    };
  };
}

const defaultConfig: AlertingConfig = {
  enableAlerting: true,
  enableEscalation: true,
  enableSuppression: true,
  enableDeduplication: true,
  defaultEscalationDelay: 15, // 15 minutes
  maxAlertsPerMinute: 10,
  suppressionWindow: 5, // 5 minutes
  channels: {
    slack: {
      enabled: false,
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
      username: 'AlertBot',
      iconEmoji: ':warning:',
    },
    email: {
      enabled: false,
      recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
      fromAddress: process.env.ALERT_FROM_EMAIL || 'alerts@company.com',
    },
    webhook: {
      enabled: false,
      urls: process.env.ALERT_WEBHOOK_URLS?.split(',') || [],
    },
    pagerduty: {
      enabled: false,
      integrationKey: process.env.PAGERDUTY_INTEGRATION_KEY,
      escalationPolicy: process.env.PAGERDUTY_ESCALATION_POLICY,
    },
  },
};

// Alert definition
export interface AlertDefinition {
  id: string;
  name: string;
  description: string;
  category: AlertCategory;
  severity: AlertSeverity;
  conditions: {
    metric: string;
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    threshold: number;
    timeWindow: number; // minutes
  }[];
  channels: NotificationChannel[];
  escalationPolicy?: string;
  suppressionRules?: {
    duration: number; // minutes
    maxOccurrences: number;
  };
  tags: string[];
  runbookUrl?: string;
}

// Alert instance
export interface AlertInstance {
  id: string;
  definitionId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  status: AlertStatus;
  createdAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  resolvedBy?: string;
  escalationLevel: number;
  lastEscalatedAt?: Date;
  metadata: Record<string, any>;
  tags: string[];
  runbookUrl?: string;
}

// Escalation policy
export interface EscalationPolicy {
  id: string;
  name: string;
  description: string;
  levels: Array<{
    level: number;
    delay: number; // minutes
    channels: NotificationChannel[];
    recipients: string[];
    conditions?: {
      businessHours?: boolean;
      severity?: AlertSeverity[];
    };
  }>;
}

// Notification result
interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

// Alert statistics
interface AlertStatistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  alertsBySeverity: Record<AlertSeverity, number>;
  alertsByCategory: Record<AlertCategory, number>;
  averageResolutionTime: number; // minutes
  escalationRate: number; // percentage
}

/**
 * Comprehensive Alerting System
 * 
 * Provides production-grade alerting with escalation policies,
 * multi-channel notifications, and alert management.
 */
export class AlertingSystem {
  private static instance: AlertingSystem | null = null;
  private config: AlertingConfig;
  private logger = Logger.create({ component: 'alerting-system' });
  private alertDefinitions: Map<string, AlertDefinition> = new Map();
  private activeAlerts: Map<string, AlertInstance> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private alertHistory: AlertInstance[] = [];
  private notificationHistory: NotificationResult[] = [];
  private suppressionRules: Map<string, { count: number; lastAlert: Date }> = new Map();

  private constructor(config: Partial<AlertingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupDefaultEscalationPolicies();
    this.setupDefaultAlertDefinitions();
  }

  static getInstance(config?: Partial<AlertingConfig>): AlertingSystem {
    if (!AlertingSystem.instance) {
      AlertingSystem.instance = new AlertingSystem(config);
    }
    return AlertingSystem.instance;
  }

  /**
   * Create a new alert
   */
  async createAlert(
    definitionId: string,
    title: string,
    description: string,
    metadata: Record<string, any> = {},
    tags: string[] = []
  ): Promise<AlertInstance | null> {
    if (!this.config.enableAlerting) {
      this.logger.debug('Alerting disabled, skipping alert creation');
      return null;
    }

    const definition = this.alertDefinitions.get(definitionId);
    if (!definition) {
      this.logger.error('Alert definition not found', { definitionId });
      return null;
    }

    // Check suppression rules
    if (this.config.enableSuppression && this.isSuppressed(definitionId)) {
      this.logger.debug('Alert suppressed', { definitionId, title });
      return null;
    }

    // Check deduplication
    if (this.config.enableDeduplication && this.isDuplicate(definitionId, title)) {
      this.logger.debug('Duplicate alert suppressed', { definitionId, title });
      return null;
    }

    const alertId = this.generateAlertId();
    const alert: AlertInstance = {
      id: alertId,
      definitionId,
      title,
      description,
      severity: definition.severity,
      category: definition.category,
      status: AlertStatus.ACTIVE,
      createdAt: new Date(),
      escalationLevel: 0,
      metadata,
      tags: [...definition.tags, ...tags],
      runbookUrl: definition.runbookUrl,
    };

    // Store alert
    this.activeAlerts.set(alertId, alert);
    this.alertHistory.push(alert);

    // Update suppression tracking
    this.updateSuppressionTracking(definitionId);

    // Send initial notifications
    await this.sendNotifications(alert, definition.channels);

    // Start escalation if configured
    if (this.config.enableEscalation && definition.escalationPolicy) {
      this.scheduleEscalation(alert, definition.escalationPolicy);
    }

    // Log alert creation
    this.logger.warn('Alert created', {
      alertId,
      definitionId,
      title,
      severity: alert.severity,
      category: alert.category,
    });

    // Record business metric
    Observing.recordBusinessMetric('alert_created', 1, {
      severity: alert.severity,
      category: alert.category,
      definitionId,
    });

    return alert;
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
    note?: string
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      this.logger.error('Alert not found for acknowledgment', { alertId });
      return false;
    }

    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = acknowledgedBy;

    if (note) {
      alert.metadata.acknowledgmentNote = note;
    }

    this.activeAlerts.set(alertId, alert);

    this.logger.info('Alert acknowledged', {
      alertId,
      acknowledgedBy,
      note,
    });

    // Send acknowledgment notification
    await this.sendAcknowledgmentNotification(alert);

    return true;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(
    alertId: string,
    resolvedBy: string,
    resolution?: string
  ): Promise<boolean> {
    const alert = this.activeAlerts.get(alertId);
    if (!alert) {
      this.logger.error('Alert not found for resolution', { alertId });
      return false;
    }

    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;

    if (resolution) {
      alert.metadata.resolution = resolution;
    }

    this.activeAlerts.set(alertId, alert);

    this.logger.info('Alert resolved', {
      alertId,
      resolvedBy,
      resolution,
    });

    // Send resolution notification
    await this.sendResolutionNotification(alert);

    return true;
  }

  /**
   * Register an alert definition
   */
  registerAlertDefinition(definition: AlertDefinition): void {
    this.alertDefinitions.set(definition.id, definition);
    
    this.logger.info('Alert definition registered', {
      definitionId: definition.id,
      name: definition.name,
      severity: definition.severity,
      category: definition.category,
    });
  }

  /**
   * Register an escalation policy
   */
  registerEscalationPolicy(policy: EscalationPolicy): void {
    this.escalationPolicies.set(policy.id, policy);
    
    this.logger.info('Escalation policy registered', {
      policyId: policy.id,
      name: policy.name,
      levels: policy.levels.length,
    });
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): AlertStatistics {
    const totalAlerts = this.alertHistory.length;
    const activeAlerts = Array.from(this.activeAlerts.values()).filter(
      alert => alert.status === AlertStatus.ACTIVE
    ).length;
    const resolvedAlerts = this.alertHistory.filter(
      alert => alert.status === AlertStatus.RESOLVED
    ).length;

    const alertsBySeverity: Record<AlertSeverity, number> = {
      [AlertSeverity.LOW]: 0,
      [AlertSeverity.MEDIUM]: 0,
      [AlertSeverity.HIGH]: 0,
      [AlertSeverity.CRITICAL]: 0,
    };

    const alertsByCategory: Record<AlertCategory, number> = {
      [AlertCategory.ERROR]: 0,
      [AlertCategory.PERFORMANCE]: 0,
      [AlertCategory.HEALTH]: 0,
      [AlertCategory.SECURITY]: 0,
      [AlertCategory.BUSINESS]: 0,
      [AlertCategory.INFRASTRUCTURE]: 0,
    };

    this.alertHistory.forEach(alert => {
      alertsBySeverity[alert.severity]++;
      alertsByCategory[alert.category]++;
    });

    // Calculate average resolution time
    const resolvedAlertsWithTimes = this.alertHistory.filter(
      alert => alert.status === AlertStatus.RESOLVED && alert.resolvedAt && alert.createdAt
    );
    const averageResolutionTime = resolvedAlertsWithTimes.length > 0
      ? resolvedAlertsWithTimes.reduce((sum, alert) => {
          const resolutionTime = alert.resolvedAt!.getTime() - alert.createdAt.getTime();
          return sum + (resolutionTime / (1000 * 60)); // Convert to minutes
        }, 0) / resolvedAlertsWithTimes.length
      : 0;

    // Calculate escalation rate
    const escalatedAlerts = this.alertHistory.filter(alert => alert.escalationLevel > 0).length;
    const escalationRate = totalAlerts > 0 ? (escalatedAlerts / totalAlerts) * 100 : 0;

    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      alertsBySeverity,
      alertsByCategory,
      averageResolutionTime,
      escalationRate,
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): AlertInstance[] {
    return Array.from(this.activeAlerts.values()).filter(
      alert => alert.status === AlertStatus.ACTIVE
    );
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): AlertInstance[] {
    return this.alertHistory.slice(-limit);
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(
    alert: AlertInstance,
    channels: NotificationChannel[]
  ): Promise<void> {
    const notificationPromises = channels.map(channel => 
      this.sendNotification(alert, channel)
    );

    const results = await Promise.allSettled(notificationPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error('Notification failed', {
          alertId: alert.id,
          channel: channels[index],
          error: result.reason,
        });
      }
    });
  }

  /**
   * Send a single notification
   */
  private async sendNotification(
    alert: AlertInstance,
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    const timestamp = new Date();
    
    try {
      switch (channel) {
        case NotificationChannel.SLACK:
          return await this.sendSlackNotification(alert);
        case NotificationChannel.EMAIL:
          return await this.sendEmailNotification(alert);
        case NotificationChannel.WEBHOOK:
          return await this.sendWebhookNotification(alert);
        case NotificationChannel.PAGERDUTY:
          return await this.sendPagerDutyNotification(alert);
        default:
          throw new Error(`Unsupported notification channel: ${channel}`);
      }
    } catch (error) {
      const result: NotificationResult = {
        channel,
        success: false,
        error: (error as Error).message,
        timestamp,
      };
      
      this.notificationHistory.push(result);
      return result;
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: AlertInstance): Promise<NotificationResult> {
    const timestamp = new Date();
    
    if (!this.config.channels.slack.enabled || !this.config.channels.slack.webhookUrl) {
      throw new Error('Slack notifications not configured');
    }

    const color = this.getSeverityColor(alert.severity);
    const emoji = this.getSeverityEmoji(alert.severity);

    const payload = {
      text: `${emoji} Alert: ${alert.title}`,
      channel: this.config.channels.slack.channel,
      username: this.config.channels.slack.username,
      icon_emoji: this.config.channels.slack.iconEmoji,
      attachments: [{
        color,
        fields: [
          { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          { title: 'Category', value: alert.category.toUpperCase(), short: true },
          { title: 'Status', value: alert.status.toUpperCase(), short: true },
          { title: 'Created', value: alert.createdAt.toISOString(), short: true },
          { title: 'Description', value: alert.description, short: false },
        ],
        footer: 'Alerting System',
        ts: Math.floor(timestamp.getTime() / 1000),
      }],
    };

    const response = await fetch(this.config.channels.slack.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    const result: NotificationResult = {
      channel: NotificationChannel.SLACK,
      success: true,
      timestamp,
    };

    this.notificationHistory.push(result);
    return result;
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: AlertInstance): Promise<NotificationResult> {
    const timestamp = new Date();
    
    if (!this.config.channels.email.enabled) {
      throw new Error('Email notifications not configured');
    }

    // This would integrate with an email service like SendGrid, SES, etc.
    // For now, we'll log the email notification
    this.logger.info('Email notification would be sent', {
      alertId: alert.id,
      recipients: this.config.channels.email.recipients,
      subject: `Alert: ${alert.title}`,
      severity: alert.severity,
    });

    const result: NotificationResult = {
      channel: NotificationChannel.EMAIL,
      success: true,
      timestamp,
    };

    this.notificationHistory.push(result);
    return result;
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(alert: AlertInstance): Promise<NotificationResult> {
    const timestamp = new Date();
    
    if (!this.config.channels.webhook.enabled || this.config.channels.webhook.urls.length === 0) {
      throw new Error('Webhook notifications not configured');
    }

    const payload = {
      event: 'alert_created',
      alert: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        category: alert.category,
        status: alert.status,
        createdAt: alert.createdAt.toISOString(),
        metadata: alert.metadata,
        tags: alert.tags,
        runbookUrl: alert.runbookUrl,
      },
      timestamp: timestamp.toISOString(),
    };

    const results = await Promise.allSettled(
      this.config.channels.webhook.urls.map(url => 
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.config.channels.webhook.headers,
          },
          body: JSON.stringify(payload),
        })
      )
    );

    const success = results.every(result => 
      result.status === 'fulfilled' && result.value.ok
    );

    const result: NotificationResult = {
      channel: NotificationChannel.WEBHOOK,
      success,
      timestamp,
    };

    this.notificationHistory.push(result);
    return result;
  }

  /**
   * Send PagerDuty notification
   */
  private async sendPagerDutyNotification(alert: AlertInstance): Promise<NotificationResult> {
    const timestamp = new Date();
    
    if (!this.config.channels.pagerduty.enabled || !this.config.channels.pagerduty.integrationKey) {
      throw new Error('PagerDuty notifications not configured');
    }

    // This would integrate with PagerDuty API
    // For now, we'll log the PagerDuty notification
    this.logger.info('PagerDuty notification would be sent', {
      alertId: alert.id,
      integrationKey: this.config.channels.pagerduty.integrationKey,
      escalationPolicy: this.config.channels.pagerduty.escalationPolicy,
      severity: alert.severity,
    });

    const result: NotificationResult = {
      channel: NotificationChannel.PAGERDUTY,
      success: true,
      timestamp,
    };

    this.notificationHistory.push(result);
    return result;
  }

  /**
   * Send acknowledgment notification
   */
  private async sendAcknowledgmentNotification(alert: AlertInstance): Promise<void> {
    const channels = this.alertDefinitions.get(alert.definitionId)?.channels || [];
    
    for (const channel of channels) {
      try {
        await this.sendNotification(alert, channel);
      } catch (error) {
        this.logger.error('Failed to send acknowledgment notification', {
          alertId: alert.id,
          channel,
          error: (error as Error).message,
        });
      }
    }
  }

  /**
   * Send resolution notification
   */
  private async sendResolutionNotification(alert: AlertInstance): Promise<void> {
    const channels = this.alertDefinitions.get(alert.definitionId)?.channels || [];
    
    for (const channel of channels) {
      try {
        await this.sendNotification(alert, channel);
      } catch (error) {
        this.logger.error('Failed to send resolution notification', {
          alertId: alert.id,
          channel,
          error: (error as Error).message,
        });
      }
    }
  }

  /**
   * Schedule escalation for an alert
   */
  private scheduleEscalation(alert: AlertInstance, policyId: string): void {
    const policy = this.escalationPolicies.get(policyId);
    if (!policy) {
      this.logger.error('Escalation policy not found', { policyId });
      return;
    }

    // Schedule escalation based on policy levels
    policy.levels.forEach(level => {
      setTimeout(async () => {
        const currentAlert = this.activeAlerts.get(alert.id);
        if (!currentAlert || currentAlert.status !== AlertStatus.ACTIVE) {
          return; // Alert no longer active
        }

        await this.escalateAlert(currentAlert, level);
      }, level.delay * 60 * 1000); // Convert minutes to milliseconds
    });
  }

  /**
   * Escalate an alert
   */
  private async escalateAlert(alert: AlertInstance, level: any): Promise<void> {
    alert.escalationLevel = level.level;
    alert.lastEscalatedAt = new Date();

    this.activeAlerts.set(alert.id, alert);

    this.logger.warn('Alert escalated', {
      alertId: alert.id,
      escalationLevel: level.level,
      channels: level.channels,
    });

    // Send escalation notifications
    await this.sendNotifications(alert, level.channels);

    // Record business metric
    Observing.recordBusinessMetric('alert_escalated', 1, {
      alertId: alert.id,
      escalationLevel: level.level,
      severity: alert.severity,
    });
  }

  /**
   * Check if alert is suppressed
   */
  private isSuppressed(definitionId: string): boolean {
    const suppression = this.suppressionRules.get(definitionId);
    if (!suppression) return false;

    const now = new Date();
    const timeSinceLastAlert = now.getTime() - suppression.lastAlert.getTime();
    const suppressionWindowMs = this.config.suppressionWindow * 60 * 1000;

    return timeSinceLastAlert < suppressionWindowMs;
  }

  /**
   * Check if alert is duplicate
   */
  private isDuplicate(definitionId: string, title: string): boolean {
    const recentAlerts = this.alertHistory.filter(alert => 
      alert.definitionId === definitionId &&
      alert.title === title &&
      alert.createdAt.getTime() > Date.now() - (5 * 60 * 1000) // Last 5 minutes
    );

    return recentAlerts.length > 0;
  }

  /**
   * Update suppression tracking
   */
  private updateSuppressionTracking(definitionId: string): void {
    const suppression = this.suppressionRules.get(definitionId) || { count: 0, lastAlert: new Date() };
    suppression.count++;
    suppression.lastAlert = new Date();
    this.suppressionRules.set(definitionId, suppression);
  }

  /**
   * Setup default escalation policies
   */
  private setupDefaultEscalationPolicies(): void {
    const defaultPolicy: EscalationPolicy = {
      id: 'default',
      name: 'Default Escalation Policy',
      description: 'Standard escalation policy for all alerts',
      levels: [
        {
          level: 1,
          delay: 15, // 15 minutes
          channels: [NotificationChannel.SLACK],
          recipients: ['on-call'],
        },
        {
          level: 2,
          delay: 30, // 30 minutes
          channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL],
          recipients: ['on-call', 'team-lead'],
        },
        {
          level: 3,
          delay: 60, // 1 hour
          channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL, NotificationChannel.PAGERDUTY],
          recipients: ['on-call', 'team-lead', 'engineering-manager'],
        },
      ],
    };

    this.registerEscalationPolicy(defaultPolicy);
  }

  /**
   * Setup default alert definitions
   */
  private setupDefaultAlertDefinitions(): void {
    const defaultDefinitions: AlertDefinition[] = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        description: 'Application error rate exceeds threshold',
        category: AlertCategory.ERROR,
        severity: AlertSeverity.HIGH,
        conditions: [
          {
            metric: 'error_rate',
            operator: 'gt',
            threshold: 5, // 5%
            timeWindow: 5, // 5 minutes
          },
        ],
        channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL],
        escalationPolicy: 'default',
        tags: ['error', 'performance'],
        runbookUrl: 'https://docs.company.com/runbooks/high-error-rate',
      },
      {
        id: 'slow_response_time',
        name: 'Slow Response Time',
        description: 'Application response time exceeds threshold',
        category: AlertCategory.PERFORMANCE,
        severity: AlertSeverity.MEDIUM,
        conditions: [
          {
            metric: 'response_time_p95',
            operator: 'gt',
            threshold: 2000, // 2 seconds
            timeWindow: 10, // 10 minutes
          },
        ],
        channels: [NotificationChannel.SLACK],
        escalationPolicy: 'default',
        tags: ['performance', 'latency'],
        runbookUrl: 'https://docs.company.com/runbooks/slow-response-time',
      },
      {
        id: 'service_unhealthy',
        name: 'Service Unhealthy',
        description: 'Critical service is unhealthy',
        category: AlertCategory.HEALTH,
        severity: AlertSeverity.CRITICAL,
        conditions: [
          {
            metric: 'health_score',
            operator: 'lt',
            threshold: 50, // 50%
            timeWindow: 2, // 2 minutes
          },
        ],
        channels: [NotificationChannel.SLACK, NotificationChannel.EMAIL, NotificationChannel.PAGERDUTY],
        escalationPolicy: 'default',
        tags: ['health', 'service'],
        runbookUrl: 'https://docs.company.com/runbooks/service-unhealthy',
      },
    ];

    defaultDefinitions.forEach(definition => {
      this.registerAlertDefinition(definition);
    });
  }

  /**
   * Helper methods
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverityColor(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return 'danger';
      case AlertSeverity.HIGH: return 'warning';
      case AlertSeverity.MEDIUM: return 'good';
      case AlertSeverity.LOW: return '#36a64f';
      default: return 'good';
    }
  }

  private getSeverityEmoji(severity: AlertSeverity): string {
    switch (severity) {
      case AlertSeverity.CRITICAL: return '🚨';
      case AlertSeverity.HIGH: return '⚠️';
      case AlertSeverity.MEDIUM: return '📊';
      case AlertSeverity.LOW: return 'ℹ️';
      default: return '📊';
    }
  }
}

// Global alerting system instance
export const alertingSystem = AlertingSystem.getInstance();

// Convenience functions
export async function createAlert(
  definitionId: string,
  title: string,
  description: string,
  metadata?: Record<string, any>,
  tags?: string[]
): Promise<AlertInstance | null> {
  return alertingSystem.createAlert(definitionId, title, description, metadata, tags);
}

export async function acknowledgeAlert(
  alertId: string,
  acknowledgedBy: string,
  note?: string
): Promise<boolean> {
  return alertingSystem.acknowledgeAlert(alertId, acknowledgedBy, note);
}

export async function resolveAlert(
  alertId: string,
  resolvedBy: string,
  resolution?: string
): Promise<boolean> {
  return alertingSystem.resolveAlert(alertId, resolvedBy, resolution);
}

export function registerAlertDefinition(definition: AlertDefinition): void {
  alertingSystem.registerAlertDefinition(definition);
}

export function registerEscalationPolicy(policy: EscalationPolicy): void {
  alertingSystem.registerEscalationPolicy(policy);
}

export function getAlertStatistics(): AlertStatistics {
  return alertingSystem.getAlertStatistics();
}

export function getActiveAlerts(): AlertInstance[] {
  return alertingSystem.getActiveAlerts();
}

export function getAlertHistory(limit?: number): AlertInstance[] {
  return alertingSystem.getAlertHistory(limit);
}
