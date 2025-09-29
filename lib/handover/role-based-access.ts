export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // Higher number = more access
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  conditions?: Record<string, any>;
  description: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  clientId: string;
  assignedAt: Date;
  assignedBy: string;
  expiresAt?: Date;
  isActive: boolean;
}

export interface AccessContext {
  userId: string;
  clientId: string;
  resource: string;
  action: string;
  metadata?: Record<string, any>;
}

export class RoleBasedAccessControl {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();

  constructor() {
    this.initializeSystemRoles();
  }

  // Role Management
  async createRole(
    name: string,
    description: string,
    permissions: string[],
    level: number = 1
  ): Promise<Role> {
    const role: Role = {
      id: `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      permissions: permissions.map(permId => this.permissions.get(permId)).filter(Boolean) as Permission[],
      level,
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.roles.set(role.id, role);
    return role;
  }

  async updateRole(roleId: string, updates: Partial<Role>): Promise<Role> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole && updates.permissions) {
      throw new Error('Cannot modify permissions of system roles');
    }

    const updatedRole = {
      ...role,
      ...updates,
      updatedAt: new Date()
    };

    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  async deleteRole(roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('Cannot delete system roles');
    }

    // Check if role is assigned to any users
    const usersWithRole = Array.from(this.userRoles.values())
      .flat()
      .filter(ur => ur.roleId === roleId && ur.isActive);

    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    this.roles.delete(roleId);
  }

  // Permission Management
  async createPermission(
    name: string,
    resource: string,
    action: string,
    description: string,
    conditions?: Record<string, any>
  ): Promise<Permission> {
    const permission: Permission = {
      id: `perm_${resource}_${action}_${Date.now()}`,
      name,
      resource,
      action,
      conditions,
      description
    };

    this.permissions.set(permission.id, permission);
    return permission;
  }

  // User Role Assignment
  async assignRole(
    userId: string,
    roleId: string,
    clientId: string,
    assignedBy: string,
    expiresAt?: Date
  ): Promise<UserRole> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Check if user already has this role for this client
    const existingUserRoles = this.userRoles.get(userId) || [];
    const existingRole = existingUserRoles.find(
      ur => ur.roleId === roleId && ur.clientId === clientId && ur.isActive
    );

    if (existingRole) {
      throw new Error('User already has this role for this client');
    }

    const userRole: UserRole = {
      userId,
      roleId,
      clientId,
      assignedAt: new Date(),
      assignedBy,
      expiresAt,
      isActive: true
    };

    const userRoles = this.userRoles.get(userId) || [];
    userRoles.push(userRole);
    this.userRoles.set(userId, userRoles);

    return userRole;
  }

  async revokeRole(userId: string, roleId: string, clientId: string): Promise<void> {
    const userRoles = this.userRoles.get(userId) || [];
    const roleIndex = userRoles.findIndex(
      ur => ur.roleId === roleId && ur.clientId === clientId && ur.isActive
    );

    if (roleIndex === -1) {
      throw new Error('User role assignment not found');
    }

    userRoles[roleIndex].isActive = false;
    this.userRoles.set(userId, userRoles);
  }

  // Access Control
  async checkAccess(context: AccessContext): Promise<boolean> {
    const userRoles = await this.getUserRoles(context.userId, context.clientId);

    for (const userRole of userRoles) {
      // Check if role is expired
      if (userRole.expiresAt && userRole.expiresAt < new Date()) {
        continue;
      }

      const role = this.roles.get(userRole.roleId);
      if (!role) continue;

      // Check if role has required permission
      const hasPermission = role.permissions.some(permission =>
        this.matchesPermission(permission, context.resource, context.action, context.metadata)
      );

      if (hasPermission) {
        return true;
      }
    }

    return false;
  }

  async getUserPermissions(userId: string, clientId: string): Promise<Permission[]> {
    const userRoles = await this.getUserRoles(userId, clientId);
    const permissions: Permission[] = [];

    for (const userRole of userRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role) {
        permissions.push(...role.permissions);
      }
    }

    // Remove duplicates
    return permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
  }

  async getUserRoles(userId: string, clientId: string): Promise<UserRole[]> {
    const userRoles = this.userRoles.get(userId) || [];
    return userRoles.filter(ur => ur.clientId === clientId && ur.isActive);
  }

  async getRole(roleId: string): Promise<Role | undefined> {
    return this.roles.get(roleId);
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getPermission(permissionId: string): Promise<Permission | undefined> {
    return this.permissions.get(permissionId);
  }

  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  // Access Level Utilities
  async getUserMaxAccessLevel(userId: string, clientId: string): Promise<number> {
    const userRoles = await this.getUserRoles(userId, clientId);
    let maxLevel = 0;

    for (const userRole of userRoles) {
      const role = this.roles.get(userRole.roleId);
      if (role && role.level > maxLevel) {
        maxLevel = role.level;
      }
    }

    return maxLevel;
  }

  async canUserAccessResource(
    userId: string,
    clientId: string,
    resource: string,
    requiredLevel: number = 1
  ): Promise<boolean> {
    const userMaxLevel = await this.getUserMaxAccessLevel(userId, clientId);
    return userMaxLevel >= requiredLevel;
  }

  // Private Methods
  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    metadata?: Record<string, any>
  ): boolean {
    // Check resource and action match
    if (permission.resource !== '*' && permission.resource !== resource) {
      return false;
    }

    if (permission.action !== '*' && permission.action !== action) {
      return false;
    }

    // Check conditions if they exist
    if (permission.conditions && metadata) {
      for (const [key, value] of Object.entries(permission.conditions)) {
        if (metadata[key] !== value) {
          return false;
        }
      }
    }

    return true;
  }

  private initializeSystemRoles(): void {
    // Create system permissions
    const permissions = [
      { name: 'View Dashboard', resource: 'dashboard', action: 'view', description: 'View admin dashboard' },
      { name: 'Edit Content', resource: 'content', action: 'edit', description: 'Edit website content' },
      { name: 'Manage Users', resource: 'users', action: 'manage', description: 'Manage user accounts' },
      { name: 'View Analytics', resource: 'analytics', action: 'view', description: 'View analytics data' },
      { name: 'Manage Settings', resource: 'settings', action: 'manage', description: 'Manage system settings' },
      { name: 'Manage Integrations', resource: 'integrations', action: 'manage', description: 'Manage integrations' },
      { name: 'Manage Security', resource: 'security', action: 'manage', description: 'Manage security settings' },
      { name: 'Full Access', resource: '*', action: '*', description: 'Full system access' }
    ];

    permissions.forEach(p => {
      const permission: Permission = {
        id: `sys_${p.resource}_${p.action}`,
        ...p
      };
      this.permissions.set(permission.id, permission);
    });

    // Create system roles
    const systemRoles = [
      {
        name: 'Super Admin',
        description: 'Full system access',
        permissions: ['sys_*_*'],
        level: 100
      },
      {
        name: 'Admin',
        description: 'Administrative access',
        permissions: [
          'sys_dashboard_view',
          'sys_content_edit',
          'sys_users_manage',
          'sys_analytics_view',
          'sys_settings_manage',
          'sys_integrations_manage'
        ],
        level: 80
      },
      {
        name: 'Editor',
        description: 'Content editing access',
        permissions: [
          'sys_dashboard_view',
          'sys_content_edit',
          'sys_analytics_view'
        ],
        level: 50
      },
      {
        name: 'Viewer',
        description: 'Read-only access',
        permissions: [
          'sys_dashboard_view',
          'sys_analytics_view'
        ],
        level: 20
      }
    ];

    systemRoles.forEach(roleData => {
      const role: Role = {
        id: `sys_${roleData.name.toLowerCase().replace(' ', '_')}`,
        name: roleData.name,
        description: roleData.description,
        permissions: roleData.permissions.map(permId => this.permissions.get(permId)).filter(Boolean) as Permission[],
        level: roleData.level,
        isSystemRole: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.roles.set(role.id, role);
    });
  }
}

export const rbac = new RoleBasedAccessControl();