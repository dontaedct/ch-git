# Hero Tasks API Reference

**RUN_DATE**: 2025-09-05T02:16:09.652Z  
**Version**: 1.0.0  
**Status**: Complete  

## Overview

The Hero Tasks API provides comprehensive endpoints for managing tasks, subtasks, actions, dependencies, attachments, and comments. All endpoints follow RESTful conventions and return JSON responses.

## Base URL

```
/api/hero-tasks
```

## Authentication

All API endpoints require authentication. Include the appropriate authentication headers in your requests.

## Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2025-09-05T02:16:09.652Z"
}
```

## Endpoints

### Tasks

#### GET /api/hero-tasks

Search and retrieve tasks.

**Query Parameters:**
- `action` (string, optional): Set to "analytics" to get analytics data
- `page` (number, optional): Page number (default: 1)
- `page_size` (number, optional): Items per page (default: 20, max: 100)
- `sort_by` (string, optional): Sort field (created_at, updated_at, due_date, priority, status)
- `sort_order` (string, optional): Sort order (asc, desc)
- `status` (string, optional): Comma-separated status values
- `priority` (string, optional): Comma-separated priority values
- `type` (string, optional): Comma-separated type values
- `assignee_id` (string, optional): Comma-separated assignee IDs
- `current_phase` (string, optional): Comma-separated phase values
- `tags` (string, optional): Comma-separated tags
- `created_after` (string, optional): ISO date string
- `created_before` (string, optional): ISO date string
- `due_after` (string, optional): ISO date string
- `due_before` (string, optional): ISO date string
- `search_text` (string, optional): Text search in title and description

**Example Request:**
```bash
GET /api/hero-tasks?status=in_progress,ready&priority=high,critical&page=1&page_size=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [...],
    "total_count": 150,
    "page": 1,
    "page_size": 20,
    "has_more": true
  },
  "timestamp": "2025-09-05T02:16:09.652Z"
}
```

#### POST /api/hero-tasks

Create a new task.

**Request Body:**
```typescript
interface CreateHeroTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  parent_task_id?: string;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

**Example Request:**
```json
{
  "title": "Implement user authentication",
  "description": "Add secure user login system with JWT tokens",
  "priority": "high",
  "type": "feature",
  "assignee_id": "user123",
  "due_date": "2025-09-15",
  "estimated_duration_hours": 8,
  "tags": ["authentication", "security", "frontend"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "task_number": "HT-001",
    "title": "Implement user authentication",
    "status": "draft",
    "current_phase": "audit",
    "created_at": "2025-09-05T02:16:09.652Z",
    ...
  },
  "message": "Task created successfully",
  "timestamp": "2025-09-05T02:16:09.652Z"
}
```

#### GET /api/hero-tasks/[taskId]

Get a specific task by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "task_number": "HT-001",
    "title": "Implement user authentication",
    "subtasks": [...],
    "dependencies": [...],
    "attachments": [...],
    "comments": [...],
    "workflow_history": [...],
    ...
  },
  "timestamp": "2025-09-05T02:16:09.652Z"
}
```

#### PUT /api/hero-tasks/[taskId]

Update a specific task.

**Request Body:**
```typescript
interface UpdateHeroTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  actual_duration_hours?: number;
  current_phase?: WorkflowPhase;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

#### DELETE /api/hero-tasks/[taskId]

Delete a specific task.

**Response:**
```json
{
  "success": true,
  "message": "Task deleted successfully",
  "timestamp": "2025-09-05T02:16:09.652Z"
}
```

### Task Status

#### PUT /api/hero-tasks/[taskId]/status

Update task status.

**Request Body:**
```json
{
  "status": "in_progress",
  "reason": "Starting implementation phase"
}
```

### Task Phase

#### PUT /api/hero-tasks/[taskId]/phase

Update task workflow phase.

**Request Body:**
```json
{
  "phase": "apply",
  "reason": "Moving to implementation phase"
}
```

### Subtasks

#### POST /api/hero-tasks/subtasks

Create a new subtask.

**Request Body:**
```typescript
interface CreateHeroSubtaskRequest {
  task_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

#### GET /api/hero-tasks/subtasks/[subtaskId]

Get a specific subtask.

#### PUT /api/hero-tasks/subtasks/[subtaskId]

Update a specific subtask.

#### DELETE /api/hero-tasks/subtasks/[subtaskId]

Delete a specific subtask.

### Actions

#### POST /api/hero-tasks/actions

Create a new action.

**Request Body:**
```typescript
interface CreateHeroActionRequest {
  subtask_id: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  type: TaskType;
  assignee_id?: string;
  due_date?: string;
  estimated_duration_hours?: number;
  tags?: string[];
  metadata?: Record<string, any>;
}
```

#### GET /api/hero-tasks/actions/[actionId]

Get a specific action.

#### PUT /api/hero-tasks/actions/[actionId]

Update a specific action.

#### DELETE /api/hero-tasks/actions/[actionId]

Delete a specific action.

## Data Types

### TaskStatus

```typescript
enum TaskStatus {
  DRAFT = 'draft',
  READY = 'ready',
  IN_PROGRESS = 'in_progress',
  BLOCKED = 'blocked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}
```

### TaskPriority

```typescript
enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}
```

### TaskType

```typescript
enum TaskType {
  FEATURE = 'feature',
  BUG_FIX = 'bug_fix',
  REFACTOR = 'refactor',
  DOCUMENTATION = 'documentation',
  TEST = 'test',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  INTEGRATION = 'integration',
  MIGRATION = 'migration',
  MAINTENANCE = 'maintenance',
  RESEARCH = 'research',
  PLANNING = 'planning',
  REVIEW = 'review',
  DEPLOYMENT = 'deployment',
  MONITORING = 'monitoring'
}
```

### WorkflowPhase

```typescript
enum WorkflowPhase {
  AUDIT = 'audit',
  DECIDE = 'decide',
  APPLY = 'apply',
  VERIFY = 'verify'
}
```

## Examples

### Creating a Complete Task Hierarchy

```typescript
// 1. Create main task
const mainTask = await fetch('/api/hero-tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Implement user authentication',
    type: 'feature',
    priority: 'high',
    description: 'Add secure user login system'
  })
});

// 2. Create subtask
const subtask = await fetch('/api/hero-tasks/subtasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task_id: mainTask.data.id,
    title: 'Design authentication schema',
    type: 'planning',
    priority: 'high'
  })
});

// 3. Create action
const action = await fetch('/api/hero-tasks/actions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subtask_id: subtask.data.id,
    title: 'Create user table migration',
    type: 'migration',
    priority: 'high'
  })
});
```

### Updating Task Status and Phase

```typescript
// Update status to in progress
await fetch('/api/hero-tasks/task-uuid/status', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'in_progress',
    reason: 'Starting implementation'
  })
});

// Update phase to apply
await fetch('/api/hero-tasks/task-uuid/phase', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phase: 'apply',
    reason: 'Moving to implementation phase'
  })
});
```

### Searching Tasks with Filters

```typescript
const searchParams = new URLSearchParams({
  status: 'in_progress,ready',
  priority: 'high,critical',
  tags: 'frontend,authentication',
  page: '1',
  page_size: '20',
  sort_by: 'due_date',
  sort_order: 'asc'
});

const response = await fetch(`/api/hero-tasks?${searchParams}`);
const data = await response.json();
```

## Rate Limiting

API requests are rate limited to prevent abuse:
- 100 requests per minute per user
- 1000 requests per hour per user
- Bulk operations may have additional limits

## Pagination

All list endpoints support pagination:

```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_count: number;
    has_more: boolean;
  };
  timestamp: string;
}
```

## Webhooks

The API supports webhooks for real-time updates:

### Available Events
- `task.created`
- `task.updated`
- `task.deleted`
- `task.status_changed`
- `task.phase_changed`
- `subtask.created`
- `subtask.updated`
- `action.created`
- `action.updated`

### Webhook Payload

```json
{
  "event": "task.status_changed",
  "data": {
    "task_id": "task-uuid",
    "task_number": "HT-001",
    "old_status": "ready",
    "new_status": "in_progress",
    "timestamp": "2025-09-05T02:16:09.652Z"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { HeroTasksClient } from '@lib/hero-tasks/client';

const client = new HeroTasksClient({
  baseUrl: '/api/hero-tasks',
  apiKey: 'your-api-key'
});

// Create task
const task = await client.tasks.create({
  title: 'Implement feature',
  type: 'feature',
  priority: 'high'
});

// Update task
await client.tasks.update(task.id, {
  status: 'in_progress'
});

// Search tasks
const results = await client.tasks.search({
  status: ['in_progress'],
  priority: ['high', 'critical']
});
```

### Python

```python
import requests

class HeroTasksClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_task(self, task_data):
        response = requests.post(
            f'{self.base_url}/hero-tasks',
            json=task_data,
            headers=self.headers
        )
        return response.json()
    
    def update_task(self, task_id, update_data):
        response = requests.put(
            f'{self.base_url}/hero-tasks/{task_id}',
            json=update_data,
            headers=self.headers
        )
        return response.json()

# Usage
client = HeroTasksClient('/api', 'your-api-key')
task = client.create_task({
    'title': 'Implement feature',
    'type': 'feature',
    'priority': 'high'
})
```

## Testing

### Test Data

Use the following test data for development and testing:

```json
{
  "title": "Test Task",
  "description": "This is a test task for development",
  "type": "feature",
  "priority": "medium",
  "tags": ["test", "development"]
}
```

### Mock Responses

For testing, you can use mock responses:

```typescript
const mockTask = {
  id: 'test-task-uuid',
  task_number: 'HT-001',
  title: 'Test Task',
  status: 'draft',
  current_phase: 'audit',
  created_at: '2025-09-05T02:16:09.652Z',
  updated_at: '2025-09-05T02:16:09.652Z'
};
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check authentication headers
   - Verify API key is valid
   - Ensure user has proper permissions

2. **400 Bad Request**
   - Validate request body format
   - Check required fields are provided
   - Verify data types are correct

3. **404 Not Found**
   - Verify task ID exists
   - Check URL path is correct
   - Ensure resource hasn't been deleted

4. **500 Internal Server Error**
   - Check server logs
   - Verify database connection
   - Contact support if issue persists

### Debug Mode

Enable debug mode for detailed error information:

```typescript
const response = await fetch('/api/hero-tasks', {
  headers: {
    'X-Debug': 'true'
  }
});
```

---

*This API reference provides comprehensive documentation for the Hero Tasks API. For additional support or feature requests, please contact the development team.*
