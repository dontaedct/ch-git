/**
 * Legacy Error Handling (Deprecated)
 * 
 * This file provides backward compatibility for the legacy error handling system.
 * New code should use the unified error handling system from @/lib/errors/index.
 * 
 * @deprecated Use AppError classes and unified error handling instead
 */

export type Ok<T = unknown> = { ok: true; data?: T };
export type Fail = { ok: false; code: string; message: string };

export const ok = <T = unknown>(data?: T): Ok<T> => ({ ok: true, data });
export const fail = (message: string, code = "ERR"): Fail => ({ ok: false, code, message });

// If a caller expects a Response, use this wrapper.
export const asResponse = (f: Fail, status = 400): Response => Response.json(f, { status });

// Convert Fail to HTTP Response
export const toHttpResponse = (f: Fail, status = 400): Response => Response.json(f, { status });

/**
 * Migration helpers for transitioning to the new error system
 */
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  DatabaseError, 
  SystemError,
  handleApiError as newHandleApiError 
} from './errors/index';

/**
 * Convert legacy Fail to AppError
 * @deprecated Use AppError constructors directly
 */
export function failToAppError(f: Fail): ValidationError | AuthenticationError | AuthorizationError | DatabaseError | SystemError {
  switch (f.code) {
    case 'VALIDATION_ERROR':
      return new ValidationError(f.message);
    case 'AUTHENTICATION_ERROR':
      return new AuthenticationError(f.message);
    case 'AUTHORIZATION_ERROR':
    case 'FORBIDDEN':
      return new AuthorizationError(f.message);
    case 'DATABASE_ERROR':
      return new DatabaseError(f.message);
    default:
      return new SystemError(f.message);
  }
}

/**
 * Enhanced response helper that uses the new error system
 * @deprecated Use errorResponse helpers from @/lib/errors/index
 */
export const enhancedResponse = (f: Fail, status = 400): Response => {
  const appError = failToAppError(f);
  return newHandleApiError(appError);
};
