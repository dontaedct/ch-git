import {
  Template,
  TemplateData,
  ComposedTemplate,
  RenderedOutput,
  ValidationResult,
  VersionedTemplate,
  DocumentTemplate,
  CompiledContent,
  CompositionMetadata,
  RenderMetadata
} from './types'
import { TemplateParser } from './parser'
import { TemplateRenderer } from './renderer'
import { TemplateValidator } from './validator'
import { TemplateComposer } from '../composition/composer'

export interface TemplateEngine {
  compose(template: Template, data: TemplateData): Promise<ComposedTemplate>
  render(composed: ComposedTemplate, format?: 'html' | 'pdf' | 'docx'): Promise<RenderedOutput>
  validate(template: Template): Promise<ValidationResult>
  version(template: Template): Promise<VersionedTemplate>
  parse(templateContent: string): Promise<Template>
}

export class DocumentTemplateEngine implements TemplateEngine {
  private parser: TemplateParser
  private renderer: TemplateRenderer
  private validator: TemplateValidator
  private composer: TemplateComposer

  constructor() {
    this.parser = new TemplateParser()
    this.renderer = new TemplateRenderer()
    this.validator = new TemplateValidator()
    this.composer = new TemplateComposer()
  }

  async compose(template: Template, data: TemplateData): Promise<ComposedTemplate> {
    const startTime = Date.now()

    // Validate template and data
    const validation = await this.validate(template)
    if (!validation.valid) {
      throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
    }

    // Apply client branding if present
    let processedTemplate = template
    if (template.branding) {
      processedTemplate = await this.composer.applyBranding(template, template.branding)
    }

    // Process template inheritance
    if (template.inheritance?.parentId) {
      processedTemplate = await this.composer.resolveInheritance(processedTemplate)
    }

    // Compile template content with data
    const compiledContent = await this.compileContent(processedTemplate, data)

    // Generate cache key
    const cacheKey = this.generateCacheKey(template, data)

    const metadata: CompositionMetadata = {
      composedAt: new Date(),
      renderTime: Date.now() - startTime,
      cacheKey,
      dependencies: this.extractDependencies(template)
    }

    return {
      template: processedTemplate,
      data,
      compiledContent,
      metadata
    }
  }

  async render(composed: ComposedTemplate, format: 'html' | 'pdf' | 'docx' = 'html'): Promise<RenderedOutput> {
    const startTime = Date.now()

    let content: string
    let assets: any[] = []

    switch (format) {
      case 'html':
        content = await this.renderer.renderHtml(composed)
        break
      case 'pdf':
        content = await this.renderer.renderPdf(composed)
        break
      case 'docx':
        content = await this.renderer.renderDocx(composed)
        break
      default:
        throw new Error(`Unsupported format: ${format}`)
    }

    const metadata: RenderMetadata = {
      renderedAt: new Date(),
      renderTime: Date.now() - startTime,
      size: content.length,
      format
    }

    return {
      content,
      format,
      metadata,
      assets
    }
  }

  async validate(template: Template): Promise<ValidationResult> {
    return this.validator.validate(template)
  }

  async version(template: Template): Promise<VersionedTemplate> {
    // This will be implemented in the versioning system
    throw new Error('Version management not yet implemented')
  }

  async parse(templateContent: string): Promise<Template> {
    return this.parser.parse(templateContent)
  }

  private async compileContent(template: Template, data: TemplateData): Promise<CompiledContent> {
    // Replace template variables with actual data
    let compiledHtml = template.content.html
    let compiledCss = template.content.css || ''

    // Process template variables
    for (const variable of template.schema.variables) {
      const value = data[variable.name] ?? variable.defaultValue ?? ''
      const placeholder = new RegExp(`{{\\s*${variable.name}\\s*}}`, 'g')
      compiledHtml = compiledHtml.replace(placeholder, String(value))
      compiledCss = compiledCss.replace(placeholder, String(value))
    }

    // Process conditional sections
    for (const section of template.schema.sections) {
      if (section.conditional) {
        const shouldInclude = this.evaluateCondition(section.conditional, data)
        if (!shouldInclude) {
          const sectionRegex = new RegExp(`<!--\\s*section:${section.id}\\s*-->[\\s\\S]*?<!--\\s*\\/section:${section.id}\\s*-->`, 'g')
          compiledHtml = compiledHtml.replace(sectionRegex, '')
        }
      }
    }

    // Process assets
    const resolvedAssets = template.content.assets?.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      resolvedUrl: asset.url,
      optimized: false
    })) || []

    return {
      html: compiledHtml,
      css: compiledCss,
      javascript: template.content.javascript,
      assets: resolvedAssets
    }
  }

  private evaluateCondition(condition: any, data: TemplateData): boolean {
    const value = data[condition.variable]

    switch (condition.operator) {
      case 'equals':
        return value === condition.value
      case 'notEquals':
        return value !== condition.value
      case 'contains':
        return String(value).includes(condition.value)
      case 'greaterThan':
        return Number(value) > Number(condition.value)
      case 'lessThan':
        return Number(value) < Number(condition.value)
      default:
        return false
    }
  }

  private generateCacheKey(template: Template, data: TemplateData): string {
    const templateHash = this.hashObject({ id: template.id, version: template.version })
    const dataHash = this.hashObject(data)
    return `${templateHash}-${dataHash}`
  }

  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').slice(0, 16)
  }

  private extractDependencies(template: Template): string[] {
    const dependencies: string[] = []

    if (template.inheritance?.parentId) {
      dependencies.push(template.inheritance.parentId)
    }

    if (template.branding?.id) {
      dependencies.push(`branding:${template.branding.id}`)
    }

    // Extract asset dependencies
    template.content.assets?.forEach(asset => {
      dependencies.push(`asset:${asset.id}`)
    })

    return dependencies
  }

  // Document-specific methods
  async createDocumentTemplate(
    name: string,
    documentType: 'pdf' | 'html' | 'docx' | 'txt',
    content: string,
    variables: any[] = []
  ): Promise<DocumentTemplate> {
    const template: DocumentTemplate = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      version: '1.0.0',
      type: 'document',
      documentType,
      schema: {
        variables,
        sections: [],
        layout: {
          type: 'single-page',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          sections: []
        },
        styling: {
          fonts: [],
          colors: {
            primary: '#000000',
            secondary: '#666666',
            accent: '#0066cc',
            background: '#ffffff',
            text: '#000000',
            border: '#cccccc'
          },
          spacing: {
            small: 8,
            medium: 16,
            large: 24,
            xlarge: 32
          }
        }
      },
      content: {
        html: content,
        css: '',
        assets: []
      },
      metadata: {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name,
        tags: ['document', documentType],
        category: 'document',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      pageSettings: {
        size: { width: 8.5, height: 11, unit: 'in' },
        orientation: 'portrait',
        margins: { top: 1, right: 1, bottom: 1, left: 1, unit: 'in' }
      },
      sections: []
    }

    return template
  }

  async generateDocument(
    template: DocumentTemplate,
    data: TemplateData,
    format: 'pdf' | 'html' | 'docx' = 'html'
  ): Promise<RenderedOutput> {
    const composed = await this.compose(template, data)
    return this.render(composed, format)
  }
}