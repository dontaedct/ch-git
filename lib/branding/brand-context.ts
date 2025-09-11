/**
 * @fileoverview Brand Context System for Design Guardian
 * @module lib/branding/brand-context
 * @author OSS Hero System
 * @version 1.0.0
 */

import { DynamicBrandConfig, logoManager } from './logo-manager';

export interface BrandValidationContext {
  /** Current brand configuration */
  brandConfig: DynamicBrandConfig;
  /** Available brand colors */
  brandColors: string[];
  /** Available brand fonts */
  brandFonts: string[];
  /** Brand validation rules */
  validationRules: BrandValidationRules;
}

export interface BrandValidationRules {
  /** Allow custom colors outside brand palette */
  allowCustomColors: boolean;
  /** Allow custom fonts outside brand system */
  allowCustomFonts: boolean;
  /** Require brand consistency in UI components */
  requireBrandConsistency: boolean;
  /** Allow brand overrides in specific contexts */
  allowBrandOverrides: boolean;
}

/**
 * Get current brand configuration for Design Guardian
 */
export function getCurrentBrandConfig(): BrandValidationContext {
  const brandConfig = logoManager.getCurrentConfig();
  
  // Extract brand colors from configuration
  const brandColors = extractBrandColors(brandConfig);
  
  // Extract brand fonts from configuration
  const brandFonts = extractBrandFonts(brandConfig);
  
  // Get validation rules based on brand configuration
  const validationRules = getBrandValidationRules(brandConfig);
  
  return {
    brandConfig,
    brandColors,
    brandFonts,
    validationRules,
  };
}

/**
 * Extract brand colors from brand configuration
 */
function extractBrandColors(config: DynamicBrandConfig): string[] {
  const colors: string[] = [];
  
  // Add primary colors from theme configuration
  // This would be expanded to include all theme colors
  colors.push('#007AFF'); // Default primary
  colors.push('#f9fafb'); // Default neutral-50
  colors.push('#111827'); // Default neutral-900
  
  // Add fallback background color
  if (config.logo.fallbackBgColor) {
    colors.push(config.logo.fallbackBgColor);
  }
  
  return colors;
}

/**
 * Extract brand fonts from brand configuration
 */
function extractBrandFonts(config: DynamicBrandConfig): string[] {
  const fonts: string[] = [];
  
  // Add default system fonts
  fonts.push('system-ui');
  fonts.push('sans-serif');
  fonts.push('Geist');
  
  // Add custom fonts if configured
  // This would be expanded to include custom font families
  
  return fonts;
}

/**
 * Get brand validation rules based on configuration
 */
function getBrandValidationRules(config: DynamicBrandConfig): BrandValidationRules {
  return {
    allowCustomColors: config.isCustom,
    allowCustomFonts: config.isCustom,
    requireBrandConsistency: true,
    allowBrandOverrides: config.isCustom,
  };
}

/**
 * Validate color usage against brand configuration
 */
export function validateBrandColor(color: string, context: BrandValidationContext): {
  isValid: boolean;
  message?: string;
} {
  // Allow brand colors
  if (context.brandColors.includes(color)) {
    return { isValid: true };
  }
  
  // Allow custom colors if configured
  if (context.validationRules.allowCustomColors) {
    return { isValid: true };
  }
  
  // Check if it's a valid Tailwind color class
  if (isValidTailwindColor(color)) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    message: `Color '${color}' is not in the brand palette. Use brand colors or Tailwind classes.`,
  };
}

/**
 * Validate font usage against brand configuration
 */
export function validateBrandFont(font: string, context: BrandValidationContext): {
  isValid: boolean;
  message?: string;
} {
  // Allow brand fonts
  if (context.brandFonts.includes(font)) {
    return { isValid: true };
  }
  
  // Allow custom fonts if configured
  if (context.validationRules.allowCustomFonts) {
    return { isValid: true };
  }
  
  return {
    isValid: false,
    message: `Font '${font}' is not in the brand system. Use brand fonts or configure custom fonts.`,
  };
}

/**
 * Check if a color is a valid Tailwind color class
 */
function isValidTailwindColor(color: string): boolean {
  // Basic Tailwind color patterns
  const tailwindPatterns = [
    /^bg-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^text-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
    /^border-(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone)-\d+$/,
  ];
  
  return tailwindPatterns.some(pattern => pattern.test(color));
}

/**
 * Brand-aware Design Guardian utilities
 */
export const BrandAwareDesignGuardian = {
  /**
   * Validate component against brand configuration
   */
  validateComponent(componentPath: string, context: BrandValidationContext): {
    isValid: boolean;
    violations: string[];
  } {
    const violations: string[] = [];
    
    // This would be expanded to actually parse the component file
    // and check for brand violations
    
    return {
      isValid: violations.length === 0,
      violations,
    };
  },
  
  /**
   * Get brand-aware ESLint configuration
   */
  getBrandAwareESLintConfig(context: BrandValidationContext) {
    return {
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'Literal[value=/^#[0-9a-fA-F]{6}$/]',
            message: `Raw hex colors are not allowed. Use brand colors: ${context.brandColors.join(', ')} or Tailwind classes.`,
          },
        ],
      },
    };
  },
  
  /**
   * Generate brand-aware validation report
   */
  generateValidationReport(context: BrandValidationContext): {
    brandConfig: DynamicBrandConfig;
    validationRules: BrandValidationRules;
    recommendations: string[];
  } {
    const recommendations: string[] = [];
    
    // Add recommendations based on brand configuration
    if (!context.brandConfig.isCustom) {
      recommendations.push('Consider using a custom brand configuration for better brand consistency');
    }
    
    if (context.brandColors.length < 5) {
      recommendations.push('Consider expanding the brand color palette for more design flexibility');
    }
    
    return {
      brandConfig: context.brandConfig,
      validationRules: context.validationRules,
      recommendations,
    };
  },
};
