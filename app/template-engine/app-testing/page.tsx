'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, Play, RotateCcw, AlertTriangle, ExternalLink, Monitor, Smartphone, Tablet, Globe } from 'lucide-react'

interface TestCase {
  id: string
  name: string
  description: string
  category: 'functional' | 'performance' | 'accessibility' | 'security' | 'responsive'
  status: 'pending' | 'running' | 'passed' | 'failed'
  duration: number
  error?: string
  details?: string
  score?: number
}

interface ClientApp {
  id: string
  name: string
  url: string
  templateId: string
  version: string
  deployedAt: Date
  status: 'active' | 'testing' | 'failed' | 'deploying'
  testSuite: TestCase[]
  overallScore: number
  lastTestRun?: Date
}

interface DeviceTest {
  device: string
  viewport: string
  status: 'pending' | 'running' | 'passed' | 'failed'
  score?: number
  issues?: string[]
}

export default function ClientAppTestingPage() {
  const [clientApps, setClientApps] = useState<ClientApp[]>([
    {
      id: 'consultation-mvp-001',
      name: 'Consultation MVP - Client Demo',
      url: 'https://consultation-mvp-001.staging.example.com',
      templateId: 'consultation-mvp',
      version: '1.0.0',
      deployedAt: new Date(Date.now() - 3600000), // 1 hour ago
      status: 'active',
      overallScore: 92,
      lastTestRun: new Date(Date.now() - 1800000), // 30 minutes ago
      testSuite: [
        {
          id: 'landing-page-load',
          name: 'Landing Page Load Test',
          description: 'Test landing page loads correctly with all components',
          category: 'functional',
          status: 'passed',
          duration: 1200,
          score: 95,
          details: 'All components loaded successfully, navigation functional'
        },
        {
          id: 'questionnaire-flow',
          name: 'Questionnaire Flow Test',
          description: 'Test complete questionnaire submission flow',
          category: 'functional',
          status: 'passed',
          duration: 3400,
          score: 88,
          details: 'Form submission works, validation active, progress tracking functional'
        },
        {
          id: 'pdf-generation',
          name: 'PDF Generation Test',
          description: 'Test PDF consultation document generation',
          category: 'functional',
          status: 'passed',
          duration: 2100,
          score: 90,
          details: 'PDF generated successfully with correct formatting and data'
        },
        {
          id: 'performance-audit',
          name: 'Performance Audit',
          description: 'Lighthouse performance audit',
          category: 'performance',
          status: 'passed',
          duration: 5200,
          score: 94,
          details: 'First Contentful Paint: 1.2s, Largest Contentful Paint: 2.1s'
        },
        {
          id: 'accessibility-check',
          name: 'Accessibility Compliance',
          description: 'WCAG 2.1 accessibility compliance check',
          category: 'accessibility',
          status: 'failed',
          duration: 1800,
          score: 76,
          error: 'Missing alt text on 3 images, insufficient color contrast on form labels',
          details: 'Need to improve accessibility for screen readers'
        },
        {
          id: 'security-scan',
          name: 'Security Vulnerability Scan',
          description: 'Basic security vulnerability assessment',
          category: 'security',
          status: 'passed',
          duration: 4300,
          score: 98,
          details: 'No critical vulnerabilities found, HTTPS properly configured'
        },
        {
          id: 'responsive-design',
          name: 'Responsive Design Test',
          description: 'Test responsive behavior across devices',
          category: 'responsive',
          status: 'passed',
          duration: 2800,
          score: 89,
          details: 'Works well on desktop, tablet, and mobile viewports'
        }
      ]
    },
    {
      id: 'ecommerce-basic-001',
      name: 'E-commerce Basic - Client Demo',
      url: 'https://ecommerce-basic-001.staging.example.com',
      templateId: 'ecommerce-basic',
      version: '0.8.0',
      deployedAt: new Date(Date.now() - 7200000), // 2 hours ago
      status: 'testing',
      overallScore: 78,
      lastTestRun: new Date(Date.now() - 600000), // 10 minutes ago
      testSuite: [
        {
          id: 'product-catalog',
          name: 'Product Catalog Test',
          description: 'Test product listing and search functionality',
          category: 'functional',
          status: 'passed',
          duration: 1800,
          score: 85,
          details: 'Product listing loads, search and filtering work correctly'
        },
        {
          id: 'shopping-cart',
          name: 'Shopping Cart Test',
          description: 'Test add to cart, quantity changes, and cart persistence',
          category: 'functional',
          status: 'passed',
          duration: 2200,
          score: 92,
          details: 'Cart functionality working properly, persistence across sessions'
        },
        {
          id: 'checkout-process',
          name: 'Checkout Process Test',
          description: 'Test complete checkout flow with payment simulation',
          category: 'functional',
          status: 'running',
          duration: 0,
          details: 'Currently testing payment form validation and submission'
        },
        {
          id: 'performance-audit',
          name: 'Performance Audit',
          description: 'Lighthouse performance audit for e-commerce',
          category: 'performance',
          status: 'failed',
          duration: 4100,
          score: 67,
          error: 'Slow product image loading, large bundle size affecting performance',
          details: 'Need image optimization and code splitting'
        },
        {
          id: 'security-scan',
          name: 'Security Vulnerability Scan',
          description: 'PCI compliance and security assessment',
          category: 'security',
          status: 'failed',
          duration: 3800,
          score: 45,
          error: 'Missing PCI DSS compliance for payment processing',
          details: 'Critical security issues need immediate attention'
        }
      ]
    }
  ])

  const [selectedApp, setSelectedApp] = useState('consultation-mvp-001')
  const [deviceTests, setDeviceTests] = useState<DeviceTest[]>([
    { device: 'Desktop', viewport: '1920x1080', status: 'passed', score: 94, issues: [] },
    { device: 'Tablet', viewport: '768x1024', status: 'passed', score: 89, issues: ['Minor spacing issue in header'] },
    { device: 'Mobile', viewport: '375x667', status: 'passed', score: 87, issues: ['Form labels could be larger'] },
    { device: 'Large Desktop', viewport: '2560x1440', status: 'passed', score: 92, issues: [] }
  ])

  const runAppTests = async (appId: string) => {
    const app = clientApps.find(a => a.id === appId)
    if (!app) return

    // Mark app as testing
    setClientApps(prev => prev.map(a =>
      a.id === appId ? { ...a, status: 'testing' } : a
    ))

    // Run each test in sequence
    for (let i = 0; i < app.testSuite.length; i++) {
      const test = app.testSuite[i]

      // Mark test as running
      setClientApps(prev => prev.map(a =>
        a.id === appId
          ? {
              ...a,
              testSuite: a.testSuite.map((t, index) =>
                index === i ? { ...t, status: 'running' } : t
              )
            }
          : a
      ))

      // Simulate test execution
      const testDuration = Math.random() * 5000 + 2000
      await new Promise(resolve => setTimeout(resolve, testDuration))

      // Simulate test results
      const testPassed = Math.random() > 0.2 // 80% pass rate
      const testScore = testPassed ? Math.random() * 20 + 80 : Math.random() * 40 + 40

      // Update test results
      setClientApps(prev => prev.map(a =>
        a.id === appId
          ? {
              ...a,
              testSuite: a.testSuite.map((t, index) =>
                index === i
                  ? {
                      ...t,
                      status: testPassed ? 'passed' : 'failed',
                      duration: testDuration,
                      score: testScore,
                      error: testPassed ? undefined : `Test failed: Simulated error in ${test.name}`,
                      details: testPassed ? `Test completed successfully with ${testScore.toFixed(0)}% score` : test.details
                    }
                  : t
              )
            }
          : a
      ))
    }

    // Calculate overall score and mark as active
    const app_final = clientApps.find(a => a.id === appId)
    if (app_final) {
      const avgScore = app_final.testSuite.reduce((acc, test) => acc + (test.score || 0), 0) / app_final.testSuite.length
      const hasFailures = app_final.testSuite.some(test => test.status === 'failed')

      setClientApps(prev => prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: hasFailures ? 'failed' : 'active',
              overallScore: Math.round(avgScore),
              lastTestRun: new Date()
            }
          : a
      ))
    }
  }

  const runDeviceTests = async () => {
    setDeviceTests(prev => prev.map(d => ({ ...d, status: 'running' })))

    for (let i = 0; i < deviceTests.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000))

      setDeviceTests(prev => prev.map((d, index) =>
        index === i
          ? {
              ...d,
              status: 'passed',
              score: Math.random() * 15 + 85,
              issues: Math.random() > 0.7 ? [`Minor UI issue on ${d.device.toLowerCase()}`] : []
            }
          : d
      ))
    }
  }

  const getStatusIcon = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />
      case 'running': return <Clock className="h-4 w-4 text-blue-600 animate-spin" />
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: ClientApp['status']) => {
    const variants = {
      active: 'default',
      failed: 'destructive',
      testing: 'secondary',
      deploying: 'outline'
    } as const

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>
  }

  const getCategoryIcon = (category: TestCase['category']) => {
    switch (category) {
      case 'functional': return <CheckCircle className="h-4 w-4" />
      case 'performance': return <Clock className="h-4 w-4" />
      case 'accessibility': return <Monitor className="h-4 w-4" />
      case 'security': return <AlertTriangle className="h-4 w-4" />
      case 'responsive': return <Smartphone className="h-4 w-4" />
    }
  }

  const currentApp = clientApps.find(app => app.id === selectedApp)

  const overallStats = {
    totalApps: clientApps.length,
    activeApps: clientApps.filter(app => app.status === 'active').length,
    failedApps: clientApps.filter(app => app.status === 'failed').length,
    testingApps: clientApps.filter(app => app.status === 'testing').length,
    averageScore: Math.round(clientApps.reduce((acc, app) => acc + app.overallScore, 0) / clientApps.length)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client App Testing</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of deployed client applications with functional, performance, and security validation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => currentApp && runAppTests(currentApp.id)}
            disabled={currentApp?.status === 'testing'}
            className="flex items-center gap-2"
          >
            {currentApp?.status === 'testing' ? <Clock className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {currentApp?.status === 'testing' ? 'Testing...' : 'Run Tests'}
          </Button>
        </div>
      </div>

      {/* Overall Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Client Apps Overview
          </CardTitle>
          <CardDescription>
            Overall testing statistics for deployed client applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{overallStats.activeApps}</div>
              <div className="text-sm text-muted-foreground">Active Apps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overallStats.failedApps}</div>
              <div className="text-sm text-muted-foreground">Failed Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{overallStats.testingApps}</div>
              <div className="text-sm text-muted-foreground">Testing</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{overallStats.totalApps}</div>
              <div className="text-sm text-muted-foreground">Total Apps</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{overallStats.averageScore}%</div>
              <div className="text-sm text-muted-foreground">Avg. Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Selection */}
      <Tabs value={selectedApp} onValueChange={setSelectedApp} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="consultation-mvp-001">Consultation MVP</TabsTrigger>
          <TabsTrigger value="ecommerce-basic-001">E-commerce Basic</TabsTrigger>
        </TabsList>

        {clientApps.map((app) => (
          <TabsContent key={app.id} value={app.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="h-5 w-5" />
                      {app.name}
                    </CardTitle>
                    <CardDescription>
                      Template: {app.templateId} | Version: {app.version} |
                      Deployed: {app.deployedAt.toLocaleTimeString()}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(app.status)}
                    <Button
                      onClick={() => window.open(app.url, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View App
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Overall Score: <span className="font-semibold text-foreground">{app.overallScore}%</span>
                  </div>
                  {app.lastTestRun && (
                    <div className="text-sm text-muted-foreground">
                      Last test: {app.lastTestRun.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Test Results */}
                <div>
                  <h4 className="font-semibold mb-4">Test Results</h4>
                  <div className="space-y-3">
                    {app.testSuite.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(test.category)}
                          {getStatusIcon(test.status)}
                          <div>
                            <div className="font-medium">{test.name}</div>
                            <div className="text-sm text-muted-foreground">{test.description}</div>
                            {test.details && (
                              <div className="text-sm text-green-600 mt-1">{test.details}</div>
                            )}
                            {test.error && (
                              <div className="text-sm text-red-600 flex items-center gap-1 mt-1">
                                <AlertTriangle className="h-3 w-3" />
                                {test.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {test.score && (
                            <div className="text-lg font-semibold">{Math.round(test.score)}%</div>
                          )}
                          {test.duration > 0 && (
                            <div className="text-sm text-muted-foreground">
                              {(test.duration / 1000).toFixed(1)}s
                            </div>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {test.category}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Device Testing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tablet className="h-5 w-5" />
                Responsive Device Testing
              </CardTitle>
              <CardDescription>
                Cross-device compatibility testing results
              </CardDescription>
            </div>
            <Button
              onClick={runDeviceTests}
              variant="outline"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Test All Devices
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {deviceTests.map((deviceTest, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{deviceTest.device}</div>
                  {getStatusIcon(deviceTest.status)}
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                  {deviceTest.viewport}
                </div>
                {deviceTest.score && (
                  <div className="text-lg font-semibold text-green-600 mb-2">
                    {Math.round(deviceTest.score)}%
                  </div>
                )}
                {deviceTest.issues && deviceTest.issues.length > 0 && (
                  <div className="text-xs text-yellow-600">
                    {deviceTest.issues.length} issue(s) found
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}