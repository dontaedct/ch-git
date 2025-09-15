import {
  Template,
  TemplateVariable,
  TemplateSection,
  TemplateSchema,
  TemplateContent,
  TemplateMetadata,
  DocumentTemplate
} from './types'

export class TemplateParser {
  parse(templateContent: string): Promise<Template> {
    try {
      const parsed = JSON.parse(templateContent)
      return Promise.resolve(this.parseTemplateObject(parsed))
    } catch (error) {
      return this.parseMarkdownTemplate(templateContent)
    }
  }

  private parseTemplateObject(obj: any): Template {
    // Validate required fields
    if (!obj.id || !obj.name || !obj.type) {
      throw new Error('Template must have id, name, and type fields')
    }

    const template: Template = {
      id: obj.id,
      name: obj.name,
      version: obj.version || '1.0.0',
      type: obj.type,
      schema: this.parseSchema(obj.schema || {}),
      content: this.parseContent(obj.content || {}),
      metadata: this.parseMetadata(obj.metadata || obj),
      inheritance: obj.inheritance,
      branding: obj.branding
    }

    return template
  }

  private async parseMarkdownTemplate(content: string): Promise<Template> {
    const lines = content.split('\n')
    const template: Partial<Template> = {
      id: `md_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      version: '1.0.0',
      type: 'document'
    }

    const variables: TemplateVariable[] = []
    const sections: TemplateSection[] = []
    let currentSection: Partial<TemplateSection> | null = null
    let htmlContent = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Parse frontmatter (YAML-like header)
      if (i === 0 && line.trim() === '---') {
        const frontmatterEnd = lines.findIndex((l, idx) => idx > 0 && l.trim() === '---')
        if (frontmatterEnd > 0) {
          const frontmatter = lines.slice(1, frontmatterEnd).join('\n')
          const metadata = this.parseFrontmatter(frontmatter)
          template.name = metadata.name || 'Untitled Template'
          template.metadata = {
            id: template.id || `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: template.name || 'Untitled Template',
            tags: metadata.tags || [],
            category: metadata.category || 'document',
            createdAt: new Date(),
            updatedAt: new Date(),
            version: template.version!
          }
          i = frontmatterEnd
          continue
        }
      }

      // Parse variables in double curly braces
      const variableMatches = line.match(/{{(\w+)(?::(\w+))?(?:\|(.+?))?}}/g)
      if (variableMatches) {
        variableMatches.forEach(match => {
          const parsed = match.match(/{{(\w+)(?::(\w+))?(?:\|(.+?))?}}/)
          if (parsed) {
            const [, name, type = 'text', defaultValue] = parsed
            const existing = variables.find(v => v.name === name)
            if (!existing) {
              variables.push({
                name,
                type: type as any,
                required: true,
                defaultValue: defaultValue || ''
              })
            }
          }
        })
      }

      // Parse sections (headers)
      if (line.startsWith('#')) {
        if (currentSection) {
          sections.push(currentSection as TemplateSection)
        }

        const level = line.match(/^#+/)?.[0].length || 1
        const title = line.replace(/^#+\s*/, '')

        currentSection = {
          id: `section_${sections.length + 1}`,
          name: title,
          type: level === 1 ? 'header' : 'content',
          content: '',
          variables: []
        }
      }

      // Convert markdown to HTML
      htmlContent += this.markdownToHtml(line) + '\n'
    }

    // Add final section
    if (currentSection) {
      sections.push(currentSection as TemplateSection)
    }

    return {
      id: template.id!,
      name: template.name || 'Untitled Template',
      version: template.version!,
      type: template.type!,
      schema: {
        variables,
        sections,
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
        html: htmlContent,
        css: '',
        assets: []
      },
      metadata: template.metadata || {
        id: template.id!,
        name: template.name!,
        tags: [],
        category: 'document',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: template.version!
      }
    }
  }

  private parseSchema(schema: any): TemplateSchema {
    return {
      variables: (schema.variables || []).map(this.parseVariable),
      sections: (schema.sections || []).map(this.parseSection),
      layout: schema.layout || {
        type: 'single-page',
        orientation: 'portrait',
        margins: { top: 20, right: 20, bottom: 20, left: 20 },
        sections: []
      },
      styling: schema.styling || {
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
    }
  }

  private parseVariable(variable: any): TemplateVariable {
    return {
      name: variable.name,
      type: variable.type || 'text',
      required: variable.required || false,
      defaultValue: variable.defaultValue,
      description: variable.description,
      validation: variable.validation || []
    }
  }

  private parseSection(section: any): TemplateSection {
    return {
      id: section.id,
      name: section.name,
      type: section.type || 'content',
      content: section.content || '',
      variables: section.variables || [],
      conditional: section.conditional
    }
  }

  private parseContent(content: any): TemplateContent {
    return {
      html: content.html || '',
      css: content.css || '',
      javascript: content.javascript,
      assets: content.assets || []
    }
  }

  private parseMetadata(metadata: any): TemplateMetadata {
    return {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      tags: metadata.tags || [],
      category: metadata.category || 'document',
      createdAt: metadata.createdAt ? new Date(metadata.createdAt) : new Date(),
      updatedAt: metadata.updatedAt ? new Date(metadata.updatedAt) : new Date(),
      author: metadata.author,
      version: metadata.version || '1.0.0'
    }
  }

  private parseFrontmatter(frontmatter: string): any {
    const metadata: any = {}
    const lines = frontmatter.split('\n')

    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/)
      if (match) {
        const [, key, value] = match
        if (key === 'tags') {
          metadata[key] = value.split(',').map(t => t.trim())
        } else {
          metadata[key] = value.trim()
        }
      }
    }

    return metadata
  }

  private markdownToHtml(line: string): string {
    // Basic markdown to HTML conversion
    line = line.replace(/^# (.+)$/, '<h1>$1</h1>')
    line = line.replace(/^## (.+)$/, '<h2>$1</h2>')
    line = line.replace(/^### (.+)$/, '<h3>$1</h3>')
    line = line.replace(/^#### (.+)$/, '<h4>$1</h4>')
    line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
    line = line.replace(/`(.+?)`/g, '<code>$1</code>')

    // Handle paragraphs
    if (line.trim() && !line.startsWith('<')) {
      line = `<p>${line}</p>`
    }

    return line
  }

  // HTML template parsing
  parseHtmlTemplate(html: string, variables: TemplateVariable[] = []): Template {
    const id = `html_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Extract variables from HTML
    const variableMatches = html.match(/{{(\w+)}}/g) || []
    const extractedVars = variableMatches.map(match => {
      const name = match.replace(/[{}]/g, '')
      return {
        name,
        type: 'text' as const,
        required: true,
        defaultValue: ''
      }
    })

    // Merge with provided variables
    const allVariables = [...variables]
    extractedVars.forEach(extractedVar => {
      if (!allVariables.find(v => v.name === extractedVar.name)) {
        allVariables.push(extractedVar)
      }
    })

    return {
      id,
      name: 'HTML Template',
      version: '1.0.0',
      type: 'document',
      schema: {
        variables: allVariables,
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
        html,
        css: '',
        assets: []
      },
      metadata: {
        id,
        name: 'HTML Template',
        tags: ['html', 'document'],
        category: 'document',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }
}