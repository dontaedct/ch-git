/**
 * Permission Gate Component
 * Conditionally renders content based on user permissions
 * Part of Phase 1.1 Authentication Infrastructure
 */

'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/lib/auth/auth-context'
import { PermissionChecker, Permission, UserRole } from '@/lib/auth/permissions'
import { Lock, AlertTriangle } from 'lucide-react'

interface PermissionGateProps {
  children: ReactNode
  permission?: Permission
  permissions?: Permission[]
  requireAll?: boolean
  role?: UserRole
  roles?: UserRole[]
  fallback?: ReactNode
  showAccessDenied?: boolean
  className?: string
}

export function PermissionGate({
  children,
  permission,
  permissions = [],
  requireAll = false,
  role,
  roles = [],
  fallback = null,
  showAccessDenied = false,
  className = ''
}: PermissionGateProps) {
  const { user, loading } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  // If no user, show fallback or access denied
  if (!user) {
    return showAccessDenied ? (
      <AccessDeniedMessage 
        message="Authentication required" 
        className={className}
      />
    ) : (
      <>{fallback}</>
    )
  }

  // Get user role (this would come from your auth context)
  // For now, we'll assume it's stored in user metadata or fetched separately
  const userRole = (user as any)?.role || 'viewer' as UserRole

  // Check role-based access
  if (role && userRole !== role) {
    return showAccessDenied ? (
      <AccessDeniedMessage 
        message={`${role} role required`} 
        className={className}
      />
    ) : (
      <>{fallback}</>
    )
  }

  if (roles.length > 0 && !roles.includes(userRole)) {
    return showAccessDenied ? (
      <AccessDeniedMessage 
        message={`One of these roles required: ${roles.join(', ')}`} 
        className={className}
      />
    ) : (
      <>{fallback}</>
    )
  }

  // Check permission-based access
  if (permission) {
    const hasPermission = PermissionChecker.hasPermission(userRole, permission)
    if (!hasPermission) {
      return showAccessDenied ? (
        <AccessDeniedMessage 
          message={`Permission required: ${permission}`} 
          className={className}
        />
      ) : (
        <>{fallback}</>
      )
    }
  }

  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? PermissionChecker.hasAllPermissions(userRole, permissions)
      : PermissionChecker.hasAnyPermission(userRole, permissions)

    if (!hasRequiredPermissions) {
      return showAccessDenied ? (
        <AccessDeniedMessage 
          message={`Permission required: ${permissions.join(requireAll ? ' and ' : ' or ')}`} 
          className={className}
        />
      ) : (
        <>{fallback}</>
      )
    }
  }

  // All checks passed, render children
  return <div className={className}>{children}</div>
}

/**
 * Access Denied Message Component
 */
function AccessDeniedMessage({ 
  message, 
  className = '' 
}: { 
  message: string
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
      <div>
        <h3 className="font-medium text-red-800">Access Denied</h3>
        <p className="text-sm text-red-700">{message}</p>
      </div>
    </div>
  )
}

/**
 * Role-based component variants
 */
export function AdminOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate role="admin" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function EditorOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['admin', 'editor']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function ViewerOnly({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate roles={['admin', 'editor', 'viewer']} fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Permission-based component variants
 */
export function CanManageUsers({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="manage:users" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanCreateApps({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="create:tenant_apps" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanViewAnalytics({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="view:analytics" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanManageTemplates({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="manage:templates" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanManageForms({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="manage:forms" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanManageDocuments({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="manage:documents" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

export function CanManageThemes({ children, fallback = null }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGate permission="manage:themes" fallback={fallback}>
      {children}
    </PermissionGate>
  )
}

/**
 * Hook for permission checking
 */
export function usePermissions() {
  const { user, loading } = useAuth()
  
  const userRole = (user as any)?.role || 'viewer' as UserRole

  const hasPermission = (permission: Permission): boolean => {
    if (loading || !user) return false
    return PermissionChecker.hasPermission(userRole, permission)
  }

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    if (loading || !user) return false
    return PermissionChecker.hasAnyPermission(userRole, permissions)
  }

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    if (loading || !user) return false
    return PermissionChecker.hasAllPermissions(userRole, permissions)
  }

  const canPerformAction = (action: string, resource: string): boolean => {
    if (loading || !user) return false
    return PermissionChecker.canPerformAction(userRole, action, resource)
  }

  return {
    userRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canPerformAction,
    loading,
    isAuthenticated: !!user
  }
}