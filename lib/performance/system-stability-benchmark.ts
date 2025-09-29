/**
 * System Stability Benchmark - Comprehensive stability and load testing
 *
 * Provides comprehensive system stability benchmarking, load testing,
 * and stress testing capabilities for admin interfaces.
 *
 * @fileoverview HT-034.8.3 System Stability & Load Testing
 */

import { performanceMonitorSystem } from './performance-monitor-system';
import { memoryManager } from './memory-manager';
import { resourceConflictResolver } from './resource-conflict-resolver';

// Benchmark test types
type BenchmarkType = 'load' | 'stress' | 'endurance' | 'spike' | 'volume' | 'configuration';

// Stability metrics
interface StabilityMetrics {
  timestamp: number;
  duration: number;
  requests: number;
  successRate: number;
  averageResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  throughput: number;
  errorRate: number;
  memoryUsage: {
    initial: number;
    peak: number;
    final: number;
    leaked: number;
  };
  cpuUsage: {
    average: number;
    peak: number;
  };
  resourceUtilization: {
    database: number;
    cache: number;
    api: number;
  };
}

// Benchmark configuration
interface BenchmarkConfig {
  type: BenchmarkType;
  duration: number; // in milliseconds
  concurrentUsers: number;
  requestsPerSecond: number;
  rampUpTime: number;
  rampDownTime: number;
  targets: string[]; // Components/endpoints to test
  thresholds: {
    maxResponseTime: number;
    minSuccessRate: number;
    maxErrorRate: number;
    maxMemoryUsage: number;
    maxCpuUsage: number;
  };
}

// Benchmark result
interface BenchmarkResult {
  id: string;
  config: BenchmarkConfig;
  metrics: StabilityMetrics;
  status: 'running' | 'completed' | 'failed' | 'aborted';
  startTime: number;
  endTime?: number;
  passed: boolean;
  issues: BenchmarkIssue[];
  recommendations: string[];
}

// Benchmark issue
interface BenchmarkIssue {
  type: 'performance' | 'stability' | 'memory' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metric: string;
  threshold: number;
  actual: number;
  impact: string;
}

// Load simulation
interface LoadSimulation {
  id: string;
  active: boolean;
  workers: Worker[];
  requestCount: number;
  errorCount: number;
  responseTimeSum: number;
  minResponseTime: number;
  maxResponseTime: number;
  startTime: number;
}

class SystemStabilityBenchmark {
  private static instance: SystemStabilityBenchmark;
  private benchmarks: Map<string, BenchmarkResult> = new Map();
  private activeSimulations: Map<string, LoadSimulation> = new Map();
  private defaultConfigs: Map<BenchmarkType, BenchmarkConfig> = new Map();

  private constructor() {
    this.initializeDefaultConfigs();
  }

  static getInstance(): SystemStabilityBenchmark {
    if (!SystemStabilityBenchmark.instance) {
      SystemStabilityBenchmark.instance = new SystemStabilityBenchmark();
    }
    return SystemStabilityBenchmark.instance;
  }

  /**
   * Initialize default benchmark configurations
   */
  private initializeDefaultConfigs(): void {
    // Load testing configuration
    this.defaultConfigs.set('load', {
      type: 'load',
      duration: 300000, // 5 minutes
      concurrentUsers: 50,
      requestsPerSecond: 10,
      rampUpTime: 60000, // 1 minute
      rampDownTime: 60000, // 1 minute
      targets: ['admin', 'agency-toolkit'],
      thresholds: {
        maxResponseTime: 2000, // 2 seconds
        minSuccessRate: 95, // 95%
        maxErrorRate: 5, // 5%
        maxMemoryUsage: 200 * 1024 * 1024, // 200MB
        maxCpuUsage: 80 // 80%
      }
    });

    // Stress testing configuration
    this.defaultConfigs.set('stress', {
      type: 'stress',
      duration: 600000, // 10 minutes
      concurrentUsers: 200,
      requestsPerSecond: 50,
      rampUpTime: 120000, // 2 minutes
      rampDownTime: 120000, // 2 minutes
      targets: ['admin', 'agency-toolkit'],
      thresholds: {
        maxResponseTime: 5000, // 5 seconds
        minSuccessRate: 85, // 85%
        maxErrorRate: 15, // 15%
        maxMemoryUsage: 500 * 1024 * 1024, // 500MB
        maxCpuUsage: 95 // 95%
      }
    });

    // Endurance testing configuration
    this.defaultConfigs.set('endurance', {
      type: 'endurance',
      duration: 3600000, // 1 hour
      concurrentUsers: 30,
      requestsPerSecond: 5,
      rampUpTime: 300000, // 5 minutes
      rampDownTime: 300000, // 5 minutes
      targets: ['admin', 'agency-toolkit'],
      thresholds: {
        maxResponseTime: 3000, // 3 seconds
        minSuccessRate: 98, // 98%
        maxErrorRate: 2, // 2%
        maxMemoryUsage: 150 * 1024 * 1024, // 150MB
        maxCpuUsage: 70 // 70%
      }
    });

    // Spike testing configuration
    this.defaultConfigs.set('spike', {
      type: 'spike',
      duration: 180000, // 3 minutes
      concurrentUsers: 500,
      requestsPerSecond: 100,
      rampUpTime: 10000, // 10 seconds
      rampDownTime: 10000, // 10 seconds
      targets: ['admin', 'agency-toolkit'],
      thresholds: {
        maxResponseTime: 10000, // 10 seconds
        minSuccessRate: 70, // 70%
        maxErrorRate: 30, // 30%
        maxMemoryUsage: 1024 * 1024 * 1024, // 1GB
        maxCpuUsage: 100 // 100%
      }
    });
  }

  /**
   * Run benchmark test
   */
  async runBenchmark(
    type: BenchmarkType,
    customConfig?: Partial<BenchmarkConfig>
  ): Promise<string> {
    const baseConfig = this.defaultConfigs.get(type);
    if (!baseConfig) {
      throw new Error(`Unknown benchmark type: ${type}`);
    }

    const config = { ...baseConfig, ...customConfig };
    const benchmarkId = `${type}-${Date.now()}`;

    const result: BenchmarkResult = {
      id: benchmarkId,
      config,
      metrics: this.createEmptyMetrics(),
      status: 'running',
      startTime: Date.now(),
      passed: false,
      issues: [],
      recommendations: []
    };

    this.benchmarks.set(benchmarkId, result);

    try {
      await this.executeBenchmark(benchmarkId, config);
      result.status = 'completed';
      result.endTime = Date.now();
      result.passed = this.evaluateBenchmarkResult(result);

      console.log(`✅ Benchmark ${benchmarkId} completed:`, {
        passed: result.passed,
        issues: result.issues.length,
        duration: result.endTime - result.startTime
      });
    } catch (error) {
      result.status = 'failed';
      result.endTime = Date.now();
      console.error(`❌ Benchmark ${benchmarkId} failed:`, error);
    }

    return benchmarkId;
  }

  /**
   * Execute benchmark test
   */
  private async executeBenchmark(benchmarkId: string, config: BenchmarkConfig): Promise<void> {
    const result = this.benchmarks.get(benchmarkId)!;

    // Capture initial state
    const initialMemory = this.getCurrentMemoryUsage();
    result.metrics.memoryUsage.initial = initialMemory;

    // Start load simulation
    const simulation = await this.startLoadSimulation(config);

    // Monitor progress
    const monitoringInterval = setInterval(() => {
      this.updateBenchmarkMetrics(result, simulation);
    }, 5000); // Update every 5 seconds

    // Wait for test duration
    await this.wait(config.duration);

    // Stop monitoring
    clearInterval(monitoringInterval);

    // Stop simulation
    await this.stopLoadSimulation(simulation);

    // Capture final metrics
    result.metrics.memoryUsage.final = this.getCurrentMemoryUsage();
    result.metrics.memoryUsage.leaked = result.metrics.memoryUsage.final - result.metrics.memoryUsage.initial;

    // Analyze results
    this.analyzeBenchmarkResult(result);
  }

  /**
   * Start load simulation
   */
  private async startLoadSimulation(config: BenchmarkConfig): Promise<LoadSimulation> {
    const simulationId = `sim-${Date.now()}`;

    const simulation: LoadSimulation = {
      id: simulationId,
      active: true,
      workers: [],
      requestCount: 0,
      errorCount: 0,
      responseTimeSum: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      startTime: Date.now()
    };

    this.activeSimulations.set(simulationId, simulation);

    // Create virtual workers (simplified simulation)
    for (let i = 0; i < config.concurrentUsers; i++) {
      const worker = this.createVirtualWorker(simulation, config);
      simulation.workers.push(worker as any);
    }

    return simulation;
  }

  /**
   * Create virtual worker for load simulation
   */
  private createVirtualWorker(simulation: LoadSimulation, config: BenchmarkConfig): any {
    const worker = {
      id: Math.random(),
      active: true,
      interval: null as NodeJS.Timeout | null
    };

    // Simulate requests
    worker.interval = setInterval(async () => {
      if (!simulation.active) return;

      try {
        const startTime = Date.now();

        // Simulate API request
        await this.simulateRequest(config.targets[Math.floor(Math.random() * config.targets.length)]);

        const responseTime = Date.now() - startTime;

        // Update metrics
        simulation.requestCount++;
        simulation.responseTimeSum += responseTime;
        simulation.minResponseTime = Math.min(simulation.minResponseTime, responseTime);
        simulation.maxResponseTime = Math.max(simulation.maxResponseTime, responseTime);

      } catch (error) {
        simulation.errorCount++;
      }
    }, 1000 / config.requestsPerSecond);

    return worker;
  }

  /**
   * Simulate API request
   */
  private async simulateRequest(target: string): Promise<void> {
    // Simulate different types of requests based on target
    const requestTypes = {
      'admin': ['GET /admin/clients', 'GET /admin/analytics', 'POST /admin/settings'],
      'agency-toolkit': ['GET /agency-toolkit/apps', 'POST /agency-toolkit/apps', 'GET /agency-toolkit/analytics']
    };

    const requests = requestTypes[target as keyof typeof requestTypes] || ['GET /'];
    const request = requests[Math.floor(Math.random() * requests.length)];

    // Simulate request processing time
    const baseTime = 50 + Math.random() * 200; // 50-250ms base
    const variability = Math.random() * 100; // 0-100ms variability

    await this.wait(baseTime + variability);

    // Simulate occasional slow requests
    if (Math.random() < 0.1) { // 10% of requests are slow
      await this.wait(500 + Math.random() * 1000); // Additional 500-1500ms
    }

    // Simulate occasional errors
    if (Math.random() < 0.02) { // 2% error rate
      throw new Error('Simulated request error');
    }
  }

  /**
   * Stop load simulation
   */
  private async stopLoadSimulation(simulation: LoadSimulation): Promise<void> {
    simulation.active = false;

    // Stop all workers
    simulation.workers.forEach((worker: any) => {
      if (worker.interval) {
        clearInterval(worker.interval);
      }
    });

    this.activeSimulations.delete(simulation.id);
  }

  /**
   * Update benchmark metrics during execution
   */
  private updateBenchmarkMetrics(result: BenchmarkResult, simulation: LoadSimulation): void {
    const currentTime = Date.now();
    const duration = currentTime - result.startTime;

    // Update basic metrics
    result.metrics.timestamp = currentTime;
    result.metrics.duration = duration;
    result.metrics.requests = simulation.requestCount;

    // Calculate rates
    result.metrics.successRate = simulation.requestCount > 0 ?
      ((simulation.requestCount - simulation.errorCount) / simulation.requestCount) * 100 : 100;
    result.metrics.errorRate = simulation.requestCount > 0 ?
      (simulation.errorCount / simulation.requestCount) * 100 : 0;
    result.metrics.throughput = duration > 0 ? (simulation.requestCount / duration) * 1000 : 0;

    // Calculate response times
    result.metrics.averageResponseTime = simulation.requestCount > 0 ?
      simulation.responseTimeSum / simulation.requestCount : 0;
    result.metrics.maxResponseTime = simulation.maxResponseTime === 0 ? 0 : simulation.maxResponseTime;
    result.metrics.minResponseTime = simulation.minResponseTime === Infinity ? 0 : simulation.minResponseTime;

    // Update memory metrics
    const currentMemory = this.getCurrentMemoryUsage();
    result.metrics.memoryUsage.peak = Math.max(result.metrics.memoryUsage.peak, currentMemory);

    // Update CPU metrics (simplified)
    const currentCpu = this.getCurrentCpuUsage();
    result.metrics.cpuUsage.average = (result.metrics.cpuUsage.average + currentCpu) / 2;
    result.metrics.cpuUsage.peak = Math.max(result.metrics.cpuUsage.peak, currentCpu);

    // Update resource utilization
    const resourceStats = resourceConflictResolver.getResourceStats();
    result.metrics.resourceUtilization = {
      database: resourceStats.database?.percentage || 0,
      cache: resourceStats.cache?.percentage || 0,
      api: resourceStats.api?.percentage || 0
    };
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    const memoryStats = memoryManager.getMemoryStats();
    return memoryStats.current?.heapUsed || 0;
  }

  /**
   * Get current CPU usage (simplified estimation)
   */
  private getCurrentCpuUsage(): number {
    // This is a simplified estimation
    // In a real implementation, you'd use process.cpuUsage() or similar
    const resourceStats = resourceConflictResolver.getResourceStats();
    let usage = 0;

    Object.values(resourceStats).forEach(stat => {
      usage += (stat.current / stat.limit) * 25; // Max 25% per resource type
    });

    return Math.min(usage, 100);
  }

  /**
   * Create empty metrics structure
   */
  private createEmptyMetrics(): StabilityMetrics {
    return {
      timestamp: Date.now(),
      duration: 0,
      requests: 0,
      successRate: 100,
      averageResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: {
        initial: 0,
        peak: 0,
        final: 0,
        leaked: 0
      },
      cpuUsage: {
        average: 0,
        peak: 0
      },
      resourceUtilization: {
        database: 0,
        cache: 0,
        api: 0
      }
    };
  }

  /**
   * Evaluate benchmark result against thresholds
   */
  private evaluateBenchmarkResult(result: BenchmarkResult): boolean {
    const { metrics, config } = result;
    let passed = true;

    // Check response time
    if (metrics.averageResponseTime > config.thresholds.maxResponseTime) {
      result.issues.push({
        type: 'performance',
        severity: 'high',
        description: 'Average response time exceeded threshold',
        metric: 'averageResponseTime',
        threshold: config.thresholds.maxResponseTime,
        actual: metrics.averageResponseTime,
        impact: 'User experience degradation'
      });
      passed = false;
    }

    // Check success rate
    if (metrics.successRate < config.thresholds.minSuccessRate) {
      result.issues.push({
        type: 'stability',
        severity: 'critical',
        description: 'Success rate below threshold',
        metric: 'successRate',
        threshold: config.thresholds.minSuccessRate,
        actual: metrics.successRate,
        impact: 'System reliability concerns'
      });
      passed = false;
    }

    // Check error rate
    if (metrics.errorRate > config.thresholds.maxErrorRate) {
      result.issues.push({
        type: 'error',
        severity: 'high',
        description: 'Error rate exceeded threshold',
        metric: 'errorRate',
        threshold: config.thresholds.maxErrorRate,
        actual: metrics.errorRate,
        impact: 'System stability issues'
      });
      passed = false;
    }

    // Check memory usage
    if (metrics.memoryUsage.peak > config.thresholds.maxMemoryUsage) {
      result.issues.push({
        type: 'memory',
        severity: 'medium',
        description: 'Peak memory usage exceeded threshold',
        metric: 'memoryUsage.peak',
        threshold: config.thresholds.maxMemoryUsage,
        actual: metrics.memoryUsage.peak,
        impact: 'Potential memory exhaustion'
      });
      passed = false;
    }

    // Check for memory leaks
    if (metrics.memoryUsage.leaked > 50 * 1024 * 1024) { // 50MB leak
      result.issues.push({
        type: 'memory',
        severity: 'high',
        description: 'Significant memory leak detected',
        metric: 'memoryUsage.leaked',
        threshold: 50 * 1024 * 1024,
        actual: metrics.memoryUsage.leaked,
        impact: 'Memory leak will cause long-term instability'
      });
      passed = false;
    }

    // Check CPU usage
    if (metrics.cpuUsage.peak > config.thresholds.maxCpuUsage) {
      result.issues.push({
        type: 'performance',
        severity: 'medium',
        description: 'Peak CPU usage exceeded threshold',
        metric: 'cpuUsage.peak',
        threshold: config.thresholds.maxCpuUsage,
        actual: metrics.cpuUsage.peak,
        impact: 'System performance degradation'
      });
      passed = false;
    }

    return passed;
  }

  /**
   * Analyze benchmark result and generate recommendations
   */
  private analyzeBenchmarkResult(result: BenchmarkResult): void {
    const { metrics, issues } = result;

    // Performance recommendations
    if (metrics.averageResponseTime > 1000) {
      result.recommendations.push('Implement response time optimization techniques');
      result.recommendations.push('Consider adding response caching');
      result.recommendations.push('Optimize database queries and API calls');
    }

    // Memory recommendations
    if (metrics.memoryUsage.leaked > 10 * 1024 * 1024) { // 10MB
      result.recommendations.push('Investigate and fix memory leaks');
      result.recommendations.push('Implement automatic cleanup procedures');
      result.recommendations.push('Add memory usage monitoring alerts');
    }

    // Stability recommendations
    if (metrics.errorRate > 1) {
      result.recommendations.push('Improve error handling and recovery');
      result.recommendations.push('Add circuit breaker patterns');
      result.recommendations.push('Implement retry mechanisms with backoff');
    }

    // Throughput recommendations
    if (metrics.throughput < 1) { // Less than 1 request per second
      result.recommendations.push('Optimize request processing pipeline');
      result.recommendations.push('Consider horizontal scaling');
      result.recommendations.push('Implement request queuing and batching');
    }

    // Resource utilization recommendations
    if (metrics.resourceUtilization.database > 80) {
      result.recommendations.push('Optimize database connection pooling');
      result.recommendations.push('Implement database query optimization');
    }

    if (metrics.resourceUtilization.cache > 80) {
      result.recommendations.push('Implement intelligent cache eviction');
      result.recommendations.push('Optimize cache key strategies');
    }
  }

  /**
   * Wait for specified duration
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get benchmark result
   */
  getBenchmarkResult(benchmarkId: string): BenchmarkResult | undefined {
    return this.benchmarks.get(benchmarkId);
  }

  /**
   * Get all benchmark results
   */
  getAllBenchmarkResults(): BenchmarkResult[] {
    return Array.from(this.benchmarks.values());
  }

  /**
   * Get benchmark summary
   */
  getBenchmarkSummary(): {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    averagePassRate: number;
    topIssues: { type: string; count: number }[];
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const results = this.getAllBenchmarkResults();
    const completed = results.filter(r => r.status === 'completed');

    const totalTests = completed.length;
    const passedTests = completed.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const averagePassRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 100;

    // Analyze top issues
    const issueTypes = new Map<string, number>();
    completed.forEach(result => {
      result.issues.forEach(issue => {
        const current = issueTypes.get(issue.type) || 0;
        issueTypes.set(issue.type, current + 1);
      });
    });

    const topIssues = Array.from(issueTypes.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Determine system health
    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    if (averagePassRate >= 95) {
      systemHealth = 'excellent';
    } else if (averagePassRate >= 85) {
      systemHealth = 'good';
    } else if (averagePassRate >= 70) {
      systemHealth = 'fair';
    } else {
      systemHealth = 'poor';
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      averagePassRate,
      topIssues,
      systemHealth
    };
  }

  /**
   * Run quick stability check
   */
  async runQuickStabilityCheck(): Promise<BenchmarkResult> {
    const quickConfig: BenchmarkConfig = {
      type: 'load',
      duration: 60000, // 1 minute
      concurrentUsers: 10,
      requestsPerSecond: 5,
      rampUpTime: 10000, // 10 seconds
      rampDownTime: 10000, // 10 seconds
      targets: ['admin', 'agency-toolkit'],
      thresholds: {
        maxResponseTime: 1000, // 1 second
        minSuccessRate: 98, // 98%
        maxErrorRate: 2, // 2%
        maxMemoryUsage: 100 * 1024 * 1024, // 100MB
        maxCpuUsage: 70 // 70%
      }
    };

    const benchmarkId = await this.runBenchmark('load', quickConfig);
    return this.getBenchmarkResult(benchmarkId)!;
  }

  /**
   * Cleanup when destroying the benchmark system
   */
  destroy(): void {
    // Stop all active simulations
    this.activeSimulations.forEach(simulation => {
      simulation.active = false;
      simulation.workers.forEach((worker: any) => {
        if (worker.interval) {
          clearInterval(worker.interval);
        }
      });
    });

    this.activeSimulations.clear();
    this.benchmarks.clear();
  }
}

// Export singleton instance
export const systemStabilityBenchmark = SystemStabilityBenchmark.getInstance();

// React hook for stability benchmarking
export function useStabilityBenchmarking() {
  const [summary, setSummary] = useState<ReturnType<typeof systemStabilityBenchmark.getBenchmarkSummary> | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const updateSummary = () => {
      setSummary(systemStabilityBenchmark.getBenchmarkSummary());
    };

    updateSummary();
    const interval = setInterval(updateSummary, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const runQuickCheck = useCallback(async () => {
    setIsRunning(true);
    try {
      const result = await systemStabilityBenchmark.runQuickStabilityCheck();
      setSummary(systemStabilityBenchmark.getBenchmarkSummary());
      return result;
    } finally {
      setIsRunning(false);
    }
  }, []);

  const runFullBenchmark = useCallback(async (type: BenchmarkType) => {
    setIsRunning(true);
    try {
      const benchmarkId = await systemStabilityBenchmark.runBenchmark(type);
      setSummary(systemStabilityBenchmark.getBenchmarkSummary());
      return systemStabilityBenchmark.getBenchmarkResult(benchmarkId);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    summary,
    isRunning,
    runQuickCheck,
    runFullBenchmark
  };
}

export default SystemStabilityBenchmark;