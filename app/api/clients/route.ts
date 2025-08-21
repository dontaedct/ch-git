import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { paginationSchema } from "@/lib/validation";
import { applyPagination } from "@/lib/utils";
import { Client } from "@/lib/supabase/types";
import { createRouteLogger } from "@/lib/logger";

export const runtime = 'nodejs';
export const revalidate = 60;

async function GETHandler(req: NextRequest): Promise<NextResponse> {
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
    const baseQuery = (await supabase)
      .from("clients")
      .select("*")
      .eq("coach_id", user.id)
      .order("first_name", { ascending: true });

    // Apply pagination
    const { data, total } = await applyPagination<Client>(
      baseQuery,
      validatedPage,
      validatedPageSize
    );

    const response = NextResponse.json(ok({
      data,
      page: validatedPage,
      pageSize: validatedPageSize,
      total,
    }));
    
    logger.log(200, startTime);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      const response = NextResponse.json(fail(error.message, "VALIDATION_ERROR"), { status: 400 });
      logger.log(400, startTime);
      return response;
    }
    const response = NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
    logger.log(500, startTime);
    return response;
  }
}

export const GET = withSentry(GETHandler);
