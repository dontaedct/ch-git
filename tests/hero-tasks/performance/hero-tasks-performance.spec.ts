/**
 * @fileoverview HT-004.6.2: Hero Tasks Performance Testing
 * @description Comprehensive performance testing for Hero Tasks system including load testing, stress testing, and benchmarking
 * @version 1.0.0
 * @author Hero Tasks System - HT-004 Phase 6
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Hero Tasks Performance Configuration
const HERO_TASKS_PERFORMANCE_CONFIG = {
  budgets: {
    // Task operations performance
    taskCreation: 200,        // 200ms for task creation
    taskUpdate: 100,          // 100ms for task updates
    taskDeletion: 150,        // 150ms for task deletion
    taskQuery: 500,           // 500ms for task queries
    bulkOperations: 2000,    // 2s for bulk operations
    
    // Real-time features performance
    websocketConnection: 1000, // 1s for WebSocket connection
    realTimeUpdate: 50,       // 50ms for real-time updates
    presenceIndicator: 100,   // 100ms for presence updates
    
    // Search and filtering performance
    searchQuery: 300,         // 300ms for search queries
    filterApplication: 200,   // 200ms for filter application
    sortOperation: 150,      // 150ms for sorting operations
    
    // Export operations performance
    csvExport: 5000,         // 5s for CSV export
    jsonExport: 3000,        // 3s for JSON export
    pdfExport: 10000,        // 10s for PDF export
    
    // Mobile performance
    mobileTaskCreation: 300,  // 300ms for mobile task creation
    mobileNavigation: 500,   // 500ms for mobile navigation
    touchInteraction: 100,   // 100ms for touch interactions
    
    // Memory usage limits
    memoryUsage: 50,          // 50MB memory usage limit
    memoryLeakThreshold: 10,  // 10MB memory leak threshold
  },
  
  thresholds: {
    // Concurrent user limits
    maxConcurrentUsers: 100,
    maxTasksPerUser: 1000,
    maxSubtasksPerTask: 50,
    
    // Performance degradation thresholds
    performanceDegradation: 0.2,  // 20% degradation threshold
    errorRateThreshold: 0.05,     // 5% error rate threshold
  },
  
  // Test scenarios
  scenarios: {
    load: {
      users: 10,
      duration: 30000,  // 30 seconds
      rampUp: 5000,     // 5 seconds ramp up
    },
    stress: {
      users: 50,
      duration: 60000,  // 60 seconds
      rampUp: 10000,   // 10 seconds ramp up
    },
    spike: {
      users: 100,
      duration: 10000,  // 10 seconds
      rampUp: 2000,     // 2 seconds ramp up
    },
  },
};

// Performance measurement utilities for Hero Tasks
class HeroTasksPerformanceMonitor {
  private metrics: Map<string, any> = new Map();
  private startTimes: Map<string, number> = new Map();

  startTiming(label: string): void {
    this.startTimes.set(label, Date.now());
  }

  endTiming(label: string): number {
    const startTime = this.startTimes.get(label);
    if (!startTime) {
      throw new Error(`No start time found for ${label}`);
    }
    
    const duration = Date.now() - startTime;
    this.metrics.set(label, {
      duration,
      timestamp: Date.now(),
    });
    return duration;
  }

  getMetric(label: string): any {
    return this.metrics.get(label);
  }

  getAllMetrics(): Record<string, any> {
    return Object.fromEntries(this.metrics);
  }

  // Task-specific performance measurements
  async measureTaskCreation(page: Page): Promise<number> {
    this.startTiming('taskCreation');
    
    // Navigate to task creation
    await page.goto('/hero-tasks');
    await page.waitForLoadState('networkidle');
    
    // Click new task button
    const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
    await newTaskButton.click();
    
    // Fill task form
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
    await titleInput.fill('Performance Test Task');
    
    const descriptionInput = page.getByLabel(/description/i).or(page.locator('textarea'));
    await descriptionInput.fill('This is a performance test task');
    
    // Submit task
    const submitButton = page.getByRole('button', { name: /create|save|submit/i });
    await submitButton.click();
    
    // Wait for task to be created
    await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });
    
    return this.endTiming('taskCreation');
  }

  async measureTaskUpdate(page: Page, taskId?: string): Promise<number> {
    this.startTiming('taskUpdate');
    
    // Find a task to update
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    await taskCard.click();
    
    // Edit task
    const editButton = page.getByRole('button', { name: /edit/i });
    await editButton.click();
    
    // Update task title
    const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
    await titleInput.fill('Updated Performance Test Task');
    
    // Save changes
    const saveButton = page.getByRole('button', { name: /save|update/i });
    await saveButton.click();
    
    // Wait for update to complete
    await page.waitForTimeout(500);
    
    return this.endTiming('taskUpdate');
  }

  async measureTaskDeletion(page: Page): Promise<number> {
    this.startTiming('taskDeletion');
    
    // Find a task to delete
    const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
    await taskCard.click();
    
    // Delete task
    const deleteButton = page.getByRole('button', { name: /delete|remove/i });
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
    await confirmButton.click();
    
    // Wait for deletion to complete
    await page.waitForTimeout(500);
    
    return this.endTiming('taskDeletion');
  }

  async measureSearchPerformance(page: Page, query: string): Promise<number> {
    this.startTiming('searchQuery');
    
    // Navigate to tasks page
    await page.goto('/hero-tasks');
    await page.waitForLoadState('networkidle');
    
    // Perform search
    const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]'));
    await searchInput.fill(query);
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    return this.endTiming('searchQuery');
  }

  async measureBulkOperations(page: Page): Promise<number> {
    this.startTiming('bulkOperations');
    
    // Navigate to tasks page
    await page.goto('/hero-tasks');
    await page.waitForLoadState('networkidle');
    
    // Select multiple tasks
    const taskCheckboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await taskCheckboxes.count();
    
    if (checkboxCount > 0) {
      // Select first 3 tasks
      for (let i = 0; i < Math.min(3, checkboxCount); i++) {
        await taskCheckboxes.nth(i).check();
      }
      
      // Perform bulk status update
      const bulkActionsButton = page.getByRole('button', { name: /bulk actions|batch/i });
      if (await bulkActionsButton.isVisible()) {
        await bulkActionsButton.click();
        
        const statusUpdateButton = page.getByRole('button', { name: /mark complete|update status/i });
        await statusUpdateButton.click();
        
        // Wait for bulk operation to complete
        await page.waitForTimeout(1000);
      }
    }
    
    return this.endTiming('bulkOperations');
  }

  async measureExportPerformance(page: Page, format: 'csv' | 'json' | 'pdf'): Promise<number> {
    this.startTiming(`${format}Export`);
    
    // Navigate to tasks page
    await page.goto('/hero-tasks');
    await page.waitForLoadState('networkidle');
    
    // Click export button
    const exportButton = page.getByRole('button', { name: /export/i });
    await exportButton.click();
    
    // Select format
    const formatButton = page.getByRole('button', { name: new RegExp(format, 'i') });
    await formatButton.click();
    
    // Wait for export to complete
    await page.waitForTimeout(2000);
    
    return this.endTiming(`${format}Export`);
  }

  async measureMemoryUsage(page: Page): Promise<any> {
    return await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  }
}

// Load testing utilities
class LoadTester {
  private results: any[] = [];
  private errors: string[] = [];

  async runLoadTest(context: BrowserContext, scenario: string): Promise<any> {
    const config = HERO_TASKS_PERFORMANCE_CONFIG.scenarios[scenario as keyof typeof HERO_TASKS_PERFORMANCE_CONFIG.scenarios];
    const pages: Page[] = [];
    const monitor = new HeroTasksPerformanceMonitor();

    console.log(`🚀 Starting ${scenario} load test with ${config.users} users`);

    try {
      // Create multiple browser contexts for concurrent users
      for (let i = 0; i < config.users; i++) {
        const page = await context.newPage();
        pages.push(page);
      }

      // Ramp up users gradually
      const rampUpDelay = config.rampUp / config.users;
      
      for (let i = 0; i < pages.length; i++) {
        setTimeout(async () => {
          try {
            await this.simulateUserWorkflow(pages[i], monitor);
          } catch (error) {
            this.errors.push(`User ${i} error: ${error}`);
          }
        }, i * rampUpDelay);
      }

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, config.duration));

      // Collect results
      const results = {
        scenario,
        users: config.users,
        duration: config.duration,
        metrics: monitor.getAllMetrics(),
        errors: this.errors,
        timestamp: new Date().toISOString(),
      };

      this.results.push(results);
      return results;

    } finally {
      // Clean up pages
      await Promise.all(pages.map(page => page.close()));
    }
  }

  private async simulateUserWorkflow(page: Page, monitor: HeroTasksPerformanceMonitor): Promise<void> {
    // Simulate typical user workflow
    const actions = [
      () => monitor.measureTaskCreation(page),
      () => monitor.measureTaskUpdate(page),
      () => monitor.measureSearchPerformance(page, 'test'),
      () => monitor.measureBulkOperations(page),
    ];

    // Randomly execute actions
    for (let i = 0; i < 10; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      try {
        await action();
        await page.waitForTimeout(Math.random() * 2000 + 1000); // Random delay 1-3s
      } catch (error) {
        this.errors.push(`Action error: ${error}`);
      }
    }
  }

  getResults(): any[] {
    return this.results;
  }

  getErrors(): string[] {
    return this.errors;
  }
}

// Performance test suite
test.describe('HT-004.6.2: Hero Tasks Performance Testing', () => {
  let performanceMonitor: HeroTasksPerformanceMonitor;
  let loadTester: LoadTester;

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new HeroTasksPerformanceMonitor();
    loadTester = new LoadTester();
    
    // Set up performance monitoring
    await page.addInitScript(() => {
      // Enable performance observer for Hero Tasks
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          (window as any).heroTasksPerformanceEntries = (window as any).heroTasksPerformanceEntries || [];
          (window as any).heroTasksPerformanceEntries.push(...list.getEntries());
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      }
    });
  });

  test.describe('Task Operations Performance', () => {
    test('should create tasks within performance budget', async ({ page }) => {
      const creationTime = await performanceMonitor.measureTaskCreation(page);
      
      expect(creationTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.taskCreation);
      
      // Verify task was created
      await expect(page.locator('[data-testid="task-card"], .task-card')).toBeVisible();
    });

    test('should update tasks within performance budget', async ({ page }) => {
      // First create a task
      await performanceMonitor.measureTaskCreation(page);
      
      // Then update it
      const updateTime = await performanceMonitor.measureTaskUpdate(page);
      
      expect(updateTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.taskUpdate);
    });

    test('should delete tasks within performance budget', async ({ page }) => {
      // First create a task
      await performanceMonitor.measureTaskCreation(page);
      
      // Then delete it
      const deletionTime = await performanceMonitor.measureTaskDeletion(page);
      
      expect(deletionTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.taskDeletion);
    });

    test('should handle bulk operations efficiently', async ({ page }) => {
      // Create multiple tasks first
      for (let i = 0; i < 3; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const bulkTime = await performanceMonitor.measureBulkOperations(page);
      
      expect(bulkTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.bulkOperations);
    });
  });

  test.describe('Search and Filtering Performance', () => {
    test('should perform search queries within budget', async ({ page }) => {
      // Create some tasks first
      for (let i = 0; i < 3; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const searchTime = await performanceMonitor.measureSearchPerformance(page, 'test');
      
      expect(searchTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.searchQuery);
    });

    test('should handle complex search queries efficiently', async ({ page }) => {
      // Create tasks with different content
      const tasks = ['urgent bug fix', 'feature implementation', 'documentation update'];
      
      for (const task of tasks) {
        await page.goto('/hero-tasks');
        await page.waitForLoadState('networkidle');
        
        const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
        await newTaskButton.click();
        
        const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
        await titleInput.fill(task);
        
        const submitButton = page.getByRole('button', { name: /create|save|submit/i });
        await submitButton.click();
        
        await page.waitForTimeout(500);
      }
      
      // Test complex search
      const searchTime = await performanceMonitor.measureSearchPerformance(page, 'urgent bug');
      
      expect(searchTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.searchQuery);
    });
  });

  test.describe('Export Performance', () => {
    test('should export CSV within performance budget', async ({ page }) => {
      // Create some tasks first
      for (let i = 0; i < 5; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const exportTime = await performanceMonitor.measureExportPerformance(page, 'csv');
      
      expect(exportTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.csvExport);
    });

    test('should export JSON within performance budget', async ({ page }) => {
      // Create some tasks first
      for (let i = 0; i < 5; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const exportTime = await performanceMonitor.measureExportPerformance(page, 'json');
      
      expect(exportTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.jsonExport);
    });

    test('should export PDF within performance budget', async ({ page }) => {
      // Create some tasks first
      for (let i = 0; i < 5; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const exportTime = await performanceMonitor.measureExportPerformance(page, 'pdf');
      
      expect(exportTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.pdfExport);
    });
  });

  test.describe('Memory Usage', () => {
    test('should maintain memory usage within budget', async ({ page }) => {
      // Perform extended operations
      for (let i = 0; i < 10; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await page.waitForTimeout(500);
      }
      
      const memory = await performanceMonitor.measureMemoryUsage(page);
      
      if (memory) {
        const memoryUsageMB = memory.usedJSHeapSize / 1024 / 1024;
        expect(memoryUsageMB).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.memoryUsage);
      }
    });

    test('should not have memory leaks during extended use', async ({ page }) => {
      const initialMemory = await performanceMonitor.measureMemoryUsage(page);
      
      // Perform many operations
      for (let i = 0; i < 20; i++) {
        await performanceMonitor.measureTaskCreation(page);
        await performanceMonitor.measureTaskUpdate(page);
        await page.waitForTimeout(200);
      }
      
      const finalMemory = await performanceMonitor.measureMemoryUsage(page);
      
      if (initialMemory && finalMemory) {
        const memoryIncrease = (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / 1024 / 1024;
        expect(memoryIncrease).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.memoryLeakThreshold);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const creationTime = await performanceMonitor.measureTaskCreation(page);
      
      // Mobile should be within 50% of desktop budget
      expect(creationTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.mobileTaskCreation);
    });

    test('should handle touch interactions efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Create a task
      await performanceMonitor.measureTaskCreation(page);
      
      // Test touch interactions
      performanceMonitor.startTiming('touchInteraction');
      
      const taskCard = page.locator('[data-testid="task-card"], .task-card').first();
      await taskCard.tap();
      
      performanceMonitor.endTiming('touchInteraction');
      
      const touchTime = performanceMonitor.getMetric('touchInteraction')?.duration;
      expect(touchTime).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.touchInteraction);
    });
  });

  test.describe('Load Testing', () => {
    test('should handle load test scenario', async ({ browser }) => {
      const context = await browser.newContext();
      
      const results = await loadTester.runLoadTest(context, 'load');
      
      expect(results.users).toBe(HERO_TASKS_PERFORMANCE_CONFIG.scenarios.load.users);
      expect(results.errors.length).toBeLessThan(results.users * 0.1); // Less than 10% error rate
      
      await context.close();
    });

    test('should handle stress test scenario', async ({ browser }) => {
      const context = await browser.newContext();
      
      const results = await loadTester.runLoadTest(context, 'stress');
      
      expect(results.users).toBe(HERO_TASKS_PERFORMANCE_CONFIG.scenarios.stress.users);
      expect(results.errors.length).toBeLessThan(results.users * 0.2); // Less than 20% error rate
      
      await context.close();
    });

    test('should handle spike test scenario', async ({ browser }) => {
      const context = await browser.newContext();
      
      const results = await loadTester.runLoadTest(context, 'spike');
      
      expect(results.users).toBe(HERO_TASKS_PERFORMANCE_CONFIG.scenarios.spike.users);
      expect(results.errors.length).toBeLessThan(results.users * 0.3); // Less than 30% error rate
      
      await context.close();
    });
  });

  test.describe('Performance Regression Testing', () => {
    test('should maintain consistent performance across runs', async ({ page }) => {
      const runs = 3;
      const creationTimes: number[] = [];
      
      for (let i = 0; i < runs; i++) {
        const creationTime = await performanceMonitor.measureTaskCreation(page);
        creationTimes.push(creationTime);
        
        // Clean up
        await performanceMonitor.measureTaskDeletion(page);
        
        // Clear cache between runs
        await page.context().clearCookies();
        await page.evaluate(() => {
          if ('caches' in window) {
            return caches.keys().then(names => {
              return Promise.all(names.map(name => caches.delete(name)));
            });
          }
        });
      }
      
      // Calculate variance
      const avgTime = creationTimes.reduce((sum, time) => sum + time, 0) / runs;
      const variance = creationTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / runs;
      const standardDeviation = Math.sqrt(variance);
      
      // Performance should be consistent (low variance)
      expect(standardDeviation).toBeLessThan(avgTime * 0.2); // Less than 20% variance
      
      // All runs should be within budget
      creationTimes.forEach(time => {
        expect(time).toBeLessThan(HERO_TASKS_PERFORMANCE_CONFIG.budgets.taskCreation);
      });
    });
  });
});
