/**
 * HT-021 Foundation Architecture: Performance Types
 * 
 * Core interfaces for performance monitoring and optimization
 * Part of the foundation layer that supports all Hero Tasks
 */

export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay  
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  bundleSize: number;
  pageLoadTime: number;
}

export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

export interface BundleMetrics {
  initialBundle: number;
  totalJavaScript: number;
  mainChunk: number;
  vendorChunk: number;
  asyncChunks: number[];
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  evictionRate: number;
  size: number;
  maxSize: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: keyof PerformanceMetrics;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  message: string;
}

export interface PerformanceConfig {
  thresholds: PerformanceThresholds;
  bundleTargets: BundleMetrics;
  cacheConfig: {
    maxSize: number;
    ttl: number;
    strategy: 'lru' | 'fifo' | 'lfu';
  };
  monitoring: {
    enabled: boolean;
    sampleRate: number;
    reportingInterval: number;
  };
}
