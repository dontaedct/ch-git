'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Play,
  Pause,
  Square,
  Settings,
  Zap,
  Workflow,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Database,
  Globe,
  Mail,
  Webhook,
  GitBranch,
  BarChart3,
  Calendar,
  Timer
} from 'lucide-react';

interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'stopped' | 'error';
  type: 'scheduled' | 'triggered' | 'webhook' | 'form-submission' | 'user-action';
  category: 'marketing' | 'sales' | 'support' | 'operations' | 'integration';
  trigger: {
    type: string;
    config: Record<string, any>;
    schedule?: string;
  };
  actions: Array<{
    id: string;
    type: string;
    name: string;
    config: Record<string, any>;
    order: number;
  }>;
  metrics: {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastRun?: Date;
    nextRun?: Date;
    avgExecutionTime: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  trigger: Record<string, any>;
  steps: Array<{
    id: string;
    name: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
    startTime?: Date;
    endTime?: Date;
    output?: Record<string, any>;
    error?: string;
  }>;
  logs: Array<{
    timestamp: Date;
    level: 'info' | 'warn' | 'error';
    message: string;
    data?: Record<string, any>;
  }>;
}

interface AutomationStats {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  executionsToday: number;
  executionsThisWeek: number;
  topWorkflows: Array<{
    id: string;
    name: string;
    executions: number;
    successRate: number;
  }>;
}

export default function AutomationDashboard() {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    // Mock data - in real implementation, fetch from API
    const mockWorkflows: AutomationWorkflow[] = [
      {
        id: 'wf-001',
        name: 'Welcome Email Sequence',
        description: 'Automated welcome email series for new form submissions',
        status: 'active',
        type: 'form-submission',
        category: 'marketing',
        trigger: {
          type: 'form_submission',
          config: { formId: 'contact-form', conditions: [] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'send_email',
            name: 'Send Welcome Email',
            config: { template: 'welcome', delay: 0 },
            order: 1
          },
          {
            id: 'action-2',
            type: 'add_to_list',
            name: 'Add to Newsletter',
            config: { listId: 'newsletter', tags: ['new-subscriber'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'send_email',
            name: 'Send Follow-up Email',
            config: { template: 'follow-up', delay: 86400 },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 1247,
          successfulRuns: 1210,
          failedRuns: 37,
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          avgExecutionTime: 2300
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-15'),
        createdBy: 'admin@agency.com'
      },
      {
        id: 'wf-002',
        name: 'Lead Scoring & Qualification',
        description: 'Automatically score and qualify leads based on behavior and form data',
        status: 'active',
        type: 'triggered',
        category: 'sales',
        trigger: {
          type: 'user_activity',
          config: { events: ['page_view', 'form_submit', 'email_open'] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'calculate_score',
            name: 'Calculate Lead Score',
            config: { scoreRules: { pageViews: 5, formSubmits: 20, emailOpens: 2 } },
            order: 1
          },
          {
            id: 'action-2',
            type: 'update_crm',
            name: 'Update CRM Record',
            config: { crmId: 'salesforce', fields: ['lead_score', 'qualification_status'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'notify_sales',
            name: 'Notify Sales Team',
            config: { threshold: 80, channel: 'slack', users: ['sales-manager'] },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 892,
          successfulRuns: 845,
          failedRuns: 47,
          lastRun: new Date(Date.now() - 15 * 60 * 1000),
          avgExecutionTime: 1850
        },
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-09-10'),
        createdBy: 'sales@agency.com'
      },
      {
        id: 'wf-003',
        name: 'Support Ticket Auto-Assignment',
        description: 'Automatically assign support tickets based on category and agent availability',
        status: 'active',
        type: 'triggered',
        category: 'support',
        trigger: {
          type: 'ticket_created',
          config: { source: 'helpdesk', priority: ['medium', 'high', 'urgent'] }
        },
        actions: [
          {
            id: 'action-1',
            type: 'categorize_ticket',
            name: 'Auto-categorize Ticket',
            config: { aiModel: 'ticket-classifier', confidence: 0.8 },
            order: 1
          },
          {
            id: 'action-2',
            type: 'find_agent',
            name: 'Find Available Agent',
            config: { criteria: ['expertise', 'workload', 'availability'] },
            order: 2
          },
          {
            id: 'action-3',
            type: 'assign_ticket',
            name: 'Assign to Agent',
            config: { notifyAgent: true, escalateIfUnavailable: true },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 456,
          successfulRuns: 432,
          failedRuns: 24,
          lastRun: new Date(Date.now() - 45 * 60 * 1000),
          avgExecutionTime: 3200
        },
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-08-20'),
        createdBy: 'support@agency.com'
      },
      {
        id: 'wf-004',
        name: 'Data Backup & Sync',
        description: 'Daily backup of form submissions and sync to external storage',
        status: 'active',
        type: 'scheduled',
        category: 'operations',
        trigger: {
          type: 'schedule',
          config: {},
          schedule: '0 2 * * *' // Daily at 2 AM
        },
        actions: [
          {
            id: 'action-1',
            type: 'export_data',
            name: 'Export Form Data',
            config: { format: 'csv', includeArchived: false },
            order: 1
          },
          {
            id: 'action-2',
            type: 'upload_backup',
            name: 'Upload to Cloud Storage',
            config: { provider: 'aws-s3', bucket: 'agency-backups' },
            order: 2
          },
          {
            id: 'action-3',
            type: 'cleanup_old',
            name: 'Cleanup Old Backups',
            config: { retentionDays: 30, deleteLocal: true },
            order: 3
          }
        ],
        metrics: {
          totalRuns: 245,
          successfulRuns: 240,
          failedRuns: 5,
          lastRun: new Date(Date.now() - 8 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 16 * 60 * 60 * 1000),
          avgExecutionTime: 12000
        },
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-07-15'),
        createdBy: 'admin@agency.com'
      }
    ];

    const mockExecutions: WorkflowExecution[] = [
      {
        id: 'exec-001',
        workflowId: 'wf-001',
        workflowName: 'Welcome Email Sequence',
        status: 'completed',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
        duration: 2300,
        trigger: { formId: 'contact-form', submissionId: 'sub-12345' },
        steps: [
          {
            id: 'step-1',
            name: 'Send Welcome Email',
            status: 'completed',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
            output: { emailId: 'email-001', status: 'sent' }
          },
          {
            id: 'step-2',
            name: 'Add to Newsletter',
            status: 'completed',
            startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
            endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
            output: { listId: 'newsletter', contactId: 'contact-001' }
          }
        ],
        logs: [
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            level: 'info',
            message: 'Workflow execution started'
          },
          {
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
            level: 'info',
            message: 'Workflow execution completed successfully'
          }
        ]
      }
    ];

    const mockStats: AutomationStats = {
      totalWorkflows: 4,
      activeWorkflows: 4,
      totalExecutions: 2840,
      successRate: 96.2,
      avgExecutionTime: 2850,
      executionsToday: 47,
      executionsThisWeek: 312,
      topWorkflows: [
        { id: 'wf-001', name: 'Welcome Email Sequence', executions: 1247, successRate: 97.0 },
        { id: 'wf-002', name: 'Lead Scoring & Qualification', executions: 892, successRate: 94.7 },
        { id: 'wf-003', name: 'Support Ticket Auto-Assignment', executions: 456, successRate: 94.7 },
        { id: 'wf-004', name: 'Data Backup & Sync', executions: 245, successRate: 98.0 }
      ]
    };

    setWorkflows(mockWorkflows);
    setExecutions(mockExecutions);
    setStats(mockStats);
  };

  const handleWorkflowToggle = async (workflowId: string) => {
    setWorkflows(prev => prev.map(wf =>
      wf.id === workflowId
        ? { ...wf, status: wf.status === 'active' ? 'paused' : 'active' }
        : wf
    ));
  };

  const handleWorkflowRun = async (workflowId: string) => {
    // In real implementation, trigger workflow execution
    console.log('Running workflow:', workflowId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'stopped': return <Square className="h-4 w-4 text-gray-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'stopped': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'marketing': return <Mail className="h-4 w-4" />;
      case 'sales': return <TrendingUp className="h-4 w-4" />;
      case 'support': return <Users className="h-4 w-4" />;
      case 'operations': return <Database className="h-4 w-4" />;
      case 'integration': return <Globe className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'triggered': return <Zap className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'form-submission': return <GitBranch className="h-4 w-4" />;
      case 'user-action': return <Users className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || workflow.category === filterCategory;
    const matchesSearch = searchQuery === '' ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Automation Dashboard</h1>
          <p className="text-gray-600">Manage workflows, monitor executions, and automate business processes</p>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Workflows</p>
                    <p className="text-3xl font-bold">{stats.totalWorkflows}</p>
                  </div>
                  <Workflow className="h-10 w-10 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="text-3xl font-bold">{stats.successRate}%</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Executions Today</p>
                    <p className="text-3xl font-bold">{stats.executionsToday}</p>
                  </div>
                  <Activity className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Execution</p>
                    <p className="text-3xl font-bold">{(stats.avgExecutionTime / 1000).toFixed(1)}s</p>
                  </div>
                  <Timer className="h-10 w-10 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="builder">Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
                <CardDescription>Create, manage, and monitor automated workflows</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="stopped">Stopped</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  Create Workflow
                </Button>
              </CardContent>
            </Card>

            {/* Workflows List */}
            <div className="grid gap-4">
              {filteredWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getCategoryIcon(workflow.category)}
                          <h3 className="text-lg font-semibold">{workflow.name}</h3>
                          <Badge className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            {workflow.status}
                          </Badge>
                          <Badge variant="outline">
                            {getTypeIcon(workflow.type)}
                            {workflow.type}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{workflow.description}</p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total Runs:</span>
                            <span className="font-semibold ml-1">{workflow.metrics.totalRuns.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Success Rate:</span>
                            <span className="font-semibold ml-1">
                              {Math.round((workflow.metrics.successfulRuns / workflow.metrics.totalRuns) * 100)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Avg Time:</span>
                            <span className="font-semibold ml-1">
                              {(workflow.metrics.avgExecutionTime / 1000).toFixed(1)}s
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Last Run:</span>
                            <span className="font-semibold ml-1">
                              {workflow.metrics.lastRun ?
                                new Date(workflow.metrics.lastRun).toLocaleTimeString() :
                                'Never'
                              }
                            </span>
                          </div>
                        </div>

                        {workflow.trigger.schedule && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Schedule:</span>
                            <span className="font-semibold ml-1">{workflow.trigger.schedule}</span>
                            {workflow.metrics.nextRun && (
                              <>
                                <span className="text-gray-500 ml-3">Next Run:</span>
                                <span className="font-semibold ml-1">
                                  {new Date(workflow.metrics.nextRun).toLocaleString()}
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={workflow.status === 'active'}
                            onCheckedChange={() => handleWorkflowToggle(workflow.id)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleWorkflowRun(workflow.id)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedWorkflow(workflow)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="executions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Monitor workflow execution history and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{execution.workflowName}</h3>
                            <Badge className={getStatusColor(execution.status)}>
                              {getStatusIcon(execution.status)}
                              {execution.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {execution.endTime?.toLocaleString() || 'Running...'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="font-semibold ml-1">
                              {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Steps:</span>
                            <span className="font-semibold ml-1">
                              {execution.steps.filter(s => s.status === 'completed').length} / {execution.steps.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Execution ID:</span>
                            <span className="font-mono text-xs ml-1">{execution.id}</span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Steps:</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {execution.steps.map((step) => (
                              <div key={step.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                {getStatusIcon(step.status)}
                                <span className="text-sm">{step.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Workflows</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.topWorkflows.map((workflow, index) => (
                    <div key={workflow.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div>
                        <div className="font-medium">{workflow.name}</div>
                        <div className="text-sm text-gray-500">{workflow.executions} executions</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{workflow.successRate}%</div>
                        <div className="text-sm text-gray-500">success rate</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Execution Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>This Week</span>
                      <span className="font-semibold">{stats?.executionsThisWeek}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Today</span>
                      <span className="font-semibold">{stats?.executionsToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Success Rate</span>
                      <span className="font-semibold">{stats?.successRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg Execution Time</span>
                      <span className="font-semibold">{stats ? (stats.avgExecutionTime / 1000).toFixed(1) : 0}s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Builder</CardTitle>
                <CardDescription>Create new automated workflows with our visual builder</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Workflow className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Visual Workflow Builder</h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop components to create powerful automation workflows
                  </p>
                  <Button>
                    Launch Builder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}