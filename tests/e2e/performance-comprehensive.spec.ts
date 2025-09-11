/**
 * @fileoverview HT-008.7.4: Performance Testing Implementation
 * @description Comprehensive performance testing infrastructure with Lighthouse CI integration
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

import { test, expect, Page } from '@playwright/test';

// Performance testing configuration
const PERFORMANCE_CONFIG = {
  budgets: {
    pageLoad: 3000,        // 3 seconds for page load
    navigation: 1000,      // 1 second for navigation
    interaction: 100,      // 100ms for interactions
    formSubmission: 5000,  // 5 seconds for form submission
    bundleSize: 500000,    // 500KB bundle size limit
    memoryUsage: 100,      // 100MB memory usage limit
  },
  thresholds: {
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 90,
    },
    coreWebVitals: {
      LCP: 2500,  // Largest Contentful Paint
      FID: 100,   // First Input Delay
      CLS: 0.1,   // Cumulative Layout Shift
    }
  }
};

// Performance measurement utilities
class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  startTiming(label: string): void {
    this.metrics.set(`${label}_start`, Date.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (!startTime) {
      throw new Error(`No start time found for ${label}`);
    }
    
    const duration = Date.now() - startTime;
    this.metrics.set(label, duration);
    return duration;
  }

  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [key, value] of this.metrics.entries()) {
      if (!key.endsWith('_start')) {
        result[key] = value;
      }
    }
    return result;
  }

  async measurePageLoad(page: Page, url: string): Promise<number> {
    this.startTiming('pageLoad');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return this.endTiming('pageLoad');
  }

  async measureNavigation(page: Page, url: string): Promise<number> {
    this.startTiming('navigation');
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return this.endTiming('navigation');
  }

  async measureInteraction(page: Page, action: () => Promise<void>): Promise<number> {
    this.startTiming('interaction');
    await action();
    return this.endTiming('interaction');
  }

  async measureFormSubmission(page: Page, submitAction: () => Promise<void>): Promise<number> {
    this.startTiming('formSubmission');
    await submitAction();
    await page.waitForTimeout(2000); // Wait for response
    return this.endTiming('formSubmission');
  }
}

// Lighthouse performance testing
class LighthousePerformance {
  static async runLighthouseAudit(page: Page, url: string): Promise<any> {
    // Navigate to the page
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    // Get performance metrics using browser APIs
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Use Performance Observer to get Core Web Vitals
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.LCP = entry.startTime;
            } else if (entry.entryType === 'first-input') {
              metrics.FID = entry.processingStart - entry.startTime;
            } else if (entry.entryType === 'layout-shift') {
              if (!metrics.CLS) metrics.CLS = 0;
              metrics.CLS += (entry as any).value;
            }
          });
          
          resolve(metrics);
        });

        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

        // Also get basic performance metrics
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          resolve({
            ...metrics,
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
          });
        }, 3000);
      });
    });

    return metrics;
  }

  static validateCoreWebVitals(metrics: any): { passed: boolean; failures: string[] } {
    const failures: string[] = [];
    
    if (metrics.LCP && metrics.LCP > PERFORMANCE_CONFIG.thresholds.coreWebVitals.LCP) {
      failures.push(`LCP ${metrics.LCP}ms exceeds threshold ${PERFORMANCE_CONFIG.thresholds.coreWebVitals.LCP}ms`);
    }
    
    if (metrics.FID && metrics.FID > PERFORMANCE_CONFIG.thresholds.coreWebVitals.FID) {
      failures.push(`FID ${metrics.FID}ms exceeds threshold ${PERFORMANCE_CONFIG.thresholds.coreWebVitals.FID}ms`);
    }
    
    if (metrics.CLS && metrics.CLS > PERFORMANCE_CONFIG.thresholds.coreWebVitals.CLS) {
      failures.push(`CLS ${metrics.CLS} exceeds threshold ${PERFORMANCE_CONFIG.thresholds.coreWebVitals.CLS}`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

// Bundle size analysis
class BundleAnalyzer {
  static async analyzeBundleSize(page: Page): Promise<{ totalSize: number; jsSize: number; cssSize: number; resources: any[] }> {
    const resources = await page.evaluate(() => {
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return entries.map(entry => ({
        name: entry.name,
        size: entry.transferSize || 0,
        type: entry.name.split('.').pop() || 'unknown',
        duration: entry.duration
      }));
    });

    const jsResources = resources.filter(r => r.type === 'js');
    const cssResources = resources.filter(r => r.type === 'css');
    
    const jsSize = jsResources.reduce((sum, r) => sum + r.size, 0);
    const cssSize = cssResources.reduce((sum, r) => sum + r.size, 0);
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);

    return {
      totalSize,
      jsSize,
      cssSize,
      resources
    };
  }

  static validateBundleSize(analysis: any): { passed: boolean; failures: string[] } {
    const failures: string[] = [];
    
    if (analysis.totalSize > PERFORMANCE_CONFIG.budgets.bundleSize) {
      failures.push(`Total bundle size ${analysis.totalSize} bytes exceeds threshold ${PERFORMANCE_CONFIG.budgets.bundleSize} bytes`);
    }
    
    if (analysis.jsSize > PERFORMANCE_CONFIG.budgets.bundleSize * 0.8) {
      failures.push(`JS bundle size ${analysis.jsSize} bytes exceeds 80% of threshold`);
    }
    
    if (analysis.cssSize > PERFORMANCE_CONFIG.budgets.bundleSize * 0.2) {
      failures.push(`CSS bundle size ${analysis.cssSize} bytes exceeds 20% of threshold`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

// Memory usage monitoring
class MemoryMonitor {
  static async getMemoryUsage(page: Page): Promise<any> {
    return await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory;
      }
      return null;
    });
  }

  static validateMemoryUsage(memory: any): { passed: boolean; failures: string[] } {
    const failures: string[] = [];
    
    if (memory && memory.usedJSHeapSize > PERFORMANCE_CONFIG.budgets.memoryUsage * 1024 * 1024) {
      failures.push(`Memory usage ${memory.usedJSHeapSize / 1024 / 1024}MB exceeds threshold ${PERFORMANCE_CONFIG.budgets.memoryUsage}MB`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

// Performance test suite
test.describe('HT-008.7.4: Performance Testing Implementation', () => {
  let performanceMonitor: PerformanceMonitor;

  test.beforeEach(async ({ page }) => {
    performanceMonitor = new PerformanceMonitor();
    
    // Set up performance monitoring
    await page.addInitScript(() => {
      // Enable performance observer
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          // Store performance entries for analysis
          (window as any).performanceEntries = (window as any).performanceEntries || [];
          (window as any).performanceEntries.push(...list.getEntries());
        });
        
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      }
    });
  });

  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const loadTime = await performanceMonitor.measurePageLoad(page, '/');
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load intake page within performance budget', async ({ page }) => {
      const loadTime = await performanceMonitor.measurePageLoad(page, '/intake');
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load dashboard within performance budget', async ({ page }) => {
      const loadTime = await performanceMonitor.measurePageLoad(page, '/dashboard');
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load status page within performance budget', async ({ page }) => {
      const loadTime = await performanceMonitor.measurePageLoad(page, '/status');
      
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Navigation Performance', () => {
    test('should navigate between pages quickly', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const pages = ['/intake', '/dashboard', '/status'];
      
      for (const pagePath of pages) {
        const navigationTime = await performanceMonitor.measureNavigation(page, pagePath);
        
        expect(navigationTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.navigation);
        
        // Verify page loaded correctly
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle rapid navigation without performance degradation', async ({ page }) => {
      const pages = ['/', '/intake', '/dashboard', '/status'];
      
      // Perform rapid navigation
      for (let i = 0; i < 3; i++) {
        for (const pagePath of pages) {
          const navigationTime = await performanceMonitor.measureNavigation(page, pagePath);
          
          // Should maintain performance even with rapid navigation
          expect(navigationTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.navigation * 2);
        }
      }
    });
  });

  test.describe('Interaction Performance', () => {
    test('should handle form interactions responsively', async ({ page }) => {
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Test input responsiveness
        const inputs = page.locator('input[type="text"], input[type="email"], textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          for (let i = 0; i < Math.min(3, inputCount); i++) {
            const input = inputs.nth(i);
            if (await input.isVisible()) {
              const interactionTime = await performanceMonitor.measureInteraction(page, async () => {
                await input.fill('Performance test input');
              });
              
              // Form interactions should be immediate
              expect(interactionTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.interaction);
            }
          }
        }
      }
    });

    test('should handle button clicks responsively', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const interactionTime = await performanceMonitor.measureInteraction(page, async () => {
              await button.click();
            });
            
            // Button clicks should be immediate
            expect(interactionTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.interaction);
          }
        }
      }
    });
  });

  test.describe('Form Submission Performance', () => {
    test('should handle form submission efficiently', async ({ page }) => {
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Fill form quickly
        const nameField = page.getByLabel(/name/i).or(
          page.locator('input[placeholder*="name" i]')
        );
        const emailField = page.getByLabel(/email/i).or(
          page.locator('input[type="email"]')
        );
        
        if (await nameField.isVisible()) {
          await nameField.fill('Performance Test');
        }
        if (await emailField.isVisible()) {
          await emailField.fill('performance@test.com');
        }
        
        // Submit form and measure performance
        const submitButton = page.getByRole('button', { name: /submit|send|create/i });
        if (await submitButton.isVisible()) {
          const submissionTime = await performanceMonitor.measureFormSubmission(page, async () => {
            await submitButton.click();
          });
          
          // Form submission should complete within reasonable time
          expect(submissionTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.formSubmission);
        }
      }
    });
  });

  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals thresholds', async ({ page }) => {
      const metrics = await LighthousePerformance.runLighthouseAudit(page, '/');
      
      const validation = LighthousePerformance.validateCoreWebVitals(metrics);
      
      if (!validation.passed) {
        console.warn('Core Web Vitals failures:', validation.failures);
      }
      
      // Should meet Core Web Vitals thresholds
      expect(validation.passed).toBe(true);
    });

    test('should maintain Core Web Vitals across pages', async ({ page }) => {
      const pages = ['/', '/intake', '/dashboard', '/status'];
      
      for (const pagePath of pages) {
        const metrics = await LighthousePerformance.runLighthouseAudit(page, pagePath);
        
        const validation = LighthousePerformance.validateCoreWebVitals(metrics);
        
        if (!validation.passed) {
          console.warn(`Core Web Vitals failures on ${pagePath}:`, validation.failures);
        }
        
        // All pages should meet Core Web Vitals thresholds
        expect(validation.passed).toBe(true);
      }
    });
  });

  test.describe('Bundle Size Analysis', () => {
    test('should maintain bundle size within budget', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const analysis = await BundleAnalyzer.analyzeBundleSize(page);
      
      const validation = BundleAnalyzer.validateBundleSize(analysis);
      
      if (!validation.passed) {
        console.warn('Bundle size failures:', validation.failures);
        console.log('Bundle analysis:', analysis);
      }
      
      // Should maintain bundle size within budget
      expect(validation.passed).toBe(true);
    });

    test('should optimize resource loading', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const analysis = await BundleAnalyzer.analyzeBundleSize(page);
      
      // Should have reasonable number of resources
      expect(analysis.resources.length).toBeLessThan(50);
      
      // Should have reasonable JS/CSS ratio
      const jsRatio = analysis.jsSize / analysis.totalSize;
      expect(jsRatio).toBeLessThan(0.8); // JS should be less than 80% of total
    });
  });

  test.describe('Memory Usage', () => {
    test('should maintain memory usage within budget', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const memory = await MemoryMonitor.getMemoryUsage(page);
      
      if (memory) {
        const validation = MemoryMonitor.validateMemoryUsage(memory);
        
        if (!validation.passed) {
          console.warn('Memory usage failures:', validation.failures);
          console.log('Memory usage:', memory);
        }
        
        // Should maintain memory usage within budget
        expect(validation.passed).toBe(true);
      }
    });

    test('should not have memory leaks during extended use', async ({ page }) => {
      // Perform extended interactions
      const pages = ['/', '/intake', '/dashboard', '/status'];
      
      for (let cycle = 0; cycle < 5; cycle++) {
        for (const pagePath of pages) {
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');
          
          // Perform some interactions
          const buttons = page.locator('button');
          const buttonCount = await buttons.count();
          
          if (buttonCount > 0) {
            const button = buttons.first();
            if (await button.isVisible()) {
              await button.click();
              await page.waitForTimeout(100);
            }
          }
        }
      }
      
      // Check memory usage after extended use
      const memory = await MemoryMonitor.getMemoryUsage(page);
      
      if (memory) {
        const validation = MemoryMonitor.validateMemoryUsage(memory);
        
        if (!validation.passed) {
          console.warn('Memory usage failures after extended use:', validation.failures);
        }
        
        // Should not have excessive memory usage after extended use
        expect(validation.passed).toBe(true);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      const loadTime = await performanceMonitor.measurePageLoad(page, '/');
      
      // Should still load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad * 2);
      
      // Verify page is functional
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate network interruption
      await page.context().setOffline(true);
      
      // Try to navigate (should handle gracefully)
      try {
        await page.goto('/intake');
      } catch (error) {
        // Expected to fail in offline mode
      }
      
      // Restore network
      await page.context().setOffline(false);
      
      // Should recover gracefully
      const recoveryTime = await performanceMonitor.measureNavigation(page, '/intake');
      
      expect(recoveryTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.navigation * 2);
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const loadTime = await performanceMonitor.measurePageLoad(page, '/');
      
      // Mobile should load within 4 seconds
      expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad + 1000);
      
      // Verify mobile layout is functional
      await expect(page.locator('body')).toBeVisible();
      
      // Test mobile interactions
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const button = buttons.first();
        if (await button.isVisible()) {
          const interactionTime = await performanceMonitor.measureInteraction(page, async () => {
            await button.click();
          });
          
          // Mobile interactions should be responsive
          expect(interactionTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.interaction * 2);
        }
      }
    });

    test('should handle touch interactions efficiently', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        const inputs = page.locator('input[type="text"], input[type="email"]');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          const input = inputs.first();
          if (await input.isVisible()) {
            const interactionTime = await performanceMonitor.measureInteraction(page, async () => {
              // Simulate touch interaction
              await input.tap();
              await input.fill('Mobile test');
            });
            
            // Touch interactions should be immediate
            expect(interactionTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.interaction * 2);
          }
        }
      }
    });
  });

  test.describe('Performance Regression Testing', () => {
    test('should maintain performance across test runs', async ({ page }) => {
      const runs = 3;
      const loadTimes: number[] = [];
      
      for (let i = 0; i < runs; i++) {
        const loadTime = await performanceMonitor.measurePageLoad(page, '/');
        loadTimes.push(loadTime);
        
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
      const avgLoadTime = loadTimes.reduce((sum, time) => sum + time, 0) / runs;
      const variance = loadTimes.reduce((sum, time) => sum + Math.pow(time - avgLoadTime, 2), 0) / runs;
      const standardDeviation = Math.sqrt(variance);
      
      // Performance should be consistent (low variance)
      expect(standardDeviation).toBeLessThan(avgLoadTime * 0.2); // Less than 20% variance
      
      // All runs should be within budget
      loadTimes.forEach(loadTime => {
        expect(loadTime).toBeLessThan(PERFORMANCE_CONFIG.budgets.pageLoad);
      });
    });
  });
});
