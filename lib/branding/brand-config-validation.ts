/**
 * @fileoverview HT-011.2.7: Brand Configuration Validation Implementation
 * @module lib/branding/brand-config-validation
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.2.7 - Implement Brand Configuration Validation
 * Focus: Create comprehensive brand configuration validation with error handling and user feedback
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { BrandValidationFramework, ValidationResult, ValidationReport, ValidationConfig } from './validation-framework';
import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';
import { TenantBrandConfig } from './types';

/**
 * Enhanced validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * Brand configuration validation error
 */
export interface BrandValidationError {
  /** Error code for programmatic handling */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Path to the field that caused the error */
  path: string;
  /** Severity level */
  severity: ValidationSeverity;
  /** Additional context or suggestions */
  suggestion?: string;
  /** WCAG level if applicable */
  wcagLevel?: 'A' | 'AA' | 'AAA';
  /** Category of validation */
  category: 'accessibility' | 'usability' | 'design' | 'branding' | 'technical';
}

/**
 * Brand configuration validation warning
 */
export interface BrandValidationWarning {
  /** Warning code for programmatic handling */
  code: string;
  /** Human-readable warning message */
  message: string;
  /** Path to the field that caused the warning */
  path: string;
  /** Suggestion for improvement */
  suggestion?: string;
  /** Category of validation */
  category: 'accessibility' | 'usability' | 'design' | 'branding' | 'technical';
}

/**
 * Comprehensive brand validation result
 */
export interface BrandValidationResult {
  /** Whether the brand configuration is valid */
  valid: boolean;
  /** List of validation errors */
  errors: BrandValidationError[];
  /** List of validation warnings */
  warnings: BrandValidationWarning[];
  /** Accessibility score (0-100) */
  accessibilityScore: number;
  /** Usability score (0-100) */
  usabilityScore: number;
  /** Design consistency score (0-100) */
  designScore: number;
  /** Brand compliance score (0-100) */
  brandScore: number;
  /** Overall validation score (0-100) */
  overallScore: number;
  /** WCAG compliance status */
  wcagCompliance: {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
  };
  /** Validation timestamp */
  timestamp: Date;
  /** Validation duration in milliseconds */
  duration: number;
}

/**
 * Brand configuration validation context
 */
export interface ValidationContext {
  /** Tenant ID for context-specific validation */
  tenantId?: string;
  /** Industry context for validation rules */
  industry?: string;
  /** Target audience for validation rules */
  audience?: string;
  /** Brand maturity level */
  maturity?: 'startup' | 'growing' | 'established' | 'enterprise';
  /** Validation strictness level */
  strictness: 'relaxed' | 'standard' | 'strict';
  /** Custom validation rules */
  customRules?: ValidationRule[];
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  /** Unique rule identifier */
  id: string;
  /** Human-readable rule name */
  name: string;
  /** Rule description */
  description: string;
  /** Category of validation */
  category: 'accessibility' | 'usability' | 'design' | 'branding' | 'technical';
  /** Severity level */
  severity: ValidationSeverity;
  /** WCAG level if applicable */
  wcagLevel?: 'A' | 'AA' | 'AAA';
  /** Rule validator function */
  validator: (config: TenantBrandConfig, context: ValidationContext) => ValidationResult;
  /** Whether this rule is enabled */
  enabled: boolean;
}

/**
 * Brand Configuration Validation Service
 */
export class BrandConfigValidationService {
  private validator: BrandValidationFramework;
  private customRules: Map<string, ValidationRule> = new Map();
  private validationCache: Map<string, BrandValidationResult> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(config: Partial<ValidationConfig> = {}) {
    this.validator = new BrandValidationFramework({
      accessibility: true,
      usability: true,
      design: true,
      branding: true,
      minWcagLevel: 'AA',
      ...config
    });
    
    this.initializeDefaultRules();
  }

  /**
   * Validate brand configuration with comprehensive checks
   */
  async validateBrandConfig(
    config: TenantBrandConfig,
    context: ValidationContext = { strictness: 'standard' }
  ): Promise<BrandValidationResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(config, context);
    const cached = this.validationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp.getTime()) < this.cacheTimeout) {
      return cached;
    }

    const errors: BrandValidationError[] = [];
    const warnings: BrandValidationWarning[] = [];
    let accessibilityScore = 100;
    let usabilityScore = 100;
    let designScore = 100;
    let brandScore = 100;

    // Convert TenantBrandConfig to DynamicBrandConfig for existing validator
    const dynamicConfig = this.convertToDynamicConfig(config);

    // Run existing validation framework
    const frameworkReport = this.validator.validateBrand(dynamicConfig);
    
    // Convert framework results to our format
    frameworkReport.results.forEach(result => {
      if (!result.passed) {
        const error: BrandValidationError = {
          code: result.id,
          message: result.message,
          path: this.mapValidationPath(result.id),
          severity: result.severity as ValidationSeverity,
          suggestion: result.suggestion,
          wcagLevel: result.wcagLevel,
          category: result.category
        };
        
        if (result.severity === 'error') {
          errors.push(error);
        } else {
          warnings.push({
            code: result.id,
            message: result.message,
            path: this.mapValidationPath(result.id),
            suggestion: result.suggestion,
            category: result.category
          });
        }
      }
    });

    // Run enhanced validation checks
    const enhancedResults = await this.runEnhancedValidation(config, context);
    errors.push(...enhancedResults.errors);
    warnings.push(...enhancedResults.warnings);

    // Run custom rules
    const customResults = await this.runCustomRules(config, context);
    errors.push(...customResults.errors);
    warnings.push(...customResults.warnings);

    // Calculate scores
    accessibilityScore = this.calculateAccessibilityScore(errors, warnings);
    usabilityScore = this.calculateUsabilityScore(errors, warnings);
    designScore = this.calculateDesignScore(errors, warnings);
    brandScore = this.calculateBrandScore(errors, warnings);

    const overallScore = Math.round(
      (accessibilityScore + usabilityScore + designScore + brandScore) / 4
    );

    // Check WCAG compliance
    const wcagCompliance = {
      levelA: this.checkWcagCompliance(errors, warnings, 'A'),
      levelAA: this.checkWcagCompliance(errors, warnings, 'AA'),
      levelAAA: this.checkWcagCompliance(errors, warnings, 'AAA')
    };

    const result: BrandValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings,
      accessibilityScore,
      usabilityScore,
      designScore,
      brandScore,
      overallScore,
      wcagCompliance,
      timestamp: new Date(),
      duration: Date.now() - startTime
    };

    // Cache the result
    this.validationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Validate brand preset
   */
  async validateBrandPreset(
    preset: BrandPreset,
    context: ValidationContext = { strictness: 'standard' }
  ): Promise<BrandValidationResult> {
    const config: TenantBrandConfig = {
      tenantId: 'preset',
      brand: {
        id: preset.id,
        name: preset.name,
        description: preset.description,
        isCustom: false,
        presetName: preset.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      theme: {
        colors: {
          name: 'Default',
          primary: '#3B82F6',
          secondary: '#1E40AF',
          neutral: '#6B7280',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        },
        typography: {
          fontFamily: 'Inter, sans-serif',
          fontWeights: [400, 500, 600, 700]
        },
        logo: {
          src: '',
          alt: '',
          width: 40,
          height: 40,
          initials: '',
          fallbackBgColor: 'from-blue-600 to-indigo-600'
        }
      },
      isActive: true,
      validationStatus: 'pending'
    };

    return this.validateBrandConfig(config, context);
  }

  /**
   * Quick validation for common issues
   */
  async quickValidate(config: TenantBrandConfig): Promise<BrandValidationError[]> {
    const result = await this.validateBrandConfig(config, { strictness: 'relaxed' });
    return result.errors.filter(error => error.severity === 'error');
  }

  /**
   * Add custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.set(rule.id, rule);
  }

  /**
   * Remove custom validation rule
   */
  removeCustomRule(ruleId: string): boolean {
    return this.customRules.delete(ruleId);
  }

  /**
   * Get validation summary
   */
  getValidationSummary(result: BrandValidationResult): string {
    const { errors, warnings, overallScore } = result;
    const errorCount = errors.length;
    const warningCount = warnings.length;
    
    if (errorCount === 0 && warningCount === 0) {
      return `✅ Brand configuration is valid (Score: ${overallScore}/100)`;
    } else if (errorCount === 0) {
      return `⚠️ Brand configuration has ${warningCount} warning(s) (Score: ${overallScore}/100)`;
    } else {
      return `❌ Brand configuration has ${errorCount} error(s) and ${warningCount} warning(s) (Score: ${overallScore}/100)`;
    }
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    totalValidations: number;
    averageScore: number;
    errorRate: number;
    warningRate: number;
  } {
    const results = Array.from(this.validationCache.values());
    const totalValidations = results.length;
    
    if (totalValidations === 0) {
      return {
        totalValidations: 0,
        averageScore: 0,
        errorRate: 0,
        warningRate: 0
      };
    }

    const totalScore = results.reduce((sum, result) => sum + result.overallScore, 0);
    const totalErrors = results.reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warnings.length, 0);

    return {
      totalValidations,
      averageScore: Math.round(totalScore / totalValidations),
      errorRate: Math.round((totalErrors / totalValidations) * 100) / 100,
      warningRate: Math.round((totalWarnings / totalValidations) * 100) / 100
    };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  /**
   * Initialize default validation rules
   */
  private initializeDefaultRules(): void {
    // Color contrast rule
    this.addCustomRule({
      id: 'color-contrast-enhanced',
      name: 'Enhanced Color Contrast',
      description: 'Validate color contrast ratios for accessibility',
      category: 'accessibility',
      severity: 'error',
      wcagLevel: 'AA',
      enabled: true,
      validator: (config, context) => {
        const errors: BrandValidationError[] = [];
        const warnings: BrandValidationWarning[] = [];

        if (config.theme?.colors?.primary && config.theme?.colors?.secondary) {
          const contrastRatio = this.calculateContrastRatio(
            config.theme.colors.primary,
            config.theme.colors.secondary
          );

          const minRatio = context.strictness === 'strict' ? 7.0 : 4.5;
          
          if (contrastRatio < minRatio) {
            errors.push({
              code: 'INSUFFICIENT_CONTRAST',
              message: `Color contrast ratio ${contrastRatio.toFixed(2)}:1 is below minimum ${minRatio}:1`,
              path: 'theme.colors',
              severity: 'error',
              suggestion: `Increase contrast between primary and secondary colors to meet WCAG ${context.strictness === 'strict' ? 'AAA' : 'AA'} standards`,
              wcagLevel: context.strictness === 'strict' ? 'AAA' : 'AA',
              category: 'accessibility'
            });
          }
        }

        return {
          id: 'color-contrast-enhanced',
          name: 'Enhanced Color Contrast',
          severity: errors.length > 0 ? 'error' : 'info',
          passed: errors.length === 0,
          message: `Color contrast validation completed`,
          category: 'accessibility'
        };
      }
    });

    // Brand name uniqueness rule
    this.addCustomRule({
      id: 'brand-name-uniqueness',
      name: 'Brand Name Uniqueness',
      description: 'Ensure brand names are unique and meaningful',
      category: 'branding',
      severity: 'warning',
      enabled: true,
      validator: (config, context) => {
        const errors: BrandValidationError[] = [];
        const warnings: BrandValidationWarning[] = [];

        const orgName = config.brand?.name || '';
        const defaultNames = ['Your Organization', 'Micro App', 'Default Brand', 'Untitled'];

        if (defaultNames.includes(orgName)) {
          warnings.push({
            code: 'DEFAULT_BRAND_NAME',
            message: 'Brand name appears to be a default placeholder',
            path: 'brand.name',
            suggestion: 'Replace with a unique, meaningful brand name',
            category: 'branding'
          });
        }

        return {
          id: 'brand-name-uniqueness',
          name: 'Brand Name Uniqueness',
          severity: warnings.length > 0 ? 'warning' : 'info',
          passed: warnings.length === 0,
          message: `Brand name uniqueness validation completed`,
          category: 'branding'
        };
      }
    });

    // Logo accessibility rule
    this.addCustomRule({
      id: 'logo-accessibility-enhanced',
      name: 'Enhanced Logo Accessibility',
      description: 'Validate logo accessibility requirements',
      category: 'accessibility',
      severity: 'error',
      wcagLevel: 'A',
      enabled: true,
      validator: (config, context) => {
        const errors: BrandValidationError[] = [];
        const warnings: BrandValidationWarning[] = [];

        const logo = config.theme?.logo;
        if (logo) {
          if (!logo.alt || logo.alt.trim().length === 0) {
            errors.push({
              code: 'MISSING_LOGO_ALT',
              message: 'Logo is missing alt text for screen readers',
              path: 'theme.logo.alt',
              severity: 'error',
              suggestion: 'Add descriptive alt text for the logo',
              wcagLevel: 'A',
              category: 'accessibility'
            });
          }

          if (!logo.initials || logo.initials.trim().length === 0) {
            warnings.push({
              code: 'MISSING_LOGO_INITIALS',
              message: 'Logo is missing fallback initials',
              path: 'theme.logo.initials',
              suggestion: 'Add initials as fallback for logo display',
              category: 'accessibility'
            });
          }

          if (logo.width < 20 || logo.height < 20) {
            warnings.push({
              code: 'LOGO_TOO_SMALL',
              message: 'Logo dimensions may be too small for accessibility',
              path: 'theme.logo',
              suggestion: 'Ensure logo is at least 20x20 pixels for accessibility',
              category: 'accessibility'
            });
          }
        }

        return {
          id: 'logo-accessibility-enhanced',
          name: 'Enhanced Logo Accessibility',
          severity: errors.length > 0 ? 'error' : 'info',
          passed: errors.length === 0,
          message: `Logo accessibility validation completed`,
          category: 'accessibility'
        };
      }
    });
  }

  /**
   * Run enhanced validation checks
   */
  private async runEnhancedValidation(
    config: TenantBrandConfig,
    context: ValidationContext
  ): Promise<{ errors: BrandValidationError[]; warnings: BrandValidationWarning[] }> {
    const errors: BrandValidationError[] = [];
    const warnings: BrandValidationWarning[] = [];

    // Validate required fields
    if (!config.brand?.name || config.brand.name.trim().length === 0) {
      errors.push({
        code: 'MISSING_BRAND_NAME',
        message: 'Brand name is required',
        path: 'brand.name',
        severity: 'error',
        category: 'branding'
      });
    }

    // Validate theme configuration
    if (!config.theme) {
      errors.push({
        code: 'MISSING_THEME',
        message: 'Brand theme configuration is required',
        path: 'theme',
        severity: 'error',
        category: 'design'
      });
    } else {
      // Validate colors
      if (!config.theme.colors) {
        errors.push({
          code: 'MISSING_COLORS',
          message: 'Brand colors are required',
          path: 'theme.colors',
          severity: 'error',
          category: 'design'
        });
      }

      // Validate typography
      if (!config.theme.typography) {
        errors.push({
          code: 'MISSING_TYPOGRAPHY',
          message: 'Typography configuration is required',
          path: 'theme.typography',
          severity: 'error',
          category: 'design'
        });
      }

      // Validate logo
      if (!config.theme.logo) {
        errors.push({
          code: 'MISSING_LOGO',
          message: 'Logo configuration is required',
          path: 'theme.logo',
          severity: 'error',
          category: 'branding'
        });
      }
    }

    // Industry-specific validation
    if (context.industry) {
      const industryWarnings = this.validateIndustrySpecific(config, context.industry);
      warnings.push(...industryWarnings);
    }

    // Audience-specific validation
    if (context.audience) {
      const audienceWarnings = this.validateAudienceSpecific(config, context.audience);
      warnings.push(...audienceWarnings);
    }

    return { errors, warnings };
  }

  /**
   * Run custom validation rules
   */
  private async runCustomRules(
    config: TenantBrandConfig,
    context: ValidationContext
  ): Promise<{ errors: BrandValidationError[]; warnings: BrandValidationWarning[] }> {
    const errors: BrandValidationError[] = [];
    const warnings: BrandValidationWarning[] = [];

    for (const rule of Array.from(this.customRules.values())) {
      if (!rule.enabled) continue;

      try {
        const result = rule.validator(config, context);
        
        if (!result.passed) {
          if (result.severity === 'error') {
            errors.push({
              code: rule.id,
              message: result.message,
              path: this.mapValidationPath(rule.id),
              severity: 'error',
              suggestion: result.suggestion,
              wcagLevel: rule.wcagLevel,
              category: rule.category
            });
          } else {
            warnings.push({
              code: rule.id,
              message: result.message,
              path: this.mapValidationPath(rule.id),
              suggestion: result.suggestion,
              category: rule.category
            });
          }
        }
      } catch (error) {
        console.error(`Error running custom rule ${rule.id}:`, error);
        warnings.push({
          code: 'CUSTOM_RULE_ERROR',
          message: `Custom rule ${rule.name} failed to execute`,
          path: 'customRules',
          suggestion: 'Check custom rule implementation',
          category: 'technical'
        });
      }
    }

    return { errors, warnings };
  }

  /**
   * Convert TenantBrandConfig to DynamicBrandConfig
   */
  private convertToDynamicConfig(config: TenantBrandConfig): DynamicBrandConfig {
    return {
      logo: config.theme?.logo || {
        src: '',
        alt: '',
        width: 40,
        height: 40,
        initials: '',
        fallbackBgColor: 'from-blue-600 to-indigo-600',
        showAsImage: false
      },
      brandName: {
        organizationName: config.brand?.name || 'Your Organization',
        appName: config.brand?.description || 'Micro App',
        fullBrand: config.brand?.name || 'Your Organization',
        shortBrand: config.brand?.description || 'Micro App',
        navBrand: config.brand?.name || 'Your Organization'
      },
      isCustom: config.brand?.isCustom || false,
      presetName: config.brand?.presetName
    };
  }

  /**
   * Map validation result ID to field path
   */
  private mapValidationPath(id: string): string {
    const pathMap: Record<string, string> = {
      'color-contrast-logo': 'theme.colors',
      'logo-accessibility': 'theme.logo',
      'brand-name-accessibility': 'brand.name',
      'typography-accessibility': 'theme.typography',
      'brand-name-usability': 'brand.name',
      'logo-usability': 'theme.logo',
      'color-usability': 'theme.colors',
      'color-harmony': 'theme.colors',
      'typography-consistency': 'theme.typography',
      'brand-element-consistency': 'brand',
      'brand-uniqueness': 'brand.name',
      'brand-memorability': 'brand.name',
      'brand-scalability': 'theme.logo'
    };

    return pathMap[id] || 'unknown';
  }

  /**
   * Calculate accessibility score
   */
  private calculateAccessibilityScore(errors: BrandValidationError[], warnings: BrandValidationWarning[]): number {
    let score = 100;
    
    errors.forEach(error => {
      if (error.category === 'accessibility') {
        score -= error.severity === 'error' ? 15 : 10;
      }
    });

    warnings.forEach(warning => {
      if (warning.category === 'accessibility') {
        score -= 5;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate usability score
   */
  private calculateUsabilityScore(errors: BrandValidationError[], warnings: BrandValidationWarning[]): number {
    let score = 100;
    
    errors.forEach(error => {
      if (error.category === 'usability') {
        score -= error.severity === 'error' ? 12 : 8;
      }
    });

    warnings.forEach(warning => {
      if (warning.category === 'usability') {
        score -= 4;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate design score
   */
  private calculateDesignScore(errors: BrandValidationError[], warnings: BrandValidationWarning[]): number {
    let score = 100;
    
    errors.forEach(error => {
      if (error.category === 'design') {
        score -= error.severity === 'error' ? 10 : 6;
      }
    });

    warnings.forEach(warning => {
      if (warning.category === 'design') {
        score -= 3;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Calculate brand score
   */
  private calculateBrandScore(errors: BrandValidationError[], warnings: BrandValidationWarning[]): number {
    let score = 100;
    
    errors.forEach(error => {
      if (error.category === 'branding') {
        score -= error.severity === 'error' ? 8 : 5;
      }
    });

    warnings.forEach(warning => {
      if (warning.category === 'branding') {
        score -= 2;
      }
    });

    return Math.max(0, score);
  }

  /**
   * Check WCAG compliance
   */
  private checkWcagCompliance(errors: BrandValidationError[], warnings: BrandValidationWarning[], level: 'A' | 'AA' | 'AAA'): boolean {
    const levelErrors = errors.filter(error => error.wcagLevel === level);
    return levelErrors.length === 0;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  private calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Validate industry-specific requirements
   */
  private validateIndustrySpecific(config: TenantBrandConfig, industry: string): BrandValidationWarning[] {
    const warnings: BrandValidationWarning[] = [];

    // Healthcare industry specific validation
    if (industry === 'healthcare') {
      if (config.theme?.colors?.primary && !this.isHealthcareAppropriate(config.theme.colors.primary)) {
        warnings.push({
          code: 'INAPPROPRIATE_HEALTHCARE_COLOR',
          message: 'Primary color may not be appropriate for healthcare industry',
          path: 'theme.colors.primary',
          suggestion: 'Consider using calming, professional colors like blues or greens',
          category: 'branding'
        });
      }
    }

    // Financial industry specific validation
    if (industry === 'financial') {
      if (config.theme?.colors?.primary && !this.isFinancialAppropriate(config.theme.colors.primary)) {
        warnings.push({
          code: 'INAPPROPRIATE_FINANCIAL_COLOR',
          message: 'Primary color may not convey trust and stability',
          path: 'theme.colors.primary',
          suggestion: 'Consider using professional colors like navy blue or dark green',
          category: 'branding'
        });
      }
    }

    return warnings;
  }

  /**
   * Validate audience-specific requirements
   */
  private validateAudienceSpecific(config: TenantBrandConfig, audience: string): BrandValidationWarning[] {
    const warnings: BrandValidationWarning[] = [];

    // Senior audience specific validation
    if (audience === 'seniors') {
      if (config.theme?.typography?.fontFamily && !this.isSeniorFriendly(config.theme.typography.fontFamily)) {
        warnings.push({
          code: 'INAPPROPRIATE_SENIOR_FONT',
          message: 'Font may not be senior-friendly',
          path: 'theme.typography.fontFamily',
          suggestion: 'Use clear, readable fonts like Arial or Helvetica',
          category: 'accessibility'
        });
      }
    }

    return warnings;
  }

  /**
   * Check if color is appropriate for healthcare industry
   */
  private isHealthcareAppropriate(color: string): boolean {
    // Simplified check - in reality, this would be more sophisticated
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Check if color is calming (lower saturation, cooler tones)
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    return saturation < 150 && (b > r || g > r);
  }

  /**
   * Check if color is appropriate for financial industry
   */
  private isFinancialAppropriate(color: string): boolean {
    // Simplified check - in reality, this would be more sophisticated
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Check if color is professional (darker, less saturated)
    const brightness = (r + g + b) / 3;
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    return brightness < 200 && saturation < 100;
  }

  /**
   * Check if font is senior-friendly
   */
  private isSeniorFriendly(fontFamily: string): boolean {
    const seniorFriendlyFonts = ['Arial', 'Helvetica', 'Verdana', 'Tahoma', 'Calibri'];
    return seniorFriendlyFonts.some(font => fontFamily.includes(font));
  }

  /**
   * Generate cache key for validation result
   */
  private generateCacheKey(config: TenantBrandConfig, context: ValidationContext): string {
    const configHash = JSON.stringify({
      brandId: config.brand?.id,
      brandName: config.brand?.name,
      theme: config.theme,
      strictness: context.strictness,
      industry: context.industry,
      audience: context.audience
    });
    
    return Buffer.from(configHash).toString('base64');
  }
}

/**
 * Global brand configuration validation service instance
 */
export const brandConfigValidator = new BrandConfigValidationService();

/**
 * Utility functions for brand configuration validation
 */
export const BrandConfigValidationUtils = {
  /**
   * Quick validation for common issues
   */
  async quickValidate(config: TenantBrandConfig): Promise<BrandValidationError[]> {
    return brandConfigValidator.quickValidate(config);
  },

  /**
   * Validate brand preset
   */
  async validatePreset(preset: BrandPreset, context?: ValidationContext): Promise<BrandValidationResult> {
    return brandConfigValidator.validateBrandPreset(preset, context);
  },

  /**
   * Get validation summary
   */
  getValidationSummary(result: BrandValidationResult): string {
    return brandConfigValidator.getValidationSummary(result);
  },

  /**
   * Get critical issues
   */
  getCriticalIssues(result: BrandValidationResult): BrandValidationError[] {
    return result.errors.filter(error => error.severity === 'error');
  },

  /**
   * Get warnings
   */
  getWarnings(result: BrandValidationResult): BrandValidationWarning[] {
    return result.warnings;
  },

  /**
   * Check WCAG compliance
   */
  isWcagCompliant(result: BrandValidationResult, level: 'A' | 'AA' | 'AAA'): boolean {
    return result.wcagCompliance[`level${level}`];
  },

  /**
   * Format validation result for display
   */
  formatValidationResult(result: BrandValidationResult): {
    status: 'valid' | 'warning' | 'error';
    message: string;
    details: string[];
  } {
    const { errors, warnings, overallScore } = result;
    
    let status: 'valid' | 'warning' | 'error';
    let message: string;
    
    if (errors.length === 0 && warnings.length === 0) {
      status = 'valid';
      message = `✅ Brand configuration is valid (Score: ${overallScore}/100)`;
    } else if (errors.length === 0) {
      status = 'warning';
      message = `⚠️ Brand configuration has ${warnings.length} warning(s) (Score: ${overallScore}/100)`;
    } else {
      status = 'error';
      message = `❌ Brand configuration has ${errors.length} error(s) and ${warnings.length} warning(s) (Score: ${overallScore}/100)`;
    }

    const details: string[] = [];
    
    errors.forEach(error => {
      details.push(`❌ ${error.message}${error.suggestion ? ` (${error.suggestion})` : ''}`);
    });
    
    warnings.forEach(warning => {
      details.push(`⚠️ ${warning.message}${warning.suggestion ? ` (${warning.suggestion})` : ''}`);
    });

    return { status, message, details };
  }
};
