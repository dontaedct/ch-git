/**
 * Hero Tasks Time Tracking Hook
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  TimeTrackingSession, 
  TimeTrackingSummary, 
  TimeEntry,
  TimeTrackingSettings,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  StartTimeTrackingRequest,
  StopTimeTrackingRequest
} from '@/types/hero-tasks';
import { TimeTrackingService } from '@/lib/time-tracking/service';

interface UseTimeTrackingOptions {
  userId: string;
  taskId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseTimeTrackingReturn {
  // State
  isTracking: boolean;
  activeSession: TimeTrackingSession | null;
  summary: TimeTrackingSummary | null;
  settings: TimeTrackingSettings | null;
  isLoading: boolean;
  error: string | null;
  elapsedTime: number;

  // Actions
  startTracking: (request: StartTimeTrackingRequest) => Promise<void>;
  stopTracking: (request?: StopTimeTrackingRequest) => Promise<void>;
  updateActivity: () => Promise<void>;
  createTimeEntry: (request: CreateTimeEntryRequest) => Promise<TimeEntry>;
  updateTimeEntry: (entryId: string, request: UpdateTimeEntryRequest) => Promise<TimeEntry>;
  deleteTimeEntry: (entryId: string) => Promise<void>;
  refreshSummary: () => Promise<void>;
  refreshSettings: () => Promise<void>;

  // Utilities
  formatTime: (seconds: number) => string;
  formatDuration: (minutes: number) => string;
  formatHours: (hours: number) => string;
}

export function useTimeTracking({
  userId,
  taskId,
  autoRefresh = true,
  refreshInterval = 30000
}: UseTimeTrackingOptions): UseTimeTrackingReturn {
  const [isTracking, setIsTracking] = useState(false);
  const [activeSession, setActiveSession] = useState<TimeTrackingSession | null>(null);
  const [summary, setSummary] = useState<TimeTrackingSummary | null>(null);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Update elapsed time every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && activeSession) {
      interval = setInterval(() => {
        const startTime = new Date(activeSession.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, activeSession]);

  // Auto-refresh data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshSummary();
      checkActiveSession();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Initial load
  useEffect(() => {
    loadInitialData();
  }, [userId]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        checkActiveSession(),
        refreshSummary(),
        refreshSettings()
      ]);
    } catch (error) {
      console.error('Error loading initial time tracking data:', error);
    }
  };

  const checkActiveSession = useCallback(async () => {
    try {
      const session = await TimeTrackingService.getActiveSession(userId);
      if (session) {
        setActiveSession(session);
        setIsTracking(true);
        const startTime = new Date(session.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      } else {
        setActiveSession(null);
        setIsTracking(false);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  }, [userId]);

  const refreshSummary = useCallback(async () => {
    try {
      const summaryData = await TimeTrackingService.getTimeTrackingSummary(userId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error refreshing summary:', error);
    }
  }, [userId]);

  const refreshSettings = useCallback(async () => {
    try {
      const settingsData = await TimeTrackingService.getTimeTrackingSettings(userId);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  }, [userId]);

  const startTracking = useCallback(async (request: StartTimeTrackingRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await TimeTrackingService.startTracking(userId, request);
      setActiveSession(session);
      setIsTracking(true);
      setElapsedTime(0);
      await refreshSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start tracking';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshSummary]);

  const stopTracking = useCallback(async (request?: StopTimeTrackingRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      await TimeTrackingService.stopTracking(userId, request);
      setActiveSession(null);
      setIsTracking(false);
      setElapsedTime(0);
      await refreshSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop tracking';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshSummary]);

  const updateActivity = useCallback(async () => {
    try {
      await TimeTrackingService.updateActivity(userId);
    } catch (error) {
      console.error('Error updating activity:', error);
    }
  }, [userId]);

  const createTimeEntry = useCallback(async (request: CreateTimeEntryRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const entry = await TimeTrackingService.createTimeEntry(userId, request);
      await refreshSummary();
      return entry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create time entry';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshSummary]);

  const updateTimeEntry = useCallback(async (entryId: string, request: UpdateTimeEntryRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const entry = await TimeTrackingService.updateTimeEntry(userId, entryId, request);
      await refreshSummary();
      return entry;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update time entry';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshSummary]);

  const deleteTimeEntry = useCallback(async (entryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await TimeTrackingService.deleteTimeEntry(userId, entryId);
      await refreshSummary();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete time entry';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [userId, refreshSummary]);

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const formatHours = useCallback((hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  }, []);

  return {
    // State
    isTracking,
    activeSession,
    summary,
    settings,
    isLoading,
    error,
    elapsedTime,

    // Actions
    startTracking,
    stopTracking,
    updateActivity,
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    refreshSummary,
    refreshSettings,

    // Utilities
    formatTime,
    formatDuration,
    formatHours
  };
}
