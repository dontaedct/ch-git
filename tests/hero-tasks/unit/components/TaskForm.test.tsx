/**
 * HT-004.6.1: Automated Test Suite - Unit Tests
 * TaskForm Component Tests
 * Created: 2025-09-08T18:45:00.000Z
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/hero-tasks/TaskForm';
import { TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

// Mock data
const mockTask = {
  id: 'test-task-1',
  task_number: 'HT-001',
  title: 'Test Task',
  description: 'This is a test task description',
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
};

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated hours/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it('populates form with existing task data', () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('This is a test task description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('8')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'New Task');
    await user.type(screen.getByLabelText(/description/i), 'New task description');
    await user.selectOptions(screen.getByLabelText(/priority/i), TaskPriority.HIGH);
    await user.selectOptions(screen.getByLabelText(/type/i), TaskType.FEATURE);

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New Task',
      description: 'New task description',
      priority: TaskPriority.HIGH,
      type: TaskType.FEATURE,
      status: TaskStatus.DRAFT,
      current_phase: WorkflowPhase.AUDIT,
      tags: [],
      estimated_duration_hours: undefined,
      due_date: undefined,
      assignee_id: undefined
    });
  });

  it('handles tag input correctly', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'tag1, tag2, tag3');
    await user.keyboard('{Enter}');

    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('tag3')).toBeInTheDocument();
  });

  it('handles cancel button click', async () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('validates estimated hours as positive number', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'Test Task');
    await user.type(screen.getByLabelText(/estimated hours/i), '-5');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(screen.getByText(/estimated hours must be positive/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates due date is in the future', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'Test Task');
    await user.type(screen.getByLabelText(/due date/i), '2020-01-01');

    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(screen.getByText(/due date must be in the future/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('shows different button text for editing vs creating', () => {
    const { rerender } = render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();

    rerender(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', async () => {
    render(
      <TaskForm
        task={undefined}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'Test Task');
    await user.type(screen.getByLabelText(/description/i), 'Test description');

    // Test Ctrl+S for save
    await user.keyboard('{Control>}s{/Control}');

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('handles form reset', async () => {
    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isEditing={true}
      />
    );

    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'Modified Title');

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const slowSubmit = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <TaskForm
        task={undefined}
        onSubmit={slowSubmit}
        onCancel={mockOnCancel}
        isEditing={false}
      />
    );

    await user.type(screen.getByLabelText(/title/i), 'Test Task');
    const submitButton = screen.getByRole('button', { name: /create task/i });
    await user.click(submitButton);

    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
