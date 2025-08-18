# AI Task Documentation

## Overview
This document describes the available AI tasks, their inputs/outputs, and expected artifacts.

## Universal Header Compliance
- **File**: `docs/AI_TASKS.md`
- **Purpose**: Document AI task specifications and interfaces
- **Status**: Universal header compliant

## Available Tasks

### 1. incident_triage

#### Purpose
Automatically analyze and categorize incident reports for priority assessment and routing.

#### Input Schema
```json
{
  "incident_description": "string",
  "reporter_name": "string",
  "reporter_email": "string",
  "incident_type": "string",
  "severity_indicators": ["string"],
  "affected_systems": ["string"],
  "business_impact": "string",
  "timestamp": "ISO8601 string"
}
```

#### Output Schema
```json
{
  "priority_level": "critical|high|medium|low",
  "category": "security|performance|availability|data|other",
  "estimated_resolution_time": "string",
  "required_skills": ["string"],
  "escalation_path": "string",
  "immediate_actions": ["string"],
  "risk_assessment": "string"
}
```

#### Example Payload
```json
{
  "incident_description": "Database connection timeout causing 500 errors for 30% of users",
  "reporter_name": "John Smith",
  "reporter_email": "john.smith@company.com",
  "incident_type": "performance",
  "severity_indicators": ["high_user_impact", "revenue_affecting"],
  "affected_systems": ["user_api", "payment_processor"],
  "business_impact": "Customer checkout failures, estimated $50K revenue impact",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

#### Expected Artifacts
- Priority classification
- Risk assessment report
- Escalation recommendations
- SLA compliance check

---

### 2. spec_writer

#### Purpose
Generate technical specifications and documentation from high-level requirements.

#### Input Schema
```json
{
  "project_name": "string",
  "requirements": "string",
  "target_audience": "string",
  "technical_constraints": ["string"],
  "existing_systems": ["string"],
  "timeline": "string",
  "stakeholders": ["string"]
}
```

#### Output Schema
```json
{
  "technical_spec": "string",
  "architecture_diagram": "string",
  "api_specifications": ["string"],
  "database_schema": "string",
  "security_requirements": ["string"],
  "testing_strategy": "string",
  "deployment_plan": "string",
  "risk_mitigation": ["string"]
}
```

#### Example Payload
```json
{
  "project_name": "User Authentication Service",
  "requirements": "Implement OAuth2.0 with JWT tokens, support Google and Microsoft SSO, rate limiting, audit logging",
  "target_audience": "Internal developers and security team",
  "technical_constraints": ["Must integrate with existing LDAP", "Comply with SOC2 requirements"],
  "existing_systems": ["Active Directory", "PostgreSQL", "Redis"],
  "timeline": "8 weeks",
  "stakeholders": ["Engineering", "Security", "Product"]
}
```

#### Expected Artifacts
- Complete technical specification
- Architecture diagrams
- API documentation
- Security compliance checklist
- Implementation timeline

## Task Execution

### Authentication
All tasks require valid API key or session token.

### Rate Limiting
- **incident_triage**: 50 requests per hour per user
- **spec_writer**: 20 requests per hour per user

### Cost Estimation
- **incident_triage**: ~500-1000 tokens per request
- **spec_writer**: ~2000-4000 tokens per request

### Error Handling
- Invalid input: 400 Bad Request with validation details
- Rate limit exceeded: 429 Too Many Requests
- AI service unavailable: 503 Service Unavailable
- Budget exceeded: 402 Payment Required

## Implementation Details

### Task Router
Tasks are routed through `lib/ai/router.ts` which:
- Validates task names
- Routes to appropriate handlers
- Applies safety and cost controls
- Returns structured responses

### Schema Validation
All inputs/outputs are validated against TypeScript interfaces:
- `IncidentReport` for incident_triage
- `SpecDoc` for spec_writer

### Safety Integration
- Input redaction (configurable)
- Output moderation (configurable)
- Cost tracking and limits

## Testing

### Test Cases
- Valid input scenarios
- Edge cases and boundary conditions
- Error handling validation
- Performance under load

### Mock Responses
Available for development and testing without AI costs.

### Integration Tests
- End-to-end task execution
- Safety feature validation
- Cost tracking verification

## Future Enhancements

### Planned Tasks
- **code_review**: Automated code analysis and suggestions
- **documentation_generator**: Generate docs from code comments
- **test_case_generator**: Create test cases from requirements

### Advanced Features
- **Multi-language support**: Non-English input/output
- **Template system**: Customizable output formats
- **Batch processing**: Multiple tasks in single request
