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

export interface LayoutTokens {
  grid: {
    columns: number;
    maxWidth: string;
    gutters: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  section: {
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      '2xl': string;
    };
    rhythm: {
      default: string;
      tight: string;
      loose: string;
    };
  };
  container: {
    prose: string;
    page: string;
    grid: string;
    full: string;
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
  
  // Typography - Enhanced for Apple/Linear-grade quality
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
      display: string;
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
      '5xl': string;
      '6xl': string;
    };
    fontWeight: {
      light: string;
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
      extrabold: string;
    };
    lineHeight: {
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
    measure: {
      narrow: string;
      base: string;
      wide: string;
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
  
  // Border system - Hairline borders for material feel
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
  
  // Elevation system - Soft shadows with consistent depth
  elevation: {
    sm: string;
    md: string;
    lg: string;
  };
  
  // Legacy shadows (kept for backward compatibility)
  shadows: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  
  // Motion & Animation - Enhanced with comprehensive micro-interaction system
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
      destructive: '#dc2626', // Darker red for better contrast (was #ef4444)
      destructiveForeground: '#ffffff',
      success: '#15803d', // Even darker green for WCAG AA compliance (was #16a34a)
      successForeground: '#ffffff',
      warning: '#c2410c', // Darker orange for WCAG AA compliance (was #d97706)
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
      destructive: '#dc2626', // Consistent with light theme
      destructiveForeground: '#ffffff',
      success: '#15803d', // Consistent with light theme
      successForeground: '#ffffff',
      warning: '#c2410c', // Consistent with light theme
      warningForeground: '#ffffff',
      info: accentScale[400],
      infoForeground: '#ffffff',
    },
  },
  
  typography: {
    fontFamily: {
      sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, "SF Mono", "Cascadia Code", Consolas, monospace',
      display: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px - base size
      lg: '1.125rem',    // 18px - 1.125x
      xl: '1.25rem',     // 20px - 1.25x
      '2xl': '1.5rem',   // 24px - 1.5x
      '3xl': '1.875rem', // 30px - 1.875x
      '4xl': '2.25rem',  // 36px - 2.25x
      '5xl': '3rem',     // 48px - 3x
      '6xl': '4rem',     // 64px - 4x
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    lineHeight: {
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
    measure: {
      narrow: '45ch',  // ~45-55 characters for narrow content
      base: '65ch',    // ~60-72 characters for optimal readability
      wide: '80ch',    // ~75-85 characters for wide content
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
  
  // Border system - Hairline borders for material feel
  borders: {
    width: {
      none: '0',
      hairline: '1px',        // Primary hairline border
      thin: '2px',            // Slightly thicker for focus states
      thick: '4px',           // For emphasis or selection
    },
    color: {
      light: {
        hairline: 'rgb(0 0 0 / 0.08)',   // Very low-alpha for hairlines
        subtle: 'rgb(0 0 0 / 0.12)',     // Subtle borders for cards/sections  
        strong: 'rgb(0 0 0 / 0.18)',     // Stronger borders for focus/active
      },
      dark: {
        hairline: 'rgb(255 255 255 / 0.08)',  // Dark theme hairline
        subtle: 'rgb(255 255 255 / 0.12)',    // Dark theme subtle
        strong: 'rgb(255 255 255 / 0.18)',    // Dark theme strong
      },
    },
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
  
  // Elevation system - Soft shadows with consistent depth
  elevation: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',     // Cards, chips
    md: '0 2px 4px 0 rgb(0 0 0 / 0.04), 0 6px 12px 0 rgb(0 0 0 / 0.06)',    // Dropdowns, popovers  
    lg: '0 8px 16px 0 rgb(0 0 0 / 0.06), 0 12px 24px 0 rgb(0 0 0 / 0.08)',  // Modals, drawers
  },
  
  // Legacy shadows (kept for backward compatibility)
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  motion: {
    duration: {
      instant: '75ms',
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
      'ease-in': 'ease-in',
      'ease-out': 'ease-out',
      'ease-in-out': 'ease-in-out',
      bounce: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
      'ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
    },
    transitions: {
      button: {
        hover: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        press: 'transform 100ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        focus: 'box-shadow 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      chip: {
        select: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        deselect: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        hover: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      tab: {
        switch: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        hover: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      step: {
        advance: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        retreat: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        complete: 'all 300ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      toast: {
        enter: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        exit: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      modal: {
        enter: 'all 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        exit: 'all 150ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        backdrop: 'opacity 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  
  // Layout & Grid System
  layout: {
    grid: {
      columns: 12,
      maxWidth: '1120px', // ~1120px for disciplined layout
      gutters: {
        xs: '16px',  // Mobile gutters
        sm: '20px',  // Small tablet gutters
        md: '24px',  // Standard gutters (as requested)
        lg: '32px',  // Desktop gutters
        xl: '40px',  // Large desktop gutters
      },
      breakpoints: {
        sm: '640px',  // Mobile-first breakpoints
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
    section: {
      spacing: {
        xs: '24px',   // Tight section spacing
        sm: '32px',   // Small section spacing
        md: '48px',   // Medium section spacing
        lg: '72px',   // Default section spacing (as requested)
        xl: '96px',   // Large section spacing
        '2xl': '128px', // Extra large section spacing
      },
      rhythm: {
        default: '72px',  // Default vertical rhythm (as requested)
        tight: '48px',    // Tight vertical rhythm
        loose: '96px',    // Loose vertical rhythm
      },
    },
    container: {
      prose: '65ch',    // Content width optimized for reading
      page: '1200px',   // Page container width
      grid: '1120px',   // Grid container width (matches grid max-width)
      full: '100%',     // Full width container
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
      shadow: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.04)',  // Using elevation.sm
      borderWidth: '1px',  // Using hairline border
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
      borderWidth: '1px',  // Using hairline border instead of 2px
      connectorHeight: '1px',
    },
    toast: {
      borderRadius: '0.5rem',
      padding: '1rem',
      shadow: '0 8px 16px 0 rgb(0 0 0 / 0.06), 0 12px 24px 0 rgb(0 0 0 / 0.08)',  // Using elevation.lg
      maxWidth: '20rem',
    },
  },
};