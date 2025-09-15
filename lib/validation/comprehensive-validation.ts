/**
 * @fileoverview Comprehensive Input Validation System
 * @module lib/validation/comprehensive-validation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Comprehensive Input Validation System
 * Purpose: Production-grade input validation with comprehensive Zod schemas
 * Safety: Comprehensive validation with sanitization and error handling
 */

import { z } from 'zod'
import { handleError } from '@/lib/types/type-safe-utils'

// =============================================================================
// COMMON VALIDATION PATTERNS
// =============================================================================

/**
 * Common validation patterns for reuse
 */
export const commonPatterns = {
  // Email validation with domain checks
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(254, 'Email too long')
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase()
      const disposableDomains = [
        'tempmail.com', '10minutemail.com', 'guerrillamail.com',
        'mailinator.com', 'throwaway.email', 'temp-mail.org'
      ]
      return !disposableDomains.includes(domain)
    }, 'Disposable email domains not allowed'),

  // Phone number validation (international format)
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),

  // Strong password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),

  // URL validation with security checks
  secureUrl: z.string()
    .url('Invalid URL format')
    .refine((url) => {
      try {
        const parsed = new URL(url)
        // Require HTTPS in production
        if (process.env.NODE_ENV === 'production' && parsed.protocol !== 'https:') {
          return false
        }
        // Block dangerous protocols
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:']
        return !dangerousProtocols.includes(parsed.protocol.toLowerCase())
      } catch {
        return false
      }
    }, 'URL must use HTTPS and safe protocols'),

  // Safe HTML content (no scripts)
  safeHtml: z.string()
    .refine((html) => {
      const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
      const eventRegex = /on\w+\s*=/gi
      return !scriptRegex.test(html) && !eventRegex.test(html)
    }, 'HTML content contains unsafe elements'),

  // File name validation
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name too long')
    .regex(/^[^<>:"/\\|?*]+$/, 'File name contains invalid characters')
    .refine((name) => !name.startsWith('.'), 'File name cannot start with a dot'),

  // Date validation (ISO format)
  isoDate: z.string()
    .datetime('Invalid date format')
    .refine((date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    }, 'Invalid date value'),

  // Positive integer
  positiveInt: z.number()
    .int('Must be an integer')
    .positive('Must be positive'),

  // Non-negative integer
  nonNegativeInt: z.number()
    .int('Must be an integer')
    .min(0, 'Must be non-negative'),

  // Percentage (0-100)
  percentage: z.number()
    .min(0, 'Percentage must be at least 0')
    .max(100, 'Percentage must be at most 100'),

  // Color hex code
  hexColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color format'),

  // Slug (URL-friendly string)
  slug: z.string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .refine((slug) => !slug.startsWith('-') && !slug.endsWith('-'), 'Slug cannot start or end with hyphens')
}

// =============================================================================
// USER INPUT SCHEMAS
// =============================================================================

/**
 * User registration schema
 */
export const userRegistrationSchema = z.object({
  email: commonPatterns.email,
  password: commonPatterns.password,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
  phone: commonPatterns.phone,
  dateOfBirth: commonPatterns.isoDate.optional(),
  consent: z.boolean()
    .refine((consent) => consent === true, 'Consent is required'),
  marketingConsent: z.boolean().optional()
})

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: commonPatterns.email,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
})

/**
 * User profile update schema
 */
export const userProfileUpdateSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .optional(),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .optional(),
  phone: commonPatterns.phone,
  dateOfBirth: commonPatterns.isoDate.optional(),
  bio: z.string()
    .max(500, 'Bio too long')
    .optional(),
  website: commonPatterns.secureUrl.optional(),
  location: z.string()
    .max(100, 'Location too long')
    .optional()
})

// =============================================================================
// FORM INPUT SCHEMAS
// =============================================================================

/**
 * Contact form schema
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: commonPatterns.email,
  phone: commonPatterns.phone,
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message too long'),
  consent: z.boolean()
    .refine((consent) => consent === true, 'Consent is required')
})

/**
 * Newsletter subscription schema
 */
export const newsletterSubscriptionSchema = z.object({
  email: commonPatterns.email,
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .optional(),
  interests: z.array(z.string())
    .min(1, 'At least one interest must be selected')
    .max(10, 'Too many interests selected'),
  frequency: z.enum(['daily', 'weekly', 'monthly'], {
    errorMap: () => ({ message: 'Invalid frequency selection' })
  })
})

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

/**
 * File upload schema
 */
export const fileUploadSchema = z.object({
  fileName: commonPatterns.fileName,
  fileSize: commonPatterns.nonNegativeInt
    .max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  mimeType: z.string()
    .refine((mime) => {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      return allowedTypes.includes(mime)
    }, 'File type not allowed'),
  description: z.string()
    .max(500, 'Description too long')
    .optional()
})

/**
 * Image upload schema
 */
export const imageUploadSchema = z.object({
  fileName: commonPatterns.fileName,
  fileSize: commonPatterns.nonNegativeInt
    .max(5 * 1024 * 1024, 'Image size must be less than 5MB'),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp'], {
    errorMap: () => ({ message: 'Invalid image format' })
  }),
  width: commonPatterns.positiveInt.optional(),
  height: commonPatterns.positiveInt.optional(),
  alt: z.string()
    .max(200, 'Alt text too long')
    .optional()
})

// =============================================================================
// API INPUT SCHEMAS
// =============================================================================

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: commonPatterns.positiveInt.default(1),
  pageSize: z.number()
    .int('Page size must be an integer')
    .min(1, 'Page size must be at least 1')
    .max(100, 'Page size must be at most 100')
    .default(20),
  sortBy: z.string()
    .max(50, 'Sort field name too long')
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

/**
 * Search schema
 */
export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query is required')
    .max(200, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,!?]+$/, 'Search query contains invalid characters'),
  filters: z.record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  pagination: paginationSchema.optional()
})

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate input data with comprehensive error handling
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data)
    return { success: true, data: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.length > 0 ? `${err.path.join('.')}: ` : ''
        return `${path}${err.message}`
      })
      
      // Log validation errors
      console.warn('Validation failed:', {
        context,
        errors,
        data: typeof data === 'object' ? Object.keys(data as object) : typeof data
      })
      
      return { success: false, errors }
    }
    
    // Handle unexpected errors
    const errorDetails = handleError(error)
    console.error('Validation error:', errorDetails)
    
    return { 
      success: false, 
      errors: [`Validation failed: ${errorDetails.message}`] 
    }
  }
}

/**
 * Sanitize input data before validation
 */
export function sanitizeInput(data: unknown): unknown {
  if (typeof data === 'string') {
    return data.trim()
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim()
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeInput(value)
      } else {
        sanitized[key] = value
      }
    }
    return sanitized
  }
  
  return data
}

/**
 * Validate and sanitize input in one step
 */
export function validateAndSanitizeInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): { success: true; data: T } | { success: false; errors: string[] } {
  const sanitizedData = sanitizeInput(data)
  return validateInput(schema, sanitizedData, context)
}

/**
 * Create a validation middleware for API routes
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown, context?: string) => {
    return validateAndSanitizeInput(schema, data, context)
  }
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type UserRegistration = z.infer<typeof userRegistrationSchema>
export type UserLogin = z.infer<typeof userLoginSchema>
export type UserProfileUpdate = z.infer<typeof userProfileUpdateSchema>
export type ContactForm = z.infer<typeof contactFormSchema>
export type NewsletterSubscription = z.infer<typeof newsletterSubscriptionSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type ImageUpload = z.infer<typeof imageUploadSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type Search = z.infer<typeof searchSchema>
