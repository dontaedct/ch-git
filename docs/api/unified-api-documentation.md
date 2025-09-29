# Unified API Documentation

## Overview

This comprehensive API documentation covers all endpoints for the unified agency toolkit following HT-036 integration. The API provides access to orchestration, module management, marketplace, handover automation, and core toolkit functionality.

## Table of Contents

1. [Authentication](#authentication)
2. [Core API Endpoints](#core-api-endpoints)
3. [Orchestration API](#orchestration-api)
4. [Module Management API](#module-management-api)
5. [Marketplace API](#marketplace-api)
6. [Handover Automation API](#handover-automation-api)
7. [Client Management API](#client-management-api)
8. [Analytics API](#analytics-api)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)
11. [Webhooks](#webhooks)
12. [SDKs and Examples](#sdks-and-examples)

## Authentication

### API Key Authentication

All API requests require authentication using API keys or JWT tokens.

#### Headers
```http
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

#### Obtaining API Keys
```http
POST /api/auth/api-keys
Content-Type: application/json

{
  "name": "My API Key",
  "permissions": ["read", "write"],
  "expires_at": "2024-12-31T23:59:59Z"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "api_key_123",
    "key": "ak_live_1234567890abcdef",
    "name": "My API Key",
    "permissions": ["read", "write"],
    "created_at": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z"
  }
}
```

### JWT Token Authentication

For user sessions and frontend applications.

#### Login Endpoint
```http
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_at": "2024-01-01T01:00:00Z"
  }
}
```

## Core API Endpoints

### Health Check
Check system health and status.

```http
GET /api/health
```

#### Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "n8n": "healthy"
  },
  "version": "1.0.0"
}
```

### System Metrics
Get system performance metrics.

```http
GET /api/monitoring/metrics
```

#### Response
```json
{
  "success": true,
  "data": {
    "cpu_usage": 45.2,
    "memory_usage": 67.8,
    "active_users": 127,
    "total_requests": 45234,
    "response_time_avg": 145,
    "error_rate": 0.02
  }
}
```

### User Profile
Get current user profile information.

```http
GET /api/user/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "permissions": ["read", "write", "admin"],
    "created_at": "2023-01-01T00:00:00Z",
    "last_login": "2024-01-01T00:00:00Z"
  }
}
```

## Orchestration API

### Workflows

#### List Workflows
```http
GET /api/orchestration/workflows
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `limit` (integer): Number of workflows to return (default: 20)
- `offset` (integer): Number of workflows to skip (default: 0)
- `status` (string): Filter by workflow status (active, inactive, error)
- `search` (string): Search workflows by name or description

#### Response
```json
{
  "success": true,
  "data": {
    "workflows": [
      {
        "id": "workflow_123",
        "name": "Client Onboarding",
        "description": "Automated client onboarding process",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T12:00:00Z",
        "executions_count": 45,
        "success_rate": 0.98
      }
    ],
    "total": 10,
    "limit": 20,
    "offset": 0
  }
}
```

#### Create Workflow
```http
POST /api/orchestration/workflows
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "name": "New Workflow",
  "description": "Description of the workflow",
  "nodes": [
    {
      "id": "node_1",
      "type": "trigger",
      "parameters": {
        "triggerType": "webhook"
      }
    }
  ],
  "connections": {
    "node_1": {
      "main": [
        [
          {
            "node": "node_2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

#### Execute Workflow
```http
POST /api/orchestration/workflows/{workflow_id}/execute
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "data": {
    "input": "test data"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "execution_id": "exec_123",
    "status": "running",
    "started_at": "2024-01-01T00:00:00Z"
  }
}
```

### Executions

#### List Executions
```http
GET /api/orchestration/executions
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `workflow_id` (string): Filter by workflow ID
- `status` (string): Filter by execution status
- `limit` (integer): Number of results to return
- `offset` (integer): Number of results to skip

#### Response
```json
{
  "success": true,
  "data": {
    "executions": [
      {
        "id": "exec_123",
        "workflow_id": "workflow_123",
        "status": "success",
        "started_at": "2024-01-01T00:00:00Z",
        "finished_at": "2024-01-01T00:01:30Z",
        "duration": 90000,
        "data": {
          "output": "execution result"
        }
      }
    ],
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

#### Get Execution Details
```http
GET /api/orchestration/executions/{execution_id}
Authorization: Bearer YOUR_API_TOKEN
```

## Module Management API

### Modules

#### List Available Modules
```http
GET /api/modules/registry
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `category` (string): Filter by module category
- `search` (string): Search modules by name or description
- `installed` (boolean): Filter by installation status

#### Response
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "module_123",
        "name": "Email Marketing",
        "description": "Advanced email marketing automation",
        "version": "1.2.0",
        "category": "communication",
        "author": "Agency Toolkit",
        "installed": false,
        "rating": 4.8,
        "downloads": 1250
      }
    ],
    "total": 50,
    "categories": ["communication", "integration", "analytics"]
  }
}
```

#### Install Module
```http
POST /api/modules/{module_id}/install
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "version": "1.2.0",
  "tenant_id": "tenant_123",
  "configuration": {
    "api_key": "your_api_key"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "installation_id": "install_123",
    "status": "installing",
    "progress": 0,
    "estimated_time": 120
  }
}
```

#### List Installed Modules
```http
GET /api/modules/installed
Authorization: Bearer YOUR_API_TOKEN
```

#### Response
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "id": "module_123",
        "name": "Email Marketing",
        "version": "1.2.0",
        "status": "active",
        "installed_at": "2024-01-01T00:00:00Z",
        "configuration": {
          "api_key": "***"
        },
        "health": "healthy"
      }
    ]
  }
}
```

#### Configure Module
```http
PUT /api/modules/{module_id}/configuration
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "tenant_id": "tenant_123",
  "configuration": {
    "api_key": "new_api_key",
    "webhook_url": "https://example.com/webhook"
  }
}
```

#### Enable/Disable Module
```http
POST /api/modules/{module_id}/toggle
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "tenant_id": "tenant_123",
  "enabled": true
}
```

## Marketplace API

### Templates

#### List Templates
```http
GET /api/marketplace/templates
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `category` (string): Filter by template category
- `price_range` (string): Filter by price range (free, paid, premium)
- `rating_min` (float): Minimum rating filter
- `search` (string): Search templates

#### Response
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "template_123",
        "name": "Modern Landing Page",
        "description": "High-converting modern landing page template",
        "category": "landing-pages",
        "price": 49.99,
        "rating": 4.9,
        "downloads": 2340,
        "author": "Design Studio",
        "preview_url": "https://preview.example.com/template_123",
        "features": ["responsive", "seo-optimized", "fast-loading"]
      }
    ],
    "total": 150,
    "categories": ["landing-pages", "ecommerce", "corporate"]
  }
}
```

#### Get Template Details
```http
GET /api/marketplace/templates/{template_id}
Authorization: Bearer YOUR_API_TOKEN
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "template_123",
    "name": "Modern Landing Page",
    "description": "Detailed template description...",
    "category": "landing-pages",
    "price": 49.99,
    "rating": 4.9,
    "reviews_count": 127,
    "downloads": 2340,
    "author": {
      "id": "author_123",
      "name": "Design Studio",
      "verified": true
    },
    "features": ["responsive", "seo-optimized", "fast-loading"],
    "compatibility": ["nextjs", "react"],
    "documentation_url": "https://docs.example.com/template_123",
    "demo_url": "https://demo.example.com/template_123"
  }
}
```

#### Purchase Template
```http
POST /api/marketplace/templates/{template_id}/purchase
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "payment_method": "stripe",
  "license_type": "single_use"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "purchase_id": "purchase_123",
    "status": "completed",
    "amount": 49.99,
    "currency": "USD",
    "license": {
      "type": "single_use",
      "expires_at": null
    },
    "download_url": "https://secure.example.com/download/template_123"
  }
}
```

### Revenue Tracking

#### Get Revenue Statistics
```http
GET /api/marketplace/revenue
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `period` (string): Time period (day, week, month, year)
- `start_date` (string): Start date (ISO 8601)
- `end_date` (string): End date (ISO 8601)

#### Response
```json
{
  "success": true,
  "data": {
    "total_revenue": 12450.75,
    "commission_earned": 3735.23,
    "templates_sold": 156,
    "top_templates": [
      {
        "template_id": "template_123",
        "name": "Modern Landing Page",
        "revenue": 2495.00,
        "sales": 50
      }
    ],
    "revenue_by_period": [
      {
        "date": "2024-01-01",
        "revenue": 450.75
      }
    ]
  }
}
```

## Handover Automation API

### Handover Processes

#### List Handovers
```http
GET /api/handover/processes
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `status` (string): Filter by handover status
- `client_id` (string): Filter by client ID
- `project_id` (string): Filter by project ID

#### Response
```json
{
  "success": true,
  "data": {
    "handovers": [
      {
        "id": "handover_123",
        "project_id": "project_123",
        "client_id": "client_123",
        "status": "in_progress",
        "progress": 75,
        "created_at": "2024-01-01T00:00:00Z",
        "estimated_completion": "2024-01-03T00:00:00Z",
        "deliverables": {
          "documentation": "completed",
          "training": "in_progress",
          "videos": "pending"
        }
      }
    ],
    "total": 25
  }
}
```

#### Start Handover Process
```http
POST /api/handover/processes
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "project_id": "project_123",
  "client_id": "client_123",
  "deliverables": ["documentation", "training", "videos"],
  "custom_requirements": {
    "language": "en",
    "format": "pdf"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "handover_id": "handover_123",
    "status": "initiated",
    "estimated_completion": "2024-01-03T00:00:00Z"
  }
}
```

#### Get Handover Status
```http
GET /api/handover/processes/{handover_id}
Authorization: Bearer YOUR_API_TOKEN
```

### Documentation Generation

#### Generate Documentation
```http
POST /api/handover/documentation/generate
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "handover_id": "handover_123",
  "type": "user_manual",
  "format": "pdf",
  "customizations": {
    "branding": true,
    "language": "en"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "generation_id": "gen_123",
    "status": "generating",
    "estimated_time": 300
  }
}
```

#### Get Generated Documents
```http
GET /api/handover/documentation/{handover_id}
Authorization: Bearer YOUR_API_TOKEN
```

### Training Materials

#### Generate Training Materials
```http
POST /api/handover/training/generate
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "handover_id": "handover_123",
  "materials": ["interactive_tutorial", "video_walkthrough"],
  "target_audience": "end_users"
}
```

#### Get Training Progress
```http
GET /api/handover/training/{handover_id}/progress
Authorization: Bearer YOUR_API_TOKEN
```

## Client Management API

### Clients

#### List Clients
```http
GET /api/clients
Authorization: Bearer YOUR_API_TOKEN
```

#### Response
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_123",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "status": "active",
        "created_at": "2024-01-01T00:00:00Z",
        "projects": 3,
        "total_revenue": 15000.00
      }
    ],
    "total": 50
  }
}
```

#### Create Client
```http
POST /api/clients
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "name": "New Client Inc.",
  "email": "contact@newclient.com",
  "phone": "+1-555-123-4567",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  }
}
```

#### Get Client Details
```http
GET /api/clients/{client_id}
Authorization: Bearer YOUR_API_TOKEN
```

### Projects

#### List Projects
```http
GET /api/projects
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `client_id` (string): Filter by client ID
- `status` (string): Filter by project status

#### Create Project
```http
POST /api/projects
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Complete website redesign project",
  "client_id": "client_123",
  "template_id": "template_123",
  "budget": 5000.00,
  "deadline": "2024-03-01T00:00:00Z"
}
```

## Analytics API

### System Analytics

#### Get Usage Statistics
```http
GET /api/analytics/usage
Authorization: Bearer YOUR_API_TOKEN
```

#### Query Parameters
- `period` (string): Time period (hour, day, week, month)
- `metric` (string): Specific metric to retrieve

#### Response
```json
{
  "success": true,
  "data": {
    "active_users": 127,
    "total_workflows": 45,
    "executed_workflows": 234,
    "module_installations": 12,
    "template_downloads": 67,
    "handover_completions": 8
  }
}
```

#### Get Performance Metrics
```http
GET /api/analytics/performance
Authorization: Bearer YOUR_API_TOKEN
```

### Business Analytics

#### Get Revenue Analytics
```http
GET /api/analytics/revenue
Authorization: Bearer YOUR_API_TOKEN
```

#### Response
```json
{
  "success": true,
  "data": {
    "total_revenue": 25000.00,
    "monthly_recurring": 5000.00,
    "marketplace_revenue": 3500.00,
    "client_revenue": 16500.00,
    "growth_rate": 15.2
  }
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The request is invalid",
    "details": "Specific error details",
    "field": "email",
    "request_id": "req_123456789"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | API key or token required |
| `INVALID_TOKEN` | 401 | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Handling Best Practices

1. **Always check the `success` field** in responses
2. **Handle rate limiting** with exponential backoff
3. **Log request IDs** for debugging
4. **Implement retry logic** for transient errors
5. **Validate inputs** before sending requests

## Rate Limiting

### Rate Limit Headers

All API responses include rate limiting headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1577836800
X-RateLimit-Window: 3600
```

### Rate Limit Tiers

| Tier | Requests per Hour | Burst Limit |
|------|-------------------|-------------|
| Free | 100 | 10 |
| Basic | 1,000 | 50 |
| Pro | 10,000 | 100 |
| Enterprise | 100,000 | 500 |

### Handling Rate Limits

When rate limited, implement exponential backoff:

```javascript
async function apiRequest(url, options, retries = 3) {
  try {
    const response = await fetch(url, options);

    if (response.status === 429) {
      if (retries > 0) {
        const delay = Math.pow(2, 3 - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest(url, options, retries - 1);
      }
      throw new Error('Rate limit exceeded');
    }

    return response.json();
  } catch (error) {
    throw error;
  }
}
```

## Webhooks

### Webhook Configuration

#### Register Webhook Endpoint
```http
POST /api/webhooks/endpoints
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["workflow.completed", "handover.finished", "module.installed"],
  "secret": "webhook_secret_key"
}
```

### Webhook Events

#### Workflow Events
- `workflow.started` - Workflow execution started
- `workflow.completed` - Workflow execution completed
- `workflow.failed` - Workflow execution failed

#### Module Events
- `module.installed` - Module successfully installed
- `module.uninstalled` - Module uninstalled
- `module.configured` - Module configuration updated

#### Handover Events
- `handover.started` - Handover process initiated
- `handover.progress` - Handover progress updated
- `handover.completed` - Handover process completed

#### Marketplace Events
- `template.purchased` - Template purchased
- `template.downloaded` - Template downloaded
- `revenue.updated` - Revenue metrics updated

### Webhook Payload Format

```json
{
  "id": "event_123",
  "type": "workflow.completed",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "workflow_id": "workflow_123",
    "execution_id": "exec_123",
    "status": "success",
    "duration": 90000
  },
  "signature": "sha256=..."
}
```

### Webhook Security

Verify webhook signatures using HMAC:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(`sha256=${expectedSignature}`)
  );
}
```

## SDKs and Examples

### JavaScript/Node.js SDK

#### Installation
```bash
npm install @agency-toolkit/sdk
```

#### Usage Example
```javascript
const { AgencyToolkit } = require('@agency-toolkit/sdk');

const client = new AgencyToolkit({
  apiKey: 'your_api_key',
  baseURL: 'https://api.agency-toolkit.com'
});

// List workflows
const workflows = await client.orchestration.workflows.list();

// Execute workflow
const execution = await client.orchestration.workflows.execute('workflow_123', {
  input: 'test data'
});

// Install module
const installation = await client.modules.install('module_123', {
  configuration: {
    api_key: 'external_api_key'
  }
});
```

### Python SDK

#### Installation
```bash
pip install agency-toolkit-sdk
```

#### Usage Example
```python
from agency_toolkit import AgencyToolkit

client = AgencyToolkit(
    api_key='your_api_key',
    base_url='https://api.agency-toolkit.com'
)

# List templates
templates = client.marketplace.templates.list(category='landing-pages')

# Start handover process
handover = client.handover.start_process(
    project_id='project_123',
    deliverables=['documentation', 'training']
)
```

### cURL Examples

#### Execute Workflow
```bash
curl -X POST "https://api.agency-toolkit.com/api/orchestration/workflows/workflow_123/execute" \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: application/json" \
  -d '{"data": {"input": "test data"}}'
```

#### Install Module
```bash
curl -X POST "https://api.agency-toolkit.com/api/modules/module_123/install" \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: application/json" \
  -d '{
    "configuration": {
      "api_key": "external_api_key"
    }
  }'
```

#### Purchase Template
```bash
curl -X POST "https://api.agency-toolkit.com/api/marketplace/templates/template_123/purchase" \
  -H "Authorization: Bearer your_api_token" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_method": "stripe",
    "license_type": "single_use"
  }'
```

## API Versioning

### Current Version
The current API version is `v1`. All endpoints are prefixed with `/api/v1/` or simply `/api/`.

### Version Headers
Specify API version using headers:
```http
API-Version: 2024-01-01
```

### Deprecation Policy
- **90 days notice** for breaking changes
- **Backward compatibility** maintained for minor versions
- **Migration guides** provided for major version changes

## Support and Resources

### Documentation
- **API Reference**: https://docs.agency-toolkit.com/api
- **SDK Documentation**: https://docs.agency-toolkit.com/sdks
- **Guides and Tutorials**: https://docs.agency-toolkit.com/guides

### Support Channels
- **Developer Support**: developer-support@agency-toolkit.com
- **Community Forum**: https://community.agency-toolkit.com
- **GitHub Issues**: https://github.com/agency-toolkit/issues

### Status and Updates
- **API Status**: https://status.agency-toolkit.com
- **Changelog**: https://docs.agency-toolkit.com/changelog
- **Developer Newsletter**: Subscribe for API updates and announcements

---

This comprehensive API documentation provides everything needed to integrate with the unified agency toolkit. For additional examples, detailed guides, and SDK documentation, visit our developer portal.