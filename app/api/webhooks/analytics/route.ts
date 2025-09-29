/**
 * Webhook Analytics & Monitoring API
 * 
 * Provides comprehensive analytics and monitoring for webhook delivery,
 * performance metrics, and error tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ok, fail } from '@/lib/errors';

export const runtime = 'nodejs';

interface WebhookAnalyticsQuery {
  /** Start date for analytics (ISO string) */
  startDate?: string;
  /** End date for analytics (ISO string) */
  endDate?: string;
  /** Event type filter */
  eventType?: string;
  /** Endpoint filter */
  endpoint?: string;
  /** Status filter (success, failure, pending) */
  status?: 'success' | 'failure' | 'pending';
  /** Group by field (hour, day, week, month) */
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  /** Limit for results */
  limit?: number;
}

interface WebhookMetrics {
  /** Total webhook deliveries */
  totalDeliveries: number;
  /** Successful deliveries */
  successfulDeliveries: number;
  /** Failed deliveries */
  failedDeliveries: number;
  /** Success rate percentage */
  successRate: number;
  /** Average response time (ms) */
  averageResponseTime: number;
  /** P95 response time (ms) */
  p95ResponseTime: number;
  /** P99 response time (ms) */
  p99ResponseTime: number;
  /** Total retry attempts */
  totalRetries: number;
  /** Average retries per delivery */
  averageRetries: number;
}

interface WebhookEventStats {
  /** Event type */
  eventType: string;
  /** Total deliveries for this event */
  totalDeliveries: number;
  /** Success rate for this event */
  successRate: number;
  /** Average response time for this event */
  averageResponseTime: number;
  /** Most common error for this event */
  mostCommonError?: string;
}

interface WebhookEndpointStats {
  /** Endpoint name */
  endpoint: string;
  /** Total deliveries to this endpoint */
  totalDeliveries: number;
  /** Success rate for this endpoint */
  successRate: number;
  /** Average response time for this endpoint */
  averageResponseTime: number;
  /** Most common error for this endpoint */
  mostCommonError?: string;
  /** Last successful delivery */
  lastSuccess?: string;
  /** Last failed delivery */
  lastFailure?: string;
}

/**
 * Get webhook analytics and metrics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query: WebhookAnalyticsQuery = {
      startDate: searchParams.get('startDate') ?? undefined,
      endDate: searchParams.get('endDate') ?? undefined,
      eventType: searchParams.get('eventType') ?? undefined,
      endpoint: searchParams.get('endpoint') ?? undefined,
      status: searchParams.get('status') as any ?? undefined,
      groupBy: searchParams.get('groupBy') as any ?? 'day',
      limit: parseInt(searchParams.get('limit') ?? '100', 10)
    };

    const supabase = createServiceRoleClient();

    // Build date filter
    const dateFilter: any = {};
    if (query.startDate) {
      dateFilter.gte = query.startDate;
    }
    if (query.endDate) {
      dateFilter.lte = query.endDate;
    }

    // Get overall metrics
    const metrics = await getWebhookMetrics(supabase, query);
    
    // Get event statistics
    const eventStats = await getEventStatistics(supabase, query);
    
    // Get endpoint statistics
    const endpointStats = await getEndpointStatistics(supabase, query);
    
    // Get time series data
    const timeSeries = await getTimeSeriesData(supabase, query);
    
    // Get recent deliveries
    const recentDeliveries = await getRecentDeliveries(supabase, query);
    
    // Get error analysis
    const errorAnalysis = await getErrorAnalysis(supabase, query);

    return NextResponse.json(ok({
      metrics,
      eventStats,
      endpointStats,
      timeSeries,
      recentDeliveries,
      errorAnalysis,
      query,
      generatedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Webhook analytics error:', error);
    return NextResponse.json(
      fail(
        error instanceof Error ? error.message : 'Unknown error',
        'WEBHOOK_ANALYTICS_ERROR'
      ),
      { status: 500 }
    );
  }
}

/**
 * Get overall webhook metrics
 */
async function getWebhookMetrics(supabase: any, query: WebhookAnalyticsQuery): Promise<WebhookMetrics> {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('success, response_time, retry_count')
    .gte('created_at', query.startDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', query.endDate ?? new Date().toISOString());

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  const totalDeliveries = data.length;
  const successfulDeliveries = data.filter(d => d.success).length;
  const failedDeliveries = totalDeliveries - successfulDeliveries;
  const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
  
  const responseTimes = data.map(d => d.response_time).filter(Boolean);
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
}

/**
 * Get event statistics
 */
async function getEventStatistics(supabase: any, query: WebhookAnalyticsQuery): Promise<WebhookEventStats[]> {
  let queryBuilder = supabase
    .from('webhook_deliveries')
    .select('event_type, success, response_time, error_message')
    .gte('created_at', query.startDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', query.endDate ?? new Date().toISOString());

  if (query.eventType) {
    queryBuilder = queryBuilder.eq('event_type', query.eventType);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // Group by event type
  const eventGroups = data.reduce((groups: any, delivery: any) => {
    const eventType = delivery.event_type;
    if (!groups[eventType]) {
      groups[eventType] = [];
    }
    groups[eventType].push(delivery);
    return groups;
  }, {});

  return Object.entries(eventGroups).map(([eventType, deliveries]: [string, any]) => {
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter((d: any) => d.success).length;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
    
    const responseTimes = deliveries.map((d: any) => d.response_time).filter(Boolean);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
      : 0;

    // Find most common error
    const errors = deliveries
      .filter((d: any) => !d.success && d.error_message)
      .map((d: any) => d.error_message);
    const errorCounts = errors.reduce((counts: any, error: string) => {
      counts[error] = (counts[error] || 0) + 1;
      return counts;
    }, {});
    const mostCommonError = Object.entries(errorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

    return {
      eventType,
      totalDeliveries,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      mostCommonError
    };
  });
}

/**
 * Get endpoint statistics
 */
async function getEndpointStatistics(supabase: any, query: WebhookAnalyticsQuery): Promise<WebhookEndpointStats[]> {
  let queryBuilder = supabase
    .from('webhook_deliveries')
    .select('endpoint, success, response_time, error_message, created_at')
    .gte('created_at', query.startDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', query.endDate ?? new Date().toISOString());

  if (query.endpoint) {
    queryBuilder = queryBuilder.eq('endpoint', query.endpoint);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  // Group by endpoint
  const endpointGroups = data.reduce((groups: any, delivery: any) => {
    const endpoint = delivery.endpoint;
    if (!groups[endpoint]) {
      groups[endpoint] = [];
    }
    groups[endpoint].push(delivery);
    return groups;
  }, {});

  return Object.entries(endpointGroups).map(([endpoint, deliveries]: [string, any]) => {
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter((d: any) => d.success).length;
    const successRate = totalDeliveries > 0 ? (successfulDeliveries / totalDeliveries) * 100 : 0;
    
    const responseTimes = deliveries.map((d: any) => d.response_time).filter(Boolean);
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((a: number, b: number) => a + b, 0) / responseTimes.length 
      : 0;

    // Find most common error
    const errors = deliveries
      .filter((d: any) => !d.success && d.error_message)
      .map((d: any) => d.error_message);
    const errorCounts = errors.reduce((counts: any, error: string) => {
      counts[error] = (counts[error] || 0) + 1;
      return counts;
    }, {});
    const mostCommonError = Object.entries(errorCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0];

    // Find last success and failure
    const successfulDeliveries_sorted = deliveries
      .filter((d: any) => d.success)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const failedDeliveries_sorted = deliveries
      .filter((d: any) => !d.success)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
      endpoint,
      totalDeliveries,
      successRate: Math.round(successRate * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime),
      mostCommonError,
      lastSuccess: successfulDeliveries_sorted[0]?.created_at,
      lastFailure: failedDeliveries_sorted[0]?.created_at
    };
  });
}

/**
 * Get time series data
 */
async function getTimeSeriesData(supabase: any, query: WebhookAnalyticsQuery) {
  // This would require more complex SQL queries for time series aggregation
  // For now, return a placeholder structure
  return {
    message: 'Time series data requires additional database schema setup',
    suggestion: 'Consider adding webhook_delivery_hourly_stats table for efficient time series queries'
  };
}

/**
 * Get recent deliveries
 */
async function getRecentDeliveries(supabase: any, query: WebhookAnalyticsQuery) {
  let queryBuilder = supabase
    .from('webhook_deliveries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(query.limit ?? 50);

  if (query.startDate) {
    queryBuilder = queryBuilder.gte('created_at', query.startDate);
  }
  if (query.endDate) {
    queryBuilder = queryBuilder.lte('created_at', query.endDate);
  }
  if (query.eventType) {
    queryBuilder = queryBuilder.eq('event_type', query.eventType);
  }
  if (query.endpoint) {
    queryBuilder = queryBuilder.eq('endpoint', query.endpoint);
  }
  if (query.status) {
    queryBuilder = queryBuilder.eq('success', query.status === 'success');
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
}

/**
 * Get error analysis
 */
async function getErrorAnalysis(supabase: any, query: WebhookAnalyticsQuery) {
  const { data, error } = await supabase
    .from('webhook_deliveries')
    .select('error_message, error_code, endpoint, event_type, created_at')
    .eq('success', false)
    .not('error_message', 'is', null)
    .gte('created_at', query.startDate ?? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .lte('created_at', query.endDate ?? new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(100);

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
}
