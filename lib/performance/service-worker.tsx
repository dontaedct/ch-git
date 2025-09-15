/**
 * @fileoverview HT-008.2.7: Service Worker for Offline Capabilities
 * @module lib/performance/service-worker
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.7 - Add service worker for offline capabilities
 * Focus: Advanced service worker with intelligent caching and offline support
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical offline functionality)
 */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * Service Worker Manager
 */
export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = false;
  private cacheName: string = 'oss-hero-cache-v1';
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB
  private maxCacheAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {
    this.isSupported = 'serviceWorker' in navigator;
  }

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Register service worker
   */
  async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              this.notifyUpdate();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check if service worker is active
   */
  isActive(): boolean {
    return this.registration !== null && this.registration.active !== null;
  }

  /**
   * Get service worker state
   */
  getState(): {
    isSupported: boolean;
    isRegistered: boolean;
    isActive: boolean;
    scope?: string;
  } {
    return {
      isSupported: this.isSupported,
      isRegistered: this.registration !== null,
      isActive: this.isActive(),
      scope: this.registration?.scope
    };
  }

  /**
   * Notify user about update
   */
  private notifyUpdate(): void {
    // Dispatch custom event for update notification
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

/**
 * Cache Manager
 */
export class CacheManager {
  private static instance: CacheManager | null = null;
  private cacheName: string = 'oss-hero-cache-v1';
  private maxCacheSize: number = 50 * 1024 * 1024; // 50MB
  private maxCacheAge: number = 7 * 24 * 60 * 60 * 1000; // 7 days

  private constructor() {}

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Cache a request
   */
  async cacheRequest(request: Request, response: Response): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      await cache.put(request, response.clone());
      
      // Clean up old entries
      await this.cleanupCache();
    } catch (error) {
      console.error('Failed to cache request:', error);
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(request: Request): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const response = await cache.match(request);
      
      if (response) {
        // Check if cache is still valid
        const cacheTime = response.headers.get('sw-cache-time');
        if (cacheTime) {
          const age = Date.now() - parseInt(cacheTime);
          if (age > this.maxCacheAge) {
            await cache.delete(request);
            return null;
          }
        }
      }
      
      return response || null;
    } catch (error) {
      console.error('Failed to get cached response:', error);
      return null;
    }
  }

  /**
   * Clean up old cache entries
   */
  async cleanupCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      
      // Sort by cache time (oldest first)
      const requestsWithTime = await Promise.all(
        requests.map(async (request) => {
          const response = await cache.match(request);
          const cacheTime = response?.headers.get('sw-cache-time');
          return {
            request,
            cacheTime: cacheTime ? parseInt(cacheTime) : 0
          };
        })
      );
      
      requestsWithTime.sort((a, b) => a.cacheTime - b.cacheTime);
      
      // Remove old entries if cache is too large
      if (requestsWithTime.length > 100) {
        const toRemove = requestsWithTime.slice(0, requestsWithTime.length - 100);
        await Promise.all(
          toRemove.map(({ request }) => cache.delete(request))
        );
      }
    } catch (error) {
      console.error('Failed to cleanup cache:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clearCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }

    try {
      await caches.delete(this.cacheName);
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    size: number;
    entries: number;
    hitRate: number;
  }> {
    if (!('caches' in window)) {
      return { size: 0, entries: 0, hitRate: 0 };
    }

    try {
      const cache = await caches.open(this.cacheName);
      const requests = await cache.keys();
      
      let totalSize = 0;
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const contentLength = response.headers.get('content-length');
          if (contentLength) {
            totalSize += parseInt(contentLength);
          }
        }
      }
      
      return {
        size: totalSize,
        entries: requests.length,
        hitRate: 0 // Would need to track hits/misses
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return { size: 0, entries: 0, hitRate: 0 };
    }
  }
}

/**
 * Offline Manager
 */
export class OfflineManager {
  private static instance: OfflineManager | null = null;
  private isOnline: boolean = navigator.onLine;
  private offlineQueue: Array<{
    url: string;
    method: string;
    data?: any;
    timestamp: number;
  }> = [];

  private constructor() {
    this.setupEventListeners();
  }

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
      window.dispatchEvent(new CustomEvent('app-online'));
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      window.dispatchEvent(new CustomEvent('app-offline'));
    });
  }

  /**
   * Check if online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Add request to offline queue
   */
  addToOfflineQueue(url: string, method: string, data?: any): void {
    this.offlineQueue.push({
      url,
      method,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Process offline queue
   */
  private async processOfflineQueue(): Promise<void> {
    if (!this.isOnline || this.offlineQueue.length === 0) {
      return;
    }

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        await fetch(item.url, {
          method: item.method,
          body: item.data ? JSON.stringify(item.data) : undefined,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Failed to process offline queue item:', error);
        // Re-add to queue if failed
        this.offlineQueue.push(item);
      }
    }
  }

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus(): {
    isOnline: boolean;
    queueLength: number;
    oldestItem: number | null;
  } {
    return {
      isOnline: this.getOnlineStatus(),
      queueLength: this.offlineQueue.length,
      oldestItem: this.offlineQueue.length > 0 ? this.offlineQueue[0].timestamp : null
    };
  }
}

/**
 * Service Worker Hook
 */
export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const swManager = ServiceWorkerManager.getInstance();
    
    setIsSupported(swManager.getState().isSupported);
    setIsRegistered(swManager.getState().isRegistered);
    setIsActive(swManager.getState().isActive);

    // Register service worker
    if (swManager.getState().isSupported && !swManager.getState().isRegistered) {
      swManager.register().then((success) => {
        setIsRegistered(success);
        setIsActive(success);
      });
    }

    // Listen for update events
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const skipWaiting = useCallback(async () => {
    const swManager = ServiceWorkerManager.getInstance();
    await swManager.skipWaiting();
    setUpdateAvailable(false);
  }, []);

  return {
    isSupported,
    isRegistered,
    isActive,
    updateAvailable,
    skipWaiting
  };
}

/**
 * Offline Hook
 */
export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    url: string;
    method: string;
    data?: any;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    const offlineManager = OfflineManager.getInstance();
    
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('app-online', handleOnline);
    window.addEventListener('app-offline', handleOffline);

    return () => {
      window.removeEventListener('app-online', handleOnline);
      window.removeEventListener('app-offline', handleOffline);
    };
  }, []);

  const addToOfflineQueue = useCallback((url: string, method: string, data?: any) => {
    const offlineManager = OfflineManager.getInstance();
    offlineManager.addToOfflineQueue(url, method, data);
    
    const status = offlineManager.getOfflineQueueStatus();
    setOfflineQueue(Array.from({ length: status.queueLength }));
  }, []);

  return {
    isOnline,
    offlineQueue,
    addToOfflineQueue
  };
}

/**
 * Cache Hook
 */
export function useCache() {
  const [cacheStats, setCacheStats] = useState({
    size: 0,
    entries: 0,
    hitRate: 0
  });

  useEffect(() => {
    const updateCacheStats = async () => {
      const cacheManager = CacheManager.getInstance();
      const stats = await cacheManager.getCacheStats();
      setCacheStats(stats);
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const clearCache = useCallback(async () => {
    const cacheManager = CacheManager.getInstance();
    await cacheManager.clearCache();
    
    const stats = await cacheManager.getCacheStats();
    setCacheStats(stats);
  }, []);

  return {
    cacheStats,
    clearCache
  };
}

export default ServiceWorkerManager;
