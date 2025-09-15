import {
  DocumentTemplate,
  TemplateVariable,
  ClientBranding,
  TemplateData
} from '../core/types'
import { TemplatePattern } from './library'

export interface CustomizationOptions {
  colors?: {
    primary?: string
    secondary?: string
    accent?: string
    background?: string
    text?: string
  }
  typography?: {
    headingFont?: string
    bodyFont?: string
    fontSize?: 'small' | 'medium' | 'large'
  }
  spacing?: {
    compact?: boolean
    sectionSpacing?: 'tight' | 'normal' | 'loose'
    paragraphSpacing?: 'tight' | 'normal' | 'loose'
  }
  layout?: {
    pageSize?: 'A4' | 'Letter' | 'Legal'
    orientation?: 'portrait' | 'landscape'
    margins?: 'narrow' | 'normal' | 'wide'
  }
  content?: {
    includeHeader?: boolean
    includeFooter?: boolean
    includePageNumbers?: boolean
    includeTOC?: boolean
  }
  branding?: {
    logo?: string
    companyName?: string
    colors?: any
    fonts?: any
  }
}

export interface CustomizationPreset {
  id: string
  name: string
  description: string
  category: 'professional' | 'creative' | 'minimal' | 'corporate'
  options: CustomizationOptions
  preview?: string
}

export interface SectionCustomization {
  sectionId: string
  content?: string
  variables?: TemplateVariable[]
  styling?: any
  visible?: boolean
  order?: number
}

export interface VariableCustomization {
  name: string
  label?: string
  type?: string
  required?: boolean
  defaultValue?: any
  description?: string
  validation?: any
  options?: string[]
}

export class TemplateCustomizationService {
  private presets: Map<string, CustomizationPreset> = new Map()

  constructor() {
    this.initializePresets()
  }

  // Customization Presets
  getPreset(presetId: string): CustomizationPreset | null {
    return this.presets.get(presetId) || null
  }

  getPresetsByCategory(category: string): CustomizationPreset[] {
    return Array.from(this.presets.values())
      .filter(preset => preset.category === category)
  }

  getAllPresets(): CustomizationPreset[] {
    return Array.from(this.presets.values())
  }

  // Template Customization
  customizeTemplate(
    template: DocumentTemplate,
    options: CustomizationOptions
  ): DocumentTemplate {
    const customized = JSON.parse(JSON.stringify(template)) // Deep clone

    // Apply color customizations
    if (options.colors) {
      this.applyColorCustomizations(customized, options.colors)
    }

    // Apply typography customizations
    if (options.typography) {
      this.applyTypographyCustomizations(customized, options.typography)
    }

    // Apply spacing customizations
    if (options.spacing) {
      this.applySpacingCustomizations(customized, options.spacing)
    }

    // Apply layout customizations
    if (options.layout) {
      this.applyLayoutCustomizations(customized, options.layout)
    }

    // Apply content customizations
    if (options.content) {
      this.applyContentCustomizations(customized, options.content)
    }

    // Apply branding customizations
    if (options.branding) {
      this.applyBrandingCustomizations(customized, options.branding)
    }

    // Update metadata
    customized.metadata.updatedAt = new Date()
    customized.id = `customized_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return customized
  }

  customizeFromPreset(
    template: DocumentTemplate,
    presetId: string,
    additionalOptions?: Partial<CustomizationOptions>
  ): DocumentTemplate {
    const preset = this.getPreset(presetId)
    if (!preset) {
      throw new Error(`Preset not found: ${presetId}`)
    }

    const options = {
      ...preset.options,
      ...additionalOptions
    }

    return this.customizeTemplate(template, options)
  }

  // Section-level Customization
  customizeSections(
    template: DocumentTemplate,
    sectionCustomizations: SectionCustomization[]
  ): DocumentTemplate {
    const customized = JSON.parse(JSON.stringify(template))

    sectionCustomizations.forEach(customization => {
      const section = customized.sections.find((s: any) => s.id === customization.sectionId)
      if (section) {
        if (customization.content !== undefined) {
          section.content = customization.content
        }
        if (customization.variables !== undefined) {
          section.variables = customization.variables.map(v => v.name)
        }
        if (customization.visible === false) {
          // Mark section as hidden
          section.conditional = {
            variable: '__hidden',
            operator: 'equals',
            value: false
          }
        }
        if (customization.order !== undefined) {
          section.order = customization.order
        }
      }
    })

    // Sort sections by order if specified
    customized.sections.sort((a: any, b: any) => (a.order || 0) - (b.order || 0))

    return customized
  }

  // Variable-level Customization
  customizeVariables(
    template: DocumentTemplate,
    variableCustomizations: VariableCustomization[]
  ): DocumentTemplate {
    const customized = JSON.parse(JSON.stringify(template))

    variableCustomizations.forEach(customization => {
      const variable = customized.schema.variables.find((v: any) => v.name === customization.name)
      if (variable) {
        if (customization.label !== undefined) {
          variable.label = customization.label
        }
        if (customization.type !== undefined) {
          variable.type = customization.type as any
        }
        if (customization.required !== undefined) {
          variable.required = customization.required
        }
        if (customization.defaultValue !== undefined) {
          variable.defaultValue = customization.defaultValue
        }
        if (customization.description !== undefined) {
          variable.description = customization.description
        }
        if (customization.validation !== undefined) {
          variable.validation = customization.validation
        }
      }
    })

    return customized
  }

  // Style Generation
  generateCustomCSS(options: CustomizationOptions): string {
    let css = '/* Custom Template Styles */\n'

    // Color variables
    if (options.colors) {
      css += ':root {\n'
      if (options.colors.primary) css += `  --color-primary: ${options.colors.primary};\n`
      if (options.colors.secondary) css += `  --color-secondary: ${options.colors.secondary};\n`
      if (options.colors.accent) css += `  --color-accent: ${options.colors.accent};\n`
      if (options.colors.background) css += `  --color-background: ${options.colors.background};\n`
      if (options.colors.text) css += `  --color-text: ${options.colors.text};\n`
      css += '}\n\n'
    }

    // Typography
    if (options.typography) {
      css += '.document-container {\n'
      if (options.typography.bodyFont) {
        css += `  font-family: ${options.typography.bodyFont};\n`
      }
      if (options.typography.fontSize) {
        const sizes = {
          small: '14px',
          medium: '16px',
          large: '18px'
        }
        css += `  font-size: ${sizes[options.typography.fontSize]};\n`
      }
      css += '}\n\n'

      css += 'h1, h2, h3, h4, h5, h6 {\n'
      if (options.typography.headingFont) {
        css += `  font-family: ${options.typography.headingFont};\n`
      }
      if (options.colors?.primary) {
        css += `  color: ${options.colors.primary};\n`
      }
      css += '}\n\n'
    }

    // Spacing
    if (options.spacing) {
      if (options.spacing.sectionSpacing) {
        const spacing = {
          tight: '1rem',
          normal: '1.5rem',
          loose: '2.5rem'
        }
        css += `.section {\n  margin-bottom: ${spacing[options.spacing.sectionSpacing]};\n}\n\n`
      }

      if (options.spacing.paragraphSpacing) {
        const spacing = {
          tight: '0.5rem',
          normal: '1rem',
          loose: '1.5rem'
        }
        css += `p {\n  margin-bottom: ${spacing[options.spacing.paragraphSpacing]};\n}\n\n`
      }

      if (options.spacing.compact) {
        css += `.document-container {\n  padding: 20px;\n}\n\n`
      }
    }

    // Layout
    if (options.layout) {
      if (options.layout.margins) {
        const margins = {
          narrow: '0.5in',
          normal: '1in',
          wide: '1.5in'
        }
        css += `@page {\n  margin: ${margins[options.layout.margins]};\n}\n\n`
      }
    }

    return css
  }

  // Preview Generation
  generatePreview(
    template: DocumentTemplate,
    options: CustomizationOptions,
    sampleData?: TemplateData
  ): string {
    const customized = this.customizeTemplate(template, options)
    const customCSS = this.generateCustomCSS(options)

    // Apply sample data if not provided
    const data = sampleData || this.generateSampleData(customized)

    // Replace variables in HTML
    let html = customized.content.html
    customized.schema.variables.forEach(variable => {
      const value = data[variable.name] || variable.defaultValue || `[${variable.name}]`
      html = html.replace(new RegExp(`{{${variable.name}}}`, 'g'), String(value))
    })

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Template Preview</title>
    <style>
        ${customized.content.css}
        ${customCSS}
        .preview-container {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ddd;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="preview-container">
        ${html}
    </div>
</body>
</html>`
  }

  // Validation
  validateCustomization(
    template: DocumentTemplate,
    options: CustomizationOptions
  ): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = []
    const warnings: string[] = []

    // Validate colors
    if (options.colors) {
      Object.entries(options.colors).forEach(([key, value]) => {
        if (value && !this.isValidColor(value)) {
          errors.push(`Invalid color value for ${key}: ${value}`)
        }
      })
    }

    // Validate typography
    if (options.typography) {
      if (options.typography.fontSize && !['small', 'medium', 'large'].includes(options.typography.fontSize)) {
        errors.push(`Invalid font size: ${options.typography.fontSize}`)
      }
    }

    // Validate layout
    if (options.layout) {
      if (options.layout.pageSize && !['A4', 'Letter', 'Legal'].includes(options.layout.pageSize)) {
        errors.push(`Invalid page size: ${options.layout.pageSize}`)
      }
      if (options.layout.orientation && !['portrait', 'landscape'].includes(options.layout.orientation)) {
        errors.push(`Invalid orientation: ${options.layout.orientation}`)
      }
    }

    // Add warnings for potentially problematic combinations
    if (options.colors?.primary === options.colors?.background) {
      warnings.push('Primary color is the same as background color - text may not be visible')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  // Utility Methods
  private initializePresets(): void {
    // Professional Preset
    this.presets.set('professional', {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, professional styling suitable for business documents',
      category: 'professional',
      options: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#0ea5e9',
          background: '#ffffff',
          text: '#1e293b'
        },
        typography: {
          headingFont: 'Inter, sans-serif',
          bodyFont: 'Inter, sans-serif',
          fontSize: 'medium'
        },
        spacing: {
          sectionSpacing: 'normal',
          paragraphSpacing: 'normal',
          compact: false
        },
        layout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: 'normal'
        },
        content: {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          includeTOC: false
        }
      }
    })

    // Creative Preset
    this.presets.set('creative', {
      id: 'creative',
      name: 'Creative',
      description: 'Vibrant, modern styling for creative industries',
      category: 'creative',
      options: {
        colors: {
          primary: '#7c3aed',
          secondary: '#ec4899',
          accent: '#f59e0b',
          background: '#fefefe',
          text: '#1f2937'
        },
        typography: {
          headingFont: 'Poppins, sans-serif',
          bodyFont: 'Inter, sans-serif',
          fontSize: 'medium'
        },
        spacing: {
          sectionSpacing: 'loose',
          paragraphSpacing: 'normal',
          compact: false
        },
        layout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: 'wide'
        },
        content: {
          includeHeader: true,
          includeFooter: false,
          includePageNumbers: false,
          includeTOC: false
        }
      }
    })

    // Minimal Preset
    this.presets.set('minimal', {
      id: 'minimal',
      name: 'Minimal',
      description: 'Clean, minimal design with focus on content',
      category: 'minimal',
      options: {
        colors: {
          primary: '#374151',
          secondary: '#6b7280',
          accent: '#9ca3af',
          background: '#ffffff',
          text: '#1f2937'
        },
        typography: {
          headingFont: 'Inter, sans-serif',
          bodyFont: 'Inter, sans-serif',
          fontSize: 'medium'
        },
        spacing: {
          sectionSpacing: 'tight',
          paragraphSpacing: 'tight',
          compact: true
        },
        layout: {
          pageSize: 'A4',
          orientation: 'portrait',
          margins: 'narrow'
        },
        content: {
          includeHeader: false,
          includeFooter: false,
          includePageNumbers: true,
          includeTOC: false
        }
      }
    })

    // Corporate Preset
    this.presets.set('corporate', {
      id: 'corporate',
      name: 'Corporate',
      description: 'Traditional corporate styling for formal documents',
      category: 'corporate',
      options: {
        colors: {
          primary: '#1f2937',
          secondary: '#374151',
          accent: '#6b7280',
          background: '#ffffff',
          text: '#111827'
        },
        typography: {
          headingFont: 'Times New Roman, serif',
          bodyFont: 'Times New Roman, serif',
          fontSize: 'medium'
        },
        spacing: {
          sectionSpacing: 'normal',
          paragraphSpacing: 'normal',
          compact: false
        },
        layout: {
          pageSize: 'Letter',
          orientation: 'portrait',
          margins: 'normal'
        },
        content: {
          includeHeader: true,
          includeFooter: true,
          includePageNumbers: true,
          includeTOC: true
        }
      }
    })
  }

  private applyColorCustomizations(template: DocumentTemplate, colors: NonNullable<CustomizationOptions['colors']>): void {
    if (colors.primary) template.schema.styling.colors.primary = colors.primary
    if (colors.secondary) template.schema.styling.colors.secondary = colors.secondary
    if (colors.accent) template.schema.styling.colors.accent = colors.accent
    if (colors.background) template.schema.styling.colors.background = colors.background
    if (colors.text) template.schema.styling.colors.text = colors.text
  }

  private applyTypographyCustomizations(template: DocumentTemplate, typography: NonNullable<CustomizationOptions['typography']>): void {
    if (typography.bodyFont || typography.headingFont) {
      const font = {
        family: typography.bodyFont || 'Inter, sans-serif',
        size: typography.fontSize === 'small' ? 14 : typography.fontSize === 'large' ? 18 : 16,
        weight: 'normal' as const,
        style: 'normal' as const,
        color: template.schema.styling.colors.text
      }
      template.schema.styling.fonts = [font, ...template.schema.styling.fonts]
    }
  }

  private applySpacingCustomizations(template: DocumentTemplate, spacing: NonNullable<CustomizationOptions['spacing']>): void {
    if (spacing.compact) {
      template.schema.styling.spacing = {
        small: 4,
        medium: 8,
        large: 12,
        xlarge: 16
      }
    }
  }

  private applyLayoutCustomizations(template: DocumentTemplate, layout: NonNullable<CustomizationOptions['layout']>): void {
    if (layout.pageSize || layout.orientation) {
      const sizes = {
        A4: { width: 210, height: 297 },
        Letter: { width: 216, height: 279 },
        Legal: { width: 216, height: 356 }
      }

      const size = sizes[layout.pageSize || 'A4']
      template.pageSettings.size = {
        width: layout.orientation === 'landscape' ? size.height : size.width,
        height: layout.orientation === 'landscape' ? size.width : size.height,
        unit: 'mm'
      }
      template.pageSettings.orientation = layout.orientation || 'portrait'
    }

    if (layout.margins) {
      const margins = {
        narrow: 12.7,
        normal: 25.4,
        wide: 38.1
      }
      const margin = margins[layout.margins]
      template.pageSettings.margins = {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin,
        unit: 'mm'
      }
    }
  }

  private applyContentCustomizations(template: DocumentTemplate, content: NonNullable<CustomizationOptions['content']>): void {
    if (!content.includeHeader) {
      template.pageSettings.header = undefined
    }
    if (!content.includeFooter) {
      template.pageSettings.footer = undefined
    }
    // Additional content customizations would be implemented here
  }

  private applyBrandingCustomizations(template: DocumentTemplate, branding: NonNullable<CustomizationOptions['branding']>): void {
    if (branding.logo) {
      template.content.html = template.content.html.replace(
        /{{logo}}/g,
        `<img src="${branding.logo}" alt="Logo" class="logo">`
      )
    }
    if (branding.companyName) {
      template.content.html = template.content.html.replace(
        /{{company_name}}/g,
        branding.companyName
      )
    }
  }

  private isValidColor(color: string): boolean {
    // Simple color validation - in production would be more comprehensive
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color) ||
           /^rgb\(\d+,\s*\d+,\s*\d+\)$/.test(color) ||
           /^rgba\(\d+,\s*\d+,\s*\d+,\s*[01]?\.?\d*\)$/.test(color)
  }

  private generateSampleData(template: DocumentTemplate): TemplateData {
    const data: TemplateData = {}

    template.schema.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          data[variable.name] = variable.defaultValue || `Sample ${variable.name}`
          break
        case 'number':
          data[variable.name] = variable.defaultValue || 100
          break
        case 'date':
          data[variable.name] = variable.defaultValue || new Date().toISOString().split('T')[0]
          break
        case 'boolean':
          data[variable.name] = variable.defaultValue || true
          break
        case 'array':
          data[variable.name] = variable.defaultValue || [`Sample item 1`, `Sample item 2`]
          break
        default:
          data[variable.name] = variable.defaultValue || 'Sample value'
      }
    })

    return data
  }
}