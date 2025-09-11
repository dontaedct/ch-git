/**
 * HT-004.6.1: Automated Test Suite - Unit Tests
 * Hero Tasks Utilities Tests
 * Created: 2025-09-08T18:45:00.000Z
 */

import {
  generateTaskNumber,
  parseTaskNumber,
  isValidTaskNumber,
  calculateTaskProgress,
  formatDuration,
  getTaskStatusColor,
  getPriorityColor,
  sortTasksByPriority,
  filterTasksByStatus,
  searchTasks,
  validateTaskData,
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase
} from '@/types/hero-tasks';

describe('Hero Tasks Utilities', () => {
  describe('Task Number Generation', () => {
    it('generates correct task number format', () => {
      const taskNumber = generateTaskNumber(1);
      expect(taskNumber).toBe('HT-001');
    });

    it('pads single digits with zeros', () => {
      expect(generateTaskNumber(5)).toBe('HT-005');
      expect(generateTaskNumber(15)).toBe('HT-015');
      expect(generateTaskNumber(150)).toBe('HT-150');
    });

    it('handles edge cases', () => {
      expect(generateTaskNumber(0)).toBe('HT-000');
      expect(generateTaskNumber(999)).toBe('HT-999');
    });
  });

  describe('Task Number Parsing', () => {
    it('parses valid task numbers correctly', () => {
      expect(parseTaskNumber('HT-001')).toEqual({ main: 1, sub: undefined, action: undefined });
      expect(parseTaskNumber('HT-001.1')).toEqual({ main: 1, sub: 1, action: undefined });
      expect(parseTaskNumber('HT-001.1.1')).toEqual({ main: 1, sub: 1, action: 1 });
    });

    it('handles invalid task numbers', () => {
      expect(parseTaskNumber('INVALID')).toBeNull();
      expect(parseTaskNumber('HT-001.1.1.1')).toBeNull();
      expect(parseTaskNumber('ht-001')).toBeNull();
    });
  });

  describe('Task Number Validation', () => {
    it('validates correct task number formats', () => {
      expect(isValidTaskNumber('HT-001')).toBe(true);
      expect(isValidTaskNumber('HT-001.1')).toBe(true);
      expect(isValidTaskNumber('HT-001.1.1')).toBe(true);
      expect(isValidTaskNumber('HT-999.99.99')).toBe(true);
    });

    it('rejects invalid task number formats', () => {
      expect(isValidTaskNumber('HT-0001')).toBe(false);
      expect(isValidTaskNumber('HT-1')).toBe(false);
      expect(isValidTaskNumber('ht-001')).toBe(false);
      expect(isValidTaskNumber('HT-001.1.1.1')).toBe(false);
      expect(isValidTaskNumber('INVALID')).toBe(false);
    });
  });

  describe('Task Progress Calculation', () => {
    it('calculates progress correctly', () => {
      expect(calculateTaskProgress(4, 8)).toBe(50);
      expect(calculateTaskProgress(0, 8)).toBe(0);
      expect(calculateTaskProgress(8, 8)).toBe(100);
      expect(calculateTaskProgress(10, 8)).toBe(100); // Over 100%
    });

    it('handles edge cases', () => {
      expect(calculateTaskProgress(0, 0)).toBe(0);
      expect(calculateTaskProgress(undefined, 8)).toBe(0);
      expect(calculateTaskProgress(4, undefined)).toBe(0);
    });
  });

  describe('Duration Formatting', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(1440)).toBe('24h');
    });

    it('handles edge cases', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(undefined)).toBe('0m');
      expect(formatDuration(-30)).toBe('0m');
    });
  });

  describe('Status Colors', () => {
    it('returns correct colors for task statuses', () => {
      expect(getTaskStatusColor(TaskStatus.DRAFT)).toBe('gray');
      expect(getTaskStatusColor(TaskStatus.READY)).toBe('blue');
      expect(getTaskStatusColor(TaskStatus.IN_PROGRESS)).toBe('yellow');
      expect(getTaskStatusColor(TaskStatus.BLOCKED)).toBe('red');
      expect(getTaskStatusColor(TaskStatus.COMPLETED)).toBe('green');
      expect(getTaskStatusColor(TaskStatus.CANCELLED)).toBe('gray');
    });
  });

  describe('Priority Colors', () => {
    it('returns correct colors for task priorities', () => {
      expect(getPriorityColor(TaskPriority.CRITICAL)).toBe('red');
      expect(getPriorityColor(TaskPriority.HIGH)).toBe('orange');
      expect(getPriorityColor(TaskPriority.MEDIUM)).toBe('yellow');
      expect(getPriorityColor(TaskPriority.LOW)).toBe('green');
    });
  });

  describe('Task Sorting', () => {
    const mockTasks = [
      { id: '1', priority: TaskPriority.LOW, title: 'Low Priority Task' },
      { id: '2', priority: TaskPriority.HIGH, title: 'High Priority Task' },
      { id: '3', priority: TaskPriority.CRITICAL, title: 'Critical Task' },
      { id: '4', priority: TaskPriority.MEDIUM, title: 'Medium Priority Task' }
    ];

    it('sorts tasks by priority correctly', () => {
      const sorted = sortTasksByPriority(mockTasks);
      expect(sorted[0].priority).toBe(TaskPriority.CRITICAL);
      expect(sorted[1].priority).toBe(TaskPriority.HIGH);
      expect(sorted[2].priority).toBe(TaskPriority.MEDIUM);
      expect(sorted[3].priority).toBe(TaskPriority.LOW);
    });
  });

  describe('Task Filtering', () => {
    const mockTasks = [
      { id: '1', status: TaskStatus.IN_PROGRESS, title: 'In Progress Task' },
      { id: '2', status: TaskStatus.COMPLETED, title: 'Completed Task' },
      { id: '3', status: TaskStatus.DRAFT, title: 'Draft Task' },
      { id: '4', status: TaskStatus.IN_PROGRESS, title: 'Another In Progress Task' }
    ];

    it('filters tasks by status correctly', () => {
      const inProgressTasks = filterTasksByStatus(mockTasks, TaskStatus.IN_PROGRESS);
      expect(inProgressTasks).toHaveLength(2);
      expect(inProgressTasks.every(task => task.status === TaskStatus.IN_PROGRESS)).toBe(true);

      const completedTasks = filterTasksByStatus(mockTasks, TaskStatus.COMPLETED);
      expect(completedTasks).toHaveLength(1);
      expect(completedTasks[0].status).toBe(TaskStatus.COMPLETED);
    });

    it('filters tasks by multiple statuses', () => {
      const activeTasks = filterTasksByStatus(mockTasks, [TaskStatus.IN_PROGRESS, TaskStatus.DRAFT]);
      expect(activeTasks).toHaveLength(3);
    });
  });

  describe('Task Search', () => {
    const mockTasks = [
      { id: '1', title: 'Implement user authentication', description: 'Add login functionality', tags: ['auth', 'security'] },
      { id: '2', title: 'Fix navigation bug', description: 'Navigation menu not working', tags: ['bug', 'ui'] },
      { id: '3', title: 'Add user dashboard', description: 'Create dashboard for users', tags: ['feature', 'ui'] }
    ];

    it('searches tasks by title', () => {
      const results = searchTasks(mockTasks, 'authentication');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('authentication');
    });

    it('searches tasks by description', () => {
      const results = searchTasks(mockTasks, 'navigation');
      expect(results).toHaveLength(1);
      expect(results[0].description).toContain('navigation');
    });

    it('searches tasks by tags', () => {
      const results = searchTasks(mockTasks, 'ui');
      expect(results).toHaveLength(2);
    });

    it('performs case-insensitive search', () => {
      const results = searchTasks(mockTasks, 'AUTHENTICATION');
      expect(results).toHaveLength(1);
    });

    it('returns empty array for no matches', () => {
      const results = searchTasks(mockTasks, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('Task Data Validation', () => {
    it('validates correct task data', () => {
      const validTask = {
        title: 'Test Task',
        description: 'Test description',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE,
        status: TaskStatus.DRAFT,
        current_phase: WorkflowPhase.AUDIT,
        tags: ['test'],
        estimated_duration_hours: 8
      };

      const result = validateTaskData(validTask);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates required fields', () => {
      const invalidTask = {
        title: '',
        description: 'Test description',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE,
        status: TaskStatus.DRAFT,
        current_phase: WorkflowPhase.AUDIT,
        tags: []
      };

      const result = validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('validates estimated hours', () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE,
        status: TaskStatus.DRAFT,
        current_phase: WorkflowPhase.AUDIT,
        tags: [],
        estimated_duration_hours: -5
      };

      const result = validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Estimated duration must be positive');
    });

    it('validates due date', () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'Test description',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE,
        status: TaskStatus.DRAFT,
        current_phase: WorkflowPhase.AUDIT,
        tags: [],
        due_date: '2020-01-01'
      };

      const result = validateTaskData(invalidTask);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Due date must be in the future');
    });
  });
});
