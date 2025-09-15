/**
 * HT-023.1.1: Template Engine Core
 * 
 * Core template engine implementation for HT-023
 * Part of the Template Engine Integration
 */

import { Template, TemplateData, ComposedTemplate, RenderedOutput, ValidationResult, VersionedTemplate } from './types';

export interface TemplateEngineOptions {
  enableCaching?: boolean;
  cacheSize?: number;
  enableValidation?: boolean;
  enableVersioning?: boolean;
}

export class TemplateEngine {
  private cache = new Map<string, ComposedTemplate>();
  private options: TemplateEngineOptions;

  constructor(options: TemplateEngineOptions = {}) {
    this.options = {
      enableCaching: true,
      cacheSize: 100,
      enableValidation: true,
      enableVersioning: true,
      ...options
    };
  }

  /**
   * Compose template with data
   */
  async composeTemplate(template: Template, data: TemplateData): Promise<ComposedTemplate> {
    const cacheKey = this.getCacheKey(template.id, data);
    
    if (this.options.enableCaching && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const composed: ComposedTemplate = {
      template: {
        ...template,
        content: this.processTemplateContent(template, data)
      },
      data,
      compiledContent: {
        html: '',
        css: '',
        javascript: '',
        assets: []
      },
      metadata: {
        composedAt: new Date(),
        renderTime: 0,
        cacheKey,
        dependencies: []
      }
    };

    if (this.options.enableCaching) {
      this.cache.set(cacheKey, composed);
      this.manageCacheSize();
    }

    return composed;
  }

  /**
   * Render composed template to output
   */
  async renderTemplate(composed: ComposedTemplate): Promise<RenderedOutput> {
    const { template, data } = composed;
    
    const rendered: RenderedOutput = {
      content: this.renderHTML(template, data),
      format: 'html',
      metadata: {
        renderedAt: new Date(),
        renderTime: Date.now(),
        size: 0,
        format: 'html'
      }
    };

    return rendered;
  }

  /**
   * Validate template structure and content
   */
  async validateTemplate(template: Template): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!template.id) errors.push('Template ID is required');
    if (!template.name) errors.push('Template name is required');
    if (!template.version) errors.push('Template version is required');
    if (!template.type) errors.push('Template type is required');

    // Validate schema
    if (!template.schema) {
      errors.push('Template schema is required');
    } else {
      this.validateSchema(template.schema, errors, warnings);
    }

    // Validate content
    if (!template.content) {
      errors.push('Template content is required');
    } else {
      this.validateContent(template.content, errors, warnings);
    }

    // Validate metadata
    if (!template.metadata) {
      warnings.push('Template metadata is missing');
    }

    return {
      valid: errors.length === 0,
      errors: errors.map(error => ({ path: '', message: error, code: 'validation', severity: 'error' as const })),
      warnings: warnings.map(warning => ({ path: '', message: warning, code: 'validation', severity: 'warning' as const }))
    };
  }

  /**
   * Create versioned template
   */
  async versionTemplate(template: Template): Promise<VersionedTemplate> {
    const versioned: VersionedTemplate = {
      template,
      version: {
        version: template.version,
        timestamp: new Date(),
        changes: [{ type: 'added', path: 'template', description: 'Initial version', impact: 'feature' }],
        compatibility: {
          minVersion: '1.0.0',
          maxVersion: '2.0.0',
          breaking: false,
          migrations: []
        },
        rollbackPoint: true
      },
      changelog: [{ type: 'added', path: 'template', description: 'Initial version', impact: 'feature' }]
    };

    return versioned;
  }

  /**
   * Process template content with data
   */
  private processTemplateContent(template: Template, data: TemplateData): any {
    // Simple template processing - in real implementation would use proper templating engine
    let processedContent = JSON.parse(JSON.stringify(template.content));
    
    // Replace placeholders with data
    this.replacePlaceholders(processedContent, data);
    
    return processedContent;
  }

  /**
   * Replace placeholders in content
   */
  private replacePlaceholders(content: any, data: TemplateData): void {
    if (typeof content === 'string') {
      // Replace {{variable}} with data values
      content = content.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    } else if (Array.isArray(content)) {
      content.forEach(item => this.replacePlaceholders(item, data));
    } else if (typeof content === 'object' && content !== null) {
      Object.keys(content).forEach(key => {
        this.replacePlaceholders(content[key], data);
      });
    }
  }

  /**
   * Render HTML from template
   */
  private renderHTML(template: Template, data: TemplateData): string {
    // Simple HTML rendering - in real implementation would use proper template engine
    let html = template.content.html || '';
    
    // Replace data placeholders
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      html = html.replace(placeholder, data[key]);
    });
    
    return html;
  }

  /**
   * Render CSS from template
   */
  private renderCSS(template: Template): string {
    return template.content.css || '';
  }

  /**
   * Render JavaScript from template
   */
  private renderJavaScript(template: Template): string {
    return template.content.javascript || '';
  }

  /**
   * Validate template schema
   */
  private validateSchema(schema: any, errors: string[], warnings: string[]): void {
    if (!schema.variables) {
      warnings.push('Template schema missing variables definition');
    }
    
    if (!schema.sections) {
      warnings.push('Template schema missing sections definition');
    }
  }

  /**
   * Validate template content
   */
  private validateContent(content: any, errors: string[], warnings: string[]): void {
    if (!content.html && !content.components) {
      errors.push('Template content must have HTML or components');
    }
  }

  /**
   * Get cache key for template and data
   */
  private getCacheKey(templateId: string, data: TemplateData): string {
    const dataHash = JSON.stringify(data);
    return `${templateId}:${Buffer.from(dataHash).toString('base64').slice(0, 16)}`;
  }

  /**
   * Manage cache size
   */
  private manageCacheSize(): void {
    if (this.cache.size > this.options.cacheSize!) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.options.cacheSize!
    };
  }
}
