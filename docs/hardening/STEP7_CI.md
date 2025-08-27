# Step 7: Single CI Gate & Script Simplification

**Date**: 2025-08-25  
**Status**: Implemented  
**Branch**: `hardening/step7-ci-gate-20250825`

## Overview

This step establishes a single, comprehensive CI gate and simplifies the script ecosystem by enforcing ESM standards and creating a minimal happy-path for common operations.

## Changes Made

### A) Script Simplification

#### Minimal Happy-Path Scripts
- **`dev`**: Local development server with process locking and smart port selection
- **`check`**: Quick lint + typecheck for development
- **`ci`**: Full CI gate sequence (lint → typecheck → security → policy → guard → UI → tests → build)
- **`security:test`**: Security validation (secrets + environment)

#### Tool Namespace
All legacy/admin scripts moved under `tool:*` namespace:
- `tool:doctor` - System health checks
- `tool:rename:*` - Symbol/import/route/table renaming
- `tool:dev:*` - Development server management
- `tool:ui:*` - UI testing and validation
- `tool:ai:*` - AI evaluation tools

### B) ESM Enforcement

#### File Extensions
- **`.mjs`**: ESM scripts (dev-bootstrap, dev-manager, test-doctor, build-robust)
- **`.cjs`**: CommonJS scripts (safety-smoke, pre-commit checks)
- **`.js`**: No longer allowed to contain `require()` statements

#### Pre-commit Check
Added `scripts/pre-commit-esm-check.mjs` that:
- Scans staged `.js` files for `require()` statements
- Blocks commits with ESM violations
- Provides clear error messages and solutions

### C) CI Workflow Updates

#### Main CI Gate
Updated `.github/workflows/ci.yml`:
- Single `npm run ci` command runs full sequence
- Matrix testing on Node 18.x and 20.x
- Comprehensive environment variable setup

#### Weekly Checks
New `.github/workflows/weekly-checks.yml`:
- **Dependency Check**: `npm outdated --json` with Slack notifications
- **Slow Type Checking**: `skipLibCheck: false` for comprehensive validation
- Runs every Monday at 2 AM UTC

### D) Branch Protection

The CI gate now blocks merges to `main` unless:
1. All linting passes
2. TypeScript compilation succeeds
3. Security tests pass (secrets + environment)
4. Policy enforcement passes
5. Route guard tests pass
6. UI contract tests pass
7. Unit tests pass
8. Build completes successfully

## CI Gate Sequence

```bash
npm run ci
```

Executes in order:
1. **Lint** (`npm run lint`) - ESLint validation
2. **Typecheck** (`npm run typecheck`) - TypeScript compilation
3. **Security** (`npm run security:test`) - Secrets + environment validation
4. **Policy** (`npm run policy:enforce`) - Policy enforcement
5. **Guard** (`npm run guard:test`) - Route guard validation
6. **UI Contracts** (`npm run ui:contracts`) - Component contract validation
7. **UI A11y** (`npm run ui:a11y`) - Accessibility testing
8. **Tests** (`npm run test`) - Unit tests
9. **Build** (`npm run build`) - Production build

## Migration Guide

### For Developers
1. **Use new scripts**: `npm run dev`, `npm run check`, `npm run ci`
2. **Legacy tools**: Prefix with `tool:` (e.g., `npm run tool:doctor`)
3. **ESM compliance**: No `require()` in `.js` files
4. **File extensions**: Use `.mjs` for ESM, `.cjs` for CommonJS

### For CI/CD
1. **Single command**: Use `npm run ci` instead of individual steps
2. **Branch protection**: Enable on `main` branch
3. **Weekly checks**: Monitor dependency updates and slow type checking

## Benefits

1. **Simplified Workflow**: Single `ci` command for all validation
2. **ESM Standardization**: Consistent module system across codebase
3. **Comprehensive Gates**: All quality checks in proper sequence
4. **Automated Monitoring**: Weekly dependency and type checking
5. **Clear Separation**: Happy-path vs. tool/admin scripts

## Next Steps

- **Step 8**: Security headers and CSP with automated tests
- Monitor CI performance and optimize if needed
- Set up Slack webhook for dependency notifications
- Consider adding performance budgets to CI gate

## Files Modified

- `package.json` - Script reorganization and ESM enforcement
- `scripts/dev-bootstrap.mjs` - Converted to ESM
- `scripts/dev-manager.mjs` - Converted to ESM
- `scripts/build-robust.mjs` - Renamed to ESM
- `scripts/pre-commit-esm-check.mjs` - New ESM validation
- `.github/workflows/ci.yml` - Single CI gate
- `.github/workflows/weekly-checks.yml` - Weekly monitoring
- `.husky/pre-commit` - Added ESM check

## Verification

Run the following to verify implementation:

```bash
# Test ESM compliance
node scripts/pre-commit-esm-check.mjs

# Test CI gate
npm run ci

# Test individual components
npm run check
npm run security:test
npm run tool:doctor
```

All commands should complete successfully with the new ESM-compliant structure.
