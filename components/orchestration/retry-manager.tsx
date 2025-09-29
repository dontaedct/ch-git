'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Plus,
  RotateCw,
  AlertOctagon,
  CheckSquare,
  Square as SquareIcon,
  Target,
  Gauge,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Zap as ZapIcon,
  Shield as ShieldIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  Clock as ClockIcon,
  Timer as TimerIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Square as SquareIcon2,
  RefreshCw as RefreshCwIcon,
  Eye as EyeIcon,
  Workflow as WorkflowIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon,
  Globe as GlobeIcon,
  Webhook as WebhookIcon,
  GitBranch as GitBranchIcon,
  BarChart3 as BarChart3Icon,
  Database as DatabaseIcon,
  Monitor as MonitorIcon,
  Layers as LayersIcon,
  Bell as BellIcon,
  Settings as SettingsIcon,
  Filter as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  ExternalLink as ExternalLinkIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Signal as SignalIcon,
  SignalHigh as SignalHighIcon,
  SignalLow as SignalLowIcon,
  SignalZero as SignalZeroIcon,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
  MoreHorizontal as MoreHorizontalIcon,
  RotateCcw as RotateCcwIcon,
  SkipForward as SkipForwardIcon,
  SkipBack as SkipBackIcon,
  FileText as FileTextIcon,
  Copy as CopyIcon,
  Trash2 as Trash2Icon,
  Edit as EditIcon,
  Save as SaveIcon,
  Loader2 as Loader2Icon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  Minus as MinusIcon,
  Plus as PlusIcon
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface RetryPolicy {
  id: string;
  name: string;
  description: string;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  maxRetryDelay: number;
  retryableErrors: string[];
  nonRetryableErrors: string[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
}

interface RetryExecution {
  id: string;
  executionId: string;
  workflowId: string;
  workflowName: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'retrying' | 'completed' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  nextRetryAt: Date | null;
  lastError: string;
  errorType: string;
  retryPolicy: string;
  environment: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, any>;
}

interface RetryStats {
  totalRetries: number;
  successfulRetries: number;
  failedRetries: number;
  pendingRetries: number;
  successRate: number;
  avgRetryTime: number;
  mostCommonErrors: Array<{ error: string; count: number }>;
  retryTrends: Array<{ date: string; count: number }>;
}

// ============================================================================
// Main Component
// ============================================================================

export default function RetryManager() {
  const [retryPolicies, setRetryPolicies] = useState<RetryPolicy[]>([]);
  const [retryExecutions, setRetryExecutions] = useState<RetryExecution[]>([]);
  const [stats, setStats] = useState<RetryStats | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<RetryPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');
  const [filter, setFilter] = useState({
    status: 'all',
    environment: 'all',
    workflowId: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Mock data - in real implementation, fetch from API
      const mockPolicies: RetryPolicy[] = [
        {
          id: 'policy-001',
          name: 'Standard Retry Policy',
          description: 'Default retry policy for most workflows',
          maxRetries: 3,
          retryDelay: 1000,
          backoffMultiplier: 2,
          maxRetryDelay: 30000,
          retryableErrors: ['timeout', 'network_error', 'rate_limit'],
          nonRetryableErrors: ['validation_error', 'authentication_error'],
          enabled: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-15'),
          createdBy: 'admin',
          tags: ['default', 'standard']
        },
        {
          id: 'policy-002',
          name: 'Aggressive Retry Policy',
          description: 'High retry count for critical workflows',
          maxRetries: 10,
          retryDelay: 500,
          backoffMultiplier: 1.5,
          maxRetryDelay: 60000,
          retryableErrors: ['timeout', 'network_error', 'rate_limit', 'server_error'],
          nonRetryableErrors: ['validation_error', 'authentication_error', 'authorization_error'],
          enabled: true,
          createdAt: new Date('2024-01-05'),
          updatedAt: new Date('2024-01-20'),
          createdBy: 'admin',
          tags: ['critical', 'high-retry']
        },
        {
          id: 'policy-003',
          name: 'Conservative Retry Policy',
          description: 'Low retry count for non-critical workflows',
          maxRetries: 1,
          retryDelay: 2000,
          backoffMultiplier: 3,
          maxRetryDelay: 10000,
          retryableErrors: ['timeout', 'network_error'],
          nonRetryableErrors: ['validation_error', 'authentication_error', 'rate_limit'],
          enabled: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-25'),
          createdBy: 'admin',
          tags: ['conservative', 'low-retry']
        }
      ];

      const mockExecutions: RetryExecution[] = [
        {
          id: 'retry-001',
          executionId: 'exec-001',
          workflowId: 'wf-001',
          workflowName: 'Welcome Email Sequence',
          stepId: 'step-1',
          stepName: 'Send Welcome Email',
          status: 'retrying',
          retryCount: 2,
          maxRetries: 3,
          nextRetryAt: new Date(Date.now() + 5000),
          lastError: 'SMTP server timeout',
          errorType: 'timeout',
          retryPolicy: 'policy-001',
          environment: 'prod',
          createdAt: new Date(Date.now() - 10 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 1000),
          metadata: { emailId: 'email-001', recipient: 'user@example.com' }
        },
        {
          id: 'retry-002',
          executionId: 'exec-002',
          workflowId: 'wf-002',
          workflowName: 'Lead Scoring & Qualification',
          stepId: 'step-2',
          stepName: 'Update CRM Record',
          status: 'pending',
          retryCount: 0,
          maxRetries: 10,
          nextRetryAt: new Date(Date.now() + 1000),
          lastError: 'CRM API rate limit exceeded',
          errorType: 'rate_limit',
          retryPolicy: 'policy-002',
          environment: 'prod',
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 60 * 1000),
          metadata: { leadId: 'lead-001', crmId: 'crm-001' }
        },
        {
          id: 'retry-003',
          executionId: 'exec-003',
          workflowId: 'wf-003',
          workflowName: 'Support Ticket Auto-Assignment',
          stepId: 'step-3',
          stepName: 'Assign to Agent',
          status: 'completed',
          retryCount: 1,
          maxRetries: 3,
          nextRetryAt: null,
          lastError: 'Agent service unavailable',
          errorType: 'service_unavailable',
          retryPolicy: 'policy-001',
          environment: 'prod',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          updatedAt: new Date(Date.now() - 25 * 60 * 1000),
          metadata: { ticketId: 'ticket-001', agentId: 'agent-001' }
        },
        {
          id: 'retry-004',
          executionId: 'exec-004',
          workflowId: 'wf-004',
          workflowName: 'Payment Processing',
          stepId: 'step-4',
          stepName: 'Process Payment',
          status: 'failed',
          retryCount: 3,
          maxRetries: 3,
          nextRetryAt: null,
          lastError: 'Invalid payment method',
          errorType: 'validation_error',
          retryPolicy: 'policy-001',
          environment: 'prod',
          createdAt: new Date(Date.now() - 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 55 * 60 * 1000),
          metadata: { paymentId: 'payment-001', amount: 100.00 }
        }
      ];

      const mockStats: RetryStats = {
        totalRetries: 1247,
        successfulRetries: 1089,
        failedRetries: 158,
        pendingRetries: 2,
        successRate: 87.3,
        avgRetryTime: 12500,
        mostCommonErrors: [
          { error: 'timeout', count: 45 },
          { error: 'rate_limit', count: 32 },
          { error: 'network_error', count: 28 },
          { error: 'service_unavailable', count: 15 },
          { error: 'validation_error', count: 12 }
        ],
        retryTrends: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 38 },
          { date: '2024-01-04', count: 61 },
          { date: '2024-01-05', count: 47 }
        ]
      };

      setRetryPolicies(mockPolicies);
      setRetryExecutions(mockExecutions);
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading retry data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'retrying': return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'cancelled': return <Square className="h-4 w-4 text-gray-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500 text-white';
      case 'retrying': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const handleRetryExecution = (executionId: string) => {
    // In real implementation, call API to retry execution
    console.log('Retrying execution:', executionId);
  };

  const handleCancelRetry = (executionId: string) => {
    // In real implementation, call API to cancel retry
    console.log('Cancelling retry:', executionId);
  };

  const handleUpdatePolicy = (policy: RetryPolicy) => {
    // In real implementation, call API to update policy
    console.log('Updating policy:', policy);
  };

  const handleDeletePolicy = (policyId: string) => {
    // In real implementation, call API to delete policy
    console.log('Deleting policy:', policyId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading retry data...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold">Retry Management</h2>
            <p className="text-sm text-gray-600">Manage retry policies and monitor retry executions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="p-4 border-b">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRetries}</div>
              <div className="text-sm text-gray-600">Total Retries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRetries}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avgRetryTime}ms</div>
              <div className="text-sm text-gray-600">Avg Retry Time</div>
            </div>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policies">Retry Policies</TabsTrigger>
          <TabsTrigger value="executions">Retry Executions</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Retry Policies ({retryPolicies.length})</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid gap-4">
              {retryPolicies.map((policy) => (
                <Card key={policy.id} className="border-l-4 border-l-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{policy.name}</h4>
                          <Badge className={policy.enabled ? 'bg-green-500' : 'bg-gray-500'}>
                            {policy.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPolicy(policy)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Retry Policy</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{policy.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePolicy(policy.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Max Retries:</span>
                        <span className="ml-1 font-medium">{policy.maxRetries}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Retry Delay:</span>
                        <span className="ml-1 font-medium">{policy.retryDelay}ms</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Backoff Multiplier:</span>
                        <span className="ml-1 font-medium">{policy.backoffMultiplier}x</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Max Delay:</span>
                        <span className="ml-1 font-medium">{policy.maxRetryDelay}ms</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-gray-500">Retryable Errors:</span>
                        {policy.retryableErrors.map((error) => (
                          <Badge key={error} variant="secondary" className="text-xs">
                            {error}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Non-Retryable Errors:</span>
                        {policy.nonRetryableErrors.map((error) => (
                          <Badge key={error} variant="outline" className="text-xs">
                            {error}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="executions" className="flex-1 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Retry Executions ({retryExecutions.length})</h3>
              <div className="flex items-center gap-2">
                <Select
                  value={filter.status}
                  onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="retrying">Retrying</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search executions..."
                  value={filter.searchQuery}
                  onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-64"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {retryExecutions.map((execution) => (
                <Card key={execution.id} className="border-l-4 border-l-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(execution.status)}
                          <Badge className={getStatusColor(execution.status)}>
                            {execution.status.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {execution.retryCount}/{execution.maxRetries} retries
                          </span>
                          {execution.nextRetryAt && (
                            <span className="text-sm text-gray-500">
                              Next retry: {execution.nextRetryAt.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="mb-3">
                          <h4 className="font-medium">{execution.workflowName}</h4>
                          <p className="text-sm text-gray-600">
                            Step: {execution.stepName} ({execution.stepId})
                          </p>
                          <p className="text-sm text-gray-600">
                            Execution: {execution.executionId}
                          </p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-600">Last Error:</p>
                          <p className="text-sm text-gray-700">{execution.lastError}</p>
                          <p className="text-xs text-gray-500">Type: {execution.errorType}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {execution.environment}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {execution.retryPolicy}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {execution.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleRetryExecution(execution.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Retry Now
                          </Button>
                        )}
                        {execution.status === 'retrying' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelRetry(execution.id)}
                          >
                            <Square className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Policy Editor Dialog */}
      {selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Retry Policy</h3>
              <Button
                variant="outline"
                onClick={() => setSelectedPolicy(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Policy Name</Label>
                <Input
                  id="name"
                  value={selectedPolicy.name}
                  onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedPolicy.description}
                  onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRetries">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={selectedPolicy.maxRetries}
                    onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, maxRetries: parseInt(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="retryDelay">Retry Delay (ms)</Label>
                  <Input
                    id="retryDelay"
                    type="number"
                    value={selectedPolicy.retryDelay}
                    onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, retryDelay: parseInt(e.target.value) } : null)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="backoffMultiplier">Backoff Multiplier</Label>
                  <Input
                    id="backoffMultiplier"
                    type="number"
                    step="0.1"
                    value={selectedPolicy.backoffMultiplier}
                    onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, backoffMultiplier: parseFloat(e.target.value) } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="maxRetryDelay">Max Retry Delay (ms)</Label>
                  <Input
                    id="maxRetryDelay"
                    type="number"
                    value={selectedPolicy.maxRetryDelay}
                    onChange={(e) => setSelectedPolicy(prev => prev ? { ...prev, maxRetryDelay: parseInt(e.target.value) } : null)}
                  />
                </div>
              </div>

              <div>
                <Label>Enabled</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Switch
                    checked={selectedPolicy.enabled}
                    onCheckedChange={(checked) => setSelectedPolicy(prev => prev ? { ...prev, enabled: checked } : null)}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedPolicy.enabled ? 'Policy is enabled' : 'Policy is disabled'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPolicy(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleUpdatePolicy(selectedPolicy);
                    setSelectedPolicy(null);
                  }}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
