# Change Journal

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
