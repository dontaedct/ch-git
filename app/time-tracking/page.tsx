/**
 * Hero Tasks Time Tracking Page
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { TimeTrackingDashboard } from '@/components/time-tracking/TimeTrackingDashboard';
import { TimeTrackingWidget } from '@/components/time-tracking/TimeTrackingWidget';
import { useTimeTracking } from '@/hooks/useTimeTracking';

export default function TimeTrackingPage() {
  const user = useUser();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState<string>('');

  const {
    isTracking,
    activeSession,
    summary,
    isLoading,
    error,
    elapsedTime,
    formatTime
  } = useTimeTracking({
    userId: user?.id || '',
    autoRefresh: true,
    refreshInterval: 30000
  });

  // Mock task data - in real implementation, this would come from your task management system
  const mockTasks = [
    { id: 'task-1', title: 'Implement User Authentication' },
    { id: 'task-2', title: 'Create Dashboard UI' },
    { id: 'task-3', title: 'Add Time Tracking Features' },
    { id: 'task-4', title: 'Write Documentation' },
    { id: 'task-5', title: 'Performance Optimization' }
  ];

  useEffect(() => {
    if (activeSession) {
      setSelectedTaskId(activeSession.task_id);
      // In real implementation, fetch task title from your task management system
      setTaskTitle(mockTasks.find(task => task.id === activeSession.task_id)?.title || 'Unknown Task');
    }
  }, [activeSession]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access time tracking features.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Time Tracking</h1>
              {isTracking && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">
                    Tracking: {formatTime(elapsedTime)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {activeSession && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Active Task:</span> {taskTitle}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Task Selection and Quick Widget */}
          <div className="space-y-6">
            {/* Task Selection */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Task</h2>
              <div className="space-y-2">
                {mockTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setTaskTitle(task.title);
                    }}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedTaskId === task.id
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500">ID: {task.id}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Time Tracking Widget */}
            {selectedTaskId && (
              <TimeTrackingWidget
                taskId={selectedTaskId}
                taskTitle={taskTitle}
                userId={user.id}
              />
            )}
          </div>

          {/* Right Column - Dashboard */}
          <div className="lg:col-span-2">
            <TimeTrackingDashboard
              userId={user.id}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 mr-3">⚠️</div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <span className="text-sm text-blue-700">Loading time tracking data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Hero Tasks Time Tracking System - HT-004.2.4</p>
            <p className="mt-1">Track your productivity and optimize your workflow</p>
          </div>
        </div>
      </div>
    </div>
  );
}
