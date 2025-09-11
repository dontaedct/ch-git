/**
 * @fileoverview HT-008.7.3: E2E Test Utilities
 * @description Shared utilities and helpers for enhanced E2E testing
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

import { Page, expect, Locator } from '@playwright/test';

// Test configuration constants
export const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  baseURL: 'http://localhost:3000',
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  },
  performance: {
    pageLoadBudget: 3000,
    navigationBudget: 1000,
    interactionBudget: 100,
    formSubmissionBudget: 5000
  }
};

// Test data factory
export class TestDataFactory {
  static createUser() {
    return {
      name: 'Test User',
      email: 'test@example.com',
      phone: '555-123-4567',
      message: 'This is a test message for E2E testing'
    };
  }

  static createSession() {
    return {
      title: 'Test Session',
      description: 'Test session description',
      duration: 60,
      type: 'consultation'
    };
  }

  static createClient() {
    return {
      name: 'Test Client',
      email: 'client@example.com',
      phone: '555-987-6543',
      company: 'Test Company'
    };
  }
}

// Performance measurement utilities
export class PerformanceUtils {
  static async measurePageLoad(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async measureNavigation(page: Page, url: string): Promise<number> {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }

  static async measureInteraction(page: Page, action: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await action();
    return Date.now() - startTime;
  }

  static async measureFormSubmission(page: Page, submitAction: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await submitAction();
    await page.waitForTimeout(2000); // Wait for response
    return Date.now() - startTime;
  }
}

// Element interaction utilities
export class ElementUtils {
  static async safeClick(page: Page, selector: string): Promise<boolean> {
    try {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await element.click();
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async safeFill(page: Page, selector: string, value: string): Promise<boolean> {
    try {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await element.fill(value);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  static async waitForElement(page: Page, selector: string, timeout = 5000): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getElementText(page: Page, selector: string): Promise<string | null> {
    try {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        return await element.textContent();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

// Form interaction utilities
export class FormUtils {
  static async fillForm(page: Page, formData: Record<string, string>): Promise<void> {
    for (const [field, value] of Object.entries(formData)) {
      const selectors = [
        `input[name="${field}"]`,
        `input[placeholder*="${field}" i]`,
        `textarea[name="${field}"]`,
        `select[name="${field}"]`
      ];

      for (const selector of selectors) {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.fill(value);
          break;
        }
      }
    }
  }

  static async submitForm(page: Page): Promise<boolean> {
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Send")',
      'button:has-text("Create")',
      'button:has-text("Save")'
    ];

    for (const selector of submitSelectors) {
      const element = page.locator(selector);
      if (await element.isVisible()) {
        await element.click();
        return true;
      }
    }
    return false;
  }

  static async getFormErrors(page: Page): Promise<string[]> {
    const errorSelectors = [
      '[role="alert"]',
      '.text-red-600',
      '.text-red-700',
      '.error',
      '.form-error',
      '[data-testid="error"]'
    ];

    const errors: string[] = [];
    for (const selector of errorSelectors) {
      const elements = page.locator(selector);
      const count = await elements.count();
      for (let i = 0; i < count; i++) {
        const text = await elements.nth(i).textContent();
        if (text) {
          errors.push(text);
        }
      }
    }
    return errors;
  }
}

// Navigation utilities
export class NavigationUtils {
  static async navigateToPage(page: Page, path: string): Promise<boolean> {
    try {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      return true;
    } catch (error) {
      return false;
    }
  }

  static async getNavigationLinks(page: Page): Promise<string[]> {
    const links = page.locator('nav a, [role="navigation"] a');
    const count = await links.count();
    const hrefs: string[] = [];

    for (let i = 0; i < count; i++) {
      const href = await links.nth(i).getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
        hrefs.push(href);
      }
    }
    return hrefs;
  }

  static async testNavigation(page: Page, maxLinks = 3): Promise<void> {
    const links = await this.getNavigationLinks(page);
    const testLinks = links.slice(0, maxLinks);

    for (const link of testLinks) {
      await this.navigateToPage(page, link);
      await this.navigateToPage(page, '/');
    }
  }
}

// Accessibility utilities
export class AccessibilityUtils {
  static async checkHeadingStructure(page: Page): Promise<boolean> {
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const count = await headings.count();
    return count > 0;
  }

  static async checkARIALabels(page: Page): Promise<boolean> {
    const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
    const count = await ariaElements.count();
    return count > 0;
  }

  static async checkImageAltText(page: Page): Promise<boolean> {
    const images = page.locator('img');
    const count = await images.count();
    
    if (count === 0) return true;

    for (let i = 0; i < Math.min(count, 5); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      if (alt === null) return false;
    }
    return true;
  }

  static async testKeyboardNavigation(page: Page): Promise<boolean> {
    try {
      await page.keyboard.press('Tab');
      const focusedElement = page.locator(':focus');
      return await focusedElement.isVisible();
    } catch (error) {
      return false;
    }
  }
}

// Console error utilities
export class ConsoleUtils {
  static async captureConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    return errors;
  }

  static filterExpectedErrors(errors: string[]): string[] {
    const expectedPatterns = [
      'favicon',
      '404',
      'ResizeObserver',
      'Non-Error promise rejection',
      'ChunkLoadError',
      'Loading chunk'
    ];

    return errors.filter(error => 
      !expectedPatterns.some(pattern => error.includes(pattern))
    );
  }
}

// API testing utilities
export class APIUtils {
  static async testEndpoint(request: any, endpoint: string, expectedStatuses: number[]): Promise<boolean> {
    try {
      const response = await request.get(endpoint);
      return expectedStatuses.includes(response.status());
    } catch (error) {
      return false;
    }
  }

  static async testPostEndpoint(request: any, endpoint: string, data: any, expectedStatuses: number[]): Promise<boolean> {
    try {
      const response = await request.post(endpoint, { data });
      return expectedStatuses.includes(response.status());
    } catch (error) {
      return false;
    }
  }
}

// Test assertion utilities
export class AssertionUtils {
  static async assertPageLoads(page: Page, url: string): Promise<void> {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toBeVisible();
  }

  static async assertPerformanceBudget(actualTime: number, budget: number): Promise<void> {
    expect(actualTime).toBeLessThan(budget);
  }

  static async assertNoCriticalErrors(errors: string[]): Promise<void> {
    const criticalErrors = ConsoleUtils.filterExpectedErrors(errors);
    if (criticalErrors.length > 0) {
      console.warn('Critical console errors found:', criticalErrors);
    }
  }

  static async assertFormValidation(page: Page, shouldHaveErrors: boolean): Promise<void> {
    const errors = await FormUtils.getFormErrors(page);
    if (shouldHaveErrors) {
      expect(errors.length).toBeGreaterThan(0);
    } else {
      expect(errors.length).toBe(0);
    }
  }
}

// Test setup utilities
export class SetupUtils {
  static async setupPage(page: Page): Promise<void> {
    // Set default timeout
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    
    // Set default navigation timeout
    page.setDefaultNavigationTimeout(TEST_CONFIG.timeout);
  }

  static async setupViewport(page: Page, viewport: 'desktop' | 'tablet' | 'mobile'): Promise<void> {
    await page.setViewportSize(TEST_CONFIG.viewports[viewport]);
  }

  static async setupNetworkConditions(page: Page, condition: 'slow' | 'offline'): Promise<void> {
    if (condition === 'slow') {
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
    } else if (condition === 'offline') {
      await page.context().setOffline(true);
    }
  }
}

// Test cleanup utilities
export class CleanupUtils {
  static async cleanupPage(page: Page): Promise<void> {
    // Clear local storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Clear cookies
    await page.context().clearCookies();

    // Restore online mode
    await page.context().setOffline(false);
  }

  static async cleanupContext(context: any): Promise<void> {
    // Close all pages
    const pages = context.pages();
    for (const page of pages) {
      await page.close();
    }
  }
}
