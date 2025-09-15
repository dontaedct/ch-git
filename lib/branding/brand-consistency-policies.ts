/**
 * @fileoverview OSS Hero Brand Consistency Policies Implementation
 * @description Comprehensive brand consistency policies for design system
 * @version 1.0.0
 * @author OSS Hero System
 * @module HT-011.4.5: Implement Brand-Specific Design Policies
 */

import { TenantBrandConfig, BrandTheme } from './types';
import { 
  BrandDesignPolicy, 
  BrandPolicyResult, 
  BrandPolicyViolation, 
  BrandPolicyRecommendation,
  BrandPolicyRule 
} from './brand-design-policies';

/**
 * Brand consistency policy implementations
 */
export class BrandConsistencyPolicies {
  
  /**
   * Create comprehensive color consistency policy
   */
  static createColorConsistencyPolicy(): BrandDesignPolicy {
    return {
      id: 'color-consistency-comprehensive',
      name: 'Comprehensive Brand Color Consistency',
      description: 'Ensures comprehensive consistency of brand colors across all components and interfaces',
      type: 'color-consistency',
      category: 'design-consistency',
      severity: 'critical',
      enforcement: 'required',
      isActive: true,
      rules: [
        {
          id: 'primary-color-definition',
          name: 'Primary Color Definition',
          description: 'Primary brand color must be properly defined',
          condition: 'Primary color is defined with valid hex value',
          validator: (config) => {
            const primary = config.theme?.colors?.primary;
            return Boolean(primary && /^#[0-9a-fA-F]{6}$/.test(primary));
          },
          errorMessage: 'Primary brand color must be a valid hex color (e.g., #007AFF)',
        },
        {
          id: 'secondary-color-definition',
          name: 'Secondary Color Definition',
          description: 'Secondary brand color must be properly defined',
          condition: 'Secondary color is defined with valid hex value',
          validator: (config) => {
            const secondary = config.theme?.colors?.secondary;
            return Boolean(secondary && /^#[0-9a-fA-F]{6}$/.test(secondary));
          },
          errorMessage: 'Secondary brand color must be a valid hex color (e.g., #34C759)',
        },
        {
          id: 'neutral-color-definition',
          name: 'Neutral Color Definition',
          description: 'Neutral brand color must be properly defined',
          condition: 'Neutral color is defined with valid hex value',
          validator: (config) => {
            const neutral = config.theme?.colors?.neutral;
            return Boolean(neutral && /^#[0-9a-fA-F]{6}$/.test(neutral));
          },
          errorMessage: 'Neutral brand color must be a valid hex color (e.g., #8E8E93)',
        },
        {
          id: 'accent-color-definition',
          name: 'Accent Color Definition',
          description: 'Accent brand color must be properly defined',
          condition: 'Accent color is defined with valid hex value',
          validator: (config) => {
            const accent = config.theme?.colors?.accent;
            return Boolean(accent && /^#[0-9a-fA-F]{6}$/.test(accent));
          },
          errorMessage: 'Accent brand color must be a valid hex color (e.g., #FF9500)',
        },
        {
          id: 'semantic-colors-definition',
          name: 'Semantic Colors Definition',
          description: 'Semantic colors (success, warning, error, info) must be defined',
          condition: 'All semantic colors are defined with valid hex values',
          validator: (config) => {
            const colors = config.theme?.colors;
            return Boolean(colors?.success && colors?.warning && colors?.error && colors?.info &&
                   /^#[0-9a-fA-F]{6}$/.test(colors.success) &&
                   /^#[0-9a-fA-F]{6}$/.test(colors.warning) &&
                   /^#[0-9a-fA-F]{6}$/.test(colors.error) &&
                   /^#[0-9a-fA-F]{6}$/.test(colors.info));
          },
          errorMessage: 'All semantic colors (success, warning, error, info) must be defined with valid hex values',
        },
        {
          id: 'color-palette-uniqueness',
          name: 'Color Palette Uniqueness',
          description: 'All brand colors must be unique',
          condition: 'No duplicate colors in brand palette',
          validator: (config) => {
            const colors = config.theme?.colors;
            if (!colors) return false;
            
            const colorValues = Object.values(colors).filter(value => 
              typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
            );
            
            return colorValues.length === new Set(colorValues).size;
          },
          errorMessage: 'Brand colors must be unique - no duplicate colors allowed',
        },
      ],
      validator: (config) => this.validateColorConsistency(config),
      remediation: [
        {
          id: 'define-brand-colors',
          type: 'guided',
          description: 'Define complete brand color palette',
          steps: [
            'Identify primary brand color from brand guidelines',
            'Define secondary color that complements primary',
            'Choose neutral color for text and backgrounds',
            'Select accent color for highlights and CTAs',
            'Define semantic colors for success, warning, error, info',
            'Ensure all colors are unique and accessible',
          ],
          codeExample: `
// Example brand color configuration
const brandColors = {
  primary: '#007AFF',    // Blue
  secondary: '#34C759',  // Green
  neutral: '#8E8E93',    // Gray
  accent: '#FF9500',     // Orange
  success: '#34C759',    // Green
  warning: '#FF9500',    // Orange
  error: '#FF3B30',      // Red
  info: '#007AFF',       // Blue
};`,
        },
      ],
      documentation: {
        overview: 'Ensures comprehensive consistency of brand colors across all components and interfaces',
        rationale: 'Consistent color usage maintains brand identity, improves user experience, and ensures accessibility',
        examples: {
          good: [
            'Using primary color for main actions and CTAs',
            'Using secondary color for secondary actions',
            'Using neutral colors for text and backgrounds',
            'Using accent color for highlights and important elements',
            'Using semantic colors consistently for status indicators',
          ],
          bad: [
            'Using random colors not in brand palette',
            'Using hardcoded hex colors in components',
            'Inconsistent color usage across similar components',
            'Using duplicate colors in palette',
            'Missing semantic color definitions',
          ],
        },
        references: [
          'Brand Guidelines Document',
          'Color Theory Best Practices',
          'Design System Standards',
          'WCAG Color Guidelines',
        ],
        relatedPolicies: ['color-accessibility', 'color-contrast', 'component-consistency'],
      },
    };
  }

  /**
   * Create typography consistency policy
   */
  static createTypographyConsistencyPolicy(): BrandDesignPolicy {
    return {
      id: 'typography-consistency-comprehensive',
      name: 'Comprehensive Brand Typography Consistency',
      description: 'Ensures comprehensive consistency of brand typography across all components and interfaces',
      type: 'typography-consistency',
      category: 'design-consistency',
      severity: 'high',
      enforcement: 'required',
      isActive: true,
      rules: [
        {
          id: 'font-family-definition',
          name: 'Font Family Definition',
          description: 'Brand font family must be properly defined',
          condition: 'Font family is defined and not empty',
          validator: (config) => {
            const fontFamily = config.theme?.typography?.fontFamily;
            return Boolean(fontFamily && fontFamily.trim().length > 0);
          },
          errorMessage: 'Brand font family must be defined',
        },
        {
          id: 'font-weights-definition',
          name: 'Font Weights Definition',
          description: 'Brand font weights must be properly defined',
          condition: 'Font weights array is defined with valid values',
          validator: (config) => {
            const fontWeights = config.theme?.typography?.fontWeights;
            return Boolean(fontWeights && Array.isArray(fontWeights) && fontWeights.length > 0 &&
                   fontWeights.every(weight => typeof weight === 'number' && weight >= 100 && weight <= 900));
          },
          errorMessage: 'Brand font weights must be defined as array of valid numbers (100-900)',
        },
        {
          id: 'font-display-definition',
          name: 'Font Display Definition',
          description: 'Font display property must be defined for performance',
          condition: 'Font display is defined with valid value',
          validator: (config) => {
            const fontDisplay = config.theme?.typography?.fontDisplay;
            return Boolean(fontDisplay && ['auto', 'block', 'swap', 'fallback', 'optional'].includes(fontDisplay));
          },
          errorMessage: 'Font display must be defined with valid value (auto, block, swap, fallback, optional)',
        },
        {
          id: 'typography-scale-definition',
          name: 'Typography Scale Definition',
          description: 'Typography scale must be defined for consistent sizing',
          condition: 'Typography scale includes all required sizes',
          validator: (config): boolean => {
            const scale = config.theme?.typography?.scale;
            return !!(scale && scale.xs && scale.sm && scale.base && scale.lg && scale.xl && scale['2xl']);
          },
          errorMessage: 'Typography scale must include all required sizes (xs, sm, base, lg, xl, 2xl)',
        },
      ],
      validator: (config) => this.validateTypographyConsistency(config),
      remediation: [
        {
          id: 'define-brand-typography',
          type: 'guided',
          description: 'Define complete brand typography system',
          steps: [
            'Choose primary font family from brand guidelines',
            'Define font weights (e.g., 400, 500, 600, 700)',
            'Set font display property for performance',
            'Create typography scale with consistent sizing',
            'Test typography across different devices',
          ],
          codeExample: `
// Example brand typography configuration
const brandTypography = {
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeights: [400, 500, 600, 700],
  fontDisplay: 'swap',
  scale: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
  },
};`,
        },
      ],
      documentation: {
        overview: 'Ensures comprehensive consistency of brand typography across all components and interfaces',
        rationale: 'Consistent typography maintains brand identity, improves readability, and ensures accessibility',
        examples: {
          good: [
            'Using brand font family consistently across all components',
            'Using defined font weights for different text hierarchies',
            'Using typography scale for consistent sizing',
            'Implementing proper font loading with display property',
          ],
          bad: [
            'Using different font families across components',
            'Using arbitrary font sizes not in typography scale',
            'Using undefined font weights',
            'Not implementing proper font loading',
          ],
        },
        references: [
          'Brand Guidelines Document',
          'Typography Best Practices',
          'Font Loading Optimization',
          'WCAG Typography Guidelines',
        ],
        relatedPolicies: ['typography-accessibility', 'typography-readability', 'component-consistency'],
      },
    };
  }

  /**
   * Create component consistency policy
   */
  static createComponentConsistencyPolicy(): BrandDesignPolicy {
    return {
      id: 'component-consistency-comprehensive',
      name: 'Comprehensive Brand Component Consistency',
      description: 'Ensures comprehensive consistency of brand components across all interfaces',
      type: 'component-consistency',
      category: 'design-consistency',
      severity: 'high',
      enforcement: 'required',
      isActive: true,
      rules: [
        {
          id: 'logo-consistency',
          name: 'Logo Consistency',
          description: 'Brand logo must be consistently used across all interfaces',
          condition: 'Logo is defined with proper dimensions and alt text',
          validator: (config): boolean => {
            const logo = config.theme?.logo;
            return !!(logo && logo.src && logo.alt && logo.width && logo.height);
          },
          errorMessage: 'Brand logo must be defined with src, alt text, width, and height',
        },
        {
          id: 'brand-name-consistency',
          name: 'Brand Name Consistency',
          description: 'Brand name must be consistently used across all interfaces',
          condition: 'Brand name is defined and not empty',
          validator: (config) => {
            const brandName = config.brand?.name;
            return Boolean(brandName && brandName.trim().length > 0);
          },
          errorMessage: 'Brand name must be defined and not empty',
        },
        {
          id: 'component-styling-consistency',
          name: 'Component Styling Consistency',
          description: 'Components must use consistent brand styling',
          condition: 'Components use brand colors and typography consistently',
          validator: (config) => {
            // This would be implemented with actual component analysis
            return true; // Placeholder
          },
          errorMessage: 'Components must use brand colors and typography consistently',
        },
        {
          id: 'spacing-consistency',
          name: 'Spacing Consistency',
          description: 'Spacing must be consistent across all components',
          condition: 'Spacing system is defined and used consistently',
          validator: (config): boolean => {
            const spacing = config.theme?.spacing;
            return !!(spacing && spacing.sm && spacing.md && spacing.lg && spacing.xl);
          },
          errorMessage: 'Spacing system must be defined with sm, md, lg, xl values',
        },
      ],
      validator: (config) => this.validateComponentConsistency(config),
      remediation: [
        {
          id: 'define-brand-components',
          type: 'guided',
          description: 'Define consistent brand components',
          steps: [
            'Define brand logo with proper dimensions',
            'Set consistent brand name usage',
            'Create component styling guidelines',
            'Define spacing system',
            'Test components across different contexts',
          ],
          codeExample: `
// Example brand component configuration
const brandComponents = {
  logo: {
    src: '/logo.svg',
    alt: 'Brand Logo',
    width: 120,
    height: 40,
  },
  spacing: {
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },
};`,
        },
      ],
      documentation: {
        overview: 'Ensures comprehensive consistency of brand components across all interfaces',
        rationale: 'Consistent components maintain brand identity and improve user experience',
        examples: {
          good: [
            'Using brand logo consistently across all pages',
            'Using consistent brand name formatting',
            'Applying brand styling to all components',
            'Using defined spacing system consistently',
          ],
          bad: [
            'Using different logos across pages',
            'Inconsistent brand name usage',
            'Components not following brand styling',
            'Arbitrary spacing not in defined system',
          ],
        },
        references: [
          'Brand Guidelines Document',
          'Component Design System',
          'Spacing Guidelines',
          'Logo Usage Guidelines',
        ],
        relatedPolicies: ['brand-guidelines', 'brand-identity', 'component-accessibility'],
      },
    };
  }

  /**
   * Validate color consistency
   */
  private static validateColorConsistency(config: TenantBrandConfig): BrandPolicyResult {
    const violations: BrandPolicyViolation[] = [];
    const recommendations: BrandPolicyRecommendation[] = [];
    let score = 100;

    // Check primary color
    const primary = config.theme?.colors?.primary;
    if (!primary) {
      violations.push({
        id: 'missing-primary-color',
        ruleId: 'primary-color-definition',
        severity: 'critical',
        message: 'Primary brand color is not defined',
        suggestedFix: 'Define primary brand color with valid hex value (e.g., #007AFF)',
      });
      score -= 25;
    } else if (!/^#[0-9a-fA-F]{6}$/.test(primary)) {
      violations.push({
        id: 'invalid-primary-color',
        ruleId: 'primary-color-definition',
        severity: 'critical',
        message: 'Primary brand color must be a valid hex color',
        suggestedFix: 'Use valid hex color format (e.g., #007AFF)',
      });
      score -= 25;
    }

    // Check secondary color
    const secondary = config.theme?.colors?.secondary;
    if (!secondary) {
      violations.push({
        id: 'missing-secondary-color',
        ruleId: 'secondary-color-definition',
        severity: 'high',
        message: 'Secondary brand color is not defined',
        suggestedFix: 'Define secondary brand color with valid hex value (e.g., #34C759)',
      });
      score -= 20;
    } else if (!/^#[0-9a-fA-F]{6}$/.test(secondary)) {
      violations.push({
        id: 'invalid-secondary-color',
        ruleId: 'secondary-color-definition',
        severity: 'high',
        message: 'Secondary brand color must be a valid hex color',
        suggestedFix: 'Use valid hex color format (e.g., #34C759)',
      });
      score -= 20;
    }

    // Check neutral color
    const neutral = config.theme?.colors?.neutral;
    if (!neutral) {
      violations.push({
        id: 'missing-neutral-color',
        ruleId: 'neutral-color-definition',
        severity: 'medium',
        message: 'Neutral brand color is not defined',
        suggestedFix: 'Define neutral brand color with valid hex value (e.g., #8E8E93)',
      });
      score -= 15;
    }

    // Check semantic colors
    const colors = config.theme?.colors;
    if (!colors?.success || !colors?.warning || !colors?.error || !colors?.info) {
      violations.push({
        id: 'missing-semantic-colors',
        ruleId: 'semantic-colors-definition',
        severity: 'high',
        message: 'Semantic colors (success, warning, error, info) are not fully defined',
        suggestedFix: 'Define all semantic colors with valid hex values',
      });
      score -= 20;
    }

    // Add recommendations
    if (violations.length === 0) {
      recommendations.push({
        id: 'color-palette-optimization',
        type: 'optimization',
        message: 'Consider optimizing color palette for better accessibility and contrast',
        priority: 'medium',
        effort: 'medium',
      });
    }

    return {
      policyId: 'color-consistency-comprehensive',
      passed: violations.length === 0,
      score: Math.max(0, score),
      violations,
      recommendations,
      metadata: {
        checkedAt: new Date(),
        configVersion: '1.0.0',
        tenantId: config.tenantId,
      },
    };
  }

  /**
   * Validate typography consistency
   */
  private static validateTypographyConsistency(config: TenantBrandConfig): BrandPolicyResult {
    const violations: BrandPolicyViolation[] = [];
    const recommendations: BrandPolicyRecommendation[] = [];
    let score = 100;

    // Check font family
    const fontFamily = config.theme?.typography?.fontFamily;
    if (!fontFamily || fontFamily.trim().length === 0) {
      violations.push({
        id: 'missing-font-family',
        ruleId: 'font-family-definition',
        severity: 'critical',
        message: 'Brand font family is not defined',
        suggestedFix: 'Define brand font family (e.g., Inter, system-ui, sans-serif)',
      });
      score -= 30;
    }

    // Check font weights
    const fontWeights = config.theme?.typography?.fontWeights;
    if (!fontWeights || !Array.isArray(fontWeights) || fontWeights.length === 0) {
      violations.push({
        id: 'missing-font-weights',
        ruleId: 'font-weights-definition',
        severity: 'high',
        message: 'Brand font weights are not defined',
        suggestedFix: 'Define font weights array (e.g., [400, 500, 600, 700])',
      });
      score -= 25;
    }

    // Check font display
    const fontDisplay = config.theme?.typography?.fontDisplay;
    if (!fontDisplay) {
      violations.push({
        id: 'missing-font-display',
        ruleId: 'font-display-definition',
        severity: 'medium',
        message: 'Font display property is not defined',
        suggestedFix: 'Define font display property (e.g., swap)',
      });
      score -= 15;
    }

    // Add recommendations
    if (violations.length === 0) {
      recommendations.push({
        id: 'typography-optimization',
        type: 'optimization',
        message: 'Consider optimizing typography for better readability and performance',
        priority: 'low',
        effort: 'low',
      });
    }

    return {
      policyId: 'typography-consistency-comprehensive',
      passed: violations.length === 0,
      score: Math.max(0, score),
      violations,
      recommendations,
      metadata: {
        checkedAt: new Date(),
        configVersion: '1.0.0',
        tenantId: config.tenantId,
      },
    };
  }

  /**
   * Validate component consistency
   */
  private static validateComponentConsistency(config: TenantBrandConfig): BrandPolicyResult {
    const violations: BrandPolicyViolation[] = [];
    const recommendations: BrandPolicyRecommendation[] = [];
    let score = 100;

    // Check logo
    const logo = config.theme?.logo;
    if (!logo || !logo.src || !logo.alt || !logo.width || !logo.height) {
      violations.push({
        id: 'incomplete-logo',
        ruleId: 'logo-consistency',
        severity: 'high',
        message: 'Brand logo is not completely defined',
        suggestedFix: 'Define logo with src, alt text, width, and height',
      });
      score -= 25;
    }

    // Check brand name
    const brandName = config.brand?.name;
    if (!brandName || brandName.trim().length === 0) {
      violations.push({
        id: 'missing-brand-name',
        ruleId: 'brand-name-consistency',
        severity: 'high',
        message: 'Brand name is not defined',
        suggestedFix: 'Define brand name',
      });
      score -= 25;
    }

    // Check spacing
    const spacing = config.theme?.spacing;
    if (!spacing || !spacing.sm || !spacing.md || !spacing.lg || !spacing.xl) {
      violations.push({
        id: 'incomplete-spacing',
        ruleId: 'spacing-consistency',
        severity: 'medium',
        message: 'Spacing system is not completely defined',
        suggestedFix: 'Define spacing system with sm, md, lg, xl values',
      });
      score -= 20;
    }

    // Add recommendations
    if (violations.length === 0) {
      recommendations.push({
        id: 'component-optimization',
        type: 'optimization',
        message: 'Consider optimizing components for better usability and accessibility',
        priority: 'medium',
        effort: 'medium',
      });
    }

    return {
      policyId: 'component-consistency-comprehensive',
      passed: violations.length === 0,
      score: Math.max(0, score),
      violations,
      recommendations,
      metadata: {
        checkedAt: new Date(),
        configVersion: '1.0.0',
        tenantId: config.tenantId,
      },
    };
  }
}

/**
 * Export the brand consistency policies
 */
