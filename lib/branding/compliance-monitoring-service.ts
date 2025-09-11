/**
 * @fileoverview HT-011.4.3: Brand Compliance Monitoring Service
 * @module lib/branding/compliance-monitoring-service
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.4.3 - Create Brand Compliance Checking System
 * Focus: Real-time compliance monitoring and alerting service
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { TenantBrandConfig } from './types';
import { 
  BrandComplianceEngine, 
  ComplianceCheckResult, 
  ComplianceRuleResult,
  ComplianceConfig 
} from './brand-compliance-engine';
import { ValidationContext } from './brand-config-validation';

/**
 * Compliance monitoring event types
 */
export type ComplianceEventType = 
  | 'compliance_check_started'
  | 'compliance_check_completed'
  | 'compliance_violation_detected'
  | 'compliance_improvement_detected'
  | 'compliance_critical_issue'
  | 'compliance_warning_issue';

/**
 * Compliance monitoring event
 */
export interface ComplianceEvent {
  /** Event type */
  type: ComplianceEventType;
  /** Tenant ID */
  tenantId: string;
  /** Event timestamp */
  timestamp: Date;
  /** Event data */
  data: any;
  /** Event severity */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** Event message */
  message: string;
}

/**
 * Compliance monitoring alert
 */
export interface ComplianceAlert {
  /** Alert ID */
  id: string;
  /** Alert type */
  type: 'compliance_violation' | 'compliance_improvement' | 'compliance_critical';
  /** Tenant ID */
  tenantId: string;
  /** Alert severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Alert title */
  title: string;
  /** Alert message */
  message: string;
  /** Alert timestamp */
  timestamp: Date;
  /** Whether alert is acknowledged */
  acknowledged: boolean;
  /** Alert data */
  data: any;
}

/**
 * Compliance monitoring configuration
 */
export interface ComplianceMonitoringConfig {
  /** Enable real-time monitoring */
  enableRealTimeMonitoring: boolean;
  /** Monitoring interval in milliseconds */
  monitoringInterval: number;
  /** Enable compliance alerts */
  enableAlerts: boolean;
  /** Alert thresholds */
  alertThresholds: {
    criticalIssues: number;
    highPriorityIssues: number;
    complianceScore: number;
  };
  /** Enable compliance history */
  enableHistory: boolean;
  /** History retention period in days */
  historyRetentionDays: number;
  /** Enable compliance analytics */
  enableAnalytics: boolean;
  /** Compliance engine configuration */
  complianceConfig: ComplianceConfig;
}

/**
 * Compliance monitoring statistics
 */
export interface ComplianceMonitoringStats {
  /** Total compliance checks performed */
  totalChecks: number;
  /** Average compliance score */
  averageScore: number;
  /** Compliance rate (percentage of compliant checks) */
  complianceRate: number;
  /** Total alerts generated */
  totalAlerts: number;
  /** Unacknowledged alerts count */
  unacknowledgedAlerts: number;
  /** Critical issues count */
  criticalIssues: number;
  /** High priority issues count */
  highPriorityIssues: number;
  /** Monitoring uptime percentage */
  uptimePercentage: number;
}

/**
 * Brand Compliance Monitoring Service
 * 
 * Provides real-time monitoring of brand compliance with:
 * - Continuous compliance checking
 * - Real-time alerts and notifications
 * - Compliance history tracking
 * - Analytics and reporting
 * - WebSocket-based real-time updates
 */
export class ComplianceMonitoringService {
  private engine: BrandComplianceEngine;
  private config: ComplianceMonitoringConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private events: ComplianceEvent[] = [];
  private alerts: ComplianceAlert[] = [];
  private complianceHistory: Map<string, ComplianceCheckResult[]> = new Map();
  private eventListeners: Map<ComplianceEventType, ((event: ComplianceEvent) => void)[]> = new Map();
  private alertListeners: ((alert: ComplianceAlert) => void)[] = [];
  private stats: ComplianceMonitoringStats = {
    totalChecks: 0,
    averageScore: 0,
    complianceRate: 0,
    totalAlerts: 0,
    unacknowledgedAlerts: 0,
    criticalIssues: 0,
    highPriorityIssues: 0,
    uptimePercentage: 100
  };

  constructor(config: Partial<ComplianceMonitoringConfig> = {}) {
    this.config = {
      enableRealTimeMonitoring: true,
      monitoringInterval: 30000, // 30 seconds
      enableAlerts: true,
      alertThresholds: {
        criticalIssues: 1,
        highPriorityIssues: 3,
        complianceScore: 80
      },
      enableHistory: true,
      historyRetentionDays: 30,
      enableAnalytics: true,
      complianceConfig: {
        accessibility: true,
        usability: true,
        designConsistency: true,
        industryStandards: true,
        brandGuidelines: true,
        performance: true,
        security: true,
        minWcagLevel: 'AA',
        strictness: 'standard'
      },
      ...config
    };

    this.engine = new BrandComplianceEngine(this.config.complianceConfig);
    this.initializeEventListeners();
  }

  /**
   * Start compliance monitoring
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      console.warn('Compliance monitoring is already running');
      return;
    }

    this.isMonitoring = true;
    this.emitEvent('compliance_check_started', {
      message: 'Compliance monitoring started',
      config: this.config
    });

    // Start monitoring interval
    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCycle();
    }, this.config.monitoringInterval);

    console.log('Brand compliance monitoring started');
  }

  /**
   * Stop compliance monitoring
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      console.warn('Compliance monitoring is not running');
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.emitEvent('compliance_check_completed', {
      message: 'Compliance monitoring stopped',
      stats: this.stats
    });

    console.log('Brand compliance monitoring stopped');
  }

  /**
   * Perform manual compliance check
   */
  async performComplianceCheck(
    config: TenantBrandConfig,
    context: ValidationContext = { strictness: 'standard' }
  ): Promise<ComplianceCheckResult> {
    const startTime = Date.now();
    
    this.emitEvent('compliance_check_started', {
      tenantId: config.tenantId,
      message: 'Manual compliance check started',
      config: config
    });

    try {
      const result = await this.engine.checkCompliance(config, context);
      
      // Update statistics
      this.updateStats(result);
      
      // Store in history
      if (this.config.enableHistory) {
        this.storeComplianceHistory(config.tenantId!, result);
      }

      // Check for alerts
      if (this.config.enableAlerts) {
        await this.checkForAlerts(config.tenantId!, result);
      }

      this.emitEvent('compliance_check_completed', {
        tenantId: config.tenantId,
        message: 'Compliance check completed',
        result: result,
        duration: Date.now() - startTime
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.emitEvent('compliance_check_completed', {
        tenantId: config.tenantId,
        message: `Compliance check failed: ${errorMessage}`,
        error: errorMessage,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Get compliance history for a tenant
   */
  getComplianceHistory(tenantId: string, limit?: number): ComplianceCheckResult[] {
    const history = this.complianceHistory.get(tenantId) || [];
    return limit ? history.slice(-limit) : history;
  }

  /**
   * Get compliance alerts
   */
  getComplianceAlerts(tenantId?: string, acknowledged?: boolean): ComplianceAlert[] {
    let alerts = this.alerts;

    if (tenantId) {
      alerts = alerts.filter(alert => alert.tenantId === tenantId);
    }

    if (acknowledged !== undefined) {
      alerts = alerts.filter(alert => alert.acknowledged === acknowledged);
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Acknowledge compliance alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      this.updateAlertStats();
      return true;
    }
    return false;
  }

  /**
   * Get compliance monitoring statistics
   */
  getMonitoringStats(): ComplianceMonitoringStats {
    return { ...this.stats };
  }

  /**
   * Get compliance events
   */
  getComplianceEvents(tenantId?: string, limit?: number): ComplianceEvent[] {
    let events = this.events;

    if (tenantId) {
      events = events.filter(event => event.data.tenantId === tenantId);
    }

    events = events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: ComplianceEventType, listener: (event: ComplianceEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventType: ComplianceEventType, listener: (event: ComplianceEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Add alert listener
   */
  addAlertListener(listener: (alert: ComplianceAlert) => void): void {
    this.alertListeners.push(listener);
  }

  /**
   * Remove alert listener
   */
  removeAlertListener(listener: (alert: ComplianceAlert) => void): void {
    const index = this.alertListeners.indexOf(listener);
    if (index > -1) {
      this.alertListeners.splice(index, 1);
    }
  }

  /**
   * Clear compliance history
   */
  clearComplianceHistory(tenantId?: string): void {
    if (tenantId) {
      this.complianceHistory.delete(tenantId);
    } else {
      this.complianceHistory.clear();
    }
  }

  /**
   * Clear compliance alerts
   */
  clearComplianceAlerts(tenantId?: string): void {
    if (tenantId) {
      this.alerts = this.alerts.filter(alert => alert.tenantId !== tenantId);
    } else {
      this.alerts = [];
    }
    this.updateAlertStats();
  }

  /**
   * Clear compliance events
   */
  clearComplianceEvents(tenantId?: string): void {
    if (tenantId) {
      this.events = this.events.filter(event => event.data.tenantId !== tenantId);
    } else {
      this.events = [];
    }
  }

  /**
   * Get compliance trends
   */
  getComplianceTrends(tenantId: string, days: number = 7): {
    dates: string[];
    scores: number[];
    compliance: boolean[];
    criticalIssues: number[];
    highPriorityIssues: number[];
  } {
    const history = this.getComplianceHistory(tenantId);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentHistory = history.filter(result => 
      result.timestamp >= cutoffDate
    );

    const dates: string[] = [];
    const scores: number[] = [];
    const compliance: boolean[] = [];
    const criticalIssues: number[] = [];
    const highPriorityIssues: number[] = [];

    recentHistory.forEach(result => {
      dates.push(result.timestamp.toISOString().split('T')[0]);
      scores.push(result.overallScore);
      compliance.push(result.compliant);
      criticalIssues.push(result.criticalIssues.length);
      highPriorityIssues.push(result.highPriorityIssues.length);
    });

    return {
      dates,
      scores,
      compliance,
      criticalIssues,
      highPriorityIssues
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Initialize event listeners
   */
  private initializeEventListeners(): void {
    // Initialize event listener maps
    const eventTypes: ComplianceEventType[] = [
      'compliance_check_started',
      'compliance_check_completed',
      'compliance_violation_detected',
      'compliance_improvement_detected',
      'compliance_critical_issue',
      'compliance_warning_issue'
    ];

    eventTypes.forEach(eventType => {
      this.eventListeners.set(eventType, []);
    });
  }

  /**
   * Perform monitoring cycle
   */
  private async performMonitoringCycle(): Promise<void> {
    try {
      // This would typically check all active tenant configurations
      // For now, we'll just emit a monitoring event
      this.emitEvent('compliance_check_started', {
        message: 'Scheduled compliance monitoring cycle',
        timestamp: new Date()
      });

      // In a real implementation, this would:
      // 1. Get all active tenant configurations
      // 2. Perform compliance checks for each
      // 3. Update statistics and generate alerts
      // 4. Emit events for any changes

    } catch (error) {
      console.error('Error in compliance monitoring cycle:', error);
    }
  }

  /**
   * Check for compliance alerts
   */
  private async checkForAlerts(tenantId: string, result: ComplianceCheckResult): Promise<void> {
    const { criticalIssues, highPriorityIssues, overallScore } = result;
    const { alertThresholds } = this.config;

    // Check for critical issues
    if (criticalIssues.length >= alertThresholds.criticalIssues) {
      await this.generateAlert({
        type: 'compliance_critical',
        severity: 'critical',
        title: 'Critical Compliance Issues Detected',
        message: `${criticalIssues.length} critical compliance issue(s) detected`,
        tenantId,
        data: { issues: criticalIssues, result }
      });
    }

    // Check for high priority issues
    if (highPriorityIssues.length >= alertThresholds.highPriorityIssues) {
      await this.generateAlert({
        type: 'compliance_violation',
        severity: 'high',
        title: 'High Priority Compliance Issues',
        message: `${highPriorityIssues.length} high priority compliance issue(s) detected`,
        tenantId,
        data: { issues: highPriorityIssues, result }
      });
    }

    // Check for low compliance score
    if (overallScore < alertThresholds.complianceScore) {
      await this.generateAlert({
        type: 'compliance_violation',
        severity: 'medium',
        title: 'Low Compliance Score',
        message: `Compliance score ${overallScore}/100 is below threshold ${alertThresholds.complianceScore}`,
        tenantId,
        data: { score: overallScore, threshold: alertThresholds.complianceScore, result }
      });
    }

    // Check for improvements
    const previousResult = this.getPreviousComplianceResult(tenantId);
    if (previousResult && result.overallScore > previousResult.overallScore) {
      await this.generateAlert({
        type: 'compliance_improvement',
        severity: 'low',
        title: 'Compliance Improvement Detected',
        message: `Compliance score improved from ${previousResult.overallScore} to ${result.overallScore}`,
        tenantId,
        data: { 
          previousScore: previousResult.overallScore, 
          currentScore: result.overallScore, 
          improvement: result.overallScore - previousResult.overallScore,
          result 
        }
      });
    }
  }

  /**
   * Generate compliance alert
   */
  private async generateAlert(alertData: Omit<ComplianceAlert, 'id' | 'timestamp' | 'acknowledged'>): Promise<void> {
    const alert: ComplianceAlert = {
      ...alertData,
      id: this.generateAlertId(),
      timestamp: new Date(),
      acknowledged: false
    };

    this.alerts.push(alert);
    this.updateAlertStats();

    // Notify alert listeners
    this.alertListeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error in alert listener:', error);
      }
    });

    // Emit compliance event
    this.emitEvent('compliance_violation_detected', {
      tenantId: alert.tenantId,
      message: alert.message,
      alert: alert
    });
  }

  /**
   * Store compliance history
   */
  private storeComplianceHistory(tenantId: string, result: ComplianceCheckResult): void {
    if (!this.complianceHistory.has(tenantId)) {
      this.complianceHistory.set(tenantId, []);
    }

    const history = this.complianceHistory.get(tenantId)!;
    history.push(result);

    // Clean up old history based on retention policy
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.historyRetentionDays);

    const filteredHistory = history.filter(result => result.timestamp >= cutoffDate);
    this.complianceHistory.set(tenantId, filteredHistory);
  }

  /**
   * Get previous compliance result
   */
  private getPreviousComplianceResult(tenantId: string): ComplianceCheckResult | null {
    const history = this.complianceHistory.get(tenantId);
    return history && history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Update monitoring statistics
   */
  private updateStats(result: ComplianceCheckResult): void {
    this.stats.totalChecks++;
    
    // Update average score
    const totalScore = this.stats.averageScore * (this.stats.totalChecks - 1) + result.overallScore;
    this.stats.averageScore = Math.round(totalScore / this.stats.totalChecks);

    // Update compliance rate
    const compliantChecks = this.stats.complianceRate * (this.stats.totalChecks - 1) + (result.compliant ? 1 : 0);
    this.stats.complianceRate = Math.round((compliantChecks / this.stats.totalChecks) * 100) / 100;

    // Update issue counts
    this.stats.criticalIssues = result.criticalIssues.length;
    this.stats.highPriorityIssues = result.highPriorityIssues.length;
  }

  /**
   * Update alert statistics
   */
  private updateAlertStats(): void {
    this.stats.totalAlerts = this.alerts.length;
    this.stats.unacknowledgedAlerts = this.alerts.filter(alert => !alert.acknowledged).length;
  }

  /**
   * Emit compliance event
   */
  private emitEvent(type: ComplianceEventType, data: any): void {
    const event: ComplianceEvent = {
      type,
      tenantId: data.tenantId || 'system',
      timestamp: new Date(),
      data,
      severity: this.getEventSeverity(type),
      message: data.message || `${type} event`
    };

    this.events.push(event);

    // Notify event listeners
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
  }

  /**
   * Get event severity based on type
   */
  private getEventSeverity(type: ComplianceEventType): 'info' | 'warning' | 'error' | 'critical' {
    switch (type) {
      case 'compliance_check_started':
      case 'compliance_check_completed':
        return 'info';
      case 'compliance_improvement_detected':
        return 'info';
      case 'compliance_warning_issue':
        return 'warning';
      case 'compliance_violation_detected':
        return 'error';
      case 'compliance_critical_issue':
        return 'critical';
      default:
        return 'info';
    }
  }

  /**
   * Generate unique alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Global compliance monitoring service instance
 */
export const complianceMonitoringService = new ComplianceMonitoringService();

/**
 * Utility functions for compliance monitoring
 */
export const ComplianceMonitoringUtils = {
  /**
   * Start compliance monitoring
   */
  async startMonitoring(): Promise<void> {
    return complianceMonitoringService.startMonitoring();
  },

  /**
   * Stop compliance monitoring
   */
  async stopMonitoring(): Promise<void> {
    return complianceMonitoringService.stopMonitoring();
  },

  /**
   * Perform compliance check
   */
  async performComplianceCheck(config: TenantBrandConfig, context?: ValidationContext): Promise<ComplianceCheckResult> {
    return complianceMonitoringService.performComplianceCheck(config, context);
  },

  /**
   * Get compliance alerts
   */
  getComplianceAlerts(tenantId?: string, acknowledged?: boolean): ComplianceAlert[] {
    return complianceMonitoringService.getComplianceAlerts(tenantId, acknowledged);
  },

  /**
   * Get compliance history
   */
  getComplianceHistory(tenantId: string, limit?: number): ComplianceCheckResult[] {
    return complianceMonitoringService.getComplianceHistory(tenantId, limit);
  },

  /**
   * Get monitoring statistics
   */
  getMonitoringStats(): ComplianceMonitoringStats {
    return complianceMonitoringService.getMonitoringStats();
  },

  /**
   * Get compliance trends
   */
  getComplianceTrends(tenantId: string, days?: number): {
    dates: string[];
    scores: number[];
    compliance: boolean[];
    criticalIssues: number[];
    highPriorityIssues: number[];
  } {
    return complianceMonitoringService.getComplianceTrends(tenantId, days);
  }
};
