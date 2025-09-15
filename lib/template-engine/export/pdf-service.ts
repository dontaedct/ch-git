import {
  ComposedTemplate,
  RenderedOutput,
  RenderMetadata,
  DocumentTemplate,
  PageSettings,
  ClientBranding
} from '../core/types'

export interface PDFExportOptions {
  format: 'A4' | 'A3' | 'Letter' | 'Legal' | 'Custom'
  orientation: 'portrait' | 'landscape'
  margins: {
    top: number
    right: number
    bottom: number
    left: number
    unit: 'mm' | 'in' | 'px'
  }
  quality: 'low' | 'medium' | 'high'
  compression: boolean
  metadata: {
    title?: string
    author?: string
    subject?: string
    keywords?: string[]
    creator?: string
  }
  watermark?: {
    text: string
    opacity: number
    fontSize: number
    color: string
    rotation: number
  }
  headerFooter?: {
    displayHeaderFooter: boolean
    headerTemplate?: string
    footerTemplate?: string
    printBackground: boolean
  }
}

export interface PDFRenderResult {
  content: Buffer
  metadata: PDFMetadata
  size: number
  pageCount: number
  renderTime: number
}

export interface PDFMetadata {
  title: string
  author: string
  subject: string
  keywords: string[]
  creator: string
  producer: string
  creationDate: Date
  modificationDate: Date
}

export class PDFExportService {
  private defaultOptions: PDFExportOptions = {
    format: 'A4',
    orientation: 'portrait',
    margins: {
      top: 25.4,
      right: 25.4,
      bottom: 25.4,
      left: 25.4,
      unit: 'mm'
    },
    quality: 'high',
    compression: true,
    metadata: {
      creator: 'Template Engine PDF Service'
    },
    headerFooter: {
      displayHeaderFooter: false,
      printBackground: true
    }
  }

  async exportToPDF(
    composed: ComposedTemplate,
    options: Partial<PDFExportOptions> = {}
  ): Promise<PDFRenderResult> {
    const startTime = Date.now()
    const mergedOptions = this.mergeOptions(options)

    // Generate PDF-optimized HTML
    const htmlContent = await this.generatePDFHtml(composed, mergedOptions)

    // Convert HTML to PDF (simulation - in real implementation would use puppeteer/playwright)
    const pdfBuffer = await this.htmlToPdf(htmlContent, mergedOptions)

    const renderTime = Date.now() - startTime

    return {
      content: pdfBuffer,
      metadata: this.createPDFMetadata(composed, mergedOptions),
      size: pdfBuffer.length,
      pageCount: this.estimatePageCount(htmlContent, mergedOptions),
      renderTime
    }
  }

  async exportDocumentToPDF(
    template: DocumentTemplate,
    data: any,
    options: Partial<PDFExportOptions> = {}
  ): Promise<PDFRenderResult> {
    const mergedOptions = this.mergeOptions(options)

    // Apply document-specific settings
    if (template.pageSettings) {
      mergedOptions.format = this.convertPageSize(template.pageSettings.size)
      mergedOptions.orientation = template.pageSettings.orientation
      mergedOptions.margins = this.convertMargins(template.pageSettings.margins)
    }

    // Process template with data
    const processedHtml = this.processTemplateContent(template.content.html, data)
    const processedCss = this.processTemplateContent(template.content.css || '', data)

    // Create composed template-like object
    const composed = {
      template,
      data,
      compiledContent: {
        html: processedHtml,
        css: processedCss,
        javascript: template.content.javascript,
        assets: template.content.assets || []
      },
      metadata: {
        composedAt: new Date(),
        renderTime: 0,
        cacheKey: '',
        dependencies: []
      }
    }

    return this.exportToPDF(composed as unknown as ComposedTemplate, mergedOptions)
  }

  async createOptimizedPDF(
    composed: ComposedTemplate,
    clientBranding?: ClientBranding,
    customOptions?: Partial<PDFExportOptions>
  ): Promise<PDFRenderResult> {
    const options = { ...this.defaultOptions, ...customOptions }

    // Apply client branding to options
    if (clientBranding) {
      options.metadata = {
        ...options.metadata,
        title: `${clientBranding.name} Document`,
        author: clientBranding.name
      }

      // Apply brand colors to watermark if present
      if (options.watermark) {
        options.watermark.color = clientBranding.colorPalette.primary
      }
    }

    return this.exportToPDF(composed, options)
  }

  private mergeOptions(options: Partial<PDFExportOptions>): PDFExportOptions {
    return {
      ...this.defaultOptions,
      ...options,
      margins: { ...this.defaultOptions.margins, ...options.margins },
      metadata: { ...this.defaultOptions.metadata, ...options.metadata },
      headerFooter: { 
        displayHeaderFooter: options.headerFooter?.displayHeaderFooter ?? this.defaultOptions.headerFooter?.displayHeaderFooter ?? false,
        headerTemplate: options.headerFooter?.headerTemplate,
        footerTemplate: options.headerFooter?.footerTemplate,
        printBackground: options.headerFooter?.printBackground ?? this.defaultOptions.headerFooter?.printBackground ?? true
      }
    }
  }

  private async generatePDFHtml(
    composed: ComposedTemplate,
    options: PDFExportOptions
  ): Promise<string> {
    const { compiledContent } = composed

    // Calculate page dimensions
    const pageDimensions = this.getPageDimensions(options.format, options.orientation)

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${options.metadata.title || composed.template.name}</title>
    <style>
        @page {
            size: ${options.format} ${options.orientation};
            margin: ${options.margins.top}${options.margins.unit}
                    ${options.margins.right}${options.margins.unit}
                    ${options.margins.bottom}${options.margins.unit}
                    ${options.margins.left}${options.margins.unit};
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }

        .pdf-container {
            width: 100%;
            min-height: 100vh;
            padding: 0;
        }

        .pdf-content {
            width: 100%;
            padding: 20px;
        }

        /* Print-specific styles */
        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .pdf-container {
                margin: 0;
                padding: 0;
            }

            .page-break {
                page-break-before: always;
            }

            .no-break {
                page-break-inside: avoid;
            }
        }

        /* PDF quality optimizations */
        img {
            max-width: 100%;
            height: auto;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
        }

        table {
            border-collapse: collapse;
            width: 100%;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        ${compiledContent.css}

        ${options.watermark ? this.generateWatermarkCSS(options.watermark) : ''}
    </style>
</head>
<body>
    <div class="pdf-container">
        ${options.watermark ? this.generateWatermarkHTML(options.watermark) : ''}
        <div class="pdf-content">
            ${compiledContent.html}
        </div>
    </div>
</body>
</html>`

    return html
  }

  private async htmlToPdf(html: string, options: PDFExportOptions): Promise<Buffer> {
    // In a real implementation, this would use a library like puppeteer or playwright
    // For now, we'll simulate PDF generation by returning the HTML as a buffer

    const pdfContent = this.simulatePDFContent(html, options)
    return Buffer.from(pdfContent)
  }

  private simulatePDFContent(html: string, options: PDFExportOptions): string {
    // This is a simulation of PDF content
    // In a real implementation, you would use:
    // - Puppeteer: await page.pdf(pdfOptions)
    // - Playwright: await page.pdf(pdfOptions)
    // - PDFKit: create PDF programmatically
    // - jsPDF: client-side PDF generation

    const pdfMetadata = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
/Metadata 3 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [4 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Metadata
/Subtype /XML
/Length ${JSON.stringify(options.metadata).length}
>>
stream
${JSON.stringify(options.metadata, null, 2)}
endstream
endobj

4 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${this.getPageWidth(options.format)} ${this.getPageHeight(options.format)}]
/Contents 5 0 R
>>
endobj

5 0 obj
<<
/Length ${html.length}
>>
stream
${html}
endstream
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000079 00000 n
0000000173 00000 n
0000000301 00000 n
0000000380 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
462
%%EOF`

    return pdfMetadata
  }

  private createPDFMetadata(
    composed: ComposedTemplate,
    options: PDFExportOptions
  ): PDFMetadata {
    return {
      title: options.metadata.title || composed.template.name,
      author: options.metadata.author || 'Template Engine',
      subject: options.metadata.subject || 'Generated Document',
      keywords: options.metadata.keywords || [],
      creator: options.metadata.creator || 'Template Engine PDF Service',
      producer: 'Template Engine v1.0.0',
      creationDate: new Date(),
      modificationDate: new Date()
    }
  }

  private estimatePageCount(html: string, options: PDFExportOptions): number {
    // Simple estimation based on content length and page size
    const contentLength = html.replace(/<[^>]*>/g, '').length
    const avgCharsPerPage = this.getAvgCharsPerPage(options.format)
    return Math.max(1, Math.ceil(contentLength / avgCharsPerPage))
  }

  private getPageDimensions(format: string, orientation: string): { width: number; height: number } {
    const dimensions = {
      A4: { width: 210, height: 297 },
      A3: { width: 297, height: 420 },
      Letter: { width: 216, height: 279 },
      Legal: { width: 216, height: 356 }
    }

    const size = dimensions[format as keyof typeof dimensions] || dimensions.A4

    return orientation === 'landscape'
      ? { width: size.height, height: size.width }
      : size
  }

  private getPageWidth(format: string): number {
    const dimensions = {
      A4: 595,
      A3: 842,
      Letter: 612,
      Legal: 612
    }
    return dimensions[format as keyof typeof dimensions] || dimensions.A4
  }

  private getPageHeight(format: string): number {
    const dimensions = {
      A4: 842,
      A3: 1191,
      Letter: 792,
      Legal: 1008
    }
    return dimensions[format as keyof typeof dimensions] || dimensions.A4
  }

  private getAvgCharsPerPage(format: string): number {
    const charsPerPage = {
      A4: 3000,
      A3: 5000,
      Letter: 3200,
      Legal: 4000
    }
    return charsPerPage[format as keyof typeof charsPerPage] || charsPerPage.A4
  }

  private convertPageSize(size: any): 'A4' | 'A3' | 'Letter' | 'Legal' {
    if (size.width === 8.5 && size.height === 11) return 'Letter'
    if (size.width === 8.5 && size.height === 14) return 'Legal'
    if (size.width <= 210) return 'A4'
    return 'A3'
  }

  private convertMargins(margins: any): { top: number; right: number; bottom: number; left: number; unit: "px" | "in" | "mm" } {
    return {
      top: margins.top || 25.4,
      right: margins.right || 25.4,
      bottom: margins.bottom || 25.4,
      left: margins.left || 25.4,
      unit: (margins.unit === 'px' || margins.unit === 'in' || margins.unit === 'mm') ? margins.unit : 'mm'
    }
  }

  private processTemplateContent(content: string, data: any): string {
    let processed = content

    // Replace template variables
    Object.entries(data).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      processed = processed.replace(regex, String(value))
    })

    return processed
  }

  private generateWatermarkCSS(watermark: NonNullable<PDFExportOptions['watermark']>): string {
    return `
.pdf-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(${watermark.rotation}deg);
    font-size: ${watermark.fontSize}px;
    color: ${watermark.color};
    opacity: ${watermark.opacity};
    z-index: -1;
    pointer-events: none;
    user-select: none;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
}`
  }

  private generateWatermarkHTML(watermark: NonNullable<PDFExportOptions['watermark']>): string {
    return `<div class="pdf-watermark">${watermark.text}</div>`
  }

  // Utility methods for PDF optimization
  async optimizeForPrint(html: string): Promise<string> {
    let optimized = html

    // Add print-friendly classes
    optimized = optimized.replace(/<table/g, '<table class="print-table"')
    optimized = optimized.replace(/<img/g, '<img class="print-image"')

    // Add page break utilities
    optimized = optimized.replace(/<!-- page-break -->/g, '<div class="page-break"></div>')
    optimized = optimized.replace(/<!-- no-break-start -->/g, '<div class="no-break">')
    optimized = optimized.replace(/<!-- no-break-end -->/g, '</div>')

    return optimized
  }

  async addPageNumbers(html: string, template: string = 'Page {current} of {total}'): Promise<string> {
    const pageNumberCSS = `
<style>
@page {
    @bottom-right {
        content: "${template.replace('{current}', 'counter(page)').replace('{total}', 'counter(pages)')}";
        font-size: 10px;
        color: #666;
    }
}
</style>`

    return html.replace('</head>', `${pageNumberCSS}</head>`)
  }

  async compressPDF(pdfBuffer: Buffer, quality: 'low' | 'medium' | 'high'): Promise<Buffer> {
    // In a real implementation, this would use PDF compression libraries
    // For simulation, we'll just return the buffer
    console.log(`Compressing PDF with ${quality} quality`)
    return pdfBuffer
  }
}