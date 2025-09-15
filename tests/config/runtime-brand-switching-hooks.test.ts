/**
 * @fileoverview Tests for Runtime Brand Switching React Hooks
 * @module tests/config/runtime-brand-switching-hooks.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.2: Tests for React hooks in runtime brand switching system
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  useRuntimeBrandSwitching,
  useAvailableBrands,
  useBrandSwitchHistory,
  useBrandSwitchingWithTransitions,
  useBrandSwitchingAnalytics,
  useBrandSwitchingWithLoading,
  useDebouncedBrandSwitching,
  useBrandSwitchingWithErrorHandling,
  useBrandSwitchingKeyboardShortcuts
} from '@/lib/config/runtime-brand-switching-hooks';
import { runtimeBrandSwitchingService } from '@/lib/config/runtime-brand-switching';
import { BrandSwitchRequest, BrandSwitchResult, BrandConfiguration } from '@/lib/config/runtime-brand-switching';
import { TenantBrandingConfig, DEFAULT_BRAND_COLORS, DEFAULT_TYPOGRAPHY_CONFIG } from '@/lib/branding/tenant-types';

// =============================================================================
// MOCK SETUP
// =============================================================================

jest.mock('@/lib/config/runtime-brand-switching', () => ({
  runtimeBrandSwitchingService: {
    switchBrand: jest.fn(),
    queueBrandSwitch: jest.fn(),
    cancelBrandSwitch: jest.fn(),
    resetToDefaultBrand: jest.fn(),
    getSwitchState: jest.fn(),
    getAvailableBrands: jest.fn(),
    getSwitchHistory: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }
}));

const mockBrandSwitchResult: BrandSwitchResult = {
  success: true,
  config: {
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
  },
  duration: 250
};

const mockBrandConfiguration: BrandConfiguration = {
  id: 'test-brand',
  name: 'Test Brand',
  description: 'Test brand configuration',
  config: {
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
  isPreset: true,
  tags: ['test'],
  lastModified: new Date()
};

const mockSwitchState = {
  activeBrandId: 'default',
  isSwitching: false,
  switchProgress: 0,
  availableBrands: [mockBrandConfiguration],
  switchHistory: []
};

// =============================================================================
// TESTS
// =============================================================================

describe('useRuntimeBrandSwitching', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.getSwitchState as jest.Mock).mockReturnValue(mockSwitchState);
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
    (runtimeBrandSwitchingService.queueBrandSwitch as jest.Mock).mockResolvedValue();
    (runtimeBrandSwitchingService.cancelBrandSwitch as jest.Mock).mockReturnValue(true);
    (runtimeBrandSwitchingService.resetToDefaultBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return switch state and functions', () => {
    const { result } = renderHook(() => useRuntimeBrandSwitching());

    expect(result.current.switchState).toEqual(mockSwitchState);
    expect(typeof result.current.switchBrand).toBe('function');
    expect(typeof result.current.queueBrandSwitch).toBe('function');
    expect(typeof result.current.cancelBrandSwitch).toBe('function');
    expect(typeof result.current.resetToDefaultBrand).toBe('function');
    expect(result.current.error).toBeNull();
    expect(result.current.lastResult).toBeNull();
  });

  it('should handle successful brand switching', async () => {
    const { result } = renderHook(() => useRuntimeBrandSwitching());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand',
      options: {
        showLoading: true,
        transitionDuration: 300
      }
    };

    await act(async () => {
      const switchResult = await result.current.switchBrand(request);
      expect(switchResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(request);
    expect(result.current.lastResult).toEqual(mockBrandSwitchResult);
    expect(result.current.error).toBeNull();
  });

  it('should handle brand switching errors', async () => {
    const errorMessage = 'Switch failed';
    jest.mocked(runtimeBrandSwitchingService.switchBrand).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useRuntimeBrandSwitching());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      const switchResult = await result.current.switchBrand(request);
      expect(switchResult.success).toBe(false);
      expect(switchResult.error).toBe(errorMessage);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.lastResult?.success).toBe(false);
  });

  it('should queue brand switches', async () => {
    const { result } = renderHook(() => useRuntimeBrandSwitching());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      await result.current.queueBrandSwitch(request);
    });

    expect(runtimeBrandSwitchingService.queueBrandSwitch).toHaveBeenCalledWith(request);
  });

  it('should cancel brand switches', () => {
    const { result } = renderHook(() => useRuntimeBrandSwitching());

    act(() => {
      const cancelled = result.current.cancelBrandSwitch();
      expect(cancelled).toBe(true);
    });

    expect(runtimeBrandSwitchingService.cancelBrandSwitch).toHaveBeenCalled();
  });

  it('should reset to default brand', async () => {
    const { result } = renderHook(() => useRuntimeBrandSwitching());

    await act(async () => {
      const resetResult = await result.current.resetToDefaultBrand();
      expect(resetResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.resetToDefaultBrand).toHaveBeenCalled();
  });
});

describe('useAvailableBrands', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.getAvailableBrands as jest.Mock).mockResolvedValue([mockBrandConfiguration]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should load available brands', async () => {
    const { result } = renderHook(() => useAvailableBrands());

    expect(result.current.loading).toBe(true);
    expect(result.current.brands).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.brands).toEqual([mockBrandConfiguration]);
    expect(result.current.error).toBeNull();
  });

  it('should handle loading errors', async () => {
    const errorMessage = 'Failed to load brands';
    jest.mocked(runtimeBrandSwitchingService.getAvailableBrands).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useAvailableBrands());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.brands).toEqual([]);
  });

  it('should find brand by ID', async () => {
    const { result } = renderHook(() => useAvailableBrands());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const brand = result.current.getBrandById('test-brand');
    expect(brand).toEqual(mockBrandConfiguration);

    const nonExistentBrand = result.current.getBrandById('non-existent');
    expect(nonExistentBrand).toBeUndefined();
  });

  it('should filter brands by tag', async () => {
    const { result } = renderHook(() => useAvailableBrands());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const testBrands = result.current.getBrandsByTag('test');
    expect(testBrands).toEqual([mockBrandConfiguration]);

    const emptyBrands = result.current.getBrandsByTag('non-existent');
    expect(emptyBrands).toEqual([]);
  });

  it('should separate preset and custom brands', async () => {
    const customBrand = { ...mockBrandConfiguration, id: 'custom-brand', isPreset: false };
    (runtimeBrandSwitchingService.getAvailableBrands as jest.Mock).mockResolvedValue([
      mockBrandConfiguration,
      customBrand
    ]);

    const { result } = renderHook(() => useAvailableBrands());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const presetBrands = result.current.getPresetBrands();
    expect(presetBrands).toEqual([mockBrandConfiguration]);

    const customBrands = result.current.getCustomBrands();
    expect(customBrands).toEqual([customBrand]);
  });
});

describe('useBrandSwitchHistory', () => {
  const mockHistory = [
    {
      timestamp: new Date('2025-01-01'),
      fromBrandId: 'default',
      toBrandId: 'brand-1',
      duration: 250,
      success: true,
      options: {}
    },
    {
      timestamp: new Date('2025-01-02'),
      fromBrandId: 'brand-1',
      toBrandId: 'brand-2',
      duration: 300,
      success: false,
      options: {}
    }
  ];

  beforeEach(() => {
    (runtimeBrandSwitchingService.getSwitchHistory as jest.Mock).mockReturnValue(mockHistory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return switch history', () => {
    const { result } = renderHook(() => useBrandSwitchHistory());

    expect(result.current.history).toEqual(mockHistory);
  });

  it('should get recent switches', () => {
    const { result } = renderHook(() => useBrandSwitchHistory());

    const recentSwitches = result.current.getRecentSwitches(1);
    expect(recentSwitches).toEqual([mockHistory[0]]);
  });

  it('should get successful switches', () => {
    const { result } = renderHook(() => useBrandSwitchHistory());

    const successfulSwitches = result.current.getSuccessfulSwitches();
    expect(successfulSwitches).toEqual([mockHistory[0]]);
  });

  it('should get failed switches', () => {
    const { result } = renderHook(() => useBrandSwitchHistory());

    const failedSwitches = result.current.getFailedSwitches();
    expect(failedSwitches).toEqual([mockHistory[1]]);
  });

  it('should calculate average switch duration', () => {
    const { result } = renderHook(() => useBrandSwitchHistory());

    const averageDuration = result.current.getAverageSwitchDuration();
    expect(averageDuration).toBe(275); // (250 + 300) / 2
  });
});

describe('useBrandSwitchingWithTransitions', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.getSwitchState as jest.Mock).mockReturnValue(mockSwitchState);
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle brand switching with transitions', async () => {
    const { result } = renderHook(() => useBrandSwitchingWithTransitions());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand',
      options: {
        transitionDuration: 500
      }
    };

    await act(async () => {
      const switchResult = await result.current.switchBrandWithTransition(request);
      expect(switchResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          transitionDuration: 500
        })
      })
    );
  });

  it('should track transition state', async () => {
    const { result } = renderHook(() => useBrandSwitchingWithTransitions());

    expect(result.current.transitionState.isTransitioning).toBe(false);
    expect(result.current.transitionState.transitionProgress).toBe(0);

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      await result.current.switchBrandWithTransition(request);
    });

    // Transition should complete
    expect(result.current.transitionState.isTransitioning).toBe(false);
  });
});

describe('useBrandSwitchingAnalytics', () => {
  const mockHistory = [
    {
      timestamp: new Date(Date.now() - 1000),
      fromBrandId: 'default',
      toBrandId: 'brand-1',
      duration: 250,
      success: true,
      options: {}
    },
    {
      timestamp: new Date(Date.now() - 2000),
      fromBrandId: 'brand-1',
      toBrandId: 'brand-2',
      duration: 300,
      success: true,
      options: {}
    },
    {
      timestamp: new Date(Date.now() - 3000),
      fromBrandId: 'brand-2',
      toBrandId: 'brand-1',
      duration: 200,
      success: false,
      options: {}
    }
  ];

  beforeEach(() => {
    (runtimeBrandSwitchingService.getSwitchHistory as jest.Mock).mockReturnValue(mockHistory);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate analytics correctly', () => {
    const { result } = renderHook(() => useBrandSwitchingAnalytics());

    expect(result.current.analytics.totalSwitches).toBe(3);
    expect(result.current.analytics.successfulSwitches).toBe(2);
    expect(result.current.analytics.failedSwitches).toBe(1);
    expect(result.current.analytics.averageDuration).toBe(250); // (250 + 300 + 200) / 3
    expect(result.current.analytics.mostUsedBrand).toBe('brand-1');
  });

  it('should calculate success rate', () => {
    const { result } = renderHook(() => useBrandSwitchingAnalytics());

    const successRate = result.current.getSuccessRate();
    expect(successRate).toBeCloseTo(66.67, 1); // 2/3 * 100
  });

  it('should calculate failure rate', () => {
    const { result } = renderHook(() => useBrandSwitchingAnalytics());

    const failureRate = result.current.getFailureRate();
    expect(failureRate).toBeCloseTo(33.33, 1); // 1/3 * 100
  });
});

describe('useBrandSwitchingWithLoading', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.getSwitchState as jest.Mock).mockReturnValue(mockSwitchState);
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle brand switching with loading states', async () => {
    const { result } = renderHook(() => useBrandSwitchingWithLoading());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      const switchResult = await result.current.switchBrandWithLoading(request, 'Custom loading message');
      expect(switchResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          showLoading: true
        })
      })
    );
  });

  it('should track loading states', async () => {
    const { result } = renderHook(() => useBrandSwitchingWithLoading());

    expect(result.current.loadingStates.isSwitching).toBe(false);
    expect(result.current.loadingStates.loadingMessage).toBe('');

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      await result.current.switchBrandWithLoading(request);
    });

    // Loading should complete
    expect(result.current.loadingStates.isSwitching).toBe(false);
  });
});

describe('useDebouncedBrandSwitching', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should debounce brand switching', async () => {
    const { result } = renderHook(() => useDebouncedBrandSwitching(500));

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    act(() => {
      result.current.debouncedSwitchBrand(request);
    });

    expect(result.current.isDebouncing).toBe(true);
    expect(result.current.pendingRequest).toEqual(request);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current.isDebouncing).toBe(false);
      expect(result.current.pendingRequest).toBeNull();
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(request);
  });

  it('should cancel debounced switches', () => {
    const { result } = renderHook(() => useDebouncedBrandSwitching(500));

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    act(() => {
      result.current.debouncedSwitchBrand(request);
    });

    expect(result.current.isDebouncing).toBe(true);

    act(() => {
      result.current.cancelDebouncedSwitch();
    });

    expect(result.current.isDebouncing).toBe(false);
    expect(result.current.pendingRequest).toBeNull();
  });
});

describe('useBrandSwitchingWithErrorHandling', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle brand switching with retry', async () => {
    const { result } = renderHook(() => useBrandSwitchingWithErrorHandling());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      const switchResult = await result.current.switchBrandWithRetry(request);
      expect(switchResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(request);
    expect(result.current.retryCount).toBe(0);
  });

  it('should retry on failure', async () => {
    const errorMessage = 'Switch failed';
    jest.mocked(runtimeBrandSwitchingService.switchBrand)
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockRejectedValueOnce(new Error(errorMessage))
      .mockResolvedValueOnce(mockBrandSwitchResult);

    const { result } = renderHook(() => useBrandSwitchingWithErrorHandling());

    const request: BrandSwitchRequest = {
      brandId: 'test-brand'
    };

    await act(async () => {
      const switchResult = await result.current.switchBrandWithRetry(request, 100);
      expect(switchResult.success).toBe(true);
    });

    expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledTimes(3);
    expect(result.current.errorHistory).toContain(errorMessage);
  });

  it('should clear error history', () => {
    const { result } = renderHook(() => useBrandSwitchingWithErrorHandling());

    act(() => {
      result.current.clearErrorHistory();
    });

    expect(result.current.errorHistory).toEqual([]);
    expect(result.current.retryCount).toBe(0);
  });
});

describe('useBrandSwitchingKeyboardShortcuts', () => {
  beforeEach(() => {
    (runtimeBrandSwitchingService.switchBrand as jest.Mock).mockResolvedValue(mockBrandSwitchResult);
    (runtimeBrandSwitchingService.getAvailableBrands as jest.Mock).mockResolvedValue([
      mockBrandConfiguration,
      { ...mockBrandConfiguration, id: 'brand-2', name: 'Brand 2' },
      { ...mockBrandConfiguration, id: 'brand-3', name: 'Brand 3' }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle keyboard shortcuts', async () => {
    renderHook(() => useBrandSwitchingKeyboardShortcuts());

    // Simulate Ctrl+1 keypress
    const event = new KeyboardEvent('keydown', {
      key: '1',
      ctrlKey: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(
        expect.objectContaining({
          brandId: mockBrandConfiguration.id
        })
      );
    });
  });

  it('should handle default brand shortcut', async () => {
    renderHook(() => useBrandSwitchingKeyboardShortcuts());

    // Simulate Ctrl+0 keypress
    const event = new KeyboardEvent('keydown', {
      key: '0',
      ctrlKey: true
    });

    act(() => {
      document.dispatchEvent(event);
    });

    await waitFor(() => {
      expect(runtimeBrandSwitchingService.switchBrand).toHaveBeenCalledWith(
        expect.objectContaining({
          brandId: 'default'
        })
      );
    });
  });
});
