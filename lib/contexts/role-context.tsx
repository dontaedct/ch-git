/**
 * @fileoverview Role Context Provider
 * Provides role-based access control context throughout the application
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserRole, ROLE_PERMISSIONS, hasPermission } from '@/lib/auth/roles';

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastActive: string;
}

interface RoleContextType {
  user: User | null;
  isLoading: boolean;
  hasPermission: (permission: keyof typeof ROLE_PERMISSIONS[UserRole]) => boolean;
  hasRole: (role: UserRole) => boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canDelete: boolean;
  canWrite: boolean;
  canRead: boolean;
  updateUser: (user: User) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
  initialUser?: User;
}

export function RoleProvider({ children, initialUser }: RoleProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    // In a real app, this would fetch user data from the API
    if (!initialUser) {
      // Simulate loading user data
      setTimeout(() => {
        setUser({
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          status: 'active',
          lastActive: '2 hours ago'
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [initialUser]);

  const hasPermissionCheck = (permission: keyof typeof ROLE_PERMISSIONS[UserRole]): boolean => {
    if (!user?.role) return false;
    return hasPermission(user.role, permission);
  };

  const hasRoleCheck = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    // In a real app, this would clear auth tokens and redirect
  };

  const value: RoleContextType = {
    user,
    isLoading,
    hasPermission: hasPermissionCheck,
    hasRole: hasRoleCheck,
    canManageUsers: hasPermissionCheck('canManageUsers'),
    canManageSettings: hasPermissionCheck('canManageSettings'),
    canDelete: hasPermissionCheck('canDelete'),
    canWrite: hasPermissionCheck('canWrite'),
    canRead: hasPermissionCheck('canRead'),
    updateUser,
    logout
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}

// Higher-order component for role-based access control
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission?: keyof typeof ROLE_PERMISSIONS[UserRole],
  requiredRole?: UserRole,
  fallback?: React.ComponentType
) {
  return function RoleGuardedComponent(props: P) {
    const { user, hasPermission, hasRole, isLoading } = useRole();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2">Loading...</span>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-500">Please log in to access this content.</p>
          </div>
        </div>
      );
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      return fallback ? (
        <fallback />
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Insufficient Permissions</h3>
            <p className="text-gray-500">You don't have permission to access this content.</p>
          </div>
        </div>
      );
    }

    if (requiredRole && !hasRole(requiredRole)) {
      return fallback ? (
        <fallback />
      ) : (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Insufficient Role</h3>
            <p className="text-gray-500">You don't have the required role to access this content.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Hook for conditional rendering based on permissions
export function usePermission(permission: keyof typeof ROLE_PERMISSIONS[UserRole]) {
  const { hasPermission } = useRole();
  return hasPermission(permission);
}

// Hook for conditional rendering based on roles
export function useRoleCheck(role: UserRole) {
  const { hasRole } = useRole();
  return hasRole(role);
}
