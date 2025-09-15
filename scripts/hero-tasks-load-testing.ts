/**
 * @fileoverview HT-004.6.2: Hero Tasks Load Testing Script
 * @description Comprehensive load testing automation for Hero Tasks system
 * @version 1.0.0
 * @author Hero Tasks System - HT-004 Phase 6
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Load testing configuration
const LOAD_TEST_CONFIG = {
  scenarios: {
    light: {
      users: 5,
      duration: 30000,  // 30 seconds
      rampUp: 5000,    // 5 seconds
      description: 'Light load test for basic functionality'
    },
    moderate: {
      users: 20,
      duration: 60000,  // 60 seconds
      rampUp: 10000,   // 10 seconds
      description: 'Moderate load test for normal usage'
    },
    heavy: {
      users: 50,
      duration: 120000, // 2 minutes
      rampUp: 20000,   // 20 seconds
      description: 'Heavy load test for peak usage'
    },
    stress: {
      users: 100,
      duration: 180000, // 3 minutes
      rampUp: 30000,   // 30 seconds
      description: 'Stress test for breaking point'
    },
    spike: {
      users: 200,
      duration: 30000,  // 30 seconds
      rampUp: 5000,    // 5 seconds
      description: 'Spike test for sudden load increases'
    }
  },
  
  performanceThresholds: {
    taskCreation: 200,     // 200ms
    taskUpdate: 100,       // 100ms
    taskDeletion: 150,     // 150ms
    searchQuery: 300,      // 300ms
    bulkOperations: 2000,  // 2s
    exportOperation: 5000, // 5s
    errorRate: 0.05,       // 5% error rate
    responseTime: 1000,    // 1s response time
  },
  
  testData: {
    taskTitles: [
      'Load Test Task 1',
      'Performance Test Task 2',
      'Stress Test Task 3',
      'Spike Test Task 4',
      'Heavy Load Task 5'
    ],
    searchQueries: [
      'load test',
      'performance',
      'stress',
      'spike',
      'heavy'
    ],
    bulkOperations: [
      'mark_complete',
      'mark_in_progress',
      'assign_user',
      'add_tags',
      'set_priority'
    ]
  }
};

// Load testing utilities
class LoadTestRunner {
  private browser: Browser | null = null;
  private results: any[] = [];
  private errors: string[] = [];
  private metrics: Map<string, any> = new Map();

  async initialize(): Promise<void> {
    console.log('🚀 Initializing Hero Tasks Load Testing...');
    
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

  async runScenario(scenarioName: string): Promise<any> {
    const scenario = LOAD_TEST_CONFIG.scenarios[scenarioName as keyof typeof LOAD_TEST_CONFIG.scenarios];
    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }

    console.log(`\n📊 Running ${scenarioName} scenario: ${scenario.description}`);
    console.log(`👥 Users: ${scenario.users}, Duration: ${scenario.duration}ms, Ramp-up: ${scenario.rampUp}ms`);

    const startTime = Date.now();
    const contexts: BrowserContext[] = [];
    const pages: Page[] = [];
    const userResults: any[] = [];

    try {
      // Create browser contexts for each user
      for (let i = 0; i < scenario.users; i++) {
        const context = await this.browser!.newContext({
          viewport: { width: 1920, height: 1080 },
          userAgent: `LoadTest-User-${i + 1}`
        });
        contexts.push(context);
        
        const page = await context.newPage();
        pages.push(page);
      }

      // Ramp up users gradually
      const rampUpDelay = scenario.rampUp / scenario.users;
      
      for (let i = 0; i < pages.length; i++) {
        setTimeout(async () => {
          try {
            const userResult = await this.simulateUserWorkflow(pages[i], i + 1);
            userResults.push(userResult);
          } catch (error) {
            this.errors.push(`User ${i + 1} error: ${error}`);
            console.error(`❌ User ${i + 1} failed:`, error);
          }
        }, i * rampUpDelay);
      }

      // Wait for test duration
      await new Promise(resolve => setTimeout(resolve, scenario.duration));

      // Collect and analyze results
      const endTime = Date.now();
      const actualDuration = endTime - startTime;
      
      const scenarioResult = {
        scenario: scenarioName,
        config: scenario,
        actualDuration,
        users: scenario.users,
        userResults,
        errors: this.errors.filter(error => error.includes(`User`)),
        summary: this.analyzeResults(userResults),
        timestamp: new Date().toISOString()
      };

      this.results.push(scenarioResult);
      
      console.log(`✅ ${scenarioName} scenario completed`);
      console.log(`📈 Results: ${scenarioResult.summary.totalOperations} operations, ${scenarioResult.summary.averageResponseTime}ms avg response time`);
      
      return scenarioResult;

    } finally {
      // Clean up contexts
      await Promise.all(contexts.map(context => context.close()));
    }
  }

  private async simulateUserWorkflow(page: Page, userId: number): Promise<any> {
    const userMetrics: any = {
      userId,
      operations: [],
      errors: [],
      startTime: Date.now()
    };

    try {
      // Navigate to Hero Tasks
      await page.goto('http://localhost:3000/hero-tasks', { 
        waitUntil: 'networkidle',
        timeout: 10000 
      });

      // Simulate user session
      const sessionDuration = Math.random() * 30000 + 10000; // 10-40 seconds
      const endTime = Date.now() + sessionDuration;
      
      while (Date.now() < endTime) {
        try {
          const operation = await this.performRandomOperation(page, userId);
          userMetrics.operations.push(operation);
          
          // Random delay between operations
          await page.waitForTimeout(Math.random() * 2000 + 1000);
          
        } catch (error) {
          userMetrics.errors.push({
            operation: 'unknown',
            error: error.toString(),
            timestamp: Date.now()
          });
        }
      }

      userMetrics.endTime = Date.now();
      userMetrics.duration = userMetrics.endTime - userMetrics.startTime;
      
      return userMetrics;

    } catch (error) {
      userMetrics.errors.push({
        operation: 'initialization',
        error: error.toString(),
        timestamp: Date.now()
      });
      return userMetrics;
    }
  }

  private async performRandomOperation(page: Page, userId: number): Promise<any> {
    const operations = [
      'createTask',
      'updateTask',
      'deleteTask',
      'searchTasks',
      'bulkOperation',
      'exportTasks',
      'navigatePages'
    ];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    const startTime = Date.now();

    try {
      let result: any = { operation, success: false, responseTime: 0 };

      switch (operation) {
        case 'createTask':
          result = await this.createTask(page, userId);
          break;
        case 'updateTask':
          result = await this.updateTask(page, userId);
          break;
        case 'deleteTask':
          result = await this.deleteTask(page, userId);
          break;
        case 'searchTasks':
          result = await this.searchTasks(page, userId);
          break;
        case 'bulkOperation':
          result = await this.bulkOperation(page, userId);
          break;
        case 'exportTasks':
          result = await this.exportTasks(page, userId);
          break;
        case 'navigatePages':
          result = await this.navigatePages(page, userId);
          break;
      }

      result.responseTime = Date.now() - startTime;
      result.timestamp = Date.now();
      
      return result;

    } catch (error) {
      return {
        operation,
        success: false,
        error: error.toString(),
        responseTime: Date.now() - startTime,
        timestamp: Date.now()
      };
    }
  }

  private async createTask(page: Page, userId: number): Promise<any> {
    try {
      // Click new task button
      const newTaskButton = page.getByRole('button', { name: /new task|create task/i });
      await newTaskButton.click({ timeout: 5000 });

      // Fill task form
      const title = `Load Test Task ${userId}-${Date.now()}`;
      const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
      await titleInput.fill(title);

      const descriptionInput = page.getByLabel(/description/i).or(page.locator('textarea'));
      await descriptionInput.fill(`Load test task created by user ${userId}`);

      // Submit task
      const submitButton = page.getByRole('button', { name: /create|save|submit/i });
      await submitButton.click();

      // Wait for task creation
      await page.waitForSelector('[data-testid="task-card"], .task-card', { timeout: 5000 });

      return { operation: 'createTask', success: true, taskTitle: title };
    } catch (error) {
      return { operation: 'createTask', success: false, error: error.toString() };
    }
  }

  private async updateTask(page: Page, userId: number): Promise<any> {
    try {
      // Find a task to update
      const taskCards = page.locator('[data-testid="task-card"], .task-card');
      const taskCount = await taskCards.count();
      
      if (taskCount === 0) {
        return { operation: 'updateTask', success: false, error: 'No tasks available to update' };
      }

      const taskCard = taskCards.first();
      await taskCard.click();

      // Edit task
      const editButton = page.getByRole('button', { name: /edit/i });
      await editButton.click();

      // Update task title
      const titleInput = page.getByLabel(/title/i).or(page.locator('input[placeholder*="title" i]'));
      await titleInput.fill(`Updated Task ${userId}-${Date.now()}`);

      // Save changes
      const saveButton = page.getByRole('button', { name: /save|update/i });
      await saveButton.click();

      await page.waitForTimeout(500);

      return { operation: 'updateTask', success: true };
    } catch (error) {
      return { operation: 'updateTask', success: false, error: error.toString() };
    }
  }

  private async deleteTask(page: Page, userId: number): Promise<any> {
    try {
      // Find a task to delete
      const taskCards = page.locator('[data-testid="task-card"], .task-card');
      const taskCount = await taskCards.count();
      
      if (taskCount === 0) {
        return { operation: 'deleteTask', success: false, error: 'No tasks available to delete' };
      }

      const taskCard = taskCards.first();
      await taskCard.click();

      // Delete task
      const deleteButton = page.getByRole('button', { name: /delete|remove/i });
      await deleteButton.click();

      // Confirm deletion
      const confirmButton = page.getByRole('button', { name: /confirm|yes|delete/i });
      await confirmButton.click();

      await page.waitForTimeout(500);

      return { operation: 'deleteTask', success: true };
    } catch (error) {
      return { operation: 'deleteTask', success: false, error: error.toString() };
    }
  }

  private async searchTasks(page: Page, userId: number): Promise<any> {
    try {
      const searchQuery = LOAD_TEST_CONFIG.testData.searchQueries[
        Math.floor(Math.random() * LOAD_TEST_CONFIG.testData.searchQueries.length)
      ];

      const searchInput = page.getByPlaceholder(/search/i).or(page.locator('input[type="search"]'));
      await searchInput.fill(searchQuery);

      await page.waitForTimeout(1000);

      return { operation: 'searchTasks', success: true, searchQuery };
    } catch (error) {
      return { operation: 'searchTasks', success: false, error: error.toString() };
    }
  }

  private async bulkOperation(page: Page, userId: number): Promise<any> {
    try {
      // Select multiple tasks
      const taskCheckboxes = page.locator('input[type="checkbox"]');
      const checkboxCount = await taskCheckboxes.count();
      
      if (checkboxCount < 2) {
        return { operation: 'bulkOperation', success: false, error: 'Not enough tasks for bulk operation' };
      }

      // Select first 2-3 tasks
      const selectCount = Math.min(3, checkboxCount);
      for (let i = 0; i < selectCount; i++) {
        await taskCheckboxes.nth(i).check();
      }

      // Perform bulk action
      const bulkActionsButton = page.getByRole('button', { name: /bulk actions|batch/i });
      if (await bulkActionsButton.isVisible()) {
        await bulkActionsButton.click();
        
        const statusUpdateButton = page.getByRole('button', { name: /mark complete|update status/i });
        await statusUpdateButton.click();
        
        await page.waitForTimeout(1000);
      }

      return { operation: 'bulkOperation', success: true, tasksSelected: selectCount };
    } catch (error) {
      return { operation: 'bulkOperation', success: false, error: error.toString() };
    }
  }

  private async exportTasks(page: Page, userId: number): Promise<any> {
    try {
      const exportButton = page.getByRole('button', { name: /export/i });
      if (await exportButton.isVisible()) {
        await exportButton.click();
        
        const csvButton = page.getByRole('button', { name: /csv/i });
        await csvButton.click();
        
        await page.waitForTimeout(2000);
      }

      return { operation: 'exportTasks', success: true };
    } catch (error) {
      return { operation: 'exportTasks', success: false, error: error.toString() };
    }
  }

  private async navigatePages(page: Page, userId: number): Promise<any> {
    try {
      const pages = ['/hero-tasks', '/dashboard', '/status'];
      const targetPage = pages[Math.floor(Math.random() * pages.length)];
      
      await page.goto(`http://localhost:3000${targetPage}`, { 
        waitUntil: 'networkidle',
        timeout: 5000 
      });

      return { operation: 'navigatePages', success: true, targetPage };
    } catch (error) {
      return { operation: 'navigatePages', success: false, error: error.toString() };
    }
  }

  private analyzeResults(userResults: any[]): any {
    const allOperations = userResults.flatMap(user => user.operations);
    const successfulOperations = allOperations.filter(op => op.success);
    const failedOperations = allOperations.filter(op => !op.success);
    
    const responseTimes = successfulOperations.map(op => op.responseTime);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const operationCounts = allOperations.reduce((counts, op) => {
      counts[op.operation] = (counts[op.operation] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return {
      totalUsers: userResults.length,
      totalOperations: allOperations.length,
      successfulOperations: successfulOperations.length,
      failedOperations: failedOperations.length,
      successRate: allOperations.length > 0 ? successfulOperations.length / allOperations.length : 0,
      averageResponseTime: Math.round(averageResponseTime),
      operationCounts,
      errorRate: allOperations.length > 0 ? failedOperations.length / allOperations.length : 0
    };
  }

  async runAllScenarios(): Promise<any[]> {
    console.log('🚀 Starting Hero Tasks Load Testing Suite');
    console.log('=' .repeat(60));

    const scenarios = Object.keys(LOAD_TEST_CONFIG.scenarios);
    const results: any[] = [];

    for (const scenario of scenarios) {
      try {
        const result = await this.runScenario(scenario);
        results.push(result);
        
        // Wait between scenarios
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (error) {
        console.error(`❌ Scenario ${scenario} failed:`, error);
        this.errors.push(`Scenario ${scenario} failed: ${error}`);
      }
    }

    return results;
  }

  generateReport(results: any[]): void {
    console.log('\n📊 Load Testing Report');
    console.log('=' .repeat(60));

    results.forEach(result => {
      console.log(`\n📈 ${result.scenario.toUpperCase()} SCENARIO`);
      console.log(`👥 Users: ${result.summary.totalUsers}`);
      console.log(`⚡ Total Operations: ${result.summary.totalOperations}`);
      console.log(`✅ Success Rate: ${(result.summary.successRate * 100).toFixed(1)}%`);
      console.log(`⏱️  Average Response Time: ${result.summary.averageResponseTime}ms`);
      console.log(`❌ Error Rate: ${(result.summary.errorRate * 100).toFixed(1)}%`);
      
      if (result.summary.operationCounts) {
        console.log(`📋 Operation Breakdown:`);
        Object.entries(result.summary.operationCounts).forEach(([op, count]) => {
          console.log(`   ${op}: ${count}`);
        });
      }
    });

    // Generate JSON report
    const report = {
      timestamp: new Date().toISOString(),
      config: LOAD_TEST_CONFIG,
      results,
      summary: {
        totalScenarios: results.length,
        totalUsers: results.reduce((sum, r) => sum + r.summary.totalUsers, 0),
        totalOperations: results.reduce((sum, r) => sum + r.summary.totalOperations, 0),
        overallSuccessRate: results.reduce((sum, r) => sum + r.summary.successRate, 0) / results.length,
        overallErrorRate: results.reduce((sum, r) => sum + r.summary.errorRate, 0) / results.length,
        averageResponseTime: results.reduce((sum, r) => sum + r.summary.averageResponseTime, 0) / results.length
      },
      errors: this.errors
    };

    writeFileSync('hero-tasks-load-test-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Detailed report saved to: hero-tasks-load-test-report.json');
  }
}

// Main execution
async function main() {
  const runner = new LoadTestRunner();
  
  try {
    await runner.initialize();
    
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
    
    const results = await runner.runAllScenarios();
    runner.generateReport(results);
    
    console.log('\n🎉 Load testing completed successfully!');
    
  } catch (error) {
    console.error('💥 Load testing failed:', error);
    process.exit(1);
  } finally {
    await runner.cleanup();
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default LoadTestRunner;
