# Testing Framework Documentation

## Overview

This document describes the comprehensive testing framework implemented for DCT Micro-Apps as part of SOS Operation Phase 3 Task 15. The framework follows the testing pyramid approach with unit, integration, and end-to-end tests.

## Testing Pyramid

```
    /\
   /  \     E2E Tests (Few, Critical Paths)
  /____\    Integration Tests (Some, Component Interactions)
 /______\   Unit Tests (Many, Individual Functions/Components)
```

### Test Distribution Target
- **Unit Tests**: 70% of test suite
- **Integration Tests**: 20% of test suite  
- **E2E Tests**: 10% of test suite

## Test Types

### 1. Unit Tests (`tests/unit/`)
**Purpose**: Test individual functions, components, and utilities in isolation
**Location**: `tests/unit/`
**Framework**: Jest + React Testing Library
**Coverage Target**: 80%+

**Examples**:
- Utility functions (`lib/utils.ts`)
- Environment validation (`lib/env-validation.ts`)
- Individual React components
- Pure functions

### 2. Integration Tests (`tests/integration/`)
**Purpose**: Test component interactions and API endpoints
**Location**: `tests/integration/`
**Framework**: Jest + React Testing Library
**Coverage Target**: 75%+

**Examples**:
- Component with multiple dependencies
- API endpoint testing
- Form submission workflows
- Component state management

### 3. End-to-End Tests (`tests/e2e/`)
**Purpose**: Test complete user workflows across the application
**Location**: `tests/e2e/`
**Framework**: Playwright
**Coverage Target**: Critical user journeys

**Examples**:
- Complete form submission flows
- Authentication workflows
- Navigation between pages
- Error handling scenarios

## Test Utilities

### Custom Test Renderer (`tests/utils/test-utils.tsx`)

Provides a custom renderer with all necessary providers:

```typescript
import { render } from '../utils/test-utils';

// Renders component with theme and query client providers
render(<MyComponent />, { theme: 'dark' });
```

**Features**:
- Theme provider integration
- Query client setup
- Supabase client mocking
- Router mocking
- Common test helpers

### Test Data Factories

```typescript
import { createMockUser, createMockFormData } from '../utils/test-utils';

const user = createMockUser({ role: 'admin' });
const formData = createMockFormData({ name: 'Custom Name' });
```

## Coverage Requirements

### Global Coverage Thresholds
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

### Critical Path Coverage
- **Library Functions**: 80%
- **Components**: 75%
- **API Routes**: 70%

## Running Tests

### Development
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Coverage
```bash
# Generate coverage report
npm run test:coverage

# Generate HTML coverage report
npm run test:coverage:html

# Generate LCOV coverage report
npm run test:coverage:lcov
```

### CI/CD
```bash
# Run all tests for CI
npm run test:ci

# Run tests with coverage for CI
npm run test:coverage
```

## Test Structure

### File Naming Conventions
- Unit tests: `*.test.ts` or `*.spec.ts`
- Integration tests: `*.test.tsx` or `*.spec.tsx`
- E2E tests: `*.spec.ts`

### Directory Structure
```
tests/
├── unit/                    # Unit tests
│   ├── lib/                # Library function tests
│   ├── components/         # Component tests
│   └── utils/              # Utility tests
├── integration/            # Integration tests
│   ├── components/         # Component interaction tests
│   ├── api/                # API endpoint tests
│   └── forms/              # Form workflow tests
├── e2e/                    # End-to-end tests
│   ├── user-workflows.spec.ts
│   └── critical-paths.spec.ts
├── utils/                  # Test utilities
│   └── test-utils.tsx      # Custom renderer and helpers
└── fixtures/               # Test data fixtures
    ├── users.json
    └── forms.json
```

## Best Practices

### Writing Unit Tests
1. **Test one thing at a time**
2. **Use descriptive test names**
3. **Follow AAA pattern (Arrange, Act, Assert)**
4. **Mock external dependencies**

```typescript
describe('formatDate function', () => {
  it('should format date correctly', () => {
    // Arrange
    const date = new Date('2023-01-15');
    
    // Act
    const result = formatDate(date);
    
    // Assert
    expect(result).toMatch(/Jan 15, 2023/);
  });
});
```

### Writing Integration Tests
1. **Test component interactions**
2. **Test API endpoints**
3. **Use realistic test data**
4. **Test error scenarios**

```typescript
describe('Form Submission', () => {
  it('should submit form and show success message', async () => {
    // Arrange
    render(<ContactForm />);
    
    // Act
    await fillForm({ name: 'John', email: 'john@example.com' });
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Assert
    await expect(screen.getByText(/thank you/i)).toBeVisible();
  });
});
```

### Writing E2E Tests
1. **Test complete user journeys**
2. **Test critical business paths**
3. **Test error handling**
4. **Test accessibility**

```typescript
test('should complete intake form workflow', async ({ page }) => {
  // Navigate to form
  await page.goto('/intake');
  
  // Fill and submit form
  await page.getByLabel(/name/i).fill('John Doe');
  await page.getByRole('button', { name: /submit/i }).click();
  
  // Verify success
  await expect(page.getByText(/thank you/i)).toBeVisible();
});
```

## Mocking Strategy

### External Dependencies
- **Supabase**: Mocked client with predefined responses
- **Next.js Router**: Mocked navigation functions
- **API Calls**: Mocked fetch responses
- **External Services**: Mocked service responses

### Test Data
- **Users**: Factory functions for different user types
- **Forms**: Factory functions for form data
- **API Responses**: Mocked response objects

## Performance Testing

### Load Testing
- **Page Load Times**: < 3 seconds
- **API Response Times**: < 1 second
- **Component Render Times**: < 100ms

### Memory Testing
- **Memory Leaks**: No memory leaks in component lifecycle
- **Bundle Size**: Monitor bundle size increases

## Accessibility Testing

### Automated Testing
- **axe-core**: Automated accessibility testing
- **Keyboard Navigation**: Test tab order and focus management
- **Screen Reader**: Test with screen reader compatibility

### Manual Testing
- **Color Contrast**: Verify WCAG AA compliance
- **Keyboard Only**: Test without mouse
- **Screen Reader**: Test with actual screen readers

## Error Handling Testing

### Error Scenarios
- **Network Errors**: Test offline scenarios
- **API Errors**: Test error responses
- **Validation Errors**: Test form validation
- **404 Errors**: Test missing pages

### Error Recovery
- **Retry Logic**: Test automatic retries
- **Fallback UI**: Test error boundaries
- **User Feedback**: Test error messages

## Continuous Integration

### GitHub Actions
- **Test Suite**: Runs on every push
- **Coverage Reports**: Uploads to coverage service
- **Performance Tests**: Runs performance benchmarks
- **Security Tests**: Runs security scans

### Quality Gates
- **Coverage Threshold**: Must meet minimum coverage
- **Test Pass Rate**: All tests must pass
- **Performance Budget**: Must meet performance targets
- **Security Scan**: Must pass security checks

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor` for async operations
2. **Component State**: Wait for state updates
3. **Network Requests**: Mock network requests
4. **Timing Issues**: Use proper timeouts

### Debug Commands
```bash
# Debug Jest tests
npm run test:debug

# Debug E2E tests
npm run test:e2e -- --debug

# Update snapshots
npm run test:update
```

## Maintenance

### Regular Tasks
- **Update Dependencies**: Keep testing libraries updated
- **Review Coverage**: Monitor coverage trends
- **Update Tests**: Update tests when features change
- **Performance Monitoring**: Monitor test performance

### Metrics to Track
- **Test Coverage**: Maintain coverage targets
- **Test Execution Time**: Monitor test speed
- **Flaky Tests**: Identify and fix flaky tests
- **Test Maintenance**: Track time spent on test maintenance

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

### Tools
- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **axe-core**: Accessibility testing
- **Coverage**: Istanbul coverage reporting

### Examples
- See `tests/unit/` for unit test examples
- See `tests/integration/` for integration test examples
- See `tests/e2e/` for E2E test examples
