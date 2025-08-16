/**
 * Secure Database Access Layer
 * 
 * This module provides secure database access that enforces RLS policies
 * and ensures proper user context validation for all data operations.
 * 
 * Key Security Features:
 * - Enforces RLS policies through authenticated Supabase client
 * - Validates user context and ownership for all operations
 * - Implements role-based access control
 * - Provides audit logging for security events
 * - Prevents direct database access without proper authentication
 */

import { createIsolatedSupabaseClient } from './server';
import { auditLogger, AuditEventType, AuditSeverity } from '@/lib/audit-logger';
import { getUserOrFail } from '@/lib/auth/guard';
import type { User } from '@/lib/auth/guard';

// Role definitions for access control
export enum UserRole {
  COACH = 'coach',
  ADMIN = 'admin',
  CLIENT = 'client'
}

// Resource types for audit logging
export enum ResourceType {
  CLIENT = 'client',
  PROGRESS_METRIC = 'progress_metric',
  WEEKLY_PLAN = 'weekly_plan',
  CHECK_IN = 'check_in',
  SESSION = 'session',
  TRAINER = 'trainer'
}

// Operation types for audit logging
export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list'
}

// Secure client interface
export interface SecureClient {
  user: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any; // Supabase client instance - TODO: Replace with proper type
  role: UserRole;
}

// Security context for operations
export interface SecurityContext {
  userId: string;
  userEmail?: string;
  userRole: UserRole;
  resourceType: ResourceType;
  operation: OperationType;
  resourceId?: string;
  additionalContext?: Record<string, unknown>;
}

// Error types for security violations
export class SecurityViolationError extends Error {
  constructor(
    message: string,
    public context: SecurityContext,
    public violationType: 'authentication' | 'authorization' | 'validation' | 'rls'
  ) {
    super(message);
    this.name = 'SecurityViolationError';
  }
}

export class RLSViolationError extends SecurityViolationError {
  constructor(message: string, context: SecurityContext) {
    super(message, context, 'rls');
    this.name = 'RLSViolationError';
  }
}

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  windowMs: 60000, // 1 minute
  hourWindowMs: 3600000, // 1 hour
};

// In-memory rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number; hourlyCount: number; hourlyResetTime: number }>();

/**
 * Checks if a user has exceeded rate limits
 */
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimits = rateLimitStore.get(userId);
  
  if (!userLimits) {
    // First request
    rateLimitStore.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs,
      hourlyCount: 1,
      hourlyResetTime: now + RATE_LIMIT_CONFIG.hourWindowMs
    });
    return true;
  }
  
  // Check if we need to reset the minute counter
  if (now > userLimits.resetTime) {
    userLimits.count = 1;
    userLimits.resetTime = now + RATE_LIMIT_CONFIG.windowMs;
  } else {
    userLimits.count++;
  }
  
  // Check if we need to reset the hourly counter
  if (now > userLimits.hourlyResetTime) {
    userLimits.hourlyCount = 1;
    userLimits.hourlyResetTime = now + RATE_LIMIT_CONFIG.hourWindowMs;
  } else {
    userLimits.hourlyCount++;
  }
  
  // Check limits
  if (userLimits.count > RATE_LIMIT_CONFIG.maxRequestsPerMinute) {
    return false;
  }
  
  if (userLimits.hourlyCount > RATE_LIMIT_CONFIG.maxRequestsPerHour) {
    return false;
  }
  
  return true;
}

/**
 * Validates session timeout and freshness
 */
function validateSessionTimeout(lastActivity: number, maxAgeMs: number = 30 * 60 * 1000): boolean {
  const now = Date.now();
  return (now - lastActivity) < maxAgeMs;
}

/**
 * Safely logs audit events without breaking the main operation
 */
function safeAuditLog(
  logger: typeof auditLogger,
  method: 'logSecurityEvent',
  eventType: string,
  severity: string,
  userId?: string,
  userEmail?: string,
  details?: Record<string, unknown>
): void {
  try {
    logger.logSecurityEvent(
      eventType as Parameters<typeof auditLogger.logSecurityEvent>[0],
      severity as Parameters<typeof auditLogger.logSecurityEvent>[1],
      userId,
      userEmail,
      details
    );
  } catch (auditError) {
    // Log audit failure to console but don't break the main operation
    console.error('[Audit Logger Error] Failed to log security event:', auditError);
    
    // In production, you might want to send this to an external monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to external monitoring service (e.g., Sentry, DataDog)
      console.error('[Production] Audit logging failure should be monitored externally');
    }
  }
}

/**
 * Creates a secure database client with proper authentication and RLS enforcement
 */
export async function createSecureClient(): Promise<SecureClient> {
  try {
    // Create authenticated Supabase client
    const supabase = await createIsolatedSupabaseClient();
    
    // Validate user authentication
    const user = await getUserOrFail(supabase);
    
    // Check rate limiting
    if (!checkRateLimit(user.id)) {
      safeAuditLog(auditLogger, 'logSecurityEvent',
        AuditEventType.SECURITY_EVENT,
        AuditSeverity.HIGH,
        user.id,
        user.email,
        { 
          violation: 'rate_limit_exceeded',
          operation: 'create_secure_client',
          timestamp: new Date().toISOString()
        }
      );
      
      throw new SecurityViolationError(
        'Rate limit exceeded. Please try again later.',
        {
          userId: user.id,
          userRole: UserRole.CLIENT,
          resourceType: ResourceType.CLIENT,
          operation: OperationType.READ
        },
        'authorization'
      );
    }
    
    // Validate session timeout (30 minutes)
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes
    if (user.last_sign_in_at) {
      const lastSignIn = new Date(user.last_sign_in_at).getTime();
      if (!validateSessionTimeout(lastSignIn, sessionTimeout)) {
        safeAuditLog(auditLogger, 'logSecurityEvent',
          AuditEventType.SECURITY_EVENT,
          AuditSeverity.HIGH,
          user.id,
          user.email,
          { 
            violation: 'session_expired',
            lastSignIn: user.last_sign_in_at,
            operation: 'create_secure_client',
            timestamp: new Date().toISOString()
          }
        );
        
        throw new SecurityViolationError(
          'Session expired. Please log in again.',
          {
            userId: user.id,
            userRole: UserRole.CLIENT,
            resourceType: ResourceType.CLIENT,
            operation: OperationType.READ
          },
          'authentication'
        );
      }
    }
    
    // Determine user role from metadata
    const role = determineUserRole(user);
    
    // Log successful authentication
    safeAuditLog(auditLogger, 'logSecurityEvent',
      AuditEventType.USER_LOGIN,
      AuditSeverity.LOW,
      user.id,
      user.email,
      { role, timestamp: new Date().toISOString() }
    );
    
    return {
      user,
      supabase,
      role
    };
  } catch (error) {
    // Log authentication failure
    safeAuditLog(auditLogger, 'logSecurityEvent',
      AuditEventType.SECURITY_EVENT,
      AuditSeverity.HIGH,
      undefined,
      undefined,
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        operation: 'create_secure_client',
        timestamp: new Date().toISOString()
      }
    );
    
    throw new SecurityViolationError(
      'Failed to create secure client: Authentication required',
      {
        userId: 'unknown',
        userRole: UserRole.CLIENT,
        resourceType: ResourceType.CLIENT,
        operation: OperationType.READ
      },
      'authentication'
    );
  }
}

/**
 * Determines user role from user metadata
 */
function determineUserRole(user: User): UserRole {
  // Check app_metadata first (set by Supabase)
  if (user.app_metadata?.roles?.includes('admin')) {
    return UserRole.ADMIN;
  }
  
  if (user.app_metadata?.roles?.includes('coach')) {
    return UserRole.COACH;
  }
  
  // Check user_metadata (set by application)
  if (user.user_metadata?.roles?.includes('admin')) {
    return UserRole.ADMIN;
  }
  
  if (user.user_metadata?.roles?.includes('coach')) {
    return UserRole.COACH;
  }
  
  // Default to client role
  return UserRole.CLIENT;
}

/**
 * Validates user has permission to access a specific resource
 */
export function validateResourceAccess(
  context: SecurityContext,
  resourceOwnerId: string,
  allowedRoles: UserRole[] = [UserRole.COACH, UserRole.ADMIN]
): void {
  // Check if user has required role
  if (!allowedRoles.includes(context.userRole)) {
          safeAuditLog(auditLogger, 'logSecurityEvent',
        AuditEventType.SECURITY_EVENT,
        AuditSeverity.HIGH,
        context.userId,
        context.userEmail,
        {
          violation: 'insufficient_role',
          requiredRoles: allowedRoles,
          userRole: context.userRole,
          resourceType: context.resourceType,
          operation: context.operation,
          resourceId: context.resourceId
        }
      );
    
    throw new SecurityViolationError(
      `Insufficient role: ${context.userRole} cannot perform ${context.operation} on ${context.resourceType}`,
      context,
      'authorization'
    );
  }
  
  // For coaches, ensure they can only access their own resources
  if (context.userRole === UserRole.COACH && context.userId !== resourceOwnerId) {
          safeAuditLog(auditLogger, 'logSecurityEvent',
        AuditEventType.SECURITY_EVENT,
        AuditSeverity.HIGH,
        context.userId,
        context.userEmail,
        {
          violation: 'resource_ownership_violation',
          resourceOwnerId,
          userId: context.userId,
          resourceType: context.resourceType,
          operation: context.operation,
          resourceId: context.resourceId
        }
      );
    
    throw new SecurityViolationError(
      `Access denied: Cannot access ${context.resourceType} owned by another user`,
      context,
      'authorization'
    );
  }
  
  // Log successful access validation
  auditLogger.logDataOperation(
    AuditEventType.DATA_READ,
    context.userId,
    context.userEmail ?? 'unknown',
    context.resourceType,
    context.resourceId ?? 'unknown',
    context.operation,
    context.additionalContext
  );
}

/**
 * Creates a security context for an operation
 */
export function createSecurityContext(
  userId: string,
  userEmail: string | undefined,
  userRole: UserRole,
  resourceType: ResourceType,
  operation: OperationType,
  resourceId?: string,
  additionalContext?: Record<string, unknown>
): SecurityContext {
  return {
    userId,
    userEmail,
    userRole,
    resourceType,
    operation,
    resourceId,
    additionalContext
  };
}

/**
 * Handles errors gracefully and provides recovery mechanisms
 */
function handleSecurityError(error: unknown, context: SecurityContext): never {
  // Log the error for monitoring
                 safeAuditLog(auditLogger, 'logSecurityEvent',
        AuditEventType.SECURITY_EVENT,
        AuditSeverity.HIGH,
        context.userId,
        context.userEmail,
        {
          error: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          resourceType: context.resourceType,
          operation: context.operation,
          resourceId: context.resourceId,
          additionalContext: context.additionalContext,
          timestamp: new Date().toISOString()
        }
      );
  
  // Determine appropriate error type
  if (error instanceof SecurityViolationError) {
    throw error;
  }
  
  if (error instanceof RLSViolationError) {
    throw error;
  }
  
  // Handle database connection errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string };
    
    switch (dbError.code) {
      case 'PGRST301': // Row not found
        throw new SecurityViolationError(
          'Resource not found',
          context,
          'validation'
        );
      case 'PGRST302': // RLS policy violation
        throw new RLSViolationError(
          'Access denied by RLS policy',
          context
        );
      case 'PGRST303': // Invalid input
        throw new SecurityViolationError(
          'Invalid input provided',
          context,
          'validation'
        );
      default:
        throw new SecurityViolationError(
          `Database error: ${dbError.message}`,
          context,
          'rls'
        );
    }
  }
  
  // Generic error handling
  throw new SecurityViolationError(
    `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    context,
    'validation'
  );
}

/**
 * Executes a secure database operation with proper validation and logging
 */
export async function executeSecureOperation<T>(
  operation: () => Promise<T>,
  context: SecurityContext
): Promise<T> {
  try {
    // Execute the operation
    const result = await operation();
    
    // Log successful operation
    auditLogger.logDataOperation(
      AuditEventType.DATA_READ,
      context.userId,
      context.userEmail ?? 'unknown',
      context.resourceType,
      context.resourceId ?? 'unknown',
      context.operation,
      { ...context.additionalContext, success: true }
    );
    
    return result;
  } catch (error) {
    // Handle the error with recovery mechanisms
    handleSecurityError(error, context);
  }
}

/**
 * Validates that a resource belongs to the authenticated user and returns the data
 * This eliminates the need for double database calls
 */
export async function validateResourceOwnershipAndGetData<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any, // TODO: Replace with proper Supabase client type
  tableName: string,
  resourceId: string,
  userId: string,
  context: SecurityContext,
  selectFields: string = '*'
): Promise<T> {
  try {
    // Validate and sanitize input parameters
    const { tableName: sanitizedTableName, resourceId: sanitizedResourceId, userId: sanitizedUserId } = 
      validateAndSanitizeInput(tableName, resourceId, userId);
    
    // Query the resource to verify ownership AND get data in one call
    const { data, error } = await supabase
      .from(sanitizedTableName)
      .select(selectFields)
      .eq('id', sanitizedResourceId)
      .eq('coach_id', sanitizedUserId) // This ensures ownership AND gets data
      .maybeSingle();
    
    if (error) {
      throw new RLSViolationError(
        `Failed to validate resource ownership: ${error.message}`,
        context
      );
    }
    
    if (!data) {
      // Log potential security violation attempt
              safeAuditLog(auditLogger, 'logSecurityEvent',
          AuditEventType.SECURITY_EVENT,
          AuditSeverity.HIGH,
          context.userId,
          context.userEmail,
          {
            violation: 'resource_not_found_or_unauthorized',
            tableName: sanitizedTableName,
            resourceId: sanitizedResourceId,
            userId: context.userId,
            resourceType: context.resourceType,
            operation: context.operation
          }
        );
      
      throw new SecurityViolationError(
        `Resource not found or access denied: ${sanitizedTableName} with id ${sanitizedResourceId}`,
        context,
        'authorization'
      );
    }
    
    return data;
  } catch (error) {
    if (error instanceof SecurityViolationError) {
      throw error;
    }
    
    throw new SecurityViolationError(
      `Failed to validate resource ownership: ${error instanceof Error ? error.message : 'Unknown error'}`,
      context,
      'validation'
    );
  }
}

/**
 * Validates that a resource belongs to the authenticated user
 * @deprecated Use validateResourceOwnershipAndGetData for better performance
 */
export async function validateResourceOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any, // TODO: Replace with proper Supabase client type
  tableName: string,
  resourceId: string,
  userId: string,
  context: SecurityContext
): Promise<void> {
  try {
    // Query the resource to verify ownership
    const { data, error } = await supabase
      .from(tableName)
      .select('coach_id')
      .eq('id', resourceId)
      .maybeSingle();
    
    if (error) {
      throw new RLSViolationError(
        `Failed to validate resource ownership: ${error.message}`,
        context
      );
    }
    
    if (!data) {
      throw new SecurityViolationError(
        `Resource not found: ${tableName} with id ${resourceId}`,
        context,
        'validation'
      );
    }
    
    // Validate ownership
    if (data.coach_id !== userId) {
              safeAuditLog(auditLogger, 'logSecurityEvent',
          AuditEventType.SECURITY_EVENT,
          AuditSeverity.HIGH,
          context.userId,
          context.userEmail,
          {
            violation: 'resource_ownership_violation',
            resourceOwnerId: data.coach_id,
            userId: context.userId,
            resourceType: context.resourceType,
            operation: context.operation,
            resourceId: context.resourceId
        }
        );
      
      throw new SecurityViolationError(
        `Access denied: Resource ${resourceId} does not belong to user ${userId}`,
        context,
        'authorization'
      );
    }
  } catch (error) {
    if (error instanceof SecurityViolationError) {
      throw error;
    }
    
    throw new SecurityViolationError(
      `Failed to validate resource ownership: ${error instanceof Error ? error.message : 'Unknown error'}`,
      context,
      'validation'
    );
  }
}

/**
 * Validates and sanitizes input parameters to prevent injection attacks
 */
export function validateAndSanitizeInput(
  tableName: string,
  resourceId: string,
  userId: string
): { tableName: string; resourceId: string; userId: string } {
  // Validate table name (only allow alphanumeric and underscores)
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    throw new SecurityViolationError(
      `Invalid table name: ${tableName}`,
      {
        userId: 'unknown',
        userRole: UserRole.CLIENT,
        resourceType: ResourceType.CLIENT,
        operation: OperationType.READ
      },
      'validation'
    );
  }
  
  // Validate UUID format for resourceId and userId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(resourceId)) {
    throw new SecurityViolationError(
      `Invalid resource ID format: ${resourceId}`,
      {
        userId: 'unknown',
        userRole: UserRole.CLIENT,
        resourceType: ResourceType.CLIENT,
        operation: OperationType.READ
      },
      'validation'
    );
  }
  
  if (!uuidRegex.test(userId)) {
    throw new SecurityViolationError(
      `Invalid user ID format: ${userId}`,
      {
        userId: 'unknown',
        userRole: UserRole.CLIENT,
        resourceType: ResourceType.CLIENT,
        operation: OperationType.READ
      },
      'validation'
    );
  }
  
  return {
    tableName: tableName.trim(),
    resourceId: resourceId.trim(),
    userId: userId.trim()
  };
}

// Cleanup rate limiting data periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  const oneHourAgo = now - RATE_LIMIT_CONFIG.hourWindowMs;
  
  for (const [userId, limits] of rateLimitStore.entries()) {
    if (limits.resetTime < now && limits.hourlyResetTime < oneHourAgo) {
      rateLimitStore.delete(userId);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Cleanup function for manual memory management
 */
export function cleanupSecuritySystem(): void {
  rateLimitStore.clear();
  
  // Log cleanup
  safeAuditLog(auditLogger, 'logSecurityEvent',
    AuditEventType.SYSTEM_STARTUP,
    AuditSeverity.LOW,
    undefined,
    undefined,
    {
      operation: 'cleanup_security_system',
      timestamp: new Date().toISOString(),
      clearedRateLimitEntries: rateLimitStore.size
    }
  );
}
