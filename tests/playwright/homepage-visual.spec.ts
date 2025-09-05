/**
 * @fileoverview Visual regression test for homepage sections
 * @module tests/playwright/homepage-visual.spec.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { test, expect } from '@playwright/test';

test.describe('Homepage Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
  });

  test('homepage should match visual baseline', async ({ page }) => {
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled', // Disable animations for consistent screenshots
    });
  });

  test('hero section should match visual baseline', async ({ page }) => {
    // Find hero section
    const heroSection = page.locator('[aria-labelledby="hero-heading"]');
    await expect(heroSection).toBeVisible();
    
    // Take screenshot of hero section
    await expect(heroSection).toHaveScreenshot('homepage-hero-section.png', {
      animations: 'disabled',
    });
  });

  test('features section should match visual baseline', async ({ page }) => {
    // Find features section
    const featuresSection = page.locator('[aria-labelledby="features-heading"]');
    await expect(featuresSection).toBeVisible();
    
    // Take screenshot of features section
    await expect(featuresSection).toHaveScreenshot('homepage-features-section.png', {
      animations: 'disabled',
    });
  });

  test('CTA section should match visual baseline', async ({ page }) => {
    // Find CTA section
    const ctaSection = page.locator('[aria-labelledby="cta-heading"]');
    await expect(ctaSection).toBeVisible();
    
    // Take screenshot of CTA section
    await expect(ctaSection).toHaveScreenshot('homepage-cta-section.png', {
      animations: 'disabled',
    });
  });

  test('homepage should match visual baseline on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for responsive layout to adjust
    await page.waitForTimeout(500);
    
    // Take full page screenshot on mobile
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage should match visual baseline on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Wait for responsive layout to adjust
    await page.waitForTimeout(500);
    
    // Take full page screenshot on tablet
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage should match visual baseline in dark mode', async ({ page }) => {
    // Enable dark mode
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take full page screenshot in dark mode
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage should match visual baseline in light mode', async ({ page }) => {
    // Ensure light mode
    await page.emulateMedia({ colorScheme: 'light' });
    
    // Wait for theme to apply
    await page.waitForTimeout(500);
    
    // Take full page screenshot in light mode
    await expect(page).toHaveScreenshot('homepage-light-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage buttons should have correct hover states', async ({ page }) => {
    // Find primary CTA button
    const primaryButton = page.locator('button[data-cta-type="primary"]').first();
    await expect(primaryButton).toBeVisible();
    
    // Take screenshot before hover
    await expect(primaryButton).toHaveScreenshot('homepage-button-default.png', {
      animations: 'disabled',
    });
    
    // Hover over button
    await primaryButton.hover();
    await page.waitForTimeout(200); // Wait for hover animation
    
    // Take screenshot after hover
    await expect(primaryButton).toHaveScreenshot('homepage-button-hover.png', {
      animations: 'disabled',
    });
  });

  test('homepage should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    // Wait for reduced motion to apply
    await page.waitForTimeout(500);
    
    // Take screenshot with reduced motion
    await expect(page).toHaveScreenshot('homepage-reduced-motion.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('homepage should maintain visual consistency across sections', async ({ page }) => {
    // Check that all sections are visible and properly spaced
    const heroSection = page.locator('[aria-labelledby="hero-heading"]');
    const featuresSection = page.locator('[aria-labelledby="features-heading"]');
    const ctaSection = page.locator('[aria-labelledby="cta-heading"]');
    
    await expect(heroSection).toBeVisible();
    await expect(featuresSection).toBeVisible();
    await expect(ctaSection).toBeVisible();
    
    // Take screenshot of the main content area (excluding footer)
    const mainContent = page.locator('main');
    await expect(mainContent).toHaveScreenshot('homepage-main-content.png', {
      animations: 'disabled',
    });
  });
});

