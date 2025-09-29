/**
 * Workflow Execution API Endpoint
 * 
 * Provides REST API for executing workflows with validation,
 * error handling, and comprehensive response per PRD Section 8 requirements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  WorkflowDefinition,
  ExecuteWorkflowRequest,
  ExecutionOptions,
  ExecutionResult,
  ExecutionStatus,
  Environment,
  TriggerType,
  ExecutionPriority,
  OrchestrationError,
  WorkflowNotFoundError,
  InvalidWorkflowDefinitionError
} from '@/lib/orchestration/architecture';
import { WorkflowExecutor, WorkflowExecutorFactory } from '@/lib/orchestration/workflow-executor';
import { N8nConnectorFactory } from '@/lib/orchestration/n8n-connector';
import { ExecutionHistoryManager, ExecutionHistoryFactory } from '@/lib/orchestration/execution-history';
import { DeadLetterQueue, DeadLetterQueueFactory } from '@/lib/orchestration/dead-letter-queue';

// ============================================================================
// Request/Response Schemas
// ============================================================================

const ExecuteWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'Workflow ID is required'),
  payload: z.any().optional(),
  options: z.object({
    timeout: z.number().min(1000).max(3600000).optional(),
    retryConfig: z.object({
      maxRetries: z.number().min(0).max(10).optional(),
      baseDelayMs: z.number().min(100).max(60000).optional(),
      maxDelayMs: z.number().min(1000).max(300000).optional(),
      jitterFactor: z.number().min(0).max(1).optional(),
      retryableErrors: z.array(z.string()).optional(),
      backoffStrategy: z.enum(['exponential', 'linear', 'fixed', 'custom']).optional()
    }).optional(),
    priority: z.enum(['low', 'normal', 'high', 'critical']).optional(),
    correlationId: z.string().optional(),
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    environment: z.enum(['dev', 'staging', 'prod']).optional()
  }).optional(),
  trigger: z.object({
    type: z.enum(['webhook', 'schedule', 'event', 'manual', 'form-submission']),
    config: z.record(z.any()).optional(),
    enabled: z.boolean().optional()
  }).optional()
});

const GetExecutionSchema = z.object({
  executionId: z.string().min(1, 'Execution ID is required')
});

const CancelExecutionSchema = z.object({
  executionId: z.string().min(1, 'Execution ID is required'),
  reason: z.string().optional()
});

// ============================================================================
// Global Instances
// ============================================================================

let workflowExecutor: WorkflowExecutor;
let executionHistory: ExecutionHistoryManager;
let deadLetterQueue: DeadLetterQueue;

// Initialize instances
function initializeInstances() {
  if (!workflowExecutor) {
    const n8nConnector = N8nConnectorFactory.create();
    workflowExecutor = WorkflowExecutorFactory.create({ n8nConnector });
  }
  
  if (!executionHistory) {
    executionHistory = ExecutionHistoryFactory.create();
  }
  
  if (!deadLetterQueue) {
    deadLetterQueue = DeadLetterQueueFactory.create();
  }
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * POST /api/orchestration/execute
 * Execute a workflow
 */
export async function POST(request: NextRequest) {
  try {
    initializeInstances();
    
    const body = await request.json();
    const validatedData = ExecuteWorkflowSchema.parse(body);
    
    // Create workflow definition (in real implementation, this would be fetched from storage)
    const workflow = await getWorkflowDefinition(validatedData.workflowId);
    if (!workflow) {
      throw new WorkflowNotFoundError(validatedData.workflowId);
    }
    
    // Create execution context
    const context = {
      userId: validatedData.options?.userId,
      sessionId: validatedData.options?.sessionId,
      environment: validatedData.options?.environment || 'prod',
      timeout: validatedData.options?.timeout,
      priority: validatedData.options?.priority || 'normal',
      correlationId: validatedData.options?.correlationId
    };
    
    // Execute workflow
    const result = await workflowExecutor.executeWorkflow(
      workflow,
      validatedData.payload || {},
      context
    );
    
    // Store execution history
    if (result.success) {
      await executionHistory.storeExecution({
        id: result.executionId,
        workflowId: result.workflowId,
        status: result.status,
        payload: validatedData.payload || {},
        trigger: validatedData.trigger || {
          id: 'manual',
          type: 'manual',
          config: {},
          enabled: true
        },
        metadata: {
          executionId: result.executionId,
          workflowId: result.workflowId,
          triggerType: validatedData.trigger?.type || 'manual',
          userId: validatedData.options?.userId,
          sessionId: validatedData.options?.sessionId,
          environment: validatedData.options?.environment || 'prod',
          source: 'orchestration',
          timestamp: new Date(),
          correlationId: validatedData.options?.correlationId
        },
        startTime: new Date(),
        endTime: new Date(),
        duration: result.duration,
        results: result.results,
        errors: result.errors,
        retryCount: 0,
        maxRetries: workflow.config.retryPolicy.maxRetries,
        childExecutions: []
      });
    } else {
      // Add failed execution to dead letter queue
      const execution = {
        id: result.executionId,
        workflowId: result.workflowId,
        status: result.status,
        payload: validatedData.payload || {},
        trigger: validatedData.trigger || {
          id: 'manual',
          type: 'manual',
          config: {},
          enabled: true
        },
        metadata: {
          executionId: result.executionId,
          workflowId: result.workflowId,
          triggerType: validatedData.trigger?.type || 'manual',
          userId: validatedData.options?.userId,
          sessionId: validatedData.options?.sessionId,
          environment: validatedData.options?.environment || 'prod',
          source: 'orchestration',
          timestamp: new Date(),
          correlationId: validatedData.options?.correlationId
        },
        startTime: new Date(),
        endTime: new Date(),
        duration: result.duration,
        results: result.results,
        errors: result.errors,
        retryCount: 0,
        maxRetries: workflow.config.retryPolicy.maxRetries,
        childExecutions: []
      };
      
      if (result.errors.length > 0) {
        await deadLetterQueue.addFailedExecution(
          execution,
          result.errors[0],
          validatedData.options?.priority || 'normal'
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        executionId: result.executionId,
        workflowId: result.workflowId,
        status: result.status,
        duration: result.duration,
        success: result.success,
        results: result.results,
        errors: result.errors,
        metadata: result.metadata
      }
    });
    
  } catch (error) {
    console.error('Workflow execution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }
    
    if (error instanceof OrchestrationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        context: error.context
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/orchestration/execute?executionId=...
 * Get execution status
 */
export async function GET(request: NextRequest) {
  try {
    initializeInstances();
    
    const { searchParams } = new URL(request.url);
    const executionId = searchParams.get('executionId');
    
    if (!executionId) {
      return NextResponse.json({
        success: false,
        error: 'Execution ID is required'
      }, { status: 400 });
    }
    
    const validatedData = GetExecutionSchema.parse({ executionId });
    
    // Get execution from history
    const execution = executionHistory.getExecution(validatedData.executionId);
    if (!execution) {
      return NextResponse.json({
        success: false,
        error: 'Execution not found',
        code: 'EXECUTION_NOT_FOUND'
      }, { status: 404 });
    }
    
    // Get execution metrics
    const metrics = executionHistory.getExecutionMetrics(validatedData.executionId);
    
    return NextResponse.json({
      success: true,
      data: {
        execution,
        metrics
      }
    });
    
  } catch (error) {
    console.error('Get execution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/orchestration/execute
 * Cancel execution
 */
export async function DELETE(request: NextRequest) {
  try {
    initializeInstances();
    
    const body = await request.json();
    const validatedData = CancelExecutionSchema.parse(body);
    
    // Cancel execution
    await workflowExecutor.cancelExecution(validatedData.executionId, validatedData.reason);
    
    return NextResponse.json({
      success: true,
      message: 'Execution cancelled successfully'
    });
    
  } catch (error) {
    console.error('Cancel execution error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation error',
        details: error.errors
      }, { status: 400 });
    }
    
    if (error instanceof OrchestrationError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        context: error.context
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get workflow definition by ID
 * In real implementation, this would fetch from database or storage
 */
async function getWorkflowDefinition(workflowId: string): Promise<WorkflowDefinition | null> {
  // Mock workflow definition for demonstration
  // In production, this would be fetched from a database or storage system
  const mockWorkflows: Record<string, WorkflowDefinition> = {
    'wf-001': {
      id: 'wf-001',
      name: 'Welcome Email Sequence',
      description: 'Automated welcome email series for new form submissions',
      version: '1.0.0',
      status: 'active',
      type: 'n8n',
      config: {
        timeout: 300000,
        retryPolicy: {
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
        concurrency: 1,
        environment: 'prod',
        tags: ['email', 'automation']
      },
      steps: [
        {
          id: 'step-1',
          name: 'Send Welcome Email',
          type: 'email',
          config: {
            template: 'welcome',
            delay: 0
          },
          retryConfig: {
            maxRetries: 3,
            baseDelayMs: 1000,
            maxDelayMs: 5000,
            jitterFactor: 0.1,
            retryableErrors: ['timeout', 'network'],
            backoffStrategy: 'exponential'
          },
          timeout: 30000,
          dependencies: [],
          order: 1
        },
        {
          id: 'step-2',
          name: 'Add to Newsletter',
          type: 'api',
          config: {
            url: 'https://api.example.com/newsletter',
            method: 'POST'
          },
          retryConfig: {
            maxRetries: 2,
            baseDelayMs: 1000,
            maxDelayMs: 5000,
            jitterFactor: 0.1,
            retryableErrors: ['timeout', 'network'],
            backoffStrategy: 'exponential'
          },
          timeout: 15000,
          dependencies: ['step-1'],
          order: 2
        }
      ],
      triggers: [
        {
          id: 'trigger-1',
          type: 'form-submission',
          config: {
            formId: 'contact-form',
            conditions: []
          },
          enabled: true
        }
      ],
      metadata: {
        createdBy: 'admin@agency.com',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-09-15'),
        tags: ['email', 'automation'],
        environment: 'prod',
        source: 'agency-toolkit',
        dependencies: []
      }
    }
  };
  
  return mockWorkflows[workflowId] || null;
}

/**
 * Validate workflow definition
 */
function validateWorkflowDefinition(workflow: WorkflowDefinition): void {
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
