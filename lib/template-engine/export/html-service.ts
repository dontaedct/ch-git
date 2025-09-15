import {
  ComposedTemplate,
  RenderedOutput,
  RenderMetadata,
  DocumentTemplate,
  ClientBranding
} from '../core/types'

export interface HTMLExportOptions {
  format: 'standalone' | 'embedded' | 'fragment'
  includeCSS: boolean
  includeJS: boolean
  minify: boolean
  responsive: boolean
  accessibility: boolean
  seo: boolean
  clientCustomization?: {
    brandingId?: string
    theme?: 'light' | 'dark' | 'auto'
    customCSS?: string
    customJS?: string
  }
  metadata?: {
    title?: string
    description?: string
    keywords?: string[]
    author?: string
    viewport?: string
    lang?: string
  }
  assets?: {
    inlineImages: boolean
    optimizeImages: boolean
    lazyLoading: boolean
    cdn?: {
      enabled: boolean
      baseUrl: string
    }
  }
}

export interface HTMLRenderResult {
  content: string
  metadata: HTMLMetadata
  size: number
  renderTime: number
  assets: HTMLAsset[]
}

export interface HTMLMetadata {
  title: string
  description: string
  keywords: string[]
  author: string
  generatedAt: Date
  viewport: string
  lang: string
  charset: string
}

export interface HTMLAsset {
  type: 'css' | 'js' | 'image' | 'font'
  url: string
  inline: boolean
  size: number
  optimized: boolean
}

export class HTMLExportService {
  private defaultOptions: HTMLExportOptions = {
    format: 'standalone',
    includeCSS: true,
    includeJS: false,
    minify: false,
    responsive: true,
    accessibility: true,
    seo: true,
    metadata: {
      viewport: 'width=device-width, initial-scale=1.0',
      lang: 'en'
    },
    assets: {
      inlineImages: false,
      optimizeImages: true,
      lazyLoading: true
    }
  }

  async exportToHTML(
    composed: ComposedTemplate,
    options: Partial<HTMLExportOptions> = {}
  ): Promise<HTMLRenderResult> {
    const startTime = Date.now()
    const mergedOptions = this.mergeOptions(options)

    // Generate HTML content based on format
    let htmlContent: string
    switch (mergedOptions.format) {
      case 'standalone':
        htmlContent = await this.generateStandaloneHTML(composed, mergedOptions)
        break
      case 'embedded':
        htmlContent = await this.generateEmbeddedHTML(composed, mergedOptions)
        break
      case 'fragment':
        htmlContent = await this.generateFragmentHTML(composed, mergedOptions)
        break
      default:
        htmlContent = await this.generateStandaloneHTML(composed, mergedOptions)
    }

    // Apply optimizations
    if (mergedOptions.minify) {
      htmlContent = await this.minifyHTML(htmlContent)
    }

    const renderTime = Date.now() - startTime
    const assets = await this.extractAssets(composed, mergedOptions)

    return {
      content: htmlContent,
      metadata: this.createHTMLMetadata(composed, mergedOptions),
      size: Buffer.byteLength(htmlContent, 'utf8'),
      renderTime,
      assets
    }
  }

  async exportDocumentToHTML(
    template: DocumentTemplate,
    data: any,
    options: Partial<HTMLExportOptions> = {}
  ): Promise<HTMLRenderResult> {
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

    return this.exportToHTML(composed as unknown as ComposedTemplate, options)
  }

  async createResponsiveHTML(
    composed: ComposedTemplate,
    clientBranding?: ClientBranding,
    customOptions?: Partial<HTMLExportOptions>
  ): Promise<HTMLRenderResult> {
    const options = {
      ...this.defaultOptions,
      ...customOptions,
      responsive: true,
      accessibility: true,
      clientCustomization: {
        brandingId: clientBranding?.id,
        theme: 'auto' as const,
        ...customOptions?.clientCustomization
      }
    }

    return this.exportToHTML(composed as unknown as ComposedTemplate, options)
  }

  private mergeOptions(options: Partial<HTMLExportOptions>): HTMLExportOptions {
    return {
      ...this.defaultOptions,
      ...options,
      metadata: { ...this.defaultOptions.metadata, ...options.metadata },
      assets: { 
        inlineImages: options.assets?.inlineImages ?? this.defaultOptions.assets?.inlineImages ?? false,
        optimizeImages: options.assets?.optimizeImages ?? this.defaultOptions.assets?.optimizeImages ?? false,
        lazyLoading: options.assets?.lazyLoading ?? this.defaultOptions.assets?.lazyLoading ?? false,
        cdn: options.assets?.cdn
      },
      clientCustomization: {
        ...this.defaultOptions.clientCustomization,
        ...options.clientCustomization
      }
    }
  }

  private async generateStandaloneHTML(
    composed: ComposedTemplate,
    options: HTMLExportOptions
  ): Promise<string> {
    const { compiledContent } = composed
    const metadata = options.metadata!

    return `<!DOCTYPE html>
<html lang="${metadata.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="${metadata.viewport}">
    <meta name="generator" content="Template Engine v1.0.0">
    ${metadata.title ? `<title>${this.escapeHtml(metadata.title)}</title>` : ''}
    ${metadata.description ? `<meta name="description" content="${this.escapeHtml(metadata.description)}">` : ''}
    ${metadata.keywords ? `<meta name="keywords" content="${metadata.keywords.join(', ')}">` : ''}
    ${metadata.author ? `<meta name="author" content="${this.escapeHtml(metadata.author)}">` : ''}

    ${options.seo ? this.generateSEOTags(composed, options) : ''}
    ${options.accessibility ? this.generateAccessibilityTags() : ''}

    ${options.includeCSS ? this.generateCSS(composed, options) : ''}
    ${options.responsive ? this.generateResponsiveCSS() : ''}
    ${options.clientCustomization?.customCSS ? `<style>${options.clientCustomization.customCSS}</style>` : ''}
</head>
<body${this.generateBodyAttributes(options)}>
    <div class="template-container" role="main">
        ${compiledContent.html}
    </div>

    ${options.includeJS ? this.generateJavaScript(composed, options) : ''}
    ${options.clientCustomization?.customJS ? `<script>${options.clientCustomization.customJS}</script>` : ''}
    ${this.generateAnalyticsTags(options)}
</body>
</html>`
  }

  private async generateEmbeddedHTML(
    composed: ComposedTemplate,
    options: HTMLExportOptions
  ): Promise<string> {
    const { compiledContent } = composed

    return `<div class="embedded-template" data-template-id="${composed.template.id}">
    ${options.includeCSS ? `<style scoped>${compiledContent.css}</style>` : ''}
    <div class="template-content">
        ${compiledContent.html}
    </div>
    ${options.includeJS && compiledContent.javascript ? `<script>${compiledContent.javascript}</script>` : ''}
</div>`
  }

  private async generateFragmentHTML(
    composed: ComposedTemplate,
    options: HTMLExportOptions
  ): Promise<string> {
    const { compiledContent } = composed
    return compiledContent.html
  }

  private generateCSS(composed: ComposedTemplate, options: HTMLExportOptions): string {
    const { compiledContent } = composed
    let css = compiledContent.css || ''

    // Add base styles
    css = this.generateBaseCSS() + '\n' + css

    // Add theme-specific styles
    if (options.clientCustomization?.theme) {
      css += '\n' + this.generateThemeCSS(options.clientCustomization.theme)
    }

    return `<style>${css}</style>`
  }

  private generateBaseCSS(): string {
    return `
/* Template Engine Base Styles */
.template-container {
    max-width: 100%;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    line-height: 1.6;
    color: #333;
}

.template-content {
    width: 100%;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    margin-bottom: 1rem;
    font-weight: 600;
    line-height: 1.2;
}

p {
    margin-bottom: 1rem;
}

/* Images */
img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
}

/* Tables */
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1rem;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f8f9fa;
    font-weight: 600;
}

/* Forms */
input, textarea, select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #0056b3;
}

/* Utilities */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 1rem; }
.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 1rem; }`
  }

  private generateResponsiveCSS(): string {
    return `<style>
/* Responsive Design */
@media (max-width: 768px) {
    .template-container {
        padding: 15px;
    }

    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.25rem; }
    h3 { font-size: 1.1rem; }

    table {
        font-size: 0.875rem;
    }

    th, td {
        padding: 8px;
    }
}

@media (max-width: 480px) {
    .template-container {
        padding: 10px;
    }

    table {
        font-size: 0.75rem;
    }

    th, td {
        padding: 6px;
    }

    button {
        width: 100%;
    }
}

/* Print styles */
@media print {
    .template-container {
        max-width: none;
        padding: 0;
    }

    button {
        display: none;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    @page {
        margin: 1in;
    }
}
</style>`
  }

  private generateThemeCSS(theme: 'light' | 'dark' | 'auto'): string {
    if (theme === 'dark') {
      return `
/* Dark Theme */
.template-container {
    background-color: #1a1a1a;
    color: #e0e0e0;
}

th {
    background-color: #2d2d2d;
    color: #e0e0e0;
}

th, td {
    border-bottom-color: #444;
}

input, textarea, select {
    background-color: #2d2d2d;
    border-color: #444;
    color: #e0e0e0;
}

button {
    background-color: #0d6efd;
}

button:hover {
    background-color: #0b5ed7;
}`
    } else if (theme === 'auto') {
      return `
/* Auto Theme */
@media (prefers-color-scheme: dark) {
    .template-container {
        background-color: #1a1a1a;
        color: #e0e0e0;
    }

    th {
        background-color: #2d2d2d;
        color: #e0e0e0;
    }

    th, td {
        border-bottom-color: #444;
    }

    input, textarea, select {
        background-color: #2d2d2d;
        border-color: #444;
        color: #e0e0e0;
    }
}`
    }
    return ''
  }

  private generateJavaScript(composed: ComposedTemplate, options: HTMLExportOptions): string {
    const { compiledContent } = composed
    let js = compiledContent.javascript || ''

    // Add base JavaScript utilities
    js += `
// Template Engine Utilities
window.TemplateEngine = {
    templateId: '${composed.template.id}',
    version: '${composed.template.version}',
    generatedAt: '${new Date().toISOString()}',

    // Utility functions
    formatDate: function(date, format) {
        const d = new Date(date);
        if (format === 'short') return d.toLocaleDateString();
        if (format === 'long') return d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        return d.toISOString();
    },

    formatCurrency: function(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    toggleTheme: function() {
        document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
    }
};

// Auto-apply saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
}`

    return js ? `<script>${js}</script>` : ''
  }

  private generateSEOTags(composed: ComposedTemplate, options: HTMLExportOptions): string {
    const template = composed.template
    const metadata = options.metadata!

    return `
    <!-- Open Graph -->
    <meta property="og:title" content="${this.escapeHtml(metadata.title || template.name)}">
    <meta property="og:description" content="${this.escapeHtml(metadata.description || template.metadata.description || '')}">
    <meta property="og:type" content="document">
    <meta property="og:locale" content="${metadata.lang || 'en_US'}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${this.escapeHtml(metadata.title || template.name)}">
    <meta name="twitter:description" content="${this.escapeHtml(metadata.description || template.metadata.description || '')}">

    <!-- Schema.org -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Document",
        "name": "${this.escapeHtml(template.name)}",
        "description": "${this.escapeHtml(template.metadata.description || '')}",
        "author": {
            "@type": "Organization",
            "name": "${this.escapeHtml(metadata.author || 'Template Engine')}"
        },
        "dateCreated": "${template.metadata.createdAt.toISOString()}",
        "dateModified": "${template.metadata.updatedAt.toISOString()}"
    }
    </script>`
  }

  private generateAccessibilityTags(): string {
    return `
    <!-- Accessibility -->
    <meta name="theme-color" content="#007bff">
    <meta name="color-scheme" content="light dark">
    <link rel="preload" as="style" href="data:text/css,/* Accessibility styles loaded */"></link>`
  }

  private generateBodyAttributes(options: HTMLExportOptions): string {
    const attributes = []

    if (options.clientCustomization?.theme) {
      attributes.push(`class="${options.clientCustomization.theme}-theme"`)
    }

    attributes.push('data-template-engine="true"')

    return attributes.length > 0 ? ' ' + attributes.join(' ') : ''
  }

  private generateAnalyticsTags(options: HTMLExportOptions): string {
    // Placeholder for analytics integration
    return `
    <!-- Analytics placeholder -->
    <script>
    // Analytics tracking can be added here
    console.log('Template rendered:', {
        templateId: '${options.clientCustomization?.brandingId || 'unknown'}',
        timestamp: new Date().toISOString()
    });
    </script>`
  }

  private createHTMLMetadata(
    composed: ComposedTemplate,
    options: HTMLExportOptions
  ): HTMLMetadata {
    const metadata = options.metadata!

    return {
      title: metadata.title || composed.template.name,
      description: metadata.description || composed.template.metadata.description || '',
      keywords: metadata.keywords || composed.template.metadata.tags,
      author: metadata.author || 'Template Engine',
      generatedAt: new Date(),
      viewport: metadata.viewport || 'width=device-width, initial-scale=1.0',
      lang: metadata.lang || 'en',
      charset: 'UTF-8'
    }
  }

  private async extractAssets(
    composed: ComposedTemplate,
    options: HTMLExportOptions
  ): Promise<HTMLAsset[]> {
    const assets: HTMLAsset[] = []

    // Extract CSS assets
    if (options.includeCSS && composed.compiledContent.css) {
      assets.push({
        type: 'css',
        url: 'inline',
        inline: true,
        size: composed.compiledContent.css.length,
        optimized: options.minify
      })
    }

    // Extract JS assets
    if (options.includeJS && composed.compiledContent.javascript) {
      assets.push({
        type: 'js',
        url: 'inline',
        inline: true,
        size: composed.compiledContent.javascript.length,
        optimized: options.minify
      })
    }

    // Extract image assets
    composed.compiledContent.assets?.forEach(asset => {
      if (asset.type === 'image') {
        assets.push({
          type: 'image',
          url: asset.resolvedUrl,
          inline: options.assets?.inlineImages || false,
          size: 0, // Would be calculated in real implementation
          optimized: options.assets?.optimizeImages || false
        })
      }
    })

    return assets
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

  private async minifyHTML(html: string): Promise<string> {
    // Simple minification - in real implementation would use html-minifier
    return html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim()
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  // Utility methods for HTML optimization
  async optimizeForSEO(html: string, metadata: any): Promise<string> {
    // Add structured data, meta tags, etc.
    return html
  }

  async addLazyLoading(html: string): Promise<string> {
    return html.replace(/<img/g, '<img loading="lazy"')
  }

  async optimizeImages(html: string): Promise<string> {
    // In real implementation, this would optimize image sizes and formats
    return html
  }
}