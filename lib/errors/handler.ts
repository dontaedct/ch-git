/**
 * Unified Error Handler
 * 
 * Central error processing system that handles logging, monitoring, 
 * user notifications, and error response formatting.
 */

import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { Logger } from '../logger';
import {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  isAppError,
  isOperationalError,
  SystemError,
  createErrorContext
} from './types';

// Create specialized loggers for error handling
const errorLogger = Logger.security();
const systemLogger = Logger.create({ component: 'error-handler' });

/**
 * Enhanced error information for logging and monitoring
 */
interface ErrorInfo {
  correlationId: string;
  name: string;
  message: string;
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  httpStatus: number;
  stack?: string;
  context: ErrorContext;
  isOperational: boolean;
  retryable: boolean;
  userSafeMessage: string;
  timestamp: string;
}

/**
 * Error handling configuration
 */
interface ErrorHandlerConfig {
  logStackTrace?: boolean;
  includeContext?: boolean;
  sanitizeHeaders?: boolean;
  enableMonitoring?: boolean;
  maxStackTraceLength?: number;
}

const defaultConfig: ErrorHandlerConfig = {
  logStackTrace: true,
  includeContext: true,
  sanitizeHeaders: true,
  enableMonitoring: true,
  maxStackTraceLength: 2000,
};

/**
 * Unified Error Handler Class
 */
export class UnifiedErrorHandler {
  private config: ErrorHandlerConfig;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Process any error and convert it to AppError
   */
  processError(error: unknown, context: ErrorContext = {}): AppError {
    // If already an AppError, enhance with context
    if (isAppError(error)) {
      // Create a new AppError with enhanced context since context is readonly
      const enhancedError = Object.create(Object.getPrototypeOf(error));
      Object.assign(enhancedError, error);
      enhancedError.context = { ...error.context, ...context };
      return enhancedError;
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
      return new SystemError(
        error.message,
        createErrorContext(undefined, {
          ...context,
          originalError: error.name,
          stack: error.stack
        })
      );
    }

    // Handle string errors
    if (typeof error === 'string') {
      return new SystemError(
        error,
        createErrorContext(undefined, context)
      );
    }

    // Handle unknown errors
    return new SystemError(
      'Unknown error occurred',
      createErrorContext(undefined, {
        ...context,
        originalError: typeof error,
        errorValue: String(error)
      })
    );
  }

  /**
   * Log error with appropriate severity and context
   */
  logError(error: AppError): void {
    const errorInfo: ErrorInfo = {
      correlationId: error.correlationId,
      name: error.name,
      message: error.message,
      code: error.code,
      category: error.category,
      severity: error.severity,
      httpStatus: error.httpStatus,
      stack: this.config.logStackTrace ? this.truncateStackTrace(error.stack) : undefined,
      context: this.sanitizeContext(error.context),
      isOperational: error.isOperational,
      retryable: error.retryable,
      userSafeMessage: error.getUserSafeMessage(),
      timestamp: error.timestamp
    };

    // Choose appropriate logger based on severity and category
    const logger = this.getLoggerForError(error);

    // Log with appropriate severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.fatal('Critical error occurred', errorInfo);
        break;
      case ErrorSeverity.HIGH:
        logger.error('High severity error occurred', errorInfo);
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn('Medium severity error occurred', errorInfo);
        break;
      case ErrorSeverity.LOW:
        logger.info('Low severity error occurred', errorInfo);
        break;
      default:
        logger.error('Error occurred', errorInfo);
    }

    // Special handling for security errors
    if (error.category === ErrorCategory.SECURITY) {
      this.handleSecurityError(error);
    }

    // Monitor error patterns for alerting
    if (this.config.enableMonitoring) {
      this.monitorErrorPattern(error);
    }
  }

  /**
   * Create HTTP response from AppError
   */
  createHttpResponse(error: AppError): NextResponse {
    const response = {
      error: {
        message: error.shouldExposeToUser() ? error.getUserSafeMessage() : 'An error occurred',
        code: error.code,
        correlationId: error.correlationId,
        retryable: error.retryable,
        timestamp: error.timestamp
      }
    };

    // Include additional details in development
    if (process.env.NODE_ENV === 'development') {
      (response.error as any).details = {
        originalMessage: error.message,
        category: error.category,
        severity: error.severity,
        context: error.context
      };
    }

    return NextResponse.json(response, { 
      status: error.httpStatus,
      headers: {
        'X-Correlation-ID': error.correlationId,
        'X-Error-Code': error.code,
        'X-Retryable': error.retryable.toString(),
      }
    });
  }

  /**
   * Handle errors in API routes
   */
  handleApiError(error: unknown, req?: NextRequest): NextResponse {
    const context = req ? createErrorContext(req) : {};
    const appError = this.processError(error, context);
    
    this.logError(appError);
    return this.createHttpResponse(appError);
  }

  /**
   * Handle errors in server components/actions  
   */
  handleServerError(error: unknown, context: ErrorContext = {}): void {
    const appError = this.processError(error, context);
    this.logError(appError);
    
    // For server errors, we might want to trigger notifications
    if (appError.severity === ErrorSeverity.CRITICAL) {
      this.triggerCriticalErrorAlert(appError);
    }
  }

  /**
   * Handle errors in client components
   */
  handleClientError(error: unknown, context: ErrorContext = {}): AppError {
    const appError = this.processError(error, context);
    
    // For client errors, we log but don't expose internal details
    this.logError(appError);
    
    return appError;
  }

  /**
   * Get appropriate logger based on error characteristics
   */
  private getLoggerForError(error: AppError) {
    if (error.category === ErrorCategory.SECURITY) {
      return errorLogger;
    }
    
    if (error.severity === ErrorSeverity.CRITICAL || !error.isOperational) {
      return systemLogger;
    }
    
    return Logger.create({ 
      component: 'error-handler',
      category: error.category 
    });
  }

  /**
   * Handle security-specific error processing
   */
  private handleSecurityError(error: AppError): void {
    // Security errors get special logging treatment
    errorLogger.error('Security incident detected', {
      correlationId: error.correlationId,
      securityEvent: (error as any).securityEvent || 'unknown',
      context: this.sanitizeContext(error.context, true),
      severity: error.severity,
      timestamp: error.timestamp
    });

    // You could integrate with security monitoring tools here
    // Example: await securityMonitoring.reportIncident(error);
  }

  /**
   * Monitor error patterns for alerting
   */
  private monitorErrorPattern(error: AppError): void {
    // This could be enhanced to integrate with monitoring systems
    // like Datadog, New Relic, or custom alerting
    
    // Example: Track error rates by category
    const metricsLogger = Logger.business();
    metricsLogger.info('Error metrics', {
      category: error.category,
      severity: error.severity,
      code: error.code,
      retryable: error.retryable,
      correlationId: error.correlationId
    });
  }

  /**
   * Trigger alerts for critical errors
   */
  private async triggerCriticalErrorAlert(error: AppError): Promise<void> {
    try {
      // This could integrate with alerting systems like PagerDuty, Slack, etc.
      systemLogger.fatal('CRITICAL ERROR ALERT', {
        correlationId: error.correlationId,
        message: error.message,
        context: error.context,
        timestamp: error.timestamp
      });

      // Example webhook notification (if configured)
      if (process.env.CRITICAL_ERROR_WEBHOOK_URL) {
        // await fetch(process.env.CRITICAL_ERROR_WEBHOOK_URL, { ... });
      }
    } catch (alertError) {
      systemLogger.error('Failed to send critical error alert', {
        originalError: error.correlationId,
        alertError: alertError instanceof Error ? alertError.message : String(alertError)
      });
    }
  }

  /**
   * Sanitize error context to remove sensitive information
   */
  private sanitizeContext(context: ErrorContext, extraSensitive = false): ErrorContext {
    if (!this.config.includeContext) {
      return { timestamp: context.timestamp };
    }

    const sanitized = { ...context };

    // Remove sensitive data
    if (sanitized.additionalData) {
      const sensitive = ['password', 'token', 'secret', 'key', 'authorization', 'cookie', 'session'];
      if (extraSensitive) {
        sensitive.push('email', 'phone', 'ssn', 'creditCard');
      }

      sensitive.forEach(field => {
        if (sanitized.additionalData?.[field]) {
          sanitized.additionalData[field] = '[REDACTED]';
        }
      });
    }

    // Sanitize headers if requested
    if (this.config.sanitizeHeaders) {
      if (sanitized.userAgent) {
        sanitized.userAgent = sanitized.userAgent.substring(0, 100) + '...';
      }
    }

    return sanitized;
  }

  /**
   * Truncate stack trace to prevent log bloat
   */
  private truncateStackTrace(stack?: string): string | undefined {
    if (!stack || !this.config.maxStackTraceLength) {
      return stack;
    }

    return stack.length > this.config.maxStackTraceLength
      ? stack.substring(0, this.config.maxStackTraceLength) + '\n... (truncated)'
      : stack;
  }
}

// Global error handler instance
export const errorHandler = new UnifiedErrorHandler();

/**
 * Convenience functions for common error handling patterns
 */
export function handleApiError(error: unknown, req?: NextRequest): NextResponse {
  return errorHandler.handleApiError(error, req);
}

export function handleServerError(error: unknown, context: ErrorContext = {}): void {
  return errorHandler.handleServerError(error, context);
}

export function handleClientError(error: unknown, context: ErrorContext = {}): AppError {
  return errorHandler.handleClientError(error, context);
}

export function processError(error: unknown, context: ErrorContext = {}): AppError {
  return errorHandler.processError(error, context);
}

/**
 * Middleware wrapper for API routes
 */
export function withErrorHandler(handler: (req: NextRequest, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return handleApiError(error, req);
    }
  };
}

/**
 * Higher-order component wrapper for error handling
 */
export function withErrorBoundary<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback?: React.ComponentType<{ error: AppError; reset: () => void }>
): React.ComponentType<T> {
  return function ErrorBoundaryWrapper(props: T) {
    // This would be implemented with React Error Boundary
    // For now, this is a placeholder for the concept
    return React.createElement(Component, props);
  };
}