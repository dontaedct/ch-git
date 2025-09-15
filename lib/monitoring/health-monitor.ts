/**
 * @fileoverview HT-008.8.7: Enhanced Health Checks and Status Monitoring
 * @module lib/monitoring/health-monitor
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.7 - Implement health checks and status monitoring
 * Focus: Production-grade health monitoring with dependency tracking and uptime monitoring
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production health monitoring, system reliability)
 */

import { Logger } from '@/lib/logger';
import { comprehensiveLogger } from '@/lib/monitoring/comprehensive-logger';
import { Observing } from '@/lib/observability';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Health check configuration
interface HealthMonitorConfig {
  enableDependencyMonitoring: boolean;
  enableUptimeMonitoring: boolean;
  enablePerformanceMonitoring: boolean;
  enableAlerting: boolean;
  enableHealthHistory: boolean;
  checkIntervalMs: number;
  dependencyTimeoutMs: number;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    uptimeThreshold: number;
  };
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
  enableEmailNotifications: boolean;
  emailRecipients: string[];
}

const defaultConfig: HealthMonitorConfig = {
  enableDependencyMonitoring: true,
  enableUptimeMonitoring: true,
  enablePerformanceMonitoring: true,
  enableAlerting: true,
  enableHealthHistory: true,
  checkIntervalMs: 30000, // 30 seconds
  dependencyTimeoutMs: 5000, // 5 seconds
  alertThresholds: {
    errorRate: 0.05, // 5%
    responseTime: 2000, // 2 seconds
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.8, // 80%
    uptimeThreshold: 0.99, // 99%
  },
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_HEALTH_WEBHOOK_URL,
  enableEmailNotifications: false,
  emailRecipients: [],
};

// Health check result
export interface HealthCheckResult {
  service: string;
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: Date;
  error?: string;
  metadata: Record<string, any>;
}

// Dependency health status
interface DependencyHealth {
  name: string;
  type: 'database' | 'storage' | 'auth' | 'external' | 'internal';
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastCheck: Date;
  uptime: number; // percentage
  errorRate: number; // percentage
  metadata: Record<string, any>;
}

// System health metrics
interface SystemHealthMetrics {
  uptime: number; // seconds
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: number; // percentage
  nodeVersion: string;
  environment: string;
  timestamp: Date;
}

// Health history entry
export interface HealthHistoryEntry {
  timestamp: Date;
  overallHealth: number; // 0-100
  serviceHealth: Record<string, HealthCheckResult>;
  systemMetrics: SystemHealthMetrics;
  dependencies: DependencyHealth[];
  alerts: string[];
}

// Uptime statistics
export interface UptimeStats {
  service: string;
  totalChecks: number;
  successfulChecks: number;
  uptimePercentage: number;
  lastDowntime: Date | null;
  averageDowntime: number; // minutes
  longestDowntime: number; // minutes
}

/**
 * Enhanced Health Monitor System
 * 
 * Provides comprehensive health monitoring with dependency tracking,
 * uptime monitoring, performance metrics, and automated alerting.
 */
export class HealthMonitor {
  private static instance: HealthMonitor | null = null;
  private config: HealthMonitorConfig;
  private logger = Logger.create({ component: 'health-monitor' });
  private healthChecks: Map<string, () => Promise<HealthCheckResult>> = new Map();
  private healthHistory: HealthHistoryEntry[] = [];
  private uptimeStats: Map<string, UptimeStats> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  private constructor(config: Partial<HealthMonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.setupDefaultHealthChecks();
    this.startMonitoring();
  }

  static getInstance(config?: Partial<HealthMonitorConfig>): HealthMonitor {
    if (!HealthMonitor.instance) {
      HealthMonitor.instance = new HealthMonitor(config);
    }
    return HealthMonitor.instance;
  }

  /**
   * Register a health check
   */
  registerHealthCheck(
    service: string,
    checkFunction: () => Promise<HealthCheckResult>
  ): void {
    this.healthChecks.set(service, checkFunction);
    
    // Initialize uptime stats
    if (!this.uptimeStats.has(service)) {
      this.uptimeStats.set(service, {
        service,
        totalChecks: 0,
        successfulChecks: 0,
        uptimePercentage: 100,
        lastDowntime: null,
        averageDowntime: 0,
        longestDowntime: 0,
      });
    }

    this.logger.info('Health check registered', {
      service,
      totalChecks: this.healthChecks.size,
    });
  }

  /**
   * Unregister a health check
   */
  unregisterHealthCheck(service: string): void {
    this.healthChecks.delete(service);
    this.uptimeStats.delete(service);
    
    this.logger.info('Health check unregistered', {
      service,
      totalChecks: this.healthChecks.size,
    });
  }

  /**
   * Perform all health checks
   */
  async performHealthChecks(): Promise<{
    overallHealth: number;
    serviceHealth: Record<string, HealthCheckResult>;
    dependencies: DependencyHealth[];
    systemMetrics: SystemHealthMetrics;
    alerts: string[];
  }> {
    const startTime = Date.now();
    const serviceHealth: Record<string, HealthCheckResult> = {};
    const dependencies: DependencyHealth[] = [];
    const alerts: string[] = [];

    // Perform all registered health checks
    const checkPromises = Array.from(this.healthChecks.entries()).map(
      async ([service, checkFunction]) => {
        try {
          const result = await this.executeWithTimeout(
            checkFunction,
            this.config.dependencyTimeoutMs
          );
          
          // Update uptime stats
          this.updateUptimeStats(service, result.healthy);
          
          // Check for alerts
          if (!result.healthy) {
            alerts.push(`Service ${service} is unhealthy: ${result.error || 'Unknown error'}`);
          }
          
          if (result.responseTime > this.config.alertThresholds.responseTime) {
            alerts.push(`Service ${service} has slow response time: ${result.responseTime}ms`);
          }

          return [service, result] as [string, HealthCheckResult];
        } catch (error) {
          const result: HealthCheckResult = {
            service,
            healthy: false,
            status: 'unhealthy',
            responseTime: Date.now() - startTime,
            lastCheck: new Date(),
            error: (error as Error).message,
            metadata: {},
          };

          this.updateUptimeStats(service, false);
          alerts.push(`Health check failed for ${service}: ${(error as Error).message}`);

          return [service, result] as [string, HealthCheckResult];
        }
      }
    );

    // Wait for all checks to complete
    const results = await Promise.all(checkPromises);
    results.forEach(([service, result]) => {
      serviceHealth[service] = result;
    });

    // Get system metrics
    const systemMetrics = this.getSystemMetrics();

    // Check system-level alerts
    if (systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal > this.config.alertThresholds.memoryUsage) {
      alerts.push(`High memory usage: ${Math.round((systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal) * 100)}%`);
    }

    // Calculate overall health score
    const overallHealth = this.calculateOverallHealth(serviceHealth, systemMetrics);

    // Store in history
    if (this.config.enableHealthHistory) {
      this.storeHealthHistory({
        timestamp: new Date(),
        overallHealth,
        serviceHealth,
        systemMetrics,
        dependencies,
        alerts,
      });
    }

    // Send alerts if enabled
    if (this.config.enableAlerting && alerts.length > 0) {
      await this.sendHealthAlerts(alerts, serviceHealth, systemMetrics);
    }

    // Record business metric
    Observing.recordBusinessMetric('health_check_completed', 1, {
      overallHealth,
      serviceCount: Object.keys(serviceHealth).length,
      alertCount: alerts.length,
    });

    return {
      overallHealth,
      serviceHealth,
      dependencies,
      systemMetrics,
      alerts,
    };
  }

  /**
   * Get health status for a specific service
   */
  async getServiceHealth(service: string): Promise<HealthCheckResult | null> {
    const checkFunction = this.healthChecks.get(service);
    if (!checkFunction) {
      return null;
    }

    try {
      return await this.executeWithTimeout(
        checkFunction,
        this.config.dependencyTimeoutMs
      );
    } catch (error) {
      return {
        service,
        healthy: false,
        status: 'unhealthy',
        responseTime: 0,
        lastCheck: new Date(),
        error: (error as Error).message,
        metadata: {},
      };
    }
  }

  /**
   * Get uptime statistics
   */
  getUptimeStats(): Record<string, UptimeStats> {
    return Object.fromEntries(this.uptimeStats);
  }

  /**
   * Get health history
   */
  getHealthHistory(hours: number = 24): HealthHistoryEntry[] {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.healthHistory.filter(entry => entry.timestamp >= cutoffTime);
  }

  /**
   * Get overall system health score
   */
  getOverallHealthScore(): number {
    if (this.healthHistory.length === 0) return 100;
    
    const recentEntries = this.healthHistory.slice(-10); // Last 10 checks
    const averageHealth = recentEntries.reduce((sum, entry) => sum + entry.overallHealth, 0) / recentEntries.length;
    
    return Math.round(averageHealth);
  }

  /**
   * Get health trends
   */
  getHealthTrends(): {
    trend: 'improving' | 'stable' | 'declining';
    change: number;
    period: string;
  } {
    if (this.healthHistory.length < 2) {
      return { trend: 'stable', change: 0, period: 'insufficient data' };
    }

    const recent = this.healthHistory.slice(-5);
    const older = this.healthHistory.slice(-10, -5);
    
    if (older.length === 0) {
      return { trend: 'stable', change: 0, period: 'insufficient data' };
    }

    const recentAvg = recent.reduce((sum, entry) => sum + entry.overallHealth, 0) / recent.length;
    const olderAvg = older.reduce((sum, entry) => sum + entry.overallHealth, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    
    if (change > 5) return { trend: 'improving', change, period: 'last 5 checks' };
    if (change < -5) return { trend: 'declining', change, period: 'last 5 checks' };
    return { trend: 'stable', change, period: 'last 5 checks' };
  }

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.performHealthChecks();
      } catch (error) {
        this.logger.error('Health monitoring failed', {
          error: (error as Error).message,
        });
      }
    }, this.config.checkIntervalMs);

    this.logger.info('Health monitoring started', {
      interval: this.config.checkIntervalMs,
      checks: this.healthChecks.size,
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.logger.info('Health monitoring stopped');
  }

  /**
   * Setup default health checks
   */
  private setupDefaultHealthChecks(): void {
    // Database health check
    this.registerHealthCheck('database', async () => {
      const startTime = Date.now();
      try {
        const supabase = createServiceRoleClient();
        const { error } = await supabase.from('clients').select('count').limit(1);
        const responseTime = Date.now() - startTime;

        return {
          service: 'database',
          healthy: !error,
          status: !error ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          error: error?.message,
          metadata: {
            type: 'database',
            provider: 'supabase',
          },
        };
      } catch (error) {
        return {
          service: 'database',
          healthy: false,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date(),
          error: (error as Error).message,
          metadata: {
            type: 'database',
            provider: 'supabase',
          },
        };
      }
    });

    // Storage health check
    this.registerHealthCheck('storage', async () => {
      const startTime = Date.now();
      try {
        const supabase = createServiceRoleClient();
        const { error } = await supabase.storage.listBuckets();
        const responseTime = Date.now() - startTime;

        return {
          service: 'storage',
          healthy: !error,
          status: !error ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          error: error?.message,
          metadata: {
            type: 'storage',
            provider: 'supabase',
          },
        };
      } catch (error) {
        return {
          service: 'storage',
          healthy: false,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date(),
          error: (error as Error).message,
          metadata: {
            type: 'storage',
            provider: 'supabase',
          },
        };
      }
    });

    // Auth health check
    this.registerHealthCheck('auth', async () => {
      const startTime = Date.now();
      try {
        const supabase = createServiceRoleClient();
        const { error } = await supabase.auth.admin.listUsers({ perPage: 1 });
        const responseTime = Date.now() - startTime;

        return {
          service: 'auth',
          healthy: !error,
          status: !error ? 'healthy' : 'unhealthy',
          responseTime,
          lastCheck: new Date(),
          error: error?.message,
          metadata: {
            type: 'auth',
            provider: 'supabase',
          },
        };
      } catch (error) {
        return {
          service: 'auth',
          healthy: false,
          status: 'unhealthy',
          responseTime: Date.now() - startTime,
          lastCheck: new Date(),
          error: (error as Error).message,
          metadata: {
            type: 'auth',
            provider: 'supabase',
          },
        };
      }
    });

    // System health check
    this.registerHealthCheck('system', async () => {
      const startTime = Date.now();
      const memoryUsage = process.memoryUsage();
      const memoryUsageMB = memoryUsage.heapUsed / 1024 / 1024;
      const responseTime = Date.now() - startTime;

      const healthy = memoryUsageMB < 1000; // Less than 1GB
      const status = memoryUsageMB < 500 ? 'healthy' : memoryUsageMB < 1000 ? 'degraded' : 'unhealthy';

      return {
        service: 'system',
        healthy,
        status,
        responseTime,
        lastCheck: new Date(),
        error: healthy ? undefined : `High memory usage: ${Math.round(memoryUsageMB)}MB`,
        metadata: {
          type: 'system',
          memoryUsageMB,
          uptime: process.uptime(),
          nodeVersion: process.version,
        },
      };
    });
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * Update uptime statistics
   */
  private updateUptimeStats(service: string, success: boolean): void {
    const stats = this.uptimeStats.get(service);
    if (!stats) return;

    stats.totalChecks++;
    if (success) {
      stats.successfulChecks++;
    } else {
      // Track downtime
      if (stats.lastDowntime === null) {
        stats.lastDowntime = new Date();
      }
    }

    stats.uptimePercentage = (stats.successfulChecks / stats.totalChecks) * 100;
    this.uptimeStats.set(service, stats);
  }

  /**
   * Calculate overall health score
   */
  private calculateOverallHealth(
    serviceHealth: Record<string, HealthCheckResult>,
    systemMetrics: SystemHealthMetrics
  ): number {
    if (Object.keys(serviceHealth).length === 0) return 100;

    let totalScore = 0;
    let serviceCount = 0;

    // Calculate service health scores
    Object.values(serviceHealth).forEach(service => {
      let score = 0;
      if (service.status === 'healthy') score = 100;
      else if (service.status === 'degraded') score = 50;
      else score = 0;

      // Penalize slow response times
      if (service.responseTime > this.config.alertThresholds.responseTime) {
        score *= 0.8;
      }

      totalScore += score;
      serviceCount++;
    });

    // Calculate system health score
    const memoryUsage = systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal;
    let systemScore = 100;
    
    if (memoryUsage > this.config.alertThresholds.memoryUsage) {
      systemScore -= 30;
    }

    // Combine scores
    const serviceScore = serviceCount > 0 ? totalScore / serviceCount : 100;
    const overallScore = (serviceScore + systemScore) / 2;

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  /**
   * Store health history
   */
  private storeHealthHistory(entry: HealthHistoryEntry): void {
    this.healthHistory.push(entry);
    
    // Keep only last 1000 entries
    if (this.healthHistory.length > 1000) {
      this.healthHistory = this.healthHistory.slice(-1000);
    }
  }

  /**
   * Get system metrics
   */
  private getSystemMetrics(): SystemHealthMetrics {
    const memoryUsage = process.memoryUsage();
    
    return {
      uptime: process.uptime(),
      memoryUsage: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      },
      cpuUsage: 0, // Would need additional library to get CPU usage
      nodeVersion: process.version,
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'local',
      timestamp: new Date(),
    };
  }

  /**
   * Send health alerts
   */
  private async sendHealthAlerts(
    alerts: string[],
    serviceHealth: Record<string, HealthCheckResult>,
    systemMetrics: SystemHealthMetrics
  ): Promise<void> {
    const alertMessage = `🚨 Health Alert: ${alerts.length} issues detected`;
    const details = alerts.join('\n');

    // Send to Slack
    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      try {
        const payload = {
          text: alertMessage,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Issues', value: alerts.length.toString(), short: true },
              { title: 'Services', value: Object.keys(serviceHealth).length.toString(), short: true },
              { title: 'Memory Usage', value: `${systemMetrics.memoryUsage.heapUsed}MB`, short: true },
              { title: 'Details', value: details, short: false },
            ],
            footer: 'Health Monitor',
            ts: Math.floor(Date.now() / 1000),
          }],
        };

        await fetch(this.config.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        this.logger.error('Failed to send Slack alert', {
          error: (error as Error).message,
        });
      }
    }

    // Send to webhooks
    if (this.config.enableWebhookNotifications && this.config.webhookUrls.length > 0) {
      await Promise.all(
        this.config.webhookUrls.map(url => this.sendWebhookAlert(url, alerts, serviceHealth, systemMetrics))
      );
    }

    // Log alerts
    comprehensiveLogger.log('error', 'Health alerts triggered', {
      alertCount: alerts.length,
      alerts,
      serviceHealth: Object.keys(serviceHealth).length,
    }, {
      component: 'health-monitor',
      operation: 'health_alert',
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(
    url: string,
    alerts: string[],
    serviceHealth: Record<string, HealthCheckResult>,
    systemMetrics: SystemHealthMetrics
  ): Promise<void> {
    try {
      const payload = {
        event: 'health_alert',
        timestamp: new Date().toISOString(),
        alerts,
        serviceHealth,
        systemMetrics,
        overallHealth: this.getOverallHealthScore(),
      };

      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Health-Alert': 'true',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      this.logger.error('Failed to send webhook alert', {
        error: (error as Error).message,
        url,
      });
    }
  }
}

// Global health monitor instance
export const healthMonitor = HealthMonitor.getInstance();

// Convenience functions
export function registerHealthCheck(
  service: string,
  checkFunction: () => Promise<HealthCheckResult>
): void {
  healthMonitor.registerHealthCheck(service, checkFunction);
}

export function unregisterHealthCheck(service: string): void {
  healthMonitor.unregisterHealthCheck(service);
}

export function performHealthChecks(): ReturnType<HealthMonitor['performHealthChecks']> {
  return healthMonitor.performHealthChecks();
}

export function getServiceHealth(service: string): Promise<HealthCheckResult | null> {
  return healthMonitor.getServiceHealth(service);
}

export function getUptimeStats(): Record<string, UptimeStats> {
  return healthMonitor.getUptimeStats();
}

export function getHealthHistory(hours?: number): HealthHistoryEntry[] {
  return healthMonitor.getHealthHistory(hours);
}

export function getOverallHealthScore(): number {
  return healthMonitor.getOverallHealthScore();
}

export function getHealthTrends(): ReturnType<HealthMonitor['getHealthTrends']> {
  return healthMonitor.getHealthTrends();
}
