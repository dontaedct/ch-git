/**
 * Stripe Webhook Handler
 * 
 * Secure webhook endpoint with HMAC verification and idempotency.
 * Handles Stripe events with proper signature verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withStripeWebhook, WebhookContext } from '@/lib/webhooks';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

/**
 * Stripe webhook handler
 * Processes verified Stripe events with idempotency protection
 */
async function stripeWebhookHandler(
  context: WebhookContext,
  _request: NextRequest
): Promise<NextResponse> {
  try {
    const { json, eventId } = context;
    const event = json;

    console.info(`Processing Stripe event: ${event.type} (${eventId})`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      
      default:
        console.info(`Unhandled Stripe event type: ${event.type}`);
        // Return 200 for unhandled events to acknowledge receipt
        return NextResponse.json(ok({ 
          message: 'Event received but not processed',
          eventType: event.type,
          eventId 
        }));
    }

    return NextResponse.json(ok({ 
      message: 'Event processed successfully',
      eventType: event.type,
      eventId 
    }));

  } catch (error) {
    console.error('Stripe webhook processing error:', error);
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
async function handlePaymentSucceeded(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Payment succeeded:', (event.data as any)?.object?.id);
  // TODO: Update user subscription status, send confirmation email, etc.
}

async function handlePaymentFailed(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Payment failed:', (event.data as any)?.object?.id);
  // TODO: Notify user, update subscription status, etc.
}

async function handleSubscriptionCreated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Subscription created:', (event.data as any)?.object?.id);
  // TODO: Activate user features, send welcome email, etc.
}

async function handleSubscriptionUpdated(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Subscription updated:', (event.data as any)?.object?.id);
  // TODO: Update user access levels, notify of changes, etc.
}

async function handleSubscriptionDeleted(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Subscription deleted:', (event.data as any)?.object?.id);
  // TODO: Deactivate user features, send cancellation email, etc.
}

async function handleInvoicePaymentSucceeded(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Invoice payment succeeded:', (event.data as any)?.object?.id);
  // TODO: Update billing records, send receipt, etc.
}

async function handleInvoicePaymentFailed(event: Record<string, unknown>): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Invoice payment failed:', (event.data as any)?.object?.id);
  // TODO: Handle failed payment, notify user, etc.
}

// Export the wrapped handler
export const POST = withStripeWebhook(stripeWebhookHandler);
