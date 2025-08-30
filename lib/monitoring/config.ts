/**
 * Monitoring Configuration
 * 
 * Centralized configuration for health monitoring, alerting, and metrics
 * collection with environment-specific settings and thresholds.
 */

import { Logger } from '../logger';

const monitoringLogger = Logger.create({ component: 'monitoring-config' });

export interface MonitoringConfig {
  enabled: boolean;
  environment: 'development' | 'production' | 'staging' | 'test';
  
  // Health monitoring
  health: {
    enabled: boolean;
    checkInterval: number; // seconds
    timeout: number; // milliseconds
    retries: number;
    thresholds: {
      critical: number; // health score threshold
      warning: number; // health score threshold
      errorRate: number; // percentage
      responseTime: number; // milliseconds
      memoryUsage: number; // percentage
    };
  };

  // RED metrics
  redMetrics: {
    enabled: boolean;
    collectionInterval: number; // seconds
    retentionPeriod: number; // hours
    thresholds: {
      errorRate: number; // percentage
      slowRequestThreshold: number; // milliseconds
      slowRequestPercentage: number; // percentage
      requestsPerSecond: number; // max expected
    };
  };

  // Alerting
  alerts: {
    enabled: boolean;
    channels: {
      email?: {
        enabled: boolean;
        recipients: string[];
        smtpConfig?: {
          host: string;
          port: number;
          secure: boolean;
          auth: {
            user: string;
            pass: string;
          };
        };
      };
      webhook?: {
        enabled: boolean;
        url: string;
        headers?: Record<string, string>;
      };
      slack?: {
        enabled: boolean;
        webhookUrl: string;
        channel: string;
      };
    };
    rules: {
      healthScoreCritical: boolean;
      errorRateHigh: boolean;
      responseTimeSlow: boolean;
      memoryUsageHigh: boolean;
      serviceUnavailable: boolean;
    };
  };

  // Readiness checks
  readiness: {
    enabled: boolean;
    checkInterval: number; // seconds
    timeout: number; // milliseconds
    criticalServices: string[];
    optionalServices: string[];
    thresholds: {
      maxResponseTime: number; // milliseconds
      maxRetries: number;
    };
  };

  // Performance monitoring
  performance: {
    enabled: boolean;
    profiling: {
      enabled: boolean;
      sampleRate: number;
      trackMemory: boolean;
      trackCpu: boolean;
    };
    metrics: {
      enabled: boolean;
      collectionInterval: number; // seconds
      retentionPeriod: number; // hours
    };
  };
}

/**
 * Default configuration with environment-specific overrides
 */
const getDefaultConfig = (): MonitoringConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    environment: (process.env.NODE_ENV as any) || 'development',

    health: {
      enabled: process.env.HEALTH_MONITORING_ENABLED !== 'false',
      checkInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL || '30', 10),
      timeout: parseInt(process.env.HEALTH_CHECK_TIMEOUT || '5000', 10),
      retries: parseInt(process.env.HEALTH_CHECK_RETRIES || '3', 10),
      thresholds: {
        critical: parseInt(process.env.HEALTH_CRITICAL_THRESHOLD || '50', 10),
        warning: parseInt(process.env.HEALTH_WARNING_THRESHOLD || '70', 10),
        errorRate: parseFloat(process.env.HEALTH_ERROR_RATE_THRESHOLD || '5.0'),
        responseTime: parseInt(process.env.HEALTH_RESPONSE_TIME_THRESHOLD || '2000', 10),
        memoryUsage: parseFloat(process.env.HEALTH_MEMORY_USAGE_THRESHOLD || '80.0'),
      },
    },

    redMetrics: {
      enabled: process.env.RED_METRICS_ENABLED !== 'false',
      collectionInterval: parseInt(process.env.RED_METRICS_INTERVAL || '15', 10),
      retentionPeriod: parseInt(process.env.RED_METRICS_RETENTION || '24', 10),
      thresholds: {
        errorRate: parseFloat(process.env.RED_ERROR_RATE_THRESHOLD || '1.0'),
        slowRequestThreshold: parseInt(process.env.RED_SLOW_REQUEST_THRESHOLD || '1000', 10),
        slowRequestPercentage: parseFloat(process.env.RED_SLOW_REQUEST_PERCENTAGE || '5.0'),
        requestsPerSecond: parseInt(process.env.RED_MAX_REQUESTS_PER_SECOND || '1000', 10),
      },
    },

    alerts: {
      enabled: process.env.ALERTS_ENABLED !== 'false',
      channels: {
        email: {
          enabled: process.env.EMAIL_ALERTS_ENABLED === 'true',
          recipients: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || [],
          smtpConfig: process.env.SMTP_CONFIG ? JSON.parse(process.env.SMTP_CONFIG) : undefined,
        },
        webhook: {
          enabled: !!process.env.WEBHOOK_ALERTS_URL,
          url: process.env.WEBHOOK_ALERTS_URL || '',
          headers: process.env.WEBHOOK_ALERTS_HEADERS ? JSON.parse(process.env.WEBHOOK_ALERTS_HEADERS) : undefined,
        },
        slack: {
          enabled: !!process.env.SLACK_WEBHOOK_URL,
          webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
          channel: process.env.SLACK_ALERT_CHANNEL || '#alerts',
        },
      },
      rules: {
        healthScoreCritical: process.env.ALERT_HEALTH_SCORE_CRITICAL !== 'false',
        errorRateHigh: process.env.ALERT_ERROR_RATE_HIGH !== 'false',
        responseTimeSlow: process.env.ALERT_RESPONSE_TIME_SLOW !== 'false',
        memoryUsageHigh: process.env.ALERT_MEMORY_USAGE_HIGH !== 'false',
        serviceUnavailable: process.env.ALERT_SERVICE_UNAVAILABLE !== 'false',
      },
    },

    readiness: {
      enabled: process.env.READINESS_CHECKS_ENABLED !== 'false',
      checkInterval: parseInt(process.env.READINESS_CHECK_INTERVAL || '15', 10),
      timeout: parseInt(process.env.READINESS_CHECK_TIMEOUT || '3000', 10),
      criticalServices: process.env.CRITICAL_SERVICES?.split(',') || ['database', 'environment'],
      optionalServices: process.env.OPTIONAL_SERVICES?.split(',') || ['storage', 'observability'],
      thresholds: {
        maxResponseTime: parseInt(process.env.READINESS_MAX_RESPONSE_TIME || '1000', 10),
        maxRetries: parseInt(process.env.READINESS_MAX_RETRIES || '2', 10),
      },
    },

    performance: {
      enabled: process.env.PERFORMANCE_MONITORING_ENABLED !== 'false',
      profiling: {
        enabled: process.env.PROFILING_ENABLED !== 'false',
        sampleRate: parseFloat(process.env.PROFILING_SAMPLE_RATE || (isProduction ? '0.01' : '1.0')),
        trackMemory: process.env.PROFILE_MEMORY !== 'false',
        trackCpu: process.env.PROFILE_CPU !== 'false',
      },
      metrics: {
        enabled: process.env.PERFORMANCE_METRICS_ENABLED !== 'false',
        collectionInterval: parseInt(process.env.PERFORMANCE_METRICS_INTERVAL || '60', 10),
        retentionPeriod: parseInt(process.env.PERFORMANCE_METRICS_RETENTION || '168', 10), // 7 days
      },
    },
  };
};

/**
 * Load and validate configuration
 */
let cachedConfig: MonitoringConfig | null = null;

export function getMonitoringConfig(): MonitoringConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = getDefaultConfig();
    
    // Validate configuration
    validateConfig(cachedConfig);
    
    monitoringLogger.info('Monitoring configuration loaded', {
      environment: cachedConfig.environment,
      healthEnabled: cachedConfig.health.enabled,
      redMetricsEnabled: cachedConfig.redMetrics.enabled,
      alertsEnabled: cachedConfig.alerts.enabled,
      readinessEnabled: cachedConfig.readiness.enabled,
    });

    return cachedConfig;
  } catch (error) {
    monitoringLogger.error('Failed to load monitoring configuration', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Return minimal safe config
    return getMinimalConfig();
  }
}

/**
 * Validate configuration
 */
function validateConfig(config: MonitoringConfig): void {
  const errors: string[] = [];

  // Health monitoring validation
  if (config.health.enabled) {
    if (config.health.checkInterval < 5) {
      errors.push('Health check interval must be at least 5 seconds');
    }
    if (config.health.timeout < 1000) {
      errors.push('Health check timeout must be at least 1000ms');
    }
    if (config.health.thresholds.critical > config.health.thresholds.warning) {
      errors.push('Critical threshold must be less than warning threshold');
    }
  }

  // RED metrics validation
  if (config.redMetrics.enabled) {
    if (config.redMetrics.collectionInterval < 5) {
      errors.push('RED metrics collection interval must be at least 5 seconds');
    }
    if (config.redMetrics.thresholds.errorRate < 0 || config.redMetrics.thresholds.errorRate > 100) {
      errors.push('Error rate threshold must be between 0 and 100');
    }
  }

  // Readiness validation
  if (config.readiness.enabled) {
    if (config.readiness.checkInterval < 5) {
      errors.push('Readiness check interval must be at least 5 seconds');
    }
    if (config.readiness.timeout < 1000) {
      errors.push('Readiness check timeout must be at least 1000ms');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Monitoring configuration validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Get minimal safe configuration
 */
function getMinimalConfig(): MonitoringConfig {
  return {
    enabled: false,
    environment: 'development',
    health: {
      enabled: false,
      checkInterval: 30,
      timeout: 5000,
      retries: 3,
      thresholds: {
        critical: 50,
        warning: 70,
        errorRate: 5.0,
        responseTime: 2000,
        memoryUsage: 80.0,
      },
    },
    redMetrics: {
      enabled: false,
      collectionInterval: 15,
      retentionPeriod: 24,
      thresholds: {
        errorRate: 1.0,
        slowRequestThreshold: 1000,
        slowRequestPercentage: 5.0,
        requestsPerSecond: 1000,
      },
    },
    alerts: {
      enabled: false,
      channels: {
        email: { enabled: false, recipients: [] },
        webhook: { enabled: false, url: '' },
        slack: { enabled: false, webhookUrl: '', channel: '#alerts' },
      },
      rules: {
        healthScoreCritical: true,
        errorRateHigh: true,
        responseTimeSlow: true,
        memoryUsageHigh: true,
        serviceUnavailable: true,
      },
    },
    readiness: {
      enabled: false,
      checkInterval: 15,
      timeout: 3000,
      criticalServices: ['database', 'environment'],
      optionalServices: ['storage', 'observability'],
      thresholds: {
        maxResponseTime: 1000,
        maxRetries: 2,
      },
    },
    performance: {
      enabled: false,
      profiling: {
        enabled: false,
        sampleRate: 0.01,
        trackMemory: false,
        trackCpu: false,
      },
      metrics: {
        enabled: false,
        collectionInterval: 60,
        retentionPeriod: 168,
      },
    },
  };
}

/**
 * Configuration helpers
 */
export const MonitoringConfigHelpers = {
  /**
   * Check if monitoring is enabled
   */
  isMonitoringEnabled(): boolean {
    return getMonitoringConfig().enabled;
  },

  /**
   * Check if health monitoring is enabled
   */
  isHealthMonitoringEnabled(): boolean {
    return getMonitoringConfig().health.enabled;
  },

  /**
   * Check if RED metrics are enabled
   */
  areREDMetricsEnabled(): boolean {
    return getMonitoringConfig().redMetrics.enabled;
  },

  /**
   * Check if alerts are enabled
   */
  areAlertsEnabled(): boolean {
    return getMonitoringConfig().alerts.enabled;
  },

  /**
   * Check if readiness checks are enabled
   */
  areReadinessChecksEnabled(): boolean {
    return getMonitoringConfig().readiness.enabled;
  },

  /**
   * Get health check interval
   */
  getHealthCheckInterval(): number {
    return getMonitoringConfig().health.checkInterval;
  },

  /**
   * Get RED metrics collection interval
   */
  getREDMetricsInterval(): number {
    return getMonitoringConfig().redMetrics.collectionInterval;
  },

  /**
   * Get readiness check interval
   */
  getReadinessCheckInterval(): number {
    return getMonitoringConfig().readiness.checkInterval;
  },

  /**
   * Get health thresholds
   */
  getHealthThresholds() {
    return getMonitoringConfig().health.thresholds;
  },

  /**
   * Get RED metrics thresholds
   */
  getREDMetricsThresholds() {
    return getMonitoringConfig().redMetrics.thresholds;
  },

  /**
   * Get readiness thresholds
   */
  getReadinessThresholds() {
    return getMonitoringConfig().readiness.thresholds;
  },
};
