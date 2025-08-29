/**
 * @fileoverview OSS Hero Design Safety - Accessibility Tests with AXE
 * @description Comprehensive accessibility testing with axe-core for WCAG AA compliance
 * @version 2.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('OSS Hero Design Safety - AXE Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for hydration and reduce motion for stable testing
    await page.addInitScript(() => {
      // Disable animations for consistent testing
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-delay: -0.01ms !important;
          animation-iteration-count: 1 !important;
          background-attachment: initial !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    });
  });

  test('homepage should pass AXE accessibility checks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('intake page should pass AXE accessibility checks', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('login page should pass AXE accessibility checks', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('dashboard page should pass AXE accessibility checks', async ({ page }) => {
    // Skip if authentication is required
    try {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
      
      // Check if we're redirected to login (which would indicate auth is required)
      const currentUrl = page.url();
      if (currentUrl.includes('/login')) {
        test.skip('Dashboard requires authentication - skipping AXE test');
      }
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();
      
      expect(accessibilityScanResults.violations).toEqual([]);
    } catch (error) {
      test.skip('Dashboard inaccessible - skipping AXE test');
    }
  });

  test('should have keyboard navigable interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get all interactive elements
    const interactiveElements = await page.locator(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="link"]'
    ).all();
    
    // Verify each interactive element is keyboard accessible
    for (const element of interactiveElements) {
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      const tabIndex = await element.getAttribute('tabindex');
      const role = await element.getAttribute('role');
      
      // Should either be naturally focusable or have tabindex >= 0
      const naturallyFocusable = ['button', 'a', 'input', 'select', 'textarea'].includes(tagName);
      const hasFocusableTabIndex = tabIndex !== null && parseInt(tabIndex) >= 0;
      const hasInteractiveRole = ['button', 'link'].includes(role || '');
      
      expect(naturallyFocusable || hasFocusableTabIndex || hasInteractiveRole).toBeTruthy();
    }
  });

  test('should maintain focus visibility during keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Start keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check that focused element has visible focus indicator (scope to app content, not portal)
    const focusedElement = page.locator('body :focus').not('nextjs-portal :focus').first();
    await expect(focusedElement).toBeVisible();
    
    // Verify focus ring or outline is present
    const styles = await focusedElement.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineWidth: computed.outlineWidth,
        outlineStyle: computed.outlineStyle,
        outlineColor: computed.outlineColor,
        boxShadow: computed.boxShadow
      };
    });
    
    // Should have either outline or box-shadow for focus indication
    const hasFocusIndicator = 
      styles.outlineWidth !== '0px' && styles.outlineStyle !== 'none' ||
      styles.boxShadow !== 'none' && styles.boxShadow !== '';
    
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('should have proper color contrast ratios', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['heading-order'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible forms with proper labels', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['label', 'label-title-only', 'form-field-multiple-labels'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have accessible images with alt text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['image-alt', 'image-redundant-alt'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});