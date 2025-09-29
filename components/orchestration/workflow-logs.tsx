'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
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
  SkipBack,
  FileText,
  Copy,
  Trash2,
  Edit,
  Save,
  Loader2,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowLog {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  message: string;
  data?: Record<string, any>;
  stepId?: string;
  stepName?: string;
  executionId: string;
  workflowId: string;
  workflowName: string;
  environment: string;
  source: string;
  correlationId?: string;
  tags: string[];
  duration?: number;
  retryCount?: number;
  error?: {
    type: string;
    message: string;
    stack?: string;
    code?: string;
  };
}

interface LogFilter {
  level: string;
  environment: string;
  workflowId: string;
  stepId: string;
  timeRange: string;
  searchQuery: string;
}

interface LogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  criticalCount: number;
  errorRate: number;
  avgLogsPerMinute: number;
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowLogsViewer() {
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkflowLog[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<WorkflowLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<LogFilter>({
    level: 'all',
    environment: 'all',
    workflowId: 'all',
    stepId: 'all',
    timeRange: '1h',
    searchQuery: ''
  });
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    applyFilters();
  }, [logs, filter]);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (autoRefresh && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoRefresh]);

  const loadLogs = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockLogs: WorkflowLog[] = [
        {
          id: 'log-001',
          timestamp: new Date(Date.now() - 2 * 60 * 1000),
          level: 'info',
          message: 'Workflow execution started',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-001',
          tags: ['workflow', 'start'],
          data: { workflowId: 'wf-001', executionId: 'exec-001' }
        },
        {
          id: 'log-002',
          timestamp: new Date(Date.now() - 2 * 60 * 1000 + 1000),
          level: 'info',
          message: 'Step 1: Send Welcome Email - Started',
          stepId: 'step-1',
          stepName: 'Send Welcome Email',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-001',
          tags: ['step', 'email'],
          data: { stepId: 'step-1', template: 'welcome' }
        },
        {
          id: 'log-003',
          timestamp: new Date(Date.now() - 2 * 60 * 1000 + 2000),
          level: 'debug',
          message: 'Email template loaded successfully',
          stepId: 'step-1',
          stepName: 'Send Welcome Email',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-001',
          tags: ['email', 'template'],
          data: { template: 'welcome', variables: { name: 'John Doe' } }
        },
        {
          id: 'log-004',
          timestamp: new Date(Date.now() - 2 * 60 * 1000 + 3000),
          level: 'info',
          message: 'Step 1: Send Welcome Email - Completed',
          stepId: 'step-1',
          stepName: 'Send Welcome Email',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-001',
          tags: ['step', 'email', 'completed'],
          duration: 2000,
          data: { emailId: 'email-001', status: 'sent' }
        },
        {
          id: 'log-005',
          timestamp: new Date(Date.now() - 15 * 60 * 1000),
          level: 'error',
          message: 'CRM API timeout after 3 retries',
          stepId: 'step-2',
          stepName: 'Update CRM Record',
          executionId: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-002',
          tags: ['error', 'crm', 'timeout'],
          retryCount: 3,
          error: {
            type: 'timeout',
            message: 'CRM API timeout after 3 retries',
            code: 'TIMEOUT_001'
          },
          data: { api: 'crm', timeout: 5000, retries: 3 }
        },
        {
          id: 'log-006',
          timestamp: new Date(Date.now() - 15 * 60 * 1000 + 1000),
          level: 'critical',
          message: 'Workflow execution failed - CRM integration unavailable',
          executionId: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-002',
          tags: ['critical', 'workflow', 'failed'],
          error: {
            type: 'critical',
            message: 'Workflow execution failed - CRM integration unavailable',
            stack: 'Error: CRM API timeout\n    at CRMConnector.execute (/app/lib/crm-connector.js:45:12)\n    at WorkflowExecutor.runStep (/app/lib/workflow-executor.js:123:8)'
          }
        },
        {
          id: 'log-007',
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          level: 'warn',
          message: 'High memory usage detected in workflow executor',
          executionId: 'exec-003',
          workflowId: 'wf-003',
          workflowName: 'Support Ticket Auto-Assignment',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-003',
          tags: ['warning', 'memory', 'performance'],
          data: { memoryUsage: '85%', threshold: '80%' }
        },
        {
          id: 'log-008',
          timestamp: new Date(Date.now() - 1 * 60 * 1000),
          level: 'info',
          message: 'Workflow execution completed successfully',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          environment: 'prod',
          source: 'orchestration',
          correlationId: 'corr-001',
          tags: ['workflow', 'completed', 'success'],
          duration: 120000,
          data: { totalSteps: 3, completedSteps: 3, successRate: 100 }
        }
      ];

      const mockStats: LogStats = {
        totalLogs: 1247,
        errorCount: 37,
        warningCount: 89,
        infoCount: 1089,
        debugCount: 32,
        criticalCount: 2,
        errorRate: 2.3,
        avgLogsPerMinute: 45
      };

      setLogs(mockLogs);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...logs];

    if (filter.level !== 'all') {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter.environment !== 'all') {
      filtered = filtered.filter(log => log.environment === filter.environment);
    }

    if (filter.workflowId !== 'all') {
      filtered = filtered.filter(log => log.workflowId === filter.workflowId);
    }

    if (filter.stepId !== 'all') {
      filtered = filtered.filter(log => log.stepId === filter.stepId);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(query) ||
        log.workflowName.toLowerCase().includes(query) ||
        log.stepName?.toLowerCase().includes(query) ||
        log.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      case 'debug': return <Settings className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warn': return 'bg-yellow-500 text-white';
      case 'info': return 'bg-blue-500 text-white';
      case 'debug': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getLevelTextColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-red-500';
      case 'warn': return 'text-yellow-500';
      case 'info': return 'text-blue-500';
      case 'debug': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const copyLogToClipboard = (log: WorkflowLog) => {
    const logText = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(logText);
  };

  const exportLogs = () => {
    const logText = filteredLogs.map(log => 
      `[${log.timestamp.toISOString()}] ${log.level.toUpperCase()}: ${log.message}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading logs...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Workflow Logs</h2>
            <p className="text-sm text-gray-600">Real-time workflow execution logs and debugging</p>
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
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
              <div className="text-sm text-gray-600">Total Logs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.errorCount}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warningCount}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgLogsPerMinute}</div>
              <div className="text-sm text-gray-600">Logs/Min</div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex">
        {/* Filters */}
        <div className="w-80 border-r p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={filter.searchQuery}
                onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="level">Log Level</Label>
              <Select
                value={filter.level}
                onValueChange={(value) => setFilter(prev => ({ ...prev, level: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="environment">Environment</Label>
              <Select
                value={filter.environment}
                onValueChange={(value) => setFilter(prev => ({ ...prev, environment: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="prod">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="dev">Development</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="workflow">Workflow</Label>
              <Select
                value={filter.workflowId}
                onValueChange={(value) => setFilter(prev => ({ ...prev, workflowId: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Workflows</SelectItem>
                  <SelectItem value="wf-001">Welcome Email Sequence</SelectItem>
                  <SelectItem value="wf-002">Lead Scoring & Qualification</SelectItem>
                  <SelectItem value="wf-003">Support Ticket Auto-Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timeRange">Time Range</Label>
              <Select
                value={filter.timeRange}
                onValueChange={(value) => setFilter(prev => ({ ...prev, timeRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last Hour</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button
                onClick={() => setFilter({
                  level: 'all',
                  environment: 'all',
                  workflowId: 'all',
                  stepId: 'all',
                  timeRange: '1h',
                  searchQuery: ''
                })}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Logs ({filteredLogs.length})</h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setExpandedLogs(new Set())}
                  variant="outline"
                  size="sm"
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Collapse All
                </Button>
                <Button
                  onClick={() => setExpandedLogs(new Set(filteredLogs.map(log => log.id)))}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Expand All
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getLevelIcon(log.level)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getLevelColor(log.level)}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {log.timestamp.toLocaleString()}
                            </span>
                            {log.duration && (
                              <span className="text-xs text-gray-400">
                                ({log.duration}ms)
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleLogExpansion(log.id)}
                            >
                              {expandedLogs.has(log.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyLogToClipboard(log)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mb-2">
                          <p className="text-sm font-medium">{log.message}</p>
                          {log.stepName && (
                            <p className="text-xs text-gray-500">
                              Step: {log.stepName} ({log.stepId})
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Workflow: {log.workflowName} ({log.workflowId})
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {log.environment}
                          </Badge>
                          {log.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {expandedLogs.has(log.id) && (
                          <div className="mt-3 space-y-3">
                            {log.data && (
                              <div>
                                <Label className="text-xs font-medium">Data</Label>
                                <pre className="text-xs bg-gray-50 p-2 rounded border overflow-x-auto">
                                  {JSON.stringify(log.data, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.error && (
                              <div>
                                <Label className="text-xs font-medium text-red-600">Error Details</Label>
                                <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
                                  <p className="font-medium text-red-800">{log.error.type}</p>
                                  <p className="text-red-700">{log.error.message}</p>
                                  {log.error.code && (
                                    <p className="text-red-600">Code: {log.error.code}</p>
                                  )}
                                  {log.error.stack && (
                                    <details className="mt-2">
                                      <summary className="text-red-600 cursor-pointer">Stack Trace</summary>
                                      <pre className="text-red-600 mt-1 overflow-x-auto">
                                        {log.error.stack}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Execution ID:</span>
                                <span className="font-mono ml-1">{log.executionId}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Correlation ID:</span>
                                <span className="font-mono ml-1">{log.correlationId || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Source:</span>
                                <span className="ml-1">{log.source}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Retry Count:</span>
                                <span className="ml-1">{log.retryCount || 0}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
