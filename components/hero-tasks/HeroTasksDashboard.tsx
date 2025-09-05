/**
 * Hero Tasks - Main Dashboard Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { 
  Plus, 
  BarChart3, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  Users,
  TrendingUp
} from 'lucide-react';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskDetail } from './TaskDetail';
import {
  HeroTask,
  TaskAnalytics,
  CreateHeroTaskRequest,
  UpdateHeroTaskRequest,
  TaskStatus,
  TaskPriority,
  WorkflowPhase,
  TaskType,
  ApiResponse
} from '@/types/hero-tasks';

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface HeroTasksDashboardProps {
  className?: string;
}

export function HeroTasksDashboard({ className }: HeroTasksDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<TaskAnalytics | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await fetch('/api/hero-tasks?action=analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const result: ApiResponse<TaskAnalytics> = await response.json();
      
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleCreateTask = async (data: CreateHeroTaskRequest | UpdateHeroTaskRequest) => {
    try {
      const response = await fetch('/api/hero-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const result = await response.json();
      
      if (result.success) {
        setViewMode('list');
        // Refresh analytics
        fetchAnalytics();
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const handleTaskEdit = (taskId: string) => {
    setSelectedTaskId(taskId);
    setViewMode('edit');
  };

  const handleTaskView = (taskId: string) => {
    setSelectedTaskId(taskId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedTaskId(null);
  };

  React.useEffect(() => {
    fetchAnalytics();
  }, []);

  const renderAnalyticsCards = () => {
    if (!analytics) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tasks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{analytics.total_tasks}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round(analytics.completion_rate)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={analytics.completion_rate} className="mt-2" />
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{analytics.tasks_by_status.in_progress}</p>
              </div>
              <Play className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        {/* Blocked */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Blocked</p>
                <p className="text-2xl font-bold">{analytics.tasks_by_status.blocked}</p>
              </div>
              <Pause className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold">{analytics.overdue_tasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {/* Average Duration */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                <p className="text-2xl font-bold">{Math.round(analytics.average_duration_hours)}h</p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Critical Tasks */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold">{analytics.tasks_by_priority.critical}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        {/* High Priority */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold">{analytics.tasks_by_priority.high}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderStatusBreakdown = () => {
    if (!analytics) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tasks_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-medium">{String(count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phase Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.tasks_by_phase).map(([phase, count]) => (
                <div key={phase} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {phase}
                    </Badge>
                  </div>
                  <span className="font-medium">{String(count)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={className}>
      {viewMode === 'list' && (
        <div>
          {/* Analytics Overview */}
          {renderAnalyticsCards()}
          {renderStatusBreakdown()}
          
          {/* Task List */}
          <TaskList
            onTaskCreate={() => setViewMode('create')}
            onTaskEdit={handleTaskEdit}
            onTaskView={handleTaskView}
          />
        </div>
      )}

      {viewMode === 'create' && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToList} variant="outline">
              ← Back to Tasks
            </Button>
            <h1 className="text-2xl font-bold">Create New Task</h1>
          </div>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {viewMode === 'edit' && selectedTaskId && (
        <div>
          <div className="flex items-center gap-4 mb-6">
            <Button onClick={handleBackToList} variant="outline">
              ← Back to Tasks
            </Button>
            <h1 className="text-2xl font-bold">Edit Task</h1>
          </div>
          <TaskForm
            onSubmit={async (data) => {
              // Handle edit logic here
              handleBackToList();
            }}
            onCancel={handleBackToList}
          />
        </div>
      )}

      {viewMode === 'detail' && selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onBack={handleBackToList}
        />
      )}
    </div>
  );
}

export default HeroTasksDashboard;
