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
export type { ErrorContext } from './types';

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
} from './messages';
export type { UserErrorMessage } from './messages';

// Error context and providers
export {
  ErrorProvider,
  useError,
  useAsyncError,
  ErrorBoundary,
} from './context';

// Backward compatibility with existing error helpers
export { ok, fail, asResponse, toHttpResponse } from '../errors';
export type { Ok, Fail } from '../errors';

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

// Import the classes for factory use
import {
  ValidationError as ValidErr,
  AuthenticationError as AuthErr,
  AuthorizationError as AuthzErr,
  DatabaseError as DbErr,
  ExternalServiceError as ExtErr,
  NetworkError as NetErr,
  BusinessLogicError as BizErr,
  NotFoundError as NotFoundErr,
  RateLimitError as RateErr,
  SecurityError as SecErr,
  SystemError as SysErr,
  ConflictError as ConflictErr,
} from './types';

/**
 * Convenience factory functions for common error types
 */
export const createError = {
  validation: (message: string, fieldErrors: Record<string, string[]> = {}, context: Record<string, any> = {}) =>
    new ValidErr(message, fieldErrors, context),
    
  authentication: (message = 'Authentication failed', context: Record<string, any> = {}) =>
    new AuthErr(message, context),
    
  authorization: (message = 'Access denied', context: Record<string, any> = {}) =>
    new AuthzErr(message, context),
    
  database: (message: string, operation?: string, table?: string, context: Record<string, any> = {}) =>
    new DbErr(message, operation, table, context),
    
  externalService: (message: string, serviceName: string, statusCode?: number, context: Record<string, any> = {}) =>
    new ExtErr(message, serviceName, statusCode, context),
    
  network: (message: string, timeout = false, context: Record<string, any> = {}) =>
    new NetErr(message, timeout, context),
    
  businessLogic: (message: string, businessRule?: string, context: Record<string, any> = {}, userSafeMessage?: string) =>
    new BizErr(message, businessRule, context, userSafeMessage),
    
  notFound: (message = 'Resource not found', resource?: string, resourceId?: string, context: Record<string, any> = {}) =>
    new NotFoundErr(message, resource, resourceId, context),
    
  rateLimit: (message: string, limit: number, remaining: number, resetTime: Date, context: Record<string, any> = {}) =>
    new RateErr(message, limit, remaining, resetTime, context),
    
  security: (message: string, securityEvent: string, context: Record<string, any> = {}) =>
    new SecErr(message, securityEvent, context),
    
  system: (message = 'System error occurred', context: Record<string, any> = {}) =>
    new SysErr(message, context),
    
  conflict: (message = 'Resource conflict', conflictType?: string, context: Record<string, any> = {}) =>
    new ConflictErr(message, conflictType, context),
};

// Note: UI components can be imported directly from components/ui/error-notification