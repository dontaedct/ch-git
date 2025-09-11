/**
 * Basic Smoke Tests for OSS Hero Template
 * 
 * These tests verify that the core template functionality works after
 * removing all CoachHub/fitness domain content.
 */

import { test, expect } from '@playwright/test';

test.describe('OSS Hero Template - Basic Functionality', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads without errors
    await expect(page).toHaveTitle(/Automation DCT/);
    
    // Check for basic content
    await expect(page.locator('body')).toBeVisible();
  });

  test('health check endpoint responds', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
  });

  test('ping endpoint responds', async ({ request }) => {
    const response = await request.get('/api/ping');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('message', 'pong');
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('intake page loads', async ({ page }) => {
    await page.goto('/intake');
    
    // Verify intake page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('status page loads', async ({ page }) => {
    await page.goto('/status');
    
    // Verify status page loads
    await expect(page.locator('body')).toBeVisible();
  });

  test('operability page loads', async ({ page }) => {
    await page.goto('/operability');
    
    // Verify operability page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
