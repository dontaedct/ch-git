/**
 * @fileoverview Performance Monitoring Types
 * @module types/performance-monitoring
 * @author OSS Hero System
 * @version 1.0.0
 */

export interface PerformanceMetrics {
  id: string;
  timestamp: string;
  client: ClientMetrics;
  server: ServerMetrics;
  database: DatabaseMetrics;
  environment: string;
  version: string;
}

export interface ClientMetrics {
  memoryUsage: number;
  cpuUsage: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  userAgent: string;
  connectionType: string;
  pageLoadTime?: number;
  domContentLoaded?: number;
  firstPaint?: number;
  firstContentfulPaint?: number;
}

export interface ServerMetrics {
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage: {
    user: number;
    system: number;
  };
  uptime: number;
  loadAverage: number[];
  freeMemory: number;
  totalMemory: number;
  cpuCount: number;
  platform: string;
  arch: string;
}

export interface DatabaseMetrics {
  queryTime: number;
  connectionStatus: 'healthy' | 'error' | 'warning';
  errorCount: number;
  activeConnections: number;
  queryCount?: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'response_time' | 'memory_usage' | 'cpu_usage' | 'error_rate' | 'throughput';
  severity: 'low' | 'warning' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  processed?: boolean;
  processed_at?: string;
}

export interface PerformanceReport {
  id: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  summary: PerformanceSummary;
  trends: PerformanceTrend[];
  recommendations: string[];
}

export interface PerformanceSummary {
  totalMetrics: number;
  averageResponseTime: number;
  averageMemoryUsage: number;
  averageErrorRate: number;
  peakResponseTime: number;
  peakMemoryUsage: number;
  totalAlerts: number;
}

export interface PerformanceTrend {
  hour: string;
  averageResponseTime: number;
  averageMemoryUsage: number;
  metricCount: number;
}

export interface MonitoringConfig {
  collectionInterval: number;
  bufferSize: number;
  alertThresholds: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    throughput: number;
  };
  retentionDays: number;
}

export interface PerformanceDashboard {
  currentMetrics: PerformanceMetrics;
  recentAlerts: PerformanceAlert[];
  trends: PerformanceTrend[];
  healthScore: number;
  recommendations: string[];
}
