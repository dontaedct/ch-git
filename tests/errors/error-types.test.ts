/**
 * Error Types Tests
 * 
 * Tests for AppError classes and error type functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
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
} from '../../lib/errors/types';

describe('AppError Base Class', () => {
  it('should create an AppError with required properties', () => {
    const error = new ValidationError('Test error message');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Test error message');
    expect(error.name).toBe('ValidationError');
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.category).toBe(ErrorCategory.VALIDATION);
    expect(error.severity).toBe(ErrorSeverity.LOW);
    expect(error.httpStatus).toBe(400);
    expect(error.isOperational).toBe(true);
    expect(error.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(typeof error.timestamp).toBe('string');
  });

  it('should have proper stack trace', () => {
    const error = new ValidationError('Test error');
    expect(error.stack).toContain('ValidationError');
    expect(error.stack).toContain('Test error');
  });

  it('should convert to JSON properly', () => {
    const error = new ValidationError('Test error', {}, { userId: '123' });
    const json = error.toJSON();
    
    expect(json).toEqual({
      name: 'ValidationError',
      message: 'Test error',
      code: 'VALIDATION_ERROR',
      correlationId: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
      httpStatus: 400,
      userSafeMessage: 'Please check your input and try again.',
      retryable: false,
      timestamp: expect.any(String),
      context: expect.objectContaining({
        userId: '123',
        timestamp: expect.any(String)
      }),
      fieldErrors: expect.any(Object)
    });
  });

  it('should return user safe message', () => {
    const error = new ValidationError('Internal validation failed');
    expect(error.getUserSafeMessage()).toBe('Please check your input and try again.');
  });

  it('should determine if error should be exposed to user', () => {
    const operationalError = new ValidationError('Test');
    const nonOperationalError = new SystemError('Test');
    
    expect(operationalError.shouldExposeToUser()).toBe(true);
    expect(nonOperationalError.shouldExposeToUser()).toBe(false);
  });
});

describe('Specific Error Types', () => {
  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      const fieldErrors = {
        email: ['Email is required', 'Email format is invalid'],
        password: ['Password is too short']
      };
      const error = new ValidationError('Validation failed', fieldErrors);
      
      expect(error.fieldErrors).toEqual(fieldErrors);
      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.httpStatus).toBe(400);
      expect(error.retryable).toBe(false);
    });

    it('should include field errors in JSON', () => {
      const fieldErrors = { name: ['Required'] };
      const error = new ValidationError('Test', fieldErrors);
      const json = error.toJSON();
      
      expect(json.fieldErrors).toEqual(fieldErrors);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with defaults', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication failed');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.category).toBe(ErrorCategory.AUTHENTICATION);
      expect(error.httpStatus).toBe(401);
      expect(error.getUserSafeMessage()).toBe('Please log in to continue.');
    });

    it('should create authentication error with custom message', () => {
      const error = new AuthenticationError('Invalid token');
      
      expect(error.message).toBe('Invalid token');
      expect(error.getUserSafeMessage()).toBe('Please log in to continue.');
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Insufficient permissions');
      
      expect(error.message).toBe('Insufficient permissions');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.category).toBe(ErrorCategory.AUTHORIZATION);
      expect(error.httpStatus).toBe(403);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error with operation details', () => {
      const error = new DatabaseError('Connection timeout', 'SELECT', 'users');
      
      expect(error.message).toBe('Connection timeout');
      expect(error.operation).toBe('SELECT');
      expect(error.table).toBe('users');
      expect(error.category).toBe(ErrorCategory.DATABASE);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.retryable).toBe(true);
    });

    it('should include operation details in JSON', () => {
      const error = new DatabaseError('Test', 'INSERT', 'clients');
      const json = error.toJSON();
      
      expect(json.operation).toBe('INSERT');
      expect(json.table).toBe('clients');
    });
  });

  describe('ExternalServiceError', () => {
    it('should create external service error', () => {
      const error = new ExternalServiceError('Service unavailable', 'stripe', 503);
      
      expect(error.message).toBe('Service unavailable');
      expect(error.serviceName).toBe('stripe');
      expect(error.statusCode).toBe(503);
      expect(error.category).toBe(ErrorCategory.EXTERNAL_SERVICE);
      expect(error.retryable).toBe(true);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with timeout flag', () => {
      const error = new NetworkError('Request timeout', true);
      
      expect(error.message).toBe('Request timeout');
      expect(error.timeout).toBe(true);
      expect(error.category).toBe(ErrorCategory.NETWORK);
      expect(error.getUserSafeMessage()).toBe('Request timed out. Please try again.');
    });

    it('should create network error without timeout', () => {
      const error = new NetworkError('Connection failed', false);
      
      expect(error.timeout).toBe(false);
      expect(error.getUserSafeMessage()).toBe('Network error occurred. Please check your connection.');
    });
  });

  describe('BusinessLogicError', () => {
    it('should create business logic error', () => {
      const error = new BusinessLogicError(
        'Cannot book overlapping appointments',
        'no-overlapping-appointments',
        {},
        'This time slot conflicts with an existing appointment.'
      );
      
      expect(error.businessRule).toBe('no-overlapping-appointments');
      expect(error.getUserSafeMessage()).toBe('This time slot conflicts with an existing appointment.');
      expect(error.category).toBe(ErrorCategory.BUSINESS_LOGIC);
      expect(error.httpStatus).toBe(422);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource details', () => {
      const error = new NotFoundError('User not found', 'user', '12345');
      
      expect(error.resource).toBe('user');
      expect(error.resourceId).toBe('12345');
      expect(error.category).toBe(ErrorCategory.NOT_FOUND);
      expect(error.httpStatus).toBe(404);
    });
  });

  describe('RateLimitError', () => {
    const resetTime = new Date('2024-01-01T10:00:00Z');
    
    it('should create rate limit error', () => {
      const error = new RateLimitError('Rate limit exceeded', 100, 0, resetTime);
      
      expect(error.limit).toBe(100);
      expect(error.remaining).toBe(0);
      expect(error.resetTime).toBe(resetTime);
      expect(error.category).toBe(ErrorCategory.RATE_LIMIT);
      expect(error.httpStatus).toBe(429);
      expect(error.retryable).toBe(true);
    });

    it('should include rate limit details in JSON', () => {
      const error = new RateLimitError('Test', 50, 10, resetTime);
      const json = error.toJSON();
      
      expect(json.limit).toBe(50);
      expect(json.remaining).toBe(10);
      expect(json.resetTime).toBe(resetTime.toISOString());
    });
  });

  describe('SecurityError', () => {
    it('should create security error', () => {
      const error = new SecurityError('Suspicious activity detected', 'multiple-failed-logins');
      
      expect(error.securityEvent).toBe('multiple-failed-logins');
      expect(error.category).toBe(ErrorCategory.SECURITY);
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.httpStatus).toBe(403);
    });
  });

  describe('SystemError', () => {
    it('should create system error with defaults', () => {
      const error = new SystemError();
      
      expect(error.message).toBe('System error occurred');
      expect(error.category).toBe(ErrorCategory.SYSTEM);
      expect(error.severity).toBe(ErrorSeverity.CRITICAL);
      expect(error.isOperational).toBe(false);
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Resource already exists', 'duplicate-email');
      
      expect(error.conflictType).toBe('duplicate-email');
      expect(error.category).toBe(ErrorCategory.CONFLICT);
      expect(error.httpStatus).toBe(409);
    });
  });
});

describe('Error Utilities', () => {
  describe('isAppError', () => {
    it('should identify AppError instances', () => {
      const appError = new ValidationError('Test');
      const regularError = new Error('Test');
      const stringError = 'Test error';
      
      expect(isAppError(appError)).toBe(true);
      expect(isAppError(regularError)).toBe(false);
      expect(isAppError(stringError)).toBe(false);
    });
  });

  describe('isOperationalError', () => {
    it('should identify operational errors', () => {
      const operationalError = new ValidationError('Test');
      const nonOperationalError = new SystemError('Test');
      const regularError = new Error('Test');
      
      expect(isOperationalError(operationalError)).toBe(true);
      expect(isOperationalError(nonOperationalError)).toBe(false);
      expect(isOperationalError(regularError)).toBe(false);
    });
  });

  describe('createErrorContext', () => {
    it('should create error context from request object', () => {
      const mockReq = {
        url: '/api/test',
        method: 'POST',
        headers: {
          get: jest.fn()
            .mockReturnValueOnce('Mozilla/5.0')
            .mockReturnValueOnce('192.168.1.1')
        }
      };

      const context = createErrorContext(mockReq, { customField: 'value' });
      
      expect(context).toEqual({
        timestamp: expect.any(String),
        customField: 'value',
        route: '/api/test',
        method: 'POST',
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1'
      });
    });

    it('should create empty context when no request provided', () => {
      const context = createErrorContext();
      
      expect(context).toEqual({
        timestamp: expect.any(String)
      });
    });

    it('should handle additional data', () => {
      const context = createErrorContext(undefined, { userId: '123', action: 'login' });
      
      expect(context).toEqual({
        timestamp: expect.any(String),
        userId: '123',
        action: 'login'
      });
    });
  });
});

describe('Error Context Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should merge context from constructor and error creation', () => {
    const initialContext = { userId: '123' };
    const error = new ValidationError('Test', {}, initialContext);
    
    expect(error.context).toEqual(expect.objectContaining({
      userId: '123',
      timestamp: expect.any(String)
    }));
  });

  it('should preserve timestamp in context', () => {
    const error = new ValidationError('Test');
    const timestamp = error.context.timestamp;
    
    expect(timestamp).toBeDefined();
    expect(new Date(timestamp!)).toBeInstanceOf(Date);
  });
});
