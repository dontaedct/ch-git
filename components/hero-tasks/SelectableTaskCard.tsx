/**
 * Hero Tasks - Enhanced Task Card with Multi-Select Support
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, User, Tag, Edit, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeroTask, TaskStatus, TaskPriority, WorkflowPhase } from '@/types/hero-tasks';

interface SelectableTaskCardProps {
  task: HeroTask;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelection: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  onView?: (taskId: string) => void;
  className?: string;
}

export function SelectableTaskCard({
  task,
  isSelected,
  isSelectMode,
  onToggleSelection,
  onEdit,
  onView,
  className
}: SelectableTaskCardProps) {
  const handleCardClick = () => {
    if (isSelectMode) {
      onToggleSelection(task.id);
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    onToggleSelection(task.id);
  };

  const getStatusColor = (status: TaskStatus) => {
    const colors: Record<TaskStatus, string> = {
      [TaskStatus.DRAFT]: 'bg-gray-100 text-gray-800',
      [TaskStatus.READY]: 'bg-blue-100 text-blue-800',
      [TaskStatus.IN_PROGRESS]: 'bg-yellow-100 text-yellow-800',
      [TaskStatus.BLOCKED]: 'bg-red-100 text-red-800',
      [TaskStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [TaskStatus.CANCELLED]: 'bg-gray-100 text-gray-600',
      [TaskStatus.PENDING]: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: TaskPriority) => {
    const colors: Record<TaskPriority, string> = {
      [TaskPriority.CRITICAL]: 'bg-red-100 text-red-800',
      [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800',
      [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [TaskPriority.LOW]: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: WorkflowPhase) => {
    const colors: Record<WorkflowPhase, string> = {
      [WorkflowPhase.AUDIT]: 'bg-blue-100 text-blue-800',
      [WorkflowPhase.DECIDE]: 'bg-purple-100 text-purple-800',
      [WorkflowPhase.APPLY]: 'bg-green-100 text-green-800',
      [WorkflowPhase.VERIFY]: 'bg-orange-100 text-orange-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString();
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return null;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  return (
    <Card 
      className={`transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50' : ''
      } ${isSelectMode ? 'cursor-pointer' : ''} ${className}`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {/* Selection Checkbox */}
            {isSelectMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={handleCheckboxChange}
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
                {task.task_number}: {task.title}
              </CardTitle>
              
              {/* Status and Priority Badges */}
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(task.status)}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge className={getPhaseColor(task.current_phase)}>
                  {task.current_phase}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          {!isSelectMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView?.(task.id)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit?.(task.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Description */}
        {task.description && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {task.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Assignee */}
          {task.assignee_id && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Assigned to: {task.assignee_id}</span>
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Due: {formatDate(task.due_date)}</span>
            </div>
          )}

          {/* Duration */}
          {(task.estimated_duration_hours || task.actual_duration_hours) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>
                {task.actual_duration_hours ? (
                  <>Actual: {formatDuration(task.actual_duration_hours)}</>
                ) : (
                  <>Est: {formatDuration(task.estimated_duration_hours)}</>
                )}
              </span>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Tag className="w-4 h-4" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.tags.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Subtasks Count */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{task.subtasks.length} subtask{task.subtasks.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs">
                  {task.subtasks.filter(st => st.status === TaskStatus.COMPLETED).length} completed
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SelectableTaskCard;
