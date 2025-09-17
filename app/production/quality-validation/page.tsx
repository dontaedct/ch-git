'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Shield,
  Target,
  Zap,
  Clock,
  FileCheck,
  Settings,
  TestTube,
  Activity
} from 'lucide-react';

interface ValidationRule {
  id: string;
  name: string;
  description: string;
  category: 'code' | 'security' | 'performance' | 'accessibility' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'passed' | 'failed' | 'warning' | 'pending';
  automated: boolean;
  lastRun: string;
  threshold: string;
  currentValue: string;
}

interface ValidationSuite {
  id: string;
  name: string;
  description: string;
  rules: string[];
  status: 'passed' | 'failed' | 'running' | 'pending';
  passRate: number;
  lastRun: string;
  duration: number;
  required: boolean;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  type: 'smoke' | 'regression' | 'integration' | 'performance' | 'security';
  status: 'passed' | 'failed' | 'running' | 'pending';
  steps: number;
  completedSteps: number;
  duration: number;
  lastRun: string;
}

export default function QualityValidationPage() {
  const [isRunningValidation, setIsRunningValidation] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<string | null>(null);

  const validationRules: ValidationRule[] = [
    {
      id: 'code-standards',
      name: 'Code Standards Compliance',
      description: 'ESLint rules and coding standards validation',
      category: 'code',
      severity: 'high',
      status: 'passed',
      automated: true,
      lastRun: '2 minutes ago',
      threshold: '0 errors',
      currentValue: '0 errors'
    },
    {
      id: 'type-safety',
      name: 'TypeScript Type Safety',
      description: 'Type checking and type safety validation',
      category: 'code',
      severity: 'critical',
      status: 'passed',
      automated: true,
      lastRun: '2 minutes ago',
      threshold: '0 type errors',
      currentValue: '0 type errors'
    },
    {
      id: 'security-headers',
      name: 'Security Headers Validation',
      description: 'HTTP security headers and configuration validation',
      category: 'security',
      severity: 'critical',
      status: 'passed',
      automated: true,
      lastRun: '5 minutes ago',
      threshold: 'All required headers',
      currentValue: 'All headers present'
    },
    {
      id: 'performance-budget',
      name: 'Performance Budget Validation',
      description: 'Bundle size and performance metrics validation',
      category: 'performance',
      severity: 'high',
      status: 'passed',
      automated: true,
      lastRun: '10 minutes ago',
      threshold: '<2MB bundle',
      currentValue: '1.8MB bundle'
    },
    {
      id: 'accessibility-standards',
      name: 'Accessibility Standards',
      description: 'WCAG 2.1 accessibility compliance validation',
      category: 'accessibility',
      severity: 'high',
      status: 'passed',
      automated: true,
      lastRun: '15 minutes ago',
      threshold: 'WCAG 2.1 AA',
      currentValue: 'Compliant'
    },
    {
      id: 'api-validation',
      name: 'API Contract Validation',
      description: 'API schema and contract validation',
      category: 'compliance',
      severity: 'medium',
      status: 'passed',
      automated: true,
      lastRun: '20 minutes ago',
      threshold: 'OpenAPI 3.0 compliant',
      currentValue: 'Compliant'
    }
  ];

  const validationSuites: ValidationSuite[] = [
    {
      id: 'pre-commit',
      name: 'Pre-commit Validation',
      description: 'Essential validations before code commit',
      rules: ['code-standards', 'type-safety'],
      status: 'passed',
      passRate: 100,
      lastRun: '2 minutes ago',
      duration: 30,
      required: true
    },
    {
      id: 'security-validation',
      name: 'Security Validation Suite',
      description: 'Comprehensive security validation checks',
      rules: ['security-headers'],
      status: 'passed',
      passRate: 100,
      lastRun: '5 minutes ago',
      duration: 45,
      required: true
    },
    {
      id: 'performance-validation',
      name: 'Performance Validation Suite',
      description: 'Performance and optimization validation',
      rules: ['performance-budget'],
      status: 'passed',
      passRate: 100,
      lastRun: '10 minutes ago',
      duration: 60,
      required: false
    },
    {
      id: 'compliance-validation',
      name: 'Compliance Validation Suite',
      description: 'Accessibility and API compliance validation',
      rules: ['accessibility-standards', 'api-validation'],
      status: 'passed',
      passRate: 100,
      lastRun: '15 minutes ago',
      duration: 40,
      required: false
    }
  ];

  const testScenarios: TestScenario[] = [
    {
      id: 'smoke-test',
      name: 'Smoke Test Suite',
      description: 'Basic functionality validation',
      type: 'smoke',
      status: 'passed',
      steps: 12,
      completedSteps: 12,
      duration: 180,
      lastRun: '5 minutes ago'
    },
    {
      id: 'regression-test',
      name: 'Regression Test Suite',
      description: 'Full application regression testing',
      type: 'regression',
      status: 'passed',
      steps: 47,
      completedSteps: 47,
      duration: 420,
      lastRun: '30 minutes ago'
    },
    {
      id: 'integration-test',
      name: 'Integration Test Suite',
      description: 'API and service integration testing',
      type: 'integration',
      status: 'passed',
      steps: 23,
      completedSteps: 23,
      duration: 240,
      lastRun: '1 hour ago'
    },
    {
      id: 'performance-test',
      name: 'Performance Test Suite',
      description: 'Load and performance testing',
      type: 'performance',
      status: 'passed',
      steps: 8,
      completedSteps: 8,
      duration: 600,
      lastRun: '2 hours ago'
    }
  ];

  const runValidation = async () => {
    setIsRunningValidation(true);
    setTimeout(() => {
      setIsRunningValidation(false);
    }, 4000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'code':
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'security':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'performance':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'accessibility':
        return <Target className="h-4 w-4 text-purple-500" />;
      case 'compliance':
        return <Settings className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
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
      case 'compliance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'smoke':
        return 'bg-green-100 text-green-800';
      case 'regression':
        return 'bg-blue-100 text-blue-800';
      case 'integration':
        return 'bg-orange-100 text-orange-800';
      case 'performance':
        return 'bg-purple-100 text-purple-800';
      case 'security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallPassRate = Math.round(
    (validationRules.filter(rule => rule.status === 'passed').length / validationRules.length) * 100
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Validation & Testing</h1>
          <p className="text-muted-foreground">
            Quality validation, testing automation, and quality assurance
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={runValidation}
            disabled={isRunningValidation}
            className="flex items-center gap-2"
          >
            {isRunningValidation ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Running Validation...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Full Validation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Pass Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallPassRate}%</div>
            <Progress value={overallPassRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Rules</CardTitle>
            <FileCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {validationRules.filter(rule => rule.automated).length} automated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Suites</CardTitle>
            <TestTube className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{validationSuites.length}</div>
            <p className="text-xs text-muted-foreground">
              {validationSuites.filter(suite => suite.required).length} required
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Scenarios</CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testScenarios.length}</div>
            <p className="text-xs text-muted-foreground">
              {testScenarios.reduce((sum, scenario) => sum + scenario.steps, 0)} total steps
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="suites">Validation Suites</TabsTrigger>
          <TabsTrigger value="scenarios">Test Scenarios</TabsTrigger>
          <TabsTrigger value="automation">Automation Config</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-4">
            {validationRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(rule.category)}
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <Badge className={getCategoryColor(rule.category)}>
                        {rule.category}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(rule.severity)}`}
                           title={`${rule.severity} severity`} />
                      {rule.automated && (
                        <Badge variant="outline" className="text-xs">
                          Automated
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rule.status)}
                      <span className="text-sm text-muted-foreground">
                        {rule.lastRun}
                      </span>
                    </div>
                  </div>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium">Threshold</div>
                      <div className="text-sm text-muted-foreground">{rule.threshold}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Current Value</div>
                      <div className="text-sm text-muted-foreground">{rule.currentValue}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suites" className="space-y-4">
          <div className="grid gap-4">
            {validationSuites.map((suite) => (
              <Card key={suite.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-purple-500" />
                      <CardTitle className="text-lg">{suite.name}</CardTitle>
                      {suite.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                      {getStatusIcon(suite.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {suite.lastRun} • {suite.duration}s
                    </div>
                  </div>
                  <CardDescription>{suite.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pass Rate</span>
                        <span>{suite.passRate}%</span>
                      </div>
                      <Progress value={suite.passRate} className="h-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Included Rules</div>
                      <div className="flex flex-wrap gap-1">
                        {suite.rules.map((ruleId) => {
                          const rule = validationRules.find(r => r.id === ruleId);
                          return (
                            <Badge key={ruleId} variant="outline" className="text-xs">
                              {rule?.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="grid gap-4">
            {testScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-500" />
                      <CardTitle className="text-lg">{scenario.name}</CardTitle>
                      <Badge className={getTypeColor(scenario.type)}>
                        {scenario.type}
                      </Badge>
                      {getStatusIcon(scenario.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scenario.lastRun} • {Math.floor(scenario.duration / 60)}m {scenario.duration % 60}s
                    </div>
                  </div>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Test Progress</span>
                        <span>{scenario.completedSteps}/{scenario.steps} steps</span>
                      </div>
                      <Progress value={(scenario.completedSteps / scenario.steps) * 100} className="h-2" />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {scenario.steps} test steps • {scenario.type} testing
                      </div>
                      <Button variant="outline" size="sm">
                        Run Scenario
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Validation Triggers</CardTitle>
                <CardDescription>Configure when validation runs automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pre-commit hooks</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pull request validation</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Scheduled validation</span>
                    <Badge variant="outline">Every 6 hours</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Pre-deployment validation</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security alert triggers</span>
                    <Badge variant="outline">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Gates</CardTitle>
                <CardDescription>Quality gate configuration and thresholds</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Code quality gate</span>
                    <Badge variant="outline">Pass rate ≥ 95%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Security gate</span>
                    <Badge variant="outline">No critical issues</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Performance gate</span>
                    <Badge variant="outline">Budget ≤ 2MB</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Accessibility gate</span>
                    <Badge variant="outline">WCAG 2.1 AA</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Compliance gate</span>
                    <Badge variant="outline">API spec compliant</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Validation Pipeline</CardTitle>
              <CardDescription>Quality validation workflow and stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">Code</div>
                  <p className="text-sm text-muted-foreground">Standards & Types</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-red-600">Security</div>
                  <p className="text-sm text-muted-foreground">Headers & Vulnerabilities</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">Performance</div>
                  <p className="text-sm text-muted-foreground">Budget & Optimization</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">Compliance</div>
                  <p className="text-sm text-muted-foreground">Accessibility & API</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}