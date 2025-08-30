/**
 * Business Metrics Collection & Instrumentation
 * 
 * Provides comprehensive business metrics collection with OpenTelemetry integration,
 * performance tracking, and security event monitoring for production observability.
 */

import { recordBusinessMetric, getBusinessMetrics, getCurrentTraceId } from './otel';
import { Logger } from '../logger';

const metricsLogger = Logger.business();

export interface MetricTags {
  [key: string]: string | number | boolean;
}

export interface RequestMetrics {
  method: string;
  route: string;
  status: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  isBot?: boolean;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface SecurityEventMetrics {
  eventType: 'rate_limit' | 'malicious_payload' | 'ip_blocked' | 'auth_failure' | 'xss_attempt' | 'sql_injection';
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userAgent?: string;
  route?: string;
  details?: Record<string, any>;
}

export interface BusinessEventMetrics {
  eventType: 'user_registration' | 'form_submission' | 'email_sent' | 'file_upload' | 'payment_processed';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  errorType?: string;
  metadata?: Record<string, any>;
}

/**
 * Request metrics collector
 */
export class RequestMetricsCollector {
  private startTime: number;
  private traceId: string | undefined;

  constructor(
    private method: string,
    private route: string,
    private metadata: Record<string, any> = {}
  ) {
    this.startTime = Date.now();
    this.traceId = getCurrentTraceId();
  }

  /**
   * Record completed request metrics
   */
  finish(status: number, additionalTags: MetricTags = {}): void {
    const duration = Date.now() - this.startTime;
    const isError = status >= 400;
    const isServerError = status >= 500;

    // Record OpenTelemetry metrics
    recordBusinessMetric('requestCount', 1, {
      method: this.method,
      route: this.route,
      status: status.toString(),
      success: (!isError).toString(),
      ...additionalTags,
    });

    recordBusinessMetric('requestDuration', duration, {
      method: this.method,
      route: this.route,
      status: status.toString(),
      ...additionalTags,
    });

    // Performance categorization
    const performanceCategory = duration > 2000 ? 'very_slow' : 
                               duration > 1000 ? 'slow' : 
                               duration > 500 ? 'medium' : 'fast';

    // Structured logging
    metricsLogger.info('Request completed', {
      method: this.method,
      route: this.route,
      status,
      duration,
      performanceCategory,
      isError,
      isServerError,
      traceId: this.traceId,
      ...this.metadata,
      ...additionalTags,
    });

    // Alert on slow requests
    if (duration > 2000) {
      metricsLogger.warn('Slow request detected', {
        method: this.method,
        route: this.route,
        duration,
        traceId: this.traceId,
      });
    }

    // Alert on server errors
    if (isServerError) {
      metricsLogger.error('Server error in request', {
        method: this.method,
        route: this.route,
        status,
        duration,
        traceId: this.traceId,
      });
    }
  }

  /**
   * Add metadata to the collector
   */
  addMetadata(metadata: Record<string, any>): void {
    Object.assign(this.metadata, metadata);
  }
}

/**
 * Security metrics collector
 */
export class SecurityMetricsCollector {
  /**
   * Record security event
   */
  static recordEvent(event: SecurityEventMetrics): void {
    const { eventType, severity, ip, userAgent, route, details = {} } = event;

    // Record OpenTelemetry metric
    recordBusinessMetric('securityEvents', 1, {
      eventType,
      severity,
      route: route || 'unknown',
    });

    // Structured logging
    Logger.security().warn('Security event recorded', {
      eventType,
      severity,
      ip,
      userAgent,
      route,
      traceId: getCurrentTraceId(),
      ...details,
    });

    // Critical alerts
    if (severity === 'critical') {
      Logger.security().fatal('Critical security event', {
        eventType,
        ip,
        userAgent,
        route,
        traceId: getCurrentTraceId(),
        ...details,
      });
    }
  }

  /**
   * Record rate limit violation
   */
  static recordRateLimitViolation(ip: string, route: string, details: Record<string, any> = {}): void {
    recordBusinessMetric('rateLimitViolations', 1, {
      route,
      ip: ip.substring(0, 7) + 'xxx', // Partially anonymize IP
    });

    this.recordEvent({
      eventType: 'rate_limit',
      severity: 'medium',
      ip,
      route,
      details,
    });
  }

  /**
   * Record authentication failure
   */
  static recordAuthFailure(ip: string, route: string, reason: string, details: Record<string, any> = {}): void {
    recordBusinessMetric('authenticationAttempts', 1, {
      route,
      success: 'false',
      reason,
    });

    this.recordEvent({
      eventType: 'auth_failure',
      severity: 'high',
      ip,
      route,
      details: { reason, ...details },
    });
  }
}

/**
 * Business metrics collector
 */
export class BusinessMetricsCollector {
  /**
   * Record user registration
   */
  static recordUserRegistration(userId: string, metadata: Record<string, any> = {}): void {
    recordBusinessMetric('userRegistrations', 1);

    metricsLogger.info('User registration recorded', {
      userId,
      traceId: getCurrentTraceId(),
      ...metadata,
    });
  }

  /**
   * Record form submission
   */
  static recordFormSubmission(formType: string, userId?: string, metadata: Record<string, any> = {}): void {
    recordBusinessMetric('formSubmissions', 1, {
      formType,
      hasUser: (!!userId).toString(),
    });

    metricsLogger.info('Form submission recorded', {
      formType,
      userId,
      traceId: getCurrentTraceId(),
      ...metadata,
    });
  }

  /**
   * Record email sent
   */
  static recordEmailSent(emailType: string, userId?: string, metadata: Record<string, any> = {}): void {
    metricsLogger.info('Email sent recorded', {
      emailType,
      userId,
      traceId: getCurrentTraceId(),
      ...metadata,
    });
  }

  /**
   * Record file upload
   */
  static recordFileUpload(fileType: string, fileSize: number, userId?: string, metadata: Record<string, any> = {}): void {
    metricsLogger.info('File upload recorded', {
      fileType,
      fileSize,
      userId,
      traceId: getCurrentTraceId(),
      ...metadata,
    });
  }
}

/**
 * Performance metrics collector
 */
export class PerformanceMetricsCollector {
  private startTime: number;
  private startMemory: number;

  constructor(private operation: string) {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage().heapUsed;
  }

  /**
   * Finish performance measurement
   */
  finish(success: boolean = true, errorType?: string, metadata: Record<string, any> = {}): void {
    const duration = Date.now() - this.startTime;
    const memoryDelta = process.memoryUsage().heapUsed - this.startMemory;

    Logger.performance().info('Operation completed', {
      operation: this.operation,
      duration,
      memoryDelta,
      success,
      errorType,
      traceId: getCurrentTraceId(),
      ...metadata,
    });

    // Alert on slow operations
    if (duration > 5000) {
      Logger.performance().warn('Slow operation detected', {
        operation: this.operation,
        duration,
        traceId: getCurrentTraceId(),
      });
    }

    // Alert on memory leaks
    if (memoryDelta > 10 * 1024 * 1024) { // 10MB
      Logger.performance().warn('High memory usage detected', {
        operation: this.operation,
        memoryDelta,
        traceId: getCurrentTraceId(),
      });
    }
  }
}

/**
 * Health metrics collector
 */
export class HealthMetricsCollector {
  /**
   * Record system health metrics
   */
  static recordSystemHealth(): void {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    Logger.performance().debug('System health snapshot', {
      memory: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      nodeVersion: process.version,
    });
  }

  /**
   * Record database health
   */
  static recordDatabaseHealth(healthy: boolean, responseTime: number, details: Record<string, any> = {}): void {
    Logger.performance().info('Database health check', {
      healthy,
      responseTime,
      category: responseTime > 1000 ? 'slow' : responseTime > 500 ? 'medium' : 'fast',
      ...details,
    });
  }

  /**
   * Record external service health
   */
  static recordExternalServiceHealth(serviceName: string, healthy: boolean, responseTime: number, details: Record<string, any> = {}): void {
    Logger.performance().info('External service health check', {
      serviceName,
      healthy,
      responseTime,
      category: responseTime > 2000 ? 'slow' : responseTime > 1000 ? 'medium' : 'fast',
      ...details,
    });
  }
}

/**
 * Metrics aggregator for reporting
 */
export class MetricsAggregator {
  /**
   * Get current metrics summary
   */
  static getMetricsSummary(): Record<string, any> {
    const otelMetrics = getBusinessMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
      },
      openTelemetry: {
        enabled: !!otelMetrics,
        activeTraceId: getCurrentTraceId(),
      },
      application: {
        name: process.env.OTEL_SERVICE_NAME || 'dct-micro-app',
        version: process.env.OTEL_SERVICE_VERSION || '0.2.0',
      },
    };
  }
}

/**
 * Initialize metrics collection with periodic health checks
 */
export function initializeMetricsCollection(): void {
  metricsLogger.info('Initializing metrics collection');

  // Periodic health metrics
  setInterval(() => {
    HealthMetricsCollector.recordSystemHealth();
  }, 60000); // Every minute

  // Process event listeners
  process.on('uncaughtException', (error) => {
    Logger.security().fatal('Uncaught exception', {
      error: error.message,
      stack: error.stack,
      traceId: getCurrentTraceId(),
    });
  });

  process.on('unhandledRejection', (reason) => {
    Logger.security().error('Unhandled promise rejection', {
      reason: String(reason),
      traceId: getCurrentTraceId(),
    });
  });

  metricsLogger.info('Metrics collection initialized');
}

// Auto-initialize metrics collection
if (typeof window === 'undefined') {
  initializeMetricsCollection();
}