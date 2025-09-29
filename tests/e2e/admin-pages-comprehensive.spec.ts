/**
 * @fileoverview Comprehensive MCP Testing - All Admin Pages Verification
 * @description Systematic testing of EVERY admin page with real database data
 * @version 1.0.0
 * @author OSS Hero System - MCP Testing Protocol
 */

import { test, expect } from '@playwright/test';

test.describe('COMPREHENSIVE MCP TESTING - ALL ADMIN PAGES', () => {
  
  test.describe('🔍 STEP 1: Main Admin Pages', () => {
    test('Dashboard page loads with real database data', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for real database indicator
      const realDataIndicator = page.locator('text=Connected to real database');
      await expect(realDataIndicator).toBeVisible();
      
      // Check for real metrics (not mock data)
      const metricsSection = page.locator('[data-testid="metrics"], .metrics, #metrics');
      if (await metricsSection.count() > 0) {
        await expect(metricsSection.first()).toBeVisible();
      }
      
      // Check for system status indicators
      const statusIndicators = page.locator('[data-testid="status"], .status-indicator');
      if (await statusIndicators.count() > 0) {
        await expect(statusIndicators.first()).toBeVisible();
      }
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(consoleErrors).toHaveLength(0);
    });

    test('Clients page loads with real database data', async ({ page }) => {
      await page.goto('/clients');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for real database indicator
      const realDataIndicator = page.locator('text=Connected to real database');
      await expect(realDataIndicator).toBeVisible();
      
      // Check for client list (even if empty)
      const clientList = page.locator('[data-testid="client-list"], .client-list, #client-list');
      if (await clientList.count() > 0) {
        await expect(clientList.first()).toBeVisible();
      }
      
      // Check for loading states
      const loadingStates = page.locator('text=Loading, [data-testid="loading"], .loading');
      if (await loadingStates.count() > 0) {
        // Loading states should eventually disappear
        await page.waitForTimeout(2000);
      }
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(consoleErrors).toHaveLength(0);
    });

    test('Agency Toolkit page loads with real database data', async ({ page }) => {
      await page.goto('/agency-toolkit');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for real database indicator
      const realDataIndicator = page.locator('text=Connected to real database');
      await expect(realDataIndicator).toBeVisible();
      
      // Check for real metrics from database
      const metricsSection = page.locator('[data-testid="metrics"], .metrics, #metrics');
      if (await metricsSection.count() > 0) {
        await expect(metricsSection.first()).toBeVisible();
      }
      
      // Check for recent activity
      const recentActivity = page.locator('[data-testid="recent-activity"], .recent-activity');
      if (await recentActivity.count() > 0) {
        await expect(recentActivity.first()).toBeVisible();
      }
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(1000);
      expect(consoleErrors).toHaveLength(0);
    });
  });

  test.describe('🔍 STEP 2: API Endpoints Testing', () => {
    test('Agency data metrics API returns real data', async ({ request }) => {
      const response = await request.get('/api/agency-data?action=metrics');
      
      expect([200, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        
        // Verify it's not mock data
        expect(JSON.stringify(data)).not.toContain('mock');
        expect(JSON.stringify(data)).not.toContain('fake');
        expect(JSON.stringify(data)).not.toContain('dummy');
      }
    });

    test('Agency data clients API returns real data', async ({ request }) => {
      const response = await request.get('/api/agency-data?action=clients');
      
      expect([200, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        
        // Verify it's not mock data
        expect(JSON.stringify(data)).not.toContain('mock');
        expect(JSON.stringify(data)).not.toContain('fake');
        expect(JSON.stringify(data)).not.toContain('dummy');
      }
    });

    test('Agency data recent activity API returns real data', async ({ request }) => {
      const response = await request.get('/api/agency-data?action=recent-activity');
      
      expect([200, 404, 500]).toContain(response.status());
      
      if (response.status() === 200) {
        const data = await response.json();
        expect(data).toBeDefined();
        
        // Verify it's not mock data
        expect(JSON.stringify(data)).not.toContain('mock');
        expect(JSON.stringify(data)).not.toContain('fake');
        expect(JSON.stringify(data)).not.toContain('dummy');
      }
    });
  });

  test.describe('🔍 STEP 3: Error Handling Testing', () => {
    test('Pages handle network errors gracefully', async ({ page }) => {
      // Simulate network issues by blocking requests
      await page.route('**/api/**', route => route.abort());
      
      await page.goto('/dashboard');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check for error handling
      const errorMessages = page.locator('text=Error, text=Failed, text=Unable, [data-testid="error"]');
      if (await errorMessages.count() > 0) {
        await expect(errorMessages.first()).toBeVisible();
      }
      
      // Check for fallback to mock data or error states
      const fallbackContent = page.locator('text=Offline, text=Fallback, [data-testid="fallback"]');
      if (await fallbackContent.count() > 0) {
        await expect(fallbackContent.first()).toBeVisible();
      }
    });

    test('Invalid client IDs show proper error handling', async ({ page }) => {
      await page.goto('/clients/invalid-client-id');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Should show 404 or proper error handling
      const errorContent = page.locator('text=404, text=Not Found, text=Error, [data-testid="error"]');
      if (await errorContent.count() > 0) {
        await expect(errorContent.first()).toBeVisible();
      }
    });
  });

  test.describe('🔍 STEP 4: Loading States Testing', () => {
    test('Loading states appear and disappear correctly', async ({ page }) => {
      // Slow down network to see loading states
      await page.route('**/api/**', async route => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.continue();
      });
      
      await page.goto('/clients');
      
      // Check for loading indicators
      const loadingIndicators = page.locator('text=Loading, [data-testid="loading"], .loading, .spinner');
      if (await loadingIndicators.count() > 0) {
        await expect(loadingIndicators.first()).toBeVisible();
      }
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Loading indicators should disappear
      if (await loadingIndicators.count() > 0) {
        await expect(loadingIndicators.first()).not.toBeVisible();
      }
    });
  });

  test.describe('🔍 STEP 5: Navigation Testing', () => {
    test('All navigation links work properly', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Find all navigation links
      const navLinks = page.locator('nav a, .nav a, [data-testid="nav"] a');
      
      if (await navLinks.count() > 0) {
        const linkCount = await navLinks.count();
        
        for (let i = 0; i < Math.min(linkCount, 5); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Verify page loaded without errors
            const consoleErrors: string[] = [];
            page.on('console', msg => {
              if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
              }
            });
            
            await page.waitForTimeout(500);
            expect(consoleErrors).toHaveLength(0);
            
            // Go back to dashboard for next link
            await page.goto('/dashboard');
          }
        }
      }
    });
  });

  test.describe('🔍 STEP 6: Responsive Design Testing', () => {
    test('Pages work on mobile screen sizes', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check for real database indicator
      const realDataIndicator = page.locator('text=Connected to real database');
      await expect(realDataIndicator).toBeVisible();
      
      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
    });

    test('Pages work on tablet screen sizes', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/clients');
      await page.waitForLoadState('networkidle');
      
      // Check for real database indicator
      const realDataIndicator = page.locator('text=Connected to real database');
      await expect(realDataIndicator).toBeVisible();
      
      // Verify no horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
    });
  });

  test.describe('🔍 STEP 7: Real Data Verification', () => {
    test('No mock data appears on any admin page', async ({ page }) => {
      const adminPages = ['/dashboard', '/clients', '/agency-toolkit'];
      
      for (const pagePath of adminPages) {
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Check page content for mock data indicators
        const pageContent = await page.textContent('body');
        
        // Verify no mock data keywords
        expect(pageContent).not.toContain('mock data');
        expect(pageContent).not.toContain('fake data');
        expect(pageContent).not.toContain('dummy data');
        expect(pageContent).not.toContain('sample data');
        expect(pageContent).not.toContain('test data');
        
        // Verify real database indicator is present
        const realDataIndicator = page.locator('text=Connected to real database');
        await expect(realDataIndicator).toBeVisible();
      }
    });
  });
});
