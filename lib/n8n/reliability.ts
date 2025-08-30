/**
 * n8n Reliability Controls
 * 
 * Provides comprehensive reliability controls for n8n workflows including:
 * - Exponential backoff with jitter
 * - Per-tenant circuit breakers
 * - Dead letter queue (DLQ) with TTL
 * - Parametrized concurrency limits
 * - Stripe replay protection
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

// Types and Interfaces
export interface BackoffConfig {
  baseDelayMs: number;
  maxDelayMs: number;
  maxRetries: number;
  jitterFactor: number;
}

export interface CircuitBreakerConfig {
  threshold: number; // Number of failures to trigger breaker
  windowMs: number; // Time window for failure counting
  recoveryMs: number; // Time to wait before retry
}

export interface ConcurrencyConfig {
  maxConcurrent: number;
  tenantSpecific?: Record<string, number>;
}

export interface DLQConfig {
  ttlHours: number;
  cleanupIntervalMs: number;
}

export interface TenantConfig {
  tenantId: string;
  concurrencyLimit: number;
  circuitBreakerThreshold: number;
  retryPolicy: BackoffConfig;
}

// Circuit Breaker States
export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal operation
  OPEN = 'OPEN',         // Failing, blocking requests
  HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

// Circuit Breaker Entry
interface CircuitBreakerEntry {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  lastSuccessTime: number;
}

// In-memory circuit breaker store (resets on server restart)
const circuitBreakerStore = new Map<string, CircuitBreakerEntry>();

// Default configurations
export const DEFAULT_CONFIGS = {
  BACKOFF: {
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    maxRetries: 3,
    jitterFactor: 0.1
  } as BackoffConfig,
  
  CIRCUIT_BREAKER: {
    threshold: 10,
    windowMs: 600000, // 10 minutes
    recoveryMs: 300000 // 5 minutes
  } as CircuitBreakerConfig,
  
  CONCURRENCY: {
    maxConcurrent: 5,
    tenantSpecific: {}
  } as ConcurrencyConfig,
  
  DLQ: {
    ttlHours: 24,
    cleanupIntervalMs: 3600000 // 1 hour
  } as DLQConfig
};

/**
 * Calculate exponential backoff delay with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  config: BackoffConfig = DEFAULT_CONFIGS.BACKOFF
): number {
  const baseDelay = config.baseDelayMs;
  const maxDelay = config.maxDelayMs;
  const jitterFactor = config.jitterFactor;
  
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  
  // Add jitter: random factor between 0 and jitterFactor
  const jitter = Math.random() * jitterFactor * baseDelay;
  
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute operation with exponential backoff retry
 */
export async function withBackoff<T>(
  operation: () => Promise<T>,
  config: BackoffConfig = DEFAULT_CONFIGS.BACKOFF,
  tenantId?: string
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay with jitter
      const delay = calculateBackoffDelay(attempt, config);
      
      console.warn(
        `n8n operation failed for tenant ${tenantId ?? 'unknown'}, ` +
        `attempt ${attempt + 1}/${config.maxRetries + 1}, ` +
        `retrying in ${delay}ms: ${lastError.message}`
      );
      
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

/**
 * Circuit Breaker Implementation
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private tenantId: string;
  
  constructor(tenantId: string, config: CircuitBreakerConfig = DEFAULT_CONFIGS.CIRCUIT_BREAKER) {
    this.tenantId = tenantId;
    this.config = config;
  }
  
  private getKey(): string {
    return `circuit_breaker:${this.tenantId}`;
  }
  
  private getEntry(): CircuitBreakerEntry {
    const key = this.getKey();
    const entry = circuitBreakerStore.get(key);
    
    if (!entry) {
      const newEntry: CircuitBreakerEntry = {
        state: CircuitState.CLOSED,
        failures: 0,
        lastFailureTime: 0,
        lastSuccessTime: Date.now()
      };
      circuitBreakerStore.set(key, newEntry);
      return newEntry;
    }
    
    return entry;
  }
  
  private updateEntry(updates: Partial<CircuitBreakerEntry>): void {
    const key = this.getKey();
    const entry = this.getEntry();
    const updatedEntry = { ...entry, ...updates };
    circuitBreakerStore.set(key, updatedEntry);
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    const entry = this.getEntry();
    const now = Date.now();
    
    // Check if circuit breaker should transition from OPEN to HALF_OPEN
    if (entry.state === CircuitState.OPEN) {
      if (now - entry.lastFailureTime > this.config.recoveryMs) {
        this.updateEntry({ state: CircuitState.HALF_OPEN });
        console.info(`Circuit breaker for tenant ${this.tenantId} transitioning to HALF_OPEN`);
      } else {
        throw new Error(`Circuit breaker is OPEN for tenant ${this.tenantId}`);
      }
    }
    
    // Reset failure count if window has expired
    if (now - entry.lastFailureTime > this.config.windowMs) {
      this.updateEntry({ failures: 0 });
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess(): void {
    this.updateEntry({
      state: CircuitState.CLOSED,
      failures: 0,
      lastSuccessTime: Date.now()
    });
  }
  
  private onFailure(): void {
    const entry = this.getEntry();
    const now = Date.now();
    const newFailures = entry.failures + 1;
    
    this.updateEntry({
      failures: newFailures,
      lastFailureTime: now
    });
    
    // Open circuit breaker if threshold exceeded
    if (newFailures >= this.config.threshold) {
      this.updateEntry({ state: CircuitState.OPEN });
      console.error(
        `Circuit breaker OPENED for tenant ${this.tenantId} ` +
        `after ${newFailures} failures in ${this.config.windowMs}ms window`
      );
    }
  }
  
  getState(): CircuitState {
    return this.getEntry().state;
  }
  
  getStats(): {
    state: CircuitState;
    failures: number;
    lastFailureTime: number;
    lastSuccessTime: number;
  } {
    const entry = this.getEntry();
    return {
      state: entry.state,
      failures: entry.failures,
      lastFailureTime: entry.lastFailureTime,
      lastSuccessTime: entry.lastSuccessTime
    };
  }
  
  reset(): void {
    this.updateEntry({
      state: CircuitState.CLOSED,
      failures: 0,
      lastFailureTime: 0,
      lastSuccessTime: Date.now()
    });
    console.info(`Circuit breaker reset for tenant ${this.tenantId}`);
  }
}

/**
 * Dead Letter Queue (DLQ) Operations
 */
export class DeadLetterQueue {
  private config: DLQConfig;
  
  constructor(config: DLQConfig = DEFAULT_CONFIGS.DLQ) {
    this.config = config;
  }
  
  async addMessage(
    tenantId: string,
    workflowName: string,
    payload: Record<string, unknown>,
    errorMessage: string,
    errorCode?: string
  ): Promise<string> {
    const supabase = createServiceRoleClient();
    const expiresAt = new Date(Date.now() + this.config.ttlHours * 60 * 60 * 1000);
    
    const { data, error } = await supabase
      .from('n8n_dlq')
      .insert({
        tenant_id: tenantId,
        workflow_name: workflowName,
        payload,
        error_message: errorMessage,
        error_code: errorCode,
        retry_count: 0,
        expires_at: expiresAt.toISOString()
      })
      .select('id')
      .single();
    
    if (error) {
      throw new Error(`Failed to add message to DLQ: ${error.message}`);
    }
    
    console.warn(
      `Message added to DLQ for tenant ${tenantId}, workflow ${workflowName}: ${errorMessage}`
    );
    
    return data.id;
  }
  
  async getMessages(tenantId?: string, limit: number = 100): Promise<Array<{
    id: string;
    tenant_id: string;
    workflow_name: string;
    payload: Record<string, unknown>;
    error_message: string;
    error_code?: string;
    retry_count: number;
    created_at: string;
    expires_at: string;
  }>> {
    const supabase = createServiceRoleClient();
    
    let query = supabase
      .from('n8n_dlq')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get DLQ messages: ${error.message}`);
    }
    
    return data || [];
  }
  
  async retryMessage(messageId: string): Promise<boolean> {
    const supabase = createServiceRoleClient();
    
    // Get the message
    const { data: message, error: fetchError } = await supabase
      .from('n8n_dlq')
      .select('*')
      .eq('id', messageId)
      .single();
    
    if (fetchError || !message) {
      throw new Error(`Message not found: ${messageId}`);
    }
    
    // Increment retry count
    const { error: updateError } = await supabase
      .from('n8n_dlq')
      .update({ retry_count: message.retry_count + 1 })
      .eq('id', messageId);
    
    if (updateError) {
      throw new Error(`Failed to update retry count: ${updateError.message}`);
    }
    
    console.info(`Retrying DLQ message ${messageId} for tenant ${message.tenant_id}`);
    
    // Here you would typically trigger the workflow again
    // This is a placeholder for the actual retry logic
    return true;
  }
  
  async deleteMessage(messageId: string): Promise<boolean> {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('n8n_dlq')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      throw new Error(`Failed to delete DLQ message: ${error.message}`);
    }
    
    return true;
  }
  
  async cleanupExpired(): Promise<number> {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('n8n_dlq')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');
    
    if (error) {
      throw new Error(`Failed to cleanup expired DLQ messages: ${error.message}`);
    }
    
    const deletedCount = data?.length || 0;
    if (deletedCount > 0) {
      console.info(`Cleaned up ${deletedCount} expired DLQ messages`);
    }
    
    return deletedCount;
  }
}

/**
 * Concurrency Limiter
 */
export class ConcurrencyLimiter {
  private config: ConcurrencyConfig;
  private activeExecutions = new Map<string, number>();
  
  constructor(config: ConcurrencyConfig = DEFAULT_CONFIGS.CONCURRENCY) {
    this.config = config;
  }
  
  private getLimit(tenantId: string): number {
    return this.config.tenantSpecific?.[tenantId] ?? this.config.maxConcurrent;
  }
  
  async acquire(tenantId: string): Promise<() => void> {
    const limit = this.getLimit(tenantId);
    const current = this.activeExecutions.get(tenantId) ?? 0;
    
    if (current >= limit) {
      throw new Error(
        `Concurrency limit exceeded for tenant ${tenantId}: ${current}/${limit}`
      );
    }
    
    this.activeExecutions.set(tenantId, current + 1);
    
    // Return release function
    return () => {
      const newCount = (this.activeExecutions.get(tenantId) ?? 1) - 1;
      if (newCount <= 0) {
        this.activeExecutions.delete(tenantId);
      } else {
        this.activeExecutions.set(tenantId, newCount);
      }
    };
  }
  
  getStats(): Record<string, { active: number; limit: number }> {
    const stats: Record<string, { active: number; limit: number }> = {};
    
    for (const [tenantId, active] of this.activeExecutions.entries()) {
      stats[tenantId] = {
        active,
        limit: this.getLimit(tenantId)
      };
    }
    
    return stats;
  }
}

/**
 * Stripe Replay Protection
 */
export class StripeReplayProtection {
  async getLastProcessedEvent(tenantId: string): Promise<string | null> {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
      .from('stripe_event_ledger')
      .select('last_processed_event_id')
      .eq('tenant_id', tenantId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to get last processed event: ${error.message}`);
    }
    
    return data?.last_processed_event_id ?? null;
  }
  
  async updateLastProcessedEvent(tenantId: string, eventId: string): Promise<void> {
    const supabase = createServiceRoleClient();
    
    const { error } = await supabase
      .from('stripe_event_ledger')
      .upsert({
        tenant_id: tenantId,
        last_processed_event_id: eventId,
        last_processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (error) {
      throw new Error(`Failed to update last processed event: ${error.message}`);
    }
  }
  
  async isEventProcessed(tenantId: string, eventId: string): Promise<boolean> {
    const lastProcessed = await this.getLastProcessedEvent(tenantId);
    return lastProcessed === eventId;
  }
}

/**
 * Main Reliability Controller
 */
export class N8nReliabilityController {
  private circuitBreakers = new Map<string, CircuitBreaker>();
  private dlq: DeadLetterQueue;
  private concurrencyLimiter: ConcurrencyLimiter;
  private stripeReplayProtection: StripeReplayProtection;
  
  constructor() {
    this.dlq = new DeadLetterQueue();
    this.concurrencyLimiter = new ConcurrencyLimiter();
    this.stripeReplayProtection = new StripeReplayProtection();
  }
  
  getCircuitBreaker(tenantId: string): CircuitBreaker {
    if (!this.circuitBreakers.has(tenantId)) {
      this.circuitBreakers.set(tenantId, new CircuitBreaker(tenantId));
    }
    return this.circuitBreakers.get(tenantId)!;
  }
  
  async executeWithReliability<T>(
    tenantId: string,
    workflowName: string,
    operation: () => Promise<T>,
    options: {
      skipOnNoChanges?: boolean;
      checkStripeReplay?: boolean;
      stripeEventId?: string;
    } = {}
  ): Promise<T> {
    // Check Stripe replay protection if enabled
    if (options.checkStripeReplay && options.stripeEventId) {
      const isProcessed = await this.stripeReplayProtection.isEventProcessed(
        tenantId,
        options.stripeEventId
      );
      
      if (isProcessed) {
        console.info(
          `Skipping Stripe event ${options.stripeEventId} for tenant ${tenantId} - already processed`
        );
        throw new Error('Event already processed');
      }
    }
    
    // Acquire concurrency slot
    const release = await this.concurrencyLimiter.acquire(tenantId);
    
    try {
      // Get circuit breaker for tenant
      const circuitBreaker = this.getCircuitBreaker(tenantId);
      
      // Execute with circuit breaker protection
      const result = await circuitBreaker.execute(async () => {
        // Execute with backoff retry
        return await withBackoff(operation, DEFAULT_CONFIGS.BACKOFF, tenantId);
      });
      
      // Update Stripe event ledger if applicable
      if (options.checkStripeReplay && options.stripeEventId) {
        await this.stripeReplayProtection.updateLastProcessedEvent(
          tenantId,
          options.stripeEventId
        );
      }
      
      return result;
    } catch (error) {
      // Add to DLQ on failure
      await this.dlq.addMessage(
        tenantId,
        workflowName,
        { error: (error as Error).message },
        (error as Error).message,
        'EXECUTION_FAILED'
      );
      
      throw error;
    } finally {
      // Always release concurrency slot
      release();
    }
  }
  
  getStats(): {
    circuitBreakers: Record<string, unknown>;
    concurrency: Record<string, unknown>;
    dlq: { total: number };
  } {
    const circuitBreakerStats: Record<string, unknown> = {};
    for (const [tenantId, cb] of this.circuitBreakers.entries()) {
      circuitBreakerStats[tenantId] = cb.getStats();
    }
    
    return {
      circuitBreakers: circuitBreakerStats,
      concurrency: this.concurrencyLimiter.getStats(),
      dlq: { total: 0 } // Would need to implement count query
    };
  }
}

// Global instance
export const n8nReliability = new N8nReliabilityController();
