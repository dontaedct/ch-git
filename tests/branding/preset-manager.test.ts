/**
 * @fileoverview HT-011.1.5: Brand Preset System Test Suite
 * @module tests/branding/preset-manager.test
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.5 - Implement Brand Preset System
 * Focus: Comprehensive testing of brand preset functionality
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  BrandPresetManager, 
  BrandPreset, 
  PresetCustomization,
  BrandPresetUtils 
} from '@/lib/branding/preset-manager';
import { DynamicBrandConfig } from '@/lib/branding/logo-manager';

describe('BrandPresetManager', () => {
  let presetManager: BrandPresetManager;

  beforeEach(() => {
    presetManager = new BrandPresetManager();
  });

  describe('System Presets Initialization', () => {
    it('should initialize with system presets', () => {
      const presets = presetManager.getAvailablePresets();
      expect(presets.length).toBeGreaterThan(0);
      
      const systemPresets = presets.filter(p => p.metadata.isSystem);
      expect(systemPresets.length).toBeGreaterThan(0);
    });

    it('should have presets for different industries', () => {
      const presets = presetManager.getAvailablePresets();
      const industries = [...new Set(presets.map(p => p.industry))];
      
      expect(industries).toContain('Technology');
      expect(industries).toContain('Finance');
      expect(industries).toContain('Healthcare');
      expect(industries).toContain('Creative');
    });

    it('should have valid preset structure', () => {
      const presets = presetManager.getAvailablePresets();
      
      presets.forEach(preset => {
        expect(preset.id).toBeDefined();
        expect(preset.name).toBeDefined();
        expect(preset.description).toBeDefined();
        expect(preset.industry).toBeDefined();
        expect(preset.palette).toBeDefined();
        expect(preset.palette.primary).toBeDefined();
        expect(preset.brandName).toBeDefined();
        expect(preset.typography).toBeDefined();
        expect(preset.metadata).toBeDefined();
        expect(preset.metadata.isSystem).toBeDefined();
        expect(preset.metadata.tags).toBeDefined();
      });
    });
  });

  describe('Preset Retrieval', () => {
    it('should get preset by ID', () => {
      const presets = presetManager.getAvailablePresets();
      const firstPreset = presets[0];
      
      const retrievedPreset = presetManager.getPreset(firstPreset.id);
      expect(retrievedPreset).toEqual(firstPreset);
    });

    it('should return null for non-existent preset', () => {
      const preset = presetManager.getPreset('non-existent-id');
      expect(preset).toBeNull();
    });

    it('should get presets by industry', () => {
      const techPresets = presetManager.getPresetsByIndustry('Technology');
      expect(techPresets.length).toBeGreaterThan(0);
      
      techPresets.forEach(preset => {
        expect(preset.industry).toBe('Technology');
      });
    });

    it('should search presets by query', () => {
      const results = presetManager.searchPresets('tech');
      expect(results.length).toBeGreaterThan(0);
      
      results.forEach(preset => {
        const searchableText = [
          preset.name,
          preset.description,
          preset.industry,
          ...preset.metadata.tags
        ].join(' ').toLowerCase();
        
        expect(searchableText).toContain('tech');
      });
    });
  });

  describe('Preset Loading and Customization', () => {
    it('should load preset without customizations', () => {
      const presets = presetManager.getAvailablePresets();
      const preset = presets[0];
      
      const config = presetManager.loadPreset(preset.id);
      expect(config).toBeDefined();
      expect(config?.presetName).toBe(preset.id);
      expect(config?.isCustom).toBe(false);
    });

    it('should load preset with customizations', () => {
      const presets = presetManager.getAvailablePresets();
      const preset = presets[0];
      
      const customizations: PresetCustomization = {
        organizationName: 'Custom Org',
        appName: 'Custom App',
        primaryColor: '#ff0000'
      };
      
      const config = presetManager.loadPreset(preset.id, customizations);
      expect(config).toBeDefined();
      expect(config?.brandName.organizationName).toBe('Custom Org');
      expect(config?.brandName.appName).toBe('Custom App');
    });

    it('should update usage count when loading preset', () => {
      const presets = presetManager.getAvailablePresets();
      const preset = presets[0];
      const initialUsageCount = preset.metadata.usageCount;
      
      presetManager.loadPreset(preset.id);
      
      const updatedPreset = presetManager.getPreset(preset.id);
      expect(updatedPreset?.metadata.usageCount).toBe(initialUsageCount + 1);
    });

    it('should return null for non-existent preset', () => {
      const config = presetManager.loadPreset('non-existent-id');
      expect(config).toBeNull();
    });
  });

  describe('Custom Preset Management', () => {
    it('should create custom preset', () => {
      const presetData: Omit<BrandPreset, 'id' | 'metadata'> = {
        name: 'Test Preset',
        description: 'Test description',
        industry: 'Test',
        palette: {
          name: 'Test Palette',
          primary: '#ff0000',
          description: 'Test palette'
        },
        logo: {
          src: '/test-logo.png',
          alt: 'Test logo',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: 'TP',
          fallbackBgColor: 'from-red-600 to-red-800'
        },
        brandName: {
          organizationName: 'Test Org',
          appName: 'Test App',
          fullBrand: 'Test Org — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {},
        metadata: {
          isSystem: false,
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test']
        }
      };

      const customPreset = presetManager.createCustomPreset(presetData);
      expect(customPreset).toBeDefined();
      expect(customPreset.id).toMatch(/^custom-/);
      expect(customPreset.metadata.isSystem).toBe(false);
      
      const retrievedPreset = presetManager.getPreset(customPreset.id);
      expect(retrievedPreset).toEqual(customPreset);
    });

    it('should update custom preset', () => {
      const presets = presetManager.getAvailablePresets();
      const customPresets = presets.filter(p => !p.metadata.isSystem);
      
      if (customPresets.length > 0) {
        const preset = customPresets[0];
        const updates = { name: 'Updated Name' };
        
        const success = presetManager.updatePreset(preset.id, updates);
        expect(success).toBe(true);
        
        const updatedPreset = presetManager.getPreset(preset.id);
        expect(updatedPreset?.name).toBe('Updated Name');
        expect(updatedPreset?.metadata.updatedAt).toBeDefined();
      }
    });

    it('should delete custom preset', () => {
      const presets = presetManager.getAvailablePresets();
      const customPresets = presets.filter(p => !p.metadata.isSystem);
      
      if (customPresets.length > 0) {
        const preset = customPresets[0];
        
        const success = presetManager.deletePreset(preset.id);
        expect(success).toBe(true);
        
        const deletedPreset = presetManager.getPreset(preset.id);
        expect(deletedPreset).toBeNull();
      }
    });

    it('should not delete system presets', () => {
      const presets = presetManager.getAvailablePresets();
      const systemPresets = presets.filter(p => p.metadata.isSystem);
      
      if (systemPresets.length > 0) {
        const preset = systemPresets[0];
        
        const success = presetManager.deletePreset(preset.id);
        expect(success).toBe(false);
        
        const stillExists = presetManager.getPreset(preset.id);
        expect(stillExists).toBeDefined();
      }
    });
  });

  describe('Preset Recommendations', () => {
    it('should get recommendations for specific industry', () => {
      const recommendations = presetManager.getRecommendations('Technology', 3);
      expect(recommendations.length).toBeLessThanOrEqual(3);
      
      // Should prioritize industry-specific presets
      const techPresets = recommendations.filter(p => p.industry === 'Technology');
      expect(techPresets.length).toBeGreaterThan(0);
    });

    it('should limit recommendations count', () => {
      const recommendations = presetManager.getRecommendations('Technology', 2);
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Preset Import/Export', () => {
    it('should export preset configuration', () => {
      const presets = presetManager.getAvailablePresets();
      const preset = presets[0];
      
      const exported = presetManager.exportPreset(preset.id);
      expect(exported).toBeDefined();
      
      const parsed = JSON.parse(exported!);
      expect(parsed.id).toBe(preset.id);
      expect(parsed.name).toBe(preset.name);
    });

    it('should import preset configuration', () => {
      const presets = presetManager.getAvailablePresets();
      const originalPreset = presets[0];
      
      const exported = presetManager.exportPreset(originalPreset.id);
      expect(exported).toBeDefined();
      
      const importedPreset = presetManager.importPreset(exported!);
      expect(importedPreset).toBeDefined();
      expect(importedPreset?.id).toMatch(/^imported-/);
      expect(importedPreset?.name).toBe(originalPreset.name);
      expect(importedPreset?.metadata.isSystem).toBe(false);
    });

    it('should handle invalid import data', () => {
      const result = presetManager.importPreset('invalid json');
      expect(result).toBeNull();
    });
  });

  describe('Preset Statistics', () => {
    it('should provide preset statistics', () => {
      const stats = presetManager.getPresetStats();
      
      expect(stats.totalPresets).toBeGreaterThan(0);
      expect(stats.systemPresets).toBeGreaterThan(0);
      expect(stats.customPresets).toBeGreaterThanOrEqual(0);
      expect(stats.industryCounts).toBeDefined();
      expect(stats.mostUsedPresets).toBeDefined();
      
      expect(stats.totalPresets).toBe(stats.systemPresets + stats.customPresets);
    });

    it('should track most used presets', () => {
      const stats = presetManager.getPresetStats();
      
      expect(stats.mostUsedPresets.length).toBeLessThanOrEqual(5);
      
      // Should be sorted by usage count (descending)
      for (let i = 1; i < stats.mostUsedPresets.length; i++) {
        expect(stats.mostUsedPresets[i-1].usageCount)
          .toBeGreaterThanOrEqual(stats.mostUsedPresets[i].usageCount);
      }
    });
  });
});

describe('BrandPresetUtils', () => {
  describe('Preset Preview Generation', () => {
    it('should generate preview data', () => {
      const preset: BrandPreset = {
        id: 'test',
        name: 'Test Preset',
        description: 'Test description',
        industry: 'Test',
        palette: {
          name: 'Test Palette',
          primary: '#ff0000',
          secondary: '#00ff00',
          description: 'Test palette'
        },
        logo: {
          src: '/test-logo.png',
          alt: 'Test logo',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: 'TP',
          fallbackBgColor: 'from-red-600 to-red-800'
        },
        brandName: {
          organizationName: 'Test Org',
          appName: 'Test App',
          fullBrand: 'Test Org — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {},
        metadata: {
          isSystem: false,
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test']
        }
      };

      const preview = BrandPresetUtils.generatePreview(preset);
      
      expect(preview.colors).toEqual(['#ff0000', '#00ff00']);
      expect(preview.logo).toBe('/test-logo.png');
      expect(preview.name).toBe('Test Preset');
      expect(preview.industry).toBe('Test');
    });
  });

  describe('Preset Validation', () => {
    it('should validate valid preset', () => {
      const preset: BrandPreset = {
        id: 'test',
        name: 'Test Preset',
        description: 'Test description',
        industry: 'Test',
        palette: {
          name: 'Test Palette',
          primary: '#ff0000',
          description: 'Test palette'
        },
        logo: {
          src: '/test-logo.png',
          alt: 'Test logo',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: 'TP',
          fallbackBgColor: 'from-red-600 to-red-800'
        },
        brandName: {
          organizationName: 'Test Org',
          appName: 'Test App',
          fullBrand: 'Test Org — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {},
        metadata: {
          isSystem: false,
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test']
        }
      };

      const validation = BrandPresetUtils.validatePreset(preset);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should validate invalid preset', () => {
      const preset: BrandPreset = {
        id: '',
        name: '',
        description: 'Test description',
        industry: 'Test',
        palette: {
          name: 'Test Palette',
          primary: '',
          description: 'Test palette'
        },
        logo: {
          src: '/test-logo.png',
          alt: 'Test logo',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: 'TP',
          fallbackBgColor: 'from-red-600 to-red-800'
        },
        brandName: {
          organizationName: '',
          appName: '',
          fullBrand: 'Test Org — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {},
        metadata: {
          isSystem: false,
          isPublic: false,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['test']
        }
      };

      const validation = BrandPresetUtils.validatePreset(preset);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Industry Categories', () => {
    it('should provide industry categories', () => {
      const categories = BrandPresetUtils.getIndustryCategories();
      
      expect(categories).toContain('Technology');
      expect(categories).toContain('Finance');
      expect(categories).toContain('Healthcare');
      expect(categories).toContain('Creative');
      expect(categories).toContain('Retail');
      expect(categories).toContain('Education');
      expect(categories).toContain('General');
    });
  });

  describe('Preset Generation from Config', () => {
    it('should generate preset from brand configuration', () => {
      const config: DynamicBrandConfig = {
        logo: {
          src: '/test-logo.png',
          alt: 'Test logo',
          width: 28,
          height: 28,
          showAsImage: true,
          initials: 'TP',
          fallbackBgColor: 'from-red-600 to-red-800'
        },
        brandName: {
          organizationName: 'Test Org',
          appName: 'Test App',
          fullBrand: 'Test Org — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App'
        },
        isCustom: false,
        presetName: 'test'
      };

      const preset = BrandPresetUtils.generatePresetFromConfig(config, 'Test Preset', 'Test');
      
      expect(preset.name).toBe('Test Preset');
      expect(preset.industry).toBe('Test');
      expect(preset.logo).toEqual(config.logo);
      expect(preset.brandName).toEqual(config.brandName);
      expect(preset.metadata.isSystem).toBe(false);
      expect(preset.metadata.tags).toContain('generated');
    });
  });
});
