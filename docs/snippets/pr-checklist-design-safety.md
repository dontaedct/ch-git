# Design Safety PR Checklist

## Reviewer Checks

### 🚫 Import Boundaries
- [ ] No adapter imports in UI components
- [ ] No business logic in UI components  
- [ ] No route handlers imported by components

### ♿ Accessibility
- [ ] A11y labels present and meaningful
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

### 🎨 Visual Consistency
- [ ] No unintended visual changes
- [ ] Design tokens used consistently
- [ ] Component library integrity maintained

### 📋 Route Invariants
- [ ] Route structure unchanged
- [ ] No breaking API changes
- [ ] Contract tests pass

### ✅ Design Check
- [ ] `npm run design:check` passes
- [ ] No new linting errors
- [ ] Type checking passes

## Pre-Merge Checklist

1. **Run locally**: `npm run design:check`
2. **Visual tests**: Ensure baselines exist or update them
3. **A11y tests**: Verify keyboard navigation and screen reader support
4. **Contract tests**: Confirm component APIs unchanged

## Common Issues

- **Missing baselines**: Run `npx playwright test tests/ui/visual.spec.ts --update-snapshots` on main
- **Import violations**: Move business logic out of UI components
<<<<<<< HEAD
- **Contract failures**: Check component prop interfaces and exports
=======
- **Contract failures**: Check component prop interfaces and exports
>>>>>>> origin/main
