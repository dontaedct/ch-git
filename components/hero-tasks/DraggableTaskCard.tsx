/**
 * Hero Tasks - Draggable Task Card Component
 * Created: 2025-01-27T10:30:00.000Z
 * Version: 1.0.0
 */

'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Eye, Calendar, Clock, User, Tag } from 'lucide-react';
import { HeroTask, TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';

interface DraggableTaskCardProps {
  task: HeroTask;
  index: number;
  onEdit?: (taskId: string) => void;
  onView?: (taskId: string) => void;
  dragAndDrop: ReturnType<typeof useDragAndDrop<HeroTask>>;
  className?: string;
}

export function DraggableTaskCard({
  task,
  index,
  onEdit,
  onView,
  dragAndDrop,
  className
}: DraggableTaskCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { registerItem, getDragProps, getDropZoneProps } = dragAndDrop;

  // Register this card with the drag and drop system
  useEffect(() => {
    if (cardRef.current) {
      registerItem(task.id, cardRef.current);
    }
  }, [task.id, registerItem]);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800 border-green-200';
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case TaskStatus.BLOCKED:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskStatus.READY:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case TaskStatus.CANCELLED:
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200';
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPhaseColor = (phase: WorkflowPhase) => {
    switch (phase) {
      case WorkflowPhase.AUDIT:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case WorkflowPhase.DECIDE:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case WorkflowPhase.APPLY:
        return 'bg-green-100 text-green-800 border-green-200';
      case WorkflowPhase.VERIFY:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return null;
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const dragProps = getDragProps(task.id);
  const dropZoneProps = getDropZoneProps(task.id);

  // Destructure to avoid animate property conflicts
  const { animate: dragAnimate, ...restDragProps } = dragProps;
  const { animate: dropAnimate } = dropZoneProps;

  // Merge animate properties to avoid conflicts, ensuring proper motion values
  const mergedAnimateProps = (dragAnimate || dropAnimate) ? {
    ...(typeof dragAnimate === 'object' ? dragAnimate : {}),
    ...(typeof dropAnimate === 'object' ? dropAnimate : {})
  } as any : undefined;

  return (
    <motion.div
      ref={cardRef}
      className={`group ${className}`}
      {...(restDragProps as any)}
      animate={mergedAnimateProps}
      layout
      transition={{
        duration: 0.2,
        ease: 'easeOut'
      }}
    >
      <Card className="h-full transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-tight mb-2 line-clamp-2">
                {task.title}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={`text-xs ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={`text-xs ${getPhaseColor(task.current_phase)}`}>
                  {task.current_phase}
                </Badge>
              </div>
            </div>
            
            {/* Drag Handle */}
            <motion.div
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </motion.div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Description */}
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Task Number */}
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary" className="text-xs font-mono">
              {task.task_number}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {task.type.replace('_', ' ')}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="space-y-2 mb-4">
            {task.due_date && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Due: {formatDate(task.due_date)}</span>
              </div>
            )}
            
            {task.estimated_duration_hours && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Est: {formatDuration(task.estimated_duration_hours)}</span>
              </div>
            )}

            {task.assignee_id && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>Assigned</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex items-center gap-1 mb-4">
              <Tag className="w-3 h-3 text-gray-400" />
              <div className="flex flex-wrap gap-1">
                {task.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit?.(task.id)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView?.(task.id)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default DraggableTaskCard;
