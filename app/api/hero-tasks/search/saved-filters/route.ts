/**
 * Hero Tasks - Saved Filters API
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoints for managing saved search filters in the Hero Tasks system.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";
import { z } from "zod";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const savedFilterSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  filters: z.record(z.any()),
  is_favorite: z.boolean().default(false)
});

const updateSavedFilterSchema = savedFilterSchema.partial().extend({
  id: z.string().uuid()
});

// ============================================================================
// GET SAVED FILTERS
// ============================================================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('GET', '/api/hero-tasks/search/saved-filters');
  
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

    const { data: savedFilters, error } = await supabase
      .from('hero_saved_filters')
      .select('*')
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch saved filters: ${error.message}`);
    }

    routeLogger.info("Saved filters fetched", { 
      count: savedFilters?.length || 0,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: savedFilters || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Get saved filters error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch saved filters",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// CREATE SAVED FILTER
// ============================================================================

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', '/api/hero-tasks/search/saved-filters');
  
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
    const validatedData = savedFilterSchema.parse(body);

    // Check if filter name already exists for this user
    const { data: existingFilter, error: checkError } = await supabase
      .from('hero_saved_filters')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', validatedData.name)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check existing filter: ${checkError.message}`);
    }

    if (existingFilter) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Filter name already exists",
          message: "A filter with this name already exists. Please choose a different name."
        },
        { status: 409 }
      );
    }

    const filterData = {
      ...validatedData,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usage_count: 0
    };

    const { data: savedFilter, error: insertError } = await supabase
      .from('hero_saved_filters')
      .insert(filterData)
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create saved filter: ${insertError.message}`);
    }

    routeLogger.info("Saved filter created", { 
      filterId: savedFilter.id,
      filterName: savedFilter.name,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: savedFilter,
      message: "Filter saved successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Create saved filter error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to save filter",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// UPDATE SAVED FILTER
// ============================================================================

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('PUT', '/api/hero-tasks/search/saved-filters');
  
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
    const validatedData = updateSavedFilterSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify the filter belongs to the user
    const { data: existingFilter, error: checkError } = await supabase
      .from('hero_saved_filters')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (checkError) {
      throw new Error(`Filter not found: ${checkError.message}`);
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
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
// DELETE SAVED FILTER
// ============================================================================

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('DELETE', '/api/hero-tasks/search/saved-filters');
  
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

    const { searchParams } = new URL(request.url);
    const filterId = searchParams.get('id');
    
    if (!filterId) {
      return NextResponse.json(
        { success: false, error: "Filter ID required" },
        { status: 400 }
      );
    }

    // Verify the filter belongs to the user
    const { data: existingFilter, error: checkError } = await supabase
      .from('hero_saved_filters')
      .select('id, user_id, name')
      .eq('id', filterId)
      .single();

    if (checkError) {
      throw new Error(`Filter not found: ${checkError.message}`);
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
      .eq('id', filterId);

    if (deleteError) {
      throw new Error(`Failed to delete saved filter: ${deleteError.message}`);
    }

    routeLogger.info("Saved filter deleted", { 
      filterId,
      filterName: existingFilter.name,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: { id: filterId },
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
