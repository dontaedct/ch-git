/**
 * @fileoverview Enhanced Configuration System for Brand Support
 * @module lib/config/brand-config-service
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.1: Enhance Configuration System for Brand Support
 * 
 * This module enhances the existing configuration system to support client-specific branding
 * with proper type safety, validation, and integration with the Phase 1 branding infrastructure.
 */

import { MicroAppConfig, ThemeTokens } from '@/types/config';
import { 
  TenantBrandingConfig, 
  BrandColors, 
  TypographyConfig,
  DEFAULT_BRAND_COLORS,
  DEFAULT_TYPOGRAPHY_CONFIG 
} from '@/lib/branding/tenant-types';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BrandConfigOverride {
  /** Unique override identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Description of the override */
  description: string;
  /** Whether this override is currently active */
  active: boolean;
  /** The override value */
  value: unknown;
  /** JSON path to the configuration property */
  path: string;
  /** Override priority (higher = more important) */
  priority: number;
  /** Override source */
  source: 'environment' | 'database' | 'runtime' | 'preset' | 'user';
  /** Whether this override can be modified by users */
  userModifiable: boolean;
  /** Validation rules for this override */
  validation?: {
    required?: boolean;
    type?: string;
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean;
  };
}

export interface EnhancedAppConfig extends MicroAppConfig {
  /** Brand configuration */
  branding: {
    /** Tenant branding configuration */
    tenant: TenantBrandingConfig;
    /** Brand overrides */
    overrides: BrandConfigOverride[];
    /** Brand validation status */
    validationStatus: 'valid' | 'invalid' | 'pending' | 'warning';
    /** Brand validation errors */
    validationErrors: string[];
    /** Brand validation warnings */
    validationWarnings: string[];
  };
  /** Enhanced theme with brand support */
  theme: EnhancedThemeTokens;
  /** Brand-specific integrations */
  integrations: MicroAppConfig['integrations'] & {
    /** Brand-specific email settings */
    email?: {
      fromAddress: string;
      subjectTemplate: string;
      brandSignature?: string;
      brandFooter?: string;
    };
  };
}

export interface EnhancedThemeTokens extends ThemeTokens {
  /** Brand-specific color extensions */
  colors: ThemeTokens['colors'] & {
    /** Brand colors from tenant configuration */
    brand: BrandColors;
    /** Dynamic color variants */
    variants: {
      primary: {
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
      secondary: {
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
    };
  };
  /** Enhanced typography with brand support */
  typography: ThemeTokens['typography'] & {
    /** Brand typography configuration */
    brand: TypographyConfig;
    /** Custom font loading */
    customFonts?: {
      family: string;
      weights: number[];
      display: 'swap' | 'block' | 'fallback';
    }[];
  };
}

export interface BrandConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

// =============================================================================
// BRAND CONFIGURATION OVERRIDES
// =============================================================================

/**
 * Default brand configuration overrides
 */
const DEFAULT_BRAND_OVERRIDES: BrandConfigOverride[] = [
  {
    id: 'brand-primary-color',
    label: 'Primary Brand Color',
    description: 'Main brand color used throughout the application',
    active: true,
    value: DEFAULT_BRAND_COLORS.primary,
    path: 'branding.tenant.brandColors.primary',
    priority: 100,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    }
  },
  {
    id: 'brand-secondary-color',
    label: 'Secondary Brand Color',
    description: 'Secondary brand color for accents and highlights',
    active: true,
    value: DEFAULT_BRAND_COLORS.secondary,
    path: 'branding.tenant.brandColors.secondary',
    priority: 90,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    }
  },
  {
    id: 'brand-font-family',
    label: 'Brand Font Family',
    description: 'Primary font family for brand typography',
    active: true,
    value: DEFAULT_TYPOGRAPHY_CONFIG.fontFamily,
    path: 'branding.tenant.typographyConfig.fontFamily',
    priority: 80,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      min: 1
    }
  },
  {
    id: 'brand-organization-name',
    label: 'Organization Name',
    description: 'Name of the organization using this application',
    active: true,
    value: 'Your Organization',
    path: 'branding.tenant.organizationName',
    priority: 95,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      min: 1,
      max: 100
    }
  },
  {
    id: 'brand-app-name',
    label: 'Application Name',
    description: 'Name of the application',
    active: true,
    value: 'Micro App',
    path: 'branding.tenant.appName',
    priority: 95,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      min: 1,
      max: 50
    }
  },
  {
    id: 'brand-logo-src',
    label: 'Brand Logo',
    description: 'URL or path to the brand logo image',
    active: false,
    value: null,
    path: 'branding.tenant.logoSrc',
    priority: 85,
    source: 'user',
    userModifiable: true,
    validation: {
      type: 'string',
      pattern: '^(https?://|/).*'
    }
  },
  {
    id: 'brand-logo-initials',
    label: 'Logo Initials',
    description: 'Fallback initials when logo is not available',
    active: true,
    value: 'CH',
    path: 'branding.tenant.logoInitials',
    priority: 75,
    source: 'preset',
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      min: 1,
      max: 4
    }
  }
];

// =============================================================================
// BRAND CONFIGURATION SERVICE
// =============================================================================

/**
 * Enhanced configuration service with brand support
 */
export class BrandConfigService {
  private static instance: BrandConfigService;
  private configCache: EnhancedAppConfig | null = null;
  private overridesCache: BrandConfigOverride[] = [];

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): BrandConfigService {
    if (!BrandConfigService.instance) {
      BrandConfigService.instance = new BrandConfigService();
    }
    return BrandConfigService.instance;
  }

  /**
   * Get enhanced application configuration with brand support
   */
  public async getEnhancedConfig(tenantId?: string): Promise<EnhancedAppConfig> {
    if (this.configCache) {
      return this.configCache;
    }

    // Load base configuration
    const baseConfig = await this.loadBaseConfig();
    
    // Load tenant branding configuration
    const tenantBranding = await this.loadTenantBranding(tenantId);
    
    // Load active overrides
    const overrides = await this.loadActiveOverrides();
    
    // Merge configurations
    this.configCache = await this.mergeConfigurations(baseConfig, tenantBranding, overrides);
    
    return this.configCache;
  }

  /**
   * Get brand configuration overrides
   */
  public async getBrandOverrides(): Promise<BrandConfigOverride[]> {
    if (this.overridesCache.length > 0) {
      return this.overridesCache;
    }

    // Load environment overrides
    const envOverrides = this.loadEnvironmentOverrides();
    
    // Load database overrides (would be implemented with actual database)
    const dbOverrides = await this.loadDatabaseOverrides();
    
    // Merge and prioritize overrides
    this.overridesCache = this.mergeOverrides([...DEFAULT_BRAND_OVERRIDES, ...envOverrides, ...dbOverrides]);
    
    return this.overridesCache;
  }

  /**
   * Apply brand override
   */
  public async applyBrandOverride(override: BrandConfigOverride): Promise<boolean> {
    try {
      // Validate override
      const validation = this.validateOverride(override);
      if (!validation.isValid) {
        throw new Error(`Override validation failed: ${validation.errors.join(', ')}`);
      }

      // Apply override
      await this.applyOverrideToConfig(override);
      
      // Clear cache to force reload
      this.configCache = null;
      
      return true;
    } catch (error) {
      console.error('Failed to apply brand override:', error);
      return false;
    }
  }

  /**
   * Validate brand configuration
   */
  public async validateBrandConfig(config: EnhancedAppConfig): Promise<BrandConfigValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Validate brand colors
    const colorValidation = this.validateBrandColors(config.branding.tenant.brandColors);
    errors.push(...colorValidation.errors);
    warnings.push(...colorValidation.warnings);
    score -= colorValidation.errors.length * 10;
    score -= colorValidation.warnings.length * 5;

    // Validate typography
    const typographyValidation = this.validateTypography(config.branding.tenant.typographyConfig);
    errors.push(...typographyValidation.errors);
    warnings.push(...typographyValidation.warnings);
    score -= typographyValidation.errors.length * 10;
    score -= typographyValidation.warnings.length * 5;

    // Validate logo configuration
    const logoValidation = this.validateLogoConfig(config.branding.tenant);
    errors.push(...logoValidation.errors);
    warnings.push(...logoValidation.warnings);
    score -= logoValidation.errors.length * 5;
    score -= logoValidation.warnings.length * 2;

    // Validate brand names
    const nameValidation = this.validateBrandNames(config.branding.tenant);
    errors.push(...nameValidation.errors);
    warnings.push(...nameValidation.warnings);
    score -= nameValidation.errors.length * 10;
    score -= nameValidation.warnings.length * 5;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  /**
   * Clear configuration cache
   */
  public clearCache(): void {
    this.configCache = null;
    this.overridesCache = [];
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async loadBaseConfig(): Promise<MicroAppConfig> {
    // This would load from the actual base configuration
    // For now, return a mock configuration
    return {
      id: 'enhanced-microapp',
      name: 'Enhanced Micro App',
      version: '2.0.0',
      theme: {
        colors: {
          primary: '#007AFF',
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
          fontFamily: 'system-ui, sans-serif',
          scales: {
            display: '2.5rem',
            headline: '1.5rem',
            body: '1rem',
            caption: '0.875rem'
          }
        },
        motion: {
          duration: '150ms',
          easing: 'cubic-bezier(.2,.8,.2,1)'
        },
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
      questionnaire: {
        id: 'base-questionnaire',
        title: 'Base Questionnaire',
        steps: [],
        progress: {
          style: 'thinBar',
          showNumbers: true
        },
        navigation: {
          previousLabel: 'Previous',
          nextLabel: 'Next',
          submitLabel: 'Submit'
        }
      },
      consultation: {
        summary: {
          minWords: 50,
          maxWords: 200,
          tone: 'professional' as const
        },
        planDeck: {
          primaryCount: 3,
          alternatesCount: 2
        },
        sections: ['whatYouGet', 'whyThisFits', 'timeline', 'nextSteps'],
        actions: {
          downloadPdf: true,
          emailCopy: true,
          bookCtaLabel: 'Book Consultation'
        }
      },
      catalog: {
        id: 'base-catalog',
        name: 'Base Plan Catalog',
        plans: [],
        defaults: {
          fallbackPlan: 'foundation-plan',
          preferHigherTier: true
        }
      },
      modules: {
        modules: []
      },
      integrations: {}
    };
  }

  private async loadTenantBranding(tenantId?: string): Promise<TenantBrandingConfig> {
    // This would load from the actual tenant branding service
    // For now, return default configuration
    return {
      id: 'default-branding',
      tenantId: tenantId || 'default',
      organizationName: 'Your Organization',
      appName: 'Micro App',
      fullBrand: 'Your Organization — Micro App',
      shortBrand: 'Micro App',
      navBrand: 'Micro App',
      logoAlt: 'Organization logo',
      logoWidth: 28,
      logoHeight: 28,
      logoClassName: 'rounded-sm border border-gray-200',
      logoShowAsImage: true,
      logoInitials: 'CH',
      logoFallbackBgColor: 'from-blue-600 to-indigo-600',
      brandColors: DEFAULT_BRAND_COLORS,
      typographyConfig: DEFAULT_TYPOGRAPHY_CONFIG,
      presetName: 'default',
      isCustom: false,
      validationStatus: 'pending',
      validationErrors: [],
      validationWarnings: [],
      brandTags: [],
      brandVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private async loadActiveOverrides(): Promise<BrandConfigOverride[]> {
    return DEFAULT_BRAND_OVERRIDES.filter(override => override.active);
  }

  private loadEnvironmentOverrides(): BrandConfigOverride[] {
    const overrides: BrandConfigOverride[] = [];

    // Primary color override
    if (process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR) {
      overrides.push({
        id: 'env-primary-color',
        label: 'Environment Primary Color',
        description: 'Primary color from environment variable',
        active: true,
        value: process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR,
        path: 'branding.tenant.brandColors.primary',
        priority: 200,
        source: 'environment',
        userModifiable: false,
        validation: {
          type: 'string',
          pattern: '^#[0-9A-Fa-f]{6}$'
        }
      });
    }

    // Organization name override
    if (process.env.NEXT_PUBLIC_ORGANIZATION_NAME) {
      overrides.push({
        id: 'env-organization-name',
        label: 'Environment Organization Name',
        description: 'Organization name from environment variable',
        active: true,
        value: process.env.NEXT_PUBLIC_ORGANIZATION_NAME,
        path: 'branding.tenant.organizationName',
        priority: 200,
        source: 'environment',
        userModifiable: false,
        validation: {
          type: 'string',
          min: 1,
          max: 100
        }
      });
    }

    return overrides;
  }

  private async loadDatabaseOverrides(): Promise<BrandConfigOverride[]> {
    // This would load from the actual database
    // For now, return empty array
    return [];
  }

  private mergeOverrides(overrides: BrandConfigOverride[]): BrandConfigOverride[] {
    // Sort by priority (highest first)
    return overrides.sort((a, b) => b.priority - a.priority);
  }

  private async mergeConfigurations(
    baseConfig: MicroAppConfig,
    tenantBranding: TenantBrandingConfig,
    overrides: BrandConfigOverride[]
  ): Promise<EnhancedAppConfig> {
    // Create enhanced theme with brand support
    const enhancedTheme: EnhancedThemeTokens = {
      ...baseConfig.theme,
      colors: {
        ...baseConfig.theme.colors,
        brand: tenantBranding.brandColors,
        variants: this.generateColorVariants(tenantBranding.brandColors)
      },
      typography: {
        ...baseConfig.theme.typography,
        brand: tenantBranding.typographyConfig,
        customFonts: this.generateCustomFonts(tenantBranding.typographyConfig)
      }
    };

    // Apply overrides to configuration
    const configWithOverrides = this.applyOverridesToConfig(baseConfig, overrides);

    return {
      ...configWithOverrides,
      theme: enhancedTheme,
      branding: {
        tenant: tenantBranding,
        overrides,
        validationStatus: 'valid',
        validationErrors: [],
        validationWarnings: []
      },
      integrations: {
        ...baseConfig.integrations,
        email: {
          fromAddress: `${tenantBranding.organizationName} <noreply@${tenantBranding.organizationName.toLowerCase().replace(/\s+/g, '')}.com>`,
          subjectTemplate: `[${tenantBranding.appName}] {{subject}}`,
          brandSignature: `Best regards,\nThe ${tenantBranding.organizationName} Team`,
          brandFooter: `This email was sent by ${tenantBranding.organizationName} using ${tenantBranding.appName}.`
        }
      }
    };
  }

  private applyOverridesToConfig(config: MicroAppConfig, overrides: BrandConfigOverride[]): MicroAppConfig {
    let result = { ...config };

    for (const override of overrides) {
      if (override.active) {
        result = this.setNestedProperty(result, override.path, override.value);
      }
    }

    return result;
  }

  private setNestedProperty(obj: any, path: string, value: any): any {
    const keys = path.split('.');
    const result = { ...obj };
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
    return result;
  }

  private generateColorVariants(colors: BrandColors) {
    // Generate color variants for primary and secondary colors
    return {
      primary: this.generateColorScale(colors.primary),
      secondary: this.generateColorScale(colors.secondary)
    };
  }

  private generateColorScale(baseColor: string) {
    // Simple color scale generation (would be more sophisticated in production)
    const variants = {
      50: baseColor + '0A',
      100: baseColor + '1A',
      200: baseColor + '33',
      300: baseColor + '4D',
      400: baseColor + '66',
      500: baseColor,
      600: baseColor + 'CC',
      700: baseColor + 'E6',
      800: baseColor + 'F0',
      900: baseColor + 'F5'
    };
    return variants;
  }

  private generateCustomFonts(typography: TypographyConfig) {
    return [{
      family: typography.fontFamily,
      weights: typography.fontWeights,
      display: 'swap' as const
    }];
  }

  private validateOverride(override: BrandConfigOverride): BrandConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (override.validation) {
      const { validation } = override;

      if (validation.required && (override.value === null || override.value === undefined || override.value === '')) {
        errors.push(`${override.label} is required`);
      }

      if (override.value !== null && override.value !== undefined) {
        if (validation.type && typeof override.value !== validation.type) {
          errors.push(`${override.label} must be of type ${validation.type}`);
        }

        if (validation.min && typeof override.value === 'string' && override.value.length < validation.min) {
          errors.push(`${override.label} must be at least ${validation.min} characters`);
        }

        if (validation.max && typeof override.value === 'string' && override.value.length > validation.max) {
          errors.push(`${override.label} must be no more than ${validation.max} characters`);
        }

        if (validation.pattern && typeof override.value === 'string' && !new RegExp(validation.pattern).test(override.value)) {
          errors.push(`${override.label} format is invalid`);
        }

        if (validation.custom && !validation.custom(override.value)) {
          errors.push(`${override.label} failed custom validation`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 20)
    };
  }

  private async applyOverrideToConfig(override: BrandConfigOverride): Promise<void> {
    // This would apply the override to the actual configuration
    // For now, just log the action
    console.log(`Applying override: ${override.id} = ${override.value}`);
  }

  private validateBrandColors(colors: BrandColors): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate color format
    const colorRegex = /^#[0-9A-Fa-f]{6}$/;
    
    if (!colorRegex.test(colors.primary)) {
      errors.push('Primary color must be a valid hex color');
    }

    if (!colorRegex.test(colors.secondary)) {
      errors.push('Secondary color must be a valid hex color');
    }

    if (!colorRegex.test(colors.accent)) {
      errors.push('Accent color must be a valid hex color');
    }

    // Check color contrast (simplified)
    if (colors.primary === colors.secondary) {
      warnings.push('Primary and secondary colors are the same');
    }

    return { errors, warnings };
  }

  private validateTypography(typography: TypographyConfig): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!typography.fontFamily || typography.fontFamily.trim() === '') {
      errors.push('Font family is required');
    }

    if (!typography.fontWeights || typography.fontWeights.length === 0) {
      errors.push('At least one font weight is required');
    }

    // Check font size consistency
    const sizes = Object.values(typography.fontSizes);
    const sortedSizes = [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
    if (JSON.stringify(sizes) !== JSON.stringify(sortedSizes)) {
      warnings.push('Font sizes should be in ascending order');
    }

    return { errors, warnings };
  }

  private validateLogoConfig(tenant: TenantBrandingConfig): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!tenant.logoInitials || tenant.logoInitials.trim() === '') {
      errors.push('Logo initials are required');
    }

    if (tenant.logoInitials && tenant.logoInitials.length > 4) {
      warnings.push('Logo initials should be 4 characters or less');
    }

    if (tenant.logoSrc && !tenant.logoSrc.match(/^(https?:\/\/|\/)/)) {
      errors.push('Logo source must be a valid URL or path');
    }

    return { errors, warnings };
  }

  private validateBrandNames(tenant: TenantBrandingConfig): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!tenant.organizationName || tenant.organizationName.trim() === '') {
      errors.push('Organization name is required');
    }

    if (!tenant.appName || tenant.appName.trim() === '') {
      errors.push('Application name is required');
    }

    if (tenant.organizationName && tenant.organizationName.length > 100) {
      warnings.push('Organization name should be 100 characters or less');
    }

    if (tenant.appName && tenant.appName.length > 50) {
      warnings.push('Application name should be 50 characters or less');
    }

    return { errors, warnings };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const brandConfigService = BrandConfigService.getInstance();

export default brandConfigService;
