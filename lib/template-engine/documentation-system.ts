export interface DocumentationSection {
  id: string
  title: string
  description: string
  content: string
  category: 'overview' | 'api' | 'guides' | 'examples' | 'troubleshooting'
  tags: string[]
  lastUpdated: Date
  version: string
  author: string
  readTime: number // in minutes
}

export interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  parameters?: APIParameter[]
  response: APIResponse
  examples: APIExample[]
  authentication?: string
  rateLimit?: string
  version: string
}

export interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
  example?: any
  enum?: string[]
  validation?: string
}

export interface APIResponse {
  type: string
  description: string
  schema: Record<string, any>
  examples: Record<string, any>
}

export interface APIExample {
  title: string
  description: string
  request: {
    method: string
    path: string
    headers?: Record<string, string>
    body?: any
  }
  response: {
    status: number
    headers?: Record<string, string>
    body: any
  }
}

export interface GuideStep {
  id: string
  title: string
  description: string
  content: string
  codeExample?: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  prerequisites: string[]
  outcomes: string[]
  resources: GuideResource[]
}

export interface GuideResource {
  title: string
  url: string
  type: 'documentation' | 'tutorial' | 'video' | 'example' | 'tool'
}

export interface CreationGuide {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'advanced' | 'best-practices' | 'troubleshooting'
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: GuideStep[]
  prerequisites: string[]
  outcomes: string[]
  relatedGuides: string[]
  tags: string[]
}

export interface DocumentationStats {
  totalSections: number
  totalAPIEndpoints: number
  totalGuides: number
  totalSteps: number
  completionRate: number
  lastUpdate: Date
  coverage: {
    overview: number
    api: number
    guides: number
    examples: number
    troubleshooting: number
  }
}

export class DocumentationSystem {
  private sections: Map<string, DocumentationSection> = new Map()
  private apiEndpoints: Map<string, APIEndpoint> = new Map()
  private guides: Map<string, CreationGuide> = new Map()
  private userProgress: Map<string, Set<string>> = new Map() // userId -> completed step IDs

  constructor() {
    this.initializeDocumentation()
    this.initializeAPIEndpoints()
    this.initializeGuides()
  }

  private initializeDocumentation() {
    const sections: DocumentationSection[] = [
      {
        id: 'template-engine-overview',
        title: 'Template Engine Overview',
        description: 'Comprehensive overview of the template engine architecture and capabilities',
        category: 'overview',
        tags: ['architecture', 'overview', 'getting-started'],
        lastUpdated: new Date(),
        version: '1.0.0',
        author: 'Template Engine Team',
        readTime: 10,
        content: `# Template Engine Overview

The Template Engine is a powerful system for generating custom client applications from predefined templates. It enables rapid deployment of client micro-apps with ≤7-day delivery capability.

## Key Features

- **Dynamic Template Compilation**: Convert template configurations into executable React components
- **Component Injection System**: Dynamically inject and map components based on template requirements
- **Automated Route Generation**: Generate Next.js routes and page structures automatically
- **Performance Optimization**: Built-in caching, lazy loading, and code splitting
- **End-to-End Testing**: Comprehensive testing and validation framework

## Architecture Components

1. **Template Compiler**: Processes template configurations and generates component code
2. **Component Mapper**: Maps template elements to React components
3. **Route Generator**: Creates Next.js routing structure
4. **Asset Optimizer**: Optimizes images, styles, and static assets
5. **Deployment Pipeline**: Automated build and deployment system

## Performance Targets

- Template Compilation: <30 seconds
- App Generation: <2 minutes
- Template Loading: <5 seconds
- Component Injection: <10 seconds

## Getting Started

To begin using the Template Engine, navigate to the main dashboard and select "Create New Template". Follow the Quick Start guide for a step-by-step walkthrough.`
      },
      {
        id: 'template-configuration-schema',
        title: 'Template Configuration Schema',
        description: 'Complete schema and structure for template configuration files',
        category: 'api',
        tags: ['configuration', 'schema', 'json', 'api'],
        lastUpdated: new Date(),
        version: '1.0.0',
        author: 'API Documentation Team',
        readTime: 15,
        content: `# Template Configuration Schema

Templates are defined using JSON configuration files that specify the structure, components, and behavior of the generated application.

## Base Template Structure

\`\`\`json
{
  "templateId": "string (required)",
  "name": "string (required)",
  "version": "string (required)",
  "description": "string (optional)",
  "type": "consultation | ecommerce | landing | custom",
  "pages": "array (required)",
  "components": "object (required)",
  "routing": "object (optional)",
  "theme": "object (optional)",
  "assets": "array (optional)",
  "metadata": "object (optional)"
}
\`\`\`

## Page Configuration

Each page in the template is defined with:

\`\`\`json
{
  "id": "string (required)",
  "path": "string (required)",
  "title": "string (required)",
  "layout": "default | form | fullscreen | custom",
  "components": "array (required)",
  "metadata": {
    "description": "string",
    "keywords": "array",
    "ogImage": "string"
  },
  "authentication": "boolean (optional)",
  "permissions": "array (optional)"
}
\`\`\`

## Component Mapping

Components are mapped using:

\`\`\`json
{
  "componentId": {
    "type": "string (required)",
    "props": "object (required)",
    "children": "array (optional)",
    "conditional": {
      "field": "string",
      "operator": "equals | not_equals | contains | greater_than | less_than",
      "value": "any"
    },
    "styling": {
      "className": "string",
      "customCSS": "string",
      "theme": "string"
    }
  }
}
\`\`\`

## Validation Rules

All template configurations are validated against the following rules:

1. **Required Fields**: templateId, name, version, pages, components
2. **Unique IDs**: All page and component IDs must be unique
3. **Valid References**: All component references must exist
4. **Route Conflicts**: No duplicate paths allowed
5. **Performance Limits**: Maximum 50 pages, 200 components per template`
      },
      {
        id: 'performance-optimization-guide',
        title: 'Performance Optimization Best Practices',
        description: 'Best practices for optimizing template performance and load times',
        category: 'guides',
        tags: ['performance', 'optimization', 'best-practices'],
        lastUpdated: new Date(),
        version: '1.0.0',
        author: 'Performance Team',
        readTime: 20,
        content: `# Performance Optimization Best Practices

This guide covers essential techniques for optimizing template performance and ensuring fast load times.

## Template Design Optimization

### 1. Component Structure
- Keep component hierarchy shallow (max 6 levels deep)
- Use semantic HTML elements for better performance
- Minimize inline styles and scripts

### 2. Asset Management
- Optimize images (use WebP format when possible)
- Compress CSS and JavaScript
- Use CDN for static assets
- Implement lazy loading for non-critical resources

### 3. Code Splitting
- Split large components into smaller chunks
- Load components on demand
- Use dynamic imports for route-based splitting

## Runtime Optimization

### 1. Caching Strategies
- Enable template caching for repeated compilations
- Use browser caching for static assets
- Implement service worker for offline functionality

### 2. Rendering Optimization
- Use React.memo for expensive components
- Implement virtual scrolling for large lists
- Avoid unnecessary re-renders

### 3. Bundle Optimization
- Tree shake unused code
- Minimize dependency size
- Use production builds only

## Monitoring and Measurement

### Performance Metrics
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms

### Tools and Analysis
- Use the built-in performance analyzer
- Monitor Core Web Vitals
- Regular performance audits
- Load testing for high-traffic scenarios`
      }
    ]

    sections.forEach(section => this.sections.set(section.id, section))
  }

  private initializeAPIEndpoints() {
    const endpoints: APIEndpoint[] = [
      {
        method: 'POST',
        path: '/api/templates/compile',
        description: 'Compile a template configuration into executable components',
        version: '1.0.0',
        authentication: 'Bearer token required',
        rateLimit: '100 requests per minute',
        parameters: [
          {
            name: 'templateConfig',
            type: 'object',
            required: true,
            description: 'Complete template configuration object',
            example: {
              templateId: 'consultation-mvp',
              name: 'Consultation Template',
              version: '1.0.0'
            }
          },
          {
            name: 'options',
            type: 'object',
            required: false,
            description: 'Compilation options and flags',
            example: {
              optimize: true,
              minify: false,
              sourceMaps: true
            }
          }
        ],
        response: {
          type: 'CompilationResult',
          description: 'Compilation result with status and generated files',
          schema: {
            success: 'boolean',
            compilationId: 'string',
            duration: 'number',
            generatedFiles: 'array',
            errors: 'array',
            warnings: 'array'
          },
          examples: {
            success: {
              success: true,
              compilationId: 'comp_12345',
              duration: 1250,
              generatedFiles: ['page1.tsx', 'page2.tsx'],
              errors: [],
              warnings: []
            },
            error: {
              success: false,
              compilationId: null,
              duration: 0,
              generatedFiles: [],
              errors: ['Invalid component reference: hero-section'],
              warnings: []
            }
          }
        },
        examples: [
          {
            title: 'Basic Template Compilation',
            description: 'Compile a simple consultation template',
            request: {
              method: 'POST',
              path: '/api/templates/compile',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-api-token'
              },
              body: {
                templateConfig: {
                  templateId: 'consultation-mvp',
                  name: 'Consultation Template',
                  version: '1.0.0',
                  pages: [
                    {
                      id: 'landing',
                      path: '/',
                      title: 'Welcome',
                      layout: 'default',
                      components: ['hero', 'contact-form']
                    }
                  ],
                  components: {
                    hero: {
                      type: 'HeroSection',
                      props: {
                        title: 'Professional Consultation',
                        subtitle: 'Get expert advice'
                      }
                    }
                  }
                },
                options: {
                  optimize: true,
                  minify: false
                }
              }
            },
            response: {
              status: 200,
              headers: {
                'Content-Type': 'application/json'
              },
              body: {
                success: true,
                compilationId: 'comp_abc123',
                duration: 1250,
                generatedFiles: ['pages/index.tsx', 'components/hero.tsx'],
                errors: [],
                warnings: []
              }
            }
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/templates/generate',
        description: 'Generate complete client application from compiled template',
        version: '1.0.0',
        authentication: 'Bearer token required',
        rateLimit: '20 requests per minute',
        parameters: [
          {
            name: 'templateId',
            type: 'string',
            required: true,
            description: 'Unique identifier of the compiled template'
          },
          {
            name: 'customization',
            type: 'object',
            required: false,
            description: 'Template customizations and overrides'
          },
          {
            name: 'deployment',
            type: 'object',
            required: false,
            description: 'Deployment configuration'
          }
        ],
        response: {
          type: 'GenerationResult',
          description: 'Complete application generation result',
          schema: {
            success: 'boolean',
            generationId: 'string',
            applicationUrl: 'string',
            deploymentId: 'string',
            duration: 'number',
            errors: 'array'
          },
          examples: {
            success: {
              success: true,
              generationId: 'gen_xyz789',
              applicationUrl: 'https://consultation-mvp-abc123.staging.example.com',
              deploymentId: 'deploy_def456',
              duration: 95000,
              errors: []
            }
          }
        },
        examples: [
          {
            title: 'Generate Application with Customization',
            description: 'Generate a customized consultation application',
            request: {
              method: 'POST',
              path: '/api/templates/generate',
              body: {
                templateId: 'consultation-mvp',
                customization: {
                  theme: {
                    primaryColor: '#007bff',
                    fontFamily: 'Inter'
                  },
                  content: {
                    companyName: 'Acme Consulting',
                    contactEmail: 'info@acme.com'
                  }
                },
                deployment: {
                  environment: 'staging',
                  subdomain: 'acme-consultation'
                }
              }
            },
            response: {
              status: 200,
              body: {
                success: true,
                generationId: 'gen_xyz789',
                applicationUrl: 'https://acme-consultation.staging.example.com',
                deploymentId: 'deploy_def456',
                duration: 95000,
                errors: []
              }
            }
          }
        ]
      }
    ]

    endpoints.forEach(endpoint => {
      const key = `${endpoint.method}:${endpoint.path}`
      this.apiEndpoints.set(key, endpoint)
    })
  }

  private initializeGuides() {
    const guides: CreationGuide[] = [
      {
        id: 'quick-start',
        title: 'Quick Start: Create Your First Template',
        description: 'Learn the basics of creating a template from scratch in under 30 minutes',
        category: 'getting-started',
        estimatedTime: '30 minutes',
        difficulty: 'beginner',
        prerequisites: ['Basic React knowledge', 'Understanding of JSON'],
        outcomes: ['Create a functional template', 'Understand template structure', 'Deploy to staging'],
        relatedGuides: ['consultation-template', 'performance-optimization'],
        tags: ['getting-started', 'tutorial', 'basics'],
        steps: [
          {
            id: 'setup-workspace',
            title: 'Set Up Your Workspace',
            description: 'Initialize your template development environment',
            duration: '5 min',
            difficulty: 'beginner',
            prerequisites: ['Access to Template Engine dashboard'],
            outcomes: ['Template project created', 'Development environment ready'],
            resources: [
              {
                title: 'Template Engine Dashboard',
                url: '/template-engine',
                type: 'tool'
              },
              {
                title: 'Template Structure Guide',
                url: '/docs/template-structure',
                type: 'documentation'
              }
            ],
            content: `Navigate to the Template Engine dashboard and create a new template project. This will set up the basic structure and configuration files needed for template development.

Key components you'll be working with:
• Template configuration (JSON)
• Component definitions
• Page layouts
• Theme settings

The workspace provides:
• Code editor with syntax highlighting
• Real-time validation
• Preview functionality
• Version control integration`,
            codeExample: `{
  "templateId": "my-first-template",
  "name": "My First Template",
  "version": "1.0.0",
  "description": "A simple template to get started",
  "type": "basic",
  "pages": [],
  "components": {},
  "theme": {
    "primaryColor": "#007bff",
    "fontFamily": "Inter"
  }
}`
          },
          {
            id: 'define-structure',
            title: 'Define Template Structure',
            description: 'Create the basic page structure and navigation',
            duration: '10 min',
            difficulty: 'beginner',
            prerequisites: ['Completed workspace setup'],
            outcomes: ['Page structure defined', 'Navigation configured'],
            resources: [
              {
                title: 'Page Configuration Reference',
                url: '/docs/page-configuration',
                type: 'documentation'
              }
            ],
            content: `Define the pages that will be generated in your template. Start with a simple structure containing a landing page and a contact page.

Each page needs:
• Unique page ID
• URL path
• Page title
• Layout type
• Component list

Planning your page structure:
1. Identify user journey
2. Define page purposes
3. Plan navigation flow
4. Consider responsive design`,
            codeExample: `{
  "pages": [
    {
      "id": "home",
      "path": "/",
      "title": "Welcome to Our Service",
      "layout": "default",
      "components": ["hero", "features", "contact"],
      "metadata": {
        "description": "Professional services for your business",
        "keywords": ["consulting", "professional", "services"]
      }
    },
    {
      "id": "about",
      "path": "/about",
      "title": "About Our Company",
      "layout": "default",
      "components": ["about-hero", "team", "values"],
      "metadata": {
        "description": "Learn more about our company and team"
      }
    }
  ]
}`
          }
        ]
      }
    ]

    guides.forEach(guide => this.guides.set(guide.id, guide))
  }

  // Documentation Section Management
  getDocumentationSection(sectionId: string): DocumentationSection | undefined {
    return this.sections.get(sectionId)
  }

  getAllDocumentationSections(): DocumentationSection[] {
    return Array.from(this.sections.values())
  }

  getDocumentationByCategory(category: DocumentationSection['category']): DocumentationSection[] {
    return Array.from(this.sections.values()).filter(section => section.category === category)
  }

  searchDocumentation(query: string): DocumentationSection[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.sections.values()).filter(section =>
      section.title.toLowerCase().includes(lowercaseQuery) ||
      section.description.toLowerCase().includes(lowercaseQuery) ||
      section.content.toLowerCase().includes(lowercaseQuery) ||
      section.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  addDocumentationSection(section: DocumentationSection): void {
    this.sections.set(section.id, section)
  }

  updateDocumentationSection(sectionId: string, updates: Partial<DocumentationSection>): boolean {
    const section = this.sections.get(sectionId)
    if (section) {
      const updatedSection = { ...section, ...updates, lastUpdated: new Date() }
      this.sections.set(sectionId, updatedSection)
      return true
    }
    return false
  }

  // API Endpoint Management
  getAPIEndpoint(method: string, path: string): APIEndpoint | undefined {
    const key = `${method.toUpperCase()}:${path}`
    return this.apiEndpoints.get(key)
  }

  getAllAPIEndpoints(): APIEndpoint[] {
    return Array.from(this.apiEndpoints.values())
  }

  getAPIEndpointsByMethod(method: string): APIEndpoint[] {
    return Array.from(this.apiEndpoints.values()).filter(endpoint =>
      endpoint.method === method.toUpperCase()
    )
  }

  addAPIEndpoint(endpoint: APIEndpoint): void {
    const key = `${endpoint.method}:${endpoint.path}`
    this.apiEndpoints.set(key, endpoint)
  }

  // Guide Management
  getGuide(guideId: string): CreationGuide | undefined {
    return this.guides.get(guideId)
  }

  getAllGuides(): CreationGuide[] {
    return Array.from(this.guides.values())
  }

  getGuidesByCategory(category: CreationGuide['category']): CreationGuide[] {
    return Array.from(this.guides.values()).filter(guide => guide.category === category)
  }

  getGuidesByDifficulty(difficulty: CreationGuide['difficulty']): CreationGuide[] {
    return Array.from(this.guides.values()).filter(guide => guide.difficulty === difficulty)
  }

  searchGuides(query: string): CreationGuide[] {
    const lowercaseQuery = query.toLowerCase()
    return Array.from(this.guides.values()).filter(guide =>
      guide.title.toLowerCase().includes(lowercaseQuery) ||
      guide.description.toLowerCase().includes(lowercaseQuery) ||
      guide.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  addGuide(guide: CreationGuide): void {
    this.guides.set(guide.id, guide)
  }

  // User Progress Management
  markStepCompleted(userId: string, stepId: string): void {
    if (!this.userProgress.has(userId)) {
      this.userProgress.set(userId, new Set())
    }
    this.userProgress.get(userId)!.add(stepId)
  }

  markStepIncomplete(userId: string, stepId: string): void {
    const userSteps = this.userProgress.get(userId)
    if (userSteps) {
      userSteps.delete(stepId)
    }
  }

  getUserProgress(userId: string): Set<string> {
    return this.userProgress.get(userId) || new Set()
  }

  getGuideProgress(userId: string, guideId: string): {
    completedSteps: number
    totalSteps: number
    percentage: number
  } {
    const guide = this.guides.get(guideId)
    if (!guide) {
      return { completedSteps: 0, totalSteps: 0, percentage: 0 }
    }

    const userSteps = this.getUserProgress(userId)
    const completedSteps = guide.steps.filter(step => userSteps.has(step.id)).length
    const totalSteps = guide.steps.length
    const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

    return { completedSteps, totalSteps, percentage }
  }

  // Statistics and Analytics
  getDocumentationStats(): DocumentationStats {
    const sections = this.getAllDocumentationSections()
    const endpoints = this.getAllAPIEndpoints()
    const guides = this.getAllGuides()

    const totalSteps = guides.reduce((acc, guide) => acc + guide.steps.length, 0)

    const coverage = {
      overview: sections.filter(s => s.category === 'overview').length,
      api: sections.filter(s => s.category === 'api').length + endpoints.length,
      guides: sections.filter(s => s.category === 'guides').length + guides.length,
      examples: sections.filter(s => s.category === 'examples').length,
      troubleshooting: sections.filter(s => s.category === 'troubleshooting').length
    }

    return {
      totalSections: sections.length,
      totalAPIEndpoints: endpoints.length,
      totalGuides: guides.length,
      totalSteps,
      completionRate: 100, // Placeholder - would calculate based on user progress
      lastUpdate: new Date(),
      coverage
    }
  }

  generateDocumentationReport(): {
    summary: DocumentationStats
    recentUpdates: DocumentationSection[]
    popularSections: DocumentationSection[]
    missingDocumentation: string[]
  } {
    const summary = this.getDocumentationStats()
    const sections = this.getAllDocumentationSections()

    // Recent updates (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentUpdates = sections
      .filter(section => section.lastUpdated > weekAgo)
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, 5)

    // Popular sections (placeholder - would use analytics data)
    const popularSections = sections
      .sort((a, b) => a.title.localeCompare(b.title))
      .slice(0, 5)

    // Missing documentation areas
    const missingDocumentation = [
      'Advanced customization examples',
      'Performance troubleshooting guide',
      'Migration guide for existing templates',
      'Integration with external APIs',
      'Custom component development'
    ]

    return {
      summary,
      recentUpdates,
      popularSections,
      missingDocumentation
    }
  }

  exportDocumentation(format: 'json' | 'markdown' | 'pdf'): string {
    const sections = this.getAllDocumentationSections()
    const endpoints = this.getAllAPIEndpoints()
    const guides = this.getAllGuides()

    switch (format) {
      case 'json':
        return JSON.stringify({
          sections,
          endpoints,
          guides,
          generatedAt: new Date().toISOString()
        }, null, 2)

      case 'markdown':
        let markdown = '# Template Engine Documentation\n\n'
        markdown += `Generated on ${new Date().toLocaleDateString()}\n\n`

        // Documentation sections
        markdown += '## Documentation Sections\n\n'
        sections.forEach(section => {
          markdown += `### ${section.title}\n\n`
          markdown += `${section.description}\n\n`
          markdown += `${section.content}\n\n`
          markdown += '---\n\n'
        })

        // API endpoints
        markdown += '## API Reference\n\n'
        endpoints.forEach(endpoint => {
          markdown += `### ${endpoint.method} ${endpoint.path}\n\n`
          markdown += `${endpoint.description}\n\n`
          if (endpoint.parameters && endpoint.parameters.length > 0) {
            markdown += '#### Parameters\n\n'
            endpoint.parameters.forEach(param => {
              markdown += `- **${param.name}** (${param.type}${param.required ? ', required' : ''}): ${param.description}\n`
            })
            markdown += '\n'
          }
          markdown += '---\n\n'
        })

        return markdown

      case 'pdf':
        // Placeholder for PDF generation
        return 'PDF generation not implemented yet'

      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
}

// Export singleton instance
export const documentationSystem = new DocumentationSystem()

// Validation functions for HT-029 documentation requirements
export function validateHT029DocumentationRequirements(): {
  templateSystemDocumentation: boolean
  usageGuides: boolean
  apiDocumentation: boolean
  templateCreationGuides: boolean
  allRequirementsMet: boolean
} {
  const stats = documentationSystem.getDocumentationStats()

  const results = {
    templateSystemDocumentation: stats.coverage.overview > 0,
    usageGuides: stats.coverage.guides > 0,
    apiDocumentation: stats.coverage.api > 0,
    templateCreationGuides: stats.totalGuides > 0,
    allRequirementsMet: false
  }

  results.allRequirementsMet = Object.values(results).every(Boolean)

  return results
}