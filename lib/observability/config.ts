/**
 * Observability Configuration & Environment Setup
 * 
 * Centralized configuration for OpenTelemetry, logging, metrics, and monitoring
 * with environment-specific settings and feature toggles.
 */

import { Logger } from '../logger';

const configLogger = Logger.create({ component: 'observability-config' });

export interface ObservabilityConfig {
  enabled: boolean;
  environment: 'development' | 'production' | 'staging' | 'test';
  
  // OpenTelemetry Configuration
  tracing: {
    enabled: boolean;
    serviceName: string;
    serviceVersion: string;
    sampleRate: number;
    exporters: {
      jaeger?: {
        enabled: boolean;
        endpoint?: string;
      };
      otlp?: {
        enabled: boolean;
        endpoint?: string;
        headers?: Record<string, string>;
      };
    };
  };

  // Metrics Configuration
  metrics: {
    enabled: boolean;
    prometheus?: {
      enabled: boolean;
      port?: number;
      endpoint?: string;
    };
    business: {
      enabled: boolean;
      collectUserMetrics: boolean;
      collectSecurityMetrics: boolean;
      collectPerformanceMetrics: boolean;
    };
  };

  // Logging Configuration
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    structured: boolean;
    prettyPrint: boolean;
    redactSensitiveData: boolean;
    includeTraceId: boolean;
  };

  // Performance Configuration
  performance: {
    profiling: {
      enabled: boolean;
      sampleRate: number;
      trackMemory: boolean;
      trackCpu: boolean;
      monitoringInterval: number;
    };
    alerts: {
      slowRequestThreshold: number;
      highMemoryThreshold: number;
      errorRateThreshold: number;
    };
  };

  // Security Configuration
  security: {
    logSecurityEvents: boolean;
    trackRateLimitViolations: boolean;
    trackAuthenticationFailures: boolean;
    sensitiveDataMasking: boolean;
  };
}

/**
 * Default configuration with environment-specific overrides
 */
const getDefaultConfig = (): ObservabilityConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  return {
    enabled: process.env.OBSERVABILITY_ENABLED !== 'false',
    environment: (process.env.NODE_ENV as any) || 'development',

    tracing: {
      enabled: process.env.TRACING_ENABLED !== 'false',
      serviceName: process.env.OTEL_SERVICE_NAME || 'dct-micro-app',
      serviceVersion: process.env.OTEL_SERVICE_VERSION || process.env.npm_package_version || '0.2.0',
      sampleRate: parseFloat(process.env.TRACING_SAMPLE_RATE || (isProduction ? '0.1' : '1.0')),
      exporters: {
        jaeger: {
          enabled: isDevelopment && !!process.env.JAEGER_ENDPOINT,
          endpoint: process.env.JAEGER_ENDPOINT,
        },
        otlp: {
          enabled: !!process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
          endpoint: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
          headers: process.env.OTEL_EXPORTER_OTLP_HEADERS ? 
            JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS) : undefined,
        },
      },
    },

    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      prometheus: {
        enabled: !!process.env.PROMETHEUS_PORT,
        port: process.env.PROMETHEUS_PORT ? parseInt(process.env.PROMETHEUS_PORT, 10) : 9090,
        endpoint: process.env.PROMETHEUS_ENDPOINT || '/metrics',
      },
      business: {
        enabled: process.env.BUSINESS_METRICS_ENABLED !== 'false',
        collectUserMetrics: process.env.COLLECT_USER_METRICS !== 'false',
        collectSecurityMetrics: process.env.COLLECT_SECURITY_METRICS !== 'false',
        collectPerformanceMetrics: process.env.COLLECT_PERFORMANCE_METRICS !== 'false',
      },
    },

    logging: {
      level: (process.env.LOG_LEVEL as any) || (isDevelopment ? 'debug' : 'info'),
      structured: process.env.LOG_STRUCTURED !== 'false',
      prettyPrint: isDevelopment,
      redactSensitiveData: process.env.LOG_REDACT_SENSITIVE !== 'false',
      includeTraceId: process.env.LOG_INCLUDE_TRACE_ID !== 'false',
    },

    performance: {
      profiling: {
        enabled: process.env.PROFILING_ENABLED !== 'false',
        sampleRate: parseFloat(process.env.PROFILING_SAMPLE_RATE || (isProduction ? '0.01' : '1.0')),
        trackMemory: process.env.PROFILE_MEMORY !== 'false',
        trackCpu: process.env.PROFILE_CPU !== 'false',
        monitoringInterval: parseInt(process.env.MONITORING_INTERVAL || '30000', 10),
      },
      alerts: {
        slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD || '2000', 10),
        highMemoryThreshold: parseInt(process.env.HIGH_MEMORY_THRESHOLD || '512', 10), // MB
        errorRateThreshold: parseFloat(process.env.ERROR_RATE_THRESHOLD || '0.05'), // 5%
      },
    },

    security: {
      logSecurityEvents: process.env.LOG_SECURITY_EVENTS !== 'false',
      trackRateLimitViolations: process.env.TRACK_RATE_LIMIT_VIOLATIONS !== 'false',
      trackAuthenticationFailures: process.env.TRACK_AUTH_FAILURES !== 'false',
      sensitiveDataMasking: process.env.SENSITIVE_DATA_MASKING !== 'false',
    },
  };
};

/**
 * Load and validate configuration
 */
let cachedConfig: ObservabilityConfig | null = null;

export function getObservabilityConfig(): ObservabilityConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    cachedConfig = getDefaultConfig();
    
    // Validate configuration
    validateConfig(cachedConfig);
    
    configLogger.info('Observability configuration loaded', {
      environment: cachedConfig.environment,
      tracingEnabled: cachedConfig.tracing.enabled,
      metricsEnabled: cachedConfig.metrics.enabled,
      profilingEnabled: cachedConfig.performance.profiling.enabled,
    });

    return cachedConfig;
  } catch (error) {
    configLogger.error('Failed to load observability configuration', {
      error: error instanceof Error ? error.message : String(error),
    });
    
    // Return minimal safe config
    return getMinimalConfig();
  }
}

/**
 * Validate configuration
 */
function validateConfig(config: ObservabilityConfig): void {
  const errors: string[] = [];

  // Validate sample rates
  if (config.tracing.sampleRate < 0 || config.tracing.sampleRate > 1) {
    errors.push('Tracing sample rate must be between 0 and 1');
  }

  if (config.performance.profiling.sampleRate < 0 || config.performance.profiling.sampleRate > 1) {
    errors.push('Profiling sample rate must be between 0 and 1');
  }

  // Validate ports
  if (config.metrics.prometheus?.port && (config.metrics.prometheus.port < 1 || config.metrics.prometheus.port > 65535)) {
    errors.push('Prometheus port must be between 1 and 65535');
  }

  // Validate thresholds
  if (config.performance.alerts.slowRequestThreshold < 0) {
    errors.push('Slow request threshold must be positive');
  }

  if (config.performance.alerts.errorRateThreshold < 0 || config.performance.alerts.errorRateThreshold > 1) {
    errors.push('Error rate threshold must be between 0 and 1');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}

/**
 * Get minimal safe configuration
 */
function getMinimalConfig(): ObservabilityConfig {
  return {
    enabled: false,
    environment: 'development',
    tracing: {
      enabled: false,
      serviceName: 'dct-micro-app',
      serviceVersion: '0.2.0',
      sampleRate: 0,
      exporters: {},
    },
    metrics: {
      enabled: false,
      business: {
        enabled: false,
        collectUserMetrics: false,
        collectSecurityMetrics: false,
        collectPerformanceMetrics: false,
      },
    },
    logging: {
      level: 'info',
      structured: true,
      prettyPrint: false,
      redactSensitiveData: true,
      includeTraceId: false,
    },
    performance: {
      profiling: {
        enabled: false,
        sampleRate: 0,
        trackMemory: false,
        trackCpu: false,
        monitoringInterval: 30000,
      },
      alerts: {
        slowRequestThreshold: 2000,
        highMemoryThreshold: 512,
        errorRateThreshold: 0.05,
      },
    },
    security: {
      logSecurityEvents: true,
      trackRateLimitViolations: true,
      trackAuthenticationFailures: true,
      sensitiveDataMasking: true,
    },
  };
}

/**
 * Environment-specific configuration helpers
 */
export const ConfigHelpers = {
  /**
   * Check if tracing is enabled
   */
  isTracingEnabled(): boolean {
    const config = getObservabilityConfig();
    return config.enabled && config.tracing.enabled;
  },

  /**
   * Check if metrics are enabled
   */
  areMetricsEnabled(): boolean {
    const config = getObservabilityConfig();
    return config.enabled && config.metrics.enabled;
  },

  /**
   * Check if profiling is enabled
   */
  isProfilingEnabled(): boolean {
    const config = getObservabilityConfig();
    return config.enabled && config.performance.profiling.enabled;
  },

  /**
   * Check if business metrics should be collected
   */
  shouldCollectBusinessMetrics(): boolean {
    const config = getObservabilityConfig();
    return config.enabled && config.metrics.business.enabled;
  },

  /**
   * Get tracing sample rate
   */
  getTracingSampleRate(): number {
    return getObservabilityConfig().tracing.sampleRate;
  },

  /**
   * Get profiling sample rate
   */
  getProfilingSampleRate(): number {
    return getObservabilityConfig().performance.profiling.sampleRate;
  },

  /**
   * Should profile this request based on sample rate
   */
  shouldProfile(): boolean {
    const sampleRate = this.getProfilingSampleRate();
    return Math.random() < sampleRate;
  },

  /**
   * Should trace this request based on sample rate
   */
  shouldTrace(): boolean {
    const sampleRate = this.getTracingSampleRate();
    return Math.random() < sampleRate;
  },

  /**
   * Get performance thresholds
   */
  getPerformanceThresholds() {
    return getObservabilityConfig().performance.alerts;
  },
};

/**
 * Configuration validation and health check
 */
export class ConfigValidator {
  /**
   * Validate current configuration and environment
   */
  static validateEnvironment(): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    const config = getObservabilityConfig();

    // Check for development-specific issues
    if (config.environment === 'development') {
      if (!config.logging.prettyPrint) {
        warnings.push('Pretty printing disabled in development mode');
      }
      if (config.tracing.sampleRate < 1.0) {
        warnings.push('Tracing sample rate is less than 100% in development');
      }
    }

    // Check for production-specific issues
    if (config.environment === 'production') {
      if (config.logging.level === 'debug') {
        warnings.push('Debug logging enabled in production');
      }
      if (config.tracing.sampleRate > 0.1) {
        warnings.push('High tracing sample rate in production may impact performance');
      }
      if (config.performance.profiling.sampleRate > 0.01) {
        warnings.push('High profiling sample rate in production may impact performance');
      }
    }

    // Check for required environment variables
    if (config.tracing.enabled) {
      if (!config.tracing.exporters.jaeger?.enabled && !config.tracing.exporters.otlp?.enabled) {
        errors.push('Tracing enabled but no exporters configured');
      }
    }

    if (config.metrics.prometheus?.enabled && !config.metrics.prometheus.port) {
      errors.push('Prometheus metrics enabled but no port configured');
    }

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  /**
   * Generate configuration report
   */
  static generateReport(): Record<string, any> {
    const config = getObservabilityConfig();
    const validation = this.validateEnvironment();

    return {
      timestamp: new Date().toISOString(),
      environment: config.environment,
      observabilityEnabled: config.enabled,
      features: {
        tracing: config.tracing.enabled,
        metrics: config.metrics.enabled,
        profiling: config.performance.profiling.enabled,
        businessMetrics: config.metrics.business.enabled,
      },
      exporters: {
        jaeger: config.tracing.exporters.jaeger?.enabled || false,
        otlp: config.tracing.exporters.otlp?.enabled || false,
        prometheus: config.metrics.prometheus?.enabled || false,
      },
      validation,
      performance: {
        tracingSampleRate: config.tracing.sampleRate,
        profilingSampleRate: config.performance.profiling.sampleRate,
        thresholds: config.performance.alerts,
      },
    };
  }
}

// Initialize configuration on import
getObservabilityConfig();

// End of file