/**
 * @fileoverview Tenant Branding Configuration System Test
 * @module tests/branding/tenant-branding.test.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TenantBrandingService } from '@/lib/branding/tenant-service';
import {
  TenantBrandingConfig,
  TenantBrandingPreset,
  TenantBrandingAsset,
  CreateTenantBrandingConfigRequest,
  UpdateTenantBrandingConfigRequest,
  BrandPresetLoadRequest,
  BrandAssetUploadRequest,
  DEFAULT_BRAND_COLORS,
  DEFAULT_TYPOGRAPHY_CONFIG,
} from '@/lib/branding/tenant-types';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
      })),
      order: jest.fn(() => ({
        limit: jest.fn(),
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  })),
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Tenant Branding Configuration System', () => {
  let brandingService: TenantBrandingService;
  const mockTenantId = 'test-tenant-id';

  beforeEach(() => {
    brandingService = new TenantBrandingService('https://test.supabase.co', 'test-key');
    jest.clearAllMocks();
  });

  describe('TenantBrandingService', () => {
    it('should initialize with Supabase client', () => {
      expect(brandingService).toBeInstanceOf(TenantBrandingService);
    });

    it('should get tenant branding configuration', async () => {
      const mockConfig = {
        id: 'config-id',
        tenant_id: mockTenantId,
        organization_name: 'Test Organization',
        app_name: 'Test App',
        full_brand: 'Test Organization — Test App',
        short_brand: 'Test App',
        nav_brand: 'Test App',
        logo_src: '/test-logo.png',
        logo_alt: 'Test logo',
        logo_width: 28,
        logo_height: 28,
        logo_class_name: 'rounded-sm',
        logo_show_as_image: true,
        logo_initials: 'TO',
        logo_fallback_bg_color: 'from-blue-600 to-indigo-600',
        brand_colors: DEFAULT_BRAND_COLORS,
        typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
        preset_name: 'default',
        is_custom: false,
        validation_status: 'valid',
        validation_errors: [],
        validation_warnings: [],
        brand_description: 'Test brand',
        brand_tags: ['test'],
        brand_version: '1.0.0',
        created_at: '2025-09-09T00:00:00Z',
        updated_at: '2025-09-09T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockConfig,
              error: null,
            })),
          })),
        })),
      });

      const result = await brandingService.getTenantBrandingConfig(mockTenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationName).toBe('Test Organization');
      expect(result.data?.appName).toBe('Test App');
    });

    it('should handle missing configuration gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { code: 'PGRST116' },
            })),
          })),
        })),
      });

      const result = await brandingService.getTenantBrandingConfig(mockTenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationName).toBe('Your Organization');
    });

    it('should create tenant branding configuration', async () => {
      const createRequest: CreateTenantBrandingConfigRequest = {
        organizationName: 'New Organization',
        appName: 'New App',
        brandColors: {
          primary: '#ff0000',
          secondary: '#00ff00',
          accent: '#0000ff',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280',
        },
      };

      const mockCreatedConfig = {
        id: 'new-config-id',
        tenant_id: mockTenantId,
        organization_name: 'New Organization',
        app_name: 'New App',
        full_brand: 'New Organization — New App',
        short_brand: 'New App',
        nav_brand: 'New App',
        logo_src: null,
        logo_alt: 'Organization logo',
        logo_width: 28,
        logo_height: 28,
        logo_class_name: 'rounded-sm border border-gray-200',
        logo_show_as_image: true,
        logo_initials: 'CH',
        logo_fallback_bg_color: 'from-blue-600 to-indigo-600',
        brand_colors: createRequest.brandColors,
        typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
        preset_name: 'default',
        is_custom: false,
        validation_status: 'valid',
        validation_errors: [],
        validation_warnings: [],
        brand_description: null,
        brand_tags: [],
        brand_version: '1.0.0',
        created_at: '2025-09-09T00:00:00Z',
        updated_at: '2025-09-09T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockCreatedConfig,
              error: null,
            })),
          })),
        })),
      });

      const result = await brandingService.createTenantBrandingConfig(mockTenantId, createRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationName).toBe('New Organization');
      expect(result.data?.appName).toBe('New App');
    });

    it('should validate branding configuration', async () => {
      const invalidRequest: CreateTenantBrandingConfigRequest = {
        organizationName: '', // Invalid: empty
        appName: 'Valid App',
        brandColors: {
          primary: 'invalid-color', // Invalid: not hex
          secondary: '#00ff00',
          accent: '#0000ff',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280',
        },
      };

      const result = await brandingService.createTenantBrandingConfig(mockTenantId, invalidRequest);

      expect(result.success).toBe(false);
      expect(result.validationErrors).toBeDefined();
      expect(result.validationErrors?.length).toBeGreaterThan(0);
    });

    it('should update tenant branding configuration', async () => {
      const updateRequest: UpdateTenantBrandingConfigRequest = {
        organizationName: 'Updated Organization',
        brandColors: {
          primary: '#ff0000',
        },
      };

      const mockUpdatedConfig = {
        id: 'config-id',
        tenant_id: mockTenantId,
        organization_name: 'Updated Organization',
        app_name: 'Test App',
        full_brand: 'Updated Organization — Test App',
        short_brand: 'Test App',
        nav_brand: 'Test App',
        logo_src: null,
        logo_alt: 'Organization logo',
        logo_width: 28,
        logo_height: 28,
        logo_class_name: 'rounded-sm border border-gray-200',
        logo_show_as_image: true,
        logo_initials: 'CH',
        logo_fallback_bg_color: 'from-blue-600 to-indigo-600',
        brand_colors: {
          ...DEFAULT_BRAND_COLORS,
          primary: '#ff0000',
        },
        typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
        preset_name: 'default',
        is_custom: false,
        validation_status: 'valid',
        validation_errors: [],
        validation_warnings: [],
        brand_description: null,
        brand_tags: [],
        brand_version: '1.0.0',
        created_at: '2025-09-09T00:00:00Z',
        updated_at: '2025-09-09T00:00:00Z',
      };

      // Mock getTenantBrandingConfig for update
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'config-id',
                tenant_id: mockTenantId,
                organization_name: 'Test Organization',
                app_name: 'Test App',
                brand_colors: DEFAULT_BRAND_COLORS,
                typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
              },
              error: null,
            })),
          })),
        })),
      });

      // Mock update
      mockSupabase.from.mockReturnValueOnce({
        update: jest.fn(() => ({
          eq: jest.fn(() => ({
            select: jest.fn(() => ({
              single: jest.fn(() => ({
                data: mockUpdatedConfig,
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await brandingService.updateTenantBrandingConfig(mockTenantId, updateRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.organizationName).toBe('Updated Organization');
    });

    it('should load brand preset', async () => {
      const presetRequest: BrandPresetLoadRequest = {
        presetName: 'tech',
        customizations: {
          organizationName: 'Custom Tech Company',
        },
      };

      const mockPreset = {
        id: 'preset-id',
        preset_name: 'tech',
        display_name: 'Tech Green',
        description: 'Modern tech green theme',
        category: 'technology',
        organization_name: 'Tech Company',
        app_name: 'Tech App',
        logo_initials: 'TC',
        logo_fallback_bg_color: 'from-green-600 to-emerald-600',
        brand_colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#3b82f6',
          background: '#ffffff',
          surface: '#f0fdf4',
          text: '#064e3b',
          textSecondary: '#047857',
        },
        typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
        is_public: true,
        is_system: true,
        usage_count: 0,
        tags: ['tech', 'green'],
        created_at: '2025-09-09T00:00:00Z',
        updated_at: '2025-09-09T00:00:00Z',
      };

      // Mock getBrandPreset
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockPreset,
              error: null,
            })),
          })),
        })),
      });

      // Mock getTenantBrandingConfig (no existing config)
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: { code: 'PGRST116' },
            })),
          })),
        })),
      });

      // Mock createTenantBrandingConfig
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: {
                id: 'new-config-id',
                tenant_id: mockTenantId,
                organization_name: 'Custom Tech Company',
                app_name: 'Tech App',
                brand_colors: mockPreset.brand_colors,
                typography_config: mockPreset.typography_config,
              },
              error: null,
            })),
          })),
        })),
      });

      const result = await brandingService.loadBrandPreset(mockTenantId, presetRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should get brand presets', async () => {
      const mockPresets = [
        {
          id: 'preset-1',
          preset_name: 'default',
          display_name: 'Default Blue',
          description: 'Professional blue theme',
          category: 'professional',
          organization_name: 'Your Organization',
          app_name: 'Micro App',
          logo_initials: 'CH',
          logo_fallback_bg_color: 'from-blue-600 to-indigo-600',
          brand_colors: DEFAULT_BRAND_COLORS,
          typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
          is_public: true,
          is_system: true,
          usage_count: 10,
          tags: ['default', 'blue'],
          created_at: '2025-09-09T00:00:00Z',
          updated_at: '2025-09-09T00:00:00Z',
        },
        {
          id: 'preset-2',
          preset_name: 'tech',
          display_name: 'Tech Green',
          description: 'Modern tech green theme',
          category: 'technology',
          organization_name: 'Tech Company',
          app_name: 'Tech App',
          logo_initials: 'TC',
          logo_fallback_bg_color: 'from-green-600 to-emerald-600',
          brand_colors: {
            primary: '#10b981',
            secondary: '#059669',
            accent: '#3b82f6',
            background: '#ffffff',
            surface: '#f0fdf4',
            text: '#064e3b',
            textSecondary: '#047857',
          },
          typography_config: DEFAULT_TYPOGRAPHY_CONFIG,
          is_public: true,
          is_system: true,
          usage_count: 5,
          tags: ['tech', 'green'],
          created_at: '2025-09-09T00:00:00Z',
          updated_at: '2025-09-09T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              data: mockPresets,
              error: null,
            })),
          })),
        })),
      });

      const result = await brandingService.getBrandPresets();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].presetName).toBe('default');
      expect(result.data?.[1].presetName).toBe('tech');
    });

    it('should upload brand asset', async () => {
      const mockFile = new File(['test'], 'test-logo.png', { type: 'image/png' });
      const uploadRequest: BrandAssetUploadRequest = {
        assetType: 'logo',
        assetName: 'test-logo.png',
        assetFile: mockFile,
        altText: 'Test logo',
        description: 'A test logo',
        isPublic: false,
      };

      const mockAsset = {
        id: 'asset-id',
        tenant_id: mockTenantId,
        asset_type: 'logo',
        asset_name: 'test-logo.png',
        asset_url: `/assets/${mockTenantId}/test-logo.png`,
        asset_size: 1024,
        asset_mime_type: 'image/png',
        asset_dimensions: { width: 100, height: 100 },
        is_active: true,
        is_public: false,
        alt_text: 'Test logo',
        description: 'A test logo',
        created_at: '2025-09-09T00:00:00Z',
        updated_at: '2025-09-09T00:00:00Z',
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: mockAsset,
              error: null,
            })),
          })),
        })),
      });

      const result = await brandingService.uploadBrandAsset(mockTenantId, uploadRequest);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.assetName).toBe('test-logo.png');
      expect(result.data?.assetType).toBe('logo');
    });

    it('should get tenant branding assets', async () => {
      const mockAssets = [
        {
          id: 'asset-1',
          tenant_id: mockTenantId,
          asset_type: 'logo',
          asset_name: 'logo.png',
          asset_url: `/assets/${mockTenantId}/logo.png`,
          asset_size: 2048,
          asset_mime_type: 'image/png',
          asset_dimensions: { width: 200, height: 200 },
          is_active: true,
          is_public: false,
          alt_text: 'Company logo',
          description: 'Main company logo',
          created_at: '2025-09-09T00:00:00Z',
          updated_at: '2025-09-09T00:00:00Z',
        },
        {
          id: 'asset-2',
          tenant_id: mockTenantId,
          asset_type: 'favicon',
          asset_name: 'favicon.ico',
          asset_url: `/assets/${mockTenantId}/favicon.ico`,
          asset_size: 1024,
          asset_mime_type: 'image/x-icon',
          asset_dimensions: { width: 32, height: 32 },
          is_active: true,
          is_public: true,
          alt_text: 'Favicon',
          description: 'Site favicon',
          created_at: '2025-09-09T00:00:00Z',
          updated_at: '2025-09-09T00:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => ({
                data: mockAssets,
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await brandingService.getTenantBrandingAssets(mockTenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].assetType).toBe('logo');
      expect(result.data?.[1].assetType).toBe('favicon');
    });

    it('should get tenant branding history', async () => {
      const mockHistory = [
        {
          id: 'history-1',
          tenant_id: mockTenantId,
          branding_config_id: 'config-id',
          change_type: 'create',
          changed_fields: ['organization_name', 'app_name'],
          previous_values: null,
          new_values: {
            organization_name: 'Test Organization',
            app_name: 'Test App',
          },
          changed_by: mockTenantId,
          change_reason: 'Initial setup',
          change_source: 'user',
          created_at: '2025-09-09T00:00:00Z',
        },
        {
          id: 'history-2',
          tenant_id: mockTenantId,
          branding_config_id: 'config-id',
          change_type: 'update',
          changed_fields: ['brand_colors'],
          previous_values: {
            brand_colors: DEFAULT_BRAND_COLORS,
          },
          new_values: {
            brand_colors: {
              ...DEFAULT_BRAND_COLORS,
              primary: '#ff0000',
            },
          },
          changed_by: mockTenantId,
          change_reason: 'Brand color update',
          change_source: 'user',
          created_at: '2025-09-09T01:00:00Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: mockHistory,
                error: null,
              })),
            })),
          })),
        })),
      });

      const result = await brandingService.getTenantBrandingHistory(mockTenantId);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
      expect(result.data?.[0].changeType).toBe('create');
      expect(result.data?.[1].changeType).toBe('update');
    });
  });

  describe('Type Definitions', () => {
    it('should have correct default brand colors', () => {
      expect(DEFAULT_BRAND_COLORS.primary).toBe('#3b82f6');
      expect(DEFAULT_BRAND_COLORS.secondary).toBe('#c47d09');
      expect(DEFAULT_BRAND_COLORS.accent).toBe('#10b981');
      expect(DEFAULT_BRAND_COLORS.background).toBe('#ffffff');
      expect(DEFAULT_BRAND_COLORS.surface).toBe('#f8fafc');
      expect(DEFAULT_BRAND_COLORS.text).toBe('#1f2937');
      expect(DEFAULT_BRAND_COLORS.textSecondary).toBe('#6b7280');
    });

    it('should have correct default typography config', () => {
      expect(DEFAULT_TYPOGRAPHY_CONFIG.fontFamily).toBe('Inter');
      expect(DEFAULT_TYPOGRAPHY_CONFIG.fontWeights).toEqual([300, 400, 500, 600, 700]);
      expect(DEFAULT_TYPOGRAPHY_CONFIG.fontSizes.xs).toBe('0.75rem');
      expect(DEFAULT_TYPOGRAPHY_CONFIG.fontSizes.base).toBe('1rem');
      expect(DEFAULT_TYPOGRAPHY_CONFIG.fontSizes['4xl']).toBe('2.25rem');
    });
  });
});
