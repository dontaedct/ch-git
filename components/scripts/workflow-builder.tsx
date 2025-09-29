'use client';

/**
 * Workflow Automation Builder Component
 * 
 * Interactive component for building and managing automated workflows
 * with drag-and-drop interface and real-time validation.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Play, 
  Save, 
  Download, 
  Upload,
  Settings,
  Clock,
  GitBranch,
  Webhook,
  FileText,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target
} from 'lucide-react';

import type { WorkflowConfig, WorkflowStep } from '../../lib/scripts/automation-engine';

interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowConfig;
  onSave?: (workflow: WorkflowConfig) => void;
  onTest?: (workflow: WorkflowConfig) => Promise<boolean>;
  onClose?: () => void;
}

const TRIGGER_OPTIONS = [
  { value: 'manual', label: 'Manual', icon: Play, description: 'Manually triggered workflow' },
  { value: 'git-push', label: 'Git Push', icon: GitBranch, description: 'Triggered on git push events' },
  { value: 'schedule', label: 'Scheduled', icon: Clock, description: 'Time-based scheduled execution' },
  { value: 'webhook', label: 'Webhook', icon: Webhook, description: 'HTTP webhook triggered' },
  { value: 'file-change', label: 'File Change', icon: FileText, description: 'File system change triggered' }
];

const STEP_TEMPLATES = [
  { id: 'install-deps', name: 'Install Dependencies', script: 'npm ci', category: 'setup' },
  { id: 'lint-code', name: 'Lint Code', script: 'npm run lint', category: 'quality' },
  { id: 'run-tests', name: 'Run Tests', script: 'npm test', category: 'quality' },
  { id: 'type-check', name: 'Type Check', script: 'npm run typecheck', category: 'quality' },
  { id: 'build-app', name: 'Build Application', script: 'npm run build', category: 'build' },
  { id: 'security-scan', name: 'Security Scan', script: 'npm audit', category: 'security' },
  { id: 'deploy-staging', name: 'Deploy to Staging', script: 'npm run deploy:staging', category: 'deploy' },
  { id: 'deploy-prod', name: 'Deploy to Production', script: 'npm run deploy:prod', category: 'deploy' }
];

export function WorkflowBuilder({ 
  initialWorkflow, 
  onSave, 
  onTest, 
  onClose 
}: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<WorkflowConfig>(
    initialWorkflow || {
      id: `workflow-${Date.now()}`,
      name: '',
      description: '',
      trigger: 'manual',
      steps: [],
      parallel: false,
      environment: {},
      schedule: ''
    }
  );

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Validate workflow configuration
  const validateWorkflow = useCallback(() => {
    const errors: string[] = [];

    if (!workflow.name.trim()) {
      errors.push('Workflow name is required');
    }

    if (!workflow.description.trim()) {
      errors.push('Workflow description is required');
    }

    if (workflow.steps.length === 0) {
      errors.push('At least one step is required');
    }

    workflow.steps.forEach((step, index) => {
      if (!step.name.trim()) {
        errors.push(`Step ${index + 1}: Name is required`);
      }
      if (!step.script.trim()) {
        errors.push(`Step ${index + 1}: Script is required`);
      }
    });

    if (workflow.trigger === 'schedule' && !workflow.schedule) {
      errors.push('Schedule is required for scheduled workflows');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  }, [workflow]);

  // Update workflow property
  const updateWorkflow = (updates: Partial<WorkflowConfig>) => {
    setWorkflow(prev => ({ ...prev, ...updates }));
  };

  // Add new step
  const addStep = (template?: typeof STEP_TEMPLATES[0]) => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: template?.name || '',
      script: template?.script || '',
      condition: '',
      continueOnError: false,
      timeout: 300000 // 5 minutes default
    };

    setWorkflow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  };

  // Update step
  const updateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    }));
  };

  // Remove step
  const removeStep = (stepId: string) => {
    setWorkflow(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };

  // Move step up/down
  const moveStep = (stepId: string, direction: 'up' | 'down') => {
    setWorkflow(prev => {
      const steps = [...prev.steps];
      const currentIndex = steps.findIndex(step => step.id === stepId);
      
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= steps.length) return prev;
      
      // Swap steps
      [steps[currentIndex], steps[newIndex]] = [steps[newIndex], steps[currentIndex]];
      
      return { ...prev, steps };
    });
  };

  // Test workflow
  const testWorkflow = async () => {
    if (!validateWorkflow()) {
      setTestResult({ success: false, message: 'Please fix validation errors first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const success = await onTest?.(workflow) ?? true;
      setTestResult({
        success,
        message: success 
          ? 'Workflow test completed successfully!' 
          : 'Workflow test failed. Check logs for details.'
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed with unknown error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save workflow
  const saveWorkflow = () => {
    if (!validateWorkflow()) return;
    onSave?.(workflow);
  };

  // Export workflow
  const exportWorkflow = () => {
    const dataStr = JSON.stringify(workflow, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Validate on changes
  useEffect(() => {
    validateWorkflow();
  }, [validateWorkflow]);

  const selectedTrigger = TRIGGER_OPTIONS.find(option => option.value === workflow.trigger);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Builder</h2>
          <p className="text-muted-foreground">
            Create and configure automated workflows
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportWorkflow}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={testWorkflow} disabled={isTesting}>
            <Play className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test'}
          </Button>
          <Button onClick={saveWorkflow} disabled={validationErrors.length > 0}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Please fix the following issues:</div>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Test Result */}
      {testResult && (
        <Alert className={testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={testResult.success ? 'text-green-700' : 'text-red-700'}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflow-name">Name *</Label>
                <Input
                  id="workflow-name"
                  value={workflow.name}
                  onChange={(e) => updateWorkflow({ name: e.target.value })}
                  placeholder="My Awesome Workflow"
                />
              </div>
              
              <div>
                <Label htmlFor="workflow-description">Description *</Label>
                <Textarea
                  id="workflow-description"
                  value={workflow.description}
                  onChange={(e) => updateWorkflow({ description: e.target.value })}
                  placeholder="Describe what this workflow does..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="workflow-trigger">Trigger *</Label>
                <Select
                  value={workflow.trigger}
                  onValueChange={(value: any) => updateWorkflow({ trigger: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_OPTIONS.map(option => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div>{option.label}</div>
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {workflow.trigger === 'schedule' && (
                <div>
                  <Label htmlFor="workflow-schedule">Schedule (Cron) *</Label>
                  <Input
                    id="workflow-schedule"
                    value={workflow.schedule || ''}
                    onChange={(e) => updateWorkflow({ schedule: e.target.value })}
                    placeholder="0 0 * * *"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Example: "0 0 * * *" for daily at midnight
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="parallel-execution"
                  checked={workflow.parallel}
                  onCheckedChange={(checked) => updateWorkflow({ parallel: !!checked })}
                />
                <Label htmlFor="parallel-execution">Execute steps in parallel</Label>
              </div>
            </CardContent>
          </Card>

          {/* Step Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Step Templates
              </CardTitle>
              <CardDescription>
                Quick add common workflow steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {STEP_TEMPLATES.map(template => (
                  <Button
                    key={template.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addStep(template)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {template.script}
                      </div>
                    </div>
                  </Button>
                ))}
                <Separator className="my-2" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addStep()}
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Custom Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Steps */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Workflow Steps
              </CardTitle>
              <CardDescription>
                Configure the steps that will be executed in this workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workflow.steps.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">
                    No steps configured yet. Add steps using the templates on the left or create custom steps.
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => addStep()} 
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Step
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflow.steps.map((step, index) => (
                    <div key={step.id} className="relative">
                      <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                Step {index + 1}
                              </Badge>
                              <div>
                                <Input
                                  value={step.name}
                                  onChange={(e) => updateStep(step.id, { name: e.target.value })}
                                  placeholder="Step name"
                                  className="font-medium"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStep(step.id, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => moveStep(step.id, 'down')}
                                disabled={index === workflow.steps.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeStep(step.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label>Script/Command *</Label>
                            <Textarea
                              value={step.script}
                              onChange={(e) => updateStep(step.id, { script: e.target.value })}
                              placeholder="npm run build"
                              className="font-mono text-sm"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Condition (optional)</Label>
                              <Input
                                value={step.condition || ''}
                                onChange={(e) => updateStep(step.id, { condition: e.target.value })}
                                placeholder="process.env.NODE_ENV === 'production'"
                              />
                            </div>
                            <div>
                              <Label>Timeout (ms)</Label>
                              <Input
                                type="number"
                                value={step.timeout || 300000}
                                onChange={(e) => updateStep(step.id, { timeout: parseInt(e.target.value) })}
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`continue-on-error-${step.id}`}
                              checked={step.continueOnError}
                              onCheckedChange={(checked) => 
                                updateStep(step.id, { continueOnError: !!checked })
                              }
                            />
                            <Label htmlFor={`continue-on-error-${step.id}`}>
                              Continue workflow if this step fails
                            </Label>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Arrow between steps */}
                      {!workflow.parallel && index < workflow.steps.length - 1 && (
                        <div className="flex justify-center py-2">
                          <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="dashed"
                    onClick={() => addStep()}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
