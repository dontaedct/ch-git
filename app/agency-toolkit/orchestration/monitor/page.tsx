'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Play,
  Pause,
  Square,
  RefreshCw,
  Eye,
  AlertTriangle,
  Info,
  Workflow,
  Users,
  Calendar,
  Zap,
  Globe,
  Webhook,
  GitBranch,
  BarChart3,
  TrendingUp,
  Database,
  Monitor,
  Shield,
  Layers,
  Bell,
  Settings,
  Filter,
  Search,
  Download,
  ExternalLink,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalLow,
  SignalZero
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface SystemHealth {
  overall: number;
  components: ComponentHealth[];
  lastUpdated: Date;
}

interface ComponentHealth {
  id: string;
  name: string;
  type: 'engine' | 'executor' | 'connector' | 'monitor' | 'storage';
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  lastCheck: Date;
  alerts: ComponentAlert[];
}

interface ComponentAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

interface LiveExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startTime: Date;
  currentStep?: string;
  progress: number;
  estimatedCompletion?: Date;
  triggerType: string;
  environment: string;
}

interface SystemMetrics {
  activeExecutions: number;
  queuedExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  avgResponseTime: number;
  throughput: number;
  errorRate: number;
  systemLoad: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface PerformanceTrend {
  timestamp: Date;
  executions: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowMonitoringPage() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [liveExecutions, setLiveExecutions] = useState<LiveExecution[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [performanceTrends, setPerformanceTrends] = useState<PerformanceTrend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadMonitoringData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockSystemHealth: SystemHealth = {
        overall: 98.5,
        components: [
          {
            id: 'comp-001',
            name: 'Orchestration Engine',
            type: 'engine',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 45,
            throughput: 1250,
            errorRate: 0.1,
            lastCheck: new Date(),
            alerts: []
          },
          {
            id: 'comp-002',
            name: 'Workflow Executor',
            type: 'executor',
            status: 'healthy',
            uptime: 99.8,
            responseTime: 120,
            throughput: 890,
            errorRate: 0.2,
            lastCheck: new Date(),
            alerts: []
          },
          {
            id: 'comp-003',
            name: 'n8n Connector',
            type: 'connector',
            status: 'degraded',
            uptime: 99.7,
            responseTime: 200,
            throughput: 650,
            errorRate: 0.3,
            lastCheck: new Date(),
            alerts: [
              {
                id: 'alert-001',
                type: 'warning',
                message: 'Response time above normal threshold',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                resolved: false
              }
            ]
          },
          {
            id: 'comp-004',
            name: 'Webhook Coordinator',
            type: 'connector',
            status: 'healthy',
            uptime: 99.9,
            responseTime: 80,
            throughput: 2100,
            errorRate: 0.05,
            lastCheck: new Date(),
            alerts: []
          },
          {
            id: 'comp-005',
            name: 'Execution Monitor',
            type: 'monitor',
            status: 'healthy',
            uptime: 100,
            responseTime: 25,
            throughput: 5000,
            errorRate: 0,
            lastCheck: new Date(),
            alerts: []
          },
          {
            id: 'comp-006',
            name: 'Artifact Storage',
            type: 'storage',
            status: 'healthy',
            uptime: 99.95,
            responseTime: 150,
            throughput: 320,
            errorRate: 0.1,
            lastCheck: new Date(),
            alerts: []
          }
        ],
        lastUpdated: new Date()
      };

      const mockLiveExecutions: LiveExecution[] = [
        {
          id: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          status: 'running',
          startTime: new Date(Date.now() - 2 * 60 * 1000),
          currentStep: 'Send Welcome Email',
          progress: 65,
          estimatedCompletion: new Date(Date.now() + 30 * 1000),
          triggerType: 'form-submission',
          environment: 'prod'
        },
        {
          id: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          status: 'running',
          startTime: new Date(Date.now() - 45 * 1000),
          currentStep: 'Update CRM Record',
          progress: 80,
          estimatedCompletion: new Date(Date.now() + 15 * 1000),
          triggerType: 'user-activity',
          environment: 'prod'
        },
        {
          id: 'exec-003',
          workflowId: 'wf-003',
          workflowName: 'Support Ticket Auto-Assignment',
          status: 'pending',
          startTime: new Date(Date.now() - 10 * 1000),
          progress: 0,
          triggerType: 'webhook',
          environment: 'prod'
        }
      ];

      const mockSystemMetrics: SystemMetrics = {
        activeExecutions: 8,
        queuedExecutions: 3,
        completedExecutions: 1247,
        failedExecutions: 37,
        avgResponseTime: 2850,
        throughput: 1250,
        errorRate: 2.3,
        systemLoad: 65,
        memoryUsage: 78,
        cpuUsage: 45
      };

      const mockPerformanceTrends: PerformanceTrend[] = [
        { timestamp: new Date(Date.now() - 60 * 60 * 1000), executions: 45, responseTime: 2800, errorRate: 2.1, throughput: 1200 },
        { timestamp: new Date(Date.now() - 50 * 60 * 1000), executions: 52, responseTime: 2900, errorRate: 2.3, throughput: 1250 },
        { timestamp: new Date(Date.now() - 40 * 60 * 1000), executions: 48, responseTime: 2750, errorRate: 1.9, throughput: 1180 },
        { timestamp: new Date(Date.now() - 30 * 60 * 1000), executions: 55, responseTime: 3000, errorRate: 2.5, throughput: 1300 },
        { timestamp: new Date(Date.now() - 20 * 60 * 1000), executions: 50, responseTime: 2850, errorRate: 2.2, throughput: 1220 },
        { timestamp: new Date(Date.now() - 10 * 60 * 1000), executions: 47, responseTime: 2700, errorRate: 2.0, throughput: 1150 },
        { timestamp: new Date(), executions: 43, responseTime: 2650, errorRate: 1.8, throughput: 1100 }
      ];

      setSystemHealth(mockSystemHealth);
      setLiveExecutions(mockLiveExecutions);
      setSystemMetrics(mockSystemMetrics);
      setPerformanceTrends(mockPerformanceTrends);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed': return 'bg-green-100 text-green-800';
      case 'degraded':
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
      case 'failed': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'running': return 'bg-blue-100 text-blue-800';
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

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSignalIcon = (value: number) => {
    if (value >= 90) return <SignalHigh className="h-4 w-4 text-green-500" />;
    if (value >= 70) return <Signal className="h-4 w-4 text-yellow-500" />;
    if (value >= 50) return <SignalLow className="h-4 w-4 text-orange-500" />;
    return <SignalZero className="h-4 w-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading monitoring data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Real-time Workflow Monitoring</h1>
              <p className="text-gray-600">Live monitoring of workflow executions and system health</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
                </span>
              </div>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
              >
                {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {autoRefresh ? 'Pause' : 'Resume'}
              </Button>
              <Button onClick={loadMonitoringData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">System Health</p>
                    <p className="text-3xl font-bold">{systemHealth.overall}%</p>
                  </div>
                  <Shield className="h-10 w-10 text-green-500" />
                </div>
                <Progress value={systemHealth.overall} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Executions</p>
                    <p className="text-3xl font-bold">{systemMetrics?.activeExecutions || 0}</p>
                  </div>
                  <Activity className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Throughput</p>
                    <p className="text-3xl font-bold">{systemMetrics?.throughput || 0}/min</p>
                  </div>
                  <TrendingUp className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p className="text-3xl font-bold">{systemMetrics?.errorRate || 0}%</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="live" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="live">Live Executions</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="metrics">Performance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Live Workflow Executions</span>
                </CardTitle>
                <CardDescription>
                  Real-time monitoring of currently running workflow executions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {liveExecutions.map((execution) => (
                    <Card key={execution.id} className="border">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold">{execution.id}</h3>
                              <Badge className={getStatusColor(execution.status)}>
                                {getStatusIcon(execution.status)}
                                {execution.status}
                              </Badge>
                              <Badge variant="outline">{execution.environment}</Badge>
                            </div>
                            
                            <div className="mb-3">
                              <p className="font-medium">{execution.workflowName}</p>
                              <p className="text-sm text-gray-500">{execution.workflowId}</p>
                            </div>

                            {execution.currentStep && (
                              <div className="mb-3">
                                <p className="text-sm text-gray-600">Current Step: {execution.currentStep}</p>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${execution.progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{execution.progress}% complete</p>
                              </div>
                            )}

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Started:</span>
                                <span className="font-semibold ml-1">
                                  {execution.startTime.toLocaleTimeString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">Trigger:</span>
                                <span className="font-semibold ml-1">{execution.triggerType}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Environment:</span>
                                <span className="font-semibold ml-1">{execution.environment}</span>
                              </div>
                              {execution.estimatedCompletion && (
                                <div>
                                  <span className="text-gray-500">ETA:</span>
                                  <span className="font-semibold ml-1">
                                    {execution.estimatedCompletion.toLocaleTimeString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {execution.status === 'running' && (
                              <Button size="sm" variant="outline">
                                <Square className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>System Health Components</span>
                </CardTitle>
                <CardDescription>
                  Real-time health status of all system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {systemHealth?.components.map((component) => (
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

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Uptime:</span>
                                <span className="font-semibold ml-1">{component.uptime}%</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Response Time:</span>
                                <span className="font-semibold ml-1">{component.responseTime}ms</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Throughput:</span>
                                <span className="font-semibold ml-1">{component.throughput}/min</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Error Rate:</span>
                                <span className="font-semibold ml-1">{component.errorRate}%</span>
                              </div>
                            </div>

                            {component.alerts.length > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bell className="h-4 w-4 text-yellow-500" />
                                  <span className="text-sm font-medium">Active Alerts</span>
                                </div>
                                <div className="space-y-1">
                                  {component.alerts.map((alert) => (
                                    <div key={alert.id} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                      {getAlertIcon(alert.type)}
                                      <span className="text-sm text-yellow-800">{alert.message}</span>
                                      <span className="text-xs text-yellow-600 ml-auto">
                                        {alert.timestamp.toLocaleTimeString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Settings className="h-4 w-4" />
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

          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemMetrics && (
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>System Load</span>
                          <span className="font-semibold">{systemMetrics.systemLoad}%</span>
                        </div>
                        <Progress value={systemMetrics.systemLoad} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>Memory Usage</span>
                          <span className="font-semibold">{systemMetrics.memoryUsage}%</span>
                        </div>
                        <Progress value={systemMetrics.memoryUsage} />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span>CPU Usage</span>
                          <span className="font-semibold">{systemMetrics.cpuUsage}%</span>
                        </div>
                        <Progress value={systemMetrics.cpuUsage} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Performance Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Active Executions</span>
                      <span className="font-semibold">{systemMetrics?.activeExecutions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Queued Executions</span>
                      <span className="font-semibold">{systemMetrics?.queuedExecutions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Completed (24h)</span>
                      <span className="font-semibold text-green-600">{systemMetrics?.completedExecutions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Failed (24h)</span>
                      <span className="font-semibold text-red-600">{systemMetrics?.failedExecutions || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Response Time</span>
                      <span className="font-semibold">{(systemMetrics?.avgResponseTime || 0) / 1000}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>System Alerts</span>
                </CardTitle>
                <CardDescription>
                  Active alerts and notifications from system components
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemHealth?.components.flatMap(component => 
                    component.alerts.map(alert => ({
                      ...alert,
                      componentName: component.name,
                      componentType: component.type
                    }))
                  ).map((alert, index) => (
                    <Alert key={`${alert.componentName}-${alert.id}`} className="border-yellow-200 bg-yellow-50">
                      {getAlertIcon(alert.type)}
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{alert.componentName}</span>
                            <span className="ml-2">{alert.message}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {alert.timestamp.toLocaleString()}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {systemHealth?.components.every(component => component.alerts.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                      <p>No active alerts</p>
                      <p className="text-sm">All systems are operating normally</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
