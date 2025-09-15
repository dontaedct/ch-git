/**
 * WebSocket Client Hook for Hero Tasks Real-time Collaboration
 * 
 * Provides React hook for WebSocket connection management,
 * real-time task updates, and presence indicators.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { createRouteLogger } from '@/lib/logger';

const logger = createRouteLogger('WebSocketClient', '/hooks/useWebSocket');

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_status_changed' | 'user_joined' | 'user_left' | 'typing' | 'ping' | 'pong' | 'conflict_resolved' | 'join_task' | 'leave_task';
  data: any;
  userId?: string;
  taskId?: string;
  timestamp: string;
}

export interface ConnectedUser {
  userId: string;
  lastSeen: Date;
  currentTaskId?: string;
}

export interface UseWebSocketOptions {
  userId: string;
  token?: string;
  enabled?: boolean;
  onTaskUpdate?: (message: WebSocketMessage) => void;
  onPresenceUpdate?: (message: WebSocketMessage) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connectedUsers: ConnectedUser[];
  currentTaskUsers: string[];
  sendMessage: (message: Partial<WebSocketMessage>) => void;
  joinTaskRoom: (taskId: string) => void;
  leaveTaskRoom: (taskId: string) => void;
  sendTypingIndicator: (taskId: string, isTyping: boolean) => void;
  reconnect: () => void;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    userId,
    token,
    enabled = true,
    onTaskUpdate,
    onPresenceUpdate,
    onConnectionChange
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [currentTaskUsers, setCurrentTaskUsers] = useState<string[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentTaskIdRef = useRef<string | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      // Determine WebSocket URL
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/hero-tasks?userId=${encodeURIComponent(userId)}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

      logger.info('Connecting to WebSocket', { wsUrl: wsUrl.replace(token || '', '[REDACTED]') });

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        logger.info('WebSocket connected', { userId });
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnectionChange?.(true);

        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            sendMessage({ type: 'ping', data: {} });
          }
        }, 30000);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          logger.debug('WebSocket message received', { type: message.type, userId });

          switch (message.type) {
            case 'pong':
              // Handle pong response
              break;

            case 'task_created':
            case 'task_updated':
            case 'task_deleted':
            case 'task_status_changed':
              onTaskUpdate?.(message);
              break;

            case 'user_joined':
            case 'user_left':
              // Update connected users list
              if (message.data.connectedUsers !== undefined) {
                setConnectedUsers(prev => {
                  const updated = [...prev];
                  if (message.type === 'user_joined') {
                    const existingIndex = updated.findIndex(u => u.userId === message.userId);
                    if (existingIndex >= 0) {
                      updated[existingIndex] = { ...updated[existingIndex], lastSeen: new Date() };
                    } else {
                      updated.push({
                        userId: message.userId!,
                        lastSeen: new Date(),
                        currentTaskId: message.data.taskId
                      });
                    }
                  } else {
                    return updated.filter(u => u.userId !== message.userId);
                  }
                  return updated;
                });
              }

              // Update current task users if in same task room
              if (message.data.taskId === currentTaskIdRef.current) {
                setCurrentTaskUsers(prev => {
                  if (message.type === 'user_joined') {
                    return prev.includes(message.userId!) ? prev : [...prev, message.userId!];
                  } else {
                    return prev.filter(id => id !== message.userId);
                  }
                });
              }

              onPresenceUpdate?.(message);
              break;

            case 'typing':
              // Handle typing indicators
              if (message.data.taskId === currentTaskIdRef.current) {
                // You can implement typing indicator UI here
                logger.debug('Typing indicator received', { 
                  userId: message.userId, 
                  isTyping: message.data.isTyping 
                });
              }
              break;

            default:
              logger.warn('Unknown message type', { type: message.type });
          }
        } catch (error) {
          logger.error('Failed to parse WebSocket message', { 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      };

      wsRef.current.onclose = (event) => {
        logger.info('WebSocket disconnected', { 
          code: event.code, 
          reason: event.reason, 
          userId 
        });
        
        setConnected(false);
        setConnecting(false);
        onConnectionChange?.(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Attempt to reconnect if not a manual close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          logger.info('Scheduling reconnection', { 
            attempt: reconnectAttemptsRef.current + 1, 
            delay 
          });
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      wsRef.current.onerror = (error) => {
        logger.error('WebSocket error', { 
          error: error instanceof Error ? error.message : 'Unknown error', 
          userId 
        });
        setError('WebSocket connection error');
        setConnecting(false);
      };

    } catch (error) {
      logger.error('Failed to create WebSocket connection', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      setError('Failed to create WebSocket connection');
      setConnecting(false);
    }
  }, [enabled, userId, token, onTaskUpdate, onPresenceUpdate, onConnectionChange]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    onConnectionChange?.(false);
  }, [onConnectionChange]);

  const sendMessage = useCallback((message: Partial<WebSocketMessage>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        type: message.type!,
        data: message.data || {},
        userId: message.userId || userId,
        taskId: message.taskId,
        timestamp: new Date().toISOString()
      };

      wsRef.current.send(JSON.stringify(fullMessage));
      logger.debug('WebSocket message sent', { type: message.type, userId });
    } else {
      logger.warn('Cannot send message: WebSocket not connected', { type: message.type });
    }
  }, [userId]);

  const joinTaskRoom = useCallback((taskId: string) => {
    currentTaskIdRef.current = taskId;
    sendMessage({ 
      type: 'join_task', 
      data: { taskId } 
    });
    logger.info('Joined task room', { taskId, userId });
  }, [sendMessage, userId]);

  const leaveTaskRoom = useCallback((taskId: string) => {
    sendMessage({ 
      type: 'leave_task', 
      data: { taskId } 
    });
    
    if (currentTaskIdRef.current === taskId) {
      currentTaskIdRef.current = null;
      setCurrentTaskUsers([]);
    }
    
    logger.info('Left task room', { taskId, userId });
  }, [sendMessage, userId]);

  const sendTypingIndicator = useCallback((taskId: string, isTyping: boolean) => {
    sendMessage({ 
      type: 'typing', 
      data: { taskId, isTyping } 
    });
  }, [sendMessage]);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // Connect on mount and when dependencies change
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connected,
    connecting,
    error,
    connectedUsers,
    currentTaskUsers,
    sendMessage,
    joinTaskRoom,
    leaveTaskRoom,
    sendTypingIndicator,
    reconnect
  };
}
