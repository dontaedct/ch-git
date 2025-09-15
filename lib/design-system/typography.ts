/**
 * @fileoverview HT-008.5.5: Systematic Spacing and Typography Scales
 * @module lib/design-system/typography
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.5 - Create systematic spacing and typography scales
 * Focus: Vercel/Apply-level typography system with systematic spacing
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and readability)
 */

// HT-008.5.5: Enhanced Typography and Spacing System
// Comprehensive typography scales following Vercel/Apply design principles

/**
 * Typography Scale Interface
 */
export interface TypographyScale {
  fontSize: string;
  lineHeight: string;
  letterSpacing: string;
  fontWeight: string;
  fontFamily?: string;
}

/**
 * Spacing Scale Interface
 */
export interface SpacingScale {
  value: string;
  rem: string;
  px: number;
  usage: string;
}

/**
 * Typography Scale Definitions
 * Following Apple/Linear/Vercel design principles
 */
export const TYPOGRAPHY_SCALE = {
  // Display Styles - For hero sections and major headings
  'display-2xl': {
    fontSize: '4.5rem',      // 72px
    lineHeight: '1',         // 72px
    letterSpacing: '-0.02em',
    fontWeight: '800',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  },
  'display-xl': {
    fontSize: '3.75rem',     // 60px
    lineHeight: '1',         // 60px
    letterSpacing: '-0.02em',
    fontWeight: '700',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  },
  'display-lg': {
    fontSize: '3rem',        // 48px
    lineHeight: '1.1',       // 52.8px
    letterSpacing: '-0.02em',
    fontWeight: '700',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  },
  'display-md': {
    fontSize: '2.25rem',     // 36px
    lineHeight: '1.2',       // 43.2px
    letterSpacing: '-0.01em',
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  },
  'display-sm': {
    fontSize: '1.875rem',    // 30px
    lineHeight: '1.3',       // 48.75px
    letterSpacing: '-0.01em',
    fontWeight: '600',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  },

  // Heading Styles - For section headings and titles
  'heading-xl': {
    fontSize: '1.875rem',    // 30px
    lineHeight: '1.3',       // 39px
    letterSpacing: '-0.01em',
    fontWeight: '600',
  },
  'heading-lg': {
    fontSize: '1.5rem',       // 24px
    lineHeight: '1.4',        // 33.6px
    letterSpacing: '-0.01em',
    fontWeight: '600',
  },
  'heading-md': {
    fontSize: '1.25rem',      // 20px
    lineHeight: '1.4',        // 28px
    letterSpacing: '0',
    fontWeight: '600',
  },
  'heading-sm': {
    fontSize: '1.125rem',     // 18px
    lineHeight: '1.4',        // 25.2px
    letterSpacing: '0',
    fontWeight: '600',
  },
  'heading-xs': {
    fontSize: '1rem',         // 16px
    lineHeight: '1.5',        // 24px
    letterSpacing: '0',
    fontWeight: '600',
  },

  // Body Text Styles - For content and readable text
  'body-xl': {
    fontSize: '1.25rem',      // 20px
    lineHeight: '1.6',        // 32px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'body-lg': {
    fontSize: '1.125rem',     // 18px
    lineHeight: '1.6',        // 28.8px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'body-md': {
    fontSize: '1rem',         // 16px
    lineHeight: '1.6',        // 25.6px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'body-sm': {
    fontSize: '0.875rem',    // 14px
    lineHeight: '1.6',        // 22.4px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'body-xs': {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.6',        // 19.2px
    letterSpacing: '0',
    fontWeight: '400',
  },

  // Label Styles - For UI elements and form labels
  'label-lg': {
    fontSize: '1rem',         // 16px
    lineHeight: '1.4',        // 22.4px
    letterSpacing: '0.01em',
    fontWeight: '500',
  },
  'label-md': {
    fontSize: '0.875rem',     // 14px
    lineHeight: '1.4',        // 19.6px
    letterSpacing: '0.01em',
    fontWeight: '500',
  },
  'label-sm': {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.4',        // 16.8px
    letterSpacing: '0.01em',
    fontWeight: '500',
  },
  'label-xs': {
    fontSize: '0.6875rem',    // 11px
    lineHeight: '1.4',        // 15.4px
    letterSpacing: '0.01em',
    fontWeight: '500',
  },

  // Caption Styles - For metadata and secondary text
  'caption-lg': {
    fontSize: '0.875rem',     // 14px
    lineHeight: '1.5',        // 21px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'caption-md': {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.5',         // 18px
    letterSpacing: '0',
    fontWeight: '400',
  },
  'caption-sm': {
    fontSize: '0.6875rem',    // 11px
    lineHeight: '1.5',         // 16.5px
    letterSpacing: '0',
    fontWeight: '400',
  },

  // Code Styles - For monospace text
  'code-lg': {
    fontSize: '0.875rem',     // 14px
    lineHeight: '1.5',         // 21px
    letterSpacing: '0',
    fontWeight: '400',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  'code-md': {
    fontSize: '0.8125rem',   // 13px
    lineHeight: '1.5',        // 19.5px
    letterSpacing: '0',
    fontWeight: '400',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
  'code-sm': {
    fontSize: '0.75rem',      // 12px
    lineHeight: '1.5',        // 18px
    letterSpacing: '0',
    fontWeight: '400',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
} as const;

/**
 * Spacing Scale Definitions
 * Based on 8px grid system with systematic progression
 */
export const SPACING_SCALE = {
  // Micro spacing - For fine adjustments
  '0': { value: '0', rem: '0rem', px: 0, usage: 'Reset spacing' },
  'px': { value: '1px', rem: '0.0625rem', px: 1, usage: 'Border widths, fine lines' },
  '0.5': { value: '0.125rem', rem: '0.125rem', px: 2, usage: 'Tiny gaps, icon padding' },
  '1': { value: '0.25rem', rem: '0.25rem', px: 4, usage: 'Minimal spacing' },
  '1.5': { value: '0.375rem', rem: '0.375rem', px: 6, usage: 'Small gaps' },
  '2': { value: '0.5rem', rem: '0.5rem', px: 8, usage: 'Base unit spacing' },
  '2.5': { value: '0.625rem', rem: '0.625rem', px: 10, usage: 'Small component spacing' },
  '3': { value: '0.75rem', rem: '0.75rem', px: 12, usage: 'Component padding' },
  '3.5': { value: '0.875rem', rem: '0.875rem', px: 14, usage: 'Medium component spacing' },
  '4': { value: '1rem', rem: '1rem', px: 16, usage: 'Standard spacing' },
  '5': { value: '1.25rem', rem: '1.25rem', px: 20, usage: 'Large component spacing' },
  '6': { value: '1.5rem', rem: '1.5rem', px: 24, usage: 'Section spacing' },
  '7': { value: '1.75rem', rem: '1.75rem', px: 28, usage: 'Large section spacing' },
  '8': { value: '2rem', rem: '2rem', px: 32, usage: 'Major spacing' },
  '9': { value: '2.25rem', rem: '2.25rem', px: 36, usage: 'Extra large spacing' },
  '10': { value: '2.5rem', rem: '2.5rem', px: 40, usage: 'Container padding' },
  '11': { value: '2.75rem', rem: '2.75rem', px: 44, usage: 'Large container spacing' },
  '12': { value: '3rem', rem: '3rem', px: 48, usage: 'Section padding' },
  '14': { value: '3.5rem', rem: '3.5rem', px: 56, usage: 'Large section padding' },
  '16': { value: '4rem', rem: '4rem', px: 64, usage: 'Major section spacing' },
  '20': { value: '5rem', rem: '5rem', px: 80, usage: 'Page section spacing' },
  '24': { value: '6rem', rem: '6rem', px: 96, usage: 'Hero section spacing' },
  '28': { value: '7rem', rem: '7rem', px: 112, usage: 'Large hero spacing' },
  '32': { value: '8rem', rem: '8rem', px: 128, usage: 'Extra large spacing' },
  '36': { value: '9rem', rem: '9rem', px: 144, usage: 'Massive spacing' },
  '40': { value: '10rem', rem: '10rem', px: 160, usage: 'Maximum spacing' },
  '44': { value: '11rem', rem: '11rem', px: 176, usage: 'Ultra large spacing' },
  '48': { value: '12rem', rem: '12rem', px: 192, usage: 'Maximum container spacing' },
  '52': { value: '13rem', rem: '13rem', px: 208, usage: 'Extra maximum spacing' },
  '56': { value: '14rem', rem: '14rem', px: 224, usage: 'Ultra maximum spacing' },
  '60': { value: '15rem', rem: '15rem', px: 240, usage: 'Super maximum spacing' },
  '64': { value: '16rem', rem: '16rem', px: 256, usage: 'Ultimate spacing' },
  '72': { value: '18rem', rem: '18rem', px: 288, usage: 'Hero spacing' },
  '80': { value: '20rem', rem: '20rem', px: 320, usage: 'Massive hero spacing' },
  '96': { value: '24rem', rem: '24rem', px: 384, usage: 'Ultimate hero spacing' },
} as const;

/**
 * Font Weight Scale
 */
export const FONT_WEIGHT_SCALE = {
  'thin': '100',
  'extralight': '200',
  'light': '300',
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700',
  'extrabold': '800',
  'black': '900',
} as const;

/**
 * Letter Spacing Scale
 */
export const LETTER_SPACING_SCALE = {
  'tighter': '-0.05em',
  'tight': '-0.025em',
  'normal': '0em',
  'wide': '0.025em',
  'wider': '0.05em',
  'widest': '0.1em',
} as const;

/**
 * Line Height Scale
 */
export const LINE_HEIGHT_SCALE = {
  'none': '1',
  'tight': '1.25',
  'snug': '1.375',
  'normal': '1.5',
  'relaxed': '1.625',
  'loose': '2',
} as const;

/**
 * Font Family Definitions
 */
export const FONT_FAMILIES = {
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'sans-serif'
  ],
  serif: [
    'ui-serif',
    'Georgia',
    'Cambria',
    '"Times New Roman"',
    'Times',
    'serif'
  ],
  mono: [
    'ui-monospace',
    'SFMono-Regular',
    'Menlo',
    'Monaco',
    'Consolas',
    '"Liberation Mono"',
    '"Courier New"',
    'monospace'
  ],
  display: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"SF Pro Display"',
    '"Segoe UI"',
    'Roboto',
    'sans-serif'
  ],
} as const;

/**
 * Typography Utility Functions
 */
export class TypographyUtils {
  /**
   * Get typography scale value
   */
  static getScale(scale: keyof typeof TYPOGRAPHY_SCALE): TypographyScale {
    return TYPOGRAPHY_SCALE[scale];
  }

  /**
   * Get spacing scale value
   */
  static getSpacing(scale: keyof typeof SPACING_SCALE): SpacingScale {
    return SPACING_SCALE[scale];
  }

  /**
   * Generate CSS custom properties for typography
   */
  static generateCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};

    // Typography variables
    Object.entries(TYPOGRAPHY_SCALE).forEach(([key, value]) => {
      const typographyValue = value as TypographyScale;
      variables[`--font-size-${key}`] = typographyValue.fontSize;
      variables[`--line-height-${key}`] = typographyValue.lineHeight;
      variables[`--letter-spacing-${key}`] = typographyValue.letterSpacing;
      variables[`--font-weight-${key}`] = typographyValue.fontWeight;
      if (typographyValue.fontFamily) {
        variables[`--font-family-${key}`] = typographyValue.fontFamily;
      }
    });

    // Spacing variables
    Object.entries(SPACING_SCALE).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value.value;
    });

    // Font weight variables
    Object.entries(FONT_WEIGHT_SCALE).forEach(([key, value]) => {
      variables[`--font-weight-${key}`] = value;
    });

    // Letter spacing variables
    Object.entries(LETTER_SPACING_SCALE).forEach(([key, value]) => {
      variables[`--letter-spacing-${key}`] = value;
    });

    // Line height variables
    Object.entries(LINE_HEIGHT_SCALE).forEach(([key, value]) => {
      variables[`--line-height-${key}`] = value;
    });

    // Font family variables
    Object.entries(FONT_FAMILIES).forEach(([key, value]) => {
      variables[`--font-family-${key}`] = value.join(', ');
    });

    return variables;
  }

  /**
   * Generate Tailwind CSS classes for typography
   */
  static generateTailwindClasses(): Record<string, string> {
    const classes: Record<string, string> = {};

    // Typography classes
    Object.entries(TYPOGRAPHY_SCALE).forEach(([key, value]) => {
      const typographyValue = value as TypographyScale;
      const fontSize = typographyValue.fontSize.replace('rem', '');
      const lineHeight = typographyValue.lineHeight;
      const letterSpacing = typographyValue.letterSpacing;
      const fontWeight = typographyValue.fontWeight;

      classes[`.text-${key}`] = `
        font-size: ${typographyValue.fontSize};
        line-height: ${lineHeight};
        letter-spacing: ${letterSpacing};
        font-weight: ${fontWeight};
        ${typographyValue.fontFamily ? `font-family: ${typographyValue.fontFamily};` : ''}
      `;
    });

    return classes;
  }

  /**
   * Calculate optimal line height for given font size
   */
  static calculateOptimalLineHeight(fontSize: number): number {
    // Golden ratio-based calculation for optimal readability
    const baseLineHeight = fontSize * 1.618;
    return Math.round(baseLineHeight * 100) / 100;
  }

  /**
   * Calculate optimal letter spacing for given font size
   */
  static calculateOptimalLetterSpacing(fontSize: number): string {
    // Negative letter spacing for larger fonts, positive for smaller
    if (fontSize >= 24) return '-0.02em';
    if (fontSize >= 18) return '-0.01em';
    if (fontSize >= 14) return '0em';
    return '0.01em';
  }

  /**
   * Generate responsive typography scale
   */
  static generateResponsiveScale(
    baseScale: keyof typeof TYPOGRAPHY_SCALE,
    breakpoints: Record<string, keyof typeof TYPOGRAPHY_SCALE>
  ): Record<string, TypographyScale> {
    const responsive: Record<string, TypographyScale> = {
      base: TYPOGRAPHY_SCALE[baseScale],
    };

    Object.entries(breakpoints).forEach(([breakpoint, scale]) => {
      responsive[breakpoint] = TYPOGRAPHY_SCALE[scale];
    });

    return responsive;
  }

  /**
   * Validate typography scale consistency
   */
  static validateScale(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for consistent progression
    const fontSizeValues = Object.values(TYPOGRAPHY_SCALE).map(scale => 
      parseFloat(scale.fontSize.replace('rem', ''))
    );

    // Check for proper hierarchy
    for (let i = 1; i < fontSizeValues.length; i++) {
      if (fontSizeValues[i] > fontSizeValues[i - 1]) {
        errors.push(`Font size progression issue: ${fontSizeValues[i]} > ${fontSizeValues[i - 1]}`);
      }
    }

    // Check line height ratios
    Object.entries(TYPOGRAPHY_SCALE).forEach(([key, scale]) => {
      const fontSize = parseFloat(scale.fontSize.replace('rem', ''));
      const lineHeight = parseFloat(scale.lineHeight);
      const ratio = lineHeight / fontSize;

      if (ratio < 1.2 || ratio > 2.0) {
        errors.push(`Line height ratio issue for ${key}: ${ratio} (should be between 1.2 and 2.0)`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Spacing Utility Functions
 */
export class SpacingUtils {
  /**
   * Get spacing value by key
   */
  static getSpacing(key: keyof typeof SPACING_SCALE): SpacingScale {
    return SPACING_SCALE[key];
  }

  /**
   * Convert spacing to different units
   */
  static convertSpacing(value: string, toUnit: 'px' | 'rem' | 'em'): string {
    const spacing = Object.values(SPACING_SCALE).find(s => s.value === value);
    if (!spacing) return value;

    switch (toUnit) {
      case 'px':
        return `${spacing.px}px`;
      case 'rem':
        return spacing.rem;
      case 'em':
        return `${spacing.px / 16}em`;
      default:
        return value;
    }
  }

  /**
   * Generate spacing scale CSS variables
   */
  static generateCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};

    Object.entries(SPACING_SCALE).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value.value;
    });

    return variables;
  }

  /**
   * Calculate spacing progression
   */
  static calculateProgression(baseValue: number, ratio: number, steps: number): number[] {
    const progression: number[] = [baseValue];
    
    for (let i = 1; i < steps; i++) {
      progression.push(Math.round(baseValue * Math.pow(ratio, i) * 100) / 100);
    }
    
    return progression;
  }

  /**
   * Generate responsive spacing
   */
  static generateResponsiveSpacing(
    baseSpacing: keyof typeof SPACING_SCALE,
    breakpoints: Record<string, keyof typeof SPACING_SCALE>
  ): Record<string, SpacingScale> {
    const responsive: Record<string, SpacingScale> = {
      base: SPACING_SCALE[baseSpacing],
    };

    Object.entries(breakpoints).forEach(([breakpoint, spacing]) => {
      responsive[breakpoint] = SPACING_SCALE[spacing];
    });

    return responsive;
  }
}

/**
 * Typography Scale Types
 */
export type TypographyScaleKey = keyof typeof TYPOGRAPHY_SCALE;
export type SpacingScaleKey = keyof typeof SPACING_SCALE;
export type FontWeightKey = keyof typeof FONT_WEIGHT_SCALE;
export type LetterSpacingKey = keyof typeof LETTER_SPACING_SCALE;
export type LineHeightKey = keyof typeof LINE_HEIGHT_SCALE;
export type FontFamilyKey = keyof typeof FONT_FAMILIES;

export default {
  TYPOGRAPHY_SCALE,
  SPACING_SCALE,
  FONT_WEIGHT_SCALE,
  LETTER_SPACING_SCALE,
  LINE_HEIGHT_SCALE,
  FONT_FAMILIES,
  TypographyUtils,
  SpacingUtils,
};
