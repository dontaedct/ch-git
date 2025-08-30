/**
 * @fileoverview Server action for retrieving checkout session details
 */

'use server';

import { StripeService } from '../service/stripe-service';
import type { StripeCheckoutConfig, CheckoutSession } from '../types';

export interface SessionResult {
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}

/**
 * Get checkout session details by ID
 */
export async function getCheckoutSession(
  sessionId: string,
  config: StripeCheckoutConfig
): Promise<SessionResult> {
  try {
    // Validate session ID format
    if (!sessionId || !sessionId.startsWith('cs_')) {
      return {
        success: false,
        error: 'Invalid session ID format',
      };
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      return {
        success: false,
        error: 'Stripe not configured',
      };
    }

    const stripeService = new StripeService(config, secretKey);
    
    if (!stripeService.isAvailable()) {
      return {
        success: false,
        error: 'Stripe service unavailable',
      };
    }

    const session = await stripeService.getCheckoutSession(sessionId);

    return {
      success: true,
      data: session,
    };

  } catch (error) {
    console.error('Failed to retrieve checkout session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve session',
    };
  }
}

/**
 * Get multiple checkout sessions by IDs
 */
export async function getCheckoutSessions(
  sessionIds: string[],
  config: StripeCheckoutConfig
): Promise<{
  success: boolean;
  data?: CheckoutSession[];
  errors?: string[];
}> {
  try {
    const results = await Promise.allSettled(
      sessionIds.map(id => getCheckoutSession(id, config))
    );

    const successful: CheckoutSession[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        successful.push(result.value.data);
      } else {
        const error = result.status === 'fulfilled' 
          ? result.value.error || 'Unknown error'
          : result.reason?.message || 'Request failed';
        errors.push(`Session ${sessionIds[index]}: ${error}`);
      }
    });

    return {
      success: successful.length > 0,
      data: successful,
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('Failed to retrieve checkout sessions:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Bulk session retrieval failed'],
    };
  }
}

/**
 * Check if a checkout session is valid and not expired
 */
export async function validateCheckoutSession(
  sessionId: string,
  config: StripeCheckoutConfig
): Promise<{
  valid: boolean;
  session?: CheckoutSession;
  reason?: string;
}> {
  const result = await getCheckoutSession(sessionId, config);

  if (!result.success || !result.data) {
    return {
      valid: false,
      reason: result.error || 'Session not found',
    };
  }

  const session = result.data;

  // Check if session is expired
  if (session.status === 'expired') {
    return {
      valid: false,
      session,
      reason: 'Session has expired',
    };
  }

  // Check if session is already completed
  if (session.status === 'complete') {
    return {
      valid: false,
      session,
      reason: 'Session already completed',
    };
  }

  return {
    valid: true,
    session,
  };
}