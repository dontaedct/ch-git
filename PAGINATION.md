# Pagination Support

This application now supports pagination for all list endpoints with the following features:

## Query Parameters

- `?page=1` - Page number (1-indexed, defaults to 1)
- `?pageSize=20` - Items per page (defaults to 20, max 100)

## Response Format

All paginated endpoints return the following structure:

```json
{
  "data": [...],           // Array of items for current page
  "page": 1,              // Current page number
  "pageSize": 20,         // Items per page
  "total": 100            // Total number of items across all pages
}
```

## Available Endpoints

### 1. Sessions
- **GET** `/api/sessions?page=1&pageSize=20`
- Returns paginated list of sessions for the authenticated coach
- Ordered by start date (newest first)

### 2. Weekly Plans
- **GET** `/api/weekly-plans?page=1&pageSize=20`
- Returns paginated list of weekly plans for the authenticated coach
- Ordered by week start date (newest first)

### 3. Clients
- **GET** `/api/clients?page=1&pageSize=20`
- Returns paginated list of clients for the authenticated coach
- Ordered by first name (alphabetical)

## Server Actions

The following server actions also support pagination:

```typescript
// In app/weekly-plans/actions.ts
export async function getWeeklyPlans(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<WeeklyPlan>>>

// In app/sessions/actions.ts
export async function getSessions(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<Session>>>

// In app/weekly-plans/actions.ts
export async function getClients(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<Client>>>
```

## Validation & Constraints

- **Page**: Must be ≥ 1, defaults to 1
- **Page Size**: Must be between 1-100, defaults to 20
- Invalid values are automatically clamped to valid ranges
- All parameters are validated using Zod schemas

## Example Usage

### Frontend Component
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [pageSize, setPageSize] = useState(20);

const loadSessions = async () => {
  const response = await fetch(`/api/sessions?page=${currentPage}&pageSize=${pageSize}`);
  const result = await response.json();
  
  if (result.ok) {
    const { data, total, page, pageSize } = result.data;
    // Use data, total for pagination UI
    // page and pageSize for current state
  }
};
```

### Server Action
```typescript
const result = await getSessions(2, 10); // Page 2, 10 items per page
if (result.ok) {
  const { data, total, page, pageSize } = result.data;
  // Process paginated data
}
```

## Implementation Details

- Uses Supabase's `.range()` method for efficient pagination
- Counts total records separately for accurate pagination info
- All endpoints are protected by authentication
- Includes proper error handling and validation
- Supports revalidation for production caching

## Migration Notes

Existing code using the old non-paginated functions will continue to work with default pagination (page 1, pageSize 20). To get all data, you may need to implement pagination logic in your frontend components.
