/**
 * @fileoverview HT-022.2.2: Simple Theme Validation System
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 *
 * THEME VALIDATOR: Basic validation for client themes
 */

import { type SimpleClientTheme } from './simple-theme-provider';

export interface ThemeValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ThemeValidationResult {
  isValid: boolean;
  errors: ThemeValidationError[];
  warnings: ThemeValidationError[];
  score: number; // 0-100
}

// Color validation utilities
function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

function isValidHslColor(color: string): boolean {
  return /^hsl\(\d+,\s*\d+%,\s*\d+%\)$/.test(color);
}

function isValidColor(color: string): boolean {
  return isValidHexColor(color) || isValidHslColor(color) || CSS.supports('color', color);
}

function getColorContrast(color1: string, color2: string): number {
  // Simplified contrast calculation
  // In production, use a proper contrast calculation library
  return 4.5; // Placeholder - assumes WCAG AA compliance
}

// Font validation utilities
function isValidFontFamily(fontFamily: string): boolean {
  return fontFamily.length > 0 && fontFamily.includes(',') && fontFamily.toLowerCase().includes('sans-serif');
}

// Main validation function
export function validateTheme(theme: SimpleClientTheme): ThemeValidationResult {
  const errors: ThemeValidationError[] = [];
  const warnings: ThemeValidationError[] = [];
  let score = 100;

  // Required field validation
  if (!theme.id || theme.id.length === 0) {
    errors.push({
      field: 'id',
      message: 'Theme ID is required',
      severity: 'error'
    });
    score -= 20;
  }

  if (!theme.name || theme.name.length === 0) {
    errors.push({
      field: 'name',
      message: 'Theme name is required',
      severity: 'error'
    });
    score -= 10;
  }

  // Color validation
  const colorFields = ['primary', 'secondary', 'accent', 'background', 'foreground'] as const;
  for (const colorField of colorFields) {
    const color = theme.colors[colorField];
    if (!color) {
      errors.push({
        field: `colors.${colorField}`,
        message: `Color '${colorField}' is required`,
        severity: 'error'
      });
      score -= 15;
    } else if (!isValidColor(color)) {
      errors.push({
        field: `colors.${colorField}`,
        message: `Color '${colorField}' has invalid format: ${color}`,
        severity: 'error'
      });
      score -= 10;
    }
  }

  // Color contrast validation (basic)
  if (theme.colors.primary && theme.colors.background) {
    const contrast = getColorContrast(theme.colors.primary, theme.colors.background);
    if (contrast < 4.5) {
      warnings.push({
        field: 'colors.primary',
        message: 'Primary color may not have sufficient contrast with background',
        severity: 'warning'
      });
      score -= 5;
    }
  }

  // Logo validation
  if (!theme.logo.alt || theme.logo.alt.length === 0) {
    errors.push({
      field: 'logo.alt',
      message: 'Logo alt text is required',
      severity: 'error'
    });
    score -= 5;
  }

  if (!theme.logo.initials || theme.logo.initials.length === 0) {
    errors.push({
      field: 'logo.initials',
      message: 'Logo initials are required',
      severity: 'error'
    });
    score -= 5;
  } else if (theme.logo.initials.length > 2) {
    warnings.push({
      field: 'logo.initials',
      message: 'Logo initials should be 2 characters or less',
      severity: 'warning'
    });
    score -= 2;
  }

  // Logo URL validation (if provided)
  if (theme.logo.src) {
    try {
      new URL(theme.logo.src);
    } catch {
      warnings.push({
        field: 'logo.src',
        message: 'Logo URL appears to be invalid',
        severity: 'warning'
      });
      score -= 3;
    }
  }

  // Typography validation
  if (!theme.typography.fontFamily || theme.typography.fontFamily.length === 0) {
    errors.push({
      field: 'typography.fontFamily',
      message: 'Font family is required',
      severity: 'error'
    });
    score -= 10;
  } else if (!isValidFontFamily(theme.typography.fontFamily)) {
    warnings.push({
      field: 'typography.fontFamily',
      message: 'Font family should include fallbacks (e.g., "Inter, sans-serif")',
      severity: 'warning'
    });
    score -= 3;
  }

  // Theme name validation
  if (theme.name && theme.name.length < 3) {
    warnings.push({
      field: 'name',
      message: 'Theme name should be at least 3 characters long',
      severity: 'warning'
    });
    score -= 2;
  }

  if (theme.name && theme.name.length > 50) {
    warnings.push({
      field: 'name',
      message: 'Theme name should be 50 characters or less',
      severity: 'warning'
    });
    score -= 2;
  }

  // Accessibility warnings
  if (theme.colors.primary === theme.colors.secondary) {
    warnings.push({
      field: 'colors',
      message: 'Primary and secondary colors are identical - consider using different colors',
      severity: 'warning'
    });
    score -= 3;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score
  };
}

// Quick validation for forms
export function quickValidateTheme(theme: Partial<SimpleClientTheme>): boolean {
  return !!(
    theme.id &&
    theme.name &&
    theme.colors?.primary &&
    theme.colors?.background &&
    theme.logo?.initials &&
    theme.typography?.fontFamily
  );
}

// Get validation summary
export function getValidationSummary(result: ThemeValidationResult): string {
  if (result.isValid && result.warnings.length === 0) {
    return 'Theme is valid with no issues';
  }

  if (result.isValid && result.warnings.length > 0) {
    return `Theme is valid with ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}`;
  }

  return `Theme has ${result.errors.length} error${result.errors.length === 1 ? '' : 's'} and ${result.warnings.length} warning${result.warnings.length === 1 ? '' : 's'}`;
}

// Get theme quality rating
export function getThemeQuality(score: number): {
  rating: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
} {
  if (score >= 90) {
    return {
      rating: 'excellent',
      color: 'green',
      message: 'Excellent theme quality'
    };
  }

  if (score >= 75) {
    return {
      rating: 'good',
      color: 'blue',
      message: 'Good theme quality'
    };
  }

  if (score >= 60) {
    return {
      rating: 'fair',
      color: 'yellow',
      message: 'Fair theme quality - consider improvements'
    };
  }

  return {
    rating: 'poor',
    color: 'red',
    message: 'Poor theme quality - needs significant improvements'
  };
}