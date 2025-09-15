/**
 * Hero Tasks Time Tracking Dashboard
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  BarChart3, 
  Calendar, 
  Target,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';
import { 
  TimeTrackingSummary, 
  TimeTrackingAnalytics, 
  TimeEntry,
  TimeTrackingSettings 
} from '@/types/hero-tasks';
import { TimeTrackingService } from '@/lib/time-tracking/service';

interface TimeTrackingDashboardProps {
  userId: string;
  className?: string;
}

export function TimeTrackingDashboard({ userId, className = '' }: TimeTrackingDashboardProps) {
  const [summary, setSummary] = useState<TimeTrackingSummary | null>(null);
  const [analytics, setAnalytics] = useState<TimeTrackingAnalytics | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [settings, setSettings] = useState<TimeTrackingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'entries' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [summaryData, settingsData, entriesData] = await Promise.all([
        TimeTrackingService.getTimeTrackingSummary(userId),
        TimeTrackingService.getTimeTrackingSettings(userId),
        TimeTrackingService.getTimeEntries(userId, { limit: 10 })
      ]);

      setSummary(summaryData);
      setSettings(settingsData);
      setRecentEntries(entriesData);

      // Load analytics for the last 30 days
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const analyticsData = await TimeTrackingService.getTimeTrackingAnalytics(
        userId,
        startDate,
        endDate
      );
      setAnalytics(analyticsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProductivityBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadDashboardData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Time Tracking Dashboard</h2>
          </div>
          <div className="flex items-center space-x-2">
            {summary?.active_session && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Tracking Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'entries', label: 'Recent Entries', icon: Calendar },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && summary && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Time</p>
                    <p className="text-2xl font-bold text-blue-900">{formatTime(summary.total_hours)}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Sessions</p>
                    <p className="text-2xl font-bold text-green-900">{summary.total_entries}</p>
                  </div>
                  <Play className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Tasks Tracked</p>
                    <p className="text-2xl font-bold text-purple-900">{summary.tasks_tracked}</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Avg Session</p>
                    <p className="text-2xl font-bold text-orange-900">{formatTime(summary.average_session_hours)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Goal Progress */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Daily Goal</span>
                    <span>{Math.round(summary.daily_goal_progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(summary.daily_goal_progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Weekly Goal</span>
                    <span>{Math.round(summary.weekly_goal_progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(summary.weekly_goal_progress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Session */}
            {summary.active_session && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-green-900">Active Session</p>
                      <p className="text-sm text-green-700">Task ID: {summary.active_session.task_id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-900">
                      {formatTime((Date.now() - new Date(summary.active_session.start_time).getTime()) / (1000 * 60 * 60))}
                    </p>
                    <p className="text-sm text-green-700">Elapsed</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            {/* Productivity Score */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Score</h3>
              <div className="flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full ${getProductivityBgColor(analytics.productivity_score)} flex items-center justify-center`}>
                  <span className={`text-2xl font-bold ${getProductivityColor(analytics.productivity_score)}`}>
                    {analytics.productivity_score}
                  </span>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-2">
                Based on consistency, session quality, and goal completion
              </p>
            </div>

            {/* Top Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tasks by Time</h3>
              <div className="space-y-3">
                {analytics.top_tasks.slice(0, 5).map((task, index) => (
                  <div key={task.task_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{task.task_title}</p>
                        <p className="text-sm text-gray-500">{task.entries_count} sessions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatTime(task.total_hours)}</p>
                      <p className="text-sm text-gray-500">avg {formatTime(task.average_session_hours)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Distribution */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">By Day of Week</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.time_distribution.by_day_of_week)
                      .sort(([,a], [,b]) => b - a)
                      .map(([day, hours]) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{day}</span>
                          <span className="text-sm font-medium text-gray-900">{formatTime(hours)}</span>
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">By Hour of Day</h4>
                  <div className="space-y-2">
                    {Object.entries(analytics.time_distribution.by_hour_of_day)
                      .sort(([,a], [,b]) => b - a)
                      .slice(0, 5)
                      .map(([hour, hours]) => (
                        <div key={hour} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{hour}:00</span>
                          <span className="text-sm font-medium text-gray-900">{formatTime(hours)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'entries' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Time Entries</h3>
            <div className="space-y-3">
              {recentEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No time entries yet</p>
                  <p className="text-sm">Start tracking time to see your entries here</p>
                </div>
              ) : (
                recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{entry.description || 'Time Entry'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(entry.start_time).toLocaleDateString()} • 
                          {new Date(entry.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatDuration(entry.duration_minutes)}</p>
                      <p className="text-sm text-gray-500">
                        {entry.is_manual ? 'Manual' : 'Auto'}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking Settings</h3>
            {settings ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Daily Goal (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="24"
                      defaultValue={settings.daily_goal_hours}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Goal (hours)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="168"
                      defaultValue={settings.weekly_goal_hours}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idle Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="60"
                      defaultValue={settings.idle_timeout_minutes}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break Reminder (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      max="180"
                      defaultValue={settings.break_reminder_minutes}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-tracking"
                    defaultChecked={settings.auto_tracking_enabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="auto-tracking" className="ml-2 block text-sm text-gray-700">
                    Enable automatic time tracking
                  </label>
                </div>
                
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Save Settings
                </button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No settings found</p>
                <p className="text-sm">Settings will be created when you first use time tracking</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
