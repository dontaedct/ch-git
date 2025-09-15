/**
 * @fileoverview HT-004.6.2: Hero Tasks Performance Benchmarking
 * @description Comprehensive performance benchmarking and optimization for Hero Tasks system
 * @version 1.0.0
 * @author Hero Tasks System - HT-004 Phase 6
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

// Benchmarking configuration
const BENCHMARK_CONFIG = {
  iterations: 10,
  warmupRuns: 3,
  timeout: 30000,
  
  benchmarks: {
    taskOperations: {
      create: { iterations: 20, threshold: 200 },
      update: { iterations: 20, threshold: 100 },
      delete: { iterations: 20, threshold: 150 },
      query: { iterations: 20, threshold: 500 }
    },
    
    searchOperations: {
      simple: { iterations: 20, threshold: 300 },
      complex: { iterations: 20, threshold: 500 },
      filter: { iterations: 20, threshold: 200 },
      sort: { iterations: 20, threshold: 150 }
    },
    
    bulkOperations: {
      statusUpdate: { iterations: 10, threshold: 2000 },
      assignment: { iterations: 10, threshold: 2000 },
      tagging: { iterations: 10, threshold: 2000 },
      priority: { iterations: 10, threshold: 2000 }
    },
    
    exportOperations: {
      csv: { iterations: 5, threshold: 5000 },
      json: { iterations: 5, threshold: 3000 },
      pdf: { iterations: 5, threshold: 10000 }
    },
    
    realTimeFeatures: {
      websocketConnection: { iterations: 10, threshold: 1000 },
      realTimeUpdate: { iterations: 20, threshold: 50 },
      presenceIndicator: { iterations: 20, threshold: 100 }
    },
    
    mobileOperations: {
      taskCreation: { iterations: 15, threshold: 300 },
      navigation: { iterations: 15, threshold: 500 },
      touchInteraction: { iterations: 20, threshold: 100 }
    }
  },
  
  testData: {
    taskTitles: [
      'Benchmark Task 1',
      'Performance Test Task 2',
      'Speed Test Task 3',
      'Optimization Task 4',
      'Efficiency Task 5'
    ],
    searchQueries: [
      'benchmark',
      'performance',
      'test',
      'optimization',
      'efficiency'
    ],
    bulkData: {
      tasks: 50,
      subtasks: 200,
      tags: 100
    }
  }
};

// Performance benchmarking utilities
class PerformanceBenchmark {
  private browser: Browser | null = null;
  private results: Map<string, any> = new Map();
  private baselineMetrics: Map<string, number> = new Map();

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Hero Tasks Performance Benchmarking...');
    
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    console.log('✅ Browser initialized');
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      console.log('🧹 Browser cleaned up');
    }
  }

  async runBenchmark(benchmarkName: string): Promise<any> {
    const config = BENCHMARK_CONFIG.benchmarks[benchmarkName as keyof typeof BENCHMARK_CONFIG.benchmarks];
    if (!config) {
      throw new Error(`Unknown benchmark: ${benchmarkName}`);
    }

    console.log(`\n📊 Running ${benchmarkName} benchmark...`);

    const context = await this.browser!.newContext({
      viewport: { width: 1920, height: 1080 }
    });

    try {
      const page = await context.newPage();
      
      // Warmup runs
      console.log(`🔥 Running ${BENCHMARK_CONFIG.warmupRuns} warmup runs...`);
      for (let i = 0; i < BENCHMARK_CONFIG.warmupRuns; i++) {
        await this.executeBenchmarkOperation(page, benchmarkName);
        await page.waitForTimeout(1000);
      }

      // Actual benchmark runs
      console.log(`⚡ Running ${config.iterations} benchmark iterations...`);
      const measurements: number[] = [];

      for (let i = 0; i < config.iterations; i++) {
        const startTime = Date.now();
        await this.executeBenchmarkOperation(page, benchmarkName);
        const endTime = Date.now();
        
        measurements.push(endTime - startTime);
        
        // Progress indicator
        if ((i + 1) % 5 === 0) {
          console.log(`   Completed ${i + 1}/${config.iterations} iterations`);
        }
        
        await page.waitForTimeout(500);
      }

      // Calculate statistics
      const stats = this.calculateStatistics(measurements);
      const result = {
        benchmark: benchmarkName,
        config,
        measurements,
        statistics: stats,
        threshold: config.threshold,
        passed: stats.mean <= config.threshold,
        timestamp: new Date().toISOString()
      };

      this.results.set(benchmarkName, result);
      
      console.log(`✅ ${benchmarkName} benchmark completed`);
      console.log(`📈 Mean: ${stats.mean}ms, Median: ${stats.median}ms, Threshold: ${config.threshold}ms`);
      console.log(`🎯 Status: ${result.passed ? 'PASSED' : 'FAILED'}`);
      
      return result;

    } finally {
      await context.close();
    }
  }

  private async executeBenchmarkOperation(page: Page, benchmarkName: string): Promise<void> {
    switch (benchmarkName) {
      case 'taskOperations':
        await this.benchmarkTaskOperations(page);
        break;
      case 'searchOperations':
        await this.benchmarkSearchOperations(page);
        break;
      case 'bulkOperations':
        await this.benchmarkBulkOperations(page);
        break;
      case 'exportOperations':
        await this.benchmarkExportOperations(page);
        break;
      case 'realTimeFeatures':
        await this.benchmarkRealTimeFeatures(page);
        break;
      case 'mobileOperations':
        await this.benchmarkMobileOperations(page);
        break;
      default:
        throw new Error(`Unknown benchmark operation: ${benchmarkName}`);
    }
  }

  private async benchmarkTaskOperations(page: Page): Promise<void> {
    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Create a task
    const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
    await newTaskButton.click();

    const title = `Benchmark Task ${Date.now()}`;
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
    await titleInput.fill(title);

    const descriptionInput = page.getByLabel(/description/i).or(page.locator('textarea'));
    await descriptionInput.fill('Benchmark test task');

    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });

    // Update the task
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    await taskCard.click();

    const editButton = page.getByRole('button', { name: /edit/i });
    await editButton.click();

    await titleInput.fill(`Updated ${title}`);
    
    const saveButton = page.getByRole('button', { name: /save|update/i });
    await saveButton.click();

    await page.waitForTimeout(500);

    // Delete the task
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();

    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    await confirmButton.click();

    await page.waitForTimeout(500);
  }

  private async benchmarkSearchOperations(page: Page): Promise<void> {
    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Create some test tasks
    for (let i = 0; i < 3; i++) {
      const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
      await newTaskButton.click();

      const title = `Search Test Task ${i + 1}`;
      const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
      await titleInput.fill(title);

      const submitButton = page.getByRole('button', { name: /create|save|submit/i });
      await submitButton.click();

      await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });
      await page.waitForTimeout(500);
    }

    // Perform search operations
    const searchQuery = BENCHMARK_CONFIG.testData.searchQueries[
      Math.floor(Math.random() * BENCHMARK_CONFIG.testData.searchQueries.length)
    ];

    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]'));
    await searchInput.fill(searchQuery);

    await page.waitForTimeout(1000);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);
  }

  private async benchmarkBulkOperations(page: Page): Promise<void> {
    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Create multiple tasks for bulk operations
    for (let i = 0; i < 5; i++) {
      const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
      await newTaskButton.click();

      const title = `Bulk Test Task ${i + 1}`;
      const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
      await titleInput.fill(title);

      const submitButton = page.getByRole('button', { name: /create|save|submit/i });
      await submitButton.click();

      await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });
      await page.waitForTimeout(500);
    }

    // Perform bulk operation
    const taskCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await taskCheckboxes.count();
    
    if (checkboxCount >= 3) {
      // Select first 3 tasks
      for (let i = 0; i < 3; i++) {
        await taskCheckboxes.nth(i).check();
      }

      // Perform bulk status update
      const bulkActionsButton = page.getByRole('button', { name: /bulk actions|batch/i });
      if (await bulkActionsButton.isVisible()) {
        await bulkActionsButton.click();
        
        const statusUpdateButton = page.getByRole('button', { name: /mark complete|update status/i });
        await statusUpdateButton.click();
        
        await page.waitForTimeout(1000);
      }
    }
  }

  private async benchmarkExportOperations(page: Page): Promise<void> {
    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Create some tasks for export
    for (let i = 0; i < 3; i++) {
      const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
      await newTaskButton.click();

      const title = `Export Test Task ${i + 1}`;
      const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
      await titleInput.fill(title);

      const submitButton = page.getByRole('button', { name: /create|save|submit/i });
      await submitButton.click();

      await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });
      await page.waitForTimeout(500);
    }

    // Perform export operation
    const exportButton = page.getByRole('button', { name: /export/i });
    if (await exportButton.isVisible()) {
      await exportButton.click();
      
      const csvButton = page.getByRole('button', { name: /csv/i });
      await csvButton.click();
      
      await page.waitForTimeout(2000);
    }
  }

  private async benchmarkRealTimeFeatures(page: Page): Promise<void> {
    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Simulate real-time operations
    const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
    await newTaskButton.click();

    const title = `Real-time Test Task ${Date.now()}`;
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
    await titleInput.fill(title);

    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });

    // Simulate real-time updates
    await page.waitForTimeout(1000);
  }

  private async benchmarkMobileOperations(page: Page): Promise<void> {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to Hero Tasks
    await page.goto('http://localhost:3000/hero-tasks', { 
      waitUntil: 'networkidle',
      timeout: 10000 
    });

    // Create a task on mobile
    const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
    await newTaskButton.click();

    const title = `Mobile Test Task ${Date.now()}`;
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
    await titleInput.fill(title);

    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();

    await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });

    // Test touch interaction
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    await taskCard.tap();

    await page.waitForTimeout(500);
  }

  private calculateStatistics(measurements: number[]): any {
    const sorted = [...measurements].sort((a, b) => a - b);
    const n = sorted.length;
    
    const mean = measurements.reduce((sum, val) => sum + val, 0) / n;
    const median = n % 2 === 0 
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
      : sorted[Math.floor(n / 2)];
    
    const variance = measurements.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const standardDeviation = Math.sqrt(variance);
    
    const min = Math.min(...measurements);
    const max = Math.max(...measurements);
    
    const p95 = sorted[Math.floor(n * 0.95)];
    const p99 = sorted[Math.floor(n * 0.99)];

    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      standardDeviation: Math.round(standardDeviation * 100) / 100,
      min,
      max,
      p95,
      p99,
      count: n
    };
  }

  async runAllBenchmarks(): Promise<any[]> {
    console.log('🚀 Starting Hero Tasks Performance Benchmarking Suite');
    console.log('=' .repeat(60));

    const benchmarks = Object.keys(BENCHMARK_CONFIG.benchmarks);
    const results: any[] = [];

    for (const benchmark of benchmarks) {
      try {
        const result = await this.runBenchmark(benchmark);
        results.push(result);
        
        // Wait between benchmarks
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Benchmark ${benchmark} failed:`, error);
      }
    }

    return results;
  }

  generateReport(results: any[]): void {
    console.log('\n📊 Performance Benchmarking Report');
    console.log('=' .repeat(60));

    let totalPassed = 0;
    let totalFailed = 0;

    results.forEach(result => {
      const status = result.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`\n📈 ${result.benchmark.toUpperCase()}`);
      console.log(`🎯 Status: ${status}`);
      console.log(`⏱️  Mean Response Time: ${result.statistics.mean}ms`);
      console.log(`📊 Median Response Time: ${result.statistics.median}ms`);
      console.log(`📏 Standard Deviation: ${result.statistics.standardDeviation}ms`);
      console.log(`🎯 Threshold: ${result.threshold}ms`);
      console.log(`📈 P95: ${result.statistics.p95}ms`);
      console.log(`📈 P99: ${result.statistics.p99}ms`);
      
      if (result.passed) {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });

    console.log(`\n📊 OVERALL SUMMARY`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`📈 Success Rate: ${((totalPassed / results.length) * 100).toFixed(1)}%`);

    // Generate detailed JSON report
    const report = {
      timestamp: new Date().toISOString(),
      config: BENCHMARK_CONFIG,
      results,
      summary: {
        totalBenchmarks: results.length,
        passed: totalPassed,
        failed: totalFailed,
        successRate: totalPassed / results.length,
        averageResponseTime: results.reduce((sum, r) => sum + r.statistics.mean, 0) / results.length
      }
    };

    writeFileSync('hero-tasks-performance-benchmark.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: hero-tasks-performance-benchmark.json');
  }
}

// Main execution
async function main() {
  const benchmark = new PerformanceBenchmark();
  
  try {
    await benchmark.initialize();
    
    // Check if server is running
    try {
      execSync('curl -f http://localhost:3000/hero-tasks > /dev/null 2>&1', { stdio: 'pipe' });
    } catch {
      console.log('🌐 Starting development server...');
      execSync('npm run dev &', { stdio: 'inherit' });
      
      // Wait for server to start
      console.log('⏳ Waiting for server to start...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
    const results = await benchmark.runAllBenchmarks();
    benchmark.generateReport(results);
    
    console.log('\n🎉 Performance benchmarking completed successfully!');
    
  } catch (error) {
    console.error('💥 Performance benchmarking failed:', error);
    process.exit(1);
  } finally {
    await benchmark.cleanup();
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default PerformanceBenchmark;
