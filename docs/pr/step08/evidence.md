# Step 08 Evidence - CSP/Headers

## Content Security Policy Implementation

### Production CSP Configuration
- **Purpose**: Strict CSP for production environment
- **Features**: 
  - Nonce-based script and style loading
  - Restricted third-party access
  - Frame protection with frame-ancestors 'none'
  - Object and base URI restrictions

### CSP Directives
```typescript
const productionCSP = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{nonce}'",
  "style-src 'self' 'nonce-{nonce}'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io",
  "frame-src 'self' https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');
```

### Preview CSP Configuration
- **Purpose**: Report-only CSP for preview/development environment
- **Features**: 
  - Report-only mode for development
  - Unsafe-inline and unsafe-eval for development
  - Same third-party service access
  - Violation reporting without blocking

### Preview CSP Directives
```typescript
const previewCSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.resend.com https://*.sentry.io",
  "frame-src 'self' https://js.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');
```

## Security Headers Implementation

### Core Security Headers
- **X-Content-Type-Options**: nosniff - Prevents MIME sniffing attacks
- **X-Frame-Options**: DENY - Prevents clickjacking attacks
- **X-XSS-Protection**: 1; mode=block - XSS protection for older browsers
- **Referrer-Policy**: strict-origin-when-cross-origin - Privacy protection
- **Permissions-Policy**: Restrictive permissions for sensitive APIs

### Security Headers Configuration
```typescript
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
};
```

### Third-party Service Access
- **Supabase**: https://*.supabase.co for database and auth
- **Stripe**: https://api.stripe.com and https://js.stripe.com for payments
- **Resend**: https://api.resend.com for email services
- **Sentry**: https://*.sentry.io for error monitoring

## Security Header Testing

### CSP Tests (`tests/csp/security-headers.test.ts`)
- **Purpose**: Comprehensive CSP and security header validation
- **Features**: 
  - Production vs preview CSP testing
  - Security header validation
  - Route-specific header testing
  - Nonce generation and validation
  - CSP violation reporting tests

### Test Categories
1. **Content Security Policy Headers**: CSP directive validation
2. **Security Headers Validation**: Core security header testing
3. **Route-specific Header Validation**: Critical route testing
4. **Nonce Generation and Validation**: Nonce security testing
5. **Environment-specific Configuration**: Production vs preview testing
6. **Header Validation Script Integration**: Automated validation testing
7. **CSP Violation Reporting**: Violation handling tests

### Critical Routes Tested
- `/` - Home page
- `/login` - Authentication page
- `/operability` - Admin interface
- `/rollouts` - Feature rollouts
- `/api/guardian/heartbeat` - Guardian system
- `/api/guardian/backup-intent` - Backup system
- `/api/webhooks/stripe` - Stripe webhooks
- `/api/webhooks/generic` - Generic webhooks

## Security Header Validation Script

### Validation Script (`scripts/security-headers.mjs`)
- **Purpose**: Automated security header validation
- **Features**: 
  - Development server startup and testing
  - Route-by-route header validation
  - CSP content validation
  - Missing header detection
  - Environment-specific validation

### Validation Process
1. **Server Startup**: Start development server
2. **Route Testing**: Test each critical route
3. **Header Validation**: Check required security headers
4. **CSP Validation**: Validate CSP content and mode
5. **Summary Report**: Generate validation summary
6. **Error Handling**: Exit with error code on failures

### Required Headers
- `x-content-type-options`
- `x-frame-options`
- `x-xss-protection`
- `referrer-policy`
- `permissions-policy`

### CSP Headers
- `content-security-policy` (production)
- `content-security-policy-report-only` (preview)

## Nonce Generation and Management

### Secure Nonce Generation
```typescript
const generateNonce = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(16).toString('base64');
};
```

### Nonce Integration
- **CSP Directives**: Nonces included in script-src and style-src
- **Dynamic Generation**: Unique nonces per request
- **Security Validation**: Nonce format and randomness validation
- **CSP Compliance**: Nonces ensure CSP compliance for inline content

### Nonce Validation
- **Format Check**: Base64 encoded random bytes
- **Uniqueness**: Each nonce is unique per request
- **Length Validation**: Appropriate nonce length
- **CSP Integration**: Nonces properly included in CSP directives

## Environment-specific Configuration

### Production Environment
- **Strict CSP**: No unsafe-inline or unsafe-eval
- **Nonce-based**: All inline content requires nonces
- **Enforcement**: CSP violations are blocked
- **Reporting**: CSP violations reported to endpoint

### Preview Environment
- **Report-only CSP**: Violations reported but not blocked
- **Development-friendly**: Unsafe-inline and unsafe-eval allowed
- **Testing**: Allows development and testing workflows
- **Monitoring**: Violations logged for analysis

### Development Environment
- **Relaxed CSP**: Unsafe-inline and unsafe-eval for development
- **Hot Reload**: Supports Next.js hot reload functionality
- **Debugging**: Easier debugging with relaxed policies
- **Local Testing**: Supports local development workflows

## CSP Violation Reporting

### Violation Report Endpoint
- **Endpoint**: `/api/csp-report`
- **Method**: POST
- **Content-Type**: application/csp-report
- **Processing**: Log violations for analysis

### Violation Report Structure
```typescript
interface CSPViolationReport {
  'csp-report': {
    'document-uri': string;
    'referrer': string;
    'violated-directive': string;
    'effective-directive': string;
    'original-policy': string;
    'disposition': 'enforce' | 'report';
    'blocked-uri': string;
    'line-number': number;
    'column-number': number;
    'source-file': string;
  };
}
```

### Violation Handling
- **Logging**: Violations logged for analysis
- **Monitoring**: Violation patterns monitored
- **Alerting**: High violation rates trigger alerts
- **Policy Updates**: Violations inform CSP policy updates

## Implementation Rationale

### Why Strict CSP?
1. **XSS Protection**: Prevents cross-site scripting attacks
2. **Code Injection**: Blocks malicious script injection
3. **Data Exfiltration**: Prevents unauthorized data access
4. **Compliance**: Meets security best practices

### Why Security Headers?
1. **Clickjacking Protection**: X-Frame-Options prevents clickjacking
2. **MIME Sniffing**: X-Content-Type-Options prevents MIME attacks
3. **XSS Protection**: X-XSS-Protection provides additional XSS protection
4. **Privacy**: Referrer-Policy protects user privacy

### Why Automated Testing?
1. **Regression Prevention**: Prevents security header regressions
2. **Compliance**: Ensures consistent security implementation
3. **Validation**: Automated validation of security policies
4. **Monitoring**: Continuous security monitoring

## Verification Commands

```bash
# Test CSP and security headers
npm run test:csp

# Validate security headers
npm run security:headers

# Test security header validation
npm run security:headers:test

# Test CSP violation reporting
npm run test -- --testNamePattern="csp.*violation"
```

## Related Files

- `tests/csp/security-headers.test.ts` - CSP and security header tests
- `scripts/security-headers.mjs` - Security header validation script
- `middleware.ts` - Security header middleware
- `next.config.ts` - CSP configuration
- `lib/security/headers.ts` - Security header utilities
- `docs/CHANGE_JOURNAL.md` - Change tracking

## Success Criteria

- ✅ Strict CSP implemented for production
- ✅ Report-only CSP for preview environment
- ✅ Comprehensive security headers active
- ✅ Nonce generation and validation working
- ✅ CSP violation reporting functional
- ✅ Automated testing comprehensive
- ✅ Route coverage complete
- ✅ Environment-specific configuration active

## Integration Points

### Prerequisites
- **Step 01**: Baseline establishment (security foundation)
- **Step 02**: TypeScript strictness (type-safe security)
- **Step 03**: Environment validation (environment detection)
- **Step 04**: Webhook security (secure API endpoints)
- **Step 05**: Feature flags (flag-controlled security)
- **Step 06**: Scheduling optimization (security monitoring)
- **Step 07**: CI gate (security testing in CI)

### Enables
- **Step 09**: Seeds tests (security test infrastructure)
- **Step 10**: n8n hardening (secure workflow integration)

### Dependencies
- **Next.js**: Middleware and configuration
- **Crypto**: Nonce generation
- **Testing**: Jest and Playwright
- **Monitoring**: CSP violation reporting
