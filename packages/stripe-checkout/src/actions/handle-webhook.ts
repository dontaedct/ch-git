/**
 * @fileoverview Webhook handler for Stripe events
 */

'use server';

import { StripeService } from '../service/stripe-service';
import { webhookEventSchema } from '../schemas/checkout';
import type { StripeCheckoutConfig } from '../types';
import type Stripe from 'stripe';

export interface WebhookHandlerResult {
  success: boolean;
  processed: boolean;
  error?: string;
  eventType?: string;
  eventId?: string;
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string,
  signature: string,
  config: StripeCheckoutConfig
): Promise<WebhookHandlerResult> {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
      return {
        success: false,
        processed: false,
        error: 'Stripe webhook configuration missing',
      };
    }

    const stripeService = new StripeService(config, secretKey);
    
    if (!stripeService.isAvailable()) {
      return {
        success: false,
        processed: false,
        error: 'Stripe service unavailable',
      };
    }

    // Verify webhook signature
    const event = stripeService.verifyWebhookSignature(payload, signature, webhookSecret);
    
    // Validate event data
    const validation = webhookEventSchema.safeParse(event);
    if (!validation.success) {
      return {
        success: false,
        processed: false,
        error: 'Invalid webhook event format',
        eventType: event.type,
        eventId: event.id,
      };
    }

    const validatedEvent = validation.data;

    // Process the event
    const processed = await processWebhookEvent(event);

    return {
      success: true,
      processed,
      eventType: validatedEvent.type,
      eventId: validatedEvent.id,
    };

  } catch (error) {
    console.error('Webhook processing error:', error);
    return {
      success: false,
      processed: false,
      error: error instanceof Error ? error.message : 'Webhook processing failed',
    };
  }
}

/**
 * Process different types of webhook events
 */
async function processWebhookEvent(event: Stripe.Event): Promise<boolean> {
  console.info(`Processing Stripe event: ${event.type} (${event.id})`);

  switch (event.type) {
    case 'checkout.session.completed':
      return await handleCheckoutSessionCompleted(event);
      
    case 'checkout.session.expired':
      return await handleCheckoutSessionExpired(event);
      
    case 'payment_intent.succeeded':
      return await handlePaymentIntentSucceeded(event);
      
    case 'payment_intent.payment_failed':
      return await handlePaymentIntentFailed(event);
      
    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event);
      
    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event);
      
    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event);
      
    case 'invoice.payment_succeeded':
      return await handleInvoicePaymentSucceeded(event);
      
    case 'invoice.payment_failed':
      return await handleInvoicePaymentFailed(event);

    default:
      console.info(`Unhandled Stripe event type: ${event.type}`);
      return false; // Event received but not processed
  }
}

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(event: Stripe.Event): Promise<boolean> {
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.info(`Checkout session completed: ${session.id}`);
    console.info(`Customer: ${session.customer}, Amount: ${session.amount_total}`);

    // TODO: Implement business logic
    // - Update user subscription status
    // - Send confirmation email
    // - Grant access to paid features
    // - Create order record
    // - Update database records

    // Example business logic hook
    await processSuccessfulPayment({
      sessionId: session.id,
      customerId: session.customer as string,
      customerEmail: session.customer_email,
      amountTotal: session.amount_total || 0,
      currency: session.currency,
      metadata: session.metadata || {},
    });

    return true;
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    return false;
  }
}

/**
 * Handle expired checkout session
 */
async function handleCheckoutSessionExpired(event: Stripe.Event): Promise<boolean> {
  try {
    const session = event.data.object as Stripe.Checkout.Session;
    
    console.info(`Checkout session expired: ${session.id}`);

    // TODO: Implement business logic
    // - Clean up temporary records
    // - Send cart abandonment email
    // - Update analytics

    return true;
  } catch (error) {
    console.error('Error handling checkout session expired:', error);
    return false;
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(event: Stripe.Event): Promise<boolean> {
  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.info(`Payment intent succeeded: ${paymentIntent.id}`);

    // TODO: Implement business logic for payment success
    
    return true;
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
    return false;
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(event: Stripe.Event): Promise<boolean> {
  try {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    console.info(`Payment intent failed: ${paymentIntent.id}`);

    // TODO: Implement business logic for payment failure
    // - Notify customer
    // - Update payment status
    // - Trigger retry logic

    return true;
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
    return false;
  }
}

/**
 * Handle subscription events
 */
async function handleSubscriptionCreated(event: Stripe.Event): Promise<boolean> {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    console.info(`Subscription created: ${subscription.id}`);
    
    // TODO: Activate subscription features
    
    return true;
  } catch (error) {
    console.error('Error handling subscription created:', error);
    return false;
  }
}

async function handleSubscriptionUpdated(event: Stripe.Event): Promise<boolean> {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    console.info(`Subscription updated: ${subscription.id}`);
    
    // TODO: Update subscription features
    
    return true;
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    return false;
  }
}

async function handleSubscriptionDeleted(event: Stripe.Event): Promise<boolean> {
  try {
    const subscription = event.data.object as Stripe.Subscription;
    console.info(`Subscription deleted: ${subscription.id}`);
    
    // TODO: Deactivate subscription features
    
    return true;
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    return false;
  }
}

/**
 * Handle invoice events
 */
async function handleInvoicePaymentSucceeded(event: Stripe.Event): Promise<boolean> {
  try {
    const invoice = event.data.object as Stripe.Invoice;
    console.info(`Invoice payment succeeded: ${invoice.id}`);
    
    // TODO: Process invoice payment
    
    return true;
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    return false;
  }
}

async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<boolean> {
  try {
    const invoice = event.data.object as Stripe.Invoice;
    console.info(`Invoice payment failed: ${invoice.id}`);
    
    // TODO: Handle invoice payment failure
    
    return true;
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    return false;
  }
}

/**
 * Business logic hook for successful payments
 */
async function processSuccessfulPayment(data: {
  sessionId: string;
  customerId: string | null;
  customerEmail: string | null;
  amountTotal: number;
  currency: string | null;
  metadata: Record<string, string>;
}): Promise<void> {
  // This is where you'd implement your business logic
  console.info('Processing successful payment:', data);
  
  // Example integrations:
  // - Update user database record
  // - Send confirmation email via Resend
  // - Trigger webhooks to other services
  // - Update analytics/metrics
  // - Grant access to premium features
}