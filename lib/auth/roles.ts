import { User } from '@supabase/supabase-js';

export type UserRole = 'owner' | 'member' | 'viewer' | 'admin' | 'staff';

export const USER_ROLES = {
  OWNER: 'owner' as const,
  MEMBER: 'member' as const,
  VIEWER: 'viewer' as const,
  ADMIN: 'admin' as const,
  STAFF: 'staff' as const,
} as const;

export interface RolePermissions {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  owner: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
  },
  member: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
  },
  viewer: {
    canRead: true,
    canWrite: false,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
  },
  admin: {
    canRead: true,
    canWrite: true,
    canDelete: true,
    canManageUsers: true,
    canManageSettings: true,
  },
  staff: {
    canRead: true,
    canWrite: true,
    canDelete: false,
    canManageUsers: false,
    canManageSettings: false,
  },
};

export function hasRole(user: User, role: UserRole): boolean {
  const roles = user.app_metadata.roles ?? [];
  return roles.includes(role);
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

export function isValidRole(role: string): role is UserRole {
  return Object.values(USER_ROLES).includes(role as UserRole);
}

export function getUserRole(user: User): UserRole | null {
  const roles = user.app_metadata.roles ?? [];
  
  // Return the highest priority role
  const roleHierarchy: UserRole[] = ['owner', 'admin', 'member', 'staff', 'viewer'];
  
  for (const role of roleHierarchy) {
    if (roles.includes(role)) {
      return role;
    }
  }
  
  return null;
}
