/**
 * Webhook Delivery Tracking Service
 * 
 * Tracks webhook delivery attempts, successes, failures, and performance metrics
 * for comprehensive analytics and monitoring.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

export interface WebhookDelivery {
  /** Unique delivery ID */
  id?: string;
  /** Event ID for idempotency */
  eventId: string;
  /** Event type */
  eventType: string;
  /** Target endpoint */
  endpoint: string;
  /** Whether delivery was successful */
  success: boolean;
  /** HTTP status code received */
  statusCode?: number;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Number of retry attempts */
  retryCount?: number;
  /** Error message if failed */
  errorMessage?: string;
  /** Error code if failed */
  errorCode?: string;
  /** Request headers sent */
  requestHeaders?: Record<string, string>;
  /** Response headers received */
  responseHeaders?: Record<string, string>;
  /** Request body sent */
  requestBody?: string;
  /** Response body received */
  responseBody?: string;
  /** Timestamp of delivery attempt */
  createdAt?: Date;
}

export interface DeliveryMetrics {
  /** Total deliveries */
  totalDeliveries: number;
  /** Successful deliveries */
  successfulDeliveries: number;
  /** Failed deliveries */
  failedDeliveries: number;
  /** Success rate percentage */
  successRate: number;
  /** Average response time */
  averageResponseTime: number;
  /** P95 response time */
  p95ResponseTime: number;
  /** P99 response time */
  p99ResponseTime: number;
  /** Total retry attempts */
  totalRetries: number;
  /** Average retries per delivery */
  averageRetries: number;
}

/**
 * Webhook Delivery Tracker Class
 */
export class WebhookDeliveryTracker {
  private supabase = createServiceRoleClient();

  /**
   * Log a webhook delivery attempt
   */
  async logDelivery(delivery: WebhookDelivery): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .from('webhook_deliveries')
        .insert({
          event_id: delivery.eventId,
          event_type: delivery.eventType,
          endpoint: delivery.endpoint,
          success: delivery.success,
          status_code: delivery.statusCode,
          response_time: delivery.responseTime,
          retry_count: delivery.retryCount ?? 0,
          error_message: delivery.errorMessage,
          error_code: delivery.errorCode,
          request_headers: delivery.requestHeaders,
          response_headers: delivery.responseHeaders,
          request_body: delivery.requestBody,
          response_body: delivery.responseBody,
          created_at: delivery.createdAt?.toISOString() ?? new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log webhook delivery:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Webhook delivery logging error:', error);
      // Don't throw - we don't want logging failures to break webhook processing
      return '';
    }
  }

  /**
   * Get delivery metrics for a time period
   */
  async getMetrics(
    startDate?: Date,
    endDate?: Date,
    eventType?: string,
    endpoint?: string
  ): Promise<DeliveryMetrics> {
    try {
      let query = this.supabase
        .from('webhook_deliveries')
        .select('success, response_time, retry_count');

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }
      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      if (endpoint) {
        query = query.eq('endpoint', endpoint);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const totalDeliveries = data.length;
      const successfulDeliveries = data.filter(d => d.success).length;
      const failedDeliveries = totalDeliveries - successfulDeliveries;
      const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;

      const responseTimes = data.map(d => d.response_time).filter(Boolean) as number[];
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
        : 0;

      const sortedResponseTimes = responseTimes.sort((a, b) => a - b);
      const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
      const p99Index = Math.floor(sortedResponseTimes.length * 0.99);
      const p95ResponseTime = sortedResponseTimes[p95Index] ?? 0;
      const p99ResponseTime = sortedResponseTimes[p99Index] ?? 0;

      const totalRetries = data.reduce((sum, d) => sum + (d.retry_count ?? 0), 0);
      const averageRetries = totalDeliveries > 0 ? totalRetries / totalDeliveries : 0;

      return {
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        successRate: Math.round(successRate * 100) / 100,
        averageResponseTime: Math.round(averageResponseTime),
        p95ResponseTime: Math.round(p95ResponseTime),
        p99ResponseTime: Math.round(p99ResponseTime),
        totalRetries,
        averageRetries: Math.round(averageRetries * 100) / 100
      };
    } catch (error) {
      console.error('Failed to get delivery metrics:', error);
      return {
        totalDeliveries: 0,
        successfulDeliveries: 0,
        failedDeliveries: 0,
        successRate: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        totalRetries: 0,
        averageRetries: 0
      };
    }
  }

  /**
   * Get recent deliveries
   */
  async getRecentDeliveries(
    limit: number = 50,
    eventType?: string,
    endpoint?: string,
    success?: boolean
  ): Promise<WebhookDelivery[]> {
    try {
      let query = this.supabase
        .from('webhook_deliveries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (eventType) {
        query = query.eq('event_type', eventType);
      }
      if (endpoint) {
        query = query.eq('endpoint', endpoint);
      }
      if (success !== undefined) {
        query = query.eq('success', success);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data.map(row => ({
        id: row.id,
        eventId: row.event_id,
        eventType: row.event_type,
        endpoint: row.endpoint,
        success: row.success,
        statusCode: row.status_code,
        responseTime: row.response_time,
        retryCount: row.retry_count,
        errorMessage: row.error_message,
        errorCode: row.error_code,
        requestHeaders: row.request_headers,
        responseHeaders: row.response_headers,
        requestBody: row.request_body,
        responseBody: row.response_body,
        createdAt: new Date(row.created_at)
      }));
    } catch (error) {
      console.error('Failed to get recent deliveries:', error);
      return [];
    }
  }

  /**
   * Get error analysis
   */
  async getErrorAnalysis(
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<Array<{
    errorMessage: string;
    count: number;
    errorCode?: string;
    affectedEndpoints: string[];
    affectedEventTypes: string[];
    lastOccurrence: string;
  }>> {
    try {
      let query = this.supabase
        .from('webhook_deliveries')
        .select('error_message, error_code, endpoint, event_type, created_at')
        .eq('success', false)
        .not('error_message', 'is', null)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      // Group errors by message
      const errorGroups = data.reduce((groups: any, delivery: any) => {
        const errorMessage = delivery.error_message || 'Unknown error';
        if (!groups[errorMessage]) {
          groups[errorMessage] = {
            count: 0,
            errorCode: delivery.error_code,
            endpoints: new Set(),
            eventTypes: new Set(),
            lastOccurrence: delivery.created_at
          };
        }
        groups[errorMessage].count++;
        groups[errorMessage].endpoints.add(delivery.endpoint);
        groups[errorMessage].eventTypes.add(delivery.event_type);
        if (new Date(delivery.created_at) > new Date(groups[errorMessage].lastOccurrence)) {
          groups[errorMessage].lastOccurrence = delivery.created_at;
        }
        return groups;
      }, {});

      return Object.entries(errorGroups).map(([errorMessage, details]: [string, any]) => ({
        errorMessage,
        count: details.count,
        errorCode: details.errorCode,
        affectedEndpoints: Array.from(details.endpoints),
        affectedEventTypes: Array.from(details.eventTypes),
        lastOccurrence: details.lastOccurrence
      })).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Failed to get error analysis:', error);
      return [];
    }
  }

  /**
   * Clean up old delivery records
   */
  async cleanupOldRecords(olderThanDays: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { data, error } = await this.supabase
        .from('webhook_deliveries')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data?.length ?? 0;
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
      return 0;
    }
  }
}

/**
 * Global delivery tracker instance
 */
let globalTracker: WebhookDeliveryTracker | null = null;

/**
 * Get or create global delivery tracker
 */
export function getDeliveryTracker(): WebhookDeliveryTracker {
  globalTracker ??= new WebhookDeliveryTracker();
  return globalTracker;
}

/**
 * Convenience function to log a webhook delivery
 */
export async function logWebhookDelivery(delivery: WebhookDelivery): Promise<string> {
  const tracker = getDeliveryTracker();
  return tracker.logDelivery(delivery);
}

/**
 * Convenience function to get delivery metrics
 */
export async function getWebhookMetrics(
  startDate?: Date,
  endDate?: Date,
  eventType?: string,
  endpoint?: string
): Promise<DeliveryMetrics> {
  const tracker = getDeliveryTracker();
  return tracker.getMetrics(startDate, endDate, eventType, endpoint);
}
