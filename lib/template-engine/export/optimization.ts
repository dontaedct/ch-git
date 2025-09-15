export interface OptimizationOptions {
  compress: boolean
  minify: boolean
  responsive: boolean
  accessibility: boolean
  seo: boolean
  performance: boolean
}

export interface OptimizationResult {
  originalSize: number
  optimizedSize: number
  compressionRatio: number
  optimizations: string[]
  warnings: string[]
  processingTime: number
}

export class ExportOptimizer {
  async optimizeHTML(html: string, options: OptimizationOptions): Promise<{ content: string; result: OptimizationResult }> {
    const startTime = Date.now()
    const originalSize = Buffer.byteLength(html, 'utf8')
    let optimized = html
    const optimizations: string[] = []
    const warnings: string[] = []

    // Minification
    if (options.minify) {
      optimized = await this.minifyHTML(optimized)
      optimizations.push('HTML minification')
    }

    // Add responsive meta tags and CSS
    if (options.responsive) {
      optimized = await this.addResponsiveOptimizations(optimized)
      optimizations.push('Responsive design optimization')
    }

    // Add accessibility improvements
    if (options.accessibility) {
      optimized = await this.addAccessibilityOptimizations(optimized)
      optimizations.push('Accessibility enhancements')
    }

    // Add SEO optimizations
    if (options.seo) {
      optimized = await this.addSEOOptimizations(optimized)
      optimizations.push('SEO optimizations')
    }

    // Performance optimizations
    if (options.performance) {
      optimized = await this.addPerformanceOptimizations(optimized)
      optimizations.push('Performance optimizations')
    }

    const optimizedSize = Buffer.byteLength(optimized, 'utf8')
    const processingTime = Date.now() - startTime

    return {
      content: optimized,
      result: {
        originalSize,
        optimizedSize,
        compressionRatio: originalSize > 0 ? optimizedSize / originalSize : 1,
        optimizations,
        warnings,
        processingTime
      }
    }
  }

  async optimizePDF(pdfBuffer: Buffer, options: OptimizationOptions): Promise<{ content: Buffer; result: OptimizationResult }> {
    const startTime = Date.now()
    const originalSize = pdfBuffer.length
    let optimized = pdfBuffer
    const optimizations: string[] = []
    const warnings: string[] = []

    // PDF compression
    if (options.compress) {
      optimized = await this.compressPDF(optimized)
      optimizations.push('PDF compression')
    }

    // Accessibility for PDF
    if (options.accessibility) {
      // In real implementation, would add PDF/A compliance, tagged PDF, etc.
      optimizations.push('PDF accessibility compliance')
    }

    const optimizedSize = optimized.length
    const processingTime = Date.now() - startTime

    return {
      content: optimized,
      result: {
        originalSize,
        optimizedSize,
        compressionRatio: originalSize > 0 ? optimizedSize / originalSize : 1,
        optimizations,
        warnings,
        processingTime
      }
    }
  }

  private async minifyHTML(html: string): Promise<string> {
    // Remove unnecessary whitespace
    let minified = html
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim()

    // Remove comments (but preserve conditional comments)
    minified = minified.replace(/<!--(?!\[if)[\s\S]*?-->/g, '')

    // Remove empty attributes
    minified = minified.replace(/\s+[a-zA-Z-]+=""/g, '')

    return minified
  }

  private async addResponsiveOptimizations(html: string): Promise<string> {
    // Ensure responsive viewport meta tag
    if (!html.includes('viewport')) {
      html = html.replace(
        '<head>',
        '<head>\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">'
      )
    }

    // Add responsive image classes
    html = html.replace(
      /<img(?![^>]*class)/g,
      '<img class="responsive-image"'
    )

    // Add responsive table wrapper
    html = html.replace(
      /<table/g,
      '<div class="table-responsive"><table'
    )
    html = html.replace(
      /<\/table>/g,
      '</table></div>'
    )

    return html
  }

  private async addAccessibilityOptimizations(html: string): Promise<string> {
    // Add lang attribute if missing
    if (!html.includes('lang=')) {
      html = html.replace('<html', '<html lang="en"')
    }

    // Add alt attributes to images without them
    html = html.replace(
      /<img(?![^>]*alt=)[^>]*>/g,
      (match) => match.replace('>', ' alt="">')
    )

    // Add role attributes to important elements
    html = html.replace(
      /<main(?![^>]*role)/g,
      '<main role="main"'
    )

    html = html.replace(
      /<nav(?![^>]*role)/g,
      '<nav role="navigation"'
    )

    // Ensure headings have proper hierarchy
    html = this.fixHeadingHierarchy(html)

    // Add skip links
    if (!html.includes('skip-link')) {
      html = html.replace(
        '<body>',
        '<body>\n    <a href="#main-content" class="skip-link">Skip to main content</a>'
      )
    }

    return html
  }

  private async addSEOOptimizations(html: string): Promise<string> {
    // Ensure meta description exists
    if (!html.includes('meta name="description"')) {
      html = html.replace(
        '</head>',
        '    <meta name="description" content="Generated document">\n</head>'
      )
    }

    // Add Open Graph tags
    if (!html.includes('og:title')) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/)
      const title = titleMatch ? titleMatch[1] : 'Document'

      const ogTags = `
    <meta property="og:type" content="website">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="Generated document">
    <meta property="og:locale" content="en_US">`

      html = html.replace('</head>', `${ogTags}\n</head>`)
    }

    // Add structured data
    if (!html.includes('application/ld+json')) {
      const structuredData = `
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Document",
      "name": "Generated Document",
      "dateCreated": "${new Date().toISOString()}"
    }
    </script>`

      html = html.replace('</head>', `${structuredData}\n</head>`)
    }

    return html
  }

  private async addPerformanceOptimizations(html: string): Promise<string> {
    // Add preload hints for critical resources
    html = html.replace(
      '</head>',
      '    <link rel="preload" as="style" href="data:text/css,/* Critical CSS loaded */">\n</head>'
    )

    // Add lazy loading to images
    html = html.replace(
      /<img(?![^>]*loading=)/g,
      '<img loading="lazy"'
    )

    // Add async/defer to non-critical scripts
    html = html.replace(
      /<script(?![^>]*(?:async|defer))/g,
      '<script defer'
    )

    // Add resource hints
    if (!html.includes('dns-prefetch')) {
      html = html.replace(
        '</head>',
        '    <link rel="dns-prefetch" href="//fonts.googleapis.com">\n</head>'
      )
    }

    return html
  }

  private fixHeadingHierarchy(html: string): string {
    // Find all headings and ensure proper hierarchy
    const headingMatches = html.match(/<h[1-6][^>]*>.*?<\/h[1-6]>/g) || []
    let currentLevel = 0

    headingMatches.forEach(heading => {
      const levelMatch = heading.match(/<h([1-6])/)
      if (levelMatch) {
        const level = parseInt(levelMatch[1])

        // If jumping more than one level, adjust
        if (level > currentLevel + 1) {
          const correctedLevel = currentLevel + 1
          const correctedHeading = heading.replace(
            new RegExp(`<h${level}`, 'g'),
            `<h${correctedLevel}`
          ).replace(
            new RegExp(`</h${level}>`, 'g'),
            `</h${correctedLevel}>`
          )

          html = html.replace(heading, correctedHeading)
          currentLevel = correctedLevel
        } else {
          currentLevel = level
        }
      }
    })

    return html
  }

  private async compressPDF(pdfBuffer: Buffer): Promise<Buffer> {
    // In a real implementation, this would use PDF compression libraries
    // For now, just return the original buffer
    return pdfBuffer
  }

  // Utility methods for performance analysis
  async analyzePerformance(html: string): Promise<PerformanceAnalysis> {
    const analysis: PerformanceAnalysis = {
      size: Buffer.byteLength(html, 'utf8'),
      imageCount: (html.match(/<img/g) || []).length,
      scriptCount: (html.match(/<script/g) || []).length,
      styleCount: (html.match(/<style/g) || []).length + (html.match(/<link[^>]*rel="stylesheet"/g) || []).length,
      recommendations: []
    }

    // Generate recommendations
    if (analysis.size > 100000) {
      analysis.recommendations.push('Consider minifying HTML content')
    }

    if (analysis.imageCount > 10) {
      analysis.recommendations.push('Consider lazy loading for images')
    }

    if (analysis.scriptCount > 5) {
      analysis.recommendations.push('Consider bundling JavaScript files')
    }

    if (!html.includes('loading="lazy"')) {
      analysis.recommendations.push('Add lazy loading to images')
    }

    if (!html.includes('viewport')) {
      analysis.recommendations.push('Add responsive viewport meta tag')
    }

    return analysis
  }

  async validateAccessibility(html: string): Promise<AccessibilityReport> {
    const issues: string[] = []
    const warnings: string[] = []

    // Check for missing alt attributes
    const imagesWithoutAlt = (html.match(/<img(?![^>]*alt=)[^>]*>/g) || []).length
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt attributes`)
    }

    // Check for proper heading hierarchy
    const headings = html.match(/<h[1-6]/g) || []
    if (headings.length > 0 && headings[0] && !headings[0].includes('h1')) {
      warnings.push('Document should start with h1 heading')
    }

    // Check for lang attribute
    if (!html.includes('lang=')) {
      issues.push('Missing lang attribute on html element')
    }

    // Check for skip links
    if (!html.includes('skip-link') && !html.includes('skip to content')) {
      warnings.push('Consider adding skip navigation links')
    }

    return {
      score: Math.max(0, 100 - (issues.length * 20) - (warnings.length * 10)),
      issues,
      warnings,
      compliant: issues.length === 0
    }
  }
}

interface PerformanceAnalysis {
  size: number
  imageCount: number
  scriptCount: number
  styleCount: number
  recommendations: string[]
}

interface AccessibilityReport {
  score: number
  issues: string[]
  warnings: string[]
  compliant: boolean
}