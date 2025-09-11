/**
 * @fileoverview Brand-Aware Styling Utilities for HT-011.3.2
 * @module lib/branding/styling-utils
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.3.2: Implement Brand-Aware Styling System
 * 
 * This module provides utilities for generating and applying brand-aware
 * styling throughout the application.
 * 
 * Features:
 * - Dynamic CSS custom property generation
 * - Brand color manipulation and variations
 * - Automatic dark/light mode color generation
 * - Integration with existing styling system
 * - Support for custom brand configurations
 */

import { DynamicBrandConfig } from './logo-manager';

/**
 * Brand color configuration interface
 */
export interface BrandColorConfig {
  /** Primary brand color */
  primary: string;
  /** Secondary brand color */
  secondary?: string;
  /** Accent brand color */
  accent?: string;
  /** Success state color */
  success?: string;
  /** Warning state color */
  warning?: string;
  /** Error state color */
  error?: string;
  /** Info state color */
  info?: string;
  /** Destructive action color */
  destructive?: string;
}

/**
 * Brand styling configuration interface
 */
export interface BrandStylingConfig {
  /** Brand colors */
  colors: BrandColorConfig;
  /** Typography configuration */
  typography?: {
    fontFamily?: string;
    fontDisplay?: string;
  };
  /** Border radius configuration */
  borderRadius?: {
    default?: string;
    sm?: string;
    lg?: string;
    xl?: string;
  };
  /** Shadow configuration */
  shadows?: {
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  /** Transition configuration */
  transitions?: {
    default?: string;
    fast?: string;
    slow?: string;
  };
}

/**
 * CSS custom properties for brand styling
 */
export interface BrandCSSProperties {
  [key: string]: string;
}

/**
 * Color manipulation utilities
 */
export class ColorUtils {
  /**
   * Convert hex color to RGB
   */
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Convert RGB to hex
   */
  static rgbToHex(r: number, g: number, b: number): string {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Adjust color brightness
   */
  static adjustBrightness(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    const newR = Math.max(0, Math.min(255, r + (r * percent / 100)));
    const newG = Math.max(0, Math.min(255, g + (g * percent / 100)));
    const newB = Math.max(0, Math.min(255, b + (b * percent / 100)));

    return this.rgbToHex(Math.round(newR), Math.round(newG), Math.round(newB));
  }

  /**
   * Adjust color opacity
   */
  static adjustOpacity(hex: string, opacity: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const { r, g, b } = rgb;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  /**
   * Generate color variations for a base color
   */
  static generateColorVariations(baseColor: string): {
    base: string;
    hover: string;
    active: string;
    light: string;
    dark: string;
  } {
    return {
      base: baseColor,
      hover: this.adjustBrightness(baseColor, -10),
      active: this.adjustBrightness(baseColor, -20),
      light: this.adjustOpacity(baseColor, 0.1),
      dark: this.adjustBrightness(baseColor, -30),
    };
  }

  /**
   * Generate dark mode color variations
   */
  static generateDarkModeVariations(baseColor: string): {
    base: string;
    hover: string;
    active: string;
    light: string;
    dark: string;
  } {
    // For dark mode, we typically want lighter variations
    return {
      base: this.adjustBrightness(baseColor, 20),
      hover: this.adjustBrightness(baseColor, 10),
      active: this.adjustBrightness(baseColor, 0),
      light: this.adjustOpacity(baseColor, 0.2),
      dark: this.adjustBrightness(baseColor, -10),
    };
  }
}

/**
 * Brand styling utilities
 */
export class BrandStylingUtils {
  /**
   * Generate CSS custom properties for brand colors
   */
  static generateBrandCSSProperties(config: BrandStylingConfig): BrandCSSProperties {
    const cssProps: BrandCSSProperties = {};
    const { colors } = config;

    // Generate primary color variations
    if (colors.primary) {
      const primaryVariations = ColorUtils.generateColorVariations(colors.primary);
      cssProps['--brand-primary'] = primaryVariations.base;
      cssProps['--brand-primary-hover'] = primaryVariations.hover;
      cssProps['--brand-primary-active'] = primaryVariations.active;
      cssProps['--brand-primary-light'] = primaryVariations.light;
      cssProps['--brand-primary-dark'] = primaryVariations.dark;
    }

    // Generate secondary color variations
    if (colors.secondary) {
      const secondaryVariations = ColorUtils.generateColorVariations(colors.secondary);
      cssProps['--brand-secondary'] = secondaryVariations.base;
      cssProps['--brand-secondary-hover'] = secondaryVariations.hover;
      cssProps['--brand-secondary-active'] = secondaryVariations.active;
      cssProps['--brand-secondary-light'] = secondaryVariations.light;
      cssProps['--brand-secondary-dark'] = secondaryVariations.dark;
    }

    // Generate accent color variations
    if (colors.accent) {
      const accentVariations = ColorUtils.generateColorVariations(colors.accent);
      cssProps['--brand-accent'] = accentVariations.base;
      cssProps['--brand-accent-hover'] = accentVariations.hover;
      cssProps['--brand-accent-active'] = accentVariations.active;
      cssProps['--brand-accent-light'] = accentVariations.light;
      cssProps['--brand-accent-dark'] = accentVariations.dark;
    }

    // Generate success color variations
    if (colors.success) {
      const successVariations = ColorUtils.generateColorVariations(colors.success);
      cssProps['--brand-success'] = successVariations.base;
      cssProps['--brand-success-hover'] = successVariations.hover;
      cssProps['--brand-success-active'] = successVariations.active;
      cssProps['--brand-success-light'] = successVariations.light;
      cssProps['--brand-success-dark'] = successVariations.dark;
    }

    // Generate warning color variations
    if (colors.warning) {
      const warningVariations = ColorUtils.generateColorVariations(colors.warning);
      cssProps['--brand-warning'] = warningVariations.base;
      cssProps['--brand-warning-hover'] = warningVariations.hover;
      cssProps['--brand-warning-active'] = warningVariations.active;
      cssProps['--brand-warning-light'] = warningVariations.light;
      cssProps['--brand-warning-dark'] = warningVariations.dark;
    }

    // Generate error color variations
    if (colors.error) {
      const errorVariations = ColorUtils.generateColorVariations(colors.error);
      cssProps['--brand-error'] = errorVariations.base;
      cssProps['--brand-error-hover'] = errorVariations.hover;
      cssProps['--brand-error-active'] = errorVariations.active;
      cssProps['--brand-error-light'] = errorVariations.light;
      cssProps['--brand-error-dark'] = errorVariations.dark;
    }

    // Generate info color variations
    if (colors.info) {
      const infoVariations = ColorUtils.generateColorVariations(colors.info);
      cssProps['--brand-info'] = infoVariations.base;
      cssProps['--brand-info-hover'] = infoVariations.hover;
      cssProps['--brand-info-active'] = infoVariations.active;
      cssProps['--brand-info-light'] = infoVariations.light;
      cssProps['--brand-info-dark'] = infoVariations.dark;
    }

    // Generate destructive color variations
    if (colors.destructive) {
      const destructiveVariations = ColorUtils.generateColorVariations(colors.destructive);
      cssProps['--brand-destructive'] = destructiveVariations.base;
      cssProps['--brand-destructive-hover'] = destructiveVariations.hover;
      cssProps['--brand-destructive-active'] = destructiveVariations.active;
      cssProps['--brand-destructive-light'] = destructiveVariations.light;
      cssProps['--brand-destructive-dark'] = destructiveVariations.dark;
    }

    // Generate typography properties
    if (config.typography) {
      if (config.typography.fontFamily) {
        cssProps['--brand-font-family'] = config.typography.fontFamily;
      }
      if (config.typography.fontDisplay) {
        cssProps['--brand-font-display'] = config.typography.fontDisplay;
      }
    }

    // Generate border radius properties
    if (config.borderRadius) {
      if (config.borderRadius.default) {
        cssProps['--brand-border-radius'] = config.borderRadius.default;
      }
      if (config.borderRadius.sm) {
        cssProps['--brand-border-radius-sm'] = config.borderRadius.sm;
      }
      if (config.borderRadius.lg) {
        cssProps['--brand-border-radius-lg'] = config.borderRadius.lg;
      }
      if (config.borderRadius.xl) {
        cssProps['--brand-border-radius-xl'] = config.borderRadius.xl;
      }
    }

    // Generate shadow properties
    if (config.shadows) {
      if (config.shadows.sm) {
        cssProps['--brand-shadow-sm'] = config.shadows.sm;
      }
      if (config.shadows.md) {
        cssProps['--brand-shadow-md'] = config.shadows.md;
      }
      if (config.shadows.lg) {
        cssProps['--brand-shadow-lg'] = config.shadows.lg;
      }
      if (config.shadows.xl) {
        cssProps['--brand-shadow-xl'] = config.shadows.xl;
      }
    }

    // Generate transition properties
    if (config.transitions) {
      if (config.transitions.default) {
        cssProps['--brand-transition'] = config.transitions.default;
      }
      if (config.transitions.fast) {
        cssProps['--brand-transition-fast'] = config.transitions.fast;
      }
      if (config.transitions.slow) {
        cssProps['--brand-transition-slow'] = config.transitions.slow;
      }
    }

    return cssProps;
  }

  /**
   * Generate dark mode CSS custom properties
   */
  static generateDarkModeCSSProperties(config: BrandStylingConfig): BrandCSSProperties {
    const cssProps: BrandCSSProperties = {};
    const { colors } = config;

    // Generate dark mode color variations
    if (colors.primary) {
      const primaryVariations = ColorUtils.generateDarkModeVariations(colors.primary);
      cssProps['--brand-primary'] = primaryVariations.base;
      cssProps['--brand-primary-hover'] = primaryVariations.hover;
      cssProps['--brand-primary-active'] = primaryVariations.active;
      cssProps['--brand-primary-light'] = primaryVariations.light;
      cssProps['--brand-primary-dark'] = primaryVariations.dark;
    }

    if (colors.secondary) {
      const secondaryVariations = ColorUtils.generateDarkModeVariations(colors.secondary);
      cssProps['--brand-secondary'] = secondaryVariations.base;
      cssProps['--brand-secondary-hover'] = secondaryVariations.hover;
      cssProps['--brand-secondary-active'] = secondaryVariations.active;
      cssProps['--brand-secondary-light'] = secondaryVariations.light;
      cssProps['--brand-secondary-dark'] = secondaryVariations.dark;
    }

    if (colors.accent) {
      const accentVariations = ColorUtils.generateDarkModeVariations(colors.accent);
      cssProps['--brand-accent'] = accentVariations.base;
      cssProps['--brand-accent-hover'] = accentVariations.hover;
      cssProps['--brand-accent-active'] = accentVariations.active;
      cssProps['--brand-accent-light'] = accentVariations.light;
      cssProps['--brand-accent-dark'] = accentVariations.dark;
    }

    if (colors.success) {
      const successVariations = ColorUtils.generateDarkModeVariations(colors.success);
      cssProps['--brand-success'] = successVariations.base;
      cssProps['--brand-success-hover'] = successVariations.hover;
      cssProps['--brand-success-active'] = successVariations.active;
      cssProps['--brand-success-light'] = successVariations.light;
      cssProps['--brand-success-dark'] = successVariations.dark;
    }

    if (colors.warning) {
      const warningVariations = ColorUtils.generateDarkModeVariations(colors.warning);
      cssProps['--brand-warning'] = warningVariations.base;
      cssProps['--brand-warning-hover'] = warningVariations.hover;
      cssProps['--brand-warning-active'] = warningVariations.active;
      cssProps['--brand-warning-light'] = warningVariations.light;
      cssProps['--brand-warning-dark'] = warningVariations.dark;
    }

    if (colors.error) {
      const errorVariations = ColorUtils.generateDarkModeVariations(colors.error);
      cssProps['--brand-error'] = errorVariations.base;
      cssProps['--brand-error-hover'] = errorVariations.hover;
      cssProps['--brand-error-active'] = errorVariations.active;
      cssProps['--brand-error-light'] = errorVariations.light;
      cssProps['--brand-error-dark'] = errorVariations.dark;
    }

    if (colors.info) {
      const infoVariations = ColorUtils.generateDarkModeVariations(colors.info);
      cssProps['--brand-info'] = infoVariations.base;
      cssProps['--brand-info-hover'] = infoVariations.hover;
      cssProps['--brand-info-active'] = infoVariations.active;
      cssProps['--brand-info-light'] = infoVariations.light;
      cssProps['--brand-info-dark'] = infoVariations.dark;
    }

    if (colors.destructive) {
      const destructiveVariations = ColorUtils.generateDarkModeVariations(colors.destructive);
      cssProps['--brand-destructive'] = destructiveVariations.base;
      cssProps['--brand-destructive-hover'] = destructiveVariations.hover;
      cssProps['--brand-destructive-active'] = destructiveVariations.active;
      cssProps['--brand-destructive-light'] = destructiveVariations.light;
      cssProps['--brand-destructive-dark'] = destructiveVariations.dark;
    }

    return cssProps;
  }

  /**
   * Apply brand CSS properties to document root
   */
  static applyBrandCSSProperties(cssProps: BrandCSSProperties): void {
    const root = document.documentElement;
    
    Object.entries(cssProps).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Apply dark mode brand CSS properties
   */
  static applyDarkModeBrandCSSProperties(cssProps: BrandCSSProperties): void {
    const root = document.documentElement;
    
    // Add dark mode class if not present
    if (!root.classList.contains('dark')) {
      root.classList.add('dark');
    }
    
    Object.entries(cssProps).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Remove brand CSS properties from document root
   */
  static removeBrandCSSProperties(cssProps: BrandCSSProperties): void {
    const root = document.documentElement;
    
    Object.keys(cssProps).forEach((property) => {
      root.style.removeProperty(property);
    });
  }

  /**
   * Generate brand-aware CSS classes
   */
  static generateBrandCSSClasses(config: BrandStylingConfig): string[] {
    const classes: string[] = [];
    
    // Add brand font classes
    if (config.typography?.fontFamily) {
      classes.push('brand-font');
    }
    
    if (config.typography?.fontDisplay) {
      classes.push('brand-font-display');
    }
    
    // Add brand transition classes
    if (config.transitions?.default) {
      classes.push('brand-transition');
    }
    
    return classes;
  }

  /**
   * Validate brand styling configuration
   */
  static validateBrandStylingConfig(config: BrandStylingConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Validate colors
    if (!config.colors.primary) {
      errors.push('Primary color is required');
    }
    
    // Validate color format
    if (config.colors.primary && !/^#[0-9A-F]{6}$/i.test(config.colors.primary)) {
      errors.push('Primary color must be a valid hex color');
    }
    
    // Validate border radius
    if (config.borderRadius) {
      const radiusValues = Object.values(config.borderRadius);
      for (const radius of radiusValues) {
        if (radius && !/^\d+(\.\d+)?(px|rem|em|%)$/.test(radius)) {
          errors.push('Border radius values must be valid CSS length values');
          break;
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Default brand styling configuration
 */
export const DEFAULT_BRAND_STYLING_CONFIG: BrandStylingConfig = {
  colors: {
    primary: '#007AFF',
    secondary: '#6B7280',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    destructive: '#DC2626',
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontDisplay: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
  },
  borderRadius: {
    default: '0.5rem',
    sm: '0.25rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  transitions: {
    default: 'all 0.2s ease-in-out',
    fast: 'all 0.15s ease-in-out',
    slow: 'all 0.3s ease-in-out',
  },
};

/**
 * Brand styling manager
 */
export class BrandStylingManager {
  private currentConfig: BrandStylingConfig;
  private listeners: Array<(config: BrandStylingConfig) => void> = [];

  constructor(initialConfig?: BrandStylingConfig) {
    this.currentConfig = initialConfig || DEFAULT_BRAND_STYLING_CONFIG;
    this.applyBrandStyling();
  }

  /**
   * Get current brand styling configuration
   */
  getCurrentConfig(): BrandStylingConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update brand styling configuration
   */
  updateConfig(newConfig: Partial<BrandStylingConfig>): void {
    this.currentConfig = {
      ...this.currentConfig,
      ...newConfig,
      colors: {
        ...this.currentConfig.colors,
        ...newConfig.colors,
      },
      typography: {
        ...this.currentConfig.typography,
        ...newConfig.typography,
      },
      borderRadius: {
        ...this.currentConfig.borderRadius,
        ...newConfig.borderRadius,
      },
      shadows: {
        ...this.currentConfig.shadows,
        ...newConfig.shadows,
      },
      transitions: {
        ...this.currentConfig.transitions,
        ...newConfig.transitions,
      },
    };
    
    this.applyBrandStyling();
    this.notifyListeners();
  }

  /**
   * Apply brand styling to document
   */
  private applyBrandStyling(): void {
    const cssProps = BrandStylingUtils.generateBrandCSSProperties(this.currentConfig);
    BrandStylingUtils.applyBrandCSSProperties(cssProps);
  }

  /**
   * Subscribe to brand styling changes
   */
  subscribe(listener: (config: BrandStylingConfig) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getCurrentConfig());
      } catch (error) {
        console.error('Error in brand styling listener:', error);
      }
    });
  }
}

/**
 * Global brand styling manager instance
 */
export const brandStylingManager = new BrandStylingManager();
