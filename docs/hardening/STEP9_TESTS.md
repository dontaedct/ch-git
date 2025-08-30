# Step 9: Seed Critical Test Suites

**Date**: 2025-08-25  
**Status**: Implemented  
**Previous**: Step 8 - Security Headers & CSP Tightening  
**Next**: Step 10 - n8n Reliability Improvements  

## Overview

This step establishes comprehensive test suites for critical security and functionality areas of the OSS Hero application. The test suites provide automated validation of policy enforcement, security controls, and core application functionality.

## Scope

### 1. Policy Tests (`tests/policy/`)

**Purpose**: Validate import alias enforcement and rename safety rules

**Files**:
- `import-alias.test.ts` - Tests for forbidden import patterns and alias validation
- `rename-rules.test.ts` - Tests for rename safety checks and compat re-exports

**Key Test Areas**:
- Forbidden import patterns (`src/*`, `../`, `../../`, etc.)
- Valid alias usage (`@app/*`, `@lib/*`, `@data/*`, etc.)
- Rename safety with compat re-exports
- Registry change detection
- Policy enforcer integration

**Running**: `npm run test:policy`

### 2. RLS Tests (`tests/rls/`)

**Purpose**: Validate Row Level Security (RLS) policies for tenant isolation

**Files**:
- `tenant-isolation.test.ts` - Tests for tenant data isolation across key tables

**Key Test Areas**:
- Client table RLS enforcement
- Sessions table RLS enforcement
- Check-ins table RLS enforcement
- Weekly plans table RLS enforcement
- Feature flags table RLS enforcement
- Admin access controls
- Anonymous access blocking
- Cross-tenant data access prevention

**Running**: `npm run test:rls`

### 3. Webhook Tests (`tests/webhooks/`)

**Purpose**: Validate webhook security and replay protection

**Files**:
- `verifyHmac.test.ts` - HMAC signature verification tests (existing)
- `integration.test.ts` - Webhook integration tests (existing)
- `idempotency.test.ts` - Idempotency tests (existing)
- `replay-protection.test.ts` - Replay attack prevention tests (new)

**Key Test Areas**:
- HMAC signature verification (valid/invalid)
- Stripe webhook signature validation
- Idempotency key generation and validation
- Replay attack detection
- Time-based replay protection
- Source-specific replay protection
- Error handling and cleanup

**Running**: `npm run test:webhooks`

### 4. Guardian Tests (`tests/guardian/`)

**Purpose**: Validate Guardian system rate limiting and feature flag gating

**Files**:
- `heartbeat-throttling.test.ts` - Rate limiting tests for heartbeat endpoint
- `backup-intent-gating.test.ts` - Feature flag gating tests for backup endpoint

**Key Test Areas**:
- Heartbeat rate limiting (10 requests/minute)
- Backup intent rate limiting (3 requests/hour)
- Feature flag gating (`guardian_enabled`)
- Tenant-specific rate limits
- Anonymous user rate limiting
- Rate limit headers validation
- Authentication requirements
- Error response handling

**Running**: `npm run test:guardian`

### 5. CSP Tests (`tests/csp/`)

**Purpose**: Validate Content Security Policy and security headers

**Files**:
- `security-headers.test.ts` - CSP and security header validation tests

**Key Test Areas**:
- Production CSP headers (strict, no unsafe-inline/unsafe-eval)
- Preview CSP headers (report-only with unsafe-inline/unsafe-eval)
- Third-party service allowlisting
- Security headers validation (X-Content-Type-Options, X-Frame-Options, etc.)
- Route-specific header validation
- Nonce generation and validation
- Environment-specific configuration
- CSP violation reporting

**Running**: `npm run test:csp`

### 6. Playwright Smoke Tests (`tests/playwright/`)

**Purpose**: Basic smoke tests for critical application routes

**Files**:
- `smoke.spec.ts` - Critical route smoke tests (new)
- `security-headers.spec.ts` - Security header validation (existing)

**Key Test Areas**:
- Homepage rendering (`/`)
- Login page accessibility (`/login`)
- Operability page (`/operability`)
- Rollouts page (`/rollouts`)
- Client portal (`/client-portal`)
- Sessions page (`/sessions`)
- Weekly plans page (`/weekly-plans`)
- Trainer profile page (`/trainer-profile`)
- Progress page (`/progress`)
- API endpoint responses
- Error page handling (404s)
- Navigation functionality
- Responsive design (mobile)

**Running**: `npm run test:smoke`

## Test Execution

### Individual Test Suites

```bash
# Policy tests
npm run test:policy

# RLS tests
npm run test:rls

# Webhook tests
npm run test:webhooks

# Guardian tests
npm run test:guardian

# CSP tests
npm run test:csp

# Smoke tests
npm run test:smoke
```

### Full CI Pipeline

```bash
# Complete CI pipeline including all test suites
npm run ci
```

The CI pipeline now includes all test suites in the following order:
1. Linting
2. Type checking
3. Security tests
4. Policy enforcement
5. Guard tests
6. UI contracts
7. Standard tests
8. **Policy tests** (new)
9. **RLS tests** (new)
10. **Webhook tests** (new)
11. **Guardian tests** (new)
12. **CSP tests** (new)
13. **Smoke tests** (new)
14. Build

## Test Fixtures and Mocking

### Mocking Strategy

- **Supabase Client**: Mocked for RLS tests to simulate tenant isolation
- **Rate Limiting**: Mocked for Guardian tests to simulate throttling behavior
- **Feature Flags**: Mocked for Guardian tests to simulate flag gating
- **Webhook Verification**: Mocked for webhook tests to simulate HMAC validation
- **Next.js Modules**: Mocked for CSP tests to simulate header generation

### Test Data

- **Tenant IDs**: `tenant-a`, `tenant-b`, `system`, `anonymous`
- **User IDs**: `tenant-a-user-1`, `tenant-b-user-2`, `admin-user-1`
- **Test Secrets**: `test-secret-key` for HMAC testing
- **Mock Payloads**: Standardized JSON payloads for webhook testing

## Extending the Test Suites

### Adding New Policy Tests

1. Create test file in `tests/policy/`
2. Import required modules and mock dependencies
3. Add test cases for new policy rules
4. Update `package.json` if new test command needed

```typescript
// Example: tests/policy/new-policy.test.ts
describe('New Policy Tests', () => {
  it('should enforce new policy rule', () => {
    // Test implementation
  });
});
```

### Adding New RLS Tests

1. Create test file in `tests/rls/`
2. Mock Supabase client and user context
3. Add test cases for new table RLS policies
4. Test both positive and negative scenarios

```typescript
// Example: tests/rls/new-table.test.ts
describe('New Table RLS Tests', () => {
  it('should enforce tenant isolation for new table', async () => {
    // Mock user and test RLS policy
  });
});
```

### Adding New Webhook Tests

1. Create test file in `tests/webhooks/`
2. Mock webhook verification functions
3. Add test cases for new webhook providers
4. Test security scenarios (replay, signature validation)

```typescript
// Example: tests/webhooks/new-provider.test.ts
describe('New Provider Webhook Tests', () => {
  it('should verify new provider webhook signatures', async () => {
    // Test implementation
  });
});
```

### Adding New Guardian Tests

1. Create test file in `tests/guardian/`
2. Mock rate limiting and feature flag functions
3. Add test cases for new Guardian endpoints
4. Test rate limiting and access control scenarios

```typescript
// Example: tests/guardian/new-endpoint.test.ts
describe('New Guardian Endpoint Tests', () => {
  it('should enforce rate limiting for new endpoint', () => {
    // Test implementation
  });
});
```

### Adding New CSP Tests

1. Create test file in `tests/csp/`
2. Mock header generation functions
3. Add test cases for new security headers
4. Test environment-specific configurations

```typescript
// Example: tests/csp/new-headers.test.ts
describe('New Security Headers Tests', () => {
  it('should include new security header', () => {
    // Test implementation
  });
});
```

### Adding New Smoke Tests

1. Add test cases to `tests/playwright/smoke.spec.ts`
2. Test new routes and functionality
3. Ensure proper error handling and accessibility
4. Test responsive design if applicable

```typescript
// Example: Adding to smoke.spec.ts
test('new page should be accessible', async ({ page }) => {
  await page.goto('/new-page');
  await expect(page.locator('body')).toBeVisible();
});
```

## Test Maintenance

### Regular Updates

- **Monthly**: Review and update test fixtures
- **Quarterly**: Update mock data and test scenarios
- **After major changes**: Add new test cases for changed functionality

### Monitoring Test Health

- Monitor test execution times
- Track test failure rates
- Update tests when dependencies change
- Ensure tests remain relevant to current functionality

### Debugging Failed Tests

1. **Policy Tests**: Check import patterns and alias configuration
2. **RLS Tests**: Verify Supabase client mocking and user context
3. **Webhook Tests**: Check HMAC verification and payload formats
4. **Guardian Tests**: Verify rate limiting configuration and feature flags
5. **CSP Tests**: Check header generation and environment configuration
6. **Smoke Tests**: Verify page accessibility and content presence

## Integration with CI/CD

### Pre-commit Hooks

The test suites are integrated into the pre-commit hooks via the `ci` script, ensuring all tests pass before code is committed.

### GitHub Actions

The test suites run automatically in GitHub Actions as part of the CI pipeline, providing immediate feedback on test failures.

### Local Development

Developers can run individual test suites during development:

```bash
# Run specific test suite
npm run test:policy

# Run all tests
npm run test

# Run with watch mode
npm run test:watch
```

## Security Considerations

### Test Data Security

- No real secrets or credentials in test files
- Mock data only for testing purposes
- No production data in test fixtures

### Test Isolation

- Each test suite runs independently
- No shared state between test suites
- Proper cleanup after each test

### Access Control Testing

- Tests verify proper access controls
- Negative scenarios tested (unauthorized access)
- Edge cases covered (anonymous users, admin access)

## Performance Considerations

### Test Execution Time

- Policy tests: ~2-3 seconds
- RLS tests: ~3-5 seconds
- Webhook tests: ~2-4 seconds
- Guardian tests: ~2-3 seconds
- CSP tests: ~1-2 seconds
- Smoke tests: ~30-60 seconds

### Optimization Strategies

- Parallel test execution where possible
- Mock external dependencies
- Minimize I/O operations in tests
- Use efficient test data structures

## Troubleshooting

### Common Issues

1. **Import Errors**: Check Jest module name mapping in `jest.config.js`
2. **Mock Failures**: Verify mock implementations match actual function signatures
3. **Timeout Issues**: Increase timeout for slow operations
4. **Environment Issues**: Check environment variable configuration

### Debug Commands

```bash
# Run tests with verbose output
npm run test:policy -- --verbose

# Run specific test file
npm run test:policy -- import-alias.test.ts

# Run tests with coverage
npm run test:policy -- --coverage
```

## Future Enhancements

### Planned Improvements

1. **Integration Tests**: Add real database integration tests
2. **Performance Tests**: Add performance benchmarks
3. **Load Tests**: Add load testing for critical endpoints
4. **Security Tests**: Add penetration testing scenarios
5. **Accessibility Tests**: Expand accessibility testing coverage

### Monitoring and Alerting

1. **Test Metrics**: Track test execution metrics
2. **Failure Alerts**: Set up alerts for test failures
3. **Coverage Reports**: Generate and track test coverage
4. **Performance Monitoring**: Monitor test execution performance

## Conclusion

The critical test suites provide comprehensive coverage of security controls, policy enforcement, and core functionality. They serve as a safety net for the hardening process and ensure that security measures remain effective as the application evolves.

The test suites are designed to be maintainable, extensible, and integrated into the development workflow, providing immediate feedback on security and functionality issues.
