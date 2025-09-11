/**
 * @fileoverview HT-011.1.6: Brand Validation Framework Test Suite
 * @module tests/branding/validation-framework.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.6 - Create Brand Validation Framework
 * Focus: Comprehensive testing of brand validation functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  BrandValidationFramework, 
  ValidationConfig,
  ValidationRule,
  BrandValidationUtils,
  brandValidator
} from '@/lib/branding/validation-framework';
import { DynamicBrandConfig } from '@/lib/branding/logo-manager';
import { BrandPreset } from '@/lib/branding/preset-manager';

describe('BrandValidationFramework', () => {
  let validator: BrandValidationFramework;
  let testConfig: DynamicBrandConfig;

  beforeEach(() => {
    validator = new BrandValidationFramework();
    testConfig = {
      logo: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 28,
        height: 28,
        showAsImage: true,
        initials: 'TL',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Organization',
        appName: 'Test App',
        fullBrand: 'Test Organization — Test App',
        shortBrand: 'Test App',
        navBrand: 'Test App'
      },
      isCustom: false,
      presetName: 'test'
    };
  });

  describe('Framework Initialization', () => {
    it('should initialize with default configuration', () => {
      const defaultConfig: ValidationConfig = {
        accessibility: true,
        usability: true,
        design: true,
        branding: true,
        minWcagLevel: 'AA'
      };
      
      const newValidator = new BrandValidationFramework();
      expect(newValidator).toBeDefined();
    });

    it('should initialize with custom configuration', () => {
      const customConfig: Partial<ValidationConfig> = {
        accessibility: false,
        usability: true,
        design: false,
        branding: true,
        minWcagLevel: 'AAA'
      };
      
      const customValidator = new BrandValidationFramework(customConfig);
      expect(customValidator).toBeDefined();
    });
  });

  describe('Brand Validation', () => {
    it('should validate complete brand configuration', () => {
      const report = validator.validateBrand(testConfig);
      
      expect(report).toBeDefined();
      expect(report.isValid).toBeDefined();
      expect(report.totalChecks).toBeGreaterThan(0);
      expect(report.passedChecks).toBeGreaterThanOrEqual(0);
      expect(report.failedChecks).toBeGreaterThanOrEqual(0);
      expect(report.results).toBeDefined();
      expect(report.categorySummary).toBeDefined();
      expect(report.wcagCompliance).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    it('should generate validation report with correct structure', () => {
      const report = validator.validateBrand(testConfig);
      
      expect(report.totalChecks).toBe(report.passedChecks + report.failedChecks);
      expect(report.categorySummary.accessibility).toBeDefined();
      expect(report.categorySummary.usability).toBeDefined();
      expect(report.categorySummary.design).toBeDefined();
      expect(report.categorySummary.branding).toBeDefined();
      expect(report.wcagCompliance.levelA).toBeDefined();
      expect(report.wcagCompliance.levelAA).toBeDefined();
      expect(report.wcagCompliance.levelAAA).toBeDefined();
    });
  });

  describe('Accessibility Validation', () => {
    it('should validate color contrast', () => {
      const report = validator.validateBrand(testConfig);
      const contrastResult = report.results.find(r => r.id === 'color-contrast-logo');
      
      expect(contrastResult).toBeDefined();
      expect(contrastResult?.category).toBe('accessibility');
      expect(contrastResult?.wcagLevel).toBeDefined();
    });

    it('should validate logo accessibility', () => {
      const report = validator.validateBrand(testConfig);
      const logoResult = report.results.find(r => r.id === 'logo-accessibility');
      
      expect(logoResult).toBeDefined();
      expect(logoResult?.category).toBe('accessibility');
      expect(logoResult?.passed).toBe(true); // Test config has alt text
    });

    it('should validate brand name accessibility', () => {
      const report = validator.validateBrand(testConfig);
      const brandNameResult = report.results.find(r => r.id === 'brand-name-accessibility');
      
      expect(brandNameResult).toBeDefined();
      expect(brandNameResult?.category).toBe('accessibility');
    });

    it('should validate typography accessibility', () => {
      const report = validator.validateBrand(testConfig);
      const typographyResult = report.results.find(r => r.id === 'typography-accessibility');
      
      expect(typographyResult).toBeDefined();
      expect(typographyResult?.category).toBe('accessibility');
    });
  });

  describe('Usability Validation', () => {
    it('should validate brand name usability', () => {
      const report = validator.validateBrand(testConfig);
      const brandNameResult = report.results.find(r => r.id === 'brand-name-usability');
      
      expect(brandNameResult).toBeDefined();
      expect(brandNameResult?.category).toBe('usability');
    });

    it('should validate logo usability', () => {
      const report = validator.validateBrand(testConfig);
      const logoResult = report.results.find(r => r.id === 'logo-usability');
      
      expect(logoResult).toBeDefined();
      expect(logoResult?.category).toBe('usability');
    });

    it('should validate color usability', () => {
      const report = validator.validateBrand(testConfig);
      const colorResult = report.results.find(r => r.id === 'color-usability');
      
      expect(colorResult).toBeDefined();
      expect(colorResult?.category).toBe('usability');
    });
  });

  describe('Design Consistency Validation', () => {
    it('should validate color harmony', () => {
      const report = validator.validateBrand(testConfig);
      const harmonyResult = report.results.find(r => r.id === 'color-harmony');
      
      expect(harmonyResult).toBeDefined();
      expect(harmonyResult?.category).toBe('design');
    });

    it('should validate typography consistency', () => {
      const report = validator.validateBrand(testConfig);
      const typographyResult = report.results.find(r => r.id === 'typography-consistency');
      
      expect(typographyResult).toBeDefined();
      expect(typographyResult?.category).toBe('design');
    });

    it('should validate brand element consistency', () => {
      const report = validator.validateBrand(testConfig);
      const consistencyResult = report.results.find(r => r.id === 'brand-element-consistency');
      
      expect(consistencyResult).toBeDefined();
      expect(consistencyResult?.category).toBe('design');
    });
  });

  describe('Branding Validation', () => {
    it('should validate brand uniqueness', () => {
      const report = validator.validateBrand(testConfig);
      const uniquenessResult = report.results.find(r => r.id === 'brand-uniqueness');
      
      expect(uniquenessResult).toBeDefined();
      expect(uniquenessResult?.category).toBe('branding');
      expect(uniquenessResult?.passed).toBe(true); // Test config has custom names
    });

    it('should validate brand memorability', () => {
      const report = validator.validateBrand(testConfig);
      const memorabilityResult = report.results.find(r => r.id === 'brand-memorability');
      
      expect(memorabilityResult).toBeDefined();
      expect(memorabilityResult?.category).toBe('branding');
    });

    it('should validate brand scalability', () => {
      const report = validator.validateBrand(testConfig);
      const scalabilityResult = report.results.find(r => r.id === 'brand-scalability');
      
      expect(scalabilityResult).toBeDefined();
      expect(scalabilityResult?.category).toBe('branding');
    });
  });

  describe('Custom Validation Rules', () => {
    it('should add custom validation rule', () => {
      const customRule: ValidationRule = {
        id: 'custom-test',
        name: 'Custom Test Rule',
        category: 'branding',
        severity: 'warning',
        validator: (config) => ({
          id: 'custom-test',
          name: 'Custom Test Rule',
          severity: 'warning',
          passed: true,
          message: 'Custom rule passed',
          category: 'branding'
        })
      };

      validator.addCustomRule(customRule);
      const report = validator.validateBrand(testConfig);
      
      const customResult = report.results.find(r => r.id === 'custom-test');
      expect(customResult).toBeDefined();
      expect(customResult?.name).toBe('Custom Test Rule');
    });

    it('should remove custom validation rule', () => {
      const customRule: ValidationRule = {
        id: 'custom-test-remove',
        name: 'Custom Test Rule to Remove',
        category: 'branding',
        severity: 'warning',
        validator: (config) => ({
          id: 'custom-test-remove',
          name: 'Custom Test Rule to Remove',
          severity: 'warning',
          passed: true,
          message: 'Custom rule passed',
          category: 'branding'
        })
      };

      validator.addCustomRule(customRule);
      const removed = validator.removeCustomRule('custom-test-remove');
      
      expect(removed).toBe(true);
      
      const report = validator.validateBrand(testConfig);
      const customResult = report.results.find(r => r.id === 'custom-test-remove');
      expect(customResult).toBeUndefined();
    });
  });

  describe('Validation Configuration', () => {
    it('should validate only accessibility when configured', () => {
      const accessibilityOnlyValidator = new BrandValidationFramework({
        accessibility: true,
        usability: false,
        design: false,
        branding: false
      });

      const report = accessibilityOnlyValidator.validateBrand(testConfig);
      const accessibilityResults = report.results.filter(r => r.category === 'accessibility');
      const otherResults = report.results.filter(r => r.category !== 'accessibility');
      
      expect(accessibilityResults.length).toBeGreaterThan(0);
      expect(otherResults.length).toBe(0);
    });

    it('should validate only usability when configured', () => {
      const usabilityOnlyValidator = new BrandValidationFramework({
        accessibility: false,
        usability: true,
        design: false,
        branding: false
      });

      const report = usabilityOnlyValidator.validateBrand(testConfig);
      const usabilityResults = report.results.filter(r => r.category === 'usability');
      const otherResults = report.results.filter(r => r.category !== 'usability');
      
      expect(usabilityResults.length).toBeGreaterThan(0);
      expect(otherResults.length).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid brand configuration', () => {
      const invalidConfig: DynamicBrandConfig = {
        logo: {
          src: '',
          alt: '',
          width: 0,
          height: 0,
          showAsImage: false,
          initials: '',
          fallbackBgColor: ''
        },
        brandName: {
          organizationName: '',
          appName: '',
          fullBrand: '',
          shortBrand: '',
          navBrand: ''
        },
        isCustom: false,
        presetName: 'invalid'
      };

      const report = validator.validateBrand(invalidConfig);
      expect(report).toBeDefined();
      expect(report.failedChecks).toBeGreaterThan(0);
    });

    it('should handle missing logo alt text', () => {
      const configWithoutAlt: DynamicBrandConfig = {
        logo: {
          src: '/test-logo.png',
          alt: '',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: '',
          fallbackBgColor: 'from-blue-600 to-indigo-600'
        },
        brandName: testConfig.brandName,
        isCustom: false,
        presetName: 'test'
      };

      const report = validator.validateBrand(configWithoutAlt);
      const logoResult = report.results.find(r => r.id === 'logo-accessibility');
      
      expect(logoResult).toBeDefined();
      expect(logoResult?.passed).toBe(false);
    });

    it('should handle default brand names', () => {
      const defaultBrandConfig: DynamicBrandConfig = {
        ...testConfig,
        brandName: {
          organizationName: 'Your Organization',
          appName: 'Micro App',
          fullBrand: 'Your Organization — Micro App',
          shortBrand: 'Micro App',
          navBrand: 'Micro App'
        }
      };

      const report = validator.validateBrand(defaultBrandConfig);
      const uniquenessResult = report.results.find(r => r.id === 'brand-uniqueness');
      
      expect(uniquenessResult).toBeDefined();
      expect(uniquenessResult?.passed).toBe(false);
    });
  });
});

describe('BrandValidationUtils', () => {
  let testConfig: DynamicBrandConfig;

  beforeEach(() => {
    testConfig = {
      logo: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 28,
        height: 28,
        showAsImage: true,
        initials: 'TL',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Organization',
        appName: 'Test App',
        fullBrand: 'Test Organization — Test App',
        shortBrand: 'Test App',
        navBrand: 'Test App'
      },
      isCustom: false,
      presetName: 'test'
    };
  });

  describe('Quick Validation', () => {
    it('should perform quick validation', () => {
      const results = BrandValidationUtils.quickValidate(testConfig);
      
      expect(Array.isArray(results)).toBe(true);
      results.forEach(result => {
        expect(result.passed).toBe(false); // Quick validate only returns failures
        expect(result.severity).toBe('error');
        expect(result.category).toBe('accessibility');
      });
    });

    it('should return empty array for valid configuration', () => {
      const validConfig: DynamicBrandConfig = {
        ...testConfig,
        logo: {
          ...testConfig.logo,
          alt: 'Valid Logo',
          initials: 'VL'
        }
      };

      const results = BrandValidationUtils.quickValidate(validConfig);
      expect(results.length).toBe(0);
    });
  });

  describe('Preset Validation', () => {
    it('should validate brand preset', () => {
      const preset: BrandPreset = {
        id: 'test-preset',
        name: 'Test Preset',
        description: 'Test description',
        industry: 'Test',
        palette: {
          name: 'Test Palette',
          primary: '#ff0000',
          description: 'Test palette'
        },
        logo: testConfig.logo,
        brandName: testConfig.brandName,
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {},
        metadata: {
          isSystem: false,
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test']
        }
      };

      const report = BrandValidationUtils.validatePreset(preset);
      
      expect(report).toBeDefined();
      expect(report.isValid).toBeDefined();
      expect(report.totalChecks).toBeGreaterThan(0);
    });
  });

  describe('Validation Summary', () => {
    it('should generate validation summary', () => {
      const report = brandValidator.validateBrand(testConfig);
      const summary = BrandValidationUtils.getValidationSummary(report);
      
      expect(summary).toMatch(/\d+\/\d+ checks passed \(\d+\.\d+%\)/);
    });

    it('should handle empty report', () => {
      const emptyReport = {
        isValid: true,
        totalChecks: 0,
        passedChecks: 0,
        failedChecks: 0,
        results: [],
        categorySummary: {
          accessibility: { passed: 0, failed: 0, total: 0 },
          usability: { passed: 0, failed: 0, total: 0 },
          design: { passed: 0, failed: 0, total: 0 },
          branding: { passed: 0, failed: 0, total: 0 }
        },
        wcagCompliance: {
          levelA: { passed: 0, failed: 0, total: 0 },
          levelAA: { passed: 0, failed: 0, total: 0 },
          levelAAA: { passed: 0, failed: 0, total: 0 }
        },
        timestamp: new Date()
      };

      const summary = BrandValidationUtils.getValidationSummary(emptyReport);
      expect(summary).toBe('0/0 checks passed (NaN%)');
    });
  });

  describe('Critical Issues and Warnings', () => {
    it('should get critical issues', () => {
      const report = brandValidator.validateBrand(testConfig);
      const criticalIssues = BrandValidationUtils.getCriticalIssues(report);
      
      expect(Array.isArray(criticalIssues)).toBe(true);
      criticalIssues.forEach(issue => {
        expect(issue.severity).toBe('error');
        expect(issue.passed).toBe(false);
      });
    });

    it('should get warnings', () => {
      const report = brandValidator.validateBrand(testConfig);
      const warnings = BrandValidationUtils.getWarnings(report);
      
      expect(Array.isArray(warnings)).toBe(true);
      warnings.forEach(warning => {
        expect(warning.severity).toBe('warning');
        expect(warning.passed).toBe(false);
      });
    });
  });

  describe('WCAG Compliance', () => {
    it('should check WCAG A compliance', () => {
      const report = brandValidator.validateBrand(testConfig);
      const isCompliant = BrandValidationUtils.isWcagCompliant(report, 'A');
      
      expect(typeof isCompliant).toBe('boolean');
    });

    it('should check WCAG AA compliance', () => {
      const report = brandValidator.validateBrand(testConfig);
      const isCompliant = BrandValidationUtils.isWcagCompliant(report, 'AA');
      
      expect(typeof isCompliant).toBe('boolean');
    });

    it('should check WCAG AAA compliance', () => {
      const report = brandValidator.validateBrand(testConfig);
      const isCompliant = BrandValidationUtils.isWcagCompliant(report, 'AAA');
      
      expect(typeof isCompliant).toBe('boolean');
    });
  });
});

describe('Global Brand Validator', () => {
  it('should be instantiated', () => {
    expect(brandValidator).toBeDefined();
    expect(brandValidator).toBeInstanceOf(BrandValidationFramework);
  });

  it('should validate brand configuration', () => {
    const testConfig: DynamicBrandConfig = {
      logo: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 28,
        height: 28,
        showAsImage: true,
        initials: 'TL',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Organization',
        appName: 'Test App',
        fullBrand: 'Test Organization — Test App',
        shortBrand: 'Test App',
        navBrand: 'Test App'
      },
      isCustom: false,
      presetName: 'test'
    };

    const report = brandValidator.validateBrand(testConfig);
    expect(report).toBeDefined();
    expect(report.isValid).toBeDefined();
  });
});
