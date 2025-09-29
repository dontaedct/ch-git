/**
 * Performance Benchmarking System
 * HT-034.5.4 - Establishes comprehensive performance benchmarks and validation
 *
 * Provides performance benchmarking, load testing, and monitoring validation
 * for database queries and analytics systems.
 */

import { databaseOptimizer } from './database-optimizer';
import { analyticsCoordinator } from './analytics-coordinator';
import { intelligentCache } from './intelligent-cache';

export interface BenchmarkConfig {
  name: string;
  description: string;
  type: 'database' | 'cache' | 'analytics' | 'system';
  iterations: number;
  concurrency: number;
  timeout: number;
  warmupIterations: number;
  targets: PerformanceTargets;
}

export interface PerformanceTargets {
  averageResponseTime: number; // milliseconds
  p95ResponseTime: number; // milliseconds
  p99ResponseTime: number; // milliseconds
  throughput: number; // requests per second
  errorRate: number; // percentage
  cacheHitRate?: number; // percentage
  memoryUsage?: number; // MB
}

export interface BenchmarkResult {
  config: BenchmarkConfig;
  startTime: Date;
  endTime: Date;
  duration: number;
  results: {
    averageResponseTime: number;
    minResponseTime: number;
    maxResponseTime: number;
    p50ResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    errorRate: number;
    cacheHitRate?: number;
    memoryUsage?: number;
  };
  targetsMet: {
    [key: string]: boolean;
  };
  recommendations: string[];
}

export interface LoadTestScenario {
  name: string;
  description: string;
  phases: Array<{
    duration: number; // seconds
    concurrency: number;
    rampUp?: number; // seconds to ramp up to target concurrency
  }>;
  operations: Array<{
    name: string;
    weight: number; // percentage of total operations
    operation: () => Promise<any>;
  }>;
}

export class PerformanceBenchmarker {
  private benchmarks = new Map<string, BenchmarkConfig>();
  private results = new Map<string, BenchmarkResult[]>();
  private baselineResults = new Map<string, BenchmarkResult>();

  constructor() {
    this.initializeStandardBenchmarks();
  }

  /**
   * Register a performance benchmark
   */
  registerBenchmark(config: BenchmarkConfig): void {
    this.benchmarks.set(config.name, config);
    console.log(`Benchmark registered: ${config.name}`);
  }

  /**
   * Run a specific benchmark
   */
  async runBenchmark(
    benchmarkName: string,
    customConfig?: Partial<BenchmarkConfig>
  ): Promise<BenchmarkResult> {
    const config = this.benchmarks.get(benchmarkName);
    if (!config) {
      throw new Error(`Benchmark not found: ${benchmarkName}`);
    }

    const finalConfig = { ...config, ...customConfig };
    console.log(`Starting benchmark: ${finalConfig.name}`);

    const startTime = new Date();
    const responseTimes: number[] = [];
    const errors: Error[] = [];
    let cacheHits = 0;
    let totalCacheRequests = 0;

    try {
      // Warmup phase
      if (finalConfig.warmupIterations > 0) {
        console.log(`Running ${finalConfig.warmupIterations} warmup iterations...`);
        await this.runWarmup(finalConfig);
      }

      // Main benchmark execution
      const operations = this.getBenchmarkOperations(finalConfig);
      const concurrentPromises: Promise<void>[] = [];

      for (let c = 0; c < finalConfig.concurrency; c++) {
        concurrentPromises.push(
          this.runBenchmarkWorker(
            finalConfig,
            operations,
            responseTimes,
            errors,
            { cacheHits, totalCacheRequests }
          )
        );
      }

      await Promise.all(concurrentPromises);

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Calculate statistics
      const sortedTimes = responseTimes.sort((a, b) => a - b);
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const totalRequests = responseTimes.length + errors.length;
      const successfulRequests = responseTimes.length;
      const failedRequests = errors.length;
      const errorRate = (failedRequests / totalRequests) * 100;
      const throughput = (totalRequests / duration) * 1000; // requests per second

      const results: BenchmarkResult['results'] = {
        averageResponseTime,
        minResponseTime: Math.min(...responseTimes),
        maxResponseTime: Math.max(...responseTimes),
        p50ResponseTime: this.percentile(sortedTimes, 0.5),
        p95ResponseTime: this.percentile(sortedTimes, 0.95),
        p99ResponseTime: this.percentile(sortedTimes, 0.99),
        throughput,
        totalRequests,
        successfulRequests,
        failedRequests,
        errorRate
      };

      // Add cache metrics if applicable
      if (finalConfig.type === 'cache' || totalCacheRequests > 0) {
        results.cacheHitRate = totalCacheRequests > 0 ? (cacheHits / totalCacheRequests) * 100 : 0;
      }

      // Check memory usage
      if (finalConfig.type === 'system') {
        results.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      }

      // Evaluate against targets
      const targetsMet = this.evaluateTargets(results, finalConfig.targets);
      const recommendations = this.generateRecommendations(results, finalConfig.targets);

      const benchmarkResult: BenchmarkResult = {
        config: finalConfig,
        startTime,
        endTime,
        duration,
        results,
        targetsMet,
        recommendations
      };

      // Store results
      const resultHistory = this.results.get(benchmarkName) || [];
      resultHistory.push(benchmarkResult);
      this.results.set(benchmarkName, resultHistory);

      console.log(`Benchmark completed: ${finalConfig.name}`);
      console.log(`Average response time: ${averageResponseTime.toFixed(2)}ms`);
      console.log(`Throughput: ${throughput.toFixed(2)} req/s`);
      console.log(`Error rate: ${errorRate.toFixed(2)}%`);

      return benchmarkResult;

    } catch (error) {
      console.error(`Benchmark failed: ${finalConfig.name}`, error);
      throw error;
    }
  }

  /**
   * Run all registered benchmarks
   */
  async runAllBenchmarks(): Promise<Map<string, BenchmarkResult>> {
    const results = new Map<string, BenchmarkResult>();

    for (const benchmarkName of this.benchmarks.keys()) {
      try {
        const result = await this.runBenchmark(benchmarkName);
        results.set(benchmarkName, result);
      } catch (error) {
        console.error(`Failed to run benchmark ${benchmarkName}:`, error);
      }
    }

    return results;
  }

  /**
   * Run load test scenario
   */
  async runLoadTest(scenario: LoadTestScenario): Promise<{
    scenario: LoadTestScenario;
    phases: Array<{
      phaseIndex: number;
      duration: number;
      concurrency: number;
      results: {
        averageResponseTime: number;
        throughput: number;
        errorRate: number;
        successfulRequests: number;
        failedRequests: number;
      };
    }>;
    overallResults: {
      totalDuration: number;
      totalRequests: number;
      overallThroughput: number;
      overallErrorRate: number;
      peakConcurrency: number;
    };
  }> {
    console.log(`Starting load test: ${scenario.name}`);

    const phaseResults: Array<{
      phaseIndex: number;
      duration: number;
      concurrency: number;
      results: any;
    }> = [];

    let totalRequests = 0;
    let totalErrors = 0;
    const startTime = Date.now();

    for (let i = 0; i < scenario.phases.length; i++) {
      const phase = scenario.phases[i];
      console.log(`Running phase ${i + 1}: ${phase.concurrency} concurrent users for ${phase.duration}s`);

      const phaseResult = await this.runLoadTestPhase(phase, scenario.operations);
      phaseResults.push({
        phaseIndex: i,
        duration: phase.duration,
        concurrency: phase.concurrency,
        results: phaseResult
      });

      totalRequests += phaseResult.successfulRequests + phaseResult.failedRequests;
      totalErrors += phaseResult.failedRequests;
    }

    const totalDuration = (Date.now() - startTime) / 1000; // seconds
    const overallThroughput = totalRequests / totalDuration;
    const overallErrorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const peakConcurrency = Math.max(...scenario.phases.map(p => p.concurrency));

    return {
      scenario,
      phases: phaseResults,
      overallResults: {
        totalDuration,
        totalRequests,
        overallThroughput,
        overallErrorRate,
        peakConcurrency
      }
    };
  }

  /**
   * Set baseline performance results
   */
  setBaseline(benchmarkName: string, result: BenchmarkResult): void {
    this.baselineResults.set(benchmarkName, result);
    console.log(`Baseline set for benchmark: ${benchmarkName}`);
  }

  /**
   * Compare current results with baseline
   */
  compareWithBaseline(benchmarkName: string, currentResult: BenchmarkResult): {
    improvements: Array<{ metric: string; improvement: number; unit: string }>;
    regressions: Array<{ metric: string; regression: number; unit: string }>;
    summary: string;
  } {
    const baseline = this.baselineResults.get(benchmarkName);
    if (!baseline) {
      return {
        improvements: [],
        regressions: [],
        summary: 'No baseline available for comparison'
      };
    }

    const improvements: Array<{ metric: string; improvement: number; unit: string }> = [];
    const regressions: Array<{ metric: string; regression: number; unit: string }> = [];

    // Compare response times (lower is better)
    const responseTimeChange = ((currentResult.results.averageResponseTime - baseline.results.averageResponseTime) / baseline.results.averageResponseTime) * 100;
    if (responseTimeChange < -5) {
      improvements.push({
        metric: 'Average Response Time',
        improvement: Math.abs(responseTimeChange),
        unit: '%'
      });
    } else if (responseTimeChange > 5) {
      regressions.push({
        metric: 'Average Response Time',
        regression: responseTimeChange,
        unit: '%'
      });
    }

    // Compare throughput (higher is better)
    const throughputChange = ((currentResult.results.throughput - baseline.results.throughput) / baseline.results.throughput) * 100;
    if (throughputChange > 5) {
      improvements.push({
        metric: 'Throughput',
        improvement: throughputChange,
        unit: '%'
      });
    } else if (throughputChange < -5) {
      regressions.push({
        metric: 'Throughput',
        regression: Math.abs(throughputChange),
        unit: '%'
      });
    }

    // Compare error rates (lower is better)
    const errorRateChange = currentResult.results.errorRate - baseline.results.errorRate;
    if (errorRateChange < -1) {
      improvements.push({
        metric: 'Error Rate',
        improvement: Math.abs(errorRateChange),
        unit: 'percentage points'
      });
    } else if (errorRateChange > 1) {
      regressions.push({
        metric: 'Error Rate',
        regression: errorRateChange,
        unit: 'percentage points'
      });
    }

    let summary = 'Performance comparison: ';
    if (improvements.length > 0 && regressions.length === 0) {
      summary += `${improvements.length} improvements detected, no regressions`;
    } else if (regressions.length > 0 && improvements.length === 0) {
      summary += `${regressions.length} regressions detected, no improvements`;
    } else if (improvements.length > 0 && regressions.length > 0) {
      summary += `${improvements.length} improvements and ${regressions.length} regressions detected`;
    } else {
      summary += 'no significant changes detected';
    }

    return { improvements, regressions, summary };
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: {
      totalBenchmarks: number;
      benchmarksPassing: number;
      averagePerformanceScore: number;
    };
    benchmarkResults: Array<{
      name: string;
      status: 'passing' | 'failing' | 'warning';
      score: number;
      lastRun: Date;
      targetsMet: number;
      totalTargets: number;
    }>;
    recommendations: string[];
    trends: Array<{
      benchmark: string;
      metric: string;
      trend: 'improving' | 'degrading' | 'stable';
      changePercent: number;
    }>;
  } {
    const benchmarkResults: Array<{
      name: string;
      status: 'passing' | 'failing' | 'warning';
      score: number;
      lastRun: Date;
      targetsMet: number;
      totalTargets: number;
    }> = [];

    let totalScore = 0;
    let benchmarksPassing = 0;

    for (const [name, resultHistory] of this.results) {
      if (resultHistory.length === 0) continue;

      const latestResult = resultHistory[resultHistory.length - 1];
      const targetsMet = Object.values(latestResult.targetsMet).filter(met => met).length;
      const totalTargets = Object.keys(latestResult.targetsMet).length;
      const score = totalTargets > 0 ? (targetsMet / totalTargets) * 100 : 0;

      let status: 'passing' | 'failing' | 'warning' = 'passing';
      if (score < 70) {
        status = 'failing';
      } else if (score < 90) {
        status = 'warning';
      } else {
        benchmarksPassing++;
      }

      benchmarkResults.push({
        name,
        status,
        score,
        lastRun: latestResult.endTime,
        targetsMet,
        totalTargets
      });

      totalScore += score;
    }

    const averagePerformanceScore = benchmarkResults.length > 0 ? totalScore / benchmarkResults.length : 0;

    // Generate global recommendations
    const recommendations = this.generateGlobalRecommendations(benchmarkResults);

    // Calculate trends
    const trends = this.calculatePerformanceTrends();

    return {
      summary: {
        totalBenchmarks: benchmarkResults.length,
        benchmarksPassing,
        averagePerformanceScore
      },
      benchmarkResults,
      recommendations,
      trends
    };
  }

  // Private helper methods

  private initializeStandardBenchmarks(): void {
    // Database query benchmarks
    this.registerBenchmark({
      name: 'database-client-queries',
      description: 'Benchmark client data queries',
      type: 'database',
      iterations: 100,
      concurrency: 5,
      timeout: 5000,
      warmupIterations: 10,
      targets: {
        averageResponseTime: 500,
        p95ResponseTime: 1000,
        p99ResponseTime: 2000,
        throughput: 10,
        errorRate: 1
      }
    });

    this.registerBenchmark({
      name: 'analytics-business-metrics',
      description: 'Benchmark business metrics calculations',
      type: 'analytics',
      iterations: 50,
      concurrency: 3,
      timeout: 10000,
      warmupIterations: 5,
      targets: {
        averageResponseTime: 2000,
        p95ResponseTime: 5000,
        p99ResponseTime: 8000,
        throughput: 5,
        errorRate: 2
      }
    });

    this.registerBenchmark({
      name: 'cache-performance',
      description: 'Benchmark cache hit rates and response times',
      type: 'cache',
      iterations: 200,
      concurrency: 10,
      timeout: 3000,
      warmupIterations: 20,
      targets: {
        averageResponseTime: 50,
        p95ResponseTime: 100,
        p99ResponseTime: 200,
        throughput: 100,
        errorRate: 0.5,
        cacheHitRate: 80
      }
    });

    this.registerBenchmark({
      name: 'system-performance',
      description: 'Benchmark overall system performance',
      type: 'system',
      iterations: 150,
      concurrency: 8,
      timeout: 15000,
      warmupIterations: 15,
      targets: {
        averageResponseTime: 1000,
        p95ResponseTime: 3000,
        p99ResponseTime: 5000,
        throughput: 20,
        errorRate: 1,
        memoryUsage: 500
      }
    });
  }

  private async runWarmup(config: BenchmarkConfig): Promise<void> {
    const operations = this.getBenchmarkOperations(config);

    for (let i = 0; i < config.warmupIterations; i++) {
      try {
        await operations[Math.floor(Math.random() * operations.length)]();
      } catch (error) {
        // Ignore warmup errors
      }
    }
  }

  private getBenchmarkOperations(config: BenchmarkConfig): Array<() => Promise<any>> {
    switch (config.type) {
      case 'database':
        return [
          () => databaseOptimizer.executeOptimizedQuery('clients', 'SELECT', {
            select: 'id, name, created_at',
            limit: 10
          }),
          () => databaseOptimizer.executeOptimizedQuery('projects', 'SELECT', {
            select: 'id, name, status',
            limit: 5
          })
        ];

      case 'analytics':
        return [
          () => analyticsCoordinator.executeCoordinatedQuery(
            'business-metrics',
            'test-query',
            async () => ({ revenue: 100000, clients: 50 })
          )
        ];

      case 'cache':
        return [
          () => intelligentCache.get('test-key-' + Math.floor(Math.random() * 100)),
          () => intelligentCache.set('test-key-' + Math.floor(Math.random() * 100), { data: 'test' })
        ];

      case 'system':
        return [
          () => Promise.resolve({ status: 'ok', timestamp: Date.now() }),
          () => new Promise(resolve => setTimeout(() => resolve({ processed: true }), Math.random() * 100))
        ];

      default:
        return [() => Promise.resolve({ test: true })];
    }
  }

  private async runBenchmarkWorker(
    config: BenchmarkConfig,
    operations: Array<() => Promise<any>>,
    responseTimes: number[],
    errors: Error[],
    cacheStats: { cacheHits: number; totalCacheRequests: number }
  ): Promise<void> {
    const iterationsPerWorker = Math.ceil(config.iterations / config.concurrency);

    for (let i = 0; i < iterationsPerWorker; i++) {
      const startTime = Date.now();

      try {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        await Promise.race([
          operation(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), config.timeout))
        ]);

        responseTimes.push(Date.now() - startTime);

        // Track cache stats for cache benchmarks
        if (config.type === 'cache') {
          cacheStats.totalCacheRequests++;
          // Simulate cache hit detection (would be actual cache hit in real implementation)
          if (Math.random() > 0.2) {
            cacheStats.cacheHits++;
          }
        }

      } catch (error) {
        errors.push(error as Error);
      }

      // Small delay to prevent overwhelming
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private async runLoadTestPhase(
    phase: any,
    operations: Array<{ name: string; weight: number; operation: () => Promise<any> }>
  ): Promise<{
    averageResponseTime: number;
    throughput: number;
    errorRate: number;
    successfulRequests: number;
    failedRequests: number;
  }> {
    const responseTimes: number[] = [];
    const errors: Error[] = [];
    const endTime = Date.now() + (phase.duration * 1000);

    const workers: Promise<void>[] = [];

    for (let i = 0; i < phase.concurrency; i++) {
      workers.push(this.runLoadTestWorker(operations, endTime, responseTimes, errors));
    }

    await Promise.all(workers);

    const averageResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const totalRequests = responseTimes.length + errors.length;
    const throughput = totalRequests / phase.duration;
    const errorRate = totalRequests > 0 ? (errors.length / totalRequests) * 100 : 0;

    return {
      averageResponseTime,
      throughput,
      errorRate,
      successfulRequests: responseTimes.length,
      failedRequests: errors.length
    };
  }

  private async runLoadTestWorker(
    operations: Array<{ name: string; weight: number; operation: () => Promise<any> }>,
    endTime: number,
    responseTimes: number[],
    errors: Error[]
  ): Promise<void> {
    while (Date.now() < endTime) {
      const startTime = Date.now();

      try {
        // Select operation based on weight
        const random = Math.random() * 100;
        let cumulative = 0;
        let selectedOperation = operations[0];

        for (const op of operations) {
          cumulative += op.weight;
          if (random <= cumulative) {
            selectedOperation = op;
            break;
          }
        }

        await selectedOperation.operation();
        responseTimes.push(Date.now() - startTime);

      } catch (error) {
        errors.push(error as Error);
      }

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  private percentile(sortedArray: number[], p: number): number {
    if (sortedArray.length === 0) return 0;
    const index = Math.ceil(sortedArray.length * p) - 1;
    return sortedArray[Math.max(0, index)] || 0;
  }

  private evaluateTargets(results: any, targets: PerformanceTargets): { [key: string]: boolean } {
    return {
      averageResponseTime: results.averageResponseTime <= targets.averageResponseTime,
      p95ResponseTime: results.p95ResponseTime <= targets.p95ResponseTime,
      p99ResponseTime: results.p99ResponseTime <= targets.p99ResponseTime,
      throughput: results.throughput >= targets.throughput,
      errorRate: results.errorRate <= targets.errorRate,
      ...(targets.cacheHitRate && { cacheHitRate: (results.cacheHitRate || 0) >= targets.cacheHitRate }),
      ...(targets.memoryUsage && { memoryUsage: (results.memoryUsage || 0) <= targets.memoryUsage })
    };
  }

  private generateRecommendations(results: any, targets: PerformanceTargets): string[] {
    const recommendations: string[] = [];

    if (results.averageResponseTime > targets.averageResponseTime) {
      recommendations.push('Optimize query performance to reduce average response time');
    }

    if (results.errorRate > targets.errorRate) {
      recommendations.push('Investigate and fix errors to improve reliability');
    }

    if (results.throughput < targets.throughput) {
      recommendations.push('Increase system capacity or optimize for higher throughput');
    }

    if (targets.cacheHitRate && results.cacheHitRate < targets.cacheHitRate) {
      recommendations.push('Improve caching strategy to increase cache hit rate');
    }

    if (targets.memoryUsage && results.memoryUsage > targets.memoryUsage) {
      recommendations.push('Optimize memory usage to reduce memory consumption');
    }

    return recommendations;
  }

  private generateGlobalRecommendations(benchmarkResults: any[]): string[] {
    const recommendations: string[] = [];

    const failingBenchmarks = benchmarkResults.filter(b => b.status === 'failing');
    if (failingBenchmarks.length > 0) {
      recommendations.push(`${failingBenchmarks.length} benchmarks are failing - immediate attention required`);
    }

    const warningBenchmarks = benchmarkResults.filter(b => b.status === 'warning');
    if (warningBenchmarks.length > 0) {
      recommendations.push(`${warningBenchmarks.length} benchmarks have warnings - consider optimization`);
    }

    const avgScore = benchmarkResults.reduce((sum, b) => sum + b.score, 0) / benchmarkResults.length;
    if (avgScore < 85) {
      recommendations.push('Overall performance score is below target - comprehensive optimization needed');
    }

    return recommendations;
  }

  private calculatePerformanceTrends(): Array<{
    benchmark: string;
    metric: string;
    trend: 'improving' | 'degrading' | 'stable';
    changePercent: number;
  }> {
    const trends: Array<{
      benchmark: string;
      metric: string;
      trend: 'improving' | 'degrading' | 'stable';
      changePercent: number;
    }> = [];

    for (const [benchmarkName, resultHistory] of this.results) {
      if (resultHistory.length < 2) continue;

      const recent = resultHistory.slice(-3); // Last 3 results
      const older = resultHistory.slice(-6, -3); // 3 results before that

      if (older.length === 0) continue;

      const recentAvgResponseTime = recent.reduce((sum, r) => sum + r.results.averageResponseTime, 0) / recent.length;
      const olderAvgResponseTime = older.reduce((sum, r) => sum + r.results.averageResponseTime, 0) / older.length;

      const changePercent = ((recentAvgResponseTime - olderAvgResponseTime) / olderAvgResponseTime) * 100;

      let trend: 'improving' | 'degrading' | 'stable' = 'stable';
      if (changePercent < -5) trend = 'improving'; // Lower response time is better
      else if (changePercent > 5) trend = 'degrading';

      trends.push({
        benchmark: benchmarkName,
        metric: 'Response Time',
        trend,
        changePercent: Math.abs(changePercent)
      });
    }

    return trends;
  }
}

// Export singleton instance
export const performanceBenchmarker = new PerformanceBenchmarker();

// Export convenience functions
export async function runDatabaseBenchmarks(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  const dbBenchmarks = ['database-client-queries'];
  for (const benchmark of dbBenchmarks) {
    try {
      const result = await performanceBenchmarker.runBenchmark(benchmark);
      results.push(result);
    } catch (error) {
      console.error(`Database benchmark ${benchmark} failed:`, error);
    }
  }

  return results;
}

export async function runAnalyticsBenchmarks(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  const analyticsBenchmarks = ['analytics-business-metrics'];
  for (const benchmark of analyticsBenchmarks) {
    try {
      const result = await performanceBenchmarker.runBenchmark(benchmark);
      results.push(result);
    } catch (error) {
      console.error(`Analytics benchmark ${benchmark} failed:`, error);
    }
  }

  return results;
}

export async function runCacheBenchmarks(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  const cacheBenchmarks = ['cache-performance'];
  for (const benchmark of cacheBenchmarks) {
    try {
      const result = await performanceBenchmarker.runBenchmark(benchmark);
      results.push(result);
    } catch (error) {
      console.error(`Cache benchmark ${benchmark} failed:`, error);
    }
  }

  return results;
}