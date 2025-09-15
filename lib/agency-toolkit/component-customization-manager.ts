/**
 * HT-022.1.4: Component Customization Manager
 * 
 * Manages component customization and theming
 * Part of the HT-022 Component System Integration
 */

import { ComponentCustomization, CustomizationRule, CustomizationContext } from '@/lib/foundation';

export interface CustomizationRequest {
  componentId: string;
  clientId: string;
  customizations: Partial<ComponentCustomization>;
  priority?: number;
}

export interface CustomizationResult {
  success: boolean;
  customization?: ComponentCustomization;
  error?: string;
}

export class ComponentCustomizationManager {
  private customizations = new Map<string, ComponentCustomization>();
  private rules = new Map<string, CustomizationRule>();
  private context: CustomizationContext | null = null;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Set customization context
   */
  setContext(context: CustomizationContext): void {
    this.context = context;
  }

  /**
   * Apply customization to component
   */
  async applyCustomization(request: CustomizationRequest): Promise<CustomizationResult> {
    try {
      const customization = await this.createCustomization(request);
      this.customizations.set(this.getCustomizationKey(request.componentId, request.clientId), customization);
      
      return {
        success: true,
        customization
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get customization for component
   */
  getCustomization(componentId: string, clientId: string): ComponentCustomization | null {
    const key = this.getCustomizationKey(componentId, clientId);
    return this.customizations.get(key) || null;
  }

  /**
   * Remove customization
   */
  removeCustomization(componentId: string, clientId: string): boolean {
    const key = this.getCustomizationKey(componentId, clientId);
    return this.customizations.delete(key);
  }

  /**
   * List customizations for client
   */
  listClientCustomizations(clientId: string): ComponentCustomization[] {
    return Array.from(this.customizations.values())
      .filter(customization => customization.clientId === clientId);
  }

  /**
   * Add customization rule
   */
  addRule(rule: CustomizationRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove customization rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get applicable rules for context
   */
  getApplicableRules(context: CustomizationContext): CustomizationRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.active && this.evaluateRuleCondition(rule, context))
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Create customization from request
   */
  private async createCustomization(request: CustomizationRequest): Promise<ComponentCustomization> {
    const baseCustomization: ComponentCustomization = {
      componentId: request.componentId,
      clientId: request.clientId,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        author: this.context?.userId || 'system'
      }
    };

    // Apply customizations
    const customization: ComponentCustomization = {
      ...baseCustomization,
      ...request.customizations,
      metadata: {
        createdAt: baseCustomization.metadata?.createdAt || new Date(),
        updatedAt: new Date(),
        version: baseCustomization.metadata?.version || '1.0.0',
        author: baseCustomization.metadata?.author || 'system'
      }
    };

    // Apply applicable rules
    if (this.context) {
      const applicableRules = this.getApplicableRules(this.context);
      for (const rule of applicableRules) {
        customization.style = { ...customization.style, ...rule.overrides.style };
        customization.behavior = { ...customization.behavior, ...rule.overrides.behavior };
        customization.content = { ...customization.content, ...rule.overrides.content };
      }
    }

    return customization;
  }

  /**
   * Get customization key
   */
  private getCustomizationKey(componentId: string, clientId: string): string {
    return `${clientId}:${componentId}`;
  }

  /**
   * Evaluate rule condition
   */
  private evaluateRuleCondition(rule: CustomizationRule, context: CustomizationContext): boolean {
    // Simple condition evaluation - in real implementation would use expression parser
    try {
      // For now, just check if clientId matches
      return rule.condition.includes(context.clientId);
    } catch {
      return false;
    }
  }

  /**
   * Initialize default rules
   */
  private initializeDefaultRules(): void {
    // Add default rules for common customizations
    const defaultRules: CustomizationRule[] = [
      {
        id: 'default-spacing',
        name: 'Default Spacing Rule',
        condition: 'true',
        overrides: {
          componentId: '',
          clientId: '',
          style: {
            spacing: {
              xs: '0.25rem',
              sm: '0.5rem',
              md: '1rem',
              lg: '1.5rem',
              xl: '2rem'
            }
          }
        },
        priority: 1,
        active: true
      },
      {
        id: 'default-colors',
        name: 'Default Colors Rule',
        condition: 'true',
        overrides: {
          componentId: '',
          clientId: '',
          style: {
            colors: {
              primary: '#3b82f6',
              secondary: '#1e40af',
              accent: '#06b6d4'
            }
          }
        },
        priority: 1,
        active: true
      }
    ];

    defaultRules.forEach(rule => this.addRule(rule));
  }

  /**
   * Clear all customizations
   */
  clearCustomizations(): void {
    this.customizations.clear();
  }

  /**
   * Clear all rules
   */
  clearRules(): void {
    this.rules.clear();
  }

  /**
   * Export customizations
   */
  exportCustomizations(clientId?: string): ComponentCustomization[] {
    if (clientId) {
      return this.listClientCustomizations(clientId);
    }
    return Array.from(this.customizations.values());
  }

  /**
   * Import customizations
   */
  importCustomizations(customizations: ComponentCustomization[]): void {
    customizations.forEach(customization => {
      const key = this.getCustomizationKey(customization.componentId, customization.clientId);
      this.customizations.set(key, customization);
    });
  }
}
