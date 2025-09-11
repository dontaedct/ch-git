/**
 * HT-004.6.1: Automated Test Suite - Integration Tests
 * Hero Tasks API Endpoints Tests
 * Created: 2025-09-08T18:45:00.000Z
 */

import { NextRequest } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/hero-tasks/route';
import { TaskStatus, TaskPriority, TaskType, WorkflowPhase } from '@/types/hero-tasks';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn()
    }))
  }))
}));

describe('Hero Tasks API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/hero-tasks', () => {
    it('fetches all tasks successfully', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          task_number: 'HT-001',
          title: 'Test Task 1',
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.HIGH,
          type: TaskType.FEATURE,
          current_phase: WorkflowPhase.APPLY,
          created_at: '2025-09-08T18:00:00.000Z',
          updated_at: '2025-09-08T18:00:00.000Z'
        }
      ];

      // Mock the Supabase response
      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().select().mockResolvedValue({
        data: mockTasks,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/hero-tasks');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.tasks).toEqual(mockTasks);
      expect(data.total).toBe(1);
    });

    it('handles query parameters for filtering', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks?status=in_progress&priority=high');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('handles pagination parameters', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks?page=2&limit=10');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('handles search query', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks?search=authentication');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });

    it('handles database errors', async () => {
      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().select().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const request = new NextRequest('http://localhost:3000/api/hero-tasks');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/hero-tasks', () => {
    it('creates a new task successfully', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'This is a new test task',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE,
        estimated_duration_hours: 8,
        tags: ['test', 'feature']
      };

      const mockCreatedTask = {
        id: 'task-2',
        task_number: 'HT-002',
        ...newTask,
        status: TaskStatus.DRAFT,
        current_phase: WorkflowPhase.AUDIT,
        created_at: '2025-09-08T18:00:00.000Z',
        updated_at: '2025-09-08T18:00:00.000Z'
      };

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().insert().mockResolvedValue({
        data: [mockCreatedTask],
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/hero-tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.task).toEqual(mockCreatedTask);
    });

    it('validates required fields', async () => {
      const invalidTask = {
        description: 'Missing title',
        priority: TaskPriority.HIGH
      };

      const request = new NextRequest('http://localhost:3000/api/hero-tasks', {
        method: 'POST',
        body: JSON.stringify(invalidTask),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Title is required');
    });

    it('handles database errors during creation', async () => {
      const newTask = {
        title: 'New Test Task',
        priority: TaskPriority.HIGH,
        type: TaskType.FEATURE
      };

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().insert().mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' }
      });

      const request = new NextRequest('http://localhost:3000/api/hero-tasks', {
        method: 'POST',
        body: JSON.stringify(newTask),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/hero-tasks', () => {
    it('updates a task successfully', async () => {
      const taskId = 'task-1';
      const updateData = {
        title: 'Updated Task Title',
        status: TaskStatus.COMPLETED,
        actual_duration_hours: 6
      };

      const mockUpdatedTask = {
        id: taskId,
        task_number: 'HT-001',
        ...updateData,
        updated_at: '2025-09-08T19:00:00.000Z'
      };

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().update().mockResolvedValue({
        data: [mockUpdatedTask],
        error: null
      });

      const request = new NextRequest(`http://localhost:3000/api/hero-tasks?id=${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.task).toEqual(mockUpdatedTask);
    });

    it('validates task ID parameter', async () => {
      const updateData = {
        title: 'Updated Task Title'
      };

      const request = new NextRequest('http://localhost:3000/api/hero-tasks', {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Task ID is required');
    });

    it('handles task not found', async () => {
      const taskId = 'nonexistent-task';
      const updateData = {
        title: 'Updated Task Title'
      };

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().update().mockResolvedValue({
        data: [],
        error: null
      });

      const request = new NextRequest(`http://localhost:3000/api/hero-tasks?id=${taskId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await PUT(request);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/hero-tasks', () => {
    it('deletes a task successfully', async () => {
      const taskId = 'task-1';

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().delete().mockResolvedValue({
        data: [{ id: taskId }],
        error: null
      });

      const request = new NextRequest(`http://localhost:3000/api/hero-tasks?id=${taskId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);

      expect(response.status).toBe(200);
    });

    it('validates task ID parameter for deletion', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks', {
        method: 'DELETE'
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Task ID is required');
    });

    it('handles task not found during deletion', async () => {
      const taskId = 'nonexistent-task';

      const mockSupabase = require('@/lib/supabase/client').createClient();
      mockSupabase.from().delete().mockResolvedValue({
        data: [],
        error: null
      });

      const request = new NextRequest(`http://localhost:3000/api/hero-tasks?id=${taskId}`, {
        method: 'DELETE'
      });

      const response = await DELETE(request);

      expect(response.status).toBe(404);
    });
  });

  describe('Bulk Operations API', () => {
    it('handles bulk status updates', async () => {
      const bulkUpdateData = {
        taskIds: ['task-1', 'task-2', 'task-3'],
        updates: {
          status: TaskStatus.COMPLETED,
          completed_at: '2025-09-08T19:00:00.000Z'
        }
      };

      const request = new NextRequest('http://localhost:3000/api/hero-tasks/bulk', {
        method: 'POST',
        body: JSON.stringify(bulkUpdateData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await request.json();
      expect(response.success).toBe(true);
    });

    it('validates bulk operation data', async () => {
      const invalidBulkData = {
        taskIds: [],
        updates: {}
      };

      const request = new NextRequest('http://localhost:3000/api/hero-tasks/bulk', {
        method: 'POST',
        body: JSON.stringify(invalidBulkData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await request.json();
      expect(response.success).toBe(false);
      expect(response.error).toContain('Task IDs are required');
    });
  });

  describe('Search API', () => {
    it('performs advanced search', async () => {
      const searchParams = {
        query: 'authentication',
        filters: {
          status: [TaskStatus.IN_PROGRESS],
          priority: [TaskPriority.HIGH],
          type: [TaskType.FEATURE]
        },
        sortBy: 'created_at',
        sortOrder: 'desc',
        page: 1,
        limit: 10
      };

      const request = new NextRequest('http://localhost:3000/api/hero-tasks/search', {
        method: 'POST',
        body: JSON.stringify(searchParams),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await request.json();
      expect(response.results).toBeDefined();
      expect(response.total).toBeDefined();
      expect(response.page).toBe(1);
    });
  });

  describe('Export API', () => {
    it('exports tasks as CSV', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks/export?format=csv');
      const response = await request;

      expect(response.headers.get('content-type')).toBe('text/csv');
      expect(response.headers.get('content-disposition')).toContain('attachment');
    });

    it('exports tasks as JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks/export?format=json');
      const response = await request;

      expect(response.headers.get('content-type')).toBe('application/json');
    });

    it('exports tasks as PDF', async () => {
      const request = new NextRequest('http://localhost:3000/api/hero-tasks/export?format=pdf');
      const response = await request;

      expect(response.headers.get('content-type')).toBe('application/pdf');
    });
  });
});
