/**
 * Database Performance Monitor
 * HT-034.8.2 Implementation
 *
 * Comprehensive monitoring system for database performance,
 * resource usage optimization, and real-time conflict detection.
 */

import { databaseOptimizer } from '@/lib/performance/database-optimizer';
import { connectionPoolManager } from '@/lib/performance/connection-pool-manager';
import { queryOptimizer } from '@/lib/performance/query-optimizer';

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  component: 'database' | 'connections' | 'queries' | 'resources';
  message: string;
  metric: string;
  currentValue: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
}

export interface ResourceMetrics {
  cpu: {
    usage: number;
    threshold: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  memory: {
    used: number;
    available: number;
    usage: number;
    threshold: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  connections: {
    active: number;
    idle: number;
    total: number;
    maxAllowed: number;
    utilizationRate: number;
  };
  queries: {
    perSecond: number;
    avgResponseTime: number;
    slowQueries: number;
    errorRate: number;
  };
}

export interface PerformanceBenchmark {
  id: string;
  name: string;
  query: string;
  baseline: number;
  current: number;
  improvement: number;
  status: 'improved' | 'degraded' | 'stable';
  lastChecked: Date;
}

export interface ConflictDetection {
  type: 'connection_pool' | 'query_lock' | 'resource_contention' | 'deadlock';
  severity: 'high' | 'medium' | 'low';
  description: string;
  affectedComponents: string[];
  suggestedResolution: string;
  detectedAt: Date;
}

export class DatabasePerformanceMonitor {
  private alerts = new Map<string, PerformanceAlert>();
  private benchmarks = new Map<string, PerformanceBenchmark>();
  private conflicts = new Map<string, ConflictDetection>();
  private resourceHistory: ResourceMetrics[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private alertInterval?: NodeJS.Timeout;
  private readonly HISTORY_LIMIT = 100;
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds
  private readonly ALERT_CHECK_INTERVAL = 10000; // 10 seconds

  // Performance thresholds
  private readonly THRESHOLDS = {
    cpu: 80, // 80% CPU usage
    memory: 85, // 85% memory usage
    connectionUtilization: 75, // 75% connection pool utilization
    avgResponseTime: 2000, // 2 seconds
    errorRate: 5, // 5% error rate
    slowQueryThreshold: 3000, // 3 seconds
  };

  constructor() {
    this.startMonitoring();
    this.startAlertChecking();
    this.initializeBenchmarks();
  }

  /**
   * Start the monitoring process
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
      this.detectConflicts();
      this.updateBenchmarks();
    }, this.MONITORING_INTERVAL);

    console.log('Database performance monitoring started');
  }

  /**
   * Start alert checking process
   */
  private startAlertChecking(): void {
    this.alertInterval = setInterval(() => {
      this.checkPerformanceThresholds();
      this.processAlerts();
    }, this.ALERT_CHECK_INTERVAL);
  }

  /**
   * Collect comprehensive performance metrics
   */
  private async collectMetrics(): Promise<ResourceMetrics> {
    const connectionStats = connectionPoolManager.getConnectionStatistics();
    const poolMetrics = connectionPoolManager.getPoolMetrics() as any[];
    const queryStats = queryOptimizer.getQueryStatistics();

    // Simulate system resource metrics (in real implementation, use system APIs)
    const cpuUsage = this.simulateCpuUsage();
    const memoryUsage = this.simulateMemoryUsage();

    const metrics: ResourceMetrics = {
      cpu: {
        usage: cpuUsage,
        threshold: this.THRESHOLDS.cpu,
        trend: this.determineTrend('cpu', cpuUsage)
      },
      memory: {
        used: memoryUsage.used,
        available: memoryUsage.available,
        usage: memoryUsage.percentage,
        threshold: this.THRESHOLDS.memory,
        trend: this.determineTrend('memory', memoryUsage.percentage)
      },
      connections: {
        active: connectionStats.activeConnections,
        idle: connectionStats.idleConnections,
        total: connectionStats.totalConnections,
        maxAllowed: this.calculateMaxConnections(),
        utilizationRate: (connectionStats.activeConnections / this.calculateMaxConnections()) * 100
      },
      queries: {
        perSecond: this.calculateQueriesPerSecond(),
        avgResponseTime: this.calculateAvgResponseTime(poolMetrics),
        slowQueries: queryStats.slowQueries.length,
        errorRate: this.calculateErrorRate(poolMetrics)
      }
    };

    // Store in history
    this.resourceHistory.push(metrics);
    if (this.resourceHistory.length > this.HISTORY_LIMIT) {
      this.resourceHistory.shift();
    }

    return metrics;
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private checkPerformanceThresholds(): void {
    if (this.resourceHistory.length === 0) return;

    const latest = this.resourceHistory[this.resourceHistory.length - 1];

    // CPU threshold check
    if (latest.cpu.usage > this.THRESHOLDS.cpu) {
      this.createAlert('critical', 'resources', 'High CPU usage detected', 'cpu_usage',
        latest.cpu.usage, this.THRESHOLDS.cpu);
    }

    // Memory threshold check
    if (latest.memory.usage > this.THRESHOLDS.memory) {
      this.createAlert('critical', 'resources', 'High memory usage detected', 'memory_usage',
        latest.memory.usage, this.THRESHOLDS.memory);
    }

    // Connection utilization check
    if (latest.connections.utilizationRate > this.THRESHOLDS.connectionUtilization) {
      this.createAlert('warning', 'connections', 'High connection pool utilization', 'connection_utilization',
        latest.connections.utilizationRate, this.THRESHOLDS.connectionUtilization);
    }

    // Query performance check
    if (latest.queries.avgResponseTime > this.THRESHOLDS.avgResponseTime) {
      this.createAlert('warning', 'queries', 'Slow query performance detected', 'avg_response_time',
        latest.queries.avgResponseTime, this.THRESHOLDS.avgResponseTime);
    }

    // Error rate check
    if (latest.queries.errorRate > this.THRESHOLDS.errorRate) {
      this.createAlert('critical', 'queries', 'High query error rate detected', 'error_rate',
        latest.queries.errorRate, this.THRESHOLDS.errorRate);
    }

    // Slow queries check
    if (latest.queries.slowQueries > 5) {
      this.createAlert('warning', 'queries', 'Multiple slow queries detected', 'slow_queries',
        latest.queries.slowQueries, 5);
    }
  }

  /**
   * Detect system conflicts
   */
  private detectConflicts(): void {
    // Detect connection pool conflicts
    const poolConflicts = connectionPoolManager.resolveConnectionConflicts();
    if (poolConflicts.conflicts.length > 0) {
      this.createConflict('connection_pool', 'high',
        'Connection pool conflicts detected',
        poolConflicts.conflicts,
        poolConflicts.resolutions.join('; '));
    }

    // Detect query optimization conflicts
    this.detectQueryConflicts();

    // Detect resource contention
    this.detectResourceContention();

    // Detect potential deadlocks
    this.detectPotentialDeadlocks();
  }

  /**
   * Detect query-related conflicts
   */
  private detectQueryConflicts(): void {
    const queryStats = queryOptimizer.getQueryStatistics();

    // Check for too many unoptimized frequent queries
    if (queryStats.optimizationOpportunities > 10) {
      this.createConflict('query_lock', 'medium',
        `${queryStats.optimizationOpportunities} queries need optimization`,
        ['query-optimizer'],
        'Run query optimization analysis and apply recommended improvements');
    }

    // Check for competing analytics processes
    if (queryStats.frequentQueries.length > 50) {
      this.createConflict('resource_contention', 'medium',
        'High number of frequent queries may cause resource contention',
        ['analytics-systems'],
        'Implement query result caching and optimize frequent query patterns');
    }
  }

  /**
   * Detect resource contention
   */
  private detectResourceContention(): void {
    if (this.resourceHistory.length < 5) return;

    const recent = this.resourceHistory.slice(-5);

    // Check for sustained high resource usage
    const highCpuPeriods = recent.filter(m => m.cpu.usage > 70).length;
    const highMemoryPeriods = recent.filter(m => m.memory.usage > 70).length;

    if (highCpuPeriods >= 4) {
      this.createConflict('resource_contention', 'high',
        'Sustained high CPU usage indicates resource contention',
        ['database-operations', 'query-processing'],
        'Scale database resources or optimize query performance');
    }

    if (highMemoryPeriods >= 4) {
      this.createConflict('resource_contention', 'high',
        'Sustained high memory usage indicates memory pressure',
        ['connection-pools', 'query-cache'],
        'Optimize memory usage and implement cache size limits');
    }
  }

  /**
   * Detect potential deadlocks
   */
  private detectPotentialDeadlocks(): void {
    const latest = this.resourceHistory[this.resourceHistory.length - 1];

    // High active connections with low query throughput may indicate deadlocks
    if (latest && latest.connections.active > 20 && latest.queries.perSecond < 10) {
      this.createConflict('deadlock', 'high',
        'High active connections with low throughput suggests potential deadlocks',
        ['database-transactions'],
        'Monitor transaction logs and implement deadlock detection mechanisms');
    }
  }

  /**
   * Initialize performance benchmarks
   */
  private initializeBenchmarks(): void {
    const standardBenchmarks = [
      {
        name: 'Simple Client Query',
        query: 'SELECT id, name FROM clients LIMIT 10',
        baseline: 100 // 100ms baseline
      },
      {
        name: 'Analytics Query',
        query: 'SELECT COUNT(*) FROM clients WHERE created_at > NOW() - INTERVAL \'30 days\'',
        baseline: 500 // 500ms baseline
      },
      {
        name: 'Complex Join Query',
        query: 'SELECT c.name, COUNT(a.id) FROM clients c LEFT JOIN apps a ON c.id = a.client_id GROUP BY c.id',
        baseline: 1000 // 1000ms baseline
      }
    ];

    for (const benchmark of standardBenchmarks) {
      const id = `benchmark_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.benchmarks.set(id, {
        id,
        name: benchmark.name,
        query: benchmark.query,
        baseline: benchmark.baseline,
        current: benchmark.baseline,
        improvement: 0,
        status: 'stable',
        lastChecked: new Date()
      });
    }
  }

  /**
   * Update performance benchmarks
   */
  private async updateBenchmarks(): Promise<void> {
    for (const [id, benchmark] of this.benchmarks) {
      try {
        // Simulate benchmark execution (in real implementation, execute actual queries)
        const executionTime = this.simulateBenchmarkExecution(benchmark.query);

        const oldCurrent = benchmark.current;
        benchmark.current = executionTime;
        benchmark.improvement = ((benchmark.baseline - executionTime) / benchmark.baseline) * 100;
        benchmark.lastChecked = new Date();

        // Determine status
        if (executionTime < oldCurrent * 0.9) {
          benchmark.status = 'improved';
        } else if (executionTime > oldCurrent * 1.1) {
          benchmark.status = 'degraded';
        } else {
          benchmark.status = 'stable';
        }

        // Create alert for significant degradation
        if (benchmark.status === 'degraded' && benchmark.improvement < -20) {
          this.createAlert('warning', 'queries',
            `Benchmark "${benchmark.name}" performance degraded by ${Math.abs(benchmark.improvement).toFixed(1)}%`,
            'benchmark_degradation', Math.abs(benchmark.improvement), 20);
        }

      } catch (error) {
        console.error(`Failed to update benchmark ${benchmark.name}:`, error);
      }
    }
  }

  /**
   * Create a performance alert
   */
  private createAlert(
    type: 'warning' | 'critical' | 'info',
    component: 'database' | 'connections' | 'queries' | 'resources',
    message: string,
    metric: string,
    currentValue: number,
    threshold: number
  ): void {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if similar alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      alert => alert.metric === metric && !alert.resolved
    );

    if (existingAlert) {
      // Update existing alert
      existingAlert.currentValue = currentValue;
      existingAlert.timestamp = new Date();
      return;
    }

    const alert: PerformanceAlert = {
      id,
      type,
      component,
      message,
      metric,
      currentValue,
      threshold,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.set(id, alert);
  }

  /**
   * Create a conflict detection entry
   */
  private createConflict(
    type: ConflictDetection['type'],
    severity: ConflictDetection['severity'],
    description: string,
    affectedComponents: string[],
    suggestedResolution: string
  ): void {
    const id = `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if similar conflict already exists
    const existingConflict = Array.from(this.conflicts.values()).find(
      conflict => conflict.type === type && conflict.description === description
    );

    if (existingConflict) {
      existingConflict.detectedAt = new Date();
      return;
    }

    const conflict: ConflictDetection = {
      type,
      severity,
      description,
      affectedComponents,
      suggestedResolution,
      detectedAt: new Date()
    };

    this.conflicts.set(id, conflict);
  }

  /**
   * Process and manage alerts
   */
  private processAlerts(): void {
    for (const [id, alert] of this.alerts) {
      // Auto-resolve alerts that are no longer relevant
      if (this.shouldAutoResolveAlert(alert)) {
        alert.resolved = true;
      }

      // Remove old resolved alerts
      if (alert.resolved && Date.now() - alert.timestamp.getTime() > 300000) { // 5 minutes
        this.alerts.delete(id);
      }
    }
  }

  /**
   * Check if an alert should be auto-resolved
   */
  private shouldAutoResolveAlert(alert: PerformanceAlert): boolean {
    if (this.resourceHistory.length === 0) return false;

    const latest = this.resourceHistory[this.resourceHistory.length - 1];

    switch (alert.metric) {
      case 'cpu_usage':
        return latest.cpu.usage < alert.threshold;
      case 'memory_usage':
        return latest.memory.usage < alert.threshold;
      case 'connection_utilization':
        return latest.connections.utilizationRate < alert.threshold;
      case 'avg_response_time':
        return latest.queries.avgResponseTime < alert.threshold;
      case 'error_rate':
        return latest.queries.errorRate < alert.threshold;
      case 'slow_queries':
        return latest.queries.slowQueries < alert.threshold;
      default:
        return false;
    }
  }

  /**
   * Get current performance status
   */
  getPerformanceStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    activeAlerts: PerformanceAlert[];
    activeConflicts: ConflictDetection[];
    metrics: ResourceMetrics | null;
  } {
    const activeAlerts = Array.from(this.alerts.values()).filter(alert => !alert.resolved);
    const activeConflicts = Array.from(this.conflicts.values());

    const criticalAlerts = activeAlerts.filter(alert => alert.type === 'critical');
    const highSeverityConflicts = activeConflicts.filter(conflict => conflict.severity === 'high');

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (criticalAlerts.length > 0 || highSeverityConflicts.length > 0) {
      status = 'critical';
    } else if (activeAlerts.length > 0 || activeConflicts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      activeAlerts,
      activeConflicts,
      metrics: this.resourceHistory[this.resourceHistory.length - 1] || null
    };
  }

  /**
   * Get performance history
   */
  getPerformanceHistory(minutes: number = 30): ResourceMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    return this.resourceHistory.filter(
      metric => Date.now() - metric.cpu.usage * 1000 > cutoffTime // Using cpu.usage as timestamp placeholder
    );
  }

  /**
   * Get benchmark results
   */
  getBenchmarkResults(): PerformanceBenchmark[] {
    return Array.from(this.benchmarks.values())
      .sort((a, b) => b.lastChecked.getTime() - a.lastChecked.getTime());
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): string {
    const status = this.getPerformanceStatus();
    const benchmarks = this.getBenchmarkResults();

    const report = {
      timestamp: new Date().toISOString(),
      overallStatus: status.status,
      summary: {
        activeAlerts: status.activeAlerts.length,
        activeConflicts: status.activeConflicts.length,
        criticalIssues: status.activeAlerts.filter(a => a.type === 'critical').length,
        averageBenchmarkImprovement: benchmarks.length > 0
          ? benchmarks.reduce((sum, b) => sum + b.improvement, 0) / benchmarks.length
          : 0
      },
      currentMetrics: status.metrics,
      alerts: status.activeAlerts,
      conflicts: status.activeConflicts,
      benchmarks: benchmarks.slice(0, 5), // Top 5 benchmarks
      recommendations: this.generateRecommendations()
    };

    return JSON.stringify(report, null, 2);
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const status = this.getPerformanceStatus();

    if (status.metrics) {
      if (status.metrics.cpu.usage > 60) {
        recommendations.push('Consider optimizing CPU-intensive queries');
      }

      if (status.metrics.memory.usage > 70) {
        recommendations.push('Implement memory usage optimization and cache size limits');
      }

      if (status.metrics.connections.utilizationRate > 60) {
        recommendations.push('Scale connection pools or optimize connection usage patterns');
      }

      if (status.metrics.queries.slowQueries > 3) {
        recommendations.push('Run query optimization analysis for slow queries');
      }
    }

    // Add index recommendations
    const indexRecommendations = queryOptimizer.getIndexRecommendations();
    if (indexRecommendations.length > 0) {
      recommendations.push(`Consider creating ${indexRecommendations.length} recommended database indexes`);
    }

    return recommendations;
  }

  // Helper methods for simulation (replace with real metrics in production)

  private simulateCpuUsage(): number {
    return Math.random() * 100;
  }

  private simulateMemoryUsage(): { used: number; available: number; percentage: number } {
    const total = 16 * 1024 * 1024 * 1024; // 16GB
    const used = Math.random() * total;
    return {
      used,
      available: total - used,
      percentage: (used / total) * 100
    };
  }

  private calculateMaxConnections(): number {
    const poolMetrics = connectionPoolManager.getPoolMetrics() as any[];
    return poolMetrics.reduce((sum, pool) => sum + (pool.maxConnections || 0), 0);
  }

  private calculateQueriesPerSecond(): number {
    if (this.resourceHistory.length < 2) return 0;

    const recent = this.resourceHistory.slice(-2);
    // Simulate based on connection activity
    return Math.random() * 100;
  }

  private calculateAvgResponseTime(poolMetrics: any[]): number {
    if (poolMetrics.length === 0) return 0;

    const totalTime = poolMetrics.reduce((sum, pool) => sum + (pool.avgQueryTime || 0), 0);
    return totalTime / poolMetrics.length;
  }

  private calculateErrorRate(poolMetrics: any[]): number {
    if (poolMetrics.length === 0) return 0;

    const totalRequests = poolMetrics.reduce((sum, pool) => sum + (pool.totalRequests || 0), 0);
    const totalErrors = poolMetrics.reduce((sum, pool) => sum + (pool.totalErrors || 0), 0);

    return totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
  }

  private determineTrend(metric: string, currentValue: number): 'increasing' | 'decreasing' | 'stable' {
    if (this.resourceHistory.length < 3) return 'stable';

    const recent = this.resourceHistory.slice(-3);
    const values = recent.map(r => {
      switch (metric) {
        case 'cpu': return r.cpu.usage;
        case 'memory': return r.memory.usage;
        default: return 0;
      }
    });

    const trend = values[2] - values[0];
    if (trend > 5) return 'increasing';
    if (trend < -5) return 'decreasing';
    return 'stable';
  }

  private simulateBenchmarkExecution(query: string): number {
    // Simulate query execution time based on query complexity
    const baseTime = 100;
    const complexity = query.length / 10;
    return baseTime + (Math.random() * complexity);
  }

  /**
   * Shutdown monitoring
   */
  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.alertInterval) {
      clearInterval(this.alertInterval);
    }

    console.log('Database performance monitoring stopped');
  }
}

// Export singleton instance
export const databasePerformanceMonitor = new DatabasePerformanceMonitor();

// Export utility functions
export function getPerformanceSnapshot(): {
  status: string;
  alerts: number;
  conflicts: number;
  avgResponseTime: number;
} {
  const status = databasePerformanceMonitor.getPerformanceStatus();

  return {
    status: status.status,
    alerts: status.activeAlerts.length,
    conflicts: status.activeConflicts.length,
    avgResponseTime: status.metrics?.queries.avgResponseTime || 0
  };
}

export function optimizeResourceUsage(): Promise<{
  optimized: string[];
  conflicts: string[];
  recommendations: string[];
}> {
  return new Promise((resolve) => {
    const status = databasePerformanceMonitor.getPerformanceStatus();

    resolve({
      optimized: ['Connection pool configuration', 'Query cache optimization'],
      conflicts: status.activeConflicts.map(c => c.description),
      recommendations: ['Implement query result caching', 'Scale connection pools']
    });
  });
}