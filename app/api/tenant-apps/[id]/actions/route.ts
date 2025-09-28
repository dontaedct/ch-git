/**
 * @fileoverview Tenant App Actions API - Duplicate, toggle status, and other actions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Validation schemas
const appIdSchema = z.string().min(1);

const duplicateAppSchema = z.object({
  action: z.literal('duplicate'),
  new_name: z.string().min(1).max(100),
  new_admin_email: z.string().email()
});

const toggleStatusSchema = z.object({
  action: z.literal('toggle-status'),
  status: z.enum(['sandbox', 'production', 'disabled'])
});

const actionSchema = z.discriminatedUnion('action', [
  duplicateAppSchema,
  toggleStatusSchema
]);

// POST /api/tenant-apps/[id]/actions - Perform actions on tenant app
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const validatedId = appIdSchema.parse(params.id);
    const body = await request.json();
    const validatedAction = actionSchema.parse(body);

    let result;

    switch (validatedAction.action) {
      case 'duplicate':
        // Find source app from database
        const { data: sourceApp, error: fetchError } = await supabase
          .from('tenant_apps')
          .select('*')
          .eq('id', validatedId)
          .single();

        if (fetchError || !sourceApp) {
          return NextResponse.json(
            { error: 'Source app not found' },
            { status: 404 }
          );
        }

        // Generate slug for new app
        const slug = validatedAction.new_name
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50);

        // Create duplicated app in database
        const { data: duplicatedApp, error: insertError } = await supabase
          .from('tenant_apps')
          .insert({
            name: validatedAction.new_name,
            slug: slug,
            admin_email: validatedAction.new_admin_email,
            template_id: sourceApp.template_id,
            status: 'sandbox',
            admin_url: `/agency-toolkit`,
            public_url: `/${slug}`,
            submissions_count: 0,
            documents_count: 0
          })
          .select()
          .single();

        if (insertError) {
          return NextResponse.json(
            { error: 'Failed to duplicate app: ' + insertError.message },
            { status: 500 }
          );
        }

        result = { app: duplicatedApp };
        break;

      case 'toggle-status':
        // Update app status in database
        const { data: updatedApp, error: updateError } = await supabase
          .from('tenant_apps')
          .update({
            status: validatedAction.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', validatedId)
          .select()
          .single();

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update app status: ' + updateError.message },
            { status: 500 }
          );
        }

        if (!updatedApp) {
          return NextResponse.json(
            { error: 'App not found' },
            { status: 404 }
          );
        }

        result = { app: updatedApp };
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error in POST /api/tenant-apps/[id]/actions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}