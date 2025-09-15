/**
 * Hero Tasks Time Tracking Test Suite
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import { AutoTimeTracking } from '@/lib/time-tracking/auto-tracking';
import {
  TimeEntry,
  TimeTrackingSession,
  TimeTrackingSettings,
  CreateTimeEntryRequest,
  StartTimeTrackingRequest,
  StopTimeTrackingRequest
} from '@/types/hero-tasks';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            single: jest.fn()
          }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    })),
    rpc: jest.fn()
  }))
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}));

describe('TimeTrackingService', () => {
  const mockUserId = 'test-user-123';
  const mockTaskId = 'test-task-456';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startTracking', () => {
    it('should start time tracking for a task', async () => {
      const mockSession: TimeTrackingSession = {
        id: 'session-123',
        task_id: mockTaskId,
        user_id: mockUserId,
        start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockSession,
        error: null
      });

      const request: StartTimeTrackingRequest = {
        task_id: mockTaskId,
        description: 'Test tracking session'
      };

      const result = await TimeTrackingService.startTracking(mockUserId, request);

      expect(result).toEqual(mockSession);
      expect(mockSupabase.from).toHaveBeenCalledWith('time_tracking_sessions');
    });

    it('should handle errors when starting tracking', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const request: StartTimeTrackingRequest = {
        task_id: mockTaskId
      };

      await expect(TimeTrackingService.startTracking(mockUserId, request))
        .rejects.toThrow('Failed to start time tracking');
    });
  });

  describe('stopTracking', () => {
    it('should stop time tracking and create time entry', async () => {
      const mockActiveSession: TimeTrackingSession = {
        id: 'session-123',
        task_id: mockTaskId,
        user_id: mockUserId,
        start_time: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        last_activity: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockTimeEntry: TimeEntry = {
        id: 'entry-123',
        task_id: mockTaskId,
        user_id: mockUserId,
        description: 'Test tracking session',
        start_time: mockActiveSession.start_time,
        end_time: new Date().toISOString(),
        duration_minutes: 60,
        is_active: false,
        is_manual: true,
        created_by: mockUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock getActiveSession
      mockSupabase.from().select().eq().eq().order().limit().single.mockResolvedValue({
        data: mockActiveSession,
        error: null
      });

      // Mock create time entry
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTimeEntry,
        error: null
      });

      // Mock update session
      mockSupabase.from().update().eq.mockResolvedValue({
        data: null,
        error: null
      });

      const request: StopTimeTrackingRequest = {
        description: 'Test completion'
      };

      const result = await TimeTrackingService.stopTracking(mockUserId, request);

      expect(result).toEqual(mockTimeEntry);
      expect(mockSupabase.from).toHaveBeenCalledWith('time_entries');
    });

    it('should handle no active session error', async () => {
      mockSupabase.from().select().eq().eq().order().limit().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // No rows returned
      });

      await expect(TimeTrackingService.stopTracking(mockUserId))
        .rejects.toThrow('No active time tracking session found');
    });
  });

  describe('getActiveSession', () => {
    it('should return active session if exists', async () => {
      const mockSession: TimeTrackingSession = {
        id: 'session-123',
        task_id: mockTaskId,
        user_id: mockUserId,
        start_time: new Date().toISOString(),
        last_activity: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabase.from().select().eq().eq().order().limit().single.mockResolvedValue({
        data: mockSession,
        error: null
      });

      const result = await TimeTrackingService.getActiveSession(mockUserId);

      expect(result).toEqual(mockSession);
    });

    it('should return null if no active session', async () => {
      mockSupabase.from().select().eq().eq().order().limit().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }
      });

      const result = await TimeTrackingService.getActiveSession(mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('createTimeEntry', () => {
    it('should create a manual time entry', async () => {
      const mockTimeEntry: TimeEntry = {
        id: 'entry-123',
        task_id: mockTaskId,
        user_id: mockUserId,
        description: 'Manual entry',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        duration_minutes: 30,
        is_active: false,
        is_manual: true,
        created_by: mockUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTimeEntry,
        error: null
      });

      const request: CreateTimeEntryRequest = {
        task_id: mockTaskId,
        description: 'Manual entry',
        duration_minutes: 30
      };

      const result = await TimeTrackingService.createTimeEntry(mockUserId, request);

      expect(result).toEqual(mockTimeEntry);
    });

    it('should handle missing task_id error', async () => {
      const request: CreateTimeEntryRequest = {
        task_id: '',
        description: 'Invalid entry'
      };

      await expect(TimeTrackingService.createTimeEntry(mockUserId, request))
        .rejects.toThrow('Failed to create time entry');
    });
  });

  describe('getTimeEntries', () => {
    it('should return time entries with filters', async () => {
      const mockEntries: TimeEntry[] = [
        {
          id: 'entry-1',
          task_id: mockTaskId,
          user_id: mockUserId,
          description: 'Entry 1',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration_minutes: 60,
          is_active: false,
          is_manual: true,
          created_by: mockUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      mockSupabase.from().select().eq().eq().gte().lte().limit().mockResolvedValue({
        data: mockEntries,
        error: null
      });

      const result = await TimeTrackingService.getTimeEntries(mockUserId, {
        taskId: mockTaskId,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        limit: 10
      });

      expect(result).toEqual(mockEntries);
    });

    it('should return empty array on error', async () => {
      mockSupabase.from().select().eq().mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await TimeTrackingService.getTimeEntries(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getTimeTrackingSummary', () => {
    it('should return time tracking summary', async () => {
      const mockSummaryData = [{
        total_hours: 40.5,
        total_entries: 15,
        tasks_tracked: 5,
        average_session_hours: 2.7,
        most_active_day: 'Monday',
        most_active_task_id: mockTaskId
      }];

      const mockSettings = {
        daily_goal_hours: 8,
        weekly_goal_hours: 40
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockSummaryData,
        error: null
      });

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockSettings,
        error: null
      });

      const result = await TimeTrackingService.getTimeTrackingSummary(mockUserId);

      expect(result.total_hours).toBe(40.5);
      expect(result.total_entries).toBe(15);
      expect(result.tasks_tracked).toBe(5);
      expect(result.daily_goal_progress).toBeGreaterThan(0);
    });
  });
});

describe('AutoTimeTracking', () => {
  let autoTracking: AutoTimeTracking;
  const mockUserId = 'test-user-123';

  beforeEach(() => {
    // Mock document and window for browser environment
    Object.defineProperty(document, 'hidden', {
      writable: true,
      value: false
    });

    // Mock addEventListener and removeEventListener
    jest.spyOn(document, 'addEventListener').mockImplementation(() => {});
    jest.spyOn(document, 'removeEventListener').mockImplementation(() => {});

    autoTracking = new AutoTimeTracking({
      userId: mockUserId,
      enabled: true,
      idleTimeout: 15,
      activityCheckInterval: 30000
    });
  });

  afterEach(() => {
    autoTracking.destroy();
    jest.clearAllMocks();
  });

  it('should initialize with correct settings', () => {
    expect(autoTracking).toBeDefined();
  });

  it('should handle activity detection', () => {
    const onActivityDetected = jest.fn();
    autoTracking = new AutoTimeTracking({
      userId: mockUserId,
      enabled: true,
      onActivityDetected
    });

    // Simulate activity
    const event = new Event('mousedown');
    document.dispatchEvent(event);

    expect(onActivityDetected).toHaveBeenCalled();
  });

  it('should handle idle detection', () => {
    const onIdleDetected = jest.fn();
    autoTracking = new AutoTimeTracking({
      userId: mockUserId,
      enabled: true,
      idleTimeout: 1, // 1 minute for testing
      onIdleDetected
    });

    // Simulate idle time
    autoTracking['lastActivity'] = Date.now() - 2 * 60 * 1000; // 2 minutes ago
    autoTracking['isTracking'] = true;

    autoTracking['checkIdle']();

    expect(onIdleDetected).toHaveBeenCalled();
  });

  it('should update settings correctly', () => {
    const newSettings = {
      auto_tracking_enabled: false,
      idle_timeout_minutes: 30
    };

    autoTracking.updateSettings(newSettings);

    expect(autoTracking['enabled']).toBe(false);
    expect(autoTracking['idleTimeout']).toBe(30 * 60 * 1000);
  });

  it('should start and stop correctly', () => {
    autoTracking.stop();
    expect(autoTracking['enabled']).toBe(false);

    autoTracking.start();
    expect(autoTracking['enabled']).toBe(true);
  });
});

describe('Time Tracking Integration', () => {
  it('should handle complete time tracking workflow', async () => {
    const mockUserId = 'integration-test-user';
    const mockTaskId = 'integration-test-task';

    // Mock successful responses
    const mockSession: TimeTrackingSession = {
      id: 'session-123',
      task_id: mockTaskId,
      user_id: mockUserId,
      start_time: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const mockTimeEntry: TimeEntry = {
      id: 'entry-123',
      task_id: mockTaskId,
      user_id: mockUserId,
      description: 'Integration test',
      start_time: mockSession.start_time,
      end_time: new Date().toISOString(),
      duration_minutes: 60,
      is_active: false,
      is_manual: true,
      created_by: mockUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Mock start tracking
    mockSupabase.from().insert().select().single.mockResolvedValueOnce({
      data: mockSession,
      error: null
    });

    // Mock get active session
    mockSupabase.from().select().eq().eq().order().limit().single.mockResolvedValue({
      data: mockSession,
      error: null
    });

    // Mock stop tracking
    mockSupabase.from().insert().select().single.mockResolvedValueOnce({
      data: mockTimeEntry,
      error: null
    });

    mockSupabase.from().update().eq.mockResolvedValue({
      data: null,
      error: null
    });

    // Test workflow
    const startRequest: StartTimeTrackingRequest = {
      task_id: mockTaskId,
      description: 'Integration test'
    };

    const session = await TimeTrackingService.startTracking(mockUserId, startRequest);
    expect(session).toEqual(mockSession);

    const stopRequest: StopTimeTrackingRequest = {
      description: 'Integration test complete'
    };

    const entry = await TimeTrackingService.stopTracking(mockUserId, stopRequest);
    expect(entry).toEqual(mockTimeEntry);
  });
});
