/**
 * Hero Tasks - Task Card Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Progress } from '@ui/progress';
import { Calendar, Clock, User, Tag, AlertCircle, CheckCircle, Play, Pause } from 'lucide-react';
import {
  HeroTask,
  TaskStatus,
  TaskPriority,
  WorkflowPhase,
  TaskType
} from '@/types/hero-tasks';
import { formatDistanceToNow, format } from 'date-fns';

interface TaskCardProps {
  task: HeroTask;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onPhaseChange?: (taskId: string, phase: WorkflowPhase) => void;
  onEdit?: (taskId: string) => void;
  onView?: (taskId: string) => void;
  className?: string;
}

const statusConfig = {
  [TaskStatus.DRAFT]: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  [TaskStatus.READY]: { color: 'bg-blue-100 text-blue-800', icon: Play },
  [TaskStatus.IN_PROGRESS]: { color: 'bg-yellow-100 text-yellow-800', icon: Play },
  [TaskStatus.BLOCKED]: { color: 'bg-red-100 text-red-800', icon: Pause },
  [TaskStatus.COMPLETED]: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  [TaskStatus.CANCELLED]: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  [TaskStatus.PENDING]: { color: 'bg-orange-100 text-orange-800', icon: Clock }
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

export function TaskCard({
  task,
  onStatusChange,
  onPhaseChange,
  onEdit,
  onView,
  className
}: TaskCardProps) {
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
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {task.task_number}: {task.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={statusConfig[task.status].color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={phaseInfo.color}>
                {phaseInfo.label}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${priorityInfo.color}`} title={priorityInfo.label} />
            {isOverdue && (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="space-y-3">
          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(getProgressPercentage())}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            {task.assignee_id && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">Assigned</span>
              </div>
            )}
            
            {task.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                  {format(new Date(task.due_date), 'MMM dd')}
                </span>
              </div>
            )}
            
            {task.estimated_duration_hours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{task.estimated_duration_hours}h</span>
              </div>
            )}
            
            {task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{task.tags.length} tags</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{task.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="text-xs text-gray-500">
              {task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(task.id)}
              className="flex-1"
            >
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(task.id)}
            >
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCard;
