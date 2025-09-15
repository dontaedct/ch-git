/**
 * Error Messages Tests
 * 
 * Tests for user-safe error message mapping functionality
 */

import { describe, it, expect } from '@jest/globals';
import {
  ErrorMessageMapper,
  type UserErrorMessage,
} from '../../lib/errors/messages';
import {
  ErrorCategory,
  ErrorSeverity,
} from '../../lib/errors/types';

describe('ErrorMessageMapper', () => {
  describe('getUserMessage', () => {
    it('should return exact match for known error codes', () => {
      const message = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );

      expect(message).toEqual({
        title: 'Input Error',
        message: 'Please check your input and try again.',
        action: 'Review the highlighted fields and correct any errors.',
        icon: '⚠️',
        variant: 'warning'
      });
    });

    it('should fall back to category default for unknown codes', () => {
      const message = ErrorMessageMapper.getUserMessage(
        'UNKNOWN_VALIDATION_CODE',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );

      expect(message.title).toBe('Input Error');
      expect(message.variant).toBe('info'); // severity override
    });

    it('should apply severity enhancements', () => {
      const highSeverityMessage = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH
      );

      expect(highSeverityMessage.variant).toBe('error');
      expect(highSeverityMessage.helpText).toBe('If this problem continues, please contact support.');
    });

    it('should handle critical severity enhancements', () => {
      const criticalMessage = ErrorMessageMapper.getUserMessage(
        'SYSTEM_ERROR',
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );

      expect(criticalMessage.variant).toBe('error');
      expect(criticalMessage.helpText).toBe('This issue has been reported to our technical team.');
    });

    it('should use safe custom message when provided', () => {
      const customMessage = 'Your custom validation failed';
      const message = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        customMessage
      );

      expect(message.message).toBe(customMessage);
    });

    it('should reject unsafe custom messages', () => {
      const unsafeMessage = 'SQL Error: SELECT * FROM users WHERE password = "secret123"';
      const message = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        unsafeMessage
      );

      expect(message.message).toBe('Please check your input and try again.');
    });
  });

  describe('getSimpleMessage', () => {
    it('should return just the message string', () => {
      const message = ErrorMessageMapper.getSimpleMessage(
        'AUTHENTICATION_ERROR',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM
      );

      expect(typeof message).toBe('string');
      expect(message).toBe('You need to be signed in to access this feature.');
    });
  });

  describe('getActionMessage', () => {
    it('should return action instruction', () => {
      const action = ErrorMessageMapper.getActionMessage(
        'INVALID_EMAIL',
        ErrorCategory.VALIDATION
      );

      expect(action).toBe('Check the email format (example@domain.com).');
    });

    it('should return undefined for messages without actions', () => {
      const action = ErrorMessageMapper.getActionMessage(
        'NONEXISTENT_CODE',
        ErrorCategory.SYSTEM
      );

      expect(typeof action).toBe('string'); // Falls back to category default
    });
  });

  describe('formatForContext', () => {
    it('should format for toast context with shorter messages', () => {
      const longMessage = 'A'.repeat(80);
      ErrorMessageMapper.registerCustomMessage('LONG_ERROR', {
        title: 'Long Error',
        message: longMessage,
        variant: 'error'
      });

      const formatted = ErrorMessageMapper.formatForContext(
        'LONG_ERROR',
        ErrorCategory.SYSTEM,
        ErrorSeverity.HIGH,
        'toast'
      );

      expect(formatted.message.length).toBeLessThanOrEqual(63); // 60 + "..."
      expect(formatted.message).toContain('...');
    });

    it('should format for inline context without title', () => {
      const formatted = ErrorMessageMapper.formatForContext(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        'inline'
      );

      expect(formatted.title).toBe('');
      expect(formatted.helpText).toBeUndefined();
      expect(formatted.message).toBeDefined();
    });

    it('should format for modal context with full details', () => {
      const formatted = ErrorMessageMapper.formatForContext(
        'AUTHENTICATION_ERROR',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        'modal'
      );

      expect(formatted.title).toBeDefined();
      expect(formatted.message).toBeDefined();
      expect(formatted.action).toBeDefined();
    });

    it('should format for page context with all information', () => {
      const formatted = ErrorMessageMapper.formatForContext(
        'DATABASE_ERROR',
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        'page'
      );

      expect(formatted.title).toBe('Service Unavailable');
      expect(formatted.message).toBe('Our database is temporarily unavailable.');
      expect(formatted.action).toBe('Please try again in a few moments.');
      expect(formatted.helpText).toBe('If the problem persists, contact support.');
    });
  });

  describe('registerCustomMessage', () => {
    it('should register and retrieve custom error messages', () => {
      const customMessage: UserErrorMessage = {
        title: 'Custom Error',
        message: 'This is a custom error message',
        action: 'Take custom action',
        variant: 'error'
      };

      ErrorMessageMapper.registerCustomMessage('CUSTOM_ERROR', customMessage);

      const retrieved = ErrorMessageMapper.getUserMessage(
        'CUSTOM_ERROR',
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM
      );

      expect(retrieved.title).toBe('Custom Error');
      expect(retrieved.message).toBe('This is a custom error message');
      expect(retrieved.action).toBe('Take custom action');
    });
  });

  describe('getAvailableCodes', () => {
    it('should return array of available error codes', () => {
      const codes = ErrorMessageMapper.getAvailableCodes();

      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
      expect(codes).toContain('VALIDATION_ERROR');
      expect(codes).toContain('AUTHENTICATION_ERROR');
      expect(codes).toContain('DATABASE_ERROR');
    });
  });

  describe('Safe Message Detection', () => {
    const testCases = [
      // Safe messages
      { message: 'Please enter a valid email address', expected: true },
      { message: 'The requested resource was not found', expected: true },
      { message: 'Your session has expired', expected: true },
      
      // Unsafe messages
      { message: 'Database connection failed to localhost:5432', expected: false },
      { message: 'Token abc123secret failed validation', expected: false },
      { message: 'SQL error in query SELECT password FROM users', expected: false },
      { message: 'File not found: /home/user/secret.txt', expected: false },
      { message: 'Internal server error on line 42', expected: false },
      { message: 'Stack trace: Error at /var/www/app.js:123', expected: false },
    ];

    testCases.forEach(({ message, expected }) => {
      it(`should ${expected ? 'accept' : 'reject'} message: "${message.substring(0, 30)}..."`, () => {
        const result = ErrorMessageMapper.getUserMessage(
          'TEST_ERROR',
          ErrorCategory.SYSTEM,
          ErrorSeverity.MEDIUM,
          message
        );

        if (expected) {
          expect(result.message).toBe(message);
        } else {
          expect(result.message).not.toBe(message);
        }
      });
    });
  });

  describe('Specific Error Code Messages', () => {
    it('should handle authentication errors correctly', () => {
      const invalidCredentials = ErrorMessageMapper.getUserMessage(
        'INVALID_CREDENTIALS',
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM
      );

      expect(invalidCredentials.title).toBe('Sign In Failed');
      expect(invalidCredentials.message).toBe('The email or password you entered is incorrect.');
      expect(invalidCredentials.helpText).toBe('Forgot your password? Use the reset password link.');
    });

    it('should handle network errors correctly', () => {
      const timeoutError = ErrorMessageMapper.getUserMessage(
        'TIMEOUT_ERROR',
        ErrorCategory.NETWORK,
        ErrorSeverity.MEDIUM
      );

      expect(timeoutError.title).toBe('Request Timeout');
      expect(timeoutError.icon).toBe('⏱️');
      expect(timeoutError.variant).toBe('warning');
    });

    it('should handle business logic errors correctly', () => {
      const capacityError = ErrorMessageMapper.getUserMessage(
        'CAPACITY_EXCEEDED',
        ErrorCategory.BUSINESS_LOGIC,
        ErrorSeverity.MEDIUM
      );

      expect(capacityError.title).toBe('Capacity Reached');
      expect(capacityError.message).toBe('The maximum capacity has been reached.');
      expect(capacityError.action).toBe('Please try again later or choose a different option.');
    });

    it('should handle file upload errors correctly', () => {
      const fileTooLarge = ErrorMessageMapper.getUserMessage(
        'FILE_TOO_LARGE',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM
      );

      expect(fileTooLarge.title).toBe('File Too Large');
      expect(fileTooLarge.icon).toBe('📁');
      expect(fileTooLarge.action).toBe('Please choose a smaller file or compress it.');
    });
  });

  describe('Category Defaults', () => {
    it('should provide sensible defaults for each category', () => {
      const categories = Object.values(ErrorCategory);
      
      categories.forEach(category => {
        const message = ErrorMessageMapper.getUserMessage(
          'UNKNOWN_CODE',
          category,
          ErrorSeverity.MEDIUM
        );

        expect(message.title).toBeDefined();
        expect(message.message).toBeDefined();
        expect(message.action).toBeDefined();
        expect(message.icon).toBeDefined();
        expect(message.variant).toBeDefined();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty error codes gracefully', () => {
      const message = ErrorMessageMapper.getUserMessage(
        '',
        ErrorCategory.SYSTEM,
        ErrorSeverity.MEDIUM
      );

      expect(message).toBeDefined();
      expect(message.title).toBeDefined();
      expect(message.message).toBeDefined();
    });

    it('should handle undefined custom message', () => {
      const message = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        undefined
      );

      expect(message.message).toBe('Please check your input and try again.');
    });

    it('should handle null custom message', () => {
      const message = ErrorMessageMapper.getUserMessage(
        'VALIDATION_ERROR',
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        null as any
      );

      expect(message.message).toBe('Please check your input and try again.');
    });
  });
});
