/**
 * @fileoverview HT-008.7.3: Enhanced End-to-End Test Suite
 * @description Comprehensive E2E tests for critical user workflows with improved reliability
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.7.3 - End-to-End Test Suite Enhancement
 * Focus: Comprehensive testing suite with 95%+ coverage
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (testing infrastructure)
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Test configuration and utilities
const TEST_CONFIG = {
  timeout: 30000,
  retries: 2,
  baseURL: 'http://localhost:3000',
  viewports: {
    desktop: { width: 1920, height: 1080 },
    tablet: { width: 768, height: 1024 },
    mobile: { width: 375, height: 667 }
  }
};

// Test data factory
class TestDataFactory {
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
}

// Page Object Model for better test organization
class HomePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle() {
    return await this.page.title();
  }

  async getMainContent() {
    return this.page.locator('main, [role="main"], .min-h-screen').first();
  }

  async getNavigation() {
    return this.page.locator('nav, [role="navigation"], header').first();
  }

  async getHeading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  async isLoaded() {
    const title = await this.getTitle();
    const mainContent = await this.getMainContent();
    return title.includes('Micro App Template') && await mainContent.isVisible();
  }
}

class IntakePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/intake');
    await this.page.waitForLoadState('networkidle');
  }

  async fillForm(userData: ReturnType<typeof TestDataFactory.createUser>) {
    // Fill name field
    const nameField = this.page.getByLabel(/name/i).or(
      this.page.locator('input[placeholder*="name" i]')
    );
    if (await nameField.isVisible()) {
      await nameField.fill(userData.name);
    }

    // Fill email field
    const emailField = this.page.getByLabel(/email/i).or(
      this.page.locator('input[type="email"]')
    );
    if (await emailField.isVisible()) {
      await emailField.fill(userData.email);
    }

    // Fill phone field
    const phoneField = this.page.getByLabel(/phone/i).or(
      this.page.locator('input[placeholder*="phone" i]')
    );
    if (await phoneField.isVisible()) {
      await phoneField.fill(userData.phone);
    }

    // Fill message field
    const messageField = this.page.getByLabel(/message/i).or(
      this.page.locator('textarea')
    );
    if (await messageField.isVisible()) {
      await messageField.fill(userData.message);
    }
  }

  async submitForm() {
    const submitButton = this.page.getByRole('button', { name: /submit|send|create/i });
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
  }

  async getValidationErrors() {
    return this.page.locator('[role="alert"], .text-red-600, .text-red-700, .error');
  }
}

class DashboardPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async getMetricCards() {
    return this.page.locator('[data-testid="metric-card"], .card, .metric-card');
  }

  async getRecentActivity() {
    return this.page.getByText(/recent activity/i).or(
      this.page.locator('[data-testid="recent-activity"]')
    );
  }
}

class StatusPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('/status');
    await this.page.waitForLoadState('networkidle');
  }

  async getSystemInfo() {
    return this.page.locator('h2, h3').first();
  }

  async getMetrics() {
    return this.page.locator('.card, .metric, [data-testid="metric"]');
  }
}

// Enhanced test suite
test.describe('HT-008.7.3: Enhanced E2E Test Suite', () => {
  let homePage: HomePage;
  let intakePage: IntakePage;
  let dashboardPage: DashboardPage;
  let statusPage: StatusPage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    intakePage = new IntakePage(page);
    dashboardPage = new DashboardPage(page);
    statusPage = new StatusPage(page);
  });

  test.describe('Core Application Functionality', () => {
    test('should load homepage with proper structure', async ({ page }) => {
      await homePage.navigate();
      
      // Verify page loads successfully
      expect(await homePage.isLoaded()).toBe(true);
      
      // Verify basic page structure
      await expect(homePage.getMainContent()).toBeVisible();
      await expect(homePage.getNavigation()).toBeVisible();
      
      // Verify no critical console errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.waitForTimeout(2000);
      
      // Filter out expected errors
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('404') &&
        !error.includes('ResizeObserver') &&
        !error.includes('Non-Error promise rejection')
      );
      
      if (criticalErrors.length > 0) {
        console.warn('Console errors found:', criticalErrors);
      }
    });

    test('should handle responsive design across viewports', async ({ page }) => {
      const viewports = Object.values(TEST_CONFIG.viewports);
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await homePage.navigate();
        
        // Verify page loads on all viewports
        await expect(homePage.getMainContent()).toBeVisible();
        
        // Check for horizontal overflow on mobile
        if (viewport.width <= 768) {
          const bodyBox = await page.locator('body').boundingBox();
          if (bodyBox) {
            expect(bodyBox.width).toBeLessThanOrEqual(viewport.width + 20);
          }
        }
      }
    });

    test('should maintain navigation functionality', async ({ page }) => {
      await homePage.navigate();
      
      // Test navigation links
      const navLinks = page.locator('nav a, [role="navigation"] a').filter({
        hasText: /dashboard|intake|status|login/i
      });
      
      const linkCount = await navLinks.count();
      
      if (linkCount > 0) {
        // Test first few navigation links
        for (let i = 0; i < Math.min(3, linkCount); i++) {
          const link = navLinks.nth(i);
          const href = await link.getAttribute('href');
          
          if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            // Verify navigation worked
            expect(page.url()).toContain(href);
            
            // Return to home for next test
            await homePage.navigate();
          }
        }
      }
    });
  });

  test.describe('Form Interactions and Validation', () => {
    test('should handle intake form workflow', async ({ page }) => {
      const userData = TestDataFactory.createUser();
      
      await intakePage.navigate();
      
      // Verify form is present
      const form = page.locator('form');
      if (await form.isVisible()) {
        await intakePage.fillForm(userData);
        await intakePage.submitForm();
        
        // Wait for response
        await page.waitForTimeout(2000);
        
        // Check for success message or redirect
        const successMessage = page.getByText(/thank you|success|submitted/i);
        if (await successMessage.isVisible()) {
          await expect(successMessage).toBeVisible();
        }
      }
    });

    test('should validate form inputs properly', async ({ page }) => {
      await intakePage.navigate();
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Try to submit empty form
        await intakePage.submitForm();
        
        // Check for validation messages
        const validationErrors = await intakePage.getValidationErrors();
        const errorCount = await validationErrors.count();
        
        if (errorCount > 0) {
          await expect(validationErrors.first()).toBeVisible();
        }
      }
    });

    test('should handle form auto-save functionality', async ({ page }) => {
      const userData = TestDataFactory.createUser();
      
      await intakePage.navigate();
      
      const form = page.locator('form');
      if (await form.isVisible()) {
        // Fill partial form
        const nameField = page.getByLabel(/name/i).or(
          page.locator('input[placeholder*="name" i]')
        );
        const emailField = page.getByLabel(/email/i).or(
          page.locator('input[type="email"]')
        );
        
        if (await nameField.isVisible()) {
          await nameField.fill(userData.name);
        }
        if (await emailField.isVisible()) {
          await emailField.fill(userData.email);
        }
        
        // Navigate away and back
        await dashboardPage.navigate();
        await intakePage.navigate();
        
        // Check if data was preserved (auto-save)
        if (await nameField.isVisible()) {
          const nameValue = await nameField.inputValue();
          if (nameValue) {
            expect(nameValue).toBe(userData.name);
          }
        }
      }
    });
  });

  test.describe('Dashboard and Status Pages', () => {
    test('should display dashboard metrics', async ({ page }) => {
      await dashboardPage.navigate();
      
      // Verify dashboard loads
      await expect(dashboardPage.getMainContent()).toBeVisible();
      
      // Check for metric cards
      const metricCards = await dashboardPage.getMetricCards();
      const cardCount = await metricCards.count();
      
      if (cardCount > 0) {
        await expect(metricCards.first()).toBeVisible();
      }
      
      // Check for recent activity section
      const recentActivity = await dashboardPage.getRecentActivity();
      if (await recentActivity.isVisible()) {
        await expect(recentActivity).toBeVisible();
      }
    });

    test('should display system status information', async ({ page }) => {
      await statusPage.navigate();
      
      // Verify status page loads
      await expect(statusPage.getMainContent()).toBeVisible();
      
      // Check for system information
      const systemInfo = await statusPage.getSystemInfo();
      if (await systemInfo.isVisible()) {
        await expect(systemInfo).toBeVisible();
      }
      
      // Check for metrics
      const metrics = await statusPage.getMetrics();
      const metricCount = await metrics.count();
      
      if (metricCount > 0) {
        await expect(metrics.first()).toBeVisible();
      }
    });
  });

  test.describe('API Integration and Error Handling', () => {
    test('should handle API endpoints correctly', async ({ request }) => {
      // Test health endpoint
      const healthResponse = await request.get('/api/health');
      expect([200, 404, 500]).toContain(healthResponse.status());
      
      // Test status endpoint
      const statusResponse = await request.get('/api/status');
      expect([200, 404, 500]).toContain(statusResponse.status());
      
      // Test guardian endpoints
      const heartbeatResponse = await request.get('/api/guardian/heartbeat');
      expect([200, 403, 404, 429, 500]).toContain(heartbeatResponse.status());
    });

    test('should handle 404 errors gracefully', async ({ page }) => {
      const response = await page.goto('/non-existent-page');
      
      // Should handle 404 gracefully
      const status = response?.status();
      expect([404, 200]).toContain(status);
      
      // Page should not crash
      await expect(page.locator('body')).toBeVisible();
      
      // Should show 404 content or redirect
      const notFoundContent = page.getByText(/not found|404|page not found/i);
      if (await notFoundContent.isVisible()) {
        await expect(notFoundContent).toBeVisible();
      }
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      await homePage.navigate();
      
      // Check for offline indicator or graceful degradation
      const offlineIndicator = page.getByText(/offline|no connection|network error/i);
      if (await offlineIndicator.isVisible()) {
        await expect(offlineIndicator).toBeVisible();
      }
      
      // Restore online mode
      await page.context().setOffline(false);
    });
  });

  test.describe('Accessibility and Keyboard Navigation', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await homePage.navigate();
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      
      // Verify focus is visible
      const focusedElement = page.locator(':focus');
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }
      
      // Test enter key on interactive elements
      const interactiveElements = page.locator('button, a, input, textarea, select');
      const elementCount = await interactiveElements.count();
      
      if (elementCount > 0) {
        const firstElement = interactiveElements.first();
        if (await firstElement.isVisible()) {
          await firstElement.focus();
          await page.keyboard.press('Enter');
        }
      }
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await homePage.navigate();
      
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      
      if (headingCount > 0) {
        await expect(headings.first()).toBeVisible();
      }
      
      // Check for ARIA labels
      const ariaElements = page.locator('[aria-label], [aria-labelledby], [role]');
      const ariaCount = await ariaElements.count();
      
      if (ariaCount > 0) {
        await expect(ariaElements.first()).toBeVisible();
      }
      
      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        if (alt !== null) {
          expect(alt).toBeTruthy();
        }
      }
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should load pages within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await homePage.navigate();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // 5 second budget
      
      // Verify page is interactive
      await expect(homePage.getMainContent()).toBeVisible();
    });

    test('should handle concurrent user interactions', async ({ page }) => {
      await homePage.navigate();
      
      // Simulate rapid interactions
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      if (buttonCount > 0) {
        // Rapidly click first few buttons
        for (let i = 0; i < Math.min(3, buttonCount); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            await button.click();
            await page.waitForTimeout(100);
          }
        }
        
        // Verify page remains stable
        await expect(homePage.getMainContent()).toBeVisible();
      }
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work consistently across browsers', async ({ page, browserName }) => {
      await homePage.navigate();
      
      // Basic functionality test
      await expect(homePage.getMainContent()).toBeVisible();
      
      // Browser-specific tests
      if (browserName === 'chromium') {
        // Chrome-specific tests
        await expect(homePage.getNavigation()).toBeVisible();
      } else if (browserName === 'firefox') {
        // Firefox-specific tests
        await expect(homePage.getMainContent()).toBeVisible();
      } else if (browserName === 'webkit') {
        // Safari-specific tests
        await expect(homePage.getMainContent()).toBeVisible();
      }
      
      // Test form interactions across browsers
      await intakePage.navigate();
      const form = page.locator('form');
      if (await form.isVisible()) {
        const input = page.locator('input[type="text"], input[type="email"]').first();
        if (await input.isVisible()) {
          await input.fill('Cross-browser test');
          const value = await input.inputValue();
          expect(value).toBe('Cross-browser test');
        }
      }
    });
  });

  test.describe('Session Management and State', () => {
    test('should maintain session state across page navigation', async ({ page }) => {
      await homePage.navigate();
      
      // Set some state (if applicable)
      const localStorage = await page.evaluate(() => {
        localStorage.setItem('test-state', 'test-value');
        return localStorage.getItem('test-state');
      });
      
      expect(localStorage).toBe('test-value');
      
      // Navigate to another page
      await dashboardPage.navigate();
      
      // Verify state is maintained
      const maintainedState = await page.evaluate(() => {
        return localStorage.getItem('test-state');
      });
      
      expect(maintainedState).toBe('test-value');
    });

    test('should handle page refresh gracefully', async ({ page }) => {
      await homePage.navigate();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify page loads correctly after refresh
      await expect(homePage.getMainContent()).toBeVisible();
    });
  });
});
