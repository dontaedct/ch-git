/**
 * @fileoverview HT-022.2.3: Basic Performance Monitoring System
 * @module components/ui/atomic/performance
 * @author Agency Component System
 * @version 1.0.0
 *
 * PERFORMANCE MONITORING: Component render times and optimization
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  componentRenderTimes: Record<string, number[]>;
  totalRenderTime: number;
  renderCount: number;
  slowComponents: string[];
  lastMeasurement: Date | null;
}

interface PerformanceContextValue {
  metrics: PerformanceMetrics;
  measureRender: (componentName: string, renderTime: number) => void;
  getAverageRenderTime: (componentName: string) => number;
  getSlowComponents: (threshold?: number) => string[];
  resetMetrics: () => void;
  isMonitoringEnabled: boolean;
  toggleMonitoring: () => void;
}

const initialMetrics: PerformanceMetrics = {
  componentRenderTimes: {},
  totalRenderTime: 0,
  renderCount: 0,
  slowComponents: [],
  lastMeasurement: null
};

const PerformanceContext = createContext<PerformanceContextValue | undefined>(undefined);

interface PerformanceProviderProps {
  children: React.ReactNode;
  enableInProduction?: boolean;
}

export function PerformanceProvider({
  children,
  enableInProduction = false
}: PerformanceProviderProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(initialMetrics);
  const [isMonitoringEnabled, setIsMonitoringEnabled] = useState(() => {
    return process.env.NODE_ENV === 'development' || enableInProduction;
  });

  const measureRender = useCallback((componentName: string, renderTime: number) => {
    if (!isMonitoringEnabled) return;

    setMetrics(prev => {
      const componentTimes = prev.componentRenderTimes[componentName] || [];
      const newTimes = [...componentTimes, renderTime].slice(-10); // Keep last 10 measurements

      const newMetrics = {
        ...prev,
        componentRenderTimes: {
          ...prev.componentRenderTimes,
          [componentName]: newTimes
        },
        totalRenderTime: prev.totalRenderTime + renderTime,
        renderCount: prev.renderCount + 1,
        lastMeasurement: new Date()
      };

      // Update slow components list
      const slowComponents = Object.entries(newMetrics.componentRenderTimes)
        .filter(([, times]) => {
          const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
          return avgTime > 200; // 200ms threshold
        })
        .map(([name]) => name);

      newMetrics.slowComponents = slowComponents;

      return newMetrics;
    });
  }, [isMonitoringEnabled]);

  const getAverageRenderTime = useCallback((componentName: string): number => {
    const times = metrics.componentRenderTimes[componentName];
    if (!times || times.length === 0) return 0;
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }, [metrics.componentRenderTimes]);

  const getSlowComponents = useCallback((threshold: number = 200): string[] => {
    return Object.entries(metrics.componentRenderTimes)
      .filter(([, times]) => {
        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        return avgTime > threshold;
      })
      .map(([name]) => name);
  }, [metrics.componentRenderTimes]);

  const resetMetrics = useCallback(() => {
    setMetrics(initialMetrics);
  }, []);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoringEnabled(prev => !prev);
  }, []);

  const value: PerformanceContextValue = {
    metrics,
    measureRender,
    getAverageRenderTime,
    getSlowComponents,
    resetMetrics,
    isMonitoringEnabled,
    toggleMonitoring
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
}

// Performance measurement hook
export function useRenderPerformance(componentName: string) {
  const { measureRender, isMonitoringEnabled } = usePerformance();

  useEffect(() => {
    if (!isMonitoringEnabled) return;

    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      measureRender(componentName, renderTime);
    };
  });

  return { isMonitoringEnabled };
}

// Higher-order component for performance monitoring
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const PerformanceWrappedComponent = (props: P) => {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
    useRenderPerformance(displayName);

    return <WrappedComponent {...props} />;
  };

  PerformanceWrappedComponent.displayName = `withPerformanceMonitoring(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return PerformanceWrappedComponent;
}

// Performance metrics display component (development only)
export function PerformanceMetrics() {
  const { metrics, isMonitoringEnabled, resetMetrics, getAverageRenderTime } = usePerformance();

  if (!isMonitoringEnabled || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-lg text-xs max-w-sm z-50">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Performance Metrics</h3>
        <button
          onClick={resetMetrics}
          className="text-blue-600 hover:text-blue-800"
        >
          Reset
        </button>
      </div>

      <div className="space-y-1">
        <p>Total Renders: {metrics.renderCount}</p>
        <p>Slow Components: {metrics.slowComponents.length}</p>

        {metrics.slowComponents.length > 0 && (
          <div>
            <p className="font-medium text-red-600 mt-2">Slow Components (&gt;200ms):</p>
            {metrics.slowComponents.map(name => (
              <p key={name} className="text-red-600">
                {name}: {getAverageRenderTime(name).toFixed(1)}ms avg
              </p>
            ))}
          </div>
        )}

        {Object.entries(metrics.componentRenderTimes).length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer font-medium">All Components</summary>
            <div className="mt-1 space-y-1">
              {Object.entries(metrics.componentRenderTimes).map(([name, times]) => {
                const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
                const isSlowComponent = avgTime > 200;
                return (
                  <p
                    key={name}
                    className={isSlowComponent ? 'text-red-600' : 'text-gray-600'}
                  >
                    {name}: {avgTime.toFixed(1)}ms ({times.length} samples)
                  </p>
                );
              })}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

// Performance benchmark utilities
export function benchmarkComponent(
  component: () => JSX.Element,
  runs: number = 100
): Promise<{ averageTime: number; times: number[] }> {
  return new Promise((resolve) => {
    const times: number[] = [];
    let currentRun = 0;

    const runBenchmark = () => {
      const startTime = performance.now();

      // Simulate component rendering
      const element = component();

      const endTime = performance.now();
      times.push(endTime - startTime);
      currentRun++;

      if (currentRun < runs) {
        requestAnimationFrame(runBenchmark);
      } else {
        const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        resolve({ averageTime, times });
      }
    };

    runBenchmark();
  });
}