# Final Hardening Sweep - Design Safety Enforcement

## 🎯 Objective
Convert remaining advisory checks → enforced, set durable thresholds, and document rollback procedures.

## ✅ What Was Accomplished

### 1. ESLint & Contracts - Now BLOCKING
- **Design Guardian rules** are now **ERROR level** (not warnings)
- **UI contracts** exit non-zero on violations
- **Component contract auditor** validates import boundaries and API contracts
- **Import boundary violations** block merge (UI components cannot import business logic, data layers, or route handlers)

### 2. Workflow Enforcement - All Critical Checks BLOCKING
- **Type checking**: ✅ BLOCKING (must pass)
- **Linting**: ✅ BLOCKING (must pass)  
- **UI Contracts**: ✅ BLOCKING (must pass)
- **Accessibility**: ✅ BLOCKING (when tests exist)
- **Visual Regression**: ✅ BLOCKING (when tests exist)
- **LHCI Performance**: 🟡 SOFT-FAIL (will hard-fail in 14 days)

### 3. Thresholds Set
- **Visual**: `maxDiffPixelRatio: 0.01` (1% pixel difference tolerance)
  - Rationale: Industry standard for visual regression testing
  - Balances strictness with practical tolerance for system differences
- **LHCI Budgets**: Current thresholds maintained
  - Per-route overrides documented in `design/budgets/lhci-budgets.json`
  - Route-specific performance targets (e.g., `/intake` must be faster than `/sessions`)

### 4. Documentation Updated
- **Enforcement Levels table** added to `docs/design-safety-module.md`
- **Rollback procedures** documented for emergency situations
- **LHCI transition plan** noted (soft-fail → hard-fail on 2025-01-27)

## 🔧 Rollback Procedures

### Immediate Rollback (Emergency)
```bash
# Toggle LHCI soft/hard by continue-on-error in workflow
# Edit .github/workflows/design-safety.yml
# Change continue-on-error: true to false (or remove line)
```

### Gradual Rollback
1. Remove specific check from workflow
2. Set `continue-on-error: true` for that step
3. Re-enable when issues are resolved

### Full Rollback
```bash
# Comment out entire design-safety job in workflow
# Or set continue-on-error: true for all steps
```

## 📅 LHCI Hard-Fail Timeline

- **Current**: SOFT-FAIL (`continue-on-error: true`)
- **Target Date**: 2025-01-27 (14 days from now)
- **Action Required**: Remove `continue-on-error: true` from LHCI step
- **Impact**: Performance regressions will block merge

## 🚨 What Blocks Merge Now

1. **TypeScript compilation errors**
2. **ESLint violations**
3. **UI contract violations** (import boundaries, component contracts)
4. **Accessibility test failures** (when tests exist)
5. **Visual regression test failures** (when tests exist)

## 🟡 What Doesn't Block Merge (Yet)

1. **LHCI performance failures** (soft-fail until 2025-01-27)
2. **Missing tests** (A11y/Visual skip cleanly when tests don't exist)

## 📁 Files Created/Modified

### New Files
- `design/lhci.config.cjs` - LHCI configuration with performance thresholds
- `design/budgets/lhci-budgets.json` - Per-route performance budgets
- `tests/ui/visual.spec.ts` - Visual regression tests with 1% threshold
- `tests/ui/a11y.spec.ts` - Accessibility tests for WCAG compliance
- `tests/ui/global-setup.ts` - Playwright global setup
- `tests/ui/global-teardown.ts` - Playwright global teardown
- `playwright.config.ts` - Playwright configuration for UI testing
- `design/scripts/component-contract-auditor.mjs` - Component contract validation

### Modified Files
- `.github/workflows/design-safety.yml` - Made critical checks blocking
- `docs/design-safety-module.md` - Added enforcement levels and rollback docs

## 🧪 Testing the System

### Run UI Contracts
```bash
npm run ui:contracts
```

### Run Visual Tests
```bash
npx playwright test tests/ui/visual.spec.ts
```

### Run Accessibility Tests
```bash
npx playwright test tests/ui/a11y.spec.ts
```

### Run LHCI (if configured)
```bash
npx lhci autorun --config=design/lhci.config.cjs
```

## 🎉 Acceptance Criteria Met

✅ **Failing UI contract or ESLint design violation blocks merge**
✅ **Visual/A11y only run when tests exist; otherwise skip**
✅ **LHCI runs and reports but doesn't block (yet)**
✅ **Type checking and linting are blocking**
✅ **UI contracts exit non-zero on violations**
✅ **Durable thresholds set (maxDiffPixelRatio: 0.01)**
✅ **Rollback procedures documented**
✅ **LHCI hard-fail date set (2025-01-27)**

## 🚀 Next Steps

1. **Monitor workflow runs** to ensure all checks pass
2. **Address any violations** that surface during enforcement
3. **Prepare for LHCI hard-fail** on 2025-01-27
4. **Consider adding more UI tests** to increase coverage
5. **Monitor performance budgets** and adjust as needed

---

**PR Title**: `chore(hardening): enforce design checks; LHCI soft-fail (will hard-fail in 14d)`

**Status**: ✅ **READY FOR MERGE** - All design safety checks are now enforced and blocking.
