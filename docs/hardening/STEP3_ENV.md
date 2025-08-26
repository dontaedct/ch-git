# Hardening Step 3: Environment Completeness & Fail-Fast Configuration

**Date:** 2025-08-25  
**Status:** ✅ Complete  
**Previous:** [Step 2: TypeScript Strictness](../hardening/STEP2_TS_RATCHET.md)  
**Next:** [Step 4: Webhook Security](../hardening/STEP4_WEBHOOK_SECURITY.md)

## Overview

This step implements comprehensive environment variable management with fail-fast validation, ensuring that critical configuration is present and properly scoped before the application starts.

## Objectives

- ✅ Complete `env.example` with all operational environment variables
- ✅ Implement fail-fast environment validation at application boot
- ✅ Add CI environment validation with dummy placeholders
- ✅ Implement secret hygiene scanning to prevent hardcoded secrets
- ✅ Document environment variable scopes and usage

## Implementation Details

### A) Environment Example Completeness

**File:** `env.example`

Created comprehensive environment template with:
- **Core Application:** `NODE_ENV`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- **Authentication:** `DEFAULT_COACH_ID`
- **Email Services:** `RESEND_API_KEY`, `RESEND_FROM`
- **Monitoring:** `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`
- **Payments:** `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Automation:** `N8N_WEBHOOK_URL`
- **Notifications:** `SLACK_WEBHOOK_URL`
- **CI/CD:** `GITHUB_TOKEN`, `GITHUB_REPO`
- **Development:** `NEXT_PUBLIC_DEBUG`, `NEXT_PUBLIC_SAFE_MODE`, `NEXT_PUBLIC_ENABLE_AI_LIVE`
- **Security:** `CRON_SECRET`

Each variable includes:
- **Purpose:** What the variable is used for
- **Scope:** `server` vs `client` (NEXT_PUBLIC_*)
- **Usage:** Where in the codebase it's referenced

### B) Fail-Fast Configuration

**File:** `lib/config/requireEnv.ts`

Implemented comprehensive environment validation system:

```typescript
// Critical server environment validation
const CriticalServerEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  // ... additional validation
});

// Production-specific validation
const ProductionEnvSchema = z.object({
  SENTRY_DSN: z.string().url(),
  RESEND_API_KEY: z.string().min(1),
  RESEND_FROM: z.string().email(),
});
```

**Features:**
- **Fail-fast validation:** Throws on missing critical variables
- **Environment-specific checks:** Different requirements for dev/prod
- **Security warnings:** Detects development values in production
- **Type-safe access:** `requireEnv()` and `getOptionalEnv()` helpers

**Integration:** `next.config.ts`
- Early validation during build process
- Non-blocking warnings in development
- Hard failures in production

### C) CI Environment Validation

**File:** `scripts/check-env.ts`

Created CI environment validation script:

```bash
# Check current environment
npm run check:env

# CI mode with dummy placeholders
npm run check:env -- --ci

# Production validation
npm run check:env -- --production
```

**Features:**
- **CI Mode:** Uses dummy placeholders for validation
- **Production Mode:** Overrides NODE_ENV for strict validation
- **Detailed Output:** Shows validation results and suggestions
- **Exit Codes:** Proper exit codes for CI integration

### D) Secret Hygiene

**File:** `scripts/security-secrets.ts`

Implemented comprehensive secret scanning:

```bash
# Scan for hardcoded secrets
npm run security:secrets

# Auto-fix issues where possible
npm run security:secrets -- --fix

# Detailed output
npm run security:secrets -- --verbose
```

**Detection Patterns:**
- **Hardcoded Secrets:** API keys, tokens, passwords, database URLs
- **Exposed Secrets:** NEXT_PUBLIC_* variables containing sensitive data
- **Insecure Patterns:** Fallback values that could expose secrets
- **Service-specific:** Stripe, GitHub, Slack, Sentry credentials

**Security Features:**
- **Severity Classification:** High/Medium/Low severity levels
- **File Exclusion:** Excludes node_modules, .git, examples
- **Multiple Extensions:** Scans .ts, .tsx, .js, .jsx, .json, .md files
- **Detailed Reporting:** Shows file, line, type, and suggestions

## Environment Variable Scopes

### Server-Only Variables
These variables are never exposed to the client and should be used in API routes, server components, and server-side code:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `DEFAULT_COACH_ID`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `SENTRY_DSN`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `N8N_WEBHOOK_URL`
- `SLACK_WEBHOOK_URL`
- `GITHUB_TOKEN`
- `GITHUB_REPO`
- `CRON_SECRET`

### Client-Exposed Variables
These variables are exposed to the client and should only contain non-sensitive data:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_DEBUG`
- `NEXT_PUBLIC_SAFE_MODE`
- `NEXT_PUBLIC_ENABLE_AI_LIVE`
- `NEXT_PUBLIC_VERCEL_ENV`

## Usage Examples

### Environment Validation

```typescript
import { validateCriticalEnv, requireEnv } from "@/lib/config/requireEnv";

// Validate all critical environment variables
const result = validateCriticalEnv();
if (!result.isValid) {
  console.error("Environment validation failed:", result.errors);
}

// Get required environment variable with type safety
const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const optionalKey = getOptionalEnv("RESEND_API_KEY", "default-value");
```

### CI Integration

```yaml
# .github/workflows/ci.yml
- name: Check Environment
  run: npm run check:env -- --ci

- name: Security Scan
  run: npm run security:secrets
```

### Development Setup

```bash
# Copy environment template
cp env.example .env.local

# Fill in your values
# Edit .env.local with your actual credentials

# Validate environment
npm run check:env

# Run security scan
npm run security:secrets
```

## Security Considerations

### ✅ Implemented
- **Fail-fast validation:** Application won't start with missing critical variables
- **Scope enforcement:** Server-only variables never exposed to client
- **Secret scanning:** Automated detection of hardcoded secrets
- **Production validation:** Stricter requirements for production environments
- **CI safety:** Dummy placeholders prevent real secrets in CI

### 🔒 Best Practices
- **Never commit `.env.local`:** Use `.gitignore` to exclude environment files
- **Use environment-specific values:** Different values for dev/staging/prod
- **Rotate secrets regularly:** Implement secret rotation policies
- **Monitor for exposure:** Regular security scans and monitoring
- **Least privilege:** Only expose necessary variables to client

## Testing

### Manual Testing

```bash
# Test environment validation
npm run check:env

# Test security scanning
npm run security:secrets

# Test CI mode
npm run check:env -- --ci

# Test production mode
npm run check:env -- --production
```

### Automated Testing

The environment validation is integrated into the build process and will:
- ✅ Pass in development with proper `.env.local`
- ✅ Pass in CI with dummy placeholders
- ✅ Fail in production with missing critical variables
- ✅ Warn about security issues without blocking development

## Migration Guide

### For Existing Projects

1. **Copy environment template:**
   ```bash
   cp env.example .env.local
   ```

2. **Fill in your values:**
   - Update Supabase credentials
   - Add Sentry DSN if using error tracking
   - Add Resend API key if using email
   - Add other service credentials as needed

3. **Validate environment:**
   ```bash
   npm run check:env
   ```

4. **Run security scan:**
   ```bash
   npm run security:secrets
   ```

5. **Fix any issues found:**
   - Move hardcoded secrets to environment variables
   - Review NEXT_PUBLIC_* variables for sensitive data
   - Implement proper environment validation

### For CI/CD

1. **Add environment validation step:**
   ```yaml
   - name: Check Environment
     run: npm run check:env -- --ci
   ```

2. **Add security scanning:**
   ```yaml
   - name: Security Scan
     run: npm run security:secrets
   ```

3. **Set required environment variables in your deployment platform:**
   - Vercel: Project Settings → Environment Variables
   - GitHub Actions: Repository Settings → Secrets
   - Other platforms: Follow their environment variable documentation

## Troubleshooting

### Common Issues

**Environment validation fails:**
- Check that all required variables are set in `.env.local`
- Verify variable names match exactly (case-sensitive)
- Ensure URLs are valid and accessible

**Security scan finds issues:**
- Move hardcoded secrets to environment variables
- Review NEXT_PUBLIC_* variables for sensitive data
- Use server-only variables for sensitive information

**CI validation fails:**
- Ensure CI mode is used: `npm run check:env -- --ci`
- Check that dummy placeholders are being set correctly
- Verify CI environment has required variables set

### Debug Mode

```bash
# Verbose environment validation
npm run check:env -- --verbose

# Verbose security scanning
npm run security:secrets -- --verbose
```

## Next Steps

This completes Step 3 of the hardening process. The next step will focus on:

- **Step 4:** Webhook Security (HMAC verification + idempotency)
- **Step 5:** API Rate Limiting & DDoS Protection
- **Step 6:** Database Security & RLS Enforcement

## Files Modified

- ✅ `env.example` - Complete environment template
- ✅ `lib/config/requireEnv.ts` - Fail-fast validation system
- ✅ `next.config.ts` - Early environment validation
- ✅ `scripts/check-env.ts` - CI environment validation
- ✅ `scripts/security-secrets.ts` - Secret hygiene scanner
- ✅ `package.json` - Added npm scripts
- ✅ `docs/hardening/STEP3_ENV.md` - This documentation

## Verification

Run the following commands to verify the implementation:

```bash
# Check environment validation
npm run check:env

# Run security scan
npm run security:secrets

# Run full CI pipeline
npm run ci
```

All commands should pass without errors, indicating that the environment configuration is properly set up and secure.
