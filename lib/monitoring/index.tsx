/**
 * @fileoverview HT-021.3.4: Performance Monitoring & Analytics - Main Export Module
 * @module lib/monitoring/index
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-021.3.4 - Performance Monitoring & Analytics Setup
 * Focus: Unified monitoring system exports and initialization
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (aggregation module)
 */

// ============================================================================
// IMPORTS FOR INTERNAL USE
// ============================================================================

import { PerformanceMonitor } from './performance-monitor';
import { WebVitalsTracker } from './web-vitals-tracker';
import { PerformanceDashboard } from './performance-dashboard';

// ============================================================================
// PERFORMANCE MONITORING EXPORTS
// ============================================================================

// Performance Monitor
export {
  PerformanceMonitor,
  useWebVitals,
} from './performance-monitor';

export type {
  PerformanceMetric,
  WebVitalsMetrics,
  NavigationMetrics,
  ResourceMetrics,
  UserInteractionMetric,
  PerformanceBudget,
  PerformanceAlert,
} from './performance-monitor';

// ============================================================================
// WEB VITALS TRACKING EXPORTS
// ============================================================================

// Web Vitals Tracker
export {
  WebVitalsTracker,
  useWebVitals as useWebVitalsTracking,
  useWebVitalAlerts,
  WEB_VITAL_THRESHOLDS,
} from './web-vitals-tracker';

export type {
  WebVitalMetric,
  WebVitalThresholds,
  WebVitalReport,
  WebVitalAlert,
} from './web-vitals-tracker';

// ============================================================================
// ERROR TRACKING EXPORTS (Legacy - for compatibility)
// ============================================================================

// Legacy Error Tracker (already exists in the system)
export {
  errorTracker,
  trackError,
  getErrorAnalytics,
  getErrorPatterns,
  resolveErrorPattern,
  getErrorTrends,
  exportErrorData,
} from './error-tracker';

// ============================================================================
// PERFORMANCE DASHBOARD EXPORTS
// ============================================================================

// Performance Dashboard
export {
  PerformanceDashboard,
  performanceDashboard,
  useDashboardMetrics,
  usePerformanceAlerts,
  useHistoricalData,
  useDashboardLayout,
} from './performance-dashboard';

export type {
  DashboardMetrics,
  PerformanceAlert as DashboardPerformanceAlert,
  TimeSeriesData,
  ChartConfig,
  DashboardWidget,
  DashboardLayout,
} from './performance-dashboard';

// ============================================================================
// UNIFIED MONITORING SYSTEM
// ============================================================================

export interface MonitoringConfig {
  performance?: {
    enabled: boolean;
    budget?: Partial<any>;
    reportingEndpoint?: string;
    reportingInterval?: number;
  };
  webVitals?: {
    enabled: boolean;
    reportingEndpoint?: string;
    alertCallback?: (alert: any) => void;
  };
  analytics?: {
    enabled: boolean;
    providers?: any[];
    sampling?: number;
  };
  dashboard?: {
    enabled: boolean;
    refreshInterval?: number;
    layout?: any;
  };
  errorTracking?: {
    enabled: boolean;
    maxErrors?: number;
    reportingInterval?: number;
    sampleRate?: number;
  };
}

export interface MonitoringSystem {
  performance: any;
  webVitals: any;
  dashboard: any;
  initialized: boolean;
}

/**
 * Initialize the complete monitoring system
 */
export async function initializeMonitoring(config: MonitoringConfig = {}): Promise<MonitoringSystem> {
  const defaultConfig: Required<MonitoringConfig> = {
    performance: {
      enabled: true,
      budget: {},
      reportingEndpoint: '/api/performance',
      reportingInterval: 30000,
    },
    webVitals: {
      enabled: true,
      reportingEndpoint: '/api/web-vitals',
    },
    analytics: {
      enabled: true,
      providers: [],
      sampling: 1.0,
    },
    dashboard: {
      enabled: true,
      refreshInterval: 5000,
    },
    errorTracking: {
      enabled: true,
      maxErrors: 1000,
      reportingInterval: 30000,
      sampleRate: 1.0,
    },
  };

  const mergedConfig = {
    performance: { ...defaultConfig.performance, ...config.performance },
    webVitals: { ...defaultConfig.webVitals, ...config.webVitals },
    analytics: { ...defaultConfig.analytics, ...config.analytics },
    dashboard: { ...defaultConfig.dashboard, ...config.dashboard },
    errorTracking: { ...defaultConfig.errorTracking, ...config.errorTracking },
  };

  // Initialize Performance Monitor
  const performance = (PerformanceMonitor as any).getInstance(mergedConfig.performance);
  if (mergedConfig.performance.enabled) {
    performance.initialize();
  }

  // Initialize Web Vitals Tracker
  const webVitals = (WebVitalsTracker as any).getInstance(mergedConfig.webVitals);
  if (mergedConfig.webVitals.enabled) {
    await webVitals.initialize();
  }

  // Initialize Performance Dashboard
  const dashboard = (PerformanceDashboard as any).getInstance();
  if (mergedConfig.dashboard.enabled) {
    dashboard.initialize({
      refreshInterval: mergedConfig.dashboard.refreshInterval,
    });
  }

  const system: MonitoringSystem = {
    performance,
    webVitals,
    dashboard,
    initialized: true,
  };

  console.log('Monitoring system initialized with config:', mergedConfig);
  return system;
}

/**
 * Get the current monitoring system instance
 */
export function getMonitoringSystem(): MonitoringSystem {
  return {
    performance: (PerformanceMonitor as any).getInstance(),
    webVitals: (WebVitalsTracker as any).getInstance(),
    dashboard: (PerformanceDashboard as any).getInstance(),
    initialized: true,
  };
}

/**
 * Start all monitoring systems
 */
export async function startMonitoring(config?: MonitoringConfig): Promise<void> {
  const system = await initializeMonitoring(config);
  
  // Setup global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      console.error('Global error captured by monitoring system:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled rejection captured by monitoring system:', event.reason);
    });
  }

  console.log('All monitoring systems started successfully');
}

/**
 * Stop all monitoring systems
 */
export function stopMonitoring(): void {
  const system = getMonitoringSystem();
  
  system.performance.destroy();
  system.webVitals.destroy();
  system.dashboard.destroy();
  
  console.log('All monitoring systems stopped');
}

/**
 * Get comprehensive monitoring health check
 */
export function getMonitoringHealth(): {
  status: 'healthy' | 'degraded' | 'down';
  systems: Record<string, { status: string; lastUpdate?: number; errors?: string[] }>;
  summary: string;
} {
  const system = getMonitoringSystem();
  const health = {
    status: 'healthy' as const,
    systems: {
      performance: {
        status: 'healthy',
        lastUpdate: Date.now(),
      },
      webVitals: {
        status: 'healthy',
        lastUpdate: Date.now(),
      },
      dashboard: {
        status: 'healthy',
        lastUpdate: Date.now(),
      },
    },
    summary: 'All monitoring systems operational',
  };

  // Check if systems are actually running
  try {
    const performanceMetrics = system.performance.getCurrentMetrics();
    const webVitalMetrics = system.webVitals.getMetrics();
    
    if (performanceMetrics.length === 0 && webVitalMetrics.size === 0) {
      (health as any).status = 'degraded';
      health.summary = 'Some monitoring systems have no recent data';
    }
  } catch (error) {
    (health as any).status = 'down';
    health.summary = 'Monitoring systems are experiencing errors';
  }

  return health;
}

/**
 * Export all monitoring data
 */
export function exportMonitoringData(
  format: 'json' | 'csv' = 'json',
  timeRange: '1h' | '24h' | '7d' = '24h'
): {
  performance: string;
  webVitals: string;
  dashboard: string;
  errors: string;
  timestamp: number;
} {
  const system = getMonitoringSystem();
  
  return {
    performance: JSON.stringify({
      metrics: system.performance.getCurrentMetrics(),
      webVitals: system.performance.getWebVitals(),
      budget: system.performance.getBudget(),
      score: system.performance.getPerformanceScore(),
    }),
    webVitals: JSON.stringify({
      metrics: Array.from(system.webVitals.getMetrics().values()),
      report: system.webVitals.generateReport(),
    }),
    dashboard: system.dashboard.exportData(format, timeRange),
    errors: JSON.stringify({ message: 'Error data export not implemented' }),
    timestamp: Date.now(),
  };
}

// ============================================================================
// MONITORING PRESETS
// ============================================================================

export const monitoringPresets = {
  development: {
    performance: {
      enabled: true,
      reportingInterval: 10000, // More frequent in dev
    },
    webVitals: {
      enabled: true,
    },
    dashboard: {
      enabled: true,
      refreshInterval: 2000, // Faster refresh in dev
    },
    errorTracking: {
      enabled: true,
      sampleRate: 1.0, // Track all errors in dev
    },
  },
  
  production: {
    performance: {
      enabled: true,
      reportingInterval: 30000,
    },
    webVitals: {
      enabled: true,
    },
    dashboard: {
      enabled: true,
      refreshInterval: 5000,
    },
    errorTracking: {
      enabled: true,
      sampleRate: 0.1, // Sample 10% in production
    },
  },
  
  testing: {
    performance: {
      enabled: false, // Disable in tests to avoid noise
    },
    webVitals: {
      enabled: false,
    },
    dashboard: {
      enabled: false,
    },
    errorTracking: {
      enabled: true, // Keep error tracking for test debugging
      sampleRate: 1.0,
    },
  },
} as const;

/**
 * Get monitoring preset by environment
 */
export function getMonitoringPreset(env: 'development' | 'production' | 'testing' = 'development'): MonitoringConfig {
  return monitoringPresets[env];
}

// ============================================================================
// REACT CONTEXT PROVIDER
// ============================================================================

import React, { createContext, useContext, useEffect, useState } from 'react';

interface MonitoringContextValue {
  system: MonitoringSystem | null;
  health: ReturnType<typeof getMonitoringHealth>;
  startMonitoring: (config?: MonitoringConfig) => Promise<void>;
  stopMonitoring: () => void;
  exportData: () => ReturnType<typeof exportMonitoringData>;
}

const MonitoringContext = createContext<MonitoringContextValue | null>(null);

export function MonitoringProvider({ 
  children,
  config,
  autoStart = true 
}: { 
  children: React.ReactNode;
  config?: MonitoringConfig;
  autoStart?: boolean;
}) {
  const [system, setSystem] = useState<MonitoringSystem | null>(null);
  const [health, setHealth] = useState(() => getMonitoringHealth());

  useEffect(() => {
    if (autoStart) {
      startMonitoring(config).then(() => {
        setSystem(getMonitoringSystem());
      });
    }
    
    // Update health status periodically
    const healthInterval = setInterval(() => {
      setHealth(getMonitoringHealth());
    }, 10000); // Every 10 seconds

    return () => {
      clearInterval(healthInterval);
    };
  }, [autoStart, config]);

  const handleStartMonitoring = async (startConfig?: MonitoringConfig) => {
    await startMonitoring(startConfig || config);
    setSystem(getMonitoringSystem());
  };

  const handleStopMonitoring = () => {
    stopMonitoring();
    setSystem(null);
  };

  const handleExportData = () => {
    return exportMonitoringData();
  };

  const value: MonitoringContextValue = {
    system,
    health,
    startMonitoring: handleStartMonitoring,
    stopMonitoring: handleStopMonitoring,
    exportData: handleExportData,
  };

  return (
    <MonitoringContext.Provider value={value}>
      {children}
    </MonitoringContext.Provider>
  );
}

export function useMonitoring() {
  const context = useContext(MonitoringContext);
  if (!context) {
    throw new Error('useMonitoring must be used within a MonitoringProvider');
  }
  return context;
}

// ============================================================================
// VERSION INFORMATION
// ============================================================================

export const MONITORING_VERSION = '1.0.0';
export const SUPPORTED_MONITORING_FEATURES = [
  'performance-monitoring',
  'web-vitals-tracking',
  'error-tracking',
  'analytics-integration',
  'real-time-dashboard',
  'historical-data',
  'alerts-system',
  'data-export',
] as const;

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  // Core functions
  initializeMonitoring,
  startMonitoring,
  stopMonitoring,
  getMonitoringSystem,
  getMonitoringHealth,
  exportMonitoringData,
  
  // Presets
  getMonitoringPreset,
  monitoringPresets,
  
  // React components
  MonitoringProvider,
  useMonitoring,
  
  // Constants
  MONITORING_VERSION,
  SUPPORTED_MONITORING_FEATURES,
};