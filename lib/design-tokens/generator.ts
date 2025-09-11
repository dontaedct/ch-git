/**
 * @fileoverview HT-011.1.2: Multi-Brand Design Token Generator with Typography
 * @module lib/design-tokens/generator
 * @author OSS Hero System
 * @version 3.1.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.2 - Implement Custom Typography System
 * Focus: Create flexible typography system supporting custom client fonts
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system foundation)
 */

import { 
  BrandPalette, 
  MultiBrandConfig, 
  generateBrandSemanticColors,
  createMultiBrandConfig,
  DEFAULT_BRAND_PALETTES,
  generateColorScaleFromBase,
  generateComplementaryScale
} from './multi-brand-generator';

import {
  FontFamily,
  TypographyConfig,
  MultiTypographyConfig,
  generateTypographyConfig,
  createMultiTypographyConfig,
  DEFAULT_FONT_FAMILIES,
  validateFontFamily
} from './typography-generator';

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface LayoutTokens {
  grid: {
    columns: number;
    maxWidth: string;
    gutter: string;
    margin: string;
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
  };
  container: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  spacing: {
    section: string;
    'section-sm': string;
    'section-lg': string;
    'section-xl': string;
  };
  grid: string;
  full: string;
}

export interface DesignTokens {
  // Multi-brand configuration
  multiBrand: MultiBrandConfig;
  
  // Multi-typography configuration
  multiTypography: MultiTypographyConfig;
  
  // Color scales (now dynamic based on active brand)
  neutral: ColorScale;
  primary: ColorScale;
  secondary: ColorScale;
  
  // Semantic colors (now dynamic based on active brand)
  colors: {
    light: SemanticColors;
    dark: SemanticColors;
  };
  
  // Typography system (now dynamic based on active font)
  typography: TypographyConfig;
  
  // Typography measure
  measure: {
    narrow: string;
    base: string;
    wide: string;
  };
  
  // Spacing
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    section: string;
    'section-sm': string;
    'section-lg': string;
    'section-xl': string;
  };
  
  // Border system
  borders: {
    width: {
      none: string;
      hairline: string;
      thin: string;
      thick: string;
    };
    color: {
      light: {
        hairline: string;
        subtle: string;
        strong: string;
      };
      dark: {
        hairline: string;
        subtle: string;
        strong: string;
      };
    };
  };
  
  // Border radius
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };
  
  // Elevation system
  elevation: {
    sm: string;
    md: string;
    lg: string;
  };
  
  // Legacy shadows
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Motion & Animation
  motion: {
    duration: {
      instant: string;
      fast: string;
      normal: string;
      slow: string;
      slower: string;
      '75': string;
      '100': string;
      '150': string;
      '200': string;
      '300': string;
      '500': string;
    };
    delay: {
      none: string;
      short: string;
      medium: string;
      long: string;
    };
    easing: {
      linear: string;
      'ease-in': string;
      'ease-out': string;
      'ease-in-out': string;
      bounce: string;
      smooth: string;
      spring: string;
      'ease-out-quart': string;
      'ease-in-quart': string;
    };
    transitions: {
      button: {
        hover: string;
        press: string;
        focus: string;
      };
      chip: {
        select: string;
        deselect: string;
        hover: string;
      };
      tab: {
        switch: string;
        hover: string;
      };
      step: {
        advance: string;
        retreat: string;
        complete: string;
      };
      toast: {
        enter: string;
        exit: string;
      };
      modal: {
        enter: string;
        exit: string;
        backdrop: string;
      };
    };
  };
  
  // Layout & Grid System
  layout: LayoutTokens;
  
  // Component tokens
  components: ComponentTokens;
}

/**
 * Generate enterprise-grade color scales following Vercel/Apply design principles
 */
export function generateColorScales(): { neutral: ColorScale; accent: ColorScale } {
  return {
    // Neutral scale - Brandless gray following Apple/Linear principles
    neutral: {
      50: '#fafafa',   // Lightest background
      100: '#f5f5f5',  // Light background
      200: '#e5e5e5',  // Light border
      300: '#d4d4d4',  // Medium light border
      400: '#a3a3a3',  // Medium text
      500: '#737373',  // Base text
      600: '#525252',  // Dark text
      700: '#404040',  // Darker text
      800: '#262626',  // Dark background
      900: '#171717',  // Darker background
      950: '#0a0a0a',  // Darkest background
    },
    
    // Accent scale - Single brand color approach
    accent: {
      50: '#eff6ff',   // Lightest accent
      100: '#dbeafe',  // Light accent
      200: '#bfdbfe',  // Medium light accent
      300: '#93c5fd',  // Medium accent
      400: '#60a5fa',  // Medium dark accent
      500: '#3b82f6',  // Base accent (primary brand)
      600: '#2563eb',  // Dark accent
      700: '#1d4ed8',  // Darker accent
      800: '#1e40af',  // Dark accent
      900: '#1e3a8a',  // Darker accent
      950: '#172554',  // Darkest accent
    },
  };
}

/**
 * Generate light theme semantic colors
 */
export function generateLightSemanticColors(): SemanticColors {
  const colors = generateColorScales();
  
  return {
    // Primary brand colors
    primary: colors.accent[600],
    primaryForeground: '#ffffff',
    primaryHover: colors.accent[700],
    primaryActive: colors.accent[800],
    primaryDisabled: colors.neutral[300],
    
    // Secondary colors
    secondary: colors.neutral[100],
    secondaryForeground: colors.neutral[900],
    secondaryHover: colors.neutral[200],
    secondaryActive: colors.neutral[300],
    secondaryDisabled: colors.neutral[200],
    
    // Background system
    background: '#ffffff',
    backgroundSecondary: colors.neutral[50],
    backgroundTertiary: colors.neutral[100],
    backgroundElevated: '#ffffff',
    backgroundOverlay: 'rgba(0, 0, 0, 0.5)',
    
    // Foreground system
    foreground: colors.neutral[950],
    foregroundSecondary: colors.neutral[700],
    foregroundTertiary: colors.neutral[500],
    foregroundDisabled: colors.neutral[400],
    foregroundInverse: '#ffffff',
    
    // Surface system
    surface: '#ffffff',
    surfaceSecondary: colors.neutral[50],
    surfaceTertiary: colors.neutral[100],
    surfaceElevated: '#ffffff',
    surfaceOverlay: 'rgba(255, 255, 255, 0.95)',
    
    // Muted system
    muted: colors.neutral[100],
    mutedForeground: colors.neutral[600],
    mutedHover: colors.neutral[200],
    mutedActive: colors.neutral[300],
    
    // Accent system
    accent: colors.accent[100],
    accentForeground: colors.accent[900],
    accentHover: colors.accent[200],
    accentActive: colors.accent[300],
    
    // Border system
    border: colors.neutral[200],
    borderSecondary: colors.neutral[300],
    borderTertiary: colors.neutral[400],
    borderFocus: colors.accent[500],
    borderError: '#ef4444',
    borderSuccess: '#22c55e',
    borderWarning: '#f59e0b',
    
    // Input system
    input: colors.neutral[200],
    inputBackground: '#ffffff',
    inputBorder: colors.neutral[200],
    inputFocus: colors.accent[500],
    inputError: '#ef4444',
    inputDisabled: colors.neutral[100],
    
    // Ring system (focus indicators)
    ring: colors.accent[500],
    ringOffset: '#ffffff',
    ringFocus: colors.accent[500],
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
    
    info: colors.accent[500],
    infoForeground: '#ffffff',
    infoHover: colors.accent[600],
    infoActive: colors.accent[700],
    
    // Chart colors (for data visualization)
    chart: {
      primary: colors.accent[500],
      secondary: colors.accent[300],
      tertiary: colors.accent[700],
      quaternary: colors.neutral[400],
      quinary: colors.neutral[600],
    },
    
    // Interactive states
    interactive: {
      hover: colors.neutral[100],
      active: colors.neutral[200],
      disabled: colors.neutral[100],
      focus: colors.accent[100],
      selected: colors.accent[100],
    },
  };
}

/**
 * Generate dark theme semantic colors
 */
export function generateDarkSemanticColors(): SemanticColors {
  const colors = generateColorScales();
  
  return {
    // Primary brand colors
    primary: colors.accent[500],
    primaryForeground: colors.neutral[950],
    primaryHover: colors.accent[400],
    primaryActive: colors.accent[300],
    primaryDisabled: colors.neutral[700],
    
    // Secondary colors
    secondary: colors.neutral[800],
    secondaryForeground: colors.neutral[100],
    secondaryHover: colors.neutral[700],
    secondaryActive: colors.neutral[600],
    secondaryDisabled: colors.neutral[800],
    
    // Background system
    background: colors.neutral[950],
    backgroundSecondary: colors.neutral[900],
    backgroundTertiary: colors.neutral[800],
    backgroundElevated: colors.neutral[900],
    backgroundOverlay: 'rgba(0, 0, 0, 0.8)',
    
    // Foreground system
    foreground: colors.neutral[50],
    foregroundSecondary: colors.neutral[300],
    foregroundTertiary: colors.neutral[400],
    foregroundDisabled: colors.neutral[600],
    foregroundInverse: colors.neutral[950],
    
    // Surface system
    surface: colors.neutral[900],
    surfaceSecondary: colors.neutral[800],
    surfaceTertiary: colors.neutral[700],
    surfaceElevated: colors.neutral[800],
    surfaceOverlay: 'rgba(0, 0, 0, 0.95)',
    
    // Muted system
    muted: colors.neutral[800],
    mutedForeground: colors.neutral[400],
    mutedHover: colors.neutral[700],
    mutedActive: colors.neutral[600],
    
    // Accent system
    accent: colors.accent[900],
    accentForeground: colors.accent[100],
    accentHover: colors.accent[800],
    accentActive: colors.accent[700],
    
    // Border system
    border: colors.neutral[800],
    borderSecondary: colors.neutral[700],
    borderTertiary: colors.neutral[600],
    borderFocus: colors.accent[500],
    borderError: '#f87171',
    borderSuccess: '#4ade80',
    borderWarning: '#fbbf24',
    
    // Input system
    input: colors.neutral[800],
    inputBackground: colors.neutral[900],
    inputBorder: colors.neutral[800],
    inputFocus: colors.accent[500],
    inputError: '#f87171',
    inputDisabled: colors.neutral[800],
    
    // Ring system (focus indicators)
    ring: colors.accent[500],
    ringOffset: colors.neutral[950],
    ringFocus: colors.accent[500],
    ringError: '#f87171',
    ringSuccess: '#4ade80',
    ringWarning: '#fbbf24',
    
    // Status colors
    destructive: '#f87171',
    destructiveForeground: colors.neutral[950],
    destructiveHover: '#fca5a5',
    destructiveActive: '#fecaca',
    
    success: '#4ade80',
    successForeground: colors.neutral[950],
    successHover: '#86efac',
    successActive: '#bbf7d0',
    
    warning: '#fbbf24',
    warningForeground: colors.neutral[950],
    warningHover: '#fcd34d',
    warningActive: '#fde68a',
    
    info: colors.accent[400],
    infoForeground: colors.neutral[950],
    infoHover: colors.accent[300],
    infoActive: colors.accent[200],
    
    // Chart colors (for data visualization)
    chart: {
      primary: colors.accent[400],
      secondary: colors.accent[600],
      tertiary: colors.accent[200],
      quaternary: colors.neutral[500],
      quinary: colors.neutral[300],
    },
    
    // Interactive states
    interactive: {
      hover: colors.neutral[800],
      active: colors.neutral[700],
      disabled: colors.neutral[800],
      focus: colors.accent[900],
      selected: colors.accent[900],
    },
  };
}

/**
 * Generate comprehensive component tokens
 */
export function generateComponentTokens(): ComponentTokens {
  return {
    // Button system
    button: {
      height: {
        xs: '1.5rem',    // 24px
        sm: '2rem',       // 32px
        md: '2.5rem',     // 40px
        lg: '3rem',       // 48px
        xl: '3.5rem',     // 56px
      },
      padding: {
        xs: '0.375rem 0.75rem',   // 6px 12px
        sm: '0.5rem 1rem',        // 8px 16px
        md: '0.625rem 1.25rem',   // 10px 20px
        lg: '0.75rem 1.5rem',     // 12px 24px
        xl: '0.875rem 1.75rem',   // 14px 28px
      },
      borderRadius: {
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
      gap: {
        sm: '0.25rem',    // 4px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
      },
      shadow: {
        none: 'none',
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
    
    // Card system
    card: {
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
        xl: '1rem',       // 16px
      },
      padding: {
        sm: '1rem',       // 16px
        md: '1.5rem',     // 24px
        lg: '2rem',       // 32px
        xl: '2.5rem',     // 40px
      },
      shadow: {
        none: 'none',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      borderWidth: {
        none: '0',
        thin: '1px',
        medium: '2px',
        thick: '4px',
      },
      gap: {
        sm: '0.75rem',    // 12px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
      },
    },
    
    // Input system
    input: {
      height: {
        sm: '2rem',       // 32px
        md: '2.5rem',     // 40px
        lg: '3rem',       // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',     // 8px 12px
        md: '0.625rem 1rem',      // 10px 16px
        lg: '0.75rem 1.25rem',    // 12px 20px
      },
      borderRadius: {
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      borderWidth: {
        none: '0',
        thin: '1px',
        medium: '2px',
      },
      gap: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
      },
    },
    
    // Chip system
    chip: {
      height: {
        sm: '1.5rem',     // 24px
        md: '2rem',       // 32px
        lg: '2.5rem',     // 40px
      },
      padding: {
        sm: '0.25rem 0.5rem',     // 4px 8px
        md: '0.375rem 0.75rem',   // 6px 12px
        lg: '0.5rem 1rem',        // 8px 16px
      },
      borderRadius: {
        sm: '0.75rem',    // 12px
        md: '1rem',       // 16px
        lg: '1.25rem',    // 20px
      },
      fontSize: {
        sm: '0.75rem',    // 12px
        md: '0.875rem',   // 14px
        lg: '1rem',       // 16px
      },
      gap: {
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
      },
    },
    
    // Tabs system
    tabs: {
      height: {
        sm: '2rem',       // 32px
        md: '2.5rem',     // 40px
        lg: '3rem',       // 48px
      },
      borderRadius: {
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
      },
      padding: {
        sm: '0.5rem 0.75rem',     // 8px 12px
        md: '0.625rem 1rem',      // 10px 16px
        lg: '0.75rem 1.25rem',    // 12px 20px
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      gap: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
      },
    },
    
    // Stepper system
    stepper: {
      size: {
        sm: '1.5rem',     // 24px
        md: '2rem',       // 32px
        lg: '2.5rem',     // 40px
      },
      borderWidth: {
        thin: '1px',
        medium: '2px',
        thick: '4px',
      },
      connectorHeight: {
        sm: '1px',
        md: '2px',
        lg: '4px',
      },
      fontSize: {
        sm: '0.75rem',    // 12px
        md: '0.875rem',   // 14px
        lg: '1rem',       // 16px
      },
      gap: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
      },
    },
    
    // Toast system
    toast: {
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
      },
      padding: {
        sm: '0.75rem 1rem',       // 12px 16px
        md: '1rem 1.25rem',       // 16px 20px
        lg: '1.25rem 1.5rem',     // 20px 24px
      },
      shadow: {
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      maxWidth: {
        sm: '20rem',      // 320px
        md: '24rem',      // 384px
        lg: '32rem',      // 512px
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      gap: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
      },
    },
    
    // Modal system
    modal: {
      borderRadius: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
        xl: '1.25rem',     // 20px
      },
      padding: {
        sm: '1.5rem',     // 24px
        md: '2rem',       // 32px
        lg: '2.5rem',     // 40px
        xl: '3rem',       // 48px
      },
      shadow: {
        sm: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        sm: '24rem',      // 384px
        md: '32rem',      // 512px
        lg: '48rem',      // 768px
        xl: '64rem',      // 1024px
      },
      backdrop: {
        blur: '8px',
        opacity: '0.5',
      },
    },
    
    // Navigation system
    navigation: {
      height: {
        sm: '3rem',       // 48px
        md: '4rem',       // 64px
        lg: '5rem',       // 80px
      },
      padding: {
        sm: '0.75rem 1rem',       // 12px 16px
        md: '1rem 1.5rem',       // 16px 24px
        lg: '1.25rem 2rem',      // 20px 32px
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      gap: {
        sm: '0.75rem',    // 12px
        md: '1rem',       // 16px
        lg: '1.5rem',     // 24px
      },
    },
    
    // Table system
    table: {
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
      },
      padding: {
        sm: '0.5rem 0.75rem',     // 8px 12px
        md: '0.75rem 1rem',       // 12px 16px
        lg: '1rem 1.25rem',      // 16px 20px
      },
      fontSize: {
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
      },
      borderWidth: {
        none: '0',
        thin: '1px',
        medium: '2px',
      },
      gap: {
        sm: '0.5rem',     // 8px
        md: '0.75rem',    // 12px
        lg: '1rem',       // 16px
      },
    },
    
    // Avatar system
    avatar: {
      size: {
        xs: '1.5rem',     // 24px
        sm: '2rem',       // 32px
        md: '2.5rem',     // 40px
        lg: '3rem',       // 48px
        xl: '4rem',       // 64px
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',    // 4px
        md: '0.375rem',   // 6px
        lg: '0.5rem',     // 8px
        full: '50%',
      },
      fontSize: {
        xs: '0.75rem',    // 12px
        sm: '0.875rem',   // 14px
        md: '1rem',       // 16px
        lg: '1.125rem',   // 18px
        xl: '1.25rem',    // 20px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
    
    // Badge system
    badge: {
      height: {
        sm: '1.25rem',    // 20px
        md: '1.5rem',     // 24px
        lg: '1.75rem',    // 28px
      },
      padding: {
        sm: '0.125rem 0.375rem',  // 2px 6px
        md: '0.25rem 0.5rem',     // 4px 8px
        lg: '0.375rem 0.75rem',   // 6px 12px
      },
      borderRadius: {
        sm: '0.375rem',   // 6px
        md: '0.5rem',     // 8px
        lg: '0.75rem',    // 12px
      },
      fontSize: {
        xs: '0.6875rem',  // 11px
        sm: '0.75rem',    // 12px
        md: '0.875rem',   // 14px
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
  };
}

/**
 * Generate comprehensive design tokens with multi-brand support
 */
export function generateDesignTokens(
  activeBrand?: string,
  customBrands?: BrandPalette[],
  activeFont?: string,
  customFonts?: FontFamily[]
): DesignTokens {
  // Create multi-brand configuration
  const multiBrandConfig = createMultiBrandConfig(activeBrand, customBrands);
  const activeBrandPalette = multiBrandConfig.brands.find(b => b.name === multiBrandConfig.activeBrand) || multiBrandConfig.defaultBrand;
  
  // Create multi-typography configuration
  const multiTypographyConfig = createMultiTypographyConfig(activeFont, customFonts);
  const activeFontFamily = multiTypographyConfig.availableFonts.find(f => f.name === multiTypographyConfig.activeFont) || multiTypographyConfig.defaultFont;
  
  // Generate typography configuration for active font
  const typographyConfig = generateTypographyConfig(activeFontFamily);
  
  // Generate color scales for active brand
  const primaryScale = generateColorScaleFromBase(activeBrandPalette.primary);
  const secondaryScale = activeBrandPalette.secondary 
    ? generateColorScaleFromBase(activeBrandPalette.secondary)
    : generateComplementaryScale(activeBrandPalette.primary);
  
  // Default neutral scale
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
  
  // Generate semantic colors for active brand
  const lightColors = generateBrandSemanticColors(activeBrandPalette, false);
  const darkColors = generateBrandSemanticColors(activeBrandPalette, true);
  const componentTokens = generateComponentTokens();
  
  return {
    // Multi-brand configuration
    multiBrand: multiBrandConfig,
    
    // Multi-typography configuration
    multiTypography: multiTypographyConfig,
    
    // Color scales (dynamic based on active brand)
    neutral: neutralScale,
    primary: primaryScale,
    secondary: secondaryScale,
    
    // Semantic colors (dynamic based on active brand)
    colors: {
      light: lightColors,
      dark: darkColors,
    },
    
    // Typography system (dynamic based on active font)
    typography: typographyConfig,
    
    // Typography measure
    measure: {
      narrow: '45ch',
      base: '65ch',
      wide: '75ch',
    },
    
    // Spacing
    spacing: {
      xs: '0.25rem',        // 4px
      sm: '0.5rem',         // 8px
      md: '1rem',           // 16px
      lg: '1.5rem',         // 24px
      xl: '2rem',           // 32px
      '2xl': '3rem',        // 48px
      '3xl': '4rem',        // 64px
      '4xl': '6rem',        // 96px
      // HT-002.1.4: Linear-specific spacing patterns
      section: '4rem',      // 64px
      'section-sm': '3rem', // 48px
      'section-lg': '6rem', // 96px
      'section-xl': '8rem', // 128px
    },
    
    // Border system - Hairline borders for material feel
    borders: {
      width: {
        none: '0',
        hairline: '0.5px',
        thin: '1px',
        thick: '2px',
      },
      color: {
        light: {
          hairline: 'rgba(0, 0, 0, 0.06)',
          subtle: 'rgba(0, 0, 0, 0.12)',
          strong: 'rgba(0, 0, 0, 0.24)',
        },
        dark: {
          hairline: 'rgba(255, 255, 255, 0.06)',
          subtle: 'rgba(255, 255, 255, 0.12)',
          strong: 'rgba(255, 255, 255, 0.24)',
        },
      },
    },
    
    // Border radius
    borderRadius: {
      none: '0',
      sm: '0.125rem',       // 2px
      md: '0.375rem',       // 6px
      lg: '0.5rem',         // 8px
      xl: '0.75rem',        // 12px
      '2xl': '1rem',        // 16px
      full: '9999px',
    },
    
    // Elevation system - Soft shadows with consistent depth
    elevation: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    
    // Legacy shadows (kept for backward compatibility)
    shadows: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
    
    // Motion & Animation - Enhanced with comprehensive micro-interaction system
    motion: {
      duration: {
        instant: '0ms',
        fast: '150ms',
        normal: '200ms',
        slow: '300ms',
        slower: '500ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
      },
      delay: {
        none: '0ms',
        short: '50ms',
        medium: '100ms',
        long: '200ms',
      },
      easing: {
        linear: 'linear',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
      },
      transitions: {
        button: {
          hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          press: 'all 100ms cubic-bezier(0.4, 0, 0.2, 1)',
          focus: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        chip: {
          select: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          deselect: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        tab: {
          switch: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          hover: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        step: {
          advance: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          retreat: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          complete: 'all 500ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        },
        toast: {
          enter: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          exit: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        modal: {
          enter: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
          exit: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          backdrop: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
    
    // Layout & Grid System
    layout: {
      grid: {
        columns: 12,
        maxWidth: '1120px',
        gutter: '24px',
        margin: '0 auto',
        breakpoints: {
          xs: '320px',
          sm: '384px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1536px',
        },
      },
      container: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        full: '100%',
      },
      spacing: {
        section: '4rem',
        'section-sm': '3rem',
        'section-lg': '6rem',
        'section-xl': '8rem',
      },
      grid: 'repeat(12, 1fr)',
      full: '100%',
    },
    
    // Component tokens
    components: componentTokens,
  };
}
