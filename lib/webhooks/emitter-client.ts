/**
 * Client-Side Webhook Emitter Service
 * 
 * Provides webhook emission functionality for client components
 * without importing server-only code
 */

// Client-side webhook emission functions
export async function emitConsultationGenerated(data: {
  consultationId: string;
  clientName: string;
  clientEmail: string;
  templateId: string;
  generatedAt: Date;
}) {
  try {
    // Make API call to server-side webhook endpoint
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'consultation_generated',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit consultation generated webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting consultation generated webhook:', error);
  }
}

export async function emitPdfDownloaded(data: {
  consultationId: string;
  clientName: string;
  clientEmail: string;
  pdfUrl: string;
  downloadedAt: Date;
}) {
  try {
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'pdf_downloaded',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit PDF downloaded webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting PDF downloaded webhook:', error);
  }
}

export async function emitEmailCopyRequested(data: {
  consultationId: string;
  clientName: string;
  clientEmail: string;
  requestedAt: Date;
}) {
  try {
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'email_copy_requested',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit email copy requested webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting email copy requested webhook:', error);
  }
}

export async function emitLeadCaptured(data: {
  email: string;
  name: string;
  company: string;
  phone?: string;
  source: string;
  userId: string;
}) {
  try {
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'lead_captured',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit lead captured webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting lead captured webhook:', error);
  }
}

export async function emitLeadStartedQuestionnaire(data: {
  questionnaireId: string;
  source: string;
  userId: string;
}) {
  try {
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'lead_started_questionnaire',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit lead started questionnaire webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting lead started questionnaire webhook:', error);
  }
}

export async function emitLeadCompletedQuestionnaire(data: {
  questionnaireId: string;
  answers: Record<string, unknown>;
  source: string;
  userId: string;
}) {
  try {
    const response = await fetch('/api/webhooks/emit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'lead_completed_questionnaire',
        data
      }),
    });

    if (!response.ok) {
      console.warn('Failed to emit lead completed questionnaire webhook:', response.statusText);
    }
  } catch (error) {
    console.warn('Error emitting lead completed questionnaire webhook:', error);
  }
}
