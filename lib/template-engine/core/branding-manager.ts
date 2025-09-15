/**
 * HT-023.1.1: Branding Manager
 * 
 * Manages client branding and theme application
 * Part of the Template Engine Integration
 */

import { Template, ClientBranding } from './types';

export interface BrandingManagerOptions {
  enableCaching?: boolean;
  cacheSize?: number;
  enableValidation?: boolean;
}

export class BrandingManager {
  private brandings = new Map<string, ClientBranding>();
  private options: BrandingManagerOptions;

  constructor(options: BrandingManagerOptions = {}) {
    this.options = {
      enableCaching: true,
      cacheSize: 100,
      enableValidation: true,
      ...options
    };
  }

  /**
   * Apply branding to template
   */
  async applyBrandingToTemplate(template: Template, branding: ClientBranding): Promise<Template> {
    const brandedTemplate: Template = {
      ...template,
      branding,
      content: this.applyBrandingToContent(template.content, branding),
      metadata: {
        ...template.metadata,
        updatedAt: new Date()
      }
    };

    return brandedTemplate;
  }

  /**
   * Create branding configuration
   */
  createBranding(brandingData: Partial<ClientBranding>): ClientBranding {
    const branding: ClientBranding = {
      id: brandingData.id || this.generateBrandingId(),
      clientId: brandingData.clientId || 'default',
      name: brandingData.name || 'Default Branding',
      colorPalette: brandingData.colorPalette || this.getDefaultColorPalette(),
      typography: brandingData.typography || this.getDefaultTypography(),
      spacing: brandingData.spacing || this.getDefaultSpacing(),
      components: brandingData.components || this.getDefaultComponents(),
      assets: brandingData.assets || this.getDefaultAssets(),
      customCss: brandingData.customCss || ''
    };

    this.brandings.set(branding.id, branding);
    return branding;
  }

  /**
   * Get branding by ID
   */
  getBranding(brandingId: string): ClientBranding | null {
    return this.brandings.get(brandingId) || null;
  }

  /**
   * Update branding
   */
  updateBranding(brandingId: string, updates: Partial<ClientBranding>): ClientBranding {
    const existingBranding = this.brandings.get(brandingId);
    if (!existingBranding) {
      throw new Error(`Branding not found: ${brandingId}`);
    }

    const updatedBranding: ClientBranding = {
      ...existingBranding,
      ...updates
    };

    this.brandings.set(brandingId, updatedBranding);
    return updatedBranding;
  }

  /**
   * Delete branding
   */
  deleteBranding(brandingId: string): boolean {
    return this.brandings.delete(brandingId);
  }

  /**
   * List all brandings
   */
  listBrandings(): ClientBranding[] {
    return Array.from(this.brandings.values());
  }

  /**
   * Get brandings by client ID
   */
  getBrandingsByClient(clientId: string): ClientBranding[] {
    return Array.from(this.brandings.values()).filter(branding =>
      branding.clientId === clientId
    );
  }

  /**
   * Apply branding to content
   */
  private applyBrandingToContent(content: any, branding: ClientBranding): any {
    const brandedContent = JSON.parse(JSON.stringify(content));

    // Apply color palette
    if (brandedContent.styles) {
      this.applyColorPalette(brandedContent.styles, branding.colorPalette);
    }

    // Apply typography
    if (brandedContent.styles) {
      this.applyTypography(brandedContent.styles, branding.typography);
    }

    // Apply spacing
    if (brandedContent.styles) {
      this.applySpacing(brandedContent.styles, branding.spacing);
    }

    // Apply custom CSS
    if (branding.customCss && brandedContent.css) {
      brandedContent.css += '\n' + branding.customCss;
    }

    return brandedContent;
  }

  /**
   * Apply color palette to styles
   */
  private applyColorPalette(styles: any, colorPalette: any): void {
    if (colorPalette.primary) styles['--primary-color'] = colorPalette.primary;
    if (colorPalette.secondary) styles['--secondary-color'] = colorPalette.secondary;
    if (colorPalette.accent) styles['--accent-color'] = colorPalette.accent;
    
    if (colorPalette.neutral) {
      Object.entries(colorPalette.neutral).forEach(([key, value]) => {
        styles[`--neutral-${key}`] = value;
      });
    }

    if (colorPalette.semantic) {
      Object.entries(colorPalette.semantic).forEach(([key, value]) => {
        styles[`--semantic-${key}`] = value;
      });
    }
  }

  /**
   * Apply typography to styles
   */
  private applyTypography(styles: any, typography: any): void {
    if (typography.fontFamily) styles['--font-family'] = typography.fontFamily;
    if (typography.headingFont) styles['--heading-font-family'] = typography.headingFont;
    if (typography.fontSize) styles['--base-font-size'] = typography.fontSize;
    if (typography.lineHeight) styles['--line-height'] = typography.lineHeight;
    if (typography.fontWeight) styles['--font-weight'] = typography.fontWeight;
  }

  /**
   * Apply spacing to styles
   */
  private applySpacing(styles: any, spacing: any): void {
    if (spacing.base) styles['--spacing-base'] = spacing.base;
    if (spacing.small) styles['--spacing-small'] = spacing.small;
    if (spacing.medium) styles['--spacing-medium'] = spacing.medium;
    if (spacing.large) styles['--spacing-large'] = spacing.large;
    if (spacing.xlarge) styles['--spacing-xlarge'] = spacing.xlarge;
  }

  /**
   * Generate unique branding ID
   */
  private generateBrandingId(): string {
    return `branding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default color palette
   */
  private getDefaultColorPalette(): any {
    return {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#06b6d4',
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
        900: '#0f172a'
      },
      semantic: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      }
    };
  }

  /**
   * Get default typography
   */
  private getDefaultTypography(): any {
    return {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingFont: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      lineHeight: '1.5',
      fontWeight: '400'
    };
  }

  /**
   * Get default spacing
   */
  private getDefaultSpacing(): any {
    return {
      scale: {
        px: '1px',
        0: '0px',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
        24: '6rem',
        32: '8rem'
      },
      containerPadding: '1rem',
      sectionSpacing: '2rem'
    };
  }

  /**
   * Get default components
   */
  private getDefaultComponents(): any {
    return {
      button: {
        styles: {
          padding: '0.5rem 1rem',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500'
        }
      },
      input: {
        styles: {
          padding: '0.5rem 0.75rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          fontSize: '0.875rem'
        }
      },
      card: {
        styles: {
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          backgroundColor: '#ffffff'
        }
      }
    };
  }

  /**
   * Get default assets
   */
  private getDefaultAssets(): any {
    return {
      logo: {
        name: 'Default Logo',
        url: '/default-logo.png',
        alt: 'Default Logo'
      },
      images: [],
      fonts: []
    };
  }

  /**
   * Clear all brandings
   */
  clearBrandings(): void {
    this.brandings.clear();
  }

  /**
   * Get branding statistics
   */
  getBrandingStats(): { total: number; byClient: Record<string, number> } {
    const brandings = Array.from(this.brandings.values());
    const byClient: Record<string, number> = {};
    
    brandings.forEach(branding => {
      byClient[branding.clientId] = (byClient[branding.clientId] || 0) + 1;
    });

    return {
      total: brandings.length,
      byClient
    };
  }
}
