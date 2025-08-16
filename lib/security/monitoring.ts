/**
 * Security Monitoring Dashboard
 * 
 * Provides real-time monitoring of security events, system health,
 * and threat detection capabilities.
 */

import { auditLogger } from '@/lib/audit-logger';

export interface SecurityMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsBySeverity: Record<string, number>;
  eventsByOutcome: Record<string, number>;
  recentViolations: number;
  rateLimitExceeded: number;
  sessionExpirations: number;
  resourceAccessAttempts: number;
  unauthorizedAccessAttempts: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

export interface ThreatIndicator {
  id: string;
  type: 'brute_force' | 'privilege_escalation' | 'data_exfiltration' | 'session_hijacking';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  correlationId?: string;
}

export interface SecurityAlert {
  id: string;
  type: 'security_violation' | 'rate_limit' | 'session_expiry' | 'resource_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  details: Record<string, unknown>;
}

export class SecurityMonitor {
  private alerts: SecurityAlert[] = [];
  private threatIndicators: ThreatIndicator[] = [];
  private metrics: SecurityMetrics;
  private alertThresholds = {
    rateLimitExceeded: 10, // Alert if more than 10 rate limit violations per hour
    unauthorizedAccess: 5, // Alert if more than 5 unauthorized access attempts per hour
    sessionExpirations: 20, // Alert if more than 20 session expirations per hour
  };

  constructor() {
    this.metrics = this.initializeMetrics();
    this.startMonitoring();
  }

  private initializeMetrics(): SecurityMetrics {
    return {
      totalEvents: 0,
      eventsByType: {},
      eventsBySeverity: {},
      eventsByOutcome: {},
      recentViolations: 0,
      rateLimitExceeded: 0,
      sessionExpirations: 0,
      resourceAccessAttempts: 0,
      unauthorizedAccessAttempts: 0,
      systemHealth: 'healthy',
      lastUpdated: new Date(),
    };
  }

  private startMonitoring(): void {
    // Monitor security events every minute
    setInterval(() => {
      this.updateMetrics();
      this.detectThreats();
      this.checkSystemHealth();
    }, 60000);

    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 3600000);
  }

  private updateMetrics(): void {
    try {
      const events = auditLogger.getEvents();
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);

      // Reset hourly counters
      this.metrics.rateLimitExceeded = 0;
      this.metrics.unauthorizedAccessAttempts = 0;
      this.metrics.sessionExpirations = 0;

      // Count recent events
      const recentEvents = events.filter(event => 
        new Date(event.timestamp).getTime() > oneHourAgo
      );

      recentEvents.forEach(event => {
        // Count by type
        this.metrics.eventsByType[event.eventType] = 
          (this.metrics.eventsByType[event.eventType] || 0) + 1;

        // Count by severity
        this.metrics.eventsBySeverity[event.severity] = 
          (this.metrics.eventsBySeverity[event.severity] || 0) + 1;

        // Count by outcome
        this.metrics.eventsByOutcome[event.outcome] = 
          (this.metrics.eventsByOutcome[event.outcome] || 0) + 1;

        // Count specific violations
        if (event.eventType === 'security_event') {
          this.metrics.recentViolations++;
          
          if (event.details?.violation === 'rate_limit_exceeded') {
            this.metrics.rateLimitExceeded++;
          }
          
          if (event.details?.violation === 'session_expired') {
            this.metrics.sessionExpirations++;
          }
          
          if (event.details?.violation === 'resource_ownership_violation') {
            this.metrics.unauthorizedAccessAttempts++;
          }
        }

        if (event.eventType === 'data_read' || event.eventType === 'data_create') {
          this.metrics.resourceAccessAttempts++;
        }
      });

      this.metrics.totalEvents = events.length;
      this.metrics.lastUpdated = new Date();
    } catch (error) {
      console.error('[Security Monitor] Error updating metrics:', error);
    }
  }

  private detectThreats(): void {
    try {
      // Detect brute force attacks
      if (this.metrics.rateLimitExceeded > this.alertThresholds.rateLimitExceeded) {
        this.addThreatIndicator({
          type: 'brute_force',
          severity: 'high',
          description: `High rate of rate limit violations: ${this.metrics.rateLimitExceeded} in the last hour`,
          timestamp: new Date(),
        });
      }

      // Detect unauthorized access attempts
      if (this.metrics.unauthorizedAccessAttempts > this.alertThresholds.unauthorizedAccess) {
        this.addThreatIndicator({
          type: 'privilege_escalation',
          severity: 'high',
          description: `Multiple unauthorized access attempts: ${this.metrics.unauthorizedAccessAttempts} in the last hour`,
          timestamp: new Date(),
        });
      }

      // Detect session hijacking attempts
      if (this.metrics.sessionExpirations > this.alertThresholds.sessionExpirations) {
        this.addThreatIndicator({
          type: 'session_hijacking',
          severity: 'medium',
          description: `Unusual number of session expirations: ${this.metrics.sessionExpirations} in the last hour`,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('[Security Monitor] Error detecting threats:', error);
    }
  }

  private checkSystemHealth(): void {
    try {
      const totalEvents = this.metrics.totalEvents;
      const recentViolations = this.metrics.recentViolations;
      const violationRate = totalEvents > 0 ? recentViolations / totalEvents : 0;

      if (violationRate > 0.1) { // More than 10% violations
        this.metrics.systemHealth = 'critical';
        this.createAlert('security_violation', 'critical', 
          `High security violation rate: ${(violationRate * 100).toFixed(1)}%`);
      } else if (violationRate > 0.05) { // More than 5% violations
        this.metrics.systemHealth = 'warning';
        this.createAlert('security_violation', 'medium',
          `Elevated security violation rate: ${(violationRate * 100).toFixed(1)}%`);
      } else {
        this.metrics.systemHealth = 'healthy';
      }
    } catch (error) {
      console.error('[Security Monitor] Error checking system health:', error);
    }
  }

  private addThreatIndicator(indicator: Omit<ThreatIndicator, 'id'>): void {
    const threatIndicator: ThreatIndicator = {
      ...indicator,
      id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.threatIndicators.push(threatIndicator);
    
    // Keep only last 100 threat indicators
    if (this.threatIndicators.length > 100) {
      this.threatIndicators = this.threatIndicators.slice(-100);
    }
  }

  private createAlert(
    type: SecurityAlert['type'],
    severity: SecurityAlert['severity'],
    message: string,
    details: Record<string, unknown> = {}
  ): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      acknowledged: false,
      details,
    };

    this.alerts.push(alert);
    
    // Keep only last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }

    // Log critical alerts
    if (severity === 'critical') {
      console.error(`[SECURITY ALERT] ${message}`, details);
    }
  }

  private cleanupOldData(): void {
    try {
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      // Clean up old threat indicators
      this.threatIndicators = this.threatIndicators.filter(
        indicator => indicator.timestamp.getTime() > oneDayAgo
      );
      
      // Clean up old alerts (keep for 7 days)
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      this.alerts = this.alerts.filter(
        alert => alert.timestamp.getTime() > oneWeekAgo
      );
    } catch (error) {
      console.error('[Security Monitor] Error cleaning up old data:', error);
    }
  }

  // Public API methods
  public getMetrics(): SecurityMetrics {
    return { ...this.metrics };
  }

  public getThreatIndicators(): ThreatIndicator[] {
    return [...this.threatIndicators];
  }

  public getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = new Date();
      return true;
    }
    return false;
  }

  public getSystemHealth(): 'healthy' | 'warning' | 'critical' {
    return this.metrics.systemHealth;
  }

  public exportSecurityReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: this.metrics,
      threats: this.threatIndicators.length,
      alerts: this.alerts.filter(a => !a.acknowledged).length,
      systemHealth: this.metrics.systemHealth,
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();
