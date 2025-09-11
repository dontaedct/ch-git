/**
 * @fileoverview Dynamic Logo and Brand Name System Test
 * @module tests/branding/dynamic-branding.test.ts
 * @author OSS Hero System
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { LogoManager, DEFAULT_BRAND_CONFIG, BRAND_PRESETS, BrandUtils } from '@/lib/branding/logo-manager';

describe('Dynamic Logo and Brand Name System', () => {
  let logoManager: LogoManager;

  beforeEach(() => {
    logoManager = new LogoManager();
  });

  describe('LogoManager', () => {
    it('should initialize with default configuration', () => {
      const config = logoManager.getCurrentConfig();
      expect(config).toEqual(DEFAULT_BRAND_CONFIG);
    });

    it('should update brand configuration', () => {
      const newConfig = {
        brandName: {
          organizationName: 'Test Company',
          appName: 'Test App',
          fullBrand: 'Test Company — Test App',
          shortBrand: 'Test App',
          navBrand: 'Test App',
        },
      };

      logoManager.updateConfig(newConfig);
      const config = logoManager.getCurrentConfig();

      expect(config.brandName.organizationName).toBe('Test Company');
      expect(config.brandName.appName).toBe('Test App');
    });

    it('should load brand presets', () => {
      const success = logoManager.loadPreset('tech');
      expect(success).toBe(true);

      const config = logoManager.getCurrentConfig();
      expect(config.presetName).toBe('tech');
      expect(config.brandName.organizationName).toBe('Tech Company');
    });

    it('should handle invalid preset names', () => {
      const success = logoManager.loadPreset('invalid-preset');
      expect(success).toBe(false);
    });

    it('should set custom logo', () => {
      logoManager.setCustomLogo('/custom-logo.png', 'Custom Logo');
      const config = logoManager.getCurrentConfig();

      expect(config.logo.src).toBe('/custom-logo.png');
      expect(config.logo.alt).toBe('Custom Logo');
      expect(config.logo.showAsImage).toBe(true);
    });

    it('should set brand initials', () => {
      logoManager.setBrandInitials('TC', 'from-green-600 to-emerald-600');
      const config = logoManager.getCurrentConfig();

      expect(config.logo.initials).toBe('TC');
      expect(config.logo.fallbackBgColor).toBe('from-green-600 to-emerald-600');
      expect(config.logo.showAsImage).toBe(false);
    });

    it('should validate brand configuration', () => {
      const validConfig = {
        ...DEFAULT_BRAND_CONFIG,
        brandName: {
          organizationName: 'Valid Company',
          appName: 'Valid App',
          fullBrand: 'Valid Company — Valid App',
          shortBrand: 'Valid App',
          navBrand: 'Valid App',
        },
      };

      const validation = logoManager.validateConfig(validConfig);
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect invalid brand configuration', () => {
      const invalidConfig = {
        ...DEFAULT_BRAND_CONFIG,
        brandName: {
          organizationName: '',
          appName: '',
          fullBrand: '',
          shortBrand: '',
          navBrand: '',
        },
      };

      const validation = logoManager.validateConfig(invalidConfig);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should export and import configuration', () => {
      const originalConfig = logoManager.getCurrentConfig();
      const exported = logoManager.exportConfig();
      
      // Modify configuration
      logoManager.updateConfig({
        brandName: {
          organizationName: 'Modified Company',
          appName: 'Modified App',
          fullBrand: 'Modified Company — Modified App',
          shortBrand: 'Modified App',
          navBrand: 'Modified App',
        },
      });

      // Import original configuration
      const success = logoManager.importConfig(exported);
      expect(success).toBe(true);

      const importedConfig = logoManager.getCurrentConfig();
      expect(importedConfig.brandName.organizationName).toBe(originalConfig.brandName.organizationName);
    });
  });

  describe('BrandUtils', () => {
    it('should generate initials from organization name', () => {
      expect(BrandUtils.generateInitials('Test Company Inc')).toBe('TCI');
      expect(BrandUtils.generateInitials('Acme Corporation')).toBe('AC');
      expect(BrandUtils.generateInitials('Very Long Company Name')).toBe('VLC');
    });

    it('should generate brand name variations', () => {
      const brandNames = BrandUtils.generateBrandNames('Test Company', 'Test App');
      
      expect(brandNames.organizationName).toBe('Test Company');
      expect(brandNames.appName).toBe('Test App');
      expect(brandNames.fullBrand).toBe('Test Company — Test App');
      expect(brandNames.shortBrand).toBe('Test App');
      expect(brandNames.navBrand).toBe('Test App');
    });

    it('should get available presets', () => {
      const presets = BrandUtils.getAvailablePresets();
      expect(presets).toContain('default');
      expect(presets).toContain('tech');
      expect(presets).toContain('corporate');
      expect(presets).toContain('startup');
    });

    it('should check if preset exists', () => {
      expect(BrandUtils.presetExists('default')).toBe(true);
      expect(BrandUtils.presetExists('tech')).toBe(true);
      expect(BrandUtils.presetExists('invalid')).toBe(false);
    });
  });

  describe('Brand Presets', () => {
    it('should have valid default preset', () => {
      const defaultPreset = BRAND_PRESETS.default;
      expect(defaultPreset.brandName.organizationName).toBe('Your Organization');
      expect(defaultPreset.brandName.appName).toBe('Micro App');
      expect(defaultPreset.logo.initials).toBe('CH');
    });

    it('should have valid tech preset', () => {
      const techPreset = BRAND_PRESETS.tech;
      expect(techPreset.brandName.organizationName).toBe('Tech Company');
      expect(techPreset.brandName.appName).toBe('Tech App');
      expect(techPreset.logo.initials).toBe('TC');
      expect(techPreset.logo.fallbackBgColor).toBe('from-green-600 to-emerald-600');
    });

    it('should have valid corporate preset', () => {
      const corporatePreset = BRAND_PRESETS.corporate;
      expect(corporatePreset.brandName.organizationName).toBe('Corporate Inc');
      expect(corporatePreset.brandName.appName).toBe('Corporate App');
      expect(corporatePreset.logo.initials).toBe('CO');
      expect(corporatePreset.logo.fallbackBgColor).toBe('from-purple-600 to-violet-600');
    });

    it('should have valid startup preset', () => {
      const startupPreset = BRAND_PRESETS.startup;
      expect(startupPreset.brandName.organizationName).toBe('Startup Co');
      expect(startupPreset.brandName.appName).toBe('Startup App');
      expect(startupPreset.logo.initials).toBe('ST');
      expect(startupPreset.logo.fallbackBgColor).toBe('from-orange-600 to-red-600');
    });
  });
});
