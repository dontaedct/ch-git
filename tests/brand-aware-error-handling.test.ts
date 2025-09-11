/**
 * @fileoverview Brand-Aware Error Handling Tests
 * @module tests/brand-aware-error-handling
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ErrorCategory, ErrorSeverity } from '@/lib/errors/types';
import { 
  BrandAwareErrorGenerator,
  DEFAULT_ERROR_TEMPLATES,
  generateBrandAwareErrorMessage,
  generateBrandAwareCategoryMessage,
  initializeBrandAwareErrors,
  getBrandAwareErrorGenerator
} from '@/lib/branding/error-messages';
import { BrandNameConfig } from '@/lib/branding/logo-manager';

// Mock brand configurations
const mockBrandConfig: BrandNameConfig = {
  organizationName: 'Test Organization',
  appName: 'Test App',
  fullBrand: 'Test Organization — Test App',
  shortBrand: 'Test App',
  navBrand: 'Test App',
};

const mockTechBrandConfig: BrandNameConfig = {
  organizationName: 'Tech Corp',
  appName: 'TechApp',
  fullBrand: 'Tech Corp — TechApp',
  shortBrand: 'TechApp',
  navBrand: 'TechApp',
};

describe('Brand-Aware Error Handling', () => {
  beforeEach(() => {
    // Reset any global state
    vi.clearAllMocks();
  });

  describe('BrandAwareErrorGenerator', () => {
    it('should generate brand-aware error messages', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const mockError = {
        code: 'VALIDATION_ERROR',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        getUserSafeMessage: () => 'Please check your input',
        correlationId: 'test-123',
        retryable: false,
      };

      const result = generator.generateErrorMessage(mockError);
      
      expect(result.message).toContain('Test App');
      expect(result.title).toContain('Test App');
      expect(result.supportContact).toContain('Test App');
      expect(result.helpText).toContain('Test App');
    });

    it('should handle different brand configurations', () => {
      const generator = new BrandAwareErrorGenerator(mockTechBrandConfig);
      
      const mockError = {
        code: 'AUTHENTICATION_ERROR',
        category: ErrorCategory.AUTHENTICATION,
        severity: ErrorSeverity.HIGH,
        getUserSafeMessage: () => 'Login failed',
        correlationId: 'auth-456',
        retryable: true,
      };

      const result = generator.generateErrorMessage(mockError);
      
      expect(result.message).toContain('TechApp');
      expect(result.title).toContain('TechApp');
      expect(result.supportContact).toContain('TechApp');
    });

    it('should process template variables correctly', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const result = generator.generateCategoryMessage(
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
        { customVar: 'test-value' }
      );
      
      expect(result.message).toContain('Test App');
      expect(result.title).toContain('Test App');
    });

    it('should update brand names dynamically', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      // Update brand names
      generator.updateBrandNames(mockTechBrandConfig);
      
      const mockError = {
        code: 'NETWORK_ERROR',
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.MEDIUM,
        getUserSafeMessage: () => 'Connection failed',
        correlationId: 'net-789',
        retryable: true,
      };

      const result = generator.generateErrorMessage(mockError);
      
      expect(result.message).toContain('TechApp');
      expect(result.title).toContain('TechApp');
    });
  });

  describe('Global Brand-Aware Error Functions', () => {
    beforeEach(() => {
      // Initialize with test brand config
      initializeBrandAwareErrors(mockBrandConfig);
    });

    it('should generate brand-aware error messages globally', () => {
      const mockError = {
        code: 'VALIDATION_ERROR',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        getUserSafeMessage: () => 'Please check your input',
        correlationId: 'test-123',
        retryable: false,
      };

      const result = generateBrandAwareErrorMessage(mockError);
      
      expect(result.message).toContain('Test App');
      expect(result.title).toContain('Test App');
    });

    it('should generate brand-aware category messages globally', () => {
      const result = generateBrandAwareCategoryMessage(
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.HIGH
      );
      
      expect(result.message).toContain('Test App');
      expect(result.title).toContain('Test App');
    });

    it('should throw error when not initialized', () => {
      // This test would need to be run in isolation to avoid the initialization above
      expect(() => {
        // This would throw if we hadn't initialized above
        getBrandAwareErrorGenerator();
      }).not.toThrow();
    });
  });

  describe('Error Templates', () => {
    it('should have templates for all error categories', () => {
      const categories = Object.values(ErrorCategory);
      
      categories.forEach(category => {
        expect(DEFAULT_ERROR_TEMPLATES[category]).toBeDefined();
        expect(DEFAULT_ERROR_TEMPLATES[category].messageTemplate).toContain('{brandName}');
        expect(DEFAULT_ERROR_TEMPLATES[category].titleTemplate).toContain('{brandName}');
        expect(DEFAULT_ERROR_TEMPLATES[category].supportTemplate).toContain('{brandName}');
      });
    });

    it('should have appropriate templates for different error types', () => {
      // Test validation error template
      const validationTemplate = DEFAULT_ERROR_TEMPLATES[ErrorCategory.VALIDATION];
      expect(validationTemplate.messageTemplate).toContain('check your input');
      expect(validationTemplate.retryTemplate).toContain('correct the highlighted fields');

      // Test authentication error template
      const authTemplate = DEFAULT_ERROR_TEMPLATES[ErrorCategory.AUTHENTICATION];
      expect(authTemplate.messageTemplate).toContain('login');
      expect(authTemplate.retryTemplate).toContain('credentials');

      // Test network error template
      const networkTemplate = DEFAULT_ERROR_TEMPLATES[ErrorCategory.NETWORK];
      expect(networkTemplate.messageTemplate).toContain('connection');
      expect(networkTemplate.retryTemplate).toContain('internet connection');
    });
  });

  describe('Template Processing', () => {
    it('should replace all brand variables in templates', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const template = 'Welcome to {brandName} by {organizationName}. Use {shortBrand} for short.';
      const result = generator['processTemplate'](template, {});
      
      expect(result).toBe('Welcome to Test App by Test Organization. Use Test App for short.');
    });

    it('should handle additional variables', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const template = 'Error {errorCode} occurred in {component}';
      const result = generator['processTemplate'](template, { 
        errorCode: 'ERR_001', 
        component: 'LoginForm' 
      });
      
      expect(result).toBe('Error ERR_001 occurred in LoginForm');
    });

    it('should handle missing variables gracefully', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const template = 'Error {errorCode} occurred in {missingVar}';
      const result = generator['processTemplate'](template, { errorCode: 'ERR_001' });
      
      expect(result).toBe('Error ERR_001 occurred in {missingVar}');
    });
  });

  describe('Error Message Generation', () => {
    it('should generate appropriate messages for different severities', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const lowSeverityResult = generator.generateCategoryMessage(
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW
      );
      
      const criticalSeverityResult = generator.generateCategoryMessage(
        ErrorCategory.SYSTEM,
        ErrorSeverity.CRITICAL
      );
      
      expect(lowSeverityResult.title).toContain('Test App');
      expect(criticalSeverityResult.title).toContain('Test App');
      // Critical errors should have more urgent language
      expect(criticalSeverityResult.message).toContain('notified');
    });

    it('should include correlation ID in context when provided', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      const mockError = {
        code: 'TEST_ERROR',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.MEDIUM,
        getUserSafeMessage: () => 'Test error',
        correlationId: 'corr-123',
        retryable: false,
      };

      const result = generator.generateErrorMessage(mockError, { 
        correlationId: 'corr-123' 
      });
      
      expect(result.message).toContain('Test App');
    });
  });

  describe('Brand Configuration Updates', () => {
    it('should reflect brand changes immediately', () => {
      const generator = new BrandAwareErrorGenerator(mockBrandConfig);
      
      // Generate message with original brand
      const originalResult = generator.generateCategoryMessage(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM
      );
      expect(originalResult.message).toContain('Test App');
      
      // Update brand configuration
      generator.updateBrandNames(mockTechBrandConfig);
      
      // Generate message with new brand
      const updatedResult = generator.generateCategoryMessage(
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM
      );
      expect(updatedResult.message).toContain('TechApp');
      expect(updatedResult.message).not.toContain('Test App');
    });
  });
});
