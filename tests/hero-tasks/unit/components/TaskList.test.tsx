/**
 * HT-004.6.1: Automated Test Suite - Unit Tests
 * TaskList Component Tests
 * Created: 2025-09-08T18:45:00.000Z
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from '@/components/hero-tasks/TaskList';
import { TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

// Mock data
const mockTasks = [
  {
    id: 'task-1',
    task_number: 'HT-001',
    title: 'First Task',
    description: 'First task description',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    current_phase: WorkflowPhase.APPLY,
    tags: ['test', 'feature'],
    metadata: {},
    audit_trail: [],
    created_at: '2025-09-08T18:00:00.000Z',
    updated_at: '2025-09-08T18:00:00.000Z',
    estimated_duration_hours: 8,
    actual_duration_hours: 4,
    assignee_id: 'user-1',
    created_by: 'user-1',
    due_date: '2025-09-15T18:00:00.000Z',
    started_at: '2025-09-08T18:00:00.000Z',
    completed_at: undefined,
    subtasks: [],
    dependencies: [],
    attachments: [],
    comments: []
  },
  {
    id: 'task-2',
    task_number: 'HT-002',
    title: 'Second Task',
    description: 'Second task description',
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.MEDIUM,
    type: TaskType.BUG_FIX,
    current_phase: WorkflowPhase.VERIFY,
    tags: ['bug', 'fix'],
    metadata: {},
    audit_trail: [],
    created_at: '2025-09-08T18:00:00.000Z',
    updated_at: '2025-09-08T18:00:00.000Z',
    estimated_duration_hours: 4,
    actual_duration_hours: 4,
    assignee_id: 'user-2',
    created_by: 'user-1',
    due_date: '2025-09-10T18:00:00.000Z',
    started_at: '2025-09-08T18:00:00.000Z',
    completed_at: '2025-09-08T20:00:00.000Z',
    subtasks: [],
    dependencies: [],
    attachments: [],
    comments: []
  }
];

describe('TaskList Component', () => {
  const mockOnTaskSelect = jest.fn();
  const mockOnTaskEdit = jest.fn();
  const mockOnTaskDelete = jest.fn();
  const mockOnStatusChange = jest.fn();
  const mockOnPriorityChange = jest.fn();
  const mockOnBulkSelect = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task list correctly', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    expect(screen.getByText('HT-001')).toBeInTheDocument();
    expect(screen.getByText('HT-002')).toBeInTheDocument();
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.getByText('Second Task')).toBeInTheDocument();
  });

  it('displays correct number of tasks', () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const taskCards = screen.getAllByTestId('task-card');
    expect(taskCards).toHaveLength(2);
  });

  it('handles task selection', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const firstTask = screen.getByText('First Task');
    await user.click(firstTask);

    expect(mockOnTaskSelect).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('handles bulk selection', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const checkboxes = screen.getAllByTestId('task-checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    expect(mockOnBulkSelect).toHaveBeenCalledWith([mockTasks[0].id, mockTasks[1].id]);
  });

  it('shows bulk operations toolbar when tasks are selected', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const checkbox = screen.getAllByTestId('task-checkbox')[0];
    await user.click(checkbox);

    expect(screen.getByTestId('bulk-operations-toolbar')).toBeVisible();
  });

  it('handles select all functionality', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const selectAllCheckbox = screen.getByTestId('select-all-checkbox');
    await user.click(selectAllCheckbox);

    expect(mockOnBulkSelect).toHaveBeenCalledWith([mockTasks[0].id, mockTasks[1].id]);
  });

  it('filters tasks by status', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const statusFilter = screen.getByTestId('status-filter');
    await user.selectOptions(statusFilter, TaskStatus.IN_PROGRESS);

    // Only in-progress tasks should be visible
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.queryByText('Second Task')).not.toBeInTheDocument();
  });

  it('filters tasks by priority', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const priorityFilter = screen.getByTestId('priority-filter');
    await user.selectOptions(priorityFilter, TaskPriority.HIGH);

    // Only high priority tasks should be visible
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.queryByText('Second Task')).not.toBeInTheDocument();
  });

  it('searches tasks by title', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const searchInput = screen.getByTestId('search-input');
    await user.type(searchInput, 'First');

    // Only matching tasks should be visible
    expect(screen.getByText('First Task')).toBeInTheDocument();
    expect(screen.queryByText('Second Task')).not.toBeInTheDocument();
  });

  it('sorts tasks by different criteria', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    const sortSelect = screen.getByTestId('sort-select');
    await user.selectOptions(sortSelect, 'priority');

    // Tasks should be sorted by priority (high first)
    const taskCards = screen.getAllByTestId('task-card');
    expect(taskCards[0]).toHaveTextContent('First Task'); // High priority
    expect(taskCards[1]).toHaveTextContent('Second Task'); // Medium priority
  });

  it('handles pagination', async () => {
    // Create more tasks to test pagination
    const manyTasks = Array.from({ length: 25 }, (_, i) => ({
      ...mockTasks[0],
      id: `task-${i}`,
      task_number: `HT-${String(i + 1).padStart(3, '0')}`,
      title: `Task ${i + 1}`
    }));

    render(
      <TaskList
        tasks={manyTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
        pageSize={10}
      />
    );

    // Should show pagination controls
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument();

    // Navigate to next page
    const nextButton = screen.getByTestId('next-page-button');
    await user.click(nextButton);

    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument();
  });

  it('shows empty state when no tasks', () => {
    render(
      <TaskList
        tasks={[]}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No tasks found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <TaskList
        tasks={[]}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
        loading={true}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('handles drag and drop reordering', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
        enableDragAndDrop={true}
      />
    );

    const firstTask = screen.getByTestId('task-card-0');
    const secondTask = screen.getByTestId('task-card-1');

    // Simulate drag and drop
    fireEvent.dragStart(firstTask);
    fireEvent.dragOver(secondTask);
    fireEvent.drop(secondTask);

    // Verify reordering callback was called
    expect(mockOnBulkSelect).toHaveBeenCalled();
  });

  it('handles keyboard navigation', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    // Focus on first task
    const firstTask = screen.getByTestId('task-card-0');
    firstTask.focus();

    // Navigate with arrow keys
    await user.keyboard('{ArrowDown}');
    expect(screen.getByTestId('task-card-1')).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(screen.getByTestId('task-card-0')).toHaveFocus();
  });

  it('handles bulk status update', async () => {
    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    // Select tasks
    const checkboxes = screen.getAllByTestId('task-checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    // Change status via bulk operations
    const bulkStatusSelect = screen.getByTestId('bulk-status-select');
    await user.selectOptions(bulkStatusSelect, TaskStatus.COMPLETED);

    const bulkUpdateButton = screen.getByTestId('bulk-update-button');
    await user.click(bulkUpdateButton);

    expect(mockOnStatusChange).toHaveBeenCalledTimes(2);
  });

  it('handles bulk delete', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <TaskList
        tasks={mockTasks}
        onTaskSelect={mockOnTaskSelect}
        onTaskEdit={mockOnTaskEdit}
        onTaskDelete={mockOnTaskDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
        onBulkSelect={mockOnBulkSelect}
      />
    );

    // Select tasks
    const checkboxes = screen.getAllByTestId('task-checkbox');
    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    // Delete selected tasks
    const bulkDeleteButton = screen.getByTestId('bulk-delete-button');
    await user.click(bulkDeleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the selected tasks?');
    expect(mockOnTaskDelete).toHaveBeenCalledTimes(2);
  });
});
