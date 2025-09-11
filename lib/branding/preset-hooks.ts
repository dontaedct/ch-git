/**
 * @fileoverview HT-011.1.5: Brand Preset System React Hooks
 * @module lib/branding/preset-hooks
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.5 - Implement Brand Preset System
 * Focus: Create React hooks for brand preset management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BrandPreset, 
  PresetCustomization, 
  brandPresetManager,
  BrandPresetUtils 
} from './preset-manager';
import { DynamicBrandConfig } from './logo-manager';

/**
 * Hook for managing brand presets
 */
export function useBrandPresets() {
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const availablePresets = brandPresetManager.getAvailablePresets();
      setPresets(availablePresets);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load presets');
      setLoading(false);
    }
  }, []);

  const refreshPresets = useCallback(() => {
    try {
      const availablePresets = brandPresetManager.getAvailablePresets();
      setPresets(availablePresets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh presets');
    }
  }, []);

  const getPreset = useCallback((presetId: string) => {
    return brandPresetManager.getPreset(presetId);
  }, []);

  const getPresetsByIndustry = useCallback((industry: string) => {
    return brandPresetManager.getPresetsByIndustry(industry);
  }, []);

  const searchPresets = useCallback((query: string) => {
    return brandPresetManager.searchPresets(query);
  }, []);

  const getRecommendations = useCallback((industry: string, limit?: number) => {
    return brandPresetManager.getRecommendations(industry, limit);
  }, []);

  const getPresetStats = useCallback(() => {
    return brandPresetManager.getPresetStats();
  }, []);

  return {
    presets,
    loading,
    error,
    refreshPresets,
    getPreset,
    getPresetsByIndustry,
    searchPresets,
    getRecommendations,
    getPresetStats
  };
}

/**
 * Hook for loading and applying brand presets
 */
export function useBrandPresetLoader() {
  const [currentPreset, setCurrentPreset] = useState<BrandPreset | null>(null);
  const [currentConfig, setCurrentConfig] = useState<DynamicBrandConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPreset = useCallback(async (
    presetId: string, 
    customizations?: PresetCustomization
  ) => {
    setLoading(true);
    setError(null);

    try {
      const preset = brandPresetManager.getPreset(presetId);
      if (!preset) {
        throw new Error(`Preset '${presetId}' not found`);
      }

      const config = brandPresetManager.loadPreset(presetId, customizations);
      if (!config) {
        throw new Error('Failed to load preset configuration');
      }

      setCurrentPreset(preset);
      setCurrentConfig(config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preset');
    } finally {
      setLoading(false);
    }
  }, []);

  const applyCustomizations = useCallback((customizations: PresetCustomization) => {
    if (!currentPreset) return;

    try {
      const config = brandPresetManager.loadPreset(currentPreset.id, customizations);
      if (config) {
        setCurrentConfig(config);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply customizations');
    }
  }, [currentPreset]);

  const resetPreset = useCallback(() => {
    setCurrentPreset(null);
    setCurrentConfig(null);
    setError(null);
  }, []);

  return {
    currentPreset,
    currentConfig,
    loading,
    error,
    loadPreset,
    applyCustomizations,
    resetPreset
  };
}

/**
 * Hook for creating and managing custom presets
 */
export function useCustomPresetManager() {
  const [customPresets, setCustomPresets] = useState<BrandPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const presets = brandPresetManager.getAvailablePresets();
    const custom = presets.filter(preset => !preset.metadata.isSystem);
    setCustomPresets(custom);
  }, []);

  const createPreset = useCallback(async (presetData: Omit<BrandPreset, 'id' | 'metadata'>) => {
    setLoading(true);
    setError(null);

    try {
      const validation = BrandPresetUtils.validatePreset(presetData as BrandPreset);
      if (!validation.isValid) {
        throw new Error(`Invalid preset: ${validation.errors.join(', ')}`);
      }

      const newPreset = brandPresetManager.createCustomPreset(presetData);
      setCustomPresets(prev => [...prev, newPreset]);
      return newPreset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create preset');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreset = useCallback(async (presetId: string, updates: Partial<BrandPreset>) => {
    setLoading(true);
    setError(null);

    try {
      const success = brandPresetManager.updatePreset(presetId, updates);
      if (!success) {
        throw new Error('Failed to update preset');
      }

      setCustomPresets(prev => 
        prev.map(preset => 
          preset.id === presetId 
            ? { ...preset, ...updates, metadata: { ...preset.metadata, updatedAt: new Date() } }
            : preset
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preset');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePreset = useCallback(async (presetId: string) => {
    setLoading(true);
    setError(null);

    try {
      const success = brandPresetManager.deletePreset(presetId);
      if (!success) {
        throw new Error('Failed to delete preset');
      }

      setCustomPresets(prev => prev.filter(preset => preset.id !== presetId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete preset');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportPreset = useCallback((presetId: string) => {
    try {
      return brandPresetManager.exportPreset(presetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export preset');
      return null;
    }
  }, []);

  const importPreset = useCallback(async (presetJson: string) => {
    setLoading(true);
    setError(null);

    try {
      const importedPreset = brandPresetManager.importPreset(presetJson);
      if (!importedPreset) {
        throw new Error('Failed to import preset');
      }

      setCustomPresets(prev => [...prev, importedPreset]);
      return importedPreset;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import preset');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    customPresets,
    loading,
    error,
    createPreset,
    updatePreset,
    deletePreset,
    exportPreset,
    importPreset
  };
}

/**
 * Hook for preset search and filtering
 */
export function usePresetSearch() {
  const [query, setQuery] = useState('');
  const [industry, setIndustry] = useState<string>('');
  const [results, setResults] = useState<BrandPreset[]>([]);
  const [loading, setLoading] = useState(false);

  const { presets } = useBrandPresets();

  const search = useCallback(async (searchQuery: string, industryFilter?: string) => {
    setLoading(true);
    
    try {
      let filteredPresets = presets;

      if (searchQuery.trim()) {
        filteredPresets = brandPresetManager.searchPresets(searchQuery);
      }

      if (industryFilter) {
        filteredPresets = filteredPresets.filter(preset => 
          preset.industry.toLowerCase() === industryFilter.toLowerCase()
        );
      }

      setResults(filteredPresets);
    } catch (err) {
      console.error('Search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [presets]);

  useEffect(() => {
    if (query || industry) {
      search(query, industry);
    } else {
      setResults(presets);
    }
  }, [query, industry, search, presets]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setIndustry('');
    setResults(presets);
  }, [presets]);

  const industryCategories = useMemo(() => {
    return BrandPresetUtils.getIndustryCategories();
  }, []);

  return {
    query,
    setQuery,
    industry,
    setIndustry,
    results,
    loading,
    search,
    clearSearch,
    industryCategories
  };
}

/**
 * Hook for preset recommendations
 */
export function usePresetRecommendations(industry?: string) {
  const [recommendations, setRecommendations] = useState<BrandPreset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRecommendations } = useBrandPresets();

  const loadRecommendations = useCallback(async (targetIndustry?: string, limit?: number) => {
    setLoading(true);
    setError(null);

    try {
      const recs = getRecommendations(targetIndustry || 'General', limit);
      setRecommendations(recs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [getRecommendations]);

  useEffect(() => {
    if (industry) {
      loadRecommendations(industry);
    }
  }, [industry, loadRecommendations]);

  return {
    recommendations,
    loading,
    error,
    loadRecommendations
  };
}

/**
 * Hook for preset preview and validation
 */
export function usePresetPreview() {
  const [preview, setPreview] = useState<{
    colors: string[];
    logo: string;
    name: string;
    industry: string;
  } | null>(null);
  const [validation, setValidation] = useState<{
    isValid: boolean;
    errors: string[];
  } | null>(null);

  const generatePreview = useCallback((preset: BrandPreset) => {
    try {
      const previewData = BrandPresetUtils.generatePreview(preset);
      setPreview(previewData);
    } catch (err) {
      console.error('Failed to generate preview:', err);
    }
  }, []);

  const validatePreset = useCallback((preset: BrandPreset) => {
    try {
      const validationResult = BrandPresetUtils.validatePreset(preset);
      setValidation(validationResult);
      return validationResult;
    } catch (err) {
      console.error('Failed to validate preset:', err);
      return { isValid: false, errors: ['Validation failed'] };
    }
  }, []);

  const clearPreview = useCallback(() => {
    setPreview(null);
    setValidation(null);
  }, []);

  return {
    preview,
    validation,
    generatePreview,
    validatePreset,
    clearPreview
  };
}

/**
 * Hook for comprehensive brand preset management
 */
export function useBrandPresetSystem() {
  const presets = useBrandPresets();
  const loader = useBrandPresetLoader();
  const customManager = useCustomPresetManager();
  const search = usePresetSearch();
  const recommendations = usePresetRecommendations();
  const preview = usePresetPreview();

  return {
    // Preset management
    presets: presets.presets,
    loading: presets.loading || loader.loading || customManager.loading,
    error: presets.error || loader.error || customManager.error,
    
    // Current preset
    currentPreset: loader.currentPreset,
    currentConfig: loader.currentConfig,
    
    // Preset operations
    loadPreset: loader.loadPreset,
    applyCustomizations: loader.applyCustomizations,
    resetPreset: loader.resetPreset,
    
    // Custom preset management
    customPresets: customManager.customPresets,
    createPreset: customManager.createPreset,
    updatePreset: customManager.updatePreset,
    deletePreset: customManager.deletePreset,
    exportPreset: customManager.exportPreset,
    importPreset: customManager.importPreset,
    
    // Search and filtering
    searchQuery: search.query,
    setSearchQuery: search.setQuery,
    searchIndustry: search.industry,
    setSearchIndustry: search.setIndustry,
    searchResults: search.results,
    searchLoading: search.loading,
    clearSearch: search.clearSearch,
    industryCategories: search.industryCategories,
    
    // Recommendations
    recommendations: recommendations.recommendations,
    recommendationsLoading: recommendations.loading,
    loadRecommendations: recommendations.loadRecommendations,
    
    // Preview and validation
    preview: preview.preview,
    validation: preview.validation,
    generatePreview: preview.generatePreview,
    validatePreset: preview.validatePreset,
    clearPreview: preview.clearPreview,
    
    // Utility functions
    getPreset: presets.getPreset,
    getPresetsByIndustry: presets.getPresetsByIndustry,
    getPresetStats: presets.getPresetStats,
    refreshPresets: presets.refreshPresets
  };
}
