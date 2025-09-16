'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  PlayIcon,
  SettingsIcon,
  FileTextIcon,
  CodeIcon,
  BugIcon,
  ShieldIcon,
  TrendingUpIcon,
  ClockIcon
} from 'lucide-react';

interface QualityMetrics {
  lintErrors: number;
  lintWarnings: number;
  typeErrors: number;
  codeSmells: number;
  duplicateLines: number;
  testCoverage: number;
  maintainabilityIndex: number;
  technicalDebt: number;
  securityHotspots: number;
  lastScan: string;
}

interface LintingRule {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  count: number;
  category: string;
  fixable: boolean;
}

interface CodeQualityGate {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  threshold: number;
  current: number;
  unit: string;
  description: string;
}

export default function CodeQualityPage() {
  const [metrics, setMetrics] = useState<QualityMetrics>({
    lintErrors: 1,
    lintWarnings: 287,
    typeErrors: 2,
    codeSmells: 12,
    duplicateLines: 156,
    testCoverage: 73,
    maintainabilityIndex: 85,
    technicalDebt: 4.2,
    securityHotspots: 0,
    lastScan: '5 minutes ago'
  });

  const [lintingRules, setLintingRules] = useState<LintingRule[]>([
    {
      rule: '@typescript-eslint/no-unused-vars',
      severity: 'warning',
      count: 89,
      category: 'TypeScript',
      fixable: true
    },
    {
      rule: '@typescript-eslint/no-explicit-any',
      severity: 'warning',
      count: 67,
      category: 'TypeScript',
      fixable: false
    },
    {
      rule: '@typescript-eslint/prefer-nullish-coalescing',
      severity: 'warning',
      count: 45,
      category: 'TypeScript',
      fixable: true
    },
    {
      rule: 'react/no-unescaped-entities',
      severity: 'error',
      count: 1,
      category: 'React',
      fixable: true
    },
    {
      rule: '@next/next/no-img-element',
      severity: 'warning',
      count: 23,
      category: 'Next.js',
      fixable: false
    },
    {
      rule: 'jsx-a11y/alt-text',
      severity: 'warning',
      count: 15,
      category: 'Accessibility',
      fixable: false
    }
  ]);

  const [qualityGates, setQualityGates] = useState<CodeQualityGate[]>([
    {
      name: 'Code Coverage',
      status: 'passed',
      threshold: 70,
      current: 73,
      unit: '%',
      description: 'Test coverage should be above 70%'
    },
    {
      name: 'Technical Debt',
      status: 'passed',
      threshold: 5.0,
      current: 4.2,
      unit: 'days',
      description: 'Technical debt should be below 5 days'
    },
    {
      name: 'Maintainability Index',
      status: 'passed',
      threshold: 80,
      current: 85,
      unit: 'score',
      description: 'Maintainability index should be above 80'
    },
    {
      name: 'Lint Errors',
      status: 'warning',
      threshold: 0,
      current: 1,
      unit: 'errors',
      description: 'No linting errors allowed'
    },
    {
      name: 'Type Errors',
      status: 'warning',
      threshold: 0,
      current: 2,
      unit: 'errors',
      description: 'No TypeScript errors allowed'
    },
    {
      name: 'Security Hotspots',
      status: 'passed',
      threshold: 0,
      current: 0,
      unit: 'issues',
      description: 'No security hotspots allowed'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const getStatusIcon = (status: 'passed' | 'failed' | 'warning') => {
    switch (status) {
      case 'passed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'passed' | 'failed' | 'warning') => {
    const variants = {
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary'
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getSeverityBadge = (severity: 'error' | 'warning' | 'info') => {
    const variants = {
      error: 'destructive',
      warning: 'secondary',
      info: 'outline'
    } as const;

    return <Badge variant={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const runQualityCheck = () => {
    setIsRunning(true);

    setTimeout(() => {
      setMetrics(prev => ({
        ...prev,
        lastScan: 'Just now',
        lintWarnings: Math.max(0, prev.lintWarnings - Math.floor(Math.random() * 20)),
        lintErrors: Math.max(0, prev.lintErrors - Math.floor(Math.random() * 2)),
        typeErrors: Math.max(0, prev.typeErrors - Math.floor(Math.random() * 3))
      }));
      setIsRunning(false);
    }, 5000);
  };

  const fixAutofixableIssues = () => {
    setIsRunning(true);

    setTimeout(() => {
      setLintingRules(prev => prev.map(rule => ({
        ...rule,
        count: rule.fixable ? Math.max(0, rule.count - Math.floor(rule.count * 0.8)) : rule.count
      })));
      setIsRunning(false);
    }, 3000);
  };

  const getQualityScore = () => {
    const totalGates = qualityGates.length;
    const passedGates = qualityGates.filter(gate => gate.status === 'passed').length;
    return Math.round((passedGates / totalGates) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Code Quality & Linting Tools</h1>
          <p className="text-muted-foreground">
            Automated code quality monitoring with linting, formatting, and analysis
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fixAutofixableIssues}
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <SettingsIcon className="h-4 w-4" />
            Auto-fix Issues
          </Button>
          <Button
            onClick={runQualityCheck}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            Run Quality Check
          </Button>
        </div>
      </div>

      {/* Quality Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getQualityScore()}%</div>
            <Progress value={getQualityScore()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Overall quality rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Lint Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.lintErrors + metrics.lintWarnings}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.lintErrors} errors, {metrics.lintWarnings} warnings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Type Safety</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.typeErrors === 0 ? (
                <span className="text-green-600">✓</span>
              ) : (
                <span className="text-red-600">{metrics.typeErrors}</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">TypeScript errors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintainability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.maintainabilityIndex}</div>
            <p className="text-xs text-muted-foreground">Maintainability index</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="linting">Linting Rules</TabsTrigger>
          <TabsTrigger value="gates">Quality Gates</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BugIcon className="h-5 w-5" />
                  Code Issues Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Lint Errors</span>
                    <Badge variant="destructive">{metrics.lintErrors}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Lint Warnings</span>
                    <Badge variant="secondary">{metrics.lintWarnings}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Type Errors</span>
                    <Badge variant="destructive">{metrics.typeErrors}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Code Smells</span>
                    <Badge variant="outline">{metrics.codeSmells}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Duplicate Lines</span>
                    <Badge variant="outline">{metrics.duplicateLines}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Quality Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Test Coverage</span>
                      <span>{metrics.testCoverage}%</span>
                    </div>
                    <Progress value={metrics.testCoverage} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Maintainability Index</span>
                      <span>{metrics.maintainabilityIndex}</span>
                    </div>
                    <Progress value={metrics.maintainabilityIndex} />
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Technical Debt: </span>
                    <span className="text-muted-foreground">{metrics.technicalDebt} days</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Security Hotspots: </span>
                    <span className="text-muted-foreground">{metrics.securityHotspots}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="linting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CodeIcon className="h-5 w-5" />
                Linting Rules Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lintingRules.map((rule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{rule.rule}</code>
                        {getSeverityBadge(rule.severity)}
                        {rule.fixable && <Badge variant="outline">Auto-fixable</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{rule.category} • {rule.count} occurrences</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{rule.count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5" />
                Quality Gates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {qualityGates.map((gate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(gate.status)}
                      <div>
                        <div className="font-medium">{gate.name}</div>
                        <p className="text-sm text-muted-foreground">{gate.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{gate.current}{gate.unit}</span>
                        {getStatusBadge(gate.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {gate.threshold}{gate.unit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Code Analysis Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Lines of Code</span>
                    <span className="font-medium">45,678</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cyclomatic Complexity</span>
                    <span className="font-medium">2.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Code Ratio</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comment Lines</span>
                    <span className="font-medium">8,934</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comment Density</span>
                    <span className="font-medium">19.6%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Quality Score Trend</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUpIcon className="h-3 w-3" />
                      <span>+5%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Issues Resolved</span>
                    <span className="font-medium text-green-600">+127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Issues</span>
                    <span className="font-medium text-red-600">+23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Coverage Change</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUpIcon className="h-3 w-3" />
                      <span>+2.1%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Automation Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Pre-commit Hooks</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ESLint check</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Prettier formatting</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>TypeScript check</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Test validation</span>
                      <Badge variant="secondary">Optional</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">CI/CD Integration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quality gates</span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-fix PRs</span>
                      <Badge variant="secondary">Scheduled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Quality reports</span>
                      <Badge variant="default">Daily</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security scans</span>
                      <Badge variant="default">Weekly</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-700">
                  <ClockIcon className="h-4 w-4 inline mr-1" />
                  Last automated scan: {metrics.lastScan} • Next scheduled scan: in 2 hours
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}