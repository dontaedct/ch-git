/**
 * @fileoverview Tenant Apps API - CRUD operations for multi-tenant applications
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateTenantAppRequest, UpdateTenantAppRequest } from '@/types/tenant-apps';
import { createServerSupabase } from '@/lib/supabase/server';

// Validation schemas
const createAppSchema = z.object({
  name: z.string().min(1).max(100),
  admin_email: z.string().email(),
  template_id: z.string().min(1, 'Template selection is required')
});

const updateAppSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  admin_email: z.string().email().optional(),
  status: z.enum(['sandbox', 'production', 'disabled']).optional(),
  config: z.record(z.any()).optional(),
  theme_config: z.record(z.any()).optional()
});

// Helper function to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}


// GET /api/tenant-apps - List all tenant apps
export async function GET(request: NextRequest) {
  try {
    
    const supabase = await createServerSupabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = supabase
      .from('tenant_apps')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    const { data: apps, error } = await query;
    
    if (error) {
      console.error('Database error in GET /api/tenant-apps:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tenant apps' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ apps: apps || [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/tenant-apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tenant-apps - Create new tenant app
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createAppSchema.parse(body);
    
    const supabase = await createServerSupabase();
    
    // Generate slug from name
    const slug = generateSlug(validatedData.name);
    
    // Create new app in database
    const { data: newApp, error } = await supabase
      .from('tenant_apps')
      .insert({
        name: validatedData.name,
        slug: slug,
        admin_email: validatedData.admin_email,
        template_id: validatedData.template_id,
        status: 'sandbox',
        admin_url: `/agency-toolkit`,
        public_url: `/${slug}`,
        submissions_count: 0,
        documents_count: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Database error in POST /api/tenant-apps:', error);
      return NextResponse.json(
        { error: 'Failed to create tenant app' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ app: newApp }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error in POST /api/tenant-apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tenant-apps - Update tenant app
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const body = await request.json();
    const validatedData = updateAppSchema.parse(body);
    
    // Update app in database
    const { data: updatedApp, error } = await supabase
      .from('tenant_apps')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.id)
      .select()
      .single();
    
    if (error) {
      console.error('Database error in PUT /api/tenant-apps:', error);
      return NextResponse.json(
        { error: 'Failed to update tenant app' },
        { status: 500 }
      );
    }
    
    if (!updatedApp) {
      return NextResponse.json(
        { error: 'Tenant app not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ app: updatedApp });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error in PUT /api/tenant-apps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}