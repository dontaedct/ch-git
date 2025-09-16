'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlayIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BarChart3Icon,
  FileTextIcon,
  ShieldCheckIcon
} from 'lucide-react';

interface TestSuite {
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'performance';
  status: 'idle' | 'running' | 'passed' | 'failed';
  coverage: number;
  duration: number;
  testsCount: number;
  passedCount: number;
  failedCount: number;
  lastRun: string;
}

interface TestingMetrics {
  totalCoverage: number;
  totalTests: number;
  passRate: number;
  avgDuration: number;
  criticalIssues: number;
}

export default function TestingAutomationPage() {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      name: 'Unit Tests',
      type: 'unit',
      status: 'passed',
      coverage: 85,
      duration: 12.3,
      testsCount: 247,
      passedCount: 245,
      failedCount: 2,
      lastRun: '2 minutes ago'
    },
    {
      name: 'Integration Tests',
      type: 'integration',
      status: 'passed',
      coverage: 78,
      duration: 45.7,
      testsCount: 89,
      passedCount: 87,
      failedCount: 2,
      lastRun: '5 minutes ago'
    },
    {
      name: 'E2E Tests',
      type: 'e2e',
      status: 'running',
      coverage: 65,
      duration: 123.4,
      testsCount: 34,
      passedCount: 30,
      failedCount: 1,
      lastRun: 'Running now'
    },
    {
      name: 'Performance Tests',
      type: 'performance',
      status: 'idle',
      coverage: 45,
      duration: 89.2,
      testsCount: 15,
      passedCount: 14,
      failedCount: 1,
      lastRun: '1 hour ago'
    }
  ]);

  const [metrics, setMetrics] = useState<TestingMetrics>({
    totalCoverage: 73,
    totalTests: 385,
    passRate: 96.8,
    avgDuration: 67.7,
    criticalIssues: 3
  });

  const [isRunningAll, setIsRunningAll] = useState(false);

  const getStatusIcon = (status: TestSuite['status']) => {
    switch (status) {
      case 'running':
        return <RefreshCwIcon className="h-4 w-4 animate-spin text-yellow-500" />;
      case 'passed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestSuite['status']) => {
    const variants = {
      running: 'secondary',
      passed: 'default',
      failed: 'destructive',
      idle: 'outline'
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const runTestSuite = (index: number) => {
    setTestSuites(prev => prev.map((suite, i) =>
      i === index ? { ...suite, status: 'running' as const } : suite
    ));

    // Simulate test execution
    setTimeout(() => {
      setTestSuites(prev => prev.map((suite, i) =>
        i === index ? {
          ...suite,
          status: Math.random() > 0.2 ? 'passed' as const : 'failed' as const,
          lastRun: 'Just now'
        } : suite
      ));
    }, 3000);
  };

  const runAllTests = () => {
    setIsRunningAll(true);
    setTestSuites(prev => prev.map(suite => ({ ...suite, status: 'running' as const })));

    setTimeout(() => {
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        status: Math.random() > 0.15 ? 'passed' as const : 'failed' as const,
        lastRun: 'Just now'
      })));
      setIsRunningAll(false);
    }, 8000);
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 80) return 'text-green-600';
    if (coverage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Testing Automation Dashboard</h1>
          <p className="text-muted-foreground">
            Automated testing framework with comprehensive coverage tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllTests}
            disabled={isRunningAll}
            className="flex items-center gap-2"
          >
            {isRunningAll ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            Run All Tests
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCoverage}%</div>
            <Progress value={metrics.totalCoverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTests}</div>
            <p className="text-xs text-muted-foreground">Across all suites</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.passRate}%</div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgDuration}s</div>
            <p className="text-xs text-muted-foreground">Execution time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="space-y-4">
        <TabsList>
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Report</TabsTrigger>
          <TabsTrigger value="automation">Automation Config</TabsTrigger>
          <TabsTrigger value="reports">Test Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {testSuites.map((suite, index) => (
              <Card key={suite.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(suite.status)}
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      {getStatusBadge(suite.status)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runTestSuite(index)}
                      disabled={suite.status === 'running'}
                    >
                      {suite.status === 'running' ? 'Running...' : 'Run Tests'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Coverage</p>
                      <p className={`font-semibold ${getCoverageColor(suite.coverage)}`}>
                        {suite.coverage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tests</p>
                      <p className="font-semibold">
                        {suite.passedCount}/{suite.testsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-semibold">{suite.duration}s</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Run</p>
                      <p className="font-semibold">{suite.lastRun}</p>
                    </div>
                  </div>
                  {suite.failedCount > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        {suite.failedCount} test(s) failed - Review required
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon className="h-5 w-5" />
                Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="font-medium">Statements</p>
                    <Progress value={85} />
                    <p className="text-sm text-muted-foreground">85% covered</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Branches</p>
                    <Progress value={78} />
                    <p className="text-sm text-muted-foreground">78% covered</p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Functions</p>
                    <Progress value={92} />
                    <p className="text-sm text-muted-foreground">92% covered</p>
                  </div>
                </div>
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Files with Low Coverage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <span className="text-sm">components/advanced-form.tsx</span>
                      <Badge variant="secondary">45%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-red-50 border border-red-200 rounded">
                      <span className="text-sm">utils/data-processing.ts</span>
                      <Badge variant="destructive">32%</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Automation Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Continuous Integration</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Auto-run on push</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>PR validation</span>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Coverage threshold</span>
                        <span className="font-medium">70%</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Test Scheduling</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Nightly runs</span>
                        <Badge variant="default">2:00 AM</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance tests</span>
                        <Badge variant="secondary">Weekly</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Security scans</span>
                        <Badge variant="default">Daily</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Test Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Latest Coverage Report</p>
                    <p className="text-sm text-muted-foreground">Generated 5 minutes ago</p>
                  </div>
                  <Button variant="outline" size="sm">View Report</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Performance Test Results</p>
                    <p className="text-sm text-muted-foreground">Generated 1 hour ago</p>
                  </div>
                  <Button variant="outline" size="sm">View Report</Button>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">Security Scan Report</p>
                    <p className="text-sm text-muted-foreground">Generated 3 hours ago</p>
                  </div>
                  <Button variant="outline" size="sm">View Report</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}