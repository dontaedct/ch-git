/**
 * @fileoverview Comprehensive Input Validation and Sanitization
 * @module lib/security/input-validation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.1.6 - Add comprehensive input validation and sanitization
 * Focus: Comprehensive input validation with Zod schemas and sanitization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: CRITICAL (input validation vulnerabilities)
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Email validation
  email: z.string()
    .min(1, 'Email is required')
    .max(254, 'Email too long')
    .email('Invalid email format')
    .refine((email) => {
      // Additional email security checks
      const domain = email.split('@')[1];
      return domain && domain.length <= 253 && !domain.includes('..');
    }, 'Invalid email domain'),

  // Phone number validation
  phone: z.string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number too long')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
    .refine((phone) => {
      // Remove all non-digit characters except +
      const cleaned = phone.replace(/[^\d+]/g, '');
      return cleaned.length >= 10 && cleaned.length <= 16;
    }, 'Phone number must be 10-16 digits'),

  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')
    .refine((name) => {
      // Prevent potential injection attacks
      return !name.includes('<') && 
             !name.includes('>') && 
             !name.includes('script') &&
             !name.includes('javascript:') &&
             !name.includes('data:');
    }, 'Name contains potentially malicious content'),

  // URL validation
  url: z.string()
    .min(1, 'URL is required')
    .max(2048, 'URL too long')
    .url('Invalid URL format')
    .refine((url) => {
      try {
        const parsed = new URL(url);
        // Only allow http/https protocols
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    }, 'Invalid URL protocol'),

  // File name validation
  fileName: z.string()
    .min(1, 'Filename is required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Filename contains invalid characters')
    .refine((name) => {
      // Prevent path traversal and hidden files
      return !name.includes('..') && 
             !name.startsWith('.') &&
             !name.includes('/') &&
             !name.includes('\\');
    }, 'Invalid filename'),

  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character')
    .refine((password) => {
      // Check for common weak patterns
      const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /admin/i
      ];
      return !commonPatterns.some(pattern => pattern.test(password));
    }, 'Password is too weak'),

  // Text content validation
  textContent: z.string()
    .max(10000, 'Text content too long')
    .refine((text) => {
      // Check for potential XSS
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i
      ];
      return !xssPatterns.some(pattern => pattern.test(text));
    }, 'Text contains potentially malicious content'),

  // JSON validation
  json: z.string()
    .refine((str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    }, 'Invalid JSON format'),

  // UUID validation
  uuid: z.string()
    .uuid('Invalid UUID format'),

  // Date validation
  date: z.string()
    .datetime('Invalid date format'),

  // Number validation with range
  number: z.number()
    .min(0, 'Number must be positive')
    .max(Number.MAX_SAFE_INTEGER, 'Number too large'),

  // Boolean validation
  boolean: z.boolean(),

  // Array validation
  array: z.array(z.any())
    .max(1000, 'Array too large'),

  // Object validation
  object: z.object({})
    .refine((obj) => {
      // Prevent prototype pollution
      return !Object.prototype.hasOwnProperty.call(obj, '__proto__') &&
             !Object.prototype.hasOwnProperty.call(obj, 'constructor') &&
             !Object.prototype.hasOwnProperty.call(obj, 'prototype');
    }, 'Object contains invalid properties')
};

/**
 * Input sanitization utilities
 */
export class InputSanitizer {
  /**
   * Sanitize HTML content using DOMPurify
   */
  static sanitizeHTML(html: string, allowedTags: string[] = []): string {
    try {
      const config = {
        ALLOWED_TAGS: allowedTags.length > 0 ? allowedTags : ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: ['class', 'id'],
        KEEP_CONTENT: true,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_DOM_IMPORT: false,
        SANITIZE_DOM: true,
        FORCE_BODY: false,
        ADD_ATTR: [],
        ADD_TAGS: [],
        ADD_URI_SAFE_ATTR: []
      };

      return DOMPurify.sanitize(html, config);
    } catch (error) {
      console.error('HTML sanitization failed:', error);
      return '';
    }
  }

  /**
   * Sanitize text content
   */
  static sanitizeText(text: string): string {
    if (typeof text !== 'string') return '';
    
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Sanitize filename
   */
  static sanitizeFileName(fileName: string): string {
    if (typeof fileName !== 'string') return 'file';
    
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace invalid characters
      .replace(/\.{2,}/g, '.') // Replace multiple dots
      .replace(/^\./, '') // Remove leading dot
      .substring(0, 255); // Limit length
  }

  /**
   * Sanitize URL
   */
  static sanitizeURL(url: string): string {
    if (typeof url !== 'string') return '';
    
    try {
      const parsed = new URL(url);
      // Only allow http/https protocols
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  }

  /**
   * Sanitize JSON input
   */
  static sanitizeJSON(jsonString: string): any {
    try {
      const parsed = JSON.parse(jsonString);
      return this.sanitizeObject(parsed);
    } catch {
      return null;
    }
  }

  /**
   * Recursively sanitize object properties
   */
  static sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return this.sanitizeText(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Prevent prototype pollution
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
          continue;
        }
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }

  /**
   * Validate and sanitize form data
   */
  static validateAndSanitizeFormData<T>(data: any, schema: z.ZodSchema<T>): {
    success: boolean;
    data?: T;
    errors?: string[];
  } {
    try {
      // First sanitize the input
      const sanitizedData = this.sanitizeObject(data);
      
      // Then validate with schema
      const result = schema.safeParse(sanitizedData);
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          errors: result.error.errors.map(err => err.message) 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: ['Validation failed'] 
      };
    }
  }
}

/**
 * React hook for input validation
 */
export function useInputValidation<T>(schema: z.ZodSchema<T>) {
  const validate = (data: any) => {
    return InputSanitizer.validateAndSanitizeFormData(data, schema);
  };

  const sanitize = (data: any) => {
    return InputSanitizer.sanitizeObject(data);
  };

  return { validate, sanitize };
}

/**
 * Common form schemas
 */
export const formSchemas = {
  // Contact form
  contact: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    phone: commonSchemas.phone.optional(),
    message: commonSchemas.textContent,
    subject: z.string().max(200, 'Subject too long')
  }),

  // User registration
  registration: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    confirmPassword: z.string(),
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    acceptTerms: z.boolean().refine(val => val === true, 'Must accept terms')
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }),

  // Settings form
  settings: z.object({
    bookingUrl: commonSchemas.url.optional(),
    emailSubjectTemplate: commonSchemas.textContent.optional(),
    notifications: z.boolean().optional(),
    theme: z.enum(['light', 'dark', 'system']).optional()
  }),

  // File upload
  fileUpload: z.object({
    file: z.instanceof(File)
      .refine(file => file.size <= 10 * 1024 * 1024, 'File too large')
      .refine(file => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'application/pdf',
          'text/plain',
          'application/json'
        ];
        return allowedTypes.includes(file.type);
      }, 'Invalid file type'),
    description: commonSchemas.textContent.optional()
  })
};

export default InputSanitizer;
