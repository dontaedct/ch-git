/**
 * @fileoverview HT-008.8.5: Comprehensive Logging System
 * @module lib/monitoring/comprehensive-logger
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.5 - Implement comprehensive logging system
 * Focus: Production-grade logging with correlation IDs, aggregation, and analysis
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production logging, data retention, compliance)
 */

import { Logger } from '@/lib/logger';
import { Observing } from '@/lib/observability';

// Comprehensive logging configuration
interface LoggingConfig {
  enableStructuredLogging: boolean;
  enableCorrelationIds: boolean;
  enableLogAggregation: boolean;
  enableLogAnalysis: boolean;
  enableLogRetention: boolean;
  enableLogArchival: boolean;
  enableLogCompression: boolean;
  enableLogEncryption: boolean;
  enableLogRotation: boolean;
  enableLogSampling: boolean;
  enableLogFiltering: boolean;
  enableLogMetrics: boolean;
  enableLogAlerting: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  maxLogSize: number; // bytes
  maxLogFiles: number;
  logRetentionDays: number;
  logArchivalDays: number;
  samplingRate: number;
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
  enableEmailNotifications: boolean;
  emailRecipients: string[];
}

const defaultConfig: LoggingConfig = {
  enableStructuredLogging: true,
  enableCorrelationIds: true,
  enableLogAggregation: true,
  enableLogAnalysis: true,
  enableLogRetention: true,
  enableLogArchival: true,
  enableLogCompression: true,
  enableLogEncryption: false,
  enableLogRotation: true,
  enableLogSampling: true,
  enableLogFiltering: true,
  enableLogMetrics: true,
  enableLogAlerting: true,
  logLevel: 'info',
  maxLogSize: 10 * 1024 * 1024, // 10MB
  maxLogFiles: 10,
  logRetentionDays: 30,
  logArchivalDays: 90,
  samplingRate: 1.0,
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_LOG_WEBHOOK_URL,
  enableEmailNotifications: false,
  emailRecipients: [],
};

// Log entry structure
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  component: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata: Record<string, any>;
  tags: string[];
  source: {
    file: string;
    line: number;
    function: string;
  };
  performance?: {
    duration?: number;
    memoryUsage?: number;
    cpuUsage?: number;
  };
  context: Record<string, any>;
}

// Log aggregation metrics
export interface LogMetrics {
  totalLogs: number;
  logsByLevel: Record<string, number>;
  logsByComponent: Record<string, number>;
  logsByHour: Record<string, number>;
  errorRate: number;
  averageLogSize: number;
  topErrorMessages: Array<{ message: string; count: number }>;
  logVolumeTrend: 'increasing' | 'stable' | 'decreasing';
  performanceImpact: number;
}

// Log analysis results
export interface LogAnalysis {
  anomalies: Array<{
    type: 'spike' | 'drop' | 'pattern' | 'error';
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    metrics: Record<string, any>;
  }>;
  patterns: Array<{
    pattern: string;
    frequency: number;
    firstSeen: Date;
    lastSeen: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }>;
  insights: string[];
  recommendations: string[];
  healthScore: number;
}

// Log retention policy
export interface LogRetentionPolicy {
  retentionDays: number;
  archivalDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  deletionPolicy: 'soft' | 'hard';
  backupEnabled: boolean;
  complianceRequirements: string[];
}

/**
 * Comprehensive Logging System
 * 
 * Provides production-grade logging with correlation IDs, aggregation,
 * analysis, retention policies, and automated alerting.
 */
export class ComprehensiveLogger {
  private static instance: ComprehensiveLogger | null = null;
  private config: LoggingConfig;
  private logger = Logger.create({ component: 'comprehensive-logger' });
  private logEntries: LogEntry[] = [];
  private logMetrics: LogMetrics;
  private retentionPolicies: Map<string, LogRetentionPolicy> = new Map();
  private logFilters: Map<string, (entry: LogEntry) => boolean> = new Map();
  private alertThresholds = {
    errorRate: 0.05, // 5%
    logVolumeSpike: 2.0, // 2x normal volume
    memoryUsage: 0.8, // 80% of available memory
    diskUsage: 0.9, // 90% of available disk space
  };

  private constructor(config: Partial<LoggingConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.logMetrics = this.initializeMetrics();
    this.setupRetentionPolicies();
    this.setupLogFilters();
    this.startPeriodicTasks();
  }

  static getInstance(config?: Partial<LoggingConfig>): ComprehensiveLogger {
    if (!ComprehensiveLogger.instance) {
      ComprehensiveLogger.instance = new ComprehensiveLogger(config);
    }
    return ComprehensiveLogger.instance;
  }

  /**
   * Log a message with comprehensive context
   */
  log(
    level: LogEntry['level'],
    message: string,
    metadata: Record<string, any> = {},
    context: {
      component?: string;
      operation?: string;
      userId?: string;
      sessionId?: string;
      requestId?: string;
      correlationId?: string;
      traceId?: string;
      spanId?: string;
      tags?: string[];
      performance?: LogEntry['performance'];
    } = {}
  ): void {
    try {
      // Apply sampling
      if (this.config.enableLogSampling && Math.random() > this.config.samplingRate) {
        return;
      }

      // Apply filters
      if (this.config.enableLogFiltering && !this.passesFilters(level, message, metadata)) {
        return;
      }

      const logEntry: LogEntry = {
        id: this.generateLogId(),
        timestamp: new Date(),
        level,
        message,
        correlationId: context.correlationId || this.generateCorrelationId(),
        traceId: context.traceId,
        spanId: context.spanId,
        component: context.component || 'unknown',
        operation: context.operation,
        userId: context.userId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        metadata: this.sanitizeMetadata(metadata),
        tags: context.tags || [],
        source: this.getSourceInfo(),
        performance: context.performance,
        context: this.buildContext(context),
      };

      // Store log entry
      this.logEntries.push(logEntry);

      // Update metrics
      this.updateMetrics(logEntry);

      // Apply retention policy
      if (this.config.enableLogRetention) {
        this.applyRetentionPolicy(logEntry);
      }

      // Log aggregation
      if (this.config.enableLogAggregation) {
        this.aggregateLogs(logEntry);
      }

      // Log analysis
      if (this.config.enableLogAnalysis) {
        this.analyzeLogs(logEntry);
      }

      // Check alerting thresholds
      if (this.config.enableLogAlerting) {
        this.checkAlertingThresholds(logEntry);
      }

      // Record business metric
      Observing.recordBusinessMetric('log_entry_created', 1, {
        level,
        component: logEntry.component,
        correlationId: logEntry.correlationId || 'unknown',
      });

      // Use underlying logger
      this.logToUnderlyingLogger(logEntry);

    } catch (error) {
      console.error('Failed to log message:', error);
    }
  }

  /**
   * Get log analytics
   */
  getLogAnalytics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): LogMetrics {
    const now = new Date();
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoffTime = new Date(now.getTime() - timeRangeMs);

    const recentLogs = this.logEntries.filter(log => log.timestamp >= cutoffTime);

    return this.calculateLogMetrics(recentLogs);
  }

  /**
   * Get log analysis
   */
  getLogAnalysis(): LogAnalysis {
    return this.performLogAnalysis();
  }

  /**
   * Search logs
   */
  searchLogs(query: {
    level?: LogEntry['level'];
    component?: string;
    userId?: string;
    sessionId?: string;
    correlationId?: string;
    message?: string;
    tags?: string[];
    timeRange?: { start: Date; end: Date };
    limit?: number;
  }): LogEntry[] {
    let results = this.logEntries;

    // Apply filters
    if (query.level) {
      results = results.filter(log => log.level === query.level);
    }
    if (query.component) {
      results = results.filter(log => log.component === query.component);
    }
    if (query.userId) {
      results = results.filter(log => log.userId === query.userId);
    }
    if (query.sessionId) {
      results = results.filter(log => log.sessionId === query.sessionId);
    }
    if (query.correlationId) {
      results = results.filter(log => log.correlationId === query.correlationId);
    }
    if (query.message) {
      results = results.filter(log => 
        log.message.toLowerCase().includes(query.message!.toLowerCase())
      );
    }
    if (query.tags && query.tags.length > 0) {
      results = results.filter(log => 
        query.tags!.some(tag => log.tags.includes(tag))
      );
    }
    if (query.timeRange) {
      results = results.filter(log => 
        log.timestamp >= query.timeRange!.start && 
        log.timestamp <= query.timeRange!.end
      );
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    return results;
  }

  /**
   * Export logs
   */
  exportLogs(format: 'json' | 'csv' | 'log' = 'json', filters?: {
    level?: LogEntry['level'];
    component?: string;
    timeRange?: { start: Date; end: Date };
  }): string {
    let logs = this.logEntries;

    // Apply filters
    if (filters?.level) {
      logs = logs.filter(log => log.level === filters.level);
    }
    if (filters?.component) {
      logs = logs.filter(log => log.component === filters.component);
    }
    if (filters?.timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= filters.timeRange!.start && 
        log.timestamp <= filters.timeRange!.end
      );
    }

    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);
      case 'csv':
        return this.convertToCSV(logs);
      case 'log':
        return this.convertToLogFormat(logs);
      default:
        return JSON.stringify(logs, null, 2);
    }
  }

  /**
   * Set log retention policy
   */
  setRetentionPolicy(
    component: string, 
    policy: LogRetentionPolicy
  ): void {
    this.retentionPolicies.set(component, policy);
    
    this.logger.info('Log retention policy set', {
      component,
      retentionDays: policy.retentionDays,
      archivalDays: policy.archivalDays,
    });
  }

  /**
   * Add log filter
   */
  addLogFilter(name: string, filter: (entry: LogEntry) => boolean): void {
    this.logFilters.set(name, filter);
    
    this.logger.info('Log filter added', {
      filterName: name,
      totalFilters: this.logFilters.size,
    });
  }

  /**
   * Remove log filter
   */
  removeLogFilter(name: string): void {
    this.logFilters.delete(name);
    
    this.logger.info('Log filter removed', {
      filterName: name,
      totalFilters: this.logFilters.size,
    });
  }

  /**
   * Get log statistics
   */
  getLogStatistics(): {
    totalLogs: number;
    logsByLevel: Record<string, number>;
    logsByComponent: Record<string, number>;
    averageLogSize: number;
    oldestLog: Date | null;
    newestLog: Date | null;
    retentionPolicies: number;
    activeFilters: number;
  } {
    const totalLogs = this.logEntries.length;
    const logsByLevel: Record<string, number> = {};
    const logsByComponent: Record<string, number> = {};
    let totalSize = 0;

    this.logEntries.forEach(log => {
      logsByLevel[log.level] = (logsByLevel[log.level] || 0) + 1;
      logsByComponent[log.component] = (logsByComponent[log.component] || 0) + 1;
      totalSize += JSON.stringify(log).length;
    });

    return {
      totalLogs,
      logsByLevel,
      logsByComponent,
      averageLogSize: totalLogs > 0 ? totalSize / totalLogs : 0,
      oldestLog: totalLogs > 0 ? this.logEntries[0].timestamp : null,
      newestLog: totalLogs > 0 ? this.logEntries[totalLogs - 1].timestamp : null,
      retentionPolicies: this.retentionPolicies.size,
      activeFilters: this.logFilters.size,
    };
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): LogMetrics {
    return {
      totalLogs: 0,
      logsByLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0,
      },
      logsByComponent: {},
      logsByHour: {},
      errorRate: 0,
      averageLogSize: 0,
      topErrorMessages: [],
      logVolumeTrend: 'stable',
      performanceImpact: 0,
    };
  }

  /**
   * Update metrics
   */
  private updateMetrics(logEntry: LogEntry): void {
    this.logMetrics.totalLogs++;
    this.logMetrics.logsByLevel[logEntry.level]++;
    this.logMetrics.logsByComponent[logEntry.component] = 
      (this.logMetrics.logsByComponent[logEntry.component] || 0) + 1;

    const hour = logEntry.timestamp.getHours().toString();
    this.logMetrics.logsByHour[hour] = (this.logMetrics.logsByHour[hour] || 0) + 1;

    // Calculate error rate
    const errorLogs = this.logEntries.filter(log => 
      log.level === 'error' || log.level === 'fatal'
    ).length;
    this.logMetrics.errorRate = errorLogs / Math.max(this.logEntries.length, 1);

    // Calculate average log size
    const totalSize = this.logEntries.reduce((sum, log) => 
      sum + JSON.stringify(log).length, 0
    );
    this.logMetrics.averageLogSize = totalSize / this.logEntries.length;
  }

  /**
   * Setup retention policies
   */
  private setupRetentionPolicies(): void {
    // Default retention policy
    const defaultPolicy: LogRetentionPolicy = {
      retentionDays: this.config.logRetentionDays,
      archivalDays: this.config.logArchivalDays,
      compressionEnabled: this.config.enableLogCompression,
      encryptionEnabled: this.config.enableLogEncryption,
      deletionPolicy: 'soft',
      backupEnabled: true,
      complianceRequirements: ['GDPR', 'SOX'],
    };

    this.retentionPolicies.set('default', defaultPolicy);
  }

  /**
   * Setup log filters
   */
  private setupLogFilters(): void {
    // Debug filter (only in development)
    this.addLogFilter('debug-only', (entry) => {
      if (process.env.NODE_ENV === 'production' && entry.level === 'debug') {
        return false;
      }
      return true;
    });

    // Sensitive data filter
    this.addLogFilter('sensitive-data', (entry) => {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'ssn', 'creditCard'];
      const hasSensitiveData = sensitiveFields.some(field => 
        JSON.stringify(entry.metadata).toLowerCase().includes(field)
      );
      return !hasSensitiveData;
    });

    // Performance filter
    this.addLogFilter('performance', (entry) => {
      return entry.performance === undefined || (entry.performance.duration !== undefined && entry.performance.duration < 1000);
    });
  }

  /**
   * Check if log passes filters
   */
  private passesFilters(
    level: LogEntry['level'],
    message: string,
    metadata: Record<string, any>
  ): boolean {
    const testEntry: LogEntry = {
      id: '',
      timestamp: new Date(),
      level,
      message,
      component: 'test',
      metadata,
      tags: [],
      source: { file: '', line: 0, function: '' },
      context: {},
    };

    for (const filter of this.logFilters.values()) {
      if (!filter(testEntry)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Apply retention policy
   */
  private applyRetentionPolicy(logEntry: LogEntry): void {
    const policy = this.retentionPolicies.get(logEntry.component) || 
                  this.retentionPolicies.get('default');
    
    if (!policy) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

    // Remove old logs
    this.logEntries = this.logEntries.filter(log => log.timestamp >= cutoffDate);
  }

  /**
   * Aggregate logs
   */
  private aggregateLogs(logEntry: LogEntry): void {
    // This could integrate with log aggregation services like ELK, Splunk, etc.
    // For now, we'll just track aggregation metrics
    
    Observing.recordBusinessMetric('log_aggregated', 1, {
      level: logEntry.level,
      component: logEntry.component,
      correlationId: logEntry.correlationId || 'unknown',
    });
  }

  /**
   * Analyze logs
   */
  private analyzeLogs(logEntry: LogEntry): void {
    // Detect anomalies
    this.detectAnomalies(logEntry);
    
    // Detect patterns
    this.detectPatterns(logEntry);
    
    // Update health score
    this.updateHealthScore();
  }

  /**
   * Detect anomalies
   */
  private detectAnomalies(logEntry: LogEntry): void {
    // Error rate spike detection
    if (logEntry.level === 'error' || logEntry.level === 'fatal') {
      const recentErrors = this.logEntries
        .filter(log => 
          (log.level === 'error' || log.level === 'fatal') &&
          log.timestamp >= new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        ).length;

      if (recentErrors > 10) { // More than 10 errors in 5 minutes
        this.triggerAnomalyAlert('error_spike', {
          errorCount: recentErrors,
          timeWindow: '5m',
          severity: 'high',
        });
      }
    }

    // Log volume spike detection
    const recentLogs = this.logEntries.filter(log => 
      log.timestamp >= new Date(Date.now() - 1 * 60 * 1000) // Last minute
    ).length;

    const averageLogsPerMinute = this.logMetrics.totalLogs / 
      Math.max((Date.now() - this.logEntries[0]?.timestamp.getTime()) / (1000 * 60), 1);

    if (recentLogs > averageLogsPerMinute * this.alertThresholds.logVolumeSpike) {
      this.triggerAnomalyAlert('volume_spike', {
        currentVolume: recentLogs,
        averageVolume: averageLogsPerMinute,
        severity: 'medium',
      });
    }
  }

  /**
   * Detect patterns
   */
  private detectPatterns(logEntry: LogEntry): void {
    // This would implement pattern detection algorithms
    // For now, we'll track basic patterns
    
    const messagePattern = logEntry.message.substring(0, 50);
    const patternCount = this.logEntries.filter(log => 
      log.message.substring(0, 50) === messagePattern
    ).length;

    if (patternCount > 100) { // Same pattern appears more than 100 times
      this.logger.warn('Log pattern detected', {
        pattern: messagePattern,
        count: patternCount,
        component: logEntry.component,
      });
    }
  }

  /**
   * Update health score
   */
  private updateHealthScore(): void {
    let score = 100;

    // Deduct points for high error rate
    if (this.logMetrics.errorRate > 0.1) {
      score -= 30;
    } else if (this.logMetrics.errorRate > 0.05) {
      score -= 15;
    }

    // Deduct points for high log volume
    const logVolumeTrend = this.calculateLogVolumeTrend();
    if (logVolumeTrend === 'increasing') {
      score -= 10;
    }

    // Deduct points for performance impact
    if (this.logMetrics.performanceImpact > 0.5) {
      score -= 20;
    }

    this.logMetrics.performanceImpact = Math.max(0, score / 100);
  }

  /**
   * Calculate log volume trend
   */
  private calculateLogVolumeTrend(): 'increasing' | 'stable' | 'decreasing' {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const recentLogs = this.logEntries.filter(log => log.timestamp >= oneHourAgo).length;
    const olderLogs = this.logEntries.filter(log => 
      log.timestamp >= twoHoursAgo && log.timestamp < oneHourAgo
    ).length;

    if (recentLogs > olderLogs * 1.2) return 'increasing';
    if (recentLogs < olderLogs * 0.8) return 'decreasing';
    return 'stable';
  }

  /**
   * Check alerting thresholds
   */
  private checkAlertingThresholds(logEntry: LogEntry): void {
    // Error rate threshold
    if (this.logMetrics.errorRate > this.alertThresholds.errorRate) {
      this.triggerLogAlert('high_error_rate', {
        errorRate: this.logMetrics.errorRate,
        threshold: this.alertThresholds.errorRate,
        severity: 'high',
      });
    }

    // Memory usage threshold
    if (logEntry.performance &&
        logEntry.performance.memoryUsage !== undefined &&
        logEntry.performance.memoryUsage > this.alertThresholds.memoryUsage) {
      this.triggerLogAlert('high_memory_usage', {
        memoryUsage: logEntry.performance.memoryUsage,
        threshold: this.alertThresholds.memoryUsage,
        severity: 'medium',
      });
    }
  }

  /**
   * Trigger anomaly alert
   */
  private triggerAnomalyAlert(type: string, data: any): void {
    this.logger.warn('Log anomaly detected', {
      anomalyType: type,
      ...data,
    });

    // Send notifications
    this.sendLogAlert('anomaly', type, data);
  }

  /**
   * Trigger log alert
   */
  private triggerLogAlert(type: string, data: any): void {
    this.logger.error('Log alert triggered', {
      alertType: type,
      ...data,
    });

    // Send notifications
    this.sendLogAlert('threshold', type, data);
  }

  /**
   * Send log alert
   */
  private async sendLogAlert(category: string, type: string, data: any): Promise<void> {
    // Send to webhook endpoints
    if (this.config.enableWebhookNotifications && this.config.webhookUrls.length > 0) {
      await Promise.all(
        this.config.webhookUrls.map(url => this.sendWebhookNotification(url, category, type, data))
      );
    }

    // Send to Slack
    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      await this.sendSlackNotification(category, type, data);
    }

    // Send email notifications for critical alerts
    if (this.config.enableEmailNotifications && data.severity === 'critical') {
      await this.sendEmailNotification(category, type, data);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhookNotification(
    url: string, 
    category: string, 
    type: string, 
    data: any
  ): Promise<void> {
    try {
      const payload = {
        event: 'log_alert',
        category,
        type,
        data,
        timestamp: new Date().toISOString(),
        metrics: this.logMetrics,
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Log-Alert': 'true',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send webhook notification:', error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(category: string, type: string, data: any): Promise<void> {
    if (!this.config.slackWebhookUrl) return;

    try {
      const color = this.getSlackColor(data.severity);
      const emoji = this.getSlackEmoji(data.severity);

      const payload = {
        text: `${emoji} Log Alert: ${type}`,
        attachments: [{
          color,
          fields: [
            { title: 'Category', value: category, short: true },
            { title: 'Type', value: type, short: true },
            { title: 'Severity', value: data.severity, short: true },
            { title: 'Details', value: JSON.stringify(data, null, 2), short: false },
          ],
          footer: 'Comprehensive Logger',
          ts: Math.floor(Date.now() / 1000),
        }],
      };

      await fetch(this.config.slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(category: string, type: string, data: any): Promise<void> {
    // Implementation would depend on email service
    this.logger.info('Email notification would be sent', {
      category,
      type,
      severity: data.severity,
      recipients: this.config.emailRecipients,
    });
  }

  /**
   * Log to underlying logger
   */
  private logToUnderlyingLogger(logEntry: LogEntry): void {
    const meta = {
      correlationId: logEntry.correlationId,
      traceId: logEntry.traceId,
      spanId: logEntry.spanId,
      component: logEntry.component,
      operation: logEntry.operation,
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
      requestId: logEntry.requestId,
      tags: logEntry.tags,
      source: logEntry.source,
      performance: logEntry.performance,
      ...logEntry.metadata,
    };

    switch (logEntry.level) {
      case 'debug':
        this.logger.debug(logEntry.message, meta);
        break;
      case 'info':
        this.logger.info(logEntry.message, meta);
        break;
      case 'warn':
        this.logger.warn(logEntry.message, meta);
        break;
      case 'error':
        this.logger.error(logEntry.message, meta);
        break;
      case 'fatal':
        this.logger.fatal(logEntry.message, meta);
        break;
    }
  }

  /**
   * Perform log analysis
   */
  private performLogAnalysis(): LogAnalysis {
    const anomalies: LogAnalysis['anomalies'] = [];
    const patterns: LogAnalysis['patterns'] = [];
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Analyze error patterns
    const errorLogs = this.logEntries.filter(log => 
      log.level === 'error' || log.level === 'fatal'
    );

    if (errorLogs.length > 0) {
      const errorMessages: Record<string, number> = {};
      errorLogs.forEach(log => {
        errorMessages[log.message] = (errorMessages[log.message] || 0) + 1;
      });

      Object.entries(errorMessages).forEach(([message, count]) => {
        if (count > 10) {
          patterns.push({
            pattern: message,
            frequency: count,
            firstSeen: errorLogs.find(log => log.message === message)?.timestamp || new Date(),
            lastSeen: errorLogs.filter(log => log.message === message).pop()?.timestamp || new Date(),
            severity: count > 50 ? 'critical' : count > 20 ? 'high' : 'medium',
          });
        }
      });
    }

    // Generate insights
    if (this.logMetrics.errorRate > 0.05) {
      insights.push('Error rate is above normal threshold');
    }

    if (this.logMetrics.logVolumeTrend === 'increasing') {
      insights.push('Log volume is increasing significantly');
    }

    // Generate recommendations
    if (this.logMetrics.errorRate > 0.05) {
      recommendations.push('Investigate and fix recurring errors');
    }

    if (patterns.length > 0) {
      recommendations.push('Address error patterns to improve system stability');
    }

    const healthScore = Math.max(0, 100 - (this.logMetrics.errorRate * 200));

    return {
      anomalies,
      patterns,
      insights,
      recommendations,
      healthScore,
    };
  }

  /**
   * Calculate log metrics
   */
  private calculateLogMetrics(logs: LogEntry[]): LogMetrics {
    const metrics: LogMetrics = {
      totalLogs: logs.length,
      logsByLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0,
      },
      logsByComponent: {},
      logsByHour: {},
      errorRate: 0,
      averageLogSize: 0,
      topErrorMessages: [],
      logVolumeTrend: 'stable',
      performanceImpact: 0,
    };

    logs.forEach(log => {
      metrics.logsByLevel[log.level]++;
      metrics.logsByComponent[log.component] = 
        (metrics.logsByComponent[log.component] || 0) + 1;

      const hour = log.timestamp.getHours().toString();
      metrics.logsByHour[hour] = (metrics.logsByHour[hour] || 0) + 1;
    });

    // Calculate error rate
    const errorLogs = logs.filter(log => 
      log.level === 'error' || log.level === 'fatal'
    ).length;
    metrics.errorRate = errorLogs / Math.max(logs.length, 1);

    // Calculate average log size
    const totalSize = logs.reduce((sum, log) => 
      sum + JSON.stringify(log).length, 0
    );
    metrics.averageLogSize = totalSize / Math.max(logs.length, 1);

    // Top error messages
    const errorMessages: Record<string, number> = {};
    logs.filter(log => log.level === 'error' || log.level === 'fatal')
      .forEach(log => {
        errorMessages[log.message] = (errorMessages[log.message] || 0) + 1;
      });

    metrics.topErrorMessages = Object.entries(errorMessages)
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Helper methods
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSourceInfo(): LogEntry['source'] {
    // This would use stack trace analysis to get actual source info
    return {
      file: 'unknown',
      line: 0,
      function: 'unknown',
    };
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
    const sanitized = { ...metadata };
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'session'];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private buildContext(context: any): Record<string, any> {
    return {
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version,
      hostname: typeof process !== 'undefined' ? process.env.HOSTNAME : 'unknown',
      ...context,
    };
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

  private convertToCSV(logs: LogEntry[]): string {
    if (logs.length === 0) return '';

    const headers = [
      'id', 'timestamp', 'level', 'message', 'correlationId', 'component',
      'userId', 'sessionId', 'tags', 'source.file', 'source.line'
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.level,
      log.message.replace(/"/g, '""'),
      log.correlationId || '',
      log.component,
      log.userId || '',
      log.sessionId || '',
      log.tags.join(';'),
      log.source.file,
      log.source.line.toString(),
    ]);

    return [headers.join(','), ...rows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    )].join('\n');
  }

  private convertToLogFormat(logs: LogEntry[]): string {
    return logs.map(log => 
      `${log.timestamp.toISOString()} [${log.level.toUpperCase()}] ${log.component}: ${log.message}`
    ).join('\n');
  }

  private getSlackColor(severity: string): string {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'good';
      case 'low': return '#36a64f';
      default: return 'good';
    }
  }

  private getSlackEmoji(severity: string): string {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📊';
      case 'low': return 'ℹ️';
      default: return '📊';
    }
  }

  private startPeriodicTasks(): void {
    // Cleanup old logs
    setInterval(() => {
      this.cleanupOldLogs();
    }, 60 * 60 * 1000); // Hourly

    // Generate periodic reports
    setInterval(() => {
      this.generatePeriodicReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  private cleanupOldLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.logRetentionDays);
    
    this.logEntries = this.logEntries.filter(log => log.timestamp >= cutoffDate);
  }

  private generatePeriodicReport(): void {
    const analytics = this.getLogAnalytics('24h');
    const analysis = this.getLogAnalysis();
    
    this.logger.info('Daily log report', {
      totalLogs: analytics.totalLogs,
      errorRate: analytics.errorRate,
      healthScore: analysis.healthScore,
      patterns: analysis.patterns.length,
      anomalies: analysis.anomalies.length,
    });
  }
}

// Global comprehensive logger instance
export const comprehensiveLogger = ComprehensiveLogger.getInstance();

// Convenience functions
export function logComprehensive(
  level: LogEntry['level'],
  message: string,
  metadata?: Record<string, any>,
  context?: Parameters<ComprehensiveLogger['log']>[3]
): void {
  comprehensiveLogger.log(level, message, metadata, context);
}

export function getLogAnalytics(
  timeRange?: Parameters<ComprehensiveLogger['getLogAnalytics']>[0]
): LogMetrics {
  return comprehensiveLogger.getLogAnalytics(timeRange);
}

export function getLogAnalysis(): LogAnalysis {
  return comprehensiveLogger.getLogAnalysis();
}

export function searchLogs(
  query: Parameters<ComprehensiveLogger['searchLogs']>[0]
): LogEntry[] {
  return comprehensiveLogger.searchLogs(query);
}

export function exportLogs(
  format?: Parameters<ComprehensiveLogger['exportLogs']>[0],
  filters?: Parameters<ComprehensiveLogger['exportLogs']>[1]
): string {
  return comprehensiveLogger.exportLogs(format, filters);
}

export function setLogRetentionPolicy(
  component: string,
  policy: LogRetentionPolicy
): void {
  comprehensiveLogger.setRetentionPolicy(component, policy);
}

export function addLogFilter(
  name: string,
  filter: (entry: LogEntry) => boolean
): void {
  comprehensiveLogger.addLogFilter(name, filter);
}

export function getLogStatistics(): ReturnType<ComprehensiveLogger['getLogStatistics']> {
  return comprehensiveLogger.getLogStatistics();
}
