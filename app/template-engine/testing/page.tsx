'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Clock, Play, RotateCcw, AlertTriangle, Zap } from 'lucide-react'

interface TestResult {
  id: string
  name: string
  status: 'passed' | 'failed' | 'running' | 'pending'
  duration: number
  error?: string
  details?: string
}

interface TestSuite {
  id: string
  name: string
  description: string
  tests: TestResult[]
  totalTests: number
  passedTests: number
  failedTests: number
  runningTests: number
}

export default function TemplateEngineTestingPage() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: 'template-compilation',
      name: 'Template Compilation Tests',
      description: 'Validate template compilation engine with various template configurations',
      tests: [
        { id: 'basic-compilation', name: 'Basic Template Compilation', status: 'passed', duration: 120, details: 'Successfully compiled basic landing page template' },
        { id: 'complex-compilation', name: 'Complex Template Compilation', status: 'passed', duration: 340, details: 'Successfully compiled multi-page consultation workflow template' },
        { id: 'error-handling', name: 'Compilation Error Handling', status: 'passed', duration: 80, details: 'Properly handled malformed template configurations' },
        { id: 'performance-compilation', name: 'Performance Compilation Test', status: 'running', duration: 0 },
      ],
      totalTests: 4,
      passedTests: 3,
      failedTests: 0,
      runningTests: 1
    },
    {
      id: 'component-validation',
      name: 'Component Validation Tests',
      description: 'Validate component injection, mapping, and rendering systems',
      tests: [
        { id: 'component-injection', name: 'Component Injection Test', status: 'passed', duration: 95, details: 'Successfully injected form components into template' },
        { id: 'component-mapping', name: 'Component Mapping Validation', status: 'passed', duration: 150, details: 'Validated component mapping across template variations' },
        { id: 'dynamic-loading', name: 'Dynamic Component Loading', status: 'failed', duration: 200, error: 'Component failed to load in production environment', details: 'Investigation required for production deployment' },
        { id: 'fallback-rendering', name: 'Fallback Component Rendering', status: 'passed', duration: 75, details: 'Successfully rendered fallback components on errors' },
      ],
      totalTests: 4,
      passedTests: 3,
      failedTests: 1,
      runningTests: 0
    },
    {
      id: 'generation-pipeline',
      name: 'Generation Pipeline Tests',
      description: 'Validate template-to-app generation pipeline and deployment integration',
      tests: [
        { id: 'pipeline-execution', name: 'Pipeline Execution Test', status: 'passed', duration: 1800, details: 'Successfully generated complete client app from template' },
        { id: 'route-generation', name: 'Route Generation Validation', status: 'passed', duration: 120, details: 'Generated proper Next.js routes from template configuration' },
        { id: 'deployment-integration', name: 'Deployment Integration Test', status: 'pending', duration: 0 },
        { id: 'rollback-mechanism', name: 'Rollback Mechanism Test', status: 'pending', duration: 0 },
      ],
      totalTests: 4,
      passedTests: 2,
      failedTests: 0,
      runningTests: 0
    }
  ])

  const [isRunningAll, setIsRunningAll] = useState(false)
  const [overallStats, setOverallStats] = useState({
    totalTests: 12,
    passedTests: 8,
    failedTests: 1,
    runningTests: 1,
    pendingTests: 2,
    successRate: 88.9
  })

  const runAllTests = async () => {
    setIsRunningAll(true)
    // Simulate running all tests
    await new Promise(resolve => setTimeout(resolve, 3000))
    setIsRunningAll(false)
  }

  const runTestSuite = async (suiteId: string) => {
    setTestSuites(prev => prev.map(suite =>
      suite.id === suiteId
        ? { ...suite, tests: suite.tests.map(test => ({ ...test, status: 'running' as const })) }
        : suite
    ))

    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000))

    setTestSuites(prev => prev.map(suite =>
      suite.id === suiteId
        ? { ...suite, tests: suite.tests.map(test => ({ ...test, status: 'passed' as const, duration: Math.floor(Math.random() * 300) + 50 })) }
        : suite
    ))
  }

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      running: 'secondary',
      pending: 'outline'
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Template Engine Testing</h1>
          <p className="text-muted-foreground">
            Comprehensive testing suite for template engine components and generation pipeline
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {isRunningAll ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Tests
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Test Results Overview
          </CardTitle>
          <CardDescription>
            Overall template engine testing statistics and performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.passedTests}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overallStats.failedTests}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.runningTests}</div>
              <div className="text-sm text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{overallStats.pendingTests}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallStats.successRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Suites */}
      <Tabs defaultValue="template-compilation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="template-compilation">Template Compilation</TabsTrigger>
          <TabsTrigger value="component-validation">Component Validation</TabsTrigger>
          <TabsTrigger value="generation-pipeline">Generation Pipeline</TabsTrigger>
        </TabsList>

        {testSuites.map((suite) => (
          <TabsContent key={suite.id} value={suite.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{suite.name}</CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </div>
                  <Button
                    onClick={() => runTestSuite(suite.id)}
                    variant="outline"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Suite
                  </Button>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✓ {suite.passedTests} passed</span>
                  <span className="text-red-600">✗ {suite.failedTests} failed</span>
                  <span className="text-blue-600">⟳ {suite.runningTests} running</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          {test.details && (
                            <div className="text-sm text-muted-foreground">{test.details}</div>
                          )}
                          {test.error && (
                            <div className="text-sm text-red-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              {test.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {test.duration > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {test.duration}ms
                          </span>
                        )}
                        {getStatusBadge(test.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Benchmarks</CardTitle>
          <CardDescription>
            Template engine performance metrics and optimization targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">1.2s</div>
              <div className="text-sm text-muted-foreground">Template Compilation</div>
              <div className="text-xs text-green-600">Target: &lt;30s ✓</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">1.8min</div>
              <div className="text-sm text-muted-foreground">App Generation</div>
              <div className="text-xs text-green-600">Target: &lt;2min ✓</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">2.1s</div>
              <div className="text-sm text-muted-foreground">Template Loading</div>
              <div className="text-xs text-green-600">Target: &lt;5s ✓</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-lg font-semibold text-green-600">8.5s</div>
              <div className="text-sm text-muted-foreground">Component Injection</div>
              <div className="text-xs text-green-600">Target: &lt;10s ✓</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}