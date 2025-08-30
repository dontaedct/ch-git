/**
 * n8n Reliability Status API
 * 
 * Provides status information for n8n reliability controls including:
 * - Circuit breaker states
 * - Concurrency utilization
 * - DLQ statistics
 * - Tenant configurations
 */

import { NextRequest, NextResponse } from 'next/server';
import { n8nReliability } from '@/lib/n8n/reliability';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenant_id');
    
    // Get reliability statistics
    const stats = n8nReliability.getStats();
    
    // Get DLQ statistics from database
    const supabase = createServiceRoleClient();
    const { data: dlqStats, error: dlqError } = await supabase
      .rpc('get_n8n_dlq_stats', { tenant_filter: tenantId });
    
    if (dlqError) {
      console.error('Failed to get DLQ stats:', dlqError);
    }
    
    // Get circuit breaker statistics
    const { data: circuitBreakerStats, error: cbError } = await supabase
      .rpc('get_circuit_breaker_stats');
    
    if (cbError) {
      console.error('Failed to get circuit breaker stats:', cbError);
    }
    
    // Get concurrency statistics
    const { data: concurrencyStats, error: concError } = await supabase
      .rpc('get_concurrency_stats');
    
    if (concError) {
      console.error('Failed to get concurrency stats:', concError);
    }
    
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tenant_filter: tenantId,
      reliability: {
        circuit_breakers: stats.circuitBreakers,
        concurrency: stats.concurrency,
        dlq: {
          statistics: dlqStats ?? [],
          total_messages: dlqStats?.reduce((sum: number, stat: unknown) => sum + Number((stat as { total_messages: number }).total_messages), 0) ?? 0
        }
      },
      database_stats: {
        circuit_breakers: circuitBreakerStats ?? [],
        concurrency: concurrencyStats ?? []
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to get n8n reliability status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get reliability status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
