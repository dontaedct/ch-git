/**
 * @fileoverview SOP Generation API Endpoint
 * @module app/api/handover/sop/route
 * @author OSS Hero Development Team
 * @version 1.0.0
 * @since 2025-09-23
 * 
 * HT-035.4.2: API endpoint for generating Standard Operating Procedures.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SOPGenerator } from '@/lib/handover/sop-generator';
import type { ClientConfig, GeneratedSOP } from '@/types/handover';

interface SOPAPIResponse<T = any> {
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
 * POST /api/handover/sop
 * Generate SOP for client
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    console.log(`📄 POST /api/handover/sop - Request ID: ${requestId}`);
    
    const body = await request.json();
    const { clientConfig, templateType = 'admin-operations', customizations = {} } = body;
    
    if (!clientConfig) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'MISSING_CLIENT_CONFIG',
          message: 'Client configuration is required'
        }
      }, { status: 400 });
    }
    
    const sopGenerator = SOPGenerator.getInstance();
    const sop = await sopGenerator.generateSOP(templateType, clientConfig, customizations);
    
    const response: SOPAPIResponse = {
      success: true,
      data: {
        sop,
        generatedAt: new Date(),
        templateType,
        clientId: clientConfig.id
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ SOP generation failed:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'SOP_GENERATION_ERROR',
        message: 'Failed to generate SOP',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

/**
 * GET /api/handover/sop
 * Get available SOP templates
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const requestId = generateRequestId();
    console.log(`📋 GET /api/handover/sop - Request ID: ${requestId}`);
    
    const sopGenerator = SOPGenerator.getInstance();
    const templates = sopGenerator.getAllTemplates();
    
    const response: SOPAPIResponse = {
      success: true,
      data: {
        templates,
        totalTemplates: templates.length
      },
      metadata: {
        timestamp: new Date(),
        requestId,
        version: '1.0.0'
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Failed to get SOP templates:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        code: 'TEMPLATE_FETCH_ERROR',
        message: 'Failed to fetch SOP templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

function generateRequestId(): string {
  return `sop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
