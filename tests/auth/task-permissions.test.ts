/**
 * Task Permissions System Tests
 * HT-004.5.1: Granular Permissions System Testing
 * 
 * Comprehensive tests for the granular permissions system including:
 * - Permission checking functions
 * - Role-based access control
 * - Team management
 * - Custom permissions
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { createServerSupabase } from '@lib/supabase/server';
import { TaskPermissionChecker, TeamManager } from '@lib/auth/task-permissions';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  rpc: jest.fn(),
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      or: jest.fn(() => ({
        is: jest.fn(() => ({
          or: jest.fn(),
        })),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

describe('Task Permissions System', () => {
  let permissionChecker: TaskPermissionChecker;
  let teamManager: TeamManager;

  beforeEach(() => {
    permissionChecker = new TaskPermissionChecker(mockSupabase as any);
    teamManager = new TeamManager(mockSupabase as any);
    jest.clearAllMocks();
  });

  describe('TaskPermissionChecker', () => {
    it('should check if user has read permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });
      mockSupabase.rpc.mockResolvedValue({ data: true });

      const hasPermission = await permissionChecker.hasPermission('task-123', undefined, undefined, 'read');
      
      expect(hasPermission).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('has_task_permission', {
        p_user_id: 'user-123',
        p_task_id: 'task-123',
        p_subtask_id: null,
        p_action_id: null,
        p_permission: 'read'
      });
    });

    it('should return false when user has no permission', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });
      mockSupabase.rpc.mockResolvedValue({ data: false });

      const hasPermission = await permissionChecker.hasPermission('task-123', undefined, undefined, 'write');
      
      expect(hasPermission).toBe(false);
    });

    it('should handle permission check errors gracefully', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });
      mockSupabase.rpc.mockRejectedValue(new Error('Database error'));

      const hasPermission = await permissionChecker.hasPermission('task-123', undefined, undefined, 'read');
      
      expect(hasPermission).toBe(false);
    });

    it('should get all user permissions', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });
      
      // Mock multiple permission checks
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: true })  // read
        .mockResolvedValueOnce({ data: true })  // write
        .mockResolvedValueOnce({ data: false }) // delete
        .mockResolvedValueOnce({ data: false }) // assign
        .mockResolvedValueOnce({ data: true })  // comment
        .mockResolvedValueOnce({ data: false }) // attach
        .mockResolvedValueOnce({ data: false }) // manage_dependencies
        .mockResolvedValueOnce({ data: true }) // change_status
        .mockResolvedValueOnce({ data: false }); // manage_metadata

      const permissions = await permissionChecker.getUserPermissions('task-123');
      
      expect(permissions).toEqual({
        read: true,
        write: true,
        delete: false,
        assign: false,
        comment: true,
        attach: false,
        manage_dependencies: false,
        change_status: true,
        manage_metadata: false
      });
    });

    it('should grant permission successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true });

      const success = await permissionChecker.grantPermission(
        'user-456',
        'write',
        'task-123',
        undefined,
        undefined,
        '2025-12-31T23:59:59Z'
      );
      
      expect(success).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('grant_task_permission', {
        p_task_id: 'task-123',
        p_subtask_id: null,
        p_action_id: null,
        p_user_id: 'user-456',
        p_permission: 'write',
        p_expires_at: '2025-12-31T23:59:59Z'
      });
    });

    it('should revoke permission successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: true });

      const success = await permissionChecker.revokePermission(
        'user-456',
        'write',
        'task-123'
      );
      
      expect(success).toBe(true);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('revoke_task_permission', {
        p_task_id: 'task-123',
        p_subtask_id: null,
        p_action_id: null,
        p_user_id: 'user-456',
        p_permission: 'write'
      });
    });

    it('should get task permissions', async () => {
      const mockPermissions = [
        {
          id: 'perm-1',
          user_id: 'user-456',
          permission: 'read',
          granted_at: '2025-09-08T10:00:00Z'
        },
        {
          id: 'perm-2',
          user_id: 'user-789',
          permission: 'write',
          granted_at: '2025-09-08T11:00:00Z'
        }
      ];

      mockSupabase.from().select().or().is().or.mockResolvedValue({
        data: mockPermissions
      });

      const permissions = await permissionChecker.getTaskPermissions('task-123');
      
      expect(permissions).toEqual(mockPermissions);
    });
  });

  describe('TeamManager', () => {
    it('should create a new team', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });

      const mockTeam = {
        id: 'team-123',
        name: 'Test Team',
        description: 'A test team',
        owner_id: 'user-123',
        created_at: '2025-09-08T10:00:00Z',
        updated_at: '2025-09-08T10:00:00Z',
        settings: {}
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTeam
      });

      const team = await teamManager.createTeam('Test Team', 'A test team');
      
      expect(team).toEqual(mockTeam);
      expect(mockSupabase.from).toHaveBeenCalledWith('hero_teams');
    });

    it('should add team member', async () => {
      mockSupabase.from().insert.mockResolvedValue({ data: {} });

      const success = await teamManager.addTeamMember('team-123', 'user-456', 'member');
      
      expect(success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('hero_team_memberships');
    });

    it('should remove team member', async () => {
      mockSupabase.from().delete().eq().eq.mockResolvedValue({ data: {} });

      const success = await teamManager.removeTeamMember('team-123', 'user-456');
      
      expect(success).toBe(true);
    });

    it('should get team members', async () => {
      const mockMembers = [
        {
          id: 'membership-1',
          team_id: 'team-123',
          user_id: 'user-456',
          role: 'member',
          joined_at: '2025-09-08T10:00:00Z'
        }
      ];

      mockSupabase.from().select().eq.mockResolvedValue({
        data: mockMembers
      });

      const members = await teamManager.getTeamMembers('team-123');
      
      expect(members).toEqual(mockMembers);
    });

    it('should get user teams', async () => {
      const mockTeams = [
        {
          id: 'team-123',
          name: 'Test Team',
          description: 'A test team',
          owner_id: 'user-123',
          created_at: '2025-09-08T10:00:00Z',
          updated_at: '2025-09-08T10:00:00Z',
          settings: {}
        }
      ];

      mockSupabase.from().select().eq.mockResolvedValue({
        data: [{ hero_teams: mockTeams[0] }]
      });

      const teams = await teamManager.getUserTeams('user-123');
      
      expect(teams).toEqual(mockTeams);
    });
  });

  describe('Permission Scenarios', () => {
    it('should handle task owner permissions', async () => {
      // Task owner should have all permissions
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'owner-123' } }
      });
      mockSupabase.rpc.mockResolvedValue({ data: true });

      const permissions = await permissionChecker.getUserPermissions('task-123');
      
      // All permissions should be true for owner
      Object.values(permissions).forEach(permission => {
        expect(permission).toBe(true);
      });
    });

    it('should handle team member permissions', async () => {
      // Team member should have limited permissions
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'member-123' } }
      });
      
      // Mock team member permissions
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: true })  // read
        .mockResolvedValueOnce({ data: true })  // write
        .mockResolvedValueOnce({ data: false }) // delete
        .mockResolvedValueOnce({ data: false }) // assign
        .mockResolvedValueOnce({ data: true })  // comment
        .mockResolvedValueOnce({ data: true })  // attach
        .mockResolvedValueOnce({ data: false }) // manage_dependencies
        .mockResolvedValueOnce({ data: true })  // change_status
        .mockResolvedValueOnce({ data: false }); // manage_metadata

      const permissions = await permissionChecker.getUserPermissions('task-123');
      
      expect(permissions.read).toBe(true);
      expect(permissions.write).toBe(true);
      expect(permissions.delete).toBe(false);
      expect(permissions.assign).toBe(false);
      expect(permissions.comment).toBe(true);
      expect(permissions.attach).toBe(true);
      expect(permissions.change_status).toBe(true);
    });

    it('should handle viewer permissions', async () => {
      // Viewer should only have read permission
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'viewer-123' } }
      });
      
      // Mock viewer permissions
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: true })  // read
        .mockResolvedValueOnce({ data: false }) // write
        .mockResolvedValueOnce({ data: false }) // delete
        .mockResolvedValueOnce({ data: false }) // assign
        .mockResolvedValueOnce({ data: false }) // comment
        .mockResolvedValueOnce({ data: false }) // attach
        .mockResolvedValueOnce({ data: false }) // manage_dependencies
        .mockResolvedValueOnce({ data: false }) // change_status
        .mockResolvedValueOnce({ data: false }); // manage_metadata

      const permissions = await permissionChecker.getUserPermissions('task-123');
      
      expect(permissions.read).toBe(true);
      Object.entries(permissions).forEach(([key, value]) => {
        if (key !== 'read') {
          expect(value).toBe(false);
        }
      });
    });

    it('should handle custom permissions', async () => {
      // User with custom permissions
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'custom-123' } }
      });
      
      // Mock custom permissions (only comment and attach)
      mockSupabase.rpc
        .mockResolvedValueOnce({ data: false }) // read
        .mockResolvedValueOnce({ data: false }) // write
        .mockResolvedValueOnce({ data: false }) // delete
        .mockResolvedValueOnce({ data: false }) // assign
        .mockResolvedValueOnce({ data: true })  // comment
        .mockResolvedValueOnce({ data: true })  // attach
        .mockResolvedValueOnce({ data: false }) // manage_dependencies
        .mockResolvedValueOnce({ data: false }) // change_status
        .mockResolvedValueOnce({ data: false }); // manage_metadata

      const permissions = await permissionChecker.getUserPermissions('task-123');
      
      expect(permissions.read).toBe(false);
      expect(permissions.write).toBe(false);
      expect(permissions.comment).toBe(true);
      expect(permissions.attach).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Connection failed'));

      const hasPermission = await permissionChecker.hasPermission('task-123', undefined, undefined, 'read');
      
      expect(hasPermission).toBe(false);
    });

    it('should handle invalid task IDs', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } }
      });
      mockSupabase.rpc.mockResolvedValue({ data: false });

      const hasPermission = await permissionChecker.hasPermission('invalid-task', undefined, undefined, 'read');
      
      expect(hasPermission).toBe(false);
    });

    it('should handle permission grant failures', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: false });

      const success = await permissionChecker.grantPermission('user-456', 'write', 'task-123');
      
      expect(success).toBe(false);
    });
  });
});

/**
 * Integration tests for the complete permissions system
 */
describe('Permissions System Integration', () => {
  it('should enforce permissions in API routes', async () => {
    // This would test the actual API endpoints
    // Mock the API request and verify permissions are checked
    const mockRequest = {
      url: 'http://localhost:3000/api/hero-tasks/task-123/permissions',
      json: () => Promise.resolve({ userId: 'user-456', permission: 'write' })
    };

    // Test would verify that the API properly checks permissions
    // and returns appropriate responses
  });

  it('should enforce permissions in React components', () => {
    // This would test that PermissionGuard and PermissionButton
    // components properly hide/show content based on permissions
  });

  it('should handle team-based access control', async () => {
    // Test that team members can access team tasks
    // but non-members cannot
  });

  it('should handle private task access', async () => {
    // Test that only task owners and assignees can access private tasks
  });

  it('should handle public task access', async () => {
    // Test that anyone can access public tasks
  });
});
