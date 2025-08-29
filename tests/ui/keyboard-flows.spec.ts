/**
 * @fileoverview Keyboard Flow Tests for UI Components
 * @description Tests keyboard navigation for chips, tabs, stepper, and auth forms
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation - Interactive Components', () => {
  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent testing
    await page.addInitScript(() => {
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

  test('chips should support keyboard navigation', async ({ page }) => {
    // First check if chip components exist
    await page.goto('/dashboard/modules');
    await page.waitForLoadState('networkidle');
    
    // Look for chip-like components (could be tags, badges, or filter chips)
    const chips = await page.locator('[role="button"][data-testid*="chip"], .chip, .tag, .badge[role="button"]').all();
    
    if (chips.length === 0) {
      // Try alternative routes that might have chips
      const alternativeRoutes = ['/dashboard', '/dashboard/catalog', '/'];
      for (const route of alternativeRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const altChips = await page.locator('[role="button"][data-testid*="chip"], .chip, .tag, .badge[role="button"]').all();
        if (altChips.length > 0) {
          break;
        }
      }
    }

    const finalChips = await page.locator('[role="button"][data-testid*="chip"], .chip, .tag, .badge[role="button"]').all();
    
    if (finalChips.length === 0) {
      test.skip('No chip components found to test');
    }

    // Test keyboard navigation through chips
    for (let i = 0; i < Math.min(finalChips.length, 5); i++) {
      const chip = finalChips[i];
      
      // Focus the chip
      await chip.focus();
      await expect(chip).toBeFocused();
      
      // Test Enter key activation
      await page.keyboard.press('Enter');
      
      // Test Space key activation
      await chip.focus();
      await page.keyboard.press('Space');
      
      // Move to next chip with Tab
      if (i < finalChips.length - 1) {
        await page.keyboard.press('Tab');
      }
    }
  });

  test('tabs should support arrow key navigation', async ({ page }) => {
    // Check for tab components
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const tabLists = await page.locator('[role="tablist"]').all();
    
    if (tabLists.length === 0) {
      // Try other routes that might have tabs
      const alternativeRoutes = ['/dashboard/settings', '/dashboard/modules', '/design'];
      for (const route of alternativeRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const altTabs = await page.locator('[role="tablist"]').all();
        if (altTabs.length > 0) {
          break;
        }
      }
    }

    const finalTabLists = await page.locator('[role="tablist"]').all();
    
    if (finalTabLists.length === 0) {
      test.skip('No tab components found to test');
    }

    // Test first tab list found
    const tabList = finalTabLists[0];
    const tabs = await tabList.locator('[role="tab"]').all();
    
    if (tabs.length < 2) {
      test.skip('Need at least 2 tabs to test navigation');
    }

    // Focus first tab
    await tabs[0].focus();
    await expect(tabs[0]).toBeFocused();
    
    // Test arrow key navigation
    await page.keyboard.press('ArrowRight');
    await expect(tabs[1]).toBeFocused();
    
    // Test wrapping behavior (if more than 2 tabs)
    if (tabs.length > 2) {
      await page.keyboard.press('ArrowRight');
      await expect(tabs[2]).toBeFocused();
    }
    
    // Test reverse navigation
    await page.keyboard.press('ArrowLeft');
    await expect(tabs[1]).toBeFocused();
    
    // Test Home/End keys
    await page.keyboard.press('Home');
    await expect(tabs[0]).toBeFocused();
    
    await page.keyboard.press('End');
    await expect(tabs[tabs.length - 1]).toBeFocused();
    
    // Test Enter/Space activation
    await tabs[0].focus();
    await page.keyboard.press('Enter');
    
    // Verify tab panel is shown
    const activeTabId = await tabs[0].getAttribute('aria-controls');
    if (activeTabId) {
      const tabPanel = page.locator(`#${activeTabId}`);
      await expect(tabPanel).toBeVisible();
    }
  });

  test('stepper should support keyboard navigation', async ({ page }) => {
    // Check for stepper components
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    const steppers = await page.locator('[data-testid*="stepper"], .stepper, [role="progressbar"][aria-valuemax]').all();
    
    if (steppers.length === 0) {
      // Try alternative routes
      const alternativeRoutes = ['/questionnaire', '/consultation'];
      for (const route of alternativeRoutes) {
        await page.goto(route);
        await page.waitForLoadState('networkidle');
        const altSteppers = await page.locator('[data-testid*="stepper"], .stepper, [role="progressbar"][aria-valuemax]').all();
        if (altSteppers.length > 0) {
          break;
        }
      }
    }

    // Test stepper navigation buttons
    const nextButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid*="next"]').all();
    const prevButtons = await page.locator('button:has-text("Previous"), button:has-text("Back"), [data-testid*="prev"]').all();
    
    if (nextButtons.length === 0) {
      test.skip('No stepper navigation found to test');
    }

    // Test keyboard activation of stepper controls
    if (nextButtons.length > 0) {
      await nextButtons[0].focus();
      await expect(nextButtons[0]).toBeFocused();
      await page.keyboard.press('Enter');
    }
    
    if (prevButtons.length > 0) {
      await prevButtons[0].focus();  
      await expect(prevButtons[0]).toBeFocused();
      await page.keyboard.press('Space');
    }

    // Check for step indicators that might be clickable
    const stepIndicators = await page.locator('[role="button"][aria-label*="step"], .step[tabindex="0"]').all();
    
    for (const indicator of stepIndicators.slice(0, 3)) {
      await indicator.focus();
      await expect(indicator).toBeFocused();
      
      // Test activation
      await page.keyboard.press('Enter');
    }
  });

  test('auth forms should support complete keyboard workflow', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Find form elements
    const emailInput = page.locator('input[type="email"], input[name*="email"], input[id*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name*="password"], input[id*="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
    
    // Test form navigation
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
    
    // Type in email field
    await emailInput.fill('test@example.com');
    
    // Tab to password field
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();
    
    // Type in password field
    await passwordInput.fill('testpassword123');
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    await expect(submitButton).toBeFocused();
    
    // Test form submission with Enter key
    await passwordInput.focus();
    await page.keyboard.press('Enter');
    
    // Test form submission with Space on button
    await submitButton.focus();
    await page.keyboard.press('Space');
  });

  test('forms should show validation errors accessibly', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    // Find form and try to submit without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")');
    
    if (await submitButton.count() === 0) {
      test.skip('No forms found to test validation');
    }
    
    // Try to submit form
    await submitButton.focus();
    await page.keyboard.press('Enter');
    
    // Check for error messages
    const errorMessages = await page.locator('[role="alert"], .error, [aria-invalid="true"] + *, [data-testid*="error"]').all();
    
    // If there are validation errors, they should be accessible
    for (const error of errorMessages) {
      await expect(error).toBeVisible();
      
      // Error should be associated with form field via aria-describedby or be a live region
      const ariaLive = await error.getAttribute('aria-live');
      const role = await error.getAttribute('role');
      
      expect(ariaLive === 'polite' || ariaLive === 'assertive' || role === 'alert').toBeTruthy();
    }
  });

  test('focus should be trapped in modal dialogs', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for buttons that might open modals
    const modalTriggers = await page.locator('button:has-text("Settings"), button:has-text("Edit"), button:has-text("Add"), [data-testid*="modal"], [aria-haspopup="dialog"]').all();
    
    if (modalTriggers.length === 0) {
      test.skip('No modal triggers found to test');
    }
    
    // Open first modal found
    await modalTriggers[0].click();
    
    // Check if modal opened
    const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
    
    if (await modal.count() === 0) {
      test.skip('No modal opened to test focus trap');
    }
    
    await expect(modal).toBeVisible();
    
    // Find focusable elements in modal
    const focusableElements = await modal.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').all();
    
    if (focusableElements.length === 0) {
      test.skip('No focusable elements in modal');
    }
    
    // Focus should start on first focusable element
    await expect(focusableElements[0]).toBeFocused();
    
    // Tab through all elements
    for (let i = 1; i < focusableElements.length; i++) {
      await page.keyboard.press('Tab');
      await expect(focusableElements[i]).toBeFocused();
    }
    
    // Tab from last element should wrap to first
    await page.keyboard.press('Tab');
    await expect(focusableElements[0]).toBeFocused();
    
    // Shift+Tab should go backwards
    await page.keyboard.press('Shift+Tab');
    await expect(focusableElements[focusableElements.length - 1]).toBeFocused();
    
    // Escape should close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});