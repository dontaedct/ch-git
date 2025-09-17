'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Play, Pause, RefreshCw, Clock, Target, Zap, Shield } from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'running' | 'pending';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  coverage: number;
  lastRun: string;
  environment: string;
}

interface TestResult {
  id: string;
  testName: string;
  suite: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
}

export default function TestingAutomationPage() {
  const [isRunningAll, setIsRunningAll] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const testSuites: TestSuite[] = [
    {
      id: 'unit',
      name: 'Unit Tests',
      description: 'Component and function unit testing with Jest',
      type: 'unit',
      status: 'passed',
      totalTests: 247,
      passedTests: 243,
      failedTests: 0,
      skippedTests: 4,
      duration: 45,
      coverage: 92,
      lastRun: '2 minutes ago',
      environment: 'Node.js'
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      description: 'API and database integration testing',
      type: 'integration',
      status: 'passed',
      totalTests: 87,
      passedTests: 85,
      failedTests: 0,
      skippedTests: 2,
      duration: 120,
      coverage: 85,
      lastRun: '5 minutes ago',
      environment: 'Docker'
    },
    {
      id: 'e2e',
      name: 'End-to-End Tests',
      description: 'Full user journey testing with Playwright',
      type: 'e2e',
      status: 'passed',
      totalTests: 42,
      passedTests: 40,
      failedTests: 0,
      skippedTests: 2,
      duration: 180,
      coverage: 78,
      lastRun: '10 minutes ago',
      environment: 'Chrome'
    },
    {
      id: 'performance',
      name: 'Performance Tests',
      description: 'Load testing and performance benchmarks',
      type: 'performance',
      status: 'passed',
      totalTests: 15,
      passedTests: 14,
      failedTests: 0,
      skippedTests: 1,
      duration: 300,
      coverage: 95,
      lastRun: '30 minutes ago',
      environment: 'Production-like'
    },
    {
      id: 'security',
      name: 'Security Tests',
      description: 'Security vulnerability and penetration testing',
      type: 'security',
      status: 'passed',
      totalTests: 28,
      passedTests: 27,
      failedTests: 0,
      skippedTests: 1,
      duration: 240,
      coverage: 88,
      lastRun: '1 hour ago',
      environment: 'Isolated'
    }
  ];

  const recentTestResults: TestResult[] = [
    {
      id: '1',
      testName: 'Authentication flow validation',
      suite: 'e2e',
      status: 'passed',
      duration: 2.3
    },
    {
      id: '2',
      testName: 'API rate limiting checks',
      suite: 'security',
      status: 'passed',
      duration: 1.8
    },
    {
      id: '3',
      testName: 'Database connection pooling',
      suite: 'performance',
      status: 'passed',
      duration: 5.2
    },
    {
      id: '4',
      testName: 'Form validation logic',
      suite: 'unit',
      status: 'passed',
      duration: 0.1
    },
    {
      id: '5',
      testName: 'Payment processing flow',
      suite: 'integration',
      status: 'passed',
      duration: 3.7
    }
  ];

  const runAllTests = async () => {
    setIsRunningAll(true);
    setTimeout(() => {
      setIsRunningAll(false);
    }, 5000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'unit':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'integration':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'e2e':
        return <Play className="h-4 w-4 text-purple-500" />;
      case 'performance':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      default:
        return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'unit':
        return 'bg-blue-100 text-blue-800';
      case 'integration':
        return 'bg-orange-100 text-orange-800';
      case 'e2e':
        return 'bg-purple-100 text-purple-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const totalFailed = testSuites.reduce((sum, suite) => sum + suite.failedTests, 0);
  const overallPassRate = Math.round((totalPassed / totalTests) * 100);
  const averageCoverage = Math.round(
    testSuites.reduce((sum, suite) => sum + suite.coverage, 0) / testSuites.length
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Testing Automation</h1>
          <p className="text-muted-foreground">
            End-to-end testing, performance testing, and security testing automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPassRate}%</div>
            <Progress value={overallPassRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">
              {totalPassed} passed, {totalFailed} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Coverage</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageCoverage}%</div>
            <Progress value={averageCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
            <Zap className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testSuites.length}</div>
            <p className="text-xs text-muted-foreground">Active test suites</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="results">Recent Results</TabsTrigger>
          <TabsTrigger value="automation">Automation Config</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map((suite) => (
              <Card key={suite.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(suite.type)}
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      <Badge className={getTypeColor(suite.type)}>
                        {suite.type}
                      </Badge>
                      {getStatusIcon(suite.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suite.lastRun} • {suite.duration}s
                    </div>
                  </div>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{suite.passedTests}</div>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{suite.failedTests}</div>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{suite.skippedTests}</div>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{suite.coverage}%</div>
                      <p className="text-xs text-muted-foreground">Coverage</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Test Progress</span>
                      <span>{Math.round((suite.passedTests / suite.totalTests) * 100)}%</span>
                    </div>
                    <Progress value={(suite.passedTests / suite.totalTests) * 100} className="h-2" />
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <Badge variant="outline">{suite.environment}</Badge>
                    <Button variant="outline" size="sm">
                      Run Suite
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Results</CardTitle>
              <CardDescription>Latest test executions across all suites</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTestResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(result.status)}
                      <span className="font-medium">{result.testName}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.suite}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {result.duration}s
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Triggers</CardTitle>
                <CardDescription>Configure when tests run automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>On code push</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>On pull request</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled (nightly)</span>
                    <Badge variant="outline">2:00 AM UTC</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Before deployment</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>On security alerts</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Configuration</CardTitle>
                <CardDescription>Testing framework and environment settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Unit Test Framework</span>
                    <Badge variant="outline">Jest</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>E2E Framework</span>
                    <Badge variant="outline">Playwright</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance Tool</span>
                    <Badge variant="outline">Lighthouse</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security Scanner</span>
                    <Badge variant="outline">OWASP ZAP</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Coverage Threshold</span>
                    <Badge variant="outline">90%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pipeline Integration</CardTitle>
              <CardDescription>Testing automation in CI/CD pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">Build</div>
                  <p className="text-sm text-muted-foreground">Unit tests run</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-orange-600">Test</div>
                  <p className="text-sm text-muted-foreground">Integration & E2E</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">Deploy</div>
                  <p className="text-sm text-muted-foreground">Performance & Security</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}