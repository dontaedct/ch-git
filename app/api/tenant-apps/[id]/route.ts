/**
 * @fileoverview Individual Tenant App API - Get, update, delete specific tenant apps
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

// Validation schemas
const appIdSchema = z.string().min(1);



// GET /api/tenant-apps/[id] - Get specific tenant app
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedId = appIdSchema.parse(params.id);
    
    const supabase = await createServerSupabase();
    
    const { data: app, error } = await supabase
      .from('tenant_apps')
      .select('*')
      .eq('id', validatedId)
      .single();
    
    if (error) {
      console.error('Database error in GET /api/tenant-apps/[id]:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenant app' },
        { status: 500 }
      );
    }
    
    if (!app) {
      return NextResponse.json(
        { error: 'Tenant app not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ app });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid app ID' },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error in GET /api/tenant-apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tenant-apps/[id] - Delete tenant app
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedId = appIdSchema.parse(params.id);
    
    const supabase = await createServerSupabase();
    
    const { error } = await supabase
      .from('tenant_apps')
      .delete()
      .eq('id', validatedId);
    
    if (error) {
      console.error('Database error in DELETE /api/tenant-apps/[id]:', error);
      return NextResponse.json(
        { error: 'Failed to delete tenant app' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid app ID' },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error in DELETE /api/tenant-apps/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}