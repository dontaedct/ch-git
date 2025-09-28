/**
 * @fileoverview Role Management Component
 * Comprehensive role-based access control UI component
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { UserRole, ROLE_PERMISSIONS, PermissionChecker } from '@/lib/auth/permissions';
import { 
  Shield, 
  Users, 
  Settings, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Check,
  X,
  AlertTriangle,
  Crown,
  User,
  UserCheck,
  UserX
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  lastActive: string;
  avatar?: string;
}

interface RoleManagerProps {
  users: User[];
  currentUserRole: UserRole;
  onRoleUpdate: (userId: string, newRole: UserRole) => Promise<void>;
  onUserInvite: (email: string, role: UserRole) => Promise<void>;
  className?: string;
}

const roleIcons = {
  admin: Shield,
  editor: UserCheck,
  viewer: Eye
};

const roleColors = {
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  editor: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
};

const roleDescriptions = {
  admin: 'Full system access with all administrative privileges',
  editor: 'Content creation and management with limited administrative access',
  viewer: 'Read-only access to assigned content and basic analytics'
};

export function RoleManager({ 
  users, 
  currentUserRole, 
  onRoleUpdate, 
  onUserInvite, 
  className 
}: RoleManagerProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const canManageUsers = PermissionChecker.hasPermission(currentUserRole, 'manage:users');
  const canAssignRole = (role: UserRole) => {
    // Admin can assign any role, editor and viewer cannot assign roles
    return currentUserRole === 'admin';
  };

  const handleRoleUpdate = async (userId: string, newRole: UserRole) => {
    try {
      setIsUpdating(true);
      await onRoleUpdate(userId, newRole);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUserInvite = async () => {
    if (!inviteEmail || !inviteRole) return;
    
    try {
      setIsInviting(true);
      await onUserInvite(inviteEmail, inviteRole);
      setInviteEmail('');
      setInviteRole('viewer');
      setIsInviting(false);
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold tracking-wide uppercase">Role Management</h2>
          <p className={cn(
            "mt-1 text-sm",
            isDark ? "text-white/80" : "text-black/80"
          )}>
            Manage user roles and permissions
          </p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => setIsInviting(true)}
            className={cn(
              "px-4 py-2 rounded-lg border-2 font-bold transition-all duration-300 flex items-center space-x-2",
              "hover:scale-105",
              isDark
                ? "border-white/30 hover:border-white/50"
                : "border-black/30 hover:border-black/50"
            )}
          >
            <Plus className="w-4 h-4" />
            <span>Invite User</span>
          </button>
        )}
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="flex space-x-4"
      >
        {[
          { id: 'users', label: 'Users', icon: Users },
          { id: 'roles', label: 'Roles', icon: Shield },
          { id: 'permissions', label: 'Permissions', icon: Settings }
        ].map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-lg border-2 font-bold transition-all duration-300 flex items-center space-x-2",
                activeTab === tab.id
                  ? isDark
                    ? "bg-white/10 border-white/50"
                    : "bg-black/10 border-black/50"
                  : isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
              )}
            >
              <IconComponent className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="space-y-4">
            {users.map((user) => {
              const RoleIcon = roleIcons[user.role];
              return (
                <div
                  key={user.id}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30 hover:border-white/50"
                      : "border-black/30 hover:border-black/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {user.avatar || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{user.name || user.email}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-500">Last active: {user.lastActive}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1",
                        roleColors[user.role]
                      )}>
                        <RoleIcon className="w-4 h-4" />
                        <span>{user.role.toUpperCase()}</span>
                      </span>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        user.status === 'active' 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
                      )}>
                        {user.status}
                      </span>
                      {canManageUsers && (
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PermissionChecker.getAllRoles().map((role) => {
              const RoleIcon = roleIcons[role];
              const roleInfo = PermissionChecker.getRoleInfo(role);
              return (
                <div
                  key={role}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all duration-300",
                    isDark
                      ? "border-white/30"
                      : "border-black/30"
                  )}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      roleColors[role]
                    )}>
                      <RoleIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{role.toUpperCase()}</h3>
                      <p className="text-sm text-gray-500">{roleInfo.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Check className={cn(
                        "w-4 h-4",
                        PermissionChecker.hasPermission(role, 'read:all') || PermissionChecker.hasPermission(role, 'read:assigned') ? "text-green-500" : "text-gray-400"
                      )} />
                      <span className="text-sm">Read Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className={cn(
                        "w-4 h-4",
                        PermissionChecker.hasPermission(role, 'write:all') || PermissionChecker.hasPermission(role, 'write:assigned') ? "text-green-500" : "text-gray-400"
                      )} />
                      <span className="text-sm">Write Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className={cn(
                        "w-4 h-4",
                        PermissionChecker.hasPermission(role, 'delete:all') || PermissionChecker.hasPermission(role, 'delete:assigned') ? "text-green-500" : "text-gray-400"
                      )} />
                      <span className="text-sm">Delete Access</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className={cn(
                        "w-4 h-4",
                        PermissionChecker.hasPermission(role, 'manage:users') ? "text-green-500" : "text-gray-400"
                      )} />
                      <span className="text-sm">Manage Users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Check className={cn(
                        "w-4 h-4",
                        PermissionChecker.hasPermission(role, 'manage:settings') ? "text-green-500" : "text-gray-400"
                      )} />
                      <span className="text-sm">Manage Settings</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "p-6 rounded-lg border-2 transition-all duration-300",
            isDark
              ? "bg-black/5 border-white/30"
              : "bg-white/5 border-black/30"
          )}
        >
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4">Permission Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Role</th>
                      <th className="text-center py-2">Read</th>
                      <th className="text-center py-2">Write</th>
                      <th className="text-center py-2">Delete</th>
                      <th className="text-center py-2">Manage Users</th>
                      <th className="text-center py-2">Manage Settings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PermissionChecker.getAllRoles().map((role) => (
                      <tr key={role} className="border-b">
                        <td className="py-2 font-medium">{role.toUpperCase()}</td>
                        <td className="text-center py-2">
                          {PermissionChecker.hasPermission(role, 'read:all') || PermissionChecker.hasPermission(role, 'read:assigned') ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {PermissionChecker.hasPermission(role, 'write:all') || PermissionChecker.hasPermission(role, 'write:assigned') ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {PermissionChecker.hasPermission(role, 'delete:all') || PermissionChecker.hasPermission(role, 'delete:assigned') ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {PermissionChecker.hasPermission(role, 'manage:users') ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center py-2">
                          {PermissionChecker.hasPermission(role, 'manage:settings') ? (
                            <Check className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Role Update Modal */}
      {selectedUser && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUser(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "max-w-md w-full p-6 rounded-lg border-2",
              isDark ? "bg-black border-white/30" : "bg-white border-black/30"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Update User Role</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">User</label>
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="font-medium">{selectedUser.name || selectedUser.email}</div>
                  <div className="text-sm text-gray-500">{selectedUser.email}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Role</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {PermissionChecker.getAllRoles().map((role) => (
                    <option key={role} value={role} disabled={!canAssignRole(role)}>
                      {role.toUpperCase()} {!canAssignRole(role) && '(Restricted)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                onClick={() => setSelectedUser(null)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRoleUpdate(selectedUser.id, selectedUser.role)}
                disabled={isUpdating}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                  "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
                  isUpdating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUpdating ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Invite User Modal */}
      {isInviting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsInviting(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "max-w-md w-full p-6 rounded-lg border-2",
              isDark ? "bg-black border-white/30" : "bg-white border-black/30"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Invite New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className={cn(
                    "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                    "bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                    "border-gray-300 dark:border-gray-600"
                  )}
                >
                  {PermissionChecker.getAllRoles().map((role) => (
                    <option key={role} value={role} disabled={!canAssignRole(role)}>
                      {role.toUpperCase()} {!canAssignRole(role) && '(Restricted)'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                onClick={() => setIsInviting(false)}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                  isDark
                    ? "border-white/30 hover:border-white/50"
                    : "border-black/30 hover:border-black/50"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleUserInvite}
                disabled={isInviting || !inviteEmail}
                className={cn(
                  "px-4 py-2 rounded-lg border-2 transition-all duration-300",
                  "bg-blue-500 text-white border-blue-500 hover:bg-blue-600",
                  (isInviting || !inviteEmail) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isInviting ? 'Inviting...' : 'Send Invite'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
