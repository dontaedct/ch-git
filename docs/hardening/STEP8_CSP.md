# Step 8: Security Headers & CSP Tightening

**Date**: 2025-08-25  
**Status**: ✅ Implemented  
**Branch**: `hardening/step8-csp-security-20250825`

## Overview

This step implements strict Content Security Policy (CSP) and comprehensive security headers to protect against XSS, clickjacking, and other web vulnerabilities. The implementation separates production (strict enforcement) from preview (report-only learning mode).

## Implementation Details

### 1. Security Headers Configuration

**File**: `next.config.ts`

#### Core Security Headers
- `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking attacks
- `X-XSS-Protection: 1; mode=block` - Enables XSS filtering
- `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()` - Restricts browser APIs

#### CSP Configuration

**Production Environment** (Strict Enforcement):
```javascript
const productionCsp = [
  "default-src 'self'",
  "script-src 'self' 'nonce-{NONCE}'",
  "script-src-elem 'self' 'nonce-{NONCE}'", 
  "style-src 'self' 'nonce-{NONCE}'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.resend.com https://api.stripe.com https://*.sentry.io wss://*.supabase.co",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join("; ") + ";";
```

**Preview Environment** (Report-Only Learning):
```javascript
const previewCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
  "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.resend.com https://api.stripe.com https://*.sentry.io https://vercel.live https://*.vercel.live wss://*.supabase.co wss://vercel.live wss://*.vercel.live",
  "font-src 'self' data:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join("; ") + ";";
```

### 2. Third-Party Service Allowlist

The CSP configuration includes allowlisted domains for legitimate third-party services:

#### Database & Backend
- `https://*.supabase.co` - Supabase API endpoints
- `https://*.supabase.in` - Supabase India region
- `wss://*.supabase.co` - Supabase WebSocket connections

#### Email Services
- `https://api.resend.com` - Resend email API

#### Payment Processing
- `https://api.stripe.com` - Stripe payment API

#### Monitoring & Analytics
- `https://*.sentry.io` - Sentry error tracking

#### Development & Preview
- `https://vercel.live` - Vercel Live Preview
- `https://*.vercel.live` - Vercel Live Preview subdomains
- `wss://vercel.live` - Vercel Live WebSocket
- `wss://*.vercel.live` - Vercel Live WebSocket subdomains

### 3. Automated Validation

#### Security Headers Script
**File**: `scripts/security-headers.mjs`

Validates security headers for key routes:
- `/` (Home)
- `/operability` (Operability dashboard)
- `/sessions` (Sessions management)
- `/api/env-check` (Environment check API)
- `/api/weekly-recap` (Weekly recap API)

**Usage**: 
- `npm run security:headers` - Validate headers with development server
- `npm run security:headers:test` - Run Playwright test suite

#### Test Suite
**File**: `tests/playwright/security-headers.spec.ts`

Comprehensive Playwright tests that:
- Verify all required security headers are present
- Validate CSP content and directives
- Check environment-specific configurations
- Ensure third-party services are properly allowlisted

### 4. Environment Detection

The implementation uses environment variables to determine CSP configuration:

- `NODE_ENV=production` + `VERCEL_ENV!=preview` → Strict production CSP
- `VERCEL_ENV=preview` → Report-only preview CSP
- Development → No CSP (for easier debugging)

## Security Benefits

### 1. XSS Protection
- **Script-src nonce**: Only allows scripts with valid nonces
- **No unsafe-inline**: Prevents inline script execution
- **No unsafe-eval**: Prevents dynamic code evaluation

### 2. Clickjacking Prevention
- **Frame-ancestors 'none'**: Prevents embedding in frames
- **X-Frame-Options: DENY**: Additional frame protection

### 3. Data Exfiltration Prevention
- **Connect-src restrictions**: Limits network requests to allowlisted domains
- **Form-action 'self'**: Restricts form submissions to same origin

### 4. Content Injection Prevention
- **Object-src 'none'**: Prevents plugin execution
- **Base-uri 'self'**: Restricts base tag URLs

## Adding New Third-Party Services

When integrating new third-party services, update the CSP configuration:

### 1. Identify Required Directives
- **Scripts**: Add to `script-src` and `script-src-elem`
- **Styles**: Add to `style-src`
- **Images**: Add to `img-src`
- **API calls**: Add to `connect-src`
- **Fonts**: Add to `font-src`

### 2. Update Configuration
Edit `next.config.ts` and add the domain to the appropriate directive:

```javascript
// Example: Adding Google Analytics
"script-src 'self' 'nonce-{NONCE}' https://www.googletagmanager.com",
"connect-src 'self' https://*.supabase.co https://www.google-analytics.com",
```

### 3. Test Configuration
Run the validation tools:
```bash
npm run security:headers
npm run test tests/security-headers.spec.ts
```

### 4. Update Documentation
Add the new service to this documentation and update the allowlist section.

## Troubleshooting

### Common Issues

#### 1. CSP Violations in Production
**Symptom**: Console errors about CSP violations
**Solution**: 
- Check browser console for specific violations
- Add required domains to appropriate CSP directives
- Use nonces for inline scripts/styles

#### 2. Third-Party Service Blocked
**Symptom**: API calls or resources failing to load
**Solution**:
- Verify domain is in correct CSP directive
- Check for subdomain wildcards (use `*.domain.com`)
- Ensure protocol is specified (`https://`)

#### 3. Development Issues
**Symptom**: Hot reload or development tools not working
**Solution**:
- Development mode should have relaxed CSP
- Check `NODE_ENV` and `VERCEL_ENV` values
- Verify middleware isn't overriding CSP

### Debugging Tools

#### 1. Browser Developer Tools
- **Console**: Shows CSP violation reports
- **Network**: Shows blocked requests
- **Security**: Shows security headers

#### 2. CSP Evaluator
- Use online CSP evaluators to test policies
- Validate against known security best practices

#### 3. Security Headers Script
```bash
npm run security:headers
```

## Migration Notes

### From Previous Implementation
- Removed CSP configuration from `middleware.ts`
- Consolidated all header configuration in `next.config.ts`
- Added environment-specific CSP policies
- Implemented comprehensive validation tools

### Breaking Changes
- Production CSP now blocks `unsafe-inline` and `unsafe-eval`
- All inline scripts/styles require nonces
- Third-party services must be explicitly allowlisted

## Next Steps

### Step 9: Critical Test Suites
- Policy enforcement tests
- RLS (Row Level Security) tests  
- Webhook security tests
- Guardian system tests
- CSP violation monitoring

### Future Enhancements
- CSP violation reporting endpoint
- Dynamic nonce generation
- Subresource Integrity (SRI) for external resources
- Content Security Policy Level 3 features

## References

- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
