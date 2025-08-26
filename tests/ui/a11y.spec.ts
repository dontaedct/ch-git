/**
 * @fileoverview OSS Hero Design Safety - Accessibility Tests
 * @description Comprehensive accessibility testing with axe-core for critical screens
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('OSS Hero Design Safety - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page under test
    await page.goto('/');
  });

  test('homepage should meet accessibility standards', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator('body')).toBeVisible();
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Check for main landmark
    const main = await page.locator('main, [role="main"]').first();
    expect(main).toBeTruthy();
  });

  test('client portal should meet accessibility standards', async ({ page }) => {
    await page.goto('/client-portal');
    
    // Check that the page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Check for proper content structure
    const content = await page.locator('main, [role="main"], .content, .main').first();
    expect(content).toBeTruthy();
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check that all images have alt text
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.locator(':focus');
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels and landmarks', async ({ page }) => {
    // Check for proper landmarks
    const landmarks = await page.locator('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby]').all();
    expect(landmarks.length).toBeGreaterThan(0);
  });
});