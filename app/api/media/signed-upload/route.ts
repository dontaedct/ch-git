import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { mediaPathSchema } from "@/lib/validation";

async function POSTHandler(req: Request) {
  const { user, supabase } = await requireUser();

  const { searchParams } = new URL(req.url);
  const path = mediaPathSchema.parse(searchParams.get("path"));

  // validate ownership via client id inside path
  const parts = path.split("/");
  const client_id = parts[1]; // client/<client_id>/...
  const { data: okClient, error: cErr } = await supabase.from("clients").select("id").eq("id", client_id).eq("coach_id", user.id).single();
      if (cErr || !okClient) return asResponse(fail("forbidden", "FORBIDDEN"), 403);

  const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
      if (error) return asResponse(fail(error.message, "STORAGE_ERROR"), 500);

  return NextResponse.json(ok({ url: data.signedUrl, token: data.token }));
}

export const POST = withSentry(POSTHandler);
