'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Filter,
  Search,
  Download,
  Upload,
  Eye,
  Trash2,
  AlertTriangle,
  Info,
  ExternalLink,
  Plus,
  Edit,
  Copy,
  Save,
  Loader2,
  Users,
  Mail,
  Calendar,
  Shield,
  Layers,
  Archive
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  type: 'n8n' | 'temporal' | 'custom' | 'scheduled';
  status: 'active' | 'inactive' | 'draft' | 'archived';
  environment: 'dev' | 'staging' | 'prod';
  version: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedBy: string;
    updatedAt: Date;
    tags: string[];
    category: string;
  };
  metrics: {
    totalExecutions: number;
    successRate: number;
    avgExecutionTime: number;
    lastExecution?: Date;
    errorRate: number;
  };
  configuration: {
    timeout: number;
    retryPolicy: RetryPolicy;
    concurrency: number;
    priority: 'low' | 'normal' | 'high' | 'critical';
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  type: 'n8n' | 'webhook' | 'api' | 'transform' | 'condition' | 'delay' | 'email' | 'database';
  config: Record<string, any>;
  position: { x: number; y: number };
  dependencies: string[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

interface WorkflowTrigger {
  id: string;
  type: 'form-submission' | 'user-activity' | 'webhook' | 'schedule' | 'manual';
  config: Record<string, any>;
  enabled: boolean;
  conditions?: Record<string, any>;
}

interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  backoffMultiplier: number;
  maxBackoff: number;
  retryableErrors: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  tags: string[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowManagementPage() {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEnvironment, setFilterEnvironment] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newWorkflow, setNewWorkflow] = useState<Partial<WorkflowDefinition>>({
    name: '',
    description: '',
    type: 'n8n',
    status: 'draft',
    environment: 'dev',
    steps: [],
    triggers: [],
    metadata: {
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedBy: 'current-user',
      updatedAt: new Date(),
      tags: [],
      category: 'general'
    },
    metrics: {
      totalExecutions: 0,
      successRate: 0,
      avgExecutionTime: 0,
      errorRate: 0
    },
    configuration: {
      timeout: 300000,
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential',
        backoffMultiplier: 2,
        maxBackoff: 30000,
        retryableErrors: ['timeout', 'network', 'rate-limit']
      },
      concurrency: 1,
      priority: 'normal'
    }
  });

  useEffect(() => {
    loadWorkflowData();
  }, []);

  const loadWorkflowData = async () => {
    setIsLoading(true);
    try {
      // Mock data - in real implementation, fetch from API
      const mockWorkflows: WorkflowDefinition[] = [
        {
          id: 'wf-001',
          name: 'Welcome Email Sequence',
          description: 'Automated welcome email sequence for new user registrations',
          type: 'n8n',
          status: 'active',
          environment: 'prod',
          version: '1.2.3',
          steps: [
            {
              id: 'step-1',
              name: 'Send Welcome Email',
              type: 'email',
              config: { template: 'welcome', delay: 0 },
              position: { x: 100, y: 100 },
              dependencies: []
            },
            {
              id: 'step-2',
              name: 'Add to Newsletter',
              type: 'api',
              config: { endpoint: '/api/newsletter/subscribe' },
              position: { x: 300, y: 100 },
              dependencies: ['step-1']
            }
          ],
          triggers: [
            {
              id: 'trigger-1',
              type: 'form-submission',
              config: { formId: 'registration-form' },
              enabled: true
            }
          ],
          metadata: {
            createdBy: 'john.doe@company.com',
            createdAt: new Date('2024-01-15'),
            updatedBy: 'jane.smith@company.com',
            updatedAt: new Date('2024-01-20'),
            tags: ['email', 'onboarding', 'automation'],
            category: 'user-management'
          },
          metrics: {
            totalExecutions: 1247,
            successRate: 97.0,
            avgExecutionTime: 2.3,
            lastExecution: new Date(Date.now() - 2 * 60 * 60 * 1000),
            errorRate: 3.0
          },
          configuration: {
            timeout: 300000,
            retryPolicy: {
              maxRetries: 3,
              backoffStrategy: 'exponential',
              backoffMultiplier: 2,
              maxBackoff: 30000,
              retryableErrors: ['timeout', 'network']
            },
            concurrency: 1,
            priority: 'normal'
          }
        },
        {
          id: 'wf-002',
          name: 'Lead Scoring & Qualification',
          description: 'Automated lead scoring based on user behavior and form submissions',
          type: 'n8n',
          status: 'active',
          environment: 'prod',
          version: '2.1.0',
          steps: [
            {
              id: 'step-1',
              name: 'Calculate Lead Score',
              type: 'transform',
              config: { algorithm: 'weighted-scoring' },
              position: { x: 100, y: 100 },
              dependencies: []
            },
            {
              id: 'step-2',
              name: 'Update CRM Record',
              type: 'api',
              config: { endpoint: '/api/crm/update' },
              position: { x: 300, y: 100 },
              dependencies: ['step-1']
            },
            {
              id: 'step-3',
              name: 'Send Notification',
              type: 'email',
              config: { template: 'lead-qualified' },
              position: { x: 500, y: 100 },
              dependencies: ['step-2']
            }
          ],
          triggers: [
            {
              id: 'trigger-1',
              type: 'user-activity',
              config: { events: ['page_view', 'form_submit', 'download'] },
              enabled: true
            }
          ],
          metadata: {
            createdBy: 'jane.smith@company.com',
            createdAt: new Date('2024-01-10'),
            updatedBy: 'jane.smith@company.com',
            updatedAt: new Date('2024-01-18'),
            tags: ['lead-scoring', 'crm', 'automation'],
            category: 'sales'
          },
          metrics: {
            totalExecutions: 892,
            successRate: 94.7,
            avgExecutionTime: 1.8,
            lastExecution: new Date(Date.now() - 15 * 60 * 1000),
            errorRate: 5.3
          },
          configuration: {
            timeout: 180000,
            retryPolicy: {
              maxRetries: 2,
              backoffStrategy: 'linear',
              backoffMultiplier: 1,
              maxBackoff: 10000,
              retryableErrors: ['timeout', 'network', 'rate-limit']
            },
            concurrency: 5,
            priority: 'high'
          }
        },
        {
          id: 'wf-003',
          name: 'Support Ticket Auto-Assignment',
          description: 'Automatically assign support tickets to available agents based on category and workload',
          type: 'temporal',
          status: 'active',
          environment: 'prod',
          version: '1.0.5',
          steps: [
            {
              id: 'step-1',
              name: 'Auto-categorize Ticket',
              type: 'transform',
              config: { model: 'category-classifier' },
              position: { x: 100, y: 100 },
              dependencies: []
            },
            {
              id: 'step-2',
              name: 'Find Available Agent',
              type: 'api',
              config: { endpoint: '/api/agents/available' },
              position: { x: 300, y: 100 },
              dependencies: ['step-1']
            },
            {
              id: 'step-3',
              name: 'Assign Ticket',
              type: 'api',
              config: { endpoint: '/api/tickets/assign' },
              position: { x: 500, y: 100 },
              dependencies: ['step-2']
            }
          ],
          triggers: [
            {
              id: 'trigger-1',
              type: 'webhook',
              config: { url: '/webhook/ticket-created' },
              enabled: true
            }
          ],
          metadata: {
            createdBy: 'support.team@company.com',
            createdAt: new Date('2024-01-05'),
            updatedBy: 'support.team@company.com',
            updatedAt: new Date('2024-01-15'),
            tags: ['support', 'tickets', 'automation'],
            category: 'customer-support'
          },
          metrics: {
            totalExecutions: 456,
            successRate: 94.7,
            avgExecutionTime: 3.2,
            lastExecution: new Date(Date.now() - 45 * 60 * 1000),
            errorRate: 5.3
          },
          configuration: {
            timeout: 60000,
            retryPolicy: {
              maxRetries: 1,
              backoffStrategy: 'fixed',
              backoffMultiplier: 1,
              maxBackoff: 5000,
              retryableErrors: ['timeout']
            },
            concurrency: 10,
            priority: 'high'
          }
        }
      ];

      const mockTemplates: WorkflowTemplate[] = [
        {
          id: 'template-001',
          name: 'Email Marketing Campaign',
          description: 'Template for automated email marketing campaigns',
          category: 'marketing',
          steps: [
            {
              id: 'step-1',
              name: 'Send Email',
              type: 'email',
              config: { template: 'campaign' },
              position: { x: 100, y: 100 },
              dependencies: []
            }
          ],
          triggers: [
            {
              id: 'trigger-1',
              type: 'schedule',
              config: { cron: '0 9 * * 1' },
              enabled: true
            }
          ],
          tags: ['email', 'marketing', 'campaign']
        },
        {
          id: 'template-002',
          name: 'Data Processing Pipeline',
          description: 'Template for data processing and transformation workflows',
          category: 'data',
          steps: [
            {
              id: 'step-1',
              name: 'Extract Data',
              type: 'api',
              config: { endpoint: '/api/data/extract' },
              position: { x: 100, y: 100 },
              dependencies: []
            },
            {
              id: 'step-2',
              name: 'Transform Data',
              type: 'transform',
              config: { rules: 'data-transformation' },
              position: { x: 300, y: 100 },
              dependencies: ['step-1']
            },
            {
              id: 'step-3',
              name: 'Load Data',
              type: 'database',
              config: { table: 'processed_data' },
              position: { x: 500, y: 100 },
              dependencies: ['step-2']
            }
          ],
          triggers: [
            {
              id: 'trigger-1',
              type: 'schedule',
              config: { cron: '0 2 * * *' },
              enabled: true
            }
          ],
          tags: ['data', 'processing', 'etl']
        }
      ];

      setWorkflows(mockWorkflows);
      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkflow = async () => {
    setIsCreating(true);
    try {
      // Mock API call - in real implementation, call actual API
      const workflow: WorkflowDefinition = {
        id: `wf-${Date.now()}`,
        name: newWorkflow.name || 'Untitled Workflow',
        description: newWorkflow.description || '',
        type: newWorkflow.type || 'n8n',
        status: newWorkflow.status || 'draft',
        environment: newWorkflow.environment || 'dev',
        version: '1.0.0',
        steps: newWorkflow.steps || [],
        triggers: newWorkflow.triggers || [],
        metadata: {
          createdBy: 'current-user',
          createdAt: new Date(),
          updatedBy: 'current-user',
          updatedAt: new Date(),
          tags: newWorkflow.metadata?.tags || [],
          category: newWorkflow.metadata?.category || 'general'
        },
        metrics: {
          totalExecutions: 0,
          successRate: 0,
          avgExecutionTime: 0,
          errorRate: 0
        },
        configuration: newWorkflow.configuration || {
          timeout: 300000,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            backoffMultiplier: 2,
            maxBackoff: 30000,
            retryableErrors: ['timeout', 'network']
          },
          concurrency: 1,
          priority: 'normal'
        }
      };

      setWorkflows(prev => [workflow, ...prev]);
      setCreateDialogOpen(false);
      setNewWorkflow({
        name: '',
        description: '',
        type: 'n8n',
        status: 'draft',
        environment: 'dev',
        steps: [],
        triggers: [],
        metadata: {
          createdBy: 'current-user',
          createdAt: new Date(),
          updatedBy: 'current-user',
          updatedAt: new Date(),
          tags: [],
          category: 'general'
        },
        metrics: {
          totalExecutions: 0,
          successRate: 0,
          avgExecutionTime: 0,
          errorRate: 0
        },
        configuration: {
          timeout: 300000,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            backoffMultiplier: 2,
            maxBackoff: 30000,
            retryableErrors: ['timeout', 'network']
          },
          concurrency: 1,
          priority: 'normal'
        }
      });
    } catch (error) {
      console.error('Error creating workflow:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // Mock API call - in real implementation, call actual API
      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
  };

  const handleToggleWorkflowStatus = async (workflowId: string) => {
    try {
      // Mock API call - in real implementation, call actual API
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' }
          : w
      ));
    } catch (error) {
      console.error('Error toggling workflow status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'draft': return <Edit className="h-4 w-4 text-yellow-500" />;
      case 'archived': return <Archive className="h-4 w-4 text-gray-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'n8n': return <Workflow className="h-4 w-4" />;
      case 'temporal': return <Clock className="h-4 w-4" />;
      case 'custom': return <Settings className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'prod': return 'bg-red-100 text-red-800';
      case 'staging': return 'bg-yellow-100 text-yellow-800';
      case 'dev': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesType = filterType === 'all' || workflow.type === filterType;
    const matchesEnvironment = filterEnvironment === 'all' || workflow.environment === filterEnvironment;
    const matchesSearch = searchQuery === '' ||
      workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.metadata.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesType && matchesEnvironment && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
            <span className="ml-2 text-gray-500">Loading workflows...</span>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Management</h1>
              <p className="text-gray-600">Create, manage, and monitor automation workflows</p>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={loadWorkflowData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Workflow</DialogTitle>
                    <DialogDescription>
                      Create a new automation workflow with custom steps and triggers
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Workflow Name</Label>
                      <Input
                        id="name"
                        value={newWorkflow.name || ''}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter workflow name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newWorkflow.description || ''}
                        onChange={(e) => setNewWorkflow(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter workflow description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={newWorkflow.type || 'n8n'}
                          onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, type: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="n8n">n8n</SelectItem>
                            <SelectItem value="temporal">Temporal</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="environment">Environment</Label>
                        <Select
                          value={newWorkflow.environment || 'dev'}
                          onValueChange={(value) => setNewWorkflow(prev => ({ ...prev, environment: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dev">Development</SelectItem>
                            <SelectItem value="staging">Staging</SelectItem>
                            <SelectItem value="prod">Production</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newWorkflow.metadata?.category || ''}
                        onChange={(e) => setNewWorkflow(prev => ({
                          ...prev,
                          metadata: { ...prev.metadata!, category: e.target.value }
                        }))}
                        placeholder="Enter category"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateWorkflow} disabled={isCreating || !newWorkflow.name}>
                      {isCreating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Workflow
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="workflows" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="workflows" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Management</CardTitle>
                <CardDescription>Filter and search through your workflows</CardDescription>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="n8n">n8n</SelectItem>
                    <SelectItem value="temporal">Temporal</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterEnvironment} onValueChange={setFilterEnvironment}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Environments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Environments</SelectItem>
                    <SelectItem value="dev">Development</SelectItem>
                    <SelectItem value="staging">Staging</SelectItem>
                    <SelectItem value="prod">Production</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Workflows Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Environment</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead>Success Rate</TableHead>
                      <TableHead>Last Execution</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(workflow.type)}
                            <div>
                              <div className="font-medium">{workflow.name}</div>
                              <div className="text-sm text-gray-500">{workflow.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{workflow.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(workflow.status)}>
                            {getStatusIcon(workflow.status)}
                            {workflow.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEnvironmentColor(workflow.environment)}>
                            {workflow.environment}
                          </Badge>
                        </TableCell>
                        <TableCell>{workflow.steps.length}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{workflow.metrics.successRate}%</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${workflow.metrics.successRate}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {workflow.metrics.lastExecution 
                            ? workflow.metrics.lastExecution.toLocaleString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedWorkflow(workflow)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditDialogOpen(true)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleWorkflowStatus(workflow.id)}
                            >
                              {workflow.status === 'active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{workflow.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteWorkflow(workflow.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Templates</CardTitle>
                <CardDescription>Pre-built workflow templates to get started quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Workflow className="h-5 w-5" />
                              <h3 className="text-lg font-semibold">{template.name}</h3>
                              <Badge variant="outline">{template.category}</Badge>
                            </div>
                            <p className="text-gray-600 mb-4">{template.description}</p>
                            <div className="flex flex-wrap gap-2">
                              {template.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              <Copy className="h-4 w-4 mr-2" />
                              Use Template
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

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Workflows</span>
                      <span className="font-semibold">{workflows.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Active Workflows</span>
                      <span className="font-semibold text-green-600">
                        {workflows.filter(w => w.status === 'active').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Success Rate</span>
                      <span className="font-semibold">
                        {(workflows.reduce((acc, w) => acc + w.metrics.successRate, 0) / workflows.length).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Executions</span>
                      <span className="font-semibold">
                        {workflows.reduce((acc, w) => acc + w.metrics.totalExecutions, 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>n8n Workflows</span>
                      <span className="font-semibold">
                        {workflows.filter(w => w.type === 'n8n').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Temporal Workflows</span>
                      <span className="font-semibold">
                        {workflows.filter(w => w.type === 'temporal').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Custom Workflows</span>
                      <span className="font-semibold">
                        {workflows.filter(w => w.type === 'custom').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Scheduled Workflows</span>
                      <span className="font-semibold">
                        {workflows.filter(w => w.type === 'scheduled').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
