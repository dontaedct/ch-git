import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { paginationSchema } from "@/lib/validation";
import { applyPagination } from "@/lib/utils";
import { Session } from "@/lib/supabase/types";

export const revalidate = 60;

async function GETHandler(req: NextRequest) {
  try {
    const user = await requireUser();
    const supabase = await createServerClient();

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

    // Apply pagination
    const { data, total } = await applyPagination<Session>(
      baseQuery,
      validatedPage,
      validatedPageSize
    );

    return NextResponse.json(ok({
      data,
      page: validatedPage,
      pageSize: validatedPageSize,
      total,
    }));
  } catch (error) {
    if (error instanceof Error) {
      return fail(error.message, "VALIDATION_ERROR", 400);
    }
    return fail("Internal server error", "INTERNAL_ERROR", 500);
  }
}

export const GET = withSentry(GETHandler);
