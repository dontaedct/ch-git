/**
 * @fileoverview Brand Management React Hook
 * @module hooks/use-brand-config
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.3: Brand Inheritance and Override System
 * React hook for managing brand configurations and inheritance.
 */

import { useState, useEffect, useCallback } from 'react';
import { BrandConfig, BrandPreset, BrandValidationResult } from '@/types/brand-config';

interface UseBrandConfigReturn {
  // Brand data
  brands: BrandConfig[];
  presets: BrandPreset[];
  currentBrand: BrandConfig | null;
  
  // Loading states
  isLoading: boolean;
  isApplying: boolean;
  isValidating: boolean;
  
  // Error states
  error: string | null;
  validationResult: BrandValidationResult | null;
  
  // Actions
  createBrand: (config: Omit<BrandConfig, 'id' | 'timestamps'>) => Promise<BrandConfig>;
  updateBrand: (id: string, updates: Partial<BrandConfig>) => Promise<BrandConfig>;
  deleteBrand: (id: string) => Promise<boolean>;
  applyBrand: (id: string) => Promise<boolean>;
  validateBrand: (id: string) => Promise<BrandValidationResult>;
  exportBrand: (id: string) => Promise<string>;
  importBrand: (config: string) => Promise<BrandConfig>;
  refreshBrands: () => Promise<void>;
  refreshPresets: () => Promise<void>;
}

/**
 * Hook for managing brand configurations
 */
export function useBrandConfig(): UseBrandConfigReturn {
  const [brands, setBrands] = useState<BrandConfig[]>([]);
  const [presets, setPresets] = useState<BrandPreset[]>([]);
  const [currentBrand, setCurrentBrand] = useState<BrandConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BrandValidationResult | null>(null);

  /**
   * Fetch brands from API
   */
  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/brand');
      const data = await response.json();
      
      if (data.success) {
        setBrands(data.data);
      } else {
        setError(data.error || 'Failed to fetch brands');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch brands');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch presets from API
   */
  const fetchPresets = useCallback(async () => {
    try {
      const response = await fetch('/api/brand/presets');
      const data = await response.json();
      
      if (data.success) {
        setPresets(data.data);
      } else {
        setError(data.error || 'Failed to fetch presets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch presets');
    }
  }, []);

  /**
   * Create new brand configuration
   */
  const createBrand = useCallback(async (config: Omit<BrandConfig, 'id' | 'timestamps'>): Promise<BrandConfig> => {
    try {
      setError(null);
      
      const response = await fetch('/api/brand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBrands(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to create brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBrands]);

  /**
   * Update brand configuration
   */
  const updateBrand = useCallback(async (id: string, updates: Partial<BrandConfig>): Promise<BrandConfig> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/brand/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBrands(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to update brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBrands]);

  /**
   * Delete brand configuration
   */
  const deleteBrand = useCallback(async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/brand/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBrands(); // Refresh the list
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBrands]);

  /**
   * Apply brand configuration
   */
  const applyBrand = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsApplying(true);
      setError(null);
      
      const response = await fetch(`/api/brand/${id}/apply`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Find and set the current brand
        const brand = brands.find(b => b.id === id);
        if (brand) {
          setCurrentBrand(brand);
        }
        return true;
      } else {
        throw new Error(data.error || 'Failed to apply brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsApplying(false);
    }
  }, [brands]);

  /**
   * Validate brand configuration
   */
  const validateBrand = useCallback(async (id: string): Promise<BrandValidationResult> => {
    try {
      setIsValidating(true);
      setError(null);
      
      const response = await fetch(`/api/brand/${id}/validate`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to validate brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Export brand configuration
   */
  const exportBrand = useCallback(async (id: string): Promise<string> => {
    try {
      setError(null);
      
      const response = await fetch(`/api/brand/${id}/export`);
      
      if (response.ok) {
        return await response.text();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to export brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Import brand configuration
   */
  const importBrand = useCallback(async (config: string): Promise<BrandConfig> => {
    try {
      setError(null);
      
      const response = await fetch('/api/brand/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBrands(); // Refresh the list
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to import brand');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to import brand';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchBrands]);

  /**
   * Refresh brands list
   */
  const refreshBrands = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  /**
   * Refresh presets list
   */
  const refreshPresets = useCallback(async () => {
    await fetchPresets();
  }, [fetchPresets]);

  // Load initial data
  useEffect(() => {
    fetchBrands();
    fetchPresets();
  }, [fetchBrands, fetchPresets]);

  // Get current applied brand from global state
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).__appliedBrand) {
      setCurrentBrand((window as any).__appliedBrand);
    }
  }, []);

  return {
    // Brand data
    brands,
    presets,
    currentBrand,
    
    // Loading states
    isLoading,
    isApplying,
    isValidating,
    
    // Error states
    error,
    validationResult,
    
    // Actions
    createBrand,
    updateBrand,
    deleteBrand,
    applyBrand,
    validateBrand,
    exportBrand,
    importBrand,
    refreshBrands,
    refreshPresets,
  };
}
