/**
 * Theme Provider System
 *
 * Provides theme context and CSS custom properties based on design tokens
 * and manifest theme overrides. Supports light/dark mode, responsive breakpoints,
 * and real-time theme switching.
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import designTokensData from '../../design-tokens.json';

export interface ThemeConfig {
  useSiteDefaults?: boolean;
  overrides?: {
    palette?: {
      primary?: string;
      secondary?: string;
      accent?: string;
      error?: string;
      success?: string;
      warning?: string;
      neutral?: string;
      background?: string;
      surface?: string;
      text?: string;
      textMuted?: string;
    };
    typography?: {
      fontFamily?: string;
      fontSize?: {
        xs?: string;
        sm?: string;
        base?: string;
        lg?: string;
        xl?: string;
        '2xl'?: string;
        '3xl'?: string;
        '4xl'?: string;
      };
      fontWeight?: {
        light?: number;
        normal?: number;
        medium?: number;
        semibold?: number;
        bold?: number;
      };
      lineHeight?: {
        tight?: number;
        normal?: number;
        relaxed?: number;
      };
    };
    spacing?: {
      fieldSpacing?: 'tight' | 'normal' | 'relaxed';
      sectionSpacing?: 'sm' | 'md' | 'lg' | 'xl';
      containerPadding?: string;
      componentGap?: string;
    };
    borderRadius?: {
      none?: string;
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      full?: string;
    };
    shadows?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
    };
    breakpoints?: {
      sm?: string;
      md?: string;
      lg?: string;
      xl?: string;
      '2xl'?: string;
    };
  };
}

export interface ComputedTheme {
  palette: Record<string, string>;
  typography: Record<string, any>;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  breakpoints: Record<string, string>;
  cssVariables: Record<string, string>;
}

interface ThemeContextValue {
  theme: ComputedTheme;
  themeConfig: ThemeConfig;
  updateTheme: (newConfig: ThemeConfig) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  theme?: ThemeConfig;
  children: React.ReactNode;
  enableDarkMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: initialTheme,
  children,
  enableDarkMode = true
}) => {
  const [themeConfig, setThemeConfig] = React.useState<ThemeConfig>(
    initialTheme || { useSiteDefaults: true }
  );
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Detect system preference for dark mode
  useEffect(() => {
    if (enableDarkMode && typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDarkMode(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [enableDarkMode]);

  // Compute final theme by merging design tokens with overrides
  const computedTheme = useMemo((): ComputedTheme => {
    const baseTheme = designTokensData;
    let finalTheme: any = { ...baseTheme };

    // Apply dark mode if enabled
    if (isDarkMode && enableDarkMode) {
      finalTheme = applyDarkModeTheme(finalTheme);
    }

    // Apply manifest overrides if not using site defaults
    if (!themeConfig.useSiteDefaults && themeConfig.overrides) {
      finalTheme = mergeThemeOverrides(finalTheme, themeConfig.overrides);
    }

    // Generate CSS variables
    const cssVariables = generateCSSVariables(finalTheme);

    return {
      palette: finalTheme.colors || {},
      typography: finalTheme.typography || {},
      spacing: finalTheme.spacing || {},
      borderRadius: finalTheme.borderRadius || {},
      shadows: finalTheme.shadows || {},
      breakpoints: finalTheme.breakpoints || {},
      cssVariables
    };
  }, [themeConfig, isDarkMode, enableDarkMode]);

  // Apply CSS variables to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Remove old CSS variables
      Array.from(root.style).forEach(property => {
        if (property.startsWith('--dct-')) {
          root.style.removeProperty(property);
        }
      });

      // Apply new CSS variables
      Object.entries(computedTheme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });
    }
  }, [computedTheme.cssVariables]);

  const updateTheme = (newConfig: ThemeConfig) => {
    setThemeConfig(newConfig);
  };

  const toggleDarkMode = () => {
    if (enableDarkMode) {
      setIsDarkMode(prev => !prev);
    }
  };

  const contextValue: ThemeContextValue = {
    theme: computedTheme,
    themeConfig,
    updateTheme,
    isDarkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <div
        className={`theme-provider ${isDarkMode ? 'dark' : 'light'}`}
        data-theme={isDarkMode ? 'dark' : 'light'}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Apply dark mode theme transformations
function applyDarkModeTheme(theme: any): any {
  const darkTheme = { ...theme };

  // Apply dark mode color transformations
  if (darkTheme.colors) {
    darkTheme.colors = {
      ...darkTheme.colors,
      light: {
        ...darkTheme.colors.light,
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textMuted: '#9ca3af',
        border: '#374151'
      }
    };
  }

  return darkTheme;
}

// Merge theme overrides with base theme
function mergeThemeOverrides(baseTheme: any, overrides: ThemeConfig['overrides']): any {
  const mergedTheme = { ...baseTheme };

  if (overrides?.palette) {
    mergedTheme.colors = {
      ...mergedTheme.colors,
      light: {
        ...mergedTheme.colors?.light,
        ...overrides.palette
      }
    };
  }

  if (overrides?.typography) {
    mergedTheme.typography = {
      ...mergedTheme.typography,
      ...overrides.typography
    };
  }

  if (overrides?.spacing) {
    mergedTheme.spacing = {
      ...mergedTheme.spacing,
      ...overrides.spacing
    };
  }

  if (overrides?.borderRadius) {
    mergedTheme.borderRadius = {
      ...mergedTheme.borderRadius,
      ...overrides.borderRadius
    };
  }

  if (overrides?.shadows) {
    mergedTheme.shadows = {
      ...mergedTheme.shadows,
      ...overrides.shadows
    };
  }

  if (overrides?.breakpoints) {
    mergedTheme.breakpoints = {
      ...mergedTheme.breakpoints,
      ...overrides.breakpoints
    };
  }

  return mergedTheme;
}

// Generate CSS custom properties from theme object
function generateCSSVariables(theme: any): Record<string, string> {
  const variables: Record<string, string> = {};

  // Colors
  if (theme.colors?.light) {
    Object.entries(theme.colors.light).forEach(([key, value]) => {
      variables[`--dct-color-${key}`] = value as string;
    });
  }

  // Typography
  if (theme.typography) {
    if (theme.typography.fontFamily) {
      variables['--dct-font-family'] = theme.typography.fontFamily;
    }

    if (theme.typography.fontSize) {
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        variables[`--dct-font-size-${key}`] = value as string;
      });
    }

    if (theme.typography.fontWeight) {
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        variables[`--dct-font-weight-${key}`] = String(value);
      });
    }

    if (theme.typography.lineHeight) {
      Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
        variables[`--dct-line-height-${key}`] = String(value);
      });
    }
  }

  // Spacing
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([key, value]) => {
      variables[`--dct-spacing-${key}`] = value as string;
    });
  }

  // Border radius
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      variables[`--dct-radius-${key}`] = value as string;
    });
  }

  // Shadows
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([key, value]) => {
      variables[`--dct-shadow-${key}`] = value as string;
    });
  }

  // Breakpoints
  if (theme.breakpoints) {
    Object.entries(theme.breakpoints).forEach(([key, value]) => {
      variables[`--dct-breakpoint-${key}`] = value as string;
    });
  }

  return variables;
}

// Hook to get CSS class names based on theme
export const useThemeClasses = () => {
  const { theme, isDarkMode } = useTheme();

  return {
    container: `dct-container ${isDarkMode ? 'dark' : 'light'}`,
    surface: `dct-surface ${isDarkMode ? 'dark' : 'light'}`,
    text: `dct-text ${isDarkMode ? 'dark' : 'light'}`,
    button: (variant: string) => `dct-button dct-button-${variant} ${isDarkMode ? 'dark' : 'light'}`,
    input: `dct-input ${isDarkMode ? 'dark' : 'light'}`,
    card: `dct-card ${isDarkMode ? 'dark' : 'light'}`
  };
};

// Hook to get responsive values
export const useResponsive = () => {
  const { theme } = useTheme();
  const [viewport, setViewport] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const breakpoints = theme.breakpoints;

      if (width < parseInt(breakpoints.md || '768')) {
        setViewport('mobile');
      } else if (width < parseInt(breakpoints.lg || '1024')) {
        setViewport('tablet');
      } else {
        setViewport('desktop');
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, [theme.breakpoints]);

  return {
    viewport,
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    breakpoints: theme.breakpoints
  };
};

// CSS-in-JS helper for styled components
export const styled = {
  css: (template: TemplateStringsArray, ...args: any[]) => {
    return template.reduce((result, part, index) => {
      return result + part + (args[index] || '');
    }, '');
  }
};

// Default theme CSS classes
export const themeStyles = `
  .dct-container {
    max-width: var(--dct-breakpoint-xl, 1200px);
    margin: 0 auto;
    padding: 0 var(--dct-spacing-containerPadding, 1rem);
  }

  .dct-surface {
    background-color: var(--dct-color-surface, #ffffff);
    border-radius: var(--dct-radius-md, 0.375rem);
    box-shadow: var(--dct-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.05));
  }

  .dct-text {
    color: var(--dct-color-text, #111827);
    font-family: var(--dct-font-family, system-ui, sans-serif);
    font-size: var(--dct-font-size-base, 1rem);
    line-height: var(--dct-line-height-normal, 1.5);
  }

  .dct-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--dct-spacing-2, 0.5rem) var(--dct-spacing-4, 1rem);
    border-radius: var(--dct-radius-md, 0.375rem);
    font-weight: var(--dct-font-weight-medium, 500);
    font-size: var(--dct-font-size-sm, 0.875rem);
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }

  .dct-button-primary {
    background-color: var(--dct-color-primary, #3b82f6);
    color: white;
  }

  .dct-button-primary:hover {
    background-color: var(--dct-color-primaryDark, #2563eb);
    transform: translateY(-1px);
  }

  .dct-button-secondary {
    background-color: var(--dct-color-secondary, #6b7280);
    color: white;
  }

  .dct-button-outline {
    background-color: transparent;
    border: 1px solid var(--dct-color-primary, #3b82f6);
    color: var(--dct-color-primary, #3b82f6);
  }

  .dct-input {
    width: 100%;
    padding: var(--dct-spacing-3, 0.75rem);
    border: 1px solid var(--dct-color-border, #d1d5db);
    border-radius: var(--dct-radius-md, 0.375rem);
    font-size: var(--dct-font-size-base, 1rem);
    background-color: var(--dct-color-background, #ffffff);
    color: var(--dct-color-text, #111827);
  }

  .dct-input:focus {
    outline: none;
    border-color: var(--dct-color-primary, #3b82f6);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .dct-card {
    background-color: var(--dct-color-surface, #ffffff);
    border-radius: var(--dct-radius-lg, 0.5rem);
    box-shadow: var(--dct-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
    padding: var(--dct-spacing-6, 1.5rem);
  }

  /* Dark mode variants */
  .dark .dct-surface {
    background-color: var(--dct-color-surface, #1f2937);
  }

  .dark .dct-text {
    color: var(--dct-color-text, #f9fafb);
  }

  .dark .dct-input {
    background-color: var(--dct-color-surface, #1f2937);
    border-color: var(--dct-color-border, #374151);
    color: var(--dct-color-text, #f9fafb);
  }

  .dark .dct-card {
    background-color: var(--dct-color-surface, #1f2937);
  }

  /* Responsive utilities */
  @media (max-width: 768px) {
    .dct-container {
      padding: 0 var(--dct-spacing-4, 1rem);
    }

    .dct-button {
      padding: var(--dct-spacing-3, 0.75rem) var(--dct-spacing-6, 1.5rem);
      font-size: var(--dct-font-size-base, 1rem);
    }
  }
`;

export default ThemeProvider;