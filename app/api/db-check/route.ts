import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guard";
import { hasRole } from "@/lib/auth/roles";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";

export const revalidate = 60;

async function GETHandler() {
  const { user } = await requireUser();

  if (!hasRole(user, 'admin')) {
    return asResponse(fail("Forbidden", "FORBIDDEN"), 403);
  }

  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("coaches")
    .select("id")
    .limit(1);

      if (error) return asResponse(fail(error.message, "DATABASE_ERROR"), 500);
  return NextResponse.json(ok({ rowsFound: data?.length ?? 0 }));
}

export const GET = withSentry(GETHandler);