import {
  WorkflowDefinition,
  WorkflowStep,
  RetryConfig,
  CircuitBreakerConfig,
  WorkflowConfig,
  StepType
} from '@/lib/orchestration/architecture';

export interface AutomationWorkflow {
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

export interface WorkflowExecution {
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

export interface ParseResult {
  success: boolean;
  workflow?: WorkflowDefinition;
  errors: string[];
  warnings: string[];
}

export interface WorkflowMetrics {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTime: number;
  lastExecutionTime?: Date;
  successRate: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class LegacyAutomationParser {
  private readonly defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    backoffStrategy: 'exponential',
    retryableErrors: ['network', 'timeout', 'execution']
  };

  private readonly defaultCircuitBreakerConfig: CircuitBreakerConfig = {
    enabled: true,
    failureThreshold: 5,
    resetTimeoutMs: 60000,
    halfOpenMaxRequests: 3,
    monitoringWindowMs: 60000
  };

  parseAutomationWorkflow(workflow: AutomationWorkflow): ParseResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      if (!workflow.id || !workflow.name) {
        errors.push('Workflow missing required id or name');
        return { success: false, errors, warnings };
      }

      const workflowDefinition: WorkflowDefinition = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        version: '1.0.0',
        steps: this.parseActions(workflow.actions, errors, warnings),
        trigger: this.parseTrigger(workflow.trigger, workflow.type, errors, warnings),
        config: this.createWorkflowConfig(workflow),
        metadata: {
          category: workflow.category,
          createdAt: workflow.createdAt,
          updatedAt: workflow.updatedAt,
          createdBy: workflow.createdBy,
          status: this.mapStatus(workflow.status),
          tags: [workflow.category, workflow.type],
          environment: 'prod'
        }
      };

      const validation = this.validateParsedData(workflowDefinition);
      if (!validation.valid) {
        errors.push(...validation.errors);
        warnings.push(...validation.warnings);
      }

      return {
        success: errors.length === 0,
        workflow: workflowDefinition,
        errors,
        warnings
      };

    } catch (error) {
      errors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, errors, warnings };
    }
  }

  private parseActions(
    actions: AutomationWorkflow['actions'],
    errors: string[],
    warnings: string[]
  ): WorkflowStep[] {
    return actions.map(action => {
      const stepType = this.mapActionTypeToStepType(action.type);

      if (!stepType) {
        warnings.push(`Unknown action type: ${action.type}, defaulting to 'custom'`);
      }

      return {
        id: action.id,
        name: action.name,
        type: stepType || 'custom',
        order: action.order,
        config: action.config,
        dependencies: [],
        retryConfig: this.defaultRetryConfig,
        timeout: 30000,
        enabled: true
      };
    });
  }

  private parseTrigger(
    trigger: AutomationWorkflow['trigger'],
    workflowType: AutomationWorkflow['type'],
    errors: string[],
    warnings: string[]
  ): any {
    const triggerType = this.mapTriggerType(workflowType);

    return {
      id: `trigger_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: triggerType,
      config: trigger.config,
      enabled: true,
      schedule: trigger.schedule,
      webhook: triggerType === 'webhook' ? {
        id: `webhook_${Date.now()}`,
        path: `/webhooks/${trigger.config.path || 'automation'}`,
        method: trigger.config.method || 'POST',
        authentication: trigger.config.authentication || {}
      } : undefined
    };
  }

  private mapActionTypeToStepType(actionType: string): StepType | null {
    const typeMap: Record<string, StepType> = {
      'send_email': 'api',
      'add_to_list': 'api',
      'calculate_score': 'transform',
      'update_crm': 'api',
      'notify_sales': 'webhook',
      'categorize_ticket': 'transform',
      'find_agent': 'transform',
      'assign_ticket': 'api',
      'export_data': 'transform',
      'upload_backup': 'api',
      'cleanup_old': 'api'
    };

    return typeMap[actionType] || null;
  }

  private mapTriggerType(workflowType: AutomationWorkflow['type']): string {
    const triggerMap: Record<string, string> = {
      'form-submission': 'form-submission',
      'user-action': 'user-activity',
      'webhook': 'webhook',
      'scheduled': 'schedule',
      'triggered': 'custom'
    };

    return triggerMap[workflowType] || 'custom';
  }

  private mapStatus(status: AutomationWorkflow['status']): string {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'paused': 'inactive',
      'stopped': 'inactive',
      'error': 'maintenance'
    };

    return statusMap[status] || 'inactive';
  }

  private createWorkflowConfig(workflow: AutomationWorkflow): WorkflowConfig {
    return {
      retryPolicy: this.defaultRetryConfig,
      circuitBreaker: this.defaultCircuitBreakerConfig,
      timeout: Math.max(workflow.metrics.avgExecutionTime * 2, 30000),
      concurrency: {
        maxConcurrent: 10,
        queueSize: 100,
        strategy: 'fifo'
      },
      monitoring: {
        enabled: true,
        sampleRate: 1.0,
        logLevel: 'info'
      }
    };
  }

  parseExecutionHistory(executions: WorkflowExecution[]): any[] {
    return executions.map(execution => ({
      id: execution.id,
      workflowId: execution.workflowId,
      status: this.mapExecutionStatus(execution.status),
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      trigger: {
        id: `trigger_${execution.id}`,
        type: 'manual',
        config: execution.trigger,
        enabled: true
      },
      metadata: {
        executionId: execution.id,
        workflowId: execution.workflowId,
        triggerType: 'manual',
        environment: 'prod',
        source: 'legacy-automation',
        timestamp: execution.startTime
      },
      results: execution.steps.map(step => ({
        stepId: step.id,
        stepName: step.name,
        status: step.status,
        startTime: step.startTime,
        endTime: step.endTime,
        output: step.output,
        error: step.error,
        retryCount: 0,
        logs: []
      })),
      errors: execution.steps
        .filter(step => step.error)
        .map(step => ({
          id: `err_${step.id}`,
          stepId: step.id,
          type: 'execution',
          message: step.error || 'Unknown error',
          timestamp: step.endTime || new Date(),
          retryable: false,
          context: {
            workflowId: execution.workflowId,
            executionId: execution.id,
            stepId: step.id
          }
        })),
      retryCount: 0,
      maxRetries: 3,
      childExecutions: []
    }));
  }

  private mapExecutionStatus(status: WorkflowExecution['status']): string {
    const statusMap: Record<string, string> = {
      'running': 'running',
      'completed': 'completed',
      'failed': 'failed',
      'cancelled': 'cancelled'
    };

    return statusMap[status] || 'failed';
  }

  extractWorkflowMetrics(workflow: AutomationWorkflow): WorkflowMetrics {
    const { totalRuns, successfulRuns, failedRuns, lastRun, avgExecutionTime } = workflow.metrics;

    return {
      totalExecutions: totalRuns,
      successfulExecutions: successfulRuns,
      failedExecutions: failedRuns,
      averageExecutionTime: avgExecutionTime,
      lastExecutionTime: lastRun,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0
    };
  }

  validateParsedData(workflow: WorkflowDefinition): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!workflow.id || workflow.id.trim() === '') {
      errors.push('Workflow ID is required');
    }

    if (!workflow.name || workflow.name.trim() === '') {
      errors.push('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    if (workflow.steps && workflow.steps.length > 0) {
      const stepIds = new Set<string>();
      workflow.steps.forEach((step, index) => {
        if (!step.id || step.id.trim() === '') {
          errors.push(`Step ${index} is missing an ID`);
        } else if (stepIds.has(step.id)) {
          errors.push(`Duplicate step ID: ${step.id}`);
        } else {
          stepIds.add(step.id);
        }

        if (!step.name || step.name.trim() === '') {
          errors.push(`Step ${step.id || index} is missing a name`);
        }

        if (!step.type) {
          errors.push(`Step ${step.id || index} is missing a type`);
        }

        step.dependencies.forEach(depId => {
          if (!stepIds.has(depId)) {
            warnings.push(`Step ${step.id} has dependency on non-existent step: ${depId}`);
          }
        });
      });
    }

    if (!workflow.trigger) {
      errors.push('Workflow trigger is required');
    }

    if (!workflow.config) {
      warnings.push('Workflow config is missing, using defaults');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  detectCircularDependencies(workflow: WorkflowDefinition): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (stepId: string, path: string[] = []): void => {
      if (visiting.has(stepId)) {
        errors.push(`Circular dependency detected: ${[...path, stepId].join(' -> ')}`);
        return;
      }

      if (visited.has(stepId)) {
        return;
      }

      visiting.add(stepId);

      const step = workflow.steps.find(s => s.id === stepId);
      if (step) {
        step.dependencies.forEach(depId => {
          visit(depId, [...path, stepId]);
        });
      }

      visiting.delete(stepId);
      visited.add(stepId);
    };

    workflow.steps.forEach(step => {
      if (!visited.has(step.id)) {
        visit(step.id);
      }
    });

    return errors;
  }

  parseMultipleWorkflows(workflows: AutomationWorkflow[]): {
    successful: WorkflowDefinition[];
    failed: Array<{ workflow: AutomationWorkflow; errors: string[] }>;
    warnings: string[];
  } {
    const successful: WorkflowDefinition[] = [];
    const failed: Array<{ workflow: AutomationWorkflow; errors: string[] }> = [];
    const allWarnings: string[] = [];

    workflows.forEach(workflow => {
      const result = this.parseAutomationWorkflow(workflow);

      if (result.success && result.workflow) {
        successful.push(result.workflow);
        allWarnings.push(...result.warnings);
      } else {
        failed.push({
          workflow,
          errors: result.errors
        });
      }
    });

    return {
      successful,
      failed,
      warnings: allWarnings
    };
  }

  generateMigrationSummary(workflows: AutomationWorkflow[]): {
    totalWorkflows: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    totalExecutions: number;
    totalSuccessfulExecutions: number;
    totalFailedExecutions: number;
    averageSuccessRate: number;
  } {
    const summary = {
      totalWorkflows: workflows.length,
      byStatus: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      totalExecutions: 0,
      totalSuccessfulExecutions: 0,
      totalFailedExecutions: 0,
      averageSuccessRate: 0
    };

    workflows.forEach(workflow => {
      summary.byStatus[workflow.status] = (summary.byStatus[workflow.status] || 0) + 1;
      summary.byType[workflow.type] = (summary.byType[workflow.type] || 0) + 1;
      summary.byCategory[workflow.category] = (summary.byCategory[workflow.category] || 0) + 1;

      summary.totalExecutions += workflow.metrics.totalRuns;
      summary.totalSuccessfulExecutions += workflow.metrics.successfulRuns;
      summary.totalFailedExecutions += workflow.metrics.failedRuns;
    });

    summary.averageSuccessRate = summary.totalExecutions > 0
      ? (summary.totalSuccessfulExecutions / summary.totalExecutions) * 100
      : 0;

    return summary;
  }
}

export const legacyAutomationParser = new LegacyAutomationParser();