import {
  DocumentTemplate,
  TemplateVariable,
  TemplateMetadata,
  PageSettings
} from '../core/types'

export interface TemplatePattern {
  id: string
  name: string
  category: 'business' | 'legal' | 'marketing' | 'technical' | 'educational' | 'healthcare'
  description: string
  useCase: string
  complexity: 'simple' | 'moderate' | 'complex'
  estimatedTime: string
  variables: TemplateVariable[]
  sections: TemplateSection[]
  styling: TemplateStyling
  preview?: string
}

export interface TemplateSection {
  id: string
  name: string
  description: string
  required: boolean
  content: string
  variables: string[]
  styling?: any
}

export interface TemplateStyling {
  colors: {
    primary: string
    secondary: string
    accent: string
  }
  fonts: {
    heading: string
    body: string
  }
  spacing: {
    section: string
    paragraph: string
  }
}

export interface ClientDeliverable {
  type: 'proposal' | 'contract' | 'invoice' | 'report' | 'presentation' | 'certificate'
  industry: string
  patterns: TemplatePattern[]
  customization: {
    brandingRequired: boolean
    contentVariations: string[]
    outputFormats: string[]
  }
}

export class DocumentTemplateLibrary {
  private patterns: Map<string, TemplatePattern> = new Map()
  private deliverables: Map<string, ClientDeliverable> = new Map()

  constructor() {
    this.initializeLibrary()
  }

  // Template Pattern Methods
  getPattern(patternId: string): TemplatePattern | null {
    return this.patterns.get(patternId) || null
  }

  getPatternsByCategory(category: string): TemplatePattern[] {
    return Array.from(this.patterns.values()).filter(p => p.category === category)
  }

  searchPatterns(query: string): TemplatePattern[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.patterns.values()).filter(p =>
      p.name.toLowerCase().includes(lowercaseQuery) ||
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.useCase.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Client Deliverable Methods
  getDeliverableTemplates(type: string, industry?: string): TemplatePattern[] {
    const deliverable = Array.from(this.deliverables.values()).find(d =>
      d.type === type && (!industry || d.industry === industry)
    )
    return deliverable?.patterns || []
  }

  // Template Creation from Patterns
  createTemplateFromPattern(patternId: string, customizations?: any): DocumentTemplate {
    const pattern = this.getPattern(patternId)
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`)
    }

    const template: DocumentTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: pattern.name,
      version: '1.0.0',
      type: 'document',
      documentType: 'html',
      schema: {
        variables: pattern.variables,
        sections: pattern.sections.map(s => ({
          id: s.id,
          name: s.name,
          type: 'content' as const,
          content: s.content,
          variables: s.variables
        })),
        layout: {
          type: 'single-page',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 },
          sections: []
        },
        styling: {
          fonts: [{
            family: pattern.styling.fonts.body,
            size: 16,
            weight: 'normal',
            style: 'normal',
            color: '#333333'
          }],
          colors: {
            primary: pattern.styling.colors.primary,
            secondary: pattern.styling.colors.secondary,
            accent: pattern.styling.colors.accent,
            background: '#ffffff',
            text: '#333333',
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
        html: this.generateHtmlFromPattern(pattern),
        css: this.generateCssFromPattern(pattern),
        assets: []
      },
      metadata: {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: pattern.name,
        description: pattern.description,
        tags: [pattern.category, pattern.complexity],
        category: pattern.category,
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0'
      },
      pageSettings: {
        size: { width: 8.5, height: 11, unit: 'in' },
        orientation: 'portrait',
        margins: { top: 1, right: 1, bottom: 1, left: 1, unit: 'in' }
      },
      sections: pattern.sections.map(s => ({
        id: s.id,
        name: s.name,
        type: 'content',
        content: s.content,
        variables: s.variables
      }))
    }

    // Apply customizations if provided
    if (customizations) {
      this.applyCustomizations(template, customizations)
    }

    return template
  }

  private initializeLibrary(): void {
    // Business Document Patterns
    this.addBusinessPatterns()

    // Legal Document Patterns
    this.addLegalPatterns()

    // Marketing Document Patterns
    this.addMarketingPatterns()

    // Technical Document Patterns
    this.addTechnicalPatterns()

    // Educational Document Patterns
    this.addEducationalPatterns()

    // Initialize Client Deliverables
    this.initializeDeliverables()
  }

  private addBusinessPatterns(): void {
    // Business Proposal Pattern
    this.patterns.set('business-proposal', {
      id: 'business-proposal',
      name: 'Business Proposal',
      category: 'business',
      description: 'Professional business proposal template with executive summary, scope, timeline, and pricing',
      useCase: 'Client project proposals, service offerings, partnership proposals',
      complexity: 'moderate',
      estimatedTime: '2-4 hours',
      variables: [
        { name: 'client_name', type: 'text', required: true, defaultValue: '' },
        { name: 'project_title', type: 'text', required: true, defaultValue: '' },
        { name: 'proposal_date', type: 'date', required: true, defaultValue: '' },
        { name: 'company_name', type: 'text', required: true, defaultValue: '' },
        { name: 'executive_summary', type: 'text', required: true, defaultValue: '' },
        { name: 'project_scope', type: 'text', required: true, defaultValue: '' },
        { name: 'timeline', type: 'text', required: true, defaultValue: '' },
        { name: 'total_cost', type: 'number', required: true, defaultValue: 0 },
        { name: 'deliverables', type: 'array', required: true, defaultValue: [] }
      ],
      sections: [
        {
          id: 'cover',
          name: 'Cover Page',
          description: 'Professional cover with project title and company branding',
          required: true,
          content: `
            <div class="cover-page">
              <h1>{{project_title}}</h1>
              <h2>Business Proposal</h2>
              <p class="client-info">Prepared for: {{client_name}}</p>
              <p class="company-info">{{company_name}}</p>
              <p class="date">{{proposal_date}}</p>
            </div>
          `,
          variables: ['project_title', 'client_name', 'company_name', 'proposal_date']
        },
        {
          id: 'executive-summary',
          name: 'Executive Summary',
          description: 'High-level overview of the proposed project',
          required: true,
          content: `
            <section class="executive-summary">
              <h2>Executive Summary</h2>
              <p>{{executive_summary}}</p>
            </section>
          `,
          variables: ['executive_summary']
        },
        {
          id: 'scope',
          name: 'Project Scope',
          description: 'Detailed description of project deliverables and scope',
          required: true,
          content: `
            <section class="project-scope">
              <h2>Project Scope</h2>
              <p>{{project_scope}}</p>
              <h3>Deliverables</h3>
              <ul>
                {{#each deliverables}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </section>
          `,
          variables: ['project_scope', 'deliverables']
        },
        {
          id: 'timeline',
          name: 'Timeline & Milestones',
          description: 'Project timeline with key milestones',
          required: true,
          content: `
            <section class="timeline">
              <h2>Timeline & Milestones</h2>
              <p>{{timeline}}</p>
            </section>
          `,
          variables: ['timeline']
        },
        {
          id: 'pricing',
          name: 'Investment & Pricing',
          description: 'Cost breakdown and pricing structure',
          required: true,
          content: `
            <section class="pricing">
              <h2>Investment</h2>
              <p class="total-cost">Total Project Cost: $` + '{{total_cost}}' + `</p>
            </section>
          `,
          variables: ['total_cost']
        }
      ],
      styling: {
        colors: {
          primary: '#2563eb',
          secondary: '#64748b',
          accent: '#0ea5e9'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1rem'
        }
      }
    })

    // Meeting Minutes Pattern
    this.patterns.set('meeting-minutes', {
      id: 'meeting-minutes',
      name: 'Meeting Minutes',
      category: 'business',
      description: 'Structured meeting minutes template with attendees, agenda, and action items',
      useCase: 'Team meetings, client calls, board meetings, project reviews',
      complexity: 'simple',
      estimatedTime: '15-30 minutes',
      variables: [
        { name: 'meeting_title', type: 'text', required: true, defaultValue: '' },
        { name: 'meeting_date', type: 'date', required: true, defaultValue: '' },
        { name: 'meeting_time', type: 'text', required: true, defaultValue: '' },
        { name: 'location', type: 'text', required: false, defaultValue: '' },
        { name: 'chair', type: 'text', required: true, defaultValue: '' },
        { name: 'attendees', type: 'array', required: true, defaultValue: [] },
        { name: 'agenda_items', type: 'array', required: true, defaultValue: [] },
        { name: 'action_items', type: 'array', required: true, defaultValue: [] },
        { name: 'next_meeting', type: 'text', required: false, defaultValue: '' }
      ],
      sections: [
        {
          id: 'header',
          name: 'Meeting Header',
          description: 'Meeting title, date, time, and basic information',
          required: true,
          content: `
            <div class="meeting-header">
              <h1>{{meeting_title}}</h1>
              <div class="meeting-info">
                <p><strong>Date:</strong> {{meeting_date}}</p>
                <p><strong>Time:</strong> {{meeting_time}}</p>
                {{#if location}}<p><strong>Location:</strong> {{location}}</p>{{/if}}
                <p><strong>Chair:</strong> {{chair}}</p>
              </div>
            </div>
          `,
          variables: ['meeting_title', 'meeting_date', 'meeting_time', 'location', 'chair']
        },
        {
          id: 'attendees',
          name: 'Attendees',
          description: 'List of meeting participants',
          required: true,
          content: `
            <section class="attendees">
              <h2>Attendees</h2>
              <ul>
                {{#each attendees}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </section>
          `,
          variables: ['attendees']
        },
        {
          id: 'agenda',
          name: 'Agenda & Discussion',
          description: 'Meeting agenda items and discussion points',
          required: true,
          content: `
            <section class="agenda">
              <h2>Agenda & Discussion</h2>
              {{#each agenda_items}}
              <div class="agenda-item">
                <h3>{{title}}</h3>
                <p>{{discussion}}</p>
                {{#if decisions}}<p><strong>Decisions:</strong> {{decisions}}</p>{{/if}}
              </div>
              {{/each}}
            </section>
          `,
          variables: ['agenda_items']
        },
        {
          id: 'actions',
          name: 'Action Items',
          description: 'Follow-up actions and responsibilities',
          required: true,
          content: `
            <section class="action-items">
              <h2>Action Items</h2>
              <table>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Responsible</th>
                    <th>Due Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {{#each action_items}}
                  <tr>
                    <td>{{action}}</td>
                    <td>{{responsible}}</td>
                    <td>{{due_date}}</td>
                    <td>{{status}}</td>
                  </tr>
                  {{/each}}
                </tbody>
              </table>
            </section>
          `,
          variables: ['action_items']
        }
      ],
      styling: {
        colors: {
          primary: '#059669',
          secondary: '#6b7280',
          accent: '#10b981'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '1.5rem',
          paragraph: '0.75rem'
        }
      }
    })
  }

  private addLegalPatterns(): void {
    // Service Agreement Pattern
    this.patterns.set('service-agreement', {
      id: 'service-agreement',
      name: 'Service Agreement',
      category: 'legal',
      description: 'Professional service agreement template with terms, conditions, and legal clauses',
      useCase: 'Client contracts, service agreements, consulting contracts',
      complexity: 'complex',
      estimatedTime: '1-2 hours',
      variables: [
        { name: 'client_name', type: 'text', required: true, defaultValue: '' },
        { name: 'client_address', type: 'text', required: true, defaultValue: '' },
        { name: 'provider_name', type: 'text', required: true, defaultValue: '' },
        { name: 'provider_address', type: 'text', required: true, defaultValue: '' },
        { name: 'service_description', type: 'text', required: true, defaultValue: '' },
        { name: 'contract_date', type: 'date', required: true, defaultValue: '' },
        { name: 'start_date', type: 'date', required: true, defaultValue: '' },
        { name: 'end_date', type: 'date', required: false, defaultValue: '' },
        { name: 'payment_terms', type: 'text', required: true, defaultValue: '' },
        { name: 'governing_law', type: 'text', required: true, defaultValue: '' }
      ],
      sections: [
        {
          id: 'title',
          name: 'Agreement Title',
          description: 'Formal title and contract date',
          required: true,
          content: `
            <div class="contract-title">
              <h1>Service Agreement</h1>
              <p class="contract-date">This Agreement is made on {{contract_date}}</p>
            </div>
          `,
          variables: ['contract_date']
        },
        {
          id: 'parties',
          name: 'Parties',
          description: 'Legal identification of contracting parties',
          required: true,
          content: `
            <section class="parties">
              <h2>Parties</h2>
              <div class="party">
                <h3>Service Provider</h3>
                <p><strong>{{provider_name}}</strong></p>
                <p>{{provider_address}}</p>
              </div>
              <div class="party">
                <h3>Client</h3>
                <p><strong>{{client_name}}</strong></p>
                <p>{{client_address}}</p>
              </div>
            </section>
          `,
          variables: ['provider_name', 'provider_address', 'client_name', 'client_address']
        },
        {
          id: 'services',
          name: 'Services',
          description: 'Description of services to be provided',
          required: true,
          content: `
            <section class="services">
              <h2>Services</h2>
              <p>{{service_description}}</p>
              <p><strong>Start Date:</strong> {{start_date}}</p>
              {{#if end_date}}<p><strong>End Date:</strong> {{end_date}}</p>{{/if}}
            </section>
          `,
          variables: ['service_description', 'start_date', 'end_date']
        },
        {
          id: 'payment',
          name: 'Payment Terms',
          description: 'Payment schedule and terms',
          required: true,
          content: `
            <section class="payment">
              <h2>Payment Terms</h2>
              <p>{{payment_terms}}</p>
            </section>
          `,
          variables: ['payment_terms']
        },
        {
          id: 'legal',
          name: 'Legal Terms',
          description: 'Standard legal clauses and governing law',
          required: true,
          content: `
            <section class="legal-terms">
              <h2>Legal Terms</h2>
              <p>This agreement shall be governed by the laws of {{governing_law}}.</p>
              <h3>Signatures</h3>
              <div class="signatures">
                <div class="signature-block">
                  <p>{{provider_name}}</p>
                  <div class="signature-line"></div>
                  <p>Date: ________________</p>
                </div>
                <div class="signature-block">
                  <p>{{client_name}}</p>
                  <div class="signature-line"></div>
                  <p>Date: ________________</p>
                </div>
              </div>
            </section>
          `,
          variables: ['governing_law', 'provider_name', 'client_name']
        }
      ],
      styling: {
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#374151'
        },
        fonts: {
          heading: 'Times New Roman, serif',
          body: 'Times New Roman, serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1rem'
        }
      }
    })
  }

  private addMarketingPatterns(): void {
    // Case Study Pattern
    this.patterns.set('case-study', {
      id: 'case-study',
      name: 'Case Study',
      category: 'marketing',
      description: 'Professional case study template showcasing client success stories',
      useCase: 'Client success stories, project showcases, marketing materials',
      complexity: 'moderate',
      estimatedTime: '1-3 hours',
      variables: [
        { name: 'client_name', type: 'text', required: true, defaultValue: '' },
        { name: 'project_title', type: 'text', required: true, defaultValue: '' },
        { name: 'industry', type: 'text', required: true, defaultValue: '' },
        { name: 'challenge', type: 'text', required: true, defaultValue: '' },
        { name: 'solution', type: 'text', required: true, defaultValue: '' },
        { name: 'results', type: 'text', required: true, defaultValue: '' },
        { name: 'metrics', type: 'array', required: false, defaultValue: [] },
        { name: 'testimonial', type: 'text', required: false, defaultValue: '' },
        { name: 'testimonial_author', type: 'text', required: false, defaultValue: '' }
      ],
      sections: [
        {
          id: 'overview',
          name: 'Project Overview',
          description: 'High-level project summary and client information',
          required: true,
          content: `
            <section class="overview">
              <h1>{{project_title}}</h1>
              <div class="client-info">
                <h2>{{client_name}}</h2>
                <p class="industry">{{industry}}</p>
              </div>
            </section>
          `,
          variables: ['project_title', 'client_name', 'industry']
        },
        {
          id: 'challenge',
          name: 'The Challenge',
          description: 'Description of the problem or challenge faced',
          required: true,
          content: `
            <section class="challenge">
              <h2>The Challenge</h2>
              <p>{{challenge}}</p>
            </section>
          `,
          variables: ['challenge']
        },
        {
          id: 'solution',
          name: 'Our Solution',
          description: 'Detailed explanation of the solution provided',
          required: true,
          content: `
            <section class="solution">
              <h2>Our Solution</h2>
              <p>{{solution}}</p>
            </section>
          `,
          variables: ['solution']
        },
        {
          id: 'results',
          name: 'Results & Impact',
          description: 'Outcomes and measurable results achieved',
          required: true,
          content: `
            <section class="results">
              <h2>Results & Impact</h2>
              <p>{{results}}</p>
              {{#if metrics}}
              <div class="metrics">
                <h3>Key Metrics</h3>
                {{#each metrics}}
                <div class="metric">
                  <span class="value">{{value}}</span>
                  <span class="label">{{label}}</span>
                </div>
                {{/each}}
              </div>
              {{/if}}
            </section>
          `,
          variables: ['results', 'metrics']
        }
      ],
      styling: {
        colors: {
          primary: '#7c3aed',
          secondary: '#6b7280',
          accent: '#a855f7'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '2.5rem',
          paragraph: '1rem'
        }
      }
    })
  }

  private addTechnicalPatterns(): void {
    // Technical Documentation Pattern
    this.patterns.set('technical-documentation', {
      id: 'technical-documentation',
      name: 'Technical Documentation',
      category: 'technical',
      description: 'Comprehensive technical documentation template with code examples and API references',
      useCase: 'API documentation, technical guides, system documentation',
      complexity: 'complex',
      estimatedTime: '2-4 hours',
      variables: [
        { name: 'product_name', type: 'text', required: true, defaultValue: '' },
        { name: 'version', type: 'text', required: true, defaultValue: '' },
        { name: 'overview', type: 'text', required: true, defaultValue: '' },
        { name: 'prerequisites', type: 'array', required: false, defaultValue: [] },
        { name: 'installation_steps', type: 'array', required: true, defaultValue: [] },
        { name: 'configuration', type: 'text', required: false, defaultValue: '' },
        { name: 'api_endpoints', type: 'array', required: false, defaultValue: [] }
      ],
      sections: [
        {
          id: 'introduction',
          name: 'Introduction',
          description: 'Product overview and version information',
          required: true,
          content: `
            <section class="introduction">
              <h1>{{product_name}} Documentation</h1>
              <p class="version">Version {{version}}</p>
              <h2>Overview</h2>
              <p>{{overview}}</p>
            </section>
          `,
          variables: ['product_name', 'version', 'overview']
        },
        {
          id: 'getting-started',
          name: 'Getting Started',
          description: 'Prerequisites and installation instructions',
          required: true,
          content: `
            <section class="getting-started">
              <h2>Getting Started</h2>
              {{#if prerequisites}}
              <h3>Prerequisites</h3>
              <ul>
                {{#each prerequisites}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
              {{/if}}
              <h3>Installation</h3>
              <ol>
                {{#each installation_steps}}
                <li>{{this}}</li>
                {{/each}}
              </ol>
            </section>
          `,
          variables: ['prerequisites', 'installation_steps']
        }
      ],
      styling: {
        colors: {
          primary: '#1f2937',
          secondary: '#6b7280',
          accent: '#3b82f6'
        },
        fonts: {
          heading: 'JetBrains Mono, monospace',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1rem'
        }
      }
    })
  }

  private addEducationalPatterns(): void {
    // Course Outline Pattern
    this.patterns.set('course-outline', {
      id: 'course-outline',
      name: 'Course Outline',
      category: 'educational',
      description: 'Structured course outline template with modules, objectives, and assessments',
      useCase: 'Training programs, educational courses, workshop planning',
      complexity: 'moderate',
      estimatedTime: '1-2 hours',
      variables: [
        { name: 'course_title', type: 'text', required: true, defaultValue: '' },
        { name: 'instructor', type: 'text', required: true, defaultValue: '' },
        { name: 'duration', type: 'text', required: true, defaultValue: '' },
        { name: 'course_description', type: 'text', required: true, defaultValue: '' },
        { name: 'learning_objectives', type: 'array', required: true, defaultValue: [] },
        { name: 'modules', type: 'array', required: true, defaultValue: [] },
        { name: 'assessments', type: 'array', required: false, defaultValue: [] }
      ],
      sections: [
        {
          id: 'course-info',
          name: 'Course Information',
          description: 'Basic course details and instructor information',
          required: true,
          content: `
            <section class="course-info">
              <h1>{{course_title}}</h1>
              <div class="course-details">
                <p><strong>Instructor:</strong> {{instructor}}</p>
                <p><strong>Duration:</strong> {{duration}}</p>
              </div>
              <h2>Course Description</h2>
              <p>{{course_description}}</p>
            </section>
          `,
          variables: ['course_title', 'instructor', 'duration', 'course_description']
        },
        {
          id: 'objectives',
          name: 'Learning Objectives',
          description: 'Course learning outcomes and objectives',
          required: true,
          content: `
            <section class="objectives">
              <h2>Learning Objectives</h2>
              <ul>
                {{#each learning_objectives}}
                <li>{{this}}</li>
                {{/each}}
              </ul>
            </section>
          `,
          variables: ['learning_objectives']
        },
        {
          id: 'curriculum',
          name: 'Course Modules',
          description: 'Detailed curriculum breakdown by modules',
          required: true,
          content: `
            <section class="curriculum">
              <h2>Course Modules</h2>
              {{#each modules}}
              <div class="module">
                <h3>Module {{number}}: {{title}}</h3>
                <p>{{description}}</p>
                <p><strong>Duration:</strong> {{duration}}</p>
                {{#if topics}}
                <ul>
                  {{#each topics}}
                  <li>{{this}}</li>
                  {{/each}}
                </ul>
                {{/if}}
              </div>
              {{/each}}
            </section>
          `,
          variables: ['modules']
        }
      ],
      styling: {
        colors: {
          primary: '#dc2626',
          secondary: '#6b7280',
          accent: '#ef4444'
        },
        fonts: {
          heading: 'Inter, sans-serif',
          body: 'Inter, sans-serif'
        },
        spacing: {
          section: '2rem',
          paragraph: '1rem'
        }
      }
    })
  }

  private initializeDeliverables(): void {
    // Technology Industry Deliverables
    this.deliverables.set('tech-proposal', {
      type: 'proposal',
      industry: 'technology',
      patterns: [
        this.patterns.get('business-proposal')!,
        this.patterns.get('technical-documentation')!
      ],
      customization: {
        brandingRequired: true,
        contentVariations: ['web-development', 'mobile-app', 'api-integration'],
        outputFormats: ['pdf', 'html']
      }
    })

    // Legal Industry Deliverables
    this.deliverables.set('legal-contract', {
      type: 'contract',
      industry: 'legal',
      patterns: [
        this.patterns.get('service-agreement')!
      ],
      customization: {
        brandingRequired: true,
        contentVariations: ['consulting', 'development', 'maintenance'],
        outputFormats: ['pdf']
      }
    })

    // Marketing Industry Deliverables
    this.deliverables.set('marketing-report', {
      type: 'report',
      industry: 'marketing',
      patterns: [
        this.patterns.get('case-study')!
      ],
      customization: {
        brandingRequired: true,
        contentVariations: ['campaign-results', 'quarterly-review', 'project-showcase'],
        outputFormats: ['pdf', 'html']
      }
    })
  }

  private generateHtmlFromPattern(pattern: TemplatePattern): string {
    const sectionsHtml = pattern.sections
      .map(section => section.content)
      .join('\n')

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{document_title}}</title>
</head>
<body>
    <div class="document-container">
        ${sectionsHtml}
    </div>
</body>
</html>`
  }

  private generateCssFromPattern(pattern: TemplatePattern): string {
    return `
/* ${pattern.name} Styling */
.document-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    font-family: ${pattern.styling.fonts.body};
    line-height: 1.6;
    color: #333;
}

h1, h2, h3, h4, h5, h6 {
    font-family: ${pattern.styling.fonts.heading};
    color: ${pattern.styling.colors.primary};
    margin-bottom: ${pattern.styling.spacing.paragraph};
}

h1 {
    font-size: 2.5rem;
    margin-bottom: ${pattern.styling.spacing.section};
    border-bottom: 3px solid ${pattern.styling.colors.primary};
    padding-bottom: 0.5rem;
}

h2 {
    font-size: 2rem;
    margin-top: ${pattern.styling.spacing.section};
    margin-bottom: ${pattern.styling.spacing.paragraph};
}

h3 {
    font-size: 1.5rem;
    color: ${pattern.styling.colors.secondary};
}

p {
    margin-bottom: ${pattern.styling.spacing.paragraph};
}

.section {
    margin-bottom: ${pattern.styling.spacing.section};
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: ${pattern.styling.spacing.paragraph} 0;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: ${pattern.styling.colors.primary};
    color: white;
    font-weight: 600;
}

.signature-line {
    border-bottom: 1px solid #333;
    width: 200px;
    margin: 10px 0;
}

.highlight {
    background-color: ${pattern.styling.colors.accent}20;
    padding: 2px 4px;
    border-radius: 3px;
}`
  }

  private applyCustomizations(template: DocumentTemplate, customizations: any): void {
    // Apply color customizations
    if (customizations.colors) {
      template.schema.styling.colors = {
        ...template.schema.styling.colors,
        ...customizations.colors
      }
    }

    // Apply font customizations
    if (customizations.fonts) {
      template.schema.styling.fonts = [
        ...template.schema.styling.fonts,
        ...customizations.fonts
      ]
    }

    // Apply content customizations
    if (customizations.content) {
      template.content.html = template.content.html.replace(
        /{{custom_content}}/g,
        customizations.content
      )
    }
  }

  // Utility methods
  getAllPatterns(): TemplatePattern[] {
    return Array.from(this.patterns.values())
  }

  getPatternCategories(): string[] {
    const categories = new Set(Array.from(this.patterns.values()).map(p => p.category))
    return Array.from(categories)
  }

  getComplexityLevels(): string[] {
    const levels = new Set(Array.from(this.patterns.values()).map(p => p.complexity))
    return Array.from(levels)
  }
}