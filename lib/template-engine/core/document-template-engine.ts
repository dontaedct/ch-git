/**
 * HT-023.1.1: Document Template Engine
 * 
 * Document-specific template engine implementation
 * Part of the Template Engine Integration
 */

import { TemplateEngine } from './template-engine';
import { DocumentTemplate, DocumentTemplateData, DocumentRenderedOutput } from './types';

export class DocumentTemplateEngine extends TemplateEngine {
  /**
   * Compile document template
   */
  async compileDocumentTemplate(template: DocumentTemplate): Promise<DocumentTemplate> {
    // Validate document template structure
    const validation = await this.validateTemplate(template);
    if (!validation.valid) {
      throw new Error(`Document template validation failed: ${validation.errors.join(', ')}`);
    }

    // Process document-specific content
    const compiledTemplate: DocumentTemplate = {
      ...template,
      content: {
        ...template.content,
        html: this.processDocumentHTML(template),
        css: this.processDocumentCSS(template),
        javascript: this.processDocumentJavaScript(template)
      },
      metadata: {
        ...template.metadata,
        updatedAt: new Date()
      }
    };

    return compiledTemplate;
  }

  /**
   * Render document with data
   */
  async renderDocument(template: DocumentTemplate, data: DocumentTemplateData): Promise<DocumentRenderedOutput> {
    const composed = await this.composeTemplate(template, data);
    const rendered = await this.renderTemplate(composed);

    return rendered as DocumentRenderedOutput;
  }

  /**
   * Process document HTML
   */
  private processDocumentHTML(template: DocumentTemplate): string {
    let html = template.content.html || '';

    // Add document structure
    html = this.wrapInDocumentStructure(html, template);

    // Process sections
    if (template.sections) {
      html = this.processDocumentSections(html, template.sections);
    }

    return html;
  }

  /**
   * Process document CSS
   */
  private processDocumentCSS(template: DocumentTemplate): string {
    let css = template.content.css || '';

    // Add page settings CSS
    if (template.pageSettings) {
      css += this.generatePageSettingsCSS(template.pageSettings);
    }

    // Add section-specific CSS
    if (template.sections) {
      css += this.generateSectionCSS(template.sections);
    }

    return css;
  }

  /**
   * Process document JavaScript
   */
  private processDocumentJavaScript(template: DocumentTemplate): string {
    let js = template.content.javascript || '';

    // Add document-specific JavaScript
    js += this.generateDocumentJavaScript(template);

    return js;
  }

  /**
   * Wrap HTML in document structure
   */
  private wrapInDocumentStructure(html: string, template: DocumentTemplate): string {
    const pageSettings = template.pageSettings || {};
    
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${template.name}</title>
          <style>${template.content.css || ''}</style>
        </head>
        <body>
          ${html}
          <script>${template.content.javascript || ''}</script>
        </body>
      </html>
    `;
  }

  /**
   * Process document sections
   */
  private processDocumentSections(html: string, sections: any[]): string {
    let processedHTML = html;

    sections.forEach((section, index) => {
      const sectionHTML = this.generateSectionHTML(section);
      processedHTML = processedHTML.replace(`{{section_${index}}}`, sectionHTML);
    });

    return processedHTML;
  }

  /**
   * Generate section HTML
   */
  private generateSectionHTML(section: any): string {
    return `
      <section class="document-section" data-section-id="${section.id}">
        <div class="section-content">
          ${section.content || ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate page settings CSS
   */
  private generatePageSettingsCSS(pageSettings: any): string {
    return `
      @page {
        size: ${pageSettings.size || 'A4'};
        margin: ${pageSettings.margin || '1in'};
      }
      
      body {
        font-family: ${pageSettings.fontFamily || 'Arial, sans-serif'};
        font-size: ${pageSettings.fontSize || '12pt'};
        line-height: ${pageSettings.lineHeight || '1.5'};
        color: ${pageSettings.textColor || '#000000'};
        background-color: ${pageSettings.backgroundColor || '#ffffff'};
      }
    `;
  }

  /**
   * Generate section CSS
   */
  private generateSectionCSS(sections: any[]): string {
    return sections.map(section => `
      .document-section[data-section-id="${section.id}"] {
        ${section.styles ? Object.entries(section.styles).map(([key, value]) => 
          `${key}: ${value};`
        ).join('\n        ') : ''}
      }
    `).join('\n');
  }

  /**
   * Generate document JavaScript
   */
  private generateDocumentJavaScript(template: DocumentTemplate): string {
    return `
      // Document template JavaScript
      document.addEventListener('DOMContentLoaded', function() {
        // Initialize document functionality
        console.log('Document template loaded: ${template.name}');
        
        // Add any document-specific interactions here
      });
    `;
  }
}
