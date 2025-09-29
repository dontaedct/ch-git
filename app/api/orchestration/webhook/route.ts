/**
 * n8n Webhook Receiver Endpoint
 * 
 * Implements n8n webhook receiver with HMAC verification, idempotency,
 * and workflow execution triggering per PRD Section 8 requirements.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withVerifiedWebhook, WebhookContext } from '@/lib/webhooks';
import {
  WorkflowDefinition,
  WorkflowExecution,
  ExecutionStatus,
  ExecutionMetadata,
  Environment,
  TriggerType,
  ExecutionPriority,
  OrchestrationError,
  WorkflowNotFoundError
} from '@/lib/orchestration/architecture';
import { WorkflowExecutor, WorkflowExecutorFactory } from '@/lib/orchestration/workflow-executor';
import { N8nConnectorFactory } from '@/lib/orchestration/n8n-connector';
import { ExecutionHistoryManager, ExecutionHistoryFactory } from '@/lib/orchestration/execution-history';
import { DeadLetterQueue, DeadLetterQueueFactory } from '@/lib/orchestration/dead-letter-queue';

// ============================================================================
// Webhook Event Schemas
// ============================================================================

const N8nWebhookEventSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  workflowId: z.string().min(1, 'Workflow ID is required'),
  executionId: z.string().optional(),
  data: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  source: z.string().optional(),
  correlationId: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  environment: z.enum(['dev', 'staging', 'prod']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'critical']).optional()
});

const N8nExecutionEventSchema = z.object({
  event: z.literal('workflow.execution.started'),
  workflowId: z.string().min(1, 'Workflow ID is required'),
  executionId: z.string().min(1, 'Execution ID is required'),
  data: z.object({
    status: z.enum(['running', 'success', 'error', 'canceled']),
    startedAt: z.string(),
    stoppedAt: z.string().optional(),
    duration: z.number().optional(),
    resultData: z.array(z.any()).optional(),
    runData: z.record(z.any()).optional()
  }),
  timestamp: z.string().optional(),
  source: z.string().optional(),
  correlationId: z.string().optional()
});

const N8nWorkflowEventSchema = z.object({
  event: z.enum(['workflow.created', 'workflow.updated', 'workflow.deleted', 'workflow.activated', 'workflow.deactivated']),
  workflowId: z.string().min(1, 'Workflow ID is required'),
  data: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  source: z.string().optional(),
  correlationId: z.string().optional()
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
// Webhook Handlers
// ============================================================================

/**
 * POST /api/orchestration/webhook
 * Handle n8n webhook events
 */
export const POST = withVerifiedWebhook(
  async (context: WebhookContext, request: NextRequest) => {
    try {
      initializeInstances();
      
      const eventData = N8nWebhookEventSchema.parse(context.json);
      
      // Route event to appropriate handler
      switch (eventData.event) {
        case 'workflow.execution.started':
          return await handleExecutionStarted(eventData, context);
        case 'workflow.execution.completed':
          return await handleExecutionCompleted(eventData, context);
        case 'workflow.execution.failed':
          return await handleExecutionFailed(eventData, context);
        case 'workflow.created':
        case 'workflow.updated':
        case 'workflow.deleted':
        case 'workflow.activated':
        case 'workflow.deactivated':
          return await handleWorkflowEvent(eventData, context);
        default:
          return await handleGenericEvent(eventData, context);
      }
      
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          error: 'Invalid webhook payload',
          details: error.errors
        }, { status: 400 });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  },
  {
    hmac: {
      headerName: 'X-N8N-Signature',
      secretEnv: 'N8N_WEBHOOK_SECRET'
    },
    idempotency: {
      namespace: 'n8n-webhook',
      ttlSeconds: 86400 // 24 hours
    }
  }
);

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle workflow execution started event
 */
async function handleExecutionStarted(
  eventData: z.infer<typeof N8nWebhookEventSchema>,
  context: WebhookContext
): Promise<NextResponse> {
  try {
    const executionData = N8nExecutionEventSchema.parse(eventData);
    
    // Log execution start
    console.log(`[Webhook] Workflow execution started: ${executionData.executionId}`, {
      workflowId: executionData.workflowId,
      eventId: context.eventId,
      timestamp: executionData.timestamp
    });
    
    // Update execution status in history
    const execution = executionHistory.getExecution(executionData.executionId);
    if (execution) {
      execution.status = 'running';
      await executionHistory.storeExecution(execution);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Execution started event processed',
      eventId: context.eventId,
      executionId: executionData.executionId
    });
    
  } catch (error) {
    console.error('Error handling execution started event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process execution started event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle workflow execution completed event
 */
async function handleExecutionCompleted(
  eventData: z.infer<typeof N8nWebhookEventSchema>,
  context: WebhookContext
): Promise<NextResponse> {
  try {
    const executionData = N8nExecutionEventSchema.parse(eventData);
    
    // Log execution completion
    console.log(`[Webhook] Workflow execution completed: ${executionData.executionId}`, {
      workflowId: executionData.workflowId,
      status: executionData.data.status,
      duration: executionData.data.duration,
      eventId: context.eventId
    });
    
    // Update execution status in history
    const execution = executionHistory.getExecution(executionData.executionId);
    if (execution) {
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.duration = executionData.data.duration || 0;
      
      // Update step results with n8n data
      if (executionData.data.resultData) {
        execution.results = executionData.data.resultData.map((result: any, index: number) => ({
          stepId: `step-${index + 1}`,
          stepName: `Step ${index + 1}`,
          status: 'completed',
          startTime: new Date(executionData.data.startedAt),
          endTime: new Date(),
          duration: executionData.data.duration || 0,
          output: result,
          retryCount: 0,
          logs: []
        }));
      }
      
      await executionHistory.storeExecution(execution);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Execution completed event processed',
      eventId: context.eventId,
      executionId: executionData.executionId
    });
    
  } catch (error) {
    console.error('Error handling execution completed event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process execution completed event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle workflow execution failed event
 */
async function handleExecutionFailed(
  eventData: z.infer<typeof N8nWebhookEventSchema>,
  context: WebhookContext
): Promise<NextResponse> {
  try {
    const executionData = N8nExecutionEventSchema.parse(eventData);
    
    // Log execution failure
    console.error(`[Webhook] Workflow execution failed: ${executionData.executionId}`, {
      workflowId: executionData.workflowId,
      status: executionData.data.status,
      duration: executionData.data.duration,
      eventId: context.eventId
    });
    
    // Update execution status in history
    const execution = executionHistory.getExecution(executionData.executionId);
    if (execution) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.duration = executionData.data.duration || 0;
      
      // Add error to execution
      execution.errors.push({
        id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: 'execution',
        message: 'Workflow execution failed',
        timestamp: new Date(),
        retryable: true,
        context: {
          workflowId: executionData.workflowId,
          executionId: executionData.executionId,
          n8nStatus: executionData.data.status
        }
      });
      
      await executionHistory.storeExecution(execution);
      
      // Add to dead letter queue for retry
      await deadLetterQueue.addFailedExecution(
        execution,
        execution.errors[0],
        'normal'
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Execution failed event processed',
      eventId: context.eventId,
      executionId: executionData.executionId
    });
    
  } catch (error) {
    console.error('Error handling execution failed event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process execution failed event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle workflow lifecycle events
 */
async function handleWorkflowEvent(
  eventData: z.infer<typeof N8nWebhookEventSchema>,
  context: WebhookContext
): Promise<NextResponse> {
  try {
    const workflowData = N8nWorkflowEventSchema.parse(eventData);
    
    // Log workflow event
    console.log(`[Webhook] Workflow event: ${workflowData.event}`, {
      workflowId: workflowData.workflowId,
      eventId: context.eventId,
      timestamp: workflowData.timestamp
    });
    
    // Handle different workflow events
    switch (workflowData.event) {
      case 'workflow.created':
        await handleWorkflowCreated(workflowData);
        break;
      case 'workflow.updated':
        await handleWorkflowUpdated(workflowData);
        break;
      case 'workflow.deleted':
        await handleWorkflowDeleted(workflowData);
        break;
      case 'workflow.activated':
        await handleWorkflowActivated(workflowData);
        break;
      case 'workflow.deactivated':
        await handleWorkflowDeactivated(workflowData);
        break;
    }
    
    return NextResponse.json({
      success: true,
      message: `Workflow ${workflowData.event} event processed`,
      eventId: context.eventId,
      workflowId: workflowData.workflowId
    });
    
  } catch (error) {
    console.error('Error handling workflow event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process workflow event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Handle generic webhook events
 */
async function handleGenericEvent(
  eventData: z.infer<typeof N8nWebhookEventSchema>,
  context: WebhookContext
): Promise<NextResponse> {
  try {
    // Log generic event
    console.log(`[Webhook] Generic event: ${eventData.event}`, {
      workflowId: eventData.workflowId,
      eventId: context.eventId,
      timestamp: eventData.timestamp
    });
    
    // For generic events, we might want to trigger workflows based on the event type
    if (eventData.workflowId && eventData.data) {
      // Check if there are any workflows that should be triggered by this event
      const workflows = await getWorkflowsByTrigger(eventData.event);
      
      for (const workflow of workflows) {
        try {
          // Execute workflow with event data as payload
          const result = await workflowExecutor.executeWorkflow(
            workflow,
            eventData.data,
            {
              userId: eventData.userId,
              sessionId: eventData.sessionId,
              environment: eventData.environment || 'prod',
              priority: eventData.priority || 'normal',
              correlationId: eventData.correlationId
            }
          );
          
          // Store execution history
          if (result.success) {
            await executionHistory.storeExecution({
              id: result.executionId,
              workflowId: result.workflowId,
              status: result.status,
              payload: eventData.data,
              trigger: {
                id: 'webhook',
                type: 'webhook',
                config: { event: eventData.event },
                enabled: true
              },
              metadata: {
                executionId: result.executionId,
                workflowId: result.workflowId,
                triggerType: 'webhook',
                userId: eventData.userId,
                sessionId: eventData.sessionId,
                environment: eventData.environment || 'prod',
                source: 'n8n-webhook',
                timestamp: new Date(),
                correlationId: eventData.correlationId
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
          }
        } catch (error) {
          console.error(`Error executing workflow ${workflow.id} for event ${eventData.event}:`, error);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Generic event processed',
      eventId: context.eventId,
      event: eventData.event
    });
    
  } catch (error) {
    console.error('Error handling generic event:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process generic event',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// ============================================================================
// Workflow Event Handlers
// ============================================================================

/**
 * Handle workflow created event
 */
async function handleWorkflowCreated(workflowData: z.infer<typeof N8nWorkflowEventSchema>): Promise<void> {
  console.log(`[Webhook] Workflow created: ${workflowData.workflowId}`);
  // In real implementation, this would sync the workflow definition
  // to the local workflow registry
}

/**
 * Handle workflow updated event
 */
async function handleWorkflowUpdated(workflowData: z.infer<typeof N8nWorkflowEventSchema>): Promise<void> {
  console.log(`[Webhook] Workflow updated: ${workflowData.workflowId}`);
  // In real implementation, this would update the workflow definition
  // in the local workflow registry
}

/**
 * Handle workflow deleted event
 */
async function handleWorkflowDeleted(workflowData: z.infer<typeof N8nWorkflowEventSchema>): Promise<void> {
  console.log(`[Webhook] Workflow deleted: ${workflowData.workflowId}`);
  // In real implementation, this would remove the workflow definition
  // from the local workflow registry
}

/**
 * Handle workflow activated event
 */
async function handleWorkflowActivated(workflowData: z.infer<typeof N8nWorkflowEventSchema>): Promise<void> {
  console.log(`[Webhook] Workflow activated: ${workflowData.workflowId}`);
  // In real implementation, this would activate the workflow
  // in the local workflow registry
}

/**
 * Handle workflow deactivated event
 */
async function handleWorkflowDeactivated(workflowData: z.infer<typeof N8nWorkflowEventSchema>): Promise<void> {
  console.log(`[Webhook] Workflow deactivated: ${workflowData.workflowId}`);
  // In real implementation, this would deactivate the workflow
  // in the local workflow registry
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get workflows that should be triggered by an event
 * In real implementation, this would query the workflow registry
 */
async function getWorkflowsByTrigger(eventType: string): Promise<WorkflowDefinition[]> {
  // Mock implementation - in production, this would query the workflow registry
  // to find workflows that have triggers matching the event type
  return [];
}

/**
 * Validate webhook signature
 */
function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This would implement HMAC validation
  // For now, we'll assume the withVerifiedWebhook wrapper handles this
  return true;
}

/**
 * Generate correlation ID
 */
function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
