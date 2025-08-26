/**
 * @fileoverview OSS Hero Design Safety - Visual Regression Tests
 * @description Visual regression testing for design safety module using Playwright toHaveScreenshot
 * @version 2.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('OSS Hero Design Safety - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport size for all tests
    await page.setViewportSize({ width: 1280, height: 720 });
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should match client-portal page visual baseline', async ({ page }) => {
    await page.goto('/client-portal');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('client-portal-baseline.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('should match weekly-plans page visual baseline', async ({ page }) => {
    await page.goto('/weekly-plans');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('weekly-plans-baseline.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('should match trainer-profile page visual baseline', async ({ page }) => {
    await page.goto('/trainer-profile');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot and compare with baseline
    await expect(page).toHaveScreenshot('trainer-profile-baseline.png', {
      maxDiffPixelRatio: 0.01
    });
  });

  test('should maintain visual consistency across breakpoints', async ({ page }) => {
    const breakpoints = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const breakpoint of breakpoints) {
      await page.setViewportSize(breakpoint);
      await page.waitForTimeout(500); // Wait for layout to settle
      
      await page.goto('/client-portal');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`client-portal-${breakpoint.name}-baseline.png`, {
        maxDiffPixelRatio: 0.01
      });
    }
  });
});