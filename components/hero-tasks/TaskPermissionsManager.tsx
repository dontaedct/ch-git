/**
 * Task Permissions Management Component
 * HT-004.5.1: Granular Permissions System UI
 * 
 * Provides a UI for managing task-level permissions including:
 * - Viewing current permissions
 * - Granting/revoking permissions to users
 * - Managing team access
 * - Setting task access levels
 */

import React, { useState, useEffect } from 'react';
import { createServerSupabase } from '@lib/supabase/server';
import { TaskPermissionChecker, TeamManager, TaskPermission, TaskAccessLevel } from '@lib/auth/task-permissions';

interface TaskPermissionsManagerProps {
  taskId?: string;
  subtaskId?: string;
  actionId?: string;
  onPermissionsChange?: () => void;
}

interface User {
  id: string;
  email: string;
  name?: string;
}

export function TaskPermissionsManager({ 
  taskId, 
  subtaskId, 
  actionId, 
  onPermissionsChange 
}: TaskPermissionsManagerProps) {
  const [supabase] = useState(() => createServerSupabase());
  const [permissions, setPermissions] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedPermission, setSelectedPermission] = useState<TaskPermission>('read');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [accessLevel, setAccessLevel] = useState<TaskAccessLevel>('team');
  const [selectedTeam, setSelectedTeam] = useState<string>('');

  const permissionChecker = new TaskPermissionChecker(supabase);
  const teamManager = new TeamManager(supabase);

  useEffect(() => {
    loadData();
  }, [taskId, subtaskId, actionId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load current permissions
      const currentPermissions = await permissionChecker.getUserPermissions(taskId, subtaskId, actionId);
      setPermissions(currentPermissions);
      
      // Load users (simplified - in real app, you'd have a users table)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUsers([{ id: user.id, email: user.email || '', name: user.user_metadata?.name }]);
      }
      
      // Load teams
      const userTeams = await teamManager.getUserTeams();
      setTeams(userTeams);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantPermission = async () => {
    if (!selectedUser || !selectedPermission) return;
    
    try {
      const success = await permissionChecker.grantPermission(
        selectedUser,
        selectedPermission,
        taskId,
        subtaskId,
        actionId,
        expiresAt || undefined
      );
      
      if (success) {
        await loadData();
        onPermissionsChange?.();
        setSelectedUser('');
        setExpiresAt('');
      } else {
        setError('Failed to grant permission');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to grant permission');
    }
  };

  const handleRevokePermission = async (userId: string, permission: TaskPermission) => {
    try {
      const success = await permissionChecker.revokePermission(
        userId,
        permission,
        taskId,
        subtaskId,
        actionId
      );
      
      if (success) {
        await loadData();
        onPermissionsChange?.();
      } else {
        setError('Failed to revoke permission');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke permission');
    }
  };

  const handleUpdateAccessLevel = async () => {
    try {
      const table = taskId ? 'hero_tasks' : subtaskId ? 'hero_subtasks' : 'hero_actions';
      const id = taskId || subtaskId || actionId;
      
      const { error } = await supabase
        .from(table)
        .update({ 
          access_level: accessLevel,
          team_id: selectedTeam || null
        })
        .eq('id', id);
      
      if (error) throw error;
      
      await loadData();
      onPermissionsChange?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update access level');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Permissions</h3>
        <div className="grid grid-cols-3 gap-4">
          {permissions && Object.entries(permissions).map(([permission, hasAccess]) => (
            <div key={permission} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${hasAccess ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium text-gray-700 capitalize">
                {permission.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Access Level Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Level</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Level
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value as TaskAccessLevel)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public - Anyone can see</option>
              <option value="team">Team - Team members only</option>
              <option value="private">Private - Creator and assignees only</option>
              <option value="restricted">Restricted - Custom permissions only</option>
            </select>
          </div>
          
          {accessLevel === 'team' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          
          <button
            onClick={handleUpdateAccessLevel}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Update Access Level
          </button>
        </div>
      </div>

      {/* Grant Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Grant Permission</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User
            </label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permission
            </label>
            <select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value as TaskPermission)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="read">Read</option>
              <option value="write">Write</option>
              <option value="delete">Delete</option>
              <option value="assign">Assign</option>
              <option value="comment">Comment</option>
              <option value="attach">Attach Files</option>
              <option value="manage_dependencies">Manage Dependencies</option>
              <option value="change_status">Change Status</option>
              <option value="manage_metadata">Manage Metadata</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={handleGrantPermission}
            disabled={!selectedUser || !selectedPermission}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Grant Permission
          </button>
        </div>
      </div>

      {/* Current Custom Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Permissions</h3>
        <div className="text-sm text-gray-600">
          <p>Custom permissions will be displayed here once they are granted.</p>
          <p className="mt-2">Use the "Grant Permission" section above to add specific permissions for individual users.</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Permission Guard Component
 * Wraps content and only renders if user has required permission
 */
interface PermissionGuardProps {
  taskId?: string;
  subtaskId?: string;
  actionId?: string;
  permission: TaskPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({ 
  taskId, 
  subtaskId, 
  actionId, 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [supabase] = useState(() => createServerSupabase());

  useEffect(() => {
    const checker = new TaskPermissionChecker(supabase);
    checker.hasPermission(taskId, subtaskId, actionId, permission)
      .then(setHasPermission);
  }, [supabase, taskId, subtaskId, actionId, permission]);

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Permission Button Component
 * Button that's disabled if user doesn't have required permission
 */
interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  taskId?: string;
  subtaskId?: string;
  actionId?: string;
  permission: TaskPermission;
  children: React.ReactNode;
}

export function PermissionButton({ 
  taskId, 
  subtaskId, 
  actionId, 
  permission, 
  children, 
  ...props 
}: PermissionButtonProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [supabase] = useState(() => createServerSupabase());

  useEffect(() => {
    const checker = new TaskPermissionChecker(supabase);
    checker.hasPermission(taskId, subtaskId, actionId, permission)
      .then(setHasPermission);
  }, [supabase, taskId, subtaskId, actionId, permission]);

  return (
    <button
      {...props}
      disabled={props.disabled || hasPermission === false}
      className={`${props.className || ''} ${hasPermission === false ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

export default TaskPermissionsManager;
