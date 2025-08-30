# Accessibility Testing with Playwright + axe-core

## Overview

This project uses Playwright with axe-core for automated accessibility testing. The tests are currently running in **advisory mode**, which means they will report accessibility violations but won't cause test failures.

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run ui:a11y:install
```

## Running Tests

### Basic Accessibility Test

```bash
# Run all accessibility tests
npm run ui:a11y

# Run with specific browser
npx playwright test tests/ui/a11y.spec.ts --project=chromium
```

### Test Output

Tests generate HTML reports in the `playwright-report/` directory. Open `playwright-report/index.html` to view detailed results.

## Test Coverage

The accessibility tests cover the following critical screens:

- **Homepage** (`/`) - Basic accessibility standards
- **Client Portal** (`/client-portal`) - Client-facing forms and dashboards
- **Trainer Profile** (`/trainer-profile`) - Trainer management forms
- **Weekly Plans** (`/weekly-plans`) - Planning and scheduling interfaces

## Test Categories

### 1. Automated axe-core Scans

- WCAG 2.1 Level A compliance
- WCAG 2.1 Level AA compliance
- Color contrast ratios
- Proper heading structure
- ARIA labels and landmarks

### 2. Keyboard Navigation

- Tab order testing
- Focus indicator visibility
- Keyboard-only operation support

### 3. Form Accessibility

- Input labeling
- Error message association
- Required field indicators

### 4. Content Structure

- Heading hierarchy
- List markup
- Image alt text
- Landmark regions

## Configuration

### Advisory Mode

Tests are configured to run in advisory mode by default:

```typescript
export const advisoryModeConfig = {
  failOnViolations: false, // Don't fail tests on violations
  reportViolations: true,  // But do report them
  logLevel: 'info'         // Log level for violations
};
```

### Custom Rules

You can customize which accessibility rules to run by modifying `tests/ui/a11y.config.ts`:

```typescript
export const createAxeBuilder = (page: any) => {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .withRules({
      'color-contrast': { enabled: true },
      'document-title': { enabled: true },
      // ... more rules
    });
};
```

## Transitioning to Hard-Fail Mode

When ready to enforce accessibility standards strictly:

1. Update `advisoryModeConfig.failOnViolations` to `true`
2. Fix all reported violations
3. Update test expectations to require zero violations
4. Consider adding accessibility gates to CI/CD pipeline

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run Accessibility Tests
  run: npm run ui:a11y
  env:
    CI: true
```

### Vercel

Accessibility tests run as part of the build process:

```json
{
  "scripts": {
    "build": "npm run ui:a11y && next build"
  }
}
```

## Troubleshooting

### Common Issues

1. **Browser Installation**: Run `npm run ui:a11y:install` if tests fail to start
2. **Port Conflicts**: Ensure port 3000 is available for the dev server
3. **Timeout Issues**: Increase timeout in `playwright.config.ts` for slower environments

### Debug Mode

Run tests with debug output:

```bash
npx playwright test tests/ui/a11y.spec.ts --debug
```

## Resources

- [axe-core Documentation](https://github.com/dequelabs/axe-core)
- [Playwright Testing](https://playwright.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

## Contributing

When adding new accessibility tests:

1. Follow the existing test structure
2. Use the `createAxeBuilder` helper
3. Add appropriate test descriptions
4. Update this documentation if needed
5. Ensure tests pass in advisory mode before committing
