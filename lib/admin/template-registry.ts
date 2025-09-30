/**
 * @fileoverview Template Registration and Management System - HT-032.1.2
 * @module lib/admin/template-registry
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Template registration and management system that handles template lifecycle,
 * installation, validation, and integration with the modular admin interface.
 */

import { z } from 'zod';
import {
  TemplateRegistration,
  TemplateRegistrationSchema,
  TemplateInstance,
  TemplateStatus,
  TemplateManager,
  TemplateEvent,
  TemplateValidationResult,
  TemplateRegistryConfig,
  DEFAULT_TEMPLATE_REGISTRY_CONFIG,
  TemplateSearchParams,
  TemplateSearchResult,
  ValidationResult
} from '@/types/admin/template-registry';
import { getNavigationManager } from './navigation';

/**
 * Template Registry Manager Class
 * Manages template registration, installation, and lifecycle operations
 */
export class TemplateRegistryManager implements TemplateManager {
  private templates: Map<string, TemplateRegistration> = new Map();
  private instances: Map<string, TemplateInstance> = new Map();
  private config: TemplateRegistryConfig;
  private eventListeners: Array<(event: TemplateEvent) => void> = [];
  private validationCache: Map<string, TemplateValidationResult> = new Map();

  constructor(config: Partial<TemplateRegistryConfig> = {}) {
    this.config = { ...DEFAULT_TEMPLATE_REGISTRY_CONFIG, ...config };
    this.initializeCoreTemplates();
  }

  /**
   * Initialize core system templates
   */
  private initializeCoreTemplates(): void {
    // Core templates are always available
    const coreTemplates = [
      'admin-dashboard',
      'user-management', 
      'system-settings',
      'analytics',
      'security'
    ];

    coreTemplates.forEach(templateId => {
      const instance: TemplateInstance = {
        id: templateId,
        templateId,
        status: TemplateStatus.INSTALLED,
        installedAt: new Date(),
        updatedAt: new Date(),
        settings: {},
        version: '1.0.0',
        enabled: true
      };
      this.instances.set(templateId, instance);
    });
  }

  /**
   * Register a new template
   */
  async registerTemplate(registration: TemplateRegistration): Promise<void> {
    try {
      // Validate the registration
      const validation = await this.validateTemplateRegistration(registration);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Check for conflicts
      await this.checkTemplateConflicts(registration);

      // Store the template
      this.templates.set(registration.metadata.id, registration);

      // Clear validation cache
      this.validationCache.delete(registration.metadata.id);

      // Emit registration event
      this.emitEvent({
        type: 'install',
        templateId: registration.metadata.id,
        timestamp: new Date(),
        data: { registration }
      });

      // Auto-install if configured
      if (this.config.autoInstall) {
        await this.installTemplate(registration.metadata.id);
      }

    } catch (error) {
      this.emitEvent({
        type: 'error',
        templateId: registration.metadata.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Unregister a template
   */
  async unregisterTemplate(templateId: string): Promise<void> {
    try {
      // Check if template is installed
      const instance = this.instances.get(templateId);
      if (instance && instance.status === TemplateStatus.INSTALLED) {
        await this.uninstallTemplate(templateId);
      }

      // Remove from registry
      this.templates.delete(templateId);
      this.instances.delete(templateId);
      this.validationCache.delete(templateId);

      // Emit unregistration event
      this.emitEvent({
        type: 'uninstall',
        templateId,
        timestamp: new Date()
      });

    } catch (error) {
      this.emitEvent({
        type: 'error',
        templateId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): TemplateRegistration | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all registered templates
   */
  getAllTemplates(): TemplateRegistration[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get installed template instances
   */
  getInstalledTemplates(): TemplateInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.status === TemplateStatus.INSTALLED
    );
  }

  /**
   * Install a template
   */
  async installTemplate(templateId: string): Promise<void> {
    const registration = this.templates.get(templateId);
    if (!registration) {
      throw new Error(`Template ${templateId} not found in registry`);
    }

    const existingInstance = this.instances.get(templateId);
    if (existingInstance && existingInstance.status === TemplateStatus.INSTALLED) {
      throw new Error(`Template ${templateId} is already installed`);
    }

    try {
      // Update status to installing
      if (existingInstance) {
        existingInstance.status = TemplateStatus.INSTALLING;
      } else {
        const newInstance: TemplateInstance = {
          id: templateId,
          templateId,
          status: TemplateStatus.INSTALLING,
          installedAt: new Date(),
          updatedAt: new Date(),
          settings: {},
          version: registration.metadata.version,
          enabled: true
        };
        this.instances.set(templateId, newInstance);
      }

      // Emit installing event
      this.emitEvent({
        type: 'install',
        templateId,
        timestamp: new Date(),
        data: { status: 'installing' }
      });

      // Validate template if configured
      if (this.config.validateOnInstall) {
        const validation = await this.validateTemplate(templateId);
        if (!validation.isValid) {
          throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Install template assets and components
      await this.installTemplateAssets(registration);

      // Register navigation items
      await this.registerTemplateNavigation(registration);

      // Initialize template settings
      await this.initializeTemplateSettings(registration);

      // Execute after-install hook
      if (registration.hooks.afterInstall) {
        await this.executeTemplateHook(registration.hooks.afterInstall, templateId);
      }

      // Update status to installed
      const instance = this.instances.get(templateId)!;
      instance.status = TemplateStatus.INSTALLED;
      instance.installedAt = new Date();
      instance.enabled = true;

      // Emit installed event
      this.emitEvent({
        type: 'install',
        templateId,
        timestamp: new Date(),
        data: { status: 'installed' }
      });

    } catch (error) {
      // Update status to error
      const instance = this.instances.get(templateId);
      if (instance) {
        instance.status = TemplateStatus.ERROR;
        instance.error = error instanceof Error ? error.message : 'Unknown error';
      }

      this.emitEvent({
        type: 'error',
        templateId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Uninstall a template
   */
  async uninstallTemplate(templateId: string): Promise<void> {
    const instance = this.instances.get(templateId);
    if (!instance || instance.status !== TemplateStatus.INSTALLED) {
      throw new Error(`Template ${templateId} is not installed`);
    }

    const registration = this.templates.get(templateId);
    if (!registration) {
      throw new Error(`Template ${templateId} not found in registry`);
    }

    try {
      // Update status to uninstalling
      instance.status = TemplateStatus.UNINSTALLING;

      // Emit uninstalling event
      this.emitEvent({
        type: 'uninstall',
        templateId,
        timestamp: new Date(),
        data: { status: 'uninstalling' }
      });

      // Execute before-uninstall hook
      if (registration.hooks.beforeUninstall) {
        await this.executeTemplateHook(registration.hooks.beforeUninstall, templateId);
      }

      // Remove navigation items
      this.unregisterTemplateNavigation(templateId);

      // Remove template assets
      await this.uninstallTemplateAssets(registration);

      // Clear template settings
      await this.clearTemplateSettings(templateId);

      // Execute after-uninstall hook
      if (registration.hooks.afterUninstall) {
        await this.executeTemplateHook(registration.hooks.afterUninstall, templateId);
      }

      // Remove instance
      this.instances.delete(templateId);

      // Emit uninstalled event
      this.emitEvent({
        type: 'uninstall',
        templateId,
        timestamp: new Date(),
        data: { status: 'uninstalled' }
      });

    } catch (error) {
      // Update status to error
      instance.status = TemplateStatus.ERROR;
      instance.error = error instanceof Error ? error.message : 'Unknown error';

      this.emitEvent({
        type: 'error',
        templateId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Update a template to a new version
   */
  async updateTemplate(templateId: string, newVersion: string): Promise<void> {
    const instance = this.instances.get(templateId);
    if (!instance || instance.status !== TemplateStatus.INSTALLED) {
      throw new Error(`Template ${templateId} is not installed`);
    }

    const registration = this.templates.get(templateId);
    if (!registration) {
      throw new Error(`Template ${templateId} not found in registry`);
    }

    try {
      // Update status to updating
      instance.status = TemplateStatus.UPDATING;

      // Emit updating event
      this.emitEvent({
        type: 'update',
        templateId,
        timestamp: new Date(),
        data: { status: 'updating', newVersion }
      });

      // Execute before-update hook
      if (registration.hooks.beforeUpdate) {
        await this.executeTemplateHook(registration.hooks.beforeUpdate, templateId);
      }

      // Backup current settings if configured
      if (this.config.backupOnUpdate) {
        await this.backupTemplateSettings(templateId);
      }

      // Update template assets
      await this.updateTemplateAssets(registration, newVersion);

      // Execute after-update hook
      if (registration.hooks.afterUpdate) {
        await this.executeTemplateHook(registration.hooks.afterUpdate, templateId);
      }

      // Update instance
      instance.version = newVersion;
      instance.updatedAt = new Date();
      instance.status = TemplateStatus.INSTALLED;

      // Emit updated event
      this.emitEvent({
        type: 'update',
        templateId,
        timestamp: new Date(),
        data: { status: 'updated', newVersion }
      });

    } catch (error) {
      // Update status to error
      instance.status = TemplateStatus.ERROR;
      instance.error = error instanceof Error ? error.message : 'Unknown error';

      this.emitEvent({
        type: 'error',
        templateId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  /**
   * Enable a template
   */
  async enableTemplate(templateId: string): Promise<void> {
    const instance = this.instances.get(templateId);
    if (!instance) {
      throw new Error(`Template ${templateId} not found`);
    }

    if (instance.status !== TemplateStatus.INSTALLED) {
      throw new Error(`Template ${templateId} must be installed before enabling`);
    }

    instance.enabled = true;

    // Emit enable event
    this.emitEvent({
      type: 'enable',
      templateId,
      timestamp: new Date()
    });
  }

  /**
   * Disable a template
   */
  async disableTemplate(templateId: string): Promise<void> {
    const instance = this.instances.get(templateId);
    if (!instance) {
      throw new Error(`Template ${templateId} not found`);
    }

    instance.enabled = false;

    // Emit disable event
    this.emitEvent({
      type: 'disable',
      templateId,
      timestamp: new Date()
    });
  }

  /**
   * Validate a template
   */
  async validateTemplate(templateId: string): Promise<TemplateValidationResult> {
    // Check cache first
    const cached = this.validationCache.get(templateId);
    if (cached) {
      return cached;
    }

    const registration = this.templates.get(templateId);
    if (!registration) {
      return {
        templateId,
        isValid: false,
        errors: ['Template not found in registry'],
        warnings: [],
        issues: [{
          type: 'error',
          field: 'templateId',
          message: 'Template not found in registry'
        }]
      };
    }

    const validation = await this.validateTemplateRegistration(registration);
    const result: TemplateValidationResult = {
      templateId,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      issues: []
    };

    // Add specific issues
    if (!validation.isValid) {
      result.issues.push({
        type: 'error',
        field: 'general',
        message: 'Template validation failed'
      });
    }

    // Cache the result
    this.validationCache.set(templateId, result);

    return result;
  }

  /**
   * Search templates
   */
  async searchTemplates(params: TemplateSearchParams): Promise<TemplateSearchResult> {
    let templates = Array.from(this.templates.values());

    // Apply filters
    if (params.query) {
      const query = params.query.toLowerCase();
      templates = templates.filter(template => 
        template.metadata.name.toLowerCase().includes(query) ||
        template.metadata.description.toLowerCase().includes(query) ||
        template.metadata.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (params.category) {
      templates = templates.filter(template => template.metadata.category === params.category);
    }

    if (params.tags && params.tags.length > 0) {
      templates = templates.filter(template => 
        params.tags!.some(tag => template.metadata.tags.includes(tag))
      );
    }

    if (params.author) {
      templates = templates.filter(template => template.metadata.author === params.author);
    }

    if (params.installed !== undefined) {
      templates = templates.filter(template => {
        const instance = this.instances.get(template.metadata.id);
        return params.installed ? 
          (instance?.status === TemplateStatus.INSTALLED) : 
          (!instance || instance.status !== TemplateStatus.INSTALLED);
      });
    }

    if (params.enabled !== undefined) {
      templates = templates.filter(template => {
        const instance = this.instances.get(template.metadata.id);
        return instance?.enabled === params.enabled;
      });
    }

    // Apply sorting
    if (params.sortBy) {
      templates.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (params.sortBy) {
          case 'name':
            aValue = a.metadata.name;
            bValue = b.metadata.name;
            break;
          case 'version':
            aValue = a.metadata.version;
            bValue = b.metadata.version;
            break;
          case 'installedAt':
            aValue = this.instances.get(a.metadata.id)?.installedAt || new Date(0);
            bValue = this.instances.get(b.metadata.id)?.installedAt || new Date(0);
            break;
          case 'updatedAt':
            aValue = this.instances.get(a.metadata.id)?.updatedAt || new Date(0);
            bValue = this.instances.get(b.metadata.id)?.updatedAt || new Date(0);
            break;
          default:
            return 0;
        }

        if (params.sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });
    }

    // Apply pagination
    const total = templates.length;
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    const page = Math.floor(offset / limit) + 1;
    const hasMore = offset + limit < total;

    templates = templates.slice(offset, offset + limit);

    return {
      templates,
      total,
      page,
      limit,
      hasMore
    };
  }

  /**
   * Subscribe to template events
   */
  subscribe(listener: (event: TemplateEvent) => void): () => void {
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
  getConfig(): TemplateRegistryConfig {
    return { ...this.config };
  }

  /**
   * Update registry configuration
   */
  updateConfig(updates: Partial<TemplateRegistryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Private helper methods

  private async validateTemplateRegistration(registration: TemplateRegistration): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Validate using Zod schema
      TemplateRegistrationSchema.parse(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown validation error');
      }
    }

    // Check category is allowed
    if (!this.config.allowedCategories.includes(registration.metadata.category)) {
      warnings.push(`Category '${registration.metadata.category}' is not in allowed categories`);
    }

    // Check if template is blocked
    if (this.config.blockedTemplates.includes(registration.metadata.id)) {
      errors.push(`Template '${registration.metadata.id}' is blocked`);
    }

    // Check author trust level
    if (!this.config.trustedAuthors.includes(registration.metadata.author)) {
      warnings.push(`Author '${registration.metadata.author}' is not in trusted authors list`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private async checkTemplateConflicts(registration: TemplateRegistration): Promise<void> {
    // Check for conflicting templates
    for (const conflictId of registration.metadata.conflicts) {
      const conflictInstance = this.instances.get(conflictId);
      if (conflictInstance && conflictInstance.status === TemplateStatus.INSTALLED) {
        throw new Error(`Template ${registration.metadata.id} conflicts with installed template ${conflictId}`);
      }
    }

    // Check dependencies
    for (const dependencyId of registration.metadata.dependencies) {
      const dependencyInstance = this.instances.get(dependencyId);
      if (!dependencyInstance || dependencyInstance.status !== TemplateStatus.INSTALLED) {
        throw new Error(`Template ${registration.metadata.id} requires dependency ${dependencyId} to be installed`);
      }
    }
  }

  private async installTemplateAssets(registration: TemplateRegistration): Promise<void> {
    // This would handle loading CSS, JS, and other assets
    // Implementation depends on the specific asset loading strategy
    console.log(`Installing assets for template ${registration.metadata.id}`);
  }

  private async uninstallTemplateAssets(registration: TemplateRegistration): Promise<void> {
    // This would handle unloading CSS, JS, and other assets
    console.log(`Uninstalling assets for template ${registration.metadata.id}`);
  }

  private async updateTemplateAssets(registration: TemplateRegistration, newVersion: string): Promise<void> {
    // This would handle updating assets to new version
    console.log(`Updating assets for template ${registration.metadata.id} to version ${newVersion}`);
  }

  private async registerTemplateNavigation(registration: TemplateRegistration): Promise<void> {
    const navigationManager = getNavigationManager();
    
    if (registration.navigation.length > 0) {
      navigationManager.registerTemplateNavigation(
        registration.metadata.id,
        registration.navigation.map(nav => ({
          id: nav.id,
          label: nav.label,
          description: nav.description,
          href: nav.href,
          enabled: true,
          order: nav.order,
          section: 'template',
          permissions: nav.permissions
        }))
      );
    }
  }

  private unregisterTemplateNavigation(templateId: string): void {
    const navigationManager = getNavigationManager();
    navigationManager.unregisterTemplateNavigation(templateId);
  }

  private async initializeTemplateSettings(registration: TemplateRegistration): Promise<void> {
    const instance = this.instances.get(registration.metadata.id);
    if (instance) {
      // Initialize with default values
      const defaultSettings: Record<string, any> = {};
      
      registration.settings.forEach(setting => {
        if (setting.defaultValue !== undefined) {
          defaultSettings[setting.id] = setting.defaultValue;
        }
      });

      instance.settings = defaultSettings;
    }
  }

  private async clearTemplateSettings(templateId: string): Promise<void> {
    const instance = this.instances.get(templateId);
    if (instance) {
      instance.settings = {};
    }
  }

  private async backupTemplateSettings(templateId: string): Promise<void> {
    // Implementation would backup settings before update
    console.log(`Backing up settings for template ${templateId}`);
  }

  private async executeTemplateHook(hookPath: string, templateId: string): Promise<void> {
    // This would execute template-specific hooks
    console.log(`Executing hook ${hookPath} for template ${templateId}`);
  }

  private emitEvent(event: TemplateEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in template event listener:', error);
      }
    });
  }
}

// Global template registry manager instance
let globalTemplateRegistryManager: TemplateRegistryManager | null = null;

/**
 * Get the global template registry manager instance
 */
export function getTemplateRegistryManager(config?: Partial<TemplateRegistryConfig>): TemplateRegistryManager {
  if (!globalTemplateRegistryManager) {
    globalTemplateRegistryManager = new TemplateRegistryManager(config);
  }
  return globalTemplateRegistryManager;
}

/**
 * Initialize template registry manager with custom configuration
 */
export function initializeTemplateRegistry(config?: Partial<TemplateRegistryConfig>): TemplateRegistryManager {
  globalTemplateRegistryManager = new TemplateRegistryManager(config);
  return globalTemplateRegistryManager;
}

// Utility functions
export function createTemplateRegistration(
  id: string,
  name: string,
  description: string,
  version: string = '1.0.0'
): Partial<TemplateRegistration> {
  return {
    metadata: {
      id,
      name,
      description,
      version,
      author: 'System',
      authorEmail: 'system@example.com',
      category: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    settings: [],
    navigation: [],
    components: {},
    hooks: {},
    assets: {}
  };
}

export function validateTemplateId(templateId: string): boolean {
  return /^[a-z0-9-]+$/.test(templateId) && templateId.length >= 3 && templateId.length <= 50;
}

export function sanitizeTemplateId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
