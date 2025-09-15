/**
 * @fileoverview HT-008.8.6: Automated Error Recovery Mechanisms
 * @module lib/monitoring/error-recovery
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Error Handling & Monitoring Phase
 * Task: HT-008.8.6 - Add automated error recovery mechanisms
 * Focus: Production-grade error recovery with circuit breakers, retries, and fallbacks
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (production error recovery, system resilience)
 */

import { Logger } from '@/lib/logger';
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/errors/types';
import { comprehensiveLogger } from '@/lib/monitoring/comprehensive-logger';
import { Observing } from '@/lib/observability';

// Error recovery configuration
interface RecoveryConfig {
  enableCircuitBreaker: boolean;
  enableRetryMechanism: boolean;
  enableFallbackServices: boolean;
  enableAutoRecovery: boolean;
  enableHealthChecks: boolean;
  enableGracefulDegradation: boolean;
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  circuitBreakerThreshold: number;
  circuitBreakerWindowMs: number;
  circuitBreakerRecoveryMs: number;
  healthCheckIntervalMs: number;
  fallbackTimeoutMs: number;
  enableWebhookNotifications: boolean;
  webhookUrls: string[];
  enableSlackNotifications: boolean;
  slackWebhookUrl?: string;
}

const defaultConfig: RecoveryConfig = {
  enableCircuitBreaker: true,
  enableRetryMechanism: true,
  enableFallbackServices: true,
  enableAutoRecovery: true,
  enableHealthChecks: true,
  enableGracefulDegradation: true,
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  jitterFactor: 0.1,
  circuitBreakerThreshold: 10,
  circuitBreakerWindowMs: 600000, // 10 minutes
  circuitBreakerRecoveryMs: 300000, // 5 minutes
  healthCheckIntervalMs: 30000, // 30 seconds
  fallbackTimeoutMs: 5000, // 5 seconds
  enableWebhookNotifications: false,
  webhookUrls: [],
  enableSlackNotifications: false,
  slackWebhookUrl: process.env.SLACK_RECOVERY_WEBHOOK_URL,
};

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

// Circuit breaker entry
interface CircuitBreakerEntry {
  state: CircuitBreakerState;
  failures: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  consecutiveFailures: number;
  totalRequests: number;
}

// Retry result
interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalDuration: number;
  finalState: CircuitBreakerState;
}

// Fallback service configuration
export interface FallbackService {
  name: string;
  url: string;
  timeout: number;
  priority: number;
  healthCheck?: () => Promise<boolean>;
  transform?: (data: any) => any;
}

// Service health status
export interface ServiceHealth {
  service: string;
  healthy: boolean;
  lastCheck: Date;
  responseTime: number;
  errorRate: number;
  circuitBreakerState: CircuitBreakerState;
}

// Recovery action
interface RecoveryAction {
  id: string;
  type: 'retry' | 'fallback' | 'circuit_breaker_open' | 'circuit_breaker_close' | 'health_check';
  service: string;
  timestamp: Date;
  success: boolean;
  details: Record<string, any>;
}

/**
 * Automated Error Recovery System
 * 
 * Provides comprehensive error recovery mechanisms including circuit breakers,
 * retry logic, fallback services, and automated health monitoring.
 */
export class ErrorRecoverySystem {
  private static instance: ErrorRecoverySystem | null = null;
  private config: RecoveryConfig;
  private logger = Logger.create({ component: 'error-recovery' });
  private circuitBreakers: Map<string, CircuitBreakerEntry> = new Map();
  private fallbackServices: Map<string, FallbackService[]> = new Map();
  private serviceHealth: Map<string, ServiceHealth> = new Map();
  private recoveryActions: RecoveryAction[] = [];
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  private constructor(config: Partial<RecoveryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.startHealthChecks();
    this.startPeriodicTasks();
  }

  static getInstance(config?: Partial<RecoveryConfig>): ErrorRecoverySystem {
    if (!ErrorRecoverySystem.instance) {
      ErrorRecoverySystem.instance = new ErrorRecoverySystem(config);
    }
    return ErrorRecoverySystem.instance;
  }

  /**
   * Execute operation with full error recovery
   */
  async executeWithRecovery<T>(
    serviceName: string,
    operation: () => Promise<T>,
    options: {
      fallbackServices?: FallbackService[];
      customRetryConfig?: Partial<RecoveryConfig>;
      timeout?: number;
      context?: Record<string, any>;
    } = {}
  ): Promise<RetryResult<T>> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();
    
    try {
      // Register fallback services if provided
      if (options.fallbackServices) {
        this.registerFallbackServices(serviceName, options.fallbackServices);
      }

      // Check circuit breaker state
      const circuitBreakerState = this.getCircuitBreakerState(serviceName);
      if (circuitBreakerState === CircuitBreakerState.OPEN) {
        this.logger.warn('Circuit breaker is OPEN, attempting fallback', {
          service: serviceName,
          operationId,
        });

        const fallbackResult = await this.executeFallback(serviceName, options.context);
        if (fallbackResult.success) {
          return {
            success: true,
            result: fallbackResult.result,
            attempts: 1,
            totalDuration: Date.now() - startTime,
            finalState: CircuitBreakerState.OPEN,
          };
        }
      }

      // Execute with retry mechanism
      const result = await this.executeWithRetry(
        serviceName,
        operation,
        options.customRetryConfig,
        options.timeout,
        operationId
      );

      // Record success
      this.recordSuccess(serviceName);
      this.recordRecoveryAction({
        id: operationId,
        type: 'retry',
        service: serviceName,
        timestamp: new Date(),
        success: true,
        details: {
          attempts: result.attempts,
          duration: result.totalDuration,
        },
      });

      return result;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Record failure
      this.recordFailure(serviceName, error as Error);
      
      // Attempt fallback if available
      if (this.config.enableFallbackServices) {
        try {
          const fallbackResult = await this.executeFallback(serviceName, options.context);
          if (fallbackResult.success) {
            this.recordRecoveryAction({
              id: operationId,
              type: 'fallback',
              service: serviceName,
              timestamp: new Date(),
              success: true,
              details: {
                fallbackService: fallbackResult.service,
                duration,
              },
            });

            return {
              success: true,
              result: fallbackResult.result,
              attempts: 1,
              totalDuration: duration,
              finalState: this.getCircuitBreakerState(serviceName),
            };
          }
        } catch (fallbackError) {
          this.logger.error('Fallback also failed', {
            service: serviceName,
            originalError: (error as Error).message,
            fallbackError: (fallbackError as Error).message,
            operationId,
          });
        }
      }

      // Record recovery action failure
      this.recordRecoveryAction({
        id: operationId,
        type: 'retry',
        service: serviceName,
        timestamp: new Date(),
        success: false,
        details: {
          error: (error as Error).message,
          duration,
        },
      });

      return {
        success: false,
        error: error as Error,
        attempts: this.config.maxRetries + 1,
        totalDuration: duration,
        finalState: this.getCircuitBreakerState(serviceName),
      };
    }
  }

  /**
   * Execute operation with retry mechanism
   */
  private async executeWithRetry<T>(
    serviceName: string,
    operation: () => Promise<T>,
    customConfig?: Partial<RecoveryConfig>,
    timeout?: number,
    operationId?: string
  ): Promise<RetryResult<T>> {
    const config = { ...this.config, ...customConfig };
    const startTime = Date.now();
    let lastError: Error;

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        // Execute with timeout if specified
        const result = timeout 
          ? await this.executeWithTimeout(operation, timeout)
          : await operation();

        // Record success
        this.recordSuccess(serviceName);

        return {
          success: true,
          result,
          attempts: attempt + 1,
          totalDuration: Date.now() - startTime,
          finalState: this.getCircuitBreakerState(serviceName),
        };

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on last attempt
        if (attempt === config.maxRetries) {
          break;
        }

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          this.logger.warn('Non-retryable error encountered', {
            service: serviceName,
            error: lastError.message,
            operationId,
          });
          break;
        }

        // Calculate delay with jitter
        const delay = this.calculateBackoffDelay(attempt, config);
        
        this.logger.warn('Operation failed, retrying', {
          service: serviceName,
          attempt: attempt + 1,
          maxRetries: config.maxRetries,
          delay,
          error: lastError.message,
          operationId,
        });

        // Record retry attempt
        comprehensiveLogger.log('warn', 'Retry attempt', {
          service: serviceName,
          attempt: attempt + 1,
          error: lastError.message,
        }, {
          component: 'error-recovery',
          operation: 'retry',
          correlationId: operationId,
        });

        await this.sleep(delay);
      }
    }

    // Record failure
    this.recordFailure(serviceName, lastError!);

    return {
      success: false,
      error: lastError!,
      attempts: config.maxRetries + 1,
      totalDuration: Date.now() - startTime,
      finalState: this.getCircuitBreakerState(serviceName),
    };
  }

  /**
   * Execute fallback service
   */
  private async executeFallback(
    serviceName: string,
    context?: Record<string, any>
  ): Promise<{ success: boolean; result?: any; service?: string }> {
    const fallbackServices = this.fallbackServices.get(serviceName);
    if (!fallbackServices || fallbackServices.length === 0) {
      return { success: false };
    }

    // Sort by priority (lower number = higher priority)
    const sortedServices = fallbackServices.sort((a, b) => a.priority - b.priority);

    for (const fallbackService of sortedServices) {
      try {
        this.logger.info('Attempting fallback service', {
          service: serviceName,
          fallbackService: fallbackService.name,
        });

        // Check health if health check is available
        if (fallbackService.healthCheck) {
          const isHealthy = await fallbackService.healthCheck();
          if (!isHealthy) {
            this.logger.warn('Fallback service is unhealthy', {
              fallbackService: fallbackService.name,
            });
            continue;
          }
        }

        // Execute fallback with timeout
        const result = await this.executeWithTimeout(
          () => this.callFallbackService(fallbackService, context),
          fallbackService.timeout
        );

        this.logger.info('Fallback service succeeded', {
          service: serviceName,
          fallbackService: fallbackService.name,
        });

        return {
          success: true,
          result: fallbackService.transform ? fallbackService.transform(result) : result,
          service: fallbackService.name,
        };

      } catch (error) {
        this.logger.warn('Fallback service failed', {
          service: serviceName,
          fallbackService: fallbackService.name,
          error: (error as Error).message,
        });
        continue;
      }
    }

    return { success: false };
  }

  /**
   * Call fallback service
   */
  private async callFallbackService(
    fallbackService: FallbackService,
    context?: Record<string, any>
  ): Promise<any> {
    const response = await fetch(fallbackService.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        context,
        timestamp: new Date().toISOString(),
        fallbackService: fallbackService.name,
      }),
    });

    if (!response.ok) {
      throw new Error(`Fallback service ${fallbackService.name} returned ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Register fallback services for a service
   */
  registerFallbackServices(serviceName: string, services: FallbackService[]): void {
    this.fallbackServices.set(serviceName, services);
    
    this.logger.info('Fallback services registered', {
      service: serviceName,
      count: services.length,
    });
  }

  /**
   * Get circuit breaker state
   */
  getCircuitBreakerState(serviceName: string): CircuitBreakerState {
    const entry = this.circuitBreakers.get(serviceName);
    if (!entry) {
      return CircuitBreakerState.CLOSED;
    }

    const now = Date.now();
    
    // Check if circuit breaker should transition from OPEN to HALF_OPEN
    if (entry.state === CircuitBreakerState.OPEN) {
      if (now - entry.lastFailureTime > this.config.circuitBreakerRecoveryMs) {
        this.updateCircuitBreakerState(serviceName, CircuitBreakerState.HALF_OPEN);
        return CircuitBreakerState.HALF_OPEN;
      }
    }

    // Reset failure count if window has expired
    if (now - entry.lastFailureTime > this.config.circuitBreakerWindowMs) {
      this.updateCircuitBreakerState(serviceName, CircuitBreakerState.CLOSED, { failures: 0 });
    }

    return entry.state;
  }

  /**
   * Record successful operation
   */
  private recordSuccess(serviceName: string): void {
    const entry = this.circuitBreakers.get(serviceName) || this.createCircuitBreakerEntry();
    
    entry.lastSuccessTime = Date.now();
    entry.totalRequests++;
    
    // Reset consecutive failures
    entry.consecutiveFailures = 0;
    
    // Transition from HALF_OPEN to CLOSED if we're in HALF_OPEN state
    if (entry.state === CircuitBreakerState.HALF_OPEN) {
      this.updateCircuitBreakerState(serviceName, CircuitBreakerState.CLOSED);
    }

    this.circuitBreakers.set(serviceName, entry);
  }

  /**
   * Record failed operation
   */
  private recordFailure(serviceName: string, error: Error): void {
    const entry = this.circuitBreakers.get(serviceName) || this.createCircuitBreakerEntry();
    
    entry.failures++;
    entry.consecutiveFailures++;
    entry.lastFailureTime = Date.now();
    entry.totalRequests++;

    // Check if circuit breaker should open
    if (entry.failures >= this.config.circuitBreakerThreshold) {
      this.updateCircuitBreakerState(serviceName, CircuitBreakerState.OPEN);
      
      this.logger.error('Circuit breaker opened', {
        service: serviceName,
        failures: entry.failures,
        threshold: this.config.circuitBreakerThreshold,
        error: error.message,
      });

      // Send notification
      this.sendCircuitBreakerNotification(serviceName, CircuitBreakerState.OPEN, error);
    }

    this.circuitBreakers.set(serviceName, entry);
  }

  /**
   * Update circuit breaker state
   */
  private updateCircuitBreakerState(
    serviceName: string,
    state: CircuitBreakerState,
    updates: Partial<CircuitBreakerEntry> = {}
  ): void {
    const entry = this.circuitBreakers.get(serviceName) || this.createCircuitBreakerEntry();
    
    const previousState = entry.state;
    entry.state = state;
    Object.assign(entry, updates);
    
    this.circuitBreakers.set(serviceName, entry);

    if (previousState !== state) {
      this.logger.info('Circuit breaker state changed', {
        service: serviceName,
        previousState,
        newState: state,
      });

      this.recordRecoveryAction({
        id: this.generateOperationId(),
        type: state === CircuitBreakerState.OPEN ? 'circuit_breaker_open' : 'circuit_breaker_close',
        service: serviceName,
        timestamp: new Date(),
        success: true,
        details: {
          previousState,
          newState: state,
        },
      });

      // Send notification
      this.sendCircuitBreakerNotification(serviceName, state);
    }
  }

  /**
   * Create circuit breaker entry
   */
  private createCircuitBreakerEntry(): CircuitBreakerEntry {
    return {
      state: CircuitBreakerState.CLOSED,
      failures: 0,
      lastFailureTime: 0,
      lastSuccessTime: Date.now(),
      consecutiveFailures: 0,
      totalRequests: 0,
    };
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    // Network errors are generally retryable
    if (error.message.includes('network') || error.message.includes('timeout')) {
      return true;
    }

    // HTTP 5xx errors are retryable
    if (error.message.includes('500') || error.message.includes('502') || 
        error.message.includes('503') || error.message.includes('504')) {
      return true;
    }

    // Rate limiting errors are retryable
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return true;
    }

    // Authentication errors are generally not retryable
    if (error.message.includes('401') || error.message.includes('403')) {
      return false;
    }

    // Client errors (4xx) are generally not retryable
    if (error.message.includes('400') || error.message.includes('404')) {
      return false;
    }

    return true;
  }

  /**
   * Calculate backoff delay with jitter
   */
  private calculateBackoffDelay(attempt: number, config: RecoveryConfig): number {
    const baseDelay = config.baseDelayMs;
    const maxDelay = config.maxDelayMs;
    const jitterFactor = config.jitterFactor;

    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = Math.random() * jitterFactor * baseDelay;
    const delay = Math.min(exponentialDelay + jitter, maxDelay);

    return Math.floor(delay);
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Record recovery action
   */
  private recordRecoveryAction(action: RecoveryAction): void {
    this.recoveryActions.push(action);
    
    // Keep only last 1000 actions
    if (this.recoveryActions.length > 1000) {
      this.recoveryActions = this.recoveryActions.slice(-1000);
    }

    // Record in comprehensive logger
    comprehensiveLogger.log('info', 'Recovery action recorded', {
      actionType: action.type,
      service: action.service,
      success: action.success,
    }, {
      component: 'error-recovery',
      operation: 'recovery_action',
      correlationId: action.id,
    });
  }

  /**
   * Start health checks
   */
  private startHealthChecks(): void {
    if (!this.config.enableHealthChecks) return;

    // Check all registered services every 30 seconds
    setInterval(() => {
      this.performHealthChecks();
    }, this.config.healthCheckIntervalMs);
  }

  /**
   * Perform health checks
   */
  private async performHealthChecks(): Promise<void> {
    for (const [serviceName, fallbackServices] of this.fallbackServices.entries()) {
      try {
        const health = await this.checkServiceHealth(serviceName, fallbackServices);
        this.serviceHealth.set(serviceName, health);

        this.recordRecoveryAction({
          id: this.generateOperationId(),
          type: 'health_check',
          service: serviceName,
          timestamp: new Date(),
          success: health.healthy,
          details: {
            responseTime: health.responseTime,
            errorRate: health.errorRate,
            circuitBreakerState: health.circuitBreakerState,
          },
        });

      } catch (error) {
        this.logger.error('Health check failed', {
          service: serviceName,
          error: (error as Error).message,
        });
      }
    }
  }

  /**
   * Check service health
   */
  private async checkServiceHealth(
    serviceName: string,
    fallbackServices: FallbackService[]
  ): Promise<ServiceHealth> {
    const startTime = Date.now();
    let healthy = false;
    let errorRate = 0;

    // Check primary service (if available)
    try {
      // This would be a real health check endpoint
      // For now, we'll use the circuit breaker state as a proxy
      const circuitBreakerState = this.getCircuitBreakerState(serviceName);
      healthy = circuitBreakerState === CircuitBreakerState.CLOSED;
      
      // Calculate error rate from circuit breaker data
      const entry = this.circuitBreakers.get(serviceName);
      if (entry && entry.totalRequests > 0) {
        errorRate = entry.failures / entry.totalRequests;
      }

    } catch (error) {
      healthy = false;
    }

    return {
      service: serviceName,
      healthy,
      lastCheck: new Date(),
      responseTime: Date.now() - startTime,
      errorRate,
      circuitBreakerState: this.getCircuitBreakerState(serviceName),
    };
  }

  /**
   * Send circuit breaker notification
   */
  private async sendCircuitBreakerNotification(
    serviceName: string,
    state: CircuitBreakerState,
    error?: Error
  ): Promise<void> {
    const message = state === CircuitBreakerState.OPEN
      ? `🚨 Circuit Breaker Opened: ${serviceName}`
      : `✅ Circuit Breaker Closed: ${serviceName}`;

    const details = error 
      ? `Error: ${error.message}\nService: ${serviceName}\nState: ${state}`
      : `Service: ${serviceName}\nState: ${state}`;

    // Send to Slack
    if (this.config.enableSlackNotifications && this.config.slackWebhookUrl) {
      try {
        const payload = {
          text: message,
          attachments: [{
            color: state === CircuitBreakerState.OPEN ? 'danger' : 'good',
            fields: [
              { title: 'Service', value: serviceName, short: true },
              { title: 'State', value: state.toString(), short: true },
              { title: 'Details', value: details, short: false },
            ],
            footer: 'Error Recovery System',
            ts: Math.floor(Date.now() / 1000),
          }],
        };

        await fetch(this.config.slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (notificationError) {
        this.logger.error('Failed to send Slack notification', {
          error: (notificationError as Error).message,
        });
      }
    }
  }

  /**
   * Get recovery statistics
   */
  getRecoveryStatistics(): {
    circuitBreakers: Record<string, CircuitBreakerEntry>;
    serviceHealth: Record<string, ServiceHealth>;
    recentActions: RecoveryAction[];
    totalActions: number;
  } {
    return {
      circuitBreakers: Object.fromEntries(this.circuitBreakers),
      serviceHealth: Object.fromEntries(this.serviceHealth),
      recentActions: this.recoveryActions.slice(-50),
      totalActions: this.recoveryActions.length,
    };
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceName: string): ServiceHealth | null {
    return this.serviceHealth.get(serviceName) || null;
  }

  /**
   * Get all service health statuses
   */
  getAllServiceHealth(): ServiceHealth[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Start periodic tasks
   */
  private startPeriodicTasks(): void {
    // Cleanup old recovery actions
    setInterval(() => {
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 24); // Keep 24 hours
      
      this.recoveryActions = this.recoveryActions.filter(
        action => action.timestamp >= cutoffDate
      );
    }, 60 * 60 * 1000); // Hourly

    // Generate periodic reports
    setInterval(() => {
      this.generatePeriodicReport();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  /**
   * Generate periodic report
   */
  private generatePeriodicReport(): void {
    const stats = this.getRecoveryStatistics();
    
    this.logger.info('Daily recovery report', {
      totalActions: stats.totalActions,
      circuitBreakers: Object.keys(stats.circuitBreakers).length,
      healthyServices: (stats.serviceHealth as unknown as any[]).filter((h: any) => h.healthy).length,
      totalServices: stats.serviceHealth.length,
    });

    // Record business metric
    Observing.recordBusinessMetric('recovery_system_health', 1, {
      totalActions: stats.totalActions,
      healthyServices: (stats.serviceHealth as unknown as any[]).filter((h: any) => h.healthy).length,
    });
  }
}

// Global error recovery system instance
export const errorRecoverySystem = ErrorRecoverySystem.getInstance();

// Convenience functions
export async function executeWithRecovery<T>(
  serviceName: string,
  operation: () => Promise<T>,
  options?: Parameters<ErrorRecoverySystem['executeWithRecovery']>[2]
): Promise<RetryResult<T>> {
  return errorRecoverySystem.executeWithRecovery(serviceName, operation, options);
}

export function registerFallbackServices(
  serviceName: string,
  services: FallbackService[]
): void {
  errorRecoverySystem.registerFallbackServices(serviceName, services);
}

export function getCircuitBreakerState(serviceName: string): CircuitBreakerState {
  return errorRecoverySystem.getCircuitBreakerState(serviceName);
}

export function getRecoveryStatistics(): ReturnType<ErrorRecoverySystem['getRecoveryStatistics']> {
  return errorRecoverySystem.getRecoveryStatistics();
}

export function getServiceHealth(serviceName: string): ServiceHealth | null {
  return errorRecoverySystem.getServiceHealth(serviceName);
}

export function getAllServiceHealth(): ServiceHealth[] {
  return errorRecoverySystem.getAllServiceHealth();
}
