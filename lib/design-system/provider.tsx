/**
 * @fileoverview HT-008.5.2: Enhanced Design System Provider
 * @module lib/design-system/provider
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.2 - Create consistent design system with proper tokens
 * Focus: Unified design token system with Vercel/Apply-level consistency
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and maintainability)
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { designTokens, DesignTokens, SemanticColors } from './tokens';

interface DesignSystemContextValue {
  tokens: DesignTokens;
  semanticColors: SemanticColors;
  updateCSSVariables: () => void;
  isDark: boolean;
  theme: string | undefined;
}

const DesignSystemContext = createContext<DesignSystemContextValue | undefined>(undefined);

interface DesignSystemProviderProps {
  children: React.ReactNode;
  customTokens?: Partial<DesignTokens>;
}

export function DesignSystemProvider({ children, customTokens }: DesignSystemProviderProps) {
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
    
    Object.entries(tokens.typography.letterSpacing).forEach(([key, value]) => {
      root.style.setProperty(`--letter-spacing-${key}`, value);
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
    
    // Motion tokens
    Object.entries(tokens.motion.duration).forEach(([key, value]) => {
      root.style.setProperty(`--motion-duration-${key}`, value);
    });
    
    Object.entries(tokens.motion.easing).forEach(([key, value]) => {
      root.style.setProperty(`--motion-easing-${key}`, value);
    });
    
    Object.entries(tokens.motion.spring).forEach(([key, value]) => {
      root.style.setProperty(`--motion-spring-${key}`, value);
    });
    
    // Component tokens
    Object.entries(tokens.components.button).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--button-${key}-${subKey}`, subValue);
        });
      } else {
        root.style.setProperty(`--button-${key}`, value);
      }
    });
    
    Object.entries(tokens.components.input).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--input-${key}-${subKey}`, subValue);
        });
      } else {
        root.style.setProperty(`--input-${key}`, value);
      }
    });
    
    Object.entries(tokens.components.card).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          root.style.setProperty(`--card-${key}-${subKey}`, subValue);
        });
      } else {
        root.style.setProperty(`--card-${key}`, value);
      }
    });
    
    // Layout tokens
    Object.entries(tokens.layout.container.maxWidth).forEach(([key, value]) => {
      root.style.setProperty(`--container-max-width-${key}`, value);
    });
    
    Object.entries(tokens.layout.container.padding).forEach(([key, value]) => {
      root.style.setProperty(`--container-padding-${key}`, value);
    });
    
    Object.entries(tokens.layout.zIndex).forEach(([key, value]) => {
      root.style.setProperty(`--z-index-${key}`, value);
    });
    
    // Set theme-specific variables
    root.style.setProperty('--theme-mode', isDark ? 'dark' : 'light');
    root.style.setProperty('--color-scheme', isDark ? 'dark' : 'light');
    
  }, [semanticColors, tokens, isDark]);
  
  // Update CSS variables when theme changes
  useEffect(() => {
    updateCSSVariables();
  }, [updateCSSVariables]);
  
  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }
  
  const contextValue: DesignSystemContextValue = {
    tokens,
    semanticColors,
    updateCSSVariables,
    isDark,
    theme: currentTheme,
  };
  
  return (
    <DesignSystemContext.Provider value={contextValue}>
      {children}
    </DesignSystemContext.Provider>
  );
}

// Hook to use design system context
export function useDesignSystem() {
  const context = useContext(DesignSystemContext);
  if (context === undefined) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

// Hook to get tokens
export function useTokens() {
  const { tokens } = useDesignSystem();
  return { tokens };
}

// Hook to get semantic colors
export function useSemanticColors() {
  const { semanticColors } = useDesignSystem();
  return semanticColors;
}

// Hook to get theme state
export function useThemeState() {
  const { isDark, theme } = useDesignSystem();
  return { isDark, theme };
}

// Utility function to get CSS variable value
export function getCSSVariable(variable: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
}

// Utility function to set CSS variable value
export function setCSSVariable(variable: string, value: string): void {
  if (typeof window === 'undefined') return;
  document.documentElement.style.setProperty(variable, value);
}

// Utility function to get token value
export function getTokenValue(path: string): string {
  const parts = path.split('.');
  let value: any = designTokens;
  
  for (const part of parts) {
    value = value[part];
    if (value === undefined) {
      console.warn(`Token path "${path}" not found`);
      return '';
    }
  }
  
  return typeof value === 'string' ? value : '';
}

// Utility function to create CSS custom property
export function createCSSProperty(name: string, value: string): string {
  return `--${name}: ${value};`;
}

// Utility function to create CSS custom property with fallback
export function createCSSPropertyWithFallback(name: string, value: string, fallback: string): string {
  return `--${name}: ${fallback}; --${name}: ${value};`;
}

export default DesignSystemProvider;
