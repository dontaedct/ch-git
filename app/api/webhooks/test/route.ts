/**
 * Webhook Testing & Debugging API
 * 
 * Provides tools for testing webhook endpoints, debugging delivery issues,
 * and validating webhook configurations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWebhookEmitter, WebhookEvent } from '@/lib/webhooks/emitter';
import { generateHmacSignature } from '@/lib/webhooks/hmac-signer';
import { verifyWebhookHmac, verifyStripeWebhook } from '@/lib/webhooks/verifyHmac';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

interface TestWebhookRequest {
  /** Webhook endpoint URL to test */
  url: string;
  /** Secret key for HMAC signing */
  secret: string;
  /** Test payload data */
  payload: Record<string, unknown>;
  /** Signature header name (default: 'X-Hub-Signature-256') */
  signatureHeader?: string;
  /** Signature prefix (default: 'sha256=') */
  signaturePrefix?: string;
  /** HTTP method (default: 'POST') */
  method?: 'POST' | 'PUT' | 'PATCH';
  /** Additional headers */
  headers?: Record<string, string>;
  /** Timeout in milliseconds (default: 10000) */
  timeout?: number;
}

interface TestWebhookResponse {
  /** Whether the test was successful */
  success: boolean;
  /** HTTP status code received */
  statusCode?: number;
  /** Response body from the endpoint */
  responseBody?: string;
  /** Response headers */
  responseHeaders?: Record<string, string>;
  /** Error message if failed */
  error?: string;
  /** Time taken for the request (ms) */
  duration: number;
  /** Request details for debugging */
  requestDetails: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
  };
}

/**
 * Test a webhook endpoint with HMAC signing
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TestWebhookRequest = await request.json();
    
    // Validate required fields
    if (!body.url || !body.secret || !body.payload) {
      return NextResponse.json(
        fail('Missing required fields: url, secret, payload'),
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const method = body.method ?? 'POST';
    const signatureHeader = body.signatureHeader ?? 'X-Hub-Signature-256';
    const signaturePrefix = body.signaturePrefix ?? 'sha256=';
    const timeout = body.timeout ?? 10000;

    // Prepare payload
    const jsonPayload = JSON.stringify(body.payload);
    
    // Generate HMAC signature
    const signedPayload = generateHmacSignature(jsonPayload, body.secret, {
      algorithm: 'sha256',
      prefix: signaturePrefix
    });

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'OSS-Hero-Webhook-Tester/1.0',
      ...signedPayload.headers,
      ...body.headers
    };

    // Add custom signature header
    headers[signatureHeader] = signedPayload.signature;

    // Make the test request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    try {
      const response = await fetch(body.url, {
        method,
        headers,
        body: jsonPayload,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      
      // Convert headers to plain object
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const duration = Date.now() - startTime;

      return NextResponse.json(ok({
        success: response.ok,
        statusCode: response.status,
        responseBody,
        responseHeaders,
        duration,
        requestDetails: {
          url: body.url,
          method,
          headers,
          body: jsonPayload
        }
      }));

    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;
      
      return NextResponse.json(ok({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration,
        requestDetails: {
          url: body.url,
          method,
          headers,
          body: jsonPayload
        }
      }));
    }

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_TEST_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Validate webhook signature
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { payload, signature, secret, provider = 'generic' } = body;

    if (!payload || !signature || !secret) {
      return NextResponse.json(
        fail('Missing required fields: payload, signature, secret'),
        { status: 400 }
      );
    }

    let isValid = false;
    let error: string | undefined;

    try {
      if (provider === 'stripe') {
        // For Stripe, we need to create a mock request
        const mockRequest = new Request('http://localhost', {
          method: 'POST',
          headers: {
            'Stripe-Signature': signature,
            'Content-Type': 'application/json'
          },
          body: typeof payload === 'string' ? payload : JSON.stringify(payload)
        });

        const result = await verifyStripeWebhook(mockRequest, 'TEST_SECRET');
        isValid = result.isValid;
        error = result.error;
      } else {
        // For generic webhooks
        const result = verifyHmacSignature(
          typeof payload === 'string' ? payload : JSON.stringify(payload),
          signature,
          secret,
          'sha256='
        );
        isValid = result.isValid;
        error = result.error;
      }
    } catch (validationError) {
      error = validationError instanceof Error ? validationError.message : 'Validation error';
    }

    return NextResponse.json(ok({
      isValid,
      error,
      provider,
      signature: signature.substring(0, 20) + '...' // Truncate for security
    }));

  } catch (error) {
    console.error('Signature validation error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'SIGNATURE_VALIDATION_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Emit test webhook event
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { eventType, data, metadata } = body;

    if (!eventType || !data) {
      return NextResponse.json(
        fail('Missing required fields: eventType, data'),
        { status: 400 }
      );
    }

    const emitter = getWebhookEmitter();
    const result = await emitter.emit({
      type: eventType,
      data,
      metadata
    });

    return NextResponse.json(ok({
      success: result.success,
      eventType,
      deliveries: result.deliveries,
      totalDuration: result.totalDuration,
      summary: {
        totalEndpoints: result.deliveries.length,
        successfulDeliveries: result.deliveries.filter(d => d.success).length,
        failedDeliveries: result.deliveries.filter(d => !d.success).length
      }
    }));

  } catch (error) {
    console.error('Test webhook emission error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_EMISSION_ERROR'
      ),
      { status: 500 }
    );
  }
}
