import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { signedUploadSchema } from "@/lib/validation";
import { withSentry } from "@/lib/sentry-wrapper";

export const runtime = 'nodejs';

async function POSTHandler(req: Request): Promise<NextResponse> {
  try {
    const { user, supabase } = await requireUser();

    const body = await req.json();
    const { client_id, original } = signedUploadSchema.parse(body);

    // ensure client belongs to coach
    const { data: okClient, error: cErr } = await supabase.from("clients").select("id").eq("id", client_id).eq("coach_id", user.id).single();
    if (cErr || !okClient) return NextResponse.json(fail("forbidden", "FORBIDDEN"), { status: 403 });

    // const ext = original.includes(".") ? original.split(".").pop() : "bin";
    const path = `client/${client_id}/${randomUUID()}-${original.replaceAll(" ", "_")}`;

    const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(path);
    if (error) return NextResponse.json(fail(error.message, "STORAGE_ERROR"), { status: 500 });

    return NextResponse.json(ok({ path, token: data.token }));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(fail(error.message, "VALIDATION_ERROR"), { status: 400 });
    }
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

export const POST = withSentry(POSTHandler);
