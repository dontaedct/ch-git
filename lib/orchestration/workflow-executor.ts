/**
 * Workflow Execution Engine
 * 
 * Implements workflow execution engine with validation, retry logic,
 * and comprehensive error handling per PRD Section 8 requirements.
 */

import {
  WorkflowDefinition,
  WorkflowExecution,
  ExecutionStatus,
  StepResult,
  ExecutionError,
  ExecutionMetadata,
  WorkflowStep,
  RetryConfig,
  CircuitBreakerConfig,
  Environment,
  TriggerType,
  ExecutionPriority,
  LogLevel,
  ErrorType,
  BackoffStrategy,
  OrchestrationError,
  WorkflowNotFoundError,
  ExecutionNotFoundError,
  WorkflowExecutionTimeoutError,
  InvalidWorkflowDefinitionError
} from './architecture';
import { N8nConnector, N8nExecutionRequest } from './n8n-connector';

// ============================================================================
// Workflow Execution Engine Configuration
// ============================================================================

export interface WorkflowExecutorConfig {
  maxConcurrentExecutions: number;
  defaultTimeout: number;
  enableMetrics: boolean;
  enableTracing: boolean;
  retryConfig: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  n8nConnector: N8nConnector;
}

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  environment: Environment;
  startTime: Date;
  timeout?: number;
  priority: ExecutionPriority;
}

export interface ExecutionResult {
  success: boolean;
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  duration: number;
  results: StepResult[];
  errors: ExecutionError[];
  metadata: ExecutionMetadata;
}

// ============================================================================
// Workflow Execution Engine Class
// ============================================================================

export class WorkflowExecutor {
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private executionQueue: Array<ExecutionContext> = [];
  private metrics: Map<string, number> = new Map();
  private isProcessing = false;

  constructor(private config: WorkflowExecutorConfig) {}

  /**
   * Execute workflow with validation and error handling
   */
  async executeWorkflow(
    workflow: WorkflowDefinition,
    payload: any,
    context: Partial<ExecutionContext> = {}
  ): Promise<ExecutionResult> {
    // Validate workflow
    this.validateWorkflow(workflow);

    // Create execution context
    const executionContext = this.createExecutionContext(workflow, context);
    
    // Create workflow execution
    const execution = this.createWorkflowExecution(workflow, payload, executionContext);
    
    // Store active execution
    this.activeExecutions.set(execution.id, execution);

    try {
      // Execute workflow
      const result = await this.executeWorkflowSteps(execution, workflow, payload);
      
      // Update execution status
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      if (this.config.enableMetrics) {
        this.recordMetric('execution_successes', 1);
        this.recordMetric('execution_duration', execution.duration);
      }

      return {
        success: true,
        executionId: execution.id,
        workflowId: workflow.id,
        status: 'completed',
        duration: execution.duration,
        results: execution.results,
        errors: execution.errors,
        metadata: execution.metadata
      };

    } catch (error) {
      // Handle execution failure
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      
      const executionError = this.createExecutionError('workflow', error as Error);
      execution.errors.push(executionError);

      if (this.config.enableMetrics) {
        this.recordMetric('execution_failures', 1);
        this.recordMetric('execution_duration', execution.duration);
      }

      return {
        success: false,
        executionId: execution.id,
        workflowId: workflow.id,
        status: 'failed',
        duration: execution.duration,
        results: execution.results,
        errors: execution.errors,
        metadata: execution.metadata
      };

    } finally {
      // Clean up active execution
      this.activeExecutions.delete(execution.id);
    }
  }

  /**
   * Execute workflow steps
   */
  private async executeWorkflowSteps(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    payload: any
  ): Promise<StepResult[]> {
    const results: StepResult[] = [];
    
    // Sort steps by dependencies and order
    const sortedSteps = this.sortStepsByDependencies(workflow.steps);
    
    for (const step of sortedSteps) {
      try {
        const result = await this.executeStep(execution, step, payload);
        results.push(result);
        execution.results.push(result);
        
        // Check for timeout
        if (this.isExecutionTimeout(execution)) {
          throw new WorkflowExecutionTimeoutError(execution.id, execution.metadata.timeout || this.config.defaultTimeout);
        }
        
      } catch (error) {
        const stepError = this.createExecutionError(step.id, error as Error);
        execution.errors.push(stepError);
        
        // Check if step is retryable
        if (this.isRetryableError(stepError)) {
          try {
            const retryResult = await this.retryStep(execution, step, payload);
            results.push(retryResult);
            execution.results.push(retryResult);
          } catch (retryError) {
            // Mark step as failed and continue if possible
            const failedResult = this.createFailedStepResult(step, retryError as Error);
            results.push(failedResult);
            execution.results.push(failedResult);
          }
        } else {
          // Mark step as failed and continue if possible
          const failedResult = this.createFailedStepResult(step, error as Error);
          results.push(failedResult);
          execution.results.push(failedResult);
        }
      }
    }
    
    return results;
  }

  /**
   * Execute individual workflow step
   */
  private async executeStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    payload: any
  ): Promise<StepResult> {
    const startTime = new Date();
    
    this.logExecution(execution.id, 'info', `Executing step: ${step.name}`, {
      stepId: step.id,
      stepType: step.type
    });

    try {
      // Execute step based on type
      const output = await this.executeStepByType(step, payload, execution);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      const result: StepResult = {
        stepId: step.id,
        stepName: step.name,
        status: 'completed',
        startTime,
        endTime,
        duration,
        output,
        retryCount: 0,
        logs: []
      };

      this.logExecution(execution.id, 'info', `Step completed: ${step.name}`, {
        stepId: step.id,
        duration
      });

      return result;

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      const result: StepResult = {
        stepId: step.id,
        stepName: step.name,
        status: 'failed',
        startTime,
        endTime,
        duration,
        error: (error as Error).message,
        retryCount: 0,
        logs: []
      };

      this.logExecution(execution.id, 'error', `Step failed: ${step.name}`, {
        stepId: step.id,
        error: (error as Error).message
      });

      throw error;
    }
  }

  /**
   * Execute step based on type
   */
  private async executeStepByType(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    switch (step.type) {
      case 'n8n':
        return await this.executeN8nStep(step, payload, execution);
      case 'temporal':
        return await this.executeTemporalStep(step, payload, execution);
      case 'webhook':
        return await this.executeWebhookStep(step, payload, execution);
      case 'api':
        return await this.executeApiStep(step, payload, execution);
      case 'transform':
        return await this.executeTransformStep(step, payload, execution);
      case 'condition':
        return await this.executeConditionStep(step, payload, execution);
      case 'delay':
        return await this.executeDelayStep(step, payload, execution);
      case 'email':
        return await this.executeEmailStep(step, payload, execution);
      case 'database':
        return await this.executeDatabaseStep(step, payload, execution);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  /**
   * Execute n8n step
   */
  private async executeN8nStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const request: N8nExecutionRequest = {
      workflowId: step.config.workflowId,
      payload: {
        ...payload,
        ...step.config.input
      },
      options: {
        timeout: step.timeout,
        correlationId: execution.metadata.correlationId,
        userId: execution.metadata.userId
      }
    };

    const response = await this.config.n8nConnector.executeWorkflow(request);
    
    if (!response.success) {
      throw new Error(`n8n execution failed: ${response.error}`);
    }

    return response.data;
  }

  /**
   * Execute Temporal step
   */
  private async executeTemporalStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    // Implementation for Temporal step execution
    // This would integrate with the Temporal connector
    throw new Error('Temporal step execution not implemented');
  }

  /**
   * Execute webhook step
   */
  private async executeWebhookStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const url = step.config.url;
    const method = step.config.method || 'POST';
    const headers = step.config.headers || {};
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        ...payload,
        ...step.config.body
      }),
      signal: AbortSignal.timeout(step.timeout || this.config.defaultTimeout)
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute API step
   */
  private async executeApiStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const url = step.config.url;
    const method = step.config.method || 'GET';
    const headers = step.config.headers || {};
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify({
        ...payload,
        ...step.config.body
      }) : undefined,
      signal: AbortSignal.timeout(step.timeout || this.config.defaultTimeout)
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Execute transform step
   */
  private async executeTransformStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const transform = step.config.transform;
    
    if (typeof transform === 'function') {
      return transform(payload);
    }
    
    if (typeof transform === 'string') {
      // Evaluate JavaScript expression
      const func = new Function('payload', `return ${transform}`);
      return func(payload);
    }
    
    throw new Error('Invalid transform configuration');
  }

  /**
   * Execute condition step
   */
  private async executeConditionStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const condition = step.config.condition;
    
    if (typeof condition === 'function') {
      return condition(payload);
    }
    
    if (typeof condition === 'string') {
      // Evaluate JavaScript expression
      const func = new Function('payload', `return ${condition}`);
      return func(payload);
    }
    
    throw new Error('Invalid condition configuration');
  }

  /**
   * Execute delay step
   */
  private async executeDelayStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    const delayMs = step.config.delayMs || 1000;
    await this.sleep(delayMs);
    return { delayed: delayMs };
  }

  /**
   * Execute email step
   */
  private async executeEmailStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    // Implementation for email step execution
    // This would integrate with the email service
    throw new Error('Email step execution not implemented');
  }

  /**
   * Execute database step
   */
  private async executeDatabaseStep(
    step: WorkflowStep,
    payload: any,
    execution: WorkflowExecution
  ): Promise<any> {
    // Implementation for database step execution
    // This would integrate with the database service
    throw new Error('Database step execution not implemented');
  }

  /**
   * Retry failed step
   */
  private async retryStep(
    execution: WorkflowExecution,
    step: WorkflowStep,
    payload: any
  ): Promise<StepResult> {
    const retryConfig = step.retryConfig || this.config.retryConfig;
    const maxRetries = retryConfig.maxRetries;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logExecution(execution.id, 'info', `Retrying step: ${step.name} (attempt ${attempt})`, {
          stepId: step.id,
          attempt
        });

        const result = await this.executeStep(execution, step, payload);
        result.retryCount = attempt;
        
        this.logExecution(execution.id, 'info', `Step retry successful: ${step.name}`, {
          stepId: step.id,
          attempt
        });

        return result;

      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        const delay = this.calculateRetryDelay(attempt, retryConfig);
        await this.sleep(delay);
      }
    }

    throw new Error(`Step failed after ${maxRetries} retries`);
  }

  /**
   * Get execution status
   */
  async getExecutionStatus(executionId: string): Promise<WorkflowExecution> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new ExecutionNotFoundError(executionId);
    }
    return execution;
  }

  /**
   * Cancel execution
   */
  async cancelExecution(executionId: string, reason?: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) {
      throw new ExecutionNotFoundError(executionId);
    }

    execution.status = 'cancelled';
    execution.endTime = new Date();
    execution.duration = execution.endTime.getTime() - execution.startTime.getTime();

    this.logExecution(executionId, 'info', 'Execution cancelled', { reason });
  }

  /**
   * Get execution metrics
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Get active executions
   */
  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Validate workflow definition
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    const errors: string[] = [];

    if (!workflow.id) {
      errors.push('Workflow ID is required');
    }

    if (!workflow.name) {
      errors.push('Workflow name is required');
    }

    if (!workflow.steps || workflow.steps.length === 0) {
      errors.push('Workflow must have at least one step');
    }

    // Validate steps
    for (const step of workflow.steps) {
      if (!step.id) {
        errors.push(`Step ID is required for step: ${step.name}`);
      }

      if (!step.type) {
        errors.push(`Step type is required for step: ${step.name}`);
      }

      if (!step.config) {
        errors.push(`Step config is required for step: ${step.name}`);
      }
    }

    if (errors.length > 0) {
      throw new InvalidWorkflowDefinitionError(workflow.id, errors);
    }
  }

  /**
   * Create execution context
   */
  private createExecutionContext(
    workflow: WorkflowDefinition,
    context: Partial<ExecutionContext>
  ): ExecutionContext {
    return {
      executionId: this.generateExecutionId(),
      workflowId: workflow.id,
      userId: context.userId,
      sessionId: context.sessionId,
      correlationId: context.correlationId || this.generateCorrelationId(),
      environment: context.environment || 'prod',
      startTime: new Date(),
      timeout: context.timeout || this.config.defaultTimeout,
      priority: context.priority || 'normal'
    };
  }

  /**
   * Create workflow execution
   */
  private createWorkflowExecution(
    workflow: WorkflowDefinition,
    payload: any,
    context: ExecutionContext
  ): WorkflowExecution {
    const metadata: ExecutionMetadata = {
      executionId: context.executionId,
      workflowId: workflow.id,
      triggerType: 'manual',
      userId: context.userId,
      sessionId: context.sessionId,
      environment: context.environment,
      source: 'orchestration',
      timestamp: context.startTime,
      correlationId: context.correlationId
    };

    return {
      id: context.executionId,
      workflowId: workflow.id,
      status: 'pending',
      payload,
      trigger: {
        id: 'manual',
        type: 'manual',
        config: {},
        enabled: true
      },
      metadata,
      startTime: context.startTime,
      results: [],
      errors: [],
      retryCount: 0,
      maxRetries: workflow.config.retryPolicy.maxRetries,
      childExecutions: []
    };
  }

  /**
   * Create failed step result
   */
  private createFailedStepResult(step: WorkflowStep, error: Error): StepResult {
    return {
      stepId: step.id,
      stepName: step.name,
      status: 'failed',
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      error: error.message,
      retryCount: 0,
      logs: []
    };
  }

  /**
   * Create execution error
   */
  private createExecutionError(stepId: string, error: Error): ExecutionError {
    return {
      id: this.generateErrorId(),
      stepId,
      type: this.categorizeError(error),
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      retryable: this.isRetryableError(error),
      context: {
        stepId
      }
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network')) return 'network';
    if (message.includes('auth')) return 'authentication';
    if (message.includes('permission')) return 'authorization';
    if (message.includes('validation')) return 'validation';
    
    return 'execution';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error | ExecutionError): boolean {
    const errorType = error instanceof Error ? this.categorizeError(error) : error.type;
    const retryableTypes: ErrorType[] = ['network', 'timeout', 'execution'];
    return retryableTypes.includes(errorType);
  }

  /**
   * Check if execution has timed out
   */
  private isExecutionTimeout(execution: WorkflowExecution): boolean {
    const timeout = execution.metadata.timeout || this.config.defaultTimeout;
    const elapsed = Date.now() - execution.startTime.getTime();
    return elapsed > timeout;
  }

  /**
   * Sort steps by dependencies
   */
  private sortStepsByDependencies(steps: WorkflowStep[]): WorkflowStep[] {
    const sorted: WorkflowStep[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();
    
    const visit = (step: WorkflowStep) => {
      if (visiting.has(step.id)) {
        throw new Error(`Circular dependency detected in step: ${step.id}`);
      }
      
      if (visited.has(step.id)) {
        return;
      }
      
      visiting.add(step.id);
      
      // Visit dependencies first
      for (const depId of step.dependencies) {
        const depStep = steps.find(s => s.id === depId);
        if (depStep) {
          visit(depStep);
        }
      }
      
      visiting.delete(step.id);
      visited.add(step.id);
      sorted.push(step);
    };
    
    // Sort steps by order first, then by dependencies
    const orderedSteps = steps.sort((a, b) => a.order - b.order);
    
    for (const step of orderedSteps) {
      if (!visited.has(step.id)) {
        visit(step);
      }
    }
    
    return sorted;
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    const baseDelay = config.baseDelayMs;
    const maxDelay = config.maxDelayMs;
    const jitter = config.jitterFactor;

    let delay: number;
    switch (config.backoffStrategy) {
      case 'exponential':
        delay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);
        break;
      case 'linear':
        delay = Math.min(baseDelay * attempt, maxDelay);
        break;
      case 'fixed':
        delay = baseDelay;
        break;
      default:
        delay = baseDelay;
    }

    // Add jitter
    const jitterAmount = delay * jitter * Math.random();
    return Math.floor(delay + jitterAmount);
  }

  /**
   * Log execution event
   */
  private logExecution(
    executionId: string,
    level: LogLevel,
    message: string,
    data?: Record<string, any>
  ): void {
    if (this.config.enableTracing) {
      console.log(`[${level.toUpperCase()}] ${executionId}: ${message}`, data);
    }
  }

  /**
   * Record metric
   */
  private recordMetric(name: string, value: number): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate execution ID
   */
  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// ============================================================================
// Workflow Executor Factory
// ============================================================================

export class WorkflowExecutorFactory {
  /**
   * Create workflow executor with default configuration
   */
  static create(config: Partial<WorkflowExecutorConfig>): WorkflowExecutor {
    const defaultConfig: WorkflowExecutorConfig = {
      maxConcurrentExecutions: 10,
      defaultTimeout: 300000, // 5 minutes
      enableMetrics: true,
      enableTracing: true,
      retryConfig: {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        jitterFactor: 0.1,
        retryableErrors: ['timeout', 'network', '5xx'],
        backoffStrategy: 'exponential'
      },
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeoutMs: 60000,
        halfOpenMaxCalls: 3,
        timeoutMs: 30000,
        enabled: true
      },
      n8nConnector: config.n8nConnector!
    };

    return new WorkflowExecutor({ ...defaultConfig, ...config });
  }
}

// ============================================================================
// Default Export
// ============================================================================

export default WorkflowExecutor;
