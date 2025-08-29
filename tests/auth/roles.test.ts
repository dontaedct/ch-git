import { 
  hasRole, 
  hasPermission, 
  isValidRole, 
  getUserRole,
  USER_ROLES,
  ROLE_PERMISSIONS
} from '@/lib/auth/roles';
import { User } from '@supabase/supabase-js';

describe('Auth Roles', () => {
  describe('hasRole', () => {
    it('should return true for user with the specified role', () => {
      const user = {
        app_metadata: {
          roles: ['owner', 'admin']
        }
      } as User;

      expect(hasRole(user, USER_ROLES.OWNER)).toBe(true);
      expect(hasRole(user, USER_ROLES.ADMIN)).toBe(true);
    });

    it('should return false for user without the specified role', () => {
      const user = {
        app_metadata: {
          roles: ['viewer']
        }
      } as User;

      expect(hasRole(user, USER_ROLES.OWNER)).toBe(false);
      expect(hasRole(user, USER_ROLES.MEMBER)).toBe(false);
    });

    it('should return false for user with no roles', () => {
      const user = {
        app_metadata: {}
      } as User;

      expect(hasRole(user, USER_ROLES.VIEWER)).toBe(false);
    });

    it('should return false for user with null roles', () => {
      const user = {
        app_metadata: {
          roles: null
        }
      } as User;

      expect(hasRole(user, USER_ROLES.VIEWER)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true for owner role with any permission', () => {
      expect(hasPermission('owner', 'canRead')).toBe(true);
      expect(hasPermission('owner', 'canWrite')).toBe(true);
      expect(hasPermission('owner', 'canDelete')).toBe(true);
      expect(hasPermission('owner', 'canManageUsers')).toBe(true);
      expect(hasPermission('owner', 'canManageSettings')).toBe(true);
    });

    it('should return correct permissions for member role', () => {
      expect(hasPermission('member', 'canRead')).toBe(true);
      expect(hasPermission('member', 'canWrite')).toBe(true);
      expect(hasPermission('member', 'canDelete')).toBe(false);
      expect(hasPermission('member', 'canManageUsers')).toBe(false);
      expect(hasPermission('member', 'canManageSettings')).toBe(false);
    });

    it('should return correct permissions for viewer role', () => {
      expect(hasPermission('viewer', 'canRead')).toBe(true);
      expect(hasPermission('viewer', 'canWrite')).toBe(false);
      expect(hasPermission('viewer', 'canDelete')).toBe(false);
      expect(hasPermission('viewer', 'canManageUsers')).toBe(false);
      expect(hasPermission('viewer', 'canManageSettings')).toBe(false);
    });

    it('should return correct permissions for admin role', () => {
      expect(hasPermission('admin', 'canRead')).toBe(true);
      expect(hasPermission('admin', 'canWrite')).toBe(true);
      expect(hasPermission('admin', 'canDelete')).toBe(true);
      expect(hasPermission('admin', 'canManageUsers')).toBe(true);
      expect(hasPermission('admin', 'canManageSettings')).toBe(true);
    });

    it('should return correct permissions for staff role', () => {
      expect(hasPermission('staff', 'canRead')).toBe(true);
      expect(hasPermission('staff', 'canWrite')).toBe(true);
      expect(hasPermission('staff', 'canDelete')).toBe(false);
      expect(hasPermission('staff', 'canManageUsers')).toBe(false);
      expect(hasPermission('staff', 'canManageSettings')).toBe(false);
    });
  });

  describe('isValidRole', () => {
    it('should return true for valid roles', () => {
      expect(isValidRole('owner')).toBe(true);
      expect(isValidRole('member')).toBe(true);
      expect(isValidRole('viewer')).toBe(true);
      expect(isValidRole('admin')).toBe(true);
      expect(isValidRole('staff')).toBe(true);
    });

    it('should return false for invalid roles', () => {
      expect(isValidRole('invalid')).toBe(false);
      expect(isValidRole('superuser')).toBe(false);
      expect(isValidRole('')).toBe(false);
      expect(isValidRole('OWNER')).toBe(false); // Case sensitive
    });
  });

  describe('getUserRole', () => {
    it('should return the highest priority role', () => {
      const ownerUser = {
        app_metadata: {
          roles: ['viewer', 'member', 'owner']
        }
      } as User;

      const memberUser = {
        app_metadata: {
          roles: ['viewer', 'member', 'staff']
        }
      } as User;

      const viewerUser = {
        app_metadata: {
          roles: ['viewer']
        }
      } as User;

      expect(getUserRole(ownerUser)).toBe('owner');
      expect(getUserRole(memberUser)).toBe('member');
      expect(getUserRole(viewerUser)).toBe('viewer');
    });

    it('should return admin over other roles except owner', () => {
      const adminUser = {
        app_metadata: {
          roles: ['staff', 'member', 'admin', 'viewer']
        }
      } as User;

      expect(getUserRole(adminUser)).toBe('admin');
    });

    it('should return null for user with no valid roles', () => {
      const noRolesUser = {
        app_metadata: {
          roles: []
        }
      } as User;

      const invalidRolesUser = {
        app_metadata: {
          roles: ['invalid', 'unknown']
        }
      } as User;

      const noMetadataUser = {
        app_metadata: {}
      } as User;

      expect(getUserRole(noRolesUser)).toBe(null);
      expect(getUserRole(invalidRolesUser)).toBe(null);
      expect(getUserRole(noMetadataUser)).toBe(null);
    });
  });

  describe('ROLE_PERMISSIONS constants', () => {
    it('should have all required permissions for each role', () => {
      const requiredPermissions = ['canRead', 'canWrite', 'canDelete', 'canManageUsers', 'canManageSettings'];
      const roles = Object.keys(ROLE_PERMISSIONS);

      roles.forEach(role => {
        requiredPermissions.forEach(permission => {
          expect(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]).toHaveProperty(permission);
          expect(typeof ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS][permission as keyof typeof ROLE_PERMISSIONS[typeof role]]).toBe('boolean');
        });
      });
    });

    it('should ensure owner and admin have full permissions', () => {
      const fullPermissionRoles = ['owner', 'admin'];
      const allPermissions = ['canRead', 'canWrite', 'canDelete', 'canManageUsers', 'canManageSettings'];

      fullPermissionRoles.forEach(role => {
        allPermissions.forEach(permission => {
          expect(ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS][permission as keyof typeof ROLE_PERMISSIONS[typeof role]]).toBe(true);
        });
      });
    });

    it('should ensure viewer has only read permission', () => {
      expect(ROLE_PERMISSIONS.viewer.canRead).toBe(true);
      expect(ROLE_PERMISSIONS.viewer.canWrite).toBe(false);
      expect(ROLE_PERMISSIONS.viewer.canDelete).toBe(false);
      expect(ROLE_PERMISSIONS.viewer.canManageUsers).toBe(false);
      expect(ROLE_PERMISSIONS.viewer.canManageSettings).toBe(false);
    });
  });
});