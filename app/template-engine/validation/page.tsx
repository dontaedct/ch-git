'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, AlertTriangle, Info, Play, RefreshCw, FileText, Component, Layers } from 'lucide-react'

interface ComponentValidation {
  id: string
  name: string
  type: 'form' | 'layout' | 'content' | 'navigation'
  status: 'valid' | 'invalid' | 'warning' | 'checking'
  issues: ValidationIssue[]
  props: Record<string, any>
  children?: ComponentValidation[]
}

interface ValidationIssue {
  id: string
  type: 'error' | 'warning' | 'info'
  message: string
  severity: 'critical' | 'moderate' | 'low'
  suggestion?: string
}

interface TemplateValidation {
  id: string
  name: string
  version: string
  status: 'valid' | 'invalid' | 'partial'
  components: ComponentValidation[]
  overallScore: number
  issues: ValidationIssue[]
}

export default function ComponentValidationPage() {
  const [templates, setTemplates] = useState<TemplateValidation[]>([
    {
      id: 'consultation-mvp',
      name: 'Consultation MVP Template',
      version: '1.0.0',
      status: 'valid',
      overallScore: 94,
      issues: [
        {
          id: 'perf-1',
          type: 'warning',
          message: 'Form component could benefit from memoization for large datasets',
          severity: 'low',
          suggestion: 'Consider using React.memo() for form components with complex validation'
        }
      ],
      components: [
        {
          id: 'landing-header',
          name: 'Landing Page Header',
          type: 'layout',
          status: 'valid',
          issues: [],
          props: { title: 'string', subtitle: 'string', backgroundImage: 'string' }
        },
        {
          id: 'contact-form',
          name: 'Contact Form',
          type: 'form',
          status: 'valid',
          issues: [],
          props: { fields: 'array', validation: 'object', onSubmit: 'function' }
        },
        {
          id: 'questionnaire-flow',
          name: 'Questionnaire Flow',
          type: 'form',
          status: 'warning',
          issues: [
            {
              id: 'form-warn-1',
              type: 'warning',
              message: 'Missing accessibility labels for screen readers',
              severity: 'moderate',
              suggestion: 'Add aria-label attributes to form inputs'
            }
          ],
          props: { questions: 'array', progress: 'number', onAnswer: 'function' }
        },
        {
          id: 'pdf-preview',
          name: 'PDF Preview Component',
          type: 'content',
          status: 'valid',
          issues: [],
          props: { documentData: 'object', template: 'string' }
        }
      ]
    },
    {
      id: 'ecommerce-basic',
      name: 'E-commerce Basic Template',
      version: '0.8.0',
      status: 'partial',
      overallScore: 78,
      issues: [
        {
          id: 'sec-1',
          type: 'error',
          message: 'Payment component missing security validation',
          severity: 'critical',
          suggestion: 'Implement PCI DSS compliant payment validation'
        },
        {
          id: 'perf-2',
          type: 'warning',
          message: 'Product list component not optimized for large catalogs',
          severity: 'moderate',
          suggestion: 'Implement virtualization for product lists with 100+ items'
        }
      ],
      components: [
        {
          id: 'product-grid',
          name: 'Product Grid',
          type: 'content',
          status: 'warning',
          issues: [
            {
              id: 'grid-perf-1',
              type: 'warning',
              message: 'Not optimized for large datasets',
              severity: 'moderate',
              suggestion: 'Consider implementing virtual scrolling'
            }
          ],
          props: { products: 'array', columns: 'number', pagination: 'object' }
        },
        {
          id: 'payment-form',
          name: 'Payment Form',
          type: 'form',
          status: 'invalid',
          issues: [
            {
              id: 'payment-sec-1',
              type: 'error',
              message: 'Missing PCI DSS validation',
              severity: 'critical',
              suggestion: 'Implement secure payment processing'
            }
          ],
          props: { paymentMethod: 'string', amount: 'number', currency: 'string' }
        }
      ]
    }
  ])

  const [isValidating, setIsValidating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('consultation-mvp')

  const validateTemplate = async (templateId: string) => {
    setIsValidating(true)

    // Simulate validation process
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? {
            ...template,
            components: template.components.map(comp => ({ ...comp, status: 'checking' as const }))
          }
        : template
    ))

    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update with validation results
    setTemplates(prev => prev.map(template =>
      template.id === templateId
        ? {
            ...template,
            components: template.components.map(comp => ({
              ...comp,
              status: comp.issues.some(issue => issue.type === 'error') ? 'invalid' as const :
                     comp.issues.some(issue => issue.type === 'warning') ? 'warning' as const :
                     'valid' as const
            }))
          }
        : template
    ))

    setIsValidating(false)
  }

  const validateAllTemplates = async () => {
    setIsValidating(true)

    for (const template of templates) {
      await validateTemplate(template.id)
    }

    setIsValidating(false)
  }

  const getStatusIcon = (status: ComponentValidation['status']) => {
    switch (status) {
      case 'valid': return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'invalid': return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'checking': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
    }
  }

  const getStatusBadge = (status: ComponentValidation['status']) => {
    const variants = {
      valid: 'default',
      invalid: 'destructive',
      warning: 'secondary',
      checking: 'outline'
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const getIssueIcon = (type: ValidationIssue['type']) => {
    switch (type) {
      case 'error': return <XCircle className="h-3 w-3 text-red-600" />
      case 'warning': return <AlertTriangle className="h-3 w-3 text-yellow-600" />
      case 'info': return <Info className="h-3 w-3 text-blue-600" />
    }
  }

  const getComponentTypeIcon = (type: ComponentValidation['type']) => {
    switch (type) {
      case 'form': return <FileText className="h-4 w-4" />
      case 'layout': return <Layers className="h-4 w-4" />
      case 'content': return <Component className="h-4 w-4" />
      case 'navigation': return <Component className="h-4 w-4" />
    }
  }

  const currentTemplate = templates.find(t => t.id === selectedTemplate)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Component Validation</h1>
          <p className="text-muted-foreground">
            Validate template components for security, performance, and accessibility compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={validateAllTemplates}
            disabled={isValidating}
            className="flex items-center gap-2"
          >
            {isValidating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isValidating ? 'Validating...' : 'Validate All'}
          </Button>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Template Overview</CardTitle>
          <CardDescription>
            Select a template to view detailed component validation results
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  {getStatusBadge(template.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">v{template.version}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{template.overallScore}%</span>
                    <div className="text-sm text-muted-foreground">
                      {template.components.filter(c => c.status === 'valid').length}/{template.components.length} valid
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Component Validation */}
      {currentTemplate && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(currentTemplate.status)}
                  {currentTemplate.name} Validation
                </CardTitle>
                <CardDescription>
                  Detailed component validation results and recommendations
                </CardDescription>
              </div>
              <Button
                onClick={() => validateTemplate(currentTemplate.id)}
                disabled={isValidating}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-validate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Issues */}
            {currentTemplate.issues.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Template-level Issues</h4>
                <div className="space-y-2">
                  {currentTemplate.issues.map((issue) => (
                    <div key={issue.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1">
                        <div className="font-medium">{issue.message}</div>
                        {issue.suggestion && (
                          <div className="text-sm text-muted-foreground mt-1">
                            💡 {issue.suggestion}
                          </div>
                        )}
                      </div>
                      <Badge variant={issue.type === 'error' ? 'destructive' : 'secondary'}>
                        {issue.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Component Validation Results */}
            <div>
              <h4 className="font-semibold mb-4">Component Validation Results</h4>
              <div className="space-y-4">
                {currentTemplate.components.map((component) => (
                  <Card key={component.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getComponentTypeIcon(component.type)}
                          <div>
                            <CardTitle className="text-base">{component.name}</CardTitle>
                            <CardDescription className="text-sm">
                              {component.type} component
                            </CardDescription>
                          </div>
                        </div>
                        {getStatusBadge(component.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Component Props */}
                      <div className="mb-4">
                        <Label className="text-sm font-medium">Props Schema:</Label>
                        <div className="mt-1 p-2 bg-muted rounded text-sm font-mono">
                          {Object.entries(component.props).map(([key, type]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span className="text-muted-foreground">{type}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Component Issues */}
                      {component.issues.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Issues:</Label>
                          <div className="mt-2 space-y-2">
                            {component.issues.map((issue) => (
                              <div key={issue.id} className="flex items-start gap-2 p-2 border rounded text-sm">
                                {getIssueIcon(issue.type)}
                                <div className="flex-1">
                                  <div>{issue.message}</div>
                                  {issue.suggestion && (
                                    <div className="text-muted-foreground mt-1">
                                      💡 {issue.suggestion}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {component.issues.length === 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          No validation issues found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Summary</CardTitle>
          <CardDescription>
            Overall validation statistics and compliance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {templates.reduce((acc, t) => acc + t.components.filter(c => c.status === 'valid').length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Valid Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {templates.reduce((acc, t) => acc + t.components.filter(c => c.status === 'warning').length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {templates.reduce((acc, t) => acc + t.components.filter(c => c.status === 'invalid').length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Invalid Components</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(templates.reduce((acc, t) => acc + t.overallScore, 0) / templates.length)}%
              </div>
              <div className="text-sm text-muted-foreground">Avg. Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}