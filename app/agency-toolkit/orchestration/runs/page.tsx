'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Filter,
  Search,
  Eye,
  Download,
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
  Database
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  payload: any;
  trigger: {
    id: string;
    type: string;
    config: Record<string, any>;
    enabled: boolean;
  };
  metadata: {
    executionId: string;
    workflowId: string;
    triggerType: string;
    userId?: string;
    sessionId?: string;
    environment: string;
    source: string;
    timestamp: Date;
    correlationId?: string;
  };
  startTime: Date;
  endTime?: Date;
  duration?: number;
  results: StepResult[];
  errors: ExecutionError[];
  retryCount: number;
  maxRetries: number;
  childExecutions: string[];
}

interface StepResult {
  stepId: string;
  stepName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: any;
  error?: string;
  retryCount: number;
  logs: StepLog[];
}

interface StepLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, any>;
  stepId: string;
}

interface ExecutionError {
  id: string;
  stepId?: string;
  type: string;
  message: string;
  stack?: string;
  timestamp: Date;
  retryable: boolean;
  context: Record<string, any>;
}

interface ExecutionAnalytics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  p95ExecutionTime: number;
  p99ExecutionTime: number;
  errorDistribution: Record<string, number>;
  triggerTypeDistribution: Record<string, number>;
  environmentDistribution: Record<string, number>;
  timeSeriesData: Array<{
    timestamp: Date;
    executions: number;
    successes: number;
    failures: number;
    avgDuration: number;
  }>;
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowExecutionHistoryPage() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [analytics, setAnalytics] = useState<ExecutionAnalytics | null>(null);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [filterTriggerType, setFilterTriggerType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<string>('24h');

  useEffect(() => {
    loadExecutionData();
  }, [dateRange]);

  const loadExecutionData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          status: 'completed',
          payload: { formId: 'contact-form', submissionId: 'sub-12345' },
          trigger: {
            id: 'trigger-1',
            type: 'form-submission',
            config: { formId: 'contact-form' },
            enabled: true
          },
          metadata: {
            executionId: 'exec-001',
            workflowId: 'wf-001',
            triggerType: 'form-submission',
            userId: 'user-123',
            environment: 'prod',
            source: 'orchestration',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            correlationId: 'corr-001'
          },
          startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
          duration: 2300,
          results: [
            {
              stepId: 'step-1',
              stepName: 'Send Welcome Email',
              status: 'completed',
              startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
              endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
              duration: 1200,
              output: { emailId: 'email-001', status: 'sent' },
              retryCount: 0,
              logs: [
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                  level: 'info',
                  message: 'Sending welcome email',
                  stepId: 'step-1'
                },
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
                  level: 'info',
                  message: 'Welcome email sent successfully',
                  stepId: 'step-1'
                }
              ]
            },
            {
              stepId: 'step-2',
              stepName: 'Add to Newsletter',
              status: 'completed',
              startTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
              endTime: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
              duration: 1100,
              output: { listId: 'newsletter', contactId: 'contact-001' },
              retryCount: 0,
              logs: [
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 1200),
                  level: 'info',
                  message: 'Adding contact to newsletter',
                  stepId: 'step-2'
                },
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 2300),
                  level: 'info',
                  message: 'Contact added to newsletter successfully',
                  stepId: 'step-2'
                }
              ]
            }
          ],
          errors: [],
          retryCount: 0,
          maxRetries: 3,
          childExecutions: []
        },
        {
          id: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          status: 'failed',
          payload: { leadId: 'lead-456', score: 85 },
          trigger: {
            id: 'trigger-2',
            type: 'user-activity',
            config: { events: ['page_view', 'form_submit'] },
            enabled: true
          },
          metadata: {
            executionId: 'exec-002',
            workflowId: 'wf-002',
            triggerType: 'user-activity',
            userId: 'user-456',
            environment: 'prod',
            source: 'orchestration',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            correlationId: 'corr-002'
          },
          startTime: new Date(Date.now() - 15 * 60 * 1000),
          endTime: new Date(Date.now() - 15 * 60 * 1000 + 1850),
          duration: 1850,
          results: [
            {
              stepId: 'step-1',
              stepName: 'Calculate Lead Score',
              status: 'completed',
              startTime: new Date(Date.now() - 15 * 60 * 1000),
              endTime: new Date(Date.now() - 15 * 60 * 1000 + 800),
              duration: 800,
              output: { score: 85, factors: ['page_views', 'form_submits'] },
              retryCount: 0,
              logs: []
            },
            {
              stepId: 'step-2',
              stepName: 'Update CRM Record',
              status: 'failed',
              startTime: new Date(Date.now() - 15 * 60 * 1000 + 800),
              endTime: new Date(Date.now() - 15 * 60 * 1000 + 1850),
              duration: 1050,
              error: 'CRM API timeout',
              retryCount: 2,
              logs: [
                {
                  timestamp: new Date(Date.now() - 15 * 60 * 1000 + 800),
                  level: 'info',
                  message: 'Updating CRM record',
                  stepId: 'step-2'
                },
                {
                  timestamp: new Date(Date.now() - 15 * 60 * 1000 + 1000),
                  level: 'error',
                  message: 'CRM API timeout',
                  stepId: 'step-2'
                }
              ]
            }
          ],
          errors: [
            {
              id: 'err-001',
              stepId: 'step-2',
              type: 'timeout',
              message: 'CRM API timeout',
              timestamp: new Date(Date.now() - 15 * 60 * 1000 + 1000),
              retryable: true,
              context: { api: 'crm', timeout: 5000 }
            }
          ],
          retryCount: 2,
          maxRetries: 3,
          childExecutions: []
        },
        {
          id: 'exec-003',
          workflowId: 'wf-003',
          workflowName: 'Support Ticket Auto-Assignment',
          status: 'running',
          payload: { ticketId: 'ticket-789', category: 'support' },
          trigger: {
            id: 'trigger-3',
            type: 'webhook',
            config: { url: '/webhook/ticket-created' },
            enabled: true
          },
          metadata: {
            executionId: 'exec-003',
            workflowId: 'wf-003',
            triggerType: 'webhook',
            environment: 'prod',
            source: 'orchestration',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            correlationId: 'corr-003'
          },
          startTime: new Date(Date.now() - 5 * 60 * 1000),
          results: [
            {
              stepId: 'step-1',
              stepName: 'Auto-categorize Ticket',
              status: 'completed',
              startTime: new Date(Date.now() - 5 * 60 * 1000),
              endTime: new Date(Date.now() - 5 * 60 * 1000 + 1200),
              duration: 1200,
              output: { category: 'support', confidence: 0.95 },
              retryCount: 0,
              logs: []
            },
            {
              stepId: 'step-2',
              stepName: 'Find Available Agent',
              status: 'running',
              startTime: new Date(Date.now() - 5 * 60 * 1000 + 1200),
              retryCount: 0,
              logs: []
            }
          ],
          errors: [],
          retryCount: 0,
          maxRetries: 3,
          childExecutions: []
        }
      ];

      const mockAnalytics: ExecutionAnalytics = {
        totalExecutions: 1247,
        successfulExecutions: 1210,
        failedExecutions: 37,
        successRate: 97.0,
        averageExecutionTime: 2850,
        p95ExecutionTime: 8500,
        p99ExecutionTime: 15000,
        errorDistribution: {
          'timeout': 15,
          'network': 12,
          'validation': 8,
          'authentication': 2
        },
        triggerTypeDistribution: {
          'form-submission': 45,
          'user-activity': 30,
          'webhook': 20,
          'schedule': 5
        },
        environmentDistribution: {
          'prod': 80,
          'staging': 15,
          'dev': 5
        },
        timeSeriesData: []
      };

      setExecutions(mockExecutions);
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading execution data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <Square className="h-4 w-4 text-gray-500" />;
      case 'timeout': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'timeout': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'form-submission': return <GitBranch className="h-4 w-4" />;
      case 'user-activity': return <Users className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      case 'manual': return <Play className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const filteredExecutions = executions.filter(execution => {
    const matchesStatus = filterStatus === 'all' || execution.status === filterStatus;
    const matchesEnvironment = filterEnvironment === 'all' || execution.metadata.environment === filterEnvironment;
    const matchesTriggerType = filterTriggerType === 'all' || execution.metadata.triggerType === filterTriggerType;
    const matchesSearch = searchQuery === '' ||
      execution.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.workflowId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.workflowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      execution.metadata.correlationId?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesEnvironment && matchesTriggerType && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading execution history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Execution History</h1>
          <p className="text-gray-600">Complete history of workflow executions with detailed logs and analytics</p>
        </div>

        {/* Key Metrics */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Executions</p>
                    <p className="text-3xl font-bold">{analytics.totalExecutions.toLocaleString()}</p>
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
                    <p className="text-3xl font-bold">{analytics.successRate.toFixed(1)}%</p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <p className="text-3xl font-bold">{(analytics.averageExecutionTime / 1000).toFixed(1)}s</p>
                  </div>
                  <Timer className="h-10 w-10 text-purple-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Failed Executions</p>
                    <p className="text-3xl font-bold">{analytics.failedExecutions}</p>
                  </div>
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="executions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="executions" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Execution History</CardTitle>
                <CardDescription>Filter and search through execution history</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Search executions..."
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
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="running">Running</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="timeout">Timeout</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="dev">Development</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTriggerType} onValueChange={setFilterTriggerType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Triggers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Triggers</SelectItem>
                    <SelectItem value="form-submission">Form Submission</SelectItem>
                    <SelectItem value="user-activity">User Activity</SelectItem>
                    <SelectItem value="webhook">Webhook</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={loadExecutionData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </CardContent>
            </Card>

            {/* Executions Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Execution ID</TableHead>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Trigger</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExecutions.map((execution) => (
                      <TableRow key={execution.id}>
                        <TableCell className="font-mono text-sm">
                          {execution.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Workflow className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{execution.workflowName}</div>
                              <div className="text-sm text-gray-500">{execution.workflowId}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(execution.status)}>
                            {getStatusIcon(execution.status)}
                            {execution.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTriggerIcon(execution.metadata.triggerType)}
                            {execution.metadata.triggerType}
                          </div>
                        </TableCell>
                        <TableCell>
                          {execution.duration ? `${(execution.duration / 1000).toFixed(1)}s` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{execution.metadata.environment}</Badge>
                        </TableCell>
                        <TableCell>
                          {execution.startTime.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedExecution(execution)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Error Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.errorDistribution).map(([errorType, count]) => (
                        <div key={errorType} className="flex justify-between items-center">
                          <span className="capitalize">{errorType}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trigger Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.triggerTypeDistribution).map(([triggerType, count]) => (
                        <div key={triggerType} className="flex justify-between items-center">
                          <span className="capitalize">{triggerType}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Environment Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analytics.environmentDistribution).map(([environment, count]) => (
                        <div key={environment} className="flex justify-between items-center">
                          <span className="capitalize">{environment}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Average Execution Time</span>
                        <span className="font-semibold">{(analytics.averageExecutionTime / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>P95 Execution Time</span>
                        <span className="font-semibold">{(analytics.p95ExecutionTime / 1000).toFixed(1)}s</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>P99 Execution Time</span>
                        <span className="font-semibold">{(analytics.p99ExecutionTime / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="errors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Errors</CardTitle>
                <CardDescription>Failed executions and error details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions
                    .filter(execution => execution.status === 'failed')
                    .map((execution) => (
                      <Card key={execution.id} className="border-red-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{execution.id}</h3>
                              <Badge className="bg-red-100 text-red-800">
                                <XCircle className="h-4 w-4 mr-1" />
                                Failed
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {execution.startTime.toLocaleString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {execution.errors.map((error) => (
                              <div key={error.id} className="p-3 bg-red-50 rounded border border-red-200">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                  <span className="font-medium text-red-800">{error.type}</span>
                                  {error.retryable && (
                                    <Badge variant="outline" className="text-xs">Retryable</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-red-700">{error.message}</p>
                                {error.stepId && (
                                  <p className="text-xs text-red-600 mt-1">Step: {error.stepId}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Logs</CardTitle>
                <CardDescription>Detailed logs from all workflow executions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{execution.id}</h3>
                            <Badge className={getStatusColor(execution.status)}>
                              {getStatusIcon(execution.status)}
                              {execution.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {execution.startTime.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {execution.results.map((result) => (
                            <div key={result.stepId} className="p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">{result.stepName}</span>
                                <Badge className={getStatusColor(result.status)}>
                                  {getStatusIcon(result.status)}
                                  {result.status}
                                </Badge>
                              </div>
                              {result.logs.map((log, index) => (
                                <div key={index} className="text-sm text-gray-600 ml-4">
                                  <span className="text-gray-400">
                                    {log.timestamp.toLocaleTimeString()}
                                  </span>
                                  <span className={`ml-2 ${
                                    log.level === 'error' ? 'text-red-600' :
                                    log.level === 'warn' ? 'text-yellow-600' :
                                    log.level === 'info' ? 'text-blue-600' :
                                    'text-gray-600'
                                  }`}>
                                    [{log.level.toUpperCase()}]
                                  </span>
                                  <span className="ml-2">{log.message}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Execution Details Dialog */}
        {selectedExecution && (
          <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Execution Details</DialogTitle>
                <DialogDescription>
                  Detailed information for execution {selectedExecution.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Execution Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Execution ID</Label>
                    <p className="text-sm text-gray-600 font-mono">{selectedExecution.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Workflow</Label>
                    <p className="text-sm text-gray-600">{selectedExecution.workflowName} ({selectedExecution.workflowId})</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedExecution.status)}>
                        {getStatusIcon(selectedExecution.status)}
                        {selectedExecution.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <p className="text-sm text-gray-600">
                      {selectedExecution.duration ? `${(selectedExecution.duration / 1000).toFixed(1)}s` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Start Time</Label>
                    <p className="text-sm text-gray-600">{selectedExecution.startTime.toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">End Time</Label>
                    <p className="text-sm text-gray-600">
                      {selectedExecution.endTime ? selectedExecution.endTime.toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Step Results */}
                <div>
                  <Label className="text-sm font-medium">Step Results</Label>
                  <div className="space-y-2 mt-2">
                    {selectedExecution.results.map((result) => (
                      <Card key={result.stepId} className="border">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{result.stepName}</h4>
                              <Badge className={getStatusColor(result.status)}>
                                {getStatusIcon(result.status)}
                                {result.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-500">
                              {result.duration ? `${(result.duration / 1000).toFixed(1)}s` : 'N/A'}
                            </div>
                          </div>
                          
                          {result.error && (
                            <div className="p-2 bg-red-50 rounded border border-red-200 mb-2">
                              <p className="text-sm text-red-700">{result.error}</p>
                            </div>
                          )}
                          
                          {result.output && (
                            <div className="p-2 bg-green-50 rounded border border-green-200">
                              <pre className="text-xs text-green-700 overflow-x-auto">
                                {JSON.stringify(result.output, null, 2)}
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Errors */}
                {selectedExecution.errors.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Errors</Label>
                    <div className="space-y-2 mt-2">
                      {selectedExecution.errors.map((error) => (
                        <Card key={error.id} className="border-red-200">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="font-medium text-red-800">{error.type}</span>
                              {error.retryable && (
                                <Badge variant="outline" className="text-xs">Retryable</Badge>
                              )}
                            </div>
                            <p className="text-sm text-red-700">{error.message}</p>
                            {error.stepId && (
                              <p className="text-xs text-red-600 mt-1">Step: {error.stepId}</p>
                            )}
                            {error.stack && (
                              <details className="mt-2">
                                <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                                <pre className="text-xs text-red-600 mt-1 overflow-x-auto">
                                  {error.stack}
                                </pre>
                              </details>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Payload */}
                <div>
                  <Label className="text-sm font-medium">Payload</Label>
                  <div className="p-3 bg-gray-50 rounded border mt-2">
                    <pre className="text-xs text-gray-700 overflow-x-auto">
                      {JSON.stringify(selectedExecution.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
