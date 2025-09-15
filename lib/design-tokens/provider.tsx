'use client';

/**
 * @fileoverview HT-011.1.2: Multi-Brand Design Token Provider with Typography
 * @module lib/design-tokens/provider
 * @author OSS Hero System
 * @version 3.1.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.2 - Implement Custom Typography System
 * Focus: Create flexible typography system supporting custom client fonts
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { 
  designTokens, 
  generateDesignTokens, 
  BrandPalette, 
  MultiBrandConfig,
  FontFamily,
  MultiTypographyConfig,
  fontLoader
} from './tokens';
import type { DesignTokens, SemanticColors } from './generator';

interface TokensContextValue {
  tokens: DesignTokens;
  semanticColors: SemanticColors;
  updateCSSVariables: () => void;
  // Multi-brand functionality
  activeBrand: string;
  availableBrands: BrandPalette[];
  switchBrand: (brandName: string) => void;
  addCustomBrand: (brand: BrandPalette) => void;
  multiBrandConfig: MultiBrandConfig;
  
  // Multi-typography functionality
  activeFont: string;
  availableFonts: FontFamily[];
  switchFont: (fontName: string) => void;
  addCustomFont: (font: FontFamily) => void;
  multiTypographyConfig: MultiTypographyConfig;
  loadFont: (font: FontFamily) => Promise<void>;
}

const TokensContext = createContext<TokensContextValue | undefined>(undefined);

interface TokensProviderProps {
  children: React.ReactNode;
  customTokens?: Partial<DesignTokens>;
  // Multi-brand props
  initialBrand?: string;
  customBrands?: BrandPalette[];
  // Multi-typography props
  initialFont?: string;
  customFonts?: FontFamily[];
}

export function TokensProvider({ 
  children, 
  customTokens, 
  initialBrand = 'Default Blue',
  customBrands = [],
  initialFont = 'inter',
  customFonts = []
}: TokensProviderProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeBrand, setActiveBrand] = useState(initialBrand);
  const [activeFont, setActiveFont] = useState(initialFont);
  
  // Generate tokens based on active brand and font
  const tokens = React.useMemo(() => {
    const generatedTokens = generateDesignTokens(activeBrand, customBrands, activeFont, customFonts);
    return customTokens ? { ...generatedTokens, ...customTokens } : generatedTokens;
  }, [activeBrand, customBrands, activeFont, customFonts, customTokens]);
  
  // Determine current theme
  const currentTheme = theme === 'system' ? systemTheme : theme;
  const isDark = currentTheme === 'dark';
  
  // Get semantic colors based on theme
  const semanticColors = isDark ? tokens.colors.dark : tokens.colors.light;
  
  // Multi-brand functions
  const switchBrand = React.useCallback((brandName: string) => {
    setActiveBrand(brandName);
  }, []);
  
  const addCustomBrand = React.useCallback((brand: BrandPalette) => {
    // This would typically update a persistent store
    console.log('Adding custom brand:', brand);
  }, []);
  
  // Multi-typography functions
  const switchFont = React.useCallback((fontName: string) => {
    setActiveFont(fontName);
  }, []);
  
  const addCustomFont = React.useCallback((font: FontFamily) => {
    // This would typically update a persistent store
    console.log('Adding custom font:', font);
  }, []);
  
  const loadFont = React.useCallback(async (font: FontFamily) => {
    try {
      await fontLoader.loadFont(font);
    } catch (error) {
      console.error('Failed to load font:', error);
    }
  }, []);
  
  const availableBrands = tokens.multiBrand.brands;
  const availableFonts = tokens.multiTypography.availableFonts;
  
  // Update CSS custom properties
  const updateCSSVariables = React.useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Color tokens
    Object.entries(semanticColors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, String(value));
    });
    
    // Neutral scale
    Object.entries(tokens.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value);
    });
    
    // Primary scale (brand colors)
    Object.entries(tokens.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });
    
    // Secondary scale (complementary colors)
    Object.entries(tokens.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });
    
    // Typography tokens
    root.style.setProperty('--font-family-sans', tokens.typography.fontFamily.fallbacks.join(', '));
    root.style.setProperty('--font-family-display', tokens.typography.fontFamily.displayName);
    
    Object.entries(tokens.typography.scale).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
    
    Object.entries(tokens.typography.weights).forEach(([key, value]) => {
      root.style.setProperty(`--font-weight-${key}`, value);
    });
    
    Object.entries(tokens.typography.lineHeights).forEach(([key, value]) => {
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
    
    // Border tokens
    Object.entries(tokens.borders.width).forEach(([key, value]) => {
      root.style.setProperty(`--border-width-${key}`, value);
    });
    
    const borderColors = isDark ? tokens.borders.color.dark : tokens.borders.color.light;
    Object.entries(borderColors).forEach(([key, value]) => {
      root.style.setProperty(`--border-color-${key}`, value);
    });
    
    // Elevation tokens (new material elevation system)
    Object.entries(tokens.elevation).forEach(([key, value]) => {
      root.style.setProperty(`--elevation-${key}`, value);
    });
    
    // Shadow tokens (legacy)
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });
    
    // Motion tokens
    Object.entries(tokens.motion.duration).forEach(([key, value]) => {
      root.style.setProperty(`--motion-duration-${key}`, value);
    });
    
    Object.entries(tokens.motion.easing).forEach(([key, value]) => {
      root.style.setProperty(`--motion-ease-${key}`, value);
    });
    
    // Component tokens - Button
    Object.entries(tokens.components.button.height).forEach(([key, value]) => {
      root.style.setProperty(`--button-height-${key}`, String(value));
    });
    
    Object.entries(tokens.components.button.padding).forEach(([key, value]) => {
      root.style.setProperty(`--button-padding-${key}`, String(value));
    });
    
    Object.entries(tokens.components.button.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--button-font-size-${key}`, String(value));
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
    
    // Layout tokens - Grid
    root.style.setProperty(`--grid-columns`, tokens.layout?.grid?.columns?.toString() || '12');
    root.style.setProperty(`--grid-max-width`, tokens.layout?.grid?.maxWidth || '1120px');
    
    if (tokens.layout?.grid?.gutter) {
      root.style.setProperty(`--grid-gutter`, tokens.layout.grid.gutter);
    }
    
    if (tokens.layout?.grid?.margin) {
      root.style.setProperty(`--grid-margin`, tokens.layout.grid.margin);
    }
    
    if (tokens.layout?.grid?.breakpoints) {
      Object.entries(tokens.layout.grid.breakpoints).forEach(([key, value]) => {
        root.style.setProperty(`--grid-breakpoint-${key}`, value);
      });
    }
    
    // Layout tokens - Section
    if (tokens.layout?.spacing) {
      Object.entries(tokens.layout.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--section-spacing-${key}`, value);
      });
    }
    
    // Layout tokens - Container
    if (tokens.layout?.container) {
      Object.entries(tokens.layout.container).forEach(([key, value]) => {
        root.style.setProperty(`--container-${key}`, value);
      });
    }
    
  }, [semanticColors, tokens, isDark]);
  
  // Update CSS variables when theme changes
  useEffect(() => {
    setMounted(true);
    updateCSSVariables();
  }, [updateCSSVariables]);
  
  // Don't render until mounted (hydration safety)
  if (!mounted) {
    return <div>{children}</div>;
  }
  
  const contextValue: TokensContextValue = {
    tokens,
    semanticColors,
    updateCSSVariables,
    // Multi-brand functionality
    activeBrand,
    availableBrands,
    switchBrand,
    addCustomBrand,
    multiBrandConfig: tokens.multiBrand,
    // Multi-typography functionality
    activeFont,
    availableFonts,
    switchFont,
    addCustomFont,
    multiTypographyConfig: tokens.multiTypography,
    loadFont,
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

// Multi-brand hooks
export function useMultiBrand() {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useMultiBrand must be used within a TokensProvider');
  }
  return {
    activeBrand: context.activeBrand,
    availableBrands: context.availableBrands,
    switchBrand: context.switchBrand,
    addCustomBrand: context.addCustomBrand,
    multiBrandConfig: context.multiBrandConfig,
  };
}

export function useActiveBrand(): string {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useActiveBrand must be used within a TokensProvider');
  }
  return context.activeBrand;
}

export function useBrandPalettes(): BrandPalette[] {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useBrandPalettes must be used within a TokensProvider');
  }
  return context.availableBrands;
}

// Multi-typography hooks
export function useMultiTypography() {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useMultiTypography must be used within a TokensProvider');
  }
  return {
    activeFont: context.activeFont,
    availableFonts: context.availableFonts,
    switchFont: context.switchFont,
    addCustomFont: context.addCustomFont,
    multiTypographyConfig: context.multiTypographyConfig,
    loadFont: context.loadFont,
  };
}

export function useActiveFont(): string {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useActiveFont must be used within a TokensProvider');
  }
  return context.activeFont;
}

export function useFontFamilies(): FontFamily[] {
  const context = useContext(TokensContext);
  if (!context) {
    throw new Error('useFontFamilies must be used within a TokensProvider');
  }
  return context.availableFonts;
}