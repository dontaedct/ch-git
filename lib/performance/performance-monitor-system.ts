/**
 * Performance Monitor System - Comprehensive performance monitoring
 *
 * Provides real-time performance monitoring, benchmarking, and optimization
 * recommendations for admin interfaces and system components.
 *
 * @fileoverview HT-034.8.3 Performance Monitoring Implementation
 */

import { memoryManager } from './memory-manager';
import { resourceConflictResolver } from './resource-conflict-resolver';
import { memoryLeakDetector } from './memory-leak-detector';

// Performance metrics interface
interface PerformanceMetrics {
  timestamp: number;
  component: string;
  metrics: {
    renderTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkLatency: number;
    apiResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    throughput: number;
  };
  vitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    fcp: number; // First Contentful Paint
    ttfb: number; // Time to First Byte
  };
}

// Performance benchmark
interface PerformanceBenchmark {
  id: string;
  name: string;
  component: string;
  baseline: PerformanceMetrics;
  target: Partial<PerformanceMetrics['metrics']>;
  current: PerformanceMetrics;
  status: 'passing' | 'warning' | 'failing';
  improvement: number; // Percentage
}

// Performance alert
interface PerformanceAlert {
  id: string;
  type: 'performance-degradation' | 'memory-leak' | 'high-latency' | 'error-spike';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  metrics: Partial<PerformanceMetrics['metrics']>;
  threshold: number;
  currentValue: number;
  timestamp: number;
  resolved: boolean;
}

// Performance optimization recommendation
interface OptimizationRecommendation {
  id: string;
  type: 'memory' | 'rendering' | 'network' | 'caching' | 'code-splitting';
  priority: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  issue: string;
  recommendation: string;
  expectedImprovement: string;
  effort: 'low' | 'medium' | 'high';
  implementation: string[];
}

class PerformanceMonitorSystem {
  private static instance: PerformanceMonitorSystem;
  private metrics: Map<string, PerformanceMetrics[]> = new Map();
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private alerts: Map<string, PerformanceAlert> = new Map();
  private recommendations: Map<string, OptimizationRecommendation> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private performanceObserver: PerformanceObserver | null = null;

  private constructor() {
    this.initializeMonitoring();
    this.setupPerformanceObserver();
  }

  static getInstance(): PerformanceMonitorSystem {
    if (!PerformanceMonitorSystem.instance) {
      PerformanceMonitorSystem.instance = new PerformanceMonitorSystem();
    }
    return PerformanceMonitorSystem.instance;
  }

  /**
   * Initialize performance monitoring
   */
  private initializeMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.checkBenchmarks();
      this.detectPerformanceIssues();
      this.generateRecommendations();
    }, 15000); // Monitor every 15 seconds
  }

  /**
   * Setup Performance Observer for Web Vitals
   */
  private setupPerformanceObserver(): void {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.handlePerformanceEntry(entry);
      });
    });

    // Observe various performance metrics
    try {
      this.performanceObserver.observe({ entryTypes: ['measure', 'navigation', 'paint', 'largest-contentful-paint'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }
  }

  /**
   * Handle performance entries from observer
   */
  private handlePerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'largest-contentful-paint') {
      this.updateVital('lcp', entry.startTime);
    } else if (entry.entryType === 'first-input') {
      this.updateVital('fid', (entry as PerformanceEventTiming).processingStart - entry.startTime);
    } else if (entry.entryType === 'layout-shift') {
      const layoutShift = entry as LayoutShift;
      if (!layoutShift.hadRecentInput) {
        this.updateVital('cls', layoutShift.value);
      }
    }
  }

  /**
   * Update web vitals
   */
  private updateVital(vital: keyof PerformanceMetrics['vitals'], value: number): void {
    // Store vital for current component context
    const currentComponent = this.getCurrentComponent();
    if (currentComponent) {
      const metrics = this.getLatestMetrics(currentComponent);
      if (metrics) {
        metrics.vitals[vital] = value;
      }
    }
  }

  /**
   * Get current component context (simplified - would need better context tracking)
   */
  private getCurrentComponent(): string {
    // This would need to be enhanced with proper component context tracking
    return 'system';
  }

  /**
   * Collect performance metrics
   */
  private collectMetrics(): void {
    const components = ['admin', 'agency-toolkit', 'system'];

    components.forEach(component => {
      const metrics = this.gatherComponentMetrics(component);
      this.storeMetrics(component, metrics);
    });
  }

  /**
   * Gather metrics for a specific component
   */
  private gatherComponentMetrics(component: string): PerformanceMetrics {
    const now = Date.now();

    // Get memory stats
    const memoryStats = memoryManager.getMemoryStats();
    const currentMemory = memoryStats.current?.heapUsed || 0;

    // Get resource stats
    const resourceStats = resourceConflictResolver.getResourceStats();

    // Calculate cache hit rate (simplified)
    const cacheHitRate = this.calculateCacheHitRate(component);

    // Get network metrics
    const networkMetrics = this.getNetworkMetrics();

    // Get error rate
    const errorRate = this.getErrorRate(component);

    return {
      timestamp: now,
      component,
      metrics: {
        renderTime: this.measureRenderTime(component),
        memoryUsage: currentMemory,
        cpuUsage: this.estimateCpuUsage(),
        networkLatency: networkMetrics.latency,
        apiResponseTime: networkMetrics.responseTime,
        cacheHitRate,
        errorRate,
        throughput: this.calculateThroughput(component)
      },
      vitals: {
        lcp: this.getVital('lcp'),
        fid: this.getVital('fid'),
        cls: this.getVital('cls'),
        fcp: this.getVital('fcp'),
        ttfb: this.getVital('ttfb')
      }
    };
  }

  /**
   * Measure render time for component
   */
  private measureRenderTime(component: string): number {
    // This would need to be integrated with actual component render timing
    const entries = performance.getEntriesByType('measure').filter(entry =>
      entry.name.includes(component)
    );

    if (entries.length > 0) {
      return entries[entries.length - 1].duration;
    }

    return 0;
  }

  /**
   * Estimate CPU usage (simplified)
   */
  private estimateCpuUsage(): number {
    // This is a simplified estimation - real CPU usage would need more sophisticated tracking
    const memoryStats = memoryManager.getMemoryStats();
    const resourceStats = resourceConflictResolver.getResourceStats();

    let cpuEstimate = 0;

    // Estimate based on active resources
    Object.values(resourceStats).forEach(stat => {
      cpuEstimate += (stat.current / stat.limit) * 20; // Max 20% per resource type
    });

    return Math.min(cpuEstimate, 100);
  }

  /**
   * Get network metrics
   */
  private getNetworkMetrics(): { latency: number; responseTime: number } {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

    if (navEntries.length > 0) {
      const entry = navEntries[0];
      return {
        latency: entry.responseStart - entry.requestStart,
        responseTime: entry.responseEnd - entry.responseStart
      };
    }

    return { latency: 0, responseTime: 0 };
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(component: string): number {
    // This would integrate with actual cache statistics
    const cache = memoryManager.getComponentCache(component);
    return cache.size > 0 ? 85 : 0; // Simplified calculation
  }

  /**
   * Get error rate for component
   */
  private getErrorRate(component: string): number {
    // This would integrate with actual error tracking
    return 0.5; // Simplified - 0.5% error rate
  }

  /**
   * Calculate throughput for component
   */
  private calculateThroughput(component: string): number {
    const metrics = this.getMetrics(component);
    if (metrics.length < 2) return 0;

    const recent = metrics.slice(-10); // Last 10 metrics
    const timespan = recent[recent.length - 1].timestamp - recent[0].timestamp;

    return recent.length / (timespan / 1000); // Operations per second
  }

  /**
   * Get web vital value
   */
  private getVital(vital: keyof PerformanceMetrics['vitals']): number {
    // This would track actual web vitals
    return 0;
  }

  /**
   * Store metrics for component
   */
  private storeMetrics(component: string, metrics: PerformanceMetrics): void {
    const existing = this.metrics.get(component) || [];
    existing.push(metrics);

    // Keep only last 100 entries
    if (existing.length > 100) {
      existing.splice(0, existing.length - 100);
    }

    this.metrics.set(component, existing);
  }

  /**
   * Get metrics for component
   */
  getMetrics(component: string): PerformanceMetrics[] {
    return this.metrics.get(component) || [];
  }

  /**
   * Get latest metrics for component
   */
  private getLatestMetrics(component: string): PerformanceMetrics | undefined {
    const metrics = this.getMetrics(component);
    return metrics.length > 0 ? metrics[metrics.length - 1] : undefined;
  }

  /**
   * Create performance benchmark
   */
  createBenchmark(
    name: string,
    component: string,
    target: Partial<PerformanceMetrics['metrics']>
  ): string {
    const id = `${component}-${name}-${Date.now()}`;
    const baseline = this.getLatestMetrics(component);

    if (!baseline) {
      throw new Error(`No baseline metrics available for component: ${component}`);
    }

    const benchmark: PerformanceBenchmark = {
      id,
      name,
      component,
      baseline,
      target,
      current: baseline,
      status: 'passing',
      improvement: 0
    };

    this.benchmarks.set(id, benchmark);
    return id;
  }

  /**
   * Check all benchmarks
   */
  private checkBenchmarks(): void {
    this.benchmarks.forEach((benchmark, id) => {
      const current = this.getLatestMetrics(benchmark.component);
      if (current) {
        benchmark.current = current;
        benchmark.status = this.evaluateBenchmark(benchmark);
        benchmark.improvement = this.calculateImprovement(benchmark);
      }
    });
  }

  /**
   * Evaluate benchmark status
   */
  private evaluateBenchmark(benchmark: PerformanceBenchmark): 'passing' | 'warning' | 'failing' {
    let score = 0;
    let total = 0;

    Object.entries(benchmark.target).forEach(([key, target]) => {
      if (target !== undefined) {
        const current = benchmark.current.metrics[key as keyof PerformanceMetrics['metrics']];
        const baseline = benchmark.baseline.metrics[key as keyof PerformanceMetrics['metrics']];

        // Lower is better for most metrics
        const isLowerBetter = ['renderTime', 'memoryUsage', 'networkLatency', 'apiResponseTime', 'errorRate'].includes(key);

        if (isLowerBetter) {
          score += current <= target ? 1 : current <= baseline * 1.1 ? 0.5 : 0;
        } else {
          score += current >= target ? 1 : current >= baseline * 0.9 ? 0.5 : 0;
        }
        total++;
      }
    });

    const percentage = total > 0 ? score / total : 1;

    if (percentage >= 0.8) return 'passing';
    if (percentage >= 0.6) return 'warning';
    return 'failing';
  }

  /**
   * Calculate improvement percentage
   */
  private calculateImprovement(benchmark: PerformanceBenchmark): number {
    // Simplified improvement calculation
    const renderImprovement = (benchmark.baseline.metrics.renderTime - benchmark.current.metrics.renderTime) / benchmark.baseline.metrics.renderTime;
    const memoryImprovement = (benchmark.baseline.metrics.memoryUsage - benchmark.current.metrics.memoryUsage) / benchmark.baseline.metrics.memoryUsage;

    return Math.round(((renderImprovement + memoryImprovement) / 2) * 100);
  }

  /**
   * Detect performance issues
   */
  private detectPerformanceIssues(): void {
    this.metrics.forEach((metrics, component) => {
      const latest = metrics[metrics.length - 1];
      if (!latest) return;

      // Check for performance degradation
      this.checkPerformanceDegradation(component, latest);

      // Check for memory leaks
      this.checkMemoryLeaks(component, latest);

      // Check for high latency
      this.checkHighLatency(component, latest);

      // Check for error spikes
      this.checkErrorSpikes(component, latest);
    });
  }

  /**
   * Check for performance degradation
   */
  private checkPerformanceDegradation(component: string, latest: PerformanceMetrics): void {
    const metrics = this.getMetrics(component);
    if (metrics.length < 10) return;

    const recent = metrics.slice(-10);
    const baseline = metrics.slice(-20, -10);

    const avgRenderTimeRecent = recent.reduce((sum, m) => sum + m.metrics.renderTime, 0) / recent.length;
    const avgRenderTimeBaseline = baseline.reduce((sum, m) => sum + m.metrics.renderTime, 0) / baseline.length;

    if (avgRenderTimeRecent > avgRenderTimeBaseline * 1.5) {
      this.createAlert({
        type: 'performance-degradation',
        severity: 'high',
        component,
        description: 'Render time has increased significantly',
        threshold: avgRenderTimeBaseline * 1.5,
        currentValue: avgRenderTimeRecent,
        metrics: { renderTime: avgRenderTimeRecent }
      });
    }
  }

  /**
   * Check for memory leaks
   */
  private checkMemoryLeaks(component: string, latest: PerformanceMetrics): void {
    const leakSummary = memoryLeakDetector.getLeakSummary();

    if (leakSummary.highRiskComponents > 0) {
      this.createAlert({
        type: 'memory-leak',
        severity: 'critical',
        component,
        description: `${leakSummary.highRiskComponents} components with high leak risk`,
        threshold: 0,
        currentValue: leakSummary.highRiskComponents,
        metrics: { memoryUsage: latest.metrics.memoryUsage }
      });
    }
  }

  /**
   * Check for high latency
   */
  private checkHighLatency(component: string, latest: PerformanceMetrics): void {
    if (latest.metrics.networkLatency > 1000) { // > 1 second
      this.createAlert({
        type: 'high-latency',
        severity: 'medium',
        component,
        description: 'Network latency is unusually high',
        threshold: 1000,
        currentValue: latest.metrics.networkLatency,
        metrics: { networkLatency: latest.metrics.networkLatency }
      });
    }
  }

  /**
   * Check for error spikes
   */
  private checkErrorSpikes(component: string, latest: PerformanceMetrics): void {
    if (latest.metrics.errorRate > 5) { // > 5% error rate
      this.createAlert({
        type: 'error-spike',
        severity: 'high',
        component,
        description: 'Error rate has spiked significantly',
        threshold: 5,
        currentValue: latest.metrics.errorRate,
        metrics: { errorRate: latest.metrics.errorRate }
      });
    }
  }

  /**
   * Create performance alert
   */
  private createAlert(alertData: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const id = `${alertData.type}-${alertData.component}-${Date.now()}`;

    const alert: PerformanceAlert = {
      ...alertData,
      id,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.set(id, alert);
    console.warn('🚨 Performance Alert:', alert);
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(): void {
    this.metrics.forEach((metrics, component) => {
      const latest = metrics[metrics.length - 1];
      if (!latest) return;

      // Memory optimization recommendations
      if (latest.metrics.memoryUsage > 100 * 1024 * 1024) { // > 100MB
        this.createRecommendation({
          type: 'memory',
          priority: 'high',
          component,
          issue: 'High memory usage detected',
          recommendation: 'Implement memory optimization techniques',
          expectedImprovement: '30-50% memory reduction',
          effort: 'medium',
          implementation: [
            'Use React.memo for expensive components',
            'Implement component lazy loading',
            'Optimize state management',
            'Clear unused subscriptions and timers'
          ]
        });
      }

      // Rendering optimization recommendations
      if (latest.metrics.renderTime > 100) { // > 100ms
        this.createRecommendation({
          type: 'rendering',
          priority: 'medium',
          component,
          issue: 'Slow rendering performance',
          recommendation: 'Optimize component rendering',
          expectedImprovement: '40-60% render time reduction',
          effort: 'medium',
          implementation: [
            'Use useMemo for expensive calculations',
            'Implement virtual scrolling for large lists',
            'Optimize CSS and animations',
            'Reduce unnecessary re-renders'
          ]
        });
      }

      // Caching recommendations
      if (latest.metrics.cacheHitRate < 50) { // < 50% cache hit rate
        this.createRecommendation({
          type: 'caching',
          priority: 'medium',
          component,
          issue: 'Low cache hit rate',
          recommendation: 'Improve caching strategy',
          expectedImprovement: '20-30% performance improvement',
          effort: 'low',
          implementation: [
            'Implement intelligent cache invalidation',
            'Use service worker for asset caching',
            'Add query result caching',
            'Optimize cache key generation'
          ]
        });
      }
    });
  }

  /**
   * Create optimization recommendation
   */
  private createRecommendation(recData: Omit<OptimizationRecommendation, 'id'>): void {
    const id = `${recData.type}-${recData.component}-${Date.now()}`;

    const recommendation: OptimizationRecommendation = {
      ...recData,
      id
    };

    this.recommendations.set(id, recommendation);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
    alerts: PerformanceAlert[];
    recommendations: OptimizationRecommendation[];
    benchmarks: PerformanceBenchmark[];
    topIssues: string[];
  } {
    const alerts = Array.from(this.alerts.values()).filter(a => !a.resolved);
    const recommendations = Array.from(this.recommendations.values());
    const benchmarks = Array.from(this.benchmarks.values());

    const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
    const highAlerts = alerts.filter(a => a.severity === 'high').length;
    const failingBenchmarks = benchmarks.filter(b => b.status === 'failing').length;

    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor';

    if (criticalAlerts > 0 || failingBenchmarks > 2) {
      overallHealth = 'poor';
    } else if (highAlerts > 0 || failingBenchmarks > 0) {
      overallHealth = 'fair';
    } else if (alerts.length > 0) {
      overallHealth = 'good';
    } else {
      overallHealth = 'excellent';
    }

    const topIssues = recommendations
      .filter(r => r.priority === 'high' || r.priority === 'critical')
      .map(r => r.issue)
      .slice(0, 5);

    return {
      overallHealth,
      alerts,
      recommendations,
      benchmarks,
      topIssues
    };
  }

  /**
   * Start performance profiling for a component
   */
  startProfiling(component: string): string {
    const profilingId = `profile-${component}-${Date.now()}`;
    performance.mark(`${profilingId}-start`);
    return profilingId;
  }

  /**
   * End performance profiling
   */
  endProfiling(profilingId: string): number {
    performance.mark(`${profilingId}-end`);
    performance.measure(profilingId, `${profilingId}-start`, `${profilingId}-end`);

    const entries = performance.getEntriesByName(profilingId);
    return entries.length > 0 ? entries[0].duration : 0;
  }

  /**
   * Get real-time performance data
   */
  getRealTimeData() {
    const memoryStats = memoryManager.getMemoryStats();
    const resourceStats = resourceConflictResolver.getResourceStats();
    const leakSummary = memoryLeakDetector.getLeakSummary();

    return {
      memory: memoryStats,
      resources: resourceStats,
      leaks: leakSummary,
      timestamp: Date.now()
    };
  }

  /**
   * Cleanup when destroying the monitor
   */
  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }

    this.metrics.clear();
    this.benchmarks.clear();
    this.alerts.clear();
    this.recommendations.clear();
  }
}

// Export singleton instance
export const performanceMonitorSystem = PerformanceMonitorSystem.getInstance();

// React hook for performance monitoring
export function usePerformanceMonitoring(componentName: string) {
  const [summary, setSummary] = useState<ReturnType<typeof performanceMonitorSystem.getPerformanceSummary> | null>(null);
  const [realTimeData, setRealTimeData] = useState<ReturnType<typeof performanceMonitorSystem.getRealTimeData> | null>(null);

  useEffect(() => {
    const updateData = () => {
      setSummary(performanceMonitorSystem.getPerformanceSummary());
      setRealTimeData(performanceMonitorSystem.getRealTimeData());
    };

    updateData();
    const interval = setInterval(updateData, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const startProfiling = useCallback(() => {
    return performanceMonitorSystem.startProfiling(componentName);
  }, [componentName]);

  const endProfiling = useCallback((id: string) => {
    return performanceMonitorSystem.endProfiling(id);
  }, []);

  return {
    summary,
    realTimeData,
    startProfiling,
    endProfiling
  };
}

export default PerformanceMonitorSystem;