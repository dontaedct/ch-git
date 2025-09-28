/**
 * Health Checks and Uptime Monitoring System
 * Comprehensive monitoring for production applications
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details?: Record<string, any>;
  error?: string;
}

export interface SystemHealth {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: HealthCheckResult[];
  uptime: number;
  lastChecked: Date;
  version: string;
  environment: string;
}

export interface MonitoringConfig {
  checkInterval: number; // milliseconds
  timeout: number; // milliseconds
  retryAttempts: number;
  alertThresholds: {
    responseTime: number; // milliseconds
    errorRate: number; // percentage
    uptime: number; // percentage
  };
  services: Array<{
    name: string;
    url: string;
    type: 'http' | 'database' | 'storage' | 'external';
    critical: boolean;
  }>;
}

export class HealthCheckMonitor {
  private config: MonitoringConfig;
  private supabase: any;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private startTime: Date;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.startTime = new Date();
    
    // Initialize Supabase client for storing health check results
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Start the health check monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('Health check monitor is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting health check monitoring...');

    // Run initial health check
    await this.runHealthChecks();

    // Set up interval for continuous monitoring
    this.intervalId = setInterval(async () => {
      await this.runHealthChecks();
    }, this.config.checkInterval);

    console.log(`Health check monitoring started with ${this.config.checkInterval}ms interval`);
  }

  /**
   * Stop the health check monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Health check monitoring stopped');
  }

  /**
   * Run health checks for all configured services
   */
  async runHealthChecks(): Promise<SystemHealth> {
    const results: HealthCheckResult[] = [];
    const startTime = Date.now();

    // Run health checks in parallel
    const healthCheckPromises = this.config.services.map(service => 
      this.checkService(service)
    );

    const serviceResults = await Promise.allSettled(healthCheckPromises);
    
    serviceResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        const service = this.config.services[index];
        results.push({
          service: service.name,
          status: 'unhealthy',
          responseTime: 0,
          timestamp: new Date(),
          error: result.reason?.message || 'Unknown error',
        });
      }
    });

    // Calculate overall system health
    const overall = this.calculateOverallHealth(results);
    const uptime = this.calculateUptime();

    const systemHealth: SystemHealth = {
      overall,
      services: results,
      uptime,
      lastChecked: new Date(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Store results in database
    await this.storeHealthCheckResults(systemHealth);

    // Check for alerts
    await this.checkAlerts(systemHealth);

    return systemHealth;
  }

  /**
   * Check individual service health
   */
  private async checkService(service: any): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      let result: HealthCheckResult;

      switch (service.type) {
        case 'http':
          result = await this.checkHttpService(service);
          break;
        case 'database':
          result = await this.checkDatabaseService(service);
          break;
        case 'storage':
          result = await this.checkStorageService(service);
          break;
        case 'external':
          result = await this.checkExternalService(service);
          break;
        default:
          throw new Error(`Unknown service type: ${service.type}`);
      }

      result.responseTime = Date.now() - startTime;
      return result;

    } catch (error) {
      return {
        service: service.name,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Check HTTP service health
   */
  private async checkHttpService(service: any): Promise<HealthCheckResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(service.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'HealthCheck/1.0',
        },
      });

      clearTimeout(timeoutId);

      const isHealthy = response.ok && response.status < 500;
      
      return {
        service: service.name,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime: 0, // Will be set by caller
        timestamp: new Date(),
        details: {
          statusCode: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
        },
        error: isHealthy ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Check database service health
   */
  private async checkDatabaseService(service: any): Promise<HealthCheckResult> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Simple query to test database connectivity
      const { data, error } = await this.supabase
        .from('health_checks')
        .select('id')
        .limit(1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return {
        service: service.name,
        status: 'healthy',
        responseTime: 0, // Will be set by caller
        timestamp: new Date(),
        details: {
          connection: 'active',
          queryResult: data,
        },
      };

    } catch (error) {
      throw new Error(`Database health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check storage service health
   */
  private async checkStorageService(service: any): Promise<HealthCheckResult> {
    try {
      // Check if we can read from the file system
      const testPath = path.join(process.cwd(), 'public');
      await fs.access(testPath);

      return {
        service: service.name,
        status: 'healthy',
        responseTime: 0, // Will be set by caller
        timestamp: new Date(),
        details: {
          storage: 'accessible',
          path: testPath,
        },
      };

    } catch (error) {
      throw new Error(`Storage health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check external service health
   */
  private async checkExternalService(service: any): Promise<HealthCheckResult> {
    // For external services, we'll do a simple HTTP check
    return this.checkHttpService(service);
  }

  /**
   * Calculate overall system health
   */
  private calculateOverallHealth(results: HealthCheckResult[]): 'healthy' | 'unhealthy' | 'degraded' {
    const criticalServices = this.config.services.filter(s => s.critical);
    const criticalResults = results.filter(r => 
      criticalServices.some(s => s.name === r.service)
    );

    // If any critical service is unhealthy, system is unhealthy
    if (criticalResults.some(r => r.status === 'unhealthy')) {
      return 'unhealthy';
    }

    // If any service is unhealthy, system is degraded
    if (results.some(r => r.status === 'unhealthy')) {
      return 'degraded';
    }

    // If any service is degraded, system is degraded
    if (results.some(r => r.status === 'degraded')) {
      return 'degraded';
    }

    return 'healthy';
  }

  /**
   * Calculate system uptime
   */
  private calculateUptime(): number {
    const now = Date.now();
    const uptimeMs = now - this.startTime.getTime();
    return Math.floor(uptimeMs / 1000); // Return uptime in seconds
  }

  /**
   * Store health check results in database
   */
  private async storeHealthCheckResults(systemHealth: SystemHealth): Promise<void> {
    if (!this.supabase) return;

    try {
      // Store overall system health
      await this.supabase
        .from('system_health')
        .insert({
          overall_status: systemHealth.overall,
          uptime_seconds: systemHealth.uptime,
          version: systemHealth.version,
          environment: systemHealth.environment,
          checked_at: systemHealth.lastChecked.toISOString(),
        });

      // Store individual service health
      const serviceHealthData = systemHealth.services.map(service => ({
        service_name: service.service,
        status: service.status,
        response_time_ms: service.responseTime,
        error_message: service.error,
        details: service.details,
        checked_at: service.timestamp.toISOString(),
      }));

      await this.supabase
        .from('service_health')
        .insert(serviceHealthData);

    } catch (error) {
      console.error('Failed to store health check results:', error);
    }
  }

  /**
   * Check for alerts based on thresholds
   */
  private async checkAlerts(systemHealth: SystemHealth): Promise<void> {
    const alerts: string[] = [];

    // Check response time thresholds
    const slowServices = systemHealth.services.filter(
      s => s.responseTime > this.config.alertThresholds.responseTime
    );
    
    if (slowServices.length > 0) {
      alerts.push(`Slow services detected: ${slowServices.map(s => s.service).join(', ')}`);
    }

    // Check error rate
    const unhealthyServices = systemHealth.services.filter(s => s.status === 'unhealthy');
    const errorRate = (unhealthyServices.length / systemHealth.services.length) * 100;
    
    if (errorRate > this.config.alertThresholds.errorRate) {
      alerts.push(`High error rate: ${errorRate.toFixed(1)}%`);
    }

    // Check uptime
    if (systemHealth.uptime < this.config.alertThresholds.uptime) {
      alerts.push(`Low uptime: ${systemHealth.uptime} seconds`);
    }

    // Send alerts if any
    if (alerts.length > 0) {
      await this.sendAlerts(alerts, systemHealth);
    }
  }

  /**
   * Send alerts via configured channels
   */
  private async sendAlerts(alerts: string[], systemHealth: SystemHealth): Promise<void> {
    console.warn('Health check alerts:', alerts);

    // Store alerts in database
    if (this.supabase) {
      try {
        await this.supabase
          .from('health_alerts')
          .insert({
            alerts: alerts,
            system_health: systemHealth,
            created_at: new Date().toISOString(),
          });
      } catch (error) {
        console.error('Failed to store alerts:', error);
      }
    }

    // TODO: Implement email/Slack/webhook notifications
    // This would integrate with the notification system
  }

  /**
   * Get current system health
   */
  async getCurrentHealth(): Promise<SystemHealth> {
    return this.runHealthChecks();
  }

  /**
   * Get health history
   */
  async getHealthHistory(hours: number = 24): Promise<any[]> {
    if (!this.supabase) return [];

    try {
      const { data, error } = await this.supabase
        .from('system_health')
        .select('*')
        .gte('checked_at', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
        .order('checked_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Failed to fetch health history:', error);
      return [];
    }
  }
}

/**
 * Default monitoring configuration
 */
export const defaultMonitoringConfig: MonitoringConfig = {
  checkInterval: 60000, // 1 minute
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  alertThresholds: {
    responseTime: 5000, // 5 seconds
    errorRate: 10, // 10%
    uptime: 3600, // 1 hour
  },
  services: [
    {
      name: 'API',
      url: '/api/health',
      type: 'http',
      critical: true,
    },
    {
      name: 'Database',
      url: 'database',
      type: 'database',
      critical: true,
    },
    {
      name: 'Storage',
      url: 'storage',
      type: 'storage',
      critical: false,
    },
  ],
};

/**
 * Create and start health check monitor
 */
export async function startHealthMonitoring(config?: Partial<MonitoringConfig>): Promise<HealthCheckMonitor> {
  const finalConfig = { ...defaultMonitoringConfig, ...config };
  const monitor = new HealthCheckMonitor(finalConfig);
  await monitor.start();
  return monitor;
}
