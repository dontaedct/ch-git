/**
 * Security Configuration
 * 
 * Centralized security configuration for the application
 * Defines security policies, roles, and access control rules
 */

import { UserRole, ResourceType, OperationType } from '@/lib/supabase/secure-client';

// Security configuration interface
export interface SecurityConfig {
  // Authentication settings
  auth: {
    sessionTimeoutMinutes: number;
    maxLoginAttempts: number;
    lockoutDurationMinutes: number;
    requireMFA: boolean;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
  };
  
  // Authorization settings
  authorization: {
    defaultRole: UserRole;
    roleHierarchy: Record<UserRole, UserRole[]>;
    resourcePermissions: Record<ResourceType, Record<OperationType, UserRole[]>>;
  };
  
  // Audit logging settings
  audit: {
    enabled: boolean;
    logLevel: 'low' | 'medium' | 'high' | 'critical';
    retentionDays: number;
    sensitiveFields: string[];
    excludePatterns: RegExp[];
  };
  
  // RLS enforcement settings
  rls: {
    strictMode: boolean;
    validateOwnership: boolean;
    requireClientValidation: boolean;
    maxQueryComplexity: number;
  };
  
  // Rate limiting settings
  rateLimit: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
}

// Default security configuration
export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  auth: {
    sessionTimeoutMinutes: 480, // 8 hours
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 30,
    requireMFA: false, // Enable in production
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
  },
  
  authorization: {
    defaultRole: UserRole.CLIENT,
    roleHierarchy: {
      [UserRole.CLIENT]: [],
      [UserRole.COACH]: [UserRole.CLIENT],
      [UserRole.ADMIN]: [UserRole.COACH, UserRole.CLIENT],
    },
    resourcePermissions: {
      [ResourceType.CLIENT]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
      [ResourceType.PROGRESS_METRIC]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
      [ResourceType.WEEKLY_PLAN]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
      [ResourceType.CHECK_IN]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
      [ResourceType.SESSION]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
      [ResourceType.TRAINER]: {
        [OperationType.CREATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.READ]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.UPDATE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.DELETE]: [UserRole.COACH, UserRole.ADMIN],
        [OperationType.LIST]: [UserRole.COACH, UserRole.ADMIN],
      },
    },
  },
  
  audit: {
    enabled: true,
    logLevel: 'medium',
    retentionDays: 90,
    sensitiveFields: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'email',
      'phone',
      'stripe_customer_id',
      'medical_notes',
      'emergency_contact',
    ],
    excludePatterns: [
      /^password$/i,
      /^token$/i,
      /^secret$/i,
      /^key$/i,
      /^authorization$/i,
    ],
  },
  
  rls: {
    strictMode: true,
    validateOwnership: true,
    requireClientValidation: true,
    maxQueryComplexity: 10,
  },
  
  rateLimit: {
    enabled: true,
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // per window
    skipSuccessfulRequests: false,
    skipFailedRequests: true,
  },
};

// Environment-specific security configuration
export function getSecurityConfig(): SecurityConfig {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    return {
      ...DEFAULT_SECURITY_CONFIG,
      auth: {
        ...DEFAULT_SECURITY_CONFIG.auth,
        requireMFA: true,
        sessionTimeoutMinutes: 240, // 4 hours in production
      },
      audit: {
        ...DEFAULT_SECURITY_CONFIG.audit,
        logLevel: 'high',
        retentionDays: 365, // 1 year in production
      },
      rls: {
        ...DEFAULT_SECURITY_CONFIG.rls,
        strictMode: true,
        validateOwnership: true,
      },
    };
  }
  
  if (env === 'test') {
    return {
      ...DEFAULT_SECURITY_CONFIG,
      audit: {
        ...DEFAULT_SECURITY_CONFIG.audit,
        enabled: false, // Disable audit logging in tests
      },
      rls: {
        ...DEFAULT_SECURITY_CONFIG.rls,
        strictMode: false, // Relax RLS in tests
      },
    };
  }
  
  // Development environment
  return DEFAULT_SECURITY_CONFIG;
}

// Security validation functions
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const config = getSecurityConfig();
  const policy = config.auth.passwordPolicy;
  const errors: string[] = [];
  
  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }
  
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateRoleAccess(
  userRole: UserRole,
  requiredRoles: UserRole[]
): boolean {
  const config = getSecurityConfig();
  
  // Direct role match
  if (requiredRoles.includes(userRole)) {
    return true;
  }
  
  // Check role hierarchy
  const userHierarchy = config.authorization.roleHierarchy[userRole] || [];
  return userHierarchy.some(role => requiredRoles.includes(role));
}

export function validateResourceAccess(
  userRole: UserRole,
  resourceType: ResourceType,
  operation: OperationType
): boolean {
  const config = getSecurityConfig();
  const permissions = config.authorization.resourcePermissions[resourceType];
  
  if (!permissions) {
    return false;
  }
  
  const allowedRoles = permissions[operation];
  if (!allowedRoles) {
    return false;
  }
  
  return validateRoleAccess(userRole, allowedRoles);
}

// Security utility functions
export function sanitizeSensitiveData(data: Record<string, unknown>): Record<string, unknown> {
  const config = getSecurityConfig();
  const sanitized = { ...data };
  
  config.audit.sensitiveFields.forEach(field => {
    if (sanitized[field] !== undefined) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

export function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export function validateSessionTimeout(lastActivity: Date): boolean {
  const config = getSecurityConfig();
  const timeoutMs = config.auth.sessionTimeoutMinutes * 60 * 1000;
  const now = new Date();
  
  return (now.getTime() - lastActivity.getTime()) < timeoutMs;
}

// Export the current security configuration
export const securityConfig = getSecurityConfig();
