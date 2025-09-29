/**
 * Module Permission and Scope Management System
 * 
 * This module implements comprehensive permission and scope management for hot-pluggable modules,
 * providing granular access control, role-based permissions, and scope isolation per PRD Section 7.
 * 
 * Features:
 * - Role-based permission management
 * - Granular scope control
 * - Permission inheritance and delegation
 * - Dynamic permission updates
 * - Permission audit and monitoring
 */

import { z } from 'zod';
import type { ModulePermissions, ModuleSandbox } from './module-sandbox';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

export interface PermissionManager {
  checkPermission(permission: Permission, context?: PermissionContext): Promise<boolean>;
  grantPermission(permission: Permission, scope: PermissionScope): Promise<void>;
  revokePermission(permission: Permission, scope: PermissionScope): Promise<void>;
  updatePermissions(permissions: Permission[]): Promise<void>;
  getEffectivePermissions(context?: PermissionContext): Promise<Permission[]>;
  getPermissionHistory(timeRange?: TimeRange): Promise<PermissionAuditEntry[]>;
}

export interface Permission {
  readonly id: string;
  readonly name: string;
  readonly type: PermissionType;
  readonly resource: string;
  readonly action: string;
  readonly conditions?: PermissionCondition[];
  readonly metadata?: Record<string, any>;
}

export type PermissionType = 
  | 'system'
  | 'application'
  | 'database'
  | 'network'
  | 'filesystem'
  | 'ui'
  | 'api'
  | 'module';

export interface PermissionCondition {
  readonly field: string;
  readonly operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'matches' | 'not_matches';
  readonly value: any;
  readonly required: boolean;
}

export interface PermissionScope {
  readonly type: ScopeType;
  readonly target: string;
  readonly inheritance: InheritanceRule;
  readonly restrictions?: ScopeRestriction[];
}

export type ScopeType = 
  | 'global'
  | 'tenant'
  | 'module'
  | 'user'
  | 'role'
  | 'resource';

export interface InheritanceRule {
  readonly enabled: boolean;
  readonly strategy: 'additive' | 'restrictive' | 'override';
  readonly parentScopes: string[];
}

export interface ScopeRestriction {
  readonly type: 'time' | 'location' | 'usage' | 'condition';
  readonly rule: string;
  readonly parameters: Record<string, any>;
}

export interface PermissionContext {
  readonly moduleId: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly roleId?: string;
  readonly resourceId?: string;
  readonly timestamp: Date;
  readonly environment: 'development' | 'staging' | 'production';
  readonly metadata?: Record<string, any>;
}

export interface PermissionAuditEntry {
  readonly id: string;
  readonly moduleId: string;
  readonly action: 'grant' | 'revoke' | 'check' | 'update';
  readonly permission: Permission;
  readonly context: PermissionContext;
  readonly result: boolean;
  readonly reason?: string;
  readonly timestamp: Date;
}

export interface RoleDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: Permission[];
  readonly inheritsFrom?: string[];
  readonly scope: PermissionScope;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface TimeRange {
  readonly start: Date;
  readonly end: Date;
}

// =============================================================================
// SCHEMAS
// =============================================================================

const PermissionConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'matches', 'not_matches']),
  value: z.any(),
  required: z.boolean().default(true),
});

const PermissionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['system', 'application', 'database', 'network', 'filesystem', 'ui', 'api', 'module']),
  resource: z.string().min(1),
  action: z.string().min(1),
  conditions: z.array(PermissionConditionSchema).optional(),
  metadata: z.record(z.any()).optional(),
});

const ScopeRestrictionSchema = z.object({
  type: z.enum(['time', 'location', 'usage', 'condition']),
  rule: z.string().min(1),
  parameters: z.record(z.any()).default({}),
});

const InheritanceRuleSchema = z.object({
  enabled: z.boolean().default(true),
  strategy: z.enum(['additive', 'restrictive', 'override']).default('additive'),
  parentScopes: z.array(z.string()).default([]),
});

const PermissionScopeSchema = z.object({
  type: z.enum(['global', 'tenant', 'module', 'user', 'role', 'resource']),
  target: z.string().min(1),
  inheritance: InheritanceRuleSchema,
  restrictions: z.array(ScopeRestrictionSchema).optional(),
});

const PermissionContextSchema = z.object({
  moduleId: z.string().min(1),
  tenantId: z.string().min(1),
  userId: z.string().optional(),
  roleId: z.string().optional(),
  resourceId: z.string().optional(),
  timestamp: z.date(),
  environment: z.enum(['development', 'staging', 'production']),
  metadata: z.record(z.any()).optional(),
});

const RoleDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  permissions: z.array(PermissionSchema),
  inheritsFrom: z.array(z.string()).optional(),
  scope: PermissionScopeSchema,
  active: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// =============================================================================
// PERMISSION MANAGER IMPLEMENTATION
// =============================================================================

export class PermissionManagerImpl implements PermissionManager {
  private permissions = new Map<string, Permission>();
  private roles = new Map<string, RoleDefinition>();
  private scopes = new Map<string, PermissionScope>();
  private auditEntries: PermissionAuditEntry[] = [];
  private readonly sandbox: ModuleSandbox;

  constructor(sandbox: ModuleSandbox) {
    this.sandbox = sandbox;
    this.initializeDefaultPermissions();
    this.initializeDefaultRoles();
  }

  /**
   * Check if a specific permission is granted
   */
  async checkPermission(permission: Permission, context?: PermissionContext): Promise<boolean> {
    const auditId = this.generateAuditId();
    const checkContext = context || this.createDefaultContext();

    try {
      // Validate permission structure
      PermissionSchema.parse(permission);

      // Check if permission exists
      const existingPermission = this.permissions.get(permission.id);
      if (!existingPermission) {
        await this.logPermissionAudit(auditId, 'check', permission, checkContext, false, 'Permission not found');
        return false;
      }

      // Evaluate permission conditions
      const conditionsResult = await this.evaluateConditions(permission, checkContext);
      if (!conditionsResult.passed) {
        await this.logPermissionAudit(auditId, 'check', permission, checkContext, false, conditionsResult.reason);
        return false;
      }

      // Check scope restrictions
      const scopeResult = await this.evaluateScope(permission, checkContext);
      if (!scopeResult.allowed) {
        await this.logPermissionAudit(auditId, 'check', permission, checkContext, false, scopeResult.reason);
        return false;
      }

      // Check role-based permissions
      const roleResult = await this.evaluateRolePermissions(permission, checkContext);
      if (!roleResult.granted) {
        await this.logPermissionAudit(auditId, 'check', permission, checkContext, false, roleResult.reason);
        return false;
      }

      await this.logPermissionAudit(auditId, 'check', permission, checkContext, true, 'Permission granted');
      return true;
    } catch (error) {
      await this.logPermissionAudit(auditId, 'check', permission, checkContext, false, (error as Error).message);
      return false;
    }
  }

  /**
   * Grant a permission within a specific scope
   */
  async grantPermission(permission: Permission, scope: PermissionScope): Promise<void> {
    const auditId = this.generateAuditId();
    const context = this.createDefaultContext();

    try {
      // Validate inputs
      PermissionSchema.parse(permission);
      PermissionScopeSchema.parse(scope);

      // Check if we have permission to grant permissions
      const canGrant = await this.hasPermissionToModifyPermissions(context);
      if (!canGrant) {
        throw new PermissionDeniedError('Insufficient privileges to grant permissions');
      }

      // Store permission
      this.permissions.set(permission.id, permission);
      this.scopes.set(permission.id, scope);

      await this.logPermissionAudit(auditId, 'grant', permission, context, true, 'Permission granted successfully');
    } catch (error) {
      await this.logPermissionAudit(auditId, 'grant', permission, context, false, (error as Error).message);
      throw error;
    }
  }

  /**
   * Revoke a permission from a specific scope
   */
  async revokePermission(permission: Permission, scope: PermissionScope): Promise<void> {
    const auditId = this.generateAuditId();
    const context = this.createDefaultContext();

    try {
      // Check if we have permission to revoke permissions
      const canRevoke = await this.hasPermissionToModifyPermissions(context);
      if (!canRevoke) {
        throw new PermissionDeniedError('Insufficient privileges to revoke permissions');
      }

      // Remove permission
      this.permissions.delete(permission.id);
      this.scopes.delete(permission.id);

      await this.logPermissionAudit(auditId, 'revoke', permission, context, true, 'Permission revoked successfully');
    } catch (error) {
      await this.logPermissionAudit(auditId, 'revoke', permission, context, false, (error as Error).message);
      throw error;
    }
  }

  /**
   * Update multiple permissions at once
   */
  async updatePermissions(permissions: Permission[]): Promise<void> {
    const auditId = this.generateAuditId();
    const context = this.createDefaultContext();

    try {
      // Validate all permissions
      permissions.forEach(permission => PermissionSchema.parse(permission));

      // Check if we have permission to update permissions
      const canUpdate = await this.hasPermissionToModifyPermissions(context);
      if (!canUpdate) {
        throw new PermissionDeniedError('Insufficient privileges to update permissions');
      }

      // Update permissions atomically
      const originalPermissions = new Map(this.permissions);
      try {
        permissions.forEach(permission => {
          this.permissions.set(permission.id, permission);
        });

        for (const permission of permissions) {
          await this.logPermissionAudit(auditId, 'update', permission, context, true, 'Permission updated successfully');
        }
      } catch (error) {
        // Rollback on error
        this.permissions = originalPermissions;
        throw error;
      }
    } catch (error) {
      for (const permission of permissions) {
        await this.logPermissionAudit(auditId, 'update', permission, context, false, (error as Error).message);
      }
      throw error;
    }
  }

  /**
   * Get all effective permissions for a context
   */
  async getEffectivePermissions(context?: PermissionContext): Promise<Permission[]> {
    const checkContext = context || this.createDefaultContext();
    const effectivePermissions: Permission[] = [];

    // Get direct permissions
    for (const permission of this.permissions.values()) {
      const hasPermission = await this.checkPermission(permission, checkContext);
      if (hasPermission) {
        effectivePermissions.push(permission);
      }
    }

    // Get role-based permissions
    const rolePermissions = await this.getRoleBasedPermissions(checkContext);
    effectivePermissions.push(...rolePermissions);

    // Remove duplicates
    const uniquePermissions = new Map<string, Permission>();
    effectivePermissions.forEach(permission => {
      uniquePermissions.set(permission.id, permission);
    });

    return Array.from(uniquePermissions.values());
  }

  /**
   * Get permission audit history
   */
  async getPermissionHistory(timeRange?: TimeRange): Promise<PermissionAuditEntry[]> {
    let entries = this.auditEntries.filter(entry => entry.moduleId === this.sandbox.moduleId);

    if (timeRange) {
      entries = entries.filter(entry => 
        entry.timestamp >= timeRange.start && entry.timestamp <= timeRange.end
      );
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Create a role with specific permissions
   */
  async createRole(roleDefinition: RoleDefinition): Promise<void> {
    RoleDefinitionSchema.parse(roleDefinition);
    this.roles.set(roleDefinition.id, roleDefinition);
  }

  /**
   * Assign a role to a scope
   */
  async assignRole(roleId: string, scope: PermissionScope): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role ${roleId} not found`);
    }

    // Store role assignment (in a real implementation, this would be persisted)
    // For now, we'll just validate the assignment
    PermissionScopeSchema.parse(scope);
  }

  /**
   * Get all roles for a context
   */
  async getRoles(context: PermissionContext): Promise<RoleDefinition[]> {
    const contextRoles: RoleDefinition[] = [];

    for (const role of this.roles.values()) {
      if (await this.isRoleApplicable(role, context)) {
        contextRoles.push(role);
      }
    }

    return contextRoles;
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async evaluateConditions(
    permission: Permission, 
    context: PermissionContext
  ): Promise<{ passed: boolean; reason?: string }> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return { passed: true };
    }

    for (const condition of permission.conditions) {
      const result = await this.evaluateCondition(condition, context);
      if (!result.passed && condition.required) {
        return { passed: false, reason: result.reason };
      }
    }

    return { passed: true };
  }

  private async evaluateCondition(
    condition: PermissionCondition,
    context: PermissionContext
  ): Promise<{ passed: boolean; reason?: string }> {
    const contextValue = this.getContextValue(condition.field, context);
    
    switch (condition.operator) {
      case 'equals':
        return {
          passed: contextValue === condition.value,
          reason: contextValue !== condition.value ? `${condition.field} does not equal ${condition.value}` : undefined
        };
      case 'not_equals':
        return {
          passed: contextValue !== condition.value,
          reason: contextValue === condition.value ? `${condition.field} equals ${condition.value}` : undefined
        };
      case 'contains':
        return {
          passed: String(contextValue).includes(String(condition.value)),
          reason: !String(contextValue).includes(String(condition.value)) ? `${condition.field} does not contain ${condition.value}` : undefined
        };
      case 'not_contains':
        return {
          passed: !String(contextValue).includes(String(condition.value)),
          reason: String(contextValue).includes(String(condition.value)) ? `${condition.field} contains ${condition.value}` : undefined
        };
      case 'matches':
        const regex = new RegExp(String(condition.value));
        return {
          passed: regex.test(String(contextValue)),
          reason: !regex.test(String(contextValue)) ? `${condition.field} does not match pattern ${condition.value}` : undefined
        };
      case 'not_matches':
        const notRegex = new RegExp(String(condition.value));
        return {
          passed: !notRegex.test(String(contextValue)),
          reason: notRegex.test(String(contextValue)) ? `${condition.field} matches pattern ${condition.value}` : undefined
        };
      default:
        return { passed: false, reason: `Unknown operator: ${condition.operator}` };
    }
  }

  private async evaluateScope(
    permission: Permission,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    const scope = this.scopes.get(permission.id);
    if (!scope) {
      return { allowed: true }; // No scope restrictions
    }

    // Check scope type restrictions
    switch (scope.type) {
      case 'tenant':
        if (scope.target !== context.tenantId) {
          return { allowed: false, reason: `Permission limited to tenant ${scope.target}` };
        }
        break;
      case 'module':
        if (scope.target !== context.moduleId) {
          return { allowed: false, reason: `Permission limited to module ${scope.target}` };
        }
        break;
      case 'user':
        if (scope.target !== context.userId) {
          return { allowed: false, reason: `Permission limited to user ${scope.target}` };
        }
        break;
    }

    // Check scope restrictions
    if (scope.restrictions) {
      for (const restriction of scope.restrictions) {
        const restrictionResult = await this.evaluateRestriction(restriction, context);
        if (!restrictionResult.allowed) {
          return restrictionResult;
        }
      }
    }

    return { allowed: true };
  }

  private async evaluateRestriction(
    restriction: ScopeRestriction,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    switch (restriction.type) {
      case 'time':
        return this.evaluateTimeRestriction(restriction, context);
      case 'location':
        return this.evaluateLocationRestriction(restriction, context);
      case 'usage':
        return this.evaluateUsageRestriction(restriction, context);
      case 'condition':
        return this.evaluateConditionRestriction(restriction, context);
      default:
        return { allowed: true };
    }
  }

  private async evaluateTimeRestriction(
    restriction: ScopeRestriction,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Time-based restrictions (business hours, etc.)
    return { allowed: true }; // Simplified for now
  }

  private async evaluateLocationRestriction(
    restriction: ScopeRestriction,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Location-based restrictions (IP ranges, etc.)
    return { allowed: true }; // Simplified for now
  }

  private async evaluateUsageRestriction(
    restriction: ScopeRestriction,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Usage-based restrictions (rate limits, etc.)
    return { allowed: true }; // Simplified for now
  }

  private async evaluateConditionRestriction(
    restriction: ScopeRestriction,
    context: PermissionContext
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Custom condition-based restrictions
    return { allowed: true }; // Simplified for now
  }

  private async evaluateRolePermissions(
    permission: Permission,
    context: PermissionContext
  ): Promise<{ granted: boolean; reason?: string }> {
    const roles = await this.getRoles(context);

    for (const role of roles) {
      const hasRolePermission = role.permissions.some(p => p.id === permission.id);
      if (hasRolePermission) {
        return { granted: true };
      }
    }

    return { granted: false, reason: 'Permission not granted through any role' };
  }

  private async getRoleBasedPermissions(context: PermissionContext): Promise<Permission[]> {
    const roles = await this.getRoles(context);
    const permissions: Permission[] = [];

    for (const role of roles) {
      permissions.push(...role.permissions);
    }

    return permissions;
  }

  private async isRoleApplicable(role: RoleDefinition, context: PermissionContext): Promise<boolean> {
    if (!role.active) {
      return false;
    }

    // Check if role scope applies to context
    switch (role.scope.type) {
      case 'tenant':
        return role.scope.target === context.tenantId;
      case 'module':
        return role.scope.target === context.moduleId;
      case 'user':
        return role.scope.target === context.userId;
      case 'global':
        return true;
      default:
        return false;
    }
  }

  private getContextValue(field: string, context: PermissionContext): any {
    switch (field) {
      case 'moduleId':
        return context.moduleId;
      case 'tenantId':
        return context.tenantId;
      case 'userId':
        return context.userId;
      case 'roleId':
        return context.roleId;
      case 'resourceId':
        return context.resourceId;
      case 'environment':
        return context.environment;
      case 'timestamp':
        return context.timestamp;
      default:
        return context.metadata?.[field];
    }
  }

  private async hasPermissionToModifyPermissions(context: PermissionContext): Promise<boolean> {
    // Check if the current context has permission to modify permissions
    // This would typically check for admin or permission management roles
    return context.environment === 'development' || context.roleId === 'admin';
  }

  private createDefaultContext(): PermissionContext {
    return {
      moduleId: this.sandbox.moduleId,
      tenantId: this.sandbox.isolation.tenantId,
      timestamp: new Date(),
      environment: this.sandbox.isolation.environment,
    };
  }

  private async logPermissionAudit(
    id: string,
    action: 'grant' | 'revoke' | 'check' | 'update',
    permission: Permission,
    context: PermissionContext,
    result: boolean,
    reason?: string
  ): Promise<void> {
    const auditEntry: PermissionAuditEntry = {
      id,
      moduleId: context.moduleId,
      action,
      permission,
      context,
      result,
      reason,
      timestamp: new Date(),
    };

    this.auditEntries.push(auditEntry);

    // Log to sandbox audit system
    await this.sandbox.audit.logOperation({
      operationId: id,
      moduleId: context.moduleId,
      operation: `permission_${action}`,
      parameters: { permission: permission.id, result, reason },
      timestamp: new Date(),
      tenantId: context.tenantId,
      success: result,
      error: result ? undefined : reason,
      duration: 0,
    });
  }

  private generateAuditId(): string {
    return `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeDefaultPermissions(): void {
    // Initialize with basic permissions
    const defaultPermissions: Permission[] = [
      {
        id: 'ui.read',
        name: 'Read UI Components',
        type: 'ui',
        resource: 'components',
        action: 'read',
      },
      {
        id: 'api.read',
        name: 'Read API Endpoints',
        type: 'api',
        resource: 'endpoints',
        action: 'read',
      },
      {
        id: 'database.read',
        name: 'Read Database',
        type: 'database',
        resource: 'tables',
        action: 'read',
      },
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });
  }

  private initializeDefaultRoles(): void {
    // Initialize with basic roles
    const defaultRoles: RoleDefinition[] = [
      {
        id: 'module_user',
        name: 'Module User',
        description: 'Basic user permissions for module access',
        permissions: [
          this.permissions.get('ui.read')!,
          this.permissions.get('api.read')!,
        ],
        scope: {
          type: 'module',
          target: this.sandbox.moduleId,
          inheritance: {
            enabled: true,
            strategy: 'additive',
            parentScopes: [],
          },
        },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultRoles.forEach(role => {
      this.roles.set(role.id, role);
    });
  }
}

// =============================================================================
// ERROR CLASSES
// =============================================================================

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(`Permission denied: ${message}`);
    this.name = 'PermissionDeniedError';
  }
}

export class InvalidPermissionError extends Error {
  constructor(message: string) {
    super(`Invalid permission: ${message}`);
    this.name = 'InvalidPermissionError';
  }
}

export class RoleNotFoundError extends Error {
  constructor(roleId: string) {
    super(`Role not found: ${roleId}`);
    this.name = 'RoleNotFoundError';
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

export function createPermissionManager(sandbox: ModuleSandbox): PermissionManager {
  return new PermissionManagerImpl(sandbox);
}

export function createPermission(
  id: string,
  name: string,
  type: PermissionType,
  resource: string,
  action: string,
  conditions?: PermissionCondition[],
  metadata?: Record<string, any>
): Permission {
  return {
    id,
    name,
    type,
    resource,
    action,
    conditions,
    metadata,
  };
}

export function createScope(
  type: ScopeType,
  target: string,
  inheritance?: Partial<InheritanceRule>,
  restrictions?: ScopeRestriction[]
): PermissionScope {
  return {
    type,
    target,
    inheritance: {
      enabled: inheritance?.enabled ?? true,
      strategy: inheritance?.strategy ?? 'additive',
      parentScopes: inheritance?.parentScopes ?? [],
    },
    restrictions,
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  PermissionManagerImpl,
};

