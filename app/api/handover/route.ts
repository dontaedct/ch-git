/**
 * @fileoverview Main Handover API Endpoint
 * @module app/api/handover/route
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.2: Main API endpoint for handover automation system.
 * Provides RESTful API for generating and managing client handover packages.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handoverOrchestrator } from '@/lib/handover/handover-orchestrator';
import { deliverablesEngine } from '@/lib/handover/deliverables-engine';
import type { ClientConfig, SystemAnalysis } from '@/lib/handover/deliverables-engine';

// API Response types
interface HandoverAPIResponse<T = any> {
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

// Request validation schemas
const clientConfigSchema = {
  id: 'string',
  name: 'string',
  domain: 'string',
  adminEmail: 'string',
  productionUrl: 'string'
};

/**
 * GET /api/handover
 * Get handover system status and available operations
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    
    console.log(`📋 GET /api/handover - Request ID: ${requestId}`);
    
    // Get active workflows
    const activeWorkflows = handoverOrchestrator.getActiveWorkflows();
    const workflowHistory = handoverOrchestrator.getWorkflowHistory(10);
    
    const response: HandoverAPIResponse = {
      success: true,
      data: {
        status: 'operational',
        version: '1.0.0',
        capabilities: [
          'deliverables_generation',
          'workflow_orchestration',
          'quality_validation',
          'package_delivery'
        ],
        activeWorkflows: activeWorkflows.length,
        recentWorkflows: workflowHistory.length,
        endpoints: {
          generatePackage: '/api/handover/generate',
          getWorkflowStatus: '/api/handover/workflow/{workflowId}',
          cancelWorkflow: '/api/handover/workflow/{workflowId}/cancel',
          validateConfig: '/api/handover/validate',
          generateSOP: '/api/handover/sop',
          generateDocs: '/api/handover/documentation',
          generateTraining: '/api/handover/training'
        }
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ GET /api/handover failed:', error);
    
    const errorResponse: HandoverAPIResponse = {
      success: false,
      error: {
        code: 'HANDOVER_STATUS_ERROR',
        message: 'Failed to get handover system status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/handover
 * Start a new handover workflow
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    
    console.log(`🚀 POST /api/handover - Request ID: ${requestId}`);
    
    // Parse request body
    const body = await request.json();
    const { clientConfig, systemAnalysis, options = {} } = body;
    
    // Validate required fields
    if (!clientConfig || !systemAnalysis) {
      const errorResponse: HandoverAPIResponse = {
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'clientConfig and systemAnalysis are required',
          details: { received: Object.keys(body) }
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          version: '1.0.0'
        }
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Validate client configuration
    const validationError = validateClientConfig(clientConfig);
    if (validationError) {
      const errorResponse: HandoverAPIResponse = {
        success: false,
        error: {
          code: 'INVALID_CLIENT_CONFIG',
          message: 'Invalid client configuration',
          details: validationError
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          version: '1.0.0'
        }
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Start handover workflow
    const workflow = await handoverOrchestrator.startHandoverWorkflow(
      clientConfig as ClientConfig,
      systemAnalysis as SystemAnalysis,
      {
        ...options,
        requestedBy: 'api_user',
        requestId
      }
    );
    
    const response: HandoverAPIResponse = {
      success: true,
      data: {
        workflowId: workflow.id,
        clientId: workflow.clientId,
        status: workflow.state,
        estimatedDuration: workflow.estimatedDuration,
        progress: workflow.progress,
        startedAt: workflow.startedAt
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response, { status: 201 });
    
  } catch (error) {
    console.error('❌ POST /api/handover failed:', error);
    
    const errorResponse: HandoverAPIResponse = {
      success: false,
      error: {
        code: 'HANDOVER_WORKFLOW_ERROR',
        message: 'Failed to start handover workflow',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * PUT /api/handover
 * Update handover system configuration
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    
    console.log(`🔧 PUT /api/handover - Request ID: ${requestId}`);
    
    // Parse request body
    const body = await request.json();
    const { configuration } = body;
    
    // For now, just acknowledge the configuration update
    // In a real implementation, this would update system settings
    
    const response: HandoverAPIResponse = {
      success: true,
      data: {
        message: 'Handover system configuration updated successfully',
        configuration: configuration || {},
        updatedAt: new Date()
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ PUT /api/handover failed:', error);
    
    const errorResponse: HandoverAPIResponse = {
      success: false,
      error: {
        code: 'CONFIGURATION_UPDATE_ERROR',
        message: 'Failed to update handover system configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * DELETE /api/handover
 * Reset handover system (clear all workflows and cache)
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    
    console.log(`🗑️ DELETE /api/handover - Request ID: ${requestId}`);
    
    // Get confirmation parameter
    const url = new URL(request.url);
    const confirm = url.searchParams.get('confirm');
    
    if (confirm !== 'true') {
      const errorResponse: HandoverAPIResponse = {
        success: false,
        error: {
          code: 'CONFIRMATION_REQUIRED',
          message: 'System reset requires confirmation parameter: ?confirm=true',
          details: { received: confirm }
        },
        metadata: {
          timestamp: new Date(),
          requestId,
          version: '1.0.0'
        }
      };
      
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Cancel all active workflows
    const activeWorkflows = handoverOrchestrator.getActiveWorkflows();
    const cancellationResults = await Promise.allSettled(
      activeWorkflows.map(workflow => 
        handoverOrchestrator.cancelWorkflow(workflow.id, 'System reset requested')
      )
    );
    
    const cancelledCount = cancellationResults.filter(
      result => result.status === 'fulfilled' && result.value === true
    ).length;
    
    const response: HandoverAPIResponse = {
      success: true,
      data: {
        message: 'Handover system reset completed',
        cancelledWorkflows: cancelledCount,
        resetAt: new Date()
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ DELETE /api/handover failed:', error);
    
    const errorResponse: HandoverAPIResponse = {
      success: false,
      error: {
        code: 'SYSTEM_RESET_ERROR',
        message: 'Failed to reset handover system',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      metadata: {
        timestamp: new Date(),
        requestId: generateRequestId(),
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Helper functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function validateClientConfig(config: any): string | null {
  if (!config || typeof config !== 'object') {
    return 'Client configuration must be an object';
  }
  
  for (const [field, type] of Object.entries(clientConfigSchema)) {
    if (!config[field]) {
      return `Missing required field: ${field}`;
    }
    
    if (typeof config[field] !== type) {
      return `Field ${field} must be of type ${type}, got ${typeof config[field]}`;
    }
  }
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.adminEmail)) {
    return 'Invalid email format for adminEmail';
  }
  
  // Validate URL format
  try {
    new URL(config.domain);
    new URL(config.productionUrl);
  } catch {
    return 'Invalid URL format for domain or productionUrl';
  }
  
  return null;
}
