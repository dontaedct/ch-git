/**
 * @fileoverview PDF Generation API Route
 * Handles questionnaire-to-PDF generation requests
 * HT-029.3.2 Implementation
 */

import { NextRequest, NextResponse } from 'next/server';
import { questionnairePDFPipeline, type PDFGenerationRequest, type ClientData } from '@/lib/pdf-generation/questionnaire-pdf-pipeline';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.clientData || !body.templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: clientData and templateId' },
        { status: 400 }
      );
    }

    // Prepare PDF generation request
    const pdfRequest: PDFGenerationRequest = {
      templateId: body.templateId || 'consultation-report',
      clientData: body.clientData as ClientData,
      assessment: body.assessment, // Optional, will be generated if not provided
      customization: body.customization,
      delivery: body.delivery
    };

    // Generate PDF using the pipeline
    const result = await questionnairePDFPipeline.generatePDF(pdfRequest);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'PDF generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        pdfUrl: result.pdfUrl,
        filename: result.filename,
        metadata: result.metadata
      }
    });

  } catch (error) {
    console.error('PDF Generation API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during PDF generation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Health check endpoint
  return NextResponse.json({
    status: 'operational',
    service: 'PDF Generation API',
    timestamp: new Date().toISOString(),
    capabilities: {
      templates: ['consultation-report', 'assessment-report', 'proposal-template'],
      formats: ['A4', 'Letter', 'Legal'],
      integrations: ['questionnaire-system', 'template-engine'],
      features: ['auto-assessment', 'custom-branding', 'multi-format-output']
    }
  });
}