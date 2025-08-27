/**
 * Webhook Idempotency & Replay Defense
 * 
 * Provides idempotency tracking to prevent duplicate webhook processing.
 * Uses Supabase as the backing store with automatic cleanup.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

export interface IdempotencyConfig {
  /** Namespace for idempotency keys (e.g., 'stripe', 'github', 'generic') */
  namespace: string;
  /** TTL in seconds (default: 24 hours) */
  ttlSeconds?: number;
}

export interface IdempotencyResult {
  wasProcessed: boolean;
  eventId: string;
  processedAt?: Date;
}

/**
 * Checks if an event has already been processed
 * @param eventId - Unique event identifier
 * @param config - Idempotency configuration
 * @returns Idempotency result
 */
export async function wasProcessed(
  eventId: string,
  config: IdempotencyConfig
): Promise<IdempotencyResult> {
  try {
    const supabase = createServiceRoleClient();
    // Clean up expired entries first
    await supabase
      .from('webhook_idempotency')
      .delete()
      .lt('expires_at', new Date().toISOString());

    // Check if event exists
    const { data, error } = await supabase
      .from('webhook_idempotency')
      .select('event_id, processed_at')
      .eq('namespace', config.namespace)
      .eq('event_id', eventId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Database error: ${error.message}`);
    }

    const wasProcessed = !!data;
    return {
      wasProcessed,
      eventId,
      processedAt: data?.processed_at ? new Date(data.processed_at) : undefined
    };
  } catch (error) {
    // Log error but don't fail the request - allow processing to continue
    console.error('Idempotency check failed:', error);
    return {
      wasProcessed: false,
      eventId
    };
  }
}

/**
 * Marks an event as processed
 * @param eventId - Unique event identifier
 * @param config - Idempotency configuration
 * @returns Success status
 */
export async function markProcessed(
  eventId: string,
  config: IdempotencyConfig
): Promise<boolean> {
  try {
    const supabase = createServiceRoleClient();
    const ttl = config.ttlSeconds ?? 86400; // 24 hours default
    const expiresAt = new Date(Date.now() + ttl * 1000);

    const { error } = await supabase
      .from('webhook_idempotency')
      .insert({
        namespace: config.namespace,
        event_id: eventId,
        processed_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      // If it's a duplicate key error, that's actually fine - event was already processed
      if (error.code === '23505') { // Unique constraint violation
        return true;
      }
      throw new Error(`Database error: ${error.message}`);
    }

    return true;
  } catch (error) {
    // Log error but don't fail the request
    console.error('Failed to mark event as processed:', error);
    return false;
  }
}

/**
 * Extracts event ID from various webhook formats
 * @param request - Incoming webhook request
 * @param provider - Webhook provider (stripe, github, etc.)
 * @returns Event ID or null if not found
 */
export async function extractEventId(
  request: Request,
  provider: string
): Promise<string | null> {
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();

    switch (provider.toLowerCase()) {
      case 'stripe':
        return body.id ?? null;
      
      case 'github':
        return body.zen ? 'ping' : body.head_commit?.id ?? body.pull_request?.id ?? null;
      
      case 'generic':
        return body.event_id ?? body.id ?? body.uuid ?? null;
      
      default:
        // Try common field names
        return body.event_id ?? body.id ?? body.uuid ?? body.message_id ?? null;
    }
  } catch (error) {
    console.error('Failed to extract event ID:', error);
    return null;
  }
}

/**
 * Comprehensive idempotency check with automatic marking
 * @param request - Incoming webhook request
 * @param config - Idempotency configuration
 * @returns Idempotency result
 */
export async function checkAndMarkProcessed(
  request: Request,
  config: IdempotencyConfig
): Promise<IdempotencyResult> {
  const eventId = await extractEventId(request, config.namespace);
  
  if (!eventId) {
    // If we can't extract an event ID, allow processing but log a warning
    console.warn(`No event ID found for ${config.namespace} webhook`);
    return {
      wasProcessed: false,
      eventId: 'unknown'
    };
  }

  const result = await wasProcessed(eventId, config);
  
  if (!result.wasProcessed) {
    // Mark as processed immediately to prevent race conditions
    await markProcessed(eventId, config);
  }

  return result;
}
