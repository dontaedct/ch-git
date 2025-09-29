'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Server, Database, Settings, Play, Pause, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface TemplateEngineStatus {
  isRunning: boolean;
  version: string;
  uptime: string;
  totalTemplates: number;
  compiledTemplates: number;
  activeGenerations: number;
  lastCompilation: string;
  memoryUsage: number;
  cpuUsage: number;
}

interface CompilationJob {
  id: string;
  templateId: string;
  templateName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  duration?: number;
  errorMessage?: string;
}

interface SystemMetrics {
  compilationSpeed: number;
  averageCompileTime: number;
  successRate: number;
  errorRate: number;
  totalProcessed: number;
  cacheHitRate: number;
}

export default function TemplateEngineCorePage() {
  const [engineStatus, setEngineStatus] = useState<TemplateEngineStatus>({
    isRunning: true,
    version: '1.0.0-beta',
    uptime: '2h 34m',
    totalTemplates: 12,
    compiledTemplates: 10,
    activeGenerations: 3,
    lastCompilation: '2 minutes ago',
    memoryUsage: 45,
    cpuUsage: 23
  });

  const [compilationJobs, setCompilationJobs] = useState<CompilationJob[]>([
    {
      id: 'job_001',
      templateId: 'tmpl_landing_001',
      templateName: 'Consultation Landing Page',
      status: 'completed',
      progress: 100,
      startTime: '2025-09-18T20:30:00Z',
      duration: 1234
    },
    {
      id: 'job_002',
      templateId: 'tmpl_questionnaire_001',
      templateName: 'Client Questionnaire Flow',
      status: 'running',
      progress: 65,
      startTime: '2025-09-18T20:32:00Z'
    },
    {
      id: 'job_003',
      templateId: 'tmpl_pdf_001',
      templateName: 'PDF Consultation Report',
      status: 'pending',
      progress: 0,
      startTime: '2025-09-18T20:35:00Z'
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    compilationSpeed: 850,
    averageCompileTime: 1.2,
    successRate: 94.5,
    errorRate: 5.5,
    totalProcessed: 847,
    cacheHitRate: 78.3
  });

  const [selectedTab, setSelectedTab] = useState('overview');

  const handleEngineControl = (action: 'start' | 'stop' | 'restart') => {
    if (action === 'stop') {
      setEngineStatus(prev => ({ ...prev, isRunning: false }));
    } else if (action === 'start') {
      setEngineStatus(prev => ({ ...prev, isRunning: true }));
    } else if (action === 'restart') {
      setEngineStatus(prev => ({
        ...prev,
        isRunning: false
      }));
      setTimeout(() => {
        setEngineStatus(prev => ({
          ...prev,
          isRunning: true,
          uptime: '0m'
        }));
      }, 2000);
    }
  };

  const handleJobAction = (jobId: string, action: 'retry' | 'cancel') => {
    setCompilationJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? {
              ...job,
              status: action === 'retry' ? 'pending' : 'failed',
              progress: action === 'retry' ? 0 : job.progress
            }
          : job
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'pending': return <AlertCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setEngineStatus(prev => ({
        ...prev,
        cpuUsage: Math.max(10, Math.min(90, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 5))
      }));

      // Update running jobs progress
      setCompilationJobs(prev =>
        prev.map(job =>
          job.status === 'running'
            ? { ...job, progress: Math.min(100, job.progress + Math.random() * 5) }
            : job
        )
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Template Engine Core</h1>
          <p className="text-muted-foreground">
            Core infrastructure management and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={engineStatus.isRunning ? "default" : "destructive"}>
            {engineStatus.isRunning ? 'Running' : 'Stopped'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEngineControl('restart')}
            disabled={!engineStatus.isRunning}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Compilation Jobs</TabsTrigger>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="controls">Engine Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engine Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${engineStatus.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
                  {engineStatus.isRunning ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Uptime: {engineStatus.uptime}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Templates</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {engineStatus.compiledTemplates}/{engineStatus.totalTemplates}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((engineStatus.compiledTemplates / engineStatus.totalTemplates) * 100)}% compiled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engineStatus.activeGenerations}</div>
                <p className="text-xs text-muted-foreground">
                  Running compilations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU</span>
                    <span>{engineStatus.cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${engineStatus.cpuUsage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory</span>
                    <span>{engineStatus.memoryUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${engineStatus.memoryUsage}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engine Information</CardTitle>
              <CardDescription>Core template engine details and configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Version Information</h4>
                  <p className="text-sm text-muted-foreground">Version: {engineStatus.version}</p>
                  <p className="text-sm text-muted-foreground">Last Compilation: {engineStatus.lastCompilation}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Template Storage</h4>
                  <p className="text-sm text-muted-foreground">Storage Type: File System + Database</p>
                  <p className="text-sm text-muted-foreground">Cache Strategy: LRU + Memory</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compilation Engine</h4>
                  <p className="text-sm text-muted-foreground">Engine: React JSX + TypeScript</p>
                  <p className="text-sm text-muted-foreground">Mode: Hot Compilation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compilation Jobs</CardTitle>
              <CardDescription>Active and recent template compilation jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {compilationJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(job.status)} text-white`}>
                        {getStatusIcon(job.status)}
                      </div>
                      <div>
                        <h4 className="font-medium">{job.templateName}</h4>
                        <p className="text-sm text-muted-foreground">ID: {job.templateId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant="outline">{job.status}</Badge>
                        {job.status === 'running' && (
                          <div className="mt-1">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{job.progress.toFixed(0)}%</p>
                          </div>
                        )}
                        {job.duration && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {(job.duration / 1000).toFixed(1)}s
                          </p>
                        )}
                      </div>
                      {(job.status === 'failed' || job.status === 'pending') && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'retry')}
                          >
                            Retry
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleJobAction(job.id, 'cancel')}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Compilation Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.compilationSpeed}</div>
                <p className="text-xs text-muted-foreground">templates/hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Compile Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.averageCompileTime}s</div>
                <p className="text-xs text-muted-foreground">per template</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemMetrics.successRate}%</div>
                <p className="text-xs text-muted-foreground">compilation success</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{systemMetrics.errorRate}%</div>
                <p className="text-xs text-muted-foreground">compilation errors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemMetrics.totalProcessed.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">templates compiled</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{systemMetrics.cacheHitRate}%</div>
                <p className="text-xs text-muted-foreground">cache efficiency</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engine Controls</CardTitle>
              <CardDescription>Start, stop, and configure the template engine</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button
                    onClick={() => handleEngineControl('start')}
                    disabled={engineStatus.isRunning}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Engine</span>
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleEngineControl('stop')}
                    disabled={!engineStatus.isRunning}
                    className="flex items-center space-x-2"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Stop Engine</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleEngineControl('restart')}
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Restart Engine</span>
                  </Button>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Engine Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Max Concurrent Jobs:</strong> 5</p>
                      <p><strong>Template Cache Size:</strong> 100MB</p>
                      <p><strong>Compilation Timeout:</strong> 30s</p>
                    </div>
                    <div>
                      <p><strong>Auto-restart:</strong> Enabled</p>
                      <p><strong>Error Notifications:</strong> Enabled</p>
                      <p><strong>Performance Monitoring:</strong> Enabled</p>
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