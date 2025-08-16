
import { NextResponse } from "next/server";
import { mediaPathSchema } from "@/lib/validation";
import { ok, fail, asResponse } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { createRealSupabaseClient } from "@/lib/supabase/server";

// Prevent prerendering - this route must be dynamic
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function GETHandler(req: Request) {
  try {
    const supabase = await createRealSupabaseClient();
    
    // Get user from Supabase directly instead of using requireUser
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return asResponse(fail("unauthorized", "UNAUTHORIZED"), 401);
    }

    const { searchParams } = new URL(req.url);
    const path = mediaPathSchema.parse(searchParams.get("path"));

    // validate ownership via client id inside path
    const parts = path.split("/");
    const client_id = parts[1]; // client/<client_id>/...
    const { data: okClient, error: cErr } = await supabase.from("clients").select("id").eq("id", client_id).eq("coach_id", user.id).single();
    if (cErr || !okClient) return asResponse(fail("forbidden", "FORBIDDEN"), 403);

    const { data, error } = await supabase.storage.from("media").createSignedUrl(path, 60); // 60s
    if (error) return asResponse(fail(error.message, "STORAGE_ERROR"), 500);

    return NextResponse.json(ok({ url: data.signedUrl }));
  } catch (error) {
    console.error('Signed download error:', error);
    return asResponse(fail("internal_error", "INTERNAL_ERROR"), 500);
  }
}

export const GET = withSentry(GETHandler);
