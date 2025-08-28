/**
 * Design Tokens Configuration
 * 
 * Provides a comprehensive token system for consistent theming across
 * the application. Follows Apple/Linear/Figma design principles with
 * neutral palettes and single accent color approach.
 * 
 * Universal Header: @lib/design-tokens/tokens
 */

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
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  info: string;
  infoForeground: string;
}

export interface ComponentTokens {
  button: {
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
  };
  card: {
    borderRadius: string;
    padding: string;
    shadow: string;
    borderWidth: string;
  };
  chip: {
    height: string;
    padding: string;
    borderRadius: string;
    fontSize: string;
  };
  tabs: {
    height: string;
    borderRadius: string;
    padding: string;
  };
  stepper: {
    size: string;
    borderWidth: string;
    connectorHeight: string;
  };
  toast: {
    borderRadius: string;
    padding: string;
    shadow: string;
    maxWidth: string;
  };
}

export interface DesignTokens {
  // Color scales
  neutral: ColorScale;
  accent: ColorScale;
  
  // Semantic colors (light theme)
  colors: {
    light: SemanticColors;
    dark: SemanticColors;
  };
  
  // Typography
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
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
  
  // Shadows
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
      '75': string;
      '100': string;
      '150': string;
      '200': string;
      '300': string;
      '500': string;
    };
    easing: {
      linear: string;
      'ease-in': string;
      'ease-out': string;
      'ease-in-out': string;
      bounce: string;
      smooth: string;
    };
  };
  
  // Component-specific tokens
  components: ComponentTokens;
}

// Neutral color scale (brandless gray)
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

// Default accent (blue scale for brandless approach)
const accentScale: ColorScale = {
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
};

export const designTokens: DesignTokens = {
  neutral: neutralScale,
  accent: accentScale,
  
  colors: {
    light: {
      primary: accentScale[600],
      primaryForeground: '#ffffff',
      secondary: neutralScale[100],
      secondaryForeground: neutralScale[900],
      background: '#ffffff',
      foreground: neutralScale[950],
      muted: neutralScale[50],
      mutedForeground: neutralScale[600],
      accent: accentScale[50],
      accentForeground: accentScale[600],
      border: neutralScale[200],
      input: neutralScale[200],
      ring: accentScale[600],
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      success: '#22c55e',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      info: accentScale[500],
      infoForeground: '#ffffff',
    },
    dark: {
      primary: accentScale[400],
      primaryForeground: accentScale[950],
      secondary: neutralScale[800],
      secondaryForeground: neutralScale[50],
      background: neutralScale[950],
      foreground: neutralScale[50],
      muted: neutralScale[900],
      mutedForeground: neutralScale[400],
      accent: neutralScale[800],
      accentForeground: accentScale[400],
      border: neutralScale[800],
      input: neutralScale[800],
      ring: accentScale[400],
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      success: '#22c55e',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
      info: accentScale[400],
      infoForeground: '#ffffff',
    },
  },
  
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "Cascadia Code", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px',
  },
  
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  motion: {
    duration: {
      '75': '75ms',
      '100': '100ms',
      '150': '150ms',
      '200': '200ms',
      '300': '300ms',
      '500': '500ms',
    },
    easing: {
      linear: 'linear',
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  components: {
    button: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '2.75rem',
      },
      padding: {
        sm: '0.5rem 0.75rem',
        md: '0.625rem 1rem',
        lg: '0.75rem 1.5rem',
      },
      borderRadius: '0.375rem',
      fontSize: {
        sm: '0.875rem',
        md: '0.875rem',
        lg: '1rem',
      },
    },
    card: {
      borderRadius: '0.75rem',
      padding: '1.5rem',
      shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
      borderWidth: '1px',
    },
    chip: {
      height: '1.75rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.875rem',
    },
    tabs: {
      height: '2.5rem',
      borderRadius: '0.375rem',
      padding: '0.25rem',
    },
    stepper: {
      size: '2rem',
      borderWidth: '2px',
      connectorHeight: '1px',
    },
    toast: {
      borderRadius: '0.5rem',
      padding: '1rem',
      shadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      maxWidth: '20rem',
    },
  },
};