/**
 * @fileoverview HT-011.1.2: Custom Typography System Generator
 * @module lib/design-tokens/typography-generator
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.2 - Implement Custom Typography System
 * Focus: Create flexible typography system supporting custom client fonts
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

export interface FontFamily {
  name: string;
  displayName: string;
  fallbacks: string[];
  weights: number[];
  styles: ('normal' | 'italic')[];
  source: 'google' | 'local' | 'custom';
  url?: string;
  description?: string;
}

export interface TypographyScale {
  xs: string;
  sm: string;
  base: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
  '5xl': string;
  '6xl': string;
}

export interface TypographyWeights {
  thin: string;
  light: string;
  normal: string;
  medium: string;
  semibold: string;
  bold: string;
  extrabold: string;
  black: string;
}

export interface TypographyConfig {
  fontFamily: FontFamily;
  scale: TypographyScale;
  weights: TypographyWeights;
  lineHeights: {
    none: string;
    tight: string;
    snug: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface MultiTypographyConfig {
  activeFont: string;
  availableFonts: FontFamily[];
  defaultFont: FontFamily;
  customFonts: FontFamily[];
}

/**
 * Default font families with comprehensive fallbacks
 */
export const DEFAULT_FONT_FAMILIES: FontFamily[] = [
  {
    name: 'inter',
    displayName: 'Inter',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Modern, highly readable sans-serif font'
  },
  {
    name: 'geist',
    displayName: 'Geist',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Clean, geometric sans-serif font'
  },
  {
    name: 'sf-pro-display',
    displayName: 'SF Pro Display',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'local',
    description: 'Apple\'s premium display font'
  },
  {
    name: 'roboto',
    displayName: 'Roboto',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    weights: [300, 400, 500, 700],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Google\'s versatile sans-serif font'
  },
  {
    name: 'open-sans',
    displayName: 'Open Sans',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Humanist sans-serif font'
  },
  {
    name: 'lato',
    displayName: 'Lato',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    weights: [300, 400, 700],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Semi-rounded sans-serif font'
  },
  {
    name: 'montserrat',
    displayName: 'Montserrat',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Geometric sans-serif font'
  },
  {
    name: 'poppins',
    displayName: 'Poppins',
    fallbacks: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    source: 'google',
    description: 'Geometric sans-serif font with rounded features'
  }
];

/**
 * Generate typography scale based on font characteristics
 */
export function generateTypographyScale(fontFamily: FontFamily): TypographyScale {
  // Adjust scale based on font characteristics
  const isDisplayFont = fontFamily.name.includes('display') || fontFamily.name === 'sf-pro-display';
  const isGeometricFont = ['geist', 'montserrat', 'poppins'].includes(fontFamily.name);
  
  if (isDisplayFont) {
    // Display fonts can handle larger sizes better
    return {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    };
  } else if (isGeometricFont) {
    // Geometric fonts work well with slightly larger sizes
    return {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    };
  } else {
    // Standard scale for most fonts
    return {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
    };
  }
}

/**
 * Generate font weights based on available weights
 */
export function generateTypographyWeights(fontFamily: FontFamily): TypographyWeights {
  const availableWeights = fontFamily.weights;
  
  return {
    thin: availableWeights.includes(100) ? '100' : '300',
    light: availableWeights.includes(300) ? '300' : '400',
    normal: availableWeights.includes(400) ? '400' : '500',
    medium: availableWeights.includes(500) ? '500' : '600',
    semibold: availableWeights.includes(600) ? '600' : '700',
    bold: availableWeights.includes(700) ? '700' : '800',
    extrabold: availableWeights.includes(800) ? '800' : '900',
    black: availableWeights.includes(900) ? '900' : '800',
  };
}

/**
 * Generate complete typography configuration for a font family
 */
export function generateTypographyConfig(fontFamily: FontFamily): TypographyConfig {
  return {
    fontFamily,
    scale: generateTypographyScale(fontFamily),
    weights: generateTypographyWeights(fontFamily),
    lineHeights: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  };
}

/**
 * Create multi-typography configuration
 */
export function createMultiTypographyConfig(
  activeFont?: string,
  customFonts?: FontFamily[]
): MultiTypographyConfig {
  const allFonts = [...DEFAULT_FONT_FAMILIES, ...(customFonts || [])];
  const defaultFont = DEFAULT_FONT_FAMILIES[0]; // Inter as default
  const activeFontName = activeFont || defaultFont.name;
  
  return {
    activeFont: activeFontName,
    availableFonts: allFonts,
    defaultFont,
    customFonts: customFonts || [],
  };
}

/**
 * Validate font family configuration
 */
export function validateFontFamily(fontFamily: FontFamily): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Required fields
  if (!fontFamily.name) errors.push('Font name is required');
  if (!fontFamily.displayName) errors.push('Display name is required');
  if (!fontFamily.fallbacks || fontFamily.fallbacks.length === 0) errors.push('Fallback fonts are required');
  if (!fontFamily.weights || fontFamily.weights.length === 0) errors.push('Font weights are required');
  if (!fontFamily.styles || fontFamily.styles.length === 0) errors.push('Font styles are required');
  
  // Validation checks
  if (fontFamily.weights && fontFamily.weights.some(w => w < 100 || w > 900)) {
    errors.push('Font weights must be between 100 and 900');
  }
  
  if (fontFamily.source === 'google' && !fontFamily.name) {
    warnings.push('Google fonts should have a valid font name');
  }
  
  if (fontFamily.source === 'custom' && !fontFamily.url) {
    warnings.push('Custom fonts should provide a URL');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate Google Fonts URL for font loading
 */
export function generateGoogleFontsUrl(fontFamilies: FontFamily[]): string {
  const googleFonts = fontFamilies.filter(font => font.source === 'google');
  
  if (googleFonts.length === 0) return '';
  
  const families = googleFonts.map(font => {
    const weights = font.weights.join(';');
    const styles = font.styles.includes('italic') ? 'ital,' : '';
    return `${font.name}:wght@${weights}${styles}`;
  });
  
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

/**
 * Generate CSS font-face declarations for custom fonts
 */
export function generateCustomFontFaces(fontFamilies: FontFamily[]): string {
  const customFonts = fontFamilies.filter(font => font.source === 'custom' && font.url);
  
  return customFonts.map(font => {
    const weights = font.weights.join(' ');
    const styles = font.styles.map(style => style === 'italic' ? 'italic' : 'normal').join(' ');
    
    return `
@font-face {
  font-family: '${font.displayName}';
  src: url('${font.url}');
  font-weight: ${weights};
  font-style: ${styles};
  font-display: swap;
}`;
  }).join('\n');
}
