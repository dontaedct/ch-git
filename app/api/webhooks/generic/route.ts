/**
 * Generic Webhook Handler
 * 
 * Example webhook endpoint with configurable HMAC verification and idempotency.
 * Can be adapted for various webhook providers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withGenericWebhook, WebhookContext } from '@/lib/webhooks';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Generic webhook handler
 * Processes verified webhook events with idempotency protection
 */
async function genericWebhookHandler(
  context: WebhookContext,
  _request: NextRequest
): Promise<NextResponse> {
  try {
    const { json, eventId } = context;
    const event = json;

    console.info(`Processing generic webhook event: ${eventId}`);

    // Extract event type from common fields
    const eventType = event.type ?? event.event ?? event.action ?? 'unknown';
    
    // Handle different event types
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(event);
        break;
      
      case 'user.updated':
        await handleUserUpdated(event);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(event);
        break;
      
      case 'order.created':
        await handleOrderCreated(event);
        break;
      
      case 'order.updated':
        await handleOrderUpdated(event);
        break;
      
      case 'notification.sent':
        await handleNotificationSent(event);
        break;
      
      default:
        console.info(`Unhandled generic event type: ${eventType}`);
        // Return 200 for unhandled events to acknowledge receipt
        return NextResponse.json(ok({ 
          message: 'Event received but not processed',
          eventType,
          eventId 
        }));
    }

    return NextResponse.json(ok({ 
      message: 'Event processed successfully',
      eventType,
      eventId 
    }));

  } catch (error) {
    console.error('Generic webhook processing error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_PROCESSING_ERROR'
      ),
      { status: 500 }
    );
  }
}

// Event handlers (implement based on your business logic)
async function handleUserCreated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('User created:', (event.data as any)?.id ?? (event.user as any)?.id);
  // TODO: Create user record, send welcome email, etc.
}

async function handleUserUpdated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('User updated:', (event.data as any)?.id ?? (event.user as any)?.id);
  // TODO: Update user record, sync changes, etc.
}

async function handleUserDeleted(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('User deleted:', (event.data as any)?.id ?? (event.user as any)?.id);
  // TODO: Clean up user data, send deletion confirmation, etc.
}

async function handleOrderCreated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Order created:', (event.data as any)?.id ?? (event.order as any)?.id);
  // TODO: Process order, update inventory, send confirmation, etc.
}

async function handleOrderUpdated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Order updated:', (event.data as any)?.id ?? (event.order as any)?.id);
  // TODO: Update order status, notify customer, etc.
}

async function handleNotificationSent(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Notification sent:', (event.data as any)?.id ?? (event.notification as any)?.id);
  // TODO: Log notification, update delivery status, etc.
}

// Export the wrapped handler with configuration
export const POST = withGenericWebhook(genericWebhookHandler, {
  headerName: 'X-Webhook-Signature',
  secretEnv: 'GENERIC_WEBHOOK_SECRET',
  signaturePrefix: 'sha256=',
  namespace: 'generic',
  ttlSeconds: 86400 // 24 hours
});
