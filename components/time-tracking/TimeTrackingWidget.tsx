/**
 * Hero Tasks Time Tracking Widget
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, Square, Clock, Settings, BarChart3 } from 'lucide-react';
import { TimeTrackingSession, TimeTrackingSummary } from '@/types/hero-tasks';
import { TimeTrackingService } from '@/lib/time-tracking/service';

interface TimeTrackingWidgetProps {
  taskId: string;
  taskTitle: string;
  userId: string;
  className?: string;
}

export function TimeTrackingWidget({ 
  taskId, 
  taskTitle, 
  userId, 
  className = '' 
}: TimeTrackingWidgetProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [activeSession, setActiveSession] = useState<TimeTrackingSession | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [summary, setSummary] = useState<TimeTrackingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update elapsed time every second
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

  // Check for active session on mount
  useEffect(() => {
    checkActiveSession();
    loadSummary();
  }, [userId, taskId]);

  // Update activity every 30 seconds when tracking
  useEffect(() => {
    let activityInterval: NodeJS.Timeout;
    
    if (isTracking) {
      activityInterval = setInterval(() => {
        TimeTrackingService.updateActivity(userId);
      }, 30000);
    }

    return () => {
      if (activityInterval) clearInterval(activityInterval);
    };
  }, [isTracking, userId]);

  const checkActiveSession = useCallback(async () => {
    try {
      const session = await TimeTrackingService.getActiveSession(userId);
      if (session && session.task_id === taskId) {
        setActiveSession(session);
        setIsTracking(true);
        const startTime = new Date(session.start_time).getTime();
        const now = Date.now();
        setElapsedTime(Math.floor((now - startTime) / 1000));
      }
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  }, [userId, taskId]);

  const loadSummary = useCallback(async () => {
    try {
      const summaryData = await TimeTrackingService.getTimeTrackingSummary(userId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }, [userId]);

  const startTracking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await TimeTrackingService.startTracking(userId, {
        task_id: taskId,
        description: `Working on: ${taskTitle}`
      });

      setActiveSession(session);
      setIsTracking(true);
      setElapsedTime(0);
      await loadSummary();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start tracking');
    } finally {
      setIsLoading(false);
    }
  };

  const stopTracking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await TimeTrackingService.stopTracking(userId, {
        description: `Completed work on: ${taskTitle}`
      });

      setActiveSession(null);
      setIsTracking(false);
      setElapsedTime(0);
      await loadSummary();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to stop tracking');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHours = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Time Tracking</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {/* TODO: Open settings */}}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => {/* TODO: Open analytics */}}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Analytics"
          >
            <BarChart3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Current Session */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Current Session</span>
          {isTracking && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-mono font-bold text-gray-900">
              {formatTime(elapsedTime)}
            </div>
            {isTracking && (
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="h-4 w-4" />
                <span>Start</span>
              </button>
            ) : (
              <button
                onClick={stopTracking}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Square className="h-4 w-4" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {formatHours(summary.total_hours)}
              </div>
              <div className="text-xs text-gray-500">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {summary.total_entries}
              </div>
              <div className="text-xs text-gray-500">Sessions</div>
            </div>
          </div>
          
          {/* Goal Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Daily Goal</span>
              <span>{Math.round(summary.daily_goal_progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(summary.daily_goal_progress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Task Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="font-medium text-gray-900">{taskTitle}</div>
          <div className="text-xs text-gray-500 mt-1">Task ID: {taskId}</div>
        </div>
      </div>
    </div>
  );
}
