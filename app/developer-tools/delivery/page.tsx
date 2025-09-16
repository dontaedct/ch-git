'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  GitBranch,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Settings,
  TrendingUp,
  Zap,
  Target,
  Activity,
  Code,
  TestTube,
  Rocket,
  Package
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration: number;
  startTime?: Date;
  endTime?: Date;
  logs: string[];
}

interface Pipeline {
  id: string;
  name: string;
  branch: string;
  commit: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  stages: PipelineStage[];
  trigger: 'manual' | 'push' | 'pr' | 'scheduled';
}

interface PipelineMetrics {
  totalPipelines: number;
  successRate: number;
  averageDuration: number;
  deploymentFrequency: number;
  leadTime: number;
  mttr: number;
}

export default function DeliveryPipelineOptimizationPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'Production Deploy',
      branch: 'main',
      commit: 'a1b2c3d',
      status: 'success',
      startTime: new Date(Date.now() - 1800000),
      endTime: new Date(Date.now() - 900000),
      trigger: 'push',
      stages: [
        {
          id: 'build',
          name: 'Build',
          status: 'success',
          duration: 180,
          startTime: new Date(Date.now() - 1800000),
          endTime: new Date(Date.now() - 1620000),
          logs: ['Installing dependencies...', 'Building application...', 'Build completed successfully']
        },
        {
          id: 'test',
          name: 'Test',
          status: 'success',
          duration: 240,
          startTime: new Date(Date.now() - 1620000),
          endTime: new Date(Date.now() - 1380000),
          logs: ['Running unit tests...', 'Running integration tests...', 'All tests passed']
        },
        {
          id: 'security',
          name: 'Security Scan',
          status: 'success',
          duration: 120,
          startTime: new Date(Date.now() - 1380000),
          endTime: new Date(Date.now() - 1260000),
          logs: ['Scanning for vulnerabilities...', 'No security issues found']
        },
        {
          id: 'deploy',
          name: 'Deploy',
          status: 'success',
          duration: 360,
          startTime: new Date(Date.now() - 1260000),
          endTime: new Date(Date.now() - 900000),
          logs: ['Deploying to production...', 'Deployment completed successfully']
        }
      ]
    },
    {
      id: '2',
      name: 'Feature Branch',
      branch: 'feature/new-ui',
      commit: 'e4f5g6h',
      status: 'running',
      startTime: new Date(Date.now() - 300000),
      trigger: 'pr',
      stages: [
        {
          id: 'build',
          name: 'Build',
          status: 'success',
          duration: 150,
          logs: ['Installing dependencies...', 'Building application...', 'Build completed successfully']
        },
        {
          id: 'test',
          name: 'Test',
          status: 'running',
          duration: 0,
          logs: ['Running unit tests...', 'Running integration tests...']
        },
        {
          id: 'security',
          name: 'Security Scan',
          status: 'pending',
          duration: 0,
          logs: []
        },
        {
          id: 'deploy',
          name: 'Deploy to Staging',
          status: 'pending',
          duration: 0,
          logs: []
        }
      ]
    }
  ]);

  const [metrics, setMetrics] = useState<PipelineMetrics>({
    totalPipelines: 156,
    successRate: 94.2,
    averageDuration: 12.5,
    deploymentFrequency: 8.3,
    leadTime: 2.1,
    mttr: 1.2
  });

  const [optimizations, setOptimizations] = useState([
    {
      id: 'parallel-tests',
      name: 'Parallel Test Execution',
      description: 'Run unit and integration tests in parallel',
      impact: 'Reduces test stage time by 40%',
      status: 'active',
      savings: '2.5 minutes'
    },
    {
      id: 'cache-deps',
      name: 'Dependency Caching',
      description: 'Cache node_modules and build artifacts',
      impact: 'Reduces build time by 60%',
      status: 'active',
      savings: '3.2 minutes'
    },
    {
      id: 'incremental-builds',
      name: 'Incremental Builds',
      description: 'Only rebuild changed components',
      impact: 'Reduces build time by 70% for small changes',
      status: 'recommended',
      savings: '4.1 minutes'
    },
    {
      id: 'smart-testing',
      name: 'Smart Test Selection',
      description: 'Run only tests affected by changes',
      impact: 'Reduces test time by 50% for focused changes',
      status: 'recommended',
      savings: '1.8 minutes'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      case 'pending':
        return 'bg-gray-500';
      case 'skipped':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'skipped':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStageIcon = (stageId: string) => {
    switch (stageId) {
      case 'build':
        return <Package className="h-4 w-4" />;
      case 'test':
        return <TestTube className="h-4 w-4" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4" />;
      case 'deploy':
        return <Rocket className="h-4 w-4" />;
      default:
        return <Code className="h-4 w-4" />;
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTotalDuration = (stages: PipelineStage[]) => {
    return stages.reduce((total, stage) => total + stage.duration, 0);
  };

  const getPipelineProgress = (pipeline: Pipeline) => {
    const completedStages = pipeline.stages.filter(s => s.status === 'success').length;
    return (completedStages / pipeline.stages.length) * 100;
  };

  const runPipeline = (branch: string = 'main') => {
    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name: `${branch === 'main' ? 'Production' : 'Feature'} Deploy`,
      branch,
      commit: Math.random().toString(36).substring(2, 9),
      status: 'running',
      startTime: new Date(),
      trigger: 'manual',
      stages: [
        {
          id: 'build',
          name: 'Build',
          status: 'running',
          duration: 0,
          logs: ['Starting build process...']
        },
        {
          id: 'test',
          name: 'Test',
          status: 'pending',
          duration: 0,
          logs: []
        },
        {
          id: 'security',
          name: 'Security Scan',
          status: 'pending',
          duration: 0,
          logs: []
        },
        {
          id: 'deploy',
          name: 'Deploy',
          status: 'pending',
          duration: 0,
          logs: []
        }
      ]
    };

    setPipelines(prev => [newPipeline, ...prev]);

    // Simulate pipeline execution
    let currentStageIndex = 0;
    const stageNames = ['build', 'test', 'security', 'deploy'];

    const progressStage = () => {
      if (currentStageIndex < stageNames.length) {
        setPipelines(prev =>
          prev.map(p => {
            if (p.id === newPipeline.id) {
              const updatedStages = [...p.stages];

              // Complete current stage
              if (currentStageIndex > 0) {
                updatedStages[currentStageIndex - 1] = {
                  ...updatedStages[currentStageIndex - 1],
                  status: 'success',
                  duration: Math.floor(Math.random() * 180) + 60,
                  endTime: new Date(),
                  logs: [...updatedStages[currentStageIndex - 1].logs, 'Stage completed successfully']
                };
              }

              // Start next stage
              if (currentStageIndex < stageNames.length) {
                updatedStages[currentStageIndex] = {
                  ...updatedStages[currentStageIndex],
                  status: 'running',
                  startTime: new Date(),
                  logs: [`Starting ${updatedStages[currentStageIndex].name.toLowerCase()}...`]
                };
              }

              return {
                ...p,
                stages: updatedStages,
                status: currentStageIndex === stageNames.length - 1 ? 'success' : 'running',
                endTime: currentStageIndex === stageNames.length - 1 ? new Date() : undefined
              };
            }
            return p;
          })
        );

        currentStageIndex++;
        if (currentStageIndex <= stageNames.length) {
          setTimeout(progressStage, 2000 + Math.random() * 3000);
        }
      }
    };

    setTimeout(progressStage, 1000);
  };

  const applyOptimization = (optimizationId: string) => {
    setOptimizations(prev =>
      prev.map(opt =>
        opt.id === optimizationId
          ? { ...opt, status: 'active' }
          : opt
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Delivery Pipeline Optimization
          </h1>
          <p className="text-gray-600 mt-2">
            Optimize delivery pipeline with automated builds, testing, and deployment stages
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runPipeline('feature/test')}>
            <Play className="h-4 w-4 mr-2" />
            Run Feature Pipeline
          </Button>
          <Button onClick={() => runPipeline('main')}>
            <Rocket className="h-4 w-4 mr-2" />
            Run Production Pipeline
          </Button>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Pipelines</p>
                <p className="text-xl font-bold">{metrics.totalPipelines}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Success Rate</p>
                <p className="text-xl font-bold">{metrics.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg Duration</p>
                <p className="text-xl font-bold">{metrics.averageDuration}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Deploy Freq</p>
                <p className="text-xl font-bold">{metrics.deploymentFrequency}/day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Zap className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Lead Time</p>
                <p className="text-xl font-bold">{metrics.leadTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">MTTR</p>
                <p className="text-xl font-bold">{metrics.mttr}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pipelines" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipelines">Active Pipelines</TabsTrigger>
          <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipelines" className="space-y-4">
          <div className="space-y-4">
            {pipelines.map((pipeline) => (
              <Card key={pipeline.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(pipeline.status)}
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {pipeline.name}
                          <Badge variant="outline" className="ml-2">
                            {pipeline.trigger}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          {pipeline.branch} • {pipeline.commit}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(pipeline.status)}>
                        {pipeline.status}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDuration(getTotalDuration(pipeline.stages))}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Overall Progress</span>
                        <span>{Math.round(getPipelineProgress(pipeline))}%</span>
                      </div>
                      <Progress value={getPipelineProgress(pipeline)} className="w-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {pipeline.stages.map((stage) => (
                        <Card key={stage.id} className="p-3">
                          <div className="flex items-center gap-2 mb-2">
                            {getStageIcon(stage.id)}
                            <span className="font-medium text-sm">{stage.name}</span>
                            {getStatusIcon(stage.status)}
                          </div>
                          <div className="text-xs text-gray-600">
                            {stage.duration > 0 ? formatDuration(stage.duration) : 'Pending'}
                          </div>
                          {stage.logs.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              {stage.logs[stage.logs.length - 1]}
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Pipeline Optimizations
              </CardTitle>
              <CardDescription>
                Apply optimizations to improve pipeline efficiency and reduce execution time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.map((optimization) => (
                  <div key={optimization.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{optimization.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={optimization.status === 'active' ? 'default' : 'secondary'}
                          className={optimization.status === 'active' ? 'bg-green-500' : ''}
                        >
                          {optimization.status}
                        </Badge>
                        {optimization.status === 'recommended' && (
                          <Button
                            size="sm"
                            onClick={() => applyOptimization(optimization.id)}
                          >
                            Apply
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{optimization.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">{optimization.impact}</span>
                      <span className="font-medium">Saves: {optimization.savings}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Pipeline Analytics
                </CardTitle>
                <CardDescription>
                  Performance metrics and delivery pipeline insights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Pipeline Efficiency</AlertTitle>
                  <AlertDescription>
                    Current pipeline efficiency optimized with automated builds, parallel testing, and deployment automation.
                    Average pipeline duration: {metrics.averageDuration} minutes.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Optimization Results</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Automated builds functional</li>
                      <li>✓ Testing stages automated</li>
                      <li>✓ Deployment stages automated</li>
                      <li>✓ Pipeline efficiency optimized</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Performance Targets</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Build time: &lt;5 minutes</li>
                      <li>• Test execution: &lt;10 minutes</li>
                      <li>• Total pipeline: &lt;15 minutes</li>
                      <li>• Success rate: &gt;95%</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}