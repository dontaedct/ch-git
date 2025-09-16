import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import {
  TestTube2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Timer,
  Target,
  TrendingUp,
  Shield,
  FileText,
  Activity,
  GitBranch,
  Bug,
  Beaker,
  FlaskConical,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function WorkflowTestingPage() {
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
    totalTests: 145,
    passedTests: 138,
    failedTests: 7,
    testCoverage: 94.2,
    automatedTests: 132,
    manualTests: 13,
    averageTestTime: '1.8s',
    lastTestRun: '5 minutes ago'
  };

  const testSuites = [
    {
      id: 'ts-001',
      name: 'Customer Onboarding Validation',
      description: 'Comprehensive testing of customer onboarding workflow',
      status: 'passed',
      testsCount: 24,
      passedCount: 24,
      failedCount: 0,
      coverage: 98.5,
      lastRun: '2 hours ago',
      duration: '45s',
      type: 'automated',
      priority: 'high'
    },
    {
      id: 'ts-002',
      name: 'Payment Processing Tests',
      description: 'Validation of payment workflows and error handling',
      status: 'failed',
      testsCount: 18,
      passedCount: 15,
      failedCount: 3,
      coverage: 92.1,
      lastRun: '1 hour ago',
      duration: '32s',
      type: 'automated',
      priority: 'critical'
    },
    {
      id: 'ts-003',
      name: 'Data Sync Performance',
      description: 'Performance testing for data synchronization workflows',
      status: 'warning',
      testsCount: 12,
      passedCount: 11,
      failedCount: 1,
      coverage: 89.3,
      lastRun: '30 minutes ago',
      duration: '125s',
      type: 'performance',
      priority: 'medium'
    },
    {
      id: 'ts-004',
      name: 'Integration Security Tests',
      description: 'Security validation for external service integrations',
      status: 'passed',
      testsCount: 16,
      passedCount: 16,
      failedCount: 0,
      coverage: 95.8,
      lastRun: '45 minutes ago',
      duration: '28s',
      type: 'security',
      priority: 'critical'
    }
  ];

  const performanceTests = [
    {
      metric: 'Response Time',
      target: '< 2s',
      actual: '1.4s',
      status: 'passed',
      improvement: '+15%'
    },
    {
      metric: 'Throughput',
      target: '> 100/min',
      actual: '145/min',
      status: 'passed',
      improvement: '+22%'
    },
    {
      metric: 'Error Rate',
      target: '< 1%',
      actual: '0.3%',
      status: 'passed',
      improvement: '+70%'
    },
    {
      metric: 'Memory Usage',
      target: '< 500MB',
      actual: '720MB',
      status: 'failed',
      improvement: '-8%'
    }
  ];

  const validationRules = [
    {
      rule: 'Data Type Validation',
      description: 'Ensure all data inputs match expected types',
      status: 'active',
      violations: 0,
      lastCheck: '5 min ago'
    },
    {
      rule: 'Business Logic Validation',
      description: 'Validate business rules and constraints',
      status: 'active',
      violations: 2,
      lastCheck: '10 min ago'
    },
    {
      rule: 'External Service Validation',
      description: 'Validate external service responses and contracts',
      status: 'active',
      violations: 1,
      lastCheck: '15 min ago'
    },
    {
      rule: 'Performance Threshold Validation',
      description: 'Ensure workflows meet performance requirements',
      status: 'warning',
      violations: 3,
      lastCheck: '8 min ago'
    }
  ];

  const testAutomation = [
    {
      name: 'Continuous Integration Tests',
      description: 'Automated tests running on code changes',
      status: 'running',
      lastRun: '2 min ago',
      frequency: 'On commit',
      successRate: 96.8
    },
    {
      name: 'Scheduled Regression Tests',
      description: 'Daily regression testing suite',
      status: 'passed',
      lastRun: '6 hours ago',
      frequency: 'Daily',
      successRate: 98.2
    },
    {
      name: 'Performance Monitoring',
      description: 'Continuous performance validation',
      status: 'running',
      lastRun: '1 min ago',
      frequency: 'Continuous',
      successRate: 94.5
    },
    {
      name: 'Security Scans',
      description: 'Automated security vulnerability tests',
      status: 'passed',
      lastRun: '12 hours ago',
      frequency: 'Weekly',
      successRate: 99.1
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'active':
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTestTypeBadge = (type: string) => {
    switch (type) {
      case 'automated':
        return <Badge className="bg-blue-100 text-blue-800">Automated</Badge>;
      case 'performance':
        return <Badge className="bg-purple-100 text-purple-800">Performance</Badge>;
      case 'security':
        return <Badge className="bg-red-100 text-red-800">Security</Badge>;
      case 'manual':
        return <Badge className="bg-gray-100 text-gray-800">Manual</Badge>;
      default:
        return <Badge variant="outline">Other</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Testing & Validation</h1>
            <p className="text-gray-600">
              Comprehensive testing, validation, and quality assurance for workflows
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Create Test Suite
            </Button>
            <Button variant="outline" className="flex items-center">
              <Play className="mr-2 h-4 w-4" />
              Run All Tests
            </Button>
          </div>
        </div>

        {/* Testing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <TestTube2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.totalTests}</div>
              <p className="text-xs text-muted-foreground">Test cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{testingStats.passedTests}</div>
              <p className="text-xs text-muted-foreground">Success</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{testingStats.failedTests}</div>
              <p className="text-xs text-muted-foreground">Failures</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coverage</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.testCoverage}%</div>
              <p className="text-xs text-muted-foreground">Test coverage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Automated</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.automatedTests}</div>
              <p className="text-xs text-muted-foreground">Auto tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manual</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.manualTests}</div>
              <p className="text-xs text-muted-foreground">Manual tests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testingStats.averageTestTime}</div>
              <p className="text-xs text-muted-foreground">Execution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Run</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">{testingStats.lastTestRun}</div>
              <p className="text-xs text-muted-foreground">Latest test</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Test Suites */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FlaskConical className="mr-2 h-5 w-5" />
                Test Suites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testSuites.map((suite) => (
                  <div key={suite.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-50 p-2 rounded-lg">
                          {getStatusIcon(suite.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{suite.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{suite.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getStatusBadge(suite.status)}
                        {getTestTypeBadge(suite.type)}
                        {getPriorityBadge(suite.priority)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Tests:</span>
                        <span className="ml-1 font-medium">
                          {suite.passedCount}/{suite.testsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Coverage:</span>
                        <span className="ml-1 font-medium">{suite.coverage}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{suite.duration}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Run:</span>
                        <span className="ml-1 font-medium">{suite.lastRun}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <Progress value={(suite.passedCount / suite.testsCount) * 100} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                      </div>
                      {suite.failedCount > 0 && (
                        <Button size="sm" variant="destructive">
                          <Bug className="h-3 w-3 mr-1" />
                          Debug
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Performance Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceTests.map((test, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <h4 className="font-medium">{test.metric}</h4>
                      </div>
                      {getStatusBadge(test.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1 font-medium">{test.target}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Actual:</span>
                        <span className="ml-1 font-medium">{test.actual}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-500">Improvement:</span>
                      <span className={`ml-1 font-medium ${test.improvement.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {test.improvement}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Validation Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Validation Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationRules.map((rule, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          {getStatusIcon(rule.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{rule.rule}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(rule.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Violations:</span>
                        <span className={`ml-1 font-medium ${rule.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {rule.violations}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Check:</span>
                        <span className="ml-1 font-medium">{rule.lastCheck}</span>
                      </div>
                    </div>
                    {rule.violations > 0 && (
                      <div className="mt-2">
                        <Button size="sm" variant="outline">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          View Violations
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Automation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beaker className="mr-2 h-5 w-5" />
                Test Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testAutomation.map((automation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-50 p-2 rounded-lg">
                          {getStatusIcon(automation.status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{automation.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{automation.description}</p>
                        </div>
                      </div>
                      {getStatusBadge(automation.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <span className="ml-1 font-medium">{automation.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Run:</span>
                        <span className="ml-1 font-medium">{automation.lastRun}</span>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-500 text-sm">Success Rate:</span>
                      <span className="ml-1 font-medium">{automation.successRate}%</span>
                    </div>
                    <Progress value={automation.successRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Assurance Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCheck className="mr-2 h-5 w-5" />
              Quality Assurance Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {((testingStats.passedTests / testingStats.totalTests) * 100).toFixed(1)}%
                </div>
                <p className="text-gray-600">Overall Test Success Rate</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {testingStats.testCoverage}%
                </div>
                <p className="text-gray-600">Workflow Test Coverage</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {((testingStats.automatedTests / testingStats.totalTests) * 100).toFixed(1)}%
                </div>
                <p className="text-gray-600">Test Automation Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8">
          <Link
            href="/integrations"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Integration Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}