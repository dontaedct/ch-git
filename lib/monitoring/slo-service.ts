/**
 * Service Level Objectives (SLO) Monitoring Service
 * 
 * Implements automated SLO tracking, error budget monitoring, and alert triggering
 * with real-time calculations and trend analysis.
 */

import { Logger } from '../logger';
import { getBusinessMetrics } from '../observability/otel';
import { 
  sloConfig, 
  SLOTarget, 
  SLOMeasurement, 
  SLOHelpers 
} from './slo-config';
import { getMonitoringConfig } from './config';

const sloLogger = Logger.create({ component: 'slo-service' });

/**
 * In-memory storage for SLO measurements and metrics
 * In production, this should be replaced with persistent storage
 */
class SLOMetricsStore {
  private measurements: Map<string, SLOMeasurement[]> = new Map();
  private maxRetention = 168; // 7 days in hours

  /**
   * Store a measurement
   */
  storeMeasurement(measurement: SLOMeasurement): void {
    const sloName = measurement.sloName;
    const measurements = this.measurements.get(sloName) || [];
    
    measurements.push(measurement);
    
    // Keep only recent measurements within retention period
    const cutoffTime = Date.now() - (this.maxRetention * 60 * 60 * 1000);
    const filteredMeasurements = measurements.filter(m => 
      new Date(m.timestamp).getTime() > cutoffTime
    );
    
    this.measurements.set(sloName, filteredMeasurements);
  }

  /**
   * Get recent measurements for an SLO
   */
  getMeasurements(sloName: string, hours: number = 24): SLOMeasurement[] {
    const measurements = this.measurements.get(sloName) || [];
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    
    return measurements.filter(m => 
      new Date(m.timestamp).getTime() > cutoffTime
    );
  }

  /**
   * Get the latest measurement for an SLO
   */
  getLatestMeasurement(sloName: string): SLOMeasurement | undefined {
    const measurements = this.measurements.get(sloName) || [];
    return measurements[measurements.length - 1];
  }

  /**
   * Get all SLO names with measurements
   */
  getAllSLONames(): string[] {
    return Array.from(this.measurements.keys());
  }
}

/**
 * SLO Alert Manager
 */
class SLOAlertManager {
  private activeAlerts: Map<string, {
    level: 'warning' | 'critical';
    startTime: Date;
    lastNotification: Date;
  }> = new Map();

  /**
   * Check if an alert should be triggered
   */
  shouldTriggerAlert(
    sloName: string, 
    measurement: SLOMeasurement, 
    slo: SLOTarget
  ): { trigger: boolean; level: 'warning' | 'critical' | null } {
    const { current, errorBudget } = measurement;
    
    // Check for SLO breach
    if (current.status === 'breach') {
      return { trigger: true, level: 'critical' };
    }
    
    // Check for warning threshold
    if (current.status === 'warning') {
      return { trigger: true, level: 'warning' };
    }
    
    // Check for high error budget burn rate
    if (errorBudget.burnRate >= slo.errorBudget.burnRateThresholds.critical) {
      return { trigger: true, level: 'critical' };
    }
    
    if (errorBudget.burnRate >= slo.errorBudget.burnRateThresholds.warning) {
      return { trigger: true, level: 'warning' };
    }
    
    return { trigger: false, level: null };
  }

  /**
   * Trigger an alert
   */
  async triggerAlert(
    sloName: string, 
    level: 'warning' | 'critical', 
    measurement: SLOMeasurement, 
    slo: SLOTarget
  ): Promise<void> {
    const alertKey = `${sloName}_${level}`;
    const now = new Date();
    
    // Check if we should suppress duplicate alerts
    const existingAlert = this.activeAlerts.get(alertKey);
    if (existingAlert) {
      const minutesSinceLastNotification = 
        (now.getTime() - existingAlert.lastNotification.getTime()) / 60000;
      
      // Don't spam - wait at least 15 minutes between similar alerts
      if (minutesSinceLastNotification < 15) {
        return;
      }
    }
    
    // Update alert tracking
    this.activeAlerts.set(alertKey, {
      level,
      startTime: existingAlert?.startTime || now,
      lastNotification: now,
    });

    // Log the alert
    sloLogger.warn('SLO alert triggered', {
      sloName,
      level,
      currentValue: measurement.current.value,
      target: slo.target,
      errorBudgetConsumed: measurement.errorBudget.consumed,
      burnRate: measurement.errorBudget.burnRate,
      businessImpact: slo.businessImpact.severity,
      estimatedDepletion: measurement.errorBudget.estimatedDepletion,
    });

    // In production, this would integrate with alerting systems
    // For now, we'll log the alert details
    this.logAlert(sloName, level, measurement, slo);
  }

  /**
   * Clear an alert when SLO recovers
   */
  clearAlert(sloName: string, level: 'warning' | 'critical'): void {
    const alertKey = `${sloName}_${level}`;
    const alert = this.activeAlerts.get(alertKey);
    
    if (alert) {
      this.activeAlerts.delete(alertKey);
      
      const duration = Date.now() - alert.startTime.getTime();
      sloLogger.info('SLO alert cleared', {
        sloName,
        level,
        durationMs: duration,
        durationMinutes: Math.round(duration / 60000),
      });
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Array<{
    sloName: string;
    level: 'warning' | 'critical';
    startTime: Date;
    duration: number;
  }> {
    const now = Date.now();
    return Array.from(this.activeAlerts.entries()).map(([key, alert]) => {
      const [sloName, level] = key.split('_');
      return {
        sloName,
        level: level as 'warning' | 'critical',
        startTime: alert.startTime,
        duration: now - alert.startTime.getTime(),
      };
    });
  }

  /**
   * Log alert details (placeholder for actual alerting integration)
   */
  private logAlert(
    sloName: string, 
    level: 'warning' | 'critical', 
    measurement: SLOMeasurement, 
    slo: SLOTarget
  ): void {
    const alert = {
      timestamp: new Date().toISOString(),
      sloName,
      level,
      title: `SLO ${level.toUpperCase()}: ${slo.name}`,
      description: slo.description,
      currentValue: measurement.current.value,
      target: slo.target,
      threshold: slo.threshold,
      errorBudget: {
        consumed: measurement.errorBudget.consumed,
        remaining: measurement.errorBudget.remaining,
        burnRate: measurement.errorBudget.burnRate,
        estimatedDepletion: measurement.errorBudget.estimatedDepletion,
      },
      businessImpact: slo.businessImpact,
      metrics: measurement.metrics,
      runbook: `https://docs.company.com/runbooks/slo-${sloName}`,
    };

    // In production, send to alerting channels specified in slo.alerting.channels
    sloLogger.error('SLO Alert', alert);
  }
}

/**
 * Main SLO Monitoring Service
 */
export class SLOMonitoringService {
  private metricsStore = new SLOMetricsStore();
  private alertManager = new SLOAlertManager();
  private config = getMonitoringConfig();
  private isRunning = false;
  private monitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Start SLO monitoring
   */
  start(): void {
    if (this.isRunning) {
      sloLogger.warn('SLO monitoring already running');
      return;
    }

    if (!sloConfig.isSLOMonitoringEnabled()) {
      sloLogger.warn('SLO monitoring is disabled in configuration');
      return;
    }

    this.isRunning = true;
    
    // Run initial measurement
    this.collectAndAnalyzeSLOs();
    
    // Schedule periodic measurements every 1 minute
    this.monitoringInterval = setInterval(() => {
      this.collectAndAnalyzeSLOs();
    }, 60 * 1000);

    sloLogger.info('SLO monitoring service started', {
      interval: '1 minute',
      sloCount: sloConfig.getAllSLOs().size,
    });
  }

  /**
   * Stop SLO monitoring
   */
  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    sloLogger.info('SLO monitoring service stopped');
  }

  /**
   * Collect and analyze all SLOs
   */
  private async collectAndAnalyzeSLOs(): Promise<void> {
    const businessMetrics = getBusinessMetrics();
    const slos = sloConfig.getAllSLOs();

    for (const [sloName, slo] of slos) {
      try {
        const measurement = this.calculateSLOMeasurement(sloName, slo, businessMetrics);
        this.metricsStore.storeMeasurement(measurement);
        
        // Check for alerts
        const alertCheck = this.alertManager.shouldTriggerAlert(sloName, measurement, slo);
        if (alertCheck.trigger && alertCheck.level) {
          await this.alertManager.triggerAlert(sloName, alertCheck.level, measurement, slo);
        } else if (measurement.current.status === 'healthy') {
          // Clear alerts if SLO is healthy
          this.alertManager.clearAlert(sloName, 'warning');
          this.alertManager.clearAlert(sloName, 'critical');
        }
        
      } catch (error) {
        sloLogger.error('Failed to calculate SLO measurement', {
          sloName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * Calculate SLO measurement from business metrics
   */
  private calculateSLOMeasurement(
    sloName: string,
    slo: SLOTarget,
    businessMetrics: Record<string, any>
  ): SLOMeasurement {
    const now = new Date();
    const windowStart = new Date(now.getTime() - (slo.timeWindow.duration * 60 * 60 * 1000));
    
    // Get metrics based on SLO type
    let currentValue: number;
    let metrics: SLOMeasurement['metrics'];

    switch (slo.type) {
      case 'availability':
        metrics = this.calculateAvailabilityMetrics(businessMetrics);
        currentValue = SLOHelpers.calculateCompliance(
          metrics.successfulRequests,
          metrics.totalRequests
        );
        break;

      case 'error_rate':
        metrics = this.calculateErrorRateMetrics(businessMetrics, sloName);
        currentValue = SLOHelpers.calculateCompliance(
          metrics.successfulRequests,
          metrics.totalRequests
        );
        break;

      case 'latency':
        metrics = this.calculateLatencyMetrics(businessMetrics);
        // For latency SLOs, we measure percentage of requests under threshold
        currentValue = this.calculateLatencyCompliance(metrics, slo);
        break;

      case 'throughput':
        metrics = this.calculateThroughputMetrics(businessMetrics);
        currentValue = this.calculateThroughputCompliance(metrics, slo);
        break;

      default:
        throw new Error(`Unsupported SLO type: ${slo.type}`);
    }

    // Calculate error budget
    const actualErrorRate = 100 - currentValue;
    const errorBudgetConsumption = SLOHelpers.calculateErrorBudgetConsumption(
      actualErrorRate,
      slo.errorBudget.allowedErrorRate
    );
    
    const burnRate = SLOHelpers.calculateBurnRate(
      actualErrorRate,
      slo.errorBudget.allowedErrorRate,
      slo.timeWindow.duration
    );

    const estimatedDepletion = SLOHelpers.estimateErrorBudgetDepletion(
      errorBudgetConsumption,
      burnRate
    );

    // Calculate trend
    const trend = this.calculateTrend(sloName, currentValue);

    // Determine status
    const status = SLOHelpers.determineSLOStatus(currentValue, slo.target, slo.threshold);

    return {
      sloName,
      timestamp: now.toISOString(),
      timeWindow: {
        start: windowStart.toISOString(),
        end: now.toISOString(),
        duration: slo.timeWindow.duration,
      },
      current: {
        value: currentValue,
        isHealthy: status === 'healthy',
        status,
      },
      errorBudget: {
        total: slo.errorBudget.allowedErrorRate,
        consumed: errorBudgetConsumption,
        remaining: 100 - errorBudgetConsumption,
        burnRate,
        estimatedDepletion: estimatedDepletion?.toISOString() || null,
      },
      trend,
      metrics,
    };
  }

  /**
   * Calculate availability metrics
   */
  private calculateAvailabilityMetrics(businessMetrics: any): SLOMeasurement['metrics'] {
    const totalRequests = businessMetrics.requestCount?.total || 0;
    const errorRequests = businessMetrics.errorCount?.total || 0;
    const successfulRequests = totalRequests - errorRequests;

    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      averageResponseTime: businessMetrics.requestDuration?.average,
      p95ResponseTime: businessMetrics.requestDuration?.p95,
      p99ResponseTime: businessMetrics.requestDuration?.p99,
    };
  }

  /**
   * Calculate error rate metrics for specific SLO types
   */
  private calculateErrorRateMetrics(businessMetrics: any, sloName: string): SLOMeasurement['metrics'] {
    let totalRequests: number;
    let errorRequests: number;

    switch (sloName) {
      case 'auth_success_rate':
        totalRequests = businessMetrics.authenticationAttempts?.total || 0;
        errorRequests = businessMetrics.authenticationFailures?.total || 0;
        break;
      
      case 'form_submission_success':
        totalRequests = businessMetrics.formSubmissions?.total || 0;
        errorRequests = businessMetrics.formSubmissionErrors?.total || 0;
        break;
      
      default:
        totalRequests = businessMetrics.requestCount?.total || 0;
        errorRequests = businessMetrics.errorCount?.total || 0;
        break;
    }

    const successfulRequests = totalRequests - errorRequests;

    return {
      totalRequests,
      successfulRequests,
      errorRequests,
      averageResponseTime: businessMetrics.requestDuration?.average,
    };
  }

  /**
   * Calculate latency metrics
   */
  private calculateLatencyMetrics(businessMetrics: any): SLOMeasurement['metrics'] {
    const totalRequests = businessMetrics.requestCount?.total || 0;
    const slowRequests = businessMetrics.slowRequestCount?.total || 0;
    const successfulRequests = totalRequests - slowRequests;

    return {
      totalRequests,
      successfulRequests,
      errorRequests: slowRequests, // For latency SLOs, "errors" are slow requests
      averageResponseTime: businessMetrics.requestDuration?.average,
      p95ResponseTime: businessMetrics.requestDuration?.p95,
      p99ResponseTime: businessMetrics.requestDuration?.p99,
    };
  }

  /**
   * Calculate throughput metrics
   */
  private calculateThroughputMetrics(businessMetrics: any): SLOMeasurement['metrics'] {
    return {
      totalRequests: businessMetrics.requestCount?.total || 0,
      successfulRequests: businessMetrics.requestCount?.total || 0,
      errorRequests: 0,
      averageResponseTime: businessMetrics.requestDuration?.average,
    };
  }

  /**
   * Calculate latency compliance (percentage of requests under threshold)
   */
  private calculateLatencyCompliance(metrics: SLOMeasurement['metrics'], slo: SLOTarget): number {
    // For latency SLOs, we measure percentage of requests that are NOT slow
    return SLOHelpers.calculateCompliance(metrics.successfulRequests, metrics.totalRequests);
  }

  /**
   * Calculate throughput compliance
   */
  private calculateThroughputCompliance(metrics: SLOMeasurement['metrics'], _slo: SLOTarget): number {
    // For throughput SLOs, we would compare against target RPS
    // For now, return 100% (always compliant)
    return 100;
  }

  /**
   * Calculate trend analysis
   */
  private calculateTrend(sloName: string, currentValue: number): SLOMeasurement['trend'] {
    const recentMeasurements = this.metricsStore.getMeasurements(sloName, 2); // Last 2 hours
    
    if (recentMeasurements.length < 2) {
      return {
        direction: 'stable',
        changeRate: 0,
        periodComparison: 0,
      };
    }

    const previousValue = recentMeasurements[recentMeasurements.length - 2].current.value;
    const changeRate = currentValue - previousValue;
    const periodComparison = ((currentValue - previousValue) / previousValue) * 100;

    let direction: 'improving' | 'stable' | 'degrading';
    if (Math.abs(changeRate) < 0.1) {
      direction = 'stable';
    } else if (changeRate > 0) {
      direction = 'improving';
    } else {
      direction = 'degrading';
    }

    return {
      direction,
      changeRate,
      periodComparison,
    };
  }

  /**
   * Get current SLO status
   */
  getSLOStatus(): Array<{
    sloName: string;
    status: 'healthy' | 'warning' | 'breach';
    currentValue: number;
    target: number;
    errorBudgetRemaining: number;
    lastUpdated: string;
  }> {
    const slos = sloConfig.getAllSLOs();
    const result = [];

    for (const [sloName, slo] of slos) {
      const latestMeasurement = this.metricsStore.getLatestMeasurement(sloName);
      
      if (latestMeasurement) {
        result.push({
          sloName,
          status: latestMeasurement.current.status,
          currentValue: latestMeasurement.current.value,
          target: slo.target,
          errorBudgetRemaining: latestMeasurement.errorBudget.remaining,
          lastUpdated: latestMeasurement.timestamp,
        });
      }
    }

    return result;
  }

  /**
   * Get detailed SLO measurement
   */
  getSLOMeasurement(sloName: string): SLOMeasurement | null {
    return this.metricsStore.getLatestMeasurement(sloName) || null;
  }

  /**
   * Get SLO history
   */
  getSLOHistory(sloName: string, hours: number = 24): SLOMeasurement[] {
    return this.metricsStore.getMeasurements(sloName, hours);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return this.alertManager.getActiveAlerts();
  }

  /**
   * Get health summary
   */
  getHealthSummary() {
    const sloStatus = this.getSLOStatus();
    const activeAlerts = this.getActiveAlerts();
    
    const totalSLOs = sloStatus.length;
    const healthySLOs = sloStatus.filter(s => s.status === 'healthy').length;
    const warningSLOs = sloStatus.filter(s => s.status === 'warning').length;
    const breachingSLOs = sloStatus.filter(s => s.status === 'breach').length;
    
    const overallHealth = breachingSLOs > 0 ? 'unhealthy' : 
                         warningSLOs > 0 ? 'degraded' : 'healthy';

    return {
      overallHealth,
      totalSLOs,
      healthySLOs,
      warningSLOs,
      breachingSLOs,
      activeAlerts: activeAlerts.length,
      criticalAlerts: activeAlerts.filter(a => a.level === 'critical').length,
    };
  }
}

/**
 * Global SLO monitoring service instance
 */
export const sloMonitoringService = new SLOMonitoringService();

/**
 * Initialize SLO monitoring (called from application startup)
 */
export function initializeSLOMonitoring(): void {
  if (sloConfig.isSLOMonitoringEnabled()) {
    sloMonitoringService.start();
    sloLogger.info('SLO monitoring initialized and started');
  } else {
    sloLogger.info('SLO monitoring is disabled');
  }
}