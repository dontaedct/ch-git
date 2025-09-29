/**
 * White-Labeling Management System
 *
 * Comprehensive system for managing client branding, white-labeling configurations,
 * and brand asset management for the universal consultation template.
 */

export interface BrandAsset {
  id: string;
  type: 'logo' | 'favicon' | 'banner' | 'background' | 'icon';
  name: string;
  url: string;
  alt_text?: string;
  dimensions: {
    width: number;
    height: number;
  };
  file_size: number;
  format: string;
  created_at: string;
  updated_at: string;
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text_primary: string;
  text_secondary: string;
  border: string;
}

export interface Typography {
  primary_font_family: string;
  secondary_font_family: string;
  heading_font_weight: number;
  body_font_weight: number;
  font_sizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  line_heights: {
    tight: string;
    normal: string;
    relaxed: string;
  };
}

export interface ClientBranding {
  id: string;
  client_id: string;
  template_id: string;

  // Basic branding information
  company_name: string;
  company_tagline?: string;
  company_description?: string;

  // Contact information
  website_url?: string;
  contact_email?: string;
  phone_number?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };

  // Visual branding
  logo_primary: BrandAsset | null;
  logo_secondary?: BrandAsset | null;
  favicon: BrandAsset | null;
  color_palette: ColorPalette;
  typography: Typography;

  // Social media
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Custom styling
  custom_css?: string;
  theme_overrides?: Record<string, any>;

  // Brand guidelines
  brand_guidelines?: {
    voice_and_tone?: string;
    messaging_framework?: string;
    visual_guidelines?: string;
    usage_restrictions?: string[];
  };

  // White-labeling settings
  white_label_config: WhiteLabelConfig;

  // Metadata
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: string;
}

export interface WhiteLabelConfig {
  // Visibility controls
  hide_powered_by: boolean;
  hide_company_branding: boolean;
  custom_footer_text?: string;

  // Domain settings
  custom_domain?: string;
  subdomain?: string;
  ssl_enabled: boolean;

  // Feature restrictions
  allowed_customizations: {
    colors: boolean;
    fonts: boolean;
    logos: boolean;
    content: boolean;
    layout: boolean;
    css: boolean;
  };

  // Content restrictions
  prohibited_content: string[];
  required_disclaimers: string[];

  // Integration settings
  analytics_tracking_id?: string;
  custom_analytics_code?: string;
  third_party_integrations: string[];

  // Compliance settings
  gdpr_compliance: boolean;
  ccpa_compliance: boolean;
  accessibility_compliance: boolean;

  // Support and attribution
  support_email?: string;
  attribution_text?: string;
  terms_url?: string;
  privacy_url?: string;
}

export interface BrandValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
  quality_score: number;
  compliance_score: number;
}

export interface BrandingPreset {
  id: string;
  name: string;
  description: string;
  industry: string;
  color_palette: ColorPalette;
  typography: Typography;
  style_characteristics: string[];
  preview_url?: string;
}

/**
 * White Label Manager
 * Core system for managing client branding and white-labeling configurations
 */
export class WhiteLabelManager {
  private brandings: Map<string, ClientBranding> = new Map();
  private presets: Map<string, BrandingPreset> = new Map();
  private assets: Map<string, BrandAsset> = new Map();

  constructor() {
    this.initializeDefaultPresets();
  }

  /**
   * Create new client branding configuration
   */
  createBranding(brandingData: Omit<ClientBranding, 'id' | 'created_at' | 'updated_at' | 'version'>): ClientBranding {
    const id = this.generateBrandingId(brandingData.company_name);
    const now = new Date().toISOString();

    const branding: ClientBranding = {
      id,
      created_at: now,
      updated_at: now,
      version: '1.0.0',
      ...brandingData
    };

    const validation = this.validateBranding(branding);
    if (!validation.is_valid) {
      throw new Error(`Branding validation failed: ${validation.errors.join(', ')}`);
    }

    this.brandings.set(id, branding);
    return branding;
  }

  /**
   * Update existing client branding
   */
  updateBranding(id: string, updates: Partial<ClientBranding>): ClientBranding {
    const existing = this.brandings.get(id);
    if (!existing) {
      throw new Error(`Branding with ID ${id} not found`);
    }

    const updated: ClientBranding = {
      ...existing,
      ...updates,
      id, // Ensure ID doesn't change
      updated_at: new Date().toISOString(),
      version: this.incrementVersion(existing.version)
    };

    const validation = this.validateBranding(updated);
    if (!validation.is_valid) {
      throw new Error(`Branding validation failed: ${validation.errors.join(', ')}`);
    }

    this.brandings.set(id, updated);
    return updated;
  }

  /**
   * Get client branding by ID
   */
  getBranding(id: string): ClientBranding | null {
    return this.brandings.get(id) || null;
  }

  /**
   * Get all brandings for a client
   */
  getBrandingsByClient(clientId: string): ClientBranding[] {
    return Array.from(this.brandings.values()).filter(b => b.client_id === clientId);
  }

  /**
   * Get branding by template
   */
  getBrandingsByTemplate(templateId: string): ClientBranding[] {
    return Array.from(this.brandings.values()).filter(b => b.template_id === templateId);
  }

  /**
   * Delete client branding
   */
  deleteBranding(id: string): boolean {
    return this.brandings.delete(id);
  }

  /**
   * Validate branding configuration
   */
  validateBranding(branding: ClientBranding): BrandValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;
    let complianceScore = 100;

    // Required fields validation
    if (!branding.company_name?.trim()) {
      errors.push('Company name is required');
      qualityScore -= 20;
    }

    if (!branding.contact_email?.trim()) {
      warnings.push('Contact email recommended for better client communication');
      qualityScore -= 5;
    }

    // Logo validation
    if (!branding.logo_primary) {
      warnings.push('Primary logo recommended for better brand recognition');
      qualityScore -= 10;
    }

    if (!branding.favicon) {
      warnings.push('Favicon recommended for better brand presence');
      qualityScore -= 5;
    }

    // Color palette validation
    if (!this.isValidColor(branding.color_palette.primary)) {
      errors.push('Valid primary color is required');
      qualityScore -= 15;
    }

    if (!this.isValidColor(branding.color_palette.secondary)) {
      errors.push('Valid secondary color is required');
      qualityScore -= 10;
    }

    // Typography validation
    if (!branding.typography.primary_font_family?.trim()) {
      errors.push('Primary font family is required');
      qualityScore -= 10;
    }

    // White-label configuration validation
    if (branding.white_label_config.custom_domain && !this.isValidDomain(branding.white_label_config.custom_domain)) {
      errors.push('Custom domain format is invalid');
      qualityScore -= 15;
    }

    // Compliance validation
    if (!branding.white_label_config.gdpr_compliance) {
      warnings.push('GDPR compliance recommended for European users');
      complianceScore -= 20;
    }

    if (!branding.white_label_config.accessibility_compliance) {
      warnings.push('Accessibility compliance recommended for inclusive design');
      complianceScore -= 15;
    }

    // Social media validation
    const socialLinks = Object.values(branding.social_links).filter(link => link?.trim());
    if (socialLinks.length === 0) {
      warnings.push('Social media links recommended for better online presence');
      qualityScore -= 5;
    }

    // Brand guidelines validation
    if (!branding.brand_guidelines?.voice_and_tone) {
      warnings.push('Voice and tone guidelines recommended for consistent messaging');
      qualityScore -= 5;
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings,
      quality_score: Math.max(0, qualityScore),
      compliance_score: Math.max(0, complianceScore)
    };
  }

  /**
   * Apply branding to template
   */
  applyBrandingToTemplate(brandingId: string, templateId: string): Record<string, any> {
    const branding = this.getBranding(brandingId);
    if (!branding) {
      throw new Error(`Branding with ID ${brandingId} not found`);
    }

    return {
      // CSS Variables
      css_variables: this.generateCSSVariables(branding),

      // Template overrides
      template_overrides: {
        company_name: branding.company_name,
        company_tagline: branding.company_tagline,
        contact_email: branding.contact_email,
        website_url: branding.website_url,
        logo_url: branding.logo_primary?.url,
        favicon_url: branding.favicon?.url
      },

      // Theme configuration
      theme_config: {
        colors: branding.color_palette,
        typography: branding.typography,
        custom_css: branding.custom_css
      },

      // White-label settings
      white_label_settings: branding.white_label_config,

      // Social links
      social_links: branding.social_links,

      // Brand assets
      brand_assets: {
        logo_primary: branding.logo_primary,
        logo_secondary: branding.logo_secondary,
        favicon: branding.favicon
      }
    };
  }

  /**
   * Create branding from preset
   */
  createFromPreset(presetId: string, clientData: Partial<ClientBranding>): ClientBranding {
    const preset = this.presets.get(presetId);
    if (!preset) {
      throw new Error(`Preset with ID ${presetId} not found`);
    }

    const brandingData: Omit<ClientBranding, 'id' | 'created_at' | 'updated_at' | 'version'> = {
      client_id: clientData.client_id || '',
      template_id: clientData.template_id || '',
      company_name: clientData.company_name || '',
      company_tagline: clientData.company_tagline,
      company_description: clientData.company_description,
      website_url: clientData.website_url,
      contact_email: clientData.contact_email,
      phone_number: clientData.phone_number,
      address: clientData.address,
      logo_primary: null,
      favicon: null,
      color_palette: preset.color_palette,
      typography: preset.typography,
      social_links: clientData.social_links || {},
      custom_css: clientData.custom_css,
      theme_overrides: clientData.theme_overrides,
      brand_guidelines: clientData.brand_guidelines,
      white_label_config: this.getDefaultWhiteLabelConfig(),
      is_active: false
    };

    return this.createBranding(brandingData);
  }

  /**
   * Get all branding presets
   */
  getAllPresets(): BrandingPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by industry
   */
  getPresetsByIndustry(industry: string): BrandingPreset[] {
    return this.getAllPresets().filter(preset =>
      preset.industry === industry || preset.industry === 'universal'
    );
  }

  /**
   * Upload brand asset
   */
  async uploadAsset(
    file: File,
    type: BrandAsset['type'],
    altText?: string
  ): Promise<BrandAsset> {
    // In a real implementation, this would upload to cloud storage
    const id = this.generateAssetId(file.name);
    const url = URL.createObjectURL(file); // Temporary URL for demo

    const asset: BrandAsset = {
      id,
      type,
      name: file.name,
      url,
      alt_text: altText,
      dimensions: await this.getImageDimensions(file),
      file_size: file.size,
      format: file.type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.assets.set(id, asset);
    return asset;
  }

  /**
   * Delete brand asset
   */
  deleteAsset(assetId: string): boolean {
    return this.assets.delete(assetId);
  }

  /**
   * Get asset by ID
   */
  getAsset(assetId: string): BrandAsset | null {
    return this.assets.get(assetId) || null;
  }

  /**
   * Get all assets
   */
  getAllAssets(): BrandAsset[] {
    return Array.from(this.assets.values());
  }

  /**
   * Export branding configuration
   */
  exportBranding(brandingId: string): {
    branding: ClientBranding;
    assets: BrandAsset[];
    exported_at: string;
  } {
    const branding = this.getBranding(brandingId);
    if (!branding) {
      throw new Error(`Branding with ID ${brandingId} not found`);
    }

    const relatedAssets = this.getAllAssets().filter(asset =>
      asset.url === branding.logo_primary?.url ||
      asset.url === branding.logo_secondary?.url ||
      asset.url === branding.favicon?.url
    );

    return {
      branding,
      assets: relatedAssets,
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Import branding configuration
   */
  importBranding(data: {
    branding: ClientBranding;
    assets?: BrandAsset[];
  }): ClientBranding {
    const validation = this.validateBranding(data.branding);
    if (!validation.is_valid) {
      throw new Error(`Branding import failed: ${validation.errors.join(', ')}`);
    }

    // Import assets first
    if (data.assets) {
      data.assets.forEach(asset => {
        this.assets.set(asset.id, asset);
      });
    }

    // Generate new ID to avoid conflicts
    const imported = {
      ...data.branding,
      id: this.generateBrandingId(data.branding.company_name),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: false // Imported brandings start inactive
    };

    this.brandings.set(imported.id, imported);
    return imported;
  }

  // Private helper methods

  private generateBrandingId(companyName: string): string {
    const base = companyName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    let counter = 1;
    let id = `branding-${base}`;

    while (this.brandings.has(id)) {
      id = `branding-${base}-${counter}`;
      counter++;
    }

    return id;
  }

  private generateAssetId(fileName: string): string {
    const base = fileName.toLowerCase()
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);

    return `asset-${base}-${Date.now()}`;
  }

  private isValidColor(color: string): boolean {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbRegex = /^rgb\(\d{1,3},\s*\d{1,3},\s*\d{1,3}\)$/;
    const namedColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray'];

    return hexRegex.test(color) || rgbRegex.test(color) || namedColors.includes(color.toLowerCase());
  }

  private isValidDomain(domain: string): boolean {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
    return domainRegex.test(domain);
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    const patch = parseInt(parts[2] || '0') + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  }

  private generateCSSVariables(branding: ClientBranding): Record<string, string> {
    return {
      '--color-primary': branding.color_palette.primary,
      '--color-secondary': branding.color_palette.secondary,
      '--color-accent': branding.color_palette.accent,
      '--color-neutral': branding.color_palette.neutral,
      '--color-success': branding.color_palette.success,
      '--color-warning': branding.color_palette.warning,
      '--color-error': branding.color_palette.error,
      '--color-info': branding.color_palette.info,
      '--color-background': branding.color_palette.background,
      '--color-surface': branding.color_palette.surface,
      '--color-text-primary': branding.color_palette.text_primary,
      '--color-text-secondary': branding.color_palette.text_secondary,
      '--color-border': branding.color_palette.border,
      '--font-primary': branding.typography.primary_font_family,
      '--font-secondary': branding.typography.secondary_font_family,
      '--font-weight-heading': branding.typography.heading_font_weight.toString(),
      '--font-weight-body': branding.typography.body_font_weight.toString()
    };
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private getDefaultWhiteLabelConfig(): WhiteLabelConfig {
    return {
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
    };
  }

  private initializeDefaultPresets(): void {
    const defaultPresets: BrandingPreset[] = [
      {
        id: 'professional-blue',
        name: 'Professional Blue',
        description: 'Classic professional theme with blue accents',
        industry: 'universal',
        color_palette: {
          primary: '#1E40AF',
          secondary: '#3B82F6',
          accent: '#60A5FA',
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
        style_characteristics: ['professional', 'trustworthy', 'corporate', 'clean']
      },
      {
        id: 'modern-tech',
        name: 'Modern Tech',
        description: 'Contemporary design for technology companies',
        industry: 'tech-saas',
        color_palette: {
          primary: '#8B5CF6',
          secondary: '#A78BFA',
          accent: '#C4B5FD',
          neutral: '#6B7280',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#8B5CF6',
          background: '#FFFFFF',
          surface: '#F9FAFB',
          text_primary: '#111827',
          text_secondary: '#6B7280',
          border: '#E5E7EB'
        },
        typography: {
          primary_font_family: 'Poppins, sans-serif',
          secondary_font_family: 'Inter, sans-serif',
          heading_font_weight: 700,
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
        style_characteristics: ['modern', 'innovative', 'tech-forward', 'dynamic']
      },
      {
        id: 'healthcare-calm',
        name: 'Healthcare Calm',
        description: 'Soothing design for healthcare practices',
        industry: 'healthcare',
        color_palette: {
          primary: '#10B981',
          secondary: '#34D399',
          accent: '#6EE7B7',
          neutral: '#6B7280',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#06B6D4',
          background: '#FFFFFF',
          surface: '#F0FDF4',
          text_primary: '#111827',
          text_secondary: '#6B7280',
          border: '#D1FAE5'
        },
        typography: {
          primary_font_family: 'Source Sans Pro, sans-serif',
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
        style_characteristics: ['calming', 'trustworthy', 'professional', 'accessible']
      }
    ];

    defaultPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }
}

/**
 * Default white label manager instance
 */
export const whiteLabelManager = new WhiteLabelManager();

/**
 * Convenience functions for white-labeling operations
 */
export const whiteLabelBranding = {
  create: (data: Omit<ClientBranding, 'id' | 'created_at' | 'updated_at' | 'version'>) =>
    whiteLabelManager.createBranding(data),
  update: (id: string, updates: Partial<ClientBranding>) =>
    whiteLabelManager.updateBranding(id, updates),
  get: (id: string) => whiteLabelManager.getBranding(id),
  getByClient: (clientId: string) => whiteLabelManager.getBrandingsByClient(clientId),
  getByTemplate: (templateId: string) => whiteLabelManager.getBrandingsByTemplate(templateId),
  delete: (id: string) => whiteLabelManager.deleteBranding(id),
  validate: (branding: ClientBranding) => whiteLabelManager.validateBranding(branding),
  applyToTemplate: (brandingId: string, templateId: string) =>
    whiteLabelManager.applyBrandingToTemplate(brandingId, templateId),
  createFromPreset: (presetId: string, clientData: Partial<ClientBranding>) =>
    whiteLabelManager.createFromPreset(presetId, clientData),
  getPresets: () => whiteLabelManager.getAllPresets(),
  getPresetsByIndustry: (industry: string) => whiteLabelManager.getPresetsByIndustry(industry),
  uploadAsset: (file: File, type: BrandAsset['type'], altText?: string) =>
    whiteLabelManager.uploadAsset(file, type, altText),
  deleteAsset: (assetId: string) => whiteLabelManager.deleteAsset(assetId),
  getAsset: (assetId: string) => whiteLabelManager.getAsset(assetId),
  getAllAssets: () => whiteLabelManager.getAllAssets(),
  export: (brandingId: string) => whiteLabelManager.exportBranding(brandingId),
  import: (data: any) => whiteLabelManager.importBranding(data)
};