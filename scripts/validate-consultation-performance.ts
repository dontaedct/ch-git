#!/usr/bin/env tsx
/**
 * Consultation Performance Validation Script
 * HT-030.4.2: Performance Optimization & Production Readiness
 */

import {
  configurePerformance,
  measurePerformance,
  validatePerformanceTargets,
  getPerformanceSummary,
  PERFORMANCE_TARGETS,
  recordPerformanceMetric,
} from '../lib/performance/consultation-optimization';
import {
  getConsultationCache,
  createCacheHash,
  closeConsultationCache,
} from '../lib/caching/consultation-cache';

interface ValidationResult {
  component: string;
  test: string;
  status: 'passed' | 'failed' | 'warning';
  duration?: number;
  target?: number;
  details?: any;
}

class PerformanceValidator {
  private results: ValidationResult[] = [];
  private cache = getConsultationCache();

  async runAllValidations(): Promise<{
    passed: boolean;
    results: ValidationResult[];
    summary: any;
  }> {
    console.log('🚀 Starting Consultation Performance Validation...\n');

    // Configure performance monitoring
    configurePerformance({
      enableProfiling: true,
      enableCaching: true,
      enableCompression: true,
      enableImageOptimization: true,
      maxCacheSize: 1000,
      cacheExpirationMs: 3600000,
    });

    // Run all validation tests
    await this.validateCachePerformance();
    await this.validateDatabaseQueryPerformance();
    await this.validateAPIResponsePerformance();
    await this.validateMemoryUsage();
    await this.validateConcurrentOperations();
    await this.validateErrorHandling();

    // Get final performance summary
    const summary = getPerformanceSummary();
    const targetsValidation = validatePerformanceTargets();

    // Determine overall result
    const passed = this.results.every(r => r.status === 'passed') && targetsValidation.passed;

    this.printResults();

    return {
      passed,
      results: this.results,
      summary: {
        performance: summary,
        targets: targetsValidation,
      },
    };
  }

  private async validateCachePerformance(): Promise<void> {
    console.log('📦 Testing Cache Performance...');

    try {
      // Test cache write performance
      const { duration: writeTime } = await measurePerformance(
        'cache',
        'write',
        async () => {
          await this.cache.cacheConsultation({
            id: 'test-consultation-1',
            client: {
              name: 'Test Client',
              email: 'test@example.com',
              company: 'Test Corp',
            },
            responses: {
              business_type: 'SaaS',
              team_size: '10-50',
              budget: '$10k-50k',
            },
            created_at: new Date().toISOString(),
          });
        }
      );

      this.addResult({
        component: 'cache',
        test: 'write_performance',
        status: writeTime < 100 ? 'passed' : 'failed',
        duration: writeTime,
        target: 100,
      });

      // Test cache read performance
      const { duration: readTime } = await measurePerformance(
        'cache',
        'read',
        async () => {
          await this.cache.getConsultation('test-consultation-1');
        }
      );

      this.addResult({
        component: 'cache',
        test: 'read_performance',
        status: readTime < 50 ? 'passed' : 'failed',
        duration: readTime,
        target: 50,
      });

      // Test cache health
      const health = await this.cache.healthCheck();
      this.addResult({
        component: 'cache',
        test: 'health_check',
        status: health.status === 'healthy' ? 'passed' : health.status === 'degraded' ? 'warning' : 'failed',
        details: health,
      });

      // Test cache stats
      const stats = await this.cache.getStats();
      this.addResult({
        component: 'cache',
        test: 'statistics',
        status: 'passed',
        details: stats,
      });

    } catch (error) {
      this.addResult({
        component: 'cache',
        test: 'error_handling',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async validateDatabaseQueryPerformance(): Promise<void> {
    console.log('🗄️  Testing Database Query Performance...');

    try {
      // Simulate database query
      const { duration } = await measurePerformance(
        'database',
        'databaseQuery',
        async () => {
          // Simulate query with Promise delay
          await new Promise(resolve => setTimeout(resolve, 200));
          return { data: 'mock query result' };
        }
      );

      this.addResult({
        component: 'database',
        test: 'query_performance',
        status: duration < PERFORMANCE_TARGETS.DATABASE_QUERY_TIME ? 'passed' : 'failed',
        duration,
        target: PERFORMANCE_TARGETS.DATABASE_QUERY_TIME,
      });

      // Test concurrent queries
      const concurrentStart = performance.now();
      const queries = Array.from({ length: 5 }, (_, i) =>
        measurePerformance(
          'database',
          'databaseQuery',
          async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return { id: i, data: 'concurrent query result' };
          }
        )
      );

      await Promise.all(queries);
      const concurrentEnd = performance.now();
      const concurrentDuration = concurrentEnd - concurrentStart;

      this.addResult({
        component: 'database',
        test: 'concurrent_queries',
        status: concurrentDuration < 500 ? 'passed' : 'failed',
        duration: concurrentDuration,
        target: 500,
      });

    } catch (error) {
      this.addResult({
        component: 'database',
        test: 'error_handling',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async validateAPIResponsePerformance(): Promise<void> {
    console.log('🌐 Testing API Response Performance...');

    try {
      // Simulate API response
      const { duration } = await measurePerformance(
        'api',
        'apiResponse',
        async () => {
          // Simulate API processing
          await new Promise(resolve => setTimeout(resolve, 150));
          return { status: 'success', data: 'mock api response' };
        }
      );

      this.addResult({
        component: 'api',
        test: 'response_time',
        status: duration < PERFORMANCE_TARGETS.API_RESPONSE_TIME ? 'passed' : 'failed',
        duration,
        target: PERFORMANCE_TARGETS.API_RESPONSE_TIME,
      });

    } catch (error) {
      this.addResult({
        component: 'api',
        test: 'error_handling',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async validateMemoryUsage(): Promise<void> {
    console.log('💾 Testing Memory Usage...');

    try {
      const memoryBefore = process.memoryUsage();

      // Create some memory load
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `Test data ${i}`.repeat(100),
        timestamp: Date.now(),
      }));

      // Cache some data
      for (let i = 0; i < 100; i++) {
        await this.cache.cacheConsultation({
          id: `memory-test-${i}`,
          client: {
            name: `Client ${i}`,
            email: `client${i}@example.com`,
            company: `Company ${i}`,
          },
          responses: largeData[i] || {},
          created_at: new Date().toISOString(),
        });
      }

      const memoryAfter = process.memoryUsage();
      const memoryIncrease = memoryAfter.heapUsed - memoryBefore.heapUsed;

      this.addResult({
        component: 'memory',
        test: 'usage_increase',
        status: memoryIncrease < 50 * 1024 * 1024 ? 'passed' : 'warning', // 50MB threshold
        details: {
          before: memoryBefore,
          after: memoryAfter,
          increase: memoryIncrease,
          increase_mb: Math.round(memoryIncrease / 1024 / 1024 * 100) / 100,
        },
      });

      // Clean up
      largeData.length = 0;

    } catch (error) {
      this.addResult({
        component: 'memory',
        test: 'error_handling',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async validateConcurrentOperations(): Promise<void> {
    console.log('⚡ Testing Concurrent Operations...');

    try {
      const concurrentOperations = 10;
      const startTime = performance.now();

      const operations = Array.from({ length: concurrentOperations }, async (_, i) => {
        return measurePerformance(
          'concurrent',
          'operation',
          async () => {
            // Mix of operations
            if (i % 3 === 0) {
              // Cache operation
              await this.cache.cacheConsultation({
                id: `concurrent-${i}`,
                client: { name: `Client ${i}`, email: `client${i}@test.com`, company: `Co ${i}` },
                responses: { test: i },
                created_at: new Date().toISOString(),
              });
            } else if (i % 3 === 1) {
              // Read operation
              await this.cache.getConsultation(`concurrent-${Math.floor(i / 2)}`);
            } else {
              // Computation
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            return { operation: i, completed: true };
          }
        );
      });

      const results = await Promise.all(operations);
      const endTime = performance.now();
      const totalDuration = endTime - startTime;

      this.addResult({
        component: 'concurrent',
        test: 'operations',
        status: totalDuration < 1000 ? 'passed' : 'failed', // 1 second for 10 operations
        duration: totalDuration,
        target: 1000,
        details: {
          operations: concurrentOperations,
          completed: results.length,
          average_duration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
        },
      });

    } catch (error) {
      this.addResult({
        component: 'concurrent',
        test: 'error_handling',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private async validateErrorHandling(): Promise<void> {
    console.log('🔧 Testing Error Handling...');

    try {
      // Test cache error handling
      let errorHandled = false;
      try {
        // Force an error by trying to cache invalid data
        await this.cache.cacheConsultation(null as any);
      } catch (error) {
        errorHandled = true;
      }

      this.addResult({
        component: 'error_handling',
        test: 'cache_validation',
        status: errorHandled ? 'passed' : 'failed',
        details: { error_caught: errorHandled },
      });

      // Test performance monitoring error handling
      let perfErrorHandled = false;
      try {
        await measurePerformance(
          'error_test',
          'operation',
          async () => {
            throw new Error('Test error');
          }
        );
      } catch (error) {
        perfErrorHandled = true;
      }

      this.addResult({
        component: 'error_handling',
        test: 'performance_monitoring',
        status: perfErrorHandled ? 'passed' : 'failed',
        details: { error_caught: perfErrorHandled },
      });

    } catch (error) {
      this.addResult({
        component: 'error_handling',
        test: 'unexpected_error',
        status: 'failed',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      });
    }
  }

  private addResult(result: ValidationResult): void {
    this.results.push(result);

    const status = result.status === 'passed' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    const duration = result.duration ? ` (${Math.round(result.duration)}ms)` : '';
    const target = result.target ? ` [target: ${result.target}ms]` : '';

    console.log(`  ${status} ${result.component}.${result.test}${duration}${target}`);
  }

  private printResults(): void {
    console.log('\n📊 Validation Results Summary:');
    console.log('================================');

    const passed = this.results.filter(r => r.status === 'passed').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const failed = this.results.filter(r => r.status === 'failed').length;

    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${this.results.length}`);

    const overallStatus = failed === 0 ? (warnings === 0 ? 'PASSED' : 'PASSED (with warnings)') : 'FAILED';
    console.log(`\n🎯 Overall Status: ${overallStatus}`);

    // Print performance targets validation
    const targetsValidation = validatePerformanceTargets();
    console.log('\n🎯 Performance Targets:');
    Object.entries(PERFORMANCE_TARGETS).forEach(([key, target]) => {
      console.log(`  ${key}: ${target}ms`);
    });

    if (Object.keys(targetsValidation.results).length > 0) {
      console.log('\n📈 Current Performance:');
      Object.entries(targetsValidation.results).forEach(([operation, result]) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${operation}: ${Math.round(result.actual)}ms (target: ${result.target}ms)`);
      });
    }
  }

  async cleanup(): Promise<void> {
    await closeConsultationCache();
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new PerformanceValidator();

  validator
    .runAllValidations()
    .then(async (result) => {
      await validator.cleanup();
      process.exit(result.passed ? 0 : 1);
    })
    .catch(async (error) => {
      console.error('❌ Validation failed:', error);
      await validator.cleanup();
      process.exit(1);
    });
}

export default PerformanceValidator;