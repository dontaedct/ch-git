/**
 * Consultation Performance Health Check API
 * HT-030.4.2: Performance Optimization & Production Readiness
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validatePerformanceTargets,
  getPerformanceSummary,
  PERFORMANCE_TARGETS,
} from '@/lib/performance/consultation-optimization';
import { getConsultationCache } from '@/lib/caching/consultation-cache';

/**
 * GET /api/performance/consultation/health
 * Comprehensive health check for consultation performance
 */
export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();

    // Validate performance targets
    const performanceValidation = validatePerformanceTargets();

    // Get performance summary
    const performanceSummary = getPerformanceSummary();

    // Check cache health
    const cache = getConsultationCache();
    const cacheHealth = await cache.healthCheck();
    const cacheStats = await cache.getStats();

    // System health indicators
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      timestamp: Date.now(),
      response_time: Date.now() - startTime,
      checks: {
        performance: {
          status: performanceValidation.passed ? 'passing' : 'failing',
          targets_met: Object.values(performanceValidation.results).filter(r => r.passed).length,
          total_targets: Object.keys(performanceValidation.results).length,
          details: performanceValidation.results,
        },
        cache: {
          status: cacheHealth.status,
          redis: cacheHealth.redis,
          fallback: cacheHealth.fallback,
          stats: cacheStats,
          details: cacheHealth.details,
        },
        operations: {
          total_operations: performanceSummary.totalOperations,
          average_duration: Math.round(performanceSummary.averageDuration),
          slow_operations: performanceSummary.slowOperations,
          error_rate: Math.round(performanceSummary.errorRate * 100) / 100,
        },
        targets: {
          page_load: PERFORMANCE_TARGETS.PAGE_LOAD_TIME,
          ai_generation: PERFORMANCE_TARGETS.AI_GENERATION_TIME,
          pdf_generation: PERFORMANCE_TARGETS.PDF_GENERATION_TIME,
          email_delivery: PERFORMANCE_TARGETS.EMAIL_DELIVERY_TIME,
          database_query: PERFORMANCE_TARGETS.DATABASE_QUERY_TIME,
          api_response: PERFORMANCE_TARGETS.API_RESPONSE_TIME,
        },
      },
    };

    // Determine overall health status
    if (
      !performanceValidation.passed ||
      cacheHealth.status === 'unhealthy' ||
      performanceSummary.errorRate > 0.1 // >10% error rate
    ) {
      health.status = 'unhealthy';
    } else if (
      cacheHealth.status === 'degraded' ||
      performanceSummary.slowOperations > performanceSummary.totalOperations * 0.2 // >20% slow operations
    ) {
      health.status = 'degraded';
    }

    // HTTP status based on health
    const httpStatus = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(health, { status: httpStatus });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: Date.now(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}

/**
 * POST /api/performance/consultation/health
 * Run comprehensive performance validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { run_tests = false, warm_cache = false } = body;

    const results: any = {
      timestamp: Date.now(),
      tests_run: [],
      validation: {},
      cache_warmup: null,
    };

    // Run performance validation
    results.validation = validatePerformanceTargets();

    // Warm up cache if requested
    if (warm_cache) {
      const cache = getConsultationCache();
      await cache.warmupCache();
      results.cache_warmup = {
        completed: true,
        timestamp: Date.now(),
      };
    }

    // Run performance tests if requested
    if (run_tests) {
      const testResults = await runPerformanceTests();
      results.tests_run = testResults;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Performance validation error:', error);

    return NextResponse.json(
      {
        error: 'Performance validation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}

/**
 * Run basic performance tests
 */
async function runPerformanceTests(): Promise<any[]> {
  const tests = [];

  try {
    // Test cache performance
    const cache = getConsultationCache();
    const cacheStartTime = Date.now();

    await cache.set('test', 'performance_test', { test: 'data' }, 300);
    const cacheData = await cache.get('test', 'performance_test');
    await cache.delete('test', 'performance_test');

    const cacheEndTime = Date.now();

    tests.push({
      name: 'cache_operations',
      duration: cacheEndTime - cacheStartTime,
      status: cacheData ? 'passed' : 'failed',
      target: 100, // 100ms target for cache operations
    });

    // Test API response time (self-test)
    const apiStartTime = Date.now();
    const response = await fetch('/api/performance/consultation', {
      method: 'GET',
    });
    const apiEndTime = Date.now();

    tests.push({
      name: 'api_response',
      duration: apiEndTime - apiStartTime,
      status: response.ok ? 'passed' : 'failed',
      target: PERFORMANCE_TARGETS.API_RESPONSE_TIME,
    });

    // Test memory usage
    const memoryUsage = process.memoryUsage();
    tests.push({
      name: 'memory_usage',
      duration: 0,
      status: memoryUsage.heapUsed < 500 * 1024 * 1024 ? 'passed' : 'warning', // 500MB warning
      target: 500 * 1024 * 1024,
      metadata: {
        heap_used: memoryUsage.heapUsed,
        heap_total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
      },
    });

  } catch (error) {
    tests.push({
      name: 'performance_tests',
      duration: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return tests;
}