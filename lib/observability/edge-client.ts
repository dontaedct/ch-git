/**
 * Edge Runtime Compatible Observability Client
 * 
 * Lightweight observability client that works in Edge Runtime environments
 * without Node.js specific dependencies like OpenTelemetry.
 */

export interface EdgeRequestTracker {
  addMetadata(metadata: Record<string, string | number | boolean | null | undefined>): void;
  setUser(userId: string): void;
  setStatus(status: number): void;
  recordMetric(name: string, value: number, labels?: Record<string, string>): void;
  finish(status: number, metadata?: Record<string, unknown>): void;
  end(): void;
}

class EdgeRequestTrackerImpl implements EdgeRequestTracker {
  private startTime: number;
  private metadata: Record<string, string | number | boolean | null | undefined> = {};
  private status: number | null = null;
  private userId: string | null = null;
  
  constructor(
    private method: string,
    private pathname: string
  ) {
    this.startTime = Date.now();
  }

  addMetadata(metadata: Record<string, string | number | boolean | null | undefined>): void {
    Object.assign(this.metadata, metadata);
  }

  setUser(userId: string): void {
    this.userId = userId;
  }

  setStatus(status: number): void {
    this.status = status;
  }

  recordMetric(name: string, value: number, labels?: Record<string, string>): void {
    // In Edge Runtime, we'll just log metrics for now
    // In production, this could send to external metrics service
    if (process.env.NODE_ENV === 'development') {
      console.log('EdgeMetric:', { name, value, labels });
    }
  }

  finish(status: number, metadata?: Record<string, unknown>): void {
    this.setStatus(status);
    if (metadata) {
      // Convert metadata to acceptable format
      const convertedMetadata: Record<string, string | number | boolean | null | undefined> = {};
      for (const [key, value] of Object.entries(metadata)) {
        if (value === null || value === undefined) {
          convertedMetadata[key] = value;
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          convertedMetadata[key] = value;
        } else {
          convertedMetadata[key] = String(value);
        }
      }
      this.addMetadata(convertedMetadata);
    }
    this.end();
  }

  end(): void {
    const duration = Date.now() - this.startTime;
    
    // Log request completion
    if (process.env.NODE_ENV === 'development') {
      console.log('EdgeRequest completed:', {
        method: this.method,
        pathname: this.pathname,
        duration,
        status: this.status,
        userId: this.userId,
        metadata: this.metadata
      });
    }
  }
}

/**
 * Edge Runtime Observability Client
 */
export class EdgeObservability {
  /**
   * Track a request in Edge Runtime
   */
  static trackRequest(method: string, pathname: string): EdgeRequestTracker {
    return new EdgeRequestTrackerImpl(method, pathname);
  }

  /**
   * Record a business metric in Edge Runtime
   */
  static recordBusinessMetric(
    name: string, 
    value: number, 
    labels?: Record<string, string>
  ): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('EdgeBusinessMetric:', { name, value, labels });
    }
    // In production, send to external service
  }

  /**
   * Log a security event in Edge Runtime
   */
  static logSecurityEvent(
    event: string,
    level: 'info' | 'warn' | 'error' = 'info',
    details?: Record<string, unknown>
  ): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('EdgeSecurityEvent:', { event, level, details });
    }
    // In production, send to security monitoring service
  }

  /**
   * Check if we're running in Edge Runtime
   */
  static isEdgeRuntime(): boolean {
    return typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'undefined' || process.env.NEXT_RUNTIME === 'edge';
  }
}

/**
 * Universal observability interface that works in both Node.js and Edge Runtime
 */
export const UniversalObservability = {
  trackRequest(method: string, pathname: string): EdgeRequestTracker {
    return EdgeObservability.trackRequest(method, pathname);
  },

  recordBusinessMetric(
    name: string, 
    value: number, 
    labels?: Record<string, string>
  ): void {
    EdgeObservability.recordBusinessMetric(name, value, labels);
  },

  logSecurityEvent(
    event: string,
    level: 'info' | 'warn' | 'error' = 'info',
    details?: Record<string, unknown>
  ): void {
    EdgeObservability.logSecurityEvent(event, level, details);
  }
};