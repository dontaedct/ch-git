
import { NextRequest, NextResponse } from "next/server";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { paginationSchema } from "@/lib/validation";
import { createRealSupabaseClient } from "@/lib/supabase/server";

// Prevent prerendering - this route must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function GETHandler(req: NextRequest) {
  try {
    const supabase = await createRealSupabaseClient();
    
    // Get user from Supabase directly
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return asResponse(fail("unauthorized", "UNAUTHORIZED"), 401);
    }

    // Parse and validate pagination parameters
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");

    const { page: validatedPage, pageSize: validatedPageSize } = paginationSchema.parse({
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    });

    // Build the base query
    const baseQuery = supabase
      .from("sessions")
      .select("*")
      .eq("coach_id", user.id)
      .order("starts_at", { ascending: false });

    // Get total count first
    const { count: totalCount } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", user.id);

    // Apply pagination
    const offset = (validatedPage - 1) * validatedPageSize;
    const { data, error } = await baseQuery
      .select("*")
      .range(offset, offset + validatedPageSize - 1);

    if (error) throw error;

    return NextResponse.json(ok({
      data: data ?? [],
      page: validatedPage,
      pageSize: validatedPageSize,
      total: totalCount ?? 0,
    }));
  } catch (error) {
    if (error instanceof Error) {
      return asResponse(fail(error.message, "VALIDATION_ERROR"), 400);
    }
    return asResponse(fail("Internal server error", "INTERNAL_ERROR"), 500);
  }
}

export const GET = withSentry(GETHandler);
