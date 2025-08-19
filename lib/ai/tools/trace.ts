/**
 * Trace Tools - Universal Header Compliant
 * 
 * Structured trace() wrapper -> existing logger/Sentry if present.
 */

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentId?: string;
  operation: string;
  metadata?: Record<string, any>;
}

export interface TraceEvent {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: TraceContext;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface AITraceMetadata {
  task?: string;
  provider?: string;
  model?: string;
  tokens_in?: number;
  tokens_out?: number;
  latency_ms?: number;
  aiEnabled?: boolean; // Add AI flag status
  transition?: 'enabled' | 'disabled'; // Add transition tracking
  reason?: string; // Add reason for transitions
}

export class Tracer {
  private enabled: boolean;
  private logger?: any;
  
  constructor(enabled: boolean = true) {
    this.enabled = enabled;
    // Try to find existing logger
    try {
      // This would integrate with existing logging infrastructure
      this.logger = console;
    } catch {
      this.logger = console;
    }
  }
  
  trace(operation: string, metadata?: Record<string, any>): TraceContext {
    const context: TraceContext = {
      traceId: this.generateId(),
      spanId: this.generateId(),
      operation,
      metadata
    };
    
    if (this.enabled && this.logger) {
      this.logger.log(`[TRACE] ${operation}`, context);
    }
    
    return context;
  }
  
  // AI-specific trace with enriched metadata
  traceAI(operation: string, metadata?: AITraceMetadata): TraceContext {
    // Add AI flag status to all AI traces
    const enhancedMetadata = {
      ...metadata,
      aiEnabled: process.env.AI_ENABLED === 'true'
    };
    return this.trace(operation, enhancedMetadata);
  }

  // New method for tracking AI flag transitions
  traceAIFlagTransition(transition: 'enabled' | 'disabled', reason?: string): TraceContext {
    return this.traceAI('ai_flag_transition', {
      transition,
      reason: reason || 'manual_change'
    });
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
  
  logEvent(event: Omit<TraceEvent, 'timestamp'>): void {
    if (!this.enabled) return;
    
    const traceEvent: TraceEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };
    
    if (this.logger) {
      this.logger.log(`[${event.level.toUpperCase()}] ${event.message}`, traceEvent);
    }
  }
}

// Export singleton instance
export const tracer = new Tracer();
export const trace = (op: string, meta?: Record<string, any>) => tracer.trace(op, meta);
export const traceAI = (op: string, meta?: AITraceMetadata) => tracer.traceAI(op, meta);

// Export the new transition tracking function
export const traceAIFlagTransition = (transition: 'enabled' | 'disabled', reason?: string) => 
  tracer.traceAIFlagTransition(transition, reason);
