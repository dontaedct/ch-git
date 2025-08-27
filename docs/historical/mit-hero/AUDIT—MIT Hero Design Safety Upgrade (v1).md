# AUDIT—MIT Hero Design Safety Upgrade (v1)

## TL;DR

**Big Win**: Existing MIT Hero system with doctor/guardian scripts provides solid foundation for design safety integration  
**Biggest Risk**: UI components directly importing data layer (e.g., `progress-dashboard.tsx` imports Supabase client)  
**Fastest Win (<2 hrs)**: Add ESLint rules to prevent raw hex colors and inline styles  
**Highest ROI (1 day)**: Implement Design Guardian with import boundary enforcement  
**Safest First Step**: Create design token audit and enforce single font/icon system  

---

## Executive Summary

This audit examines the current state of the MIT Hero system and proposes a safe, incremental upgrade to integrate a comprehensive Design Safety Layer. The codebase demonstrates strong foundations with existing MIT Hero infrastructure (doctor scripts, guardian system, universal header compliance) but reveals critical UI boundary violations that must be addressed before scaling.

**Key Findings:**
- **MIT Hero Foundation**: Robust with doctor/guardian scripts, but lacks design safety enforcement
- **UI Boundary Violations**: Critical - components directly import data layer, bypassing adapter pattern
- **Design System**: Partial implementation with Tailwind tokens, but inconsistent usage and missing enforcement
- **Testing Coverage**: Limited to business logic; no UI/a11y/visual regression tests
- **CI/CD**: Basic safety gates exist but lack design-specific guardrails

**Upgrade Strategy**: Implement Design Safety Layer as a portable module that can be copied to other micro-apps without breaking existing functionality. Focus on incremental enforcement that maintains current MIT Hero capabilities while adding design governance.

**Confidence Level**: High (85%) - existing infrastructure provides solid foundation, clear upgrade path identified

---

## Stack & Architecture Inventory

### Stack Table

| Technology | Version | Status | Notes |
|------------|---------|---------|-------|
| **Framework** | Next.js 15.4.6 | ✅ Current | App Router, TypeScript |
| **React** | 19.1.0 | ✅ Current | Latest stable |
| **TypeScript** | 5.x | ✅ Strict | `strict: true`, `noImplicitAny: false` |
| **Tailwind CSS** | 3.4.17 | ✅ Current | Custom design tokens, @tailwindcss/forms |
| **UI Library** | Radix UI + shadcn/ui | ✅ Current | Comprehensive component set |
| **Testing** | Jest 30.0.5 | ⚠️ Limited | Business logic only, no UI tests |
| **Linting** | ESLint 9 + Next.js config | ✅ Current | Basic rules, no design enforcement |
| **CI/CD** | GitHub Actions | ✅ Current | Basic safety gates, no design checks |

### Repo Map (≤3 levels)

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── design-system/     # Design system showcase
│   ├── guardian-demo/     # Guardian system demo
│   └── [feature-routes]/  # Business logic routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components (51 files)
│   └── [business]/       # Business-specific components
├── scripts/              # MIT Hero orchestration
│   ├── doctor.ts         # TypeScript health checker
│   ├── guardian.js       # Backup/restore system
│   └── mit-hero-*.mjs    # MIT Hero orchestration
├── lib/                  # Utilities and adapters
├── data/                 # Data layer repositories
├── tests/                # Jest test suite
├── .github/workflows/    # CI/CD pipelines
└── supabase/             # Database schema
```

**Architecture Type**: Single Next.js application (not monorepo)

**Routing Convention**: App Router with feature-based directory structure

---

## MIT Hero: Current State

### What Exists

| Component | Location | Status | Capabilities |
|-----------|----------|---------|--------------|
| **Doctor** | `scripts/doctor.ts` | ✅ Operational | TypeScript validation, export analysis, auto-fix |
| **Guardian** | `scripts/guardian.js` | ✅ Operational | Git backups, project snapshots, emergency recovery |
| **MIT Hero Orchestrator** | `scripts/mit-hero-unified-integration.mjs` | ✅ Operational | System integration, health monitoring, auto-healing |
| **Policy Enforcer** | `scripts/policy-enforcer.ts` | ✅ Operational | Import boundary validation, universal header compliance |
| **Safety Smoke** | `scripts/safety-smoke.mjs` | ✅ Operational | Pre-commit validation, safety checks |

### Where It Lives

- **Core Scripts**: `/scripts/` directory
- **Configuration**: `.guardian.config.json`, `.git-master-control.json`
- **Documentation**: `/docs/` directory with comprehensive guides
- **API Integration**: `/app/api/guardian/` routes for web interface

### How It's Invoked

**NPM Scripts:**
- `npm run doctor` - TypeScript health check
- `npm run doctor:fix` - Auto-fix issues
- `npm run guardian` - Backup system
- `npm run policy:enforce` - Boundary validation

**CI Integration:**
- Pre-commit hooks via Husky
- GitHub Actions workflows with safety gates
- Automated health monitoring

### Gaps vs Goals

| Goal | Current State | Gap | Priority |
|------|---------------|-----|----------|
| **Design Safety** | ❌ None | Complete absence of design governance | Critical |
| **UI Boundary Enforcement** | ⚠️ Partial | Policy enforcer exists but no UI-specific rules | High |
| **Accessibility Testing** | ❌ None | No a11y validation in CI or local | High |
| **Visual Regression** | ❌ None | No screenshot testing or baselines | Medium |
| **Performance Budgets** | ❌ None | No Lighthouse CI or performance gates | Medium |
| **Design Token Enforcement** | ⚠️ Partial | Tailwind config exists but no usage validation | Medium |

---

## Design Safety Audit

### 4.1 UI Boundary & Contracts (presentational vs adapters)

**Critical Violations Found:**

| Issue | Severity | Path:Line(s) | Snippet | Impact |
|--------|----------|---------------|---------|---------|
| **Direct Data Import** | Critical | `components/progress-dashboard.tsx:4` | `import { createClient } from '@/lib/supabase/client'` | Bypasses adapter pattern, tight coupling |
| **Inline Data Fetching** | Critical | `components/progress-dashboard.tsx:35-75` | Direct Supabase queries in component | Violates separation of concerns |
| **Missing Adapter Layer** | High | `components/guardian-dashboard.tsx:45-65` | Direct API calls in component | No data abstraction layer |
| **Mixed Responsibilities** | Medium | `components/session-form.tsx` | Form logic + data operations | Should separate presentation from data |

**Evidence of Good Patterns:**
- `components/ui/*` components are properly presentational
- Universal header compliance in place
- Import alias system (`@ui/*`, `@lib/*`) properly configured

### 4.2 Accessibility (findings + evidence)

**Critical Issues:**

| Issue | Severity | Path:Line(s) | Snippet | Recommendation |
|--------|----------|---------------|---------|----------------|
| **Missing Form Labels** | High | `components/intake-form.tsx:45-60` | `<input type="email" />` without label | Add proper `htmlFor` and `id` attributes |
| **No Focus Management** | Medium | `components/progress-dashboard.tsx:80-90` | Loading state without focus trap | Implement proper focus management |
| **Missing ARIA Roles** | Medium | `components/guardian-dashboard.tsx:120-140` | Status indicators without roles | Add `role="status"` and `aria-live` |
| **Color Contrast Risk** | Low | `tailwind.config.js:25-30` | Custom colors without contrast validation | Validate against WCAG AA standards |

**Positive Findings:**
- Radix UI components provide good accessibility foundation
- Semantic HTML structure in most components
- Proper button and form element usage

### 4.3 Visual Consistency (tokens, fonts, icons, spacing)

**Design Token Analysis:**

| Category | Status | Evidence | Issues |
|----------|---------|----------|---------|
| **Colors** | ⚠️ Partial | `tailwind.config.js:25-30` | Custom colors defined but no usage enforcement |
| **Typography** | ✅ Good | `tailwind.config.js:31-36` | Consistent scale: display, headline, body, caption |
| **Spacing** | ✅ Good | `tailwind.config.js:37-42` | Container system with responsive breakpoints |
| **Shadows** | ✅ Good | `tailwind.config.js:23-24` | Apple-inspired shadow system |
| **Border Radius** | ✅ Good | `tailwind.config.js:18-22` | Consistent rounded corners |

**Inconsistencies Found:**

| Issue | Severity | Path:Line(s) | Snippet | Fix |
|--------|----------|---------------|---------|-----|
| **Raw Hex Colors** | Medium | `app/design-system/page.tsx:95-105` | `bg-blue-600`, `bg-green-600` | Use design token variables |
| **Inline Styles** | Low | `app/design-system/page.tsx:60-70` | `style={{animationDelay: '0.1s'}}` | Use Tailwind animation utilities |
| **Mixed Icon Systems** | Medium | Multiple files | Mix of Lucide React and inline SVG | Standardize on Lucide React |

### 4.4 Performance Budgets (risks + suggested budgets)

**Current Performance Risks:**

| Risk | Severity | Evidence | Impact |
|------|----------|----------|---------|
| **Heavy Components** | Medium | `components/progress-dashboard.tsx` | Large bundle size, complex re-renders |
| **No Bundle Analysis** | High | Missing webpack-bundle-analyzer | Unknown bundle size impact |
| **No Performance Monitoring** | High | Missing Lighthouse CI | No performance regression detection |
| **Client-Side Data Fetching** | Medium | Multiple Supabase calls in components | Increased client bundle, slower hydration |

**Suggested Performance Budgets:**

```json
{
  "budgets": [
    {
      "path": "/dashboard",
      "maxSize": "250KB",
      "maxInitialSize": "150KB"
    },
    {
      "path": "/progress",
      "maxSize": "300KB", 
      "maxInitialSize": "200KB"
    },
    "lighthouse": {
      "performance": 85,
      "accessibility": 95,
      "best-practices": 90,
      "seo": 90
    },
    "metrics": {
      "LCP": "2.5s",
      "FID": "100ms", 
      "CLS": "0.1",
      "TTI": "3.0s"
    }
  ]
}
```

### 4.5 Testing/CI Coverage (what's present, what's missing)

**Current Testing Coverage:**

| Test Type | Status | Coverage | Location |
|-----------|---------|----------|----------|
| **Unit Tests** | ✅ Good | Business logic | `/tests/` directory |
| **Integration Tests** | ✅ Good | API contracts | `tests/public-api.contract.spec.ts` |
| **UI Tests** | ❌ None | No component testing | Missing |
| **Accessibility Tests** | ❌ None | No a11y validation | Missing |
| **Visual Regression** | ❌ None | No screenshot testing | Missing |
| **Performance Tests** | ❌ None | No Lighthouse testing | Missing |

**CI Pipeline Analysis:**

| Stage | Status | Coverage | Gaps |
|--------|---------|----------|------|
| **Type Check** | ✅ Required | All files | None |
| **Linting** | ⚠️ Advisory | Basic rules | No design enforcement |
| **Testing** | ⚠️ Advisory | Business logic only | No UI/a11y tests |
| **Build** | ✅ Required | Production build | None |
| **Security** | ✅ Required | npm audit | None |

---

## Findings & Evidence Tables

### UI Boundary & Contracts

| Issue | Severity | Path:Line(s) | Snippet | Recommendation | Effort |
|-------|----------|---------------|---------|----------------|---------|
| Direct Supabase import | Critical | `components/progress-dashboard.tsx:4` | `import { createClient } from '@/lib/supabase/client'` | Create data adapter layer | 1 day |
| Inline data fetching | Critical | `components/progress-dashboard.tsx:35-75` | Direct component queries | Move to custom hooks/adapters | 2 days |
| Missing error boundaries | High | Multiple components | No error handling for data failures | Implement error boundaries | 1 day |
| Mixed responsibilities | Medium | `components/session-form.tsx` | Form + data logic combined | Separate concerns | 0.5 day |

### Accessibility Issues

| Issue | Severity | Path:Line(s) | Snippet | Recommendation | Effort |
|-------|----------|---------------|---------|----------------|---------|
| Missing form labels | High | `components/intake-form.tsx:45-60` | `<input />` without label | Add proper labeling | 0.5 day |
| No focus management | Medium | `components/progress-dashboard.tsx:80-90` | Loading states | Implement focus traps | 1 day |
| Missing ARIA roles | Medium | `components/guardian-dashboard.tsx:120-140` | Status indicators | Add semantic roles | 0.5 day |
| Color contrast risk | Low | `tailwind.config.js:25-30` | Custom colors | Validate contrast ratios | 0.5 day |

### Visual Consistency Issues

| Issue | Severity | Path:Line(s) | Snippet | Recommendation | Effort |
|-------|----------|---------------|---------|----------------|---------|
| Raw hex colors | Medium | `app/design-system/page.tsx:95-105` | `bg-blue-600` | Use design tokens | 0.5 day |
| Inline styles | Low | `app/design-system/page.tsx:60-70` | `style={{}}` | Use Tailwind utilities | 0.5 day |
| Mixed icon systems | Medium | Multiple files | Lucide + inline SVG | Standardize on Lucide | 1 day |
| Inconsistent spacing | Low | Various components | Mixed spacing values | Enforce spacing scale | 0.5 day |

### Performance & Testing Gaps

| Issue | Severity | Path:Line(s) | Snippet | Recommendation | Effort |
|-------|----------|---------------|---------|----------------|---------|
| No bundle analysis | High | Missing | No size monitoring | Add webpack-bundle-analyzer | 0.5 day |
| No performance budgets | High | Missing | No Lighthouse CI | Implement performance gates | 1 day |
| No UI testing | Medium | Missing | No component tests | Add Playwright + Testing Library | 2 days |
| No a11y testing | Medium | Missing | No accessibility validation | Add axe-core integration | 1 day |

---

## Upgrade Plan: Make MIT Hero Design-Aware (portable module)

### Design Heroes to Add

#### 1. Design Guardian (Policy Enforcer)
**Purpose**: Enforce design system compliance and UI boundaries
**Implementation**: ESLint rulesets + import boundary validation
**Rules**:
- No raw hex colors (use design tokens)
- No inline styles (use Tailwind utilities)
- Single font/icon system enforcement
- UI import bans (prevent components from importing data layer)

#### 2. A11y Ranger
**Purpose**: Automated accessibility validation
**Implementation**: Playwright + axe-core integration
**Checks**:
- Route-level accessibility scanning
- Keyboard navigation validation
- Contrast ratio compliance
- ARIA role validation

#### 3. Visual Watch
**Purpose**: Visual regression testing and consistency monitoring
**Implementation**: Playwright screenshot baselines + diff thresholds
**Features**:
- Automated screenshot capture
- Visual diff detection
- Baseline management
- Responsive testing

#### 4. UX Budgeteer
**Purpose**: Performance budget enforcement
**Implementation**: Lighthouse CI with configurable budgets
**Budgets**:
- Bundle size limits per route
- Core Web Vitals thresholds
- Performance score minimums
- Resource loading budgets

#### 5. Component Contract Auditor
**Purpose**: Ensure presentational component purity
**Implementation**: Static analysis + TypeScript validation
**Validation**:
- Props interface compliance
- No direct data fetching
- No business logic in UI components
- Proper error boundary usage

### Filesystem Layout Proposal (Portable)

```
design/
├── policies/                 # Design enforcement rules
│   ├── eslint-design.config.js    # Design-specific ESLint rules
│   ├── import-boundaries.js       # UI boundary validation
│   └── token-guards.js            # Design token enforcement
├── budgets/                  # Performance budgets
│   ├── lhci-budgets.json          # Lighthouse CI configuration
│   └── bundle-limits.json         # Bundle size limits
├── scripts/                  # Design safety runners
│   ├── design-guardian.mjs        # Main design safety runner
│   ├── a11y-scanner.mjs           # Accessibility validation
│   ├── visual-watch.mjs           # Visual regression testing
│   └── performance-audit.mjs      # Performance validation
└── templates/                # Reusable configurations
    ├── playwright-a11y.spec.ts    # A11y test template
    ├── visual-regression.spec.ts  # Visual test template
    └── performance-budget.spec.ts # Performance test template

tests/ui/                     # UI-specific test suite
├── a11y.spec.ts             # Accessibility tests
├── visual.spec.ts           # Visual regression tests
├── smoke.spec.ts            # UI smoke tests
└── contracts.spec.ts        # Component contract validation
```

### CI Wiring Plan

**PR Label-Based Workflows:**
- `ui` label: Triggers full design safety suite
- `a11y` label: Accessibility-focused validation
- `performance` label: Performance budget checks
- `visual` label: Visual regression testing

**Workflow Execution:**
1. **Type Check** (required, blocks merge)
2. **Design Guardian** (required for UI changes)
3. **A11y Ranger** (required for UI changes)
4. **Visual Watch** (advisory, creates baselines)
5. **UX Budgeteer** (required for performance changes)
6. **Component Contract Auditor** (required for UI changes)

**Fail Conditions:**
- Design policy violations
- Accessibility regressions
- Performance budget breaches
- Component contract violations

**Artifact Uploads:**
- Screenshot baselines
- Performance reports
- Accessibility violation reports
- Design compliance summaries

### Adoption Strategy for Existing Screens

**Phase 1: Baseline Creation (Week 1)**
- Capture current screenshots for all routes
- Establish performance baselines
- Document current accessibility state
- Create design token inventory

**Phase 2: Gradual Enforcement (Week 2-3)**
- Enable design guardian for new changes
- Run a11y scanner on existing routes
- Implement visual regression baselines
- Add performance monitoring

**Phase 3: Full Enforcement (Week 4+)**
- Require design compliance for all UI changes
- Enforce performance budgets
- Mandate accessibility validation
- Visual regression blocking

### Roll-out Guardrails

**"No Route Rename" Detector:**
- Monitor for route changes in UI PRs
- Block if routes are modified
- Require separate route change PRs

**"No Adapter Mutation" Detector:**
- Prevent UI components from modifying data layer
- Enforce adapter pattern compliance
- Block direct database imports in UI

**"Design Token Compliance" Enforcer:**
- Validate all color/spacing/typography usage
- Block raw hex colors and arbitrary values
- Enforce design system consistency

---

## Phased Roadmap (Conservative & Reversible)

### Phase 0 – Prep (1 day)
**Objective**: Create baselines and mark invariants
**Tasks**:
- [ ] Create design token audit report
- [ ] Capture current UI screenshots
- [ ] Establish performance baselines
- [ ] Document current accessibility state
- [ ] Mark routes as "frozen" (no changes allowed)

**Success Criteria**: All baselines documented, routes protected

### Phase 1 – Contracts & Lint (2-3 days)
**Objective**: Enforce UI purity and design tokens
**Tasks**:
- [ ] Implement Design Guardian ESLint rules
- [ ] Add import boundary validation
- [ ] Enforce design token usage
- [ ] Create component contract validation
- [ ] Zero code behavior change

**Success Criteria**: All design violations caught at lint time

### Phase 2 – A11y & Visual (1 week)
**Objective**: Add accessibility and visual regression testing
**Tasks**:
- [ ] Implement A11y Ranger with Playwright
- [ ] Add Visual Watch screenshot testing
- [ ] Test 2-3 critical routes first
- [ ] Expand to all routes gradually
- [ ] Create accessibility baselines

**Success Criteria**: All routes have a11y and visual coverage

### Phase 3 – Performance Budgets (1 week)
**Objective**: Introduce performance monitoring and budgets
**Tasks**:
- [ ] Implement UX Budgeteer with Lighthouse CI
- [ ] Set soft-fail performance budgets
- [ ] Monitor for 2 weeks
- [ ] Convert to hard-fail after validation
- [ ] Add bundle size monitoring

**Success Criteria**: Performance budgets enforced without blocking delivery

### Phase 4 – Templates for Other Micro-Apps (1 week)
**Objective**: Package MIT Hero Design module for portability
**Tasks**:
- [ ] Create portable design safety module
- [ ] Document integration process
- [ ] Create migration guides
- [ ] Package with minimal configuration
- [ ] Test in isolated environment

**Success Criteria**: Module can be copied to new repos with minimal edits

---

## Risk Register & Mitigations

### Red List (Critical Risks)

| Risk | Probability | Impact | Mitigation | Fallback |
|------|-------------|---------|------------|----------|
| **UI Boundary Violations** | High | Critical | Incremental enforcement | Rollback to current state |
| **Performance Regression** | Medium | High | Soft-fail budgets first | Disable performance gates |
| **Accessibility Blocking** | Low | High | Advisory mode initially | Manual accessibility review |
| **Design System Breaking** | Medium | Medium | Token validation only | Revert to current tokens |

### Yellow List (Medium Risks)

| Risk | Probability | Impact | Mitigation | Fallback |
|------|-------------|---------|------------|----------|
| **CI Pipeline Noise** | Medium | Medium | Staged rollout | Disable problematic checks |
| **False Positives** | High | Low | Tune thresholds | Manual override process |
| **Integration Complexity** | Medium | Medium | Modular implementation | Implement features separately |
| **Team Adoption** | Medium | Low | Training and documentation | Gradual enforcement |

### Mitigation Strategies

**Rollback Plan:**
1. Disable design safety checks in CI
2. Revert to current MIT Hero configuration
3. Restore previous ESLint rules
4. Remove design safety dependencies

**Fallback Processes:**
- Manual design compliance review
- Accessibility validation via browser tools
- Performance monitoring via manual Lighthouse
- Visual regression detection via manual review

---

## Open Questions / Assumptions

### Ambiguous Items Detected

| Item | Current State | Assumption | Default Value |
|------|---------------|------------|---------------|
| **Design Token Scope** | Partial implementation | Extend to all UI components | Full coverage required |
| **Performance Budgets** | Not defined | Route-specific budgets | 250KB max per route |
| **Accessibility Standards** | Not specified | WCAG AA compliance | WCAG AA Level |
| **Visual Regression Thresholds** | Not defined | 5% difference threshold | 5% pixel difference |
| **Bundle Size Limits** | Not specified | Route-based limits | 250KB dashboard, 300KB progress |

### Proposed Defaults

**Design System Defaults:**
- Color palette: Extend current Tailwind config
- Typography: Use existing display/headline/body/caption scale
- Spacing: Enforce current container system
- Shadows: Maintain Apple-inspired aesthetic

**Performance Defaults:**
- LCP: 2.5s maximum
- FID: 100ms maximum
- CLS: 0.1 maximum
- TTI: 3.0s maximum

**Accessibility Defaults:**
- WCAG AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios

---

## Appendix

### Exact Code Snippets Recommended

#### ESLint Design Rules (`design/policies/eslint-design.config.js`)

```javascript
module.exports = {
  rules: {
    // No raw hex colors
    'no-restricted-properties': [
      'error',
      {
        object: 'className',
        property: 'includes',
        message: 'Use design tokens instead of raw hex colors'
      }
    ],
    
    // No inline styles
    'no-inline-styles': 'error',
    
    // Enforce design token usage
    'design-tokens/use-tokens': 'error',
    
    // Prevent UI components from importing data layer
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          '@/lib/supabase/*',
          '@/data/*',
          '@/lib/db/*'
        ],
        message: 'UI components must use adapters, not direct data imports'
      }
    ]
  }
};
```

#### Lighthouse CI Configuration (`design/budgets/lhci-budgets.json`)

```json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/dashboard", "http://localhost:3000/progress"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.95}],
        "categories:best-practices": ["warn", {"minScore": 0.90}],
        "categories:seo": ["warn", {"minScore": 0.90}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 2500}],
        "largest-contentful-paint": ["warn", {"maxNumericValue": 4000}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

#### Playwright A11y Test Template (`design/templates/playwright-a11y.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should meet accessibility standards', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.keyboard.press('Tab');
    
    // Verify focus management
    const focusedElement = await page.evaluate(() => document.activeElement);
    expect(focusedElement).toBeTruthy();
  });
});
```

#### Component Contract Validation (`design/scripts/component-contract-auditor.mjs`)

```javascript
import { Project } from 'ts-morph';

class ComponentContractAuditor {
  async auditComponent(filePath) {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(filePath);
    
    // Check for direct data imports
    const imports = sourceFile.getImportDeclarations();
    const hasDataImports = imports.some(imp => 
      imp.getModuleSpecifierValue().includes('@/lib/supabase') ||
      imp.getModuleSpecifierValue().includes('@/data')
    );
    
    if (hasDataImports) {
      throw new Error(`Component ${filePath} has direct data imports`);
    }
    
    // Check for proper props interface
    const interfaces = sourceFile.getInterfaces();
    const hasPropsInterface = interfaces.some(int => 
      int.getName() === 'Props' || int.getName().includes('Props')
    );
    
    if (!hasPropsInterface) {
      throw new Error(`Component ${filePath} missing Props interface`);
    }
    
    return { valid: true, violations: [] };
  }
}
```

### File Paths for Implementation

**Do not apply yet - these are the planned locations:**

- `design/policies/eslint-design.config.js` - Design ESLint rules
- `design/budgets/lhci-budgets.json` - Performance budgets
- `design/scripts/design-guardian.mjs` - Main design safety runner
- `design/templates/playwright-a11y.spec.ts` - A11y test template
- `tests/ui/a11y.spec.ts` - Accessibility test suite
- `tests/ui/visual.spec.ts` - Visual regression tests
- `.github/workflows/design-safety.yml` - Design safety CI workflow

---

## Conclusion

This audit reveals a codebase with strong MIT Hero foundations but critical gaps in design safety enforcement. The proposed Design Safety Layer upgrade provides a safe, incremental path to comprehensive design governance while maintaining the existing system's capabilities.

**Key Success Factors:**
1. **Incremental Implementation**: Phase-based rollout prevents disruption
2. **Portable Module**: Can be copied to other micro-apps
3. **Existing Foundation**: Builds on proven MIT Hero infrastructure
4. **Zero Breaking Changes**: Maintains current functionality

**Next Steps:**
1. Begin Phase 0 (baseline creation)
2. Implement Design Guardian ESLint rules
3. Add accessibility testing infrastructure
4. Establish performance monitoring
5. Create portable module package

The upgrade will transform MIT Hero from a technical health system to a comprehensive design safety platform, ensuring consistent, accessible, and performant user experiences across all micro-apps.
