/**
 * Hero Tasks - Bulk Operations Hook
 * Created: 2025-01-27T12:00:00.000Z
 * Version: 1.0.0
 */

'use client';

import { useState, useCallback, useMemo } from 'react';
import { HeroTask, TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

export interface BulkOperation {
  id: string;
  type: 'status' | 'priority' | 'assignee' | 'phase' | 'tags' | 'delete';
  label: string;
  description: string;
  icon: string;
  requiresConfirmation: boolean;
  destructive?: boolean;
}

export interface BulkOperationState {
  selectedTasks: Set<string>;
  isSelectMode: boolean;
  isProcessing: boolean;
  lastOperation?: {
    type: string;
    count: number;
    timestamp: string;
  };
}

export interface BulkOperationResult {
  success: boolean;
  updatedTasks: HeroTask[];
  failedTasks: string[];
  message: string;
}

export interface UseBulkOperationsOptions {
  tasks: HeroTask[];
  onTasksUpdate: (updatedTasks: HeroTask[]) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export function useBulkOperations({
  tasks,
  onTasksUpdate,
  onError,
  onSuccess
}: UseBulkOperationsOptions) {
  const [state, setState] = useState<BulkOperationState>({
    selectedTasks: new Set(),
    isSelectMode: false,
    isProcessing: false,
    lastOperation: undefined
  });

  // Available bulk operations
  const bulkOperations: BulkOperation[] = useMemo(() => [
    {
      id: 'status-ready',
      type: 'status',
      label: 'Mark as Ready',
      description: 'Set selected tasks to Ready status',
      icon: 'CheckCircle',
      requiresConfirmation: false
    },
    {
      id: 'status-in-progress',
      type: 'status',
      label: 'Start Progress',
      description: 'Set selected tasks to In Progress',
      icon: 'Play',
      requiresConfirmation: false
    },
    {
      id: 'status-completed',
      type: 'status',
      label: 'Mark Complete',
      description: 'Set selected tasks to Completed',
      icon: 'CheckCircle2',
      requiresConfirmation: false
    },
    {
      id: 'status-blocked',
      type: 'status',
      label: 'Mark Blocked',
      description: 'Set selected tasks to Blocked',
      icon: 'AlertCircle',
      requiresConfirmation: false
    },
    {
      id: 'priority-high',
      type: 'priority',
      label: 'Set High Priority',
      description: 'Set selected tasks to High priority',
      icon: 'ArrowUp',
      requiresConfirmation: false
    },
    {
      id: 'priority-medium',
      type: 'priority',
      label: 'Set Medium Priority',
      description: 'Set selected tasks to Medium priority',
      icon: 'Minus',
      requiresConfirmation: false
    },
    {
      id: 'priority-low',
      type: 'priority',
      label: 'Set Low Priority',
      description: 'Set selected tasks to Low priority',
      icon: 'ArrowDown',
      requiresConfirmation: false
    },
    {
      id: 'phase-audit',
      type: 'phase',
      label: 'Move to Audit',
      description: 'Set selected tasks to Audit phase',
      icon: 'Search',
      requiresConfirmation: false
    },
    {
      id: 'phase-decide',
      type: 'phase',
      label: 'Move to Decide',
      description: 'Set selected tasks to Decide phase',
      icon: 'Brain',
      requiresConfirmation: false
    },
    {
      id: 'phase-apply',
      type: 'phase',
      label: 'Move to Apply',
      description: 'Set selected tasks to Apply phase',
      icon: 'Wrench',
      requiresConfirmation: false
    },
    {
      id: 'phase-verify',
      type: 'phase',
      label: 'Move to Verify',
      description: 'Set selected tasks to Verify phase',
      icon: 'CheckSquare',
      requiresConfirmation: false
    },
    {
      id: 'delete',
      type: 'delete',
      label: 'Delete Tasks',
      description: 'Permanently delete selected tasks',
      icon: 'Trash2',
      requiresConfirmation: true,
      destructive: true
    }
  ], []);

  // Toggle select mode
  const toggleSelectMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSelectMode: !prev.isSelectMode,
      selectedTasks: new Set() // Clear selection when exiting select mode
    }));
  }, []);

  // Select/deselect individual task
  const toggleTaskSelection = useCallback((taskId: string) => {
    setState(prev => {
      const newSelectedTasks = new Set(prev.selectedTasks);
      if (newSelectedTasks.has(taskId)) {
        newSelectedTasks.delete(taskId);
      } else {
        newSelectedTasks.add(taskId);
      }
      return {
        ...prev,
        selectedTasks: newSelectedTasks
      };
    });
  }, []);

  // Select all visible tasks
  const selectAllTasks = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedTasks: new Set(tasks.map(task => task.id))
    }));
  }, [tasks]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedTasks: new Set()
    }));
  }, []);

  // Get selected tasks
  const selectedTasks = useMemo(() => {
    return tasks.filter(task => state.selectedTasks.has(task.id));
  }, [tasks, state.selectedTasks]);

  // Execute bulk operation
  const executeBulkOperation = useCallback(async (
    operation: BulkOperation,
    operationData?: any
  ): Promise<BulkOperationResult> => {
    if (state.selectedTasks.size === 0) {
      const error = 'No tasks selected';
      onError?.(error);
      return {
        success: false,
        updatedTasks: [],
        failedTasks: [],
        message: error
      };
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const selectedTaskIds = Array.from(state.selectedTasks);
      let updatedTasks: HeroTask[] = [];
      let failedTasks: string[] = [];

      switch (operation.type) {
        case 'status':
          const result = await bulkUpdateStatus(selectedTaskIds, operationData.status);
          updatedTasks = result.updatedTasks;
          failedTasks = result.failedTasks;
          break;

        case 'priority':
          const priorityResult = await bulkUpdatePriority(selectedTaskIds, operationData.priority);
          updatedTasks = priorityResult.updatedTasks;
          failedTasks = priorityResult.failedTasks;
          break;

        case 'phase':
          const phaseResult = await bulkUpdatePhase(selectedTaskIds, operationData.phase);
          updatedTasks = phaseResult.updatedTasks;
          failedTasks = phaseResult.failedTasks;
          break;

        case 'assignee':
          const assigneeResult = await bulkUpdateAssignee(selectedTaskIds, operationData.assigneeId);
          updatedTasks = assigneeResult.updatedTasks;
          failedTasks = assigneeResult.failedTasks;
          break;

        case 'tags':
          const tagsResult = await bulkUpdateTags(selectedTaskIds, operationData.tags, operationData.action);
          updatedTasks = tagsResult.updatedTasks;
          failedTasks = tagsResult.failedTasks;
          break;

        case 'delete':
          const deleteResult = await bulkDeleteTasks(selectedTaskIds);
          updatedTasks = deleteResult.updatedTasks;
          failedTasks = deleteResult.failedTasks;
          break;

        default:
          throw new Error(`Unknown operation type: ${operation.type}`);
      }

      // Update local state
      const updatedTasksMap = new Map(updatedTasks.map(task => [task.id, task]));
      const newTasks = tasks.map(task => updatedTasksMap.get(task.id) || task);
      
      // Remove deleted tasks
      const finalTasks = operation.type === 'delete' 
        ? newTasks.filter(task => !state.selectedTasks.has(task.id))
        : newTasks;

      onTasksUpdate(finalTasks);

      // Clear selection
      setState(prev => ({
        ...prev,
        selectedTasks: new Set(),
        isProcessing: false,
        lastOperation: {
          type: operation.label,
          count: updatedTasks.length,
          timestamp: new Date().toISOString()
        }
      }));

      const message = `${operation.label} applied to ${updatedTasks.length} task${updatedTasks.length !== 1 ? 's' : ''}`;
      onSuccess?.(message);

      return {
        success: true,
        updatedTasks,
        failedTasks,
        message
      };

    } catch (error) {
      setState(prev => ({ ...prev, isProcessing: false }));
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onError?.(errorMessage);
      
      return {
        success: false,
        updatedTasks: [],
        failedTasks: Array.from(state.selectedTasks),
        message: errorMessage
      };
    }
  }, [state.selectedTasks, tasks, onTasksUpdate, onError, onSuccess]);

  // Bulk update status
  const bulkUpdateStatus = async (taskIds: string[], status: TaskStatus) => {
    const response = await fetch('/api/hero-tasks/bulk/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        status,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task statuses');
    }

    const result = await response.json();
    return result.data;
  };

  // Bulk update priority
  const bulkUpdatePriority = async (taskIds: string[], priority: TaskPriority) => {
    const response = await fetch('/api/hero-tasks/bulk/priority', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        priority,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task priorities');
    }

    const result = await response.json();
    return result.data;
  };

  // Bulk update phase
  const bulkUpdatePhase = async (taskIds: string[], phase: WorkflowPhase) => {
    const response = await fetch('/api/hero-tasks/bulk/phase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        phase,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task phases');
    }

    const result = await response.json();
    return result.data;
  };

  // Bulk update assignee
  const bulkUpdateAssignee = async (taskIds: string[], assigneeId: string) => {
    const response = await fetch('/api/hero-tasks/bulk/assignee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        assignee_id: assigneeId,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task assignees');
    }

    const result = await response.json();
    return result.data;
  };

  // Bulk update tags
  const bulkUpdateTags = async (taskIds: string[], tags: string[], action: 'add' | 'remove' | 'replace') => {
    const response = await fetch('/api/hero-tasks/bulk/tags', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        tags,
        action,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task tags');
    }

    const result = await response.json();
    return result.data;
  };

  // Bulk delete tasks
  const bulkDeleteTasks = async (taskIds: string[]) => {
    const response = await fetch('/api/hero-tasks/bulk/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_ids: taskIds,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete tasks');
    }

    const result = await response.json();
    return result.data;
  };

  return {
    // State
    selectedTasks,
    isSelectMode: state.isSelectMode,
    isProcessing: state.isProcessing,
    lastOperation: state.lastOperation,
    selectedCount: state.selectedTasks.size,
    totalCount: tasks.length,

    // Operations
    bulkOperations,

    // Actions
    toggleSelectMode,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    executeBulkOperation,

    // Helpers
    isTaskSelected: (taskId: string) => state.selectedTasks.has(taskId),
    hasSelection: state.selectedTasks.size > 0,
    isAllSelected: state.selectedTasks.size === tasks.length && tasks.length > 0
  };
}

export default useBulkOperations;
