/**
 * @fileoverview Tests for Brand Configuration React Hooks
 * @module tests/config/brand-config-hooks.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.1: Tests for React hooks in enhanced configuration system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useEnhancedConfig,
  useBrandOverrides,
  useBrandValidation,
  useTenantBranding,
  useBrandTheme,
  useBrandPersistence,
  useBrandAnalytics,
  useDebouncedConfigUpdate,
  useConfigChangeDetection
} from '@/lib/config/brand-config-hooks';
import { brandConfigService } from '@/lib/config/brand-config-service';
import { TenantBrandingConfig, DEFAULT_BRAND_COLORS, DEFAULT_TYPOGRAPHY_CONFIG } from '@/lib/branding/tenant-types';

// =============================================================================
// MOCK SETUP
// =============================================================================

vi.mock('@/lib/config/brand-config-service', () => ({
  brandConfigService: {
    getEnhancedConfig: vi.fn(),
    getBrandOverrides: vi.fn(),
    applyBrandOverride: vi.fn(),
    validateBrandConfig: vi.fn(),
    clearCache: vi.fn()
  }
}));

const mockEnhancedConfig = {
  id: 'test-config',
  name: 'Test Config',
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
    tenant: {
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
      brandColors: DEFAULT_BRAND_COLORS,
      typographyConfig: DEFAULT_TYPOGRAPHY_CONFIG,
      presetName: 'test-preset',
      isCustom: true,
      validationStatus: 'valid' as const,
      validationErrors: [],
      validationWarnings: [],
      brandTags: ['test'],
      brandVersion: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    overrides: [],
    validationStatus: 'valid' as const,
    validationErrors: [],
    validationWarnings: []
  }
};

const mockBrandOverrides = [
  {
    id: 'brand-primary-color',
    label: 'Primary Brand Color',
    description: 'Main brand color',
    active: true,
    value: '#3b82f6',
    path: 'branding.tenant.brandColors.primary',
    priority: 100,
    source: 'preset' as const,
    userModifiable: true,
    validation: {
      required: true,
      type: 'string',
      pattern: '^#[0-9A-Fa-f]{6}$'
    }
  }
];

const mockValidationResult = {
  isValid: true,
  errors: [],
  warnings: [],
  score: 95
};

// =============================================================================
// TESTS
// =============================================================================

describe('useEnhancedConfig', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.getEnhancedConfig).mockResolvedValue(mockEnhancedConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load enhanced configuration', async () => {
    const { result } = renderHook(() => useEnhancedConfig('test-tenant'));

    expect(result.current.loading).toBe(true);
    expect(result.current.config).toBeNull();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.config).toEqual(mockEnhancedConfig);
    expect(result.current.error).toBeNull();
  });

  it('should handle configuration loading errors', async () => {
    const errorMessage = 'Failed to load configuration';
    vi.mocked(brandConfigService.getEnhancedConfig).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEnhancedConfig('test-tenant'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.config).toBeNull();
  });

  it('should refresh configuration when requested', async () => {
    const { result } = renderHook(() => useEnhancedConfig('test-tenant'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.refreshConfig();
    });

    expect(brandConfigService.clearCache).toHaveBeenCalled();
    expect(brandConfigService.getEnhancedConfig).toHaveBeenCalledTimes(2);
  });

  it('should reload configuration when tenantId changes', async () => {
    const { result, rerender } = renderHook(
      ({ tenantId }) => useEnhancedConfig(tenantId),
      { initialProps: { tenantId: 'tenant-1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    rerender({ tenantId: 'tenant-2' });

    expect(brandConfigService.getEnhancedConfig).toHaveBeenCalledWith('tenant-2');
  });
});

describe('useBrandOverrides', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.getBrandOverrides).mockResolvedValue(mockBrandOverrides);
    vi.mocked(brandConfigService.applyBrandOverride).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load brand overrides', async () => {
    const { result } = renderHook(() => useBrandOverrides());

    expect(result.current.loading).toBe(true);
    expect(result.current.overrides).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.overrides).toEqual(mockBrandOverrides);
  });

  it('should apply brand override', async () => {
    const { result } = renderHook(() => useBrandOverrides());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const override = mockBrandOverrides[0];
    const updatedOverride = { ...override, value: '#ff0000' };

    await act(async () => {
      const success = await result.current.applyOverride(updatedOverride);
      expect(success).toBe(true);
    });

    expect(brandConfigService.applyBrandOverride).toHaveBeenCalledWith(updatedOverride);
  });

  it('should toggle override active state', async () => {
    const { result } = renderHook(() => useBrandOverrides());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.toggleOverride('brand-primary-color', false);
      expect(success).toBe(true);
    });

    expect(brandConfigService.applyBrandOverride).toHaveBeenCalledWith(
      expect.objectContaining({ active: false })
    );
  });

  it('should update override value', async () => {
    const { result } = renderHook(() => useBrandOverrides());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      const success = await result.current.updateOverrideValue('brand-primary-color', '#ff0000');
      expect(success).toBe(true);
    });

    expect(brandConfigService.applyBrandOverride).toHaveBeenCalledWith(
      expect.objectContaining({ value: '#ff0000' })
    );
  });

  it('should handle override application errors', async () => {
    vi.mocked(brandConfigService.applyBrandOverride).mockResolvedValue(false);

    const { result } = renderHook(() => useBrandOverrides());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const override = mockBrandOverrides[0];

    await act(async () => {
      const success = await result.current.applyOverride(override);
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useBrandValidation', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.validateBrandConfig).mockResolvedValue(mockValidationResult);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should validate brand configuration', async () => {
    const { result } = renderHook(() => useBrandValidation(mockEnhancedConfig));

    expect(result.current.validating).toBe(true);
    expect(result.current.validation).toBeNull();

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    expect(result.current.validation).toEqual(mockValidationResult);
  });

  it('should not validate when config is null', async () => {
    const { result } = renderHook(() => useBrandValidation(null));

    expect(result.current.validating).toBe(false);
    expect(result.current.validation).toBeNull();
  });

  it('should re-validate when config changes', async () => {
    const { result, rerender } = renderHook(
      ({ config }) => useBrandValidation(config),
      { initialProps: { config: mockEnhancedConfig } }
    );

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    const newConfig = { ...mockEnhancedConfig, id: 'new-config' };
    rerender({ config: newConfig });

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    expect(brandConfigService.validateBrandConfig).toHaveBeenCalledTimes(2);
  });

  it('should handle validation errors', async () => {
    const errorResult = { ...mockValidationResult, isValid: false, errors: ['Invalid color'] };
    vi.mocked(brandConfigService.validateBrandConfig).mockResolvedValue(errorResult);

    const { result } = renderHook(() => useBrandValidation(mockEnhancedConfig));

    await waitFor(() => {
      expect(result.current.validating).toBe(false);
    });

    expect(result.current.validation).toEqual(errorResult);
  });
});

describe('useTenantBranding', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.getEnhancedConfig).mockResolvedValue(mockEnhancedConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should load tenant branding configuration', async () => {
    const { result } = renderHook(() => useTenantBranding('test-tenant'));

    await waitFor(() => {
      expect(result.current.branding).toBeDefined();
    });

    expect(result.current.branding).toEqual(mockEnhancedConfig.branding.tenant);
  });

  it('should update branding configuration', async () => {
    const { result } = renderHook(() => useTenantBranding('test-tenant'));

    await waitFor(() => {
      expect(result.current.branding).toBeDefined();
    });

    const updates = { organizationName: 'Updated Organization' };

    await act(async () => {
      const success = await result.current.updateBranding(updates);
      expect(success).toBe(true);
    });

    expect(result.current.branding?.organizationName).toBe('Updated Organization');
  });

  it('should update brand colors', async () => {
    const { result } = renderHook(() => useTenantBranding('test-tenant'));

    await waitFor(() => {
      expect(result.current.branding).toBeDefined();
    });

    const colorUpdates = { primary: '#ff0000' };

    await act(async () => {
      const success = await result.current.updateBrandColors(colorUpdates);
      expect(success).toBe(true);
    });

    expect(result.current.branding?.brandColors.primary).toBe('#ff0000');
  });

  it('should update typography', async () => {
    const { result } = renderHook(() => useTenantBranding('test-tenant'));

    await waitFor(() => {
      expect(result.current.branding).toBeDefined();
    });

    const typographyUpdates = { fontFamily: 'Arial' };

    await act(async () => {
      const success = await result.current.updateTypography(typographyUpdates);
      expect(success).toBe(true);
    });

    expect(result.current.branding?.typographyConfig.fontFamily).toBe('Arial');
  });

  it('should update brand names', async () => {
    const { result } = renderHook(() => useTenantBranding('test-tenant'));

    await waitFor(() => {
      expect(result.current.branding).toBeDefined();
    });

    const nameUpdates = { organizationName: 'New Org', appName: 'New App' };

    await act(async () => {
      const success = await result.current.updateBrandNames(nameUpdates);
      expect(success).toBe(true);
    });

    expect(result.current.branding?.organizationName).toBe('New Org');
    expect(result.current.branding?.appName).toBe('New App');
  });
});

describe('useBrandTheme', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.getEnhancedConfig).mockResolvedValue(mockEnhancedConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should provide brand theme data', async () => {
    const { result } = renderHook(() => useBrandTheme('test-tenant'));

    await waitFor(() => {
      expect(result.current.theme).toBeDefined();
    });

    expect(result.current.theme).toEqual(mockEnhancedConfig.theme);
    expect(result.current.brandColors).toEqual(mockEnhancedConfig.branding.tenant.brandColors);
    expect(result.current.typography).toEqual(mockEnhancedConfig.branding.tenant.typographyConfig);
    expect(result.current.colorVariants).toEqual(mockEnhancedConfig.theme.colors.variants);
    expect(result.current.customFonts).toEqual(mockEnhancedConfig.theme.typography.customFonts);
  });

  it('should memoize theme data', async () => {
    const { result, rerender } = renderHook(() => useBrandTheme('test-tenant'));

    await waitFor(() => {
      expect(result.current.theme).toBeDefined();
    });

    const firstTheme = result.current.theme;
    rerender();

    expect(result.current.theme).toBe(firstTheme);
  });
});

describe('useBrandPersistence', () => {
  it('should save branding configuration', async () => {
    const { result } = renderHook(() => useBrandPersistence('test-tenant'));

    const brandingConfig = mockEnhancedConfig.branding.tenant;

    await act(async () => {
      const success = await result.current.saveBranding(brandingConfig);
      expect(success).toBe(true);
    });

    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should export branding configuration', async () => {
    const { result } = renderHook(() => useBrandPersistence('test-tenant'));

    await act(async () => {
      const exportData = await result.current.exportBranding();
      expect(exportData).toBeNull(); // No branding loaded yet
    });
  });

  it('should import branding configuration', async () => {
    const { result } = renderHook(() => useBrandPersistence('test-tenant'));

    const importData = JSON.stringify(mockEnhancedConfig.branding.tenant);

    await act(async () => {
      const success = await result.current.importBranding(importData);
      expect(success).toBe(true);
    });
  });

  it('should handle import errors', async () => {
    const { result } = renderHook(() => useBrandPersistence('test-tenant'));

    const invalidImportData = 'invalid json';

    await act(async () => {
      const success = await result.current.importBranding(invalidImportData);
      expect(success).toBe(false);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useBrandAnalytics', () => {
  beforeEach(() => {
    vi.mocked(brandConfigService.getEnhancedConfig).mockResolvedValue(mockEnhancedConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should track configuration loads', async () => {
    const { result } = renderHook(() => useBrandAnalytics('test-tenant'));

    await waitFor(() => {
      expect(result.current.analytics.configLoads).toBeGreaterThan(0);
    });

    expect(result.current.analytics.lastUpdated).toBeInstanceOf(Date);
  });

  it('should track override applications', async () => {
    const { result } = renderHook(() => useBrandAnalytics('test-tenant'));

    act(() => {
      result.current.trackOverrideApplication();
    });

    expect(result.current.analytics.overrideApplications).toBe(1);
  });

  it('should track validation checks', async () => {
    const { result } = renderHook(() => useBrandAnalytics('test-tenant'));

    act(() => {
      result.current.trackValidationCheck();
    });

    expect(result.current.analytics.validationChecks).toBe(1);
  });
});

describe('useDebouncedConfigUpdate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce configuration updates', async () => {
    const onUpdate = vi.fn();
    const { result } = renderHook(() => 
      useDebouncedConfigUpdate('#ff0000', 500, onUpdate)
    );

    expect(result.current).toBe('#ff0000');
    expect(onUpdate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onUpdate).toHaveBeenCalledWith('#ff0000');
  });

  it('should cancel previous updates when value changes', async () => {
    const onUpdate = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedConfigUpdate(value, 500, onUpdate),
      { initialProps: { value: '#ff0000' } }
    );

    rerender({ value: '#00ff00' });
    rerender({ value: '#0000ff' });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onUpdate).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith('#0000ff');
  });
});

describe('useConfigChangeDetection', () => {
  it('should detect configuration changes', async () => {
    const onConfigChange = vi.fn();
    const { rerender } = renderHook(
      ({ config }) => useConfigChangeDetection(config, onConfigChange),
      { initialProps: { config: null } }
    );

    rerender({ config: mockEnhancedConfig });
    expect(onConfigChange).not.toHaveBeenCalled();

    const newConfig = { ...mockEnhancedConfig, id: 'new-config' };
    rerender({ config: newConfig });
    expect(onConfigChange).toHaveBeenCalledWith(newConfig);
  });

  it('should not trigger on initial load', async () => {
    const onConfigChange = vi.fn();
    renderHook(() => useConfigChangeDetection(mockEnhancedConfig, onConfigChange));

    expect(onConfigChange).not.toHaveBeenCalled();
  });
});
