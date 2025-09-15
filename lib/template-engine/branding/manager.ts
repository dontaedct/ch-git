import {
  ClientBranding,
  BrandColors,
  BrandTypography,
  BrandSpacing,
  BrandComponentOverrides,
  BrandAssets,
  Template
} from '../core/types'

export interface BrandingConfig {
  name: string
  colors: Partial<BrandColors>
  typography?: Partial<BrandTypography>
  spacing?: Partial<BrandSpacing>
  components?: Partial<BrandComponentOverrides>
  assets?: Partial<BrandAssets>
  customCss?: string
}

export class BrandingManager {
  private brandingStore: Map<string, ClientBranding> = new Map()

  async createBranding(clientId: string, config: BrandingConfig): Promise<ClientBranding> {
    const branding: ClientBranding = {
      id: `branding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      name: config.name,
      colorPalette: this.createColorPalette(config.colors),
      typography: this.createTypography(config.typography),
      spacing: this.createSpacing(config.spacing),
      components: this.createComponentOverrides(config.components),
      assets: this.createAssets(config.assets),
      customCss: config.customCss
    }

    this.brandingStore.set(branding.id, branding)
    return branding
  }

  async getBranding(brandingId: string): Promise<ClientBranding | null> {
    return this.brandingStore.get(brandingId) || null
  }

  async updateBranding(brandingId: string, updates: Partial<BrandingConfig>): Promise<ClientBranding> {
    const existing = this.brandingStore.get(brandingId)
    if (!existing) {
      throw new Error(`Branding not found: ${brandingId}`)
    }

    const updated: ClientBranding = {
      ...existing,
      name: updates.name || existing.name,
      colorPalette: updates.colors ? this.createColorPalette(updates.colors) : existing.colorPalette,
      typography: updates.typography ? this.createTypography(updates.typography) : existing.typography,
      spacing: updates.spacing ? this.createSpacing(updates.spacing) : existing.spacing,
      components: updates.components ? this.createComponentOverrides(updates.components) : existing.components,
      assets: updates.assets ? this.createAssets(updates.assets) : existing.assets,
      customCss: updates.customCss !== undefined ? updates.customCss : existing.customCss
    }

    this.brandingStore.set(brandingId, updated)
    return updated
  }

  async deleteBranding(brandingId: string): Promise<boolean> {
    return this.brandingStore.delete(brandingId)
  }

  async listBrandingByClient(clientId: string): Promise<ClientBranding[]> {
    return Array.from(this.brandingStore.values()).filter(b => b.clientId === clientId)
  }

  async applyBrandingToTemplate(template: Template, brandingId: string): Promise<Template> {
    const branding = await this.getBranding(brandingId)
    if (!branding) {
      throw new Error(`Branding not found: ${brandingId}`)
    }

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

  generateCssVariables(branding: ClientBranding): string {
    let css = ':root {\n'

    // Color variables
    css += `  --brand-primary: ${branding.colorPalette.primary};\n`
    css += `  --brand-secondary: ${branding.colorPalette.secondary};\n`
    css += `  --brand-accent: ${branding.colorPalette.accent};\n`

    // Neutral color scale
    Object.entries(branding.colorPalette.neutral).forEach(([key, value]) => {
      css += `  --brand-neutral-${key}: ${value};\n`
    })

    // Semantic colors
    Object.entries(branding.colorPalette.semantic).forEach(([key, value]) => {
      css += `  --brand-${key}: ${value};\n`
    })

    // Typography variables
    css += `  --brand-font-family: ${branding.typography.fontFamily};\n`
    if (branding.typography.headingFont) {
      css += `  --brand-heading-font: ${branding.typography.headingFont};\n`
    }

    // Font sizes
    Object.entries(branding.typography.fontSizes).forEach(([key, value]) => {
      css += `  --brand-text-${key}: ${value};\n`
    })

    // Font weights
    Object.entries(branding.typography.fontWeights).forEach(([key, value]) => {
      css += `  --brand-font-${key}: ${value};\n`
    })

    // Line heights
    Object.entries(branding.typography.lineHeights).forEach(([key, value]) => {
      css += `  --brand-leading-${key}: ${value};\n`
    })

    // Spacing variables
    Object.entries(branding.spacing.scale).forEach(([key, value]) => {
      css += `  --brand-spacing-${key}: ${value};\n`
    })

    css += `  --brand-container-padding: ${branding.spacing.containerPadding};\n`
    css += `  --brand-section-spacing: ${branding.spacing.sectionSpacing};\n`

    css += '}\n'

    return css
  }

  generateUtilityClasses(branding: ClientBranding): string {
    let css = ''

    // Color utilities
    css += `.text-brand-primary { color: var(--brand-primary); }\n`
    css += `.text-brand-secondary { color: var(--brand-secondary); }\n`
    css += `.text-brand-accent { color: var(--brand-accent); }\n`

    css += `.bg-brand-primary { background-color: var(--brand-primary); }\n`
    css += `.bg-brand-secondary { background-color: var(--brand-secondary); }\n`
    css += `.bg-brand-accent { background-color: var(--brand-accent); }\n`

    css += `.border-brand-primary { border-color: var(--brand-primary); }\n`
    css += `.border-brand-secondary { border-color: var(--brand-secondary); }\n`
    css += `.border-brand-accent { border-color: var(--brand-accent); }\n`

    // Typography utilities
    css += `.font-brand { font-family: var(--brand-font-family); }\n`
    if (branding.typography.headingFont) {
      css += `.font-brand-heading { font-family: var(--brand-heading-font); }\n`
    }

    // Font size utilities
    Object.keys(branding.typography.fontSizes).forEach(size => {
      css += `.text-brand-${size} { font-size: var(--brand-text-${size}); }\n`
    })

    // Font weight utilities
    Object.keys(branding.typography.fontWeights).forEach(weight => {
      css += `.font-brand-${weight} { font-weight: var(--brand-font-${weight}); }\n`
    })

    // Spacing utilities
    Object.keys(branding.spacing.scale).forEach(size => {
      css += `.p-brand-${size} { padding: var(--brand-spacing-${size}); }\n`
      css += `.m-brand-${size} { margin: var(--brand-spacing-${size}); }\n`
      css += `.gap-brand-${size} { gap: var(--brand-spacing-${size}); }\n`
    })

    return css
  }

  private createColorPalette(colors: Partial<BrandColors>): BrandColors {
    const defaultNeutral = {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    }

    const defaultSemantic = {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    }

    return {
      primary: colors.primary || '#0066cc',
      secondary: colors.secondary || '#666666',
      accent: colors.accent || '#ff6b35',
      neutral: colors.neutral || defaultNeutral,
      semantic: colors.semantic || defaultSemantic
    }
  }

  private createTypography(typography?: Partial<BrandTypography>): BrandTypography {
    const defaultFontSizes = {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }

    const defaultFontWeights = {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }

    const defaultLineHeights = {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2
    }

    return {
      fontFamily: typography?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      headingFont: typography?.headingFont,
      fontSizes: typography?.fontSizes || defaultFontSizes,
      fontWeights: typography?.fontWeights || defaultFontWeights,
      lineHeights: typography?.lineHeights || defaultLineHeights
    }
  }

  private createSpacing(spacing?: Partial<BrandSpacing>): BrandSpacing {
    const defaultScale = {
      px: '1px',
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem'
    }

    return {
      scale: spacing?.scale || defaultScale,
      containerPadding: spacing?.containerPadding || '1rem',
      sectionSpacing: spacing?.sectionSpacing || '2rem'
    }
  }

  private createComponentOverrides(components?: Partial<BrandComponentOverrides>): BrandComponentOverrides {
    const defaultButton = {
      styles: {
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem',
        fontWeight: '500',
        transition: 'all 0.2s'
      },
      variants: {
        primary: {
          backgroundColor: 'var(--brand-primary)',
          color: 'white'
        },
        secondary: {
          backgroundColor: 'var(--brand-secondary)',
          color: 'white'
        }
      }
    }

    const defaultInput = {
      styles: {
        padding: '0.5rem 0.75rem',
        borderRadius: '0.375rem',
        border: '1px solid var(--brand-neutral-300)',
        fontSize: 'var(--brand-text-base)'
      }
    }

    const defaultCard = {
      styles: {
        borderRadius: '0.5rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }
    }

    return {
      button: components?.button || defaultButton,
      input: components?.input || defaultInput,
      card: components?.card || defaultCard,
      ...components
    }
  }

  private createAssets(assets?: Partial<BrandAssets>): BrandAssets {
    return {
      logo: assets?.logo || { name: 'Logo', url: '' },
      favicon: assets?.favicon,
      images: assets?.images || [],
      fonts: assets?.fonts || []
    }
  }

  private applyBrandingToCss(css: string, branding: ClientBranding): string {
    let brandedCss = css

    // Add CSS variables
    brandedCss = this.generateCssVariables(branding) + '\n' + brandedCss

    // Add utility classes
    brandedCss += '\n' + this.generateUtilityClasses(branding)

    // Add custom CSS
    if (branding.customCss) {
      brandedCss += '\n' + branding.customCss
    }

    return brandedCss
  }

  private applyBrandingToHtml(html: string, branding: ClientBranding): string {
    let brandedHtml = html

    // Replace branding placeholders
    brandedHtml = brandedHtml.replace(/{{brand_name}}/g, branding.name)
    brandedHtml = brandedHtml.replace(/{{brand_logo}}/g, branding.assets.logo.url)
    brandedHtml = brandedHtml.replace(/{{brand_logo_alt}}/g, branding.assets.logo.alt || branding.name)

    // Replace color placeholders
    brandedHtml = brandedHtml.replace(/{{brand_primary}}/g, branding.colorPalette.primary)
    brandedHtml = brandedHtml.replace(/{{brand_secondary}}/g, branding.colorPalette.secondary)
    brandedHtml = brandedHtml.replace(/{{brand_accent}}/g, branding.colorPalette.accent)

    return brandedHtml
  }

  private applyBrandingToStyling(styling: any, branding: ClientBranding): any {
    return {
      ...styling,
      colors: {
        ...styling.colors,
        primary: branding.colorPalette.primary,
        secondary: branding.colorPalette.secondary,
        accent: branding.colorPalette.accent,
        background: branding.colorPalette.neutral[50],
        text: branding.colorPalette.neutral[900],
        border: branding.colorPalette.neutral[200]
      },
      fonts: [
        {
          family: branding.typography.fontFamily,
          size: 16,
          weight: 'normal',
          style: 'normal',
          color: branding.colorPalette.neutral[900]
        },
        ...styling.fonts
      ]
    }
  }

  // Preset branding configurations
  static createMinimalBranding(clientId: string, name: string, primaryColor: string): BrandingConfig {
    return {
      name,
      colors: {
        primary: primaryColor,
        secondary: '#6b7280',
        accent: '#f59e0b'
      }
    }
  }

  static createCorporateBranding(
    clientId: string,
    name: string,
    primaryColor: string,
    logoUrl: string
  ): BrandingConfig {
    return {
      name,
      colors: {
        primary: primaryColor,
        secondary: '#374151',
        accent: '#10b981',
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        }
      },
      typography: {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headingFont: '"Inter", sans-serif'
      },
      assets: {
        logo: { name: 'Company Logo', url: logoUrl }
      }
    }
  }

  static createCreativeBranding(clientId: string, name: string): BrandingConfig {
    return {
      name,
      colors: {
        primary: '#8b5cf6',
        secondary: '#ec4899',
        accent: '#f59e0b',
        neutral: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b'
        }
      },
      typography: {
        fontFamily: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        headingFont: '"Poppins", sans-serif'
      },
      spacing: {
        scale: {
          px: '1px',
          0: '0',
          1: '0.25rem',
          2: '0.5rem',
          3: '0.75rem',
          4: '1rem',
          5: '1.25rem',
          6: '1.5rem',
          8: '2rem',
          10: '2.5rem',
          12: '3rem',
          16: '4rem',
          20: '5rem',
          24: '6rem',
          32: '8rem'
        },
        containerPadding: '1.5rem',
        sectionSpacing: '3rem'
      }
    }
  }
}