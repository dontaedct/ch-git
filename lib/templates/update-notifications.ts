/**
 * @fileoverview Template Update Notifications System - HT-032.3.2
 * @module lib/templates/update-notifications
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Update notification system for template versions with intelligent
 * notifications, scheduling, and user preference management.
 */

import { z } from 'zod';
import { TemplateVersionInfo, TemplateDependency } from './versioning-system';
import { DependencyUpdate } from './dependency-manager';

// Notification types and interfaces
export interface UpdateNotification {
  id: string;
  templateId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  details: NotificationDetails;
  metadata: NotificationMetadata;
  actions: NotificationAction[];
  status: NotificationStatus;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  expiresAt?: Date;
  readAt?: Date;
  dismissedAt?: Date;
  userId?: string;
}

export type NotificationType = 
  | 'version_available'
  | 'security_update'
  | 'breaking_change'
  | 'dependency_update'
  | 'deprecation_warning'
  | 'maintenance_required'
  | 'compatibility_issue'
  | 'performance_update';

export type NotificationSeverity = 'info' | 'warning' | 'error' | 'critical';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'dismissed' | 'expired' | 'failed';

export interface NotificationDetails {
  currentVersion?: string;
  availableVersion?: string;
  updateType?: 'major' | 'minor' | 'patch';
  changelog?: string[];
  breakingChanges?: string[];
  securityFixes?: string[];
  dependencies?: DependencyUpdateInfo[];
  migrationRequired?: boolean;
  estimatedUpdateTime?: number;
  rollbackSupported?: boolean;
}

export interface DependencyUpdateInfo {
  name: string;
  currentVersion: string;
  availableVersion: string;
  security: boolean;
  breaking: boolean;
}

export interface NotificationMetadata {
  source: 'system' | 'user' | 'scheduler' | 'webhook';
  channel: NotificationChannel[];
  priority: number;
  groupId?: string;
  templateVersion?: string;
  userPreferences?: UserNotificationPreferences;
  retryCount?: number;
  lastRetry?: Date;
}

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'webhook' | 'slack';

export interface NotificationAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  action: 'update' | 'dismiss' | 'snooze' | 'view_details' | 'rollback' | 'schedule';
  url?: string;
  payload?: Record<string, any>;
  requiresConfirmation?: boolean;
}

export interface UserNotificationPreferences {
  userId: string;
  channels: NotificationChannelPreference[];
  frequency: NotificationFrequency;
  quietHours?: QuietHours;
  categories: NotificationCategoryPreference[];
  autoUpdate?: AutoUpdatePreference;
  groupNotifications?: boolean;
  maxNotificationsPerDay?: number;
}

export interface NotificationChannelPreference {
  channel: NotificationChannel;
  enabled: boolean;
  severityThreshold: NotificationSeverity;
  templates?: string[]; // Specific templates to watch
  excludeTemplates?: string[]; // Templates to exclude
}

export interface NotificationFrequency {
  immediate: boolean;
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
  customInterval?: number; // in hours
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  timezone: string;
  days: number[]; // 0-6, Sunday to Saturday
}

export interface NotificationCategoryPreference {
  type: NotificationType;
  enabled: boolean;
  severity: NotificationSeverity;
  autoAction?: 'update' | 'dismiss' | 'snooze';
}

export interface AutoUpdatePreference {
  enabled: boolean;
  allowedUpdateTypes: ('major' | 'minor' | 'patch')[];
  excludeBreaking: boolean;
  requireSecurity: boolean;
  scheduleTime?: string; // HH:MM format
  maxConcurrentUpdates?: number;
}

export interface NotificationSchedule {
  id: string;
  templateId: string;
  type: 'check_updates' | 'send_digest' | 'cleanup_old' | 'security_scan';
  frequency: ScheduleFrequency;
  nextRun: Date;
  lastRun?: Date;
  enabled: boolean;
  config: ScheduleConfig;
}

export interface ScheduleFrequency {
  type: 'interval' | 'cron' | 'daily' | 'weekly' | 'monthly';
  value: string | number;
  timezone?: string;
}

export interface ScheduleConfig {
  checkDependencies?: boolean;
  includePrerelease?: boolean;
  securityOnly?: boolean;
  notifyUsers?: string[];
  autoUpdate?: boolean;
  dryRun?: boolean;
}

export interface NotificationDigest {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  generatedAt: Date;
  notifications: UpdateNotification[];
  summary: DigestSummary;
  actions: DigestAction[];
}

export interface DigestSummary {
  totalNotifications: number;
  byType: Record<NotificationType, number>;
  bySeverity: Record<NotificationSeverity, number>;
  criticalCount: number;
  securityCount: number;
  templatesAffected: string[];
  recommendedActions: string[];
}

export interface DigestAction {
  type: 'update_all' | 'update_security' | 'view_details' | 'manage_preferences';
  label: string;
  count?: number;
  url?: string;
}

export interface NotificationDeliveryResult {
  notificationId: string;
  channel: NotificationChannel;
  success: boolean;
  timestamp: Date;
  error?: string;
  retryAfter?: Date;
}

/**
 * Template Update Notifications Manager
 * Manages update notifications, user preferences, and delivery
 */
export class TemplateUpdateNotificationManager {
  private notifications: Map<string, UpdateNotification> = new Map();
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private schedules: Map<string, NotificationSchedule> = new Map();
  private deliveryLog: Map<string, NotificationDeliveryResult[]> = new Map();
  private notificationGroups: Map<string, string[]> = new Map(); // groupId -> notificationIds

  /**
   * Create a new update notification
   */
  async createNotification(
    templateId: string,
    type: NotificationType,
    options: CreateNotificationOptions
  ): Promise<UpdateNotification> {
    const notification: UpdateNotification = {
      id: this.generateNotificationId(),
      templateId,
      type,
      severity: options.severity || this.getDefaultSeverity(type),
      title: options.title || this.generateTitle(type, templateId),
      message: options.message || this.generateMessage(type, templateId, options.details),
      details: options.details || {},
      metadata: {
        source: options.source || 'system',
        channel: options.channels || ['in_app'],
        priority: options.priority || this.getDefaultPriority(type),
        groupId: options.groupId,
        templateVersion: options.templateVersion,
        retryCount: 0
      },
      actions: options.actions || this.generateDefaultActions(type),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      scheduledFor: options.scheduledFor,
      expiresAt: options.expiresAt || this.calculateExpiry(type),
      userId: options.userId
    };

    // Store notification
    this.notifications.set(notification.id, notification);

    // Group notification if groupId provided
    if (notification.metadata.groupId) {
      this.addToGroup(notification.metadata.groupId, notification.id);
    }

    // Schedule delivery if not immediate
    if (notification.scheduledFor && notification.scheduledFor > new Date()) {
      await this.scheduleNotification(notification);
    } else {
      await this.deliverNotification(notification);
    }

    return notification;
  }

  /**
   * Check for updates and create notifications
   */
  async checkForUpdates(templateId: string): Promise<UpdateNotification[]> {
    const notifications: UpdateNotification[] = [];

    try {
      // Check for template version updates
      const versionUpdates = await this.checkVersionUpdates(templateId);
      for (const update of versionUpdates) {
        const notification = await this.createVersionUpdateNotification(templateId, update);
        notifications.push(notification);
      }

      // Check for dependency updates
      const dependencyUpdates = await this.checkDependencyUpdates(templateId);
      for (const update of dependencyUpdates) {
        const notification = await this.createDependencyUpdateNotification(templateId, update);
        notifications.push(notification);
      }

      // Check for security updates
      const securityUpdates = await this.checkSecurityUpdates(templateId);
      for (const update of securityUpdates) {
        const notification = await this.createSecurityUpdateNotification(templateId, update);
        notifications.push(notification);
      }

    } catch (error) {
      console.error(`Error checking updates for template ${templateId}:`, error);
    }

    return notifications;
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(
    userId: string,
    options: GetNotificationsOptions = {}
  ): Promise<UpdateNotification[]> {
    let notifications = Array.from(this.notifications.values());

    // Filter by user
    if (userId) {
      notifications = notifications.filter(n => 
        !n.userId || n.userId === userId
      );
    }

    // Filter by status
    if (options.status) {
      notifications = notifications.filter(n => 
        options.status!.includes(n.status)
      );
    }

    // Filter by type
    if (options.types) {
      notifications = notifications.filter(n => 
        options.types!.includes(n.type)
      );
    }

    // Filter by severity
    if (options.severity) {
      notifications = notifications.filter(n => 
        options.severity!.includes(n.severity)
      );
    }

    // Filter by template
    if (options.templateIds) {
      notifications = notifications.filter(n => 
        options.templateIds!.includes(n.templateId)
      );
    }

    // Filter by date range
    if (options.since) {
      notifications = notifications.filter(n => 
        n.createdAt >= options.since!
      );
    }

    if (options.until) {
      notifications = notifications.filter(n => 
        n.createdAt <= options.until!
      );
    }

    // Sort by priority and date
    notifications.sort((a, b) => {
      if (a.metadata.priority !== b.metadata.priority) {
        return b.metadata.priority - a.metadata.priority;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Apply pagination
    if (options.limit) {
      const offset = options.offset || 0;
      notifications = notifications.slice(offset, offset + options.limit);
    }

    return notifications;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId?: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    if (userId && notification.userId && notification.userId !== userId) {
      throw new Error('Unauthorized to mark this notification as read');
    }

    notification.status = 'read';
    notification.readAt = new Date();
    notification.updatedAt = new Date();
  }

  /**
   * Dismiss notification
   */
  async dismissNotification(notificationId: string, userId?: string): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    if (userId && notification.userId && notification.userId !== userId) {
      throw new Error('Unauthorized to dismiss this notification');
    }

    notification.status = 'dismissed';
    notification.dismissedAt = new Date();
    notification.updatedAt = new Date();
  }

  /**
   * Snooze notification
   */
  async snoozeNotification(
    notificationId: string, 
    duration: number, 
    userId?: string
  ): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    if (userId && notification.userId && notification.userId !== userId) {
      throw new Error('Unauthorized to snooze this notification');
    }

    const snoozeUntil = new Date(Date.now() + duration * 60 * 1000); // duration in minutes
    notification.scheduledFor = snoozeUntil;
    notification.status = 'pending';
    notification.updatedAt = new Date();

    await this.scheduleNotification(notification);
  }

  /**
   * Execute notification action
   */
  async executeAction(
    notificationId: string,
    actionId: string,
    userId?: string,
    payload?: Record<string, any>
  ): Promise<any> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    const action = notification.actions.find(a => a.id === actionId);
    if (!action) {
      throw new Error(`Action ${actionId} not found`);
    }

    if (userId && notification.userId && notification.userId !== userId) {
      throw new Error('Unauthorized to execute this action');
    }

    // Execute action based on type
    switch (action.action) {
      case 'update':
        return await this.executeUpdateAction(notification, payload);
      case 'dismiss':
        await this.dismissNotification(notificationId, userId);
        return { success: true };
      case 'snooze':
        const duration = payload?.duration || 60; // Default 1 hour
        await this.snoozeNotification(notificationId, duration, userId);
        return { success: true };
      case 'view_details':
        return { url: action.url || `/admin/templates/${notification.templateId}/versions` };
      default:
        throw new Error(`Unknown action type: ${action.action}`);
    }
  }

  /**
   * Set user notification preferences
   */
  async setUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    const existing = this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
    const updated = { ...existing, ...preferences, userId };
    this.userPreferences.set(userId, updated);
  }

  /**
   * Get user notification preferences
   */
  getUserPreferences(userId: string): UserNotificationPreferences {
    return this.userPreferences.get(userId) || this.getDefaultPreferences(userId);
  }

  /**
   * Create notification digest
   */
  async createDigest(
    userId: string,
    period: 'daily' | 'weekly' | 'monthly'
  ): Promise<NotificationDigest> {
    const preferences = this.getUserPreferences(userId);
    const notifications = await this.getNotifications(userId, {
      status: ['pending', 'sent'],
      since: this.getDigestPeriodStart(period)
    });

    const summary = this.generateDigestSummary(notifications);
    const actions = this.generateDigestActions(notifications, summary);

    return {
      id: this.generateDigestId(),
      userId,
      period,
      generatedAt: new Date(),
      notifications,
      summary,
      actions
    };
  }

  /**
   * Schedule notification check
   */
  async scheduleNotificationCheck(
    templateId: string,
    schedule: Partial<NotificationSchedule>
  ): Promise<NotificationSchedule> {
    const scheduleItem: NotificationSchedule = {
      id: this.generateScheduleId(),
      templateId,
      type: schedule.type || 'check_updates',
      frequency: schedule.frequency || { type: 'daily', value: '09:00' },
      nextRun: schedule.nextRun || this.calculateNextRun(schedule.frequency || { type: 'daily', value: '09:00' }),
      enabled: schedule.enabled !== false,
      config: schedule.config || {}
    };

    this.schedules.set(scheduleItem.id, scheduleItem);
    return scheduleItem;
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    for (const [id, notification] of this.notifications) {
      if (notification.createdAt < cutoffDate && 
          (notification.status === 'read' || notification.status === 'dismissed' || notification.status === 'expired')) {
        this.notifications.delete(id);
        this.deliveryLog.delete(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // Private helper methods

  private generateNotificationId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDigestId(): string {
    return `digest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateScheduleId(): string {
    return `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultSeverity(type: NotificationType): NotificationSeverity {
    const severityMap: Record<NotificationType, NotificationSeverity> = {
      version_available: 'info',
      security_update: 'critical',
      breaking_change: 'error',
      dependency_update: 'info',
      deprecation_warning: 'warning',
      maintenance_required: 'warning',
      compatibility_issue: 'error',
      performance_update: 'info'
    };
    return severityMap[type] || 'info';
  }

  private getDefaultPriority(type: NotificationType): number {
    const priorityMap: Record<NotificationType, number> = {
      security_update: 10,
      breaking_change: 8,
      compatibility_issue: 7,
      maintenance_required: 6,
      deprecation_warning: 5,
      dependency_update: 4,
      performance_update: 3,
      version_available: 2
    };
    return priorityMap[type] || 1;
  }

  private generateTitle(type: NotificationType, templateId: string): string {
    const titleMap: Record<NotificationType, string> = {
      version_available: `New version available for ${templateId}`,
      security_update: `Security update required for ${templateId}`,
      breaking_change: `Breaking changes in ${templateId}`,
      dependency_update: `Dependency updates available for ${templateId}`,
      deprecation_warning: `Deprecated features in ${templateId}`,
      maintenance_required: `Maintenance required for ${templateId}`,
      compatibility_issue: `Compatibility issue detected in ${templateId}`,
      performance_update: `Performance improvements available for ${templateId}`
    };
    return titleMap[type] || `Update notification for ${templateId}`;
  }

  private generateMessage(type: NotificationType, templateId: string, details: NotificationDetails): string {
    // Generate contextual message based on type and details
    switch (type) {
      case 'version_available':
        return `Version ${details.availableVersion} is now available for ${templateId}. Current version: ${details.currentVersion}`;
      case 'security_update':
        return `Critical security update available for ${templateId}. Please update immediately.`;
      case 'breaking_change':
        return `Breaking changes detected in the latest version of ${templateId}. Review changes before updating.`;
      default:
        return `Update notification for ${templateId}`;
    }
  }

  private generateDefaultActions(type: NotificationType): NotificationAction[] {
    const commonActions: NotificationAction[] = [
      {
        id: 'view_details',
        label: 'View Details',
        type: 'secondary',
        action: 'view_details'
      },
      {
        id: 'dismiss',
        label: 'Dismiss',
        type: 'secondary',
        action: 'dismiss'
      }
    ];

    switch (type) {
      case 'version_available':
      case 'security_update':
      case 'dependency_update':
        return [
          {
            id: 'update',
            label: 'Update Now',
            type: 'primary',
            action: 'update'
          },
          ...commonActions
        ];
      default:
        return commonActions;
    }
  }

  private calculateExpiry(type: NotificationType): Date {
    const expiryHours: Record<NotificationType, number> = {
      version_available: 24 * 7, // 1 week
      security_update: 24 * 3, // 3 days
      breaking_change: 24 * 14, // 2 weeks
      dependency_update: 24 * 7, // 1 week
      deprecation_warning: 24 * 30, // 1 month
      maintenance_required: 24 * 7, // 1 week
      compatibility_issue: 24 * 3, // 3 days
      performance_update: 24 * 14 // 2 weeks
    };
    
    const hours = expiryHours[type] || 24 * 7; // Default 1 week
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  private addToGroup(groupId: string, notificationId: string): void {
    if (!this.notificationGroups.has(groupId)) {
      this.notificationGroups.set(groupId, []);
    }
    this.notificationGroups.get(groupId)!.push(notificationId);
  }

  private async scheduleNotification(notification: UpdateNotification): Promise<void> {
    // Implementation would schedule notification for delivery
    console.log(`Scheduling notification ${notification.id} for ${notification.scheduledFor}`);
  }

  private async deliverNotification(notification: UpdateNotification): Promise<void> {
    const userPreferences = notification.userId ? 
      this.getUserPreferences(notification.userId) : null;
    
    // Check if notification should be delivered based on preferences
    if (userPreferences && !this.shouldDeliverNotification(notification, userPreferences)) {
      notification.status = 'dismissed';
      return;
    }

    // Deliver through configured channels
    const results: NotificationDeliveryResult[] = [];
    
    for (const channel of notification.metadata.channel) {
      try {
        const result = await this.deliverToChannel(notification, channel);
        results.push(result);
      } catch (error) {
        results.push({
          notificationId: notification.id,
          channel,
          success: false,
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Store delivery results
    this.deliveryLog.set(notification.id, results);

    // Update notification status
    const hasSuccess = results.some(r => r.success);
    notification.status = hasSuccess ? 'sent' : 'failed';
    notification.updatedAt = new Date();

    // Schedule retry if all deliveries failed
    if (!hasSuccess && (notification.metadata.retryCount || 0) < 3) {
      notification.metadata.retryCount = (notification.metadata.retryCount || 0) + 1;
      notification.metadata.lastRetry = new Date();
      notification.scheduledFor = new Date(Date.now() + 60 * 60 * 1000); // Retry in 1 hour
      await this.scheduleNotification(notification);
    }
  }

  private shouldDeliverNotification(
    notification: UpdateNotification,
    preferences: UserNotificationPreferences
  ): boolean {
    // Check if notification type is enabled
    const categoryPref = preferences.categories.find(c => c.type === notification.type);
    if (categoryPref && !categoryPref.enabled) {
      return false;
    }

    // Check severity threshold
    const severityOrder = { info: 1, warning: 2, error: 3, critical: 4 };
    if (categoryPref) {
      const notificationSeverity = severityOrder[notification.severity];
      const thresholdSeverity = severityOrder[categoryPref.severity];
      if (notificationSeverity < thresholdSeverity) {
        return false;
      }
    }

    // Check quiet hours
    if (preferences.quietHours?.enabled) {
      const now = new Date();
      const isQuietTime = this.isInQuietHours(now, preferences.quietHours);
      if (isQuietTime && notification.severity !== 'critical') {
        return false;
      }
    }

    return true;
  }

  private isInQuietHours(date: Date, quietHours: QuietHours): boolean {
    // Implementation would check if current time is in quiet hours
    return false;
  }

  private async deliverToChannel(
    notification: UpdateNotification,
    channel: NotificationChannel
  ): Promise<NotificationDeliveryResult> {
    // Implementation would deliver notification to specific channel
    console.log(`Delivering notification ${notification.id} to ${channel}`);
    
    return {
      notificationId: notification.id,
      channel,
      success: true,
      timestamp: new Date()
    };
  }

  private getDefaultPreferences(userId: string): UserNotificationPreferences {
    return {
      userId,
      channels: [
        {
          channel: 'in_app',
          enabled: true,
          severityThreshold: 'info'
        },
        {
          channel: 'email',
          enabled: true,
          severityThreshold: 'warning'
        }
      ],
      frequency: {
        immediate: true,
        daily: false,
        weekly: false,
        monthly: false
      },
      categories: Object.values(['version_available', 'security_update', 'breaking_change', 'dependency_update', 'deprecation_warning', 'maintenance_required', 'compatibility_issue', 'performance_update'] as NotificationType[]).map(type => ({
        type,
        enabled: true,
        severity: type === 'security_update' ? 'critical' as NotificationSeverity : 'info' as NotificationSeverity
      })),
      groupNotifications: true,
      maxNotificationsPerDay: 10
    };
  }

  private async checkVersionUpdates(templateId: string): Promise<TemplateVersionInfo[]> {
    // Implementation would check for version updates
    return [];
  }

  private async checkDependencyUpdates(templateId: string): Promise<DependencyUpdate[]> {
    // Implementation would check for dependency updates
    return [];
  }

  private async checkSecurityUpdates(templateId: string): Promise<any[]> {
    // Implementation would check for security updates
    return [];
  }

  private async createVersionUpdateNotification(
    templateId: string,
    update: TemplateVersionInfo
  ): Promise<UpdateNotification> {
    return this.createNotification(templateId, 'version_available', {
      severity: 'info',
      details: {
        availableVersion: update.version,
        changelog: update.changelog.map(c => c.description)
      }
    });
  }

  private async createDependencyUpdateNotification(
    templateId: string,
    update: DependencyUpdate
  ): Promise<UpdateNotification> {
    return this.createNotification(templateId, 'dependency_update', {
      severity: update.security ? 'critical' : 'info',
      details: {
        dependencies: [{
          name: update.dependency.name,
          currentVersion: update.currentVersion,
          availableVersion: update.latestVersion,
          security: update.security,
          breaking: update.breaking
        }]
      }
    });
  }

  private async createSecurityUpdateNotification(
    templateId: string,
    update: any
  ): Promise<UpdateNotification> {
    return this.createNotification(templateId, 'security_update', {
      severity: 'critical',
      details: {
        securityFixes: [update.description]
      }
    });
  }

  private async executeUpdateAction(
    notification: UpdateNotification,
    payload?: Record<string, any>
  ): Promise<any> {
    // Implementation would execute the update action
    console.log(`Executing update action for notification ${notification.id}`);
    return { success: true };
  }

  private getDigestPeriodStart(period: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    switch (period) {
      case 'daily':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private generateDigestSummary(notifications: UpdateNotification[]): DigestSummary {
    const byType: Record<NotificationType, number> = {} as any;
    const bySeverity: Record<NotificationSeverity, number> = {} as any;
    const templatesAffected = new Set<string>();

    for (const notification of notifications) {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      bySeverity[notification.severity] = (bySeverity[notification.severity] || 0) + 1;
      templatesAffected.add(notification.templateId);
    }

    return {
      totalNotifications: notifications.length,
      byType,
      bySeverity,
      criticalCount: bySeverity.critical || 0,
      securityCount: byType.security_update || 0,
      templatesAffected: Array.from(templatesAffected),
      recommendedActions: this.generateRecommendedActions(notifications)
    };
  }

  private generateDigestActions(
    notifications: UpdateNotification[],
    summary: DigestSummary
  ): DigestAction[] {
    const actions: DigestAction[] = [];

    if (summary.securityCount > 0) {
      actions.push({
        type: 'update_security',
        label: 'Update Security Issues',
        count: summary.securityCount,
        url: '/admin/templates/security-updates'
      });
    }

    if (summary.totalNotifications > 0) {
      actions.push({
        type: 'update_all',
        label: 'Review All Updates',
        count: summary.totalNotifications,
        url: '/admin/templates/updates'
      });
    }

    actions.push({
      type: 'manage_preferences',
      label: 'Manage Notification Preferences',
      url: '/admin/settings/notifications'
    });

    return actions;
  }

  private generateRecommendedActions(notifications: UpdateNotification[]): string[] {
    const actions: string[] = [];
    
    const securityCount = notifications.filter(n => n.type === 'security_update').length;
    if (securityCount > 0) {
      actions.push(`Apply ${securityCount} security updates immediately`);
    }

    const breakingCount = notifications.filter(n => n.type === 'breaking_change').length;
    if (breakingCount > 0) {
      actions.push(`Review ${breakingCount} breaking changes before updating`);
    }

    return actions;
  }

  private calculateNextRun(frequency: ScheduleFrequency): Date {
    const now = new Date();
    
    switch (frequency.type) {
      case 'daily':
        const [hours, minutes] = (frequency.value as string).split(':').map(Number);
        const nextRun = new Date(now);
        nextRun.setHours(hours, minutes, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
        return nextRun;
      
      case 'interval':
        return new Date(now.getTime() + (frequency.value as number) * 60 * 60 * 1000);
      
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to 24 hours
    }
  }
}

// Additional interfaces for API
export interface CreateNotificationOptions {
  severity?: NotificationSeverity;
  title?: string;
  message?: string;
  details?: NotificationDetails;
  actions?: NotificationAction[];
  channels?: NotificationChannel[];
  priority?: number;
  source?: 'system' | 'user' | 'scheduler' | 'webhook';
  groupId?: string;
  templateVersion?: string;
  userId?: string;
  scheduledFor?: Date;
  expiresAt?: Date;
}

export interface GetNotificationsOptions {
  status?: NotificationStatus[];
  types?: NotificationType[];
  severity?: NotificationSeverity[];
  templateIds?: string[];
  since?: Date;
  until?: Date;
  limit?: number;
  offset?: number;
}

// Global instance
let globalNotificationManager: TemplateUpdateNotificationManager | null = null;

/**
 * Get the global template update notification manager instance
 */
export function getTemplateUpdateNotificationManager(): TemplateUpdateNotificationManager {
  if (!globalNotificationManager) {
    globalNotificationManager = new TemplateUpdateNotificationManager();
  }
  return globalNotificationManager;
}

/**
 * Initialize template update notification manager
 */
export function initializeTemplateUpdateNotifications(): TemplateUpdateNotificationManager {
  globalNotificationManager = new TemplateUpdateNotificationManager();
  return globalNotificationManager;
}
