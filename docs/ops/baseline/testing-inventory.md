# Testing Inventory - Frameworks, Configuration & Coverage

Generated on: 2025-08-29T03:53:00Z

## Testing Framework Overview

### Primary Testing Stack
- **Jest**: Unit and integration testing framework
- **Playwright**: End-to-end (E2E) testing and visual regression
- **Testing Library**: React component testing utilities
- **Jest DOM**: DOM testing matchers for Jest

## Jest Configuration

### Core Configuration
- **Framework**: Next.js Jest integration
- **Environment**: jsdom (browser-like environment)
- **Setup**: jest.setup.js for global test configuration

### Module Aliases
- **@app/**: `./app/` - Application routes and pages
- **@data/**: `./data/` - Data layer and models
- **@lib/**: `./lib/` - Utility libraries and business logic
- **@ui/**: `./components/ui/` - UI components
- **@registry/**: `./lib/registry/` - Component registry
- **@compat/**: `./lib/compat/` - Compatibility layers

### Test Coverage Configuration
- **Coverage Collection**: Enabled for app/, components/, lib/
- **Exclusions**: TypeScript definitions, node_modules
- **Coverage Reports**: HTML and console output

### Test Path Patterns
- **Include**: All TypeScript/JavaScript files in source directories
- **Exclude**: 
  - `.next/` (build artifacts)
  - `node_modules/` (dependencies)
  - `tests/ui/` (Playwright tests)
  - `tests/playwright/` (Playwright test files)
  - `design/templates/` (design templates)
  - `attic/` (archived files)
  - `examples/` (example code)

## Playwright Configuration

### E2E Testing Setup
- **Test Directory**: `./tests`
- **Parallel Execution**: Enabled (fullyParallel: true)
- **CI Mode**: Forbids test.only, enables retries
- **Workers**: 1 on CI, unlimited locally

### Browser Support
- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)
- **Cross-platform**: Full browser compatibility testing

### Test Environment
- **Base URL**: http://localhost:3000
- **Web Server**: Next.js dev server (port 3000)
- **Timeout**: 30 seconds global, 5 seconds for assertions
- **CI Integration**: Disables dev tools, enables retries

### Test Artifacts
- **Screenshots**: On test failure
- **Videos**: On test failure
- **Traces**: On retry (CI mode)

## Test Categories & Scripts

### Unit & Integration Tests
- **npm run test**: Run all Jest tests
- **npm run tool:test:watch**: Watch mode for development
- **npm run tool:test:policy**: Policy enforcement tests
- **npm run tool:test:rls**: Row Level Security tests
- **npm run tool:test:webhooks**: Webhook integration tests
- **npm run tool:test:guardian**: Guardian system tests
- **npm run tool:test:csp**: Content Security Policy tests

### E2E & Visual Tests
- **npm run tool:test:smoke**: Playwright smoke tests
- **npm run tool:ui:a11y**: Accessibility testing
- **npm run tool:ui:visual**: Visual regression testing
- **npm run tool:ui:perf**: Performance testing (Lighthouse CI)

### Component Testing
- **npm run tool:ui:contracts**: Component contract auditing
- **npm run tool:design:check**: Full design validation

## Test File Organization

### Jest Test Structure
```
tests/
├── policy/          # Policy enforcement tests
├── rls/            # Row Level Security tests
├── webhooks/       # Webhook integration tests
├── guardian/       # Guardian system tests
├── csp/            # Content Security Policy tests
└── [other unit tests]
```

### Playwright Test Structure
```
tests/
├── ui/             # UI and component tests
│   ├── a11y.spec.ts        # Accessibility tests
│   ├── visual.spec.ts      # Visual regression tests
│   ├── global-setup.ts     # Global test setup
│   └── global-teardown.ts  # Global test cleanup
├── playwright/     # E2E integration tests
│   └── smoke.spec.ts       # Smoke tests
└── [other E2E tests]
```

## Testing Utilities & Helpers

### Jest Setup (jest.setup.js)
- **Global test configuration**
- **Custom matchers and utilities**
- **Test environment setup**

### Testing Library Integration
- **@testing-library/jest-dom**: DOM testing utilities
- **React component testing patterns**
- **Accessibility testing helpers**

### Custom Test Utilities
- **Route guard testing**: `scripts/test-route-guard.mjs`
- **Policy enforcement**: `scripts/policy-enforcer.ts`
- **Component contracts**: `design/scripts/component-contract-auditor.mjs`

## Test Coverage & Quality

### Coverage Areas
- **App Routes**: All Next.js pages and API routes
- **Components**: React components and UI elements
- **Libraries**: Utility functions and business logic
- **Configuration**: Environment and build configuration

### Quality Gates
- **Linting**: ESLint integration with testing
- **Type Checking**: TypeScript validation in tests
- **Security**: Security policy testing
- **Accessibility**: Automated a11y testing
- **Visual Regression**: UI consistency testing

### Performance Testing
- **Lighthouse CI**: Performance budgets and metrics
- **Bundle Analysis**: Bundle size and optimization
- **Load Testing**: API endpoint performance

## CI/CD Integration

### Test Execution in CI
- **Parallel Execution**: Optimized for CI environments
- **Retry Logic**: Automatic retry on flaky tests
- **Artifact Collection**: Screenshots, videos, traces
- **Coverage Reporting**: Automated coverage analysis

### Test Scripts in CI Pipeline
```bash
npm run ci  # Full CI pipeline including:
# - Linting and type checking
# - Security testing
# - Policy enforcement
# - All test suites
# - Build validation
# - Security bundle analysis
```

## Testing Best Practices

### Test Organization
- **Unit Tests**: Fast, isolated, focused
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: User workflows, critical paths
- **Visual Tests**: UI consistency, design validation

### Test Data Management
- **Fixtures**: Reusable test data
- **Mocks**: External service simulation
- **Cleanup**: Proper test isolation

### Performance Considerations
- **Parallel Execution**: Maximize CI efficiency
- **Selective Testing**: Run relevant tests only
- **Resource Management**: Efficient test setup/teardown

## Testing Gaps & Opportunities

### Current Coverage
- ✅ Unit testing with Jest
- ✅ Integration testing with Jest
- ✅ E2E testing with Playwright
- ✅ Accessibility testing
- ✅ Visual regression testing
- ✅ Performance testing
- ✅ Security testing

### Potential Improvements
- **Contract Testing**: API contract validation
- **Load Testing**: Performance under stress
- **Mutation Testing**: Test quality validation
- **Snapshot Testing**: Component output validation
- **Cross-browser Testing**: Extended browser coverage

## Test Maintenance

### Regular Tasks
- **Dependency Updates**: Keep testing frameworks current
- **Coverage Monitoring**: Track test coverage trends
- **Flaky Test Resolution**: Identify and fix unstable tests
- **Performance Optimization**: Maintain test execution speed

### Documentation
- **Test Patterns**: Document testing best practices
- **Test Utilities**: Maintain helper function documentation
- **CI Integration**: Document CI/CD testing workflows
