import { ComposedTemplate, RenderedOutput, RenderMetadata, DocumentTemplate } from './types'

export class TemplateRenderer {
  async renderHtml(composed: ComposedTemplate): Promise<string> {
    const { compiledContent } = composed

    // Create complete HTML document
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${composed.template.name}</title>
    ${compiledContent.css ? `<style>${compiledContent.css}</style>` : ''}
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .template-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .template-header {
            border-bottom: 2px solid #eee;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .template-content {
            margin-bottom: 30px;
        }
        .template-footer {
            border-top: 1px solid #eee;
            padding-top: 20px;
            margin-top: 30px;
            font-size: 0.9em;
            color: #666;
        }
        h1, h2, h3, h4, h5, h6 {
            margin-top: 0;
            margin-bottom: 15px;
        }
        p {
            margin: 0 0 15px 0;
        }
    </style>
</head>
<body>
    <div class="template-container">
        <div class="template-content">
            ${compiledContent.html}
        </div>
        <div class="template-footer">
            Generated on ${new Date().toLocaleDateString()}
        </div>
    </div>
    ${compiledContent.javascript ? `<script>${compiledContent.javascript}</script>` : ''}
</body>
</html>`

    return html.trim()
  }

  async renderPdf(composed: ComposedTemplate): Promise<string> {
    // For now, we'll return HTML that can be converted to PDF
    // In a real implementation, you'd use a library like puppeteer or jsPDF
    const html = await this.renderHtml(composed)

    // Add PDF-specific styles
    const pdfHtml = html.replace(
      '<style>',
      `<style>
        @media print {
            body { margin: 0; }
            .template-container {
                box-shadow: none;
                max-width: none;
                margin: 0;
                padding: 40px;
            }
        }
        @page {
            margin: 1in;
            size: letter;
        }`
    )

    return pdfHtml
  }

  async renderDocx(composed: ComposedTemplate): Promise<string> {
    // For now, we'll return a simplified HTML structure
    // In a real implementation, you'd use a library like docx or html-docx-js
    const { compiledContent } = composed

    // Convert HTML to Word-compatible format
    let docxContent = compiledContent.html

    // Replace HTML tags with Word-compatible equivalents
    docxContent = docxContent.replace(/<h1>/g, '<p style="font-size: 18pt; font-weight: bold;">')
    docxContent = docxContent.replace(/<h2>/g, '<p style="font-size: 16pt; font-weight: bold;">')
    docxContent = docxContent.replace(/<h3>/g, '<p style="font-size: 14pt; font-weight: bold;">')
    docxContent = docxContent.replace(/<\/h[1-6]>/g, '</p>')
    docxContent = docxContent.replace(/<strong>/g, '<b>')
    docxContent = docxContent.replace(/<\/strong>/g, '</b>')
    docxContent = docxContent.replace(/<em>/g, '<i>')
    docxContent = docxContent.replace(/<\/em>/g, '</i>')

    const docxDocument = `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        <w:p>
            <w:r>
                <w:t>${composed.template.name}</w:t>
            </w:r>
        </w:p>
        ${this.htmlToWordXml(docxContent)}
        <w:p>
            <w:r>
                <w:t>Generated on ${new Date().toLocaleDateString()}</w:t>
            </w:r>
        </w:p>
    </w:body>
</w:document>`

    return docxDocument
  }

  private htmlToWordXml(html: string): string {
    // Basic HTML to Word XML conversion
    // This is a simplified version - real implementation would be more robust
    let xml = html

    // Convert paragraphs
    xml = xml.replace(/<p>(.*?)<\/p>/g, '<w:p><w:r><w:t>$1</w:t></w:r></w:p>')

    // Convert line breaks
    xml = xml.replace(/<br\s*\/?>/g, '<w:br/>')

    // Convert bold text
    xml = xml.replace(/<b>(.*?)<\/b>/g, '<w:r><w:rPr><w:b/></w:rPr><w:t>$1</w:t></w:r>')

    // Convert italic text
    xml = xml.replace(/<i>(.*?)<\/i>/g, '<w:r><w:rPr><w:i/></w:rPr><w:t>$1</w:t></w:r>')

    // Remove any remaining HTML tags
    xml = xml.replace(/<[^>]*>/g, '')

    return xml
  }

  async renderDocumentTemplate(
    template: DocumentTemplate,
    data: any,
    format: 'html' | 'pdf' | 'docx' = 'html'
  ): Promise<string> {
    // Process document-specific rendering
    let content = template.content.html

    // Replace variables
    for (const variable of template.schema.variables) {
      const value = data[variable.name] ?? variable.defaultValue ?? ''
      content = content.replace(new RegExp(`{{${variable.name}}}`, 'g'), String(value))
    }

    // Process sections
    for (const section of template.sections) {
      if (section.conditional) {
        const shouldInclude = this.evaluateCondition(section.conditional, data)
        if (!shouldInclude) {
          const sectionRegex = new RegExp(
            `<!--\\s*section:${section.id}\\s*-->[\\s\\S]*?<!--\\s*\\/section:${section.id}\\s*-->`,
            'g'
          )
          content = content.replace(sectionRegex, '')
        }
      }
    }

    // Apply document-specific styling
    const styledContent = this.applyDocumentStyling(content, template)

    // Render based on format
    switch (format) {
      case 'html':
        return this.wrapInDocumentHtml(styledContent, template)
      case 'pdf':
        return this.wrapInPdfHtml(styledContent, template)
      case 'docx':
        return this.convertToDocx(styledContent, template)
      default:
        return styledContent
    }
  }

  private evaluateCondition(condition: any, data: any): boolean {
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

  private applyDocumentStyling(content: string, template: DocumentTemplate): string {
    const { styling } = template.schema
    const { pageSettings } = template

    // Apply basic styling
    let styledContent = content

    // Add document-specific CSS classes
    styledContent = styledContent.replace(/<h1>/g, '<h1 class="doc-heading-1">')
    styledContent = styledContent.replace(/<h2>/g, '<h2 class="doc-heading-2">')
    styledContent = styledContent.replace(/<h3>/g, '<h3 class="doc-heading-3">')
    styledContent = styledContent.replace(/<p>/g, '<p class="doc-paragraph">')

    return styledContent
  }

  private wrapInDocumentHtml(content: string, template: DocumentTemplate): string {
    const { pageSettings } = template
    const { styling } = template.schema

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name}</title>
    <style>
        @page {
            size: ${pageSettings.size.width}${pageSettings.size.unit} ${pageSettings.size.height}${pageSettings.size.unit};
            margin: ${pageSettings.margins.top}${pageSettings.margins.unit}
                    ${pageSettings.margins.right}${pageSettings.margins.unit}
                    ${pageSettings.margins.bottom}${pageSettings.margins.unit}
                    ${pageSettings.margins.left}${pageSettings.margins.unit};
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: ${styling.colors.text};
            background-color: ${styling.colors.background};
            margin: 0;
            padding: 0;
        }
        .document-container {
            width: 100%;
            max-width: none;
            margin: 0;
            padding: ${styling.spacing.medium}px;
        }
        .doc-heading-1 {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: ${styling.spacing.medium}px;
            color: ${styling.colors.primary};
        }
        .doc-heading-2 {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: ${styling.spacing.small}px;
            color: ${styling.colors.primary};
        }
        .doc-heading-3 {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: ${styling.spacing.small}px;
            color: ${styling.colors.secondary};
        }
        .doc-paragraph {
            margin-bottom: ${styling.spacing.small}px;
        }
        ${template.content.css || ''}
    </style>
</head>
<body>
    <div class="document-container">
        ${pageSettings.header ? `<header>${pageSettings.header.content}</header>` : ''}
        <main>
            ${content}
        </main>
        ${pageSettings.footer ? `<footer>${pageSettings.footer.content}</footer>` : ''}
    </div>
</body>
</html>`
  }

  private wrapInPdfHtml(content: string, template: DocumentTemplate): string {
    const html = this.wrapInDocumentHtml(content, template)

    // Add PDF-specific styles
    return html.replace(
      '<style>',
      `<style>
        @media print {
            body { margin: 0; padding: 0; }
            .document-container { padding: 0; }
        }`
    )
  }

  private convertToDocx(content: string, template: DocumentTemplate): string {
    // This is a simplified DOCX conversion
    // In a real implementation, you'd use proper DOCX libraries
    let docxContent = content

    // Convert HTML to Word XML
    docxContent = this.htmlToWordXml(docxContent)

    return `
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${docxContent}
    </w:body>
</w:document>`
  }
}