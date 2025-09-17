'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';

interface QualityCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  category: 'code' | 'security' | 'performance' | 'accessibility';
  severity: 'critical' | 'high' | 'medium' | 'low';
  lastRun: string;
  duration: number;
  details?: string;
}

interface QualityGate {
  id: string;
  name: string;
  description: string;
  checks: string[];
  status: 'passed' | 'failed' | 'pending';
  passRate: number;
  threshold: number;
}

export default function QualityAssurancePage() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<string | null>(null);

  const qualityChecks: QualityCheck[] = [
    {
      id: 'lint',
      name: 'Code Linting',
      description: 'ESLint and Prettier code quality checks',
      status: 'passed',
      category: 'code',
      severity: 'high',
      lastRun: '2 minutes ago',
      duration: 15,
      details: 'All linting rules passed. 0 errors, 0 warnings.'
    },
    {
      id: 'typecheck',
      name: 'TypeScript Type Checking',
      description: 'TypeScript compiler checks for type safety',
      status: 'passed',
      category: 'code',
      severity: 'critical',
      lastRun: '2 minutes ago',
      duration: 30,
      details: 'Type checking completed successfully. 0 type errors found.'
    },
    {
      id: 'security',
      name: 'Security Vulnerability Scan',
      description: 'Automated security vulnerability detection',
      status: 'passed',
      category: 'security',
      severity: 'critical',
      lastRun: '5 minutes ago',
      duration: 45,
      details: 'No security vulnerabilities detected in dependencies.'
    },
    {
      id: 'performance',
      name: 'Performance Benchmarks',
      description: 'Core web vitals and performance metrics',
      status: 'passed',
      category: 'performance',
      severity: 'medium',
      lastRun: '10 minutes ago',
      duration: 60,
      details: 'Performance scores: LCP: 1.2s, FID: 85ms, CLS: 0.05'
    },
    {
      id: 'accessibility',
      name: 'Accessibility Compliance',
      description: 'WCAG 2.1 accessibility standards validation',
      status: 'passed',
      category: 'accessibility',
      severity: 'high',
      lastRun: '15 minutes ago',
      duration: 25,
      details: 'WCAG 2.1 AA compliance verified. No accessibility issues found.'
    },
    {
      id: 'unit-tests',
      name: 'Unit Test Coverage',
      description: 'Jest unit test execution and coverage analysis',
      status: 'passed',
      category: 'code',
      severity: 'high',
      lastRun: '3 minutes ago',
      duration: 90,
      details: 'Test coverage: 92% lines, 88% branches, 95% functions'
    }
  ];

  const qualityGates: QualityGate[] = [
    {
      id: 'code-quality',
      name: 'Code Quality Gate',
      description: 'Essential code quality checks that must pass',
      checks: ['lint', 'typecheck', 'unit-tests'],
      status: 'passed',
      passRate: 100,
      threshold: 95
    },
    {
      id: 'security-gate',
      name: 'Security Gate',
      description: 'Security validation and vulnerability checks',
      checks: ['security'],
      status: 'passed',
      passRate: 100,
      threshold: 100
    },
    {
      id: 'performance-gate',
      name: 'Performance Gate',
      description: 'Performance and accessibility standards',
      checks: ['performance', 'accessibility'],
      status: 'passed',
      passRate: 100,
      threshold: 80
    }
  ];

  const runAllChecks = async () => {
    setIsRunning(true);
    // Simulate running quality checks
    setTimeout(() => {
      setIsRunning(false);
    }, 3000);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'code':
        return 'bg-blue-100 text-blue-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      case 'performance':
        return 'bg-green-100 text-green-800';
      case 'accessibility':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallPassRate = Math.round(
    (qualityChecks.filter(check => check.status === 'passed').length / qualityChecks.length) * 100
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Assurance System</h1>
          <p className="text-muted-foreground">
            Automated quality checks, validation, and quality gates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runAllChecks}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run All Checks
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Quality</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPassRate}%</div>
            <Progress value={overallPassRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checks Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityChecks.filter(check => check.status === 'passed').length}/{qualityChecks.length}
            </div>
            <p className="text-xs text-muted-foreground">Quality checks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gates Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qualityGates.filter(gate => gate.status === 'passed').length}/{qualityGates.length}
            </div>
            <p className="text-xs text-muted-foreground">Quality gates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Run</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2m</div>
            <p className="text-xs text-muted-foreground">Minutes ago</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Quality Checks</TabsTrigger>
          <TabsTrigger value="gates">Quality Gates</TabsTrigger>
          <TabsTrigger value="automation">Automation Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <div className="grid gap-4">
            {qualityChecks.map((check) => (
              <Card key={check.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(check.status)}
                      <CardTitle className="text-lg">{check.name}</CardTitle>
                      <Badge className={getCategoryColor(check.category)}>
                        {check.category}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(check.severity)}`}
                           title={`${check.severity} severity`} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {check.lastRun} • {check.duration}s
                    </div>
                  </div>
                  <CardDescription>{check.description}</CardDescription>
                </CardHeader>
                {check.details && (
                  <CardContent>
                    <div className="text-sm bg-muted p-2 rounded">
                      {check.details}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gates" className="space-y-4">
          <div className="grid gap-4">
            {qualityGates.map((gate) => (
              <Card key={gate.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(gate.status)}
                      <CardTitle className="text-lg">{gate.name}</CardTitle>
                      <Badge variant={gate.status === 'passed' ? 'default' : 'destructive'}>
                        {gate.passRate}% pass rate
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Threshold: {gate.threshold}%
                    </div>
                  </div>
                  <CardDescription>{gate.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quality Gate Progress</span>
                      <span>{gate.passRate}%</span>
                    </div>
                    <Progress value={gate.passRate} className="h-2" />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {gate.checks.map((checkId) => {
                        const check = qualityChecks.find(c => c.id === checkId);
                        return (
                          <Badge key={checkId} variant="outline" className="text-xs">
                            {check?.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Configuration</CardTitle>
              <CardDescription>
                Configure automated quality assurance settings and triggers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Trigger Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>On code commit</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>On pull request</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled runs</span>
                      <Badge variant="outline">Every 4 hours</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>On deployment</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Quality Thresholds</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Code quality gate</span>
                      <Badge variant="outline">95%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security gate</span>
                      <Badge variant="outline">100%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance gate</span>
                      <Badge variant="outline">80%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Test coverage</span>
                      <Badge variant="outline">90%</Badge>
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