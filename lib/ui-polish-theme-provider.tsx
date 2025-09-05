/**
 * Enhanced Theme Provider for UI Polish - Swift-Inspired Aesthetic
 * 
 * Extends the existing theme system to support dark-first theming when
 * FEATURE_UI_POLISH_TARGET_STYLE is enabled. Maintains backward compatibility
 * while providing Swift-inspired semantic tokens.
 * 
 * Universal Header: @lib/ui-polish-theme-provider.tsx
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { isUiPolishEnabled } from './ui-polish-flags';

// =============================================================================
// UI POLISH SEMANTIC TOKENS
// =============================================================================

export interface UiPolishSemanticTokens {
  // Surface tokens for layered design
  surface: string;
  surfaceElev: string;
  surfaceElev2: string;
  
  // Text tokens
  text: string;
  textMuted: string;
  textSubtle: string;
  
  // Border tokens
  border: string;
  borderSubtle: string;
  
  // Accent tokens (single source)
  accent: string;
  accentContrast: string;
  
  // Interactive tokens
  ring: string;
  shadow: string;
  shadowElevated: string;
}

// Swift-inspired dark-first semantic tokens
const uiPolishTokens: Record<'light' | 'dark', UiPolishSemanticTokens> = {
  dark: {
    // Dark-first surface system
    surface: '#0a0a0a',           // Deep black background
    surfaceElev: '#111111',       // Elevated surface (cards, modals)
    surfaceElev2: '#1a1a1a',      // Higher elevation (dropdowns, tooltips)
    
    // Text hierarchy
    text: '#ffffff',              // Primary text
    textMuted: '#a3a3a3',         // Secondary text
    textSubtle: '#737373',        // Tertiary text
    
    // Border system
    border: '#262626',            // Primary borders
    borderSubtle: '#171717',      // Subtle borders
    
    // Single accent (royal blue inspired)
    accent: '#3b82f6',            // Primary accent
    accentContrast: '#ffffff',    // Accent text
    
    // Interactive states
    ring: '#3b82f6',              // Focus rings
    shadow: '0 1px 2px 0 rgb(0 0 0 / 0.3)',      // Subtle shadow
    shadowElevated: '0 4px 6px -1px rgb(0 0 0 / 0.4)', // Elevated shadow
  },
  light: {
    // Light mode surfaces
    surface: '#ffffff',           // Pure white background
    surfaceElev: '#fafafa',       // Elevated surface
    surfaceElev2: '#f5f5f5',      // Higher elevation
    
    // Text hierarchy
    text: '#111111',              // Primary text
    textMuted: '#6b7280',         // Secondary text
    textSubtle: '#9ca3af',        // Tertiary text
    
    // Border system
    border: '#e5e7eb',            // Primary borders
    borderSubtle: '#f3f4f6',      // Subtle borders
    
    // Single accent (royal blue)
    accent: '#2563eb',            // Primary accent
    accentContrast: '#ffffff',    // Accent text
    
    // Interactive states
    ring: '#2563eb',              // Focus rings
    shadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',     // Subtle shadow
    shadowElevated: '0 4px 6px -1px rgb(0 0 0 / 0.1)', // Elevated shadow
  },
};

// =============================================================================
// UI POLISH THEME CONTEXT
// =============================================================================

interface UiPolishThemeContextValue {
  tokens: UiPolishSemanticTokens;
  isDarkFirst: boolean;
  updateCSSVariables: () => void;
}

const UiPolishThemeContext = createContext<UiPolishThemeContextValue | undefined>(undefined);

// =============================================================================
// UI POLISH THEME PROVIDER
// =============================================================================

interface UiPolishThemeProviderProps {
  children: React.ReactNode;
}

function UiPolishThemeProvider({ children }: UiPolishThemeProviderProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Determine if UI polish is enabled
  const isUiPolishOn = isUiPolishEnabled();
  
  // Determine current theme (dark-first when UI polish enabled)
  const currentTheme = isUiPolishOn 
    ? (theme === 'system' ? 'dark' : theme || 'dark')  // Dark-first default
    : (theme === 'system' ? resolvedTheme : theme || 'system'); // System default
  
  const isDark = currentTheme === 'dark';
  const tokens = isUiPolishOn ? uiPolishTokens[currentTheme as 'light' | 'dark'] : uiPolishTokens.light;
  
  // Update CSS custom properties
  const updateCSSVariables = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    if (isUiPolishOn) {
      // Set UI polish semantic tokens
      Object.entries(tokens).forEach(([key, value]) => {
        root.style.setProperty(`--ui-polish-${key}`, value as string);
      });
      
      // Add UI polish class for styling
      root.classList.add('ui-polish-enabled');
    } else {
      // Remove UI polish class
      root.classList.remove('ui-polish-enabled');
    }
  }, [isUiPolishOn, tokens]);
  
  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Update CSS variables when theme changes
  useEffect(() => {
    if (mounted) {
      updateCSSVariables();
    }
  }, [mounted, updateCSSVariables]);
  
  const contextValue: UiPolishThemeContextValue = {
    tokens,
    isDarkFirst: isUiPolishOn,
    updateCSSVariables,
  };
  
  return (
    <UiPolishThemeContext.Provider value={contextValue}>
      {children}
    </UiPolishThemeContext.Provider>
  );
}

// =============================================================================
// HOOKS
// =============================================================================

export function useUiPolishTheme(): UiPolishThemeContextValue {
  const context = useContext(UiPolishThemeContext);
  if (context === undefined) {
    throw new Error('useUiPolishTheme must be used within a UiPolishThemeProvider');
  }
  return context;
}

export function useUiPolishTokens(): UiPolishSemanticTokens {
  const { tokens } = useUiPolishTheme();
  return tokens;
}

// =============================================================================
// ENHANCED THEME PROVIDER WRAPPER
// =============================================================================

interface EnhancedThemeProviderProps {
  children: React.ReactNode;
  attribute?: 'class' | 'data-theme' | 'data-mode';
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function EnhancedThemeProvider({ 
  children, 
  attribute = "class",
  defaultTheme,
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props 
}: EnhancedThemeProviderProps) {
  const isUiPolishOn = isUiPolishEnabled();
  
  // Dark-first default when UI polish is enabled
  const effectiveDefaultTheme = isUiPolishOn ? 'dark' : (defaultTheme || 'system');
  
  return (
    <NextThemesProvider
      attribute={attribute}
      defaultTheme={effectiveDefaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
      {...props}
    >
      <UiPolishThemeProvider>
        {children}
      </UiPolishThemeProvider>
    </NextThemesProvider>
  );
}

// =============================================================================
// CSS VARIABLE UTILITIES
// =============================================================================

export function getUiPolishCSSVar(token: keyof UiPolishSemanticTokens): string {
  return `var(--ui-polish-${token})`;
}

export function getUiPolishCSSVars(): Record<string, string> {
  return {
    '--ui-polish-surface': getUiPolishCSSVar('surface'),
    '--ui-polish-surface-elev': getUiPolishCSSVar('surfaceElev'),
    '--ui-polish-surface-elev-2': getUiPolishCSSVar('surfaceElev2'),
    '--ui-polish-text': getUiPolishCSSVar('text'),
    '--ui-polish-text-muted': getUiPolishCSSVar('textMuted'),
    '--ui-polish-text-subtle': getUiPolishCSSVar('textSubtle'),
    '--ui-polish-border': getUiPolishCSSVar('border'),
    '--ui-polish-border-subtle': getUiPolishCSSVar('borderSubtle'),
    '--ui-polish-accent': getUiPolishCSSVar('accent'),
    '--ui-polish-accent-contrast': getUiPolishCSSVar('accentContrast'),
    '--ui-polish-ring': getUiPolishCSSVar('ring'),
    '--ui-polish-shadow': getUiPolishCSSVar('shadow'),
    '--ui-polish-shadow-elevated': getUiPolishCSSVar('shadowElevated'),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  UiPolishThemeProvider,
  uiPolishTokens,
  type UiPolishThemeContextValue,
};

// Default export
export default EnhancedThemeProvider;
