/**
 * Workflow Execution Model Definition
 * 
 * Defines the workflow execution model, state management, and execution patterns
 * for the orchestration layer to achieve PRD Section 8 compliance.
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
  BackoffStrategy
} from './architecture';

// ============================================================================
// Workflow Execution Model
// ============================================================================

export class WorkflowExecutionModel {
  private execution: WorkflowExecution;
  private stepResults: Map<string, StepResult> = new Map();
  private errors: ExecutionError[] = [];
  private logs: ExecutionLog[] = [];
  
  constructor(
    public readonly workflow: WorkflowDefinition,
    public readonly payload: any,
    public readonly trigger: WorkflowTrigger,
    public readonly metadata: ExecutionMetadata
  ) {
    this.execution = this.createExecution();
  }
  
  /**
   * Create new workflow execution
   */
  private createExecution(): WorkflowExecution {
    return {
      id: this.generateExecutionId(),
      workflowId: this.workflow.id,
      status: 'pending',
      payload: this.payload,
      trigger: this.trigger,
      metadata: this.metadata,
      startTime: new Date(),
      results: [],
      errors: [],
      retryCount: 0,
      maxRetries: this.workflow.config.retryPolicy.maxRetries,
      childExecutions: []
    };
  }
  
  /**
   * Start workflow execution
   */
  async start(): Promise<void> {
    this.updateStatus('running');
    this.log('info', 'Workflow execution started', {
      workflowId: this.workflow.id,
      executionId: this.execution.id,
      trigger: this.trigger.type
    });
    
    // Initialize step results
    for (const step of this.workflow.steps) {
      this.stepResults.set(step.id, this.createStepResult(step));
    }
  }
  
  /**
   * Execute workflow steps
   */
  async executeSteps(): Promise<StepResult[]> {
    const results: StepResult[] = [];
    
    // Sort steps by order and dependencies
    const sortedSteps = this.sortStepsByDependencies(this.workflow.steps);
    
    for (const step of sortedSteps) {
      try {
        const result = await this.executeStep(step);
        results.push(result);
        
        // Update execution status
        this.updateExecutionProgress();
        
      } catch (error) {
        const stepError = this.createExecutionError(step.id, error);
        this.addError(stepError);
        
        // Check if step is retryable
        if (this.isRetryableError(stepError)) {
          await this.retryStep(step);
        } else {
          // Mark step as failed and continue if possible
          this.markStepFailed(step.id, stepError);
        }
      }
    }
    
    this.execution.results = results;
    return results;
  }
  
  /**
   * Execute individual workflow step
   */
  private async executeStep(step: WorkflowStep): Promise<StepResult> {
    const stepResult = this.stepResults.get(step.id)!;
    
    try {
      // Update step status
      this.updateStepStatus(step.id, 'running');
      
      this.log('info', `Executing step: ${step.name}`, {
        stepId: step.id,
        stepType: step.type
      });
      
      // Execute step based on type
      const output = await this.executeStepByType(step);
      
      // Update step result
      this.updateStepResult(step.id, {
        status: 'completed',
        endTime: new Date(),
        output,
        duration: Date.now() - stepResult.startTime.getTime()
      });
      
      this.log('info', `Step completed: ${step.name}`, {
        stepId: step.id,
        duration: stepResult.duration
      });
      
      return stepResult;
      
    } catch (error) {
      // Update step result with error
      this.updateStepResult(step.id, {
        status: 'failed',
        endTime: new Date(),
        error: error.message,
        duration: Date.now() - stepResult.startTime.getTime()
      });
      
      this.log('error', `Step failed: ${step.name}`, {
        stepId: step.id,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Execute step based on type
   */
  private async executeStepByType(step: WorkflowStep): Promise<any> {
    switch (step.type) {
      case 'n8n':
        return await this.executeN8nStep(step);
      case 'temporal':
        return await this.executeTemporalStep(step);
      case 'webhook':
        return await this.executeWebhookStep(step);
      case 'api':
        return await this.executeApiStep(step);
      case 'transform':
        return await this.executeTransformStep(step);
      case 'condition':
        return await this.executeConditionStep(step);
      case 'delay':
        return await this.executeDelayStep(step);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }
  
  /**
   * Retry failed step
   */
  private async retryStep(step: WorkflowStep): Promise<void> {
    const stepResult = this.stepResults.get(step.id)!;
    const retryConfig = step.retryConfig || this.workflow.config.retryPolicy;
    
    if (stepResult.retryCount >= retryConfig.maxRetries) {
      this.log('error', `Step exceeded max retries: ${step.name}`, {
        stepId: step.id,
        retryCount: stepResult.retryCount,
        maxRetries: retryConfig.maxRetries
      });
      return;
    }
    
    // Calculate retry delay
    const delay = this.calculateRetryDelay(stepResult.retryCount, retryConfig);
    
    this.log('info', `Retrying step: ${step.name}`, {
      stepId: step.id,
      retryCount: stepResult.retryCount + 1,
      delay
    });
    
    // Wait for retry delay
    await this.sleep(delay);
    
    // Increment retry count
    stepResult.retryCount++;
    
    // Reset step status
    this.updateStepStatus(step.id, 'pending');
    
    // Retry step execution
    try {
      await this.executeStep(step);
    } catch (error) {
      // If retry fails, try again if retries remaining
      if (stepResult.retryCount < retryConfig.maxRetries) {
        await this.retryStep(step);
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Complete workflow execution
   */
  async complete(): Promise<void> {
    this.updateStatus('completed');
    this.execution.endTime = new Date();
    this.execution.duration = this.execution.endTime.getTime() - this.execution.startTime.getTime();
    
    this.log('info', 'Workflow execution completed', {
      executionId: this.execution.id,
      duration: this.execution.duration,
      successRate: this.calculateSuccessRate()
    });
  }
  
  /**
   * Fail workflow execution
   */
  async fail(error: Error): Promise<void> {
    this.updateStatus('failed');
    this.execution.endTime = new Date();
    this.execution.duration = this.execution.endTime.getTime() - this.execution.startTime.getTime();
    
    const executionError = this.createExecutionError('workflow', error);
    this.addError(executionError);
    
    this.log('error', 'Workflow execution failed', {
      executionId: this.execution.id,
      error: error.message,
      duration: this.execution.duration
    });
  }
  
  /**
   * Cancel workflow execution
   */
  async cancel(reason?: string): Promise<void> {
    this.updateStatus('cancelled');
    this.execution.endTime = new Date();
    this.execution.duration = this.execution.endTime.getTime() - this.execution.startTime.getTime();
    
    this.log('info', 'Workflow execution cancelled', {
      executionId: this.execution.id,
      reason,
      duration: this.execution.duration
    });
  }
  
  // ============================================================================
  // Step Execution Methods
  // ============================================================================
  
  /**
   * Execute n8n step
   */
  private async executeN8nStep(step: WorkflowStep): Promise<any> {
    // Implementation for n8n step execution
    // This would integrate with the n8n connector
    throw new Error('n8n step execution not implemented');
  }
  
  /**
   * Execute Temporal step
   */
  private async executeTemporalStep(step: WorkflowStep): Promise<any> {
    // Implementation for Temporal step execution
    // This would integrate with the Temporal connector
    throw new Error('Temporal step execution not implemented');
  }
  
  /**
   * Execute webhook step
   */
  private async executeWebhookStep(step: WorkflowStep): Promise<any> {
    // Implementation for webhook step execution
    // This would integrate with the webhook coordinator
    throw new Error('Webhook step execution not implemented');
  }
  
  /**
   * Execute API step
   */
  private async executeApiStep(step: WorkflowStep): Promise<any> {
    // Implementation for API step execution
    // This would make HTTP requests to external APIs
    throw new Error('API step execution not implemented');
  }
  
  /**
   * Execute transform step
   */
  private async executeTransformStep(step: WorkflowStep): Promise<any> {
    // Implementation for data transformation step
    // This would apply data transformations
    throw new Error('Transform step execution not implemented');
  }
  
  /**
   * Execute condition step
   */
  private async executeConditionStep(step: WorkflowStep): Promise<any> {
    // Implementation for conditional step execution
    // This would evaluate conditions and branch execution
    throw new Error('Condition step execution not implemented');
  }
  
  /**
   * Execute delay step
   */
  private async executeDelayStep(step: WorkflowStep): Promise<any> {
    const delayMs = step.config.delayMs || 1000;
    await this.sleep(delayMs);
    return { delayed: delayMs };
  }
  
  // ============================================================================
  // Utility Methods
  // ============================================================================
  
  /**
   * Create step result
   */
  private createStepResult(step: WorkflowStep): StepResult {
    return {
      stepId: step.id,
      stepName: step.name,
      status: 'pending',
      startTime: new Date(),
      retryCount: 0,
      logs: []
    };
  }
  
  /**
   * Update step status
   */
  private updateStepStatus(stepId: string, status: StepStatus): void {
    const stepResult = this.stepResults.get(stepId);
    if (stepResult) {
      stepResult.status = status;
    }
  }
  
  /**
   * Update step result
   */
  private updateStepResult(stepId: string, updates: Partial<StepResult>): void {
    const stepResult = this.stepResults.get(stepId);
    if (stepResult) {
      Object.assign(stepResult, updates);
    }
  }
  
  /**
   * Mark step as failed
   */
  private markStepFailed(stepId: string, error: ExecutionError): void {
    this.updateStepResult(stepId, {
      status: 'failed',
      endTime: new Date(),
      error: error.message
    });
  }
  
  /**
   * Update execution status
   */
  private updateStatus(status: ExecutionStatus): void {
    this.execution.status = status;
  }
  
  /**
   * Update execution progress
   */
  private updateExecutionProgress(): void {
    const totalSteps = this.workflow.steps.length;
    const completedSteps = Array.from(this.stepResults.values())
      .filter(result => result.status === 'completed').length;
    
    // Update execution metadata
    this.metadata.progress = {
      totalSteps,
      completedSteps,
      percentage: (completedSteps / totalSteps) * 100
    };
  }
  
  /**
   * Add execution error
   */
  private addError(error: ExecutionError): void {
    this.errors.push(error);
    this.execution.errors = this.errors;
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
        workflowId: this.workflow.id,
        executionId: this.execution.id,
        stepId
      }
    };
  }
  
  /**
   * Categorize error type
   */
  private categorizeError(error: Error): ErrorType {
    if (error.message.includes('timeout')) return 'timeout';
    if (error.message.includes('network')) return 'network';
    if (error.message.includes('auth')) return 'authentication';
    if (error.message.includes('permission')) return 'authorization';
    if (error.message.includes('validation')) return 'validation';
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
   * Calculate retry delay
   */
  private calculateRetryDelay(retryCount: number, config: RetryConfig): number {
    switch (config.backoffStrategy) {
      case 'exponential':
        return Math.min(
          config.baseDelayMs * Math.pow(2, retryCount),
          config.maxDelayMs
        );
      case 'linear':
        return Math.min(
          config.baseDelayMs * (retryCount + 1),
          config.maxDelayMs
        );
      case 'fixed':
        return config.baseDelayMs;
      default:
        return config.baseDelayMs;
    }
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
   * Calculate success rate
   */
  private calculateSuccessRate(): number {
    const totalSteps = this.workflow.steps.length;
    const successfulSteps = Array.from(this.stepResults.values())
      .filter(result => result.status === 'completed').length;
    
    return totalSteps > 0 ? (successfulSteps / totalSteps) * 100 : 0;
  }
  
  /**
   * Log execution event
   */
  private log(level: LogLevel, message: string, data?: Record<string, any>): void {
    const logEntry: ExecutionLog = {
      timestamp: new Date(),
      level,
      message,
      data,
      executionId: this.execution.id,
      workflowId: this.workflow.id
    };
    
    this.logs.push(logEntry);
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
   * Generate error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  // ============================================================================
  // Getters
  // ============================================================================
  
  get id(): string {
    return this.execution.id;
  }
  
  get status(): ExecutionStatus {
    return this.execution.status;
  }
  
  get result(): WorkflowExecution {
    return this.execution;
  }
  
  get stepResults(): StepResult[] {
    return Array.from(this.stepResults.values());
  }
  
  get errors(): ExecutionError[] {
    return this.errors;
  }
  
  get logs(): ExecutionLog[] {
    return this.logs;
  }
  
  get duration(): number | undefined {
    return this.execution.duration;
  }
  
  get successRate(): number {
    return this.calculateSuccessRate();
  }
}

// ============================================================================
// Supporting Types
// ============================================================================

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config: Record<string, any>;
  enabled: boolean;
  schedule?: string;
  webhook?: WebhookConfig;
}

export interface WebhookConfig {
  id: string;
  path: string;
  method: string;
  authentication: any;
}

export interface ExecutionLog {
  timestamp: Date;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
  executionId: string;
  workflowId: string;
}

export type StepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'timeout';

// ============================================================================
// Workflow Execution Factory
// ============================================================================

export class WorkflowExecutionFactory {
  /**
   * Create workflow execution model
   */
  static create(
    workflow: WorkflowDefinition,
    payload: any,
    trigger: WorkflowTrigger,
    metadata: ExecutionMetadata
  ): WorkflowExecutionModel {
    return new WorkflowExecutionModel(workflow, payload, trigger, metadata);
  }
  
  /**
   * Create execution metadata
   */
  static createMetadata(
    workflowId: string,
    triggerType: TriggerType,
    options?: {
      userId?: string;
      sessionId?: string;
      environment?: Environment;
      source?: string;
      correlationId?: string;
    }
  ): ExecutionMetadata {
    return {
      executionId: '', // Will be set by the execution model
      workflowId,
      triggerType,
      environment: options?.environment || 'prod',
      source: options?.source || 'orchestration',
      timestamp: new Date(),
      userId: options?.userId,
      sessionId: options?.sessionId,
      correlationId: options?.correlationId
    };
  }
}
