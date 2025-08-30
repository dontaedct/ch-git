/**
 * @fileoverview Reduced Motion Accessibility Tests  
 * @description Tests that reduced-motion preferences are respected throughout the app
 * @version 1.0.0
 * @author OSS Hero Design Safety Module
 */

import { test, expect } from '@playwright/test';

test.describe('Reduced Motion Accessibility', () => {
  test('should respect prefers-reduced-motion for animations', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that CSS animations are disabled or minimal
    const animatedElements = await page.locator('*').evaluateAll(elements => {
      return elements.filter(el => {
        const computed = window.getComputedStyle(el);
        return computed.animationDuration !== '0s' || 
               computed.transitionDuration !== '0s';
      }).map(el => ({
        tagName: el.tagName,
        className: el.className,
        animationDuration: window.getComputedStyle(el).animationDuration,
        transitionDuration: window.getComputedStyle(el).transitionDuration
      }));
    });
    
    // In reduced motion mode, animations should be very short or disabled
    for (const element of animatedElements) {
      const animDuration = parseFloat(element.animationDuration);
      const transDuration = parseFloat(element.transitionDuration);
      
      // Animations should be <= 0.01s in reduced motion mode
      if (animDuration > 0) {
        expect(animDuration).toBeLessThanOrEqual(0.01);
      }
      if (transDuration > 0) {
        expect(transDuration).toBeLessThanOrEqual(0.01);
      }
    }
  });

  test('should respect prefers-reduced-motion for page transitions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to another page and check transition behavior
    const navigationLinks = await page.locator('a[href^="/"], button[data-testid*="nav"]').all();
    
    if (navigationLinks.length > 0) {
      const startTime = Date.now();
      await navigationLinks[0].click();
      await page.waitForLoadState('networkidle');
      const endTime = Date.now();
      
      // Page transitions should be very fast with reduced motion
      const transitionTime = endTime - startTime;
      expect(transitionTime).toBeLessThan(500); // Should be under 500ms
    }
  });

  test('should disable parallax and auto-playing animations', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for elements that might have parallax or auto-playing animations
    const problematicElements = await page.locator('[data-parallax], .parallax, [autoplay], .carousel[data-auto], .slider[data-auto]').all();
    
    for (const element of problematicElements) {
      // These elements should be paused or have minimal motion
      const isPlaying = await element.evaluate(el => {
        if (el.hasAttribute('autoplay')) {
          return !el.paused;
        }
        // Check for CSS animations
        const computed = window.getComputedStyle(el);
        return computed.animationPlayState === 'running';
      });
      
      expect(isPlaying).toBe(false);
    }
  });

  test('should provide alternative interaction for hover effects', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find elements that might have hover effects
    const hoverElements = await page.locator('button, a, .hover\\:scale, .hover\\:transform, [data-hover]').all();
    
    for (const element of hoverElements.slice(0, 5)) {
      // Focus should provide the same information as hover
      await element.focus();
      
      // Element should still be functional and provide feedback
      const hasVisibleFocus = await element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.outlineWidth !== '0px' || 
               computed.boxShadow !== 'none' ||
               computed.borderWidth !== '0px';
      });
      
      expect(hasVisibleFocus).toBe(true);
    }
  });

  test('should handle modal and drawer animations appropriately', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Look for modal triggers
    const modalTriggers = await page.locator('button[aria-haspopup="dialog"], button:has-text("Settings"), button:has-text("Menu")').all();
    
    if (modalTriggers.length === 0) {
      test.skip('No modal triggers found');
    }
    
    const startTime = Date.now();
    await modalTriggers[0].click();
    
    // Wait for modal to appear
    const modal = page.locator('[role="dialog"], .modal, [data-testid*="modal"]');
    await modal.waitFor({ state: 'visible', timeout: 1000 });
    
    const endTime = Date.now();
    const appearTime = endTime - startTime;
    
    // Modal should appear quickly with reduced motion
    expect(appearTime).toBeLessThan(200);
    
    // Check modal doesn't have long animations
    const modalAnimationDuration = await modal.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return parseFloat(computed.animationDuration) || parseFloat(computed.transitionDuration);
    });
    
    if (modalAnimationDuration > 0) {
      expect(modalAnimationDuration).toBeLessThanOrEqual(0.01);
    }
  });

  test('should provide instant feedback for form interactions', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/intake');
    await page.waitForLoadState('networkidle');
    
    // Find form inputs
    const inputs = await page.locator('input, textarea, select').all();
    
    if (inputs.length === 0) {
      test.skip('No form inputs found');
    }
    
    // Test input feedback
    const input = inputs[0];
    await input.focus();
    
    // Type something and check for immediate feedback
    await input.fill('test input');
    
    // Any validation or feedback should appear immediately
    const feedbackElements = await page.locator('[role="alert"], .error, .success, [aria-live]').all();
    
    for (const feedback of feedbackElements) {
      if (await feedback.isVisible()) {
        // Feedback should not have lengthy animations
        const animationDuration = await feedback.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return parseFloat(computed.animationDuration) || parseFloat(computed.transitionDuration);
        });
        
        if (animationDuration > 0) {
          expect(animationDuration).toBeLessThanOrEqual(0.2); // Allow up to 200ms for feedback
        }
      }
    }
  });

  test('should work without motion-based navigation', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that all navigation is accessible without motion
    // (no swipe-only navigation, gesture-only controls, etc.)
    
    // All interactive elements should be keyboard accessible
    const interactiveElements = await page.locator('button, a, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])').all();
    
    for (const element of interactiveElements.slice(0, 10)) {
      await element.focus();
      
      // Should be focusable and have clear purpose
      await expect(element).toBeFocused();
      
      // Should have accessible name
      const accessibleName = await element.evaluate(el => {
        return el.textContent?.trim() || 
               el.getAttribute('aria-label') || 
               el.getAttribute('title') ||
               el.getAttribute('alt');
      });
      
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should handle carousel/slider controls without auto-advance', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for carousel or slider elements
    const carousels = await page.locator('.carousel, .slider, [role="region"][aria-live], [data-testid*="carousel"]').all();
    
    if (carousels.length === 0) {
      // Try other pages that might have carousels
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    const finalCarousels = await page.locator('.carousel, .slider, [role="region"][aria-live], [data-testid*="carousel"]').all();
    
    if (finalCarousels.length === 0) {
      test.skip('No carousels found to test');
    }
    
    const carousel = finalCarousels[0];
    
    // Carousel should not auto-advance in reduced motion mode
    await page.waitForTimeout(3000); // Wait to see if it auto-advances
    
    // Should have manual controls
    const nextButton = page.locator('button:has-text("Next"), button[aria-label*="next"], .carousel-next');
    const prevButton = page.locator('button:has-text("Previous"), button[aria-label*="previous"], .carousel-prev');
    
    // At least one control method should exist
    const hasControls = await nextButton.count() > 0 || await prevButton.count() > 0;
    expect(hasControls).toBe(true);
    
    // Controls should be keyboard accessible
    if (await nextButton.count() > 0) {
      await nextButton.focus();
      await expect(nextButton).toBeFocused();
    }
    
    if (await prevButton.count() > 0) {
      await prevButton.focus();
      await expect(prevButton).toBeFocused();
    }
  });
});