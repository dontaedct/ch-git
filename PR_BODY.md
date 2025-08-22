# Final Hardening Sweep - Design Safety Enforcement

## 🎯 What Became Blocking

### Critical Checks (BLOCKING)
- **Type Checking**: TypeScript compilation errors now block merge
- **ESLint**: Design guardian rule violations now block merge  
- **UI Contracts**: Import boundary violations now block merge
- **Accessibility**: A11y test failures block merge (when tests exist)
- **Visual Regression**: Visual test failures block merge (when tests exist)

### Performance Checks (SOFT-FAIL)
- **LHCI Performance**: Currently soft-fail, will hard-fail in 14 days

## 📊 Thresholds Set

### Visual Regression
- **maxDiffPixelRatio**: 0.01 (1% pixel difference tolerance)
- **Rationale**: Industry standard that balances strictness with practical tolerance

### LHCI Performance Budgets
- **Global**: Performance 0.8, Accessibility 0.9, Best Practices 0.8
- **Per-route overrides**: Documented in `design/budgets/lhci-budgets.json`
- **Route-specific targets**: `/intake` (0.9), `/sessions` (0.75), `/client-portal` (0.8)

## 🔧 Rollback Steps

### LHCI Soft/Hard Toggle
```bash
# Edit .github/workflows/design-safety.yml
# Change continue-on-error: true to false (or remove line)
```

### Emergency Rollback
```bash
# Set continue-on-error: true for any blocking step
# Or comment out entire design-safety job
```

## 📅 LHCI Hard-Fail Timeline

- **Current**: SOFT-FAIL (continue-on-error: true)
- **Target Date**: 2025-01-27 (14 days from now)
- **Action**: Remove continue-on-error from LHCI step
- **Impact**: Performance regressions will block merge

## ✅ Acceptance Criteria Met

- [x] Failing UI contract or ESLint design violation blocks merge
- [x] Visual/A11y only run when tests exist; otherwise skip
- [x] LHCI runs and reports but doesn't block (yet)
- [x] Type checking and linting are blocking
- [x] UI contracts exit non-zero on violations
- [x] Durable thresholds set
- [x] Rollback procedures documented

## 🚀 Impact

This PR converts the design safety system from advisory to enforced, ensuring:
- **Code quality**: Import boundaries and component contracts are enforced
- **Accessibility**: WCAG compliance is validated
- **Visual consistency**: UI regressions are caught early
- **Performance**: Performance budgets are monitored (soft-fail → hard-fail)

All critical design safety checks now block merge, while LHCI remains soft-fail for 14 days to allow performance optimization before becoming blocking.
