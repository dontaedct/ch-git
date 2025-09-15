/**
 * Offline Data Management System for Hero Tasks
 * Created: 2025-09-08T15:40:02.000Z
 * Version: 1.0.0
 */

'use client';

import React from 'react';
import { HeroTask, CreateHeroTaskRequest, UpdateHeroTaskRequest, TaskStatus, WorkflowPhase, TaskPriority } from '@/types/hero-tasks';

// IndexedDB configuration
const DB_NAME = 'HeroTasksOffline';
const DB_VERSION = 1;
const TASKS_STORE = 'tasks';
const SYNC_QUEUE_STORE = 'syncQueue';
const METADATA_STORE = 'metadata';

// Sync status types
export enum SyncStatus {
  PENDING = 'pending',
  SYNCING = 'syncing',
  SYNCED = 'synced',
  FAILED = 'failed'
}

// Offline task with sync metadata
export interface OfflineTask extends HeroTask {
  syncStatus: SyncStatus;
  lastModified: number;
  offlineId?: string;
  pendingChanges?: Partial<HeroTask>;
}

// Sync queue item
export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

// Offline metadata
export interface OfflineMetadata {
  lastSync: number;
  isOnline: boolean;
  pendingSyncCount: number;
  lastOfflineTime: number;
}

class OfflineDataManager {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.init();
    this.setupOnlineStatusListener();
  }

  private async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create tasks store
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const tasksStore = db.createObjectStore(TASKS_STORE, { keyPath: 'id' });
          tasksStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          tasksStore.createIndex('lastModified', 'lastModified', { unique: false });
          tasksStore.createIndex('offlineId', 'offlineId', { unique: true });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_QUEUE_STORE)) {
          const syncStore = db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
      };
    });
  }

  private setupOnlineStatusListener(): void {
    const updateOnlineStatus = () => {
      const wasOnline = this.isOnline;
      this.isOnline = navigator.onLine;
      
      if (wasOnline !== this.isOnline) {
        this.updateMetadata({ isOnline: this.isOnline });
        this.listeners.forEach(listener => listener(this.isOnline));
        
        if (this.isOnline && !this.syncInProgress) {
          this.performSync();
        }
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
  }

  // Task management methods
  async saveTask(task: HeroTask): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const offlineTask: OfflineTask = {
      ...task,
      syncStatus: this.isOnline ? SyncStatus.SYNCED : SyncStatus.PENDING,
      lastModified: Date.now(),
      offlineId: task.id
    };

    const transaction = this.db.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(offlineTask);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue('UPDATE', task);
    }
  }

  async createTask(taskData: CreateHeroTaskRequest): Promise<OfflineTask> {
    if (!this.db) throw new Error('Database not initialized');

    const offlineId = `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineTask: OfflineTask = {
      id: offlineId,
      task_number: `HT-OFFLINE-${Date.now()}`,
      title: taskData.title,
      description: taskData.description || '',
      status: TaskStatus.DRAFT,
      priority: taskData.priority || TaskPriority.MEDIUM,
      type: taskData.type || 'feature',
      assignee_id: taskData.assignee_id || '',
      due_date: taskData.due_date || '',
      estimated_duration_hours: taskData.estimated_duration_hours || 0,
      actual_duration_hours: 0,
      tags: taskData.tags || [],
      current_phase: WorkflowPhase.AUDIT,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      audit_trail: [],
      syncStatus: this.isOnline ? SyncStatus.SYNCED : SyncStatus.PENDING,
      lastModified: Date.now(),
      offlineId,
      metadata: taskData.metadata || {}
    };

    const transaction = this.db.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(offlineTask);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue('CREATE', offlineTask);
    }

    return offlineTask;
  }

  async getTasks(): Promise<OfflineTask[]> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([TASKS_STORE], 'readonly');
    const store = transaction.objectStore(TASKS_STORE);
    
    return new Promise<OfflineTask[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTask(id: string): Promise<OfflineTask | null> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([TASKS_STORE], 'readonly');
    const store = transaction.objectStore(TASKS_STORE);
    
    return new Promise<OfflineTask | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const transaction = this.db.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue('DELETE', { id });
    }
  }

  // Sync queue management
  private async addToSyncQueue(type: 'CREATE' | 'UPDATE' | 'DELETE', data: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const syncItem: SyncQueueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3
    };

    const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(syncItem);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    await this.updateMetadata({ pendingSyncCount: await this.getPendingSyncCount() });
  }

  private async getPendingSyncCount(): Promise<number> {
    if (!this.db) return 0;

    const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    return new Promise<number>((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Sync operations
  async performSync(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || !this.db) return;

    this.syncInProgress = true;
    console.log('Starting offline sync...');

    try {
      const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
      const store = transaction.objectStore(SYNC_QUEUE_STORE);
      
      const syncItems = await new Promise<SyncQueueItem[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      for (const item of syncItems) {
        try {
          await this.syncItem(item);
          await this.removeSyncItem(item.id);
        } catch (error) {
          console.error('Failed to sync item:', item, error);
          await this.incrementRetryCount(item.id);
        }
      }

      await this.updateMetadata({ 
        lastSync: Date.now(),
        pendingSyncCount: 0
      });

      console.log('Offline sync completed successfully');
    } catch (error) {
      console.error('Offline sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    const { type, data } = item;

    switch (type) {
      case 'CREATE':
        await this.syncCreateTask(data);
        break;
      case 'UPDATE':
        await this.syncUpdateTask(data);
        break;
      case 'DELETE':
        await this.syncDeleteTask(data.id);
        break;
    }
  }

  private async syncCreateTask(task: OfflineTask): Promise<void> {
    const response = await fetch('/api/hero-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        priority: task.priority,
        type: task.type,
        assignee_id: task.assignee_id,
        due_date: task.due_date,
        estimated_duration_hours: task.estimated_duration_hours,
        tags: task.tags,
        metadata: task.metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success && result.data) {
      // Update local task with server ID
      await this.updateTaskWithServerId(task.id, result.data.id);
    }
  }

  private async syncUpdateTask(task: OfflineTask): Promise<void> {
    const response = await fetch(`/api/hero-tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        type: task.type,
        assignee_id: task.assignee_id,
        due_date: task.due_date,
        estimated_duration_hours: task.estimated_duration_hours,
        actual_duration_hours: task.actual_duration_hours,
        tags: task.tags,
        current_phase: task.current_phase,
        metadata: task.metadata
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }
  }

  private async syncDeleteTask(taskId: string): Promise<void> {
    const response = await fetch(`/api/hero-tasks/${taskId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }

  private async updateTaskWithServerId(offlineId: string, serverId: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([TASKS_STORE], 'readwrite');
    const store = transaction.objectStore(TASKS_STORE);
    
    const task = await new Promise<OfflineTask | null>((resolve, reject) => {
      const request = store.get(offlineId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (task) {
      task.id = serverId;
      task.syncStatus = SyncStatus.SYNCED;
      task.lastModified = Date.now();
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put(task);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  private async removeSyncItem(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async incrementRetryCount(id: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([SYNC_QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(SYNC_QUEUE_STORE);
    
    const item = await new Promise<SyncQueueItem | null>((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });

    if (item) {
      item.retryCount++;
      if (item.retryCount >= item.maxRetries) {
        await this.removeSyncItem(id);
      } else {
        await new Promise<void>((resolve, reject) => {
          const request = store.put(item);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
  }

  // Metadata management
  private async updateMetadata(updates: Partial<OfflineMetadata>): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([METADATA_STORE], 'readwrite');
    const store = transaction.objectStore(METADATA_STORE);
    
    const current = await new Promise<OfflineMetadata>((resolve, reject) => {
      const request = store.get('metadata');
      request.onsuccess = () => resolve(request.result || {
        lastSync: 0,
        isOnline: true,
        pendingSyncCount: 0,
        lastOfflineTime: 0
      });
      request.onerror = () => reject(request.error);
    });

    const updated = { ...current, ...updates };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ key: 'metadata', ...updated });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getMetadata(): Promise<OfflineMetadata> {
    if (!this.db) {
      return {
        lastSync: 0,
        isOnline: true,
        pendingSyncCount: 0,
        lastOfflineTime: 0
      };
    }

    const transaction = this.db.transaction([METADATA_STORE], 'readonly');
    const store = transaction.objectStore(METADATA_STORE);
    
    return new Promise<OfflineMetadata>((resolve, reject) => {
      const request = store.get('metadata');
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? {
          lastSync: result.lastSync || 0,
          isOnline: result.isOnline !== undefined ? result.isOnline : true,
          pendingSyncCount: result.pendingSyncCount || 0,
          lastOfflineTime: result.lastOfflineTime || 0
        } : {
          lastSync: 0,
          isOnline: true,
          pendingSyncCount: 0,
          lastOfflineTime: 0
        });
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Event listeners
  addOnlineStatusListener(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Utility methods
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  async clearOfflineData(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([TASKS_STORE, SYNC_QUEUE_STORE, METADATA_STORE], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(TASKS_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(SYNC_QUEUE_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      }),
      new Promise<void>((resolve, reject) => {
        const request = transaction.objectStore(METADATA_STORE).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      })
    ]);
  }
}

// Singleton instance
export const offlineDataManager = new OfflineDataManager();

// React hook for offline functionality
export function useOfflineData() {
  const [isOnline, setIsOnline] = React.useState(offlineDataManager.isOnlineStatus());
  const [metadata, setMetadata] = React.useState<OfflineMetadata>({
    lastSync: 0,
    isOnline: true,
    pendingSyncCount: 0,
    lastOfflineTime: 0
  });

  React.useEffect(() => {
    const removeListener = offlineDataManager.addOnlineStatusListener(setIsOnline);
    
    // Load initial metadata
    offlineDataManager.getMetadata().then(setMetadata);

    return removeListener;
  }, []);

  React.useEffect(() => {
    setMetadata(prev => ({ ...prev, isOnline }));
  }, [isOnline]);

  return {
    isOnline,
    metadata,
    offlineDataManager
  };
}

export default OfflineDataManager;
