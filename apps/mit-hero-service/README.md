# MIT Hero Service

A minimal HTTP service that exposes the 6 core MIT Hero APIs for future UI usage, without changing coaching app behavior.

## Overview

This service provides HTTP endpoints that wrap the core MIT Hero functions, allowing external tools and UIs to interact with the system programmatically.

## Features

- **Local-only service** running on port 3030
- **6 core API endpoints** matching the MIT Hero core functions
- **JSON validation** for all request bodies
- **Comprehensive error handling** with proper HTTP status codes
- **CORS enabled** for local development
- **Health check endpoint** for monitoring

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to the `@my-app/mit-hero-core` package

### Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

- `PORT` - Server port (default: 3030)
- `HOST` - Server host (default: localhost)

## API Endpoints

### 1. Repository Health Check

**POST** `/preflight/repo`

Validates repository health and readiness.

```bash
curl -X POST http://localhost:3030/preflight/repo \
  -H "Content-Type: application/json" \
  -d '{"repository": "my-repo", "branch": "main"}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* preflight result */ },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 2. CSV Validation

**POST** `/preflight/csv`

Checks CSV data integrity and format.

```bash
curl -X POST http://localhost:3030/preflight/csv \
  -H "Content-Type: application/json" \
  -d '{"csvPath": "/path/to/data.csv"}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* CSV validation result */ },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 3. CMS Validation

**POST** `/prepublish/cms`

Ensures CMS content is ready for publication.

```bash
curl -X POST http://localhost:3030/prepublish/cms \
  -H "Content-Type: application/json" \
  -d '{"cmsPath": "/path/to/cms/content"}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* CMS validation result */ },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4. Apply Fixes

**POST** `/apply`

Applies automated fixes to resolve detected issues.

```bash
curl -X POST http://localhost:3030/apply \
  -H "Content-Type: application/json" \
  -d '{"issues": ["issue1", "issue2"]}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* fix application result */ },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 5. Rollback Changes

**POST** `/rollback`

Rolls back recent changes to restore system stability.

```bash
curl -X POST http://localhost:3030/rollback \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "success": true,
  "data": { /* rollback result */ },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 6. Generate Report

**GET** `/report/:jobId`

Generates comprehensive system report.

```bash
curl -X GET http://localhost:3030/report/job-123
```

**Response:**
```json
{
  "success": true,
  "data": { /* system report */ },
  "jobId": "job-123",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### Health Check

**GET** `/health`

Service health status.

```bash
curl -X GET http://localhost:3030/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "mit-hero-service",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "version": "0.1.0"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `500` - Internal Server Error

## Development

### Project Structure

```
apps/mit-hero-service/
├── server.ts          # Main server file with all routes
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
└── README.md          # This file
```

### Scripts

- `npm run dev` - Start development server with ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run clean` - Clean build artifacts

### Adding New Endpoints

1. Add the route handler in `server.ts`
2. Follow the existing pattern for validation and error handling
3. Call the appropriate core function from `@my-app/mit-hero-core`
4. Return consistent response format

## Integration Notes

- **Local-only**: This service is designed to run locally and is not integrated into the main coaching app
- **Core functions**: All business logic comes from the MIT Hero core package
- **No database writes**: The service only calls core functions and doesn't modify data directly
- **Future UI**: Designed to support future UI development and external tool integration

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` environment variable
2. **Core package not found**: Ensure `@my-app/mit-hero-core` is available in the workspace
3. **TypeScript errors**: Run `npm run build` to check for compilation issues

### Logs

The service uses Fastify's built-in logging. Check the console output for detailed request/response logs and any errors.

## License

Private - Part of the my-app workspace
