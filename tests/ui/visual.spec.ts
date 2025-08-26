<<<<<<< HEAD
/**
 * @fileoverview MIT Hero Design Safety - Visual Regression Tests
 * @description Visual regression testing for design safety module using Playwright toHaveScreenshot
 * @version 2.0.0
 * @author MIT Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('MIT Hero Design Safety - Visual Regression Tests', () => {
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

  test('should handle loading states consistently', async ({ page }) => {
    await page.goto('/weekly-plans');
    
    // Take screenshot immediately to capture loading state if present
    await expect(page).toHaveScreenshot('weekly-plans-loading-baseline.png', {
      maxDiffPixelRatio: 0.01
    });
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of loaded state
    await expect(page).toHaveScreenshot('weekly-plans-loaded-baseline.png', {
      maxDiffPixelRatio: 0.01
    });
  });
});
=======
import { test, expect } from '@playwright/test';

// Visual regression testing with strict pixel difference threshold
// maxDiffPixelRatio: 0.01 means only 1% pixel difference is allowed
// This ensures visual consistency while allowing for minor rendering variations

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for all tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Home page visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot with strict threshold
    await expect(page).toHaveScreenshot('home-page.png', {
      maxDiffPixelRatio: 0.01, // ✅ 1% pixel difference threshold
      threshold: 0.2, // Additional color tolerance
      animations: 'disabled' // Disable animations for consistent screenshots
    });
  });

  test('Intake form visual consistency', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('intake-form.png', {
      maxDiffPixelRatio: 0.01, // ✅ 1% pixel difference threshold
      threshold: 0.2,
      animations: 'disabled'
    });
  });

  test('Sessions page visual consistency', async ({ page }) => {
    await page.goto('/sessions');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('sessions-page.png', {
      maxDiffPixelRatio: 0.01, // ✅ 1% pixel difference threshold
      threshold: 0.2,
      animations: 'disabled'
    });
  });

  test('Client portal visual consistency', async ({ page }) => {
    await page.goto('/client-portal');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('client-portal.png', {
      maxDiffPixelRatio: 0.01, // ✅ 1% pixel difference threshold
      threshold: 0.2,
      animations: 'disabled'
    });
  });

  test('Design system page visual consistency', async ({ page }) => {
    await page.goto('/design-system');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('design-system.png', {
      maxDiffPixelRatio: 0.01, // ✅ 1% pixel difference threshold
      threshold: 0.2,
      animations: 'disabled'
    });
  });
});

// Rationale for maxDiffPixelRatio: 0.01 (1%):
// - Allows for minor rendering variations across different environments
// - Catches significant visual regressions that would impact user experience
// - Balances strictness with practical tolerance for system differences
// - Industry standard for visual regression testing
>>>>>>> origin/main
