/**
 * Hero Tasks Granular Permissions System
 * HT-004.5.1: Implement role-based access control with task-level permissions
 *
 * This module provides TypeScript types and utilities for the granular permissions system
 * that allows fine-grained control over task access and operations.
 */

import React from 'react';

export type TaskPermission = 
  | 'read'
  | 'write' 
  | 'delete'
  | 'assign'
  | 'comment'
  | 'attach'
  | 'manage_dependencies'
  | 'change_status'
  | 'manage_metadata';

export type TaskAccessLevel = 
  | 'public'      // Anyone can see
  | 'team'        // Team members only
  | 'private'     // Creator and assignees only
  | 'restricted'; // Custom permissions only

export interface TaskPermissions {
  read: boolean;
  write: boolean;
  delete: boolean;
  assign: boolean;
  comment: boolean;
  attach: boolean;
  manage_dependencies: boolean;
  change_status: boolean;
  manage_metadata: boolean;
}

export interface HeroTaskPermission {
  id: string;
  task_id?: string;
  subtask_id?: string;
  action_id?: string;
  user_id: string;
  role_id?: string;
  permission: TaskPermission;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface HeroTeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'viewer' | 'admin' | 'staff';
  joined_at: string;
  invited_by?: string;
}

export interface HeroTeam {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  settings: Record<string, any>;
}

export interface EnhancedHeroTask {
  id: string;
  task_number: string;
  title: string;
  description?: string;
  status: 'draft' | 'ready' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  
  // Dates
  created_at: string;
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  
  // Workflow
  current_phase: 'audit' | 'decide' | 'apply' | 'verify';
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  
  // Relationships
  parent_task_id?: string;
  assignee_id?: string;
  created_by: string;
  
  // Enhanced permissions
  access_level: TaskAccessLevel;
  owner_id: string;
  team_id?: string;
  custom_permissions: Record<string, any>;
  
  // Metadata
  tags: string[];
  metadata: Record<string, any>;
  audit_trail: any[];
}

/**
 * Permission checking utilities
 */
export class TaskPermissionChecker {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Check if the current user has a specific permission on a task
   */
  async hasPermission(
    taskId?: string,
    subtaskId?: string,
    actionId?: string,
    permission: TaskPermission = 'read'
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('has_task_permission', {
      p_user_id: (await this.supabase.auth.getUser()).data.user?.id,
      p_task_id: taskId || null,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_permission: permission
    });

    if (error) {
      console.error('Permission check failed:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Get all permissions for the current user on a task
   */
  async getUserPermissions(
    taskId?: string,
    subtaskId?: string,
    actionId?: string
  ): Promise<TaskPermissions> {
    const permissions: TaskPermission[] = [
      'read', 'write', 'delete', 'assign', 'comment', 
      'attach', 'manage_dependencies', 'change_status', 'manage_metadata'
    ];

    const results: TaskPermissions = {
      read: false,
      write: false,
      delete: false,
      assign: false,
      comment: false,
      attach: false,
      manage_dependencies: false,
      change_status: false,
      manage_metadata: false
    };

    for (const permission of permissions) {
      results[permission] = await this.hasPermission(taskId, subtaskId, actionId, permission);
    }

    return results;
  }

  /**
   * Grant a permission to a user
   */
  async grantPermission(
    userId: string,
    permission: TaskPermission,
    taskId?: string,
    subtaskId?: string,
    actionId?: string,
    expiresAt?: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('grant_task_permission', {
      p_task_id: taskId || null,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_user_id: userId,
      p_permission: permission,
      p_expires_at: expiresAt || null
    });

    if (error) {
      console.error('Grant permission failed:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Revoke a permission from a user
   */
  async revokePermission(
    userId: string,
    permission: TaskPermission,
    taskId?: string,
    subtaskId?: string,
    actionId?: string
  ): Promise<boolean> {
    const { data, error } = await this.supabase.rpc('revoke_task_permission', {
      p_task_id: taskId || null,
      p_subtask_id: subtaskId || null,
      p_action_id: actionId || null,
      p_user_id: userId,
      p_permission: permission
    });

    if (error) {
      console.error('Revoke permission failed:', error);
      return false;
    }

    return data === true;
  }

  /**
   * Get all users with permissions on a task
   */
  async getTaskPermissions(
    taskId?: string,
    subtaskId?: string,
    actionId?: string
  ): Promise<HeroTaskPermission[]> {
    const { data, error } = await this.supabase
      .from('hero_task_permissions')
      .select('*')
      .or(`task_id.eq.${taskId},subtask_id.eq.${subtaskId},action_id.eq.${actionId}`)
      .is('expires_at', null)
      .or('expires_at.gt.' + new Date().toISOString());

    if (error) {
      console.error('Get task permissions failed:', error);
      return [];
    }

    return data || [];
  }
}

/**
 * Team management utilities
 */
export class TeamManager {
  private supabase: any;

  constructor(supabase: any) {
    this.supabase = supabase;
  }

  /**
   * Create a new team
   */
  async createTeam(name: string, description?: string): Promise<HeroTeam | null> {
    const { data: user } = await this.supabase.auth.getUser();
    if (!user.user) return null;

    const { data, error } = await this.supabase
      .from('hero_teams')
      .insert({
        name,
        description,
        owner_id: user.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Create team failed:', error);
      return null;
    }

    // Add owner as team member
    await this.addTeamMember(data.id, user.user.id, 'owner');

    return data;
  }

  /**
   * Add a user to a team
   */
  async addTeamMember(
    teamId: string, 
    userId: string, 
    role: 'owner' | 'member' | 'viewer' | 'admin' | 'staff' = 'member'
  ): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('hero_team_memberships')
      .insert({
        team_id: teamId,
        user_id: userId,
        role
      });

    if (error) {
      console.error('Add team member failed:', error);
      return false;
    }

    return true;
  }

  /**
   * Remove a user from a team
   */
  async removeTeamMember(teamId: string, userId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('hero_team_memberships')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      console.error('Remove team member failed:', error);
      return false;
    }

    return true;
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<HeroTeamMembership[]> {
    const { data, error } = await this.supabase
      .from('hero_team_memberships')
      .select('*')
      .eq('team_id', teamId);

    if (error) {
      console.error('Get team members failed:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId?: string): Promise<HeroTeam[]> {
    const currentUser = userId || (await this.supabase.auth.getUser()).data.user?.id;
    if (!currentUser) return [];

    const { data, error } = await this.supabase
      .from('hero_team_memberships')
      .select(`
        hero_teams (
          id,
          name,
          description,
          owner_id,
          created_at,
          updated_at,
          settings
        )
      `)
      .eq('user_id', currentUser);

    if (error) {
      console.error('Get user teams failed:', error);
      return [];
    }

    return data?.map((item: any) => item.hero_teams) || [];
  }
}

/**
 * React hook for task permissions
 */
export function useTaskPermissions(
  supabase: any,
  taskId?: string,
  subtaskId?: string,
  actionId?: string
) {
  const [permissions, setPermissions] = React.useState<TaskPermissions | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!supabase) return;

    const checker = new TaskPermissionChecker(supabase);
    
    checker.getUserPermissions(taskId, subtaskId, actionId)
      .then(setPermissions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [supabase, taskId, subtaskId, actionId]);

  const hasPermission = React.useCallback(
    (permission: TaskPermission) => permissions?.[permission] || false,
    [permissions]
  );

  return {
    permissions,
    loading,
    error,
    hasPermission
  };
}

/**
 * React hook for team management
 */
export function useTeamManagement(supabase: any) {
  const [teams, setTeams] = React.useState<HeroTeam[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!supabase) return;

    const manager = new TeamManager(supabase);
    
    manager.getUserTeams()
      .then(setTeams)
      .finally(() => setLoading(false));
  }, [supabase]);

  const createTeam = React.useCallback(
    async (name: string, description?: string) => {
      const manager = new TeamManager(supabase);
      const newTeam = await manager.createTeam(name, description);
      if (newTeam) {
        setTeams(prev => [...prev, newTeam]);
      }
      return newTeam;
    },
    [supabase]
  );

  const addMember = React.useCallback(
    async (teamId: string, userId: string, role: 'owner' | 'member' | 'viewer' | 'admin' | 'staff' = 'member') => {
      const manager = new TeamManager(supabase);
      return await manager.addTeamMember(teamId, userId, role);
    },
    [supabase]
  );

  const removeMember = React.useCallback(
    async (teamId: string, userId: string) => {
      const manager = new TeamManager(supabase);
      return await manager.removeTeamMember(teamId, userId);
    },
    [supabase]
  );

  return {
    teams,
    loading,
    createTeam,
    addMember,
    removeMember
  };
}

// Export default permission checker for easy use
export default TaskPermissionChecker;
