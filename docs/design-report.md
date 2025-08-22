# Design Report Page

A development-only page that provides a comprehensive overview of design safety metrics, violations, and compliance status.

## Access

The design report page is only available when `NEXT_PUBLIC_DEBUG=1` is set in your environment.

### Local Development

```bash
# Set the debug environment variable
set NEXT_PUBLIC_DEBUG=1  # Windows
export NEXT_PUBLIC_DEBUG=1  # macOS/Linux

# Or add to your .env.local file
NEXT_PUBLIC_DEBUG=1

# Start the development server
npm run dev
```

Then visit `/design-report` in your browser.

## What It Shows

The design report aggregates information from the design-safety workflow into four main sections:

### 🛡️ Design Guardian
- **ESLint Violations**: Code quality and style violations
- **Contract Violations**: Component API contract breaches
- **Import Boundaries**: Architecture boundary violations

### ♿ A11y Ranger
- **WCAG Compliance**: Accessibility standards compliance
- **Keyboard Navigation**: Keyboard accessibility status
- **Screen Reader Support**: ARIA and semantic HTML validation

### 👁️ Visual Watch
- **Visual Diffs**: Screenshot-based regression detection
- **Design Tokens**: Design system consistency
- **Component Library**: Visual component integrity

### 💰 UX Budgeteer
- **Lighthouse Score**: Performance and best practices
- **Bundle Size**: JavaScript bundle analysis
- **Core Web Vitals**: User experience metrics

## Data Sources

The page reads from `.cache/design-safety/` directory, which is populated by the design-safety workflow when it runs. The workflow saves JSON summaries of:

- ESLint results
- Contract validation results
- Accessibility test results
- Visual regression test results
- Lighthouse CI scores

## Workflow Integration

The design-safety workflow automatically saves summaries to the cache directory, making them available for the in-app report. This provides developers with immediate feedback on design safety status without needing to check GitHub Actions logs.

## Future Enhancements

- Real-time updates via WebSocket
- Historical trend analysis
- Export functionality for reports
- Integration with design system documentation
- Custom alerting for critical violations
