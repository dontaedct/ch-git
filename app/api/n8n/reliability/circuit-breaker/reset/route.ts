/**
 * n8n Circuit Breaker Reset API
 * 
 * Allows manual reset of circuit breakers for specific tenants.
 * This is useful for recovery scenarios and testing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { n8nReliability } from '@/lib/n8n/reliability';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, reason } = body;
    
    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }
    
    // Reset circuit breaker in memory
    const circuitBreaker = n8nReliability.getCircuitBreaker(tenant_id);
    circuitBreaker.reset();
    
    // Reset circuit breaker in database
    const supabase = createServiceRoleClient();
    const { error: dbError } = await supabase
      .rpc('reset_circuit_breaker', { tenant_id_param: tenant_id });
    
    if (dbError) {
      console.error('Failed to reset circuit breaker in database:', dbError);
      // Don't fail the request - in-memory reset is sufficient
    }
    
    console.info(`Circuit breaker reset for tenant ${tenant_id}, reason: ${reason ?? 'manual'}`);
    
    const response = {
      success: true,
      tenant_id,
      reason: reason ?? 'manual',
      reset_at: new Date().toISOString(),
      message: `Circuit breaker reset for tenant ${tenant_id}`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to reset circuit breaker:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset circuit breaker',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
