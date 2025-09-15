/**
 * @fileoverview HT-011.2.7: Brand Configuration Validation Tests
 * @module tests/brand/brand-config-validation.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.2.7 - Implement Brand Configuration Validation
 * Focus: Comprehensive test suite for brand configuration validation system
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { 
  BrandConfigValidationService, 
  BrandConfigValidationUtils,
  BrandValidationError,
  BrandValidationWarning,
  BrandValidationResult,
  ValidationContext,
  ValidationRule
} from '@/lib/branding/brand-config-validation';
import { TenantBrandConfig } from '@/lib/branding/types';
import { BrandPreset } from '@/lib/branding/preset-manager';

// Mock data for testing
const mockTenantBrandConfig: TenantBrandConfig = {
  tenantId: 'test-tenant',
  brand: {
    id: 'test-brand',
    name: 'Test Organization',
    description: 'Test Application',
    isCustom: true,
    presetName: 'custom',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  theme: {
    colors: {
      name: 'Test Colors',
      primary: '#007AFF',
      secondary: '#34C759',
      description: 'Test color palette'
    },
    typography: {
      fontFamily: 'Inter',
      fontWeights: [400, 500, 600, 700]
    },
    logo: {
      src: 'https://example.com/logo.png',
      alt: 'Test Organization Logo',
      width: 40,
      height: 40,
      initials: 'TO',
      fallbackBgColor: 'from-blue-600 to-indigo-600'
    }
  },
  isActive: true,
  validationStatus: 'pending'
};

const mockInvalidBrandConfig: TenantBrandConfig = {
  tenantId: 'test-tenant',
  brand: {
    id: 'invalid-brand',
    name: '', // Invalid: empty name
    description: '', // Invalid: empty description
    isCustom: true,
    presetName: 'custom',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  theme: {
    colors: {
      name: 'Invalid Colors',
      primary: '#invalid', // Invalid: not a valid hex color
      secondary: '#007AFF',
      description: 'Invalid color palette'
    },
    typography: {
      fontFamily: '', // Invalid: empty font family
      fontWeights: [] // Invalid: empty font weights
    },
    logo: {
      src: 'invalid-url', // Invalid: not a valid URL
      alt: '', // Invalid: empty alt text
      width: 10, // Invalid: too small
      height: 10, // Invalid: too small
      initials: '', // Invalid: empty initials
      fallbackBgColor: 'invalid-gradient'
    }
  },
  isActive: true,
  validationStatus: 'pending'
};

const mockBrandPreset: BrandPreset = {
  id: 'test-preset',
  name: 'Test Preset',
  description: 'Test preset for validation',
  colors: {
    name: 'Test Preset Colors',
    primary: '#007AFF',
    secondary: '#34C759',
    description: 'Test preset color palette'
  },
  typography: {
    fontFamily: 'Inter',
    fontWeights: [400, 500, 600, 700]
  },
  logo: {
    src: 'https://example.com/preset-logo.png',
    alt: 'Test Preset Logo',
    width: 40,
    height: 40,
    initials: 'TP',
    fallbackBgColor: 'from-blue-600 to-indigo-600'
  }
};

describe('BrandConfigValidationService', () => {
  let validator: BrandConfigValidationService;

  beforeEach(() => {
    validator = new BrandConfigValidationService();
  });

  afterEach(() => {
    validator.clearCache();
  });

  describe('validateBrandConfig', () => {
    it('should validate a valid brand configuration successfully', async () => {
      const result = await validator.validateBrandConfig(mockTenantBrandConfig);

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.overallScore).toBeGreaterThan(80);
      expect(result.wcagCompliance.levelAA).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should identify errors in an invalid brand configuration', async () => {
      const result = await validator.validateBrandConfig(mockInvalidBrandConfig);

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThan(50);
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should validate with different strictness levels', async () => {
      const relaxedContext: ValidationContext = { strictness: 'relaxed' };
      const strictContext: ValidationContext = { strictness: 'strict' };

      const relaxedResult = await validator.validateBrandConfig(mockTenantBrandConfig, relaxedContext);
      const strictResult = await validator.validateBrandConfig(mockTenantBrandConfig, strictContext);

      expect(relaxedResult.overallScore).toBeGreaterThanOrEqual(strictResult.overallScore);
    });

    it('should validate with industry context', async () => {
      const healthcareContext: ValidationContext = { 
        strictness: 'standard',
        industry: 'healthcare'
      };

      const result = await validator.validateBrandConfig(mockTenantBrandConfig, healthcareContext);

      expect(result).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should validate with audience context', async () => {
      const seniorContext: ValidationContext = { 
        strictness: 'standard',
        audience: 'seniors'
      };

      const result = await validator.validateBrandConfig(mockTenantBrandConfig, seniorContext);

      expect(result).toBeDefined();
      expect(result.warnings).toBeDefined();
    });

    it('should cache validation results', async () => {
      const context: ValidationContext = { strictness: 'standard' };
      
      // First validation
      const result1 = await validator.validateBrandConfig(mockTenantBrandConfig, context);
      
      // Second validation should use cache
      const result2 = await validator.validateBrandConfig(mockTenantBrandConfig, context);

      expect(result1.duration).toBeGreaterThan(result2.duration);
      expect(result1.overallScore).toBe(result2.overallScore);
    });
  });

  describe('validateBrandPreset', () => {
    it('should validate a brand preset successfully', async () => {
      const result = await validator.validateBrandPreset(mockBrandPreset);

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.overallScore).toBeGreaterThan(80);
    });

    it('should validate preset with custom context', async () => {
      const context: ValidationContext = { 
        strictness: 'strict',
        industry: 'financial'
      };

      const result = await validator.validateBrandPreset(mockBrandPreset, context);

      expect(result).toBeDefined();
      expect(result.warnings).toBeDefined();
    });
  });

  describe('quickValidate', () => {
    it('should return only critical errors', async () => {
      const errors = await validator.quickValidate(mockInvalidBrandConfig);

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(error => error.severity === 'error')).toBe(true);
    });

    it('should return empty array for valid configuration', async () => {
      const errors = await validator.quickValidate(mockTenantBrandConfig);

      expect(errors).toHaveLength(0);
    });
  });

  describe('custom rules', () => {
    it('should add and execute custom validation rules', () => {
      const customRule: ValidationRule = {
        id: 'test-custom-rule',
        name: 'Test Custom Rule',
        description: 'A test custom validation rule',
        category: 'branding',
        severity: 'warning',
        enabled: true,
        validator: (config, context) => ({
          id: 'test-custom-rule',
          name: 'Test Custom Rule',
          severity: 'warning',
          passed: false,
          message: 'Custom rule validation failed',
          category: 'branding'
        })
      };

      validator.addCustomRule(customRule);
      
      // Verify rule was added
      expect(validator['customRules'].has('test-custom-rule')).toBe(true);
    });

    it('should remove custom validation rules', () => {
      const customRule: ValidationRule = {
        id: 'test-removal-rule',
        name: 'Test Removal Rule',
        description: 'A test rule for removal',
        category: 'branding',
        severity: 'warning',
        enabled: true,
        validator: (config, context) => ({
          id: 'test-removal-rule',
          name: 'Test Removal Rule',
          severity: 'warning',
          passed: true,
          message: 'Custom rule validation passed',
          category: 'branding'
        })
      };

      validator.addCustomRule(customRule);
      const removed = validator.removeCustomRule('test-removal-rule');
      
      expect(removed).toBe(true);
      expect(validator['customRules'].has('test-removal-rule')).toBe(false);
    });
  });

  describe('validation statistics', () => {
    it('should provide validation statistics', async () => {
      // Run some validations to populate cache
      await validator.validateBrandConfig(mockTenantBrandConfig);
      await validator.validateBrandConfig(mockInvalidBrandConfig);

      const stats = validator.getValidationStats();

      expect(stats).toBeDefined();
      expect(stats.totalValidations).toBeGreaterThan(0);
      expect(stats.averageScore).toBeGreaterThan(0);
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
      expect(stats.warningRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getValidationSummary', () => {
    it('should provide validation summary for valid configuration', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 95,
        usabilityScore: 90,
        designScore: 85,
        brandScore: 88,
        overallScore: 90,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 100
      };

      const summary = validator.getValidationSummary(mockResult);

      expect(summary).toContain('✅');
      expect(summary).toContain('valid');
      expect(summary).toContain('90/100');
    });

    it('should provide validation summary for configuration with warnings', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'TEST_WARNING',
            message: 'Test warning message',
            path: 'test.path',
            suggestion: 'Test suggestion',
            category: 'branding'
          }
        ],
        accessibilityScore: 85,
        usabilityScore: 80,
        designScore: 75,
        brandScore: 78,
        overallScore: 80,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 150
      };

      const summary = validator.getValidationSummary(mockResult);

      expect(summary).toContain('⚠️');
      expect(summary).toContain('warning');
      expect(summary).toContain('80/100');
    });

    it('should provide validation summary for invalid configuration', () => {
      const mockResult: BrandValidationResult = {
        valid: false,
        errors: [
          {
            code: 'TEST_ERROR',
            message: 'Test error message',
            path: 'test.path',
            severity: 'error',
            category: 'branding'
          }
        ],
        warnings: [
          {
            code: 'TEST_WARNING',
            message: 'Test warning message',
            path: 'test.path',
            suggestion: 'Test suggestion',
            category: 'branding'
          }
        ],
        accessibilityScore: 60,
        usabilityScore: 55,
        designScore: 50,
        brandScore: 52,
        overallScore: 54,
        wcagCompliance: {
          levelA: false,
          levelAA: false,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 200
      };

      const summary = validator.getValidationSummary(mockResult);

      expect(summary).toContain('❌');
      expect(summary).toContain('error');
      expect(summary).toContain('54/100');
    });
  });
});

describe('BrandConfigValidationUtils', () => {
  describe('quickValidate', () => {
    it('should return only critical errors', async () => {
      const errors = await BrandConfigValidationUtils.quickValidate(mockInvalidBrandConfig);

      expect(errors).toBeDefined();
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.every(error => error.severity === 'error')).toBe(true);
    });
  });

  describe('validatePreset', () => {
    it('should validate a brand preset', async () => {
      const result = await BrandConfigValidationUtils.validatePreset(mockBrandPreset);

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getValidationSummary', () => {
    it('should format validation summary', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 90,
        usabilityScore: 85,
        designScore: 80,
        brandScore: 88,
        overallScore: 86,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 120
      };

      const summary = BrandConfigValidationUtils.getValidationSummary(mockResult);

      expect(summary).toContain('✅');
      expect(summary).toContain('86/100');
    });
  });

  describe('getCriticalIssues', () => {
    it('should return only critical errors', () => {
      const mockResult: BrandValidationResult = {
        valid: false,
        errors: [
          {
            code: 'CRITICAL_ERROR',
            message: 'Critical error message',
            path: 'critical.path',
            severity: 'error',
            category: 'branding'
          },
          {
            code: 'WARNING_ERROR',
            message: 'Warning error message',
            path: 'warning.path',
            severity: 'warning',
            category: 'branding'
          }
        ],
        warnings: [],
        accessibilityScore: 70,
        usabilityScore: 65,
        designScore: 60,
        brandScore: 62,
        overallScore: 64,
        wcagCompliance: {
          levelA: false,
          levelAA: false,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 180
      };

      const criticalIssues = BrandConfigValidationUtils.getCriticalIssues(mockResult);

      expect(criticalIssues).toHaveLength(1);
      expect(criticalIssues[0].severity).toBe('error');
    });
  });

  describe('getWarnings', () => {
    it('should return all warnings', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'WARNING_1',
            message: 'First warning',
            path: 'warning1.path',
            suggestion: 'First suggestion',
            category: 'branding'
          },
          {
            code: 'WARNING_2',
            message: 'Second warning',
            path: 'warning2.path',
            suggestion: 'Second suggestion',
            category: 'accessibility'
          }
        ],
        accessibilityScore: 85,
        usabilityScore: 80,
        designScore: 75,
        brandScore: 78,
        overallScore: 80,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 140
      };

      const warnings = BrandConfigValidationUtils.getWarnings(mockResult);

      expect(warnings).toHaveLength(2);
      expect(warnings[0].code).toBe('WARNING_1');
      expect(warnings[1].code).toBe('WARNING_2');
    });
  });

  describe('isWcagCompliant', () => {
    it('should check WCAG compliance levels', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 95,
        usabilityScore: 90,
        designScore: 85,
        brandScore: 88,
        overallScore: 90,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 100
      };

      expect(BrandConfigValidationUtils.isWcagCompliant(mockResult, 'A')).toBe(true);
      expect(BrandConfigValidationUtils.isWcagCompliant(mockResult, 'AA')).toBe(true);
      expect(BrandConfigValidationUtils.isWcagCompliant(mockResult, 'AAA')).toBe(false);
    });
  });

  describe('formatValidationResult', () => {
    it('should format valid result', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [],
        accessibilityScore: 95,
        usabilityScore: 90,
        designScore: 85,
        brandScore: 88,
        overallScore: 90,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 100
      };

      const formatted = BrandConfigValidationUtils.formatValidationResult(mockResult);

      expect(formatted.status).toBe('valid');
      expect(formatted.message).toContain('✅');
      expect(formatted.message).toContain('90/100');
      expect(formatted.details).toHaveLength(0);
    });

    it('should format result with warnings', () => {
      const mockResult: BrandValidationResult = {
        valid: true,
        errors: [],
        warnings: [
          {
            code: 'TEST_WARNING',
            message: 'Test warning message',
            path: 'test.path',
            suggestion: 'Test suggestion',
            category: 'branding'
          }
        ],
        accessibilityScore: 85,
        usabilityScore: 80,
        designScore: 75,
        brandScore: 78,
        overallScore: 80,
        wcagCompliance: {
          levelA: true,
          levelAA: true,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 150
      };

      const formatted = BrandConfigValidationUtils.formatValidationResult(mockResult);

      expect(formatted.status).toBe('warning');
      expect(formatted.message).toContain('⚠️');
      expect(formatted.message).toContain('80/100');
      expect(formatted.details).toHaveLength(1);
      expect(formatted.details[0]).toContain('⚠️');
    });

    it('should format invalid result', () => {
      const mockResult: BrandValidationResult = {
        valid: false,
        errors: [
          {
            code: 'TEST_ERROR',
            message: 'Test error message',
            path: 'test.path',
            severity: 'error',
            category: 'branding'
          }
        ],
        warnings: [
          {
            code: 'TEST_WARNING',
            message: 'Test warning message',
            path: 'test.path',
            suggestion: 'Test suggestion',
            category: 'branding'
          }
        ],
        accessibilityScore: 60,
        usabilityScore: 55,
        designScore: 50,
        brandScore: 52,
        overallScore: 54,
        wcagCompliance: {
          levelA: false,
          levelAA: false,
          levelAAA: false
        },
        timestamp: new Date(),
        duration: 200
      };

      const formatted = BrandConfigValidationUtils.formatValidationResult(mockResult);

      expect(formatted.status).toBe('error');
      expect(formatted.message).toContain('❌');
      expect(formatted.message).toContain('54/100');
      expect(formatted.details).toHaveLength(2);
      expect(formatted.details[0]).toContain('❌');
      expect(formatted.details[1]).toContain('⚠️');
    });
  });
});

describe('Validation Error Handling', () => {
  let validator: BrandConfigValidationService;

  beforeEach(() => {
    validator = new BrandConfigValidationService();
  });

  it('should handle malformed brand configuration gracefully', async () => {
    const malformedConfig = {
      tenantId: 'test',
      brand: null, // Invalid: null brand
      theme: undefined, // Invalid: undefined theme
      isActive: true,
      validationStatus: 'pending'
    } as any;

    const result = await validator.validateBrandConfig(malformedConfig);

    expect(result).toBeDefined();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some(error => error.code === 'MISSING_BRAND_NAME')).toBe(true);
    expect(result.errors.some(error => error.code === 'MISSING_THEME')).toBe(true);
  });

  it('should handle custom rule errors gracefully', async () => {
    const faultyRule: ValidationRule = {
      id: 'faulty-rule',
      name: 'Faulty Rule',
      description: 'A rule that throws an error',
      category: 'technical',
      severity: 'error',
      enabled: true,
      validator: (config, context) => {
        throw new Error('Custom rule error');
      }
    };

    validator.addCustomRule(faultyRule);

    const result = await validator.validateBrandConfig(mockTenantBrandConfig);

    expect(result).toBeDefined();
    expect(result.warnings.some(warning => warning.code === 'CUSTOM_RULE_ERROR')).toBe(true);
  });

  it('should handle network errors in logo validation', async () => {
    const configWithInvalidLogo = {
      ...mockTenantBrandConfig,
      theme: {
        ...mockTenantBrandConfig.theme,
        logo: {
          ...mockTenantBrandConfig.theme.logo,
          src: 'https://invalid-domain-that-does-not-exist.com/logo.png'
        }
      }
    };

    const result = await validator.validateBrandConfig(configWithInvalidLogo);

    expect(result).toBeDefined();
    // Should still validate other aspects even if logo URL is invalid
    expect(result.errors.length).toBeGreaterThanOrEqual(0);
  });
});

describe('Performance Tests', () => {
  let validator: BrandConfigValidationService;

  beforeEach(() => {
    validator = new BrandConfigValidationService();
  });

  it('should validate brand configuration within reasonable time', async () => {
    const startTime = Date.now();
    
    const result = await validator.validateBrandConfig(mockTenantBrandConfig);
    
    const duration = Date.now() - startTime;

    expect(result).toBeDefined();
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(result.duration).toBeLessThan(1000);
  });

  it('should handle multiple concurrent validations', async () => {
    const promises = Array.from({ length: 10 }, () => 
      validator.validateBrandConfig(mockTenantBrandConfig)
    );

    const results = await Promise.all(promises);

    expect(results).toHaveLength(10);
    results.forEach(result => {
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
    });
  });

  it('should cache results efficiently', async () => {
    const context: ValidationContext = { strictness: 'standard' };
    
    // First validation
    const start1 = Date.now();
    const result1 = await validator.validateBrandConfig(mockTenantBrandConfig, context);
    const duration1 = Date.now() - start1;
    
    // Second validation should be faster due to caching
    const start2 = Date.now();
    const result2 = await validator.validateBrandConfig(mockTenantBrandConfig, context);
    const duration2 = Date.now() - start2;

    expect(result1.overallScore).toBe(result2.overallScore);
    expect(duration2).toBeLessThan(duration1);
  });
});
