/**
 * @fileoverview Tests for Runtime Brand Switching Service
 * @module tests/config/runtime-brand-switching.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.2: Comprehensive tests for runtime brand switching system
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  RuntimeBrandSwitchingService, 
  runtimeBrandSwitchingService,
  BrandSwitchRequest,
  BrandSwitchResult,
  BrandSwitchState,
  BrandSwitchEvent,
  BrandConfiguration
} from '@/lib/config/runtime-brand-switching';
import { TenantBrandingConfig, DEFAULT_BRAND_COLORS, DEFAULT_TYPOGRAPHY_CONFIG } from '@/lib/branding/tenant-types';

// =============================================================================
// MOCK DATA
// =============================================================================

const mockTenantBranding: TenantBrandingConfig = {
  id: 'test-brand',
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
  brandTags: ['test'],
  brandVersion: '1.0.0',
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01')
};

const mockBrandSwitchRequest: BrandSwitchRequest = {
  brandId: 'test-brand',
  brandConfig: mockTenantBranding,
  options: {
    showLoading: true,
    transitionDuration: 300,
    validateBeforeSwitch: true,
    persistSwitch: true,
    notifyComponents: true
  }
};

// =============================================================================
// TESTS
// =============================================================================

describe('RuntimeBrandSwitchingService', () => {
  let service: RuntimeBrandSwitchingService;

  beforeEach(() => {
    service = RuntimeBrandSwitchingService.getInstance();
    // Reset service state
    service['switchState'] = {
      activeBrandId: 'default',
      isSwitching: false,
      switchProgress: 0,
      availableBrands: [],
      switchHistory: []
    };
    service['eventListeners'] = new Map();
    service['switchQueue'] = [];
    service['isProcessingQueue'] = false;
    
    // Mock DOM methods
    Object.defineProperty(document, 'documentElement', {
      value: {
        style: {
          setProperty: vi.fn()
        }
      },
      writable: true
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        setItem: vi.fn(),
        getItem: vi.fn(),
        removeItem: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = RuntimeBrandSwitchingService.getInstance();
      const instance2 = RuntimeBrandSwitchingService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('switchBrand', () => {
    it('should successfully switch to a brand configuration', async () => {
      const result = await service.switchBrand(mockBrandSwitchRequest);
      
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.validation).toBeDefined();
    });

    it('should handle invalid brand switch requests', async () => {
      const invalidRequest: BrandSwitchRequest = {
        brandId: '',
        options: {
          validateBeforeSwitch: true
        }
      };

      const result = await service.switchBrand(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Brand ID is required');
    });

    it('should emit switch events during brand switching', async () => {
      const eventListener = vi.fn();
      service.addEventListener('switch_started', eventListener);
      service.addEventListener('switch_completed', eventListener);

      await service.switchBrand(mockBrandSwitchRequest);

      expect(eventListener).toHaveBeenCalledTimes(2);
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'switch_started' })
      );
      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'switch_completed' })
      );
    });

    it('should update switch state during brand switching', async () => {
      const initialState = service.getSwitchState();
      expect(initialState.isSwitching).toBe(false);

      const switchPromise = service.switchBrand(mockBrandSwitchRequest);
      
      // Check that switching state is set
      const switchingState = service.getSwitchState();
      expect(switchingState.isSwitching).toBe(true);

      await switchPromise;

      // Check final state
      const finalState = service.getSwitchState();
      expect(finalState.isSwitching).toBe(false);
      expect(finalState.activeBrandId).toBe(mockBrandSwitchRequest.brandId);
    });

    it('should update CSS variables during brand switching', async () => {
      await service.switchBrand(mockBrandSwitchRequest);

      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--brand-primary',
        mockTenantBranding.brandColors.primary
      );
      expect(document.documentElement.style.setProperty).toHaveBeenCalledWith(
        '--brand-font-family',
        mockTenantBranding.typographyConfig.fontFamily
      );
    });

    it('should persist brand switch when requested', async () => {
      await service.switchBrand({
        ...mockBrandSwitchRequest,
        options: {
          ...mockBrandSwitchRequest.options,
          persistSwitch: true
        }
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'active-brand-id',
        mockBrandSwitchRequest.brandId
      );
    });
  });

  describe('queueBrandSwitch', () => {
    it('should queue brand switch requests', async () => {
      const request1: BrandSwitchRequest = { brandId: 'brand-1' };
      const request2: BrandSwitchRequest = { brandId: 'brand-2' };

      await service.queueBrandSwitch(request1);
      await service.queueBrandSwitch(request2);

      expect(service['switchQueue']).toHaveLength(2);
      expect(service['switchQueue'][0]).toBe(request1);
      expect(service['switchQueue'][1]).toBe(request2);
    });

    it('should process queued requests in order', async () => {
      const request1: BrandSwitchRequest = { brandId: 'brand-1' };
      const request2: BrandSwitchRequest = { brandId: 'brand-2' };

      const switchSpy = vi.spyOn(service, 'switchBrand').mockResolvedValue({
        success: true,
        duration: 100
      });

      await service.queueBrandSwitch(request1);
      await service.queueBrandSwitch(request2);

      // Wait for queue processing
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(switchSpy).toHaveBeenCalledTimes(2);
      expect(switchSpy).toHaveBeenNthCalledWith(1, request1);
      expect(switchSpy).toHaveBeenNthCalledWith(2, request2);
    });
  });

  describe('getSwitchState', () => {
    it('should return current switch state', () => {
      const state = service.getSwitchState();
      
      expect(state).toHaveProperty('activeBrandId');
      expect(state).toHaveProperty('isSwitching');
      expect(state).toHaveProperty('switchProgress');
      expect(state).toHaveProperty('availableBrands');
      expect(state).toHaveProperty('switchHistory');
    });

    it('should return a copy of the state', () => {
      const state1 = service.getSwitchState();
      const state2 = service.getSwitchState();
      
      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe('getAvailableBrands', () => {
    it('should return available brand configurations', async () => {
      const brands = await service.getAvailableBrands();
      
      expect(Array.isArray(brands)).toBe(true);
      expect(brands.length).toBeGreaterThan(0);
      
      const defaultBrand = brands.find(brand => brand.id === 'default');
      expect(defaultBrand).toBeDefined();
      expect(defaultBrand?.isPreset).toBe(true);
    });

    it('should cache available brands', async () => {
      const brands1 = await service.getAvailableBrands();
      const brands2 = await service.getAvailableBrands();
      
      expect(brands1).toBe(brands2);
    });
  });

  describe('getSwitchHistory', () => {
    it('should return switch history', () => {
      const history = service.getSwitchHistory();
      
      expect(Array.isArray(history)).toBe(true);
    });

    it('should add entries to history after successful switches', async () => {
      const initialHistory = service.getSwitchHistory();
      
      await service.switchBrand(mockBrandSwitchRequest);
      
      const finalHistory = service.getSwitchHistory();
      expect(finalHistory.length).toBe(initialHistory.length + 1);
      
      const lastEntry = finalHistory[0];
      expect(lastEntry.fromBrandId).toBe('default');
      expect(lastEntry.toBrandId).toBe(mockBrandSwitchRequest.brandId);
      expect(lastEntry.success).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('should add and remove event listeners', () => {
      const listener = vi.fn();
      
      service.addEventListener('test-event', listener);
      expect(service['eventListeners'].get('test-event')).toContain(listener);
      
      service.removeEventListener('test-event', listener);
      expect(service['eventListeners'].get('test-event')).not.toContain(listener);
    });

    it('should handle multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      service.addEventListener('test-event', listener1);
      service.addEventListener('test-event', listener2);
      
      const listeners = service['eventListeners'].get('test-event');
      expect(listeners).toHaveLength(2);
      expect(listeners).toContain(listener1);
      expect(listeners).toContain(listener2);
    });
  });

  describe('cancelBrandSwitch', () => {
    it('should cancel current brand switch', () => {
      // Set switching state
      service['switchState'].isSwitching = true;
      
      const result = service.cancelBrandSwitch();
      
      expect(result).toBe(true);
      expect(service.getSwitchState().isSwitching).toBe(false);
    });

    it('should return false when not switching', () => {
      const result = service.cancelBrandSwitch();
      expect(result).toBe(false);
    });
  });

  describe('resetToDefaultBrand', () => {
    it('should reset to default brand', async () => {
      const result = await service.resetToDefaultBrand();
      
      expect(result.success).toBe(true);
      expect(service.getSwitchState().activeBrandId).toBe('default');
    });
  });

  describe('Error Handling', () => {
    it('should handle brand configuration loading errors', async () => {
      const invalidRequest: BrandSwitchRequest = {
        brandId: 'non-existent-brand',
        options: {
          validateBeforeSwitch: false
        }
      };

      const result = await service.switchBrand(invalidRequest);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Brand configuration not found');
    });

    it('should handle CSS variable update errors gracefully', async () => {
      // Mock CSS variable update to throw error
      document.documentElement.style.setProperty = vi.fn().mockImplementation(() => {
        throw new Error('CSS update failed');
      });

      const result = await service.switchBrand(mockBrandSwitchRequest);
      
      // Should still succeed despite CSS error
      expect(result.success).toBe(true);
    });

    it('should handle localStorage errors gracefully', async () => {
      // Mock localStorage to throw error
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('localStorage failed');
      });

      const result = await service.switchBrand({
        ...mockBrandSwitchRequest,
        options: {
          ...mockBrandSwitchRequest.options,
          persistSwitch: true
        }
      });
      
      // Should still succeed despite localStorage error
      expect(result.success).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete brand switches within reasonable time', async () => {
      const startTime = performance.now();
      
      const result = await service.switchBrand(mockBrandSwitchRequest);
      
      const duration = performance.now() - startTime;
      
      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle concurrent brand switch requests', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => ({
        brandId: `brand-${i}`,
        brandConfig: {
          ...mockTenantBranding,
          id: `brand-${i}`,
          organizationName: `Organization ${i}`
        }
      }));

      const promises = requests.map(request => service.switchBrand(request));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Integration', () => {
    it('should integrate with brand configuration service', async () => {
      // This would test integration with the actual brand configuration service
      const result = await service.switchBrand(mockBrandSwitchRequest);
      
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
    });

    it('should maintain state consistency across multiple switches', async () => {
      const request1: BrandSwitchRequest = { brandId: 'brand-1' };
      const request2: BrandSwitchRequest = { brandId: 'brand-2' };

      await service.switchBrand(request1);
      const state1 = service.getSwitchState();
      expect(state1.activeBrandId).toBe('brand-1');

      await service.switchBrand(request2);
      const state2 = service.getSwitchState();
      expect(state2.activeBrandId).toBe('brand-2');
    });
  });
});

describe('Runtime Brand Switching Integration', () => {
  it('should work with singleton service', async () => {
    const result = await runtimeBrandSwitchingService.switchBrand(mockBrandSwitchRequest);
    
    expect(result.success).toBe(true);
    expect(result.config).toBeDefined();
  });

  it('should maintain state across service calls', async () => {
    const initialState = runtimeBrandSwitchingService.getSwitchState();
    
    await runtimeBrandSwitchingService.switchBrand(mockBrandSwitchRequest);
    
    const finalState = runtimeBrandSwitchingService.getSwitchState();
    expect(finalState.activeBrandId).toBe(mockBrandSwitchRequest.brandId);
  });

  it('should handle event emission correctly', async () => {
    const eventListener = vi.fn();
    runtimeBrandSwitchingService.addEventListener('switch_completed', eventListener);

    await runtimeBrandSwitchingService.switchBrand(mockBrandSwitchRequest);

    expect(eventListener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'switch_completed',
        request: mockBrandSwitchRequest
      })
    );
  });
});

describe('Brand Switch Request Validation', () => {
  it('should validate required fields', async () => {
    const invalidRequests = [
      { brandId: '' },
      { brandId: 'valid-id', brandConfig: { organizationName: '' } },
      { brandId: 'valid-id', brandConfig: { appName: '' } }
    ];

    for (const request of invalidRequests) {
      const result = await runtimeBrandSwitchingService.switchBrand(request);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    }
  });

  it('should validate preset names', async () => {
    const invalidRequest: BrandSwitchRequest = {
      brandId: 'test',
      presetName: 'invalid-preset'
    };

    const result = await runtimeBrandSwitchingService.switchBrand(invalidRequest);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid preset name');
  });
});

describe('Brand Switch Options', () => {
  it('should respect transition duration option', async () => {
    const customDuration = 500;
    const request: BrandSwitchRequest = {
      brandId: 'test',
      options: {
        transitionDuration: customDuration
      }
    };

    const result = await runtimeBrandSwitchingService.switchBrand(request);
    expect(result.success).toBe(true);
  });

  it('should respect validation option', async () => {
    const request: BrandSwitchRequest = {
      brandId: 'test',
      options: {
        validateBeforeSwitch: true
      }
    };

    const result = await runtimeBrandSwitchingService.switchBrand(request);
    expect(result.success).toBe(true);
    expect(result.validation).toBeDefined();
  });

  it('should respect persistence option', async () => {
    const request: BrandSwitchRequest = {
      brandId: 'test',
      options: {
        persistSwitch: true
      }
    };

    await runtimeBrandSwitchingService.switchBrand(request);
    expect(localStorage.setItem).toHaveBeenCalledWith('active-brand-id', 'test');
  });
});
