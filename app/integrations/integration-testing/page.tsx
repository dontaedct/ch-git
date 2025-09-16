import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings, Activity, Database, Globe, Shield, Zap, AlertTriangle, CheckCircle, Clock, RefreshCw, Play, Pause, Eye, Edit, TestTube, Target, BarChart3, Timer, Search, Filter, GitBranch, Network, Server, Cpu, Bug, CheckSquare, XCircle, PlayCircle, FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function IntegrationTestingPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const testingStats = {
    totalTestSuites: 24,
    passingTests: 186,
    failingTests: 12,
    testCoverage: 87.5,
    executionTime: 145,
    lastRun: '2 minutes ago',
    automationRate: 92.3,
    integrationHealth: 94.8
  };

  const testSuites = [
    {
      id: 'suite_001',
      name: 'API Integration Test Suite',
      type: 'Integration',
      status: 'passing',
      lastRun: '2 minutes ago',
      duration: '45s',
      tests: 24,
      passed: 23,
      failed: 1,
      coverage: 89.2,
      environment: 'staging',
      services: ['Payment API', 'User API', 'Notification API'],
      automationLevel: 'full',
      frequency: 'on_commit'
    },
    {
      id: 'suite_002',
      name: 'Service Communication Tests',
      type: 'Service',
      status: 'passing',
      lastRun: '5 minutes ago',
      duration: '67s',
      tests: 18,
      passed: 18,
      failed: 0,
      coverage: 92.1,
      environment: 'staging',
      services: ['Auth Service', 'Email Service', 'Storage Service'],
      automationLevel: 'full',
      frequency: 'scheduled'
    },
    {
      id: 'suite_003',
      name: 'Webhook Integration Tests',
      type: 'Integration',
      status: 'failing',
      lastRun: '8 minutes ago',
      duration: '89s',
      tests: 15,
      passed: 12,
      failed: 3,
      coverage: 78.5,
      environment: 'staging',
      services: ['Stripe Webhooks', 'GitHub Webhooks', 'SendGrid Webhooks'],
      automationLevel: 'partial',
      frequency: 'on_deploy'
    },
    {
      id: 'suite_004',
      name: 'Database Integration Tests',
      type: 'Database',
      status: 'passing',
      lastRun: '12 minutes ago',
      duration: '156s',
      tests: 32,
      passed: 30,
      failed: 2,
      coverage: 95.3,
      environment: 'staging',
      services: ['PostgreSQL', 'Redis Cache', 'MongoDB'],
      automationLevel: 'full',
      frequency: 'nightly'
    },
    {
      id: 'suite_005',
      name: 'Performance Integration Tests',
      type: 'Performance',
      status: 'warning',
      lastRun: '15 minutes ago',
      duration: '234s',
      tests: 12,
      passed: 10,
      failed: 2,
      coverage: 76.8,
      environment: 'staging',
      services: ['Load Balancer', 'CDN', 'Cache Layer'],
      automationLevel: 'full',
      frequency: 'weekly'
    }
  ];

  const testingFrameworks = [
    {
      framework: 'Jest Integration Tests',
      description: 'JavaScript/TypeScript integration testing framework',
      status: 'active',
      testSuites: 8,
      coverage: 89.2,
      executionTime: '45s avg',
      features: [
        'Snapshot testing',
        'Mocking capabilities',
        'Parallel execution',
        'Code coverage reporting'
      ]
    },
    {
      framework: 'Postman/Newman',
      description: 'API testing and automation platform',
      status: 'active',
      testSuites: 6,
      coverage: 92.1,
      executionTime: '67s avg',
      features: [
        'API endpoint testing',
        'Environment variables',
        'Test scripting',
        'Collection runner'
      ]
    },
    {
      framework: 'Artillery.js',
      description: 'Performance and load testing toolkit',
      status: 'active',
      testSuites: 4,
      coverage: 76.8,
      executionTime: '234s avg',
      features: [
        'Load testing',
        'Performance metrics',
        'Real-time monitoring',
        'Custom metrics'
      ]
    },
    {
      framework: 'Testcontainers',
      description: 'Integration testing with real dependencies',
      status: 'active',
      testSuites: 6,
      coverage: 95.3,
      executionTime: '156s avg',
      features: [
        'Docker containers',
        'Database testing',
        'Service isolation',
        'Cleanup automation'
      ]
    }
  ];

  const validationChecks = [
    {
      check: 'API Contract Validation',
      description: 'Validate API contracts and schema compliance',
      status: 'passing',
      services: 15,
      successRate: 96.8,
      lastCheck: '2 minutes ago',
      issues: 2,
      automationLevel: 'full'
    },
    {
      check: 'Data Integrity Validation',
      description: 'Verify data consistency across services',
      status: 'passing',
      services: 12,
      successRate: 98.2,
      lastCheck: '5 minutes ago',
      issues: 1,
      automationLevel: 'full'
    },
    {
      check: 'Security Validation',
      description: 'Security compliance and vulnerability checks',
      status: 'warning',
      services: 18,
      successRate: 92.5,
      lastCheck: '8 minutes ago',
      issues: 5,
      automationLevel: 'partial'
    },
    {
      check: 'Performance Validation',
      description: 'Performance benchmarks and SLA compliance',
      status: 'failing',
      services: 10,
      successRate: 87.3,
      lastCheck: '12 minutes ago',
      issues: 8,
      automationLevel: 'full'
    },
    {
      check: 'Dependency Validation',
      description: 'Service dependency health and compatibility',
      status: 'passing',
      services: 14,
      successRate: 94.7,
      lastCheck: '3 minutes ago',
      issues: 3,
      automationLevel: 'full'
    }
  ];

  const performanceMetrics = [
    {
      metric: 'Response Time',
      target: '< 200ms',
      current: '145ms',
      status: 'passing',
      trend: 'improving',
      tests: 24
    },
    {
      metric: 'Throughput',
      target: '> 1000 req/s',
      current: '1250 req/s',
      status: 'passing',
      trend: 'stable',
      tests: 18
    },
    {
      metric: 'Error Rate',
      target: '< 1%',
      current: '0.3%',
      status: 'passing',
      trend: 'improving',
      tests: 32
    },
    {
      metric: 'CPU Utilization',
      target: '< 80%',
      current: '65%',
      status: 'passing',
      trend: 'stable',
      tests: 15
    },
    {
      metric: 'Memory Usage',
      target: '< 75%',
      current: '58%',
      status: 'passing',
      trend: 'stable',
      tests: 12
    },
    {
      metric: 'Database Connections',
      target: '< 90%',
      current: '92%',
      status: 'warning',
      trend: 'increasing',
      tests: 8
    }
  ];

  const testEnvironments = [
    {
      environment: 'Development',
      status: 'healthy',
      services: 18,
      uptime: '99.2%',
      lastDeploy: '1 hour ago',
      testsPassing: '95%'
    },
    {
      environment: 'Staging',
      status: 'healthy',
      services: 18,
      uptime: '98.7%',
      lastDeploy: '30 minutes ago',
      testsPassing: '92%'
    },
    {
      environment: 'Production',
      status: 'healthy',
      services: 18,
      uptime: '99.8%',
      lastDeploy: '2 days ago',
      testsPassing: '98%'
    }
  ];

  const qualityAssurance = [
    {
      category: 'Code Quality',
      score: 92,
      metrics: [
        { name: 'Test Coverage', value: '87.5%', status: 'good' },
        { name: 'Code Complexity', value: 'Low', status: 'excellent' },
        { name: 'Technical Debt', value: '12h', status: 'good' },
        { name: 'Duplication', value: '2.1%', status: 'excellent' }
      ]
    },
    {
      category: 'Integration Health',
      score: 89,
      metrics: [
        { name: 'API Compatibility', value: '96%', status: 'excellent' },
        { name: 'Service Dependencies', value: '94%', status: 'good' },
        { name: 'Data Consistency', value: '98%', status: 'excellent' },
        { name: 'Error Handling', value: '91%', status: 'good' }
      ]
    },
    {
      category: 'Performance',
      score: 85,
      metrics: [
        { name: 'Response Times', value: '145ms', status: 'good' },
        { name: 'Throughput', value: '1250/s', status: 'excellent' },
        { name: 'Resource Usage', value: '65%', status: 'good' },
        { name: 'Scalability', value: '87%', status: 'good' }
      ]
    }
  ];

  const recentTestRuns = [
    {
      id: 'run_001',
      suite: 'API Integration Test Suite',
      status: 'passed',
      duration: '45s',
      timestamp: '2 minutes ago',
      passed: 23,
      failed: 1,
      environment: 'staging'
    },
    {
      id: 'run_002',
      suite: 'Service Communication Tests',
      status: 'passed',
      duration: '67s',
      timestamp: '5 minutes ago',
      passed: 18,
      failed: 0,
      environment: 'staging'
    },
    {
      id: 'run_003',
      suite: 'Webhook Integration Tests',
      status: 'failed',
      duration: '89s',
      timestamp: '8 minutes ago',
      passed: 12,
      failed: 3,
      environment: 'staging'
    },
    {
      id: 'run_004',
      suite: 'Database Integration Tests',
      status: 'passed',
      duration: '156s',
      timestamp: '12 minutes ago',
      passed: 30,
      failed: 2,
      environment: 'staging'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href="/integrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Integrations
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <PlayCircle className="h-4 w-4 mr-2" />
                Run All Tests
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Test Suite
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Integration Testing & Validation</h1>
          <p className="text-gray-600">
            Comprehensive testing, validation, and quality assurance for integration systems
          </p>
        </div>

        {/* Testing Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.totalTestSuites}</div>
              <p className="text-xs text-muted-foreground">
                {testingStats.automationRate}% automated
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.testCoverage}%</div>
              <p className="text-xs text-muted-foreground">
                {testingStats.passingTests} passing tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Execution Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.executionTime}s</div>
              <p className="text-xs text-muted-foreground">
                Last run: {testingStats.lastRun}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integration Health</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.integrationHealth}%</div>
              <p className="text-xs text-muted-foreground">
                {testingStats.failingTests} failing tests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Test Suites */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <TestTube className="mr-2 h-5 w-5" />
                Test Suites
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-1" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testSuites.map((suite) => (
                <div key={suite.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-purple-50 p-2 rounded-lg">
                          <TestTube className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{suite.name}</h3>
                          <p className="text-sm text-gray-600">{suite.type} Tests • {suite.environment}</p>
                        </div>
                        <Badge variant={suite.status === 'passing' ? 'default' : suite.status === 'warning' ? 'secondary' : 'destructive'}>
                          {suite.status}
                        </Badge>
                        {suite.status === 'passing' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : suite.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{suite.tests}</div>
                      <div className="text-xs text-gray-600">Total Tests</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-semibold text-green-600">{suite.passed}</div>
                      <div className="text-xs text-gray-600">Passed</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-semibold text-red-600">{suite.failed}</div>
                      <div className="text-xs text-gray-600">Failed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{suite.coverage}%</div>
                      <div className="text-xs text-gray-600">Coverage</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{suite.duration}</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-semibold">{suite.frequency}</div>
                      <div className="text-xs text-gray-600">Frequency</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Tested Services</h4>
                    <div className="flex flex-wrap gap-2">
                      {suite.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      <span>Automation: {suite.automationLevel}</span>
                      <span>Last run: {suite.lastRun}</span>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Testing Frameworks & Validation Checks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Testing Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Testing Frameworks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testingFrameworks.map((framework, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{framework.framework}</h4>
                      <Badge variant={framework.status === 'active' ? 'default' : 'secondary'}>
                        {framework.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{framework.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{framework.testSuites}</div>
                        <div className="text-gray-600">Test Suites</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{framework.coverage}</div>
                        <div className="text-gray-600">Coverage</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-medium">{framework.executionTime}</div>
                        <div className="text-gray-600">Execution</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {framework.features.slice(0, 2).map((feature, i) => (
                        <div key={i} className="text-xs text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Validation Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckSquare className="mr-2 h-5 w-5" />
                Validation Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationChecks.map((check, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{check.check}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={check.status === 'passing' ? 'default' : check.status === 'warning' ? 'secondary' : 'destructive'}>
                          {check.status}
                        </Badge>
                        {check.status === 'passing' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : check.status === 'warning' ? (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{check.description}</p>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.services}</div>
                        <div className="text-gray-600">Services</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.successRate}%</div>
                        <div className="text-gray-600">Success</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.issues}</div>
                        <div className="text-gray-600">Issues</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded border">
                        <div className="font-medium">{check.automationLevel}</div>
                        <div className="text-gray-600">Auto</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics & Quality Assurance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{metric.metric}</h4>
                        <Badge variant={metric.status === 'passing' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                          {metric.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Target: {metric.target}</span>
                        <span>Current: {metric.current}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>{metric.tests} tests</span>
                        <span className={`${metric.trend === 'improving' ? 'text-green-600' : metric.trend === 'stable' ? 'text-blue-600' : 'text-red-600'}`}>
                          {metric.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quality Assurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Quality Assurance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {qualityAssurance.map((category, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">{category.category}</h4>
                      <div className="text-lg font-bold text-blue-600">{category.score}/100</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {category.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded border">
                          <span>{metric.name}</span>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{metric.value}</span>
                            {metric.status === 'excellent' ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : metric.status === 'good' ? (
                              <CheckCircle className="h-3 w-3 text-blue-500" />
                            ) : (
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Environments & Recent Test Runs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Environments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Server className="mr-2 h-5 w-5" />
                Test Environments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testEnvironments.map((env, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${env.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{env.environment}</h4>
                        <p className="text-sm text-gray-600">{env.services} services</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{env.testsPassing} tests passing</div>
                      <div className="text-gray-600">{env.uptime} uptime</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-1" />
                  Manage Environments
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Test Runs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Recent Test Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTestRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {run.status === 'passed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{run.suite}</h4>
                        <p className="text-xs text-gray-600">{run.environment} • {run.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <div className="font-medium">{run.duration}</div>
                      <div className="text-gray-600">{run.passed}/{run.passed + run.failed}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="h-4 w-4 mr-1" />
                  View All Test Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}