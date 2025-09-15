/**
 * @fileoverview Brand Provider Component
 * @module components/branding/BrandProvider
 * @author OSS Hero System
 * @version 1.0.0
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { logoManager, DynamicBrandConfig, DEFAULT_BRAND_CONFIG } from '@/lib/branding/logo-manager';

interface BrandContextType {
  config: DynamicBrandConfig;
  isLoading: boolean;
  error: string | null;
  updateConfig: (config: Partial<DynamicBrandConfig>) => void;
  loadPreset: (presetName: string) => boolean;
  uploadLogo: (file: File) => Promise<string>;
  setCustomLogo: (src: string, alt?: string) => void;
  setBrandInitials: (initials: string, bgColor?: string) => void;
  updateBrandNames: (brandName: Partial<import('@/lib/branding/logo-manager').BrandNameConfig>) => void;
  exportConfig: () => string;
  importConfig: (configJson: string) => boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

interface BrandProviderProps {
  children: ReactNode;
  initialConfig?: DynamicBrandConfig;
}

export function BrandProvider({ children, initialConfig }: BrandProviderProps) {
  const [config, setConfig] = useState<DynamicBrandConfig>(
    initialConfig || DEFAULT_BRAND_CONFIG
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with the current config from logo manager
    setConfig(logoManager.getCurrentConfig());

    // Subscribe to changes
    const unsubscribe = logoManager.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    return unsubscribe;
  }, []);

  const updateConfig = (newConfig: Partial<DynamicBrandConfig>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      logoManager.updateConfig(newConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update brand configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPreset = (presetName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = logoManager.loadPreset(presetName);
      if (!success) {
        setError(`Preset '${presetName}' not found`);
        return false;
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preset');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const logoUrl = await logoManager.uploadLogo(file);
      logoManager.setCustomLogo(logoUrl);
      return logoUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const setCustomLogo = (src: string, alt?: string) => {
    logoManager.setCustomLogo(src, alt);
  };

  const setBrandInitials = (initials: string, bgColor?: string) => {
    logoManager.setBrandInitials(initials, bgColor);
  };

  const updateBrandNames = (brandName: Partial<import('@/lib/branding/logo-manager').BrandNameConfig>) => {
    logoManager.updateBrandNames(brandName);
  };

  const exportConfig = () => {
    return logoManager.exportConfig();
  };

  const importConfig = (configJson: string) => {
    return logoManager.importConfig(configJson);
  };

  const value: BrandContextType = {
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

  return (
    <BrandContext.Provider value={value}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrandContext() {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrandContext must be used within a BrandProvider');
  }
  return context;
}
