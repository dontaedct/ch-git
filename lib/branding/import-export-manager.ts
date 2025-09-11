/**
 * @fileoverview HT-011.1.7: Brand Import/Export System Implementation
 * @module lib/branding/import-export-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.7 - Implement Brand Import/Export System
 * Focus: Create brand import/export functionality for easy brand configuration sharing and backup/restore capabilities
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: LOW (branding system enhancement)
 */

import { DynamicBrandConfig } from './logo-manager';
import { BrandPreset } from './preset-manager';
import { BrandPalette } from '../design-tokens/multi-brand-generator';

/**
 * Brand export data structure
 */
export interface BrandExportData {
  /** Export metadata */
  metadata: {
    version: string;
    exportDate: string;
    exportType: 'brand-config' | 'preset' | 'full-branding';
    description?: string;
    author?: string;
  };
  /** Brand configuration */
  brandConfig?: DynamicBrandConfig;
  /** Brand preset */
  preset?: BrandPreset;
  /** Brand palette */
  palette?: BrandPalette;
  /** Additional assets */
  assets?: {
    logo?: string; // Base64 encoded logo
    favicon?: string; // Base64 encoded favicon
    ogImage?: string; // Base64 encoded OG image
  };
  /** Validation results */
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

/**
 * Brand import options
 */
export interface BrandImportOptions {
  /** Whether to validate before importing */
  validate: boolean;
  /** Whether to overwrite existing configurations */
  overwrite: boolean;
  /** Whether to create backup before importing */
  createBackup: boolean;
  /** Custom validation rules */
  customValidation?: (data: BrandExportData) => { isValid: boolean; errors: string[] };
}

/**
 * Brand import result
 */
export interface BrandImportResult {
  success: boolean;
  data?: DynamicBrandConfig | BrandPreset;
  errors: string[];
  warnings: string[];
  backupCreated?: boolean;
  validationPassed?: boolean;
}

/**
 * Brand export options
 */
export interface BrandExportOptions {
  /** Export format */
  format: 'json' | 'yaml';
  /** Whether to include assets */
  includeAssets: boolean;
  /** Whether to include validation results */
  includeValidation: boolean;
  /** Custom metadata */
  customMetadata?: Record<string, any>;
}

/**
 * Brand Import/Export Manager Class
 */
export class BrandImportExportManager {
  private readonly currentVersion = '1.0.0';
  private readonly supportedVersions = ['1.0.0'];

  /**
   * Export brand configuration
   */
  async exportBrandConfig(
    config: DynamicBrandConfig,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ): Promise<string> {
    try {
      const exportData: BrandExportData = {
        metadata: {
          version: this.currentVersion,
          exportDate: new Date().toISOString(),
          exportType: 'brand-config',
          description: `Brand configuration export for ${config.brandName.organizationName}`,
          ...options.customMetadata
        },
        brandConfig: config,
        validation: options.includeValidation ? this.validateBrandConfig(config) : undefined
      };

      // Include assets if requested
      if (options.includeAssets) {
        exportData.assets = await this.extractAssets(config);
      }

      return options.format === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : this.convertToYaml(exportData);
    } catch (error) {
      throw new Error(`Failed to export brand configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export brand preset
   */
  async exportBrandPreset(
    preset: BrandPreset,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ): Promise<string> {
    try {
      const exportData: BrandExportData = {
        metadata: {
          version: this.currentVersion,
          exportDate: new Date().toISOString(),
          exportType: 'preset',
          description: `Brand preset export for ${preset.name}`,
          ...options.customMetadata
        },
        preset,
        validation: options.includeValidation ? this.validateBrandPreset(preset) : undefined
      };

      // Include assets if requested
      if (options.includeAssets) {
        exportData.assets = await this.extractPresetAssets(preset);
      }

      return options.format === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : this.convertToYaml(exportData);
    } catch (error) {
      throw new Error(`Failed to export brand preset: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Export full branding system (config + preset + palette)
   */
  async exportFullBranding(
    config: DynamicBrandConfig,
    preset?: BrandPreset,
    palette?: BrandPalette,
    options: BrandExportOptions = { format: 'json', includeAssets: true, includeValidation: true }
  ): Promise<string> {
    try {
      const exportData: BrandExportData = {
        metadata: {
          version: this.currentVersion,
          exportDate: new Date().toISOString(),
          exportType: 'full-branding',
          description: `Full branding system export for ${config.brandName.organizationName}`,
          ...options.customMetadata
        },
        brandConfig: config,
        preset,
        palette,
        validation: options.includeValidation ? this.validateFullBranding(config, preset, palette) : undefined
      };

      // Include assets if requested
      if (options.includeAssets) {
        exportData.assets = await this.extractFullBrandingAssets(config, preset);
      }

      return options.format === 'json' 
        ? JSON.stringify(exportData, null, 2)
        : this.convertToYaml(exportData);
    } catch (error) {
      throw new Error(`Failed to export full branding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import brand configuration
   */
  async importBrandConfig(
    importData: string,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ): Promise<BrandImportResult> {
    try {
      const parsedData = this.parseImportData(importData);
      
      if (!parsedData) {
        return {
          success: false,
          errors: ['Invalid import data format'],
          warnings: []
        };
      }

      // Validate version compatibility
      if (!this.isVersionSupported(parsedData.metadata.version)) {
        return {
          success: false,
          errors: [`Unsupported version: ${parsedData.metadata.version}. Supported versions: ${this.supportedVersions.join(', ')}`],
          warnings: []
        };
      }

      // Validate data structure
      if (!parsedData.brandConfig) {
        return {
          success: false,
          errors: ['No brand configuration found in import data'],
          warnings: []
        };
      }

      // Run validation if requested
      let validationPassed = true;
      if (options.validate) {
        const validation = parsedData.validation || this.validateBrandConfig(parsedData.brandConfig);
        if (!validation.isValid) {
          validationPassed = false;
          if (!options.overwrite) {
            return {
              success: false,
              errors: validation.errors,
              warnings: validation.warnings || [],
              validationPassed: false
            };
          }
        }
      }

      // Create backup if requested
      let backupCreated = false;
      if (options.createBackup) {
        backupCreated = await this.createBackup('brand-config');
      }

      // Apply custom validation if provided
      if (options.customValidation) {
        const customValidation = options.customValidation(parsedData);
        if (!customValidation.isValid) {
          return {
            success: false,
            errors: customValidation.errors,
            warnings: [],
            backupCreated
          };
        }
      }

      // Import assets if present
      if (parsedData.assets) {
        await this.importAssets(parsedData.assets);
      }

      return {
        success: true,
        data: parsedData.brandConfig,
        errors: [],
        warnings: parsedData.validation?.warnings || [],
        backupCreated,
        validationPassed
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Import brand preset
   */
  async importBrandPreset(
    importData: string,
    options: BrandImportOptions = { validate: true, overwrite: false, createBackup: true }
  ): Promise<BrandImportResult> {
    try {
      const parsedData = this.parseImportData(importData);
      
      if (!parsedData) {
        return {
          success: false,
          errors: ['Invalid import data format'],
          warnings: []
        };
      }

      // Validate version compatibility
      if (!this.isVersionSupported(parsedData.metadata.version)) {
        return {
          success: false,
          errors: [`Unsupported version: ${parsedData.metadata.version}. Supported versions: ${this.supportedVersions.join(', ')}`],
          warnings: []
        };
      }

      // Validate data structure
      if (!parsedData.preset) {
        return {
          success: false,
          errors: ['No brand preset found in import data'],
          warnings: []
        };
      }

      // Run validation if requested
      let validationPassed = true;
      if (options.validate) {
        const validation = parsedData.validation || this.validateBrandPreset(parsedData.preset);
        if (!validation.isValid) {
          validationPassed = false;
          if (!options.overwrite) {
            return {
              success: false,
              errors: validation.errors,
              warnings: validation.warnings || [],
              validationPassed: false
            };
          }
        }
      }

      // Create backup if requested
      let backupCreated = false;
      if (options.createBackup) {
        backupCreated = await this.createBackup('brand-preset');
      }

      // Apply custom validation if provided
      if (options.customValidation) {
        const customValidation = options.customValidation(parsedData);
        if (!customValidation.isValid) {
          return {
            success: false,
            errors: customValidation.errors,
            warnings: [],
            backupCreated
          };
        }
      }

      // Import assets if present
      if (parsedData.assets) {
        await this.importAssets(parsedData.assets);
      }

      return {
        success: true,
        data: parsedData.preset,
        errors: [],
        warnings: parsedData.validation?.warnings || [],
        backupCreated,
        validationPassed
      };
    } catch (error) {
      return {
        success: false,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Validate brand configuration
   */
  private validateBrandConfig(config: DynamicBrandConfig): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate logo configuration
    if (!config.logo.src && !config.logo.initials) {
      errors.push('Logo must have either src or initials');
    }

    if (config.logo.initials && config.logo.initials.length > 3) {
      errors.push('Brand initials should be 3 characters or less');
    }

    // Validate brand names
    if (!config.brandName.organizationName.trim()) {
      errors.push('Organization name is required');
    }

    if (!config.brandName.appName.trim()) {
      errors.push('App name is required');
    }

    // Add warnings for potential issues
    if (config.logo.src && !config.logo.src.startsWith('data:') && !config.logo.src.startsWith('http')) {
      warnings.push('Logo src should be a valid URL or data URL');
    }

    if (config.brandName.organizationName.length > 50) {
      warnings.push('Organization name is quite long, consider shortening for better display');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate brand preset
   */
  private validateBrandPreset(preset: BrandPreset): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!preset.id) errors.push('Preset ID is required');
    if (!preset.name) errors.push('Preset name is required');
    if (!preset.palette?.primary) errors.push('Primary color is required');
    if (!preset.brandName?.organizationName) errors.push('Organization name is required');
    if (!preset.brandName?.appName) errors.push('App name is required');

    // Add warnings for potential issues
    if (preset.palette.primary && !this.isValidColor(preset.palette.primary)) {
      warnings.push('Primary color format may be invalid');
    }

    if (preset.metadata.tags.length === 0) {
      warnings.push('Preset has no tags, consider adding some for better categorization');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate full branding system
   */
  private validateFullBranding(
    config: DynamicBrandConfig,
    preset?: BrandPreset,
    palette?: BrandPalette
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate brand config
    const configValidation = this.validateBrandConfig(config);
    errors.push(...configValidation.errors);
    warnings.push(...configValidation.warnings);

    // Validate preset if provided
    if (preset) {
      const presetValidation = this.validateBrandPreset(preset);
      errors.push(...presetValidation.errors);
      warnings.push(...presetValidation.warnings);
    }

    // Validate palette if provided
    if (palette) {
      if (!palette.primary) {
        errors.push('Palette primary color is required');
      }
      if (!this.isValidColor(palette.primary)) {
        warnings.push('Palette primary color format may be invalid');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Extract assets from brand configuration
   */
  private async extractAssets(config: DynamicBrandConfig): Promise<{ logo?: string; favicon?: string; ogImage?: string }> {
    const assets: { logo?: string; favicon?: string; ogImage?: string } = {};

    try {
      // Extract logo if it's a data URL
      if (config.logo.src && config.logo.src.startsWith('data:')) {
        assets.logo = config.logo.src;
      }

      // In a real implementation, you would fetch and convert external URLs to base64
      // For now, we'll just include the URL
      if (config.logo.src && !config.logo.src.startsWith('data:')) {
        assets.logo = config.logo.src;
      }
    } catch (error) {
      console.warn('Failed to extract logo asset:', error);
    }

    return assets;
  }

  /**
   * Extract assets from brand preset
   */
  private async extractPresetAssets(preset: BrandPreset): Promise<{ logo?: string; favicon?: string; ogImage?: string }> {
    const assets: { logo?: string; favicon?: string; ogImage?: string } = {};

    try {
      // Extract logo if it's a data URL
      if (preset.logo.src && preset.logo.src.startsWith('data:')) {
        assets.logo = preset.logo.src;
      }

      // Extract favicon and OG image if present
      if (preset.elements.favicon) {
        assets.favicon = preset.elements.favicon;
      }

      if (preset.elements.ogImage) {
        assets.ogImage = preset.elements.ogImage;
      }
    } catch (error) {
      console.warn('Failed to extract preset assets:', error);
    }

    return assets;
  }

  /**
   * Extract assets from full branding system
   */
  private async extractFullBrandingAssets(
    config: DynamicBrandConfig,
    preset?: BrandPreset
  ): Promise<{ logo?: string; favicon?: string; ogImage?: string }> {
    const configAssets = await this.extractAssets(config);
    const presetAssets = preset ? await this.extractPresetAssets(preset) : {};

    return {
      logo: configAssets.logo || presetAssets.logo,
      favicon: presetAssets.favicon,
      ogImage: presetAssets.ogImage
    };
  }

  /**
   * Import assets
   */
  private async importAssets(assets: { logo?: string; favicon?: string; ogImage?: string }): Promise<void> {
    try {
      // In a real implementation, you would save assets to storage
      // For now, we'll just log the import
      if (assets.logo) {
        console.log('Importing logo asset');
      }
      if (assets.favicon) {
        console.log('Importing favicon asset');
      }
      if (assets.ogImage) {
        console.log('Importing OG image asset');
      }
    } catch (error) {
      console.warn('Failed to import assets:', error);
    }
  }

  /**
   * Parse import data
   */
  private parseImportData(data: string): BrandExportData | null {
    try {
      // Try JSON first
      if (data.trim().startsWith('{')) {
        return JSON.parse(data) as BrandExportData;
      }

      // Try YAML (simplified implementation)
      if (data.trim().startsWith('---') || data.includes(':')) {
        return this.parseYaml(data);
      }

      return null;
    } catch (error) {
      console.error('Failed to parse import data:', error);
      return null;
    }
  }

  /**
   * Parse YAML data (simplified implementation)
   */
  private parseYaml(yamlData: string): BrandExportData | null {
    // This is a simplified YAML parser for basic use cases
    // In a real implementation, you would use a proper YAML library
    try {
      const lines = yamlData.split('\n');
      const result: any = {};
      let currentKey = '';
      let currentValue = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes(':')) {
          if (currentKey && currentValue) {
            result[currentKey] = currentValue;
          }
          const [key, value] = trimmedLine.split(':', 2);
          currentKey = key.trim();
          currentValue = value.trim();
        } else if (trimmedLine && currentKey) {
          currentValue += ' ' + trimmedLine;
        }
      }

      if (currentKey && currentValue) {
        result[currentKey] = currentValue;
      }

      return result as BrandExportData;
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      return null;
    }
  }

  /**
   * Convert to YAML (simplified implementation)
   */
  private convertToYaml(data: BrandExportData): string {
    // This is a simplified YAML converter
    // In a real implementation, you would use a proper YAML library
    let yaml = '---\n';
    yaml += `version: ${data.metadata.version}\n`;
    yaml += `exportDate: ${data.metadata.exportDate}\n`;
    yaml += `exportType: ${data.metadata.exportType}\n`;
    
    if (data.metadata.description) {
      yaml += `description: ${data.metadata.description}\n`;
    }

    if (data.brandConfig) {
      yaml += 'brandConfig:\n';
      yaml += `  organizationName: ${data.brandConfig.brandName.organizationName}\n`;
      yaml += `  appName: ${data.brandConfig.brandName.appName}\n`;
    }

    if (data.preset) {
      yaml += 'preset:\n';
      yaml += `  name: ${data.preset.name}\n`;
      yaml += `  industry: ${data.preset.industry}\n`;
    }

    return yaml;
  }

  /**
   * Check if version is supported
   */
  private isVersionSupported(version: string): boolean {
    return this.supportedVersions.includes(version);
  }

  /**
   * Create backup
   */
  private async createBackup(type: string): Promise<boolean> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupKey = `brand-backup-${type}-${timestamp}`;
      
      // In a real implementation, you would save to storage
      console.log(`Creating backup: ${backupKey}`);
      
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      return false;
    }
  }

  /**
   * Validate color format
   */
  private isValidColor(color: string): boolean {
    // Basic color validation
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) || 
           color.startsWith('rgb(') || 
           color.startsWith('hsl(');
  }

  /**
   * Get supported export formats
   */
  getSupportedFormats(): string[] {
    return ['json', 'yaml'];
  }

  /**
   * Get supported versions
   */
  getSupportedVersions(): string[] {
    return [...this.supportedVersions];
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }
}

/**
 * Global brand import/export manager instance
 */
export const brandImportExportManager = new BrandImportExportManager();

/**
 * Utility functions for brand import/export
 */
export const BrandImportExportUtils = {
  /**
   * Generate filename for export
   */
  generateFilename(type: 'brand-config' | 'preset' | 'full-branding', format: 'json' | 'yaml' = 'json'): string {
    const timestamp = new Date().toISOString().split('T')[0];
    return `brand-${type}-${timestamp}.${format}`;
  },

  /**
   * Download export data
   */
  downloadExport(data: string, filename: string): boolean {
    try {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error('Failed to download export:', error);
      return false;
    }
  },

  /**
   * Read file content
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[] = ['.json', '.yaml', '.yml']): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.includes(extension);
  }
};
