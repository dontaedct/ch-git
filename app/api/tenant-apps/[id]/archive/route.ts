/**
 * @fileoverview Archive/Restore Tenant App API
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';

// Validation schemas
const appIdSchema = z.string().min(1);
const archiveActionSchema = z.object({
  action: z.enum(['archive', 'restore']),
});


// POST /api/tenant-apps/[id]/archive - Archive or restore tenant app
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const validatedId = appIdSchema.parse(params.id);
    const body = await request.json();
    const { action } = archiveActionSchema.parse(body);

    const supabase = await createServerSupabase();
    const now = new Date().toISOString();

    // Update the app based on action
    const updates = action === 'archive'
      ? { archived: true, archived_at: now }
      : { archived: false, archived_at: null };

    const { data: updatedApp, error } = await supabase
      .from('tenant_apps')
      .update(updates)
      .eq('id', validatedId)
      .select()
      .single();

    if (error) {
      console.error(`Database error in POST /api/tenant-apps/[id]/archive:`, error);
      return NextResponse.json(
        { error: `Failed to ${action} tenant app` },
        { status: 500 }
      );
    }

    if (!updatedApp) {
      return NextResponse.json(
        { error: 'Tenant app not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `App ${action}d successfully`,
      app: updatedApp
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error(`Unexpected error in POST /api/tenant-apps/[id]/archive:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
