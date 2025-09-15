/**
 * @fileoverview HT-022.2.4: Basic Component Testing - Accessibility System
 * @module tests/components/atomic
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE INTEGRATION TESTS: Accessibility and performance monitoring
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  AccessibilityProvider,
  PerformanceProvider,
  useAccessibility,
  usePerformance,
  ARIA,
  checkWCAGCompliance
} from '@/components/ui/atomic/accessibility';

// Test wrapper component for accessibility
function AccessibilityTestComponent() {
  const { settings, updateSetting, announceToScreenReader } = useAccessibility();

  return (
    <div>
      <div data-testid="reduced-motion">{settings.reducedMotion.toString()}</div>
      <div data-testid="high-contrast">{settings.highContrast.toString()}</div>
      <div data-testid="keyboard-nav">{settings.keyboardNavigation.toString()}</div>
      <button
        data-testid="toggle-reduced-motion"
        onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
      >
        Toggle Reduced Motion
      </button>
      <button
        data-testid="announce"
        onClick={() => announceToScreenReader('Test announcement')}
      >
        Announce
      </button>
    </div>
  );
}

// Test wrapper component for performance
function PerformanceTestComponent() {
  const { metrics, measureRender } = usePerformance();

  React.useEffect(() => {
    measureRender('TestComponent', 150); // Simulate 150ms render
  }, [measureRender]);

  return (
    <div>
      <div data-testid="render-count">{metrics.renderCount}</div>
      <div data-testid="slow-components">{metrics.slowComponents.length}</div>
    </div>
  );
}

describe('Accessibility System Integration', () => {
  // Accessibility Provider tests
  it('provides accessibility context with default settings', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityTestComponent />
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('reduced-motion')).toHaveTextContent('false');
    expect(screen.getByTestId('high-contrast')).toHaveTextContent('false');
    expect(screen.getByTestId('keyboard-nav')).toHaveTextContent('true');
  });

  it('updates accessibility settings correctly', async () => {
    render(
      <AccessibilityProvider>
        <AccessibilityTestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByTestId('toggle-reduced-motion');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByTestId('reduced-motion')).toHaveTextContent('true');
    });
  });

  it('applies data attributes to document root', async () => {
    render(
      <AccessibilityProvider>
        <AccessibilityTestComponent />
      </AccessibilityProvider>
    );

    const toggleButton = screen.getByTestId('toggle-reduced-motion');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      const root = document.documentElement;
      expect(root.getAttribute('data-reduced-motion')).toBe('true');
    });
  });

  it('creates screen reader announcer', () => {
    render(
      <AccessibilityProvider>
        <AccessibilityTestComponent />
      </AccessibilityProvider>
    );

    const announceButton = screen.getByTestId('announce');
    fireEvent.click(announceButton);

    // Check that the announcer div was created (it should be in the DOM but visually hidden)
    const announcer = document.querySelector('[aria-live="polite"]');
    expect(announcer).toBeInTheDocument();
  });

  // ARIA helpers tests
  it('generates proper ARIA attributes', () => {
    const requiredAttrs = ARIA.required(true);
    expect(requiredAttrs).toEqual({
      'aria-required': 'true',
      required: true
    });

    const invalidAttrs = ARIA.invalid(true, 'error-id');
    expect(invalidAttrs).toEqual({
      'aria-invalid': 'true',
      'aria-describedby': 'error-id'
    });

    const expandedAttrs = ARIA.expandable(true, 'content-id');
    expect(expandedAttrs).toEqual({
      'aria-expanded': 'true',
      'aria-controls': 'content-id'
    });
  });

  // Performance monitoring tests
  it('tracks component render metrics', () => {
    render(
      <PerformanceProvider>
        <PerformanceTestComponent />
      </PerformanceProvider>
    );

    expect(screen.getByTestId('render-count')).toHaveTextContent('1');
    expect(screen.getByTestId('slow-components')).toHaveTextContent('0'); // 150ms should be under 200ms threshold
  });

  // WCAG compliance checking
  it('checks basic WCAG compliance', () => {
    // Create test DOM structure
    document.body.innerHTML = `
      <div>
        <h1>Test Page</h1>
        <img src="test.jpg" alt="Test image" />
        <label for="test-input">Test Input</label>
        <input id="test-input" type="text" />
        <a href="#main">Skip to main content</a>
        <main id="main">Main content</main>
      </div>
    `;

    const compliance = checkWCAGCompliance();

    expect(compliance.isCompliant).toBe(true);
    expect(compliance.issues.length).toBe(0);
    expect(compliance.score).toBeGreaterThan(90);
  });

  it('detects WCAG compliance issues', () => {
    // Create DOM with accessibility issues
    document.body.innerHTML = `
      <div>
        <img src="test.jpg" />
        <input type="text" />
      </div>
    `;

    const compliance = checkWCAGCompliance();

    expect(compliance.isCompliant).toBe(false);
    expect(compliance.issues.length).toBeGreaterThan(0);
    expect(compliance.score).toBeLessThan(100);
  });

  // Combined provider test
  it('works with both accessibility and performance providers', () => {
    function CombinedTestComponent() {
      const { settings } = useAccessibility();
      const { metrics } = usePerformance();

      return (
        <div>
          <div data-testid="a11y-keyboard">{settings.keyboardNavigation.toString()}</div>
          <div data-testid="perf-renders">{metrics.renderCount}</div>
        </div>
      );
    }

    render(
      <AccessibilityProvider>
        <PerformanceProvider>
          <CombinedTestComponent />
        </PerformanceProvider>
      </AccessibilityProvider>
    );

    expect(screen.getByTestId('a11y-keyboard')).toHaveTextContent('true');
    expect(screen.getByTestId('perf-renders')).toHaveTextContent('0');
  });

  // Performance test
  it('accessibility provider performs within budget', () => {
    const startTime = performance.now();

    render(
      <AccessibilityProvider>
        <AccessibilityTestComponent />
      </AccessibilityProvider>
    );

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render in less than 100ms
    expect(renderTime).toBeLessThan(100);
  });

  // Error handling test
  it('handles missing provider context gracefully', () => {
    // Test component that tries to use accessibility context without provider
    function OrphanComponent() {
      try {
        useAccessibility();
        return <div>Should not reach here</div>;
      } catch (error) {
        return <div data-testid="error-caught">Error caught</div>;
      }
    }

    render(<OrphanComponent />);
    expect(screen.getByTestId('error-caught')).toBeInTheDocument();
  });
});