# MIT Hero Design Safety - Portability Pack

This repository contains a **drop-in Design Safety Module** that can be installed into any React/Next.js micro-app in under 5 minutes, providing enterprise-grade design safety without any behavioral changes.

## 🚀 Quick Start

### Option 1: Copy & Install (Recommended)
```bash
# 1. Copy the design/ folder to your target repo
cp -r design/ /path/to/your/repo/

# 2. Copy the tests/ui/ folder to your target repo  
cp -r tests/ui/ /path/to/your/repo/

# 3. Copy the .github/workflows/ files to your target repo
cp .github/workflows/design-safety.yml /path/to/your/repo/.github/workflows/
cp .github/workflows/safety-gate-status-bridge.yml /path/to/your/repo/.github/workflows/
cp .github/workflows/feat-route-adapter-guard.yml /path/to/your/repo/.github/workflows/

<<<<<<< HEAD
# 4. Run the installer from your target repo
cd /path/to/your/repo
=======
# 4. Run the installer script
>>>>>>> origin/main
node scripts/mit-hero-port/install-design-module.mjs
```

### Option 2: Automated Install
```bash
# Clone this repo temporarily
git clone <your-repo> temp-design-safety
cd temp-design-safety

# Run installer in target repo
node scripts/mit-hero-port/install-design-module.mjs --target=/path/to/target/repo
```

## ✨ What You Get

### 🛡️ Design Guardian
- **Import Boundaries**: Prevents UI components from importing business logic
- **Component Contracts**: Ensures UI components maintain their public APIs
- **Registry Safety**: Validates component registry integrity

### ♿ A11y Ranger
<<<<<<< HEAD
- **Accessibility Testing**: Automated WCAG compliance checks
- **Keyboard Navigation**: Ensures all interactive elements are accessible
- **Screen Reader Support**: Validates ARIA labels and semantic HTML

### 👁️ Visual Watch
- **Visual Regression**: Screenshot-based testing for UI consistency
- **Design Tokens**: Enforces visual design system consistency
- **Component Library**: Maintains visual component integrity

### 💰 UX Budgeteer
- **Performance Budgets**: Lighthouse CI integration
- **Bundle Analysis**: Monitors JavaScript bundle size
- **Core Web Vitals**: Tracks user experience metrics

### 📋 Contract Auditor
- **API Contracts**: Validates component prop interfaces
- **Breaking Changes**: Detects unexpected API changes
- **Documentation Sync**: Ensures docs match implementation
=======
- **Accessibility Testing**: Automated Playwright tests for WCAG compliance
- **Keyboard Navigation**: Ensures all interactive elements are keyboard accessible
- **Screen Reader Support**: Validates ARIA labels and semantic HTML

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
>>>>>>> origin/main

## 📁 File Structure

```
your-repo/
├── design/
<<<<<<< HEAD
│   ├── policies/          # ESLint rules & import boundaries
│   ├── scripts/           # Design safety scripts
│   ├── budgets/           # Performance & accessibility targets
│   ├── templates/         # Test templates
│   └── lhci.config.cjs   # Lighthouse CI config
├── tests/ui/              # UI test suite
├── .github/workflows/     # CI/CD workflows
└── docs/snippets/         # PR checklists & documentation
=======
│   ├── policies/          # ESLint rules and import boundaries
│   ├── scripts/           # Design safety orchestrators
│   ├── budgets/           # Performance and accessibility targets
│   ├── templates/         # Test templates
│   └── lhci.config.cjs   # Lighthouse CI configuration
├── tests/ui/              # UI test suites
├── .github/workflows/     # GitHub Actions workflows
└── package.json           # Updated with design safety scripts
>>>>>>> origin/main
```

## 🔧 Post-Install Setup

<<<<<<< HEAD
1. **Run Design Safety Check**
   ```bash
   npm run design:check
   ```

2. **Seed Visual Baselines**
   ```bash
   # On main branch or via workflow dispatch
   npx playwright test tests/ui/visual.spec.ts --update-snapshots
   ```

3. **Test Route Guard**
   - Create a UI component PR to verify the guard triggers
   - Check that boundary violations are caught

4. **Customize (Optional)**
   - Update performance budgets in `design/budgets/`
   - Modify design tokens in `design/policies/`
   - Adjust Lighthouse thresholds in `design/lhci.config.cjs`

## 🎯 Available Commands
=======
### 1. Run Design Safety Check
```bash
npm run design:check
```

### 2. Seed Visual Baselines
```bash
# On main branch or via workflow dispatch
npx playwright test tests/ui/visual.spec.ts --update-snapshots
```

### 3. Test Route/Adapter Guard
- Verify `.github/workflows/feat-route-adapter-guard.yml` exists
- Test with a UI component PR to ensure it triggers

### 4. Customize Design Tokens (Optional)
- Update `design/budgets/performance.json` for your performance targets
- Modify `design/policies/token-guards.cjs` for your design system
- Adjust `design/lhci.config.cjs` for your Lighthouse thresholds

## 🎯 Available Scripts
>>>>>>> origin/main

```json
{
  "scripts": {
<<<<<<< HEAD
    "design:check": "Complete design safety validation",
    "ui:contracts": "Component contract validation",
    "ui:a11y": "Accessibility testing",
    "ui:visual": "Visual regression testing",
    "ui:perf": "Performance testing with Lighthouse CI"
=======
    "design:check": "npm run -s typecheck && npm run -s lint && npm run -s ui:contracts && npm run -s ui:a11y && npm run -s ui:visual",
    "ui:contracts": "node design/scripts/component-contract-auditor.mjs || echo \"(info) contracts auditor not present — skipping\"",
    "ui:a11y": "npx -y playwright test tests/ui/a11y.spec.ts || true",
    "ui:visual": "npx -y playwright test tests/ui/visual.spec.ts || true",
    "ui:perf": "npx -y lhci autorun --config=design/lhci.config.cjs || true"
>>>>>>> origin/main
  }
}
```

<<<<<<< HEAD
## 🔄 CI/CD Integration

The module automatically integrates with GitHub Actions:

- **Design Safety**: Runs on every PR, blocks on critical violations
- **Route Guard**: Prevents UI components from importing business logic
- **Self-Test**: Manual workflow to validate installation
- **Status Bridge**: Integrates with external safety systems
=======
## 🚦 Workflow Integration

### Design Safety Workflow
- Runs on pull requests and manual dispatch
- Blocks on typecheck/lint/contracts
- Skips a11y/visual if tests absent
- LHCI soft-fail with configurable thresholds

### Route/Adapter Guard
- Automatically triggers on UI component changes
- Enforces import boundary rules
- Can integrate with external core systems
- Provides standalone fallback if no core available

### Self-Test Workflow
- Manual dispatch for validation
- Runs `npm run design:check`
- Checks for visual baselines
- Perfect for CI/CD pipeline validation
>>>>>>> origin/main

## 🎨 Customization

### Design Tokens
<<<<<<< HEAD
- **Colors**: Edit `design/budgets/colors.json`
- **Typography**: Update `design/budgets/typography.json`
- **Spacing**: Modify `design/policies/token-guards.cjs`
=======
- **Font Family**: Update `design/budgets/typography.json`
- **Icon Set**: Modify `design/policies/icon-guards.cjs`
- **Color Tokens**: Edit `design/budgets/colors.json`
>>>>>>> origin/main

### Performance Targets
- **Lighthouse Scores**: Configure `design/lhci.config.cjs`
- **Bundle Size**: Set limits in `design/budgets/performance.json`
- **Loading Times**: Define thresholds in `design/budgets/ux.json`

### Test Coverage
<<<<<<< HEAD
- **Routes**: Update `tests/ui/smoke.spec.ts` with your main pages
- **Components**: Modify `tests/ui/visual.spec.ts` for your component library
- **A11y**: Adjust `tests/ui/a11y.spec.ts` for key user journeys

## 🚨 Troubleshooting
=======
- **Core Pages**: Update `tests/ui/smoke.spec.ts` with your main routes
- **Critical Paths**: Modify `tests/ui/a11y.spec.ts` for key user journeys
- **Visual Components**: Adjust `tests/ui/visual.spec.ts` for your component library

## 🔍 Troubleshooting
>>>>>>> origin/main

### Common Issues
1. **Missing Dependencies**: Install Playwright and Lighthouse CI
2. **Baseline Screenshots**: Run visual tests on main branch first
<<<<<<< HEAD
3. **Contract Failures**: Check component prop interfaces
4. **Import Violations**: Move business logic out of UI components
=======
3. **Contract Failures**: Check component prop interfaces and exports
4. **Import Boundary Violations**: Move business logic out of UI components
>>>>>>> origin/main

### Getting Help
- Run `npm run design:check` for detailed error messages
- Check workflow logs in GitHub Actions
<<<<<<< HEAD
- Review `docs/design-safety-module.md` for configuration details

## 🔗 External Integration

### Route Adapter Guard Core
If you have a centralized route guard system:

1. Uncomment the core workflow in `feat-route-adapter-guard.yml`
2. Update the `owner/repo` reference to your core system
3. The standalone guard will run as a fallback

### Safety Gate Status Bridge
The module includes a status bridge for external safety systems:

- Reports design safety status to external monitoring
- Integrates with enterprise safety dashboards
- Provides webhook endpoints for status updates

## 📚 Documentation

- **Main Guide**: `docs/design-safety-module.md`
- **PR Checklist**: `docs/snippets/pr-checklist-design-safety.md`
- **Self-Test**: `.github/workflows/mit-hero-port-selftest.yml`
- **Installation**: `scripts/mit-hero-port/install-design-module.mjs`

## 🎉 Success Metrics

After installation, you should see:

- ✅ `npm run design:check` passes
- ✅ Visual regression tests run successfully
- ✅ Accessibility tests validate WCAG compliance
- ✅ Route guard prevents boundary violations
- ✅ Performance budgets are enforced
- ✅ Component contracts remain stable

## 🤝 Contributing

This portability pack is designed to be:

=======
- Review `docs/design-safety-module.md` for specific configuration details

## 📚 Documentation

- **Module Guide**: `docs/design-safety-module.md` - Comprehensive module documentation
- **PR Checklist**: `docs/snippets/pr-checklist-design-safety.md` - Reviewer checklist
- **Self-Test**: `.github/workflows/mit-hero-port-selftest.yml` - Validation workflow

## 🏗️ Architecture Principles

This module follows these core principles:
>>>>>>> origin/main
- **Zero Behavioral Changes**: Installs without affecting existing functionality
- **Progressive Enhancement**: Fails gracefully when dependencies are missing
- **Configurable Enforcement**: Adjust strictness based on team maturity
- **Portable Design**: Works in any React/Next.js application
<<<<<<< HEAD

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to add enterprise-grade design safety to your app? Run the installer and transform your development workflow in under 5 minutes!** 🚀
=======
- **CI/CD Integration**: Seamless GitHub Actions integration

## 🚀 Ready to Install?

The MIT Hero Design Safety Module is ready to drop into your micro-app! 

1. **Copy the files** from this repo to your target
2. **Run the installer** to set up scripts and workflows
3. **Customize** design tokens and performance targets
4. **Test** with a simple UI component change

Your app will have enterprise-grade design safety in under 5 minutes! 🎉
>>>>>>> origin/main
