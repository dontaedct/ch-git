# Step 11: Secrets & Bundle Leakage Guard

**Date:** 2025-08-25  
**Status:** ✅ Complete  
**Previous:** [Step 10: n8n Reliability](../hardening/STEP10_N8N.md)  
**Next:** [Step 12: Demo Isolation](../hardening/STEP12_DEMOS.md)

## Overview

Step 11 implements comprehensive guardrails to prevent server-only secrets from leaking into client bundles. This is a critical security measure that ensures sensitive environment variables like API keys and service role tokens never reach the browser.

## Objectives

- ✅ **Guardrails**: Ensure Supabase Service Role and other server-only secrets are only imported in server modules
- ✅ **Bundle Analyzer**: Add CI step that fails if known server envs appear in client bundles  
- ✅ **Static Rules**: Block `process.env.*` (non-NEXT_PUBLIC) in client code with autofix suggestions
- ✅ **Tests**: Add test that compiles client bundles and asserts absence of server-only envs
- ✅ **Documentation**: Comprehensive do/don't examples and guidelines

## Implementation

### 1. ESLint Rule Configuration

**File:** `eslint.config.js`

Added custom ESLint rule to prevent direct `process.env` access in client code:

```javascript
// Custom rule to prevent server-only env vars in client code
{
  files: ['**/*.{ts,tsx}'],
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'MemberExpression[object.name="process"][property.name="env"]',
        message: 'Direct process.env access is forbidden. Use @lib/env functions instead.',
      },
    ],
  },
},
// Server-only files can use process.env
{
  files: [
    'app/api/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'scripts/**/*.{ts,tsx,mjs}',
    'middleware.ts',
    'next.config.ts',
    'playwright.config.ts',
    'sentry.server.config.ts',
    'sentry.client.config.ts'
  ],
  rules: {
    'no-restricted-syntax': 'off',
  },
},
```

### 2. Bundle Analyzer Script

**File:** `scripts/bundle-analyzer.mjs`

Created comprehensive bundle analyzer that:

- Scans `.next/static/` for client JavaScript bundles
- Detects server-only environment variables
- Provides detailed reporting with file locations
- Fails CI if secrets are found in client bundles

**Server-only environment variables tracked:**
```javascript
const SERVER_ONLY_ENVS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY', 
  'CRON_SECRET',
  'SENTRY_DSN',
  'OPENAI_API_KEY',
  'AI_PROVIDER',
  'AI_MODEL',
  'AI_TEMPERATURE',
  'AI_MAX_TOKENS',
  'DEFAULT_COACH_ID',
  'AI_ENABLED',
];
```

**Allowed client environment variables:**
```javascript
const ALLOWED_CLIENT_ENVS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_DEBUG',
  'NEXT_PUBLIC_SAFE_MODE',
  'NEXT_PUBLIC_ENABLE_AI_LIVE',
  'NEXT_PUBLIC_SENTRY_DSN',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_VERCEL_ENV',
  'NEXT_PUBLIC_DEBUG_OVERLAY',
  'NEXT_PUBLIC_DISABLE_REDIRECTS',
  'NEXT_PUBLIC_AI_ENABLED',
];
```

### 3. Bundle Secrets Test

**File:** `tests/bundle-secrets.spec.ts`

Added comprehensive test suite that:

- Analyzes client bundles for server-only environment variables
- Validates environment variable classification
- Provides detailed error reporting with fix suggestions
- Ensures no unauthorized environment variables in client code

### 4. CI Integration

**Updated:** `package.json`

Added bundle analyzer to CI pipeline:

```json
{
  "scripts": {
    "security:bundle": "node scripts/bundle-analyzer.mjs",
    "ci": "npm run lint && npm run typecheck && npm run security:test && npm run policy:enforce && npm run guard:test && npm run ui:contracts && npm run test && npm run test:policy && npm run test:rls && npm run test:webhooks && npm run test:guardian && npm run test:csp && npm run test:smoke && npm run build && npm run security:bundle"
  }
}
```

## Security Guidelines

### ✅ DO: Safe Environment Variable Usage

#### Server-Side (API Routes, Server Components, Actions)
```typescript
// ✅ CORRECT: Use @lib/env functions
import { getEnv } from '@/lib/env';

export async function serverAction() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getEnv();
  // Use service role key safely
}

// ✅ CORRECT: Direct process.env in server-only files
const apiKey = process.env.RESEND_API_KEY;
```

#### Client-Side (Components, Pages)
```typescript
// ✅ CORRECT: Use @lib/env functions for public envs
import { getPublicEnv } from '@/lib/env';

export default function ClientComponent() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  // Use public env safely
}

// ✅ CORRECT: Use client-side env helper
import { getClientEnv } from '@/lib/env-client';

export default function ClientComponent() {
  const { DEBUG, SAFE_MODE } = getClientEnv();
  // Use client env safely
}
```

### ❌ DON'T: Dangerous Patterns

#### Never in Client Code
```typescript
// ❌ DANGEROUS: Direct process.env in client components
export default function ClientComponent() {
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // LEAKS TO BROWSER!
  const secret = process.env.RESEND_API_KEY; // LEAKS TO BROWSER!
}

// ❌ DANGEROUS: Server secrets in client-side functions
function clientFunction() {
  return process.env.CRON_SECRET; // LEAKS TO BROWSER!
}
```

#### Never Mix Server/Client Code
```typescript
// ❌ DANGEROUS: Conditional server-only code in client components
export default function Component() {
  if (typeof window === 'undefined') {
    // This still gets bundled for client!
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  }
}
```

## Environment Variable Classification

### Server-Only (Never in Client Bundles)
- `SUPABASE_SERVICE_ROLE_KEY` - Database admin access
- `RESEND_API_KEY` - Email service authentication
- `CRON_SECRET` - Internal cron job authentication
- `SENTRY_DSN` - Error tracking service
- `OPENAI_API_KEY` - AI service authentication
- `AI_PROVIDER` - AI service configuration
- `AI_MODEL` - AI model selection
- `AI_TEMPERATURE` - AI response randomness
- `AI_MAX_TOKENS` - AI response length limit
- `DEFAULT_COACH_ID` - Default user assignment
- `AI_ENABLED` - AI feature flag

### Client-Allowed (Safe in Browser)
- `NEXT_PUBLIC_SUPABASE_URL` - Public database URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public database key
- `NEXT_PUBLIC_DEBUG` - Debug mode flag
- `NEXT_PUBLIC_SAFE_MODE` - Safe mode flag
- `NEXT_PUBLIC_ENABLE_AI_LIVE` - AI feature flag
- `NEXT_PUBLIC_SENTRY_DSN` - Public error tracking
- `NEXT_PUBLIC_SITE_URL` - Site URL
- `NEXT_PUBLIC_VERCEL_ENV` - Deployment environment
- `NEXT_PUBLIC_DEBUG_OVERLAY` - Debug overlay flag
- `NEXT_PUBLIC_DISABLE_REDIRECTS` - Redirect control
- `NEXT_PUBLIC_AI_ENABLED` - AI feature flag

### Safe Node.js (Standard Environment)
- `NODE_ENV` - Node.js environment
- `VERCEL_ENV` - Vercel deployment environment
- `CI` - Continuous integration flag

## Testing

### Manual Testing
```bash
# Run bundle analysis
npm run security:bundle

# Run bundle secrets test
npm test tests/bundle-secrets.spec.ts

# Full CI pipeline including bundle analysis
npm run ci
```

### Automated Testing
The bundle secrets test automatically:
- Builds the project if needed
- Analyzes all client JavaScript bundles
- Reports any server-only environment variables found
- Validates environment variable classification
- Provides detailed error messages with fix suggestions

## Error Handling

### Bundle Analysis Failures
When server-only secrets are detected:

```
🚨 CRITICAL: Server-only environment variables found in client bundles:

  SUPABASE_SERVICE_ROLE_KEY:
    - .next/static/chunks/app-sessions-page.js (2 occurrences)

💡 Fix by:
1. Using @lib/env functions instead of direct process.env access
2. Moving server-only code to API routes or server components  
3. Adding "use server" directive for server actions
```

### ESLint Violations
When direct `process.env` access is detected:

```
error: Direct process.env access is forbidden. Use @lib/env functions instead.
```

## Maintenance

### Adding New Environment Variables

1. **Server-only variables**: Add to `SERVER_ONLY_ENVS` arrays in:
   - `scripts/bundle-analyzer.mjs`
   - `tests/bundle-secrets.spec.ts`

2. **Client-allowed variables**: Add to `ALLOWED_CLIENT_ENVS` arrays in:
   - `scripts/bundle-analyzer.mjs`
   - `tests/bundle-secrets.spec.ts`

3. **Update documentation**: Add to appropriate section in this document

### Regular Audits

- Run `npm run security:bundle` before each deployment
- Review bundle analysis reports for new environment variables
- Update classifications as needed
- Test with `npm test tests/bundle-secrets.spec.ts`

## Benefits

### Security
- **Prevents secret leakage**: Server-only secrets never reach client bundles
- **Reduces attack surface**: Minimizes exposed sensitive data
- **Compliance**: Helps meet security audit requirements

### Developer Experience
- **Clear guidelines**: Explicit do/don't patterns
- **Automated detection**: CI fails on violations
- **Helpful errors**: Detailed fix suggestions
- **Type safety**: Environment variable validation

### Reliability
- **Build-time validation**: Catches issues before deployment
- **Comprehensive testing**: Validates all client bundles
- **Regression prevention**: CI ensures ongoing compliance

## Related Documentation

- [Environment Variables Guide](../../lib/env.ts)
- [Security Best Practices](../safety-checklist.md)
- [CI/CD Pipeline](../ci-ai-evaluations.md)
- [Next.js Security](../../next.config.ts)

---

**Next Step:** [Step 12: Demo Isolation](../hardening/STEP12_DEMOS.md) - Isolate demos into `examples/` and package minimal template
