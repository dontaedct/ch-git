# Visual Regression Testing Guide

## Overview
This project uses Playwright's `toHaveScreenshot` functionality to perform automated visual regression testing. Visual tests capture screenshots of hero pages and compare them against baseline images to detect unintended visual changes.

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Dependencies installed (`npm install`)
- Development server can run (`npm run dev`)

### Running Tests
```bash
# Run visual regression tests
npm run ui:visual

# Update screenshot baselines (use when intentional changes are made)
npm run ui:visual:update
```

## Test Coverage

### Hero Pages
The following critical pages are tested for visual consistency:

1. **Client Portal** (`/client-portal`)
   - Authentication interface
   - Portal dashboard
   - Loading states

2. **Weekly Plans** (`/weekly-plans`)
   - Plan management interface
   - Client selection
   - Task management
   - Loading and loaded states

3. **Trainer Profile** (`/trainer-profile`)
   - Profile management
   - Client showcase interface

### Breakpoint Testing
Each page is tested across multiple viewport sizes:
- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667

### State Testing
- Loading states (spinners, skeletons)
- Loaded states (full content)
- Responsive behavior

## Configuration

### Threshold Settings
- **maxDiffPixelRatio**: 0.01 (1% tolerance)
- **fullPage**: true (capture entire page)
- **timeout**: 30 seconds per test

### Playwright Configuration
```typescript
// playwright.config.ts
webServer: {
  command: 'npx next dev --port 3000',
  url: 'http://localhost:3000',
  reuseExistingServer: !process.env.CI,
  timeout: 120 * 1000,
}
```

## Workflow

### First Run (Baseline Creation)
1. Run `npm run ui:visual:update`
2. This creates baseline screenshots in `tests/ui/__snapshots__/`
3. Commit baseline images to version control

### Regular Testing
1. Run `npm run ui:visual`
2. Tests compare current screenshots against baselines
3. Failures indicate visual regressions

### Updating Baselines
1. Make intentional visual changes
2. Run `npm run ui:visual:update`
3. Review new baselines
4. Commit updated images

## CI Integration

### GitHub Actions
Visual tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual workflow dispatch

### Artifacts
CI uploads three types of artifacts:
1. **Playwright Report**: HTML test results
2. **Test Screenshots**: Current test run screenshots
3. **Baseline Screenshots**: Reference images for comparison

### Artifact Retention
- Test results: 30 days
- Screenshots: 30 days
- Baselines: 30 days

## Troubleshooting

### Common Issues

#### Test Failures
- Check if visual changes are intentional
- Verify baseline images are up to date
- Review screenshot differences in CI artifacts

#### Baseline Mismatches
- Run `npm run ui:visual:update` to refresh baselines
- Ensure consistent environment (browser versions, OS)
- Check for dynamic content that changes between runs

#### Performance Issues
- Tests run sequentially in CI for consistency
- Each test waits for `networkidle` state
- Consider reducing viewport sizes for faster execution

### Debug Mode
```bash
# Run with headed browser for debugging
npx playwright test tests/ui/visual.spec.ts --headed

# Run specific test
npx playwright test tests/ui/visual.spec.ts --grep "client-portal"
```

## Best Practices

### Baseline Management
- Commit baseline images to version control
- Update baselines only for intentional changes
- Review baseline changes in PRs

### Test Stability
- Use `waitForLoadState('networkidle')` for consistent loading
- Add appropriate timeouts for dynamic content
- Test across multiple browsers (Chromium, Firefox, WebKit)

### CI Optimization
- Cache Playwright browsers
- Run tests in parallel when possible
- Upload artifacts only on failure for efficiency

## Future Enhancements

### Planned Features
- Dark mode testing
- Component-level visual testing
- Animated content handling
- Cross-browser visual consistency validation

### Integration Opportunities
- Design system component testing
- Storybook integration
- Visual diff reporting in PRs
- Automated baseline review workflows
