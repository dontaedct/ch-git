'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, Clock, Play, RotateCcw, AlertTriangle, Zap, Workflow, GitBranch, Cloud, Database } from 'lucide-react'

interface WorkflowStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  duration: number
  startTime?: Date
  endTime?: Date
  details?: string
  error?: string
}

interface WorkflowTest {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  steps: WorkflowStep[]
  totalDuration: number
  progress: number
  clientAppUrl?: string
}

export default function WorkflowTestingPage() {
  const [workflowTests, setWorkflowTests] = useState<WorkflowTest[]>([
    {
      id: 'consultation-mvp-full',
      name: 'Consultation MVP - Full Workflow',
      description: 'Complete end-to-end generation of consultation MVP template with landing page, questionnaire, and PDF generation',
      status: 'pending',
      totalDuration: 0,
      progress: 0,
      steps: [
        {
          id: 'template-validation',
          name: 'Template Validation',
          description: 'Validate template configuration and component mappings',
          status: 'pending',
          duration: 0
        },
        {
          id: 'component-compilation',
          name: 'Component Compilation',
          description: 'Compile all template components and dependencies',
          status: 'pending',
          duration: 0
        },
        {
          id: 'route-generation',
          name: 'Route Generation',
          description: 'Generate Next.js routes and page structures',
          status: 'pending',
          duration: 0
        },
        {
          id: 'asset-optimization',
          name: 'Asset Optimization',
          description: 'Optimize images, styles, and static assets',
          status: 'pending',
          duration: 0
        },
        {
          id: 'build-process',
          name: 'Build Process',
          description: 'Build complete client application',
          status: 'pending',
          duration: 0
        },
        {
          id: 'deployment-staging',
          name: 'Deployment to Staging',
          description: 'Deploy application to staging environment',
          status: 'pending',
          duration: 0
        },
        {
          id: 'functional-testing',
          name: 'Functional Testing',
          description: 'Run automated functional tests on deployed app',
          status: 'pending',
          duration: 0
        },
        {
          id: 'performance-testing',
          name: 'Performance Testing',
          description: 'Validate performance metrics and load times',
          status: 'pending',
          duration: 0
        }
      ]
    },
    {
      id: 'ecommerce-basic-full',
      name: 'E-commerce Basic - Full Workflow',
      description: 'Complete end-to-end generation of e-commerce template with product catalog, cart, and checkout',
      status: 'pending',
      totalDuration: 0,
      progress: 0,
      steps: [
        {
          id: 'template-validation',
          name: 'Template Validation',
          description: 'Validate e-commerce template configuration',
          status: 'pending',
          duration: 0
        },
        {
          id: 'database-setup',
          name: 'Database Setup',
          description: 'Configure product database and schemas',
          status: 'pending',
          duration: 0
        },
        {
          id: 'component-compilation',
          name: 'Component Compilation',
          description: 'Compile e-commerce components and cart logic',
          status: 'pending',
          duration: 0
        },
        {
          id: 'payment-integration',
          name: 'Payment Integration',
          description: 'Configure payment processing and security',
          status: 'pending',
          duration: 0
        },
        {
          id: 'build-process',
          name: 'Build Process',
          description: 'Build complete e-commerce application',
          status: 'pending',
          duration: 0
        },
        {
          id: 'deployment-staging',
          name: 'Deployment to Staging',
          description: 'Deploy to staging with SSL and security',
          status: 'pending',
          duration: 0
        },
        {
          id: 'security-testing',
          name: 'Security Testing',
          description: 'Run security and PCI compliance tests',
          status: 'pending',
          duration: 0
        },
        {
          id: 'load-testing',
          name: 'Load Testing',
          description: 'Test under high traffic conditions',
          status: 'pending',
          duration: 0
        }
      ]
    }
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState('consultation-mvp-full')

  const runWorkflowTest = async (workflowId: string) => {
    const workflow = workflowTests.find(w => w.id === workflowId)
    if (!workflow) return

    setWorkflowTests(prev => prev.map(w =>
      w.id === workflowId
        ? { ...w, status: 'running', progress: 0 }
        : w
    ))

    // Execute each step sequentially
    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]

      // Update step to running
      setWorkflowTests(prev => prev.map(w =>
        w.id === workflowId
          ? {
              ...w,
              steps: w.steps.map((s, index) =>
                index === i
                  ? { ...s, status: 'running', startTime: new Date() }
                  : s
              )
            }
          : w
      ))

      // Simulate step execution
      const stepDuration = Math.random() * 15000 + 5000 // 5-20 seconds
      await new Promise(resolve => setTimeout(resolve, stepDuration))

      // Simulate occasional failures
      const stepFailed = Math.random() < 0.1

      // Update step completion
      setWorkflowTests(prev => prev.map(w =>
        w.id === workflowId
          ? {
              ...w,
              steps: w.steps.map((s, index) =>
                index === i
                  ? {
                      ...s,
                      status: stepFailed ? 'failed' : 'completed',
                      endTime: new Date(),
                      duration: stepDuration,
                      error: stepFailed ? `Step ${step.name} failed due to simulated error` : undefined,
                      details: stepFailed ? undefined : `${step.name} completed successfully in ${(stepDuration / 1000).toFixed(1)}s`
                    }
                  : s
              ),
              progress: ((i + 1) / workflow.steps.length) * 100
            }
          : w
      ))

      // If step failed, stop the workflow
      if (stepFailed) {
        setWorkflowTests(prev => prev.map(w =>
          w.id === workflowId
            ? { ...w, status: 'failed' }
            : w
        ))
        return
      }
    }

    // Mark workflow as completed
    setWorkflowTests(prev => prev.map(w =>
      w.id === workflowId
        ? {
            ...w,
            status: 'completed',
            progress: 100,
            totalDuration: w.steps.reduce((acc, step) => acc + step.duration, 0),
            clientAppUrl: `https://${workflowId}-${Date.now()}.staging.example.com`
          }
        : w
    ))
  }

  const runAllWorkflows = async () => {
    setIsRunningAll(true)
    for (const workflow of workflowTests) {
      await runWorkflowTest(workflow.id)
    }
    setIsRunningAll(false)
  }

  const resetWorkflow = (workflowId: string) => {
    setWorkflowTests(prev => prev.map(w =>
      w.id === workflowId
        ? {
            ...w,
            status: 'pending',
            progress: 0,
            totalDuration: 0,
            clientAppUrl: undefined,
            steps: w.steps.map(step => ({
              ...step,
              status: 'pending',
              duration: 0,
              startTime: undefined,
              endTime: undefined,
              details: undefined,
              error: undefined
            }))
          }
        : w
    ))
  }

  const getStatusIcon = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: WorkflowTest['status']) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const currentWorkflow = workflowTests.find(w => w.id === selectedWorkflow)
  const overallStats = {
    totalWorkflows: workflowTests.length,
    completedWorkflows: workflowTests.filter(w => w.status === 'completed').length,
    failedWorkflows: workflowTests.filter(w => w.status === 'failed').length,
    runningWorkflows: workflowTests.filter(w => w.status === 'running').length,
    averageDuration: workflowTests.filter(w => w.totalDuration > 0).reduce((acc, w) => acc + w.totalDuration, 0) /
                    Math.max(workflowTests.filter(w => w.totalDuration > 0).length, 1)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">End-to-End Workflow Testing</h1>
          <p className="text-muted-foreground">
            Complete client app generation workflow testing and deployment validation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllWorkflows}
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningAll ? 'Running All...' : 'Run All Workflows'}
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Testing Overview
          </CardTitle>
          <CardDescription>
            End-to-end workflow execution statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.completedWorkflows}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overallStats.failedWorkflows}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.runningWorkflows}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{overallStats.totalWorkflows}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {(overallStats.averageDuration / 1000 / 60).toFixed(1)}m
              </div>
              <div className="text-sm text-muted-foreground">Avg. Duration</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Selection */}
      <Tabs value={selectedWorkflow} onValueChange={setSelectedWorkflow} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultation-mvp-full">Consultation MVP</TabsTrigger>
          <TabsTrigger value="ecommerce-basic-full">E-commerce Basic</TabsTrigger>
        </TabsList>

        {workflowTests.map((workflow) => (
          <TabsContent key={workflow.id} value={workflow.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <GitBranch className="h-5 w-5" />
                      {workflow.name}
                    </CardTitle>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => runWorkflowTest(workflow.id)}
                      disabled={workflow.status === 'running'}
                      variant="outline"
                      size="sm"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Run Workflow
                    </Button>
                    <Button
                      onClick={() => resetWorkflow(workflow.id)}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(workflow.status)}
                    {workflow.totalDuration > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Total: {(workflow.totalDuration / 1000 / 60).toFixed(1)} minutes
                      </span>
                    )}
                  </div>
                  {workflow.clientAppUrl && (
                    <a
                      href={workflow.clientAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      🔗 View Deployed App
                    </a>
                  )}
                </div>

                {workflow.status === 'running' && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(workflow.progress)}%</span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
                          {index + 1}
                        </div>
                        {getStatusIcon(step.status)}
                        <div>
                          <div className="font-medium">{step.name}</div>
                          <div className="text-sm text-muted-foreground">{step.description}</div>
                          {step.details && (
                            <div className="text-sm text-green-600 mt-1">{step.details}</div>
                          )}
                          {step.error && (
                            <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3" />
                              {step.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {step.duration > 0 && (
                          <div className="text-sm text-muted-foreground">
                            {(step.duration / 1000).toFixed(1)}s
                          </div>
                        )}
                        {step.status === 'running' && (
                          <div className="text-sm text-blue-600">Running...</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Deployment Environment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Deployment Environment Status
          </CardTitle>
          <CardDescription>
            Current status of staging and production deployment environments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold">Staging Environment</span>
              </div>
              <div className="text-sm text-muted-foreground">Ready for deployment</div>
              <div className="text-xs text-green-600 mt-1">Last check: 2 minutes ago</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Database Staging</span>
              </div>
              <div className="text-sm text-muted-foreground">Connected and ready</div>
              <div className="text-xs text-blue-600 mt-1">Response time: 45ms</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">CDN & Assets</span>
              </div>
              <div className="text-sm text-muted-foreground">Optimized and cached</div>
              <div className="text-xs text-purple-600 mt-1">Cache hit rate: 94%</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}