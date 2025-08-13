# API v1

This directory contains versioned API endpoints for the application.

## Versioning Strategy

- **v1**: Current stable API version
- Legacy endpoints remain available at `/api/*` for backward compatibility
- New features and breaking changes should be implemented in new versions
- When deprecating old versions, maintain backward compatibility for a reasonable period

## Available Endpoints

### `/api/v1/clients`
- **GET**: Retrieve paginated list of clients for the authenticated coach
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `pageSize` (optional): Items per page (default: 20)
- **Response**: Paginated list of clients with metadata

## Migration Notes

- Old routes at `/api/*` remain functional
- Clients can gradually migrate to v1 endpoints
- No breaking changes in v1 compared to legacy endpoints
- Future versions may introduce breaking changes with proper deprecation notices

## Usage Example

```typescript
// Legacy endpoint (still works)
const response = await fetch('/api/clients?page=1&pageSize=10');

// New v1 endpoint
const response = await fetch('/api/v1/clients?page=1&pageSize=10');
```
