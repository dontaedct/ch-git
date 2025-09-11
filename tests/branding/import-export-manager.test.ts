/**
 * @fileoverview HT-011.1.7: Brand Import/Export System Test Suite
 * @module tests/branding/import-export-manager.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.7 - Implement Brand Import/Export System
 * Focus: Comprehensive test suite for brand import/export functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

// Using Jest testing framework
import { 
  BrandImportExportManager, 
  BrandExportData, 
  BrandImportOptions, 
  BrandExportOptions,
  BrandImportResult,
  BrandImportExportUtils
} from '@/lib/branding/import-export-manager';
import { DynamicBrandConfig } from '@/lib/branding/logo-manager';
import { BrandPreset } from '@/lib/branding/preset-manager';

describe('BrandImportExportManager', () => {
  let manager: BrandImportExportManager;
  let mockBrandConfig: DynamicBrandConfig;
  let mockBrandPreset: BrandPreset;

  beforeEach(() => {
    manager = new BrandImportExportManager();
    
    mockBrandConfig = {
      logo: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 28,
        height: 28,
        className: 'rounded-sm',
        showAsImage: true,
        initials: 'TL',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Organization',
        appName: 'Test App',
        fullBrand: 'Test Organization — Test App',
        shortBrand: 'Test App',
        navBrand: 'Test App'
      },
      isCustom: false,
      presetName: 'test'
    };

    mockBrandPreset = {
      id: 'test-preset',
      name: 'Test Preset',
      description: 'Test preset for testing',
      industry: 'Technology',
      palette: {
        name: 'Test Palette',
        primary: '#3b82f6',
        secondary: '#1e40af',
        description: 'Test color palette'
      },
      logo: {
        src: '/test-preset-logo.png',
        alt: 'Test Preset Logo',
        width: 28,
        height: 28,
        className: 'rounded-sm',
        showAsImage: true,
        initials: 'TP',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Preset Org',
        appName: 'Test Preset App',
        fullBrand: 'Test Preset Org — Test Preset App',
        shortBrand: 'Test Preset App',
        navBrand: 'Test Preset App'
      },
      typography: {
        fontFamily: 'Inter',
        fontWeights: [400, 500, 600, 700],
        displayName: 'Inter'
      },
      elements: {
        favicon: '/test-favicon.ico',
        ogImage: '/test-og.png'
      },
      metadata: {
        isSystem: false,
        isPublic: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test', 'technology']
      }
    };
  });

  describe('Brand Configuration Export', () => {
    it('should export brand configuration in JSON format', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig);
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.metadata.version).toBe('1.0.0');
      expect(parsed.metadata.exportType).toBe('brand-config');
      expect(parsed.brandConfig).toEqual(mockBrandConfig);
      expect(parsed.validation).toBeDefined();
    });

    it('should export brand configuration in YAML format', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig, { format: 'yaml' });
      
      expect(exportData).toContain('---');
      expect(exportData).toContain('version: 1.0.0');
      expect(exportData).toContain('exportType: brand-config');
    });

    it('should include assets when requested', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig, { 
        format: 'json',
        includeAssets: true 
      });
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.assets).toBeDefined();
    });

    it('should exclude validation when not requested', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig, { 
        format: 'json',
        includeValidation: false 
      });
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.validation).toBeUndefined();
    });

    it('should include custom metadata', async () => {
      const customMetadata = { description: 'Custom export', author: 'Test User' };
      const exportData = await manager.exportBrandConfig(mockBrandConfig, { 
        format: 'json',
        customMetadata 
      });
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.metadata.description).toBe('Custom export');
      expect(parsed.metadata.author).toBe('Test User');
    });
  });

  describe('Brand Preset Export', () => {
    it('should export brand preset in JSON format', async () => {
      const exportData = await manager.exportBrandPreset(mockBrandPreset);
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.metadata.version).toBe('1.0.0');
      expect(parsed.metadata.exportType).toBe('preset');
      // Note: Date objects get serialized to strings in JSON, so we check structure instead
      expect(parsed.preset).toMatchObject({
        id: mockBrandPreset.id,
        name: mockBrandPreset.name,
        industry: mockBrandPreset.industry
      });
      expect(parsed.validation).toBeDefined();
    });

    it('should export brand preset in YAML format', async () => {
      const exportData = await manager.exportBrandPreset(mockBrandPreset, { format: 'yaml' });
      
      expect(exportData).toContain('---');
      expect(exportData).toContain('version: 1.0.0');
      expect(exportData).toContain('exportType: preset');
    });

    it('should include preset assets when requested', async () => {
      const exportData = await manager.exportBrandPreset(mockBrandPreset, { 
        format: 'json',
        includeAssets: true 
      });
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.assets).toBeDefined();
      expect(parsed.assets?.favicon).toBe('/test-favicon.ico');
      expect(parsed.assets?.ogImage).toBe('/test-og.png');
    });
  });

  describe('Full Branding Export', () => {
    it('should export full branding system', async () => {
      const mockPalette = {
        name: 'Test Palette',
        primary: '#3b82f6',
        secondary: '#1e40af',
        description: 'Test color palette'
      };

      const exportData = await manager.exportFullBranding(mockBrandConfig, mockBrandPreset, mockPalette);
      const parsed = JSON.parse(exportData) as BrandExportData;

      expect(parsed.metadata.exportType).toBe('full-branding');
      expect(parsed.brandConfig).toEqual(mockBrandConfig);
      // Note: Date objects get serialized to strings in JSON, so we check structure instead
      expect(parsed.preset).toMatchObject({
        id: mockBrandPreset.id,
        name: mockBrandPreset.name,
        industry: mockBrandPreset.industry
      });
      expect(parsed.palette).toEqual(mockPalette);
    });
  });

  describe('Brand Configuration Import', () => {
    it('should import valid brand configuration', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig);
      const result = await manager.importBrandConfig(exportData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockBrandConfig);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate before importing when requested', async () => {
      const invalidConfig = { ...mockBrandConfig };
      invalidConfig.brandName.organizationName = ''; // Invalid: empty name
      
      const exportData = await manager.exportBrandConfig(invalidConfig);
      const result = await manager.importBrandConfig(exportData, { validate: true });

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Organization name is required');
    });

    it('should skip validation when not requested', async () => {
      const invalidConfig = { ...mockBrandConfig };
      invalidConfig.brandName.organizationName = ''; // Invalid: empty name
      
      const exportData = await manager.exportBrandConfig(invalidConfig);
      const result = await manager.importBrandConfig(exportData, { validate: false });

      expect(result.success).toBe(true);
    });

    it('should create backup when requested', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig);
      const result = await manager.importBrandConfig(exportData, { createBackup: true });

      expect(result.success).toBe(true);
      expect(result.backupCreated).toBe(true);
    });

    it('should handle invalid JSON format', async () => {
      const result = await manager.importBrandConfig('invalid json');

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid import data format');
    });

    it('should handle unsupported version', async () => {
      const exportData = await manager.exportBrandConfig(mockBrandConfig);
      const parsed = JSON.parse(exportData);
      parsed.metadata.version = '0.9.0'; // Unsupported version
      
      const result = await manager.importBrandConfig(JSON.stringify(parsed));

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Unsupported version: 0.9.0');
    });

    it('should handle missing brand configuration', async () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          exportType: 'brand-config'
        }
        // Missing brandConfig
      };

      const result = await manager.importBrandConfig(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No brand configuration found in import data');
    });
  });

  describe('Brand Preset Import', () => {
    it('should import valid brand preset', async () => {
      const exportData = await manager.exportBrandPreset(mockBrandPreset);
      const result = await manager.importBrandPreset(exportData);

      expect(result.success).toBe(true);
      // Note: Date objects get serialized to strings in JSON, so we check structure instead
      expect(result.data).toMatchObject({
        id: mockBrandPreset.id,
        name: mockBrandPreset.name,
        industry: mockBrandPreset.industry
      });
      expect(result.errors).toHaveLength(0);
    });

    it('should handle missing preset data', async () => {
      const invalidData = {
        metadata: {
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          exportType: 'preset'
        }
        // Missing preset
      };

      const result = await manager.importBrandPreset(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.errors).toContain('No brand preset found in import data');
    });
  });

  describe('Validation', () => {
    it('should validate brand configuration correctly', () => {
      const validation = (manager as any).validateBrandConfig(mockBrandConfig);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid brand configuration', () => {
      const invalidConfig = { ...mockBrandConfig };
      invalidConfig.brandName.organizationName = ''; // Invalid: empty name
      invalidConfig.logo.initials = 'TOOLONG'; // Invalid: too long

      const validation = (manager as any).validateBrandConfig(invalidConfig);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Organization name is required');
      expect(validation.errors).toContain('Brand initials should be 3 characters or less');
    });

    it('should validate brand preset correctly', () => {
      const validation = (manager as any).validateBrandPreset(mockBrandPreset);

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid brand preset', () => {
      const invalidPreset = { ...mockBrandPreset };
      invalidPreset.id = ''; // Invalid: empty ID
      invalidPreset.palette.primary = ''; // Invalid: empty primary color

      const validation = (manager as any).validateBrandPreset(invalidPreset);

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Preset ID is required');
      expect(validation.errors).toContain('Primary color is required');
    });
  });

  describe('Utility Functions', () => {
    it('should get supported formats', () => {
      const formats = manager.getSupportedFormats();
      expect(formats).toEqual(['json', 'yaml']);
    });

    it('should get supported versions', () => {
      const versions = manager.getSupportedVersions();
      expect(versions).toEqual(['1.0.0']);
    });

    it('should get current version', () => {
      const version = manager.getCurrentVersion();
      expect(version).toBe('1.0.0');
    });

    it('should validate color format', () => {
      const isValidColor = (manager as any).isValidColor;
      
      expect(isValidColor('#3b82f6')).toBe(true);
      expect(isValidColor('#fff')).toBe(true);
      expect(isValidColor('rgb(59, 130, 246)')).toBe(true);
      expect(isValidColor('hsl(217, 91%, 60%)')).toBe(true);
      expect(isValidColor('invalid')).toBe(false);
    });
  });
});

describe('BrandImportExportUtils', () => {
  describe('Filename Generation', () => {
    it('should generate filename for brand config', () => {
      const filename = BrandImportExportUtils.generateFilename('brand-config');
      expect(filename).toMatch(/^brand-brand-config-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('should generate filename for preset', () => {
      const filename = BrandImportExportUtils.generateFilename('preset', 'yaml');
      expect(filename).toMatch(/^brand-preset-\d{4}-\d{2}-\d{2}\.yaml$/);
    });

    it('should generate filename for full branding', () => {
      const filename = BrandImportExportUtils.generateFilename('full-branding');
      expect(filename).toMatch(/^brand-full-branding-\d{4}-\d{2}-\d{2}\.json$/);
    });
  });

  describe('File Type Validation', () => {
    it('should validate JSON files', () => {
      const mockFile = new File([''], 'test.json', { type: 'application/json' });
      expect(BrandImportExportUtils.validateFileType(mockFile)).toBe(true);
    });

    it('should validate YAML files', () => {
      const mockFile = new File([''], 'test.yaml', { type: 'text/yaml' });
      expect(BrandImportExportUtils.validateFileType(mockFile)).toBe(true);
    });

    it('should validate YML files', () => {
      const mockFile = new File([''], 'test.yml', { type: 'text/yaml' });
      expect(BrandImportExportUtils.validateFileType(mockFile)).toBe(true);
    });

    it('should reject invalid file types', () => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' });
      expect(BrandImportExportUtils.validateFileType(mockFile)).toBe(false);
    });
  });

  describe('File Reading', () => {
    it('should read file content', async () => {
      const content = '{"test": "data"}';
      const mockFile = new File([content], 'test.json', { type: 'application/json' });
      
      const result = await BrandImportExportUtils.readFile(mockFile);
      expect(result).toBe(content);
    });
  });
});

describe('Brand Import/Export Integration', () => {
  let manager: BrandImportExportManager;
  let mockBrandConfig: DynamicBrandConfig;
  let mockBrandPreset: BrandPreset;

  beforeEach(() => {
    manager = new BrandImportExportManager();
    
    mockBrandConfig = {
      logo: {
        src: '/test-logo.png',
        alt: 'Test Logo',
        width: 28,
        height: 28,
        className: 'rounded-sm',
        showAsImage: true,
        initials: 'TL',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Organization',
        appName: 'Test App',
        fullBrand: 'Test Organization — Test App',
        shortBrand: 'Test App',
        navBrand: 'Test App'
      },
      isCustom: false,
      presetName: 'test'
    };

    mockBrandPreset = {
      id: 'test-preset',
      name: 'Test Preset',
      description: 'Test preset for testing',
      industry: 'Technology',
      palette: {
        name: 'Test Palette',
        primary: '#3b82f6',
        secondary: '#1e40af',
        description: 'Test color palette'
      },
      logo: {
        src: '/test-preset-logo.png',
        alt: 'Test Preset Logo',
        width: 28,
        height: 28,
        className: 'rounded-sm',
        showAsImage: true,
        initials: 'TP',
        fallbackBgColor: 'from-blue-600 to-indigo-600'
      },
      brandName: {
        organizationName: 'Test Preset Org',
        appName: 'Test Preset App',
        fullBrand: 'Test Preset Org — Test Preset App',
        shortBrand: 'Test Preset App',
        navBrand: 'Test Preset App'
      },
      typography: {
        fontFamily: 'Inter',
        fontWeights: [400, 500, 600, 700],
        displayName: 'Inter'
      },
      elements: {
        favicon: '/test-favicon.ico',
        ogImage: '/test-og.png'
      },
      metadata: {
        isSystem: false,
        isPublic: true,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['test', 'technology']
      }
    };
  });

  it('should handle complete export-import cycle', async () => {
    // Export brand configuration
    const exportData = await manager.exportBrandConfig(mockBrandConfig);
    
    // Import brand configuration
    const result = await manager.importBrandConfig(exportData);
    
    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockBrandConfig);
  });

  it('should handle export-import cycle with custom options', async () => {
    // Export with custom options
    const exportData = await manager.exportBrandConfig(mockBrandConfig, {
      format: 'json', // Use JSON instead of YAML for this test
      includeAssets: true,
      includeValidation: true,
      customMetadata: { author: 'Test User' }
    });
    
    // Import with custom options
    const result = await manager.importBrandConfig(exportData, {
      validate: true,
      overwrite: false,
      createBackup: true
    });
    
    expect(result.success).toBe(true);
    expect(result.backupCreated).toBe(true);
  });

  it('should handle preset export-import cycle', async () => {
    // Export preset
    const exportData = await manager.exportBrandPreset(mockBrandPreset);
    
    // Import preset
    const result = await manager.importBrandPreset(exportData);
    
    expect(result.success).toBe(true);
    // Note: Date objects get serialized to strings in JSON, so we check structure instead
    expect(result.data).toMatchObject({
      id: mockBrandPreset.id,
      name: mockBrandPreset.name,
      industry: mockBrandPreset.industry
    });
  });
});
