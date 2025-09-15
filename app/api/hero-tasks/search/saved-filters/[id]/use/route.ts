/**
 * Hero Tasks - Saved Filter Usage Tracking
 * Created: 2025-09-08T16:07:10.000Z
 * Version: 1.0.0
 * 
 * API endpoint for tracking usage of saved filters to provide analytics and suggestions.
 */

import { NextRequest, NextResponse } from "next/server";
import { createRealSupabaseClient } from "@/lib/supabase/server";
import { createRouteLogger } from "@/lib/logger";

// Force Node.js runtime for database operations
export const runtime = "nodejs";

// Prevent prerendering - this route must be dynamic
export const revalidate = 0;

// ============================================================================
// TRACK FILTER USAGE
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const routeLogger = createRouteLogger('POST', `/api/hero-tasks/search/saved-filters/${params.id}/use`);
  
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
      .select('id, user_id, name, usage_count')
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

    // Update usage count and last used timestamp
    const { data: updatedFilter, error: updateError } = await supabase
      .from('hero_saved_filters')
      .update({
        usage_count: (existingFilter.usage_count || 0) + 1,
        last_used: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update filter usage: ${updateError.message}`);
    }

    routeLogger.info("Filter usage tracked", { 
      filterId: updatedFilter.id,
      filterName: updatedFilter.name,
      newUsageCount: updatedFilter.usage_count,
      duration: Date.now() - startTime
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedFilter.id,
        usage_count: updatedFilter.usage_count,
        last_used: updatedFilter.last_used
      },
      message: "Usage tracked successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    routeLogger.error("Track filter usage error", { 
      error: errorMessage,
      duration: Date.now() - startTime
    });

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to track usage",
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
