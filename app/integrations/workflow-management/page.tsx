import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import {
  Activity,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Eye,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap,
  Timer,
  Target,
  AlertCircle,
  FileText,
  Calendar,
  Users,
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function WorkflowManagementPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const managementStats = {
    totalWorkflows: 28,
    activeWorkflows: 15,
    completedToday: 342,
    failedToday: 8,
    averageExecutionTime: '4.2s',
    systemUptime: '99.8%',
    errorRate: 2.3,
    performanceScore: 94
  };

  const workflowLifecycle = [
    {
      stage: 'Draft',
      count: 5,
      percentage: 18,
      color: 'bg-gray-100 text-gray-800'
    },
    {
      stage: 'Testing',
      count: 3,
      percentage: 11,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      stage: 'Active',
      count: 15,
      percentage: 54,
      color: 'bg-green-100 text-green-800'
    },
    {
      stage: 'Paused',
      count: 3,
      percentage: 11,
      color: 'bg-orange-100 text-orange-800'
    },
    {
      stage: 'Archived',
      count: 2,
      percentage: 7,
      color: 'bg-blue-100 text-blue-800'
    }
  ];

  const performanceMetrics = [
    {
      name: 'Execution Success Rate',
      value: 97.7,
      target: 95,
      trend: 'up',
      change: '+2.1%'
    },
    {
      name: 'Average Response Time',
      value: 4.2,
      target: 5.0,
      trend: 'down',
      change: '-0.8s',
      unit: 's'
    },
    {
      name: 'Throughput (per hour)',
      value: 156,
      target: 120,
      trend: 'up',
      change: '+24'
    },
    {
      name: 'Error Recovery Rate',
      value: 89.3,
      target: 85,
      trend: 'up',
      change: '+4.2%'
    }
  ];

  const errorHandling = [
    {
      type: 'Connection Timeout',
      count: 12,
      severity: 'medium',
      lastOccurred: '2 hours ago',
      resolution: 'Auto-retry implemented',
      status: 'resolved'
    },
    {
      type: 'API Rate Limit',
      count: 5,
      severity: 'low',
      lastOccurred: '6 hours ago',
      resolution: 'Backoff strategy applied',
      status: 'resolved'
    },
    {
      type: 'Data Validation Error',
      count: 3,
      severity: 'high',
      lastOccurred: '1 hour ago',
      resolution: 'Manual review required',
      status: 'investigating'
    },
    {
      type: 'External Service Unavailable',
      count: 2,
      severity: 'critical',
      lastOccurred: '30 minutes ago',
      resolution: 'Fallback service activated',
      status: 'monitoring'
    }
  ];

  const workflowMonitoring = [
    {
      id: 'wf-001',
      name: 'Customer Onboarding',
      status: 'healthy',
      executionsToday: 45,
      successRate: 98.9,
      avgExecutionTime: '3.2s',
      lastExecution: '5 min ago',
      trend: 'stable',
      alerts: 0
    },
    {
      id: 'wf-002',
      name: 'Payment Processing',
      status: 'warning',
      executionsToday: 128,
      successRate: 94.5,
      avgExecutionTime: '5.8s',
      lastExecution: '2 min ago',
      trend: 'degraded',
      alerts: 2
    },
    {
      id: 'wf-003',
      name: 'Invoice Generation',
      status: 'healthy',
      executionsToday: 87,
      successRate: 99.1,
      avgExecutionTime: '2.1s',
      lastExecution: '1 min ago',
      trend: 'improving',
      alerts: 0
    },
    {
      id: 'wf-004',
      name: 'Data Synchronization',
      status: 'critical',
      executionsToday: 23,
      successRate: 85.2,
      avgExecutionTime: '12.5s',
      lastExecution: '15 min ago',
      trend: 'degraded',
      alerts: 5
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'investigating':
        return <Badge className="bg-yellow-100 text-yellow-800">Investigating</Badge>;
      case 'monitoring':
        return <Badge className="bg-blue-100 text-blue-800">Monitoring</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
      case 'degraded':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Management & Monitoring</h1>
            <p className="text-gray-600">
              Monitor workflow lifecycle, performance tracking, and error handling
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button variant="outline" className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Management Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">Workflows</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">Running</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.failedToday}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.averageExecutionTime}</div>
              <p className="text-xs text-muted-foreground">Execution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Uptime</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.systemUptime}</div>
              <p className="text-xs text-muted-foreground">System</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.errorRate}%</div>
              <p className="text-xs text-muted-foreground">Overall</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{managementStats.performanceScore}</div>
              <p className="text-xs text-muted-foreground">Score</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Workflow Lifecycle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Workflow Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workflowLifecycle.map((stage, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={stage.color}>
                        {stage.stage}
                      </Badge>
                      <span className="text-sm text-gray-600">{stage.count} workflows</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={stage.percentage} className="w-16" />
                      <span className="text-sm font-medium">{stage.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        <span className="text-sm text-gray-600">{metric.change}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold">
                        {metric.value}{metric.unit || '%'}
                      </span>
                      <span className="text-gray-500">
                        Target: {metric.target}{metric.unit || '%'}
                      </span>
                    </div>
                    <Progress
                      value={metric.unit === 's' ? (metric.target / metric.value) * 100 : (metric.value / metric.target) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Error Handling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5" />
                Error Handling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {errorHandling.map((error, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{error.type}</h4>
                        <p className="text-xs text-gray-500">Count: {error.count}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {getSeverityBadge(error.severity)}
                        {getStatusBadge(error.status)}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Last: {error.lastOccurred}</div>
                      <div>Resolution: {error.resolution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Monitoring */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Real-time Workflow Monitoring
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Filter className="h-3 w-3 mr-1" />
                  Filter
                </Button>
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowMonitoring.map((workflow) => (
                <div key={workflow.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-50 p-2 rounded-lg">
                        {getStatusIcon(workflow.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold">{workflow.name}</h3>
                        <p className="text-sm text-gray-600">ID: {workflow.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(workflow.status)}
                      {workflow.alerts > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {workflow.alerts} alerts
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Executions Today:</span>
                      <div className="font-medium">{workflow.executionsToday}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <div className="font-medium">{workflow.successRate}%</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Avg Time:</span>
                      <div className="font-medium">{workflow.avgExecutionTime}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Execution:</span>
                      <div className="font-medium">{workflow.lastExecution}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Trend:</span>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(workflow.trend)}
                        <span className="font-medium capitalize">{workflow.trend}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t">
                    <Progress value={workflow.successRate} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                    {workflow.status === 'critical' && (
                      <Button size="sm" variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Investigate
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8">
          <Link
            href="/integrations"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Integration Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}