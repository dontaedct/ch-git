/**
 * @fileoverview Brand-Aware Error Message System
 * @module lib/branding/error-messages
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandNameConfig } from './logo-manager';
import { AppError, ErrorCategory, ErrorSeverity } from '@/lib/errors/types';

export interface BrandAwareErrorMessage {
  /** User-friendly error message with brand context */
  message: string;
  /** Support contact information with brand context */
  supportContact: string;
  /** Branded error title */
  title: string;
  /** Branded retry message */
  retryMessage: string;
  /** Branded help text */
  helpText: string;
}

export interface BrandAwareErrorTemplate {
  /** Template for error messages */
  messageTemplate: string;
  /** Template for support contact */
  supportTemplate: string;
  /** Template for error titles */
  titleTemplate: string;
  /** Template for retry messages */
  retryTemplate: string;
  /** Template for help text */
  helpTemplate: string;
}

/**
 * Default error message templates with brand placeholders
 */
export const DEFAULT_ERROR_TEMPLATES: Record<ErrorCategory, BrandAwareErrorTemplate> = {
  [ErrorCategory.VALIDATION]: {
    messageTemplate: 'Please check your input and try again. If you continue to experience issues, contact {brandName} support.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Validation Error - {brandName}',
    retryTemplate: 'Please correct the highlighted fields and try again.',
    helpTemplate: 'For assistance with this form, please contact {brandName} support.',
  },
  [ErrorCategory.AUTHENTICATION]: {
    messageTemplate: 'There was an issue with your login. Please try again or contact {brandName} support.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Login Error - {brandName}',
    retryTemplate: 'Please check your credentials and try logging in again.',
    helpTemplate: 'Having trouble logging in? Contact {brandName} support for assistance.',
  },
  [ErrorCategory.AUTHORIZATION]: {
    messageTemplate: 'You don\'t have permission to access this resource. Contact {brandName} support if you believe this is an error.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Access Denied - {brandName}',
    retryTemplate: 'Please contact {brandName} support to request access.',
    helpTemplate: 'Need access to this feature? Contact {brandName} support.',
  },
  [ErrorCategory.DATABASE]: {
    messageTemplate: 'We\'re experiencing technical difficulties. {brandName} support has been notified.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'System Error - {brandName}',
    retryTemplate: 'Please try again in a few moments.',
    helpTemplate: 'If this issue persists, please contact {brandName} support.',
  },
  [ErrorCategory.EXTERNAL_SERVICE]: {
    messageTemplate: 'We\'re having trouble connecting to external services. {brandName} support has been notified.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Service Unavailable - {brandName}',
    retryTemplate: 'Please try again in a few moments.',
    helpTemplate: 'If this issue persists, please contact {brandName} support.',
  },
  [ErrorCategory.NETWORK]: {
    messageTemplate: 'Network connection issue detected. Please check your internet connection and try again.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Connection Error - {brandName}',
    retryTemplate: 'Please check your internet connection and try again.',
    helpTemplate: 'Having connection issues? Contact {brandName} support.',
  },
  [ErrorCategory.BUSINESS_LOGIC]: {
    messageTemplate: 'This action cannot be completed at this time. Contact {brandName} support for assistance.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Action Not Allowed - {brandName}',
    retryTemplate: 'Please contact {brandName} support to resolve this issue.',
    helpTemplate: 'Need help with this action? Contact {brandName} support.',
  },
  [ErrorCategory.NOT_FOUND]: {
    messageTemplate: 'The requested resource was not found. Contact {brandName} support if you believe this is an error.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Not Found - {brandName}',
    retryTemplate: 'Please check the URL or contact {brandName} support.',
    helpTemplate: 'Can\'t find what you\'re looking for? Contact {brandName} support.',
  },
  [ErrorCategory.RATE_LIMIT]: {
    messageTemplate: 'Too many requests. Please wait a moment before trying again.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Rate Limited - {brandName}',
    retryTemplate: 'Please wait a moment and try again.',
    helpTemplate: 'If you continue to be rate limited, contact {brandName} support.',
  },
  [ErrorCategory.SECURITY]: {
    messageTemplate: 'Security issue detected. {brandName} support has been notified.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Security Alert - {brandName}',
    retryTemplate: 'Please contact {brandName} support immediately.',
    helpTemplate: 'For security concerns, contact {brandName} support immediately.',
  },
  [ErrorCategory.SYSTEM]: {
    messageTemplate: 'An unexpected error occurred. {brandName} support has been notified.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'System Error - {brandName}',
    retryTemplate: 'Please try again in a few moments.',
    helpTemplate: 'If this issue persists, please contact {brandName} support.',
  },
  [ErrorCategory.CONFLICT]: {
    messageTemplate: 'This action conflicts with existing data. Contact {brandName} support for assistance.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Conflict Error - {brandName}',
    retryTemplate: 'Please contact {brandName} support to resolve this conflict.',
    helpTemplate: 'Need help resolving this conflict? Contact {brandName} support.',
  },
  [ErrorCategory.INTERNAL]: {
    messageTemplate: 'An internal error occurred. Please try again or contact {brandName} support.',
    supportTemplate: 'Contact {brandName} support at support@example.com',
    titleTemplate: 'Internal Error - {brandName}',
    retryTemplate: 'Please try again in a few moments.',
    helpTemplate: 'Experiencing technical difficulties? Contact {brandName} support.',
  },
};

/**
 * Brand-aware error message generator
 */
export class BrandAwareErrorGenerator {
  private brandNames: BrandNameConfig;
  private templates: Record<ErrorCategory, BrandAwareErrorTemplate>;

  constructor(brandNames: BrandNameConfig, customTemplates?: Partial<Record<ErrorCategory, BrandAwareErrorTemplate>>) {
    this.brandNames = brandNames;
    this.templates = {
      ...DEFAULT_ERROR_TEMPLATES,
      ...customTemplates,
    };
  }

  /**
   * Generate brand-aware error message for a specific error
   */
  generateErrorMessage(error: AppError, context?: Record<string, string>): BrandAwareErrorMessage {
    const template = this.templates[error.category];
    const variables = {
      brandName: this.brandNames.appName,
      organizationName: this.brandNames.organizationName,
      fullBrand: this.brandNames.fullBrand,
      shortBrand: this.brandNames.shortBrand,
      navBrand: this.brandNames.navBrand,
      errorCode: error.code,
      correlationId: error.correlationId,
      ...context,
    };

    return {
      message: this.processTemplate(template.messageTemplate, variables),
      supportContact: this.processTemplate(template.supportTemplate, variables),
      title: this.processTemplate(template.titleTemplate, variables),
      retryMessage: this.processTemplate(template.retryTemplate, variables),
      helpText: this.processTemplate(template.helpTemplate, variables),
    };
  }

  /**
   * Generate brand-aware error message for error category and severity
   */
  generateCategoryMessage(
    category: ErrorCategory,
    severity: ErrorSeverity,
    context?: Record<string, string>
  ): BrandAwareErrorMessage {
    const template = this.templates[category];
    const variables = {
      brandName: this.brandNames.appName,
      organizationName: this.brandNames.organizationName,
      fullBrand: this.brandNames.fullBrand,
      shortBrand: this.brandNames.shortBrand,
      navBrand: this.brandNames.navBrand,
      severity: severity,
      ...context,
    };

    return {
      message: this.processTemplate(template.messageTemplate, variables),
      supportContact: this.processTemplate(template.supportTemplate, variables),
      title: this.processTemplate(template.titleTemplate, variables),
      retryMessage: this.processTemplate(template.retryTemplate, variables),
      helpText: this.processTemplate(template.helpTemplate, variables),
    };
  }

  /**
   * Process template string with brand variables
   */
  private processTemplate(template: string, variables: Record<string, string>): string {
    let processedTemplate = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      processedTemplate = processedTemplate.replace(regex, String(value));
    });
    
    return processedTemplate;
  }

  /**
   * Update brand names
   */
  updateBrandNames(brandNames: BrandNameConfig): void {
    this.brandNames = brandNames;
  }

  /**
   * Update error templates
   */
  updateTemplates(templates: Partial<Record<ErrorCategory, BrandAwareErrorTemplate>>): void {
    this.templates = {
      ...this.templates,
      ...templates,
    };
  }

  /**
   * Get current brand names
   */
  getBrandNames(): BrandNameConfig {
    return { ...this.brandNames };
  }

  /**
   * Get current templates
   */
  getTemplates(): Record<ErrorCategory, BrandAwareErrorTemplate> {
    return { ...this.templates };
  }
}

/**
 * Global brand-aware error generator instance
 */
let globalErrorGenerator: BrandAwareErrorGenerator | null = null;

/**
 * Initialize the global error generator
 */
export function initializeBrandAwareErrors(brandNames: BrandNameConfig): void {
  globalErrorGenerator = new BrandAwareErrorGenerator(brandNames);
}

/**
 * Get the global error generator
 */
export function getBrandAwareErrorGenerator(): BrandAwareErrorGenerator {
  if (!globalErrorGenerator) {
    throw new Error('Brand-aware error generator not initialized. Call initializeBrandAwareErrors() first.');
  }
  return globalErrorGenerator;
}

/**
 * Update global brand names for error messages
 */
export function updateBrandAwareErrorBrandNames(brandNames: BrandNameConfig): void {
  if (globalErrorGenerator) {
    globalErrorGenerator.updateBrandNames(brandNames);
  }
}

/**
 * Generate brand-aware error message from global generator
 */
export function generateBrandAwareErrorMessage(error: AppError, context?: Record<string, string>): BrandAwareErrorMessage {
  return getBrandAwareErrorGenerator().generateErrorMessage(error, context);
}

/**
 * Generate brand-aware category message from global generator
 */
export function generateBrandAwareCategoryMessage(
  category: ErrorCategory,
  severity: ErrorSeverity,
  context?: Record<string, string>
): BrandAwareErrorMessage {
  return getBrandAwareErrorGenerator().generateCategoryMessage(category, severity, context);
}
