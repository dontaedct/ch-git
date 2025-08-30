/**
 * Unified Error Handling System
 * 
 * Provides comprehensive error types, error hierarchy, and correlation ID tracking
 * for the DCT Micro-Apps platform.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Error severity levels for categorizing errors
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium', 
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error categories for organizing error types
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication', 
  AUTHORIZATION = 'authorization',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  NETWORK = 'network',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
  SECURITY = 'security',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  INTERNAL = 'internal'
}

/**
 * Error context interface for additional error information
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  traceId?: string;
  route?: string;
  method?: string;
  userAgent?: string;
  ip?: string;
  timestamp?: string;
  digest?: string;
  stack?: string;
  componentStack?: string;
  source?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  severity?: ErrorSeverity;
  originalError?: string;
  errorValue?: string;
  additionalData?: Record<string, any>;
}

/**
 * Base AppError class - all application errors should extend this
 */
export abstract class AppError extends Error {
  public readonly correlationId: string;
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly httpStatus: number;
  public readonly isOperational: boolean;
  public readonly context: ErrorContext;
  public readonly userSafeMessage?: string;
  public readonly retryable: boolean;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    httpStatus: number = 500,
    isOperational: boolean = true,
    context: ErrorContext = {},
    userSafeMessage?: string,
    retryable: boolean = false
  ) {
    super(message);
    
    this.name = this.constructor.name;
    this.correlationId = uuidv4();
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.httpStatus = httpStatus;
    this.isOperational = isOperational;
    this.context = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString()
    };
    this.userSafeMessage = userSafeMessage;
    this.retryable = retryable;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      correlationId: this.correlationId,
      category: this.category,
      severity: this.severity,
      httpStatus: this.httpStatus,
      userSafeMessage: this.userSafeMessage,
      retryable: this.retryable,
      timestamp: this.timestamp,
      context: this.context
    };
  }

  /**
   * Get user-safe message or fallback
   */
  getUserSafeMessage(): string {
    return this.userSafeMessage || 'An unexpected error occurred. Please try again.';
  }

  /**
   * Check if error should be exposed to user
   */
  shouldExposeToUser(): boolean {
    return this.isOperational && this.severity !== ErrorSeverity.CRITICAL;
  }
}

/**
 * Validation Error - for input validation failures
 */
export class ValidationError extends AppError {
  public readonly fieldErrors: Record<string, string[]>;

  constructor(
    message: string,
    fieldErrors: Record<string, string[]> = {},
    context: ErrorContext = {}
  ) {
    super(
      message,
      'VALIDATION_ERROR',
      ErrorCategory.VALIDATION,
      ErrorSeverity.LOW,
      400,
      true,
      context,
      'Please check your input and try again.',
      false
    );
    this.fieldErrors = fieldErrors;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      fieldErrors: this.fieldErrors
    };
  }
}

/**
 * Authentication Error - for auth failures
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context: ErrorContext = {}) {
    super(
      message,
      'AUTHENTICATION_ERROR',
      ErrorCategory.AUTHENTICATION,
      ErrorSeverity.MEDIUM,
      401,
      true,
      context,
      'Please log in to continue.',
      false
    );
  }
}

/**
 * Authorization Error - for access control failures  
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context: ErrorContext = {}) {
    super(
      message,
      'AUTHORIZATION_ERROR',
      ErrorCategory.AUTHORIZATION,
      ErrorSeverity.MEDIUM,
      403,
      true,
      context,
      'You do not have permission to perform this action.',
      false
    );
  }
}

/**
 * Database Error - for database operation failures
 */
export class DatabaseError extends AppError {
  public readonly operation?: string;
  public readonly table?: string;

  constructor(
    message: string,
    operation?: string,
    table?: string,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'DATABASE_ERROR',
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      500,
      true,
      context,
      'A database error occurred. Please try again later.',
      true
    );
    this.operation = operation;
    this.table = table;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      table: this.table
    };
  }
}

/**
 * External Service Error - for third-party service failures
 */
export class ExternalServiceError extends AppError {
  public readonly serviceName: string;
  public readonly statusCode?: number;

  constructor(
    message: string,
    serviceName: string,
    statusCode?: number,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'EXTERNAL_SERVICE_ERROR',
      ErrorCategory.EXTERNAL_SERVICE,
      ErrorSeverity.HIGH,
      502,
      true,
      context,
      'An external service is currently unavailable. Please try again later.',
      true
    );
    this.serviceName = serviceName;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      serviceName: this.serviceName,
      statusCode: this.statusCode
    };
  }
}

/**
 * Network Error - for network-related failures
 */
export class NetworkError extends AppError {
  public readonly timeout?: boolean;

  constructor(
    message: string,
    timeout: boolean = false,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'NETWORK_ERROR',
      ErrorCategory.NETWORK,
      ErrorSeverity.HIGH,
      503,
      true,
      context,
      timeout ? 'Request timed out. Please try again.' : 'Network error occurred. Please check your connection.',
      true
    );
    this.timeout = timeout;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      timeout: this.timeout
    };
  }
}

/**
 * Business Logic Error - for domain-specific business rule violations
 */
export class BusinessLogicError extends AppError {
  public readonly businessRule?: string;

  constructor(
    message: string,
    businessRule?: string,
    context: ErrorContext = {},
    userSafeMessage?: string
  ) {
    super(
      message,
      'BUSINESS_LOGIC_ERROR',
      ErrorCategory.BUSINESS_LOGIC,
      ErrorSeverity.MEDIUM,
      422,
      true,
      context,
      userSafeMessage || 'This action cannot be completed due to business rules.',
      false
    );
    this.businessRule = businessRule;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      businessRule: this.businessRule
    };
  }
}

/**
 * Not Found Error - for missing resources
 */
export class NotFoundError extends AppError {
  public readonly resource?: string;
  public readonly resourceId?: string;

  constructor(
    message: string = 'Resource not found',
    resource?: string,
    resourceId?: string,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'NOT_FOUND_ERROR',
      ErrorCategory.NOT_FOUND,
      ErrorSeverity.LOW,
      404,
      true,
      context,
      'The requested item could not be found.',
      false
    );
    this.resource = resource;
    this.resourceId = resourceId;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      resource: this.resource,
      resourceId: this.resourceId
    };
  }
}

/**
 * Rate Limit Error - for rate limiting violations
 */
export class RateLimitError extends AppError {
  public readonly limit: number;
  public readonly remaining: number;
  public readonly resetTime: Date;

  constructor(
    message: string = 'Rate limit exceeded',
    limit: number,
    remaining: number,
    resetTime: Date,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'RATE_LIMIT_ERROR',
      ErrorCategory.RATE_LIMIT,
      ErrorSeverity.MEDIUM,
      429,
      true,
      context,
      'Too many requests. Please try again later.',
      true
    );
    this.limit = limit;
    this.remaining = remaining;
    this.resetTime = resetTime;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      limit: this.limit,
      remaining: this.remaining,
      resetTime: this.resetTime.toISOString()
    };
  }
}

/**
 * Security Error - for security-related incidents
 */
export class SecurityError extends AppError {
  public readonly securityEvent: string;

  constructor(
    message: string,
    securityEvent: string,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'SECURITY_ERROR',
      ErrorCategory.SECURITY,
      ErrorSeverity.CRITICAL,
      403,
      true,
      context,
      'Security violation detected. This incident has been logged.',
      false
    );
    this.securityEvent = securityEvent;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      securityEvent: this.securityEvent
    };
  }
}

/**
 * System Error - for unexpected system failures
 */
export class SystemError extends AppError {
  constructor(
    message: string = 'System error occurred',
    context: ErrorContext = {}
  ) {
    super(
      message,
      'SYSTEM_ERROR',
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      500,
      false,
      context,
      'An unexpected system error occurred. Our team has been notified.',
      false
    );
  }
}

/**
 * Conflict Error - for resource conflicts
 */
export class ConflictError extends AppError {
  public readonly conflictType?: string;

  constructor(
    message: string = 'Resource conflict',
    conflictType?: string,
    context: ErrorContext = {}
  ) {
    super(
      message,
      'CONFLICT_ERROR',
      ErrorCategory.CONFLICT,
      ErrorSeverity.MEDIUM,
      409,
      true,
      context,
      'A conflict occurred. The resource may have been modified by another user.',
      false
    );
    this.conflictType = conflictType;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      conflictType: this.conflictType
    };
  }
}

/**
 * Type guard to check if error is AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError;
}

/**
 * Type guard to check if error is operational
 */
export function isOperationalError(error: any): boolean {
  if (isAppError(error)) {
    return error.isOperational;
  }
  return false;
}

/**
 * Helper to create context from request/response
 */
export function createErrorContext(req?: any, additionalData?: Record<string, any>): ErrorContext {
  const context: ErrorContext = {
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  if (req) {
    // Handle Next.js Request object
    if (req.url) context.route = req.url;
    if (req.method) context.method = req.method;
    if (req.headers) {
      context.userAgent = req.headers.get?.('user-agent') || req.headers['user-agent'];
      context.ip = req.headers.get?.('x-forwarded-for') || req.headers['x-forwarded-for'] || 
                   req.headers.get?.('x-real-ip') || req.headers['x-real-ip'];
    }
    
    // Try to get trace ID from OpenTelemetry if available (only in server environment)
    if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        const getCurrentTraceId = require('../observability/otel').getCurrentTraceId;
        if (getCurrentTraceId) {
          context.traceId = getCurrentTraceId();
        }
      } catch (error) {
        // OpenTelemetry not available, skip traceId
      }
    }
  }

  return context;
}