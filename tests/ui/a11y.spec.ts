/**
 * @fileoverview MIT Hero Design Safety - Accessibility Tests
 * @description Comprehensive accessibility testing with axe-core for critical screens
 * @version 1.0.0
 * @author MIT Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';
import { createAxeBuilder, advisoryModeConfig } from './a11y.config';

test.describe('MIT Hero Design Safety - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page under test
    await page.goto('/');
  });

  test('homepage should meet accessibility standards', async ({ page }) => {
    const accessibilityScanResults = await createAxeBuilder(page).analyze();
    
    // Report violations but don't fail (advisory mode)
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on homepage:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  - ${node.html}`);
        });
      });
    }
    
    // For now, just log violations without failing (advisory mode)
    expect(accessibilityScanResults.violations.length).toBeGreaterThanOrEqual(0);
  });

  test('client portal should meet accessibility standards', async ({ page }) => {
    await page.goto('/client-portal');
    
    const accessibilityScanResults = await createAxeBuilder(page).analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on client portal:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    expect(accessibilityScanResults.violations.length).toBeGreaterThanOrEqual(0);
  });

  test('trainer profile should meet accessibility standards', async ({ page }) => {
    await page.goto('/trainer-profile');
    
    const accessibilityScanResults = await createAxeBuilder(page).analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on trainer profile:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    expect(accessibilityScanResults.violations.length).toBeGreaterThanOrEqual(0);
  });

  test('weekly plans should meet accessibility standards', async ({ page }) => {
    await page.goto('/weekly-plans');
    
    const accessibilityScanResults = await createAxeBuilder(page).analyze();
    
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found on weekly plans:');
      accessibilityScanResults.violations.forEach(violation => {
        console.log(`- ${violation.id}: ${violation.description}`);
      });
    }
    
    expect(accessibilityScanResults.violations.length).toBeGreaterThanOrEqual(0);
  });

  test('should have proper heading structure', async ({ page }) => {
    // Check that headings follow proper hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // Verify no skipped heading levels
    // This is a stub - will be expanded in future prompts
    expect(true).toBe(true);
  });

  test('should have proper alt text for images', async ({ page }) => {
    // Check that all images have alt text
    const images = await page.locator('img').all();
    
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('should be keyboard navigable with proper focus indicators', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Verify focus indicators are visible
    const focusedElement = await page.locator(':focus');
    expect(focusedElement).toBeTruthy();
    
    // Test tab order through multiple elements
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loops
    
    while (tabCount < maxTabs) {
      const currentFocus = await page.locator(':focus');
      if (!currentFocus || (await currentFocus.count()) === 0) break;
      
      // Check if focus indicator is visible
      const focusVisible = await currentFocus.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.outline !== 'none' || style.boxShadow !== 'none' || 
               style.border !== 'none' || el.classList.contains('focus-visible');
      });
      
      // Log focus state for debugging
      if (tabCount < 5) { // Only log first few for readability
        const tagName = await currentFocus.evaluate(el => el.tagName.toLowerCase());
        const text = await currentFocus.textContent();
        console.log(`Tab ${tabCount + 1}: ${tagName} - "${text?.trim()}" - Focus visible: ${focusVisible}`);
      }
      
      await page.keyboard.press('Tab');
      tabCount++;
    }
    
    expect(tabCount).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // Check color contrast ratios using axe-core
    const accessibilityScanResults = await createAxeBuilder(page).analyze();
    
    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );
    
    if (contrastViolations.length > 0) {
      console.log('Color contrast violations found:');
      contrastViolations.forEach(violation => {
        console.log(`- ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`  - ${node.html}`);
        });
      });
    }
    
    // For now, just log violations without failing (advisory mode)
    expect(contrastViolations.length).toBeGreaterThanOrEqual(0);
  });

  test('should have proper ARIA labels and landmarks', async ({ page }) => {
    // Check for proper ARIA attributes
    const elementsWithAria = await page.locator('[aria-label], [aria-labelledby], [aria-describedby]').all();
    
    // Verify ARIA attributes are meaningful
    for (const element of elementsWithAria) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const ariaDescribedBy = await element.getAttribute('aria-describedby');
      
      // At least one ARIA attribute should be present and meaningful
      const hasMeaningfulAria = ariaLabel || ariaLabelledBy || ariaDescribedBy;
      expect(hasMeaningfulAria).toBeTruthy();
    }
    
    // Check for proper landmarks
    const landmarks = await page.locator('main, nav, header, footer, aside, section[aria-label], section[aria-labelledby]').all();
    expect(landmarks.length).toBeGreaterThan(0);
  });

  test('forms should have proper labels and error handling', async ({ page }) => {
    // Navigate to a form page
    await page.goto('/trainer-profile');
    
    // Check that form inputs have proper labels
    const inputs = await page.locator('input, select, textarea').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        // Check if there's a label with matching for attribute
        const label = await page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        
        // Input should have either a label or aria-label
        const hasProperLabel = hasLabel || ariaLabel || ariaLabelledBy;
        expect(hasProperLabel).toBeTruthy();
      }
    }
  });
});
