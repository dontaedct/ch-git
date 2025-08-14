import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { paginationSchema } from "@/lib/validation";

import { createRouteLogger } from "@/lib/logger";

export const revalidate = 60;

async function GETHandler(req: NextRequest) {
  const startTime = Date.now();
  const logger = createRouteLogger('GET', '/api/clients');
  
  try {
    const { user, supabase } = await requireUser();

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
      .from("clients")
      .select("*")
      .eq("coach_id", user.id)
      .order("first_name", { ascending: true });

    // Get total count first
    const { count: totalCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", user.id);

    // Apply pagination
    const offset = (validatedPage - 1) * validatedPageSize;
    const { data, error } = await baseQuery
      .select("*")
      .range(offset, offset + validatedPageSize - 1);

    if (error) throw error;

    const response = NextResponse.json(ok({
      data: data ?? [],
      page: validatedPage,
      pageSize: validatedPageSize,
      total: totalCount ?? 0,
    }));
    
    logger.log(200, startTime);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      const response = asResponse(fail(error.message, "VALIDATION_ERROR"), 400);
      logger.log(400, startTime);
      return response;
    }
    const response = asResponse(fail("Internal server error", "INTERNAL_ERROR"), 500);
    logger.log(500, startTime);
    return response;
  }
}

export const GET = withSentry(GETHandler);

