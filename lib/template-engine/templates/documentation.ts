import {
  TemplatePattern,
  ClientDeliverable,
  DocumentTemplateLibrary
} from './library'
import { TemplatePatternRegistry } from './pattern-registry'
import { TemplateCustomizationService, CustomizationPreset } from './customization'

export interface PatternDocumentation {
  pattern: TemplatePattern
  usage: {
    examples: DocumentationExample[]
    bestPractices: string[]
    commonMistakes: string[]
    tips: string[]
  }
  customization: {
    availableOptions: string[]
    presets: CustomizationPreset[]
    examples: CustomizationExample[]
  }
  integration: {
    apiUsage: string
    codeExamples: CodeExample[]
    workflows: WorkflowStep[]
  }
}

export interface DocumentationExample {
  title: string
  description: string
  useCase: string
  sampleData: any
  expectedOutput: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface CustomizationExample {
  title: string
  description: string
  options: any
  before: string
  after: string
}

export interface CodeExample {
  language: 'typescript' | 'javascript' | 'json'
  title: string
  description: string
  code: string
  explanation: string
}

export interface WorkflowStep {
  step: number
  title: string
  description: string
  code?: string
  notes?: string
}

export interface LibraryDocumentation {
  overview: string
  gettingStarted: string
  patterns: PatternDocumentation[]
  apiReference: ApiDocumentation
  tutorials: Tutorial[]
  faq: FAQItem[]
}

export interface ApiDocumentation {
  classes: ClassDocumentation[]
  interfaces: InterfaceDocumentation[]
  methods: MethodDocumentation[]
}

export interface ClassDocumentation {
  name: string
  description: string
  constructor: string
  methods: MethodDocumentation[]
  examples: CodeExample[]
}

export interface InterfaceDocumentation {
  name: string
  description: string
  properties: PropertyDocumentation[]
  examples: CodeExample[]
}

export interface MethodDocumentation {
  name: string
  description: string
  parameters: ParameterDocumentation[]
  returnType: string
  examples: CodeExample[]
}

export interface PropertyDocumentation {
  name: string
  type: string
  description: string
  required: boolean
  defaultValue?: any
}

export interface ParameterDocumentation {
  name: string
  type: string
  description: string
  required: boolean
  defaultValue?: any
}

export interface Tutorial {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  prerequisites: string[]
  steps: TutorialStep[]
  completionCriteria: string[]
}

export interface TutorialStep {
  step: number
  title: string
  content: string
  code?: string
  expectedResult?: string
  troubleshooting?: string[]
}

export interface FAQItem {
  question: string
  answer: string
  category: string
  tags: string[]
}

export class DocumentationGenerator {
  private library: DocumentTemplateLibrary
  private registry: TemplatePatternRegistry
  private customization: TemplateCustomizationService

  constructor() {
    this.library = new DocumentTemplateLibrary()
    this.registry = new TemplatePatternRegistry()
    this.customization = new TemplateCustomizationService()
  }

  // Pattern Documentation
  generatePatternDocumentation(patternId: string): PatternDocumentation {
    const pattern = this.library.getPattern(patternId)
    if (!pattern) {
      throw new Error(`Pattern not found: ${patternId}`)
    }

    return {
      pattern,
      usage: this.generateUsageDocumentation(pattern),
      customization: this.generateCustomizationDocumentation(pattern),
      integration: this.generateIntegrationDocumentation(pattern)
    }
  }

  generateAllPatternsDocumentation(): PatternDocumentation[] {
    return this.library.getAllPatterns().map(pattern =>
      this.generatePatternDocumentation(pattern.id)
    )
  }

  // Complete Library Documentation
  generateLibraryDocumentation(): LibraryDocumentation {
    return {
      overview: this.generateOverview(),
      gettingStarted: this.generateGettingStarted(),
      patterns: this.generateAllPatternsDocumentation(),
      apiReference: this.generateApiDocumentation(),
      tutorials: this.generateTutorials(),
      faq: this.generateFAQ()
    }
  }

  // Markdown Export
  exportPatternToMarkdown(patternId: string): string {
    const doc = this.generatePatternDocumentation(patternId)

    return `# ${doc.pattern.name}

## Overview

**Category:** ${doc.pattern.category}
**Complexity:** ${doc.pattern.complexity}
**Estimated Time:** ${doc.pattern.estimatedTime}

${doc.pattern.description}

## Use Cases

${doc.pattern.useCase}

## Variables

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${doc.pattern.variables.map(v =>
  `| ${v.name} | ${v.type} | ${v.required ? 'Yes' : 'No'} | ${v.defaultValue || '-'} | ${v.description || '-'} |`
).join('\n')}

## Sections

${doc.pattern.sections.map(s => `
### ${s.name}

${s.description}

**Required:** ${s.required ? 'Yes' : 'No'}
**Variables:** ${s.variables.join(', ')}

\`\`\`html
${s.content}
\`\`\`
`).join('\n')}

## Usage Examples

${doc.usage.examples.map(ex => `
### ${ex.title}

**Difficulty:** ${ex.difficulty}
**Use Case:** ${ex.useCase}

${ex.description}

**Sample Data:**
\`\`\`json
${JSON.stringify(ex.sampleData, null, 2)}
\`\`\`
`).join('\n')}

## Best Practices

${doc.usage.bestPractices.map(bp => `- ${bp}`).join('\n')}

## Common Mistakes

${doc.usage.commonMistakes.map(cm => `- ${cm}`).join('\n')}

## Tips

${doc.usage.tips.map(tip => `- ${tip}`).join('\n')}

## Customization

### Available Options

${doc.customization.availableOptions.map(opt => `- ${opt}`).join('\n')}

### Presets

${doc.customization.presets.map(preset => `
#### ${preset.name}

${preset.description}

**Category:** ${preset.category}
`).join('\n')}

## API Usage

\`\`\`typescript
${doc.integration.apiUsage}
\`\`\`

## Code Examples

${doc.integration.codeExamples.map(ex => `
### ${ex.title}

${ex.description}

\`\`\`${ex.language}
${ex.code}
\`\`\`

${ex.explanation}
`).join('\n')}

## Workflow

${doc.integration.workflows.map(w => `
${w.step}. **${w.title}**
   ${w.description}
   ${w.code ? `\n   \`\`\`typescript\n   ${w.code}\n   \`\`\`` : ''}
   ${w.notes ? `\n   *Note: ${w.notes}*` : ''}
`).join('\n')}
`
  }

  // HTML Export
  exportPatternToHTML(patternId: string): string {
    const doc = this.generatePatternDocumentation(patternId)

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${doc.pattern.name} - Pattern Documentation</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        .header {
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-right: 8px;
        }
        .badge.category { background-color: #dbeafe; color: #1e40af; }
        .badge.complexity { background-color: #fef3c7; color: #92400e; }
        .badge.time { background-color: #d1fae5; color: #065f46; }
        .section {
            margin: 30px 0;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .section h3 {
            color: #374151;
            margin-top: 25px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f9fafb;
            font-weight: 600;
        }
        pre {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 16px;
            overflow-x: auto;
        }
        code {
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
            font-size: 0.875rem;
        }
        .example {
            background-color: #fefefe;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }
        .example h4 {
            margin-top: 0;
            color: #059669;
        }
        .difficulty {
            font-size: 0.75rem;
            padding: 2px 6px;
            border-radius: 12px;
            font-weight: 500;
        }
        .difficulty.beginner { background-color: #d1fae5; color: #065f46; }
        .difficulty.intermediate { background-color: #fef3c7; color: #92400e; }
        .difficulty.advanced { background-color: #fee2e2; color: #991b1b; }
        ul, ol {
            padding-left: 20px;
        }
        li {
            margin: 8px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${doc.pattern.name}</h1>
        <div style="margin-top: 10px;">
            <span class="badge category">${doc.pattern.category}</span>
            <span class="badge complexity">${doc.pattern.complexity}</span>
            <span class="badge time">${doc.pattern.estimatedTime}</span>
        </div>
        <p style="margin-top: 15px; font-size: 1.125rem;">${doc.pattern.description}</p>
    </div>

    <div class="section">
        <h2>Use Cases</h2>
        <p>${doc.pattern.useCase}</p>
    </div>

    <div class="section">
        <h2>Variables</h2>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Default</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                ${doc.pattern.variables.map(v => `
                <tr>
                    <td><code>${v.name}</code></td>
                    <td>${v.type}</td>
                    <td>${v.required ? 'Yes' : 'No'}</td>
                    <td>${v.defaultValue || '-'}</td>
                    <td>${v.description || '-'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>Usage Examples</h2>
        ${doc.usage.examples.map(ex => `
        <div class="example">
            <h4>${ex.title} <span class="difficulty ${ex.difficulty}">${ex.difficulty}</span></h4>
            <p><strong>Use Case:</strong> ${ex.useCase}</p>
            <p>${ex.description}</p>
            <h5>Sample Data:</h5>
            <pre><code>${JSON.stringify(ex.sampleData, null, 2)}</code></pre>
        </div>
        `).join('')}
    </div>

    <div class="section">
        <h2>Best Practices</h2>
        <ul>
            ${doc.usage.bestPractices.map(bp => `<li>${bp}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>API Usage</h2>
        <pre><code>${doc.integration.apiUsage}</code></pre>
    </div>
</body>
</html>`
  }

  private generateUsageDocumentation(pattern: TemplatePattern): PatternDocumentation['usage'] {
    return {
      examples: this.generateExamples(pattern),
      bestPractices: this.generateBestPractices(pattern),
      commonMistakes: this.generateCommonMistakes(pattern),
      tips: this.generateTips(pattern)
    }
  }

  private generateCustomizationDocumentation(pattern: TemplatePattern): PatternDocumentation['customization'] {
    return {
      availableOptions: [
        'Colors (primary, secondary, accent)',
        'Typography (fonts, sizes)',
        'Spacing (sections, paragraphs)',
        'Layout (page size, orientation, margins)',
        'Content (header, footer, page numbers)',
        'Branding (logo, company name)'
      ],
      presets: this.customization.getAllPresets(),
      examples: this.generateCustomizationExamples(pattern)
    }
  }

  private generateIntegrationDocumentation(pattern: TemplatePattern): PatternDocumentation['integration'] {
    return {
      apiUsage: this.generateApiUsageExample(pattern),
      codeExamples: this.generateCodeExamples(pattern),
      workflows: this.generateWorkflows(pattern)
    }
  }

  private generateExamples(pattern: TemplatePattern): DocumentationExample[] {
    const examples: DocumentationExample[] = []

    // Basic example
    examples.push({
      title: 'Basic Usage',
      description: `Simple example of using the ${pattern.name} pattern with minimal data`,
      useCase: 'Quick document generation with default styling',
      sampleData: this.generateBasicSampleData(pattern),
      expectedOutput: 'A properly formatted document with all required sections',
      difficulty: 'beginner'
    })

    // Advanced example
    if (pattern.complexity === 'complex' || pattern.complexity === 'moderate') {
      examples.push({
        title: 'Advanced Customization',
        description: `Advanced usage with custom styling and all optional features`,
        useCase: 'Professional document with full customization',
        sampleData: this.generateAdvancedSampleData(pattern),
        expectedOutput: 'A fully customized document with branding and advanced features',
        difficulty: 'advanced'
      })
    }

    return examples
  }

  private generateBestPractices(pattern: TemplatePattern): string[] {
    const practices = [
      'Always validate input data before generating documents',
      'Use consistent naming conventions for variables',
      'Test with various data scenarios including edge cases',
      'Apply client branding consistently across all sections'
    ]

    if (pattern.category === 'business') {
      practices.push('Include clear call-to-action sections where appropriate')
      practices.push('Ensure all financial information is accurate and clearly presented')
    }

    if (pattern.category === 'legal') {
      practices.push('Have legal documents reviewed by qualified professionals')
      practices.push('Ensure all required legal clauses are included')
    }

    return practices
  }

  private generateCommonMistakes(pattern: TemplatePattern): string[] {
    return [
      'Missing required variables leading to incomplete documents',
      'Inconsistent formatting across sections',
      'Not testing with edge case data (empty arrays, long text)',
      'Forgetting to apply client branding before generation',
      'Not validating generated output before delivery'
    ]
  }

  private generateTips(pattern: TemplatePattern): string[] {
    const tips = [
      'Use preview mode to test changes before final generation',
      'Save frequently used customizations as presets',
      'Batch process multiple similar documents for efficiency'
    ]

    if (pattern.complexity === 'complex') {
      tips.push('Break down complex documents into smaller, manageable sections')
      tips.push('Use version control for document templates in production')
    }

    return tips
  }

  private generateCustomizationExamples(pattern: TemplatePattern): CustomizationExample[] {
    return [
      {
        title: 'Professional Theme',
        description: 'Apply professional styling with blue color scheme',
        options: {
          colors: { primary: '#2563eb', secondary: '#64748b' },
          typography: { fontSize: 'medium' }
        },
        before: 'Default template styling',
        after: 'Professional blue theme with clean typography'
      },
      {
        title: 'Compact Layout',
        description: 'Reduce spacing for more content per page',
        options: {
          spacing: { compact: true, sectionSpacing: 'tight' },
          layout: { margins: 'narrow' }
        },
        before: 'Standard spacing and margins',
        after: 'Compact layout with reduced whitespace'
      }
    ]
  }

  private generateApiUsageExample(pattern: TemplatePattern): string {
    return `import { TemplatePatternRegistry } from '@/lib/template-engine'

const registry = new TemplatePatternRegistry()

// Generate template from pattern
const template = registry.generateTemplateFromPattern('${pattern.id}', {
  ${pattern.variables.slice(0, 3).map(v =>
    `${v.name}: ${JSON.stringify(v.defaultValue || 'sample value')}`
  ).join(',\n  ')}
})

// Customize template
const customized = registry.customizeTemplate(template, {
  colors: { primary: '#2563eb' },
  typography: { fontSize: 'medium' }
})

// Export to PDF
const result = await registry.exportDocument(customized, 'pdf')`
  }

  private generateCodeExamples(pattern: TemplatePattern): CodeExample[] {
    return [
      {
        language: 'typescript',
        title: 'Basic Template Generation',
        description: 'Create a template from pattern with sample data',
        code: this.generateApiUsageExample(pattern),
        explanation: 'This example shows the basic workflow for generating a document from a pattern'
      },
      {
        language: 'json',
        title: 'Sample Data Structure',
        description: 'Example of properly structured input data',
        code: JSON.stringify(this.generateBasicSampleData(pattern), null, 2),
        explanation: 'Ensure your data matches the expected variable types and structure'
      }
    ]
  }

  private generateWorkflows(pattern: TemplatePattern): WorkflowStep[] {
    return [
      {
        step: 1,
        title: 'Initialize Registry',
        description: 'Create a new template pattern registry instance',
        code: 'const registry = new TemplatePatternRegistry()',
        notes: 'This provides access to all pattern management functionality'
      },
      {
        step: 2,
        title: 'Prepare Data',
        description: 'Gather and validate all required data for the template',
        code: `const data = {\n  ${pattern.variables.slice(0, 2).map(v => `${v.name}: '...'`).join(',\n  ')}\n}`,
        notes: 'Ensure all required variables are provided'
      },
      {
        step: 3,
        title: 'Generate Template',
        description: 'Create the template from the pattern with your data',
        code: `const template = registry.generateTemplateFromPattern('${pattern.id}', data)`,
        notes: 'The template is now ready for customization or export'
      },
      {
        step: 4,
        title: 'Export Document',
        description: 'Export the template to your desired format',
        code: `const result = await registry.exportDocument(template, 'pdf')`,
        notes: 'Supports PDF, HTML, and other formats'
      }
    ]
  }

  private generateOverview(): string {
    return `# Template Engine Documentation

The Template Engine provides a comprehensive system for creating, customizing, and generating professional documents from reusable patterns. It supports multiple output formats, client branding, and extensive customization options.

## Key Features

- **Pattern Library**: Pre-built templates for common document types
- **Customization System**: Flexible styling and content customization
- **Multi-format Export**: PDF, HTML, and other format support
- **Client Branding**: Integrated branding and theming system
- **Version Control**: Template versioning and rollback capabilities

## Supported Document Types

- Business proposals and contracts
- Meeting minutes and reports
- Legal agreements and forms
- Marketing materials and case studies
- Technical documentation
- Educational content and courses`
  }

  private generateGettingStarted(): string {
    return `# Getting Started

## Installation

\`\`\`bash
npm install @your-org/template-engine
\`\`\`

## Quick Start

\`\`\`typescript
import { TemplatePatternRegistry } from '@your-org/template-engine'

// Initialize
const registry = new TemplatePatternRegistry()

// Get available patterns
const patterns = registry.searchPatterns('business')

// Create template
const template = registry.generateTemplateFromPattern('business-proposal', {
  client_name: 'Acme Corp',
  project_title: 'Website Redesign',
  total_cost: 25000
})

// Export to PDF
const pdf = await registry.exportDocument(template, 'pdf')
\`\`\`

## Next Steps

1. Explore available patterns in the Pattern Library
2. Learn about customization options
3. Set up client branding
4. Integrate with your application`
  }

  private generateApiDocumentation(): ApiDocumentation {
    return {
      classes: [
        {
          name: 'TemplatePatternRegistry',
          description: 'Main class for pattern management and template generation',
          constructor: 'new TemplatePatternRegistry()',
          methods: [
            {
              name: 'searchPatterns',
              description: 'Search for patterns by query and filters',
              parameters: [
                { name: 'query', type: 'string', description: 'Search query', required: true },
                { name: 'filters', type: 'PatternSearchFilter', description: 'Optional filters', required: false }
              ],
              returnType: 'TemplatePattern[]',
              examples: [{
                language: 'typescript',
                title: 'Search patterns',
                description: 'Find business-related patterns',
                code: "registry.searchPatterns('business', { category: 'business' })",
                explanation: 'Returns all patterns matching the query and filters'
              }]
            }
          ],
          examples: []
        }
      ],
      interfaces: [],
      methods: []
    }
  }

  private generateTutorials(): Tutorial[] {
    return [
      {
        id: 'first-document',
        title: 'Creating Your First Document',
        description: 'Learn how to create and customize your first document template',
        difficulty: 'beginner',
        estimatedTime: '15 minutes',
        prerequisites: ['Basic TypeScript knowledge'],
        steps: [
          {
            step: 1,
            title: 'Setup',
            content: 'Install and import the template engine',
            code: "import { TemplatePatternRegistry } from '@your-org/template-engine'",
            expectedResult: 'Template engine is ready to use'
          }
        ],
        completionCriteria: ['Successfully generated a PDF document', 'Applied basic customization']
      }
    ]
  }

  private generateFAQ(): FAQItem[] {
    return [
      {
        question: 'How do I add custom variables to a pattern?',
        answer: 'You can customize variables when generating a template using the customization options parameter.',
        category: 'customization',
        tags: ['variables', 'customization']
      },
      {
        question: 'What formats are supported for export?',
        answer: 'The template engine supports PDF, HTML, and DOCX export formats.',
        category: 'export',
        tags: ['export', 'formats']
      }
    ]
  }

  private generateBasicSampleData(pattern: TemplatePattern): any {
    const data: any = {}
    pattern.variables.forEach(variable => {
      switch (variable.type) {
        case 'text':
          data[variable.name] = variable.defaultValue || 'Sample text'
          break
        case 'number':
          data[variable.name] = variable.defaultValue || 100
          break
        case 'date':
          data[variable.name] = variable.defaultValue || '2024-01-01'
          break
        case 'array':
          data[variable.name] = variable.defaultValue || ['Item 1', 'Item 2']
          break
        default:
          data[variable.name] = variable.defaultValue || 'Sample value'
      }
    })
    return data
  }

  private generateAdvancedSampleData(pattern: TemplatePattern): any {
    const basicData = this.generateBasicSampleData(pattern)

    // Add more complex data for advanced example
    Object.keys(basicData).forEach(key => {
      if (Array.isArray(basicData[key])) {
        basicData[key] = [
          ...basicData[key],
          'Additional item 1',
          'Additional item 2'
        ]
      }
    })

    return basicData
  }
}