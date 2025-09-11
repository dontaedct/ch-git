/**
 * @fileoverview HT-008.10.6: Component Migration Utility
 * @module lib/design-tokens/migration-utils.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.6 - Design System Integration with Existing Components
 * Focus: Utilities for migrating components to use design system tokens
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system integration)
 */

import { designTokens } from './tokens';

/**
 * Migration utilities for converting existing components to use design system tokens
 */
export class ComponentMigrationUtils {
  /**
   * Convert hardcoded CSS values to design tokens
   */
  static convertToTokens(value: string, type: 'color' | 'spacing' | 'typography' | 'border' | 'shadow'): string {
    switch (type) {
      case 'color':
        return this.convertColor(value);
      case 'spacing':
        return this.convertSpacing(value);
      case 'typography':
        return this.convertTypography(value);
      case 'border':
        return this.convertBorder(value);
      case 'shadow':
        return this.convertShadow(value);
      default:
        return value;
    }
  }

  /**
   * Convert hardcoded colors to design tokens
   */
  private static convertColor(value: string): string {
    const colorMap: Record<string, string> = {
      // Common colors
      '#ffffff': 'colors.light.background',
      '#000000': 'colors.light.foreground',
      '#f8f9fa': 'colors.light.muted',
      '#e9ecef': 'colors.light.border',
      
      // Primary colors
      '#3b82f6': 'colors.light.primary',
      '#2563eb': 'colors.light.primaryHover',
      '#1d4ed8': 'colors.light.primaryActive',
      
      // Status colors
      '#ef4444': 'colors.light.destructive',
      '#22c55e': 'colors.light.success',
      '#f59e0b': 'colors.light.warning',
      '#3b82f6': 'colors.light.info',
      
      // Neutral colors
      '#fafafa': 'neutral.50',
      '#f5f5f5': 'neutral.100',
      '#e5e5e5': 'neutral.200',
      '#d4d4d4': 'neutral.300',
      '#a3a3a3': 'neutral.400',
      '#737373': 'neutral.500',
      '#525252': 'neutral.600',
      '#404040': 'neutral.700',
      '#262626': 'neutral.800',
      '#171717': 'neutral.900',
      '#0a0a0a': 'neutral.950',
    };

    return colorMap[value.toLowerCase()] || value;
  }

  /**
   * Convert hardcoded spacing to design tokens
   */
  private static convertSpacing(value: string): string {
    const spacingMap: Record<string, string> = {
      '0': '0',
      '1px': '0.25rem',
      '2px': '0.5rem',
      '4px': 'spacing.xs',
      '6px': '0.375rem',
      '8px': 'spacing.sm',
      '12px': '0.75rem',
      '16px': 'spacing.md',
      '20px': '1.25rem',
      '24px': 'spacing.lg',
      '32px': 'spacing.xl',
      '40px': '2.5rem',
      '48px': 'spacing.2xl',
      '64px': 'spacing.3xl',
      '80px': '5rem',
      '96px': 'spacing.4xl',
    };

    return spacingMap[value] || value;
  }

  /**
   * Convert hardcoded typography to design tokens
   */
  private static convertTypography(value: string): string {
    const typographyMap: Record<string, string> = {
      '12px': 'typography.fontSize.xs',
      '14px': 'typography.fontSize.sm',
      '16px': 'typography.fontSize.base',
      '18px': 'typography.fontSize.lg',
      '20px': 'typography.fontSize.xl',
      '24px': 'typography.fontSize.2xl',
      '30px': 'typography.fontSize.3xl',
      '36px': 'typography.fontSize.4xl',
      '48px': 'typography.fontSize.5xl',
      '60px': 'typography.fontSize.6xl',
    };

    return typographyMap[value] || value;
  }

  /**
   * Convert hardcoded borders to design tokens
   */
  private static convertBorder(value: string): string {
    const borderMap: Record<string, string> = {
      '1px solid': 'borders.width.thin',
      '2px solid': 'borders.width.thick',
      '0.5px solid': 'borders.width.hairline',
    };

    return borderMap[value] || value;
  }

  /**
   * Convert hardcoded shadows to design tokens
   */
  private static convertShadow(value: string): string {
    const shadowMap: Record<string, string> = {
      '0 1px 2px 0 rgba(0, 0, 0, 0.05)': 'elevation.sm',
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)': 'elevation.md',
      '0 8px 16px 0 rgba(0, 0, 0, 0.06), 0 12px 24px 0 rgba(0, 0, 0, 0.08)': 'elevation.lg',
    };

    return shadowMap[value] || value;
  }

  /**
   * Generate migration suggestions for a component
   */
  static generateMigrationSuggestions(componentCode: string): string[] {
    const suggestions: string[] = [];

    // Check for hardcoded colors
    const colorRegex = /#[0-9a-fA-F]{6}/g;
    const colors = componentCode.match(colorRegex);
    if (colors) {
      suggestions.push(`Replace hardcoded colors: ${colors.join(', ')}`);
    }

    // Check for hardcoded spacing
    const spacingRegex = /\d+px/g;
    const spacing = componentCode.match(spacingRegex);
    if (spacing) {
      suggestions.push(`Replace hardcoded spacing: ${spacing.join(', ')}`);
    }

    // Check for inline styles
    if (componentCode.includes('style={{')) {
      suggestions.push('Move inline styles to CSS classes or design tokens');
    }

    // Check for missing design tokens import
    if (!componentCode.includes('useTokens') && !componentCode.includes('designTokens')) {
      suggestions.push('Add design tokens import: import { useTokens } from "@/lib/design-tokens"');
    }

    // Check for missing TypeScript types
    if (componentCode.includes('any') || !componentCode.includes('interface')) {
      suggestions.push('Add proper TypeScript interfaces for component props');
    }

    return suggestions;
  }

  /**
   * Create a migration plan for a component
   */
  static createMigrationPlan(componentPath: string, componentCode: string): {
    component: string;
    complexity: 'low' | 'medium' | 'high';
    steps: string[];
    estimatedTime: string;
  } {
    const suggestions = this.generateMigrationSuggestions(componentCode);
    
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (suggestions.length > 5) complexity = 'high';
    else if (suggestions.length > 2) complexity = 'medium';

    const steps = [
      'Backup original component',
      'Add design tokens import',
      'Replace hardcoded values with tokens',
      'Update component props interface',
      'Test component functionality',
      'Update component documentation',
    ];

    const estimatedTime = complexity === 'high' ? '2-4 hours' : 
                        complexity === 'medium' ? '1-2 hours' : 
                        '30-60 minutes';

    return {
      component: componentPath,
      complexity,
      steps,
      estimatedTime,
    };
  }

  /**
   * Validate component after migration
   */
  static validateMigration(componentCode: string): {
    isValid: boolean;
    issues: string[];
    warnings: string[];
  } {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for remaining hardcoded values
    const hardcodedColors = componentCode.match(/#[0-9a-fA-F]{6}/g);
    if (hardcodedColors) {
      issues.push(`Remaining hardcoded colors: ${hardcodedColors.join(', ')}`);
    }

    const hardcodedSpacing = componentCode.match(/\d+px/g);
    if (hardcodedSpacing) {
      warnings.push(`Consider replacing hardcoded spacing: ${hardcodedSpacing.join(', ')}`);
    }

    // Check for proper design tokens usage
    if (!componentCode.includes('useTokens') && !componentCode.includes('designTokens')) {
      issues.push('Component does not use design tokens');
    }

    // Check for TypeScript types
    if (componentCode.includes('any')) {
      warnings.push('Component uses "any" type - consider adding proper types');
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
    };
  }

  /**
   * Generate migration report
   */
  static generateMigrationReport(components: Array<{
    path: string;
    code: string;
    migrated: boolean;
  }>): {
    total: number;
    migrated: number;
    pending: number;
    issues: string[];
    recommendations: string[];
  } {
    const total = components.length;
    const migrated = components.filter(c => c.migrated).length;
    const pending = total - migrated;

    const issues: string[] = [];
    const recommendations: string[] = [];

    for (const component of components) {
      const validation = this.validateMigration(component.code);
      issues.push(...validation.issues);
    }

    if (pending > 0) {
      recommendations.push(`Complete migration of ${pending} remaining components`);
    }

    if (issues.length > 0) {
      recommendations.push('Address migration issues before deployment');
    }

    recommendations.push('Run comprehensive testing after migration');
    recommendations.push('Update team documentation');

    return {
      total,
      migrated,
      pending,
      issues,
      recommendations,
    };
  }
}

/**
 * Hook for using design tokens in components
 */
export function useDesignTokens() {
  return {
    tokens: designTokens,
    colors: designTokens.colors.light, // Default to light theme
    spacing: designTokens.spacing,
    typography: designTokens.typography,
    motion: designTokens.motion,
    elevation: designTokens.elevation,
  };
}

/**
 * Utility for creating consistent component styles
 */
export function createComponentStyles(baseStyles: Record<string, any>, overrides?: Record<string, any>) {
  return {
    ...baseStyles,
    ...overrides,
  };
}

/**
 * Utility for responsive design tokens
 */
export function useResponsiveTokens(breakpoint: 'sm' | 'md' | 'lg' | 'xl' = 'md') {
  const tokens = designTokens;
  
  const responsiveSpacing = {
    sm: tokens.spacing.sm,
    md: tokens.spacing.md,
    lg: tokens.spacing.lg,
    xl: tokens.spacing.xl,
  };

  const responsiveTypography = {
    sm: tokens.typography.fontSize.sm,
    md: tokens.typography.fontSize.base,
    lg: tokens.typography.fontSize.lg,
    xl: tokens.typography.fontSize.xl,
  };

  return {
    spacing: responsiveSpacing[breakpoint],
    typography: responsiveTypography[breakpoint],
  };
}

export default ComponentMigrationUtils;
