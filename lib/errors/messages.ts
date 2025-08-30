/**
 * User-Safe Error Message Mapper
 * 
 * Maps internal error codes and messages to user-friendly, actionable messages
 * that are safe to display to end users.
 */

import { ErrorCategory, ErrorSeverity } from './types';

/**
 * User-friendly error message configuration
 */
export interface UserErrorMessage {
  title: string;
  message: string;
  action?: string;
  helpText?: string;
  icon?: string;
  variant?: 'error' | 'warning' | 'info';
}

/**
 * Error message mapping by error code
 */
const ERROR_MESSAGE_MAP: Record<string, UserErrorMessage> = {
  // Validation Errors
  VALIDATION_ERROR: {
    title: 'Input Error',
    message: 'Please check your input and try again.',
    action: 'Review the highlighted fields and correct any errors.',
    icon: '⚠️',
    variant: 'warning'
  },
  
  FIELD_REQUIRED: {
    title: 'Required Field',
    message: 'This field is required.',
    action: 'Please fill in the required information.',
    icon: '❗',
    variant: 'warning'
  },
  
  INVALID_EMAIL: {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    action: 'Check the email format (example@domain.com).',
    icon: '📧',
    variant: 'warning'
  },
  
  INVALID_PHONE: {
    title: 'Invalid Phone',
    message: 'Please enter a valid phone number.',
    action: 'Include area code and use numbers only.',
    icon: '📞',
    variant: 'warning'
  },
  
  // Authentication Errors
  AUTHENTICATION_ERROR: {
    title: 'Sign In Required',
    message: 'You need to be signed in to access this feature.',
    action: 'Please sign in to your account.',
    helpText: 'If you don\'t have an account, you can create one for free.',
    icon: '🔐',
    variant: 'info'
  },
  
  INVALID_CREDENTIALS: {
    title: 'Sign In Failed',
    message: 'The email or password you entered is incorrect.',
    action: 'Please check your credentials and try again.',
    helpText: 'Forgot your password? Use the reset password link.',
    icon: '🔑',
    variant: 'error'
  },
  
  SESSION_EXPIRED: {
    title: 'Session Expired',
    message: 'Your session has expired for security.',
    action: 'Please sign in again to continue.',
    icon: '⏰',
    variant: 'info'
  },
  
  // Authorization Errors
  AUTHORIZATION_ERROR: {
    title: 'Access Denied',
    message: 'You don\'t have permission to perform this action.',
    action: 'Contact your administrator if you need access.',
    icon: '🚫',
    variant: 'error'
  },
  
  INSUFFICIENT_PERMISSIONS: {
    title: 'Insufficient Permissions',
    message: 'This action requires additional permissions.',
    action: 'Contact your administrator to request access.',
    icon: '🔒',
    variant: 'error'
  },
  
  // Database Errors
  DATABASE_ERROR: {
    title: 'Service Unavailable',
    message: 'Our database is temporarily unavailable.',
    action: 'Please try again in a few moments.',
    helpText: 'If the problem persists, contact support.',
    icon: '💾',
    variant: 'error'
  },
  
  RECORD_NOT_FOUND: {
    title: 'Not Found',
    message: 'The requested item could not be found.',
    action: 'It may have been moved or deleted.',
    icon: '🔍',
    variant: 'info'
  },
  
  DUPLICATE_RECORD: {
    title: 'Already Exists',
    message: 'This item already exists in the system.',
    action: 'Please check for existing records or use a different value.',
    icon: '📋',
    variant: 'warning'
  },
  
  // External Service Errors
  EXTERNAL_SERVICE_ERROR: {
    title: 'Service Unavailable',
    message: 'An external service is currently unavailable.',
    action: 'Please try again later.',
    helpText: 'We apologize for the inconvenience.',
    icon: '🌐',
    variant: 'error'
  },
  
  EMAIL_SERVICE_ERROR: {
    title: 'Email Service Issue',
    message: 'We couldn\'t send your email right now.',
    action: 'Please try again or use an alternative contact method.',
    icon: '📧',
    variant: 'error'
  },
  
  PAYMENT_SERVICE_ERROR: {
    title: 'Payment Issue',
    message: 'We couldn\'t process your payment.',
    action: 'Please check your payment method and try again.',
    helpText: 'Contact support if the problem continues.',
    icon: '💳',
    variant: 'error'
  },
  
  // Network Errors
  NETWORK_ERROR: {
    title: 'Connection Problem',
    message: 'There was a problem connecting to our servers.',
    action: 'Please check your internet connection and try again.',
    icon: '📡',
    variant: 'error'
  },
  
  TIMEOUT_ERROR: {
    title: 'Request Timeout',
    message: 'The request took too long to complete.',
    action: 'Please try again with a stable internet connection.',
    icon: '⏱️',
    variant: 'warning'
  },
  
  // Business Logic Errors
  BUSINESS_LOGIC_ERROR: {
    title: 'Action Not Allowed',
    message: 'This action cannot be completed due to business rules.',
    action: 'Please review the requirements and try again.',
    icon: '📋',
    variant: 'warning'
  },
  
  BOOKING_CONFLICT: {
    title: 'Scheduling Conflict',
    message: 'This time slot is no longer available.',
    action: 'Please select a different time.',
    icon: '📅',
    variant: 'warning'
  },
  
  CAPACITY_EXCEEDED: {
    title: 'Capacity Reached',
    message: 'The maximum capacity has been reached.',
    action: 'Please try again later or choose a different option.',
    icon: '📊',
    variant: 'warning'
  },
  
  // Rate Limiting
  RATE_LIMIT_ERROR: {
    title: 'Too Many Requests',
    message: 'You\'re making requests too quickly.',
    action: 'Please wait a moment before trying again.',
    icon: '⏳',
    variant: 'warning'
  },
  
  // File Upload Errors
  FILE_TOO_LARGE: {
    title: 'File Too Large',
    message: 'The file you\'re trying to upload is too large.',
    action: 'Please choose a smaller file or compress it.',
    icon: '📁',
    variant: 'warning'
  },
  
  INVALID_FILE_TYPE: {
    title: 'Invalid File Type',
    message: 'This file type is not supported.',
    action: 'Please use a supported file format.',
    icon: '📄',
    variant: 'warning'
  },
  
  // Security Errors
  SECURITY_ERROR: {
    title: 'Security Alert',
    message: 'A security issue was detected with your request.',
    action: 'Please contact support if you believe this is an error.',
    icon: '🛡️',
    variant: 'error'
  },
  
  SUSPICIOUS_ACTIVITY: {
    title: 'Account Protection',
    message: 'Unusual activity was detected on your account.',
    action: 'Please verify your identity to continue.',
    icon: '🚨',
    variant: 'error'
  },
  
  // System Errors (Generic)
  SYSTEM_ERROR: {
    title: 'System Error',
    message: 'An unexpected error occurred.',
    action: 'Please try again later.',
    helpText: 'Our team has been automatically notified.',
    icon: '⚙️',
    variant: 'error'
  },
  
  MAINTENANCE_MODE: {
    title: 'Maintenance In Progress',
    message: 'We\'re currently performing system maintenance.',
    action: 'Please try again in a few minutes.',
    helpText: 'Thank you for your patience.',
    icon: '🔧',
    variant: 'info'
  }
};

/**
 * Category-based default messages for unknown error codes
 */
const CATEGORY_DEFAULTS: Record<ErrorCategory, UserErrorMessage> = {
  [ErrorCategory.VALIDATION]: {
    title: 'Input Error',
    message: 'Please check your input and try again.',
    action: 'Review and correct any highlighted fields.',
    icon: '⚠️',
    variant: 'warning'
  },
  
  [ErrorCategory.AUTHENTICATION]: {
    title: 'Authentication Required',
    message: 'Please sign in to continue.',
    action: 'Sign in to your account.',
    icon: '🔐',
    variant: 'info'
  },
  
  [ErrorCategory.AUTHORIZATION]: {
    title: 'Access Denied',
    message: 'You don\'t have permission for this action.',
    action: 'Contact your administrator if needed.',
    icon: '🚫',
    variant: 'error'
  },
  
  [ErrorCategory.DATABASE]: {
    title: 'Service Issue',
    message: 'We\'re experiencing technical difficulties.',
    action: 'Please try again in a moment.',
    icon: '💾',
    variant: 'error'
  },
  
  [ErrorCategory.EXTERNAL_SERVICE]: {
    title: 'Service Unavailable',
    message: 'An external service is currently unavailable.',
    action: 'Please try again later.',
    icon: '🌐',
    variant: 'error'
  },
  
  [ErrorCategory.NETWORK]: {
    title: 'Connection Issue',
    message: 'Please check your internet connection.',
    action: 'Try again with a stable connection.',
    icon: '📡',
    variant: 'error'
  },
  
  [ErrorCategory.BUSINESS_LOGIC]: {
    title: 'Action Not Allowed',
    message: 'This action cannot be completed.',
    action: 'Please review the requirements.',
    icon: '📋',
    variant: 'warning'
  },
  
  [ErrorCategory.SYSTEM]: {
    title: 'System Error',
    message: 'An unexpected error occurred.',
    action: 'Please try again later.',
    icon: '⚙️',
    variant: 'error'
  },
  
  [ErrorCategory.SECURITY]: {
    title: 'Security Alert',
    message: 'A security issue was detected.',
    action: 'Contact support if this seems incorrect.',
    icon: '🛡️',
    variant: 'error'
  },
  
  [ErrorCategory.RATE_LIMIT]: {
    title: 'Rate Limit',
    message: 'Too many requests.',
    action: 'Please wait before trying again.',
    icon: '⏳',
    variant: 'warning'
  },
  
  [ErrorCategory.NOT_FOUND]: {
    title: 'Not Found',
    message: 'The requested item wasn\'t found.',
    action: 'It may have been moved or deleted.',
    icon: '🔍',
    variant: 'info'
  },
  
  [ErrorCategory.CONFLICT]: {
    title: 'Conflict',
    message: 'A conflict occurred with this request.',
    action: 'Please refresh and try again.',
    icon: '⚠️',
    variant: 'warning'
  },
  
  [ErrorCategory.INTERNAL]: {
    title: 'Internal Error',
    message: 'An internal error occurred.',
    action: 'Please try again later.',
    icon: '⚙️',
    variant: 'error'
  }
};

/**
 * Severity-based message enhancements
 */
const SEVERITY_ENHANCEMENTS: Record<ErrorSeverity, Partial<UserErrorMessage>> = {
  [ErrorSeverity.LOW]: {
    variant: 'info'
  },
  
  [ErrorSeverity.MEDIUM]: {
    variant: 'warning'
  },
  
  [ErrorSeverity.HIGH]: {
    variant: 'error',
    helpText: 'If this problem continues, please contact support.'
  },
  
  [ErrorSeverity.CRITICAL]: {
    variant: 'error',
    helpText: 'This issue has been reported to our technical team.'
  }
};

/**
 * Error Message Mapper Class
 */
export class ErrorMessageMapper {
  /**
   * Get user-friendly error message for a given error code
   */
  static getUserMessage(
    errorCode: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    customMessage?: string
  ): UserErrorMessage {
    // Check for exact code match first
    let userMessage = ERROR_MESSAGE_MAP[errorCode];
    
    // Fall back to category default
    if (!userMessage) {
      userMessage = CATEGORY_DEFAULTS[category];
    }
    
    // Apply severity enhancements
    const severityEnhancement = SEVERITY_ENHANCEMENTS[severity];
    const enhancedMessage = {
      ...userMessage,
      ...severityEnhancement
    };
    
    // Use custom message if provided and safe
    if (customMessage && this.isSafeCustomMessage(customMessage)) {
      enhancedMessage.message = customMessage;
    }
    
    return enhancedMessage;
  }
  
  /**
   * Get a simple user-safe message string
   */
  static getSimpleMessage(
    errorCode: string,
    category: ErrorCategory,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM
  ): string {
    const userMessage = this.getUserMessage(errorCode, category, severity);
    return userMessage.message;
  }
  
  /**
   * Get actionable instruction for user
   */
  static getActionMessage(
    errorCode: string,
    category: ErrorCategory
  ): string | undefined {
    const userMessage = this.getUserMessage(errorCode, category);
    return userMessage.action;
  }
  
  /**
   * Check if a custom message is safe to display to users
   */
  private static isSafeCustomMessage(message: string): boolean {
    const unsafePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /key/i,
      /internal/i,
      /debug/i,
      /stack/i,
      /trace/i,
      /sql/i,
      /database/i,
      /connection/i,
      /server/i,
      /localhost/i,
      /127\.0\.0\.1/i,
      /file:\/\//i,
      /\/[a-zA-Z]:\\/i, // Windows paths
      /\/home\//i,      // Unix paths
      /\/var\//i,       // System paths
    ];
    
    return !unsafePatterns.some(pattern => pattern.test(message));
  }
  
  /**
   * Register custom error message
   */
  static registerCustomMessage(errorCode: string, message: UserErrorMessage): void {
    ERROR_MESSAGE_MAP[errorCode] = message;
  }
  
  /**
   * Get all available error codes
   */
  static getAvailableCodes(): string[] {
    return Object.keys(ERROR_MESSAGE_MAP);
  }
  
  /**
   * Format error for display in different contexts
   */
  static formatForContext(
    errorCode: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: 'toast' | 'modal' | 'inline' | 'page' = 'toast'
  ): UserErrorMessage {
    const baseMessage = this.getUserMessage(errorCode, category, severity);
    
    switch (context) {
      case 'toast':
        // Shorter messages for toast notifications
        return {
          ...baseMessage,
          message: baseMessage.message.length > 60 
            ? baseMessage.message.substring(0, 60) + '...' 
            : baseMessage.message
        };
        
      case 'modal':
        // Full details for modals
        return baseMessage;
        
      case 'inline':
        // Concise for inline display
        return {
          ...baseMessage,
          title: '', // No title for inline
          helpText: undefined // No help text inline
        };
        
      case 'page':
        // Full page error with all details
        return baseMessage;
        
      default:
        return baseMessage;
    }
  }
}