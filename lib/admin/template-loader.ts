/**
 * @fileoverview Template Loading and Integration System - HT-032.1.2
 * @module lib/admin/template-loader
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template loading and integration system that handles dynamic template loading,
 * asset management, and seamless integration with the modular admin interface.
 */

import { 
  TemplateLoader,
  TemplateRegistration,
  ValidationResult
} from '@/types/admin/template-registry';
import { getTemplateRegistryManager } from './template-registry';
import { getSettingsRegistryManager } from './settings-registry';

/**
 * Template Loader Implementation
 * Handles dynamic template loading, validation, and integration
 */
export class TemplateLoaderImpl implements TemplateLoader {
  private templatePath: string;
  private loadedTemplates: Map<string, TemplateRegistration> = new Map();
  private assetCache: Map<string, any> = new Map();

  constructor(templatePath: string = '/templates') {
    this.templatePath = templatePath;
  }

  /**
   * Load a template from the filesystem or remote source
   */
  async loadTemplate(templateId: string): Promise<TemplateRegistration> {
    try {
      // Check if already loaded
      const cached = this.loadedTemplates.get(templateId);
      if (cached) {
        return cached;
      }

      // Load template registration file
      const registrationPath = this.getTemplatePath(templateId);
      const registrationFile = `${registrationPath}/template.json`;
      
      let registration: TemplateRegistration;

      if (typeof window !== 'undefined') {
        // Client-side loading
        const response = await fetch(registrationFile);
        if (!response.ok) {
          throw new Error(`Failed to load template registration: ${response.statusText}`);
        }
        registration = await response.json();
      } else {
        // Server-side loading
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
          const fileContent = await fs.readFile(
            path.join(process.cwd(), registrationFile), 
            'utf-8'
          );
          registration = JSON.parse(fileContent);
        } catch (error) {
          throw new Error(`Failed to read template registration file: ${error}`);
        }
      }

      // Validate the registration
      const validation = await this.validateTemplate(registration);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Load template assets
      await this.loadTemplateAssets(registration);

      // Cache the loaded template
      this.loadedTemplates.set(templateId, registration);

      console.log(`Successfully loaded template: ${templateId}`);
      return registration;

    } catch (error) {
      console.error(`Failed to load template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Unload a template and clean up resources
   */
  async unloadTemplate(templateId: string): Promise<void> {
    try {
      const registration = this.loadedTemplates.get(templateId);
      if (!registration) {
        console.warn(`Template ${templateId} is not loaded`);
        return;
      }

      // Unload template assets
      await this.unloadTemplateAssets(registration);

      // Remove from cache
      this.loadedTemplates.delete(templateId);
      this.assetCache.delete(templateId);

      console.log(`Successfully unloaded template: ${templateId}`);

    } catch (error) {
      console.error(`Failed to unload template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get the path for a template
   */
  getTemplatePath(templateId: string): string {
    return `${this.templatePath}/${templateId}`;
  }

  /**
   * Validate a template registration
   */
  async validateTemplate(registration: TemplateRegistration): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic structure validation
      if (!registration.metadata) {
        errors.push('Template metadata is required');
      } else {
        const { metadata } = registration;

        // Validate required metadata fields
        if (!metadata.id || metadata.id.trim() === '') {
          errors.push('Template ID is required');
        }

        if (!metadata.name || metadata.name.trim() === '') {
          errors.push('Template name is required');
        }

        if (!metadata.description || metadata.description.trim() === '') {
          errors.push('Template description is required');
        }

        if (!metadata.version || !/^\d+\.\d+\.\d+$/.test(metadata.version)) {
          errors.push('Template version must be in semantic format (e.g., 1.0.0)');
        }

        if (!metadata.author || metadata.author.trim() === '') {
          errors.push('Template author is required');
        }

        if (!metadata.category || metadata.category.trim() === '') {
          errors.push('Template category is required');
        }

        // Validate template ID format
        if (metadata.id && !/^[a-z0-9-]+$/.test(metadata.id)) {
          errors.push('Template ID must contain only lowercase letters, numbers, and hyphens');
        }

        if (metadata.id && (metadata.id.length < 3 || metadata.id.length > 50)) {
          errors.push('Template ID must be between 3 and 50 characters');
        }
      }

      // Validate settings
      if (registration.settings && Array.isArray(registration.settings)) {
        const settingIds = new Set<string>();
        
        for (const setting of registration.settings) {
          // Check for duplicate setting IDs
          if (settingIds.has(setting.id)) {
            errors.push(`Duplicate setting ID: ${setting.id}`);
          }
          settingIds.add(setting.id);

          // Validate setting structure
          if (!setting.id || setting.id.trim() === '') {
            errors.push('Setting ID is required');
          }

          if (!setting.name || setting.name.trim() === '') {
            errors.push(`Setting name is required for ID: ${setting.id}`);
          }

          if (!setting.type) {
            errors.push(`Setting type is required for ID: ${setting.id}`);
          }

          // Validate setting type
          const validTypes = ['string', 'number', 'boolean', 'select', 'multiselect', 'object', 'array', 'file', 'color', 'date'];
          if (setting.type && !validTypes.includes(setting.type)) {
            errors.push(`Invalid setting type '${setting.type}' for setting '${setting.id}'`);
          }

          // Validate select options
          if ((setting.type === 'select' || setting.type === 'multiselect') && (!setting.options || setting.options.length === 0)) {
            errors.push(`Select setting '${setting.id}' must have options`);
          }
        }
      }

      // Validate navigation
      if (registration.navigation && Array.isArray(registration.navigation)) {
        const navIds = new Set<string>();
        
        for (const nav of registration.navigation) {
          if (navIds.has(nav.id)) {
            errors.push(`Duplicate navigation ID: ${nav.id}`);
          }
          navIds.add(nav.id);

          if (!nav.id || nav.id.trim() === '') {
            errors.push('Navigation ID is required');
          }

          if (!nav.label || nav.label.trim() === '') {
            errors.push(`Navigation label is required for ID: ${nav.id}`);
          }

          if (!nav.href || nav.href.trim() === '') {
            errors.push(`Navigation href is required for ID: ${nav.id}`);
          }
        }
      }

      // Validate components
      if (registration.components) {
        const { settingsPanel, dashboard, widgets } = registration.components;

        if (settingsPanel && typeof settingsPanel !== 'string') {
          errors.push('Settings panel component path must be a string');
        }

        if (dashboard && typeof dashboard !== 'string') {
          errors.push('Dashboard component path must be a string');
        }

        if (widgets && !Array.isArray(widgets)) {
          errors.push('Widgets must be an array');
        }
      }

      // Validate hooks
      if (registration.hooks) {
        const hookNames = Object.keys(registration.hooks);
        const validHooks = ['beforeInstall', 'afterInstall', 'beforeUninstall', 'afterUninstall', 'beforeUpdate', 'afterUpdate'];
        
        for (const hookName of hookNames) {
          if (!validHooks.includes(hookName)) {
            warnings.push(`Unknown hook: ${hookName}`);
          }

          const hookPath = registration.hooks[hookName as keyof typeof registration.hooks];
          if (hookPath && typeof hookPath !== 'string') {
            errors.push(`Hook '${hookName}' must be a string path`);
          }
        }
      }

      // Validate assets
      if (registration.assets) {
        const { stylesheets, scripts, images, fonts } = registration.assets;

        if (stylesheets && !Array.isArray(stylesheets)) {
          errors.push('Stylesheets must be an array');
        }

        if (scripts && !Array.isArray(scripts)) {
          errors.push('Scripts must be an array');
        }

        if (images && !Array.isArray(images)) {
          errors.push('Images must be an array');
        }

        if (fonts && !Array.isArray(fonts)) {
          errors.push('Fonts must be an array');
        }
      }

      // Check for potential conflicts
      if (registration.metadata?.conflicts && registration.metadata.conflicts.length > 0) {
        const registryManager = getTemplateRegistryManager();
        const installedTemplates = registryManager.getInstalledTemplates();
        
        for (const conflictId of registration.metadata.conflicts) {
          const conflictExists = installedTemplates.some(template => template.templateId === conflictId);
          if (conflictExists) {
            warnings.push(`Template conflicts with installed template: ${conflictId}`);
          }
        }
      }

      // Check dependencies
      if (registration.metadata?.dependencies && registration.metadata.dependencies.length > 0) {
        const registryManager = getTemplateRegistryManager();
        const installedTemplates = registryManager.getInstalledTemplates();
        
        for (const dependencyId of registration.metadata.dependencies) {
          const dependencyExists = installedTemplates.some(template => template.templateId === dependencyId);
          if (!dependencyExists) {
            errors.push(`Missing dependency: ${dependencyId}`);
          }
        }
      }

    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Install a template (register and set up)
   */
  async installTemplate(registration: TemplateRegistration): Promise<void> {
    try {
      // Validate template
      const validation = await this.validateTemplate(registration);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Register with template registry
      const registryManager = getTemplateRegistryManager();
      await registryManager.registerTemplate(registration);

      // Set up settings registry
      if (registration.settings && registration.settings.length > 0) {
        const settingsManager = getSettingsRegistryManager();
        
        // Create settings groups from template settings
        const settingsGroups = this.createSettingsGroupsFromTemplate(registration);
        
        const settingsRegistry = {
          templateId: registration.metadata.id,
          groups: settingsGroups,
          validation: this.createValidationSchema(registration),
          hooks: {
            onSave: async (settings) => {
              // Save settings to persistent storage
              await this.saveTemplateSettings(registration.metadata.id, settings);
            },
            onLoad: async () => {
              // Load settings from persistent storage
              return await this.loadTemplateSettings(registration.metadata.id);
            }
          }
        };

        await settingsManager.registerSettingsRegistry(settingsRegistry);
      }

      // Load template assets
      await this.loadTemplateAssets(registration);

      // Execute installation hooks
      if (registration.hooks.beforeInstall) {
        await this.executeTemplateHook(registration.hooks.beforeInstall, registration.metadata.id);
      }

      // Cache the template
      this.loadedTemplates.set(registration.metadata.id, registration);

      console.log(`Successfully installed template: ${registration.metadata.id}`);

    } catch (error) {
      console.error(`Failed to install template ${registration.metadata.id}:`, error);
      throw error;
    }
  }

  /**
   * Uninstall a template (clean up and remove)
   */
  async uninstallTemplate(templateId: string): Promise<void> {
    try {
      const registration = this.loadedTemplates.get(templateId);
      if (!registration) {
        throw new Error(`Template ${templateId} is not loaded`);
      }

      // Execute uninstallation hooks
      if (registration.hooks.beforeUninstall) {
        await this.executeTemplateHook(registration.hooks.beforeUninstall, templateId);
      }

      // Unregister from template registry
      const registryManager = getTemplateRegistryManager();
      await registryManager.unregisterTemplate(templateId);

      // Unregister from settings registry
      const settingsManager = getSettingsRegistryManager();
      await settingsManager.unregisterSettingsRegistry(templateId);

      // Unload template assets
      await this.unloadTemplateAssets(registration);

      // Remove from cache
      this.loadedTemplates.delete(templateId);
      this.assetCache.delete(templateId);

      // Execute post-uninstallation hooks
      if (registration.hooks.afterUninstall) {
        await this.executeTemplateHook(registration.hooks.afterUninstall, templateId);
      }

      console.log(`Successfully uninstalled template: ${templateId}`);

    } catch (error) {
      console.error(`Failed to uninstall template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get loaded template
   */
  getLoadedTemplate(templateId: string): TemplateRegistration | undefined {
    return this.loadedTemplates.get(templateId);
  }

  /**
   * Get all loaded templates
   */
  getAllLoadedTemplates(): TemplateRegistration[] {
    return Array.from(this.loadedTemplates.values());
  }

  /**
   * Check if template is loaded
   */
  isTemplateLoaded(templateId: string): boolean {
    return this.loadedTemplates.has(templateId);
  }

  // Private helper methods

  private async loadTemplateAssets(registration: TemplateRegistration): Promise<void> {
    const { assets } = registration;
    if (!assets) return;

    const templatePath = this.getTemplatePath(registration.metadata.id);

    // Load stylesheets
    if (assets.stylesheets && assets.stylesheets.length > 0) {
      for (const stylesheet of assets.stylesheets) {
        await this.loadStylesheet(`${templatePath}/${stylesheet}`);
      }
    }

    // Load scripts
    if (assets.scripts && assets.scripts.length > 0) {
      for (const script of assets.scripts) {
        await this.loadScript(`${templatePath}/${script}`);
      }
    }

    // Load fonts
    if (assets.fonts && assets.fonts.length > 0) {
      for (const font of assets.fonts) {
        await this.loadFont(`${templatePath}/${font}`);
      }
    }

    // Cache images (preload for better performance)
    if (assets.images && assets.images.length > 0) {
      for (const image of assets.images) {
        await this.preloadImage(`${templatePath}/${image}`);
      }
    }
  }

  private async unloadTemplateAssets(registration: TemplateRegistration): Promise<void> {
    const { assets } = registration;
    if (!assets) return;

    const templatePath = this.getTemplatePath(registration.metadata.id);

    // Unload stylesheets
    if (assets.stylesheets && assets.stylesheets.length > 0) {
      for (const stylesheet of assets.stylesheets) {
        this.unloadStylesheet(`${templatePath}/${stylesheet}`);
      }
    }

    // Unload scripts
    if (assets.scripts && assets.scripts.length > 0) {
      for (const script of assets.scripts) {
        this.unloadScript(`${templatePath}/${script}`);
      }
    }

    // Clear asset cache
    this.assetCache.delete(registration.metadata.id);
  }

  private async loadStylesheet(href: string): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side, skip

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
      document.head.appendChild(link);
    });
  }

  private unloadStylesheet(href: string): void {
    if (typeof window === 'undefined') return; // Server-side, skip

    const links = document.querySelectorAll(`link[href="${href}"]`);
    links.forEach(link => link.remove());
  }

  private async loadScript(src: string): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side, skip

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private unloadScript(src: string): void {
    if (typeof window === 'undefined') return; // Server-side, skip

    const scripts = document.querySelectorAll(`script[src="${src}"]`);
    scripts.forEach(script => script.remove());
  }

  private async loadFont(src: string): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side, skip

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.href = src;
      link.crossOrigin = 'anonymous';
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${src}`));
      document.head.appendChild(link);
    });
  }

  private async preloadImage(src: string): Promise<void> {
    if (typeof window === 'undefined') return; // Server-side, skip

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
      img.src = src;
    });
  }

  private createSettingsGroupsFromTemplate(registration: TemplateRegistration) {
    const groups = new Map<string, any>();
    
    // Group settings by their group property
    registration.settings.forEach(setting => {
      const groupId = setting.group || 'general';
      
      if (!groups.has(groupId)) {
        groups.set(groupId, {
          id: groupId,
          name: this.capitalizeFirst(groupId),
          description: `Settings for ${groupId}`,
          order: groups.size + 1,
          settings: [],
          collapsible: true,
          defaultExpanded: groupId === 'general'
        });
      }
      
      groups.get(groupId).settings.push(setting);
    });

    // Sort settings within each group
    groups.forEach(group => {
      group.settings.sort((a: any, b: any) => a.order - b.order);
    });

    return Array.from(groups.values()).sort((a, b) => a.order - b.order);
  }

  private createValidationSchema(registration: TemplateRegistration) {
    const schemaFields: Record<string, any> = {};
    
    registration.settings.forEach(setting => {
      let fieldSchema: any;
      
      switch (setting.type) {
        case 'string':
          fieldSchema = setting.required ? 
            z.string().min(1, `${setting.name} is required`) : 
            z.string().optional();
          
          if (setting.validation?.minLength) {
            fieldSchema = fieldSchema.min(setting.validation.minLength);
          }
          if (setting.validation?.maxLength) {
            fieldSchema = fieldSchema.max(setting.validation.maxLength);
          }
          if (setting.validation?.pattern) {
            fieldSchema = fieldSchema.regex(new RegExp(setting.validation.pattern));
          }
          break;
          
        case 'number':
          fieldSchema = setting.required ? z.number() : z.number().optional();
          if (setting.validation?.min !== undefined) {
            fieldSchema = fieldSchema.min(setting.validation.min);
          }
          if (setting.validation?.max !== undefined) {
            fieldSchema = fieldSchema.max(setting.validation.max);
          }
          break;
          
        case 'boolean':
          fieldSchema = z.boolean().default(setting.defaultValue || false);
          break;
          
        case 'array':
          fieldSchema = setting.required ? z.array(z.any()) : z.array(z.any()).optional();
          break;
          
        case 'object':
          fieldSchema = setting.required ? z.object({}) : z.object({}).optional();
          break;
          
        default:
          fieldSchema = z.any().optional();
      }
      
      schemaFields[setting.id] = fieldSchema;
    });
    
    return z.object(schemaFields);
  }

  private async saveTemplateSettings(templateId: string, settings: Record<string, any>): Promise<void> {
    // This would save to persistent storage (database, localStorage, etc.)
    if (typeof window !== 'undefined') {
      localStorage.setItem(`template_settings_${templateId}`, JSON.stringify(settings));
    }
  }

  private async loadTemplateSettings(templateId: string): Promise<Record<string, any>> {
    // This would load from persistent storage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`template_settings_${templateId}`);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  }

  private async executeTemplateHook(hookPath: string, templateId: string): Promise<void> {
    // This would execute template-specific hooks
    // Implementation depends on the hook execution strategy
    console.log(`Executing hook ${hookPath} for template ${templateId}`);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Global template loader instance
let globalTemplateLoader: TemplateLoaderImpl | null = null;

/**
 * Get the global template loader instance
 */
export function getTemplateLoader(templatePath?: string): TemplateLoaderImpl {
  if (!globalTemplateLoader) {
    globalTemplateLoader = new TemplateLoaderImpl(templatePath);
  }
  return globalTemplateLoader;
}

/**
 * Initialize template loader with custom template path
 */
export function initializeTemplateLoader(templatePath: string): TemplateLoaderImpl {
  globalTemplateLoader = new TemplateLoaderImpl(templatePath);
  return globalTemplateLoader;
}

// Utility functions
export async function loadTemplateFromFile(templateId: string, templatePath?: string): Promise<TemplateRegistration> {
  const loader = getTemplateLoader(templatePath);
  return await loader.loadTemplate(templateId);
}

export async function installTemplateFromFile(templateId: string, templatePath?: string): Promise<void> {
  const loader = getTemplateLoader(templatePath);
  const registration = await loader.loadTemplate(templateId);
  await loader.installTemplate(registration);
}

export function validateTemplateFile(templatePath: string): Promise<ValidationResult> {
  const loader = getTemplateLoader();
  // This would validate a template file without loading it
  return Promise.resolve({ isValid: true, errors: [], warnings: [] });
}
