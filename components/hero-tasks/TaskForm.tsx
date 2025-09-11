/**
 * Hero Tasks - Task Form Component
 * Created: 2025-09-05T02:16:09.652Z
 * Version: 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Textarea } from '@ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Label } from '@ui/label';
import { Badge } from '@ui/badge';
import { X, Plus, Save, Loader2 } from 'lucide-react';
import { useKeyboardShortcuts, HeroTasksShortcuts, createPlatformShortcut } from '@/hooks/useKeyboardShortcuts';
import { TypingIndicator } from './TypingIndicator';
import { useLiveCollaboration } from '@/hooks/useLiveCollaboration';
import {
  CreateHeroTaskRequest,
  TaskPriority,
  TaskType,
  HeroTask,
  UpdateHeroTaskRequest
} from '@/types/hero-tasks';

interface TaskFormProps {
  task?: HeroTask;
  onSubmit: (data: CreateHeroTaskRequest | UpdateHeroTaskRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
  taskId?: string; // For live collaboration
}

export function TaskForm({
  task,
  onSubmit,
  onCancel,
  loading = false,
  className,
  taskId
}: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || TaskPriority.MEDIUM,
    type: task?.type || TaskType.FEATURE,
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
    estimated_duration_hours: task?.estimated_duration_hours || '',
    tags: task?.tags || [],
    metadata: task?.metadata || {}
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live collaboration for editing
  const { typingUsers, sendTypingIndicator } = useLiveCollaboration({
    userId: 'current-user', // TODO: Get from auth context
    enabled: !!taskId, // Only enable for existing tasks
    taskId: taskId || undefined
  });

  // Handle typing indicators
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Send typing indicator for text fields
    if (taskId && (field === 'title' || field === 'description')) {
      sendTypingIndicator(taskId, true);
    }
  };

  const isEditing = !!task;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.title.length > 500) {
      newErrors.title = 'Title must be 500 characters or less';
    }

    if (formData.estimated_duration_hours && isNaN(Number(formData.estimated_duration_hours))) {
      newErrors.estimated_duration_hours = 'Duration must be a valid number';
    }

    if (formData.tags.length > 20) {
      newErrors.tags = 'Maximum 20 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      type: formData.type,
      assignee_id: formData.assignee_id || undefined,
      due_date: formData.due_date || undefined,
      estimated_duration_hours: formData.estimated_duration_hours ? Number(formData.estimated_duration_hours) : undefined,
      tags: formData.tags,
      metadata: formData.metadata
    };

    await onSubmit(submitData);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 20) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Keyboard shortcuts for form
  const formShortcuts = [
    createPlatformShortcut('s', 'Save task', async () => {
      if (!loading) {
        await handleSubmit(new Event('submit') as any);
      }
    }),
    
    {
      key: 'Escape',
      description: 'Cancel and close form',
      action: onCancel,
      preventDefault: true
    }
  ];

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: formShortcuts,
    enabled: true
  });

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg">
          {isEditing ? `Edit Task ${task.task_number}` : 'Create New Task'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title..."
              className={`touch-manipulation ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-xs sm:text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="touch-manipulation resize-none"
            />
          </div>

          {/* Priority and Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-sm font-medium">Priority *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TaskPriority }))}
              >
                <SelectTrigger className="touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.CRITICAL}>Critical</SelectItem>
                  <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                  <SelectItem value={TaskPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as TaskType }))}
              >
                <SelectTrigger className="touch-manipulation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskType.FEATURE}>Feature</SelectItem>
                  <SelectItem value={TaskType.BUG_FIX}>Bug Fix</SelectItem>
                  <SelectItem value={TaskType.REFACTOR}>Refactor</SelectItem>
                  <SelectItem value={TaskType.DOCUMENTATION}>Documentation</SelectItem>
                  <SelectItem value={TaskType.TEST}>Test</SelectItem>
                  <SelectItem value={TaskType.SECURITY}>Security</SelectItem>
                  <SelectItem value={TaskType.PERFORMANCE}>Performance</SelectItem>
                  <SelectItem value={TaskType.INTEGRATION}>Integration</SelectItem>
                  <SelectItem value={TaskType.MIGRATION}>Migration</SelectItem>
                  <SelectItem value={TaskType.MAINTENANCE}>Maintenance</SelectItem>
                  <SelectItem value={TaskType.RESEARCH}>Research</SelectItem>
                  <SelectItem value={TaskType.PLANNING}>Planning</SelectItem>
                  <SelectItem value={TaskType.REVIEW}>Review</SelectItem>
                  <SelectItem value={TaskType.DEPLOYMENT}>Deployment</SelectItem>
                  <SelectItem value={TaskType.MONITORING}>Monitoring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee" className="text-sm font-medium">Assignee</Label>
              <Input
                id="assignee"
                value={formData.assignee_id}
                onChange={(e) => setFormData(prev => ({ ...prev, assignee_id: e.target.value }))}
                placeholder="User ID or email..."
                className="touch-manipulation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-sm font-medium">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="touch-manipulation"
              />
            </div>
          </div>

          {/* Estimated Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">Estimated Duration (hours)</Label>
            <Input
              id="duration"
              type="number"
              min="0"
              step="0.5"
              value={formData.estimated_duration_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimated_duration_hours: e.target.value }))}
              placeholder="Enter estimated hours..."
              className={`touch-manipulation ${errors.estimated_duration_hours ? 'border-red-500' : ''}`}
            />
            {errors.estimated_duration_hours && (
              <p className="text-xs sm:text-sm text-red-500">{errors.estimated_duration_hours}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                maxLength={50}
                className="touch-manipulation"
              />
              <Button type="button" onClick={addTag} variant="outline" className="touch-manipulation">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-red-500 touch-manipulation"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            {errors.tags && (
              <p className="text-xs sm:text-sm text-red-500">{errors.tags}</p>
            )}
          </div>

          {/* Typing Indicator */}
          {taskId && typingUsers.length > 0 && (
            <div className="pt-2">
              <TypingIndicator 
                typingUsers={typingUsers}
                currentUserId="current-user"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={loading} className="touch-manipulation">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </span>
                  <span className="sm:hidden">
                    {isEditing ? 'Updating' : 'Creating'}
                  </span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {isEditing ? 'Update Task' : 'Create Task'}
                  </span>
                  <span className="sm:hidden">
                    {isEditing ? 'Update' : 'Create'}
                  </span>
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="touch-manipulation">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default TaskForm;
