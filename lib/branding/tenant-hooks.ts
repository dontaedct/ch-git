/**
 * @fileoverview Tenant Branding React Hooks
 * @module lib/branding/tenant-hooks
 * @author OSS Hero System
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  TenantBrandingConfig,
  TenantBrandingPreset,
  TenantBrandingAsset,
  TenantBrandingHistory,
  CreateTenantBrandingConfigRequest,
  UpdateTenantBrandingConfigRequest,
  BrandPresetLoadRequest,
  BrandAssetUploadRequest,
  TenantBrandingConfigResponse,
  TenantBrandingPresetsResponse,
  TenantBrandingAssetsResponse,
  TenantBrandingHistoryResponse,
  BrandAssetUploadResponse,
} from './tenant-types';

/**
 * Hook for managing tenant branding configuration
 */
export function useTenantBrandingConfig(tenantId: string) {
  const [config, setConfig] = useState<TenantBrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/branding?tenantId=${tenantId}`);
      const result: TenantBrandingConfigResponse = await response.json();
      
      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        setError(result.error || 'Failed to fetch branding config');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const createConfig = useCallback(async (request: CreateTenantBrandingConfigRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, ...request }),
      });
      
      const result: TenantBrandingConfigResponse = await response.json();
      
      if (result.success && result.data) {
        setConfig(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to create branding config');
        return { success: false, error: result.error, validationErrors: result.validationErrors };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const updateConfig = useCallback(async (request: UpdateTenantBrandingConfigRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, ...request }),
      });
      
      const result: TenantBrandingConfigResponse = await response.json();
      
      if (result.success && result.data) {
        setConfig(result.data);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to update branding config');
        return { success: false, error: result.error, validationErrors: result.validationErrors };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    isLoading,
    error,
    fetchConfig,
    createConfig,
    updateConfig,
  };
}

/**
 * Hook for managing brand presets
 */
export function useBrandPresets() {
  const [presets, setPresets] = useState<TenantBrandingPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/branding/presets');
      const result: TenantBrandingPresetsResponse = await response.json();
      
      if (result.success && result.data) {
        setPresets(result.data);
      } else {
        setError(result.error || 'Failed to fetch presets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPreset = useCallback(async (tenantId: string, request: BrandPresetLoadRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/branding/presets/${request.presetName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, customizations: request.customizations }),
      });
      
      const result: TenantBrandingConfigResponse = await response.json();
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to load preset');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPresets();
  }, [fetchPresets]);

  return {
    presets,
    isLoading,
    error,
    fetchPresets,
    loadPreset,
  };
}

/**
 * Hook for managing brand assets
 */
export function useBrandAssets(tenantId: string) {
  const [assets, setAssets] = useState<TenantBrandingAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/branding/assets?tenantId=${tenantId}`);
      const result: TenantBrandingAssetsResponse = await response.json();
      
      if (result.success && result.data) {
        setAssets(result.data);
      } else {
        setError(result.error || 'Failed to fetch assets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  const uploadAsset = useCallback(async (request: BrandAssetUploadRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('tenantId', tenantId);
      formData.append('assetType', request.assetType);
      formData.append('assetName', request.assetName);
      formData.append('assetFile', request.assetFile);
      if (request.altText) formData.append('altText', request.altText);
      if (request.description) formData.append('description', request.description);
      formData.append('isPublic', String(request.isPublic || false));

      const response = await fetch('/api/branding/assets', {
        method: 'POST',
        body: formData,
      });
      
      const result: BrandAssetUploadResponse = await response.json();
      
      if (result.success && result.data) {
        setAssets(prev => [result.data!, ...prev]);
        return { success: true, data: result.data };
      } else {
        setError(result.error || 'Failed to upload asset');
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    isLoading,
    error,
    fetchAssets,
    uploadAsset,
  };
}

/**
 * Hook for managing brand history
 */
export function useBrandHistory(tenantId: string) {
  const [history, setHistory] = useState<TenantBrandingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!tenantId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/branding/history?tenantId=${tenantId}`);
      const result: TenantBrandingHistoryResponse = await response.json();
      
      if (result.success && result.data) {
        setHistory(result.data);
      } else {
        setError(result.error || 'Failed to fetch history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    isLoading,
    error,
    fetchHistory,
  };
}

/**
 * Hook for comprehensive tenant branding management
 */
export function useTenantBranding(tenantId: string) {
  const brandingConfig = useTenantBrandingConfig(tenantId);
  const brandPresets = useBrandPresets();
  const brandAssets = useBrandAssets(tenantId);
  const brandHistory = useBrandHistory(tenantId);

  const isLoading = brandingConfig.isLoading || brandPresets.isLoading || brandAssets.isLoading || brandHistory.isLoading;
  const error = brandingConfig.error || brandPresets.error || brandAssets.error || brandHistory.error;

  return {
    // Configuration
    config: brandingConfig.config,
    createConfig: brandingConfig.createConfig,
    updateConfig: brandingConfig.updateConfig,
    
    // Presets
    presets: brandPresets.presets,
    loadPreset: brandPresets.loadPreset,
    
    // Assets
    assets: brandAssets.assets,
    uploadAsset: brandAssets.uploadAsset,
    
    // History
    history: brandHistory.history,
    
    // State
    isLoading,
    error,
    
    // Refresh functions
    refresh: () => {
      brandingConfig.fetchConfig();
      brandPresets.fetchPresets();
      brandAssets.fetchAssets();
      brandHistory.fetchHistory();
    },
  };
}
