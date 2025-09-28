/**
 * Webhook Emitter Service
 * 
 * Provides reliable webhook delivery with exponential backoff,
 * HMAC signing, and comprehensive error handling
 */

import { 
  getEventConfig, 
  getEventEndpoints,
  type WebhookEndpointConfig 
} from '@/lib/config/webhooks';
import { generateHmacSignature } from './hmac-signer';
import { withBackoff } from '@/lib/n8n/reliability-client';
import { logWebhookDelivery, type WebhookDelivery } from './delivery-tracker';

export interface WebhookEvent {
  /** Event type/name */
  type: string;
  /** Event payload data */
  data: Record<string, unknown>;
  /** Event metadata */
  metadata?: {
    /** Event timestamp (ISO string) */
    timestamp?: string;
    /** Session ID */
    sessionId?: string;
    /** User ID */
    userId?: string;
    /** Source component/page */
    source?: string;
    /** Additional static fields */
    [key: string]: unknown;
  };
}

export interface WebhookDeliveryResult {
  /** Endpoint name */
  endpoint: string;
  /** Whether delivery was successful */
  success: boolean;
  /** HTTP status code */
  statusCode?: number;
  /** Response body */
  response?: string;
  /** Error message if failed */
  error?: string;
  /** Number of retry attempts made */
  attempts: number;
  /** Total time taken for delivery (ms) */
  duration: number;
}

export interface WebhookEmissionResult {
  /** Event that was emitted */
  event: WebhookEvent;
  /** Results for each endpoint */
  deliveries: WebhookDeliveryResult[];
  /** Overall success (all deliveries successful) */
  success: boolean;
  /** Total time taken for all deliveries (ms) */
  totalDuration: number;
}

/**
 * Webhook Emitter Class
 */
export class WebhookEmitter {
  private sessionId: string;
  private userId?: string;

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Emit webhook event to configured endpoints
   */
  async emit(event: WebhookEvent): Promise<WebhookEmissionResult> {
    const startTime = Date.now();
    const eventConfig = getEventConfig(event.type);
    
    if (!eventConfig?.enabled) {
      console.warn(`Event ${event.type} is not configured or disabled`);
      return {
        event,
        deliveries: [],
        success: true, // Consider disabled events as "successful" non-ops
        totalDuration: 0
      };
    }

    const endpoints = getEventEndpoints(event.type);
    if (endpoints.length === 0) {
      console.warn(`No endpoints configured for event ${event.type}`);
      return {
        event,
        deliveries: [],
        success: true,
        totalDuration: 0
      };
    }

    // Prepare event payload with metadata
    const eventPayload = this.prepareEventPayload(event, eventConfig.payload);
    
    // Deliver to all configured endpoints in parallel
    const deliveryPromises = endpoints.map((endpoint, index) => 
      this.deliverToEndpoint(eventPayload, endpoint, `endpoint_${index}`)
    );

    const deliveries = await Promise.all(deliveryPromises);
    const totalDuration = Date.now() - startTime;
    const success = deliveries.every(delivery => delivery.success);

    // Log results
    if (success) {
      console.info(`Successfully emitted ${event.type} to ${deliveries.length} endpoints in ${totalDuration}ms`);
    } else {
      console.error(`Failed to emit ${event.type} to some endpoints. Success: ${deliveries.filter(d => d.success).length}/${deliveries.length}`);
    }

    return {
      event,
      deliveries,
      success,
      totalDuration
    };
  }

  /**
   * Prepare event payload with metadata
   */
  private prepareEventPayload(
    event: WebhookEvent,
    payloadConfig: { 
      includeTimestamp: boolean;
      includeSessionId: boolean;
      includeUserId: boolean;
      staticFields?: Record<string, string>;
    }
  ): Record<string, unknown> {
    const payload: Record<string, unknown> = {
      type: event.type,
      data: event.data
    };

    // Add metadata if configured
    if (event.metadata) {
      payload.metadata = { ...event.metadata };
    } else {
      payload.metadata = {};
    }

    // Add timestamp
    if (payloadConfig.includeTimestamp) {
      (payload.metadata as Record<string, unknown>).timestamp = new Date().toISOString();
    }

    // Add session ID
    if (payloadConfig.includeSessionId) {
      (payload.metadata as Record<string, unknown>).sessionId = this.sessionId;
    }

    // Add user ID
    if (payloadConfig.includeUserId && this.userId) {
      (payload.metadata as Record<string, unknown>).userId = this.userId;
    }

    // Add static fields
    if (payloadConfig.staticFields) {
      Object.assign(payload.metadata as Record<string, unknown>, payloadConfig.staticFields);
    }

    return payload;
  }

  /**
   * Deliver payload to a single endpoint with retry logic
   */
  private async deliverToEndpoint(
    payload: Record<string, unknown>,
    endpointConfig: WebhookEndpointConfig,
    endpointName: string
  ): Promise<WebhookDeliveryResult> {
    const startTime = Date.now();
    let attempts = 0;
    const maxRetries = endpointConfig.maxRetries ?? 3;

    const operation = async (): Promise<WebhookDeliveryResult> => {
      attempts++;
      
      try {
        // Convert payload to JSON
        const jsonPayload = JSON.stringify(payload);
        
        // Generate HMAC signature
        const signedPayload = generateHmacSignature(jsonPayload, endpointConfig.secret, {
          algorithm: 'sha256',
          prefix: endpointConfig.signaturePrefix ?? 'sha256='
        });

        // Prepare request headers
        const headers: Record<string, string> = {
          ...signedPayload.headers,
          'Content-Type': 'application/json',
          'User-Agent': 'OSS-Hero-Webhooks/1.0'
        };

        // Add custom signature header if specified
        if (endpointConfig.signatureHeader) {
          headers[endpointConfig.signatureHeader] = signedPayload.signature;
        }

        // Make the webhook request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, endpointConfig.timeoutMs ?? 10000);

        const response = await fetch(endpointConfig.url, {
          method: 'POST',
          headers,
          body: jsonPayload,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Check if response was successful
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Get response body (might be useful for debugging)
        const responseText = await response.text();

        const deliveryResult = {
          endpoint: endpointName,
          success: true,
          statusCode: response.status,
          response: responseText,
          attempts,
          duration: Date.now() - startTime
        };

        // Log successful delivery
        await logWebhookDelivery({
          eventId: `${eventPayload.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          eventType: eventPayload.type,
          endpoint: endpointConfig.url,
          success: true,
          statusCode: response.status,
          responseTime: deliveryResult.duration,
          retryCount: attempts - 1,
          responseHeaders: Object.fromEntries(response.headers.entries()),
          responseBody: responseText
        });

        return deliveryResult;

      } catch (error: unknown) {
        // If this is the last attempt, return failure
        if (attempts >= maxRetries) {
          const failureResult = {
            endpoint: endpointName,
            success: false,
            error: (error as Error).message ?? 'Unknown error',
            attempts,
            duration: Date.now() - startTime
          };

          // Log failed delivery
          await logWebhookDelivery({
            eventId: `${eventPayload.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            eventType: eventPayload.type,
            endpoint: endpointConfig.url,
            success: false,
            responseTime: failureResult.duration,
            retryCount: attempts - 1,
            errorMessage: failureResult.error,
            errorCode: 'DELIVERY_FAILED'
          });

          return failureResult;
        }
        
        // Otherwise, throw to trigger retry
        throw error;
      }
    };

    // Use exponential backoff for retries
    try {
      return await withBackoff(operation, {
        baseDelayMs: endpointConfig.baseDelayMs ?? 1000,
        maxDelayMs: endpointConfig.maxDelayMs ?? 30000,
        maxRetries: maxRetries - 1, // withBackoff counts retries, not total attempts
        jitterFactor: 0.1
      });
    } catch (error: unknown) {
      const finalFailureResult = {
        endpoint: endpointName,
        success: false,
        error: (error as Error).message ?? 'Unknown error',
        attempts,
        duration: Date.now() - startTime
      };

      // Log final failure
      await logWebhookDelivery({
        eventId: `${eventPayload.type}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        eventType: eventPayload.type,
        endpoint: endpointConfig.url,
        success: false,
        responseTime: finalFailureResult.duration,
        retryCount: attempts - 1,
        errorMessage: finalFailureResult.error,
        errorCode: 'FINAL_DELIVERY_FAILED'
      });

      return finalFailureResult;
    }
  }
}

/**
 * Global webhook emitter instance
 */
let globalEmitter: WebhookEmitter | null = null;

/**
 * Get or create global webhook emitter
 */
export function getWebhookEmitter(userId?: string): WebhookEmitter {
  globalEmitter ??= new WebhookEmitter(userId);
  return globalEmitter;
}

/**
 * Convenience function to emit webhook events
 */
export async function emitWebhookEvent(
  eventType: string,
  data: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<WebhookEmissionResult> {
  const emitter = getWebhookEmitter();
  return emitter.emit({
    type: eventType,
    data,
    metadata
  });
}

/**
 * Convenience functions for specific events
 */
export async function emitLeadStartedQuestionnaire(data: {
  questionnaireId: string;
  source: string;
  userId?: string;
}): Promise<WebhookEmissionResult> {
  return emitWebhookEvent('lead_started_questionnaire', data, {
    source: data.source
  });
}

export async function emitLeadCompletedQuestionnaire(data: {
  questionnaireId: string;
  answers: Record<string, unknown>;
  source: string;
  userId?: string;
}): Promise<WebhookEmissionResult> {
  return emitWebhookEvent('lead_completed_questionnaire', data, {
    source: data.source
  });
}

export async function emitConsultationGenerated(data: {
  consultationId: string;
  planIds: string[];
  source: string;
  userId?: string;
}): Promise<WebhookEmissionResult> {
  return emitWebhookEvent('consultation_generated', data, {
    source: data.source
  });
}

export async function emitPdfDownloaded(data: {
  consultationId: string;
  filename: string;
  fileSize: number;
  source: string;
  userId?: string;
}): Promise<WebhookEmissionResult> {
  return emitWebhookEvent('pdf_downloaded', data, {
    source: data.source
  });
}

export async function emitEmailCopyRequested(data: {
  consultationId: string;
  email: string;
  source: string;
  userId?: string;
}): Promise<WebhookEmissionResult> {
  return emitWebhookEvent('email_copy_requested', data, {
    source: data.source
  });
}