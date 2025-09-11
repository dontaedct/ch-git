/**
 * @fileoverview Tests for Enhanced Brand Configuration System
 * @module tests/config/brand-config-service.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.1: Comprehensive tests for enhanced configuration system with brand support
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  BrandConfigService, 
  brandConfigService,
  BrandConfigOverride,
  EnhancedAppConfig,
  BrandConfigValidationResult
} from '@/lib/config/brand-config-service';
import { TenantBrandingConfig, DEFAULT_BRAND_COLORS, DEFAULT_TYPOGRAPHY_CONFIG } from '@/lib/branding/tenant-types';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTenantBranding: TenantBrandingConfig = {
  id: 'test-branding',
  tenantId: 'test-tenant',
  organizationName: 'Test Organization',
  appName: 'Test App',
  fullBrand: 'Test Organization — Test App',
  shortBrand: 'Test App',
  navBrand: 'Test App',
  logoAlt: 'Test logo',
  logoWidth: 32,
  logoHeight: 32,
  logoClassName: 'test-logo',
  logoShowAsImage: true,
  logoInitials: 'TO',
  logoFallbackBgColor: 'from-blue-500 to-blue-600',
  brandColors: {
    primary: '#3b82f6',
    secondary: '#f59e0b',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1f2937',
    textSecondary: '#6b7280'
  },
  typographyConfig: {
    fontFamily: 'Inter',
    fontWeights: [400, 500, 600, 700],
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  presetName: 'test-preset',
  isCustom: true,
  validationStatus: 'valid',
  validationErrors: [],
  validationWarnings: [],
  brandTags: ['test', 'custom'],
  brandVersion: '1.0.0',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const mockBrandOverride: BrandConfigOverride = {
  id: 'test-override',
  label: 'Test Override',
  description: 'Test override for testing',
  active: true,
  value: '#ff0000',
  path: 'branding.tenant.brandColors.primary',
  priority: 100,
  source: 'user',
  userModifiable: true,
  validation: {
    required: true,
    type: 'string',
    pattern: '^#[0-9A-Fa-f]{6}$'
  }
};

// =============================================================================
// TESTS
// =============================================================================

describe('BrandConfigService', () => {
  let service: BrandConfigService;

  beforeEach(() => {
    service = BrandConfigService.getInstance();
    service.clearCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    service.clearCache();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = BrandConfigService.getInstance();
      const instance2 = BrandConfigService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getEnhancedConfig', () => {
    it('should return enhanced configuration with brand support', async () => {
      const config = await service.getEnhancedConfig('test-tenant');
      
      expect(config).toBeDefined();
      expect(config.id).toBe('enhanced-microapp');
      expect(config.branding).toBeDefined();
      expect(config.branding.tenant).toBeDefined();
      expect(config.theme.colors.brand).toBeDefined();
      expect(config.theme.typography.brand).toBeDefined();
    });

    it('should cache configuration after first load', async () => {
      const config1 = await service.getEnhancedConfig('test-tenant');
      const config2 = await service.getEnhancedConfig('test-tenant');
      
      expect(config1).toBe(config2);
    });

    it('should clear cache when requested', async () => {
      const config1 = await service.getEnhancedConfig('test-tenant');
      service.clearCache();
      const config2 = await service.getEnhancedConfig('test-tenant');
      
      expect(config1).not.toBe(config2);
    });
  });

  describe('getBrandOverrides', () => {
    it('should return default brand overrides', async () => {
      const overrides = await service.getBrandOverrides();
      
      expect(overrides).toBeDefined();
      expect(Array.isArray(overrides)).toBe(true);
      expect(overrides.length).toBeGreaterThan(0);
      
      // Check for expected default overrides
      const primaryColorOverride = overrides.find(o => o.id === 'brand-primary-color');
      expect(primaryColorOverride).toBeDefined();
      expect(primaryColorOverride?.value).toBe(DEFAULT_BRAND_COLORS.primary);
    });

    it('should include environment overrides when available', async () => {
      // Mock environment variables
      process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR = '#ff0000';
      process.env.NEXT_PUBLIC_ORGANIZATION_NAME = 'Test Org';
      
      const overrides = await service.getBrandOverrides();
      
      const envPrimaryOverride = overrides.find(o => o.id === 'env-primary-color');
      const envOrgOverride = overrides.find(o => o.id === 'env-organization-name');
      
      expect(envPrimaryOverride).toBeDefined();
      expect(envOrgOverride).toBeDefined();
      expect(envPrimaryOverride?.value).toBe('#ff0000');
      expect(envOrgOverride?.value).toBe('Test Org');
      
      // Cleanup
      delete process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR;
      delete process.env.NEXT_PUBLIC_ORGANIZATION_NAME;
    });

    it('should sort overrides by priority', async () => {
      const overrides = await service.getBrandOverrides();
      
      for (let i = 1; i < overrides.length; i++) {
        expect(overrides[i - 1].priority).toBeGreaterThanOrEqual(overrides[i].priority);
      }
    });
  });

  describe('applyBrandOverride', () => {
    it('should apply valid override successfully', async () => {
      const result = await service.applyBrandOverride(mockBrandOverride);
      
      expect(result).toBe(true);
    });

    it('should reject invalid override', async () => {
      const invalidOverride: BrandConfigOverride = {
        ...mockBrandOverride,
        value: 'invalid-color'
      };
      
      const result = await service.applyBrandOverride(invalidOverride);
      
      expect(result).toBe(false);
    });

    it('should clear cache after applying override', async () => {
      await service.getEnhancedConfig('test-tenant');
      await service.applyBrandOverride(mockBrandOverride);
      
      // Cache should be cleared, so next call should create new instance
      const config = await service.getEnhancedConfig('test-tenant');
      expect(config).toBeDefined();
    });
  });

  describe('validateBrandConfig', () => {
    it('should validate valid brand configuration', async () => {
      const mockConfig: EnhancedAppConfig = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        theme: {
          colors: {
            primary: '#007AFF',
            neutral: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
            brand: DEFAULT_BRAND_COLORS,
            variants: { primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' }, secondary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' } }
          },
          typography: {
            fontFamily: 'system-ui',
            scales: { display: '2.5rem', headline: '1.5rem', body: '1rem', caption: '0.875rem' },
            brand: DEFAULT_TYPOGRAPHY_CONFIG,
            customFonts: []
          },
          motion: { duration: '150ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
          radii: { sm: '4px', md: '8px', lg: '12px' },
          shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
        },
        questionnaire: { id: 'test', title: 'Test', steps: [], progress: { style: 'thinBar', showNumbers: true }, navigation: { previousLabel: 'Previous', nextLabel: 'Next', submitLabel: 'Submit' } },
        consultation: { id: 'test', title: 'Test', sections: [] },
        catalog: { id: 'test', title: 'Test', plans: [] },
        modules: { modules: [] },
        integrations: {},
        branding: {
          tenant: mockTenantBranding,
          overrides: [],
          validationStatus: 'valid',
          validationErrors: [],
          validationWarnings: []
        }
      };
      
      const result = await service.validateBrandConfig(mockConfig);
      
      expect(result).toBeDefined();
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should detect invalid brand colors', async () => {
      const invalidConfig: EnhancedAppConfig = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        theme: {
          colors: {
            primary: '#007AFF',
            neutral: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
            brand: { ...DEFAULT_BRAND_COLORS, primary: 'invalid-color' },
            variants: { primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' }, secondary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' } }
          },
          typography: {
            fontFamily: 'system-ui',
            scales: { display: '2.5rem', headline: '1.5rem', body: '1rem', caption: '0.875rem' },
            brand: DEFAULT_TYPOGRAPHY_CONFIG,
            customFonts: []
          },
          motion: { duration: '150ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
          radii: { sm: '4px', md: '8px', lg: '12px' },
          shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
        },
        questionnaire: { id: 'test', title: 'Test', steps: [], progress: { style: 'thinBar', showNumbers: true }, navigation: { previousLabel: 'Previous', nextLabel: 'Next', submitLabel: 'Submit' } },
        consultation: { id: 'test', title: 'Test', sections: [] },
        catalog: { id: 'test', title: 'Test', plans: [] },
        modules: { modules: [] },
        integrations: {},
        branding: {
          tenant: { ...mockTenantBranding, brandColors: { ...DEFAULT_BRAND_COLORS, primary: 'invalid-color' } },
          overrides: [],
          validationStatus: 'invalid',
          validationErrors: [],
          validationWarnings: []
        }
      };
      
      const result = await service.validateBrandConfig(invalidConfig);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Primary color'))).toBe(true);
    });

    it('should detect invalid typography', async () => {
      const invalidConfig: EnhancedAppConfig = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        theme: {
          colors: {
            primary: '#007AFF',
            neutral: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
            brand: DEFAULT_BRAND_COLORS,
            variants: { primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' }, secondary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' } }
          },
          typography: {
            fontFamily: 'system-ui',
            scales: { display: '2.5rem', headline: '1.5rem', body: '1rem', caption: '0.875rem' },
            brand: { ...DEFAULT_TYPOGRAPHY_CONFIG, fontFamily: '' },
            customFonts: []
          },
          motion: { duration: '150ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
          radii: { sm: '4px', md: '8px', lg: '12px' },
          shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
        },
        questionnaire: { id: 'test', title: 'Test', steps: [], progress: { style: 'thinBar', showNumbers: true }, navigation: { previousLabel: 'Previous', nextLabel: 'Next', submitLabel: 'Submit' } },
        consultation: { id: 'test', title: 'Test', sections: [] },
        catalog: { id: 'test', title: 'Test', plans: [] },
        modules: { modules: [] },
        integrations: {},
        branding: {
          tenant: { ...mockTenantBranding, typographyConfig: { ...DEFAULT_TYPOGRAPHY_CONFIG, fontFamily: '' } },
          overrides: [],
          validationStatus: 'invalid',
          validationErrors: [],
          validationWarnings: []
        }
      };
      
      const result = await service.validateBrandConfig(invalidConfig);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Font family'))).toBe(true);
    });

    it('should detect invalid brand names', async () => {
      const invalidConfig: EnhancedAppConfig = {
        id: 'test',
        name: 'Test',
        version: '1.0.0',
        theme: {
          colors: {
            primary: '#007AFF',
            neutral: { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827' },
            brand: DEFAULT_BRAND_COLORS,
            variants: { primary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' }, secondary: { 50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e' } }
          },
          typography: {
            fontFamily: 'system-ui',
            scales: { display: '2.5rem', headline: '1.5rem', body: '1rem', caption: '0.875rem' },
            brand: DEFAULT_TYPOGRAPHY_CONFIG,
            customFonts: []
          },
          motion: { duration: '150ms', easing: 'cubic-bezier(.2,.8,.2,1)' },
          radii: { sm: '4px', md: '8px', lg: '12px' },
          shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
        },
        questionnaire: { id: 'test', title: 'Test', steps: [], progress: { style: 'thinBar', showNumbers: true }, navigation: { previousLabel: 'Previous', nextLabel: 'Next', submitLabel: 'Submit' } },
        consultation: { id: 'test', title: 'Test', sections: [] },
        catalog: { id: 'test', title: 'Test', plans: [] },
        modules: { modules: [] },
        integrations: {},
        branding: {
          tenant: { ...mockTenantBranding, organizationName: '', appName: '' },
          overrides: [],
          validationStatus: 'invalid',
          validationErrors: [],
          validationWarnings: []
        }
      };
      
      const result = await service.validateBrandConfig(invalidConfig);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('Organization name'))).toBe(true);
      expect(result.errors.some(error => error.includes('Application name'))).toBe(true);
    });
  });

  describe('clearCache', () => {
    it('should clear configuration cache', async () => {
      await service.getEnhancedConfig('test-tenant');
      service.clearCache();
      
      // Next call should create new instance
      const config = await service.getEnhancedConfig('test-tenant');
      expect(config).toBeDefined();
    });
  });
});

describe('Brand Configuration Integration', () => {
  it('should integrate with existing configuration system', async () => {
    const config = await brandConfigService.getEnhancedConfig('test-tenant');
    
    expect(config).toBeDefined();
    expect(config.branding).toBeDefined();
    expect(config.theme.colors.brand).toBeDefined();
    expect(config.theme.typography.brand).toBeDefined();
  });

  it('should support environment variable overrides', async () => {
    process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR = '#ff0000';
    
    const overrides = await brandConfigService.getBrandOverrides();
    const envOverride = overrides.find(o => o.id === 'env-primary-color');
    
    expect(envOverride).toBeDefined();
    expect(envOverride?.value).toBe('#ff0000');
    
    delete process.env.NEXT_PUBLIC_BRAND_PRIMARY_COLOR;
  });

  it('should maintain type safety throughout', async () => {
    const config = await brandConfigService.getEnhancedConfig('test-tenant');
    
    // TypeScript should enforce these types
    expect(typeof config.branding.tenant.organizationName).toBe('string');
    expect(typeof config.branding.tenant.brandColors.primary).toBe('string');
    expect(Array.isArray(config.branding.overrides)).toBe(true);
    expect(typeof config.theme.colors.brand.primary).toBe('string');
  });
});

describe('Error Handling', () => {
  it('should handle configuration loading errors gracefully', async () => {
    // Mock console.error to avoid test output
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // This should not throw even if there are issues
    const config = await brandConfigService.getEnhancedConfig('invalid-tenant');
    
    expect(config).toBeDefined();
    
    consoleSpy.mockRestore();
  });

  it('should handle override application errors gracefully', async () => {
    const invalidOverride: BrandConfigOverride = {
      id: 'invalid',
      label: 'Invalid',
      description: 'Invalid override',
      active: true,
      value: null,
      path: 'invalid.path',
      priority: 0,
      source: 'user',
      userModifiable: true,
      validation: {
        required: true
      }
    };
    
    const result = await brandConfigService.applyBrandOverride(invalidOverride);
    expect(result).toBe(false);
  });
});

describe('Performance', () => {
  it('should cache configuration efficiently', async () => {
    const start = performance.now();
    
    // First call
    await brandConfigService.getEnhancedConfig('test-tenant');
    const firstCallTime = performance.now() - start;
    
    // Second call (should be cached)
    const secondStart = performance.now();
    await brandConfigService.getEnhancedConfig('test-tenant');
    const secondCallTime = performance.now() - secondStart;
    
    expect(secondCallTime).toBeLessThan(firstCallTime);
  });

  it('should handle multiple concurrent requests', async () => {
    const promises = Array.from({ length: 10 }, () => 
      brandConfigService.getEnhancedConfig('test-tenant')
    );
    
    const configs = await Promise.all(promises);
    
    // All should be the same instance (cached)
    configs.forEach(config => {
      expect(config).toBe(configs[0]);
    });
  });
});
