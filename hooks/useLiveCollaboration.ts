/**
 * Enhanced WebSocket Hook for Live Collaboration Features
 * 
 * Extends the base WebSocket hook with typing indicators,
 * presence management, and conflict resolution capabilities.
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useWebSocket, WebSocketMessage, ConnectedUser } from '@/hooks/useWebSocket';
import { PresenceUser } from '../components/hero-tasks/PresenceIndicator';

export interface TypingUser {
  userId: string;
  name: string;
  taskId: string;
}

export interface ConflictData {
  field: string;
  localValue: any;
  remoteValue: any;
  localTimestamp: Date;
  remoteTimestamp: Date;
  localUserId: string;
  remoteUserId: string;
}

export interface UseLiveCollaborationOptions {
  userId: string;
  token?: string;
  enabled?: boolean;
  onTaskUpdate?: (message: WebSocketMessage) => void;
  onPresenceUpdate?: (message: WebSocketMessage) => void;
  onConnectionChange?: (connected: boolean) => void;
  onConflict?: (conflicts: ConflictData[]) => void;
  typingTimeout?: number; // ms before stopping typing indicator
}

export interface UseLiveCollaborationReturn {
  // WebSocket connection state
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connectedUsers: ConnectedUser[];
  currentTaskUsers: string[];
  
  // Presence indicators
  presenceUsers: PresenceUser[];
  typingUsers: TypingUser[];
  
  // Conflict resolution
  conflicts: ConflictData[];
  hasConflicts: boolean;
  
  // Actions
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
  sendTypingIndicator: (taskId: string, isTyping: boolean) => void;
  resolveConflicts: (resolutions: any[]) => void;
  dismissConflicts: () => void;
  reconnect: () => void;
  
  // Optimistic updates
  updateTaskOptimistically: (taskId: string, updates: any) => Promise<void>;
}

export function useLiveCollaboration(options: UseLiveCollaborationOptions): UseLiveCollaborationReturn {
  const {
    userId,
    token,
    enabled = true,
    onTaskUpdate,
    onPresenceUpdate,
    onConnectionChange,
    onConflict,
    typingTimeout = 2000
  } = options;

  // Enhanced state for collaboration features
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  
  // Refs for managing typing indicators
  const typingTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const optimisticUpdates = useRef<Map<string, any>>(new Map());

  // Base WebSocket hook
  const wsHook = useWebSocket({
    userId,
    token,
    enabled,
    onTaskUpdate: (message) => {
      // Handle conflicts for task updates
      if (message.type === 'task_updated' && message.data.conflicts) {
        const conflictData: ConflictData[] = message.data.conflicts.map((conflict: any) => ({
          field: conflict.field,
          localValue: conflict.localValue,
          remoteValue: conflict.remoteValue,
          localTimestamp: new Date(conflict.localTimestamp),
          remoteTimestamp: new Date(conflict.remoteTimestamp),
          localUserId: conflict.localUserId,
          remoteUserId: conflict.remoteUserId
        }));
        
        setConflicts(conflictData);
        onConflict?.(conflictData);
      }
      
      onTaskUpdate?.(message);
    },
    onPresenceUpdate: (message) => {
      // Update presence users based on message type
      if (message.type === 'user_joined' || message.type === 'user_left') {
        setPresenceUsers(prev => {
          if (message.type === 'user_joined') {
            const existingIndex = prev.findIndex(u => u.userId === message.userId);
            const newUser: PresenceUser = {
              userId: message.userId!,
              name: message.data.name,
              avatar: message.data.avatar,
              status: 'viewing',
              lastSeen: new Date(),
              currentTaskId: message.data.taskId
            };
            
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = { ...updated[existingIndex], lastSeen: new Date() };
              return updated;
            } else {
              return [...prev, newUser];
            }
          } else {
            return prev.filter(u => u.userId !== message.userId);
          }
        });
      }
      
      onPresenceUpdate?.(message);
    },
    onConnectionChange: (connected) => {
      if (!connected) {
        // Clear all collaboration state on disconnect
        setPresenceUsers([]);
        setTypingUsers([]);
        setConflicts([]);
        typingTimeouts.current.clear();
      }
      
      onConnectionChange?.(connected);
    }
  });

  // Enhanced typing indicator management
  const handleTypingIndicator = useCallback((taskId: string, isTyping: boolean) => {
    // Clear existing timeout
    const existingTimeout = typingTimeouts.current.get(taskId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    if (isTyping) {
      // Add user to typing list
      setTypingUsers(prev => {
        const filtered = prev.filter(u => u.userId !== userId || u.taskId !== taskId);
        return [...filtered, {
          userId,
          name: 'You', // TODO: Get from user context
          taskId
        }];
      });

      // Send typing indicator
      wsHook.sendTypingIndicator(taskId, true);

      // Set timeout to stop typing indicator
      const timeout = setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.userId !== userId || u.taskId !== taskId));
        wsHook.sendTypingIndicator(taskId, false);
        typingTimeouts.current.delete(taskId);
      }, typingTimeout);

      typingTimeouts.current.set(taskId, timeout);
    } else {
      // Remove user from typing list
      setTypingUsers(prev => prev.filter(u => u.userId !== userId || u.taskId !== taskId));
      wsHook.sendTypingIndicator(taskId, false);
    }
  }, [userId, typingTimeout, wsHook]);

  // Enhanced message handling for typing indicators
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        if (message.type === 'typing' && message.userId !== userId) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.userId !== message.userId || u.taskId !== message.taskId);
            
            if (message.data.isTyping) {
              return [...filtered, {
                userId: message.userId!,
                name: message.data.name || message.userId!,
                avatar: message.data.avatar,
                taskId: message.taskId!
              }];
            } else {
              return filtered;
            }
          });
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    // This would need to be integrated with the base WebSocket hook
    // For now, we'll handle it through the existing message handling
  }, [userId]);

  // Conflict resolution
  const resolveConflicts = useCallback((resolutions: any[]) => {
    // Send conflict resolutions to server
    wsHook.sendMessage({
      type: 'conflict_resolved',
      data: { resolutions }
    });
    
    setConflicts([]);
  }, [wsHook]);

  const dismissConflicts = useCallback(() => {
    setConflicts([]);
  }, []);

  // Optimistic updates with conflict detection
  const updateTaskOptimistically = useCallback(async (taskId: string, updates: any) => {
    // Store optimistic update
    optimisticUpdates.current.set(taskId, {
      ...updates,
      timestamp: new Date(),
      userId
    });

    try {
      // Send update to server
      const response = await fetch('/api/hero-tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          ...updates,
          optimistic: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      
      if (result.success) {
        // Clear optimistic update on success
        optimisticUpdates.current.delete(taskId);
      } else if (result.conflicts) {
        // Handle conflicts
        const conflictData: ConflictData[] = result.conflicts.map((conflict: any) => ({
          field: conflict.field,
          localValue: conflict.localValue,
          remoteValue: conflict.remoteValue,
          localTimestamp: new Date(conflict.localTimestamp),
          remoteTimestamp: new Date(conflict.remoteTimestamp),
          localUserId: conflict.localUserId,
          remoteUserId: conflict.remoteUserId
        }));
        
        setConflicts(conflictData);
        onConflict?.(conflictData);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      // Revert optimistic update on error
      optimisticUpdates.current.delete(taskId);
    }
  }, [userId, onConflict]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.current.forEach(timeout => clearTimeout(timeout));
      typingTimeouts.current.clear();
    };
  }, []);

  return {
    // WebSocket connection state
    connected: wsHook.connected,
    connecting: wsHook.connecting,
    error: wsHook.error,
    connectedUsers: wsHook.connectedUsers,
    currentTaskUsers: wsHook.currentTaskUsers,
    
    // Presence indicators
    presenceUsers,
    typingUsers,
    
    // Conflict resolution
    conflicts,
    hasConflicts: conflicts.length > 0,
    
    // Actions
    sendMessage: wsHook.sendMessage,
    joinTaskRoom: wsHook.joinTaskRoom,
    leaveTaskRoom: wsHook.leaveTaskRoom,
    sendTypingIndicator: handleTypingIndicator,
    resolveConflicts,
    dismissConflicts,
    reconnect: wsHook.reconnect,
    
    // Optimistic updates
    updateTaskOptimistically
  };
}

export default useLiveCollaboration;
