/**
 * HT-022.1.2: Client Theme Manager
 * 
 * Manages client themes and brand customization
 * Part of the HT-022 Component System Integration
 */

import { SimpleClientTheme, ClientTheme } from '@/lib/foundation';

export interface ClientThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  logo?: {
    src?: string;
    alt: string;
    initials: string;
  };
  typography?: {
    fontFamily: string;
    headingFamily?: string;
  };
}

export interface ThemeGenerationOptions {
  generateNeutralScale?: boolean;
  generateStateColors?: boolean;
  generateSupportingColors?: boolean;
  preserveAccessibility?: boolean;
}

export class ClientThemeManager {
  private themes = new Map<string, SimpleClientTheme>();
  private activeTheme: string | null = null;

  constructor() {
    this.initializeDefaultThemes();
  }

  /**
   * Load client theme from configuration
   */
  async loadClientTheme(clientId: string): Promise<void> {
    try {
      // In a real implementation, this would fetch from API/database
      const themeConfig = await this.fetchClientThemeConfig(clientId);
      const theme = this.generateClientTheme(themeConfig);
      this.themes.set(clientId, theme);
    } catch (error) {
      console.error(`Failed to load theme for client ${clientId}:`, error);
      // Fallback to default theme
      this.themes.set(clientId, this.getDefaultTheme());
    }
  }

  /**
   * Activate a client theme
   */
  activateTheme(clientId: string): void {
    const theme = this.themes.get(clientId);
    if (!theme) {
      console.warn(`Theme not found for client ${clientId}`);
      return;
    }

    this.activeTheme = clientId;
    this.injectThemeCSS(theme);
    this.updateDocumentTheme(theme);
  }

  /**
   * Get active theme
   */
  getActiveTheme(): SimpleClientTheme | null {
    if (!this.activeTheme) return null;
    return this.themes.get(this.activeTheme) || null;
  }

  /**
   * Get theme by client ID
   */
  getTheme(clientId: string): SimpleClientTheme | null {
    return this.themes.get(clientId) || null;
  }

  /**
   * Generate client theme from minimal input
   */
  generateClientTheme(config: ClientThemeConfig, options: ThemeGenerationOptions = {}): SimpleClientTheme {
    const {
      generateNeutralScale = true,
      generateStateColors = true,
      generateSupportingColors = true,
      preserveAccessibility = true
    } = options;

    // Generate supporting colors
    const supportingColors = generateSupportingColors 
      ? this.generateSupportingColors(config.primary, config.secondary)
      : {
          accent: config.secondary,
          background: '#ffffff',
          foreground: '#000000'
        };

    // Generate state colors
    const stateColors = generateStateColors
      ? this.generateStateColors(config.primary)
      : {
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6'
        };

    return {
      id: config.id,
      name: config.name,
      colors: {
        primary: config.primary,
        secondary: config.secondary,
        accent: supportingColors.accent,
        background: supportingColors.background,
        foreground: supportingColors.foreground,
      },
      logo: config.logo || {
        alt: config.name,
        initials: config.name.substring(0, 2).toUpperCase()
      },
      typography: config.typography || {
        fontFamily: 'Inter, sans-serif'
      },
      createdAt: new Date(),
      isCustom: true
    };
  }

  /**
   * Generate supporting colors from primary and secondary
   */
  private generateSupportingColors(primary: string, secondary: string) {
    // Simple color generation logic
    // In a real implementation, this would use color theory algorithms
    return {
      accent: this.adjustColorBrightness(secondary, 0.2),
      background: '#ffffff',
      foreground: '#000000'
    };
  }

  /**
   * Generate state colors from primary color
   */
  private generateStateColors(primary: string) {
    // Generate accessible state colors
    return {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    };
  }

  /**
   * Generate neutral scale from primary color
   */
  private generateNeutralScale(primary: string) {
    // Generate a neutral scale based on the primary color
    // This is a simplified implementation
    return {
      50: this.adjustColorBrightness(primary, 0.9),
      100: this.adjustColorBrightness(primary, 0.8),
      200: this.adjustColorBrightness(primary, 0.6),
      300: this.adjustColorBrightness(primary, 0.4),
      400: this.adjustColorBrightness(primary, 0.2),
      500: primary,
      600: this.adjustColorBrightness(primary, -0.2),
      700: this.adjustColorBrightness(primary, -0.4),
      800: this.adjustColorBrightness(primary, -0.6),
      900: this.adjustColorBrightness(primary, -0.8),
    };
  }

  /**
   * Adjust color brightness
   */
  private adjustColorBrightness(color: string, amount: number): string {
    // Simple color adjustment - in real implementation would use proper color manipulation
    return color; // Placeholder
  }

  /**
   * Inject theme CSS into document
   */
  private injectThemeCSS(theme: SimpleClientTheme): void {
    const styleId = `client-theme-${theme.id}`;
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
      :root[data-client-theme="${theme.id}"] {
        --primary: ${theme.colors.primary};
        --secondary: ${theme.colors.secondary};
        --accent: ${theme.colors.accent};
        --background: ${theme.colors.background};
        --foreground: ${theme.colors.foreground};
        --font-family: ${theme.typography.fontFamily};
        ${theme.typography.headingFamily ? `--font-family-heading: ${theme.typography.headingFamily};` : ''}
      }
    `;
  }

  /**
   * Update document theme attribute
   */
  private updateDocumentTheme(theme: SimpleClientTheme): void {
    document.documentElement.setAttribute('data-client-theme', theme.id);
  }

  /**
   * Fetch client theme configuration (placeholder)
   */
  private async fetchClientThemeConfig(clientId: string): Promise<ClientThemeConfig> {
    // In a real implementation, this would fetch from API
    return {
      id: clientId,
      name: `Client ${clientId}`,
      primary: '#3b82f6',
      secondary: '#1e40af',
      logo: {
        alt: `Client ${clientId} Logo`,
        initials: clientId.substring(0, 2).toUpperCase()
      }
    };
  }

  /**
   * Initialize default themes
   */
  private initializeDefaultThemes(): void {
    const defaultTheme: SimpleClientTheme = {
      id: 'default',
      name: 'Default Theme',
      colors: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        accent: '#06b6d4',
        background: '#ffffff',
        foreground: '#000000'
      },
      logo: {
        alt: 'Default Logo',
        initials: 'DF'
      },
      typography: {
        fontFamily: 'Inter, sans-serif'
      },
      createdAt: new Date(),
      isCustom: false
    };

    this.themes.set('default', defaultTheme);
  }

  /**
   * Get default theme
   */
  private getDefaultTheme(): SimpleClientTheme {
    return this.themes.get('default')!;
  }

  /**
   * List all available themes
   */
  listThemes(): SimpleClientTheme[] {
    return Array.from(this.themes.values());
  }

  /**
   * Remove theme
   */
  removeTheme(clientId: string): void {
    this.themes.delete(clientId);
    if (this.activeTheme === clientId) {
      this.activeTheme = null;
    }
  }

  /**
   * Clear all themes
   */
  clearThemes(): void {
    this.themes.clear();
    this.activeTheme = null;
  }
}
