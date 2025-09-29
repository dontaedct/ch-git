/**
 * Memory Leak Detector - Advanced leak detection and prevention
 *
 * Provides comprehensive memory leak detection, component lifecycle tracking,
 * and automatic cleanup enforcement for React components.
 *
 * @fileoverview HT-034.8.3 Component Memory Leak Detection & Prevention
 */

import { useEffect, useRef, useCallback } from 'react';
import { memoryManager } from './memory-manager';

// Memory leak patterns to detect
interface LeakPattern {
  type: 'event-listener' | 'timer' | 'subscription' | 'dom-node' | 'closure' | 'cache';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detector: (component: ComponentTracker) => boolean;
  fixer?: (component: ComponentTracker) => void;
}

// Component lifecycle tracking
interface ComponentTracker {
  id: string;
  name: string;
  mountTime: number;
  unmountTime?: number;
  eventListeners: Set<{ element: EventTarget; event: string; handler: EventListener }>;
  timers: Set<NodeJS.Timeout>;
  intervals: Set<NodeJS.Timeout>;
  subscriptions: Set<{ unsubscribe: () => void }>;
  domNodes: Set<Node>;
  closureRefs: Set<any>;
  cacheEntries: Set<string>;
  renderCount: number;
  lastRenderTime: number;
  memoryUsage: number[];
  leaksDetected: Set<string>;
}

// Leak detection result
interface LeakDetectionResult {
  componentId: string;
  leaks: {
    type: LeakPattern['type'];
    severity: LeakPattern['severity'];
    description: string;
    count: number;
    autoFixed: boolean;
  }[];
  totalLeaks: number;
  riskScore: number;
}

class MemoryLeakDetector {
  private static instance: MemoryLeakDetector;
  private components: Map<string, ComponentTracker> = new Map();
  private leakPatterns: LeakPattern[] = [];
  private detectionInterval: NodeJS.Timeout | null = null;
  private autoFixEnabled: boolean = true;

  private constructor() {
    this.initializeLeakPatterns();
    this.startDetection();
  }

  static getInstance(): MemoryLeakDetector {
    if (!MemoryLeakDetector.instance) {
      MemoryLeakDetector.instance = new MemoryLeakDetector();
    }
    return MemoryLeakDetector.instance;
  }

  /**
   * Initialize leak detection patterns
   */
  private initializeLeakPatterns(): void {
    this.leakPatterns = [
      // Event listener leaks
      {
        type: 'event-listener',
        severity: 'high',
        description: 'Event listeners not removed on unmount',
        detector: (component) => component.eventListeners.size > 0 && component.unmountTime !== undefined,
        fixer: (component) => {
          component.eventListeners.forEach(({ element, event, handler }) => {
            try {
              element.removeEventListener(event, handler);
            } catch (error) {
              console.warn('Failed to remove event listener:', error);
            }
          });
          component.eventListeners.clear();
        }
      },

      // Timer leaks
      {
        type: 'timer',
        severity: 'medium',
        description: 'Timers not cleared on unmount',
        detector: (component) => (component.timers.size > 0 || component.intervals.size > 0) && component.unmountTime !== undefined,
        fixer: (component) => {
          component.timers.forEach(timer => clearTimeout(timer));
          component.intervals.forEach(interval => clearInterval(interval));
          component.timers.clear();
          component.intervals.clear();
        }
      },

      // Subscription leaks
      {
        type: 'subscription',
        severity: 'high',
        description: 'Subscriptions not unsubscribed on unmount',
        detector: (component) => component.subscriptions.size > 0 && component.unmountTime !== undefined,
        fixer: (component) => {
          component.subscriptions.forEach(({ unsubscribe }) => {
            try {
              unsubscribe();
            } catch (error) {
              console.warn('Failed to unsubscribe:', error);
            }
          });
          component.subscriptions.clear();
        }
      },

      // DOM node leaks
      {
        type: 'dom-node',
        severity: 'medium',
        description: 'DOM nodes not cleaned up',
        detector: (component) => component.domNodes.size > 0 && component.unmountTime !== undefined,
        fixer: (component) => {
          component.domNodes.forEach(node => {
            try {
              if (node.parentNode) {
                node.parentNode.removeChild(node);
              }
            } catch (error) {
              console.warn('Failed to remove DOM node:', error);
            }
          });
          component.domNodes.clear();
        }
      },

      // Closure leaks (large objects held in closures)
      {
        type: 'closure',
        severity: 'low',
        description: 'Large objects held in closures',
        detector: (component) => component.closureRefs.size > 10,
        fixer: (component) => {
          // Clear references to large objects
          component.closureRefs.clear();
        }
      },

      // Cache leaks
      {
        type: 'cache',
        severity: 'medium',
        description: 'Cache entries not cleared',
        detector: (component) => component.cacheEntries.size > 50,
        fixer: (component) => {
          const cache = memoryManager.getComponentCache(component.name);
          component.cacheEntries.forEach(key => {
            cache.delete(key);
          });
          component.cacheEntries.clear();
        }
      }
    ];
  }

  /**
   * Start leak detection monitoring
   */
  private startDetection(): void {
    this.detectionInterval = setInterval(() => {
      this.detectLeaks();
      this.cleanupStaleComponents();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Register a component for tracking
   */
  registerComponent(name: string): string {
    const id = `${name}-${Date.now()}-${Math.random()}`;
    const tracker: ComponentTracker = {
      id,
      name,
      mountTime: Date.now(),
      eventListeners: new Set(),
      timers: new Set(),
      intervals: new Set(),
      subscriptions: new Set(),
      domNodes: new Set(),
      closureRefs: new Set(),
      cacheEntries: new Set(),
      renderCount: 0,
      lastRenderTime: Date.now(),
      memoryUsage: [],
      leaksDetected: new Set()
    };

    this.components.set(id, tracker);
    return id;
  }

  /**
   * Unregister a component
   */
  unregisterComponent(id: string): void {
    const component = this.components.get(id);
    if (component) {
      component.unmountTime = Date.now();

      // Perform immediate leak check on unmount
      const leaks = this.detectComponentLeaks(component);
      if (leaks.totalLeaks > 0) {
        console.warn(`🚨 Memory leaks detected on component unmount:`, leaks);

        if (this.autoFixEnabled) {
          this.fixComponentLeaks(component);
        }
      }

      // Keep component data for a short time for analysis
      setTimeout(() => {
        this.components.delete(id);
      }, 60000); // Remove after 1 minute
    }
  }

  /**
   * Track event listener registration
   */
  trackEventListener(componentId: string, element: EventTarget, event: string, handler: EventListener): void {
    const component = this.components.get(componentId);
    if (component) {
      component.eventListeners.add({ element, event, handler });
    }
  }

  /**
   * Track timer registration
   */
  trackTimer(componentId: string, timer: NodeJS.Timeout, isInterval: boolean = false): void {
    const component = this.components.get(componentId);
    if (component) {
      if (isInterval) {
        component.intervals.add(timer);
      } else {
        component.timers.add(timer);
      }
    }
  }

  /**
   * Track subscription registration
   */
  trackSubscription(componentId: string, unsubscribe: () => void): void {
    const component = this.components.get(componentId);
    if (component) {
      component.subscriptions.add({ unsubscribe });
    }
  }

  /**
   * Track DOM node creation
   */
  trackDomNode(componentId: string, node: Node): void {
    const component = this.components.get(componentId);
    if (component) {
      component.domNodes.add(node);
    }
  }

  /**
   * Track closure reference
   */
  trackClosureRef(componentId: string, ref: any): void {
    const component = this.components.get(componentId);
    if (component) {
      component.closureRefs.add(ref);
    }
  }

  /**
   * Track cache entry
   */
  trackCacheEntry(componentId: string, key: string): void {
    const component = this.components.get(componentId);
    if (component) {
      component.cacheEntries.add(key);
    }
  }

  /**
   * Track component render
   */
  trackRender(componentId: string): void {
    const component = this.components.get(componentId);
    if (component) {
      component.renderCount++;
      component.lastRenderTime = Date.now();

      // Track memory usage if available
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory;
        component.memoryUsage.push(memory.usedJSHeapSize);

        // Keep only last 10 readings
        if (component.memoryUsage.length > 10) {
          component.memoryUsage = component.memoryUsage.slice(-10);
        }
      }
    }
  }

  /**
   * Detect leaks across all components
   */
  private detectLeaks(): void {
    const results: LeakDetectionResult[] = [];

    this.components.forEach((component, id) => {
      const leaks = this.detectComponentLeaks(component);
      if (leaks.totalLeaks > 0) {
        results.push(leaks);

        if (this.autoFixEnabled && leaks.riskScore > 50) {
          this.fixComponentLeaks(component);
        }
      }
    });

    if (results.length > 0) {
      console.warn('🚨 Memory leaks detected:', results);
    }
  }

  /**
   * Detect leaks for a specific component
   */
  private detectComponentLeaks(component: ComponentTracker): LeakDetectionResult {
    const leaks: LeakDetectionResult['leaks'] = [];
    let totalLeaks = 0;
    let riskScore = 0;

    this.leakPatterns.forEach(pattern => {
      if (pattern.detector(component)) {
        const count = this.getLeakCount(component, pattern.type);
        leaks.push({
          type: pattern.type,
          severity: pattern.severity,
          description: pattern.description,
          count,
          autoFixed: false
        });

        totalLeaks += count;
        riskScore += this.getSeverityScore(pattern.severity) * count;

        component.leaksDetected.add(pattern.type);
      }
    });

    return {
      componentId: component.id,
      leaks,
      totalLeaks,
      riskScore
    };
  }

  /**
   * Get leak count for specific type
   */
  private getLeakCount(component: ComponentTracker, type: LeakPattern['type']): number {
    switch (type) {
      case 'event-listener':
        return component.eventListeners.size;
      case 'timer':
        return component.timers.size + component.intervals.size;
      case 'subscription':
        return component.subscriptions.size;
      case 'dom-node':
        return component.domNodes.size;
      case 'closure':
        return component.closureRefs.size;
      case 'cache':
        return component.cacheEntries.size;
      default:
        return 0;
    }
  }

  /**
   * Get severity score for risk calculation
   */
  private getSeverityScore(severity: LeakPattern['severity']): number {
    switch (severity) {
      case 'low':
        return 1;
      case 'medium':
        return 5;
      case 'high':
        return 10;
      case 'critical':
        return 20;
      default:
        return 1;
    }
  }

  /**
   * Fix leaks for a component
   */
  private fixComponentLeaks(component: ComponentTracker): void {
    this.leakPatterns.forEach(pattern => {
      if (pattern.detector(component) && pattern.fixer) {
        try {
          pattern.fixer(component);
          console.log(`✅ Auto-fixed ${pattern.type} leak for component ${component.name}`);
        } catch (error) {
          console.error(`❌ Failed to fix ${pattern.type} leak:`, error);
        }
      }
    });
  }

  /**
   * Clean up stale component trackers
   */
  private cleanupStaleComponents(): void {
    const now = Date.now();
    const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    this.components.forEach((component, id) => {
      if (component.unmountTime && (now - component.unmountTime) > STALE_THRESHOLD) {
        this.components.delete(id);
      }
    });
  }

  /**
   * Get leak detection summary
   */
  getLeakSummary(): {
    totalComponents: number;
    componentsWithLeaks: number;
    totalLeaks: number;
    highRiskComponents: number;
    topLeakTypes: { type: string; count: number }[];
  } {
    const summary = {
      totalComponents: this.components.size,
      componentsWithLeaks: 0,
      totalLeaks: 0,
      highRiskComponents: 0,
      topLeakTypes: new Map<string, number>()
    };

    this.components.forEach(component => {
      const leaks = this.detectComponentLeaks(component);

      if (leaks.totalLeaks > 0) {
        summary.componentsWithLeaks++;
        summary.totalLeaks += leaks.totalLeaks;

        if (leaks.riskScore > 50) {
          summary.highRiskComponents++;
        }

        leaks.leaks.forEach(leak => {
          const current = summary.topLeakTypes.get(leak.type) || 0;
          summary.topLeakTypes.set(leak.type, current + leak.count);
        });
      }
    });

    return {
      ...summary,
      topLeakTypes: Array.from(summary.topLeakTypes.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    };
  }

  /**
   * Force leak detection for all components
   */
  forceDetection(): LeakDetectionResult[] {
    const results: LeakDetectionResult[] = [];

    this.components.forEach(component => {
      const leaks = this.detectComponentLeaks(component);
      if (leaks.totalLeaks > 0) {
        results.push(leaks);
      }
    });

    return results;
  }

  /**
   * Enable or disable auto-fixing
   */
  setAutoFix(enabled: boolean): void {
    this.autoFixEnabled = enabled;
  }

  /**
   * Get component tracker by ID
   */
  getComponent(id: string): ComponentTracker | undefined {
    return this.components.get(id);
  }

  /**
   * Cleanup when destroying the detector
   */
  destroy(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }

    // Fix all remaining leaks
    this.components.forEach(component => {
      this.fixComponentLeaks(component);
    });

    this.components.clear();
  }
}

// Export singleton instance
export const memoryLeakDetector = MemoryLeakDetector.getInstance();

// React hook for memory leak detection
export function useMemoryLeakDetection(componentName: string) {
  const componentIdRef = useRef<string>();

  useEffect(() => {
    // Register component on mount
    componentIdRef.current = memoryLeakDetector.registerComponent(componentName);

    return () => {
      // Unregister component on unmount
      if (componentIdRef.current) {
        memoryLeakDetector.unregisterComponent(componentIdRef.current);
      }
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    if (componentIdRef.current) {
      memoryLeakDetector.trackRender(componentIdRef.current);
    }
  });

  // Helper functions for tracking
  const trackEventListener = useCallback((element: EventTarget, event: string, handler: EventListener) => {
    if (componentIdRef.current) {
      memoryLeakDetector.trackEventListener(componentIdRef.current, element, event, handler);
    }
  }, []);

  const trackTimer = useCallback((timer: NodeJS.Timeout, isInterval: boolean = false) => {
    if (componentIdRef.current) {
      memoryLeakDetector.trackTimer(componentIdRef.current, timer, isInterval);
    }
  }, []);

  const trackSubscription = useCallback((unsubscribe: () => void) => {
    if (componentIdRef.current) {
      memoryLeakDetector.trackSubscription(componentIdRef.current, unsubscribe);
    }
  }, []);

  return {
    trackEventListener,
    trackTimer,
    trackSubscription,
    componentId: componentIdRef.current
  };
}

// Enhanced useEffect hook with automatic leak detection
export function useEffectWithLeakDetection(
  effect: React.EffectCallback,
  deps: React.DependencyList | undefined,
  componentName: string
): void {
  const { trackEventListener, trackTimer, trackSubscription } = useMemoryLeakDetection(componentName);

  useEffect(() => {
    const cleanup = effect();

    // Wrap cleanup to ensure proper tracking
    return () => {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error in effect cleanup:', error);
        }
      }
    };
  }, deps);
}

export default MemoryLeakDetector;