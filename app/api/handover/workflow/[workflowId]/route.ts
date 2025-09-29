/**
 * @fileoverview Workflow Status API Endpoint
 * @module app/api/handover/workflow/[workflowId]/route
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.2: API endpoint for monitoring handover workflow status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handoverOrchestrator } from '@/lib/handover/handover-orchestrator';

interface WorkflowAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

/**
 * GET /api/handover/workflow/[workflowId]
 * Get workflow status and progress
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    const { workflowId } = params;
    
    console.log(`📊 GET /api/handover/workflow/${workflowId} - Request ID: ${requestId}`);
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_WORKFLOW_ID',
          message: 'Workflow ID is required'
        }
      }, { status: 400 });
    }
    
    const workflow = await handoverOrchestrator.getWorkflowStatus(workflowId);
    
    if (!workflow) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: `Workflow with ID '${workflowId}' not found`
        }
      }, { status: 404 });
    }
    
    const response: WorkflowAPIResponse = {
      success: true,
      data: {
        workflowId: workflow.id,
        clientId: workflow.clientId,
        clientName: workflow.clientConfig.name,
        status: workflow.state,
        currentStep: workflow.currentStep,
        progress: workflow.progress,
        startedAt: workflow.startedAt,
        completedAt: workflow.completedAt,
        estimatedDuration: workflow.estimatedDuration,
        actualDuration: workflow.actualDuration,
        steps: workflow.steps.map(step => ({
          step: step.step,
          state: step.state,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
          duration: step.duration,
          qualityScore: step.qualityScore,
          error: step.error ? {
            message: step.error.message,
            type: step.error.errorType,
            recoverable: step.error.recoverable,
            timestamp: step.error.timestamp
          } : undefined
        })),
        errors: workflow.errors.map(error => ({
          step: error.step,
          message: error.message,
          type: error.errorType,
          timestamp: error.timestamp,
          recoverable: error.recoverable
        })),
        deliverables: workflow.deliverables ? {
          packageId: workflow.deliverables.packageId,
          version: workflow.deliverables.version,
          generatedAt: workflow.deliverables.generatedAt,
          qualityScore: workflow.deliverables.qualityReport.overallScore
        } : null
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Failed to get workflow status:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'WORKFLOW_STATUS_ERROR',
        message: 'Failed to get workflow status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

/**
 * POST /api/handover/workflow/[workflowId]
 * Retry a failed workflow step
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    const { workflowId } = params;
    
    console.log(`🔄 POST /api/handover/workflow/${workflowId} - Request ID: ${requestId}`);
    
    const body = await request.json();
    const { action, step } = body;
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_WORKFLOW_ID',
          message: 'Workflow ID is required'
        }
      }, { status: 400 });
    }
    
    if (action === 'retry' && step) {
      const success = await handoverOrchestrator.retryWorkflowStep(workflowId, step);
      
      if (!success) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'RETRY_FAILED',
            message: 'Failed to retry workflow step'
          }
        }, { status: 400 });
      }
      
      const response: WorkflowAPIResponse = {
        success: true,
        data: {
          message: `Workflow step '${step}' retry initiated`,
          workflowId,
          step,
          action: 'retry',
          initiatedAt: new Date()
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          version: '1.0.0'
        }
      };
      
      return NextResponse.json(response);
    } else {
      return NextResponse.json({
        success: false,
        error: {
          code: 'INVALID_ACTION',
          message: 'Invalid action or missing step parameter'
        }
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Failed to perform workflow action:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'WORKFLOW_ACTION_ERROR',
        message: 'Failed to perform workflow action',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

/**
 * DELETE /api/handover/workflow/[workflowId]
 * Cancel a running workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { workflowId: string } }
): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    const { workflowId } = params;
    
    console.log(`🛑 DELETE /api/handover/workflow/${workflowId} - Request ID: ${requestId}`);
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_WORKFLOW_ID',
          message: 'Workflow ID is required'
        }
      }, { status: 400 });
    }
    
    const url = new URL(request.url);
    const reason = url.searchParams.get('reason') || 'Cancelled by user request';
    
    const success = await handoverOrchestrator.cancelWorkflow(workflowId, reason);
    
    if (!success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: `Workflow with ID '${workflowId}' not found or cannot be cancelled`
        }
      }, { status: 404 });
    }
    
    const response: WorkflowAPIResponse = {
      success: true,
      data: {
        message: 'Workflow cancelled successfully',
        workflowId,
        reason,
        cancelledAt: new Date()
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Failed to cancel workflow:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'WORKFLOW_CANCEL_ERROR',
        message: 'Failed to cancel workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

function generateRequestId(): string {
  return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
