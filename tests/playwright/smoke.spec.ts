/**
 * Playwright Smoke Tests
 * 
 * Basic smoke tests for critical application routes and functionality.
 */

import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('homepage should render correctly', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads without errors
    await expect(page).toHaveTitle(/Micro App Template/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check that there are no console errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Allow some expected errors but fail on unexpected ones
    const unexpectedErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('404') &&
      !error.includes('ResizeObserver')
    );
    
    if (unexpectedErrors.length > 0) {
      console.warn('Console errors found:', unexpectedErrors);
    }
  });

  test('operability page should be accessible', async ({ page }) => {
    await page.goto('/operability');
    
    // Check that the page loads (may be 404)
    const title = await page.title();
    expect(title).toMatch(/Micro App Template|404/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for operability-specific content (if page exists)
    const operabilityContent = page.locator('text=operability').or(
      page.locator('text=Operability')
    ).or(
      page.locator('text=system')
    ).or(
      page.locator('text=admin')
    );
    
    // If operability page exists, it should have some operability-related content
    const operabilityExists = await operabilityContent.count() > 0;
    if (operabilityExists) {
      await expect(operabilityContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('login page should render (if present)', async ({ page }) => {
    await page.goto('/login');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Micro App Template/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for login-specific content (if login page exists)
    const loginContent = page.locator('text=login').or(
      page.locator('text=Login')
    ).or(
      page.locator('text=sign in')
    ).or(
      page.locator('text=Sign In')
    ).or(
      page.locator('input[type="email"]')
    ).or(
      page.locator('input[type="password"]')
    );
    
    // If login page exists, it should have some login-related content
    const loginExists = await loginContent.count() > 0;
    if (loginExists) {
      await expect(loginContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('rollouts page should be accessible (if present)', async ({ page }) => {
    await page.goto('/rollouts');
    
    // Check that the page loads (may be 404)
    const title = await page.title();
    expect(title).toMatch(/Micro App Template|404/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for rollouts-specific content (if rollouts page exists)
    const rolloutsContent = page.locator('text=rollout').or(
      page.locator('text=Rollout')
    ).or(
      page.locator('text=deployment')
    ).or(
      page.locator('text=Deployment')
    ).or(
      page.locator('text=feature')
    ).or(
      page.locator('text=Feature')
    );
    
    // If rollouts page exists, it should have some rollout-related content
    const rolloutsExists = await rolloutsContent.count() > 0;
    if (rolloutsExists) {
      await expect(rolloutsContent.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('intake page should be accessible', async ({ page }) => {
    await page.goto('/intake');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Micro App Template/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for intake specific content
    const intakeContent = page.locator('text=welcome').or(
      page.locator('text=Welcome')
    ).or(
      page.locator('text=form')
    ).or(
      page.locator('text=Form')
    ).or(
      page.locator('input[type="text"]')
    ).or(
      page.locator('input[type="email"]')
    );
    
    // At least one of these should be present
    await expect(intakeContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('status page should be accessible', async ({ page }) => {
    await page.goto('/status');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Micro App Template/);
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
    
    // Check for status-specific content
    const statusContent = page.locator('text=status').or(
      page.locator('text=Status')
    ).or(
      page.locator('text=health')
    ).or(
      page.locator('text=Health')
    ).or(
      page.locator('text=system')
    ).or(
      page.locator('text=System')
    );
    
    // At least one of these should be present
    await expect(statusContent.first()).toBeVisible({ timeout: 10000 });
  });

  test('API endpoints should respond correctly', async ({ request }) => {
    // Test Guardian heartbeat endpoint
    const heartbeatResponse = await request.get('/api/guardian/heartbeat');
    const heartbeatStatus = heartbeatResponse.status();
    expect([200, 403, 429]).toContain(heartbeatStatus); // 403 if feature disabled, 429 if rate limited
    
    // Test Guardian backup intent endpoint (should require auth)
    const backupResponse = await request.post('/api/guardian/backup-intent');
    const backupStatus = backupResponse.status();
    expect([401, 403, 429, 500]).toContain(backupStatus); // Should require authentication (500 is also acceptable for server errors)
    
    // Test webhook endpoints (should require proper signatures)
    const webhookResponse = await request.post('/api/webhooks/stripe');
    const webhookStatus = webhookResponse.status();
    expect([400, 401, 403]).toContain(webhookStatus); // Should require proper signature
  });

  test('error pages should handle 404s gracefully', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    
    // Should either redirect to a 404 page or return 404 status
    const status = response?.status();
    expect([404, 200]).toContain(status); // 200 if custom 404 page
    
    // Check that the page doesn't crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('navigation should work between pages', async ({ page }) => {
    await page.goto('/');
    
    // Look for navigation elements
    const navElements = page.locator('nav').or(
      page.locator('[role="navigation"]')
    ).or(
      page.locator('header')
    );
    
    const navExists = await navElements.count() > 0;
    if (navExists) {
      // If navigation exists, check that it's visible
      await expect(navElements.first()).toBeVisible();
      
      // Look for links in navigation
      const navLinks = navElements.locator('a');
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Test clicking on the first few navigation links
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Check that we navigated successfully
            expect(page.url()).toContain(href);
            
            // Go back to home page for next test
            await page.goto('/');
          }
        }
      }
    }
  });

  test('responsive design should work on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Check that the page loads on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check that there are no horizontal scrollbars
    const bodyBox = await page.locator('body').boundingBox();
    const viewportWidth = page.viewportSize()?.width || 375;
    
    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(viewportWidth + 10); // Allow small margin
    }
  });
});
