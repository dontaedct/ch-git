/**
 * n8n Dead Letter Queue (DLQ) API
 * 
 * Provides endpoints for managing failed n8n workflow messages:
 * - GET: List DLQ messages
 * - POST: Retry specific messages
 * - DELETE: Remove messages from DLQ
 */

import { NextRequest, NextResponse } from 'next/server';
import { DeadLetterQueue } from '@/lib/n8n/reliability';

export const runtime = 'nodejs';

const dlq = new DeadLetterQueue();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenant_id');
    const limit = parseInt(url.searchParams.get('limit') ?? '100');
    
    const messages = await dlq.getMessages(tenantId ?? undefined, limit);
    
    const response = {
      messages,
      total: messages.length,
      tenant_filter: tenantId,
      limit,
      retrieved_at: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to get DLQ messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get DLQ messages',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message_id, action } = body;
    
    if (!message_id) {
      return NextResponse.json(
        { error: 'message_id is required' },
        { status: 400 }
      );
    }
    
    if (action === 'retry') {
      const success = await dlq.retryMessage(message_id);
      
      const response = {
        success,
        message_id,
        action: 'retry',
        retried_at: new Date().toISOString()
      };
      
      return NextResponse.json(response);
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: retry' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Failed to process DLQ action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process DLQ action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const messageId = url.searchParams.get('message_id');
    
    if (!messageId) {
      return NextResponse.json(
        { error: 'message_id is required' },
        { status: 400 }
      );
    }
    
    const success = await dlq.deleteMessage(messageId);
    
    const response = {
      success,
      message_id: messageId,
      deleted_at: new Date().toISOString()
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to delete DLQ message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete DLQ message',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
