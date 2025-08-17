
import { NextRequest, NextResponse } from "next/server";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { createRouteLogger } from "@/lib/logger";
import { createRealSupabaseClient } from "@/lib/supabase/server";

export const revalidate = 0;

async function GETHandler(_req: NextRequest) {
  const startTime = Date.now();
  const logger = createRouteLogger('GET', '/api/db-check');
  
  try {
    const supabase = await createRealSupabaseClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from("coaches")
      .select("id")
      .limit(1);

    if (error) return asResponse(fail(error.message, "DATABASE_ERROR"), 500);
    return NextResponse.json(ok({ rowsFound: data?.length ?? 0 }));
  } catch (error) {
    if (error instanceof Error) {
      const response = asResponse(fail(error.message, "DATABASE_ERROR"), 500);
      logger.log(500, startTime);
      return response;
    }
    const response = asResponse(fail("Internal server error", "INTERNAL_ERROR"), 500);
    logger.log(500, startTime);
    return response;
  }
}

export const GET = withSentry(GETHandler);