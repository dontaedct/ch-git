/**
 * @fileoverview Authentication Permissions
 * @module lib/auth/permissions
 */

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export const PERMISSIONS = {
  READ_ANALYTICS: { id: 'read_analytics', name: 'Read Analytics', description: 'View analytics data' },
  WRITE_ANALYTICS: { id: 'write_analytics', name: 'Write Analytics', description: 'Modify analytics data' },
  ADMIN_ACCESS: { id: 'admin_access', name: 'Admin Access', description: 'Full administrative access' }
} as const;

export const ROLES = {
  ADMIN: { 
    id: 'admin', 
    name: 'Administrator', 
    permissions: Object.values(PERMISSIONS) 
  },
  USER: { 
    id: 'user', 
    name: 'User', 
    permissions: [PERMISSIONS.READ_ANALYTICS] 
  }
} as const;

export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission) || userPermissions.includes(PERMISSIONS.ADMIN_ACCESS.id);
}

export function hasRole(userRoles: string[], requiredRole: string): boolean {
  return userRoles.includes(requiredRole);
}

export function requirePermission(permission: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      // Add permission check logic here
      return originalMethod.apply(this, args);
    };
    return descriptor;
  };
}