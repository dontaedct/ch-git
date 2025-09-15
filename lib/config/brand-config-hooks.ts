/**
 * @fileoverview React Hooks for Enhanced Brand Configuration
 * @module lib/config/brand-config-hooks
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.1: React hooks for enhanced configuration system with brand support
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  brandConfigService, 
  EnhancedAppConfig, 
  BrandConfigOverride, 
  BrandConfigValidationResult 
} from './brand-config-service';
import { TenantBrandingConfig, BrandColors, TypographyConfig } from '@/lib/branding/tenant-types';

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for managing enhanced application configuration with brand support
 */
export function useEnhancedConfig(tenantId?: string) {
  const [config, setConfig] = useState<EnhancedAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const enhancedConfig = await brandConfigService.getEnhancedConfig(tenantId);
      setConfig(enhancedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const refreshConfig = useCallback(() => {
    brandConfigService.clearCache();
    loadConfig();
  }, [loadConfig]);

  return {
    config,
    loading,
    error,
    refreshConfig
  };
}

/**
 * Hook for managing brand configuration overrides
 */
export function useBrandOverrides() {
  const [overrides, setOverrides] = useState<BrandConfigOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverrides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const brandOverrides = await brandConfigService.getBrandOverrides();
      setOverrides(brandOverrides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load overrides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverrides();
  }, [loadOverrides]);

  const applyOverride = useCallback(async (override: BrandConfigOverride) => {
    try {
      const success = await brandConfigService.applyBrandOverride(override);
      if (success) {
        // Update local state
        setOverrides(prev => 
          prev.map(o => o.id === override.id ? { ...o, ...override } : o)
        );
        // Clear config cache to force reload
        brandConfigService.clearCache();
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply override');
      return false;
    }
  }, []);

  const toggleOverride = useCallback(async (overrideId: string, active: boolean) => {
    const override = overrides.find(o => o.id === overrideId);
    if (override) {
      const updatedOverride = { ...override, active };
      return await applyOverride(updatedOverride);
    }
    return false;
  }, [overrides, applyOverride]);

  const updateOverrideValue = useCallback(async (overrideId: string, value: unknown) => {
    const override = overrides.find(o => o.id === overrideId);
    if (override) {
      const updatedOverride = { ...override, value };
      return await applyOverride(updatedOverride);
    }
    return false;
  }, [overrides, applyOverride]);

  return {
    overrides,
    loading,
    error,
    applyOverride,
    toggleOverride,
    updateOverrideValue,
    refreshOverrides: loadOverrides
  };
}

/**
 * Hook for brand configuration validation
 */
export function useBrandValidation(config: EnhancedAppConfig | null) {
  const [validation, setValidation] = useState<BrandConfigValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  const validateConfig = useCallback(async () => {
    if (!config) return;

    try {
      setValidating(true);
      const result = await brandConfigService.validateBrandConfig(config);
      setValidation(result);
    } catch (error) {
      console.error('Validation failed:', error);
      setValidation({
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
        score: 0
      });
    } finally {
      setValidating(false);
    }
  }, [config]);

  useEffect(() => {
    validateConfig();
  }, [validateConfig]);

  return {
    validation,
    validating,
    validateConfig
  };
}

/**
 * Hook for managing tenant branding configuration
 */
export function useTenantBranding(tenantId?: string) {
  const { config } = useEnhancedConfig(tenantId);
  const [branding, setBranding] = useState<TenantBrandingConfig | null>(null);

  useEffect(() => {
    if (config?.branding?.tenant) {
      setBranding(config.branding.tenant);
    }
  }, [config]);

  const updateBranding = useCallback(async (updates: Partial<TenantBrandingConfig>) => {
    if (!branding) return false;

    try {
      const updatedBranding = { ...branding, ...updates, updatedAt: new Date() };
      setBranding(updatedBranding);
      
      // Clear cache to force reload with new branding
      brandConfigService.clearCache();
      
      return true;
    } catch (error) {
      console.error('Failed to update branding:', error);
      return false;
    }
  }, [branding]);

  const updateBrandColors = useCallback(async (colors: Partial<BrandColors>) => {
    if (!branding) return false;

    return await updateBranding({
      brandColors: { ...branding.brandColors, ...colors }
    });
  }, [branding, updateBranding]);

  const updateTypography = useCallback(async (typography: Partial<TypographyConfig>) => {
    if (!branding) return false;

    return await updateBranding({
      typographyConfig: { ...branding.typographyConfig, ...typography }
    });
  }, [branding, updateBranding]);

  const updateBrandNames = useCallback(async (names: { organizationName?: string; appName?: string }) => {
    if (!branding) return false;
    
    return await updateBranding(names);
  }, [branding, updateBranding]);

  return {
    branding,
    updateBranding,
    updateBrandColors,
    updateTypography,
    updateBrandNames
  };
}

/**
 * Hook for brand theme management
 */
export function useBrandTheme(tenantId?: string) {
  const { config } = useEnhancedConfig(tenantId);
  
  const theme = useMemo(() => {
    return config?.theme || null;
  }, [config]);

  const brandColors = useMemo(() => {
    return config?.branding?.tenant?.brandColors || null;
  }, [config]);

  const typography = useMemo(() => {
    return config?.branding?.tenant?.typographyConfig || null;
  }, [config]);

  const colorVariants = useMemo(() => {
    return config?.theme?.colors?.variants || null;
  }, [config]);

  const customFonts = useMemo(() => {
    return config?.theme?.typography?.customFonts || [];
  }, [config]);

  return {
    theme,
    brandColors,
    typography,
    colorVariants,
    customFonts
  };
}

/**
 * Hook for brand configuration persistence
 */
export function useBrandPersistence(tenantId?: string) {
  const { branding } = useTenantBranding(tenantId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveBranding = useCallback(async (brandingConfig: TenantBrandingConfig) => {
    try {
      setSaving(true);
      setError(null);
      
      // This would save to the actual database
      // For now, just simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear cache to force reload
      brandConfigService.clearCache();
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save branding');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  const exportBranding = useCallback(async () => {
    if (!branding) return null;
    
    try {
      const exportData = {
        ...branding,
        exportedAt: new Date().toISOString(),
        version: '2.0.0'
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      setError('Failed to export branding configuration');
      return null;
    }
  }, [branding]);

  const importBranding = useCallback(async (importData: string) => {
    try {
      const parsed = JSON.parse(importData);
      
      // Validate imported data
      if (!parsed.organizationName || !parsed.appName) {
        throw new Error('Invalid branding configuration');
      }
      
      // Apply imported configuration
      const success = await saveBranding(parsed);
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to import branding');
      return false;
    }
  }, [saveBranding]);

  return {
    saving,
    error,
    saveBranding,
    exportBranding,
    importBranding
  };
}

/**
 * Hook for brand configuration analytics
 */
export function useBrandAnalytics(tenantId?: string) {
  const { config } = useEnhancedConfig(tenantId);
  const [analytics, setAnalytics] = useState({
    configLoads: 0,
    overrideApplications: 0,
    validationChecks: 0,
    lastUpdated: new Date()
  });

  useEffect(() => {
    if (config) {
      setAnalytics(prev => ({
        ...prev,
        configLoads: prev.configLoads + 1,
        lastUpdated: new Date()
      }));
    }
  }, [config]);

  const trackOverrideApplication = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      overrideApplications: prev.overrideApplications + 1,
      lastUpdated: new Date()
    }));
  }, []);

  const trackValidationCheck = useCallback(() => {
    setAnalytics(prev => ({
      ...prev,
      validationChecks: prev.validationChecks + 1,
      lastUpdated: new Date()
    }));
  }, []);

  return {
    analytics,
    trackOverrideApplication,
    trackValidationCheck
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook for debounced configuration updates
 */
export function useDebouncedConfigUpdate(
  value: unknown, 
  delay: number = 500,
  onUpdate: (value: unknown) => void
) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      onUpdate(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay, onUpdate]);

  return debouncedValue;
}

/**
 * Hook for configuration change detection
 */
export function useConfigChangeDetection(
  config: EnhancedAppConfig | null,
  onConfigChange: (config: EnhancedAppConfig) => void
) {
  const [previousConfig, setPreviousConfig] = useState<EnhancedAppConfig | null>(null);

  useEffect(() => {
    if (config && previousConfig && JSON.stringify(config) !== JSON.stringify(previousConfig)) {
      onConfigChange(config);
    }
    setPreviousConfig(config);
  }, [config, previousConfig, onConfigChange]);
}

export default {
  useEnhancedConfig,
  useBrandOverrides,
  useBrandValidation,
  useTenantBranding,
  useBrandTheme,
  useBrandPersistence,
  useBrandAnalytics,
  useDebouncedConfigUpdate,
  useConfigChangeDetection
};
