/**
 * @fileoverview PWA Utilities Hook
 * @module hooks/usePWA
 * @author Hero Tasks System
 * @version 1.0.0
 * 
 * Custom hook for PWA functionality including offline detection, 
 * background sync, and installation status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface PWAState {
  isOnline: boolean;
  isInstalled: boolean;
  canInstall: boolean;
  swRegistration: ServiceWorkerRegistration | null;
  isUpdateAvailable: boolean;
  offlineTasks: any[];
}

interface PWAActions {
  installApp: () => Promise<void>;
  updateApp: () => void;
  syncOfflineTasks: () => Promise<void>;
  addOfflineTask: (task: any) => Promise<void>;
  removeOfflineTask: (taskId: string) => Promise<void>;
}

export function usePWA(): PWAState & PWAActions {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [offlineTasks, setOfflineTasks] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Initialize PWA functionality
  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
    };

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
          setSwRegistration(registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Load offline tasks from IndexedDB
    loadOfflineTasks();

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline tasks from IndexedDB
  const loadOfflineTasks = useCallback(async () => {
    try {
      const tasks = await getOfflineTasks();
      setOfflineTasks(tasks);
    } catch (error) {
      console.error('[PWA] Failed to load offline tasks:', error);
    }
  }, []);

  // Install app
  const installApp = useCallback(async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setCanInstall(false);
    } catch (error) {
      console.error('[PWA] Error during installation:', error);
    }
  }, [deferredPrompt]);

  // Update app
  const updateApp = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  // Sync offline tasks
  const syncOfflineTasks = useCallback(async () => {
    if (!isOnline || offlineTasks.length === 0) return;

    try {
      console.log('[PWA] Syncing offline tasks...');
      
      for (const task of offlineTasks) {
        try {
          const response = await fetch('/api/hero-tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
          });
          
          if (response.ok) {
            await removeOfflineTask(task.id);
            console.log('[PWA] Synced task:', task.id);
          }
        } catch (error) {
          console.error('[PWA] Failed to sync task:', task.id, error);
        }
      }
      
      // Reload offline tasks after sync
      await loadOfflineTasks();
    } catch (error) {
      console.error('[PWA] Sync failed:', error);
    }
  }, [isOnline, offlineTasks, loadOfflineTasks]);

  // Add offline task
  const addOfflineTask = useCallback(async (task: any) => {
    try {
      await saveOfflineTask(task);
      await loadOfflineTasks();
    } catch (error) {
      console.error('[PWA] Failed to save offline task:', error);
    }
  }, [loadOfflineTasks]);

  // Remove offline task
  const removeOfflineTask = useCallback(async (taskId: string) => {
    try {
      await deleteOfflineTask(taskId);
      await loadOfflineTasks();
    } catch (error) {
      console.error('[PWA] Failed to remove offline task:', error);
    }
  }, [loadOfflineTasks]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineTasks.length > 0) {
      const timer = setTimeout(() => {
        syncOfflineTasks();
      }, 1000); // Wait 1 second after coming online

      return () => clearTimeout(timer);
    }
  }, [isOnline, offlineTasks.length, syncOfflineTasks]);

  return {
    // State
    isOnline,
    isInstalled,
    canInstall,
    swRegistration,
    isUpdateAvailable,
    offlineTasks,
    
    // Actions
    installApp,
    updateApp,
    syncOfflineTasks,
    addOfflineTask,
    removeOfflineTask,
  };
}

// IndexedDB utilities
async function getOfflineTasks(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hero-tasks-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['tasks'], 'readonly');
      const store = transaction.objectStore('tasks');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
  });
}

async function saveOfflineTask(task: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hero-tasks-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const addRequest = store.add(task);
      
      addRequest.onsuccess = () => resolve();
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
  });
}

async function deleteOfflineTask(taskId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('hero-tasks-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['tasks'], 'readwrite');
      const store = transaction.objectStore('tasks');
      const deleteRequest = store.delete(taskId);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

export default usePWA;

