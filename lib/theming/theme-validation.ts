/**
 * @fileoverview Theme Validation and Accessibility System
 * Phase 4.1: Comprehensive theme validation with accessibility checks
 */

import type { ThemeConfig } from './theme-engine';

// Theme Validation Result Interface
export interface ThemeValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  accessibility: {
    contrastPassed: boolean;
    focusVisible: boolean;
    reducedMotion: boolean;
    colorBlindFriendly: boolean;
    textReadability: boolean;
  };
  performance: {
    cssSize: number;
    variableCount: number;
    complexity: 'low' | 'medium' | 'high';
  };
  recommendations: string[];
}

// Accessibility Standards
export const ACCESSIBILITY_STANDARDS = {
  WCAG_AA: {
    contrastRatio: {
      normal: 4.5,
      large: 3.0,
      ui: 3.0
    },
    fontSize: {
      minimum: 14,
      recommended: 16
    },
    lineHeight: {
      minimum: 1.4,
      recommended: 1.5
    }
  },
  WCAG_AAA: {
    contrastRatio: {
      normal: 7.0,
      large: 4.5,
      ui: 4.5
    },
    fontSize: {
      minimum: 16,
      recommended: 18
    },
    lineHeight: {
      minimum: 1.5,
      recommended: 1.6
    }
  }
} as const;

/**
 * Theme Validator Class
 * Comprehensive validation system for theme configurations
 */
export class ThemeValidator {
  private standards = ACCESSIBILITY_STANDARDS.WCAG_AA;

  /**
   * Validate a complete theme configuration
   */
  validateTheme(theme: ThemeConfig): ThemeValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Color validation
    const colorValidation = this.validateColors(theme.colors);
    errors.push(...colorValidation.errors);
    warnings.push(...colorValidation.warnings);
    recommendations.push(...colorValidation.recommendations);

    // Typography validation
    const typographyValidation = this.validateTypography(theme.typography);
    errors.push(...typographyValidation.errors);
    warnings.push(...typographyValidation.warnings);
    recommendations.push(...typographyValidation.recommendations);

    // Spacing validation
    const spacingValidation = this.validateSpacing(theme.spacing);
    errors.push(...spacingValidation.errors);
    warnings.push(...spacingValidation.warnings);
    recommendations.push(...spacingValidation.recommendations);

    // Accessibility validation
    const accessibilityValidation = this.validateAccessibility(theme);
    errors.push(...accessibilityValidation.errors);
    warnings.push(...accessibilityValidation.warnings);
    recommendations.push(...accessibilityValidation.recommendations);

    // Performance validation
    const performanceValidation = this.validatePerformance(theme);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      accessibility: {
        contrastPassed: this.checkContrastCompliance(theme),
        focusVisible: theme.accessibility.focusRing.width > 0,
        reducedMotion: theme.accessibility.reducedMotion,
        colorBlindFriendly: this.checkColorBlindFriendly(theme.colors),
        textReadability: this.checkTextReadability(theme)
      },
      performance: performanceValidation,
      recommendations
    };
  }

  /**
   * Validate color palette
   */
  private validateColors(colors: ThemeConfig['colors']): { errors: string[]; warnings: string[]; recommendations: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check primary color contrast
    const primaryContrast = this.calculateContrastRatio(colors.primary, colors.background);
    if (primaryContrast < this.standards.contrastRatio.ui) {
      errors.push(`Primary color contrast ratio (${primaryContrast.toFixed(2)}) is below minimum (${this.standards.contrastRatio.ui})`);
    } else if (primaryContrast < this.standards.contrastRatio.normal) {
      warnings.push(`Primary color contrast ratio (${primaryContrast.toFixed(2)}) is below recommended (${this.standards.contrastRatio.normal})`);
    }

    // Check text color contrast
    const textContrast = this.calculateContrastRatio(colors.text, colors.background);
    if (textContrast < this.standards.contrastRatio.normal) {
      errors.push(`Text color contrast ratio (${textContrast.toFixed(2)}) is below minimum (${this.standards.contrastRatio.normal})`);
    } else if (textContrast < this.standards.contrastRatio.normal * 1.5) {
      warnings.push(`Text color contrast ratio (${textContrast.toFixed(2)}) could be improved for better readability`);
    }

    // Check secondary text contrast
    const secondaryTextContrast = this.calculateContrastRatio(colors.textSecondary, colors.background);
    if (secondaryTextContrast < this.standards.contrastRatio.ui) {
      errors.push(`Secondary text contrast ratio (${secondaryTextContrast.toFixed(2)}) is below minimum (${this.standards.contrastRatio.ui})`);
    }

    // Check for color accessibility
    if (!this.checkColorBlindFriendly(colors)) {
      warnings.push('Color palette may not be accessible for users with color vision deficiencies');
      recommendations.push('Consider adding visual indicators beyond color (icons, patterns, text)');
    }

    // Check for sufficient color variety
    const colorVariety = this.calculateColorVariety(colors);
    if (colorVariety < 0.3) {
      warnings.push('Color palette has limited variety, which may reduce visual hierarchy');
      recommendations.push('Consider adding more color variations for better visual distinction');
    }

    return { errors, warnings, recommendations };
  }

  /**
   * Validate typography configuration
   */
  private validateTypography(typography: ThemeConfig['typography']): { errors: string[]; warnings: string[]; recommendations: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check font size
    if (typography.bodySize < this.standards.fontSize.minimum) {
      errors.push(`Body font size (${typography.bodySize}px) is below minimum (${this.standards.fontSize.minimum}px)`);
    } else if (typography.bodySize < this.standards.fontSize.recommended) {
      warnings.push(`Body font size (${typography.bodySize}px) is below recommended (${this.standards.fontSize.recommended}px)`);
    }

    // Check line height
    if (typography.lineHeight < this.standards.lineHeight.minimum) {
      errors.push(`Line height (${typography.lineHeight}) is below minimum (${this.standards.lineHeight.minimum})`);
    } else if (typography.lineHeight < this.standards.lineHeight.recommended) {
      warnings.push(`Line height (${typography.lineHeight}) is below recommended (${this.standards.lineHeight.recommended})`);
    }

    // Check letter spacing
    if (Math.abs(typography.letterSpacing) > 0.1) {
      warnings.push(`Letter spacing (${typography.letterSpacing}em) is quite high and may affect readability`);
    }

    // Check heading scale
    if (typography.headingScale < 1.2) {
      warnings.push(`Heading scale (${typography.headingScale}) is low and may not provide sufficient visual hierarchy`);
    } else if (typography.headingScale > 2.0) {
      warnings.push(`Heading scale (${typography.headingScale}) is high and may create too much contrast`);
    }

    // Check font family availability
    if (!this.checkFontAvailability(typography.fontPrimary)) {
      warnings.push(`Primary font "${typography.fontPrimary}" may not be available on all systems`);
      recommendations.push('Consider adding fallback fonts to the font stack');
    }

    return { errors, warnings, recommendations };
  }

  /**
   * Validate spacing configuration
   */
  private validateSpacing(spacing: ThemeConfig['spacing']): { errors: string[]; warnings: string[]; recommendations: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check base spacing
    if (spacing.base < 4) {
      warnings.push(`Base spacing (${spacing.base}px) is quite small and may not provide sufficient touch targets`);
    }

    // Check spacing scale
    if (spacing.scale < 1.2) {
      warnings.push(`Spacing scale (${spacing.scale}) is low and may not provide sufficient visual rhythm`);
    } else if (spacing.scale > 2.0) {
      warnings.push(`Spacing scale (${spacing.scale}) is high and may create inconsistent spacing`);
    }

    // Check container width
    if (spacing.containerMaxWidth < 320) {
      errors.push(`Container max width (${spacing.containerMaxWidth}px) is too small for mobile devices`);
    } else if (spacing.containerMaxWidth > 1920) {
      warnings.push(`Container max width (${spacing.containerMaxWidth}px) is very large and may not be optimal for readability`);
    }

    // Check spacing consistency
    const spacingValues = [spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl, spacing['2xl'], spacing['3xl']];
    const isConsistent = this.checkSpacingConsistency(spacingValues);
    if (!isConsistent) {
      warnings.push('Spacing values are not consistent with the defined scale');
      recommendations.push('Ensure spacing values follow a consistent mathematical progression');
    }

    return { errors, warnings, recommendations };
  }

  /**
   * Validate accessibility features
   */
  private validateAccessibility(theme: ThemeConfig): { errors: string[]; warnings: string[]; recommendations: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Check focus ring
    if (theme.accessibility.focusRing.width === 0) {
      errors.push('Focus ring width is 0, which will make the interface inaccessible to keyboard users');
    } else if (theme.accessibility.focusRing.width < 2) {
      warnings.push(`Focus ring width (${theme.accessibility.focusRing.width}px) may be too thin to be clearly visible`);
    }

    // Check focus ring color contrast
    const focusRingContrast = this.calculateContrastRatio(
      theme.accessibility.focusRing.color,
      theme.colors.background
    );
    if (focusRingContrast < this.standards.contrastRatio.ui) {
      errors.push(`Focus ring color contrast ratio (${focusRingContrast.toFixed(2)}) is below minimum (${this.standards.contrastRatio.ui})`);
    }

    // Check reduced motion support
    if (!theme.accessibility.reducedMotion) {
      recommendations.push('Consider enabling reduced motion support for users with vestibular disorders');
    }

    // Check high contrast support
    if (!theme.accessibility.highContrast) {
      recommendations.push('Consider adding high contrast mode support for users with visual impairments');
    }

    return { errors, warnings, recommendations };
  }

  /**
   * Validate performance characteristics
   */
  private validatePerformance(theme: ThemeConfig): { cssSize: number; variableCount: number; complexity: 'low' | 'medium' | 'high' } {
    const cssVariables = this.generateCSSVariables(theme);
    const cssSize = new Blob([cssVariables]).size;
    const variableCount = (cssVariables.match(/--/g) || []).length;

    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (variableCount > 50 || cssSize > 5000) {
      complexity = 'high';
    } else if (variableCount > 30 || cssSize > 3000) {
      complexity = 'medium';
    }

    return { cssSize, variableCount, complexity };
  }

  /**
   * Check contrast compliance
   */
  private checkContrastCompliance(theme: ThemeConfig): boolean {
    const primaryContrast = this.calculateContrastRatio(theme.colors.primary, theme.colors.background);
    const textContrast = this.calculateContrastRatio(theme.colors.text, theme.colors.background);
    
    return primaryContrast >= this.standards.contrastRatio.ui && 
           textContrast >= this.standards.contrastRatio.normal;
  }

  /**
   * Check color blind friendly palette
   */
  private checkColorBlindFriendly(colors: ThemeConfig['colors']): boolean {
    // Check for sufficient contrast between primary colors
    const primarySecondaryContrast = this.calculateContrastRatio(colors.primary, colors.secondary);
    const primaryAccentContrast = this.calculateContrastRatio(colors.primary, colors.accent);
    const secondaryAccentContrast = this.calculateContrastRatio(colors.secondary, colors.accent);

    return primarySecondaryContrast >= 3.0 && 
           primaryAccentContrast >= 3.0 && 
           secondaryAccentContrast >= 3.0;
  }

  /**
   * Check text readability
   */
  private checkTextReadability(theme: ThemeConfig): boolean {
    const textContrast = this.calculateContrastRatio(theme.colors.text, theme.colors.background);
    const fontSize = theme.typography.bodySize;
    const lineHeight = theme.typography.lineHeight;

    return textContrast >= this.standards.contrastRatio.normal &&
           fontSize >= this.standards.fontSize.minimum &&
           lineHeight >= this.standards.lineHeight.minimum;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate relative luminance
   */
  private getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate color variety in palette
   */
  private calculateColorVariety(colors: ThemeConfig['colors']): number {
    const colorValues = [
      colors.primary, colors.secondary, colors.accent,
      colors.success, colors.warning, colors.error, colors.info
    ];
    
    let totalVariety = 0;
    let comparisons = 0;
    
    for (let i = 0; i < colorValues.length; i++) {
      for (let j = i + 1; j < colorValues.length; j++) {
        const contrast = this.calculateContrastRatio(colorValues[i], colorValues[j]);
        totalVariety += contrast;
        comparisons++;
      }
    }
    
    return comparisons > 0 ? totalVariety / comparisons / 10 : 0; // Normalize to 0-1 range
  }

  /**
   * Check font availability
   */
  private checkFontAvailability(fontFamily: string): boolean {
    // Common web-safe fonts
    const webSafeFonts = [
      'Arial', 'Helvetica', 'Times New Roman', 'Times', 'Courier New', 'Courier',
      'Verdana', 'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
      'Trebuchet MS', 'Arial Black', 'Impact'
    ];
    
    return webSafeFonts.includes(fontFamily);
  }

  /**
   * Check spacing consistency
   */
  private checkSpacingConsistency(spacingValues: number[]): boolean {
    if (spacingValues.length < 3) return true;
    
    const ratios = [];
    for (let i = 1; i < spacingValues.length; i++) {
      if (spacingValues[i-1] > 0) {
        ratios.push(spacingValues[i] / spacingValues[i-1]);
      }
    }
    
    if (ratios.length === 0) return true;
    
    const averageRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    const tolerance = 0.2; // 20% tolerance
    
    return ratios.every(ratio => Math.abs(ratio - averageRatio) / averageRatio <= tolerance);
  }

  /**
   * Generate CSS variables for performance calculation
   */
  private generateCSSVariables(theme: ThemeConfig): string {
    // Simplified version for performance calculation
    return `
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-secondary: ${theme.colors.textSecondary};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      --color-muted: ${theme.colors.muted};
      --color-border: ${theme.colors.border};
      --color-input: ${theme.colors.input};
      --color-ring: ${theme.colors.ring};
    `;
  }

  /**
   * Set accessibility standards
   */
  setStandards(standards: typeof ACCESSIBILITY_STANDARDS.WCAG_AA | typeof ACCESSIBILITY_STANDARDS.WCAG_AAA): void {
    this.standards = standards;
  }

  /**
   * Get current standards
   */
  getStandards(): typeof ACCESSIBILITY_STANDARDS.WCAG_AA | typeof ACCESSIBILITY_STANDARDS.WCAG_AAA {
    return this.standards;
  }
}

// Create global validator instance
export const themeValidator = new ThemeValidator();

// Export utility functions
export const validateTheme = (theme: ThemeConfig) => themeValidator.validateTheme(theme);
export const setValidationStandards = (standards: typeof ACCESSIBILITY_STANDARDS.WCAG_AA | typeof ACCESSIBILITY_STANDARDS.WCAG_AAA) => 
  themeValidator.setStandards(standards);
export const getValidationStandards = () => themeValidator.getStandards();
