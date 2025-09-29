'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SignalZero,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  RotateCcw,
  SkipForward,
  SkipBack
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ExecutionStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  output?: any;
  error?: string;
  retryCount: number;
  logs: ExecutionLog[];
}

interface ExecutionLog {
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, any>;
  stepId: string;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'timeout';
  startTime: Date;
  endTime?: Date;
  duration?: number;
  progress: number;
  currentStep?: string;
  estimatedCompletion?: Date;
  triggerType: string;
  environment: string;
  steps: ExecutionStep[];
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
  retryCount: number;
  maxRetries: number;
}

interface ExecutionMetrics {
  totalExecutions: number;
  activeExecutions: number;
  completedExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  throughput: number;
  errorRate: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ExecutionMonitor() {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [metrics, setMetrics] = useState<ExecutionMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(2000); // 2 seconds
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');

  useEffect(() => {
    loadExecutionData();
    
    if (autoRefresh) {
      const interval = setInterval(loadExecutionData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadExecutionData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockExecutions: WorkflowExecution[] = [
        {
          id: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          status: 'running',
          startTime: new Date(Date.now() - 2 * 60 * 1000),
          progress: 65,
          currentStep: 'Send Welcome Email',
          estimatedCompletion: new Date(Date.now() + 30 * 1000),
          triggerType: 'form-submission',
          environment: 'prod',
          steps: [
            {
              id: 'step-1',
              name: 'Send Welcome Email',
              status: 'completed',
              startTime: new Date(Date.now() - 2 * 60 * 1000),
              endTime: new Date(Date.now() - 1 * 60 * 1000),
              duration: 60000,
              progress: 100,
              output: { emailId: 'email-001', status: 'sent' },
              retryCount: 0,
              logs: [
                {
                  timestamp: new Date(Date.now() - 2 * 60 * 1000),
                  level: 'info',
                  message: 'Starting welcome email send',
                  stepId: 'step-1'
                },
                {
                  timestamp: new Date(Date.now() - 1 * 60 * 1000),
                  level: 'info',
                  message: 'Welcome email sent successfully',
                  stepId: 'step-1'
                }
              ]
            },
            {
              id: 'step-2',
              name: 'Add to Newsletter',
              status: 'running',
              startTime: new Date(Date.now() - 1 * 60 * 1000),
              progress: 65,
              retryCount: 0,
              logs: [
                {
                  timestamp: new Date(Date.now() - 1 * 60 * 1000),
                  level: 'info',
                  message: 'Adding contact to newsletter',
                  stepId: 'step-2'
                }
              ]
            },
            {
              id: 'step-3',
              name: 'Send Follow-up',
              status: 'pending',
              progress: 0,
              retryCount: 0,
              logs: []
            }
          ],
          metadata: {
            executionId: 'exec-001',
            workflowId: 'wf-001',
            triggerType: 'form-submission',
            userId: 'user-123',
            environment: 'prod',
            source: 'orchestration',
            timestamp: new Date(Date.now() - 2 * 60 * 1000),
            correlationId: 'corr-001'
          },
          retryCount: 0,
          maxRetries: 3
        },
        {
          id: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          status: 'failed',
          startTime: new Date(Date.now() - 15 * 60 * 1000),
          endTime: new Date(Date.now() - 10 * 60 * 1000),
          duration: 300000,
          progress: 80,
          triggerType: 'user-activity',
          environment: 'prod',
          steps: [
            {
              id: 'step-1',
              name: 'Calculate Lead Score',
              status: 'completed',
              startTime: new Date(Date.now() - 15 * 60 * 1000),
              endTime: new Date(Date.now() - 12 * 60 * 1000),
              duration: 180000,
              progress: 100,
              output: { score: 85, factors: ['page_views', 'form_submits'] },
              retryCount: 0,
              logs: []
            },
            {
              id: 'step-2',
              name: 'Update CRM Record',
              status: 'failed',
              startTime: new Date(Date.now() - 12 * 60 * 1000),
              endTime: new Date(Date.now() - 10 * 60 * 1000),
              duration: 120000,
              progress: 80,
              error: 'CRM API timeout',
              retryCount: 2,
              logs: [
                {
                  timestamp: new Date(Date.now() - 12 * 60 * 1000),
                  level: 'info',
                  message: 'Updating CRM record',
                  stepId: 'step-2'
                },
                {
                  timestamp: new Date(Date.now() - 11 * 60 * 1000),
                  level: 'error',
                  message: 'CRM API timeout',
                  stepId: 'step-2'
                }
              ]
            }
          ],
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
          retryCount: 2,
          maxRetries: 3
        },
        {
          id: 'exec-003',
          workflowId: 'wf-003',
          workflowName: 'Support Ticket Auto-Assignment',
          status: 'pending',
          startTime: new Date(Date.now() - 5 * 60 * 1000),
          progress: 0,
          triggerType: 'webhook',
          environment: 'prod',
          steps: [
            {
              id: 'step-1',
              name: 'Auto-categorize Ticket',
              status: 'pending',
              progress: 0,
              retryCount: 0,
              logs: []
            },
            {
              id: 'step-2',
              name: 'Find Available Agent',
              status: 'pending',
              progress: 0,
              retryCount: 0,
              logs: []
            }
          ],
          metadata: {
            executionId: 'exec-003',
            workflowId: 'wf-003',
            triggerType: 'webhook',
            environment: 'prod',
            source: 'orchestration',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            correlationId: 'corr-003'
          },
          retryCount: 0,
          maxRetries: 3
        }
      ];

      const mockMetrics: ExecutionMetrics = {
        totalExecutions: 1247,
        activeExecutions: 8,
        completedExecutions: 1210,
        failedExecutions: 37,
        successRate: 97.0,
        averageExecutionTime: 2850,
        throughput: 1250,
        errorRate: 2.3
      };

      setExecutions(mockExecutions);
      setMetrics(mockMetrics);
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
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      case 'timeout': return 'bg-orange-100 text-orange-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'running': return <Activity className="h-3 w-3 text-blue-500" />;
      case 'failed': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'pending': return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'skipped': return <SkipForward className="h-3 w-3 text-gray-500" />;
      case 'timeout': return <AlertTriangle className="h-3 w-3 text-orange-500" />;
      default: return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      case 'timeout': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
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
    const matchesEnvironment = filterEnvironment === 'all' || execution.environment === filterEnvironment;
    return matchesStatus && matchesEnvironment;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading execution data...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Execution Monitor</h2>
            <p className="text-sm text-gray-600">Real-time workflow execution monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm text-gray-600">
              {autoRefresh ? 'Live' : 'Paused'}
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
          <Button onClick={loadExecutionData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metrics.activeExecutions}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{metrics.completedExecutions}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{metrics.failedExecutions}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{metrics.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Executions List */}
        <div className="w-1/2 border-r p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Executions</h3>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={filterEnvironment}
                onChange={(e) => setFilterEnvironment(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="all">All Environments</option>
                <option value="prod">Production</option>
                <option value="staging">Staging</option>
                <option value="dev">Development</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredExecutions.map((execution) => (
              <Card 
                key={execution.id} 
                className={`cursor-pointer transition-colors ${
                  selectedExecution?.id === execution.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedExecution(execution)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{execution.id}</h4>
                      <Badge className={getStatusColor(execution.status)}>
                        {getStatusIcon(execution.status)}
                        {execution.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      {execution.startTime.toLocaleTimeString()}
                    </div>
                  </div>

                  <div className="mb-2">
                    <p className="font-medium text-sm">{execution.workflowName}</p>
                    <p className="text-xs text-gray-500">{execution.workflowId}</p>
                  </div>

                  {execution.status === 'running' && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span>Progress: {execution.progress}%</span>
                        <span>{execution.currentStep}</span>
                      </div>
                      <Progress value={execution.progress} className="h-2" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      {getTriggerIcon(execution.triggerType)}
                      <span>{execution.triggerType}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{execution.environment}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Execution Details */}
        <div className="w-1/2 p-4">
          {selectedExecution ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Execution Details</h3>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{selectedExecution.id}</h4>
                      <Badge className={getStatusColor(selectedExecution.status)}>
                        {getStatusIcon(selectedExecution.status)}
                        {selectedExecution.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedExecution.startTime.toLocaleString()}
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="font-medium">{selectedExecution.workflowName}</p>
                    <p className="text-sm text-gray-500">{selectedExecution.workflowId}</p>
                  </div>

                  {selectedExecution.status === 'running' && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Progress: {selectedExecution.progress}%</span>
                        <span>{selectedExecution.currentStep}</span>
                      </div>
                      <Progress value={selectedExecution.progress} />
                      {selectedExecution.estimatedCompletion && (
                        <p className="text-xs text-gray-500 mt-1">
                          ETA: {selectedExecution.estimatedCompletion.toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Trigger:</span>
                      <span className="font-medium ml-1">{selectedExecution.triggerType}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Environment:</span>
                      <span className="font-medium ml-1">{selectedExecution.environment}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium ml-1">
                        {selectedExecution.duration ? `${(selectedExecution.duration / 1000).toFixed(1)}s` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Retries:</span>
                      <span className="font-medium ml-1">{selectedExecution.retryCount}/{selectedExecution.maxRetries}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Execution Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {selectedExecution.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getStepStatusIcon(step.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{step.name}</span>
                            <Badge className={getStepStatusColor(step.status)}>
                              {step.status}
                            </Badge>
                          </div>
                          {step.status === 'running' && (
                            <div className="mb-2">
                              <Progress value={step.progress} className="h-1" />
                              <p className="text-xs text-gray-500 mt-1">{step.progress}% complete</p>
                            </div>
                          )}
                          {step.duration && (
                            <p className="text-xs text-gray-500">
                              Duration: {(step.duration / 1000).toFixed(1)}s
                            </p>
                          )}
                          {step.error && (
                            <p className="text-xs text-red-600 mt-1">{step.error}</p>
                          )}
                        </div>
                        {index < selectedExecution.steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedExecution.steps.flatMap(step => step.logs).slice(-10).map((log, index) => (
                      <div key={index} className="text-xs">
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
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select an execution to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
