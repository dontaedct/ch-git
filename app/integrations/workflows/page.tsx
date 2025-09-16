import { redirect } from 'next/navigation';
import { requireClient } from '@/lib/auth/guard';
import { getPublicEnv } from '@/lib/env';
import Link from 'next/link';
import {
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  Zap,
  ArrowRight,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function WorkflowsPage() {
  const isSafeMode = getPublicEnv().NEXT_PUBLIC_SAFE_MODE === '1';

  let client = null;

  if (!isSafeMode) {
    try {
      client = await requireClient();
    } catch {
      redirect('/login');
    }
  }

  const workflowStats = {
    totalWorkflows: 15,
    activeWorkflows: 8,
    completedToday: 42,
    averageExecutionTime: '3.2s'
  };

  const workflows = [
    {
      id: 'wf-001',
      name: 'Customer Onboarding',
      description: 'Automated customer registration and welcome email sequence',
      status: 'running',
      lastRun: '2 min ago',
      executionTime: '2.1s',
      successRate: 98,
      triggers: ['webhook', 'form_submit'],
      steps: 5
    },
    {
      id: 'wf-002',
      name: 'Payment Processing',
      description: 'Handle payment confirmations and invoice generation',
      status: 'running',
      lastRun: '5 min ago',
      executionTime: '1.8s',
      successRate: 99,
      triggers: ['stripe_webhook'],
      steps: 3
    },
    {
      id: 'wf-003',
      name: 'Content Approval',
      description: 'Review and approve content submissions with notifications',
      status: 'paused',
      lastRun: '1 hour ago',
      executionTime: '4.2s',
      successRate: 95,
      triggers: ['manual', 'scheduled'],
      steps: 7
    },
    {
      id: 'wf-004',
      name: 'Data Backup',
      description: 'Daily backup of critical business data and reports',
      status: 'scheduled',
      lastRun: '22 hours ago',
      executionTime: '12.5s',
      successRate: 100,
      triggers: ['scheduled'],
      steps: 4
    }
  ];

  const recentExecutions = [
    { workflow: 'Customer Onboarding', status: 'completed', duration: '2.1s', timestamp: '2 min ago' },
    { workflow: 'Payment Processing', status: 'completed', duration: '1.8s', timestamp: '5 min ago' },
    { workflow: 'Customer Onboarding', status: 'completed', duration: '2.3s', timestamp: '8 min ago' },
    { workflow: 'Data Backup', status: 'failed', duration: '0.5s', timestamp: '15 min ago' },
    { workflow: 'Payment Processing', status: 'completed', duration: '1.9s', timestamp: '18 min ago' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">Running</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      default:
        return <Badge variant="secondary">Stopped</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Engine</h1>
            <p className="text-gray-600">
              Create, manage, and monitor automated business workflows
            </p>
          </div>
          <Button className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats.activeWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Execution Time</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{workflowStats.averageExecutionTime}</div>
              <p className="text-xs text-muted-foreground">
                -0.8s from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Workflow List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      {getStatusIcon(workflow.status)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>
                    </div>
                  </div>
                  {getStatusBadge(workflow.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Last Run:</span>
                      <span className="ml-1 font-medium">{workflow.lastRun}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Execution Time:</span>
                      <span className="ml-1 font-medium">{workflow.executionTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Success Rate:</span>
                      <span className="ml-1 font-medium">{workflow.successRate}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Steps:</span>
                      <span className="ml-1 font-medium">{workflow.steps}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 text-sm">Triggers:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {workflow.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>

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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Executions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
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
                      <span className="font-medium">{execution.workflow}</span>
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