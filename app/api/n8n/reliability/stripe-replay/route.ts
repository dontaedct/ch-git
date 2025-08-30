/**
 * n8n Stripe Replay Protection API
 * 
 * Provides endpoints for managing Stripe event replay protection:
 * - GET: Check if event was processed
 * - POST: Update last processed event
 * - DELETE: Clear event ledger for tenant
 */

import { NextRequest, NextResponse } from 'next/server';
import { StripeReplayProtection } from '@/lib/n8n/reliability';
import { createServiceRoleClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const stripeReplayProtection = new StripeReplayProtection();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenant_id');
    const eventId = url.searchParams.get('event_id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }
    
    if (eventId) {
      // Check if specific event was processed
      const isProcessed = await stripeReplayProtection.isEventProcessed(tenantId, eventId);
      
      const response = {
        tenant_id: tenantId,
        event_id: eventId,
        is_processed: isProcessed,
        checked_at: new Date().toISOString()
      };
      
      return NextResponse.json(response);
      
    } else {
      // Get last processed event for tenant
      const lastProcessedEvent = await stripeReplayProtection.getLastProcessedEvent(tenantId);
      
      const response = {
        tenant_id: tenantId,
        last_processed_event_id: lastProcessedEvent,
        retrieved_at: new Date().toISOString()
      };
      
      return NextResponse.json(response);
    }
    
  } catch (error) {
    console.error('Failed to check Stripe replay protection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check Stripe replay protection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant_id, event_id } = body;
    
    if (!tenant_id || !event_id) {
      return NextResponse.json(
        { error: 'tenant_id and event_id are required' },
        { status: 400 }
      );
    }
    
    // Update last processed event
    await stripeReplayProtection.updateLastProcessedEvent(tenant_id, event_id);
    
    const response = {
      success: true,
      tenant_id,
      event_id,
      updated_at: new Date().toISOString(),
      message: `Last processed event updated for tenant ${tenant_id}`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to update Stripe replay protection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update Stripe replay protection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const tenantId = url.searchParams.get('tenant_id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }
    
    // Clear event ledger for tenant
    const supabase = createServiceRoleClient();
    const { error } = await supabase
      .from('stripe_event_ledger')
      .delete()
      .eq('tenant_id', tenantId);
    
    if (error) {
      throw new Error(`Failed to clear event ledger: ${error.message}`);
    }
    
    const response = {
      success: true,
      tenant_id: tenantId,
      cleared_at: new Date().toISOString(),
      message: `Event ledger cleared for tenant ${tenantId}`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Failed to clear Stripe replay protection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to clear Stripe replay protection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
