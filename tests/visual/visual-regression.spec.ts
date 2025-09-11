/**
 * @fileoverview HT-006 Visual Regression Tests
 * @module tests/visual/visual-regression.spec.ts
 * @author HT-006 Phase 5 - Visual Regression Safety
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 5 - Visual Regression Safety
 * Purpose: Comprehensive visual regression testing for HT-006 components
 * Safety: Sandbox-isolated, automated baseline capture
 * Status: Phase 5 implementation
 */

import { test, expect } from '@playwright/test';

// Test configuration
const VIEWPORTS = [
  { width: 375, height: 667, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1024, height: 768, name: 'desktop' },
  { width: 1440, height: 900, name: 'wide' }
];

const THEMES = ['light', 'dark'];
const BRANDS = ['default', 'salon', 'tech', 'realtor'];

// Helper function to navigate to story with theme and brand
async function navigateToStory(page: any, storyId: string, theme: string, brand: string) {
  const url = `/iframe.html?id=${storyId}&viewMode=story&theme=${theme}&brand=${brand}`;
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Allow animations to complete
}

// Helper function to set viewport
async function setViewport(page: any, viewport: { width: number; height: number; name: string }) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
}

// Button component tests
test.describe('HT-006 Button Component Visual Tests', () => {
  const buttonStories = [
    'ht-006-components-button--default',
    'ht-006-components-button--primary',
    'ht-006-components-button--secondary',
    'ht-006-components-button--ghost',
    'ht-006-components-button--link',
    'ht-006-components-button--destructive',
    'ht-006-components-button--small',
    'ht-006-components-button--medium',
    'ht-006-components-button--large',
    'ht-006-components-button--brand-tone',
    'ht-006-components-button--success-tone',
    'ht-006-components-button--warning-tone',
    'ht-006-components-button--danger-tone',
    'ht-006-components-button--loading',
    'ht-006-components-button--disabled',
    'ht-006-components-button--full-width',
    'ht-006-components-button--with-icon-left',
    'ht-006-components-button--with-icon-right',
    'ht-006-components-button--icon-only',
    'ht-006-components-button--all-variants',
    'ht-006-components-button--all-tones'
  ];

  for (const storyId of buttonStories) {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const brand of BRANDS) {
          test(`${storyId} - ${viewport.name} - ${theme} - ${brand}`, async ({ page }) => {
            await setViewport(page, viewport);
            await navigateToStory(page, storyId, theme, brand);
            
            // Take screenshot
            await expect(page).toHaveScreenshot(`${storyId}_${viewport.name}_${theme}_${brand}.png`, {
              fullPage: true,
              animations: 'disabled'
            });
          });
        }
      }
    }
  }
});

// Card component tests
test.describe('HT-006 Card Component Visual Tests', () => {
  const cardStories = [
    'ht-006-components-card--default',
    'ht-006-components-card--outlined',
    'ht-006-components-card--filled',
    'ht-006-components-card--no-elevation',
    'ht-006-components-card--small-elevation',
    'ht-006-components-card--medium-elevation',
    'ht-006-components-card--large-elevation',
    'ht-006-components-card--no-padding',
    'ht-006-components-card--small-padding',
    'ht-006-components-card--medium-padding',
    'ht-006-components-card--large-padding',
    'ht-006-components-card--outlined-large-elevation',
    'ht-006-components-card--filled-medium-elevation',
    'ht-006-components-card--hover-state',
    'ht-006-components-card--with-image',
    'ht-006-components-card--with-actions',
    'ht-006-components-card--minimal-card',
    'ht-006-components-card--all-variants',
    'ht-006-components-card--all-elevations'
  ];

  for (const storyId of cardStories) {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const brand of BRANDS) {
          test(`${storyId} - ${viewport.name} - ${theme} - ${brand}`, async ({ page }) => {
            await setViewport(page, viewport);
            await navigateToStory(page, storyId, theme, brand);
            
            // Take screenshot
            await expect(page).toHaveScreenshot(`${storyId}_${viewport.name}_${theme}_${brand}.png`, {
              fullPage: true,
              animations: 'disabled'
            });
          });
        }
      }
    }
  }
});

// Hero block tests
test.describe('HT-006 Hero Block Visual Tests', () => {
  const heroStories = [
    'ht-006-blocks-hero--default',
    'ht-006-blocks-hero--minimal',
    'ht-006-blocks-hero--with-image',
    'ht-006-blocks-hero--left-aligned',
    'ht-006-blocks-hero--right-aligned',
    'ht-006-blocks-hero--subtle-background',
    'ht-006-blocks-hero--pattern-background',
    'ht-006-blocks-hero--small-padding',
    'ht-006-blocks-hero--extra-large-padding',
    'ht-006-blocks-hero--small-max-width',
    'ht-006-blocks-hero--full-max-width',
    'ht-006-blocks-hero--single-c-t-a',
    'ht-006-blocks-hero--no-badge',
    'ht-006-blocks-hero--no-description',
    'ht-006-blocks-hero--no-visual',
    'ht-006-blocks-hero--long-content',
    'ht-006-blocks-hero--short-content',
    'ht-006-blocks-hero--layout-showcase'
  ];

  for (const storyId of heroStories) {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const brand of BRANDS) {
          test(`${storyId} - ${viewport.name} - ${theme} - ${brand}`, async ({ page }) => {
            await setViewport(page, viewport);
            await navigateToStory(page, storyId, theme, brand);
            
            // Take screenshot
            await expect(page).toHaveScreenshot(`${storyId}_${viewport.name}_${theme}_${brand}.png`, {
              fullPage: true,
              animations: 'disabled'
            });
          });
        }
      }
    }
  }
});

// Cross-browser compatibility tests
test.describe('Cross-Browser Compatibility', () => {
  test('Button component consistency across browsers', async ({ page, browserName }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    await navigateToStory(page, 'ht-006-components-button--all-variants', 'light', 'default');
    
    await expect(page).toHaveScreenshot(`button_all_variants_${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Card component consistency across browsers', async ({ page, browserName }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    await navigateToStory(page, 'ht-006-components-card--all-variants', 'light', 'default');
    
    await expect(page).toHaveScreenshot(`card_all_variants_${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Hero block consistency across browsers', async ({ page, browserName }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    await navigateToStory(page, 'ht-006-blocks-hero--default', 'light', 'default');
    
    await expect(page).toHaveScreenshot(`hero_default_${browserName}.png`, {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

// Theme switching tests
test.describe('Theme Switching Visual Tests', () => {
  test('Button theme switching', async ({ page }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    
    // Test light theme
    await navigateToStory(page, 'ht-006-components-button--all-variants', 'light', 'default');
    await expect(page).toHaveScreenshot('button_theme_light.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test dark theme
    await navigateToStory(page, 'ht-006-components-button--all-variants', 'dark', 'default');
    await expect(page).toHaveScreenshot('button_theme_dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('Card theme switching', async ({ page }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    
    // Test light theme
    await navigateToStory(page, 'ht-006-components-card--all-variants', 'light', 'default');
    await expect(page).toHaveScreenshot('card_theme_light.png', {
      fullPage: true,
      animations: 'disabled'
    });
    
    // Test dark theme
    await navigateToStory(page, 'ht-006-components-card--all-variants', 'dark', 'default');
    await expect(page).toHaveScreenshot('card_theme_dark.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

// Brand switching tests
test.describe('Brand Switching Visual Tests', () => {
  test('Button brand switching', async ({ page }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    
    for (const brand of BRANDS) {
      await navigateToStory(page, 'ht-006-components-button--brand-tone', 'light', brand);
      await expect(page).toHaveScreenshot(`button_brand_${brand}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Card brand switching', async ({ page }) => {
    await setViewport(page, VIEWPORTS[2]); // Desktop viewport
    
    for (const brand of BRANDS) {
      await navigateToStory(page, 'ht-006-components-card--default', 'light', brand);
      await expect(page).toHaveScreenshot(`card_brand_${brand}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });
});

// Responsive design tests
test.describe('Responsive Design Visual Tests', () => {
  test('Button responsive behavior', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await setViewport(page, viewport);
      await navigateToStory(page, 'ht-006-components-button--full-width', 'light', 'default');
      
      await expect(page).toHaveScreenshot(`button_responsive_${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Card responsive behavior', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await setViewport(page, viewport);
      await navigateToStory(page, 'ht-006-components-card--all-variants', 'light', 'default');
      
      await expect(page).toHaveScreenshot(`card_responsive_${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });

  test('Hero block responsive behavior', async ({ page }) => {
    for (const viewport of VIEWPORTS) {
      await setViewport(page, viewport);
      await navigateToStory(page, 'ht-006-blocks-hero--default', 'light', 'default');
      
      await expect(page).toHaveScreenshot(`hero_responsive_${viewport.name}.png`, {
        fullPage: true,
        animations: 'disabled'
      });
    }
  });
});
