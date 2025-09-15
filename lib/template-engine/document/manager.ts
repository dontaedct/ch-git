import {
  Template,
  DocumentTemplate,
  TemplateData,
  RenderedOutput,
  ValidationResult,
  TemplateVariable
} from '../core/types'
import { DocumentTemplateEngine } from '../core/engine'
import { BrandingManager } from '../branding/manager'

export interface DocumentGenerationOptions {
  format: 'html' | 'pdf' | 'docx'
  branding?: string
  variables?: TemplateData
  validation?: boolean
}

export interface DocumentTemplateCreateOptions {
  name: string
  description?: string
  type: 'invoice' | 'contract' | 'report' | 'letter' | 'certificate' | 'custom'
  content: string
  variables?: TemplateVariable[]
  styling?: any
}

export class DocumentTemplateManager {
  private engine: DocumentTemplateEngine
  private brandingManager: BrandingManager
  private templates: Map<string, DocumentTemplate> = new Map()

  constructor() {
    this.engine = new DocumentTemplateEngine()
    this.brandingManager = new BrandingManager()
  }

  async createDocumentTemplate(options: DocumentTemplateCreateOptions): Promise<DocumentTemplate> {
    const template = await this.engine.createDocumentTemplate(
      options.name,
      'html',
      options.content,
      options.variables
    )

    // Set document type based on template type
    template.documentType = this.getDocumentTypeForTemplate(options.type)
    template.metadata.description = options.description
    template.metadata.category = options.type
    template.metadata.tags = [options.type, 'document', template.documentType]

    // Apply styling if provided
    if (options.styling) {
      template.schema.styling = {
        ...template.schema.styling,
        ...options.styling
      }
    }

    // Store template
    this.templates.set(template.id, template)

    return template
  }

  async getTemplate(templateId: string): Promise<DocumentTemplate | null> {
    return this.templates.get(templateId) || null
  }

  async updateTemplate(templateId: string, updates: Partial<DocumentTemplateCreateOptions>): Promise<DocumentTemplate> {
    const existing = this.templates.get(templateId)
    if (!existing) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const updated: DocumentTemplate = {
      ...existing,
      name: updates.name || existing.name,
      content: {
        ...existing.content,
        html: updates.content || existing.content.html
      },
      schema: {
        ...existing.schema,
        variables: updates.variables || existing.schema.variables,
        styling: updates.styling ? { ...existing.schema.styling, ...updates.styling } : existing.schema.styling
      },
      metadata: {
        ...existing.metadata,
        name: updates.name || existing.metadata.name,
        description: updates.description || existing.metadata.description,
        updatedAt: new Date()
      }
    }

    if (updates.type) {
      updated.documentType = this.getDocumentTypeForTemplate(updates.type)
      updated.metadata.category = updates.type
      updated.metadata.tags = [updates.type, 'document', updated.documentType]
    }

    this.templates.set(templateId, updated)
    return updated
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    return this.templates.delete(templateId)
  }

  async listTemplates(): Promise<DocumentTemplate[]> {
    return Array.from(this.templates.values())
  }

  async listTemplatesByType(type: string): Promise<DocumentTemplate[]> {
    return Array.from(this.templates.values()).filter(t => t.metadata.category === type)
  }

  async generateDocument(
    templateId: string,
    data: TemplateData,
    options: DocumentGenerationOptions = { format: 'html' }
  ): Promise<RenderedOutput> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Apply branding if specified
    let processedTemplate = template
    if (options.branding) {
      processedTemplate = await this.brandingManager.applyBrandingToTemplate(template, options.branding) as DocumentTemplate
    }

    // Merge provided variables with defaults
    const templateData = { ...data, ...options.variables }

    // Validate data if requested
    if (options.validation) {
      const validation = await this.validateTemplateData(processedTemplate, templateData)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`)
      }
    }

    // Generate document
    return this.engine.generateDocument(processedTemplate, templateData, options.format)
  }

  async validateTemplateData(template: DocumentTemplate, data: TemplateData): Promise<ValidationResult> {
    return this.engine.validate(template)
  }

  async previewTemplate(templateId: string, sampleData?: TemplateData): Promise<RenderedOutput> {
    const template = await this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template not found: ${templateId}`)
    }

    // Generate sample data if not provided
    const data = sampleData || this.generateSampleData(template)

    return this.generateDocument(templateId, data, { format: 'html' })
  }

  async duplicateTemplate(templateId: string, newName?: string): Promise<DocumentTemplate> {
    const original = await this.getTemplate(templateId)
    if (!original) {
      throw new Error(`Template not found: ${templateId}`)
    }

    const duplicate: DocumentTemplate = {
      ...original,
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${original.name} (Copy)`,
      metadata: {
        ...original.metadata,
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${original.name} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    this.templates.set(duplicate.id, duplicate)
    return duplicate
  }

  // Template creation helpers for common document types
  async createInvoiceTemplate(
    companyName: string,
    logoUrl?: string,
    customFields?: TemplateVariable[]
  ): Promise<DocumentTemplate> {
    const defaultVariables: TemplateVariable[] = [
      { name: 'invoice_number', type: 'text', required: true, defaultValue: 'INV-001' },
      { name: 'invoice_date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'due_date', type: 'date', required: true, defaultValue: '' },
      { name: 'company_name', type: 'text', required: true, defaultValue: companyName },
      { name: 'company_address', type: 'text', required: true, defaultValue: '' },
      { name: 'client_name', type: 'text', required: true, defaultValue: '' },
      { name: 'client_address', type: 'text', required: true, defaultValue: '' },
      { name: 'subtotal', type: 'number', required: true, defaultValue: 0 },
      { name: 'tax_rate', type: 'number', required: false, defaultValue: 0 },
      { name: 'tax_amount', type: 'number', required: false, defaultValue: 0 },
      { name: 'total', type: 'number', required: true, defaultValue: 0 },
      { name: 'items', type: 'array', required: true, defaultValue: [] },
      ...(customFields || [])
    ]

    const content = `
<div class="invoice">
  <header class="invoice-header">
    ${logoUrl ? `<img src="${logoUrl}" alt="{{company_name}} Logo" class="company-logo">` : ''}
    <h1>INVOICE</h1>
    <div class="invoice-meta">
      <p><strong>Invoice #:</strong> {{invoice_number}}</p>
      <p><strong>Date:</strong> {{invoice_date}}</p>
      <p><strong>Due Date:</strong> {{due_date}}</p>
    </div>
  </header>

  <section class="billing-info">
    <div class="bill-from">
      <h3>From:</h3>
      <p><strong>{{company_name}}</strong></p>
      <p>{{company_address}}</p>
    </div>
    <div class="bill-to">
      <h3>To:</h3>
      <p><strong>{{client_name}}</strong></p>
      <p>{{client_address}}</p>
    </div>
  </section>

  <section class="items">
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
        <!-- Dynamic items will be inserted here -->
        {{#each items}}
        <tr>
          <td>{{description}}</td>
          <td>{{quantity}}</td>
          <td>{{rate}}</td>
          <td>{{amount}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </section>

  <section class="totals">
    <div class="totals-table">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>{{subtotal}}</span>
      </div>
      {{#if tax_rate}}
      <div class="total-row">
        <span>Tax ({{tax_rate}}%):</span>
        <span>{{tax_amount}}</span>
      </div>
      {{/if}}
      <div class="total-row final">
        <span><strong>Total:</strong></span>
        <span><strong>{{total}}</strong></span>
      </div>
    </div>
  </section>
</div>`

    return this.createDocumentTemplate({
      name: `${companyName} Invoice Template`,
      description: 'Professional invoice template',
      type: 'invoice',
      content,
      variables: defaultVariables,
      styling: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          text: '#1e293b'
        }
      }
    })
  }

  async createContractTemplate(
    contractType: string,
    parties: string[],
    customClauses?: string[]
  ): Promise<DocumentTemplate> {
    const defaultVariables: TemplateVariable[] = [
      { name: 'contract_title', type: 'text', required: true, defaultValue: contractType },
      { name: 'contract_date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'effective_date', type: 'date', required: true, defaultValue: '' },
      { name: 'expiration_date', type: 'date', required: false, defaultValue: '' },
      ...parties.map((party, index) => ({
        name: `party_${index + 1}_name`,
        type: 'text' as const,
        required: true,
        defaultValue: party
      })),
      ...parties.map((party, index) => ({
        name: `party_${index + 1}_address`,
        type: 'text' as const,
        required: true,
        defaultValue: ''
      })),
      { name: 'terms', type: 'text', required: true, defaultValue: '' },
      { name: 'governing_law', type: 'text', required: true, defaultValue: '' }
    ]

    const content = `
<div class="contract">
  <header class="contract-header">
    <h1>{{contract_title}}</h1>
    <p class="contract-date">Date: {{contract_date}}</p>
  </header>

  <section class="parties">
    <h2>Parties</h2>
    ${parties.map((_, index) => `
    <div class="party">
      <h3>Party ${index + 1}:</h3>
      <p><strong>{{party_${index + 1}_name}}</strong></p>
      <p>{{party_${index + 1}_address}}</p>
    </div>
    `).join('')}
  </section>

  <section class="terms">
    <h2>Terms and Conditions</h2>
    <div class="terms-content">
      {{terms}}
    </div>

    ${customClauses ? customClauses.map(clause => `
    <div class="clause">
      <p>${clause}</p>
    </div>
    `).join('') : ''}
  </section>

  <section class="signature">
    <h2>Signatures</h2>
    ${parties.map((_, index) => `
    <div class="signature-block">
      <p>{{party_${index + 1}_name}}</p>
      <div class="signature-line"></div>
      <p class="signature-date">Date: _____________</p>
    </div>
    `).join('')}
  </section>

  <footer class="contract-footer">
    <p><small>This contract is governed by {{governing_law}}.</small></p>
    <p><small>Effective Date: {{effective_date}} ${parties.length > 1 ? '| Expiration Date: {{expiration_date}}' : ''}</small></p>
  </footer>
</div>`

    return this.createDocumentTemplate({
      name: `${contractType} Contract Template`,
      description: `Legal contract template for ${contractType}`,
      type: 'contract',
      content,
      variables: defaultVariables
    })
  }

  async createReportTemplate(reportTitle: string, sections: string[]): Promise<DocumentTemplate> {
    const defaultVariables: TemplateVariable[] = [
      { name: 'report_title', type: 'text', required: true, defaultValue: reportTitle },
      { name: 'report_date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
      { name: 'author', type: 'text', required: true, defaultValue: '' },
      { name: 'executive_summary', type: 'text', required: false, defaultValue: '' },
      ...sections.map(section => ({
        name: section.toLowerCase().replace(/\s+/g, '_'),
        type: 'text' as const,
        required: false,
        defaultValue: ''
      })),
      { name: 'conclusions', type: 'text', required: false, defaultValue: '' },
      { name: 'recommendations', type: 'text', required: false, defaultValue: '' }
    ]

    const content = `
<div class="report">
  <header class="report-header">
    <h1>{{report_title}}</h1>
    <p class="report-meta">
      <strong>Date:</strong> {{report_date}}<br>
      <strong>Author:</strong> {{author}}
    </p>
  </header>

  {{#if executive_summary}}
  <section class="executive-summary">
    <h2>Executive Summary</h2>
    <p>{{executive_summary}}</p>
  </section>
  {{/if}}

  ${sections.map(section => `
  <section class="${section.toLowerCase().replace(/\s+/g, '-')}">
    <h2>${section}</h2>
    <div class="section-content">
      {{${section.toLowerCase().replace(/\s+/g, '_')}}}
    </div>
  </section>
  `).join('')}

  {{#if conclusions}}
  <section class="conclusions">
    <h2>Conclusions</h2>
    <p>{{conclusions}}</p>
  </section>
  {{/if}}

  {{#if recommendations}}
  <section class="recommendations">
    <h2>Recommendations</h2>
    <p>{{recommendations}}</p>
  </section>
  {{/if}}
</div>`

    return this.createDocumentTemplate({
      name: `${reportTitle} Template`,
      description: `Report template for ${reportTitle}`,
      type: 'report',
      content,
      variables: defaultVariables
    })
  }

  private getDocumentTypeForTemplate(templateType: string): 'pdf' | 'html' | 'docx' | 'txt' {
    switch (templateType) {
      case 'invoice':
      case 'contract':
      case 'certificate':
        return 'pdf'
      case 'report':
      case 'letter':
        return 'html'
      default:
        return 'html'
    }
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
          data[variable.name] = variable.defaultValue || []
          break
        case 'object':
          data[variable.name] = variable.defaultValue || {}
          break
        default:
          data[variable.name] = variable.defaultValue || ''
      }
    })

    return data
  }
}