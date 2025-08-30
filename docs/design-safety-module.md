# OSS Hero Design Safety Module

A drop-in design safety layer that enforces architectural boundaries, accessibility standards, visual consistency, and performance budgets in any micro-app.

## Enforcement Levels

| Check Type | Previous Level | Current Level | Rollback Method |
|------------|----------------|---------------|-----------------|
| **Type Checking** | Advisory | ✅ **Required** | Remove from workflow |
| **ESLint** | Advisory | ✅ **Required** | Remove from workflow |
| **UI Contracts** | Advisory | ✅ **Required** | Remove from workflow |
| **Accessibility** | Advisory | ✅ **Required** (when tests exist) | Remove from workflow |
| **Visual Regression** | Advisory | ✅ **Required** (when tests exist) | Remove from workflow |
| **LHCI Performance** | Advisory | 🟡 **Soft-Fail** (hard-fail in 14d) | Toggle `continue-on-error` in workflow |

### Rollback Procedures

**Immediate Rollback (Emergency):**
```bash
# Disable all design safety checks
git revert <commit-hash>
# OR remove from workflow temporarily
```

**Gradual Rollback:**
- Toggle `continue-on-error: true` for specific jobs
- Remove specific checks from `npm run design:check`
- Adjust enforcement levels in individual tools

## Core Components

### 1. **Import Boundary Enforcement** 🚫
- **Purpose**: Prevent adapter/business logic leaking into UI components
- **Implementation**: ESLint rules in `design/policies/import-boundaries.cjs`
- **Enforcement**: Required (blocks PR merge)

### 2. **Accessibility Testing** ♿
- **Purpose**: Ensure WCAG compliance and keyboard navigation
- **Implementation**: Playwright tests in `tests/ui/a11y.spec.ts`
- **Enforcement**: Required when tests exist

### 3. **Visual Regression Testing** 🎨
- **Purpose**: Catch unintended visual changes
- **Implementation**: Playwright screenshot comparisons
- **Enforcement**: Required when baselines exist

### 4. **Component Contract Testing** 📋
- **Purpose**: Ensure component APIs remain stable
- **Implementation**: Automated contract auditor
- **Enforcement**: Required

### 5. **Performance Budget Monitoring** ⚡
- **Purpose**: Prevent performance regressions
- **Implementation**: Lighthouse CI with budgets
- **Enforcement**: Soft-fail (becoming required)

## Installation

### Quick Install
```bash
# Install OSS Hero Design Safety Module
node scripts/oss-hero-port/install-design-module.mjs
```

### Manual Setup
1. **Copy required files** from this repository
2. **Update package.json** with design safety scripts
3. **Configure CI/CD** with design safety workflows
4. **Seed visual baselines** for regression testing

## Usage

### Development Workflow
```bash
# Before committing
npm run design:check

# Create visual baselines (first time)
npx playwright test tests/ui/visual.spec.ts --update-snapshots

# Run individual checks
npm run ui:a11y
npm run ui:visual
npm run ui:contracts
npm run ui:perf
```

### CI/CD Integration
The module automatically integrates with GitHub Actions:
- **PR Checks**: All design safety tests run on PRs
- **Main Branch**: Visual baselines updated automatically
- **Self-Test**: Manual workflow dispatch for validation

## Configuration

### ESLint Rules (`design/policies/`)
- `import-boundaries.cjs`: Prevents adapter imports in UI
- `token-guards.cjs`: Ensures design token usage
- `eslint-design-required.cjs`: Required rules
- `eslint-design-advisory.cjs`: Advisory rules

### Performance Budgets (`design/budgets/`)
- Network timing budgets
- Resource size limits
- Core Web Vitals thresholds

### Visual Testing
- Screenshots stored in `tests/ui/__screenshots__/`
- Pixel-perfect comparison with threshold tolerance
- Cross-browser baseline support

## Troubleshooting

### Common Issues

**Import Boundary Violations**
```bash
# Error: adapter imported in UI component
# Fix: Move adapter logic to hooks or context
```

**Visual Regression Failures**
```bash
# Update baselines if changes are intentional
npx playwright test tests/ui/visual.spec.ts --update-snapshots
```

**Performance Budget Exceeded**
```bash
# Check lighthouse report
npm run ui:perf
# Optimize assets or adjust budgets
```

### Emergency Bypass
If design safety is blocking critical releases:

1. **Temporary bypass** (use sparingly):
   ```yaml
   # In workflow, add:
   continue-on-error: true
   ```

2. **Rollback enforcement**:
   ```bash
   git revert <design-safety-commit>
   ```

## Architecture

### File Structure
```
├── design/
│   ├── policies/           # ESLint configurations
│   ├── scripts/            # Audit and validation scripts
│   ├── budgets/            # Performance budgets
│   └── templates/          # Component templates
├── tests/ui/               # UI test suites
│   ├── a11y.spec.ts       # Accessibility tests
│   ├── visual.spec.ts     # Visual regression tests
│   └── smoke.spec.ts      # Basic functionality tests
└── .github/workflows/      # CI/CD integration
```

### Integration Points
- **Pre-commit**: Basic linting and type checking
- **PR Checks**: Full design safety validation
- **Post-merge**: Baseline updates and reporting

## Best Practices

### For Developers
1. **Run `npm run design:check`** before every commit
2. **Update visual baselines** when making intentional UI changes
3. **Use design tokens** instead of hardcoded values
4. **Test keyboard navigation** for new interactive elements

### For Reviewers
1. **Verify design safety status** before approving PRs
2. **Check for import boundary violations**
3. **Validate accessibility improvements**
4. **Ensure performance budgets are respected

### For Maintainers
1. **Monitor performance trends** via Lighthouse CI
2. **Update design tokens** centrally
3. **Evolve accessibility standards** based on user feedback
4. **Adjust enforcement levels** gradually

## OSS Hero Philosophy

OSS Hero Design Safety is built on the principle that **design safety should be invisible when working correctly** and **actionable when issues arise**. The module provides:

- **Zero-config setup** for most projects
- **Gradual enforcement** to avoid disrupting existing workflows  
- **Clear error messages** with specific remediation steps
- **Escape hatches** for emergency situations

The system scales from individual developers to large teams, providing both guardrails for newcomers and powerful automation for experienced teams.

