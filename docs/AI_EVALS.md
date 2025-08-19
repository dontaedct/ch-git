# AI Evaluations System

## Overview
This system provides deterministic AI task evaluations with offline support through mock providers. It ensures AI tasks produce valid, schema-compliant responses even when external AI services are unavailable.

## Architecture

### Providers
- **OpenAI Provider**: Real AI service when `OPENAI_API_KEY` is set
- **Mock Provider**: Deterministic offline responses when no API key is available
- **Automatic Fallback**: Router automatically switches to mock provider when offline

### Evaluation Cases
Located in `lib/ai/evals/cases/`:
- `incident_triage/`: Log analysis and incident response
- `spec_writer/`: Technical specification generation

Each case includes:
- `input.*`: Test input data
- `expected.shape.json`: Schema validation rules

## Usage

### Local Development
```bash
# Run evaluations locally
npm run ai:eval

# Run with CI exit codes
npm run ai:eval:ci
```

### CI Integration
The system automatically runs in CI via `.github/workflows/ai-evals.yml`:
- Triggers on push/PR to main/develop
- Uses mock provider (no API key required)
- Fails build if any evaluations fail

## Adding New Cases

1. Create case directory: `lib/ai/evals/cases/<case_name>/`
2. Add input file: `input.json` or `input.md`
3. Define expected shape: `expected.shape.json`
4. Update `lib/ai/runners/runEval.ts` to load the new case

### Example Case Structure
```
lib/ai/evals/cases/new_task/
├── input.json           # Test input data
└── expected.shape.json  # Expected response schema
```

## Mock Provider Behavior

When `OPENAI_API_KEY` is not set:
- Router automatically switches to mock provider
- Responses are deterministic and schema-validated
- No external API calls are made
- Perfect for offline development and CI

## Schema Validation

All AI responses are validated against expected shapes:
- Required fields must be present
- Field types must match exactly
- Arrays must contain expected element types
- Validation failures cause test failures

## Troubleshooting

### Common Issues
- **Schema validation failed**: Check `expected.shape.json` matches actual response
- **Case loading error**: Verify file paths and JSON syntax
- **Provider errors**: Check environment variables and provider configuration

### Debug Mode
Add `DEBUG=true` environment variable for verbose logging:
```bash
DEBUG=true npm run ai:eval
```

## Security

- No secrets are exposed in evaluations
- Mock provider uses only test data
- Real provider requires valid API keys
- All inputs are sanitized and validated
