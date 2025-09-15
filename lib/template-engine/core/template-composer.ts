/**
 * HT-023.1.1: Template Composer
 * 
 * Composes templates from base templates and overrides
 * Part of the Template Engine Integration
 */

import { Template, TemplateOverrides, TemplateLayer, ResolvedTemplate } from './types';

export interface TemplateComposerOptions {
  enableConflictResolution?: boolean;
  enableInheritance?: boolean;
  enableBranding?: boolean;
}

export class TemplateComposer {
  private options: TemplateComposerOptions;

  constructor(options: TemplateComposerOptions = {}) {
    this.options = {
      enableConflictResolution: true,
      enableInheritance: true,
      enableBranding: true,
      ...options
    };
  }

  /**
   * Compose template from base template and overrides
   */
  async composeFromBase(baseId: string, overrides: TemplateOverrides): Promise<Template> {
    // In a real implementation, this would fetch the base template
    const baseTemplate: Template = this.getBaseTemplate(baseId);
    
    const composedTemplate: Template = {
      ...baseTemplate,
      ...overrides,
      metadata: {
        ...baseTemplate.metadata,
        updatedAt: new Date()
      }
    };

    return composedTemplate;
  }

  /**
   * Merge inheritance between parent and child templates
   */
  async mergeInheritance(parent: Template, child: Template): Promise<Template> {
    if (!this.options.enableInheritance) {
      return child;
    }

    const mergedTemplate: Template = {
      ...parent,
      ...child,
      content: this.mergeContent(parent.content, child.content),
      schema: this.mergeSchema(parent.schema, child.schema),
      metadata: {
        ...parent.metadata,
        ...child.metadata,
        updatedAt: new Date()
      }
    };

    return mergedTemplate;
  }

  /**
   * Apply branding to template
   */
  async applyBranding(template: Template, branding: any): Promise<Template> {
    if (!this.options.enableBranding) {
      return template;
    }

    const brandedTemplate: Template = {
      ...template,
      branding,
      content: this.applyBrandingToContent(template.content, branding),
      metadata: {
        ...template.metadata,
        updatedAt: new Date()
      }
    };

    return brandedTemplate;
  }

  /**
   * Resolve conflicts between template layers
   */
  async resolveConflicts(layers: TemplateLayer[]): Promise<ResolvedTemplate> {
    if (!this.options.enableConflictResolution) {
      return {
        template: layers[layers.length - 1].content,
        data: {} as any,
        compiledContent: {} as any,
        metadata: {} as any
      };
    }

    const conflicts: string[] = [];
    const resolvedTemplate = this.mergeLayers(layers, conflicts);

    return {
      template: resolvedTemplate,
      data: {} as any,
      compiledContent: {} as any,
      metadata: {} as any
    };
  }

  /**
   * Get base template by ID
   */
  private getBaseTemplate(baseId: string): Template {
    // In a real implementation, this would fetch from storage
    return {
      id: baseId,
      name: 'Base Template',
      version: '1.0.0',
      type: 'page',
      schema: {
        variables: [],
        sections: [],
        layout: {
          type: 'single-page',
          orientation: 'portrait',
          margins: { top: 0, right: 0, bottom: 0, left: 0 },
          sections: []
        },
        styling: {
          fonts: [],
          colors: {
            primary: '#000000',
            secondary: '#ffffff',
            accent: '#000000',
            background: '#ffffff',
            text: '#000000',
            border: '#000000'
          },
          spacing: {
            small: 4,
            medium: 8,
            large: 16,
            xlarge: 32
          }
        }
      },
      content: {
        html: '<div class="base-template">Base content</div>',
        css: '.base-template { padding: 1rem; }',
        javascript: ''
      },
      metadata: {
        id: baseId,
        name: 'Base Template',
        description: 'Base template for composition',
        tags: ['base'],
        category: 'base',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    };
  }

  /**
   * Merge content between templates
   */
  private mergeContent(parentContent: any, childContent: any): any {
    return {
      html: childContent.html || parentContent.html,
      css: this.mergeCSS(parentContent.css, childContent.css),
      javascript: childContent.javascript || parentContent.javascript
    };
  }

  /**
   * Merge CSS content
   */
  private mergeCSS(parentCSS: string, childCSS: string): string {
    return [parentCSS, childCSS].filter(Boolean).join('\n');
  }

  /**
   * Merge schema between templates
   */
  private mergeSchema(parentSchema: any, childSchema: any): any {
    return {
      variables: [...(parentSchema.variables || []), ...(childSchema.variables || [])],
      sections: [...(parentSchema.sections || []), ...(childSchema.sections || [])],
      validation: {
        ...parentSchema.validation,
        ...childSchema.validation
      }
    };
  }

  /**
   * Apply branding to content
   */
  private applyBrandingToContent(content: any, branding: any): any {
    const brandedContent = JSON.parse(JSON.stringify(content));
    
    if (branding.customCss && brandedContent.css) {
      brandedContent.css += '\n' + branding.customCss;
    }

    return brandedContent;
  }

  /**
   * Merge template layers
   */
  private mergeLayers(layers: TemplateLayer[], conflicts: string[]): Template {
    let mergedTemplate = layers[0].content;

    for (let i = 1; i < layers.length; i++) {
      const currentLayer = layers[i];
      const previousTemplate = mergedTemplate;

      // Check for conflicts
      this.checkConflicts(previousTemplate, currentLayer.content, conflicts);

      // Merge templates
      mergedTemplate = {
        ...previousTemplate,
        ...currentLayer.content,
        content: this.mergeContent(previousTemplate.content, currentLayer.content.content),
        metadata: {
          ...previousTemplate.metadata,
          ...currentLayer.content.metadata,
          mergedAt: new Date()
        }
      };
    }

    return mergedTemplate;
  }

  /**
   * Check for conflicts between templates
   */
  private checkConflicts(template1: Template, template2: Template, conflicts: string[]): void {
    // Check for ID conflicts
    if (template1.id !== template2.id) {
      conflicts.push(`ID conflict: ${template1.id} vs ${template2.id}`);
    }

    // Check for version conflicts
    if (template1.version !== template2.version) {
      conflicts.push(`Version conflict: ${template1.version} vs ${template2.version}`);
    }

    // Check for type conflicts
    if (template1.type !== template2.type) {
      conflicts.push(`Type conflict: ${template1.type} vs ${template2.type}`);
    }
  }
}
