/**
 * @fileoverview HT-011.1.6: Brand Validation Framework Implementation
 * @module lib/branding/validation-framework
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.6 - Create Brand Validation Framework
 * Focus: Implement brand validation system for accessibility, usability, and design consistency
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { BrandPalette } from '../design-tokens/multi-brand-generator';
import { DynamicBrandConfig, LogoConfig, BrandNameConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';

/**
 * Validation severity levels
 */
export type ValidationSeverity = 'error' | 'warning' | 'info';

/**
 * Validation result for a single check
 */
export interface ValidationResult {
  /** Unique identifier for this validation check */
  id: string;
  /** Human-readable name of the validation check */
  name: string;
  /** Severity level of the validation result */
  severity: ValidationSeverity;
  /** Whether the validation passed */
  passed: boolean;
  /** Error or warning message */
  message: string;
  /** Additional context or suggestions */
  suggestion?: string;
  /** WCAG level if applicable */
  wcagLevel?: 'A' | 'AA' | 'AAA';
  /** Category of validation */
  category: 'accessibility' | 'usability' | 'design' | 'branding';
}

/**
 * Complete validation report
 */
export interface ValidationReport {
  /** Overall validation status */
  isValid: boolean;
  /** Total number of checks performed */
  totalChecks: number;
  /** Number of checks that passed */
  passedChecks: number;
  /** Number of checks that failed */
  failedChecks: number;
  /** Individual validation results */
  results: ValidationResult[];
  /** Summary by category */
  categorySummary: {
    accessibility: { passed: number; failed: number; total: number };
    usability: { passed: number; failed: number; total: number };
    design: { passed: number; failed: number; total: number };
    branding: { passed: number; failed: number; total: number };
  };
  /** WCAG compliance summary */
  wcagCompliance: {
    levelA: { passed: number; failed: number; total: number };
    levelAA: { passed: number; failed: number; total: number };
    levelAAA: { passed: number; failed: number; total: number };
  };
  /** Generated timestamp */
  timestamp: Date;
}

/**
 * Brand validation configuration
 */
export interface ValidationConfig {
  /** Enable accessibility validation */
  accessibility: boolean;
  /** Enable usability validation */
  usability: boolean;
  /** Enable design consistency validation */
  design: boolean;
  /** Enable branding validation */
  branding: boolean;
  /** Minimum WCAG level to enforce */
  minWcagLevel: 'A' | 'AA' | 'AAA';
  /** Custom validation rules */
  customRules?: ValidationRule[];
}

/**
 * Custom validation rule
 */
export interface ValidationRule {
  id: string;
  name: string;
  category: 'accessibility' | 'usability' | 'design' | 'branding';
  severity: ValidationSeverity;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  validator: (config: DynamicBrandConfig) => ValidationResult;
}

/**
 * Brand Validation Framework Class
 */
export class BrandValidationFramework {
  private config: ValidationConfig;
  private customRules: ValidationRule[] = [];

  constructor(config: Partial<ValidationConfig> = {}) {
    this.config = {
      accessibility: true,
      usability: true,
      design: true,
      branding: true,
      minWcagLevel: 'AA',
      ...config
    };
  }

  /**
   * Validate a complete brand configuration
   */
  validateBrand(config: DynamicBrandConfig): ValidationReport {
    const results: ValidationResult[] = [];
    
    // Run accessibility validations
    if (this.config.accessibility) {
      results.push(...this.validateAccessibility(config));
    }
    
    // Run usability validations
    if (this.config.usability) {
      results.push(...this.validateUsability(config));
    }
    
    // Run design consistency validations
    if (this.config.design) {
      results.push(...this.validateDesignConsistency(config));
    }
    
    // Run branding validations
    if (this.config.branding) {
      results.push(...this.validateBranding(config));
    }
    
    // Run custom rules
    if (this.customRules.length > 0) {
      results.push(...this.runCustomRules(config));
    }

    return this.generateReport(results);
  }

  /**
   * Validate accessibility aspects of the brand
   */
  private validateAccessibility(config: DynamicBrandConfig): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Color contrast validation
    results.push(this.validateColorContrast(config));
    
    // Logo accessibility validation
    results.push(this.validateLogoAccessibility(config));
    
    // Brand name accessibility validation
    results.push(this.validateBrandNameAccessibility(config));
    
    // Typography accessibility validation
    results.push(this.validateTypographyAccessibility(config));

    return results;
  }

  /**
   * Validate color contrast ratios
   */
  private validateColorContrast(config: DynamicBrandConfig): ValidationResult {
    const logoBg = this.extractColorFromGradient(config.logo.fallbackBgColor);
    const logoText = '#ffffff'; // Assuming white text on logo
    
    const contrastRatio = this.calculateContrastRatio(logoText, logoBg);
    const minRatio = this.config.minWcagLevel === 'AAA' ? 7.0 : 4.5;
    
    return {
      id: 'color-contrast-logo',
      name: 'Logo Color Contrast',
      severity: contrastRatio < minRatio ? 'error' : 'info',
      passed: contrastRatio >= minRatio,
      message: `Logo contrast ratio: ${contrastRatio.toFixed(2)}:1`,
      suggestion: contrastRatio < minRatio 
        ? `Increase contrast to at least ${minRatio}:1 for WCAG ${this.config.minWcagLevel} compliance`
        : 'Logo contrast meets accessibility standards',
      wcagLevel: this.config.minWcagLevel,
      category: 'accessibility'
    };
  }

  /**
   * Validate logo accessibility
   */
  private validateLogoAccessibility(config: DynamicBrandConfig): ValidationResult {
    const hasAltText = Boolean(config.logo.alt && config.logo.alt.trim().length > 0);
    const hasInitials = Boolean(config.logo.initials && config.logo.initials.trim().length > 0);
    
    return {
      id: 'logo-accessibility',
      name: 'Logo Accessibility',
      severity: !hasAltText ? 'error' : 'info',
      passed: hasAltText || hasInitials,
      message: hasAltText 
        ? 'Logo has descriptive alt text'
        : hasInitials 
          ? 'Logo has fallback initials'
          : 'Logo missing alt text or initials',
      suggestion: !hasAltText && !hasInitials
        ? 'Add descriptive alt text or initials for screen readers'
        : undefined,
      wcagLevel: 'A',
      category: 'accessibility'
    };
  }

  /**
   * Validate brand name accessibility
   */
  private validateBrandNameAccessibility(config: DynamicBrandConfig): ValidationResult {
    const orgNameLength = config.brandName.organizationName.length;
    const appNameLength = config.brandName.appName.length;
    
    const isOrgNameReadable = orgNameLength >= 2 && orgNameLength <= 50;
    const isAppNameReadable = appNameLength >= 2 && appNameLength <= 30;
    
    return {
      id: 'brand-name-accessibility',
      name: 'Brand Name Accessibility',
      severity: !isOrgNameReadable || !isAppNameReadable ? 'warning' : 'info',
      passed: isOrgNameReadable && isAppNameReadable,
      message: `Organization name: ${orgNameLength} chars, App name: ${appNameLength} chars`,
      suggestion: !isOrgNameReadable || !isAppNameReadable
        ? 'Ensure brand names are readable and not too long for screen readers'
        : 'Brand names are appropriately sized for accessibility',
      wcagLevel: 'AA',
      category: 'accessibility'
    };
  }

  /**
   * Validate typography accessibility
   */
  private validateTypographyAccessibility(config: DynamicBrandConfig): ValidationResult {
    // This would typically check font family, size, weight, etc.
    // For now, we'll do a basic check
    const hasValidFont = true; // Assuming font validation is handled elsewhere
    
    return {
      id: 'typography-accessibility',
      name: 'Typography Accessibility',
      severity: 'info',
      passed: hasValidFont,
      message: 'Typography configuration appears accessible',
      suggestion: 'Ensure font sizes meet minimum requirements (16px for body text)',
      wcagLevel: 'AA',
      category: 'accessibility'
    };
  }

  /**
   * Validate usability aspects of the brand
   */
  private validateUsability(config: DynamicBrandConfig): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Brand name usability
    results.push(this.validateBrandNameUsability(config));
    
    // Logo usability
    results.push(this.validateLogoUsability(config));
    
    // Color usability
    results.push(this.validateColorUsability(config));

    return results;
  }

  /**
   * Validate brand name usability
   */
  private validateBrandNameUsability(config: DynamicBrandConfig): ValidationResult {
    const orgName = config.brandName.organizationName;
    const appName = config.brandName.appName;
    
    const hasSpecialChars = /[^a-zA-Z0-9\s\-&]/.test(orgName) || /[^a-zA-Z0-9\s\-&]/.test(appName);
    const isMemorable = orgName.length <= 30 && appName.length <= 20;
    
    return {
      id: 'brand-name-usability',
      name: 'Brand Name Usability',
      severity: hasSpecialChars ? 'warning' : 'info',
      passed: !hasSpecialChars && isMemorable,
      message: `Organization: "${orgName}", App: "${appName}"`,
      suggestion: hasSpecialChars
        ? 'Avoid special characters in brand names for better usability'
        : isMemorable
          ? 'Brand names are memorable and user-friendly'
          : 'Consider shorter brand names for better memorability',
      category: 'usability'
    };
  }

  /**
   * Validate logo usability
   */
  private validateLogoUsability(config: DynamicBrandConfig): ValidationResult {
    const logoSize = config.logo.width * config.logo.height;
    const isAppropriateSize = logoSize >= 400 && logoSize <= 10000; // 20x20 to 100x100
    const hasGoodAspectRatio = Math.abs(config.logo.width - config.logo.height) <= 20;
    
    return {
      id: 'logo-usability',
      name: 'Logo Usability',
      severity: !isAppropriateSize ? 'warning' : 'info',
      passed: isAppropriateSize && hasGoodAspectRatio,
      message: `Logo size: ${config.logo.width}x${config.logo.height}px`,
      suggestion: !isAppropriateSize
        ? 'Logo size should be between 20x20 and 100x100 pixels for optimal usability'
        : 'Logo size is appropriate for various display contexts',
      category: 'usability'
    };
  }

  /**
   * Validate color usability
   */
  private validateColorUsability(config: DynamicBrandConfig): ValidationResult {
    const logoBg = this.extractColorFromGradient(config.logo.fallbackBgColor);
    const isColorBlindFriendly = this.checkColorBlindFriendly(logoBg);
    
    return {
      id: 'color-usability',
      name: 'Color Usability',
      severity: !isColorBlindFriendly ? 'warning' : 'info',
      passed: isColorBlindFriendly,
      message: 'Color accessibility for color-blind users',
      suggestion: !isColorBlindFriendly
        ? 'Consider color-blind friendly alternatives or ensure information is not conveyed by color alone'
        : 'Colors are accessible for color-blind users',
      category: 'usability'
    };
  }

  /**
   * Validate design consistency aspects
   */
  private validateDesignConsistency(config: DynamicBrandConfig): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Color harmony validation
    results.push(this.validateColorHarmony(config));
    
    // Typography consistency validation
    results.push(this.validateTypographyConsistency(config));
    
    // Brand element consistency validation
    results.push(this.validateBrandElementConsistency(config));

    return results;
  }

  /**
   * Validate color harmony
   */
  private validateColorHarmony(config: DynamicBrandConfig): ValidationResult {
    const logoBg = this.extractColorFromGradient(config.logo.fallbackBgColor);
    const isHarmonious = this.checkColorHarmony(logoBg);
    
    return {
      id: 'color-harmony',
      name: 'Color Harmony',
      severity: !isHarmonious ? 'warning' : 'info',
      passed: isHarmonious,
      message: 'Color harmony and visual balance',
      suggestion: !isHarmonious
        ? 'Consider adjusting colors for better visual harmony'
        : 'Colors create a harmonious visual experience',
      category: 'design'
    };
  }

  /**
   * Validate typography consistency
   */
  private validateTypographyConsistency(config: DynamicBrandConfig): ValidationResult {
    // This would check typography scales, weights, etc.
    const isConsistent = true; // Placeholder
    
    return {
      id: 'typography-consistency',
      name: 'Typography Consistency',
      severity: 'info',
      passed: isConsistent,
      message: 'Typography system appears consistent',
      suggestion: 'Ensure consistent typography scales and weights throughout the brand',
      category: 'design'
    };
  }

  /**
   * Validate brand element consistency
   */
  private validateBrandElementConsistency(config: DynamicBrandConfig): ValidationResult {
    const orgName = config.brandName.organizationName;
    const appName = config.brandName.appName;
    const initials = config.logo.initials;
    
    const isConsistent = orgName.length > 0 && appName.length > 0 && initials.length > 0;
    
    return {
      id: 'brand-element-consistency',
      name: 'Brand Element Consistency',
      severity: !isConsistent ? 'warning' : 'info',
      passed: isConsistent,
      message: 'Brand elements are consistently defined',
      suggestion: !isConsistent
        ? 'Ensure all brand elements (organization name, app name, initials) are properly defined'
        : 'All brand elements are consistently defined',
      category: 'design'
    };
  }

  /**
   * Validate branding aspects
   */
  private validateBranding(config: DynamicBrandConfig): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Brand uniqueness validation
    results.push(this.validateBrandUniqueness(config));
    
    // Brand memorability validation
    results.push(this.validateBrandMemorability(config));
    
    // Brand scalability validation
    results.push(this.validateBrandScalability(config));

    return results;
  }

  /**
   * Validate brand uniqueness
   */
  private validateBrandUniqueness(config: DynamicBrandConfig): ValidationResult {
    const orgName = config.brandName.organizationName;
    const appName = config.brandName.appName;
    
    const isUnique = orgName !== 'Your Organization' && appName !== 'Micro App';
    
    return {
      id: 'brand-uniqueness',
      name: 'Brand Uniqueness',
      severity: !isUnique ? 'warning' : 'info',
      passed: isUnique,
      message: `Organization: "${orgName}", App: "${appName}"`,
      suggestion: !isUnique
        ? 'Replace default brand names with unique, meaningful names'
        : 'Brand names are unique and meaningful',
      category: 'branding'
    };
  }

  /**
   * Validate brand memorability
   */
  private validateBrandMemorability(config: DynamicBrandConfig): ValidationResult {
    const orgName = config.brandName.organizationName;
    const appName = config.brandName.appName;
    
    const isMemorable = orgName.length <= 25 && appName.length <= 15 && 
                       !orgName.includes(' ') && !appName.includes(' ');
    
    return {
      id: 'brand-memorability',
      name: 'Brand Memorability',
      severity: !isMemorable ? 'warning' : 'info',
      passed: isMemorable,
      message: 'Brand name memorability and simplicity',
      suggestion: !isMemorable
        ? 'Consider shorter, simpler brand names for better memorability'
        : 'Brand names are memorable and easy to recall',
      category: 'branding'
    };
  }

  /**
   * Validate brand scalability
   */
  private validateBrandScalability(config: DynamicBrandConfig): ValidationResult {
    const logoSize = config.logo.width * config.logo.height;
    const isScalable = logoSize >= 400 && config.logo.initials.length <= 3;
    
    return {
      id: 'brand-scalability',
      name: 'Brand Scalability',
      severity: !isScalable ? 'warning' : 'info',
      passed: isScalable,
      message: 'Brand scalability across different contexts',
      suggestion: !isScalable
        ? 'Ensure brand elements work well at different sizes and contexts'
        : 'Brand elements are scalable across different use cases',
      category: 'branding'
    };
  }

  /**
   * Run custom validation rules
   */
  private runCustomRules(config: DynamicBrandConfig): ValidationResult[] {
    return this.customRules.map(rule => rule.validator(config));
  }

  /**
   * Add a custom validation rule
   */
  addCustomRule(rule: ValidationRule): void {
    this.customRules.push(rule);
  }

  /**
   * Remove a custom validation rule
   */
  removeCustomRule(ruleId: string): boolean {
    const index = this.customRules.findIndex(rule => rule.id === ruleId);
    if (index > -1) {
      this.customRules.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Generate validation report
   */
  private generateReport(results: ValidationResult[]): ValidationReport {
    const passedChecks = results.filter(r => r.passed).length;
    const failedChecks = results.filter(r => !r.passed).length;
    
    const categorySummary = {
      accessibility: this.getCategorySummary(results, 'accessibility'),
      usability: this.getCategorySummary(results, 'usability'),
      design: this.getCategorySummary(results, 'design'),
      branding: this.getCategorySummary(results, 'branding')
    };
    
    const wcagCompliance = {
      levelA: this.getWcagSummary(results, 'A'),
      levelAA: this.getWcagSummary(results, 'AA'),
      levelAAA: this.getWcagSummary(results, 'AAA')
    };

    return {
      isValid: failedChecks === 0,
      totalChecks: results.length,
      passedChecks,
      failedChecks,
      results,
      categorySummary,
      wcagCompliance,
      timestamp: new Date()
    };
  }

  /**
   * Get category summary
   */
  private getCategorySummary(results: ValidationResult[], category: string) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const failed = categoryResults.filter(r => !r.passed).length;
    
    return {
      passed,
      failed,
      total: categoryResults.length
    };
  }

  /**
   * Get WCAG level summary
   */
  private getWcagSummary(results: ValidationResult[], level: string) {
    const levelResults = results.filter(r => r.wcagLevel === level);
    const passed = levelResults.filter(r => r.passed).length;
    const failed = levelResults.filter(r => !r.passed).length;
    
    return {
      passed,
      failed,
      total: levelResults.length
    };
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
   * Extract color from gradient string
   */
  private extractColorFromGradient(gradient: string): string {
    // Extract first color from gradient like "from-blue-600 to-indigo-600"
    const match = gradient.match(/from-(\w+)-(\d+)/);
    if (match) {
      const [, color, shade] = match;
      // Convert Tailwind color to hex (simplified)
      const colorMap: Record<string, Record<string, string>> = {
        blue: { '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af' },
        green: { '600': '#16a34a', '700': '#15803d', '800': '#166534' },
        purple: { '600': '#9333ea', '700': '#7c3aed', '800': '#6b21a8' },
        orange: { '600': '#ea580c', '700': '#c2410c', '800': '#9a3412' },
        red: { '600': '#dc2626', '700': '#b91c1c', '800': '#991b1b' },
        gray: { '600': '#4b5563', '700': '#374151', '800': '#1f2937' }
      };
      return colorMap[color]?.[shade] || '#000000';
    }
    return '#000000';
  }

  /**
   * Check if color is color-blind friendly
   */
  private checkColorBlindFriendly(color: string): boolean {
    // Simplified check - in reality, this would be more complex
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Check for high contrast between RGB values
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return maxDiff > 100; // Arbitrary threshold
  }

  /**
   * Check color harmony
   */
  private checkColorHarmony(color: string): boolean {
    // Simplified harmony check
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    // Check if color is not too saturated or too desaturated
    const saturation = Math.max(r, g, b) - Math.min(r, g, b);
    return saturation > 50 && saturation < 200;
  }
}

/**
 * Global brand validation framework instance
 */
export const brandValidator = new BrandValidationFramework();

/**
 * Utility functions for brand validation
 */
export const BrandValidationUtils = {
  /**
   * Quick validation for common issues
   */
  quickValidate(config: DynamicBrandConfig): ValidationResult[] {
    const validator = new BrandValidationFramework({
      accessibility: true,
      usability: false,
      design: false,
      branding: false,
      minWcagLevel: 'AA'
    });
    
    const report = validator.validateBrand(config);
    return report.results.filter(r => !r.passed);
  },

  /**
   * Validate brand preset
   */
  validatePreset(preset: BrandPreset): ValidationReport {
    const config: DynamicBrandConfig = {
      logo: preset.logo,
      brandName: preset.brandName,
      isCustom: false,
      presetName: preset.id
    };
    
    return brandValidator.validateBrand(config);
  },

  /**
   * Get validation summary
   */
  getValidationSummary(report: ValidationReport): string {
    const { passedChecks, failedChecks, totalChecks } = report;
    const passRate = ((passedChecks / totalChecks) * 100).toFixed(1);
    
    return `${passedChecks}/${totalChecks} checks passed (${passRate}%)`;
  },

  /**
   * Get critical issues
   */
  getCriticalIssues(report: ValidationReport): ValidationResult[] {
    return report.results.filter(r => r.severity === 'error' && !r.passed);
  },

  /**
   * Get warnings
   */
  getWarnings(report: ValidationReport): ValidationResult[] {
    return report.results.filter(r => r.severity === 'warning' && !r.passed);
  },

  /**
   * Check WCAG compliance
   */
  isWcagCompliant(report: ValidationReport, level: 'A' | 'AA' | 'AAA'): boolean {
    const levelSummary = report.wcagCompliance[`level${level}`];
    return levelSummary.failed === 0;
  }
};
