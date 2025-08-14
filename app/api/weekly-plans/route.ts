import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { paginationSchema } from "@/lib/validation";


export const revalidate = 60;

async function GETHandler(req: NextRequest) {
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
      .from("weekly_plans")
      .select("*")
      .eq("coach_id", user.id)
      .order("week_start_date", { ascending: false });

    // Get total count first
    const { count: totalCount } = await supabase
      .from("weekly_plans")
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
