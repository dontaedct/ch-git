/**
 * @fileoverview Performance Monitoring Types - Phase 7.2
 */

export interface PerformanceMetrics {
  timestamp: Date;
  api: {
    responseTime: number;
    statusCode: number;
    endpoint: string;
    method: string;
  };
  database: {
    queryTime: number;
    queryType: string;
    connectionPool: {
      active: number;
      idle: number;
      total: number;
    };
  };
  cdn: {
    assetUrl: string;
    loadTime: number;
    cacheHit: boolean;
    fileSize: number;
  };
  userExperience: {
    pageLoadTime: number;
    firstContentfulPaint: number;
    pageUrl: string;
    deviceType: string;
  };
  system: {
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
    };
    cpuUsage: number;
    uptime: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: 'api_slow' | 'database_slow' | 'cdn_slow' | 'ux_poor' | 'system_high_load';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: Date;
  resolved: boolean;
}

export interface PerformanceThresholds {
  api: {
    responseTime: { warning: number; critical: number };
    errorRate: { warning: number; critical: number };
  };
  database: {
    queryTime: { warning: number; critical: number };
  };
  cdn: {
    loadTime: { warning: number; critical: number };
  };
  userExperience: {
    pageLoadTime: { warning: number; critical: number };
  };
  system: {
    memoryUsage: { warning: number; critical: number };
    cpuUsage: { warning: number; critical: number };
  };
}
