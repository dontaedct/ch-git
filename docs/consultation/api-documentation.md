# Consultation Micro-App API Documentation
## HT-030.4.4: Documentation & Client Handover Package

### Overview

The Consultation Micro-App provides a comprehensive REST API for managing AI-powered consultation workflows, questionnaire generation, and automated document delivery. This documentation covers all available endpoints, request/response formats, authentication, and integration patterns.

---

## API Base URL

```
Production: https://your-domain.com/api
Staging: https://staging.your-domain.com/api
Development: http://localhost:3000/api
```

---

## Authentication

### API Key Authentication
All API requests require authentication using API keys passed in headers.

```http
Authorization: Bearer your-api-key-here
X-API-Key: your-api-key-here
```

### Admin Token Authentication
Administrative endpoints require elevated permissions.

```http
Authorization: Bearer admin-token-here
X-Admin-Token: admin-token-here
```

---

## Consultation Workflow API

### 1. Start Consultation

Creates a new consultation session for a user.

```http
POST /consultation
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "metadata": {
    "source": "website",
    "campaign": "q4-2025",
    "referrer": "https://example.com"
  }
}
```

**Response:**
```json
{
  "consultation_id": "cons_1234567890",
  "session_token": "sess_abcdef123456",
  "expires_at": "2025-09-19T18:00:00Z",
  "questionnaire": {
    "id": "quest_default_v1",
    "title": "Business Consultation Assessment",
    "description": "Help us understand your business needs",
    "estimated_duration": 8,
    "questions": [
      {
        "id": "q1",
        "type": "text",
        "question": "What is your company name?",
        "required": true,
        "validation": {
          "max_length": 100
        }
      }
    ]
  }
}
```

### 2. Submit Questionnaire Response

Submits answers to questionnaire questions.

```http
POST /consultation/{consultation_id}/responses
```

**Request Body:**
```json
{
  "session_token": "sess_abcdef123456",
  "responses": [
    {
      "question_id": "q1",
      "answer": "Acme Corporation"
    },
    {
      "question_id": "q2",
      "answer": ["option1", "option3"]
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "responses_saved": 2,
  "progress": {
    "completed": 2,
    "total": 15,
    "percentage": 13.3
  },
  "next_questions": [
    {
      "id": "q3",
      "type": "select",
      "question": "What is your industry?",
      "options": ["Technology", "Healthcare", "Finance", "Other"]
    }
  ]
}
```

### 3. Generate Consultation Report

Triggers AI-powered analysis and report generation.

```http
POST /consultation/{consultation_id}/generate
```

**Request Body:**
```json
{
  "session_token": "sess_abcdef123456",
  "preferences": {
    "report_format": "comprehensive",
    "include_service_packages": true,
    "email_delivery": true
  }
}
```

**Response:**
```json
{
  "status": "processing",
  "job_id": "job_987654321",
  "estimated_completion": "2025-09-19T15:35:00Z",
  "webhook_url": "https://your-app.com/webhooks/consultation-complete"
}
```

### 4. Get Consultation Results

Retrieves the generated consultation report and recommendations.

```http
GET /consultation/{consultation_id}/results
```

**Query Parameters:**
- `session_token`: Required session authentication
- `format`: `json` (default) or `pdf`

**Response:**
```json
{
  "consultation_id": "cons_1234567890",
  "status": "completed",
  "generated_at": "2025-09-19T15:34:22Z",
  "report": {
    "executive_summary": "Based on your responses, we identify key opportunities...",
    "analysis": {
      "current_situation": "Your organization shows strong technical capabilities...",
      "challenges": [
        "Limited automation in core processes",
        "Scalability concerns with current infrastructure"
      ],
      "opportunities": [
        "Process automation could save 20-30 hours per week",
        "Cloud migration would improve scalability"
      ]
    },
    "recommendations": [
      {
        "id": "rec_1",
        "title": "Implement Process Automation",
        "priority": "high",
        "effort": "medium",
        "timeline": "6-8 weeks",
        "expected_roi": "300%",
        "description": "Automate repetitive tasks using workflow tools..."
      }
    ],
    "service_packages": [
      {
        "id": "pkg_automation",
        "name": "Business Process Automation Package",
        "price": "$15,000",
        "duration": "8 weeks",
        "deliverables": [
          "Process analysis and mapping",
          "Automation tool implementation",
          "Staff training and documentation"
        ]
      }
    ]
  },
  "downloads": {
    "pdf_report": "https://cdn.example.com/reports/cons_1234567890.pdf",
    "action_plan": "https://cdn.example.com/plans/cons_1234567890.xlsx"
  }
}
```

---

## Performance Monitoring API

### 1. System Health Check

Monitors overall system health and performance.

```http
GET /performance/consultation/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-19T15:30:00Z",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "openai_api": "healthy",
    "email_service": "healthy"
  },
  "metrics": {
    "response_time_ms": 145,
    "memory_usage_mb": 512,
    "cpu_usage_percent": 23.5,
    "active_consultations": 12,
    "cache_hit_rate": 0.87
  }
}
```

### 2. Performance Metrics

Retrieves detailed performance metrics and analytics.

```http
GET /performance/consultation
```

**Query Parameters:**
- `timeframe`: `1h`, `24h`, `7d`, `30d`
- `metrics`: Comma-separated list of specific metrics

**Response:**
```json
{
  "timeframe": "24h",
  "summary": {
    "total_consultations": 145,
    "completed_consultations": 128,
    "average_completion_time": "7.3 minutes",
    "average_generation_time": "23.1 seconds",
    "error_rate": 0.012
  },
  "metrics": {
    "response_times": {
      "p50": 120,
      "p95": 450,
      "p99": 800
    },
    "throughput": {
      "consultations_per_hour": 6.2,
      "peak_hour": "14:00-15:00",
      "peak_rate": 12.5
    },
    "resources": {
      "avg_memory_usage": 485,
      "max_memory_usage": 782,
      "avg_cpu_usage": 31.2,
      "max_cpu_usage": 67.8
    }
  }
}
```

---

## Administration API

### 1. Manage Service Packages

Administrative endpoints for managing consultation service packages.

```http
GET /admin/service-packages
POST /admin/service-packages
PUT /admin/service-packages/{package_id}
DELETE /admin/service-packages/{package_id}
```

**Create Package Request:**
```json
{
  "name": "Enterprise Consultation Package",
  "description": "Comprehensive business analysis and strategic recommendations",
  "price": 25000,
  "currency": "USD",
  "duration_weeks": 12,
  "features": [
    "In-depth business analysis",
    "Custom strategy development",
    "Implementation roadmap",
    "Ongoing support"
  ],
  "target_criteria": {
    "company_size": ["medium", "large"],
    "industries": ["technology", "finance"],
    "challenges": ["scaling", "automation"]
  }
}
```

### 2. Analytics and Reporting

```http
GET /admin/analytics/consultations
GET /admin/analytics/conversions
GET /admin/analytics/performance
```

**Consultation Analytics Response:**
```json
{
  "period": "30d",
  "total_consultations": 892,
  "completion_rate": 0.847,
  "conversion_rate": 0.234,
  "top_industries": [
    {"name": "Technology", "count": 312},
    {"name": "Healthcare", "count": 189},
    {"name": "Finance", "count": 156}
  ],
  "popular_packages": [
    {"id": "pkg_automation", "recommendations": 234},
    {"id": "pkg_digital_transform", "recommendations": 189}
  ],
  "geographic_distribution": {
    "US": 0.456,
    "UK": 0.234,
    "Canada": 0.145,
    "Other": 0.165
  }
}
```

---

## Webhook Integration

### 1. Consultation Events

The system sends webhooks for various consultation events.

**Webhook Endpoint Setup:**
```http
POST /admin/webhooks
```

```json
{
  "url": "https://your-app.com/webhooks/consultation",
  "events": [
    "consultation.started",
    "consultation.completed",
    "consultation.failed",
    "report.generated",
    "email.delivered"
  ],
  "secret": "webhook_secret_key"
}
```

**Webhook Payload Example:**
```json
{
  "event": "consultation.completed",
  "timestamp": "2025-09-19T15:34:22Z",
  "consultation_id": "cons_1234567890",
  "data": {
    "email": "user@example.com",
    "completion_time": "7.2 minutes",
    "report_generated": true,
    "service_packages_recommended": 2,
    "metadata": {
      "source": "website",
      "campaign": "q4-2025"
    }
  }
}
```

---

## Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "INVALID_SESSION",
    "message": "Session token is expired or invalid",
    "details": {
      "session_token": "sess_abcdef123456",
      "expired_at": "2025-09-19T14:00:00Z"
    },
    "request_id": "req_987654321"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_API_KEY` | 401 | API key is missing or invalid |
| `INVALID_SESSION` | 401 | Session token is expired or invalid |
| `CONSULTATION_NOT_FOUND` | 404 | Consultation ID does not exist |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `AI_SERVICE_ERROR` | 503 | AI generation service unavailable |
| `EMAIL_DELIVERY_ERROR` | 503 | Email service unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

### Default Limits

| Endpoint Category | Limit | Window |
|------------------|-------|---------|
| Consultation API | 100 requests | 1 hour |
| Performance API | 1000 requests | 1 hour |
| Admin API | 500 requests | 1 hour |
| Webhook Delivery | 50 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1695141600
```

---

## SDK and Integration Examples

### JavaScript SDK

```javascript
import { ConsultationAPI } from '@your-org/consultation-sdk';

const client = new ConsultationAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://your-domain.com/api'
});

// Start consultation
const consultation = await client.startConsultation({
  email: 'user@example.com',
  metadata: { source: 'website' }
});

// Submit responses
await client.submitResponses(consultation.consultation_id, {
  session_token: consultation.session_token,
  responses: [
    { question_id: 'q1', answer: 'Acme Corp' }
  ]
});

// Generate report
const generation = await client.generateReport(consultation.consultation_id, {
  session_token: consultation.session_token
});

// Get results
const results = await client.getResults(consultation.consultation_id, {
  session_token: consultation.session_token
});
```

### Python SDK

```python
from consultation_sdk import ConsultationClient

client = ConsultationClient(
    api_key='your-api-key',
    base_url='https://your-domain.com/api'
)

# Start consultation
consultation = client.start_consultation(
    email='user@example.com',
    metadata={'source': 'website'}
)

# Submit responses
client.submit_responses(
    consultation['consultation_id'],
    session_token=consultation['session_token'],
    responses=[
        {'question_id': 'q1', 'answer': 'Acme Corp'}
    ]
)

# Generate and get results
generation = client.generate_report(
    consultation['consultation_id'],
    session_token=consultation['session_token']
)

results = client.get_results(
    consultation['consultation_id'],
    session_token=consultation['session_token']
)
```

### cURL Examples

```bash
# Start consultation
curl -X POST https://your-domain.com/api/consultation \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "metadata": {"source": "website"}
  }'

# Submit responses
curl -X POST https://your-domain.com/api/consultation/cons_1234567890/responses \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "session_token": "sess_abcdef123456",
    "responses": [
      {"question_id": "q1", "answer": "Acme Corporation"}
    ]
  }'

# Get results
curl -X GET "https://your-domain.com/api/consultation/cons_1234567890/results?session_token=sess_abcdef123456" \
  -H "Authorization: Bearer your-api-key"
```

---

## Testing and Development

### Test Environment

```
Base URL: https://test.your-domain.com/api
API Key: test_key_1234567890
```

### Mock Data

Test consultations can be created with predefined responses:

```json
{
  "email": "test@example.com",
  "use_mock_data": true,
  "mock_scenario": "technology_startup"
}
```

### Sandbox Mode

Set the `X-Sandbox-Mode: true` header to prevent actual AI API calls and email delivery.

---

## Security Considerations

### API Key Management
- Rotate API keys regularly (recommended: quarterly)
- Use different keys for different environments
- Never expose API keys in client-side code
- Implement IP whitelisting for production keys

### Data Privacy
- All consultation data is encrypted at rest
- PII is automatically detected and handled according to privacy policies
- Data retention policies automatically purge old consultations
- GDPR/CCPA compliance built-in with data export/deletion endpoints

### HTTPS Requirements
- All API endpoints require HTTPS in production
- TLS 1.2 minimum required
- Certificate pinning recommended for high-security integrations

---

## Monitoring and Observability

### Logging

All API requests are logged with the following format:

```json
{
  "timestamp": "2025-09-19T15:30:00Z",
  "request_id": "req_987654321",
  "method": "POST",
  "path": "/consultation",
  "status_code": 201,
  "response_time_ms": 145,
  "api_key_id": "key_abc123",
  "ip_address": "192.168.1.1",
  "user_agent": "ConsultationSDK/1.0.0"
}
```

### Metrics

Key metrics available through monitoring endpoints:

- Request volume and response times
- Error rates by endpoint and error type
- AI generation success rates and performance
- Email delivery success rates
- Cache hit/miss ratios
- Resource utilization (CPU, memory, database)

### Alerts

Recommended alerting thresholds:

- Error rate > 1% for 5 minutes
- Response time > 500ms for p95 over 10 minutes
- AI generation failure rate > 5% for 15 minutes
- Email delivery failure rate > 2% for 10 minutes

---

## Support and Resources

### Documentation Links
- [Getting Started Guide](./user-guide.md)
- [Admin Guide](./admin-guide.md)
- [Production Deployment](../deployment/PRODUCTION_DEPLOYMENT_RUNBOOK.md)

### Support Channels
- API Support: api-support@your-domain.com
- Technical Documentation: docs@your-domain.com
- Emergency Support: +1-555-0199 (24/7)

### Community Resources
- Developer Portal: https://developers.your-domain.com
- API Status Page: https://status.your-domain.com
- GitHub Repository: https://github.com/your-org/consultation-api
- Discord Community: https://discord.gg/consultation-devs

---

**Document Version**: 1.0
**Last Updated**: September 19, 2025
**API Version**: v1
**Maintained by**: Consultation API Team