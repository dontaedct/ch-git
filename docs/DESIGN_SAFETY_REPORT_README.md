# Design Safety Report - In-App Dashboard

## Overview

The Design Safety Report is a development-only page that provides a comprehensive overview of design safety metrics, violations, and compliance status directly within the application.

## Access

**URL**: `/design-report`  
**Requirement**: `NEXT_PUBLIC_DEBUG=1` environment variable must be set

## Features

### 🛡️ Design Guardian
- ESLint violations and warnings
- Component contract validation status
- Import boundary compliance

### ♿ A11y Ranger
- Accessibility test results
- WCAG compliance status
- A11y issue counts

### 👁️ Visual Watch
- Visual regression test results
- Design consistency metrics
- Component library integrity

### 💰 UX Budgeteer
- Lighthouse CI performance scores
- Performance budget compliance
- Core Web Vitals status

## Data Sources

The report reads from `.cache/design-safety/` directory, which is populated by the GitHub Actions workflow:

- **Workflow**: `.github/workflows/design-safety.yml`
- **Artifacts**: `design-safety-summaries` (30-day retention)
- **Cache Location**: `.cache/design-safety/` (committed to PR branches when possible)

## Testing

### Create Test Data
```bash
npm run test:design-report
```

### Clean Up Test Data
```bash
npm run test:design-report:cleanup
```

## Implementation Details

- **Page**: `app/_debug/design-report/page.tsx`
- **Data Reader**: `lib/design-safety-reader.ts`
- **Documentation**: `docs/design-report.md`
- **Test Script**: `scripts/test-design-report.mjs`

## Workflow Integration

The design-safety workflow automatically:
1. Runs all safety checks
2. Generates JSON summaries
3. Saves to `.cache/design-safety/`
4. Uploads as GitHub artifacts
5. Commits cache to PR branches (when permitted)

## Future Enhancements

- Real-time updates via WebSocket
- Historical trend analysis
- Export functionality
- Custom alerting for critical violations
- Integration with design system documentation
