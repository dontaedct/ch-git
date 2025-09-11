/**
 * @fileoverview React Hooks for Dynamic Logo and Brand Management
 * @module lib/branding/hooks
 * @author OSS Hero System
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  LogoManager, 
  DynamicBrandConfig, 
  LogoConfig, 
  BrandNameConfig,
  logoManager,
  BrandUtils 
} from './logo-manager';

/**
 * Hook for managing dynamic brand configuration
 */
export function useDynamicBrand(initialConfig?: DynamicBrandConfig) {
  const [config, setConfig] = useState<DynamicBrandConfig>(
    initialConfig || logoManager.getCurrentConfig()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = logoManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const updateConfig = useCallback(async (newConfig: Partial<DynamicBrandConfig>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      logoManager.updateConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand configuration');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPreset = useCallback(async (presetName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = logoManager.loadPreset(presetName);
      if (!success) {
        throw new Error(`Preset '${presetName}' not found`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preset');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const logoUrl = await logoManager.uploadLogo(file);
      logoManager.setCustomLogo(logoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload logo');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setCustomLogo = useCallback((src: string, alt?: string) => {
    logoManager.setCustomLogo(src, alt);
  }, []);

  const setBrandInitials = useCallback((initials: string, bgColor?: string) => {
    logoManager.setBrandInitials(initials, bgColor);
  }, []);

  const updateBrandNames = useCallback((brandName: Partial<BrandNameConfig>) => {
    logoManager.updateBrandNames(brandName);
  }, []);

  const exportConfig = useCallback(() => {
    return logoManager.exportConfig();
  }, []);

  const importConfig = useCallback((configJson: string) => {
    return logoManager.importConfig(configJson);
  }, []);

  return {
    config,
    isLoading,
    error,
    updateConfig,
    loadPreset,
    uploadLogo,
    setCustomLogo,
    setBrandInitials,
    updateBrandNames,
    exportConfig,
    importConfig,
  };
}

/**
 * Hook for managing logo configuration
 */
export function useLogoConfig() {
  const { config, setCustomLogo, setBrandInitials, uploadLogo } = useDynamicBrand();

  const logoConfig = config.logo;

  const handleLogoUpload = useCallback(async (file: File) => {
    await uploadLogo(file);
  }, [uploadLogo]);

  const handleSetCustomLogo = useCallback((src: string, alt?: string) => {
    setCustomLogo(src, alt);
  }, [setCustomLogo]);

  const handleSetInitials = useCallback((initials: string, bgColor?: string) => {
    setBrandInitials(initials, bgColor);
  }, [setBrandInitials]);

  return {
    logoConfig,
    handleLogoUpload,
    handleSetCustomLogo,
    handleSetInitials,
  };
}

/**
 * Hook for managing brand names
 */
export function useBrandNames() {
  const { config, updateBrandNames } = useDynamicBrand();

  const brandNames = config.brandName;

  const updateNames = useCallback((names: Partial<BrandNameConfig>) => {
    updateBrandNames(names);
  }, [updateBrandNames]);

  const generateNamesFromOrg = useCallback((organizationName: string, appName: string) => {
    const generatedNames = BrandUtils.generateBrandNames(organizationName, appName);
    updateBrandNames(generatedNames);
  }, [updateBrandNames]);

  return {
    brandNames,
    updateNames,
    generateNamesFromOrg,
  };
}

/**
 * Hook for brand presets
 */
export function useBrandPresets() {
  const { loadPreset } = useDynamicBrand();
  const [availablePresets, setAvailablePresets] = useState<string[]>([]);

  useEffect(() => {
    setAvailablePresets(BrandUtils.getAvailablePresets());
  }, []);

  const loadBrandPreset = useCallback(async (presetName: string) => {
    await loadPreset(presetName);
  }, [loadPreset]);

  const presetExists = useCallback((presetName: string) => {
    return BrandUtils.presetExists(presetName);
  }, []);

  return {
    availablePresets,
    loadBrandPreset,
    presetExists,
  };
}

/**
 * Hook for brand validation
 */
export function useBrandValidation() {
  const { config } = useDynamicBrand();
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({
    isValid: true,
    errors: [],
  });

  useEffect(() => {
    const validationResult = logoManager.validateConfig(config);
    setValidation(validationResult);
  }, [config]);

  return validation;
}

/**
 * Hook for brand import/export
 */
export function useBrandImportExport() {
  const { exportConfig, importConfig } = useDynamicBrand();

  const exportBrandConfig = useCallback(() => {
    return exportConfig();
  }, [exportConfig]);

  const importBrandConfig = useCallback((configJson: string) => {
    return importConfig(configJson);
  }, [importConfig]);

  return {
    exportBrandConfig,
    importBrandConfig,
  };
}
