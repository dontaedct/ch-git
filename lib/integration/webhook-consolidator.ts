import { WebhookDelivery, logWebhookDelivery } from '@/lib/webhooks/delivery-tracker';
import { WebhookEmitter, WebhookEmissionResult, emitWebhookEvent } from '@/lib/webhooks/emitter';

export interface ConsolidatedWebhookMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgResponseTime: number;
  totalDeliveries: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  avgDeliveryTime: number;
  requestsByType: Record<string, number>;
  deliveriesByEndpoint: Record<string, {
    total: number;
    successful: number;
    failed: number;
    avgTime: number;
  }>;
  lastUpdated: Date;
}

export interface WebhookRequestMetric {
  eventId: string;
  eventType: string;
  path: string;
  method: string;
  handlerType: string;
  success: boolean;
  responseTime: number;
  timestamp: Date;
  sourceIp?: string;
  userAgent?: string;
  error?: string;
}

export interface WebhookDeliveryMetric {
  eventId: string;
  eventType: string;
  endpoint: string;
  success: boolean;
  responseTime: number;
  statusCode?: number;
  retryCount: number;
  timestamp: Date;
  error?: string;
}

export class WebhookConsolidator {
  private requestMetrics: Map<string, WebhookRequestMetric> = new Map();
  private deliveryMetrics: Map<string, WebhookDeliveryMetric> = new Map();
  private consolidatedMetrics: ConsolidatedWebhookMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    avgResponseTime: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    failedDeliveries: 0,
    avgDeliveryTime: 0,
    requestsByType: {},
    deliveriesByEndpoint: {},
    lastUpdated: new Date()
  };

  private emitter: WebhookEmitter;
  private metricsRetentionMs: number;

  constructor(userId?: string, metricsRetentionMs: number = 86400000) {
    this.emitter = new WebhookEmitter(userId);
    this.metricsRetentionMs = metricsRetentionMs;
  }

  async trackWebhookRequest(metric: WebhookRequestMetric): Promise<void> {
    this.requestMetrics.set(metric.eventId, metric);

    this.consolidatedMetrics.totalRequests++;

    if (metric.success) {
      this.consolidatedMetrics.successfulRequests++;
    } else {
      this.consolidatedMetrics.failedRequests++;
    }

    this.consolidatedMetrics.avgResponseTime = this.calculateAverageResponseTime();

    this.consolidatedMetrics.requestsByType[metric.handlerType] =
      (this.consolidatedMetrics.requestsByType[metric.handlerType] || 0) + 1;

    this.consolidatedMetrics.lastUpdated = new Date();

    await this.emitConsolidatedEvent('webhook.request.tracked', {
      eventId: metric.eventId,
      eventType: metric.eventType,
      success: metric.success,
      responseTime: metric.responseTime
    });

    await this.cleanupOldMetrics();
  }

  async trackWebhookDelivery(metric: WebhookDeliveryMetric): Promise<void> {
    this.deliveryMetrics.set(metric.eventId, metric);

    this.consolidatedMetrics.totalDeliveries++;

    if (metric.success) {
      this.consolidatedMetrics.successfulDeliveries++;
    } else {
      this.consolidatedMetrics.failedDeliveries++;
    }

    this.consolidatedMetrics.avgDeliveryTime = this.calculateAverageDeliveryTime();

    if (!this.consolidatedMetrics.deliveriesByEndpoint[metric.endpoint]) {
      this.consolidatedMetrics.deliveriesByEndpoint[metric.endpoint] = {
        total: 0,
        successful: 0,
        failed: 0,
        avgTime: 0
      };
    }

    const endpointMetrics = this.consolidatedMetrics.deliveriesByEndpoint[metric.endpoint];
    endpointMetrics.total++;

    if (metric.success) {
      endpointMetrics.successful++;
    } else {
      endpointMetrics.failed++;
    }

    endpointMetrics.avgTime = this.calculateEndpointAverageTime(metric.endpoint);

    this.consolidatedMetrics.lastUpdated = new Date();

    await logWebhookDelivery({
      eventId: metric.eventId,
      eventType: metric.eventType,
      endpoint: metric.endpoint,
      success: metric.success,
      responseTime: metric.responseTime,
      statusCode: metric.statusCode,
      retryCount: metric.retryCount,
      errorMessage: metric.error,
      errorCode: metric.success ? undefined : 'DELIVERY_FAILED'
    });

    await this.emitConsolidatedEvent('webhook.delivery.tracked', {
      eventId: metric.eventId,
      endpoint: metric.endpoint,
      success: metric.success,
      responseTime: metric.responseTime
    });

    await this.cleanupOldMetrics();
  }

  async emitConsolidatedEvent(
    eventType: string,
    data: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<WebhookEmissionResult> {
    return this.emitter.emit({
      type: eventType,
      data,
      metadata
    });
  }

  async emitToExternalEndpoint(
    eventType: string,
    data: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<WebhookEmissionResult> {
    return emitWebhookEvent(eventType, data, metadata);
  }

  getConsolidatedMetrics(): ConsolidatedWebhookMetrics {
    return { ...this.consolidatedMetrics };
  }

  getRequestMetrics(limit: number = 100): WebhookRequestMetric[] {
    return Array.from(this.requestMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getDeliveryMetrics(limit: number = 100): WebhookDeliveryMetric[] {
    return Array.from(this.deliveryMetrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getRequestMetricsByType(type: string, limit: number = 50): WebhookRequestMetric[] {
    return Array.from(this.requestMetrics.values())
      .filter(metric => metric.handlerType === type)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getDeliveryMetricsByEndpoint(endpoint: string, limit: number = 50): WebhookDeliveryMetric[] {
    return Array.from(this.deliveryMetrics.values())
      .filter(metric => metric.endpoint === endpoint)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  getErrorMetrics(limit: number = 50): {
    requests: WebhookRequestMetric[];
    deliveries: WebhookDeliveryMetric[];
  } {
    const failedRequests = Array.from(this.requestMetrics.values())
      .filter(metric => !metric.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    const failedDeliveries = Array.from(this.deliveryMetrics.values())
      .filter(metric => !metric.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);

    return {
      requests: failedRequests,
      deliveries: failedDeliveries
    };
  }

  async resetMetrics(): Promise<void> {
    this.requestMetrics.clear();
    this.deliveryMetrics.clear();
    this.consolidatedMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgResponseTime: 0,
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      avgDeliveryTime: 0,
      requestsByType: {},
      deliveriesByEndpoint: {},
      lastUpdated: new Date()
    };

    await this.emitConsolidatedEvent('webhook.metrics.reset', {
      resetAt: new Date().toISOString()
    });
  }

  private calculateAverageResponseTime(): number {
    const metrics = Array.from(this.requestMetrics.values());
    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(totalTime / metrics.length);
  }

  private calculateAverageDeliveryTime(): number {
    const metrics = Array.from(this.deliveryMetrics.values());
    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(totalTime / metrics.length);
  }

  private calculateEndpointAverageTime(endpoint: string): number {
    const metrics = Array.from(this.deliveryMetrics.values())
      .filter(metric => metric.endpoint === endpoint);

    if (metrics.length === 0) return 0;

    const totalTime = metrics.reduce((sum, metric) => sum + metric.responseTime, 0);
    return Math.round(totalTime / metrics.length);
  }

  private async cleanupOldMetrics(): Promise<void> {
    const now = Date.now();
    const cutoffTime = now - this.metricsRetentionMs;

    for (const [eventId, metric] of this.requestMetrics.entries()) {
      if (metric.timestamp.getTime() < cutoffTime) {
        this.requestMetrics.delete(eventId);
      }
    }

    for (const [eventId, metric] of this.deliveryMetrics.entries()) {
      if (metric.timestamp.getTime() < cutoffTime) {
        this.deliveryMetrics.delete(eventId);
      }
    }
  }

  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    requestSuccessRate: number;
    deliverySuccessRate: number;
    avgResponseTime: number;
    avgDeliveryTime: number;
    issues: string[];
  } {
    const issues: string[] = [];

    const requestSuccessRate = this.consolidatedMetrics.totalRequests > 0
      ? (this.consolidatedMetrics.successfulRequests / this.consolidatedMetrics.totalRequests) * 100
      : 100;

    const deliverySuccessRate = this.consolidatedMetrics.totalDeliveries > 0
      ? (this.consolidatedMetrics.successfulDeliveries / this.consolidatedMetrics.totalDeliveries) * 100
      : 100;

    if (requestSuccessRate < 95) {
      issues.push(`Low request success rate: ${requestSuccessRate.toFixed(2)}%`);
    }

    if (deliverySuccessRate < 95) {
      issues.push(`Low delivery success rate: ${deliverySuccessRate.toFixed(2)}%`);
    }

    if (this.consolidatedMetrics.avgResponseTime > 1000) {
      issues.push(`High response time: ${this.consolidatedMetrics.avgResponseTime}ms`);
    }

    if (this.consolidatedMetrics.avgDeliveryTime > 5000) {
      issues.push(`High delivery time: ${this.consolidatedMetrics.avgDeliveryTime}ms`);
    }

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (issues.length > 0 && (requestSuccessRate < 99 || deliverySuccessRate < 99)) {
      status = 'degraded';
    }

    if (requestSuccessRate < 90 || deliverySuccessRate < 90) {
      status = 'unhealthy';
    }

    return {
      status,
      requestSuccessRate,
      deliverySuccessRate,
      avgResponseTime: this.consolidatedMetrics.avgResponseTime,
      avgDeliveryTime: this.consolidatedMetrics.avgDeliveryTime,
      issues
    };
  }
}

export const globalConsolidator = new WebhookConsolidator();

export async function trackWebhookRequest(metric: WebhookRequestMetric): Promise<void> {
  return globalConsolidator.trackWebhookRequest(metric);
}

export async function trackWebhookDelivery(metric: WebhookDeliveryMetric): Promise<void> {
  return globalConsolidator.trackWebhookDelivery(metric);
}

export function getConsolidatedMetrics(): ConsolidatedWebhookMetrics {
  return globalConsolidator.getConsolidatedMetrics();
}

export function getWebhookHealthStatus() {
  return globalConsolidator.getHealthStatus();
}