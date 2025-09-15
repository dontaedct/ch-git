/**
 * WebSocket Server for Real-time Hero Tasks Collaboration
 * 
 * Implements WebSocket connections with Redis pub/sub for horizontal scaling
 * and real-time task updates across multiple clients.
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from 'redis';
import { createRouteLogger } from '@/lib/logger';

const logger = createRouteLogger('WebSocket', '/ws/hero-tasks');

export interface WebSocketMessage {
  type: 'task_created' | 'task_updated' | 'task_deleted' | 'task_status_changed' | 'user_joined' | 'user_left' | 'typing' | 'ping' | 'pong' | 'join_task' | 'leave_task';
  data: any;
  userId?: string;
  taskId?: string;
  timestamp: string;
}

export interface ConnectedUser {
  userId: string;
  socket: WebSocket;
  lastSeen: Date;
  currentTaskId?: string;
}

class HeroTasksWebSocketServer {
  private wss: WebSocketServer | null = null;
  private redisClient: any = null;
  private redisSubscriber: any = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private taskRooms: Map<string, Set<string>> = new Map(); // taskId -> Set of userIds

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      // Initialize Redis client for pub/sub
      this.redisClient = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              logger.error('Redis connection failed after 10 retries');
              return new Error('Redis connection failed');
            }
            logger.warn('Redis connection failed, retrying...', { attempt: retries });
            return Math.min(retries * 100, 3000);
          }
        }
      });

      this.redisSubscriber = this.redisClient.duplicate();

      await this.redisClient.connect();
      await this.redisSubscriber.connect();

      // Subscribe to task update channels
      await this.redisSubscriber.subscribe('hero_tasks:updates', this.handleRedisMessage.bind(this));
      await this.redisSubscriber.subscribe('hero_tasks:presence', this.handlePresenceMessage.bind(this));

      logger.info('Redis pub/sub initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Redis', { error: error instanceof Error ? error.message : 'Unknown error' });
      // Continue without Redis for development
    }
  }

  public initialize(server: any) {
    this.wss = new WebSocketServer({
      server,
      path: '/ws/hero-tasks',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    
    logger.info('WebSocket server initialized', { path: '/ws/hero-tasks' });
  }

  private async verifyClient(info: any): Promise<boolean> {
    try {
      // Extract auth token from query params or headers
      const url = new URL(info.req.url, `http://${info.req.headers.host}`);
      const token = url.searchParams.get('token') || info.req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        logger.warn('WebSocket connection rejected: No auth token');
        return false;
      }

      // TODO: Verify token with Supabase auth
      // For now, accept all connections with tokens
      return true;
    } catch (error) {
      logger.error('WebSocket verification error', { error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  private handleConnection(socket: WebSocket, request: any) {
    const url = new URL(request.url, `http://${request.headers.host}`);
    const userId = url.searchParams.get('userId') || 'anonymous';
    
    logger.info('New WebSocket connection', { userId });

    // Store user connection
    this.connectedUsers.set(userId, {
      userId,
      socket,
      lastSeen: new Date()
    });

    // Send welcome message
    this.sendMessage(socket, {
      type: 'user_joined',
      data: { userId, connectedUsers: this.connectedUsers.size },
      timestamp: new Date().toISOString()
    });

    // Broadcast user joined to all connected users
    this.broadcastToAll({
      type: 'user_joined',
      data: { userId, connectedUsers: this.connectedUsers.size },
      userId,
      timestamp: new Date().toISOString()
    }, userId);

    // Handle incoming messages
    socket.on('message', (data) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        this.handleMessage(message, userId, socket);
      } catch (error) {
        logger.error('Failed to parse WebSocket message', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          userId 
        });
      }
    });

    // Handle disconnection
    socket.on('close', () => {
      this.handleDisconnection(userId);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('WebSocket error', { 
        error: error.message, 
        userId 
      });
      this.handleDisconnection(userId);
    });

    // Set up ping/pong for connection health
    const pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        this.sendMessage(socket, {
          type: 'ping',
          data: {},
          timestamp: new Date().toISOString()
        });
      } else {
        clearInterval(pingInterval);
      }
    }, 30000); // Ping every 30 seconds
  }

  private handleMessage(message: WebSocketMessage, userId: string, socket: WebSocket) {
    logger.debug('WebSocket message received', { type: message.type, userId });

    switch (message.type) {
      case 'pong':
        // Update last seen
        const user = this.connectedUsers.get(userId);
        if (user) {
          user.lastSeen = new Date();
        }
        break;

      case 'typing':
        // Broadcast typing indicator to task room
        if (message.taskId) {
          this.broadcastToTaskRoom(message.taskId, {
            type: 'typing',
            data: { userId, isTyping: message.data.isTyping },
            userId,
            taskId: message.taskId,
            timestamp: new Date().toISOString()
          }, userId);
        }
        break;

      case 'join_task':
        // Join a task room for real-time collaboration
        if (message.taskId) {
          this.joinTaskRoom(userId, message.taskId);
        }
        break;

      case 'leave_task':
        // Leave a task room
        if (message.taskId) {
          this.leaveTaskRoom(userId, message.taskId);
        }
        break;

      default:
        logger.warn('Unknown message type', { type: message.type, userId });
    }
  }

  private handleDisconnection(userId: string) {
    logger.info('WebSocket disconnection', { userId });

    // Remove from all task rooms
    for (const [taskId, userIds] of this.taskRooms.entries()) {
      if (userIds.has(userId)) {
        userIds.delete(userId);
        if (userIds.size === 0) {
          this.taskRooms.delete(taskId);
        } else {
          // Broadcast user left to remaining users in task room
          this.broadcastToTaskRoom(taskId, {
            type: 'user_left',
            data: { userId },
            userId,
            taskId,
            timestamp: new Date().toISOString()
          });
        }
      }
    }

    // Remove user connection
    this.connectedUsers.delete(userId);

    // Broadcast user left to all connected users
    this.broadcastToAll({
      type: 'user_left',
      data: { userId, connectedUsers: this.connectedUsers.size },
      userId,
      timestamp: new Date().toISOString()
    });
  }

  private joinTaskRoom(userId: string, taskId: string) {
    if (!this.taskRooms.has(taskId)) {
      this.taskRooms.set(taskId, new Set());
    }
    
    this.taskRooms.get(taskId)!.add(userId);
    
    // Update user's current task
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.currentTaskId = taskId;
    }

    // Broadcast user joined task room
    this.broadcastToTaskRoom(taskId, {
      type: 'user_joined',
      data: { userId, taskId },
      userId,
      taskId,
      timestamp: new Date().toISOString()
    }, userId);

    logger.debug('User joined task room', { userId, taskId });
  }

  private leaveTaskRoom(userId: string, taskId: string) {
    const room = this.taskRooms.get(taskId);
    if (room) {
      room.delete(userId);
      
      if (room.size === 0) {
        this.taskRooms.delete(taskId);
      } else {
        // Broadcast user left task room
        this.broadcastToTaskRoom(taskId, {
          type: 'user_left',
          data: { userId, taskId },
          userId,
          taskId,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Update user's current task
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.currentTaskId = undefined;
    }

    logger.debug('User left task room', { userId, taskId });
  }

  private sendMessage(socket: WebSocket, message: WebSocketMessage) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  }

  private broadcastToAll(message: WebSocketMessage, excludeUserId?: string) {
    for (const [userId, user] of this.connectedUsers.entries()) {
      if (userId !== excludeUserId) {
        this.sendMessage(user.socket, message);
      }
    }
  }

  private broadcastToTaskRoom(taskId: string, message: WebSocketMessage, excludeUserId?: string) {
    const room = this.taskRooms.get(taskId);
    if (room) {
      for (const userId of room) {
        if (userId !== excludeUserId) {
          const user = this.connectedUsers.get(userId);
          if (user) {
            this.sendMessage(user.socket, message);
          }
        }
      }
    }
  }

  private async handleRedisMessage(message: string) {
    try {
      const data = JSON.parse(message);
      logger.debug('Redis message received', { type: data.type });

      // Broadcast to all connected users
      this.broadcastToAll({
        type: data.type,
        data: data.data,
        userId: data.userId,
        taskId: data.taskId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Failed to handle Redis message', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  private async handlePresenceMessage(message: string) {
    try {
      const data = JSON.parse(message);
      logger.debug('Redis presence message received', { type: data.type });

      // Broadcast presence updates to relevant task rooms
      if (data.taskId) {
        this.broadcastToTaskRoom(data.taskId, {
          type: data.type,
          data: data.data,
          userId: data.userId,
          taskId: data.taskId,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Failed to handle Redis presence message', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Public methods for broadcasting updates
  public async broadcastTaskUpdate(eventType: string, data: any, userId: string, taskId?: string) {
    const message = {
      type: eventType as any,
      data,
      userId,
      taskId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected users
    this.broadcastToAll(message, userId);

    // If taskId is provided, also broadcast to task room
    if (taskId) {
      this.broadcastToTaskRoom(taskId, message, userId);
    }

    // Publish to Redis for horizontal scaling
    if (this.redisClient) {
      try {
        await this.redisClient.publish('hero_tasks:updates', JSON.stringify(message));
      } catch (error) {
        logger.error('Failed to publish to Redis', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.info('Task update broadcasted', { eventType, taskId, userId });
  }

  public async broadcastPresenceUpdate(eventType: string, data: any, userId: string, taskId: string) {
    const message = {
      type: eventType as any,
      data,
      userId,
      taskId,
      timestamp: new Date().toISOString()
    };

    // Broadcast to task room
    this.broadcastToTaskRoom(taskId, message, userId);

    // Publish to Redis for horizontal scaling
    if (this.redisClient) {
      try {
        await this.redisClient.publish('hero_tasks:presence', JSON.stringify(message));
      } catch (error) {
        logger.error('Failed to publish presence to Redis', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    }

    logger.debug('Presence update broadcasted', { eventType, taskId, userId });
  }

  public getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  public getTaskRoomUsers(taskId: string): string[] {
    const room = this.taskRooms.get(taskId);
    return room ? Array.from(room) : [];
  }

  public async close() {
    if (this.wss) {
      this.wss.close();
    }
    
    if (this.redisClient) {
      await this.redisClient.quit();
    }
    
    if (this.redisSubscriber) {
      await this.redisSubscriber.quit();
    }

    logger.info('WebSocket server closed');
  }
}

// Singleton instance
let wsServer: HeroTasksWebSocketServer | null = null;

export function getWebSocketServer(): HeroTasksWebSocketServer {
  if (!wsServer) {
    wsServer = new HeroTasksWebSocketServer();
  }
  return wsServer;
}

export function initializeWebSocketServer(server: any) {
  const ws = getWebSocketServer();
  ws.initialize(server);
  return ws;
}

export default HeroTasksWebSocketServer;
