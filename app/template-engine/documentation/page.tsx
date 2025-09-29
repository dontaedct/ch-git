'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { BookOpen, FileText, Code, Zap, Search, ExternalLink, CheckCircle, Copy, Download } from 'lucide-react'

interface DocumentationSection {
  id: string
  title: string
  description: string
  content: string
  category: 'overview' | 'api' | 'guides' | 'examples'
  tags: string[]
  lastUpdated: Date
}

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  parameters?: Parameter[]
  response: string
  example: string
}

interface Parameter {
  name: string
  type: string
  required: boolean
  description: string
}

export default function TemplateDocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'overview' | 'api' | 'guides' | 'examples'>('all')

  const [documentation] = useState<DocumentationSection[]>([
    {
      id: 'template-engine-overview',
      title: 'Template Engine Overview',
      description: 'Comprehensive overview of the template engine architecture and capabilities',
      category: 'overview',
      tags: ['architecture', 'overview', 'getting-started'],
      lastUpdated: new Date(),
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
- Component Injection: <10 seconds`
    },
    {
      id: 'template-configuration',
      title: 'Template Configuration Schema',
      description: 'Complete schema and structure for template configuration files',
      category: 'api',
      tags: ['configuration', 'schema', 'json'],
      lastUpdated: new Date(),
      content: `# Template Configuration Schema

Templates are defined using JSON configuration files that specify the structure, components, and behavior of the generated application.

## Base Template Structure

\`\`\`json
{
  "templateId": "string",
  "name": "string",
  "version": "string",
  "description": "string",
  "pages": [...],
  "components": {...},
  "routing": {...},
  "theme": {...},
  "assets": [...]
}
\`\`\`

## Page Configuration

Each page in the template is defined with:

\`\`\`json
{
  "id": "string",
  "path": "string",
  "title": "string",
  "layout": "string",
  "components": [...],
  "metadata": {...}
}
\`\`\`

## Component Mapping

Components are mapped using:

\`\`\`json
{
  "componentId": {
    "type": "string",
    "props": {...},
    "children": [...],
    "conditional": {...}
  }
}
\`\`\``
    },
    {
      id: 'quick-start-guide',
      title: 'Quick Start Guide',
      description: 'Get started with creating your first template in minutes',
      category: 'guides',
      tags: ['getting-started', 'tutorial', 'quick-start'],
      lastUpdated: new Date(),
      content: `# Quick Start Guide

This guide will help you create your first template and generate a client application.

## Step 1: Access the Template Engine

Navigate to the Template Engine dashboard and select "Create New Template".

## Step 2: Choose a Template Type

Select from available template types:
- **Consultation MVP**: Landing page + questionnaire + PDF generation
- **E-commerce Basic**: Product catalog + cart + checkout
- **Custom Template**: Build from scratch

## Step 3: Configure Your Template

1. Set template metadata (name, description, version)
2. Define page structure and navigation
3. Configure components and their properties
4. Set up theme and styling options

## Step 4: Test and Validate

Use the testing interface to validate your template:
- Component validation
- Template compilation testing
- Performance optimization

## Step 5: Generate Application

Run the generation pipeline to create your client application:
- Template compilation
- Component injection
- Route generation
- Asset optimization
- Deployment to staging`
    },
    {
      id: 'consultation-template-example',
      title: 'Consultation MVP Template Example',
      description: 'Complete example of a consultation workflow template implementation',
      category: 'examples',
      tags: ['consultation', 'mvp', 'example', 'workflow'],
      lastUpdated: new Date(),
      content: `# Consultation MVP Template Example

This example demonstrates a complete consultation workflow template with landing page, questionnaire, and PDF generation.

## Template Configuration

\`\`\`json
{
  "templateId": "consultation-mvp",
  "name": "Consultation MVP Template",
  "version": "1.0.0",
  "description": "Landing page with questionnaire and PDF consultation generation",
  "pages": [
    {
      "id": "landing",
      "path": "/",
      "title": "Professional Consultation",
      "layout": "default",
      "components": ["hero", "contact-form", "testimonials"]
    },
    {
      "id": "questionnaire",
      "path": "/questionnaire",
      "title": "Consultation Questionnaire",
      "layout": "form",
      "components": ["progress-bar", "question-flow", "navigation"]
    },
    {
      "id": "results",
      "path": "/results",
      "title": "Your Consultation Results",
      "layout": "default",
      "components": ["results-summary", "pdf-download", "next-steps"]
    }
  ]
}
\`\`\`

## Component Implementations

### Hero Component
\`\`\`jsx
const HeroSection = ({ title, subtitle, backgroundImage }) => {
  return (
    <section className="hero-section" style={{backgroundImage: \`url(\${backgroundImage})\`}}>
      <div className="hero-content">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="cta-button">Start Consultation</button>
      </div>
    </section>
  )
}
\`\`\``
    }
  ])

  const [apiEndpoints] = useState<APIEndpoint[]>([
    {
      method: 'POST',
      path: '/api/templates/compile',
      description: 'Compile a template configuration into executable components',
      parameters: [
        { name: 'templateConfig', type: 'object', required: true, description: 'Template configuration object' },
        { name: 'options', type: 'object', required: false, description: 'Compilation options' }
      ],
      response: 'CompilationResult',
      example: `{
  "templateConfig": {
    "templateId": "consultation-mvp",
    "name": "Consultation Template",
    "pages": [...]
  },
  "options": {
    "optimize": true,
    "minify": false
  }
}`
    },
    {
      method: 'POST',
      path: '/api/templates/generate',
      description: 'Generate complete client application from template',
      parameters: [
        { name: 'templateId', type: 'string', required: true, description: 'Template identifier' },
        { name: 'customization', type: 'object', required: false, description: 'Template customizations' }
      ],
      response: 'GenerationResult',
      example: `{
  "templateId": "consultation-mvp",
  "customization": {
    "theme": {
      "primaryColor": "#007bff",
      "fontFamily": "Inter"
    },
    "content": {
      "companyName": "Acme Consulting"
    }
  }
}`
    },
    {
      method: 'GET',
      path: '/api/templates/{templateId}/validate',
      description: 'Validate template configuration and components',
      parameters: [
        { name: 'templateId', type: 'string', required: true, description: 'Template identifier' }
      ],
      response: 'ValidationResult',
      example: `GET /api/templates/consultation-mvp/validate`
    },
    {
      method: 'GET',
      path: '/api/templates/{templateId}/performance',
      description: 'Get performance metrics for template',
      parameters: [
        { name: 'templateId', type: 'string', required: true, description: 'Template identifier' }
      ],
      response: 'PerformanceMetrics',
      example: `GET /api/templates/consultation-mvp/performance`
    }
  ])

  const filteredDocs = documentation.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesSearch
  })

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodBadge = (method: APIEndpoint['method']) => {
    const variants = {
      GET: 'secondary',
      POST: 'default',
      PUT: 'outline',
      DELETE: 'destructive'
    } as const

    return <Badge variant={variants[method]}>{method}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template System Documentation</h1>
          <p className="text-muted-foreground">
            Comprehensive documentation, API reference, and usage guides for the template engine
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            API Reference
          </Button>
        </div>
      </div>

      {/* Documentation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Documentation Overview
          </CardTitle>
          <CardDescription>
            Quick access to key documentation sections and resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="font-semibold">Getting Started</div>
              <div className="text-sm text-muted-foreground">Quick start guides</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Code className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="font-semibold">API Reference</div>
              <div className="text-sm text-muted-foreground">Complete API docs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="font-semibold">Examples</div>
              <div className="text-sm text-muted-foreground">Template examples</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <div className="font-semibold">Best Practices</div>
              <div className="text-sm text-muted-foreground">Guidelines & tips</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'overview', 'api', 'guides', 'examples'].map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category as any)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Content */}
      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
        </TabsList>

        <TabsContent value="documentation">
          <div className="space-y-6">
            {filteredDocs.map((doc) => (
              <Card key={doc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {doc.title}
                      </CardTitle>
                      <CardDescription>{doc.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{doc.category}</Badge>
                      <Button
                        onClick={() => copyToClipboard(doc.content)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {doc.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {doc.content}
                    </pre>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    Last updated: {doc.lastUpdated.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-6">
            {apiEndpoints.map((endpoint, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMethodBadge(endpoint.method)}
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <Button
                      onClick={() => copyToClipboard(endpoint.example)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Example
                    </Button>
                  </div>
                  <CardDescription>{endpoint.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {endpoint.parameters && (
                    <div>
                      <h4 className="font-semibold mb-2">Parameters</h4>
                      <div className="space-y-2">
                        {endpoint.parameters.map((param) => (
                          <div key={param.name} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <code className="text-sm">{param.name}</code>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({param.type}) {param.required && <span className="text-red-500">*</span>}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {param.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold mb-2">Example Request</h4>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {endpoint.example}
                    </pre>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Response Type</h4>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {endpoint.response}
                    </code>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Documentation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Status</CardTitle>
          <CardDescription>
            Current status of documentation sections and completion metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{documentation.length}</div>
              <div className="text-sm text-muted-foreground">Total Sections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{apiEndpoints.length}</div>
              <div className="text-sm text-muted-foreground">API Endpoints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">100%</div>
              <div className="text-sm text-muted-foreground">Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {documentation.filter(d => d.category === 'examples').length}
              </div>
              <div className="text-sm text-muted-foreground">Examples</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}