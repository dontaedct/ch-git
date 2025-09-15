/**
 * Component Testing Utilities
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Comprehensive testing utilities for design system components
 * with accessibility, performance, and theme testing support
 */

import React from 'react';
import { render, RenderOptions, RenderResult, screen, within, waitFor } from '@testing-library/react';
import { renderHook, RenderHookOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// @ts-ignore - jest-axe type definitions may not be available
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from '@/components/theme-provider';
import { checkColorContrast } from '@/lib/accessibility';
import type { ThemeMode, BrandVariant } from '@/lib/types/component-system';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// TESTING WRAPPER COMPONENTS
// ============================================================================

interface TestProvidersProps {
  children: React.ReactNode;
  theme?: ThemeMode;
  brand?: BrandVariant;
  initialTokens?: Record<string, string>;
}

/**
 * Wrapper component with all necessary providers for testing
 */
function TestProviders({ 
  children, 
  theme = 'light', 
  brand = 'default',
  initialTokens = {}
}: TestProvidersProps) {
  return (
    <ThemeProvider 
      defaultTheme={theme} 
      storageKey="test-theme"
    >
      <div data-testid="test-root" style={initialTokens}>
        {children}
      </div>
    </ThemeProvider>
  );
}

// ============================================================================
// ENHANCED RENDER FUNCTIONS
// ============================================================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: ThemeMode;
  brand?: BrandVariant;
  initialTokens?: Record<string, string>;
  skipA11yTest?: boolean;
  performanceTest?: boolean;
}

/**
 * Enhanced render function with design system providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): RenderResult & {
  user: ReturnType<typeof userEvent.setup>;
  rerender: (ui: React.ReactElement, rerenderOptions?: CustomRenderOptions) => void;
} {
  const {
    theme = 'light',
    brand = 'default',
    initialTokens = {},
    skipA11yTest = false,
    performanceTest = false,
    ...renderOptions
  } = options;

  const user = userEvent.setup();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders theme={theme} brand={brand} initialTokens={initialTokens}>
      {children}
    </TestProviders>
  );

  const result = render(ui, { wrapper: Wrapper, ...renderOptions });

  // Enhanced rerender function
  const enhancedRerender = (ui: React.ReactElement, rerenderOptions?: CustomRenderOptions) => {
    const mergedOptions = { ...options, ...rerenderOptions };
    const NewWrapper = ({ children }: { children: React.ReactNode }) => (
      <TestProviders 
        theme={mergedOptions.theme} 
        brand={mergedOptions.brand} 
        initialTokens={mergedOptions.initialTokens}
      >
        {children}
      </TestProviders>
    );
    
    result.rerender(<NewWrapper>{ui}</NewWrapper>);
  };

  return {
    ...result,
    user,
    rerender: enhancedRerender as any
  };
}

/**
 * Render component for accessibility testing
 */
export function renderForA11yTest(ui: React.ReactElement, options: CustomRenderOptions = {}) {
  return renderWithProviders(ui, { ...options, skipA11yTest: false });
}

/**
 * Render hook with providers
 */
export function renderHookWithProviders<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> & {
    theme?: ThemeMode;
    brand?: BrandVariant;
    initialTokens?: Record<string, string>;
  } = {}
) {
  const { theme = 'light', brand = 'default', initialTokens = {}, ...hookOptions } = options;

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestProviders theme={theme} brand={brand} initialTokens={initialTokens}>
      {children}
    </TestProviders>
  );

  return renderHook(hook, { wrapper, ...hookOptions });
}

// ============================================================================
// ACCESSIBILITY TESTING UTILITIES
// ============================================================================

/**
 * Test component for accessibility violations
 */
export async function testAccessibility(
  ui: React.ReactElement, 
  options: CustomRenderOptions & {
    axeConfig?: any;
    rules?: string[];
  } = {}
) {
  const { axeConfig, rules, ...renderOptions } = options;
  const { container } = renderWithProviders(ui, renderOptions);

  const results = await axe(container, {
    rules: rules?.reduce((acc, rule) => {
      acc[rule] = { enabled: true };
      return acc;
    }, {} as any),
    ...axeConfig
  });

  // @ts-ignore - jest-axe extends expect
  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test keyboard navigation
 */
export async function testKeyboardNavigation(
  ui: React.ReactElement,
  options: CustomRenderOptions & {
    focusableElements?: string[];
    navigationKeys?: string[];
  } = {}
) {
  const { focusableElements = ['button', 'input', 'a', '[tabindex="0"]'], navigationKeys = ['Tab'] } = options;
  const { user } = renderWithProviders(ui, options);

  const focusableEls = screen.queryAllByRole('button')
    .concat(screen.queryAllByRole('textbox'))
    .concat(screen.queryAllByRole('link'))
    .concat(screen.queryAllByTestId(/focusable/i));

  // Test Tab navigation
  for (const key of navigationKeys) {
    for (let i = 0; i < focusableEls.length; i++) {
      await user.keyboard(`{${key}}`);
      
      // Verify focus is on expected element
      if (key === 'Tab' && focusableEls[i + 1]) {
        expect(focusableEls[i + 1]).toHaveFocus();
      }
    }
  }

  return { focusableElements: focusableEls };
}

/**
 * Test screen reader announcements
 */
export function testScreenReaderAnnouncements() {
  const announcements: string[] = [];
  
  // Mock live region announcements
  const mockAnnounce = (message: string) => {
    announcements.push(message);
  };

  return {
    announcements,
    mockAnnounce,
    getLatestAnnouncement: () => announcements[announcements.length - 1],
    getAllAnnouncements: () => announcements,
    clearAnnouncements: () => announcements.splice(0)
  };
}

/**
 * Test color contrast
 */
export function testColorContrast(
  foreground: string,
  background: string,
  options: {
    level?: 'AA' | 'AAA';
    size?: 'normal' | 'large';
  } = {}
) {
  const { level = 'AA', size = 'normal' } = options;
  const result = checkColorContrast(foreground, background, level, size);
  
  expect(result.passes).toBe(true);
  return result;
}

// ============================================================================
// PERFORMANCE TESTING UTILITIES
// ============================================================================

/**
 * Measure component render performance
 */
export async function measureRenderPerformance(
  ui: React.ReactElement,
  options: CustomRenderOptions & {
    iterations?: number;
    budget?: number; // in milliseconds
  } = {}
) {
  const { iterations = 10, budget = 100, ...renderOptions } = options;
  const renderTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const { unmount } = renderWithProviders(ui, renderOptions);
    const endTime = performance.now();
    
    renderTimes.push(endTime - startTime);
    unmount();
  }

  const averageRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
  const maxRenderTime = Math.max(...renderTimes);
  const minRenderTime = Math.min(...renderTimes);

  const results = {
    averageRenderTime,
    maxRenderTime,
    minRenderTime,
    renderTimes,
    isWithinBudget: averageRenderTime <= budget,
    budgetUtilization: (averageRenderTime / budget) * 100
  };

  // Assert performance budget
  expect(averageRenderTime).toBeLessThanOrEqual(budget);

  return results;
}

/**
 * Test interaction performance
 */
export async function testInteractionPerformance(
  ui: React.ReactElement,
  interaction: (user: ReturnType<typeof userEvent.setup>) => Promise<void>,
  options: CustomRenderOptions & {
    budget?: number;
    iterations?: number;
  } = {}
) {
  const { budget = 16, iterations = 5, ...renderOptions } = options;
  const { user } = renderWithProviders(ui, renderOptions);
  const interactionTimes: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    await interaction(user);
    const endTime = performance.now();
    
    interactionTimes.push(endTime - startTime);
  }

  const averageTime = interactionTimes.reduce((a, b) => a + b, 0) / interactionTimes.length;
  
  expect(averageTime).toBeLessThanOrEqual(budget);
  
  return {
    averageTime,
    maxTime: Math.max(...interactionTimes),
    minTime: Math.min(...interactionTimes),
    interactionTimes,
    isWithinBudget: averageTime <= budget
  };
}

// ============================================================================
// THEME TESTING UTILITIES
// ============================================================================

/**
 * Test component across different themes
 */
export async function testAcrossThemes(
  ui: React.ReactElement,
  testFn: (theme: ThemeMode, brand: BrandVariant) => Promise<void> | void,
  options: {
    themes?: ThemeMode[];
    brands?: BrandVariant[];
  } = {}
) {
  const { themes = ['light', 'dark'], brands = ['default', 'salon'] } = options;

  for (const theme of themes) {
    for (const brand of brands) {
      await testFn(theme, brand);
    }
  }
}

/**
 * Test theme switching
 */
export async function testThemeSwitching(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { rerender, user } = renderWithProviders(ui, { theme: 'light', ...options });
  
  // Test initial theme
  expect(screen.getByTestId('test-root')).toHaveAttribute('data-theme', 'light');
  
  // Test theme switch
  rerender(ui, { theme: 'dark' });
  
  await waitFor(() => {
    expect(screen.getByTestId('test-root')).toHaveAttribute('data-theme', 'dark');
  });

  return { user, rerender };
}

// ============================================================================
// COMPONENT TESTING UTILITIES
// ============================================================================

/**
 * Test component variants
 */
export function testVariants<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  variants: Array<{ props: T; testId: string; expectedClass?: string }>
) {
  variants.forEach(({ props, testId, expectedClass }) => {
    const { getByTestId } = renderWithProviders(
      <Component {...props} data-testid={testId} />
    );
    
    const element = getByTestId(testId);
    expect(element).toBeInTheDocument();
    
    if (expectedClass) {
      expect(element).toHaveClass(expectedClass);
    }
  });
}

/**
 * Test responsive behavior
 */
export function testResponsiveBehavior(
  ui: React.ReactElement,
  breakpoints: Array<{ width: number; test: () => void }>
) {
  breakpoints.forEach(({ width, test }) => {
    // Mock viewport width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    renderWithProviders(ui);
    test();
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create mock intersection observer
 */
export function mockIntersectionObserver() {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  window.IntersectionObserver = jest.fn(() => mockObserver) as any;
  return mockObserver;
}

/**
 * Create mock resize observer
 */
export function mockResizeObserver() {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };

  window.ResizeObserver = jest.fn(() => mockObserver) as any;
  return mockObserver;
}

/**
 * Mock CSS custom properties
 */
export function mockCSSCustomProperties(properties: Record<string, string>) {
  const mockGetComputedStyle = jest.fn(() => ({
    getPropertyValue: (prop: string) => properties[prop] || ''
  }));

  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle
  });

  return mockGetComputedStyle;
}

// ============================================================================
// TEST HELPERS
// ============================================================================

/**
 * Wait for component to be ready (useful for async components)
 */
export async function waitForComponentReady(testId: string, timeout = 5000) {
  await waitFor(() => {
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  }, { timeout });
}

/**
 * Test error boundaries
 */
export function TestErrorBoundary({ children, onError }: {
  children: React.ReactNode;
  onError?: (error: Error) => void;
}) {
  return (
    <React.Component>
      {children}
    </React.Component>
  );
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Re-export commonly used testing utilities
export * from '@testing-library/react';
export * from '@testing-library/user-event';