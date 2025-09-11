/**
 * @fileoverview HT-011.1.1: Multi-Brand Color System Generator (Fixed)
 * @module lib/design-tokens/multi-brand-generator
 * @author OSS Hero System
 * @version 1.1.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.1 - Expand Color System for Full Brand Customization
 * Focus: Transform mono-theme into comprehensive multi-brand color system
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

import { ColorScale, SemanticColors } from './generator';

/**
 * Brand color palette configuration
 */
export interface BrandPalette {
  /** Primary brand color (hex) */
  primary: string;
  /** Secondary brand color (hex) - optional */
  secondary?: string;
  /** Tertiary brand color (hex) - optional */
  tertiary?: string;
  /** Custom color scales - optional */
  custom?: {
    [key: string]: ColorScale;
  };
  /** Brand name for identification */
  name: string;
  /** Brand description */
  description?: string;
}

/**
 * Multi-brand color system configuration
 */
export interface MultiBrandConfig {
  /** Default brand palette */
  defaultBrand: BrandPalette;
  /** Available brand palettes */
  brands: BrandPalette[];
  /** Current active brand */
  activeBrand: string;
  /** Enable automatic dark/light variants */
  autoVariants: boolean;
  /** Custom neutral scale override */
  customNeutral?: ColorScale;
}

/**
 * Generate a complete color scale from a single base color
 * Uses a simplified approach for better reliability
 */
export function generateColorScaleFromBase(baseColor: string): ColorScale {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${Math.round(Math.max(0, Math.min(255, r))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, g))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, b))).toString(16).padStart(2, '0')}`;
  };
  
  const { r, g, b } = hexToRgb(baseColor);
  
  // Generate 11-step scale (50-950) by adjusting lightness
  const lightnessMultipliers = [0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];
  
  const scale: ColorScale = {
    50: rgbToHex(r + (255 - r) * 0.95, g + (255 - g) * 0.95, b + (255 - b) * 0.95),
    100: rgbToHex(r + (255 - r) * 0.9, g + (255 - g) * 0.9, b + (255 - b) * 0.9),
    200: rgbToHex(r + (255 - r) * 0.8, g + (255 - g) * 0.8, b + (255 - b) * 0.8),
    300: rgbToHex(r + (255 - r) * 0.7, g + (255 - g) * 0.7, b + (255 - b) * 0.7),
    400: rgbToHex(r + (255 - r) * 0.6, g + (255 - g) * 0.6, b + (255 - b) * 0.6),
    500: rgbToHex(r, g, b), // Base color
    600: rgbToHex(r * 0.8, g * 0.8, b * 0.8),
    700: rgbToHex(r * 0.6, g * 0.6, b * 0.6),
    800: rgbToHex(r * 0.4, g * 0.4, b * 0.4),
    900: rgbToHex(r * 0.2, g * 0.2, b * 0.2),
    950: rgbToHex(r * 0.1, g * 0.1, b * 0.1),
  };
  
  return scale;
}

/**
 * Generate complementary color scale for secondary colors
 */
export function generateComplementaryScale(baseColor: string): ColorScale {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  // Convert RGB to hex
  const rgbToHex = (r: number, g: number, b: number) => {
    return `#${Math.round(Math.max(0, Math.min(255, r))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, g))).toString(16).padStart(2, '0')}${Math.round(Math.max(0, Math.min(255, b))).toString(16).padStart(2, '0')}`;
  };
  
  const { r, g, b } = hexToRgb(baseColor);
  
  // Generate complementary color (simple approach: invert RGB)
  const complementaryR = 255 - r;
  const complementaryG = 255 - g;
  const complementaryB = 255 - b;
  
  // Generate 11-step scale using complementary color
  const scale: ColorScale = {
    50: rgbToHex(complementaryR + (255 - complementaryR) * 0.95, complementaryG + (255 - complementaryG) * 0.95, complementaryB + (255 - complementaryB) * 0.95),
    100: rgbToHex(complementaryR + (255 - complementaryR) * 0.9, complementaryG + (255 - complementaryG) * 0.9, complementaryB + (255 - complementaryB) * 0.9),
    200: rgbToHex(complementaryR + (255 - complementaryR) * 0.8, complementaryG + (255 - complementaryG) * 0.8, complementaryB + (255 - complementaryB) * 0.8),
    300: rgbToHex(complementaryR + (255 - complementaryR) * 0.7, complementaryG + (255 - complementaryG) * 0.7, complementaryB + (255 - complementaryB) * 0.7),
    400: rgbToHex(complementaryR + (255 - complementaryR) * 0.6, complementaryG + (255 - complementaryG) * 0.6, complementaryB + (255 - complementaryB) * 0.6),
    500: rgbToHex(complementaryR, complementaryG, complementaryB), // Base complementary color
    600: rgbToHex(complementaryR * 0.8, complementaryG * 0.8, complementaryB * 0.8),
    700: rgbToHex(complementaryR * 0.6, complementaryG * 0.6, complementaryB * 0.6),
    800: rgbToHex(complementaryR * 0.4, complementaryG * 0.4, complementaryB * 0.4),
    900: rgbToHex(complementaryR * 0.2, complementaryG * 0.2, complementaryB * 0.2),
    950: rgbToHex(complementaryR * 0.1, complementaryG * 0.1, complementaryB * 0.1),
  };
  
  return scale;
}

/**
 * Generate semantic colors for a specific brand palette
 */
export function generateBrandSemanticColors(
  brandPalette: BrandPalette,
  isDark: boolean = false
): SemanticColors {
  const primaryScale = generateColorScaleFromBase(brandPalette.primary);
  const secondaryScale = brandPalette.secondary 
    ? generateColorScaleFromBase(brandPalette.secondary)
    : generateComplementaryScale(brandPalette.primary);
  
  // Default neutral scale (can be overridden)
  const neutralScale: ColorScale = {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  };
  
  if (isDark) {
    return {
      // Primary brand colors
      primary: primaryScale[500],
      primaryForeground: neutralScale[950],
      primaryHover: primaryScale[400],
      primaryActive: primaryScale[300],
      primaryDisabled: neutralScale[700],
      
      // Secondary colors
      secondary: neutralScale[800],
      secondaryForeground: neutralScale[100],
      secondaryHover: neutralScale[700],
      secondaryActive: neutralScale[600],
      secondaryDisabled: neutralScale[800],
      
      // Background system
      background: neutralScale[950],
      backgroundSecondary: neutralScale[900],
      backgroundTertiary: neutralScale[800],
      backgroundElevated: neutralScale[900],
      backgroundOverlay: 'rgba(0, 0, 0, 0.8)',
      
      // Foreground system
      foreground: neutralScale[50],
      foregroundSecondary: neutralScale[300],
      foregroundTertiary: neutralScale[400],
      foregroundDisabled: neutralScale[600],
      foregroundInverse: neutralScale[950],
      
      // Surface system
      surface: neutralScale[900],
      surfaceSecondary: neutralScale[800],
      surfaceTertiary: neutralScale[700],
      surfaceElevated: neutralScale[800],
      surfaceOverlay: 'rgba(0, 0, 0, 0.95)',
      
      // Muted system
      muted: neutralScale[800],
      mutedForeground: neutralScale[400],
      mutedHover: neutralScale[700],
      mutedActive: neutralScale[600],
      
      // Accent system (using secondary scale)
      accent: secondaryScale[900],
      accentForeground: secondaryScale[100],
      accentHover: secondaryScale[800],
      accentActive: secondaryScale[700],
      
      // Border system
      border: neutralScale[800],
      borderSecondary: neutralScale[700],
      borderTertiary: neutralScale[600],
      borderFocus: primaryScale[500],
      borderError: '#f87171',
      borderSuccess: '#4ade80',
      borderWarning: '#fbbf24',
      
      // Input system
      input: neutralScale[800],
      inputBackground: neutralScale[900],
      inputBorder: neutralScale[800],
      inputFocus: primaryScale[500],
      inputError: '#f87171',
      inputDisabled: neutralScale[800],
      
      // Ring system (focus indicators)
      ring: primaryScale[500],
      ringOffset: neutralScale[950],
      ringFocus: primaryScale[500],
      ringError: '#f87171',
      ringSuccess: '#4ade80',
      ringWarning: '#fbbf24',
      
      // Status colors
      destructive: '#f87171',
      destructiveForeground: neutralScale[950],
      destructiveHover: '#fca5a5',
      destructiveActive: '#fecaca',
      
      success: '#4ade80',
      successForeground: neutralScale[950],
      successHover: '#86efac',
      successActive: '#bbf7d0',
      
      warning: '#fbbf24',
      warningForeground: neutralScale[950],
      warningHover: '#fcd34d',
      warningActive: '#fde68a',
      
      info: primaryScale[400],
      infoForeground: neutralScale[950],
      infoHover: primaryScale[300],
      infoActive: primaryScale[200],
      
      // Chart colors (for data visualization)
      chart: {
        primary: primaryScale[400],
        secondary: secondaryScale[600],
        tertiary: primaryScale[200],
        quaternary: neutralScale[500],
        quinary: neutralScale[300],
      },
      
      // Interactive states
      interactive: {
        hover: neutralScale[800],
        active: neutralScale[700],
        disabled: neutralScale[800],
        focus: primaryScale[900],
        selected: primaryScale[900],
      },
    };
  } else {
    return {
      // Primary brand colors
      primary: primaryScale[600],
      primaryForeground: '#ffffff',
      primaryHover: primaryScale[700],
      primaryActive: primaryScale[800],
      primaryDisabled: neutralScale[300],
      
      // Secondary colors
      secondary: neutralScale[100],
      secondaryForeground: neutralScale[900],
      secondaryHover: neutralScale[200],
      secondaryActive: neutralScale[300],
      secondaryDisabled: neutralScale[200],
      
      // Background system
      background: '#ffffff',
      backgroundSecondary: neutralScale[50],
      backgroundTertiary: neutralScale[100],
      backgroundElevated: '#ffffff',
      backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
      
      // Foreground system
      foreground: neutralScale[950],
      foregroundSecondary: neutralScale[700],
      foregroundTertiary: neutralScale[500],
      foregroundDisabled: neutralScale[400],
      foregroundInverse: '#ffffff',
      
      // Surface system
      surface: '#ffffff',
      surfaceSecondary: neutralScale[50],
      surfaceTertiary: neutralScale[100],
      surfaceElevated: '#ffffff',
      surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
      
      // Muted system
      muted: neutralScale[100],
      mutedForeground: neutralScale[600],
      mutedHover: neutralScale[200],
      mutedActive: neutralScale[300],
      
      // Accent system (using secondary scale)
      accent: secondaryScale[100],
      accentForeground: secondaryScale[900],
      accentHover: secondaryScale[200],
      accentActive: secondaryScale[300],
      
      // Border system
      border: neutralScale[200],
      borderSecondary: neutralScale[300],
      borderTertiary: neutralScale[400],
      borderFocus: primaryScale[500],
      borderError: '#ef4444',
      borderSuccess: '#22c55e',
      borderWarning: '#f59e0b',
      
      // Input system
      input: neutralScale[200],
      inputBackground: '#ffffff',
      inputBorder: neutralScale[200],
      inputFocus: primaryScale[500],
      inputError: '#ef4444',
      inputDisabled: neutralScale[100],
      
      // Ring system (focus indicators)
      ring: primaryScale[500],
      ringOffset: '#ffffff',
      ringFocus: primaryScale[500],
      ringError: '#ef4444',
      ringSuccess: '#22c55e',
      ringWarning: '#f59e0b',
      
      // Status colors
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      destructiveHover: '#dc2626',
      destructiveActive: '#b91c1c',
      
      success: '#22c55e',
      successForeground: '#ffffff',
      successHover: '#16a34a',
      successActive: '#15803d',
      
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      warningHover: '#d97706',
      warningActive: '#b45309',
      
      info: primaryScale[500],
      infoForeground: '#ffffff',
      infoHover: primaryScale[600],
      infoActive: primaryScale[700],
      
      // Chart colors (for data visualization)
      chart: {
        primary: primaryScale[500],
        secondary: secondaryScale[300],
        tertiary: primaryScale[700],
        quaternary: neutralScale[400],
        quinary: neutralScale[600],
      },
      
      // Interactive states
      interactive: {
        hover: neutralScale[100],
        active: neutralScale[200],
        disabled: neutralScale[100],
        focus: primaryScale[100],
        selected: primaryScale[100],
      },
    };
  }
}

/**
 * Default brand palettes for common industries
 */
export const DEFAULT_BRAND_PALETTES: BrandPalette[] = [
  {
    name: 'Default Blue',
    description: 'Professional blue theme',
    primary: '#3b82f6',
  },
  {
    name: 'Tech Green',
    description: 'Modern tech green theme',
    primary: '#10b981',
    secondary: '#059669',
  },
  {
    name: 'Corporate Purple',
    description: 'Corporate purple theme',
    primary: '#8b5cf6',
    secondary: '#7c3aed',
  },
  {
    name: 'Startup Orange',
    description: 'Energetic startup orange theme',
    primary: '#f59e0b',
    secondary: '#d97706',
  },
  {
    name: 'Finance Navy',
    description: 'Professional finance navy theme',
    primary: '#1e40af',
    secondary: '#1e3a8a',
  },
  {
    name: 'Healthcare Teal',
    description: 'Healthcare teal theme',
    primary: '#14b8a6',
    secondary: '#0d9488',
  },
  {
    name: 'Creative Pink',
    description: 'Creative pink theme',
    primary: '#ec4899',
    secondary: '#db2777',
  },
  {
    name: 'Minimal Gray',
    description: 'Minimal gray theme',
    primary: '#6b7280',
    secondary: '#4b5563',
  },
];

/**
 * Create multi-brand configuration
 */
export function createMultiBrandConfig(
  activeBrand: string = 'Default Blue',
  customBrands: BrandPalette[] = []
): MultiBrandConfig {
  const allBrands = [...DEFAULT_BRAND_PALETTES, ...customBrands];
  const defaultBrand = allBrands.find(b => b.name === activeBrand) || DEFAULT_BRAND_PALETTES[0];
  
  return {
    defaultBrand,
    brands: allBrands,
    activeBrand,
    autoVariants: true,
  };
}

/**
 * Validate brand palette for accessibility and usability
 */
export function validateBrandPalette(brandPalette: BrandPalette): {
  isValid: boolean;
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Validate primary color format
  if (!/^#[0-9A-Fa-f]{6}$/.test(brandPalette.primary)) {
    errors.push('Primary color must be a valid hex color (e.g., #3b82f6)');
  }
  
  // Validate secondary color format if provided
  if (brandPalette.secondary && !/^#[0-9A-Fa-f]{6}$/.test(brandPalette.secondary)) {
    errors.push('Secondary color must be a valid hex color (e.g., #059669)');
  }
  
  // Validate tertiary color format if provided
  if (brandPalette.tertiary && !/^#[0-9A-Fa-f]{6}$/.test(brandPalette.tertiary)) {
    errors.push('Tertiary color must be a valid hex color (e.g., #7c3aed)');
  }
  
  // Check for sufficient contrast (basic check)
  const primaryScale = generateColorScaleFromBase(brandPalette.primary);
  const lightContrast = getContrastRatio(primaryScale[600], '#ffffff');
  const darkContrast = getContrastRatio(primaryScale[500], '#000000');
  
  if (lightContrast < 4.5) {
    warnings.push('Primary color may not have sufficient contrast on light backgrounds');
  }
  
  if (darkContrast < 4.5) {
    warnings.push('Primary color may not have sufficient contrast on dark backgrounds');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}
