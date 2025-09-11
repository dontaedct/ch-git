/**
 * @fileoverview Tenant Branding Configuration Service
 * @module lib/branding/tenant-service
 * @author OSS Hero System
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import {
  TenantBrandingConfig,
  TenantBrandingPreset,
  TenantBrandingAsset,
  TenantBrandingHistory,
  CreateTenantBrandingConfigRequest,
  UpdateTenantBrandingConfigRequest,
  BrandValidationResult,
  BrandPresetLoadRequest,
  BrandAssetUploadRequest,
  BrandAssetUploadResponse,
  TenantBrandingConfigResponse,
  TenantBrandingPresetsResponse,
  TenantBrandingAssetsResponse,
  TenantBrandingHistoryResponse,
  DEFAULT_TENANT_BRANDING_CONFIG,
  ValidationError,
  ValidationWarning,
} from './tenant-types';

export class TenantBrandingService {
  private supabase;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get tenant branding configuration
   */
  async getTenantBrandingConfig(tenantId: string): Promise<TenantBrandingConfigResponse> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_branding_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No configuration found, return default
          return {
            success: true,
            data: {
              ...DEFAULT_TENANT_BRANDING_CONFIG,
              id: '',
              tenantId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };
        }
        return { success: false, error: error.message };
      }

      return { success: true, data: this.mapDbToTenantBrandingConfig(data) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Create tenant branding configuration
   */
  async createTenantBrandingConfig(
    tenantId: string,
    request: CreateTenantBrandingConfigRequest
  ): Promise<TenantBrandingConfigResponse> {
    try {
      // Validate the request
      const validation = this.validateBrandingConfig(request);
      if (!validation.isValid) {
        return {
          success: false,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
        };
      }

      const configData = {
        tenant_id: tenantId,
        organization_name: request.organizationName,
        app_name: request.appName,
        logo_src: request.logoSrc,
        logo_alt: request.logoAlt || DEFAULT_TENANT_BRANDING_CONFIG.logoAlt,
        logo_initials: request.logoInitials || DEFAULT_TENANT_BRANDING_CONFIG.logoInitials,
        logo_fallback_bg_color: request.logoFallbackBgColor || DEFAULT_TENANT_BRANDING_CONFIG.logoFallbackBgColor,
        brand_colors: {
          ...DEFAULT_TENANT_BRANDING_CONFIG.brandColors,
          ...request.brandColors,
        },
        typography_config: {
          ...DEFAULT_TENANT_BRANDING_CONFIG.typographyConfig,
          ...request.typographyConfig,
        },
        preset_name: request.presetName || 'default',
        brand_description: request.brandDescription,
        brand_tags: request.brandTags || [],
        validation_status: 'valid',
        validation_errors: [],
        validation_warnings: validation.warnings,
      };

      const { data, error } = await this.supabase
        .from('tenant_branding_config')
        .insert(configData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log the creation in history
      await this.logBrandingHistory(tenantId, data.id, 'create', [], {}, configData);

      return { success: true, data: this.mapDbToTenantBrandingConfig(data) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update tenant branding configuration
   */
  async updateTenantBrandingConfig(
    tenantId: string,
    request: UpdateTenantBrandingConfigRequest
  ): Promise<TenantBrandingConfigResponse> {
    try {
      // Get current configuration
      const currentConfig = await this.getTenantBrandingConfig(tenantId);
      if (!currentConfig.success || !currentConfig.data) {
        return { success: false, error: 'Configuration not found' };
      }

      // Validate the update
      const validation = this.validateBrandingConfig(request);
      if (!validation.isValid) {
        return {
          success: false,
          validationErrors: validation.errors,
          validationWarnings: validation.warnings,
        };
      }

      const updateData: any = {};
      const changedFields: string[] = [];

      // Track changes
      if (request.organizationName !== undefined) {
        updateData.organization_name = request.organizationName;
        changedFields.push('organization_name');
      }
      if (request.appName !== undefined) {
        updateData.app_name = request.appName;
        changedFields.push('app_name');
      }
      if (request.logoSrc !== undefined) {
        updateData.logo_src = request.logoSrc;
        changedFields.push('logo_src');
      }
      if (request.logoAlt !== undefined) {
        updateData.logo_alt = request.logoAlt;
        changedFields.push('logo_alt');
      }
      if (request.logoInitials !== undefined) {
        updateData.logo_initials = request.logoInitials;
        changedFields.push('logo_initials');
      }
      if (request.logoFallbackBgColor !== undefined) {
        updateData.logo_fallback_bg_color = request.logoFallbackBgColor;
        changedFields.push('logo_fallback_bg_color');
      }
      if (request.brandColors !== undefined) {
        updateData.brand_colors = {
          ...currentConfig.data.brandColors,
          ...request.brandColors,
        };
        changedFields.push('brand_colors');
      }
      if (request.typographyConfig !== undefined) {
        updateData.typography_config = {
          ...currentConfig.data.typographyConfig,
          ...request.typographyConfig,
        };
        changedFields.push('typography_config');
      }
      if (request.presetName !== undefined) {
        updateData.preset_name = request.presetName;
        changedFields.push('preset_name');
      }
      if (request.brandDescription !== undefined) {
        updateData.brand_description = request.brandDescription;
        changedFields.push('brand_description');
      }
      if (request.brandTags !== undefined) {
        updateData.brand_tags = request.brandTags;
        changedFields.push('brand_tags');
      }

      updateData.validation_status = 'valid';
      updateData.validation_errors = [];
      updateData.validation_warnings = validation.warnings;

      const { data, error } = await this.supabase
        .from('tenant_branding_config')
        .update(updateData)
        .eq('tenant_id', tenantId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log the update in history
      await this.logBrandingHistory(
        tenantId,
        data.id,
        'update',
        changedFields,
        this.mapTenantBrandingConfigToDb(currentConfig.data),
        updateData
      );

      return { success: true, data: this.mapDbToTenantBrandingConfig(data) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Load brand preset
   */
  async loadBrandPreset(
    tenantId: string,
    request: BrandPresetLoadRequest
  ): Promise<TenantBrandingConfigResponse> {
    try {
      // Get preset
      const preset = await this.getBrandPreset(request.presetName);
      if (!preset.success || !preset.data) {
        return { success: false, error: 'Preset not found' };
      }

      // Apply preset with customizations
      const configRequest: CreateTenantBrandingConfigRequest = {
        organizationName: preset.data.organizationName,
        appName: preset.data.appName,
        logoInitials: preset.data.logoInitials,
        logoFallbackBgColor: preset.data.logoFallbackBgColor,
        brandColors: preset.data.brandColors,
        typographyConfig: preset.data.typographyConfig,
        presetName: preset.data.presetName,
        ...request.customizations,
      };

      // Check if configuration exists
      const existingConfig = await this.getTenantBrandingConfig(tenantId);
      if (existingConfig.success && existingConfig.data) {
        // Update existing configuration
        return this.updateTenantBrandingConfig(tenantId, configRequest);
      } else {
        // Create new configuration
        return this.createTenantBrandingConfig(tenantId, configRequest);
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get available brand presets
   */
  async getBrandPresets(): Promise<TenantBrandingPresetsResponse> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_branding_presets')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data.map(this.mapDbToTenantBrandingPreset) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get specific brand preset
   */
  async getBrandPreset(presetName: string): Promise<{ success: boolean; data?: TenantBrandingPreset; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_branding_presets')
        .select('*')
        .eq('preset_name', presetName)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: this.mapDbToTenantBrandingPreset(data) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Upload brand asset
   */
  async uploadBrandAsset(
    tenantId: string,
    request: BrandAssetUploadRequest
  ): Promise<BrandAssetUploadResponse> {
    try {
      // In a real implementation, you would upload the file to a storage service
      // For now, we'll create a mock URL
      const assetUrl = `/assets/${tenantId}/${request.assetName}`;

      const assetData = {
        tenant_id: tenantId,
        asset_type: request.assetType,
        asset_name: request.assetName,
        asset_url: assetUrl,
        asset_size: request.assetFile.size,
        asset_mime_type: request.assetFile.type,
        is_active: true,
        is_public: request.isPublic || false,
        alt_text: request.altText,
        description: request.description,
      };

      const { data, error } = await this.supabase
        .from('tenant_branding_assets')
        .insert(assetData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log the asset upload in history
      await this.logBrandingHistory(
        tenantId,
        '', // No config ID for asset uploads
        'asset_upload',
        ['asset_name', 'asset_url'],
        {},
        assetData
      );

      return { success: true, data: this.mapDbToTenantBrandingAsset(data) };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get tenant branding assets
   */
  async getTenantBrandingAssets(tenantId: string): Promise<TenantBrandingAssetsResponse> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_branding_assets')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data.map(this.mapDbToTenantBrandingAsset) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Get tenant branding history
   */
  async getTenantBrandingHistory(tenantId: string): Promise<TenantBrandingHistoryResponse> {
    try {
      const { data, error } = await this.supabase
        .from('tenant_branding_history')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: data.map(this.mapDbToTenantBrandingHistory) 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Validate branding configuration
   */
  private validateBrandingConfig(config: any): BrandValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate organization name
    if (config.organizationName !== undefined) {
      if (!config.organizationName || config.organizationName.trim().length === 0) {
        errors.push({ field: 'organizationName', message: 'Organization name is required' });
      } else if (config.organizationName.length > 100) {
        errors.push({ field: 'organizationName', message: 'Organization name must be 100 characters or less' });
      }
    }

    // Validate app name
    if (config.appName !== undefined) {
      if (!config.appName || config.appName.trim().length === 0) {
        errors.push({ field: 'appName', message: 'App name is required' });
      } else if (config.appName.length > 50) {
        errors.push({ field: 'appName', message: 'App name must be 50 characters or less' });
      }
    }

    // Validate logo initials
    if (config.logoInitials !== undefined) {
      if (config.logoInitials && config.logoInitials.length > 3) {
        errors.push({ field: 'logoInitials', message: 'Logo initials must be 3 characters or less' });
      }
    }

    // Validate brand colors
    if (config.brandColors !== undefined) {
      const colorRegex = /^#[0-9A-Fa-f]{6}$/;
      for (const [key, value] of Object.entries(config.brandColors)) {
        if (typeof value === 'string' && !colorRegex.test(value)) {
          errors.push({ 
            field: `brandColors.${key}`, 
            message: 'Invalid color format. Use hex format (#RRGGBB)' 
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Log branding history
   */
  private async logBrandingHistory(
    tenantId: string,
    configId: string,
    changeType: string,
    changedFields: string[],
    previousValues: any,
    newValues: any
  ): Promise<void> {
    try {
      await this.supabase
        .from('tenant_branding_history')
        .insert({
          tenant_id: tenantId,
          branding_config_id: configId,
          change_type: changeType,
          changed_fields: changedFields,
          previous_values: previousValues,
          new_values: newValues,
          change_source: 'user',
        });
    } catch (error) {
      console.error('Failed to log branding history:', error);
    }
  }

  /**
   * Map database record to TenantBrandingConfig
   */
  private mapDbToTenantBrandingConfig(data: any): TenantBrandingConfig {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      organizationName: data.organization_name,
      appName: data.app_name,
      fullBrand: data.full_brand,
      shortBrand: data.short_brand,
      navBrand: data.nav_brand,
      logoSrc: data.logo_src,
      logoAlt: data.logo_alt,
      logoWidth: data.logo_width,
      logoHeight: data.logo_height,
      logoClassName: data.logo_class_name,
      logoShowAsImage: data.logo_show_as_image,
      logoInitials: data.logo_initials,
      logoFallbackBgColor: data.logo_fallback_bg_color,
      brandColors: data.brand_colors,
      typographyConfig: data.typography_config,
      presetName: data.preset_name,
      isCustom: data.is_custom,
      validationStatus: data.validation_status,
      validationErrors: data.validation_errors || [],
      validationWarnings: data.validation_warnings || [],
      brandDescription: data.brand_description,
      brandTags: data.brand_tags || [],
      brandVersion: data.brand_version,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Map TenantBrandingConfig to database record
   */
  private mapTenantBrandingConfigToDb(config: TenantBrandingConfig): any {
    return {
      organization_name: config.organizationName,
      app_name: config.appName,
      logo_src: config.logoSrc,
      logo_alt: config.logoAlt,
      logo_width: config.logoWidth,
      logo_height: config.logoHeight,
      logo_class_name: config.logoClassName,
      logo_show_as_image: config.logoShowAsImage,
      logo_initials: config.logoInitials,
      logo_fallback_bg_color: config.logoFallbackBgColor,
      brand_colors: config.brandColors,
      typography_config: config.typographyConfig,
      preset_name: config.presetName,
      is_custom: config.isCustom,
      validation_status: config.validationStatus,
      validation_errors: config.validationErrors,
      validation_warnings: config.validationWarnings,
      brand_description: config.brandDescription,
      brand_tags: config.brandTags,
      brand_version: config.brandVersion,
    };
  }

  /**
   * Map database record to TenantBrandingPreset
   */
  private mapDbToTenantBrandingPreset(data: any): TenantBrandingPreset {
    return {
      id: data.id,
      presetName: data.preset_name,
      displayName: data.display_name,
      description: data.description,
      category: data.category,
      organizationName: data.organization_name,
      appName: data.app_name,
      logoInitials: data.logo_initials,
      logoFallbackBgColor: data.logo_fallback_bg_color,
      brandColors: data.brand_colors,
      typographyConfig: data.typography_config,
      isPublic: data.is_public,
      isSystem: data.is_system,
      usageCount: data.usage_count,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Map database record to TenantBrandingAsset
   */
  private mapDbToTenantBrandingAsset(data: any): TenantBrandingAsset {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      assetType: data.asset_type,
      assetName: data.asset_name,
      assetUrl: data.asset_url,
      assetSize: data.asset_size,
      assetMimeType: data.asset_mime_type,
      assetDimensions: data.asset_dimensions,
      isActive: data.is_active,
      isPublic: data.is_public,
      altText: data.alt_text,
      description: data.description,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Map database record to TenantBrandingHistory
   */
  private mapDbToTenantBrandingHistory(data: any): TenantBrandingHistory {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      brandingConfigId: data.branding_config_id,
      changeType: data.change_type,
      changedFields: data.changed_fields || [],
      previousValues: data.previous_values,
      newValues: data.new_values,
      changedBy: data.changed_by,
      changeReason: data.change_reason,
      changeSource: data.change_source,
      createdAt: new Date(data.created_at),
    };
  }
}
