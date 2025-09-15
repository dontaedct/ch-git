/**
 * @fileoverview Brand Inheritance and Override Service
 * @module lib/brand/brand-inheritance-service
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.3: Brand Inheritance and Override System Implementation
 * Service for managing brand inheritance from presets and client-specific overrides.
 */

import { BrandConfig, BrandPreset, BrandOverrides, BrandInheritance, BrandContext, BrandMergeStrategy, BrandValidationResult, BrandConfigService } from '@/types/brand-config';
import { MicroAppConfig } from '@/types/config';

/**
 * Brand inheritance service implementation
 */
export class BrandInheritanceService implements BrandConfigService {
  private brandCache = new Map<string, BrandConfig>();
  private presetCache = new Map<string, BrandPreset>();
  private appliedBrands = new Set<string>();

  constructor() {
    this.initializeDefaultPresets();
  }

  /**
   * Initialize default brand presets
   */
  private initializeDefaultPresets(): void {
    const defaultPresets: BrandPreset[] = [
      {
        id: 'modern-minimal',
        name: 'Modern Minimal',
        description: 'Clean, minimal design with subtle colors and modern typography',
        baseConfig: {
          colors: {
            primary: '#007AFF',
            secondary: '#5856D6',
            accent: '#FF9500',
            neutral: {
              50: '#f9fafb',
              100: '#f3f4f6',
              200: '#e5e7eb',
              300: '#d1d5db',
              400: '#9ca3af',
              500: '#6b7280',
              600: '#4b5563',
              700: '#374151',
              800: '#1f2937',
              900: '#111827'
            }
          },
          typography: {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeights: {
              light: 300,
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            },
            scales: {
              display: '2.5rem',
              headline: '1.5rem',
              body: '1rem',
              caption: '0.875rem'
            }
          },
          layout: {
            radii: {
              sm: '4px',
              md: '8px',
              lg: '12px'
            },
            shadows: {
              sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }
          },
          motion: {
            duration: '150ms',
            easing: 'cubic-bezier(.2,.8,.2,1)'
          }
        },
        metadata: {
          industry: 'general',
          style: 'minimal',
          colorScheme: 'duotone',
          maturity: 'established',
          audience: ['professionals', 'businesses'],
          keywords: ['modern', 'minimal', 'clean', 'professional']
        },
        category: 'style'
      },
      {
        id: 'healthcare-professional',
        name: 'Healthcare Professional',
        description: 'Trustworthy design with calming colors for healthcare applications',
        baseConfig: {
          colors: {
            primary: '#2563eb',
            secondary: '#059669',
            accent: '#dc2626',
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
            }
          },
          typography: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeights: {
              light: 300,
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            }
          },
          layout: {
            radii: {
              sm: '6px',
              md: '10px',
              lg: '16px'
            }
          }
        },
        metadata: {
          industry: 'healthcare',
          style: 'classic',
          colorScheme: 'duotone',
          maturity: 'established',
          audience: ['healthcare professionals', 'patients'],
          keywords: ['healthcare', 'medical', 'trustworthy', 'professional']
        },
        category: 'industry'
      },
      {
        id: 'creative-agency',
        name: 'Creative Agency',
        description: 'Bold, vibrant design for creative agencies and design studios',
        baseConfig: {
          colors: {
            primary: '#8b5cf6',
            secondary: '#f59e0b',
            accent: '#ef4444',
            neutral: {
              50: '#fafafa',
              100: '#f4f4f5',
              200: '#e4e4e7',
              300: '#d4d4d8',
              400: '#a1a1aa',
              500: '#71717a',
              600: '#52525b',
              700: '#3f3f46',
              800: '#27272a',
              900: '#18181b'
            }
          },
          typography: {
            fontFamily: 'Poppins, system-ui, sans-serif',
            fontWeights: {
              light: 300,
              normal: 400,
              medium: 500,
              semibold: 600,
              bold: 700
            }
          },
          layout: {
            radii: {
              sm: '8px',
              md: '12px',
              lg: '20px'
            }
          }
        },
        metadata: {
          industry: 'creative',
          style: 'bold',
          colorScheme: 'multicolor',
          maturity: 'growing',
          audience: ['creative professionals', 'agencies'],
          keywords: ['creative', 'bold', 'vibrant', 'innovative']
        },
        category: 'industry'
      }
    ];

    defaultPresets.forEach(preset => {
      this.presetCache.set(preset.id, preset);
    });
  }

  /**
   * Create new brand configuration
   */
  async createBrand(config: Omit<BrandConfig, 'id' | 'timestamps'>): Promise<BrandConfig> {
    const id = this.generateBrandId(config.name);
    const now = new Date().toISOString();
    
    const brandConfig: BrandConfig = {
      ...config,
      id,
      timestamps: {
        createdAt: now,
        updatedAt: now
      }
    };

    // Validate brand configuration
    const validation = await this.validateBrand(brandConfig);
    if (!validation.valid) {
      throw new Error(`Invalid brand configuration: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.brandCache.set(id, brandConfig);
    return brandConfig;
  }

  /**
   * Get brand configuration by ID
   */
  async getBrand(id: string): Promise<BrandConfig | null> {
    return this.brandCache.get(id) || null;
  }

  /**
   * Update brand configuration
   */
  async updateBrand(id: string, updates: Partial<BrandConfig>): Promise<BrandConfig> {
    const existing = this.brandCache.get(id);
    if (!existing) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    const updated: BrandConfig = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      timestamps: {
        ...existing.timestamps,
        updatedAt: new Date().toISOString()
      }
    };

    // Validate updated configuration
    const validation = await this.validateBrand(updated);
    if (!validation.valid) {
      throw new Error(`Invalid brand configuration: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.brandCache.set(id, updated);
    return updated;
  }

  /**
   * Delete brand configuration
   */
  async deleteBrand(id: string): Promise<boolean> {
    const deleted = this.brandCache.delete(id);
    this.appliedBrands.delete(id);
    return deleted;
  }

  /**
   * List all brand configurations
   */
  async listBrands(): Promise<BrandConfig[]> {
    return Array.from(this.brandCache.values());
  }

  /**
   * Get brand preset by ID
   */
  async getPreset(id: string): Promise<BrandPreset | null> {
    return this.presetCache.get(id) || null;
  }

  /**
   * List available brand presets
   */
  async listPresets(): Promise<BrandPreset[]> {
    return Array.from(this.presetCache.values());
  }

  /**
   * Apply brand configuration
   */
  async applyBrand(id: string): Promise<boolean> {
    const brand = await this.getBrand(id);
    if (!brand) {
      return false;
    }

    // Apply brand configuration to the application
    await this.applyBrandToApp(brand);
    this.appliedBrands.add(id);
    
    // Update last applied timestamp
    await this.updateBrand(id, {
      timestamps: {
        ...brand.timestamps,
        lastApplied: new Date().toISOString()
      }
    });

    return true;
  }

  /**
   * Apply brand configuration to the application
   */
  private async applyBrandToApp(brand: BrandConfig): Promise<void> {
    // This would integrate with the existing configuration system
    // For now, we'll store the applied brand in a global state
    
    if (typeof window !== 'undefined') {
      // Client-side application
      (window as any).__appliedBrand = brand;
      
      // Apply CSS custom properties for dynamic theming
      this.applyCSSVariables(brand);
    } else {
      // Server-side application
      (global as any).__appliedBrand = brand;
    }
  }

  /**
   * Apply CSS custom properties for dynamic theming
   */
  private applyCSSVariables(brand: BrandConfig): void {
    const root = document.documentElement;
    const overrides = brand.overrides;

    // Apply color variables
    if (overrides.colors) {
      if (overrides.colors.primary) {
        root.style.setProperty('--color-primary', overrides.colors.primary);
      }
      if (overrides.colors.secondary) {
        root.style.setProperty('--color-secondary', overrides.colors.secondary);
      }
      if (overrides.colors.accent) {
        root.style.setProperty('--color-accent', overrides.colors.accent);
      }
      
      // Apply neutral colors
      if (overrides.colors.neutral) {
        Object.entries(overrides.colors.neutral).forEach(([key, value]) => {
          root.style.setProperty(`--color-neutral-${key}`, value);
        });
      }
    }

    // Apply typography variables
    if (overrides.typography) {
      if (overrides.typography.fontFamily) {
        root.style.setProperty('--font-family', overrides.typography.fontFamily);
      }
      if (overrides.typography.scales) {
        Object.entries(overrides.typography.scales).forEach(([key, value]) => {
          root.style.setProperty(`--font-size-${key}`, value);
        });
      }
    }

    // Apply layout variables
    if (overrides.layout) {
      if (overrides.layout.radii) {
        Object.entries(overrides.layout.radii).forEach(([key, value]) => {
          root.style.setProperty(`--radius-${key}`, value);
        });
      }
      if (overrides.layout.shadows) {
        Object.entries(overrides.layout.shadows).forEach(([key, value]) => {
          root.style.setProperty(`--shadow-${key}`, value);
        });
      }
    }
  }

  /**
   * Validate brand configuration
   */
  async validateBrand(config: BrandConfig): Promise<BrandValidationResult> {
    const errors: any[] = [];
    const warnings: any[] = [];

    // Validate required fields
    if (!config.name || config.name.trim().length === 0) {
      errors.push({
        code: 'MISSING_NAME',
        message: 'Brand name is required',
        path: 'name',
        severity: 'error'
      });
    }

    // Validate color format
    if (config.overrides.colors) {
      const colorFields = ['primary', 'secondary', 'accent'] as const;
      colorFields.forEach(field => {
        const color = config.overrides.colors![field];
        if (color && !this.isValidColor(color)) {
          errors.push({
            code: 'INVALID_COLOR',
            message: `Invalid color format for ${field}: ${color}`,
            path: `overrides.colors.${field}`,
            severity: 'error'
          });
        }
      });
    }

    // Validate font family
    if (config.overrides.typography?.fontFamily) {
      const fontFamily = config.overrides.typography.fontFamily;
      if (fontFamily.length > 100) {
        warnings.push({
          code: 'LONG_FONT_FAMILY',
          message: 'Font family string is very long, consider using shorter names',
          path: 'overrides.typography.fontFamily',
          suggestion: 'Use shorter font family names for better performance'
        });
      }
    }

    // Calculate accessibility score
    const accessibilityScore = this.calculateAccessibilityScore(config);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      accessibilityScore
    };
  }

  /**
   * Check if color format is valid
   */
  private isValidColor(color: string): boolean {
    // Check for hex colors
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
      return true;
    }
    
    // Check for rgb/rgba colors
    if (/^rgb\(|^rgba\(/.test(color)) {
      return true;
    }
    
    // Check for hsl/hsla colors
    if (/^hsl\(|^hsla\(/.test(color)) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate accessibility score for brand configuration
   */
  private calculateAccessibilityScore(config: BrandConfig): number {
    let score = 100;

    // Check color contrast if colors are defined
    if (config.overrides.colors?.primary && config.overrides.colors?.neutral?.[900]) {
      const contrast = this.calculateContrast(
        config.overrides.colors.primary,
        config.overrides.colors.neutral[900]
      );
      
      if (contrast < 4.5) {
        score -= 20; // Poor contrast
      } else if (contrast < 7) {
        score -= 10; // Acceptable contrast
      }
    }

    return Math.max(0, score);
  }

  /**
   * Calculate color contrast ratio
   */
  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder value
  }

  /**
   * Merge brand configurations
   */
  mergeBrands(base: BrandConfig, override: Partial<BrandOverrides>): BrandConfig {
    const mergedOverrides = this.deepMerge(base.overrides, override);
    
    return {
      ...base,
      overrides: mergedOverrides,
      timestamps: {
        ...base.timestamps,
        updatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Deep merge objects
   */
  private deepMerge(target: any, source: any): any {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Export brand configuration
   */
  async exportBrand(id: string): Promise<string> {
    const brand = await this.getBrand(id);
    if (!brand) {
      throw new Error(`Brand with ID ${id} not found`);
    }

    return JSON.stringify(brand, null, 2);
  }

  /**
   * Import brand configuration
   */
  async importBrand(config: string): Promise<BrandConfig> {
    try {
      const parsed = JSON.parse(config);
      return await this.createBrand(parsed);
    } catch (error) {
      throw new Error(`Invalid brand configuration format: ${error}`);
    }
  }

  /**
   * Generate unique brand ID
   */
  private generateBrandId(name: string): string {
    const timestamp = Date.now().toString(36);
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `brand-${nameSlug}-${timestamp}`;
  }

  /**
   * Get brand inheritance context
   */
  async getBrandContext(brandId: string): Promise<BrandContext | null> {
    const brand = await this.getBrand(brandId);
    if (!brand) {
      return null;
    }

    const preset = brand.basePreset ? await this.getPreset(brand.basePreset) : null;
    if (!preset) {
      throw new Error(`Base preset ${brand.basePreset} not found`);
    }

    return {
      brand,
      preset,
      environment: this.getEnvironmentOverrides(),
      client: brand.overrides,
      strategy: 'deep'
    };
  }

  /**
   * Get environment overrides
   */
  private getEnvironmentOverrides(): Partial<BrandOverrides> {
    return {
      colors: {
        primary: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR,
        secondary: process.env.NEXT_PUBLIC_BRAND_SECONDARY_COLOR,
        accent: process.env.NEXT_PUBLIC_BRAND_ACCENT_COLOR
      },
      typography: {
        fontFamily: process.env.NEXT_PUBLIC_BRAND_FONT_FAMILY
      }
    };
  }
}

// Export singleton instance
export const brandInheritanceService = new BrandInheritanceService();
