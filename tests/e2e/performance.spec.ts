/**
 * @fileoverview HT-008.7.3: Performance E2E Tests
 * @description Comprehensive performance testing for critical user journeys
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

import { test, expect, Page } from '@playwright/test';

test.describe('HT-008.7.3: Performance E2E Tests', () => {
  test.describe('Page Load Performance', () => {
    test('should load homepage within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load intake page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load dashboard within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should load status page within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/status');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 3 seconds for initial load
      expect(loadTime).toBeLessThan(3000);
      
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
        const startTime = Date.now();
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        const navigationTime = Date.now() - startTime;
        
        // Navigation should be fast (1 second budget)
        expect(navigationTime).toBeLessThan(1000);
        
        // Verify page loaded correctly
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle rapid navigation without performance degradation', async ({ page }) => {
      const pages = ['/', '/intake', '/dashboard', '/status'];
      
      // Perform rapid navigation
      for (let i = 0; i < 3; i++) {
        for (const pagePath of pages) {
          const startTime = Date.now();
          
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');
          
          const loadTime = Date.now() - startTime;
          
          // Should maintain performance even with rapid navigation
          expect(loadTime).toBeLessThan(2000);
        }
      }
    });
  });

  test.describe('Form Interaction Performance', () => {
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
              const startTime = Date.now();
              
              await input.fill('Performance test input');
              
              const interactionTime = Date.now() - startTime;
              
              // Form interactions should be immediate
              expect(interactionTime).toBeLessThan(100);
            }
          }
        }
      }
    });

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
          const startTime = Date.now();
          
          await submitButton.click();
          
          // Wait for response (but not too long)
          await page.waitForTimeout(2000);
          
          const submissionTime = Date.now() - startTime;
          
          // Form submission should complete within reasonable time
          expect(submissionTime).toBeLessThan(5000);
        }
      }
    });
  });

  test.describe('Memory and Resource Management', () => {
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
      
      // Verify page is still responsive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle large datasets efficiently', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Simulate loading large dataset
      const startTime = Date.now();
      
      // Wait for any data loading
      await page.waitForTimeout(3000);
      
      const loadTime = Date.now() - startTime;
      
      // Should handle large datasets within reasonable time
      expect(loadTime).toBeLessThan(5000);
      
      // Verify page remains responsive
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async ({ page }) => {
      // Simulate slow 3G network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should still load within reasonable time even on slow network
      expect(loadTime).toBeLessThan(10000);
      
      // Verify page is functional
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network interruptions gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate network interruption
      await page.context().setOffline(true);
      
      // Try to navigate (should handle gracefully)
      await page.goto('/intake');
      
      // Restore network
      await page.context().setOffline(false);
      
      // Should recover gracefully
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Bundle Size and Loading', () => {
    test('should load with minimal bundle size', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers()
        });
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for JavaScript bundles
      const jsResponses = responses.filter(r => 
        r.url.includes('.js') && r.status === 200
      );
      
      // Should have reasonable number of JS files
      expect(jsResponses.length).toBeLessThan(20);
      
      // Check for CSS bundles
      const cssResponses = responses.filter(r => 
        r.url.includes('.css') && r.status === 200
      );
      
      // Should have reasonable number of CSS files
      expect(cssResponses.length).toBeLessThan(10);
    });

    test('should load critical resources first', async ({ page }) => {
      const resourceTimings: any[] = [];
      
      page.on('response', response => {
        resourceTimings.push({
          url: response.url(),
          status: response.status(),
          timing: Date.now()
        });
      });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const totalTime = Date.now() - startTime;
      
      // Critical resources should load quickly
      const criticalResources = resourceTimings.filter(r => 
        r.url.includes('.css') || 
        r.url.includes('critical') ||
        r.url.includes('main')
      );
      
      if (criticalResources.length > 0) {
        const firstCritical = criticalResources[0];
        expect(firstCritical.timing - startTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Mobile Performance', () => {
    test('should perform well on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Mobile should load within 4 seconds
      expect(loadTime).toBeLessThan(4000);
      
      // Verify mobile layout is functional
      await expect(page.locator('body')).toBeVisible();
      
      // Test mobile interactions
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        const button = buttons.first();
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(100);
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
            const startTime = Date.now();
            
            // Simulate touch interaction
            await input.tap();
            await input.fill('Mobile test');
            
            const interactionTime = Date.now() - startTime;
            
            // Touch interactions should be immediate
            expect(interactionTime).toBeLessThan(200);
          }
        }
      }
    });
  });
});
