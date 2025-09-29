/**
 * @fileoverview Theme Engine for Agency Toolkit
 * Phase 4.1: Theme application system with CSS custom properties generation
 */

// Theme Configuration Interface
export interface ThemeConfig {
  id: string;
  name: string;
  client: string;
  colors: ColorPalette;
  typography: Typography;
  spacing: SpacingConfig;
  borders: BorderConfig;
  shadows: ShadowConfig;
  animations: AnimationConfig;
  lastModified: string;
  isActive: boolean;
  accessibility: AccessibilityConfig;
}

// Enhanced Color Palette Interface
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  muted: string;
  border: string;
  input: string;
  ring: string;
  neutral: {
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
  };
}

// Enhanced Typography Interface
export interface Typography {
  fontPrimary: string;
  fontSecondary: string;
  fontMono: string;
  headingScale: number;
  bodySize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// Enhanced Spacing Configuration
export interface SpacingConfig {
  base: number;
  scale: number;
  containerMaxWidth: number;
  sectionPadding: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

// Enhanced Border Configuration
export interface BorderConfig {
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  width: {
    none: number;
    thin: number;
    medium: number;
    thick: number;
  };
  style: 'solid' | 'dashed' | 'dotted' | 'double';
}

// Enhanced Shadow Configuration
export interface ShadowConfig {
  elevation: number;
  blur: number;
  spread: number;
  opacity: number;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  inner: string;
}

// Animation Configuration
export interface AnimationConfig {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
  transitions: {
    colors: string;
    transform: string;
    opacity: string;
  };
}

// Accessibility Configuration
export interface AccessibilityConfig {
  contrastRatio: {
    primary: number;
    secondary: number;
    text: number;
  };
  focusRing: {
    width: number;
    color: string;
    offset: number;
  };
  reducedMotion: boolean;
  highContrast: boolean;
}

/**
 * Theme Engine Class
 * Handles theme application, CSS generation, and validation
 */
export class ThemeEngine {
  private currentTheme: ThemeConfig | null = null;
  private appliedThemes: Map<string, ThemeConfig> = new Map();

  /**
   * Apply a theme to the document
   */
  applyTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
    this.appliedThemes.set(theme.id, theme);
    
    // Generate and inject CSS variables
    const cssVariables = this.generateCSSVariables(theme);
    this.injectCSSVariables(cssVariables);
    
    // Apply theme-specific classes
    this.applyThemeClasses(theme);
    
    // Validate accessibility
    this.validateAccessibility(theme);
  }

  /**
   * Generate CSS custom properties from theme configuration
   */
  generateCSSVariables(theme: ThemeConfig): string {
    return `
:root {
  /* Colors */
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
  
  /* Neutral Scale */
  --color-neutral-50: ${theme.colors.neutral[50]};
  --color-neutral-100: ${theme.colors.neutral[100]};
  --color-neutral-200: ${theme.colors.neutral[200]};
  --color-neutral-300: ${theme.colors.neutral[300]};
  --color-neutral-400: ${theme.colors.neutral[400]};
  --color-neutral-500: ${theme.colors.neutral[500]};
  --color-neutral-600: ${theme.colors.neutral[600]};
  --color-neutral-700: ${theme.colors.neutral[700]};
  --color-neutral-800: ${theme.colors.neutral[800]};
  --color-neutral-900: ${theme.colors.neutral[900]};
  
  /* Typography */
  --font-primary: ${theme.typography.fontPrimary};
  --font-secondary: ${theme.typography.fontSecondary};
  --font-mono: ${theme.typography.fontMono};
  --font-size-body: ${theme.typography.bodySize}px;
  --line-height: ${theme.typography.lineHeight};
  --letter-spacing: ${theme.typography.letterSpacing}em;
  
  /* Font Weights */
  --font-weight-light: ${theme.typography.fontWeight.light};
  --font-weight-normal: ${theme.typography.fontWeight.normal};
  --font-weight-medium: ${theme.typography.fontWeight.medium};
  --font-weight-semibold: ${theme.typography.fontWeight.semibold};
  --font-weight-bold: ${theme.typography.fontWeight.bold};
  
  /* Spacing */
  --spacing-xs: ${theme.spacing.xs}px;
  --spacing-sm: ${theme.spacing.sm}px;
  --spacing-md: ${theme.spacing.md}px;
  --spacing-lg: ${theme.spacing.lg}px;
  --spacing-xl: ${theme.spacing.xl}px;
  --spacing-2xl: ${theme.spacing['2xl']}px;
  --spacing-3xl: ${theme.spacing['3xl']}px;
  --spacing-base: ${theme.spacing.base}px;
  --spacing-scale: ${theme.spacing.scale};
  --container-max-width: ${theme.spacing.containerMaxWidth}px;
  --section-padding: ${theme.spacing.sectionPadding}px;
  
  /* Borders */
  --border-radius-none: ${theme.borders.radius.none}px;
  --border-radius-sm: ${theme.borders.radius.sm}px;
  --border-radius-md: ${theme.borders.radius.md}px;
  --border-radius-lg: ${theme.borders.radius.lg}px;
  --border-radius-xl: ${theme.borders.radius.xl}px;
  --border-radius-full: ${theme.borders.radius.full}px;
  
  --border-width-none: ${theme.borders.width.none}px;
  --border-width-thin: ${theme.borders.width.thin}px;
  --border-width-medium: ${theme.borders.width.medium}px;
  --border-width-thick: ${theme.borders.width.thick}px;
  
  --border-style: ${theme.borders.style};
  
  /* Shadows */
  --shadow-sm: ${theme.shadows.sm};
  --shadow-md: ${theme.shadows.md};
  --shadow-lg: ${theme.shadows.lg};
  --shadow-xl: ${theme.shadows.xl};
  --shadow-inner: ${theme.shadows.inner};
  
  /* Animations */
  --duration-fast: ${theme.animations.duration.fast};
  --duration-normal: ${theme.animations.duration.normal};
  --duration-slow: ${theme.animations.duration.slow};
  
  --easing-linear: ${theme.animations.easing.linear};
  --easing-ease: ${theme.animations.easing.ease};
  --easing-ease-in: ${theme.animations.easing.easeIn};
  --easing-ease-out: ${theme.animations.easing.easeOut};
  --easing-ease-in-out: ${theme.animations.easing.easeInOut};
  
  --transition-colors: ${theme.animations.transitions.colors};
  --transition-transform: ${theme.animations.transitions.transform};
  --transition-opacity: ${theme.animations.transitions.opacity};
  
  /* Accessibility */
  --focus-ring-width: ${theme.accessibility.focusRing.width}px;
  --focus-ring-color: ${theme.accessibility.focusRing.color};
  --focus-ring-offset: ${theme.accessibility.focusRing.offset}px;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0ms;
    --duration-normal: 0ms;
    --duration-slow: 0ms;
    --transition-colors: none;
    --transition-transform: none;
    --transition-opacity: none;
  }
}

/* High Contrast Support */
@media (prefers-contrast: high) {
  :root {
    --color-border: var(--color-text);
    --color-muted: var(--color-text);
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: ${this.generateDarkModeColor(theme.colors.background)};
    --color-surface: ${this.generateDarkModeColor(theme.colors.surface)};
    --color-text: ${this.generateDarkModeColor(theme.colors.text)};
    --color-text-secondary: ${this.generateDarkModeColor(theme.colors.textSecondary)};
    --color-border: ${this.generateDarkModeColor(theme.colors.border)};
  }
}
`;
  }

  /**
   * Inject CSS variables into the document
   */
  private injectCSSVariables(css: string): void {
    // Remove existing theme styles
    const existingStyle = document.getElementById('theme-engine-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create and inject new styles
    const style = document.createElement('style');
    style.id = 'theme-engine-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Apply theme-specific classes to the document
   */
  private applyThemeClasses(theme: ThemeConfig): void {
    const body = document.body;
    
    // Remove existing theme classes
    body.classList.remove('theme-corporate-blue', 'theme-modern-purple', 'theme-minimal-green', 'theme-custom');
    
    // Add new theme class
    const themeClass = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}`;
    body.classList.add(themeClass);
    
    // Apply accessibility classes
    if (theme.accessibility.reducedMotion) {
      body.classList.add('reduced-motion');
    } else {
      body.classList.remove('reduced-motion');
    }
    
    if (theme.accessibility.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }
  }

  /**
   * Validate accessibility compliance
   */
  private validateAccessibility(theme: ThemeConfig): void {
    const contrastRatio = this.calculateContrastRatio(theme.colors.primary, theme.colors.background);
    
    if (contrastRatio < 3) {
      console.warn(`Theme "${theme.name}" has insufficient contrast ratio: ${contrastRatio.toFixed(2)}:1`);
    }
    
    if (theme.typography.bodySize < 14) {
      console.warn(`Theme "${theme.name}" has small body font size: ${theme.typography.bodySize}px`);
    }
    
    if (theme.typography.lineHeight < 1.4) {
      console.warn(`Theme "${theme.name}" has low line height: ${theme.typography.lineHeight}`);
    }
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
   * Generate dark mode color variant
   */
  private generateDarkModeColor(color: string): string {
    // Simple dark mode color generation
    // In a real implementation, this would be more sophisticated
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    // Invert the color for dark mode
    const inverted = {
      r: 255 - rgb.r,
      g: 255 - rgb.g,
      b: 255 - rgb.b
    };
    
    return `rgb(${inverted.r}, ${inverted.g}, ${inverted.b})`;
  }

  /**
   * Export theme as CSS file
   */
  exportTheme(theme: ThemeConfig, filename?: string): void {
    const css = this.generateCSSVariables(theme);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `${theme.name.toLowerCase().replace(/\s+/g, '-')}-theme.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }

  /**
   * Get all applied themes
   */
  getAppliedThemes(): Map<string, ThemeConfig> {
    return this.appliedThemes;
  }

  /**
   * Remove theme
   */
  removeTheme(themeId: string): void {
    this.appliedThemes.delete(themeId);
    
    if (this.currentTheme?.id === themeId) {
      this.currentTheme = null;
      // Remove theme styles
      const existingStyle = document.getElementById('theme-engine-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }
}

// Create global theme engine instance
export const themeEngine = new ThemeEngine();

// Export utility functions
export const applyTheme = (theme: ThemeConfig) => themeEngine.applyTheme(theme);
export const exportTheme = (theme: ThemeConfig, filename?: string) => themeEngine.exportTheme(theme, filename);
export const getCurrentTheme = () => themeEngine.getCurrentTheme();
export const removeTheme = (themeId: string) => themeEngine.removeTheme(themeId);
