/**
 * Observability Module - Main Entry Point
 * 
 * Comprehensive observability solution with OpenTelemetry tracing,
 * structured logging, business metrics, and performance profiling.
 */

// Core observability components
export * from './otel';
export * from './config';
export * from './metrics';
export * from './profiling';
export * from './middleware';

// Re-export enhanced logger
export { Logger, logger } from '../logger';

// Convenience imports for common usage patterns
import { initializeOpenTelemetry, tracedOperation, recordBusinessMetric } from './otel';
import { getObservabilityConfig, ConfigHelpers } from './config';
import { 
  RequestMetricsCollector,
  SecurityMetricsCollector,
  BusinessMetricsCollector,
  PerformanceMetricsCollector,
  HealthMetricsCollector,
  MetricsAggregator,
} from './metrics';
import { Profiling, PerformanceMonitor } from './profiling';
import { Logger } from '../logger';
import { initializeSLOMonitoring } from '../monitoring/slo-service';

const observabilityLogger = Logger.create({ component: 'observability' });

/**
 * Main observability class for centralized management
 */
export class Observability {
  private static instance: Observability | null = null;
  private initialized = false;
  private config = getObservabilityConfig();

  static getInstance(): Observability {
    if (!Observability.instance) {
      Observability.instance = new Observability();
    }
    return Observability.instance;
  }

  /**
   * Initialize complete observability stack
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      observabilityLogger.warn('Observability already initialized');
      return;
    }

    try {
      observabilityLogger.info('Initializing observability stack', {
        config: {
          environment: this.config.environment,
          tracingEnabled: this.config.tracing.enabled,
          metricsEnabled: this.config.metrics.enabled,
          profilingEnabled: this.config.performance.profiling.enabled,
        },
      });

      // Initialize OpenTelemetry (if enabled)
      if (this.config.tracing.enabled) {
        initializeOpenTelemetry();
      }

      // Start performance monitoring (if enabled)
      if (this.config.performance.profiling.enabled) {
        PerformanceMonitor.getInstance().startMonitoring(
          this.config.performance.profiling.monitoringInterval
        );
      }

      // Initialize SLO monitoring
      initializeSLOMonitoring();

      this.initialized = true;
      
      observabilityLogger.info('Observability stack initialized successfully');
      
      // Record initialization metric
      recordBusinessMetric('userRegistrations', 0, {
        event: 'observability_initialized',
        environment: this.config.environment,
      });

    } catch (error) {
      observabilityLogger.error('Failed to initialize observability stack', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    try {
      observabilityLogger.info('Shutting down observability stack');

      // Stop performance monitoring
      PerformanceMonitor.getInstance().stopMonitoring();

      // OpenTelemetry shutdown is handled in otel.ts

      this.initialized = false;
      observabilityLogger.info('Observability stack shutdown completed');

    } catch (error) {
      observabilityLogger.error('Error during observability shutdown', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Check if observability is properly initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get health status of observability components
   */
  getHealthStatus(): Record<string, any> {
    return {
      initialized: this.initialized,
      config: this.config.environment,
      features: {
        tracing: ConfigHelpers.isTracingEnabled(),
        metrics: ConfigHelpers.areMetricsEnabled(),
        profiling: ConfigHelpers.isProfilingEnabled(),
        businessMetrics: ConfigHelpers.shouldCollectBusinessMetrics(),
      },
      performance: {
        tracingSampleRate: ConfigHelpers.getTracingSampleRate(),
        profilingSampleRate: ConfigHelpers.getProfilingSampleRate(),
        thresholds: ConfigHelpers.getPerformanceThresholds(),
      },
      system: MetricsAggregator.getMetricsSummary(),
    };
  }
}

/**
 * Observability middleware for Express/Next.js
 */
export function createObservabilityMiddleware() {
  return function observabilityMiddleware(req: any, res: any, next: any) {
    // Skip if observability is disabled
    if (!ConfigHelpers.areMetricsEnabled()) {
      return next();
    }

    const startTime = Date.now();
    const method = req.method;
    const route = req.route?.path || req.url;

    // Start request metrics collection
    const metricsCollector = new RequestMetricsCollector(method, route, {
      userAgent: req.headers?.['user-agent'],
      ip: req.ip || req.connection?.remoteAddress,
    });

    // Profiling (based on sample rate)
    let profiler: any = null;
    if (ConfigHelpers.shouldProfile()) {
      profiler = Profiling.profileOperation(`http_request_${method}_${route}`, async () => {
        // Profiling will be handled by the response handler
      });
    }

    // Response handler
    const originalSend = res.send;
    res.send = function (data: any) {
      const duration = Date.now() - startTime;
      const status = res.statusCode;

      // Collect request metrics
      metricsCollector.addMetadata({
        responseSize: data?.length || 0,
        contentType: res.get('Content-Type'),
      });
      metricsCollector.finish(status, {
        route: req.route?.path || 'unknown',
        authenticated: !!req.user,
      });

      // Log request completion
      observabilityLogger.info('Request completed', {
        method,
        route,
        status,
        duration,
        category: duration > 1000 ? 'slow' : 'fast',
      });

      return originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Convenience functions for common observability tasks
 */
export const Observing = {
  // Request tracking
  trackRequest: (method: string, route: string) => new RequestMetricsCollector(method, route),

  // Security events
  recordSecurityEvent: SecurityMetricsCollector.recordEvent,
  recordRateLimitViolation: SecurityMetricsCollector.recordRateLimitViolation,
  recordAuthFailure: SecurityMetricsCollector.recordAuthFailure,

  // Business events
  recordUserRegistration: BusinessMetricsCollector.recordUserRegistration,
  recordFormSubmission: BusinessMetricsCollector.recordFormSubmission,
  recordEmailSent: BusinessMetricsCollector.recordEmailSent,
  recordFileUpload: BusinessMetricsCollector.recordFileUpload,

  // Performance tracking
  profileOperation: Profiling.profileOperation,
  profileDatabase: Profiling.profileDatabase,
  profileAPI: Profiling.profileAPI,

  // Health monitoring
  recordSystemHealth: HealthMetricsCollector.recordSystemHealth,
  recordDatabaseHealth: HealthMetricsCollector.recordDatabaseHealth,
  recordExternalServiceHealth: HealthMetricsCollector.recordExternalServiceHealth,

  // Tracing
  trace: tracedOperation,
  recordMetric: recordBusinessMetric,
};

/**
 * Auto-initialize observability if not disabled
 */
if (typeof window === 'undefined' && getObservabilityConfig().enabled) {
  // Auto-initialize on server-side only
  const observability = Observability.getInstance();
  
  // Initialize on next tick to allow for environment setup
  process.nextTick(async () => {
    try {
      await observability.initialize();
    } catch (error) {
      observabilityLogger.error('Auto-initialization failed', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  // Graceful shutdown handlers
  process.on('SIGTERM', async () => {
    await observability.shutdown();
  });

  process.on('SIGINT', async () => {
    await observability.shutdown();
  });
}

// Export the singleton instance for global access
export const observability = Observability.getInstance();