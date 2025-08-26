# Step 03: Environment Validation

## Overview

Step 03 implements comprehensive environment variable validation with fail-fast checks and runtime validation for critical server variables. This step ensures application reliability and security through proper environment configuration.

## What This Step Means in OSS Hero

### Environment Safety Foundation
The environment validation implementation provides:
- **Fail-fast Safety**: Prevent runtime errors from missing environment variables
- **Production Security**: Strict validation for production environments
- **Development Flexibility**: Appropriate validation for development environments
- **Security Awareness**: Detection of potentially exposed secrets

### Runtime Validation
Comprehensive environment checking including:
- **Critical Variables**: Required variables for application operation
- **Production Requirements**: Additional validation for production environments
- **Security Checks**: Detection of development values in production
- **API Endpoints**: Environment status without exposing secrets

## Implementation Details

### Core Components

#### 1. Environment Validation Module (`lib/config/requireEnv.ts`)
- **Purpose**: Comprehensive environment variable validation
- **Features**: 
  - Fail-fast validation for critical variables
  - Production-specific validation
  - Security checks for exposed secrets
  - Type-safe validation with Zod

#### 2. Validation Schemas
```typescript
// Critical server environment variables
const CriticalServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key required"),
  // ... additional validation
});
```

#### 3. Validation Commands
```bash
npm run check:env          # Check environment variables
npm run security:secrets   # Security secrets validation
```

#### 4. API Integration
- **Environment Check Endpoint**: `app/api/env-check/route.ts`
- **Application Startup**: Early validation in `next.config.ts`
- **Health Checks**: Environment status for monitoring

## Runbook Notes

### Daily Operations
1. **Environment Check**: Run `npm run check:env` during deployment
2. **Security Validation**: Use `npm run security:secrets` for security checks
3. **Status Monitoring**: Check environment status via API endpoint

### Weekly Maintenance
1. **Comprehensive Check**: Run full environment validation
2. **Security Review**: Review environment variable security
3. **Configuration Update**: Ensure environment variables are optimal

### Troubleshooting
1. **Missing Variables**: Check environment variable configuration
2. **Validation Errors**: Review validation error messages
3. **Security Issues**: Address security warnings and exposed secrets

## Benefits

### For Developers
- **Clear Error Messages**: Specific validation error messages
- **Development Safety**: Appropriate validation for development
- **Configuration Guidance**: Clear requirements for environment setup
- **Security Awareness**: Detection of potential security issues

### For Operations
- **Deployment Safety**: Fail-fast on missing critical variables
- **Production Security**: Strict validation for production environments
- **Health Monitoring**: Environment status for monitoring
- **Error Prevention**: Proactive environment validation

### For Security
- **Secret Detection**: Identification of potentially exposed secrets
- **Production Safety**: Prevention of development values in production
- **Configuration Security**: Secure environment variable handling
- **Audit Trail**: Environment validation logging

## Integration with Other Steps

### Prerequisites
- **Step 01**: Baseline establishment (tooling foundation)
- **Step 02**: TypeScript strictness (type-safe validation)

### Enables
- **Step 04**: Webhook security (environment-based secrets)
- **Step 07**: CI gate (environment validation in CI)
- **Step 09**: Seeds tests (environment-aware testing)

### Dependencies
- **Zod**: Schema validation library
- **Environment Variables**: Critical server variables
- **API Endpoints**: Environment status endpoints
- **CI Pipeline**: Environment validation in CI

## Success Criteria

- ✅ Environment validation module functional
- ✅ Fail-fast validation working
- ✅ Production-specific validation active
- ✅ Security checks operational
- ✅ API endpoint providing status
- ✅ Integration with application startup

## Monitoring

### Key Metrics
- **Validation Status**: Environment validation results
- **Missing Variables**: Count of missing critical variables
- **Security Warnings**: Number of security issues detected
- **API Endpoint Health**: Environment check endpoint status

### Alerts
- **Validation Failures**: Critical environment validation errors
- **Missing Variables**: Required variables not set
- **Security Issues**: Exposed secrets or development values in production
- **API Failures**: Environment check endpoint failures

## Environment Variables

### Critical Variables
- **NODE_ENV**: Application environment (development/test/production)
- **NEXT_PUBLIC_SUPABASE_URL**: Supabase URL for database operations
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Supabase anon key for client operations

### Optional Variables
- **SENTRY_DSN**: Sentry error tracking configuration
- **RESEND_API_KEY**: Resend email service API key
- **RESEND_FROM**: Resend email from address

### Production Requirements
- **SENTRY_DSN**: Required in production for error tracking
- **RESEND_API_KEY**: Required in production for email functionality
- **RESEND_FROM**: Required in production for email sending

## Security Features

### Security Checks
- **Development Values**: Detection of localhost URLs in production
- **Fallback Keys**: Identification of fallback keys in production
- **Example Emails**: Detection of example.com emails in production
- **Exposed Secrets**: Identification of potentially sensitive public variables

### Allowed Public Secrets
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Meant to be public
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**: Meant to be public
- **NEXT_PUBLIC_SENTRY_DSN**: Meant to be public

## Related Documentation

- [Environment Configuration](../environment-config.md)
- [Security Guidelines](../security-guidelines.md)
- [Deployment Guide](../deployment-guide.md)
- [Change Journal](../CHANGE_JOURNAL.md)

---

**Note**: This step establishes the environment safety foundation for all subsequent OSS Hero hardening steps. It provides fail-fast validation, production security, and comprehensive environment variable management.
