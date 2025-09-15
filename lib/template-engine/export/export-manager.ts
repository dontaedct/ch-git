import {
  ComposedTemplate,
  RenderedOutput,
  DocumentTemplate,
  ClientBranding,
  TemplateData,
  ResolvedAsset
} from '../core/types'
import { PDFExportService, PDFExportOptions, PDFRenderResult } from './pdf-service'
import { HTMLExportService, HTMLExportOptions, HTMLRenderResult } from './html-service'
import { BrandingManager } from '../branding/manager'

export interface ExportOptions {
  format: 'pdf' | 'html' | 'both'
  quality: 'draft' | 'standard' | 'high'
  clientCustomization?: {
    brandingId?: string
    theme?: 'light' | 'dark' | 'auto'
    customCSS?: string
    customJS?: string
    watermark?: {
      text: string
      opacity: number
      position: 'center' | 'diagonal' | 'corner'
    }
  }
  delivery?: {
    method: 'download' | 'email' | 'storage'
    filename?: string
    metadata?: any
  }
  optimization?: {
    compress: boolean
    minify: boolean
    responsive: boolean
    accessibility: boolean
    seo: boolean
  }
}

export interface ExportResult {
  pdf?: PDFRenderResult
  html?: HTMLRenderResult
  success: boolean
  errors: string[]
  warnings: string[]
  metadata: {
    exportedAt: Date
    totalSize: number
    processingTime: number
    formats: string[]
  }
}

export interface ClientCustomizationProfile {
  id: string
  name: string
  brandingId: string
  defaultTheme: 'light' | 'dark' | 'auto'
  customCSS: string
  customJS: string
  watermarkSettings?: {
    text: string
    opacity: number
    color: string
    fontSize: number
    rotation: number
  }
  exportPreferences: {
    defaultFormat: 'pdf' | 'html'
    quality: 'draft' | 'standard' | 'high'
    compression: boolean
    optimization: boolean
  }
}

export class ExportManager {
  private pdfService: PDFExportService
  private htmlService: HTMLExportService
  private brandingManager: BrandingManager
  private customizationProfiles: Map<string, ClientCustomizationProfile> = new Map()

  constructor() {
    this.pdfService = new PDFExportService()
    this.htmlService = new HTMLExportService()
    this.brandingManager = new BrandingManager()
  }

  async exportDocument(
    template: DocumentTemplate | ComposedTemplate,
    data: TemplateData,
    options: ExportOptions
  ): Promise<ExportResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const result: ExportResult = {
      success: false,
      errors,
      warnings,
      metadata: {
        exportedAt: new Date(),
        totalSize: 0,
        processingTime: 0,
        formats: []
      }
    }

    try {
      // Prepare template for export
      const composed = await this.prepareTemplate(template, data, options)

      // Apply client customization
      const customizedTemplate = await this.applyClientCustomization(composed, options)

      // Export to requested formats
      if (options.format === 'pdf' || options.format === 'both') {
        try {
          const pdfOptions = this.buildPDFOptions(options)
          result.pdf = await this.pdfService.exportToPDF(customizedTemplate, pdfOptions)
          result.metadata.formats.push('pdf')
          result.metadata.totalSize += result.pdf.size
        } catch (error) {
          errors.push(`PDF export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      if (options.format === 'html' || options.format === 'both') {
        try {
          const htmlOptions = this.buildHTMLOptions(options)
          result.html = await this.htmlService.exportToHTML(customizedTemplate, htmlOptions)
          result.metadata.formats.push('html')
          result.metadata.totalSize += result.html.size
        } catch (error) {
          errors.push(`HTML export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      // Check if at least one format succeeded
      result.success = result.metadata.formats.length > 0 && errors.length === 0

      // Apply post-processing optimizations
      if (options.optimization) {
        await this.applyOptimizations(result, options.optimization)
      }

    } catch (error) {
      errors.push(`Export preparation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    result.metadata.processingTime = Date.now() - startTime
    return result
  }

  async createCustomizationProfile(
    clientId: string,
    name: string,
    config: Partial<ClientCustomizationProfile>
  ): Promise<ClientCustomizationProfile> {
    const profile: ClientCustomizationProfile = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      brandingId: config.brandingId || '',
      defaultTheme: config.defaultTheme || 'light',
      customCSS: config.customCSS || '',
      customJS: config.customJS || '',
      watermarkSettings: config.watermarkSettings,
      exportPreferences: {
        defaultFormat: 'html',
        quality: 'standard',
        compression: true,
        optimization: true,
        ...config.exportPreferences
      }
    }

    this.customizationProfiles.set(profile.id, profile)
    return profile
  }

  async getCustomizationProfile(profileId: string): Promise<ClientCustomizationProfile | null> {
    return this.customizationProfiles.get(profileId) || null
  }

  async updateCustomizationProfile(
    profileId: string,
    updates: Partial<ClientCustomizationProfile>
  ): Promise<ClientCustomizationProfile> {
    const existing = this.customizationProfiles.get(profileId)
    if (!existing) {
      throw new Error(`Customization profile not found: ${profileId}`)
    }

    const updated: ClientCustomizationProfile = {
      ...existing,
      ...updates,
      exportPreferences: {
        ...existing.exportPreferences,
        ...updates.exportPreferences
      }
    }

    this.customizationProfiles.set(profileId, updated)
    return updated
  }

  async exportWithProfile(
    template: DocumentTemplate | ComposedTemplate,
    data: TemplateData,
    profileId: string,
    overrideOptions?: Partial<ExportOptions>
  ): Promise<ExportResult> {
    const profile = await this.getCustomizationProfile(profileId)
    if (!profile) {
      throw new Error(`Customization profile not found: ${profileId}`)
    }

    const options: ExportOptions = {
      format: profile.exportPreferences.defaultFormat,
      quality: profile.exportPreferences.quality,
      clientCustomization: {
        brandingId: profile.brandingId,
        theme: profile.defaultTheme,
        customCSS: profile.customCSS,
        customJS: profile.customJS,
        watermark: profile.watermarkSettings ? {
          text: profile.watermarkSettings.text,
          opacity: profile.watermarkSettings.opacity,
          position: 'center'
        } : undefined
      },
      optimization: {
        compress: profile.exportPreferences.compression,
        minify: profile.exportPreferences.optimization,
        responsive: true,
        accessibility: true,
        seo: true
      },
      ...overrideOptions
    }

    return this.exportDocument(template, data, options)
  }

  async batchExport(
    templates: Array<{ template: DocumentTemplate | ComposedTemplate; data: TemplateData; filename?: string }>,
    options: ExportOptions
  ): Promise<{ results: ExportResult[]; summary: BatchExportSummary }> {
    const results: ExportResult[] = []
    const summary: BatchExportSummary = {
      total: templates.length,
      successful: 0,
      failed: 0,
      totalSize: 0,
      totalTime: 0,
      errors: []
    }

    for (let i = 0; i < templates.length; i++) {
      const { template, data, filename } = templates[i]

      try {
        const exportOptions: ExportOptions = {
          ...options,
          delivery: {
            method: options.delivery?.method || 'download',
            ...options.delivery,
            filename: filename || `document_${i + 1}`
          }
        }

        const result = await this.exportDocument(template, data, exportOptions)
        results.push(result)

        if (result.success) {
          summary.successful++
        } else {
          summary.failed++
          summary.errors.push(...result.errors)
        }

        summary.totalSize += result.metadata.totalSize
        summary.totalTime += result.metadata.processingTime

      } catch (error) {
        summary.failed++
        summary.errors.push(`Template ${i + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

        results.push({
          success: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          metadata: {
            exportedAt: new Date(),
            totalSize: 0,
            processingTime: 0,
            formats: []
          }
        })
      }
    }

    return { results, summary }
  }

  private async prepareTemplate(
    template: DocumentTemplate | ComposedTemplate,
    data: TemplateData,
    options: ExportOptions
  ): Promise<ComposedTemplate> {
    // If already composed, return as-is
    if ('compiledContent' in template) {
      return template
    }

    // Process document template
    const processedHtml = this.processTemplateContent(template.content.html, data)
    const processedCss = this.processTemplateContent(template.content.css || '', data)

    return {
      template,
      data,
      compiledContent: {
        html: processedHtml,
        css: processedCss,
        javascript: template.content.javascript,
        assets: (template.content.assets || []) as unknown as ResolvedAsset[]
      },
      metadata: {
        composedAt: new Date(),
        renderTime: 0,
        cacheKey: '',
        dependencies: []
      }
    }
  }

  private async applyClientCustomization(
    composed: ComposedTemplate,
    options: ExportOptions
  ): Promise<ComposedTemplate> {
    if (!options.clientCustomization?.brandingId) {
      return composed
    }

    // Apply branding
    const branding = await this.brandingManager.getBranding(options.clientCustomization.brandingId)
    if (branding) {
      const brandedTemplate = await this.brandingManager.applyBrandingToTemplate(
        composed.template,
        options.clientCustomization.brandingId
      )

      return {
        ...composed,
        template: brandedTemplate
      }
    }

    return composed
  }

  private buildPDFOptions(options: ExportOptions): Partial<PDFExportOptions> {
    const pdfOptions: Partial<PDFExportOptions> = {
      quality: options.quality === 'high' ? 'high' : options.quality === 'draft' ? 'low' : 'medium',
      compression: options.optimization?.compress ?? true
    }

    // Add watermark if specified
    if (options.clientCustomization?.watermark) {
      pdfOptions.watermark = {
        text: options.clientCustomization.watermark.text,
        opacity: options.clientCustomization.watermark.opacity,
        fontSize: 24,
        color: '#cccccc',
        rotation: options.clientCustomization.watermark.position === 'diagonal' ? -45 : 0
      }
    }

    return pdfOptions
  }

  private buildHTMLOptions(options: ExportOptions): Partial<HTMLExportOptions> {
    return {
      format: 'standalone',
      minify: options.optimization?.minify ?? false,
      responsive: options.optimization?.responsive ?? true,
      accessibility: options.optimization?.accessibility ?? true,
      seo: options.optimization?.seo ?? true,
      clientCustomization: options.clientCustomization
    }
  }

  private async applyOptimizations(result: ExportResult, optimization: NonNullable<ExportOptions['optimization']>): Promise<void> {
    // Apply compression if requested and not already done
    if (optimization.compress && result.pdf && !result.pdf.metadata.producer.includes('compressed')) {
      try {
        result.pdf.content = await this.pdfService.compressPDF(result.pdf.content, 'medium')
      } catch (error) {
        result.warnings.push('PDF compression failed')
      }
    }

    // Apply HTML optimizations
    if (result.html && optimization.minify) {
      try {
        // Additional HTML optimizations could be applied here
        result.html.metadata.generatedAt = new Date()
      } catch (error) {
        result.warnings.push('HTML optimization failed')
      }
    }
  }

  private processTemplateContent(content: string, data: TemplateData): string {
    let processed = content

    // Replace template variables
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, String(value))
    })

    return processed
  }

  // Utility methods for export management
  async getExportHistory(clientId: string, limit: number = 10): Promise<ExportHistoryEntry[]> {
    // In a real implementation, this would query a database
    return []
  }

  async getExportStatistics(clientId: string, timeframe: 'day' | 'week' | 'month'): Promise<ExportStatistics> {
    // In a real implementation, this would calculate from stored data
    return {
      totalExports: 0,
      formatBreakdown: { pdf: 0, html: 0 },
      averageSize: 0,
      averageProcessingTime: 0,
      successRate: 100
    }
  }

  async validateExportOptions(options: ExportOptions): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!['pdf', 'html', 'both'].includes(options.format)) {
      errors.push('Invalid format specified')
    }

    if (!['draft', 'standard', 'high'].includes(options.quality)) {
      errors.push('Invalid quality specified')
    }

    if (options.clientCustomization?.brandingId) {
      const branding = await this.brandingManager.getBranding(options.clientCustomization.brandingId)
      if (!branding) {
        errors.push('Specified branding not found')
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

interface BatchExportSummary {
  total: number
  successful: number
  failed: number
  totalSize: number
  totalTime: number
  errors: string[]
}

interface ExportHistoryEntry {
  id: string
  clientId: string
  templateId: string
  format: string
  exportedAt: Date
  size: number
  processingTime: number
  success: boolean
}

interface ExportStatistics {
  totalExports: number
  formatBreakdown: { pdf: number; html: number }
  averageSize: number
  averageProcessingTime: number
  successRate: number
}