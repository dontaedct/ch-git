'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  centralizedActionsManager,
  ActionTemplate,
  ActionExecution,
  ActionParameter
} from '@/lib/control/centralized-actions';
import {
  bulkOperationsManager,
  BulkOperation
} from '@/lib/control/bulk-operations';
import {
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Settings,
  Activity
} from 'lucide-react';

interface BulkActionsProps {
  selectedClients: string[];
  onExecutionComplete?: () => void;
  className?: string;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedClients,
  onExecutionComplete,
  className
}) => {
  const [actionTemplates, setActionTemplates] = useState<ActionTemplate[]>([]);
  const [activeExecutions, setActiveExecutions] = useState<ActionExecution[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ActionTemplate | null>(null);
  const [parameterValues, setParameterValues] = useState<Record<string, any>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);

  useEffect(() => {
    loadActionTemplates();
    loadActiveExecutions();
    loadBulkOperations();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveExecutions();
      loadBulkOperations();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadActionTemplates = async () => {
    try {
      const templates = await centralizedActionsManager.getActionTemplates();
      setActionTemplates(templates);
    } catch (error) {
      console.error('Error loading action templates:', error);
    }
  };

  const loadActiveExecutions = async () => {
    try {
      const executions = await centralizedActionsManager.getAllActionExecutions();
      setActiveExecutions(executions.filter(e =>
        e.status === 'running' || e.status === 'pending'
      ));
    } catch (error) {
      console.error('Error loading active executions:', error);
    }
  };

  const loadBulkOperations = async () => {
    try {
      const operations = await bulkOperationsManager.getAllBulkOperations();
      setBulkOperations(operations.filter(o =>
        o.status === 'running' || o.status === 'pending'
      ).slice(0, 5));
    } catch (error) {
      console.error('Error loading bulk operations:', error);
    }
  };

  const handleTemplateSelect = (template: ActionTemplate) => {
    setSelectedTemplate(template);

    // Initialize parameter values with defaults
    const initialValues: Record<string, any> = {};
    template.parameters.forEach(param => {
      if (param.defaultValue !== undefined) {
        initialValues[param.name] = param.defaultValue;
      }
    });
    setParameterValues(initialValues);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameterValues(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const validateParameters = (): string[] => {
    const errors: string[] = [];

    if (!selectedTemplate) {
      errors.push('Please select an action template');
      return errors;
    }

    if (selectedClients.length === 0) {
      errors.push('Please select at least one client');
      return errors;
    }

    selectedTemplate.parameters.forEach(param => {
      if (param.required && !parameterValues[param.name]) {
        errors.push(`${param.name} is required`);
      }

      if (param.validation && parameterValues[param.name]) {
        const value = parameterValues[param.name];

        if (param.validation.min && value < param.validation.min) {
          errors.push(`${param.name} must be at least ${param.validation.min}`);
        }

        if (param.validation.max && value > param.validation.max) {
          errors.push(`${param.name} must be at most ${param.validation.max}`);
        }

        if (param.validation.pattern) {
          const regex = new RegExp(param.validation.pattern);
          if (!regex.test(value)) {
            errors.push(`${param.name} format is invalid`);
          }
        }
      }
    });

    return errors;
  };

  const executeAction = async () => {
    const validationErrors = validateParameters();
    if (validationErrors.length > 0) {
      alert('Validation errors:\n' + validationErrors.join('\n'));
      return;
    }

    if (!selectedTemplate) return;

    setIsExecuting(true);
    try {
      const execution = await centralizedActionsManager.createActionExecution(
        selectedTemplate.id,
        selectedClients,
        parameterValues,
        'admin' // This should come from auth context
      );

      await centralizedActionsManager.executeAction(execution.id);

      setShowExecutionDialog(false);
      setSelectedTemplate(null);
      setParameterValues({});

      if (onExecutionComplete) {
        onExecutionComplete();
      }

      loadActiveExecutions();
    } catch (error) {
      console.error('Error executing action:', error);
      alert('Failed to execute action');
    } finally {
      setIsExecuting(false);
    }
  };

  const cancelExecution = async (executionId: string) => {
    try {
      await centralizedActionsManager.cancelActionExecution(executionId);
      loadActiveExecutions();
    } catch (error) {
      console.error('Error cancelling execution:', error);
    }
  };

  const renderParameterInput = (param: ActionParameter) => {
    const value = parameterValues[param.name];

    switch (param.type) {
      case 'string':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            placeholder={param.description}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleParameterChange(param.name, parseInt(e.target.value))}
            placeholder={param.description}
            min={param.validation?.min}
            max={param.validation?.max}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => handleParameterChange(param.name, checked)}
            />
            <label className="text-sm">{param.description}</label>
          </div>
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(val) => handleParameterChange(param.name, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={param.description} />
            </SelectTrigger>
            <SelectContent>
              {param.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {param.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  checked={(value || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      handleParameterChange(param.name, [...currentValues, option]);
                    } else {
                      handleParameterChange(param.name, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                />
                <label className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        );

      default:
        return <div>Unknown parameter type</div>;
    }
  };

  const getRiskColor = (risk: ActionTemplate['riskLevel']) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: ActionExecution['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Perform common bulk operations on {selectedClients.length} selected clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              disabled={selectedClients.length === 0}
              onClick={() => bulkOperationsManager.deployMultipleClients(selectedClients)}
            >
              <Play className="h-4 w-4 mr-2" />
              Deploy All
            </Button>

            <Button
              variant="outline"
              disabled={selectedClients.length === 0}
              onClick={() => bulkOperationsManager.suspendMultipleClients(selectedClients)}
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspend All
            </Button>

            <Button
              variant="outline"
              disabled={selectedClients.length === 0}
              onClick={() => bulkOperationsManager.restartMultipleClients(selectedClients)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Restart All
            </Button>

            <Button
              variant="outline"
              disabled={selectedClients.length === 0}
              onClick={() => bulkOperationsManager.backupMultipleClients(selectedClients)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Backup All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Actions</CardTitle>
          <CardDescription>
            Execute complex operations with custom parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {actionTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant="outline" className={getRiskColor(template.riskLevel)}>
                      {template.riskLevel} risk
                    </Badge>
                    <Badge variant="secondary">
                      ~{template.estimatedDuration}min
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>

                <Dialog open={showExecutionDialog && selectedTemplate?.id === template.id}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={selectedClients.length === 0}
                      onClick={() => {
                        handleTemplateSelect(template);
                        setShowExecutionDialog(true);
                      }}
                    >
                      Configure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{template.name}</DialogTitle>
                      <DialogDescription>
                        {template.description}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <Alert>
                        <Users className="h-4 w-4" />
                        <AlertDescription>
                          This action will be performed on {selectedClients.length} selected clients.
                          Estimated duration: {template.estimatedDuration} minutes.
                        </AlertDescription>
                      </Alert>

                      {template.preconditions.length > 0 && (
                        <div>
                          <Label className="font-semibold">Preconditions:</Label>
                          <ul className="text-sm text-gray-600 mt-1">
                            {template.preconditions.map((condition, index) => (
                              <li key={index}>• {condition}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {template.parameters.length > 0 && (
                        <div className="space-y-3">
                          <Label className="font-semibold">Parameters:</Label>
                          {template.parameters.map((param) => (
                            <div key={param.name} className="space-y-2">
                              <Label>
                                {param.name}
                                {param.required && <span className="text-red-500">*</span>}
                              </Label>
                              {renderParameterInput(param)}
                              {param.description && (
                                <p className="text-xs text-gray-500">{param.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowExecutionDialog(false);
                            setSelectedTemplate(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={executeAction}
                          disabled={isExecuting}
                        >
                          {isExecuting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Executing...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Execute Action
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Executions */}
      {activeExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Executions</CardTitle>
            <CardDescription>
              Currently running actions and bulk operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(execution.status)}
                      <h4 className="font-semibold">{execution.templateName}</h4>
                      <Badge variant="outline">
                        {execution.targetClients.length} clients
                      </Badge>
                    </div>
                    <div className="mt-2">
                      <Progress value={execution.progress} className="w-full" />
                      <p className="text-xs text-gray-500 mt-1">
                        {execution.progress}% complete
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {execution.status === 'running' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelExecution(execution.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkActions;