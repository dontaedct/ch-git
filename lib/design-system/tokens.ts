/**
 * @fileoverview HT-008.5.2: Enhanced Design System with Consistent Tokens
 * @module lib/design-system/tokens
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.5.2 - Create consistent design system with proper tokens
 * Focus: Unified design token system with Vercel/Apply-level consistency
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design consistency and maintainability)
 */

// HT-008.5.2: Enhanced Design Token System
// Comprehensive token system following Vercel/Apply design principles

export interface DesignTokenScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

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

export interface SemanticColors {
  // Primary brand colors
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secondary colors
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  secondaryActive: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  foreground: string;
  foregroundSecondary: string;
  foregroundTertiary: string;
  
  // Muted colors
  muted: string;
  mutedForeground: string;
  mutedHover: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  accentHover: string;
  accentActive: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  borderTertiary: string;
  borderHover: string;
  borderFocus: string;
  
  // Input colors
  input: string;
  inputForeground: string;
  inputBorder: string;
  inputBorderHover: string;
  inputBorderFocus: string;
  inputBackground: string;
  inputBackgroundHover: string;
  
  // Ring colors (focus indicators)
  ring: string;
  ringOffset: string;
  
  // Status colors
  destructive: string;
  destructiveForeground: string;
  destructiveHover: string;
  destructiveActive: string;
  
  success: string;
  successForeground: string;
  successHover: string;
  successActive: string;
  
  warning: string;
  warningForeground: string;
  warningHover: string;
  warningActive: string;
  
  info: string;
  infoForeground: string;
  infoHover: string;
  infoActive: string;
  
  // Chart colors (for data visualization)
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface TypographyTokens {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
    display: string[];
  };
  fontSize: DesignTokenScale;
  fontWeight: {
    thin: string;
    extralight: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };
  lineHeight: DesignTokenScale;
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface SpacingTokens {
  // Base spacing scale (4px base unit)
  px: string;      // 1px
  '0.5': string;    // 2px
  '1': string;      // 4px
  '1.5': string;    // 6px
  '2': string;      // 8px
  '2.5': string;    // 10px
  '3': string;      // 12px
  '3.5': string;    // 14px
  '4': string;      // 16px
  '5': string;      // 20px
  '6': string;      // 24px
  '7': string;      // 28px
  '8': string;      // 32px
  '9': string;      // 36px
  '10': string;     // 40px
  '11': string;     // 44px
  '12': string;     // 48px
  '14': string;     // 56px
  '16': string;     // 64px
  '20': string;     // 80px
  '24': string;     // 96px
  '28': string;     // 112px
  '32': string;     // 128px
  '36': string;     // 144px
  '40': string;     // 160px
  '44': string;     // 176px
  '48': string;     // 192px
  '52': string;     // 208px
  '56': string;     // 224px
  '60': string;     // 240px
  '64': string;     // 256px
  '72': string;     // 288px
  '80': string;     // 320px
  '96': string;     // 384px
}

export interface BorderRadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ShadowTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface MotionTokens {
  duration: {
    '75': string;
    '100': string;
    '150': string;
    '200': string;
    '300': string;
    '500': string;
    '700': string;
    '1000': string;
  };
  easing: {
    linear: string;
    in: string;
    out: string;
    'in-out': string;
    smooth: string;
    bounce: string;
    elastic: string;
  };
  spring: {
    gentle: string;
    wobbly: string;
    stiff: string;
    slow: string;
    bouncy: string;
  };
}

export interface ComponentTokens {
  button: {
    height: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    padding: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    borderRadius: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: string;
    letterSpacing: string;
    transition: string;
  };
  input: {
    height: {
      sm: string;
      md: string;
      lg: string;
    };
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
    borderRadius: string;
    fontSize: {
      sm: string;
      md: string;
      lg: string;
    };
    borderWidth: string;
    transition: string;
  };
  card: {
    borderRadius: string;
    padding: {
      sm: string;
      md: string;
      lg: string;
    };
    shadow: string;
    borderWidth: string;
    transition: string;
  };
  badge: {
    height: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    letterSpacing: string;
  };
  chip: {
    height: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
    fontWeight: string;
    transition: string;
  };
  tabs: {
    height: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: string;
    transition: string;
  };
  stepper: {
    size: string;
    borderWidth: string;
    connectorHeight: string;
    fontSize: string;
    fontWeight: string;
  };
  toast: {
    borderRadius: string;
    padding: string;
    shadow: string;
    maxWidth: string;
    fontSize: string;
    fontWeight: string;
  };
  modal: {
    borderRadius: string;
    padding: string;
    shadow: string;
    maxWidth: string;
    backdropBlur: string;
  };
  dropdown: {
    borderRadius: string;
    padding: string;
    shadow: string;
    borderWidth: string;
    fontSize: string;
  };
  tooltip: {
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: string;
    maxWidth: string;
  };
}

export interface LayoutTokens {
  container: {
    maxWidth: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
      '7xl': string;
    };
    padding: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  grid: {
    columns: number;
    gap: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  zIndex: {
    hide: string;
    auto: string;
    base: string;
    docked: string;
    dropdown: string;
    sticky: string;
    banner: string;
    overlay: string;
    modal: string;
    popover: string;
    skipLink: string;
    toast: string;
    tooltip: string;
  };
}

export interface DesignTokens {
  colors: {
    light: SemanticColors;
    dark: SemanticColors;
  };
  neutral: ColorScale;
  accent: ColorScale;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  motion: MotionTokens;
  components: ComponentTokens;
  layout: LayoutTokens;
}

// HT-008.5.2: Enhanced Design Tokens Implementation
// Following Vercel/Apply design principles with comprehensive token system

export const designTokens: DesignTokens = {
  colors: {
    light: {
      // Primary brand colors
      primary: '#2563eb',
      primaryForeground: '#ffffff',
      primaryHover: '#1d4ed8',
      primaryActive: '#1e40af',
      
      // Secondary colors
      secondary: '#64748b',
      secondaryForeground: '#ffffff',
      secondaryHover: '#475569',
      secondaryActive: '#334155',
      
      // Background colors
      background: '#ffffff',
      backgroundSecondary: '#f8fafc',
      backgroundTertiary: '#f1f5f9',
      foreground: '#0f172a',
      foregroundSecondary: '#475569',
      foregroundTertiary: '#64748b',
      
      // Muted colors
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      mutedHover: '#e2e8f0',
      
      // Accent colors
      accent: '#f1f5f9',
      accentForeground: '#0f172a',
      accentHover: '#e2e8f0',
      accentActive: '#cbd5e1',
      
      // Border colors
      border: '#e2e8f0',
      borderSecondary: '#cbd5e1',
      borderTertiary: '#94a3b8',
      borderHover: '#cbd5e1',
      borderFocus: '#2563eb',
      
      // Input colors
      input: '#ffffff',
      inputForeground: '#0f172a',
      inputBorder: '#e2e8f0',
      inputBorderHover: '#cbd5e1',
      inputBorderFocus: '#2563eb',
      inputBackground: '#ffffff',
      inputBackgroundHover: '#f8fafc',
      
      // Ring colors
      ring: '#2563eb',
      ringOffset: '#ffffff',
      
      // Status colors
      destructive: '#dc2626',
      destructiveForeground: '#ffffff',
      destructiveHover: '#b91c1c',
      destructiveActive: '#991b1b',
      
      success: '#16a34a',
      successForeground: '#ffffff',
      successHover: '#15803d',
      successActive: '#166534',
      
      warning: '#d97706',
      warningForeground: '#ffffff',
      warningHover: '#b45309',
      warningActive: '#92400e',
      
      info: '#2563eb',
      infoForeground: '#ffffff',
      infoHover: '#1d4ed8',
      infoActive: '#1e40af',
      
      // Chart colors
      chart1: '#2563eb',
      chart2: '#16a34a',
      chart3: '#d97706',
      chart4: '#dc2626',
      chart5: '#9333ea',
    },
    dark: {
      // Primary brand colors
      primary: '#3b82f6',
      primaryForeground: '#ffffff',
      primaryHover: '#2563eb',
      primaryActive: '#1d4ed8',
      
      // Secondary colors
      secondary: '#64748b',
      secondaryForeground: '#ffffff',
      secondaryHover: '#475569',
      secondaryActive: '#334155',
      
      // Background colors
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      backgroundTertiary: '#334155',
      foreground: '#f8fafc',
      foregroundSecondary: '#cbd5e1',
      foregroundTertiary: '#94a3b8',
      
      // Muted colors
      muted: '#1e293b',
      mutedForeground: '#64748b',
      mutedHover: '#334155',
      
      // Accent colors
      accent: '#1e293b',
      accentForeground: '#f8fafc',
      accentHover: '#334155',
      accentActive: '#475569',
      
      // Border colors
      border: '#334155',
      borderSecondary: '#475569',
      borderTertiary: '#64748b',
      borderHover: '#475569',
      borderFocus: '#3b82f6',
      
      // Input colors
      input: '#1e293b',
      inputForeground: '#f8fafc',
      inputBorder: '#334155',
      inputBorderHover: '#475569',
      inputBorderFocus: '#3b82f6',
      inputBackground: '#1e293b',
      inputBackgroundHover: '#334155',
      
      // Ring colors
      ring: '#3b82f6',
      ringOffset: '#0f172a',
      
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
      
      info: '#3b82f6',
      infoForeground: '#ffffff',
      infoHover: '#2563eb',
      infoActive: '#1d4ed8',
      
      // Chart colors
      chart1: '#3b82f6',
      chart2: '#22c55e',
      chart3: '#f59e0b',
      chart4: '#ef4444',
      chart5: '#a855f7',
    },
  },
  
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
  
  accent: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      serif: ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      display: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      md: '1rem',       // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
    },
    fontWeight: {
      thin: '100',
      extralight: '200',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },
    lineHeight: {
      xs: '1rem',       // 16px
      sm: '1.25rem',    // 20px
      md: '1.5rem',     // 24px
      lg: '1.75rem',    // 28px
      xl: '2rem',       // 32px
      '2xl': '2.25rem', // 36px
      '3xl': '2.5rem',  // 40px
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  spacing: {
    px: '1px',
    '0.5': '0.125rem',  // 2px
    '1': '0.25rem',     // 4px
    '1.5': '0.375rem',  // 6px
    '2': '0.5rem',      // 8px
    '2.5': '0.625rem',  // 10px
    '3': '0.75rem',     // 12px
    '3.5': '0.875rem',  // 14px
    '4': '1rem',        // 16px
    '5': '1.25rem',     // 20px
    '6': '1.5rem',      // 24px
    '7': '1.75rem',     // 28px
    '8': '2rem',        // 32px
    '9': '2.25rem',     // 36px
    '10': '2.5rem',     // 40px
    '11': '2.75rem',    // 44px
    '12': '3rem',       // 48px
    '14': '3.5rem',     // 56px
    '16': '4rem',       // 64px
    '20': '5rem',       // 80px
    '24': '6rem',       // 96px
    '28': '7rem',       // 112px
    '32': '8rem',       // 128px
    '36': '9rem',       // 144px
    '40': '10rem',      // 160px
    '44': '11rem',      // 176px
    '48': '12rem',      // 192px
    '52': '13rem',      // 208px
    '56': '14rem',      // 224px
    '60': '15rem',      // 240px
    '64': '16rem',      // 256px
    '72': '18rem',      // 288px
    '80': '20rem',      // 320px
    '96': '24rem',      // 384px
  },
  
  borderRadius: {
    none: '0px',
    sm: '0.125rem',     // 2px
    md: '0.375rem',     // 6px
    lg: '0.5rem',       // 8px
    xl: '0.75rem',      // 12px
    '2xl': '1rem',      // 16px
    '3xl': '1.5rem',    // 24px
    full: '9999px',
  },
  
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: '0 0 #0000',
  },
  
  motion: {
    duration: {
      '75': '75ms',
      '100': '100ms',
      '150': '150ms',
      '200': '200ms',
      '300': '300ms',
      '500': '500ms',
      '700': '700ms',
      '1000': '1000ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
    spring: {
      gentle: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      wobbly: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      stiff: 'cubic-bezier(0.4, 0, 0.2, 1)',
      slow: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      bouncy: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },
  },
  
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
        xl: '3.5rem',    // 56px
      },
      padding: {
        sm: '0.5rem 0.75rem',   // 8px 12px
        md: '0.75rem 1rem',     // 12px 16px
        lg: '1rem 1.5rem',      // 16px 24px
        xl: '1.25rem 2rem',     // 20px 32px
      },
      borderRadius: '0.375rem', // 6px
      fontSize: {
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
        xl: '1.25rem',   // 20px
      },
      fontWeight: '500',
      letterSpacing: '0.025em',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    input: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
      },
      padding: {
        sm: '0.5rem 0.75rem',   // 8px 12px
        md: '0.75rem 1rem',     // 12px 16px
        lg: '1rem 1.25rem',     // 16px 20px
      },
      borderRadius: '0.375rem', // 6px
      fontSize: {
        sm: '0.875rem',  // 14px
        md: '1rem',      // 16px
        lg: '1.125rem',  // 18px
      },
      borderWidth: '1px',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    card: {
      borderRadius: '0.75rem', // 12px
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem',      // 32px
      },
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      borderWidth: '1px',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    badge: {
      height: '1.5rem',   // 24px
      padding: '0.25rem 0.5rem', // 4px 8px
      borderRadius: '0.375rem', // 6px
      fontSize: '0.75rem', // 12px
      fontWeight: '500',
      letterSpacing: '0.025em',
    },
    chip: {
      height: '2rem',     // 32px
      padding: '0.5rem 0.75rem', // 8px 12px
      borderRadius: '1rem', // 16px
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    tabs: {
      height: '2.5rem',   // 40px
      borderRadius: '0.375rem', // 6px
      padding: '0.5rem 1rem', // 8px 16px
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
      transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    stepper: {
      size: '2rem',      // 32px
      borderWidth: '2px',
      connectorHeight: '2px',
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
    },
    toast: {
      borderRadius: '0.75rem', // 12px
      padding: '1rem 1.5rem', // 16px 24px
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      maxWidth: '24rem', // 384px
      fontSize: '0.875rem', // 14px
      fontWeight: '500',
    },
    modal: {
      borderRadius: '1rem', // 16px
      padding: '2rem',      // 32px
      shadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
      maxWidth: '32rem',    // 512px
      backdropBlur: '8px',
    },
    dropdown: {
      borderRadius: '0.5rem', // 8px
      padding: '0.5rem',      // 8px
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      borderWidth: '1px',
      fontSize: '0.875rem',   // 14px
    },
    tooltip: {
      borderRadius: '0.375rem', // 6px
      padding: '0.5rem 0.75rem', // 8px 12px
      fontSize: '0.75rem',      // 12px
      fontWeight: '500',
      maxWidth: '12rem',         // 192px
    },
  },
  
  layout: {
    container: {
      maxWidth: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1728px',
        '4xl': '1920px',
        '5xl': '2048px',
        '6xl': '2304px',
        '7xl': '2560px',
      },
      padding: {
        sm: '1rem',      // 16px
        md: '1.5rem',    // 24px
        lg: '2rem',      // 32px
        xl: '2.5rem',    // 40px
      },
    },
    grid: {
      columns: 12,
      gap: {
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
      },
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    zIndex: {
      hide: '-1',
      auto: 'auto',
      base: '0',
      docked: '10',
      dropdown: '1000',
      sticky: '1100',
      banner: '1200',
      overlay: '1300',
      modal: '1400',
      popover: '1500',
      skipLink: '1600',
      toast: '1700',
      tooltip: '1800',
    },
  },
};

export default designTokens;
