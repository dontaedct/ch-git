# Change Journal

## 2025-08-25 - OSS Hero Hardening Step 13: Developer Ergonomics & Script Hygiene

**What**: Improved developer experience through script organization, ESM/CJS hygiene enforcement, and comprehensive troubleshooting support with minimal top-level commands and organized tool namespace

**Why**: Reduce cognitive load for developers, maintain consistent ESM usage, and provide self-service troubleshooting to improve productivity and reduce support burden

**Scope**:
- Reorganized package.json scripts with only 7 essential top-level commands and moved advanced commands under `tool:*` namespace
- Created comprehensive `npm run help` command with 6 organized sections: Essential Flows, Common Tools, Dev Management, Refactoring, Testing, UI/Design
- Enhanced ESM/CJS hygiene with pre-commit check blocking `require()` in `.js` files and removed duplicate `.js` files with `.mjs` equivalents
- Improved README.md with one-command development setup and comprehensive troubleshooting section covering ESM errors, missing envs, TypeScript issues, server problems, security concerns, and database issues
- Created `docs/hardening/STEP13_DX.md` documenting script reorganization, help system implementation, and ESM enforcement patterns
- Maintained all existing functionality while improving discoverability and reducing cognitive load

**Migration**:
- Use `npm run help` to discover new command organization and available tools
- Access advanced commands under `tool:*` namespace (e.g., `npm run tool:doctor`, `npm run tool:security:secrets`)
- Follow one-command setup: `git clone && npm install && cp .env.example .env.local && npm run dev`
- Reference troubleshooting section in README.md for common issues and solutions
- Ensure any `.js` files use proper ESM syntax or rename to `.mjs` for clarity

**Impact**:
- Reduced cognitive load with only 7 essential top-level commands vs. previous scattered structure
- Improved discoverability through organized help system with 6 logical categories
- Enforced ESM consistency with pre-commit protection against CommonJS usage
- Enhanced developer onboarding with clear setup instructions and troubleshooting guide
- Maintained all existing functionality while improving organization and accessibility
- Zero breaking changes - all commands preserved under new organization

**Files Modified**:
- `package.json` - Script reorganization with minimal top-level commands and tool:* namespace
- `scripts/help.mjs` - New comprehensive help system with organized command categories
- `scripts/pre-commit-esm-check.mjs` - Enhanced ESM enforcement with CommonJS pattern detection
- `README.md` - Improved developer experience with one-command setup and troubleshooting guide
- `docs/hardening/STEP13_DX.md` - Complete documentation of Step 13 implementation and patterns

**Files Removed**:
- `scripts/build-robust.js` - Duplicate of .mjs version
- `scripts/dev-bootstrap.js` - Duplicate of .mjs version
- `scripts/dev-manager.js` - Duplicate of .mjs version
- `scripts/guardian.js` - Duplicate of .mjs version
- `scripts/pre-commit-check.js` - Duplicate of .mjs version

## 2025-08-25 - OSS Hero Hardening Step 12: Template Isolation & Packaging

**What**: Isolated demo routes from core template and created minimal, reusable template for new micro applications with scaffold script and comprehensive documentation

**Why**: Reduce template complexity, improve reusability, and provide clear separation between core functionality and demonstration code for better maintainability

**Scope**:
- Moved demo routes to `examples/` directory: auto-save-demo, guardian-demo, design-system, ai-live, test-routes
- Removed debug routes: debug/, _debug/ for cleaner core template
- Created `bin/create-micro-app.mjs` scaffold script for generating new micro apps
- Built `TEMPLATE_README.md` with comprehensive quickstart guide and per-client setup steps
- Established minimal template structure with only essential routes: /login, /operability, /api/health, /api/ping, /api/webhooks
- Created `docs/hardening/STEP12_TEMPLATE.md` documenting template isolation process and usage
- Maintained all security features: RLS, CSP headers, bundle analysis, environment variable protection

**Migration**:
- Use `node bin/create-micro-app.mjs <app-name>` to create new micro apps from template
- Copy `env.example` to `.env.local` and configure Supabase credentials
- Run `npm install && npm run dev` to start development
- Access demo functionality in `examples/` directory for reference
- Follow `TEMPLATE_README.md` for complete setup and customization guide

**Impact**:
- Reduced core template complexity by removing demo and debug routes
- Improved template reusability with automated scaffold script
- Better organization with clear separation between core and demo functionality
- Enhanced developer experience with comprehensive documentation and quickstart guide
- Maintained all security hardening measures from previous steps
- Zero breaking changes - all demos preserved in examples/ directory

**Files Modified**:
- `bin/create-micro-app.mjs` - New scaffold script for creating micro apps
- `TEMPLATE_README.md` - Comprehensive template documentation and quickstart guide
- `docs/hardening/STEP12_TEMPLATE.md` - Step 12 implementation documentation
- `examples/auto-save-demo/page.tsx` - Moved from app/auto-save-demo/
- `examples/guardian-demo/page.tsx` - Moved from app/guardian-demo/
- `examples/design-system/page.tsx` - Moved from app/design-system/
- `examples/ai-live/page.tsx` - Moved from app/ai/live/
- `examples/test-routes/` - Consolidated test routes from app/test*, app/test-probe*, app/test-simple*

**Files Removed**:
- `app/auto-save-demo/` - Moved to examples/
- `app/guardian-demo/` - Moved to examples/
- `app/design-system/` - Moved to examples/
- `app/ai/` - Moved to examples/
- `app/test/` - Moved to examples/
- `app/test-probe/` - Moved to examples/
- `app/test-simple/` - Moved to examples/
- `app/debug/` - Removed debug routes
- `app/_debug/` - Removed debug routes

## 2025-08-25 - OSS Hero Hardening Step 11: Secrets & Bundle Leakage Guard

**What**: Implemented comprehensive guardrails to prevent server-only secrets from leaking into client bundles with ESLint rules, bundle analyzer, and automated testing

**Why**: Ensure sensitive environment variables like API keys and service role tokens never reach the browser, preventing security vulnerabilities and data breaches

**Scope**:
- Added custom ESLint rule in `eslint.config.js` to block direct `process.env` access in client code with autofix suggestions
- Created `scripts/bundle-analyzer.mjs` for comprehensive bundle analysis detecting server-only environment variables in client bundles
- Implemented `tests/bundle-secrets.spec.ts` for automated validation of bundle security with detailed error reporting
- Updated CI pipeline in `package.json` to include bundle analysis step (`npm run security:bundle`)
- Created comprehensive documentation in `docs/hardening/STEP11_SECRETS.md` with do/don't examples and security guidelines
- Established environment variable classification system with server-only, client-allowed, and safe Node.js categories
- Added detailed error handling with fix suggestions for bundle analysis failures and ESLint violations

**Migration**:
- Run `npm run security:bundle` to analyze existing bundles for server-only secrets
- Update any client code using direct `process.env` access to use `@lib/env` functions instead
- Add new environment variables to appropriate classification arrays in bundle analyzer and tests
- Configure ESLint rules for your development environment to catch violations early
- Review bundle analysis reports before each deployment to ensure no secrets are leaked

**Impact**:
- Prevents server-only secrets from reaching client bundles through comprehensive static analysis
- Provides clear developer guidelines with explicit do/don't patterns for environment variable usage
- Automates security validation in CI pipeline with detailed error reporting and fix suggestions
- Establishes environment variable classification system for ongoing security management
- Zero breaking changes - all guardrails are additive and provide helpful error messages
- Comprehensive documentation and testing ensure long-term maintainability and security compliance

**Files Modified**:
- `eslint.config.js` - Added custom ESLint rule to block direct process.env access in client code
- `scripts/bundle-analyzer.mjs` - New bundle analyzer script for detecting server-only secrets
- `tests/bundle-secrets.spec.ts` - New comprehensive test suite for bundle security validation
- `package.json` - Added security:bundle script and updated CI pipeline
- `docs/hardening/STEP11_SECRETS.md` - Complete documentation with security guidelines and examples

## 2025-08-25 - OSS Hero Hardening Step 10: n8n Reliability Controls

**What**: Implemented comprehensive reliability controls for n8n workflows including exponential backoff with jitter, per-tenant circuit breakers, dead letter queues, parametrized concurrency limits, and Stripe replay protection

**Why**: Provide enterprise-grade resilience for automated workflows, prevent cascade failures, and ensure high availability of n8n-based automation processes

**Scope**:
- Created `lib/n8n/reliability.ts` with comprehensive reliability controller including exponential backoff, circuit breakers, DLQ, concurrency limits, and Stripe replay protection
- Implemented database schema (`supabase/migrations/20250825_n8n_reliability.sql`) for DLQ, circuit breaker state, concurrency tracking, and Stripe event ledger
- Built API endpoints (`app/api/n8n/reliability/`) for status monitoring, circuit breaker management, DLQ operations, and Stripe replay protection
- Created example n8n workflow (`n8n/workflows/notify-gap-fill.json`) demonstrating reliability controls with skip logic and error handling
- Added comprehensive documentation (`n8n/README.md` and `docs/hardening/STEP10_N8N.md`) covering configuration, monitoring, and troubleshooting
- Implemented per-tenant isolation for all reliability controls with configurable thresholds and policies

**Migration**:
- Run `supabase migration up` to create reliability control tables and functions
- Configure environment variables for n8n reliability settings (N8N_MAX_RETRIES, N8N_CIRCUIT_BREAKER_THRESHOLD, etc.)
- Update existing n8n workflows to use reliability wrapper functions
- Set up monitoring dashboards for circuit breaker states, DLQ statistics, and concurrency utilization
- Configure alerting for circuit breaker activations, high DLQ volumes, and performance degradation

**Impact**:
- Enterprise-grade reliability controls for n8n workflows with tenant isolation
- Exponential backoff with jitter prevents thundering herd problems and reduces server load
- Per-tenant circuit breakers isolate failing tenants and prevent cascade failures
- Dead letter queue with TTL provides automatic cleanup and retry capabilities for failed messages
- Parametrized concurrency limits prevent resource exhaustion and ensure fair allocation
- Stripe replay protection prevents duplicate processing of webhook events
- Comprehensive monitoring and alerting for proactive issue detection and resolution
- Zero breaking changes - all reliability controls are additive and configurable

**Files Modified**:
- `lib/n8n/reliability.ts` - Main reliability controller with all reliability features
- `supabase/migrations/20250825_n8n_reliability.sql` - Database schema for reliability controls
- `app/api/n8n/reliability/status/route.ts` - Status and statistics API endpoint
- `app/api/n8n/reliability/circuit-breaker/reset/route.ts` - Circuit breaker reset API
- `app/api/n8n/reliability/dlq/route.ts` - Dead letter queue management API
- `app/api/n8n/reliability/stripe-replay/route.ts` - Stripe replay protection API
- `n8n/workflows/notify-gap-fill.json` - Example workflow with reliability controls
- `n8n/README.md` - Comprehensive n8n reliability documentation
- `docs/hardening/STEP10_N8N.md` - Complete implementation guide and best practices

## 2025-08-25 - OSS Hero Hardening Step 9: Seed Critical Test Suites

**What**: Implemented comprehensive test suites for critical security and functionality areas with automated validation

**Why**: Establish automated testing foundation for policy enforcement, security controls, and core application functionality to ensure hardening measures remain effective

**Scope**:
- Created policy tests (`tests/policy/`) for import alias enforcement and rename safety rules
- Implemented RLS tests (`tests/rls/`) for tenant isolation validation across key database tables
- Enhanced webhook tests (`tests/webhooks/`) with replay protection and HMAC validation scenarios
- Built Guardian tests (`tests/guardian/`) for rate limiting and feature flag gating validation
- Added CSP tests (`tests/csp/`) for security header validation and Content Security Policy enforcement
- Created Playwright smoke tests (`tests/playwright/smoke.spec.ts`) for critical route accessibility
- Updated CI pipeline to include all new test suites in `npm run ci` command
- Comprehensive documentation in `docs/hardening/STEP9_TESTS.md` with extension guidelines

**Migration**:
- Run `npm run test:policy` to validate import alias and rename rules
- Run `npm run test:rls` to validate tenant isolation policies
- Run `npm run test:webhooks` to validate webhook security measures
- Run `npm run test:guardian` to validate Guardian system controls
- Run `npm run test:csp` to validate security headers and CSP
- Run `npm run test:smoke` to validate critical route accessibility
- Use `npm run ci` for complete test suite execution in CI/CD

**Impact**:
- Automated validation of all critical security controls and policy enforcement
- Comprehensive test coverage for tenant isolation, webhook security, and Guardian system
- Integrated test suites in CI pipeline providing immediate feedback on security issues
- Extensible test framework for future security and functionality testing
- Clear documentation and guidelines for maintaining and extending test suites
- Zero breaking changes - all tests are additive and non-intrusive

**Files Modified**:
- `tests/policy/import-alias.test.ts` - New import alias enforcement tests
- `tests/policy/rename-rules.test.ts` - New rename safety rule tests
- `tests/rls/tenant-isolation.test.ts` - New RLS tenant isolation tests
- `tests/webhooks/replay-protection.test.ts` - New webhook replay protection tests
- `tests/guardian/heartbeat-throttling.test.ts` - New Guardian rate limiting tests
- `tests/guardian/backup-intent-gating.test.ts` - New Guardian feature flag tests
- `tests/csp/security-headers.test.ts` - New CSP and security header tests
- `tests/playwright/smoke.spec.ts` - New critical route smoke tests
- `package.json` - Added new test scripts and updated CI pipeline
- `docs/hardening/STEP9_TESTS.md` - Complete test suite documentation

## 2025-08-25 - OSS Hero Hardening Step 8: Security Headers & CSP Tightening

**What**: Implemented strict Content Security Policy and comprehensive security headers with environment-specific configurations

**Why**: Protect against XSS, clickjacking, and other web vulnerabilities while maintaining development flexibility

**Scope**:
- Updated `next.config.ts` with strict production CSP (no unsafe-inline/unsafe-eval) and report-only preview CSP
- Added comprehensive security headers: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- Removed conflicting CSP configuration from `middleware.ts` to centralize in next.config.ts
- Created `scripts/security-headers.mjs` for automated header validation across key routes
- Added `npm run security:headers` script for development and CI validation
- Implemented comprehensive test suite `tests/playwright/security-headers.spec.ts` with Playwright
- Allowlisted legitimate third-party services: Supabase, Resend, Stripe, Sentry, Vercel Live
- Comprehensive documentation in `docs/hardening/STEP8_CSP.md` with troubleshooting guide

**Migration**:
- Production deployments now enforce strict CSP without unsafe-inline/unsafe-eval
- Preview deployments use Content-Security-Policy-Report-Only for learning
- All inline scripts/styles require nonces in production
- Third-party services must be explicitly allowlisted in CSP directives
- Use `npm run security:headers` to validate header configuration

**Breaking Changes**:
- Production CSP blocks unsafe-inline and unsafe-eval
- Inline scripts/styles require nonces in production
- Third-party services must be allowlisted

**Files Modified**:
- `next.config.ts` - Comprehensive security headers and CSP configuration
- `middleware.ts` - Removed conflicting CSP configuration
- `package.json` - Added security:headers script
- `scripts/security-headers.mjs` - New header validation script
- `tests/playwright/security-headers.spec.ts` - New comprehensive test suite
- `docs/hardening/STEP8_CSP.md` - Complete implementation documentation

## 2025-08-25 - OSS Hero Hardening Step 7: Single CI Gate & Script Simplification

**What**: Established single comprehensive CI gate and simplified script ecosystem with ESM enforcement

**Why**: Create streamlined development workflow with consistent quality gates and modern module system standards

**Scope**: 
- Reorganized npm scripts into minimal happy-path (`dev`, `check`, `ci`, `security:test`) and tool namespace (`tool:*`)
- Converted core scripts to ESM: `dev-bootstrap.mjs`, `dev-manager.mjs`, `build-robust.mjs`, `test-doctor.mjs`
- Added pre-commit ESM validation to prevent `require()` statements in `.js` files
- Updated CI workflow to single `npm run ci` command with comprehensive sequence: lint → typecheck → security → policy → guard → UI → tests → build
- Created weekly scheduled workflow for dependency monitoring (`npm outdated --json`) and slow type checking (`skipLibCheck: false`)
- Enhanced Husky pre-commit hooks with ESM compliance checking
- Comprehensive documentation in `docs/hardening/STEP7_CI.md`

**Migration**: 
- Use `npm run dev`, `npm run check`, `npm run ci` for common operations
- Legacy tools now under `tool:*` namespace (e.g., `npm run tool:doctor`)
- Convert any remaining `.js` files with `require()` to ESM (`.mjs`) or CommonJS (`.cjs`)
- CI/CD should use single `npm run ci` command instead of individual steps

**Impact**: 
- Simplified development workflow with clear separation of concerns
- ESM standardization across all scripts with automated validation
- Single comprehensive CI gate blocking merges until all quality checks pass
- Automated weekly monitoring of dependencies and comprehensive type checking
- Clear distinction between happy-path scripts and admin/tool scripts
- Zero breaking changes for properly structured code

## 2025-08-25 - OSS Hero Hardening Step 6: Thin Guardian + Externalized Schedules (Cron/n8n)

**What**: Converted Guardian system from heavy in-app monitoring to thin, externally-scheduled service with proper rate limiting and observability

**Why**: Reduce in-app load, improve scalability, and provide better monitoring and alerting capabilities through external scheduling

**Scope**: 
- Created thin Guardian endpoints: `/api/guardian/heartbeat` (health checks) and `/api/guardian/backup-intent` (backup operations)
- Implemented per-tenant rate limiting with 429 responses: 10 requests/minute for heartbeat, 3 requests/hour for backups
- Added structured logging with operation context, tenant ID, results, and duration tracking
- Built Slack notification system for Guardian failures with configurable webhook URLs
- Removed in-app intervals from Guardian dashboard (30-second auto-refresh eliminated)
- Created comprehensive rate limiting utilities in `lib/rate-limit.ts` with tenant isolation
- Added structured logging utilities in `lib/guardian/structured-logger.ts` with operation context
- Implemented Slack notification utilities in `lib/notifications/slack.ts` for failure alerting
- Updated Guardian dashboard to use new backup-intent endpoint with rate limit handling
- Created extensive documentation in `docs/hardening/STEP6_GUARDIAN_THIN.md` with Vercel Cron and n8n examples

**Migration**: 
- Guardian dashboard no longer auto-refreshes - external schedulers handle monitoring
- Backup operations now use `/api/guardian/backup-intent` endpoint with rate limiting
- Set up external scheduling via Vercel Cron, n8n, or custom cron services
- Configure `SLACK_WEBHOOK_URL` environment variable for failure notifications
- Update monitoring systems to call `/api/guardian/heartbeat` endpoint instead of internal checks

**Impact**: 
- Reduced in-app resource usage by eliminating 30-second intervals and heavy operations
- Improved scalability with per-tenant rate limiting and proper 429 responses
- Enhanced observability with structured logging and Slack notifications
- Better security with feature flag validation and tenant isolation
- External scheduling flexibility for different deployment environments
- Comprehensive monitoring and alerting capabilities for Guardian operations

## 2025-08-25 - OSS Hero Hardening Step 5: Single Source of Truth for Feature Flags (Supabase)

**What**: Implemented centralized feature flag management system with Supabase backend, replacing file-based and ad-hoc flag sources

**Why**: Consolidate feature flag management into a single, tenant-aware system with proper access controls and caching

**Scope**: 
- Created `feature_flags` table with tenant-based RLS policies and admin access controls
- Implemented `lib/flags/server.ts` with in-memory caching, edge-safe fetchers, and comprehensive flag management
- Built admin UI at `/app/operability/flags` for per-tenant flag management with real-time toggles
- Added API endpoints `/api/admin/flags` for programmatic flag management
- Created migration script `scripts/migrate-flags.ts` to move existing file-based flags to Supabase
- Updated `lib/supabase/types.ts` with FeatureFlag types and database schema
- Added comprehensive documentation in `docs/hardening/STEP5_FLAGS.md`
- Deprecated file-based flags in `lib/registry/flags.ts` with migration notices

**Migration**: 
- Run database migration `supabase/migrations/20250825_feature_flags.sql` to create feature_flags table
- Execute `npx tsx scripts/migrate-flags.ts` to migrate existing flags to Supabase
- Update code to use `lib/flags/server.ts` instead of file-based flag access
- Configure admin users with `role: 'admin'` in user metadata for flag management access

**Impact**: 
- All feature flags now managed centrally in Supabase with tenant isolation
- 5-minute in-memory caching for performance with automatic invalidation
- Admin UI for real-time flag management without code deployments
- Edge-safe flag access for serverless environments
- Comprehensive RLS policies ensuring tenant data isolation
- Zero breaking changes for existing flag consumers (graceful fallback)

## 2025-08-25 - OSS Hero Hardening Step 4: Webhook Security Spine (HMAC + Idempotency)

**What**: Implemented comprehensive webhook security infrastructure with HMAC signature verification and idempotency protection

**Why**: Prevent webhook replay attacks, ensure message integrity, and provide uniform security across all webhook endpoints

**Scope**: 
- Created `lib/webhooks/verifyHmac.ts` for constant-time SHA-256 HMAC signature verification
- Implemented `lib/webhooks/idempotency.ts` with event deduplication and automatic cleanup
- Built `lib/webhooks/index.ts` with uniform security wrappers (`withVerifiedWebhook`, `withStripeWebhook`, etc.)
- Added example webhook routes: `app/api/webhooks/stripe/route.ts` and `app/api/webhooks/generic/route.ts`
- Created database migration `supabase/migrations/20250825_webhook_idempotency.sql` for idempotency tracking
- Implemented comprehensive test suite: `tests/webhooks/` with unit, integration, and security tests
- Added documentation in `docs/hardening/STEP4_WEBHOOKS.md` covering security headers, HMAC schemes, and test strategy

**Migration**: 
- Run database migration to create `webhook_idempotency` table
- Set webhook secret environment variables (e.g., `STRIPE_WEBHOOK_SECRET`, `GITHUB_WEBHOOK_SECRET`)
- Wrap existing webhook handlers with security functions
- Update webhook provider configurations to use new security headers

**Impact**: 
- All webhook endpoints now have HMAC signature verification with timing attack protection
- Automatic replay attack prevention through idempotency tracking
- Stripe-specific verification with timestamp validation (5-minute window)
- Configurable security for different webhook providers
- Comprehensive test coverage for security scenarios
- Zero breaking changes for properly configured webhook secrets

## 2025-08-25 - OSS Hero Hardening Step 3: Environment Completeness & Fail-Fast Configuration

**What**: Implemented comprehensive environment variable management with fail-fast validation and secret hygiene

**Why**: Ensure critical configuration is present and properly scoped before application starts, prevent hardcoded secrets

**Scope**: 
- Created complete `env.example` with all operational environment variables and documentation
- Implemented `lib/config/requireEnv.ts` for fail-fast environment validation at boot
- Added CI environment validation script `scripts/check-env.ts` with dummy placeholders
- Created security secrets scanner `scripts/security-secrets.ts` to detect hardcoded secrets
- Integrated environment validation into `next.config.ts` for early boot validation
- Added npm scripts: `check:env` and `security:secrets`
- Created comprehensive documentation in `docs/hardening/STEP3_ENV.md`

**Migration**: 
- Copy `env.example` to `.env.local` and fill in your actual values
- Run `npm run check:env` to validate environment configuration
- Run `npm run security:secrets` to scan for hardcoded secrets
- Update CI/CD to include environment validation steps

**Impact**: 
- Application will fail to start with missing critical environment variables
- Automated detection of hardcoded secrets and security issues
- Proper environment variable scoping (server vs client)
- CI-safe validation with dummy placeholders
- Zero breaking changes for properly configured environments

## 2025-08-25 - OSS Hero Hardening Step 2: TypeScript Strictness & Build-Time TS Checks

**What**: Implemented TypeScript strictness ratchet and build-time type checking enforcement

**Why**: Establish strict type safety without breaking existing functionality, enabling systematic type hardening

**Scope**: 
- Re-enabled build-time TypeScript enforcement in `next.config.ts`
- Ratcheted TS strictness with `noImplicitAny: true` and `strict: true`
- Disabled `allowJs` in main codebase, created separate `tsconfig.scripts.json`
- Added comprehensive ESLint rules preventing `any` usage (with exceptions)
- Enhanced pre-commit hooks with zero-warnings policy
- Added weekly CI job for comprehensive type checking (`skipLibCheck: false`)
- Created `tsconfig.scripts.json` for legacy script compatibility

**Migration**: 
- Existing code with implicit `any` types will now show TypeScript errors
- JavaScript files in main codebase need conversion to TypeScript
- AI-related files and scripts have relaxed rules to maintain compatibility

**Impact**: 
- Build failures on TypeScript errors (previously ignored)
- Stricter type checking in development and CI
- Pre-commit hooks now enforce type safety
- Zero breaking changes for AI and script files

## 2025-08-25 - OSS Hero Hardening Step 1: Baseline Health & Safety Gates

**What**: Established baseline health and safety gates for OSS Hero hardening process

**Why**: Create foundation for systematic hardening improvements across 14 steps

**Scope**: 
- Repository health inventory and baseline documentation
- Fixed picocolors import issue in doctor script
- Installed missing dependencies (resend, @playwright/test)
- Created comprehensive baseline reports and hardening scaffold

**Migration**: No migration required - this is baseline establishment only

**Impact**: Zero breaking changes, enables systematic hardening process

## 2025-01-13 - System Strings Registry Addition

**What**: Added new `lib/registry/strings.ts` file to centralize all system names and brand references

**Why**: Enable future system-wide rename capability by centralizing all user-facing text and system names

**Scope**: 
- New registry file with system strings
- Helper functions for validation and retrieval
- Export added to main registry index

**Migration**: No migration required - this is additive only

**Impact**: Zero breaking changes, enables future rename infrastructure
