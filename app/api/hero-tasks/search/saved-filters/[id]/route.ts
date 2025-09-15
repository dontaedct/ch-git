/**
 * Hero Tasks - Individual Saved Filter Management
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoints for managing individual saved filters (get, update, delete, usage tracking).
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// ============================================================================
// GET INDIVIDUAL SAVED FILTER
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('GET', `/api/hero-tasks/search/saved-filters/${params.id}`);
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: savedFilter, error } = await supabase
      .from('hero_saved_filters')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Filter not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch saved filter: ${error.message}`);
    }

    routeLogger.info("Saved filter fetched", { 
      filterId: savedFilter.id,
      filterName: savedFilter.name,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: savedFilter,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Get saved filter error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch filter",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATE INDIVIDUAL SAVED FILTER
// ============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('PUT', `/api/hero-tasks/search/saved-filters/${params.id}`);
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Verify the filter belongs to the user
    const { data: existingFilter, error: checkError } = await supabase
      .from('hero_saved_filters')
      .select('id, user_id')
      .eq('id', params.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Filter not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to verify filter: ${checkError.message}`);
    }

    if (existingFilter.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { data: updatedFilter, error: updateError } = await supabase
      .from('hero_saved_filters')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update saved filter: ${updateError.message}`);
    }

    routeLogger.info("Saved filter updated", { 
      filterId: updatedFilter.id,
      filterName: updatedFilter.name,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: updatedFilter,
      message: "Filter updated successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Update saved filter error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update filter",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE INDIVIDUAL SAVED FILTER
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('DELETE', `/api/hero-tasks/search/saved-filters/${params.id}`);
  
  try {
    const supabase = await createRealSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      routeLogger.warn("Unauthorized access attempt", { error: authError?.message });
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify the filter belongs to the user
    const { data: existingFilter, error: checkError } = await supabase
      .from('hero_saved_filters')
      .select('id, user_id, name')
      .eq('id', params.id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: "Filter not found" },
          { status: 404 }
        );
      }
      throw new Error(`Failed to verify filter: ${checkError.message}`);
    }

    if (existingFilter.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from('hero_saved_filters')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw new Error(`Failed to delete saved filter: ${deleteError.message}`);
    }

    routeLogger.info("Saved filter deleted", { 
      filterId: params.id,
      filterName: existingFilter.name,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: { id: params.id },
      message: "Filter deleted successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Delete saved filter error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to delete filter",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
