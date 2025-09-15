/**
 * @fileoverview Rule Configuration System for Brands and Tenants
 * @module lib/design-rules/rule-configuration-system
 * @author OSS Hero System
 * @version 1.0.0
 */

import { ConfigurableRulesEngine, RuleConfiguration, DesignRule, configurableRulesEngine } from './configurable-rules-engine';
import { BrandValidationContext } from '@/lib/branding/brand-context';

export interface BrandRuleSet {
  /** Brand identifier */
  brandId: string;
  /** Brand name */
  brandName: string;
  /** Brand-specific rules */
  rules: DesignRule[];
  /** Brand-specific overrides */
  overrides: Record<string, Partial<DesignRule>>;
}

export interface TenantRuleSet {
  /** Tenant identifier */
  tenantId: string;
  /** Tenant name */
  tenantName: string;
  /** Tenant-specific rules */
  rules: DesignRule[];
  /** Tenant-specific overrides */
  overrides: Record<string, Partial<DesignRule>>;
}

export interface RuleConfigurationManager {
  /** Get configuration for brand */
  getBrandConfiguration(brandId: string): BrandRuleSet | null;
  /** Get configuration for tenant */
  getTenantConfiguration(tenantId: string): TenantRuleSet | null;
  /** Set brand configuration */
  setBrandConfiguration(brandId: string, config: BrandRuleSet): void;
  /** Set tenant configuration */
  setTenantConfiguration(tenantId: string, config: TenantRuleSet): void;
  /** Get all brand configurations */
  getAllBrandConfigurations(): BrandRuleSet[];
  /** Get all tenant configurations */
  getAllTenantConfigurations(): TenantRuleSet[];
}

/**
 * Rule Configuration System
 */
export class RuleConfigurationSystem implements RuleConfigurationManager {
  private brandConfigurations: Map<string, BrandRuleSet> = new Map();
  private tenantConfigurations: Map<string, TenantRuleSet> = new Map();
  private rulesEngine: ConfigurableRulesEngine;

  constructor(rulesEngine: ConfigurableRulesEngine) {
    this.rulesEngine = rulesEngine;
    this.initializeDefaultConfigurations();
  }

  /**
   * Initialize default brand and tenant configurations
   */
  private initializeDefaultConfigurations(): void {
    // Default brand configurations
    this.initializeDefaultBrandConfigurations();
    
    // Default tenant configurations
    this.initializeDefaultTenantConfigurations();
  }

  /**
   * Initialize default brand configurations
   */
  private initializeDefaultBrandConfigurations(): void {
    // Default brand (strict rules)
    const defaultBrand: BrandRuleSet = {
      brandId: 'default',
      brandName: 'Default Brand',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'error',
          config: {
            allowCustomColors: false,
          },
        },
        'enforce-font-system': {
          severity: 'error',
          config: {
            allowCustomFonts: false,
          },
        },
      },
    };

    // Custom brand (relaxed rules)
    const customBrand: BrandRuleSet = {
      brandId: 'custom',
      brandName: 'Custom Brand',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'warning',
          config: {
            allowCustomColors: true,
          },
        },
        'enforce-font-system': {
          severity: 'warning',
          config: {
            allowCustomFonts: true,
          },
        },
        'no-inline-styles': {
          severity: 'warning',
          config: {
            allowExceptions: true,
          },
        },
      },
    };

    // Corporate brand (strict corporate rules)
    const corporateBrand: BrandRuleSet = {
      brandId: 'corporate',
      brandName: 'Corporate Brand',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'error',
          config: {
            allowCustomColors: false,
            allowedColors: ['#007AFF', '#34C759', '#FF9500', '#FF3B30'],
          },
        },
        'enforce-font-system': {
          severity: 'error',
          config: {
            allowCustomFonts: false,
            brandFonts: ['system-ui', 'sans-serif', 'SF Pro Display'],
          },
        },
        'enforce-design-tokens': {
          severity: 'error',
          config: {
            strictMode: true,
          },
        },
      },
    };

    // Startup brand (flexible rules)
    const startupBrand: BrandRuleSet = {
      brandId: 'startup',
      brandName: 'Startup Brand',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'warning',
          config: {
            allowCustomColors: true,
          },
        },
        'enforce-font-system': {
          severity: 'info',
          config: {
            allowCustomFonts: true,
          },
        },
        'no-inline-styles': {
          severity: 'warning',
          config: {
            allowExceptions: true,
          },
        },
        'enforce-design-tokens': {
          severity: 'info',
          config: {
            strictMode: false,
          },
        },
      },
    };

    this.brandConfigurations.set('default', defaultBrand);
    this.brandConfigurations.set('custom', customBrand);
    this.brandConfigurations.set('corporate', corporateBrand);
    this.brandConfigurations.set('startup', startupBrand);
  }

  /**
   * Initialize default tenant configurations
   */
  private initializeDefaultTenantConfigurations(): void {
    // Enterprise tenant (strict rules)
    const enterpriseTenant: TenantRuleSet = {
      tenantId: 'enterprise',
      tenantName: 'Enterprise Tenant',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'error',
          config: {
            allowCustomColors: false,
          },
        },
        'enforce-import-boundaries': {
          severity: 'error',
          config: {
            forbiddenPaths: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*', '@/lib/*'],
          },
        },
        'enforce-design-tokens': {
          severity: 'error',
          config: {
            strictMode: true,
          },
        },
      },
    };

    // Small business tenant (moderate rules)
    const smallBusinessTenant: TenantRuleSet = {
      tenantId: 'small-business',
      tenantName: 'Small Business Tenant',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'warning',
          config: {
            allowCustomColors: true,
          },
        },
        'enforce-import-boundaries': {
          severity: 'warning',
          config: {
            forbiddenPaths: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
          },
        },
        'enforce-design-tokens': {
          severity: 'warning',
          config: {
            strictMode: false,
          },
        },
      },
    };

    // Individual tenant (relaxed rules)
    const individualTenant: TenantRuleSet = {
      tenantId: 'individual',
      tenantName: 'Individual Tenant',
      rules: [],
      overrides: {
        'no-raw-hex-colors': {
          severity: 'info',
          config: {
            allowCustomColors: true,
          },
        },
        'enforce-import-boundaries': {
          severity: 'warning',
          config: {
            forbiddenPaths: ['@/data/*', '@/lib/db/*', '@/lib/supabase/*', '@/supabase/*'],
          },
        },
        'enforce-design-tokens': {
          severity: 'info',
          config: {
            strictMode: false,
          },
        },
        'no-inline-styles': {
          severity: 'info',
          config: {
            allowExceptions: true,
          },
        },
      },
    };

    this.tenantConfigurations.set('enterprise', enterpriseTenant);
    this.tenantConfigurations.set('small-business', smallBusinessTenant);
    this.tenantConfigurations.set('individual', individualTenant);
  }

  /**
   * Get brand configuration
   */
  getBrandConfiguration(brandId: string): BrandRuleSet | null {
    return this.brandConfigurations.get(brandId) || null;
  }

  /**
   * Get tenant configuration
   */
  getTenantConfiguration(tenantId: string): TenantRuleSet | null {
    return this.tenantConfigurations.get(tenantId) || null;
  }

  /**
   * Set brand configuration
   */
  setBrandConfiguration(brandId: string, config: BrandRuleSet): void {
    this.brandConfigurations.set(brandId, config);
    this.updateRulesEngineConfiguration();
  }

  /**
   * Set tenant configuration
   */
  setTenantConfiguration(tenantId: string, config: TenantRuleSet): void {
    this.tenantConfigurations.set(tenantId, config);
    this.updateRulesEngineConfiguration();
  }

  /**
   * Get all brand configurations
   */
  getAllBrandConfigurations(): BrandRuleSet[] {
    return Array.from(this.brandConfigurations.values());
  }

  /**
   * Get all tenant configurations
   */
  getAllTenantConfigurations(): TenantRuleSet[] {
    return Array.from(this.tenantConfigurations.values());
  }

  /**
   * Update rules engine configuration with current brand and tenant configs
   */
  private updateRulesEngineConfiguration(): void {
    const config = this.rulesEngine.getActiveConfiguration();
    
    // Update brand rule sets
    config.brandRuleSets = {};
    this.brandConfigurations.forEach((brandConfig, brandId) => {
      config.brandRuleSets[brandId] = brandConfig.rules;
    });

    // Update tenant rule sets
    config.tenantRuleSets = {};
    this.tenantConfigurations.forEach((tenantConfig, tenantId) => {
      config.tenantRuleSets[tenantId] = tenantConfig.rules;
    });

    // Update global overrides
    config.globalOverrides = {};
    
    // Apply brand overrides
    this.brandConfigurations.forEach(brandConfig => {
      Object.assign(config.globalOverrides, brandConfig.overrides);
    });

    // Apply tenant overrides
    this.tenantConfigurations.forEach(tenantConfig => {
      Object.assign(config.globalOverrides, tenantConfig.overrides);
    });

    this.rulesEngine.addConfiguration('default', config);
  }

  /**
   * Create configuration for specific brand and tenant combination
   */
  createCombinedConfiguration(
    brandId: string, 
    tenantId: string, 
    brandContext: BrandValidationContext
  ): RuleConfiguration {
    const brandConfig = this.getBrandConfiguration(brandId);
    const tenantConfig = this.getTenantConfiguration(tenantId);
    
    const config = this.rulesEngine.getActiveConfiguration();
    
    // Create combined configuration
    const combinedConfig: RuleConfiguration = {
      name: `${brandId}-${tenantId}`,
      description: `Combined configuration for ${brandId} brand and ${tenantId} tenant`,
      rules: [...config.rules],
      brandRuleSets: {},
      tenantRuleSets: {},
      globalOverrides: {},
    };

    // Apply brand-specific rules
    if (brandConfig) {
      combinedConfig.brandRuleSets[brandId] = brandConfig.rules;
      Object.assign(combinedConfig.globalOverrides, brandConfig.overrides);
    }

    // Apply tenant-specific rules
    if (tenantConfig) {
      combinedConfig.tenantRuleSets[tenantId] = tenantConfig.rules;
      Object.assign(combinedConfig.globalOverrides, tenantConfig.overrides);
    }

    // Apply brand context overrides
    if (brandContext.brandConfig.isCustom) {
      const customOverrides = combinedConfig.globalOverrides['no-raw-hex-colors'];
      if (customOverrides) {
        customOverrides.config = {
          ...customOverrides.config,
          allowCustomColors: true,
        };
      }
    }

    return combinedConfig;
  }

  /**
   * Get rule configuration summary
   */
  getConfigurationSummary(): {
    brands: number;
    tenants: number;
    totalRules: number;
    activeRules: number;
  } {
    const config = this.rulesEngine.getActiveConfiguration();
    const activeRules = config.rules.filter(rule => rule.enabled).length;
    
    return {
      brands: this.brandConfigurations.size,
      tenants: this.tenantConfigurations.size,
      totalRules: config.rules.length,
      activeRules,
    };
  }

  /**
   * Export all configurations
   */
  exportAllConfigurations(): {
    brands: Record<string, BrandRuleSet>;
    tenants: Record<string, TenantRuleSet>;
  } {
    const brands: Record<string, BrandRuleSet> = {};
    const tenants: Record<string, TenantRuleSet> = {};
    
    this.brandConfigurations.forEach((config, id) => {
      brands[id] = config;
    });
    
    this.tenantConfigurations.forEach((config, id) => {
      tenants[id] = config;
    });
    
    return { brands, tenants };
  }

  /**
   * Import configurations
   */
  importConfigurations(configs: {
    brands: Record<string, BrandRuleSet>;
    tenants: Record<string, TenantRuleSet>;
  }): boolean {
    try {
      // Import brand configurations
      Object.entries(configs.brands).forEach(([id, config]) => {
        this.brandConfigurations.set(id, config);
      });
      
      // Import tenant configurations
      Object.entries(configs.tenants).forEach(([id, config]) => {
        this.tenantConfigurations.set(id, config);
      });
      
      this.updateRulesEngineConfiguration();
      return true;
    } catch (error) {
      console.error('Error importing configurations:', error);
      return false;
    }
  }
}

/**
 * Global rule configuration system instance
 */
export const ruleConfigurationSystem = new RuleConfigurationSystem(configurableRulesEngine);
