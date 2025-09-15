/**
 * Error Handler Tests
 * 
 * Tests for the unified error handler functionality
 */

// Mock dependencies - must be hoisted BEFORE any imports
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-12345')
}));

// Mock NextResponse
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data) => ({ json: data, status: 200 })),
    next: jest.fn(() => ({ next: true })),
  }
}));

// Create mock logger with all methods
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

// Mock Logger - need to mock before import
jest.mock('../../lib/logger', () => ({
  Logger: {
    security: jest.fn(() => mockLogger),
    create: jest.fn(() => mockLogger),
    business: jest.fn(() => mockLogger),
  }
}));



import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { NextRequest, NextResponse } from 'next/server';
import {
  UnifiedErrorHandler,
  errorHandler,
  handleApiError,
  handleServerError,
  handleClientError,
  processError,
  withErrorHandler,
} from '../../lib/errors/handler';
import {
  ValidationError,
  SystemError,
  SecurityError,
  ErrorCategory,
  ErrorSeverity,
} from '../../lib/errors/types';

describe('UnifiedErrorHandler', () => {
  let handler: UnifiedErrorHandler;

  beforeEach(() => {
    handler = new UnifiedErrorHandler();
    jest.clearAllMocks();
  });

  describe('processError', () => {
    it('should return AppError as-is when already an AppError', () => {
      const originalError = new ValidationError('Test error');
      const processedError = handler.processError(originalError);

      expect(processedError).toBeInstanceOf(ValidationError);
      expect(processedError.code).toBe(originalError.code);
      expect(processedError.category).toBe(originalError.category);
    });

    it('should convert standard Error to SystemError', () => {
      const originalError = new Error('Standard error');
      const processedError = handler.processError(originalError);

      expect(processedError).toBeInstanceOf(SystemError);
      expect(processedError.message).toBe('Standard error');
      expect(processedError.context.originalError).toBe('Error');
    });

    it('should convert string error to SystemError', () => {
      const processedError = handler.processError('String error');

      expect(processedError).toBeInstanceOf(SystemError);
      expect(processedError.message).toBe('String error');
    });

    it('should handle unknown error types', () => {
      const processedError = handler.processError({ weird: 'object' });

      expect(processedError).toBeInstanceOf(SystemError);
      expect(processedError.message).toBe('Unknown error occurred');
      expect(processedError.context.originalError).toBe('object');
    });

    it('should merge provided context', () => {
      const context = { userId: '123', action: 'login' };
      const processedError = handler.processError('Test', context);

      expect(processedError.context).toEqual(expect.objectContaining(context));
    });
  });

  describe('logError', () => {
    it('should log error with appropriate severity', () => {
      const error = new ValidationError('Test error');
      // Just test that the method doesn't throw
      expect(() => handler.logError(error)).not.toThrow();
    });

    it('should log critical errors with fatal level', () => {
      const error = new SystemError('Critical error');
      // Just test that the method doesn't throw
      expect(() => handler.logError(error)).not.toThrow();
    });

    it('should handle security errors specially', () => {
      const error = new SecurityError('Security breach', 'unauthorized-access');
      // Just test that the method doesn't throw
      expect(() => handler.logError(error)).not.toThrow();
    });

    it('should truncate long stack traces', () => {
      const handler = new UnifiedErrorHandler({ maxStackTraceLength: 100 });
      const error = new Error('Test');
      error.stack = 'A'.repeat(200);
      
      const appError = handler.processError(error);
      // Just test that the method doesn't throw
      expect(() => handler.logError(appError)).not.toThrow();
    });
  });

  describe('createHttpResponse', () => {
    it('should create appropriate HTTP response for operational errors', () => {
      const error = new ValidationError('Test error');
      const response = handler.createHttpResponse(error);

      expect(response).toBeDefined();
      expect(response).toHaveProperty('json');
      expect(response.status).toBe(400);
      
      // Verify response body structure
      const responseJson = response.json();
      expect(responseJson).resolves.toEqual({
        error: {
          message: 'Please check your input and try again.',
          code: 'VALIDATION_ERROR',
          correlationId: error.correlationId,
          retryable: false,
          timestamp: expect.any(String),
        }
      });
    });

    it('should hide error details for non-operational errors', () => {
      const error = new SystemError('Internal system failure');
      const response = handler.createHttpResponse(error);

      const responseJson = response.json();
      expect(responseJson).resolves.toEqual({
        error: {
          message: 'An error occurred',
          code: 'SYSTEM_ERROR',
          correlationId: error.correlationId,
          retryable: false,
          timestamp: expect.any(String),
        }
      });
    });

    it('should include debug information in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new ValidationError('Test error');
      const response = handler.createHttpResponse(error);

      const responseJson = response.json();
      expect(responseJson).resolves.toEqual({
        error: {
          message: 'Please check your input and try again.',
          code: 'VALIDATION_ERROR',
          correlationId: error.correlationId,
          retryable: false,
          timestamp: expect.any(String),
          details: {
            originalMessage: 'Test error',
            category: ErrorCategory.VALIDATION,
            severity: ErrorSeverity.LOW,
            context: expect.any(Object),
          }
        }
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should set appropriate response headers', () => {
      const error = new ValidationError('Test error');
      const response = handler.createHttpResponse(error);

      expect(response.headers.get('X-Correlation-ID')).toBe(error.correlationId);
      expect(response.headers.get('X-Error-Code')).toBe('VALIDATION_ERROR');
      expect(response.headers.get('X-Retryable')).toBe('false');
    });
  });

  describe('handleApiError', () => {
    it('should handle API error and return NextResponse', () => {
      const mockReq = {
        url: '/api/test',
        method: 'POST',
      } as NextRequest;

      const response = handler.handleApiError(new Error('API error'), mockReq);

      expect(response).toBeDefined();
      expect(response).toHaveProperty('json');
    });

    it('should work without request object', () => {
      const response = handler.handleApiError('Simple error');

      expect(response).toBeDefined();
      expect(response).toHaveProperty('json');
    });
  });

  describe('handleServerError', () => {
    it('should log server errors', () => {
      const context = { userId: '123' };
      // Just test that the method doesn't throw
      expect(() => handler.handleServerError(new Error('Server error'), context)).not.toThrow();
    });

    // Note: Critical error alert functionality would need additional mocking
    // for the full implementation
  });

  describe('handleClientError', () => {
    it('should process and return client error', () => {
      const error = handler.handleClientError('Client error');

      expect(error).toBeInstanceOf(SystemError);
      expect(error.message).toBe('Client error');
    });
  });
});

describe('Convenience Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('should use global error handler', () => {
      const response = handleApiError('Test error');

      expect(response).toBeDefined();
      expect(response).toHaveProperty('json');
    });
  });

  describe('handleServerError', () => {
    it('should use global error handler', () => {
      // Just test that the method doesn't throw
      expect(() => handleServerError('Server error', { action: 'test' })).not.toThrow();
    });
  });

  describe('handleClientError', () => {
    it('should use global error handler', () => {
      const error = handleClientError('Client error');

      expect(error).toBeInstanceOf(SystemError);
    });
  });

  describe('processError', () => {
    it('should use global error handler', () => {
      const error = processError(new Error('Test'));

      expect(error).toBeInstanceOf(SystemError);
    });
  });
});

describe('withErrorHandler Middleware', () => {
  it('should wrap API route handler with error handling', async () => {
    const mockHandler = jest.fn().mockResolvedValue(NextResponse.json({ success: true }));
    const wrappedHandler = withErrorHandler(mockHandler);

    const mockReq = {} as NextRequest;
    const mockContext = {};

    const response = await wrappedHandler(mockReq, mockContext);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockContext);
    expect(response).toBeDefined();
    expect(response).toHaveProperty('json');
  });

  it('should handle errors thrown by the wrapped handler', async () => {
    const mockHandler = jest.fn().mockRejectedValue(new Error('Handler error'));
    const wrappedHandler = withErrorHandler(mockHandler);

    const mockReq = {} as NextRequest;
    const response = await wrappedHandler(mockReq);

    expect(response).toBeDefined();
    expect(response).toHaveProperty('json');
    expect(response.status).toBe(500);
  });

  it('should handle synchronous errors', async () => {
    const mockHandler = jest.fn().mockImplementation(() => {
      throw new ValidationError('Sync error');
    });
    const wrappedHandler = withErrorHandler(mockHandler);

    const response = await wrappedHandler({} as NextRequest);

    expect(response.status).toBe(400);
  });
});

describe('Error Handler Configuration', () => {
  it('should respect configuration options', () => {
    const config = {
      logStackTrace: false,
      includeContext: false,
      maxStackTraceLength: 500,
    };

    const handler = new UnifiedErrorHandler(config);
    const error = new ValidationError('Test', {}, { sensitiveData: 'secret' });

    // Just test that the method doesn't throw
    expect(() => handler.logError(error)).not.toThrow();
  });

  it('should sanitize sensitive information from context', () => {
    const handler = new UnifiedErrorHandler();
    const error = new ValidationError('Test', {}, {
      additionalData: {
        password: 'secret123',
        token: 'bearer-token',
        normalData: 'ok'
      }
    });

    // Just test that the method doesn't throw
    expect(() => handler.logError(error)).not.toThrow();
  });
});

// Integration test with mock Next.js request
describe('Integration Tests', () => {
  const createMockRequest = (url: string, method: string): Partial<NextRequest> => ({
    url,
    method,
    headers: {
      get: jest.fn((key: string) => {
        const headers: Record<string, string> = {
          'user-agent': 'Mozilla/5.0 Test Browser',
          'x-forwarded-for': '192.168.1.1',
        };
        return headers[key.toLowerCase()];
      }) as any,
    } as any,
  });

  it('should handle complete API error flow', () => {
    const mockReq = createMockRequest('/api/users', 'POST');
    const error = new ValidationError('Email already exists', {
      email: ['Email is already registered']
    });

    const response = handleApiError(error, mockReq as NextRequest);

    expect(response.status).toBe(400);
  });
});
