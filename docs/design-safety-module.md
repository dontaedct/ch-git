# MIT Hero Design Safety Module

A drop-in design safety layer that enforces architectural boundaries, accessibility standards, visual consistency, and performance budgets in any micro-app.

## What This Module Enforces

### 🛡️ Design Guardian
- **Import Boundaries**: Prevents UI components from importing business logic, data layers, or route handlers
- **Component Contracts**: Ensures UI components maintain their public API contracts
- **Registry Safety**: Validates component registry integrity and prevents circular dependencies

### ♿ A11y Ranger  
- **Accessibility Testing**: Automated Playwright tests for WCAG compliance
- **Keyboard Navigation**: Ensures all interactive elements are keyboard accessible
- **Screen Reader Support**: Validates ARIA labels and semantic HTML structure

### 👁️ Visual Watch
- **Visual Regression**: Screenshot-based testing to catch unintended UI changes
- **Design Consistency**: Enforces visual design tokens and spacing systems
- **Component Library**: Maintains visual component library integrity

### 💰 UX Budgeteer
- **Performance Budgets**: Lighthouse CI integration with configurable thresholds
- **Bundle Analysis**: Monitors JavaScript bundle size and loading performance
- **User Experience Metrics**: Tracks Core Web Vitals and user interaction metrics

### 📋 Contract Auditor
- **API Contracts**: Validates component prop interfaces and return types
- **Breaking Changes**: Detects when component APIs change unexpectedly
- **Documentation Sync**: Ensures component docs match implementation

## Required Files & Folders

### Design Policies (`design/policies/*`)
- `eslint-design.config.cjs` - Design-specific ESLint rules
- `import-boundaries.cjs` - Import boundary enforcement
- `token-guards.cjs` - Design token validation
- `eslint-design-required.config.cjs` - Required design rules
- `eslint-design-advisory.config.cjs` - Advisory design rules

### Design Scripts (`design/scripts/*`)
- `component-contract-auditor.mjs` - Component API contract validation
- `design-guardian.mjs` - Main design safety orchestrator
- `performance-audit.mjs` - Performance budget enforcement
- `visual-watch.mjs` - Visual regression detection
- `a11y-scanner.mjs` - Accessibility compliance checking

### Design Budgets (`design/budgets/*`)
- `performance.json` - Performance thresholds and budgets
- `accessibility.json` - A11y compliance targets

### Design Templates (`design/templates/*`)
- `playwright-a11y.spec.ts` - Accessibility test template
- `visual-regression.spec.ts` - Visual test template  
- `ui-smoke.spec.ts` - Basic UI functionality template

### Tests (`tests/ui/*`)
- `a11y.spec.ts` - Accessibility test suite
- `visual.spec.ts` - Visual regression tests
- `smoke.spec.ts` - Basic UI functionality tests
- `a11y.config.ts` - A11y test configuration

### Workflows (`.github/workflows/*`)
- `design-safety.yml` - Main design safety workflow
- `safety-gate-status-bridge.yml` - Status bridge for external systems
- `feat-route-adapter-guard.yml` - Route/adapter boundary enforcement

## Installation

### Quick Install (Copy/Paste)
1. Copy the entire `design/` folder to your target repo
2. Copy the `tests/ui/` folder to your target repo  
3. Copy the `.github/workflows/` files to your target repo
4. Run the installer script: `node scripts/mit-hero-port/install-design-module.mjs`

### Automated Install
```bash
# Clone this repo temporarily
git clone <your-repo> temp-design-safety
cd temp-design-safety

# Run installer in target repo
node scripts/mit-hero-port/install-design-module.mjs --target=/path/to/target/repo
```

## Post-Install Checklist

1. **Run Design Safety Check**
   ```bash
   npm run design:check
   ```

2. **Seed Visual Baselines**
   ```bash
   # On main branch or via workflow dispatch
   npx playwright test tests/ui/visual.spec.ts --update-snapshots
   ```

3. **Confirm Route/Adapter Guard**
   - Verify `.github/workflows/feat-route-adapter-guard.yml` exists
   - Test with a UI component PR to ensure it triggers

4. **Customize Design Tokens** (Optional)
   - Update `design/budgets/performance.json` for your performance targets
   - Modify `design/policies/token-guards.cjs` for your design system
   - Adjust `design/lhci.config.cjs` for your Lighthouse thresholds

## Customization Variables

### Font & Icon System
- **Font Family**: Update `design/budgets/typography.json`
- **Icon Set**: Modify `design/policies/icon-guards.cjs`
- **Color Tokens**: Edit `design/budgets/colors.json`

### Routes to Test
- **Core Pages**: Update `tests/ui/smoke.spec.ts` with your main routes
- **Critical Paths**: Modify `tests/ui/a11y.spec.ts` for key user journeys
- **Visual Components**: Adjust `tests/ui/visual.spec.ts` for your component library

### Performance Targets
- **Lighthouse Scores**: Configure `design/lhci.config.cjs`
- **Bundle Size**: Set limits in `design/budgets/performance.json`
- **Loading Times**: Define thresholds in `design/budgets/ux.json`

## LHCI Configuration

### Soft → Hard Enforcement
1. **Soft Mode** (Default): `continue-on-error: true` in workflows
2. **Hard Mode**: Remove `continue-on-error` and set strict thresholds
3. **Gradual Rollout**: Start with advisory, move to required over time

### Threshold Customization
```javascript
// design/lhci.config.cjs
module.exports = {
  ci: {
    collect: {
      // Your collection settings
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }]
      }
    }
  }
}
```

## Label-Gated Optional Lanes

### AI Evaluations
- **Label**: `ai:evaluate` - Triggers AI-powered code review
- **Label**: `ai:contract` - Runs contract validation with AI
- **Label**: `ai:visual` - AI-powered visual regression analysis

### Performance Deep-Dive
- **Label**: `perf:deep` - Extended performance profiling
- **Label**: `perf:bundle` - Detailed bundle analysis
- **Label**: `perf:lighthouse` - Full Lighthouse audit

## Troubleshooting

### Common Issues
1. **Missing Dependencies**: Install Playwright and Lighthouse CI
2. **Baseline Screenshots**: Run visual tests on main branch first
3. **Contract Failures**: Check component prop interfaces and exports
4. **Import Boundary Violations**: Move business logic out of UI components

### Getting Help
- Run `npm run design:check` for detailed error messages
- Check workflow logs in GitHub Actions
- Review `design/README.md` for specific configuration details

## Architecture Principles

This module follows these core principles:
- **Zero Behavioral Changes**: Installs without affecting existing functionality
- **Progressive Enhancement**: Fails gracefully when dependencies are missing
- **Configurable Enforcement**: Adjust strictness based on team maturity
- **Portable Design**: Works in any React/Next.js application
- **CI/CD Integration**: Seamless GitHub Actions integration
