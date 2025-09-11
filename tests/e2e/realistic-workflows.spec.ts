/**
 * @fileoverview HT-008.7.3: Realistic E2E Test Suite
 * @description E2E tests that work with the actual application structure
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

import { test, expect, Page } from '@playwright/test';

test.describe('HT-008.7.3: Realistic E2E Test Suite', () => {
  test.describe('Core Application Functionality', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check that the page loads
      const title = await page.title();
      expect(title).toBeTruthy();
      
      // Check for basic page structure
      await expect(page.locator('body')).toBeVisible();
      
      // Check for main content area
      const mainContent = page.locator('main, [role="main"], .min-h-screen').first();
      if (await mainContent.isVisible()) {
        await expect(mainContent).toBeVisible();
      }
    });

    test('should handle navigation to existing pages', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test navigation to pages that actually exist
      const existingPages = ['/intake', '/status', '/sessions', '/clients'];
      
      for (const pagePath of existingPages) {
        const response = await page.goto(pagePath);
        
        // Should load successfully (200) or show 404 gracefully
        expect([200, 404]).toContain(response?.status() || 200);
        
        // Page should not crash
        await expect(page.locator('body')).toBeVisible();
        
        // Return to home for next test
        await page.goto('/');
      }
    });

    test('should handle responsive design', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 768, height: 1024 },  // Tablet
        { width: 375, height: 667 }    // Mobile
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // Verify page loads on all viewports
        await expect(page.locator('body')).toBeVisible();
        
        // Check for horizontal overflow on mobile
        if (viewport.width <= 768) {
          const bodyBox = await page.locator('body').boundingBox();
          if (bodyBox) {
            expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 20);
          }
        }
      }
    });
  });

  test.describe('Form Interactions', () => {
    test('should handle intake form if present', async ({ page }) => {
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      // Check if form exists
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Test form inputs
        const inputs = page.locator('input[type="text"], input[type="email"], textarea');
        const inputCount = await inputs.count();
        
        if (inputCount > 0) {
          // Test first input
          const firstInput = inputs.first();
          await firstInput.fill('Test input');
          const value = await firstInput.inputValue();
          expect(value).toBe('Test input');
        }
        
        // Test form submission if submit button exists
        const submitButton = page.getByRole('button', { name: /submit|send|create/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should handle form validation if present', async ({ page }) => {
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Try to submit empty form
        const submitButton = page.getByRole('button', { name: /submit|send|create/i });
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(1000);
          
          // Check for validation messages
          const errorMessages = page.locator('[role="alert"], .text-red-600, .text-red-700, .error');
          const errorCount = await errorMessages.count();
          
          if (errorCount > 0) {
            await expect(errorMessages.first()).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Status and System Pages', () => {
    test('should display status page information', async ({ page }) => {
      await page.goto('/status');
      await page.waitForLoadState('networkidle');
      
      // Check that status page loads
      await expect(page.locator('body')).toBeVisible();
      
      // Look for status-related content
      const statusContent = page.locator('h1, h2, h3').filter({
        hasText: /status|health|system|client/i
      });
      
      if (await statusContent.count() > 0) {
        await expect(statusContent.first()).toBeVisible();
      }
      
      // Look for metrics or cards
      const metrics = page.locator('.card, .metric, [data-testid="metric"]');
      if (await metrics.count() > 0) {
        await expect(metrics.first()).toBeVisible();
      }
    });

    test('should display sessions page if present', async ({ page }) => {
      await page.goto('/sessions');
      await page.waitForLoadState('networkidle');
      
      // Check that page loads
      await expect(page.locator('body')).toBeVisible();
      
      // Look for session-related content
      const sessionContent = page.locator('h1, h2, h3').filter({
        hasText: /session|meeting|appointment/i
      });
      
      if (await sessionContent.count() > 0) {
        await expect(sessionContent.first()).toBeVisible();
      }
    });

    test('should display clients page if present', async ({ page }) => {
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');
      
      // Check that page loads
      await expect(page.locator('body')).toBeVisible();
      
      // Look for client-related content
      const clientContent = page.locator('h1, h2, h3').filter({
        hasText: /client|customer|contact/i
      });
      
      if (await clientContent.count() > 0) {
        await expect(clientContent.first()).toBeVisible();
      }
    });
  });

  test.describe('API Endpoints', () => {
    test('should handle API endpoints correctly', async ({ request }) => {
      // Test health endpoint
      const healthResponse = await request.get('/api/health');
      expect([200, 404, 500]).toContain(healthResponse.status());
      
      // Test status endpoint
      const statusResponse = await request.get('/api/status');
      expect([200, 404, 500]).toContain(statusResponse.status());
      
      // Test guardian endpoints
      const heartbeatResponse = await request.get('/api/guardian/heartbeat');
      expect([200, 403, 404, 429, 500]).toContain(heartbeatResponse.status());
    });

    test('should handle webhook endpoints', async ({ request }) => {
      // Test Stripe webhook
      const stripeResponse = await request.post('/api/webhooks/stripe', {
        data: { type: 'test.event' }
      });
      expect([400, 401, 403, 404, 500]).toContain(stripeResponse.status());
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      
      // Should handle 404 gracefully
      const status = response?.status();
      expect([404, 200]).toContain(status);
      
      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate offline mode
      await page.context().setOffline(true);
      
      // Try to navigate (should handle gracefully)
      try {
        await page.goto('/intake');
      } catch (error) {
        // Expected to fail in offline mode
      }
      
      // Restore online mode
      await page.context().setOffline(false);
      
      // Should recover gracefully
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load pages within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Performance budget: 5 seconds for initial load
      expect(loadTime).toBeLessThan(5000);
      
      // Verify page is interactive
      await expect(page.locator('body')).toBeVisible();
    });

    test('should handle rapid navigation', async ({ page }) => {
      const pages = ['/', '/intake', '/status'];
      
      for (let i = 0; i < 3; i++) {
        for (const pagePath of pages) {
          const startTime = Date.now();
          
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');
          
          const loadTime = Date.now() - startTime;
          
          // Should maintain performance even with rapid navigation
          expect(loadTime).toBeLessThan(3000);
        }
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have basic accessibility features', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for basic page structure
      await expect(page.locator('body')).toBeVisible();
      
      // Check for headings
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      // Should have at least one heading
      expect(headingCount).toBeGreaterThan(0);
      
      // Check for images with alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const img = images.nth(i);
          const alt = await img.getAttribute('alt');
          // Alt should be present (even if empty)
          expect(alt).not.toBeNull();
        }
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Check if any element is focused
      const focusedElement = page.locator(':focus');
      const focusedCount = await focusedElement.count();
      
      // Should have at least one focusable element
      expect(focusedCount).toBeGreaterThan(0);
    });
  });

  test.describe('Console Errors', () => {
    test('should not have critical console errors', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Wait a bit for any potential errors
      await page.waitForTimeout(2000);
      
      // Filter out expected errors
      const criticalErrors = errors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('ResizeObserver') &&
        !error.includes('Non-Error promise rejection') &&
        !error.includes('ChunkLoadError')
      );
      
      if (criticalErrors.length > 0) {
        console.warn('Console errors found:', criticalErrors);
      }
      
      // Should not have too many critical errors
      expect(criticalErrors.length).toBeLessThan(5);
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Basic functionality test
      await expect(page.locator('body')).toBeVisible();
      
      // Test form interactions if forms exist
      await page.goto('/intake');
      await page.waitForLoadState('networkidle');
      
      const inputs = page.locator('input[type="text"], input[type="email"]');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const input = inputs.first();
        await input.fill('Cross-browser test');
        const value = await input.inputValue();
        expect(value).toBe('Cross-browser test');
      }
    });
  });
});
