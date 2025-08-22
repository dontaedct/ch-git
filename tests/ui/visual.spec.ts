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
