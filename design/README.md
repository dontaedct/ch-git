# MIT Hero Design Safety Module

## Overview

The MIT Hero Design Safety Module provides comprehensive design governance for UI components and design systems. It enforces design contracts, import boundaries, and design token usage through ESLint rules and automated validation.

## 🎯 Design Guardian Features

### Phase 1: Advisory Mode (Current)
- **Raw Hex Color Ban**: Prevents use of raw hex colors in JSX/classNames
- **Inline Style Ban**: Blocks inline styles with controlled exceptions via comments
- **Icon System Enforcement**: Enforces single icon set (Lucide React)
- **Font System Enforcement**: Enforces single font (Geist)
- **Import Boundary Validation**: Prevents UI components from importing data layer directly
- **Tailwind Token Validation**: Ensures class strings use proper Tailwind tokens

### Phase 2: Required Mode (Future)
- All advisory rules become hard requirements
- Violations block commits and deployments
- Full design system compliance enforcement

## 🚀 Quick Start

### Check Current Status
```bash
npm run design:guardian
```

### Run in Advisory Mode (Warnings Only)
```bash
npm run design:guardian:advisory
```

### Run in Required Mode (Errors Block)
```bash
npm run design:guardian:required
```

### Toggle Between Modes
```bash
npm run design:guardian:toggle
```

### Run Component Contract Validation
```bash
npm run ui:contracts
```

## 📁 File Structure

```
design/
├── budgets/                    # Performance budgets and limits
│   ├── bundle-limits.json     # Bundle size limits
│   └── lhci-budgets.json     # Lighthouse CI performance budgets
├── policies/                   # Design enforcement rules
│   ├── eslint-design.config.cjs    # Design-specific ESLint rules
│   ├── import-boundaries.cjs       # UI boundary validation
│   └── token-guards.cjs            # Design token enforcement
├── scripts/                    # Design safety runners
│   └── design-guardian.mjs        # Main design safety runner
├── lhci.config.cjs            # Lighthouse CI configuration
└── README.md                   # This file
```

## 🚀 Lighthouse CI Performance Budgets

The project includes Lighthouse CI (LHCI) for automated performance testing and budget enforcement.

### Configuration

- **Config File**: `design/lhci.config.cjs` - Main LHCI configuration
- **Budgets**: `design/budgets/lhci-budgets.json` - Performance budget definitions
- **Routes**: `/client-portal` and `/weekly-plans` (dashboard-like pages)

### Performance Targets

| Metric | Target | Level |
|--------|--------|-------|
| Performance Score | ≥ 0.85 | Warning |
| Accessibility Score | ≥ 0.95 | Error |
| CLS (Cumulative Layout Shift) | ≤ 0.10 | Warning |
| JavaScript Bundle Size | ≤ 250KB | Warning |
| LCP (Largest Contentful Paint) | ≤ 2500ms | Warning |
| FCP (First Contentful Paint) | ≤ 1800ms | Warning |
| TTI (Time to Interactive) | ≤ 3500ms | Warning |
| TBT (Total Blocking Time) | ≤ 300ms | Warning |

### Usage

#### Local Development
```bash
# Check LHCI configuration
npm run ui:perf

# Run full performance audit (requires dev server)
lhci autorun --config=design/lhci.config.cjs --budget-path=design/budgets/lhci-budgets.json
```

#### CI/CD
LHCI runs automatically on PRs labeled with `performance` or `ui` labels via the `design-safety.yml` workflow.

### Current Status: Soft-Fail

Performance tests currently use warning levels to avoid blocking PRs. This will be changed to hard-fail (error levels) in a future update after establishing baseline performance.

### Troubleshooting

1. **Server Not Running**: LHCI requires a running development server for local testing
2. **Chrome Issues**: Ensure Chrome/Chromium is installed and accessible
3. **Configuration**: Run `npm run ui:perf` to validate configuration

## 🔧 Configuration

### ESLint Integration
The Design Guardian extends the main ESLint configuration in `.eslintrc.json`:

```json
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript",
    "./design/policies/eslint-design.config.cjs",
    "./design/policies/import-boundaries.cjs",
    "./design/policies/token-guards.cjs"
  ]
}
```

### Policy Files
- **eslint-design.config.cjs**: Core design rules and icon/font enforcement
- **import-boundaries.cjs**: Import boundary validation for UI components
- **token-guards.cjs**: Tailwind token validation and design token protection

## 📋 Design Safety Rules

### 1. No Raw Hex Colors
❌ **Forbidden**:
```tsx
<div className="bg-[#ff0000]">Red text</div>
```

✅ **Allowed**:
```tsx
<div className="bg-red-500">Red text</div>
```

### 2. No Inline Styles
❌ **Forbidden**:
```tsx
<div style={{ color: 'red', fontSize: '16px' }}>Text</div>
```

✅ **Allowed**:
```tsx
<div className="text-red-500 text-base">Text</div>
```

**Controlled Exception**:
```tsx
{/* eslint-disable-next-line react/forbid-component-props */}
<div style={{ color: 'red' }}>Exception text</div>
```

### 3. Single Icon System (Lucide)
❌ **Forbidden**:
```tsx
import { Icon } from 'react-icons/fa'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
```

✅ **Allowed**:
```tsx
import { ChevronDown } from 'lucide-react'
```

### 4. Single Font System (Geist)
❌ **Forbidden**:
```tsx
import { Inter } from '@fontsource/inter'
import { Roboto } from 'next/font/roboto'
```

✅ **Allowed**:
```tsx
import { GeistSans } from 'next/font/geist'
```

### 5. Import Boundaries
❌ **Forbidden in UI Components**:
```tsx
import { createClient } from '@/lib/supabase/client'
import { getClients } from '@/data/clients.repo'
```

✅ **Allowed**:
```tsx
import { useClients } from '@/hooks/use-clients'
import { clientAdapter } from '@/lib/adapters/client-adapter'
```

### 6. Tailwind Token Validation
❌ **Forbidden**:
```tsx
<div className="custom-class-name">Text</div>
```

✅ **Allowed**:
```tsx
<div className="text-gray-900 font-medium">Text</div>
```

## 🔄 Mode Toggle

### Advisory Mode (Default)
- Violations generate warnings
- Development continues without blocking
- Good for gradual adoption and education

### Required Mode
- Violations generate errors
- Blocks commits and deployments
- Enforces full compliance

### Toggle Process
1. Run `npm run design:guardian:toggle`
2. System switches between modes
3. ESLint configuration updates automatically
4. Run appropriate command for the new mode

## 🧪 Testing

### Run All Design Checks
```bash
npm run design:check
```

### Run Full Design Suite
```bash
npm run design:check:full
```

### Individual Checks
```bash
npm run ui:contracts    # Component contracts
npm run ui:a11y         # Accessibility (future)
npm run ui:visual       # Visual regression (future)
npm run ui:perf         # Performance (future)
```

## 🚨 Troubleshooting

### Common Issues

1. **ESLint Plugin Errors**
   - Ensure `eslint-plugin-tailwindcss` is installed
   - Check plugin configuration in policy files

2. **Import Boundary Violations**
   - Create adapters in `@/lib/adapters/*`
   - Use existing data hooks instead of direct imports

3. **Design Token Issues**
   - Use Tailwind utility classes
   - Extend Tailwind config for custom tokens
   - Avoid arbitrary values in class names

### Reset to Default
```bash
npm run design:guardian:advisory
```

## 🔮 Future Enhancements

### Phase 2: A11y & Visual
- Playwright integration for accessibility testing
- Visual regression testing with screenshot baselines
- Automated accessibility validation

### Phase 3: Performance Budgets
- Lighthouse CI integration
- Bundle size monitoring
- Performance budget enforcement

### Phase 4: Portability
- Standalone module for other micro-apps
- Configuration templates
- Migration guides

## 📚 References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Icons](https://lucide.dev/guide/packages/lucide-react)
- [Geist Font](https://vercel.com/font/geist)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [MIT Hero System](../README.md)

## 🤝 Contributing

When modifying design policies:
1. Update this README
2. Test with `npm run design:guardian`
3. Ensure backward compatibility
4. Document breaking changes

**Note**: When using the Supabase CLI for schema changes, add a README note advising to run `supabase migration new <name>`.

---

**MIT Hero Design Safety Module v1.0.0**
*Enforcing design excellence through automated governance*
