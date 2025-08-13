import { NextResponse } from "next/server";
import { mediaPathSchema } from "@/lib/validation";
import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";

export const revalidate = 60;

async function GETHandler(req: Request) {
  const user = await requireUser();
  const supabase = await createServerClient();

  const { searchParams } = new URL(req.url);
  const path = mediaPathSchema.parse(searchParams.get("path"));

  // validate ownership via client id inside path
  const parts = path.split("/");
  const client_id = parts[1]; // client/<client_id>/...
  const { data: okClient, error: cErr } = await supabase.from("clients").select("id").eq("id", client_id).eq("coach_id", user.id).single();
  if (cErr || !okClient) return fail("forbidden", "FORBIDDEN", 403);

  const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 60); // 60s
  if (error) return fail(error.message, "STORAGE_ERROR", 500);

  return NextResponse.json(ok({ url: data.signedUrl }));
}

export const GET = withSentry(GETHandler);
