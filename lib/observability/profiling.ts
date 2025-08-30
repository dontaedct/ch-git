/**
 * Performance Profiling & Monitoring
 * 
 * Provides comprehensive performance profiling with memory tracking, 
 * execution timing, and bottleneck detection for production optimization.
 */

import { tracedOperation, getCurrentTraceId, addSpanAttributes } from './otel';
import { PerformanceMetricsCollector } from './metrics';
import { Logger } from '../logger';

const profileLogger = Logger.performance();

export interface PerformanceSnapshot {
  timestamp: number;
  memory: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
  uptime: number;
  eventLoop: number;
}

export interface ProfilerOptions {
  trackMemory?: boolean;
  trackCpu?: boolean;
  trackEventLoop?: boolean;
  sampleInterval?: number;
  maxSamples?: number;
}

export interface OperationProfile {
  name: string;
  duration: number;
  memoryDelta: number;
  cpuDelta: NodeJS.CpuUsage;
  samples: PerformanceSnapshot[];
  success: boolean;
  error?: string;
}

/**
 * Advanced performance profiler with sampling and bottleneck detection
 */
export class AdvancedProfiler {
  private snapshots: PerformanceSnapshot[] = [];
  private startSnapshot: PerformanceSnapshot | null = null;
  private intervalId: NodeJS.Timeout | null = null;
  private options: Required<ProfilerOptions>;

  constructor(options: ProfilerOptions = {}) {
    this.options = {
      trackMemory: options.trackMemory ?? true,
      trackCpu: options.trackCpu ?? true,
      trackEventLoop: options.trackEventLoop ?? true,
      sampleInterval: options.sampleInterval ?? 1000, // 1 second
      maxSamples: options.maxSamples ?? 60, // 60 samples max
    };
  }

  /**
   * Start profiling with periodic sampling
   */
  start(): void {
    this.startSnapshot = this.createSnapshot();
    this.snapshots = [this.startSnapshot];

    if (this.options.sampleInterval > 0) {
      this.intervalId = setInterval(() => {
        this.addSnapshot();
      }, this.options.sampleInterval);
    }

    profileLogger.debug('Performance profiling started', {
      options: this.options,
      traceId: getCurrentTraceId(),
    });
  }

  /**
   * Stop profiling and return results
   */
  stop(): PerformanceSnapshot[] {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Add final snapshot
    this.addSnapshot();

    const samples = [...this.snapshots];
    this.reset();

    profileLogger.debug('Performance profiling stopped', {
      sampleCount: samples.length,
      duration: samples.length > 1 ? samples[samples.length - 1].timestamp - samples[0].timestamp : 0,
      traceId: getCurrentTraceId(),
    });

    return samples;
  }

  /**
   * Reset profiler state
   */
  reset(): void {
    this.snapshots = [];
    this.startSnapshot = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Add a performance snapshot
   */
  private addSnapshot(): void {
    if (this.snapshots.length >= this.options.maxSamples) {
      // Remove oldest snapshot to maintain limit
      this.snapshots.shift();
    }

    const snapshot = this.createSnapshot();
    this.snapshots.push(snapshot);
  }

  /**
   * Create performance snapshot
   */
  private createSnapshot(): PerformanceSnapshot {
    return {
      timestamp: Date.now(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      eventLoop: this.getEventLoopDelay(),
    };
  }

  /**
   * Get event loop delay (simplified)
   */
  private getEventLoopDelay(): number {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delta = Number(process.hrtime.bigint() - start) / 1000000; // Convert to milliseconds
      return delta;
    });
    return 0; // Placeholder - would need async implementation for real measurement
  }
}

/**
 * Operation profiler for specific functions/operations
 */
export class OperationProfiler {
  private profiler: AdvancedProfiler;
  private startTime: number;
  private collector: PerformanceMetricsCollector;

  constructor(
    private operationName: string,
    options: ProfilerOptions = {}
  ) {
    this.profiler = new AdvancedProfiler(options);
    this.startTime = Date.now();
    this.collector = new PerformanceMetricsCollector(operationName);
  }

  /**
   * Start profiling the operation
   */
  start(): void {
    this.profiler.start();
    addSpanAttributes({
      'operation.profiling.enabled': true,
      'operation.profiling.start_time': this.startTime,
    });
  }

  /**
   * Finish profiling and return comprehensive results
   */
  finish(success: boolean = true, error?: string): OperationProfile {
    const samples = this.profiler.stop();
    const duration = Date.now() - this.startTime;

    // Calculate deltas
    const memoryDelta = samples.length > 1 ? 
      samples[samples.length - 1].memory.heapUsed - samples[0].memory.heapUsed : 0;
    
    const cpuDelta = samples.length > 1 ? {
      user: samples[samples.length - 1].cpu.user - samples[0].cpu.user,
      system: samples[samples.length - 1].cpu.system - samples[0].cpu.system,
    } : { user: 0, system: 0 };

    const profile: OperationProfile = {
      name: this.operationName,
      duration,
      memoryDelta,
      cpuDelta,
      samples,
      success,
      error,
    };

    // Log performance analysis
    this.analyzeAndLog(profile);

    // Record metrics
    this.collector.finish(success, error, {
      memoryDelta,
      cpuUser: cpuDelta.user,
      cpuSystem: cpuDelta.system,
      sampleCount: samples.length,
    });

    return profile;
  }

  /**
   * Analyze performance profile and log insights
   */
  private analyzeAndLog(profile: OperationProfile): void {
    const { name, duration, memoryDelta, samples } = profile;

    // Performance categorization
    const performanceLevel = 
      duration > 5000 ? 'very_slow' :
      duration > 2000 ? 'slow' :
      duration > 1000 ? 'medium' :
      'fast';

    // Memory analysis
    const memoryImpact = 
      Math.abs(memoryDelta) > 50 * 1024 * 1024 ? 'high' : // 50MB
      Math.abs(memoryDelta) > 10 * 1024 * 1024 ? 'medium' : // 10MB
      'low';

    // Sample analysis
    let maxMemoryUsage = 0;
    let avgMemoryUsage = 0;
    if (samples.length > 0) {
      maxMemoryUsage = Math.max(...samples.map(s => s.memory.heapUsed));
      avgMemoryUsage = samples.reduce((sum, s) => sum + s.memory.heapUsed, 0) / samples.length;
    }

    profileLogger.info('Operation performance analysis', {
      operation: name,
      duration,
      performanceLevel,
      memory: {
        delta: memoryDelta,
        impact: memoryImpact,
        max: maxMemoryUsage,
        average: avgMemoryUsage,
      },
      cpu: profile.cpuDelta,
      sampleCount: samples.length,
      success: profile.success,
      error: profile.error,
      traceId: getCurrentTraceId(),
    });

    // Warnings for performance issues
    if (performanceLevel === 'very_slow') {
      profileLogger.warn('Very slow operation detected', {
        operation: name,
        duration,
        traceId: getCurrentTraceId(),
      });
    }

    if (memoryImpact === 'high') {
      profileLogger.warn('High memory impact operation', {
        operation: name,
        memoryDelta,
        traceId: getCurrentTraceId(),
      });
    }
  }
}

/**
 * Database operation profiler
 */
export class DatabaseProfiler {
  /**
   * Profile a database query
   */
  static async profileQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    return tracedOperation(
      `db.query.${queryName}`,
      async (span) => {
        const profiler = new OperationProfiler(`db_query_${queryName}`, {
          trackMemory: true,
          trackCpu: false,
          sampleInterval: 100, // Sample more frequently for DB queries
        });

        profiler.start();

        try {
          span?.setAttributes({
            'db.operation': queryName,
            'db.type': 'postgresql', // or from config
            ...metadata,
          });

          const result = await queryFn();
          
          profiler.finish(true);
          
          span?.setAttributes({
            'db.success': true,
            'db.result.type': typeof result,
          });

          return result;
        } catch (error) {
          profiler.finish(false, error instanceof Error ? error.message : String(error));
          
          span?.setAttributes({
            'db.success': false,
            'db.error': error instanceof Error ? error.message : String(error),
          });

          throw error;
        }
      },
      {
        'component': 'database',
        'operation.type': 'query',
      }
    );
  }
}

/**
 * API endpoint profiler
 */
export class APIProfiler {
  /**
   * Profile an API endpoint handler
   */
  static async profileEndpoint<T>(
    method: string,
    path: string,
    handlerFn: () => Promise<T>,
    metadata: Record<string, any> = {}
  ): Promise<T> {
    return tracedOperation(
      `api.${method.toLowerCase()}.${path.replace(/[\/\{\}]/g, '_')}`,
      async (span) => {
        const profiler = new OperationProfiler(`api_${method}_${path}`, {
          trackMemory: true,
          trackCpu: true,
          sampleInterval: 500,
        });

        profiler.start();

        try {
          span?.setAttributes({
            'http.method': method,
            'http.route': path,
            'component': 'api',
            ...metadata,
          });

          const result = await handlerFn();
          
          profiler.finish(true);
          
          return result;
        } catch (error) {
          profiler.finish(false, error instanceof Error ? error.message : String(error));
          throw error;
        }
      }
    );
  }
}

/**
 * Real-time performance monitor
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null;
  private isMonitoring = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start real-time monitoring
   */
  startMonitoring(intervalMs: number = 30000): void { // 30 seconds
    if (this.isMonitoring) {
      profileLogger.warn('Performance monitoring already started');
      return;
    }

    this.isMonitoring = true;
    
    this.monitorInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);

    profileLogger.info('Real-time performance monitoring started', {
      interval: intervalMs,
    });
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.isMonitoring = false;
    profileLogger.info('Real-time performance monitoring stopped');
  }

  /**
   * Collect and log system metrics
   */
  private collectSystemMetrics(): void {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();
    
    // Calculate percentages
    const memoryUsagePercent = (memory.heapUsed / memory.heapTotal) * 100;
    
    profileLogger.info('System performance metrics', {
      timestamp: new Date().toISOString(),
      memory: {
        used: memory.heapUsed,
        total: memory.heapTotal,
        usagePercent: memoryUsagePercent,
        external: memory.external,
        rss: memory.rss,
      },
      cpu,
      uptime: process.uptime(),
    });

    // Alerts for concerning metrics
    if (memoryUsagePercent > 90) {
      profileLogger.error('Critical memory usage detected', {
        usagePercent: memoryUsagePercent,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
      });
    } else if (memoryUsagePercent > 75) {
      profileLogger.warn('High memory usage detected', {
        usagePercent: memoryUsagePercent,
      });
    }
  }
}

/**
 * Performance profiling utilities
 */
export const Profiling = {
  // High-level profiling functions
  profileOperation: async <T>(
    name: string,
    operation: () => Promise<T>,
    options?: ProfilerOptions
  ): Promise<T> => {
    const profiler = new OperationProfiler(name, options);
    profiler.start();
    
    try {
      const result = await operation();
      profiler.finish(true);
      return result;
    } catch (error) {
      profiler.finish(false, error instanceof Error ? error.message : String(error));
      throw error;
    }
  },

  // Database profiling
  profileDatabase: DatabaseProfiler.profileQuery,

  // API profiling
  profileAPI: APIProfiler.profileEndpoint,

  // Get performance monitor instance
  getMonitor: () => PerformanceMonitor.getInstance(),
};

// Auto-start performance monitoring in production
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  PerformanceMonitor.getInstance().startMonitoring();
}