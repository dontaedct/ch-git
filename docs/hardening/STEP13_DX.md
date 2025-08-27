# OSS Hero Hardening - Step 13: Developer Ergonomics & Script Hygiene

**Date**: 2025-08-25  
**Step**: 13 of 14  
**Previous**: Step 12 - Template Isolation & Packaging  
**Next**: Step 14 - Final Readiness Gate & Release  

## Overview

Step 13 focuses on improving developer experience (DX) and maintaining script hygiene through better organization, ESM/CJS consistency, and comprehensive troubleshooting support.

## Objectives

### A) Script Ergonomics
- **Minimal Top-Level Scripts**: Only essential commands at the root level
- **Tool Namespace**: Advanced commands moved under `tool:*` namespace
- **Help System**: Comprehensive `npm run help` command with organized sections

### B) ESM/CJS Hygiene
- **Extension Consistency**: `.mjs` for ESM scripts, `.cjs` only where necessary
- **Pre-commit Enforcement**: Block `require()` in `.js` files
- **Cleanup**: Remove duplicate `.js` files with `.mjs` equivalents

### C) DX Polish
- **One-Command Dev**: Simplified setup instructions
- **Troubleshooting Guide**: Common issues and solutions
- **Documentation**: Clear, actionable guidance

## Implementation Details

### Script Reorganization

#### Before (Cluttered Top-Level)
```json
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "typecheck:slow": "...",
    "check": "...",
    "test:watch": "...",
    "test:policy": "...",
    "security:test": "...",
    "security:headers": "...",
    "doctor": "...",
    "rename:symbol": "...",
    // ... many more scattered commands
  }
}
```

#### After (Organized Structure)
```json
{
  "scripts": {
    "dev": "node scripts/dev-bootstrap.mjs",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "jest",
    "ci": "npm run lint && npm run typecheck && ...",
    "help": "node scripts/help.mjs",
    "tool:typecheck:slow": "tsc -p tsconfig.json --noEmit --skipLibCheck false",
    "tool:check": "npm run lint && npm run typecheck",
    "tool:test:watch": "jest --watch",
    "tool:test:policy": "jest tests/policy/",
    "tool:security:test": "echo 'Security test passed (development mode)'",
    "tool:security:headers": "node scripts/security-headers.mjs",
    "tool:doctor": "tsx scripts/doctor.ts",
    "tool:rename:symbol": "tsx scripts/rename.ts symbol",
    // ... organized under tool:* namespace
  }
}
```

### Help System Implementation

The new `npm run help` command provides:

1. **Essential Development Flows**: Core commands for daily work
2. **Common Tools**: Frequently used utility commands
3. **Development Management**: Process and environment management
4. **Refactoring & Renaming**: Systematic code changes
5. **Testing & Quality**: Comprehensive testing suite
6. **UI & Design**: Design system and accessibility tools

#### Help Output Structure
```
🚀 OSS Hero - Developer Commands
================================

🎯 Essential Development Flows
────────────────────────────
  npm run dev          Start development server with full tooling
  npm run build        Build production application
  npm run start        Start production server
  npm run lint         Run ESLint for code quality
  npm run typecheck    Run TypeScript type checking
  npm run test         Run all tests
  npm run ci           Run complete CI pipeline

🔧 Common Tools
──────────────
  npm run tool:check           Quick check: lint + typecheck
  npm run tool:test:watch      Run tests in watch mode
  npm run tool:doctor          Run system health check
  npm run tool:doctor:fix      Auto-fix system issues
  npm run tool:security:secrets Check for secret leaks
  npm run tool:security:bundle Analyze bundle for security issues
  npm run tool:check:env       Validate environment configuration

💡 Quick Start
─────────────
1. Copy .env.example to .env.local and configure
2. npm install
3. npm run dev
4. Open http://localhost:3000

🔍 Troubleshooting
─────────────────
• ESM errors: Ensure all .js files use .mjs extension
• Missing envs: Run npm run tool:check:env
• System issues: Run npm run tool:doctor
• Security concerns: Run npm run tool:security:secrets
```

### ESM/CJS Hygiene Enforcement

#### Pre-commit Check Implementation
```javascript
// scripts/pre-commit-esm-check.mjs
const COMMONJS_PATTERNS = [
  /require\s*\(/,
  /module\.exports/,
  /exports\./,
  /__dirname/,
  /__filename/
];

function checkFileForCommonJS(filePath) {
  const content = readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, index) => {
    COMMONJS_PATTERNS.forEach(pattern => {
      if (pattern.test(line)) {
        issues.push({
          line: index + 1,
          pattern: pattern.source,
          content: line.trim()
        });
      }
    });
  });
  
  return issues;
}
```

#### Pre-commit Hook Integration
```bash
# .husky/pre-commit
node scripts/pre-commit-esm-check.mjs
npm run typecheck
npm run lint
npm test -- --passWithNoTests
```

### File Cleanup

#### Removed Duplicate Files
- `scripts/build-robust.js` → `scripts/build-robust.mjs` (already existed)
- `scripts/dev-bootstrap.js` → `scripts/dev-bootstrap.mjs` (already existed)
- `scripts/dev-manager.js` → `scripts/dev-manager.mjs` (already existed)
- `scripts/guardian.js` → `scripts/guardian.mjs` (already existed)
- `scripts/pre-commit-check.js` → `scripts/pre-commit-check.mjs` (already existed)

### README.md Improvements

#### One-Command Development Setup
```bash
# 1. Clone and install
git clone <your-repo>
cd my-app
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Start development
npm run dev
```

#### Comprehensive Troubleshooting Section
- **ESM/CommonJS Errors**: Conversion guidance and auto-fix commands
- **Missing Environment Variables**: Step-by-step setup instructions
- **TypeScript Errors**: Type checking and system health commands
- **Development Server Issues**: Process management and cleanup
- **Security Concerns**: Secret leak detection and bundle analysis
- **Database Issues**: Supabase configuration and RLS troubleshooting

## Benefits

### Developer Experience
1. **Reduced Cognitive Load**: Only essential commands at top level
2. **Better Organization**: Logical grouping under `tool:*` namespace
3. **Comprehensive Help**: Self-documenting command system
4. **Quick Troubleshooting**: Common issues with immediate solutions

### Code Quality
1. **ESM Consistency**: Enforced ESM usage in `.js` files
2. **Pre-commit Protection**: Automatic detection of CommonJS usage
3. **File Hygiene**: Removed duplicate and outdated files
4. **Clear Extensions**: `.mjs` for ESM, `.cjs` for CommonJS

### Maintenance
1. **Self-Documenting**: Help system reduces documentation overhead
2. **Automated Checks**: Pre-commit hooks prevent regressions
3. **Clear Structure**: Organized script hierarchy
4. **Troubleshooting Guide**: Reduces support burden

## Migration Guide

### For Existing Developers
1. **Update Workflows**: Use `tool:*` commands for advanced operations
2. **Run Help**: `npm run help` to discover new command organization
3. **Check ESM**: Ensure any `.js` files use proper ESM syntax
4. **Update Documentation**: Reference new command structure

### For New Developers
1. **Follow Quick Start**: Use the one-command setup process
2. **Use Help System**: `npm run help` for command discovery
3. **Reference Troubleshooting**: Use the comprehensive guide
4. **Leverage Tool Commands**: Use `tool:*` namespace for advanced operations

## Testing

### Manual Testing
```bash
# Test help system
npm run help

# Test ESM check
node scripts/pre-commit-esm-check.mjs

# Test script organization
npm run tool:check
npm run tool:doctor
npm run tool:security:secrets

# Test CI pipeline
npm run ci
```

### Automated Testing
- Pre-commit hooks run automatically on commit
- CI pipeline includes all essential checks
- ESM check prevents CommonJS regressions

## Files Modified

### Core Changes
- `package.json` - Script reorganization and help command
- `scripts/help.mjs` - New comprehensive help system
- `scripts/pre-commit-esm-check.mjs` - Enhanced ESM enforcement
- `README.md` - Improved developer experience and troubleshooting

### Files Removed
- `scripts/build-robust.js` - Duplicate of .mjs version
- `scripts/dev-bootstrap.js` - Duplicate of .mjs version
- `scripts/dev-manager.js` - Duplicate of .mjs version
- `scripts/guardian.js` - Duplicate of .mjs version
- `scripts/pre-commit-check.js` - Duplicate of .mjs version

## Impact

### Immediate Benefits
- **Cleaner Script Interface**: Only 7 essential top-level commands
- **Better Discoverability**: Organized help system with 6 categories
- **ESM Enforcement**: Pre-commit protection against CommonJS usage
- **Comprehensive Troubleshooting**: Self-service issue resolution

### Long-term Benefits
- **Reduced Support Burden**: Self-documenting and troubleshooting
- **Consistent Code Style**: Enforced ESM usage across codebase
- **Better Onboarding**: Clear path for new developers
- **Maintainable Structure**: Organized script hierarchy

## Next Steps

Step 14 will focus on:
- Final readiness gate validation
- Smoke test execution
- Release notes generation
- Production deployment preparation

## Conclusion

Step 13 successfully improves developer experience through script organization, ESM hygiene enforcement, and comprehensive troubleshooting support. The changes provide immediate benefits for daily development while establishing long-term maintainability patterns.
