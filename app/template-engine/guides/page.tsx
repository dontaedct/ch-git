'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { BookOpen, PlayCircle, CheckCircle, Clock, Code, FileText, Lightbulb, ArrowRight, Copy } from 'lucide-react'

interface GuideStep {
  id: string
  title: string
  description: string
  content: string
  codeExample?: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  completed: boolean
}

interface CreationGuide {
  id: string
  title: string
  description: string
  category: 'getting-started' | 'advanced' | 'best-practices' | 'troubleshooting'
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: GuideStep[]
  prerequisites: string[]
  outcomes: string[]
}

export default function TemplateGuidesPage() {
  const [selectedGuide, setSelectedGuide] = useState<string>('quick-start')
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())

  const [guides] = useState<CreationGuide[]>([
    {
      id: 'quick-start',
      title: 'Quick Start: Create Your First Template',
      description: 'Learn the basics of creating a template from scratch in under 30 minutes',
      category: 'getting-started',
      estimatedTime: '30 minutes',
      difficulty: 'beginner',
      prerequisites: ['Basic React knowledge', 'Understanding of JSON'],
      outcomes: ['Create a functional template', 'Understand template structure', 'Deploy to staging'],
      steps: [
        {
          id: 'setup-workspace',
          title: 'Set Up Your Workspace',
          description: 'Initialize your template development environment',
          duration: '5 min',
          difficulty: 'beginner',
          completed: false,
          content: `Navigate to the Template Engine dashboard and create a new template project. This will set up the basic structure and configuration files needed for template development.

Key components you'll be working with:
• Template configuration (JSON)
• Component definitions
• Page layouts
• Theme settings`,
          codeExample: `{
  "templateId": "my-first-template",
  "name": "My First Template",
  "version": "1.0.0",
  "description": "A simple template to get started",
  "type": "basic"
}`
        },
        {
          id: 'define-structure',
          title: 'Define Template Structure',
          description: 'Create the basic page structure and navigation',
          duration: '10 min',
          difficulty: 'beginner',
          completed: false,
          content: `Define the pages that will be generated in your template. Start with a simple structure containing a landing page and a contact page.

Each page needs:
• Unique page ID
• URL path
• Page title
• Layout type
• Component list`,
          codeExample: `{
  "pages": [
    {
      "id": "home",
      "path": "/",
      "title": "Welcome",
      "layout": "default",
      "components": ["hero", "features", "contact"]
    },
    {
      "id": "about",
      "path": "/about",
      "title": "About Us",
      "layout": "default",
      "components": ["about-hero", "team", "values"]
    }
  ]
}`
        },
        {
          id: 'configure-components',
          title: 'Configure Components',
          description: 'Set up the components that will be used in your template',
          duration: '10 min',
          difficulty: 'beginner',
          completed: false,
          content: `Define the components that make up your template pages. Each component should have clear properties and customization options.

Component configuration includes:
• Component type and props
• Styling options
• Content placeholders
• Conditional rendering rules`,
          codeExample: `{
  "components": {
    "hero": {
      "type": "HeroSection",
      "props": {
        "title": "{{title}}",
        "subtitle": "{{subtitle}}",
        "backgroundImage": "{{heroImage}}",
        "ctaText": "Get Started"
      }
    },
    "contact": {
      "type": "ContactForm",
      "props": {
        "fields": ["name", "email", "message"],
        "submitEndpoint": "/api/contact"
      }
    }
  }
}`
        },
        {
          id: 'test-validate',
          title: 'Test and Validate',
          description: 'Run validation tests to ensure your template works correctly',
          duration: '5 min',
          difficulty: 'beginner',
          completed: false,
          content: `Use the template validation tools to check for errors and ensure your template will compile correctly.

Validation checks:
• JSON syntax validation
• Component reference validation
• Route conflict detection
• Performance impact assessment`,
          codeExample: `// Run validation command
npm run template:validate my-first-template

// Expected output
✓ Template configuration valid
✓ All components resolved
✓ No route conflicts detected
✓ Performance targets met`
        }
      ]
    },
    {
      id: 'consultation-template',
      title: 'Building a Consultation Workflow Template',
      description: 'Create a complete consultation template with questionnaire and PDF generation',
      category: 'advanced',
      estimatedTime: '2 hours',
      difficulty: 'intermediate',
      prerequisites: ['Completed Quick Start guide', 'Form handling experience', 'PDF generation knowledge'],
      outcomes: ['Complete consultation workflow', 'Dynamic questionnaire system', 'PDF generation capability'],
      steps: [
        {
          id: 'consultation-structure',
          title: 'Design Consultation Flow',
          description: 'Plan the user journey from landing to PDF delivery',
          duration: '20 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Design a multi-step consultation workflow that guides users through a professional assessment process.

Flow structure:
1. Landing page with value proposition
2. Contact information collection
3. Dynamic questionnaire based on user type
4. Results processing and analysis
5. PDF report generation and delivery`,
          codeExample: `{
  "workflow": {
    "steps": [
      {
        "id": "landing",
        "type": "page",
        "path": "/",
        "next": "contact"
      },
      {
        "id": "contact",
        "type": "form",
        "path": "/contact",
        "next": "questionnaire"
      },
      {
        "id": "questionnaire",
        "type": "dynamic-form",
        "path": "/questionnaire",
        "next": "results"
      },
      {
        "id": "results",
        "type": "page",
        "path": "/results",
        "actions": ["generate-pdf", "schedule-call"]
      }
    ]
  }
}`
        },
        {
          id: 'dynamic-questionnaire',
          title: 'Implement Dynamic Questionnaire',
          description: 'Create a questionnaire that adapts based on user responses',
          duration: '45 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Build a questionnaire system that presents different questions based on previous answers, creating a personalized assessment experience.

Key features:
• Conditional question logic
• Progress tracking
• Answer validation
• Response scoring`,
          codeExample: `{
  "questionnaire": {
    "questions": [
      {
        "id": "business-type",
        "type": "radio",
        "text": "What type of business do you operate?",
        "options": ["startup", "smb", "enterprise"],
        "required": true,
        "conditions": []
      },
      {
        "id": "team-size",
        "type": "number",
        "text": "How many employees do you have?",
        "required": true,
        "conditions": [
          {
            "if": "business-type",
            "equals": "startup",
            "then": "show"
          }
        ]
      }
    ]
  }
}`
        },
        {
          id: 'pdf-generation',
          title: 'Set Up PDF Generation',
          description: 'Configure automated PDF report generation based on responses',
          duration: '30 min',
          difficulty: 'advanced',
          completed: false,
          content: `Implement PDF generation that creates personalized consultation reports based on questionnaire responses.

PDF components:
• Dynamic content based on answers
• Professional formatting
• Branding and styling
• Charts and visualizations`,
          codeExample: `{
  "pdfTemplate": {
    "template": "consultation-report",
    "sections": [
      {
        "type": "cover",
        "content": {
          "title": "{{clientName}} Consultation Report",
          "date": "{{currentDate}}",
          "logo": "{{companyLogo}}"
        }
      },
      {
        "type": "summary",
        "content": {
          "businessType": "{{answers.businessType}}",
          "teamSize": "{{answers.teamSize}}",
          "recommendations": "{{generatedRecommendations}}"
        }
      }
    ]
  }
}`
        },
        {
          id: 'consultation-testing',
          title: 'Test Complete Workflow',
          description: 'Validate the entire consultation process end-to-end',
          duration: '25 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Test the complete consultation workflow to ensure all components work together seamlessly.

Testing checklist:
• Landing page loads correctly
• Contact form submits properly
• Questionnaire logic functions
• PDF generates successfully
• Email delivery works`,
          codeExample: `// Test workflow command
npm run template:test consultation-workflow

// Test scenarios
✓ Happy path: Complete consultation
✓ Edge case: Partial completion
✓ Error handling: Invalid responses
✓ Performance: Large questionnaires`
        }
      ]
    },
    {
      id: 'performance-optimization',
      title: 'Template Performance Optimization',
      description: 'Optimize your templates for speed and efficiency',
      category: 'best-practices',
      estimatedTime: '1 hour',
      difficulty: 'advanced',
      prerequisites: ['Understanding of React performance', 'Webpack knowledge', 'Build optimization experience'],
      outcomes: ['Optimized template performance', 'Reduced bundle size', 'Faster load times'],
      steps: [
        {
          id: 'analyze-performance',
          title: 'Analyze Current Performance',
          description: 'Identify performance bottlenecks in your template',
          duration: '15 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Use the built-in performance analysis tools to identify areas for optimization in your template.

Analysis areas:
• Bundle size analysis
• Render performance
• Network requests
• Memory usage`,
          codeExample: `// Run performance analysis
npm run template:analyze my-template

// Sample output
Bundle Size: 2.8MB (Target: <5MB) ✓
First Paint: 1.2s (Target: <2s) ✓
Time to Interactive: 3.1s (Target: <4s) ✓
Memory Usage: 145MB (Target: <200MB) ✓`
        },
        {
          id: 'optimize-components',
          title: 'Optimize Components',
          description: 'Apply performance optimizations to template components',
          duration: '25 min',
          difficulty: 'advanced',
          completed: false,
          content: `Optimize individual components for better performance using React best practices and template engine features.

Optimization techniques:
• Lazy loading for non-critical components
• Memoization for expensive calculations
• Virtual scrolling for large lists
• Image optimization`,
          codeExample: `{
  "optimizations": {
    "lazyLoading": {
      "components": ["gallery", "testimonials", "blog-feed"],
      "threshold": "50px"
    },
    "memoization": {
      "enabled": true,
      "components": ["complex-charts", "data-tables"]
    },
    "imageOptimization": {
      "enabled": true,
      "formats": ["webp", "jpg"],
      "quality": 80
    }
  }
}`
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Common Issues and Troubleshooting',
      description: 'Solve common problems when creating and deploying templates',
      category: 'troubleshooting',
      estimatedTime: '45 minutes',
      difficulty: 'beginner',
      prerequisites: ['Basic template creation experience'],
      outcomes: ['Resolve common issues', 'Debug template problems', 'Prevent future issues'],
      steps: [
        {
          id: 'compilation-errors',
          title: 'Fixing Compilation Errors',
          description: 'Resolve common template compilation issues',
          duration: '15 min',
          difficulty: 'beginner',
          completed: false,
          content: `Learn to identify and fix common compilation errors that occur during template processing.

Common errors:
• Invalid JSON syntax
• Missing component references
• Circular dependencies
• Type mismatches`,
          codeExample: `// Common error: Invalid JSON
{
  "templateId": "my-template",
  "name": "My Template",
  "components": {
    "hero": {
      "type": "HeroSection",
      "props": {
        "title": "Welcome", // ❌ Trailing comma
      }
    }
  }
}

// Fixed version:
{
  "templateId": "my-template",
  "name": "My Template",
  "components": {
    "hero": {
      "type": "HeroSection",
      "props": {
        "title": "Welcome" // ✅ No trailing comma
      }
    }
  }
}`
        },
        {
          id: 'deployment-issues',
          title: 'Resolving Deployment Problems',
          description: 'Fix issues that prevent successful template deployment',
          duration: '20 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Troubleshoot deployment failures and ensure successful template generation.

Deployment issues:
• Build failures
• Asset loading problems
• Environment configuration
• Performance bottlenecks`,
          codeExample: `// Check deployment status
npm run template:deploy-status my-template

// Common fix: Environment variables
{
  "deployment": {
    "environment": "staging",
    "variables": {
      "API_URL": "https://api.staging.example.com",
      "CDN_URL": "https://cdn.staging.example.com"
    }
  }
}`
        },
        {
          id: 'performance-debugging',
          title: 'Debugging Performance Issues',
          description: 'Identify and resolve template performance problems',
          duration: '10 min',
          difficulty: 'intermediate',
          completed: false,
          content: `Use debugging tools to identify and fix performance issues in your templates.

Performance debugging:
• Slow component rendering
• Large bundle sizes
• Memory leaks
• Network bottlenecks`,
          codeExample: `// Enable performance debugging
{
  "debugging": {
    "performance": true,
    "verbose": true,
    "profiling": {
      "components": true,
      "rendering": true,
      "memory": true
    }
  }
}`
        }
      ]
    }
  ])

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId)
    } else {
      newCompleted.add(stepId)
    }
    setCompletedSteps(newCompleted)
  }

  const copyCodeExample = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const getDifficultyBadge = (difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    const variants = {
      beginner: 'secondary',
      intermediate: 'outline',
      advanced: 'destructive'
    } as const

    return <Badge variant={variants[difficulty]}>{difficulty.toUpperCase()}</Badge>
  }

  const getCategoryIcon = (category: CreationGuide['category']) => {
    switch (category) {
      case 'getting-started': return <PlayCircle className="h-4 w-4" />
      case 'advanced': return <Code className="h-4 w-4" />
      case 'best-practices': return <Lightbulb className="h-4 w-4" />
      case 'troubleshooting': return <FileText className="h-4 w-4" />
    }
  }

  const currentGuide = guides.find(g => g.id === selectedGuide)
  const completedStepsCount = currentGuide?.steps.filter(step => completedSteps.has(step.id)).length || 0
  const totalSteps = currentGuide?.steps.length || 0
  const progress = totalSteps > 0 ? (completedStepsCount / totalSteps) * 100 : 0

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Creation Guides</h1>
          <p className="text-muted-foreground">
            Step-by-step guides to help you create, optimize, and deploy templates
          </p>
        </div>
      </div>

      {/* Guides Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {guides.map((guide) => (
          <Card
            key={guide.id}
            className={`cursor-pointer transition-colors ${
              selectedGuide === guide.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
            onClick={() => setSelectedGuide(guide.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                {getCategoryIcon(guide.category)}
                {getDifficultyBadge(guide.difficulty)}
              </div>
              <CardTitle className="text-base">{guide.title}</CardTitle>
              <CardDescription className="text-sm">{guide.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{guide.estimatedTime}</span>
                <span>{guide.steps.length} steps</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Guide Details */}
      {currentGuide && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(currentGuide.category)}
                  {currentGuide.title}
                </CardTitle>
                <CardDescription>{currentGuide.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getDifficultyBadge(currentGuide.difficulty)}
                <Badge variant="outline">{currentGuide.estimatedTime}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{completedStepsCount}/{totalSteps} steps completed</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentGuide.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Learning Outcomes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentGuide.outcomes.map((outcome, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" />
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Guide Steps */}
      {currentGuide && (
        <div className="space-y-6">
          {currentGuide.steps.map((step, index) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <CardDescription>{step.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{step.duration}</Badge>
                    {getDifficultyBadge(step.difficulty)}
                    <Button
                      onClick={() => toggleStepCompletion(step.id)}
                      variant={completedSteps.has(step.id) ? 'default' : 'outline'}
                      size="sm"
                    >
                      {completedSteps.has(step.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Clock className="h-4 w-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{step.content}</div>
                </div>

                {step.codeExample && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Code Example</h4>
                      <Button
                        onClick={() => copyCodeExample(step.codeExample!)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                      {step.codeExample}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle>Guide Completion Status</CardTitle>
          <CardDescription>
            Track your progress across all available guides
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{guides.length}</div>
              <div className="text-sm text-muted-foreground">Available Guides</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {guides.reduce((acc, guide) => acc + guide.steps.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{completedSteps.size}</div>
              <div className="text-sm text-muted-foreground">Completed Steps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((completedSteps.size / guides.reduce((acc, guide) => acc + guide.steps.length, 0)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}