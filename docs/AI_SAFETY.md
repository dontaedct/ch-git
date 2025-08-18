# AI Safety & Cost Controls

## Overview
This document outlines the safety measures and cost controls implemented for AI operations to ensure runtime failures are contained and spend is predictable.

## Universal Header Compliance
- **File**: `docs/AI_SAFETY.md`
- **Purpose**: Document AI safety measures and cost controls
- **Status**: Universal header compliant

## Safety Architecture

### Input Safety
- **PII Redaction**: Configurable pattern-based redaction (currently no-op)
- **Input Validation**: JSON schema validation for structured inputs
- **Size Limits**: Configurable per request type limits

### Output Safety
- **Content Moderation**: Configurable moderation with threshold-based scoring
- **JSON Validation**: Ensures outputs conform to expected schemas
- **Output Sanitization**: Basic HTML/script injection prevention

### Safety Configuration
```typescript
interface SafetyConfig {
  enableRedaction: boolean;      // Toggle redaction features
  enableModeration: boolean;     // Toggle moderation features
  redactionPatterns: string[];   // Custom redaction patterns
  moderationThreshold: number;   // Moderation score threshold (0.0-1.0)
}
```

## Cost Controls

### Token Estimation
- **Model Support**: GPT-4, GPT-3.5-turbo with configurable pricing
- **Cost Calculation**: Input/output token separation with per-1k pricing
- **Currency**: USD-based pricing (configurable)

### Cost Configuration
```typescript
interface CostConfig {
  model: string;                 // AI model identifier
  inputCostPer1k: number;        // Cost per 1k input tokens
  outputCostPer1k: number;       // Cost per 1k output tokens
  currency: string;              // Currency code
}
```

## Implementation Status

### Current State
- **Safety Tools**: No-op implementations with configurable interfaces
- **Cost Tools**: Token estimation and cost calculation
- **Integration**: Basic hooks in AI execution flow

### Future Enhancements
- **Redaction**: Implement actual PII detection patterns
- **Moderation**: Integrate with content moderation services
- **Budget Guards**: Add daily/monthly spending limits
- **Rate Limiting**: Per-user and per-IP request limits

## Configuration

### Environment Variables
```bash
AI_ENABLED=false                    # Master toggle for AI features
AI_REQUEST_SOFT_CAP=4000           # Soft token limit per request
AI_MAX_TOKENS=10000                # Hard token limit per request
AI_SAFETY_ENABLED=true             # Enable safety features
AI_COST_TRACKING=true              # Enable cost tracking
```

### Safety Toggles
- **AI_ENABLED**: Master switch for all AI functionality
- **AI_SAFETY_ENABLED**: Enable/disable safety features
- **AI_COST_TRACKING**: Enable/disable cost monitoring

## Error Handling

### Graceful Degradation
- AI failures don't crash the application
- Fallback responses for common scenarios
- Circuit breaker pattern for external API failures

### Safety Failures
- Redaction failures: Log warning, continue with original input
- Moderation failures: Log warning, allow with review flag
- Cost calculation failures: Log error, continue without cost tracking

## Development Guidelines

### Testing
- All safety features must have unit tests
- Integration tests for end-to-end flows
- Performance testing for safety checks

### Deployment
- Feature flags for gradual rollout
- Canary deployments for new safety features
- Rollback procedures documented

## Monitoring & Alerting

### Metrics
- Safety check success/failure rates
- Cost per request tracking
- Performance impact of safety measures

### Alerts
- Safety check failures above threshold
- Cost overruns
- Performance degradation from safety overhead
