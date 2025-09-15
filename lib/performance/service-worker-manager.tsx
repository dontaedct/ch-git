/**
 * @fileoverview HT-008.9.2: Service Worker Registration and Management
 * @module lib/performance/service-worker-manager.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.2 - Add comprehensive caching strategies
 * Focus: Service Worker registration and management for caching
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Service Worker status
 */
export type ServiceWorkerStatus = 'installing' | 'installed' | 'activating' | 'activated' | 'redundant' | 'error';

/**
 * Service Worker registration info
 */
export interface ServiceWorkerInfo {
  registration: ServiceWorkerRegistration | null;
  status: ServiceWorkerStatus;
  error: Error | null;
  isSupported: boolean;
  isOnline: boolean;
}

/**
 * Service Worker configuration
 */
export interface ServiceWorkerConfig {
  scriptURL: string;
  scope: string;
  updateInterval: number; // milliseconds
  enableNotifications: boolean;
  enableBackgroundSync: boolean;
  enableOfflineSupport: boolean;
}

/**
 * Default Service Worker configuration
 */
export const DEFAULT_SW_CONFIG: ServiceWorkerConfig = {
  scriptURL: '/sw-cache.js',
  scope: '/',
  updateInterval: 60000, // 1 minute
  enableNotifications: true,
  enableBackgroundSync: true,
  enableOfflineSupport: true,
};

/**
 * Service Worker Manager Class
 */
export class ServiceWorkerManager {
  private config: ServiceWorkerConfig;
  private registration: ServiceWorkerRegistration | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(config: ServiceWorkerConfig = DEFAULT_SW_CONFIG) {
    this.config = config;
  }

  /**
   * Register Service Worker
   */
  async register(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        this.config.scriptURL,
        { scope: this.config.scope }
      );

      console.log('✅ Service Worker registered successfully');

      // Set up event listeners
      this.setupEventListeners();

      // Start update checking
      this.startUpdateChecking();

      return this.registration;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Unregister Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker unregistered');
      
      this.stopUpdateChecking();
      this.registration = null;
      
      return result;
    } catch (error) {
      console.error('❌ Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Update Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      throw new Error('No Service Worker registered');
    }

    try {
      await this.registration.update();
      console.log('🔄 Service Worker update triggered');
    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
      throw error;
    }
  }

  /**
   * Get Service Worker status
   */
  getStatus(): ServiceWorkerStatus {
    if (!this.registration) {
      return 'error';
    }

    const sw = this.registration.active || this.registration.installing || this.registration.waiting;
    
    if (!sw) {
      return 'error';
    }

    switch (sw.state) {
      case 'installing':
        return 'installing';
      case 'installed':
        return 'installed';
      case 'activating':
        return 'activating';
      case 'activated':
        return 'activated';
      case 'redundant':
        return 'redundant';
      default:
        return 'error';
    }
  }

  /**
   * Check if Service Worker is supported
   */
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Get Service Worker info
   */
  getInfo(): ServiceWorkerInfo {
    return {
      registration: this.registration,
      status: this.getStatus(),
      error: null,
      isSupported: this.isSupported(),
      isOnline: this.isOnline(),
    };
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    if (!this.registration) {
      return;
    }

    // Handle Service Worker updates
    this.registration.addEventListener('updatefound', () => {
      console.log('🔄 Service Worker update found');
      
      const newWorker = this.registration!.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📱 New Service Worker installed, refresh to update');
            // Could show update notification to user
          }
        });
      }
    });

    // Handle controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🎮 Service Worker controller changed');
      window.location.reload();
    });

    // Handle online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Back online');
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
    });
  }

  /**
   * Start update checking
   */
  private startUpdateChecking(): void {
    if (this.updateInterval) {
      return;
    }

    this.updateInterval = setInterval(() => {
      this.update().catch(() => {
        // Ignore update errors
      });
    }, this.config.updateInterval);
  }

  /**
   * Stop update checking
   */
  private stopUpdateChecking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.config.enableNotifications) {
      return 'denied';
    }

    if (!('Notification' in window)) {
      console.warn('⚠️ Notifications not supported');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('❌ Notification permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Show notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.config.enableNotifications) {
      return;
    }

    if (!this.registration) {
      throw new Error('No Service Worker registered');
    }

    const permission = await this.requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    try {
      await this.registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        ...options,
      });
    } catch (error) {
      console.error('❌ Failed to show notification:', error);
      throw error;
    }
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    } catch (error) {
      console.error('❌ Failed to clear caches:', error);
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    cacheNames: string[];
    totalSize: number;
    entryCount: number;
  }> {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let entryCount = 0;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        entryCount += keys.length;

        for (const request of keys) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            totalSize += blob.size;
          }
        }
      }

      return {
        cacheNames,
        totalSize,
        entryCount,
      };
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      throw error;
    }
  }
}

/**
 * React Hook for Service Worker Management
 */
export function useServiceWorker(config?: Partial<ServiceWorkerConfig>) {
  const mergedConfig = { ...DEFAULT_SW_CONFIG, ...config };
  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo>({
    registration: null,
    status: 'error',
    error: null,
    isSupported: false,
    isOnline: navigator.onLine,
  });

  const [manager] = useState(() => new ServiceWorkerManager(mergedConfig));

  const register = useCallback(async () => {
    try {
      const registration = await manager.register();
      setSwInfo(manager.getInfo());
      return registration;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Registration failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  const unregister = useCallback(async () => {
    try {
      const result = await manager.unregister();
      setSwInfo(manager.getInfo());
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unregistration failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  const update = useCallback(async () => {
    try {
      await manager.update();
      setSwInfo(manager.getInfo());
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Update failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  const clearCaches = useCallback(async () => {
    try {
      await manager.clearCaches();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Clear caches failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  const getCacheStats = useCallback(async () => {
    try {
      return await manager.getCacheStats();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Get cache stats failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  const showNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    try {
      await manager.showNotification(title, options);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Show notification failed');
      setSwInfo(prev => ({ ...prev, error: err }));
      throw err;
    }
  }, [manager]);

  // Initialize Service Worker on mount
  useEffect(() => {
    if (manager.isSupported()) {
      register().catch(() => {
        // Ignore registration errors on mount
      });
    }

    // Update online status
    const handleOnline = () => setSwInfo(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setSwInfo(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [manager, register]);

  return {
    ...swInfo,
    register,
    unregister,
    update,
    clearCaches,
    getCacheStats,
    showNotification,
  };
}

/**
 * Export Service Worker utilities
 */
export const ServiceWorkerUtils = {
  ServiceWorkerManager,
  useServiceWorker,
  DEFAULT_SW_CONFIG,
};

export default ServiceWorkerUtils;
