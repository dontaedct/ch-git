/**
 * @fileoverview Brand Configuration API Tests
 * @module tests/api/brand-config-api.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * HT-011.2.5: Implement Brand Configuration API
 * Comprehensive test suite for brand configuration API endpoints.
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { BrandConfig, BrandPreset } from '@/types/brand-config';

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          single: jest.fn(),
        })),
        single: jest.fn(),
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
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

// Mock the admin check
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => mockSupabase),
}));

jest.mock('@/lib/flags/server', () => ({
  isAdmin: jest.fn(() => true),
}));

// Mock the brand config service
jest.mock('@/lib/config/brand-config-service', () => ({
  brandConfigService: {
    clearCache: jest.fn(),
    getEnhancedConfig: jest.fn(() => Promise.resolve({})),
  },
}));

describe('Brand Configuration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful authentication
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/brand', () => {
    it('should return list of brand configurations for admin users', async () => {
      const mockBrands = [
        {
          id: 'brand-1',
          organization_name: 'Test Organization',
          description: 'Test brand',
          preset_name: 'default',
          brand_colors: { primary: '#007AFF' },
          typography_config: { fontFamily: 'Arial' },
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockSupabase.from().select().eq().order().mockResolvedValue({
        data: mockBrands,
        error: null,
      });

      const { GET } = await import('@/app/api/brand/route');
      const request = new NextRequest('http://localhost:3000/api/brand?tenantId=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Test Organization');
    });

    it('should return 401 for unauthenticated users', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const { GET } = await import('@/app/api/brand/route');
      const request = new NextRequest('http://localhost:3000/api/brand');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin users', async () => {
      const { isAdmin } = await import('@/lib/flags/server');
      (isAdmin as jest.Mock).mockResolvedValue(false);

      const { GET } = await import('@/app/api/brand/route');
      const request = new NextRequest('http://localhost:3000/api/brand');
      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/brand', () => {
    it('should create new brand configuration', async () => {
      const newBrand = {
        id: 'new-brand-id',
        organization_name: 'New Organization',
        description: 'New brand description',
        preset_name: 'default',
        brand_colors: { primary: '#FF0000' },
        typography_config: { fontFamily: 'Helvetica' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: newBrand,
        error: null,
      });

      const { POST } = await import('@/app/api/brand/route');
      const request = new NextRequest('http://localhost:3000/api/brand', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Organization',
          description: 'New brand description',
          overrides: {
            colors: { primary: '#FF0000' },
            typography: { fontFamily: 'Helvetica' },
          },
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('New Organization');
    });

    it('should return 400 for missing required fields', async () => {
      const { POST } = await import('@/app/api/brand/route');
      const request = new NextRequest('http://localhost:3000/api/brand', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Missing name and overrides',
        }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/brand/[id]', () => {
    it('should return specific brand configuration', async () => {
      const mockBrand = {
        id: 'brand-1',
        organization_name: 'Test Organization',
        description: 'Test brand',
        preset_name: 'default',
        brand_colors: { primary: '#007AFF' },
        typography_config: { fontFamily: 'Arial' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockBrand,
        error: null,
      });

      const { GET } = await import('@/app/api/brand/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1');
      const response = await GET(request, { params: { id: 'brand-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('brand-1');
      expect(data.data.name).toBe('Test Organization');
    });

    it('should return 404 for non-existent brand', async () => {
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const { GET } = await import('@/app/api/brand/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/brand/non-existent');
      const response = await GET(request, { params: { id: 'non-existent' } });

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/brand/[id]', () => {
    it('should update brand configuration', async () => {
      const updatedBrand = {
        id: 'brand-1',
        organization_name: 'Updated Organization',
        description: 'Updated description',
        preset_name: 'default',
        brand_colors: { primary: '#00FF00' },
        typography_config: { fontFamily: 'Times' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T12:00:00Z',
      };

      // Mock brand existence check
      mockSupabase.from().select().eq().single().mockResolvedValueOnce({
        data: { id: 'brand-1' },
        error: null,
      });

      // Mock update operation
      mockSupabase.from().update().eq().select().single().mockResolvedValue({
        data: updatedBrand,
        error: null,
      });

      const { PUT } = await import('@/app/api/brand/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Organization',
          description: 'Updated description',
          overrides: {
            colors: { primary: '#00FF00' },
            typography: { fontFamily: 'Times' },
          },
        }),
      });
      const response = await PUT(request, { params: { id: 'brand-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Updated Organization');
    });
  });

  describe('DELETE /api/brand/[id]', () => {
    it('should delete brand configuration', async () => {
      // Mock brand existence check
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: { id: 'brand-1', organization_name: 'Test Organization' },
        error: null,
      });

      // Mock delete operation
      mockSupabase.from().delete().eq().mockResolvedValue({
        error: null,
      });

      const { DELETE } = await import('@/app/api/brand/[id]/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: 'brand-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Test Organization');
    });
  });

  describe('GET /api/brand/presets', () => {
    it('should return list of brand presets', async () => {
      const mockPresets = [
        {
          id: 'preset-1',
          name: 'Modern',
          description: 'Modern brand preset',
          base_config: { colors: { primary: '#007AFF' } },
          metadata: { style: 'modern' },
          category: 'template',
        },
      ];

      mockSupabase.from().select().order().mockResolvedValue({
        data: mockPresets,
        error: null,
      });

      const { GET } = await import('@/app/api/brand/presets/route');
      const request = new NextRequest('http://localhost:3000/api/brand/presets');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('Modern');
    });
  });

  describe('POST /api/brand/[id]/apply', () => {
    it('should apply brand configuration', async () => {
      const mockBrand = {
        id: 'brand-1',
        organization_name: 'Test Organization',
        description: 'Test brand',
        preset_name: 'default',
        brand_colors: { primary: '#007AFF' },
        typography_config: { fontFamily: 'Arial' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      // Mock brand fetch
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockBrand,
        error: null,
      });

      // Mock update operation
      mockSupabase.from().update().eq().mockResolvedValue({
        error: null,
      });

      const { POST } = await import('@/app/api/brand/[id]/apply/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1/apply', {
        method: 'POST',
        body: JSON.stringify({ tenantId: 'test' }),
      });
      const response = await POST(request, { params: { id: 'brand-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('Test Organization');
    });
  });

  describe('POST /api/brand/[id]/validate', () => {
    it('should validate brand configuration', async () => {
      const mockBrand = {
        id: 'brand-1',
        organization_name: 'Test Organization',
        app_name: 'Test App',
        logo_initials: 'TA',
        brand_colors: { primary: '#007AFF', secondary: '#00FF00' },
        typography_config: { fontFamily: 'Arial', fontWeights: [400, 700] },
        contact_email: 'test@example.com',
      };

      // Mock brand fetch
      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockBrand,
        error: null,
      });

      // Mock update operation
      mockSupabase.from().update().eq().mockResolvedValue({
        error: null,
      });

      const { POST } = await import('@/app/api/brand/[id]/validate/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1/validate', {
        method: 'POST',
      });
      const response = await POST(request, { params: { id: 'brand-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.valid).toBe(true);
      expect(data.data.errors).toHaveLength(0);
    });
  });

  describe('GET /api/brand/[id]/export', () => {
    it('should export brand configuration as JSON', async () => {
      const mockBrand = {
        id: 'brand-1',
        organization_name: 'Test Organization',
        description: 'Test brand',
        preset_name: 'default',
        brand_colors: { primary: '#007AFF' },
        typography_config: { fontFamily: 'Arial' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockBrand,
        error: null,
      });

      const { GET } = await import('@/app/api/brand/[id]/export/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1/export?format=json');
      const response = await GET(request, { params: { id: 'brand-1' } });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('Content-Disposition')).toContain('Test_Organization_brand_config.json');
    });

    it('should export brand configuration as YAML', async () => {
      const mockBrand = {
        id: 'brand-1',
        organization_name: 'Test Organization',
        description: 'Test brand',
        preset_name: 'default',
        brand_colors: { primary: '#007AFF' },
        typography_config: { fontFamily: 'Arial' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      mockSupabase.from().select().eq().single().mockResolvedValue({
        data: mockBrand,
        error: null,
      });

      const { GET } = await import('@/app/api/brand/[id]/export/route');
      const request = new NextRequest('http://localhost:3000/api/brand/brand-1/export?format=yaml');
      const response = await GET(request, { params: { id: 'brand-1' } });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/x-yaml');
      expect(response.headers.get('Content-Disposition')).toContain('Test_Organization_brand_config.yaml');
    });
  });

  describe('POST /api/brand/import', () => {
    it('should import brand configuration', async () => {
      const importConfig = {
        name: 'Imported Organization',
        description: 'Imported brand',
        overrides: {
          colors: { primary: '#FF0000' },
          typography: { fontFamily: 'Helvetica' },
        },
        metadata: { style: 'modern' },
      };

      const importedBrand = {
        id: 'imported-brand-id',
        organization_name: 'Imported Organization',
        description: 'Imported brand',
        preset_name: 'default',
        brand_colors: { primary: '#FF0000' },
        typography_config: { fontFamily: 'Helvetica' },
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      // Mock no existing brand
      mockSupabase.from().select().eq().eq().single().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      // Mock insert operation
      mockSupabase.from().insert().select().single().mockResolvedValue({
        data: importedBrand,
        error: null,
      });

      const { POST } = await import('@/app/api/brand/import/route');
      const request = new NextRequest('http://localhost:3000/api/brand/import', {
        method: 'POST',
        body: JSON.stringify({ config: importConfig }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.name).toBe('Imported Organization');
    });

    it('should return 409 for duplicate brand name', async () => {
      const importConfig = {
        name: 'Existing Organization',
        description: 'Existing brand',
        overrides: { colors: { primary: '#FF0000' } },
      };

      // Mock existing brand
      mockSupabase.from().select().eq().eq().single().mockResolvedValue({
        data: { id: 'existing-brand-id', organization_name: 'Existing Organization' },
        error: null,
      });

      const { POST } = await import('@/app/api/brand/import/route');
      const request = new NextRequest('http://localhost:3000/api/brand/import', {
        method: 'POST',
        body: JSON.stringify({ config: importConfig }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain('already exists');
    });

    it('should return 400 for invalid configuration format', async () => {
      const { POST } = await import('@/app/api/brand/import/route');
      const request = new NextRequest('http://localhost:3000/api/brand/import', {
        method: 'POST',
        body: JSON.stringify({ config: 'invalid json' }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });
});
