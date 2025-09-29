# Complete Modular Admin API Documentation

## Overview

This document provides comprehensive API documentation for the Modular Admin Interface system. The API enables template registration, settings management, AI integration, and platform administration through a RESTful interface with GraphQL support.

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Template Management API](#template-management-api)
4. [Settings Management API](#settings-management-api)
5. [AI Integration API](#ai-integration-api)
6. [Marketplace API](#marketplace-api)
7. [Performance Monitoring API](#performance-monitoring-api)
8. [Error Handling](#error-handling)
9. [Rate Limiting](#rate-limiting)
10. [SDK Examples](#sdk-examples)

## API Overview

### Base URL

```
Production: https://api.agency-toolkit.com/admin/v1
Staging: https://api-staging.agency-toolkit.com/admin/v1
Development: https://api-dev.agency-toolkit.com/admin/v1
```

### API Versioning

The API uses URL versioning with the current version being `v1`. Future versions will be available at `/admin/v2`, `/admin/v3`, etc.

### Content Types

- **Request**: `application/json`
- **Response**: `application/json`
- **File Upload**: `multipart/form-data`

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { /* Response data */ },
  "meta": {
    "timestamp": "2025-09-20T14:24:33.000Z",
    "version": "v1",
    "requestId": "req_123456789"
  },
  "errors": null
}
```

### Error Response Format

```json
{
  "success": false,
  "data": null,
  "meta": {
    "timestamp": "2025-09-20T14:24:33.000Z",
    "version": "v1",
    "requestId": "req_123456789"
  },
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid template definition",
      "field": "settings.schema",
      "details": "Schema must contain at least one property"
    }
  ]
}
```

## Authentication

### Authentication Methods

The API supports multiple authentication methods:

1. **API Key Authentication** (Recommended for server-to-server)
2. **Bearer Token Authentication** (For user sessions)
3. **OAuth 2.0** (For third-party integrations)

### API Key Authentication

Include your API key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" \
     https://api.agency-toolkit.com/admin/v1/templates
```

### Bearer Token Authentication

Include the JWT token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer your-jwt-token" \
     https://api.agency-toolkit.com/admin/v1/templates
```

### Authentication Response

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "permissions": ["admin.read", "admin.write", "templates.manage"]
    },
    "token": "jwt-token-here",
    "expiresAt": "2025-09-21T14:24:33.000Z"
  }
}
```

## Template Management API

### Register Template

Register a new template with the admin interface system.

**Endpoint**: `POST /templates`

**Request Body**:
```json
{
  "id": "my-template",
  "name": "My Template",
  "version": "1.0.0",
  "description": "A comprehensive template for modern web applications",
  "category": "business",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "settings": {
    "schema": {
      "general": {
        "type": "object",
        "title": "General Settings",
        "properties": {
          "siteName": {
            "type": "string",
            "title": "Site Name",
            "default": "My Website",
            "validation": {
              "required": true,
              "minLength": 3,
              "maxLength": 100
            }
          }
        }
      }
    }
  },
  "dependencies": ["@agency-toolkit/core"],
  "ai": {
    "recommendations": {
      "enabled": true,
      "provider": "ht031-ai"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "status": "registered",
    "registrationId": "reg_123456789"
  }
}
```

### Get Template

Retrieve template information by ID.

**Endpoint**: `GET /templates/{templateId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "my-template",
    "name": "My Template",
    "version": "1.0.0",
    "description": "A comprehensive template for modern web applications",
    "category": "business",
    "status": "active",
    "installedAt": "2025-09-20T14:24:33.000Z",
    "settings": {
      "schema": { /* Settings schema */ },
      "current": { /* Current settings values */ }
    },
    "metrics": {
      "usage": 1250,
      "rating": 4.8,
      "lastUpdated": "2025-09-20T14:24:33.000Z"
    }
  }
}
```

### List Templates

List all registered templates with filtering and pagination.

**Endpoint**: `GET /templates`

**Query Parameters**:
- `category` (string): Filter by template category
- `status` (string): Filter by template status
- `search` (string): Search in template name and description
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sort` (string): Sort field (default: "name")
- `order` (string): Sort order ("asc" or "desc", default: "asc")

**Example**:
```bash
GET /templates?category=business&status=active&page=1&limit=10&sort=rating&order=desc
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "my-template",
        "name": "My Template",
        "version": "1.0.0",
        "category": "business",
        "status": "active",
        "rating": 4.8,
        "usage": 1250
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Update Template

Update an existing template.

**Endpoint**: `PUT /templates/{templateId}`

**Request Body**:
```json
{
  "name": "Updated Template Name",
  "description": "Updated description",
  "settings": {
    "schema": { /* Updated schema */ }
  }
}
```

### Delete Template

Remove a template from the system.

**Endpoint**: `DELETE /templates/{templateId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "status": "deleted"
  }
}
```

### Install Template

Install a template for use.

**Endpoint**: `POST /templates/{templateId}/install`

**Request Body**:
```json
{
  "options": {
    "configureDefaults": true,
    "enableFeatures": ["blog", "contact", "seo"],
    "installDependencies": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "status": "installed",
    "installationId": "inst_123456789",
    "dependencies": ["@agency-toolkit/core"]
  }
}
```

### Uninstall Template

Uninstall a template.

**Endpoint**: `POST /templates/{templateId}/uninstall`

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "status": "uninstalled"
  }
}
```

## Settings Management API

### Get Template Settings

Retrieve current settings for a template.

**Endpoint**: `GET /templates/{templateId}/settings`

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "settings": {
      "general": {
        "siteName": "My Website",
        "siteDescription": "A modern website"
      },
      "appearance": {
        "primaryColor": "#3b82f6",
        "fontFamily": "inter"
      }
    },
    "schema": { /* Settings schema */ },
    "lastModified": "2025-09-20T14:24:33.000Z"
  }
}
```

### Update Template Settings

Update settings for a template.

**Endpoint**: `PUT /templates/{templateId}/settings`

**Request Body**:
```json
{
  "settings": {
    "general": {
      "siteName": "Updated Website Name",
      "siteDescription": "Updated description"
    },
    "appearance": {
      "primaryColor": "#ef4444"
    }
  },
  "validate": true,
  "notify": true
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "settings": { /* Updated settings */ },
    "validation": {
      "isValid": true,
      "errors": []
    },
    "lastModified": "2025-09-20T14:24:33.000Z"
  }
}
```

### Validate Settings

Validate template settings against the schema.

**Endpoint**: `POST /templates/{templateId}/settings/validate`

**Request Body**:
```json
{
  "settings": {
    "general": {
      "siteName": "My Website"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "errors": [],
    "warnings": []
  }
}
```

### Reset Settings

Reset template settings to defaults.

**Endpoint**: `POST /templates/{templateId}/settings/reset`

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "settings": { /* Default settings */ },
    "resetAt": "2025-09-20T14:24:33.000Z"
  }
}
```

### Export Settings

Export template settings to a file.

**Endpoint**: `GET /templates/{templateId}/settings/export`

**Query Parameters**:
- `format` (string): Export format ("json", "yaml", "csv")

**Response**: File download with appropriate content-type header.

### Import Settings

Import settings from a file.

**Endpoint**: `POST /templates/{templateId}/settings/import`

**Request**: Multipart form data with settings file.

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "my-template",
    "importedSettings": { /* Imported settings */ },
    "validation": {
      "isValid": true,
      "errors": []
    },
    "importedAt": "2025-09-20T14:24:33.000Z"
  }
}
```

## AI Integration API

### Get AI Recommendations

Get AI-powered template recommendations.

**Endpoint**: `POST /ai/recommendations`

**Request Body**:
```json
{
  "context": {
    "userProfile": {
      "industry": "technology",
      "companySize": "small",
      "technicalLevel": "intermediate",
      "preferences": ["seo", "responsive"]
    },
    "currentSetup": {
      "installedTemplates": ["blog-template"],
      "activeFeatures": ["blog", "contact"],
      "usagePatterns": []
    },
    "requirements": {
      "primaryGoals": ["content creation"],
      "targetAudience": "developers",
      "budget": "medium",
      "timeline": "normal"
    }
  },
  "options": {
    "maxRecommendations": 5,
    "includeAlternatives": true
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "templateId": "ecommerce-template",
        "name": "E-commerce Template",
        "confidence": 0.85,
        "reasoning": "Based on your content creation needs and target audience",
        "benefits": ["SEO optimization", "Mobile responsive"],
        "estimatedImpact": {
          "productivity": 75,
          "userSatisfaction": 80,
          "businessValue": 70
        }
      }
    ],
    "alternatives": [
      {
        "templateId": "portfolio-template",
        "name": "Portfolio Template",
        "confidence": 0.72,
        "reasoning": "Alternative for content creators"
      }
    ],
    "generatedAt": "2025-09-20T14:24:33.000Z"
  }
}
```

### Generate Smart Settings

Generate AI-powered settings for a template.

**Endpoint**: `POST /ai/settings/generate`

**Request Body**:
```json
{
  "templateId": "blog-template",
  "context": {
    "industry": "technology",
    "companySize": "small",
    "useCase": "Technical blog for developers",
    "targetAudience": "developers",
    "preferences": {
      "theme": "dark",
      "layout": "sidebar"
    }
  },
  "constraints": {
    "budget": "medium",
    "technicalLevel": "intermediate",
    "timeConstraints": "normal"
  },
  "existingSettings": {
    "general": {
      "siteName": "My Blog"
    }
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "settings": {
      "general": {
        "siteName": "Tech Blog",
        "siteDescription": "A technical blog for developers",
        "theme": "dark"
      },
      "appearance": {
        "primaryColor": "#3b82f6",
        "fontFamily": "mono",
        "layout": "sidebar"
      },
      "features": {
        "enableBlog": true,
        "enableComments": true,
        "enableSearch": true
      }
    },
    "confidence": 0.92,
    "reasoning": "Based on technology industry best practices and developer preferences",
    "alternatives": [
      {
        "settings": { /* Alternative settings */ },
        "confidence": 0.78,
        "reasoning": "Alternative configuration for broader audience"
      }
    ],
    "generatedAt": "2025-09-20T14:24:33.000Z"
  }
}
```

### Optimize Template Settings

Optimize existing template settings using AI.

**Endpoint**: `POST /ai/settings/optimize`

**Request Body**:
```json
{
  "templateId": "blog-template",
  "currentSettings": {
    "general": {
      "siteName": "My Blog",
      "siteDescription": "A blog"
    },
    "appearance": {
      "primaryColor": "#000000",
      "fontFamily": "arial"
    }
  },
  "optimizationGoals": ["performance", "usability", "seo"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "optimizedSettings": {
      "general": {
        "siteName": "My Blog",
        "siteDescription": "A comprehensive blog about technology and development"
      },
      "appearance": {
        "primaryColor": "#3b82f6",
        "fontFamily": "inter"
      }
    },
    "improvements": [
      {
        "area": "appearance",
        "change": "Updated primary color for better accessibility",
        "impact": "Improved readability and user experience"
      },
      {
        "area": "general",
        "change": "Enhanced site description",
        "impact": "Better SEO and user understanding"
      }
    ],
    "confidence": 0.88,
    "estimatedImprovement": {
      "performance": 15,
      "usability": 25,
      "seo": 30
    },
    "optimizedAt": "2025-09-20T14:24:33.000Z"
  }
}
```

### Analyze Template Performance

Analyze template performance using AI.

**Endpoint**: `POST /ai/performance/analyze`

**Request Body**:
```json
{
  "templateId": "blog-template",
  "timeRange": {
    "start": "2025-09-01T00:00:00.000Z",
    "end": "2025-09-20T23:59:59.000Z"
  },
  "metrics": ["loadTime", "userSatisfaction", "errorRate"]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "blog-template",
    "performanceMetrics": {
      "loadTime": {
        "average": 1200,
        "p95": 2500,
        "p99": 4000,
        "trend": "improving"
      },
      "userSatisfaction": {
        "score": 4.2,
        "trend": "stable"
      },
      "errorRate": {
        "percentage": 0.5,
        "trend": "decreasing"
      }
    },
    "recommendations": [
      {
        "type": "performance",
        "priority": "high",
        "description": "Optimize image loading",
        "impact": "Reduce load time by 30%",
        "effort": "medium"
      }
    ],
    "analyzedAt": "2025-09-20T14:24:33.000Z"
  }
}
```

## Marketplace API

### Discover Templates

Discover templates in the marketplace.

**Endpoint**: `GET /marketplace/templates`

**Query Parameters**:
- `category` (string): Filter by category
- `featured` (boolean): Show only featured templates
- `rating` (number): Minimum rating (1-5)
- `price` (string): Price filter ("free", "premium")
- `search` (string): Search query
- `page` (number): Page number
- `limit` (number): Items per page

**Response**:
```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "id": "premium-ecommerce-template",
        "name": "Premium E-commerce Template",
        "version": "2.1.0",
        "description": "Advanced e-commerce template with AI features",
        "category": "ecommerce",
        "rating": 4.9,
        "downloads": 15420,
        "price": {
          "type": "premium",
          "amount": 99.99,
          "currency": "USD"
        },
        "features": ["ai-powered", "responsive", "seo-optimized"],
        "screenshots": [
          "https://marketplace.agency-toolkit.com/screenshots/premium-ecommerce-1.png"
        ],
        "author": {
          "name": "Template Studio",
          "verified": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "pages": 1
    }
  }
}
```

### Get Template Details

Get detailed information about a marketplace template.

**Endpoint**: `GET /marketplace/templates/{templateId}`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "premium-ecommerce-template",
    "name": "Premium E-commerce Template",
    "version": "2.1.0",
    "description": "Advanced e-commerce template with AI features",
    "category": "ecommerce",
    "rating": 4.9,
    "downloads": 15420,
    "price": {
      "type": "premium",
      "amount": 99.99,
      "currency": "USD"
    },
    "features": ["ai-powered", "responsive", "seo-optimized"],
    "requirements": {
      "minAgencyToolkitVersion": "2.0.0",
      "nodeVersion": "18.x"
    },
    "screenshots": [
      "https://marketplace.agency-toolkit.com/screenshots/premium-ecommerce-1.png"
    ],
    "documentation": [
      {
        "title": "Getting Started",
        "url": "https://marketplace.agency-toolkit.com/docs/premium-ecommerce/getting-started"
      }
    ],
    "author": {
      "name": "Template Studio",
      "verified": true,
      "website": "https://templatestudio.com"
    },
    "changelog": [
      {
        "version": "2.1.0",
        "date": "2025-09-15T00:00:00.000Z",
        "changes": ["Added AI-powered recommendations", "Improved performance"]
      }
    ]
  }
}
```

### Purchase Template

Purchase a premium template from the marketplace.

**Endpoint**: `POST /marketplace/templates/{templateId}/purchase`

**Request Body**:
```json
{
  "paymentMethod": {
    "type": "card",
    "token": "payment-token"
  },
  "billingInfo": {
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "purchaseId": "purchase_123456789",
    "templateId": "premium-ecommerce-template",
    "status": "completed",
    "downloadUrl": "https://api.agency-toolkit.com/marketplace/download/purchase_123456789",
    "expiresAt": "2025-10-20T14:24:33.000Z"
  }
}
```

### Download Template

Download a purchased template.

**Endpoint**: `GET /marketplace/download/{purchaseId}`

**Response**: File download with appropriate content-type header.

## Performance Monitoring API

### Get Performance Metrics

Get performance metrics for the admin interface.

**Endpoint**: `GET /performance/metrics`

**Query Parameters**:
- `timeRange` (string): Time range ("1h", "24h", "7d", "30d")
- `templateId` (string): Filter by template ID
- `metric` (string): Specific metric type

**Response**:
```json
{
  "success": true,
  "data": {
    "timeRange": "24h",
    "metrics": {
      "responseTime": {
        "average": 150,
        "p95": 300,
        "p99": 500
      },
      "throughput": {
        "requestsPerSecond": 1250,
        "peakRPS": 2000
      },
      "errorRate": {
        "percentage": 0.1,
        "errors": 125
      },
      "templates": {
        "total": 45,
        "active": 42,
        "installed": 38
      }
    },
    "timestamp": "2025-09-20T14:24:33.000Z"
  }
}
```

### Get Template Performance

Get performance metrics for a specific template.

**Endpoint**: `GET /templates/{templateId}/performance`

**Response**:
```json
{
  "success": true,
  "data": {
    "templateId": "blog-template",
    "metrics": {
      "loadTime": {
        "average": 800,
        "p95": 1500,
        "p99": 2500
      },
      "userSatisfaction": {
        "score": 4.5,
        "responses": 1250
      },
      "usage": {
        "activeUsers": 450,
        "pageViews": 12500,
        "sessions": 890
      },
      "errors": {
        "rate": 0.2,
        "critical": 0,
        "warnings": 5
      }
    },
    "trends": {
      "loadTime": "improving",
      "userSatisfaction": "stable",
      "usage": "increasing"
    },
    "timestamp": "2025-09-20T14:24:33.000Z"
  }
}
```

### Get System Health

Get overall system health status.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "ai": "healthy",
      "marketplace": "healthy"
    },
    "metrics": {
      "uptime": "99.9%",
      "responseTime": 120,
      "activeUsers": 1250
    },
    "timestamp": "2025-09-20T14:24:33.000Z"
  }
}
```

## Error Handling

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 502 | Bad Gateway - Upstream service error |
| 503 | Service Unavailable - Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Authentication failed |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `TEMPLATE_NOT_FOUND` | Template does not exist |
| `SETTINGS_INVALID` | Settings validation failed |
| `AI_SERVICE_ERROR` | AI service unavailable |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

### Error Examples

**Validation Error**:
```json
{
  "success": false,
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Template name is required",
      "field": "name"
    }
  ]
}
```

**Authentication Error**:
```json
{
  "success": false,
  "errors": [
    {
      "code": "AUTHENTICATION_ERROR",
      "message": "Invalid API key"
    }
  ]
}
```

**Rate Limit Error**:
```json
{
  "success": false,
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded. Try again in 60 seconds.",
      "retryAfter": 60
    }
  ]
}
```

## Rate Limiting

### Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|---------|
| Authentication | 10 requests | 1 minute |
| Template Management | 100 requests | 1 minute |
| Settings Management | 200 requests | 1 minute |
| AI Integration | 50 requests | 1 minute |
| Marketplace | 100 requests | 1 minute |
| Performance Monitoring | 300 requests | 1 minute |

### Rate Limit Headers

Response headers include rate limit information:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1632144000
```

### Rate Limit Exceeded

When rate limit is exceeded, the API returns a 429 status code:

```json
{
  "success": false,
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded. Try again in 60 seconds.",
      "retryAfter": 60
    }
  ]
}
```

## SDK Examples

### JavaScript SDK

```javascript
import { AdminAPI } from '@agency-toolkit/admin-api';

const api = new AdminAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.agency-toolkit.com/admin/v1'
});

// Register a template
const template = await api.templates.register({
  id: 'my-template',
  name: 'My Template',
  version: '1.0.0',
  description: 'A comprehensive template',
  settings: {
    schema: {
      general: {
        type: 'object',
        properties: {
          siteName: {
            type: 'string',
            default: 'My Website'
          }
        }
      }
    }
  }
});

// Get AI recommendations
const recommendations = await api.ai.getRecommendations({
  context: {
    userProfile: {
      industry: 'technology',
      companySize: 'small'
    }
  }
});

// Update template settings
await api.settings.update('my-template', {
  general: {
    siteName: 'Updated Website Name'
  }
});
```

### Python SDK

```python
from agency_toolkit_admin import AdminAPI

api = AdminAPI(
    api_key='your-api-key',
    base_url='https://api.agency-toolkit.com/admin/v1'
)

# Register a template
template = api.templates.register({
    'id': 'my-template',
    'name': 'My Template',
    'version': '1.0.0',
    'description': 'A comprehensive template',
    'settings': {
        'schema': {
            'general': {
                'type': 'object',
                'properties': {
                    'siteName': {
                        'type': 'string',
                        'default': 'My Website'
                    }
                }
            }
        }
    }
})

# Get AI recommendations
recommendations = api.ai.get_recommendations({
    'context': {
        'userProfile': {
            'industry': 'technology',
            'companySize': 'small'
        }
    }
})

# Update template settings
api.settings.update('my-template', {
    'general': {
        'siteName': 'Updated Website Name'
    }
})
```

### cURL Examples

**Register Template**:
```bash
curl -X POST https://api.agency-toolkit.com/admin/v1/templates \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-template",
    "name": "My Template",
    "version": "1.0.0",
    "description": "A comprehensive template",
    "settings": {
      "schema": {
        "general": {
          "type": "object",
          "properties": {
            "siteName": {
              "type": "string",
              "default": "My Website"
            }
          }
        }
      }
    }
  }'
```

**Get AI Recommendations**:
```bash
curl -X POST https://api.agency-toolkit.com/admin/v1/ai/recommendations \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userProfile": {
        "industry": "technology",
        "companySize": "small"
      }
    }
  }'
```

**Update Settings**:
```bash
curl -X PUT https://api.agency-toolkit.com/admin/v1/templates/my-template/settings \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "general": {
        "siteName": "Updated Website Name"
      }
    }
  }'
```

## Conclusion

This comprehensive API documentation provides all the necessary information to integrate with the Modular Admin Interface system. The API is designed to be RESTful, consistent, and easy to use, with comprehensive error handling and rate limiting.

Key features of the API:
- **RESTful Design**: Consistent HTTP methods and status codes
- **Comprehensive Authentication**: Multiple authentication methods supported
- **AI Integration**: Deep integration with HT-031 AI systems
- **Template Management**: Complete CRUD operations for templates
- **Settings Management**: Full settings lifecycle management
- **Marketplace Integration**: Template discovery and purchase
- **Performance Monitoring**: Real-time metrics and health monitoring
- **Rate Limiting**: Built-in rate limiting for API protection
- **SDK Support**: Official SDKs for popular programming languages

For additional resources and support:
- [Modular Interface Guide](./modular-interface-guide.md)
- [Template Development Guide](./template-development-guide.md)
- [AI Integration Guide](./ai-integration-guide.md)
- [Platform Architecture Documentation](./platform-architecture.md)
