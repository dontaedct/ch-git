import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Plus,
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  ArrowRight,
  GitBranch,
  Zap,
  Timer,
  Target,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default async function AutomationPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const orchestrationStats = {
    activeAutomations: 12,
    scheduledTasks: 24,
    completedToday: 156,
    averageExecutionTime: '2.8s',
    successRate: 96.5,
    dependencies: 8
  };

  const automationTasks = [
    {
      id: 'auto-001',
      name: 'Daily Report Generation',
      description: 'Generate and distribute daily business reports to stakeholders',
      status: 'running',
      schedule: 'Daily at 9:00 AM',
      nextRun: 'Tomorrow 9:00 AM',
      lastRun: 'Today 9:00 AM',
      executionTime: '4.2s',
      successRate: 98,
      dependencies: ['Database Sync', 'Email Service'],
      priority: 'high',
      retryCount: 0
    },
    {
      id: 'auto-002',
      name: 'Customer Data Sync',
      description: 'Synchronize customer data between CRM and marketing platforms',
      status: 'scheduled',
      schedule: 'Every 4 hours',
      nextRun: 'In 2 hours',
      lastRun: '2 hours ago',
      executionTime: '1.8s',
      successRate: 99,
      dependencies: ['CRM API', 'Marketing Platform'],
      priority: 'critical',
      retryCount: 0
    },
    {
      id: 'auto-003',
      name: 'Backup Validation',
      description: 'Validate integrity of automated backup processes',
      status: 'paused',
      schedule: 'Weekly on Sunday',
      nextRun: 'Sunday 2:00 AM',
      lastRun: 'Last Sunday',
      executionTime: '12.5s',
      successRate: 95,
      dependencies: ['Backup Service', 'Storage System'],
      priority: 'medium',
      retryCount: 2
    },
    {
      id: 'auto-004',
      name: 'Invoice Processing',
      description: 'Automated invoice generation and payment processing',
      status: 'running',
      schedule: 'Every hour',
      nextRun: 'In 45 minutes',
      lastRun: '15 minutes ago',
      executionTime: '3.1s',
      successRate: 97,
      dependencies: ['Payment Gateway', 'Accounting System'],
      priority: 'critical',
      retryCount: 0
    }
  ];

  const dependencyChain = [
    {
      name: 'Data Collection',
      status: 'completed',
      duration: '0.8s',
      dependencies: []
    },
    {
      name: 'Data Validation',
      status: 'completed',
      duration: '1.2s',
      dependencies: ['Data Collection']
    },
    {
      name: 'Processing Engine',
      status: 'running',
      duration: '2.1s',
      dependencies: ['Data Validation']
    },
    {
      name: 'Report Generation',
      status: 'pending',
      duration: '-',
      dependencies: ['Processing Engine']
    },
    {
      name: 'Email Distribution',
      status: 'pending',
      duration: '-',
      dependencies: ['Report Generation']
    }
  ];

  const recentExecutions = [
    { task: 'Invoice Processing', status: 'completed', duration: '3.1s', timestamp: '15 min ago' },
    { task: 'Customer Data Sync', status: 'completed', duration: '1.8s', timestamp: '2 hours ago' },
    { task: 'Daily Report Generation', status: 'completed', duration: '4.2s', timestamp: '6 hours ago' },
    { task: 'Backup Validation', status: 'failed', duration: '0.5s', timestamp: '1 day ago' },
    { task: 'Invoice Processing', status: 'completed', duration: '2.9s', timestamp: '1 hour ago' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Timer className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      default:
        return <Badge variant="outline">Low</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Orchestration</h1>
            <p className="text-gray-600">
              Manage task scheduling, dependencies, and execution coordination
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Automation
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.activeAutomations}</div>
              <p className="text-xs text-muted-foreground">Automations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.scheduledTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.completedToday}</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Time</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.averageExecutionTime}</div>
              <p className="text-xs text-muted-foreground">Execution</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.successRate}%</div>
              <p className="text-xs text-muted-foreground">Overall</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
              <GitBranch className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orchestrationStats.dependencies}</div>
              <p className="text-xs text-muted-foreground">Active</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Automation Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Automation Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationTasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-50 p-2 rounded-lg">
                            {getStatusIcon(task.status)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{task.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">Schedule:</span>
                          <span className="ml-1 font-medium">{task.schedule}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Next Run:</span>
                          <span className="ml-1 font-medium">{task.nextRun}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Execution:</span>
                          <span className="ml-1 font-medium">{task.executionTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Success Rate:</span>
                          <span className="ml-1 font-medium">{task.successRate}%</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">Dependencies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {task.dependencies.map((dep, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {dep}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {task.retryCount > 0 && (
                        <div className="mb-3 text-sm">
                          <span className="text-yellow-600">
                            <RotateCcw className="inline h-3 w-3 mr-1" />
                            Retries: {task.retryCount}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dependency Chain */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="mr-2 h-5 w-5" />
                  Dependency Chain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dependencyChain.map((step, index) => (
                    <div key={index} className="relative">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          {getStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{step.name}</h4>
                          <p className="text-sm text-gray-500">
                            Duration: {step.duration}
                          </p>
                        </div>
                      </div>
                      {index < dependencyChain.length - 1 && (
                        <div className="absolute left-5 top-12 w-0.5 h-4 bg-gray-300"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Executions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentExecutions.map((execution, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {execution.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : execution.status === 'failed' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <div>
                      <span className="font-medium">{execution.task}</span>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Duration: {execution.duration}</span>
                        <span>•</span>
                        <span>{execution.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={execution.status === 'completed' ? 'default' : 'destructive'}
                    className={execution.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {execution.status}
                  </Badge>
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