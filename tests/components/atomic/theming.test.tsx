/**
 * @fileoverview HT-022.2.4: Basic Component Testing - Theming System
 * @module tests/components/atomic
 * @author Agency Component System
 * @version 1.0.0
 *
 * SIMPLE INTEGRATION TESTS: Theme switching and customization
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  SimpleThemeProvider,
  useSimpleTheme,
  ThemeSwitcher,
  validateSimpleTheme,
  createSimpleTheme
} from '@/components/ui/atomic/theming';

// Test wrapper component
function TestComponent() {
  const { currentTheme, switchTheme, availableThemes } = useSimpleTheme();

  return (
    <div>
      <div data-testid="current-theme">{currentTheme.name}</div>
      <div data-testid="theme-id">{currentTheme.id}</div>
      <div data-testid="primary-color">{currentTheme.colors.primary}</div>
      <div data-testid="available-themes">{availableThemes.length}</div>
      <button
        data-testid="switch-theme"
        onClick={() => switchTheme('corporate')}
      >
        Switch to Corporate
      </button>
    </div>
  );
}

describe('Theming System Integration', () => {
  // Theme Provider tests
  it('provides default theme context', () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    expect(screen.getByTestId('current-theme')).toHaveTextContent('Agency Default');
    expect(screen.getByTestId('theme-id')).toHaveTextContent('default');
    expect(screen.getByTestId('available-themes')).toHaveTextContent('4'); // Default themes
  });

  it('switches themes correctly', async () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const switchButton = screen.getByTestId('switch-theme');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(screen.getByTestId('current-theme')).toHaveTextContent('Corporate Blue');
      expect(screen.getByTestId('theme-id')).toHaveTextContent('corporate');
    });
  });

  it('applies CSS variables correctly', async () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const switchButton = screen.getByTestId('switch-theme');
    fireEvent.click(switchButton);

    await waitFor(() => {
      const root = document.documentElement;
      expect(root.getAttribute('data-agency-theme')).toBe('corporate');
    });
  });

  // Theme Switcher component tests
  it('renders theme switcher component', () => {
    render(
      <SimpleThemeProvider>
        <ThemeSwitcher />
      </SimpleThemeProvider>
    );

    expect(screen.getByText('Theme Selector')).toBeInTheDocument();
    expect(screen.getByText('Choose a theme for your application')).toBeInTheDocument();
  });

  // Theme validation tests
  it('validates theme structure correctly', () => {
    const validTheme = {
      id: 'test-theme',
      name: 'Test Theme',
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#cccccc',
        background: '#ffffff',
        foreground: '#000000'
      },
      logo: {
        alt: 'Test Logo',
        initials: 'TL'
      },
      typography: {
        fontFamily: 'Arial, sans-serif'
      }
    };

    expect(validateSimpleTheme(validTheme)).toBe(true);
  });

  it('rejects invalid theme structure', () => {
    const invalidTheme = {
      id: 'test-theme',
      name: 'Test Theme',
      // Missing colors
      logo: {
        alt: 'Test Logo',
        initials: 'TL'
      },
      typography: {
        fontFamily: 'Arial, sans-serif'
      }
    } as any;

    expect(validateSimpleTheme(invalidTheme)).toBe(false);
  });

  // Theme creation tests
  it('creates custom theme correctly', () => {
    const customTheme = createSimpleTheme(
      'custom-test',
      'Custom Test Theme',
      '#ff6b35',
      'CT',
      'Roboto, sans-serif'
    );

    expect(customTheme.id).toBe('custom-test');
    expect(customTheme.name).toBe('Custom Test Theme');
    expect(customTheme.colors.primary).toBe('#ff6b35');
    expect(customTheme.logo.initials).toBe('CT');
    expect(customTheme.typography.fontFamily).toBe('Roboto, sans-serif');
    expect(customTheme.isCustom).toBe(true);
  });

  // Performance test
  it('theme switching performs within budget', async () => {
    render(
      <SimpleThemeProvider>
        <TestComponent />
      </SimpleThemeProvider>
    );

    const startTime = performance.now();
    const switchButton = screen.getByTestId('switch-theme');
    fireEvent.click(switchButton);

    await waitFor(() => {
      expect(screen.getByTestId('theme-id')).toHaveTextContent('corporate');
    });

    const endTime = performance.now();
    const switchTime = endTime - startTime;

    // Should switch in less than 100ms
    expect(switchTime).toBeLessThan(100);
  });

  // Error handling test
  it('handles invalid theme switch gracefully', () => {
    function TestErrorComponent() {
      const { switchTheme } = useSimpleTheme();

      return (
        <button
          data-testid="invalid-switch"
          onClick={() => switchTheme('non-existent-theme')}
        >
          Invalid Switch
        </button>
      );
    }

    render(
      <SimpleThemeProvider>
        <TestErrorComponent />
        <TestComponent />
      </SimpleThemeProvider>
    );

    const originalTheme = screen.getByTestId('theme-id').textContent;
    const invalidButton = screen.getByTestId('invalid-switch');

    fireEvent.click(invalidButton);

    // Should remain on original theme
    expect(screen.getByTestId('theme-id')).toHaveTextContent(originalTheme!);
  });
});