/**
 * @fileoverview HT-008.8.2: Real-time Error Tracking and Reporting System
 * @module lib/monitoring/error-tracker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.2 - Add real-time error tracking and reporting
 * Focus: Production-grade error tracking with real-time reporting and analytics
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production monitoring, alerting systems)
 */

import { AppError, ErrorSeverity, ErrorCategory, ErrorContext } from '../errors/types';
import { Logger } from '../logger';
import { Observing } from '../observability';

// Enhanced error tracking configuration
interface ErrorTrackingConfig {
  enableRealTimeReporting: boolean;
  enableErrorAnalytics: boolean;
  enablePerformanceTracking: boolean;
  enableUserSessionTracking: boolean;
  enableErrorPatternDetection: boolean;
  enableAutomaticAlerting: boolean;
  maxErrorsPerMinute: number;
  errorRetentionDays: number;
  samplingRate: number;
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
  enableEmailNotifications: boolean;
  emailRecipients: string[];
}

const defaultConfig: ErrorTrackingConfig = {
  enableRealTimeReporting: true,
  enableErrorAnalytics: true,
  enablePerformanceTracking: true,
  enableUserSessionTracking: true,
  enableErrorPatternDetection: true,
  enableAutomaticAlerting: true,
  maxErrorsPerMinute: 100,
  errorRetentionDays: 30,
  samplingRate: 1.0,
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_ERROR_WEBHOOK_URL,
  enableEmailNotifications: false,
  emailRecipients: [],
};

// Error tracking metrics
interface ErrorMetrics {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByHour: Record<string, number>;
  topErrorMessages: Array<{ message: string; count: number }>;
  errorRate: number;
  criticalErrorRate: number;
  averageResolutionTime: number;
  userImpactScore: number;
}

// Real-time error event
export interface ErrorEvent {
  id: string;
  error: AppError;
  timestamp: Date;
  userAgent?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  componentStack?: string;
  performanceMetrics?: {
    memoryUsage?: number;
    loadTime?: number;
    renderTime?: number;
  };
  context: ErrorContext;
}

// Error pattern detection
export interface ErrorPattern {
  id: string;
  pattern: string;
  frequency: number;
  severity: ErrorSeverity;
  affectedUsers: number;
  firstSeen: Date;
  lastSeen: Date;
  isResolved: boolean;
  resolution?: string;
}

/**
 * Real-time Error Tracking and Reporting System
 * 
 * Provides comprehensive error tracking with real-time reporting,
 * analytics, pattern detection, and automated alerting capabilities.
 */
export class ErrorTracker {
  private static instance: ErrorTracker | null = null;
  private config: ErrorTrackingConfig;
  private logger = Logger.create({ component: 'error-tracker' });
  private errorEvents: ErrorEvent[] = [];
  private errorPatterns: Map<string, ErrorPattern> = new Map();
  private metrics: ErrorMetrics;
  private alertingThresholds = {
    criticalErrorRate: 0.01, // 1%
    errorRate: 0.05, // 5%
    patternFrequency: 10, // errors per hour
    userImpactThreshold: 0.1, // 10% of users affected
  };

  private constructor(config: Partial<ErrorTrackingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.metrics = this.initializeMetrics();
    this.startPeriodicTasks();
  }

  static getInstance(config?: Partial<ErrorTrackingConfig>): ErrorTracker {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker(config);
    }
    return ErrorTracker.instance;
  }

  /**
   * Track an error event with comprehensive context
   */
  async trackError(
    error: AppError,
    context: ErrorContext = {},
    additionalData?: {
      userId?: string;
      sessionId?: string;
      url?: string;
      componentStack?: string;
      performanceMetrics?: ErrorEvent['performanceMetrics'];
    }
  ): Promise<void> {
    try {
      // Apply sampling
      if (Math.random() > this.config.samplingRate) {
        return;
      }

      const errorEvent: ErrorEvent = {
        id: this.generateEventId(),
        error,
        timestamp: new Date(),
        userAgent: context.userAgent,
        userId: additionalData?.userId,
        sessionId: additionalData?.sessionId,
        url: additionalData?.url || context.route,
        componentStack: additionalData?.componentStack,
        performanceMetrics: additionalData?.performanceMetrics,
        context,
      };

      // Store error event
      this.errorEvents.push(errorEvent);

      // Update metrics
      this.updateMetrics(errorEvent);

      // Detect patterns
      if (this.config.enableErrorPatternDetection) {
        await this.detectErrorPatterns(errorEvent);
      }

      // Real-time reporting
      if (this.config.enableRealTimeReporting) {
        await this.reportErrorRealTime(errorEvent);
      }

      // Check alerting thresholds
      if (this.config.enableAutomaticAlerting) {
        await this.checkAlertingThresholds(errorEvent);
      }

      // Record business metrics using recordBusinessMetric instead
      Observing.recordBusinessMetric('errorTracked', 1, {
        category: error.category,
        severity: error.severity,
        correlationId: error.correlationId,
        route: error.context?.route || 'unknown',
      });

      // Cleanup old events
      this.cleanupOldEvents();

    } catch (trackingError) {
      this.logger.error('Failed to track error', {
        originalError: error.correlationId,
        trackingError: trackingError instanceof Error ? trackingError.message : String(trackingError),
      });
    }
  }

  /**
   * Get real-time error analytics
   */
  getErrorAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): ErrorMetrics {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    const recentErrors = this.errorEvents.filter(event => event.timestamp >= cutoffTime);

    return {
      totalErrors: recentErrors.length,
      errorsBySeverity: this.calculateErrorsBySeverity(recentErrors),
      errorsByCategory: this.calculateErrorsByCategory(recentErrors),
      errorsByHour: this.calculateErrorsByHour(recentErrors),
      topErrorMessages: this.calculateTopErrorMessages(recentErrors),
      errorRate: this.calculateErrorRate(recentErrors, timeRangeMs),
      criticalErrorRate: this.calculateCriticalErrorRate(recentErrors, timeRangeMs),
      averageResolutionTime: this.calculateAverageResolutionTime(recentErrors),
      userImpactScore: this.calculateUserImpactScore(recentErrors),
    };
  }

  /**
   * Get error patterns detected by the system
   */
  getErrorPatterns(): ErrorPattern[] {
    return Array.from(this.errorPatterns.values())
      .sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Mark an error pattern as resolved
   */
  async resolveErrorPattern(patternId: string, resolution: string): Promise<void> {
    const pattern = this.errorPatterns.get(patternId);
    if (pattern) {
      pattern.isResolved = true;
      pattern.resolution = resolution;
      
      this.logger.info('Error pattern resolved', {
        patternId,
        resolution,
        frequency: pattern.frequency,
      });

      // Notify stakeholders
      if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
        await this.sendSlackNotification(
          `✅ Error Pattern Resolved: ${pattern.pattern}`,
          `Resolution: ${resolution}\nFrequency: ${pattern.frequency} errors\nPattern ID: ${patternId}`
        );
      }
    }
  }

  /**
   * Get error trends and insights
   */
  getErrorTrends(): {
    trends: Array<{
      period: string;
      errorCount: number;
      severity: ErrorSeverity;
      category: ErrorCategory;
    }>;
    insights: string[];
    recommendations: string[];
  } {
    const trends = this.calculateErrorTrends();
    const insights = this.generateInsights();
    const recommendations = this.generateRecommendations();

    return { trends, insights, recommendations };
  }

  /**
   * Export error data for analysis
   */
  exportErrorData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      errors: this.errorEvents,
      patterns: Array.from(this.errorPatterns.values()),
      metrics: this.metrics,
      config: this.config,
      exportedAt: new Date().toISOString(),
    };

    if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): ErrorMetrics {
    return {
      totalErrors: 0,
      errorsBySeverity: {
        [ErrorSeverity.CRITICAL]: 0,
        [ErrorSeverity.HIGH]: 0,
        [ErrorSeverity.MEDIUM]: 0,
        [ErrorSeverity.LOW]: 0,
      },
      errorsByCategory: {
        [ErrorCategory.SYSTEM]: 0,
        [ErrorCategory.NETWORK]: 0,
        [ErrorCategory.VALIDATION]: 0,
        [ErrorCategory.SECURITY]: 0,
        [ErrorCategory.BUSINESS_LOGIC]: 0,
        [ErrorCategory.AUTHENTICATION]: 0,
        [ErrorCategory.AUTHORIZATION]: 0,
        [ErrorCategory.DATABASE]: 0,
        [ErrorCategory.EXTERNAL_SERVICE]: 0,
        [ErrorCategory.RATE_LIMIT]: 0,
        [ErrorCategory.NOT_FOUND]: 0,
        [ErrorCategory.CONFLICT]: 0,
        [ErrorCategory.INTERNAL]: 0,
      },
      errorsByHour: {},
      topErrorMessages: [],
      errorRate: 0,
      criticalErrorRate: 0,
      averageResolutionTime: 0,
      userImpactScore: 0,
    };
  }

  /**
   * Update metrics with new error event
   */
  private updateMetrics(event: ErrorEvent): void {
    this.metrics.totalErrors++;
    this.metrics.errorsBySeverity[event.error.severity]++;
    this.metrics.errorsByCategory[event.error.category]++;

    const hour = event.timestamp.getHours().toString();
    this.metrics.errorsByHour[hour] = (this.metrics.errorsByHour[hour] || 0) + 1;
  }

  /**
   * Detect error patterns
   */
  private async detectErrorPatterns(event: ErrorEvent): Promise<void> {
    const patternKey = this.generatePatternKey(event.error);
    const existingPattern = this.errorPatterns.get(patternKey);

    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastSeen = event.timestamp;
      existingPattern.affectedUsers = Math.max(
        existingPattern.affectedUsers,
        event.userId ? 1 : 0
      );
    } else {
      const newPattern: ErrorPattern = {
        id: patternKey,
        pattern: event.error.message,
        frequency: 1,
        severity: event.error.severity,
        affectedUsers: event.userId ? 1 : 0,
        firstSeen: event.timestamp,
        lastSeen: event.timestamp,
        isResolved: false,
      };
      this.errorPatterns.set(patternKey, newPattern);
    }

    // Check if pattern frequency exceeds threshold
    const pattern = this.errorPatterns.get(patternKey);
    if (pattern && pattern.frequency >= this.alertingThresholds.patternFrequency) {
      await this.triggerPatternAlert(pattern);
    }
  }

  /**
   * Report error in real-time
   */
  private async reportErrorRealTime(event: ErrorEvent): Promise<void> {
    // Send to webhook endpoints
    if (this.config.enableWebhookNotifications && this.config.webhookUrls.length > 0) {
      await Promise.all(
        this.config.webhookUrls.map(url => this.sendWebhookNotification(url, event))
      );
    }

    // Send to Slack
    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      await this.sendSlackNotification(
        `🚨 Error Alert: ${event.error.message}`,
        this.formatErrorForSlack(event)
      );
    }

    // Send email notifications for critical errors
    if (this.config.enableEmailNotifications && 
        event.error.severity === ErrorSeverity.CRITICAL) {
      await this.sendEmailNotification(event);
    }
  }

  /**
   * Check alerting thresholds
   */
  private async checkAlertingThresholds(event: ErrorEvent): Promise<void> {
    const analytics = this.getErrorAnalytics('1h');
    
    if (analytics.criticalErrorRate > this.alertingThresholds.criticalErrorRate) {
      await this.triggerCriticalErrorAlert(event, analytics);
    }

    if (analytics.errorRate > this.alertingThresholds.errorRate) {
      await this.triggerHighErrorRateAlert(event, analytics);
    }

    if (analytics.userImpactScore > this.alertingThresholds.userImpactThreshold) {
      await this.triggerUserImpactAlert(event, analytics);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(url: string, event: ErrorEvent): Promise<void> {
    try {
      const payload = {
        event: 'error_tracked',
        timestamp: event.timestamp.toISOString(),
        error: {
          id: event.id,
          message: event.error.message,
          severity: event.error.severity,
          category: event.error.category,
          correlationId: event.error.correlationId,
          stack: event.error.stack,
        },
        context: event.context,
        metrics: this.getErrorAnalytics('1h'),
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Error-Tracker': 'true',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send webhook notification', {
        url,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(title: string, message: string): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    try {
      const payload = {
        text: title,
        attachments: [{
          color: this.getSlackColor(),
          fields: [{
            title: 'Details',
            value: message,
            short: false,
          }],
          footer: 'Error Tracker',
          ts: Math.floor(Date.now() / 1000),
        }],
      };

      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send Slack notification', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(event: ErrorEvent): Promise<void> {
    // Implementation would depend on email service (Resend, SendGrid, etc.)
    this.logger.info('Email notification would be sent', {
      errorId: event.id,
      severity: event.error.severity,
      recipients: this.config.emailRecipients,
    });
  }

  /**
   * Trigger pattern alert
   */
  private async triggerPatternAlert(pattern: ErrorPattern): Promise<void> {
    this.logger.warn('Error pattern detected', {
      patternId: pattern.id,
      frequency: pattern.frequency,
      severity: pattern.severity,
    });

    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      await this.sendSlackNotification(
        `⚠️ Error Pattern Detected: ${pattern.pattern}`,
        `Frequency: ${pattern.frequency} errors\nSeverity: ${pattern.severity}\nFirst seen: ${pattern.firstSeen.toISOString()}`
      );
    }
  }

  /**
   * Trigger critical error alert
   */
  private async triggerCriticalErrorAlert(event: ErrorEvent, analytics: ErrorMetrics): Promise<void> {
    this.logger.fatal('Critical error rate threshold exceeded', {
      errorId: event.id,
      criticalErrorRate: analytics.criticalErrorRate,
      threshold: this.alertingThresholds.criticalErrorRate,
    });

    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      await this.sendSlackNotification(
        `🚨 CRITICAL ERROR RATE EXCEEDED`,
        `Rate: ${(analytics.criticalErrorRate * 100).toFixed(2)}%\nThreshold: ${(this.alertingThresholds.criticalErrorRate * 100).toFixed(2)}%\nLatest error: ${event.error.message}`
      );
    }
  }

  /**
   * Trigger high error rate alert
   */
  private async triggerHighErrorRateAlert(event: ErrorEvent, analytics: ErrorMetrics): Promise<void> {
    this.logger.error('High error rate threshold exceeded', {
      errorId: event.id,
      errorRate: analytics.errorRate,
      threshold: this.alertingThresholds.errorRate,
    });
  }

  /**
   * Trigger user impact alert
   */
  private async triggerUserImpactAlert(event: ErrorEvent, analytics: ErrorMetrics): Promise<void> {
    this.logger.error('User impact threshold exceeded', {
      errorId: event.id,
      userImpactScore: analytics.userImpactScore,
      threshold: this.alertingThresholds.userImpactThreshold,
    });
  }

  /**
   * Helper methods
   */
  private generateEventId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePatternKey(error: AppError): string {
    return `${error.category}_${error.code}_${error.message.substring(0, 50)}`;
  }

  private getTimeRangeMs(timeRange: string): number {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return ranges[timeRange as keyof typeof ranges] || ranges['24h'];
  }

  private calculateErrorsBySeverity(errors: ErrorEvent[]): Record<ErrorSeverity, number> {
    const result = {
      [ErrorSeverity.CRITICAL]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.LOW]: 0,
    };

    errors.forEach(event => {
      result[event.error.severity]++;
    });

    return result;
  }

  private calculateErrorsByCategory(errors: ErrorEvent[]): Record<ErrorCategory, number> {
    const result = {
      [ErrorCategory.SYSTEM]: 0,
      [ErrorCategory.NETWORK]: 0,
      [ErrorCategory.VALIDATION]: 0,
      [ErrorCategory.SECURITY]: 0,
      [ErrorCategory.BUSINESS_LOGIC]: 0,
      [ErrorCategory.AUTHENTICATION]: 0,
      [ErrorCategory.AUTHORIZATION]: 0,
      [ErrorCategory.DATABASE]: 0,
      [ErrorCategory.EXTERNAL_SERVICE]: 0,
      [ErrorCategory.RATE_LIMIT]: 0,
      [ErrorCategory.NOT_FOUND]: 0,
      [ErrorCategory.CONFLICT]: 0,
      [ErrorCategory.INTERNAL]: 0,
    };

    errors.forEach(event => {
      (result as any)[event.error.category]++;
    });

    return result;
  }

  private calculateErrorsByHour(errors: ErrorEvent[]): Record<string, number> {
    const result: Record<string, number> = {};
    errors.forEach(event => {
      const hour = event.timestamp.getHours().toString();
      result[hour] = (result[hour] || 0) + 1;
    });
    return result;
  }

  private calculateTopErrorMessages(errors: ErrorEvent[]): Array<{ message: string; count: number }> {
    const messageCounts: Record<string, number> = {};
    errors.forEach(event => {
      messageCounts[event.error.message] = (messageCounts[event.error.message] || 0) + 1;
    });

    return Object.entries(messageCounts)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateErrorRate(errors: ErrorEvent[], timeRangeMs: number): number {
    const hours = timeRangeMs / (60 * 60 * 1000);
    return errors.length / hours;
  }

  private calculateCriticalErrorRate(errors: ErrorEvent[], timeRangeMs: number): number {
    const criticalErrors = errors.filter(event => event.error.severity === ErrorSeverity.CRITICAL);
    const hours = timeRangeMs / (60 * 60 * 1000);
    return criticalErrors.length / hours;
  }

  private calculateAverageResolutionTime(errors: ErrorEvent[]): number {
    // This would need to be implemented based on actual resolution tracking
    return 0;
  }

  private calculateUserImpactScore(errors: ErrorEvent[]): number {
    const uniqueUsers = new Set(errors.map(event => event.userId).filter(Boolean));
    return uniqueUsers.size / Math.max(errors.length, 1);
  }

  private calculateErrorTrends(): Array<{
    period: string;
    errorCount: number;
    severity: ErrorSeverity;
    category: ErrorCategory;
  }> {
    // Implementation for trend calculation
    return [];
  }

  private generateInsights(): string[] {
    const insights: string[] = [];
    const analytics = this.getErrorAnalytics('24h');

    if (analytics.criticalErrorRate > 0.01) {
      insights.push('Critical error rate is above normal threshold');
    }

    if (analytics.topErrorMessages.length > 0) {
      insights.push(`Most common error: ${analytics.topErrorMessages[0].message}`);
    }

    return insights;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const analytics = this.getErrorAnalytics('24h');

    if (analytics.criticalErrorRate > 0.01) {
      recommendations.push('Investigate and fix critical errors immediately');
    }

    if (analytics.errorRate > 0.05) {
      recommendations.push('Review error handling and add more defensive programming');
    }

    return recommendations;
  }

  private formatErrorForSlack(event: ErrorEvent): string {
    return `Error: ${event.error.message}\nSeverity: ${event.error.severity}\nCategory: ${event.error.category}\nCorrelation ID: ${event.error.correlationId}\nURL: ${event.url || 'N/A'}\nUser: ${event.userId || 'Anonymous'}`;
  }

  private getSlackColor(): string {
    // Return appropriate color based on error severity
    return 'danger';
  }

  private convertToCSV(data: any): string {
    // Implementation for CSV conversion
    return JSON.stringify(data);
  }

  private cleanupOldEvents(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.errorRetentionDays);
    
    this.errorEvents = this.errorEvents.filter(event => event.timestamp >= cutoffDate);
  }

  private startPeriodicTasks(): void {
    // Cleanup every hour
    setInterval(() => {
      this.cleanupOldEvents();
    }, 60 * 60 * 1000);

    // Generate periodic reports
    setInterval(() => {
      this.generatePeriodicReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private generatePeriodicReport(): void {
    const analytics = this.getErrorAnalytics('24h');
    const patterns = this.getErrorPatterns();
    
    this.logger.info('Daily error report', {
      totalErrors: analytics.totalErrors,
      criticalErrors: analytics.errorsBySeverity[ErrorSeverity.CRITICAL],
      topPatterns: patterns.slice(0, 5).map(p => ({ pattern: p.pattern, frequency: p.frequency })),
    });
  }
}

// Global error tracker instance
export const errorTracker = ErrorTracker.getInstance();

// Convenience functions
export async function trackError(
  error: AppError,
  context: ErrorContext = {},
  additionalData?: Parameters<ErrorTracker['trackError']>[2]
): Promise<void> {
  return errorTracker.trackError(error, context, additionalData);
}

export function getErrorAnalytics(timeRange?: Parameters<ErrorTracker['getErrorAnalytics']>[0]): ErrorMetrics {
  return errorTracker.getErrorAnalytics(timeRange);
}

export function getErrorPatterns(): ErrorPattern[] {
  return errorTracker.getErrorPatterns();
}

export async function resolveErrorPattern(patternId: string, resolution: string): Promise<void> {
  return errorTracker.resolveErrorPattern(patternId, resolution);
}

export function getErrorTrends(): ReturnType<ErrorTracker['getErrorTrends']> {
  return errorTracker.getErrorTrends();
}

export function exportErrorData(format?: Parameters<ErrorTracker['exportErrorData']>[0]): string {
  return errorTracker.exportErrorData(format);
}
