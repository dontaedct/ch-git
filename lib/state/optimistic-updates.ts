/**
 * @fileoverview HT-021.3.3: Optimistic Update Patterns Implementation
 * @module lib/state/optimistic-updates
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.3 - State Management Foundation
 * Focus: Optimistic update patterns for improved user experience
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (state consistency)
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppStore } from './zustand-store';
import type { HeroTask, DesignToken, Component } from './zustand-store';

// ============================================================================
// OPTIMISTIC UPDATE TYPES
// ============================================================================

export interface OptimisticAction<T = any> {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  optimisticData: T;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
}

export interface OptimisticState {
  actions: OptimisticAction[];
  pendingCount: number;
  errorCount: number;
}

export interface OptimisticUpdateConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKeys: any[][];
  optimisticUpdateFn: (variables: TVariables) => TData | Promise<TData>;
  rollbackFn?: (optimisticData: TData, error: Error) => void;
  onSuccess?: (data: TData, variables: TVariables, optimisticData: TData) => void;
  onError?: (error: Error, variables: TVariables, optimisticData: TData) => void;
}

// ============================================================================
// OPTIMISTIC ACTIONS STORE
// ============================================================================

interface OptimisticActionsState {
  actions: OptimisticAction[];
  addAction: (action: Omit<OptimisticAction, 'id' | 'timestamp' | 'status'>) => string;
  updateActionStatus: (id: string, status: OptimisticAction['status']) => void;
  removeAction: (id: string) => void;
  clearActions: () => void;
  getActionsByEntity: (entity: string) => OptimisticAction[];
  getPendingActions: () => OptimisticAction[];
  getErrorActions: () => OptimisticAction[];
}

// The optimistic actions are already defined in the zustand store

// ============================================================================
// CORE OPTIMISTIC UPDATE HOOK
// ============================================================================

export function useOptimisticUpdate<TData, TVariables>(
  config: OptimisticUpdateConfig<TData, TVariables>
) {
  const queryClient = useQueryClient();
  const addAction = useAppStore((state) => state.optimistic?.addAction);
  const updateActionStatus = useAppStore((state) => state.optimistic?.updateActionStatus);
  const removeAction = useAppStore((state) => state.optimistic?.removeAction);
  
  return useMutation({
    mutationFn: config.mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches for all related queries
      await Promise.all(
        config.queryKeys.map(queryKey => 
          queryClient.cancelQueries({ queryKey })
        )
      );
      
      // Create optimistic data
      const optimisticData = await Promise.resolve(config.optimisticUpdateFn(variables));
      
      // Add optimistic action
      const actionId = addAction?.({
        type: 'update', // This would be determined based on the operation
        entity: config.queryKeys[0]?.[0] as string || 'unknown',
        optimisticData,
      }) || `action_${Date.now()}`;
      
      // Snapshot previous values for all query keys
      const previousData = config.queryKeys.map(queryKey => ({
        queryKey,
        data: queryClient.getQueryData(queryKey),
      }));
      
      // Apply optimistic updates to all query keys
      config.queryKeys.forEach(queryKey => {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          if (Array.isArray(oldData)) {
            // Handle list updates
            return [...oldData, optimisticData];
          } else if (oldData && typeof oldData === 'object') {
            // Handle object updates
            return { ...oldData, ...optimisticData };
          } else {
            // Handle single item updates
            return optimisticData;
          }
        });
      });
      
      return { 
        previousData, 
        optimisticData, 
        actionId 
      };
    },
    onSuccess: (data, variables, context) => {
      if (context) {
        // Update action status
        updateActionStatus?.(context.actionId, 'success');
        
        // Update query cache with real data
        config.queryKeys.forEach(queryKey => {
          queryClient.setQueryData(queryKey, data);
        });
        
        // Call success callback
        config.onSuccess?.(data, variables, context.optimisticData);
        
        // Remove action after a delay
        setTimeout(() => {
          removeAction?.(context.actionId);
        }, 2000);
      }
    },
    onError: (error, variables, context) => {
      if (context) {
        // Update action status
        updateActionStatus?.(context.actionId, 'error');
        
        // Rollback optimistic updates
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
        
        // Call rollback function
        config.rollbackFn?.(context.optimisticData, error as Error);
        
        // Call error callback
        config.onError?.(error as Error, variables, context.optimisticData);
        
        // Keep error action for user feedback
      }
    },
  });
}

// ============================================================================
// OPTIMISTIC HERO TASK HOOKS
// ============================================================================

export function useOptimisticCreateHeroTask() {
  const addHeroTask = useAppStore((state) => state.addHeroTask);
  const removeHeroTask = useAppStore((state) => state.removeHeroTask);
  
  return useOptimisticUpdate({
    mutationFn: async (data: Omit<HeroTask, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/hero-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create hero task');
      return response.json();
    },
    queryKeys: [['heroTasks']],
    optimisticUpdateFn: (data) => {
      const optimisticTask: HeroTask = {
        ...data,
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to Zustand store immediately
      addHeroTask(optimisticTask);
      
      return optimisticTask;
    },
    rollbackFn: (optimisticData) => {
      // Remove from Zustand store on error
      removeHeroTask(optimisticData.id);
    },
    onSuccess: (realData, variables, optimisticData) => {
      // Replace optimistic data with real data
      removeHeroTask(optimisticData.id);
      addHeroTask(realData);
    },
  });
}

export function useOptimisticUpdateHeroTask() {
  const updateHeroTask = useAppStore((state) => state.updateHeroTask);
  
  return useOptimisticUpdate({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<HeroTask>) => {
      const response = await fetch(`/api/hero-tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update hero task');
      return response.json();
    },
    queryKeys: [['heroTasks'], ['heroTasks', 'detail']],
    optimisticUpdateFn: ({ id, ...updates }) => {
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      // Update Zustand store immediately
      updateHeroTask(id, optimisticUpdate);
      
      return { id, ...optimisticUpdate };
    },
    onSuccess: (realData) => {
      // Update with real data from server
      updateHeroTask(realData.id, realData);
    },
  });
}

export function useOptimisticDeleteHeroTask() {
  const removeHeroTask = useAppStore((state) => state.removeHeroTask);
  const addHeroTask = useAppStore((state) => state.addHeroTask);
  const heroTasks = useAppStore((state) => state.data.heroTasks);
  
  return useOptimisticUpdate({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/hero-tasks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete hero task');
      return { id };
    },
    queryKeys: [['heroTasks']],
    optimisticUpdateFn: (id) => {
      const taskToDelete = heroTasks.find(task => task.id === id);
      if (taskToDelete) {
        // Remove from Zustand store immediately
        removeHeroTask(id);
      }
      return { id, deletedTask: taskToDelete };
    },
    rollbackFn: (optimisticData: { id: string; deletedTask?: HeroTask }) => {
      // Restore task on error
      if (optimisticData.deletedTask) {
        addHeroTask(optimisticData.deletedTask);
      }
    },
  });
}

// ============================================================================
// OPTIMISTIC DESIGN TOKEN HOOKS
// ============================================================================

export function useOptimisticUpdateDesignToken() {
  const updateDesignToken = useAppStore((state) => state.updateDesignToken);
  
  return useOptimisticUpdate({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<DesignToken>) => {
      const response = await fetch(`/api/design-tokens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update design token');
      return response.json();
    },
    queryKeys: [['designTokens']],
    optimisticUpdateFn: ({ id, ...updates }) => {
      // Update Zustand store immediately
      updateDesignToken(id, updates);
      return { id, ...updates };
    },
    onSuccess: (realData) => {
      // Update with real data from server
      updateDesignToken(realData.id, realData);
    },
  });
}

// ============================================================================
// OPTIMISTIC COMPONENT HOOKS
// ============================================================================

export function useOptimisticUpdateComponent() {
  const updateComponent = useAppStore((state) => state.updateComponent);
  
  return useOptimisticUpdate({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Component>) => {
      const response = await fetch(`/api/components/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update component');
      return response.json();
    },
    queryKeys: [['components']],
    optimisticUpdateFn: ({ id, ...updates }) => {
      // Update Zustand store immediately
      updateComponent(id, updates);
      return { id, ...updates };
    },
    onSuccess: (realData) => {
      // Update with real data from server
      updateComponent(realData.id, realData);
    },
  });
}

// ============================================================================
// BATCH OPTIMISTIC UPDATES
// ============================================================================

export function useBatchOptimisticUpdate<TData, TVariables>() {
  const [batchedActions, setBatchedActions] = useState<Array<{
    config: OptimisticUpdateConfig<TData, TVariables>;
    variables: TVariables;
  }>>([]);
  
  const addToBatch = useCallback((
    config: OptimisticUpdateConfig<TData, TVariables>, 
    variables: TVariables
  ) => {
    setBatchedActions(prev => [...prev, { config, variables }]);
  }, []);
  
  const executeBatch = useCallback(async () => {
    if (batchedActions.length === 0) return;
    
    try {
      // Apply all optimistic updates first
      const optimisticResults = await Promise.all(
        batchedActions.map(({ config, variables }) => 
          Promise.resolve(config.optimisticUpdateFn(variables))
        )
      );
      
      // Then execute all mutations
      const realResults = await Promise.all(
        batchedActions.map(({ config, variables }) => 
          config.mutationFn(variables)
        )
      );
      
      // Handle success for each
      batchedActions.forEach(({ config, variables }, index) => {
        config.onSuccess?.(realResults[index], variables, optimisticResults[index]);
      });
      
    } catch (error) {
      // Handle batch error - could implement partial rollback
      console.error('Batch optimistic update failed:', error);
      
      // Rollback all optimistic updates
      batchedActions.forEach(({ config, variables }, index) => {
        const optimisticData = batchedActions[index];
        config.rollbackFn?.(optimisticData as any, error as Error);
      });
    } finally {
      setBatchedActions([]);
    }
  }, [batchedActions]);
  
  const clearBatch = useCallback(() => {
    setBatchedActions([]);
  }, []);
  
  return {
    addToBatch,
    executeBatch,
    clearBatch,
    batchSize: batchedActions.length,
    hasBatch: batchedActions.length > 0,
  };
}

// ============================================================================
// OPTIMISTIC UPDATE STATUS HOOK
// ============================================================================

export function useOptimisticStatus() {
  const actions = useAppStore((state) => state.optimistic?.actions || []);
  
  const pendingActions = actions.filter(action => action.status === 'pending');
  const errorActions = actions.filter(action => action.status === 'error');
  
  return {
    isPending: pendingActions.length > 0,
    hasErrors: errorActions.length > 0,
    pendingCount: pendingActions.length,
    errorCount: errorActions.length,
    totalActions: actions.length,
    pendingActions,
    errorActions,
  };
}

// ============================================================================
// OPTIMISTIC CONFLICT RESOLUTION
// ============================================================================

export function useConflictResolution() {
  const queryClient = useQueryClient();
  
  const resolveConflict = useCallback(async <T>(
    queryKey: any[],
    clientVersion: T,
    serverVersion: T,
    conflictResolver: (client: T, server: T) => T
  ) => {
    try {
      const resolvedData = conflictResolver(clientVersion, serverVersion);
      queryClient.setQueryData(queryKey, resolvedData);
      return resolvedData;
    } catch (error) {
      console.error('Conflict resolution failed:', error);
      // Fall back to server version
      queryClient.setQueryData(queryKey, serverVersion);
      return serverVersion;
    }
  }, [queryClient]);
  
  return { resolveConflict };
}

// ============================================================================
// OFFLINE OPTIMISTIC UPDATES
// ============================================================================

export function useOfflineOptimisticUpdate() {
  const [offlineQueue, setOfflineQueue] = useState<OptimisticAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const queueOfflineAction = useCallback((action: OptimisticAction) => {
    setOfflineQueue(prev => [...prev, action]);
    // Store in localStorage for persistence
    localStorage.setItem('offline_queue', JSON.stringify([...offlineQueue, action]));
  }, [offlineQueue]);
  
  const processOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;
    
    try {
      // Process queued actions when coming back online
      for (const action of offlineQueue) {
        // Implement action processing logic here
        console.log('Processing offline action:', action);
      }
      
      // Clear queue after successful processing
      setOfflineQueue([]);
      localStorage.removeItem('offline_queue');
    } catch (error) {
      console.error('Failed to process offline queue:', error);
    }
  }, [isOnline, offlineQueue]);
  
  // Auto-process queue when coming back online
  useEffect(() => {
    if (isOnline) {
      processOfflineQueue();
    }
  }, [isOnline, processOfflineQueue]);
  
  return {
    isOnline,
    offlineQueue,
    queueOfflineAction,
    processOfflineQueue,
  };
}

export default {
  useOptimisticUpdate,
  useOptimisticCreateHeroTask,
  useOptimisticUpdateHeroTask,
  useOptimisticDeleteHeroTask,
  useOptimisticUpdateDesignToken,
  useOptimisticUpdateComponent,
  useBatchOptimisticUpdate,
  useOptimisticStatus,
  useConflictResolution,
  useOfflineOptimisticUpdate,
};