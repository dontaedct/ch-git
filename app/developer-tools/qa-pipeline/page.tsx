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
  PauseIcon,
  SettingsIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon,
  GitBranchIcon,
  BuildIcon,
  TestTubeIcon,
  ShieldCheckIcon,
  QualityIcon,
  BarChart3Icon,
  FilterIcon,
  WorkflowIcon
} from 'lucide-react';

interface PipelineStage {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  tests: number;
  passed: number;
  failed: number;
  coverage: number;
  lastRun: string;
}

interface QualityGate {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  threshold: number;
  current: number;
  unit: string;
  category: 'code' | 'testing' | 'security' | 'performance';
  blocking: boolean;
}

interface PipelineMetrics {
  totalRuns: number;
  successRate: number;
  averageDuration: number;
  qualityScore: number;
  issuesBlocked: number;
  issuesResolved: number;
  deploymentFrequency: number;
  lastUpdate: string;
}

export default function QAPipelinePage() {
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([
    {
      name: 'Code Quality',
      status: 'passed',
      duration: 45,
      tests: 0,
      passed: 0,
      failed: 0,
      coverage: 0,
      lastRun: '5 minutes ago'
    },
    {
      name: 'Unit Testing',
      status: 'passed',
      duration: 120,
      tests: 96,
      passed: 95,
      failed: 1,
      coverage: 73,
      lastRun: '5 minutes ago'
    },
    {
      name: 'Integration Testing',
      status: 'passed',
      duration: 180,
      tests: 36,
      passed: 36,
      failed: 0,
      coverage: 65,
      lastRun: '5 minutes ago'
    },
    {
      name: 'Security Scan',
      status: 'warning',
      duration: 300,
      tests: 30,
      passed: 27,
      failed: 3,
      coverage: 90,
      lastRun: '2 hours ago'
    },
    {
      name: 'Performance Testing',
      status: 'passed',
      duration: 480,
      tests: 15,
      passed: 14,
      failed: 1,
      coverage: 85,
      lastRun: '1 hour ago'
    },
    {
      name: 'E2E Testing',
      status: 'running',
      duration: 720,
      tests: 602,
      passed: 580,
      failed: 22,
      coverage: 95,
      lastRun: 'Running now'
    }
  ]);

  const [qualityGates, setQualityGates] = useState<QualityGate[]>([
    {
      name: 'Code Coverage',
      status: 'passed',
      threshold: 70,
      current: 73,
      unit: '%',
      category: 'testing',
      blocking: true
    },
    {
      name: 'Test Pass Rate',
      status: 'passed',
      threshold: 95,
      current: 96.8,
      unit: '%',
      category: 'testing',
      blocking: true
    },
    {
      name: 'Code Quality Score',
      status: 'passed',
      threshold: 80,
      current: 85,
      unit: 'score',
      category: 'code',
      blocking: true
    },
    {
      name: 'Security Vulnerabilities',
      status: 'passed',
      threshold: 0,
      current: 0,
      unit: 'critical',
      category: 'security',
      blocking: true
    },
    {
      name: 'Performance Score',
      status: 'passed',
      threshold: 80,
      current: 85,
      unit: 'score',
      category: 'performance',
      blocking: false
    },
    {
      name: 'Lint Errors',
      status: 'warning',
      threshold: 0,
      current: 1,
      unit: 'errors',
      category: 'code',
      blocking: false
    },
    {
      name: 'Bundle Size',
      status: 'passed',
      threshold: 3.0,
      current: 2.4,
      unit: 'MB',
      category: 'performance',
      blocking: false
    }
  ]);

  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalRuns: 287,
    successRate: 94.8,
    averageDuration: 12.5,
    qualityScore: 85,
    issuesBlocked: 23,
    issuesResolved: 156,
    deploymentFrequency: 4.2,
    lastUpdate: '5 minutes ago'
  });

  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getStatusIcon = (status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'warning') => {
    switch (status) {
      case 'running':
        return <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'skipped':
        return <PauseIcon className="h-4 w-4 text-gray-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped' | 'warning') => {
    const variants = {
      running: 'secondary',
      passed: 'default',
      failed: 'destructive',
      warning: 'secondary',
      skipped: 'outline',
      pending: 'outline'
    } as const;

    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const getCategoryIcon = (category: 'code' | 'testing' | 'security' | 'performance') => {
    switch (category) {
      case 'code':
        return <BuildIcon className="h-4 w-4" />;
      case 'testing':
        return <TestTubeIcon className="h-4 w-4" />;
      case 'security':
        return <ShieldCheckIcon className="h-4 w-4" />;
      case 'performance':
        return <TrendingUpIcon className="h-4 w-4" />;
    }
  };

  const runPipeline = () => {
    setIsRunning(true);
    setPipelineStages(prev => prev.map(stage => ({ ...stage, status: 'running' as const })));

    setTimeout(() => {
      setPipelineStages(prev => prev.map(stage => ({
        ...stage,
        status: Math.random() > 0.15 ? 'passed' as const : (Math.random() > 0.5 ? 'failed' as const : 'warning' as const),
        lastRun: 'Just now'
      })));
      setIsRunning(false);
    }, 10000);
  };

  const getQualityGatesByCategory = () => {
    if (selectedCategory === 'all') return qualityGates;
    return qualityGates.filter(gate => gate.category === selectedCategory);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getPipelineHealth = () => {
    const totalStages = pipelineStages.length;
    const passedStages = pipelineStages.filter(stage => stage.status === 'passed').length;
    return Math.round((passedStages / totalStages) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quality Assurance Pipeline</h1>
          <p className="text-muted-foreground">
            Automated quality checks, validation, and metrics tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <SettingsIcon className="h-4 w-4" />
            Configure Pipeline
          </Button>
          <Button
            onClick={runPipeline}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCwIcon className="h-4 w-4 animate-spin" />
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
            Run Pipeline
          </Button>
        </div>
      </div>

      {/* Pipeline Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{getPipelineHealth()}%</div>
            <Progress value={getPipelineHealth()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">Stages passing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.qualityScore}</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUpIcon className="h-3 w-3" />
              <span>+3 from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">Last {metrics.totalRuns} runs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageDuration}m</div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingDownIcon className="h-3 w-3" />
              <span>-2m faster</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Stages</TabsTrigger>
          <TabsTrigger value="gates">Quality Gates</TabsTrigger>
          <TabsTrigger value="metrics">Quality Metrics</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid gap-4">
            {pipelineStages.map((stage, index) => (
              <Card key={stage.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <CardTitle className="text-lg">{stage.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Stage {index + 1} of {pipelineStages.length}
                        </p>
                      </div>
                      {getStatusBadge(stage.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Duration: {formatDuration(stage.duration)}</p>
                      <p className="text-xs text-muted-foreground">{stage.lastRun}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stage.tests > 0 && (
                      <>
                        <div>
                          <p className="text-sm text-muted-foreground">Tests</p>
                          <p className="font-semibold">{stage.tests}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Passed</p>
                          <p className="font-semibold text-green-600">{stage.passed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Failed</p>
                          <p className="font-semibold text-red-600">{stage.failed}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Coverage</p>
                          <p className="font-semibold">{stage.coverage}%</p>
                        </div>
                      </>
                    )}
                  </div>
                  {stage.failed > 0 && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm text-red-700">
                        {stage.failed} test(s) failed - Investigation required
                      </p>
                    </div>
                  )}
                  {stage.status === 'warning' && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-700">
                        Stage completed with warnings - Review recommended
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="gates" className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by category:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              <Button
                variant={selectedCategory === 'code' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('code')}
              >
                Code
              </Button>
              <Button
                variant={selectedCategory === 'testing' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('testing')}
              >
                Testing
              </Button>
              <Button
                variant={selectedCategory === 'security' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('security')}
              >
                Security
              </Button>
              <Button
                variant={selectedCategory === 'performance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('performance')}
              >
                Performance
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5" />
                Quality Gates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getQualityGatesByCategory().map((gate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(gate.category)}
                      {getStatusIcon(gate.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{gate.name}</span>
                          {gate.blocking && <Badge variant="destructive" className="text-xs">Blocking</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground capitalize">{gate.category} quality gate</p>
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
                <CardTitle className="flex items-center gap-2">
                  <BarChart3Icon className="h-5 w-5" />
                  Quality Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Code Quality</span>
                      <span>85/100</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Test Coverage</span>
                      <span>73%</span>
                    </div>
                    <Progress value={73} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Security Score</span>
                      <span>92/100</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance Score</span>
                      <span>85/100</span>
                    </div>
                    <Progress value={85} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pipeline Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Total Pipeline Runs</span>
                    <span className="font-medium">{metrics.totalRuns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues Blocked</span>
                    <span className="font-medium text-red-600">{metrics.issuesBlocked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Issues Resolved</span>
                    <span className="font-medium text-green-600">{metrics.issuesResolved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deployment Frequency</span>
                    <span className="font-medium">{metrics.deploymentFrequency}/week</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Lead Time</span>
                    <span className="font-medium">2.3 days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mean Time to Recovery</span>
                    <span className="font-medium">45 minutes</span>
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
                <WorkflowIcon className="h-5 w-5" />
                Pipeline Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Automated Triggers</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Push to main branch</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Pull request creation</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Scheduled (nightly)</span>
                      <Badge variant="default">2:00 AM</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Manual trigger</span>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Quality Automation</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Auto-fix formatting</span>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Dependency updates</span>
                      <Badge variant="secondary">Weekly</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security patches</span>
                      <Badge variant="default">Auto-apply</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance monitoring</span>
                      <Badge variant="default">Real-time</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Recent Pipeline Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <GitBranchIcon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Run #287 - main branch</p>
                      <p className="text-sm text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">PASSED</Badge>
                    <span className="text-sm text-muted-foreground">12m 34s</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <GitBranchIcon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Run #286 - feature/qa-improvements</p>
                      <p className="text-sm text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">WARNING</Badge>
                    <span className="text-sm text-muted-foreground">15m 12s</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <GitBranchIcon className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Run #285 - main branch</p>
                      <p className="text-sm text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">PASSED</Badge>
                    <span className="text-sm text-muted-foreground">11m 45s</span>
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