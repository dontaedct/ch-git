/**
 * @fileoverview Brand-Aware Styling Hook for HT-011.3.2
 * @module lib/branding/use-brand-styling
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.2: Implement Brand-Aware Styling System
 * 
 * This hook provides React components with access to brand-aware styling
 * utilities and dynamic brand configuration.
 * 
 * Features:
 * - Dynamic brand styling configuration
 * - CSS custom property generation
 * - Brand color utilities
 * - Integration with existing branding system
 * - Support for custom brand overrides
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BrandStylingConfig, 
  BrandCSSProperties, 
  BrandStylingUtils, 
  brandStylingManager,
  DEFAULT_BRAND_STYLING_CONFIG 
} from './styling-utils';
import { useDynamicBrand } from './hooks';

/**
 * Brand styling hook return type
 */
export interface UseBrandStylingReturn {
  /** Current brand styling configuration */
  config: BrandStylingConfig;
  /** CSS custom properties for brand styling */
  cssProperties: BrandCSSProperties;
  /** Whether styling is being applied */
  isLoading: boolean;
  /** Any error that occurred */
  error: string | null;
  /** Update brand styling configuration */
  updateConfig: (newConfig: Partial<BrandStylingConfig>) => void;
  /** Apply brand styling to an element */
  applyBrandStyling: (element: HTMLElement) => void;
  /** Remove brand styling from an element */
  removeBrandStyling: (element: HTMLElement) => void;
  /** Generate brand-aware CSS classes */
  getBrandClasses: (baseClasses?: string) => string;
  /** Get brand color value */
  getBrandColor: (colorType: keyof BrandStylingConfig['colors']) => string;
  /** Check if brand styling is valid */
  isValid: boolean;
}

/**
 * Hook for managing brand-aware styling
 */
export function useBrandStyling(initialConfig?: BrandStylingConfig): UseBrandStylingReturn {
  const [config, setConfig] = useState<BrandStylingConfig>(
    initialConfig || brandStylingManager.getCurrentConfig()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { config: brandConfig } = useDynamicBrand();

  // Generate CSS properties from current config
  const cssProperties = BrandStylingUtils.generateBrandCSSProperties(config);

  // Validate configuration
  const validation = BrandStylingUtils.validateBrandStylingConfig(config);
  const isValid = validation.isValid;

  useEffect(() => {
    const unsubscribe = brandStylingManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  // Sync with dynamic brand configuration
  useEffect(() => {
    if ((brandConfig as any).theme?.colors) {
      const brandColors = {
        primary: (brandConfig as any).theme.colors.primary || config.colors.primary,
        secondary: (brandConfig as any).theme.colors.secondary || config.colors.secondary,
        accent: (brandConfig as any).theme.colors.accent || config.colors.accent,
        success: (brandConfig as any).theme.colors.success || config.colors.success,
        warning: (brandConfig as any).theme.colors.warning || config.colors.warning,
        error: (brandConfig as any).theme.colors.error || config.colors.error,
        info: (brandConfig as any).theme.colors.info || config.colors.info,
        destructive: (brandConfig as any).theme.colors.destructive || config.colors.destructive,
      };

      updateConfig({ colors: brandColors });
    }
  }, [(brandConfig as any).theme?.colors]);

  const updateConfig = useCallback(async (newConfig: Partial<BrandStylingConfig>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      brandStylingManager.updateConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand styling');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyBrandStyling = useCallback((element: HTMLElement) => {
    Object.entries(cssProperties).forEach(([property, value]) => {
      element.style.setProperty(property, value);
    });
  }, [cssProperties]);

  const removeBrandStyling = useCallback((element: HTMLElement) => {
    Object.keys(cssProperties).forEach((property) => {
      element.style.removeProperty(property);
    });
  }, [cssProperties]);

  const getBrandClasses = useCallback((baseClasses?: string) => {
    const brandClasses = BrandStylingUtils.generateBrandCSSClasses(config);
    return baseClasses ? `${baseClasses} ${brandClasses.join(' ')}` : brandClasses.join(' ');
  }, [config]);

  const getBrandColor = useCallback((colorType: keyof BrandStylingConfig['colors']) => {
    return config.colors[colorType] || '';
  }, [config.colors]);

  return {
    config,
    cssProperties,
    isLoading,
    error,
    updateConfig,
    applyBrandStyling,
    removeBrandStyling,
    getBrandClasses,
    getBrandColor,
    isValid,
  };
}

/**
 * Hook for brand color utilities
 */
export function useBrandColors() {
  const { config, getBrandColor } = useBrandStyling();

  const getColor = useCallback((colorType: keyof BrandStylingConfig['colors']) => {
    return getBrandColor(colorType);
  }, [getBrandColor]);

  const getColorVariations = useCallback((colorType: keyof BrandStylingConfig['colors']) => {
    const baseColor = getBrandColor(colorType);
    if (!baseColor) return null;

    // Generate variations using CSS custom properties
    return {
      base: `var(--brand-${colorType})`,
      hover: `var(--brand-${colorType}-hover)`,
      active: `var(--brand-${colorType}-active)`,
      light: `var(--brand-${colorType}-light)`,
      dark: `var(--brand-${colorType}-dark)`,
    };
  }, [getBrandColor]);

  const getBrandCSSProperties = useCallback(() => {
    const properties: React.CSSProperties = {};
    
    Object.keys(config.colors).forEach((colorType) => {
      const color = config.colors[colorType as keyof BrandStylingConfig['colors']];
      if (color) {
        (properties as any)[`--brand-${colorType}`] = color;
      }
    });

    return properties;
  }, [config.colors]);

  return {
    getColor,
    getColorVariations,
    getBrandCSSProperties,
    colors: config.colors,
  };
}

/**
 * Hook for brand typography
 */
export function useBrandTypography() {
  const { config } = useBrandStyling();

  const getFontFamily = useCallback(() => {
    return config.typography?.fontFamily || DEFAULT_BRAND_STYLING_CONFIG.typography?.fontFamily || '';
  }, [config.typography?.fontFamily]);

  const getDisplayFontFamily = useCallback(() => {
    return config.typography?.fontDisplay || DEFAULT_BRAND_STYLING_CONFIG.typography?.fontDisplay || '';
  }, [config.typography?.fontDisplay]);

  const getTypographyClasses = useCallback(() => {
    const classes: string[] = [];
    
    if (config.typography?.fontFamily) {
      classes.push('brand-font');
    }
    
    if (config.typography?.fontDisplay) {
      classes.push('brand-font-display');
    }
    
    return classes;
  }, [config.typography]);

  return {
    getFontFamily,
    getDisplayFontFamily,
    getTypographyClasses,
    typography: config.typography,
  };
}

/**
 * Hook for brand spacing and sizing
 */
export function useBrandSpacing() {
  const { config } = useBrandStyling();

  const getBorderRadius = useCallback((size: 'sm' | 'default' | 'lg' | 'xl' = 'default') => {
    const borderRadius = config.borderRadius?.[size] || DEFAULT_BRAND_STYLING_CONFIG.borderRadius?.[size] || '';
    return borderRadius;
  }, [config.borderRadius]);

  const getShadow = useCallback((size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
    const shadow = config.shadows?.[size] || DEFAULT_BRAND_STYLING_CONFIG.shadows?.[size] || '';
    return shadow;
  }, [config.shadows]);

  const getTransition = useCallback((speed: 'fast' | 'default' | 'slow' = 'default') => {
    const transition = config.transitions?.[speed] || DEFAULT_BRAND_STYLING_CONFIG.transitions?.[speed] || '';
    return transition;
  }, [config.transitions]);

  const getSpacingClasses = useCallback(() => {
    const classes: string[] = [];
    
    if (config.borderRadius) {
      classes.push('brand-rounded');
    }
    
    if (config.shadows) {
      classes.push('brand-shadow-md');
    }
    
    if (config.transitions) {
      classes.push('brand-transition');
    }
    
    return classes;
  }, [config]);

  return {
    getBorderRadius,
    getShadow,
    getTransition,
    getSpacingClasses,
    borderRadius: config.borderRadius,
    shadows: config.shadows,
    transitions: config.transitions,
  };
}

/**
 * Hook for brand-aware component styling
 */
export function useBrandComponent() {
  const { cssProperties, getBrandClasses, isValid } = useBrandStyling();
  const { getColorVariations } = useBrandColors();
  const { getTypographyClasses } = useBrandTypography();
  const { getSpacingClasses } = useBrandSpacing();

  const getComponentStyles = useCallback((baseStyles?: React.CSSProperties) => {
    return {
      ...baseStyles,
      ...cssProperties,
    };
  }, [cssProperties]);

  const getComponentClasses = useCallback((baseClasses?: string) => {
    const brandClasses = getBrandClasses();
    const typographyClasses = getTypographyClasses().join(' ');
    const spacingClasses = getSpacingClasses().join(' ');
    
    const allClasses = [
      baseClasses,
      brandClasses,
      typographyClasses,
      spacingClasses,
    ].filter(Boolean).join(' ');
    
    return allClasses;
  }, [getBrandClasses, getTypographyClasses, getSpacingClasses]);

  const getBrandVariations = useCallback((colorType: keyof BrandStylingConfig['colors']) => {
    return getColorVariations(colorType);
  }, [getColorVariations]);

  return {
    getComponentStyles,
    getComponentClasses,
    getBrandVariations,
    isValid,
    cssProperties,
  };
}
