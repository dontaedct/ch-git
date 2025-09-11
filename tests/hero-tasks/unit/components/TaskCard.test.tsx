/**
 * HT-004.6.1: Automated Test Suite - Unit Tests
 * TaskCard Component Tests
 * Created: 2025-09-08T18:45:00.000Z
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCard } from '@/components/hero-tasks/TaskCard';
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

describe('TaskCard Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnStatusChange = jest.fn();
  const mockOnPriorityChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders task information correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    expect(screen.getByText('HT-001')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('This is a test task description')).toBeInTheDocument();
    expect(screen.getByText('feature')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('displays correct status badge', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const statusBadge = screen.getByText('In Progress');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('displays correct priority indicator', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const priorityIndicator = screen.getByTestId('priority-indicator');
    expect(priorityIndicator).toHaveClass('bg-red-500'); // High priority
  });

  it('shows progress information', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    expect(screen.getByText('4h / 8h')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles edit button click', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('handles delete button click with confirmation', async () => {
    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(mockOnDelete).toHaveBeenCalledWith(mockTask.id);
  });

  it('handles status change', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: TaskStatus.COMPLETED } });

    expect(mockOnStatusChange).toHaveBeenCalledWith(mockTask.id, TaskStatus.COMPLETED);
  });

  it('handles priority change', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    const prioritySelect = screen.getByTestId('priority-select');
    fireEvent.change(prioritySelect, { target: { value: TaskPriority.CRITICAL } });

    expect(mockOnPriorityChange).toHaveBeenCalledWith(mockTask.id, TaskPriority.CRITICAL);
  });

  it('shows due date warning for overdue tasks', () => {
    const overdueTask = {
      ...mockTask,
      due_date: '2025-09-01T18:00:00.000Z' // Past date
    };

    render(
      <TaskCard
        task={overdueTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    expect(screen.getByTestId('overdue-warning')).toBeInTheDocument();
  });

  it('displays workflow phase correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    expect(screen.getByText('Apply')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    // Test Ctrl+E for edit
    fireEvent.keyDown(document, { key: 'e', ctrlKey: true });
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  it('renders with different task statuses', () => {
    const statuses = [
      TaskStatus.DRAFT,
      TaskStatus.READY,
      TaskStatus.IN_PROGRESS,
      TaskStatus.BLOCKED,
      TaskStatus.COMPLETED,
      TaskStatus.CANCELLED
    ];

    statuses.forEach(status => {
      const taskWithStatus = { ...mockTask, status };
      const { unmount } = render(
        <TaskCard
          task={taskWithStatus}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
          onPriorityChange={mockOnPriorityChange}
        />
      );

      expect(screen.getByText(status.replace('_', ' '))).toBeInTheDocument();
      unmount();
    });
  });

  it('handles missing optional fields gracefully', () => {
    const minimalTask = {
      ...mockTask,
      description: undefined,
      due_date: undefined,
      estimated_duration_hours: undefined,
      actual_duration_hours: undefined
    };

    render(
      <TaskCard
        task={minimalTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
        onPriorityChange={mockOnPriorityChange}
      />
    );

    expect(screen.getByText('HT-001')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });
});