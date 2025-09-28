'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Workflow,
  Settings,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Database,
  Globe,
  Webhook,
  GitBranch,
  BarChart3,
  Timer,
  Play,
  Pause,
  Square,
  RefreshCw,
  Monitor,
  Shield,
  Layers,
  ArrowRight,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';

interface OrchestrationArchitecture {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'maintenance';
  type: 'n8n' | 'temporal' | 'custom';
  components: ArchitectureComponent[];
  metrics: ArchitectureMetrics;
  lastUpdated: Date;
}

interface ArchitectureComponent {
  id: string;
  name: string;
  type: 'engine' | 'executor' | 'connector' | 'monitor' | 'storage';
  status: 'healthy' | 'degraded' | 'unhealthy';
  description: string;
  dependencies: string[];
  metrics: ComponentMetrics;
}

interface ComponentMetrics {
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  lastCheck: Date;
}

interface ArchitectureMetrics {
  totalWorkflows: number;
  activeExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  systemHealth: number;
  last24Hours: {
    executions: number;
    successes: number;
    failures: number;
    avgTime: number;
  };
}

interface WorkflowDefinition {
  id: string;
  name: string;
  type: string;
  status: string;
  steps: number;
  lastExecution?: Date;
  successRate: number;
}

export default function OrchestrationArchitecturePage() {
  const [architecture, setArchitecture] = useState<OrchestrationArchitecture | null>(null);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<ArchitectureComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArchitectureData();
  }, []);

  const loadArchitectureData = async () => {
    // Mock data - in real implementation, fetch from API
    const mockArchitecture: OrchestrationArchitecture = {
      id: 'arch-001',
      name: 'PRD Section 8 Orchestration Architecture',
      description: 'Enterprise-grade orchestration layer with n8n/Temporal integration for PRD compliance',
      status: 'active',
      type: 'n8n',
      components: [
        {
          id: 'comp-001',
          name: 'Orchestration Engine',
          type: 'engine',
          status: 'healthy',
          description: 'Central workflow management and execution engine',
          dependencies: ['workflow-executor', 'retry-controller'],
          metrics: {
            uptime: 99.9,
            responseTime: 45,
            throughput: 1250,
            errorRate: 0.1,
            lastCheck: new Date()
          }
        },
        {
          id: 'comp-002',
          name: 'Workflow Executor',
          type: 'executor',
          status: 'healthy',
          description: 'Workflow execution engine with retry logic and error handling',
          dependencies: ['n8n-connector', 'webhook-coordinator'],
          metrics: {
            uptime: 99.8,
            responseTime: 120,
            throughput: 890,
            errorRate: 0.2,
            lastCheck: new Date()
          }
        },
        {
          id: 'comp-003',
          name: 'n8n Connector',
          type: 'connector',
          status: 'healthy',
          description: 'n8n integration connector for workflow orchestration',
          dependencies: ['n8n-instance'],
          metrics: {
            uptime: 99.7,
            responseTime: 200,
            throughput: 650,
            errorRate: 0.3,
            lastCheck: new Date()
          }
        },
        {
          id: 'comp-004',
          name: 'Webhook Coordinator',
          type: 'connector',
          status: 'healthy',
          description: 'Coordinated webhook delivery with reliability controls',
          dependencies: ['webhook-emitter'],
          metrics: {
            uptime: 99.9,
            responseTime: 80,
            throughput: 2100,
            errorRate: 0.05,
            lastCheck: new Date()
          }
        },
        {
          id: 'comp-005',
          name: 'Execution Monitor',
          type: 'monitor',
          status: 'healthy',
          description: 'Comprehensive execution monitoring and alerting',
          dependencies: ['metrics-collector', 'alert-manager'],
          metrics: {
            uptime: 100,
            responseTime: 25,
            throughput: 5000,
            errorRate: 0,
            lastCheck: new Date()
          }
        },
        {
          id: 'comp-006',
          name: 'Artifact Storage',
          type: 'storage',
          status: 'healthy',
          description: 'Workflow artifact storage and version management',
          dependencies: ['database', 'file-storage'],
          metrics: {
            uptime: 99.95,
            responseTime: 150,
            throughput: 320,
            errorRate: 0.1,
            lastCheck: new Date()
          }
        }
      ],
      metrics: {
        totalWorkflows: 24,
        activeExecutions: 8,
        successRate: 96.2,
        avgExecutionTime: 2.3,
        systemHealth: 99.8,
        last24Hours: {
          executions: 1247,
          successes: 1200,
          failures: 47,
          avgTime: 2.1
        }
      },
      lastUpdated: new Date()
    };

    const mockWorkflows: WorkflowDefinition[] = [
      {
        id: 'wf-001',
        name: 'Welcome Email Sequence',
        type: 'n8n',
        status: 'active',
        steps: 3,
        lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000),
        successRate: 97.0
      },
      {
        id: 'wf-002',
        name: 'Lead Scoring & Qualification',
        type: 'n8n',
        status: 'active',
        steps: 4,
        lastExecution: new Date(Date.now() - 15 * 60 * 1000),
        successRate: 94.7
      },
      {
        id: 'wf-003',
        name: 'Support Ticket Auto-Assignment',
        type: 'temporal',
        status: 'active',
        steps: 3,
        lastExecution: new Date(Date.now() - 45 * 60 * 1000),
        successRate: 94.7
      },
      {
        id: 'wf-004',
        name: 'Data Backup & Sync',
        type: 'scheduled',
        status: 'active',
        steps: 3,
        lastExecution: new Date(Date.now() - 8 * 60 * 60 * 1000),
        successRate: 98.0
      }
    ];

    setArchitecture(mockArchitecture);
    setWorkflows(mockWorkflows);
    setIsLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'active': return <Play className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'maintenance': return <Settings className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'active': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'engine': return <Zap className="h-5 w-5" />;
      case 'executor': return <Workflow className="h-5 w-5" />;
      case 'connector': return <Globe className="h-5 w-5" />;
      case 'monitor': return <Monitor className="h-5 w-5" />;
      case 'storage': return <Database className="h-5 w-5" />;
      default: return <Layers className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orchestration Architecture</h1>
          <p className="text-gray-600">PRD Section 8 compliance architecture with n8n/Temporal integration</p>
        </div>

        {/* Architecture Overview */}
        {architecture && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-3xl font-bold">{architecture.metrics.systemHealth}%</p>
                  </div>
                  <Shield className="h-10 w-10 text-green-500" />
                </div>
                <Progress value={architecture.metrics.systemHealth} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Executions</p>
                    <p className="text-3xl font-bold">{architecture.metrics.activeExecutions}</p>
                  </div>
                  <Activity className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold">{architecture.metrics.successRate}%</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Execution</p>
                    <p className="text-3xl font-bold">{architecture.metrics.avgExecutionTime}s</p>
                  </div>
                  <Timer className="h-10 w-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="architecture" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Overview</CardTitle>
                <CardDescription>
                  PRD Section 8 compliant orchestration layer with enterprise-grade reliability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Architecture Diagram */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">System Architecture</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="bg-blue-100 p-4 rounded-lg mb-2">
                          <Workflow className="h-8 w-8 text-blue-600 mx-auto" />
                        </div>
                        <h4 className="font-medium">Orchestration Engine</h4>
                        <p className="text-sm text-gray-600">Central workflow management</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-green-100 p-4 rounded-lg mb-2">
                          <Zap className="h-8 w-8 text-green-600 mx-auto" />
                        </div>
                        <h4 className="font-medium">Workflow Executor</h4>
                        <p className="text-sm text-gray-600">Execution with retry logic</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-purple-100 p-4 rounded-lg mb-2">
                          <Globe className="h-8 w-8 text-purple-600 mx-auto" />
                        </div>
                        <h4 className="font-medium">n8n Connector</h4>
                        <p className="text-sm text-gray-600">External system integration</p>
                      </div>
                    </div>
                  </div>

                  {/* PRD Compliance Status */}
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-green-800">PRD Section 8 Compliance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">✅ Implemented Features</h4>
                        <ul className="text-sm text-green-600 space-y-1">
                          <li>• Workflow execution engine with retry logic</li>
                          <li>• n8n integration and webhook coordination</li>
                          <li>• Circuit breaker pattern for reliability</li>
                          <li>• Dead letter queue for failed executions</li>
                          <li>• Comprehensive execution monitoring</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-green-700 mb-2">🎯 Performance Targets</h4>
                        <ul className="text-sm text-green-600 space-y-1">
                          <li>• Workflow execution: &lt;5 seconds</li>
                          <li>• Orchestration reliability: 99.5%</li>
                          <li>• Retry success rate: &gt;80%</li>
                          <li>• Circuit breaker response: &lt;100ms</li>
                          <li>• Automation coverage: 80%+</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Architecture Components</CardTitle>
                <CardDescription>Individual components and their health status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {architecture?.components.map((component) => (
                    <Card key={component.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getComponentIcon(component.type)}
                              <h3 className="text-lg font-semibold">{component.name}</h3>
                              <Badge className={getStatusColor(component.status)}>
                                {getStatusIcon(component.status)}
                                {component.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{component.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Uptime:</span>
                                <span className="font-semibold ml-1">{component.metrics.uptime}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Response Time:</span>
                                <span className="font-semibold ml-1">{component.metrics.responseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Throughput:</span>
                                <span className="font-semibold ml-1">{component.metrics.throughput}/min</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Error Rate:</span>
                                <span className="font-semibold ml-1">{component.metrics.errorRate}%</span>
                              </div>
                            </div>

                            {component.dependencies.length > 0 && (
                              <div className="mt-3">
                                <span className="text-sm text-gray-500">Dependencies: </span>
                                <span className="text-sm font-medium">
                                  {component.dependencies.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedComponent(component)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Definitions</CardTitle>
                <CardDescription>Workflows managed by the orchestration layer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Workflow className="h-5 w-5" />
                              <h3 className="text-lg font-semibold">{workflow.name}</h3>
                              <Badge className={getStatusColor(workflow.status)}>
                                {getStatusIcon(workflow.status)}
                                {workflow.status}
                              </Badge>
                              <Badge variant="outline">{workflow.type}</Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Steps:</span>
                                <span className="font-semibold ml-1">{workflow.steps}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Success Rate:</span>
                                <span className="font-semibold ml-1">{workflow.successRate}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Last Execution:</span>
                                <span className="font-semibold ml-1">
                                  {workflow.lastExecution ? 
                                    new Date(workflow.lastExecution).toLocaleTimeString() : 
                                    'Never'
                                  }
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Type:</span>
                                <span className="font-semibold ml-1">{workflow.type}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>24-Hour Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {architecture && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Total Executions</span>
                        <span className="font-semibold">{architecture.metrics.last24Hours.executions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Successful</span>
                        <span className="font-semibold text-green-600">{architecture.metrics.last24Hours.successes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Failed</span>
                        <span className="font-semibold text-red-600">{architecture.metrics.last24Hours.failures}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Average Time</span>
                        <span className="font-semibold">{architecture.metrics.last24Hours.avgTime}s</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {architecture && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>System Health</span>
                          <span className="font-semibold">{architecture.metrics.systemHealth}%</span>
                        </div>
                        <Progress value={architecture.metrics.systemHealth} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Success Rate</span>
                          <span className="font-semibold">{architecture.metrics.successRate}%</span>
                        </div>
                        <Progress value={architecture.metrics.successRate} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Active Executions</span>
                          <span className="font-semibold">{architecture.metrics.activeExecutions}</span>
                        </div>
                        <Progress value={(architecture.metrics.activeExecutions / 20) * 100} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
