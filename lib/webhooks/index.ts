/**
 * Webhook Security Wrapper
 * 
 * Provides uniform HMAC verification and idempotency for all webhook routes.
 * Combines signature verification with replay attack prevention.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookHmac, verifyStripeWebhook, HmacConfig } from './verifyHmac';
import { checkAndMarkProcessed, IdempotencyConfig } from './idempotency';

export interface WebhookConfig {
  /** HMAC verification configuration */
  hmac: HmacConfig;
  /** Idempotency configuration */
  idempotency: IdempotencyConfig;
  /** Whether to use Stripe-specific verification */
  isStripe?: boolean;
}

export interface WebhookContext {
  /** Raw request body */
  body: string;
  /** Parsed JSON body */
  json: Record<string, unknown>;
  /** Event ID for idempotency */
  eventId: string;
  /** Whether this is a replay */
  isReplay: boolean;
}

/**
 * Webhook handler function type
 */
export type WebhookHandler = (
  context: WebhookContext,
  request: NextRequest
) => Promise<NextResponse>;

/**
 * Wraps a webhook handler with HMAC verification and idempotency checks
 * @param handler - Webhook handler function
 * @param config - Webhook security configuration
 * @returns Wrapped handler with security applied
 */
export function withVerifiedWebhook(
  handler: WebhookHandler,
  config: WebhookConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Step 1: HMAC Verification
      const hmacResult = config.isStripe
        ? await verifyStripeWebhook(request, config.hmac.secretEnv)
        : await verifyWebhookHmac(request, config.hmac);

      if (!hmacResult.isValid) {
        console.warn(`Webhook HMAC verification failed: ${hmacResult.error}`);
        return NextResponse.json(
          { error: 'Unauthorized', code: 'INVALID_SIGNATURE' },
          { status: 401 }
        );
      }

      // Step 2: Idempotency Check
      const idempotencyResult = await checkAndMarkProcessed(request, config.idempotency);
      
      if (idempotencyResult.wasProcessed) {
        console.info(`Webhook replay detected for event ${idempotencyResult.eventId}`);
        return NextResponse.json(
          { 
            message: 'Event already processed', 
            code: 'ALREADY_PROCESSED',
            eventId: idempotencyResult.eventId,
            processedAt: idempotencyResult.processedAt
          },
          { status: 200 } // Return 200 for idempotent operations
        );
      }

      // Step 3: Prepare context for handler
      const clonedRequest = request.clone();
      const body = await clonedRequest.text();
      let json: Record<string, unknown>;
      
      try {
        json = JSON.parse(body);
      } catch {
        return NextResponse.json(
          { error: 'Invalid JSON payload', code: 'INVALID_JSON' },
          { status: 400 }
        );
      }

      const context: WebhookContext = {
        body,
        json,
        eventId: idempotencyResult.eventId,
        isReplay: false
      };

      // Step 4: Execute handler
      return await handler(context, request);

    } catch (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json(
        { 
          error: 'Internal server error', 
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Convenience function for Stripe webhooks
 */
export function withStripeWebhook(
  handler: WebhookHandler,
  secretEnv: string = 'STRIPE_WEBHOOK_SECRET',
  namespace: string = 'stripe'
) {
  return withVerifiedWebhook(handler, {
    hmac: {
      headerName: 'Stripe-Signature',
      secretEnv
    },
    idempotency: {
      namespace,
      ttlSeconds: 86400 // 24 hours
    },
    isStripe: true
  });
}

/**
 * Convenience function for GitHub webhooks
 */
export function withGitHubWebhook(
  handler: WebhookHandler,
  secretEnv: string = 'GITHUB_WEBHOOK_SECRET',
  namespace: string = 'github'
) {
  return withVerifiedWebhook(handler, {
    hmac: {
      headerName: 'X-Hub-Signature-256',
      secretEnv,
      signaturePrefix: 'sha256='
    },
    idempotency: {
      namespace,
      ttlSeconds: 86400 // 24 hours
    }
  });
}

/**
 * Convenience function for generic webhooks
 */
export function withGenericWebhook(
  handler: WebhookHandler,
  config: {
    headerName: string;
    secretEnv: string;
    signaturePrefix?: string;
    namespace: string;
    ttlSeconds?: number;
  }
) {
  return withVerifiedWebhook(handler, {
    hmac: {
      headerName: config.headerName,
      secretEnv: config.secretEnv,
      signaturePrefix: config.signaturePrefix
    },
    idempotency: {
      namespace: config.namespace,
      ttlSeconds: config.ttlSeconds ?? 86400
    }
  });
}
