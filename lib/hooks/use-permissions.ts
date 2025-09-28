/**
 * Permissions Management Hook
 * Provides role-based access control and permission checking
 * Part of Phase 1.2 Database Schema & State Management
 */

import { useCallback, useMemo } from 'react'
import { useAuth } from './use-auth'
import { PermissionChecker, UserRole, Permission } from '@/lib/auth/permissions'

export interface UsePermissionsReturn {
  // Current user info
  userRole: UserRole | null
  isAuthenticated: boolean
  loading: boolean

  // Permission checking
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (permissions: Permission[]) => boolean
  hasAllPermissions: (permissions: Permission[]) => boolean
  canPerformAction: (action: string, resource: string) => boolean

  // Role checking
  isAdmin: boolean
  isEditor: boolean
  isViewer: boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean

  // Permission utilities
  getPermissionsForRole: (role: UserRole) => Permission[]
  getAllRoles: () => UserRole[]
  isValidRole: (role: string) => role is UserRole
  isRoleHigher: (role1: UserRole, role2: UserRole) => boolean

  // Common permission checks
  canManageUsers: boolean
  canCreateApps: boolean
  canManageTemplates: boolean
  canManageForms: boolean
  canManageDocuments: boolean
  canManageThemes: boolean
  canViewAnalytics: boolean
  canManageSettings: boolean
  canViewAdminPanel: boolean
  canManageBilling: boolean
  canManageIntegrations: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { user, role, isAuthenticated, loading } = useAuth()

  // Memoized role checks
  const isAdmin = useMemo(() => role === 'admin', [role])
  const isEditor = useMemo(() => role === 'editor', [role])
  const isViewer = useMemo(() => role === 'viewer', [role])

  // Permission checking methods
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!role) return false
    return PermissionChecker.hasPermission(role, permission)
  }, [role])

  const hasAnyPermission = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return PermissionChecker.hasAnyPermission(role, permissions)
  }, [role])

  const hasAllPermissions = useCallback((permissions: Permission[]): boolean => {
    if (!role) return false
    return PermissionChecker.hasAllPermissions(role, permissions)
  }, [role])

  const canPerformAction = useCallback((action: string, resource: string): boolean => {
    if (!role) return false
    return PermissionChecker.canPerformAction(role, action, resource)
  }, [role])

  // Role checking methods
  const hasRole = useCallback((targetRole: UserRole): boolean => {
    return role === targetRole
  }, [role])

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return role ? roles.includes(role) : false
  }, [role])

  // Permission utilities
  const getPermissionsForRole = useCallback((targetRole: UserRole): Permission[] => {
    return PermissionChecker.getPermissionsForRole(targetRole)
  }, [])

  const getAllRoles = useCallback((): UserRole[] => {
    return PermissionChecker.getAllRoles()
  }, [])

  const isValidRole = useCallback((roleString: string): roleString is UserRole => {
    return PermissionChecker.isValidRole(roleString)
  }, [])

  const isRoleHigher = useCallback((role1: UserRole, role2: UserRole): boolean => {
    return PermissionChecker.isRoleHigher(role1, role2)
  }, [])

  // Common permission checks (memoized for performance)
  const canManageUsers = useMemo(() => hasPermission('manage:users'), [hasPermission])
  const canCreateApps = useMemo(() => hasPermission('create:tenant_apps'), [hasPermission])
  const canManageTemplates = useMemo(() => hasPermission('manage:templates'), [hasPermission])
  const canManageForms = useMemo(() => hasPermission('manage:forms'), [hasPermission])
  const canManageDocuments = useMemo(() => hasPermission('manage:documents'), [hasPermission])
  const canManageThemes = useMemo(() => hasPermission('manage:themes'), [hasPermission])
  const canViewAnalytics = useMemo(() => hasPermission('view:analytics'), [hasPermission])
  const canManageSettings = useMemo(() => hasPermission('manage:settings'), [hasPermission])
  const canViewAdminPanel = useMemo(() => hasPermission('view:admin_panel'), [hasPermission])
  const canManageBilling = useMemo(() => hasPermission('manage:billing'), [hasPermission])
  const canManageIntegrations = useMemo(() => hasPermission('manage:integrations'), [hasPermission])

  return {
    // Current user info
    userRole: role,
    isAuthenticated,
    loading,

    // Permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,

    // Role checking
    isAdmin,
    isEditor,
    isViewer,
    hasRole,
    hasAnyRole,

    // Permission utilities
    getPermissionsForRole,
    getAllRoles,
    isValidRole,
    isRoleHigher,

    // Common permission checks
    canManageUsers,
    canCreateApps,
    canManageTemplates,
    canManageForms,
    canManageDocuments,
    canManageThemes,
    canViewAnalytics,
    canManageSettings,
    canViewAdminPanel,
    canManageBilling,
    canManageIntegrations
  }
}

/**
 * Hook for checking specific permissions with loading state
 */
export function usePermissionCheck(permission: Permission): {
  hasPermission: boolean
  loading: boolean
  isAuthenticated: boolean
} {
  const { hasPermission, loading, isAuthenticated } = usePermissions()

  return {
    hasPermission: hasPermission(permission),
    loading,
    isAuthenticated
  }
}

/**
 * Hook for checking multiple permissions
 */
export function useMultiplePermissionCheck(permissions: Permission[]): {
  hasAllPermissions: boolean
  hasAnyPermission: boolean
  loading: boolean
  isAuthenticated: boolean
} {
  const { hasAllPermissions, hasAnyPermission, loading, isAuthenticated } = usePermissions()

  return {
    hasAllPermissions: hasAllPermissions(permissions),
    hasAnyPermission: hasAnyPermission(permissions),
    loading,
    isAuthenticated
  }
}

/**
 * Hook for role-based access control
 */
export function useRoleCheck(requiredRole: UserRole): {
  hasRole: boolean
  isHigherRole: boolean
  loading: boolean
  isAuthenticated: boolean
} {
  const { hasRole, isRoleHigher, userRole, loading, isAuthenticated } = usePermissions()

  return {
    hasRole: hasRole(requiredRole),
    isHigherRole: userRole ? isRoleHigher(userRole, requiredRole) : false,
    loading,
    isAuthenticated
  }
}
