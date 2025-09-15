/**
 * HT-023.1.1: Document Template Manager
 * 
 * Manages document templates and their lifecycle
 * Part of the Template Engine Integration
 */

import { DocumentTemplate, DocumentTemplateData, DocumentRenderedOutput } from './types';
import { DocumentTemplateEngine } from './document-template-engine';

export interface DocumentTemplateManagerOptions {
  enableCaching?: boolean;
  cacheSize?: number;
  enableVersioning?: boolean;
  autoSave?: boolean;
}

export class DocumentTemplateManager {
  private templates = new Map<string, DocumentTemplate>();
  private engine: DocumentTemplateEngine;
  private options: DocumentTemplateManagerOptions;

  constructor(options: DocumentTemplateManagerOptions = {}) {
    this.options = {
      enableCaching: true,
      cacheSize: 50,
      enableVersioning: true,
      autoSave: false,
      ...options
    };
    this.engine = new DocumentTemplateEngine();
  }

  /**
   * Create new document template
   */
  async createTemplate(templateData: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: templateData.id || this.generateTemplateId(),
      name: templateData.name || 'Untitled Document',
      version: templateData.version || '1.0.0',
      type: 'document',
      documentType: templateData.documentType || 'html',
      schema: templateData.schema || this.getDefaultSchema(),
      content: templateData.content || this.getDefaultContent(),
      metadata: {
        id: templateData.id || this.generateTemplateId(),
        name: templateData.name || 'Untitled Document',
        description: templateData.metadata?.description || 'Document template',
        tags: templateData.metadata?.tags || ['document'],
        category: templateData.metadata?.category || 'document',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: templateData.version || '1.0.0'
      },
      pageSettings: templateData.pageSettings || this.getDefaultPageSettings(),
      sections: templateData.sections || []
    };

    // Compile template
    const compiledTemplate = await this.engine.compileDocumentTemplate(template);
    
    // Store template
    this.templates.set(template.id, compiledTemplate);
    
    return compiledTemplate;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): DocumentTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Update template
   */
  async updateTemplate(templateId: string, updates: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const existingTemplate = this.templates.get(templateId);
    if (!existingTemplate) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const updatedTemplate: DocumentTemplate = {
      ...existingTemplate,
      ...updates,
      metadata: {
        ...existingTemplate.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };

    // Recompile template
    const compiledTemplate = await this.engine.compileDocumentTemplate(updatedTemplate);
    
    // Update stored template
    this.templates.set(templateId, compiledTemplate);
    
    return compiledTemplate;
  }

  /**
   * Delete template
   */
  deleteTemplate(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * List all templates
   */
  listTemplates(): DocumentTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Render template with data
   */
  async renderTemplate(templateId: string, data: DocumentTemplateData): Promise<DocumentRenderedOutput> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return await this.engine.renderDocument(template, data);
  }

  /**
   * Clone template
   */
  async cloneTemplate(templateId: string, newName?: string): Promise<DocumentTemplate> {
    const originalTemplate = this.templates.get(templateId);
    if (!originalTemplate) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const clonedTemplate: DocumentTemplate = {
      ...originalTemplate,
      id: this.generateTemplateId(),
      name: newName || `${originalTemplate.name} (Copy)`,
      version: '1.0.0',
      metadata: {
        ...originalTemplate.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    // Compile cloned template
    const compiledTemplate = await this.engine.compileDocumentTemplate(clonedTemplate);
    
    // Store cloned template
    this.templates.set(clonedTemplate.id, compiledTemplate);
    
    return compiledTemplate;
  }

  /**
   * Export template
   */
  exportTemplate(templateId: string): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template
   */
  async importTemplate(templateJson: string): Promise<DocumentTemplate> {
    try {
      const templateData = JSON.parse(templateJson);
      const template: DocumentTemplate = {
        ...templateData,
        id: this.generateTemplateId(), // Generate new ID to avoid conflicts
        metadata: {
          ...templateData.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
          importedAt: new Date()
        }
      };

      // Compile imported template
      const compiledTemplate = await this.engine.compileDocumentTemplate(template);
      
      // Store imported template
      this.templates.set(template.id, compiledTemplate);
      
      return compiledTemplate;
    } catch (error) {
      throw new Error(`Failed to import template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search templates
   */
  searchTemplates(query: string): DocumentTemplate[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.templates.values()).filter(template =>
      template.name.toLowerCase().includes(searchTerm) ||
      template.documentType.toLowerCase().includes(searchTerm) ||
      (template.metadata?.description && template.metadata.description.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get templates by document type
   */
  getTemplatesByType(documentType: string): DocumentTemplate[] {
    return Array.from(this.templates.values()).filter(template =>
      template.documentType === documentType
    );
  }

  /**
   * Generate unique template ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default schema
   */
  private getDefaultSchema(): any {
    return {
      variables: [],
      sections: [],
      validation: {
        required: [],
        optional: []
      }
    };
  }

  /**
   * Get default content
   */
  private getDefaultContent(): any {
    return {
      html: '<div class="document-content"><h1>Document Title</h1><p>Document content goes here.</p></div>',
      css: '.document-content { padding: 2rem; }',
      javascript: ''
    };
  }

  /**
   * Get default page settings
   */
  private getDefaultPageSettings(): any {
    return {
      size: 'A4',
      orientation: 'portrait',
      margin: '1in',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12pt',
      lineHeight: '1.5',
      textColor: '#000000',
      backgroundColor: '#ffffff',
      language: 'en'
    };
  }

  /**
   * Clear all templates
   */
  clearTemplates(): void {
    this.templates.clear();
  }

  /**
   * Get template statistics
   */
  getTemplateStats(): { total: number; byType: Record<string, number> } {
    const templates = Array.from(this.templates.values());
    const byType: Record<string, number> = {};
    
    templates.forEach(template => {
      byType[template.documentType] = (byType[template.documentType] || 0) + 1;
    });

    return {
      total: templates.length,
      byType
    };
  }
}
