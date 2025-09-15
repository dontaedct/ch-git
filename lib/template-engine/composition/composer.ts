import {
  Template,
  ClientBranding,
  TemplateInheritance,
  TemplateOverride,
  BrandColors,
  BrandTypography,
  BrandSpacing,
  BrandComponentOverrides
} from '../core/types'

export interface TemplateOverrides {
  content?: Partial<any>
  styling?: Partial<any>
  branding?: Partial<ClientBranding>
  metadata?: Partial<any>
}

export interface TemplateLayer {
  type: 'base' | 'theme' | 'content' | 'behavior'
  priority: number
  content: any
  source: string
}

export interface ResolvedTemplate extends Template {
  resolved: true
  resolvedAt: Date
  resolvedFrom: string[]
}

export class TemplateComposer {
  async composeFromBase(baseId: string, overrides: TemplateOverrides): Promise<Template> {
    // In a real implementation, this would fetch the base template from storage
    const baseTemplate = await this.getBaseTemplate(baseId)

    if (!baseTemplate) {
      throw new Error(`Base template not found: ${baseId}`)
    }

    // Apply overrides to the base template
    const composedTemplate: Template = {
      ...baseTemplate,
      id: `composed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: overrides.metadata?.name || `${baseTemplate.name} (Composed)`,
      content: {
        ...baseTemplate.content,
        ...overrides.content
      },
      schema: {
        ...baseTemplate.schema,
        styling: {
          ...baseTemplate.schema.styling,
          ...overrides.styling
        }
      },
      metadata: {
        ...baseTemplate.metadata,
        ...overrides.metadata,
        id: `composed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        updatedAt: new Date()
      },
      branding: overrides.branding ? { ...baseTemplate.branding, ...overrides.branding } as ClientBranding : baseTemplate.branding
    }

    return composedTemplate
  }

  async mergeInheritance(parent: Template, child: Template): Promise<Template> {
    const mergedTemplate: Template = {
      ...parent,
      id: child.id,
      name: child.name,
      version: child.version,
      metadata: {
        ...parent.metadata,
        ...child.metadata,
        id: child.id,
        name: child.name,
        version: child.version
      }
    }

    // Merge schema
    mergedTemplate.schema = {
      variables: [
        ...parent.schema.variables,
        ...child.schema.variables.filter(cv =>
          !parent.schema.variables.find(pv => pv.name === cv.name)
        )
      ],
      sections: [
        ...parent.schema.sections,
        ...child.schema.sections.filter(cs =>
          !parent.schema.sections.find(ps => ps.id === cs.id)
        )
      ],
      layout: {
        ...parent.schema.layout,
        ...child.schema.layout
      },
      styling: this.mergeStyling(parent.schema.styling, child.schema.styling)
    }

    // Merge content
    mergedTemplate.content = {
      html: this.mergeHtmlContent(parent.content.html, child.content.html),
      css: this.mergeCssContent(parent.content.css || '', child.content.css || ''),
      javascript: child.content.javascript || parent.content.javascript,
      assets: [
        ...(parent.content.assets || []),
        ...(child.content.assets || []).filter(ca =>
          !(parent.content.assets || []).find(pa => pa.id === ca.id)
        )
      ]
    }

    // Apply child's branding if present, otherwise use parent's
    if (child.branding) {
      mergedTemplate.branding = child.branding
    } else if (parent.branding) {
      mergedTemplate.branding = parent.branding
    }

    return mergedTemplate
  }

  async applyBranding(template: Template, branding: ClientBranding): Promise<Template> {
    const brandedTemplate: Template = {
      ...template,
      branding,
      content: {
        ...template.content,
        css: this.applyBrandingToCss(template.content.css || '', branding),
        html: this.applyBrandingToHtml(template.content.html, branding)
      },
      schema: {
        ...template.schema,
        styling: this.applyBrandingToStyling(template.schema.styling, branding)
      }
    }

    return brandedTemplate
  }

  async resolveConflicts(layers: TemplateLayer[]): Promise<ResolvedTemplate> {
    // Sort layers by priority
    const sortedLayers = layers.sort((a, b) => b.priority - a.priority)

    let resolvedContent = {}
    const sources: string[] = []

    // Merge layers in priority order
    for (const layer of sortedLayers) {
      resolvedContent = this.deepMerge(resolvedContent, layer.content)
      sources.push(layer.source)
    }

    // Create resolved template from the merged content
    const resolvedTemplate: ResolvedTemplate = {
      ...(resolvedContent as Template),
      resolved: true,
      resolvedAt: new Date(),
      resolvedFrom: sources
    }

    return resolvedTemplate
  }

  async resolveInheritance(template: Template): Promise<Template> {
    if (!template.inheritance?.parentId) {
      return template
    }

    // In a real implementation, this would fetch the parent template
    const parentTemplate = await this.getTemplateById(template.inheritance.parentId)

    if (!parentTemplate) {
      throw new Error(`Parent template not found: ${template.inheritance.parentId}`)
    }

    // Recursively resolve parent inheritance
    const resolvedParent = await this.resolveInheritance(parentTemplate)

    // Apply inheritance strategy
    switch (template.inheritance.mergeStrategy) {
      case 'merge':
        return this.mergeInheritance(resolvedParent, template)
      case 'replace':
        return this.replaceInheritance(resolvedParent, template)
      case 'extend':
        return this.extendInheritance(resolvedParent, template)
      default:
        return this.mergeInheritance(resolvedParent, template)
    }
  }

  private async getBaseTemplate(baseId: string): Promise<Template | null> {
    // This would normally fetch from a database or storage system
    // For now, return a mock base template
    return {
      id: baseId,
      name: 'Base Template',
      version: '1.0.0',
      type: 'document',
      schema: {
        variables: [],
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
        html: '<div class="base-template">{{content}}</div>',
        css: '.base-template { padding: 20px; }',
        assets: []
      },
      metadata: {
        id: baseId,
        name: 'Base Template',
        tags: ['base'],
        category: 'template',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      }
    }
  }

  private async getTemplateById(templateId: string): Promise<Template | null> {
    // This would normally fetch from a database or storage system
    // For now, return null to indicate not found
    return null
  }

  private mergeStyling(parentStyling: any, childStyling: any): any {
    return {
      fonts: [...(parentStyling.fonts || []), ...(childStyling.fonts || [])],
      colors: {
        ...parentStyling.colors,
        ...childStyling.colors
      },
      spacing: {
        ...parentStyling.spacing,
        ...childStyling.spacing
      },
      customCss: [parentStyling.customCss, childStyling.customCss]
        .filter(Boolean)
        .join('\n')
    }
  }

  private mergeHtmlContent(parentHtml: string, childHtml: string): string {
    // Simple merge strategy - replace content placeholder
    if (parentHtml.includes('{{content}}')) {
      return parentHtml.replace('{{content}}', childHtml)
    }

    // If no placeholder, append child content
    return parentHtml + '\n' + childHtml
  }

  private mergeCssContent(parentCss: string, childCss: string): string {
    return [parentCss, childCss].filter(Boolean).join('\n')
  }

  private applyBrandingToCss(css: string, branding: ClientBranding): string {
    let brandedCss = css

    // Replace color variables
    if (branding.colorPalette) {
      brandedCss = brandedCss.replace(/var\(--color-primary\)/g, branding.colorPalette.primary)
      brandedCss = brandedCss.replace(/var\(--color-secondary\)/g, branding.colorPalette.secondary)
      brandedCss = brandedCss.replace(/var\(--color-accent\)/g, branding.colorPalette.accent)
    }

    // Replace typography variables
    if (branding.typography) {
      brandedCss = brandedCss.replace(/var\(--font-family\)/g, branding.typography.fontFamily)
    }

    // Replace spacing variables
    if (branding.spacing) {
      Object.entries(branding.spacing.scale).forEach(([key, value]) => {
        brandedCss = brandedCss.replace(
          new RegExp(`var\\(--spacing-${key}\\)`, 'g'),
          value
        )
      })
    }

    // Add custom CSS
    if (branding.customCss) {
      brandedCss += '\n' + branding.customCss
    }

    return brandedCss
  }

  private applyBrandingToHtml(html: string, branding: ClientBranding): string {
    let brandedHtml = html

    // Replace asset URLs
    if (branding.assets?.logo) {
      brandedHtml = brandedHtml.replace(/{{logo}}/g, branding.assets.logo.url)
      brandedHtml = brandedHtml.replace(/{{logo_alt}}/g, branding.assets.logo.alt || 'Logo')
    }

    // Replace brand name
    brandedHtml = brandedHtml.replace(/{{brand_name}}/g, branding.name)

    return brandedHtml
  }

  private applyBrandingToStyling(styling: any, branding: ClientBranding): any {
    return {
      ...styling,
      colors: {
        ...styling.colors,
        primary: branding.colorPalette.primary,
        secondary: branding.colorPalette.secondary,
        accent: branding.colorPalette.accent
      },
      fonts: branding.typography ? [
        {
          family: branding.typography.fontFamily,
          size: 16,
          weight: 'normal',
          style: 'normal',
          color: branding.colorPalette.neutral[900]
        },
        ...styling.fonts
      ] : styling.fonts,
      spacing: branding.spacing ? {
        ...styling.spacing,
        ...Object.entries(branding.spacing.scale).reduce((acc, [key, value]) => {
          acc[key] = parseInt(value.replace('px', '')) || 0
          return acc
        }, {} as any)
      } : styling.spacing
    }
  }

  private replaceInheritance(parent: Template, child: Template): Template {
    // Replace strategy - child completely overrides parent
    return {
      ...child,
      inheritance: {
        parentId: parent.id,
        overrides: child.inheritance?.overrides || [],
        mergeStrategy: child.inheritance?.mergeStrategy || 'replace'
      }
    }
  }

  private extendInheritance(parent: Template, child: Template): Template {
    // Extend strategy - child adds to parent without replacing
    return {
      ...parent,
      id: child.id,
      name: child.name,
      version: child.version,
      metadata: {
        ...parent.metadata,
        ...child.metadata,
        id: child.id,
        name: child.name
      },
      schema: {
        variables: [...parent.schema.variables, ...child.schema.variables],
        sections: [...parent.schema.sections, ...child.schema.sections],
        layout: {
          ...parent.schema.layout,
          sections: [
            ...parent.schema.layout.sections,
            ...child.schema.layout.sections
          ]
        },
        styling: {
          ...parent.schema.styling,
          fonts: [...parent.schema.styling.fonts, ...child.schema.styling.fonts],
          customCss: [parent.schema.styling.customCss, child.schema.styling.customCss]
            .filter(Boolean)
            .join('\n')
        }
      },
      content: {
        html: parent.content.html + '\n' + child.content.html,
        css: [parent.content.css, child.content.css].filter(Boolean).join('\n'),
        javascript: child.content.javascript || parent.content.javascript,
        assets: [...(parent.content.assets || []), ...(child.content.assets || [])]
      }
    }
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target }

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (
          typeof source[key] === 'object' &&
          source[key] !== null &&
          !Array.isArray(source[key]) &&
          typeof target[key] === 'object' &&
          target[key] !== null &&
          !Array.isArray(target[key])
        ) {
          result[key] = this.deepMerge(target[key], source[key])
        } else {
          result[key] = source[key]
        }
      }
    }

    return result
  }

  // Component override application
  applyComponentOverrides(template: Template, overrides: BrandComponentOverrides): Template {
    const updatedTemplate = { ...template }

    // Apply component-specific styling overrides
    let css = template.content.css || ''

    Object.entries(overrides).forEach(([component, override]) => {
      // Apply base styles
      css += `\n.${component} { ${this.stylesToCss(override.styles)} }`

      // Apply variant styles
      if (override.variants) {
        Object.entries(override.variants).forEach(([variant, variantStyles]) => {
          css += `\n.${component}--${variant} { ${this.stylesToCss(variantStyles)} }`
        })
      }
    })

    updatedTemplate.content = {
      ...updatedTemplate.content,
      css
    }

    return updatedTemplate
  }

  private stylesToCss(styles: { [key: string]: string }): string {
    return Object.entries(styles)
      .map(([property, value]) => `${this.camelToKebab(property)}: ${value};`)
      .join(' ')
  }

  private camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
  }
}