# Agency Toolkit Platform - API Documentation

## Overview

The Agency Toolkit Platform provides a comprehensive REST API that enables programmatic access to all platform features including AI-powered app generation, form building, client management, analytics, and platform administration.

## Base URL

- **Production**: `https://agency-toolkit.com/api`
- **Staging**: `https://staging.agency-toolkit.com/api`
- **Documentation**: `https://docs.agency-toolkit.com/api`

## Authentication

### API Key Authentication

```http
GET /api/v1/forms
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### OAuth 2.0 Flow

```http
# Step 1: Authorization
GET /oauth/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI&scope=read:forms write:forms

# Step 2: Token Exchange
POST /oauth/token
Content-Type: application/json

{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
```

## Rate Limiting

- **Free Tier**: 1,000 requests per hour
- **Pro Tier**: 5,000 requests per hour
- **Enterprise Tier**: 50,000 requests per hour

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1640995200
```

## API Endpoints

### 1. AI-Powered App Generation

#### Generate Application with AI

```http
POST /api/v1/ai/generate-app
```

**Request Body:**
```json
{
  "name": "Customer Portal",
  "industry": "healthcare",
  "description": "Patient management and appointment scheduling system",
  "features": [
    "user_authentication",
    "appointment_booking",
    "patient_records",
    "billing_integration"
  ],
  "complexity": "medium",
  "target_users": [
    {
      "role": "patient",
      "permissions": ["view_appointments", "book_appointments"]
    },
    {
      "role": "staff",
      "permissions": ["manage_patients", "view_all_appointments"]
    }
  ],
  "integrations": [
    {
      "type": "payment",
      "provider": "stripe"
    }
  ]
}
```

**Response:**
```json
{
  "id": "app_12345",
  "status": "generating",
  "estimated_completion": "2025-09-20T10:30:00Z",
  "ai_suggestions": {
    "template_id": "healthcare_portal_v2",
    "confidence": 0.95,
    "additional_features": [
      "sms_notifications",
      "insurance_verification"
    ],
    "estimated_development_time": "4-6 hours"
  },
  "generation_id": "gen_abcdef123"
}
```

#### Check Generation Status

```http
GET /api/v1/ai/generation/{generation_id}
```

**Response:**
```json
{
  "id": "gen_abcdef123",
  "status": "completed",
  "progress": 100,
  "app_id": "app_12345",
  "generated_files": [
    "pages/dashboard.tsx",
    "components/AppointmentBooking.tsx",
    "api/appointments.ts",
    "lib/auth.ts"
  ],
  "deployment_url": "https://customer-portal.agency-toolkit.app",
  "completion_time": "2025-09-20T10:25:00Z"
}
```

#### Get AI Recommendations

```http
GET /api/v1/ai/recommendations?industry=healthcare&features=appointments,billing
```

**Response:**
```json
{
  "templates": [
    {
      "id": "healthcare_portal_v2",
      "name": "Healthcare Patient Portal",
      "confidence": 0.95,
      "features": ["appointments", "billing", "records"],
      "estimated_setup_time": "2 hours"
    }
  ],
  "suggested_features": [
    {
      "name": "SMS Notifications",
      "relevance": 0.89,
      "implementation_effort": "low"
    }
  ],
  "best_practices": [
    "Implement HIPAA compliance features",
    "Add two-factor authentication",
    "Include audit logging"
  ]
}
```

### 2. Form Builder API

#### Create Form

```http
POST /api/v1/forms
```

**Request Body:**
```json
{
  "name": "Patient Intake Form",
  "description": "Comprehensive patient information collection",
  "fields": [
    {
      "type": "text",
      "name": "firstName",
      "label": "First Name",
      "required": true,
      "validation": {
        "minLength": 2,
        "maxLength": 50
      }
    },
    {
      "type": "email",
      "name": "email",
      "label": "Email Address",
      "required": true
    },
    {
      "type": "select",
      "name": "insuranceProvider",
      "label": "Insurance Provider",
      "options": [
        {"value": "aetna", "label": "Aetna"},
        {"value": "blue_cross", "label": "Blue Cross Blue Shield"},
        {"value": "humana", "label": "Humana"}
      ],
      "required": false
    },
    {
      "type": "textarea",
      "name": "symptoms",
      "label": "Current Symptoms",
      "placeholder": "Please describe your current symptoms",
      "validation": {
        "maxLength": 500
      }
    }
  ],
  "settings": {
    "allow_multiple_submissions": false,
    "save_progress": true,
    "send_confirmation_email": true,
    "redirect_url": "/thank-you"
  },
  "conditional_logic": [
    {
      "field": "insuranceProvider",
      "condition": "not_empty",
      "actions": [
        {
          "type": "show",
          "target": "insuranceNumber"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "id": "form_67890",
  "name": "Patient Intake Form",
  "status": "active",
  "url": "https://forms.agency-toolkit.com/form_67890",
  "embed_code": "<iframe src=\"https://forms.agency-toolkit.com/embed/form_67890\" width=\"100%\" height=\"600\"></iframe>",
  "created_at": "2025-09-20T09:00:00Z",
  "updated_at": "2025-09-20T09:00:00Z"
}
```

#### Get Form Submissions

```http
GET /api/v1/forms/{form_id}/submissions?page=1&limit=50&status=completed
```

**Response:**
```json
{
  "submissions": [
    {
      "id": "sub_abc123",
      "form_id": "form_67890",
      "status": "completed",
      "data": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@email.com",
        "insuranceProvider": "aetna",
        "symptoms": "Mild headache and fatigue"
      },
      "submitted_at": "2025-09-20T10:15:00Z",
      "ip_address": "192.168.1.100",
      "user_agent": "Mozilla/5.0..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "pages": 3
  }
}
```

#### Export Form Data

```http
GET /api/v1/forms/{form_id}/export?format=csv&date_from=2025-09-01&date_to=2025-09-20
```

**Response:**
```csv
id,firstName,lastName,email,insuranceProvider,symptoms,submitted_at
sub_abc123,John,Doe,john.doe@email.com,aetna,Mild headache and fatigue,2025-09-20T10:15:00Z
sub_def456,Jane,Smith,jane.smith@email.com,blue_cross,Regular checkup,2025-09-20T11:30:00Z
```

### 3. Template Management

#### List Templates

```http
GET /api/v1/templates?category=healthcare&featured=true
```

**Response:**
```json
{
  "templates": [
    {
      "id": "template_health_001",
      "name": "Healthcare Patient Portal",
      "description": "Complete patient management system with appointments and billing",
      "category": "healthcare",
      "featured": true,
      "preview_url": "https://previews.agency-toolkit.com/template_health_001",
      "features": [
        "patient_registration",
        "appointment_booking",
        "medical_records",
        "billing_integration"
      ],
      "complexity": "medium",
      "estimated_setup_time": "2-4 hours",
      "pricing": {
        "free": false,
        "pro": true,
        "enterprise": true
      }
    }
  ]
}
```

#### Get Template Details

```http
GET /api/v1/templates/{template_id}
```

**Response:**
```json
{
  "id": "template_health_001",
  "name": "Healthcare Patient Portal",
  "description": "Complete patient management system",
  "category": "healthcare",
  "screenshots": [
    "https://cdn.agency-toolkit.com/screenshots/template_health_001_1.png",
    "https://cdn.agency-toolkit.com/screenshots/template_health_001_2.png"
  ],
  "features": {
    "authentication": {
      "type": "email_password",
      "mfa_support": true
    },
    "database": {
      "tables": ["users", "appointments", "patients", "billing"],
      "relationships": ["user_appointments", "patient_billing"]
    },
    "integrations": {
      "payment": ["stripe", "paypal"],
      "calendar": ["google_calendar", "outlook"],
      "sms": ["twilio", "messagebird"]
    }
  },
  "configuration": {
    "required": [
      {
        "key": "stripe_api_key",
        "type": "string",
        "description": "Stripe API key for payment processing"
      }
    ],
    "optional": [
      {
        "key": "google_calendar_integration",
        "type": "boolean",
        "default": false
      }
    ]
  }
}
```

#### Deploy Template

```http
POST /api/v1/templates/{template_id}/deploy
```

**Request Body:**
```json
{
  "app_name": "My Healthcare Portal",
  "subdomain": "my-healthcare-portal",
  "configuration": {
    "stripe_api_key": "sk_test_...",
    "google_calendar_integration": true,
    "primary_color": "#007bff",
    "logo_url": "https://mysite.com/logo.png"
  },
  "features": {
    "sms_notifications": true,
    "online_payments": true,
    "insurance_verification": false
  }
}
```

**Response:**
```json
{
  "deployment_id": "deploy_xyz789",
  "app_id": "app_54321",
  "status": "deploying",
  "estimated_completion": "2025-09-20T11:00:00Z",
  "preview_url": "https://my-healthcare-portal.agency-toolkit.app"
}
```

### 4. Client Management

#### Create Client

```http
POST /api/v1/clients
```

**Request Body:**
```json
{
  "name": "Healthcare Solutions Inc",
  "email": "admin@healthcaresolutions.com",
  "plan": "enterprise",
  "settings": {
    "custom_domain": "portal.healthcaresolutions.com",
    "branding": {
      "primary_color": "#1e40af",
      "secondary_color": "#64748b",
      "logo_url": "https://healthcaresolutions.com/logo.png"
    },
    "features": {
      "white_label": true,
      "api_access": true,
      "custom_integrations": true
    }
  },
  "billing": {
    "contact_email": "billing@healthcaresolutions.com",
    "payment_method": "invoice",
    "billing_cycle": "annual"
  }
}
```

**Response:**
```json
{
  "id": "client_789012",
  "name": "Healthcare Solutions Inc",
  "status": "active",
  "plan": "enterprise",
  "subdomain": "healthcaresolutions",
  "api_keys": [
    {
      "key_id": "key_abc123",
      "name": "Production API Key",
      "permissions": ["read:all", "write:all"],
      "created_at": "2025-09-20T09:00:00Z"
    }
  ],
  "created_at": "2025-09-20T09:00:00Z"
}
```

#### Get Client Analytics

```http
GET /api/v1/clients/{client_id}/analytics?period=30d&metrics=users,apps,forms
```

**Response:**
```json
{
  "period": "30d",
  "client_id": "client_789012",
  "metrics": {
    "users": {
      "total": 150,
      "active": 89,
      "new": 12,
      "growth": "+8.5%"
    },
    "apps": {
      "total": 8,
      "active": 6,
      "deployments": 24,
      "avg_uptime": "99.2%"
    },
    "forms": {
      "total": 45,
      "submissions": 1250,
      "completion_rate": "78.5%"
    }
  },
  "trends": {
    "daily_active_users": [
      {"date": "2025-09-01", "value": 85},
      {"date": "2025-09-02", "value": 92},
      {"date": "2025-09-03", "value": 88}
    ]
  }
}
```

### 5. Platform Analytics

#### System Health

```http
GET /api/v1/platform/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-20T10:30:00Z",
  "services": {
    "api": {
      "status": "healthy",
      "response_time": "45ms",
      "uptime": "99.9%"
    },
    "database": {
      "status": "healthy",
      "connections": 45,
      "query_time": "12ms"
    },
    "cache": {
      "status": "healthy",
      "hit_rate": "89.5%",
      "memory_usage": "72%"
    },
    "ai_service": {
      "status": "healthy",
      "queue_length": 3,
      "avg_processing_time": "28s"
    }
  }
}
```

#### Performance Metrics

```http
GET /api/v1/platform/metrics?timeframe=1h&granularity=5m
```

**Response:**
```json
{
  "timeframe": "1h",
  "granularity": "5m",
  "metrics": {
    "requests": {
      "total": 15420,
      "per_minute": 257,
      "error_rate": "0.3%"
    },
    "response_times": {
      "p50": "120ms",
      "p95": "450ms",
      "p99": "890ms"
    },
    "ai_generations": {
      "completed": 24,
      "in_progress": 3,
      "avg_time": "28.5s"
    },
    "data_points": [
      {
        "timestamp": "2025-09-20T10:00:00Z",
        "requests": 245,
        "avg_response_time": 125,
        "error_rate": 0.2
      }
    ]
  }
}
```

### 6. Webhook Management

#### Create Webhook

```http
POST /api/v1/webhooks
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhooks/agency-toolkit",
  "events": [
    "form.submitted",
    "app.deployed",
    "user.registered"
  ],
  "secret": "your_webhook_secret",
  "active": true,
  "description": "Main application webhook"
}
```

**Response:**
```json
{
  "id": "webhook_456789",
  "url": "https://your-app.com/webhooks/agency-toolkit",
  "events": ["form.submitted", "app.deployed", "user.registered"],
  "active": true,
  "created_at": "2025-09-20T09:00:00Z",
  "last_delivery": null
}
```

#### Webhook Event Payload Example

```json
{
  "id": "event_123456",
  "type": "form.submitted",
  "created": "2025-09-20T10:15:00Z",
  "data": {
    "form_id": "form_67890",
    "submission_id": "sub_abc123",
    "client_id": "client_789012",
    "user_id": "user_345678",
    "submission_data": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@email.com"
    }
  }
}
```

### 7. File Management

#### Upload File

```http
POST /api/v1/files/upload
Content-Type: multipart/form-data
```

**Request:**
```
file: (binary data)
purpose: "logo"
client_id: "client_789012"
```

**Response:**
```json
{
  "id": "file_abc123",
  "filename": "logo.png",
  "url": "https://cdn.agency-toolkit.com/files/file_abc123.png",
  "size": 15420,
  "mime_type": "image/png",
  "purpose": "logo",
  "uploaded_at": "2025-09-20T10:30:00Z"
}
```

#### Get File Information

```http
GET /api/v1/files/{file_id}
```

**Response:**
```json
{
  "id": "file_abc123",
  "filename": "logo.png",
  "url": "https://cdn.agency-toolkit.com/files/file_abc123.png",
  "size": 15420,
  "mime_type": "image/png",
  "purpose": "logo",
  "client_id": "client_789012",
  "uploaded_by": "user_345678",
  "uploaded_at": "2025-09-20T10:30:00Z"
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "type": "validation_error",
    "message": "The request contains invalid parameters",
    "details": [
      {
        "field": "email",
        "code": "invalid_format",
        "message": "Email address is not valid"
      }
    ],
    "request_id": "req_123456789",
    "timestamp": "2025-09-20T10:30:00Z"
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service temporarily unavailable |

### Error Types

- `authentication_error`: Authentication failed
- `authorization_error`: Insufficient permissions
- `validation_error`: Request validation failed
- `rate_limit_error`: Rate limit exceeded
- `resource_not_found`: Requested resource not found
- `conflict_error`: Resource conflict
- `internal_error`: Internal server error
- `service_unavailable`: Service temporarily unavailable

## SDKs and Libraries

### JavaScript/Node.js SDK

```bash
npm install @agency-toolkit/sdk
```

```javascript
const AgencyToolkit = require('@agency-toolkit/sdk');

const client = new AgencyToolkit({
  apiKey: 'your_api_key',
  environment: 'production' // or 'staging'
});

// Generate an app with AI
const app = await client.ai.generateApp({
  name: 'Customer Portal',
  industry: 'healthcare',
  features: ['authentication', 'appointments']
});

// Create a form
const form = await client.forms.create({
  name: 'Contact Form',
  fields: [
    { type: 'text', name: 'name', label: 'Name', required: true },
    { type: 'email', name: 'email', label: 'Email', required: true }
  ]
});
```

### Python SDK

```bash
pip install agency-toolkit-sdk
```

```python
from agency_toolkit import AgencyToolkit

client = AgencyToolkit(
    api_key='your_api_key',
    environment='production'
)

# Generate an app with AI
app = client.ai.generate_app(
    name='Customer Portal',
    industry='healthcare',
    features=['authentication', 'appointments']
)

# Get form submissions
submissions = client.forms.get_submissions(
    form_id='form_12345',
    limit=100
)
```

### PHP SDK

```bash
composer require agency-toolkit/sdk
```

```php
<?php
use AgencyToolkit\Client;

$client = new Client([
    'api_key' => 'your_api_key',
    'environment' => 'production'
]);

// Create a form
$form = $client->forms()->create([
    'name' => 'Contact Form',
    'fields' => [
        ['type' => 'text', 'name' => 'name', 'label' => 'Name', 'required' => true],
        ['type' => 'email', 'name' => 'email', 'label' => 'Email', 'required' => true]
    ]
]);
```

## Postman Collection

Import our comprehensive Postman collection for easy API testing:

```
https://api.agency-toolkit.com/postman/collection.json
```

## GraphQL API

For advanced queries, use our GraphQL endpoint:

```http
POST /api/graphql
Content-Type: application/json
```

**Example Query:**
```graphql
query GetClientApps($clientId: ID!, $limit: Int) {
  client(id: $clientId) {
    id
    name
    apps(limit: $limit) {
      id
      name
      status
      deployments {
        id
        environment
        status
        deployedAt
      }
    }
  }
}
```

## Changelog

### Version 2.1.0 (2025-09-20)
- Added AI-powered app generation endpoints
- Enhanced form builder with conditional logic
- Added comprehensive analytics APIs
- Improved error handling and responses

### Version 2.0.0 (2025-08-15)
- Major API restructure with v2 endpoints
- Added GraphQL support
- Enhanced authentication with OAuth 2.0
- Added webhook management

### Version 1.5.0 (2025-07-01)
- Added template deployment API
- Enhanced client management
- Added file upload capabilities
- Improved rate limiting

## Support and Contact

- **API Support**: api-support@agency-toolkit.com
- **Documentation**: https://docs.agency-toolkit.com/api
- **Status Page**: https://status.agency-toolkit.com
- **Community Forum**: https://community.agency-toolkit.com

---

*API Documentation Version 2.1.0*
*Last Updated: September 20, 2025*