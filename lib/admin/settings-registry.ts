/**
 * @fileoverview Dynamic Settings Registry System - HT-032.1.2
 * @module lib/admin/settings-registry
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Dynamic settings registry system that manages template-specific settings,
 * validation, persistence, and real-time updates for the modular admin interface.
 */

import { z } from 'zod';
import { 
  SettingsRegistry, 
  SettingsGroup, 
  TemplateSettings,
  TemplateSettingsValue,
  SettingsEvent,
  ValidationResult,
  SettingsRegistryConfig,
  DEFAULT_SETTINGS_REGISTRY_CONFIG,
  SettingsUpdateCallback,
  SettingsEventCallback
} from '@/types/admin/template-registry';
import { getCoreSettingsManager } from './core-settings';

/**
 * Dynamic Settings Registry Manager Class
 * Manages template-specific settings with dynamic registration and validation
 */
export class SettingsRegistryManager {
  private registries: Map<string, SettingsRegistry> = new Map();
  private settingsCache: Map<string, Record<string, any>> = new Map();
  private config: SettingsRegistryConfig;
  private eventListeners: Array<(event: SettingsEvent) => void> = [];
  private validationCache: Map<string, ValidationResult> = new Map();
  private autoSaveTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: Partial<SettingsRegistryConfig> = {}) {
    this.config = { ...DEFAULT_SETTINGS_REGISTRY_CONFIG, ...config };
    this.initializeCoreSettings();
  }

  /**
   * Initialize core system settings
   */
  private initializeCoreSettings(): void {
    // Core settings are always available
    const coreSettingsRegistry: SettingsRegistry = {
      templateId: 'core',
      groups: [
        {
          id: 'general',
          name: 'General',
          description: 'General system settings',
          order: 1,
          settings: [],
          collapsible: false,
          defaultExpanded: true
        },
        {
          id: 'security',
          name: 'Security',
          description: 'Security and access control settings',
          order: 2,
          settings: [],
          collapsible: true,
          defaultExpanded: false
        },
        {
          id: 'notifications',
          name: 'Notifications',
          description: 'Notification preferences and settings',
          order: 3,
          settings: [],
          collapsible: true,
          defaultExpanded: false
        },
        {
          id: 'branding',
          name: 'Branding',
          description: 'Brand customization and white-labeling',
          order: 4,
          settings: [],
          collapsible: true,
          defaultExpanded: false
        },
        {
          id: 'system',
          name: 'System',
          description: 'System performance and maintenance',
          order: 5,
          settings: [],
          collapsible: true,
          defaultExpanded: false
        }
      ],
      validation: z.object({}),
      hooks: {
        onSave: async (settings) => {
          const coreSettingsManager = getCoreSettingsManager();
          await coreSettingsManager.updateSettings(settings);
        },
        onLoad: async () => {
          const coreSettingsManager = getCoreSettingsManager();
          return coreSettingsManager.getSettings();
        }
      }
    };

    this.registries.set('core', coreSettingsRegistry);
  }

  /**
   * Register a settings registry for a template
   */
  async registerSettingsRegistry(registry: SettingsRegistry): Promise<void> {
    try {
      // Validate the registry
      const validation = await this.validateSettingsRegistry(registry);
      if (!validation.isValid) {
        throw new Error(`Settings registry validation failed: ${validation.errors.join(', ')}`);
      }

      // Store the registry
      this.registries.set(registry.templateId, registry);

      // Load initial settings
      if (registry.hooks.onLoad) {
        const settings = await registry.hooks.onLoad();
        this.settingsCache.set(registry.templateId, settings);
      }

      // Clear validation cache
      this.validationCache.delete(registry.templateId);

      console.log(`Registered settings registry for template: ${registry.templateId}`);

    } catch (error) {
      console.error(`Failed to register settings registry for template ${registry.templateId}:`, error);
      throw error;
    }
  }

  /**
   * Unregister a settings registry
   */
  async unregisterSettingsRegistry(templateId: string): Promise<void> {
    try {
      // Clear auto-save timeout
      const timeout = this.autoSaveTimeouts.get(templateId);
      if (timeout) {
        clearTimeout(timeout);
        this.autoSaveTimeouts.delete(templateId);
      }

      // Remove from registry
      this.registries.delete(templateId);
      this.settingsCache.delete(templateId);
      this.validationCache.delete(templateId);

      console.log(`Unregistered settings registry for template: ${templateId}`);

    } catch (error) {
      console.error(`Failed to unregister settings registry for template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Get settings registry for a template
   */
  getSettingsRegistry(templateId: string): SettingsRegistry | undefined {
    return this.registries.get(templateId);
  }

  /**
   * Get all registered settings registries
   */
  getAllSettingsRegistries(): SettingsRegistry[] {
    return Array.from(this.registries.values());
  }

  /**
   * Get settings groups for a template
   */
  getSettingsGroups(templateId: string): SettingsGroup[] {
    const registry = this.registries.get(templateId);
    if (!registry) {
      return [];
    }

    return registry.groups.sort((a, b) => a.order - b.order);
  }

  /**
   * Get all settings for a template
   */
  async getSettings(templateId: string): Promise<Record<string, any>> {
    // Check cache first
    const cached = this.settingsCache.get(templateId);
    if (cached && this.config.cacheSettings) {
      return cached;
    }

    // Load from registry hook
    const registry = this.registries.get(templateId);
    if (!registry) {
      throw new Error(`Settings registry not found for template: ${templateId}`);
    }

    let settings: Record<string, any> = {};

    if (registry.hooks.onLoad) {
      try {
        settings = await registry.hooks.onLoad();
      } catch (error) {
        console.error(`Failed to load settings for template ${templateId}:`, error);
        settings = {};
      }
    }

    // Cache the settings
    if (this.config.cacheSettings) {
      this.settingsCache.set(templateId, settings);
    }

    return settings;
  }

  /**
   * Update a specific setting
   */
  async updateSetting(
    templateId: string, 
    settingId: string, 
    value: TemplateSettingsValue
  ): Promise<ValidationResult> {
    try {
      // Get current settings
      const settings = await this.getSettings(templateId);
      const oldValue = settings[settingId];

      // Update the setting
      settings[settingId] = value;

      // Validate if configured
      let validation: ValidationResult = { isValid: true, errors: [], warnings: [] };
      
      if (this.config.validateOnChange) {
        validation = await this.validateSettings(templateId, settings);
        
        if (!validation.isValid) {
          // Revert the change
          settings[settingId] = oldValue;
          return validation;
        }
      }

      // Update cache
      if (this.config.cacheSettings) {
        this.settingsCache.set(templateId, settings);
      }

      // Emit update event
      this.emitEvent({
        type: 'update',
        templateId,
        settingId,
        oldValue,
        newValue: value,
        timestamp: new Date()
      });

      // Auto-save if configured
      if (this.config.autoSave) {
        this.scheduleAutoSave(templateId);
      }

      return validation;

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * Update multiple settings
   */
  async updateSettings(
    templateId: string, 
    updates: Record<string, TemplateSettingsValue>
  ): Promise<ValidationResult> {
    try {
      // Get current settings
      const settings = await this.getSettings(templateId);
      const oldSettings = { ...settings };

      // Update all settings
      Object.entries(updates).forEach(([key, value]) => {
        settings[key] = value;
      });

      // Validate if configured
      let validation: ValidationResult = { isValid: true, errors: [], warnings: [] };
      
      if (this.config.validateOnChange) {
        validation = await this.validateSettings(templateId, settings);
        
        if (!validation.isValid) {
          // Revert all changes
          Object.assign(settings, oldSettings);
          return validation;
        }
      }

      // Update cache
      if (this.config.cacheSettings) {
        this.settingsCache.set(templateId, settings);
      }

      // Emit update events for each changed setting
      Object.entries(updates).forEach(([settingId, newValue]) => {
        const oldValue = oldSettings[settingId];
        if (oldValue !== newValue) {
          this.emitEvent({
            type: 'update',
            templateId,
            settingId,
            oldValue,
            newValue,
            timestamp: new Date()
          });
        }
      });

      // Auto-save if configured
      if (this.config.autoSave) {
        this.scheduleAutoSave(templateId);
      }

      return validation;

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * Save settings for a template
   */
  async saveSettings(templateId: string): Promise<ValidationResult> {
    try {
      // Clear auto-save timeout
      const timeout = this.autoSaveTimeouts.get(templateId);
      if (timeout) {
        clearTimeout(timeout);
        this.autoSaveTimeouts.delete(templateId);
      }

      // Get current settings
      const settings = await this.getSettings(templateId);

      // Validate settings
      const validation = await this.validateSettings(templateId, settings);
      if (!validation.isValid) {
        return validation;
      }

      // Save via registry hook
      const registry = this.registries.get(templateId);
      if (registry && registry.hooks.onSave) {
        await registry.hooks.onSave(settings);
      }

      // Emit save event
      this.emitEvent({
        type: 'save',
        templateId,
        settingId: 'all',
        timestamp: new Date()
      });

      return validation;

    } catch (error) {
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
    }
  }

  /**
   * Validate settings for a template
   */
  async validateSettings(templateId: string, settings: Record<string, any>): Promise<ValidationResult> {
    // Check cache first
    const cacheKey = `${templateId}:${JSON.stringify(settings)}`;
    const cached = this.validationCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const registry = this.registries.get(templateId);
    if (!registry) {
      return {
        isValid: false,
        errors: [`Settings registry not found for template: ${templateId}`],
        warnings: []
      };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate using registry schema
      registry.validation.parse(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown validation error');
      }
    }

    // Validate individual settings
    const allSettings = registry.groups.flatMap(group => group.settings);
    
    for (const setting of allSettings) {
      const value = settings[setting.id];

      // Check required settings
      if (setting.required && (value === undefined || value === null || value === '')) {
        errors.push(`Setting '${setting.name}' is required`);
        continue;
      }

      // Type validation
      if (value !== undefined && value !== null) {
        const typeValidation = this.validateSettingType(setting, value);
        if (!typeValidation.isValid) {
          errors.push(...typeValidation.errors);
        }
        warnings.push(...typeValidation.warnings);
      }

      // Custom validation
      if (setting.validation) {
        const customValidation = this.validateCustomRules(setting, value);
        if (!customValidation.isValid) {
          errors.push(...customValidation.errors);
        }
      }

      // Conditional validation
      if (setting.conditional) {
        const conditionalValidation = this.validateConditionalSetting(setting, settings);
        if (!conditionalValidation.isValid) {
          errors.push(...conditionalValidation.errors);
        }
      }
    }

    // Custom validation hook
    if (registry.hooks.onValidate) {
      try {
        const customValid = await registry.hooks.onValidate(settings);
        if (!customValid) {
          errors.push('Custom validation failed');
        }
      } catch (error) {
        errors.push('Custom validation error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }

    const result: ValidationResult = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    // Cache the result
    this.validationCache.set(cacheKey, result);

    return result;
  }

  /**
   * Get a specific setting value
   */
  async getSetting(templateId: string, settingId: string): Promise<TemplateSettingsValue> {
    const settings = await this.getSettings(templateId);
    return settings[settingId];
  }

  /**
   * Reset settings to defaults for a template
   */
  async resetSettingsToDefaults(templateId: string): Promise<void> {
    const registry = this.registries.get(templateId);
    if (!registry) {
      throw new Error(`Settings registry not found for template: ${templateId}`);
    }

    const defaultSettings: Record<string, any> = {};
    
    registry.groups.forEach(group => {
      group.settings.forEach(setting => {
        if (setting.defaultValue !== undefined) {
          defaultSettings[setting.id] = setting.defaultValue;
        }
      });
    });

    await this.updateSettings(templateId, defaultSettings);
    await this.saveSettings(templateId);
  }

  /**
   * Export settings for a template
   */
  async exportSettings(templateId: string): Promise<string> {
    const settings = await this.getSettings(templateId);
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings for a template
   */
  async importSettings(templateId: string, json: string): Promise<ValidationResult> {
    try {
      const settings = JSON.parse(json);
      return await this.updateSettings(templateId, settings);
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid JSON format'],
        warnings: []
      };
    }
  }

  /**
   * Subscribe to settings events
   */
  subscribe(listener: SettingsEventCallback): () => void {
    this.eventListeners.push(listener);
    
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index > -1) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get registry configuration
   */
  getConfig(): SettingsRegistryConfig {
    return { ...this.config };
  }

  /**
   * Update registry configuration
   */
  updateConfig(updates: Partial<SettingsRegistryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Private helper methods

  private async validateSettingsRegistry(registry: SettingsRegistry): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate template ID
    if (!registry.templateId || registry.templateId.trim() === '') {
      errors.push('Template ID is required');
    }

    // Validate groups
    if (!registry.groups || registry.groups.length === 0) {
      warnings.push('No settings groups defined');
    }

    // Validate settings in groups
    const allSettings = registry.groups.flatMap(group => group.settings);
    const settingIds = new Set<string>();

    for (const setting of allSettings) {
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
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateSettingType(setting: TemplateSettings, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    switch (setting.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`Setting '${setting.name}' must be a string`);
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`Setting '${setting.name}' must be a number`);
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`Setting '${setting.name}' must be a boolean`);
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`Setting '${setting.name}' must be an array`);
        }
        break;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          errors.push(`Setting '${setting.name}' must be an object`);
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateCustomRules(setting: TemplateSettings, value: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!setting.validation) {
      return { isValid: true, errors, warnings };
    }

    const validation = setting.validation;

    // String length validation
    if (typeof value === 'string') {
      if (validation.minLength && value.length < validation.minLength) {
        errors.push(`Setting '${setting.name}' must be at least ${validation.minLength} characters`);
      }
      if (validation.maxLength && value.length > validation.maxLength) {
        errors.push(`Setting '${setting.name}' must be no more than ${validation.maxLength} characters`);
      }
      if (validation.pattern && !new RegExp(validation.pattern).test(value)) {
        errors.push(`Setting '${setting.name}' does not match required pattern`);
      }
    }

    // Numeric validation
    if (typeof value === 'number') {
      if (validation.min !== undefined && value < validation.min) {
        errors.push(`Setting '${setting.name}' must be at least ${validation.min}`);
      }
      if (validation.max !== undefined && value > validation.max) {
        errors.push(`Setting '${setting.name}' must be no more than ${validation.max}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private validateConditionalSetting(setting: TemplateSettings, allSettings: Record<string, any>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!setting.conditional) {
      return { isValid: true, errors, warnings };
    }

    const { field, operator, value: conditionalValue } = setting.conditional;
    const fieldValue = allSettings[field];

    let conditionMet = false;

    switch (operator) {
      case 'equals':
        conditionMet = fieldValue === conditionalValue;
        break;
      case 'not_equals':
        conditionMet = fieldValue !== conditionalValue;
        break;
      case 'contains':
        conditionMet = Array.isArray(fieldValue) && fieldValue.includes(conditionalValue);
        break;
      case 'not_contains':
        conditionMet = !Array.isArray(fieldValue) || !fieldValue.includes(conditionalValue);
        break;
      case 'greater_than':
        conditionMet = typeof fieldValue === 'number' && fieldValue > conditionalValue;
        break;
      case 'less_than':
        conditionMet = typeof fieldValue === 'number' && fieldValue < conditionalValue;
        break;
    }

    // If condition is met and setting is required, ensure it has a value
    if (conditionMet && setting.required) {
      const settingValue = allSettings[setting.id];
      if (settingValue === undefined || settingValue === null || settingValue === '') {
        errors.push(`Setting '${setting.name}' is required when '${field}' ${operator} ${conditionalValue}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private scheduleAutoSave(templateId: string): void {
    // Clear existing timeout
    const existingTimeout = this.autoSaveTimeouts.get(templateId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule new auto-save
    const timeout = setTimeout(async () => {
      try {
        await this.saveSettings(templateId);
        this.autoSaveTimeouts.delete(templateId);
      } catch (error) {
        console.error(`Auto-save failed for template ${templateId}:`, error);
      }
    }, this.config.backupInterval);

    this.autoSaveTimeouts.set(templateId, timeout);
  }

  private emitEvent(event: SettingsEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in settings event listener:', error);
      }
    });
  }
}

// Global settings registry manager instance
let globalSettingsRegistryManager: SettingsRegistryManager | null = null;

/**
 * Get the global settings registry manager instance
 */
export function getSettingsRegistryManager(config?: Partial<SettingsRegistryConfig>): SettingsRegistryManager {
  if (!globalSettingsRegistryManager) {
    globalSettingsRegistryManager = new SettingsRegistryManager(config);
  }
  return globalSettingsRegistryManager;
}

/**
 * Initialize settings registry manager with custom configuration
 */
export function initializeSettingsRegistry(config?: Partial<SettingsRegistryConfig>): SettingsRegistryManager {
  globalSettingsRegistryManager = new SettingsRegistryManager(config);
  return globalSettingsRegistryManager;
}

// Utility functions
export function createSettingsGroup(
  id: string,
  name: string,
  settings: TemplateSettings[] = [],
  options: Partial<SettingsGroup> = {}
): SettingsGroup {
  return {
    id,
    name,
    settings,
    order: 0,
    collapsible: true,
    defaultExpanded: false,
    ...options
  };
}

export function createTemplateSetting(
  id: string,
  name: string,
  type: TemplateSettings['type'],
  options: Partial<TemplateSettings> = {}
): TemplateSettings {
  return {
    id,
    name,
    type,
    required: false,
    group: 'general',
    order: 0,
    readOnly: false,
    ...options
  };
}

export function validateSettingValue(setting: TemplateSettings, value: any): boolean {
  if (setting.required && (value === undefined || value === null || value === '')) {
    return false;
  }

  if (value === undefined || value === null) {
    return true; // Optional settings can be empty
  }

  switch (setting.type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'array':
      return Array.isArray(value);
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    default:
      return true;
  }
}
