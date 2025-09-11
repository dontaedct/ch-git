/**
 * HT-004.6.1: Automated Test Suite - E2E Tests
 * Hero Tasks Complete User Workflows
 * Created: 2025-09-08T18:45:00.000Z
 */

import { test, expect } from '@playwright/test';

test.describe('Hero Tasks E2E Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Hero Tasks page
    await page.goto('/hero-tasks');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Task Creation Workflow', () => {
    test('complete task creation flow', async ({ page }) => {
      // Click "New Task" button
      await page.click('[data-testid="new-task-button"]');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();

      // Fill in task details
      await page.fill('[data-testid="task-title-input"]', 'E2E Test Task');
      await page.fill('[data-testid="task-description-input"]', 'This is an end-to-end test task');
      await page.selectOption('[data-testid="task-priority-select"]', 'high');
      await page.selectOption('[data-testid="task-type-select"]', 'feature');
      await page.fill('[data-testid="task-estimated-hours-input"]', '8');
      await page.fill('[data-testid="task-due-date-input"]', '2025-09-15');

      // Add tags
      await page.fill('[data-testid="task-tags-input"]', 'e2e, test, automation');
      await page.press('[data-testid="task-tags-input"]', 'Enter');

      // Submit the form
      await page.click('[data-testid="submit-task-button"]');

      // Verify task was created
      await expect(page.locator('[data-testid="task-card"]').first()).toBeVisible();
      await expect(page.locator('text=HT-001')).toBeVisible();
      await expect(page.locator('text=E2E Test Task')).toBeVisible();
      await expect(page.locator('text=e2e')).toBeVisible();
    });

    test('task creation with validation errors', async ({ page }) => {
      await page.click('[data-testid="new-task-button"]');

      // Try to submit without required fields
      await page.click('[data-testid="submit-task-button"]');

      // Verify validation errors
      await expect(page.locator('text=Title is required')).toBeVisible();

      // Fill only title
      await page.fill('[data-testid="task-title-input"]', 'Test Task');

      // Try invalid estimated hours
      await page.fill('[data-testid="task-estimated-hours-input"]', '-5');
      await page.click('[data-testid="submit-task-button"]');

      await expect(page.locator('text=Estimated hours must be positive')).toBeVisible();

      // Try invalid due date
      await page.fill('[data-testid="task-estimated-hours-input"]', '8');
      await page.fill('[data-testid="task-due-date-input"]', '2020-01-01');
      await page.click('[data-testid="submit-task-button"]');

      await expect(page.locator('text=Due date must be in the future')).toBeVisible();
    });
  });

  test.describe('Task Management Workflow', () => {
    test('edit existing task', async ({ page }) => {
      // Create a task first
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Edit');
      await page.fill('[data-testid="task-description-input"]', 'Original description');
      await page.selectOption('[data-testid="task-priority-select"]', 'medium');
      await page.click('[data-testid="submit-task-button"]');

      // Wait for task to appear
      await expect(page.locator('[data-testid="task-card"]').first()).toBeVisible();

      // Click edit button
      await page.click('[data-testid="edit-button"]');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();

      // Update task details
      await page.fill('[data-testid="task-title-input"]', 'Updated Task Title');
      await page.fill('[data-testid="task-description-input"]', 'Updated description');
      await page.selectOption('[data-testid="task-priority-select"]', 'high');

      // Submit changes
      await page.click('[data-testid="submit-task-button"]');

      // Verify changes
      await expect(page.locator('text=Updated Task Title')).toBeVisible();
      await expect(page.locator('text=Updated description')).toBeVisible();
    });

    test('change task status', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Status Test Task');
      await page.click('[data-testid="submit-task-button"]');

      // Change status to In Progress
      await page.selectOption('[data-testid="status-select"]', 'in_progress');
      await expect(page.locator('text=In Progress')).toBeVisible();

      // Change status to Completed
      await page.selectOption('[data-testid="status-select"]', 'completed');
      await expect(page.locator('text=Completed')).toBeVisible();
    });

    test('delete task with confirmation', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Task to Delete');
      await page.click('[data-testid="submit-task-button"]');

      // Wait for task to appear
      await expect(page.locator('[data-testid="task-card"]').first()).toBeVisible();

      // Click delete button
      await page.click('[data-testid="delete-button"]');

      // Confirm deletion
      page.on('dialog', dialog => dialog.accept());
      await page.click('[data-testid="confirm-delete-button"]');

      // Verify task is removed
      await expect(page.locator('text=Task to Delete')).not.toBeVisible();
    });
  });

  test.describe('Search and Filtering Workflow', () => {
    test('search tasks by title', async ({ page }) => {
      // Create multiple tasks
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Authentication Feature');
      await page.fill('[data-testid="task-description-input"]', 'Implement user authentication');
      await page.click('[data-testid="submit-task-button"]');

      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Navigation Bug Fix');
      await page.fill('[data-testid="task-description-input"]', 'Fix navigation menu');
      await page.click('[data-testid="submit-task-button"]');

      // Search for authentication
      await page.fill('[data-testid="search-input"]', 'authentication');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Verify only authentication task is shown
      await expect(page.locator('text=Authentication Feature')).toBeVisible();
      await expect(page.locator('text=Navigation Bug Fix')).not.toBeVisible();
    });

    test('filter tasks by status', async ({ page }) => {
      // Create tasks with different statuses
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Draft Task');
      await page.click('[data-testid="submit-task-button"]');

      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'In Progress Task');
      await page.click('[data-testid="submit-task-button"]');
      await page.selectOption('[data-testid="status-select"]', 'in_progress');

      // Filter by In Progress status
      await page.selectOption('[data-testid="status-filter"]', 'in_progress');

      // Verify only in progress task is shown
      await expect(page.locator('text=In Progress Task')).toBeVisible();
      await expect(page.locator('text=Draft Task')).not.toBeVisible();
    });

    test('advanced search with multiple criteria', async ({ page }) => {
      // Create tasks with different properties
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'High Priority Feature');
      await page.selectOption('[data-testid="task-priority-select"]', 'high');
      await page.selectOption('[data-testid="task-type-select"]', 'feature');
      await page.click('[data-testid="submit-task-button"]');

      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Low Priority Bug');
      await page.selectOption('[data-testid="task-priority-select"]', 'low');
      await page.selectOption('[data-testid="task-type-select"]', 'bug_fix');
      await page.click('[data-testid="submit-task-button"]');

      // Open advanced search
      await page.click('[data-testid="advanced-search-button"]');
      await expect(page.locator('[data-testid="advanced-search-panel"]')).toBeVisible();

      // Set multiple filters
      await page.selectOption('[data-testid="priority-filter"]', 'high');
      await page.selectOption('[data-testid="type-filter"]', 'feature');

      // Apply filters
      await page.click('[data-testid="apply-filters-button"]');

      // Verify only high priority feature is shown
      await expect(page.locator('text=High Priority Feature')).toBeVisible();
      await expect(page.locator('text=Low Priority Bug')).not.toBeVisible();
    });
  });

  test.describe('Bulk Operations Workflow', () => {
    test('bulk status update', async ({ page }) => {
      // Create multiple tasks
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="new-task-button"]');
        await page.fill('[data-testid="task-title-input"]', `Bulk Task ${i}`);
        await page.click('[data-testid="submit-task-button"]');
      }

      // Select multiple tasks
      await page.check('[data-testid="task-checkbox-1"]');
      await page.check('[data-testid="task-checkbox-2"]');
      await page.check('[data-testid="task-checkbox-3"]');

      // Open bulk operations toolbar
      await expect(page.locator('[data-testid="bulk-operations-toolbar"]')).toBeVisible();

      // Change status for all selected tasks
      await page.selectOption('[data-testid="bulk-status-select"]', 'completed');
      await page.click('[data-testid="bulk-update-button"]');

      // Verify all tasks are completed
      await expect(page.locator('[data-testid="status-badge"]').first()).toHaveText('Completed');
    });

    test('bulk delete tasks', async ({ page }) => {
      // Create multiple tasks
      for (let i = 1; i <= 2; i++) {
        await page.click('[data-testid="new-task-button"]');
        await page.fill('[data-testid="task-title-input"]', `Delete Task ${i}`);
        await page.click('[data-testid="submit-task-button"]');
      }

      // Select tasks for deletion
      await page.check('[data-testid="task-checkbox-1"]');
      await page.check('[data-testid="task-checkbox-2"]');

      // Delete selected tasks
      await page.click('[data-testid="bulk-delete-button"]');
      page.on('dialog', dialog => dialog.accept());
      await page.click('[data-testid="confirm-bulk-delete-button"]');

      // Verify tasks are deleted
      await expect(page.locator('text=Delete Task 1')).not.toBeVisible();
      await expect(page.locator('text=Delete Task 2')).not.toBeVisible();
    });
  });

  test.describe('Keyboard Shortcuts Workflow', () => {
    test('keyboard shortcuts for task management', async ({ page }) => {
      // Test Ctrl+N for new task
      await page.keyboard.press('Control+n');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
      await page.click('[data-testid="cancel-button"]');

      // Create a task first
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Keyboard Test Task');
      await page.click('[data-testid="submit-task-button"]');

      // Test Ctrl+E for edit
      await page.keyboard.press('Control+e');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
      await page.click('[data-testid="cancel-button"]');

      // Test Escape to close form
      await page.keyboard.press('Control+e');
      await page.keyboard.press('Escape');
      await expect(page.locator('[data-testid="task-form"]')).not.toBeVisible();
    });
  });

  test.describe('Drag and Drop Workflow', () => {
    test('reorder tasks by dragging', async ({ page }) => {
      // Create multiple tasks
      for (let i = 1; i <= 3; i++) {
        await page.click('[data-testid="new-task-button"]');
        await page.fill('[data-testid="task-title-input"]', `Order Task ${i}`);
        await page.click('[data-testid="submit-task-button"]');
      }

      // Get initial order
      const initialOrder = await page.locator('[data-testid="task-card"]').allTextContents();

      // Drag first task to last position
      const firstTask = page.locator('[data-testid="task-card"]').first();
      const lastTask = page.locator('[data-testid="task-card"]').last();

      await firstTask.dragTo(lastTask);

      // Verify order changed
      const newOrder = await page.locator('[data-testid="task-card"]').allTextContents();
      expect(newOrder).not.toEqual(initialOrder);
    });

    test('drag task to different status column', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Drag Test Task');
      await page.click('[data-testid="submit-task-button"]');

      // Drag task to "In Progress" column
      const taskCard = page.locator('[data-testid="task-card"]').first();
      const inProgressColumn = page.locator('[data-testid="status-column-in_progress"]');

      await taskCard.dragTo(inProgressColumn);

      // Verify status changed
      await expect(page.locator('text=In Progress')).toBeVisible();
    });
  });

  test.describe('Export Workflow', () => {
    test('export tasks as CSV', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Export Test Task');
      await page.fill('[data-testid="task-description-input"]', 'Task for export testing');
      await page.click('[data-testid="submit-task-button"]');

      // Click export button
      await page.click('[data-testid="export-button"]');
      await expect(page.locator('[data-testid="export-menu"]')).toBeVisible();

      // Select CSV format
      await page.click('[data-testid="export-csv-option"]');

      // Verify download started
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    });

    test('export tasks as PDF', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'PDF Export Task');
      await page.click('[data-testid="submit-task-button"]');

      // Export as PDF
      await page.click('[data-testid="export-button"]');
      await page.click('[data-testid="export-pdf-option"]');

      // Verify download started
      const downloadPromise = page.waitForEvent('download');
      await downloadPromise;
    });
  });

  test.describe('Real-time Collaboration Workflow', () => {
    test('shows presence indicators', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Collaboration Task');
      await page.click('[data-testid="submit-task-button"]');

      // Verify presence indicator is shown
      await expect(page.locator('[data-testid="presence-indicator"]')).toBeVisible();
    });

    test('shows typing indicators', async ({ page }) => {
      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Typing Test Task');
      await page.click('[data-testid="submit-task-button"]');

      // Start editing
      await page.click('[data-testid="edit-button"]');
      await page.fill('[data-testid="task-description-input"]', 'Testing typing indicator');

      // Verify typing indicator appears
      await expect(page.locator('[data-testid="typing-indicator"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness Workflow', () => {
    test('mobile navigation works correctly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify mobile navigation is visible
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

      // Test mobile menu toggle
      await page.click('[data-testid="mobile-menu-toggle"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

      // Test mobile task creation
      await page.click('[data-testid="mobile-new-task-button"]');
      await expect(page.locator('[data-testid="task-form"]')).toBeVisible();
    });

    test('touch interactions work on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Create a task
      await page.click('[data-testid="new-task-button"]');
      await page.fill('[data-testid="task-title-input"]', 'Mobile Touch Task');
      await page.click('[data-testid="submit-task-button"]');

      // Test touch interactions
      await page.tap('[data-testid="task-card"]');
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
    });
  });
});
