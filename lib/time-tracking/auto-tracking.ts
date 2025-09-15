/**
 * Hero Tasks Automatic Time Tracking
 * HT-004.2.4: Time Tracking System
 * Created: 2025-09-15
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { TimeTrackingService } from '@/lib/time-tracking/service';
import { TimeTrackingSettings } from '@/types/hero-tasks';

interface AutoTimeTrackingOptions {
  userId: string;
  enabled?: boolean;
  idleTimeout?: number; // in minutes
  activityCheckInterval?: number; // in milliseconds
  onActivityDetected?: () => void;
  onIdleDetected?: () => void;
}

export class AutoTimeTracking {
  private userId: string;
  private enabled: boolean;
  private idleTimeout: number;
  private activityCheckInterval: number;
  private lastActivity: number;
  private activityTimer: NodeJS.Timeout | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private onActivityDetected?: () => void;
  private onIdleDetected?: () => void;
  private isTracking: boolean = false;

  constructor(options: AutoTimeTrackingOptions) {
    this.userId = options.userId;
    this.enabled = options.enabled ?? true;
    this.idleTimeout = (options.idleTimeout ?? 15) * 60 * 1000; // Convert to milliseconds
    this.activityCheckInterval = options.activityCheckInterval ?? 30000; // 30 seconds
    this.lastActivity = Date.now();
    this.onActivityDetected = options.onActivityDetected;
    this.onIdleDetected = options.onIdleDetected;

    this.initialize();
  }

  private async initialize() {
    if (!this.enabled) return;

    // Load user settings
    try {
      const settings = await TimeTrackingService.getTimeTrackingSettings(this.userId);
      if (settings) {
        this.idleTimeout = settings.idle_timeout_minutes * 60 * 1000;
        this.enabled = settings.auto_tracking_enabled;
      }
    } catch (error) {
      console.error('Error loading auto tracking settings:', error);
    }

    if (this.enabled) {
      this.startActivityMonitoring();
    }
  }

  private startActivityMonitoring() {
    // Clear existing timers
    this.clearTimers();

    // Start activity check timer
    this.activityTimer = setInterval(() => {
      this.checkActivity();
    }, this.activityCheckInterval);

    // Start idle detection timer
    this.idleTimer = setInterval(() => {
      this.checkIdle();
    }, 60000); // Check every minute

    // Add event listeners for user activity
    this.addActivityListeners();
  }

  private addActivityListeners() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    events.forEach(event => {
      document.addEventListener(event, this.handleActivity.bind(this), true);
    });

    // Also listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private removeActivityListeners() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity.bind(this), true);
    });

    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleActivity() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Only update if it's been more than 5 seconds since last activity
    // This prevents excessive updates
    if (timeSinceLastActivity > 5000) {
      this.lastActivity = now;
      this.onActivityDetected?.();
      
      // Update activity in the service if we're tracking
      if (this.isTracking) {
        TimeTrackingService.updateActivity(this.userId).catch(error => {
          console.error('Error updating activity:', error);
        });
      }
    }
  }

  private handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, consider this as potential idle time
      this.lastActivity = Date.now() - this.idleTimeout + 60000; // Mark as potentially idle
    } else {
      // Page is visible again, mark as active
      this.lastActivity = Date.now();
      this.onActivityDetected?.();
    }
  }

  private async checkActivity() {
    try {
      const activeSession = await TimeTrackingService.getActiveSession(this.userId);
      this.isTracking = !!activeSession;
    } catch (error) {
      console.error('Error checking active session:', error);
    }
  }

  private async checkIdle() {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    if (timeSinceLastActivity > this.idleTimeout && this.isTracking) {
      // User has been idle for too long, stop tracking
      try {
        await TimeTrackingService.stopTracking(this.userId, {
          description: 'Auto-stopped due to inactivity'
        });
        this.isTracking = false;
        this.onIdleDetected?.();
      } catch (error) {
        console.error('Error stopping tracking due to idle:', error);
      }
    }
  }

  private clearTimers() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    if (this.idleTimer) {
      clearInterval(this.idleTimer);
      this.idleTimer = null;
    }
  }

  public updateSettings(settings: Partial<TimeTrackingSettings>) {
    if (settings.auto_tracking_enabled !== undefined) {
      this.enabled = settings.auto_tracking_enabled;
    }
    if (settings.idle_timeout_minutes !== undefined) {
      this.idleTimeout = settings.idle_timeout_minutes * 60 * 1000;
    }

    if (this.enabled) {
      this.startActivityMonitoring();
    } else {
      this.stop();
    }
  }

  public start() {
    this.enabled = true;
    this.startActivityMonitoring();
  }

  public stop() {
    this.enabled = false;
    this.clearTimers();
    this.removeActivityListeners();
  }

  public destroy() {
    this.stop();
  }
}

// React hook for automatic time tracking
export function useAutoTimeTracking(options: AutoTimeTrackingOptions) {
  const autoTrackingRef = useRef<AutoTimeTracking | null>(null);

  useEffect(() => {
    if (options.userId && options.enabled !== false) {
      autoTrackingRef.current = new AutoTimeTracking(options);
    }

    return () => {
      if (autoTrackingRef.current) {
        autoTrackingRef.current.destroy();
      }
    };
  }, [options.userId, options.enabled]);

  const updateSettings = useCallback((settings: Partial<TimeTrackingSettings>) => {
    if (autoTrackingRef.current) {
      autoTrackingRef.current.updateSettings(settings);
    }
  }, []);

  const start = useCallback(() => {
    if (autoTrackingRef.current) {
      autoTrackingRef.current.start();
    }
  }, []);

  const stop = useCallback(() => {
    if (autoTrackingRef.current) {
      autoTrackingRef.current.stop();
    }
  }, []);

  return {
    updateSettings,
    start,
    stop
  };
}

// Global auto tracking manager
class GlobalAutoTimeTracking {
  private instances: Map<string, AutoTimeTracking> = new Map();

  public createInstance(userId: string, options: Omit<AutoTimeTrackingOptions, 'userId'>) {
    // Destroy existing instance for this user
    this.destroyInstance(userId);

    // Create new instance
    const instance = new AutoTimeTracking({ userId, ...options });
    this.instances.set(userId, instance);
    return instance;
  }

  public getInstance(userId: string): AutoTimeTracking | undefined {
    return this.instances.get(userId);
  }

  public destroyInstance(userId: string) {
    const instance = this.instances.get(userId);
    if (instance) {
      instance.destroy();
      this.instances.delete(userId);
    }
  }

  public destroyAll() {
    this.instances.forEach(instance => instance.destroy());
    this.instances.clear();
  }
}

export const globalAutoTimeTracking = new GlobalAutoTimeTracking();
