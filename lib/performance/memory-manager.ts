/**
 * Memory Manager - Advanced memory optimization for admin interfaces
 *
 * Provides comprehensive memory usage optimization, leak detection,
 * and resource allocation management across all admin components.
 *
 * @fileoverview HT-034.8.3 Memory Management & Resource Optimization
 */

import { useCallback, useEffect, useRef, useMemo } from 'react';

// Memory usage tracking interface
interface MemoryUsage {
  component: string;
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  leakRisk: 'low' | 'medium' | 'high';
}

// Resource allocation tracking
interface ResourceAllocation {
  id: string;
  type: 'event-listener' | 'timer' | 'subscription' | 'cache' | 'websocket';
  component: string;
  allocated: number;
  cleaned: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Memory optimization configuration
interface MemoryConfig {
  maxCacheSize: number;
  maxEventListeners: number;
  cleanupInterval: number;
  leakThreshold: number;
  gcForceThreshold: number;
  monitoringEnabled: boolean;
}

class MemoryManager {
  private static instance: MemoryManager;
  private memoryUsageHistory: MemoryUsage[] = [];
  private resourceAllocations: Map<string, ResourceAllocation> = new Map();
  private cleanupCallbacks: Map<string, () => void> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private config: MemoryConfig;
  private componentCaches: Map<string, Map<string, any>> = new Map();
  private eventListenerRegistry: Map<string, Set<EventListener>> = new Map();

  private constructor() {
    this.config = {
      maxCacheSize: 50 * 1024 * 1024, // 50MB
      maxEventListeners: 100,
      cleanupInterval: 30000, // 30 seconds
      leakThreshold: 100 * 1024 * 1024, // 100MB
      gcForceThreshold: 200 * 1024 * 1024, // 200MB
      monitoringEnabled: true
    };

    this.startMonitoring();
  }

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  /**
   * Start comprehensive memory monitoring
   */
  private startMonitoring(): void {
    if (!this.config.monitoringEnabled || typeof window === 'undefined') return;

    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
      this.performCleanup();
      this.detectMemoryLeaks();
    }, this.config.cleanupInterval);
  }

  /**
   * Check current memory usage and track trends
   */
  private checkMemoryUsage(): void {
    if (typeof performance === 'undefined' || !performance.memory) return;

    const memory = (performance as any).memory;
    const usage: MemoryUsage = {
      component: 'system',
      timestamp: Date.now(),
      heapUsed: memory.usedJSHeapSize,
      heapTotal: memory.totalJSHeapSize,
      external: memory.usedJSHeapSize, // Approximation
      arrayBuffers: 0, // Not directly available
      leakRisk: this.calculateLeakRisk(memory.usedJSHeapSize)
    };

    this.memoryUsageHistory.push(usage);

    // Keep only last 100 entries
    if (this.memoryUsageHistory.length > 100) {
      this.memoryUsageHistory = this.memoryUsageHistory.slice(-100);
    }

    // Force garbage collection if threshold exceeded
    if (usage.heapUsed > this.config.gcForceThreshold) {
      this.forceGarbageCollection();
    }
  }

  /**
   * Calculate memory leak risk based on usage patterns
   */
  private calculateLeakRisk(currentUsage: number): 'low' | 'medium' | 'high' {
    if (this.memoryUsageHistory.length < 10) return 'low';

    const recent = this.memoryUsageHistory.slice(-10);
    const trend = recent[recent.length - 1].heapUsed - recent[0].heapUsed;
    const averageIncrease = trend / recent.length;

    if (currentUsage > this.config.leakThreshold) return 'high';
    if (averageIncrease > 5 * 1024 * 1024) return 'medium'; // 5MB increase per interval
    return 'low';
  }

  /**
   * Detect and report memory leaks
   */
  private detectMemoryLeaks(): void {
    const recent = this.memoryUsageHistory.slice(-20);
    if (recent.length < 20) return;

    // Check for consistent memory growth
    const growthTrend = recent.filter((usage, index) => {
      if (index === 0) return false;
      return usage.heapUsed > recent[index - 1].heapUsed;
    });

    if (growthTrend.length > 15) { // 75% of recent entries show growth
      console.warn('🚨 Memory leak detected - consistent growth pattern');
      this.reportMemoryLeak();
    }

    // Check for excessive resource allocations
    const allocatedResources = Array.from(this.resourceAllocations.values());
    const uncleanedResources = allocatedResources.filter(r => !r.cleaned);

    if (uncleanedResources.length > 50) {
      console.warn('🚨 Resource leak detected - uncleaned allocations:', uncleanedResources.length);
    }
  }

  /**
   * Report memory leak with diagnostics
   */
  private reportMemoryLeak(): void {
    const currentUsage = this.getCurrentMemoryUsage();
    const topComponents = this.getTopMemoryConsumers();

    const report = {
      timestamp: new Date().toISOString(),
      currentUsage,
      topComponents,
      totalAllocations: this.resourceAllocations.size,
      uncleanedAllocations: Array.from(this.resourceAllocations.values()).filter(r => !r.cleaned).length
    };

    console.error('Memory Leak Report:', report);

    // Could integrate with monitoring service here
    if (typeof window !== 'undefined' && (window as any).analytics) {
      (window as any).analytics.track('memory_leak_detected', report);
    }
  }

  /**
   * Get current memory usage statistics
   */
  getCurrentMemoryUsage(): MemoryUsage | null {
    if (this.memoryUsageHistory.length === 0) return null;
    return this.memoryUsageHistory[this.memoryUsageHistory.length - 1];
  }

  /**
   * Get top memory consuming components
   */
  getTopMemoryConsumers(): { component: string; allocations: number; uncleaned: number }[] {
    const componentStats = new Map<string, { allocations: number; uncleaned: number }>();

    this.resourceAllocations.forEach(allocation => {
      const current = componentStats.get(allocation.component) || { allocations: 0, uncleaned: 0 };
      current.allocations++;
      if (!allocation.cleaned) current.uncleaned++;
      componentStats.set(allocation.component, current);
    });

    return Array.from(componentStats.entries())
      .map(([component, stats]) => ({ component, ...stats }))
      .sort((a, b) => b.allocations - a.allocations)
      .slice(0, 10);
  }

  /**
   * Register a resource allocation for tracking
   */
  registerResource(
    componentName: string,
    type: ResourceAllocation['type'],
    cleanupCallback: () => void,
    priority: ResourceAllocation['priority'] = 'medium'
  ): string {
    const id = `${componentName}-${type}-${Date.now()}-${Math.random()}`;

    const allocation: ResourceAllocation = {
      id,
      type,
      component: componentName,
      allocated: Date.now(),
      cleaned: false,
      priority
    };

    this.resourceAllocations.set(id, allocation);
    this.cleanupCallbacks.set(id, cleanupCallback);

    return id;
  }

  /**
   * Clean up a specific resource
   */
  cleanupResource(id: string): void {
    const allocation = this.resourceAllocations.get(id);
    const cleanup = this.cleanupCallbacks.get(id);

    if (allocation && cleanup) {
      try {
        cleanup();
        allocation.cleaned = true;
        this.cleanupCallbacks.delete(id);
      } catch (error) {
        console.error(`Failed to cleanup resource ${id}:`, error);
      }
    }
  }

  /**
   * Perform automatic cleanup of expired resources
   */
  private performCleanup(): void {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 5 * 60 * 1000; // 5 minutes

    this.resourceAllocations.forEach((allocation, id) => {
      if (!allocation.cleaned && (now - allocation.allocated) > CLEANUP_THRESHOLD) {
        console.warn(`Auto-cleaning expired resource: ${id}`);
        this.cleanupResource(id);
      }
    });

    // Clean up component caches
    this.cleanupComponentCaches();
  }

  /**
   * Clean up component caches based on usage
   */
  private cleanupComponentCaches(): void {
    let totalCacheSize = 0;

    this.componentCaches.forEach((cache, component) => {
      cache.forEach((value, key) => {
        totalCacheSize += this.estimateObjectSize(value);
      });
    });

    if (totalCacheSize > this.config.maxCacheSize) {
      // Remove oldest entries from largest caches
      const sortedCaches = Array.from(this.componentCaches.entries())
        .sort(([, a], [, b]) => b.size - a.size);

      for (const [component, cache] of sortedCaches) {
        if (totalCacheSize <= this.config.maxCacheSize * 0.8) break;

        const entriesToRemove = Math.ceil(cache.size * 0.3);
        const entries = Array.from(cache.entries());

        for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
          cache.delete(entries[i][0]);
          totalCacheSize -= this.estimateObjectSize(entries[i][1]);
        }
      }
    }
  }

  /**
   * Estimate object size in bytes (approximation)
   */
  private estimateObjectSize(obj: any): number {
    if (obj === null || obj === undefined) return 0;
    if (typeof obj === 'string') return obj.length * 2;
    if (typeof obj === 'number') return 8;
    if (typeof obj === 'boolean') return 4;
    if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + this.estimateObjectSize(item), 0);
    if (typeof obj === 'object') {
      return Object.keys(obj).reduce((sum, key) =>
        sum + key.length * 2 + this.estimateObjectSize(obj[key]), 0);
    }
    return 0;
  }

  /**
   * Force garbage collection (if available)
   */
  private forceGarbageCollection(): void {
    if (typeof window !== 'undefined' && (window as any).gc) {
      console.log('🗑️ Forcing garbage collection');
      (window as any).gc();
    }
  }

  /**
   * Get or create component cache
   */
  getComponentCache<T>(componentName: string): Map<string, T> {
    if (!this.componentCaches.has(componentName)) {
      this.componentCaches.set(componentName, new Map());
    }
    return this.componentCaches.get(componentName)!;
  }

  /**
   * Clear all caches and cleanup resources
   */
  clearAll(): void {
    // Cleanup all resources
    this.resourceAllocations.forEach((_, id) => {
      this.cleanupResource(id);
    });

    // Clear caches
    this.componentCaches.clear();
    this.memoryUsageHistory = [];

    console.log('🧹 Memory manager cleared all caches and resources');
  }

  /**
   * Get memory statistics for monitoring
   */
  getMemoryStats() {
    const current = this.getCurrentMemoryUsage();
    const topConsumers = this.getTopMemoryConsumers();

    return {
      current,
      topConsumers,
      totalAllocations: this.resourceAllocations.size,
      uncleanedAllocations: Array.from(this.resourceAllocations.values()).filter(r => !r.cleaned).length,
      cacheSize: this.componentCaches.size,
      config: this.config
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<MemoryConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Cleanup when destroying the manager
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.clearAll();
  }
}

// Export singleton instance
export const memoryManager = MemoryManager.getInstance();

// React hooks for memory optimization
export function useMemoryOptimizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList,
  componentName: string
): T {
  const resourceId = useRef<string>();

  const optimizedCallback = useCallback((...args: any[]) => {
    return callback(...args);
  }, deps);

  useEffect(() => {
    resourceId.current = memoryManager.registerResource(
      componentName,
      'event-listener',
      () => {
        // Cleanup callback
      },
      'medium'
    );

    return () => {
      if (resourceId.current) {
        memoryManager.cleanupResource(resourceId.current);
      }
    };
  }, [componentName]);

  return optimizedCallback as T;
}

export function useMemoryOptimizedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  componentName: string,
  cacheKey?: string
): T {
  const cache = memoryManager.getComponentCache<T>(componentName);

  return useMemo(() => {
    const key = cacheKey || JSON.stringify(deps);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const value = factory();
    cache.set(key, value);

    return value;
  }, deps);
}

export function useResourceCleanup(componentName: string) {
  const resourceIds = useRef<string[]>([]);

  const registerResource = useCallback((
    type: ResourceAllocation['type'],
    cleanupCallback: () => void,
    priority: ResourceAllocation['priority'] = 'medium'
  ) => {
    const id = memoryManager.registerResource(componentName, type, cleanupCallback, priority);
    resourceIds.current.push(id);
    return id;
  }, [componentName]);

  useEffect(() => {
    return () => {
      // Cleanup all registered resources when component unmounts
      resourceIds.current.forEach(id => {
        memoryManager.cleanupResource(id);
      });
      resourceIds.current = [];
    };
  }, []);

  return { registerResource };
}

// Memory monitoring hook
export function useMemoryMonitoring(componentName: string) {
  const [memoryStats, setMemoryStats] = useState<ReturnType<typeof memoryManager.getMemoryStats> | null>(null);

  useEffect(() => {
    const updateStats = () => {
      setMemoryStats(memoryManager.getMemoryStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryStats;
}

export default MemoryManager;