'use client'

/**
 * Design Tokens Provider
 * 
 * Provides design tokens via React context and manages CSS custom properties.
 * Integrates with next-themes for light/dark mode support.
 * 
 * Universal Header: @lib/design-tokens/provider
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { designTokens, DesignTokens, SemanticColors } from './tokens';

interface TokensContextValue {
  tokens: DesignTokens;
  semanticColors: SemanticColors;
  updateCSSVariables: () => void;
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined);

interface TokensProviderProps {
  children: React.ReactNode;
  customTokens?: Partial<DesignTokens>;
}

export function TokensProvider({ children, customTokens }: TokensProviderProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Merge custom tokens with defaults
  const tokens = React.useMemo(() => 
    customTokens ? { ...designTokens, ...customTokens } : designTokens,
    [customTokens]
  );
  
  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  
  // Get semantic colors based on theme
  const semanticColors = isDark ? tokens.colors.dark : tokens.colors.light;
  
  // Update CSS custom properties
  const updateCSSVariables = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Color tokens
    Object.entries(semanticColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
    
    // Neutral scale
    Object.entries(tokens.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value);
    });
    
    // Accent scale
    Object.entries(tokens.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });
    
    // Typography tokens
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    Object.entries(tokens.typography.lineHeight).forEach(([key, value]) => {
      root.style.setProperty(`--line-height-${key}`, value);
    });
    
    // Spacing tokens
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });
    
    // Border radius tokens
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });
    
    // Shadow tokens
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Component tokens - Button
    Object.entries(tokens.components.button.height).forEach(([key, value]) => {
      root.style.setProperty(`--button-height-${key}`, value);
    });
    
    Object.entries(tokens.components.button.padding).forEach(([key, value]) => {
      root.style.setProperty(`--button-padding-${key}`, value);
    });
    
    Object.entries(tokens.components.button.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--button-font-size-${key}`, value);
    });
    
    root.style.setProperty(`--button-border-radius`, tokens.components.button.borderRadius);
    
    // Component tokens - Card
    root.style.setProperty(`--card-border-radius`, tokens.components.card.borderRadius);
    root.style.setProperty(`--card-padding`, tokens.components.card.padding);
    root.style.setProperty(`--card-shadow`, tokens.components.card.shadow);
    root.style.setProperty(`--card-border-width`, tokens.components.card.borderWidth);
    
    // Component tokens - Chip
    root.style.setProperty(`--chip-height`, tokens.components.chip.height);
    root.style.setProperty(`--chip-padding`, tokens.components.chip.padding);
    root.style.setProperty(`--chip-border-radius`, tokens.components.chip.borderRadius);
    root.style.setProperty(`--chip-font-size`, tokens.components.chip.fontSize);
    
    // Component tokens - Tabs
    root.style.setProperty(`--tabs-height`, tokens.components.tabs.height);
    root.style.setProperty(`--tabs-border-radius`, tokens.components.tabs.borderRadius);
    root.style.setProperty(`--tabs-padding`, tokens.components.tabs.padding);
    
    // Component tokens - Stepper
    root.style.setProperty(`--stepper-size`, tokens.components.stepper.size);
    root.style.setProperty(`--stepper-border-width`, tokens.components.stepper.borderWidth);
    root.style.setProperty(`--stepper-connector-height`, tokens.components.stepper.connectorHeight);
    
    // Component tokens - Toast
    root.style.setProperty(`--toast-border-radius`, tokens.components.toast.borderRadius);
    root.style.setProperty(`--toast-padding`, tokens.components.toast.padding);
    root.style.setProperty(`--toast-shadow`, tokens.components.toast.shadow);
    root.style.setProperty(`--toast-max-width`, tokens.components.toast.maxWidth);
    
  }, [semanticColors, tokens]);
  
  // Update CSS variables when theme changes
  useEffect(() => {
    setMounted(true);
    updateCSSVariables();
  }, [updateCSSVariables]);
  
  // Don't render until mounted (hydration safety)
  if (!mounted) {
    return <>{children}</>;
  }
  
  const contextValue: TokensContextValue = {
    tokens,
    semanticColors,
    updateCSSVariables,
  };
  
  return (
    <TokensContext.Provider value={contextValue}>
      {children}
    </TokensContext.Provider>
  );
}

/**
 * Hook to use design tokens
 */
export function useTokens() {
  const context = useContext(TokensContext);
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokensProvider');
  }
  return context;
}

/**
 * Hook to get semantic colors for current theme
 */
export function useSemanticColors() {
  const { semanticColors } = useTokens();
  return semanticColors;
}

/**
 * Hook to get design tokens
 */
export function useDesignTokens() {
  const { tokens } = useTokens();
  return tokens;
}