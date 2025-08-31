/**
 * Playwright Smoke Test: Realtor Listing Hub Preset
 */

import { test, expect } from '@playwright/test'

test.describe('Realtor Listing Hub Preset', () => {
  test('renders preset questionnaire', async ({ page }) => {
    await page.goto('/realtor/listings')

    await expect(page.locator('body')).toBeVisible()

    // Preset title should be present
    await expect(page.locator('text=Tell Us About Your Next Home')).toBeVisible({ timeout: 10000 })

    // Key fields from the preset
    const locationField = page.locator('input[placeholder="e.g., Frisco, TX or \'Downtown\'"]')
    const emailField = page.locator('input[placeholder="your.email@example.com"]')
    await expect(locationField).toBeVisible()
    await expect(emailField).toBeVisible()

    // Chips for property type should be visible
    const propertyTypeChip = page.locator('text=Single-Family').or(page.locator('text=Condo'))
    await expect(propertyTypeChip.first()).toBeVisible()
  })
})

