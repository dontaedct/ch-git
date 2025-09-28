'use client';

import { useState } from 'react';
import { useBrandStyling } from '@/lib/branding/use-brand-styling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play,
  Pause,
  Settings,
  Activity,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Mail,
  Database,
  Calendar,
  Users
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  triggers: string[];
  actions: string[];
  status: 'active' | 'inactive' | 'draft';
  executions: number;
  successRate: number;
}

interface BusinessProcess {
  id: string;
  name: string;
  template: string;
  status: 'running' | 'stopped' | 'error';
  lastRun: Date;
  nextRun?: Date;
  metrics: {
    totalRuns: number;
    successRate: number;
    avgDuration: number;
    errorCount: number;
  };
}

export default function BusinessAutomationPage() {
  const { getBrandClasses } = useBrandStyling();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: 'lead-nurturing',
      name: 'Lead Nurturing Workflow',
      category: 'Sales',
      description: 'Automated lead scoring and nurturing sequence with email campaigns',
      triggers: ['Form submission', 'Email engagement', 'Website activity'],
      actions: ['Send email', 'Update CRM', 'Score lead', 'Assign to sales'],
      status: 'active',
      executions: 1247,
      successRate: 94.5
    },
    {
      id: 'customer-onboarding',
      name: 'Customer Onboarding',
      category: 'Customer Success',
      description: 'Complete customer onboarding process with welcome series',
      triggers: ['New customer signup', 'Payment confirmed'],
      actions: ['Send welcome email', 'Create account', 'Schedule call', 'Provision access'],
      status: 'active',
      executions: 856,
      successRate: 98.2
    },
    {
      id: 'invoice-processing',
      name: 'Invoice Processing',
      category: 'Finance',
      description: 'Automated invoice generation and payment tracking',
      triggers: ['Service completion', 'Monthly billing cycle'],
      actions: ['Generate invoice', 'Send to client', 'Track payment', 'Send reminders'],
      status: 'active',
      executions: 2341,
      successRate: 96.8
    },
    {
      id: 'support-escalation',
      name: 'Support Escalation',
      category: 'Support',
      description: 'Automatic support ticket escalation based on priority and SLA',
      triggers: ['High priority ticket', 'SLA breach warning', 'Customer escalation'],
      actions: ['Notify manager', 'Reassign ticket', 'Update priority', 'Send notification'],
      status: 'active',
      executions: 432,
      successRate: 91.7
    },
    {
      id: 'project-updates',
      name: 'Project Status Updates',
      category: 'Project Management',
      description: 'Automated project status reporting and stakeholder notifications',
      triggers: ['Task completion', 'Milestone reached', 'Weekly schedule'],
      actions: ['Generate report', 'Send updates', 'Update dashboard', 'Schedule meetings'],
      status: 'draft',
      executions: 0,
      successRate: 0
    }
  ];

  const activeProcesses: BusinessProcess[] = [
    {
      id: 'process-1',
      name: 'Lead Nurturing - Q4 Campaign',
      template: 'lead-nurturing',
      status: 'running',
      lastRun: new Date('2025-09-16T10:30:00'),
      nextRun: new Date('2025-09-16T16:00:00'),
      metrics: {
        totalRuns: 127,
        successRate: 96.1,
        avgDuration: 45,
        errorCount: 5
      }
    },
    {
      id: 'process-2',
      name: 'New Customer Onboarding',
      template: 'customer-onboarding',
      status: 'running',
      lastRun: new Date('2025-09-16T09:15:00'),
      nextRun: new Date('2025-09-16T18:00:00'),
      metrics: {
        totalRuns: 89,
        successRate: 98.9,
        avgDuration: 120,
        errorCount: 1
      }
    },
    {
      id: 'process-3',
      name: 'Monthly Invoice Generation',
      template: 'invoice-processing',
      status: 'running',
      lastRun: new Date('2025-09-16T08:00:00'),
      nextRun: new Date('2025-10-01T08:00:00'),
      metrics: {
        totalRuns: 45,
        successRate: 100,
        avgDuration: 30,
        errorCount: 0
      }
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      draft: "outline"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Sales':
        return <Users className="h-4 w-4" />;
      case 'Customer Success':
        return <CheckCircle className="h-4 w-4" />;
      case 'Finance':
        return <BarChart3 className="h-4 w-4" />;
      case 'Support':
        return <Mail className="h-4 w-4" />;
      case 'Project Management':
        return <Calendar className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Process Automation</h1>
          <p className="text-muted-foreground">
            Automate common business workflows with intelligent templates and monitoring
          </p>
        </div>
        <Button>
          <Zap className="mr-2 h-4 w-4" />
          Create New Automation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Workflows</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">96.8%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
                <p className="text-2xl font-bold">247h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Executions Today</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Workflow Templates</TabsTrigger>
          <TabsTrigger value="processes">Active Processes</TabsTrigger>
          <TabsTrigger value="create">Create Workflow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeProcesses.slice(0, 3).map((process) => (
                    <div key={process.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(process.status)}
                        <div>
                          <p className="font-medium">{process.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Last run: {process.lastRun.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{process.metrics.successRate}%</Badge>
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
                    <span className="text-sm">Automation Coverage</span>
                    <span className="font-medium">73%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-primary h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Process Efficiency</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-green-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Error Rate</span>
                    <span className="font-medium">2.1%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`bg-red-500 h-2 rounded-full ${getBrandClasses()}`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    {getStatusBadge(template.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Triggers</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.triggers.slice(0, 2).map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                      {template.triggers.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.triggers.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Executions: {template.executions}</span>
                    <span className="text-muted-foreground">Success: {template.successRate}%</span>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">Use Template</Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="processes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Business Processes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeProcesses.map((process) => (
                  <div key={process.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(process.status)}
                        <div>
                          <h3 className="font-medium">{process.name}</h3>
                          <p className="text-sm text-muted-foreground">Template: {process.template}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">Pause</Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Total Runs</p>
                        <p className="font-medium">{process.metrics.totalRuns}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">{process.metrics.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Duration</p>
                        <p className="font-medium">{process.metrics.avgDuration}s</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Errors</p>
                        <p className="font-medium">{process.metrics.errorCount}</p>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Last run: {process.lastRun.toLocaleString()}</span>
                      {process.nextRun && (
                        <span>Next run: {process.nextRun.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-name">Workflow Name</Label>
                    <Input id="workflow-name" placeholder="Enter workflow name" />
                  </div>

                  <div>
                    <Label htmlFor="workflow-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="workflow-template">Base Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {workflowTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-description">Description</Label>
                    <Textarea
                      id="workflow-description"
                      placeholder="Describe what this workflow does"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="workflow-triggers">Triggers</Label>
                    <Textarea
                      id="workflow-triggers"
                      placeholder="List the events that will trigger this workflow"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button>Create Workflow</Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}