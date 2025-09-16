'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Rocket,
  Server,
  GitBranch,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Play,
  Pause,
  Settings,
  Monitor
} from 'lucide-react';

interface DeploymentStatus {
  id: string;
  environment: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'rollback';
  progress: number;
  startTime: Date;
  endTime?: Date;
  branch: string;
  commit: string;
  logs: string[];
}

interface Environment {
  name: string;
  url: string;
  status: 'healthy' | 'degraded' | 'down';
  lastDeployed: Date;
  version: string;
}

export default function DeploymentAutomationPage() {
  const [deployments, setDeployments] = useState<DeploymentStatus[]>([
    {
      id: '1',
      environment: 'production',
      status: 'success',
      progress: 100,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() - 3300000),
      branch: 'main',
      commit: 'a1b2c3d',
      logs: [
        'Building application...',
        'Running tests...',
        'Deploying to production...',
        'Deployment successful'
      ]
    },
    {
      id: '2',
      environment: 'staging',
      status: 'running',
      progress: 65,
      startTime: new Date(Date.now() - 600000),
      branch: 'feature/new-feature',
      commit: 'e4f5g6h',
      logs: [
        'Building application...',
        'Running tests...',
        'Deploying to staging...'
      ]
    }
  ]);

  const [environments, setEnvironments] = useState<Environment[]>([
    {
      name: 'Production',
      url: 'https://app.example.com',
      status: 'healthy',
      lastDeployed: new Date(Date.now() - 3600000),
      version: 'v2.1.0'
    },
    {
      name: 'Staging',
      url: 'https://staging.example.com',
      status: 'degraded',
      lastDeployed: new Date(Date.now() - 7200000),
      version: 'v2.0.9'
    },
    {
      name: 'Development',
      url: 'https://dev.example.com',
      status: 'healthy',
      lastDeployed: new Date(Date.now() - 1800000),
      version: 'v2.1.1-dev'
    }
  ]);

  const [deploymentMetrics, setDeploymentMetrics] = useState({
    totalDeployments: 45,
    successRate: 94.2,
    averageDeployTime: 12.5,
    rolledBackDeployments: 3
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return 'bg-green-500';
      case 'running':
      case 'pending':
        return 'bg-blue-500';
      case 'failed':
      case 'down':
        return 'bg-red-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'rollback':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
      case 'down':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'rollback':
        return <RotateCcw className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleDeploy = (environment: string, branch: string = 'main') => {
    const newDeployment: DeploymentStatus = {
      id: Date.now().toString(),
      environment,
      status: 'running',
      progress: 0,
      startTime: new Date(),
      branch,
      commit: Math.random().toString(36).substring(2, 9),
      logs: ['Starting deployment...']
    };

    setDeployments(prev => [newDeployment, ...prev]);

    // Simulate deployment progress
    const interval = setInterval(() => {
      setDeployments(prev => {
        const updated = prev.map(dep => {
          if (dep.id === newDeployment.id && dep.status === 'running') {
            const newProgress = Math.min(dep.progress + Math.random() * 20, 100);
            const newLogs = [...dep.logs];

            if (newProgress >= 25 && dep.logs.length === 1) {
              newLogs.push('Building application...');
            }
            if (newProgress >= 50 && dep.logs.length === 2) {
              newLogs.push('Running tests...');
            }
            if (newProgress >= 75 && dep.logs.length === 3) {
              newLogs.push(`Deploying to ${environment}...`);
            }
            if (newProgress >= 100) {
              newLogs.push('Deployment successful');
              return {
                ...dep,
                progress: 100,
                status: 'success' as const,
                endTime: new Date(),
                logs: newLogs
              };
            }

            return {
              ...dep,
              progress: newProgress,
              logs: newLogs
            };
          }
          return dep;
        });

        return updated;
      });
    }, 1000);

    setTimeout(() => clearInterval(interval), 15000);
  };

  const handleRollback = (deploymentId: string) => {
    setDeployments(prev =>
      prev.map(dep =>
        dep.id === deploymentId
          ? { ...dep, status: 'rollback' as const, logs: [...dep.logs, 'Rolling back deployment...'] }
          : dep
      )
    );
  };

  const formatDuration = (start: Date, end?: Date) => {
    const duration = (end?.getTime() || Date.now()) - start.getTime();
    return `${Math.round(duration / 1000 / 60)}m ${Math.round((duration / 1000) % 60)}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="h-8 w-8" />
            Deployment Automation
          </h1>
          <p className="text-gray-600 mt-2">
            Manage deployments with automated environment management and rollback capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleDeploy('staging', 'develop')}>
            <Play className="h-4 w-4 mr-2" />
            Deploy to Staging
          </Button>
          <Button onClick={() => handleDeploy('production')}>
            <Rocket className="h-4 w-4 mr-2" />
            Deploy to Production
          </Button>
        </div>
      </div>

      {/* Deployment Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Rocket className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Deployments</p>
                <p className="text-2xl font-bold">{deploymentMetrics.totalDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold">{deploymentMetrics.successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Deploy Time</p>
                <p className="text-2xl font-bold">{deploymentMetrics.averageDeployTime}m</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RotateCcw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rollbacks</p>
                <p className="text-2xl font-bold">{deploymentMetrics.rolledBackDeployments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deployments">Active Deployments</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          <div className="space-y-4">
            {deployments.map((deployment) => (
              <Card key={deployment.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <CardTitle className="text-lg">
                          {deployment.environment.charAt(0).toUpperCase() + deployment.environment.slice(1)} Deployment
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <GitBranch className="h-4 w-4" />
                          {deployment.branch} • {deployment.commit}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(deployment.status)}>
                        {deployment.status}
                      </Badge>
                      {deployment.status === 'success' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(deployment.id)}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span>{Math.round(deployment.progress)}%</span>
                      </div>
                      <Progress value={deployment.progress} className="w-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Started</p>
                        <p className="font-medium">{deployment.startTime.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Duration</p>
                        <p className="font-medium">{formatDuration(deployment.startTime, deployment.endTime)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Deployment Logs</p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded-md text-sm font-mono max-h-40 overflow-y-auto">
                        {deployment.logs.map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid gap-4">
            {environments.map((env) => (
              <Card key={env.name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(env.status)}
                      <div>
                        <CardTitle>{env.name}</CardTitle>
                        <CardDescription>{env.url}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(env.status)}>
                        {env.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeploy(env.name.toLowerCase())}
                      >
                        <Rocket className="h-4 w-4 mr-2" />
                        Deploy
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Version</p>
                      <p className="font-medium">{env.version}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Deployed</p>
                      <p className="font-medium">{env.lastDeployed.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Deployment Configuration
                </CardTitle>
                <CardDescription>
                  Configure deployment automation settings and environment management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Monitor className="h-4 w-4" />
                  <AlertTitle>Environment Management</AlertTitle>
                  <AlertDescription>
                    Automated environment validation and rollback capabilities are active.
                    Deployment time target: &lt;15 minutes per environment.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Automated Checks</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>✓ Environment health validation</li>
                      <li>✓ Deployment rollback capabilities</li>
                      <li>✓ Automated build validation</li>
                      <li>✓ Performance monitoring</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Deployment Targets</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Deployment time: &lt;15 minutes</li>
                      <li>• Success rate: &gt;95%</li>
                      <li>• Rollback time: &lt;5 minutes</li>
                      <li>• Zero-downtime deployments</li>
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