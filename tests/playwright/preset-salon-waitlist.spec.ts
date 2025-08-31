/**
 * Playwright Smoke Test: Salon/Med-Spa Waitlist Preset
 */

import { test, expect } from '@playwright/test'

test.describe('Salon Waitlist Preset', () => {
  test('renders preset questionnaire', async ({ page }) => {
    await page.goto('/salon/waitlist')

    // Basic page structure loads
    await expect(page.locator('body')).toBeVisible()

    // Preset title should be present
    await expect(page.locator('text=Join Our VIP Waitlist')).toBeVisible({ timeout: 10000 })

    // A couple of expected fields from the preset
    const nameField = page.locator('input[placeholder="First and Last Name"]')
    const emailField = page.locator('input[placeholder="your.email@example.com"]')

    await expect(nameField).toBeVisible()
    await expect(emailField).toBeVisible()

    // Chips for preferred contact should be in the DOM (labels)
    const contactChips = page.locator('text=Text Message').or(page.locator('text=Phone Call')).or(page.locator('text=Email'))
    await expect(contactChips.first()).toBeVisible()
  })
})

