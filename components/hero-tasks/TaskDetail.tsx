/**
 * Hero Tasks - Task Detail Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Play, 
  Pause,
  Edit,
  ArrowLeft,
  RefreshCw,
  MessageSquare,
  Paperclip,
  GitBranch,
  Activity
} from 'lucide-react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import {
  HeroTask,
  HeroSubtask,
  HeroAction,
  TaskStatus,
  TaskPriority,
  WorkflowPhase,
  TaskType,
  ApiResponse
} from '@/types/hero-tasks';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskDetailProps {
  taskId: string;
  onBack: () => void;
  className?: string;
}

const statusConfig = {
  [TaskStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  [TaskStatus.READY]: { color: 'bg-blue-100 text-blue-800', icon: Play },
  [TaskStatus.IN_PROGRESS]: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
  [TaskStatus.BLOCKED]: { color: 'bg-red-100 text-red-800', icon: Pause },
  [TaskStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  [TaskStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
};

const priorityConfig = {
  [TaskPriority.CRITICAL]: { color: 'bg-red-500', label: 'Critical' },
  [TaskPriority.HIGH]: { color: 'bg-orange-500', label: 'High' },
  [TaskPriority.MEDIUM]: { color: 'bg-yellow-500', label: 'Medium' },
  [TaskPriority.LOW]: { color: 'bg-green-500', label: 'Low' }
};

const phaseConfig = {
  [WorkflowPhase.AUDIT]: { color: 'bg-purple-100 text-purple-800', label: 'Audit' },
  [WorkflowPhase.DECIDE]: { color: 'bg-blue-100 text-blue-800', label: 'Decide' },
  [WorkflowPhase.APPLY]: { color: 'bg-green-100 text-green-800', label: 'Apply' },
  [WorkflowPhase.VERIFY]: { color: 'bg-yellow-100 text-yellow-800', label: 'Verify' }
};

export function TaskDetail({ taskId, onBack, className }: TaskDetailProps) {
  const [task, setTask] = useState<HeroTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/hero-tasks/${taskId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const result: ApiResponse<HeroTask> = await response.json();
      
      if (result.success && result.data) {
        setTask(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const refreshTask = async () => {
    setRefreshing(true);
    await fetchTask();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const handleUpdateTask = async (data: any) => {
    try {
      const response = await fetch(`/api/hero-tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      
      if (result.success) {
        setTask(result.data);
        setEditing(false);
      } else {
        throw new Error(result.error || 'Failed to update task');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleStatusChange = async (status: TaskStatus) => {
    try {
      const response = await fetch(`/api/hero-tasks/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const result = await response.json();
      
      if (result.success) {
        setTask(result.data);
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handlePhaseChange = async (phase: WorkflowPhase) => {
    try {
      const response = await fetch(`/api/hero-tasks/${taskId}/phase`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phase }),
      });

      if (!response.ok) {
        throw new Error('Failed to update phase');
      }

      const result = await response.json();
      
      if (result.success) {
        setTask(result.data);
      } else {
        throw new Error(result.error || 'Failed to update phase');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-500">Loading task...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <div className="flex gap-2">
            <Button onClick={refreshTask} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (editing) {
    return (
      <div className={className}>
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => setEditing(false)} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Task
          </Button>
        </div>
        <TaskForm
          task={task}
          onSubmit={handleUpdateTask}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  const StatusIcon = statusConfig[task.status].icon;
  const priorityInfo = priorityConfig[task.priority];
  const phaseInfo = phaseConfig[task.current_phase];

  const getProgressPercentage = () => {
    if (task.status === TaskStatus.COMPLETED) return 100;
    if (task.status === TaskStatus.DRAFT) return 0;
    
    const phaseOrder = [WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY];
    const currentPhaseIndex = phaseOrder.indexOf(task.current_phase);
    return ((currentPhaseIndex + 1) / phaseOrder.length) * 100;
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED;

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{task.task_number}: {task.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusConfig[task.status].color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={phaseInfo.color}>
                {phaseInfo.label}
              </Badge>
              <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`} title={priorityInfo.label} />
              {isOverdue && (
                <Badge variant="destructive">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshTask} variant="outline" disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Description */}
          {task.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline">{task.type.replace('_', ' ')}</Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Assignee:</span>
                    <span className="text-sm text-gray-600">
                      {task.assignee_id || 'Unassigned'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm text-gray-600">
                      {format(new Date(task.created_at), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {task.due_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Due Date:</span>
                      <span className={`text-sm ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {format(new Date(task.due_date), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  
                  {task.estimated_duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Estimated:</span>
                      <span className="text-sm text-gray-600">
                        {task.estimated_duration_hours} hours
                      </span>
                    </div>
                  )}
                  
                  {task.actual_duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Actual:</span>
                      <span className="text-sm text-gray-600">
                        {task.actual_duration_hours} hours
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {task.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Subtasks Tab */}
        <TabsContent value="subtasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subtasks</CardTitle>
            </CardHeader>
            <CardContent>
              {task.subtasks && task.subtasks.length > 0 ? (
                <div className="space-y-4">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{subtask.subtask_number}: {subtask.title}</h4>
                        <Badge className={statusConfig[subtask.status].color}>
                          {subtask.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {subtask.description && (
                        <p className="text-sm text-gray-600 mb-2">{subtask.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Priority: {subtask.priority}</span>
                        <span>Type: {subtask.type}</span>
                        {subtask.assignee_id && <span>Assignee: {subtask.assignee_id}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No subtasks yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Current Phase:</span>
                  <Badge className={phaseInfo.color}>{phaseInfo.label}</Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Workflow Progress</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <Progress value={getProgressPercentage()} className="h-2" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY].map((phase) => {
                    const phaseInfo = phaseConfig[phase];
                    const isActive = phase === task.current_phase;
                    const isCompleted = getProgressPercentage() > 0 && 
                      [WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY].indexOf(phase) < 
                      [WorkflowPhase.AUDIT, WorkflowPhase.DECIDE, WorkflowPhase.APPLY, WorkflowPhase.VERIFY].indexOf(task.current_phase);
                    
                    return (
                      <div key={phase} className={`text-center p-2 rounded ${isActive ? 'bg-blue-50 border-2 border-blue-200' : isCompleted ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="text-xs font-medium">{phaseInfo.label}</div>
                        <div className="text-xs text-gray-500">{phase}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
            </CardHeader>
            <CardContent>
              {task.workflow_history && task.workflow_history.length > 0 ? (
                <div className="space-y-3">
                  {task.workflow_history.map((entry, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {entry.from_status && entry.to_status ? 
                            `Status changed from ${entry.from_status} to ${entry.to_status}` :
                            entry.from_phase && entry.to_phase ?
                            `Phase changed from ${entry.from_phase} to ${entry.to_phase}` :
                            'Activity recorded'
                          }
                        </div>
                        {entry.reason && (
                          <div className="text-xs text-gray-500 mt-1">{entry.reason}</div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No activity history yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TaskDetail;
