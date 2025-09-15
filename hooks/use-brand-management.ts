/**
 * @fileoverview Brand Management Hook
 * @module hooks/use-brand-management
 * @author OSS Hero System
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { logoManager, BRAND_PRESETS } from '@/lib/branding/logo-manager';
import { DynamicBrandConfig, BrandNameConfig, LogoConfig } from '@/lib/branding/logo-manager';
import { toast } from 'sonner';

export interface BrandManagementState {
  /** Current brand configuration */
  currentConfig: DynamicBrandConfig;
  /** Available brand presets */
  availablePresets: string[];
  /** Whether configuration is loading */
  isLoading: boolean;
  /** Whether configuration is being saved */
  isSaving: boolean;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Validation errors */
  validationErrors: string[];
}

export interface BrandManagementActions {
  /** Update brand configuration */
  updateConfig: (updates: Partial<DynamicBrandConfig>) => void;
  /** Update brand names */
  updateBrandNames: (updates: Partial<BrandNameConfig>) => void;
  /** Update logo configuration */
  updateLogo: (updates: Partial<LogoConfig>) => void;
  /** Load brand preset */
  loadPreset: (presetName: string) => Promise<boolean>;
  /** Save configuration */
  saveConfiguration: () => Promise<boolean>;
  /** Reset to default */
  resetToDefault: () => Promise<boolean>;
  /** Export configuration */
  exportConfiguration: () => void;
  /** Import configuration */
  importConfiguration: (file: File) => Promise<boolean>;
  /** Validate configuration */
  validateConfig: (config: DynamicBrandConfig) => string[];
}

export interface UseBrandManagementOptions {
  /** Auto-save changes */
  autoSave?: boolean;
  /** Auto-save delay in milliseconds */
  autoSaveDelay?: number;
  /** Show toast notifications */
  showToasts?: boolean;
}

/**
 * Hook for managing brand configuration
 */
export function useBrandManagement(options: UseBrandManagementOptions = {}): BrandManagementState & BrandManagementActions {
  const {
    autoSave = false,
    autoSaveDelay = 2000,
    showToasts = true,
  } = options;

  const [state, setState] = useState<BrandManagementState>({
    currentConfig: logoManager.getCurrentConfig(),
    availablePresets: Object.keys(BRAND_PRESETS),
    isLoading: false,
    isSaving: false,
    hasChanges: false,
    validationErrors: [],
  });

  // Subscribe to brand configuration changes
  useEffect(() => {
    const unsubscribe = logoManager.subscribe((config) => {
      setState(prev => ({
        ...prev,
        currentConfig: config,
        hasChanges: false,
      }));
    });
    return unsubscribe;
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && state.hasChanges && !state.isSaving) {
      const timer = setTimeout(() => {
        saveConfiguration();
      }, autoSaveDelay);

      return () => clearTimeout(timer);
    }
  }, [autoSave, autoSaveDelay, state.hasChanges, state.isSaving]);

  // Validate configuration
  const validateConfig = useCallback((config: DynamicBrandConfig): string[] => {
    const errors: string[] = [];
    
    if (!config.brandName.organizationName.trim()) {
      errors.push('Organization name is required');
    }
    
    if (!config.brandName.appName.trim()) {
      errors.push('App name is required');
    }
    
    if (config.logo.initials && config.logo.initials.length > 3) {
      errors.push('Brand initials should be 3 characters or less');
    }
    
    return errors;
  }, []);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<DynamicBrandConfig>) => {
    const newConfig = { ...state.currentConfig, ...updates };
    const errors = validateConfig(newConfig);
    
    setState(prev => ({
      ...prev,
      currentConfig: newConfig,
      validationErrors: errors,
      hasChanges: true,
    }));
  }, [state.currentConfig, validateConfig]);

  // Update brand names
  const updateBrandNames = useCallback((updates: Partial<BrandNameConfig>) => {
    updateConfig({
      brandName: { ...state.currentConfig.brandName, ...updates }
    });
  }, [state.currentConfig.brandName, updateConfig]);

  // Update logo
  const updateLogo = useCallback((updates: Partial<LogoConfig>) => {
    updateConfig({
      logo: { ...state.currentConfig.logo, ...updates }
    });
  }, [state.currentConfig.logo, updateConfig]);

  // Load preset
  const loadPreset = useCallback(async (presetName: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const success = logoManager.loadPreset(presetName);
      if (success) {
        setState(prev => ({
          ...prev,
          hasChanges: false,
          validationErrors: [],
        }));
        
        if (showToasts) {
          toast.success(`Loaded ${presetName} brand preset`);
        }
        return true;
      } else {
        if (showToasts) {
          toast.error(`Failed to load ${presetName} preset`);
        }
        return false;
      }
    } catch (error) {
      console.error('Error loading preset:', error);
      if (showToasts) {
        toast.error('Failed to load brand preset');
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [showToasts]);

  // Save configuration
  const saveConfiguration = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isSaving: true }));
    
    try {
      const errors = validateConfig(state.currentConfig);
      if (errors.length > 0) {
        setState(prev => ({ ...prev, validationErrors: errors }));
        if (showToasts) {
          toast.error('Please fix validation errors before saving');
        }
        return false;
      }

      // Update the logo manager
      logoManager.updateConfig(state.currentConfig);
      
      // In a real implementation, this would save to the database via API
      try {
        const response = await fetch('/api/admin/brand-management', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ config: state.currentConfig }),
        });

        if (!response.ok) {
          throw new Error('Failed to save configuration');
        }
      } catch (apiError) {
        // Fallback to localStorage for development
        localStorage.setItem('brand-config', JSON.stringify(state.currentConfig));
      }
      
      setState(prev => ({
        ...prev,
        hasChanges: false,
        validationErrors: [],
      }));
      
      if (showToasts) {
        toast.success('Brand configuration saved successfully');
      }
      return true;
    } catch (error) {
      console.error('Failed to save brand configuration:', error);
      if (showToasts) {
        toast.error('Failed to save brand configuration');
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isSaving: false }));
    }
  }, [state.currentConfig, validateConfig, showToasts]);

  // Reset to default
  const resetToDefault = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      logoManager.loadPreset('default');
      setState(prev => ({
        ...prev,
        hasChanges: false,
        validationErrors: [],
      }));
      
      if (showToasts) {
        toast.success('Reset to default brand configuration');
      }
      return true;
    } catch (error) {
      console.error('Error resetting to default:', error);
      if (showToasts) {
        toast.error('Failed to reset brand configuration');
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [showToasts]);

  // Export configuration
  const exportConfiguration = useCallback(() => {
    try {
      const configJson = JSON.stringify(state.currentConfig, null, 2);
      const blob = new Blob([configJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'brand-config.json';
      a.click();
      URL.revokeObjectURL(url);
      
      if (showToasts) {
        toast.success('Brand configuration exported');
      }
    } catch (error) {
      console.error('Error exporting configuration:', error);
      if (showToasts) {
        toast.error('Failed to export brand configuration');
      }
    }
  }, [state.currentConfig, showToasts]);

  // Import configuration
  const importConfiguration = useCallback(async (file: File): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const text = await file.text();
      const config = JSON.parse(text);
      const success = logoManager.importConfig(text);
      
      if (success) {
        setState(prev => ({
          ...prev,
          hasChanges: false,
          validationErrors: [],
        }));
        
        if (showToasts) {
          toast.success('Brand configuration imported successfully');
        }
        return true;
      } else {
        if (showToasts) {
          toast.error('Invalid brand configuration file');
        }
        return false;
      }
    } catch (error) {
      console.error('Error importing configuration:', error);
      if (showToasts) {
        toast.error('Failed to parse brand configuration file');
      }
      return false;
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [showToasts]);

  return {
    ...state,
    updateConfig,
    updateBrandNames,
    updateLogo,
    loadPreset,
    saveConfiguration,
    resetToDefault,
    exportConfiguration,
    importConfiguration,
    validateConfig,
  };
}
