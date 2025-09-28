/**
 * Role-Based Access Control (RBAC) Permissions System
 * Defines and manages user permissions and role-based access
 * Part of Phase 1.1 Authentication Infrastructure
 */

export type UserRole = 'admin' | 'editor' | 'viewer'

export type Permission = 
  // Core permissions
  | 'read:all' | 'write:all' | 'delete:all'
  | 'read:assigned' | 'write:assigned' | 'delete:assigned'
  
  // User management
  | 'manage:users' | 'invite:users' | 'view:users'
  
  // App management
  | 'manage:apps' | 'create:tenant_apps' | 'deploy:apps' | 'view:apps'
  
  // Template management
  | 'manage:templates' | 'create:templates' | 'edit:templates' | 'delete:templates' | 'view:templates'
  
  // Form management
  | 'manage:forms' | 'create:forms' | 'edit:forms' | 'delete:forms' | 'view:forms'
  
  // Document management
  | 'manage:documents' | 'create:documents' | 'edit:documents' | 'delete:documents' | 'view:documents'
  
  // Theme management
  | 'manage:themes' | 'create:themes' | 'edit:themes' | 'delete:themes' | 'view:themes'
  
  // Analytics and reporting
  | 'manage:analytics' | 'view:analytics' | 'export:analytics'
  
  // System administration
  | 'manage:settings' | 'view:admin_panel' | 'manage:billing'
  
  // Integrations
  | 'manage:integrations' | 'view:integrations'

export interface PermissionSet {
  role: UserRole
  permissions: Permission[]
  description: string
}

/**
 * Role-based permission definitions
 */
export const ROLE_PERMISSIONS: Record<UserRole, PermissionSet> = {
  admin: {
    role: 'admin',
    description: 'Full system access with all administrative privileges',
    permissions: [
      // Core permissions
      'read:all', 'write:all', 'delete:all',
      
      // User management
      'manage:users', 'invite:users', 'view:users',
      
      // App management
      'manage:apps', 'create:tenant_apps', 'deploy:apps', 'view:apps',
      
      // Template management
      'manage:templates', 'create:templates', 'edit:templates', 'delete:templates', 'view:templates',
      
      // Form management
      'manage:forms', 'create:forms', 'edit:forms', 'delete:forms', 'view:forms',
      
      // Document management
      'manage:documents', 'create:documents', 'edit:documents', 'delete:documents', 'view:documents',
      
      // Theme management
      'manage:themes', 'create:themes', 'edit:themes', 'delete:themes', 'view:themes',
      
      // Analytics and reporting
      'manage:analytics', 'view:analytics', 'export:analytics',
      
      // System administration
      'manage:settings', 'view:admin_panel', 'manage:billing',
      
      // Integrations
      'manage:integrations', 'view:integrations'
    ]
  },
  
  editor: {
    role: 'editor',
    description: 'Content creation and management with limited administrative access',
    permissions: [
      // Core permissions (assigned only)
      'read:assigned', 'write:assigned',
      
      // App management
      'create:tenant_apps', 'deploy:apps', 'view:apps',
      
      // Template management
      'manage:templates', 'create:templates', 'edit:templates', 'view:templates',
      
      // Form management
      'manage:forms', 'create:forms', 'edit:forms', 'view:forms',
      
      // Document management
      'manage:documents', 'create:documents', 'edit:documents', 'view:documents',
      
      // Theme management
      'manage:themes', 'create:themes', 'edit:themes', 'view:themes',
      
      // Analytics and reporting
      'view:analytics', 'export:analytics',
      
      // Integrations
      'view:integrations'
    ]
  },
  
  viewer: {
    role: 'viewer',
    description: 'Read-only access to assigned content and basic analytics',
    permissions: [
      // Core permissions (read only)
      'read:assigned',
      
      // App management (view only)
      'view:apps',
      
      // Template management (view only)
      'view:templates',
      
      // Form management (view only)
      'view:forms',
      
      // Document management (view only)
      'view:documents',
      
      // Theme management (view only)
      'view:themes',
      
      // Analytics and reporting (view only)
      'view:analytics',
      
      // Integrations (view only)
      'view:integrations'
    ]
  }
}

/**
 * Permission checking utilities
 */
export class PermissionChecker {
  /**
   * Check if a user role has a specific permission
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[role]
    return rolePermissions.permissions.includes(permission)
  }

  /**
   * Check if a user role has any of the specified permissions
   */
  static hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission))
  }

  /**
   * Check if a user role has all of the specified permissions
   */
  static hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission))
  }

  /**
   * Get all permissions for a role
   */
  static getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role].permissions
  }

  /**
   * Get role information including description
   */
  static getRoleInfo(role: UserRole): PermissionSet {
    return ROLE_PERMISSIONS[role]
  }

  /**
   * Check if a role can perform an action on a resource
   */
  static canPerformAction(role: UserRole, action: string, resource: string): boolean {
    const permission = `${action}:${resource}` as Permission
    return this.hasPermission(role, permission)
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): UserRole[] {
    return Object.keys(ROLE_PERMISSIONS) as UserRole[]
  }

  /**
   * Validate if a role is valid
   */
  static isValidRole(role: string): role is UserRole {
    return role in ROLE_PERMISSIONS
  }

  /**
   * Get role hierarchy (higher roles inherit lower role permissions)
   */
  static getRoleHierarchy(): Record<UserRole, number> {
    return {
      admin: 3,
      editor: 2,
      viewer: 1
    }
  }

  /**
   * Check if one role is higher than another
   */
  static isRoleHigher(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy()
    return hierarchy[role1] > hierarchy[role2]
  }

  /**
   * Get the highest role from a list of roles
   */
  static getHighestRole(roles: UserRole[]): UserRole {
    const hierarchy = this.getRoleHierarchy()
    return roles.reduce((highest, current) => 
      hierarchy[current] > hierarchy[highest] ? current : highest
    )
  }
}

/**
 * Permission-based route access control
 */
export class RoutePermissionChecker {
  /**
   * Define route permissions mapping
   */
  private static readonly ROUTE_PERMISSIONS: Record<string, Permission[]> = {
    '/agency-toolkit': ['view:admin_panel'],
    '/agency-toolkit/templates': ['view:templates'],
    '/agency-toolkit/templates/builder': ['create:templates', 'edit:templates'],
    '/agency-toolkit/forms': ['view:forms'],
    '/agency-toolkit/forms/builder': ['create:forms', 'edit:forms'],
    '/agency-toolkit/documents': ['view:documents'],
    '/agency-toolkit/theming': ['view:themes'],
    '/dashboard': ['read:assigned'],
    '/admin': ['view:admin_panel'],
    '/admin/users': ['manage:users'],
    '/admin/settings': ['manage:settings'],
    '/admin/billing': ['manage:billing'],
    '/analytics': ['view:analytics'],
    '/integrations': ['view:integrations']
  }

  /**
   * Check if a user role can access a specific route
   */
  static canAccessRoute(role: UserRole, route: string): boolean {
    const requiredPermissions = this.ROUTE_PERMISSIONS[route]
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true // No specific permissions required
    }

    return PermissionChecker.hasAnyPermission(role, requiredPermissions)
  }

  /**
   * Get required permissions for a route
   */
  static getRequiredPermissions(route: string): Permission[] {
    return this.ROUTE_PERMISSIONS[route] || []
  }

  /**
   * Get all routes that require specific permissions
   */
  static getRoutesForPermission(permission: Permission): string[] {
    return Object.entries(this.ROUTE_PERMISSIONS)
      .filter(([, permissions]) => permissions.includes(permission))
      .map(([route]) => route)
  }
}

/**
 * API endpoint permission checking
 */
/**
 * Require permission function for easy permission checking
 */
export function requirePermission(role: UserRole, permission: Permission): boolean {
  return PermissionChecker.hasPermission(role, permission);
}

export class ApiPermissionChecker {
  /**
   * Define API endpoint permissions
   */
  private static readonly API_PERMISSIONS: Record<string, Permission[]> = {
    'GET /api/tenant-apps': ['view:apps'],
    'POST /api/tenant-apps': ['create:tenant_apps'],
    'PUT /api/tenant-apps': ['write:assigned'],
    'DELETE /api/tenant-apps': ['delete:assigned'],
    'GET /api/templates': ['view:templates'],
    'POST /api/templates': ['create:templates'],
    'PUT /api/templates': ['edit:templates'],
    'DELETE /api/templates': ['delete:templates'],
    'GET /api/forms': ['view:forms'],
    'POST /api/forms': ['create:forms'],
    'PUT /api/forms': ['edit:forms'],
    'DELETE /api/forms': ['delete:forms'],
    'GET /api/documents': ['view:documents'],
    'POST /api/documents': ['create:documents'],
    'DELETE /api/documents': ['delete:documents'],
    'GET /api/analytics': ['view:analytics'],
    'GET /api/users': ['view:users'],
    'POST /api/users': ['invite:users'],
    'PUT /api/users': ['manage:users'],
    'DELETE /api/users': ['manage:users']
  }

  /**
   * Check if a user role can access an API endpoint
   */
  static canAccessApi(role: UserRole, method: string, endpoint: string): boolean {
    const key = `${method} ${endpoint}`
    const requiredPermissions = this.API_PERMISSIONS[key]
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true // No specific permissions required
    }

    return PermissionChecker.hasAnyPermission(role, requiredPermissions)
  }

  /**
   * Get required permissions for an API endpoint
   */
  static getRequiredPermissions(method: string, endpoint: string): Permission[] {
    const key = `${method} ${endpoint}`
    return this.API_PERMISSIONS[key] || []
  }
}