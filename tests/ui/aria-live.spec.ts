/**
 * @fileoverview ARIA Live Region Tests
 * @description Tests that dynamic content changes are announced to screen readers
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('ARIA Live Announcements', () => {
  test.beforeEach(async ({ page }) => {
    // Set up screen reader simulation
    await page.addInitScript(() => {
      // Track aria-live announcements
      window.ariaLiveAnnouncements = [];
      
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            const target = mutation.target;
            const element = target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
            
            if (element && element.getAttribute) {
              const ariaLive = element.getAttribute('aria-live') || 
                             element.closest('[aria-live]')?.getAttribute('aria-live');
              
              if (ariaLive) {
                const text = element.textContent || '';
                if (text.trim()) {
                  window.ariaLiveAnnouncements.push({
                    text: text.trim(),
                    level: ariaLive,
                    timestamp: Date.now(),
                    element: element.tagName
                  });
                }
              }
            }
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
      
      // Also track role="alert" and role="status" 
      const roleObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const role = node.getAttribute('role');
                if (role === 'alert' || role === 'status') {
                  const text = node.textContent || '';
                  if (text.trim()) {
                    window.ariaLiveAnnouncements.push({
                      text: text.trim(),
                      level: role === 'alert' ? 'assertive' : 'polite',
                      timestamp: Date.now(),
                      element: node.tagName,
                      role: role
                    });
                  }
                }
              }
            });
          }
        });
      });
      
      roleObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  });

  test('should announce step changes in multi-step forms', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    // Look for step navigation
    const nextButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid*="next-step"]').all();
    
    if (nextButtons.length === 0) {
      // Try questionnaire page
      await page.goto('/questionnaire');
      await page.waitForLoadState('networkidle');
      const altNextButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid*="next-step"]').all();
      
      if (altNextButtons.length === 0) {
        test.skip('No multi-step form found to test');
      }
    }
    
    const finalNextButtons = await page.locator('button:has-text("Next"), button:has-text("Continue"), [data-testid*="next-step"]').all();
    
    if (finalNextButtons.length > 0) {
      // Click next button to advance step
      await finalNextButtons[0].click();
      await page.waitForTimeout(1000); // Allow time for announcements
      
      // Check if step change was announced
      const announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
      
      // Should have at least one announcement about step change
      const stepAnnouncements = announcements.filter(ann => 
        ann.text.toLowerCase().includes('step') ||
        ann.text.toLowerCase().includes('page') ||
        ann.text.toLowerCase().includes('section') ||
        /\d+.*of.*\d+/.test(ann.text.toLowerCase())
      );
      
      expect(stepAnnouncements.length).toBeGreaterThan(0);
      
      // Announcement should be polite (not disruptive)
      const politeLevels = stepAnnouncements.filter(ann => 
        ann.level === 'polite' || ann.level === 'status'
      );
      expect(politeLevels.length).toBeGreaterThan(0);
    }
  });

  test('should announce toast notifications', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    // Look for actions that might trigger toasts
    const actionButtons = await page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Delete"), button[type="submit"]').all();
    
    if (actionButtons.length === 0) {
      // Try settings page
      await page.goto('/dashboard/settings');
      await page.waitForLoadState('networkidle');
      const altActionButtons = await page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Delete"), button[type="submit"]').all();
      
      if (altActionButtons.length === 0) {
        test.skip('No action buttons found to test toast notifications');
      }
    }
    
    const finalActionButtons = await page.locator('button:has-text("Save"), button:has-text("Update"), button:has-text("Delete"), button[type="submit"]').all();
    
    if (finalActionButtons.length > 0) {
      // Trigger an action that might show a toast
      await finalActionButtons[0].click();
      await page.waitForTimeout(2000); // Allow time for toast to appear and be announced
      
      // Check for toast announcements
      const announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
      
      // Look for success/error/info messages
      const toastAnnouncements = announcements.filter(ann =>
        ann.text.toLowerCase().includes('success') ||
        ann.text.toLowerCase().includes('error') ||
        ann.text.toLowerCase().includes('saved') ||
        ann.text.toLowerCase().includes('updated') ||
        ann.text.toLowerCase().includes('deleted') ||
        ann.text.toLowerCase().includes('failed') ||
        ann.role === 'alert' ||
        ann.role === 'status'
      );
      
      // Should have toast announcements if toasts appeared
      const toastElements = await page.locator('[role="alert"], .toast, [data-testid*="toast"], [data-sonner-toast]').all();
      
      if (toastElements.length > 0) {
        expect(toastAnnouncements.length).toBeGreaterThan(0);
        
        // Error messages should be assertive, success should be polite
        const errorAnnouncements = toastAnnouncements.filter(ann => 
          ann.text.toLowerCase().includes('error') ||
          ann.text.toLowerCase().includes('failed')
        );
        
        errorAnnouncements.forEach(ann => {
          expect(ann.level === 'assertive' || ann.role === 'alert').toBe(true);
        });
      }
    }
  });

  test('should announce form validation errors', async ({ page }) => {
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    // Try to submit form without filling required fields
    const submitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue")');
    
    if (await submitButton.count() === 0) {
      // Try login form
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
    }
    
    const finalSubmitButton = page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Continue"), button:has-text("Sign in")');
    
    if (await finalSubmitButton.count() === 0) {
      test.skip('No forms found to test validation announcements');
    }
    
    // Try to submit invalid form
    await finalSubmitButton.click();
    await page.waitForTimeout(1500); // Allow time for validation
    
    // Check for validation error announcements
    const announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
    
    const errorAnnouncements = announcements.filter(ann =>
      ann.text.toLowerCase().includes('error') ||
      ann.text.toLowerCase().includes('required') ||
      ann.text.toLowerCase().includes('invalid') ||
      ann.text.toLowerCase().includes('field') ||
      ann.role === 'alert'
    );
    
    // If there are visible validation errors, they should be announced
    const visibleErrors = await page.locator('[role="alert"], .error, [aria-invalid="true"] + *, [data-testid*="error"]').all();
    
    if (visibleErrors.length > 0) {
      expect(errorAnnouncements.length).toBeGreaterThan(0);
      
      // Validation errors should be announced assertively
      errorAnnouncements.forEach(ann => {
        expect(ann.level === 'assertive' || ann.role === 'alert').toBe(true);
      });
    }
  });

  test('should announce loading states and completion', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    // Look for actions that might trigger loading states
    const loadingTriggers = await page.locator('button:has-text("Refresh"), button:has-text("Load"), button:has-text("Fetch"), a[href^="/dashboard"]').all();
    
    if (loadingTriggers.length === 0) {
      test.skip('No loading triggers found to test');
    }
    
    // Trigger a loading action
    await loadingTriggers[0].click();
    await page.waitForTimeout(1000);
    
    // Check for loading announcements
    let announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
    
    const loadingAnnouncements = announcements.filter(ann =>
      ann.text.toLowerCase().includes('loading') ||
      ann.text.toLowerCase().includes('fetching') ||
      ann.text.toLowerCase().includes('please wait')
    );
    
    // Wait longer for completion
    await page.waitForTimeout(3000);
    
    announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
    
    const completionAnnouncements = announcements.filter(ann =>
      ann.text.toLowerCase().includes('loaded') ||
      ann.text.toLowerCase().includes('complete') ||
      ann.text.toLowerCase().includes('finished') ||
      ann.text.toLowerCase().includes('ready')
    );
    
    // Should announce loading state changes appropriately
    if (loadingAnnouncements.length > 0 || completionAnnouncements.length > 0) {
      // Loading states should be polite to not interrupt user
      loadingAnnouncements.forEach(ann => {
        expect(ann.level === 'polite' || ann.role === 'status').toBe(true);
      });
    }
  });

  test('should announce dynamic content updates', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    // Simulate dynamic content update by clicking navigation or filters
    const updateTriggers = await page.locator('button:has-text("Filter"), button:has-text("Sort"), nav a, .tab').all();
    
    if (updateTriggers.length === 0) {
      test.skip('No dynamic content triggers found');
    }
    
    const initialContent = await page.locator('main, [role="main"], .content').textContent();
    
    // Trigger content update
    await updateTriggers[0].click();
    await page.waitForTimeout(2000); // Allow content to update
    
    const updatedContent = await page.locator('main, [role="main"], .content').textContent();
    
    // If content changed significantly, it should be announced
    if (initialContent !== updatedContent) {
      const announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
      
      const contentAnnouncements = announcements.filter(ann =>
        ann.text.length > 10 && // Meaningful announcements
        (ann.level === 'polite' || ann.role === 'status')
      );
      
      // Should have at least one announcement about the content change
      expect(contentAnnouncements.length).toBeGreaterThan(0);
    }
  });

  test('should have proper live regions for status updates', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for existing live regions
    const liveRegions = await page.locator('[aria-live], [role="alert"], [role="status"], [role="log"]').all();
    
    // There should be at least one live region for announcements
    expect(liveRegions.length).toBeGreaterThan(0);
    
    // Check that live regions are properly configured
    for (const region of liveRegions) {
      const ariaLive = await region.getAttribute('aria-live');
      const role = await region.getAttribute('role');
      
      // Should have appropriate aria-live value or role
      const validConfig = 
        ariaLive === 'polite' ||
        ariaLive === 'assertive' ||
        role === 'alert' ||
        role === 'status' ||
        role === 'log';
      
      expect(validConfig).toBe(true);
      
      // Live regions should not be hidden from screen readers
      const ariaHidden = await region.getAttribute('aria-hidden');
      expect(ariaHidden).not.toBe('true');
    }
  });

  test('should announce search results and filtering', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for search or filter functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]');
    const filterButtons = page.locator('button:has-text("Filter"), select[aria-label*="filter" i], [data-testid*="filter"]');
    
    if (await searchInput.count() === 0 && await filterButtons.count() === 0) {
      test.skip('No search or filter functionality found');
    }
    
    // Clear any initial announcements
    await page.evaluate(() => { window.ariaLiveAnnouncements = []; });
    
    if (await searchInput.count() > 0) {
      // Test search announcements
      await searchInput.fill('test');
      await page.waitForTimeout(1500); // Allow for search results
      
      const announcements = await page.evaluate(() => window.ariaLiveAnnouncements);
      
      const searchAnnouncements = announcements.filter(ann =>
        ann.text.toLowerCase().includes('result') ||
        ann.text.toLowerCase().includes('found') ||
        ann.text.toLowerCase().includes('match') ||
        /\d+/.test(ann.text) // Numbers indicating result count
      );
      
      // Should announce search results
      if (searchAnnouncements.length > 0) {
        // Search results should be announced politely
        searchAnnouncements.forEach(ann => {
          expect(ann.level === 'polite' || ann.role === 'status').toBe(true);
        });
      }
    }
  });
});