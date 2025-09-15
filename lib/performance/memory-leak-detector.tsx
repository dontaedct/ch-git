/**
 * @fileoverview HT-008.2.2: Memory Leak Detection & Prevention System
 * @module lib/performance/memory-leak-detector
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.2 - Fix memory leaks in motion system and event listeners
 * Focus: Comprehensive memory leak detection and prevention
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical memory management)
 */

import React, { useEffect } from 'react';
import { logger } from '@/lib/observability/logger';
import { safeGetMemoryInfo, safeTriggerGC } from '@/lib/types/type-safe-utils';

/**
 * Memory leak detection and prevention system
 * Monitors memory usage patterns and prevents common leak scenarios
 */
export class MemoryLeakDetector {
  private static instance: MemoryLeakDetector | null = null;
  private memoryBaseline: number = 0;
  private leakThreshold: number = 50 * 1024 * 1024; // 50MB
  private monitoringInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<() => void>> = new Map();
  private timers: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();
  private observers: Set<IntersectionObserver | MutationObserver | ResizeObserver> = new Set();
  private abortControllers: Set<AbortController> = new Set();

  private constructor() {
    this.memoryBaseline = this.getCurrentMemoryUsage();
    this.startMonitoring();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (typeof window === 'undefined') {
      return process.memoryUsage().heapUsed;
    }
    
    // Browser memory API (if available)
    const memoryInfo = safeGetMemoryInfo();
    if (memoryInfo.usedJSHeapSize !== undefined) {
      return memoryInfo.usedJSHeapSize;
    }
    
    return 0;
  }

  /**
   * Start memory monitoring
   */
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, 5000); // Check every 5 seconds

    // Monitor page visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Monitor beforeunload for cleanup
    window.addEventListener('beforeunload', this.cleanup.bind(this));
  }

  /**
   * Check memory usage and detect leaks
   */
  private checkMemoryUsage(): void {
    const currentUsage = this.getCurrentMemoryUsage();
    const memoryDelta = currentUsage - this.memoryBaseline;

    if (memoryDelta > this.leakThreshold) {
      logger.warn('Potential memory leak detected', {
        currentUsage,
        memoryDelta,
        threshold: this.leakThreshold,
        eventListeners: this.eventListeners.size,
        timers: this.timers.size,
        intervals: this.intervals.size,
        observers: this.observers.size,
        abortControllers: this.abortControllers.size,
      });

      // Attempt automatic cleanup
      this.performAutomaticCleanup();
    }
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange(): void {
    if (document.hidden) {
      // Page is hidden, perform cleanup
      this.performAutomaticCleanup();
    }
  }

  /**
   * Perform automatic cleanup
   */
  private performAutomaticCleanup(): void {
    // Clear orphaned timers
    this.timers.forEach(timer => {
      clearTimeout(timer);
    });
    this.timers.clear();

    // Clear orphaned intervals
    this.intervals.forEach(interval => {
      clearInterval(interval);
    });
    this.intervals.clear();

    // Disconnect orphaned observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();

    // Abort orphaned requests
    this.abortControllers.forEach(controller => {
      controller.abort();
    });
    this.abortControllers.clear();

    logger.info('Automatic memory cleanup performed', {
      timersCleared: this.timers.size,
      intervalsCleared: this.intervals.size,
      observersDisconnected: this.observers.size,
      requestsAborted: this.abortControllers.size,
    });
  }

  /**
   * Register a timer for tracking
   */
  registerTimer(timer: NodeJS.Timeout): void {
    this.timers.add(timer);
  }

  /**
   * Unregister a timer
   */
  unregisterTimer(timer: NodeJS.Timeout): void {
    this.timers.delete(timer);
  }

  /**
   * Register an interval for tracking
   */
  registerInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
  }

  /**
   * Unregister an interval
   */
  unregisterInterval(interval: NodeJS.Timeout): void {
    this.intervals.delete(interval);
  }

  /**
   * Register an observer for tracking
   */
  registerObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.observers.add(observer);
  }

  /**
   * Unregister an observer
   */
  unregisterObserver(observer: IntersectionObserver | MutationObserver | ResizeObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Register an abort controller for tracking
   */
  registerAbortController(controller: AbortController): void {
    this.abortControllers.add(controller);
  }

  /**
   * Unregister an abort controller
   */
  unregisterAbortController(controller: AbortController): void {
    this.abortControllers.delete(controller);
  }

  /**
   * Register an event listener for tracking
   */
  registerEventListener(element: string, listener: () => void): void {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, new Set());
    }
    this.eventListeners.get(element)!.add(listener);
  }

  /**
   * Unregister an event listener
   */
  unregisterEventListener(element: string, listener: () => void): void {
    const listeners = this.eventListeners.get(element);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(element);
      }
    }
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    currentUsage: number;
    memoryDelta: number;
    leakThreshold: number;
    eventListeners: number;
    timers: number;
    intervals: number;
    observers: number;
    abortControllers: number;
  } {
    return {
      currentUsage: this.getCurrentMemoryUsage(),
      memoryDelta: this.getCurrentMemoryUsage() - this.memoryBaseline,
      leakThreshold: this.leakThreshold,
      eventListeners: this.eventListeners.size,
      timers: this.timers.size,
      intervals: this.intervals.size,
      observers: this.observers.size,
      abortControllers: this.abortControllers.size,
    };
  }

  /**
   * Force garbage collection (if available)
   */
  forceGarbageCollection(): void {
    safeTriggerGC();
  }

  /**
   * Cleanup all resources
   */
  cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.performAutomaticCleanup();
    
    // Clear event listeners
    this.eventListeners.clear();

    logger.info('Memory leak detector cleanup completed');
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.cleanup();
    MemoryLeakDetector.instance = null;
  }
}

/**
 * React hook for memory leak prevention
 */
export function useMemoryLeakPrevention() {
  const detector = MemoryLeakDetector.getInstance();

  useEffect(() => {
    return () => {
      // Component cleanup - this will be called when component unmounts
      detector.cleanup();
    };
  }, []);

  return {
    registerTimer: detector.registerTimer.bind(detector),
    unregisterTimer: detector.unregisterTimer.bind(detector),
    registerInterval: detector.registerInterval.bind(detector),
    unregisterInterval: detector.unregisterInterval.bind(detector),
    registerObserver: detector.registerObserver.bind(detector),
    unregisterObserver: detector.unregisterObserver.bind(detector),
    registerAbortController: detector.registerAbortController.bind(detector),
    unregisterAbortController: detector.unregisterAbortController.bind(detector),
    getMemoryStats: detector.getMemoryStats.bind(detector),
    forceGarbageCollection: detector.forceGarbageCollection.bind(detector),
  };
}

/**
 * Enhanced setTimeout with memory leak prevention
 */
export function safeSetTimeout(callback: () => void, delay: number): NodeJS.Timeout {
  const detector = MemoryLeakDetector.getInstance();
  const timer = setTimeout(() => {
    detector.unregisterTimer(timer);
    callback();
  }, delay);
  
  detector.registerTimer(timer);
  return timer;
}

/**
 * Enhanced setInterval with memory leak prevention
 */
export function safeSetInterval(callback: () => void, delay: number): NodeJS.Timeout {
  const detector = MemoryLeakDetector.getInstance();
  const interval = setInterval(callback, delay);
  
  detector.registerInterval(interval);
  return interval;
}

/**
 * Enhanced clearTimeout with memory leak prevention
 */
export function safeClearTimeout(timer: NodeJS.Timeout): void {
  const detector = MemoryLeakDetector.getInstance();
  detector.unregisterTimer(timer);
  clearTimeout(timer);
}

/**
 * Enhanced clearInterval with memory leak prevention
 */
export function safeClearInterval(interval: NodeJS.Timeout): void {
  const detector = MemoryLeakDetector.getInstance();
  detector.unregisterInterval(interval);
  clearInterval(interval);
}

/**
 * Enhanced addEventListener with memory leak prevention
 */
export function safeAddEventListener(
  element: EventTarget,
  event: string,
  listener: EventListener,
  options?: AddEventListenerOptions
): void {
  const detector = MemoryLeakDetector.getInstance();
  const elementKey = `${element.constructor.name}-${event}`;
  
  detector.registerEventListener(elementKey, listener as () => void);
  
  element.addEventListener(event, listener, options);
}

/**
 * Enhanced removeEventListener with memory leak prevention
 */
export function safeRemoveEventListener(
  element: EventTarget,
  event: string,
  listener: EventListener,
  options?: EventListenerOptions
): void {
  const detector = MemoryLeakDetector.getInstance();
  const elementKey = `${element.constructor.name}-${event}`;
  
  detector.unregisterEventListener(elementKey, listener as () => void);
  
  element.removeEventListener(event, listener, options);
}

export default MemoryLeakDetector;
