/**
 * PDF Document Generation Engine
 * 
 * Handles PDF generation with template system, placeholder mapping,
 * dynamic content injection, and branding capabilities.
 */

import { createWriteStream, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import puppeteer from 'puppeteer'
import handlebars from 'handlebars'
import { v4 as uuidv4 } from 'uuid'

export interface PDFTemplate {
  id: string
  name: string
  description: string
  template: string // HTML template
  styles: string // CSS styles
  metadata: {
    version: string
    createdAt: string
    updatedAt: string
    createdBy: string
  }
  placeholders: PlaceholderDefinition[]
  branding: BrandingConfig
}

export interface PlaceholderDefinition {
  id: string
  name: string
  type: 'text' | 'image' | 'table' | 'signature' | 'date' | 'number' | 'currency'
  required: boolean
  defaultValue?: any
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    format?: string
  }
  styling?: {
    fontSize?: number
    fontWeight?: string
    color?: string
    alignment?: 'left' | 'center' | 'right'
  }
}

export interface BrandingConfig {
  logo?: {
    url: string
    position: 'top-left' | 'top-center' | 'top-right'
    width: number
    height: number
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    text: string
    background: string
  }
  fonts: {
    primary: string
    secondary: string
    heading: string
  }
  layout: {
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
    headerHeight: number
    footerHeight: number
  }
}

export interface FormSubmissionData {
  [key: string]: any
}

export interface PDFGenerationOptions {
  templateId: string
  data: FormSubmissionData
  outputPath?: string
  filename?: string
  format?: 'A4' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  quality?: 'low' | 'medium' | 'high'
  includeMetadata?: boolean
  watermark?: {
    text: string
    opacity: number
    position: 'center' | 'top' | 'bottom'
  }
}

export interface PDFGenerationResult {
  success: boolean
  filePath?: string
  filename?: string
  fileSize?: number
  generationTime?: number
  error?: string
  metadata?: {
    templateId: string
    generatedAt: string
    dataHash: string
  }
}

export interface DocumentVersion {
  id: string
  documentId: string
  version: number
  templateId: string
  data: FormSubmissionData
  generatedAt: string
  generatedBy: string
  filePath: string
  fileSize: number
  changes?: string[]
}

export class PDFEngine {
  private templates: Map<string, PDFTemplate> = new Map()
  private browser: any = null
  private isInitialized = false

  constructor() {
    this.initializeHandlebars()
  }

  /**
   * Initialize the PDF engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      })
      this.isInitialized = true
      console.log('PDF Engine initialized successfully')
    } catch (error) {
      console.error('Failed to initialize PDF Engine:', error)
      throw new Error('PDF Engine initialization failed')
    }
  }

  /**
   * Register a PDF template
   */
  registerTemplate(template: PDFTemplate): void {
    this.templates.set(template.id, template)
    console.log(`Template registered: ${template.name} (${template.id})`)
  }

  /**
   * Get a template by ID
   */
  getTemplate(templateId: string): PDFTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * List all available templates
   */
  listTemplates(): PDFTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Generate PDF from template and data
   */
  async generatePDF(options: PDFGenerationOptions): Promise<PDFGenerationResult> {
    const startTime = Date.now()

    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const template = this.getTemplate(options.templateId)
      if (!template) {
        throw new Error(`Template not found: ${options.templateId}`)
      }

      // Validate data against template placeholders
      const validationResult = this.validateData(template, options.data)
      if (!validationResult.valid) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`)
      }

      // Process template with data
      const processedHTML = await this.processTemplate(template, options.data, options)

      // Generate PDF
      const page = await this.browser.newPage()
      await page.setContent(processedHTML, { waitUntil: 'networkidle0' })

      const filename = options.filename || `${template.name}_${uuidv4()}.pdf`
      const outputPath = options.outputPath || join(process.cwd(), 'generated-documents', filename)

      const pdfBuffer = await page.pdf({
        format: options.format || 'A4',
        landscape: options.orientation === 'landscape',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      })

      await page.close()

      // Write file
      writeFileSync(outputPath, pdfBuffer)

      const generationTime = Date.now() - startTime
      const fileSize = pdfBuffer.length

      return {
        success: true,
        filePath: outputPath,
        filename,
        fileSize,
        generationTime,
        metadata: {
          templateId: options.templateId,
          generatedAt: new Date().toISOString(),
          dataHash: this.generateDataHash(options.data)
        }
      }

    } catch (error) {
      console.error('PDF generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        generationTime: Date.now() - startTime
      }
    }
  }

  /**
   * Generate multiple PDFs in batch
   */
  async generateBatch(
    templateId: string,
    dataArray: FormSubmissionData[],
    options: Partial<PDFGenerationOptions> = {}
  ): Promise<PDFGenerationResult[]> {
    const results: PDFGenerationResult[] = []

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i]
      const batchOptions: PDFGenerationOptions = {
        ...options,
        templateId,
        data,
        filename: options.filename ? `${options.filename}_${i + 1}.pdf` : undefined
      } as PDFGenerationOptions

      const result = await this.generatePDF(batchOptions)
      results.push(result)
    }

    return results
  }

  /**
   * Process template with data and options
   */
  private async processTemplate(
    template: PDFTemplate,
    data: FormSubmissionData,
    options: PDFGenerationOptions
  ): Promise<string> {
    // Create template context
    const context = {
      ...data,
      _metadata: {
        generatedAt: new Date().toISOString(),
        templateName: template.name,
        templateVersion: template.metadata.version
      },
      _branding: template.branding,
      _options: options
    }

    // Compile and render template
    const compiledTemplate = handlebars.compile(template.template)
    let html = compiledTemplate(context)

    // Inject styles
    const styles = this.processStyles(template.styles, template.branding, options)
    html = html.replace('</head>', `<style>${styles}</style></head>`)

    // Add watermark if specified
    if (options.watermark) {
      html = this.addWatermark(html, options.watermark)
    }

    return html
  }

  /**
   * Process CSS styles with branding
   */
  private processStyles(styles: string, branding: BrandingConfig, options: PDFGenerationOptions): string {
    let processedStyles = styles

    // Replace branding variables
    processedStyles = processedStyles.replace(/\{\{branding\.colors\.primary\}\}/g, branding.colors.primary)
    processedStyles = processedStyles.replace(/\{\{branding\.colors\.secondary\}\}/g, branding.colors.secondary)
    processedStyles = processedStyles.replace(/\{\{branding\.colors\.accent\}\}/g, branding.colors.accent)
    processedStyles = processedStyles.replace(/\{\{branding\.colors\.text\}\}/g, branding.colors.text)
    processedStyles = processedStyles.replace(/\{\{branding\.colors\.background\}\}/g, branding.colors.background)

    // Replace font variables
    processedStyles = processedStyles.replace(/\{\{branding\.fonts\.primary\}\}/g, branding.fonts.primary)
    processedStyles = processedStyles.replace(/\{\{branding\.fonts\.secondary\}\}/g, branding.fonts.secondary)
    processedStyles = processedStyles.replace(/\{\{branding\.fonts\.heading\}\}/g, branding.fonts.heading)

    // Add page format styles
    const formatStyles = this.getFormatStyles(options.format || 'A4', options.orientation || 'portrait')
    processedStyles += formatStyles

    return processedStyles
  }

  /**
   * Get CSS styles for page format
   */
  private getFormatStyles(format: string, orientation: string): string {
    const formats = {
      A4: { width: '210mm', height: '297mm' },
      Letter: { width: '8.5in', height: '11in' },
      Legal: { width: '8.5in', height: '14in' }
    }

    const dimensions = formats[format as keyof typeof formats] || formats.A4
    const width = orientation === 'landscape' ? dimensions.height : dimensions.width
    const height = orientation === 'landscape' ? dimensions.width : dimensions.height

    return `
      @page {
        size: ${width} ${height};
        margin: 20mm;
      }
      body {
        width: ${width};
        min-height: ${height};
        margin: 0;
        padding: 0;
      }
    `
  }

  /**
   * Add watermark to HTML
   */
  private addWatermark(html: string, watermark: { text: string; opacity: number; position: string }): string {
    const watermarkStyle = `
      .watermark {
        position: fixed;
        ${watermark.position}: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-45deg);
        font-size: 48px;
        color: rgba(0, 0, 0, ${watermark.opacity});
        z-index: 1000;
        pointer-events: none;
        user-select: none;
      }
    `

    const watermarkHTML = `<div class="watermark">${watermark.text}</div>`

    html = html.replace('</head>', `<style>${watermarkStyle}</style></head>`)
    html = html.replace('</body>', `${watermarkHTML}</body>`)

    return html
  }

  /**
   * Validate data against template placeholders
   */
  private validateData(template: PDFTemplate, data: FormSubmissionData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const placeholder of template.placeholders) {
      if (placeholder.required && !(placeholder.name in data)) {
        errors.push(`Required field missing: ${placeholder.name}`)
        continue
      }

      const value = data[placeholder.name]
      if (value === undefined || value === null) continue

      // Type validation
      if (placeholder.type === 'number' && typeof value !== 'number') {
        errors.push(`Field ${placeholder.name} must be a number`)
      }

      if (placeholder.type === 'date' && !this.isValidDate(value)) {
        errors.push(`Field ${placeholder.name} must be a valid date`)
      }

      // Length validation
      if (placeholder.validation?.minLength && String(value).length < placeholder.validation.minLength) {
        errors.push(`Field ${placeholder.name} is too short (minimum ${placeholder.validation.minLength} characters)`)
      }

      if (placeholder.validation?.maxLength && String(value).length > placeholder.validation.maxLength) {
        errors.push(`Field ${placeholder.name} is too long (maximum ${placeholder.validation.maxLength} characters)`)
      }

      // Pattern validation
      if (placeholder.validation?.pattern && !new RegExp(placeholder.validation.pattern).test(String(value))) {
        errors.push(`Field ${placeholder.name} does not match required pattern`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Check if value is a valid date
   */
  private isValidDate(value: any): boolean {
    if (value instanceof Date) return !isNaN(value.getTime())
    if (typeof value === 'string') return !isNaN(Date.parse(value))
    return false
  }

  /**
   * Generate hash for data
   */
  private generateDataHash(data: FormSubmissionData): string {
    const crypto = require('crypto')
    return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex')
  }

  /**
   * Initialize Handlebars helpers
   */
  private initializeHandlebars(): void {
    // Date formatting helper
    handlebars.registerHelper('formatDate', (date: any, format: string) => {
      if (!date) return ''
      const d = new Date(date)
      if (isNaN(d.getTime())) return ''
      
      switch (format) {
        case 'short': return d.toLocaleDateString()
        case 'long': return d.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
        case 'time': return d.toLocaleTimeString()
        default: return d.toISOString()
      }
    })

    // Currency formatting helper
    handlebars.registerHelper('formatCurrency', (amount: number, currency: string = 'USD') => {
      if (typeof amount !== 'number') return ''
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    })

    // Number formatting helper
    handlebars.registerHelper('formatNumber', (number: number, decimals: number = 2) => {
      if (typeof number !== 'number') return ''
      return number.toFixed(decimals)
    })

    // Conditional helper
    handlebars.registerHelper('ifEquals', function(arg1: any, arg2: any, options: any) {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this)
    })

    // Loop helper with index
    handlebars.registerHelper('eachWithIndex', function(array: any[], options: any) {
      let result = ''
      for (let i = 0; i < array.length; i++) {
        result += options.fn({ ...array[i], index: i, isFirst: i === 0, isLast: i === array.length - 1 })
      }
      return result
    })
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
    this.isInitialized = false
  }
}

// Export singleton instance
export const pdfEngine = new PDFEngine()

// Export default templates
export const defaultTemplates: PDFTemplate[] = [
  {
    id: 'invoice-template',
    name: 'Invoice Template',
    description: 'Professional invoice template with company branding',
    template: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice</title>
      </head>
      <body>
        <div class="header">
          {{#if branding.logo}}
          <img src="{{branding.logo.url}}" alt="Logo" class="logo">
          {{/if}}
          <h1>INVOICE</h1>
        </div>
        
        <div class="invoice-details">
          <div class="from">
            <h3>From:</h3>
            <p>{{companyName}}</p>
            <p>{{companyAddress}}</p>
            <p>{{companyPhone}}</p>
            <p>{{companyEmail}}</p>
          </div>
          
          <div class="to">
            <h3>To:</h3>
            <p>{{clientName}}</p>
            <p>{{clientAddress}}</p>
            <p>{{clientEmail}}</p>
          </div>
        </div>
        
        <div class="invoice-info">
          <p><strong>Invoice #:</strong> {{invoiceNumber}}</p>
          <p><strong>Date:</strong> {{formatDate invoiceDate 'short'}}</p>
          <p><strong>Due Date:</strong> {{formatDate dueDate 'short'}}</p>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each items}}
            <tr>
              <td>{{description}}</td>
              <td>{{quantity}}</td>
              <td>{{formatCurrency rate}}</td>
              <td>{{formatCurrency amount}}</td>
            </tr>
            {{/each}}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>Total:</strong></td>
              <td><strong>{{formatCurrency total}}</strong></td>
            </tr>
          </tfoot>
        </table>
        
        <div class="footer">
          <p>{{notes}}</p>
        </div>
      </body>
      </html>
    `,
    styles: `
      body {
        font-family: {{branding.fonts.primary}};
        color: {{branding.colors.text}};
        background-color: {{branding.colors.background}};
        margin: 0;
        padding: 20px;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 2px solid {{branding.colors.primary}};
        padding-bottom: 20px;
      }
      
      .logo {
        max-height: 80px;
        max-width: 200px;
      }
      
      h1 {
        color: {{branding.colors.primary}};
        font-family: {{branding.fonts.heading}};
        margin: 0;
      }
      
      .invoice-details {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      
      .from, .to {
        flex: 1;
      }
      
      .invoice-info {
        margin-bottom: 30px;
      }
      
      .items-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 30px;
      }
      
      .items-table th,
      .items-table td {
        border: 1px solid #ddd;
        padding: 12px;
        text-align: left;
      }
      
      .items-table th {
        background-color: {{branding.colors.primary}};
        color: white;
        font-weight: bold;
      }
      
      .items-table tfoot {
        background-color: #f5f5f5;
      }
      
      .footer {
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #ddd;
      }
    `,
    metadata: {
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    },
    placeholders: [
      {
        id: 'companyName',
        name: 'companyName',
        type: 'text',
        required: true,
        styling: { fontSize: 16, fontWeight: 'bold' }
      },
      {
        id: 'clientName',
        name: 'clientName',
        type: 'text',
        required: true
      },
      {
        id: 'invoiceNumber',
        name: 'invoiceNumber',
        type: 'text',
        required: true
      },
      {
        id: 'invoiceDate',
        name: 'invoiceDate',
        type: 'date',
        required: true
      },
      {
        id: 'dueDate',
        name: 'dueDate',
        type: 'date',
        required: true
      },
      {
        id: 'items',
        name: 'items',
        type: 'table',
        required: true
      },
      {
        id: 'total',
        name: 'total',
        type: 'currency',
        required: true
      }
    ],
    branding: {
      colors: {
        primary: '#2563eb',
        secondary: '#64748b',
        accent: '#f59e0b',
        text: '#1f2937',
        background: '#ffffff'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Arial, sans-serif',
        heading: 'Arial, sans-serif'
      },
      layout: {
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        headerHeight: 100,
        footerHeight: 50
      }
    }
  }
]

// Initialize with default templates
defaultTemplates.forEach(template => {
  pdfEngine.registerTemplate(template)
})
