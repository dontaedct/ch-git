import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guard";
import { hasRole } from "@/lib/auth/roles";
import { ok, fail } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";

export const runtime = 'nodejs';
export const revalidate = 60;

async function GETHandler(): Promise<NextResponse> {
  try {
    const { user } = await requireUser();

    if (!hasRole(user, 'admin')) {
      return NextResponse.json(fail("Forbidden", "FORBIDDEN"), { status: 403 });
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("coaches")
      .select("id")
      .limit(1);

    if (error) return NextResponse.json(fail(error.message, "DATABASE_ERROR"), { status: 500 });
    return NextResponse.json(ok({ rowsFound: data?.length ?? 0 }));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(fail(error.message, "VALIDATION_ERROR"), { status: 400 });
    }
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

export const GET = withSentry(GETHandler);