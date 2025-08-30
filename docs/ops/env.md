# Environment Configuration Documentation - Phase 1, Task 2

**Generated**: 2025-08-29T15:10:31.507Z  
**Task**: Phase 1, Task 2 - Environment schema + env:doctor

## Overview

This document describes the enhanced environment variable management system that implements a "warn-but-run" philosophy, ensuring the application continues to function with graceful feature degradation when secrets are missing.

## Architecture

### Core Components

1. **`lib/env.ts`** - Enhanced environment schema with comprehensive validation
2. **`lib/env-validation.ts`** - Validation and sanitization utilities
3. **`lib/env-encryption.ts`** - Encryption utilities for production security
4. **`lib/flags.ts`** - Feature flag management with tier-based controls
5. **`scripts/env-doctor.ts`** - CLI diagnostic tool
6. **`env.example`** - Comprehensive configuration template

### Environment Categories

#### 1. Core Application Configuration (`env.app`)
- **NODE_ENV**: Runtime environment detection
- **PORT**: Development server port  
- **APP_TIER**: Feature tier configuration (starter/pro/advanced)
- **CI**: CI environment detection

#### 2. Integration Services (`env.integrations`)
- **Supabase**: Database connection and authentication
- **Resend**: Email service configuration
- **Stripe**: Payment processing keys
- **n8n**: Workflow automation webhooks
- **Slack**: Notification webhooks
- **GitHub**: CI/CD integration

#### 3. Security & Monitoring (`env.security`)
- **Sentry**: Error tracking configuration
- **Cron secrets**: Secure job execution
- **Debug flags**: Development and debugging options

#### 4. Observability (`env.observability`)
- **Feature flags**: Toggle system controls
- **Performance monitoring**: Monitoring configuration
- **Health checks**: Health check system controls

## Security Classification

### Security Levels

| Level | Description | Examples | Client Exposure |
|-------|-------------|----------|-----------------|
| **PUBLIC** | Safe for client exposure | `NEXT_PUBLIC_*` variables | ✅ Yes |
| **PRIVATE** | Server-only, moderately sensitive | API keys, URLs | ❌ No |
| **CRITICAL** | Server-only, highly sensitive | Database credentials, webhook secrets | ❌ No |

### Production Security Requirements

- All CRITICAL and PRIVATE variables must use real values (not placeholders)
- No test keys (`sk_test_`, `pk_test_`) in production
- All URLs must use HTTPS in production
- Webhook secrets must be strong and unique
- Master passwords must be stored securely outside environment files

## Feature Impact Mapping

The system automatically detects which features are available based on environment configuration:

| Feature | Required Variables | Impact When Missing |
|---------|-------------------|-------------------|
| **Database** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Complete database access disabled |
| **Email** | `RESEND_API_KEY` | Email functionality disabled |
| **Payments** | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payment processing disabled |
| **Webhooks** | `STRIPE_WEBHOOK_SECRET` | Payment webhooks disabled |
| **Automation** | `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SECRET` | Workflow automation disabled |
| **Notifications** | `SLACK_WEBHOOK_URL` | Slack notifications disabled |
| **Error Tracking** | `SENTRY_DSN` | Error tracking disabled |
| **Admin Operations** | `SUPABASE_SERVICE_ROLE_KEY` | Admin operations disabled |

## Warn-But-Run Philosophy

### Placeholder System

When required environment variables are missing, the system automatically provides safe placeholder values:

```typescript
const PLACEHOLDERS = {
  NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'PLACEHOLDER_SUPABASE_ANON_KEY',
  RESEND_API_KEY: 'PLACEHOLDER_RESEND_API_KEY',
  // ... more placeholders
};
```

### Graceful Degradation

- Applications continue to run with missing secrets
- Features are automatically disabled when dependencies are unavailable
- Clear warnings are displayed in development
- Feature flags prevent runtime errors

### Development Warnings

In development mode, warnings are displayed for missing or placeholder values:

```
🟡 Environment validation warnings:
  • RESEND_API_KEY: Using placeholder value
  • STRIPE_SECRET_KEY: Using placeholder value
  • Email functionality will be disabled
  • Payment processing will be disabled
```

## Feature Tiers

### Tier System

The system supports three feature tiers with automatic enablement based on configuration:

#### Starter Tier
- Database access
- Email functionality  
- Health checks
- Safe mode

#### Pro Tier
- All Starter features
- Payment processing
- Webhooks
- Notifications
- Error tracking
- Performance monitoring

#### Advanced Tier
- All Pro features
- Workflow automation
- Admin operations
- AI features
- Debug mode

### Tier Configuration

Set the tier using the `APP_TIER` environment variable:

```bash
APP_TIER=starter    # Basic features
APP_TIER=pro        # Business features
APP_TIER=advanced   # Full feature set
```

## Environment Encryption

### Production Security

For production deployments, sensitive values can be encrypted:

```typescript
// Encrypt a value
const encrypted = await encryptValue('sensitive-api-key', masterPassword);
// Result: ENC:base64-encoded-encrypted-data

// Decrypt at runtime
const decrypted = await decryptValue(encrypted, masterPassword);
```

### Master Password Management

- Store master passwords securely outside of environment files
- Use different passwords for different environments
- Rotate passwords regularly (quarterly recommended)

### Encryption Features

- **AES-256-GCM encryption** with authentication
- **Scrypt key derivation** for password-based encryption
- **Salt and IV randomization** for each encryption operation
- **Batch operations** for encrypting multiple variables
- **Rotation utilities** for password changes

## Validation and Sanitization

### Automatic Validation

The system automatically validates and sanitizes environment variables:

```typescript
// URL sanitization
'https://example.com/' → 'https://example.com'

// Email normalization  
'USER@DOMAIN.COM' → 'user@domain.com'

// Boolean sanitization
'TRUE', '1', 'yes' → 'true'
'FALSE', '0', 'no' → 'false'

// Timeout bounds enforcement
'999999' → '300000' (max 5 minutes)
```

### Production Validations

Additional validations are enforced in production:

- HTTPS requirement for all URLs
- Strong secret validation (32+ characters)
- No test keys allowed
- No disposable email domains
- No localhost URLs

## CLI Tools

### Environment Doctor

Run comprehensive diagnostics with the env:doctor CLI:

```bash
# Full diagnostic report
npm run env:doctor

# Quick overview only
npm run env:doctor --overview

# JSON output for CI/CD
npm run env:doctor --json

# Show help
npm run env:doctor --help
```

### Available Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `--overview` | Environment summary | Health status, tier, critical issues |
| `--variables` | Variable status table | All variables with security levels |
| `--features` | Feature flags status | Enabled/disabled features |
| `--tiers` | Tier matrix | Features by tier level |
| `--validation` | Validation results | Errors, warnings, recommendations |
| `--json` | Machine readable | JSON output for automation |

### Example Output

```
🏥 ENVIRONMENT DOCTOR REPORT
Generated at: 2025-08-29T15:10:31.507Z

================================================================================
  ENVIRONMENT OVERVIEW
================================================================================

Environment: development
Current Tier: STARTER
Overall Health: ⚠ WARNING
Critical Missing: 0
Optional Missing: 5
Validation Warnings: 2
Placeholders in Use: 5

================================================================================
  RECOMMENDATIONS
================================================================================

  🔧 5 placeholders in use - consider setting up more integrations for testing
  ⬆️ Consider upgrading from starter tier to unlock 3 available features
```

## Integration Examples

### Using Environment Values

```typescript
import { getEnv, isEnabled } from '@/lib/env';
import { flags } from '@/lib/flags';

// Get validated environment
const env = getEnv();

// Check if features are available
if (flags.isEnabled('email')) {
  // Email functionality is available
  await sendEmail(env.RESEND_API_KEY);
}

// Conditional feature execution
await flags.withFeatureAsync('payments', async () => {
  return processPayment(env.STRIPE_SECRET_KEY);
});
```

### Feature Flag Checks

```typescript
import { isEnabled, isTier } from '@/lib/flags';

// Check individual features
const canProcessPayments = isEnabled('payments');
const hasErrorTracking = isEnabled('error_tracking');

// Check tier levels
const isPro = isTier('pro');
const isAdvanced = isTier('advanced');

// Group checks
const hasFullIntegration = isEnabled('automation') && isEnabled('notifications');
```

## Best Practices

### Development

1. **Copy `env.example` to `.env.local`**
2. **Run `npm run env:doctor` regularly** to check configuration
3. **Use placeholders for testing** when real services aren't needed
4. **Enable debug mode** for development troubleshooting

### Production

1. **Set all CRITICAL variables** to real values
2. **Use HTTPS for all URLs**
3. **Rotate secrets quarterly**
4. **Monitor with `env:doctor --json`** in CI/CD
5. **Store master passwords securely**

### Security

1. **Never commit `.env.local`** or production files
2. **Use environment-specific keys** (test vs live)
3. **Validate secrets strength** before deployment
4. **Monitor for exposed secrets** in logs
5. **Use encryption for highly sensitive values**

## Troubleshooting

### Common Issues

#### "Environment validation warnings"
- **Cause**: Missing or invalid environment variables
- **Solution**: Check `env.example` for required format
- **Tool**: Run `npm run env:doctor --variables`

#### "Feature disabled"
- **Cause**: Required environment variables missing
- **Solution**: Set the required variables or accept degraded functionality
- **Tool**: Run `npm run env:doctor --features`

#### "Using placeholder values"
- **Cause**: Environment variables not set or set to placeholder values
- **Solution**: Set real values or accept limited functionality
- **Tool**: Run `npm run env:doctor --validation`

### Diagnostic Commands

```bash
# Check overall health
npm run env:doctor --overview

# Find missing variables
npm run env:doctor --variables | grep "NO"

# Check feature availability
npm run env:doctor --features

# Get recommendations
npm run env:doctor --recommendations
```

## Migration Guide

### From Basic Environment Setup

1. **Update imports** from old env utilities:
   ```typescript
   // Old
   import { env } from './old-env';
   
   // New
   import { getEnv } from '@/lib/env';
   import { flags } from '@/lib/flags';
   ```

2. **Replace feature checks**:
   ```typescript
   // Old
   if (process.env.STRIPE_SECRET_KEY) {
     // process payments
   }
   
   // New
   if (flags.isEnabled('payments')) {
     // process payments
   }
   ```

3. **Update environment files**:
   - Copy new `env.example` structure
   - Add tier configuration
   - Update security classifications

### Testing the Migration

1. **Run diagnostics**: `npm run env:doctor`
2. **Test with minimal config**: Only set critical variables
3. **Verify graceful degradation**: Check disabled features work correctly
4. **Test all tiers**: Verify tier switching works properly

## Future Enhancements

### Planned Features

1. **Dynamic tier switching** in runtime
2. **Environment variable rotation** automation
3. **Integration health monitoring**
4. **Advanced encryption options**
5. **Environment comparison tools**

### Extension Points

The system is designed for easy extension:

- **New feature categories** in `lib/env.ts`
- **Additional validation rules** in `lib/env-validation.ts`
- **Custom encryption algorithms** in `lib/env-encryption.ts`
- **Extended diagnostics** in `scripts/env-doctor.ts`

## Support and Resources

### Getting Help

1. **Run diagnostics**: `npm run env:doctor --help`
2. **Check configuration**: Review `env.example`
3. **Validate setup**: Use `--validation` flag
4. **Read source code**: All modules are well-documented

### Related Documentation

- [Phase 1 Task 1: Baseline & Risks](../adr/0001-baseline-and-risks.md)
- [Phase 1 Task 3: Admin Diagnostics](./diagnostics.md) (coming next)
- [Security Inventory](../baseline/security-inventory.md)
- [Feature Flags Guide](./flags.md)

---

**Note**: This environment system implements the "warn-but-run" philosophy essential to the DCT Micro-Apps template. Features degrade gracefully when secrets are missing, ensuring developers can always run and test the application while being clearly informed about what functionality is available.