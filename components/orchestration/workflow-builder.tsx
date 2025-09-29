'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Workflow,
  Plus,
  Settings,
  Play,
  Save,
  Trash2,
  Copy,
  Eye,
  Edit,
  Zap,
  Globe,
  Database,
  Mail,
  Clock,
  GitBranch,
  Users,
  Calendar,
  Webhook,
  Layers,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

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

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
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
}

interface StepTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  defaultConfig: Record<string, any>;
}

// ============================================================================
// Main Component
// ============================================================================

export default function WorkflowBuilder() {
  const [workflow, setWorkflow] = useState<WorkflowDefinition>({
    id: 'new-workflow',
    name: 'Untitled Workflow',
    description: '',
    steps: [],
    triggers: [],
    metadata: {
      createdBy: 'current-user',
      createdAt: new Date(),
      updatedBy: 'current-user',
      updatedAt: new Date(),
      tags: [],
      category: 'general'
    }
  });

  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTrigger | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stepDialogOpen, setStepDialogOpen] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  const stepTemplates: StepTemplate[] = [
    {
      id: 'email-step',
      name: 'Send Email',
      type: 'email',
      description: 'Send an email using a template',
      icon: <Mail className="h-4 w-4" />,
      category: 'communication',
      defaultConfig: { template: '', to: '', subject: '' }
    },
    {
      id: 'api-step',
      name: 'API Call',
      type: 'api',
      description: 'Make an HTTP API request',
      icon: <Globe className="h-4 w-4" />,
      category: 'integration',
      defaultConfig: { method: 'GET', url: '', headers: {} }
    },
    {
      id: 'transform-step',
      name: 'Transform Data',
      type: 'transform',
      description: 'Transform and manipulate data',
      icon: <Layers className="h-4 w-4" />,
      category: 'data',
      defaultConfig: { rules: [], mapping: {} }
    },
    {
      id: 'database-step',
      name: 'Database Query',
      type: 'database',
      description: 'Execute a database query',
      icon: <Database className="h-4 w-4" />,
      category: 'data',
      defaultConfig: { query: '', parameters: {} }
    },
    {
      id: 'delay-step',
      name: 'Delay',
      type: 'delay',
      description: 'Wait for a specified duration',
      icon: <Clock className="h-4 w-4" />,
      category: 'control',
      defaultConfig: { duration: 1000 }
    },
    {
      id: 'condition-step',
      name: 'Condition',
      type: 'condition',
      description: 'Conditional logic and branching',
      icon: <GitBranch className="h-4 w-4" />,
      category: 'control',
      defaultConfig: { conditions: [], operator: 'AND' }
    }
  ];

  const triggerTemplates = [
    {
      id: 'form-submission',
      name: 'Form Submission',
      description: 'Trigger when a form is submitted',
      icon: <GitBranch className="h-4 w-4" />,
      defaultConfig: { formId: '' }
    },
    {
      id: 'user-activity',
      name: 'User Activity',
      description: 'Trigger based on user behavior',
      icon: <Users className="h-4 w-4" />,
      defaultConfig: { events: [] }
    },
    {
      id: 'webhook',
      name: 'Webhook',
      description: 'Trigger via HTTP webhook',
      icon: <Webhook className="h-4 w-4" />,
      defaultConfig: { url: '', method: 'POST' }
    },
    {
      id: 'schedule',
      name: 'Schedule',
      description: 'Trigger on a schedule',
      icon: <Calendar className="h-4 w-4" />,
      defaultConfig: { cron: '0 9 * * *' }
    }
  ];

  const addStep = useCallback((template: StepTemplate) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: template.name,
      type: template.type as any,
      config: { ...template.defaultConfig },
      position: { x: 100 + (workflow.steps.length * 200), y: 100 },
      dependencies: []
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
    setStepDialogOpen(false);
  }, [workflow.steps.length]);

  const addTrigger = useCallback((template: any) => {
    const newTrigger: WorkflowTrigger = {
      id: `trigger-${Date.now()}`,
      type: template.id as any,
      config: { ...template.defaultConfig },
      enabled: true
    };

    setWorkflow(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }));
    setTriggerDialogOpen(false);
  }, []);

  const updateStep = useCallback((stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  }, []);

  const updateTrigger = useCallback((triggerId: string, updates: Partial<WorkflowTrigger>) => {
    setWorkflow(prev => ({
      ...prev,
      triggers: prev.triggers.map(trigger => 
        trigger.id === triggerId ? { ...trigger, ...updates } : trigger
      )
    }));
  }, []);

  const deleteStep = useCallback((stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
    setSelectedStep(null);
  }, []);

  const deleteTrigger = useCallback((triggerId: string) => {
    setWorkflow(prev => ({
      ...prev,
      triggers: prev.triggers.filter(trigger => trigger.id !== triggerId)
    }));
    setSelectedTrigger(null);
  }, []);

  const getStepIcon = (type: string) => {
    const template = stepTemplates.find(t => t.type === type);
    return template?.icon || <Workflow className="h-4 w-4" />;
  };

  const getTriggerIcon = (type: string) => {
    const template = triggerTemplates.find(t => t.id === type);
    return template?.icon || <Zap className="h-4 w-4" />;
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'api': return 'bg-green-100 text-green-800 border-green-200';
      case 'transform': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'database': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delay': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'condition': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTriggerColor = (type: string) => {
    switch (type) {
      case 'form-submission': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user-activity': return 'bg-green-100 text-green-800 border-green-200';
      case 'webhook': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'schedule': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <div>
            <Input
              value={workflow.name}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-semibold border-none p-0 h-auto"
            />
            <p className="text-sm text-gray-500">{workflow.steps.length} steps, {workflow.triggers.length} triggers</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button size="sm">
            <Play className="h-4 w-4 mr-2" />
            Test
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-80 border-r bg-gray-50 p-4">
          <Tabs defaultValue="steps" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="steps">Steps</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
            </TabsList>

            <TabsContent value="steps" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Step Templates</h3>
                <Dialog open={stepDialogOpen} onOpenChange={setStepDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Workflow Step</DialogTitle>
                      <DialogDescription>
                        Choose a step template to add to your workflow
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      {stepTemplates.map((template) => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addStep(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {template.icon}
                              <h4 className="font-medium">{template.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{template.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {template.category}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {workflow.steps.map((step) => (
                  <Card 
                    key={step.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedStep?.id === step.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedStep(step)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStepIcon(step.type)}
                          <span className="font-medium text-sm">{step.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStep(step);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteStep(step.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="triggers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Triggers</h3>
                <Dialog open={triggerDialogOpen} onOpenChange={setTriggerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trigger
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Workflow Trigger</DialogTitle>
                      <DialogDescription>
                        Choose a trigger type for your workflow
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      {triggerTemplates.map((template) => (
                        <Card 
                          key={template.id} 
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => addTrigger(template)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-2">
                              {template.icon}
                              <h4 className="font-medium">{template.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{template.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-2">
                {workflow.triggers.map((trigger) => (
                  <Card 
                    key={trigger.id} 
                    className={`cursor-pointer transition-colors ${
                      selectedTrigger?.id === trigger.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTrigger(trigger)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTriggerIcon(trigger.type)}
                          <span className="font-medium text-sm">{trigger.type}</span>
                          {trigger.enabled && (
                            <Badge variant="outline" className="text-xs">Enabled</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrigger(trigger);
                              setIsEditing(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteTrigger(trigger.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            ref={canvasRef}
            className="w-full h-full relative bg-gray-50"
            style={{
              transform: `translate(${canvasPosition.x}px, ${canvasPosition.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Triggers */}
            {workflow.triggers.map((trigger, index) => (
              <div
                key={trigger.id}
                className="absolute"
                style={{
                  left: 50,
                  top: 50 + (index * 120)
                }}
              >
                <Card className={`w-48 cursor-pointer ${getTriggerColor(trigger.type)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {getTriggerIcon(trigger.type)}
                      <span className="font-medium text-sm">{trigger.type}</span>
                    </div>
                    {trigger.enabled && (
                      <Badge variant="outline" className="mt-2 text-xs">Enabled</Badge>
                    )}
                  </CardContent>
                </Card>
                <div className="flex justify-center mt-2">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}

            {/* Steps */}
            {workflow.steps.map((step, index) => (
              <div
                key={step.id}
                className="absolute"
                style={{
                  left: step.position.x,
                  top: step.position.y
                }}
              >
                <Card className={`w-48 cursor-pointer ${getStepColor(step.type)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      {getStepIcon(step.type)}
                      <span className="font-medium text-sm">{step.name}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{step.type}</div>
                  </CardContent>
                </Card>
                {index < workflow.steps.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {workflow.steps.length === 0 && workflow.triggers.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Workflow className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start Building Your Workflow</h3>
                  <p className="text-gray-600 mb-4">Add triggers and steps to create your automation workflow</p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setTriggerDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Trigger
                    </Button>
                    <Button variant="outline" onClick={() => setStepDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Step
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
            >
              -
            </Button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoom(prev => Math.min(2, prev + 0.1))}
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setCanvasPosition({ x: 0, y: 0 });
                setZoom(1);
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Properties Panel */}
        {(selectedStep || selectedTrigger) && (
          <div className="w-80 border-l bg-white p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Properties</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedStep(null);
                  setSelectedTrigger(null);
                }}
              >
                ×
              </Button>
            </div>

            {selectedStep && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="step-name">Step Name</Label>
                  <Input
                    id="step-name"
                    value={selectedStep.name}
                    onChange={(e) => updateStep(selectedStep.id, { name: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="step-type">Step Type</Label>
                  <Select
                    value={selectedStep.type}
                    onValueChange={(value) => updateStep(selectedStep.id, { type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stepTemplates.map((template) => (
                        <SelectItem key={template.type} value={template.type}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="step-timeout">Timeout (ms)</Label>
                  <Input
                    id="step-timeout"
                    type="number"
                    value={selectedStep.timeout || ''}
                    onChange={(e) => updateStep(selectedStep.id, { timeout: parseInt(e.target.value) || undefined })}
                  />
                </div>

                <div>
                  <Label>Configuration</Label>
                  <Textarea
                    value={JSON.stringify(selectedStep.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateStep(selectedStep.id, { config });
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {selectedTrigger && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trigger-type">Trigger Type</Label>
                  <Select
                    value={selectedTrigger.type}
                    onValueChange={(value) => updateTrigger(selectedTrigger.id, { type: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="trigger-enabled"
                    checked={selectedTrigger.enabled}
                    onChange={(e) => updateTrigger(selectedTrigger.id, { enabled: e.target.checked })}
                  />
                  <Label htmlFor="trigger-enabled">Enabled</Label>
                </div>

                <div>
                  <Label>Configuration</Label>
                  <Textarea
                    value={JSON.stringify(selectedTrigger.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        updateTrigger(selectedTrigger.id, { config });
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
