# API Logging

This project includes development-only logging for all API routes (`/api/*`).

## Features

- **Method + Path + Status**: Logs HTTP method, request path, and response status code
- **Response Time**: Measures and logs how long each API request takes
- **Development Only**: No logging in production environments
- **Color Coded**: Status codes are color-coded for easy reading:
  - 🟢 Green: 2xx (Success)
  - 🟡 Yellow: 3xx (Redirect)
  - 🔴 Red: 4xx/5xx (Error)

## How It Works

### 1. Middleware Logging (Automatic)

The middleware automatically logs all incoming API requests with method and path:

```
[API] GET /api/clients
[API] POST /api/sessions
[API] PUT /api/clients/123
```

### 2. Response Logging (Manual)

For complete logging including status codes and response times, add logging to your API route handlers:

```typescript
import { createRouteLogger } from "@/lib/logger";

async function GETHandler(req: NextRequest) {
  const startTime = Date.now();
  const logger = createRouteLogger('GET', '/api/clients');
  
  try {
    // ... your API logic ...
    
    const response = NextResponse.json(data);
    logger.log(200, startTime); // Logs: [API] GET /api/clients - 200 (45ms)
    return response;
  } catch (error) {
    logger.log(500, startTime); // Logs: [API] GET /api/clients - 500 (12ms)
    throw error;
  }
}
```

## Usage Examples

### Simple Logging

```typescript
import { logApiResponse } from "@/lib/logger";

async function handler(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ... your logic ...
    logApiResponse('GET', '/api/example', 200, startTime);
    return NextResponse.json(data);
  } catch (error) {
    logApiResponse('GET', '/api/example', 500, startTime);
    throw error;
  }
}
```

### Route-Specific Logger

```typescript
import { createRouteLogger } from "@/lib/logger";

async function handler(req: NextRequest) {
  const startTime = Date.now();
  const logger = createRouteLogger('POST', '/api/users');
  
  try {
    // ... your logic ...
    logger.log(201, startTime);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.log(400, startTime);
    throw error;
  }
}
```

## Output Examples

```
[API] GET /api/clients
[API] GET /api/clients - 200 (45ms)
[API] POST /api/sessions - 201 (123ms)
[API] PUT /api/clients/123 - 400 (67ms)
[API] DELETE /api/sessions/456 - 500 (89ms)
```

## Environment

- **Development**: Full logging enabled
- **Production**: No logging (silent)
- **Test**: No logging (silent)

## Files

- `middleware.ts` - Automatic request logging
- `lib/logger.ts` - Logging utilities
- `API_LOGGING.md` - This documentation

## Notes

- Middleware logs are automatic for all `/api/*` routes
- Response logging requires manual integration in each route handler
- Logging includes timing information for performance monitoring
- Status codes are automatically color-coded in the console
- No performance impact in production environments
