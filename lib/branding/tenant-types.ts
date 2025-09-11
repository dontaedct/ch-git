/**
 * @fileoverview Tenant Branding Configuration Types
 * @module lib/branding/tenant-types
 * @author OSS Hero System
 * @version 1.0.0
 */

export interface TenantBrandingConfig {
  id: string;
  tenantId: string;
  
  // Brand Identity
  organizationName: string;
  appName: string;
  fullBrand: string;
  shortBrand: string;
  navBrand: string;
  
  // Logo Configuration
  logoSrc?: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  logoClassName: string;
  logoShowAsImage: boolean;
  logoInitials: string;
  logoFallbackBgColor: string;
  
  // Brand Colors
  brandColors: BrandColors;
  
  // Typography Configuration
  typographyConfig: TypographyConfig;
  
  // Brand Preset Information
  presetName: string;
  isCustom: boolean;
  
  // Brand Validation Status
  validationStatus: 'pending' | 'valid' | 'invalid' | 'warning';
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
  
  // Brand Configuration Metadata
  brandDescription?: string;
  brandTags: string[];
  brandVersion: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface TypographyConfig {
  fontFamily: string;
  fontWeights: number[];
  fontSizes: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

export interface TenantBrandingPreset {
  id: string;
  presetName: string;
  displayName: string;
  description?: string;
  category: string;
  
  // Preset Configuration
  organizationName: string;
  appName: string;
  logoInitials: string;
  logoFallbackBgColor: string;
  brandColors: BrandColors;
  typographyConfig: TypographyConfig;
  
  // Preset Metadata
  isPublic: boolean;
  isSystem: boolean;
  usageCount: number;
  tags: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBrandingAsset {
  id: string;
  tenantId: string;
  assetType: 'logo' | 'favicon' | 'background' | 'icon' | 'other';
  assetName: string;
  assetUrl: string;
  assetSize?: number;
  assetMimeType?: string;
  assetDimensions?: {
    width: number;
    height: number;
  };
  
  // Asset metadata
  isActive: boolean;
  isPublic: boolean;
  altText?: string;
  description?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantBrandingHistory {
  id: string;
  tenantId: string;
  brandingConfigId: string;
  
  // Change tracking
  changeType: 'create' | 'update' | 'delete' | 'preset_load' | 'asset_upload';
  changedFields: string[];
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  
  // Change metadata
  changedBy?: string;
  changeReason?: string;
  changeSource: 'user' | 'admin' | 'system' | 'preset';
  
  // Timestamps
  createdAt: Date;
}

export interface CreateTenantBrandingConfigRequest {
  organizationName: string;
  appName: string;
  logoSrc?: string;
  logoAlt?: string;
  logoInitials?: string;
  logoFallbackBgColor?: string;
  brandColors?: Partial<BrandColors>;
  typographyConfig?: Partial<TypographyConfig>;
  presetName?: string;
  brandDescription?: string;
  brandTags?: string[];
}

export interface UpdateTenantBrandingConfigRequest {
  organizationName?: string;
  appName?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoInitials?: string;
  logoFallbackBgColor?: string;
  brandColors?: Partial<BrandColors>;
  typographyConfig?: Partial<TypographyConfig>;
  presetName?: string;
  brandDescription?: string;
  brandTags?: string[];
}

export interface TenantBrandingConfigResponse {
  success: boolean;
  data?: TenantBrandingConfig;
  error?: string;
  validationErrors?: ValidationError[];
  validationWarnings?: ValidationWarning[];
}

export interface TenantBrandingPresetsResponse {
  success: boolean;
  data?: TenantBrandingPreset[];
  error?: string;
}

export interface TenantBrandingAssetsResponse {
  success: boolean;
  data?: TenantBrandingAsset[];
  error?: string;
}

export interface TenantBrandingHistoryResponse {
  success: boolean;
  data?: TenantBrandingHistory[];
  error?: string;
}

export interface BrandValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface BrandPresetLoadRequest {
  presetName: string;
  customizations?: Partial<CreateTenantBrandingConfigRequest>;
}

export interface BrandAssetUploadRequest {
  assetType: 'logo' | 'favicon' | 'background' | 'icon' | 'other';
  assetName: string;
  assetFile: File;
  altText?: string;
  description?: string;
  isPublic?: boolean;
}

export interface BrandAssetUploadResponse {
  success: boolean;
  data?: TenantBrandingAsset;
  error?: string;
}

// Default configurations
export const DEFAULT_BRAND_COLORS: BrandColors = {
  primary: '#3b82f6',
  secondary: '#c47d09',
  accent: '#10b981',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
};

export const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
  fontFamily: 'Inter',
  fontWeights: [300, 400, 500, 600, 700],
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
};

export const DEFAULT_TENANT_BRANDING_CONFIG: Omit<TenantBrandingConfig, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'> = {
  organizationName: 'Your Organization',
  appName: 'Micro App',
  fullBrand: 'Your Organization — Micro App',
  shortBrand: 'Micro App',
  navBrand: 'Micro App',
  logoAlt: 'Organization logo',
  logoWidth: 28,
  logoHeight: 28,
  logoClassName: 'rounded-sm border border-gray-200',
  logoShowAsImage: true,
  logoInitials: 'CH',
  logoFallbackBgColor: 'from-blue-600 to-indigo-600',
  brandColors: DEFAULT_BRAND_COLORS,
  typographyConfig: DEFAULT_TYPOGRAPHY_CONFIG,
  presetName: 'default',
  isCustom: false,
  validationStatus: 'pending',
  validationErrors: [],
  validationWarnings: [],
  brandTags: [],
  brandVersion: '1.0.0',
};
