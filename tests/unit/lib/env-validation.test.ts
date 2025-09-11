/**
 * @fileoverview HT-008.7.1: Unit Tests for Environment Validation System
 * @module tests/unit/lib/env-validation.test.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.7.1 - Unit Test Suite Expansion
 * Focus: Comprehensive unit test coverage for environment validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (unit testing)
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  sanitizeUrl,
  sanitizeEmail,
  sanitizeBoolean,
  sanitizeNumber,
  sanitizeTimeout,
  validateSupabaseUrl,
  validateStripeKey,
  validateWebhookUrl,
  validateEmailAddress,
  validateEnvironmentRequirements,
  detectRotationNeeds,
  validateAndSanitizeEnvironment
} from '../../../lib/env-validation';

describe('Environment Validation System', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.TEST_URL;
    delete process.env.TEST_EMAIL;
    delete process.env.TEST_BOOLEAN;
    delete process.env.TEST_NUMBER;
    delete process.env.SUPABASE_URL;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.WEBHOOK_URL;
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.TEST_URL;
    delete process.env.TEST_EMAIL;
    delete process.env.TEST_BOOLEAN;
    delete process.env.TEST_NUMBER;
    delete process.env.SUPABASE_URL;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.WEBHOOK_URL;
  });

  describe('sanitizeUrl', () => {
    it('should sanitize valid URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com/');
      expect(sanitizeUrl('http://localhost:3000')).toBe('http://localhost:3000/');
      expect(sanitizeUrl('https://api.example.com/v1')).toBe('https://api.example.com/v1');
    });

    it('should remove trailing slashes', () => {
      expect(sanitizeUrl('https://example.com/')).toBe('https://example.com/');
      expect(sanitizeUrl('https://example.com/api/')).toBe('https://example.com/api');
      expect(sanitizeUrl('https://example.com/')).toBe('https://example.com/');
    });

    it('should handle URLs with query parameters', () => {
      expect(sanitizeUrl('https://example.com?param=value')).toBe('https://example.com/?param=value');
      expect(sanitizeUrl('https://example.com?param1=value1&param2=value2')).toBe('https://example.com/?param1=value1&param2=value2');
    });

    it('should handle URLs with fragments', () => {
      expect(sanitizeUrl('https://example.com#section')).toBe('https://example.com/#section');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(sanitizeUrl('not-a-url')).toBe('not-a-url');
      expect(sanitizeUrl('')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeUrl(null as any)).toBe(null);
      expect(sanitizeUrl(undefined as any)).toBe(undefined);
    });

    it('should handle URLs with special characters', () => {
      expect(sanitizeUrl('https://example.com/path with spaces')).toBe('https://example.com/path%20with%20spaces');
      expect(sanitizeUrl('https://example.com/path-with-dashes')).toBe('https://example.com/path-with-dashes');
      expect(sanitizeUrl('https://example.com/path_with_underscores')).toBe('https://example.com/path_with_underscores');
    });
  });

  describe('sanitizeEmail', () => {
    it('should sanitize valid email addresses', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
      expect(sanitizeEmail('user.name@example.com')).toBe('user.name@example.com');
      expect(sanitizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
    });

    it('should handle emails with subdomains', () => {
      expect(sanitizeEmail('user@mail.example.com')).toBe('user@mail.example.com');
      expect(sanitizeEmail('user@sub.domain.example.com')).toBe('user@sub.domain.example.com');
    });

    it('should handle any string input', () => {
      expect(sanitizeEmail('not-an-email')).toBe('not-an-email');
      expect(sanitizeEmail('user@')).toBe('user@');
      expect(sanitizeEmail('@example.com')).toBe('@example.com');
      expect(sanitizeEmail('user@example')).toBe('user@example');
    });

    it('should handle null and undefined', () => {
      expect(() => sanitizeEmail(null as any)).toThrow();
      expect(() => sanitizeEmail(undefined as any)).toThrow();
    });

    it('should trim whitespace', () => {
      expect(sanitizeEmail('  user@example.com  ')).toBe('user@example.com');
    });

    it('should convert to lowercase', () => {
      expect(sanitizeEmail('USER@EXAMPLE.COM')).toBe('user@example.com');
    });

    it('should handle internationalized domain names', () => {
      expect(sanitizeEmail('user@münchen.de')).toBe('user@münchen.de');
    });
  });

  describe('sanitizeBoolean', () => {
    it('should sanitize truthy values to "true"', () => {
      expect(sanitizeBoolean('true')).toBe('true');
      expect(sanitizeBoolean('TRUE')).toBe('true');
      expect(sanitizeBoolean('1')).toBe('true');
      expect(sanitizeBoolean('yes')).toBe('true');
      expect(sanitizeBoolean('YES')).toBe('true');
      expect(sanitizeBoolean('on')).toBe('true');
      expect(sanitizeBoolean('ON')).toBe('true');
      expect(sanitizeBoolean('enabled')).toBe('true');
    });

    it('should sanitize falsy values to "false"', () => {
      expect(sanitizeBoolean('false')).toBe('false');
      expect(sanitizeBoolean('FALSE')).toBe('false');
      expect(sanitizeBoolean('0')).toBe('false');
      expect(sanitizeBoolean('no')).toBe('false');
      expect(sanitizeBoolean('NO')).toBe('false');
      expect(sanitizeBoolean('off')).toBe('false');
      expect(sanitizeBoolean('OFF')).toBe('false');
      expect(sanitizeBoolean('disabled')).toBe('false');
    });

    it('should handle empty string as "false"', () => {
      expect(sanitizeBoolean('')).toBe('false');
    });

    it('should handle invalid boolean values as "false"', () => {
      expect(sanitizeBoolean('maybe')).toBe('false');
      expect(sanitizeBoolean('2')).toBe('false');
      expect(sanitizeBoolean('invalid')).toBe('false');
    });

    it('should handle null and undefined', () => {
      expect(() => sanitizeBoolean(null as any)).toThrow();
      expect(() => sanitizeBoolean(undefined as any)).toThrow();
    });

    it('should trim whitespace', () => {
      expect(sanitizeBoolean('  true  ')).toBe('true');
      expect(sanitizeBoolean('  false  ')).toBe('false');
    });
  });

  describe('sanitizeNumber', () => {
    it('should sanitize valid numbers', () => {
      expect(sanitizeNumber('123')).toBe('123');
      expect(sanitizeNumber('0')).toBe('0');
      expect(sanitizeNumber('-123')).toBe('-123');
      expect(sanitizeNumber('123.45')).toBe('123');
    });

    it('should handle min and max constraints', () => {
      expect(sanitizeNumber('50', 10, 100)).toBe('50');
      expect(sanitizeNumber('5', 10, 100)).toBe('10');
      expect(sanitizeNumber('150', 10, 100)).toBe('100');
    });

    it('should handle invalid numbers as "0"', () => {
      expect(sanitizeNumber('not-a-number')).toBe('0');
      expect(sanitizeNumber('123abc')).toBe('123');
      expect(sanitizeNumber('')).toBe('0');
    });

    it('should handle null and undefined', () => {
      expect(() => sanitizeNumber(null as any)).not.toThrow();
      expect(() => sanitizeNumber(undefined as any)).not.toThrow();
    });

    it('should handle edge cases', () => {
      expect(sanitizeNumber('0.0')).toBe('0');
      expect(sanitizeNumber('-0')).toBe('0');
      expect(sanitizeNumber('Infinity')).toBe('0');
      expect(sanitizeNumber('-Infinity')).toBe('0');
    });

    it('should handle NaN as "0"', () => {
      expect(sanitizeNumber('NaN')).toBe('0');
    });
  });

  describe('sanitizeTimeout', () => {
    it('should sanitize timeout values within bounds', () => {
      expect(sanitizeTimeout('5000')).toBe('5000');
      expect(sanitizeTimeout('1000')).toBe('1000');
      expect(sanitizeTimeout('300000')).toBe('300000');
    });

    it('should enforce minimum timeout', () => {
      expect(sanitizeTimeout('500')).toBe('1000');
      expect(sanitizeTimeout('0')).toBe('1000');
    });

    it('should enforce maximum timeout', () => {
      expect(sanitizeTimeout('400000')).toBe('300000');
      expect(sanitizeTimeout('999999')).toBe('300000');
    });

    it('should handle invalid values as minimum', () => {
      expect(sanitizeTimeout('invalid')).toBe('0');
      expect(sanitizeTimeout('')).toBe('0');
    });
  });

  describe('validateSupabaseUrl', () => {
    it('should validate valid Supabase URLs', () => {
      const result = validateSupabaseUrl('https://project.supabase.co/');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('https://project.supabase.co/');
      }
    });

    it('should validate localhost Supabase URLs', () => {
      const result = validateSupabaseUrl('http://localhost:54321');
      expect(result.success).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const result = validateSupabaseUrl('not-a-url');
      expect(result.success).toBe(false);
    });

    it('should reject non-Supabase URLs', () => {
      const result = validateSupabaseUrl('https://example.com');
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = validateSupabaseUrl();
      expect(result.success).toBe(false);
    });
  });

  describe('validateStripeKey', () => {
    it('should validate secret keys', () => {
      const result = validateStripeKey('sk_test_1234567890abcdef');
      expect(result.success).toBe(true);
    });

    it('should validate publishable keys', () => {
      const result = validateStripeKey('pk_test_1234567890abcdef', 'publishable');
      expect(result.success).toBe(true);
    });

    it('should reject keys that are too short', () => {
      const result = validateStripeKey('sk_test_123');
      expect(result.success).toBe(false);
    });

    it('should reject keys with wrong prefix', () => {
      const result = validateStripeKey('pk_test_1234567890abcdef', 'secret');
      expect(result.success).toBe(false);
    });

    it('should handle undefined input', () => {
      const result = validateStripeKey();
      expect(result.success).toBe(false);
    });
  });

  describe('validateWebhookUrl', () => {
    it('should validate HTTPS URLs', () => {
      const result = validateWebhookUrl('https://example.com/webhook');
      expect(result.success).toBe(true);
    });

    it('should reject HTTP URLs in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const result = validateWebhookUrl('http://example.com/webhook');
      expect(result.success).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should reject localhost in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const result = validateWebhookUrl('https://localhost/webhook');
      expect(result.success).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle undefined input', () => {
      const result = validateWebhookUrl();
      expect(result.success).toBe(false);
    });
  });

  describe('validateEmailAddress', () => {
    it('should validate valid email addresses', () => {
      const result = validateEmailAddress('user@example.com');
      expect(result.success).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const result = validateEmailAddress('not-an-email');
      expect(result.success).toBe(false);
    });

    it('should reject disposable emails in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      const result = validateEmailAddress('user@tempmail.com');
      expect(result.success).toBe(false);
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle undefined input', () => {
      const result = validateEmailAddress();
      expect(result.success).toBe(false);
    });
  });

  describe('validateEnvironmentRequirements', () => {
    it('should validate required environment variables', () => {
      const requirements = {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        STRIPE_SECRET_KEY: 'sk_test_123456789012345678901234567890'
      };

      const result = validateEnvironmentRequirements(requirements);
      expect(result.errors).toEqual([]);
      expect(result.warnings).toBeDefined();
    });

    it('should handle missing required variables', () => {
      const requirements = {
        NODE_ENV: 'production'
      };

      const result = validateEnvironmentRequirements(requirements);
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should validate different types', () => {
      const requirements = {
        NODE_ENV: 'development',
        NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
        STRIPE_SECRET_KEY: 'sk_test_123456789012345678901234567890'
      };

      const result = validateEnvironmentRequirements(requirements);
      expect(result.errors).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
  });

  describe('detectRotationNeeds', () => {
    it('should detect when rotation is needed', () => {
      const env = {
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_test_123456789012345678901234567890'
      };

      const result = detectRotationNeeds(env);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should not detect rotation for same keys', () => {
      const env = {
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_live_123456789012345678901234567890123456789012345678901234567890'
      };

      const result = detectRotationNeeds(env);
      expect(result.length).toBe(0);
    });

    it('should handle missing keys', () => {
      const env = {
        NODE_ENV: 'production'
      };

      const result = detectRotationNeeds(env);
      expect(result.length).toBe(0);
    });
  });

  describe('validateAndSanitizeEnvironment', () => {
    it('should validate and sanitize environment variables', () => {
      const env = {
        TEST_URL: 'https://example.com/',
        TEST_EMAIL: 'TEST@EXAMPLE.COM',
        TEST_BOOLEAN: 'TRUE'
      };

      const result = validateAndSanitizeEnvironment(env);
      expect(result.sanitized).toBeDefined();
      expect(result.validationResults).toBeDefined();
      expect(result.environmentErrors).toBeDefined();
      expect(result.environmentWarnings).toBeDefined();
      expect(result.rotationWarnings).toBeDefined();
    });

    it('should handle validation errors', () => {
      const env = {
        INVALID_URL: 'not-a-url',
        INVALID_EMAIL: 'not-an-email'
      };

      const result = validateAndSanitizeEnvironment(env);
      expect(result.sanitized).toBeDefined();
      expect(result.validationResults).toBeDefined();
      expect(result.environmentErrors).toBeDefined();
      expect(result.environmentWarnings).toBeDefined();
      expect(result.rotationWarnings).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle edge cases gracefully', () => {
      expect(sanitizeUrl('')).toBe('');
      expect(sanitizeEmail('')).toBe('');
      expect(sanitizeBoolean('')).toBe('false');
      expect(sanitizeNumber('')).toBe('0');
    });

    it('should handle special characters', () => {
      expect(sanitizeUrl('https://example.com/path%20with%20spaces')).toBe('https://example.com/path%20with%20spaces');
      expect(sanitizeEmail('user+tag@example.com')).toBe('user+tag@example.com');
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of validations efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        sanitizeUrl('https://example.com');
        sanitizeEmail('user@example.com');
        sanitizeBoolean('true');
        sanitizeNumber('123');
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle complex URL validation efficiently', () => {
      const complexUrl = 'https://api.example.com/v1/users/123?include=profile,settings&filter=active';
      
      const startTime = Date.now();
      const result = sanitizeUrl(complexUrl);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(10); // Should complete quickly
      expect(result).toBe(complexUrl);
    });
  });
});
