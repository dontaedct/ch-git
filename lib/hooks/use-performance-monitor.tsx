/**
 * Performance Monitoring Hook
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Comprehensive performance monitoring for components with <100ms render targets
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

// ============================================================================
// PERFORMANCE MONITORING TYPES
// ============================================================================

export interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateTime: number;
  interactionLatency: number;
  memoryUsage?: number;
  componentSize?: number;
}

export interface PerformanceConfig {
  enabled?: boolean;
  componentName?: string;
  budget?: number; // Performance budget in milliseconds
  trackRenderTime?: boolean;
  trackInteractionLatency?: boolean;
  trackMemoryUsage?: boolean;
  onBudgetExceeded?: (metrics: PerformanceMetrics, budget: number) => void;
  ref?: React.RefObject<HTMLElement>;
}

export interface PerformanceData {
  metrics: PerformanceMetrics;
  isWithinBudget: boolean;
  budgetUtilization: number; // Percentage of budget used
  warnings: string[];
  recommendations: string[];
}

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

const DEFAULT_PERFORMANCE_BUDGET = 100; // 100ms target from HT-021 requirements
const INTERACTION_BUDGET = 16; // 16ms for smooth 60fps interactions
const MEMORY_WARNING_THRESHOLD = 50 * 1024 * 1024; // 50MB

// ============================================================================
// PERFORMANCE MONITORING UTILITIES
// ============================================================================

/**
 * High-precision timer for performance measurements
 */
class PerformanceTimer {
  private startTime: number = 0;
  private endTime: number = 0;
  
  start(): void {
    this.startTime = performance.now();
  }
  
  end(): number {
    this.endTime = performance.now();
    return this.endTime - this.startTime;
  }
  
  getDuration(): number {
    return this.endTime - this.startTime;
  }
  
  static measure<T>(fn: () => T): { result: T; duration: number } {
    const timer = new PerformanceTimer();
    timer.start();
    const result = fn();
    const duration = timer.end();
    return { result, duration };
  }
}

/**
 * Memory usage tracker
 */
function getMemoryUsage(): number | undefined {
  if ('memory' in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return undefined;
}

/**
 * Component size estimation
 */
function estimateComponentSize(element: HTMLElement | null): number {
  if (!element) return 0;
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_ELEMENT,
    null
  );
  
  let nodeCount = 0;
  let node;
  
  while (node = walker.nextNode()) {
    nodeCount++;
  }
  
  return nodeCount;
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

export function usePerformanceMonitorHook(config: PerformanceConfig = {}): PerformanceData {
  const {
    enabled = process.env.NODE_ENV === 'development',
    componentName = 'Component',
    budget = DEFAULT_PERFORMANCE_BUDGET,
    trackRenderTime = true,
    trackInteractionLatency = true,
    trackMemoryUsage = false,
    onBudgetExceeded,
    ref
  } = config;
  
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateTime: 0,
    interactionLatency: 0,
    memoryUsage: undefined,
    componentSize: undefined
  });
  
  const timers = useRef({
    mount: new PerformanceTimer(),
    render: new PerformanceTimer(),
    update: new PerformanceTimer(),
    interaction: new PerformanceTimer()
  });
  
  const renderCount = useRef(0);
  const mountComplete = useRef(false);
  const lastUpdateTime = useRef(0);
  
  // Start mount timer on first render
  useEffect(() => {
    if (!enabled) return;
    
    if (!mountComplete.current) {
      timers.current.mount.start();
    }
  }, [enabled]);
  
  // Track render performance
  useEffect(() => {
    if (!enabled || !trackRenderTime) return;
    
    timers.current.render.start();
    renderCount.current++;
    
    // Use scheduler to measure after render completion
    const measureRender = () => {
      const renderTime = timers.current.render.end();
      
      setMetrics(prev => {
        const newMetrics = {
          ...prev,
          renderTime,
          updateTime: mountComplete.current ? renderTime : prev.updateTime
        };
        
        // Complete mount timing on first render
        if (!mountComplete.current) {
          newMetrics.mountTime = timers.current.mount.end();
          mountComplete.current = true;
        }
        
        return newMetrics;
      });
      
      lastUpdateTime.current = performance.now();
    };
    
    // Use MessageChannel for more accurate timing
    if (typeof MessageChannel !== 'undefined') {
      const channel = new MessageChannel();
      channel.port2.onmessage = measureRender;
      channel.port1.postMessage(null);
    } else {
      setTimeout(measureRender, 0);
    }
  });
  
  // Track memory usage periodically
  useEffect(() => {
    if (!enabled || !trackMemoryUsage) return;
    
    const interval = setInterval(() => {
      const memoryUsage = getMemoryUsage();
      const componentSize = estimateComponentSize(ref?.current || null);
      
      setMetrics(prev => ({
        ...prev,
        memoryUsage,
        componentSize
      }));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [enabled, trackMemoryUsage, ref]);
  
  // Interaction latency tracking
  const trackInteraction = useCallback((interactionType: string = 'click') => {
    if (!enabled || !trackInteractionLatency) return () => {};
    
    timers.current.interaction.start();
    
    return () => {
      const latency = timers.current.interaction.end();
      
      setMetrics(prev => ({
        ...prev,
        interactionLatency: latency
      }));
      
      // Warn if interaction exceeds budget
      if (latency > INTERACTION_BUDGET) {
        console.warn(
          `[Performance] ${componentName} ${interactionType} interaction took ${latency.toFixed(2)}ms ` +
          `(budget: ${INTERACTION_BUDGET}ms)`
        );
      }
    };
  }, [enabled, trackInteractionLatency, componentName]);
  
  // Performance analysis
  const analysis = useMemo(() => {
    const warnings: string[] = [];
    const recommendations: string[] = [];
    
    // Render time analysis
    if (metrics.renderTime > budget) {
      warnings.push(`Render time (${metrics.renderTime.toFixed(2)}ms) exceeds budget (${budget}ms)`);
      recommendations.push('Consider optimizing component render logic or using React.memo()');
    }
    
    if (metrics.renderTime > budget * 0.8) {
      warnings.push(`Render time approaching budget limit (${(metrics.renderTime / budget * 100).toFixed(1)}% used)`);
    }
    
    // Mount time analysis
    if (metrics.mountTime > budget * 2) {
      warnings.push(`Mount time (${metrics.mountTime.toFixed(2)}ms) is high`);
      recommendations.push('Consider lazy loading or code splitting for this component');
    }
    
    // Interaction latency analysis
    if (metrics.interactionLatency > INTERACTION_BUDGET) {
      warnings.push(`Interaction latency (${metrics.interactionLatency.toFixed(2)}ms) affects user experience`);
      recommendations.push('Optimize event handlers and consider debouncing');
    }
    
    // Memory analysis
    if (metrics.memoryUsage && metrics.memoryUsage > MEMORY_WARNING_THRESHOLD) {
      warnings.push(`High memory usage detected (${Math.round(metrics.memoryUsage / 1024 / 1024)}MB)`);
      recommendations.push('Check for memory leaks and optimize data structures');
    }
    
    // Component complexity analysis
    if (metrics.componentSize && metrics.componentSize > 100) {
      warnings.push(`Component has high DOM complexity (${metrics.componentSize} nodes)`);
      recommendations.push('Consider breaking down into smaller components');
    }
    
    // Update frequency analysis
    const updateFrequency = performance.now() - lastUpdateTime.current;
    if (updateFrequency < 16 && renderCount.current > 10) {
      warnings.push('Component updates very frequently, may cause performance issues');
      recommendations.push('Consider using useMemo, useCallback, or React.memo to reduce re-renders');
    }
    
    const isWithinBudget = metrics.renderTime <= budget;
    const budgetUtilization = (metrics.renderTime / budget) * 100;
    
    return {
      warnings,
      recommendations,
      isWithinBudget,
      budgetUtilization
    };
  }, [metrics, budget]);
  
  // Budget exceeded callback
  useEffect(() => {
    if (!analysis.isWithinBudget && onBudgetExceeded) {
      onBudgetExceeded(metrics, budget);
    }
  }, [analysis.isWithinBudget, metrics, budget, onBudgetExceeded]);
  
  // Development logging
  useEffect(() => {
    if (enabled && process.env.NODE_ENV === 'development' && renderCount.current > 0) {
      const logData = {
        component: componentName,
        renders: renderCount.current,
        renderTime: `${metrics.renderTime.toFixed(2)}ms`,
        mountTime: `${metrics.mountTime.toFixed(2)}ms`,
        budget: `${budget}ms`,
        utilization: `${analysis.budgetUtilization.toFixed(1)}%`,
        status: analysis.isWithinBudget ? '✅ Within budget' : '⚠️ Over budget'
      };
      
      if (renderCount.current % 10 === 0) { // Log every 10 renders
        console.group(`[Performance] ${componentName}`);
        console.table(logData);
        
        if (analysis.warnings.length > 0) {
          console.warn('Warnings:', analysis.warnings);
        }
        
        if (analysis.recommendations.length > 0) {
          console.info('Recommendations:', analysis.recommendations);
        }
        
        console.groupEnd();
      }
    }
  }, [enabled, componentName, metrics, budget, analysis]);
  
  return {
    metrics,
    isWithinBudget: analysis.isWithinBudget,
    budgetUtilization: analysis.budgetUtilization,
    warnings: analysis.warnings,
    recommendations: analysis.recommendations,
    trackInteraction
  } as PerformanceData & { trackInteraction: typeof trackInteraction };
}

// ============================================================================
// PERFORMANCE UTILITIES
// ============================================================================

/**
 * HOC for automatic performance monitoring
 */
export function withPerformanceMonitoringHook<P extends object>(
  Component: React.ComponentType<P>,
  config: Partial<PerformanceConfig> = {}
) {
  const PerformanceMonitoredComponent = (props: P) => {
    const performanceData = usePerformanceMonitorHook({
      componentName: Component.displayName || Component.name || 'Component',
      ...config
    });
    
    // Add performance data to dev tools in development
    if (process.env.NODE_ENV === 'development') {
      (PerformanceMonitoredComponent as any).__PERFORMANCE__ = performanceData;
    }
    
    return <Component {...props} />;
  };
  
  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${Component.displayName || Component.name || 'Component'})`;
  
  return PerformanceMonitoredComponent;
}

/**
 * Performance boundary component
 */
export function PerformanceBoundaryHook({
  children,
  budget = DEFAULT_PERFORMANCE_BUDGET,
  onBudgetExceeded,
  name = 'PerformanceBoundary'
}: {
  children: React.ReactNode;
  budget?: number;
  onBudgetExceeded?: (metrics: PerformanceMetrics, budget: number) => void;
  name?: string;
}) {
  const performanceData = usePerformanceMonitorHook({
    componentName: name,
    budget,
    onBudgetExceeded,
    enabled: true
  });
  
  return (
    <div data-performance-boundary={name} data-within-budget={performanceData.isWithinBudget}>
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

// Functions are already exported individually above