/**
 * Unified Error Handling System
 * 
 * Central exports for all error handling functionality
 */

// Core error types and classes
export {
  AppError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  DatabaseError,
  ExternalServiceError,
  NetworkError,
  BusinessLogicError,
  NotFoundError,
  RateLimitError,
  SecurityError,
  SystemError,
  ConflictError,
  isAppError,
  isOperationalError,
  createErrorContext,
} from './types';

// Error handler and utilities
export {
  UnifiedErrorHandler,
  errorHandler,
  handleApiError,
  handleServerError,
  handleClientError,
  processError,
  withErrorHandler,
  withErrorBoundary,
} from './handler';

// User-safe message mapping
export {
  ErrorMessageMapper,
  type UserErrorMessage,
} from './messages';

// Error context and providers
export {
  ErrorProvider,
  useError,
  useAsyncError,
  ErrorBoundary,
} from './context';

// Backward compatibility with existing error helpers
export { ok, fail, asResponse, toHttpResponse } from '../errors';

/**
 * Legacy error handling utilities (deprecated - use new unified system)
 * These are maintained for backward compatibility but should be migrated
 */
import { ok as legacyOk, fail as legacyFail } from '../errors';

/**
 * @deprecated Use new AppError classes instead
 */
export const legacy = {
  ok: legacyOk,
  fail: legacyFail,
};

/**
 * Convenience factory functions for common error types
 */
export const createError = {
  validation: (message: string, fieldErrors?: Record<string, string[]>, context?: Record<string, any>) =>
    new ValidationError(message, fieldErrors, context),
    
  authentication: (message?: string, context?: Record<string, any>) =>
    new AuthenticationError(message, context),
    
  authorization: (message?: string, context?: Record<string, any>) =>
    new AuthorizationError(message, context),
    
  database: (message: string, operation?: string, table?: string, context?: Record<string, any>) =>
    new DatabaseError(message, operation, table, context),
    
  externalService: (message: string, serviceName: string, statusCode?: number, context?: Record<string, any>) =>
    new ExternalServiceError(message, serviceName, statusCode, context),
    
  network: (message: string, timeout?: boolean, context?: Record<string, any>) =>
    new NetworkError(message, timeout, context),
    
  businessLogic: (message: string, businessRule?: string, context?: Record<string, any>, userSafeMessage?: string) =>
    new BusinessLogicError(message, businessRule, context, userSafeMessage),
    
  notFound: (message?: string, resource?: string, resourceId?: string, context?: Record<string, any>) =>
    new NotFoundError(message, resource, resourceId, context),
    
  rateLimit: (message: string, limit: number, remaining: number, resetTime: Date, context?: Record<string, any>) =>
    new RateLimitError(message, limit, remaining, resetTime, context),
    
  security: (message: string, securityEvent: string, context?: Record<string, any>) =>
    new SecurityError(message, securityEvent, context),
    
  system: (message?: string, context?: Record<string, any>) =>
    new SystemError(message, context),
    
  conflict: (message?: string, conflictType?: string, context?: Record<string, any>) =>
    new ConflictError(message, conflictType, context),
};

/**
 * Quick error response helpers for API routes
 */
export const errorResponse = {
  badRequest: (message: string = 'Bad request', context?: Record<string, any>) =>
    handleApiError(createError.validation(message, {}, context)),
    
  unauthorized: (message?: string, context?: Record<string, any>) =>
    handleApiError(createError.authentication(message, context)),
    
  forbidden: (message?: string, context?: Record<string, any>) =>
    handleApiError(createError.authorization(message, context)),
    
  notFound: (resource?: string, resourceId?: string, context?: Record<string, any>) =>
    handleApiError(createError.notFound(undefined, resource, resourceId, context)),
    
  conflict: (message?: string, conflictType?: string, context?: Record<string, any>) =>
    handleApiError(createError.conflict(message, conflictType, context)),
    
  tooManyRequests: (limit: number, remaining: number, resetTime: Date, context?: Record<string, any>) =>
    handleApiError(createError.rateLimit('Rate limit exceeded', limit, remaining, resetTime, context)),
    
  internalServerError: (message?: string, context?: Record<string, any>) =>
    handleApiError(createError.system(message, context)),
    
  serviceUnavailable: (serviceName: string, statusCode?: number, context?: Record<string, any>) =>
    handleApiError(createError.externalService('Service unavailable', serviceName, statusCode, context)),
};

// Re-export UI components for convenience
export type {
  ErrorNotificationProps,
  ErrorToastProps,
  InlineErrorProps,
  ErrorPageProps,
} from '../../components/ui/error-notification';

export {
  ErrorNotification,
  ErrorToast,
  InlineError,
  ErrorPage,
  ValidationErrorNotification,
  NetworkErrorNotification,
  AuthErrorNotification,
  useErrorNotification,
} from '../../components/ui/error-notification';