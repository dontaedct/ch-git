/**
 * @fileoverview Webhook Emission API Endpoint
 * Handles webhook emissions from client components
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  emitConsultationGenerated, 
  emitPdfDownloaded, 
  emitEmailCopyRequested,
  emitLeadStartedQuestionnaire,
  emitLeadCompletedQuestionnaire
} from '@/lib/webhooks/emitter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data } = body;

    switch (event) {
      case 'consultation_generated':
        await emitConsultationGenerated(data);
        break;
      case 'pdf_downloaded':
        await emitPdfDownloaded(data);
        break;
      case 'email_copy_requested':
        await emitEmailCopyRequested(data);
        break;
      case 'lead_started_questionnaire':
        await emitLeadStartedQuestionnaire(data);
        break;
      case 'lead_completed_questionnaire':
        await emitLeadCompletedQuestionnaire(data);
        break;
      default:
        return NextResponse.json(
          { error: 'Unknown event type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook emission error:', error);
    return NextResponse.json(
      { error: 'Failed to emit webhook' },
      { status: 500 }
    );
  }
}
