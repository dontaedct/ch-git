/**
 * @fileoverview E2E Tests for Critical User Workflows
 * @description End-to-end tests for key user journeys
 * @version 1.0.0
 * @author SOS Operation Phase 3 Task 15
 */

import { test, expect } from '@playwright/test';

test.describe('Critical User Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page before each test
    await page.goto('/');
  });

  test.describe('Homepage Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      // Check that the page loads
      await expect(page).toHaveTitle(/DCT Micro-Apps/);
      
      // Check for main navigation elements
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('main')).toBeVisible();
      
      // Check for key content
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('should navigate to key pages', async ({ page }) => {
      // Test navigation to different sections
      const navLinks = [
        { text: 'Dashboard', href: '/dashboard' },
        { text: 'Intake', href: '/intake' },
        { text: 'Consultation', href: '/consultation' },
        { text: 'Questionnaire', href: '/questionnaire' },
      ];

      for (const link of navLinks) {
        await page.getByRole('link', { name: link.text }).click();
        await expect(page).toHaveURL(new RegExp(link.href));
        
        // Verify page content loads
        await expect(page.locator('main')).toBeVisible();
        
        // Go back to home
        await page.goto('/');
      }
    });

    test('should handle responsive navigation', async ({ page }) => {
      // Test mobile navigation
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Check if mobile menu is accessible
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
      
      // Test desktop navigation
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Form Interactions', () => {
    test('should complete intake form workflow', async ({ page }) => {
      // Navigate to intake form
      await page.goto('/intake');
      
      // Fill out the form
      await page.getByLabel(/name/i).fill('John Doe');
      await page.getByLabel(/email/i).fill('john@example.com');
      await page.getByLabel(/phone/i).fill('555-123-4567');
      await page.getByLabel(/message/i).fill('Test message');
      
      // Submit the form
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Verify success message or redirect
      await expect(page.getByText(/thank you/i)).toBeVisible();
    });

    test('should handle form validation errors', async ({ page }) => {
      await page.goto('/intake');
      
      // Try to submit empty form
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Check for validation messages
      await expect(page.getByText(/name is required/i)).toBeVisible();
      await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test('should save form data automatically', async ({ page }) => {
      await page.goto('/intake');
      
      // Fill partial form
      await page.getByLabel(/name/i).fill('Jane Smith');
      await page.getByLabel(/email/i).fill('jane@example.com');
      
      // Navigate away and back
      await page.goto('/dashboard');
      await page.goto('/intake');
      
      // Check if data was auto-saved
      await expect(page.getByLabel(/name/i)).toHaveValue('Jane Smith');
      await expect(page.getByLabel(/email/i)).toHaveValue('jane@example.com');
    });
  });

  test.describe('Questionnaire Engine', () => {
    test('should complete questionnaire workflow', async ({ page }) => {
      await page.goto('/questionnaire');
      
      // Answer questions
      const questions = await page.locator('[data-testid="question"]').all();
      
      for (let i = 0; i < Math.min(questions.length, 5); i++) {
        const question = questions[i];
        const options = await question.locator('[data-testid="option"]').all();
        
        if (options.length > 0) {
          await options[0].click();
        }
        
        // Wait for next question to load
        await page.waitForTimeout(500);
      }
      
      // Check for completion
      await expect(page.getByText(/completed/i)).toBeVisible();
    });

    test('should handle questionnaire navigation', async ({ page }) => {
      await page.goto('/questionnaire');
      
      // Test back button
      await page.getByRole('button', { name: /next/i }).click();
      await page.getByRole('button', { name: /back/i }).click();
      
      // Verify we're back to first question
      await expect(page.locator('[data-testid="question"]').first()).toBeVisible();
    });
  });

  test.describe('Consultation Engine', () => {
    test('should start consultation process', async ({ page }) => {
      await page.goto('/consultation');
      
      // Select consultation type
      await page.getByRole('button', { name: /start consultation/i }).click();
      
      // Fill consultation details
      await page.getByLabel(/topic/i).fill('Business Strategy');
      await page.getByLabel(/description/i).fill('Need help with business planning');
      
      // Submit consultation request
      await page.getByRole('button', { name: /submit/i }).click();
      
      // Verify consultation was created
      await expect(page.getByText(/consultation scheduled/i)).toBeVisible();
    });
  });

  test.describe('Dashboard Functionality', () => {
    test('should display dashboard metrics', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Check for key dashboard elements
      await expect(page.getByText(/overview/i)).toBeVisible();
      await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);
      
      // Check for recent activity
      await expect(page.getByText(/recent activity/i)).toBeVisible();
    });

    test('should handle dashboard interactions', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Test date range picker
      await page.getByRole('button', { name: /date range/i }).click();
      await page.getByRole('button', { name: /last 30 days/i }).click();
      
      // Test filter options
      await page.getByRole('button', { name: /filter/i }).click();
      await page.getByRole('checkbox', { name: /completed/i }).check();
      
      // Verify filters are applied
      await expect(page.getByText(/filtered results/i)).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should handle login process', async ({ page }) => {
      await page.goto('/login');
      
      // Fill login form
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/password/i).fill('password123');
      
      // Submit login
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Verify successful login
      await expect(page).toHaveURL(/dashboard/);
      await expect(page.getByText(/welcome/i)).toBeVisible();
    });

    test('should handle authentication errors', async ({ page }) => {
      await page.goto('/login');
      
      // Try invalid credentials
      await page.getByLabel(/email/i).fill('invalid@example.com');
      await page.getByLabel(/password/i).fill('wrongpassword');
      await page.getByRole('button', { name: /sign in/i }).click();
      
      // Check for error message
      await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 errors gracefully', async ({ page }) => {
      await page.goto('/nonexistent-page');
      
      // Check for 404 page
      await expect(page.getByText(/page not found/i)).toBeVisible();
      await expect(page.getByRole('link', { name: /go home/i })).toBeVisible();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate offline mode
      await page.context().setOffline(true);
      
      await page.goto('/');
      
      // Check for offline indicator
      await expect(page.getByText(/offline/i)).toBeVisible();
      
      // Restore online mode
      await page.context().setOffline(false);
    });
  });

  test.describe('Performance', () => {
    test('should load pages within performance budget', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('/');
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // 3 seconds budget
    });

    test('should handle large datasets', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Simulate loading large dataset
      await page.waitForLoadState('networkidle');
      
      // Verify page remains responsive
      await expect(page.locator('main')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should meet accessibility standards', async ({ page }) => {
      await page.goto('/');
      
      // Check for proper heading structure
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      expect(headings.length).toBeGreaterThan(0);
      
      // Check for alt text on images
      const images = await page.locator('img').all();
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
      
      // Check for proper ARIA labels
      await expect(page.locator('[aria-label]')).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      // Test enter key on links
      await page.keyboard.press('Enter');
      await expect(page).not.toHaveURL('/');
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    test('should work across different browsers', async ({ page }) => {
      await page.goto('/');
      
      // Test basic functionality
      await expect(page.locator('main')).toBeVisible();
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Test form interactions
      await page.goto('/intake');
      await page.getByLabel(/name/i).fill('Test User');
      await expect(page.getByLabel(/name/i)).toHaveValue('Test User');
    });
  });
});
