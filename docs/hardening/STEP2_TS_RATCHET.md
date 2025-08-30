# Step 2: TypeScript Strictness & Build-Time TS Checks

**Date:** 2025-08-25  
**Status:** Implemented  
**Branch:** `hardening/step2-ts-strict-20250825`

## Overview

This step implements a ratchet approach to TypeScript strictness, ensuring build-time type checking while maintaining development velocity. The changes enforce stricter type safety without breaking existing functionality.

## Changes Implemented

### A) Build-Time TypeScript Enforcement

- **`next.config.ts`**: Disabled `typescript.ignoreBuildErrors` to enforce TS errors in CI builds
- **CI Integration**: TypeScript errors now fail the build pipeline

### B) TypeScript Strictness Ratchet

#### Core Configuration (`tsconfig.json`)
- ✅ `noImplicitAny: true` - Prevents implicit any types
- ✅ `strict: true` - Enables all strict type checking options
- ✅ `allowJs: false` - Disables JavaScript files in main codebase
- ✅ `skipLibCheck: true` - Maintains build speed (overridden in weekly CI)

#### Scripts Configuration (`tsconfig.scripts.json`)
- ✅ Separate config for `scripts/**` allowing JavaScript files
- ✅ Relaxed `noImplicitAny` for legacy scripts
- ✅ Maintains compatibility with existing build scripts

#### Weekly Comprehensive Type Checking
- ✅ New CI job `slow-types` runs every Monday at 2 AM UTC
- ✅ Uses `skipLibCheck: false` for comprehensive type checking
- ✅ `npm run typecheck:slow` script for manual execution

### C) Pre-commit & Lint Rules

#### ESLint Configuration (`eslint.config.js`)
- ✅ `@typescript-eslint/no-explicit-any: error` - Prevents explicit `any` usage
- ✅ Exceptions for AI-related files (`lib/ai/**`, `app/api/ai/**`)
- ✅ Relaxed rules for scripts (`scripts/**`)
- ✅ Enhanced TypeScript rules for better type safety

#### Pre-commit Hook (`.husky/pre-commit`)
- ✅ `npm run typecheck` - Type checking before commit
- ✅ `npm run lint -- --max-warnings=0` - Zero warnings policy
- ✅ `npm test -- --passWithNoTests` - Test execution

### D) Documentation

- ✅ This document (`docs/hardening/STEP2_TS_RATCHET.md`)
- ✅ Change journal entry (`docs/CHANGE_JOURNAL.md`)

## Configuration Toggles

### Development Mode
```bash
# Standard type checking (fast)
npm run typecheck

# Comprehensive type checking (slow)
npm run typecheck:slow

# Full CI pipeline
npm run ci
```

### CI Workflows
- **Standard CI**: Fast type checking with `skipLibCheck: true`
- **Weekly CI**: Comprehensive type checking with `skipLibCheck: false`
- **Pre-commit**: Fast type checking + linting

## Exception Handling

### Allowed `any` Usage
1. **AI-related files**: `lib/ai/**/*`, `app/api/ai/**/*`
2. **Scripts**: `scripts/**/*` (with relaxed rules)
3. **Legacy exceptions**: Must include `// TODO(ts-ratchet):` comment

### Legacy Exception Pattern
```typescript
// TODO(ts-ratchet): Remove any after migrating legacy API - Issue #123
const legacyData: any = await fetchLegacyAPI();
```

## Cleanup Schedule

### Immediate (Step 2)
- [x] Enable build-time TS enforcement
- [x] Ratchet core strictness settings
- [x] Add comprehensive lint rules

### Short-term (Steps 3-5)
- [ ] Audit and fix implicit `any` types
- [ ] Convert remaining `.js` files to `.ts`/`.tsx`
- [ ] Remove legacy exception comments

### Medium-term (Steps 6-10)
- [ ] Enable `skipLibCheck: false` in main CI
- [ ] Remove AI-related `any` exceptions
- [ ] Implement stricter type guards

### Long-term (Steps 11-14)
- [ ] Full type coverage audit
- [ ] Performance optimization of type checking
- [ ] Advanced TypeScript features adoption

## Verification

### Local Testing
```bash
# Verify type checking works
npm run typecheck

# Verify linting works
npm run lint

# Verify full CI pipeline
npm run ci
```

### CI Verification
- [x] Standard CI includes type checking
- [x] Weekly CI includes comprehensive type checking
- [x] Pre-commit hooks enforce type safety

## Rollback Plan

If issues arise, rollback can be performed by:

1. **Immediate rollback**:
   ```bash
   # Re-enable build error ignoring
   # In next.config.ts: typescript: { ignoreBuildErrors: true }
   ```

2. **Partial rollback**:
   ```bash
   # Relax noImplicitAny
   # In tsconfig.json: "noImplicitAny": false
   ```

3. **Full rollback**:
   ```bash
   git revert <commit-hash>
   ```

## Metrics

### Before Implementation
- TypeScript errors ignored in builds
- Implicit `any` types allowed
- No pre-commit type checking

### After Implementation
- ✅ Build-time TypeScript enforcement
- ✅ Zero implicit `any` types (except exceptions)
- ✅ Pre-commit type checking
- ✅ Weekly comprehensive type checking

## Next Steps

**Step 3**: Environment handling hardening
- Complete `env.example` files
- Implement fail-fast config checks
- Add environment validation

---

*This document is part of the OSS Hero Hardening process. For questions or issues, refer to the main hardening documentation.*
