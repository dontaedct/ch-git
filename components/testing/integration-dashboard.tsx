'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  RefreshCw,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Database,
  Cog,
  Users,
  FileText,
  Zap
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'template-management' | 'client-customization' | 'deployment-pipeline' | 'handover-automation' | 'cross-client-analytics';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  testsTotal: number;
  testsPassed: number;
  testsFailed: number;
  testsSkipped: number;
  duration: number;
  coverage: number;
  lastRun: Date;
  criticalIssues: number;
  warnings: number;
}

interface TestRun {
  id: string;
  suiteId: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  errorMessage?: string;
  assertions: number;
  coverage: number;
}

interface IntegrationMetrics {
  totalSuites: number;
  totalTests: number;
  passRate: number;
  failRate: number;
  coverage: number;
  averageDuration: number;
  criticalIssues: number;
  warnings: number;
  lastRunTime: Date;
  trendsData: Array<{
    date: string;
    passRate: number;
    coverage: number;
    duration: number;
  }>;
}

export function IntegrationDashboard() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [metrics, setMetrics] = useState<IntegrationMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockTestSuites: TestSuite[] = [
      {
        id: 'template-management',
        name: 'Template Management Integration Tests',
        description: 'Tests template analysis, enhancement, registry, and validation systems',
        category: 'template-management',
        status: 'passed',
        testsTotal: 45,
        testsPassed: 42,
        testsFailed: 2,
        testsSkipped: 1,
        duration: 145,
        coverage: 94.2,
        lastRun: new Date('2025-09-21T14:30:00'),
        criticalIssues: 0,
        warnings: 3
      },
      {
        id: 'client-customization',
        name: 'Client Customization Integration Tests',
        description: 'Tests AI-powered customization, brand processing, and quality assurance',
        category: 'client-customization',
        status: 'passed',
        testsTotal: 52,
        testsPassed: 49,
        testsFailed: 1,
        testsSkipped: 2,
        duration: 189,
        coverage: 91.8,
        lastRun: new Date('2025-09-21T14:35:00'),
        criticalIssues: 0,
        warnings: 2
      },
      {
        id: 'deployment-pipeline',
        name: 'Deployment Pipeline Integration Tests',
        description: 'Tests client deployment, infrastructure management, and monitoring',
        category: 'deployment-pipeline',
        status: 'passed',
        testsTotal: 38,
        testsPassed: 36,
        testsFailed: 1,
        testsSkipped: 1,
        duration: 167,
        coverage: 89.5,
        lastRun: new Date('2025-09-21T14:40:00'),
        criticalIssues: 1,
        warnings: 4
      },
      {
        id: 'handover-automation',
        name: 'Handover Automation Integration Tests',
        description: 'Tests documentation generation, training automation, and client onboarding',
        category: 'handover-automation',
        status: 'passed',
        testsTotal: 41,
        testsPassed: 39,
        testsFailed: 1,
        testsSkipped: 1,
        duration: 156,
        coverage: 92.3,
        lastRun: new Date('2025-09-21T14:45:00'),
        criticalIssues: 0,
        warnings: 2
      },
      {
        id: 'cross-client-analytics',
        name: 'Cross-Client Analytics Integration Tests',
        description: 'Tests analytics engine, business intelligence, and universal client management',
        category: 'cross-client-analytics',
        status: 'passed',
        testsTotal: 47,
        testsPassed: 44,
        testsFailed: 2,
        testsSkipped: 1,
        duration: 203,
        coverage: 93.7,
        lastRun: new Date('2025-09-21T14:50:00'),
        criticalIssues: 0,
        warnings: 1
      }
    ];

    const mockMetrics: IntegrationMetrics = {
      totalSuites: 5,
      totalTests: 223,
      passRate: 94.6,
      failRate: 3.1,
      coverage: 92.3,
      averageDuration: 172,
      criticalIssues: 1,
      warnings: 12,
      lastRunTime: new Date('2025-09-21T14:50:00'),
      trendsData: [
        { date: '2025-09-14', passRate: 92.1, coverage: 89.5, duration: 185 },
        { date: '2025-09-15', passRate: 93.4, coverage: 90.2, duration: 178 },
        { date: '2025-09-16', passRate: 94.1, coverage: 91.1, duration: 175 },
        { date: '2025-09-17', passRate: 93.8, coverage: 91.8, duration: 172 },
        { date: '2025-09-18', passRate: 94.2, coverage: 92.1, duration: 170 },
        { date: '2025-09-19', passRate: 94.5, coverage: 92.0, duration: 169 },
        { date: '2025-09-20', passRate: 94.3, coverage: 92.2, duration: 171 },
        { date: '2025-09-21', passRate: 94.6, coverage: 92.3, duration: 172 }
      ]
    };

    setTestSuites(mockTestSuites);
    setMetrics(mockMetrics);
  }, []);

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TestSuite['status']) => {
    const variants = {
      passed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      running: 'bg-blue-100 text-blue-800',
      skipped: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: TestSuite['category']) => {
    switch (category) {
      case 'template-management':
        return <FileText className="h-4 w-4" />;
      case 'client-customization':
        return <Cog className="h-4 w-4" />;
      case 'deployment-pipeline':
        return <Zap className="h-4 w-4" />;
      case 'handover-automation':
        return <Users className="h-4 w-4" />;
      case 'cross-client-analytics':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Simulate test execution
    for (let i = 0; i < testSuites.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestSuites(prev => prev.map(suite =>
        suite.id === testSuites[i].id
          ? { ...suite, status: 'running' as const }
          : suite
      ));

      // Simulate test completion
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTestSuites(prev => prev.map(suite =>
        suite.id === testSuites[i].id
          ? { ...suite, status: 'passed' as const, lastRun: new Date() }
          : suite
      ));
    }

    setIsRunning(false);
  };

  const refreshDashboard = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integration Testing Dashboard</h1>
          <p className="text-gray-600 mt-1">HT-033.6.1: Comprehensive Integration Testing Suite</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={refreshDashboard}
            variant="outline"
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Across {metrics.totalSuites} test suites
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.passRate}%</div>
            <p className="text-xs text-muted-foreground">
              +1.2% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.coverage}%</div>
            <p className="text-xs text-muted-foreground">
              Target: 90%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.averageDuration}s</div>
            <p className="text-xs text-muted-foreground">
              -3s from last run
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {metrics.criticalIssues > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Critical Issues Detected</AlertTitle>
          <AlertDescription>
            {metrics.criticalIssues} critical issue(s) found in deployment pipeline tests.
            Review and address immediately.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(suite.category)}
                      <div>
                        <CardTitle className="text-lg">{suite.name}</CardTitle>
                        <CardDescription>{suite.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(suite.status)}
                      {getStatusBadge(suite.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{suite.testsPassed}</div>
                      <div className="text-sm text-muted-foreground">Passed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{suite.testsFailed}</div>
                      <div className="text-sm text-muted-foreground">Failed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{suite.testsSkipped}</div>
                      <div className="text-sm text-muted-foreground">Skipped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{suite.duration}s</div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Test Progress</span>
                      <span>{suite.testsPassed}/{suite.testsTotal}</span>
                    </div>
                    <Progress
                      value={(suite.testsPassed / suite.testsTotal) * 100}
                      className="h-2"
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-4">
                      <span>Coverage: <strong>{suite.coverage}%</strong></span>
                      {suite.criticalIssues > 0 && (
                        <Badge variant="destructive">
                          {suite.criticalIssues} Critical
                        </Badge>
                      )}
                      {suite.warnings > 0 && (
                        <Badge variant="secondary">
                          {suite.warnings} Warnings
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      Last run: {suite.lastRun.toLocaleString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends (Last 7 Days)</CardTitle>
              <CardDescription>
                Track test performance, coverage, and duration over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Pass Rate Trend */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Pass Rate Trend</h4>
                  <div className="h-32 bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 flex items-end justify-between">
                    {metrics.trendsData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-green-500 rounded-t"
                          style={{
                            height: `${(data.passRate / 100) * 80}px`,
                            width: '20px'
                          }}
                        />
                        <span className="text-xs mt-1">{data.date.split('-')[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coverage Trend */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Coverage Trend</h4>
                  <div className="h-32 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 flex items-end justify-between">
                    {metrics.trendsData.map((data, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div
                          className="bg-blue-500 rounded-t"
                          style={{
                            height: `${(data.coverage / 100) * 80}px`,
                            width: '20px'
                          }}
                        />
                        <span className="text-xs mt-1">{data.date.split('-')[2]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Coverage by Test Suite</CardTitle>
              <CardDescription>
                Detailed coverage analysis for each integration test suite
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testSuites.map((suite) => (
                  <div key={suite.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{suite.name}</span>
                      <span>{suite.coverage}%</span>
                    </div>
                    <Progress value={suite.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Test execution performance and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Execution Time by Suite</h4>
                  <div className="space-y-3">
                    {testSuites.map((suite) => (
                      <div key={suite.id} className="flex items-center justify-between">
                        <span className="text-sm">{suite.name.replace(' Integration Tests', '')}</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className="bg-purple-200 h-2 rounded"
                            style={{ width: `${(suite.duration / 250) * 100}px` }}
                          />
                          <span className="text-sm font-medium">{suite.duration}s</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Performance Insights</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>All test suites under 5 minute threshold</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Coverage targets met across all suites</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>Cross-client analytics tests taking longest</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>Overall performance improving week over week</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}