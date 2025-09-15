/**
 * Theme Integration Hook
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Comprehensive theme integration for multi-brand design system
 */

import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { getProcessedTokens, applyCSSVariables } from '@/lib/tokens/processor';
import type { ThemeMode, BrandVariant, TokenReference } from '@/lib/types/component-system';

// ============================================================================
// THEME INTEGRATION HOOK
// ============================================================================

export interface UseThemeOptions {
  theme?: ThemeMode;
  brand?: BrandVariant;
  customTokens?: Record<string, TokenReference>;
  fallbackTheme?: ThemeMode;
  fallbackBrand?: BrandVariant;
}

export function useTheme(options: UseThemeOptions = {}) {
  const { theme: nextTheme, setTheme: setNextTheme, systemTheme } = useNextTheme();
  const {
    theme: optionTheme,
    brand: optionBrand,
    customTokens,
    fallbackTheme = 'light',
    fallbackBrand = 'default'
  } = options;

  // Resolve theme and brand with fallbacks
  const resolvedTheme = optionTheme || (nextTheme as ThemeMode) || fallbackTheme;
  const resolvedBrand = optionBrand || fallbackBrand;
  
  // Get processed design tokens
  const tokens = useMemo(() => {
    try {
      return getProcessedTokens(resolvedBrand as any, resolvedTheme as any);
    } catch (error) {
      console.warn('Failed to load design tokens:', error);
      return getProcessedTokens(fallbackBrand as any, fallbackTheme as any);
    }
  }, [resolvedBrand, resolvedTheme, fallbackBrand, fallbackTheme]);
  
  // Generate theme classes
  const themeClasses = useMemo(() => {
    const classes = [
      `theme-${resolvedTheme}`,
      `brand-${resolvedBrand}`
    ];
    
    if (customTokens && Object.keys(customTokens).length > 0) {
      classes.push('has-custom-tokens');
    }
    
    return classes.join(' ');
  }, [resolvedTheme, resolvedBrand, customTokens]);
  
  // Apply theme changes to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      try {
        applyCSSVariables(resolvedBrand as any, resolvedTheme as any);
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.setAttribute('data-brand', resolvedBrand);
      } catch (error) {
        console.warn('Failed to apply theme variables:', error);
      }
    }
  }, [resolvedBrand, resolvedTheme]);
  
  // Token getter utility
  const getToken = useCallback((tokenPath: string, fallback?: string): string => {
    const pathParts = tokenPath.split('.');
    let current: any = tokens;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || tokenPath;
      }
    }
    
    return typeof current === 'string' ? current : fallback || tokenPath;
  }, [tokens]);
  
  // CSS variable getter
  const getCSSVar = useCallback((tokenName: string, fallback?: string): string => {
    if (customTokens && tokenName in customTokens) {
      return customTokens[tokenName];
    }
    return `var(--${tokenName}${fallback ? `, ${fallback}` : ''})`;
  }, [customTokens]);
  
  // Brand state management
  const [currentBrand, setCurrentBrand] = useState<BrandVariant>(resolvedBrand);

  // Theme toggle utilities
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light';
    setNextTheme(newTheme);
  }, [setNextTheme, resolvedTheme]);

  const setTheme = useCallback((theme: ThemeMode) => {
    setNextTheme(theme);
  }, [setNextTheme]);

  const setBrand = useCallback((brand: BrandVariant) => {
    setCurrentBrand(brand);
  }, []);
  
  return {
    // Current theme state
    theme: resolvedTheme,
    brand: currentBrand,
    tokens,
    
    // Computed values
    themeClasses,
    resolvedTheme,
    resolvedBrand,
    
    // Utilities
    getToken,
    getCSSVar,
    toggleTheme,
    setTheme,
    setBrand,
    
    // System detection
    systemTheme: systemTheme || 'light',
    isSystemTheme: nextTheme === 'system'
  };
}

// ============================================================================
// THEME-AWARE STYLING UTILITIES
// ============================================================================

/**
 * Hook for creating theme-aware styles
 */
export function useThemedStyles<T extends Record<string, any>>(
  stylesFn: (tokens: any, theme: ThemeMode, brand: BrandVariant) => T
): T {
  const { tokens, theme, brand } = useTheme();
  
  return useMemo(() => {
    try {
      return stylesFn(tokens, theme, brand);
    } catch (error) {
      console.warn('Error creating themed styles:', error);
      return {} as T;
    }
  }, [stylesFn, tokens, theme, brand]);
}

/**
 * Hook for responsive theme values
 */
export function useResponsiveTheme<T>(values: {
  light?: T;
  dark?: T;
  [brand: string]: T | undefined;
}): T | undefined {
  const { theme, brand } = useTheme();
  
  return useMemo(() => {
    // Check for brand-specific value first
    if (brand && brand in values) {
      return values[brand];
    }
    
    // Fall back to theme-specific value
    return values[theme] || values.light;
  }, [values, theme, brand]);
}

/**
 * Hook for theme-aware animations
 */
export function useThemedAnimation() {
  const { getToken, theme } = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  const duration = useMemo(() => ({
    instant: prefersReducedMotion ? '0ms' : getToken('animation.duration.instant', '0ms'),
    fast: prefersReducedMotion ? '0ms' : getToken('animation.duration.fast', '150ms'),
    normal: prefersReducedMotion ? '0ms' : getToken('animation.duration.normal', '250ms'),
    slow: prefersReducedMotion ? '0ms' : getToken('animation.duration.slow', '400ms'),
    slower: prefersReducedMotion ? '0ms' : getToken('animation.duration.slower', '600ms')
  }), [getToken, prefersReducedMotion]);
  
  const easing = useMemo(() => ({
    linear: getToken('animation.easing.linear', 'linear'),
    easeIn: getToken('animation.easing.easeIn', 'cubic-bezier(0.4, 0, 1, 1)'),
    easeOut: getToken('animation.easing.easeOut', 'cubic-bezier(0, 0, 0.2, 1)'),
    easeInOut: getToken('animation.easing.easeInOut', 'cubic-bezier(0.4, 0, 0.2, 1)'),
    bounce: getToken('animation.easing.bounce', 'cubic-bezier(0.68, -0.55, 0.265, 1.55)')
  }), [getToken]);
  
  return {
    duration,
    easing,
    prefersReducedMotion,
    theme
  };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Hook for media queries (used internally)
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const media = window.matchMedia(query);
    setMatches(media.matches);
    
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addListener(listener);
    
    return () => media.removeListener(listener);
  }, [query]);
  
  return matches;
}

/**
 * Hook for system theme detection
 */
export function useSystemTheme(): ThemeMode {
  const [systemTheme, setSystemTheme] = useState<ThemeMode>('light');
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    };
    
    updateTheme();
    mediaQuery.addListener(updateTheme);
    
    return () => mediaQuery.removeListener(updateTheme);
  }, []);
  
  return systemTheme;
}

/**
 * Hook for theme persistence
 */
export function useThemePersistence(key: string = 'theme') {
  const saveTheme = useCallback((theme: ThemeMode) => {
    try {
      localStorage.setItem(key, theme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error);
    }
  }, [key]);
  
  const loadTheme = useCallback((): ThemeMode | null => {
    try {
      return localStorage.getItem(key) as ThemeMode;
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error);
      return null;
    }
  }, [key]);
  
  const clearTheme = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear theme from localStorage:', error);
    }
  }, [key]);
  
  return {
    saveTheme,
    loadTheme,
    clearTheme
  };
}

// ============================================================================
// THEME UTILITIES
// ============================================================================

/**
 * Generate CSS custom properties object from tokens
 */
export function createThemeVariables(
  tokens: Record<string, any>,
  prefix: string = ''
): Record<string, string> {
  const variables: Record<string, string> = {};
  
  function processTokens(obj: any, path: string[] = []) {
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = [...path, key];
      const variableName = `--${prefix}${currentPath.join('-')}`;
      
      if (typeof value === 'string' || typeof value === 'number') {
        variables[variableName] = String(value);
      } else if (value && typeof value === 'object') {
        processTokens(value, currentPath);
      }
    });
  }
  
  processTokens(tokens);
  return variables;
}

/**
 * Apply theme variables to an element
 */
export function applyThemeVariables(
  element: HTMLElement,
  variables: Record<string, string>
) {
  Object.entries(variables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

// All exports are already declared above individually