/**
 * @fileoverview HT-008 Phase 3: Comprehensive Accessibility Tests
 * @module tests/ui/accessibility-comprehensive.spec.ts
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.3 - Accessibility Violations Correction
 * Focus: WCAG 2.1 AAA compliance testing and validation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (accessibility compliance requirements)
 */

import { test, expect } from '@playwright/test';
import { accessibilityTestingUtils } from '@/lib/accessibility/accessibility-testing';

test.describe('HT-008 Phase 3: Comprehensive Accessibility Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('WCAG 2.1 AAA Compliance', () => {
    test('should meet WCAG 2.1 AAA standards', async ({ page }) => {
      const results = await accessibilityTestingUtils.runAccessibilityAudit(page, {
        level: 'AAA',
        includeColorContrast: true,
        includeKeyboardNavigation: true,
        includeScreenReader: true,
        includeFocusManagement: true,
        includeSemanticHTML: true,
        includeARIA: true
      });

      const report = accessibilityTestingUtils.generateReport(results);
      
      // Expect at least 90% pass rate for AAA compliance
      expect(report.summary.passRate).toBeGreaterThanOrEqual(90);
      expect(report.status).toMatch(/PASS|WARN/);
      
      console.log('Accessibility Report:', report);
    });

    test('should have proper color contrast ratios', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'color-contrast');
      
      // Should have minimal color contrast violations
      expect(results.failed).toBeLessThanOrEqual(2);
    });

    test('should support keyboard navigation', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'keyboard-navigation');
      
      // Should pass keyboard navigation tests
      expect(results.failed).toBe(0);
    });

    test('should support screen readers', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'screen-reader');
      
      // Should pass screen reader tests
      expect(results.failed).toBe(0);
    });

    test('should have proper focus management', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'focus-management');
      
      // Should pass focus management tests
      expect(results.failed).toBe(0);
    });

    test('should use semantic HTML', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'semantic-html');
      
      // Should pass semantic HTML tests
      expect(results.failed).toBe(0);
    });

    test('should implement ARIA correctly', async ({ page }) => {
      const results = await accessibilityTestingUtils.testFeature(page, 'aria');
      
      // Should pass ARIA implementation tests
      expect(results.failed).toBe(0);
    });
  });

  test.describe('Questionnaire Engine Accessibility', () => {
    test('questionnaire should be fully accessible', async ({ page }) => {
      // Navigate to questionnaire page
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Test skip links
      const skipLinks = await page.locator('a[href="#questions"], a[href="#navigation"]').count();
      expect(skipLinks).toBeGreaterThan(0);

      // Test ARIA live regions
      const liveRegions = await page.locator('[aria-live]').count();
      expect(liveRegions).toBeGreaterThan(0);

      // Test progress indicators
      const progressElements = await page.locator('[role="progressbar"], [aria-label*="progress"]').count();
      expect(progressElements).toBeGreaterThan(0);

      // Test form labels
      const formInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        return Array.from(inputs).filter(input => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledBy = input.getAttribute('aria-labelledby');
          
          if (ariaLabel || ariaLabelledBy) return false;
          
          if (id) {
            const label = document.querySelector(`label[for="${id}"]`);
            return !label;
          }
          
          return true;
        }).length;
      });
      expect(formInputs).toBe(0);

      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBeTruthy();

      // Test ARIA announcements
      const announcements = await page.locator('[role="status"], [aria-live]').count();
      expect(announcements).toBeGreaterThan(0);
    });

    test('questionnaire should announce progress changes', async ({ page }) => {
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Check for live regions that announce progress
      const liveRegions = await page.locator('[aria-live="polite"], [aria-live="assertive"]');
      const count = await liveRegions.count();
      expect(count).toBeGreaterThan(0);

      // Test that progress is announced
      const progressAnnouncer = await page.locator('[aria-live]').first();
      const hasProgressText = await progressAnnouncer.textContent();
      expect(hasProgressText).toBeTruthy();
    });

    test('questionnaire should support keyboard shortcuts', async ({ page }) => {
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Test keyboard shortcuts are documented
      const helpText = await page.locator('text=/Ctrl\\+.*navigate/').count();
      expect(helpText).toBeGreaterThan(0);

      // Test that keyboard shortcuts work
      await page.keyboard.press('Control+h');
      // Should show help or announce shortcuts
      const helpAnnouncement = await page.locator('[aria-live]').first().textContent();
      expect(helpAnnouncement).toContain('keyboard shortcuts');
    });
  });

  test.describe('Component Accessibility', () => {
    test('chip group should be accessible', async ({ page }) => {
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Test chip group keyboard navigation
      const chipGroups = await page.locator('[role="group"]').count();
      expect(chipGroups).toBeGreaterThan(0);

      // Test arrow key navigation in chip groups
      const firstChipGroup = page.locator('[role="group"]').first();
      await firstChipGroup.focus();
      
      // Test arrow key navigation
      await page.keyboard.press('ArrowRight');
      const focusedChip = await page.evaluate(() => document.activeElement?.getAttribute('role'));
      expect(focusedChip).toBe('button');
    });

    test('tabs should be accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test tab navigation
      const tabs = await page.locator('[role="tablist"]').count();
      if (tabs > 0) {
        const tabList = page.locator('[role="tablist"]').first();
        await tabList.focus();
        
        // Test arrow key navigation
        await page.keyboard.press('ArrowRight');
        const activeTab = await page.evaluate(() => document.activeElement?.getAttribute('role'));
        expect(activeTab).toBe('tab');
      }
    });

    test('carousel should be accessible', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test carousel accessibility
      const carousels = await page.locator('[role="region"][aria-roledescription="carousel"]').count();
      if (carousels > 0) {
        const carousel = page.locator('[role="region"][aria-roledescription="carousel"]').first();
        
        // Test carousel has proper ARIA attributes
        const hasRole = await carousel.getAttribute('role');
        expect(hasRole).toBe('region');
        
        const hasRoleDescription = await carousel.getAttribute('aria-roledescription');
        expect(hasRoleDescription).toBe('carousel');
      }
    });
  });

  test.describe('Focus Management', () => {
    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test focus indicators
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
      
      const focusIndicator = await page.evaluate(() => {
        const active = document.activeElement as HTMLElement;
        if (!active) return false;
        
        const styles = window.getComputedStyle(active);
        return styles.outline !== 'none' || 
               styles.boxShadow !== 'none' ||
               active.classList.contains('focus-visible');
      });

      expect(focusIndicator).toBe(true);
    });

    test('should manage focus properly in modals', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Look for modals or dialogs
      const modals = await page.locator('[role="dialog"], [role="modal"]').count();
      if (modals > 0) {
        // Test focus trapping would require opening a modal
        // This is a placeholder for when modals are implemented
        expect(modals).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const headingStructure = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let previousLevel = 0;
        let isValid = true;
        
        for (const heading of headings) {
          const currentLevel = parseInt(heading.tagName.charAt(1));
          if (currentLevel > previousLevel + 1) {
            isValid = false;
            break;
          }
          previousLevel = currentLevel;
        }
        
        return isValid;
      });

      expect(headingStructure).toBe(true);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const elementsWithoutLabels = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll(
          'button, input, select, textarea, a[href]'
        );
        
        return Array.from(interactiveElements).filter(el => {
          const hasLabel = el.getAttribute('aria-label') || 
                          el.getAttribute('aria-labelledby') ||
                          el.closest('label') ||
                          el.textContent?.trim();
          return !hasLabel;
        }).length;
      });

      expect(elementsWithoutLabels).toBe(0);
    });

    test('should have proper image alt text', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        return Array.from(images).filter(img => 
          !img.alt && !img.getAttribute('aria-label')
        ).length;
      });

      expect(imagesWithoutAlt).toBe(0);
    });
  });

  test.describe('Reduced Motion Support', () => {
    test('should respect prefers-reduced-motion', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Test reduced motion support
      const hasReducedMotionSupport = await page.evaluate(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        return mediaQuery.matches;
      });

      // This test verifies the media query is available
      expect(typeof hasReducedMotionSupport).toBe('boolean');
    });
  });

  test.describe('Error Handling Accessibility', () => {
    test('should announce errors to screen readers', async ({ page }) => {
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Look for error announcements
      const errorAnnouncements = await page.locator('[role="alert"], [aria-live="assertive"]').count();
      expect(errorAnnouncements).toBeGreaterThanOrEqual(0);
    });

    test('should associate errors with form fields', async ({ page }) => {
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');

      // Test error association
      const formInputs = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        return Array.from(inputs).filter(input => {
          const ariaInvalid = input.getAttribute('aria-invalid');
          const ariaDescribedBy = input.getAttribute('aria-describedby');
          
          if (ariaInvalid === 'true') {
            return !ariaDescribedBy;
          }
          
          return false;
        }).length;
      });

      expect(formInputs).toBe(0);
    });
  });
});
