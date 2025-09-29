/**
 * @fileoverview Component Registry and Management System - HT-032.1.4
 * @module lib/admin/component-registry
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Component registry and management system for modular admin components.
 * Provides dynamic component loading, registration, and lifecycle management.
 */

import React from 'react';
import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

// Component Registry Types
export interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  category: ComponentCategory;
  version: string;
  component: React.ComponentType<any>;
  props?: ComponentPropsSchema;
  dependencies?: string[];
  tags?: string[];
  icon?: LucideIcon;
  thumbnail?: string;
  author?: string;
  license?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentPropsSchema {
  schema: z.ZodSchema;
  defaultProps?: Record<string, any>;
  requiredProps?: string[];
  optionalProps?: string[];
}

export enum ComponentCategory {
  SETTING_INPUT = 'setting-input',
  SETTING_GROUP = 'setting-group',
  LAYOUT = 'layout',
  VALIDATION = 'validation',
  UTILITY = 'utility',
  WIDGET = 'widget',
  FORM = 'form',
  DISPLAY = 'display'
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  props: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentRegistryConfig {
  autoLoad: boolean;
  validateProps: boolean;
  enableHotReload: boolean;
  maxInstances: number;
  allowedCategories: ComponentCategory[];
  blockedComponents: string[];
}

// Component Registry Events
export interface ComponentEvent {
  type: 'register' | 'unregister' | 'load' | 'unload' | 'error';
  componentId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}

export type ComponentEventCallback = (event: ComponentEvent) => void;

// Validation Results
export interface ComponentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  componentId: string;
}

/**
 * Component Registry Manager Class
 * Manages registration, loading, and lifecycle of modular admin components
 */
export class ComponentRegistryManager {
  private components: Map<string, ComponentDefinition> = new Map();
  private instances: Map<string, ComponentInstance> = new Map();
  private config: ComponentRegistryConfig;
  private eventListeners: ComponentEventCallback[] = [];
  private loadedComponents: Set<string> = new Set();

  constructor(config: Partial<ComponentRegistryConfig> = {}) {
    this.config = {
      autoLoad: true,
      validateProps: true,
      enableHotReload: false,
      maxInstances: 1000,
      allowedCategories: Object.values(ComponentCategory),
      blockedComponents: [],
      ...config
    };

    this.initializeBuiltInComponents();
  }

  /**
   * Initialize built-in components
   */
  private async initializeBuiltInComponents(): Promise<void> {
    try {
      // Register built-in setting input components
      await this.registerBuiltInSettingInputs();
      
      // Register built-in setting group components
      await this.registerBuiltInSettingGroups();
      
      // Register built-in layout components
      await this.registerBuiltInLayouts();
      
      // Register built-in validation components
      await this.registerBuiltInValidation();

    } catch (error) {
      console.error('Failed to initialize built-in components:', error);
    }
  }

  /**
   * Register a component definition
   */
  async registerComponent(definition: ComponentDefinition): Promise<void> {
    try {
      // Validate component definition
      const validation = await this.validateComponentDefinition(definition);
      if (!validation.isValid) {
        throw new Error(`Component validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if component is blocked
      if (this.config.blockedComponents.includes(definition.id)) {
        throw new Error(`Component ${definition.id} is blocked`);
      }

      // Check category allowlist
      if (!this.config.allowedCategories.includes(definition.category)) {
        throw new Error(`Component category ${definition.category} is not allowed`);
      }

      // Register the component
      this.components.set(definition.id, definition);

      // Auto-load if configured
      if (this.config.autoLoad) {
        await this.loadComponent(definition.id);
      }

      // Emit registration event
      this.emitEvent({
        type: 'register',
        componentId: definition.id,
        timestamp: new Date(),
        data: definition
      });

      console.log(`Registered component: ${definition.id}`);

    } catch (error) {
      console.error(`Failed to register component ${definition.id}:`, error);
      throw error;
    }
  }

  /**
   * Unregister a component
   */
  async unregisterComponent(componentId: string): Promise<void> {
    try {
      // Unload component first
      await this.unloadComponent(componentId);

      // Remove from registry
      this.components.delete(componentId);

      // Remove all instances
      const instancesToRemove = Array.from(this.instances.values())
        .filter(instance => instance.componentId === componentId);

      for (const instance of instancesToRemove) {
        this.instances.delete(instance.id);
      }

      // Emit unregistration event
      this.emitEvent({
        type: 'unregister',
        componentId,
        timestamp: new Date()
      });

      console.log(`Unregistered component: ${componentId}`);

    } catch (error) {
      console.error(`Failed to unregister component ${componentId}:`, error);
      throw error;
    }
  }

  /**
   * Load a component
   */
  async loadComponent(componentId: string): Promise<void> {
    try {
      const definition = this.components.get(componentId);
      if (!definition) {
        throw new Error(`Component not found: ${componentId}`);
      }

      // Mark as loaded
      this.loadedComponents.add(componentId);

      // Emit load event
      this.emitEvent({
        type: 'load',
        componentId,
        timestamp: new Date()
      });

      console.log(`Loaded component: ${componentId}`);

    } catch (error) {
      console.error(`Failed to load component ${componentId}:`, error);
      this.emitEvent({
        type: 'error',
        componentId,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Unload a component
   */
  async unloadComponent(componentId: string): Promise<void> {
    try {
      // Mark as unloaded
      this.loadedComponents.delete(componentId);

      // Emit unload event
      this.emitEvent({
        type: 'unload',
        componentId,
        timestamp: new Date()
      });

      console.log(`Unloaded component: ${componentId}`);

    } catch (error) {
      console.error(`Failed to unload component ${componentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a component definition
   */
  getComponent(componentId: string): ComponentDefinition | undefined {
    return this.components.get(componentId);
  }

  /**
   * Get all registered components
   */
  getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  /**
   * Get components by category
   */
  getComponentsByCategory(category: ComponentCategory): ComponentDefinition[] {
    return Array.from(this.components.values())
      .filter(component => component.category === category);
  }

  /**
   * Search components
   */
  searchComponents(query: string): ComponentDefinition[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.components.values())
      .filter(component => 
        component.name.toLowerCase().includes(lowercaseQuery) ||
        component.description?.toLowerCase().includes(lowercaseQuery) ||
        component.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
      );
  }

  /**
   * Create a component instance
   */
  async createInstance(
    componentId: string, 
    props: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<ComponentInstance> {
    try {
      const definition = this.components.get(componentId);
      if (!definition) {
        throw new Error(`Component not found: ${componentId}`);
      }

      // Check instance limit
      if (this.instances.size >= this.config.maxInstances) {
        throw new Error('Maximum component instances reached');
      }

      // Validate props if configured
      if (this.config.validateProps && definition.props) {
        const validation = this.validateComponentProps(definition, props);
        if (!validation.isValid) {
          throw new Error(`Props validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Create instance
      const instance: ComponentInstance = {
        id: `${componentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        componentId,
        props: { ...definition.props?.defaultProps, ...props },
        metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store instance
      this.instances.set(instance.id, instance);

      return instance;

    } catch (error) {
      console.error(`Failed to create component instance for ${componentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a component instance
   */
  getInstance(instanceId: string): ComponentInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Update component instance props
   */
  async updateInstance(
    instanceId: string, 
    props: Record<string, any>
  ): Promise<ComponentInstance> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Component instance not found: ${instanceId}`);
    }

    const definition = this.components.get(instance.componentId);
    if (!definition) {
      throw new Error(`Component definition not found: ${instance.componentId}`);
    }

    // Validate props if configured
    if (this.config.validateProps && definition.props) {
      const validation = this.validateComponentProps(definition, props);
      if (!validation.isValid) {
        throw new Error(`Props validation failed: ${validation.errors.join(', ')}`);
      }
    }

    // Update instance
    const updatedInstance: ComponentInstance = {
      ...instance,
      props: { ...instance.props, ...props },
      updatedAt: new Date()
    };

    this.instances.set(instanceId, updatedInstance);
    return updatedInstance;
  }

  /**
   * Delete a component instance
   */
  async deleteInstance(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      throw new Error(`Component instance not found: ${instanceId}`);
    }

    this.instances.delete(instanceId);
  }

  /**
   * Get all instances for a component
   */
  getComponentInstances(componentId: string): ComponentInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.componentId === componentId);
  }

  /**
   * Subscribe to component events
   */
  subscribe(listener: ComponentEventCallback): () => void {
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
  getConfig(): ComponentRegistryConfig {
    return { ...this.config };
  }

  /**
   * Update registry configuration
   */
  updateConfig(updates: Partial<ComponentRegistryConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  // Private helper methods

  private async validateComponentDefinition(
    definition: ComponentDefinition
  ): Promise<ComponentValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!definition.id || definition.id.trim() === '') {
      errors.push('Component ID is required');
    }

    if (!definition.name || definition.name.trim() === '') {
      errors.push('Component name is required');
    }

    if (!definition.component) {
      errors.push('Component implementation is required');
    }

    if (!definition.version || !/^\d+\.\d+\.\d+$/.test(definition.version)) {
      errors.push('Valid semantic version is required');
    }

    // Check for duplicate ID
    if (this.components.has(definition.id)) {
      warnings.push(`Component with ID '${definition.id}' already exists and will be replaced`);
    }

    // Validate dependencies
    if (definition.dependencies) {
      for (const depId of definition.dependencies) {
        if (!this.components.has(depId)) {
          warnings.push(`Dependency '${depId}' is not registered`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      componentId: definition.id
    };
  }

  private validateComponentProps(
    definition: ComponentDefinition,
    props: Record<string, any>
  ): ComponentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!definition.props) {
      return {
        isValid: true,
        errors,
        warnings,
        componentId: definition.id
      };
    }

    try {
      // Validate using Zod schema
      definition.props.schema.parse(props);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(...error.errors.map(e => `${e.path.join('.')}: ${e.message}`));
      } else {
        errors.push('Unknown props validation error');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      componentId: definition.id
    };
  }

  private emitEvent(event: ComponentEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in component event listener:', error);
      }
    });
  }

  // Built-in component registration methods

  private async registerBuiltInSettingInputs(): Promise<void> {
    // These would be imported dynamically in a real implementation
    const settingInputComponents = [
      {
        id: 'string-input',
        name: 'String Input',
        description: 'Text input for string settings',
        category: ComponentCategory.SETTING_INPUT,
        version: '1.0.0'
      },
      {
        id: 'number-input',
        name: 'Number Input',
        description: 'Numeric input for number settings',
        category: ComponentCategory.SETTING_INPUT,
        version: '1.0.0'
      },
      {
        id: 'boolean-input',
        name: 'Boolean Input',
        description: 'Switch input for boolean settings',
        category: ComponentCategory.SETTING_INPUT,
        version: '1.0.0'
      },
      {
        id: 'select-input',
        name: 'Select Input',
        description: 'Dropdown select for option settings',
        category: ComponentCategory.SETTING_INPUT,
        version: '1.0.0'
      },
      {
        id: 'color-input',
        name: 'Color Input',
        description: 'Color picker for color settings',
        category: ComponentCategory.SETTING_INPUT,
        version: '1.0.0'
      }
    ];

    // Register placeholder components (in real implementation, these would be actual components)
    for (const componentDef of settingInputComponents) {
      const definition: ComponentDefinition = {
        ...componentDef,
        component: () => React.createElement('div', { children: `${componentDef.name} Component` }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.components.set(definition.id, definition);
    }
  }

  private async registerBuiltInSettingGroups(): Promise<void> {
    const settingGroupComponents = [
      {
        id: 'collapsible-group',
        name: 'Collapsible Group',
        description: 'Collapsible settings group with header and content',
        category: ComponentCategory.SETTING_GROUP,
        version: '1.0.0'
      },
      {
        id: 'tabbed-group',
        name: 'Tabbed Group',
        description: 'Tabbed interface for settings groups',
        category: ComponentCategory.SETTING_GROUP,
        version: '1.0.0'
      }
    ];

    for (const componentDef of settingGroupComponents) {
      const definition: ComponentDefinition = {
        ...componentDef,
        component: () => React.createElement('div', { children: `${componentDef.name} Component` }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.components.set(definition.id, definition);
    }
  }

  private async registerBuiltInLayouts(): Promise<void> {
    const layoutComponents = [
      {
        id: 'grid-layout',
        name: 'Grid Layout',
        description: 'Responsive grid layout for settings',
        category: ComponentCategory.LAYOUT,
        version: '1.0.0'
      },
      {
        id: 'form-layout',
        name: 'Form Layout',
        description: 'Form-based layout for settings',
        category: ComponentCategory.LAYOUT,
        version: '1.0.0'
      }
    ];

    for (const componentDef of layoutComponents) {
      const definition: ComponentDefinition = {
        ...componentDef,
        component: () => React.createElement('div', { children: `${componentDef.name} Component` }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.components.set(definition.id, definition);
    }
  }

  private async registerBuiltInValidation(): Promise<void> {
    const validationComponents = [
      {
        id: 'inline-validation',
        name: 'Inline Validation',
        description: 'Inline validation feedback for settings',
        category: ComponentCategory.VALIDATION,
        version: '1.0.0'
      },
      {
        id: 'summary-validation',
        name: 'Summary Validation',
        description: 'Summary validation display for forms',
        category: ComponentCategory.VALIDATION,
        version: '1.0.0'
      }
    ];

    for (const componentDef of validationComponents) {
      const definition: ComponentDefinition = {
        ...componentDef,
        component: () => React.createElement('div', { children: `${componentDef.name} Component` }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.components.set(definition.id, definition);
    }
  }
}

// Global component registry manager instance
let globalComponentRegistryManager: ComponentRegistryManager | null = null;

/**
 * Get the global component registry manager instance
 */
export function getComponentRegistryManager(
  config?: Partial<ComponentRegistryConfig>
): ComponentRegistryManager {
  if (!globalComponentRegistryManager) {
    globalComponentRegistryManager = new ComponentRegistryManager(config);
  }
  return globalComponentRegistryManager;
}

/**
 * Initialize component registry manager with custom configuration
 */
export function initializeComponentRegistry(
  config?: Partial<ComponentRegistryConfig>
): ComponentRegistryManager {
  globalComponentRegistryManager = new ComponentRegistryManager(config);
  return globalComponentRegistryManager;
}

// Utility functions
export function createComponentDefinition(
  id: string,
  name: string,
  component: React.ComponentType<any>,
  options: Partial<ComponentDefinition> = {}
): ComponentDefinition {
  return {
    id,
    name,
    component,
    category: ComponentCategory.UTILITY,
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...options
  };
}

export function createPropsSchema(
  schema: z.ZodSchema,
  options: Partial<ComponentPropsSchema> = {}
): ComponentPropsSchema {
  return {
    schema,
    defaultProps: {},
    requiredProps: [],
    optionalProps: [],
    ...options
  };
}
