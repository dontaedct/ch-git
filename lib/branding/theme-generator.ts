/**
 * Dynamic Theme Generation System
 *
 * Advanced system for generating dynamic themes, CSS variables, and design tokens
 * from client branding configurations with support for accessibility and responsiveness.
 */

import type { ClientBranding, ColorPalette, Typography } from './white-label-manager';

export interface GeneratedTheme {
  id: string;
  name: string;
  css_variables: Record<string, string>;
  tailwind_config: Record<string, any>;
  design_tokens: DesignTokens;
  accessibility_config: AccessibilityConfig;
  responsive_config: ResponsiveConfig;
  generated_at: string;
}

export interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
  };
  typography: {
    font_families: Record<string, string>;
    font_sizes: Record<string, string>;
    font_weights: Record<string, number>;
    line_heights: Record<string, string>;
    letter_spacing: Record<string, string>;
  };
  spacing: Record<string, string>;
  shadows: Record<string, string>;
  borders: {
    radius: Record<string, string>;
    width: Record<string, string>;
  };
  animations: Record<string, string>;
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
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
}

export interface AccessibilityConfig {
  contrast_ratios: Record<string, number>;
  focus_indicators: Record<string, string>;
  color_blind_safe: boolean;
  high_contrast_mode: Record<string, string>;
  reduced_motion: Record<string, string>;
}

export interface ResponsiveConfig {
  breakpoints: Record<string, string>;
  container_sizes: Record<string, string>;
  fluid_typography: Record<string, string>;
  spacing_scales: Record<string, Record<string, string>>;
}

export interface ThemeValidation {
  is_accessible: boolean;
  contrast_issues: string[];
  readability_score: number;
  color_harmony_score: number;
  recommendations: string[];
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  base_colors: Pick<ColorPalette, 'primary' | 'secondary' | 'accent'>;
  style: 'minimal' | 'modern' | 'classic' | 'bold' | 'elegant';
  industry: string;
}

/**
 * Dynamic Theme Generator
 * Generates comprehensive themes from branding configurations
 */
export class ThemeGenerator {
  private presets: Map<string, ThemePreset> = new Map();

  constructor() {
    this.initializePresets();
  }

  /**
   * Generate complete theme from branding configuration
   */
  generateTheme(branding: ClientBranding, options?: {
    includeAnimations?: boolean;
    generateResponsive?: boolean;
    optimizeForAccessibility?: boolean;
    customProperties?: Record<string, string>;
  }): GeneratedTheme {
    const opts = {
      includeAnimations: true,
      generateResponsive: true,
      optimizeForAccessibility: true,
      ...options
    };

    const colorScales = this.generateColorScales(branding.color_palette);
    const designTokens = this.generateDesignTokens(branding, colorScales, opts);
    const cssVariables = this.generateCSSVariables(designTokens, branding);
    const tailwindConfig = this.generateTailwindConfig(designTokens, branding);
    const accessibilityConfig = this.generateAccessibilityConfig(branding, colorScales);
    const responsiveConfig = this.generateResponsiveConfig(branding);

    return {
      id: `theme-${branding.id}`,
      name: `${branding.company_name} Theme`,
      css_variables: cssVariables,
      tailwind_config: tailwindConfig,
      design_tokens: designTokens,
      accessibility_config: accessibilityConfig,
      responsive_config: responsiveConfig,
      generated_at: new Date().toISOString()
    };
  }

  /**
   * Generate color scales from base colors
   */
  private generateColorScales(palette: ColorPalette): Record<string, ColorScale> {
    return {
      primary: this.generateColorScale(palette.primary),
      secondary: this.generateColorScale(palette.secondary),
      accent: this.generateColorScale(palette.accent),
      neutral: this.generateColorScale(palette.neutral),
      success: this.generateColorScale(palette.success),
      warning: this.generateColorScale(palette.warning),
      error: this.generateColorScale(palette.error),
      info: this.generateColorScale(palette.info)
    };
  }

  /**
   * Generate complete color scale from base color
   */
  private generateColorScale(baseColor: string): ColorScale {
    const hsl = this.hexToHsl(baseColor);

    return {
      50: this.hslToHex(hsl.h, Math.max(0, hsl.s - 30), Math.min(100, hsl.l + 45)),
      100: this.hslToHex(hsl.h, Math.max(0, hsl.s - 20), Math.min(100, hsl.l + 35)),
      200: this.hslToHex(hsl.h, Math.max(0, hsl.s - 10), Math.min(100, hsl.l + 25)),
      300: this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 15)),
      400: this.hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 5)),
      500: baseColor, // Base color
      600: this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 5)),
      700: this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 15)),
      800: this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 25)),
      900: this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 35)),
      950: this.hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 45))
    };
  }

  /**
   * Generate comprehensive design tokens
   */
  private generateDesignTokens(
    branding: ClientBranding,
    colorScales: Record<string, ColorScale>,
    options: any
  ): DesignTokens {
    return {
      colors: {
        primary: colorScales.primary,
        secondary: colorScales.secondary,
        accent: colorScales.accent,
        neutral: colorScales.neutral,
        semantic: {
          success: colorScales.success,
          warning: colorScales.warning,
          error: colorScales.error,
          info: colorScales.info
        }
      },
      typography: {
        font_families: {
          primary: branding.typography.primary_font_family,
          secondary: branding.typography.secondary_font_family,
          mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
        },
        font_sizes: branding.typography.font_sizes,
        font_weights: {
          thin: 100,
          light: 300,
          normal: branding.typography.body_font_weight,
          medium: 500,
          semibold: 600,
          bold: branding.typography.heading_font_weight,
          extrabold: 800,
          black: 900
        },
        line_heights: branding.typography.line_heights,
        letter_spacing: {
          tighter: '-0.05em',
          tight: '-0.025em',
          normal: '0em',
          wide: '0.025em',
          wider: '0.05em',
          widest: '0.1em'
        }
      },
      spacing: this.generateSpacingScale(),
      shadows: this.generateShadowScale(colorScales.neutral),
      borders: {
        radius: {
          none: '0px',
          sm: '0.125rem',
          default: '0.25rem',
          md: '0.375rem',
          lg: '0.5rem',
          xl: '0.75rem',
          '2xl': '1rem',
          '3xl': '1.5rem',
          full: '9999px'
        },
        width: {
          0: '0px',
          1: '1px',
          2: '2px',
          4: '4px',
          8: '8px'
        }
      },
      animations: options.includeAnimations ? this.generateAnimations() : {}
    };
  }

  /**
   * Generate CSS variables from design tokens
   */
  private generateCSSVariables(tokens: DesignTokens, branding: ClientBranding): Record<string, string> {
    const variables: Record<string, string> = {};

    // Color variables
    Object.entries(tokens.colors).forEach(([colorName, colorData]) => {
      if (colorName === 'semantic') {
        Object.entries(colorData).forEach(([semanticName, semanticScale]) => {
          Object.entries(semanticScale).forEach(([shade, value]) => {
            variables[`--color-${semanticName}-${shade}`] = value;
          });
        });
      } else {
        Object.entries(colorData as ColorScale).forEach(([shade, value]) => {
          variables[`--color-${colorName}-${shade}`] = value;
        });
      }
    });

    // Typography variables
    Object.entries(tokens.typography.font_families).forEach(([name, value]) => {
      variables[`--font-${name}`] = value;
    });

    Object.entries(tokens.typography.font_sizes).forEach(([name, value]) => {
      variables[`--text-${name}`] = value;
    });

    Object.entries(tokens.typography.font_weights).forEach(([name, value]) => {
      variables[`--font-weight-${name}`] = value.toString();
    });

    Object.entries(tokens.typography.line_heights).forEach(([name, value]) => {
      variables[`--leading-${name}`] = value;
    });

    // Spacing variables
    Object.entries(tokens.spacing).forEach(([name, value]) => {
      variables[`--spacing-${name}`] = value;
    });

    // Shadow variables
    Object.entries(tokens.shadows).forEach(([name, value]) => {
      variables[`--shadow-${name}`] = value;
    });

    // Border variables
    Object.entries(tokens.borders.radius).forEach(([name, value]) => {
      variables[`--radius-${name}`] = value;
    });

    // Brand-specific variables
    variables['--brand-company-name'] = `"${branding.company_name}"`;
    if (branding.company_tagline) {
      variables['--brand-tagline'] = `"${branding.company_tagline}"`;
    }

    return variables;
  }

  /**
   * Generate Tailwind CSS configuration
   */
  private generateTailwindConfig(tokens: DesignTokens, branding: ClientBranding): Record<string, any> {
    return {
      theme: {
        extend: {
          colors: {
            primary: this.colorScaleToTailwind(tokens.colors.primary),
            secondary: this.colorScaleToTailwind(tokens.colors.secondary),
            accent: this.colorScaleToTailwind(tokens.colors.accent),
            neutral: this.colorScaleToTailwind(tokens.colors.neutral),
            success: this.colorScaleToTailwind(tokens.colors.semantic.success),
            warning: this.colorScaleToTailwind(tokens.colors.semantic.warning),
            error: this.colorScaleToTailwind(tokens.colors.semantic.error),
            info: this.colorScaleToTailwind(tokens.colors.semantic.info)
          },
          fontFamily: {
            primary: [tokens.typography.font_families.primary, 'sans-serif'],
            secondary: [tokens.typography.font_families.secondary, 'serif'],
            mono: [tokens.typography.font_families.mono, 'monospace']
          },
          fontSize: tokens.typography.font_sizes,
          fontWeight: tokens.typography.font_weights,
          lineHeight: tokens.typography.line_heights,
          spacing: tokens.spacing,
          borderRadius: tokens.borders.radius,
          boxShadow: tokens.shadows
        }
      }
    };
  }

  /**
   * Generate accessibility configuration
   */
  private generateAccessibilityConfig(
    branding: ClientBranding,
    colorScales: Record<string, ColorScale>
  ): AccessibilityConfig {
    const contrastRatios: Record<string, number> = {};

    // Calculate contrast ratios for all color combinations
    Object.entries(colorScales).forEach(([colorName, scale]) => {
      Object.entries(scale).forEach(([shade, color]) => {
        const contrastWithWhite = this.calculateContrastRatio(color, '#FFFFFF');
        const contrastWithBlack = this.calculateContrastRatio(color, '#000000');

        contrastRatios[`${colorName}-${shade}-white`] = contrastWithWhite;
        contrastRatios[`${colorName}-${shade}-black`] = contrastWithBlack;
      });
    });

    return {
      contrast_ratios: contrastRatios,
      focus_indicators: {
        'focus-ring': `0 0 0 2px ${branding.color_palette.primary}`,
        'focus-outline': `2px solid ${branding.color_palette.primary}`,
        'focus-offset': '2px'
      },
      color_blind_safe: this.validateColorBlindSafety(branding.color_palette),
      high_contrast_mode: {
        'bg-primary': '#000000',
        'text-primary': '#FFFFFF',
        'border-primary': '#FFFFFF'
      },
      reduced_motion: {
        'transition-none': 'none',
        'animate-none': 'none'
      }
    };
  }

  /**
   * Generate responsive configuration
   */
  private generateResponsiveConfig(branding: ClientBranding): ResponsiveConfig {
    return {
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      container_sizes: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      fluid_typography: {
        'text-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'text-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'text-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'text-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'text-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)'
      },
      spacing_scales: {
        mobile: this.generateSpacingScale(0.8),
        tablet: this.generateSpacingScale(0.9),
        desktop: this.generateSpacingScale(1.0)
      }
    };
  }

  /**
   * Validate theme for accessibility and design quality
   */
  validateTheme(theme: GeneratedTheme): ThemeValidation {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let readabilityScore = 100;
    let colorHarmonyScore = 100;

    // Check contrast ratios
    Object.entries(theme.accessibility_config.contrast_ratios).forEach(([key, ratio]) => {
      if (key.includes('white') && ratio < 4.5) {
        issues.push(`Low contrast ratio for ${key}: ${ratio.toFixed(2)}`);
        readabilityScore -= 10;
      }
    });

    // Check color blind safety
    if (!theme.accessibility_config.color_blind_safe) {
      issues.push('Color palette may not be safe for color blind users');
      readabilityScore -= 15;
    }

    // Color harmony validation
    const primaryHsl = this.hexToHsl(theme.design_tokens.colors.primary[500]);
    const secondaryHsl = this.hexToHsl(theme.design_tokens.colors.secondary[500]);
    const accentHsl = this.hexToHsl(theme.design_tokens.colors.accent[500]);

    const harmonyScore = this.calculateColorHarmony(primaryHsl, secondaryHsl, accentHsl);
    if (harmonyScore < 70) {
      colorHarmonyScore = harmonyScore;
      recommendations.push('Consider adjusting color relationships for better harmony');
    }

    // Accessibility recommendations
    if (readabilityScore < 90) {
      recommendations.push('Improve color contrast for better accessibility');
    }

    if (Object.keys(theme.design_tokens.animations).length === 0) {
      recommendations.push('Consider adding subtle animations for better user experience');
    }

    return {
      is_accessible: issues.length === 0 && readabilityScore >= 90,
      contrast_issues: issues,
      readability_score: Math.max(0, readabilityScore),
      color_harmony_score: Math.max(0, colorHarmonyScore),
      recommendations
    };
  }

  /**
   * Generate theme from preset
   */
  generateThemeFromPreset(presetId: string, branding: Partial<ClientBranding>): GeneratedTheme {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`);
    }

    const mockBranding: ClientBranding = {
      id: 'preset-theme',
      client_id: 'preset',
      template_id: 'preset',
      company_name: branding.company_name || 'Company Name',
      logo_primary: null,
      favicon: null,
      color_palette: {
        primary: preset.base_colors.primary,
        secondary: preset.base_colors.secondary,
        accent: preset.base_colors.accent,
        neutral: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        background: '#FFFFFF',
        surface: '#F9FAFB',
        text_primary: '#111827',
        text_secondary: '#6B7280',
        border: '#E5E7EB'
      },
      typography: {
        primary_font_family: 'Inter, sans-serif',
        secondary_font_family: 'Georgia, serif',
        heading_font_weight: 600,
        body_font_weight: 400,
        font_sizes: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem',
          '5xl': '3rem'
        },
        line_heights: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      social_links: {},
      white_label_config: {
        hide_powered_by: false,
        hide_company_branding: false,
        ssl_enabled: true,
        allowed_customizations: {
          colors: true,
          fonts: true,
          logos: true,
          content: true,
          layout: false,
          css: false
        },
        prohibited_content: [],
        required_disclaimers: [],
        third_party_integrations: [],
        gdpr_compliance: false,
        ccpa_compliance: false,
        accessibility_compliance: false
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: false,
      version: '1.0.0',
      ...branding
    };

    return this.generateTheme(mockBranding);
  }

  /**
   * Export theme as CSS file
   */
  exportThemeAsCSS(theme: GeneratedTheme): string {
    let css = `:root {\n`;

    Object.entries(theme.css_variables).forEach(([property, value]) => {
      css += `  ${property}: ${value};\n`;
    });

    css += `}\n\n`;

    // Add utility classes
    css += this.generateUtilityClasses(theme);

    // Add accessibility styles
    css += this.generateAccessibilityStyles(theme);

    // Add responsive styles
    css += this.generateResponsiveStyles(theme);

    return css;
  }

  // Helper methods

  private generateSpacingScale(multiplier: number = 1): Record<string, string> {
    const base = 0.25 * multiplier; // 1 unit = 0.25rem

    return {
      0: '0px',
      px: '1px',
      0.5: `${base * 0.5}rem`,
      1: `${base}rem`,
      1.5: `${base * 1.5}rem`,
      2: `${base * 2}rem`,
      2.5: `${base * 2.5}rem`,
      3: `${base * 3}rem`,
      3.5: `${base * 3.5}rem`,
      4: `${base * 4}rem`,
      5: `${base * 5}rem`,
      6: `${base * 6}rem`,
      7: `${base * 7}rem`,
      8: `${base * 8}rem`,
      9: `${base * 9}rem`,
      10: `${base * 10}rem`,
      11: `${base * 11}rem`,
      12: `${base * 12}rem`,
      14: `${base * 14}rem`,
      16: `${base * 16}rem`,
      20: `${base * 20}rem`,
      24: `${base * 24}rem`,
      28: `${base * 28}rem`,
      32: `${base * 32}rem`,
      36: `${base * 36}rem`,
      40: `${base * 40}rem`,
      44: `${base * 44}rem`,
      48: `${base * 48}rem`,
      52: `${base * 52}rem`,
      56: `${base * 56}rem`,
      60: `${base * 60}rem`,
      64: `${base * 64}rem`,
      72: `${base * 72}rem`,
      80: `${base * 80}rem`,
      96: `${base * 96}rem`
    };
  }

  private generateShadowScale(neutralScale: ColorScale): Record<string, string> {
    return {
      sm: `0 1px 2px 0 ${neutralScale[900]}1A`,
      default: `0 1px 3px 0 ${neutralScale[900]}1A, 0 1px 2px -1px ${neutralScale[900]}1A`,
      md: `0 4px 6px -1px ${neutralScale[900]}1A, 0 2px 4px -2px ${neutralScale[900]}1A`,
      lg: `0 10px 15px -3px ${neutralScale[900]}1A, 0 4px 6px -4px ${neutralScale[900]}1A`,
      xl: `0 20px 25px -5px ${neutralScale[900]}1A, 0 8px 10px -6px ${neutralScale[900]}1A`,
      '2xl': `0 25px 50px -12px ${neutralScale[900]}40`,
      inner: `inset 0 2px 4px 0 ${neutralScale[900]}0D`,
      none: '0 0 #0000'
    };
  }

  private generateAnimations(): Record<string, string> {
    return {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'fade-out': 'fadeOut 0.5s ease-in-out',
      'slide-up': 'slideUp 0.3s ease-out',
      'slide-down': 'slideDown 0.3s ease-out',
      'bounce': 'bounce 1s infinite',
      'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
    };
  }

  private colorScaleToTailwind(scale: ColorScale): Record<string, string> {
    return {
      50: scale[50],
      100: scale[100],
      200: scale[200],
      300: scale[300],
      400: scale[400],
      500: scale[500],
      600: scale[600],
      700: scale[700],
      800: scale[800],
      900: scale[900],
      950: scale[950]
    };
  }

  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number = 0;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToHex(h: number, s: number, l: number): string {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1/6) {
      r = c; g = x; b = 0;
    } else if (1/6 <= h && h < 2/6) {
      r = x; g = c; b = 0;
    } else if (2/6 <= h && h < 3/6) {
      r = 0; g = c; b = x;
    } else if (3/6 <= h && h < 4/6) {
      r = 0; g = x; b = c;
    } else if (4/6 <= h && h < 5/6) {
      r = x; g = 0; b = c;
    } else if (5/6 <= h && h < 1) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  private calculateContrastRatio(color1: string, color2: string): number {
    const luminance1 = this.calculateLuminance(color1);
    const luminance2 = this.calculateLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  private calculateLuminance(hex: string): number {
    const rgb = {
      r: parseInt(hex.slice(1, 3), 16) / 255,
      g: parseInt(hex.slice(3, 5), 16) / 255,
      b: parseInt(hex.slice(5, 7), 16) / 255
    };

    Object.keys(rgb).forEach((key) => {
      const value = rgb[key as keyof typeof rgb];
      rgb[key as keyof typeof rgb] = value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  }

  private validateColorBlindSafety(palette: ColorPalette): boolean {
    // Simplified validation - in production, use specialized libraries
    const colors = [palette.primary, palette.secondary, palette.accent];

    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const contrast = this.calculateContrastRatio(colors[i], colors[j]);
        if (contrast < 3) {
          return false;
        }
      }
    }

    return true;
  }

  private calculateColorHarmony(
    primary: { h: number; s: number; l: number },
    secondary: { h: number; s: number; l: number },
    accent: { h: number; s: number; l: number }
  ): number {
    // Calculate harmony based on color theory rules
    const hDiff1 = Math.abs(primary.h - secondary.h);
    const hDiff2 = Math.abs(primary.h - accent.h);
    const hDiff3 = Math.abs(secondary.h - accent.h);

    // Check for complementary (180°), triadic (120°), or analogous (30°) relationships
    const isComplementary = Math.abs(hDiff1 - 180) < 30 || Math.abs(hDiff2 - 180) < 30 || Math.abs(hDiff3 - 180) < 30;
    const isTriadic = Math.abs(hDiff1 - 120) < 20 && Math.abs(hDiff2 - 120) < 20;
    const isAnalogous = hDiff1 < 60 && hDiff2 < 60 && hDiff3 < 60;

    if (isComplementary || isTriadic) return 95;
    if (isAnalogous) return 85;

    // Default harmony score based on contrast
    const avgContrast = (hDiff1 + hDiff2 + hDiff3) / 3;
    return Math.min(100, 50 + avgContrast / 2);
  }

  private generateUtilityClasses(theme: GeneratedTheme): string {
    let css = '/* Utility Classes */\n';

    // Color utilities
    Object.entries(theme.design_tokens.colors).forEach(([colorName, colorData]) => {
      if (colorName !== 'semantic') {
        Object.entries(colorData as ColorScale).forEach(([shade, value]) => {
          css += `.text-${colorName}-${shade} { color: ${value}; }\n`;
          css += `.bg-${colorName}-${shade} { background-color: ${value}; }\n`;
          css += `.border-${colorName}-${shade} { border-color: ${value}; }\n`;
        });
      }
    });

    return css + '\n';
  }

  private generateAccessibilityStyles(theme: GeneratedTheme): string {
    return `
/* Accessibility Styles */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-high-contrast: high) {
  :root {
    --color-background: #000000;
    --color-text-primary: #ffffff;
    --color-border: #ffffff;
  }
}

.focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}

`;
  }

  private generateResponsiveStyles(theme: GeneratedTheme): string {
    let css = '/* Responsive Styles */\n';

    Object.entries(theme.responsive_config.breakpoints).forEach(([name, size]) => {
      css += `@media (min-width: ${size}) {\n`;
      css += `  .container { max-width: ${theme.responsive_config.container_sizes[name]}; }\n`;
      css += `}\n\n`;
    });

    return css;
  }

  private initializePresets(): void {
    const presets: ThemePreset[] = [
      {
        id: 'minimal-modern',
        name: 'Minimal Modern',
        description: 'Clean, minimal design with modern typography',
        base_colors: {
          primary: '#000000',
          secondary: '#6B7280',
          accent: '#3B82F6'
        },
        style: 'minimal',
        industry: 'universal'
      },
      {
        id: 'vibrant-tech',
        name: 'Vibrant Tech',
        description: 'Bold, energetic design for tech companies',
        base_colors: {
          primary: '#8B5CF6',
          secondary: '#06B6D4',
          accent: '#F59E0B'
        },
        style: 'bold',
        industry: 'tech-saas'
      },
      {
        id: 'professional-blue',
        name: 'Professional Blue',
        description: 'Classic professional theme with blue tones',
        base_colors: {
          primary: '#1E40AF',
          secondary: '#64748B',
          accent: '#0EA5E9'
        },
        style: 'classic',
        industry: 'professional-services'
      },
      {
        id: 'healthcare-calm',
        name: 'Healthcare Calm',
        description: 'Soothing, trustworthy design for healthcare',
        base_colors: {
          primary: '#10B981',
          secondary: '#6B7280',
          accent: '#06B6D4'
        },
        style: 'elegant',
        industry: 'healthcare'
      }
    ];

    presets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }
}

/**
 * Default theme generator instance
 */
export const themeGenerator = new ThemeGenerator();

/**
 * Convenience functions for theme generation
 */
export const dynamicThemes = {
  generate: (branding: ClientBranding, options?: any) => themeGenerator.generateTheme(branding, options),
  generateFromPreset: (presetId: string, branding: Partial<ClientBranding>) =>
    themeGenerator.generateThemeFromPreset(presetId, branding),
  validate: (theme: GeneratedTheme) => themeGenerator.validateTheme(theme),
  exportCSS: (theme: GeneratedTheme) => themeGenerator.exportThemeAsCSS(theme)
};